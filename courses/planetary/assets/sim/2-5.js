/* II-05 변광성 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 시뮬레이션 1: 맥동 ---------- */
  (function () {
    var cv = $("sim-pul"); if (!cv) return;
    var ir = $("pul-r"), it = $("pul-t"), ph = 0, run = true;
    $("pul-pause").addEventListener("click", function () { run = !run; this.textContent = run ? "⏸ 멈춤" : "▶ 재생"; });
    function st(p, dr, dT) { var q = p + 0.12 * Math.sin(2 * Math.PI * p); var R = 1 + dr * Math.sin(2 * Math.PI * q), T = 6150 + dT * Math.cos(2 * Math.PI * q); return { R: R, T: T, L: R * R * Math.pow(T / 6150, 4) }; }
    S.loop(function (dt) {
      var f = S.fit(cv, 0.52), c = f.ctx, w = f.w, h = f.h, dr = +ir.value / 100, dT = +it.value;
      $("pul-rv").textContent = "± " + ir.value + "%"; $("pul-tv").textContent = "± " + dT + " K";
      if (run) ph = (ph + dt / 4) % 1;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var s = st(ph, dr, dT), cx = w * 0.17, cy = h * 0.5, R0 = Math.min(w * 0.11, h * 0.32);
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, R0 * s.R * 1.6); g.addColorStop(0, S.tempColor(s.T)); g.addColorStop(0.62, S.tempColor(s.T)); g.addColorStop(1, "rgba(0,0,0,0)");
      c.globalAlpha = Math.min(1, 0.55 + 0.45 * s.L); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R0 * s.R * 1.6, 0, 7); c.fill(); c.globalAlpha = 1;
      c.strokeStyle = "rgba(255,255,255,.25)"; c.setLineDash([3, 4]); c.beginPath(); c.arc(cx, cy, R0, 0, 7); c.stroke(); c.setLineDash([]);
      c.fillStyle = "#fff"; c.font = S.font(12, true); c.textAlign = "center"; c.fillText(Math.round(s.T) + " K", cx, h - 14); c.textAlign = "left";
      var gx = w * 0.38, gw = w * 0.58;
      function curve(y0, hh, fn, col, lab, lo, hi) {
        c.strokeStyle = "rgba(255,255,255,.15)"; c.strokeRect(gx, y0, gw, hh);
        c.strokeStyle = col; c.lineWidth = 2; c.beginPath();
        for (var k = 0; k <= 200; k++) { var p = k / 200 * 2, v = fn(st(p % 1, dr, dT)), y = y0 + hh - (v - lo) / (hi - lo) * hh; if (k) c.lineTo(gx + k / 200 * gw, y); else c.moveTo(gx, y); }
        c.stroke(); c.lineWidth = 1;
        var cv2 = fn(s); S.dot(c, gx + ph / 2 * gw, y0 + hh - (cv2 - lo) / (hi - lo) * hh, 4, "#fff");
        c.fillStyle = col; c.font = S.font(11, true); c.fillText(lab, gx + 4, y0 + 13);
      }
      var hh = (h - 30) / 3 - 6;
      curve(8, hh, function (q) { return q.R; }, "#60a5fa", "반지름", 0.83, 1.17);
      curve(14 + hh, hh, function (q) { return q.T; }, "#f87171", "표면 온도", 5150, 7150);
      curve(20 + 2 * hh, hh, function (q) { return q.L; }, "#fde047", "광도 (∝ R²T⁴)", 0.3, 2.0);
      c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(10); c.fillText("← 두 주기 →", gx + gw / 2 - 26, h - 4);
      var Lmax = 0, Lmin = 9; for (var k = 0; k < 200; k++) { var q = st(k / 200, dr, dT); Lmax = Math.max(Lmax, q.L); Lmin = Math.min(Lmin, q.L); }
      $("pul-out").innerHTML = "현재 반지름 <b>" + (s.R * 100).toFixed(0) + "%</b> · 온도 <b>" + Math.round(s.T) + " K</b><br>광도 변화 범위 <b>" + Lmin.toFixed(2) + " ~ " + Lmax.toFixed(2) + "배</b> → 약 <b>" + (2.5 * Math.log10(Lmax / Lmin)).toFixed(2) + "등급</b> 변화";
    });
  })();

  /* ---------- 시뮬레이션 2: 초신성 광도 곡선 ---------- */
  (function () {
    var cv = $("sim-sn"); if (!cv) return;
    var id = $("sn-d"), iii = $("sn-ii");
    function Ia(t) { return t < 0 ? -19.3 + 0.01 * t * t : t < 30 ? -19.3 + 0.1 * t : -16.3 + 0.015 * (t - 30); }
    function II(t) { return t < 0 ? -17.2 + 0.012 * t * t : t < 95 ? -17.2 + 0.4 * t / 95 : t < 115 ? -16.8 + 2.4 * (t - 95) / 20 : -14.4 + 0.0098 * (t - 115); }
    function draw() {
      var f = S.fit(cv, 0.52), c = f.ctx, w = f.w, h = f.h, r = Math.pow(10, +id.value), DM = 5 * Math.log10(r * 1e6) - 5;
      $("sn-dv").textContent = (r < 10 ? r.toFixed(1) : Math.round(r).toLocaleString()) + " Mpc";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var top = Math.floor(-19.3 + DM - 1), bot = top + 10;
      var A = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: -20, x1: 160, y0: bot, y1: top, xl: "최대 밝기 후 경과 시간 (일)", yl: "겉보기 등급 m" });
      [[24, "지상 대형 망원경 한계 ≈ 24"], [29, "허블·웹 우주 망원경 한계 ≈ 29"]].forEach(function (q) { if (q[0] > top && q[0] < bot) { c.strokeStyle = "rgba(167,139,250,.8)"; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(56, A.Y(q[0])); c.lineTo(w - 16, A.Y(q[0])); c.stroke(); c.setLineDash([]); c.fillStyle = "#c4b5fd"; c.font = S.font(11); c.fillText(q[1], w - 220, A.Y(q[0]) - 5); } });
      function plot(fn, col) { c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); for (var t = -20; t <= 160; t += 1) { var m = fn(t) + DM; if (t === -20) c.moveTo(A.X(t), A.Y(m)); else c.lineTo(A.X(t), A.Y(m)); } c.save(); c.rect(56, 14, w - 72, h - 52); c.clip(); c.stroke(); c.restore(); c.lineWidth = 1; }
      plot(Ia, "#60a5fa"); if (iii.checked) plot(II, "#f87171");
      S.tag(c, "Ia형", A.X(20), A.Y(Ia(20) + DM) - 8, { bg: "rgba(37,99,235,.85)", size: 11 });
      if (iii.checked) S.tag(c, "II형 (평탄형)", A.X(60), A.Y(II(60) + DM) - 10, { bg: "rgba(220,38,38,.85)", size: 11 });
      var mpk = -19.3 + DM;
      $("sn-out").innerHTML = "Ia형 최대 겉보기 등급 <b>" + mpk.toFixed(1) + "</b><br>거리지수 m − M = " + mpk.toFixed(1) + " − (−19.3) = <b>" + DM.toFixed(1) + "</b><br>거리 <b>" + (r < 10 ? r.toFixed(1) : Math.round(r).toLocaleString()) + " Mpc</b> ≈ " + kly(r * 1e6) + "<br>" + (mpk < 24 ? "지상 망원경으로도 관측 가능" : mpk < 29 ? "우주 망원경이 필요" : "관측 한계 너머");
    }
    id.addEventListener("input", draw); iii.addEventListener("change", draw); draw(); S.onResize(draw);
  })();

  function kly(pc) { var ly = pc * 3.26; return ly < 1e8 ? Math.round(ly / 1e4).toLocaleString() + "만 광년" : (ly / 1e8).toFixed(1) + "억 광년"; }
  window.__kly = kly;
  /* ---------- 데이터 랩: 거리 사다리 ---------- */
  (function () {
    var cv = $("lab-pl"); if (!cv) return;
    function Mtrue(P) { return -2.43 * (Math.log10(P) - 1) - 4.05; }
    var MW = [["케페우스자리 δ", 5.366, 3.66], ["용골자리 ℓ", 35.55, 2.01], ["독수리자리 FF", 4.471, 2.81], ["황새치자리 β", 9.843, 3.14], ["쌍둥이자리 ζ", 10.15, 2.78],
      ["궁수자리 X", 7.013, 3.00], ["궁수자리 W", 7.595, 2.28], ["궁수자리 Y", 5.773, 2.13], ["마차부자리 RT", 3.728, 2.40], ["여우자리 T", 4.435, 1.90]];
    var NZ = [0.05, -0.08, 0.10, -0.03, 0.07, -0.10, 0.02, 0.09, -0.06, 0.00];
    MW.forEach(function (r, i) { var d = 1000 / r[2]; r.push(+(Mtrue(r[1]) + NZ[i] + 5 * Math.log10(d) - 5).toFixed(2)); }); // V0
    var R = S.rand(1912), LMC = [], M100 = [];
    for (var i = 0; i < 80; i++) { var lp = 0.4 + R() * 1.2, P = Math.pow(10, lp); LMC.push([+P.toFixed(3), +(Mtrue(P) + 18.48 + R.gauss() * 0.15).toFixed(2)]); }
    for (var j = 0; j < 12; j++) { var lp2 = 1.3 + R() * 0.5, P2 = Math.pow(10, lp2); M100.push([+P2.toFixed(2), +(Mtrue(P2) + 31.04 + R.gauss() * 0.2).toFixed(2)]); }
    function absM(r) { return r[3] - 5 * Math.log10(1000 / r[2]) + 5; }
    var cal = S.linreg(MW.map(function (r) { return Math.log10(r[1]); }), MW.map(absM));
    function dm(arr) { var s = 0; arr.forEach(function (q) { s += q[1] - (cal.m * Math.log10(q[0]) + cal.b); }); return s / arr.length; }
    var stage = 0;
    S.table($("lab-table"), ["세페이드", "주기 P (일)", "log P", "시차 (mas)", "거리 (pc)", "V₀ (소광 보정)", "절대 등급 M"],
      MW.map(function (r) { return [r[0], r[1], Math.log10(r[1]).toFixed(3), r[2], (1000 / r[2]).toFixed(0), r[3], absM(r).toFixed(2)]; }));
    $("lab-stage").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; stage = +b.dataset.s; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    $("lab-csv").addEventListener("click", function () {
      var rows = MW.map(function (r) { return ["MilkyWay", r[0], r[1], r[2], r[3]]; }).concat(LMC.map(function (q, k) { return ["LMC", "LMC-" + (k + 1), q[0], "", q[1]]; }), M100.map(function (q, k) { return ["M100", "M100-C" + (k + 1), q[0], "", q[1]]; }));
      S.csv("cepheid_distance_ladder.csv", ["galaxy", "star", "period_day", "parallax_mas", "mean_mag"], rows);
    });
    function draw() {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var o = { x: 60, y: 14, w: w - 76, h: h - 52, x0: 0.3, x1: 1.9, xl: "log P (일)" };
      if (stage === 0) { o.y0 = -2; o.y1 = -7; o.yl = "절대 등급 M"; }
      else if (stage === 1) { o.y0 = 17.5; o.y1 = 12.5; o.yl = "겉보기 등급 m"; }
      else { o.y0 = 28; o.y1 = 24; o.x0 = 1.1; o.yl = "겉보기 등급 m"; }
      var A = S.axes(c, o);
      function line(b, col, dash) { c.strokeStyle = col; c.lineWidth = 2; if (dash) c.setLineDash([6, 4]); c.beginPath(); c.moveTo(A.X(o.x0), A.Y(cal.m * o.x0 + b)); c.lineTo(A.X(o.x1), A.Y(cal.m * o.x1 + b)); c.save(); c.rect(o.x, o.y, o.w, o.h); c.clip(); c.stroke(); c.restore(); c.setLineDash([]); c.lineWidth = 1; }
      var kpi = "", out = "";
      if (stage === 0) {
        line(cal.b, "#fbbf24");
        MW.forEach(function (r) { var X = A.X(Math.log10(r[1])), Y = A.Y(absM(r)); S.dot(c, X, Y, 5.5, "#60a5fa", "#000"); c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(10); c.fillText(r[0], X + 7, Y + 3); });
        kpi = "<div><small>기울기</small><b>" + cal.m.toFixed(2) + "</b></div><div><small>절편</small><b>" + cal.b.toFixed(2) + "</b></div><div><small>r²</small><b>" + cal.r2.toFixed(3) + "</b></div>";
        out = "보정된 관계: <b>M = " + cal.m.toFixed(2) + " log P " + (cal.b < 0 ? "− " : "+ ") + Math.abs(cal.b).toFixed(2) + "</b><br>주기 10일 → M = " + (cal.m + cal.b).toFixed(2);
      } else if (stage === 1) {
        var d1 = dm(LMC);
        LMC.forEach(function (q) { S.dot(c, A.X(Math.log10(q[0])), A.Y(q[1]), 3.5, "#a78bfa"); });
        line(cal.b + d1, "#fbbf24");
        var Ld = S.linreg(LMC.map(function (q) { return Math.log10(q[0]); }), LMC.map(function (q) { return q[1]; }));
        kpi = "<div><small>자체 회귀 기울기</small><b>" + Ld.m.toFixed(2) + "</b></div><div><small>거리지수 m − M</small><b>" + d1.toFixed(2) + "</b></div><div><small>거리</small><b>" + (Math.pow(10, (d1 + 5) / 5) / 1000).toFixed(1) + " kpc</b></div>";
        out = "대마젤란은하 세페이드 80개만으로 구한 기울기(" + Ld.m.toFixed(2) + ")가 우리은하 보정 기울기(" + cal.m.toFixed(2) + ")와 거의 같다.<br>보정선을 위아래로 옮겨 맞춘 양 = 거리지수 <b>" + d1.toFixed(2) + "</b> → 약 <b>" + kly(Math.pow(10, (d1 + 5) / 5)) + "</b>";
      } else {
        var d2 = dm(M100);
        M100.forEach(function (q) { S.dot(c, A.X(Math.log10(q[0])), A.Y(q[1]), 5, "#34d399", "#000"); });
        line(cal.b + d2, "#fbbf24");
        var r2 = Math.pow(10, (d2 + 5) / 5);
        kpi = "<div><small>세페이드 수</small><b>" + M100.length + "개</b></div><div><small>거리지수</small><b>" + d2.toFixed(2) + "</b></div><div><small>거리</small><b>" + (r2 / 1e6).toFixed(1) + " Mpc</b></div>";
        out = "M100 (처녀자리 은하단) 거리 ≈ <b>" + (r2 / 1e6).toFixed(1) + " Mpc</b> ≈ <b>" + kly(r2) + "</b><br>절편이 0.1등급 틀리면 거리는 약 5% 달라진다.";
      }
      $("lab-kpi").innerHTML = kpi; $("lab-out").innerHTML = out;
    }
    draw(); S.onResize(draw);
  })();
})();
