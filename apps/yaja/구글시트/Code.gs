/**
 * 야자 감독 공유 — 구글 시트 서버 (Google Apps Script)
 *
 * - 선생님용 웹페이지(Teacher.html)를 제공하고, 교체 요청 · 수락을 처리합니다.
 * - 담당 선생님의 '야자 감독 배정' 프로그램이 감독표를 올리고(upload) 변경 내용을 가져갑니다(pull).
 * - 데이터는 이 스프레드시트의 시트(설정 · 교사 · 배정 · 교체요청 · 변경기록)에 저장됩니다.
 */
const SH = { conf: '설정', teachers: '교사', assign: '배정', req: '교체요청', log: '변경기록' };
const TZ = 'Asia/Seoul';
const DOW_KO = ['일', '월', '화', '수', '목', '금', '토'];
const TEACHER_H = ['이름', 'PIN(암호화)', '마지막 접속'];
const ASSIGN_H = ['날짜', '요일', '감독', '비고(교체 내역)'];
const REQ_H = ['번호', '요청 시각', '요청자', '요청자 날짜', '상대', '상대 날짜', '메시지', '상태', '처리 시각'];
const LOG_H = ['시각', '내용'];

/* ================= 스프레드시트 메뉴 ================= */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('야자 감독')
    .addItem('초기 설정 · 관리자 키 보기', 'showSetup')
    .addItem('선생님 PIN 초기화', 'resetPinPrompt')
    .addToUi();
}
function showSetup() {
  const c = ensureSetup_();
  SpreadsheetApp.getUi().alert('야자 감독 공유 — 관리자 키',
    '야자 감독 배정 프로그램의 [온라인 공유] 칸에 아래 관리자 키를 붙여넣으세요.\n(다른 사람에게 알려 주지 마세요)\n\n' + c.adminKey,
    SpreadsheetApp.getUi().ButtonSet.OK);
}
function resetPinPrompt() {
  const ui = SpreadsheetApp.getUi();
  const r = ui.prompt('PIN 초기화', 'PIN을 초기화할 선생님 이름을 입력하세요.', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() !== ui.Button.OK) return;
  const n = r.getResponseText().trim();
  withLock_(() => {
    const T = readTeachers_();
    if (!T[n]) { ui.alert('명단에 없는 이름입니다.'); return; }
    T[n].pin = ''; writeTeachers_(T); log_(`${n} 선생님 PIN 초기화`);
    ui.alert(n + ' 선생님의 PIN을 초기화했습니다. 다음에 접속할 때 새 PIN을 정하게 됩니다.');
  });
}

/* ================= 웹앱 진입점 ================= */
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Teacher')
    .setTitle('야자 감독')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* 담당 선생님 프로그램(관리자)용: 관리자 키로 확인 */
function doPost(e) {
  let res;
  try {
    const b = JSON.parse(e.postData.contents);
    const c = ensureSetup_();
    if (!b.key || b.key !== c.adminKey) res = { ok: false, code: 'key', msg: '관리자 키가 맞지 않습니다. 시트 메뉴 [야자 감독 → 관리자 키 보기]에서 확인하세요.' };
    else if (b.action === 'ping') res = adminPing_();
    else if (b.action === 'upload') res = withLock_(() => adminUpload_(b));
    else if (b.action === 'pull') res = adminPull_();
    else res = { ok: false, msg: '알 수 없는 요청입니다.' };
  } catch (err) {
    res = { ok: false, msg: String((err && err.message) || err) };
  }
  return ContentService.createTextOutput(JSON.stringify(res)).setMimeType(ContentService.MimeType.JSON);
}

function adminPing_() {
  const c = conf_();
  return {
    ok: true, title: c.title, assignVersion: c.assignVersion, updated: c.updated || '',
    teachers: Object.keys(readTeachers_()).length,
    pending: readReqs_().filter(r => r.status === '대기').length,
  };
}

