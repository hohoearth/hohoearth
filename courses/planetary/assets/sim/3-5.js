/* III-05 은하의 집단과 우주거대구조 */
(function () {
  var S = window.SIM, $ = S.$, D2R = Math.PI / 180;

  /* ---------- 시뮬레이션 1: 국부 은하군 ---------- */
  (function () {
    var cv = $("sim-lg"); if (!cv) return;
    // [이름, 은경 l, 은위 b, 거리 kpc, 절대 등급, 종류]
    var L = [["우리은하", 0, 0, 0, -20.8, "나선 은하"], ["안드로메다 (M31)", 121.2, -21.6, 765, -21.5, "나선 은하"], ["삼각형자리 (M33)", 133.6, -31.3, 840, -18.8, "나선 은하"],
      ["대마젤란은하", 280.5, -32.9, 50, -18.1, "불규칙 은하"], ["소마젤란은하", 302.8, -44.3, 62, -16.8, "불규칙 은하"], ["M32", 121.15, -21.98, 763, -16.4, "왜소 타원 은하"],
      ["M110", 120.7, -21.1, 824, -16.5, "왜소 타원 은하"], ["NGC 185", 120.8, -14.5, 620, -14.8, "왜소 타원 은하"], ["NGC 147", 119.8, -14.3, 680, -14.6, "왜소 타원 은하"],
      ["NGC 6822", 25.3, -18.4, 500, -15.2, "불규칙 은하"], ["IC 10", 119.0, -3.3, 800, -15.0, "불규칙 은하"], ["IC 1613", 129.7, -60.6, 730, -15.2, "불규칙 은하"],
      ["WLM", 75.9, -73.6, 930, -14.2, "불규칙 은하"], ["궁수자리 왜소", 5.6, -14.2, 26, -13.5, "왜소 타원체 은하"], ["용골자리 왜소", 260.1, -22.2, 105, -9.1, "왜소 타원체 은하"],
      ["조각가자리 왜소", 287.5, -83.2, 86, -11.1, "왜소 타원체 은하"], ["화로자리 왜소", 237.1, -65.7, 147, -13.4, "왜소 타원체 은하"], ["용자리 왜소", 86.4, 34.7, 76, -8.8, "왜소 타원체 은하"],
      ["작은곰자리 왜소", 105.0, 44.8, 76, -8.8, "왜소 타원체 은하"], ["육분의자리 왜소", 243.5, 42.3, 86, -9.3, "왜소 타원체 은하"], ["사자자리 I", 226.0, 49.1, 254, -12.0, "왜소 타원체 은하"],
      ["사자자리 II", 220.2, 67.2, 233, -9.8, "왜소 타원체 은하"], ["페가수스 왜소 불규칙", 94.8, -43.6, 920, -12.2, "불규칙 은하"], ["사자자리 A", 196.9, 52.4, 800, -12.1, "불규칙 은하"],
      ["고래자리 왜소", 101.4, -72.9, 780, -11.2, "왜소 타원체 은하"], ["큰부리새자리 왜소", 322.9, -47.4, 880, -9.5, "왜소 타원체 은하"], ["봉황새자리 왜소", 272.2, -68.9, 415, -9.9, "불규칙 은하"],
      ["물병자리 왜소", 34.0, -31.3, 1070, -10.6, "불규칙 은하"], ["안드로메다 I", 121.7, -24.8, 745, -11.7, "왜소 타원체 은하"], ["안드로메다 II", 128.9, -29.2, 650, -12.4, "왜소 타원체 은하"],
      ["안드로메다 III", 119.4, -26.3, 750, -10.0, "왜소 타원체 은하"]];
    L.forEach(function (g) { var l = g[1] * D2R, b = g[2] * D2R, d = g[3]; g.push([d * Math.cos(b) * Math.cos(l), d * Math.cos(b) * Math.sin(l), d * Math.sin(b)]); });
    var yaw = 0.3, pitch = 0.5, spin = true, drag = null, hov = -1, proj = [];
    $("lg-spin").addEventListener("click", function () { spin = !spin; this.textContent = spin ? "⏸ 회전 멈춤" : "▶ 회전"; this.classList.toggle("on", spin); });
    cv.addEventListener("pointerdown", function (e) { drag = [e.clientX, e.clientY, yaw, pitch]; cv.setPointerCapture(e.pointerId); });
    cv.addEventListener("pointermove", function (e) {
      var r = cv.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (drag) { yaw = drag[2] + (e.clientX - drag[0]) * 0.01; pitch = Math.max(-1.5, Math.min(1.5, drag[3] + (e.clientY - drag[1]) * 0.01)); }
      hov = -1; proj.forEach(function (p, i) { if (Math.hypot(p[0] - x, p[1] - y) < 9) hov = i; });
    });
    cv.addEventListener("pointerup", function () { drag = null; });
    S.loop(function (dt) {
      if (spin && !drag) yaw += dt * 0.25;
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h, sc = Math.min(w, h) / 2400, cx = w * 0.45, cy = h / 2;
      c.fillStyle = "#03040a"; c.fillRect(0, 0, w, h);
      function P(v) { var x = v[0] * Math.cos(yaw) - v[1] * Math.sin(yaw), y = v[0] * Math.sin(yaw) + v[1] * Math.cos(yaw), z = v[2]; var Y = z * Math.cos(pitch) - y * Math.sin(pitch), Z = z * Math.sin(pitch) + y * Math.cos(pitch); return [cx + x * sc, cy - Y * sc, Z]; }
      if ($("lg-ring").checked) { [500, 1000].forEach(function (r) { c.strokeStyle = "rgba(255,255,255,.12)"; c.beginPath(); for (var a = 0; a <= 64; a++) { var t = a / 64 * 2 * Math.PI, p = P([r * Math.cos(t), r * Math.sin(t), 0]); if (a) c.lineTo(p[0], p[1]); else c.moveTo(p[0], p[1]); } c.stroke(); }); }
      var m31 = P(L[1][6]), mw = P([0, 0, 0]); c.strokeStyle = "rgba(251,191,36,.35)"; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(mw[0], mw[1]); c.lineTo(m31[0], m31[1]); c.stroke(); c.setLineDash([]);
      proj = L.map(function (g) { return P(g[6]); });
      var order = L.map(function (g, i) { return i; }).sort(function (a, b) { return proj[a][2] - proj[b][2]; });
      order.forEach(function (i) {
        var g = L[i], p = proj[i], r = Math.max(2, (-g[4] - 7) * 0.6);
        var col = g[5].indexOf("나선") >= 0 ? "#93c5fd" : g[5].indexOf("불규칙") >= 0 ? "#86efac" : "#fcd34d";
        var gr = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], r * 2); gr.addColorStop(0, col); gr.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = gr; c.beginPath(); c.arc(p[0], p[1], r * 2, 0, 7); c.fill();
        if ($("lg-lab").checked && (g[4] < -14 || i === hov)) { c.fillStyle = "rgba(255,255,255,.85)"; c.font = S.font(11, i < 3); c.fillText(g[0], p[0] + r + 4, p[1] - 3); }
      });
      c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(11); c.fillText("● 나선  ● 불규칙  ● 타원·왜소 타원체", 12, h - 10);
      if (hov >= 0) { var g = L[hov]; $("lg-out").innerHTML = "<b>" + g[0] + "</b> · " + g[5] + "<br>거리 " + g[3] + " kpc (" + Math.round(g[3] * 3.26 / 100) / 10 + "백만 광년) · 절대 등급 " + g[4]; }
    });
  })();

  /* ---------- 시뮬레이션 2: N체 구조 형성 ---------- */
  (function () {
    var cv = $("sim-nb"); if (!cv) return;
    var N = 30, P = [], run = false, t = 0, ip = $("nb-p");
    function init() {
      P = []; t = 0; var R = S.rand(Math.floor(Math.random() * 1e6)), amp = +ip.value, modes = [];
      for (var k = 0; k < 10; k++) modes.push([1 + Math.floor(R() * 4), 1 + Math.floor(R() * 4), R() * 6.28, R() * 6.28, (R() - 0.5)]);
      for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
        var x = (i + 0.5) / N, y = (j + 0.5) / N, dx = 0, dy = 0;
        modes.forEach(function (m) { var ph = 2 * Math.PI * (m[0] * x + m[1] * y) + m[2]; dx += amp * m[4] * m[0] * Math.sin(ph) / 4; dy += amp * m[4] * m[1] * Math.sin(ph) / 4; });
        P.push({ x: (x + dx + 1) % 1, y: (y + dy + 1) % 1, vx: 0, vy: 0 });
      }
    }
    init();
    $("nb-go").addEventListener("click", function () { run = !run; this.textContent = run ? "⏸ 멈춤" : "▶ 시작"; });
    $("nb-reset").addEventListener("click", function () { init(); });
    ip.addEventListener("input", function () { init(); });
    S.loop(function (dt) {
      var f = S.fit(cv, 0.56), c = f.ctx, w = f.w, h = f.h, n = P.length;
      $("nb-pv").textContent = (+ip.value * 100).toFixed(1) + "%";
      if (run) {
        var G = ($("nb-dm").checked ? 6 : 1) * 2.2e-6, eps2 = 0.0004, h2 = 0.009;
        for (var s = 0; s < 2; s++) {
          for (var i = 0; i < n; i++) { var a = P[i], ax = 0, ay = 0; for (var j = 0; j < n; j++) { if (i === j) continue; var dx = P[j].x - a.x, dy = P[j].y - a.y; dx -= Math.round(dx); dy -= Math.round(dy); var r2 = dx * dx + dy * dy + eps2, inv = G / (r2 * Math.sqrt(r2)); ax += dx * inv; ay += dy * inv; } a.vx = (a.vx + ax * h2) * 0.995; a.vy = (a.vy + ay * h2) * 0.995; }
          P.forEach(function (p) { p.x = (p.x + p.vx * h2 + 1) % 1; p.y = (p.y + p.vy * h2 + 1) % 1; });
          t += h2;
        }
      }
      c.fillStyle = "#03040a"; c.fillRect(0, 0, w, h);
      var sz = Math.min(w * 0.62, h - 10), ox = 8, oy = (h - sz) / 2;
      // 밀도 지도
      var M = 15, grid = new Array(M * M).fill(0); P.forEach(function (p) { grid[Math.floor(p.y * M) * M + Math.floor(p.x * M)]++; });
      var mean = n / (M * M), mx = 0, vv = 0; grid.forEach(function (g) { mx = Math.max(mx, g); vv += (g - mean) * (g - mean); });
      var sigma = Math.sqrt(vv / (M * M)) / mean;
      P.forEach(function (p) { c.fillStyle = "rgba(167,139,250,.85)"; c.fillRect(ox + p.x * sz, oy + p.y * sz, 1.8, 1.8); });
      c.strokeStyle = "rgba(255,255,255,.2)"; c.strokeRect(ox, oy, sz, sz);
      // 밀도 분포 히스토그램
      var NB = 16, bx = ox + sz + 20, bw = w - bx - 12, bins = new Array(NB).fill(0); grid.forEach(function (g) { bins[Math.min(NB - 1, Math.floor(g / 1.5))]++; });
      var bm = Math.max.apply(null, bins);
      c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(11, true); c.fillText("칸(15×15)당 입자 수 분포", bx, oy + 14);
      bins.forEach(function (b, i) { var hh = b / bm * (sz * 0.5); c.fillStyle = i === 0 ? "#64748b" : "#a78bfa"; c.fillRect(bx + i * bw / NB, oy + 30 + sz * 0.5 - hh, bw / NB - 2, hh); });
      c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(10); c.fillText("0", bx, oy + 44 + sz * 0.5); c.fillText("22+", bx + bw - 22, oy + 44 + sz * 0.5);
      $("nb-out").innerHTML = "모형 시간 <b>" + t.toFixed(2) + "</b><br>밀도 대비(σ/평균) <b>" + sigma.toFixed(2) + "</b><br>빈 칸(공동) 비율 <b>" + Math.round(bins[0] / (M * M) * 100) + "%</b> · 가장 밀집한 칸 <b>" + mx + "개</b>";
    });
  })();

  /* ---------- 데이터 랩: FoF ---------- */
  (function () {
    var cv = $("lab-fof"); if (!cv) return;
    var R = S.rand(2014), Lb = 200, G = [];
    var seeds = []; for (var i = 0; i < 26; i++) seeds.push([R() * Lb, R() * Lb]);
    function near(x, y) { var d = []; seeds.forEach(function (s) { var dx = x - s[0], dy = y - s[1]; d.push(Math.hypot(dx, dy)); }); d.sort(function (a, b) { return a - b; }); return d; }
    // 필라멘트 은하
    var tries = 0; while (G.length < 1700 && tries < 200000) { tries++; var x = R() * Lb, y = R() * Lb, d = near(x, y); if (R() < Math.exp(-(d[1] - d[0]) / 1.4)) G.push([x, y]); }
    // 교차점(은하단 후보)
    var cand = []; for (var k = 0; k < 4000; k++) { var x2 = R() * Lb, y2 = R() * Lb, d2 = near(x2, y2); cand.push([d2[2] - d2[0], x2, y2]); }
    cand.sort(function (a, b) { return a[0] - b[0]; });
    var cl = []; cand.forEach(function (q) { if (cl.length < 7 && cl.every(function (c) { return Math.hypot(c[0] - q[1], c[1] - q[2]) > 25; })) cl.push([q[1], q[2]]); });
    cl.forEach(function (c, ci) { var n = 55 + Math.floor(R() * 110); for (var j = 0; j < n; j++) G.push([c[0] + R.gauss() * 0.9, c[1] + R.gauss() * 0.9]); });
    // 은하군 (필라멘트 위)
    for (var g = 0; g < 45; g++) { var base = G[Math.floor(R() * 1700)], m = 3 + Math.floor(Math.pow(R(), 2) * 22); for (var j2 = 0; j2 < m; j2++) G.push([base[0] + R.gauss() * 0.35, base[1] + R.gauss() * 0.35]); }
    for (var f0 = 0; f0 < 160; f0++) G.push([R() * Lb, R() * Lb]);
    G = G.filter(function (p) { return p[0] >= 0 && p[0] < Lb && p[1] >= 0 && p[1] < Lb; }).map(function (p) { return [+p[0].toFixed(3), +p[1].toFixed(3)]; });
    function fof(b) {
      var n = G.length, par = new Int32Array(n), cell = {}, cs = b;
      for (var i = 0; i < n; i++) par[i] = i;
      function find(a) { while (par[a] !== a) { par[a] = par[par[a]]; a = par[a]; } return a; }
      G.forEach(function (p, i) { var key = Math.floor(p[0] / cs) + "," + Math.floor(p[1] / cs); (cell[key] = cell[key] || []).push(i); });
      G.forEach(function (p, i) { var cx = Math.floor(p[0] / cs), cy = Math.floor(p[1] / cs); for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) { var arr = cell[(cx + dx) + "," + (cy + dy)]; if (!arr) continue; arr.forEach(function (j) { if (j <= i) return; var q = G[j]; if ((p[0] - q[0]) * (p[0] - q[0]) + (p[1] - q[1]) * (p[1] - q[1]) < b * b) { var a = find(i), c = find(j); if (a !== c) par[a] = c; } }); } });
      var groups = {}; for (var k = 0; k < n; k++) { var r = find(k); (groups[r] = groups[r] || []).push(k); }
      var list = Object.keys(groups).map(function (k) { return groups[k]; }).filter(function (g) { return g.length >= 3; }).sort(function (a, b) { return b.length - a.length; });
      var lab = new Int32Array(n).fill(-1); list.forEach(function (g, gi) { g.forEach(function (k) { lab[k] = gi; }); });
      return { list: list, lab: lab };
    }
    var ib = $("lab-b"), view = "map", res = null, sens = null;
    $("lab-view").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; view = b.dataset.v; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    ib.addEventListener("input", function () { res = fof(+ib.value); draw(); });
    $("lab-csv").addEventListener("click", function () { var r = res || fof(+ib.value); S.csv("fof_galaxies.csv", ["id", "x_Mpc", "y_Mpc", "group_id_b" + ib.value], G.map(function (p, i) { return [i + 1, p[0], p[1], r.lab[i]]; })); });
    function hue(i) { return "hsl(" + ((i * 137.5) % 360) + ",80%,62%)"; }
    function draw() {
      if (!res) res = fof(+ib.value);
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h, b = +ib.value;
      $("lab-bv").textContent = b.toFixed(1) + " Mpc";
      c.fillStyle = "#03040a"; c.fillRect(0, 0, w, h);
      var nCl = res.list.filter(function (g) { return g.length >= 50; }).length, nGr = res.list.length - nCl, inG = res.list.reduce(function (s, g) { return s + g.length; }, 0);
      if (view === "map") {
        var sz = Math.min(w - 16, h - 16), ox = (w - sz) / 2, oy = 8, sc = sz / Lb;
        G.forEach(function (p, i) { var l = res.lab[i]; c.fillStyle = l < 0 ? "rgba(148,163,184,.35)" : hue(l); c.fillRect(ox + p[0] * sc, oy + p[1] * sc, l < 0 ? 1.4 : 2, l < 0 ? 1.4 : 2); });
        res.list.forEach(function (g, gi) { if (g.length < 50) return; var mx = 0, my = 0; g.forEach(function (k) { mx += G[k][0]; my += G[k][1]; }); mx /= g.length; my /= g.length; c.strokeStyle = "#fff"; c.lineWidth = 1.5; c.beginPath(); c.arc(ox + mx * sc, oy + my * sc, 10 + Math.sqrt(g.length), 0, 7); c.stroke(); c.lineWidth = 1; });
        c.strokeStyle = "rgba(255,255,255,.2)"; c.strokeRect(ox, oy, sz, sz);
        c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(10); c.fillText("0", ox + 2, oy + sz - 3); c.fillText("200 Mpc", ox + sz - 48, oy + sz - 3);
      } else if (view === "mult") {
        var edges = [3, 5, 9, 17, 33, 65, 129, 257, 513, 1e9], cnt = new Array(edges.length - 1).fill(0);
        res.list.forEach(function (g) { for (var k = 0; k < edges.length - 1; k++) if (g.length >= edges[k] && g.length < edges[k + 1]) cnt[k]++; });
        var A = S.axes(c, { x: 60, y: 14, w: w - 76, h: h - 52, x0: 0, x1: edges.length - 1, y0: 0.5, y1: 200, ylog: true, xt: [], xl: "집단의 은하 수", yl: "집단 개수 (로그)", yfmt: function (v) { return v; } });
        cnt.forEach(function (n, k) { if (!n) return; c.fillStyle = edges[k] >= 33 ? "#f472b6" : "#60a5fa"; c.fillRect(A.X(k) + 3, A.Y(n), A.X(1) - A.X(0) - 6, A.Y(0.5) - A.Y(n)); c.fillStyle = "#fff"; c.font = S.font(10, true); c.textAlign = "center"; c.fillText(n, A.X(k + 0.5), A.Y(n) - 4); });
        c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(10); c.textAlign = "center";
        for (var k2 = 0; k2 < edges.length - 1; k2++) c.fillText(edges[k2] + (edges[k2 + 1] < 1e9 ? "~" + (edges[k2 + 1] - 1) : "+"), A.X(k2 + 0.5), h - 26);
        c.textAlign = "left";
      } else {
        if (!sens) { sens = []; for (var bb = 0.3; bb <= 6.01; bb += 0.3) { var r = fof(bb); sens.push([bb, r.list.length, r.list.length ? r.list[0].length : 0]); } }
        var mxN = Math.max.apply(null, sens.map(function (q) { return q[1]; })), mxL = Math.max.apply(null, sens.map(function (q) { return q[2]; }));
        var B = S.axes(c, { x: 60, y: 14, w: w - 120, h: h - 52, x0: 0, x1: 6.2, y0: 0, y1: mxN * 1.1, xl: "연결 거리 b (Mpc)", yl: "집단 수" });
        c.strokeStyle = "#60a5fa"; c.lineWidth = 2; c.beginPath(); sens.forEach(function (q, i) { if (i) c.lineTo(B.X(q[0]), B.Y(q[1])); else c.moveTo(B.X(q[0]), B.Y(q[1])); }); c.stroke();
        c.strokeStyle = "#f472b6"; c.beginPath(); sens.forEach(function (q, i) { var y = 14 + (h - 52) * (1 - q[2] / (mxL * 1.1)); if (i) c.lineTo(B.X(q[0]), y); else c.moveTo(B.X(q[0]), y); }); c.stroke(); c.lineWidth = 1;
        c.strokeStyle = "#fff"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(B.X(b), 14); c.lineTo(B.X(b), h - 38); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#60a5fa"; c.font = S.font(11, true); c.fillText("● 집단 수 (왼쪽 축)", 70, 30); c.fillStyle = "#f472b6"; c.fillText("● 가장 큰 집단의 은하 수 (오른쪽, 최대 " + mxL + ")", 70, 46);
      }
      $("lab-kpi").innerHTML = "<div><small>은하 수</small><b>" + G.length.toLocaleString() + "</b></div><div><small>은하군 (3~49)</small><b>" + nGr + "</b></div><div><small>은하단 (50+)</small><b>" + nCl + "</b></div><div><small>가장 큰 집단</small><b>" + (res.list[0] ? res.list[0].length : 0) + "</b></div>";
      $("lab-out").innerHTML = "집단에 속한 은하 <b>" + Math.round(inG / G.length * 100) + "%</b> · 외톨이 은하 <b>" + Math.round(100 - inG / G.length * 100) + "%</b>" + (b > 4 ? "<br>⚠ b가 너무 커서 필라멘트가 사슬처럼 이어지고 있다(과잉 연결)." : b < 0.6 ? "<br>⚠ b가 너무 작아 은하단도 조각나고 있다." : "");
    }
    draw(); S.onResize(draw);
  })();
})();
