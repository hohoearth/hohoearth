/* I-05 외계 행성계 탐사 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 시뮬레이션 1: 시선 속도 + 식현상 ---------- */
  (function () {
    var cv = $("sim-rv"); if (!cv) return;
    var im = $("rv-m"), ia = $("rv-a"), ii = $("rv-i"), ph = 0;
    im.min = -2.6;
    document.querySelectorAll("[data-pre]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = { hj: [0, 0.05, 88], earth: [-2.5, 1, 89.9], face: [0, 0.3, 0] }[b.dataset.pre];
        im.value = p[0]; ia.value = p[1]; ii.value = p[2];
      });
    });
    S.loop(function (dt) {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h;
      var Mj = Math.pow(10, +im.value), Me = Mj * 317.8, a = +ia.value, inc = +ii.value * Math.PI / 180;
      var Re = Me < 127 ? Math.pow(Me, 0.55) : 11.2, P = Math.pow(a, 1.5);
      var K = 28.43 * Mj * Math.sin(inc) * Math.pow(P, -1 / 3);
      var bImp = a * Math.cos(inc) / 0.00465, rr = Re / 109, transit = bImp < 1 + rr;
      var depth = transit ? rr * rr : 0;
      $("rv-mv").textContent = (Mj >= 0.1 ? Mj.toFixed(2) + " M♃" : Me.toFixed(1) + " M⊕");
      $("rv-av").textContent = a.toFixed(2) + " AU (P = " + (P * 365.25 < 100 ? (P * 365.25).toFixed(1) + "일" : P.toFixed(2) + "년") + ")";
      $("rv-iv").textContent = (+ii.value).toFixed(1) + "°";
      ph = (ph + dt / 4) % 1;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 하늘에서 본 모습 (왼쪽)
      var vx = w * 0.2, vy = h * 0.5, vr = Math.min(w * 0.17, h * 0.4);
      var starR = Math.max(9, 0.00465 / a * vr);
      var phi = ph * 2 * Math.PI, px = vx + Math.sin(phi) * vr, py = vy + Math.cos(phi) * Math.cos(inc) * vr, near = Math.cos(phi) > 0;
      c.strokeStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.ellipse(vx, vy, vr, Math.max(0.5, Math.abs(Math.cos(inc)) * vr), 0, 0, 7); c.stroke();
      var pR = Math.max(2.5, rr * starR);
      if (!near) S.dot(c, px, py, pR, "#60a5fa");
      var g = c.createRadialGradient(vx, vy, 0, vx, vy, starR); g.addColorStop(0, "#fff7d6"); g.addColorStop(1, "#f59e0b");
      var sx = vx - Math.sin(phi) * vr * 0.04 * Math.min(1, Mj); // 별의 흔들림(과장)
      c.fillStyle = g; c.beginPath(); c.arc(sx, vy, starR, 0, 7); c.fill();
      if (near) S.dot(c, px, py, pR, "#1e3a8a", "#93c5fd");
      c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText("관측자가 본 하늘 (별 크기 과장)", vx, h - 12); c.textAlign = "left";
      // 그래프
      var gx = w * 0.43, gw = w * 0.54;
      function panel(y0, hh, title, fn, ymin, ymax, col, unit) {
        c.strokeStyle = "rgba(255,255,255,.2)"; c.strokeRect(gx, y0, gw, hh);
        c.fillStyle = "rgba(255,255,255,.85)"; c.font = S.font(12, true); c.fillText(title, gx, y0 - 6);
        c.beginPath();
        for (var k = 0; k <= 400; k++) { var t = k / 400 * 2, v = fn(t), y = y0 + hh - (v - ymin) / (ymax - ymin) * hh; if (k) c.lineTo(gx + k / 400 * gw, y); else c.moveTo(gx, y); }
        c.strokeStyle = col; c.lineWidth = 2; c.stroke(); c.lineWidth = 1;
        var cur = fn(ph), cy2 = y0 + hh - (cur - ymin) / (ymax - ymin) * hh; S.dot(c, gx + ph / 2 * gw, cy2, 4, "#fff");
        c.font = S.font(10); c.fillStyle = "rgba(255,255,255,.6)"; c.fillText(unit, gx + gw - c.measureText(unit).width - 4, y0 + 12);
      }
      var Kd = Math.max(K, 0.05);
      panel(28, h * 0.36, "별의 시선 속도 (+ 멀어짐)", function (t) { return -K * Math.sin(2 * Math.PI * t); }, -Kd * 1.3, Kd * 1.3, "#fbbf24", "± " + (K < 1 ? K.toFixed(2) : K.toFixed(1)) + " m/s");
      var dd = Math.max(depth * 1.4, 0.0002);
      panel(h * 0.56, h * 0.36, "별의 밝기", function (t) {
        if (!transit) return 1;
        var ff = ((t % 1) + 1) % 1, x = Math.sin(ff * 2 * Math.PI) * a / 0.00465, y = Math.cos(ff * 2 * Math.PI) * Math.cos(inc) * a / 0.00465;
        if (Math.cos(ff * 2 * Math.PI) <= 0) return 1;
        var d = Math.hypot(x, y); if (d >= 1 + rr) return 1; if (d <= 1 - rr) return 1 - depth; return 1 - depth * (1 + rr - d) / (2 * rr);
      }, 1 - dd, 1 + dd * 0.15, "#60a5fa", transit ? "−" + (depth * 100).toFixed(depth < 0.001 ? 4 : 2) + "%" : "식현상 없음");
      $("rv-out").innerHTML = "행성 반지름 ≈ <b>" + Re.toFixed(1) + " R⊕</b><br>시선 속도 변화 폭 K = <b>" + (K < 1 ? K.toFixed(3) : K.toFixed(1)) + " m/s</b><br>" + (transit ? "식현상 깊이 <b>" + (depth * 100).toFixed(4) + "%</b>" : "궤도가 기울어 <b>식현상이 보이지 않는다</b>") + "<br>" +
        (K < 0.5 ? "→ 현재 최고 장비(약 0.3~1 m/s)로도 시선 속도 검출이 어렵다" : "→ 시선 속도로 검출 가능") ;
    });
  })();

  /* ---------- 시뮬레이션 2: 미세 중력 렌즈 ---------- */
  (function () {
    var cv = $("sim-ml"); if (!cv) return;
    var iu = $("ml-u"), ip = $("ml-p"), ih = $("ml-has"), t = -2.2, run = true;
    $("ml-go").addEventListener("click", function () { t = -2.2; run = true; });
    [iu, ip, ih].forEach(function (el) { el.addEventListener("input", function () { t = -2.2; run = true; }); });
    function Amag(u) { return (u * u + 2) / (u * Math.sqrt(u * u + 4)); }
    S.loop(function (dt) {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h;
      var u0 = +iu.value, p = +ip.value, has = ih.checked;
      $("ml-uv").textContent = u0.toFixed(2); $("ml-pv").textContent = p.toFixed(2);
      if (run) { t += dt * 0.7; if (t > 2.2) run = false; }
      var xc = p - 1 / p, rc = Math.abs(xc), th = rc >= u0 ? Math.asin(u0 / Math.max(rc, 1e-6)) : Math.PI / 2;
      var cxp = xc >= 0 ? Math.cos(th) * rc : -Math.cos(th) * rc, cyp = u0; // 행성 콕스틱 위치(광원 경로 위)
      var plx = Math.cos(th) * p * (xc >= 0 ? 1 : -1), ply = Math.sin(th) * p;
      function A(x) { var u = Math.hypot(x, u0), a = Amag(u); if (has) a += 0.9 * a * Math.exp(-Math.pow(Math.hypot(x - cxp, u0 - cyp) / 0.045, 2)); return a; }
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h); S.stars(c, w, h * 0.45, 60, 6);
      // 위: 하늘
      var sx0 = w * 0.5, sy0 = h * 0.24, sc = Math.min(w / 5, h * 0.17);
      c.strokeStyle = "rgba(255,255,255,.35)"; c.setLineDash([4, 4]); c.beginPath(); c.arc(sx0, sy0, sc, 0, 7); c.stroke(); c.setLineDash([]);
      c.strokeStyle = "rgba(251,191,36,.3)"; c.beginPath(); c.moveTo(sx0 - 2.2 * sc, sy0 - u0 * sc); c.lineTo(sx0 + 2.2 * sc, sy0 - u0 * sc); c.stroke();
      S.dot(c, sx0, sy0, 5, "#fff");
      if (has) { S.dot(c, sx0 + plx * sc, sy0 - ply * sc, 3.5, "#60a5fa"); c.fillStyle = "#93c5fd"; c.font = S.font(10); c.fillText("행성", sx0 + plx * sc + 6, sy0 - ply * sc - 4); }
      var u = Math.hypot(t, u0), ux = t / u, uy = u0 / u;
      var up = (u + Math.sqrt(u * u + 4)) / 2, um = (u - Math.sqrt(u * u + 4)) / 2;
      [up, um].forEach(function (r, k) { var ang = Math.atan2(-uy, ux), X = sx0 + ux * r * sc, Y = sy0 - uy * r * sc; c.strokeStyle = "rgba(253,224,71,.85)"; c.lineWidth = k ? 2 : 3; c.beginPath(); c.arc(sx0, sy0, Math.abs(r) * sc, ang + (r < 0 ? Math.PI : 0) - 0.25 / Math.max(0.3, u), ang + (r < 0 ? Math.PI : 0) + 0.25 / Math.max(0.3, u)); c.stroke(); c.lineWidth = 1; });
      S.dot(c, sx0 + t * sc, sy0 - u0 * sc, 3, "#fde047");
      c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(11); c.fillText("광원 별의 경로 · 노란 호 = 렌즈가 만든 상(像)", 10, 16);
      // 아래: 광도 곡선
      var by = h * 0.5, bh = h * 0.42, bx = 50, bw = w - 70;
      var Amax = 0; for (var x = -2.2; x <= 2.2; x += 0.005) Amax = Math.max(Amax, A(x));
      var top = Math.max(2, Amax * 1.08);
      c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(bx, by, bw, bh);
      c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(11); c.fillText("밝기 증폭 배율", bx, by - 6);
      [1, Math.round(top / 2), Math.floor(top)].forEach(function (v) { var y = by + bh - (v - 1) / (top - 1) * bh; c.fillText(v + "×", 8, y + 4); });
      c.beginPath();
      for (var x2 = -2.2; x2 <= t; x2 += 0.004) { var X2 = bx + (x2 + 2.2) / 4.4 * bw, Y2 = by + bh - (A(x2) - 1) / (top - 1) * bh; if (x2 === -2.2) c.moveTo(X2, Y2); else c.lineTo(X2, Y2); }
      c.strokeStyle = "#fde047"; c.lineWidth = 2; c.stroke(); c.lineWidth = 1;
      $("ml-out").innerHTML = "현재 증폭 <b>" + A(Math.min(t, 2.2)).toFixed(2) + "배</b><br>최대 증폭 <b>" + Amax.toFixed(2) + "배</b> (u₀가 작을수록 크다)<br>" + (has ? "행성 신호: 수 시간 ~ 하루 정도의 짧은 '삐죽'" : "행성 없음: 좌우 대칭인 매끈한 곡선");
    });
  })();

  /* ---------- 시뮬레이션 3: 생명 가능 지대 ---------- */
  (function () {
    var cv = $("sim-hz"); if (!cv) return;
    var im = $("hz-m"), ia = $("hz-a");
    function L(M) { return M < 0.43 ? 0.23 * Math.pow(M, 2.3) : M < 2 ? Math.pow(M, 4) : 1.4 * Math.pow(M, 3.5); }
    function draw() {
      var f = S.fit(cv, 0.42), c = f.ctx, w = f.w, h = f.h;
      var M = +im.value, Lm = L(M), T = 5772 * Math.pow(M, 0.505), life = 10 * Math.pow(M, -2.5), a = Math.pow(10, +ia.value);
      var hin = 0.95 * Math.sqrt(Lm), hout = 1.37 * Math.sqrt(Lm);
      $("hz-mv").textContent = M.toFixed(2) + " M☉"; $("hz-av").textContent = (a < 0.1 ? a.toFixed(3) : a.toFixed(2)) + " AU";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var A = S.axes(c, { x: 40, y: 20, w: w - 56, h: h - 64, x0: 0.01, x1: 10, y0: 0, y1: 1, xlog: true, xl: "중심별로부터의 거리 (AU, 로그 눈금)", yt: [], grid: false, xfmt: function (v) { return v; } });
      var x1 = A.X(Math.max(0.01, hin)), x2 = A.X(Math.min(10, hout));
      var gg = c.createLinearGradient(x1, 0, x2, 0); gg.addColorStop(0, "rgba(52,211,153,.15)"); gg.addColorStop(0.5, "rgba(52,211,153,.45)"); gg.addColorStop(1, "rgba(52,211,153,.15)");
      c.fillStyle = gg; c.fillRect(x1, 20, Math.max(2, x2 - x1), h - 64);
      c.fillStyle = "rgba(239,68,68,.08)"; c.fillRect(40, 20, x1 - 40, h - 64);
      c.fillStyle = "rgba(96,165,250,.08)"; c.fillRect(x2, 20, w - 16 - x2, h - 64);
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11, true); c.textAlign = "center";
      c.fillText("너무 뜨거움", (40 + x1) / 2, 40); c.fillText("너무 차가움", (x2 + w - 16) / 2, 40); c.fillText("생명 가능 지대", (x1 + x2) / 2, 40);
      // 별
      var sr = 10 + 10 * Math.min(1.5, Math.pow(M, 0.8)); var col = S.tempColor(T);
      var g = c.createRadialGradient(20, h / 2 - 10, 0, 20, h / 2 - 10, sr * 1.8); g.addColorStop(0, col); g.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g; c.beginPath(); c.arc(20, h / 2 - 10, sr * 1.8, 0, 7); c.fill();
      if (Math.abs(M - 1) < 0.05) [["금성", 0.72], ["지구", 1], ["화성", 1.52]].forEach(function (p) { S.dot(c, A.X(p[1]), h / 2 + 20, 4, "rgba(255,255,255,.4)"); c.fillStyle = "rgba(255,255,255,.5)"; c.font = S.font(10); c.fillText(p[0], A.X(p[1]), h / 2 + 38); });
      var X = A.X(a); S.dot(c, X, h / 2 - 10, 8, "#60a5fa", "#fff"); c.fillStyle = "#fff"; c.font = S.font(11, true); c.fillText("행성", X, h / 2 - 24);
      c.textAlign = "left";
      var inHZ = a >= hin && a <= hout, lock = a < 0.35 * Math.pow(M, 0.5) && inHZ;
      $("hz-out").innerHTML = "표면 온도 ≈ <b>" + Math.round(T / 100) * 100 + " K</b> · 광도 ≈ <b>" + (Lm < 0.01 ? Lm.toExponential(1) : Lm.toFixed(2)) + " L☉</b><br>생명 가능 지대 <b>" + hin.toFixed(hin < 0.1 ? 3 : 2) + " ~ " + hout.toFixed(hout < 0.1 ? 3 : 2) + " AU</b> (폭 " + (hout - hin).toFixed(hout - hin < 0.1 ? 3 : 2) + " AU)<br>주계열 수명 ≈ <b>" + (life >= 1 ? life.toFixed(1) + "×10⁹ 년" : (life * 1000).toFixed(0) + "×10⁶ 년") + "</b>";
      var msg = inHZ ? "✔ 생명 가능 지대 안" : "✘ 생명 가능 지대 밖";
      if (inHZ && life < 1) msg += " · 그러나 별의 수명이 너무 짧다";
      if (lock) msg += " · 조석 고정 가능성 큼";
      $("hz-ver").textContent = msg;
    }
    im.addEventListener("input", draw); ia.addEventListener("input", draw); draw(); S.onResize(draw);
  })();

  /* ---------- 데이터 랩: TESS 광도 곡선 ---------- */
  (function () {
    var cv = $("lab-lc"); if (!cv) return;
    var R = S.rand(700), T = [], F = [], Pt = 3.853, t0 = 1.62, dur = 0.1, dep = 0.0028;
    for (var t = 0; t < 27; t += 0.5 / 24) {
      if (t > 13.1 && t < 14.2) continue; // 자료 전송 공백
      var fl = 1 + 0.0021 * Math.sin(2 * Math.PI * t / 11.3) + 0.0011 * Math.sin(2 * Math.PI * t / 5.2 + 1) + R.gauss() * 0.0008;
      var x = Math.abs(((t - t0) % Pt + Pt) % Pt); x = Math.min(x, Pt - x);
      if (x < dur / 2) fl -= x < dur / 2 - 0.012 ? dep : dep * (dur / 2 - x) / 0.012;
      T.push(+t.toFixed(4)); F.push(+fl.toFixed(6));
    }
    // 이동 중앙값 추세 제거
    var FL = F.map(function (v, i) { var win = []; for (var j = 0; j < T.length; j++) if (Math.abs(T[j] - T[i]) < 0.4) win.push(F[j]); win.sort(function (a, b) { return a - b; }); return v / win[Math.floor(win.length / 2)]; });
    var view = "raw", per = null, best = null;
    var ip = $("lab-p");
    $("lab-view").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; view = b.dataset.v; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    ip.addEventListener("input", function () { if (view !== "fold") { view = "fold"; $("lab-view").querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x.dataset.v === "fold"); }); } draw(); });
    $("lab-csv").addEventListener("click", function () { S.csv("tess_mock_lightcurve.csv", ["time", "flux", "flux_detrended"], T.map(function (t, i) { return [t, F[i], FL[i].toFixed(6)]; })); });
    function fold(P, nb) { var s = new Array(nb).fill(0), n = new Array(nb).fill(0); T.forEach(function (t, i) { var b = Math.floor(((t % P) / P) * nb); s[b] += FL[i]; n[b]++; }); return s.map(function (v, i) { return n[i] ? v / n[i] : 1; }).map(function (v, i) { return [v, n[i]]; }); }
    $("lab-bls").addEventListener("click", function () {
      per = [];
      for (var P = 1; P <= 10; P += 0.002) {
        var bins = fold(P, Math.max(30, Math.round(P / 0.05))), mn = 1, cnt = 0;
        bins.forEach(function (b) { if (b[1] > 1 && b[0] < mn) { mn = b[0]; cnt = b[1]; } });
        per.push([P, (1 - mn) / 0.0008 * Math.sqrt(cnt)]);
      }
      best = per.reduce(function (m, q) { return q[1] > m[1] ? q : m; });
      ip.value = best[0]; view = "fold"; $("lab-view").querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x.dataset.v === "fold"); }); draw();
    });
    function draw() {
      var f = S.fit(cv, 0.5), c = f.ctx, w = f.w, h = f.h, P = +ip.value;
      $("lab-pv").textContent = P.toFixed(3) + " 일";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      if (view !== "fold") {
        var ys = view === "raw" ? F : FL;
        var A = S.axes(c, { x: 64, y: 14, w: w - 80, h: h - 56, x0: 0, x1: 27, y0: view === "raw" ? 0.993 : 0.9945, y1: view === "raw" ? 1.006 : 1.003, xl: "시간 (일)", yl: "상대 밝기", yfmt: function (v) { return v.toFixed(3); } });
        ys.forEach(function (v, i) { c.fillStyle = "rgba(147,197,253,.75)"; c.fillRect(A.X(T[i]) - 1, A.Y(v) - 1, 2.2, 2.2); });
        $("lab-out").innerHTML = view === "raw" ? "관측점 <b>" + T.length + "개</b> (30분 간격, 13.1 ~ 14.2일은 자료 전송으로 공백)<br>느린 밝기 변화: 별의 자전 + 흑점" : "이동 중앙값(창 0.8일)으로 나누어 느린 변화를 제거했다.<br>일정한 간격으로 나타나는 작은 어두워짐을 찾아보자.";
        return;
      }
      var top = per ? h * 0.32 : 0;
      if (per) {
        var B = S.axes(c, { x: 64, y: 10, w: w - 80, h: top - 34, x0: 1, x1: 10, y0: 0, y1: best[1] * 1.1, yt: [0], yl: "신호 세기" });
        c.strokeStyle = "#a78bfa"; c.beginPath(); per.forEach(function (q, i) { var X = B.X(q[0]), Y = B.Y(q[1]); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); }); c.stroke();
        c.strokeStyle = "#fbbf24"; c.beginPath(); c.moveTo(B.X(P), 10); c.lineTo(B.X(P), top - 24); c.stroke();
        c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(11); c.fillText("주기 탐색 결과 (가로축: 시험 주기, 일)", 70, 22);
      }
      var A2 = S.axes(c, { x: 64, y: top + 14, w: w - 80, h: h - top - 56, x0: 0, x1: 1, y0: 0.9945, y1: 1.003, xl: "위상 (시간 ÷ 주기의 나머지)", yl: "상대 밝기", yfmt: function (v) { return v.toFixed(3); } });
      T.forEach(function (t, i) { c.fillStyle = "rgba(147,197,253,.55)"; c.fillRect(A2.X((t % P) / P) - 1, A2.Y(FL[i]) - 1, 2, 2); });
      var nb = Math.max(30, Math.round(P / 0.04)), bins = fold(P, nb), mn = 1, mi = 0;
      c.strokeStyle = "#fb923c"; c.lineWidth = 2; c.beginPath();
      bins.forEach(function (b, i) { var X = A2.X((i + 0.5) / nb), Y = A2.Y(b[0]); if (i) c.lineTo(X, Y); else c.moveTo(X, Y); if (b[1] > 1 && b[0] < mn) { mn = b[0]; mi = i; } }); c.stroke(); c.lineWidth = 1;
      var good = Math.abs(P - Pt) < 0.01;
      $("lab-out").innerHTML = "시험 주기 <b>" + P.toFixed(3) + "일</b> · 가장 깊은 구간 깊이 ≈ <b>" + (1 - mn).toFixed(4) + "</b><br>" + (good ? "✔ 어두워짐이 한 위상에 모였다! 이 깊이를 아래 계산 칸에 넣어 보자." : (best ? "주기 탐색 최고점: <b>" + best[0].toFixed(3) + "일</b> · 그 절반·두 배 위치의 작은 봉우리는 '가짜 주기(앨리어스)'이다." : "주기 슬라이더를 움직이며 점들이 한곳에 모이는 주기를 찾아보자."));
    }
    draw(); S.onResize(draw);
    // 계산 칸
    function calc() {
      var d = parseFloat($("in-d").value), p = parseFloat($("in-p").value);
      if (d > 0) $("o-r").textContent = (0.95 * 109 * Math.sqrt(d)).toFixed(1);
      if (p > 0) { var a = Math.pow(0.97 * Math.pow(p / 365.25, 2), 1 / 3); $("o-a").textContent = a.toFixed(3); $("o-hz").textContent = a < 0.88 ? "너무 가깝다 (생명 가능 지대 안쪽)" : a > 1.27 ? "너무 멀다 (바깥쪽)" : "생명 가능 지대 안!"; }
    }
    $("in-d").addEventListener("input", calc); $("in-p").addEventListener("input", calc);
  })();
})();
