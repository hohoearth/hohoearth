/* III-4 기압의 연직 분포와 대기를 움직이는 힘 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 높이에 따른 기압과 풍선의 부피 ---------- */
  (function () {
    var cv = $("sim-alt"); if (!cv) return;
    var sZ = $("al-z"), out = $("al-out"), g, dots = [];
    for (var i = 0; i < 260; i++) { var u = Math.random(); dots.push({ x: Math.random(), z: -Math.log(1 - u * 0.86) * 0.18 }); }
    function size() { g = S.fit(cv, 0.55); draw(); }
    function P(z) { return 1013 * Math.exp(-z / 8); }
    function draw() {
      if (!g) return;
      var z = +sZ.value, ctx = g.ctx, W = g.w, H = g.h, ZM = 16, top = 16, bot = H - 24;
      function Y(k) { return bot - k / ZM * (bot - top); }
      $("al-zv").textContent = z.toFixed(1) + " km";
      var sky = ctx.createLinearGradient(0, top, 0, bot); sky.addColorStop(0, "#0f172a"); sky.addColorStop(1, "#7dd3fc");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W * 0.55, H);
      ctx.fillStyle = "#65a30d"; ctx.fillRect(0, bot, W * 0.55, H - bot);
      ctx.fillStyle = "rgba(255,255,255,.75)";
      dots.forEach(function (d) { var kz = d.z * ZM / 2.6; if (kz < ZM) { ctx.beginPath(); ctx.arc(d.x * W * 0.53 + 4, Y(kz), 1.8, 0, 7); ctx.fill(); } });
      S.tag(ctx, "점 = 공기 분자 (아래일수록 빽빽)", 6, top + 14, { size: 11 });
      // 풍선
      var vol = 1013 / P(z), r = 12 * Math.cbrt(vol), bx = W * 0.4, by = Y(z);
      ctx.fillStyle = vol > 6 ? "#ef4444" : "#f97316"; ctx.beginPath(); ctx.arc(bx, by, Math.min(r, 60), 0, 7); ctx.fill();
      ctx.strokeStyle = "#fff"; ctx.beginPath(); ctx.moveTo(bx, by + Math.min(r, 60)); ctx.lineTo(bx, by + Math.min(r, 60) + 18); ctx.stroke();
      // 기압 그래프
      var gx = W * 0.6, gw = W - gx - 16;
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(W * 0.55, 0, W * 0.45, H);
      ctx.strokeStyle = "#e5e7eb"; ctx.fillStyle = "#6b7280"; ctx.font = S.font(11);
      for (var p = 0; p <= 1000; p += 250) { var x = gx + p / 1013 * gw; ctx.beginPath(); ctx.moveTo(x, top); ctx.lineTo(x, bot); ctx.stroke(); ctx.fillText(p, x - 8, bot + 14); }
      for (var k = 0; k <= ZM; k += 4) { ctx.fillText(k + " km", gx - 40, Y(k) + 4); }
      ctx.fillText("기압 (hPa)", gx + gw / 2 - 26, H - 2);
      ctx.strokeStyle = "#1d4ed8"; ctx.lineWidth = 3; ctx.beginPath(); for (var zz = 0; zz <= ZM; zz += 0.1) { var xx = gx + P(zz) / 1013 * gw; zz ? ctx.lineTo(xx, Y(zz)) : ctx.moveTo(xx, Y(zz)); } ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = "#dc2626"; ctx.beginPath(); ctx.arc(gx + P(z) / 1013 * gw, Y(z), 5, 0, 7); ctx.fill();
      out.innerHTML = "<b>높이</b> " + z.toFixed(1) + " km<br><b>기압</b> 약 " + Math.round(P(z)) + " hPa (지표의 " + Math.round(P(z) / 10.13) + "%)<br><b>풍선 부피</b> 지표의 약 " + vol.toFixed(1) + "배" +
        "<br><br>위로 갈수록 공기가 희박해 분자 충돌이 줄어 기압이 낮아진다. 바깥 기압이 낮아지면 풍선 속 공기가 팽창한다." + (vol > 6 ? "<br><b style='color:var(--bad)'>풍선이 곧 터질 듯!</b>" : "");
    }
    sZ.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 2. 해 보기: 고기압과 저기압의 연직 운동 ---------- */
  (function () {
    var cv = $("sim-vm"); if (!cv) return;
    var out = $("vm-out"), g, P = [];
    for (var i = 0; i < 70; i++) P.push({ s: Math.random(), side: i % 2 });
    function size() { g = S.fit(cv, 0.48); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      var ctx = g.ctx, W = g.w, H = g.h, bot = H - 30, top = 30, ax = W * 0.27, bx = W * 0.73;
      ctx.fillStyle = "#dbeafe"; ctx.fillRect(0, 0, W, H); ctx.fillStyle = "#65a30d"; ctx.fillRect(0, bot, W, H - bot);
      // 구름 (저기압 위)
      ctx.fillStyle = "#fff"; [[-40, 0], [0, -14], [40, 0]].forEach(function (o) { ctx.beginPath(); ctx.ellipse(bx + o[0], top + 38 + o[1], 40, 20, 0, 0, 7); ctx.fill(); });
      P.forEach(function (p) {
        p.s += dt * 0.15; if (p.s > 1) p.s -= 1;
        var cx = p.side ? bx : ax, loopX = Math.sin(p.s * Math.PI * 2) * 70, loopY;
        if (p.side) loopY = bot - 10 - p.s * (bot - top - 40); else loopY = top + 40 + p.s * (bot - top - 50);
        ctx.fillStyle = p.side ? "#2563eb" : "#ea580c"; ctx.beginPath(); ctx.arc(cx + (p.s * 7 % 1 - 0.5) * 80, loopY, 3, 0, 7); ctx.fill();
      });
      function bars(x, up, down, lab) {
        var bw = 16, base = H * 0.55;
        ctx.fillStyle = "#16a34a"; ctx.fillRect(x - bw - 30, base - up * 60, bw, up * 60); ctx.fillStyle = "#dc2626"; ctx.fillRect(x - 30 + 4, base - down * 60, bw, down * 60);
        ctx.fillStyle = "#111"; ctx.font = S.font(10, true); ctx.fillText("기압경도력↑", x - bw - 60, base + 14); ctx.fillText("중력↓", x - 22, base + 14);
      }
      S.tag(ctx, "A: 지상 고기압", ax, bot + 20, { align: "center", size: 13, bg: "#c2410c" });
      S.tag(ctx, "B: 지상 저기압", bx, bot + 20, { align: "center", size: 13, bg: "#1d4ed8" });
      S.arrow(ctx, ax + 90, top + 30, ax + 90, bot - 20, "#c2410c", 4); S.tag(ctx, "하강 기류", ax + 96, H / 2, { size: 12, bg: "#c2410c" });
      S.arrow(ctx, bx - 90, bot - 20, bx - 90, top + 60, "#1d4ed8", 4); S.tag(ctx, "상승 기류", bx - 170, H / 2, { size: 12, bg: "#1d4ed8" });
      out.innerHTML = "<b>A (고기압)</b>: 중력 &gt; 연직 기압 경도력 → <b>하강 기류</b> → 단열 압축, 맑은 날씨<br><b>B (저기압)</b>: 연직 기압 경도력 &gt; 중력 → <b>상승 기류</b> → 단열 팽창, 구름·비<br><br>정역학 평형이 깨진 곳에서 대기의 연직 운동이 일어난다.";
    });
  })();

  /* ---------- 3. 탐구: 회전 원판으로 전향 효과 실험하기 ---------- */
  (function () {
    var cv = $("sim-disk"); if (!cv) return;
    var sW = $("dk-w"), bRoll = $("dk-roll"), bClr = $("dk-clear"), out = $("dk-out"), g, ang = 0, balls = [], trails = [];
    function size() { g = S.fit(cv, 0.6); }
    size(); window.addEventListener("resize", size);
    bRoll.addEventListener("click", function () { balls.push({ t: 0, a0: ang, w: +sW.value, tr: [] }); });
    bClr.addEventListener("click", function () { balls = []; trails = []; });
    S.loop(function (dt) {
      var w = +sW.value; // 회전 속도 (+: 시계 반대)
      $("dk-wv").textContent = w === 0 ? "정지" : (w > 0 ? "시계 반대 방향 " : "시계 방향 ") + Math.abs(w).toFixed(1);
      ang -= w * dt; // 화면에서 시계 반대 = 음의 각
      var ctx = g.ctx, W = g.w, H = g.h, R = Math.min(W * 0.42, H * 0.46), cx = W * 0.45, cy = H / 2, v = R / 1.5;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#f1f5f9"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.strokeStyle = "#cbd5e1"; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + R, cy); ctx.stroke();
      balls.forEach(function (b) {
        b.t += dt; var r = v * b.t; if (r > R) return;
        // 관성계: 처음 방향(오른쪽)으로 직진. 원판(종이) 좌표로 기록
        var rel = -(ang - b.a0); // 원판 기준 각
        b.tr.push([r * Math.cos(rel), r * Math.sin(rel)]);
      });
      // 종이(원판과 함께 도는 기록)를 화면에는 원판 고정 좌표로 표시
      balls.forEach(function (b) {
        ctx.strokeStyle = b.w === 0 ? "#64748b" : b.w > 0 ? "#2563eb" : "#dc2626"; ctx.lineWidth = 3; ctx.beginPath();
        b.tr.forEach(function (p, i) { var x = cx + p[0], y = cy + p[1]; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); ctx.lineWidth = 1;
      });
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
      S.tag(ctx, "종이 위에 남은 쇠구슬의 자국 (원판과 함께 도는 관찰자 시점)", 8, H - 8, { size: 11 });
      S.tag(ctx, "굴린 방향 →", cx + 10, cy - 8, { size: 11, bg: "rgba(0,0,0,.6)" });
      out.innerHTML = "<b>회전</b> " + $("dk-wv").textContent + "<br>정지: 직선<br>시계 반대 방향(북반구): 진행 방향의 <b>오른쪽</b>으로 휨<br>시계 방향(남반구): <b>왼쪽</b>으로 휨<br>빠르게 돌릴수록(고위도일수록) 더 많이 휨";
    });
  })();
})();
