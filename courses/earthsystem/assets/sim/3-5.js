/* III-5 여러 가지 바람 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 지균풍의 형성 ---------- */
  (function () {
    var cv = $("sim-gw"); if (!cv) return;
    var sLat = $("gw-lat"), sDp = $("gw-dp"), bGo = $("gw-go"), out = $("gw-out"), g, p, v, tr;
    function reset() { p = [0.06, 0.55]; v = [0, 0]; tr = []; }
    function size() { g = S.fit(cv, 0.48); }
    size(); reset(); window.addEventListener("resize", size);
    [sLat, sDp].forEach(function (el) { el.addEventListener("input", reset); }); bGo.addEventListener("click", reset);
    S.loop(function (dt) {
      var lat = +sLat.value, dp = +sDp.value; $("gw-latv").textContent = lat + "°N"; $("gw-dpv").textContent = dp + " hPa / 100 km";
      var f = Math.sin(lat * Math.PI / 180) * 2.2, pg = 0.22 * dp / 4;
      for (var s = 0; s < 4; s++) { var h = dt / 4; var cx = -v[1] * f, cy = v[0] * f; v[0] += (cx - 0.08 * v[0]) * h; v[1] += (-pg + cy - 0.08 * v[1]) * h; p[0] += v[0] * h * 0.25; p[1] += v[1] * h * 0.25; }
      if (p[0] > 1.05 || p[1] < -0.05) reset(); tr.push([p[0], p[1]]); if (tr.length > 900) tr.shift();
      var ctx = g.ctx, W = g.w, H = g.h;
      ctx.fillStyle = "#eff6ff"; ctx.fillRect(0, 0, W, H);
      var labs = [844, 848, 852, 856];
      ctx.strokeStyle = "#64748b"; ctx.font = S.font(11, true);
      for (var k = 0; k < 4; k++) { var y = (k + 0.5) * H / 4; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.fillStyle = "#334155"; ctx.fillText(labs[k] + " hPa", W - 62, y - 4); }
      S.tag(ctx, "저기압 쪽 (북)", 8, 18, { size: 11, bg: "#1d4ed8" }); S.tag(ctx, "고기압 쪽 (남)", 8, H - 6, { size: 11, bg: "#c2410c" });
      ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 2.5; ctx.beginPath(); tr.forEach(function (q, i) { i ? ctx.lineTo(q[0] * W, q[1] * H) : ctx.moveTo(q[0] * W, q[1] * H); }); ctx.stroke(); ctx.lineWidth = 1;
      var X = p[0] * W, Y = p[1] * H, sp = Math.hypot(v[0], v[1]) || 1e-6;
      ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(X, Y, 7, 0, 7); ctx.fill();
      S.arrow(ctx, X, Y, X, Y - 42, "#dc2626", 3); if (sp > 0.02) { var m = Math.min(42, f * sp / pg * 42); S.arrow(ctx, X, Y, X - v[1] / sp * m, Y + v[0] / sp * m, "#16a34a", 3); }
      var rho = 1.0, Om = 7.29e-5, fp = 2 * Om * Math.sin(lat * Math.PI / 180), vg = (dp * 100 / 1e5) / (rho * fp);
      out.innerHTML = "<span style='color:#dc2626'>■</span> 기압 경도력 &nbsp;<span style='color:#16a34a'>■</span> 전향력<br>정지한 공기가 저기압 쪽으로 움직이다 전향력으로 오른쪽으로 휘어, 결국 <b>등압선과 나란하게</b> 분다." +
        "<br><br><b>지균풍 풍속</b> v = ΔP / (2ρΩ sinφ ΔL)<br>≈ " + vg.toFixed(1) + " m/s (공기 밀도 1 kg/m³로 가정)";
    });
  })();

  /* ---------- 2. 경도풍: 저기압과 고기압 주위 ---------- */
  (function () {
    var cv = $("sim-grw"); if (!cv) return;
    var sel = $("gr-type"), sH = $("gr-hem"), out = $("gr-out"), g, a = 0;
    function size() { g = S.fit(cv, 0.55); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      var low = sel.value === "L", nh = sH.value === "n", ccw = (low && nh) || (!low && !nh);
      a += dt * 0.6 * (ccw ? -1 : 1) * (low ? 0.85 : 1.15);
      var ctx = g.ctx, W = g.w, H = g.h, cx = W * 0.42, cy = H / 2, R = Math.min(W, H) * 0.36;
      ctx.fillStyle = "#eff6ff"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#64748b"; for (var k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(cx, cy, R * k / 4, 0, 7); ctx.stroke(); }
      S.tag(ctx, low ? "저" : "고", cx, cy + 6, { align: "center", size: 16, bg: low ? "#1d4ed8" : "#c2410c" });
      // 흐르는 입자
      for (var i = 0; i < 24; i++) { var th = a + i * Math.PI / 12, rr = R * (0.55 + (i % 3) * 0.15); ctx.fillStyle = "#0f766e"; ctx.beginPath(); ctx.arc(cx + rr * Math.cos(th), cy + rr * Math.sin(th), 3, 0, 7); ctx.fill(); }
      // 한 점에서 힘
      var th0 = -Math.PI / 2, px = cx + R * 0.75 * Math.cos(th0), py = cy + R * 0.75 * Math.sin(th0), L = 54;
      var inward = [0, 1], outward = [0, -1];
      var pg = low ? inward : outward, co = low ? outward : inward, cp = inward;
      var pgL = low ? 1 : 0.7, coL = low ? 0.7 : 1.0;
      S.arrow(ctx, px, py, px + pg[0] * L * pgL, py + pg[1] * L * pgL, "#dc2626", 4);
      S.arrow(ctx, px + 4, py, px + 4 + co[0] * L * coL, py + co[1] * L * coL, "#16a34a", 4);
      S.arrow(ctx, px - 6, py, px - 6 + cp[0] * L * 0.3, py + cp[1] * L * 0.3, "#7c3aed", 4);
      var dir = ccw ? -1 : 1; S.arrow(ctx, px, py - 12, px + dir * 50, py - 12, "#0f766e", 3);
      S.tag(ctx, "바람", px + dir * 50 + (dir > 0 ? 6 : -40), py - 6, { size: 11, bg: "#0f766e" });
      out.innerHTML = "<b>" + (nh ? "북반구" : "남반구") + " · " + (low ? "저기압" : "고기압") + "</b><br>바람 방향: <b>" + (ccw ? "시계 반대 방향" : "시계 방향") + "</b>, 등압선과 나란하게<br><br><span style='color:#dc2626'>■</span> 기압 경도력 <span style='color:#16a34a'>■</span> 전향력 <span style='color:#7c3aed'>■</span> 구심력(두 힘의 차)<br>" +
        (low ? "전향력 = 기압 경도력 − 구심력" : "전향력 = 기압 경도력 + 구심력") + "<br><br>기압 경도력이 같다면 전향력이 더 큰 <b>고기압 쪽 경도풍이 더 빠르다</b>.";
    });
  })();

  /* ---------- 3. 지상풍: 마찰력과 경각 ---------- */
  (function () {
    var cv = $("sim-sw"); if (!cv) return;
    var sel = $("sw-sfc"), out = $("sw-out"), g;
    var K = { upper: [0, "상층 (마찰 없음)"], sea: [0.32, "해상"], land: [0.6, "육상 평야"], mtn: [1.0, "산악 지대"] };
    function size() { g = S.fit(cv, 0.5); draw(); }
    function draw() {
      if (!g) return;
      var k = K[sel.value][0], f = 1, G = 1;
      // 정상 상태: v = G / (k + i f) (북반구), G는 북쪽(저기압 방향)
      var den = k * k + f * f, vx = G * f / den, vy = G * k / den; // 동쪽 성분, 북쪽 성분
      var ang = Math.atan2(vy, vx) * 180 / Math.PI, sp = Math.hypot(vx, vy);
      var ctx = g.ctx, W = g.w, H = g.h, cx = W * 0.42, cy = H * 0.55, L = Math.min(W, H) * 0.32;
      ctx.fillStyle = "#f0fdf4"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#64748b"; [1000, 1004, 1008, 1012].forEach(function (p, i) { var y = H * (0.12 + i * 0.25); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); ctx.fillStyle = "#334155"; ctx.font = S.font(11, true); ctx.fillText(p + " hPa", W - 66, y - 4); });
      var vxs = vx / sp, vys = -vy / sp; // 화면 좌표
      S.arrow(ctx, cx, cy, cx, cy - L, "#dc2626", 4); S.tag(ctx, "기압 경도력", cx + 6, cy - L + 8, { size: 11, bg: "#b91c1c" });
      S.arrow(ctx, cx, cy, cx + vxs * L * sp, cy + vys * L * sp, "#0f766e", 5); S.tag(ctx, "지상풍", cx + vxs * L * sp + 6, cy + vys * L * sp, { size: 12, bg: "#0f766e" });
      // 전향력: 바람의 오른쪽 직각, 크기 f*sp
      var cxv = -vys, cyv = vxs; S.arrow(ctx, cx, cy, cx + cxv * L * f * sp, cy + cyv * L * f * sp, "#16a34a", 3); S.tag(ctx, "전향력", cx + cxv * L * f * sp + 6, cy + cyv * L * f * sp + 12, { size: 11, bg: "#15803d" });
      if (k > 0) { S.arrow(ctx, cx, cy, cx - vxs * L * k * sp, cy - vys * L * k * sp, "#7c3aed", 3); S.tag(ctx, "마찰력", cx - vxs * L * k * sp - 58, cy - vys * L * k * sp + 4, { size: 11, bg: "#6d28d9" }); }
      if (k > 0) { ctx.strokeStyle = "#0f766e"; ctx.beginPath(); ctx.arc(cx, cy, 40, -ang * Math.PI / 180, 0); ctx.stroke(); S.tag(ctx, "경각 " + ang.toFixed(0) + "°", cx + 44, cy - 8, { size: 11, bg: "rgba(0,0,0,.6)" }); }
      out.innerHTML = "<b>" + K[sel.value][1] + "</b><br>바람이 등압선과 이루는 각(경각) ≈ <b>" + ang.toFixed(0) + "°</b><br>상대 풍속 ≈ " + (sp * 100).toFixed(0) + "% (상층 = 100%)" +
        (k > 0 ? "<br><br>마찰력이 풍속을 줄이면 전향력도 작아져, 바람이 <b>저기압 쪽으로 등압선을 비스듬히 가로질러</b> 분다. 마찰이 클수록 경각이 크다." : "<br><br>마찰이 없으면 기압 경도력 = 전향력 → <b>등압선과 나란한 지균풍</b>");
    }
    sel.addEventListener("change", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 4. 지상의 저기압·고기압 주변 바람 ---------- */
  (function () {
    var cv = $("sim-lh"); if (!cv) return;
    var g, P = [];
    function size() { g = S.fit(cv, 0.42); }
    size(); window.addEventListener("resize", size);
    for (var i = 0; i < 80; i++) P.push({ c: i % 2, r: 0.2 + Math.random() * 0.8, a: Math.random() * 6.3 });
    S.loop(function (dt) {
      var ctx = g.ctx, W = g.w, H = g.h, cs = [[W * 0.27, H / 2, "L"], [W * 0.73, H / 2, "H"]], R = Math.min(W * 0.2, H * 0.44);
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
      cs.forEach(function (c) { ctx.strokeStyle = "#94a3b8"; for (var k = 1; k <= 3; k++) { ctx.beginPath(); ctx.arc(c[0], c[1], R * k / 3, 0, 7); ctx.stroke(); } S.tag(ctx, c[2] === "L" ? "저" : "고", c[0], c[1] + 6, { align: "center", size: 15, bg: c[2] === "L" ? "#1d4ed8" : "#c2410c" }); });
      P.forEach(function (p) {
        if (p.c === 0) { p.a -= dt * 0.9 / p.r; p.r -= dt * 0.08; if (p.r < 0.15) p.r = 1; }
        else { p.a += dt * 0.9 / Math.max(0.3, p.r); p.r += dt * 0.08; if (p.r > 1) p.r = 0.15; }
        var c = cs[p.c]; ctx.fillStyle = p.c === 0 ? "#2563eb" : "#ea580c"; ctx.beginPath(); ctx.arc(c[0] + R * p.r * Math.cos(p.a), c[1] + R * p.r * Math.sin(p.a), 3, 0, 7); ctx.fill();
      });
      S.tag(ctx, "시계 반대 방향으로 불어 들어감", W * 0.27, H - 6, { align: "center", size: 11, bg: "#1d4ed8" });
      S.tag(ctx, "시계 방향으로 불어 나감", W * 0.73, H - 6, { align: "center", size: 11, bg: "#c2410c" });
    });
  })();
})();
