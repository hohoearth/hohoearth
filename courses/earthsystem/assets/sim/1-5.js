/* I-5 지진파와 지구 내부 구조 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. P파와 S파의 전파 ---------- */
  (function () {
    var cv = $("sim-wave"); if (!cv) return;
    var sel = $("wave-medium"), out = $("wave-out"), g;
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt, now) {
      var liquid = sel.value === "liquid", ctx = g.ctx, W = g.w, H = g.h;
      ctx.fillStyle = liquid ? "#0b2236" : "#1a1410"; ctx.fillRect(0, 0, W, H);
      var cols = 34, rows = 5, x0 = 70, x1 = W - 30, dx = (x1 - x0) / (cols - 1), k = 2 * Math.PI / ((x1 - x0) * 0.42), w = 3.2;
      function row(y0, type) {
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var x = x0 + c * dx, y = y0 + r * 13, ph = k * (x - x0) - w * now, amp = 9;
          if (type === "S" && liquid) amp = 0;
          if (type === "P") x += amp * Math.sin(ph); else y += amp * Math.sin(ph);
          ctx.fillStyle = type === "P" ? "#ffcf5a" : "#7cc7ff"; if (type === "S" && liquid) ctx.fillStyle = "#4a6a88";
          ctx.beginPath(); ctx.arc(x, y, 3.2, 0, 7); ctx.fill();
        }
      }
      var yP = H * 0.14, yS = H * 0.6;
      row(yP, "P"); row(yS, "S");
      S.tag(ctx, "P파 (종파)", 8, yP + 4, { size: 13, bg: "rgba(150,110,0,.85)" });
      S.tag(ctx, "S파 (횡파)", 8, yS + 4, { size: 13, bg: "rgba(20,90,150,.85)" });
      S.arrow(ctx, W - 210, yP - 18, W - 110, yP - 18, "#fff", 2); S.tag(ctx, "진행 방향", W - 100, yP - 12, { size: 11 });
      S.arrow(ctx, 40, yP + 30, 64, yP + 30, "#ffcf5a", 2); S.arrow(ctx, 64, yP + 30, 40, yP + 30, "#ffcf5a", 2);
      S.arrow(ctx, 52, yS + 10, 52, yS + 44, "#7cc7ff", 2); S.arrow(ctx, 52, yS + 44, 52, yS + 10, "#7cc7ff", 2);
      if (liquid) S.tag(ctx, "S파는 액체를 통과하지 못한다", W / 2, yS + 36, { align: "center", size: 14, bg: "rgba(150,30,30,.9)" });
      out.innerHTML = "<b>매질</b> " + (liquid ? "액체" : "고체") +
        "<br><b>P파</b> 진동 방향 ∥ 진행 방향 · 고체·액체·기체 모두 통과 · 더 빠름" +
        "<br><b>S파</b> 진동 방향 ⊥ 진행 방향 · 고체만 통과" + (liquid ? " → <b style='color:var(--bad)'>전달되지 않음</b>" : "");
    });
  })();

  /* ---------- 2. 지진 기록과 PS시, 진원 거리 ---------- */
  (function () {
    var cv = $("sim-ps"); if (!cv) return;
    var sd = $("ps-d"), out = $("ps-out"), g, VP = 6, VS = 3.5, VL = 2.8;
    function size() { g = S.fit(cv, 0.6); draw(); }
    function noise(t) { return Math.sin(t * 37.1) * 0.3 + Math.sin(t * 91.7) * 0.2 + Math.sin(t * 13.3) * 0.15; }
    function draw() {
      if (!g) return;
      var D = +sd.value, tP = D / VP, tS = D / VS, tL = D / VL, ctx = g.ctx, W = g.w, H = g.h;
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, 0, W, H);
      // 지진 기록 (위)
      var L = 50, R = 20, h1 = H * 0.42, y0 = h1 * 0.55, tMax = 180, X = function (t) { return L + t / tMax * (W - L - R); };
      ctx.strokeStyle = "#e5e7eb"; for (var tt = 0; tt <= tMax; tt += 20) { ctx.beginPath(); ctx.moveTo(X(tt), 10); ctx.lineTo(X(tt), h1 - 10); ctx.stroke(); }
      ctx.fillStyle = "#6b7280"; ctx.font = S.font(11); for (tt = 0; tt <= tMax; tt += 40) ctx.fillText(tt + " s", X(tt) - 8, h1 + 4);
      ctx.strokeStyle = "#111"; ctx.lineWidth = 1.2; ctx.beginPath();
      for (var px = L; px <= W - R; px++) {
        var t = (px - L) / (W - L - R) * tMax, a = 0.6 * noise(t);
        if (t > tP) a += 6 * Math.exp(-(t - tP) * 0.25) * Math.sin((t - tP) * 9);
        if (t > tS) a += 14 * Math.exp(-(t - tS) * 0.18) * Math.sin((t - tS) * 6);
        if (t > tL) a += 26 * Math.exp(-(t - tL) * 0.08) * Math.sin((t - tL) * 2.5);
        var y = y0 - a; px === L ? ctx.moveTo(px, y) : ctx.lineTo(px, y);
      }
      ctx.stroke(); ctx.lineWidth = 1;
      function mark(t, txt, col) { if (t > tMax) return; ctx.strokeStyle = col; ctx.setLineDash([4, 3]); ctx.beginPath(); ctx.moveTo(X(t), 8); ctx.lineTo(X(t), h1 - 12); ctx.stroke(); ctx.setLineDash([]); S.tag(ctx, txt, X(t) + 3, 22, { size: 11, bg: col }); }
      mark(tP, "P파 도달", "#b45309"); mark(tS, "S파 도달", "#1d4ed8"); mark(tL, "표면파", "#7c3aed");
      if (tS < tMax) { ctx.strokeStyle = "#059669"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(tP), h1 - 18); ctx.lineTo(X(tS), h1 - 18); ctx.stroke(); ctx.lineWidth = 1; S.tag(ctx, "PS시", (X(tP) + X(tS)) / 2, h1 - 22, { align: "center", size: 11, bg: "#059669" }); }
      // 주시 곡선 (아래)
      var top = h1 + 24, bot = H - 30, dMax = 600, tM = 220;
      function XD(d) { return L + d / dMax * (W - L - R); } function YT(t) { return bot - t / tM * (bot - top); }
      ctx.strokeStyle = "#e5e7eb"; for (var d = 0; d <= dMax; d += 100) { ctx.beginPath(); ctx.moveTo(XD(d), top); ctx.lineTo(XD(d), bot); ctx.stroke(); }
      ctx.fillStyle = "#6b7280"; for (d = 0; d <= dMax; d += 100) ctx.fillText(d, XD(d) - 8, bot + 14);
      ctx.fillText("진원 거리 (km)", W / 2 - 30, H - 2); ctx.fillText("시간(s)", 4, top + 8);
      [[VP, "#b45309", "P파"], [VS, "#1d4ed8", "S파"]].forEach(function (v) { ctx.strokeStyle = v[1]; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(XD(0), YT(0)); ctx.lineTo(XD(dMax), YT(dMax / v[0])); ctx.stroke(); ctx.lineWidth = 1; S.tag(ctx, v[2], XD(dMax) - 4, Math.max(top + 14, YT(dMax / v[0]) + 4), { align: "right", size: 11, bg: v[1] }); });
      ctx.strokeStyle = "#059669"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(XD(D), YT(tP)); ctx.lineTo(XD(D), YT(tS)); ctx.stroke(); ctx.lineWidth = 1;
      ctx.fillStyle = "#059669"; ctx.beginPath(); ctx.arc(XD(D), YT(tP), 4, 0, 7); ctx.arc(XD(D), YT(tS), 4, 0, 7); ctx.fill();
      var ps = tS - tP, k = VP * VS / (VP - VS);
      out.innerHTML = "<b>관측소의 진원 거리</b> " + D + " km<br><b>P파 도달</b> " + tP.toFixed(1) + " s · <b>S파 도달</b> " + tS.toFixed(1) + " s<br><b>PS시</b> t = " + ps.toFixed(1) + " s" +
        "<br><br>d = (V<sub>P</sub>·V<sub>S</sub>)/(V<sub>P</sub>−V<sub>S</sub>) × t<br>= (" + VP + "×" + VS + ")/(" + VP + "−" + VS + ") × " + ps.toFixed(1) + " ≈ <b>" + Math.round(k * ps) + " km</b>";
    }
    sd.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 3. 직접파와 굴절파, 교차 거리 ---------- */
  (function () {
    var cv = $("sim-crust"); if (!cv) return;
    var sDep = $("cr-d"), sx = $("cr-x"), out = $("cr-out"), g, V1 = 6.0, V2 = 8.0;
    function size() { g = S.fit(cv, 0.62); draw(); }
    function draw() {
      if (!g) return;
      var d = +sDep.value, x = +sx.value, th = Math.asin(V1 / V2), xc = 2 * d * Math.tan(th), l = 2 * d * Math.sqrt((V2 + V1) / (V2 - V1));
      $("cr-dv").textContent = d + " km"; $("cr-xv").textContent = x + " km";
      var ctx = g.ctx, W = g.w, H = g.h, L = 50, R = 20, XM = 400;
      function X(km) { return L + km / XM * (W - L - R); }
      // 단면 (위)
      var top = 16, sh = H * 0.36, Z = function (km) { return top + km / 80 * sh; };
      ctx.fillStyle = "#e9d8b8"; ctx.fillRect(0, top, W, Z(d) - top);
      ctx.fillStyle = "#d9894d"; ctx.fillRect(0, Z(d), W, top + sh - Z(d));
      ctx.strokeStyle = "#5a3a1a"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, Z(d)); ctx.lineTo(W, Z(d)); ctx.stroke(); ctx.lineWidth = 1;
      S.tag(ctx, "지각 V₁ = 6.0 km/s", W - 10, top + 18, { align: "right", size: 11 }); S.tag(ctx, "맨틀 V₂ = 8.0 km/s", W - 10, Z(d) + 22, { align: "right", size: 11 }); S.tag(ctx, "모호면", 8, Z(d) - 4, { size: 11, bg: "#5a3a1a" });
      ctx.fillStyle = "#c0392b"; ctx.beginPath(); ctx.arc(X(0), top + 2, 6, 0, 7); ctx.fill();
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.moveTo(X(x) - 7, top + 2); ctx.lineTo(X(x) + 7, top + 2); ctx.lineTo(X(x), top - 9); ctx.fill();
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), top + 5); ctx.lineTo(X(x), top + 5); ctx.stroke();
      if (x >= xc) { ctx.strokeStyle = "#1d4ed8"; ctx.beginPath(); ctx.moveTo(X(0), top + 2); ctx.lineTo(X(xc / 2), Z(d)); ctx.lineTo(X(x - xc / 2), Z(d)); ctx.lineTo(X(x), top + 2); ctx.stroke(); }
      ctx.lineWidth = 1;
      // 주시 곡선 (아래)
      var gt = top + sh + 26, gb = H - 28, TM = 70;
      function Y(t) { return gb - t / TM * (gb - gt); }
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, top + sh, W, H - top - sh);
      ctx.strokeStyle = "#e5e7eb"; ctx.fillStyle = "#6b7280"; ctx.font = S.font(11);
      for (var k = 0; k <= XM; k += 50) { ctx.beginPath(); ctx.moveTo(X(k), gt); ctx.lineTo(X(k), gb); ctx.stroke(); ctx.fillText(k, X(k) - 8, gb + 14); }
      for (var t = 0; t <= TM; t += 10) ctx.fillText(t, 20, Y(t) + 4);
      ctx.fillText("진앙 거리 (km)", W / 2 - 30, H - 2); ctx.fillText("도달 시간(s)", 4, gt - 6);
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(XM), Y(XM / V1)); ctx.stroke();
      var ti = 2 * d * Math.cos(th) / V1;
      ctx.strokeStyle = "#1d4ed8"; ctx.beginPath(); ctx.moveTo(X(xc), Y(xc / V2 + ti)); ctx.lineTo(X(XM), Y(XM / V2 + ti)); ctx.stroke(); ctx.lineWidth = 1;
      ctx.strokeStyle = "#059669"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(l), gt); ctx.lineTo(X(l), gb); ctx.stroke(); ctx.setLineDash([]);
      S.tag(ctx, "교차 거리 l ≈ " + Math.round(l) + " km", X(l) + 4, gt + 14, { size: 11, bg: "#059669" });
      S.tag(ctx, "직접파", X(40), Y(40 / V1) - 6, { size: 11, bg: "#b45309" }); S.tag(ctx, "굴절파", X(XM) - 4, Y(XM / V2 + ti) + 18, { align: "right", size: 11, bg: "#1d4ed8" });
      var tD = x / V1, tR = x >= xc ? x / V2 + ti : null;
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(X(x), Y(tD), 4, 0, 7); ctx.fill(); if (tR) { ctx.beginPath(); ctx.arc(X(x), Y(tR), 4, 0, 7); ctx.fill(); }
      var first = !tR || tD <= tR ? "직접파" : "굴절파";
      out.innerHTML = "<b>관측소</b> 진앙에서 " + x + " km<br><b>직접파</b> " + tD.toFixed(1) + " s" + (tR ? " · <b>굴절파</b> " + tR.toFixed(1) + " s" : " · 굴절파 아직 도달 못함") +
        "<br>→ <b>" + first + "</b>가 먼저 도착<br><br><b>교차 거리</b> l ≈ " + Math.round(l) + " km<br>d = (l/2)·√((V₂−V₁)/(V₂+V₁))<br>= " + Math.round(l / 2) + " × " + Math.sqrt((V2 - V1) / (V2 + V1)).toFixed(3) + " ≈ <b>" + d + " km</b>";
    }
    [sDep, sx].forEach(function (el) { el.addEventListener("input", draw); });
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 4. 탐구: 지진파 자료로 지각의 두께 구하기 ---------- */
  (function () {
    var cv = $("sim-fit"); if (!cv) return;
    var sk = $("fit-k"), out = $("fit-out"), g;
    var D = [["A", 111, 19.3], ["B", 126, 20.9], ["C", 189, 33.9], ["D", 267, 42.2], ["E", 309, 48.5], ["F", 345, 52.4], ["G", 389, 59.6], ["H", 454, 66.6]];
    function size() { g = S.fit(cv, 0.55); draw(); }
    function draw() {
      if (!g) return;
      var k = +sk.value; // 앞 구간 관측소 수
      $("fit-kv").textContent = D[k - 1][0] + "까지 직접파 / " + D[k][0] + "부터 굴절파";
      var A = D.slice(0, k), B = D.slice(k);
      var sxy = 0, sxx = 0; A.forEach(function (p) { sxy += p[1] * p[2]; sxx += p[1] * p[1]; }); var a1 = sxy / sxx;
      var mx = 0, my = 0; B.forEach(function (p) { mx += p[1]; my += p[2]; }); mx /= B.length; my /= B.length;
      var nx = 0, dx = 0; B.forEach(function (p) { nx += (p[1] - mx) * (p[2] - my); dx += (p[1] - mx) * (p[1] - mx); });
      var a2 = B.length > 1 ? nx / dx : 0.13, b2 = my - a2 * mx;
      var V1 = 1 / a1, V2 = 1 / a2, l = b2 / (a1 - a2), d = l / 2 * Math.sqrt((V2 - V1) / (V2 + V1));
      var ctx = g.ctx, W = g.w, H = g.h, L = 54, R = 20, T = 20, Bm = 40;
      function X(x) { return L + x / 500 * (W - L - R); } function Y(y) { return H - Bm - y / 80 * (H - T - Bm); }
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#e5e7eb"; ctx.fillStyle = "#6b7280"; ctx.font = S.font(11);
      for (var x = 0; x <= 500; x += 100) { ctx.beginPath(); ctx.moveTo(X(x), T); ctx.lineTo(X(x), H - Bm); ctx.stroke(); ctx.fillText(x, X(x) - 8, H - Bm + 14); }
      for (var y = 0; y <= 80; y += 20) { ctx.beginPath(); ctx.moveTo(L, Y(y)); ctx.lineTo(W - R, Y(y)); ctx.stroke(); ctx.fillText(y, 24, Y(y) + 4); }
      ctx.fillText("진앙 거리 (km)", W / 2 - 30, H - 6); ctx.fillText("P파 이동 시간(초)", 4, T - 6);
      ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(500), Y(500 * a1)); ctx.stroke();
      ctx.strokeStyle = "#1d4ed8"; ctx.beginPath(); ctx.moveTo(X(0), Y(b2)); ctx.lineTo(X(500), Y(500 * a2 + b2)); ctx.stroke(); ctx.lineWidth = 1;
      if (l > 0 && l < 500) { ctx.strokeStyle = "#059669"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(X(l), T); ctx.lineTo(X(l), H - Bm); ctx.stroke(); ctx.setLineDash([]); }
      D.forEach(function (p, i) { ctx.fillStyle = i < k ? "#b45309" : "#1d4ed8"; ctx.beginPath(); ctx.arc(X(p[1]), Y(p[2]), 6, 0, 7); ctx.fill(); ctx.fillStyle = "#111"; ctx.font = S.font(11, true); ctx.fillText(p[0], X(p[1]) - 4, Y(p[2]) - 9); });
      S.tag(ctx, "직접파: y = " + a1.toFixed(4) + "x", L + 6, T + 16, { size: 11, bg: "#b45309" });
      S.tag(ctx, "굴절파: y = " + a2.toFixed(4) + "x + " + b2.toFixed(2), L + 6, T + 40, { size: 11, bg: "#1d4ed8" });
      out.innerHTML = "<b>직접파 속도</b> V₁ = 1/" + a1.toFixed(4) + " ≈ " + V1.toFixed(1) + " km/s<br><b>굴절파 속도</b> V₂ = 1/" + a2.toFixed(4) + " ≈ " + V2.toFixed(1) + " km/s<br><b>교차 거리</b> l ≈ " + Math.round(l) + " km<br><b>지각의 두께</b> d = (l/2)√((V₂−V₁)/(V₂+V₁)) ≈ <b>" + d.toFixed(0) + " km</b>";
    }
    sk.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 5. 깊이에 따른 지진파 속도 ---------- */
  (function () {
    var cv = $("sim-vel"); if (!cv) return;
    var sz = $("vel-z"), out = $("vel-out"), g;
    var P = [[0, 6.0], [35, 6.8], [35.1, 8.0], [180, 8.1], [210, 7.8], [240, 8.2], [410, 8.9], [411, 9.1], [660, 10.2], [661, 10.7], [2890, 13.7], [2891, 8.0], [5150, 10.4], [5151, 11.0], [6371, 11.3]];
    var Sv = [[0, 3.5], [35, 3.9], [35.1, 4.5], [180, 4.5], [210, 4.3], [240, 4.6], [410, 4.9], [411, 5.0], [660, 5.6], [661, 6.0], [2890, 7.3], [2891, 0], [5150, 0], [5151, 3.5], [6371, 3.7]];
    function at(tb, z) { for (var i = 1; i < tb.length; i++) if (z <= tb[i][0]) { var a = tb[i - 1], b = tb[i]; return a[1] + (b[1] - a[1]) * (z - a[0]) / (b[0] - a[0]); } return tb[tb.length - 1][1]; }
    var LAY = [[0, 35, "지각", "고체"], [35, 2900, "맨틀", "고체 (연약권은 일부 용융)"], [2900, 5100, "외핵", "액체"], [5100, 6371, "내핵", "고체"]];
    function size() { g = S.fit(cv, 0.6); draw(); }
    function draw() {
      if (!g) return;
      var z = +sz.value, ctx = g.ctx, W = g.w, H = g.h, L = 60, R = 20, T = 20, B = 36;
      function X(v) { return L + v / 15 * (W - L - R); } function Y(dz) { return T + dz / 6371 * (H - T - B); }
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, 0, W, H);
      var bands = [["#e9d8b8", 0, 35], ["#f3c79b", 35, 2900], ["#f5b87a", 2900, 5100], ["#f4dc8a", 5100, 6371]];
      bands.forEach(function (b) { ctx.fillStyle = b[0]; ctx.fillRect(L, Y(b[1]), W - L - R, Math.max(2, Y(b[2]) - Y(b[1]))); });
      ctx.strokeStyle = "rgba(0,0,0,.08)"; ctx.fillStyle = "#6b7280"; ctx.font = S.font(11);
      for (var v = 0; v <= 15; v += 5) { ctx.beginPath(); ctx.moveTo(X(v), T); ctx.lineTo(X(v), H - B); ctx.stroke(); ctx.fillText(v, X(v) - 4, H - B + 14); }
      for (var d = 0; d <= 6000; d += 1000) ctx.fillText(d, 14, Y(d) + 4);
      ctx.fillText("지진파의 속도 (km/s)", W / 2 - 50, H - 4); ctx.fillText("깊이(km)", 4, T - 6);
      [[P, "#b45309", "P파"], [Sv, "#1d4ed8", "S파"]].forEach(function (s) {
        ctx.strokeStyle = s[1]; ctx.lineWidth = 2.5; ctx.beginPath();
        for (var i = 0; i < s[0].length; i++) { var x = X(s[0][i][1]), y = Y(s[0][i][0]); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
        ctx.stroke(); ctx.lineWidth = 1;
      });
      S.tag(ctx, "P파", X(13.7) + 4, Y(2700), { size: 11, bg: "#b45309" }); S.tag(ctx, "S파", X(7.3) + 4, Y(2700), { size: 11, bg: "#1d4ed8" });
      ctx.strokeStyle = "#111"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(L, Y(z)); ctx.lineTo(W - R, Y(z)); ctx.stroke(); ctx.setLineDash([]);
      var vp = at(P, z), vs = at(Sv, z), lay = LAY.filter(function (l) { return z >= l[0] && z <= l[1]; })[0] || LAY[0];
      [["모호면", 35], ["구텐베르크 불연속면", 2900], ["레만 불연속면", 5100]].forEach(function (b) { S.tag(ctx, b[0], W - R - 4, Y(b[1]) - 3, { align: "right", size: 10, bg: "rgba(0,0,0,.55)" }); });
      out.innerHTML = "<b>깊이</b> " + z + " km<br><b>층</b> " + lay[2] + " · 상태: " + lay[3] + "<br><b>P파</b> " + vp.toFixed(1) + " km/s<br><b>S파</b> " + (vs < 0.1 ? "<b style='color:var(--bad)'>통과 못함</b>" : vs.toFixed(1) + " km/s") +
        (z > 150 && z < 260 ? "<br><br>※ 이 깊이에서 속도가 약간 느려진다 (연약권: 일부 용융, 유동성)" : "");
    }
    sz.addEventListener("input", draw);
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 6. 지진파의 경로와 암영대 ---------- */
  (function () {
    var cv = $("sim-shadow"); if (!cv) return;
    var cP = $("sh-p"), cS = $("sh-s"), g;
    function size() { g = S.fit(cv, 0.78); draw(); }
    function draw() {
      if (!g) return;
      var ctx = g.ctx, W = g.w, H = g.h, cx = W / 2, cy = H / 2 + 6, R = Math.min(W, H) * 0.42, rc = R * 0.546, ri = R * 0.19;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#c46a3a"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.fill();
      ctx.fillStyle = "#e8b04a"; ctx.beginPath(); ctx.arc(cx, cy, rc, 0, 7); ctx.fill();
      ctx.fillStyle = "#f4dc8a"; ctx.beginPath(); ctx.arc(cx, cy, ri, 0, 7); ctx.fill();
      function pt(deg, r) { var a = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }
      function band(a0, a1, col, rr) { [1, -1].forEach(function (s) { ctx.strokeStyle = col; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, rr, (s * a0 - 90) * Math.PI / 180, (s * a1 - 90) * Math.PI / 180, s < 0); ctx.stroke(); }); ctx.lineWidth = 1; }
      var src = pt(0, R);
      function mantleRay(D, col) {
        [1, -1].forEach(function (s) {
          var e = pt(s * D, R), rb = R - (R - rc) * Math.pow(D / 103, 1.3), half = D / 2 * Math.PI / 180;
          var rcp = 2 * rb - R * Math.cos(half), c = pt(s * D / 2, rcp);
          ctx.strokeStyle = col; ctx.beginPath(); ctx.moveTo(src[0], src[1]); ctx.quadraticCurveTo(c[0], c[1], e[0], e[1]); ctx.stroke();
        });
      }
      if (cS.checked) {
        band(103, 180, "rgba(80,140,255,.9)", R + 9);
        for (var D = 15; D <= 100; D += 17) mantleRay(D, "rgba(120,180,255,.75)");
        [1, -1].forEach(function (s) { var e = pt(s * 22, rc); ctx.strokeStyle = "rgba(120,180,255,.75)"; ctx.beginPath(); ctx.moveTo(src[0], src[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); ctx.fillStyle = "#7cc7ff"; ctx.font = S.font(14, true); ctx.fillText("✕", e[0] - 5, e[1] + 5); });
      }
      if (cP.checked) {
        band(103, 142, "rgba(255,90,60,.95)", R + 20);
        for (var D2 = 10; D2 <= 103; D2 += 15.5) mantleRay(D2, "rgba(255,210,90,.8)");
        [[150, 14], [160, 9], [172, 4], [180, 0]].forEach(function (q) {
          [1, -1].forEach(function (s) {
            var din = s * q[1], e1 = pt(din, rc), e2 = pt(s * (q[0] - q[1]), rc), o = pt(s * q[0], R), mid = pt(s * q[0] / 2, rc * 0.25);
            ctx.strokeStyle = "rgba(255,210,90,.8)"; ctx.beginPath(); ctx.moveTo(src[0], src[1]); ctx.lineTo(e1[0], e1[1]); ctx.quadraticCurveTo(mid[0], mid[1], e2[0], e2[1]); ctx.lineTo(o[0], o[1]); ctx.stroke();
          });
        });
        [1, -1].forEach(function (s) { var e1 = pt(s * 18, rc), m = pt(s * 60, ri), o = pt(s * 110, R); ctx.strokeStyle = "rgba(255,255,255,.7)"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(src[0], src[1]); ctx.lineTo(e1[0], e1[1]); ctx.lineTo(m[0], m[1]); ctx.lineTo(o[0], o[1]); ctx.stroke(); ctx.setLineDash([]); });
      }
      ctx.fillStyle = "#ff3d1f"; ctx.beginPath(); ctx.arc(src[0], src[1], 7, 0, 7); ctx.fill();
      S.tag(ctx, "진앙", src[0], src[1] - 12, { align: "center", size: 12, bg: "#c0392b" });
      ["0°", "103°", "142°", "180°"].forEach(function (t, i) { var deg = [0, 103, 142, 180][i]; var p = pt(deg, R + 42); S.tag(ctx, t, p[0], p[1] + 6, { align: "center", size: 11, bg: "rgba(0,0,0,.6)" }); });
      S.tag(ctx, "맨틀", cx, cy - R * 0.72, { align: "center", size: 12 }); S.tag(ctx, "외핵 (액체)", cx, cy - rc * 0.55, { align: "center", size: 12 }); S.tag(ctx, "내핵", cx, cy + 6, { align: "center", size: 11 });
      if (cP.checked) S.tag(ctx, "P파 암영대 103°~142°", 10, H - 34, { size: 12, bg: "rgba(200,60,40,.9)" });
      if (cS.checked) S.tag(ctx, "S파 암영대 103°~180°", 10, H - 8, { size: 12, bg: "rgba(40,90,200,.9)" });
      if (cP.checked) S.tag(ctx, "점선: 약 110°에 도달하는 약한 P파 (레만의 발견)", W - 10, H - 8, { align: "right", size: 11 });
    }
    [cP, cS].forEach(function (el) { el.addEventListener("change", draw); });
    size(); window.addEventListener("resize", size);
  })();
})();
