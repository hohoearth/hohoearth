/**
 * 공가대장 작성프로그램 (출석인정학생 대장 수합 웹앱) - 서버 코드 (Google Apps Script)
 *
 * 데이터는 이 스크립트가 연결된 구글 스프레드시트에 저장됩니다.
 *   - 시트 "학생명단": 학번 | 학년 | 반 | 번호 | 이름
 *   - 시트 "공가기록": ID | 학번 | 학년 | 반 | 번호 | 이름 | 유형 | 시작일 | 종료일 | 시작교시 | 종료교시 | 내용 | 입력자 | 입력일시 | 수정일시
 *   - 시트 "설정": 학교명 / 접속코드 / 관리자코드
 */

var SHEET_STUDENTS = '학생명단';
var SHEET_RECORDS = '공가기록';
var SHEET_SETTINGS = '설정';

var STUDENT_HEADERS = ['학번', '학년', '반', '번호', '이름'];
var RECORD_HEADERS = ['ID', '학번', '학년', '반', '번호', '이름', '유형', '시작일', '종료일',
  '시작교시', '종료교시', '내용', '입력자', '입력일시', '수정일시'];

var DEFAULT_SETTINGS = [
  ['항목', '값', '설명'],
  ['학교명', 'OO고등학교', '출력물 제목에 들어갑니다.'],
  ['접속코드', '', '비워두면 링크만 있으면 누구나 사용합니다. 정하면 선생님들께 함께 알려주세요.'],
  ['관리자코드', 'admin1234', '학생 명단 업로드에 필요합니다. 꼭 바꿔주세요.'],
  ['시작 안내', '상단 메뉴 [📘 공가대장] → ① 처음 설정하기 → ② 웹앱 배포 안내 → ③ 선생님들께 보낼 링크 순서로 진행하세요.', '']
];

/* ------------------------------------------------------------------ */
/* 스프레드시트 메뉴 (관리 선생님용 간편 설정)                           */
/* ------------------------------------------------------------------ */

function onOpen() {
  SpreadsheetApp.getUi().createMenu('📘 공가대장')
    .addItem('① 처음 설정하기 (학교명·코드)', 'menuSetup')
    .addItem('② 웹앱 배포 안내', 'menuDeployGuide')
    .addItem('③ 선생님들께 보낼 링크', 'menuShareLink')
    .addSeparator()
    .addItem('다른 학교용 템플릿 만들기', 'menuMakeTemplate')
    .addToUi();
}

var DLG_STYLE = '<style>body{font-family:"Malgun Gothic",sans-serif;font-size:14px;color:#1f2328;line-height:1.6;margin:4px}' +
  'label{display:block;margin:10px 0 2px;font-weight:700}small{font-weight:400;color:#5f6873}' +
  'input,textarea{width:100%;box-sizing:border-box;border:1px solid #d9dde3;border-radius:8px;padding:8px;font:inherit}' +
  'button,.btn{display:inline-block;background:#2457c5;color:#fff;border:0;border-radius:8px;padding:9px 16px;font:inherit;font-weight:700;cursor:pointer;text-decoration:none;margin-top:12px}' +
  '.sub{background:#fff;color:#2457c5;border:1px solid #2457c5}ol{padding-left:20px}li{margin-bottom:6px}' +
  '.box{background:#f5f6f8;border-radius:8px;padding:10px 12px;margin-top:8px}.warn{background:#fff6d6}.err{color:#c62828}.ok{color:#1b7f3b}</style>';

function dialog_(html, title, w, h) {
  SpreadsheetApp.getUi().showModalDialog(
    HtmlService.createHtmlOutput(DLG_STYLE + html).setWidth(w || 480).setHeight(h || 440), title);
}

