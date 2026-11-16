/* 교사 명단 엑셀/CSV 업로드 (두 프로그램 공용)
   각 프로그램이 importHas(name), applyTeacherImport(names, replace)를 정의 */
/* ---------- 엑셀/CSV 업로드 ---------- */
let IMPORT = null; // { fileName, sheets:[{name, rows:[[문자열]]}], si, ci, hr, replace }
const NAME_HEAD = /^(이름|성명|교사명|교원명|교사|성함|name)$/i;
const cleanName = v => String(v ?? '').replace(/\s+/g, '').replace(/\(.*?\)/g, '');
const looksName = v => /^[가-힣]{2,5}$/.test(v) || /^[A-Za-z][A-Za-z.\-]{1,20}$/.test(v);

ACTS['t-file-open'] = () => document.getElementById('tFile').click();
CHANGE_ACTS['t-file'] = async el => {
  const f = el.files[0]; el.value = '';
  if (!f) return;
  try {
    let sheets = [];
    if (/\.csv$/i.test(f.name)) {
      let text = await f.text();
      if (text.includes('�')) text = new TextDecoder('euc-kr').decode(await f.arrayBuffer()); // 엑셀에서 저장한 CSV(한글 깨짐) 대응
      sheets = [{ name: 'CSV', rows: text.split(/\r?\n/).map(l => l.split(/,|\t/).map(x => x.replace(/^"|"$/g, '').trim())) }];
    } else {
      if (/\.xls$/i.test(f.name)) { alert('예전 형식(.xls)은 읽을 수 없습니다. 엑셀에서 [다른 이름으로 저장 → Excel 통합 문서(.xlsx)]로 저장한 뒤 다시 선택해 주세요.'); return; }
      if (!needExcelJS()) return;
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await f.arrayBuffer());
      wb.eachSheet(ws => {
        const rows = [];
        ws.eachRow({ includeEmpty: true }, (row, rn) => {
          const arr = [];
          row.eachCell({ includeEmpty: true }, (cell, cn) => { arr[cn - 1] = String(cell.text ?? '').trim(); });
          rows[rn - 1] = arr;
        });
        sheets.push({ name: ws.name, rows: Array.from(rows, r => r || []) });
      });
    }
    if (!sheets.length) { alert('읽을 수 있는 시트가 없습니다.'); return; }
    IMPORT = { fileName: f.name, sheets, si: 0, replace: false };
    // 이름이 가장 많이 들어 있는 시트를 기본으로 선택
    let bestScore = -1;
    sheets.forEach((s, i) => { const g = guessColumn(s); if (g.score > bestScore) { bestScore = g.score; IMPORT.si = i; } });
    applyGuess();
    renderImportModal();
  } catch (err) {
    alert('파일을 읽지 못했습니다: ' + err.message);
  }
};

