/* ① 교사 명단 */
function renderTeachers() {
  const T = S.teachers;
  return `
  <section class="card">
    <h2>교사 명단 <small>${T.length}명</small></h2>
    <p class="hint">이름을 줄바꿈 · 쉼표 · 탭으로 구분해 붙여넣고 [추가]를 누르세요. 엑셀에서 이름 열을 그대로 복사해 붙여넣어도 됩니다.<br>
    교장 · 교감처럼 정기고사 감독을 하지 않는 분은 <b>감독 제외</b>에 체크하세요.</p>
    <div class="upload-box">
      <b>📂 엑셀 파일로 불러오기</b>
      <span class="hint" style="margin:0">교원 명단 엑셀(.xlsx) 또는 CSV 파일을 선택하면 "성명/이름" 열을 자동으로 찾아 불러옵니다.</span>
      <button class="accent" data-act="t-file-open">파일 선택</button>
      <input type="file" id="tFile" accept=".xlsx,.csv" data-act-change="t-file" style="display:none">
    </div>
    <textarea id="bulkNames" rows="4" placeholder="또는 여기에 직접 붙여넣기&#10;홍길동&#10;김철수, 이영희"></textarea>
    <div class="row">
      <button class="primary" data-act="t-add">추가</button>
      <button data-act="t-sort">가나다순 정렬</button>
      <button class="danger" data-act="t-clear">전체 삭제</button>
    </div>
  </section>
  <section class="card">
    ${T.length ? `<table class="list"><thead><tr><th style="width:50px">#</th><th>이름</th><th style="width:130px">정기고사 감독 제외</th><th>메모</th><th style="width:70px"></th></tr></thead><tbody>
    ${T.map((t, i) => `<tr>
      <td>${i + 1}</td>
      <td><b>${esc(t.name)}</b> <button class="mini" data-act="t-rename" data-i="${i}">이름 변경</button></td>
      <td><input type="checkbox" data-path="teachers.${i}.exclude" ${t.exclude ? 'checked' : ''}></td>
      <td><input data-path="teachers.${i}.memo" value="${esc(t.memo || '')}" placeholder="예: 교감, 시간강사"></td>
      <td><button class="mini danger" data-act="t-del" data-i="${i}">삭제</button></td></tr>`).join('')}
    </tbody></table>` : '<p class="hint">아직 등록된 교사가 없습니다.</p>'}
  </section>`;
}

ACTS['t-add'] = () => {
  const names = parseNames(document.getElementById('bulkNames').value);
  let added = 0;
  names.forEach(n => { if (!hasTeacher(n)) { S.teachers.push({ name: n, exclude: false, memo: '' }); added++; } });
  save(); render(); toast(`${added}명 추가됨` + (names.length - added ? ` (중복 ${names.length - added}명 제외)` : ''));
};
ACTS['t-sort'] = () => { S.teachers.sort((a, b) => koSort(a.name, b.name)); save(); render(); };
ACTS['t-clear'] = () => { if (confirm('교사 명단을 모두 삭제할까요?')) { S.teachers = []; save(); render(); } };
ACTS['t-del'] = el => {
  const t = S.teachers[+el.dataset.i];
  if (confirm(`${t.name} 선생님을 명단에서 삭제할까요?`)) { S.teachers.splice(+el.dataset.i, 1); save(); render(); }
};
ACTS['t-rename'] = el => {
  const t = S.teachers[+el.dataset.i];
  const nn = (prompt('새 이름을 입력하세요 (담임·출제·복무·배정 결과에도 함께 반영됩니다)', t.name) || '').trim();
  if (!nn || nn === t.name) return;
  if (hasTeacher(nn)) { alert('이미 같은 이름이 있습니다.'); return; }
  renameEverywhere(t.name, nn); save(); render();
};

/* 엑셀 업로드 연결 (teacher-import.js) */
function importHas(n) { return hasTeacher(n); }
function applyTeacherImport(ok, replace) {
  if (replace) {
    if (S.teachers.length && !confirm(`기존 명단 ${S.teachers.length}명을 지우고 ${ok.length}명으로 바꿀까요?`)) return false;
    const old = Object.fromEntries(S.teachers.map(t => [t.name, t]));
    S.teachers = ok.map(n => old[n] || { name: n, exclude: false, memo: '' }); // 같은 이름은 기존 설정(감독 제외·메모) 유지
  } else ok.forEach(n => { if (!hasTeacher(n)) S.teachers.push({ name: n, exclude: false, memo: '' }); });
}

/* 상태 전체에서 이름 바꾸기 (출제교사 텍스트 포함) */
function renameEverywhere(oldN, newN) {
  const walk = o => {
    if (Array.isArray(o)) { o.forEach((v, i) => { if (v === oldN) o[i] = newN; else if (v && typeof v === 'object') walk(v); }); return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (v === oldN) o[k] = newN;
      else if (k === 'setters' && typeof v === 'string') o[k] = parseNames(v).map(n => n === oldN ? newN : n).join(', ');
      else if (v && typeof v === 'object') walk(v);
    }
  };
  [S.teachers, S.exam, S.yaja].forEach(o => { if (o) walk(o); });
}
