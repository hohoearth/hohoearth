/* III-2 지구 열수지 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 태양 고도와 하늘의 색 (산란), 굴절 ---------- */
  (function () {
    var cv = $("sim-sky"); if (!cv) return;
    var sA = $("sky-a"), out = $("sky-out"), g;
    function size() { g = S.fit(cv, 0.45); draw(); }
    function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
    function rgb(c) { return "rgb(" + c.map(Math.round).join(",") + ")"; }
    function draw() {
      if (!g) return;
      var alt = +sA.value; $("sky-av").textContent = alt + "°";
      var ctx = g.ctx, W = g.w, H = g.h, hz = H * 0.78;
      var path = 1 / Math.max(0.03, Math.sin(Math.max(alt, 0.5) * Math.PI / 180)); // 대기를 지나는 상대 길이
      var k = Math.min(1, (path - 1) / 14); // 0: 머리 위, 1: 지평선
      var top = mix([40, 110, 220], [30, 40, 90], k), low = mix([150, 200, 250], [255, 120, 50], k);
      var grd = ctx.createLinearGradient(0, 0, 0, hz); grd.addColorStop(0, rgb(top)); grd.addColorStop(1, rgb(low));
      ctx.fillStyle = grd; ctx.fillRect(0, 0, W, hz);
      ctx.fillStyle = rgb(mix([40, 90, 140], [60, 40, 50], k)); ctx.fillRect(0, hz, W, H - hz);
      var sunCol = rgb(mix([255, 255, 240], [255, 90, 40], k));
      var appAlt = alt < 0.6 ? alt + 0.55 : alt; // 지평선 근처에서 굴절로 약 0.5° 떠 보임
      var sy = hz - (appAlt / 90) * (hz - 30) - 2, sx = W * 0.5;
      ctx.fillStyle = sunCol; ctx.beginPath(); ctx.arc(sx, sy, 20, 0, 7); ctx.fill();
      if (alt < 0.6) {
        var realY = hz - (alt / 90) * (hz - 30) + 22;
        ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.arc(sx, realY, 20, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        S.tag(ctx, "실제 태양 위치 (수평선 아래)", sx + 26, realY + 4, { size: 11 });
        S.tag(ctx, "굴절 때문에 보이는 태양", sx + 26, sy, { size: 11, bg: "rgba(150,40,0,.85)" });
      }
      // 대기층 통과 길이 도식
      ctx.strokeStyle = "rgba(255,255,255,.5)"; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(W * 0.08, hz); ctx.lineTo(W * 0.08 + 120 * Math.cos(alt * Math.PI / 180), hz - 120 * Math.sin(Math.max(alt, 3) * Math.PI / 180)); ctx.stroke(); ctx.setLineDash([]);
      out.innerHTML = "<b>태양 고도</b> " + alt + "°<br><b>햇빛이 지나는 대기 두께</b> 머리 위의 약 " + Math.min(38, path).toFixed(1) + "배<br>" +
        (alt > 30 ? "파장이 짧은 <b>파란빛</b>이 잘 산란되어 하늘이 파랗게 보인다." : alt > 5 ? "대기를 지나는 거리가 길어져 하늘이 옅어지고 태양이 노랗게 보인다." : "파란빛은 도중에 대부분 산란되어 사라지고 <b>붉은빛</b>만 남아 태양과 하늘이 붉게 보인다.");
    }
    sA.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 2. 지구 평균 열수지 (해 보기) ---------- */
  (function () {
    var box = $("budget-map"); if (!box) return;
    var info = $("budget-info");
    var EQ = {
      earth: "<b>지구 전체</b><br>들어온 에너지: 태양 복사 <b>100</b><br>나간 에너지: 산란·반사 30 (대기·구름 23 + 지표 7) + 지구 복사 70 (대기·구름 58 + 대기의 창 12) = <b>100</b><br>→ 받은 만큼 내보내 평균 기온이 거의 일정하다.",
      atm: "<b>대기</b><br>흡수: 태양에서 23 + 지표 복사 104 + 잠열 24 + 대류·전도 5 = <b>156</b><br>방출: 우주로 58 + 지표로 재복사 98 = <b>156</b>",
      sfc: "<b>지표</b><br>흡수: 태양에서 47 + 대기의 재복사 98 = <b>145</b><br>방출: 지표 복사 116 + 잠열 24 + 대류·전도 5 = <b>145</b><br>※ 지표 → 대기 이동 중 잠열(24)의 몫이 가장 크다.",
      all: "버튼을 눌러 지구 전체, 대기, 지표 각각에서 들어오고 나가는 에너지를 더해 보자."
    };
    function show(k) {
      box.querySelectorAll("[data-set]").forEach(function (el) {
        var on = k === "all" || el.dataset.set.split(" ").indexOf(k) >= 0;
        el.style.opacity = on ? 1 : 0.15;
      });
      document.querySelectorAll("#budget-btns .chip").forEach(function (b) { b.classList.toggle("on", b.dataset.k === k); });
      info.innerHTML = EQ[k];
    }
    document.querySelectorAll("#budget-btns .chip").forEach(function (b) { b.addEventListener("click", function () { show(b.dataset.k); }); });
    show("all");
  })();

  /* ---------- 3. 온실 기체의 양과 지표 온도 ---------- */
  (function () {
    var cv = $("sim-gh"); if (!cv) return;
    var sE = $("gh-e"), out = $("gh-out"), g, phs = [];
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt, now) {
      var e = +sE.value / 100; $("gh-ev").textContent = Math.round(e * 100) + "%";
      var Te = 255, Ts = Te * Math.pow(2 / (2 - e), 0.25), C = Ts - 273.15;
      var ctx = g.ctx, W = g.w, H = g.h, gy = H * 0.82, ay = H * 0.38;
      ctx.fillStyle = "#0b1d33"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(148,163,184," + (0.08 + e * 0.35) + ")"; ctx.fillRect(0, ay - 26, W, 52);
      S.tag(ctx, "온실 기체를 포함한 대기층", W - 8, ay - 30, { align: "right", size: 11 });
      var tcol = C < 0 ? "#60a5fa" : C < 20 ? "#4ade80" : "#f97316";
      ctx.fillStyle = tcol; ctx.fillRect(0, gy, W, H - gy);
      // 햇빛 (노랑) 내려옴
      for (var i = 0; i < 4; i++) { var x = W * (0.1 + i * 0.08); S.arrow(ctx, x, 6, x + 20, gy - 4, "#facc15", 3); }
      S.tag(ctx, "태양 복사", W * 0.1, 26, { size: 11, bg: "rgba(120,90,0,.9)" });
      // 적외선 광자
      if (Math.random() < dt * 14) phs.push({ x: W * (0.45 + Math.random() * 0.5), y: gy - 2, vy: -1, life: 0 });
      phs = phs.filter(function (p) {
        p.life += dt; p.y += p.vy * dt * 160;
        if (p.vy < 0 && Math.abs(p.y - ay) < 4 && !p.done) { p.done = true; if (Math.random() < e) { p.vy = Math.random() < 0.5 ? 1 : -1; p.re = true; } }
        ctx.fillStyle = p.re ? "#f87171" : "#fb923c"; ctx.beginPath(); ctx.arc(p.x + Math.sin(p.life * 20) * 3, p.y, 3, 0, 7); ctx.fill();
        return p.y > -10 && p.y < gy + 2;
      });
      S.tag(ctx, "지표에서 나가는 적외선 (주황) · 대기가 흡수 후 다시 내보낸 적외선 (빨강)", 8, H - 8, { size: 11 });
      S.tag(ctx, "지표 평균 기온 " + C.toFixed(0) + " °C", W - 8, gy - 8, { align: "right", size: 14, bg: "rgba(0,0,0,.65)" });
      out.innerHTML = "<b>대기가 적외선을 흡수하는 비율</b> " + Math.round(e * 100) + "%<br><b>지표 평균 기온</b> 약 " + C.toFixed(1) + " °C" +
        "<br><br>" + (e < 0.05 ? "온실 효과가 없으면 약 −18 °C로 매우 춥다." : e < 0.75 ? "온실 효과가 약해 지금보다 춥다." : e < 0.82 ? "지금의 지구와 비슷하다 (약 15 °C)." : "온실 기체가 늘어 대기의 재복사가 많아지고 지표 온도가 높아진다.") +
        "<br><span style='font-size:.75rem;color:var(--muted)'>대기를 한 층으로 단순화한 모형</span>";
    });
  })();
})();
