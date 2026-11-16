/*
 * AI 연동 모듈 — Claude(Anthropic), ChatGPT(OpenAI), Gemini(Google)
 * 학생의 API 키로 브라우저에서 각 회사 API를 직접 호출합니다(별도 서버 없음).
 * 세 AI 모두 웹 검색 도구를 켜서 최신 과학전람회·논문·뉴스를 찾아 반영하게 합니다.
 */
(function () {
  const PROVIDERS = {
    claude: {
      label: "Claude",
      defaultModel: "claude-opus-5-5",
      models: [
        { id: "claude-fable-5-2", label: "Claude Fable 5.2 — 최고 성능 · 가장 비쌈 · 느림" },
        { id: "claude-opus-5-5", label: "Claude Opus 5.5 — 고성능 (추천)" },
        { id: "claude-sonnet-5-5", label: "Claude Sonnet 5.5 — 균형 · 저렴" },
        { id: "claude-haiku-5-5", label: "Claude Haiku 5.5 — 빠름 · 가장 저렴" }
      ],
      keyHelp: 'Claude API 키는 <a href="https://platform.claude.com/settings/keys" target="_blank" rel="noopener">Claude 개발자 콘솔</a>에서 발급합니다. (sk-ant-로 시작)',
      keyPattern: /^sk-ant-/
    },
    openai: {
      label: "ChatGPT",
      defaultModel: "gpt-5.5",
      models: [
        { id: "gpt-5.6", label: "GPT-5.6 — 최신 · 고성능" },
        { id: "gpt-5.5", label: "GPT-5.5 — 고성능 (추천)" },
        { id: "gpt-5.4", label: "GPT-5.4 — 이전 버전" },
        { id: "gpt-5-mini", label: "GPT-5 mini — 빠름 · 저렴" }
      ],
      keyHelp: 'OpenAI API 키는 <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener">OpenAI 플랫폼</a>에서 발급합니다. (sk-로 시작) ChatGPT 유료 구독과 API 요금은 별개입니다.',
      keyPattern: /^sk-/
    },
    gemini: {
      label: "Gemini",
      defaultModel: "gemini-3.1-pro-preview",
      models: [
        { id: "gemini-3.1-pro-preview", label: "Gemini 3.1 Pro — 최고 성능 (추천)" },
        { id: "gemini-3-flash-preview", label: "Gemini 3 Flash — 빠름 · 저렴" },
        { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro — 이전 버전" },
        { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash — 무료 등급에 적합" }
      ],
      keyHelp: 'Gemini API 키는 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>에서 무료 등급으로도 발급할 수 있습니다. (AIza로 시작)',
      keyPattern: /^AIza/
    }
  };

  const SYSTEM_PROMPT = `당신은 한국 고등학생의 과학 탐구(전국과학전람회, 학교 심화 탐구) 지도 경험이 풍부한 과학 교사이자 연구 멘토입니다.
학생의 희망 진로·학과·키워드·연구 방법·조건에 맞추어 물리, 화학, 생명과학, 지구과학, 정보를 융합한 탐구 주제를 추천합니다.

반드시 지킬 원칙:
1. 먼저 웹 검색 도구로 다음을 찾아 연구 동향을 파악하세요.
   - 학생 대회 수상작·출품작: 전국과학전람회(국립중앙과학관), 전국학생과학발명품경진대회, 한화사이언스챌린지, 삼성휴먼테크논문대상 등 (중복을 피하고 차별점을 만들기 위함)
   - 학술 논문: Google Scholar의 SCI(E)급 국제 학술지 논문, RISS·DBpia·KCI의 국내 학술지 논문과 학위논문, 대학 연구실·대학 리포지토리에 공개된 연구 (최근 3~5년 우선)
   - 관련 최신 뉴스(사회적 이슈, 정책, 산업 동향)
2. 학생이 고른 연구 방법에 맞는 주제만 제안하고, 각 주제의 methods 첫 항목에 주된 방법을 쓰세요. 여러 방법을 골랐다면 3개 주제가 방법별로 고르게 나오게 하세요. 방법을 고르지 않았다면 서로 다른 방법의 주제를 섞으세요.
   - 실험: 학교 과학실의 기본 기구·시약으로 하는 실험. 아두이노나 전자 장치 없이 설계하세요. circuit에는 실험 장치 구성과 조건을 쓰고 code는 빈 문자열로 두세요.
   - 데이터 분석: 주제 분야에 맞는 실제 공개 데이터(예: 생명과학 NCBI·PDB·GBIF, 화학 PubChem·식품의약품안전처 식품영양성분DB, 물리 CERN Open Data·NASA, 지구과학 기상청·NOAA, 사회·보건 KOSIS·공공데이터포털)를 내려받아 파이썬(또는 엑셀)으로 분석. dataSources에 실제 데이터 출처와 URL을 넣고, code에는 pandas 등으로 작성한 파이썬 분석 코드를, codeLang은 "python"으로 쓰세요.
   - 아두이노 활용: 아두이노 같은 마이크로컨트롤러와 저가 센서로 직접 측정. circuit에 핀 연결, code에 아두이노 스케치, codeLang은 "arduino".
   - 첨단 기자재 활용: UV-Vis 분광광도계, PCR·전기영동, 형광·디지털 현미경, 열화상 카메라, GC·FT-IR(외부 의뢰) 등 고등학생이 학교, 시·도 과학교육원, 거점학교, 대학 연계 프로그램을 통해 이용할 수 있는 장비. access에 장비를 어디서 어떻게 이용할 수 있는지와 장비가 없을 때의 대체 방법을 쓰세요. 장비 구입비는 예산에 넣지 말고 시약·소모품만 예산에 넣으세요.
3. 학생이 제시한 예산·기간·학년·이수 과목 수준을 지키세요. 예산을 넘는 준비물은 넣지 마세요.
   예산이 30만원 이상이면 규모를 키운 구성(여러 대의 센서, 라즈베리파이, 3D 프린팅 부품, 더 많은 시약·키트 등)도 가능합니다.
   고급 과목·실험 과목·과학과제 연구를 이수한 학생에게는 그 과목 수준의 개념과 실험 기법을 활용한 심화 주제를 제안하세요.
4-1. 제목은 실제 전국과학전람회 보고서처럼 친숙하고 과학적인 용어로 쓰세요.
   - 장비·도구 이름(아두이노, 센서, 머신러닝 등)보다 탐구하는 현상과 변인이 드러나게 쓰세요. 예) "온도와 pH에 따른 감자 카탈레이스의 활성", "추의 모양에 따른 진자 운동의 공기 저항과 감쇠 특성"
4-2. 융합 과목은 학생이 체크한 과목을 그대로 따르세요.
   - subjects에는 학생이 고른 희망 융합 과목만 넣고, 고르지 않은 과목은 넣지 마세요. 2개 이상 골랐다면 각 주제가 그중 2개 이상을 실제로 융합해야 합니다.
   - 탐구의 핵심 개념·변인·분석도 고른 과목의 내용이어야 합니다. 고르지 않은 과목(예: 지구과학·환경)을 배경으로 끌어오지 마세요.
   - 특정 분야(환경, 기후, 대기 등)로 치우치지 말고, 고른 과목들 사이에서 3개 주제의 분야가 고르게 나오게 하세요.
   - 희망 융합 과목을 고르지 않았다면 진로·학과·키워드에 가장 가까운 과목을 고르세요.
   - "~에 따른 ~의 ~", "~이 ~에 미치는 영향" 같은 간결한 형식으로, 40자 안팎으로 쓰세요.
   - "혁신적인", "스마트", "AI 기반", "~를 활용한 ~ 시스템 개발" 같은 홍보성 수식어는 쓰지 마세요.
4. 참고문헌(references)에는 이번에 웹 검색으로 실제로 찾아 확인한 자료만, 검색 결과에 나온 실제 URL과 함께 넣으세요. 존재를 확인하지 못한 논문·저자·DOI·URL은 절대 만들어 내지 마세요. 확인한 자료가 부족하면 적게 넣고, 대신 searchTerms에 학생이 직접 찾아볼 검색어를 넣으세요.
5. 아두이노 코드는 실제로 컴파일될 수 있도록, 사용하는 라이브러리 이름을 주석으로 명시하고 핀 번호를 회로 설명과 일치시키세요. 파이썬 코드는 사용하는 데이터 파일의 열 이름을 주석으로 설명하세요.
6. 사람 대상 측정이 포함되면 참여자 동의와 개인정보 보호 절차를, 위험 요소가 있으면 안전 수칙을 넣으세요.
7. 생활기록부 기재 예시는 학생이 실제로 수행했을 때 쓸 수 있는 관찰형 문장(~함, ~보임)으로 3~4문장 작성하되, 과장하거나 수상·논문 게재 등을 언급하지 마세요.
8. 모든 내용은 한국어로 작성하세요.

출력 형식: 설명 문장 없이 아래 JSON 하나만 \`\`\`json 코드 블록 안에 출력하세요.
{
  "trendSummary": "검색으로 파악한 이 분야 최근 연구 동향 요약(3~5문장)",
  "topics": [
    {
      "title": "탐구 주제 제목(현상과 변인 중심, 40자 안팎)",
      "methods": ["실험" | "데이터 분석" | "아두이노 활용" | "첨단 기자재 활용" — 첫 항목이 주된 방법],
      "subjects": [학생이 고른 희망 융합 과목 중에서만, 주된 과목을 첫 번째로],
      "level": "기초" | "중급" | "심화",
      "duration": "예상 기간",
      "budget": 예상 총비용(원, 숫자),
      "summary": "한두 문장 요약",
      "trend": "이 주제와 관련된 연구 동향과 기존 과학전람회 출품작과의 차별점",
      "question": "탐구 질문",
      "hypothesis": "가설",
      "variables": { "independent": "조작 변인", "dependent": "종속 변인", "controlled": "통제 변인" },
      "materials": [ { "item": "준비물", "note": "예상 가격·구입처·대체품" } ],
      "dataSources": [ { "name": "데이터 이름", "url": "실제 URL", "note": "사용할 항목" } ] (데이터 분석이 아니면 빈 배열),
      "access": "첨단 기자재 이용 방법(첨단 기자재 활용이 아니면 빈 문자열)",
      "circuit": [ "아두이노면 핀 연결, 그 외에는 실험 장치 구성·조건" ],
      "codeLang": "arduino" | "python" | "",
      "code": "아두이노 스케치 또는 파이썬 분석 코드 전체(줄바꿈 포함 문자열, 해당 없으면 빈 문자열)",
      "protocol": [ "단계별 연구 절차(반복 횟수, 측정 간격 포함)" ],
      "analysis": "데이터 분석 방법(그래프, 통계, 파이썬 등)",
      "expected": "예상 결과와 결론, 예상되는 오차 원인",
      "extension": "후속·심화 탐구 아이디어",
      "safety": "안전·윤리 유의사항",
      "record": "생활기록부(세특) 기재 예시",
      "careerLink": "희망 진로·학과와의 연결",
      "searchTerms": [ "학생이 직접 선행연구를 찾을 검색어(한국어, 영어)" ],
      "references": [ { "type": "과학전람회" | "SCI" | "KCI" | "뉴스" | "기타", "title": "자료 제목", "url": "실제 URL", "note": "이 자료에서 참고할 점" } ]
    }
  ]
}`;

  function buildUserPrompt(input, dbTitles, prior) {
    const lines = [
      `희망 진로: ${input.career}`,
      `희망 학과: ${input.major}`,
      `희망 주제 키워드: ${input.keywords}`,
      `학년: 고등학교 ${input.grade}학년`,
      `이수(예정) 과목: ${input.taken.length ? input.taken.join(", ") : "통합과학 수준"}`,
      `연구 방법: ${input.methods && input.methods.length ? input.methods.join(", ") : "제한 없음(여러 방법을 섞어 제안)"}`,
      `희망 융합 과목: ${input.fusion.length ? input.fusion.join(", ") + " (이 과목들만 사용)" : "제한 없음"}`,
      `탐구 기간: ${input.duration}`,
      `예산: ${Number(input.budget).toLocaleString("ko-KR")}원 이하 (재료·시약·소모품 기준)`,
      `오늘 날짜: ${new Date().toISOString().slice(0, 10)}`
    ];
    let p = `다음 학생에게 맞는 탐구 주제 3개를 추천해 주세요.\n\n${lines.join("\n")}\n`;
    if (dbTitles && dbTitles.length) {
      p += `\n아래 주제는 이미 기본 추천으로 보여 주었으니, 같은 주제는 피하고 새로운 관점의 주제를 제안하세요:\n- ${dbTitles.join("\n- ")}\n`;
    }
    if (prior && prior.length) {
      p += `\n국립중앙과학관 전국과학전람회 통합검색에서 찾은 관련 역대 출품·수상작입니다(제목만 확인된 실제 자료).\n` +
        `이 작품들과 주제가 겹치지 않게 하고, 무엇이 다른지 trend 항목에 밝히세요. 참고했다면 references에 type "과학전람회"로 아래 URL을 그대로 쓰세요:\n` +
        prior.map(x => `- [${x.year} ${x.field} ${x.award}] ${x.title} — ${x.url}`).join("\n") + "\n";
    }
    p += `\n웹 검색으로 동향을 확인한 뒤, 지정된 JSON 형식으로만 답하세요.`;
    return p;
  }

  async function readError(res) {
    let msg = `HTTP ${res.status}`;
    try {
      const j = await res.json();
      msg += " — " + (j.error && (j.error.message || j.error.type) || JSON.stringify(j).slice(0, 300));
    } catch (_) { /* ignore */ }
    if (res.status === 401 || res.status === 403) msg += "\nAPI 키가 올바른지, 해당 모델 사용 권한이 있는지 확인하세요.";
    if (res.status === 429) msg += "\n요청 한도나 크레딧을 초과했습니다. 잠시 후 다시 시도하거나 결제·한도 설정을 확인하세요.";
    if (res.status === 404) msg += "\n모델 이름을 확인하세요. '목록' 버튼으로 사용 가능한 모델을 불러올 수 있습니다.";
    return new Error(msg);
  }

  // ---------- Claude ----------
  function claudeHeaders(key, withFallback) {
    const h = {
      "content-type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2026-10-21",
      "anthropic-dangerous-direct-browser-access": "true"
    };
    if (withFallback) h["anthropic-beta"] = "server-side-fallback-2026-07-01";
    return h;
  }

  async function callClaude(key, model, system, user) {
    // 최신 웹 검색 도구는 Opus/Sonnet 계열에서, Haiku는 기본 웹 검색 도구 사용
    const isHaiku = /haiku/.test(model);
    const searchType = isHaiku ? "web_search_20250305" : "web_search_20260209";
    // 안전 분류기 거절 시 서버가 다른 모델로 자동 재시도하도록 설정(지원 모델만)
    const withFallback = /^claude-(opus-5-5|sonnet-5-5|opus-5|fable)/.test(model);
    const messages = [{ role: "user", content: user }];
    const sources = new Map();
    let text = "";

    for (let turn = 0; turn < 5; turn++) {
      const body = {
        model,
        max_tokens: 16000,
        system,
        messages,
        tools: [{ type: searchType, name: "web_search", max_uses: 8 }]
      };
      if (!isHaiku) body.output_config = { effort: "medium" };
      if (withFallback) body.fallbacks = "default";

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: claudeHeaders(key, withFallback), body: JSON.stringify(body)
      });
      if (!res.ok) throw await readError(res);
      const data = await res.json();

      for (const block of data.content || []) {
        if (block.type === "text") text += block.text;
        if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
          for (const r of block.content) if (r.url) sources.set(r.url, r.title || r.url);
        }
      }
      if (data.stop_reason === "refusal") throw new Error("AI가 이 요청에 대한 답변을 거절했습니다. 키워드를 바꿔 다시 시도해 보세요.");
      if (data.stop_reason === "pause_turn") {
        // 긴 웹 검색 중간에 멈춘 경우: 이어서 진행
        messages.push({ role: "assistant", content: data.content });
        continue;
      }
      if (data.stop_reason === "max_tokens") text += "\n[주의: 응답 길이 제한으로 일부가 잘렸을 수 있습니다]";
      break;
    }
    return { text, sources: [...sources].map(([url, title]) => ({ url, title })) };
  }

  // ---------- OpenAI ----------
  async function callOpenAI(key, model, system, user) {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "content-type": "application/json", "authorization": `Bearer ${key}` },
      body: JSON.stringify({
        model,
        instructions: system,
        input: user,
        tools: [{ type: "web_search" }],
        max_output_tokens: 16000
      })
    });
    if (!res.ok) throw await readError(res);
    const data = await res.json();
    let text = "";
    const sources = new Map();
    for (const item of data.output || []) {
      if (item.type !== "message") continue;
      for (const c of item.content || []) {
        if (c.type === "output_text") {
          text += c.text;
          for (const a of c.annotations || []) if (a.type === "url_citation" && a.url) sources.set(a.url, a.title || a.url);
        }
        if (c.type === "refusal") throw new Error("AI가 이 요청에 대한 답변을 거절했습니다: " + c.refusal);
      }
    }
    if (!text && data.output_text) text = data.output_text;
    return { text, sources: [...sources].map(([url, title]) => ({ url, title })) };
  }

  // ---------- Gemini ----------
  async function callGemini(key, model, system, user) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        tools: [{ google_search: {} }],
        generationConfig: { maxOutputTokens: 16000 }
      })
    });
    if (!res.ok) throw await readError(res);
    const data = await res.json();
    const cand = (data.candidates || [])[0];
    if (!cand) {
      const reason = data.promptFeedback && data.promptFeedback.blockReason;
      throw new Error("Gemini가 응답을 생성하지 않았습니다." + (reason ? ` (차단 사유: ${reason})` : ""));
    }
    const text = ((cand.content && cand.content.parts) || []).map(p => p.text || "").join("");
    const sources = new Map();
    const chunks = (cand.groundingMetadata && cand.groundingMetadata.groundingChunks) || [];
    for (const ch of chunks) if (ch.web && ch.web.uri) sources.set(ch.web.uri, ch.web.title || ch.web.uri);
    return { text, sources: [...sources].map(([url, title]) => ({ url, title })) };
  }

  // ---------- 모델 목록 ----------
  async function listModels(provider, key) {
    if (provider === "claude") {
      const res = await fetch("https://api.anthropic.com/v1/models?limit=100", { headers: claudeHeaders(key, false) });
      if (!res.ok) throw await readError(res);
      const j = await res.json();
      return (j.data || []).map(m => m.id);
    }
    if (provider === "openai") {
      const res = await fetch("https://api.openai.com/v1/models", { headers: { authorization: `Bearer ${key}` } });
      if (!res.ok) throw await readError(res);
      const j = await res.json();
      return (j.data || []).map(m => m.id).filter(id => /^(gpt-|o\d)/.test(id) && !/(audio|realtime|image|tts|transcribe|embedding)/.test(id)).sort().reverse();
    }
    if (provider === "gemini") {
      const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=200", { headers: { "x-goog-api-key": key } });
      if (!res.ok) throw await readError(res);
      const j = await res.json();
      return (j.models || [])
        .filter(m => (m.supportedGenerationMethods || []).includes("generateContent") && /gemini/.test(m.name))
        .map(m => m.name.replace(/^models\//, ""));
    }
    return [];
  }

  // ---------- 응답 JSON 파싱 ----------
  function parseResult(text) {
    let src = text;
    const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fence) src = fence[1];
    const tryParse = s => { try { return JSON.parse(s); } catch (_) { return null; } };
    let obj = tryParse(src.trim());
    if (!obj) {
      const i = src.indexOf("{"), j = src.lastIndexOf("}");
      if (i >= 0 && j > i) obj = tryParse(src.slice(i, j + 1));
    }
    if (!obj) return null;
    if (Array.isArray(obj)) obj = { topics: obj };
    if (!Array.isArray(obj.topics)) return null;
    return obj;
  }

  async function recommend(provider, key, model, input, dbTitles, prior) {
    const user = buildUserPrompt(input, dbTitles, prior);
    const fn = { claude: callClaude, openai: callOpenAI, gemini: callGemini }[provider];
    if (!fn) throw new Error("알 수 없는 AI 종류입니다.");
    const out = await fn(key, model, SYSTEM_PROMPT, user);
    return { ...out, parsed: parseResult(out.text) };
  }

  window.AI = { PROVIDERS, recommend, listModels };
})();
