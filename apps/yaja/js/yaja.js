/* ③ 야간자율학습 감독 배정
   - 배정 결과는 날짜별로 계속 쌓임(기간을 바꿔도 이전 달 결과 유지)
   - 횟수는 요일 구분(월~목 / 금 / 토 / 일)별로 따로 맞춤, 월별 · 누적 집계 */

const CATS = [
  { k: 'wk', label: '월~목', dows: [1, 2, 3, 4] },
  { k: 'fri', label: '금', dows: [5] },
  { k: 'sat', label: '토', dows: [6] },
  { k: 'sun', label: '일', dows: [0] },
];
const catOf = iso => { const d = parseIso(iso).getDay(); return d === 0 ? 'sun' : d === 5 ? 'fri' : d === 6 ? 'sat' : 'wk'; };
const blankCat = () => ({ wk: 0, fri: 0, sat: 0, sun: 0, tot: 0 });
const DN = new Map();
const dnum = iso => { let v = DN.get(iso); if (v === undefined) { v = Math.round(parseIso(iso).getTime() / 86400000); DN.set(iso, v); } return v; };
const monthLabel = ym => `${+ym.slice(5)}월`;

/* 현재 기간 */
function yajaRange() {
  const Y = S.yaja, out = [];
  if (!validIso(Y.start) || !validIso(Y.end) || Y.start > Y.end) return out;
  for (let s = Y.start, guard = 0; s <= Y.end && guard < 800; s = addDays(s, 1), guard++) out.push(s);
  return out;
}
function yajaNeed(iso) {
  const Y = S.yaja;
  if (Y.holidays[iso] !== undefined) return 0;
  return Number(Y.perDow[parseIso(iso).getDay()]) || 0;
}
function yajaDays() { return yajaRange().filter(s => yajaNeed(s) > 0); }
function yajaUnavail(t, iso) {
  if (t.offDow && t.offDow[parseIso(iso).getDay()]) return `불가 요일(${DOW[parseIso(iso).getDay()]})`;
  if ((t.offDates || []).includes(iso)) return '불가 날짜';
  return null;
}

/* 전체(누적) 집계: 기간과 상관없이 저장된 모든 배정 */
function yajaStats() {
  const Y = S.yaja, st = {};
  const blank = () => Object.assign(blankCat(), { months: {}, dow: [0, 0, 0, 0, 0, 0, 0], dates: [] });
  Y.teachers.forEach(t => st[t.name] = blank());
  Object.keys(Y.assign).sort().forEach(iso => {
    if (Y.holidays[iso] !== undefined) return;
    (Y.assign[iso] || []).forEach(n => {
      const x = st[n] || (st[n] = blank());
      const c = catOf(iso), m = iso.slice(0, 7);
      x[c]++; x.tot++; x.dow[parseIso(iso).getDay()]++; x.dates.push(iso);
      const mm = x.months[m] || (x.months[m] = blankCat()); mm[c]++; mm.tot++;
    });
  });
  return st;
}
function statMonths(st) {
  const set = new Set(yajaMonths());
  Object.values(st).forEach(x => Object.keys(x.months).forEach(m => set.add(m)));
  return [...set].sort();
}
function catsUsed(st) {
  return CATS.filter(c => c.dows.some(d => Number(S.yaja.perDow[d]) > 0) || Object.values(st).some(x => x[c.k] > 0));
}
function cumulative(x, upto) {
  const r = blankCat();
  Object.entries(x.months).forEach(([m, v]) => { if (m <= upto) for (const k in r) r[k] += v[k]; });
  return r;
}

