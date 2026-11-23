/* I-1 지구의 형성 과정 · 시뮬레이션 모음 */
(function () {
  function $(id) { return document.getElementById(id); }
  function fit(cv, aspect) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth || 600, h = Math.round(w * aspect);
    cv.style.height = h + "px";
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function fmt(x, d) { return Number(x).toFixed(d === undefined ? 2 : d); }
  var FF = 'Pretendard, "Malgun Gothic", sans-serif';
  function font(px, bold) { return (bold ? "700 " : "") + px + "px " + FF; }
  /* 배경 상자가 있는 글씨 */
  function tag(ctx, text, x, y, opt) {
    opt = opt || {};
    ctx.font = font(opt.size || 13, true);
    var w = ctx.measureText(text).width + 12, h = (opt.size || 13) + 9;
    var bx = opt.align === "center" ? x - w / 2 : opt.align === "right" ? x - w : x;
    ctx.fillStyle = opt.bg || "rgba(0,0,0,.6)";
    ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, y - h + 4, w, h, 6) : ctx.rect(bx, y - h + 4, w, h); ctx.fill();
    ctx.fillStyle = opt.color || "#fff";
    ctx.fillText(text, bx + 6, y - 1);
  }

  /* =========================================================
     1. 성운 수축과 각운동량 보존
     ========================================================= */
  (function () {
    var cv = $("sim-collapse"); if (!cv) return;
    var sR = $("collapse-r"), out = $("collapse-out"), play = $("collapse-play");
    var N = 520, P = [];
    for (var i = 0; i < N; i++) {
      P.push({ u: Math.sqrt(Math.random()), th: Math.random() * Math.PI * 2, z: (Math.random() * 2 - 1) * Math.sqrt(1 - Math.random() * 0.6), s: 0.6 + Math.random() * 1.2 });
    }
    var g, R = 1, anim = null, last = performance.now();
    function size() { g = fit(cv, 0.56); }
    size(); window.addEventListener("resize", size);
    function readout() {
      out.innerHTML = "<b>반지름</b> 처음의 " + fmt(R) + "배" +
        "<br><b>회전 속도</b> 처음의 약 " + fmt(1 / (R * R), 1) + "배" +
        "<br><b>모양</b> " + (R > 0.7 ? "둥근 구름" : R > 0.35 ? "납작해지는 중" : "납작한 원반 + 중심의 원시 태양");
    }
    sR.addEventListener("input", function () { R = +sR.value; anim = null; play.textContent = "▶ 자동 수축"; readout(); });
    play.addEventListener("click", function () {
      if (anim) { anim = null; play.textContent = "▶ 자동 수축"; return; }
      if (R <= 0.16) R = 1;
      anim = true; play.textContent = "❚❚ 멈춤";
    });
    readout();
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      if (anim) {
        R = Math.max(0.15, R - dt * 0.14);
        sR.value = R; readout();
        if (R <= 0.15) { anim = null; play.textContent = "▶ 다시"; }
      }
      var ctx = g.ctx, W = g.w, H = g.h, cx = W / 2, cy = H / 2, S = Math.min(W, H) * 0.46;
      ctx.fillStyle = "#070a14"; ctx.fillRect(0, 0, W, H);
      var omega = 0.25 * Math.min(1 / (R * R), 22);
      var glow = Math.pow(1 - R, 2.2);
      var rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * 0.35);
      rg.addColorStop(0, "rgba(255,230,150," + (0.15 + glow * 0.85) + ")");
      rg.addColorStop(0.25, "rgba(255,160,60," + (glow * 0.6) + ")");
      rg.addColorStop(1, "rgba(255,120,40,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx, cy, S * 0.35, 0, 7); ctx.fill();
      var tilt = 0.38;
      for (var i = 0; i < N; i++) {
        var p = P[i];
        p.th += omega * dt * (0.6 + 0.8 * (1 - p.u * 0.5));
        var rr = p.u * R * S;
        var x = cx + rr * Math.cos(p.th);
        var y = cy + rr * Math.sin(p.th) * tilt + p.z * S * R * R * 0.9;
        var front = Math.sin(p.th) > 0;
        ctx.fillStyle = "hsla(" + (210 - (1 - p.u) * 40 * (1 - R)) + ",60%," + (front ? 78 : 58) + "%," + (0.35 + 0.5 * (1 - p.u * 0.6)) + ")";
        ctx.fillRect(x, y, p.s, p.s);
      }
      ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.setLineDash([4, 5]);
      ctx.beginPath(); ctx.moveTo(cx, cy - S * 0.98); ctx.lineTo(cx, cy + S * 0.98); ctx.stroke(); ctx.setLineDash([]);
      tag(ctx, "회전축", cx + 8, cy - S * 0.82, { size: 12 });
      tag(ctx, "회전 속도 × " + fmt(1 / (R * R), 1), 12, 26);
      if (R < 0.4) tag(ctx, "원시 태양", cx, cy - 18, { align: "center", size: 12, bg: "rgba(120,60,0,.7)" });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* =========================================================
     2. 태양과의 거리에 따른 원반의 온도와 행성의 재료
     ========================================================= */
  (function () {
    var cv = $("sim-snow"); if (!cv) return;
    var sr = $("snow-r"), out = $("snow-out");
    var rmin = 0.4, rmax = 35, RS = 0.4 * 1200 / 170;   // 설선
    function T(r) { return 1200 * Math.pow(r / 0.4, -1); }  // 단순화한 온도 모형
    var PL = [["수성", .39, 4], ["금성", .72, 7], ["지구", 1, 7], ["화성", 1.52, 5], ["목성", 5.2, 20], ["토성", 9.54, 17], ["천왕성", 19.2, 11], ["해왕성", 30.1, 11]];
    var PC = { "수성": "#b0a59a", "금성": "#e2c27a", "지구": "#5b8fd6", "화성": "#d0703f", "목성": "#d9b48a", "토성": "#e6cf96", "천왕성": "#9fd8e0", "해왕성": "#5f86e6" };
    var g;
    function size() { g = fit(cv, 0.46); draw(); }
    function X(r) { var L = 26, Wd = g.w - 46; return L + Math.log(r / rmin) / Math.log(rmax / rmin) * Wd; }
    function tcol(t) { // 뜨거움=빨강, 차가움=파랑
      var k = Math.max(0, Math.min(1, Math.log(t / 14) / Math.log(1200 / 14)));
      return "hsl(" + Math.round(220 - 220 * k) + ",75%," + Math.round(38 + 12 * k) + "%)";
    }
    function draw() {
      if (!g) return;
      var ctx = g.ctx, W = g.w, H = g.h, y0 = H * 0.22, sh = H * 0.24;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      // 원반 띠
      for (var x = X(rmin); x < X(rmax); x += 2) {
        var r = rmin * Math.pow(rmax / rmin, (x - X(rmin)) / (X(rmax) - X(rmin)));
        ctx.fillStyle = tcol(T(r)); ctx.fillRect(x, y0, 2.5, sh);
      }
      // 태양
      var sg = ctx.createRadialGradient(0, y0 + sh / 2, 0, 0, y0 + sh / 2, 46);
      sg.addColorStop(0, "#fff6c0"); sg.addColorStop(.6, "#ffb300"); sg.addColorStop(1, "rgba(255,150,0,0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(0, y0 + sh / 2, 46, 0, 7); ctx.fill();
      // 설선
      var xs = X(RS);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.beginPath(); ctx.moveTo(xs, y0 - 14); ctx.lineTo(xs, H - 30); ctx.stroke(); ctx.setLineDash([]); ctx.lineWidth = 1;
      tag(ctx, "얼음이 얼 수 있는 경계 (약 3 AU)", xs, y0 - 18, { align: "center", size: 12 });
      tag(ctx, "뜨거움 → 얼음은 기체로 날아감", (X(rmin) + xs) / 2 + 10, y0 + sh / 2 + 6, { align: "center", size: 12, bg: "rgba(80,0,0,.55)" });
      tag(ctx, "차가움 → 얼음도 고체로 존재", (xs + X(rmax)) / 2, y0 + sh / 2 + 6, { align: "center", size: 12, bg: "rgba(0,30,90,.55)" });
      // 행성
      var py = y0 + sh + H * 0.2;
      tag(ctx, "지구형 행성", (X(rmin) + xs) / 2, py - 34, { align: "center", size: 12, bg: "rgba(255,255,255,.12)" });
      tag(ctx, "목성형 행성", (xs + X(rmax)) / 2, py - 34, { align: "center", size: 12, bg: "rgba(255,255,255,.12)" });
      PL.forEach(function (p) {
        var x = X(p[1]);
        ctx.fillStyle = PC[p[0]]; ctx.beginPath(); ctx.arc(x, py, p[2], 0, 7); ctx.fill();
        if (p[0] === "토성") { ctx.strokeStyle = "#e6cf96"; ctx.beginPath(); ctx.ellipse(x, py, p[2] * 1.7, p[2] * 0.45, -0.3, 0, 7); ctx.stroke(); }
        ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = font(11);
        ctx.fillText(p[0], x - ctx.measureText(p[0]).width / 2, py + p[2] + 15);
      });
      // 거리 눈금
      ctx.fillStyle = "rgba(255,255,255,.45)"; ctx.font = font(11);
      [0.5, 1, 2, 5, 10, 20].forEach(function (r) { var x = X(r); ctx.fillText(r + " AU", x - 12, H - 8); });
      // 탐침
      var r0 = +sr.value, x0 = X(r0);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x0, y0 - 4); ctx.lineTo(x0, y0 + sh + 4); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(x0 - 7, y0 + sh + 14); ctx.lineTo(x0 + 7, y0 + sh + 14); ctx.lineTo(x0, y0 + sh + 5); ctx.fill();
      // 판독
      var t0 = T(r0), ice = t0 < 170;
      function row(n, solid) { return '<div class="row"><span>' + n + '</span><span class="s ' + (solid ? "solid" : "gas") + '">' + (solid ? "고체" : "기체") + "</span></div>"; }
      out.innerHTML = '<div style="font-family:var(--mono);font-size:.82rem">거리 ' + fmt(r0, 1) + " AU · 온도 약 " + Math.round(t0) + " K</div>" +
        '<div class="state">' + row("철·니켈 (금속)", true) + row("규산염 (암석)", true) + row("얼음 (물·메테인 등)", ice) + "</div>" +
        '<div class="verdict">' + (ice
          ? "금속 + 암석 + 얼음 → 재료가 많아 핵이 크게 자라고 주변 기체까지 끌어모음 → 목성형 행성 (밀도 작고 질량 큼)"
          : "금속 + 암석만 고체 → 무거운 재료로 작은 행성 → 지구형 행성 (밀도 크고 질량 작음)") + "</div>";
    }
    sr.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* =========================================================
     3. 원시 지구의 진화: 충돌 → 마그마 바다 → 핵·맨틀 분리 → 원시 지각
     ========================================================= */
  (function () {
    var cv = $("sim-diff"); if (!cv) return;
    var list = $("diff-steps"), bNext = $("diff-next"), bReset = $("diff-reset");
    var N = 150, FE = 0.3, P = [], MET = [], g, Rc, pr, cx, cy;
    var RHO_FE = 8, RHO_SI = 3.3, RHO_M = FE * RHO_FE + (1 - FE) * RHO_SI;
    var phase = 0, Temp = 600, cool = 0, spawn = 0;
    var items = list.querySelectorAll("li");

    function mix() {
      P = [];
      for (var i = 0; i < N; i++) {
        var a = Math.random() * 6.283, r = Math.sqrt(Math.random()) * 0.92;
        P.push({ x: r * Math.cos(a), y: r * Math.sin(a), vx: 0, vy: 0, fe: i < N * FE });
      }
    }
    function size() { g = fit(cv, 0.62); cx = g.w * 0.36; cy = g.h / 2; Rc = Math.min(g.w * 0.8, g.h) * 0.42; pr = Math.sqrt(0.7 / N); }
    function setPhase(p) {
      if (p === 3 && sepIndex() < 0.8) { for (var k = 0; k < 600; k++) step(0.02, 1); }
      phase = p;
      if (p >= 1 && Temp < 2000) Temp = 2000;
      items.forEach(function (li, i) { li.classList.toggle("on", i === p); li.classList.toggle("done", i < p); });
      bNext.disabled = p >= 3;
      bNext.textContent = p >= 3 ? "완료" : "다음 단계 ▶";
    }
    function reset() { mix(); Temp = 600; cool = 0; MET = []; setPhase(0); }
    items.forEach(function (li, i) { li.addEventListener("click", function () { setPhase(i); }); });
    bNext.addEventListener("click", function () { if (phase < 3) setPhase(phase + 1); });
    bReset.addEventListener("click", reset);
    size(); reset(); window.addEventListener("resize", size);

    function step(dt, mob) {
      var d2 = 2 * pr, cell = d2, grid = {};
      for (var i = 0; i < N; i++) { var p = P[i], k = Math.floor(p.x / cell) + "," + Math.floor(p.y / cell); (grid[k] || (grid[k] = [])).push(i); }
      for (var i = 0; i < N; i++) {
        var p = P[i], rho = p.fe ? RHO_FE : RHO_SI, buoy = (rho - RHO_M) / rho;
        p.vx += -p.x * buoy * 16 * dt * mob + (Math.random() - .5) * 0.2 * dt * mob;
        p.vy += -p.y * buoy * 16 * dt * mob + (Math.random() - .5) * 0.2 * dt * mob;
        var gx = Math.floor(p.x / cell), gy = Math.floor(p.y / cell);
        for (var a = -1; a <= 1; a++) for (var b = -1; b <= 1; b++) {
          var c = grid[(gx + a) + "," + (gy + b)]; if (!c) continue;
          for (var j = 0; j < c.length; j++) {
            var q = P[c[j]]; if (q === p) continue;
            var dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
            if (d > 0 && d < d2) { var f = (d2 - d) / d * 18 * dt; p.vx += dx * f; p.vy += dy * f; }
          }
        }
      }
      var damp = Math.pow(0.02, dt);
      for (var i = 0; i < N; i++) {
        var p = P[i]; p.vx *= damp; p.vy *= damp; p.x += p.vx * dt; p.y += p.vy * dt;
        var r = Math.sqrt(p.x * p.x + p.y * p.y), lim = 1 - pr;
        if (r > lim) { p.x *= lim / r; p.y *= lim / r; p.vx *= 0.3; p.vy *= 0.3; }
      }
    }
    function sepIndex() {
      var a = 0, b = 0, na = 0, nb = 0;
      P.forEach(function (p) { var r = Math.hypot(p.x, p.y); if (p.fe) { a += r; na++; } else { b += r; nb++; } });
      var ideal = (2 / 3) * (1 - Math.pow(FE, 1.5)) / (1 - FE) - (2 / 3) * Math.sqrt(FE);
      return Math.max(0, Math.min(1, (b / nb - a / na) / ideal));
    }
    function lerp(a, b, k) { return Math.round(a + (b - a) * k); }
    var last = performance.now();
    function frame(t) {
      var dt = Math.min(0.033, (t - last) / 1000); last = t;
      var ctx = g.ctx, W = g.w, H = g.h;
      // 상태 갱신
      if (phase === 0) {
        Temp = Math.min(2000, Temp + dt * 320);
        spawn -= dt;
        if (spawn <= 0) { spawn = 0.18; var a = Math.random() * 6.283; MET.push({ a: a, d: 1.9, hit: 0 }); }
      }
      if (phase === 1 || phase === 2) { step(dt, phase === 1 ? 0.5 : 1); step(dt, phase === 1 ? 0.5 : 1); step(dt, 1); }
      if (phase === 3) { cool = Math.min(1, cool + dt * 0.4); Temp = 2000 - 1300 * cool; }
      // 배경
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      var molten = Temp >= 1500 && phase < 3 || (phase === 3 && cool < 0.5);
      // 행성 바탕
      var heat = Math.max(0, Math.min(1, (Temp - 600) / 1400));
      ctx.fillStyle = "rgba(" + lerp(90, 255, heat) + "," + lerp(80, 110, heat) + "," + lerp(70, 40, heat) + ",.22)";
      ctx.beginPath(); ctx.arc(cx, cy, Rc, 0, 7); ctx.fill();
      // 입자
      P.forEach(function (p) {
        var col;
        if (p.fe) col = "#b8c0d2";
        else if (phase === 3) col = "rgb(" + lerp(255, 168, cool) + "," + lerp(138, 92, cool) + "," + lerp(61, 52, cool) + ")";
        else col = Temp >= 1500 ? "#ff8a3d" : "#9a6a4a";
        ctx.fillStyle = col;
        ctx.beginPath(); ctx.arc(cx + p.x * Rc, cy + p.y * Rc, pr * Rc * 0.9, 0, 7); ctx.fill();
        if (p.fe) { ctx.strokeStyle = "#7d869a"; ctx.lineWidth = 1; ctx.stroke(); }
      });
      // 미행성체 충돌
      MET = MET.filter(function (m) {
        if (!m.hit) {
          m.d -= dt * 2.4;
          var mx = cx + Math.cos(m.a) * m.d * Rc, my = cy + Math.sin(m.a) * m.d * Rc;
          ctx.strokeStyle = "rgba(255,220,150,.8)"; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + Math.cos(m.a) * 16, my + Math.sin(m.a) * 16); ctx.stroke();
          ctx.fillStyle = "#e8d8c0"; ctx.beginPath(); ctx.arc(mx, my, 4, 0, 7); ctx.fill();
          if (m.d <= 1) m.hit = 0.001;
          return true;
        }
        m.hit += dt;
        var hx = cx + Math.cos(m.a) * Rc, hy = cy + Math.sin(m.a) * Rc;
        ctx.fillStyle = "rgba(255,200,80," + (1 - m.hit * 3) + ")";
        ctx.beginPath(); ctx.arc(hx, hy, 6 + m.hit * 50, 0, 7); ctx.fill();
        return m.hit < 0.33;
      });
      ctx.lineWidth = 1;
      // 원시 지각과 층 이름
      var coreR = Math.sqrt(FE) * Rc * 1.02;
      if (phase === 3) {
        ctx.strokeStyle = "rgba(95,85,75," + cool + ")"; ctx.lineWidth = 7;
        ctx.beginPath(); ctx.arc(cx, cy, Rc + 3, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
        if (cool > 0.6) {
          ctx.fillStyle = "rgba(240,230,170,.35)"; ctx.beginPath(); ctx.arc(cx, cy, coreR * 0.4, 0, 7); ctx.fill();
        }
      }
      if (phase >= 2 && sepIndex() > 0.75) {
        ctx.strokeStyle = "rgba(255,255,255,.6)"; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.arc(cx, cy, coreR, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        var lx = cx + Rc + 22;
        function lead(y1, x1, txt) { ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(lx - 4, y1); ctx.stroke(); tag(ctx, txt, lx, y1 + 6, { size: 13 }); }
        if (phase === 3 && cool > 0.6) {
          lead(cy - Rc * 0.98, cx + Rc * 0.2, "원시 지각");
          lead(cy - Rc * 0.65, cx + Rc * 0.62, "맨틀 (고체)");
          lead(cy - coreR * 0.75, cx + coreR * 0.55, "외핵 (액체)");
          lead(cy, cx + coreR * 0.3, "내핵 (고체)");
        } else {
          lead(cy - Rc * 0.65, cx + Rc * 0.62, "맨틀 (규산염)");
          lead(cy, cx + coreR * 0.5, "핵 (철·니켈)");
        }
      }
      if (phase === 1) {
        tag(ctx, "철·니켈 ↓ 가라앉음", cx + Rc + 22, cy - 10, { size: 13, bg: "rgba(90,100,120,.85)" });
        tag(ctx, "규산염 ↑ 떠오름", cx + Rc + 22, cy + 22, { size: 13, bg: "rgba(170,80,20,.85)" });
      }
      // 범례
      ctx.font = font(12);
      ctx.fillStyle = "#b8c0d2"; ctx.beginPath(); ctx.arc(18, 20, 6, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("철·니켈 (무거움)", 30, 24);
      ctx.fillStyle = "#ff8a3d"; ctx.beginPath(); ctx.arc(18, 42, 6, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.fillText("규산염 (가벼움)", 30, 46);
      // 온도계
      var tx = W - 34, ty = 30, th = H - 70, k = Math.min(1, Temp / 2500);
      ctx.fillStyle = "rgba(255,255,255,.12)"; ctx.fillRect(tx, ty, 12, th);
      ctx.fillStyle = Temp >= 1500 ? "#ff6a3d" : "#e0b04a"; ctx.fillRect(tx, ty + th * (1 - k), 12, th * k);
      var ym = ty + th * (1 - 1500 / 2500);
      ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(tx - 6, ym); ctx.lineTo(tx + 18, ym); ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.font = font(11);
      ctx.fillText("녹는 온도", tx - 54, ym - 4);
      ctx.fillText("온도", tx - 2, ty - 8);
      ctx.font = font(12, true); ctx.fillText(Math.round(Temp) + " K", tx - 14, ty + th + 18);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* =========================================================
     4. 대기와 바다, 생명의 변화 (5단계)
     ========================================================= */
  (function () {
    var cv = $("sim-time"); if (!cv) return;
    var chips = $("time-chips"), desc = $("time-desc"), bar = $("time-bar"), leg = $("time-legend");
    var C = { "수증기": "#4aa3df", "이산화 탄소": "#7d7f8c", "질소": "#5b6ee1", "산소": "#22a86e", "기타": "#c49a4a" };
    var ST = [
      { n: "원시 대기", w: "약 46억~44억 년 전",
        d: "활발한 화산 활동으로 <b>수증기·이산화 탄소</b> 등이 방출되어 원시 대기가 만들어졌다. 온실 효과가 강해 지표가 매우 뜨거웠고, 바다는 아직 없다.",
        c: [["수증기", 55], ["이산화 탄소", 30], ["질소", 10], ["기타", 5]] },
      { n: "원시 바다 형성", w: "약 44억~40억 년 전",
        d: "지표가 식자 수증기가 응결해 <b>많은 비</b>가 내렸고, 낮은 곳에 고여 <b>원시 바다</b>가 되었다. 화산의 염소·황, 육지에서 녹아 온 나트륨·칼슘 등이 더해져 염분이 늘었다. 대기의 <b>이산화 탄소가 바다에 녹아</b> 줄어들기 시작했다.",
        c: [["이산화 탄소", 55], ["질소", 35], ["수증기", 5], ["기타", 5]] },
      { n: "광합성 생물 출현", w: "약 35억 년 전",
        d: "바다에 <b>광합성 생물(남세균)</b>이 나타나 산소를 만들기 시작했다. 그러나 산소는 바닷물에 녹아 있던 <b>철과 결합</b>해 산화철로 가라앉았다(호상 철광층). 그래서 대기 산소는 거의 늘지 않았다.",
        c: [["질소", 55], ["이산화 탄소", 38], ["기타", 7]] },
      { n: "대기에 산소 축적", w: "약 25억 년 전 이후",
        d: "바다의 철이 대부분 소모되고 광합성이 늘어나자, 산소가 <b>대기로 빠져나와 쌓이기</b> 시작했다. 대기 산소가 늘면서 오존이 만들어지기 시작한다.",
        c: [["질소", 75], ["이산화 탄소", 12], ["산소", 8], ["기타", 5]] },
      { n: "오존층과 육상 생물", w: "약 4억 년 전 ~ 현재",
        d: "산소가 충분히 늘어 <b>오존층</b>이 형성되었고, 오존층이 해로운 <b>자외선을 흡수</b>하자 생물이 <b>육지로 진출</b>했다. 오늘날 대기는 질소 약 78%, 산소 약 21%이다.",
        c: [["질소", 78], ["산소", 21], ["기타", 1]] }
    ];
    var s = 0, g, tt = 0, last = performance.now();
    ST.forEach(function (st, i) {
      var b = document.createElement("button"); b.className = "chip"; b.type = "button";
      b.textContent = (i + 1) + ". " + st.n;
      b.addEventListener("click", function () { s = i; ui(); });
      chips.appendChild(b);
    });
    $("time-prev").addEventListener("click", function () { s = Math.max(0, s - 1); ui(); });
    $("time-next").addEventListener("click", function () { s = Math.min(ST.length - 1, s + 1); ui(); });
    leg.innerHTML = Object.keys(C).map(function (k) { return "<span><i style='background:" + C[k] + "'></i>" + k + "</span>"; }).join("");
    function ui() {
      chips.querySelectorAll(".chip").forEach(function (c, i) { c.classList.toggle("on", i === s); });
      var st = ST[s];
      desc.innerHTML = "<b style='font-size:1rem'>" + (s + 1) + ". " + st.n + "</b> <span style='color:var(--muted);font-size:.8rem'>" + st.w + "</span><br>" + st.d;
      bar.innerHTML = st.c.map(function (x) { return "<div style='flex:0 0 " + x[1] + "%;background:" + C[x[0]] + "'>" + (x[1] >= 9 ? x[0] : "") + "</div>"; }).join("");
    }
    function size() { g = fit(cv, 0.58); }
    size(); ui(); window.addEventListener("resize", size);

    var SKY = [["#2a1410", "#a8431f"], ["#2f2a33", "#8a6553"], ["#5a3d2e", "#c88f5c"], ["#2c5c8c", "#a6cbe9"], ["#1a5aa6", "#94ccf4"]];
    var SEA = [null, "#25506a", "#2c5d58", "#1f6a9c", "#1c6fae"];
    function volcano(ctx, x, base, w, h, plume, t) {
      ctx.fillStyle = "#3b2a22"; ctx.beginPath(); ctx.moveTo(x - w, base); ctx.lineTo(x - w * 0.15, base - h); ctx.lineTo(x + w * 0.15, base - h); ctx.lineTo(x + w, base); ctx.fill();
      ctx.fillStyle = "#ff6a2a"; ctx.fillRect(x - w * 0.15, base - h - 2, w * 0.3, 4);
      for (var i = 0; i < plume; i++) {
        var k = ((t * 0.35 + i / plume) % 1);
        ctx.fillStyle = "rgba(120,110,105," + (0.7 - k * 0.6) + ")";
        ctx.beginPath(); ctx.arc(x + Math.sin(i * 2 + t) * 8 + k * 30, base - h - 10 - k * h * 1.4, 8 + k * 22, 0, 7); ctx.fill();
      }
    }
    function frame(t) {
      var dt = Math.min(0.05, (t - last) / 1000); last = t; tt += dt;
      var ctx = g.ctx, W = g.w, H = g.h, hz = H * 0.66;
      // 하늘
      var sk = ctx.createLinearGradient(0, 0, 0, hz);
      sk.addColorStop(0, SKY[s][0]); sk.addColorStop(1, SKY[s][1]);
      ctx.fillStyle = sk; ctx.fillRect(0, 0, W, hz);
      // 태양
      ctx.fillStyle = s >= 3 ? "#fff3b0" : "#ffd27a"; ctx.beginPath(); ctx.arc(W * 0.1, H * 0.13, 20, 0, 7); ctx.fill();
      // 오존층
      var oz = H * 0.2;
      if (s >= 3) {
        ctx.fillStyle = "rgba(170,140,255," + (s === 3 ? 0.18 : 0.42) + ")"; ctx.fillRect(0, oz - (s === 3 ? 4 : 9), W, s === 3 ? 8 : 18);
        tag(ctx, s === 3 ? "오존 생성 시작" : "오존층", W - 10, oz + 6, { align: "right", size: 12, bg: "rgba(80,50,160,.75)" });
      }
      // 자외선
      ctx.strokeStyle = "#c58cff"; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      var uvEnd = s === 4 ? oz : hz + 10;
      [0.2, 0.34, 0.48].forEach(function (k) {
        ctx.beginPath(); ctx.moveTo(W * 0.12 + 14, H * 0.13 + 10); ctx.lineTo(W * k + 40, uvEnd); ctx.stroke();
      });
      ctx.setLineDash([]); ctx.lineWidth = 1;
      tag(ctx, s === 4 ? "자외선이 오존층에서 흡수됨" : "자외선이 지표까지 도달", W * 0.03, s === 4 ? oz + 30 : H * 0.36, { size: 12, bg: "rgba(90,40,150,.85)" });
      // 비
      if (s === 1) {
        ctx.fillStyle = "rgba(60,60,70,.75)";
        for (var c = 0; c < 6; c++) { ctx.beginPath(); ctx.ellipse(W * (0.3 + c * 0.13), H * 0.12, 60, 20, 0, 0, 7); ctx.fill(); }
        ctx.strokeStyle = "rgba(170,200,255,.6)";
        for (var i = 0; i < 70; i++) { var rx = (i * 53.7 + tt * 40) % W, ry = (H * 0.16 + ((i * 37 + tt * 300) % (hz - H * 0.16))); ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 10); ctx.stroke(); }
        tag(ctx, "수증기 응결 → 비", W * 0.62, H * 0.3, { size: 12 });
      }
      // 지표
      if (s === 0) {
        ctx.fillStyle = "#24120d"; ctx.fillRect(0, hz, W, H - hz);
        ctx.strokeStyle = "#ff5a1f"; ctx.lineWidth = 2;
        for (var i = 0; i < 14; i++) { var x0 = (i * 97) % W; ctx.beginPath(); ctx.moveTo(x0, hz + 10 + (i * 13) % (H - hz - 20)); ctx.lineTo(x0 + 40, hz + 20 + (i * 29) % (H - hz - 20)); ctx.lineTo(x0 + 70, hz + 12 + (i * 17) % (H - hz - 20)); ctx.stroke(); }
        ctx.lineWidth = 1;
        volcano(ctx, W * 0.3, hz + 2, 70, 60, 7, tt); volcano(ctx, W * 0.72, hz + 2, 90, 80, 8, tt + 1);
        tag(ctx, "화산 가스 (수증기·이산화 탄소)", W * 0.97, H * 0.24, { align: "right", size: 12 });
        tag(ctx, "바다 없음 · 매우 뜨거움", W * 0.5, H - 14, { align: "center", size: 12 });
      } else {
        var land = W * 0.38;
        ctx.fillStyle = SEA[s]; ctx.fillRect(land, hz, W - land, H - hz);
        // 바다 밑 퇴적층
        if (s >= 2) {
          for (var j = 0; j < 5; j++) { ctx.fillStyle = j % 2 ? "#5a5a62" : "#9c3a2a"; ctx.fillRect(land, H - 6 - j * 5, W - land, 5); }
          tag(ctx, "산화철 침전 → 호상 철광층", W * 0.98, H - 32, { align: "right", size: 12, bg: "rgba(120,30,20,.85)" });
        }
        ctx.fillStyle = s === 4 ? "#4f7d3a" : "#5a4636";
        ctx.beginPath(); ctx.moveTo(0, hz - 8); ctx.lineTo(land - 30, hz - 4); ctx.lineTo(land + 20, H); ctx.lineTo(0, H); ctx.fill();
        volcano(ctx, land * 0.45, hz - 6, 48, 40, s <= 2 ? 5 : 3, tt);
        // 스트로마톨라이트
        if (s >= 2) {
          ctx.fillStyle = "#8b7a5a";
          for (var m = 0; m < 6; m++) { var mx = land + 50 + m * 34; ctx.beginPath(); ctx.ellipse(mx, H - 30, 14, 12, 0, Math.PI, 0); ctx.fill(); }
          tag(ctx, "광합성 생물(남세균) 군집", land + 40, H - 50, { size: 12, bg: "rgba(40,80,40,.85)" });
          // 산소 방울
          for (var b = 0; b < 12; b++) {
            var k = (tt * 0.25 + b / 12) % 1, bx = land + 60 + (b * 31) % (W - land - 100);
            var top = s === 2 ? 0.55 : 1.15, by = H - 40 - k * (H - hz) * top;
            if (s === 2 && k > 0.5) { ctx.fillStyle = "rgba(200,70,40,.9)"; ctx.fillRect(bx, H - 40 - (1 - k) * (H - hz) * 0.5, 3, 3); continue; }
            ctx.strokeStyle = "rgba(200,255,220,.9)"; ctx.beginPath(); ctx.arc(bx, by, 3, 0, 7); ctx.stroke();
          }
          if (s === 2) tag(ctx, "산소 + 바닷물 속 철 → 산화철", W * 0.98, hz + 26, { align: "right", size: 12, bg: "rgba(120,30,20,.85)" });
          if (s >= 3) tag(ctx, "산소가 대기로 빠져나감", W * 0.98, hz - 12, { align: "right", size: 12, bg: "rgba(20,110,70,.85)" });
        }
        if (s === 1) tag(ctx, "원시 바다 · CO₂가 녹아듦", W * 0.98, hz + 26, { align: "right", size: 12 });
        // 육상 식물
        if (s === 4) {
          for (var p = 0; p < 9; p++) {
            var px = 20 + p * (land - 60) / 8, py = hz - 6 + p * 0.5;
            ctx.strokeStyle = "#2d5a22"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py - 18); ctx.stroke();
            ctx.fillStyle = "#3f8f3a"; ctx.beginPath(); ctx.arc(px, py - 22, 9, 0, 7); ctx.fill();
          }
          ctx.lineWidth = 1;
          tag(ctx, "육상 생물 등장", 14, hz - 40, { size: 12, bg: "rgba(30,90,30,.85)" });
        }
      }
      tag(ctx, (s + 1) + ". " + ST[s].n + " · " + ST[s].w, W - 10, 26, { align: "right", size: 13, bg: "rgba(0,0,0,.65)" });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();

  /* =========================================================
     5. 행성의 질량과 대기 (붙잡을 수 있는 기체)
     ========================================================= */
  (function () {
    var box = $("sim-esc"); if (!box) return;
    var sel = $("esc-planet"), sT = $("esc-t"), out = $("esc-out"), bars = $("esc-bars");
    var k = 1.380649e-23, u = 1.6605e-27;
    var PLAN = {
      mercury: { n: "수성", v: 4.25, T: 600 }, venus: { n: "금성", v: 10.36, T: 300 },
      earth: { n: "지구", v: 11.19, T: 1000 }, mars: { n: "화성", v: 5.03, T: 250 },
      moon: { n: "달", v: 2.38, T: 380 }
    };
    var GAS = [["수소 H₂", 2], ["헬륨 He", 4], ["수증기 H₂O", 18], ["질소 N₂", 28], ["산소 O₂", 32], ["이산화 탄소 CO₂", 44]];
    function draw() {
      var p = PLAN[sel.value], T = +sT.value, html = "", maxR = 40;
      $("esc-tv").textContent = T + " K";
      GAS.forEach(function (gs) {
        var vr = Math.sqrt(3 * k * T / (gs[1] * u)) / 1000, ratio = p.v / vr, keep = ratio >= 6;
        var w = Math.min(100, ratio / maxR * 100);
        html += '<div style="display:grid;grid-template-columns:118px 1fr 70px;align-items:center;gap:8px;margin:7px 0">' +
          "<b style='font-size:.85rem'>" + gs[0] + "</b>" +
          '<div style="position:relative;height:20px;background:var(--surface-2);border-radius:6px;overflow:hidden">' +
          '<div style="position:absolute;inset:0 auto 0 0;width:' + w + "%;background:" + (keep ? "var(--ok)" : "var(--bad)") + ';opacity:.85"></div>' +
          '<div style="position:absolute;top:0;bottom:0;left:' + (6 / maxR * 100) + '%;border-left:2px dashed var(--text)"></div></div>' +
          '<span style="font-weight:800;font-size:.82rem;color:' + (keep ? "var(--ok)" : "var(--bad)") + '">' + (keep ? "붙잡음" : "빠져나감") + "</span></div>";
      });
      bars.innerHTML = html + '<div style="font-size:.76rem;color:var(--muted);margin-top:6px">막대 길이 = 행성이 기체를 붙잡는 힘(탈출 속도)이 기체 분자의 속력보다 얼마나 큰지. 점선을 넘으면 오랫동안 붙잡을 수 있다.</div>';
      out.innerHTML = "<b>" + p.n + "</b> · 탈출 속도 " + p.v + " km/s<br>질량이 클수록 탈출 속도가 크다.<br>가벼운 기체일수록, 온도가 높을수록 분자가 빠르다.";
    }
    sel.addEventListener("change", function () { sT.value = PLAN[sel.value].T; draw(); });
    sT.addEventListener("input", draw);
    draw();
  })();
})();
