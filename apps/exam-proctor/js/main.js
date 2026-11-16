/* 화면 전환 · 이벤트 연결 · 백업 */
function renderBackup() {
  return `<section class="card">
    <h2>백업 · 복원</h2>
    <p class="hint">입력한 모든 내용은 이 컴퓨터의 브라우저에 자동 저장됩니다. 다른 컴퓨터로 옮기거나 다음 학기에 다시 쓰려면 백업 파일로 저장해 두세요.</p>
    <div class="row">
      <button class="primary" data-act="bk-save">백업 파일 저장 (.json)</button>
      <label class="check" style="margin:0"><button data-act="bk-open">백업 파일 불러오기</button></label>
      <input type="file" id="bkFile" accept=".json,application/json" style="display:none">
    </div>
  </section>
  <section class="card">
    <h2>초기화</h2>
    <div class="row">
      ${APP_KIND === 'exam' ? '<button class="danger" data-act="bk-reset-exam">시험 일정 · 결과만 초기화 (학년·고사실·담임은 유지)</button>' : ''}
      <button class="danger" data-act="bk-reset-all">전체 초기화</button>
    </div>
  </section>`;
}

const RENDERERS = { teachers: 'renderTeachers', exam: 'renderExam', yaja: 'renderYaja', backup: 'renderBackup' };
function render() {
  const app = document.getElementById('app');
  const y = window.scrollY;
  const tabs = [...document.querySelectorAll('#tabs button')].map(b => b.dataset.tab);
  if (!tabs.includes(S.ui.tab)) S.ui.tab = tabs[0];
  const tab = S.ui.tab;
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  app.innerHTML = window[RENDERERS[tab]]();
  window.scrollTo(0, y);
}

function readVal(el) {
  if (el.type === 'checkbox') return el.checked;
  if (el.dataset.type === 'num') return Number(el.value) || 0;
  return el.value;
}

document.addEventListener('input', e => {
  const el = e.target;
  if (!el.dataset || !el.dataset.path || el.type === 'checkbox' || el.tagName === 'SELECT') return;
  setPath(S, el.dataset.path, readVal(el)); save();
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.dataset && el.dataset.actChange && CHANGE_ACTS[el.dataset.actChange]) { CHANGE_ACTS[el.dataset.actChange](el); return; }
  if (el.id === 'bkFile') { importBackup(el.files[0]); return; }
  if (!el.dataset || !el.dataset.path) return;
  setPath(S, el.dataset.path, readVal(el)); save();
  if (el.type === 'checkbox' || el.tagName === 'SELECT' || el.dataset.rerender !== undefined) render();
});
document.addEventListener('click', e => {
  const tb = e.target.closest('#tabs button');
  if (tb) { S.ui.tab = tb.dataset.tab; save(); window.scrollTo(0, 0); render(); return; }
  if (e.target.id === 'modal') { closeModal(); return; }
  const el = e.target.closest('[data-act]');
  if (el && ACTS[el.dataset.act] && !el.disabled) ACTS[el.dataset.act](el, e);
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

ACTS['bk-save'] = () => {
  const d = new Date();
  downloadBlob(new Blob([JSON.stringify(S, null, 1)], { type: 'application/json' }), `${APP_KIND === 'yaja' ? '야자감독' : '정기고사감독'}_백업_${toIso(d)}.json`);
};
ACTS['go-tab'] = el => { S.ui.tab = el.dataset.to; save(); window.scrollTo(0, 0); render(); };
ACTS['bk-open'] =() => document.getElementById('bkFile').click();
function importBackup(file) {
  if (!file) return;
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const obj = JSON.parse(fr.result);
      if (!obj || !obj[APP_KIND]) throw new Error(APP_KIND === 'yaja' ? '야자 감독 백업 파일이 아닙니다.' : '정기고사 감독 백업 파일이 아닙니다.');
      if (!confirm('현재 내용을 백업 파일 내용으로 바꿀까요?')) return;
      S = ensureShape(obj); save(); render(); toast('불러오기 완료');
    } catch (err) { alert('백업 파일을 읽을 수 없습니다: ' + err.message); }
  };
  fr.readAsText(file, 'utf-8');
}
ACTS['bk-reset-exam'] = () => {
  if (!confirm('시험 일정 · 복무 · 배정 결과를 지웁니다. (학년·고사실·담임 설정은 유지) 진행할까요?')) return;
  S.exam.days = []; S.exam.assign = {}; S.exam.locks = {}; save(); render();
};
ACTS['bk-reset-all'] = () => {
  if (!confirm('이 프로그램의 모든 데이터를 지웁니다. 진행할까요?')) return;
  S = defaultState(); save(); render();
};

load();
render();
