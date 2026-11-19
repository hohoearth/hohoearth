/* I-2 생명체와 지구시스템의 상호작용 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 지구 대기 조성의 변화 (그래프 해석) ---------- */
  (function () {
    var cv = $("sim-air"); if (!cv) return;
    var st = $("air-t"), out = $("air-out"), g;
    function pw(pts, t) { // 로그 분압 구간 선형 보간
      for (var i = 1; i < pts.length; i++) if (t <= pts[i][0]) { var a = pts[i - 1], b = pts[i]; return a[1] + (b[1] - a[1]) * (t - a[0]) / (b[0] - a[0]); }
      return pts[pts.length - 1][1];
    }
    var GAS = [
      { n: "질소", c: "#6c7ee1", p: [[0, -0.1], [46, -0.1]] },
      { n: "이산화 탄소", c: "#c9c9d6", p: [[0, 0.7], [3, 0.6], [8, -0.6], [15, -1.2], [30, -1.8], [40, -2.4], [46, -3.4]] },
      { n: "산소", c: "#2fc27e", p: [[0, -4.5], [21.5, -4.5], [23.5, -2.2], [37, -1.9], [41.5, -0.68], [46, -0.68]] }
    ];
    function size() { g = S.fit(cv, 0.5); draw(); }
    function draw() {
      if (!g) return;
      var ctx = g.ctx, W = g.w, H = g.h, L = 60, R = 20, T = 20, B = 42, Wd = W - L - R, Hd = H - T - B;
      function X(t) { return L + t / 46 * Wd; }
      function Y(lp) { return T + (1 - (lp + 4) / 5) * Hd; }
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.font = S.font(12); ctx.strokeStyle = "rgba(255,255,255,.08)"; ctx.fillStyle = "rgba(255,255,255,.6)";
      [-4, -3, -2, -1, 0, 1].forEach(function (e) {
        var y = Y(e); ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(L + Wd, y); ctx.stroke();
        ctx.fillText(e === 0 ? "1" : e === 1 ? "10" : "0." + "000".slice(0, -e - 1) + "1", 6, y + 4);
      });
      for (var t = 0; t <= 45; t += 5) { var x = X(t); ctx.beginPath(); ctx.moveTo(x, T); ctx.lineTo(x, T + Hd); ctx.stroke(); ctx.fillText(t, x - 6, H - 24); }
      ctx.fillText("지구 형성으로부터의 시간 (억 년)", L + Wd / 2 - 90, H - 6);
      ctx.save(); ctx.translate(14, T + Hd / 2 + 40); ctx.rotate(-Math.PI / 2); ctx.fillText("기체의 분압 (기압)", 0, 0); ctx.restore();
      // 원시 바다·광합성 표시
      S.tag(ctx, "원시 바다 형성", X(3), T + 18, { size: 11, bg: "rgba(40,90,140,.8)" });
      S.tag(ctx, "광합성 생물 출현", X(11), T + 40, { size: 11, bg: "rgba(30,110,60,.8)" });
      ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.setLineDash([3, 4]);
      [3, 11].forEach(function (t) { ctx.beginPath(); ctx.moveTo(X(t), T + 20); ctx.lineTo(X(t), T + Hd); ctx.stroke(); });
      ctx.setLineDash([]);
      GAS.forEach(function (gs) {
        ctx.strokeStyle = gs.c; ctx.lineWidth = 3; ctx.beginPath();
        for (var i = 0; i <= 200; i++) { var tt = i * 46 / 200, x = X(tt), y = Y(Math.max(-4, pw(gs.p, tt))); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.lineWidth = 1;
        var le = gs.p[gs.p.length - 1]; S.tag(ctx, gs.n, X(44.5), Y(Math.max(-4, le[1])) - 8, { align: "right", size: 12, bg: gs.c, color: "#111" });
      });
      var t0 = +st.value, x0 = X(t0);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, T); ctx.lineTo(x0, T + Hd); ctx.stroke(); ctx.lineWidth = 1;
      var rows = GAS.map(function (gs) {
        var lp = pw(gs.p, t0), v = Math.pow(10, lp);
        ctx.fillStyle = gs.c; ctx.beginPath(); ctx.arc(x0, Y(Math.max(-4, lp)), 5, 0, 7); ctx.fill();
        return "<b>" + gs.n + "</b> " + (lp < -4 ? "거의 없음" : (v >= 0.1 ? v.toFixed(2) : v.toPrecision(1)) + " 기압");
      });
      var ago = (46 - t0).toFixed(0);
      var era = t0 < 3 ? "원시 대기: 이산화 탄소가 수 기압에 이른다." : t0 < 11 ? "원시 바다에 이산화 탄소가 녹아 급격히 감소한다." : t0 < 21.5 ? "광합성으로 생긴 산소가 바닷물 속 철과 결합해 대기에는 쌓이지 않는다." : t0 < 24 ? "대기에 산소가 쌓이기 시작한다." : "질소는 거의 일정, 산소는 증가, 이산화 탄소는 계속 감소.";
      out.innerHTML = "<b>지구 형성 후 " + t0 + "억 년</b> (약 " + ago + "억 년 전)<br>" + rows.join("<br>") + "<br><br>" + era;
    }
    st.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 2. 산소의 순환: 호상철광층의 형성 ---------- */
  (function () {
    var cv = $("sim-bif"); if (!cv) return;
    var sr = $("bif-rate"), bp = $("bif-play"), br = $("bif-reset"), out = $("bif-out"), g;
    var FE0 = 100, fe, sea, air, layers, time, run, chertT, ions, bubbles;
    function reset() {
      fe = FE0; sea = 0; air = 0; layers = []; time = 0; run = false; chertT = 0; bubbles = [];
      ions = []; for (var i = 0; i < 90; i++) ions.push({ x: Math.random(), y: 0.25 + Math.random() * 0.6 });
      bp.textContent = "▶ 시작";
    }
    function size() { g = S.fit(cv, 0.5); }
    bp.addEventListener("click", function () { run = !run; bp.textContent = run ? "❚❚ 멈춤" : "▶ 계속"; });
    br.addEventListener("click", reset);
    reset(); size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      var rate = +sr.value;
      if (run) {
        time += dt;
        var o2 = rate * dt * 2.2;
        if (fe > 0) {
          var use = Math.min(fe, o2); fe -= use;
          var top = layers.length ? layers[layers.length - 1] : null;
          if (!top || top.k !== "fe") layers.push(top = { k: "fe", h: 0 }); top.h += use * 0.06;
          chertT += dt;
          if (chertT > 1.1) { chertT = 0; layers.push({ k: "si", h: 1.6 }); }
          if (Math.random() < rate * dt * 3) bubbles.push({ x: 0.1 + Math.random() * 0.8, y: 0.12, die: 0.25 + Math.random() * 0.4 });
        } else {
          sea = Math.min(30, sea + o2 * 0.3); air = Math.min(100, air + o2 * 0.7);
          if (Math.random() < rate * dt * 4) bubbles.push({ x: 0.1 + Math.random() * 0.8, y: 0.12, die: -0.2 });
        }
      }
      var ctx = g.ctx, W = g.w, H = g.h, ox = 0, ow = W * 0.66, sy = H * 0.18, fy = H - 46;
      // 하늘
      var air01 = air / 100;
      ctx.fillStyle = "rgb(" + Math.round(S.lerp(150, 120, air01)) + "," + Math.round(S.lerp(120, 170, air01)) + "," + Math.round(S.lerp(100, 225, air01)) + ")";
      ctx.fillRect(0, 0, W, sy);
      // 바다
      var feK = fe / FE0;
      ctx.fillStyle = "rgb(" + Math.round(S.lerp(30, 70, feK)) + "," + Math.round(S.lerp(90, 85, feK)) + "," + Math.round(S.lerp(140, 70, feK)) + ")";
      ctx.fillRect(ox, sy, ow, fy - sy);
      // 철 이온
      var nIon = Math.round(ions.length * feK);
      ctx.fillStyle = "#ffb26b";
      for (var i = 0; i < nIon; i++) { var p = ions[i]; ctx.beginPath(); ctx.arc(ox + p.x * ow, sy + p.y * (fy - sy), 2.6, 0, 7); ctx.fill(); }
      // 남세균
      ctx.fillStyle = "#43c46b";
      for (var c = 0; c < 18; c++) { ctx.beginPath(); ctx.arc(ox + (c + 0.5) / 18 * ow, sy + 8 + (c % 3) * 4, 4, 0, 7); ctx.fill(); }
      // 산소 방울
      bubbles = bubbles.filter(function (b) {
        if (run) b.y += (b.die > 0 ? 0.25 : -0.25) * dt;
        var by = b.die > 0 ? sy + b.y * (fy - sy) : sy + 0.12 * (fy - sy) - (0.12 - b.y) * 600;
        ctx.strokeStyle = "rgba(220,255,235,.95)"; ctx.beginPath(); ctx.arc(ox + b.x * ow, by, 3.4, 0, 7); ctx.stroke();
        if (b.die > 0 && b.y > b.die) { ctx.fillStyle = "#b8442c"; ctx.fillRect(ox + b.x * ow - 2, by, 4, 4); return false; }
        return b.die > 0 ? true : by > 0;
      });
      // 퇴적층
      ctx.fillStyle = "#3b3530"; ctx.fillRect(ox, fy, ow, H - fy);
      var y = H; layers.forEach(function (l) { var h = l.h; y -= h; ctx.fillStyle = l.k === "fe" ? "#a8392a" : "#8f8f99"; ctx.fillRect(ox, y, ow, h); });
      S.tag(ctx, "남세균 (광합성 → 산소 방출)", ox + 8, sy + 34, { size: 12, bg: "rgba(20,90,40,.85)" });
      if (fe > 0) S.tag(ctx, "산소 + 바닷물 속 철 → 철 산화 광물 침전", ox + 8, sy + 62, { size: 12, bg: "rgba(130,40,20,.85)" });
      else S.tag(ctx, "철이 거의 사라짐 → 산소가 바다·대기에 쌓임", ox + 8, sy + 62, { size: 12, bg: "rgba(20,110,70,.85)" });
      S.tag(ctx, "해저: 호상철광층 (붉은 층 = 철 산화 광물, 회색 층 = 규질)", ox + 8, H - 6, { size: 11 });
      // 게이지
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(ow, 0, W - ow, H);
      var gx = ow + (W - ow) * 0.18, gw = (W - ow) * 0.18;
      S.gauge(ctx, gx, 34, gw, H - 90, feK, "#ffb26b", "바닷물 속 철", Math.round(feK * 100) + "%");
      S.gauge(ctx, gx + gw * 2.2, 34, gw, H - 90, air01, "#2fc27e", "대기 산소", Math.round(air01 * 100) + "%");
      var ago = Math.max(0, 35 - time * 0.55);
      out.innerHTML = "<b>시뮬레이션 시간</b> 약 " + ago.toFixed(0) + "억 년 전 (개략)<br>" +
        (fe > 0 ? "바닷물 속 철이 산소를 붙잡아 <b>대기 산소는 늘지 않는다</b>." : "철이 소진된 뒤 <b>대기 산소가 증가</b>한다.");
    });
  })();

  /* ---------- 3. 탄소의 순환과 얼음덩어리 지구 ---------- */
  (function () {
    var cv = $("sim-ball"); if (!cv) return;
    var g, tgt = 0, ice = 0.3, co2 = 0.3, temp = 10, alb = 0.35, carb = 0, glac = 0, t0 = 0;
    var TG = [ // 얼음 덮인 정도, CO2, 기온(°C), 반사율
      { ice: 0.45, co2: 0.25, temp: 2, alb: 0.45 },
      { ice: 1.0, co2: 0.2, temp: -45, alb: 0.8 },
      { ice: 1.0, co2: 0.95, temp: -30, alb: 0.8 },
      { ice: 0.3, co2: 1.0, temp: 40, alb: 0.32 },
      { ice: 0.15, co2: 0.35, temp: 18, alb: 0.3 }
    ];
    S.stepper("ball-steps", "ball-next", "ball-reset", function (k, isReset) {
      tgt = k; t0 = 0;
      if (isReset || k === 0) { ice = 0.3; co2 = 0.3; temp = 10; alb = 0.35; carb = 0; glac = 0; }
    });
    function size() { g = S.fit(cv, 0.52); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt, now) {
      var T = TG[tgt]; t0 += dt;
      var rate = tgt === 2 ? 0.35 : 1.4;
      ice = S.approach(ice, T.ice, rate, dt); co2 = S.approach(co2, T.co2, tgt === 2 ? 0.35 : 1.2, dt);
      temp = S.approach(temp, T.temp, 1.0, dt); alb = S.approach(alb, T.alb, 1.4, dt);
      if (tgt >= 1) glac = S.approach(glac, 1, 1.5, dt);
      if (tgt >= 4) carb = S.approach(carb, 1, 0.9, dt); else carb = S.approach(carb, 0, 3, dt);
      var ctx = g.ctx, W = g.w, H = g.h;
      ctx.fillStyle = "#070a14"; ctx.fillRect(0, 0, W, H);
      // 지구
      var R = Math.min(W * 0.26, H * 0.4), cx = W * 0.28, cy = H * 0.46;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      ctx.fillStyle = "#1f5f9e"; ctx.fillRect(cx - R, cy - R, 2 * R, 2 * R);
      ctx.fillStyle = "#6b7d4a";
      ctx.beginPath(); ctx.ellipse(cx - R * 0.35, cy - R * 0.1, R * 0.28, R * 0.42, 0.3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx + R * 0.38, cy + R * 0.2, R * 0.22, R * 0.3, -0.2, 0, 7); ctx.fill();
      // 얼음 (극에서 적도 쪽으로)
      var reach = ice * R;
      ctx.fillStyle = "rgba(235,245,255,.95)";
      ctx.fillRect(cx - R, cy - R, 2 * R, reach); ctx.fillRect(cx - R, cy + R - reach, 2 * R, reach);
      ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.3)"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke();
      // 화산과 CO2
      var vx = cx + R * 0.05, vy = cy - R * 0.02;
      ctx.fillStyle = "#4a3426"; ctx.beginPath(); ctx.moveTo(vx - 16, vy + 10); ctx.lineTo(vx, vy - 12); ctx.lineTo(vx + 16, vy + 10); ctx.fill();
      ctx.fillStyle = "#ff6a2a"; ctx.fillRect(vx - 3, vy - 14, 6, 3);
      for (var i = 0; i < 6; i++) { var k = ((now * 0.5 + i / 6) % 1); ctx.fillStyle = "rgba(170,170,180," + (0.7 - k * 0.7) + ")"; ctx.beginPath(); ctx.arc(vx + k * 20, vy - 18 - k * 40, 4 + k * 8, 0, 7); ctx.fill(); }
      S.tag(ctx, "화산: CO₂ 방출은 계속됨", vx + 22, vy - 30, { size: 11 });
      // 햇빛 반사 화살표
      var refl = alb;
      S.arrow(ctx, W * 0.03, 18, cx - R * 0.5, cy - R * 0.75, "#ffd34d", 3);
      S.arrow(ctx, cx - R * 0.5, cy - R * 0.75, cx - R * 1.0, cy - R * 1.05 - 20 * refl, "rgba(255,211,77," + (0.25 + refl * 0.75) + ")", 1 + refl * 5);
      S.tag(ctx, "햇빛 반사율 " + Math.round(alb * 100) + "%", W * 0.01, cy - R - 10 > 30 ? cy - R - 10 : 40, { size: 11, bg: "rgba(120,90,0,.8)" });
      // 기권-수권 탄소 교환
      if (ice > 0.95) S.tag(ctx, "바다가 얼음에 덮여 CO₂가 바다에 녹지 못함", cx, cy + R + 22, { align: "center", size: 12, bg: "rgba(60,60,120,.85)" });
      else if (tgt >= 4) S.tag(ctx, "CO₂가 바다에 녹아 탄산염으로 침전", cx, cy + R + 22, { align: "center", size: 12, bg: "rgba(20,110,70,.85)" });
      // 게이지
      var gx = W * 0.6, gw = W * 0.05, gh = H * 0.55, gy = 40;
      S.gauge(ctx, gx, gy, gw, gh, co2, "#c9c9d6", "CO₂", co2 > 0.8 ? "매우 높음" : co2 > 0.5 ? "높음" : "낮음");
      S.gauge(ctx, gx + gw * 2, gy, gw, gh, 0.15 + co2 * 0.85, "#ff8a3d", "온실 효과", "");
      S.gauge(ctx, gx + gw * 4, gy, gw, gh, (temp + 50) / 100, temp < 0 ? "#7cc7ff" : "#ff5a3d", "평균 기온", Math.round(temp) + " °C");
      // 지층 기둥
      var lx = gx + gw * 5.6, lw = W - lx - 14, base = gy + gh;
      ctx.fillStyle = "#5a4a3a"; ctx.fillRect(lx, base - 20, lw, 20);
      ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = S.font(11, true); ctx.fillText("지층", lx, gy - 6);
      if (glac > 0.02) { ctx.fillStyle = "#8a8070"; ctx.fillRect(lx, base - 20 - 50 * glac, lw, 50 * glac); for (var d = 0; d < 10 * glac; d++) { ctx.fillStyle = "#c8bfae"; ctx.beginPath(); ctx.arc(lx + 6 + (d * 23) % (lw - 12), base - 26 - (d * 13) % (44 * glac + 1), 3, 0, 7); ctx.fill(); } }
      if (carb > 0.02) { ctx.fillStyle = "#e8e2cf"; ctx.fillRect(lx, base - 70 - 50 * carb, lw, 50 * carb); }
      ctx.font = S.font(11); ctx.fillStyle = "#fff";
      if (glac > 0.5) ctx.fillText("빙하 퇴적층", lx + 2, base - 42);
      if (carb > 0.5) { ctx.fillStyle = "#333"; ctx.fillText("석회암층", lx + 2, base - 92); }
    });
  })();

  /* ---------- 4. 물의 순환과 지형 (그림을 눌러 알아보기) ---------- */
  (function () {
    var box = $("land-map"); if (!box) return;
    var info = $("land-info");
    var D = {
      v: { n: "V자곡", a: "하천수", d: "강의 상류는 경사가 급해 하천수가 바닥을 깊게 깎는다(침식). 그래서 폭이 좁은 V자 모양의 골짜기가 생긴다." },
      u: { n: "U자곡", a: "빙하", img: "u-valley.jpg", cr: "Brian Gratwicke, CC BY 2.0", d: "골짜기를 따라 빙하가 중력에 의해 천천히 내려오며 바닥과 양옆을 함께 깎아 U자 모양의 골짜기를 만든다." },
      m: { n: "곡류", a: "하천수", img: "meander.jpg", cr: "Luke Jones, CC BY 2.0", d: "중·하류에서 물이 굽이쳐 흐를 때, 바깥쪽은 유속이 빨라 깎이고(침식) 안쪽은 유속이 느려 쌓인다(퇴적). 굴곡이 점점 심해진다." },
      d: { n: "삼각주", a: "하천수", img: "delta.jpg", cr: "Landsat (NASA/USGS), 퍼블릭 도메인", d: "강물이 바다로 들어가는 하구에서 유속이 갑자기 느려져, 운반해 온 모래와 흙이 쌓여 넓고 편평한 땅이 된다." },
      c: { n: "석회 동굴", a: "지하수", img: "cave.jpg", cr: "AsPJT, CC0", d: "석회암 지대에서 땅속으로 스며든 물이 석회암을 녹여(용해) 오랜 시간에 걸쳐 동굴을 만든다. 녹았던 성분이 다시 쌓여 종유석·석순이 생긴다." },
      s: { n: "해식 절벽·해식 기둥", a: "해수", img: "sea-stack.jpg", cr: "Thomas Fuhrmann, CC BY-SA 4.0", d: "파도가 해안 암석을 깎아 절벽을 만들고, 약한 부분이 파여 해식 동굴이 생긴다. 더 깎이면 단단한 부분만 기둥처럼 남는다." },
      b: { n: "해빈", a: "해수", d: "파도와 연안류가 운반한 모래·자갈이 해안을 따라 쌓여 모래사장(해빈)이 만들어진다." }
    };
    function showK(k) {
      var x = D[k];
      box.querySelectorAll("[data-k]").forEach(function (el) { el.classList.toggle("sel", el.dataset.k === k); });
      info.innerHTML = "<div style='font-size:1.05rem;font-weight:800'>" + x.n + " <span class='pill' style='font-size:.7rem;padding:2px 10px;vertical-align:middle'>" + x.a + "</span></div>" +
        "<p style='margin:8px 0'>" + x.d + "</p>" +
        (x.img ? "<img src='../assets/img/1-2/" + x.img + "' alt='" + x.n + "' style='width:100%;border-radius:10px;max-height:200px;object-fit:cover'><div class='credit' style='font-size:.7rem;color:var(--muted);margin-top:2px'>" + x.cr + "</div>" : "");
    }
    box.querySelectorAll("[data-k]").forEach(function (el) {
      el.style.cursor = "pointer";
      el.addEventListener("click", function () { showK(el.dataset.k); });
    });
    showK("m");
  })();
})();
