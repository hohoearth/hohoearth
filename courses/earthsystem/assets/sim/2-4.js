/* II-4 해일 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 폭풍 해일: 해수면을 높이는 요인 합치기 ---------- */
  (function () {
    var cv = $("sim-surge"); if (!cv) return;
    var sP = $("sg-p"), cDanger = $("sg-danger"), cHigh = $("sg-high"), out = $("sg-out"), g;
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt, now) {
      var dp = +sP.value; $("sg-pv").textContent = dp + " hPa";
      var press = dp * 0.01, wind = cDanger.checked ? 0.035 * dp : 0.012 * dp, tide = cHigh.checked ? 3.0 : 0.0;
      var total = press + wind + tide, wall = 4.0; // m
      var ctx = g.ctx, W = g.w, H = g.h, base = H - 30, sc = (H - 70) / 7, x1 = W * 0.62;
      ctx.fillStyle = "#64748b"; ctx.fillRect(0, 0, W, H);
      var sky = ctx.createLinearGradient(0, 0, 0, base); sky.addColorStop(0, "#334155"); sky.addColorStop(1, "#94a3b8"); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, base);
      // 해안 단면
      ctx.fillStyle = "#8a7a5a"; ctx.beginPath(); ctx.moveTo(x1, base); ctx.lineTo(x1, base - 1.5 * sc); ctx.lineTo(W, base - 1.8 * sc); ctx.lineTo(W, H); ctx.lineTo(x1, H); ctx.fill();
      ctx.fillStyle = "#d1d5db"; ctx.fillRect(x1 - 10, base - wall * sc, 14, wall * sc);
      S.tag(ctx, "방파제 4 m", x1 - 12, base - wall * sc - 6, { align: "right", size: 11, bg: "rgba(0,0,0,.6)" });
      // 해수면
      var lvl = base - total * sc, wav = Math.sin(now * 3) * 0.12 * sc;
      ctx.fillStyle = "rgba(37,99,235,.9)"; ctx.fillRect(0, lvl + wav, x1 - 10, base - lvl - wav + 30);
      if (total > wall) { ctx.fillStyle = "rgba(37,99,235,.75)"; ctx.fillRect(x1 + 4, base - 1.6 * sc - (total - wall) * sc * 0.6, W - x1, (total - wall) * sc * 0.6 + 4); S.tag(ctx, "바닷물이 육지로 넘침!", W - 10, base - 2.6 * sc, { align: "right", size: 13, bg: "#b91c1c" }); }
      // 쌓기 막대
      var bx = 30, bw = 44, y = base;
      [[tide, "#38bdf8", "만조"], [press, "#a78bfa", "기압 하강"], [wind, "#f97316", "바람"]].forEach(function (b) {
        if (b[0] <= 0) return; ctx.fillStyle = b[1]; ctx.fillRect(bx, y - b[0] * sc, bw, b[0] * sc); ctx.fillStyle = "#111"; ctx.font = S.font(11, true); ctx.fillText(b[2], bx + bw + 6, y - b[0] * sc / 2 + 4); y -= b[0] * sc;
      });
      ctx.strokeStyle = "#fff"; ctx.strokeRect(bx, y, bw, base - y);
      S.tag(ctx, "평상시 해수면 기준", bx, base + 18, { size: 11, bg: "rgba(0,0,0,.5)" });
      out.innerHTML = "<b>기압 하강 효과</b> " + dp + " hPa × 1 cm = " + (press * 100).toFixed(0) + " cm" +
        "<br><b>바람 효과</b> 약 " + wind.toFixed(1) + " m " + (cDanger.checked ? "(위험 반원: 바다 → 육지 방향 바람)" : "") +
        "<br><b>조석</b> " + (cHigh.checked ? "만조 +3.0 m" : "간조 기준 0 m") +
        "<br><b>합계</b> 약 " + total.toFixed(1) + " m → " + (total > wall ? "<b style='color:var(--bad)'>방파제를 넘음</b>" : "방파제 안쪽은 안전") +
        "<br><span style='font-size:.75rem;color:var(--muted)'>바람·조석 값은 개념을 보여 주기 위한 예시값</span>";
    });
  })();

  /* ---------- 2. 지진 해일의 전파 ---------- */
  (function () {
    var cv = $("sim-tsu"); if (!cv) return;
    var bGo = $("ts-go"), out = $("ts-out"), g, x = -1, t = 0, quakeT = 0;
    var LEN = 1000; // km
    function depth(xk) { return xk < 750 ? 4000 : Math.max(10, 4000 - (xk - 750) * 16); } // m
    function size() { g = S.fit(cv, 0.45); }
    size(); window.addEventListener("resize", size);
    bGo.addEventListener("click", function () { x = 0; t = 0; quakeT = 0; });
    S.loop(function (dt, now) {
      if (x >= 0 && x < LEN) { var c = Math.sqrt(10 * depth(x)); x += c * dt * 2.4 / 1000 * 60; t += dt * 2.4 * 60 / 60; quakeT += dt; }
      var ctx = g.ctx, W = g.w, H = g.h, sea = H * 0.35, sc = (H - sea - 10) / 4200, PX = W / LEN;
      ctx.fillStyle = "#e0f2fe"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#1d4ed8"; ctx.beginPath(); ctx.moveTo(0, H);
      for (var xx = 0; xx <= LEN; xx += 2) {
        var d = depth(xx), amp = 0;
        if (x >= 0) { var Lw = 160 * Math.sqrt(d / 4000) + 4, A = 6 * Math.pow(4000 / d, 0.25); var u = (xx - x) / Lw; if (u > -1 && u < 0.2) amp = A * Math.exp(-u * u * 6); }
        ctx.lineTo(xx * PX, sea - amp * 2.2);
      }
      ctx.lineTo(W, H); ctx.fill();
      ctx.fillStyle = "#a16207"; ctx.beginPath(); ctx.moveTo(0, H); for (xx = 0; xx <= LEN; xx += 5) ctx.lineTo(xx * PX, sea + depth(xx) * sc); ctx.lineTo(W, sea - 6); ctx.lineTo(W, H); ctx.fill();
      ctx.fillStyle = "#4d7c0f"; ctx.fillRect(W - 20, sea - 30, 20, 30);
      ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.arc(30, sea + 4000 * sc - 8, 7, 0, 7); ctx.fill();
      S.tag(ctx, "진앙 (해저 지진)", 40, sea + 4000 * sc - 14, { size: 11, bg: "#b91c1c" });
      if (x >= 0 && x < LEN) {
        var dd = depth(x), cc = Math.sqrt(10 * dd);
        S.tag(ctx, "수심 " + Math.round(dd) + " m · 속도 " + Math.round(cc) + " m/s (" + Math.round(cc * 3.6) + " km/h)", Math.min(W - 10, x * PX + 10), sea - 40, { align: x * PX > W * 0.6 ? "right" : "left", size: 12 });
      }
      S.tag(ctx, "대양 (수심 약 4 km)", 10, 22, { size: 11, bg: "rgba(29,78,216,.85)" });
      S.tag(ctx, "해안 쪽: 얕아짐", W - 10, 22, { align: "right", size: 11, bg: "rgba(161,98,7,.9)" });
      var reach = x >= LEN;
      out.innerHTML = "<b>지진 해일</b>은 파장이 100~200 km로 길어 대양에서도 <b>천해파</b>이다.<br>속도 = √(gh)<br>수심 4000 m → √(10×4000) = <b>200 m/s</b> (약 720 km/h)<br>" +
        (x < 0 ? "▶ 버튼을 눌러 지진 해일을 일으키자." : reach ? "해안 도착! 얕은 곳에서 느려지며 파고가 크게 높아졌다." : "얕아질수록 느려지고, 파장이 짧아지며, 파고가 높아진다.");
    });
  })();
})();