function adminUpload_(b) {
  const c = conf_(), d = b.data || {};
  if (!b.force && String(b.baseVersion || '') !== String(c.assignVersion))
    return { ok: false, code: 'conflict', assignVersion: c.assignVersion, msg: '온라인에서 감독표가 바뀌었습니다(선생님 간 교체 등). 먼저 [온라인 변경 내용 가져오기]를 하세요.' };
  // 교사: 남아 있는 선생님의 PIN은 유지
  const T = readTeachers_(), NT = {};
  (d.teachers || []).forEach((n, i) => { n = String(n).trim(); if (n) NT[n] = T[n] ? Object.assign(T[n], { order: i }) : { pin: '', last: '', order: i }; });
  writeTeachers_(NT);
  // 배정: 이름이 그대로인 날은 교체 내역(비고) 유지
  const old = readAssign_(), a = {}, note = {};
  Object.keys(d.assign || {}).forEach(k => {
    const v = (d.assign[k] || []).map(String).filter(Boolean);
    if (!isIso_(k) || !v.length) return;
    a[k] = v;
    if (old.note[k] && (old.a[k] || []).join() === v.join()) note[k] = old.note[k];
  });
  writeAssign_(a, note);
  c.title = d.title || c.title;
  c.notes = d.notes || '';
  c.perDow = JSON.stringify(d.perDow || []);
  c.holidays = JSON.stringify(d.holidays || {});
  saveConf_(c);
  // 더 이상 맞지 않는 대기 요청은 무효 처리
  const R = readReqs_(); let inval = 0;
  R.forEach(x => { if (x.status === '대기' && checkSwap_(a, NT, x.from, x.fromDate, x.to, x.toDate, true)) { x.status = '무효'; x.doneAt = now_(); inval++; } });
  writeReqs_(R);
  bump_(true);
  log_('담당 선생님이 감독표를 새로 올렸습니다.');
  return { ok: true, assignVersion: conf_().assignVersion, invalidated: inval };
}

function adminPull_() {
  const c = conf_(), as = readAssign_();
  return {
    ok: true, assignVersion: c.assignVersion, assign: as.a, note: as.note,
    log: readRows_(SH.log).slice(-50).reverse(),
    pending: readReqs_().filter(r => r.status === '대기').length,
  };
}

/* ================= 선생님 웹페이지용 함수 (google.script.run) ================= */
function apiNames() {
  const c = ensureSetup_();
  return { title: c.title, names: orderedNames_() };
}

function apiLogin(name, pin) {
  pin = String(pin || '').trim();
  if (!/^\d{4,6}$/.test(pin)) return { ok: false, msg: 'PIN은 숫자 4~6자리입니다.' };
  return withLock_(() => {
    const c = conf_(), T = readTeachers_(), t = T[name];
    if (!t) return { ok: false, msg: '명단에 없는 이름입니다.' };
    const h = pinHash_(c, name, pin);
    let first = false;
    if (!t.pin) { t.pin = h; first = true; }
    else if (t.pin !== h) return { ok: false, msg: 'PIN이 맞지 않습니다. 잊으셨다면 담당 선생님께 PIN 초기화를 요청하세요.' };
    t.last = now_();
    writeTeachers_(T);
    return { ok: true, token: token_(c, name, t.pin), first };
  });
}

function apiChangePin(name, token, newPin) {
  newPin = String(newPin || '').trim();
  if (!/^\d{4,6}$/.test(newPin)) return { ok: false, msg: 'PIN은 숫자 4~6자리입니다.' };
  auth_(name, token);
  return withLock_(() => {
    const c = conf_(), T = readTeachers_();
    T[name].pin = pinHash_(c, name, newPin);
    writeTeachers_(T);
    return { ok: true, token: token_(c, name, T[name].pin) };
  });
}

function apiState(name, token, since) {
  const c = auth_(name, token);
  if (since && String(since) === String(c.version)) return { same: true };
  const as = readAssign_();
  return {
    version: c.version, title: c.title, notes: c.notes || '', today: today_(),
    perDow: safeJson_(c.perDow, [0, 1, 1, 1, 1, 1, 0]),
    holidays: safeJson_(c.holidays, {}),
    assign: as.a, note: as.note,
    names: orderedNames_(),
    reqs: readReqs_().filter(r => r.from === name || r.to === name).slice(-60),
    log: readRows_(SH.log).slice(-30).reverse(),
  };
}

function apiRequest(name, token, fromDate, to, toDate, msg) {
  auth_(name, token);
  return withLock_(() => {
    const a = readAssign_().a, T = readTeachers_();
    const err = checkSwap_(a, T, name, fromDate, to, toDate);
    if (err) return { ok: false, msg: err };
    const R = readReqs_();
    if (R.some(r => r.status === '대기' && r.from === name && r.fromDate === fromDate))
      return { ok: false, msg: '이 날짜로 보낸 요청이 이미 대기 중입니다. 먼저 취소해 주세요.' };
    const id = String(R.reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1);
    R.push({ id, at: now_(), from: name, fromDate, to, toDate: toDate || '', msg: String(msg || '').slice(0, 100), status: '대기', doneAt: '' });
    writeReqs_(R);
    bump_(false);
    log_(`[요청] ${name} → ${to}: ${reqText_({ from: name, fromDate, to, toDate })}`);
    return { ok: true };
  });
}

