/*
 * 내장 탐구 주제 데이터베이스
 * - API 키가 없어도 동작하는 기본 추천용 데이터입니다.
 * - 선생님이 직접 주제를 추가할 수 있습니다. 아래 객체 하나를 복사해 내용을 바꾸면 됩니다.
 *   subjects 값은 "물리" | "화학" | "생명과학" | "지구과학" | "정보" 중에서 고르세요.
 *   methods 값은 "실험" | "데이터 분석" | "아두이노 활용" | "첨단 기자재 활용" 중에서 고르세요(여러 개 가능).
 *   codeLang: 코드가 아두이노면 "arduino"(기본), 파이썬이면 "python".
 *   dataSources: 데이터 분석 주제의 공공 데이터 출처 [{ name, url, note }].
 *   access: 첨단 기자재를 어디서 이용할 수 있는지 안내.
 * - 제목은 장비 이름보다 '탐구하는 현상과 변인'이 드러나게 씁니다. 예) "~에 따른 ~의 ~ 변화"
 * - 참고문헌은 지어내지 않도록, 실제 검색 링크(searchTerms)로 대신 제공합니다.
 */
window.TOPICS_DB = [
  {
    id: "pm-indoor",
    title: "환기 방식에 따른 교실 내 미세먼지(PM2.5)와 이산화탄소 농도 변화",
    subjects: ["지구과학", "화학", "정보"],
    keywords: ["미세먼지", "PM2.5", "대기오염", "공기질", "환기", "실내공기", "CO2", "환경", "기후", "IoT", "센서"],
    careers: ["환경공학자", "대기과학자", "보건", "환경", "기상", "건축"],
    majors: ["환경공학과", "대기과학과", "건축학과", "보건학과", "지구환경과학과"],
    level: "중급", budget: 45000, duration: "1~2개월",
    summary: "레이저 산란식 미세먼지 센서와 CO₂ 센서로 창문 환기·맞통풍·공기청정기 조건에서 교실 공기질이 얼마나 빨리 회복되는지 비교한다.",
    trend: "저가 센서를 활용한 시민과학형 대기질 모니터링이 활발하며, 저가 센서의 습도 보정 문제와 실내 CO₂ 기반 환기 지표가 주요 연구 주제로 다뤄지고 있다. 학교 실내 공기질 관리 기준과 관련한 뉴스도 꾸준히 나온다.",
    question: "환기 방식(한쪽 창문 / 맞통풍 / 공기청정기)에 따라 교실의 PM2.5와 CO₂ 농도가 기준치 이하로 떨어지는 시간은 어떻게 달라지는가?",
    hypothesis: "맞통풍은 CO₂와 PM2.5를 모두 빠르게 낮추지만, 외부 미세먼지가 높은 날에는 공기청정기 조건이 PM2.5를 더 빨리 낮출 것이다.",
    variables: { independent: "환기 방식, 외기 미세먼지 농도", dependent: "PM2.5·PM10·CO₂ 농도의 감소 시간(반감기)", controlled: "교실 크기, 재실 인원, 측정 위치·높이, 측정 시간대" },
    materials: [
      { item: "아두이노 우노(호환보드)", note: "약 8,000원" },
      { item: "PMS7003 미세먼지 센서 + 어댑터", note: "약 20,000원" },
      { item: "MH-Z19B CO₂ 센서", note: "약 15,000원 (선택)" },
      { item: "DHT22 온습도 센서", note: "약 4,000원 — 습도 보정용" },
      { item: "브레드보드·점퍼선, USB 케이블", note: "보유 장비 활용" }
    ],
    circuit: [
      "PMS7003: VCC→5V, GND→GND, TX→D2(SoftwareSerial RX), RX→D3",
      "MH-Z19B: Vin→5V, GND→GND, TX→D4, RX→D5",
      "DHT22: VCC→5V, DATA→D7(10kΩ 풀업), GND→GND"
    ],
    code: `#include <SoftwareSerial.h>
#include "PMS.h"          // 라이브러리: PMS Library (Mariusz Kacki)
#include <DHT.h>          // 라이브러리: DHT sensor library (Adafruit)

SoftwareSerial pmsSerial(2, 3);
PMS pms(pmsSerial);
PMS::DATA data;
DHT dht(7, DHT22);

void setup() {
  Serial.begin(9600);
  pmsSerial.begin(9600);
  dht.begin();
  Serial.println("ms,PM1_0,PM2_5,PM10,temp,humid");
}

void loop() {
  if (pms.readUntil(data, 2000)) {
    Serial.print(millis()); Serial.print(',');
    Serial.print(data.PM_AE_UG_1_0); Serial.print(',');
    Serial.print(data.PM_AE_UG_2_5); Serial.print(',');
    Serial.print(data.PM_AE_UG_10_0); Serial.print(',');
    Serial.print(dht.readTemperature()); Serial.print(',');
    Serial.println(dht.readHumidity());
  }
  delay(5000);   // 5초 간격 기록
}`,
    protocol: [
      "센서 3대를 같은 장소에 24시간 두고 값 차이를 비교해 센서 간 편차(보정식)를 구한다.",
      "가까운 에어코리아 측정소 값과 비교해 습도에 따른 저가 센서 오차를 확인한다.",
      "환기 전 교실을 닫아 두고 기준 농도를 측정한다(10분).",
      "환기 방식 3가지를 서로 다른 날, 같은 시간대에 적용하며 30분간 5초 간격으로 기록한다.",
      "각 조건을 최소 3회 반복하고 외기 농도도 함께 기록한다.",
      "시리얼 데이터를 CSV로 저장해 파이썬/엑셀로 농도-시간 그래프를 그린다."
    ],
    analysis: "농도 감소 구간을 지수함수 C(t)=C₀e^(−kt)로 근사해 감소 상수 k와 반감기를 구하고, 조건별 평균과 표준편차를 비교한다. 상대습도 70% 이상 구간은 별도로 표시한다.",
    expected: "CO₂는 맞통풍에서 가장 빨리 감소하고, PM2.5는 외기 농도에 크게 의존하여 외기가 나쁜 날에는 공기청정기 조건이 유리하다는 결론이 예상된다. 저가 센서는 고습도에서 과대 측정 경향이 나타날 수 있다.",
    extension: "Wi‑Fi 보드(ESP32)로 교내 여러 교실의 실시간 공기질 지도를 만들고, 환기 알림 시스템을 설계한다.",
    safety: "외부 측정 시 차량 통행 주의. 센서 팬 흡입구를 막지 않는다.",
    record: "실내 공기질에 관심을 갖고 저가 미세먼지·CO₂ 센서를 아두이노로 제작하여 환기 방식별 오염물질 감소 속도를 비교함. 센서 간 편차와 습도 오차를 공공 측정소 자료와 비교해 보정하는 과정에서 측정 신뢰도의 중요성을 인식하였고, 농도 변화를 지수함수로 모델링하여 반감기를 산출하는 등 수학적 분석 역량을 보임.",
    careerLink: "환경공학·대기과학(대기오염 모니터링), 건축(환기 설계), 보건(실내 환경 기준) 분야로 연결된다.",
    searchTerms: ["저가 미세먼지 센서 보정", "교실 환기 CO2 농도", "low-cost PM2.5 sensor humidity correction"]
  },
  {
    id: "led-farm",
    title: "적색광과 청색광의 혼합 비율이 상추의 생장에 미치는 영향",
    subjects: ["생명과학", "물리", "정보"],
    keywords: ["스마트팜", "LED", "광합성", "식물", "농업", "식량", "수경재배", "빛", "파장", "자동화", "IoT"],
    careers: ["농업연구사", "바이오", "식품", "스마트팜", "생명공학자", "환경"],
    majors: ["원예학과", "식물자원학과", "바이오시스템공학과", "생명과학과", "농업생명과학대학"],
    level: "중급", budget: 70000, duration: "1~2개월",
    summary: "적색·청색 LED의 비율을 바꾸어 상추를 키우고, 토양 수분 센서로 자동 관수하며 생장량(엽면적·생체중)을 비교한다.",
    trend: "수직농장·식물공장에서 광질(파장 비율) 최적화와 에너지 효율이 핵심 연구 주제이며, 기후변화 대응 스마트팜 관련 정책 뉴스도 많다.",
    question: "적색:청색 LED 비율(10:0, 7:3, 5:5, 0:10)에 따라 상추의 생체중과 엽면적은 어떻게 달라지는가?",
    hypothesis: "엽록소의 흡수 파장을 고려할 때 적색과 청색을 혼합한 조건(7:3)에서 생장이 가장 클 것이다.",
    variables: { independent: "적색:청색 LED 비율", dependent: "생체중, 엽면적, 엽수, (선택) 엽록소 함량", controlled: "광량(조도 맞춤), 광주기, 온도, 배양토, 관수량" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "WS2812B RGB LED 스트립(1m)", note: "약 10,000원 — 색 비율 제어" },
      { item: "정전용량식 토양수분 센서 ×4", note: "약 8,000원" },
      { item: "미니 워터펌프 + 릴레이 모듈", note: "약 8,000원" },
      { item: "BH1750 조도 센서", note: "약 3,000원" },
      { item: "상추 모종, 배양토, 칸막이용 우드락·은박지", note: "약 15,000원" },
      { item: "5V 3A 어댑터", note: "약 6,000원" }
    ],
    circuit: [
      "WS2812B: DIN→D6(330Ω), 5V→외부 어댑터 5V, GND 공통",
      "토양수분 센서 AOUT→A0~A3",
      "릴레이 IN→D8, 릴레이로 펌프 전원 스위칭",
      "BH1750: SDA→A4, SCL→A5"
    ],
    code: `#include <Adafruit_NeoPixel.h>   // 라이브러리: Adafruit NeoPixel
#define LED_PIN 6
#define NUM_LED 30
Adafruit_NeoPixel strip(NUM_LED, LED_PIN, NEO_GRB + NEO_KHZ800);

const int SOIL = A0, PUMP = 8;
const int DRY_LEVEL = 520;   // 측정 후 직접 보정할 값(값이 클수록 건조)
int redRatio = 7;            // 적:청 = 7:3

void setup() {
  Serial.begin(9600);
  pinMode(PUMP, OUTPUT);
  strip.begin();
  for (int i = 0; i < NUM_LED; i++) {
    // 10개 단위로 적색 7개, 청색 3개 배치
    if (i % 10 < redRatio) strip.setPixelColor(i, strip.Color(255, 0, 0));
    else strip.setPixelColor(i, strip.Color(0, 0, 255));
  }
  strip.show();
}

void loop() {
  int soil = analogRead(SOIL);
  Serial.print(millis()); Serial.print(','); Serial.println(soil);
  if (soil > DRY_LEVEL) {       // 건조하면 3초 급수
    digitalWrite(PUMP, HIGH); delay(3000); digitalWrite(PUMP, LOW);
  }
  delay(60000);                 // 1분마다 확인
}`,
    protocol: [
      "빛이 섞이지 않도록 은박지로 칸막이한 재배 칸 4개를 만든다.",
      "조도 센서로 각 칸의 광량이 같도록 LED 개수·밝기를 조절한다.",
      "같은 크기의 모종을 칸마다 3~5주씩 심고, 광주기는 16시간 명/8시간 암으로 둔다.",
      "토양 수분 센서 값으로 자동 관수하고 관수 기록을 저장한다.",
      "주 2회 엽수·엽면적(사진을 찍어 ImageJ 또는 파이썬으로 면적 계산)을 측정한다.",
      "4주 후 생체중을 측정하고 조건 간 차이를 비교한다."
    ],
    analysis: "조건별 평균 생체중·엽면적을 막대그래프로 비교하고, 반복 개체 수를 고려해 분산분석(ANOVA) 또는 t-검정으로 유의성을 확인한다.",
    expected: "청색 비율이 높을수록 잎이 두껍고 줄기가 짧으며, 적색 위주는 웃자람이 나타나 혼합광 조건에서 생체중이 가장 크게 나타날 가능성이 높다.",
    extension: "같은 생장량을 얻는 데 드는 전력량(INA219로 측정)을 비교하여 에너지 효율 최적 조건을 찾는다.",
    safety: "물과 전기 회로가 가까우므로 회로는 방수 케이스에 넣고, 펌프 전원은 반드시 저전압(5V)을 사용한다.",
    record: "식물공장의 광질 최적화에 관심을 갖고 적색·청색 LED 비율을 제어하는 재배 장치를 제작하여 상추 생장을 비교함. 광량을 조도 센서로 통제하여 광질만의 효과를 분리하려는 실험 설계가 돋보였으며, 이미지 분석으로 엽면적을 정량화하고 통계적 유의성을 검토함.",
    careerLink: "스마트팜·원예·바이오시스템공학 분야(환경 제어 농업)와 연결된다.",
    searchTerms: ["LED 광질 상추 생장", "적색 청색 LED 비율 식물공장", "red blue LED ratio lettuce growth"]
  },
  {
    id: "piezo-harvest",
    title: "압전 소자의 연결 방식에 따른 충격 에너지의 전기 에너지 변환 효율",
    subjects: ["물리", "정보"],
    keywords: ["에너지", "압전", "에너지 하베스팅", "전기", "신재생", "발전", "전자", "회로", "탄소중립"],
    careers: ["전기전자공학자", "에너지", "반도체", "신재생에너지", "엔지니어"],
    majors: ["전기전자공학과", "에너지공학과", "신소재공학과", "기계공학과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "압전 소자를 직렬·병렬로 연결하고 정류·축전 회로를 구성해, 발걸음 충격으로 얻을 수 있는 전기 에너지를 측정한다.",
    trend: "웨어러블·IoT 센서의 자가 전원 공급을 위한 압전 에너지 하베스팅 연구가 활발하고, 압전 보도블록 실증 사례가 뉴스로 소개된다.",
    question: "압전 소자의 연결 방식(직렬·병렬)과 충격 세기에 따라 축전기에 저장되는 에너지는 어떻게 달라지는가?",
    hypothesis: "직렬 연결은 전압을, 병렬 연결은 전하량을 키우므로 축전기 충전에는 정류 후 병렬 연결이 더 효율적일 것이다.",
    variables: { independent: "연결 방식, 소자 개수, 낙하 높이(충격 세기)", dependent: "출력 전압, 축전기 저장 에너지(½CV²)", controlled: "낙하 물체 질량, 소자 종류, 축전기 용량, 정류 회로" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "압전 소자(피에조 디스크 27mm) 10개", note: "약 3,000원" },
      { item: "브리지 다이오드(1N4007 ×4) 또는 정류 브리지", note: "약 1,000원" },
      { item: "전해 축전기 100µF·470µF", note: "약 1,000원" },
      { item: "저항(1MΩ, 100kΩ) — 전압 분배", note: "약 500원" },
      { item: "추(쇠구슬)와 높이 고정용 투명 관", note: "약 5,000원" }
    ],
    circuit: [
      "압전 소자 → 브리지 정류기 → 축전기",
      "축전기 전압을 1MΩ(R1)–100kΩ(R2) 전압 분배기로 낮춰 R2 양단을 A0로 측정(A0 입력 5V 초과 금지)",
      "충격 시 순간 전압은 수십 V가 될 수 있으므로 소자를 아두이노에 직접 연결하지 않는다"
    ],
    code: `// 축전기 충전 전압을 기록 (전압 분배비를 실제 저항값으로 수정)
const float R1 = 1000000.0, R2 = 100000.0;   // 분배 저항
const float C = 100e-6;                        // 축전기 용량(F)

void setup() {
  Serial.begin(115200);
  Serial.println("ms,Vcap,Energy_uJ");
}

void loop() {
  float vA0 = analogRead(A0) * 5.0 / 1023.0;
  float vCap = vA0 * (R1 + R2) / R2;
  float energy = 0.5 * C * vCap * vCap * 1e6;   // 마이크로줄
  Serial.print(millis()); Serial.print(',');
  Serial.print(vCap, 3); Serial.print(',');
  Serial.println(energy, 2);
  delay(50);
}`,
    protocol: [
      "압전 소자 1개에 일정 높이에서 추를 떨어뜨려 단일 소자의 출력 특성을 측정한다.",
      "소자 4개를 직렬·병렬·직병렬로 연결한 판을 만든다.",
      "추를 10, 20, 30cm 높이에서 각 50회씩 떨어뜨리며 축전기 전압을 기록한다.",
      "실제 발걸음으로도 같은 횟수를 밟아 비교한다.",
      "축전기에 저장된 에너지를 계산하고 추의 위치에너지 대비 변환 효율을 구한다."
    ],
    analysis: "충격 횟수-저장 에너지 그래프의 기울기로 1회당 에너지를 구하고, 위치에너지(mgh) 대비 효율을 비교한다.",
    expected: "1회 충격당 얻는 에너지는 마이크로줄(µJ) 수준으로 매우 작으며, 정류 후 병렬 연결이 축전에 유리하다는 결과가 예상된다. 결론에서 실제 활용 가능성(저전력 센서 구동)과 한계를 함께 논의할 수 있다.",
    extension: "얻은 에너지로 저전력 LED나 온도 센서를 구동할 수 있는지 시험하고, 신발 깔창형 하베스터를 설계한다.",
    safety: "추 낙하 시 손가락 끼임 주의. 큰 축전기는 방전 후 만진다.",
    record: "압전 효과를 이용한 에너지 하베스팅의 실용성을 검증하고자 소자 연결 방식별 축전 에너지를 측정함. 정류 회로와 전압 분배 회로를 직접 설계하고 위치에너지 대비 변환 효율을 계산하여, 신재생 에너지 기술의 가능성과 한계를 정량적으로 평가함.",
    careerLink: "전기전자공학(전력 변환 회로), 신소재공학(압전 재료), 웨어러블 기기 개발로 이어진다.",
    searchTerms: ["압전 에너지 하베스팅 보도블록", "piezoelectric energy harvesting footstep", "압전소자 직렬 병렬 효율"]
  },
  {
    id: "water-quality",
    title: "강우 전후 도시 하천의 탁도·총용존고형물·pH 변화",
    subjects: ["화학", "지구과학", "정보"],
    keywords: ["수질", "하천", "물", "환경", "pH", "TDS", "탁도", "오염", "강우", "비", "생태"],
    careers: ["환경공학자", "수질", "환경", "화학공학", "공무원", "생태학자"],
    majors: ["환경공학과", "화학공학과", "화학과", "지구환경과학과", "토목공학과"],
    level: "기초", budget: 60000, duration: "3~4개월",
    summary: "아두이노 수질 센서 키트로 하천의 탁도, 총용존고형물(TDS), pH, 수온을 정기적으로 측정해 강우와 계절에 따른 변화를 분석한다.",
    trend: "저가 수질 센서를 이용한 시민 참여형 하천 모니터링과 도시 비점오염원(강우 초기 유출) 연구가 진행되고 있다.",
    question: "강우 직후 하천의 탁도와 TDS는 어떻게 변하며, 평상시 수준으로 회복되는 데 얼마나 걸리는가?",
    hypothesis: "강우 직후 토사 유입으로 탁도는 급증하고, 희석 효과로 TDS는 감소할 것이다.",
    variables: { independent: "강우량, 강우 후 경과 시간, 측정 지점(상·하류)", dependent: "탁도(NTU 환산), TDS(ppm), pH, 수온", controlled: "측정 시각, 채수 깊이, 센서 보정 절차" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "아날로그 TDS 센서", note: "약 12,000원" },
      { item: "탁도 센서(SEN0189 호환)", note: "약 12,000원" },
      { item: "아날로그 pH 센서 + 보정액(pH 4, 7)", note: "약 25,000원" },
      { item: "DS18B20 방수 온도 센서", note: "약 3,000원" },
      { item: "채수병, 증류수", note: "학교 보유" }
    ],
    circuit: [
      "TDS→A1, 탁도→A2, pH→A0 (각 5V/GND)",
      "DS18B20 DATA→D2 (4.7kΩ 풀업)"
    ],
    code: `#include <OneWire.h>
#include <DallasTemperature.h>
OneWire ow(2);
DallasTemperature temp(&ow);

float readVolt(int pin) {
  long sum = 0;
  for (int i = 0; i < 30; i++) { sum += analogRead(pin); delay(10); }
  return sum / 30.0 * 5.0 / 1023.0;
}

void setup() { Serial.begin(9600); temp.begin(); Serial.println("T,pH_V,TDS_V,Turb_V"); }

void loop() {
  temp.requestTemperatures();
  float t = temp.getTempCByIndex(0);
  // 전압값을 그대로 기록하고, 보정식은 표준액 측정 후 엑셀/파이썬에서 적용
  Serial.print(t); Serial.print(',');
  Serial.print(readVolt(A0), 3); Serial.print(',');
  Serial.print(readVolt(A1), 3); Serial.print(',');
  Serial.println(readVolt(A2), 3);
  delay(2000);
}`,
    protocol: [
      "pH 4·7 보정액, 농도를 아는 소금물(TDS 표준), 탁도 표준(우유 희석 등)으로 센서 보정 곡선을 만든다.",
      "하천의 상류·중류·하류 3지점을 정하고, 매주 같은 시간에 채수해 측정한다.",
      "비가 온 날은 강우 직후, 6시간, 24시간, 48시간 후 측정한다.",
      "기상청 강수량 자료를 함께 기록한다.",
      "측정 후 센서를 증류수로 세척·보관한다."
    ],
    analysis: "강수량과 수질 지표의 시계열 그래프를 그리고, 강우 후 회복 시간과 지점별 차이를 비교한다. 강수량-탁도 상관계수를 구한다.",
    expected: "강우 초기에 탁도가 크게 오르고 TDS는 희석되어 낮아지며, 하류일수록 도시 유출 영향이 크게 나타날 것으로 예상된다.",
    extension: "공공 수질측정망 자료와 비교하여 저가 센서의 정확도를 평가하거나, 태양광 전원으로 무인 측정 부이를 만든다.",
    safety: "하천 채수는 반드시 2인 이상, 비가 많이 올 때·직후 급류 시에는 접근 금지. 보호자·교사 동행.",
    record: "지역 하천의 수질 변화에 관심을 갖고 아두이노 수질 센서를 보정하여 3개 지점의 탁도·TDS·pH를 장기간 측정함. 강우 직후 탁도 급증과 회복 과정을 시계열로 분석하여 비점오염원의 영향을 설명하였으며, 공공 자료와 비교해 측정값의 신뢰도를 검토하는 태도를 보임.",
    careerLink: "환경공학(수질 관리), 토목(하천·도시 배수), 화학공학(수처리) 분야로 연결된다.",
    searchTerms: ["저가 수질 센서 하천 모니터링", "강우 초기 비점오염 탁도", "low-cost water quality sensor river"]
  },
  {
    id: "seismo-isolation",
    title: "면진층 재료에 따른 모형 건물의 진동 감쇠 효과",
    subjects: ["지구과학", "물리", "정보"],
    keywords: ["지진", "진동", "내진", "면진", "건축", "구조", "가속도", "재난", "안전", "지진계"],
    careers: ["건축가", "토목공학자", "구조공학자", "재난안전", "지질학자"],
    majors: ["건축공학과", "토목공학과", "지질학과", "지구시스템과학과", "기계공학과"],
    level: "중급", budget: 40000, duration: "1~2개월",
    summary: "MPU6050 가속도 센서로 간이 지진계를 만들고, 진동대 위 모형 건물 바닥에 고무·스프링·볼베어링 면진층을 넣어 진동 감쇠율을 비교한다.",
    trend: "국내 지진 이후 내진·면진 설계와 저가 MEMS 가속도계 기반 지진 관측망(시민 지진계) 연구가 주목받고 있다.",
    question: "면진층 재료(고무, 스프링, 볼베어링)에 따라 모형 건물 꼭대기의 최대 가속도는 얼마나 줄어드는가?",
    hypothesis: "고유진동수를 낮추는 면진층은 진동대 진동수가 높을수록 감쇠 효과가 클 것이다.",
    variables: { independent: "면진층 재료, 진동 진동수", dependent: "건물 꼭대기 최대 가속도(PGA), 감쇠율", controlled: "모형 건물 질량·높이, 진동 진폭, 센서 위치" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "MPU6050 가속도·자이로 센서 ×2", note: "약 6,000원" },
      { item: "DC 모터 + 편심추(진동대 구동) + 모터 드라이버(L298N)", note: "약 8,000원" },
      { item: "합판, 나무 막대(모형 건물)", note: "약 8,000원" },
      { item: "고무판, 스프링, 쇠구슬", note: "약 6,000원" }
    ],
    circuit: [
      "MPU6050 #1(바닥): SDA→A4, SCL→A5, AD0→GND (주소 0x68)",
      "MPU6050 #2(꼭대기): 같은 버스에 연결, AD0→3.3V (주소 0x69)",
      "L298N: ENA→D9(PWM으로 모터 속도=진동수 조절), IN1→D7, IN2→D8"
    ],
    code: `#include <Adafruit_MPU6050.h>   // 라이브러리: Adafruit MPU6050
Adafruit_MPU6050 base, top;

void setup() {
  Serial.begin(115200);
  base.begin(0x68); top.begin(0x69);
  base.setAccelerometerRange(MPU6050_RANGE_4_G);
  top.setAccelerometerRange(MPU6050_RANGE_4_G);
  pinMode(7, OUTPUT); pinMode(8, OUTPUT);
  digitalWrite(7, HIGH); digitalWrite(8, LOW);
  analogWrite(9, 150);              // 모터 속도(진동수) 조절
  Serial.println("ms,base_ax,top_ax");
}

void loop() {
  sensors_event_t a1, g1, t1, a2, g2, t2;
  base.getEvent(&a1, &g1, &t1);
  top.getEvent(&a2, &g2, &t2);
  Serial.print(millis()); Serial.print(',');
  Serial.print(a1.acceleration.x, 3); Serial.print(',');
  Serial.println(a2.acceleration.x, 3);
  delay(5);                         // 약 200Hz 샘플링
}`,
    protocol: [
      "진동대를 만들고 모터 PWM 값과 실제 진동수(가속도 FFT로 확인)의 관계를 구한다.",
      "면진층 없이 모형 건물을 고정한 상태에서 바닥·꼭대기 가속도를 측정한다(기준).",
      "면진층 재료를 바꿔 같은 조건으로 각 5회 측정한다.",
      "진동수를 3단계로 바꾸어 반복한다.",
      "CSV를 파이썬으로 불러와 최대 가속도와 감쇠율 = 1 − (꼭대기/바닥)을 계산한다."
    ],
    analysis: "조건별 감쇠율 비교, FFT로 주파수 스펙트럼 분석, 진동수-증폭률 그래프로 공진 현상 확인.",
    expected: "면진층이 있으면 고진동수에서 꼭대기 가속도가 크게 감소하나, 공진 진동수 근처에서는 오히려 증폭될 수 있다는 결과가 예상된다.",
    extension: "기상청 지진 자료와 비교해 실제 지진파(저주파) 조건을 재현하거나, 학교 건물에 상시 진동 측정 장치를 설치한다.",
    safety: "회전하는 편심추에 손이 닿지 않도록 덮개를 씌운다.",
    record: "지진 대비 건축 기술에 관심을 갖고 MEMS 가속도 센서 두 개로 간이 지진계를 제작, 면진층 재료에 따른 진동 감쇠율을 측정함. 고속푸리에변환으로 공진 진동수를 찾아내고 면진 설계가 특정 진동수에서는 역효과를 낼 수 있음을 발견하여 구조 설계의 조건 의존성을 논리적으로 설명함.",
    careerLink: "건축·토목(내진 설계), 지구과학(지진학), 기계공학(진동 제어)으로 연결된다.",
    searchTerms: ["면진 구조 모형 실험", "MEMS 가속도계 지진계", "low-cost seismometer MPU6050"]
  },
  {
    id: "hrv-stress",
    title: "느린 호흡이 심박변이도(HRV)에 미치는 영향",
    subjects: ["생명과학", "정보", "물리"],
    keywords: ["심박", "심장", "스트레스", "건강", "의료", "HRV", "호흡", "자율신경", "웨어러블", "생체신호", "헬스케어"],
    careers: ["의사", "간호사", "의공학자", "물리치료사", "헬스케어", "약사", "보건"],
    majors: ["의예과", "간호학과", "의공학과", "바이오메디컬공학과", "물리치료학과", "약학과"],
    level: "심화", budget: 25000, duration: "1~2개월",
    summary: "아두이노 PPG 맥박 센서로 맥파를 기록하고, 복식호흡·박스호흡 전후의 심박변이도(RMSSD)를 계산해 자율신경계 반응을 분석한다.",
    trend: "스마트워치 등 웨어러블 기기의 PPG 기반 HRV 측정 정확도와 스트레스 지표 활용이 활발히 연구되고 있다.",
    question: "천천히 호흡하기(분당 6회)는 평상시 호흡에 비해 HRV(RMSSD)를 증가시키는가?",
    hypothesis: "느린 호흡은 부교감신경 활성을 높여 RMSSD를 증가시킬 것이다.",
    variables: { independent: "호흡 방법(자유 호흡, 분당 6회 호흡)", dependent: "평균 심박수, RMSSD", controlled: "측정 자세, 시간대, 측정 전 휴식 시간, 카페인 섭취 여부" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "PPG 맥박 센서(Pulse Sensor 호환)", note: "약 5,000원" },
      { item: "손가락 고정용 벨크로/집게", note: "약 1,000원" },
      { item: "PC(파이썬, 신호 처리)", note: "학교 보유" }
    ],
    circuit: ["맥박 센서: +→5V, −→GND, S→A0"],
    code: `// 500Hz로 PPG 원신호를 기록 → 파이썬에서 피크 검출 후 RR 간격 계산
unsigned long last = 0;
void setup() { Serial.begin(115200); }
void loop() {
  unsigned long now = micros();
  if (now - last >= 2000) {     // 2ms = 500Hz
    last = now;
    Serial.print(millis()); Serial.print(',');
    Serial.println(analogRead(A0));
  }
}`,
    protocol: [
      "참여자(본인 또는 동의한 친구)에게 연구 목적·방법을 설명하고 서면 동의를 받는다. 이름 대신 번호로 기록한다.",
      "5분 앉아서 휴식 후 자유 호흡 상태로 5분 측정한다.",
      "호흡 안내 화면(4초 들숨, 6초 날숨)에 맞춰 5분 측정한다.",
      "다른 날 순서를 바꾸어 반복해 순서 효과를 줄인다.",
      "파이썬(scipy.signal.find_peaks)으로 맥파 피크를 찾고 RR 간격, 심박수, RMSSD를 계산한다.",
      "가능하면 스마트워치 측정값과 비교해 센서 정확도를 확인한다."
    ],
    analysis: "RMSSD = √(평균((RRᵢ₊₁ − RRᵢ)²)). 조건 간 대응표본 t-검정, 피크 검출 알고리즘의 오류율 점검.",
    expected: "느린 호흡 시 RR 간격이 호흡에 맞춰 크게 출렁이는 호흡성 동성부정맥이 관찰되고 RMSSD가 증가할 것으로 예상된다. 움직임 잡음 처리가 결과의 신뢰도를 좌우한다.",
    extension: "필터(밴드패스)와 피크 검출 알고리즘을 개선해 움직임 잡음에 강한 HRV 측정 방법을 제안한다.",
    safety: "의료적 진단 목적이 아님을 명시한다. 어지러움을 느끼면 즉시 중단한다. 개인정보를 수집하지 않는다.",
    record: "웨어러블 헬스케어 기기의 원리에 관심을 갖고 PPG 센서 신호를 직접 수집하여 호흡법에 따른 심박변이도를 분석함. 피크 검출 알고리즘을 파이썬으로 구현하고 잡음 구간을 처리하는 과정에서 생체신호 처리의 어려움을 체감하였으며, 참여자 동의와 개인정보 보호 등 연구 윤리를 준수함.",
    careerLink: "의학·간호(자율신경계 생리), 의공학(생체신호 처리), 헬스케어 데이터 분야로 연결된다.",
    searchTerms: ["PPG 심박변이도 호흡", "slow breathing HRV RMSSD", "아두이노 맥박센서 HRV"]
  },
  {
    id: "heat-island",
    title: "지표면 재질에 따른 표면 온도 차이와 쿨루프 도료의 냉각 효과",
    subjects: ["지구과학", "물리", "정보"],
    keywords: ["열섬", "기후변화", "온도", "도시", "폭염", "쿨루프", "복사", "알베도", "기후", "환경"],
    careers: ["기후과학자", "도시계획가", "건축가", "환경", "기상"],
    majors: ["대기과학과", "도시공학과", "건축학과", "환경공학과", "지리학과"],
    level: "기초", budget: 30000, duration: "1~2개월",
    summary: "적외선 온도 센서와 온습도 센서로 잔디·흙·아스팔트·인조잔디 및 흰색 도료 표면의 온도를 하루 동안 측정해 미세 열섬을 비교한다.",
    trend: "폭염 증가로 쿨루프·쿨페이브먼트, 도시 녹지의 냉각 효과에 대한 연구와 지자체 정책 뉴스가 많다.",
    question: "지표면 재질에 따라 한낮 표면 온도와 지면 위 1.5m 기온은 얼마나 차이 나는가?",
    hypothesis: "알베도가 낮고 증발이 없는 아스팔트·인조잔디의 표면 온도가 가장 높고, 흰색 도료와 잔디가 가장 낮을 것이다.",
    variables: { independent: "지표면 재질, 시간대", dependent: "표면 온도, 지상 기온, 습도", controlled: "측정 높이, 그늘 여부, 측정 날짜(맑은 날)" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "MLX90614 비접촉 적외선 온도 센서", note: "약 12,000원" },
      { item: "DHT22 온습도 센서", note: "약 4,000원" },
      { item: "보조배터리, 측정용 삼각대(지지대)", note: "보유 장비" },
      { item: "흰색·검은색 도료를 칠한 합판", note: "약 6,000원" }
    ],
    circuit: ["MLX90614: SDA→A4, SCL→A5, VIN→5V(모듈형)", "DHT22 DATA→D7"],
    code: `#include <Adafruit_MLX90614.h>   // 라이브러리: Adafruit MLX90614
#include <DHT.h>
Adafruit_MLX90614 mlx;
DHT dht(7, DHT22);

void setup() { Serial.begin(9600); mlx.begin(); dht.begin(); Serial.println("ms,surface,ambient,air,hum"); }

void loop() {
  Serial.print(millis()); Serial.print(',');
  Serial.print(mlx.readObjectTempC()); Serial.print(',');
  Serial.print(mlx.readAmbientTempC()); Serial.print(',');
  Serial.print(dht.readTemperature()); Serial.print(',');
  Serial.println(dht.readHumidity());
  delay(10000);
}`,
    protocol: [
      "교내 재질별 측정 지점 5곳 이상을 선정해 지도에 표시한다.",
      "맑은 날 09시~18시 매 1시간마다 같은 순서로 표면 온도와 1.5m 기온을 측정한다.",
      "흰색/검은색 도료 합판을 같은 장소에 놓고 표면 온도를 비교한다.",
      "기상청 일사량·기온 자료를 함께 기록한다.",
      "최소 3일 반복한다."
    ],
    analysis: "시간대별 재질 온도 그래프, 최고 온도 차이, 일사량과 표면 온도 상관관계를 분석한다.",
    expected: "한낮 아스팔트·인조잔디는 잔디보다 표면 온도가 크게 높고, 흰색 도료는 검은색보다 뚜렷이 낮게 측정될 것이다. 기온(1.5m) 차이는 표면 온도 차이보다 작게 나타날 것이다.",
    extension: "드론·열화상 카메라 공공자료와 비교하거나, 학교 옥상 쿨루프 도입 시 냉방 에너지 절감량을 추정한다.",
    safety: "한낮 측정 시 열사병 주의, 수분 섭취. 옥상 측정은 교사 동행.",
    record: "폭염과 도시 열섬 문제에 관심을 갖고 적외선 온도 센서로 교내 지표면 재질별 온도를 시간대별로 측정함. 알베도와 증발 냉각 개념으로 재질 간 온도 차이를 설명하고, 쿨루프 도료의 효과를 정량화하여 학교 환경 개선 방안을 제안함.",
    careerLink: "도시공학·건축(열섬 완화 설계), 대기과학(기후변화 적응) 분야와 연결된다.",
    searchTerms: ["쿨루프 표면온도 저감", "도시 열섬 지표면 재질", "urban heat island surface temperature material"]
  },
  {
    id: "diy-spectro",
    title: "비어-람베르트 법칙을 이용한 음료 속 식용 색소의 정량 분석",
    subjects: ["화학", "물리", "정보"],
    keywords: ["분광", "흡광도", "농도", "색소", "식품", "비어-람베르트", "빛", "분석화학", "약학", "화학 분석"],
    careers: ["약사", "화학자", "식품연구원", "분석화학", "제약"],
    majors: ["약학과", "화학과", "식품공학과", "화학공학과", "제약공학과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "특정 색 LED와 광센서로 간이 분광광도계를 만들고, 비어-람베르트 법칙으로 표준 용액의 검량선을 그려 시판 음료의 색소 농도를 추정한다.",
    trend: "저비용 오픈소스 분광광도계와 스마트폰 기반 현장 분석 기기가 교육·개발도상국 의료 분야에서 연구되고 있다.",
    question: "직접 만든 간이 분광광도계로 측정한 흡광도는 색소 농도에 비례하는가(비어-람베르트 법칙을 만족하는가)?",
    hypothesis: "색소의 보색에 해당하는 LED를 사용하면 저농도 구간에서 흡광도와 농도가 직선 관계를 보일 것이다.",
    variables: { independent: "색소 농도, LED 색", dependent: "투과광 세기 → 흡광도 A = −log(I/I₀)", controlled: "큐벳 위치, 광경로 길이, 주변광 차단, 온도" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "RGB LED 또는 단색 LED(적·녹·청)", note: "약 1,000원" },
      { item: "BH1750 조도 센서 또는 TSL2591", note: "약 3,000~10,000원" },
      { item: "플라스틱 큐벳, 검은 상자(3D 프린팅/우드락)", note: "약 5,000원" },
      { item: "식용 색소(청색1호 등), 피펫, 메스실린더", note: "약 5,000원" }
    ],
    circuit: ["LED: D9(PWM) → 220Ω → LED → GND", "BH1750: SDA→A4, SCL→A5"],
    code: `#include <Wire.h>
#include <BH1750.h>     // 라이브러리: BH1750 (Christopher Laws)
BH1750 meter;
float I0 = 0;

float readAvg() {
  float s = 0;
  for (int i = 0; i < 20; i++) { s += meter.readLightLevel(); delay(120); }
  return s / 20;
}

void setup() {
  Serial.begin(9600); Wire.begin(); meter.begin();
  analogWrite(9, 200);
  Serial.println("증류수 큐벳을 넣고 아무 키나 입력하세요");
  while (!Serial.available()); Serial.read();
  I0 = readAvg();
  Serial.print("I0="); Serial.println(I0);
}

void loop() {
  Serial.println("시료 큐벳을 넣고 아무 키나 입력하세요");
  while (!Serial.available()); Serial.read();
  float I = readAvg();
  float A = -log10(I / I0);
  Serial.print("I="); Serial.print(I); Serial.print(", A="); Serial.println(A, 4);
}`,
    protocol: [
      "빛이 새지 않는 측정 상자에 LED-큐벳-센서를 일직선으로 고정한다.",
      "색소 표준 용액을 5단계 이상 농도로 만든다(연속 희석).",
      "증류수로 I₀를 측정한 뒤 각 표준 용액의 흡광도를 3회씩 측정한다.",
      "LED 색을 바꿔 가장 감도가 좋은(기울기가 큰) 색을 찾는다.",
      "시판 음료를 희석해 흡광도를 측정하고 검량선으로 농도를 추정한다.",
      "가능하면 학교 분광광도계 또는 대학 실험실 결과와 비교한다."
    ],
    analysis: "농도-흡광도 선형회귀, 결정계수(R²), 검출 한계와 선형 범위 산출, 오차 원인 분석.",
    expected: "보색 LED에서 저농도 구간은 직선성이 좋고(R²>0.95), 고농도에서는 미광·센서 포화로 직선에서 벗어날 것으로 예상된다.",
    extension: "RGB 센서(TCS34725)로 다파장 측정을 하거나, 비타민 C·철 이온 정량 등 다른 정량 분석에 적용한다.",
    safety: "색소·시약을 맛보지 않는다. 보안경 착용.",
    record: "분석화학의 기본 원리인 비어-람베르트 법칙을 검증하기 위해 LED와 광센서로 간이 분광광도계를 설계·제작함. 보색 관계를 이용해 최적 광원을 선택하고 검량선의 선형 범위와 검출 한계를 산출하였으며, 고농도에서 직선성이 깨지는 원인을 미광과 센서 포화로 설명하는 등 깊이 있는 탐구 역량을 보임.",
    careerLink: "약학·화학(정량 분석), 식품공학(첨가물 분석), 진단기기 개발로 연결된다.",
    searchTerms: ["아두이노 분광광도계", "DIY spectrophotometer Arduino Beer-Lambert", "식용색소 흡광도 정량"]
  },
  {
    id: "yeast-co2",
    title: "당의 종류와 온도에 따른 효모의 알코올 발효 속도",
    subjects: ["생명과학", "화학", "정보"],
    keywords: ["효모", "발효", "세포호흡", "CO2", "효소", "미생물", "바이오", "당", "식품", "바이오에탄올"],
    careers: ["생명공학자", "식품연구원", "미생물학자", "바이오에너지", "제약"],
    majors: ["생명공학과", "식품공학과", "미생물학과", "생명과학과", "화학생물공학과"],
    level: "기초", budget: 35000, duration: "4주 이내",
    summary: "밀폐 용기 안 효모 용액에서 발생하는 CO₂ 농도를 NDIR 센서로 실시간 기록하여, 당 종류(포도당·설탕·젖당)와 온도에 따른 발효 속도를 비교한다.",
    trend: "바이오에탄올 생산 효율, 효모 균주와 기질 최적화가 지속적으로 연구되며, 실시간 센서 기반 발효 모니터링이 산업에서 쓰인다.",
    question: "당의 종류와 온도에 따라 효모의 CO₂ 발생 속도는 어떻게 달라지는가?",
    hypothesis: "효모는 단당류인 포도당을 가장 빨리 이용하고, 젖당은 거의 발효하지 못할 것이다. 발효 속도는 약 35℃ 근처에서 최대일 것이다.",
    variables: { independent: "당의 종류, 온도", dependent: "CO₂ 증가 속도(ppm/min)", controlled: "효모량, 당 농도, 용액 부피, 용기 부피" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "MH-Z19B CO₂ 센서(측정범위 5000ppm 이상)", note: "약 15,000원" },
      { item: "밀폐 용기(지퍼락 통) + 실리콘", note: "약 3,000원" },
      { item: "건조 효모, 포도당·설탕·젖당", note: "약 6,000원" },
      { item: "온도 조절용 수조(보온병/수조+온도계)", note: "학교 보유" }
    ],
    circuit: ["MH-Z19B: Vin→5V, GND→GND, TX→D10, RX→D11"],
    code: `#include <SoftwareSerial.h>
#include <MHZ19.h>          // 라이브러리: MH-Z19 (WifWaf)
SoftwareSerial co2Serial(10, 11);
MHZ19 mhz;

void setup() {
  Serial.begin(9600);
  co2Serial.begin(9600);
  mhz.begin(co2Serial);
  mhz.autoCalibration(false);   // 밀폐 실험에서는 자동보정 끄기
  Serial.println("ms,CO2ppm");
}

void loop() {
  Serial.print(millis()); Serial.print(',');
  Serial.println(mhz.getCO2());
  delay(5000);
}`,
    protocol: [
      "센서를 3분 이상 예열하고, 바깥 공기에서 약 420ppm 근처가 나오는지 확인한다.",
      "같은 농도(예: 5%)의 당 용액에 효모 1g을 넣어 밀폐 용기에 넣는다.",
      "용기를 정해진 온도의 수조에 두고 20분간 5초 간격으로 기록한다.",
      "당 종류 3가지 × 온도 4단계(20·30·35·45℃) × 3회 반복한다.",
      "매 실험 후 용기를 환기해 초기 농도를 맞춘다."
    ],
    analysis: "CO₂-시간 그래프의 선형 구간 기울기를 발효 속도로 정의해 조건별로 비교한다. 온도-속도 그래프로 최적 온도를 찾는다.",
    expected: "포도당 ≥ 설탕 ≫ 젖당 순으로 발효 속도가 나타나고, 35℃ 부근에서 최대였다가 고온에서 효소 변성으로 감소할 것으로 예상된다. 센서 측정 한계(최대 농도) 도달 여부를 확인해야 한다.",
    extension: "pH, 소금 농도, 카페인 등 억제 요인을 추가하거나 바이오에탄올 수율과 연결한다.",
    safety: "밀폐 용기 압력 상승에 주의(너무 큰 효모량 금지). 뜨거운 물 취급 주의.",
    record: "효모의 기질 특이성과 효소 활성에 관심을 갖고 NDIR CO₂ 센서로 발효 과정을 실시간 측정하는 장치를 구성함. 기울기로 발효 속도를 정량화하고 온도에 따른 효소 변성을 근거로 결과를 해석하였으며, 센서 자동보정 기능이 실험에 미치는 영향까지 고려하는 꼼꼼함을 보임.",
    careerLink: "생명공학·식품공학(발효 공정), 바이오에너지 분야로 연결된다.",
    searchTerms: ["효모 발효 CO2 센서", "yeast fermentation sugar type temperature CO2 sensor", "바이오에탄올 효모 당"]
  },
  {
    id: "posture-ml",
    title: "목 기울기 데이터를 이용한 거북목 자세의 기계학습 분류",
    subjects: ["정보", "물리", "생명과학"],
    keywords: ["인공지능", "머신러닝", "AI", "데이터", "자세", "거북목", "웨어러블", "헬스케어", "분류", "센서", "코딩", "소프트웨어"],
    careers: ["데이터 과학자", "AI 개발자", "소프트웨어 개발자", "의공학자", "물리치료사", "프로그래머"],
    majors: ["컴퓨터공학과", "인공지능학과", "소프트웨어학과", "데이터사이언스학과", "의공학과", "물리치료학과"],
    level: "심화", budget: 20000, duration: "1~2개월",
    summary: "목 뒤에 부착한 MPU6050의 기울기 데이터를 수집해 바른 자세/거북목/엎드림 자세를 분류하는 머신러닝 모델을 만들고 정확도를 비교한다.",
    trend: "센서 데이터 기반 인간 행동 인식(HAR)과 초소형 기기용 머신러닝(TinyML)이 활발하게 연구되며, 청소년 거북목 증가가 건강 이슈로 보도된다.",
    question: "목 부위 가속도·자이로 데이터만으로 자세를 얼마나 정확히 분류할 수 있으며, 어떤 특징(feature)이 분류에 가장 중요한가?",
    hypothesis: "목의 앞쪽 기울기 각도(pitch)의 평균과 분산만으로도 90% 이상 분류할 수 있을 것이다.",
    variables: { independent: "분류 알고리즘(결정트리, k-NN, 랜덤포레스트), 사용 특징, 창(window) 크기", dependent: "정확도, 정밀도, 재현율", controlled: "센서 부착 위치, 샘플링 주기, 데이터 개수" },
    materials: [
      { item: "아두이노 우노 또는 나노", note: "약 8,000원" },
      { item: "MPU6050", note: "약 3,000원" },
      { item: "긴 점퍼선, 밴드/의료용 테이프", note: "약 2,000원" },
      { item: "PC(파이썬 scikit-learn)", note: "무료" }
    ],
    circuit: ["MPU6050: VCC→5V, GND→GND, SDA→A4, SCL→A5"],
    code: `#include <Adafruit_MPU6050.h>
Adafruit_MPU6050 mpu;
// 시리얼 모니터에서 0(바른), 1(거북목), 2(엎드림) 입력으로 라벨 변경
int label = 0;

void setup() {
  Serial.begin(115200);
  mpu.begin();
  Serial.println("ms,ax,ay,az,gx,gy,gz,label");
}

void loop() {
  if (Serial.available()) { char c = Serial.read(); if (c >= '0' && c <= '2') label = c - '0'; }
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);
  Serial.print(millis()); Serial.print(',');
  Serial.print(a.acceleration.x); Serial.print(','); Serial.print(a.acceleration.y); Serial.print(',');
  Serial.print(a.acceleration.z); Serial.print(','); Serial.print(g.gyro.x); Serial.print(',');
  Serial.print(g.gyro.y); Serial.print(','); Serial.print(g.gyro.z); Serial.print(',');
  Serial.println(label);
  delay(20);   // 50Hz
}`,
    protocol: [
      "자세별로 라벨을 붙여 데이터를 수집한다(자세당 최소 5분, 참여자 3명 이상 — 동의 필수).",
      "2초 창(window)으로 데이터를 자르고 평균·표준편차·pitch/roll 각도 등의 특징을 계산한다.",
      "학습 70% / 검증 30%로 나누되, 참여자 단위로 나누어 과적합을 점검한다.",
      "결정트리·k-NN·랜덤포레스트의 정확도와 혼동행렬을 비교한다.",
      "특징 중요도를 분석하고, 가장 단순한 규칙(임계각)을 아두이노에 넣어 진동 알림 장치로 구현한다."
    ],
    analysis: "정확도, 혼동행렬, 특징 중요도, 참여자 간 교차검증(leave-one-subject-out) 결과 비교.",
    expected: "pitch 각도 특징만으로 바른 자세와 엎드림은 잘 구분되지만, 거북목과 바른 자세는 개인차로 혼동될 수 있다. 개인 보정(캘리브레이션)을 하면 정확도가 높아질 것이다.",
    extension: "Arduino Nano 33 BLE Sense 등에서 TinyML로 기기 내 추론을 구현하거나 스마트폰 알림 앱과 연동한다.",
    safety: "참여자 동의, 개인정보 미수집. 장시간 부착 시 피부 자극 주의.",
    record: "청소년 거북목 문제를 데이터로 해결하고자 착용형 가속도 센서로 자세 데이터를 수집하고 머신러닝 분류 모델을 비교함. 참여자 단위 교차검증으로 과적합 문제를 확인하고 특징 중요도 분석을 통해 단순 규칙 기반 알림 장치를 구현하는 등 데이터 기반 문제 해결 역량을 보임.",
    careerLink: "인공지능·데이터과학(센서 데이터 분류), 의공학·재활(자세 교정 기기)로 연결된다.",
    searchTerms: ["가속도 센서 자세 분류 머신러닝", "human activity recognition IMU posture", "TinyML posture detection"]
  },
  {
    id: "pv-cooling",
    title: "태양전지의 표면 온도와 냉각 방식에 따른 발전 효율 변화",
    subjects: ["물리", "지구과학", "정보"],
    keywords: ["태양광", "태양전지", "신재생에너지", "에너지", "효율", "온도", "탄소중립", "반도체", "전력"],
    careers: ["에너지공학자", "전기전자공학자", "반도체", "신재생에너지", "환경"],
    majors: ["에너지공학과", "전기공학과", "신소재공학과", "반도체공학과", "기계공학과"],
    level: "중급", budget: 35000, duration: "1~2개월",
    summary: "소형 태양광 패널의 출력 전력을 INA219로, 표면 온도를 DS18B20으로 동시에 측정해 온도 상승에 따른 효율 저하와 수냉·공랭 효과를 분석한다.",
    trend: "태양전지의 고온 효율 저하를 줄이는 냉각 기술(PV/T, 수동 냉각)과 영농형 태양광이 활발히 연구·보도되고 있다.",
    question: "태양광 패널 온도가 1℃ 오를 때 출력은 몇 % 감소하며, 간단한 냉각으로 얼마나 회복할 수 있는가?",
    hypothesis: "패널 온도가 오를수록 개방 전압이 낮아져 출력이 감소하고, 냉각 시 출력이 회복될 것이다.",
    variables: { independent: "패널 온도, 냉각 방식(없음·팬·물 분무·방열판)", dependent: "최대 출력 전력, 온도 계수(%/℃)", controlled: "일사량(같은 시간대·조도 측정), 패널 각도, 부하 저항" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "소형 태양광 패널(6V 1~2W) ×2", note: "약 8,000원" },
      { item: "INA219 전류·전압 센서", note: "약 5,000원" },
      { item: "DS18B20 온도 센서", note: "약 3,000원" },
      { item: "가변저항 또는 저항 세트(부하)", note: "약 2,000원" },
      { item: "BH1750 조도 센서, 소형 팬", note: "약 5,000원" }
    ],
    circuit: ["패널(+) → INA219 VIN+ → VIN− → 부하 저항 → 패널(−)", "INA219·BH1750: SDA→A4, SCL→A5", "DS18B20: DATA→D2(4.7kΩ 풀업), 패널 뒷면에 열전도 테이프로 부착"],
    code: `#include <Wire.h>
#include <Adafruit_INA219.h>     // 라이브러리: Adafruit INA219
#include <OneWire.h>
#include <DallasTemperature.h>
Adafruit_INA219 ina;
OneWire ow(2);
DallasTemperature ds(&ow);

void setup() { Serial.begin(9600); ina.begin(); ds.begin(); Serial.println("ms,temp,V,mA,mW"); }

void loop() {
  ds.requestTemperatures();
  Serial.print(millis()); Serial.print(',');
  Serial.print(ds.getTempCByIndex(0)); Serial.print(',');
  Serial.print(ina.getBusVoltage_V()); Serial.print(',');
  Serial.print(ina.getCurrent_mA()); Serial.print(',');
  Serial.println(ina.getPower_mW());
  delay(5000);
}`,
    protocol: [
      "부하 저항을 바꾸며 전류-전압(I-V) 곡선을 그려 최대 출력점의 부하를 찾는다.",
      "같은 패널 2개를 나란히 두고 하나는 기준, 하나는 냉각 처리한다.",
      "맑은 날 정오 전후 1시간 동안 온도·출력·조도를 5초 간격으로 기록한다.",
      "냉각 방식을 바꿔 각 3일 이상 반복한다.",
      "조도로 출력을 정규화하여 일사량 변화의 영향을 제거한다."
    ],
    analysis: "정규화 출력-온도 산점도의 회귀 기울기로 온도 계수(%/℃)를 구하고 냉각 방식별 출력 증가율을 비교한다.",
    expected: "실리콘 태양전지의 출력은 온도가 오를수록 감소하는 음의 온도 계수를 보이고, 물 분무 냉각이 가장 큰 출력 회복을 보일 것으로 예상된다(단, 물 사용량 고려 필요).",
    extension: "냉각에 쓰인 팬 전력까지 고려한 순이득을 계산하거나 영농형 태양광(그늘 아래 작물 생장)과 연계한다.",
    safety: "한낮 실외 측정 시 열사병 주의. 물과 회로를 분리한다.",
    record: "태양전지의 고온 효율 저하 문제에 주목하여 출력 전력과 패널 온도를 동시에 측정하는 장치를 제작함. I-V 곡선으로 최대 출력점을 찾고 조도로 출력을 정규화해 온도 계수를 산출하였으며, 냉각에 드는 에너지까지 고려한 순이득을 분석하는 등 공학적 사고를 보임.",
    careerLink: "에너지공학·신소재(태양전지), 전기공학(전력 변환)으로 연결된다.",
    searchTerms: ["태양광 패널 온도 효율 냉각", "photovoltaic temperature coefficient cooling", "영농형 태양광"]
  },
  {
    id: "al-air-battery",
    title: "전해질 농도와 탄소 전극 재료에 따른 알루미늄-공기 전지의 성능",
    subjects: ["화학", "물리", "정보"],
    keywords: ["전지", "배터리", "이차전지", "전기화학", "산화환원", "금속-공기 전지", "에너지 저장", "신소재", "전해질"],
    careers: ["배터리 연구원", "화학공학자", "신소재공학자", "에너지", "화학자"],
    majors: ["화학공학과", "신소재공학과", "화학과", "에너지공학과", "재료공학과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "알루미늄 호일, 소금물 전해질, 활성탄을 이용한 알루미늄-공기 전지를 만들고 전해질 농도와 탄소 재료(활성탄·흑연·숯)에 따른 전압·전류·용량을 INA219로 측정한다.",
    trend: "리튬 이온 전지를 대체할 고에너지 밀도 금속-공기 전지와 친환경 전해질 연구가 활발하며, 이차전지 산업 관련 뉴스가 많다.",
    question: "전해질(NaCl) 농도와 양극 탄소 재료는 알루미늄-공기 전지의 출력과 방전 지속 시간에 어떤 영향을 주는가?",
    hypothesis: "전해질 농도가 높을수록 내부 저항이 줄어 전류가 증가하고, 비표면적이 큰 활성탄이 가장 큰 출력을 낼 것이다.",
    variables: { independent: "전해질 농도, 탄소 재료", dependent: "개방 전압, 부하 전류, 방전 용량(mAh)", controlled: "전극 면적, 알루미늄 두께, 부하 저항, 온도" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "INA219 전류·전압 센서", note: "약 5,000원" },
      { item: "알루미늄 호일, 키친타월(분리막)", note: "약 2,000원" },
      { item: "활성탄 분말, 흑연(연필심 가루), 숯", note: "약 6,000원" },
      { item: "소금, 증류수, 전자저울", note: "학교 보유" },
      { item: "부하 저항(100Ω) 또는 LED", note: "약 500원" }
    ],
    circuit: ["전지(+, 탄소 쪽) → INA219 VIN+ → VIN− → 100Ω 부하 → 전지(−, 알루미늄)", "INA219: SDA→A4, SCL→A5"],
    code: `#include <Adafruit_INA219.h>
Adafruit_INA219 ina;
float mAh = 0;
unsigned long last;

void setup() { Serial.begin(9600); ina.begin(); last = millis(); Serial.println("s,V,mA,mAh"); }

void loop() {
  float mA = ina.getCurrent_mA();
  unsigned long now = millis();
  mAh += mA * (now - last) / 3600000.0;   // 전류 적분 → 용량
  last = now;
  Serial.print(now / 1000); Serial.print(',');
  Serial.print(ina.getBusVoltage_V(), 3); Serial.print(',');
  Serial.print(mA, 2); Serial.print(',');
  Serial.println(mAh, 4);
  delay(1000);
}`,
    protocol: [
      "알루미늄 호일 위에 소금물 적신 키친타월, 그 위에 탄소 반죽(탄소+소금물)을 올리고 집전체로 누른다.",
      "같은 면적(예: 5×5cm)으로 전지를 만들어 개방 전압을 측정한다.",
      "100Ω 부하를 연결해 전압이 0.3V 이하가 될 때까지 방전시키며 기록한다.",
      "전해질 농도(5·10·15·20%)와 탄소 재료 3종을 바꾸어 각 3회 반복한다.",
      "방전 후 알루미늄 호일의 부식 상태를 관찰·촬영한다."
    ],
    analysis: "방전 곡선 비교, 방전 용량과 평균 전력 계산, 농도-전류 그래프로 내부 저항 변화 추정.",
    expected: "전해질 농도가 증가하면 전류가 증가하다 포화되고, 활성탄이 가장 큰 용량을 보일 것으로 예상된다. 알루미늄 표면 산화막(부동태)이 방전을 제한하는 요인으로 나타날 수 있다.",
    extension: "전해질에 NaOH(교사 지도) 또는 첨가제를 넣어 부동태 억제 효과를 비교하거나, 직렬 연결로 실제 기기를 구동한다.",
    safety: "보안경·장갑 착용. 강염기 사용 시 반드시 교사 지도. 수소 기체 발생 가능 — 환기.",
    record: "차세대 이차전지에 관심을 갖고 알루미늄-공기 전지를 직접 제작하여 전해질 농도와 탄소 재료에 따른 성능을 비교함. 전류를 시간 적분해 방전 용량을 계산하는 코드를 작성하였고, 산화 환원 반응과 부동태 형성 개념으로 방전 곡선의 변화를 설명함.",
    careerLink: "화학공학·신소재(전지 재료), 에너지 저장 시스템 분야로 연결된다.",
    searchTerms: ["알루미늄 공기 전지 활성탄 소금물", "aluminum air battery activated carbon electrolyte", "금속 공기 전지 연구 동향"]
  },
  {
    id: "ultrasonic-cane",
    title: "기온에 따른 음속 변화와 초음파 거리 측정의 오차 보정",
    subjects: ["물리", "정보"],
    keywords: ["초음파", "음속", "소리", "파동", "보조공학", "장애", "로봇", "거리센서", "자율주행", "공학", "임베디드"],
    careers: ["재활공학자", "로봇공학자", "전자공학자", "자율주행", "소프트웨어 개발자", "사회복지"],
    majors: ["기계공학과", "로봇공학과", "전자공학과", "재활공학과", "컴퓨터공학과"],
    level: "기초", budget: 25000, duration: "4주 이내",
    summary: "기온에 따라 음속이 변하는 원리를 측정하고, 온도 보정 알고리즘을 적용한 초음파 장애물 감지 지팡이의 거리 오차를 비교한다.",
    trend: "저가 센서 기반 보조공학 기기와 자율주행 로봇의 센서 융합(초음파·라이다) 연구가 활발하다.",
    question: "기온 변화는 초음파 거리 측정 오차를 얼마나 만들며, 온도 보정으로 얼마나 줄일 수 있는가?",
    hypothesis: "음속 v ≈ 331.3 + 0.606T (m/s)를 적용하면 저온·고온에서 거리 오차가 크게 줄어들 것이다.",
    variables: { independent: "기온, 보정 적용 여부, 장애물 재질·각도", dependent: "측정 거리 오차", controlled: "실제 거리, 센서 높이" },
    materials: [
      { item: "아두이노 우노 또는 나노", note: "약 8,000원" },
      { item: "HC-SR04 초음파 센서", note: "약 2,000원" },
      { item: "DHT22 온습도 센서", note: "약 4,000원" },
      { item: "진동 모터, 부저", note: "약 2,000원" },
      { item: "줄자, 지팡이(PVC 파이프)", note: "약 5,000원" }
    ],
    circuit: ["HC-SR04: TRIG→D9, ECHO→D10", "DHT22 DATA→D7", "진동 모터 → 트랜지스터(2N2222) → D5"],
    code: `#include <DHT.h>
DHT dht(7, DHT22);
const int TRIG = 9, ECHO = 10, VIB = 5;

void setup() { Serial.begin(9600); dht.begin(); pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT); pinMode(VIB, OUTPUT);
  Serial.println("T,dist_fixed343,dist_corrected"); }

void loop() {
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  long us = pulseIn(ECHO, HIGH, 30000);
  float T = dht.readTemperature();
  float v = 331.3 + 0.606 * T;                // 온도 보정 음속(m/s)
  float dFixed = us * 0.0343 / 2;             // 343m/s 고정(cm)
  float dCorr  = us * (v / 10000.0) / 2;      // 보정(cm)
  Serial.print(T); Serial.print(','); Serial.print(dFixed); Serial.print(','); Serial.println(dCorr);
  analogWrite(VIB, dCorr < 100 ? map(dCorr, 0, 100, 255, 60) : 0);   // 가까울수록 강한 진동
  delay(200);
}`,
    protocol: [
      "실제 거리 50·100·150·200cm 지점에 판을 세운다.",
      "냉장고 근처·실온·햇빛 아래 등 기온이 다른 환경에서 각 거리를 20회 측정한다.",
      "고정 음속과 보정 음속의 오차를 비교한다.",
      "장애물 재질(나무판, 천, 사람)과 각도(0·30·60°)에 따른 감지 실패율을 측정한다.",
      "지팡이를 제작해 실제 복도 장애물 감지 테스트를 한다."
    ],
    analysis: "기온-오차 그래프, 보정 전후 평균 절대 오차 비교, 재질·각도별 감지율 표.",
    expected: "기온 차가 클수록 고정 음속 측정의 오차가 커지고, 보정 후 오차가 감소할 것이다. 천처럼 소리를 흡수하는 물체와 기울어진 면은 감지가 잘 되지 않을 것이다.",
    extension: "적외선·ToF(VL53L0X) 센서와 결합한 센서 융합으로 감지 실패율을 줄인다.",
    safety: "실제 사용 테스트 시 보행 공간 안전 확보. 시각장애 체험은 안대 착용 시 보조자 동행.",
    record: "음속의 온도 의존성을 이용해 초음파 거리 센서의 오차를 줄이는 알고리즘을 설계하고 시각장애인 보조 지팡이에 적용함. 장애물 재질과 각도에 따른 감지 한계를 실험으로 확인하고 센서 융합을 개선 방향으로 제시하는 등 과학 원리를 사회적 약자를 위한 기술로 연결함.",
    careerLink: "재활공학·로봇공학(센서 기반 보조기기), 자율주행 센서 분야로 연결된다.",
    searchTerms: ["초음파 센서 온도 보정", "시각장애인 스마트 지팡이 초음파", "ultrasonic sensor temperature compensation"]
  },
  {
    id: "uv-block",
    title: "자외선 차단제의 도포량과 햇빛 노출 시간에 따른 자외선 차단율 변화",
    subjects: ["화학", "물리", "지구과학"],
    keywords: ["자외선", "UV", "자외선 차단제", "화장품", "피부", "빛", "오존", "직물", "섬유"],
    careers: ["화장품 연구원", "피부과 의사", "화학자", "섬유공학자", "약사"],
    majors: ["화장품학과", "화학과", "의류학과", "화학공학과", "약학과", "의예과"],
    level: "기초", budget: 25000, duration: "4주 이내",
    summary: "자외선 센서로 햇빛 아래에서 자외선 차단제(SPF 별)를 바른 투명 필름, 다양한 색·재질의 천, 유리창의 자외선 투과율을 측정한다.",
    trend: "자외선 차단 성분(유기·무기 필터)의 광안정성과 환경 영향(산호초 등), 기능성 섬유의 UPF 평가가 연구·보도되고 있다.",
    question: "자외선 차단제의 SPF 수치, 바른 두께, 햇빛 노출 시간에 따라 실제 자외선 차단율은 어떻게 변하는가?",
    hypothesis: "SPF가 높을수록 차단율이 높지만 바른 양이 적거나 노출 시간이 길수록 차단율이 떨어질 것이다.",
    variables: { independent: "SPF 수치, 도포량(mg/cm²), 노출 시간, 천의 색·재질", dependent: "UV 투과율(%)", controlled: "측정 시각(일사 조건), 필름 종류, 센서 각도" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "GUVA-S12SD 자외선 센서 모듈", note: "약 4,000원" },
      { item: "투명 OHP 필름 또는 PMMA 판", note: "약 3,000원" },
      { item: "SPF가 다른 자외선 차단제 3종", note: "보유품 활용" },
      { item: "다양한 색·재질의 천 조각, 전자저울", note: "보유품 활용" }
    ],
    circuit: ["GUVA-S12SD: VCC→5V, GND→GND, OUT→A0"],
    code: `void setup() { Serial.begin(9600); Serial.println("ms,uvVolt"); }

void loop() {
  long sum = 0;
  for (int i = 0; i < 50; i++) { sum += analogRead(A0); delay(10); }
  float volt = sum / 50.0 * 5.0 / 1023.0;
  // 투과율(%) = (시료 아래 전압 / 시료 없을 때 전압) × 100 — 엑셀에서 계산
  Serial.print(millis()); Serial.print(','); Serial.println(volt, 4);
  delay(500);
}`,
    protocol: [
      "맑은 날 같은 시간대에 센서를 태양 방향으로 고정하고 시료 없는 값(기준)을 측정한다.",
      "필름에 자외선 차단제를 일정량(예: 2mg/cm²) 고르게 바르고 투과 전압을 측정한다.",
      "도포량을 0.5·1·2mg/cm²로 바꾸어 측정한다.",
      "필름을 햇빛에 0·30·60·120분 노출한 뒤 다시 측정하여 광분해를 확인한다.",
      "천(색·재질·젖음 여부)과 유리창(일반·자동차·코팅)도 같은 방법으로 측정한다.",
      "매 측정 전후 기준값을 다시 측정해 구름에 의한 변화를 보정한다."
    ],
    analysis: "투과율과 차단율 계산, SPF·도포량·노출 시간별 그래프, 반복 측정 표준편차.",
    expected: "도포량이 권장량보다 적으면 표시된 SPF에 비해 차단율이 크게 떨어지고, 일부 유기 자외선 차단제는 장시간 노출 후 차단율이 감소할 것으로 예상된다. 진한 색·촘촘한 천이 더 잘 차단할 것이다.",
    extension: "무기(산화아연) 대 유기 차단 성분 비교, 지역 UV 지수와 학생 야외활동 지침 제안.",
    safety: "태양을 직접 보지 않는다. 피부 시험은 하지 않는다(필름 사용).",
    record: "자외선 차단제의 실제 성능에 의문을 갖고 자외선 센서와 투명 필름으로 차단율 측정 장치를 구성함. 도포량과 햇빛 노출 시간에 따라 차단율이 달라짐을 정량적으로 보이고 기준값 반복 측정으로 일사 변화를 보정하는 등 실험 설계의 정밀성을 높임.",
    careerLink: "화장품·화학(차단 성분 개발), 의류학(기능성 섬유), 피부과학으로 연결된다.",
    searchTerms: ["자외선 차단제 도포량 차단율", "sunscreen photostability UV sensor", "의류 UPF 자외선 투과"]
  },
  {
    id: "plant-photosynthesis-co2",
    title: "빛의 세기와 파장에 따른 식물의 순광합성 속도",
    subjects: ["생명과학", "물리", "화학"],
    keywords: ["광합성", "식물", "CO2", "탄소중립", "빛", "기후변화", "탄소흡수", "생태", "엽록소"],
    careers: ["생명과학자", "식물학자", "환경", "기후", "농업연구사"],
    majors: ["생명과학과", "식물자원학과", "산림자원학과", "환경공학과", "원예학과"],
    level: "중급", budget: 40000, duration: "4주 이내",
    summary: "식물(화분)을 투명 밀폐 챔버에 넣고 CO₂ 농도 감소 속도를 측정하여 빛의 색·세기에 따른 순광합성 속도와 광보상점을 구한다.",
    trend: "도시 녹지·실내 식물의 탄소 흡수량 평가, 실내 식물의 공기 정화 효과에 대한 재검증 연구가 주목받고 있다.",
    question: "빛의 세기가 증가할 때 순광합성 속도는 어떻게 변하며, 광보상점과 광포화점은 어디인가?",
    hypothesis: "빛이 약할 때는 세기에 비례해 광합성이 증가하다가 일정 세기 이상에서는 포화될 것이다.",
    variables: { independent: "광도(조도), 빛의 색", dependent: "CO₂ 감소 속도(ppm/min) → 순광합성 속도", controlled: "식물 종·잎 면적, 챔버 부피, 온도" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "MH-Z19B CO₂ 센서", note: "약 15,000원" },
      { item: "BH1750 조도 센서, DHT22", note: "약 7,000원" },
      { item: "투명 밀폐 용기(대형 보관함)", note: "약 6,000원" },
      { item: "LED 작업등(밝기 조절), 색 셀로판지", note: "약 5,000원" },
      { item: "화분 식물(스킨답서스 등)", note: "보유품 활용" }
    ],
    circuit: ["MH-Z19B: TX→D10, RX→D11", "BH1750: SDA→A4, SCL→A5", "DHT22 DATA→D7"],
    code: `#include <SoftwareSerial.h>
#include <MHZ19.h>
#include <Wire.h>
#include <BH1750.h>
SoftwareSerial co2Serial(10, 11);
MHZ19 mhz;
BH1750 lux;

void setup() {
  Serial.begin(9600); co2Serial.begin(9600); mhz.begin(co2Serial);
  mhz.autoCalibration(false);
  Wire.begin(); lux.begin();
  Serial.println("ms,CO2,lux");
}

void loop() {
  Serial.print(millis()); Serial.print(',');
  Serial.print(mhz.getCO2()); Serial.print(',');
  Serial.println(lux.readLightLevel());
  delay(10000);
}`,
    protocol: [
      "빈 챔버로 CO₂ 누설 여부를 확인한다(30분간 농도 변화가 거의 없어야 함).",
      "식물을 넣고 암조건에서 CO₂ 증가 속도(호흡 속도)를 측정한다.",
      "조도를 5단계로 바꾸며 각 20분씩 CO₂ 변화를 측정한다. 단계 사이에 챔버를 환기해 초기 농도를 맞춘다.",
      "같은 조도에서 빛의 색(적·녹·청 셀로판)을 바꾸어 비교한다.",
      "실험 후 잎 면적을 측정해 단위 면적당 광합성 속도로 환산한다."
    ],
    analysis: "광도-광합성 속도 곡선(광반응 곡선) 그리기, 광보상점·광포화점 추정, 빛의 색별 비교.",
    expected: "광도-광합성 곡선은 처음엔 직선적으로 증가하다 포화되며, 녹색광에서 광합성이 가장 낮을 것으로 예상된다. 챔버 내 온도 상승이 오차 요인이 될 수 있다.",
    extension: "학교 녹지 식물 종별 탄소 흡수량을 비교해 교내 탄소중립 정원을 제안한다.",
    safety: "작업등 발열 주의.",
    record: "식물의 탄소 흡수 능력을 정량화하고자 밀폐 챔버와 CO₂ 센서로 순광합성 속도를 측정함. 암조건 호흡량을 보정하고 광반응 곡선에서 광보상점과 광포화점을 추정하였으며, 이를 근거로 교내 탄소중립 녹지 조성 방안을 제안함.",
    careerLink: "생명과학·식물학(광합성 생리), 환경·기후(탄소 흡수원 평가)로 연결된다.",
    searchTerms: ["광합성 속도 CO2 센서 챔버", "light response curve photosynthesis low cost CO2", "실내 식물 이산화탄소 흡수"]
  },
  {
    id: "teg-wasteheat",
    title: "온도차에 따른 열전 소자의 발전 특성과 생활 폐열의 활용 가능성",
    subjects: ["물리", "화학", "정보"],
    keywords: ["열전", "펠티어", "제벡 효과", "폐열", "에너지", "열", "온도차", "반도체", "발전"],
    careers: ["에너지공학자", "반도체", "기계공학자", "신소재공학자"],
    majors: ["에너지공학과", "기계공학과", "신소재공학과", "반도체공학과", "전기공학과"],
    level: "중급", budget: 30000, duration: "4주 이내",
    summary: "펠티어 소자 양면의 온도차를 바꾸며 출력 전압과 전력을 측정해 제벡 계수를 구하고, 컵·체온·조리기구 폐열로 얻을 수 있는 전력을 평가한다.",
    trend: "산업·차량 폐열 회수용 열전 재료와 체온 발전 웨어러블 연구가 진행되고 있다.",
    question: "열전 소자의 양면 온도차와 출력 전력은 어떤 관계이며, 방열 방식에 따라 출력이 얼마나 달라지는가?",
    hypothesis: "출력 전압은 온도차에 비례하고, 전력은 온도차의 제곱에 비례할 것이다.",
    variables: { independent: "온도차(ΔT), 방열 방식(없음·방열판·수냉)", dependent: "출력 전압, 부하 전력", controlled: "소자 종류, 부하 저항, 접촉 압력(써멀 그리스)" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "펠티어 소자(TEC1-12706 또는 TEG 전용)", note: "약 5,000원" },
      { item: "DS18B20 온도 센서 ×2", note: "약 6,000원" },
      { item: "INA219", note: "약 5,000원" },
      { item: "방열판, 써멀 그리스, 얼음물·온수 용기", note: "약 5,000원" }
    ],
    circuit: ["DS18B20 2개를 D2에 병렬 연결(4.7kΩ 풀업) — 고온면·저온면에 부착", "소자 출력 → INA219 → 부하 저항(10Ω)"],
    code: `#include <OneWire.h>
#include <DallasTemperature.h>
#include <Adafruit_INA219.h>
OneWire ow(2);
DallasTemperature ds(&ow);
Adafruit_INA219 ina;

void setup() { Serial.begin(9600); ds.begin(); ina.begin(); Serial.println("ms,Thot,Tcold,dT,V,mW"); }

void loop() {
  ds.requestTemperatures();
  float th = ds.getTempCByIndex(0), tc = ds.getTempCByIndex(1);
  Serial.print(millis()); Serial.print(',');
  Serial.print(th); Serial.print(','); Serial.print(tc); Serial.print(',');
  Serial.print(th - tc); Serial.print(',');
  Serial.print(ina.getBusVoltage_V(), 3); Serial.print(',');
  Serial.println(ina.getPower_mW(), 3);
  delay(2000);
}`,
    protocol: [
      "소자 고온면에 온수 용기, 저온면에 얼음물 용기를 써멀 그리스로 밀착시킨다.",
      "온수가 식어 가는 동안 온도차와 출력을 2초 간격으로 연속 기록한다.",
      "방열판·수냉 등 저온면 처리 방식을 바꾸어 반복한다.",
      "부하 저항을 바꾸며 최대 전력이 나오는 부하를 찾는다.",
      "머그컵, 손바닥, 노트북 배기구 등 실제 폐열원에서 출력을 측정한다."
    ],
    analysis: "ΔT-전압 선형회귀로 제벡 계수(V/K) 산출, ΔT-전력 그래프의 2차 회귀, 카르노 효율과 비교.",
    expected: "전압은 ΔT에 거의 비례하고 전력은 ΔT²에 비례하며, 저온면 방열이 출력에 결정적일 것으로 예상된다. 체온 등 작은 온도차에서는 매우 작은 전력만 얻어진다.",
    extension: "승압 회로(DC-DC)를 연결해 실제 센서를 구동하거나 캠핑용 난로 발전기를 설계한다.",
    safety: "뜨거운 물 화상 주의. 소자에 전원을 넣으면 한쪽이 매우 뜨거워지므로 발전 실험에만 사용한다.",
    record: "생활 속 폐열 재활용 가능성을 탐구하기 위해 열전 소자의 온도차-출력 관계를 측정함. 제벡 계수를 회귀분석으로 산출하고 전력이 온도차의 제곱에 비례함을 확인하였으며, 저온면 방열이 출력의 핵심 변수임을 밝혀 공학적 개선 방향을 제시함.",
    careerLink: "에너지·기계공학(열 관리), 반도체·신소재(열전 재료)로 연결된다.",
    searchTerms: ["열전소자 폐열 발전 제벡", "thermoelectric generator waste heat Peltier experiment", "체온 열전 발전 웨어러블"]
  },
  {
    id: "light-pollution",
    title: "도심으로부터의 거리에 따른 밤하늘 밝기 변화와 빛공해",
    subjects: ["지구과학", "물리", "정보"],
    keywords: ["천문", "별", "빛공해", "밤하늘", "우주", "조명", "생태", "지도", "GIS", "데이터"],
    careers: ["천문학자", "우주과학자", "환경", "도시계획가", "데이터 분석가"],
    majors: ["천문우주학과", "지구과학교육과", "물리학과", "도시공학과", "지리학과"],
    level: "중급", budget: 35000, duration: "1~2개월",
    summary: "고감도 조도 센서(TSL2591)와 GPS로 휴대용 하늘 밝기 측정기를 만들어 지역 곳곳의 밤하늘 밝기를 측정하고 빛공해 지도를 제작한다.",
    trend: "인공위성 야간 영상과 시민과학 하늘 밝기 측정을 결합한 빛공해 연구, LED 가로등 전환에 따른 생태 영향 연구가 활발하다.",
    question: "도심에서 멀어질수록 밤하늘 밝기는 어떻게 변하며, 가로등·상가 밀도와 어떤 관계가 있는가?",
    hypothesis: "하늘 밝기는 도심과의 거리와 주변 조명 밀도에 따라 감소하며, 달·구름의 영향이 크게 나타날 것이다.",
    variables: { independent: "측정 위치(도심 거리), 달 위상, 구름량", dependent: "천정 하늘 밝기(lux → 등급/arcsec² 환산 근사)", controlled: "측정 방향(천정), 측정 시각(천문박명 이후), 센서 시야각(후드)" },
    materials: [
      { item: "아두이노 우노 또는 나노", note: "약 8,000원" },
      { item: "TSL2591 고감도 조도 센서", note: "약 10,000원" },
      { item: "NEO-6M GPS 모듈", note: "약 8,000원" },
      { item: "검은 원통 후드(시야각 제한)", note: "약 1,000원" },
      { item: "보조배터리", note: "보유품" }
    ],
    circuit: ["TSL2591: SDA→A4, SCL→A5", "GPS: TX→D4, RX→D3 (SoftwareSerial)"],
    code: `#include <Wire.h>
#include <Adafruit_TSL2591.h>   // 라이브러리: Adafruit TSL2591
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>        // 라이브러리: TinyGPSPlus
Adafruit_TSL2591 tsl(2591);
SoftwareSerial gpsSerial(4, 3);
TinyGPSPlus gps;

void setup() {
  Serial.begin(9600); gpsSerial.begin(9600);
  tsl.begin();
  tsl.setGain(TSL2591_GAIN_MAX);
  tsl.setTiming(TSL2591_INTEGRATIONTIME_600MS);
  Serial.println("lat,lng,lux");
}

void loop() {
  while (gpsSerial.available()) gps.encode(gpsSerial.read());
  uint32_t full = tsl.getFullLuminosity();
  float lux = tsl.calculateLux(full & 0xFFFF, full >> 16);
  Serial.print(gps.location.lat(), 6); Serial.print(',');
  Serial.print(gps.location.lng(), 6); Serial.print(',');
  Serial.println(lux, 5);
  delay(3000);
}`,
    protocol: [
      "후드를 씌운 센서를 천정 방향으로 고정하는 거치대를 만든다.",
      "학교에서 도심·주거지·공원·외곽까지 측정 지점 15곳 이상을 정한다.",
      "달이 없는 맑은 밤(천문박명 이후)에 보호자와 함께 지점별로 1분씩 측정한다.",
      "측정 시 구름량·달 위상·주변 조명 사진을 기록한다.",
      "좌표와 밝기를 지도(구글 마이맵, 파이썬 folium)에 시각화하고 위성 야간광 자료와 비교한다."
    ],
    analysis: "도심 거리-하늘 밝기 회귀, 위성 야간광 자료와 상관 분석, 맨눈으로 보이는 별 개수(등급)와 비교.",
    expected: "도심에서 멀어질수록 하늘이 어두워지는 경향이 나타나지만, 대형 조명(경기장·상가) 인근에서 국지적으로 밝아지는 지점이 확인될 것이다. 저가 센서는 매우 어두운 하늘에서 감도 한계가 있을 수 있다.",
    extension: "가로등 색온도와 곤충 유인 효과, 빛공해 방지 조례 비교 등 생태·정책 연구로 확장한다.",
    safety: "야간 측정은 반드시 보호자·교사 동행, 차도 접근 금지. 위치 정보는 공공장소만 기록.",
    record: "천문 관측 환경에 관심을 갖고 고감도 조도 센서와 GPS를 결합한 하늘 밝기 측정기를 제작해 지역 빛공해 지도를 완성함. 측정 조건(달 위상, 구름량)을 통제하고 위성 야간광 자료와 비교하여 측정값의 타당성을 검증하는 등 체계적인 데이터 수집·시각화 역량을 보임.",
    careerLink: "천문우주(관측 환경), 도시공학(조명 계획), 공간 데이터 분석으로 연결된다.",
    searchTerms: ["빛공해 하늘 밝기 측정 SQM", "light pollution citizen science sky brightness", "TSL2591 sky quality meter"]
  },
  {
    id: "loadcell-material",
    title: "글리세롤 함량에 따른 전분 바이오플라스틱 필름의 인장 강도와 연신율",
    subjects: ["물리", "화학", "생명과학"],
    keywords: ["재료", "강도", "인장", "신소재", "생체재료", "생분해 플라스틱", "고분자", "탄성", "역학", "환경"],
    careers: ["신소재공학자", "기계공학자", "고분자 연구원", "화학공학자", "생체재료"],
    majors: ["신소재공학과", "기계공학과", "고분자공학과", "화학공학과", "재료공학과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "로드셀(HX711)과 스텝 이동 장치로 간이 인장 시험기를 만들어 머리카락, 실, 전분 기반 바이오플라스틱 필름의 힘-변형 곡선과 인장 강도를 측정한다.",
    trend: "플라스틱 규제와 함께 생분해 플라스틱의 기계적 물성 개선(가소제·충전제) 연구가 활발하다.",
    question: "전분 바이오플라스틱 필름의 글리세롤(가소제) 함량에 따라 인장 강도와 연신율은 어떻게 변하는가?",
    hypothesis: "가소제가 많을수록 연신율은 커지고 인장 강도는 감소할 것이다.",
    variables: { independent: "글리세롤 함량(또는 시료 종류)", dependent: "최대 하중, 인장 강도(N/mm²), 연신율", controlled: "시료 폭·두께·길이, 당기는 속도, 건조 조건" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "로드셀(5kg) + HX711 앰프", note: "약 5,000원" },
      { item: "28BYJ-48 스텝 모터 + ULN2003 드라이버", note: "약 4,000원" },
      { item: "나무 프레임, 집게 2개, M3 볼트·너트", note: "약 6,000원" },
      { item: "감자 전분, 글리세롤, 식초(필름 제작)", note: "약 6,000원" },
      { item: "버니어 캘리퍼스/마이크로미터", note: "학교 보유" }
    ],
    circuit: ["HX711: DT→D3, SCK→D2, 로드셀 4선은 E+/E−/A+/A−", "ULN2003: IN1~IN4→D8~D11"],
    code: `#include "HX711.h"     // 라이브러리: HX711 (bogde)
#include <Stepper.h>
HX711 scale;
Stepper motor(2048, 8, 10, 9, 11);
const float CAL = 420.0;  // 보정계수: 무게를 아는 추로 직접 구하기
long steps = 0;

void setup() {
  Serial.begin(9600);
  scale.begin(3, 2);
  scale.set_scale(CAL);
  scale.tare();
  motor.setSpeed(5);
  Serial.println("steps,force_g");
}

void loop() {
  motor.step(16);  steps += 16;            // 조금씩 당기기
  float g = scale.get_units(3);
  Serial.print(steps); Serial.print(','); Serial.println(g, 1);
  if (steps > 20000) while (1);            // 안전 정지
}`,
    protocol: [
      "무게를 아는 추로 로드셀 보정계수를 구한다.",
      "스텝 수-이동 거리 관계를 자로 측정해 변형량으로 환산한다.",
      "글리세롤 함량을 0·10·20·30%로 바꾼 전분 필름을 같은 두께로 만들고 같은 조건에서 건조한다.",
      "필름을 덤벨형(가운데가 좁은 형태)으로 잘라 폭·두께를 측정한다.",
      "시료를 집게에 물리고 끊어질 때까지 당기며 힘을 기록한다(각 5회).",
      "머리카락·면실 등 생체 재료도 같은 방법으로 비교한다."
    ],
    analysis: "응력-변형률 곡선, 인장 강도·연신율·탄성계수(초기 기울기) 비교, 가소제 함량과 물성의 상관.",
    expected: "가소제 함량이 증가할수록 인장 강도는 감소하고 연신율은 증가하는 경향이 나타날 것이다. 시료 두께의 불균일성이 큰 오차 요인이 된다.",
    extension: "셀룰로오스·키토산 등 충전제를 넣어 강도를 개선하거나, 흙 속 분해 속도와 물성 변화를 함께 추적한다.",
    safety: "필름 제작 시 가열 화상 주의. 시료 파단 시 튀는 조각 주의(보안경).",
    record: "플라스틱 문제에 대한 대안으로 전분 바이오플라스틱의 물성에 관심을 갖고 로드셀과 스텝 모터로 간이 인장 시험기를 직접 제작함. 가소제 함량에 따른 응력-변형률 곡선을 분석하여 강도와 연신율의 상충 관계를 고분자 사슬 간 상호작용으로 설명함.",
    careerLink: "신소재·고분자공학(친환경 소재), 기계공학(재료 시험)으로 연결된다.",
    searchTerms: ["전분 바이오플라스틱 글리세롤 인장강도", "DIY tensile tester load cell HX711", "생분해성 플라스틱 기계적 물성"]
  },
  {
    id: "fruit-ripening-gas",
    title: "보관 조건에 따른 바나나의 숙성 속도와 휘발성 기체 변화",
    subjects: ["화학", "생명과학", "정보"],
    keywords: ["식품", "숙성", "에틸렌", "신선도", "가스센서", "과일", "식품 보존", "음식물 쓰레기", "전자코"],
    careers: ["식품연구원", "식품공학자", "농업연구사", "화학자", "유통"],
    majors: ["식품공학과", "식품영양학과", "원예학과", "화학공학과", "생명과학과"],
    level: "중급", budget: 30000, duration: "4주 이내",
    summary: "MQ-3(알코올), MQ-135(복합 VOC) 가스 센서로 밀폐 용기 속 바나나가 숙성될 때 나오는 휘발성 기체 신호를 기록하고, 보관 조건(온도·사과와 함께 보관 등)에 따른 숙성 속도를 비교한다.",
    trend: "가스 센서 배열(전자코)과 머신러닝을 이용한 식품 신선도 판별, 음식물 쓰레기 저감을 위한 스마트 포장 연구가 활발하다.",
    question: "보관 조건에 따라 바나나의 휘발성 기체 신호와 껍질 색 변화(숙성 속도)는 어떻게 달라지며, 기체 신호로 숙성 단계를 예측할 수 있는가?",
    hypothesis: "에틸렌을 많이 내는 사과와 함께 보관하거나 따뜻한 곳에 둘 때 숙성이 빨라지고 가스 센서 신호가 더 빨리 증가할 것이다.",
    variables: { independent: "보관 온도, 사과 동봉 여부, 밀폐 여부", dependent: "가스 센서 저항비(Rs/R0), 껍질 색(RGB/갈변 면적)", controlled: "바나나 초기 숙성도·무게, 용기 부피, 측정 간격" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "MQ-3, MQ-135 가스 센서 모듈", note: "각 약 3,000원" },
      { item: "DHT22", note: "약 4,000원" },
      { item: "밀폐 용기 3개, 바나나·사과", note: "약 10,000원" },
      { item: "스마트폰(사진 촬영)", note: "보유품" }
    ],
    circuit: ["MQ-3 AOUT→A0, MQ-135 AOUT→A1 (5V, 히터 전류가 크므로 외부 5V 전원 권장)", "DHT22 DATA→D7"],
    code: `#include <DHT.h>
DHT dht(7, DHT22);
const float RL = 10.0;   // 모듈 부하저항(kΩ) — 모듈마다 확인

float rs(int pin) {
  float v = analogRead(pin) * 5.0 / 1023.0;
  return (5.0 - v) / v * RL;   // 센서 저항(kΩ)
}

void setup() { Serial.begin(9600); dht.begin(); Serial.println("min,Rs_MQ3,Rs_MQ135,T,H"); }

void loop() {
  Serial.print(millis() / 60000); Serial.print(',');
  Serial.print(rs(A0)); Serial.print(',');
  Serial.print(rs(A1)); Serial.print(',');
  Serial.print(dht.readTemperature()); Serial.print(',');
  Serial.println(dht.readHumidity());
  delay(60000);   // 1분 간격
}`,
    protocol: [
      "가스 센서를 24시간 이상 예열(번인)하고 깨끗한 공기에서 R0를 측정한다.",
      "같은 숙성도의 바나나를 조건별 용기에 넣는다(실온 / 실온+사과 / 냉장).",
      "센서를 순서대로 용기에 넣거나 용기마다 센서를 두어 7일간 기록한다.",
      "매일 같은 조명에서 껍질 사진을 찍어 갈변(검은 반점) 면적 비율을 분석한다.",
      "가스 신호와 숙성 단계(색 기준)의 관계를 분석한다."
    ],
    analysis: "Rs/R0 시계열 그래프, 조건별 신호 증가 속도, 가스 신호와 갈변 비율의 상관 분석, (선택) 간단한 분류 모델.",
    expected: "사과 동봉·실온 조건에서 숙성이 가장 빠르고 휘발성 기체 신호가 빨리 증가할 것이다. 저가 MQ 센서는 특정 기체를 선택적으로 측정하지 못하고 온·습도 영향을 받으므로 '상대적 변화'로 해석해야 한다.",
    extension: "여러 센서를 조합한 전자코 + 머신러닝으로 신선도 등급 분류, 스마트 냉장고·포장 아이디어 제안.",
    safety: "MQ 센서 히터는 뜨거워지므로 만지지 않는다. 상한 과일은 실험 후 바로 폐기한다.",
    record: "음식물 쓰레기 문제에 관심을 갖고 가스 센서로 바나나 숙성 과정의 휘발성 기체 변화를 추적함. 센서의 비선택성과 온습도 영향을 인식하고 상대 신호로 해석하였으며, 이미지 분석으로 측정한 갈변 비율과 가스 신호의 상관관계를 밝혀 신선도 예측 가능성을 제시함.",
    careerLink: "식품공학(품질·저장), 원예(수확 후 관리), 센서·데이터 공학으로 연결된다.",
    searchTerms: ["전자코 과일 숙성 가스센서", "electronic nose fruit ripeness MQ sensor", "에틸렌 바나나 숙성 보관"]
  },
  {
    id: "soil-landslide",
    title: "강우 강도와 경사각에 따른 모형 사면의 붕괴 과정과 전조 현상",
    subjects: ["지구과학", "물리", "정보"],
    keywords: ["산사태", "재난", "토양", "강우", "집중호우", "경보", "지질", "기후변화", "안전", "IoT"],
    careers: ["재난안전", "토목공학자", "지질학자", "소방", "공무원", "환경"],
    majors: ["토목공학과", "지질학과", "지구환경과학과", "방재안전학과", "건설환경공학과"],
    level: "중급", budget: 35000, duration: "1~2개월",
    summary: "흙으로 만든 경사면 모형에 인공 강우를 뿌리며 토양 수분과 기울기(MPU6050)를 측정해 붕괴 직전의 신호를 찾고 조기 경보 기준을 설계한다.",
    trend: "기후변화로 인한 극한 강우와 산사태 피해가 증가하면서 IoT 센서 기반 사면 감시·조기경보 시스템 연구와 보도가 늘고 있다.",
    question: "강우 강도와 경사각에 따라 사면이 붕괴되기까지의 시간과 붕괴 직전 토양 수분·기울기 변화 패턴은 어떠한가?",
    hypothesis: "토양 수분이 일정 임계값을 넘은 뒤 기울기 센서의 미세한 변화가 나타나고, 이후 붕괴가 일어날 것이다.",
    variables: { independent: "강우 강도, 경사각, 토양 종류(모래·흙 혼합비)", dependent: "붕괴까지 시간, 붕괴 직전 수분값, 기울기 변화량", controlled: "흙 다짐 정도, 모형 크기, 센서 매설 깊이" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "정전용량식 토양수분 센서 ×3", note: "약 6,000원" },
      { item: "MPU6050(사면에 꽂은 막대에 부착)", note: "약 3,000원" },
      { item: "부저·LED(경보)", note: "약 1,000원" },
      { item: "플라스틱 수납함(모형 틀), 흙·모래", note: "약 8,000원" },
      { item: "분무기 또는 구멍 뚫은 물통(인공 강우)", note: "약 3,000원" }
    ],
    circuit: ["토양수분 센서: A0(상부), A1(중부), A2(하부)", "MPU6050: SDA→A4, SCL→A5", "부저→D8, LED→D9"],
    code: `#include <Adafruit_MPU6050.h>
Adafruit_MPU6050 mpu;
const int WET = 350;        // 보정 후 결정할 '포화' 임계값(작을수록 습함)
float tilt0;

float tilt() {
  sensors_event_t a, g, t; mpu.getEvent(&a, &g, &t);
  return atan2(a.acceleration.x, a.acceleration.z) * 57.2958;   // 기울기(도)
}

void setup() { Serial.begin(9600); mpu.begin(); pinMode(8, OUTPUT); pinMode(9, OUTPUT);
  tilt0 = tilt(); Serial.println("s,m1,m2,m3,dTilt"); }

void loop() {
  int m1 = analogRead(A0), m2 = analogRead(A1), m3 = analogRead(A2);
  float d = tilt() - tilt0;
  Serial.print(millis()/1000); Serial.print(',');
  Serial.print(m1); Serial.print(','); Serial.print(m2); Serial.print(',');
  Serial.print(m3); Serial.print(','); Serial.println(d, 2);
  bool warn = (m3 < WET) && (abs(d) > 0.5);     // 수분+기울기 동시 조건
  digitalWrite(8, warn); digitalWrite(9, warn);
  delay(1000);
}`,
    protocol: [
      "같은 방법으로 흙을 다져 경사면 모형을 만들고 센서를 상·중·하부에 매설한다.",
      "건조 상태와 완전 포화 상태에서 센서 값을 측정해 보정한다.",
      "강우 강도(분당 분사량)와 경사각(30·40·50°)을 바꾸어 붕괴까지 기록한다(영상 촬영 병행).",
      "붕괴 시점 영상과 센서 데이터를 맞추어 전조 신호를 찾는다.",
      "찾은 기준으로 경보 알고리즘을 설정하고, 새 실험에서 경보가 붕괴 몇 초 전에 울리는지 검증한다."
    ],
    analysis: "조건별 붕괴 시간 비교, 붕괴 전 수분·기울기 시계열 패턴, 경보 기준의 선행 시간과 오경보율 평가.",
    expected: "강우 강도·경사각이 클수록 붕괴가 빨라지고, 하부 토양 포화 이후 기울기 변화가 가속되는 전조가 관찰될 것으로 예상된다. 수분+기울기 복합 기준이 단일 기준보다 오경보가 적을 것이다.",
    extension: "LoRa·Wi‑Fi로 원격 경보를 보내거나 기상청 강우 자료 기반 위험 지도와 연계한다.",
    safety: "물과 회로를 분리(방수). 흙·물 사용 후 정리 철저.",
    record: "극한 강우로 인한 산사태 피해를 줄이기 위해 사면 모형과 토양 수분·기울기 센서를 이용한 조기 경보 실험을 설계함. 붕괴 영상과 센서 데이터를 동기화하여 전조 신호를 찾고, 복합 경보 기준의 선행 시간과 오경보율을 평가하는 등 재난 안전 문제를 데이터로 해결하려는 태도를 보임.",
    careerLink: "토목·방재(사면 안정), 지질학(토양 역학), 재난 IoT 분야로 연결된다.",
    searchTerms: ["산사태 조기경보 토양수분 센서 모형", "landslide early warning low cost sensor flume", "사면 붕괴 강우 강도 모형 실험"]
  },
  {
    id: "noise-map",
    title: "시간대와 장소에 따른 학교 주변 환경 소음과 교통량의 관계",
    subjects: ["정보", "물리", "생명과학"],
    keywords: ["소음", "소리", "데시벨", "공공데이터", "데이터 분석", "수면", "건강", "지도", "도시", "파동", "빅데이터"],
    careers: ["데이터 분석가", "도시계획가", "음향공학자", "보건", "환경", "소프트웨어 개발자"],
    majors: ["데이터사이언스학과", "도시공학과", "통계학과", "환경공학과", "보건학과", "컴퓨터공학과"],
    level: "기초", budget: 25000, duration: "1~2개월",
    summary: "마이크 모듈로 소리 크기를 측정하는 장치를 만들고 휴대폰 소음계 앱으로 보정한 뒤, 학교·주거지 주변 시간대별 소음을 측정해 교통량 공공데이터와 함께 분석한다.",
    trend: "도시 소음 지도(소음 빅데이터)와 소음이 수면·인지 기능에 미치는 영향에 대한 연구가 활발하며, 층간소음 등 생활 소음 문제가 자주 보도된다.",
    question: "학교 주변 소음은 시간대·장소에 따라 어떻게 다르며, 교통량과 얼마나 관련이 있는가?",
    hypothesis: "출퇴근 시간대 도로변 소음이 가장 높고, 교통량과 소음 수준은 양의 상관관계를 보일 것이다.",
    variables: { independent: "측정 장소, 시간대, 교통량", dependent: "등가소음도(Leq, 근사 dB)", controlled: "마이크 높이·방향, 측정 시간(10분), 날씨(바람)" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "MAX4466 또는 MAX9814 마이크 모듈", note: "약 4,000원" },
      { item: "SD 카드 모듈 + microSD", note: "약 5,000원 (선택)" },
      { item: "스마트폰 소음계 앱(보정 기준)", note: "무료" },
      { item: "보조배터리, 방풍 스펀지", note: "보유품" }
    ],
    circuit: ["마이크 모듈: VCC→3.3V(잡음 적음), GND→GND, OUT→A0", "SD 모듈: CS→D10, MOSI→D11, MISO→D12, SCK→D13"],
    code: `// 50ms 동안 신호의 최대-최소(피크-피크)로 소리 크기 추정
// 보정: 휴대폰 소음계 dB와 비교해 dB = a*log10(p2p) + b 의 a, b를 구한다
const float A = 20.0, B = 30.0;   // 보정 후 수정

void setup() { Serial.begin(9600); Serial.println("ms,p2p,dB_est"); }

void loop() {
  unsigned long start = millis();
  int mx = 0, mn = 1023;
  while (millis() - start < 50) {
    int s = analogRead(A0);
    if (s > mx) mx = s;
    if (s < mn) mn = s;
  }
  int p2p = max(mx - mn, 1);
  float dB = A * log10(p2p) + B;
  Serial.print(millis()); Serial.print(','); Serial.print(p2p); Serial.print(','); Serial.println(dB, 1);
  delay(200);
}`,
    protocol: [
      "조용한 방에서 휴대폰 소음계와 함께 여러 크기의 소리를 측정하여 보정식을 구한다.",
      "학교 주변 측정 지점 8곳 이상을 정한다(도로변, 주택가, 공원, 교실 내부).",
      "평일 등교·점심·하교·야간 시간대에 각 10분씩 측정한다.",
      "같은 시간에 교통량(차량 수)을 직접 세거나 공공데이터포털 교통량 자료를 활용한다.",
      "등가소음도(Leq)를 계산하고 지도로 시각화한다."
    ],
    analysis: "Leq = 10·log₁₀(평균(10^(L/10))) 계산, 장소·시간대 비교, 교통량-소음 상관·회귀분석, 환경 소음 기준과 비교.",
    expected: "도로변 출퇴근 시간대 소음이 가장 높고, 교통량과 소음 간 양의 상관이 나타날 것이다. 저가 마이크의 주파수 특성 때문에 절대값보다는 상대 비교가 신뢰도 높다.",
    extension: "방음벽·수목대 앞뒤 소음 감쇠 측정, 교실 창문 종류별 차음 효과, 소음과 학습 집중도 설문 연계.",
    safety: "도로변 측정 시 보도 안쪽에서 측정. 녹음 시 타인의 대화를 저장하지 않는다(소리 크기만 기록).",
    record: "생활 소음 문제에 관심을 갖고 마이크 모듈로 소음 측정 장치를 제작한 뒤 소음계 앱과 비교해 보정식을 도출함. 학교 주변 시간대별 등가소음도를 지도로 시각화하고 교통량 공공데이터와 회귀분석하여 소음 원인을 데이터로 설명하는 분석 역량을 보임.",
    careerLink: "데이터과학·통계(공공데이터 분석), 도시공학(소음 관리), 보건(환경 건강)으로 연결된다.",
    searchTerms: ["도시 소음 지도 시민 측정", "low-cost noise monitoring Arduino microphone", "교통 소음 수면 영향"]
  },
  {
    id: "pendulum-damping-ai",
    title: "추의 모양에 따른 진자 운동의 공기 저항과 감쇠 특성",
    subjects: ["물리", "정보"],
    keywords: ["역학", "진자", "운동", "공기저항", "감쇠", "모델링", "시뮬레이션", "물리", "수학", "코딩", "파이썬"],
    careers: ["물리학자", "기계공학자", "항공우주공학자", "데이터 과학자", "시뮬레이션 엔지니어"],
    majors: ["물리학과", "기계공학과", "항공우주공학과", "수학과", "컴퓨터공학과"],
    level: "심화", budget: 15000, duration: "1~2개월",
    summary: "적외선 광게이트로 진자의 주기와 통과 속력을 정밀 측정하고, 추의 모양·크기에 따른 진폭 감쇠를 선형(점성)·이차(난류) 공기 저항 모델과 수치 시뮬레이션으로 비교한다.",
    trend: "센서 데이터와 수치 모델을 결합한 물리 모델링(디지털 트윈), 데이터 기반 운동 방정식 추정 연구가 주목받고 있다.",
    question: "추의 모양과 크기에 따라 진폭 감쇠는 속도에 비례하는 저항 모델과 속도 제곱에 비례하는 모델 중 어느 쪽에 더 잘 맞는가?",
    hypothesis: "추의 단면적이 크고 속력이 클수록 속도 제곱(이차) 저항 모델이 더 잘 맞을 것이다.",
    variables: { independent: "추의 모양(구·원판·원뿔)·단면적, 초기 진폭", dependent: "진폭 감쇠율, 주기, 통과 속력", controlled: "줄 길이, 추 질량, 측정 장소(바람 없음)" },
    materials: [
      { item: "아두이노 우노", note: "약 8,000원" },
      { item: "적외선 광게이트(포토 인터럽터 또는 IR LED+포토트랜지스터)", note: "약 3,000원" },
      { item: "실, 스탠드, 3D 프린팅/점토 추", note: "약 4,000원" },
      { item: "PC(파이썬 numpy, scipy)", note: "무료" }
    ],
    circuit: ["광게이트 출력 → D2(인터럽트 핀), 5V/GND"],
    code: `// 광게이트 차단 시작·끝 시각(µs)을 기록 → 통과 시간으로 속력 계산
volatile unsigned long tStart = 0, tEnd = 0;
volatile bool ready = false;

void gate() {
  if (digitalRead(2) == LOW) tStart = micros();   // 차단 시작(모듈에 따라 HIGH/LOW 확인)
  else { tEnd = micros(); ready = true; }
}

void setup() {
  Serial.begin(115200);
  pinMode(2, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(2), gate, CHANGE);
  Serial.println("t_start_us,block_us");
}

void loop() {
  if (ready) {
    noInterrupts(); unsigned long s = tStart, e = tEnd; ready = false; interrupts();
    Serial.print(s); Serial.print(','); Serial.println(e - s);
  }
}`,
    protocol: [
      "추의 지름(가로막는 폭)을 측정해 통과 속력 = 폭/차단 시간을 구한다.",
      "광게이트를 진자 최저점에 설치하고 초기 각도 30°에서 놓아 3분간 기록한다.",
      "추의 모양 3종 × 크기 2종 × 3회 반복한다.",
      "최저점 속력으로부터 진폭(최대 높이 h = v²/2g)을 추정한다.",
      "파이썬으로 선형·이차 저항이 있는 운동 방정식을 수치 적분(오일러/룽게-쿠타)해 측정값과 비교하고 저항 계수를 최적화한다."
    ],
    analysis: "진폭-시간 그래프에서 지수 감쇠(선형)와 1/t형 감쇠(이차) 적합도 비교(RMSE, R²), 레이놀즈 수 추정.",
    expected: "큰 원판형 추는 이차 저항 모델이, 작은 구형 추는 선형 모델이 더 잘 맞거나 두 항이 섞인 모델이 가장 잘 맞을 것으로 예상된다.",
    extension: "트래커(Tracker) 영상 분석과 비교하거나, 머신러닝(기호 회귀)으로 운동 방정식을 데이터에서 찾아본다.",
    safety: "추가 사람에게 닿지 않도록 실험 공간 확보.",
    record: "단진자의 감쇠 운동을 정밀하게 분석하기 위해 인터럽트 기반 광게이트를 제작하여 마이크로초 단위로 통과 속력을 측정함. 선형·이차 공기 저항 모델을 수치 적분으로 구현하고 측정 데이터와의 적합도를 비교하여 추의 모양에 따라 지배적 저항이 달라짐을 밝히는 등 이론과 실험, 프로그래밍을 융합한 탐구를 수행함.",
    careerLink: "물리학·항공우주(유체 저항), 기계공학(진동), 계산과학(시뮬레이션)으로 연결된다.",
    searchTerms: ["진자 공기저항 감쇠 선형 이차", "pendulum damping quadratic drag photogate", "광게이트 아두이노 진자"]
  },

  /* ===================== 실험 중심 주제 ===================== */
  {
    id: "natural-indicator",
    methods: ["실험"],
    title: "식물 색소(안토시아닌) 지시약의 pH에 따른 색 변화와 변색 범위",
    subjects: ["화학", "생명과학"],
    keywords: ["지시약", "pH", "산염기", "안토시아닌", "천연색소", "식물", "색", "중화", "식품"],
    careers: ["약사", "화학자", "식품연구원", "화장품 연구원", "교사"],
    majors: ["약학과", "화학과", "식품공학과", "화장품학과", "화학교육과"],
    level: "기초", budget: 15000, duration: "4주 이내",
    summary: "적양배추, 블루베리, 검은콩, 장미 꽃잎 등에서 추출한 안토시아닌 색소를 pH 1~13 완충 용액에 넣어 색 변화를 비교하고, 시판 지시약과 변색 범위를 비교한다.",
    trend: "합성 지시약을 대체하는 천연 색소 기반 pH 지시 필름이 식품 신선도 표시(스마트 포장) 연구로 활발히 다뤄지고 있다.",
    question: "식물 종류에 따라 안토시아닌 추출액의 변색 pH 범위와 색은 어떻게 다르며, 시판 지시약을 대신할 수 있는가?",
    hypothesis: "안토시아닌의 분자 구조 차이로 식물마다 변색 범위가 다르며, 일부 추출액은 특정 pH 구간에서 시판 지시약만큼 뚜렷한 변화를 보일 것이다.",
    variables: { independent: "식물 종류, 용액의 pH, 추출 용매(물·에탄올)", dependent: "색(RGB 값, 색상각), 변색 pH 범위", controlled: "추출 시간·온도, 추출액 농도, 관찰 조명" },
    materials: [
      { item: "적양배추·블루베리·검은콩·꽃잎 등", note: "약 8,000원" },
      { item: "pH 1~13 완충 용액 또는 HCl·NaOH 희석 용액", note: "학교 보유" },
      { item: "pH 미터 또는 만능 지시약 종이", note: "학교 보유" },
      { item: "시험관, 피펫, 흰색 배경판", note: "학교 보유" },
      { item: "스마트폰(색 분석 앱 또는 사진 RGB 분석)", note: "보유품" },
      { item: "에탄올, 거름종이", note: "약 5,000원" }
    ],
    circuit: ["흰색 배경판과 일정한 조명(LED 스탠드)을 고정한 촬영 박스를 만들어 사진 조건을 통일한다."],
    protocol: [
      "식물 시료를 같은 질량으로 잘라 물과 50% 에탄올로 각각 같은 시간 추출하고 거른다.",
      "pH 1~13 용액을 1 단위 간격으로 준비하고 pH 미터로 확인한다.",
      "각 용액 5mL에 추출액 1mL를 넣어 색을 관찰하고 촬영 박스에서 사진을 찍는다.",
      "사진에서 같은 위치의 RGB 값을 읽어 색상(Hue) 값으로 변환한다.",
      "같은 방법으로 페놀프탈레인·BTB 등 시판 지시약과 비교한다.",
      "추출액을 실온·냉장에 보관하며 1주일간 색 안정성을 확인한다."
    ],
    analysis: "pH-색상값 그래프에서 기울기가 급한 구간을 변색 범위로 정의하고, 식물별·용매별로 비교한다. 반복 측정 표준편차를 함께 표시한다.",
    expected: "대부분의 안토시아닌은 산성에서 붉은색, 중성 부근에서 보라색, 염기성에서 청록~노란색으로 변하며, 적양배추가 가장 넓은 pH 범위에서 단계적인 색 변화를 보일 것으로 예상된다. 강염기에서는 색소가 분해되어 시간이 지나며 색이 바랠 수 있다.",
    extension: "추출액을 녹말·한천 필름에 고정해 생선·우유의 부패 정도를 표시하는 신선도 지시 필름을 만든다.",
    safety: "강산·강염기 취급 시 보안경·장갑 착용, 희석은 교사 지도하에 한다.",
    record: "천연 색소의 화학적 성질에 관심을 갖고 여러 식물에서 안토시아닌을 추출하여 pH에 따른 색 변화를 비교함. 사진의 RGB 값을 색상값으로 변환하여 변색 범위를 정량적으로 정의하는 방법을 고안하였고, 분자 구조 변화로 색 변화를 설명함.",
    careerLink: "약학·화학(산염기 평형), 식품공학(스마트 포장)으로 연결된다.",
    searchTerms: ["안토시아닌 pH 지시약 색 변화", "anthocyanin pH indicator film food freshness", "천연 지시약 적양배추 변색 범위"]
  },
  {
    id: "catalase",
    methods: ["실험"],
    title: "온도와 pH에 따른 감자 카탈레이스의 과산화수소 분해 활성",
    subjects: ["생명과학", "화학"],
    keywords: ["효소", "카탈레이스", "과산화수소", "단백질", "변성", "온도", "pH", "세포", "생화학", "반응속도"],
    careers: ["의사", "생명과학자", "약사", "생명공학자", "간호사"],
    majors: ["의예과", "생명과학과", "약학과", "생명공학과", "생화학과", "간호학과"],
    level: "기초", budget: 15000, duration: "4주 이내",
    summary: "감자(또는 간) 추출액의 카탈레이스가 과산화수소를 분해할 때 발생하는 산소의 부피를 수상 치환으로 측정하여 온도·pH에 따른 효소 활성을 비교한다.",
    trend: "효소의 열 안정성과 최적 조건은 산업용 효소 공학과 의약품 개발의 핵심 주제이며, 식물 유래 효소를 이용한 친환경 공정 연구가 이어지고 있다.",
    question: "카탈레이스의 반응 속도는 온도와 pH에 따라 어떻게 달라지며, 최적 조건은 무엇인가?",
    hypothesis: "반응 속도는 약 35~40℃, 중성 pH 부근에서 최대이고, 고온·강산·강염기에서는 효소 변성으로 급격히 감소할 것이다.",
    variables: { independent: "온도(0~70℃), pH(3~11)", dependent: "초기 1분간 산소 발생량(mL)", controlled: "효소 추출액 양, 과산화수소 농도·부피, 반응 용기" },
    materials: [
      { item: "감자, 강판, 거즈", note: "약 3,000원" },
      { item: "3% 과산화수소수", note: "약 3,000원" },
      { item: "완충 용액(pH 3~11)", note: "학교 보유" },
      { item: "삼각 플라스크, 고무마개, 유리관, 눈금 실린더, 수조", note: "학교 보유" },
      { item: "항온 수조 또는 온도계와 온수", note: "학교 보유" },
      { item: "초시계(스마트폰)", note: "보유품" }
    ],
    circuit: ["삼각 플라스크 → 고무관 → 물을 채워 거꾸로 세운 눈금 실린더(수상 치환 장치)"],
    protocol: [
      "감자를 갈아 거즈로 거른 추출액을 만들고 냉장 보관한다(실험 당일 제조).",
      "추출액 2mL와 완충 용액 5mL를 플라스크에 넣고 정해진 온도에서 5분간 둔다.",
      "과산화수소수 5mL를 넣고 즉시 마개를 닫아 10초 간격으로 산소 부피를 읽는다.",
      "온도 6단계와 pH 5단계를 각 3회 반복한다.",
      "끓인 추출액(변성 효소)으로 대조 실험을 한다."
    ],
    analysis: "시간-산소 부피 그래프의 초기 기울기를 반응 속도로 정의하고, 온도·pH별 반응 속도 곡선을 그려 최적 조건을 찾는다.",
    expected: "온도-반응 속도 곡선과 pH-반응 속도 곡선 모두 종 모양으로 나타나고, 끓인 추출액에서는 산소가 거의 발생하지 않을 것으로 예상된다.",
    extension: "효소 농도·기질 농도를 바꾸어 미카엘리스-멘텐 상수를 추정하거나, 여러 채소의 카탈레이스 활성을 비교한다.",
    safety: "과산화수소가 피부·눈에 닿지 않게 보안경 착용. 뜨거운 물 취급 주의.",
    record: "효소의 구조와 기능의 관계를 확인하고자 감자 카탈레이스의 활성을 수상 치환법으로 측정함. 초기 반응 속도를 기울기로 정의해 온도·pH에 따른 활성 곡선을 그렸으며, 끓인 추출액 대조 실험으로 단백질 변성의 영향을 명확히 보임.",
    careerLink: "의학·약학(효소와 대사), 생명공학(산업 효소)으로 연결된다.",
    searchTerms: ["감자 카탈레이스 온도 pH 활성", "catalase activity temperature pH potato", "효소 반응 속도 수상치환"]
  },
  {
    id: "coffee-carbon",
    methods: ["실험"],
    title: "활성화 조건에 따른 커피 찌꺼기 활성탄의 메틸렌블루 흡착 성능",
    subjects: ["화학", "지구과학"],
    keywords: ["흡착", "활성탄", "커피 찌꺼기", "폐기물", "자원순환", "수처리", "염료", "환경", "업사이클링"],
    careers: ["환경공학자", "화학공학자", "신소재공학자", "수처리"],
    majors: ["환경공학과", "화학공학과", "신소재공학과", "화학과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "커피 찌꺼기를 탄화·화학 활성화하여 활성탄을 만들고, 활성화 조건에 따라 염료(메틸렌블루) 흡착량이 어떻게 달라지는지 비색법으로 비교한다.",
    trend: "커피 찌꺼기 등 바이오매스 폐기물을 흡착제로 재활용하는 연구가 많으며, 국내에서도 커피박 재활용 정책 관련 뉴스가 이어지고 있다.",
    question: "탄화 온도와 활성화제 처리 여부에 따라 커피 찌꺼기 활성탄의 염료 흡착 성능은 어떻게 달라지는가?",
    hypothesis: "활성화제로 처리한 시료는 기공이 더 발달해 처리하지 않은 시료보다 흡착량이 클 것이다.",
    variables: { independent: "활성화제 처리(없음·베이킹소다·구연산), 탄화 시간", dependent: "메틸렌블루 제거율(%), 흡착량(mg/g)", controlled: "흡착제 질량, 염료 초기 농도·부피, 접촉 시간, 온도" },
    materials: [
      { item: "커피 찌꺼기(카페에서 수거·건조)", note: "무료" },
      { item: "메틸렌블루", note: "약 8,000원" },
      { item: "탄산수소나트륨, 구연산", note: "약 5,000원" },
      { item: "도가니, 전기로 또는 가스버너(교사 지도)", note: "학교 보유" },
      { item: "거름종이, 깔때기, 비커, 전자저울", note: "학교 보유" },
      { item: "시판 활성탄(비교용)", note: "약 6,000원" }
    ],
    circuit: ["색 측정: 흰 배경 촬영 박스 + 스마트폰 사진의 RGB 값, 또는 학교 분광광도계(664nm 부근)"],
    protocol: [
      "커피 찌꺼기를 충분히 건조하고 활성화제 용액에 24시간 담근 뒤 다시 건조한다.",
      "도가니에 담아 산소를 차단한 상태로 탄화한다(교사 지도, 환기 필수).",
      "증류수로 세척·건조하여 입자 크기를 체로 맞춘다.",
      "농도를 아는 메틸렌블루 표준 용액으로 검량선을 만든다.",
      "흡착제 0.1g을 염료 용액 50mL에 넣고 시간별로 거른 뒤 농도를 측정한다.",
      "시판 활성탄과 같은 조건으로 비교한다(각 3회 반복)."
    ],
    analysis: "제거율과 단위 질량당 흡착량을 계산하고, 시간별 흡착 곡선을 비교한다. 심화로 랭뮤어·프로인들리히 흡착 등온식에 적용한다.",
    expected: "활성화 처리한 시료가 처리하지 않은 시료보다 흡착량이 크고, 시판 활성탄보다는 다소 낮지만 의미 있는 제거율을 보일 것으로 예상된다.",
    extension: "중금속 이온(구리 이온 등) 흡착이나 정수 필터 시제품 제작으로 확장한다.",
    safety: "탄화 과정의 연기·화재 위험 — 반드시 교사 지도와 환기. 고온 도가니 취급 주의.",
    record: "커피 찌꺼기의 자원화 가능성에 주목하여 활성화 조건을 달리한 활성탄을 제조하고 염료 흡착 성능을 비교함. 비색법으로 검량선을 작성해 농도를 정량하고 흡착 등온식에 적용하는 등 환경 문제를 화학적으로 해결하려는 태도를 보임.",
    careerLink: "환경공학(수처리), 화학공학(흡착 공정), 자원순환 분야로 연결된다.",
    searchTerms: ["커피 찌꺼기 활성탄 메틸렌블루 흡착", "spent coffee grounds activated carbon adsorption", "흡착 등온식 랭뮤어 고등학생"]
  },
  {
    id: "plant-antibacterial",
    methods: ["실험"],
    title: "마늘·생강·녹차 추출물의 미생물 생육 억제 효과",
    subjects: ["생명과학", "화학"],
    keywords: ["항균", "미생물", "세균", "천연물", "추출물", "식품 보존", "감염", "항생제", "의약"],
    careers: ["의사", "약사", "미생물학자", "식품연구원", "간호사", "제약"],
    majors: ["의예과", "약학과", "미생물학과", "식품공학과", "생명공학과", "임상병리학과"],
    level: "중급", budget: 40000, duration: "1~2개월",
    summary: "식물 추출물을 적신 종이 디스크를 미생물 배지에 올려 생육 억제 영역(투명대)의 크기를 측정하고, 농도와 추출 방법에 따른 항균 효과를 비교한다.",
    trend: "항생제 내성 문제로 식물 유래 천연 항균 물질과 천연 식품 보존제 연구가 꾸준히 증가하고 있다.",
    question: "식물 종류와 추출 농도에 따라 미생물의 생육 억제 영역 크기는 어떻게 달라지는가?",
    hypothesis: "알리신을 함유한 마늘 추출물이 가장 큰 억제 영역을 보이고, 농도가 높을수록 억제 영역이 커질 것이다.",
    variables: { independent: "식물 종류, 추출물 농도, 추출 용매", dependent: "생육 억제 영역 지름(mm)", controlled: "미생물 접종량, 배지 두께, 배양 온도·시간, 디스크 크기" },
    materials: [
      { item: "마늘, 생강, 녹차 잎", note: "약 6,000원" },
      { item: "학교 실험용 비병원성 균주(고초균·효모 등) 또는 교사가 준비한 BSL1 균주", note: "학교·교육청 지원" },
      { item: "LB 배지 또는 영양 한천, 페트리 접시", note: "약 20,000원" },
      { item: "종이 디스크(거름종이 펀칭), 핀셋, 알코올램프", note: "약 3,000원" },
      { item: "인큐베이터 또는 30℃ 보온 상자, 캘리퍼스", note: "학교 보유" }
    ],
    circuit: ["무균 작업: 알코올램프 주변(또는 클린벤치)에서 배지 분주·접종·디스크 배치"],
    protocol: [
      "식물을 같은 질량으로 갈아 증류수·에탄올로 추출하고 여과하여 100%, 50%, 25% 농도로 희석한다.",
      "배지를 멸균하여 페트리 접시에 붓고 굳힌다.",
      "균 배양액을 일정량 고르게 도말한다.",
      "추출물에 적신 디스크와 증류수(음성 대조), 시판 소독제(양성 대조) 디스크를 올린다.",
      "30℃에서 24~48시간 배양 후 억제 영역 지름을 측정한다(조건당 3장 이상).",
      "사용한 배지는 고압 멸균 후 폐기한다."
    ],
    analysis: "조건별 억제 영역 평균과 표준편차를 비교하고, 농도-억제 영역 관계를 그래프로 나타낸다. 분산분석으로 식물 간 차이의 유의성을 확인한다.",
    expected: "마늘 추출물에서 가장 뚜렷한 억제 영역이 나타나고 농도에 따라 커지며, 녹차는 상대적으로 약한 효과를 보일 것으로 예상된다. 가열 추출 시 일부 활성 성분이 분해되어 효과가 줄어들 수 있다.",
    extension: "최소 억제 농도(MIC) 측정, 추출물을 이용한 천연 식품 보존제(두부·빵 보관 기간) 실험으로 확장한다.",
    safety: "반드시 교사가 지정한 비병원성 균주만 사용. 환경에서 채취한 미지의 균은 배양하지 않는다. 배양 접시는 열지 말고 멸균 후 폐기.",
    record: "항생제 내성 문제에 관심을 갖고 식물 추출물의 항균 효과를 디스크 확산법으로 비교함. 음성·양성 대조군을 설정하고 무균 조작과 폐기 절차를 철저히 지켰으며, 농도에 따른 억제 영역 변화를 통계적으로 분석하여 천연 항균 물질의 가능성과 한계를 논의함.",
    careerLink: "의학·약학(감염과 항균제), 미생물학, 식품공학(천연 보존제)으로 연결된다.",
    searchTerms: ["마늘 추출물 항균 디스크 확산법", "plant extract antibacterial disk diffusion garlic ginger", "천연 항균제 식품 보존"]
  },

  /* ===================== 데이터 분석 중심 주제 ===================== */
  {
    id: "heatwave-trend",
    methods: ["데이터 분석"],
    codeLang: "python",
    title: "최근 50년간 우리 지역의 폭염일수와 열대야 일수 변화 추세",
    subjects: ["지구과학", "정보"],
    keywords: ["기후변화", "폭염", "열대야", "기온", "기상", "데이터", "공공데이터", "통계", "추세", "파이썬"],
    careers: ["기후과학자", "기상", "데이터 분석가", "환경", "도시계획가", "보건"],
    majors: ["대기과학과", "지구환경과학과", "통계학과", "데이터사이언스학과", "환경공학과"],
    level: "기초", budget: 0, duration: "1~2개월",
    summary: "기상청 관측 자료를 내려받아 지역별 폭염일수·열대야 일수의 장기 추세를 분석하고, 도시화 정도가 다른 지역끼리 비교한다.",
    trend: "기후변화로 폭염·열대야가 늘고 있다는 보도가 매년 나오며, 도시 열섬이 지역 간 차이를 키운다는 연구가 이어지고 있다.",
    question: "우리 지역의 폭염일수와 열대야 일수는 지난 수십 년간 얼마나 증가했으며, 대도시와 중소도시 사이에 차이가 있는가?",
    hypothesis: "두 지표 모두 증가하는 추세이며, 도시화가 많이 진행된 지역일수록 열대야 증가 폭이 더 클 것이다.",
    variables: { independent: "연도, 관측 지점(도시화 정도)", dependent: "연간 폭염일수(일 최고기온 33℃ 이상), 열대야 일수", controlled: "관측 기준, 분석 기간, 결측값 처리 방법" },
    materials: [
      { item: "기상자료개방포털 종관기상관측(ASOS) 일자료", note: "무료" },
      { item: "PC, 파이썬(pandas, matplotlib, scipy) 또는 엑셀", note: "무료" }
    ],
    dataSources: [
      { name: "기상청 기상자료개방포털", url: "https://data.kma.go.kr/", note: "종관기상관측(ASOS) 일자료 — 지점별 최고·최저기온" },
      { name: "공공데이터포털", url: "https://www.data.go.kr/", note: "지역별 인구·토지이용 자료(도시화 지표)" }
    ],
    circuit: [],
    code: `import pandas as pd
import matplotlib.pyplot as plt
from scipy import stats

plt.rcParams['font.family'] = 'Malgun Gothic'   # 한글 글꼴(맥은 AppleGothic)

# 기상자료개방포털에서 내려받은 ASOS 일자료 CSV (열 이름은 파일에 맞게 수정)
df = pd.read_csv('asos_daily.csv', encoding='cp949')
df['일시'] = pd.to_datetime(df['일시'])
df['연도'] = df['일시'].dt.year
years = range(df['연도'].min(), df['연도'].max() + 1)

heat = df[df['최고기온(°C)'] >= 33].groupby('연도').size().reindex(years, fill_value=0)
night = df[df['최저기온(°C)'] >= 25].groupby('연도').size().reindex(years, fill_value=0)  # 열대야 근사

for name, s in [('폭염일수', heat), ('열대야일수', night)]:
    r = stats.linregress(list(s.index), s.values)
    print(f'{name}: {r.slope * 10:.2f}일/10년, p = {r.pvalue:.4f}')

heat.plot(marker='o', label='폭염일수')
night.plot(marker='s', label='열대야일수')
plt.xlabel('연도'); plt.ylabel('일수'); plt.legend(); plt.show()`,
    protocol: [
      "분석할 관측 지점을 대도시 2곳, 중소도시 2곳 이상 선정한다(관측 기간이 긴 지점).",
      "기상자료개방포털에서 1973년 이후 일자료를 내려받는다.",
      "결측값을 확인하고, 결측이 많은 연도는 분석에서 제외하는 기준을 정한다.",
      "연도별 폭염일수·열대야 일수를 계산한다(열대야는 일 최저기온 25℃ 이상으로 근사함을 명시).",
      "선형 회귀로 10년당 증가율과 유의확률을 구하고 지점 간 비교한다.",
      "지점별 인구·시가지 면적 변화와 증가율의 관계를 살펴본다."
    ],
    analysis: "선형 회귀 기울기(일/10년)와 p값, 10년 이동평균, 지점 간 증가율 비교, 도시화 지표와의 상관 분석.",
    expected: "대부분의 지점에서 폭염일수와 열대야 일수가 통계적으로 유의하게 증가하며, 대도시의 열대야 증가 폭이 더 크게 나타날 것으로 예상된다. 관측소 이전 등 자료의 불연속성이 오차 요인이 될 수 있다.",
    extension: "온열질환자 수(질병관리청 자료)나 전력 사용량과의 관계 분석, 기후 시나리오 자료로 미래 예측.",
    safety: "공공 데이터의 출처와 이용 조건을 보고서에 밝힌다.",
    record: "기후변화를 우리 지역의 자료로 확인하고자 기상청 장기 관측 자료를 파이썬으로 처리하여 폭염일수와 열대야 일수의 추세를 분석함. 결측값 처리 기준을 세우고 회귀분석의 유의성을 검토하였으며, 도시화 정도에 따른 지역 차이를 열섬 효과로 해석하는 등 데이터 기반 과학적 추론 역량을 보임.",
    careerLink: "대기과학·기후(기후변화 분석), 통계·데이터과학, 도시계획(폭염 대응)으로 연결된다.",
    searchTerms: ["폭염일수 열대야 장기 추세 도시화", "heatwave tropical night trend Korea urbanization", "기상자료개방포털 ASOS 분석"]
  },
  {
    id: "earthquake-gr",
    methods: ["데이터 분석"],
    codeLang: "python",
    title: "한반도 지진의 규모별 발생 빈도와 구텐베르크-리히터 법칙",
    subjects: ["지구과학", "정보", "물리"],
    keywords: ["지진", "규모", "통계", "지질", "재난", "데이터", "공공데이터", "파이썬", "멱법칙"],
    careers: ["지질학자", "지진학자", "재난안전", "데이터 분석가", "토목공학자"],
    majors: ["지질학과", "지구시스템과학과", "지구환경과학과", "방재안전학과", "통계학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "기상청 국내 지진 목록을 이용해 규모별 누적 발생 빈도를 구하고 구텐베르크-리히터 법칙의 b값을 산출하여 지역·시기별로 비교한다.",
    trend: "경주·포항 지진 이후 한반도 지진 활동 분석과 b값 변화를 이용한 지진 위험도 평가 연구가 활발하다.",
    question: "한반도 지진의 규모-빈도 관계는 구텐베르크-리히터 법칙을 따르며, 지역(경상권·수도권 등)이나 큰 지진 전후에 b값이 달라지는가?",
    hypothesis: "규모-누적빈도는 로그 선형 관계를 보이며, 큰 지진 직후 여진 기간에는 b값이 일시적으로 달라질 것이다.",
    variables: { independent: "지역, 기간(큰 지진 전·후)", dependent: "b값, a값", controlled: "최소 완전 규모(Mc), 분석 방법" },
    materials: [
      { item: "기상청 국내 지진 목록", note: "무료" },
      { item: "PC, 파이썬(pandas, numpy, matplotlib)", note: "무료" }
    ],
    dataSources: [
      { name: "기상청 날씨누리 — 국내지진 조회", url: "https://www.weather.go.kr/w/eqk-vol/search/korea.do", note: "발생 시각, 규모, 위·경도" },
      { name: "기상청 기상자료개방포털", url: "https://data.kma.go.kr/", note: "지진 관측 자료" }
    ],
    circuit: [],
    code: `import pandas as pd, numpy as np
import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'Malgun Gothic'

# 기상청 국내지진 목록(엑셀). 위쪽 설명 행이 있으면 skiprows로 건너뛰기
df = pd.read_excel('earthquake_list.xlsx')
M = df['규모'].dropna().astype(float)

Mc = 2.0                                # 최소 완전 규모(자료에 맞게 결정)
bins = np.arange(Mc, M.max() + 0.1, 0.1)
N = np.array([(M >= m).sum() for m in bins])
ok = N > 0
slope, a = np.polyfit(bins[ok], np.log10(N[ok]), 1)
print(f'b값 = {-slope:.2f}, a값 = {a:.2f}')

# 최대우도 추정(Aki 공식)으로도 비교
b_ml = np.log10(np.e) / (M[M >= Mc].mean() - (Mc - 0.05))
print(f'최대우도 b값 = {b_ml:.2f}')

plt.semilogy(bins, N, 'o')
plt.plot(bins, 10 ** (a + slope * bins))
plt.xlabel('규모'); plt.ylabel('누적 발생 횟수'); plt.show()`,
    protocol: [
      "기상청에서 1978년 이후 국내 지진 목록을 내려받는다.",
      "규모별 빈도 분포에서 기록이 빠지기 시작하는 규모(최소 완전 규모 Mc)를 정한다.",
      "전체 자료로 규모-누적빈도 그래프를 그리고 b값을 구한다(회귀법·최대우도법 비교).",
      "위·경도로 지역을 나누어 b값을 비교한다.",
      "2016 경주, 2017 포항 지진 전후 기간을 나누어 b값 변화를 비교한다.",
      "자료 개수에 따른 b값의 불확도(표준오차)를 함께 제시한다."
    ],
    analysis: "로그 누적빈도-규모 선형 회귀, 최대우도 b값과 표준오차(b/√N), 지역·기간별 비교.",
    expected: "한반도 지진은 대체로 b값이 1 부근인 로그 선형 관계를 보이며, 큰 지진 직후에는 작은 여진이 많아져 b값이 달라질 수 있다. 자료 수가 적은 구간은 불확도가 크다는 점을 결론에 밝혀야 한다.",
    extension: "지진 발생 위치를 지도에 시각화하고 단층 분포와 비교하거나, 여진 감소 법칙(오모리 법칙)을 분석한다.",
    safety: "공공 데이터 출처를 명시한다.",
    record: "지진 발생의 통계적 규칙성에 관심을 갖고 기상청 지진 목록을 분석하여 구텐베르크-리히터 법칙의 b값을 산출함. 최소 완전 규모를 설정하고 회귀법과 최대우도법을 비교하였으며, 큰 지진 전후의 b값 변화를 불확도와 함께 제시하는 신중한 해석 태도를 보임.",
    careerLink: "지질·지진학(지진 위험도 평가), 방재, 통계 분석으로 연결된다.",
    searchTerms: ["한반도 지진 b값 구텐베르크 리히터", "Gutenberg-Richter b-value Korea earthquake", "포항 지진 b값 변화"]
  },
  {
    id: "spike-sequence",
    methods: ["데이터 분석"],
    codeLang: "python",
    title: "코로나19 바이러스 변이주의 스파이크 단백질 아미노산 서열 비교",
    subjects: ["생명과학", "정보"],
    keywords: ["생물정보학", "유전체", "서열", "단백질", "바이러스", "변이", "감염병", "계통수", "유전", "의료", "데이터"],
    careers: ["의사", "생명과학자", "약사", "생물정보학자", "의과학자", "바이오 데이터 분석가"],
    majors: ["의예과", "생명과학과", "약학과", "생명공학과", "생물정보학과", "컴퓨터공학과"],
    level: "심화", budget: 0, duration: "1~2개월",
    summary: "NCBI에 공개된 코로나19 바이러스 변이주들의 스파이크 단백질 서열을 내려받아 정렬하고, 기준 서열 대비 아미노산 치환 위치와 계통 관계를 분석한다.",
    trend: "공개 유전체 데이터베이스와 생물정보학 도구를 이용한 바이러스 변이 추적은 감염병 대응의 핵심 연구 방법으로 자리 잡았다.",
    question: "주요 변이주에서 스파이크 단백질의 아미노산 치환은 어느 영역(수용체 결합 부위 등)에 집중되어 있으며, 서열 유사도로 본 계통 관계는 어떠한가?",
    hypothesis: "후기 변이주일수록 기준 서열과의 차이가 크고, 치환은 수용체 결합 영역(RBD)에 집중될 것이다.",
    variables: { independent: "변이주 종류", dependent: "서열 일치율(%), 치환 위치와 개수", controlled: "기준 서열, 정렬 알고리즘과 매개변수" },
    materials: [
      { item: "NCBI Virus 공개 서열", note: "무료" },
      { item: "PC, 파이썬(Biopython 1.80 이상) 또는 MEGA 프로그램", note: "무료" }
    ],
    dataSources: [
      { name: "NCBI Virus", url: "https://www.ncbi.nlm.nih.gov/labs/virus/", note: "SARS-CoV-2 스파이크(S) 단백질 서열 FASTA" },
      { name: "NCBI BLAST", url: "https://blast.ncbi.nlm.nih.gov/", note: "서열 유사도 검색" }
    ],
    circuit: [],
    code: `from Bio import SeqIO, Align
from Bio.Align import substitution_matrices

records = list(SeqIO.parse('spike_protein.fasta', 'fasta'))   # 첫 서열을 기준 서열로
ref = records[0]

aligner = Align.PairwiseAligner(mode='global')
aligner.substitution_matrix = substitution_matrices.load('BLOSUM62')
aligner.open_gap_score, aligner.extend_gap_score = -10, -0.5

for rec in records[1:]:
    aln = aligner.align(ref.seq, rec.seq)[0]
    c = aln.counts()
    identity = c.identities / len(ref.seq) * 100
    # 치환 위치 목록 (기준 서열 번호 기준)
    subs = []
    for (r0, r1), (q0, q1) in zip(*aln.aligned):
        for i, j in zip(range(r0, r1), range(q0, q1)):
            if ref.seq[i] != rec.seq[j]:
                subs.append(f'{ref.seq[i]}{i + 1}{rec.seq[j]}')
    print(f'{rec.id}: 일치율 {identity:.2f}%, 치환 {len(subs)}개 — {", ".join(subs[:15])}')`,
    protocol: [
      "NCBI Virus에서 기준 서열(우한 분리주)과 주요 변이주들의 스파이크 단백질 서열을 FASTA로 내려받는다.",
      "Biopython 또는 MEGA로 서열을 정렬한다.",
      "기준 서열 대비 일치율과 아미노산 치환 위치를 정리한다.",
      "치환 위치를 스파이크 단백질의 영역(신호 펩타이드, NTD, RBD, S2 등)별로 분류한다.",
      "MEGA로 계통수를 그리고 시간 순서와 비교한다.",
      "치환이 많은 위치의 기능을 문헌으로 조사한다."
    ],
    analysis: "영역별 치환 개수(단위 길이당), 일치율 비교 표, 계통수 해석, 문헌과의 비교.",
    expected: "후기 변이주일수록 치환이 많고, 특히 RBD와 NTD에 치환이 집중되는 경향이 나타날 것으로 예상된다. 서열 분석만으로는 기능 변화를 단정할 수 없다는 한계를 함께 논의해야 한다.",
    extension: "단백질 구조 데이터베이스(PDB)와 구조 시각화 도구로 치환 위치를 3차원으로 표시하거나, 인플루엔자 등 다른 바이러스와 변이 속도를 비교한다.",
    safety: "공개 데이터만 사용하며, 분석 결과를 의학적 판단으로 확대 해석하지 않는다.",
    record: "감염병 변이에 관심을 갖고 공개 유전체 데이터베이스에서 스파이크 단백질 서열을 수집하여 Biopython으로 정렬·비교함. 기준 서열 대비 치환 위치를 단백질 영역별로 분류하고 계통수를 작성하여 변이의 집중 경향을 설명하였으며, 서열 분석의 한계를 함께 논의하는 균형 잡힌 시각을 보임.",
    careerLink: "의학·약학(감염병, 백신), 생물정보학으로 연결된다.",
    searchTerms: ["스파이크 단백질 변이 서열 비교", "SARS-CoV-2 spike mutation RBD variant alignment", "생물정보학 고등학생 Biopython"]
  },
  {
    id: "exoplanet-mr",
    methods: ["데이터 분석"],
    codeLang: "python",
    title: "외계행성의 질량-반지름 관계와 거주 가능 영역 행성의 특징",
    subjects: ["지구과학", "물리", "정보"],
    keywords: ["외계행성", "천문", "우주", "행성", "거주가능영역", "데이터", "NASA", "파이썬", "통계"],
    careers: ["천문학자", "우주과학자", "항공우주공학자", "데이터 분석가", "물리학자"],
    majors: ["천문우주학과", "물리학과", "지구과학교육과", "항공우주공학과", "데이터사이언스학과"],
    level: "중급", budget: 0, duration: "1~2개월",
    summary: "NASA 외계행성 아카이브의 공개 자료로 행성의 질량-반지름 관계를 분석해 암석형·가스형 행성의 경계를 찾고, 거주 가능 영역에 있는 행성들의 특징을 정리한다.",
    trend: "트랜싯·시선속도 관측으로 확인된 외계행성이 크게 늘면서, 질량-반지름 관계로 행성 구성 성분을 추정하는 연구와 거주 가능 행성 탐색이 활발하다.",
    question: "외계행성의 질량과 반지름 사이에는 어떤 관계가 있으며, 어느 질량에서 암석형과 가스형 행성이 구분되는가?",
    hypothesis: "작은 행성은 반지름이 질량의 약 1/3~1/4제곱에 비례하는 암석형 관계를 보이다가, 일정 질량 이상에서 기울기가 바뀔 것이다.",
    variables: { independent: "행성 질량, 중심별 온도, 입사 복사량", dependent: "행성 반지름, 거주 가능 영역 포함 여부", controlled: "자료 선택 기준(질량·반지름 모두 측정된 행성)" },
    materials: [
      { item: "NASA Exoplanet Archive 자료(PSCompPars)", note: "무료" },
      { item: "PC, 파이썬(pandas, numpy, matplotlib)", note: "무료" }
    ],
    dataSources: [
      { name: "NASA Exoplanet Archive", url: "https://exoplanetarchive.ipac.caltech.edu/", note: "Planetary Systems Composite Data — pl_rade, pl_bmasse, pl_insol 등" }
    ],
    circuit: [],
    code: `import pandas as pd, numpy as np
import matplotlib.pyplot as plt
plt.rcParams['font.family'] = 'Malgun Gothic'

df = pd.read_csv('PSCompPars.csv', comment='#')
d = df.dropna(subset=['pl_rade', 'pl_bmasse'])   # 반지름(지구=1), 질량(지구=1)

# 질량 구간별 기울기 비교 (log R = k log M + c)
for lo, hi in [(0.1, 5), (5, 100), (100, 5000)]:
    s = d[(d['pl_bmasse'] >= lo) & (d['pl_bmasse'] < hi)]
    k, c = np.polyfit(np.log10(s['pl_bmasse']), np.log10(s['pl_rade']), 1)
    print(f'{lo}~{hi} 지구질량: R ∝ M^{k:.2f} (행성 {len(s)}개)')

# 거주 가능 영역 근사: 입사 복사량이 지구의 0.36~1.1배
hz = d[(d['pl_insol'] > 0.36) & (d['pl_insol'] < 1.1)]
print('거주 가능 영역 후보:', len(hz))

plt.loglog(d['pl_bmasse'], d['pl_rade'], '.', alpha=0.4, label='전체')
plt.loglog(hz['pl_bmasse'], hz['pl_rade'], 'o', mfc='none', label='거주 가능 영역')
plt.xlabel('질량 (지구=1)'); plt.ylabel('반지름 (지구=1)'); plt.legend(); plt.show()`,
    protocol: [
      "NASA Exoplanet Archive에서 Planetary Systems Composite Data를 CSV로 내려받는다.",
      "질량과 반지름이 모두 측정된 행성만 골라낸다(측정 오차가 큰 자료 처리 기준 설정).",
      "로그-로그 그래프로 질량-반지름 관계를 그리고 구간별 기울기를 구한다.",
      "기울기가 바뀌는 지점(전환 질량)을 찾고 태양계 행성과 비교한다.",
      "입사 복사량 기준으로 거주 가능 영역 행성을 분류하고 질량·반지름·중심별 특성을 정리한다."
    ],
    analysis: "구간별 로그 선형 회귀, 전환 질량 추정, 거주 가능 영역 행성의 분포 비교, 관측 방법에 따른 선택 편향 논의.",
    expected: "약 수 지구질량 이하에서는 암석형 관계, 그 이상에서는 반지름이 빠르게 커지는 가스형 관계, 목성 질량 이상에서는 반지름이 거의 일정해지는 구간이 나타날 것으로 예상된다. 관측 방법의 선택 편향이 해석에 영향을 줄 수 있다.",
    extension: "행성 밀도로 구성 성분(철·암석·물·가스)을 추정하거나, 관측 방법별(트랜싯·시선속도) 발견 행성 분포의 차이를 분석한다.",
    safety: "공공 데이터 출처를 명시한다.",
    record: "외계행성의 다양성에 관심을 갖고 NASA 공개 자료를 파이썬으로 분석하여 질량-반지름 관계의 구간별 기울기를 산출함. 기울기 변화로 암석형과 가스형 행성의 경계를 추정하고 태양계 행성과 비교하였으며, 관측 방법에 따른 선택 편향을 고려하는 비판적 사고를 보임.",
    careerLink: "천문우주(행성과학), 물리학, 데이터과학으로 연결된다.",
    searchTerms: ["외계행성 질량 반지름 관계", "exoplanet mass radius relation transition", "NASA exoplanet archive 분석 고등학생"]
  },

  /* ===================== 첨단 기자재 활용 주제 ===================== */
  {
    id: "vitc-uvvis",
    methods: ["첨단 기자재 활용", "실험"],
    title: "조리 방법에 따른 채소 속 비타민 C 함량 변화",
    subjects: ["화학", "생명과학"],
    keywords: ["비타민", "비타민 C", "영양", "식품", "조리", "산화", "분광", "흡광도", "건강"],
    careers: ["식품연구원", "영양사", "약사", "화학자", "의사"],
    majors: ["식품영양학과", "식품공학과", "약학과", "화학과", "의예과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "UV-Vis 분광광도계와 DCPIP(인도페놀) 환원 반응을 이용해 데치기·찌기·전자레인지·볶기 조리 후 채소의 비타민 C 잔존율을 정량 비교한다.",
    trend: "조리·가공 방법에 따른 영양소 손실을 줄이는 연구와 간편식의 영양 품질 평가가 식품 분야에서 꾸준히 다뤄진다.",
    question: "조리 방법과 시간에 따라 브로콜리·시금치의 비타민 C 잔존율은 어떻게 달라지는가?",
    hypothesis: "물에 직접 닿는 데치기에서 손실이 가장 크고, 짧은 시간의 전자레인지·찌기 조리에서 손실이 가장 적을 것이다.",
    variables: { independent: "조리 방법, 조리 시간", dependent: "비타민 C 함량(mg/100g), 잔존율(%)", controlled: "채소 품종·부위·질량, 추출 방법, 측정 시간" },
    materials: [
      { item: "UV-Vis 분광광도계", note: "학교 보유 또는 지역 과학교육원·대학 공동실험실 이용" },
      { item: "아스코르브산(표준 물질), DCPIP, 메타인산", note: "약 25,000원" },
      { item: "브로콜리, 시금치", note: "약 5,000원" },
      { item: "마이크로피펫, 원심분리기 또는 거름종이", note: "학교 보유" }
    ],
    access: "학교에 UV-Vis 분광광도계가 없으면 시·도 교육청 과학교육원(과학원), 과학중점학교·거점학교 공동실험실, 지역 대학의 고교-대학 연계 프로그램을 통해 이용할 수 있다. 장비 예약과 사용 교육을 미리 받는다. 장비가 없을 때는 DCPIP 적정법으로 대체할 수 있다.",
    circuit: ["분광광도계 측정 파장: DCPIP 최대 흡수 파장(약 520nm 부근, 장비로 확인)", "큐벳: 1cm 플라스틱 큐벳, 매 측정 전 바탕 용액으로 영점 보정"],
    protocol: [
      "아스코르브산 표준 용액(0~50 mg/L)으로 DCPIP 흡광도 감소량의 검량선을 만든다.",
      "채소를 같은 질량으로 나누어 생채소와 조리 방법별(데치기·찌기·전자레인지·볶기) 시료를 만든다.",
      "메타인산 용액에서 갈아 추출하고 원심분리(또는 여과)한다.",
      "추출액을 DCPIP와 반응시켜 흡광도를 측정한다(각 3회).",
      "검량선으로 비타민 C 함량을 계산하고 생채소 대비 잔존율을 구한다.",
      "조리 시간을 1·3·5분으로 바꾸어 시간에 따른 감소 곡선을 얻는다."
    ],
    analysis: "검량선 선형 회귀(R²), 조리 방법별 잔존율 비교와 분산분석, 시간-잔존율 그래프로 1차 반응 속도 상수 추정.",
    expected: "데치기는 물로 용출되어 잔존율이 가장 낮고, 전자레인지·찌기는 상대적으로 높게 유지될 것으로 예상된다. 조리 시간이 길어질수록 지수적으로 감소할 것이다.",
    extension: "조리수 속 비타민 C를 측정해 '분해'와 '용출'을 구분하거나, 보관 온도·시간에 따른 손실을 분석한다.",
    safety: "시약 취급 시 보안경·장갑 착용. 분광광도계는 교육받은 뒤 사용하고 큐벳 외부를 깨끗이 닦는다.",
    record: "조리 과정에서의 영양소 손실에 의문을 갖고 UV-Vis 분광광도계로 채소의 비타민 C 함량을 정량함. 표준 용액으로 검량선을 작성하고 조리 방법별 잔존율을 비교하였으며, 조리수 분석을 통해 손실 원인을 산화 분해와 용출로 구분하여 설명하는 등 분석화학적 접근이 돋보임.",
    careerLink: "식품영양·식품공학(영양 품질), 약학(정량 분석)으로 연결된다.",
    searchTerms: ["조리 방법 비타민C 손실 분광광도계", "vitamin C retention cooking method DCPIP spectrophotometry", "브로콜리 비타민C 조리 잔존율"]
  },
  {
    id: "dna-barcoding",
    methods: ["첨단 기자재 활용", "실험"],
    title: "DNA 바코딩을 이용한 가공식품 속 어류·육류 원료 종 판별",
    subjects: ["생명과학", "화학", "정보"],
    keywords: ["DNA", "PCR", "전기영동", "유전자", "분자생물학", "식품", "원산지", "바코딩", "유전", "생명공학"],
    careers: ["생명공학자", "의사", "식품연구원", "법과학자", "약사", "연구원"],
    majors: ["생명과학과", "생명공학과", "의예과", "식품공학과", "분자생물학과", "약학과"],
    level: "심화", budget: 150000, duration: "3~4개월",
    summary: "어묵·참치캔·햄 등 가공식품에서 DNA를 추출해 미토콘드리아 유전자(cytb·COI)를 PCR로 증폭하고, 전기영동과 서열 분석(외부 의뢰)·BLAST로 실제 원료 종을 판별한다.",
    trend: "DNA 바코딩은 식품 원료 위·변조 감시와 수산물 표시 검증에 널리 쓰이며, 관련 단속·연구 뉴스가 꾸준히 보도된다.",
    question: "가공식품의 표시 원료와 DNA 분석으로 확인한 실제 원료 종은 일치하는가? 가공 정도에 따라 DNA 증폭 성공률은 어떻게 달라지는가?",
    hypothesis: "가열·가공 정도가 높을수록 DNA가 잘게 끊어져 긴 단편의 증폭 성공률이 낮아지고, 짧은 단편을 증폭하면 판별 성공률이 높아질 것이다.",
    variables: { independent: "식품 종류·가공 정도, 증폭 단편 길이", dependent: "PCR 증폭 성공 여부, 판별된 종, 표시 원료와의 일치 여부", controlled: "DNA 추출 방법, 시료량, PCR 조건" },
    materials: [
      { item: "PCR 기기(써멀 사이클러), 전기영동 장치, UV/LED 젤 촬영 장치", note: "거점학교·과학교육원·대학 실험실 이용" },
      { item: "DNA 추출 키트 또는 CTAB 추출 시약", note: "약 40,000원" },
      { item: "PCR 프리믹스, 범용 프라이머(cytb·COI)", note: "약 70,000원" },
      { item: "아가로스, DNA 염색 시약(안전형), 마커", note: "약 30,000원" },
      { item: "서열 분석 외부 의뢰(선택)", note: "건당 수천 원 수준, 업체별 상이" }
    ],
    access: "PCR·전기영동 장비는 생명과학 거점학교, 시·도 과학교육원, 대학 연계 실험 프로그램에서 이용할 수 있는 경우가 많다. 담당 교사와 함께 장비 사용 교육과 안전 교육을 받고, 서열 분석은 전문 업체에 의뢰한 뒤 결과를 NCBI BLAST로 검색한다.",
    circuit: ["PCR 조건 예: 94℃ 3분 → (94℃ 30초, 50℃ 30초, 72℃ 45초) × 35회 → 72℃ 5분 — 프라이머에 맞게 조정"],
    protocol: [
      "가공 정도가 다른 식품 6종 이상과 원료를 확실히 아는 생선·육류(대조군)를 준비한다.",
      "각 시료에서 DNA를 추출하고 농도·순도를 확인한다(가능하면 분광 측정).",
      "긴 단편(약 400bp 이상)과 짧은 단편(약 150bp) 프라이머로 각각 PCR을 수행한다.",
      "전기영동으로 증폭 여부와 단편 크기를 확인한다.",
      "증폭 산물을 서열 분석 의뢰하고, 결과를 BLAST로 검색해 종을 판별한다.",
      "표시 원료와 비교하고 가공 정도별 증폭 성공률을 정리한다."
    ],
    analysis: "증폭 성공률 표(가공 정도 × 단편 길이), BLAST 일치율과 판별 결과, 표시 원료 일치 여부 분석.",
    expected: "통조림 등 고온 가공 식품은 긴 단편의 증폭이 잘 되지 않고 짧은 단편에서 판별이 가능할 것으로 예상된다. 여러 어종이 섞인 어묵에서는 단일 서열이 잘 읽히지 않을 수 있다.",
    extension: "종 특이적 프라이머로 혼입 여부를 판별하거나, 실시간 PCR로 혼합 비율을 추정한다.",
    safety: "DNA 염색 시약은 안전형 제품을 사용하고, UV 사용 시 보안경 착용. 장비는 교육받은 뒤 지도 교사와 함께 사용한다.",
    record: "식품 표시의 신뢰성에 관심을 갖고 DNA 바코딩으로 가공식품의 원료 종을 판별함. 가공 정도에 따른 DNA 단편화를 고려해 증폭 단편 길이를 달리하는 실험을 설계하였고, 서열 분석 결과를 BLAST로 검색하여 표시 원료와 비교하는 등 분자생물학 기법을 사회 문제 해결에 적용함.",
    careerLink: "생명공학·분자생물학, 의학(분자 진단), 식품 안전으로 연결된다.",
    searchTerms: ["DNA 바코딩 수산가공품 원료 판별", "DNA barcoding processed seafood species identification cytb", "PCR 어묵 어종 판별"]
  },
  {
    id: "thermal-insulation",
    methods: ["첨단 기자재 활용", "실험"],
    title: "단열재의 종류와 두께에 따른 벽체의 열 손실과 표면 온도 분포",
    subjects: ["물리", "지구과학"],
    keywords: ["단열", "열전달", "열화상", "건축", "에너지 절약", "복사", "전도", "탄소중립", "온도"],
    careers: ["건축가", "건축공학자", "에너지공학자", "기계공학자", "환경"],
    majors: ["건축학과", "건축공학과", "에너지공학과", "기계공학과", "신소재공학과"],
    level: "중급", budget: 30000, duration: "1~2개월",
    summary: "작은 단열 상자를 여러 단열재(스티로폼, 아이소핑크, 은박 단열재, 뽁뽁이, 종이 상자)로 만들어 내부 온도 하강 속도를 측정하고, 열화상 카메라로 표면 온도 분포와 열교(열이 새는 곳)를 관찰한다.",
    trend: "건물 에너지 절감을 위한 단열 성능 평가와 열화상 진단, 제로에너지 건축 관련 정책·연구가 활발하다.",
    question: "단열재의 종류와 두께에 따라 열 손실 속도는 어떻게 달라지며, 모서리·이음부에서 열이 새는 정도는 얼마나 되는가?",
    hypothesis: "열전도율이 낮은 발포 단열재일수록, 두께가 두꺼울수록 냉각 상수가 작고, 이음부에서 표면 온도가 높게 나타날 것이다.",
    variables: { independent: "단열재 종류, 두께, 이음부 처리 여부", dependent: "내부 온도의 냉각 상수, 표면 온도 분포", controlled: "상자 크기, 내부 열원(온수 양·초기 온도), 실내 온도" },
    materials: [
      { item: "열화상 카메라(스마트폰 부착형 포함)", note: "학교 보유 또는 과학교육원 대여" },
      { item: "단열재 5종(스티로폼, 압출 단열재, 은박 단열재 등)", note: "약 20,000원" },
      { item: "디지털 온도계 또는 온도 데이터로거", note: "학교 보유" },
      { item: "온수 병(열원), 테이프, 자", note: "약 5,000원" }
    ],
    access: "열화상 카메라는 과학중점학교·발명교실·지역 과학교육원에서 대여할 수 있는 경우가 많다. 장비가 없으면 접촉식 온도계 여러 개로 표면 온도를 측정해 대신할 수 있다.",
    circuit: ["같은 크기의 상자 안에 온수 병과 온도계를 넣고 뚜껑을 닫아 같은 장소에 나란히 배치"],
    protocol: [
      "같은 크기(예: 20cm 정육면체)로 단열재별 상자를 만들고, 두께를 2단계로 달리한 상자도 만든다.",
      "같은 양·온도의 온수 병을 넣고 1분 간격으로 내부 온도를 60분간 기록한다.",
      "10분마다 열화상 카메라로 상자 외부를 같은 거리·각도에서 촬영한다.",
      "이음부를 테이프로 밀봉한 경우와 아닌 경우를 비교한다.",
      "조건별 3회 반복한다."
    ],
    analysis: "뉴턴의 냉각 법칙 T(t) = Tₐ + (T₀ − Tₐ)e^(−kt)로 냉각 상수 k를 구해 비교, 열화상 이미지에서 면·모서리 온도 차이 분석.",
    expected: "발포형 단열재가 냉각 상수가 가장 작고 두께가 두꺼울수록 k가 감소하며, 열화상에서 모서리·이음부가 상대적으로 따뜻하게 나타나는 열교 현상이 관찰될 것으로 예상된다.",
    extension: "학교 교실 창호·벽을 열화상으로 진단해 에너지 절약 개선안을 제안한다.",
    safety: "뜨거운 물 화상 주의. 열화상 촬영 시 사람 얼굴은 촬영하지 않는다.",
    record: "건물 에너지 절약에 관심을 갖고 단열재 종류와 두께에 따른 열 손실을 냉각 상수로 정량 비교함. 열화상 카메라로 이음부의 열교 현상을 시각화하고 뉴턴의 냉각 법칙으로 자료를 분석하였으며, 결과를 바탕으로 교실 단열 개선안을 제안함.",
    careerLink: "건축·건축공학(단열 설계), 에너지공학으로 연결된다.",
    searchTerms: ["단열재 종류 열손실 냉각 상수 실험", "thermal camera insulation thermal bridge experiment", "열화상 건물 에너지 진단"]
  },
  {
    id: "microplastic",
    methods: ["첨단 기자재 활용", "실험"],
    title: "해변과 하천 퇴적물 속 미세플라스틱의 분포와 형태",
    subjects: ["지구과학", "화학", "생명과학"],
    keywords: ["미세플라스틱", "플라스틱", "해양", "환경오염", "퇴적물", "현미경", "생태", "하천", "바다"],
    careers: ["해양학자", "환경공학자", "생태학자", "화학자", "환경"],
    majors: ["해양학과", "환경공학과", "지구환경과학과", "생명과학과", "화학과"],
    level: "심화", budget: 40000, duration: "3~4개월",
    summary: "해변·하천 퇴적물에서 밀도 분리(포화 소금물)로 미세플라스틱을 분리하고, 나일레드 형광 염색과 형광(또는 실체) 현미경으로 개수·크기·형태(섬유·조각·알갱이)를 분석한다.",
    trend: "미세플라스틱의 환경 분포와 생물 영향은 국제적으로 가장 활발한 환경 연구 주제 중 하나이며, 국내 해안 조사 결과도 자주 보도된다.",
    question: "조사 지점(하천 상류·하류·해변)에 따라 퇴적물 속 미세플라스틱의 양과 형태는 어떻게 다른가?",
    hypothesis: "도시를 지난 하류와 해변에서 미세플라스틱이 더 많고, 섬유형(의류 유래)과 조각형의 비율이 지점마다 다를 것이다.",
    variables: { independent: "조사 지점", dependent: "건조 퇴적물 1kg당 미세플라스틱 개수, 크기 분포, 형태 비율", controlled: "채취 깊이·면적, 분리 방법, 관찰 기준" },
    materials: [
      { item: "형광 현미경 또는 실체 현미경 + 청색 LED·주황 필터", note: "학교 보유 또는 과학교육원 이용" },
      { item: "나일레드 염색 시약", note: "약 20,000원" },
      { item: "굵은소금(포화 NaCl 용액), 체(5mm, 1mm), 거름종이, 진공 여과 장치", note: "약 15,000원" },
      { item: "유리 시료병, 금속 삽, 알루미늄 호일", note: "약 5,000원" }
    ],
    access: "형광 현미경은 과학교육원이나 대학 연계 프로그램에서 이용할 수 있다. 장비가 없으면 실체 현미경과 청색 손전등·주황색 필터로 간이 형광 관찰을 할 수 있다. 성분 확인(FT-IR)은 대학 공동기기원에 의뢰를 상담할 수 있다.",
    circuit: ["밀도 분리: 퇴적물 + 포화 소금물 → 저어 준 뒤 가라앉히기 → 위층 여과 → 거름종이 염색·관찰"],
    protocol: [
      "지점별로 같은 면적·깊이(예: 25×25cm, 깊이 5cm)에서 퇴적물을 3곳씩 채취한다.",
      "건조 후 질량을 재고 5mm 체로 큰 입자를 거른다.",
      "포화 소금물로 밀도 분리하여 떠오른 입자를 거름종이에 여과한다.",
      "나일레드로 염색한 뒤 현미경으로 관찰해 개수·크기·형태를 기록한다.",
      "실험 중 공기·옷에서 들어오는 오염을 확인하기 위해 빈 거름종이(공시료)를 함께 처리한다.",
      "지점별 결과를 지도에 표시한다."
    ],
    analysis: "1kg당 개수, 크기 분포 히스토그램, 형태 비율 비교, 공시료 보정, 지점 간 차이 검정.",
    expected: "하류·해변에서 개수가 많고 섬유형이 큰 비중을 차지할 것으로 예상된다. 나일레드는 일부 천연 유기물도 염색하므로, 과산화수소로 유기물을 제거하는 전처리 유무가 결과에 영향을 줄 수 있다.",
    extension: "조개·갯지렁이 등 생물 속 미세플라스틱 검출, 세탁 방식에 따른 섬유 배출량 실험으로 확장한다.",
    safety: "물가 채취는 반드시 2인 이상, 보호자·교사 동행. 시약 취급 시 장갑·보안경 착용.",
    record: "미세플라스틱 오염 실태를 직접 확인하고자 하천과 해변 퇴적물에서 밀도 분리와 형광 염색으로 미세플라스틱을 분리·계수함. 공시료를 설정해 실험 중 오염을 보정하고 형태별 비율을 분석하여 오염원을 추정하였으며, 형광 염색의 한계까지 고려하는 신중한 연구 태도를 보임.",
    careerLink: "해양학·환경공학(오염 조사), 생태학으로 연결된다.",
    searchTerms: ["해변 퇴적물 미세플라스틱 나일레드", "microplastics beach sediment Nile red density separation", "하천 미세플라스틱 분포 조사"]
  }
];

/* 연구 방법을 따로 적지 않은 주제는 아래 기본값을 사용합니다. */
(function () {
  const extra = {
    "yeast-co2": ["실험"], "al-air-battery": ["실험"], "diy-spectro": ["실험"], "uv-block": ["실험"],
    "plant-photosynthesis-co2": ["실험"], "loadcell-material": ["실험"], "fruit-ripening-gas": ["실험"],
    "led-farm": ["실험"], "teg-wasteheat": ["실험"], "seismo-isolation": ["실험"], "soil-landslide": ["실험"],
    "posture-ml": ["데이터 분석"], "noise-map": ["데이터 분석"], "heat-island": ["데이터 분석"],
    "hrv-stress": ["데이터 분석"], "pendulum-damping-ai": ["데이터 분석"], "pm-indoor": ["데이터 분석"]
  };
  for (const t of window.TOPICS_DB) {
    if (!t.methods) t.methods = ["아두이노 활용"].concat(extra[t.id] || []);
  }
})();
