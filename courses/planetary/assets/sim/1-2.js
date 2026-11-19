/* I-02 우주 위험 감시 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 시뮬레이션 1: 태양풍과 자기권 ---------- */
  (function () {
    var cv = $("sim-mag"); if (!cv) return;
    var iv = $("mag-v"), inn = $("mag-n"), ib = $("mag-b");
    var parts = [], R = S.rand(11);
    for (var i = 0; i < 160; i++) parts.push({ x: R(), y: R(), s: 0.6 + R() * 0.8 });
    $("mag-cme").addEventListener("click", function () { iv.value = 900; inn.value = 40; ib.value = -35; });
    $("mag-calm").addEventListener("click", function () { iv.value = 400; inn.value = 5; ib.value = 2; });
    var r0s = 10;
    S.loop(function (dt, t) {
      var f = S.fit(cv, 0.56), c = f.ctx, w = f.w, h = f.h;
      var v = +iv.value, n = +inn.value, bz = +ib.value;
      $("mag-vv").textContent = v + " km/s"; $("mag-nv").textContent = n + " 개/cm³"; $("mag-bv").textContent = bz + " nT" + (bz < 0 ? " (남향)" : " (북향)");
      var P = n * v * v / (5 * 400 * 400);
      var r0 = 10 * Math.pow(P, -1 / 6) - (bz < 0 ? 0.04 * -bz : 0);
      r0 = Math.max(4.5, r0);
      r0s = S.approach(r0s, r0, 2, dt);
      var Ey = v * Math.max(0, -bz) / 1000;
      var kp = Math.max(0, Math.min(9, 0.8 + 1.6 * Math.pow(Ey, 0.7) + 0.8 * Math.log2(Math.max(1, P))));
      var lam = Math.max(38, 67 - 2.6 * kp);
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var ex = w * 0.52, ey = h * 0.5, Re = Math.min(w, h) * 0.035;
      // 태양풍 입자
      parts.forEach(function (p) {
        p.x += dt * v / 2500 * p.s; if (p.x > 1) { p.x = 0; p.y = R(); }
        var px = p.x * w, py = p.y * h;
        // 자기권 안으로는 들어가지 않고 휘어 감
        var dx = (px - ex) / Re, dy = (py - ey) / Re, rr = Math.hypot(dx, dy), th = Math.atan2(Math.abs(dy), -dx);
        var mp = r0s * Math.pow(2 / (1 + Math.cos(th)), 0.58);
        if (rr < mp) return;
        c.fillStyle = "rgba(251,191,36," + (0.3 + 0.5 * p.s / 1.4) + ")"; c.fillRect(px, py, 2 + v / 500, 1.5);
      });
      // 자기권계면
      c.beginPath();
      for (var a = -2.4; a <= 2.4; a += 0.03) { var rm = r0s * Math.pow(2 / (1 + Math.cos(a)), 0.58) * Re; var X = ex - Math.cos(a) * rm, Y = ey + Math.sin(a) * rm; if (a === -2.4) c.moveTo(X, Y); else c.lineTo(X, Y); }
      c.strokeStyle = "#60a5fa"; c.lineWidth = 2.5; c.stroke(); c.lineWidth = 1;
      c.fillStyle = "rgba(96,165,250,.06)"; c.fill();
      // 자기력선 (쌍극자, 낮 쪽 압축)
      [2, 3.5, 5, 7].forEach(function (L) {
        [-1, 1].forEach(function (side) {
          c.beginPath();
          for (var lat = -75; lat <= 75; lat += 2) {
            var la = lat * Math.PI / 180, r = L * Math.cos(la) * Math.cos(la);
            var comp = side < 0 ? Math.min(1, (r0s * 0.92) / Math.max(L, 0.1)) : 1 + 0.15 * L / 7;
            var X = ex + side * r * Math.cos(la) * Re * (side < 0 ? Math.min(1, comp) : comp), Y = ey - r * Math.sin(la) * Re;
            if (lat === -75) c.moveTo(X, Y); else c.lineTo(X, Y);
          }
          c.strokeStyle = "rgba(167,139,250,.45)"; c.stroke();
        });
      });
      // 꼬리
      c.strokeStyle = "rgba(167,139,250,.3)";
      [-1, 1].forEach(function (s) { c.beginPath(); c.moveTo(ex + 2 * Re, ey + s * 1.2 * Re); c.quadraticCurveTo(ex + 8 * Re, ey + s * 4 * Re, w, ey + s * r0s * 1.3 * Re); c.stroke(); });
      // 지구
      var g = c.createRadialGradient(ex - Re * 0.3, ey - Re * 0.3, 1, ex, ey, Re); g.addColorStop(0, "#93c5fd"); g.addColorStop(1, "#1d4ed8");
      c.fillStyle = g; c.beginPath(); c.arc(ex, ey, Re, 0, 7); c.fill();
      // 오로라 (극 지방 빛)
      var aur = Math.min(1, 0.15 + kp / 9);
      [-1, 1].forEach(function (s) { c.fillStyle = "rgba(52,211,153," + aur + ")"; c.beginPath(); c.arc(ex, ey + s * Re * 0.92, Re * 0.45 * (1 + kp / 12), 0, 7); c.fill(); });
      S.tag(c, "태양풍 →", 10, 24, { bg: "rgba(180,83,9,.85)" });
      S.tag(c, "자기권계면 " + r0s.toFixed(1) + " Rₑ", ex - r0s * Re - 10, ey - r0s * Re * 0.9, { bg: "rgba(37,99,235,.85)", align: "center", size: 12 });
      // 극 상공에서 본 오로라대 (오른쪽 아래 삽화)
      var ix = w - 92, iy = h - 92, ir = 76;
      c.fillStyle = "rgba(255,255,255,.06)"; c.beginPath(); c.arc(ix, iy, ir, 0, 7); c.fill();
      c.strokeStyle = "rgba(255,255,255,.2)"; [30, 50, 70].forEach(function (la) { c.beginPath(); c.arc(ix, iy, ir * (90 - la) / 70, 0, 7); c.stroke(); });
      var orr = ir * (90 - lam) / 70;
      c.strokeStyle = "rgba(52,211,153,.9)"; c.lineWidth = 6 + kp; c.beginPath(); c.arc(ix + orr * 0.12, iy, orr, 0, 7); c.stroke(); c.lineWidth = 1;
      var sr = ir * (90 - 28) / 70; S.dot(c, ix - sr * 0.7, iy - sr * 0.7, 4, "#f87171");
      c.font = S.font(10, true); c.fillStyle = "#fca5a5"; c.fillText("서울", ix - sr * 0.7 - 8, iy - sr * 0.7 - 7);
      c.fillStyle = "rgba(255,255,255,.7)"; c.fillText("자기 위도 30°·50°·70°", ix - ir, iy - ir - 6);
      var G = kp >= 9 ? "G5 극심" : kp >= 8 ? "G4 매우 강함" : kp >= 7 ? "G3 강함" : kp >= 6 ? "G2 보통" : kp >= 5 ? "G1 약함" : "폭풍 아님";
      $("mag-out").innerHTML = "태양풍 동압 <b>" + (1.67e-6 * n * v * v).toFixed(1) + " nPa</b><br>자기권계면 <b>" + r0.toFixed(1) + " Rₑ</b> (" + Math.round(r0 * 6371).toLocaleString() + " km)<br>추정 Kp <b>" + kp.toFixed(1) + "</b> · <b>" + G + "</b><br>오로라대 경계 자기 위도 <b>" + Math.round(lam) + "°</b>" + (lam <= 40 ? "<br>→ 우리나라에서도 붉은 오로라가 보일 수 있다!" : "");
    });
  })();

  /* ---------- 그림: 지구 접근 소행성 누적 발견 수 ---------- */
  (function () {
    var cv = $("fig-neo"); if (!cv) return;
    var Y = [1995, 1998, 2000, 2002, 2004, 2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2025];
    var all = [386, 600, 1250, 2050, 3000, 4000, 5600, 7100, 9300, 11900, 15000, 18500, 24000, 30500, 36500, 38000];
    var big = [150, 300, 400, 520, 600, 680, 740, 790, 815, 830, 840, 845, 850, 853, 857, 860];
    function draw() {
      var f = S.fit(cv, 0.72), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var A = S.axes(c, { x: 56, y: 14, w: w - 70, h: h - 56, x0: 1995, x1: 2025, y0: 0, y1: 40000, xl: "연도", yl: "누적 발견 수", yfmt: function (v) { return v / 1000 + "천"; } });
      c.fillStyle = "rgba(96,165,250,.25)"; c.beginPath(); c.moveTo(A.X(1995), A.Y(0));
      Y.forEach(function (y, i) { c.lineTo(A.X(y), A.Y(all[i])); }); c.lineTo(A.X(2025), A.Y(0)); c.fill();
      c.strokeStyle = "#60a5fa"; c.lineWidth = 2; c.beginPath(); Y.forEach(function (y, i) { if (i) c.lineTo(A.X(y), A.Y(all[i])); else c.moveTo(A.X(y), A.Y(all[i])); }); c.stroke();
      c.strokeStyle = "#f59e0b"; c.beginPath(); Y.forEach(function (y, i) { if (i) c.lineTo(A.X(y), A.Y(big[i])); else c.moveTo(A.X(y), A.Y(big[i])); }); c.stroke(); c.lineWidth = 1;
      S.tag(c, "전체", A.X(2016), A.Y(19000), { bg: "rgba(37,99,235,.85)", size: 11 });
      S.tag(c, "지름 1 km 이상", A.X(2006), A.Y(4200), { bg: "rgba(180,83,9,.85)", size: 11 });
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: DART ---------- */
  (function () {
    var cv = $("sim-dart"); if (!cv) return;
    var a = 1190, T = 11.921 * 3600, GM = 4 * Math.PI * Math.PI * a * a * a / (T * T), M = 4.3e9, U = 6140;
    var v0 = 2 * Math.PI * a / T;
    var st = { ph: 0, hit: false, imp: null, orb: null, flash: 0, boom: [] };
    function orbitAfter(beta, m) {
      var dv = beta * m * U / M, v1 = v0 - dv;
      var a1 = 1 / (2 / a - v1 * v1 / GM), T1 = 2 * Math.PI * Math.sqrt(a1 * a1 * a1 / GM);
      return { dv: dv, a1: a1, T1: T1 };
    }
    var ib = $("dart-b"), im = $("dart-m");
    function ui() {
      var o = orbitAfter(+ib.value, +im.value);
      $("dart-bv").textContent = (+ib.value).toFixed(1); $("dart-mv").textContent = im.value + " kg";
      var dT = (o.T1 - T) / 60;
      $("dart-out").innerHTML = "충돌 전 공전 주기 <b>11시간 55분</b><br>속도 변화 Δv <b>" + (o.dv * 1000).toFixed(2) + " mm/s</b> (공전 속력 " + (v0 * 100).toFixed(1) + " cm/s)<br>예상 주기 변화 <b>" + dT.toFixed(1) + "분</b><br>" + (st.hit ? (Math.abs(dT + 33) < 3 ? "✔ 실제 관측값(−33분)과 거의 같다!" : "관측값 −33분과 비교해 보자.") : "충돌 버튼을 눌러 보자.");
    }
    ib.addEventListener("input", ui); im.addEventListener("input", ui);
    $("dart-go").addEventListener("click", function () { if (st.hit) return; st.hit = true; st.flash = 1; st.imp = st.ph; var R = S.rand(5); st.boom = []; for (var i = 0; i < 40; i++) st.boom.push({ a: (R() - 0.5) * 1.6, s: 0.3 + R(), d: 0 }); ui(); });
    $("dart-reset").addEventListener("click", function () { st.hit = false; st.imp = null; st.boom = []; st.M = 0; ui(); });
    ui();
    S.loop(function (dt) {
      var f = S.fit(cv, 0.56), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h); S.stars(c, w, h, 90, 9);
      var cx = w * 0.42, cy = h * 0.5, sc = Math.min(w, h) * 0.32;
      var o = orbitAfter(+ib.value, +im.value);
      // 그림용 과장: 이심률을 크게 보이게
      var ex = st.hit ? Math.min(0.5, (a - o.a1) / a * 14) : 0, an = 1 - ex; // 근점 거리 비율
      // 원래 궤도
      c.strokeStyle = "rgba(255,255,255,.25)"; c.setLineDash([4, 4]); c.beginPath(); c.arc(cx, cy, sc, 0, 7); c.stroke(); c.setLineDash([]);
      var omega = 2 * Math.PI / 6; // 그림 속 1바퀴 = 6초
      if (!st.hit) {
        st.ph += omega * dt;
        var px = cx + Math.cos(st.ph) * sc, py = cy - Math.sin(st.ph) * sc;
        drawBody(c, px, py);
        // DART 접근
        var tx = px - Math.sin(st.ph) * 60, ty = py - Math.cos(st.ph) * 60;
        c.strokeStyle = "rgba(251,191,36,.5)"; c.setLineDash([2, 4]); c.beginPath(); c.moveTo(w, 20); c.lineTo(px, py); c.stroke(); c.setLineDash([]);
      } else {
        // 충돌점이 원일점인 새 타원 (e = ex)
        var A1 = sc * (1 + an) / 2, e = (sc - A1) / A1, b1 = A1 * Math.sqrt(1 - e * e), th0 = st.imp;
        var fx = cx, fy = cy; // 초점 = 디디모스
        var ccx = fx + Math.cos(th0) * (A1 * e), ccy = fy - Math.sin(th0) * (A1 * e);
        c.save(); c.translate(ccx, ccy); c.rotate(-th0); c.strokeStyle = "#34d399"; c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, A1, b1, 0, 0, 7); c.stroke(); c.restore(); c.lineWidth = 1;
        // 케플러 운동으로 이동
        st.M = (st.M || 0) + omega * dt * Math.pow(sc / A1, 1.5);
        var E = st.M + Math.PI; for (var k = 0; k < 8; k++) E = E - (E - e * Math.sin(E) - (st.M + Math.PI)) / (1 - e * Math.cos(E));
        // 초점 기준 위치: 원일점(E = π)이 충돌 지점 방향(th0)에 오도록
        var X = -A1 * (Math.cos(E) - e), Yy = b1 * Math.sin(E);
        var px2 = fx + X * Math.cos(th0) + Yy * Math.sin(th0), py2 = fy - (X * Math.sin(th0) - Yy * Math.cos(th0));
        drawBody(c, px2, py2);
        st.boom.forEach(function (p) { p.d += dt * 40 * p.s; var ix = cx + Math.cos(th0) * sc, iy = cy - Math.sin(th0) * sc; var ang = -th0 + Math.PI / 2 + p.a; c.fillStyle = "rgba(253,224,171," + Math.max(0, 1 - p.d / 120) + ")"; c.fillRect(ix + Math.cos(ang) * p.d, iy + Math.sin(ang) * p.d, 2, 2); });
        if (st.flash > 0) { st.flash -= dt; c.fillStyle = "rgba(255,255,255," + st.flash + ")"; c.fillRect(0, 0, w, h); }
        S.tag(c, "새 궤도 (과장)", ccx - A1 * 0.4, ccy + b1 + 18, { bg: "rgba(15,157,107,.85)", size: 11 });
      }
      // 디디모스
      var g = c.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, 30); g.addColorStop(0, "#d6d3d1"); g.addColorStop(1, "#57534e");
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 28, 0, 7); c.fill();
      S.tag(c, "디디모스 (지름 약 780 m)", cx, cy + 50, { align: "center", size: 11 });
      S.tag(c, "원래 궤도", cx + sc * 0.72, cy - sc * 0.72 - 6, { size: 11 });
    });
    function drawBody(c, x, y) { c.fillStyle = "#a8a29e"; c.beginPath(); c.ellipse(x, y, 9, 7, 0.4, 0, 7); c.fill(); S.tag(c, "디모르포스", x + 12, y - 8, { size: 11 }); }
  })();

  /* ---------- 데이터 랩: 2024년 5월 지자기 폭풍 ---------- */
  (function () {
    var cv = $("lab-ts"); if (!cv) return;
    var N = 120, R = S.rand(2024), V = [], Nn = [], B = [];
    var shock = 24 + 16.6; // 5/10 16:36 UTC
    for (var i = 0; i < N; i++) {
      var t = i + 0.5, v, n, b;
      if (t < shock) { v = 380 + 60 * (t / shock) + R.gauss() * 12; n = 4 + R() * 3; b = R.gauss() * 3; }
      else {
        var s = t - shock;
        v = s < 14 ? 700 + s * 12 + R.gauss() * 25 : s < 26 ? 860 + 50 * Math.sin(s / 4) + R.gauss() * 30 : s < 50 ? 900 - (s - 26) * 7 + R.gauss() * 25 : 730 - (s - 50) * 4.5 + R.gauss() * 20;
        n = s < 1 ? 40 : s < 6 ? 30 + R() * 30 : s < 12 ? 12 + R() * 10 : s < 30 ? 5 + R() * 5 : 3 + R() * 3;
        b = s < 1.5 ? -5 + R.gauss() * 8 : s < 8 ? -42 + R.gauss() * 7 : s < 14 ? -22 + R.gauss() * 8 : s < 22 ? 6 + R.gauss() * 8 : s < 28 ? -16 + R.gauss() * 6 : s < 32 ? -25 + R.gauss() * 6 : s < 44 ? R.gauss() * 6 : R.gauss() * 4;
      }
      V.push(Math.round(v)); Nn.push(+n.toFixed(1)); B.push(+b.toFixed(1));
    }
    var KP = [3, 2, 2, 2, 3, 3, 3, 4, 2, 2, 2, 2, 3, 6, 8, 9, 9, 8, 8, 7, 7, 6, 6, 8, 6, 5, 5, 4, 4, 5, 5, 4, 4, 3, 3, 3, 3, 3, 2, 2];
    var mark = false, hx = null;
    $("lab-mark").addEventListener("click", function () { mark = !mark; this.classList.toggle("on", mark); draw(); });
    $("lab-csv").addEventListener("click", function () {
      var rows = []; for (var i = 0; i < N; i++) { var d = 9 + Math.floor(i / 24), hh = i % 24; rows.push(["2024-05-" + (d < 10 ? "0" : "") + d + " " + (hh < 10 ? "0" : "") + hh + ":00", V[i], Nn[i], B[i], KP[Math.floor(i / 3)]]); }
      S.csv("geomagnetic_storm_2024_05.csv", ["time_utc", "speed_km_s", "density_cm3", "bz_nT", "kp"], rows);
    });
    cv.addEventListener("mousemove", function (e) { hx = e.clientX - cv.getBoundingClientRect().left; draw(); });
    cv.addEventListener("mouseleave", function () { hx = null; draw(); });
    var maxKp = 0, minB = 0, maxV = 0; KP.forEach(function (k) { maxKp = Math.max(maxKp, k); }); B.forEach(function (b) { minB = Math.min(minB, b); }); V.forEach(function (v) { maxV = Math.max(maxV, v); });
    $("lab-kpi").innerHTML = "<div><small>최대 속력</small><b>" + maxV + " km/s</b></div><div><small>최소 Bz</small><b>" + minB.toFixed(0) + " nT</b></div><div><small>최대 Kp</small><b>" + maxKp + " (G5)</b></div><div><small>분석 기간</small><b>120시간</b></div>";
    function draw() {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var L = 62, W = w - 80, ph = (h - 46) / 4 - 10, panels = [
        { arr: V, y0: 300, y1: 1100, lab: "속력 km/s", col: "#fbbf24" },
        { arr: Nn, y0: 0, y1: 65, lab: "밀도 /cm³", col: "#f472b6" },
        { arr: B, y0: -55, y1: 25, lab: "Bz nT", col: "#60a5fa", zero: true },
        { arr: null, y0: 0, y1: 9, lab: "Kp", col: "#34d399" }];
      var axs = [];
      panels.forEach(function (p, k) {
        var top = 8 + k * (ph + 10);
        var A = S.axes(c, { x: L, y: top, w: W, h: ph, x0: 0, x1: N, y0: p.y0, y1: p.y1, xt: k === 3 ? [0, 24, 48, 72, 96, 120] : [], xfmt: function (v) { return v === 120 ? "" : "5/" + (9 + v / 24); }, yt: k === 3 ? [0, 5, 9] : null, yl: p.lab });
        axs.push(A);
        if (p.zero) { c.strokeStyle = "rgba(255,255,255,.35)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(L, A.Y(0)); c.lineTo(L + W, A.Y(0)); c.stroke(); c.setLineDash([]); c.fillStyle = "rgba(96,165,250,.12)"; c.fillRect(L, A.Y(0), W, A.Y(p.y0) - A.Y(0)); }
        if (p.arr) {
          c.strokeStyle = p.col; c.lineWidth = 1.6; c.beginPath();
          p.arr.forEach(function (v, i) { var x = A.X(i + 0.5), y = A.Y(Math.max(p.y0, Math.min(p.y1, v))); if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.lineWidth = 1;
        } else {
          KP.forEach(function (kp, j) { var x0 = A.X(j * 3), x1 = A.X(j * 3 + 3); c.fillStyle = kp >= 8 ? "#ef4444" : kp >= 5 ? "#f59e0b" : "#34d399"; c.fillRect(x0 + 0.5, A.Y(kp), x1 - x0 - 1, A.Y(0) - A.Y(kp)); });
          c.strokeStyle = "rgba(239,68,68,.6)"; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(L, A.Y(5)); c.lineTo(L + W, A.Y(5)); c.stroke(); c.setLineDash([]);
        }
      });
      if (mark) {
        var xs = axs[0].X(shock);
        c.strokeStyle = "#fff"; c.setLineDash([5, 4]); c.beginPath(); c.moveTo(xs, 6); c.lineTo(xs, h - 30); c.stroke(); c.setLineDash([]);
        S.tag(c, "충격파 도착 5/10 16:36", xs + 6, 24, { bg: "rgba(220,38,38,.9)", size: 11 });
      }
      if (hx !== null && hx > L && hx < L + W) {
        var i = Math.max(0, Math.min(N - 1, Math.floor(axs[0].inX(hx))));
        c.strokeStyle = "rgba(255,255,255,.5)"; c.beginPath(); c.moveTo(hx, 6); c.lineTo(hx, h - 30); c.stroke();
        var d = 9 + Math.floor(i / 24), hh = i % 24;
        $("lab-read").innerHTML = "<b>5월 " + d + "일 " + hh + "시 (UTC)</b> · 속력 <b>" + V[i] + "</b> km/s · 밀도 <b>" + Nn[i] + "</b> /cm³ · Bz <b>" + B[i] + "</b> nT · Kp <b>" + KP[Math.floor(i / 3)] + "</b>";
      }
    }
    draw(); S.onResize(draw);
  })();
})();
