/* III-01 천체의 거리와 우리은하의 구조 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 공통: 우리은하 모형 점 ---------- */
  function galaxy(seed) {
    var R = S.rand(seed), disk = [], bulge = [], gc = [];
    for (var i = 0; i < 2600; i++) {
      var arm = i % 4, r = 2.5 + Math.pow(R(), 0.8) * 13, th = Math.log(r / 2.5) / 0.22 + arm * Math.PI / 2 + R.gauss() * 0.28;
      if (R() < 0.3) th = R() * Math.PI * 2;
      disk.push([r * Math.cos(th), r * Math.sin(th), R.gauss() * 0.25]);
    }
    for (var j = 0; j < 900; j++) { var x = R.gauss() * 2.2, y = R.gauss() * 0.8, z = R.gauss() * 0.7, a = 0.45; bulge.push([x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]); }
    for (var k = 0; k < 150; k++) { var rr = 1 + Math.pow(R(), 1.6) * 20, u = R() * 2 - 1, ph = R() * Math.PI * 2, s = Math.sqrt(1 - u * u); gc.push([rr * s * Math.cos(ph), rr * s * Math.sin(ph), rr * u]); }
    return { disk: disk, bulge: bulge, gc: gc, sun: [-8.2, 0, 0.02] };
  }

  /* ---------- 시뮬레이션 1: 티끌 속 별 세기 ---------- */
  (function () {
    var cv = $("sim-dust"); if (!cv) return;
    var G = galaxy(7), ia = $("dust-a"), showS = true, showG = false, showT = false;
    $("dust-stars").addEventListener("click", function () { showS = !showS; this.classList.toggle("on", showS); draw(); });
    $("dust-gc").addEventListener("click", function () { showG = !showG; this.classList.toggle("on", showG); draw(); });
    $("dust-true").addEventListener("click", function () { showT = !showT; this.classList.toggle("on", showT); draw(); });
    ia.addEventListener("input", draw);
    function draw() {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h, A = +ia.value;
      $("dust-av").textContent = A === 0 ? "없음" : "1 kpc당 " + A.toFixed(2) + "등급";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var sc = Math.min(w, h) / 36, cx = w / 2, cy = h / 2, sx = cx + G.sun[0] * sc, sy = cy + G.sun[1] * sc;
      function P(p) { return [cx + p[0] * sc, cy + p[1] * sc]; }
      var vis = [], sumx = 0, sumy = 0;
      G.disk.concat(G.bulge).forEach(function (p, i) {
        var d = Math.hypot(p[0] - G.sun[0], p[1] - G.sun[1]), ext = A * d, seen = ext < 2.5 && d < 18; // 2.5등급 이상 어두워지면 못 봄(모형)
        var q = P(p);
        if (showT) { c.fillStyle = "rgba(147,197,253,.18)"; c.fillRect(q[0], q[1], 1.5, 1.5); }
        if (seen && showS) { c.fillStyle = "rgba(191,219,254,.9)"; c.fillRect(q[0] - 0.8, q[1] - 0.8, 2, 2); vis.push(p); sumx += p[0]; sumy += p[1]; }
      });
      if (showS && vis.length) { var mx = sumx / vis.length, my = sumy / vis.length, m = P([mx, my]); c.strokeStyle = "#60a5fa"; c.lineWidth = 3; c.beginPath(); c.moveTo(m[0] - 9, m[1] - 9); c.lineTo(m[0] + 9, m[1] + 9); c.moveTo(m[0] + 9, m[1] - 9); c.lineTo(m[0] - 9, m[1] + 9); c.stroke(); c.lineWidth = 1; S.tag(c, "보이는 별들의 중심", m[0] + 12, m[1] + 20, { size: 11, bg: "rgba(37,99,235,.85)" }); }
      if (showG) {
        var gx = 0, gy = 0; G.gc.forEach(function (p) { var q = P(p); c.strokeStyle = "#fb923c"; c.beginPath(); c.arc(q[0], q[1], 3.5, 0, 7); c.stroke(); gx += p[0]; gy += p[1]; });
        var gm = P([gx / G.gc.length, gy / G.gc.length]); c.strokeStyle = "#fb923c"; c.lineWidth = 3; c.beginPath(); c.moveTo(gm[0] - 9, gm[1] - 9); c.lineTo(gm[0] + 9, gm[1] + 9); c.moveTo(gm[0] + 9, gm[1] - 9); c.lineTo(gm[0] - 9, gm[1] + 9); c.stroke(); c.lineWidth = 1;
        S.tag(c, "구상 성단 분포의 중심", gm[0] + 12, gm[1] - 10, { size: 11, bg: "rgba(194,65,12,.9)" });
      }
      if (showT) { S.tag(c, "실제 은하 중심", cx + 10, cy + 30, { size: 11, bg: "rgba(0,0,0,.7)" }); c.strokeStyle = "#fff"; c.beginPath(); c.arc(cx, cy, 5, 0, 7); c.stroke(); }
      S.dot(c, sx, sy, 6, "#fde047", "#000"); S.tag(c, "태양", sx - 14, sy - 10, { size: 11, align: "right", bg: "rgba(161,98,7,.9)" });
      var rv = A > 0 ? 2.5 / A : 18;
      $("dust-out").innerHTML = "보이는 거리 한계 ≈ <b>" + Math.min(18, rv).toFixed(1) + " kpc</b><br>보이는 별 <b>" + vis.length + "개</b>" + (vis.length ? " · 그 중심은 태양에서 <b>" + Math.hypot(sumx / vis.length - G.sun[0], sumy / vis.length - G.sun[1]).toFixed(1) + " kpc</b>" : "") + "<br>" + (A > 0.5 ? "→ 사방으로 비슷한 거리까지만 보여 태양이 중심인 것처럼 보인다." : "→ 티끌이 적으면 은하 중심 쪽에 별이 더 많이 보인다.");
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: 3D 우리은하 ---------- */
  (function () {
    var cv = $("sim-mw"); if (!cv) return;
    var G = galaxy(11), yaw = 0.6, pitch = 1.0, drag = null;
    document.querySelectorAll("[data-v]").forEach(function (b) { b.addEventListener("click", function () { pitch = { top: 0.01, tilt: 1.0, side: 1.5707 }[b.dataset.v]; document.querySelectorAll("[data-v]").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); }); });
    cv.addEventListener("pointerdown", function (e) { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) { if (!drag) return; yaw = drag[2] + (e.clientX - drag[0]) * 0.01; pitch = Math.max(0, Math.min(1.5707, drag[3] + (e.clientY - drag[1]) * 0.01)); draw(); });
    cv.addEventListener("pointerup", function () { drag = null; });
    $("mw-gc").addEventListener("change", draw); $("mw-lab").addEventListener("change", draw);
    function proj(p, sc, cx, cy) { var x = p[0] * Math.cos(yaw) - p[1] * Math.sin(yaw), y = p[0] * Math.sin(yaw) + p[1] * Math.cos(yaw), z = p[2]; var Y = y * Math.cos(pitch) - z * Math.sin(pitch); return [cx + x * sc, cy + Y * sc]; }
    function draw() {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h, sc = Math.min(w, h) / 42, cx = w / 2, cy = h / 2;
      c.fillStyle = "#03040a"; c.fillRect(0, 0, w, h);
      if ($("mw-gc").checked) { c.strokeStyle = "rgba(148,163,184,.18)"; c.beginPath(); c.arc(cx, cy, 20 * sc, 0, 7); c.stroke(); G.gc.forEach(function (p) { var q = proj(p, sc, cx, cy); c.strokeStyle = "rgba(251,146,60,.85)"; c.beginPath(); c.arc(q[0], q[1], 2.5, 0, 7); c.stroke(); }); }
      G.disk.forEach(function (p) { var q = proj(p, sc, cx, cy); c.fillStyle = "rgba(147,197,253,.55)"; c.fillRect(q[0], q[1], 1.6, 1.6); });
      G.bulge.forEach(function (p) { var q = proj(p, sc, cx, cy); c.fillStyle = "rgba(253,224,71,.6)"; c.fillRect(q[0], q[1], 1.6, 1.6); });
      var s = proj(G.sun, sc, cx, cy); S.dot(c, s[0], s[1], 5, "#fde047", "#000");
      if ($("mw-lab").checked) {
        S.tag(c, "태양 (중심에서 8.2 kpc)", s[0] + 8, s[1] - 8, { size: 11, bg: "rgba(161,98,7,.9)" });
        S.tag(c, "팽대부·막대", cx, cy - 18, { size: 11, align: "center" });
        var e = proj([15, 0, 0], sc, cx, cy); S.tag(c, "원반 가장자리 (반지름 15 kpc)", e[0], e[1], { size: 11, align: "center" });
        if ($("mw-gc").checked) { var g = proj([0, 0, 18], sc, cx, cy); S.tag(c, "헤일로 · 구상 성단", g[0], g[1], { size: 11, align: "center", bg: "rgba(194,65,12,.85)" }); }
      }
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 데이터 랩: C-M도 맞추기 ---------- */
  (function () {
    var cv = $("lab-cmd"); if (!cv) return;
    var ZAMS = [[-0.30, -3.6], [-0.20, -1.8], [-0.10, -0.4], [0.0, 0.8], [0.1, 1.6], [0.2, 2.2], [0.3, 2.7], [0.4, 3.3], [0.5, 4.0], [0.6, 4.6], [0.7, 5.2], [0.8, 5.8], [0.9, 6.2], [1.0, 6.6], [1.2, 7.4], [1.4, 8.8], [1.55, 10.0]];
    function bvOf(M) { if (M <= ZAMS[0][1]) return ZAMS[0][0]; for (var i = 0; i < ZAMS.length - 1; i++) if (M >= ZAMS[i][1] && M <= ZAMS[i + 1][1]) { var k = (M - ZAMS[i][1]) / (ZAMS[i + 1][1] - ZAMS[i][1]); return ZAMS[i][0] + k * (ZAMS[i + 1][0] - ZAMS[i][0]); } return 1.55; }
    function model(lg) {
      var t = Math.pow(10, lg), mTO = Math.pow(t / 1e10, -0.4), MTO = 4.8 - 9.5 * Math.log10(mTO);
      MTO = Math.max(-4, MTO);
      var ms = [], gb = [], hb = [];
      for (var M = 9.5; M > MTO; M -= 0.1) { var hook = Math.max(0, 1 - (M - MTO) / 1.2); ms.push([bvOf(M) + 0.06 * hook, M - 0.35 * hook]); }
      var to = ms.length ? ms[ms.length - 1] : [bvOf(MTO), MTO];
      var old = lg > 9.2, tipM = old ? -2.4 : Math.min(-2.0, MTO - 2.5), baseBV = old ? 0.95 : 1.1;
      // 준거성 가지 → 적색 거성 가지
      for (var k = 0; k <= 10; k++) gb.push([to[0] + (baseBV - to[0]) * k / 10, to[1] + (old ? 0.4 : 0.6) * Math.sin(Math.PI * k / 20)]);
      var b0 = gb[gb.length - 1];
      for (var k2 = 1; k2 <= 14; k2++) { var u = k2 / 14; gb.push([b0[0] + (1.55 - b0[0]) * Math.pow(u, 1.6), b0[1] + (tipM - b0[1]) * u]); }
      if (lg > 9.9) for (var k3 = 0; k3 <= 8; k3++) hb.push([-0.05 + 0.75 * k3 / 8, 0.6 + 0.1 * Math.sin(k3)]);
      return { ms: ms, gb: gb, hb: hb, MTO: MTO };
    }
    var TRUE = [[8.0, 5.65, 16], [8.8, 3.33, 13], [9.6, 9.60, 19.5], [10.08, 14.40, 22]];
    var DATA = TRUE.map(function (q, ci) {
      var R = S.rand(300 + ci), m = model(q[0]), pts = [];
      var faintM = Math.min(9.3, q[2] - q[1]);
      for (var i = 0; i < 230; i++) {
        var M = m.MTO + 0.1 + Math.pow(R(), 0.75) * (faintM - m.MTO - 0.1), near = null, best = 9;
        m.ms.forEach(function (p) { var d = Math.abs(p[1] - M); if (d < best) { best = d; near = p; } });
        if (!near) continue;
        var bin = R() < 0.12 ? -0.6 * R() : 0;
        pts.push([near[0] + R.gauss() * 0.025, near[1] + bin + q[1] + R.gauss() * 0.04]);
      }
      var ng = ci === 3 ? 45 : ci === 2 ? 22 : 8;
      for (var g = 0; g < ng; g++) { var p = m.gb[Math.floor(Math.pow(R(), 0.7) * m.gb.length)]; pts.push([p[0] + R.gauss() * 0.03, p[1] + q[1] + R.gauss() * 0.08]); }
      if (m.hb.length) for (var hbi = 0; hbi < 25; hbi++) { var p2 = m.hb[Math.floor(R() * m.hb.length)]; pts.push([p2[0] + R.gauss() * 0.04, p2[1] + q[1] + R.gauss() * 0.06]); }
      return pts.map(function (p) { return [+p[0].toFixed(3), +p[1].toFixed(3)]; });
    });
    var cl = 0, idm = $("lab-dm"), iag = $("lab-ag"), cache = {};
    function mdl(lg) { var key = lg.toFixed(2); if (!cache[key]) { var m = model(lg), pts = []; function dens(arr) { for (var i = 0; i < arr.length - 1; i++) for (var s = 0; s < 4; s++) { var k = s / 4; pts.push([arr[i][0] + (arr[i + 1][0] - arr[i][0]) * k, arr[i][1] + (arr[i + 1][1] - arr[i][1]) * k]); } } dens(m.ms); dens(m.gb); m.hb.forEach(function (p) { pts.push(p); }); m.pts = pts; cache[key] = m; } return cache[key]; }
    function resid(data, lg, dm, st) { st = st || 1; var m = mdl(lg), s = 0, n = 0; data.forEach(function (o, j) { if (j % st) return; n++; var best = 4; for (var i = 0; i < m.pts.length; i += st) { var p = m.pts[i], dx = (o[0] - p[0]) * 6, dy = o[1] - dm - p[1], d = dx * dx + dy * dy; if (d < best) best = d; } s += best; }); return s / n; }
    $("lab-cl").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; cl = +b.dataset.c; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); $("lab-out").innerHTML = "슬라이더로 맞춰 보자."; draw(); });
    idm.addEventListener("input", draw); iag.addEventListener("input", draw);
    $("lab-csv").addEventListener("click", function () { var rows = []; DATA.forEach(function (d, ci) { d.forEach(function (p) { rows.push(["ABCD"[ci], p[0], p[1]]); }); }); S.csv("cluster_cmd_mock.csv", ["cluster", "B_V", "V"], rows); });
    $("lab-auto").addEventListener("click", function () {
      var d = DATA[cl], best = [9e9, 0, 0];
      for (var dm = 3; dm <= 17; dm += 0.25) for (var lg = 7; lg <= 10.15; lg += 0.1) { var r = resid(d, lg, dm, 3); if (r < best[0]) best = [r, dm, lg]; }
      var b2 = best.slice();
      for (var dm2 = best[1] - 0.3; dm2 <= best[1] + 0.3; dm2 += 0.02) for (var lg2 = Math.max(7, best[2] - 0.12); lg2 <= Math.min(10.15, best[2] + 0.12); lg2 += 0.01) { var r2 = resid(d, lg2, dm2); if (r2 < b2[0]) b2 = [r2, dm2, lg2]; }
      idm.value = b2[1]; iag.value = b2[2]; draw();
      $("lab-out").innerHTML = "🤖 격자 탐색 결과: m − M = <b>" + b2[1].toFixed(2) + "</b>, 나이 = <b>" + ageStr(b2[2]) + "</b><br>(시험한 조합: 약 " + (57 * 32 + 31 * 25) + "개)";
    });
    function ageStr(lg) { var t = Math.pow(10, lg); return t >= 1e9 ? (t / 1e9).toFixed(1) + "×10⁹ 년" : (t / 1e8).toFixed(1) + "×10⁸ 년"; }
    function draw() {
      var f = S.fit(cv, 0.72), c = f.ctx, w = f.w, h = f.h, dm = +idm.value, lg = +iag.value, d = DATA[cl];
      $("lab-dmv").textContent = dm.toFixed(2); $("lab-agv").textContent = lg.toFixed(2) + " (" + ageStr(lg) + ")";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var ys = d.map(function (p) { return p[1]; }), ymin = Math.floor(Math.min.apply(null, ys)) - 1, ymax = Math.ceil(Math.max.apply(null, ys)) + 1;
      var A = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: -0.4, x1: 1.8, y0: ymax, y1: ymin, xl: "색지수 B − V", yl: "겉보기 등급 V" });
      d.forEach(function (p) { c.fillStyle = S.tempColor(Math.max(2600, 7090 / (p[0] + 0.72))); c.globalAlpha = 0.85; c.beginPath(); c.arc(A.X(p[0]), A.Y(p[1]), 2.4, 0, 7); c.fill(); c.globalAlpha = 1; });
      var m = mdl(lg);
      c.save(); c.beginPath(); c.rect(56, 14, w - 72, h - 52); c.clip();
      c.strokeStyle = "#fbbf24"; c.lineWidth = 2.5;
      [m.ms, m.gb].forEach(function (arr) { c.beginPath(); arr.forEach(function (p, i) { var X = A.X(p[0]), Y = A.Y(p[1] + dm); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }); c.stroke(); });
      m.hb.forEach(function (p) { S.dot(c, A.X(p[0]), A.Y(p[1] + dm), 3, "#fbbf24"); });
      c.restore(); c.lineWidth = 1;
      var r = resid(d, lg, dm), dist = Math.pow(10, (dm + 5) / 5);
      $("lab-kpi").innerHTML = "<div><small>평균 제곱 잔차</small><b>" + r.toFixed(3) + "</b></div><div><small>거리</small><b>" + (dist < 1000 ? dist.toFixed(0) + " pc" : (dist / 1000).toFixed(2) + " kpc") + "</b></div><div><small>나이</small><b>" + ageStr(lg) + "</b></div><div><small>별 수</small><b>" + d.length + "</b></div>";
    }
    draw(); S.onResize(draw);
  })();
})();