/* ---------- 자동 배정 ---------- */
function runYajaAssign() {
  const Y = S.yaja, days = yajaDays();
  const T = Y.teachers.filter(t => t.name);
  if (!T.length) { alert('야자 감독 교사를 먼저 추가하세요.'); return; }
  if (!days.length) { alert('기간과 요일별 인원을 설정하세요.'); return; }
  const names = T.map(t => t.name), byName = Object.fromEntries(T.map(t => [t.name, t]));
  const gap = Math.max(0, Number(Y.minGap) || 0);
  const rangeSet = new Set(yajaRange());
  const isLocked = iso => Y.locks[iso] && Y.assign[iso];
  const availOn = {}; days.forEach(iso => availOn[iso] = names.filter(n => !yajaUnavail(byName[n], iso)));
  const catDays = {}; days.forEach(iso => (catDays[catOf(iso)] = catDays[catOf(iso)] || []).push(iso));
  const cats = Object.keys(catDays);

  // 기간 밖(이전 · 이후 달)의 배정 = 누적 기록
  const base = {}, hist = {};
  names.forEach(n => { base[n] = blankCat(); hist[n] = []; });
  for (const [iso, arr] of Object.entries(Y.assign)) {
    if (rangeSet.has(iso) || Y.holidays[iso] !== undefined) continue;
    (arr || []).forEach(n => {
      if (!base[n]) return;
      hist[n].push(dnum(iso)); // 기간 경계에서 연속 배정 방지용
      if (Y.useHistory) { base[n][catOf(iso)]++; base[n].tot++; }
    });
  }

  let best = null;
  for (let trial = 0; trial < 60; trial++) {
    const A = {}, cnt = {}, dowc = {}, mine = {};
    names.forEach(n => { cnt[n] = { ...base[n] }; dowc[n] = [0, 0, 0, 0, 0, 0, 0]; mine[n] = hist[n].slice(); });
    const add = (n, iso) => { if (!cnt[n]) return; cnt[n][catOf(iso)]++; cnt[n].tot++; dowc[n][parseIso(iso).getDay()]++; mine[n].push(dnum(iso)); };
    const rem = (n, iso) => { if (!cnt[n]) return; cnt[n][catOf(iso)]--; cnt[n].tot--; dowc[n][parseIso(iso).getDay()]--; const i = mine[n].indexOf(dnum(iso)); if (i >= 0) mine[n].splice(i, 1); };
    const near = (n, iso) => { const x = dnum(iso); let s = 0; for (const d of mine[n]) { const df = Math.abs(d - x); if (df && df <= gap) s += gap + 1 - df; } return s; };

    days.forEach(iso => { if (isLocked(iso)) { A[iso] = Y.assign[iso].slice(); A[iso].forEach(n => add(n, iso)); } });
    const order = trial % 2 ? days.slice() : days.slice().sort((a, b) => availOn[a].length - availOn[b].length || (Math.random() - 0.5));
    for (const iso of order) {
      if (isLocked(iso)) continue;
      const need = yajaNeed(iso), c = catOf(iso), dw = parseIso(iso).getDay();
      A[iso] = [];
      for (let k = 0; k < need; k++) {
        const cands = availOn[iso].filter(n => !A[iso].includes(n));
        if (!cands.length) break;
        let bn = null, bs = Infinity;
        for (const n of cands) {
          const v = cnt[n][c] * 1000 + cnt[n].tot * 150 + near(n, iso) * 120 + dowc[n][dw] * 40 + Math.random() * 30;
          if (v < bs) { bs = v; bn = n; }
        }
        A[iso].push(bn); add(bn, iso);
      }
    }
    // 요일 구분별 균등화: 많이 맡은 교사 → 적게 맡은 교사
    for (const c of cats) {
      let changed = true, guard = 0;
      while (changed && guard++ < 1500) {
        changed = false;
        const mn = Math.min(...names.map(n => cnt[n][c]));
        const hiOrder = names.slice().sort((a, b) => cnt[b][c] - cnt[a][c]);
        outer: for (const hi of hiOrder) {
          if (cnt[hi][c] <= mn + 1) break;
          for (const iso of shuffle(catDays[c].slice())) {
            if (isLocked(iso) || !A[iso].includes(hi)) continue;
            const lo = availOn[iso].filter(n => !A[iso].includes(n) && cnt[n][c] <= cnt[hi][c] - 2)
              .sort((a, b) => cnt[a][c] - cnt[b][c] || cnt[a].tot - cnt[b].tot)[0];
            if (lo) { rem(hi, iso); A[iso][A[iso].indexOf(hi)] = lo; add(lo, iso); changed = true; break outer; }
          }
        }
      }
    }
    // 점수
    let unfilled = 0, sc = 0;
    days.forEach(iso => unfilled += Math.max(0, yajaNeed(iso) - (A[iso] || []).length));
    sc += unfilled * 1e6;
    const spread = key => { const v = names.map(n => cnt[n][key]); const m = v.reduce((a, b) => a + b, 0) / v.length; return { range: Math.max(...v) - Math.min(...v), vari: v.reduce((a, x) => a + (x - m) ** 2, 0) }; };
    cats.forEach(c => { const s = spread(c); sc += s.range * 1000 + s.vari * 10; });
    { const s = spread('tot'); sc += s.range * 300 + s.vari * 5; }
    names.forEach(n => {
      sc += dowc[n].reduce((a, v) => a + v * v, 0) * 2;
      const ds = mine[n].slice().sort((a, b) => a - b);
      for (let i = 1; i < ds.length; i++) { const df = ds[i] - ds[i - 1]; if (df <= gap) sc += (gap + 1 - df) * 30; }
    });
    if (!best || sc < best.sc) best = { sc, A, unfilled };
  }
  const newA = {};
  for (const [iso, arr] of Object.entries(Y.assign)) if (!rangeSet.has(iso)) newA[iso] = arr; // 다른 달 결과 유지
  days.forEach(iso => { newA[iso] = best.A[iso] || []; });
  const newL = {}; Object.keys(Y.locks).forEach(iso => { if (newA[iso]) newL[iso] = true; });
  Y.assign = newA; Y.locks = newL;
  save(); render();
  toast(best.unfilled ? `배정 완료 — 인원이 모자란 날 ${best.unfilled}자리 (빨간 표시 확인)` : '배정 완료!');
}

