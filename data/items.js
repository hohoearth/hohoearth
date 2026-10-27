// ==============================================================================
// 📚 교육활동 게시물 데이터 파일 (data/items.js)
// 
// 💡 [새로운 게시물 등록하는 방법]
// 아래 archiveItems 배열의 맨 위에 다음 템플릿을 복사해서 붙여넣고 내용을 채워주시면 끝납니다!
//
// {
//   id: "my-new-post-1",              // 고유 ID (영문/숫자, 중복되지 않게)
//   category: "class",                // 탭 ID 중 하나 ("class", "project", "tools", "lecture", "essay")
//   title: "게시물 제목",
//   date: "2026.05",                  // 작성 날짜
//   summary: "카드 목록에 보일 1~2줄 요약 설명",
//   tags: ["태그1", "태그2"],           // 검색용 태그
//   thumbnail: "이미지URL 또는 사진경로",  // 카드 썸네일 이미지
//   featured: false,                  // true로 하면 '추천' 배지 표시
//   links: [                          // 첨부파일이나 외부 링크 버튼 (없으면 빈배열 [])
//     { label: "지도안 다운로드", url: "https://링크주소", icon: "file-text" }
//   ],
//   content: `
// ### 여기에 마크다운으로 상세 내용을 자유롭게 적으세요!
// - 수업 준비물
// - 활동 내용
//   `
// },
// ==============================================================================

