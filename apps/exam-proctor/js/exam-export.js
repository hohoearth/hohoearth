/* 정기고사 감독 시간표 → 엑셀 (예시 양식 기준: 날짜별 시트) */
async function exportExam() {
  if (!needExcelJS()) return;
  const E = S.exam;
  if (!E.days.length) { alert('시험일이 없습니다.'); return; }
  const wb = new ExcelJS.Workbook();
  const used = new Set();
  E.days.forEach((d, di) => buildExamSheet(wb, d, di, used));
  buildExamSummary(wb, used);
  await saveWorkbook(wb, E.title || '감독 시간표');
  toast('엑셀 파일을 저장했습니다.');
}

function buildExamSheet(wb, d, di, used) {
  const E = S.exam, A = E.assign;
  const nm = validIso(d.date) ? d.date.slice(5).replace('-', '') : `${di + 1}일차`;
  const ws = wb.addWorksheet(sheetName(nm, used), {
    pageSetup: { orientation: 'landscape', paperSize: 9, fitToPage: true, fitToWidth: 1, fitToHeight: 1,
      margins: { left: 0.3, right: 0.3, top: 0.4, bottom: 0.4, header: 0.2, footer: 0.2 } },
  });

  // 열 배치
  const gcols = []; let col = 3;
  E.grades.forEach(g => { const n = Math.max(1, g.rooms.length); gcols.push({ subj: col, first: col + 1, last: col + n, n }); col += n + 1; });
  const lastCol = col - 1;
  ws.getColumn(1).width = 15; ws.getColumn(2).width = 6;
  gcols.forEach(gc => { ws.getColumn(gc.subj).width = 14; for (let c = gc.first; c <= gc.last; c++) ws.getColumn(c).width = 8; });

  const set = (r, c, v, o = {}) => {
    const cell = ws.getCell(r, c);
    cell.value = v;
    cell.font = XL.font(o.font || {});
    cell.alignment = o.align || XL.center;
    if (o.fill) cell.fill = XL.fill(o.fill);
    return cell;
  };
  const merge = (r1, c1, r2, c2) => { if (r1 !== r2 || c1 !== c2) ws.mergeCells(r1, c1, r2, c2); };

  // 제목/날짜
  set(1, 1, E.title, { font: { size: 20, bold: true } }); merge(1, 1, 1, lastCol); ws.getRow(1).height = 32;
  set(2, 1, fmtDate(d.date), { font: { size: 16, bold: true }, align: { horizontal: 'left', vertical: 'middle' } }); merge(2, 1, 2, 3);
  if (E.school) { set(2, Math.max(4, lastCol - 4), E.school, { font: { size: 12, bold: true }, align: { horizontal: 'right', vertical: 'middle' } }); merge(2, Math.max(4, lastCol - 4), 2, lastCol); }
  ws.getRow(2).height = 26;

  // 머리글 (3~5행)
  const HF = 'FFD9D9D9', TOP = 3;
  set(TOP, 1, '교시\n예비령\n준비령\n시험시간', { font: { bold: true }, fill: HF }); merge(TOP, 1, TOP + 2, 1);
  set(TOP, 2, '구분', { font: { bold: true }, fill: HF }); merge(TOP, 2, TOP + 1, 2);
  set(TOP + 2, 2, '제외', { fill: 'FFF2F2F2' });
  E.grades.forEach((g, gi) => {
    const gc = gcols[gi];
    set(TOP, gc.subj, g.name, { font: { bold: true, size: 12 }, fill: HF }); merge(TOP, gc.subj, TOP, gc.last);
    set(TOP + 1, gc.subj, '과목', { font: { bold: true }, fill: HF });
    set(TOP + 2, gc.subj, '담임', { fill: 'FFF2F2F2' });
    if (!g.rooms.length) { set(TOP + 1, gc.first, '-', { fill: HF }); set(TOP + 2, gc.first, '-', { fill: 'FFF2F2F2' }); }
    g.rooms.forEach((r, ri) => {
      set(TOP + 1, gc.first + ri, r.name, { font: { bold: true }, fill: HF });
      set(TOP + 2, gc.first + ri, r.homeroom || '-', { fill: 'FFF2F2F2' });
    });
  });
  ws.getRow(TOP).height = 24; ws.getRow(TOP + 1).height = 35; ws.getRow(TOP + 2).height = 23;

  // 교시별 4행 (정, 부, 복도, 출제교사)
  const blockStarts = new Set([TOP]), blockEnds = new Set([TOP + 2]);
  let r = TOP + 3;
  const nameCell = (rr, cc, key) => {
    const n = A[key];
    if (n === undefined) return set(rr, cc, '', { font: { bold: true } });
    if (!n) return set(rr, cc, '미배정', { font: { bold: true, color: { argb: 'FFFF0000' } } });
    return set(rr, cc, n, { font: { bold: true } });
  };
  d.periods.forEach((p, pi) => {
    blockStarts.add(r); blockEnds.add(r + 3);
    set(r, 1, [p.label, p.time].filter(Boolean).join('\n'), { font: { bold: true } }); merge(r, 1, r + 3, 1);
    set(r, 2, '정'); set(r + 1, 2, '부'); set(r + 2, 2, '복도'); merge(r + 2, 2, r + 3, 2);
    E.grades.forEach((g, gi) => {
      const gc = gcols[gi], pg = getPG(p, gi);
      const label = subjectLabel(pg, g);
      set(r, gc.subj, label, { font: { bold: true, size: label.includes('\n') ? 11 : 12 } }); merge(r, gc.subj, r + 2, gc.subj);
      if (!g.rooms.length) { set(r, gc.first, '-'); set(r + 1, gc.first, '-'); }
      g.rooms.forEach((rm, ri) => {
        const c = gc.first + ri, rs = roomSubject(pg, rm), on = rs && rs.subject;
        const tint = on && rs.n === 2 ? 'FFFFF4E8' : on && rs.n === 3 ? 'FFF3EAFF' : null; // 과목2 / 동시 고사실 구분색
        if (on) nameCell(r, c, `${d.id}|${pi}|${gi}|main|${rm.name}`); else set(r, c, '-');
        if (on && rs.sub) nameCell(r + 1, c, `${d.id}|${pi}|${gi}|sub|${rm.name}`); else set(r + 1, c, '-');
        if (tint) { ws.getCell(r, c).fill = XL.fill(tint); ws.getCell(r + 1, c).fill = XL.fill(tint); }
      });
      // 복도
      const hc = hallCount(pg, g);
      if (!hc || !g.rooms.length) { set(r + 2, gc.first, '-'); merge(r + 2, gc.first, r + 2, gc.last); }
      else {
        let c = gc.first;
        hallSegments(g.rooms.length, hc).forEach((span, k) => {
          nameCell(r + 2, c, `${d.id}|${pi}|${gi}|hall|${k}`); merge(r + 2, c, r + 2, c + span - 1); c += span;
        });
      }
      // 출제교사
      set(r + 3, gc.subj, '출제교사', { fill: 'FFFFF2CC' });
      set(r + 3, gc.first, settersLabel(pg), { font: { bold: true }, fill: 'FFFFF2CC' });
      merge(r + 3, gc.first, r + 3, gc.last);
    });
    [r, r + 1, r + 2].forEach(x => ws.getRow(x).height = 33.75);
    ws.getRow(r + 3).height = 18;
    r += 4;
  });
  const lastRow = r - 1;

  // 테두리: 기본 가는 선, 블록/학년 경계는 굵은 선
  const medL = new Set([1, 2]), medR = new Set([1, 2, lastCol]);
  gcols.forEach(gc => { medL.add(gc.subj); medR.add(gc.last); });
  for (let rr = TOP; rr <= lastRow; rr++) {
    for (let cc = 1; cc <= lastCol; cc++) {
      ws.getCell(rr, cc).border = {
        top: { style: blockStarts.has(rr) ? 'medium' : 'thin' },
        bottom: { style: blockEnds.has(rr) ? 'medium' : 'thin' },
        left: { style: medL.has(cc) ? 'medium' : 'thin' },
        right: { style: medR.has(cc) ? 'medium' : 'thin' },
      };
    }
  }

  // 하단 안내 + 복무
  r = lastRow + 2;
  const noteLines = String(E.notes || '').split('\n').map(x => x.trim()).filter(Boolean);
  noteLines.forEach((line, i) => {
    const red = line.startsWith('★');
    set(r, 1, line, { font: { bold: true, size: red ? 13 : 11, color: { argb: red ? 'FFFF0000' : (line.startsWith('※') ? 'FF0033CC' : 'FF000000') } }, align: { horizontal: 'left', vertical: 'middle' } });
    r++;
  });
  if (d.periods.some(p => E.grades.some((g, gi) => (getPG(p, gi).subject2 || '').trim()))) {
    set(r, 1, '※ 연주황 칸 = 과목2 고사실, 연보라 칸 = 과목1·2 동시 고사실', { font: { size: 10, color: { argb: 'FF7F6000' } }, align: { horizontal: 'left', vertical: 'middle' } });
    r++;
  }
  absenceLines(d).forEach(line => { set(r, 1, line, { font: { bold: true }, align: { horizontal: 'left', vertical: 'middle' } }); r++; });
  ws.pageSetup.printArea = `A1:${colLetter(lastCol)}${r}`;
}