/* ---------- 화면 ---------- */
function renderYaja() {
  const Y = S.yaja, ui = S.ui;
  const wkUsed = Y.perDow[0] > 0 || Y.perDow[6] > 0;
  const showDows = wkUsed ? [1, 2, 3, 4, 5, 6, 0] : [1, 2, 3, 4, 5];
  const st = yajaStats();
  const cats = catsUsed(st);
  const hols = Object.keys(Y.holidays).sort();
  return `
  <section class="card">
    <h2>1. 기간 · 요일별 인원</h2>
    <p class="hint">한 달씩 기간을 정해 배정하면 <b>이전 달 결과는 그대로 저장</b>되고, 다음 달은 3월부터의 누적 횟수를 고려해 배정합니다.</p>
    <div class="row">
      <input type="month" id="ymMonth" value="${esc((Y.start || '').slice(0, 7))}">
      <button class="primary" data-act="y-month-set">이 달로 기간 설정</button>
      <span class="hint" style="margin:0">또는 아래에서 시작일 · 종료일을 직접 지정</span>
    </div>
    <div class="grid2">
      <label>제목<input data-path="yaja.title" value="${esc(Y.title)}"></label>
      <label>시작일<input type="date" data-path="yaja.start" value="${esc(Y.start)}" data-rerender></label>
      <label>종료일<input type="date" data-path="yaja.end" value="${esc(Y.end)}" data-rerender></label>
      <label>같은 교사 최소 간격 (이 일수 안에는 되도록 다시 배정하지 않음)<input type="number" min="0" max="14" data-type="num" data-path="yaja.minGap" value="${esc(Y.minGap)}"></label>
    </div>
    <label class="check"><input type="checkbox" data-path="yaja.useHistory" ${Y.useHistory ? 'checked' : ''}> 다른 달의 누적 횟수를 반영해 배정 (월~목 · 금 · 토 횟수를 연간 누적으로 맞춤)</label>
    <div class="row"><b>요일별 감독 인원</b> <span class="hint" style="margin:0">(0이면 야자 없는 요일)</span></div>
    <div class="dowgrid">${[1, 2, 3, 4, 5, 6, 0].map(d => `<label>${DOW[d]}<input type="number" min="0" max="10" data-type="num" data-path="yaja.perDow.${d}" value="${Y.perDow[d]}" data-rerender></label>`).join('')}</div>
    <div class="row"><b>야자 없는 날 (공휴일 · 시험기간 · 행사)</b></div>
    <div class="row">
      <input type="date" id="holDate"> <input id="holLabel" class="w160" placeholder="사유 예: 개교기념일">
      <button class="mini" data-act="y-hol-add">추가</button>
      <span class="hint" style="margin:0">또는 아래 달력에서 [야자 없는 날 지정] 모드로 날짜를 클릭</span>
    </div>
    <div class="chips">${hols.map(h => `<span class="chip tag">${md(h)}(${DOW[parseIso(h).getDay()]}) ${esc(Y.holidays[h] || '')}<b data-act="y-hol-del" data-iso="${h}">×</b></span>`).join('') || '<span class="hint">없음</span>'}</div>
    <label>하단 안내 문구 (엑셀에 표시)<textarea data-path="yaja.notes" rows="2">${esc(Y.notes)}</textarea></label>
  </section>

  <section class="card">
    <h2>2. 감독 교사 (학년부 담임) <small>${Y.teachers.length}명</small></h2>
    <p class="hint">불가 요일은 매주 반복되는 요일, 불가 날짜는 특정한 날입니다. 불가 날짜는 아래 달력의 [교사 불가일 지정] 모드에서 클릭으로 넣으면 편리합니다.</p>
    <div class="upload-box">
      <b>📂 엑셀 파일로 불러오기</b>
      <span class="hint" style="margin:0">학년부 명단 엑셀(.xlsx) · CSV에서 "성명/이름" 열을 자동으로 찾습니다.</span>
      <button class="accent" data-act="t-file-open">파일 선택</button>
      <input type="file" id="tFile" accept=".xlsx,.csv" data-act-change="t-file" style="display:none">
      <button data-act="y-add-paste">이름 직접 입력</button>
    </div>
    ${Y.teachers.length ? `<table class="list compact"><thead><tr><th>이름</th><th>불가 요일</th><th>불가 날짜</th><th style="width:170px">누적 횟수</th><th style="width:40px"></th></tr></thead><tbody>
    ${Y.teachers.map((t, ti) => {
      const x = st[t.name] || blankCat();
      return `<tr>
      <td><b>${esc(t.name)}</b></td>
      <td><div class="chips">${showDows.map(d => `<span class="chip dow ${t.offDow && t.offDow[d] ? 'on' : ''}" data-act="y-dow" data-ti="${ti}" data-d="${d}">${DOW[d]}</span>`).join('')}</div></td>
      <td><div class="chips">${(t.offDates || []).slice().sort().map(s => `<span class="chip tag">${md(s)}(${DOW[parseIso(s).getDay()]})<b data-act="y-off-del" data-ti="${ti}" data-iso="${s}">×</b></span>`).join('')}
        <input type="date" data-ti="${ti}" data-act-change="y-off-add" style="padding:1px 4px;font-size:12px"></div></td>
      <td><b>${x.tot}</b>회 <span class="hint">(${cats.map(c => c.label + ' ' + x[c.k]).join(' · ')})</span></td>
      <td><button class="mini danger" data-act="y-del" data-ti="${ti}">×</button></td></tr>`;
    }).join('')}
    </tbody></table>` : '<p class="hint">아직 추가된 교사가 없습니다.</p>'}
  </section>

  <section class="card">
    <h2>3. 배정 달력 <small>${validIso(Y.start) && validIso(Y.end) ? `${md(Y.start)} ~ ${md(Y.end)}` : ''}</small></h2>
    <div class="row">
      <button class="primary big" data-act="y-run">자동 배정 실행</button>
      <button class="accent big" data-act="y-export">엑셀로 내보내기</button>
      <button data-act="y-unlock">잠금 모두 해제</button>
      <button class="danger" data-act="y-clear">이 기간 결과 지우기</button>
    </div>
    <div class="mode-bar">
      <b>달력 클릭 모드:</b>
      <button class="${ui.yMode === 'edit' ? 'on' : ''}" data-act="y-mode" data-m="edit">감독 직접 수정</button>
      <button class="${ui.yMode === 'hol' ? 'on' : ''}" data-act="y-mode" data-m="hol">야자 없는 날 지정</button>
      <button class="${ui.yMode === 'off' ? 'on' : ''}" data-act="y-mode" data-m="off">교사 불가일 지정</button>
      ${ui.yMode === 'off' ? `<select data-path="ui.yOffTeacher">${'<option value="">교사 선택</option>' + Y.teachers.map(t => `<option ${t.name === ui.yOffTeacher ? 'selected' : ''}>${esc(t.name)}</option>`).join('')}</select><span class="hint" style="margin:0">빗금 = 불가일</span>` : ''}
    </div>
    ${renderYajaWarnings()}
    ${renderCalendar(showDows)}
  </section>

  ${renderYajaStats(st, cats)}
  ${renderCloud()}`;
}

