/* II-02 별의 거리 측정 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 시뮬레이션 1: 연주시차 ---------- */
  (function () {
    var cv = $("sim-plx"); if (!cv) return;
    var id = $("plx-d"), it = $("plx-t"), play = false, trail = [];
    $("plx-play").addEventListener("click", function () { play = !play; this.textContent = play ? "⏸ 멈춤" : "▶ 1년 돌리기"; this.classList.toggle("on", play); });
    id.addEventListener("input", function () { trail = []; });
    var R = S.rand(42), BG = []; for (var i = 0; i < 70; i++) BG.push([R(), R(), 0.5 + R() * 1.6]);
    S.loop(function (dt) {
      var f = S.fit(cv, 0.52), c = f.ctx, w = f.w, h = f.h, d = +id.value;
      if (play) { it.value = ((+it.value + dt * 2) % 12).toFixed(2); }
      var mon = +it.value, th = mon / 12 * 2 * Math.PI, p = 1 / d;
      $("plx-dv").textContent = d.toFixed(1) + " pc"; $("plx-tv").textContent = Math.floor(mon) + 1 + "월";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 왼쪽: 위에서 본 모습
      var lx = w * 0.25, ly = h * 0.68, Ro = Math.min(w * 0.12, h * 0.2), Dpx = Math.min(h * 0.55, 30 + 200 / d);
      c.strokeStyle = "rgba(96,165,250,.5)"; c.beginPath(); c.arc(lx, ly, Ro, 0, 7); c.stroke();
      S.dot(c, lx, ly, 7, "#fbbf24");
      var ex = lx + Math.cos(th) * Ro, ey = ly + Math.sin(th) * Ro * 0.35, sx = lx, sy = ly - Dpx;
      c.strokeStyle = "rgba(255,255,255,.12)"; c.beginPath(); c.arc(lx, ly, Ro, 0, 7); c.stroke();
      // 6개월 전후 위치
      var e2x = lx - Math.cos(th) * Ro, e2y = ly - Math.sin(th) * Ro * 0.35;
      c.strokeStyle = "rgba(248,113,113,.35)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(e2x, e2y); c.lineTo(sx, sy); c.stroke(); c.setLineDash([]);
      c.strokeStyle = "rgba(248,113,113,.9)"; c.beginPath(); c.moveTo(ex, ey); c.lineTo(sx, sy); c.stroke();
      c.strokeStyle = "rgba(251,191,36,.5)"; c.beginPath(); c.moveTo(lx, ly); c.lineTo(sx, sy); c.stroke();
      S.dot(c, ex, ey, 5, "#3b82f6"); S.dot(c, e2x, e2y, 4, "rgba(59,130,246,.35)"); S.dot(c, sx, sy, 5, "#ef4444");
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11); c.fillText("가까운 별", sx + 8, sy + 4); c.fillText("지구 (" + (Math.floor(mon) + 1) + "월)", ex + 8, ey + 14); c.fillText("6개월 뒤", e2x + 8, e2y + 14);
      c.fillText("↑ 먼 배경 별들", lx - 30, 18); c.fillText("위에서 본 모습 (각도 과장)", 10, h - 10);
      // 오른쪽: 하늘
      var rx = w * 0.52, rw = w * 0.45, rh = h * 0.86, ry = h * 0.07;
      c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(rx, ry, rw, rh);
      BG.forEach(function (b) { c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(rx + b[0] * rw, ry + b[1] * rh, b[2] * 0.8, 0, 7); c.fill(); });
      var amp = Math.min(rw * 0.42, rw * 0.36 * p / 0.5 * 1.0) ;
      var px = rx + rw / 2 + Math.cos(th) * amp, py = ry + rh / 2 + Math.sin(th) * amp * 0.6;
      trail.push([px, py]); if (trail.length > 400) trail.shift();
      c.strokeStyle = "rgba(248,113,113,.4)"; c.beginPath(); c.ellipse(rx + rw / 2, ry + rh / 2, amp, amp * 0.6, 0, 0, 7); c.stroke();
      S.dot(c, px, py, 5, "#ef4444", "#fff");
      c.strokeStyle = "rgba(255,255,255,.6)"; c.beginPath(); c.moveTo(rx + rw / 2 - amp, ry + rh - 18); c.lineTo(rx + rw / 2 + amp, ry + rh - 18); c.stroke();
      c.fillStyle = "#fff"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText("2p = " + (2 * p).toFixed(2) + "″", rx + rw / 2, ry + rh - 24); c.fillText("망원경으로 본 하늘", rx + rw / 2, ry + 16); c.textAlign = "left";
      $("plx-out").innerHTML = "연주시차 p = 1/r = <b>" + p.toFixed(3) + "″</b><br>1년 동안 그리는 타원의 긴반지름 = p<br>거리 " + d.toFixed(1) + " pc = <b>" + (d * 3.26).toFixed(1) + " 광년</b>";
    });
  })();

  /* ---------- 시뮬레이션 2: 거리지수 ---------- */
  (function () {
    var cv = $("sim-dm"); if (!cv) return;
    var is = $("dm-star"), ir = $("dm-r");
    function draw() {
      var f = S.fit(cv, 0.52), c = f.ctx, w = f.w, h = f.h, M = +is.value, r = Math.pow(10, +ir.value), m = M + 5 * Math.log10(r) - 5;
      $("dm-rv").textContent = (r < 10 ? r.toFixed(1) : Math.round(r).toLocaleString()) + " pc";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var A = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: 1, x1: 10000, xlog: true, y0: 36, y1: -10, xl: "거리 r (pc, 로그 눈금)", yl: "겉보기 등급 m", xfmt: function (v) { return v.toLocaleString(); } });
      [[6, "맨눈 한계 (6등급)", "#34d399"], [25, "대형 망원경 한계 (약 25등급)", "#a78bfa"]].forEach(function (q) { c.strokeStyle = q[2]; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(56, A.Y(q[0])); c.lineTo(w - 16, A.Y(q[0])); c.stroke(); c.setLineDash([]); c.fillStyle = q[2]; c.font = S.font(11, true); c.fillText(q[1], 62, A.Y(q[0]) - 5); });
      c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath(); for (var k = 0; k <= 100; k++) { var rr = Math.pow(10, k / 25); var mm = M + 5 * Math.log10(rr) - 5; if (k) c.lineTo(A.X(rr), A.Y(mm)); else c.moveTo(A.X(rr), A.Y(mm)); } c.stroke(); c.lineWidth = 1;
      c.strokeStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.moveTo(A.X(10), 14); c.lineTo(A.X(10), h - 38); c.stroke(); c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(10); c.fillText("10 pc: m = M", A.X(10) + 4, 26);
      var br = Math.max(2, Math.min(18, 12 - m * 0.6));
      var g = c.createRadialGradient(A.X(r), A.Y(m), 0, A.X(r), A.Y(m), br * 2); g.addColorStop(0, "#fff"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(A.X(r), A.Y(m), br * 2, 0, 7); c.fill();
      S.dot(c, A.X(r), A.Y(m), 4, "#ef4444");
      var seen = m <= 6 ? "맨눈으로 보인다" : m <= 25 ? "망원경이 있어야 보인다" : "대형 망원경으로도 보기 어렵다";
      $("dm-out").innerHTML = "절대 등급 M = <b>" + M + "</b><br>겉보기 등급 m = <b>" + m.toFixed(2) + "</b><br>거리지수 m − M = 5 log r − 5 = <b>" + (m - M).toFixed(2) + "</b><br>→ " + seen;
    }
    is.addEventListener("change", draw); ir.addEventListener("input", draw); draw(); S.onResize(draw);
  })();

  /* ---------- 데이터 랩: H-R도 ---------- */
  (function () {
    var cv = $("lab-hr"); if (!cv) return;
    // [이름, 시차(mas), V, B-V, 무리]
    var D = [["프록시마 센타우리", 768.07, 11.13, 1.82, "주계열"], ["알파 센타우리 A", 747.1, 0.01, 0.71, "주계열"], ["알파 센타우리 B", 747.1, 1.33, 0.88, "주계열"],
      ["바너드별", 546.98, 9.51, 1.73, "주계열"], ["울프 359", 415.18, 13.51, 2.03, "주계열"], ["랄랑드 21185", 392.75, 7.52, 1.44, "주계열"],
      ["시리우스 A", 379.21, -1.46, 0.00, "주계열"], ["시리우스 B", 379.21, 8.44, -0.03, "백색 왜성"], ["프로키온 A", 284.56, 0.37, 0.42, "주계열"],
      ["프로키온 B", 284.56, 10.7, 0.00, "백색 왜성"], ["백조자리 61 A", 286.0, 5.21, 1.18, "주계열"], ["에리다누스자리 엡실론", 310.58, 3.73, 0.88, "주계열"],
      ["고래자리 타우", 273.81, 3.50, 0.72, "주계열"], ["에리다누스자리 40 B", 199.61, 9.52, 0.04, "백색 왜성"], ["판 마넨별", 231.74, 12.37, 0.55, "백색 왜성"],
      ["알타이르", 194.95, 0.76, 0.22, "주계열"], ["베가", 130.23, 0.03, 0.00, "주계열"], ["포말하우트", 129.81, 1.16, 0.09, "주계열"],
      ["폴룩스", 96.54, 1.14, 1.00, "거성"], ["아르크투루스", 88.83, -0.05, 1.23, "거성"], ["카펠라", 76.20, 0.08, 0.80, "거성"],
      ["알데바란", 48.94, 0.86, 1.54, "거성"], ["레굴루스", 41.13, 1.40, -0.11, "주계열"], ["아케르나르", 23.39, 0.46, -0.16, "주계열"],
      ["스피카", 13.06, 0.97, -0.23, "주계열"], ["카노푸스", 10.55, -0.74, 0.15, "초거성"], ["북극성", 7.54, 1.98, 0.60, "초거성"],
      ["베텔게우스", 6.55, 0.50, 1.85, "초거성"], ["안타레스", 5.89, 1.06, 1.83, "초거성"], ["리겔", 3.78, 0.13, -0.03, "초거성"], ["데네브", 2.31, 1.25, 0.09, "초거성"]];
    var calc = false, ymode = "m", hov = -1, pts = [];
    var COL = { "주계열": "#60a5fa", "거성": "#f59e0b", "초거성": "#ef4444", "백색 왜성": "#e5e7eb" };
    function rpc(r) { return 1000 / r[1]; } function absM(r) { return r[2] - 5 * Math.log10(rpc(r)) + 5; }
    function table() {
      S.table($("lab-table"), ["별", "시차 (mas)", "V (겉보기 등급)", "B−V", "거리 (pc)", "절대 등급 M"],
        D.map(function (r) { return [r[0], r[1], r[2], r[3], calc ? rpc(r).toFixed(1) : "?", calc ? absM(r).toFixed(2) : "?"]; }));
    }
    $("lab-calc").addEventListener("click", function () { calc = true; table(); draw(); this.textContent = "✔ 계산 완료"; });
    $("lab-y").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; if (b.dataset.y === "M" && !calc) { $("lab-out").innerHTML = "먼저 '거리·절대 등급 계산'을 눌러 절대 등급 열을 만들자."; return; } ymode = b.dataset.y; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    $("lab-cls").addEventListener("change", draw);
    $("lab-csv").addEventListener("click", function () { S.csv("nearby_bright_stars.csv", ["name", "parallax_mas", "V", "B_V", "distance_pc", "abs_mag", "group"], D.map(function (r) { return [r[0], r[1], r[2], r[3], rpc(r).toFixed(2), absM(r).toFixed(2), r[4]]; })); });
    cv.addEventListener("mousemove", function (e) { var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; hov = -1; pts.forEach(function (p, i) { if (Math.hypot(p[0] - x, p[1] - y) < 8) hov = i; }); draw(); });
    function draw() {
      var f = S.fit(cv, 0.72), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var isM = ymode === "M";
      var A = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: -0.4, x1: 2.2, y0: isM ? 17 : 14.5, y1: isM ? -9 : -2.5, xl: "색지수 B−V", yl: isM ? "절대 등급 M" : "겉보기 등급 m" });
      if (isM && $("lab-cls").checked) {
        c.strokeStyle = "rgba(96,165,250,.35)"; c.lineWidth = 16; c.lineCap = "round"; c.beginPath(); c.moveTo(A.X(-0.25), A.Y(-2.5)); c.quadraticCurveTo(A.X(0.6), A.Y(4), A.X(1.9), A.Y(15)); c.stroke(); c.lineWidth = 1; c.lineCap = "butt";
      }
      pts = [];
      D.forEach(function (r, i) {
        var y = isM ? absM(r) : r[2], x = r[3], X = A.X(x), Y = A.Y(y);
        pts.push([X, Y]);
        var col = $("lab-cls").checked ? COL[r[4]] : S.tempColor(Math.max(2500, 7090 / (r[3] + 0.72)));
        S.dot(c, X, Y, i === hov ? 7 : 5, col, "#000");
      });
      if (isM && $("lab-cls").checked) { c.font = S.font(12, true); [["주계열", 0.5, 6.5], ["거성", 1.3, -1.2], ["초거성", 0.5, -7.5], ["백색 왜성", 0.05, 14]].forEach(function (q) { c.fillStyle = COL[q[0]]; c.fillText(q[0], A.X(q[1]), A.Y(q[2])); }); }
      if (hov >= 0) { var r = D[hov]; $("lab-out").innerHTML = "<b>" + r[0] + "</b> (" + r[4] + ")<br>시차 " + r[1] + " mas → 거리 " + (calc ? rpc(r).toFixed(1) + " pc (" + (rpc(r) * 3.26).toFixed(0) + " 광년)" : "?") + "<br>m = " + r[2] + " · M = " + (calc ? absM(r).toFixed(2) : "?") + " · B−V = " + r[3]; }
    }
    table(); draw(); S.onResize(draw);
  })();
})();