function esc_(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

/** ① 처음 설정하기: 시트를 만들고 학교명·코드를 입력받습니다. */
function menuSetup() {
  setup_();
  var s = settings_();
  dialog_(
    '<p>선생님들이 쓸 정보를 입력하세요. 나중에 이 메뉴에서 언제든 바꿀 수 있습니다.</p>' +
    '<form id="f">' +
    '<label>학교명</label><input name="school" value="' + esc_(s.school === 'OO고등학교' ? '' : s.school) + '" placeholder="예: OO고등학교" required>' +
    '<label>접속코드 <small>선생님들이 처음 접속할 때 입력 (비우면 링크만으로 접속)</small></label>' +
    '<input name="access" value="' + esc_(s.access) + '" placeholder="예: 2026gongga">' +
    '<label>관리자코드 <small>학생 명단을 올릴 때 필요, 관리 선생님만 알도록</small></label>' +
    '<input name="admin" value="' + esc_(s.admin === 'admin1234' ? '' : s.admin) + '" placeholder="예: 1234가 아닌 나만의 코드" required>' +
    '<button type="submit">저장</button> <span id="m"></span></form>' +
    '<script>var f=document.getElementById("f"),m=document.getElementById("m");' +
    'f.onsubmit=function(e){e.preventDefault();m.className="";m.textContent="저장 중…";' +
    'google.script.run.withSuccessHandler(function(){m.className="ok";m.textContent="저장했습니다. 다음: 메뉴 ② 웹앱 배포 안내";setTimeout(function(){google.script.host.close()},1800)})' +
    '.withFailureHandler(function(err){m.className="err";m.textContent=err.message})' +
    '.saveSettingsFromMenu({school:f.school.value,access:f.access.value,admin:f.admin.value})};</script>',
    '① 처음 설정하기', 460, 400);
}

function saveSettingsFromMenu(o) {
  var school = String(o.school || '').trim(), access = String(o.access || '').trim(), admin = String(o.admin || '').trim();
  if (!school) throw new Error('학교명을 입력하세요.');
  if (!admin || admin === 'admin1234') throw new Error('관리자코드를 새로 정해주세요.');
  if (access && access === admin) throw new Error('접속코드와 관리자코드는 다르게 정해주세요.');
  setup_();
  setSetting_('학교명', school);
  setSetting_('접속코드', access);
  setSetting_('관리자코드', admin);
  return true;
}

function setSetting_(key, value) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SETTINGS);
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]).trim() === key) { sh.getRange(i + 1, 2).setNumberFormat('@').setValue(value); return; }
  }
  sh.appendRow([key, value, '']);
}

/** ② 웹앱 배포 안내: 편집기로 바로 가는 버튼과 순서 */
function menuDeployGuide() {
  var editor = 'https://script.google.com/d/' + ScriptApp.getScriptId() + '/edit';
  dialog_(
    '<a class="btn" href="' + editor + '" target="_blank">Apps Script 편집기 열기 ↗</a>' +
    '<ol style="margin-top:14px">' +
    '<li>편집기 오른쪽 위 <b>[배포] → [새 배포]</b></li>' +
    '<li>"유형 선택" 옆 ⚙️ 톱니바퀴 → <b>[웹 앱]</b></li>' +
    '<li>다음 사용자 인증 정보로 실행: <b>나</b><br>액세스 권한이 있는 사용자: 학교 구글 계정이면 <b>(학교 도메인) 내 모든 사용자</b>, 개인 계정이면 <b>모든 사용자</b></li>' +
    '<li><b>[배포]</b> → 권한 요청이 나오면 <b>허용</b> (확인되지 않은 앱 경고 → 고급 → 이동)</li>' +
    '<li>나타난 <b>웹 앱 URL을 한 번 클릭해서 열어</b> 주세요. 그러면 메뉴 ③에 주소가 자동으로 등록됩니다.</li>' +
    '</ol>' +
    '<div class="box warn">코드를 고친 뒤에는 <b>[배포] → [배포 관리] → ✏️ → 버전: 새 버전 → [배포]</b>를 해야 반영됩니다. 주소는 그대로입니다.</div>',
    '② 웹앱 배포 안내', 500, 470);
}

/** 웹앱이 열릴 때 주소를 기억해 둡니다 (메뉴 ③에서 사용). 스프레드시트마다 따로 저장합니다. */
function rememberWebAppUrl_() {
  try {
    var url = ScriptApp.getService().getUrl();
    if (!url || !/\/exec$/.test(url)) return;
    var key = 'WEBAPP_URL_' + SpreadsheetApp.getActiveSpreadsheet().getId();
    var props = PropertiesService.getScriptProperties();
    if (props.getProperty(key) !== url) props.setProperty(key, url);
  } catch (e) { /* 주소 기록 실패는 무시 */ }
}