/* ---------- 온라인 공유 (구글 시트) ---------- */
function renderCloud() {
  const C = S.yaja.cloud, p = C.lastPing;
  return `<section class="card" id="cloud" style="scroll-margin-top:140px">
    <h2>5. 온라인 공유 (구글 시트) <small>선생님들이 휴대폰으로 일정을 보고 서로 교체합니다</small></h2>
    <p class="hint">처음 한 번은 설치가 필요합니다 → 이 폴더의 <b>구글시트_설치안내.html</b>을 열어 순서대로 따라 하세요.<br>
    흐름: <b>[온라인 변경 내용 가져오기]</b>(선생님들 교체 반영) → 다음 달 자동 배정 → <b>[감독표 올리기]</b></p>
    <div class="grid2">
      <label>웹 앱 URL<input data-path="yaja.cloud.url" value="${esc(C.url)}" placeholder="https://script.google.com/macros/s/.../exec" data-rerender></label>
      <label>관리자 키<input type="password" data-path="yaja.cloud.key" value="${esc(C.key)}" placeholder="시트 메뉴 [야자 감독 → 관리자 키 보기]" data-rerender></label>
    </div>
    <div class="row">
      <button data-act="cl-ping" ${C.url && C.key ? '' : 'disabled'}>연결 확인</button>
      <button class="accent" data-act="cl-pull" ${C.url && C.key ? '' : 'disabled'}>온라인 변경 내용 가져오기</button>
      <button class="primary" data-act="cl-upload" ${C.url && C.key ? '' : 'disabled'}>감독표 올리기</button>
    </div>
    ${p ? `<div class="${p.ok ? 'okbox' : 'warnbox'}">${p.ok
      ? `연결됨 · 선생님 ${p.teachers}명 · 대기 중인 교체 요청 <b>${p.pending}</b>건 · 온라인 마지막 변경 ${esc(p.updated || '-')}`
        + (String(p.assignVersion) !== String(C.assignVersion) ? '<br>⚠ 온라인에서 감독표가 바뀌었습니다. <b>[온라인 변경 내용 가져오기]</b>를 먼저 하세요.' : '')
      : '⚠ ' + esc(p.msg)}</div>` : ''}
    ${C.lastSync ? `<p class="hint">마지막 동기화: ${esc(C.lastSync)}</p>` : ''}
    ${C.lastLog && C.lastLog.length ? `<details><summary class="hint">최근 온라인 변경 기록</summary><div class="hint">${C.lastLog.slice(0, 20).map(l => esc(l[0] + '  ' + l[1])).join('<br>')}</div></details>` : ''}
  </section>`;
}

