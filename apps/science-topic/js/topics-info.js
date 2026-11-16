/* 추가 주제 ① — 정보 중심 융합 주제 */
window.TOPICS_DB.push(
  {
    id: "leaf-disease-cnn", methods: ["데이터 분석"], codeLang: "python",
    title: "잎 사진의 합성곱 신경망 학습을 이용한 작물 병해 판별 정확도",
    subjects: ["정보", "생명과학"],
    keywords: ["인공지능", "딥러닝", "CNN", "이미지", "식물", "병해", "농업", "분류", "전이학습", "데이터"],
    careers: ["AI 개발자", "데이터 과학자", "농업연구사", "소프트웨어 개발자"],
    majors: ["인공지능학과", "컴퓨터공학과", "식물자원학과", "바이오시스템공학과", "데이터사이언스학과"],
    level: "심화", budget: 0, duration: "1~2개월",
    summary: "공개 잎 이미지 데이터와 직접 찍은 교내 식물 사진으로 합성곱 신경망(CNN)을 학습시키고, 촬영 조건이 바뀔 때 판별 정확도가 얼마나 떨어지는지 분석한다.",
    trend: "작물 병해 진단에 딥러닝을 적용한 연구가 많지만, 실험실 사진으로 학습한 모델이 실제 밭 사진에서 성능이 떨어지는 '도메인 차이' 문제가 주요 과제로 꼽힌다.",
    question: "공개 데이터로 학습한 모델은 배경·조명이 다른 실제 사진에서도 병든 잎을 정확히 판별하는가?",
    hypothesis: "배경이 단순한 공개 데이터로만 학습하면 실제 사진에서 정확도가 크게 떨어지고, 실제 사진을 일부 추가 학습하면 회복될 것이다.",
    variables: { independent: "학습 데이터 구성, 데이터 증강 여부, 촬영 조건", dependent: "정확도, 혼동행렬, 재현율", controlled: "모델 구조, 학습 횟수, 이미지 크기" },
    materials: [{ item: "PlantVillage 등 공개 잎 이미지 데이터", note: "무료" }, { item: "PC 또는 Google Colab(무료 GPU), 스마트폰 카메라", note: "무료" }],
    dataSources: [{ name: "Kaggle 데이터셋 검색: PlantVillage", url: "https://www.kaggle.com/search?q=plantvillage", note: "잎 병해 이미지" }, { name: "AI Hub", url: "https://www.aihub.or.kr/", note: "국내 작물 병해 이미지 데이터" }],
    circuit: [],
    code: `import tensorflow as tf
# 폴더 구조: data/train/<병명>/*.jpg , data/real/<병명>/*.jpg (직접 찍은 사진)
train = tf.keras.utils.image_dataset_from_directory('data/train', image_size=(160,160), validation_split=0.2, subset='training', seed=1)
val   = tf.keras.utils.image_dataset_from_directory('data/train', image_size=(160,160), validation_split=0.2, subset='validation', seed=1)
real  = tf.keras.utils.image_dataset_from_directory('data/real',  image_size=(160,160), shuffle=False)
base = tf.keras.applications.MobileNetV2(input_shape=(160,160,3), include_top=False, weights='imagenet')
base.trainable = False                                    # 전이학습
model = tf.keras.Sequential([tf.keras.layers.Rescaling(1/127.5, offset=-1), base,
    tf.keras.layers.GlobalAveragePooling2D(), tf.keras.layers.Dense(len(train.class_names), activation='softmax')])
model.compile('adam', 'sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(train, validation_data=val, epochs=5)
print('공개 데이터 검증 정확도:', model.evaluate(val)[1])
print('실제 사진 정확도:', model.evaluate(real)[1])`,
    protocol: ["공개 데이터에서 작물 1~2종의 정상·병해 이미지를 고른다.", "교내·텃밭에서 같은 작물의 잎을 배경·조명을 달리해 촬영하고 라벨을 붙인다(전문가·교사 확인).", "공개 데이터로만 학습한 모델, 데이터 증강을 추가한 모델, 실제 사진 일부를 섞은 모델을 만든다.", "세 모델을 같은 실제 사진 시험 세트로 평가한다.", "Grad-CAM 등으로 모델이 잎의 어느 부분을 보고 판단했는지 시각화한다."],
    analysis: "모델별 정확도·혼동행렬 비교, 오분류 사례 분석, 판단 근거 시각화.",
    expected: "공개 데이터 검증 정확도는 매우 높지만 실제 사진에서는 크게 낮아지고, 데이터 증강과 실제 사진 추가 학습으로 성능이 회복될 것으로 예상된다.",
    extension: "스마트폰 앱으로 변환(TensorFlow Lite)하여 교내 텃밭 진단 도구로 활용한다.",
    safety: "공개 데이터의 이용 조건(라이선스)을 확인하고 출처를 밝힌다.",
    record: "작물 병해 진단에 인공지능을 적용하고자 전이학습 기반 합성곱 신경망을 학습시키고, 직접 촬영한 사진으로 일반화 성능을 검증함. 실험실 데이터와 실제 환경의 차이로 정확도가 떨어지는 현상을 발견하고 데이터 증강과 추가 학습으로 개선하였으며, 판단 근거를 시각화하여 모델의 한계를 비판적으로 해석함.",
    careerLink: "인공지능·컴퓨터공학(컴퓨터 비전), 스마트 농업 분야로 연결된다.",
    searchTerms: ["작물 병해 이미지 딥러닝 도메인 차이", "plant disease CNN field images generalization", "전이학습 잎 병해 분류"]
  },
  {
    id: "bird-sound", methods: ["데이터 분석"], codeLang: "python",
    title: "울음소리 스펙트로그램의 특징을 이용한 텃새 종 자동 분류",
    subjects: ["정보", "생명과학", "물리"],
    keywords: ["소리", "음향", "새", "생태", "스펙트로그램", "푸리에 변환", "머신러닝", "분류", "생물다양성"],
    careers: ["생태학자", "데이터 과학자", "AI 개발자", "음향공학자"],
    majors: ["생명과학과", "컴퓨터공학과", "산림자원학과", "전자공학과"],
    level: "심화", budget: 0, duration: "1~2개월",
    summary: "공개 조류 음원과 교내에서 녹음한 소리를 스펙트로그램으로 바꾸고, 주파수 특징(MFCC 등)을 추출해 참새·까치·직박구리 등 텃새를 분류한다.",
    trend: "소리 기반 생물 모니터링(생물음향학)은 비침습적인 생물다양성 조사 방법으로 주목받고 있으며, 머신러닝 자동 분류 연구가 활발하다.",
    question: "어떤 소리 특징을 사용할 때 텃새 울음소리를 가장 정확히 분류할 수 있으며, 도시 소음이 섞이면 정확도는 얼마나 떨어지는가?",
    hypothesis: "MFCC 특징이 단순 주파수 피크보다 분류 정확도가 높고, 소음이 섞이면 정확도가 떨어지지만 필터링으로 일부 회복될 것이다.",
    variables: { independent: "특징 종류(MFCC, 주파수 피크), 소음 비율, 분류 알고리즘", dependent: "분류 정확도", controlled: "음원 길이, 샘플링 주파수, 학습 데이터 수" },
    materials: [{ item: "xeno-canto 공개 음원", note: "무료" }, { item: "스마트폰 녹음 앱, PC(파이썬 librosa, scikit-learn)", note: "무료" }],
    dataSources: [{ name: "xeno-canto", url: "https://xeno-canto.org/", note: "세계 조류 울음소리 공개 음원(라이선스 확인)" }],
    circuit: [],
    code: `import librosa, numpy as np, glob
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
X, y = [], []
for path in glob.glob('sounds/*/*.wav'):          # sounds/<새 이름>/*.wav
    sig, sr = librosa.load(path, sr=22050, duration=5)
    mfcc = librosa.feature.mfcc(y=sig, sr=sr, n_mfcc=20)
    X.append(np.r_[mfcc.mean(axis=1), mfcc.std(axis=1)])
    y.append(path.replace('\\\\', '/').split('/')[-2])
scores = cross_val_score(RandomForestClassifier(n_estimators=200), X, y, cv=5)
print('5겹 교차검증 정확도: %.2f ± %.2f' % (scores.mean(), scores.std()))`,
    protocol: ["분류할 텃새 4~5종을 정하고 종별 음원을 30개 이상 모은다.", "음원을 같은 길이로 자르고 스펙트로그램을 그려 종별 특징을 관찰한다.", "MFCC와 주파수 피크 특징으로 각각 분류 모델을 학습해 교차검증한다.", "교내에서 녹음한 실제 소리(소음 포함)로 시험한다.", "대역 통과 필터를 적용해 소음 제거 효과를 비교한다."],
    analysis: "특징·알고리즘별 정확도 비교, 혼동행렬, 소음 비율-정확도 그래프.",
    expected: "MFCC 기반 모델이 더 높은 정확도를 보이고, 차량 소음이 섞이면 저주파 대역에서 혼동이 커질 것이다. 비슷한 음역의 종끼리 혼동이 많을 것으로 예상된다.",
    extension: "라즈베리파이 녹음 장치로 교내 조류 출현 시간대를 장기 기록한다.",
    safety: "녹음 시 사람의 대화가 담기지 않도록 하고, 공개 음원의 라이선스를 지킨다.",
    record: "소리로 생물을 조사하는 생물음향학에 흥미를 갖고 조류 울음소리의 스펙트로그램과 MFCC 특징을 추출하여 머신러닝 분류 모델을 구현함. 실제 교내 녹음에서 소음에 의한 정확도 저하를 확인하고 필터링으로 개선하는 등 신호 처리와 생물학을 융합한 탐구를 수행함.",
    careerLink: "생태학(생물다양성 모니터링), 인공지능·신호처리로 연결된다.",
    searchTerms: ["조류 울음소리 MFCC 분류", "bird sound classification MFCC machine learning", "생물음향 모니터링"]
  },
  {
    id: "sir-simulation", methods: ["데이터 분석"], codeLang: "python",
    title: "감염병 확산 모형(SIR)을 이용한 백신 접종률과 집단면역의 관계",
    subjects: ["정보", "생명과학"],
    keywords: ["감염병", "전염병", "시뮬레이션", "SIR", "백신", "집단면역", "수학", "모델링", "보건", "의료"],
    careers: ["의사", "역학 조사관", "보건", "데이터 과학자", "간호사", "약사"],
    majors: ["의예과", "보건학과", "간호학과", "수학과", "통계학과", "약학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "SIR 미분방정식 모형과 개체 기반 시뮬레이션을 직접 프로그래밍하여 기초감염재생산수와 접종률에 따른 유행 규모를 비교하고 집단면역 문턱값을 확인한다.",
    trend: "코로나19 이후 수리 모형을 이용한 방역 정책 평가가 크게 늘었으며, 개체 간 접촉 구조를 반영한 네트워크 모형 연구가 활발하다.",
    question: "접종률이 이론적 집단면역 문턱값(1 − 1/R₀)을 넘으면 실제로 유행이 억제되는가? 접촉 구조가 다르면 결과가 달라지는가?",
    hypothesis: "균일 혼합 모형에서는 문턱값에서 유행이 급격히 줄지만, 접촉이 몰린 네트워크에서는 더 높은 접종률이 필요할 것이다.",
    variables: { independent: "R₀, 접종률, 접촉 네트워크 구조", dependent: "최종 감염자 비율, 유행 정점 시기", controlled: "인구 수, 회복률, 초기 감염자 수" },
    materials: [{ item: "PC, 파이썬(numpy, scipy, networkx)", note: "무료" }],
    dataSources: [{ name: "질병관리청 감염병 포털", url: "https://dportal.kdca.go.kr/", note: "실제 유행 곡선 비교용" }],
    circuit: [],
    code: `import numpy as np
from scipy.integrate import odeint
def sir(y, t, beta, gamma):
    S, I, R = y
    return [-beta*S*I, beta*S*I - gamma*I, gamma*I]
R0, gamma = 3.0, 0.1
for v in np.arange(0, 0.9, 0.1):                  # 접종률
    S0 = 1 - v - 0.001
    S, I, R = odeint(sir, [S0, 0.001, v], np.linspace(0, 300, 3001), args=(R0*gamma, gamma)).T
    print(f'접종률 {v:.0%}: 최종 감염 비율 {R[-1]-v:.3f}')
print('이론적 집단면역 문턱값:', 1 - 1/R0)`,
    protocol: ["SIR 미분방정식을 수치적으로 풀어 R₀별 유행 곡선을 그린다.", "접종률을 0~90%로 바꾸며 최종 감염 비율을 계산한다.", "같은 조건을 개체 기반(무작위 접촉) 시뮬레이션으로 구현해 비교한다.", "networkx로 소수에게 접촉이 몰린 네트워크를 만들어 무작위 접종과 '접촉이 많은 사람 우선 접종'을 비교한다.", "실제 유행 자료와 모형 곡선을 비교해 한계를 논의한다."],
    analysis: "접종률-최종 감염 비율 그래프, 문턱값 비교, 접종 전략별 효과 비교, 반복 시뮬레이션의 평균과 분산.",
    expected: "균일 혼합 모형에서는 이론적 문턱값 근처에서 유행이 거의 사라지고, 네트워크 모형에서는 접촉이 많은 사람을 우선 접종하면 더 낮은 접종률로도 유행이 억제될 것으로 예상된다.",
    extension: "잠복기(SEIR), 면역 감소, 변이 출현을 추가하거나 학교 시간표 기반 접촉 네트워크를 만든다.",
    safety: "모형 결과를 실제 의료적 판단으로 확대 해석하지 않는다.",
    record: "감염병 확산의 수학적 원리를 이해하고자 SIR 모형과 개체 기반 시뮬레이션을 직접 구현하여 접종률에 따른 유행 규모를 분석함. 이론적 집단면역 문턱값을 확인하고 접촉 네트워크 구조에 따라 효과적인 접종 전략이 달라짐을 보여, 수리 모형을 보건 정책에 연결하는 통찰을 보임.",
    careerLink: "의학·보건(역학), 수학·데이터과학(모델링)으로 연결된다.",
    searchTerms: ["SIR 모형 집단면역 접종률 시뮬레이션", "network epidemic model targeted vaccination", "감염병 수리 모형 고등학생"]
  },
  {
    id: "forest-fire-ca", methods: ["데이터 분석"], codeLang: "python",
    title: "셀룰러 오토마타를 이용한 산불 확산 모의와 방화선 배치 효과",
    subjects: ["정보", "지구과학", "물리"],
    keywords: ["산불", "시뮬레이션", "셀룰러 오토마타", "재난", "확률", "임계현상", "바람", "모델링", "코딩"],
    careers: ["재난안전", "소프트웨어 개발자", "산림공학자", "데이터 과학자", "소방"],
    majors: ["컴퓨터공학과", "산림자원학과", "방재안전학과", "물리학과", "수학과"],
    level: "중급", budget: 0, duration: "4주 이내",
    summary: "격자 위 나무가 이웃으로 불을 옮기는 셀룰러 오토마타 모형을 만들어 나무 밀도·바람·습도에 따른 산불 확산 면적과 방화선 효과를 분석한다.",
    trend: "대형 산불이 잦아지면서 확산 예측 모형과 진화 전략 연구가 늘고 있으며, 단순 격자 모형은 임계 현상(퍼콜레이션)을 설명하는 도구로도 쓰인다.",
    question: "나무 밀도가 어느 값을 넘으면 산불이 숲 전체로 번지며, 방화선의 폭과 위치는 확산을 얼마나 줄이는가?",
    hypothesis: "나무 밀도가 임계값(약 0.59) 부근을 넘으면 연소 면적이 급증하고, 바람 방향에 수직인 방화선이 가장 효과적일 것이다.",
    variables: { independent: "나무 밀도, 바람 방향·세기(전파 확률), 방화선 폭·위치", dependent: "최종 연소 면적 비율, 확산 시간", controlled: "격자 크기, 발화 위치, 반복 횟수" },
    materials: [{ item: "PC, 파이썬(numpy, matplotlib)", note: "무료" }],
    dataSources: [{ name: "산림청 산불 통계(공공데이터포털)", url: "https://www.data.go.kr/", note: "실제 산불 피해 면적 비교" }],
    circuit: [],
    code: `import numpy as np
rng = np.random.default_rng(0)
def burn(density, n=200, p_wind=(0.9, 0.5, 0.5, 0.2)):   # 동,북,남,서 방향 전파 확률
    tree = rng.random((n, n)) < density
    fire = np.zeros_like(tree); fire[n//2, n//2] = True; burned = fire.copy()
    shifts = [(0, 1), (-1, 0), (1, 0), (0, -1)]
    while fire.any():
        new = np.zeros_like(tree)
        for (dy, dx), p in zip(shifts, p_wind):
            new |= np.roll(fire, (dy, dx), axis=(0, 1)) & (rng.random((n, n)) < p)
        fire = new & tree & ~burned; burned |= fire
    return burned.sum() / tree.sum()
for d in np.arange(0.4, 0.81, 0.05):
    print(f'밀도 {d:.2f}: 연소 비율 {np.mean([burn(d) for _ in range(10)]):.2f}')`,
    protocol: ["격자 모형을 구현하고 바람이 없을 때 밀도별 연소 비율을 반복 계산한다.", "연소 비율이 급증하는 임계 밀도를 찾는다.", "방향별 전파 확률을 달리해 바람의 효과를 넣는다.", "방화선(나무를 제거한 띠)의 폭·방향·위치를 바꾸며 연소 면적을 비교한다.", "실제 산불 통계와 비교해 모형의 한계를 정리한다."],
    analysis: "밀도-연소 비율 곡선, 임계값 추정, 방화선 조건별 평균 연소 면적과 표준편차.",
    expected: "임계 밀도 부근에서 연소 비율이 급격히 증가하는 상전이 양상이 나타나고, 바람이 불어 가는 쪽에 수직으로 둔 방화선이 가장 효과적일 것으로 예상된다.",
    extension: "실제 지형 고도(DEM)와 식생 지도를 격자에 반영하거나 강화학습으로 최적 방화선을 찾는다.",
    safety: "해당 없음(컴퓨터 시뮬레이션).",
    record: "산불 확산의 원리를 탐구하고자 셀룰러 오토마타 모형을 직접 프로그래밍하여 나무 밀도와 바람에 따른 연소 면적을 분석함. 임계 밀도에서 연소 면적이 급증하는 퍼콜레이션 현상을 확인하고 방화선 배치 전략을 비교하여 재난 대응에 시뮬레이션을 활용하는 역량을 보임.",
    careerLink: "컴퓨터공학(시뮬레이션), 산림·방재 분야로 연결된다.",
    searchTerms: ["셀룰러 오토마타 산불 확산 모형", "forest fire cellular automaton percolation threshold", "방화선 시뮬레이션"]
  },
  {
    id: "traffic-signal-sim", methods: ["데이터 분석"], codeLang: "python",
    title: "교차로 신호 주기에 따른 차량 대기 시간의 시뮬레이션 분석",
    subjects: ["정보", "물리"],
    keywords: ["교통", "시뮬레이션", "최적화", "신호", "대기행렬", "도시", "자율주행", "알고리즘", "코딩"],
    careers: ["교통공학자", "소프트웨어 개발자", "도시계획가", "데이터 과학자", "자율주행"],
    majors: ["교통공학과", "도시공학과", "컴퓨터공학과", "산업공학과", "수학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "학교 앞 교차로의 실제 차량 도착 수를 세어 확률 모형을 만들고, 신호 주기와 녹색 시간 비율을 바꾸는 시뮬레이션으로 평균 대기 시간을 최소로 하는 조건을 찾는다.",
    trend: "실시간 교통량에 따라 신호를 바꾸는 감응식·AI 신호 제어 연구와 실증 사업이 늘고 있다.",
    question: "고정 신호 주기에서 대기 시간을 최소로 하는 주기와 녹색 시간 비율은 얼마이며, 교통량에 따라 바뀌는 감응식 신호는 얼마나 더 효율적인가?",
    hypothesis: "주기가 너무 짧거나 길면 대기 시간이 늘어나는 최적점이 존재하고, 감응식 신호가 고정식보다 대기 시간을 줄일 것이다.",
    variables: { independent: "신호 주기, 녹색 시간 비율, 신호 방식(고정·감응)", dependent: "차량당 평균 대기 시간, 최대 대기열 길이", controlled: "차량 도착률(실측), 차량 통과 시간" },
    materials: [{ item: "계수기 앱 또는 체크리스트, 스톱워치", note: "무료" }, { item: "PC, 파이썬(numpy, simpy 선택)", note: "무료" }],
    dataSources: [{ name: "직접 측정한 차량 도착 수", url: "", note: "학교 주변 교차로, 시간대별 1분 단위" }, { name: "국가교통DB", url: "https://www.ktdb.go.kr/", note: "교통량 공공 자료" }],
    circuit: [],
    code: `import numpy as np
rng = np.random.default_rng(1)
def simulate(cycle, green_ratio, lam=0.25, sat=0.5, T=3600):
    """lam: 초당 도착 대수(실측), sat: 녹색일 때 초당 통과 대수"""
    queue, waits, t_arr = [], [], []
    for t in range(T):
        for _ in range(rng.poisson(lam)): queue.append(t)
        green = (t % cycle) < cycle * green_ratio
        if green and queue and rng.random() < sat:
            waits.append(t - queue.pop(0))
    return np.mean(waits)
for c in [40, 60, 90, 120, 150]:
    print(c, '초 주기:', round(simulate(c, 0.5), 1), '초 대기')`,
    protocol: ["등하교·점심 시간대에 교차로 방향별 차량 도착 수를 1분 단위로 센다.", "도착 수 분포가 포아송 분포를 따르는지 확인한다.", "실측 도착률로 시뮬레이션을 만들고 실제 신호 주기에서의 대기열과 비교해 검증한다.", "신호 주기·녹색 비율을 바꾸며 평균 대기 시간을 계산한다.", "대기열 길이에 따라 녹색을 연장하는 감응식 규칙을 구현해 비교한다."],
    analysis: "주기-대기 시간 곡선(최적점), 방향별 교통량에 따른 최적 녹색 비율, 고정식·감응식 비교, 반복 실행 평균.",
    expected: "대기 시간이 최소가 되는 주기가 존재하며(웹스터 공식과 비교 가능), 교통량이 불균형한 시간대에는 감응식 신호가 대기 시간을 크게 줄일 것으로 예상된다.",
    extension: "보행자 대기 시간과 안전을 함께 고려한 다목적 최적화를 하거나, 영상으로 차량을 자동 계수한다.",
    safety: "교차로 관찰은 안전한 보도 위에서 하고 차량 번호판 등 개인정보를 기록하지 않는다.",
    record: "학교 앞 교차로의 정체 문제에 주목하여 차량 도착 수를 직접 측정하고 포아송 분포 기반 시뮬레이션을 구현함. 신호 주기에 따른 대기 시간의 최적점을 찾고 감응식 신호 규칙을 설계해 효과를 비교하는 등 실측 자료와 알고리즘을 결합한 문제 해결 역량을 보임.",
    careerLink: "교통·도시공학, 산업공학(최적화), 소프트웨어 개발로 연결된다.",
    searchTerms: ["교차로 신호 주기 최적화 시뮬레이션", "traffic signal timing simulation Webster delay", "감응식 신호 제어 대기 시간"]
  },
  {
    id: "mitosis-image", methods: ["실험", "데이터 분석"], codeLang: "python",
    title: "양파 뿌리 끝 세포 분열 단계의 영상 분석과 처리 물질에 따른 분열 지수",
    subjects: ["생명과학", "정보", "화학"],
    keywords: ["세포 분열", "체세포 분열", "현미경", "이미지 분석", "양파", "분열 지수", "세포", "독성"],
    careers: ["의사", "생명과학자", "약사", "임상병리사", "AI 개발자"],
    majors: ["의예과", "생명과학과", "약학과", "임상병리학과", "컴퓨터공학과"],
    level: "중급", budget: 20000, duration: "1~2개월",
    summary: "양파 뿌리 끝을 카페인·염분 등에 처리한 뒤 현미경 사진을 찍고, 영상 분석으로 세포 수와 분열 단계 비율(분열 지수)을 계수하여 처리 물질의 영향을 비교한다.",
    trend: "양파 뿌리 끝 분열 지수는 환경 물질의 세포 독성 평가에 널리 쓰이며, 현미경 이미지의 자동 계수에 영상 처리·딥러닝을 적용하는 연구가 늘고 있다.",
    question: "카페인·소금 농도에 따라 양파 뿌리 끝의 분열 지수는 어떻게 달라지며, 자동 계수는 사람의 계수와 얼마나 일치하는가?",
    hypothesis: "처리 농도가 높을수록 분열 지수가 감소하고, 영상 분석 계수는 사람 계수와 높은 상관을 보일 것이다.",
    variables: { independent: "처리 물질과 농도", dependent: "분열 지수(분열 중인 세포/전체 세포), 단계별 비율", controlled: "처리 시간, 고정·염색 방법, 관찰 배율" },
    materials: [{ item: "양파, 카페인·소금, 아세트올세인(또는 아세트산카민) 염색액, 염산", note: "약 15,000원" }, { item: "광학 현미경과 스마트폰 어댑터", note: "학교 보유" }, { item: "PC(ImageJ/Fiji 또는 파이썬 scikit-image)", note: "무료" }],
    circuit: ["현미경 촬영 조건 통일: 배율 400배, 같은 조명·초점 기준, 시야당 1장씩 무작위 위치 10장 이상"],
    code: `from skimage import io, color, filters, measure, morphology
img = color.rgb2gray(io.imread('field01.jpg'))
mask = img < filters.threshold_otsu(img)                   # 진하게 염색된 핵
mask = morphology.remove_small_objects(mask, 50)
labels = measure.label(mask)
props = measure.regionprops(labels)
print('핵 개수:', len(props))
# 분열 중인 세포는 응축된 염색체 때문에 핵 모양이 길쭉하거나 불규칙함 → 이심률로 후보 표시
dividing = [p for p in props if p.eccentricity > 0.85]
print('분열 후보:', len(dividing))`,
    protocol: ["양파를 물에 키워 뿌리를 2~3cm 길이로 기른다.", "농도를 달리한 처리 용액에 24시간 담근다(대조군: 물).", "뿌리 끝을 고정·해리·염색하여 압착 표본을 만든다.", "무작위 시야 10곳 이상을 같은 조건으로 촬영한다.", "사람이 직접 분열 단계를 세고, 영상 분석 결과와 비교한다."],
    analysis: "조건별 분열 지수 비교(분산분석), 단계별 비율, 사람·자동 계수의 상관과 오차 분석.",
    expected: "고농도 처리에서 분열 지수가 감소하고 이상 분열이 관찰될 수 있다. 자동 계수는 전체 세포 수에서는 정확하지만 분열 단계 판별은 사람보다 부정확할 것으로 예상된다.",
    extension: "딥러닝 객체 탐지 모델로 단계별 자동 분류를 시도하거나 미세플라스틱 등 다른 환경 물질로 확장한다.",
    safety: "염산·염색액은 장갑·보안경 착용, 가열 시 교사 지도.",
    record: "환경 물질의 세포 독성을 확인하고자 양파 뿌리 끝 분열 지수를 측정하고, 현미경 이미지를 영상 처리로 자동 계수하는 방법을 구현함. 사람 계수와 비교해 자동 계수의 정확도와 한계를 평가하였으며 생명과학 실험에 데이터 처리 기술을 접목하는 융합적 역량을 보임.",
    careerLink: "의학·약학(세포 독성), 디지털 병리·의료 영상 분석으로 연결된다.",
    searchTerms: ["양파 뿌리 분열 지수 카페인", "Allium cepa mitotic index cytotoxicity image analysis", "현미경 세포 자동 계수 ImageJ"]
  },
  {
    id: "phyphox-elevator", methods: ["실험", "데이터 분석"], codeLang: "python",
    title: "스마트폰 가속도 센서로 측정한 엘리베이터 운동과 겉보기 무게 변화",
    subjects: ["물리", "정보"],
    keywords: ["뉴턴 운동 법칙", "가속도", "관성력", "스마트폰", "phyphox", "엘리베이터", "운동", "역학", "적분"],
    careers: ["물리학자", "기계공학자", "엔지니어", "교사", "데이터 분석가"],
    majors: ["물리학과", "기계공학과", "물리교육과", "항공우주공학과"],
    level: "기초", budget: 0, duration: "4주 이내",
    summary: "스마트폰 센서 앱(phyphox)으로 엘리베이터의 가속도와 기압을 동시에 측정하고, 가속도를 적분해 구한 이동 거리와 기압으로 구한 높이를 비교한다.",
    trend: "스마트폰 내장 센서를 이용한 물리 실험이 교육·연구에서 활발히 쓰이며, 센서 융합으로 실내 위치·층을 추정하는 연구가 진행되고 있다.",
    question: "가속도 적분으로 구한 이동 거리와 기압 변화로 구한 높이는 얼마나 일치하며, 오차는 어디서 생기는가?",
    hypothesis: "가속도를 두 번 적분하면 작은 오차가 누적되어 이동 거리가 실제와 차이 나고, 기압 높이는 더 안정적일 것이다.",
    variables: { independent: "이동 층수, 상승·하강, 보정 방법", dependent: "가속도, 겉보기 무게 변화율, 추정 높이", controlled: "스마트폰 위치(바닥에 평평하게), 엘리베이터" },
    materials: [{ item: "스마트폰 + phyphox 앱", note: "무료" }, { item: "줄자(층 높이 실측), PC(파이썬 또는 엑셀)", note: "보유품" }],
    dataSources: [{ name: "phyphox", url: "https://phyphox.org/", note: "가속도·기압 동시 측정, CSV 내보내기" }],
    circuit: ["스마트폰을 엘리베이터 바닥 중앙에 화면이 위로 가게 놓고 '가속도(중력 제외)'와 '기압' 실험을 동시에 기록"],
    code: `import pandas as pd, numpy as np
d = pd.read_csv('Accelerometer.csv')               # phyphox 내보내기 (열 이름 확인)
t, az = d.iloc[:, 0].values, d.iloc[:, 3].values   # 시간, z축 가속도
az = az - az[:50].mean()                           # 정지 구간 평균으로 영점 보정
v = np.concatenate([[0], np.cumsum((az[1:] + az[:-1]) / 2 * np.diff(t))])
x = np.concatenate([[0], np.cumsum((v[1:] + v[:-1]) / 2 * np.diff(t))])
print('적분 이동 거리: %.2f m' % x[-1])
p = pd.read_csv('Pressure.csv').iloc[:, 1].values  # hPa
print('기압 높이 변화: %.2f m' % (-(p[-20:].mean() - p[:20].mean()) * 100 / (1.2 * 9.8)))`,
    protocol: ["층 높이를 줄자나 건물 도면으로 확인한다.", "1·3·5개 층 이동을 상승·하강 각 5회 측정한다.", "가속·등속·감속 구간을 그래프에서 구분하고 겉보기 무게 변화(%)를 계산한다.", "가속도를 두 번 적분하여 이동 거리를 구하고 영점 보정 방법별로 비교한다.", "기압 변화로 구한 높이, 실제 높이와 비교한다."],
    analysis: "구간별 평균 가속도, 겉보기 무게 변화율, 적분 거리·기압 높이·실측 높이의 오차 비교.",
    expected: "가속 구간에서 겉보기 무게가 몇 % 증가·감소하는 것이 관찰되고, 적분 거리는 영점 보정 정도에 민감해 오차가 커지는 반면 기압 높이는 비교적 안정적일 것으로 예상된다.",
    extension: "가속도와 기압을 칼만 필터로 결합해 더 정확한 높이를 추정한다.",
    safety: "엘리베이터 이용 시 다른 이용자에게 불편을 주지 않도록 한산한 시간에 측정한다.",
    record: "뉴턴 운동 법칙을 생활 속에서 확인하고자 스마트폰 가속도·기압 센서로 엘리베이터 운동을 측정함. 가속도를 수치 적분하여 이동 거리를 구하는 과정에서 영점 오차가 누적되는 문제를 발견하고 기압 높이와 비교해 원인을 분석하는 등 측정 오차를 깊이 있게 탐구함.",
    careerLink: "물리학·기계공학(관성 항법, 센서 융합)으로 연결된다.",
    searchTerms: ["스마트폰 가속도 센서 엘리베이터 phyphox", "smartphone accelerometer elevator physics experiment", "가속도 적분 오차 드리프트"]
  },
  {
    id: "video-collision", methods: ["실험", "데이터 분석"],
    title: "공의 재질과 낙하 높이에 따른 반발 계수 변화의 영상 분석",
    subjects: ["물리", "정보"],
    keywords: ["충돌", "반발 계수", "운동량", "에너지", "영상 분석", "Tracker", "공", "스포츠", "역학"],
    careers: ["스포츠과학자", "기계공학자", "물리학자", "체육교사"],
    majors: ["기계공학과", "물리학과", "체육학과", "스포츠과학과", "신소재공학과"],
    level: "기초", budget: 10000, duration: "4주 이내",
    summary: "탁구공·테니스공·농구공 등을 여러 높이에서 떨어뜨려 고속 촬영 영상을 Tracker로 분석하고, 반발 계수가 충돌 속도·공 온도에 따라 어떻게 변하는지 조사한다.",
    trend: "스포츠 공학에서 공의 반발 특성은 경기 규정과 장비 개발의 핵심이며, 스마트폰 고속 촬영과 영상 분석이 저비용 측정 방법으로 쓰이고 있다.",
    question: "반발 계수는 충돌 속도와 공의 온도에 따라 일정한가, 아니면 변하는가?",
    hypothesis: "충돌 속도가 클수록 변형에 따른 에너지 손실이 커져 반발 계수가 감소하고, 고무공은 온도가 높을수록 반발 계수가 커질 것이다.",
    variables: { independent: "공 종류, 낙하 높이, 공 온도", dependent: "충돌 직전·직후 속도, 반발 계수", controlled: "바닥 재질, 촬영 거리·각도" },
    materials: [{ item: "여러 종류의 공, 줄자, 바닥판", note: "약 10,000원" }, { item: "스마트폰(슬로모션 240fps), 삼각대", note: "보유품" }, { item: "Tracker(무료 영상 분석 프로그램)", note: "무료" }],
    dataSources: [{ name: "Tracker Video Analysis", url: "https://physlets.org/tracker/", note: "영상 속 물체 위치 추적" }],
    circuit: ["공 낙하 지점 옆에 1m 기준 자를 세우고, 스마트폰을 충돌 지점 높이에 수평으로 설치"],
    protocol: ["공별로 낙하 높이 50~200cm, 5단계에서 각 5회 떨어뜨려 슬로모션으로 촬영한다.", "Tracker로 충돌 직전·직후 속도를 구한다.", "반발 계수 e = (튀어 오른 속도)/(충돌 속도)를 계산한다.", "고무공을 냉장·실온·온수 처리하여 온도에 따른 반발 계수를 비교한다.", "높이로 구한 반발 계수 √(h₂/h₁)와 비교한다."],
    analysis: "충돌 속도-반발 계수 그래프, 온도-반발 계수 그래프, 두 계산 방법의 차이와 공기 저항 영향.",
    expected: "대부분의 공에서 충돌 속도가 커질수록 반발 계수가 조금씩 감소하고, 고무공은 온도가 높을수록 반발 계수가 커질 것으로 예상된다.",
    extension: "바닥 재질(나무·우레탄·잔디)에 따른 반발과 실제 경기 규정 비교.",
    safety: "높은 곳에서 떨어뜨릴 때 의자 사용 주의.",
    record: "공의 반발 계수가 일정한 상수인지 의문을 갖고 슬로모션 영상 분석으로 충돌 전후 속도를 측정함. 충돌 속도와 온도에 따라 반발 계수가 달라짐을 확인하고 재료의 점탄성으로 설명하였으며, 높이 기반 계산과 비교해 공기 저항의 영향을 평가함.",
    careerLink: "기계공학·스포츠과학(장비 설계), 신소재(고분자 탄성)로 연결된다.",
    searchTerms: ["반발 계수 충돌 속도 의존성", "coefficient of restitution impact velocity temperature ball", "Tracker 영상 분석 충돌"]
  },
  {
    id: "brownian-randomwalk", methods: ["실험", "데이터 분석"], codeLang: "python",
    title: "현미경으로 관찰한 브라운 운동의 평균 제곱 변위와 입자 크기의 관계",
    subjects: ["물리", "화학", "정보"],
    keywords: ["브라운 운동", "확산", "랜덤워크", "아인슈타인", "현미경", "입자", "콜로이드", "통계", "시뮬레이션"],
    careers: ["물리학자", "화학자", "신소재공학자", "약사"],
    majors: ["물리학과", "화학과", "신소재공학과", "화학공학과", "약학과"],
    level: "심화", budget: 15000, duration: "1~2개월",
    summary: "우유 지방구나 미세 입자의 브라운 운동을 현미경 영상으로 추적해 평균 제곱 변위를 구하고, 아인슈타인-스토크스 관계와 랜덤워크 시뮬레이션으로 해석한다.",
    trend: "입자 추적으로 확산 계수를 구하는 방법은 세포 내 물질 이동, 나노입자 약물 전달 연구에 널리 쓰인다.",
    question: "관찰한 입자의 평균 제곱 변위는 시간에 비례하는가? 측정한 확산 계수로 입자 크기를 추정할 수 있는가?",
    hypothesis: "평균 제곱 변위는 시간에 비례하고, 그 기울기로 구한 확산 계수는 입자 크기에 반비례할 것이다.",
    variables: { independent: "입자 종류·크기, 용매 온도·점성(글리세롤 비율)", dependent: "평균 제곱 변위, 확산 계수", controlled: "관찰 배율, 촬영 프레임 속도, 시료 두께" },
    materials: [{ item: "광학 현미경(400~1000배), 스마트폰 어댑터", note: "학교 보유" }, { item: "우유, 글리세롤, 슬라이드·덮개 유리", note: "약 10,000원" }, { item: "ImageJ(TrackMate) 또는 파이썬 trackpy", note: "무료" }],
    circuit: ["희석한 우유 한 방울을 슬라이드에 올리고 증발을 막도록 덮개 유리 가장자리를 매니큐어로 밀봉"],
    code: `import numpy as np
# tracks: 입자별 (x, y) 좌표 배열 목록 (µm 단위, TrackMate·trackpy 결과)
def msd(track, max_lag=30):
    return [np.mean(np.sum((track[l:] - track[:-l])**2, axis=1)) for l in range(1, max_lag)]
dt = 1/30                                           # 프레임 간격(s)
lags = np.arange(1, 30) * dt
all_msd = np.mean([msd(np.array(tr)) for tr in tracks], axis=0)
D = np.polyfit(lags, all_msd, 1)[0] / 4             # 2차원: MSD = 4Dt
r = 1.38e-23 * 298 / (6 * np.pi * 8.9e-4 * D * 1e-12)
print(f'확산 계수 {D:.3f} µm²/s, 추정 반지름 {r*1e6:.2f} µm')`,
    protocol: ["현미경의 µm 단위 길이를 대물 마이크로미터로 보정한다.", "희석 우유의 입자를 30fps로 20초 이상 촬영한다(시야 5곳).", "추적 소프트웨어로 입자 궤적을 구한다.", "평균 제곱 변위-시간 그래프의 기울기로 확산 계수를 구하고 입자 크기를 추정한다.", "글리세롤로 점성을 바꾸어 확산 계수 변화를 확인한다.", "같은 조건의 랜덤워크 시뮬레이션과 비교한다."],
    analysis: "MSD-시간 선형 회귀, 확산 계수와 점성의 관계, 추정 입자 크기와 문헌값 비교.",
    expected: "평균 제곱 변위가 시간에 비례하는 확산 거동이 나타나고, 점성이 커질수록 확산 계수가 줄어 아인슈타인-스토크스 관계와 대체로 일치할 것이다. 흐름(드리프트) 보정이 정확도에 중요하다.",
    extension: "세포질 속 과립 운동이나 나노입자 크기 측정으로 확장한다.",
    safety: "현미경 조명 과열 주의.",
    record: "브라운 운동을 직접 관찰하고 정량화하고자 현미경 영상에서 입자 궤적을 추적하여 평균 제곱 변위를 계산함. 확산 계수로 입자 크기를 추정하고 점성 변화에 따른 결과를 아인슈타인-스토크스 관계로 검증하였으며, 랜덤워크 시뮬레이션과 비교해 통계 물리의 원리를 깊이 이해함.",
    careerLink: "물리·화학(통계역학, 콜로이드), 약학(나노입자 확산)으로 연결된다.",
    searchTerms: ["브라운 운동 평균 제곱 변위 현미경 실험", "Brownian motion MSD milk particle tracking Einstein", "입자 추적 확산 계수"]
  },
  {
    id: "boiling-point-ml", methods: ["데이터 분석"], codeLang: "python",
    title: "분자 구조 특성을 이용한 유기 화합물의 끓는점 회귀 예측",
    subjects: ["화학", "정보"],
    keywords: ["분자 구조", "끓는점", "분자간 힘", "수소 결합", "머신러닝", "회귀", "화학정보학", "PubChem", "데이터"],
    careers: ["화학자", "약사", "신약 개발", "데이터 과학자", "화학공학자"],
    majors: ["화학과", "약학과", "화학공학과", "데이터사이언스학과", "제약공학과"],
    level: "심화", budget: 0, duration: "1~2개월",
    summary: "PubChem에서 알케인·알코올·카복실산 등의 분자 정보를 모아 분자량, 수소 결합 주개·받개 수, 극성 표면적 등으로 끓는점을 예측하는 회귀 모델을 만들고, 분자간 힘으로 해석한다.",
    trend: "분자 구조로 물성을 예측하는 화학정보학(QSPR)과 머신러닝 기반 신소재·신약 탐색이 빠르게 성장하고 있다.",
    question: "어떤 분자 특성이 끓는점을 가장 잘 설명하며, 단순 선형 모델과 머신러닝 모델의 예측 정확도는 얼마나 차이 나는가?",
    hypothesis: "분자량과 수소 결합 주개 수가 끓는점을 가장 크게 좌우하고, 비선형 모델이 작용기가 다른 화합물을 함께 다룰 때 더 정확할 것이다.",
    variables: { independent: "사용한 분자 특성, 모델 종류", dependent: "예측 오차(평균 절대 오차, ℃), 결정계수", controlled: "데이터 세트, 학습·시험 분할 방법" },
    materials: [{ item: "PubChem 공개 데이터", note: "무료" }, { item: "PC, 파이썬(pandas, scikit-learn, 선택: RDKit)", note: "무료" }],
    dataSources: [{ name: "PubChem", url: "https://pubchem.ncbi.nlm.nih.gov/", note: "분자량, 수소결합 주개·받개, TPSA, 끓는점(실험값 확인)" }],
    circuit: [],
    code: `import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_predict
from sklearn.metrics import mean_absolute_error
d = pd.read_csv('compounds.csv')   # 열: name, MW, HBD, HBA, TPSA, RotBonds, bp_C
X, y = d[['MW', 'HBD', 'HBA', 'TPSA', 'RotBonds']], d['bp_C']
for name, m in [('선형', LinearRegression()), ('랜덤포레스트', RandomForestRegressor(300, random_state=0))]:
    pred = cross_val_predict(m, X, y, cv=5)
    print(name, '평균 절대 오차: %.1f ℃' % mean_absolute_error(y, pred))
rf = RandomForestRegressor(300, random_state=0).fit(X, y)
print(dict(zip(X.columns, rf.feature_importances_.round(2))))`,
    protocol: ["작용기가 다른 유기 화합물 100개 이상의 분자 특성과 끓는점(실험값)을 수집한다.", "같은 작용기 계열에서 탄소 수-끓는점 관계를 먼저 그래프로 확인한다.", "선형 회귀와 랜덤포레스트 모델을 교차검증으로 비교한다.", "특성 중요도를 분석하고 분자간 힘(분산력, 쌍극자, 수소 결합)으로 해석한다.", "예측이 크게 틀린 화합물을 찾아 원인을 조사한다."],
    analysis: "모델별 평균 절대 오차·R², 특성 중요도, 잔차 분석, 이성질체(가지 구조) 사례 분석.",
    expected: "분자량과 수소 결합 주개 수가 중요 특성으로 나타나고, 작용기가 섞인 데이터에서는 비선형 모델이 더 정확할 것이다. 가지 구조처럼 모양 효과는 단순 특성으로 잘 설명되지 않을 것으로 예상된다.",
    extension: "RDKit으로 분자 지문을 추가하거나 녹는점·용해도 예측으로 확장한다.",
    safety: "공개 데이터의 출처를 밝히고 실험값과 계산값을 구분한다.",
    record: "분자 구조와 물성의 관계를 데이터로 탐구하고자 PubChem 자료로 유기 화합물의 끓는점 예측 모델을 구축함. 특성 중요도를 분자간 힘의 종류로 해석하고 예측이 틀린 이성질체 사례를 분석하여 모델의 한계를 화학적으로 설명하는 등 화학정보학적 사고를 보임.",
    careerLink: "화학·약학(물성 예측, 신약 설계), 화학정보학으로 연결된다.",
    searchTerms: ["QSPR 끓는점 예측 머신러닝", "boiling point prediction molecular descriptors random forest", "화학정보학 고등학생 PubChem"]
  },
  {
    id: "battery-textmining", methods: ["데이터 분석"], codeLang: "python",
    title: "논문 초록의 텍스트 마이닝으로 본 이차전지 연구 주제의 변화",
    subjects: ["정보", "화학"],
    keywords: ["텍스트 마이닝", "자연어 처리", "논문", "이차전지", "배터리", "연구 동향", "토픽 모델링", "빅데이터"],
    careers: ["데이터 과학자", "배터리 연구원", "화학공학자", "연구 기획", "AI 개발자"],
    majors: ["데이터사이언스학과", "화학공학과", "신소재공학과", "컴퓨터공학과", "화학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "공개 학술 데이터베이스에서 이차전지 관련 논문 초록을 수집해 연도별 핵심어 빈도와 토픽 모델링으로 연구 주제(전극 소재, 전고체, 나트륨 전지 등)의 변화를 분석한다.",
    trend: "문헌 데이터를 분석해 연구 동향을 파악하는 과학계량학과 텍스트 마이닝이 연구 기획과 소재 탐색에 활용되고 있다.",
    question: "최근 10년간 이차전지 연구에서 관심이 늘어난 소재·주제는 무엇이며, 화학적으로 어떤 이유가 있는가?",
    hypothesis: "전고체 전해질, 나트륨 이온, 리튬 금속 음극 관련 핵심어의 비중이 증가하고 있을 것이다.",
    variables: { independent: "출판 연도", dependent: "핵심어 빈도, 토픽 비중", controlled: "검색어, 데이터베이스, 전처리 규칙" },
    materials: [{ item: "OpenAlex 또는 arXiv 공개 API", note: "무료" }, { item: "PC, 파이썬(requests, pandas, scikit-learn)", note: "무료" }],
    dataSources: [{ name: "OpenAlex", url: "https://openalex.org/", note: "논문 메타데이터·초록(공개 API)" }, { name: "arXiv", url: "https://arxiv.org/", note: "물리·재료 분야 프리프린트 초록" }],
    circuit: [],
    code: `import requests, pandas as pd
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import LatentDirichletAllocation
rows = []
for year in range(2015, 2026):
    url = ('https://api.openalex.org/works?search=lithium%20battery%20electrolyte'
           f'&filter=publication_year:{year}&per-page=100&select=title,publication_year')
    for w in requests.get(url, timeout=30).json()['results']:
        rows.append({'year': year, 'text': w['title'] or ''})
df = pd.DataFrame(rows)
vec = CountVectorizer(stop_words='english', min_df=5)
X = vec.fit_transform(df['text'])
lda = LatentDirichletAllocation(n_components=6, random_state=0).fit(X)
words = vec.get_feature_names_out()
for k, comp in enumerate(lda.components_):
    print(k, [words[i] for i in comp.argsort()[-8:]])`,
    protocol: ["검색어와 기간을 정하고 공개 API로 논문 제목·초록을 수집한다.", "불용어 제거, 표제어 통일(battery/batteries) 등 전처리 규칙을 정한다.", "연도별 핵심어 빈도 변화를 그래프로 그린다.", "토픽 모델링으로 주제 묶음을 찾고 연도별 비중을 계산한다.", "증가한 주제의 화학적 배경(안전성, 자원, 에너지 밀도)을 문헌으로 조사한다."],
    analysis: "핵심어 빈도 추세, 토픽별 비중 변화, 동시 출현 네트워크, 화학적 해석.",
    expected: "전고체·나트륨 이온·실리콘 음극 등 핵심어의 비중이 증가하는 경향이 나타날 것으로 예상된다. 검색어 선택에 따라 결과가 달라지는 편향을 함께 논의해야 한다.",
    extension: "특허 데이터와 비교하거나, 관심 소재의 실제 전기화학 실험으로 이어 간다.",
    safety: "API 이용 규칙(요청 횟수 제한)을 지키고 출처를 밝힌다.",
    record: "이차전지 기술의 발전 방향을 데이터로 파악하고자 공개 학술 데이터베이스의 논문 정보를 수집하여 텍스트 마이닝과 토픽 모델링을 수행함. 연도별로 부상한 연구 주제를 찾아 그 화학적 배경을 문헌으로 분석하였으며, 검색어 선택에 따른 편향을 인식하는 비판적 태도를 보임.",
    careerLink: "데이터과학(과학계량학), 화학공학·소재(배터리 연구 기획)로 연결된다.",
    searchTerms: ["이차전지 연구 동향 텍스트 마이닝", "battery research topic modeling bibliometric", "OpenAlex API 논문 분석"]
  },
  {
    id: "hamming-code", methods: ["아두이노 활용", "실험"],
    title: "잡음 채널에서 해밍 부호의 오류 정정 효과와 전송 효율",
    subjects: ["정보", "물리"],
    keywords: ["오류 정정", "해밍 코드", "통신", "부호화", "디지털", "정보 이론", "적외선", "데이터 전송", "암호"],
    careers: ["통신공학자", "소프트웨어 개발자", "전자공학자", "보안 전문가"],
    majors: ["컴퓨터공학과", "전자공학과", "정보통신공학과", "수학과", "정보보호학과"],
    level: "심화", budget: 20000, duration: "1~2개월",
    summary: "아두이노 두 대를 적외선 LED와 수신기로 연결해 데이터를 보내고, 거리·방해광으로 잡음을 만들어 해밍(7,4) 부호 적용 전후의 비트 오류율과 실효 전송 속도를 비교한다.",
    trend: "오류 정정 부호는 5G 통신, 저장 장치, 우주 통신의 핵심 기술이며, 잡음 환경에 맞는 부호 설계 연구가 계속되고 있다.",
    question: "해밍 부호는 잡음 정도에 따라 오류율을 얼마나 줄이며, 추가 비트 때문에 줄어드는 전송 효율과 비교하면 언제 유리한가?",
    hypothesis: "오류가 드문 환경에서는 해밍 부호가 오류를 크게 줄이지만, 오류가 많아 한 블록에 2비트 이상 틀리면 효과가 급격히 줄어들 것이다.",
    variables: { independent: "송수신 거리, 방해광 세기, 부호 적용 여부", dependent: "비트 오류율, 블록 오류율, 실효 전송 속도", controlled: "전송 속도(baud), 전송 데이터, 정렬 각도" },
    materials: [{ item: "아두이노 우노 ×2", note: "약 16,000원" }, { item: "적외선 LED, 수신 포토다이오드(또는 IR 수신 모듈)", note: "약 2,000원" }, { item: "저항, 브레드보드, 줄자", note: "보유품" }],
    circuit: ["송신기: D3 → 220Ω → IR LED → GND", "수신기: 포토트랜지스터 컬렉터 → D2(10kΩ 풀업), 이미터 → GND", "두 보드는 전송 결과 확인을 위해 각각 PC에 연결"],
    code: `// 송신기: 4비트 데이터를 해밍(7,4)로 부호화하여 비트 단위로 전송
const int TX = 3, BIT_US = 2000;          // 500bps
byte encode(byte d) {                     // d: 하위 4비트 d1..d4
  byte d1 = d & 1, d2 = (d >> 1) & 1, d3 = (d >> 2) & 1, d4 = (d >> 3) & 1;
  byte p1 = d1 ^ d2 ^ d4, p2 = d1 ^ d3 ^ d4, p3 = d2 ^ d3 ^ d4;
  return p1 | p2 << 1 | d1 << 2 | p3 << 3 | d2 << 4 | d3 << 5 | d4 << 6;
}
void sendBits(byte v, int n) {
  digitalWrite(TX, HIGH); delayMicroseconds(BIT_US);       // 시작 비트
  for (int i = 0; i < n; i++) { digitalWrite(TX, (v >> i) & 1); delayMicroseconds(BIT_US); }
  digitalWrite(TX, LOW); delayMicroseconds(BIT_US * 3);
}
void setup() { pinMode(TX, OUTPUT); }
void loop() { for (byte d = 0; d < 16; d++) sendBits(encode(d), 7); }`,
    protocol: ["송신기와 수신기의 비트 타이밍을 맞추고 근거리에서 오류 없이 전송되는지 확인한다.", "같은 데이터 1만 비트 이상을 부호 없이 / 해밍 부호로 각각 전송한다.", "거리와 방해광(손전등)을 단계별로 바꾸며 반복한다.", "수신 측에서 신드롬으로 1비트 오류를 정정하고 오류율을 계산한다.", "이론적 블록 오류율(이항분포)과 측정값을 비교한다."],
    analysis: "조건별 비트 오류율, 부호 적용 전후 비교, 실효 전송 속도(4/7 효율 반영), 이론값과의 비교.",
    expected: "원래 오류율이 낮을 때는 해밍 부호가 오류를 크게 줄이지만, 오류율이 높아지면 다중 오류 때문에 효과가 감소할 것이다. 오류가 연속으로 몰리는 경우(버스트 오류)에는 인터리빙이 필요함을 발견할 수 있다.",
    extension: "인터리빙, CRC, 리드-솔로몬 부호와 비교하거나 가시광 통신으로 확장한다.",
    safety: "적외선 LED를 눈 가까이에서 직접 보지 않는다.",
    record: "디지털 통신의 신뢰성을 높이는 원리에 관심을 갖고 아두이노 적외선 통신 장치를 제작하여 해밍 부호의 오류 정정 효과를 측정함. 잡음 정도에 따라 부호의 효과가 달라짐을 이항분포 이론값과 비교해 설명하고 버스트 오류의 한계를 발견하는 등 정보 이론을 실험으로 검증함.",
    careerLink: "정보통신·컴퓨터공학(부호 이론), 전자공학으로 연결된다.",
    searchTerms: ["해밍 코드 오류 정정 실험 아두이노", "Hamming code bit error rate infrared Arduino", "오류 정정 부호 원리"]
  },
  {
    id: "vlc-communication", methods: ["아두이노 활용", "실험"],
    title: "LED 가시광 통신의 거리와 변조 속도에 따른 비트 오류율",
    subjects: ["물리", "정보"],
    keywords: ["가시광 통신", "LiFi", "빛", "LED", "광통신", "통신", "변조", "광센서", "무선"],
    careers: ["통신공학자", "전자공학자", "광학 엔지니어", "반도체"],
    majors: ["전자공학과", "정보통신공학과", "광공학과", "물리학과", "반도체공학과"],
    level: "중급", budget: 20000, duration: "1~2개월",
    summary: "LED를 빠르게 깜빡여 데이터를 보내고 포토다이오드로 받는 가시광 통신 장치를 만들어 거리, 변조 속도, 주변광, LED 색에 따른 비트 오류율을 측정한다.",
    trend: "조명을 통신에 활용하는 가시광 통신(LiFi)은 전파 간섭이 없는 실내 통신, 수중 통신 기술로 연구되고 있다.",
    question: "송수신 거리와 변조 속도가 증가할 때 비트 오류율은 어떻게 변하며, 주변 조명은 통신을 얼마나 방해하는가?",
    hypothesis: "빛의 세기가 거리 제곱에 반비례하여 거리가 멀수록 오류가 늘고, 변조 속도가 수신 소자의 응답 속도에 가까워지면 오류가 급증할 것이다.",
    variables: { independent: "거리, 변조 속도, LED 색, 주변광", dependent: "비트 오류율, 수신 신호 진폭", controlled: "LED 전류, 정렬 각도, 전송 데이터" },
    materials: [{ item: "아두이노 우노 ×2", note: "약 16,000원" }, { item: "고휘도 LED(백·적·청), 포토다이오드 또는 BPW34", note: "약 3,000원" }, { item: "트랜지스터(2N2222), 저항, 렌즈(돋보기)", note: "약 2,000원" }],
    circuit: ["송신: D9 → 1kΩ → 트랜지스터 베이스, LED는 5V-저항(100Ω)-컬렉터로 구동", "수신: 포토다이오드 역바이어스 + 10kΩ 부하저항, 전압을 A0(아날로그) 또는 비교기로 D2 입력"],
    code: `// 수신기: 문턱값 비교로 비트를 읽고 알려진 패턴과 비교해 오류율 계산
const int BIT_US = 1000, N = 2000;            // 1kbps, 2000비트
int threshold = 512;
void setup() { Serial.begin(115200); }
void loop() {
  while (analogRead(A0) < threshold);          // 시작 비트 대기
  delayMicroseconds(BIT_US * 1.5);
  int errors = 0;
  for (int i = 0; i < N; i++) {
    int bit = analogRead(A0) > threshold;
    int expected = i % 2;                       // 송신기는 0101… 패턴 전송
    if (bit != expected) errors++;
    delayMicroseconds(BIT_US - 110);            // analogRead 시간 보정
  }
  Serial.print("BER = "); Serial.println((float)errors / N, 4);
  delay(500);
}`,
    protocol: ["송신기는 정해진 비트 패턴을 반복 전송하도록 만든다.", "어두운 곳에서 거리 10~200cm를 바꾸며 오류율을 측정한다.", "변조 속도를 단계별로 높여 오류율이 급증하는 속도를 찾는다.", "형광등·햇빛 등 주변광을 비추며 비교하고, 문턱값 자동 조정 방법을 적용한다.", "LED 색과 렌즈 사용 여부를 바꾸어 비교한다."],
    analysis: "거리-수신 진폭(역제곱 법칙 확인), 거리·속도-오류율 그래프, 주변광 보정 효과.",
    expected: "거리 증가에 따라 수신 진폭이 역제곱에 가깝게 줄고, 일정 거리 이상에서 오류율이 급증할 것이다. 형광등의 깜빡임(교류)이 특정 조건에서 오류를 늘릴 수 있다.",
    extension: "맨체스터 부호화로 직류 성분 문제를 해결하거나 수중 통신 실험으로 확장한다.",
    safety: "고휘도 LED를 직접 오래 보지 않는다.",
    record: "조명을 통신에 활용하는 가시광 통신의 원리에 관심을 갖고 LED와 포토다이오드로 송수신 장치를 제작하여 거리와 변조 속도에 따른 비트 오류율을 측정함. 수신 신호가 역제곱 법칙을 따름을 확인하고 주변광 간섭을 줄이는 문턱값 조정 방법을 설계하는 등 물리와 정보를 융합한 탐구를 수행함.",
    careerLink: "정보통신·전자공학(광통신), 광학으로 연결된다.",
    searchTerms: ["가시광 통신 비트 오류율 거리", "visible light communication Arduino BER distance", "LiFi 원리 고등학생 실험"]
  },
  {
    id: "ga-turbine", methods: ["실험", "데이터 분석"], codeLang: "python",
    title: "유전 알고리즘으로 최적화한 소형 풍차 날개 모양과 회전 성능",
    subjects: ["정보", "물리"],
    keywords: ["유전 알고리즘", "최적화", "풍력", "날개", "에너지", "진화 알고리즘", "공기역학", "3D 프린팅"],
    careers: ["소프트웨어 개발자", "기계공학자", "에너지공학자", "항공우주공학자"],
    majors: ["컴퓨터공학과", "기계공학과", "항공우주공학과", "에너지공학과", "산업공학과"],
    level: "심화", budget: 40000, duration: "3~4개월",
    summary: "종이·3D 프린팅 날개의 각도·폭·개수를 유전자로 표현하고, 선풍기 앞에서 측정한 회전 속도(또는 발전 전압)를 적합도로 삼아 세대를 거듭하며 날개를 개선한다.",
    trend: "진화 알고리즘은 날개·안테나 등 형상 최적화에 쓰이며, 실제 측정을 반복에 넣는 '실험 기반 최적화' 연구도 진행되고 있다.",
    question: "실측 기반 유전 알고리즘으로 몇 세대 안에 날개 성능을 얼마나 높일 수 있으며, 최적 날개의 특징은 무엇인가?",
    hypothesis: "세대가 거듭될수록 평균 적합도가 증가하다가 수렴하고, 최적 날개는 특정 피치 각도 범위에 모일 것이다.",
    variables: { independent: "날개 각도·폭·개수(유전자), 세대", dependent: "회전 속도(rpm) 또는 발전 전압", controlled: "풍속(선풍기 단계·거리), 날개 길이, 축 마찰" },
    materials: [{ item: "소형 DC 모터(발전기)와 축, 선풍기", note: "약 10,000원" }, { item: "두꺼운 종이·우드락 또는 3D 프린팅 날개", note: "약 15,000원" }, { item: "멀티미터 또는 아두이노(전압 기록), 스마트폰 회전수 측정 앱", note: "보유품" }],
    circuit: ["선풍기에서 1m 거리에 풍차를 고정하고 발전기 출력에 10Ω 부하를 연결해 전압 측정"],
    code: `import random
# 유전자: [피치각(0~45°), 날개 폭(1~5cm), 날개 수(2~6)]
def random_gene(): return [random.uniform(0, 45), random.uniform(1, 5), random.randint(2, 6)]
def mutate(g):
    g = g[:]; i = random.randrange(3)
    g[i] = random_gene()[i]; return g
def crossover(a, b): return [random.choice(p) for p in zip(a, b)]
pop = [random_gene() for _ in range(8)]
for gen in range(5):
    fitness = [float(input(f'{gen}세대 날개 {[round(x,1) for x in g]} 측정 전압(V): ')) for g in pop]
    ranked = [g for _, g in sorted(zip(fitness, pop), reverse=True)]
    parents = ranked[:4]
    pop = parents + [mutate(crossover(*random.sample(parents, 2))) for _ in range(4)]
    print(f'{gen}세대 최고 {max(fitness):.2f} V, 평균 {sum(fitness)/len(fitness):.2f} V')`,
    protocol: ["날개 모양을 빠르게 바꿔 끼울 수 있는 허브와 측정 장치를 만든다.", "첫 세대 날개 8개를 무작위 유전자로 만들어 측정한다(각 3회 평균).", "상위 날개를 선택·교차·돌연변이하여 다음 세대를 만든다.", "5세대 이상 반복하며 최고·평균 적합도를 기록한다.", "최종 날개와 사람이 직관적으로 설계한 날개를 비교한다."],
    analysis: "세대별 적합도 변화, 유전자 분포 변화, 최적 날개의 피치 각도를 공기역학(받음각)으로 해석.",
    expected: "몇 세대 만에 평균 성능이 뚜렷이 오르고 피치 각도가 특정 범위로 수렴할 것이다. 측정 잡음이 커서 반복 측정과 개체 수가 결과에 큰 영향을 줄 것으로 예상된다.",
    extension: "시뮬레이션(블레이드 요소 이론)과 실측을 함께 쓰는 혼합 최적화로 확장한다.",
    safety: "회전 날개에 손이 닿지 않도록 보호망 사용.",
    record: "생물의 진화 원리를 공학 설계에 적용하고자 실측 기반 유전 알고리즘으로 소형 풍차 날개를 최적화함. 세대별 적합도 향상을 확인하고 수렴한 날개의 피치 각도를 받음각 개념으로 해석하였으며, 측정 잡음이 최적화에 미치는 영향을 분석하는 등 알고리즘과 실험을 융합한 탐구를 수행함.",
    careerLink: "컴퓨터공학(최적화 알고리즘), 기계·항공우주(형상 설계)로 연결된다.",
    searchTerms: ["유전 알고리즘 풍력 날개 최적화", "genetic algorithm wind turbine blade experimental optimization", "진화 알고리즘 형상 최적화"]
  },
  {
    id: "sleep-obesity-knhanes", methods: ["데이터 분석"], codeLang: "python",
    title: "청소년의 수면 시간과 비만도의 관계: 국민건강영양조사 자료 분석",
    subjects: ["정보", "생명과학"],
    keywords: ["수면", "비만", "건강", "청소년", "통계", "공공데이터", "보건", "회귀분석", "역학"],
    careers: ["의사", "간호사", "보건", "영양사", "데이터 분석가", "통계학자"],
    majors: ["의예과", "간호학과", "보건학과", "식품영양학과", "통계학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "국민건강영양조사 원자료에서 청소년의 수면 시간, 체질량지수, 신체활동, 식습관 변수를 추출해 수면 부족과 비만의 관계를 회귀분석으로 검토한다.",
    trend: "수면 부족과 대사 건강의 관계는 청소년 건강 연구의 주요 주제이며, 공공 보건 자료를 이용한 관찰 연구가 많다.",
    question: "청소년의 평균 수면 시간이 짧을수록 비만 위험이 높은가? 신체활동·식습관을 함께 고려해도 관계가 유지되는가?",
    hypothesis: "수면 시간이 짧은 집단의 비만 비율이 높고, 다른 변수를 통제해도 약한 관계가 남을 것이다.",
    variables: { independent: "수면 시간", dependent: "체질량지수, 비만 여부", controlled: "성별, 연령, 신체활동, 식습관(통계적 통제)" },
    materials: [{ item: "국민건강영양조사 원자료(회원가입 후 무료)", note: "무료" }, { item: "PC, 파이썬(pandas, statsmodels) 또는 엑셀", note: "무료" }],
    dataSources: [{ name: "국민건강영양조사(질병관리청)", url: "https://knhanes.kdca.go.kr/", note: "원자료 이용 신청 및 변수 설명서 확인" }],
    circuit: [],
    code: `import pandas as pd
import statsmodels.formula.api as smf
d = pd.read_sas('hn22_all.sas7bdat')            # 내려받은 원자료(변수명은 설명서 참고)
d = d[(d['age'] >= 12) & (d['age'] <= 18)]
d['obese'] = (d['HE_BMI'] >= 25).astype(int)    # 청소년 기준은 성장도표 백분위 사용 권장
m = smf.logit('obese ~ sleep_hours + C(sex) + age + activity', data=d).fit()
print(m.summary())`,
    protocol: ["원자료 이용 신청 후 변수 설명서에서 수면·체질량지수·신체활동 변수를 확인한다.", "청소년 응답자만 추출하고 결측값 처리 기준을 정한다.", "수면 시간 집단별 비만 비율을 비교한다.", "성별·연령·신체활동 등을 넣은 로지스틱 회귀분석을 한다.", "가중치를 고려한 분석과 고려하지 않은 분석을 비교하고, 인과관계 해석의 한계를 정리한다."],
    analysis: "집단별 비교(카이제곱 검정), 로지스틱 회귀의 오즈비와 신뢰구간, 교란 변수의 영향.",
    expected: "수면 시간이 짧은 집단에서 비만 비율이 다소 높게 나타날 수 있으나, 다른 변수를 통제하면 관계가 약해질 수 있다. 관찰 자료이므로 인과관계를 단정할 수 없다는 결론이 중요하다.",
    extension: "스마트폰 사용 시간, 아침 식사 여부 등 생활 습관 변수를 추가하거나 학교 설문 자료와 비교한다.",
    safety: "공공 원자료의 이용 약관을 지키고, 개인을 식별할 수 있는 정보를 다루지 않는다.",
    record: "청소년 건강 문제에 관심을 갖고 국민건강영양조사 원자료를 분석하여 수면 시간과 비만의 관계를 검토함. 교란 변수를 통제한 회귀분석으로 관계의 크기를 추정하고 관찰 연구에서 인과를 단정할 수 없는 이유를 논리적으로 설명하는 등 보건 통계에 대한 깊은 이해를 보임.",
    careerLink: "의학·간호·보건(역학 연구), 통계학으로 연결된다.",
    searchTerms: ["청소년 수면 시간 비만 국민건강영양조사", "adolescent sleep duration obesity KNHANES", "로지스틱 회귀 오즈비 해석"]
  },
  {
    id: "butterfly-range", methods: ["데이터 분석"], codeLang: "python",
    title: "생물 출현 기록으로 본 기온 상승과 남방계 나비의 분포 북상",
    subjects: ["생명과학", "정보", "지구과학"],
    keywords: ["생물 분포", "기후변화", "나비", "곤충", "생태", "GBIF", "시민과학", "지도", "데이터"],
    careers: ["생태학자", "생명과학자", "환경", "데이터 분석가", "국립공원 연구원"],
    majors: ["생명과학과", "생태학과", "산림자원학과", "환경학과", "데이터사이언스학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "GBIF와 시민과학 플랫폼의 한반도 나비 출현 기록을 연도별로 정리하여 남방계 종의 북방 한계선 변화를 계산하고, 기온 자료와 비교한다.",
    trend: "기후변화에 따른 생물 분포 이동은 생태학의 핵심 주제이며, 시민과학 관찰 기록을 활용한 분포 연구가 늘고 있다.",
    question: "남방계 나비의 출현 북방 한계는 최근 수십 년간 북쪽으로 이동했는가? 그 변화는 기온 상승과 관련이 있는가?",
    hypothesis: "남방계 종의 출현 위도 상위값이 시간에 따라 증가하고, 이는 연평균 기온 상승과 양의 상관을 보일 것이다.",
    variables: { independent: "연도, 지역 기온", dependent: "출현 위도(상위 5% 값), 출현 지점 수", controlled: "관찰 노력(기록 수) 보정, 종 동정 신뢰도" },
    materials: [{ item: "GBIF 출현 기록(CSV)", note: "무료" }, { item: "PC, 파이썬(pandas, geopandas 선택)", note: "무료" }],
    dataSources: [{ name: "GBIF", url: "https://www.gbif.org/", note: "종별 출현 기록(위도·경도·날짜)" }, { name: "국립생물자원관 한반도의 생물다양성", url: "https://species.nibr.go.kr/", note: "종 정보·분포 확인" }],
    circuit: [],
    code: `import pandas as pd
d = pd.read_csv('occurrence.csv', sep='\\t', usecols=['species', 'decimalLatitude', 'year'])
d = d[(d['year'] >= 1990) & d['decimalLatitude'].between(33, 39)]
north = d.groupby(['species', d['year'] // 5 * 5])['decimalLatitude'].quantile(0.95).unstack(0)
print(north.round(2))          # 5년 단위 북방 한계(상위 5% 위도)`,
    protocol: ["문헌에서 남방계 나비 3~5종과 비교용 북방계·광역 분포 종을 고른다.", "GBIF에서 한반도 출현 기록을 내려받는다.", "좌표 오류, 중복 기록, 표본 기록 여부를 정리한다.", "5년 단위로 상위 5% 위도를 계산한다(관찰 수 증가 효과 보정).", "같은 기간 기온 자료와 비교한다."],
    analysis: "기간별 북방 한계 변화(km/10년), 비교 종과의 차이, 관찰 노력 보정 전후 비교.",
    expected: "남방계 종의 북방 한계가 북쪽으로 이동하는 경향이 나타날 수 있으나, 최근 시민과학 기록 증가로 인한 착시를 보정해야 한다는 점이 중요한 결론이 될 것이다.",
    extension: "학교 주변에서 직접 나비 모니터링을 하여 기록을 플랫폼에 올리는 시민과학 활동으로 확장한다.",
    safety: "공개 데이터의 라이선스와 출처를 밝히고, 보호종의 정밀 위치는 공개하지 않는다.",
    record: "기후변화가 생물 분포에 미치는 영향을 확인하고자 공개 생물 출현 기록으로 남방계 나비의 분포 변화를 분석함. 관찰 노력 증가에 따른 편향을 인식하고 상위 백분위 위도와 비교 종을 사용해 보정하는 등 생태 자료의 한계를 고려한 신중한 분석을 수행함.",
    careerLink: "생태학·보전생물학, 생물다양성 데이터 분석으로 연결된다.",
    searchTerms: ["남방계 나비 북상 기후변화 한반도", "butterfly range shift climate warming Korea GBIF", "시민과학 관찰 노력 편향 보정"]
  }
);