/** ③ 선생님들께 보낼 링크와 안내 문구 */
function menuShareLink() {
  var key = 'WEBAPP_URL_' + SpreadsheetApp.getActiveSpreadsheet().getId();
  var url = PropertiesService.getScriptProperties().getProperty(key);
  if (!url) {
    try { var u = ScriptApp.getService().getUrl(); if (u && /\/exec$/.test(u)) url = u; } catch (e) {}
  }
  if (!url) {
    dialog_('<p class="err"><b>아직 웹앱 주소가 등록되지 않았습니다.</b></p>' +
      '<p>메뉴 <b>② 웹앱 배포 안내</b>대로 배포한 뒤, 나타난 <b>웹 앱 URL을 한 번 열어</b> 주세요. 그 다음 이 메뉴를 다시 누르면 주소가 나옵니다.</p>',
      '③ 선생님들께 보낼 링크', 420, 220);
    return;
  }
  var s = settings_();
  var msg = '[공가대장 작성프로그램 안내]\n' +
    '아래 링크로 접속해 우리 반 학생의 공가(출석인정) 내용을 입력해 주세요.\n' +
    '왼쪽에서 학년·반 → 학생을 누르고, 기간과 사유를 쓰면 저장됩니다.\n\n' +
    '▶ 링크: ' + url + '\n' + (s.access ? '▶ 접속코드: ' + s.access + '\n' : '') +
    '\n사용법은 프로그램 위쪽 [사용 가이드] 탭에 있습니다.';
  dialog_(
    '<label>웹앱 주소</label><input id="u" value="' + esc_(url) + '" readonly onclick="this.select()">' +
    '<a class="btn sub" href="' + esc_(url) + '" target="_blank">웹앱 열어보기 ↗</a>' +
    '<label>메신저에 붙여넣을 안내 문구</label><textarea id="t" rows="9" readonly onclick="this.select()">' + esc_(msg) + '</textarea>' +
    '<button onclick="var t=document.getElementById(\'t\');t.select();var ok=false;try{ok=document.execCommand(\'copy\')}catch(e){}' +
    'this.textContent=ok?\'복사했습니다 ✓\':\'Ctrl+C로 복사하세요\'">안내 문구 복사</button>',
    '③ 선생님들께 보낼 링크', 500, 470);
}

/** 다른 학교용 템플릿: 학생 정보를 모두 비운 사본을 만듭니다. (프로그램 코드도 함께 복사됩니다) */
function menuMakeTemplate() {
  var ui = SpreadsheetApp.getUi();
  var ok = ui.alert('다른 학교용 템플릿 만들기',
    '이 스프레드시트의 사본을 만들고, 사본에서 학생 명단·공가 기록·학교명·코드를 모두 지웁니다.\n(지금 쓰는 원본은 바뀌지 않습니다.)\n\n계속할까요?',
    ui.ButtonSet.YES_NO);
  if (ok !== ui.Button.YES) return;

  var copy = SpreadsheetApp.getActiveSpreadsheet().copy('공가대장 작성프로그램 (배포용 템플릿)');
  [[SHEET_STUDENTS, STUDENT_HEADERS], [SHEET_RECORDS, RECORD_HEADERS]].forEach(function (p) {
    var sh = copy.getSheetByName(p[0]);
    if (sh && sh.getLastRow() > 1) sh.deleteRows(2, sh.getLastRow() - 1);
  });
  var st = copy.getSheetByName(SHEET_SETTINGS);
  if (st) {
    st.clearContents();
    st.getRange(1, 1, DEFAULT_SETTINGS.length, 3).setNumberFormat('@').setValues(DEFAULT_SETTINGS);
    copy.setActiveSheet(st);
  }
  var edit = copy.getUrl();
  var copyLink = 'https://docs.google.com/spreadsheets/d/' + copy.getId() + '/copy';
  dialog_(
    '<p class="ok"><b>템플릿을 만들었습니다.</b> (내 드라이브에 저장됨)</p>' +
    '<a class="btn sub" href="' + esc_(edit) + '" target="_blank">템플릿 열기 ↗</a>' +
    '<ol style="margin-top:12px">' +
    '<li>템플릿을 열어 <b>학생명단·공가기록 시트가 비어 있는지</b> 확인하세요.</li>' +
    '<li>템플릿에서 <b>[공유] → 일반 액세스: 링크가 있는 모든 사용자 (뷰어)</b>로 바꾸세요.</li>' +
    '<li>아래 링크를 다른 학교 선생님께 보내세요. 누르면 바로 "사본 만들기" 화면이 뜹니다.</li>' +
    '</ol>' +
    '<input value="' + esc_(copyLink) + '" readonly onclick="this.select()">' +
    '<div class="box">받은 선생님은 사본을 만든 뒤 상단 메뉴 <b>📘 공가대장 → ① → ② → ③</b> 순서대로 하면 됩니다.</div>',
    '다른 학교용 템플릿', 500, 450);
}