async function cloudCall(body) {
  const C = S.yaja.cloud;
  C.url = C.url || ''; C.key = C.key || '';
  if (!/^https:\/\/script\.google(usercontent)?\.com\//.test(C.url.trim())) throw new Error('웹 앱 URL이 올바르지 않습니다. https://script.google.com/macros/s/.../exec 형태인지 확인하세요.');
  let res;
  try {
    res = await fetch(C.url.trim(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ ...body, key: C.key.trim() }) });
  } catch (e) { throw new Error('서버에 연결할 수 없습니다. 인터넷 연결과 웹 앱 URL, 배포 설정(액세스: 모든 사용자)을 확인하세요.'); }
  const text = await res.text();
  try { return JSON.parse(text); } catch (e) { throw new Error('웹 앱 응답을 읽을 수 없습니다. 배포 설정에서 [액세스 권한: 모든 사용자]인지 확인하세요.'); }
}
const nowStr = () => { const d = new Date(); return `${toIso(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

async function cloudPing(quiet) {
  const C = S.yaja.cloud;
  try { C.lastPing = await cloudCall({ action: 'ping' }); }
  catch (e) { C.lastPing = { ok: false, msg: e.message }; }
  save(); render();
  if (!quiet) toast(C.lastPing.ok ? '연결되었습니다.' : C.lastPing.msg);
  return C.lastPing;
}
ACTS['cl-ping'] = () => cloudPing();

ACTS['cl-pull'] = async () => {
  const C = S.yaja.cloud, Y = S.yaja;
  let r;
  try { r = await cloudCall({ action: 'pull' }); } catch (e) { alert(e.message); return; }
  if (!r.ok) { alert(r.msg); return; }
  let changed = 0;
  Object.entries(r.assign || {}).forEach(([iso, arr]) => {
    if ((Y.assign[iso] || []).join() !== arr.join()) changed++;
    Y.assign[iso] = arr;
  });
  // 교체된 날은 다시 자동 배정해도 바뀌지 않도록 잠금
  Object.keys(r.note || {}).forEach(iso => { Y.locks[iso] = true; });
  C.assignVersion = r.assignVersion; C.lastSync = nowStr(); C.lastLog = r.log || [];
  C.lastPing = Object.assign({}, C.lastPing || {}, { ok: true, assignVersion: r.assignVersion, pending: r.pending, teachers: (C.lastPing && C.lastPing.teachers) || Y.teachers.length });
  save(); render();
  toast(changed ? `온라인 변경 ${changed}일을 반영했습니다. (교체된 날은 🔒 잠금)` : '온라인과 같습니다. 바뀐 내용이 없습니다.');
};

ACTS['cl-upload'] = async () => {
  const C = S.yaja.cloud, Y = S.yaja;
  const assign = {};
  Object.entries(Y.assign).forEach(([iso, arr]) => { if (Y.holidays[iso] === undefined && arr && arr.length) assign[iso] = arr; });
  const n = Object.keys(assign).length;
  if (!n) { alert('올릴 감독표가 없습니다. 먼저 자동 배정을 실행하세요.'); return; }
  if (!confirm(`감독표 ${n}일치와 선생님 ${Y.teachers.length}명을 온라인에 올립니다. 진행할까요?`)) return;
  const data = { title: Y.title, notes: Y.notes, perDow: Y.perDow, holidays: Y.holidays, teachers: Y.teachers.map(t => t.name), assign };
  const send = force => cloudCall({ action: 'upload', baseVersion: C.assignVersion, force, data });
  let r;
  try {
    r = await send(false);
    if (!r.ok && r.code === 'conflict') {
      if (!C.assignVersion) {
        if (!confirm('이 컴퓨터에서 처음 올리는 것입니다. 온라인에 이미 감독표가 있다면 덮어씁니다. 계속할까요?\n(이전에 올린 적이 있다면 [취소] 후 [온라인 변경 내용 가져오기]를 먼저 하세요)')) return;
        r = await send(true);
      } else { alert(r.msg); return; }
    }
  } catch (e) { alert(e.message); return; }
  if (!r.ok) { alert(r.msg); return; }
  C.assignVersion = r.assignVersion; C.lastSync = nowStr();
  save();
  await cloudPing(true);
  toast('감독표를 올렸습니다.' + (r.invalidated ? ` (맞지 않게 된 교체 요청 ${r.invalidated}건은 무효 처리)` : ''));
};

function renderYajaWarnings() {
  const Y = S.yaja, w = [];
  if (!validIso(Y.start) || !validIso(Y.end)) w.push('기간(시작일 · 종료일)을 지정하세요.');
  else if (Y.start > Y.end) w.push('종료일이 시작일보다 빠릅니다.');
  const days = yajaDays();
  let short = 0;
  days.forEach(iso => { const a = Y.assign[iso]; if (a) short += Math.max(0, yajaNeed(iso) - a.length); });
  if (short) w.push(`인원이 모자란 자리가 <b>${short}</b>개 있습니다 (그 날 가능한 교사 부족).`);
  if (!w.length && days.length) {
    const total = days.reduce((a, iso) => a + yajaNeed(iso), 0);
    return `<div class="okbox">이 기간 운영일 <b>${days.length}</b>일 · 감독 자리 <b>${total}</b>개 · 교사 ${Y.teachers.length}명 · 1인 평균 약 <b>${(total / Math.max(1, Y.teachers.length)).toFixed(1)}</b>회</div>`;
  }
  return w.length ? `<div class="warnbox">${w.map(x => '⚠ ' + x).join('<br>')}</div>` : '';
}

function yajaMonths() {
  const ms = [];
  yajaRange().forEach(s => { const k = s.slice(0, 7); if (!ms.includes(k)) ms.push(k); });
  return ms;
}
/* 해당 월의 주 단위 배열 (showDows 순서) */
function monthWeeks(ym, showDows) {
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1), last = new Date(y, m, 0);
  const d = new Date(first); while (d.getDay() !== showDows[0]) d.setDate(d.getDate() - 1);
  const weeks = [];
  while (d <= last) {
    const wk = [];
    for (let i = 0; i < 7; i++) {
      if (showDows.includes(d.getDay())) wk.push(d.getMonth() === m - 1 ? toIso(d) : null);
      d.setDate(d.getDate() + 1);
    }
    if (wk.some(Boolean)) weeks.push(wk);
  }
  return weeks;
}

function renderCalendar(showDows) {
  const Y = S.yaja, ui = S.ui;
  const months = yajaMonths();
  if (!months.length) return '';
  const offT = ui.yMode === 'off' ? Y.teachers.find(t => t.name === ui.yOffTeacher) : null;
  return months.map(ym => {
    const [y, m] = ym.split('-').map(Number);
    let h = `<div class="cal-month"><h3>${y}년 ${m}월</h3><table class="cal"><thead><tr>${showDows.map(d => `<th class="${d === 0 ? 'sun' : d === 6 ? 'sat' : ''}">${DOW[d]}</th>`).join('')}</tr></thead><tbody>`;
    monthWeeks(ym, showDows).forEach(wk => {
      h += '<tr>' + wk.map(iso => {
        if (!iso || iso < Y.start || iso > Y.end) return `<td class="out">${iso ? parseIso(iso).getDate() : ''}</td>`;
        const hol = Y.holidays[iso], need = yajaNeed(iso), a = Y.assign[iso] || [], L = Y.locks[iso];
        const cls = [hol !== undefined ? 'hol' : (need ? '' : 'off'), L ? 'locked' : '', offT && yajaUnavail(offT, iso) ? 'tUnavail' : ''].join(' ');
        let inner = `<span class="dn"><span>${parseIso(iso).getDate()}</span><span>${L ? '🔒' : ''}</span></span>`;
        if (hol !== undefined) inner += `<span class="holl">${esc(hol || '야자 없음')}</span>`;
        else if (need) {
          inner += a.map(n => `<span class="nm">${esc(n)}</span>`).join('');
          if (Y.assign[iso] && a.length < need) inner += `<span class="miss">${need - a.length}명 부족</span>`;
        }
        return `<td class="${cls}" data-act="ycell" data-iso="${iso}">${inner}</td>`;
      }).join('') + '</tr>';
    });
    return h + '</tbody></table></div>';
  }).join('');
}

/* 월별 · 누적 집계표 */
function renderYajaStats(st, cats) {
  const Y = S.yaja, months = statMonths(st);
  if (!months.length || !Object.values(st).some(x => x.tot)) return '';
  let sel = S.ui.yStatMonth;
  if (!months.includes(sel)) sel = months.filter(m => m <= (Y.end || '9999').slice(0, 7)).pop() || months[months.length - 1];
  const first = months[0];
  const names = Y.teachers.map(t => t.name).concat(Object.keys(st).filter(n => !Y.teachers.some(t => t.name === n) && st[n].tot));
  const rows = names.map(n => ({ n, mon: (st[n].months[sel] || blankCat()), cum: cumulative(st[n], sel), gone: !Y.teachers.some(t => t.name === n) }));
  const keys = cats.map(c => c.k).concat('tot');
  const range = (pick, k) => { const v = rows.filter(r => !r.gone).map(r => pick(r)[k]); return v.length ? [Math.min(...v), Math.max(...v)] : [0, 0]; };
  const cell = (pick, r, k) => {
    const v = pick(r)[k], [mn, mx] = range(pick, k);
    const cls = r.gone || mn === mx ? '' : v === mx ? 'hi' : v === mn ? 'lo' : '';
    return `<td class="${cls} ${k === 'tot' ? 'tot' : ''}">${v}</td>`;
  };
  const head = cats.map(c => `<th>${c.label}</th>`).join('') + '<th>계</th>';
  return `<section class="card">
    <h2>4. 월별 · 누적 횟수 <small>요일 구분별로 따로 맞춥니다</small></h2>
    <div class="row">
      <b>기준 월</b>
      <select data-path="ui.yStatMonth">${months.map(m => `<option value="${m}" ${m === sel ? 'selected' : ''}>${m.slice(0, 4)}년 ${monthLabel(m)}</option>`).join('')}</select>
      <span class="hint" style="margin:0">누적 = ${monthLabel(first)}부터 ${monthLabel(sel)}까지 · <span class="legend hi">많은 편</span> <span class="legend lo">적은 편</span></span>
    </div>
    <div class="res-wrap"><table class="stat">
      <thead><tr><th rowspan="2">이름</th><th colspan="${cats.length + 1}">${monthLabel(sel)}</th><th colspan="${cats.length + 1}" class="cum">누적 (${monthLabel(first)}~${monthLabel(sel)})</th></tr>
      <tr>${head}${head.replace(/<th>/g, '<th class="cum">')}</tr></thead>
      <tbody>${rows.map(r => `<tr class="${r.gone ? 'gone' : ''}"><td class="nm">${esc(r.n)}${r.gone ? ' <small>(명단 제외)</small>' : ''}</td>
        ${keys.map(k => cell(x => x.mon, r, k)).join('')}${keys.map(k => cell(x => x.cum, r, k)).join('')}</tr>`).join('')}</tbody>
      <tfoot><tr><td>최소~최대</td>${keys.map(k => { const [a, b] = range(x => x.mon, k); return `<td>${a}~${b}</td>`; }).join('')}${keys.map(k => { const [a, b] = range(x => x.cum, k); return `<td>${a}~${b}</td>`; }).join('')}</tr></tfoot>
    </table></div>
  </section>`;
}

/* ---------- 달력 클릭 ---------- */
ACTS['ycell'] = el => {
  const Y = S.yaja, iso = el.dataset.iso, mode = S.ui.yMode;
  if (mode === 'hol') {
    if (Y.holidays[iso] !== undefined) delete Y.holidays[iso];
    else { const lb = prompt(`${fmtDate(iso)} — 야자가 없는 사유 (비워도 됨)`, ''); if (lb === null) return; Y.holidays[iso] = lb.trim(); delete Y.assign[iso]; delete Y.locks[iso]; }
    save(); render(); return;
  }
  if (mode === 'off') {
    const t = Y.teachers.find(x => x.name === S.ui.yOffTeacher);
    if (!t) { toast('먼저 교사를 선택하세요.'); return; }
    t.offDates = t.offDates || [];
    const i = t.offDates.indexOf(iso);
    if (i >= 0) t.offDates.splice(i, 1); else t.offDates.push(iso);
    save(); render(); return;
  }
  if (Y.holidays[iso] !== undefined || !yajaNeed(iso)) { toast('야자가 없는 날입니다. 요일별 인원이나 야자 없는 날 설정을 확인하세요.'); return; }
  openYajaEditor(iso);
};

function openYajaEditor(iso) {
  const Y = S.yaja, a = Y.assign[iso] || [], st = yajaStats(), need = yajaNeed(iso);
  const c = catOf(iso), cl = CATS.find(x => x.k === c).label;
  const list = Y.teachers.map(t => { const x = st[t.name] || blankCat(); return { n: t.name, why: yajaUnavail(t, iso), c: x[c], tot: x.tot }; })
    .sort((x, y) => (!!x.why - !!y.why) || x.c - y.c || x.tot - y.tot || koSort(x.n, y.n));
  openModal(`<h3>${fmtDate(iso)} 야자 감독 <small class="hint">필요 ${need}명</small></h3>
    <p class="hint">체크한 교사로 저장되고 🔒 잠금됩니다. 숫자는 누적 <b>${cl}</b> 횟수 / 전체 횟수입니다. 불가일인 교사도 필요하면 선택할 수 있습니다(빨간 배경).</p>
    <div class="pick-list">${list.map(x => `<label class="${x.why ? 'bad' : ''}"><input type="checkbox" class="ysel" value="${esc(x.n)}" ${a.includes(x.n) ? 'checked' : ''}>
      <span>${esc(x.n)}<small>${x.why ? esc(x.why) + ' · ' : ''}${cl} ${x.c}회 / 전체 ${x.tot}회</small></span></label>`).join('')}</div>
    <div class="row">
      <button class="primary" data-act="y-ed-save" data-iso="${iso}">저장</button>
      <button data-act="y-ed-unlock" data-iso="${iso}">🔓 잠금 해제</button>
      <span style="flex:1"></span><button data-act="modal-close">닫기</button>
    </div>`);
}
ACTS['y-ed-save'] = el => {
  const sel = [...document.querySelectorAll('.ysel:checked')].map(x => x.value);
  S.yaja.assign[el.dataset.iso] = sel; S.yaja.locks[el.dataset.iso] = true;
  save(); closeModal(); render();
};
ACTS['y-ed-unlock'] = el => { delete S.yaja.locks[el.dataset.iso]; save(); closeModal(); render(); };

/* ---------- 설정 동작 ---------- */
function yAddTeacher(n) {
  if (!n || S.yaja.teachers.some(t => t.name === n)) return false;
  S.yaja.teachers.push({ name: n, offDow: [false, false, false, false, false, false, false], offDates: [] });
  return true;
}
ACTS['y-month-set'] = () => {
  const v = document.getElementById('ymMonth').value;
  if (!/^\d{4}-\d{2}$/.test(v)) { toast('월을 선택하세요.'); return; }
  const [y, m] = v.split('-').map(Number);
  S.yaja.start = `${v}-01`; S.yaja.end = toIso(new Date(y, m, 0)); S.ui.yStatMonth = v;
  save(); render(); toast(`${m}월로 기간을 설정했습니다.`);
};
/* 엑셀 업로드 연결 (teacher-import.js) — 불가 요일 · 불가 날짜 · 지난 기록은 이름 기준으로 유지 */
function importHas(n) { return S.yaja.teachers.some(t => t.name === n); }
function applyTeacherImport(ok, replace) {
  const Y = S.yaja;
  if (replace) {
    if (Y.teachers.length && !confirm(`야자 감독 명단 ${Y.teachers.length}명을 ${ok.length}명으로 바꿀까요? (지난 배정 기록은 남습니다)`)) return false;
    const old = Object.fromEntries(Y.teachers.map(t => [t.name, t]));
    Y.teachers = [];
    ok.forEach(n => { if (old[n]) Y.teachers.push(old[n]); else yAddTeacher(n); });
  } else ok.forEach(yAddTeacher);
}
ACTS['y-add-paste'] = () => {
  const t = prompt('이름을 쉼표로 구분해 입력하세요 (예: 홍길동, 김철수)'); if (!t) return;
  let k = 0; parseNames(t).forEach(n => { if (yAddTeacher(n)) k++; });
  save(); render(); toast(`${k}명 추가`);
};
ACTS['y-del'] = el => { const t = S.yaja.teachers[+el.dataset.ti]; if (confirm(`${t.name} 선생님을 야자 감독 명단에서 뺄까요? (지난 배정 기록은 남습니다)`)) { S.yaja.teachers.splice(+el.dataset.ti, 1); save(); render(); } };
ACTS['y-dow'] = el => {
  const t = S.yaja.teachers[+el.dataset.ti]; t.offDow = t.offDow || [false, false, false, false, false, false, false];
  t.offDow[+el.dataset.d] = !t.offDow[+el.dataset.d]; save(); render();
};
ACTS['y-off-del'] = el => { const t = S.yaja.teachers[+el.dataset.ti]; t.offDates = (t.offDates || []).filter(x => x !== el.dataset.iso); save(); render(); };
ACTS['y-hol-add'] = () => {
  const d = document.getElementById('holDate').value; if (!validIso(d)) { toast('날짜를 선택하세요.'); return; }
  S.yaja.holidays[d] = document.getElementById('holLabel').value.trim(); delete S.yaja.assign[d]; delete S.yaja.locks[d];
  save(); render();
};
ACTS['y-hol-del'] = el => { delete S.yaja.holidays[el.dataset.iso]; save(); render(); };
ACTS['y-mode'] = el => { S.ui.yMode = el.dataset.m; save(); render(); };
ACTS['y-run'] = () => {
  const rs = new Set(yajaRange());
  const n = Object.keys(S.yaja.locks).filter(iso => rs.has(iso)).length;
  if (n && !confirm(`잠금된 ${n}일은 유지하고 나머지를 다시 배정합니다. 진행할까요?`)) return;
  runYajaAssign();
};
ACTS['y-unlock'] = () => { const rs = new Set(yajaRange()); Object.keys(S.yaja.locks).forEach(iso => { if (rs.has(iso)) delete S.yaja.locks[iso]; }); save(); render(); };
ACTS['y-clear'] = () => {
  if (!confirm(`현재 기간(${S.yaja.start} ~ ${S.yaja.end})의 배정 결과를 지울까요? 다른 달 결과는 유지됩니다.`)) return;
  yajaRange().forEach(iso => { delete S.yaja.assign[iso]; delete S.yaja.locks[iso]; });
  save(); render();
};
ACTS['y-export'] = () => exportYaja();
Object.assign(CHANGE_ACTS, {
  'y-off-add': el => {
    if (!validIso(el.value)) return;
    const t = S.yaja.teachers[+el.dataset.ti]; t.offDates = t.offDates || [];
    if (!t.offDates.includes(el.value)) t.offDates.push(el.value);
    save(); render();
  },
});

/* ---------- 엑셀 내보내기 (기간 내 월별 달력 + 월별·누적 집계) ---------- */
async function exportYaja() {
  if (!needExcelJS()) return;
  const Y = S.yaja, months = yajaMonths();
  if (!months.length) { alert('기간을 설정하세요.'); return; }
  const wkUsed = Y.perDow[0] > 0 || Y.perDow[6] > 0;
  const showDows = wkUsed ? [1, 2, 3, 4, 5, 6, 0] : [1, 2, 3, 4, 5];
  const maxNeed = Math.max(1, ...Y.perDow.map(Number));
  const wb = new ExcelJS.Workbook(), used = new Set();
  const N = showDows.length;

  months.forEach(ym => {
    const [y, m] = ym.split('-').map(Number);
    const ws = wb.addWorksheet(sheetName(`${m}월`, used), {
      pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1,
        margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 } },
    });
    for (let c = 1; c <= N; c++) ws.getColumn(c).width = 19;
    const t = ws.getCell(1, 1);
    t.value = `${y}년 ${m}월 ${Y.title}`; t.font = XL.font({ size: 18, bold: true }); t.alignment = XL.center;
    ws.mergeCells(1, 1, 1, N); ws.getRow(1).height = 34;
    showDows.forEach((d, i) => {
      const c = ws.getCell(2, i + 1);
      c.value = DOW[d]; c.font = XL.font({ bold: true, size: 12, color: { argb: d === 0 ? 'FFC00000' : d === 6 ? 'FF1F4E99' : 'FF000000' } });
      c.fill = XL.fill('FFD9D9D9'); c.alignment = XL.center; c.border = XL.thinAll;
    });
    ws.getRow(2).height = 22;
    let r = 3;
    monthWeeks(ym, showDows).forEach(wk => {
      wk.forEach((iso, i) => {
        const dc = ws.getCell(r, i + 1), nc = ws.getCell(r + 1, i + 1);
        dc.border = { top: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        nc.border = { bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        nc.alignment = XL.center; nc.font = XL.font({ size: 12, bold: true });
        dc.alignment = { horizontal: 'left', vertical: 'middle' };
        if (!iso) { dc.fill = nc.fill = XL.fill('FFF2F2F2'); return; }
        const dd = parseIso(iso), inRange = iso >= Y.start && iso <= Y.end;
        dc.value = `${dd.getMonth() + 1}/${dd.getDate()}`;
        dc.font = XL.font({ bold: true, color: { argb: dd.getDay() === 0 ? 'FFC00000' : dd.getDay() === 6 ? 'FF1F4E99' : 'FF000000' } });
        dc.fill = XL.fill('FFEDF2F9');
        if (!inRange) { nc.fill = XL.fill('FFF2F2F2'); return; }
        if (Y.holidays[iso] !== undefined) {
          nc.value = Y.holidays[iso] || '야자 없음'; nc.font = XL.font({ color: { argb: 'FFC00000' } }); nc.fill = XL.fill('FFFCE4E4');
        } else if (yajaNeed(iso)) {
          nc.value = (Y.assign[iso] || []).join('\n');
        } else nc.fill = XL.fill('FFF2F2F2');
      });
      ws.getRow(r).height = 18; ws.getRow(r + 1).height = Math.max(30, 20 * maxNeed + 8);
      r += 2;
    });
    String(Y.notes || '').split('\n').filter(x => x.trim()).forEach(line => {
      r++; const c = ws.getCell(r, 1); c.value = line.trim(); c.font = XL.font({ bold: true, color: { argb: 'FF0033CC' } });
    });
    ws.pageSetup.printArea = `A1:${colLetter(N)}${r}`;
  });

  buildYajaStatSheet(wb, used);
  const tag = months.length === 1 ? ` (${monthLabel(months[0])})` : ` (${monthLabel(months[0])}~${monthLabel(months[months.length - 1])})`;
  await saveWorkbook(wb, (Y.title || '야자 감독') + tag);
  toast('엑셀 파일을 저장했습니다.');
}

/* 월별 · 누적 집계 시트: 이름 | 3월(월~목,금,토,계) | 4월(...) | ... | 누적(...) */
function buildYajaStatSheet(wb, used) {
  const Y = S.yaja, st = yajaStats(), cats = catsUsed(st);
  const upto = (Y.end || '9999-12').slice(0, 7);
  const months = statMonths(st).filter(m => m <= upto);
  if (!months.length) return;
  const keys = cats.map(c => c.k).concat('tot'), labels = cats.map(c => c.label).concat('계');
  const W = keys.length;
  const ws = wb.addWorksheet(sheetName('월별·누적 횟수', used), {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 0 },
  });
  const lastCol = 2 + W * (months.length + 1);
  const t = ws.getCell(1, 1);
  t.value = `${Y.title} — 월별 · 누적 횟수 (${monthLabel(months[0])}~${monthLabel(months[months.length - 1])})`;
  t.font = XL.font({ size: 14, bold: true }); ws.mergeCells(1, 1, 1, lastCol);
  const hdr = (r, c, v, fill) => { const x = ws.getCell(r, c); x.value = v; x.font = XL.font({ bold: true }); x.fill = XL.fill(fill); x.alignment = XL.center; x.border = XL.thinAll; };
  hdr(2, 1, '번호', 'FFD9D9D9'); hdr(3, 1, '', 'FFD9D9D9'); ws.mergeCells(2, 1, 3, 1);
  hdr(2, 2, '이름', 'FFD9D9D9'); hdr(3, 2, '', 'FFD9D9D9'); ws.mergeCells(2, 2, 3, 2);
  const groups = months.map(m => ({ label: monthLabel(m), m, cum: false })).concat({ label: `누적 (${monthLabel(months[0])}~${monthLabel(months[months.length - 1])})`, m: months[months.length - 1], cum: true });
  groups.forEach((g, gi) => {
    const c0 = 3 + gi * W, fill = g.cum ? 'FFFFE699' : 'FFD9D9D9';
    for (let k = 0; k < W; k++) { hdr(2, c0 + k, k ? '' : g.label, fill); hdr(3, c0 + k, labels[k], g.cum ? 'FFFFF2CC' : 'FFF2F2F2'); }
    ws.mergeCells(2, c0, 2, c0 + W - 1);
  });
  const names = Y.teachers.map(t => t.name).concat(Object.keys(st).filter(n => !Y.teachers.some(t => t.name === n) && st[n].tot));
  names.forEach((n, i) => {
    const r = 4 + i, x = st[n];
    const vals = [i + 1, n + (Y.teachers.some(t => t.name === n) ? '' : ' (명단 제외)')];
    groups.forEach(g => { const src = g.cum ? cumulative(x, g.m) : (x.months[g.m] || blankCat()); keys.forEach(k => vals.push(src[k])); });
    const row = ws.getRow(r); row.values = vals;
    row.eachCell((cell, c) => {
      cell.font = XL.font({ bold: c > 2 && (c - 3) % W === W - 1 }); cell.alignment = XL.center; cell.border = XL.thinAll;
      if (c >= 3 + months.length * W) cell.fill = XL.fill('FFFFFBEA');
    });
  });
  ws.getColumn(1).width = 6; ws.getColumn(2).width = 12;
  for (let c = 3; c <= lastCol; c++) ws.getColumn(c).width = 6.5;
  ws.views = [{ state: 'frozen', xSplit: 2, ySplit: 3 }];
}