function apiRespond(name, token, id, accept) {
  auth_(name, token);
  return withLock_(() => {
    const R = readReqs_(), r = R.find(x => x.id === String(id));
    if (!r || r.to !== name || r.status !== '대기') return { ok: false, msg: '이미 처리되었거나 처리할 수 없는 요청입니다.' };
    if (!accept) {
      r.status = '거절'; r.doneAt = now_();
      writeReqs_(R); bump_(false);
      log_(`[거절] ${name} 선생님이 ${r.from} 선생님의 요청을 거절: ${reqText_(r)}`);
      return { ok: true };
    }
    const as = readAssign_(), a = as.a, note = as.note, T = readTeachers_();
    const err = checkSwap_(a, T, r.from, r.fromDate, r.to, r.toDate);
    if (err) {
      r.status = '무효'; r.doneAt = now_(); writeReqs_(R); bump_(false);
      return { ok: false, msg: '감독표가 바뀌어 이 요청을 처리할 수 없습니다. (' + err + ')' };
    }
    a[r.fromDate] = a[r.fromDate].map(n => n === r.from ? r.to : n);
    note[r.fromDate] = addNote_(note[r.fromDate], `${r.from}→${r.to}`);
    if (r.toDate) {
      a[r.toDate] = a[r.toDate].map(n => n === r.to ? r.from : n);
      note[r.toDate] = addNote_(note[r.toDate], `${r.to}→${r.from}`);
    }
    r.status = '수락'; r.doneAt = now_();
    // 이번 교체로 맞지 않게 된 다른 대기 요청은 무효
    R.forEach(x => { if (x.status === '대기' && checkSwap_(a, T, x.from, x.fromDate, x.to, x.toDate, true)) { x.status = '무효'; x.doneAt = now_(); } });
    writeAssign_(a, note); writeReqs_(R); bump_(true);
    log_(`[교체] ${reqText_(r)} (${r.from} ↔ ${r.to})`);
    return { ok: true };
  });
}

function apiCancel(name, token, id) {
  auth_(name, token);
  return withLock_(() => {
    const R = readReqs_(), r = R.find(x => x.id === String(id));
    if (!r || r.from !== name || r.status !== '대기') return { ok: false, msg: '취소할 수 없는 요청입니다.' };
    r.status = '취소'; r.doneAt = now_();
    writeReqs_(R); bump_(false);
    return { ok: true };
  });
}

/* ================= 규칙 ================= */
function checkSwap_(a, T, from, fromDate, to, toDate, skipPast) {
  const today = today_();
  if (!isIso_(fromDate) || !(a[fromDate] || []).includes(from)) return `${md_(fromDate)}은(는) ${from} 선생님의 감독일이 아닙니다.`;
  if (!skipPast && fromDate < today) return '지난 날짜는 교체할 수 없습니다.';
  if (from === to) return '본인에게는 요청할 수 없습니다.';
  if (!T[to]) return '명단에 없는 선생님입니다.';
  if ((a[fromDate] || []).includes(to)) return `${to} 선생님은 ${md_(fromDate)}에 이미 감독입니다.`;
  if (toDate) {
    if (!isIso_(toDate) || !(a[toDate] || []).includes(to)) return `${md_(toDate)}은(는) ${to} 선생님의 감독일이 아닙니다.`;
    if (!skipPast && toDate < today) return '지난 날짜와는 바꿀 수 없습니다.';
    if ((a[toDate] || []).includes(from)) return `${from} 선생님은 ${md_(toDate)}에 이미 감독입니다.`;
  }
  return '';
}
function reqText_(r) {
  return r.toDate ? `${md_(r.fromDate)}(${r.from}) ↔ ${md_(r.toDate)}(${r.to})` : `${md_(r.fromDate)} ${r.from} 대신 ${r.to}`;
}
function addNote_(old, s) { return old ? old + ', ' + s : s; }