const archiveItems = [
  // --- 1. 수업 아카이브 샘플 ---
  {
    id: "class-ai-sensor",
    category: "class",
    title: "아두이노 & 인공지능 센서로 구현하는 스마트 스마트팜 프로젝트",
    date: "2026.04",
    year: "2026",
    summary: "중·고등학교 공통과학 및 정보 융합 12차시 프로젝트. 조도, 온습도 센서 데이터 수집부터 머신러닝 생육 예측 모델 구축까지 다룹니다.",
    tags: ["융합과학", "정보교육", "피지컬컴퓨팅", "아두이노", "AI생육예측"],
    thumbnail: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    featured: true,
    links: [
      { label: "수업 지도안 (PDF)", url: "https://example.com/plan.pdf", icon: "file-text" },
      { label: "학생 활동지 모음", url: "https://example.com/worksheet", icon: "external-link" },
      { label: "강의 슬라이드", url: "https://example.com/slides", icon: "presentation" }
    ],
    content: `
### 수업 개요
본 수업은 학생들이 실생활 문제인 '스마트 농업'을 기술과 과학의 관점에서 해결해보는 융합 탐구 수업입니다. 

#### 주요 학습 목표
1. 토양 수분, 조도, 온습도 센서의 물리적 원리를 이해하고 값을 계측할 수 있다.
2. 수집된 다변량 시계열 데이터를 전처리하고 통계적 특징을 분석할 수 있다.
3. 머신러닝 회귀 모델을 적용하여 급수 시점을 자동으로 예측하는 폐루프 제어기를 구현한다.

#### 차시별 구성 (총 12차시)
- **1-2차시**: 현대 농업의 한계와 스마트팜 기술 트렌드 토의
- **3-5차시**: 아두이노 센서 쉴드 조립 및 시리얼 모니터링 데이터 로깅 실습
- **6-8차시**: 구글 코랩을 활용한 센서 데이터 시각화 및 최적 생육 임계값 도출
- **9-11차시**: 수중 펌프와 서보모터 결합 자동화 하드웨어 시제품 제작
- **12차시**: 모둠별 결과물 쇼케이스 및 상호 동료 피드백

> "단순한 코딩 수업을 넘어, 센서가 세상을 측정하고 알고리즘이 결정을 내리는 전 과정을 경험하게 하는 것이 목표였습니다."
    `
  },
  {
    id: "class-roller-coaster-physics",
    category: "class",
    title: "스마트폰 가속도 센서를 활용한 롤러코스터 역학적 에너지 보존 탐구",
    date: "2025.10",
    year: "2025",
    summary: "스마트폰 Phyphox 앱을 활용해 학생들이 직접 미니 롤러코스터의 가속도와 원심력을 실측하고 에너지 손실률을 정량 계산하는 물리학 탐구 수업.",
    tags: ["물리", "실험탐구", "Phyphox", "역학적에너지", "MBL"],
    thumbnail: "https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?auto=format&fit=crop&w=800&q=80",
    featured: false,
    links: [
      { label: "실험 프로토콜", url: "#", icon: "file-text" },
      { label: "데이터 분석 시트", url: "#", icon: "table" }
    ],
    content: `
### 탐구 배경 및 의도
교과서 속 마찰이 없는 이상적인 빗면 실험에서 벗어나, 학생들이 직접 제작한 트랙에서 마찰과 공기 저항으로 인한 실제 에너지 손실을 스마트폰 센서로 직접 측정합니다.

- **준비물**: 파이프 단열재 트랙, 쇠구슬, 스마트폰(Phyphox 앱), 고속 카메라 삼각대
- **핵심 역량**: 과학적 탐구력, 데이터 기반 논증 능력, 공학적 문제해결력
    `
  },

  // --- 2. 프로젝트 & 연구 ---
  {
    id: "project-sound-levitation",
    category: "project",
    title: "초음파 위상배열을 이용한 비접촉식 미세입자 음향 부양 장치 개발",
    date: "2025.08",
    year: "2025",
    summary: "전국과학전람회 물리 부문 우수상 지도 사례. 40kHz 초음파 트랜스듀서 36개를 배열하여 정상파 노드에 액적 및 미세 플라스틱을 부양하는 장치를 제작.",
    tags: ["과학전람회", "음향부양", "위상배열", "학생지도", "물리탐구"],
    thumbnail: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80",
    featured: true,
    links: [
      { label: "출품 논문 전문 (PDF)", url: "#", icon: "file-text" },
      { label: "시연 동작 영상", url: "https://youtube.com", icon: "video" },
      { label: "회로도 & 소스코드", url: "https://github.com", icon: "github" }
    ],
    content: `
### 연구 요약 (전국과학전람회 지도 보고서 발췌)
본 연구는 고등학교 2학년 학생 2명과 함께 진행한 1년 장기 탐구 프로젝트입니다.

#### 연구 동기
화학 및 생물학 실험실에서 용기 벽면과의 접촉으로 인한 오염(Contact Contamination)을 원천 차단하기 위해, 음향 방사압(Acoustic Radiation Force)을 이용한 공중 부양 챔버를 저비용으로 직접 제작하고자 하였습니다.

#### 핵심 구현
1. **아날로그 위상 지연 회로 설계**: FPGA 없이 타이머 IC와 모스펫 드라이버를 통해 위상을 제어.
2. **3D 프린팅 하우징**: 반구형 오목 배열 구조를 최적화하여 중앙 초점에서의 음압 밀도를 극대화.
3. **입자 트래핑 실험**: 밀도 1.05g/cm³의 물방울과 0.05g의 발포스티렌 입자를 안정적으로 30분 이상 공중에 부양 성공.
    `
  },
  {
    id: "project-vision-microscope",
    category: "project",
    title: "라즈베리파이 기반 오픈소스 저비용 세포 자동 카운팅 디지털 현미경",
    date: "2024.11",
    year: "2024",
    summary: "일반 광학 현미경 접안렌즈에 장착 가능한 3D 프린팅 모듈과 OpenCV 물체 감지 알고리즘을 결합해 효모 세포 개수를 실시간으로 세어주는 보조 도구.",
    tags: ["오픈소스", "컴퓨터비전", "라즈베리파이", "생물실험", "OpenCV"],
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80",
    featured: false,
    links: [
      { label: "Thingiverse 3D 모델", url: "#", icon: "box" },
      { label: "GitHub 저장소", url: "#", icon: "github" }
    ],
    content: `
### 프로젝트 소개
일반 학교 실험실에서 혈구계수기(Hemocytometer)를 육안으로 관찰하며 효모 세포를 세는 작업의 피로도를 낮추기 위해 시작된 프로젝트입니다.
    `
  },

  // --- 3. 수업 웹 도구 ---
  {
    id: "tool-random-picker",
    category: "tools",
    title: "교실 발표자 & 모둠 랜덤 추첨기 (Lucky Classroom)",
    date: "2026.01",
    year: "2026",
    summary: "웹 브라우저에서 바로 열리는 반응형 발표자 뽑기 도구. 학생 번호 범위 지정, 중복 당첨 방지, 흥미진진한 룰렛 사운드와 애니메이션 효과 내장.",
    tags: ["수업도구", "웹앱", "학급운영", "자체개발", "인터랙티브"],
    thumbnail: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    featured: true,
    toolAction: "open-picker-tool",
    links: [
      { label: "지금 바로 도구 실행", action: "open-picker-tool", icon: "play" }
    ],
    content: `
### 도구 설명
수업 중 공정하고 활기찬 발표 참여를 유도하기 위해 개발한 웹 도구입니다. 아래 [지금 바로 도구 실행] 버튼을 누르면 웹사이트 내에서 즉시 사용해보실 수 있습니다!
    `
  },
  {
    id: "tool-classroom-timer",
    category: "tools",
    title: "시각적 모둠 활동 집중 타이머 (Visual Group Timer)",
    date: "2025.09",
    year: "2025",
    summary: "대형 TV나 빔프로젝터에 띄우기 최적화된 풀스크린 타이머. 원형 게이지로 남은 시간이 직관적으로 줄어들며, 배경음악 및 종료 알림음 지원.",
    tags: ["수업도구", "타이머", "수업집중", "대형화면"],
    thumbnail: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
    featured: true,
    toolAction: "open-timer-tool",
    links: [
      { label: "지금 바로 타이머 실행", action: "open-timer-tool", icon: "clock" }
    ],
    content: `
### 타이머 특징
- 미니멀하고 가독성 높은 인터페이스
- 1분, 3분, 5분, 10분, 15분 원클릭 프리셋 버튼
- 종료 카운트다운 알림음 지원
    `
  },

  // --- 4. 연수 & 강연 ---
  {
    id: "lecture-ai-prompting",
    category: "lecture",
    title: "초거대 생성형 AI를 활용한 과학 수업 설계 및 교수학습자료 개발 연수",
    date: "2026.03",
    year: "2026",
    summary: "전국 초·중등 교원 직무연수 3학점(15시간) 강의. 생성형 AI 프롬프트 엔지니어링부터 시뮬레이션 코드 생성, 탐구 대화형 평가 루브릭 제작까지.",
    tags: ["교원연수", "생성형AI", "수업설계", "프롬프트", "에듀테크"],
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=800&q=80",
    featured: true,
    links: [
      { label: "연수 교재 (PDF)", url: "#", icon: "book" },
      { label: "발표 슬라이드 (Canva)", url: "#", icon: "presentation" }
    ],
    content: `
### 연수 커리큘럼
1. **1부: AI 시대의 과학교육 패러다임** (단순 지식 전달에서 탐구 가설 검증으로)
2. **2부: 수업 맞춤형 프롬프트 작성 공식** (역할, 맥락, 제약조건, 출력 포맷)
3. **3부: 5분 만에 만드는 웹 기반 인터랙티브 시뮬레이션** (HTML/JS 프롬프팅)
4. **4부: 과정 중심 평가와 AI 피드백 설계** (루브릭 자동 생성 및 다면 피드백)
    `
  },

  // --- 5. 교육 철학 & 에세이 ---
  {
    id: "essay-why-we-make",
    category: "essay",
    title: "우리는 왜 교실에서 여전히 무언가를 손으로 만들어야 하는가",
    date: "2026.02",
    year: "2026",
    summary: "화면 속 AI가 모든 정답을 출력해주는 시대에, 학생들이 빵판에 전선을 꽂고 글루건으로 손을 데어가며 물리적 실패를 겪어야 하는 이유에 대한 성찰.",
    tags: ["수업일지", "메이커교육", "교육철학", "질문과실패"],
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    featured: true,
    links: [],
    content: `
### '정답'이 즉시 쏟아지는 시대, 교실의 가치

인공지능에게 질문을 던지면 단 3초 만에 완벽한 코드와 정연한 논리가 화면에 펼쳐집니다. 
아이들은 환호하지만, 동시에 무기력해지기도 합니다. 
"선생님, AI가 다 해주는데 우리는 왜 이걸 공부해야 해요?"

그 질문을 받은 날, 나는 학생들에게 센서 모듈과 저항, 납땜 인두를 쥐어주었습니다.
화면 속의 코드는 에러 없이 컴파일되었지만, 실제 브레드보드 위의 LED는 켜지지 않았습니다. 
선 하나가 헐겁게 꽂혀 있었고, 접촉 불량이었으며, 전압이 모자랐기 때문입니다.

아이들은 1시간 동안 전선을 하나하나 다시 꽂으며 땀을 흘렸습니다. 
그리고 마침내 작은 초록빛 불이 깜빡였을 때 터져 나온 함성은, AI에게 완벽한 답변을 받았을 때의 표정과는 완전히 달랐습니다.

**"지식은 화면에서 얻을 수 있지만, 끈기와 촉각적 확신은 물질과의 직접적인 마찰 속에서만 태어난다."**
이것이 내가 오늘도 복잡하고 어지러운 교실을 지키는 이유입니다.
    `
  }
];

window.archiveItems = archiveItems;
