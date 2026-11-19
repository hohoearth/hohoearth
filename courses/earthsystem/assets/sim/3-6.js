/* III-6 편서풍 파동 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 대기 대순환: 단일 세포 vs 3세포 ---------- */
  (function () {
    var cv = $("sim-cell"); if (!cv) return;
    var sel = $("ce-mode"), out = $("ce-out"), g, t = 0;
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      t += dt; var three = sel.value === "three";
      var ctx = g.ctx, W = g.w, H = g.h, L = 40, R = 20, gnd = H - 40, top = 40, Wd = W - L - R;
      function X(lat) { return L + lat / 90 * Wd; }
      ctx.fillStyle = "#e0f2fe"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#65a30d"; ctx.fillRect(0, gnd, W, H - gnd);
      ctx.fillStyle = "#334155"; ctx.font = S.font(11, true);
      [0, 30, 60, 90].forEach(function (l) { ctx.fillText(l + "°" + (l ? "N" : ""), X(l) - 10, H - 22); ctx.strokeStyle = "rgba(0,0,0,.08)"; ctx.beginPath(); ctx.moveTo(X(l), top); ctx.lineTo(X(l), gnd); ctx.stroke(); });
      function cell(a, b, cw, col, name) {
        var x1 = X(a), x2 = X(b), cx = (x1 + x2) / 2, rx = (x2 - x1) / 2 - 8, ry = (gnd - top) / 2 - 10, cy = (gnd + top) / 2;
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
        for (var k = 0; k < 3; k++) { var ph = (t * 0.25 * (cw ? 1 : -1) + k / 3) * 2 * Math.PI; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(cx + rx * Math.cos(ph), cy + ry * Math.sin(ph), 5, 0, 7); ctx.fill(); }
        S.tag(ctx, name, cx, cy + 5, { align: "center", size: 12, bg: col });
      }
      if (!three) {
        cell(0, 90, false, "#ea580c", "단일 세포 순환");
        S.arrow(ctx, X(80), gnd + 14, X(10), gnd + 14, "#1d4ed8", 3); S.tag(ctx, "지상: 북풍만 붐", X(45), gnd + 30, { align: "center", size: 11, bg: "#1d4ed8" });
      } else {
        cell(0, 30, false, "#ea580c", "해들리 순환"); cell(30, 60, true, "#7c3aed", "페렐 순환"); cell(60, 90, false, "#0284c7", "극순환");
        var sw = [[25, 5, "무역풍"], [35, 55, "편서풍"], [85, 65, "극동풍"]];
        sw.forEach(function (w) { S.arrow(ctx, X(w[0]), gnd + 14, X(w[1]), gnd + 14, "#1d4ed8", 3); S.tag(ctx, w[2], X((w[0] + w[1]) / 2), gnd + 30, { align: "center", size: 11, bg: "#1d4ed8" }); });
        [[0, "적도 저압대"], [30, "중위도 고압대"], [60, "한대 전선대"], [90, "극고압대"]].forEach(function (b) { S.tag(ctx, b[1], Math.min(W - 70, Math.max(70, X(b[0]))), top - 8, { align: "center", size: 11, bg: "rgba(0,0,0,.55)" }); });
      }
      out.innerHTML = three
        ? "<b>3세포 순환 모델</b> (자전 고려)<br><b>해들리 순환</b>: 적도에서 상승 → 30° 부근 하강 → 무역풍으로 돌아옴 (직접 순환)<br><b>극순환</b>: 극에서 하강 → 극동풍 → 60° 부근 상승 (직접 순환)<br><b>페렐 순환</b>: 30°에서 하강한 공기 일부가 편서풍으로 고위도로 → 60°에서 상승 (두 순환에 의해 생긴 간접 순환)"
        : "<b>단일 세포 순환</b> (자전 없음, 표면이 균질하다고 가정)<br>적도에서 가열된 공기가 상승해 극으로 가고, 극에서 냉각된 공기가 하강해 적도로 돌아온다. 북반구에서는 지상에 <b>북풍만</b> 분다.";
    });
  })();

  /* ---------- 2. 기울어진 등압면과 제트류 ---------- */
  (function () {
    var cv = $("sim-jet"); if (!cv) return;
    var sT = $("jt-dt"), sel = $("jt-season"), out = $("jt-out"), g;
    function size() { g = S.fit(cv, 0.55); draw(); }
    function draw() {
      if (!g) return;
      var dT = +sT.value, winter = sel.value === "w"; $("jt-dtv").textContent = dT + " °C";
      var ctx = g.ctx, W = g.w, H = g.h, L = 40, R = 150, bot = H - 30, top = 20, Wd = W - L - R;
      var grd = ctx.createLinearGradient(L, 0, L + Wd, 0); grd.addColorStop(0, "#fed7aa"); grd.addColorStop(1, "#bfdbfe");
      ctx.fillStyle = grd; ctx.fillRect(L, top, Wd, bot - top);
      S.tag(ctx, "따뜻한 공기 (저위도)", L + 6, bot - 8, { size: 11, bg: "#c2410c" }); S.tag(ctx, "찬 공기 (고위도)", L + Wd - 6, bot - 8, { align: "right", size: 11, bg: "#1d4ed8" });
      // 등압면: 높이 z(p) 가 북쪽으로 낮아지며, 기울기는 위로 갈수록 커짐
      var levels = [1000, 850, 700, 500, 300], tilt = dT / 40;
      levels.forEach(function (p, i) {
        var z0 = (i / (levels.length - 1)) * (bot - top - 30), slope = tilt * (i + 0.4) * 18;
        ctx.strokeStyle = "#334155"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L, bot - z0 - 10); ctx.lineTo(L + Wd, bot - z0 - 10 + slope); ctx.stroke(); ctx.lineWidth = 1;
        ctx.fillStyle = "#334155"; ctx.font = S.font(11, true); ctx.fillText(p + " hPa", L + Wd + 6, bot - z0 - 6 + slope);
      });
      // 바람 프로파일 (오른쪽)
      var px = W - 70;
      ctx.strokeStyle = "#e2e8f0"; ctx.beginPath(); ctx.moveTo(px, bot); ctx.lineTo(px, top); ctx.stroke();
      ctx.strokeStyle = "#0f766e"; ctx.lineWidth = 3; ctx.beginPath();
      for (var z = 0; z <= 1.25; z += 0.02) { var v = dT * 1.6 * Math.min(z, 1) * (z > 1 ? Math.max(0.3, 1 - (z - 1) * 3) : 1), y = bot - z / 1.25 * (bot - top); z ? ctx.lineTo(px + v, y) : ctx.moveTo(px + v, y); }
      ctx.stroke(); ctx.lineWidth = 1;
      S.tag(ctx, "풍속", px, top + 10, { align: "center", size: 11, bg: "#0f766e" });
      S.tag(ctx, "제트류 ⊗", L + Wd * (winter ? 0.42 : 0.62), top + 20, { align: "center", size: 13, bg: "#b91c1c" });
      S.arrow(ctx, L + Wd * 0.3, top + 70, L + Wd * 0.3, top + 30, "#dc2626", 3); S.tag(ctx, "기압 경도력 (북쪽)", L + Wd * 0.3 + 6, top + 52, { size: 11, bg: "#b91c1c" });
      out.innerHTML = "<b>남북 기온 차</b> " + dT + " °C<br>찬 공기는 밀도가 커서 위로 갈수록 기압이 빨리 낮아진다 → 등압면이 <b>북쪽으로 기울고</b>, 위로 갈수록 기울기가 커진다.<br>상층의 기압 경도력(북쪽)과 전향력(남쪽)이 평형 → <b>서쪽에서 동쪽으로 편서풍</b><br>풍속은 대류권 계면 부근에서 가장 강하다 → <b>제트류</b><br><br><b>" + (winter ? "겨울" : "여름") + "</b>: 남북 기온 차가 " + (winter ? "커서 한대 전선 제트류가 강해지고 저위도로 이동" : "작아 제트류가 약해지고 고위도로 이동");
    }
    [sT, sel].forEach(function (el) { el.addEventListener("input", draw); el.addEventListener("change", draw); });
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 3. 편서풍 파동의 변동 과정 ---------- */
  (function () {
    var cv = $("sim-rw"); if (!cv) return;
    var g, amp = 0.05, cut = 0, stage = 0, rot = 0;
    var TG = [{ a: 0.05, c: 0 }, { a: 0.18, c: 0 }, { a: 0.3, c: 0.6 }, { a: 0.07, c: 0 }];
    S.stepper("rw-steps", "rw-next", "rw-reset", function (k) { stage = k; });
    function size() { g = S.fit(cv, 0.6); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      amp = S.approach(amp, TG[stage].a, 1.2, dt); cut = S.approach(cut, TG[stage].c, 1.2, dt); rot += dt * 0.08;
      var ctx = g.ctx, W = g.w, H = g.h, cx = W / 2, cy = H / 2, R0 = Math.min(W, H) * 0.3, n = 5;
      ctx.fillStyle = "#0b1d33"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fb923c"; ctx.beginPath(); ctx.arc(cx, cy, Math.min(W, H) * 0.47, 0, 7); ctx.fill();
      ctx.fillStyle = "#60a5fa"; ctx.beginPath();
      for (var i = 0; i <= 200; i++) { var th = i / 200 * 2 * Math.PI, r = R0 * (1 + amp * Math.sin(n * (th + rot))); var x = cx + r * Math.cos(th), y = cy + r * Math.sin(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 4; ctx.stroke(); ctx.lineWidth = 1;
      if (cut > 0.05) {
        for (var k = 0; k < n; k++) {
          var thc = (k + 0.25) * 2 * Math.PI / n - rot, rc = R0 * (1 + 0.42), thw = (k + 0.75) * 2 * Math.PI / n - rot, rw = R0 * (1 - 0.42);
          ctx.fillStyle = "rgba(96,165,250," + cut + ")"; ctx.beginPath(); ctx.arc(cx + rc * Math.cos(thc), cy + rc * Math.sin(thc), 16 * cut, 0, 7); ctx.fill();
          ctx.fillStyle = "rgba(251,146,60," + cut + ")"; ctx.beginPath(); ctx.arc(cx + rw * Math.cos(thw), cy + rw * Math.sin(thw), 14 * cut, 0, 7); ctx.fill();
        }
      }
      ctx.fillStyle = "#e0f2fe"; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, 7); ctx.fill();
      S.tag(ctx, "북극 위에서 본 모습", 8, 20, { size: 11 }); S.tag(ctx, "파랑 = 찬 공기, 주황 = 따뜻한 공기, 흰 선 = 제트류", 8, H - 8, { size: 11 });
    });
  })();

  /* ---------- 4. 편서풍 파동과 지상의 고기압·저기압 ---------- */
  (function () {
    var cv = $("sim-tr"); if (!cv) return;
    var g, ph = 0, bP = $("tr-play"), run = true;
    bP.addEventListener("click", function () { run = !run; bP.textContent = run ? "❚❚ 멈춤" : "▶ 계속"; });
    function size() { g = S.fit(cv, 0.6); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      if (run) ph += dt * 0.06;
      var ctx = g.ctx, W = g.w, H = g.h, up = H * 0.3, gr = H * 0.82, Lw = W * 0.7, A = H * 0.13;
      ctx.fillStyle = "#f8fafc"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#e0f2fe"; ctx.fillRect(0, 0, W, H * 0.55); ctx.fillStyle = "#dcfce7"; ctx.fillRect(0, H * 0.62, W, H * 0.38);
      S.tag(ctx, "상층 (편서풍 파동)", 8, 18, { size: 11, bg: "#1d4ed8" }); S.tag(ctx, "지상", 8, H * 0.62 + 18, { size: 11, bg: "#15803d" });
      function yUp(x) { return up - A * Math.cos(2 * Math.PI * (x / Lw - ph)); }
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 4; ctx.beginPath(); for (var x = 0; x <= W; x += 3) { x ? ctx.lineTo(x, yUp(x)) : ctx.moveTo(x, yUp(x)); } ctx.stroke(); ctx.lineWidth = 1;
      for (var m = -1; m < 3; m++) {
        var xr = (m + ph) * Lw, xt = xr + Lw / 2; // 기압 마루(위로 볼록) / 기압골
        if (xr > -50 && xr < W + 50) S.tag(ctx, "기압 마루", xr, up - A - 10, { align: "center", size: 11, bg: "#c2410c" });
        if (xt > -50 && xt < W + 50) {
          S.tag(ctx, "기압골", xt, up + A + 22, { align: "center", size: 11, bg: "#1d4ed8" });
          var xc = xt - Lw / 4, xd = xt + Lw / 4;
          S.tag(ctx, "수렴", xc, up + 6, { align: "center", size: 11, bg: "rgba(0,0,0,.6)" }); S.tag(ctx, "발산", xd, up + 6, { align: "center", size: 11, bg: "rgba(0,0,0,.6)" });
          S.arrow(ctx, xc, up + 30, xc, gr - 30, "#c2410c", 3); S.arrow(ctx, xd, gr - 30, xd, up + 30, "#1d4ed8", 3);
          S.tag(ctx, "고", xc, gr + 6, { align: "center", size: 16, bg: "#c2410c" }); S.tag(ctx, "저", xd, gr + 6, { align: "center", size: 16, bg: "#1d4ed8" });
        }
      }
      S.arrow(ctx, W - 120, H * 0.58, W - 30, H * 0.58, "#0f766e", 3); S.tag(ctx, "서 → 동으로 이동", W - 130, H * 0.58 + 6, { align: "right", size: 11, bg: "#0f766e" });
    });
  })();

  /* ---------- 5. 탐구: 회전 원통 행성파 모식 실험 ---------- */
  (function () {
    var cv = $("sim-ann"); if (!cv) return;
    var sW = $("an-w"), sT = $("an-dt"), out = $("an-out"), g, t = 0;
    function size() { g = S.fit(cv, 0.6); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      var w = +sW.value, dT = +sT.value; t += dt * (0.2 + w * 0.15);
      var n = Math.max(0, Math.round(1 + w * 1.6 + dT * 0.08)), amp = w < 0.4 ? 0 : 0.12 + dT * 0.004;
      $("an-wv").textContent = w < 0.4 ? "거의 정지" : w < 1.5 ? "느리게" : w < 2.6 ? "보통" : "빠르게"; $("an-dtv").textContent = dT + " °C";
      var ctx = g.ctx, W = g.w, H = g.h, cx = W * 0.42, cy = H / 2, Ro = Math.min(W * 0.4, H * 0.46), Ri = Ro * 0.35, Rm = (Ro + Ri) / 2;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#fecaca"; ctx.beginPath(); ctx.arc(cx, cy, Ro, 0, 7); ctx.fill();
      ctx.fillStyle = "#dbeafe"; ctx.beginPath(); ctx.arc(cx, cy, Ro * 0.93, 0, 7); ctx.fill();
      ctx.fillStyle = "#bfdbfe"; ctx.beginPath(); ctx.arc(cx, cy, Ri, 0, 7); ctx.fill();
      S.tag(ctx, "얼음물 (극지방)", cx, cy + 5, { align: "center", size: 11, bg: "#1d4ed8" });
      S.tag(ctx, "뜨거운 물 (적도 지방)", cx, cy - Ro + 16, { align: "center", size: 11, bg: "#b91c1c" });
      ctx.strokeStyle = "#1e3a8a"; ctx.lineWidth = 3; ctx.beginPath();
      for (var i = 0; i <= 240; i++) { var th = i / 240 * 2 * Math.PI, r = Rm * (1 + (n ? amp * Math.sin(n * (th - t)) : 0)); var x = cx + r * Math.cos(th), y = cy + r * Math.sin(th); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.lineWidth = 1;
      if (w > 2.4) for (var k = 0; k < n; k++) { var a = (k + 0.5) * 2 * Math.PI / n + t, rr = Rm * (1 + amp * 1.3 * (k % 2 ? 1 : -1)); ctx.strokeStyle = "#7c3aed"; ctx.beginPath(); ctx.arc(cx + rr * Math.cos(a), cy + rr * Math.sin(a), 8, 0, 5); ctx.stroke(); }
      out.innerHTML = "<b>회전 속도</b> " + $("an-wv").textContent + " · <b>안팎 온도 차</b> " + dT + " °C<br><b>파동의 수</b> " + (n && amp ? n + "개" : "파동 없음 (단순한 대류)") +
        "<br><br>회전이 빨라질수록 파장이 짧아지고 파동 수가 늘며, 더 빠르면 작은 소용돌이가 생긴다. 온도 차가 커져도 파동 수가 늘어난다.<br><span style='font-size:.75rem;color:var(--muted)'>실험 결과를 단순화한 모식 시뮬레이션</span>";
    });
  })();
})();
