(function () {
  const $ = sel => document.querySelector(sel);
  const $$ = sel => Array.from(document.querySelectorAll(sel));
  const store = {
    get(k) { try { return localStorage.getItem(k) ?? sessionStorage.getItem(k); } catch (_) { return null; } },
    set(k, v, persist) {
      try {
        if (persist) { localStorage.setItem(k, v); sessionStorage.removeItem(k); }
        else { sessionStorage.setItem(k, v); localStorage.removeItem(k); }
      } catch (_) { /* 저장 불가 환경 */ }
    },
    del(k) { try { localStorage.removeItem(k); sessionStorage.removeItem(k); } catch (_) {} }
  };

  // ---------------- 유틸 ----------------
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = u => /^https?:\/\//i.test(String(u || "")) ? String(u) : null;
  const won = n => (Number(n) > 0 ? "약 " + Number(n).toLocaleString("ko-KR") + "원" : "");
  const asList = v => Array.isArray(v) ? v : (v ? [v] : []);
  const SUBJECTS = ["물리", "화학", "생명과학", "지구과학", "정보"];

  // 진로·학과 표현을 주제 태그와 연결하기 위한 간단한 동의어 사전
  const SYNONYMS = {
    "의사": ["의학", "의료", "건강", "심박", "생체신호", "헬스케어"], "의예": ["의학", "의료", "건강", "심박", "생체신호"],
    "의대": ["의학", "의료", "건강", "심박"], "치의": ["의료", "건강", "생체재료"], "한의": ["의료", "건강", "심박"],
    "간호": ["의료", "건강", "심박", "보건"], "약": ["약학", "분석화학", "제약", "화학 분석"],
    "수의": ["생명", "동물", "건강"], "보건": ["건강", "보건", "공기질"],
    "컴퓨터": ["정보", "코딩", "데이터", "소프트웨어", "인공지능"], "소프트웨어": ["정보", "코딩", "데이터", "인공지능"],
    "인공지능": ["머신러닝", "AI", "데이터", "정보"], "ai": ["머신러닝", "인공지능", "데이터"], "데이터": ["데이터 분석", "빅데이터", "공공데이터", "머신러닝"],
    "통계": ["데이터 분석", "공공데이터"], "프로그래": ["코딩", "정보", "소프트웨어"], "개발자": ["코딩", "소프트웨어", "정보"],
    "환경": ["환경", "기후", "오염", "미세먼지", "수질"], "기후": ["기후변화", "열섬", "탄소중립", "기후"],
    "기상": ["기상", "기후", "대기"], "대기": ["대기오염", "미세먼지", "기상"],
    "건축": ["건축", "내진", "열섬", "환기", "구조"], "토목": ["토목", "내진", "산사태", "하천", "구조"], "도시": ["도시", "열섬", "소음", "빛공해"],
    "전기": ["전기", "회로", "에너지", "전력"], "전자": ["전자", "회로", "센서", "반도체"], "반도체": ["반도체", "태양전지", "열전"],
    "에너지": ["에너지", "신재생", "태양광", "발전", "배터리"], "배터리": ["전지", "배터리", "이차전지"], "이차전지": ["전지", "배터리"],
    "신소재": ["신소재", "재료", "고분자", "전지"], "재료": ["재료", "강도", "신소재"], "고분자": ["고분자", "생분해 플라스틱"],
    "화학": ["화학", "산화환원", "분석화학", "전기화학"], "화공": ["화학공학", "전지", "수질"],
    "기계": ["기계", "역학", "진동", "로봇"], "로봇": ["로봇", "센서", "자율주행"], "자동차": ["자율주행", "거리센서", "배터리"],
    "항공": ["항공", "공기저항", "역학"], "우주": ["우주", "천문", "별"], "천문": ["천문", "별", "빛공해"],
    "생명": ["생명", "바이오", "세포", "효모", "식물"], "바이오": ["바이오", "효모", "발효", "생명공학"], "유전": ["유전", "바이오", "생명"],
    "식품": ["식품", "발효", "숙성", "신선도"], "영양": ["식품", "건강"], "농업": ["농업", "스마트팜", "식물"], "원예": ["식물", "스마트팜", "숙성"],
    "산림": ["식물", "광합성", "탄소흡수"], "화장품": ["화장품", "자외선", "피부"], "의류": ["섬유", "직물", "자외선"],
    "지질": ["지질", "지진", "산사태", "토양"], "지구": ["지구과학", "지진", "기후"], "물리": ["물리", "역학", "파동"],
    "재활": ["보조공학", "재활", "자세"], "물리치료": ["자세", "재활", "웨어러블"], "소방": ["재난", "안전"], "안전": ["재난", "안전", "경보"],
    "교사": ["교육"], "사범": ["교육"]
  };

  function tokenize(str) {
    return String(str || "").toLowerCase()
      .split(/[\s,·/|;]+/)
      .map(t => t.replace(/(학과|학부|공학과|과학과|전공|계열|분야)$/,'').trim())
      .filter(t => t.length >= 2 || /^[a-z]{2,}$/.test(t));
  }

  function expand(tokens) {
    const out = new Set(tokens);
    for (const t of tokens) {
      for (const [k, vals] of Object.entries(SYNONYMS)) {
        if (t.includes(k) || k.includes(t)) vals.forEach(v => out.add(v.toLowerCase()));
      }
    }
    return [...out];
  }

  const has = (arr, t) => arr.some(x => { x = x.toLowerCase(); return x.includes(t) || (t.length >= 2 && t.includes(x)); });

  // ---------------- 내장 DB 매칭 ----------------
  function matchDB(input) {
    const kwTokens = tokenize(input.keywords);
    const careerTokens = expand(tokenize(input.career + " " + input.major));
    const kwExpanded = expand(kwTokens);

    const scored = window.TOPICS_DB.map(t => {
      let score = 0;
      const why = new Set();
      for (const k of kwTokens) {
        if (has(t.keywords, k)) { score += 5; why.add(`키워드 '${k}'`); }
        else if ((t.title + t.summary).toLowerCase().includes(k)) { score += 3; why.add(`키워드 '${k}'`); }
      }
      for (const k of kwExpanded) if (!kwTokens.includes(k) && has(t.keywords, k)) score += 1;
      for (const k of careerTokens) {
        if (has(t.careers, k) || has(t.majors, k)) { score += 3; why.add("희망 진로·학과"); }
        else if (has(t.keywords, k)) { score += 1; }
      }
      // 연구 방법: 주된 방법(methods[0])이 일치하면 크게, 보조 방법만 일치하면 조금 가산
      const methods = t.methods || ["아두이노 활용"];
      if (input.methods.length) {
        if (input.methods.includes(methods[0])) { score += 8; why.add("연구 방법"); }
        else if (methods.some(m => input.methods.includes(m))) { score += 2; why.add("연구 방법"); }
        else score -= 15;
      }
      // 희망 융합 과목: 체크한 과목만으로 이루어진 주제를 우선(tier 0), 주된 과목만 맞으면 tier 1, 그 외 tier 2
      let tier = 0;
      if (input.fusion.length) {
        const covered = t.subjects.filter(s => input.fusion.includes(s));
        const outside = t.subjects.filter(s => !input.fusion.includes(s));
        const need = Math.min(2, input.fusion.length);
        score += covered.length * 3 - outside.length * 6;
        if (!input.fusion.includes(t.subjects[0])) score -= 8;
        if (input.fusion.length === 1) tier = input.fusion.includes(t.subjects[0]) ? 0 : 2;   // 한 과목만 고르면 그 과목이 주된 주제
        else tier = (outside.length === 0 && covered.length >= need) ? 0 : (input.fusion.includes(t.subjects[0]) ? 1 : 2);
        if (tier === 0) why.add("희망 융합 과목");
      }
      if (t.budget > Number(input.budget)) score -= 6;
      const levelOk = !(input.grade === "1" && t.level === "심화");
      if (!levelOk) score -= 2;
      return { topic: t, score, tier, why: [...why], overBudget: t.budget > Number(input.budget) };
    }).sort((a, b) => a.tier - b.tier || b.score - a.score);

    const methodOk = s => !input.methods.length || (s.topic.methods || []).some(m => input.methods.includes(m));
    const pool = scored.filter(methodOk);
    // 과목 조건을 만족하는 주제(tier 0~1)를 먼저 채우고, 부족할 때만 나머지를 보탬
    // 체크한 과목만으로 이루어진 주제(tier 0)만 보여 주고, 3개 미만일 때만 주된 과목이 맞는 주제(tier 1)를 보탬
    const tier0 = pool.filter(s => s.tier === 0);
    const fit = tier0.length >= 3 ? tier0 : tier0.concat(pool.filter(s => s.tier === 1));
    const strong = fit.filter(s => s.why.some(w => w !== "연구 방법" && w !== "희망 융합 과목") && s.score > 0);
    const list = strong.concat(fit.filter(s => !strong.includes(s))).slice(0, 5);
    return { list: list.length ? list : pool.slice(0, 5), exact: strong.length > 0 };
  }

  // ---------------- 렌더링 ----------------
  function section(_icon, title, html) {
    if (!html) return "";
    return `<h4>${esc(title)}</h4>${html}`;
  }
  const para = s => s ? `<p>${esc(s)}</p>` : "";
  const ulist = arr => asList(arr).length ? `<ul>${asList(arr).map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  const olist = arr => asList(arr).length ? `<ol>${asList(arr).map(x => `<li>${esc(x)}</li>`).join("")}</ol>` : "";

  function searchLinks(terms) {
    const ts = asList(terms).slice(0, 3);
    if (!ts.length) return "";
    const make = (label, url) => `<a href="${esc(url)}" target="_blank" rel="noopener">${label}</a>`;
    return `<ul class="refs">${ts.map(t => {
      const q = encodeURIComponent(t);
      return `<li><b>${esc(t)}</b> — ${[
        make("과학전람회(사이언스올)", `https://www.google.com/search?q=${encodeURIComponent("site:scienceall.com 과학전람회 " + t)}`),
        make("발명품경진대회·한화사이언스챌린지·휴먼테크", `https://www.google.com/search?q=${encodeURIComponent('("학생과학발명품경진대회" OR "한화사이언스챌린지" OR "휴먼테크논문대상") ' + t)}`),
        make("RISS(KCI·학위논문)", `https://www.riss.kr/search/Search.do?query=${q}`),
        make("DBpia", `https://www.dbpia.co.kr/search/topSearch?searchOption=all&query=${q}`),
        make("Google Scholar(SCI)", `https://scholar.google.com/scholar?q=${q}`),
        make("뉴스", `https://search.naver.com/search.naver?where=news&query=${q}`)
      ].join(" · ")}</li>`;
    }).join("")}</ul>`;
  }

  function references(refs) {
    const items = asList(refs).filter(r => r && (r.title || r.url));
    if (!items.length) return "";
    return `<ul class="refs">${items.map(r => {
      const url = safeUrl(r.url);
      const title = esc(r.title || r.url);
      return `<li><span class="ref-type">${esc(r.type || "자료")}</span>${url ? `<a href="${esc(url)}" target="_blank" rel="noopener">${title}</a>` : title}${r.note ? ` — <small>${esc(r.note)}</small>` : ""}</li>`;
    }).join("")}</ul><p class="hint small">※ 자료는 링크를 직접 열어 실제 내용과 일치하는지 확인한 뒤 인용하세요.</p>`;
  }

  function topicBody(t) {
    const v = t.variables || {};
    const varTable = (v.independent || v.dependent || v.controlled) ? `<div class="table-scroll"><table class="var-table">
      <tr><th>조작 변인</th><td>${esc(v.independent)}</td></tr>
      <tr><th>종속 변인</th><td>${esc(v.dependent)}</td></tr>
      <tr><th>통제 변인</th><td>${esc(v.controlled)}</td></tr></table></div>` : "";
    const mats = asList(t.materials);
    const matTable = mats.length ? `<div class="table-scroll"><table class="mat-table"><tr><th>준비물</th><th>비고(예상 가격)</th></tr>
      ${mats.map(m => typeof m === "string" ? `<tr><td colspan="2">${esc(m)}</td></tr>` : `<tr><td>${esc(m.item)}</td><td>${esc(m.note)}</td></tr>`).join("")}</table></div>
      ${t.budget ? `<p><small>예상 총비용: ${won(t.budget)}</small></p>` : ""}` : "";
    const isPy = isPython(t);
    const usesArduino = asList(t.methods).includes("아두이노 활용") || (!t.methods && !isPy && t.code);
    const code = t.code ? `<div class="code-head"><small>${isPy ? "Python" : "Arduino 스케치"}</small><button type="button" class="btn ghost small copy-code">코드 복사</button></div><pre class="code"><code>${esc(t.code)}</code></pre>` : "";
    const data = asList(t.dataSources).length ? `<ul class="refs">${asList(t.dataSources).map(d => {
      if (typeof d === "string") return `<li>${esc(d)}</li>`;
      const u = safeUrl(d.url);
      return `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(d.name || d.url)}</a>` : esc(d.name)}${d.note ? ` — <small>${esc(d.note)}</small>` : ""}</li>`;
    }).join("")}</ul>` : "";

    return [
      section("🔎", "연구 동향과 차별점", para(t.trend)),
      section("❓", "탐구 질문", para(t.question)),
      section("💡", "가설", para(t.hypothesis)),
      section("⚖️", "변인 설정", varTable),
      section("", "준비물", matTable),
      section("", "활용 데이터", data),
      section("", "기자재 이용 방법", para(t.access)),
      section("", usesArduino ? "아두이노 회로 연결" : "실험 장치·조건", ulist(t.circuit)),
      section("", isPy ? "데이터 분석 코드 예시 (Python)" : "아두이노 코드 예시", code),
      section("🧪", "연구 프로토콜", olist(t.protocol)),
      section("📊", "데이터 분석 방법", para(t.analysis)),
      section("🎯", "예상 결과 및 결론", para(t.expected)),
      section("🚀", "심화·확장 탐구", para(t.extension)),
      section("⚠️", "안전·윤리 유의사항", t.safety ? `<div class="warnbox">${esc(t.safety)}</div>` : ""),
      section("🧭", "진로 연계", para(t.careerLink)),
      section("📝", "생활기록부 기재 예시", t.record ? `<div class="record">${esc(t.record)}</div><p class="hint small">실제로 수행한 내용과 결과에 맞게 고쳐 쓰세요. 수행하지 않은 활동을 기재할 수 없습니다.</p>` : ""),
      section("📚", "참고문헌·동향 근거", references(t.references)),
      section("", "비슷한 전국과학전람회 작품", (() => {
        const items = fairSearch(fairTokensFromTopic(t), { subjects: asList(t.subjects), limit: 4, minScore: 3 });
        return items.length ? fairList(items) + `<p class="hint small">선행 작품과 무엇을 다르게 할지(변인, 대상, 방법) 정하는 데 참고하세요.</p>` : "";
      })()),
      section("🔗", "선행연구 직접 찾아보기", searchLinks(t.searchTerms))
    ].join("");
  }

  function isPython(t) {
    if (t.codeLang) return /py/i.test(t.codeLang);
    return /^\s*(import |from \w+ import )/m.test(t.code || "");
  }

  function topicCard(t, idx, extra = {}) {
    const subjects = asList(t.methods).map(m => `<span class="tag method">${esc(m)}</span>`).join("") +
      asList(t.subjects).map(s => `<span class="tag ${SUBJECTS.includes(s) ? esc(s) : ""}">${esc(s)}</span>`).join("");
    const pills = [t.level && `난이도 ${t.level}`, t.duration && `기간 ${t.duration}`, t.budget && won(t.budget)].filter(Boolean)
      .map(p => `<span class="pill">${esc(p)}</span>`).join("");
    const reason = extra.why && extra.why.length ? `<span class="score">매칭: ${esc(extra.why.join(", "))}</span>` : "";
    const over = extra.overBudget ? `<span class="pill" style="color:var(--warn)">예산 초과 가능</span>` : "";
    const el = document.createElement("details");
    el.className = "topic";
    if (idx === 0) el.open = true;
    el.innerHTML = `<summary>
        <p class="topic-title"><span class="num">${idx + 1}.</span>${esc(t.title)}</p>
        <div class="topic-meta">${subjects}${pills}${over}${reason}</div>
        <p class="topic-summary">${esc(t.summary)}</p>
      </summary>
      <div class="topic-body">${topicBody(t)}
        <div class="topic-actions">
          <button type="button" class="btn small primary act-pdf">PDF 저장(탐구계획서)</button>
          <button type="button" class="btn small ghost act-md">문서(.md) 내려받기</button>
          <button type="button" class="btn small ghost act-copy">전체 텍스트 복사</button>
        </div>
      </div>`;
    el.querySelector(".act-pdf").addEventListener("click", () => printTopic(t, extra.source));
    el.querySelector(".act-md").addEventListener("click", () => downloadMd(t, extra.source));
    el.querySelector(".act-copy").addEventListener("click", e => copyText(toMarkdown(t, extra.source), e.target));
    const cc = el.querySelector(".copy-code");
    if (cc) cc.addEventListener("click", e => copyText(t.code, e.target));
    return el;
  }

  // ---------------- 내보내기 ----------------
  function toMarkdown(t, source) {
    const v = t.variables || {};
    const L = [];
    L.push(`# ${t.title}`, "");
    if (lastInput) L.push(`- 학생 정보: 희망 진로 ${lastInput.career} / 희망 학과 ${lastInput.major} / 키워드 ${lastInput.keywords}`);
    if (asList(t.methods).length) L.push(`- 연구 방법: ${asList(t.methods).join(", ")}`);
    L.push(`- 융합 과목: ${asList(t.subjects).join(", ")}`, `- 난이도: ${t.level || "-"} / 기간: ${t.duration || "-"} / 예산: ${won(t.budget) || "-"}`);
    if (source) L.push(`- 추천 출처: ${source}`);
    L.push("", `> ${t.summary || ""}`, "");
    const sec = (h, body) => { if (body && String(body).trim()) L.push(`## ${h}`, body, ""); };
    sec("연구 동향과 차별점", t.trend);
    sec("탐구 질문", t.question);
    sec("가설", t.hypothesis);
    sec("변인 설정", (v.independent || v.dependent) ? `- 조작 변인: ${v.independent}\n- 종속 변인: ${v.dependent}\n- 통제 변인: ${v.controlled}` : "");
    sec("준비물", asList(t.materials).map(m => typeof m === "string" ? `- ${m}` : `- ${m.item}${m.note ? ` (${m.note})` : ""}`).join("\n"));
    sec("활용 데이터", asList(t.dataSources).map(d => typeof d === "string" ? `- ${d}` : `- ${d.name || ""} ${d.url || ""}${d.note ? ` — ${d.note}` : ""}`).join("\n"));
    sec("기자재 이용 방법", t.access);
    sec(asList(t.methods).includes("아두이노 활용") ? "아두이노 회로 연결" : "실험 장치·조건", asList(t.circuit).map(c => `- ${c}`).join("\n"));
    sec(isPython(t) ? "데이터 분석 코드 (Python)" : "아두이노 코드", t.code ? (isPython(t) ? "```python\n" : "```cpp\n") + t.code + "\n```" : "");
    sec("연구 프로토콜", asList(t.protocol).map((p, i) => `${i + 1}. ${p}`).join("\n"));
    sec("데이터 분석 방법", t.analysis);
    sec("예상 결과 및 결론", t.expected);
    sec("심화·확장 탐구", t.extension);
    sec("안전·윤리 유의사항", t.safety);
    sec("진로 연계", t.careerLink);
    sec("생활기록부 기재 예시", t.record);
    sec("참고문헌·동향 근거", asList(t.references).map(r => `- [${r.type || "자료"}] ${r.title || ""} ${r.url || ""}${r.note ? ` — ${r.note}` : ""}`).join("\n"));
    sec("선행연구 검색어", asList(t.searchTerms).map(s => `- ${s}`).join("\n"));
    return L.join("\n");
  }

  function fileName(t, ext) {
    return (t.title || "탐구주제").replace(/[\\/:*?"<>|]/g, "").slice(0, 60) + "." + ext;
  }

  function downloadMd(t, source) {
    const blob = new Blob(["﻿" + toMarkdown(t, source)], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName(t, "md");
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }

  function printTopic(t, source) {
    const area = $("#print-area");
    const info = lastInput ? `희망 진로: ${esc(lastInput.career)} · 희망 학과: ${esc(lastInput.major)} · 키워드: ${esc(lastInput.keywords)}` : "";
    area.innerHTML = `<div class="print-head"><small>탐구계획서</small>
      <h2 style="margin:4px 0">${esc(t.title)}</h2><small>${info}</small>
      <p>융합 과목: ${esc(asList(t.subjects).join(", "))} · 난이도 ${esc(t.level || "-")} · 기간 ${esc(t.duration || "-")} · ${esc(won(t.budget))}</p>
      <p><b>요약</b> ${esc(t.summary)}</p></div>
      <div class="topic-body">${topicBody(t)}</div>`;
    const prevTitle = document.title;
    document.title = fileName(t, "pdf").replace(/\.pdf$/, "");
    document.body.classList.add("printing");
    const done = () => { document.body.classList.remove("printing"); document.title = prevTitle; area.innerHTML = ""; window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    setTimeout(() => window.print(), 50);
  }

  async function copyText(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const old = btn.textContent; btn.textContent = "복사됨 ✓"; setTimeout(() => (btn.textContent = old), 1500);
    } catch (_) { alert("복사에 실패했습니다. 직접 선택해서 복사해 주세요."); }
  }

  // ---------------- AI 설정 UI ----------------
  const providerSel = $("#provider"), modelSel = $("#model-select"), modelInput = $("#model"), keyInput = $("#api-key"), remember = $("#remember-key");
  const CUSTOM = "__custom__";
  const loadedModels = {};   // '전체 모델 불러오기'로 받은 목록(공급자별)

  // 모델 선택 상자 구성: 추천 모델 + 불러온 전체 모델 + 직접 입력
  function fillModelSelect(selected) {
    const p = window.AI.PROVIDERS[providerSel.value];
    const known = p.models.map(m => m.id);
    let html = `<optgroup label="추천 모델">${p.models.map(m => `<option value="${esc(m.id)}">${esc(m.label)}</option>`).join("")}</optgroup>`;
    const extra = (loadedModels[providerSel.value] || []).filter(id => !known.includes(id));
    if (extra.length) html += `<optgroup label="내 키로 사용 가능한 다른 모델">${extra.map(id => `<option value="${esc(id)}">${esc(id)}</option>`).join("")}</optgroup>`;
    html += `<option value="${CUSTOM}">직접 입력…</option>`;
    modelSel.innerHTML = html;
    const has = [...modelSel.options].some(o => o.value === selected);
    modelSel.value = has ? selected : CUSTOM;
    modelInput.hidden = modelSel.value !== CUSTOM;
    if (!has) modelInput.value = selected || "";
  }

  function currentModel() {
    return modelSel.value === CUSTOM ? modelInput.value.trim() : modelSel.value;
  }

  function refreshProviderUI() {
    const p = window.AI.PROVIDERS[providerSel.value];
    fillModelSelect(store.get(`model_${providerSel.value}`) || p.defaultModel);
    keyInput.value = store.get(`key_${providerSel.value}`) || "";
    remember.checked = (() => { try { return !!localStorage.getItem(`key_${providerSel.value}`); } catch (_) { return false; } })();
    $("#key-help").innerHTML = p.keyHelp;
    refreshStatus();
  }

  function refreshStatus() {
    const s = $("#ai-status");
    const p = window.AI.PROVIDERS[providerSel.value];
    if (keyInput.value.trim()) { s.textContent = `${p.label} 연결됨`; s.classList.add("on"); }
    else { s.textContent = "연결 안 됨 · 기본 주제만 추천"; s.classList.remove("on"); }
  }

  function saveKeySettings() {
    const prov = providerSel.value;
    const key = keyInput.value.trim();
    if (key) store.set(`key_${prov}`, key, remember.checked); else store.del(`key_${prov}`);
    if (currentModel()) store.set(`model_${prov}`, currentModel(), true);
    store.set("provider", prov, true);
  }

  providerSel.addEventListener("change", () => { store.set("provider", providerSel.value, true); refreshProviderUI(); });
  keyInput.addEventListener("input", () => { refreshStatus(); saveKeySettings(); });
  modelSel.addEventListener("change", () => {
    modelInput.hidden = modelSel.value !== CUSTOM;
    if (modelSel.value === CUSTOM) modelInput.focus();
    saveKeySettings();
  });
  modelInput.addEventListener("change", saveKeySettings);
  remember.addEventListener("change", saveKeySettings);
  $("#toggle-key").addEventListener("click", e => {
    keyInput.type = keyInput.type === "password" ? "text" : "password";
    e.target.textContent = keyInput.type === "password" ? "보기" : "숨기기";
  });
  $("#clear-key").addEventListener("click", () => {
    for (const p of Object.keys(window.AI.PROVIDERS)) store.del(`key_${p}`);
    keyInput.value = ""; remember.checked = false; refreshStatus();
    alert("이 브라우저에 저장된 모든 API 키를 삭제했습니다.");
  });
  $("#load-models").addEventListener("click", async e => {
    const key = keyInput.value.trim();
    if (!key) { alert("먼저 API 키를 입력하세요."); return; }
    const btn = e.target; btn.disabled = true; btn.textContent = "…";
    try {
      const ids = await window.AI.listModels(providerSel.value, key);
      loadedModels[providerSel.value] = ids;
      fillModelSelect(currentModel());
      alert(`사용 가능한 모델 ${ids.length}개를 불러왔습니다. 모델 선택 상자의 '내 키로 사용 가능한 다른 모델'에서 고를 수 있습니다.\n\n상위 모델일수록 요금이 비싸고 응답이 느립니다. 일부 모델은 웹 검색을 지원하지 않아 오류가 날 수 있습니다.`);
    } catch (err) { alert("모델 목록을 불러오지 못했습니다.\n" + err.message); }
    finally { btn.disabled = false; btn.textContent = "전체 모델 불러오기"; }
  });

  // ---------------- 제출 ----------------
  let lastInput = null;

  function readInput() {
    return {
      career: $("#career").value.trim(),
      major: $("#major").value.trim(),
      keywords: $("#keywords").value.trim(),
      grade: $("#grade").value,
      duration: $("#duration").value,
      budget: $("#budget").value,
      methods: $$("#methods input:checked").map(i => i.value),
      fusion: $$("#fusion-subjects input:checked").map(i => i.value),
      taken: $$("#taken-subjects input:checked").map(i => i.value)
    };
  }

  function showTab(name) {
    $$(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
    $("#panel-ai").hidden = name !== "ai";
    $("#panel-db").hidden = name !== "db";
    $("#panel-fair").hidden = name !== "fair";
  }

  // ---------------- 전국과학전람회 선행 연구 검색 ----------------
  const FAIR = window.FAIR_DB || null;
  const TOP_AWARD = /대통령|국무총리|부통령|부총리|국회의장|최우수|특상|1등/;
  const fairLink = ntt => FAIR.detail + ntt;

  /* tokens: [{t: 단어, w: 가중치}] → 제목에 포함된 단어로 점수 계산 */
  function fairSearch(tokens, { subjects = [], limit = 20, minScore = 3 } = {}) {
    if (!FAIR) return [];
    const toks = tokens.filter(x => x.t && x.t.length >= 2);
    if (!toks.length) return [];
    const subjIdx = subjects.map(s => FAIR.subjects.indexOf(s)).filter(i => i >= 0);
    const out = [];
    for (const r of FAIR.rows) {
      const title = r[6].toLowerCase();
      let s = 0, hit = [];
      for (const { t, w } of toks) if (title.includes(t)) { s += w; hit.push(t); }
      if (s < minScore) continue;
      if (subjIdx.length && subjIdx.includes(r[3])) s += 1.5;
      if (r[1] >= 2015) s += 1; else if (r[1] < 2000) s -= 1;
      if (TOP_AWARD.test(FAIR.awards[r[4]])) s += 0.5;
      if (r[5]) s -= 0.5;                                  // 지도논문은 조금 뒤로
      out.push({ r, s, hit });
    }
    return out.sort((a, b) => b.s - a.s || b.r[1] - a.r[1]).slice(0, limit);
  }

  function fairTokensFromInput(input) {
    const kw = tokenize(input.keywords);
    const extra = expand(tokenize(input.keywords + " " + input.career + " " + input.major)).filter(t => !kw.includes(t));
    return kw.map(t => ({ t, w: 3 })).concat(extra.map(t => ({ t, w: 1 })));
  }

  function fairTokensFromTopic(t) {
    const kws = asList(t.keywords).map(k => String(k).toLowerCase());
    const titleWords = String(t.title || "").toLowerCase().split(/[\s,·()\-:]+/)
      .map(w => w.replace(/(에|의|을|를|과|와|이|가|에서|으로|로|에\s*따른|따른|및)$/, "")).filter(w => w.length >= 2);
    return [...new Set(kws)].map(k => ({ t: k, w: 2 })).concat([...new Set(titleWords)].filter(w => !kws.includes(w)).map(w => ({ t: w, w: 1 })));
  }

  function fairList(items) {
    return `<ul class="refs fair-list">${items.map(({ r }) => {
      const award = FAIR.awards[r[4]];
      return `<li><span class="ref-type">${r[1]} · ${esc(FAIR.fields[r[2]])}</span>` +
        `<a href="${esc(fairLink(r[0]))}" target="_blank" rel="noopener">${esc(r[6])}</a>` +
        `${r[5] ? " <small>(지도논문)</small>" : ""}${award ? ` <small>— ${esc(award)}</small>` : ""}</li>`;
    }).join("")}</ul>`;
  }

  function renderFair(input) {
    const tab = $("#tab-fair"), panel = $("#panel-fair");
    if (!FAIR) { tab.hidden = true; return []; }
    const items = fairSearch(fairTokensFromInput(input), { subjects: input.fusion, limit: 30 });
    tab.hidden = false;
    $("#fair-count").textContent = items.length;
    if (!items.length) {
      panel.innerHTML = `<p class="panel-note">입력한 키워드가 제목에 들어간 전국과학전람회 작품을 찾지 못했습니다. 키워드를 더 일반적인 단어로 바꿔 보세요.</p>`;
      return [];
    }
    // 연대별 작품 수(동향)
    const byDecade = {};
    for (const { r } of fairSearch(fairTokensFromInput(input), { limit: 100000 })) {
      const d = Math.floor(r[1] / 10) * 10; byDecade[d] = (byDecade[d] || 0) + 1;
    }
    const decades = Object.keys(byDecade).sort();
    const max = Math.max(...Object.values(byDecade));
    panel.innerHTML = `<p class="panel-note">전국과학전람회 역대 출품·수상작 ${FAIR.rows.length.toLocaleString("ko-KR")}건 가운데 입력한 키워드와 관련된 작품입니다. 같은 주제를 그대로 하기보다, 선행 연구와 무엇을 다르게 할지 정하는 데 활용하세요.</p>
      <div class="trend-box"><h4>연대별 관련 작품 수</h4><div class="decade-bars">${decades.map(d =>
        `<div class="bar-row"><span>${d}년대</span><i style="width:${Math.max(4, byDecade[d] / max * 100)}%"></i><b>${byDecade[d]}</b></div>`).join("")}</div></div>
      ${fairList(items)}
      <p class="hint small">출처: 국립중앙과학관 전국과학전람회 통합검색. 제목을 누르면 원문 페이지(연구 요약·보고서)로 이동합니다.</p>`;
    return items;
  }
  $$(".tab").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));

  function renderDB(input) {
    const { list, exact } = matchDB(input);
    const panel = $("#panel-db");
    panel.innerHTML = `<p class="panel-note">${exact
      ? "입력한 진로·키워드와 관련된 기본 주제입니다."
      : "입력과 정확히 맞는 기본 주제가 없어 선택한 연구 방법·융합 과목과 가까운 주제를 보여 줍니다. 최신 연구 동향 반영 기능을 함께 사용해 보세요."}</p>`;
    list.forEach((s, i) => panel.appendChild(topicCard(s.topic, i, { why: s.why, overBudget: s.overBudget, source: "기본 추천" })));
    $("#db-count").textContent = list.length;
    return list.map(s => s.topic.title);
  }

  async function renderAI(input, dbTitles, fairItems = []) {
    const panel = $("#panel-ai");
    const prov = providerSel.value, key = keyInput.value.trim(), model = currentModel() || window.AI.PROVIDERS[prov].defaultModel;
    const label = window.AI.PROVIDERS[prov].label;
    $("#tab-ai").hidden = false;
    $("#ai-count").textContent = "…";
    panel.innerHTML = `<div class="loading"><div class="spinner"></div><div>과학전람회 수상작, 논문, 뉴스를 검색해 주제를 구성하고 있습니다.<br><small>1~3분 정도 걸릴 수 있습니다. 그동안 '기본 추천 주제' 탭을 먼저 살펴보세요.</small></div></div>`;
    try {
      const prior = fairItems.slice(0, 15).map(({ r }) => ({ year: r[1], field: FAIR.fields[r[2]], award: FAIR.awards[r[4]], title: r[6], url: fairLink(r[0]) }));
      const out = await window.AI.recommend(prov, key, model, input, dbTitles, prior);
      panel.innerHTML = "";
      if (!out.parsed) {
        panel.innerHTML = `<p class="panel-note">응답을 정해진 형식으로 해석하지 못해 원문을 그대로 보여 줍니다.</p><div class="raw">${esc(out.text || "(빈 응답)")}</div>`;
        $("#ai-count").textContent = "!";
      } else {
        const topics = out.parsed.topics.filter(t => t && t.title);
        if (out.parsed.trendSummary) {
          const box = document.createElement("div");
          box.className = "trend-box";
          box.innerHTML = `<h4>최근 연구 동향 요약</h4><p>${esc(out.parsed.trendSummary)}</p>`;
          panel.appendChild(box);
        }
        topics.forEach((t, i) => panel.appendChild(topicCard(t, i, { source: `${label} ${model}` })));
        $("#ai-count").textContent = topics.length;
      }
      if (out.sources && out.sources.length) {
        const d = document.createElement("details");
        d.className = "searched";
        d.innerHTML = `<summary>이번에 검색한 자료 ${out.sources.length}건 보기</summary><ul class="refs">${out.sources.slice(0, 40).map(s => {
          const u = safeUrl(s.url); return `<li>${u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${esc(s.title)}</a>` : esc(s.title)}</li>`;
        }).join("")}</ul>`;
        panel.appendChild(d);
      }
    } catch (err) {
      let msg = err.message || String(err);
      if (/Failed to fetch|NetworkError|Load failed/i.test(msg)) msg += "\n네트워크 연결 또는 학교 방화벽에서 AI 서버 접속이 차단되었을 수 있습니다.";
      panel.innerHTML = `<div class="error">최신 동향 반영 주제를 불러오는 중 오류가 발생했습니다.\n${esc(msg)}</div><p class="hint small">기본 추천 주제는 정상적으로 사용할 수 있습니다.</p>`;
      $("#ai-count").textContent = "!";
    }
  }

  $("#topic-form").addEventListener("submit", async e => {
    e.preventDefault();
    const input = readInput();
    lastInput = input;
    saveKeySettings();
    try { localStorage.setItem("lastInput", JSON.stringify({ ...input })); } catch (_) {}

    $("#results").hidden = false;
    const dbTitles = renderDB(input);
    const fairItems = renderFair(input);
    const useAI = !!keyInput.value.trim();
    $("#tab-ai").hidden = !useAI;
    showTab(useAI ? "ai" : "db");
    $("#results").scrollIntoView({ behavior: "smooth", block: "start" });

    if (useAI) {
      const btn = $("#submit-btn");
      btn.disabled = true; btn.textContent = "검색 중…";
      await renderAI(input, dbTitles, fairItems);
      btn.disabled = false; btn.textContent = "탐구 주제 추천받기";
    }
  });

  $("#reset-btn").addEventListener("click", () => {
    ["#career", "#major", "#keywords"].forEach(s => ($(s).value = ""));
    $("#results").hidden = true;
    try { localStorage.removeItem("lastInput"); } catch (_) {}
  });

  // ---------------- exe(내 컴퓨터 실행) 모드: 실행 신호 + 종료 버튼 ----------------
  (function desktopMode() {
    if (location.hostname !== "127.0.0.1") return;          // 웹사이트로 배포한 경우에는 동작 안 함
    const ping = () => fetch("/__ping", { cache: "no-store" }).catch(() => {});
    fetch("/__ping", { cache: "no-store" }).then(r => {
      if (r.status !== 204) return;
      setInterval(ping, 20000);                            // 탭이 열려 있는 동안 실행기를 유지
      document.addEventListener("visibilitychange", () => { if (!document.hidden) ping(); });
      const bar = document.createElement("div");
      bar.className = "desktop-bar wrap";
      bar.innerHTML = `<small>내 컴퓨터에서 실행 중 · 브라우저 탭을 닫으면 약 3분 뒤 자동으로 종료됩니다.</small>
        <button type="button" class="btn small ghost" id="quit-app">프로그램 종료</button>`;
      document.querySelector(".site-footer").before(bar);
      $("#quit-app").addEventListener("click", () => {
        if (!confirm("프로그램을 종료할까요? 종료 후에는 이 탭을 닫아 주세요.")) return;
        fetch("/__quit", { cache: "no-store" }).finally(() => {
          document.body.innerHTML = `<main class="wrap"><section class="card"><h2>프로그램이 종료되었습니다</h2><p>이 탭을 닫아도 됩니다. 다시 사용하려면 실행 파일을 다시 실행하세요.</p></section></main>`;
        });
      });
    }).catch(() => {});
  })();

  // ---------------- 초기화 ----------------
  (function init() {
    try {
      const saved = JSON.parse(localStorage.getItem("lastInput") || "null");
      if (saved) {
        $("#career").value = saved.career || ""; $("#major").value = saved.major || ""; $("#keywords").value = saved.keywords || "";
        if (saved.grade) $("#grade").value = saved.grade;
        if (saved.duration) $("#duration").value = saved.duration;
        if (saved.budget) $("#budget").value = saved.budget;
        $$("#fusion-subjects input").forEach(i => (i.checked = (saved.fusion || []).includes(i.value)));
        $$("#methods input").forEach(i => (i.checked = (saved.methods || []).includes(i.value)));
        $$("#taken-subjects input").forEach(i => (i.checked = (saved.taken || []).includes(i.value)));
      }
    } catch (_) {}
    const prov = store.get("provider");
    if (prov && window.AI.PROVIDERS[prov]) providerSel.value = prov;
    refreshProviderUI();
  })();
})();