/* ------------------------------------------------------------------ */
/* 웹앱 진입점                                                          */
/* ------------------------------------------------------------------ */

function doGet() {
  setup_();
  rememberWebAppUrl_();
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('공가대장 작성프로그램')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/** 처음 한 번 실행하면 필요한 시트를 만듭니다. (편집기에서 직접 실행해도 됩니다) */
function setup() {
  setup_();
}

function setup_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, SHEET_STUDENTS, STUDENT_HEADERS);
  ensureSheet_(ss, SHEET_RECORDS, RECORD_HEADERS);
  var st = ss.getSheetByName(SHEET_SETTINGS);
  if (!st) {
    st = ss.insertSheet(SHEET_SETTINGS);
    st.getRange(1, 1, DEFAULT_SETTINGS.length, 3).setValues(DEFAULT_SETTINGS);
    st.setFrozenRows(1);
    st.autoResizeColumns(1, 3);
  }
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold');
    sh.setFrozenRows(1);
    // 학번·날짜가 숫자/날짜로 바뀌지 않도록 텍스트 서식
    sh.getRange(1, 1, sh.getMaxRows(), headers.length).setNumberFormat('@');
  }
  return sh;
}

function settings_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_SETTINGS);
  var out = { school: '', access: '', admin: '' };
  if (!sh) return out;
  var v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) {
    var k = String(v[i][0]).trim(), val = String(v[i][1]).trim();
    if (k === '학교명') out.school = val;
    if (k === '접속코드') out.access = val;
    if (k === '관리자코드') out.admin = val;
  }
  return out;
}

function checkAccess_(code) {
  var s = settings_();
  if (s.access && String(code || '') !== s.access) throw new Error('접속코드가 올바르지 않습니다.');
  return s;
}

function checkAdmin_(code) {
  var s = settings_();
  if (!s.admin || String(code || '') !== s.admin) throw new Error('관리자코드가 올바르지 않습니다.');
}

/* ------------------------------------------------------------------ */
/* 화면에서 호출하는 함수 (google.script.run)                           */
/* ------------------------------------------------------------------ */

/** 처음 화면을 열 때 필요한 데이터를 한 번에 돌려줍니다. */
function apiInit(access) {
  setup_();
  var s = checkAccess_(access);
  return {
    school: s.school,
    needAccess: !!s.access,
    students: readStudents_(),
    records: readRecords_()
  };
}

/** 접속코드가 필요한지만 확인 (코드 없이 호출 가능) */
function apiNeedAccess() {
  setup_();
  return !!settings_().access;
}

function apiGetRecords(access) {
  checkAccess_(access);
  return readRecords_();
}

/**
 * 학생 명단 업로드.
 * students: [{grade, cls, num, name}] - 화면에서 엑셀을 읽어 학번·이름만 보냅니다.
 * 업로드한 파일에 들어 있는 학년만 교체하고, 다른 학년 명단은 그대로 둡니다.
 */
function apiUploadStudents(access, admin, students) {
  checkAccess_(access);
  checkAdmin_(admin);
  if (!students || !students.length) throw new Error('업로드할 학생이 없습니다.');
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var grades = {};
    var clean = [];
    students.forEach(function (s) {
      var g = parseInt(s.grade, 10), c = parseInt(s.cls, 10), n = parseInt(s.num, 10);
      var name = String(s.name || '').trim();
      if (!g || !c || !n || !name) return;
      grades[g] = true;
      clean.push([makeId_(g, c, n), String(g), String(c), String(n), name]);
    });
    var keep = readStudents_().filter(function (s) { return !grades[s.grade]; })
      .map(function (s) { return [s.id, String(s.grade), String(s.cls), String(s.num), s.name]; });
    var all = keep.concat(clean);
    all.sort(function (a, b) { return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0; });

    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_STUDENTS);
    if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, STUDENT_HEADERS.length).clearContent();
    if (all.length) {
      sh.getRange(2, 1, all.length, STUDENT_HEADERS.length).setNumberFormat('@').setValues(all);
    }
    return readStudents_();
  } finally {
    lock.releaseLock();
  }
}

