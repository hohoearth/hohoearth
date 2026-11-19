/* II-3 해파 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$, G = 9.8;
  // 분산 관계 ω² = gk tanh(kh) 를 풀어 파수 k 구하기
  function waveK(T, h) {
    var w = 2 * Math.PI / T, k = w * w / G;
    for (var i = 0; i < 40; i++) k = w * w / (G * Math.tanh(k * h));
    return k;
  }

  /* ---------- 1. 물 입자의 운동: 심해파 · 천이파 · 천해파 ---------- */
  (function () {
    var cv = $("sim-orbit"); if (!cv) return;
    var sH = $("orb-h"), out = $("orb-out"), g, L = 40, A = 2.2;
    function size() { g = S.fit(cv, 0.55); }
    size(); window.addEventListener("resize", size);
    var trail = [];
    S.loop(function (dt, now) {
      var h = +sH.value; $("orb-hv").textContent = h + " m";
      var k = 2 * Math.PI / L, c = Math.sqrt(G / k * Math.tanh(k * h)), w = k * c, ratio = h / L;
      var kind = ratio > 0.5 ? "심해파" : ratio < 0.05 ? "천해파" : "천이파";
      var ctx = g.ctx, W = g.w, H = g.h, top = 36, sc = (H - top - 20) / Math.max(h, 22), PX = W / (L * 2);
      ctx.fillStyle = "#cfe6f7"; ctx.fillRect(0, 0, W, H);
      // 물
      ctx.fillStyle = "#2a78b8"; ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += 4) { var X = x / PX; ctx.lineTo(x, top + 18 - A * sc * 0.6 * Math.cos(k * X - w * now * 0.6)); }
      ctx.lineTo(W, H); ctx.fill();
      var bed = top + 18 + h * sc;
      ctx.fillStyle = "#c8a46a"; ctx.fillRect(0, bed, W, H - bed);
      // 물 입자
      var cols = 9, rows = 5;
      for (var r = 0; r < rows; r++) {
        var z = h * r / (rows - 0.5), dz = -z;
        var ax = A * Math.cosh(k * (dz + h)) / Math.sinh(k * h), az = A * Math.sinh(k * (dz + h)) / Math.sinh(k * h);
        for (var cI = 0; cI < cols; cI++) {
          var X0 = (cI + 0.5) * (2 * L) / cols, ph = k * X0 - w * now * 0.6;
          var px = X0 * PX + ax * sc * 0.6 * Math.sin(ph), py = top + 18 + z * sc - az * sc * 0.6 * Math.cos(ph);
          ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.beginPath(); ctx.ellipse(X0 * PX, top + 18 + z * sc, Math.max(0.5, ax * sc * 0.6), Math.max(0.5, az * sc * 0.6), 0, 0, 7); ctx.stroke();
          ctx.fillStyle = r === 0 && cI === 4 ? "#fde047" : "#fff"; ctx.beginPath(); ctx.arc(px, py, r === 0 && cI === 4 ? 6 : 3.5, 0, 7); ctx.fill();
        }
      }
      S.arrow(ctx, W - 150, 20, W - 40, 20, "#0f172a", 2); S.tag(ctx, "해파의 진행 방향", W - 160, 26, { align: "right", size: 11, bg: "rgba(15,23,42,.7)" });
      S.tag(ctx, kind + " (수심/파장 = " + ratio.toFixed(2) + ")", 10, H - 8, { size: 13, bg: kind === "심해파" ? "#1d4ed8" : kind === "천해파" ? "#b45309" : "#6d28d9" });
      var cDeep = Math.sqrt(G * L / (2 * Math.PI)), cSh = Math.sqrt(G * h);
      out.innerHTML = "<b>파장</b> L = " + L + " m · <b>수심</b> h = " + h + " m<br><b>분류</b> " + kind +
        "<br><b>물 입자</b> " + (kind === "심해파" ? "원운동, 깊을수록 원이 작아짐" : kind === "천해파" ? "납작한 타원 운동, 해저에서는 수평 왕복" : "타원 운동") +
        "<br><b>전파 속도</b> " + (kind === "심해파" ? "√(gL/2π) = " + cDeep.toFixed(1) + " m/s (파장이 결정)" : kind === "천해파" ? "√(gh) = " + cSh.toFixed(1) + " m/s (수심이 결정)" : "약 " + c.toFixed(1) + " m/s (중간 성질)");
    });
  })();

  /* ---------- 2. 해안으로 다가오는 해파의 변형 ---------- */
  (function () {
    var cv = $("sim-shoal"); if (!cv) return;
    var sT = $("sh-t"), out = $("sh-out"), g;
    function size() { g = S.fit(cv, 0.42); }
    size(); window.addEventListener("resize", size);
    var D = 1200; // 화면 전체 거리 (m)
    function depth(x) { return x < 300 ? 60 : Math.max(0, 60 - (x - 300) * 0.072); }
    S.loop(function (dt, now) {
      var T = +sT.value; $("sh-tv").textContent = T + " 초";
      var ctx = g.ctx, W = g.w, H = g.h, sea = H * 0.42, sc = (H - sea - 8) / 62, PX = W / D;
      ctx.fillStyle = "#cfe6f7"; ctx.fillRect(0, 0, W, H);
      // 위상 적분
      var phase = 0, k0 = waveK(T, 60), cg0 = 0.5 * (2 * Math.PI / T) / k0 * (1 + 2 * k0 * 60 / Math.sinh(2 * k0 * 60)), H0 = 1.0, broke = -1;
      var pts = [], w = 2 * Math.PI / T;
      for (var x = 0; x <= D; x += 2) {
        var h = depth(x); if (h < 0.4) { pts.push([x, null]); continue; }
        var k = waveK(T, h); phase += k * 2;
        var cg = 0.5 * w / k * (1 + 2 * k * h / Math.sinh(2 * k * h)), Hh = H0 * Math.sqrt(cg0 / cg);
        if (broke < 0 && Hh / h > 0.78) broke = x;
        if (broke >= 0) Hh = Math.min(Hh, 0.78 * h);
        pts.push([x, sea - Hh * 6 * Math.cos(phase - w * now) * 0.5, Hh, k]);
      }
      ctx.fillStyle = "#2a78b8"; ctx.beginPath(); ctx.moveTo(0, H);
      pts.forEach(function (p) { if (p[1] !== null) ctx.lineTo(p[0] * PX, p[1]); });
      ctx.lineTo(W, H); ctx.fill();
      ctx.fillStyle = "#c8a46a"; ctx.beginPath(); ctx.moveTo(0, H);
      for (var x2 = 0; x2 <= D; x2 += 10) ctx.lineTo(x2 * PX, sea + depth(x2) * sc * 0.9 + 6); ctx.lineTo(W, sea - 20); ctx.lineTo(W, H); ctx.fill();
      if (broke > 0) {
        for (var f = 0; f < 14; f++) { ctx.fillStyle = "rgba(255,255,255," + (0.5 + Math.random() * 0.4) + ")"; ctx.beginPath(); ctx.arc(broke * PX + Math.random() * 60, sea - 6 + Math.random() * 10, 3 + Math.random() * 4, 0, 7); ctx.fill(); }
        S.tag(ctx, "연안 쇄파", broke * PX, sea - 28, { size: 12, bg: "#b91c1c" });
      }
      S.tag(ctx, "깊은 바다: 너울 (파장 길고 파고 낮음)", 8, 22, { size: 12, bg: "rgba(29,78,216,.85)" });
      S.tag(ctx, "얕아질수록 → 느려지고, 파장 짧아지고, 파고 높아짐", W * 0.36, 48, { size: 12, bg: "rgba(180,83,9,.85)" });
      var Ld = 2 * Math.PI / k0, x3 = 300 + 500, kk = waveK(T, depth(x3)), Ls = 2 * Math.PI / kk;
      out.innerHTML = "<b>주기</b> " + T + " s (해안 쪽으로 가도 주기는 일정)<br><b>깊은 곳(60 m) 파장</b> ≈ " + Math.round(Ld) + " m, 속도 ≈ " + (Ld / T).toFixed(1) + " m/s<br><b>수심 " + depth(x3).toFixed(0) + " m 지점 파장</b> ≈ " + Math.round(Ls) + " m, 속도 ≈ " + (Ls / T).toFixed(1) + " m/s<br>파고가 수심에 비해 너무 커지면 부서진다.";
    });
  })();

  /* ---------- 3. 해파의 굴절: 곶과 만 ---------- */
  (function () {
    var cv = $("sim-refr"); if (!cv) return;
    var bP = $("rf-play"), out = $("rf-out"), g, crests = [], tAcc = 0, run = true;
    function shoreY(x) { // 0~1 좌표에서 해안선 y (곶은 바다 쪽으로 튀어나옴)
      return 0.78 - 0.22 * Math.exp(-Math.pow((x - 0.3) / 0.09, 2)) + 0.12 * Math.exp(-Math.pow((x - 0.7) / 0.12, 2));
    }
    function depth(x, y) { var d = shoreY(x) - y; return Math.max(0, d); }
    function size() { g = S.fit(cv, 0.6); }
    size(); window.addEventListener("resize", size);
    bP.addEventListener("click", function () { run = !run; bP.textContent = run ? "❚❚ 멈춤" : "▶ 계속"; });
    function newCrest() { var c = []; for (var i = 0; i <= 120; i++) c.push([i / 120 * 1.2 - 0.1, 0.02]); return c; }
    S.loop(function (dt) {
      if (run) {
        tAcc += dt; if (tAcc > 1.2) { tAcc = 0; crests.push(newCrest()); }
        crests.forEach(function (c) {
          var nw = c.map(function (p, i) {
            var a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)];
            var tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1, nx = -ty / L, ny = tx / L;
            if (ny < 0) { nx = -nx; ny = -ny; }
            var d = depth(p[0], p[1]); if (d <= 0.004) return p;
            var sp = 0.16 * Math.sqrt(Math.min(d, 0.35) / 0.35);
            return [p[0] + nx * sp * dt, p[1] + ny * sp * dt];
          });
          for (var i = 0; i < c.length; i++) c[i] = nw[i];
        });
        crests = crests.filter(function (c) { return c.some(function (p) { return depth(p[0], p[1]) > 0.01; }); });
      }
      var ctx = g.ctx, W = g.w, H = g.h;
      ctx.fillStyle = "#1f5f9e"; ctx.fillRect(0, 0, W, H);
      // 등수심선
      [0.06, 0.14, 0.24].forEach(function (d) { ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.setLineDash([5, 5]); ctx.beginPath(); for (var x = 0; x <= 1; x += 0.01) { var y = shoreY(x) - d; x ? ctx.lineTo(x * W, y * H) : ctx.moveTo(x * W, y * H); } ctx.stroke(); });
      ctx.setLineDash([]);
      // 육지
      ctx.fillStyle = "#c9b27a"; ctx.beginPath(); ctx.moveTo(0, H); for (var x = 0; x <= 1.001; x += 0.01) ctx.lineTo(x * W, shoreY(x) * H); ctx.lineTo(W, H); ctx.fill();
      ctx.fillStyle = "#6b8e4e"; ctx.beginPath(); ctx.moveTo(0, H); for (x = 0; x <= 1.001; x += 0.01) ctx.lineTo(x * W, shoreY(x) * H + 14); ctx.lineTo(W, H); ctx.fill();
      // 파봉
      crests.forEach(function (c) {
        ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.lineWidth = 2.5; ctx.beginPath(); var on = false;
        c.forEach(function (p) { if (depth(p[0], p[1]) > 0.004) { on ? ctx.lineTo(p[0] * W, p[1] * H) : ctx.moveTo(p[0] * W, p[1] * H); on = true; } else on = false; });
        ctx.stroke(); ctx.lineWidth = 1;
      });
      S.tag(ctx, "곶: 해파 에너지 집중 → 침식 (해식 절벽)", 0.3 * W, shoreY(0.3) * H + 34, { align: "center", size: 12, bg: "rgba(185,28,28,.9)" });
      S.tag(ctx, "만: 에너지 분산 → 퇴적 (모래사장)", 0.7 * W, shoreY(0.7) * H + 34, { align: "center", size: 12, bg: "rgba(21,128,61,.9)" });
      S.tag(ctx, "점선 = 같은 수심의 선 (해안에 가까울수록 얕음)", 8, 20, { size: 11 });
      out.innerHTML = "흰 선은 파의 마루(파봉)이다.<br>수심이 얕은 곳에서 파가 느려지므로, 곶 앞에서 먼저 느려진 파봉이 <b>곶 쪽으로 휘어</b> 모인다.<br>그래서 파도는 대부분 <b>해안선과 나란하게</b> 밀려온다.";
    });
  })();
})();
