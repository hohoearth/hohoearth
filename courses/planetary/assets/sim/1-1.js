/* I-01 우주 탐사의 성과 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 시뮬레이션 1: 대기의 창 ---------- */
  (function () {
    var cv = $("sim-win"); if (!cv) return;
    // 파장(log10 m) → 빛이 절반 흡수되는 고도(km). 교육용 근사값
    var T = [[-13, 28], [-11, 32], [-9.5, 45], [-8.5, 90], [-7.7, 120], [-7.2, 100], [-6.85, 55], [-6.6, 35], [-6.52, 8], [-6.48, 0],
      [-6.15, 0], [-6.1, 0.5], [-5.85, 0.3], [-5.7, 3], [-5.4, 6], [-5.25, 0.5], [-5.0, 0.3], [-4.9, 5], [-4.5, 12], [-3.8, 14],
      [-3.3, 6], [-3.0, 2], [-2.6, 0.3], [-2.2, 0], [0.8, 0], [1.1, 30], [1.4, 110], [2, 140]];
    function half(l) {
      for (var i = 0; i < T.length - 1; i++) if (l >= T[i][0] && l <= T[i + 1][0]) { var k = (l - T[i][0]) / (T[i + 1][0] - T[i][0]); return T[i][1] + (T[i + 1][1] - T[i][1]) * k; }
      return 140;
    }
    var BANDS = [["감마선", -13, -11, "#c084fc"], ["X선", -11, -8, "#818cf8"], ["자외선", -8, -6.4, "#60a5fa"], ["가시광선", -6.4, -6.15, "#fde047"], ["적외선", -6.15, -3, "#f87171"], ["전파", -3, 2, "#94a3b8"]];
    var site = $("win-site"), hs = $("win-h");
    function hKm() { return Math.pow(10, +hs.value) - 1; }
    site.addEventListener("change", function () { hs.value = Math.log10(+site.value + 1); draw(); });
    hs.addEventListener("input", draw);
    function draw() {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var box = { x: 58, y: 16, w: w - 74, h: h - 70 };
      // 고도 축: 0~150 km, 아래쪽을 늘리기 위해 log(1+h) 로 표시
      function Y(km) { return box.y + box.h - Math.log10(km + 1) / Math.log10(151) * box.h; }
      function X(l) { return box.x + (l + 13) / 15 * box.w; }
      var H = hKm();
      // 관측 가능 영역
      for (var px = 0; px < box.w; px++) {
        var l = -13 + px / box.w * 15, hh = half(l);
        c.fillStyle = hh <= H ? "rgba(52,195,143,.28)" : "rgba(255,90,90,.08)";
        c.fillRect(box.x + px, box.y, 1, box.h);
      }
      // 대기 흡수 영역 채우기
      c.beginPath(); c.moveTo(X(-13), Y(0));
      for (var l2 = -13; l2 <= 2; l2 += 0.02) c.lineTo(X(l2), Y(half(l2)));
      c.lineTo(X(2), Y(0)); c.closePath();
      c.fillStyle = "rgba(96,165,250,.25)"; c.fill();
      c.beginPath();
      for (var l3 = -13; l3 <= 2; l3 += 0.02) { var yy = Y(half(l3)); if (l3 === -13) c.moveTo(X(l3), yy); else c.lineTo(X(l3), yy); }
      c.strokeStyle = "#93c5fd"; c.lineWidth = 2; c.stroke(); c.lineWidth = 1;
      // 축
      c.font = S.font(11); c.fillStyle = "rgba(255,255,255,.75)"; c.strokeStyle = "rgba(255,255,255,.12)";
      [0, 1, 4, 10, 20, 50, 100, 150].forEach(function (k) { var y = Y(k); c.beginPath(); c.moveTo(box.x, y); c.lineTo(box.x + box.w, y); c.stroke(); c.textAlign = "right"; c.fillText(k + " km", box.x - 6, y + 4); });
      var lab = { "-12": "1 pm", "-10": "0.1 nm", "-8": "10 nm", "-6": "1 μm", "-4": "100 μm", "-2": "1 cm", "0": "1 m", "2": "100 m" };
      Object.keys(lab).forEach(function (k) { c.textAlign = "center"; c.fillText(lab[k], X(+k), box.y + box.h + 15); });
      // 파장대 띠
      BANDS.forEach(function (b) { var x0 = X(b[1]), x1 = X(b[2]); c.fillStyle = b[3]; c.globalAlpha = .85; c.fillRect(x0, box.y + box.h + 22, x1 - x0 - 1, 16); c.globalAlpha = 1; c.fillStyle = "#0b0e17"; c.font = S.font(11, true); c.textAlign = "center"; if (x1 - x0 > 30) c.fillText(b[0], (x0 + x1) / 2, box.y + box.h + 34); });
      // 관측소 고도선
      var yH = Y(H); c.setLineDash([6, 4]); c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath(); c.moveTo(box.x, yH); c.lineTo(box.x + box.w, yH); c.stroke(); c.setLineDash([]); c.lineWidth = 1;
      S.tag(c, "망원경 고도 " + (H < 10 ? H.toFixed(1) : Math.round(H)) + " km", box.x + box.w - 6, Math.max(box.y + 18, yH - 6), { bg: "#b45309", align: "right" });
      c.textAlign = "left";
      // 결과
      $("win-hv").textContent = (H < 10 ? H.toFixed(1) : Math.round(H)) + " km";
      var open = BANDS.map(function (b) { var n = 0, ok = 0; for (var l = b[1]; l < b[2]; l += 0.02) { n++; if (half(l) <= H) ok++; } return [b[0], ok / n]; });
      $("win-out").innerHTML = "<b>관측 가능한 비율</b><br>" + open.map(function (o) { return o[0] + " " + "█".repeat(Math.round(o[1] * 10)) + "░".repeat(10 - Math.round(o[1] * 10)) + " " + Math.round(o[1] * 100) + "%"; }).join("<br>");
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: 호만 전이 궤도 ---------- */
  (function () {
    var cv = $("sim-hoh"); if (!cv) return;
    var aE = 1, aM = 1.524, TE = 365.25, TM = 686.98;
    var at = (aE + aM) / 2, tT = 0.5 * Math.pow(at, 1.5) * 365.25; // 일
    var need = 180 - 360 * tT / TM; // 발사 시 화성이 앞서야 할 각
    var st = { t: 0, play: false, ship: null, result: null, e0: 0, m0: 60 * Math.PI / 180 };
    function angE(t) { return st.e0 + 2 * Math.PI * t / TE; }
    function angM(t) { return st.m0 + 2 * Math.PI * t / TM; }
    function wrap(a) { a = a % 360; return a < 0 ? a + 360 : a; }
    $("hoh-play").addEventListener("click", function () { st.play = !st.play; this.classList.toggle("on", st.play); this.textContent = st.play ? "⏸ 멈춤" : "▶ 시간 흐르게 하기"; });
    $("hoh-launch").addEventListener("click", function () {
      if (st.ship && !st.result) return;
      st.ship = { t0: st.t, th0: angE(st.t) }; st.result = null; st.play = true;
      $("hoh-play").classList.add("on"); $("hoh-play").textContent = "⏸ 멈춤";
    });
    $("hoh-reset").addEventListener("click", function () { st.t = 0; st.ship = null; st.result = null; st.play = false; $("hoh-play").classList.remove("on"); $("hoh-play").textContent = "▶ 시간 흐르게 하기"; $("hoh-ver").textContent = "화성이 지구보다 약 " + Math.round(need) + "° 앞설 때 발사해 보자."; });
    var sp = $("hoh-sp");
    function shipPos(dt) { // 근일점(지구 위치)에서 출발한 타원 궤도
      var e = (aM - aE) / (aM + aE), n = Math.PI / tT; // 반 주기 동안 π 진행 (평균 근점 이각)
      var Mn = Math.min(Math.PI, n * dt), E = Mn;
      for (var i = 0; i < 12; i++) E = E - (E - e * Math.sin(E) - Mn) / (1 - e * Math.cos(E));
      var nu = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
      var r = at * (1 - e * Math.cos(E));
      return { r: r, th: st.ship.th0 + nu };
    }
    S.loop(function (dt) {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h;
      if (st.play) st.t += dt * +sp.value;
      $("hoh-spv").textContent = "1초 = " + sp.value + "일";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h); S.stars(c, w, h, 120, 3);
      var cx = w * 0.42, cy = h / 2, sc = Math.min(w * 0.36, h * 0.44) / aM;
      // 궤도
      c.strokeStyle = "rgba(96,165,250,.45)"; c.beginPath(); c.arc(cx, cy, aE * sc, 0, 7); c.stroke();
      c.strokeStyle = "rgba(248,113,113,.45)"; c.beginPath(); c.arc(cx, cy, aM * sc, 0, 7); c.stroke();
      // 태양
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, 18); g.addColorStop(0, "#fff7cc"); g.addColorStop(1, "rgba(251,191,36,0)");
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 18, 0, 7); c.fill(); S.dot(c, cx, cy, 7, "#fbbf24");
      var ae = angE(st.t), am = angM(st.t);
      var ex = cx + Math.cos(ae) * aE * sc, ey = cy - Math.sin(ae) * aE * sc, mx = cx + Math.cos(am) * aM * sc, my = cy - Math.sin(am) * aM * sc;
      // 위상각 표시
      var ph = wrap((am - ae) * 180 / Math.PI);
      if (!st.ship) {
        c.strokeStyle = "rgba(251,191,36,.6)"; c.setLineDash([4, 4]);
        c.beginPath(); c.moveTo(cx, cy); c.lineTo(ex, ey); c.moveTo(cx, cy); c.lineTo(mx, my); c.stroke(); c.setLineDash([]);
        c.beginPath(); c.arc(cx, cy, 34, -ae, -ae - ph * Math.PI / 180, true); c.stroke();
        // 목표 각 가이드
        var ga = ae + need * Math.PI / 180;
        c.strokeStyle = "rgba(52,195,143,.5)"; c.setLineDash([2, 5]); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(ga) * aM * sc * 1.08, cy - Math.sin(ga) * aM * sc * 1.08); c.stroke(); c.setLineDash([]);
        S.tag(c, "발사 적기 방향", cx + Math.cos(ga) * aM * sc * 1.1, cy - Math.sin(ga) * aM * sc * 1.1, { bg: "rgba(15,157,107,.8)", size: 11, align: "center" });
      }
      // 탐사선
      var info = "";
      if (st.ship) {
        var dts = st.t - st.ship.t0, p = shipPos(Math.min(dts, tT));
        c.strokeStyle = "rgba(255,255,255,.5)"; c.setLineDash([3, 4]); c.beginPath();
        for (var k = 0; k <= 60; k++) { var q = shipPos(tT * k / 60); var X = cx + Math.cos(q.th) * q.r * sc, Y = cy - Math.sin(q.th) * q.r * sc; if (k) c.lineTo(X, Y); else c.moveTo(X, Y); }
        c.stroke(); c.setLineDash([]);
        var sx = cx + Math.cos(p.th) * p.r * sc, sy = cy - Math.sin(p.th) * p.r * sc;
        S.dot(c, sx, sy, 5, "#fff", "#000"); S.tag(c, "탐사선", sx + 8, sy - 6, { size: 11 });
        info = "비행 " + Math.min(Math.round(dts), Math.round(tT)) + " / " + Math.round(tT) + "일";
        if (dts >= tT && !st.result) {
          var miss = Math.abs(((p.th - am) * 180 / Math.PI + 540) % 360 - 180);
          st.result = miss < 6 ? "ok" : "fail";
          $("hoh-ver").textContent = st.result === "ok" ? "도착 성공! 화성과의 각도 차 " + miss.toFixed(1) + "°. 발사 때 위상각이 약 " + Math.round(need) + "°였습니다." : "도착했지만 화성이 " + miss.toFixed(0) + "° 떨어져 있다. 발사 순간의 위상각을 다시 맞춰 보자.";
          st.play = false; $("hoh-play").classList.remove("on"); $("hoh-play").textContent = "▶ 시간 흐르게 하기";
        }
      }
      S.dot(c, ex, ey, 7, "#3b82f6"); S.tag(c, "지구", ex + 9, ey - 6, { size: 11, bg: "rgba(37,99,235,.8)" });
      S.dot(c, mx, my, 6, "#ef4444"); S.tag(c, "화성", mx + 9, my - 6, { size: 11, bg: "rgba(220,38,38,.8)" });
      // 통신 지연
      var d = Math.hypot(Math.cos(ae) * aE - Math.cos(am) * aM, Math.sin(ae) * aE - Math.sin(am) * aM);
      var lag = d * 499 / 60;
      c.font = S.font(12, true); c.fillStyle = "rgba(255,255,255,.85)"; c.textAlign = "left";
      c.fillText("지구–화성 거리 " + d.toFixed(2) + " AU", w - 190, h - 34);
      c.fillText("전파 지연 " + lag.toFixed(1) + " 분 (편도)", w - 190, h - 14);
      $("hoh-out").innerHTML = "경과 시간 <b>" + Math.round(st.t) + "일</b><br>화성이 앞선 각도 <b>" + ph.toFixed(1) + "°</b><br>필요한 위상각 <b>" + need.toFixed(1) + "°</b><br>전이 궤도 비행 <b>" + Math.round(tT) + "일</b>" + (info ? "<br>" + info : "");
    });
  })();

  /* ---------- 데이터 랩: 미션 데이터베이스 ---------- */
  (function () {
    var cv = $("lab-chart"); if (!cv) return;
    // [이름, 기관, 발사 연도, 대상, 대상군, 방법]
    var D = [
      ["매리너 2호", "NASA", 1962, "금성", "금성", "근접 통과"], ["매리너 4호", "NASA", 1964, "화성", "화성", "근접 통과"],
      ["아폴로 11호", "NASA", 1969, "달", "달", "시료 회수"], ["베네라 7호", "소련", 1970, "금성", "금성", "착륙·탐사차"],
      ["매리너 9호", "NASA", 1971, "화성", "화성", "궤도 선회"], ["파이어니어 10호", "NASA", 1972, "목성", "목성형 행성", "근접 통과"],
      ["매리너 10호", "NASA", 1973, "수성·금성", "수성", "근접 통과"], ["바이킹 1호", "NASA", 1975, "화성", "화성", "착륙·탐사차"],
      ["보이저 1호", "NASA", 1977, "목성·토성", "목성형 행성", "근접 통과"], ["보이저 2호", "NASA", 1977, "목성~해왕성", "목성형 행성", "근접 통과"],
      ["파이어니어 비너스", "NASA", 1978, "금성", "금성", "궤도 선회"], ["베네라 13호", "소련", 1981, "금성", "금성", "착륙·탐사차"],
      ["조토", "ESA", 1985, "핼리 혜성", "혜성", "근접 통과"], ["마젤란", "NASA", 1989, "금성", "금성", "궤도 선회"],
      ["갈릴레오", "NASA", 1989, "목성", "목성형 행성", "궤도 선회"], ["니어 슈메이커", "NASA", 1996, "소행성 에로스", "소행성", "궤도 선회"],
      ["마스 패스파인더", "NASA", 1996, "화성", "화성", "착륙·탐사차"], ["카시니–하위헌스", "NASA·ESA", 1997, "토성·타이탄", "목성형 행성", "궤도 선회"],
      ["스타더스트", "NASA", 1999, "혜성 빌트2", "혜성", "시료 회수"], ["하야부사", "JAXA", 2003, "소행성 이토카와", "소행성", "시료 회수"],
      ["스피릿·오퍼튜니티", "NASA", 2003, "화성", "화성", "착륙·탐사차"], ["마스 익스프레스", "ESA", 2003, "화성", "화성", "궤도 선회"],
      ["로제타", "ESA", 2004, "혜성 67P", "혜성", "궤도 선회"], ["메신저", "NASA", 2004, "수성", "수성", "궤도 선회"],
      ["딥 임팩트", "NASA", 2005, "혜성 템펠1", "혜성", "충돌"], ["뉴허라이즌스", "NASA", 2006, "명왕성", "왜소 행성", "근접 통과"],
      ["돈", "NASA", 2007, "베스타·세레스", "왜소 행성", "궤도 선회"], ["찬드라얀 1호", "ISRO", 2008, "달", "달", "궤도 선회"],
      ["주노", "NASA", 2011, "목성", "목성형 행성", "궤도 선회"], ["큐리오시티", "NASA", 2011, "화성", "화성", "착륙·탐사차"],
      ["망갈리안", "ISRO", 2013, "화성", "화성", "궤도 선회"], ["창어 3호", "CNSA", 2013, "달", "달", "착륙·탐사차"],
      ["하야부사2", "JAXA", 2014, "소행성 류구", "소행성", "시료 회수"], ["오시리스-렉스", "NASA", 2016, "소행성 베누", "소행성", "시료 회수"],
      ["파커 태양 탐사선", "NASA", 2018, "태양", "태양", "궤도 선회"], ["베피콜롬보", "ESA·JAXA", 2018, "수성", "수성", "궤도 선회"],
      ["창어 4호", "CNSA", 2018, "달 뒷면", "달", "착륙·탐사차"], ["퍼서비어런스", "NASA", 2020, "화성", "화성", "착륙·탐사차"],
      ["톈원 1호", "CNSA", 2020, "화성", "화성", "착륙·탐사차"], ["아말(호프)", "UAE", 2020, "화성", "화성", "궤도 선회"],
      ["루시", "NASA", 2021, "트로이 소행성", "소행성", "근접 통과"], ["DART", "NASA", 2021, "소행성 디모르포스", "소행성", "충돌"],
      ["다누리", "KARI", 2022, "달", "달", "궤도 선회"], ["주스(JUICE)", "ESA", 2023, "목성 얼음 위성", "목성형 행성", "궤도 선회"],
      ["찬드라얀 3호", "ISRO", 2023, "달", "달", "착륙·탐사차"], ["프시케", "NASA", 2023, "소행성 프시케", "소행성", "궤도 선회"],
      ["유로파 클리퍼", "NASA", 2024, "유로파", "목성형 행성", "궤도 선회"], ["창어 6호", "CNSA", 2024, "달 뒷면", "달", "시료 회수"]
    ];
    var COL = {
      method: { "근접 통과": "#60a5fa", "궤도 선회": "#a78bfa", "착륙·탐사차": "#f59e0b", "충돌": "#ef4444", "시료 회수": "#34d399" },
      target: { "태양": "#facc15", "수성": "#a8a29e", "금성": "#fb923c", "달": "#e5e7eb", "화성": "#ef4444", "목성형 행성": "#c084fc", "왜소 행성": "#38bdf8", "소행성": "#84cc16", "혜성": "#2dd4bf" },
      agency: { "NASA": "#3b82f6", "소련": "#ef4444", "ESA": "#facc15", "JAXA": "#f472b6", "CNSA": "#fb923c", "ISRO": "#22c55e", "UAE": "#a3a3a3", "KARI": "#8b5cf6", "공동": "#2dd4bf" }
    };
    var IDX = { method: 5, target: 4, agency: 1 };
    var by = "method", filt = "", hover = null, bars = [];
    var sel = $("lab-filter");
    Object.keys(COL.target).forEach(function (k) { var o = document.createElement("option"); o.value = k; o.textContent = k; sel.appendChild(o); });
    sel.addEventListener("change", function () { filt = sel.value; draw(); });
    $("lab-by").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; by = b.dataset.k; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    function key(r) { var v = r[IDX[by]]; if (by === "agency" && v.indexOf("·") > 0) v = "공동"; return v; }
    $("lab-csv").addEventListener("click", function () { S.csv("missions.csv", ["name", "agency", "launch_year", "target", "target_group", "method"], D); });
    S.table($("lab-table"), ["미션", "기관", "발사 연도", "대상", "대상군", "탐사 방법"], D);
    $("lab-n").textContent = D.length + "개 행 × 6개 열";
    cv.addEventListener("mousemove", function (e) { var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top; hover = null; bars.forEach(function (b) { if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) hover = b; }); draw(); });
    cv.addEventListener("mouseleave", function () { hover = null; draw(); });
    function draw() {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var rows = D.filter(function (r) { return !filt || r[4] === filt; });
      var decs = [1960, 1970, 1980, 1990, 2000, 2010, 2020], cats = Object.keys(COL[by]);
      var cnt = decs.map(function (d) { var o = {}; cats.forEach(function (k) { o[k] = []; }); rows.forEach(function (r) { if (Math.floor(r[2] / 10) * 10 === d) o[key(r)].push(r[0]); }); return o; });
      var mx = Math.max(4, Math.max.apply(null, cnt.map(function (o) { return cats.reduce(function (s, k) { return s + o[k].length; }, 0); })));
      var A = S.axes(c, { x: 54, y: 16, w: w - 70, h: h - 64, x0: 0, x1: decs.length, y0: 0, y1: Math.ceil(mx / 2) * 2 + 1, xt: [], yl: "미션 수", grid: true });
      var bw = (w - 70) / decs.length * 0.62; bars = [];
      decs.forEach(function (d, i) {
        var x = A.X(i + 0.5) - bw / 2, acc = 0;
        cats.forEach(function (k) {
          var n = cnt[i][k].length; if (!n) return;
          var y0 = A.Y(acc), y1 = A.Y(acc + n);
          c.fillStyle = COL[by][k]; c.fillRect(x, y1, bw, y0 - y1 - 1);
          if (y0 - y1 > 14) { c.fillStyle = "#0b0e17"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText(n, x + bw / 2, (y0 + y1) / 2 + 4); }
          bars.push({ x: x, y: y1, w: bw, h: y0 - y1, k: k, d: d, names: cnt[i][k] });
          acc += n;
        });
        c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11); c.textAlign = "center"; c.fillText((w > 520 ? d : "'" + String(d).slice(2)) + "년대", A.X(i + 0.5), h - 30);
      });
      if (hover) {
        var txt = hover.d + "년대 · " + hover.k + " (" + hover.names.length + ")";
        var lines = [txt].concat(hover.names), tw = 0; c.font = S.font(12, true);
        lines.forEach(function (l) { tw = Math.max(tw, c.measureText(l).width); });
        var bx = Math.min(hover.x + hover.w + 6, w - tw - 20), by2 = Math.max(10, hover.y);
        c.fillStyle = "rgba(20,24,38,.95)"; c.fillRect(bx, by2, tw + 16, lines.length * 17 + 8);
        c.fillStyle = "#fff"; c.textAlign = "left"; lines.forEach(function (l, i) { c.font = S.font(12, i === 0); c.fillText(l, bx + 8, by2 + 18 + i * 17); });
      }
      $("lab-leg").innerHTML = cats.map(function (k) { return '<span><i style="background:' + COL[by][k] + '"></i>' + k + "</span>"; }).join("");
      var early = rows.filter(function (r) { return r[2] < 1980; }), late = rows.filter(function (r) { return r[2] >= 2010; });
      function share(arr, m) { return arr.length ? Math.round(arr.filter(function (r) { return r[5] === m; }).length / arr.length * 100) : 0; }
      $("lab-sum").innerHTML = "선택된 미션 <b>" + rows.length + "개</b><br>근접 통과 비율: 1960~70년대 " + share(early, "근접 통과") + "% → 2010년대 이후 " + share(late, "근접 통과") + "%<br>참여 기관 수: 1960~70년대 " + uniq(early) + "곳 → 2010년대 이후 " + uniq(late) + "곳";
      function uniq(arr) { var s = {}; arr.forEach(function (r) { r[1].split("·").forEach(function (a) { s[a] = 1; }); }); return Object.keys(s).length; }
    }
    draw(); S.onResize(draw);
  })();
})();