/** 공가 기록 저장 (rec.id가 있으면 수정, 없으면 새로 추가) */
function apiSaveRecord(access, rec) {
  checkAccess_(access);
  validateRecord_(rec);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);
    var now = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    var row;
    if (rec.id) {
      var idx = findRecordRow_(sh, rec.id);
      if (idx < 0) throw new Error('수정할 기록을 찾지 못했습니다. 새로고침 후 다시 시도해 주세요.');
      var old = sh.getRange(idx, 1, 1, RECORD_HEADERS.length).getValues()[0];
      row = recordToRow_(rec, rec.id, old[13] || now, now);
      sh.getRange(idx, 1, 1, RECORD_HEADERS.length).setNumberFormat('@').setValues([row]);
    } else {
      var id = Utilities.getUuid();
      row = recordToRow_(rec, id, now, '');
      sh.getRange(sh.getLastRow() + 1, 1, 1, RECORD_HEADERS.length).setNumberFormat('@').setValues([row]);
    }
    return readRecords_();
  } finally {
    lock.releaseLock();
  }
}

function apiDeleteRecord(access, id) {
  checkAccess_(access);
  var lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);
    var idx = findRecordRow_(sh, id);
    if (idx > 0) sh.deleteRow(idx);
    return readRecords_();
  } finally {
    lock.releaseLock();
  }
}

/* ------------------------------------------------------------------ */
/* 내부 함수                                                            */
/* ------------------------------------------------------------------ */

function makeId_(g, c, n) {
  return String(g) + ('0' + c).slice(-2) + ('0' + n).slice(-2);
}

function readStudents_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_STUDENTS);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, STUDENT_HEADERS.length).getDisplayValues()
    .filter(function (r) { return r[0] && r[4]; })
    .map(function (r) {
      return { id: r[0], grade: +r[1], cls: +r[2], num: +r[3], name: r[4] };
    });
}

function readRecords_() {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_RECORDS);
  if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, RECORD_HEADERS.length).getDisplayValues()
    .filter(function (r) { return r[0]; })
    .map(function (r) {
      return {
        id: r[0], sid: r[1], grade: +r[2], cls: +r[3], num: +r[4], name: r[5],
        type: r[6], start: r[7], end: r[8], p1: r[9], p2: r[10], content: r[11],
        writer: r[12], created: r[13], updated: r[14]
      };
    });
}

function findRecordRow_(sh, id) {
  if (sh.getLastRow() < 2) return -1;
  var ids = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getDisplayValues();
  for (var i = 0; i < ids.length; i++) if (ids[i][0] === id) return i + 2;
  return -1;
}

function validateRecord_(r) {
  var dateRe = /^\d{4}-\d{2}-\d{2}$/;
  if (!r || !r.sid || !r.name) throw new Error('학생을 선택해 주세요.');
  if (!dateRe.test(r.start || '')) throw new Error('날짜를 입력해 주세요.');
  if (r.type === 'range') {
    if (!dateRe.test(r.end || '')) r.end = r.start;
    if (r.end < r.start) throw new Error('종료일이 시작일보다 빠릅니다.');
  } else if (r.type === 'period') {
    var a = parseInt(r.p1, 10), b = parseInt(r.p2, 10);
    if (!a || !b || a > b) throw new Error('교시를 확인해 주세요.');
    r.end = r.start;
  } else {
    throw new Error('기간 유형이 올바르지 않습니다.');
  }
  if (!String(r.content || '').trim()) throw new Error('내용(사유)을 입력해 주세요.');
}

function recordToRow_(r, id, created, updated) {
  return [id, String(r.sid), String(r.grade), String(r.cls), String(r.num), String(r.name),
    r.type, r.start, r.end || r.start,
    r.type === 'period' ? String(r.p1) : '', r.type === 'period' ? String(r.p2) : '',
    String(r.content).trim(), String(r.writer || '').trim(), created, updated];
}
