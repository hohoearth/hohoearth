/* ② 정기고사 감독 배정 */
const ROLE_LABEL = { main: '정', sub: '부', hall: '복도' };

function getPG(p, gi) {
  if (!p.grades) p.grades = [];
  if (!p.grades[gi]) p.grades[gi] = { subject: '', setters: '', sub: false, hall: 1, roomsOn: {} };
  return p.grades[gi];
}
/* 고사실 상태: 0=사용 안 함, 1=과목1, 2=과목2, 3=과목1·2 동시(한 교실에서 두 과목을 함께 치름)
   과목2가 있으면 특별실은 기본으로 과목2, 일반 교실은 과목1 */
const ROOM_STATE = {
  0: { tag: '', name: '사용 안 함' },
  1: { tag: '①', name: '과목1' },
  2: { tag: '②', name: '과목2' },
  3: { tag: '①②', name: '과목1·2 동시' },
};
function roomState(pg, r) {
  const two = !!(pg.subject2 || '').trim();
  let v = pg.rs ? pg.rs[r.name] : undefined;
  if (v === undefined && pg.roomsOn && pg.roomsOn[r.name] !== undefined) v = pg.roomsOn[r.name] ? 1 : 0;
  if (v === undefined) v = r.special ? (two ? 2 : 0) : 1;
  if ((v === 2 || v === 3) && !two) v = (v === 3 || !r.special) ? 1 : 0;
  return v;
}
function roomOn(pg, r) { return roomState(pg, r) > 0; }
function roomSubject(pg, r) {
  const st = roomState(pg, r);
  const s1 = (pg.subject || '').trim(), s2 = (pg.subject2 || '').trim();
  if (st === 3) {
    // 두 과목을 한 교실에서 동시에: 두 과목 출제교사 모두 제외, 부감독은 어느 한 과목이라도 필요하면 배치
    const setters = [...new Set([...parseNames(pg.setters), ...parseNames(pg.setters2)])];
    return { subject: [s1, s2].filter(Boolean).join('+'), setters, sub: !!(pg.sub || pg.sub2), n: 3 };
  }
  if (st === 2) return { subject: s2, setters: parseNames(pg.setters2), sub: !!pg.sub2, n: 2 };
  if (st === 1) return { subject: s1, setters: parseNames(pg.setters), sub: !!pg.sub, n: 1 };
  return null;
}
function hasExam(pg) { return !!((pg.subject || '').trim() || (pg.subject2 || '').trim()); }
function subjectLabel(pg, g) {
  const s1 = (pg.subject || '').trim(), s2 = (pg.subject2 || '').trim();
  if (!s2) return s1 || '자습';
  const roomsOf = st => g.rooms.filter(r => roomState(pg, r) === st).map(r => r.name);
  const r1 = roomsOf(1), r2 = roomsOf(2), r3 = roomsOf(3);
  const lines = [];
  const regular = g.rooms.filter(r => !r.special).map(r => r.name);
  const allRegular = r1.length === regular.length && r1.every(n => regular.includes(n)); // 일반 교실 전체면 교실 이름 생략
  if (s1 && r1.length) lines.push(allRegular ? s1 : `${s1}(${r1.join(',')})`);
  if (r2.length) lines.push(`${s2}(${r2.join(',')})`);
  if (r3.length) lines.push(`${s1 ? s1 + '+' : ''}${s2} 동시(${r3.join(',')})`);
  return lines.join('\n') || (s1 || s2);
}
function settersLabel(pg) {
  const s1 = (pg.subject || '').trim(), s2 = (pg.subject2 || '').trim();
  const a = parseNames(pg.setters).join(', '), b = parseNames(pg.setters2).join(', ');
  if (!s2) return a || '-';
  return [s1 ? `${s1}: ${a || '-'}` : '', `${s2}: ${b || '-'}`].filter(Boolean).join(' / ');
}
function hallCount(pg, g) { return Math.max(0, Math.min(Number(pg.hall ?? 1) || 0, Math.max(1, g.rooms.length))); }
function hallSegments(n, h) { const base = Math.floor(n / h), extra = n % h; return Array.from({ length: h }, (_, i) => base + (i < extra ? 1 : 0)); }

