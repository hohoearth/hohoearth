/* II-04 쌍성과 별의 질량 */
(function () {
  var S = window.SIM, $ = S.$, D2R = Math.PI / 180;

  /* ---------- 시뮬레이션 1: 쌍성 관측소 ---------- */
  (function () {
    var cv = $("sim-bin"); if (!cv) return;
    var i1 = $("bin-m1"), i2 = $("bin-m2"), ia = $("bin-a"), ii = $("bin-i"), ph = 0, lc = [];
    [i1, i2, ia, ii].forEach(function (e) { e.addEventListener("input", function () { lc = []; }); });
    S.loop(function (dt) {
      var f = S.fit(cv, 0.66), c = f.ctx, w = f.w, h = f.h;
      var m1 = +i1.value, m2 = +i2.value, a = +ia.value, inc = +ii.value * D2R;
      var P = Math.sqrt(a * a * a / (m1 + m2)), Pd = P * 365.25;
      var R1 = Math.pow(m1, 0.8), R2 = Math.pow(m2, 0.8), T1 = 5772 * Math.pow(m1, 0.505), T2 = 5772 * Math.pow(m2, 0.505);
      var aR = a * 215.03, a1 = aR * m2 / (m1 + m2), a2 = aR * m1 / (m1 + m2); // 태양 반지름 단위
      var vorb = 29.78 * Math.sqrt((m1 + m2) / a), K1 = vorb * m2 / (m1 + m2) * Math.sin(inc), K2 = vorb * m1 / (m1 + m2) * Math.sin(inc);
      $("bin-m1v").textContent = m1.toFixed(2) + " M☉"; $("bin-m2v").textContent = m2.toFixed(2) + " M☉";
      $("bin-av").textContent = a.toFixed(3) + " AU (" + aR.toFixed(1) + " R☉)"; $("bin-iv").textContent = (+ii.value).toFixed(1) + "°";
      ph = (ph + dt / 5) % 1;
      var th = ph * 2 * Math.PI;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 관측자가 본 모습 (왼쪽 위)
      var vx = w * 0.25, vy = h * 0.25, sc = Math.min(w * 0.2, h * 0.2) / aR;
      function sky(r, ang) { return [Math.sin(ang) * r, Math.cos(ang) * Math.cos(inc) * r, Math.cos(ang) * r]; }
      var p1 = sky(-a1, th), p2 = sky(a2, th);
      var order = p1[2] > p2[2] ? [[p1, R1, T1], [p2, R2, T2]] : [[p2, R2, T2], [p1, R1, T1]]; // z 클수록 멀리
      order.forEach(function (q) { var g = c.createRadialGradient(vx + q[0][0] * sc, vy + q[0][1] * sc, 0, vx + q[0][0] * sc, vy + q[0][1] * sc, Math.max(2, q[1] * sc)); g.addColorStop(0, "#fff"); g.addColorStop(0.5, S.tempColor(q[2])); g.addColorStop(1, S.tempColor(q[2])); c.fillStyle = g; c.beginPath(); c.arc(vx + q[0][0] * sc, vy + q[0][1] * sc, Math.max(2, q[1] * sc), 0, 7); c.fill(); });
      c.strokeStyle = "#f87171"; c.beginPath(); c.moveTo(vx - 4, vy); c.lineTo(vx + 4, vy); c.moveTo(vx, vy - 4); c.lineTo(vx, vy + 4); c.stroke();
      c.fillStyle = "rgba(255,255,255,.7)"; c.font = S.font(11, true); c.fillText("관측자가 본 모습", 10, 16);
      // 시선 속도 (오른쪽 위)
      var gx = w * 0.52, gw = w * 0.45, gy = 24, gh = h * 0.36, Km = Math.max(K1, K2, 1) * 1.2;
      c.strokeStyle = "rgba(255,255,255,.2)"; c.strokeRect(gx, gy, gw, gh); c.beginPath(); c.moveTo(gx, gy + gh / 2); c.lineTo(gx + gw, gy + gh / 2); c.stroke();
      [[K1, -1, S.tempColor(T1)], [K2, 1, S.tempColor(T2)]].forEach(function (q) { c.strokeStyle = q[2]; c.lineWidth = 2; c.beginPath(); for (var k = 0; k <= 200; k++) { var t = k / 200 * 2, v = q[1] * q[0] * Math.cos(2 * Math.PI * t); var X = gx + k / 200 * gw, Y = gy + gh / 2 - v / Km * gh / 2; if (k) c.lineTo(X, Y); else c.moveTo(X, Y); } c.stroke(); c.lineWidth = 1; });
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11, true); c.fillText("시선 속도 (± " + Math.round(Math.max(K1, K2)) + " km/s)", gx, gy - 6);
      var cur = ph * 2; c.strokeStyle = "#fff"; c.beginPath(); c.moveTo(gx + cur / 2 * gw, gy); c.lineTo(gx + cur / 2 * gw, gy + gh); c.stroke();
      // 흡수선 (왼쪽 아래)
      var sx = 20, sw = w * 0.42, sy = h * 0.58, sh = h * 0.32;
      var grd = c.createLinearGradient(sx, 0, sx + sw, 0); grd.addColorStop(0, "#b91c1c"); grd.addColorStop(1, "#f87171"); c.fillStyle = grd; c.fillRect(sx, sy, sw, sh);
      var v1 = -K1 * Math.cos(th), v2 = K2 * Math.cos(th), sclv = sw * 0.42 / Math.max(Km, 60);
      c.strokeStyle = "rgba(255,255,255,.7)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(sx + sw / 2, sy - 4); c.lineTo(sx + sw / 2, sy + sh + 4); c.stroke(); c.setLineDash([]);
      var L1 = Math.pow(R1, 2) * Math.pow(T1 / 5772, 4), L2 = Math.pow(R2, 2) * Math.pow(T2 / 5772, 4);
      c.fillStyle = "rgba(0,0,0," + (0.35 + 0.5 * L1 / (L1 + L2)) + ")"; c.fillRect(sx + sw / 2 + v1 * sclv - 2, sy, 4, sh);
      c.fillStyle = "rgba(0,0,0," + (0.35 + 0.5 * L2 / (L1 + L2)) + ")"; c.fillRect(sx + sw / 2 + v2 * sclv - 2, sy, 4, sh);
      c.fillStyle = "rgba(255,255,255,.8)"; c.fillText("Hα 흡수선 (점선: 기준 파장)", sx, sy - 6);
      // 광도 곡선 (오른쪽 아래)
      function flux(ang) {
        var q1 = sky(-a1, ang), q2 = sky(a2, ang), d = Math.hypot(q1[0] - q2[0], q1[1] - q2[1]);
        var front = q1[2] < q2[2] ? 1 : 2, Rf = front === 1 ? R1 : R2, Rb = front === 1 ? R2 : R1, Sb = front === 1 ? Math.pow(T2 / 5772, 4) : Math.pow(T1 / 5772, 4);
        var tot = L1 + L2, ov = 0;
        if (d < Rf + Rb) { if (d <= Math.abs(Rf - Rb)) ov = Math.PI * Math.min(Rf, Rb) * Math.min(Rf, Rb); else { var r = Rf, R = Rb; var a1x = r * r * Math.acos((d * d + r * r - R * R) / (2 * d * r)), a2x = R * R * Math.acos((d * d + R * R - r * r) / (2 * d * R)), a3 = 0.5 * Math.sqrt(Math.max(0, (-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R))); ov = a1x + a2x - a3; } }
        return (tot - ov / Math.PI * Sb) / tot;
      }
      var lx = w * 0.52, lw = w * 0.45, ly = h * 0.58, lh = h * 0.32, fmin = 1;
      for (var k = 0; k <= 300; k++) fmin = Math.min(fmin, flux(k / 300 * 2 * Math.PI));
      var lo = Math.min(0.98, fmin - (1 - fmin) * 0.15);
      c.strokeStyle = "rgba(255,255,255,.2)"; c.strokeRect(lx, ly, lw, lh);
      c.strokeStyle = "#fde68a"; c.lineWidth = 2; c.beginPath(); for (var k2 = 0; k2 <= 300; k2++) { var t2 = k2 / 300 * 2, fl = flux(t2 * 2 * Math.PI), X2 = lx + k2 / 300 * lw, Y2 = ly + lh - (fl - lo) / (1.005 - lo) * lh; if (k2) c.lineTo(X2, Y2); else c.moveTo(X2, Y2); } c.stroke(); c.lineWidth = 1;
      c.strokeStyle = "#fff"; c.beginPath(); c.moveTo(lx + cur / 2 * lw, ly); c.lineTo(lx + cur / 2 * lw, ly + lh); c.stroke();
      c.fillStyle = "rgba(255,255,255,.8)"; c.fillText("밝기 (최저 " + (fmin * 100).toFixed(1) + "%)", lx, ly - 6);
      var ecl = fmin < 0.999;
      $("bin-out").innerHTML = "공전 주기 P = <span class='sqrt'><span>a³/(m₁+m₂)</span></span> = <b>" + (Pd < 100 ? Pd.toFixed(2) + "일" : P.toFixed(2) + "년") + "</b><br>질량비 m₁/m₂ = <b>" + (m1 / m2).toFixed(2) + "</b> = 속도비 K₂/K₁ = " + (K1 > 0.01 ? (K2 / K1).toFixed(2) : "–") + "<br>표면 온도 A " + Math.round(T1) + " K · B " + Math.round(T2) + " K<br>" + (ecl ? "식현상 <b>있음</b> → 식쌍성" : "식현상 <b>없음</b>") + (K1 > 1 ? " · 분광 쌍성으로 관측 가능" : "");
    });
  })();

  /* ---------- 데이터 랩: 질량–광도 ---------- */
  (function () {
    var cv = $("lab-ml"); if (!cv) return;
    // 안시 쌍성 [이름, P(년), α(″), p(″), 질량비 mB/mA, L_A, L_B, A 종류, B 종류]
    var V = [["알파 센타우리 AB", 79.91, 17.57, 0.7471, 0.84, 1.52, 0.50, "주계열", "주계열"],
      ["시리우스 AB", 50.13, 7.50, 0.3792, 0.49, 25.4, 0.056, "주계열", "백색 왜성"],
      ["프로키온 AB", 40.84, 4.27, 0.2846, 0.40, 6.9, 0.00049, "주계열", "백색 왜성"],
      ["뱀주인자리 70 AB", 88.38, 4.554, 0.1959, 0.78, 0.59, 0.15, "주계열", "주계열"],
      ["카시오페이아자리 에타 AB", 480, 11.99, 0.1683, 0.59, 1.23, 0.062, "주계열", "주계열"],
      ["크뤼거 60 AB", 44.67, 2.383, 0.2495, 0.65, 0.0105, 0.0039, "주계열", "주계열"]];
    // 식쌍성 [이름, M, L]
    var E = [["스피카 A", 11.4, 20500], ["스피카 B", 7.2, 1500], ["마차부자리 베타 A", 2.38, 52], ["마차부자리 베타 B", 2.29, 42],
      ["쌍둥이자리 YY A", 0.60, 0.074], ["쌍둥이자리 YY B", 0.60, 0.074], ["용자리 CM A", 0.231, 0.0055], ["용자리 CM B", 0.211, 0.0049]];
    var calc = false, hov = -1, pts = [];
    function vb(r) { var a = r[2] / r[3], tot = a * a * a / (r[1] * r[1]), mA = tot / (1 + r[4]); return { a: a, tot: tot, mA: mA, mB: tot - mA }; }
    function table() {
      S.table($("lab-table"), ["쌍성", "P (년)", "α (″)", "p (″)", "a = α/p (AU)", "질량 합 a³/P² (M☉)", "질량비 m_B/m_A", "M_A", "M_B"],
        V.map(function (r) { var q = vb(r); return [r[0], r[1], r[2], r[3], calc ? q.a.toFixed(2) : "?", calc ? q.tot.toFixed(2) : "?", r[4], calc ? q.mA.toFixed(2) : "?", calc ? q.mB.toFixed(2) : "?"]; }));
    }
    function stars() {
      var s = [];
      if (calc) V.forEach(function (r) { var q = vb(r); s.push([r[0].replace(" AB", " A"), q.mA, r[5], r[7], "안시"]); s.push([r[0].replace(" AB", " B"), q.mB, r[6], r[8], "안시"]); });
      E.forEach(function (r) { s.push([r[0], r[1], r[2], "주계열", "식쌍성"]); });
      return s;
    }
    $("lab-calc").addEventListener("click", function () { calc = true; table(); draw(); this.textContent = "✔ 계산 완료"; });
    $("lab-wd").addEventListener("change", draw); $("lab-l").addEventListener("input", draw);
    $("lab-csv").addEventListener("click", function () { S.csv("binary_mass_luminosity.csv", ["star", "mass_Msun", "luminosity_Lsun", "class", "source"], stars().map(function (q) { return [q[0], q[1].toFixed(3), q[2], q[3], q[4]]; })); });
    cv.addEventListener("mousemove", function (e) { var b = cv.getBoundingClientRect(), x = e.clientX - b.left, y = e.clientY - b.top; hov = -1; pts.forEach(function (p, i) { if (Math.hypot(p[0] - x, p[1] - y) < 8) hov = i; }); draw(); });
    function draw() {
      var f = S.fit(cv, 0.68), c = f.ctx, w = f.w, h = f.h, s = stars(), useWD = $("lab-wd").checked;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var A = S.axes(c, { x: 60, y: 14, w: w - 76, h: h - 54, x0: 0.1, x1: 20, xlog: true, y0: 1e-4, y1: 1e5, ylog: true, xt: [0.1, 0.2, 0.5, 1, 2, 5, 10, 20], xl: "질량 M (M☉)", yl: "광도 L (L☉)", xfmt: function (v) { return v; } });
      var use = s.filter(function (q) { return q[3] === "주계열" || useWD; });
      var L = S.linreg(use.map(function (q) { return Math.log10(q[1]); }), use.map(function (q) { return Math.log10(q[2]); }));
      c.strokeStyle = useWD ? "rgba(248,113,113,.85)" : "rgba(251,191,36,.85)"; c.lineWidth = 2; c.beginPath(); c.moveTo(A.X(0.1), A.Y(Math.pow(10, L.m * -1 + L.b))); c.lineTo(A.X(20), A.Y(Math.pow(10, L.m * Math.log10(20) + L.b))); c.save(); c.rect(60, 14, w - 76, h - 54); c.clip(); c.stroke(); c.restore(); c.lineWidth = 1;
      pts = [];
      s.forEach(function (q, i) { var X = A.X(q[1]), Y = A.Y(Math.max(1e-4, q[2])); pts.push([X, Y]); var col = q[3] === "백색 왜성" ? (useWD ? "#f87171" : "rgba(229,231,235,.35)") : q[4] === "안시" ? "#60a5fa" : "#34d399"; S.dot(c, X, Y, i === hov ? 7 : 5, col, "#000"); });
      var lg = +$("lab-l").value, mp = Math.pow(10, (lg - L.b) / L.m);
      $("lab-lv").textContent = Math.pow(10, lg) < 10 ? Math.pow(10, lg).toPrecision(2) + " L☉" : Math.round(Math.pow(10, lg)).toLocaleString() + " L☉";
      c.strokeStyle = "rgba(244,114,182,.8)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(60, A.Y(Math.pow(10, lg))); c.lineTo(A.X(mp), A.Y(Math.pow(10, lg))); c.lineTo(A.X(mp), h - 40); c.stroke(); c.setLineDash([]);
      c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(11); c.fillText("● 안시 쌍성  ● 식쌍성  ● 백색 왜성", 70, 28);
      $("lab-kpi").innerHTML = "<div><small>지수 (기울기)</small><b>" + L.m.toFixed(2) + "</b></div><div><small>r²</small><b>" + L.r2.toFixed(3) + "</b></div><div><small>사용한 별</small><b>" + use.length + "개</b></div>";
      var life = 10 * mp / Math.pow(10, lg);
      var html = "L = " + $("lab-lv").textContent + " → 예측 질량 <b>" + mp.toFixed(2) + " M☉</b>, 수명 ≈ <b>" + (life >= 1 ? life.toFixed(1) + "×10⁹ 년" : (life * 1000).toFixed(0) + "×10⁶ 년") + "</b>";
      if (!calc) html = "먼저 '안시 쌍성 질량 계산'을 눌러 안시 쌍성 12개 별을 그래프에 추가하자.<br>" + html;
      if (hov >= 0) html = "<b>" + s[hov][0] + "</b> (" + s[hov][3] + ", " + s[hov][4] + ") · M = " + s[hov][1].toFixed(2) + " M☉ · L = " + s[hov][2] + " L☉<br>" + html;
      $("lab-out").innerHTML = html;
    }
    table(); draw(); S.onResize(draw);
  })();
})();
