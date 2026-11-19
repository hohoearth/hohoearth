/* II-1 해수를 움직이는 힘 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 해 보기: 수평 방향으로 물이 흐르는 원리 ---------- */
  (function () {
    var cv = $("sim-tank"); if (!cv) return;
    var sel = $("tank-case"), bOpen = $("tank-open"), bReset = $("tank-reset"), out = $("tank-out"), g;
    var hA, hB, rA, rB, open = false, G = 10, flow = 0, t = 0;
    var CASES = { height: { hA: 3, hB: 2, rA: 1000, rB: 1000 }, big: { hA: 4.5, hB: 1.5, rA: 1000, rB: 1000 }, density: { hA: 3, hB: 3, rA: 1200, rB: 1000 } };
    function reset() { var c = CASES[sel.value]; hA = c.hA; hB = c.hB; rA = c.rA; rB = c.rB; open = false; flow = 0; bOpen.textContent = "밸브 열기"; bOpen.classList.add("on"); }
    function size() { g = S.fit(cv, 0.55); }
    size(); reset(); window.addEventListener("resize", size);
    sel.addEventListener("change", reset); bReset.addEventListener("click", reset);
    bOpen.addEventListener("click", function () { open = !open; bOpen.textContent = open ? "밸브 닫기" : "밸브 열기"; bOpen.classList.toggle("on", !open); });
    S.loop(function (dt) {
      t += dt;
      var pA = rA * G * hA, pB = rB * G * hB, dP = pA - pB;
      flow = open ? dP * 0.00004 : 0;
      if (open) { hA -= flow * dt; hB += flow * dt; }
      var ctx = g.ctx, W = g.w, H = g.h, base = H - 40, sc = (H - 90) / 5, tw = W * 0.26, ax = W * 0.1, bx = W * 0.64;
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
      function tank(x, h, rho, name) {
        ctx.fillStyle = rho > 1000 ? "#1e5aa8" : "#4aa3df"; ctx.fillRect(x, base - h * sc, tw, h * sc);
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, base - 5 * sc - 10); ctx.lineTo(x, base); ctx.lineTo(x + tw, base); ctx.lineTo(x + tw, base - 5 * sc - 10); ctx.stroke(); ctx.lineWidth = 1;
        S.tag(ctx, name, x + tw / 2, base - 5 * sc - 16, { align: "center", size: 13, bg: "#334155" });
        S.tag(ctx, "높이 " + h.toFixed(2) + " m", x + tw / 2, base - h * sc - 6, { align: "center", size: 11, bg: "rgba(0,0,0,.6)" });
        S.tag(ctx, "밀도 " + rho + " kg/m³", x + tw / 2, base - 10, { align: "center", size: 11, bg: "rgba(0,0,0,.45)" });
      }
      tank(ax, hA, rA, "탱크 A"); tank(bx, hB, rB, "탱크 B");
      // 관과 밸브
      var py = base - 14;
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(ax + tw, py - 8, bx - ax - tw, 16);
      ctx.fillStyle = open ? "#22c55e" : "#ef4444"; ctx.beginPath(); ctx.arc((ax + tw + bx) / 2, py, 12, 0, 7); ctx.fill();
      S.tag(ctx, open ? "열림" : "닫힘", (ax + tw + bx) / 2, py - 18, { align: "center", size: 11, bg: open ? "#15803d" : "#b91c1c" });
      if (open && Math.abs(dP) > 50) {
        var dir = dP > 0 ? 1 : -1, n = 6;
        for (var i = 0; i < n; i++) { var k = ((t * 0.8 * Math.min(3, Math.abs(dP) / 3000) + i / n) % 1), x = dir > 0 ? ax + tw + k * (bx - ax - tw) : bx - k * (bx - ax - tw); ctx.fillStyle = "#1d4ed8"; ctx.beginPath(); ctx.arc(x, py, 4, 0, 7); ctx.fill(); }
      }
      // 바닥 수압 표시
      S.tag(ctx, "바닥 수압 " + (pA / 100).toFixed(0) + " hPa", ax, H - 6, { size: 11, bg: "#0f766e" });
      S.tag(ctx, "바닥 수압 " + (pB / 100).toFixed(0) + " hPa", bx, H - 6, { size: 11, bg: "#0f766e" });
      out.innerHTML = "<b>수압</b> P = ρ g h<br>A 바닥: " + rA + "×10×" + hA.toFixed(2) + " = " + Math.round(pA).toLocaleString() + " Pa<br>B 바닥: " + rB + "×10×" + hB.toFixed(2) + " = " + Math.round(pB).toLocaleString() + " Pa<br><b>수압 차</b> " + Math.abs(dP / 100).toFixed(0) + " hPa" +
        "<br><br>" + (Math.abs(dP) < 60 ? "수압이 같아져 흐름이 멈춘다." : (dP > 0 ? "A → B" : "B → A") + " 방향으로 " + (open ? "흐른다" : "흐를 것이다") + " (수압이 높은 쪽 → 낮은 쪽)");
    });
  })();

  /* ---------- 2. 밀도 차로 생기는 수평 수압 경도력 ---------- */
  (function () {
    var cv = $("sim-dens"); if (!cv) return;
    var sT = $("dens-t"), out = $("dens-out"), g;
    function size() { g = S.fit(cv, 0.5); draw(); }
    function draw() {
      if (!g) return;
      var dT = +sT.value, ctx = g.ctx, W = g.w, H = g.h, base = H - 30, colH = H * 0.6, ex = dT * 0.018; // 열팽창 비율(과장)
      $("dens-tv").textContent = dT + " °C";
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
      var hA = colH * (1 + ex), hB = colH, x0 = W * 0.1, x1 = W * 0.9;
      var grd = ctx.createLinearGradient(x0, 0, x1, 0); grd.addColorStop(0, "#f97316"); grd.addColorStop(1, "#2563eb");
      ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(x0, base); ctx.lineTo(x0, base - hA); ctx.lineTo(x1, base - hB); ctx.lineTo(x1, base); ctx.fill();
      // 등수압면: 각 기둥 높이를 같은 비율로 나눈 선 (같은 무게 = 같은 수압)
      ctx.strokeStyle = "rgba(255,255,255,.9)"; ctx.setLineDash([6, 4]);
      for (var k = 1; k <= 4; k++) { var f = k / 5; ctx.beginPath(); ctx.moveTo(x0, base - hA * f); ctx.lineTo(x1, base - hB * f); ctx.stroke(); }
      ctx.setLineDash([]);
      S.tag(ctx, "등수압면", x1 - 6, base - hB * 0.6 - 4, { align: "right", size: 11, bg: "rgba(0,0,0,.55)" });
      // 같은 깊이 선
      var yd = base - colH * 0.5;
      ctx.strokeStyle = "#111"; ctx.beginPath(); ctx.moveTo(x0, yd); ctx.lineTo(x1, yd); ctx.stroke();
      S.tag(ctx, "같은 깊이", x0 + 4, yd - 4, { size: 11, bg: "#111" });
      if (dT > 0) { S.arrow(ctx, W * 0.38, yd + 20, W * 0.62, yd + 20, "#facc15", 3 + dT * 0.25); S.tag(ctx, "수평 수압 경도력", W * 0.5, yd + 46, { align: "center", size: 12, bg: "rgba(120,80,0,.85)" }); }
      S.tag(ctx, "A: 따뜻한 해수 (밀도 작음)", x0, 22, { size: 12, bg: "#c2410c" });
      S.tag(ctx, "B: 찬 해수 (밀도 큼)", x1, 22, { align: "right", size: 12, bg: "#1d4ed8" });
      out.innerHTML = "<b>수온 차</b> " + dT + " °C<br>따뜻한 해수는 부피가 팽창해 해수면이 더 높다(그림은 과장).<br>같은 깊이에서 A 위에 있는 물이 더 많으므로 <b>A의 수압 &gt; B의 수압</b> → A에서 B로 수평 수압 경도력이 작용한다.";
    }
    sT.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 3. 전향력: 회전 원반 위에서 던진 공 ---------- */
  (function () {
    var cv = $("sim-cor"); if (!cv) return;
    var sRot = $("cor-rot"), sView = $("cor-view"), bThrow = $("cor-throw"), sLat = $("cor-lat"), out = $("cor-out"), g;
    var ang = 0, ball = null, trail = [];
    function size() { g = S.fit(cv, 0.6); }
    size(); window.addEventListener("resize", size);
    bThrow.addEventListener("click", function () { ball = { t: 0, a0: ang }; trail = []; });
    S.loop(function (dt) {
      // 캔버스에서 +각도는 화면상 시계 방향이므로, '시계 반대 방향' 회전은 음수
      var w = sRot.value === "ccw" ? -0.9 : sRot.value === "cw" ? 0.9 : 0, rotView = sView.value === "rot";
      ang += w * dt;
      var ctx = g.ctx, W = g.w, H = g.h, R = Math.min(W * 0.32, H * 0.44), cx = W * 0.36, cy = H / 2, v = R / 1.6;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(rotView ? 0 : ang);
      ctx.fillStyle = "#1e3a5f"; ctx.beginPath(); ctx.arc(0, 0, R, 0, 7); ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,.15)"; for (var i = 0; i < 8; i++) { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R * Math.cos(i * Math.PI / 4), R * Math.sin(i * Math.PI / 4)); ctx.stroke(); }
      ctx.fillStyle = "#f87171"; ctx.beginPath(); ctx.arc(0, -R + 10, 9, 0, 7); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.font = S.font(12, true); ctx.fillText("목표", 12, -R + 14);
      ctx.fillStyle = "#facc15"; ctx.beginPath(); ctx.arc(0, 0, 8, 0, 7); ctx.fill();
      ctx.restore();
      if (ball) {
        ball.t += dt;
        var r = v * ball.t, dirIn = ball.a0 - Math.PI / 2; // 던질 때 목표가 있던 방향(관성계)
        var px = r * Math.cos(dirIn), py = r * Math.sin(dirIn);
        var rot = rotView ? -ang : 0; // 회전계 보기: 관성계 위치를 -ang 만큼 돌려 그림
        var sx = cx + px * Math.cos(rot) - py * Math.sin(rot), sy = cy + px * Math.sin(rot) + py * Math.cos(rot);
        if (r <= R) trail.push([px, py, ang]);
        ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3; ctx.beginPath();
        trail.forEach(function (p, i) {
          var a = rotView ? -p[2] : 0, x = cx + p[0] * Math.cos(a) - p[1] * Math.sin(a), y = cy + p[0] * Math.sin(a) + p[1] * Math.cos(a);
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        });
        ctx.stroke(); ctx.lineWidth = 1;
        if (r <= R) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(sx, sy, 7, 0, 7); ctx.fill(); }
        if (ball.t > 3) ball = null;
      }
      S.tag(ctx, rotView ? "원반 위 관찰자의 눈 (회전하는 좌표)" : "우주에서 본 모습 (회전하지 않는 좌표)", 10, 24, { size: 12 });
      // 위도에 따른 전향력
      var lat = +sLat.value, f = Math.sin(lat * Math.PI / 180), gx = W * 0.76, gh = H * 0.6, gy = H * 0.18;
      ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect(gx, gy, 34, gh);
      ctx.fillStyle = "#fb923c"; ctx.fillRect(gx, gy + gh * (1 - Math.abs(f)), 34, gh * Math.abs(f));
      ctx.fillStyle = "#fff"; ctx.font = S.font(12, true); ctx.fillText("전향력", gx - 4, gy + gh + 18); ctx.fillText("위도 " + lat + "°", gx - 6, gy - 8);
      out.innerHTML = "<b>회전</b> " + (sRot.value === "ccw" ? "시계 반대 방향 (북반구에 해당)" : sRot.value === "cw" ? "시계 방향 (남반구에 해당)" : "정지") +
        "<br>공은 실제로 똑바로 날아가지만, 회전하는 관찰자에게는 " + (w > 0 ? "<b>오른쪽</b>" : w < 0 ? "<b>왼쪽</b>" : "휘지 않고 똑바로") + (w ? "으로 휘어 보인다." : " 보인다.") +
        "<br><br><b>위도 " + lat + "°</b>에서 1 m/s로 움직이는 물체의 전향력<br>2vΩsinφ = 2×1×7.29×10⁻⁵×" + f.toFixed(2) + " ≈ " + (2 * 7.29e-5 * f).toExponential(2) + " m/s²";
    });
  })();
})();