/* 모든 감독 칸 목록 */
function examSlots() {
  const E = S.exam, slots = [];
  E.days.forEach((d, di) => d.periods.forEach((p, pi) => E.grades.forEach((g, gi) => {
    const pg = getPG(p, gi);
    const base = { d, di, p, pi, g, gi };
    g.rooms.forEach(r => {
      const rs = roomSubject(pg, r);
      if (!rs || !rs.subject) return;
      // 출제교사 제외는 그 고사실에서 치르는 과목 기준
      slots.push({ ...base, setters: rs.setters, key: `${d.id}|${pi}|${gi}|main|${r.name}`, role: 'main', room: r });
      if (rs.sub) slots.push({ ...base, setters: rs.setters, key: `${d.id}|${pi}|${gi}|sub|${r.name}`, role: 'sub', room: r });
    });
    const allSetters = [...new Set([...parseNames(pg.setters), ...parseNames(pg.setters2)])];
    for (let h = 0; h < hallCount(pg, g); h++) slots.push({ ...base, setters: allSetters, key: `${d.id}|${pi}|${gi}|hall|${h}`, role: 'hall', room: null, hallIdx: h });
  })));
  return slots;
}
function slotLabel(s) {
  return `${fmtDate(s.d.date) || (s.di + 1) + '일차'} ${s.p.label} · ${s.g.name} ${s.role === 'hall' ? '복도' + (s.hallIdx + 1) : s.room.name + ' ' + ROLE_LABEL[s.role] + '감독'}`;
}
function absentInfo(d, name, pi) {
  return (d.absences || []).find(a => a.teacher === name && !(a.periods && a.periods[pi] === false));
}
/* 배정 불가 사유 (없으면 null) */
function ineligibleReason(name, s) {
  const t = S.teachers.find(x => x.name === name);
  if (t && t.exclude) return '감독 제외';
  const a = absentInfo(s.d, name, s.pi);
  if (a) return '복무' + (a.reason ? `: ${a.reason}` : '');
  if (s.role !== 'hall') {
    if (s.room.homeroom === name) return '담임 학급';
    if (s.setters.includes(name)) return '해당 과목 출제';
  }
  return null;
}

function examCounts(slots) {
  const A = S.exam.assign, c = {};
  S.teachers.forEach(t => c[t.name] = { main: 0, sub: 0, hall: 0, total: 0, days: {} });
  slots.forEach(s => {
    const n = A[s.key]; if (!n) return;
    if (!c[n]) c[n] = { main: 0, sub: 0, hall: 0, total: 0, days: {} };
    c[n][s.role]++; c[n].total++; c[n].days[s.d.id] = (c[n].days[s.d.id] || 0) + 1;
  });
  return c;
}

