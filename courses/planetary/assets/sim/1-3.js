/* I-03 케플러 법칙 */
(function () {
  var S = window.SIM, $ = S.$;
  function kepE(M, e) { var E = e > 0.8 ? Math.PI : M; for (var i = 0; i < 30; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E)); return E; }

  /* ---------- 시뮬레이션 1: 케플러 궤도 ---------- */
  (function () {
    var cv = $("sim-orb"); if (!cv) return;
    var ie = $("orb-e"), ia = $("orb-a"), inN = $("orb-n"), showV = true, showS = true, M = 0;
    $("orb-vec").addEventListener("click", function () { showV = !showV; this.classList.toggle("on", showV); });
    $("orb-sec").addEventListener("click", function () { showS = !showS; this.classList.toggle("on", showS); });
    var COLS = ["#60a5fa", "#f472b6", "#34d399", "#fbbf24", "#a78bfa", "#f87171", "#2dd4bf", "#fb923c"];
    S.loop(function (dt) {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h;
      var e = +ie.value, a = +ia.value, N = +inN.value, P = Math.pow(a, 1.5);
      $("orb-ev").textContent = e.toFixed(2); $("orb-av").textContent = a.toFixed(1) + " AU";
      var dur = Math.max(3, Math.min(24, P * 4)); // 화면 속 한 바퀴 시간(초)
      M = (M + 2 * Math.PI * dt / dur) % (2 * Math.PI);
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h); S.stars(c, w, h, 80, 4);
      var b = a * Math.sqrt(1 - e * e), sc = Math.min((w * 0.9) / (2 * a), (h * 0.84) / (2 * b));
      var cx = w / 2, cy = h / 2, fx = cx + a * e * sc; // 태양 = 오른쪽 초점
      function pos(Mx) { var E = kepE(Mx, e); return [cx + a * Math.cos(E) * sc, cy - b * Math.sin(E) * sc, a * (1 - e * Math.cos(E))]; }
      // 면적 부채꼴
      var areas = [];
      for (var k = 0; k < N; k++) {
        var pts = [], A = 0;
        for (var j = 0; j <= 24; j++) pts.push(pos(2 * Math.PI * (k + j / 24) / N + Math.PI));
        for (var j2 = 0; j2 < 24; j2++) A += Math.abs((pts[j2][0] - fx) * (pts[j2 + 1][1] - cy) - (pts[j2 + 1][0] - fx) * (pts[j2][1] - cy)) / 2;
        areas.push(A / (sc * sc));
        if (showS) {
          c.beginPath(); c.moveTo(fx, cy); pts.forEach(function (p) { c.lineTo(p[0], p[1]); }); c.closePath();
          c.fillStyle = COLS[k % COLS.length]; c.globalAlpha = k % 2 ? 0.22 : 0.38; c.fill(); c.globalAlpha = 1;
        }
      }
      // 궤도
      c.strokeStyle = "rgba(255,255,255,.55)"; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, cy, a * sc, b * sc, 0, 0, 7); c.stroke(); c.lineWidth = 1;
      // 장축, 초점
      c.strokeStyle = "rgba(255,255,255,.18)"; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(cx - a * sc, cy); c.lineTo(cx + a * sc, cy); c.stroke(); c.setLineDash([]);
      S.dot(c, cx - a * e * sc, cy, 3, "rgba(255,255,255,.5)");
      var g = c.createRadialGradient(fx, cy, 0, fx, cy, 16); g.addColorStop(0, "#fff7cc"); g.addColorStop(1, "rgba(251,191,36,0)"); c.fillStyle = g; c.beginPath(); c.arc(fx, cy, 16, 0, 7); c.fill(); S.dot(c, fx, cy, 6, "#fbbf24");
      S.tag(c, "근일점", cx + a * sc - 4, cy + 22, { align: "right", size: 11 }); S.tag(c, "원일점", cx - a * sc + 4, cy + 22, { size: 11 });
      // 행성 (근일점에서 시작: M=0 → E=0 이 오른쪽 끝)
      var p = pos(M), r = p[2], v = 29.78 * Math.sqrt(2 / r - 1 / a);
      var E = kepE(M, e), vx = -a * Math.sin(E), vy = -b * Math.cos(E), vn = Math.hypot(vx, vy);
      c.strokeStyle = "rgba(255,255,255,.4)"; c.beginPath(); c.moveTo(fx, cy); c.lineTo(p[0], p[1]); c.stroke();
      if (showV) S.arrow(c, p[0], p[1], p[0] + vx / vn * v * 2.2, p[1] + vy / vn * v * 2.2, "#34d399", 2.5);
      S.dot(c, p[0], p[1], 7, "#60a5fa", "#fff");
      S.tag(c, v.toFixed(1) + " km/s", p[0] + 10, p[1] - 10, { size: 11, bg: "rgba(15,157,107,.85)" });
      var amin = Math.min.apply(null, areas), amax = Math.max.apply(null, areas);
      var q = a * (1 - e), Q = a * (1 + e);
      $("orb-out").innerHTML = "공전 주기 P = a<sup>1.5</sup> = <b>" + P.toFixed(2) + " 년</b><br>근일점 거리 <b>" + q.toFixed(2) + "</b> AU · 원일점 거리 <b>" + Q.toFixed(2) + "</b> AU<br>근일점 속력 <b>" + (29.78 * Math.sqrt(2 / q - 1 / a)).toFixed(1) + "</b> km/s · 원일점 속력 <b>" + (29.78 * Math.sqrt(2 / Q - 1 / a)).toFixed(1) + "</b> km/s<br>속력 비 (1+e)/(1−e) = <b>" + ((1 + e) / (1 - e)).toFixed(2) + "</b><br>부채꼴 넓이(AU²): 최소 " + amin.toFixed(3) + " / 최대 " + amax.toFixed(3) + "<br>→ 차이 <b>" + ((amax - amin) / amax * 100).toFixed(1) + "%</b> (계산 오차 수준)";
    });
  })();

  /* ---------- 시뮬레이션 2: 질량 중심 ---------- */
  (function () {
    var cv = $("sim-bary"); if (!cv) return;
    var iq = $("bary-q"), th = 0, hist = [];
    document.querySelectorAll("[data-p]").forEach(function (b) {
      b.addEventListener("click", function () { iq.value = { 1: Math.log10(81.3), 2: Math.log10(1047), 3: Math.log10(2) }[b.dataset.p]; hist = []; });
    });
    iq.addEventListener("input", function () { hist = []; });
    S.loop(function (dt) {
      var f = S.fit(cv, 0.52), c = f.ctx, w = f.w, h = f.h;
      var q = Math.pow(10, +iq.value); // M/m
      $("bary-qv").textContent = (q < 10 ? q.toFixed(1) : Math.round(q)) + " : 1";
      th += dt * 1.4;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h); S.stars(c, w, h, 70, 2);
      var cx = w * 0.32, cy = h * 0.5, D = Math.min(w * 0.26, h * 0.4);
      var a1 = D / (1 + q), a2 = D * q / (1 + q);
      var x1 = cx - Math.cos(th) * a1, y1 = cy + Math.sin(th) * a1 * 0.35, x2 = cx + Math.cos(th) * a2, y2 = cy - Math.sin(th) * a2 * 0.35;
      c.strokeStyle = "rgba(255,255,255,.2)"; c.beginPath(); c.ellipse(cx, cy, a2, a2 * 0.35, 0, 0, 7); c.stroke();
      c.strokeStyle = "rgba(251,191,36,.6)"; c.beginPath(); c.ellipse(cx, cy, Math.max(a1, 0.5), Math.max(a1 * 0.35, 0.3), 0, 0, 7); c.stroke();
      var R1 = 16 + 6 * Math.min(1, +iq.value / 3), R2 = Math.max(4, 16 - 4 * +iq.value);
      var front = Math.sin(th) > 0;
      function big() { var g = c.createRadialGradient(x1 - 4, y1 - 4, 1, x1, y1, R1); g.addColorStop(0, "#fff7cc"); g.addColorStop(1, "#f59e0b"); c.fillStyle = g; c.beginPath(); c.arc(x1, y1, R1, 0, 7); c.fill(); }
      function small() { S.dot(c, x2, y2, R2, "#60a5fa"); }
      if (front) { big(); small(); } else { small(); big(); }
      c.strokeStyle = "#f87171"; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 7, cy); c.lineTo(cx + 7, cy); c.moveTo(cx, cy - 7); c.lineTo(cx, cy + 7); c.stroke(); c.lineWidth = 1;
      S.tag(c, "질량 중심", cx, cy + 34 + a1 * 0.35, { align: "center", size: 11, bg: "rgba(220,38,38,.8)" });
      S.tag(c, "관측자 방향 ↓", 10, h - 8, { size: 11 });
      // 시선 속도 그래프 (큰 천체)
      var vr = Math.cos(th) / (1 + q); hist.push(vr); if (hist.length > 360) hist.shift();
      var gx = w * 0.62, gw = w * 0.34, gy = h * 0.2, gh = h * 0.6;
      c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(gx, gy, gw, gh);
      c.beginPath(); c.moveTo(gx, gy + gh / 2); c.lineTo(gx + gw, gy + gh / 2); c.stroke();
      var amp = Math.max(1 / (1 + q), 1e-9), disp = Math.min(1, amp * 1.6);
      c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath();
      hist.forEach(function (v, i) { var X = gx + i / 360 * gw, Y = gy + gh / 2 - v / amp * disp * gh * 0.4; if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }); c.stroke(); c.lineWidth = 1;
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(12, true); c.fillText("큰 천체의 시선 속도", gx, gy - 8);
      c.font = S.font(11); c.fillText("+ 멀어짐 (적색 편이)", gx + 4, gy + 14); c.fillText("− 다가옴 (청색 편이)", gx + 4, gy + gh - 6);
      var extra = "";
      if (Math.abs(q - 1047) < 30) extra = "<br>태양 중심 → 질량 중심 <b>약 74만 km</b> (태양 반지름의 1.07배)";
      if (Math.abs(q - 81.3) < 3) extra = "<br>지구 중심 → 질량 중심 <b>약 4700 km</b> (지구 안쪽)";
      $("bary-out").innerHTML = "큰 천체까지 거리 : 작은 천체까지 거리 = <b>1 : " + (q < 10 ? q.toFixed(1) : Math.round(q)) + "</b><br>큰 천체의 흔들림 속력은 작은 천체의 <b>" + (1 / q < 0.01 ? (1 / q).toExponential(1) : (1 / q).toFixed(3)) + "배</b>" + extra;
    });
  })();

  /* ---------- 데이터 랩: 제3법칙 회귀와 질량 ---------- */
  (function () {
    var cv = $("lab-kep"); if (!cv) return;
    var G = 6.674e-11, AU = 1.496e11, YR = 3.156e7, DAY = 86400;
    var SYS = {
      sun: { unitA: "AU", unitP: "년", fa: AU, fp: YR, name: "태양", true: 1.989e30, rows: [
        ["수성", 0.387, 0.241, "행성"], ["금성", 0.723, 0.615, "행성"], ["지구", 1.000, 1.000, "행성"], ["화성", 1.524, 1.881, "행성"],
        ["목성", 5.203, 11.86, "행성"], ["토성", 9.537, 29.46, "행성"], ["천왕성", 19.19, 84.01, "행성"], ["해왕성", 30.07, 164.8, "행성"],
        ["세레스", 2.767, 4.60, "왜소 행성"], ["명왕성", 39.48, 248.0, "왜소 행성"], ["에리스", 67.86, 559, "왜소 행성"], ["세드나", 506, 11400, "카이퍼대 너머"],
        ["베스타", 2.362, 3.63, "소행성"], ["엔케 혜성", 2.215, 3.30, "혜성"], ["핼리 혜성", 17.83, 75.3, "혜성"]] },
      jup: { unitA: "만 km", unitP: "일", fa: 1e7, fp: DAY, name: "목성", true: 1.898e27, rows: [
        ["아말테아", 18.14, 0.4982, "안쪽 위성"], ["이오", 42.17, 1.769, "갈릴레이 위성"], ["유로파", 67.10, 3.551, "갈릴레이 위성"],
        ["가니메데", 107.04, 7.155, "갈릴레이 위성"], ["칼리스토", 188.27, 16.689, "갈릴레이 위성"], ["히말리아", 1146, 250.6, "불규칙 위성"]] },
      earth: { unitA: "만 km", unitP: "일", fa: 1e7, fp: DAY, name: "지구", true: 5.972e24, rows: [
        ["국제우주정거장", 0.679, 0.06438, "인공위성"], ["허블 망원경", 0.6915, 0.06625, "인공위성"], ["GPS 위성", 2.656, 0.49863, "인공위성"],
        ["정지 궤도 위성", 4.2164, 0.99727, "인공위성"], ["달", 38.44, 27.322, "자연 위성"]] }
    };
    var sys = "sun", logAx = true, fit = true;
    $("lab-sys").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; sys = b.dataset.s; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); $("lab-pa").value = 0.5; render(); });
    $("lab-log").addEventListener("click", function () { logAx = !logAx; this.classList.toggle("on", logAx); draw(); });
    $("lab-fit").addEventListener("click", function () { fit = !fit; this.classList.toggle("on", fit); draw(); });
    $("lab-pa").addEventListener("input", draw);
    $("lab-csv").addEventListener("click", function () {
      var rows = []; Object.keys(SYS).forEach(function (k) { SYS[k].rows.forEach(function (r) { rows.push([SYS[k].name, r[0], r[3], r[1] * SYS[k].fa, r[2] * SYS[k].fp]); }); });
      S.csv("kepler_third_law.csv", ["central_body", "object", "type", "a_m", "P_s"], rows);
    });
    function mass(r, s) { var a = r[1] * s.fa, P = r[2] * s.fp; return 4 * Math.PI * Math.PI * a * a * a / (G * P * P); }
    function render() {
      var s = SYS[sys];
      S.table($("lab-table"), ["천체", "분류", "a (" + s.unitA + ")", "P (" + s.unitP + ")", "log a", "log P", "4π²a³/GP² (kg)"],
        s.rows.map(function (r) { return [r[0], r[3], r[1], r[2], Math.log10(r[1]).toFixed(3), Math.log10(r[2]).toFixed(3), mass(r, s).toExponential(3)]; }));
      $("lab-n").textContent = "중심 천체: " + s.name + " · " + s.rows.length + "개";
      draw();
    }
    function draw() {
      var s = SYS[sys], f = S.fit(cv, 0.66), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var xs = s.rows.map(function (r) { return r[1]; }), ys = s.rows.map(function (r) { return r[2]; });
      var lx = xs.map(Math.log10), ly = ys.map(Math.log10), L = S.linreg(lx, ly);
      var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs), y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
      var o = logAx ? { x0: Math.pow(10, Math.floor(Math.log10(x0))), x1: Math.pow(10, Math.ceil(Math.log10(x1))), y0: Math.pow(10, Math.floor(Math.log10(y0))), y1: Math.pow(10, Math.ceil(Math.log10(y1))), xlog: true, ylog: true }
        : { x0: 0, x1: x1 * 1.08, y0: 0, y1: y1 * 1.08 };
      o.x = 66; o.y = 14; o.w = w - 84; o.h = h - 62; o.xl = "궤도 긴반지름 a (" + s.unitA + ")"; o.yl = "공전 주기 P (" + s.unitP + ")";
      var A = S.axes(c, o);
      if (fit) {
        c.save(); c.beginPath(); c.rect(o.x, o.y, o.w, o.h); c.clip();
        c.strokeStyle = "rgba(251,191,36,.8)"; c.lineWidth = 2; c.beginPath(); var first = true;
        for (var k = 0; k <= 100; k++) { var xv = logAx ? Math.pow(10, Math.log10(o.x0) + k / 100 * (Math.log10(o.x1) - Math.log10(o.x0))) : o.x0 + k / 100 * (o.x1 - o.x0); if (xv <= 0) continue; var yv = Math.pow(10, L.m * Math.log10(xv) + L.b); var px = A.X(xv), py = A.Y(yv); if (!first) c.lineTo(px, py); else { c.moveTo(px, py); first = false; } }
        c.stroke(); c.restore(); c.lineWidth = 1;
      }
      var CC = { "행성": "#60a5fa", "왜소 행성": "#a78bfa", "카이퍼대 너머": "#94a3b8", "소행성": "#84cc16", "혜성": "#2dd4bf", "안쪽 위성": "#f472b6", "갈릴레이 위성": "#f59e0b", "불규칙 위성": "#fb7185", "인공위성": "#38bdf8", "자연 위성": "#e5e7eb" };
      s.rows.forEach(function (r) { var px = A.X(r[1]), py = A.Y(r[2]); S.dot(c, px, py, 5.5, CC[r[3]] || "#fff", "#000"); c.fillStyle = "rgba(255,255,255,.85)"; c.font = S.font(11); c.textAlign = "left"; c.fillText(r[0], px + 8, py - 6); });
      // 예측 점
      var t = +$("lab-pa").value, la = Math.log10(x0) + t * (Math.log10(x1) - Math.log10(x0)), av = Math.pow(10, la), pv = Math.pow(10, L.m * la + L.b);
      var ppx = A.X(av), ppy = A.Y(pv);
      c.strokeStyle = "rgba(244,114,182,.7)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(ppx, o.y + o.h); c.lineTo(ppx, ppy); c.lineTo(o.x, ppy); c.stroke(); c.setLineDash([]);
      S.dot(c, ppx, ppy, 7, "rgba(244,114,182,.9)", "#fff");
      $("lab-pv").textContent = S.nice(av, 2) + " " + s.unitA;
      $("lab-pred").innerHTML = "회귀식: log P = <b>" + L.m.toFixed(3) + "</b> log a " + (L.b >= 0 ? "+ " : "− ") + Math.abs(L.b).toFixed(3) + "<br>a = " + S.nice(av, 2) + " " + s.unitA + " → 예측 P ≈ <b>" + S.nice(pv, 2) + " " + s.unitP + "</b>";
      var ms = s.rows.map(function (r) { return mass(r, s); }), mean = ms.reduce(function (p, q) { return p + q; }, 0) / ms.length;
      $("lab-kpi").innerHTML = "<div><small>기울기</small><b>" + L.m.toFixed(3) + "</b></div><div><small>결정 계수 r²</small><b>" + L.r2.toFixed(5) + "</b></div><div><small>" + s.name + " 질량 (평균)</small><b>" + mean.toExponential(2) + " kg</b></div><div><small>참값과 차이</small><b>" + ((mean / s.true - 1) * 100).toFixed(1) + "%</b></div>";
    }
    render(); S.onResize(draw);
  })();
})();
