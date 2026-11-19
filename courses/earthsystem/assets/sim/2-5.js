/* II-5 조석 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 기조력 = 달의 인력 + 원심력 ---------- */
  (function () {
    var cv = $("sim-tf"); if (!cv) return;
    var cG = $("tf-g"), cC = $("tf-c"), cT = $("tf-t"), out = $("tf-out"), g;
    function size() { g = S.fit(cv, 0.5); draw(); }
    function draw() {
      if (!g) return;
      var ctx = g.ctx, W = g.w, H = g.h, R = Math.min(W * 0.17, H * 0.32), cx = W * 0.3, cy = H / 2, D = 4.2, mx = cx + D * R;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      // 부푼 바다(과장)
      if (cT.checked) { ctx.fillStyle = "rgba(56,189,248,.35)"; ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.28, R * 1.04, 0, 0, 7); ctx.fill(); }
      ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.fillStyle = "#4d7c0f"; ctx.beginPath(); ctx.ellipse(cx - R * 0.2, cy - R * 0.25, R * 0.3, R * 0.2, 0.4, 0, 7); ctx.fill();
      ctx.fillStyle = "#cbd5e1"; ctx.beginPath(); ctx.arc(Math.min(W - 24, mx), cy, R * 0.27, 0, 7); ctx.fill();
      S.tag(ctx, "달", Math.min(W - 24, mx), cy - R * 0.27 - 8, { align: "center", size: 12 });
      // 공통 질량 중심
      ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(cx + R * 0.73, cy, 4, 0, 7); ctx.fill();
      S.tag(ctx, "공통 질량 중심", cx + R * 0.73, cy + R + 30, { align: "center", size: 11, bg: "rgba(120,90,0,.85)" });
      ctx.strokeStyle = "rgba(250,204,21,.6)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(cx + R * 0.73, cy + 4); ctx.lineTo(cx + R * 0.73, cy + R + 16); ctx.stroke(); ctx.setLineDash([]);
      var g0 = 1 / (D * D), K = R * 1.6 / g0 * 0.55;
      for (var i = 0; i < 12; i++) {
        var a = i * Math.PI / 6, px = cx + R * Math.cos(a), py = cy - R * Math.sin(a);
        var dx = D - Math.cos(a), dy = Math.sin(a), d2 = dx * dx + dy * dy, d = Math.sqrt(d2), gm = 1 / d2;
        var gx = gm * dx / d, gy = gm * dy / d; // 화면에서 y는 아래가 +, dy는 이미 화면 기준으로 맞춤
        var tx = gx - g0, ty = gy;
        if (cG.checked) S.arrow(ctx, px, py, px + gx * K, py + gy * K, "#f87171", 2);
        if (cC.checked) S.arrow(ctx, px, py, px - g0 * K, py, "#a3e635", 2);
        if (cT.checked) S.arrow(ctx, px, py, px + tx * K * 4, py + ty * K * 4, "#38bdf8", 3);
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(px, py, 3, 0, 7); ctx.fill();
      }
      S.tag(ctx, "달까지의 거리는 실제(지구 반지름의 약 60배)보다 매우 가깝게 그림", 10, H - 8, { size: 11 });
      out.innerHTML = "<span style='color:#dc2626'>■</span> <b>달의 인력</b>: 달 쪽으로, 달에 가까울수록 큼<br><span style='color:#65a30d'>■</span> <b>원심력</b>: 모든 지점에서 크기와 방향이 같음 (달의 반대쪽)<br><span style='color:#0284c7'>■</span> <b>기조력</b> = 인력 + 원심력 (파랑 화살표는 4배 확대)" +
        "<br><br>달 쪽: 인력 &gt; 원심력 → 달 방향으로<br>반대쪽: 원심력 &gt; 인력 → 달 반대 방향으로<br>→ <b>양쪽 모두 해수면이 높아진다</b>";
    }
    [cG, cC, cT].forEach(function (el) { el.addEventListener("change", draw); });
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 2. 조석 주기와 조석 양상 ---------- */
  (function () {
    var cv = $("sim-cyc"); if (!cv) return;
    var sLat = $("cy-lat"), sDec = $("cy-dec"), bP = $("cy-play"), out = $("cy-out"), g, t = 0, run = true;
    var Pe = 23.934, Pm = 27.32 * 24; // 시간
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    bP.addEventListener("click", function () { run = !run; bP.textContent = run ? "❚❚ 멈춤" : "▶ 계속"; });
    function eta(time, lat, dec) {
      var H = 2 * Math.PI * (time / Pe - time / Pm), phi = lat * Math.PI / 180, de = dec * Math.PI / 180;
      var cz = Math.sin(phi) * Math.sin(de) + Math.cos(phi) * Math.cos(de) * Math.cos(H);
      return cz * cz - 1 / 3;
    }
    S.loop(function (dt) {
      if (run) t = (t + dt * 1.6) % 48;
      var lat = +sLat.value, dec = +sDec.value; $("cy-latv").textContent = lat + "°N"; $("cy-decv").textContent = dec + "°";
      var ctx = g.ctx, W = g.w, H = g.h, ex = W * 0.17, ey = H * 0.5, R = Math.min(W * 0.11, H * 0.3);
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      // 위에서 본 지구(북극 위)와 달
      var ma = -2 * Math.PI * t / Pm, ea = -2 * Math.PI * t / Pe;
      ctx.save(); ctx.translate(ex, ey); ctx.rotate(ma);
      ctx.fillStyle = "rgba(56,189,248,.35)"; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.3, R * 1.05, 0, 0, 7); ctx.fill(); ctx.restore();
      ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.arc(ex, ey, R, 0, 7); ctx.fill();
      var ox = ex + R * Math.cos(ea) * Math.cos(lat * Math.PI / 180), oy = ey + R * Math.sin(ea) * Math.cos(lat * Math.PI / 180);
      ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(ox, oy, 5, 0, 7); ctx.fill();
      var mxp = ex + R * 2.6 * Math.cos(ma), myp = ey + R * 2.6 * Math.sin(ma);
      ctx.fillStyle = "#cbd5e1"; ctx.beginPath(); ctx.arc(mxp, myp, 7, 0, 7); ctx.fill();
      S.tag(ctx, "북극 위에서 본 모습", 8, 20, { size: 11 }); S.tag(ctx, "● 관측 지점", 8, H - 8, { size: 11, bg: "rgba(120,90,0,.85)" });
      // 해수면 그래프
      var gx = W * 0.36, gw = W - gx - 16, gy = 24, gh = H - 60;
      function X(tt) { return gx + tt / 48 * gw; } function Y(v) { return gy + gh / 2 - v * gh * 0.55; }
      ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = S.font(11);
      for (var hh = 0; hh <= 48; hh += 6) { ctx.beginPath(); ctx.moveTo(X(hh), gy); ctx.lineTo(X(hh), gy + gh); ctx.stroke(); ctx.fillText(hh + "h", X(hh) - 8, gy + gh + 14); }
      ctx.fillText("해수면 높이", gx, gy - 8);
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5; ctx.beginPath();
      var highs = [], prev = null, prev2 = null;
      for (var i = 0; i <= 480; i++) { var tt = i * 0.1, v = eta(tt, lat, dec); i ? ctx.lineTo(X(tt), Y(v)) : ctx.moveTo(X(tt), Y(v)); if (prev2 !== null && prev > prev2 && prev > v) highs.push([tt - 0.1, prev]); prev2 = prev; prev = v; }
      ctx.stroke(); ctx.lineWidth = 1;
      highs.forEach(function (hp) { ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(X(hp[0]), Y(hp[1]), 4, 0, 7); ctx.fill(); });
      ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(X(t), gy); ctx.lineTo(X(t), gy + gh); ctx.stroke();
      // 분류
      var hs = highs.map(function (h) { return h[1]; }), kind;
      var sig = highs.length >= 3 && highs[1][1] > -0.2;
      if (highs.length <= 2 || hs.some(function (v) { return v < -0.05; }) && highs.length < 3) kind = "일주조 (하루 만조 1번)";
      else { var mx = Math.max.apply(null, hs), mn = Math.min.apply(null, hs); kind = (mx - mn) / (mx + 0.34) < 0.12 ? "반일주조 (하루 2번, 조차 비슷)" : "혼합조 (하루 2번, 조차 다름)"; }
      var gap = highs.length > 1 ? (highs[1][0] - highs[0][0]) : 0;
      out.innerHTML = "<b>관측 지점 위도</b> " + lat + "°N · <b>달의 적위</b> " + dec + "°<br><b>조석 양상</b> " + kind + (gap ? "<br><b>만조 간격</b> 약 " + Math.floor(gap) + "시간 " + Math.round((gap % 1) * 60) + "분" : "") +
        "<br><br>지구가 반 바퀴 도는 동안 달도 약 6.5° 공전하므로, 다음 만조까지 약 25분이 더 걸린다 → <b>조석 주기 ≈ 12시간 25분</b>";
    });
  })();

  /* ---------- 3. 달의 위상과 사리 · 조금 ---------- */
  (function () {
    var cv = $("sim-sp"); if (!cv) return;
    var sD = $("sp-d"), out = $("sp-out"), g;
    var SUN = 0.46;
    function range(day) { var d = 2 * (2 * Math.PI * day / 29.53); return Math.sqrt(1 + SUN * SUN + 2 * SUN * Math.cos(d)); }
    function size() { g = S.fit(cv, 0.5); draw(); }
    function draw() {
      if (!g) return;
      var day = +sD.value, ctx = g.ctx, W = g.w, H = g.h, ex = W * 0.3, ey = H * 0.45, R = Math.min(W * 0.07, H * 0.13);
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(-H * 0.2, ey, H * 0.32, 0, 7); ctx.fill();
      S.tag(ctx, "태양", 8, 22, { size: 12, bg: "rgba(120,90,0,.9)" });
      var am = Math.PI + 2 * Math.PI * day / 29.53, as = Math.PI;
      // 합성된 해수면 모양
      ctx.fillStyle = "rgba(56,189,248,.4)"; ctx.beginPath();
      for (var k = 0; k <= 72; k++) { var a = k / 72 * 2 * Math.PI, h = Math.cos(2 * (a - am)) + SUN * Math.cos(2 * (a - as)), r = R * (1.35 + 0.22 * h); var x = ex + r * Math.cos(a), y = ey - r * Math.sin(a); k ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.fill();
      ctx.fillStyle = "#2563eb"; ctx.beginPath(); ctx.arc(ex, ey, R, 0, 7); ctx.fill();
      var mr = R * 3.2, mx = ex + mr * Math.cos(am), my = ey - mr * Math.sin(am);
      ctx.strokeStyle = "rgba(255,255,255,.15)"; ctx.beginPath(); ctx.arc(ex, ey, mr, 0, 7); ctx.stroke();
      // 달 (태양 쪽이 밝음)
      ctx.fillStyle = "#334155"; ctx.beginPath(); ctx.arc(mx, my, 9, 0, 7); ctx.fill();
      ctx.fillStyle = "#e2e8f0"; ctx.beginPath(); ctx.arc(mx, my, 9, Math.PI / 2, Math.PI * 1.5); ctx.fill();
      var phaseNames = [[0, "삭"], [7.38, "상현"], [14.77, "망"], [22.15, "하현"], [29.53, "삭"]], nm = "";
      phaseNames.forEach(function (p) { if (Math.abs(day - p[0]) < 1.2) nm = p[1]; });
      if (nm) S.tag(ctx, nm, mx, my - 16, { align: "center", size: 12 });
      // 한 달 조차 그래프
      var gx = W * 0.56, gw = W - gx - 16, gy = 30, gh = H - 70;
      function X(d) { return gx + d / 29.53 * gw; } function Y(v) { return gy + gh - (v - 0.4) / 1.2 * gh; }
      ctx.strokeStyle = "rgba(255,255,255,.1)"; ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = S.font(11);
      phaseNames.forEach(function (p) { ctx.beginPath(); ctx.moveTo(X(p[0]), gy); ctx.lineTo(X(p[0]), gy + gh); ctx.stroke(); ctx.fillText(p[1], X(p[0]) - 8, gy + gh + 14); });
      ctx.fillText("조차 (상대값)", gx, gy - 10);
      ctx.strokeStyle = "#38bdf8"; ctx.lineWidth = 2.5; ctx.beginPath();
      for (var i = 0; i <= 200; i++) { var dd = i / 200 * 29.53; i ? ctx.lineTo(X(dd), Y(range(dd))) : ctx.moveTo(X(dd), Y(range(dd))); } ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(X(day), Y(range(day)), 6, 0, 7); ctx.fill();
      var rv = range(day), lab = rv > 1.3 ? "사리 (대조): 조차가 가장 큼" : rv < 0.65 ? "조금 (소조): 조차가 가장 작음" : "사리와 조금 사이";
      out.innerHTML = "<b>삭 이후</b> " + day.toFixed(1) + "일 " + (nm ? "(" + nm + ")" : "") + "<br><b>" + lab + "</b><br><br>삭·망: 태양과 달이 일직선 → 두 기조력이 <b>더해짐</b><br>상현·하현: 직각 → 서로 <b>상쇄</b><br>태양의 기조력은 달의 약 1/2이다.";
    }
    sD.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();
})();