/* 머리글(성명/이름)이 있으면 그 열, 없으면 이름처럼 보이는 값이 가장 많은 열 */
function guessColumn(sheet) {
  const rows = sheet.rows, ncol = Math.max(0, ...rows.map(r => r.length));
  for (let r = 0; r < Math.min(15, rows.length); r++)
    for (let c = 0; c < (rows[r] || []).length; c++)
      if (NAME_HEAD.test(cleanName(rows[r][c]))) {
        const score = rows.slice(r + 1).filter(x => looksName(cleanName(x[c]))).length;
        return { ci: c, hr: r, score: score + 1000 };
      }
  // 3글자 한글(가장 흔한 이름 길이)에 가중치 → '국어', '수학' 같은 교과 열과 구분
  const w = v => !looksName(v) ? 0 : (/^[가-힣]{3}$/.test(v) ? 1 : 0.3);
  let best = { ci: 0, hr: -1, score: 0 };
  for (let c = 0; c < ncol; c++) {
    const sc = rows.reduce((a, x) => a + w(cleanName(x[c])), 0);
    if (sc > best.score) best = { ci: c, hr: -1, score: sc };
  }
  return best;
}
function applyGuess() { const g = guessColumn(IMPORT.sheets[IMPORT.si]); IMPORT.ci = g.ci; IMPORT.hr = g.hr; }
function importNames() {
  const rows = IMPORT.sheets[IMPORT.si].rows, ok = [], skipped = [];
  rows.forEach((r, i) => {
    if (i <= IMPORT.hr) return;
    const v = cleanName(r[IMPORT.ci]);
    if (!v) return;
    if (looksName(v) && !NAME_HEAD.test(v)) { if (!ok.includes(v)) ok.push(v); }
    else skipped.push(v);
  });
  return { ok, skipped };
}
function renderImportModal() {
  const I = IMPORT, sh = I.sheets[I.si];
  const ncol = Math.max(1, ...sh.rows.map(r => r.length));
  const colOpts = Array.from({ length: ncol }, (_, c) => {
    const head = I.hr >= 0 ? sh.rows[I.hr]?.[c] : '';
    const sample = sh.rows.slice(I.hr + 1).map(r => cleanName(r[c])).filter(Boolean).slice(0, 3).join(', ');
    return `<option value="${c}" ${c === I.ci ? 'selected' : ''}>${colLetter(c + 1)}열${head ? ` [${esc(head)}]` : ''} — ${esc(sample || '(비어 있음)')}</option>`;
  }).join('');
  const { ok, skipped } = importNames();
  const dupe = ok.filter(n => importHas(n)).length;
  openModal(`<h3>엑셀에서 교사 명단 불러오기</h3>
    <p class="hint">파일: <b>${esc(I.fileName)}</b> · 이름이 들어 있는 시트와 열이 맞는지 확인하세요.</p>
    <div class="grid2">
      <label>시트<select data-act-change="t-imp-sheet">${I.sheets.map((s, i) => `<option value="${i}" ${i === I.si ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}</select></label>
      <label>이름 열<select data-act-change="t-imp-col">${colOpts}</select></label>
    </div>
    <p><b>${ok.length}명</b> 찾음${!I.replace && dupe ? ` (이미 명단에 있는 ${dupe}명은 건너뜀)` : ''}</p>
    <div class="chips" style="max-height:220px;overflow:auto;border:1px solid var(--line);border-radius:6px;padding:6px">
      ${ok.map(n => `<span class="chip tag">${esc(n)}</span>`).join('') || '<span class="hint">이 열에서 이름을 찾지 못했습니다. 다른 열을 선택해 보세요.</span>'}</div>
    ${skipped.length ? `<p class="hint">이름이 아닌 것으로 보여 제외: ${esc(skipped.slice(0, 8).join(', '))}${skipped.length > 8 ? ` 외 ${skipped.length - 8}개` : ''}</p>` : ''}
    <label class="check"><input type="checkbox" data-act-change="t-imp-replace" ${I.replace ? 'checked' : ''}> 기존 명단을 지우고 새로 불러오기</label>
    <div class="row">
      <button class="primary" data-act="t-imp-do" ${ok.length ? '' : 'disabled'}>${ok.length}명 불러오기</button>
      <span style="flex:1"></span><button data-act="modal-close">취소</button>
    </div>`);
}
CHANGE_ACTS['t-imp-sheet'] = el => { IMPORT.si = +el.value; applyGuess(); renderImportModal(); };
CHANGE_ACTS['t-imp-col'] = el => {
  IMPORT.ci = +el.value;
  const rows = IMPORT.sheets[IMPORT.si].rows;
  IMPORT.hr = -1;
  for (let r = 0; r < Math.min(15, rows.length); r++) if (NAME_HEAD.test(cleanName(rows[r][IMPORT.ci]))) { IMPORT.hr = r; break; }
  renderImportModal();
};
CHANGE_ACTS['t-imp-replace'] = el => { IMPORT.replace = el.checked; renderImportModal(); };
ACTS['t-imp-do'] = () => {
  const { ok } = importNames();
  if (applyTeacherImport(ok, IMPORT.replace) === false) return;
  IMPORT = null; closeModal(); save(); render();
  toast(`교사 ${ok.length}명을 불러왔습니다.`);
};