/* ---------- 자동 배정 알고리즘 ---------- */
function runExamAssign() {
  const E = S.exam, slots = examSlots();
  const names = S.teachers.filter(t => !t.exclude).map(t => t.name);
  if (!names.length) { alert('먼저 [① 교사 명단]에 교사를 등록하세요.'); return; }
  if (!slots.length) { alert('배정할 감독 칸이 없습니다. 시험 일정과 과목을 입력하세요.'); return; }
  const locks = E.locks, prev = E.assign, setterHall = !!E.options.setterHall;
  slots.forEach(s => { s.elig = names.filter(n => !ineligibleReason(n, s)); });
  const groups = new Map();
  slots.forEach(s => { const k = s.d.id + '|' + s.pi; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(s); });
  const isLocked = s => locks[s.key] && prev[s.key];

  let best = null;
  const TRIALS = 40;
  for (let trial = 0; trial < TRIALS; trial++) {
    const A = {}, cnt = {}, role = {}, dayc = {};
    names.forEach(n => { cnt[n] = 0; role[n] = { main: 0, sub: 0, hall: 0 }; dayc[n] = {}; });
    const add = (n, s) => { if (cnt[n] === undefined) return; cnt[n]++; role[n][s.role]++; dayc[n][s.d.id] = (dayc[n][s.d.id] || 0) + 1; };
    const rem = (n, s) => { if (cnt[n] === undefined) return; cnt[n]--; role[n][s.role]--; dayc[n][s.d.id]--; };
    slots.forEach(s => { if (isLocked(s)) { A[s.key] = prev[s.key]; add(prev[s.key], s); } });
    const score = (n, s) => cnt[n] * 1000 + (dayc[n][s.d.id] || 0) * 60 + role[n][s.role] * 15 + Math.random() * 12;

    for (const gs of groups.values()) {
      const busy = new Set(gs.filter(s => A[s.key]).map(s => A[s.key]));
      const pri = s => (setterHall && s.role === 'hall' && s.setters.some(n => s.elig.includes(n)) ? -1000 : 0) + s.elig.length;
      const open = shuffle(gs.filter(s => !A[s.key])).sort((a, b) => pri(a) - pri(b));
      for (const s of open) {
        let cands = s.elig.filter(n => !busy.has(n));
        if (setterHall && s.role === 'hall') { const sc = cands.filter(n => s.setters.includes(n)); if (sc.length) cands = sc; }
        if (cands.length) {
          let bn = null, bs = Infinity;
          for (const n of cands) { const v = score(n, s); if (v < bs) { bs = v; bn = n; } }
          A[s.key] = bn; busy.add(bn); add(bn, s);
          continue;
        }
        // 빈 사람이 없으면: 같은 교시의 다른 칸 교사를 이 칸으로 옮기고, 그 칸은 남는 교사로 채움
        let done = false;
        for (const n of shuffle(s.elig.slice())) {
          const s2 = gs.find(x => A[x.key] === n && !isLocked(x));
          if (!s2) continue;
          const m = s2.elig.filter(x => !busy.has(x)).sort((a, b) => cnt[a] - cnt[b])[0];
          if (!m) continue;
          rem(n, s2); A[s2.key] = m; add(m, s2); busy.add(m);
          A[s.key] = n; add(n, s); done = true; break;
        }
        if (!done) A[s.key] = '';
      }
    }

    // 균등화: 많이 맡은 교사의 칸을 적게 맡은 교사에게 넘김
    const busyOf = s => new Set(groups.get(s.d.id + '|' + s.pi).map(x => A[x.key]).filter(Boolean));
    let changed = true, guard = 0;
    while (changed && guard++ < 3000) {
      changed = false;
      const order = names.slice().sort((a, b) => cnt[b] - cnt[a]);
      outer: for (const hi of order) {
        for (const s of slots) {
          if (A[s.key] !== hi || isLocked(s)) continue;
          if (setterHall && s.role === 'hall' && s.setters.includes(hi)) continue;
          const busy = busyOf(s);
          const lo = s.elig.filter(n => !busy.has(n) && cnt[n] <= cnt[hi] - 2).sort((a, b) => cnt[a] - cnt[b])[0];
          if (lo) { rem(hi, s); A[s.key] = lo; add(lo, s); changed = true; break outer; }
        }
        if (cnt[hi] <= Math.min(...names.map(n => cnt[n])) + 1) break;
      }
    }
    // 점수
    const vals = names.map(n => cnt[n]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const unfilled = slots.filter(s => !A[s.key]).length;
    let sc = unfilled * 1e6 + (Math.max(...vals) - Math.min(...vals)) * 1000;
    names.forEach(n => {
      sc += (cnt[n] - mean) ** 2;
      Object.values(dayc[n]).forEach(v => sc += v * v * 0.5);
      const r = role[n]; sc += ((r.main - r.sub) ** 2 + (r.main - r.hall) ** 2) * 0.05;
    });
    if (!best || sc < best.sc) best = { sc, A, unfilled };
  }
  const newA = {};
  slots.forEach(s => { newA[s.key] = best.A[s.key] || ''; });
  E.assign = newA;
  const newLocks = {}; slots.forEach(s => { if (locks[s.key]) newLocks[s.key] = true; }); E.locks = newLocks;
  save(); render();
  toast(best.unfilled ? `배정 완료 — 미배정 ${best.unfilled}칸 (빨간 칸 확인)` : '배정 완료!');
}

/* ---------- 화면 ---------- */
function renderExam() {
  const E = S.exam;
  return `
  <section class="card">
    <h2>1. 기본 설정</h2>
    <div class="grid2">
      <label>시간표 제목<input data-path="exam.title" value="${esc(E.title)}"></label>
      <label>학교명 (엑셀 오른쪽 위)<input data-path="exam.school" value="${esc(E.school)}"></label>
    </div>
    <label>하단 안내 문구 (엑셀 아래에 표시, 줄바꿈으로 구분)<textarea data-path="exam.notes" rows="3">${esc(E.notes)}</textarea></label>
    <label class="check"><input type="checkbox" data-path="exam.options.setterHall" ${E.options.setterHall ? 'checked' : ''}> 출제교사를 해당 학년 복도감독에 우선 배정 (출제교사 복도대기)</label>
  </section>

  <section class="card">
    <h2>2. 학년 · 고사실 · 담임</h2>
    <p class="hint">담임교사는 <b>자기 반 감독에서 자동 제외</b>됩니다. 특별실(온누리교실, 학습도움실 등)은 기본으로 꺼져 있고 시험 일정에서 교시별로 켤 수 있습니다.</p>
    <div class="grades">${E.grades.map(renderGradeEditor).join('')}</div>
    <button data-act="g-add">+ 학년 추가</button>
  </section>

  <section class="card">
    <h2>3. 시험 일정 · 출제교사 · 복무</h2>
    <p class="hint">과목을 비워 두면 <b>자습</b>으로 처리되어 학급 감독을 배정하지 않습니다. 출제교사는 해당 학년 고사실 감독에서 제외됩니다.
    고사실 칩을 클릭해 그 교시에 쓰는 교실을 켜고 끌 수 있습니다. 복무(출장·연가 등) 교사는 체크된 교시에서 제외됩니다.<br>
    <b>같은 시간에 두 과목을 따로 치를 때</b>(예: 1~6반은 통합사회, 온누리교실은 지구과학): <b>[+ 동시 과목]</b>을 눌러 과목2와 출제교사를 입력하세요. 특별실은 자동으로 과목2가 되며, 고사실 칩을 클릭해
    <b>①과목1 → ②과목2 → ①②동시(한 교실에서 두 과목) → 끔</b> 순서로 바꿀 수 있습니다.
    모든 반이 함께 치르는 두 과목(예: 정치/화학)은 과목 칸에 그대로 "정치/화학"처럼 쓰면 됩니다.</p>
    ${E.days.map(renderDayEditor).join('')}
    <button class="primary" data-act="d-add">+ 시험일 추가</button>
  </section>

  <section class="card">
    <h2>4. 배정 결과</h2>
    <div class="row">
      <button class="primary big" data-act="ex-run">자동 배정 실행</button>
      <button class="accent big" data-act="ex-export">엑셀로 내보내기</button>
      <button data-act="ex-unlock">잠금 모두 해제</button>
      <button class="danger" data-act="ex-clear">결과 지우기</button>
    </div>
    <p class="hint">칸을 클릭하면 교사를 직접 바꿀 수 있습니다. 직접 바꾼 칸은 🔒 잠금되어 다시 자동 배정해도 그대로 유지됩니다.</p>
    ${renderExamWarnings()}
    ${E.days.map(renderDayResult).join('')}
    ${renderExamCounts()}
  </section>`;
}

function renderGradeEditor(g, gi) {
  return `<div class="grade-box">
    <div class="row"><input class="w120" data-path="exam.grades.${gi}.name" value="${esc(g.name)}" data-rerender>
      <span class="hint" style="margin:0">${g.rooms.length}실</span>
      <button class="mini danger" data-act="g-del" data-gi="${gi}">학년 삭제</button></div>
    <table class="list compact"><thead><tr><th>고사실</th><th>담임</th><th>특별실</th><th style="width:70px"></th></tr></thead><tbody>
    ${g.rooms.map((r, ri) => `<tr>
      <td><input class="w100" data-path="exam.grades.${gi}.rooms.${ri}.name" value="${esc(r.name)}" data-rerender></td>
      <td><select data-path="exam.grades.${gi}.rooms.${ri}.homeroom">${teacherOptions(r.homeroom, '(없음)')}</select></td>
      <td><input type="checkbox" data-path="exam.grades.${gi}.rooms.${ri}.special" ${r.special ? 'checked' : ''}></td>
      <td><button class="mini" data-act="r-up" data-gi="${gi}" data-ri="${ri}" title="위로">↑</button>
          <button class="mini danger" data-act="r-del" data-gi="${gi}" data-ri="${ri}" title="삭제">×</button></td></tr>`).join('')}
    </tbody></table>
    <button class="mini" data-act="r-add" data-gi="${gi}">+ 고사실 추가</button>
  </div>`;
}

function renderDayEditor(d, di) {
  const E = S.exam, P = `exam.days.${di}`;
  return `<div class="day-box">
    <div class="day-head">
      <span class="dlabel">${di + 1}일차</span>
      <input type="date" data-path="${P}.date" value="${esc(d.date || '')}" data-rerender>
      <b>${fmtDate(d.date)}</b>
      <button class="mini" data-act="p-add" data-di="${di}">+ 교시 추가</button>
      <button class="mini" data-act="d-copy" data-di="${di}">이 날 복제</button>
      <button class="mini danger" data-act="d-del" data-di="${di}">시험일 삭제</button>
    </div>
    ${d.periods.map((p, pi) => `<div class="period-box">
      <div class="period-head">
        <input class="w80" data-path="${P}.periods.${pi}.label" value="${esc(p.label)}" data-rerender>
        <textarea class="time" data-path="${P}.periods.${pi}.time" placeholder="예비령, 준비령, 시험시간 (줄바꿈)">${esc(p.time || '')}</textarea>
        <button class="mini danger" data-act="p-del" data-di="${di}" data-pi="${pi}">교시 삭제</button>
      </div>
      <table class="list compact pg"><thead><tr><th style="width:60px">학년</th><th>과목 (비우면 자습)</th><th>출제교사 (쉼표로 구분)</th><th style="width:56px">부감독</th><th style="width:60px">복도</th><th>사용 고사실</th></tr></thead><tbody>
      ${E.grades.map((g, gi) => {
        const pg = getPG(p, gi), B = `${P}.periods.${pi}.grades.${gi}`;
        const bad = parseNames(pg.setters).filter(n => !hasTeacher(n));
        const bad2 = parseNames(pg.setters2).filter(n => !hasTeacher(n));
        const has1 = !!(pg.subject || '').trim(), two = pg.two || !!(pg.subject2 || '').trim();
        const chips = g.rooms.map(r => {
          const st = roomState(pg, r), tag = two ? ROOM_STATE[st].tag : '';
          return `<span class="chip ${st ? 'on' : ''} ${st >= 2 ? 's' + st : ''} ${r.special ? 'sp' : ''}" title="${ROOM_STATE[st].name} (클릭해서 변경)" data-act="room-tog" data-di="${di}" data-pi="${pi}" data-gi="${gi}" data-room="${esc(r.name)}">${tag ? `<b class="ctag">${tag}</b>` : ''}${esc(r.name)}</span>`;
        }).join('');
        const legend = two ? `<div class="chip-legend">클릭할 때마다 바뀜:
          <span class="chip on">①과목1</span>→<span class="chip on s2">②과목2</span>→<span class="chip on s3">①②동시</span>→<span class="chip">끔</span>
          <br><span class="hint" style="margin:0">동시 = 한 교실에서 두 과목을 함께 치름 (두 과목 출제교사 모두 제외)</span></div>` : '';
        let row = `<tr>
          <td rowspan="${two ? 2 : 1}">${esc(g.name)}</td>
          <td><input data-path="${B}.subject" value="${esc(pg.subject)}" placeholder="자습" data-rerender>
            ${two ? '' : `<button class="mini" data-act="s2-add" data-di="${di}" data-pi="${pi}" data-gi="${gi}" title="같은 시간에 다른 과목을 특별실 등에서 동시에 치를 때">+ 동시 과목</button>`}</td>
          <td><input data-path="${B}.setters" value="${esc(pg.setters)}" data-rerender class="${bad.length ? 'warn' : ''}" title="${bad.length ? '명단에 없는 이름: ' + esc(bad.join(', ')) : ''}"></td>
          <td style="text-align:center"><input type="checkbox" data-path="${B}.sub" ${pg.sub ? 'checked' : ''} ${has1 ? '' : 'disabled'}></td>
          <td rowspan="${two ? 2 : 1}"><input type="number" min="0" max="6" class="w50" data-type="num" data-path="${B}.hall" value="${pg.hall ?? 1}" data-rerender></td>
          <td rowspan="${two ? 2 : 1}"><div class="chips ${hasExam(pg) ? '' : 'dim'}">${chips}</div>
            ${legend}</td>
        </tr>`;
        if (two) row += `<tr class="s2row">
          <td><span class="s2tag">②</span><input data-path="${B}.subject2" value="${esc(pg.subject2 || '')}" placeholder="동시 과목2 (예: 지구과학)" data-rerender style="width:calc(100% - 26px)"></td>
          <td><input data-path="${B}.setters2" value="${esc(pg.setters2 || '')}" placeholder="과목2 출제교사" data-rerender class="${bad2.length ? 'warn' : ''}" title="${bad2.length ? '명단에 없는 이름: ' + esc(bad2.join(', ')) : ''}"></td>
          <td style="text-align:center"><input type="checkbox" data-path="${B}.sub2" ${pg.sub2 ? 'checked' : ''} ${(pg.subject2 || '').trim() ? '' : 'disabled'}>
            <button class="mini danger" data-act="s2-del" data-di="${di}" data-pi="${pi}" data-gi="${gi}" title="동시 과목 삭제">×</button></td>
        </tr>`;
        return row;
      }).join('')}
      </tbody></table>
    </div>`).join('')}
    <div class="abs-box">
      <b>복무 (출장 · 연가 · 특별휴가 · 비출근일 등)</b>
      ${(d.absences || []).map((a, ai) => `<div class="row abs">
        <select data-path="${P}.absences.${ai}.teacher">${teacherOptions(a.teacher)}</select>
        ${d.periods.map((p, pi) => `<label class="check"><input type="checkbox" data-path="${P}.absences.${ai}.periods.${pi}" ${a.periods && a.periods[pi] === false ? '' : 'checked'}>${esc(p.label)}</label>`).join('')}
        <input class="w160" data-path="${P}.absences.${ai}.reason" value="${esc(a.reason || '')}" placeholder="사유 예: 출장(10.15)">
        <button class="mini danger" data-act="a-del" data-di="${di}" data-ai="${ai}">×</button>
      </div>`).join('')}
      <button class="mini" data-act="a-add" data-di="${di}">+ 복무 교사 추가</button>
    </div>
  </div>`;
}

function renderExamWarnings() {
  const E = S.exam, w = [];
  if (!S.teachers.length) w.push('교사 명단이 비어 있습니다. [① 교사 명단]에서 먼저 등록하세요.');
  if (!E.days.length) w.push('시험일을 추가하세요.');
  E.days.forEach((d, di) => {
    if (!validIso(d.date)) w.push(`${di + 1}일차 날짜가 비어 있습니다.`);
    d.periods.forEach(p => E.grades.forEach((g, gi) => {
      const pg = getPG(p, gi);
      const bad = parseNames(pg.setters).concat(parseNames(pg.setters2)).filter(n => !hasTeacher(n));
      if ((pg.subject2 || '').trim() && !g.rooms.some(r => roomState(pg, r) >= 2))
        w.push(`${di + 1}일차 ${esc(p.label)} ${esc(g.name)}: 동시 과목 '${esc(pg.subject2)}'을(를) 치를 고사실이 지정되지 않았습니다 (고사실 칩 클릭).`);
      if (bad.length) w.push(`${di + 1}일차 ${esc(p.label)} ${esc(g.name)}: 명단에 없는 출제교사 이름 — ${esc(bad.join(', '))}`);
    }));
  });
  const slots = examSlots();
  const ran = slots.some(s => S.exam.assign[s.key] !== undefined);
  const empty = slots.filter(s => ran && !S.exam.assign[s.key]).length;
  if (empty) w.push(`<b>미배정 ${empty}칸</b>이 있습니다. 감독 가능한 교사가 부족한 교시입니다 (복무 · 출제 · 담임 제외 후 인원 부족).`);
  const avail = S.teachers.filter(t => !t.exclude).length;
  const byPeriod = new Map(); slots.forEach(s => { const k = s.d.id + '|' + s.pi; byPeriod.set(k, (byPeriod.get(k) || 0) + 1); });
  E.days.forEach((d, di) => d.periods.forEach((p, pi) => {
    const need = byPeriod.get(d.id + '|' + pi) || 0;
    const absent = S.teachers.filter(t => !t.exclude && absentInfo(d, t.name, pi)).length;
    if (need > avail - absent) w.push(`${di + 1}일차 ${esc(p.label)}: 필요한 감독 ${need}명 > 가능한 교사 ${avail - absent}명`);
  }));
  if (!w.length) return slots.length ? `<div class="okbox">감독 칸 총 <b>${slots.length}</b>개 · 감독 가능 교사 <b>${avail}</b>명 · 1인 평균 약 <b>${(slots.length / Math.max(1, avail)).toFixed(1)}</b>회</div>` : '';
  return `<div class="warnbox">${w.map(x => '⚠ ' + x).join('<br>')}</div>`;
}

function cellHtml(key, extra = '') {
  const A = S.exam.assign, n = A[key], L = S.exam.locks[key];
  if (n === undefined) return `<td class="c ${extra}" data-act="pick" data-key="${esc(key)}"></td>`;
  if (!n) return `<td class="c empty" data-act="pick" data-key="${esc(key)}">미배정</td>`;
  return `<td class="c ${extra} ${L ? 'locked' : ''}" data-act="pick" data-key="${esc(key)}">${esc(n)}${L ? ' 🔒' : ''}</td>`;
}

function renderDayResult(d, di) {
  const E = S.exam;
  let h = `<div class="res-wrap"><h3>${fmtDate(d.date) || (di + 1) + '일차'}</h3><table class="res"><thead><tr><th rowspan="2">교시</th><th rowspan="2">구분</th>`;
  E.grades.forEach(g => h += `<th colspan="${g.rooms.length + 1}">${esc(g.name)}</th>`);
  h += '</tr><tr>';
  E.grades.forEach(g => { h += '<th>과목</th>' + g.rooms.map(r => `<th>${esc(r.name)}</th>`).join(''); });
  h += '</tr></thead><tbody><tr class="hr"><td></td><td>제외</td>';
  E.grades.forEach(g => { h += '<td>담임</td>' + g.rooms.map(r => `<td>${esc(r.homeroom || '-')}</td>`).join(''); });
  h += '</tr>';
  d.periods.forEach((p, pi) => {
    ['main', 'sub'].forEach(role => {
      h += '<tr>';
      if (role === 'main') h += `<td rowspan="4" class="plabel">${esc(p.label)}\n${esc(p.time || '')}</td>`;
      h += `<td>${ROLE_LABEL[role]}</td>`;
      E.grades.forEach((g, gi) => {
        const pg = getPG(p, gi);
        if (role === 'main') h += `<td rowspan="3" class="subj">${esc(subjectLabel(pg, g))}</td>`;
        g.rooms.forEach(r => {
          const rs = roomSubject(pg, r);
          const active = rs && rs.subject && (role === 'main' || rs.sub);
          h += active ? cellHtml(`${d.id}|${pi}|${gi}|${role}|${r.name}`, rs.n >= 2 ? 'c' + rs.n : '') : '<td class="none">-</td>';
        });
      });
      h += '</tr>';
    });
    h += '<tr><td>복도</td>';
    E.grades.forEach((g, gi) => {
      const pg = getPG(p, gi), hc = hallCount(pg, g);
      if (!hc || !g.rooms.length) { h += `<td colspan="${Math.max(1, g.rooms.length)}" class="none">-</td>`; return; }
      hallSegments(g.rooms.length, hc).forEach((span, k) => {
        h += cellHtml(`${d.id}|${pi}|${gi}|hall|${k}`).replace('<td ', `<td colspan="${span}" `);
      });
    });
    h += '</tr><tr><td></td>';
    E.grades.forEach((g, gi) => {
      h += `<td class="setters">출제교사</td><td colspan="${Math.max(1, g.rooms.length)}" class="setters">${esc(settersLabel(getPG(p, gi)))}</td>`;
    });
    h += '</tr>';
  });
  h += '</tbody></table>';
  const hasTwo = d.periods.some(p => E.grades.some((g, gi) => (getPG(p, gi).subject2 || '').trim()));
  if (hasTwo) h += `<p class="hint"><span class="lg c2"></span> 과목2 고사실 &nbsp; <span class="lg c3"></span> 과목1·2 동시 고사실</p>`;
  const abs = (d.absences || []).filter(a => a.teacher);
  if (abs.length) h += `<p class="hint">복무: ${abs.map(a => esc(a.teacher) + (a.reason ? `(${esc(a.reason)})` : '')).join(', ')}</p>`;
  return h + '</div>';
}

function renderExamCounts() {
  const slots = examSlots();
  if (!slots.some(s => S.exam.assign[s.key])) return '';
  const c = examCounts(slots);
  const list = S.teachers.filter(t => !t.exclude).map(t => ({ n: t.name, ...c[t.name] }));
  const tot = list.map(x => x.total);
  const mx = Math.max(1, ...tot), mn = Math.min(...tot);
  const avg = tot.reduce((a, b) => a + b, 0) / Math.max(1, tot.length);
  return `<h3>교사별 감독 횟수 <small class="hint">평균 ${avg.toFixed(1)}회 · 최소 ${mn}회 · 최대 ${mx}회</small></h3>
  <div class="counts">${list.map(x => `<div class="cnt-row"><span class="nm" title="${esc(x.n)}">${esc(x.n)}</span>
    <span class="bar"><span style="width:${x.total / mx * 100}%"></span></span>
    <span class="num"><b>${x.total}</b>회 (정${x.main}·부${x.sub}·복${x.hall})</span></div>`).join('')}</div>`;
}

/* ---------- 감독 칸 직접 수정 ---------- */
function openPicker(key) {
  const slots = examSlots(), s = slots.find(x => x.key === key);
  if (!s) return;
  const A = S.exam.assign, cur = A[key] || '', c = examCounts(slots);
  const busy = {};
  slots.forEach(x => { if (x.d.id === s.d.id && x.pi === s.pi && x.key !== key && A[x.key]) busy[A[x.key]] = x; });
  const list = S.teachers.map(t => {
    const why = ineligibleReason(t.name, s);
    const b = busy[t.name];
    return { n: t.name, why, busy: b, c: (c[t.name] || {}).total || 0 };
  }).sort((a, b) => (!!a.why - !!b.why) || (!!a.busy - !!b.busy) || a.c - b.c || koSort(a.n, b.n));
  openModal(`<h3>${esc(slotLabel(s))}</h3>
    <p class="hint">현재: <b>${esc(cur || '미배정')}</b>${S.exam.locks[key] ? ' 🔒' : ''} · 횟수가 적은 순으로 정렬됩니다. 같은 교시에 이미 배정된 교사를 고르면 두 칸을 서로 맞바꿉니다.</p>
    <div class="pick-list">${list.map(x => `<button data-act="pick-set" data-key="${esc(key)}" data-name="${esc(x.n)}" ${x.why ? 'disabled' : ''} class="${x.n === cur ? 'cur' : ''}">
      ${esc(x.n)} <small>${x.why ? esc(x.why) : (x.busy ? '맞바꾸기 · ' : '') + x.c + '회'}</small></button>`).join('')}</div>
    <div class="row">
      <button data-act="pick-unlock" data-key="${esc(key)}">🔓 잠금 해제</button>
      <button class="danger" data-act="pick-set" data-key="${esc(key)}" data-name="">비우기</button>
      <span style="flex:1"></span><button data-act="modal-close">닫기</button>
    </div>`);
}
ACTS['pick'] = el => openPicker(el.dataset.key);
ACTS['pick-set'] = el => {
  const key = el.dataset.key, name = el.dataset.name, E = S.exam;
  const slots = examSlots(), s = slots.find(x => x.key === key);
  const cur = E.assign[key] || '';
  if (name) {
    const other = slots.find(x => x.d.id === s.d.id && x.pi === s.pi && x.key !== key && E.assign[x.key] === name);
    if (other) {
      const ok = !cur || !ineligibleReason(cur, other);
      E.assign[other.key] = ok ? cur : '';
      E.locks[other.key] = true;
      if (!ok) toast(`${cur} 선생님은 ${slotLabel(other)}에 들어갈 수 없어 그 칸은 비워졌습니다.`);
    }
  }
  E.assign[key] = name; E.locks[key] = true;
  save(); closeModal(); render();
};
ACTS['pick-unlock'] = el => { delete S.exam.locks[el.dataset.key]; save(); closeModal(); render(); };
ACTS['modal-close'] = () => closeModal();

/* ---------- 편집 동작 ---------- */
function newPeriod(n) { return { label: `${n}교시`, time: '', grades: [] }; }
ACTS['g-add'] = () => { S.exam.grades.push({ name: `${S.exam.grades.length + 1}학년`, rooms: classRooms() }); save(); render(); };
ACTS['g-del'] = el => {
  const gi = +el.dataset.gi;
  if (!confirm(`${S.exam.grades[gi].name}을(를) 삭제할까요?`)) return;
  S.exam.grades.splice(gi, 1);
  S.exam.days.forEach(d => d.periods.forEach(p => p.grades && p.grades.splice(gi, 1)));
  S.exam.assign = {}; S.exam.locks = {};
  save(); render();
};
ACTS['r-add'] = el => { const g = S.exam.grades[+el.dataset.gi]; g.rooms.push({ name: `${g.rooms.length + 1}반`, homeroom: '', special: false }); save(); render(); };
ACTS['r-del'] = el => { S.exam.grades[+el.dataset.gi].rooms.splice(+el.dataset.ri, 1); save(); render(); };
ACTS['r-up'] = el => {
  const r = S.exam.grades[+el.dataset.gi].rooms, i = +el.dataset.ri;
  if (i > 0) { [r[i - 1], r[i]] = [r[i], r[i - 1]]; save(); render(); }
};
ACTS['d-add'] = () => {
  const last = S.exam.days[S.exam.days.length - 1];
  let date = '';
  if (last && validIso(last.date)) { date = addDays(last.date, 1); while ([0, 6].includes(parseIso(date).getDay())) date = addDays(date, 1); }
  const periods = last ? last.periods.map(p => ({ label: p.label, time: p.time, grades: [] })) : [newPeriod(1), newPeriod(2), newPeriod(3)];
  S.exam.days.push({ id: uid(), date, periods, absences: [] });
  save(); render();
};
ACTS['d-copy'] = el => {
  const d = S.exam.days[+el.dataset.di];
  const c = JSON.parse(JSON.stringify(d)); c.id = uid(); c.absences = [];
  if (validIso(d.date)) c.date = addDays(d.date, 1);
  S.exam.days.splice(+el.dataset.di + 1, 0, c); save(); render();
};
ACTS['d-del'] = el => { if (confirm('이 시험일을 삭제할까요?')) { S.exam.days.splice(+el.dataset.di, 1); save(); render(); } };
ACTS['p-add'] = el => { const d = S.exam.days[+el.dataset.di]; d.periods.push(newPeriod(d.periods.length + 1)); save(); render(); };
ACTS['p-del'] = el => {
  const d = S.exam.days[+el.dataset.di], pi = +el.dataset.pi;
  if (!confirm(`${d.periods[pi].label}을(를) 삭제할까요?`)) return;
  d.periods.splice(pi, 1);
  (d.absences || []).forEach(a => a.periods && a.periods.splice(pi, 1));
  // 교시 번호가 바뀌므로 이 날의 배정 결과는 초기화
  for (const k of Object.keys(S.exam.assign)) if (k.startsWith(d.id + '|')) { delete S.exam.assign[k]; delete S.exam.locks[k]; }
  save(); render();
};
ACTS['room-tog'] = el => {
  const pg = getPG(S.exam.days[+el.dataset.di].periods[+el.dataset.pi], +el.dataset.gi);
  const r = S.exam.grades[+el.dataset.gi].rooms.find(x => x.name === el.dataset.room);
  const two = !!(pg.subject2 || '').trim();
  const seq = two ? [1, 2, 3, 0] : [1, 0];
  const cur = roomState(pg, r);
  if (!pg.rs) pg.rs = {};
  pg.rs[r.name] = seq[(seq.indexOf(cur) + 1) % seq.length];
  if (pg.roomsOn) delete pg.roomsOn[r.name];
  save(); render();
};
ACTS['s2-add'] = el => { getPG(S.exam.days[+el.dataset.di].periods[+el.dataset.pi], +el.dataset.gi).two = true; save(); render(); };
ACTS['s2-del'] = el => {
  const pg = getPG(S.exam.days[+el.dataset.di].periods[+el.dataset.pi], +el.dataset.gi);
  pg.two = false; pg.subject2 = ''; pg.setters2 = ''; pg.sub2 = false;
  if (pg.rs) for (const k of Object.keys(pg.rs)) if (pg.rs[k] === 2 || pg.rs[k] === 3) delete pg.rs[k];
  save(); render();
};
ACTS['a-add'] = el => { const d = S.exam.days[+el.dataset.di]; (d.absences = d.absences || []).push({ teacher: '', reason: '', periods: d.periods.map(() => true) }); save(); render(); };
ACTS['a-del'] = el => { S.exam.days[+el.dataset.di].absences.splice(+el.dataset.ai, 1); save(); render(); };
ACTS['ex-run'] = () => {
  const lockedN = Object.keys(S.exam.locks).length;
  if (lockedN && !confirm(`잠금된 ${lockedN}칸은 유지하고 나머지를 다시 배정합니다. 진행할까요?`)) return;
  runExamAssign();
};
ACTS['ex-unlock'] = () => { S.exam.locks = {}; save(); render(); toast('모든 잠금을 해제했습니다.'); };
ACTS['ex-clear'] = () => { if (confirm('배정 결과와 잠금을 모두 지울까요?')) { S.exam.assign = {}; S.exam.locks = {}; save(); render(); } };
ACTS['ex-export'] = () => exportExam();
