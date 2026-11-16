/* 공통 유틸 · 상태 저장 */
const DOW = ['일', '월', '화', '수', '목', '금', '토'];
const APP_KIND = document.documentElement.dataset.app === 'yaja' ? 'yaja' : 'exam'; // 어느 프로그램인지 (index.html의 data-app)
const STORE_KEY = APP_KIND === 'yaja' ? 'yaja-duty-v1' : 'exam-proctor-v1';
const LEGACY_KEY = 'proctor-app-v1'; // 두 프로그램이 합쳐져 있던 예전 버전의 저장 키
const ACTS = {};          // data-act 클릭 핸들러 등록소
const CHANGE_ACTS = {};   // data-act-change 변경 핸들러 등록소
let S = null;             // 전체 상태

function rooms(names, special) {
  return names.map(n => ({ name: n, homeroom: '', special: !!special }));
}
function classRooms() { return rooms(['1반', '2반', '3반', '4반', '5반', '6반']); }

function defaultState() {
  const all = fullDefaultState();
  if (APP_KIND === 'yaja') return { ui: { ...all.ui, tab: 'yaja' }, yaja: all.yaja };
  return { ui: all.ui, teachers: all.teachers, exam: all.exam };
}
function fullDefaultState() {
  return {
    ui: { tab: 'teachers', yMode: 'edit', yOffTeacher: '', yStatMonth: '' },
    teachers: [],
    exam: {
      title: '2026학년도 2학기 중간고사 감독 시간표',
      school: '',
      notes: '★ 출제교사 복도대기\n※ 감독시간표는 학교 사정 및 교사 개인 사정에 의하여 변경될 수 있음',
      options: { setterHall: true },
      grades: [
        { name: '1학년', rooms: classRooms() },
        { name: '2학년', rooms: classRooms().concat(rooms(['온누리교실', '학습도움실'], true)) },
        { name: '3학년', rooms: rooms(['수학전용실'], true).concat(classRooms()) },
      ],
      days: [],
      assign: {},
      locks: {},
    },
    yaja: {
      title: '야간자율학습 감독 배정표',
      notes: '※ 부득이한 사정이 있을 경우 선생님 간 교체 후 담당자에게 알려 주세요.',
      start: '', end: '',
      perDow: [0, 1, 1, 1, 1, 1, 0],
      minGap: 3,
      useHistory: true,
      holidays: {},
      teachers: [],
      assign: {},
      locks: {},
    },
  };
}

/* 이 프로그램에 필요한 부분만 남기고 빠진 항목은 기본값으로 채움 */
function ensureShape(s) {
  const d = defaultState(), out = {};
  for (const k of Object.keys(d)) {
    const v = s && s[k];
    if (v === undefined || v === null) out[k] = d[k];
    else if (!Array.isArray(d[k]) && typeof d[k] === 'object') { out[k] = v; for (const kk of Object.keys(d[k])) if (v[kk] === undefined) v[kk] = d[k][kk]; }
    else out[k] = v;
  }
  if (APP_KIND === 'yaja' && !['yaja', 'backup'].includes(out.ui.tab)) out.ui.tab = 'yaja';
  if (APP_KIND === 'exam' && !['teachers', 'exam', 'backup'].includes(out.ui.tab)) out.ui.tab = 'teachers';
  return out;
}

function load() {
  let raw = null;
  try { raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_KEY); S = raw ? JSON.parse(raw) : null; } catch (e) { S = null; }
  if (!S || typeof S !== 'object') S = defaultState();
  S = ensureShape(S);
}
let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); }
    catch (e) { toast('브라우저 저장에 실패했습니다. [백업 · 복원]에서 파일로 저장해 두세요.'); }
  }, 150);
}

/* ---------- 문자열/경로 ---------- */
function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function getPath(obj, path) {
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function setPath(obj, path, val) {
  const ks = path.split('.');
  let o = obj;
  for (let i = 0; i < ks.length - 1; i++) {
    if (o[ks[i]] == null) o[ks[i]] = /^\d+$/.test(ks[i + 1]) ? [] : {};
    o = o[ks[i]];
  }
  o[ks[ks.length - 1]] = val;
}
function uid() { return Math.random().toString(36).slice(2, 9); }
function parseNames(text) {
  const out = [];
  String(text || '').split(/[\n,\t;/·]+/).map(x => x.trim()).filter(Boolean).forEach(n => { if (!out.includes(n)) out.push(n); });
  return out;
}
function hasTeacher(n) { return S.teachers.some(t => t.name === n); }
function teacherOptions(sel, emptyLabel = '(선택)') {
  let html = `<option value="">${emptyLabel}</option>`;
  if (sel && !hasTeacher(sel)) html += `<option selected>${esc(sel)}</option>`;
  html += S.teachers.map(t => `<option ${t.name === sel ? 'selected' : ''}>${esc(t.name)}</option>`).join('');
  return html;
}
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
function koSort(a, b) { return a.localeCompare(b, 'ko'); }

/* ---------- 날짜 ---------- */
const pad = n => String(n).padStart(2, '0');
function toIso(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function parseIso(s) { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d); }
function validIso(s) { return /^\d{4}-\d{2}-\d{2}$/.test(s || ''); }
function fmtDate(s) { if (!validIso(s)) return ''; const d = parseIso(s); return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DOW[d.getDay()]})`; }
function md(s) { const d = parseIso(s); return `${d.getMonth() + 1}/${d.getDate()}`; }
function dayDiff(a, b) { return Math.round((parseIso(b) - parseIso(a)) / 86400000); }
function addDays(s, n) { const d = parseIso(s); d.setDate(d.getDate() + n); return toIso(d); }

/* ---------- UI 보조 ---------- */
let toastTimer = null;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function openModal(html) {
  document.getElementById('modalBox').innerHTML = html;
  document.getElementById('modal').classList.remove('hidden');
}
function closeModal() { document.getElementById('modal').classList.add('hidden'); }
function downloadBlob(blob, filename) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 3000);
}
function safeFileName(s) { return String(s || '배정표').replace(/[\\/:*?"<>|]/g, '_').trim() || '배정표'; }
function needExcelJS() {
  if (window.ExcelJS) return true;
  alert('엑셀 내보내기 라이브러리를 불러오지 못했습니다.\n인터넷 연결을 확인한 뒤 페이지를 새로고침해 주세요.');
  return false;
}
async function saveWorkbook(wb, name) {
  const buf = await wb.xlsx.writeBuffer();
  downloadBlob(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), safeFileName(name) + '.xlsx');
}
/* 엑셀 공통 스타일 */
const XL = {
  font: (o = {}) => Object.assign({ name: '맑은 고딕', size: 11 }, o),
  fill: argb => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } }),
  center: { horizontal: 'center', vertical: 'middle', wrapText: true },
  thinAll: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
};
function colLetter(n) { let s = ''; while (n > 0) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; }
function sheetName(base, used) {
  let n = String(base).replace(/[\\/?*\[\]:]/g, '').slice(0, 28) || 'Sheet';
  let k = n, i = 2; while (used.has(k)) k = n + '_' + i++;
  used.add(k); return k;
}
