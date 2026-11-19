/* III-03 우리은하의 회전과 질량 분포 */
(function () {
  var S = window.SIM, $ = S.$, D2R = Math.PI / 180, Gk = 4.30091e-6;

  /* ---------- 시뮬레이션 1: 21 cm 접선점 ---------- */
  (function () {
    var cv = $("sim-21"); if (!cv) return;
    var R0 = 8.2, V0 = 230, R = S.rand(21), CL = [], rec = [];
    function Vr(r) { return 230 * (1 - Math.exp(-r / 1.4)) + 8 * Math.exp(-Math.pow((r - 1) / 0.8, 2)); }
    for (var i = 0; i < 2600; i++) { var arm = i % 4, r = 1 + Math.pow(R(), 0.9) * 15, th = Math.log(r / 2) / 0.24 + arm * Math.PI / 2 + R.gauss() * 0.3; if (R() < 0.35) th = R() * 2 * Math.PI; CL.push([r * Math.cos(th), r * Math.sin(th), 0.5 + R()]); }
    var il = $("h21-l");
    $("h21-rec").addEventListener("click", function () { var s = spec(+il.value); rec = rec.filter(function (q) { return q.l !== +il.value; }); rec.push({ l: +il.value, R: R0 * Math.sin(+il.value * D2R), V: s.vmax + V0 * Math.sin(+il.value * D2R) }); draw(); });
    $("h21-clr").addEventListener("click", function () { rec = []; draw(); });
    il.addEventListener("input", draw);
    function spec(l) {
      var d = [Math.sin(l * D2R), Math.cos(l * D2R)], sun = [0, -R0], vs = [V0, 0], bins = new Array(141).fill(0), vmax = -999, near = [];
      CL.forEach(function (c) {
        var px = c[0] - sun[0], py = c[1] - sun[1], along = px * d[0] + py * d[1]; if (along < 0) return;
        var perp = Math.abs(px * d[1] - py * d[0]); if (perp > 0.35) return;
        var r = Math.hypot(c[0], c[1]), v = Vr(r), vc = [-c[1] / r * v, c[0] / r * v], vr = (vc[0] - vs[0]) * d[0] + (vc[1] - vs[1]) * d[1];
        near.push(c); if (vr > vmax) vmax = vr;
        for (var k = 0; k < 141; k++) { var vv = -150 + k * 2.5; bins[k] += c[2] * Math.exp(-Math.pow((vv - vr) / 7, 2)); }
      });
      return { bins: bins, vmax: vmax, near: near, d: d };
    }
    function draw() {
      var f = S.fit(cv, 0.42), c = f.ctx, w = f.w, h = f.h, l = +il.value, s = spec(l);
      $("h21-lv").textContent = l + "°";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 은하 지도
      var gw = w * 0.3, sc = Math.min(gw, h) / 34, cx = gw / 2 + 4, cy = h / 2;
      CL.forEach(function (q) { c.fillStyle = "rgba(147,197,253,.35)"; c.fillRect(cx + q[0] * sc, cy - q[1] * sc, 1.3, 1.3); });
      s.near.forEach(function (q) { c.fillStyle = "#fbbf24"; c.fillRect(cx + q[0] * sc - 0.5, cy - q[1] * sc - 0.5, 2, 2); });
      var sx = cx, sy = cy + R0 * sc; S.dot(c, cx, cy, 4, "#fff"); S.dot(c, sx, sy, 4, "#fde047");
      c.strokeStyle = "rgba(251,191,36,.7)"; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + s.d[0] * 24 * sc, sy - s.d[1] * 24 * sc); c.stroke();
      var tp = [R0 * Math.sin(l * D2R) * Math.cos(l * D2R), -R0 + R0 * Math.cos(l * D2R) * Math.cos(l * D2R)];
      tp = [0 + Math.sin(l * D2R) * R0 * Math.cos(l * D2R), -R0 + Math.cos(l * D2R) * R0 * Math.cos(l * D2R)];
      S.dot(c, cx + tp[0] * sc, cy - tp[1] * sc, 4, "#ef4444"); c.strokeStyle = "rgba(239,68,68,.5)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + tp[0] * sc, cy - tp[1] * sc); c.stroke(); c.setLineDash([]);
      c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(10); c.fillText("태양", sx + 6, sy + 4); c.fillText("접선점", cx + tp[0] * sc + 6, cy - tp[1] * sc);
      // 스펙트럼
      var mx = Math.max.apply(null, s.bins) || 1;
      var A = S.axes(c, { x: w * 0.34, y: 14, w: w * 0.3, h: h - 52, x0: -150, x1: 200, y0: 0, y1: 1.1, yt: [], xl: "시선 속도 (km/s)", yl: "" });
      c.strokeStyle = "#34d399"; c.lineWidth = 2; c.beginPath(); s.bins.forEach(function (b, k) { var X = A.X(-150 + k * 2.5), Y = A.Y(b / mx); if (k) c.lineTo(X, Y); else c.moveTo(X, Y); }); c.stroke(); c.lineWidth = 1;
      c.strokeStyle = "#ef4444"; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(A.X(s.vmax), 14); c.lineTo(A.X(s.vmax), h - 38); c.stroke(); c.setLineDash([]);
      c.fillStyle = "#fca5a5"; c.font = S.font(10, true); c.fillText("최대 " + Math.round(s.vmax), A.X(s.vmax) + 3, 26);
      // 회전 곡선
      var B = S.axes(c, { x: w * 0.72, y: 14, w: w * 0.26, h: h - 52, x0: 0, x1: 9, y0: 0, y1: 300, xl: "R (kpc)", yl: "" });
      if (rec.length >= 4) { c.strokeStyle = "rgba(255,255,255,.25)"; c.beginPath(); for (var r = 0.2; r <= 9; r += 0.1) { if (r === 0.2) c.moveTo(B.X(r), B.Y(Vr(r))); else c.lineTo(B.X(r), B.Y(Vr(r))); } c.stroke(); }
      rec.forEach(function (q) { S.dot(c, B.X(q.R), B.Y(q.V), 4, "#fbbf24", "#000"); });
      c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(11, true); c.fillText("V (km/s)", w * 0.72, 12);
      var Rt = R0 * Math.sin(l * D2R);
      $("h21-out").innerHTML = "접선점 거리 R = R₀ sin l = <b>" + Rt.toFixed(2) + " kpc</b><br>최대 시선 속도 = <b>" + Math.round(s.vmax) + " km/s</b><br>V(R) = v<sub>max</sub> + V₀ sin l = <b>" + Math.round(s.vmax + V0 * Math.sin(l * D2R)) + " km/s</b><br>기록 " + rec.length + "개" + (rec.length >= 4 ? " · 회색 선: 모형의 실제 회전 곡선" : "");
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: 회전 방식 ---------- */
  (function () {
    var cv = $("sim-rc"); if (!cv) return;
    var mode = "flat", N = 14, ang = [];
    function reset() { ang = []; for (var i = 0; i < N; i++) ang.push(0); }
    reset();
    $("rc-reset").addEventListener("click", reset);
    $("rc-mode").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; mode = b.dataset.m; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); reset(); });
    function V(r) { return mode === "rigid" ? 20 * r : mode === "kepler" ? 200 / Math.sqrt(r) : 200 * (1 - Math.exp(-r / 1.2)); }
    S.loop(function (dt) {
      var f = S.fit(cv, 0.48), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var cx = w * 0.3, cy = h / 2, sc = Math.min(w * 0.27, h * 0.45) / 10.5;
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, 2.2 * sc); g.addColorStop(0, "rgba(253,224,71,.8)"); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 2.2 * sc, 0, 7); c.fill();
      for (var i = 0; i < N; i++) {
        var r = 0.7 + i * 0.7; ang[i] -= V(r) / r * dt * 0.02;
        c.strokeStyle = "rgba(255,255,255,.07)"; c.beginPath(); c.arc(cx, cy, r * sc, 0, 7); c.stroke();
        S.dot(c, cx + Math.cos(ang[i]) * r * sc, cy + Math.sin(ang[i]) * r * sc, 4, "#93c5fd");
      }
      c.strokeStyle = "rgba(147,197,253,.4)"; c.beginPath(); for (var j = 0; j < N; j++) { var rr = 0.7 + j * 0.7; var X = cx + Math.cos(ang[j]) * rr * sc, Y = cy + Math.sin(ang[j]) * rr * sc; if (j) c.lineTo(X, Y); else c.moveTo(X, Y); } c.stroke();
      var A = S.axes(c, { x: w * 0.62, y: 16, w: w * 0.34, h: h - 54, x0: 0, x1: 10.5, y0: 0, y1: 260, xl: "R", yl: "V", xt: [0, 5, 10], yt: [0, 100, 200] });
      c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath(); for (var r2 = 0.3; r2 <= 10.5; r2 += 0.1) { if (r2 === 0.3) c.moveTo(A.X(r2), A.Y(Math.min(260, V(r2)))); else c.lineTo(A.X(r2), A.Y(Math.min(260, V(r2)))); } c.stroke(); c.lineWidth = 1;
      $("rc-out").innerHTML = { rigid: "<b>강체 회전</b>: V ∝ R, 모든 별의 각속도가 같아 줄이 그대로 유지된다. 은하 중심부의 운동.", kepler: "<b>케플러 회전</b>: V ∝ 1/<span class='sqrt'><span>R</span></span>, 질량이 중심에만 있을 때. 바깥 별이 크게 뒤처진다(태양계 행성처럼).", flat: "<b>평탄한 회전</b>: 바깥쪽 V가 일정 → M(R) ∝ R. 관측된 실제 은하의 회전 방식이다." }[mode];
    });
  })();

  /* ---------- 데이터 랩: NGC 3198 ---------- */
  (function () {
    var cv = $("lab-rc"); if (!cv) return;
    var OBS = [[1, 55, 8], [2, 85, 6], [3, 106, 5], [4, 119, 4], [5, 129, 4], [6, 136, 3], [7, 141, 3], [8, 145, 3], [10, 149, 3], [12, 151, 3], [14, 151, 3], [16, 150, 3], [18, 149, 3], [20, 149, 3], [22, 150, 4], [24, 150, 4], [26, 149, 4], [28, 148, 5], [30, 147, 5]];
    function I0(x) { var t = x / 3.75; if (x <= 3.75) { t *= t; return 1 + t * (3.5156229 + t * (3.0899424 + t * (1.2067492 + t * (0.2659732 + t * (0.0360768 + t * 0.0045813))))); } return Math.exp(x) / Math.sqrt(x) * (0.39894228 + (0.01328592 + (0.00225319 + (-0.00157565 + (0.00916281 + (-0.02057706 + (0.02635537 + (-0.01647633 + 0.00392377 / t) / t) / t) / t) / t) / t) / t) / t); }
    function I1(x) { var t = x / 3.75; if (x <= 3.75) { t *= t; return x * (0.5 + t * (0.87890594 + t * (0.51498869 + t * (0.15084934 + t * (0.02658733 + t * (0.00301532 + t * 0.00032411)))))); } return Math.exp(x) / Math.sqrt(x) * (0.39894228 + (-0.03988024 + (-0.00362018 + (0.00163801 + (-0.01031555 + (0.02282967 + (-0.02895312 + (0.01787654 - 0.00420059 / t) / t) / t) / t) / t) / t) / t) / t); }
    function K0(x) { if (x <= 2) { var t = x * x / 4; return -Math.log(x / 2) * I0(x) + (-0.57721566 + t * (0.42278420 + t * (0.23069756 + t * (0.03488590 + t * (0.00262698 + t * (0.00010750 + t * 0.0000074)))))); } var u = 2 / x; return Math.exp(-x) / Math.sqrt(x) * (1.25331414 + u * (-0.07832358 + u * (0.02189568 + u * (-0.01062446 + u * (0.00587872 + u * (-0.00251540 + u * 0.00053208)))))); }
    function K1(x) { if (x <= 2) { var t = x * x / 4; return Math.log(x / 2) * I1(x) + (1 / x) * (1 + t * (0.15443144 + t * (-0.67278579 + t * (-0.18156897 + t * (-0.01919402 + t * (-0.00110404 + t * -0.00004686)))))); } var u = 2 / x; return Math.exp(-x) / Math.sqrt(x) * (1.25331414 + u * (0.23498619 + u * (-0.03655620 + u * (0.01504268 + u * (-0.00780353 + u * (0.00325614 + u * -0.00068245)))))); }
    var hd = 2.7, norm = 0;
    function shape(R) { var y = R / (2 * hd); return Math.max(0, y * y * (I0(y) * K0(y) - I1(y) * K1(y))); }
    for (var r = 0.1; r < 30; r += 0.1) norm = Math.max(norm, shape(r));
    function Vd(R, ml) { return 105 * Math.sqrt(ml * shape(R) / norm); }
    function Vh(R, vi, rc) { return vi * Math.sqrt(Math.max(0, 1 - rc / R * Math.atan(R / rc))); }
    function Vt(R, ml, vi, rc) { return Math.hypot(Vd(R, ml), Vh(R, vi, rc)); }
    function chi(ml, vi, rc) { var s = 0; OBS.forEach(function (o) { var d = (o[1] - Vt(o[0], ml, vi, rc)) / o[2]; s += d * d; }); return s / OBS.length; }
    var id = $("lab-d"), ih = $("lab-h"), ir = $("lab-r"), view = "v";
    [id, ih, ir].forEach(function (e) { e.addEventListener("input", draw); });
    $("lab-view").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; view = b.dataset.v; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    $("lab-csv").addEventListener("click", function () { S.csv("ngc3198_rotation_curve.csv", ["R_kpc", "V_kms", "err_kms"], OBS); });
    $("lab-auto").addEventListener("click", function () {
      var best = [9e9];
      for (var ml = 0; ml <= 2.001; ml += 0.05) for (var vi = 0; vi <= 200; vi += 2) for (var rc = 0.5; rc <= 15; rc += 0.25) { var x = chi(ml, vi, rc); if (x < best[0]) best = [x, ml, vi, rc]; }
      id.value = best[1]; ih.value = best[2]; ir.value = best[3]; draw();
      $("lab-out").innerHTML = "🤖 격자 탐색(약 24만 조합) 결과: M/L 배율 <b>" + best[1].toFixed(2) + "</b>, V<sub>∞</sub> <b>" + best[2] + " km/s</b>, r<sub>c</sub> <b>" + best[3].toFixed(2) + " kpc</b>";
    });
    function draw() {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h, ml = +id.value, vi = +ih.value, rc = +ir.value;
      $("lab-dv").textContent = ml.toFixed(2); $("lab-hv").textContent = vi + " km/s"; $("lab-rv").textContent = rc.toFixed(1) + " kpc";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      if (view === "v") {
        var A = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: 0, x1: 32, y0: 0, y1: 190, xl: "은하 중심에서의 거리 R (kpc)", yl: "회전 속도 (km/s)" });
        function curve(fn, col, wd) { c.strokeStyle = col; c.lineWidth = wd || 2; c.beginPath(); for (var R = 0.2; R <= 32; R += 0.2) { var v = fn(R); if (R === 0.2) c.moveTo(A.X(R), A.Y(v)); else c.lineTo(A.X(R), A.Y(v)); } c.stroke(); c.lineWidth = 1; }
        curve(function (R) { return Vd(R, ml); }, "#60a5fa"); if (vi > 0) curve(function (R) { return Vh(R, vi, rc); }, "#a78bfa"); curve(function (R) { return Vt(R, ml, vi, rc); }, "#fbbf24", 3);
        OBS.forEach(function (o) { var X = A.X(o[0]); c.strokeStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.moveTo(X, A.Y(o[1] - o[2])); c.lineTo(X, A.Y(o[1] + o[2])); c.stroke(); S.dot(c, X, A.Y(o[1]), 3.5, "#fff"); });
        c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(11); c.fillText("● 관측   — 원반   — 헤일로   — 전체", 64, 28);
      } else {
        var B = S.axes(c, { x: 64, y: 14, w: w - 80, h: h - 52, x0: 0, x1: 32, y0: 0, y1: 1.8e11, xl: "R (kpc)", yl: "반지름 안의 질량 (M☉)", yfmt: function (v) { return (v / 1e10).toFixed(0) + "×10¹⁰"; } });
        c.fillStyle = "rgba(167,139,250,.25)"; c.beginPath(); c.moveTo(B.X(OBS[0][0]), B.Y(0));
        OBS.forEach(function (o) { c.lineTo(B.X(o[0]), B.Y(o[1] * o[1] * o[0] / Gk)); }); c.lineTo(B.X(30), B.Y(0)); c.fill();
        c.fillStyle = "rgba(96,165,250,.6)"; c.beginPath(); c.moveTo(B.X(OBS[0][0]), B.Y(0));
        OBS.forEach(function (o) { c.lineTo(B.X(o[0]), B.Y(Math.min(o[1] * o[1], Vd(o[0], ml) * Vd(o[0], ml)) * o[0] / Gk)); }); c.lineTo(B.X(30), B.Y(0)); c.fill();
        S.tag(c, "암흑 물질", B.X(22), B.Y(1.0e11), { bg: "rgba(124,58,237,.85)", size: 11 }); S.tag(c, "보이는 원반", B.X(22), B.Y(1.5e10), { bg: "rgba(37,99,235,.85)", size: 11 });
      }
      function frac(R) { var o = OBS.filter(function (q) { return q[0] === R; })[0]; var Mt = o[1] * o[1] * R / Gk, Md = Math.min(Mt, Vd(R, ml) * Vd(R, ml) * R / Gk); return [Mt, 1 - Md / Mt]; }
      var f5 = frac(5), f30 = frac(30);
      $("lab-kpi").innerHTML = "<div><small>χ²/N (작을수록 좋음)</small><b>" + chi(ml, vi, rc).toFixed(2) + "</b></div><div><small>M(30 kpc)</small><b>" + (f30[0] / 1e11).toFixed(2) + "×10¹¹ M☉</b></div><div><small>암흑 물질 비율 (5 kpc)</small><b>" + Math.round(f5[1] * 100) + "%</b></div><div><small>암흑 물질 비율 (30 kpc)</small><b>" + Math.round(f30[1] * 100) + "%</b></div>";
    }
    draw(); S.onResize(draw);
  })();
})();