/* ================= 저장소 (시트) ================= */
function ss_() {
  const p = PropertiesService.getScriptProperties();
  const id = p.getProperty('SSID');
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  p.setProperty('SSID', ss.getId());
  return ss;
}
function sheet_(name, header) {
  const ss = ss_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    if (header) { sh.getRange(1, 1, 1, header.length).setValues([header]); sh.setFrozenRows(1); }
  }
  return sh;
}
function readRows_(name) {
  const v = sheet_(name).getDataRange().getDisplayValues();
  return v.slice(1).filter(r => r.some(x => x !== ''));
}
function writeRows_(name, header, rows) {
  const sh = sheet_(name, header), w = header.length;
  const all = [header].concat(rows).map(r => { const a = r.slice(0, w); while (a.length < w) a.push(''); return a.map(x => String(x == null ? '' : x)); });
  sh.clearContents();
  sh.getRange(1, 1, all.length, w).setNumberFormat('@').setValues(all);
  sh.setFrozenRows(1);
}
function conf_() { const o = {}; readRows_(SH.conf).forEach(r => { o[r[0]] = r[1]; }); return o; }
function saveConf_(o) { writeRows_(SH.conf, ['항목', '값'], Object.keys(o).map(k => [k, o[k]])); }
function ensureSetup_() {
  ss_();
  const c = conf_();
  let dirty = false;
  if (!c.adminKey) { c.adminKey = Utilities.getUuid().replace(/-/g, '').slice(0, 20); dirty = true; }
  if (!c.secret) { c.secret = Utilities.getUuid() + Utilities.getUuid(); dirty = true; }
  if (!c.version) { c.version = '1'; dirty = true; }
  if (!c.assignVersion) { c.assignVersion = '1'; dirty = true; }
  if (!c.title) { c.title = '야간자율학습 감독'; dirty = true; }
  if (dirty) saveConf_(c);
  sheet_(SH.teachers, TEACHER_H); sheet_(SH.assign, ASSIGN_H); sheet_(SH.req, REQ_H); sheet_(SH.log, LOG_H);
  return c;
}
function bump_(assignChanged) {
  const c = conf_();
  c.version = String((Number(c.version) || 0) + 1);
  if (assignChanged) c.assignVersion = String((Number(c.assignVersion) || 0) + 1);
  c.updated = now_();
  saveConf_(c);
}
function log_(text) { sheet_(SH.log, LOG_H).appendRow([now_(), text]); }

function readTeachers_() {
  const o = {};
  readRows_(SH.teachers).forEach((r, i) => { if (r[0]) o[r[0]] = { pin: r[1] || '', last: r[2] || '', order: i }; });
  return o;
}
function writeTeachers_(o) {
  writeRows_(SH.teachers, TEACHER_H, Object.keys(o).sort((a, b) => o[a].order - o[b].order).map(n => [n, o[n].pin, o[n].last]));
}
function orderedNames_() { const T = readTeachers_(); return Object.keys(T).sort((a, b) => T[a].order - T[b].order); }

function readAssign_() {
  const a = {}, note = {};
  readRows_(SH.assign).forEach(r => {
    if (!isIso_(r[0])) return;
    a[r[0]] = r[2] ? r[2].split(',').map(s => s.trim()).filter(Boolean) : [];
    if (r[3]) note[r[0]] = r[3];
  });
  return { a, note };
}
function writeAssign_(a, note) {
  writeRows_(SH.assign, ASSIGN_H, Object.keys(a).sort().map(d => [d, DOW_KO[dow_(d)], a[d].join(', '), note[d] || '']));
}

function readReqs_() {
  return readRows_(SH.req).map(r => ({ id: r[0], at: r[1], from: r[2], fromDate: r[3], to: r[4], toDate: r[5], msg: r[6], status: r[7], doneAt: r[8] }));
}
function writeReqs_(R) {
  writeRows_(SH.req, REQ_H, R.map(r => [r.id, r.at, r.from, r.fromDate, r.to, r.toDate, r.msg, r.status, r.doneAt]));
}

/* ================= 인증 · 유틸 ================= */
function hex_(bytes) { return bytes.map(b => ((b + 256) % 256).toString(16).padStart(2, '0')).join(''); }
function pinHash_(c, name, pin) {
  return hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, c.secret + '|' + name + '|' + pin, Utilities.Charset.UTF_8));
}
function token_(c, name, pinHash) {
  return hex_(Utilities.computeHmacSha256Signature(name + '|' + pinHash, c.secret, Utilities.Charset.UTF_8)).slice(0, 40);
}
function auth_(name, token) {
  const c = conf_(), t = readTeachers_()[name];
  if (!t || !t.pin || token_(c, name, t.pin) !== token) throw new Error('AUTH');
  return c;
}
function withLock_(fn) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try { return fn(); } finally { lock.releaseLock(); }
}
function isIso_(s) { return /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); }
function dow_(iso) { const p = iso.split('-').map(Number); return new Date(Date.UTC(p[0], p[1] - 1, p[2])).getUTCDay(); }
function md_(iso) { if (!isIso_(iso)) return String(iso || ''); const p = iso.split('-').map(Number); return `${p[1]}/${p[2]}(${DOW_KO[dow_(iso)]})`; }
function today_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd'); }
function now_() { return Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'); }
function safeJson_(s, d) { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } }
