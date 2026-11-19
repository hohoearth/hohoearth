/* II-2 지형류 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 에크만 나선과 에크만 수송 ---------- */
  (function () {
    var cv = $("sim-ekman"); if (!cv) return;
    var sHem = $("ek-hem"), sWind = $("ek-wind"), sView = $("ek-view"), out = $("ek-out"), g;
    function size() { g = S.fit(cv, 0.56); draw(); }
    function draw() {
      if (!g) return;
      var nh = sHem.value === "n", wd = +sWind.value * Math.PI / 180, top = sView.value === "top";
      $("ek-windv").textContent = ["북쪽", "북동쪽", "동쪽", "남동쪽", "남쪽", "남서쪽", "서쪽", "북서쪽"][Math.round(+sWind.value / 45) % 8] + "으로 부는 바람";
      var ctx = g.ctx, W = g.w, H = g.h, cx = W * 0.45, cy = top ? H / 2 : H * 0.3, L = Math.min(W, H) * 0.32;
      ctx.fillStyle = "#0b1d33"; ctx.fillRect(0, 0, W, H);
      var sgn = nh ? 1 : -1, N = 14;
      // 방향(지도 좌표: 0=북, 시계 방향) → 화면 좌표
      function vec(dir, len, depth) {
        var x = Math.sin(dir) * len, y = -Math.cos(dir) * len;
        if (top) return [x, y];
        return [x + y * -0.35, y * 0.35 + depth];
      }
      // 바람
      var wv = vec(wd, L * 1.1, 0);
      S.arrow(ctx, cx - wv[0] * 0.5, cy - (top ? wv[1] : wv[1]) * 0.5 - (top ? 0 : 40), cx + wv[0] * 0.5, cy + wv[1] * 0.5 - (top ? 0 : 40), "#e5e7eb", 4);
      S.tag(ctx, "바람", cx + wv[0] * 0.5 + 6, cy + wv[1] * 0.5 - (top ? 0 : 40), { size: 12, bg: "#475569" });
      // 깊이별 해수 이동
      var sumx = 0, sumy = 0;
      for (var k = 0; k < N; k++) {
        var dir = wd + sgn * (Math.PI / 4 + k * 0.25), len = L * Math.exp(-k * 0.22), depth = k * (H * 0.6 / N);
        var dx = Math.sin(dir) * len, dy = -Math.cos(dir) * len; sumx += dx; sumy += dy;
        var v = vec(dir, len, depth), ox = cx, oy = cy + (top ? 0 : depth);
        var col = "hsl(" + (195 + k * 4) + ",80%," + (70 - k * 3) + "%)";
        S.arrow(ctx, ox, oy, ox + v[0], oy + (top ? v[1] : v[1] - depth), col, k === 0 ? 3.5 : 2);
        if (!top && k % 4 === 0) { ctx.fillStyle = "rgba(255,255,255,.5)"; ctx.font = S.font(11); ctx.fillText(k === 0 ? "표면" : "깊이 ↓", 8, oy + 4); }
      }
      // 에크만 수송 (평균)
      var tdir = wd + sgn * Math.PI / 2, tv = vec(tdir, L * 0.95, 0);
      var tx = top ? cx : W * 0.82, ty = top ? cy : H * 0.75;
      S.arrow(ctx, tx, ty, tx + tv[0], ty + tv[1], "#facc15", 6);
      S.tag(ctx, "에크만 수송 (평균 이동)", tx + tv[0] * 0.5, ty + tv[1] * 0.5 + 26, { align: "center", size: 12, bg: "rgba(130,90,0,.9)" });
      S.tag(ctx, top ? "위에서 본 모습 (수평면에 투영 = 에크만 나선)" : "비스듬히 본 모습 (깊이에 따라)", 10, H - 10, { size: 11 });
      out.innerHTML = "<b>" + (nh ? "북반구" : "남반구") + "</b><br>표면 해수: 풍향의 " + (nh ? "오른쪽" : "왼쪽") + " 45°<br>깊어질수록 느려지고 더 " + (nh ? "오른쪽" : "왼쪽") + "으로 휜다<br><b>에크만 수송: 풍향의 " + (nh ? "오른쪽" : "왼쪽") + " 90°</b>";
    }
    [sHem, sWind, sView].forEach(function (el) { el.addEventListener("input", draw); el.addEventListener("change", draw); });
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 2. 지형류의 형성 ---------- */
  (function () {
    var cv = $("sim-geo"); if (!cv) return;
    var sLat = $("geo-lat"), sSl = $("geo-slope"), bGo = $("geo-go"), out = $("geo-out"), g;
    var p, v, trail, t;
    function reset() { p = [0.08, 0.5]; v = [0, 0]; trail = []; t = 0; }
    function size() { g = S.fit(cv, 0.5); }
    size(); reset(); window.addEventListener("resize", size);
    bGo.addEventListener("click", reset); sLat.addEventListener("input", reset); sSl.addEventListener("input", reset);
    S.loop(function (dt) {
      var lat = +sLat.value, slope = +sSl.value; // cm / 100 km
      $("geo-latv").textContent = lat + "°N"; $("geo-slv").textContent = slope + " cm / 100 km";
      var f = Math.sin(lat * Math.PI / 180) * 2.2, pg = 0.25 * slope / 50; // 화면용 단위
      for (var s = 0; s < 4; s++) {
        var h = dt / 4; t += h;
        // 수압 경도력: 화면 위쪽(북쪽, 수압 낮은 쪽)으로.
        // 전향력: 북반구에서 속도의 오른쪽 직각. 화면 좌표(y가 아래로 +)에서는 (-vy, vx) 방향.
        // 작은 마찰항(0.1)은 관성 진동이 가라앉아 평형에 도달하는 모습을 보여 주기 위한 것.
        var cx = -v[1] * f, cy = v[0] * f;
        var ax = cx - 0.1 * v[0], ay = -pg + cy - 0.1 * v[1];
        v[0] += ax * h; v[1] += ay * h;
        p[0] += v[0] * h * 0.25; p[1] += v[1] * h * 0.25;
      }
      if (p[0] > 1.05) { p[0] = 0.08; trail = []; }
      trail.push([p[0], p[1]]); if (trail.length > 900) trail.shift();
      var ctx = g.ctx, W = g.w, H = g.h;
      // 배경: 해수면 높이 (아래쪽 높음)
      var grd = ctx.createLinearGradient(0, H, 0, 0); grd.addColorStop(0, "#1e40af"); grd.addColorStop(1, "#60a5fa");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(255,255,255,.35)"; ctx.setLineDash([8, 6]);
      for (var k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(0, k * H / 6); ctx.lineTo(W, k * H / 6); ctx.stroke(); }
      ctx.setLineDash([]);
      S.tag(ctx, "해수면 높음 · 수압 높음 (남쪽)", 10, H - 8, { size: 12, bg: "rgba(0,0,0,.55)" });
      S.tag(ctx, "해수면 낮음 · 수압 낮음 (북쪽)", 10, 22, { size: 12, bg: "rgba(0,0,0,.55)" });
      S.tag(ctx, "점선 = 등수압선", W - 10, 22, { align: "right", size: 11, bg: "rgba(0,0,0,.45)" });
      ctx.strokeStyle = "#fde047"; ctx.lineWidth = 2.5; ctx.beginPath();
      trail.forEach(function (q, i) { var x = q[0] * W, y = q[1] * H; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineWidth = 1;
      var X = p[0] * W, Y = p[1] * H, sp = Math.hypot(v[0], v[1]) || 1e-6;
      ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(X, Y, 7, 0, 7); ctx.fill();
      S.arrow(ctx, X, Y, X, Y - 46, "#f87171", 3); S.tag(ctx, "수압 경도력", X + 6, Y - 40, { size: 11, bg: "#b91c1c" });
      if (sp > 0.02) { var cxv = -v[1] / sp, cyv = v[0] / sp, m = Math.min(46, f * sp / pg * 46); S.arrow(ctx, X, Y, X + cxv * m, Y + cyv * m, "#a3e635", 3); S.tag(ctx, "전향력", X + cxv * m + 6, Y + cyv * m + 12, { size: 11, bg: "#3f6212" }); }
      var Om = 7.29e-5, fphys = 2 * Om * Math.sin(lat * Math.PI / 180), vg = 9.8 * (slope / 100) / 1e5 / fphys;
      out.innerHTML = "<b>위도</b> " + lat + "°N, <b>해수면 경사</b> " + slope + " cm / 100 km<br>처음에는 수압 경도력 방향(북쪽)으로 움직이다가 전향력 때문에 오른쪽으로 휘어, 결국 <b>등수압선과 나란하게(동쪽)</b> 흐른다." +
        "<br><br><b>지형류의 유속</b><br>v = g(ΔZ/ΔX) / (2Ω sinφ)<br>= 9.8 × " + (slope / 100 / 1e5).toExponential(1) + " / " + fphys.toExponential(2) + " ≈ <b>" + vg.toFixed(2) + " m/s</b>";
    });
  })();

  /* ---------- 3. 북태평양 아열대 순환과 지형류 (해 보기) ---------- */
  (function () {
    var cv = $("sim-gyre"); if (!cv) return;
    var out = $("gyre-out"), g, stage = 0, pick = null;
    var PT = {
      A: { n: "A · 쿠로시오 해류", x: 0.2, y: 0.5, pg: [-1, 0], co: [1, 0], cur: [0, -1], pgT: "서쪽", coT: "동쪽", curT: "북쪽" },
      B: { n: "B · 북태평양 해류", x: 0.5, y: 0.2, pg: [0, -1], co: [0, 1], cur: [1, 0], pgT: "북쪽", coT: "남쪽", curT: "동쪽" },
      C: { n: "C · 캘리포니아 해류", x: 0.82, y: 0.5, pg: [1, 0], co: [-1, 0], cur: [0, 1], pgT: "동쪽", coT: "서쪽", curT: "남쪽" },
      D: { n: "D · 북적도 해류", x: 0.5, y: 0.8, pg: [0, 1], co: [0, -1], cur: [-1, 0], pgT: "남쪽", coT: "북쪽", curT: "서쪽" }
    };
    S.stepper("gyre-steps", "gyre-next", "gyre-reset", function (k) { stage = k; pick = k >= 2 ? pick : null; });
    function size() { g = S.fit(cv, 0.62); }
    size(); window.addEventListener("resize", size);
    cv.addEventListener("click", function (e) {
      if (stage < 2) return;
      var r = cv.getBoundingClientRect(), mx = (e.clientX - r.left) / r.width, my = (e.clientY - r.top) / r.height;
      Object.keys(PT).forEach(function (k) { var q = PT[k]; if (Math.hypot(mx - q.x, (my - q.y) * 0.62) < 0.06) pick = k; });
    });
    S.loop(function (dt, now) {
      var ctx = g.ctx, W = g.w, H = g.h, x0 = W * 0.1, x1 = W * 0.9, y0 = H * 0.08, y1 = H * 0.92;
      ctx.fillStyle = "#1e4f7a"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#6b7d4a"; ctx.fillRect(0, 0, x0, H); ctx.fillRect(x1, 0, W - x1, H);
      S.tag(ctx, "아시아", 6, H / 2, { size: 11 }); S.tag(ctx, "북아메리카", W - 4, H / 2, { align: "right", size: 11 });
      ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = S.font(11);
      ctx.fillText("60°N", x0 + 4, y0 + 10); ctx.fillText("30°N", x0 + 4, H / 2 - 4); ctx.fillText("0°", x0 + 4, y1 - 4);
      ctx.strokeStyle = "rgba(255,255,255,.2)"; ctx.setLineDash([4, 6]); ctx.beginPath(); ctx.moveTo(x0, H / 2); ctx.lineTo(x1, H / 2); ctx.stroke(); ctx.setLineDash([]);
      // ① 바람
      for (var i = 0; i < 5; i++) {
        var xx = x0 + (i + 0.5) * (x1 - x0) / 5;
        S.arrow(ctx, xx - 26, H * 0.27, xx + 26, H * 0.27, "rgba(255,255,255,.75)", 2);
        S.arrow(ctx, xx + 26, H * 0.73, xx - 26, H * 0.73, "rgba(255,255,255,.75)", 2);
      }
      S.tag(ctx, "편서풍", x1 - 4, H * 0.27 - 8, { align: "right", size: 11, bg: "rgba(0,0,0,.5)" });
      S.tag(ctx, "북동 무역풍", x1 - 4, H * 0.73 - 8, { align: "right", size: 11, bg: "rgba(0,0,0,.5)" });
      // ② 에크만 수송 → 30°N 해수면 상승
      if (stage >= 1) {
        for (var j = 0; j < 4; j++) { var xe = x0 + (j + 0.7) * (x1 - x0) / 4.5; S.arrow(ctx, xe, H * 0.33, xe, H * 0.43, "#facc15", 2.5); S.arrow(ctx, xe, H * 0.67, xe, H * 0.57, "#facc15", 2.5); }
        var mx = stage >= 3 ? 0.36 : 0.5;
        var gr = ctx.createRadialGradient(x0 + (x1 - x0) * mx, H / 2, 4, x0 + (x1 - x0) * mx, H / 2, (x1 - x0) * 0.32);
        gr.addColorStop(0, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = gr; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
        S.tag(ctx, "해수면이 높아짐", x0 + (x1 - x0) * mx, H / 2 + 4, { align: "center", size: 12, bg: "rgba(130,90,0,.9)" });
      }
      // ③④ 지형류 순환
      if (stage >= 2) {
        var w = stage >= 3;
        ctx.strokeStyle = "rgba(250,250,250,.85)"; ctx.lineWidth = 3;
        var pts = [[0.2, 0.75], [0.2, 0.25], [0.8, 0.25], [0.8, 0.75]];
        ctx.beginPath(); ctx.moveTo(x0 + (x1 - x0) * 0.82, H * 0.78); ctx.lineTo(x0 + (x1 - x0) * 0.12, H * 0.78);
        ctx.lineWidth = 3; ctx.stroke();
        // 서쪽(강), 북쪽, 동쪽(약)
        ctx.lineWidth = w ? 8 : 3; ctx.strokeStyle = "#f97316"; ctx.beginPath(); ctx.moveTo(x0 + 8, H * 0.76); ctx.lineTo(x0 + 8, H * 0.22); ctx.stroke();
        ctx.lineWidth = 3; ctx.strokeStyle = "rgba(250,250,250,.85)"; ctx.beginPath(); ctx.moveTo(x0 + 8, H * 0.2); ctx.lineTo(x1 - 10, H * 0.2); ctx.stroke();
        ctx.lineWidth = w ? 2 : 3; ctx.strokeStyle = "#60a5fa"; ctx.beginPath(); ctx.moveTo(x1 - 10, H * 0.22); ctx.lineTo(x1 - 10, H * 0.76); ctx.stroke(); ctx.lineWidth = 1;
        var k2 = (now * 0.12) % 1;
        S.arrow(ctx, x0 + 8, H * (0.6 - k2 * 0.2), x0 + 8, H * (0.5 - k2 * 0.2), "#fff", 3);
        S.arrow(ctx, x1 - 10, H * (0.4 + k2 * 0.2), x1 - 10, H * (0.5 + k2 * 0.2), "#fff", 3);
        Object.keys(PT).forEach(function (k) {
          var q = PT[k], X = W * q.x, Y = H * q.y;
          ctx.fillStyle = pick === k ? "#e8590c" : "#4f46e5"; ctx.beginPath(); ctx.arc(X, Y, 13, 0, 7); ctx.fill();
          ctx.fillStyle = "#fff"; ctx.font = S.font(13, true); ctx.fillText(k, X - 4.5, Y + 5);
        });
        if (pick) {
          var q = PT[pick], X = W * q.x, Y = H * q.y, Lh = 44;
          S.arrow(ctx, X, Y, X + q.pg[0] * Lh, Y + q.pg[1] * Lh, "#f87171", 4);
          S.arrow(ctx, X, Y, X + q.co[0] * Lh, Y + q.co[1] * Lh, "#a3e635", 4);
          S.arrow(ctx, X + 16 * q.cur[1], Y - 16 * q.cur[0] * -1, X + 16 * q.cur[1] + q.cur[0] * Lh, Y - 16 * q.cur[0] * -1 + q.cur[1] * Lh, "#facc15", 4);
        }
      }
      var txt = ["대기 대순환에 의해 30°N 북쪽에는 편서풍, 남쪽에는 북동 무역풍이 분다.",
        "북반구에서 에크만 수송은 풍향의 오른쪽 90°. 편서풍 지역은 남쪽으로, 무역풍 지역은 북쪽으로 해수가 이동해 30°N 부근 해수면이 높아진다.",
        "해수면 경사로 수압 경도력이 생기고, 전향력과 평형을 이루어 지형류가 흐른다. <b>A~D를 눌러</b> 힘의 방향을 확인하자.",
        "동서로 흐르던 지형류가 대륙에 막혀 남북으로 나뉘며 시계 방향 순환이 된다. 해수면이 가장 높은 곳이 서쪽으로 치우쳐, 서쪽 해류(쿠로시오)가 동쪽 해류보다 강하다."];
      out.innerHTML = txt[stage] + (pick && stage >= 2 ? "<br><br><b>" + PT[pick].n + "</b><br><span style='color:#dc2626'>■</span> 수압 경도력: " + PT[pick].pgT + "<br><span style='color:#65a30d'>■</span> 전향력: " + PT[pick].coT + "<br><span style='color:#ca8a04'>■</span> 지형류: " + PT[pick].curT + "쪽으로 흐름" : "");
    });
  })();
})();
