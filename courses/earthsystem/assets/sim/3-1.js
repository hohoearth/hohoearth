/* III-1 지구의 대기와 생명체 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 태양 복사·지구 복사와 대기의 선택적 흡수 ---------- */
  (function () {
    var cv = $("sim-spec"); if (!cv) return;
    var sL = $("sp-l"), out = $("sp-out"), g;
    var GAS = {
      o3: { n: "오존·산소", c: "#a78bfa", f: function (l) { return l < 0.31 ? 1 : l < 0.34 ? (0.34 - l) / 0.03 : 0; } },
      h2o: { n: "수증기", c: "#38bdf8", f: function (l) { return Math.max(bump(l, 1.4, 0.08, 0.5), bump(l, 1.9, 0.1, 0.7), bump(l, 2.7, 0.25, 0.95), bump(l, 6.3, 1.3, 1), l > 20 ? 1 : l > 16 ? (l - 16) / 4 : 0); } },
      co2: { n: "이산화 탄소", c: "#f97316", f: function (l) { return Math.max(bump(l, 2.7, 0.12, 0.8), bump(l, 4.3, 0.25, 1), bump(l, 15, 2.2, 1)); } },
      ch4: { n: "메테인·산화 이질소", c: "#22c55e", f: function (l) { return Math.max(bump(l, 3.3, 0.15, 0.5), bump(l, 7.7, 0.4, 0.8), bump(l, 4.5, 0.15, 0.6)); } }
    };
    function bump(l, c, w, a) { var d = (Math.log(l) - Math.log(c)) / (w / c); return a * Math.exp(-d * d); }
    function total(l) { var p = 1; Object.keys(GAS).forEach(function (k) { p *= 1 - GAS[k].f(l); }); return 1 - p; }
    function planck(l, T) { var x = 14388 / (l * T); return 1 / (Math.pow(l, 5) * (Math.exp(x) - 1)); }
    function size() { g = S.fit(cv, 0.52); draw(); }
    var lmin = 0.1, lmax = 60;
    function draw() {
      if (!g) return;
      var L = 50, R = 16, ctx = g.ctx, W = g.w, H = g.h, top = 16, mid = H * 0.48, bot = H - 30;
      function X(l) { return L + Math.log(l / lmin) / Math.log(lmax / lmin) * (W - L - R); }
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      // 영역 띠
      [[0.1, 0.4, "자외선", "#7c3aed"], [0.4, 0.7, "가시광선", "#16a34a"], [0.7, 60, "적외선", "#b91c1c"]].forEach(function (b) {
        ctx.fillStyle = b[3]; ctx.globalAlpha = .18; ctx.fillRect(X(b[0]), top, X(b[1]) - X(b[0]), bot - top); ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff"; ctx.font = S.font(11, true); ctx.fillText(b[2], X(Math.sqrt(b[0] * Math.min(b[1], 10))) - 16, top + 12);
      });
      // 복사 세기 (각각 최댓값으로 정규화)
      var ms = 0, me = 0, l;
      for (l = lmin; l < lmax; l *= 1.02) { ms = Math.max(ms, planck(l, 5800)); me = Math.max(me, planck(l, 288)); }
      [[5800, ms, "#facc15", "태양 복사 (약 5800 K)"], [288, me, "#f87171", "지구 복사 (약 288 K)"]].forEach(function (c) {
        ctx.strokeStyle = c[2]; ctx.lineWidth = 2.5; ctx.beginPath(); var first = true;
        for (l = lmin; l < lmax; l *= 1.02) { var y = mid - planck(l, c[0]) / c[1] * (mid - top - 22); if (first) { ctx.moveTo(X(l), y); first = false; } else ctx.lineTo(X(l), y); }
        ctx.stroke(); ctx.lineWidth = 1;
      });
      S.tag(ctx, "태양 복사", X(0.5), top + 32, { align: "center", size: 11, bg: "rgba(120,90,0,.9)" });
      S.tag(ctx, "지구 복사", X(10), top + 32, { align: "center", size: 11, bg: "rgba(150,30,30,.9)" });
      // 흡수율
      ctx.fillStyle = "rgba(255,255,255,.06)"; ctx.fillRect(L, mid + 8, W - L - R, bot - mid - 8);
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.beginPath(); ctx.moveTo(X(lmin), bot);
      for (l = lmin; l < lmax; l *= 1.01) ctx.lineTo(X(l), bot - total(l) * (bot - mid - 12));
      ctx.lineTo(X(lmax), bot); ctx.fill();
      S.tag(ctx, "대기 전체의 흡수율", L + 4, mid + 24, { size: 11, bg: "rgba(0,0,0,.7)" });
      ctx.strokeStyle = "#22d3ee"; ctx.setLineDash([4, 4]); ctx.strokeRect(X(8), mid + 8, X(13) - X(8), bot - mid - 8); ctx.setLineDash([]);
      S.tag(ctx, "대기의 창", X(10), bot - 6, { align: "center", size: 11, bg: "#0e7490" });
      ctx.fillStyle = "rgba(255,255,255,.6)"; ctx.font = S.font(11);
      [0.1, 0.3, 0.5, 1, 3, 10, 30].forEach(function (v) { ctx.fillText(v, X(v) - 6, H - 14); }); ctx.fillText("파장 (μm, 로그 눈금)", W / 2 - 40, H - 2);
      var l0 = +sL.value; l0 = Math.pow(10, l0);
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(l0), top); ctx.lineTo(X(l0), bot); ctx.stroke(); ctx.lineWidth = 1;
      var region = l0 < 0.4 ? "자외선" : l0 < 0.7 ? "가시광선" : "적외선", who = [];
      Object.keys(GAS).forEach(function (k) { var v = GAS[k].f(l0); if (v > 0.25) who.push(GAS[k].n + " (" + Math.round(v * 100) + "%)"); });
      out.innerHTML = "<b>파장</b> " + (l0 < 1 ? l0.toFixed(2) : l0.toFixed(1)) + " μm · " + region + "<br><b>대기의 흡수율</b> 약 " + Math.round(total(l0) * 100) + "%<br><b>흡수하는 기체</b> " + (who.length ? who.join(", ") : "거의 없음 → 대부분 통과") +
        (l0 >= 8 && l0 <= 13 ? "<br>→ <b>대기의 창</b>: 지구 복사가 우주로 빠져나간다" : "");
    }
    sL.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 2. 생명 가능 지대 ---------- */
  (function () {
    var cv = $("sim-hz"); if (!cv) return;
    var sM = $("hz-m"), sLum = $("hz-l"), out = $("hz-out"), g;
    var PL = [["수성", .39], ["금성", .72], ["지구", 1], ["화성", 1.52], ["목성", 5.2], ["토성", 9.54]];
    function size() { g = S.fit(cv, 0.42); draw(); }
    function draw() {
      if (!g) return;
      var m = +sM.value, boost = +sLum.value / 100, Lum = Math.pow(m, 3.5) * boost;
      $("hz-mv").textContent = "태양의 " + m.toFixed(1) + "배"; $("hz-lv").textContent = Math.round(boost * 100) + "%";
      var rin = Math.sqrt(Lum / 1.1), rout = Math.sqrt(Lum / 0.53);
      var ctx = g.ctx, W = g.w, H = g.h, L = 30, R = 20, rmin = 0.05, rmax = 40, y0 = H * 0.55;
      function X(r) { return L + Math.log(r / rmin) / Math.log(rmax / rmin) * (W - L - R); }
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(34,197,94,.35)"; ctx.fillRect(X(rin), y0 - 50, X(rout) - X(rin), 100);
      S.tag(ctx, "생명 가능 지대", (X(rin) + X(rout)) / 2, y0 - 56, { align: "center", size: 12, bg: "#15803d" });
      var sr = 8 + 10 * Math.min(2, m);
      var sg = ctx.createRadialGradient(10, y0, 0, 10, y0, sr * 2); sg.addColorStop(0, m > 1.3 ? "#dbeafe" : m < 0.8 ? "#fdba74" : "#fff7c2"); sg.addColorStop(1, "rgba(250,200,80,0)");
      ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(10, y0, sr * 2, 0, 7); ctx.fill();
      PL.forEach(function (p) { var x = X(p[1]); ctx.fillStyle = p[1] >= rin && p[1] <= rout ? "#86efac" : "#cbd5e1"; ctx.beginPath(); ctx.arc(x, y0, p[0] === "목성" || p[0] === "토성" ? 9 : 5, 0, 7); ctx.fill(); ctx.fillStyle = "#fff"; ctx.font = S.font(11); ctx.fillText(p[0], x - 10, y0 + 24); });
      ctx.fillStyle = "rgba(255,255,255,.55)"; [0.1, 0.3, 1, 3, 10, 30].forEach(function (v) { ctx.fillText(v + " AU", X(v) - 12, H - 6); });
      var inside = PL.filter(function (p) { return p[1] >= rin && p[1] <= rout; }).map(function (p) { return p[0]; });
      out.innerHTML = "<b>중심별의 질량</b> 태양의 " + m.toFixed(1) + "배 → 광도 약 " + Lum.toFixed(2) + "배<br><b>생명 가능 지대</b> 약 " + rin.toFixed(2) + " ~ " + rout.toFixed(2) + " AU" +
        "<br><b>지대 안의 행성</b> " + (inside.length ? inside.join(", ") : "없음") + "<br><br>질량(광도)이 클수록 생명 가능 지대가 <b>멀어지고 넓어진다</b>.";
    }
    [sM, sLum].forEach(function (el) { el.addEventListener("input", draw); });
    size(); window.addEventListener("resize", size);
  })();
})();