/* 같은 사유 · 같은 교시끼리 묶어서 한 줄로 */
function absenceLines(d) {
  const groups = new Map();
  (d.absences || []).filter(a => a.teacher).forEach(a => {
    const off = d.periods.map((p, pi) => (a.periods && a.periods[pi] === false) ? null : p.label).filter(Boolean);
    const part = off.length === d.periods.length ? '' : ` [${off.join(', ')}]`;
    const k = (a.reason || '복무') + part;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(a.teacher);
  });
  return [...groups.entries()].map(([k, ns]) => `${ns.join(', ')}: ${k}`);
}

function buildExamSummary(wb, used) {
  const E = S.exam, slots = examSlots(), c = examCounts(slots);
  const ws = wb.addWorksheet(sheetName('감독 횟수', used));
  const head = ['번호', '이름', '정감독', '부감독', '복도', '합계', ...E.days.map((d, i) => fmtDate(d.date) || `${i + 1}일차`)];
  ws.addRow([`${E.title} — 교사별 감독 횟수`]);
  ws.mergeCells(1, 1, 1, head.length);
  ws.getCell(1, 1).font = XL.font({ size: 14, bold: true });
  ws.addRow(head);
  ws.getRow(2).eachCell(cell => { cell.font = XL.font({ bold: true }); cell.fill = XL.fill('FFD9D9D9'); cell.alignment = XL.center; cell.border = XL.thinAll; });
  S.teachers.forEach((t, i) => {
    const x = c[t.name] || { main: 0, sub: 0, hall: 0, total: 0, days: {} };
    const row = ws.addRow([i + 1, t.name + (t.exclude ? ' (제외)' : ''), x.main, x.sub, x.hall, x.total, ...E.days.map(d => x.days[d.id] || 0)]);
    row.eachCell(cell => { cell.font = XL.font(); cell.alignment = XL.center; cell.border = XL.thinAll; });
    row.getCell(6).font = XL.font({ bold: true });
  });
  ws.columns.forEach((col, i) => col.width = i === 1 ? 14 : (i < 6 ? 8 : 15));
}
