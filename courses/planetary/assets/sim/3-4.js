/* III-04 전천 탐사와 은하의 공간 분포 */
(function () {
  var S = window.SIM, $ = S.$, D2R = Math.PI / 180, C = 299792.458;

  /* 보로노이 우주 그물: 씨앗(공동 중심)에서 가장 가까운 두 씨앗까지의 거리 차가 작은 곳 = 벽 */
  function web(R, box, nSeed, nWant, wallW, sampler) {
    var seeds = []; for (var i = 0; i < nSeed; i++) seeds.push([box[0][0] + R() * (box[0][1] - box[0][0]), box[1][0] + R() * (box[1][1] - box[1][0]), box[2][0] + R() * (box[2][1] - box[2][0])]);
    var out = [], tries = 0;
    while (out.length < nWant && tries < nWant * 60) {
      tries++; var p = sampler ? sampler() : [box[0][0] + R() * (box[0][1] - box[0][0]), box[1][0] + R() * (box[1][1] - box[1][0]), box[2][0] + R() * (box[2][1] - box[2][0])];
      if (!p) continue;
      var d1 = 1e9, d2 = 1e9;
      for (var k = 0; k < seeds.length; k++) { var s = seeds[k], dx = p[0] - s[0], dy = p[1] - s[1], dz = p[2] - s[2], d = dx * dx + dy * dy + dz * dz; if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d; }
      var w = Math.sqrt(d2) - Math.sqrt(d1);
      if (R() < Math.exp(-w / wallW) || R() < 0.015) out.push(p);
    }
    return out;
  }

  /* ---------- 시뮬레이션 1: 적색 편이 측정 ---------- */
  (function () {
    var cv = $("sim-z"); if (!cv) return;
    var LINES = [[393.4, "K", -1], [396.8, "H", -1], [486.1, "Hβ", 1], [517.5, "Mg", -1], [589.3, "Na", -1], [656.3, "Hα", 1]];
    var GAL = [0.0123, 0.0371, 0.0752, 0.1418], R = S.rand(4), NOISE = [];
    for (var i = 0; i < 600; i++) NOISE.push(R.gauss());
    var ig = $("z-gal"), iz = $("z-z");
    function draw() {
      var f = S.fit(cv, 0.5), c = f.ctx, w = f.w, h = f.h, zt = GAL[+ig.value], ze = +iz.value;
      $("z-zv").textContent = ze.toFixed(4);
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var x0 = 50, ww = w - 66, L0 = 370, L1 = 800; function X(l) { return x0 + (l - L0) / (L1 - L0) * ww; }
      // 위: 기준선 (추정 z만큼 이동)
      var ty = 18, th = h * 0.22;
      for (var l = 380; l < 750; l += 3) { var hue = 270 - (l - 380) / 370 * 270; c.fillStyle = "hsla(" + hue + ",85%,50%,.75)"; c.fillRect(X(l), ty, X(l + 3) - X(l) + 0.5, th); }
      LINES.forEach(function (q) { var x = X(q[0] * (1 + ze)); c.fillStyle = q[2] < 0 ? "#000" : "#fff"; c.fillRect(x - 1.5, ty, 3, th); c.fillStyle = "#fff"; c.font = S.font(10, true); c.textAlign = "center"; c.fillText(q[1], x, ty + th + 12); });
      c.textAlign = "left"; c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(11); c.fillText("기준 스펙트럼을 z = " + ze.toFixed(4) + "만큼 이동", x0, 12);
      // 아래: 관측 스펙트럼
      var A = S.axes(c, { x: x0, y: h * 0.42, w: ww, h: h * 0.42, x0: L0, x1: L1, y0: 0, y1: 1.6, yt: [], xl: "관측 파장 (nm)", yl: "" });
      c.strokeStyle = "#e5e7eb"; c.lineWidth = 1.2; c.beginPath();
      for (var k = 0; k < 600; k++) {
        var lam = L0 + k / 599 * (L1 - L0), rest = lam / (1 + zt), fl = 0.55 + 0.45 * (rest - 370) / 430;
        LINES.forEach(function (q) { var d = rest - q[0]; fl += q[2] < 0 ? -0.35 * Math.exp(-d * d / 4) : 0.6 * Math.exp(-d * d / 2.5); });
        fl += NOISE[k] * 0.025;
        if (k) c.lineTo(A.X(lam), A.Y(fl)); else c.moveTo(A.X(lam), A.Y(fl));
      }
      c.stroke(); c.lineWidth = 1;
      LINES.forEach(function (q) { var x = A.X(q[0] * (1 + ze)); c.strokeStyle = "rgba(251,191,36,.7)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x, h * 0.42); c.lineTo(x, h * 0.84); c.stroke(); c.setLineDash([]); });
      var v = C * ze, d = v / 70, ok = Math.abs(ze - zt) < 0.0008;
      $("z-out").innerHTML = "추정 z = <b>" + ze.toFixed(4) + "</b><br>후퇴 속도 v ≈ cz = <b>" + Math.round(v).toLocaleString() + " km/s</b><br>거리 d = v/H₀ ≈ <b>" + d.toFixed(0) + " Mpc</b> (" + (d * 3.26 / 100).toFixed(1) + "억 광년)<br>" + (ok ? "✔ 모든 선이 맞았다!" : "선들이 아직 어긋나 있다.");
    }
    ig.addEventListener("change", draw); iz.addEventListener("input", draw); draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: 2D vs 3D ---------- */
  (function () {
    var cv = $("sim-3d"); if (!cv) return;
    var R = S.rand(77), P = web(R, [[-1, 1], [-1, 1], [0, 2]], 28, 2600, 0.035);
    var ia = $("d3-a"), play = false, dir = 1;
    $("d3-play").addEventListener("click", function () { play = !play; this.textContent = play ? "⏸ 멈춤" : "▶ 천천히 돌리기"; this.classList.toggle("on", play); });
    S.loop(function (dt) {
      if (play) { var v = +ia.value + dir * dt * 15; if (v > 90 || v < 0) { dir = -dir; v = Math.max(0, Math.min(90, v)); } ia.value = v; }
      var f = S.fit(cv, 0.56), c = f.ctx, w = f.w, h = f.h, a = +ia.value * D2R, k = +ia.value / 90;
      $("d3-av").textContent = Math.round(+ia.value) + "°";
      c.fillStyle = "#03040a"; c.fillRect(0, 0, w, h);
      var sc = Math.min(w, h) * 0.42, cx = w / 2, cy = h / 2;
      P.forEach(function (p) {
        var Y = p[1] * Math.cos(a) - (p[2] - 1) * Math.sin(a), X = p[0];
        var inSlab = Math.abs(p[1]) < 0.12, al = (1 - k) * 0.55 + k * (inSlab ? 0.95 : 0.04);
        c.fillStyle = "rgba(" + Math.round(150 + 100 * p[2] / 2) + "," + Math.round(200 - 60 * p[2] / 2) + ",255," + al + ")";
        c.fillRect(cx + X * sc, cy + Y * sc * 0.75, 1.8, 1.8);
      });
      c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(12, true);
      c.fillText(k < 0.15 ? "지구에서 본 하늘 (깊이 정보 없음)" : k > 0.85 ? "옆에서 본 얇은 조각 (거리 = 적색 편이)" : "회전 중…", 12, 20);
      if (k > 0.85) { c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(11); c.fillText("↑ 멀리 (적색 편이 큼)", 12, h - 30); c.fillText("↓ 가까이", 12, h - 12); }
      $("d3-out").innerHTML = k < 0.15 ? "모든 깊이의 은하가 겹쳐 거의 고르게 퍼져 보인다." : k > 0.85 ? "얇은 조각만 보면 벽·필라멘트와 그 사이의 <b>거대 공동</b>이 뚜렷하다." : "각도를 더 돌려 보자.";
    });
  })();

  /* ---------- 데이터 랩: 쐐기 지도 ---------- */
  (function () {
    var cv = $("lab-wedge"); if (!cv) return;
    var R = S.rand(1989), G = [];
    function sampler() { var d = 300 * Math.cbrt(R()), ra = (130 + R() * 100) * D2R, sd = R() * Math.sin(55 * D2R), de = Math.asin(sd); return [d * Math.cos(de) * Math.cos(ra), d * Math.cos(de) * Math.sin(ra), d * Math.sin(de)]; }
    var pts = web(R, [[-310, 10], [-240, 240], [0, 260]], 360, 17000, 2.4, sampler);
    // 은하단 (시선 방향으로 길게: 고유 운동에 의한 '신의 손가락')
    for (var cI = 0; cI < 35; cI++) { var c0 = pts[Math.floor(R() * pts.length)], n = 15 + Math.floor(R() * 60); for (var j = 0; j < n; j++) pts.push([c0[0] + R.gauss() * 1.5, c0[1] + R.gauss() * 1.5, c0[2] + R.gauss() * 1.5, 1]); }
    pts.forEach(function (p) {
      var d = Math.hypot(p[0], p[1], p[2]), ra = Math.atan2(p[1], p[0]) / D2R; if (ra < 0) ra += 360; var de = Math.asin(p[2] / d) / D2R;
      var M = -22.5 + 5 * Math.sqrt(R()), m = M + 5 * Math.log10(d * 1e6) - 5;
      if (m > 17.7 || ra < 130 || ra > 230 || de < 0 || de > 55 || d < 2) return;
      var vpec = R.gauss() * (p[3] ? 650 : 250), z = (70 * d + vpec) / C;
      G.push([+ra.toFixed(3), +de.toFixed(3), +z.toFixed(5), +m.toFixed(2)]);
    });
    var view = "wedge", idc = $("lab-dc"), idw = $("lab-dw"), ih = $("lab-h");
    $("lab-view").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; view = b.dataset.v; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    [idc, idw, ih].forEach(function (el) { el.addEventListener("input", draw); });
    $("lab-csv").addEventListener("click", function () { S.csv("mock_redshift_survey.csv", ["ra_deg", "dec_deg", "z", "r_mag"], G); });
    function draw() {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h, dc = +idc.value, dw = +idw.value, H0 = +ih.value;
      $("lab-dcv").textContent = dc + "°"; $("lab-dwv").textContent = dw + "°"; $("lab-hv").textContent = H0;
      c.fillStyle = "#03040a"; c.fillRect(0, 0, w, h);
      var lo = dc - dw / 2, hi = dc + dw / 2, sl = G.filter(function (g) { return g[1] >= lo && g[1] <= hi; }), dmax = 0.07 * C / H0;
      if (view === "sky") {
        var A = S.axes(c, { x: 50, y: 14, w: w - 66, h: h - 52, x0: 230, x1: 130, y0: 0, y1: 55, xl: "적경 (°)", yl: "적위 (°)" });
        c.fillStyle = "rgba(251,191,36,.08)"; c.fillRect(A.X(230), A.Y(Math.min(55, hi)), A.X(130) - A.X(230), A.Y(Math.max(0, lo)) - A.Y(Math.min(55, hi)));
        G.forEach(function (g) { c.fillStyle = "rgba(191,219,254,.6)"; c.fillRect(A.X(g[0]), A.Y(g[1]), 1.3, 1.3); });
      } else if (view === "wedge") {
        var cx = w / 2, cy = h - 18, Rr = Math.min(h - 40, w / 2 / Math.sin(50 * D2R) - 10), sc = Rr / dmax;
        c.strokeStyle = "rgba(255,255,255,.15)"; c.fillStyle = "rgba(255,255,255,.55)"; c.font = S.font(10);
        for (var r = 50; r <= dmax; r += 50) { c.beginPath(); c.arc(cx, cy, r * sc, -Math.PI / 2 - 50 * D2R, -Math.PI / 2 + 50 * D2R); c.stroke(); c.fillText(r + " Mpc", cx + Math.sin(52 * D2R) * r * sc - 10, cy - Math.cos(52 * D2R) * r * sc); }
        [130, 155, 180, 205, 230].forEach(function (ra) { var t = (180 - ra) * D2R; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(t) * Rr, cy - Math.cos(t) * Rr); c.stroke(); c.fillText(ra + "°", cx + Math.sin(t) * (Rr + 6) - 8, cy - Math.cos(t) * (Rr + 6)); });
        sl.forEach(function (g) { var d = g[2] * C / H0, t = (180 - g[0]) * D2R; c.fillStyle = "rgba(191,219,254,.85)"; c.fillRect(cx + Math.sin(t) * d * sc, cy - Math.cos(t) * d * sc, 1.6, 1.6); });
        S.dot(c, cx, cy, 4, "#fde047"); c.fillStyle = "#fde047"; c.font = S.font(11, true); c.fillText("우리은하", cx + 8, cy);
      } else {
        var bins = new Array(30).fill(0); G.forEach(function (g) { var d = g[2] * C / H0, b = Math.floor(d / (dmax / 30)); if (b >= 0 && b < 30) bins[b]++; });
        var mx = Math.max.apply(null, bins);
        var B = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: 0, x1: dmax, y0: 0, y1: mx * 1.25, xl: "거리 (Mpc)", yl: "은하 수" });
        bins.forEach(function (n, i) { c.fillStyle = "#60a5fa"; c.fillRect(B.X(i * dmax / 30) + 1, B.Y(n), B.X(dmax / 30) - B.X(0) - 2, B.Y(0) - B.Y(n)); });
        var k = bins[4] / Math.pow(4.5, 2); c.strokeStyle = "#fbbf24"; c.setLineDash([5, 4]); c.beginPath(); for (var i2 = 0; i2 <= 30; i2++) { var y = k * Math.pow(i2 + 0.5, 2); if (i2) c.lineTo(B.X((i2 + 0.5) * dmax / 30), B.Y(Math.min(mx * 1.25, y))); else c.moveTo(B.X(0.5 * dmax / 30), B.Y(y)); } c.stroke(); c.setLineDash([]);
        c.fillStyle = "#fde68a"; c.font = S.font(11); c.fillText("점선: 은하가 고르게 있고 모두 관측된다면 (∝ 거리²)", 64, 30);
      }
      $("lab-kpi").innerHTML = "<div><small>전체 은하</small><b>" + G.length.toLocaleString() + "</b></div><div><small>띠 안의 은하</small><b>" + sl.length.toLocaleString() + "</b></div><div><small>최대 거리 (z = 0.07)</small><b>" + Math.round(dmax) + " Mpc</b></div>";
      $("lab-out").innerHTML = { sky: "하늘의 위치만 그린 지도. 노란 띠가 쐐기 지도로 잘라 볼 적위 범위이다.", wedge: "적위 " + lo.toFixed(1) + "° ~ " + hi.toFixed(1) + "° 띠의 은하를 거리 d = cz/H₀로 그렸다. 벽·필라멘트·공동을 찾아보자. 시선 방향으로 길쭉한 점 무리는 은하단(신의 손가락 효과)이다.", hist: "거리별 은하 수. 가까운 곳은 부피에 비례해 늘지만, 멀어지면 겉보기 등급 한계 때문에 어두운 은하가 빠져 오히려 줄어든다." }[view];
    }
    draw(); S.onResize(draw);
  })();
})();
