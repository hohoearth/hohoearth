/* I-04 태양계 행성과 소천체 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 천체 분류기 ---------- */
  (function () {
    var cv = $("sim-cls"); if (!cv) return;
    // [이름, 태양 공전, 구형, 궤도 청소, 설명]
    var O = [
      ["목성", 1, 1, 1, "태양계에서 가장 무거운 행성. 궤도 주변을 압도적으로 지배한다."],
      ["지구", 1, 1, 1, "궤도 주변 질량의 거의 전부를 차지한다."],
      ["세레스", 1, 1, 0, "소행성대 질량의 약 1/3을 차지하지만 나머지 소행성들과 궤도를 공유한다."],
      ["명왕성", 1, 1, 0, "카이퍼대의 수많은 천체(플루티노)와 궤도를 공유한다."],
      ["에리스", 1, 1, 0, "명왕성보다 약간 무거운 산란 원반 천체."],
      ["베스타", 1, 0, 0, "지름 약 525 km. 큰 충돌구 때문에 정역학 평형 모양이 아니어서 소천체로 분류된다."],
      ["핼리 혜성", 1, 0, 0, "지름 약 11 km의 땅콩 모양 핵. 주기 약 76년."],
      ["아로코스", 1, 0, 0, "뉴허라이즌스가 방문한 카이퍼대 천체. 두 덩어리가 붙은 눈사람 모양."],
      ["달", 0, 1, 0, "지구 주위를 공전하므로 크기와 관계없이 위성이다."],
      ["가니메데", 0, 1, 0, "수성보다 크지만 목성을 공전하는 위성이다."]
    ];
    var cur = -1, box = $("cls-obj");
    O.forEach(function (o, i) { var b = document.createElement("button"); b.className = "chip"; b.textContent = o[0]; b.addEventListener("click", function () { cur = i; box.querySelectorAll(".chip").forEach(function (x, k) { x.classList.toggle("on", k === i); }); draw(); }); box.appendChild(b); });
    function draw() {
      var f = S.fit(cv, 0.5), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var o = cur >= 0 ? O[cur] : null;
      var qx = [w * 0.16, w * 0.42, w * 0.68], qy = h * 0.3;
      var Q = ["태양 주위를 직접 공전?", "자체 중력으로 거의 구형?", "궤도 주변을 청소?"];
      var leaf = [["위성", "#94a3b8"], ["태양계 소천체", "#84cc16"], ["왜소 행성", "#a78bfa"], ["행성", "#60a5fa"]];
      var path = o ? (o[1] ? (o[2] ? (o[3] ? 3 : 2) : 1) : 0) : -1;
      var depth = o ? (o[1] ? (o[2] ? 3 : 2) : 1) : 0;
      function node(x, y, t, on, col) {
        c.font = S.font(13, true); var tw = c.measureText(t).width + 24;
        c.fillStyle = on ? (col || "#4f46e5") : "rgba(255,255,255,.08)"; c.strokeStyle = on ? "#fff" : "rgba(255,255,255,.25)";
        c.beginPath(); if (c.roundRect) c.roundRect(x - tw / 2, y - 17, tw, 34, 10); else c.rect(x - tw / 2, y - 17, tw, 34); c.fill(); c.stroke();
        c.fillStyle = "#fff"; c.textAlign = "center"; c.fillText(t, x, y + 5);
      }
      function edge(x1, y1, x2, y2, on, lab) { c.strokeStyle = on ? "#fbbf24" : "rgba(255,255,255,.2)"; c.lineWidth = on ? 3 : 1; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.lineWidth = 1; c.fillStyle = on ? "#fbbf24" : "rgba(255,255,255,.5)"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText(lab, (x1 + x2) / 2 + 10, (y1 + y2) / 2); }
      var ly = h * 0.78;
      edge(qx[0] + 70, qy, qx[1] - 80, qy, depth >= 2, "예");
      edge(qx[1] + 80, qy, qx[2] - 60, qy, depth >= 3, "예");
      edge(qx[0], qy + 17, qx[0], ly - 17, path === 0, "아니요");
      edge(qx[1], qy + 17, qx[1], ly - 17, path === 1, "아니요");
      edge(qx[2], qy + 17, qx[2] - 40, ly - 17, path === 2, "아니요");
      edge(qx[2] + 30, qy + 17, w * 0.9, ly - 17, path === 3, "예");
      Q.forEach(function (t, i) { node(qx[i], qy, t, depth > i, "#4338ca"); });
      node(qx[0], ly, leaf[0][0], path === 0, leaf[0][1]); node(qx[1], ly, leaf[1][0], path === 1, leaf[1][1]);
      node(qx[2] - 40, ly, leaf[2][0], path === 2, leaf[2][1]); node(w * 0.9, ly, leaf[3][0], path === 3, leaf[3][1]);
      if (o) S.tag(c, "▶ " + o[0], 10, 26, { bg: "rgba(180,83,9,.9)", size: 14 });
      c.textAlign = "left";
      if (o) $("cls-out").innerHTML = "<b>" + o[0] + " → " + leaf[path][0] + "</b><br>" + o[4];
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 1: 혜성의 꼬리 ---------- */
  (function () {
    var cv = $("sim-comet"); if (!cv) return;
    var GM = 4 * Math.PI * Math.PI, a = 3, t = 0, paused = false, dust = [], ions = [], R = S.rand(3);
    var ie = $("com-e"), isp = $("com-sp");
    $("com-pause").addEventListener("click", function () { paused = !paused; this.textContent = paused ? "▶ 재생" : "⏸ 멈춤"; });
    ie.addEventListener("input", function () { dust = []; ions = []; });
    function state(tt, e) {
      var P = Math.pow(a, 1.5), M = 2 * Math.PI * ((tt / P) % 1), E = M;
      for (var i = 0; i < 30; i++) E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
      var x = a * (Math.cos(E) - e), y = a * Math.sqrt(1 - e * e) * Math.sin(E);
      var n = 2 * Math.PI / P, dE = n / (1 - e * Math.cos(E));
      return { x: x, y: y, vx: -a * Math.sin(E) * dE, vy: a * Math.sqrt(1 - e * e) * Math.cos(E) * dE, r: Math.hypot(x, y) };
    }
    S.loop(function (dt) {
      var f = S.fit(cv, 0.58), c = f.ctx, w = f.w, h = f.h, e = +ie.value;
      $("com-ev").textContent = e.toFixed(2);
      var step = paused ? 0 : dt * 0.35 * +isp.value; // 년
      var q = a * (1 - e), Q = a * (1 + e);
      var sc = Math.min(w * 0.9 / (2 * a), h * 0.8 / (2 * a * Math.sqrt(1 - e * e)));
      var cx = w / 2 + a * e * sc, cy = h / 2; // 태양 위치 (화면)
      // 적분
      var sub = 8;
      for (var s = 0; s < sub && step > 0; s++) {
        var h2 = step / sub; t += h2;
        var p = state(t, e);
        var rate = Math.min(60, 2.2 / (p.r * p.r)) * h2 * 120;
        for (var k = 0; k < rate; k++) {
          if (rate - k < 1 && R() > rate - k) break;
          var beta = 0.1 + R() * 0.6;
          dust.push({ x: p.x, y: p.y, vx: p.vx + (R() - .5) * 0.3, vy: p.vy + (R() - .5) * 0.3, b: beta, age: 0 });
          ions.push({ x: p.x, y: p.y, ux: p.x / p.r, uy: p.y / p.r, age: 0 });
        }
        dust.forEach(function (d) { var r = Math.hypot(d.x, d.y), acc = -GM * (1 - d.b) / (r * r * r); d.vx += acc * d.x * h2; d.vy += acc * d.y * h2; d.x += d.vx * h2; d.y += d.vy * h2; d.age += h2; });
        ions.forEach(function (d) { d.x += d.ux * 60 * h2; d.y += d.uy * 60 * h2; d.age += h2; });
      }
      dust = dust.filter(function (d) { return d.age < 0.35; }); if (dust.length > 2500) dust.splice(0, dust.length - 2500);
      ions = ions.filter(function (d) { return d.age < 0.03; }); if (ions.length > 1500) ions.splice(0, ions.length - 1500);
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h); S.stars(c, w, h, 100, 8);
      c.strokeStyle = "rgba(255,255,255,.22)"; c.setLineDash([4, 4]); c.beginPath(); c.ellipse(w / 2, cy, a * sc, a * Math.sqrt(1 - e * e) * sc, 0, 0, 7); c.stroke(); c.setLineDash([]);
      // 지구 궤도 참고
      c.strokeStyle = "rgba(96,165,250,.35)"; c.beginPath(); c.arc(cx, cy, sc, 0, 7); c.stroke();
      c.fillStyle = "rgba(96,165,250,.7)"; c.font = S.font(10); c.fillText("지구 궤도 (1 AU)", cx + sc * 0.72, cy - sc * 0.72);
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, 22); g.addColorStop(0, "#fff7cc"); g.addColorStop(1, "rgba(251,191,36,0)"); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 22, 0, 7); c.fill(); S.dot(c, cx, cy, 7, "#fbbf24");
      function X(x) { return cx + x * sc; } function Y(y) { return cy - y * sc; }
      dust.forEach(function (d) { c.fillStyle = "rgba(253,230,138," + (0.5 * (1 - d.age / 0.35)) + ")"; c.fillRect(X(d.x), Y(d.y), 1.6, 1.6); });
      ions.forEach(function (d) { c.fillStyle = "rgba(96,165,250," + (0.8 * (1 - d.age / 0.03)) + ")"; c.fillRect(X(d.x), Y(d.y), 1.6, 1.6); });
      var p0 = state(t, e), coma = Math.min(14, 5 / p0.r);
      var cg = c.createRadialGradient(X(p0.x), Y(p0.y), 0, X(p0.x), Y(p0.y), 4 + coma * 2); cg.addColorStop(0, "rgba(220,255,255,.95)"); cg.addColorStop(1, "rgba(150,220,255,0)");
      c.fillStyle = cg; c.beginPath(); c.arc(X(p0.x), Y(p0.y), 4 + coma * 2, 0, 7); c.fill(); S.dot(c, X(p0.x), Y(p0.y), 2.5, "#fff");
      var vlen = Math.hypot(p0.vx, p0.vy); S.arrow(c, X(p0.x), Y(p0.y), X(p0.x) + p0.vx / vlen * 26, Y(p0.y) - p0.vy / vlen * 26, "rgba(255,255,255,.75)", 1.5);
      var out = (p0.x * p0.vx + p0.y * p0.vy) > 0;
      $("com-out").innerHTML = "태양과의 거리 <b>" + p0.r.toFixed(2) + " AU</b><br>속력 <b>" + (vlen * 4.74).toFixed(1) + " km/s</b><br>근일점 " + q.toFixed(2) + " AU · 원일점 " + Q.toFixed(2) + " AU<br>지금 혜성은 태양에서 <b>" + (out ? "멀어지는 중 → 꼬리가 진행 방향 앞쪽" : "다가오는 중 → 꼬리가 진행 방향 뒤쪽") + "</b>";
    });
  })();

  /* ---------- 시뮬레이션 2: 분화 ---------- */
  (function () {
    var cv = $("sim-diff"); if (!cv) return;
    var N = 520, P = [], R = S.rand(21), step = 0, k = 0, tBreak = 0;
    for (var i = 0; i < N; i++) { var r = Math.sqrt(R()), th = R() * Math.PI * 2; P.push({ r0: r, th: th, metal: R() < 0.22, r: r, rt: r }); }
    var ms = P.filter(function (p) { return p.metal; }).sort(function (a, b) { return a.r0 - b.r0; }), ss = P.filter(function (p) { return !p.metal; }).sort(function (a, b) { return a.r0 - b.r0; });
    var rc = Math.sqrt(ms.length / N);
    ms.forEach(function (p, i) { p.rd = rc * Math.sqrt((i + 0.5) / ms.length); });
    ss.forEach(function (p, i) { p.rd = Math.sqrt(rc * rc + (1 - rc * rc) * (i + 0.5) / ss.length); });
    var idD = $("diff-d");
    function Tpeak() { var D = +idD.value; return 250 + 1650 * (1 - Math.exp(-D / 160)); }
    function melts() { return Tpeak() > 1300; }
    var st = S.stepper("diff-steps", "diff-next", "diff-reset", function (i) { step = i; if (i === 3) tBreak = 0; });
    S.loop(function (dt) {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h;
      $("diff-dv").textContent = idD.value + " km";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var cx = w * 0.45, cy = h * 0.5, Rr = Math.min(w, h) * 0.34, melt = melts();
      var heat = step >= 1 ? Math.min(1, (Tpeak() - 250) / 1650) : 0;
      if (step >= 2 && melt) k = Math.min(1, k + dt * 0.5); else if (step < 2) k = 0;
      if (step === 3) tBreak += dt;
      // 바탕 원
      if (step < 3) {
        var g = c.createRadialGradient(cx, cy, 0, cx, cy, Rr * 1.05);
        g.addColorStop(0, "rgba(" + Math.round(80 + 175 * heat) + "," + Math.round(60 + 60 * heat) + ",40,.6)"); g.addColorStop(1, "rgba(60,40,30,.3)");
        c.fillStyle = g; c.beginPath(); c.arc(cx, cy, Rr * 1.04, 0, 7); c.fill();
      }
      var NS = 7;
      P.forEach(function (p) {
        p.r = S.lerp(p.r0, p.rd, k);
        var x = cx + Math.cos(p.th) * p.r * Rr, y = cy + Math.sin(p.th) * p.r * Rr;
        if (step === 3) {
          var core = p.r < rc * 1.02, sec = Math.floor(p.th / (Math.PI * 2) * (core ? 3 : NS)), sa = (sec + 0.5) / (core ? 3 : NS) * Math.PI * 2;
          var d = tBreak * Rr * (core ? 0.25 : 0.55) * (0.6 + p.r);
          x += Math.cos(sa) * d; y += Math.sin(sa) * d;
        }
        c.fillStyle = p.metal ? (heat > 0.6 && step >= 1 ? "#e5e7eb" : "#9ca3af") : (step >= 1 ? "rgb(" + Math.round(150 + 90 * heat) + "," + Math.round(100 + 30 * heat) + ",60)" : "#a16207");
        c.fillRect(x - 2, y - 2, 4, 4);
      });
      if (step === 3 && tBreak > 0.8) {
        if (melt && k > 0.9) {
          S.tag(c, "철질 운석 (핵)", cx, cy + 6, { align: "center", bg: "rgba(75,85,99,.95)", size: 12 });
          S.tag(c, "석철질 운석 (핵–맨틀 경계)", cx + Rr * 0.95, cy - Rr * 0.65, { bg: "rgba(120,53,15,.9)", size: 12 });
          S.tag(c, "에이콘드라이트 (지각)", cx - Rr * 1.5, cy + Rr * 1.0, { bg: "rgba(161,98,7,.9)", size: 12 });
        } else S.tag(c, "콘드라이트 (분화되지 않음)", cx, cy - Rr * 1.2, { align: "center", bg: "rgba(161,98,7,.9)", size: 13 });
      }
      // 온도 게이지
      S.gauge(c, w - 60, 30, 22, h - 80, step >= 1 ? (Tpeak() - 200) / 1800 : 0.03, Tpeak() > 1300 && step >= 1 ? "#ef4444" : "#f59e0b", "최고 온도", step >= 1 ? Math.round(Tpeak()) + " K" : "-");
      var y13 = 30 + (h - 80) * (1 - (1300 - 200) / 1800); c.strokeStyle = "#fff"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(w - 70, y13); c.lineTo(w - 28, y13); c.stroke(); c.setLineDash([]);
      c.fillStyle = "#fff"; c.font = S.font(10); c.textAlign = "right"; c.fillText("금속 녹는 온도", w - 72, y13 + 4); c.textAlign = "left";
      $("diff-out").innerHTML = "지름 <b>" + idD.value + " km</b> · 최고 온도 약 <b>" + Math.round(Tpeak()) + " K</b><br>" + (melt ? "내부가 녹아 <b>분화가 일어난다</b>" : "녹지 않아 <b>분화하지 않는다</b>") + (step === 3 ? "<br>→ " + (melt ? "철질·석철질·에이콘드라이트 운석" : "콘드라이트 운석") : "");
    });
  })();

  /* ---------- 데이터 랩: 커크우드 간극 ---------- */
  (function () {
    var cv = $("lab-hist"); if (!cv) return;
    var R = S.rand(1866), A = [];
    var GAPS = [[2.502, 0.014, 0.96], [2.825, 0.012, 0.95], [2.958, 0.010, 0.9], [3.279, 0.035, 0.97], [2.706, 0.006, 0.5], [3.075, 0.008, 0.6]];
    function base(a) { if (a < 2.1 || a > 3.32) return 0; var x = (a - 2.1) / 1.22; return Math.pow(Math.sin(Math.PI * Math.min(1, x * 1.05)), 0.6) * (1 + 0.35 * Math.sin(x * 9)); }
    function gap(a) { var g = 1; GAPS.forEach(function (q) { g *= 1 - q[2] * Math.exp(-Math.pow((a - q[0]) / q[1], 2)); }); return g; }
    while (A.length < 3460) { var a = 2.08 + R() * 1.26; if (R() * 1.4 < base(a) * gap(a)) A.push(a); }
    for (var i = 0; i < 70; i++) A.push(1.94 + R.gauss() * 0.04);
    for (var j = 0; j < 40; j++) A.push(3.35 + R() * 0.4);
    for (var k = 0; k < 170; k++) A.push(3.97 + R.gauss() * 0.035);
    for (var m = 0; m < 260; m++) A.push(5.203 + R.gauss() * 0.06);
    A = A.map(function (v) { return +v.toFixed(4); });
    var marks = [], showRes = false;
    var RES = [["3:1", 2.502], ["5:2", 2.825], ["7:3", 2.958], ["2:1", 3.279], ["3:2 힐다", 3.97], ["1:1 트로이", 5.203]];
    var ibw = $("lab-bw"), Ax = null;
    ibw.addEventListener("input", draw);
    $("lab-res").addEventListener("click", function () { showRes = !showRes; this.classList.toggle("on", showRes); draw(); });
    $("lab-clear").addEventListener("click", function () { marks = []; draw(); });
    $("lab-csv").addEventListener("click", function () { S.csv("asteroid_semimajor_axis.csv", ["id", "a_AU"], A.map(function (v, i) { return [i + 1, v]; })); });
    cv.addEventListener("click", function (e) { if (!Ax) return; var x = e.clientX - cv.getBoundingClientRect().left, v = Ax.inX(x); if (v > 1.8 && v < 5.5) { marks.push(v); draw(); } });
    function draw() {
      var f = S.fit(cv, 0.5), c = f.ctx, w = f.w, h = f.h, bw = +ibw.value;
      $("lab-bwv").textContent = bw.toFixed(3) + " AU";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var x0 = 1.8, x1 = 5.4, nb = Math.ceil((x1 - x0) / bw), cnt = new Array(nb).fill(0);
      A.forEach(function (v) { var b = Math.floor((v - x0) / bw); if (b >= 0 && b < nb) cnt[b]++; });
      var mx = Math.max.apply(null, cnt);
      Ax = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 56, x0: x0, x1: x1, y0: 0, y1: mx * 1.1, xl: "궤도 긴반지름 a (AU)", yl: "소행성 수" });
      cnt.forEach(function (n, i) { var X0 = Ax.X(x0 + i * bw), X1 = Ax.X(x0 + (i + 1) * bw); c.fillStyle = "#60a5fa"; c.fillRect(X0, Ax.Y(n), Math.max(1, X1 - X0 - (X1 - X0 > 3 ? 1 : 0)), Ax.Y(0) - Ax.Y(n)); });
      if (showRes) RES.forEach(function (r, i) { var X = Ax.X(r[1]); c.strokeStyle = i < 4 ? "#f87171" : "#34d399"; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(X, 14); c.lineTo(X, h - 42); c.stroke(); c.setLineDash([]); S.tag(c, r[0], X, 28 + (i % 2) * 20, { align: "center", size: 11, bg: i < 4 ? "rgba(220,38,38,.85)" : "rgba(15,157,107,.85)" }); });
      marks.forEach(function (m) { var X = Ax.X(m); c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath(); c.moveTo(X, h - 42); c.lineTo(X, h - 62); c.stroke(); c.lineWidth = 1; S.dot(c, X, h - 64, 4, "#fbbf24"); });
      S.tag(c, "헝가리아군", Ax.X(1.94), Ax.Y(mx * 0.25), { align: "center", size: 10 });
      S.tag(c, "트로이군", Ax.X(5.2), Ax.Y(mx * 0.45), { align: "center", size: 10 });
      $("lab-out").innerHTML = "표본 <b>" + A.length + "개</b> · 구간 <b>" + nb + "개</b><br>" + (marks.length ? "내가 표시한 위치: " + marks.map(function (m) { var near = RES.filter(function (r) { return Math.abs(r[1] - m) < 0.04; })[0]; return "<b>" + m.toFixed(2) + "</b>" + (near && showRes ? "(" + near[0] + ")" : ""); }).join(", ") + " AU" : "그래프를 클릭해 간극 위치에 표시해 보자.");
    }
    draw(); S.onResize(draw);
    $("res-check").addEventListener("click", function () {
      var ok = 0, all = document.querySelectorAll("#res-table .ans");
      all.forEach(function (inp) { var v = parseFloat(inp.value), good = Math.abs(v - +inp.dataset.v) < 0.04; inp.style.background = isNaN(v) ? "" : good ? "var(--ok-bg)" : "var(--bad-bg)"; if (good) ok++; });
      $("res-msg").textContent = ok + " / " + all.length + " 정답" + (ok === all.length ? " · 모두 맞았다! 공명 위치 표시를 켜서 간극과 비교해 보자." : " (힌트: a = P^(2/3), 계산기의 xʸ 키 사용)");
    });
  })();
})();
