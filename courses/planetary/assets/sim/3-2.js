/* III-02 성간 물질 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 시뮬레이션 1: 성운 만들기 ---------- */
  (function () {
    var cv = $("sim-neb"); if (!cv) return;
    var it = $("neb-t"), ip = $("neb-pos"), R = S.rand(5), blobs = [];
    for (var i = 0; i < 40; i++) blobs.push([R.gauss() * 0.5, R.gauss() * 0.35, 0.25 + R() * 0.35]);
    function draw() {
      var f = S.fit(cv, 0.5), c = f.ctx, w = f.w, h = f.h, T = +it.value, pos = ip.value;
      $("neb-tv").textContent = T.toLocaleString() + " K";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 왼쪽: 배치도
      var lx = w * 0.22, ly = h * 0.42, s = Math.min(w * 0.12, h * 0.25);
      c.fillStyle = "rgba(120,113,108,.55)"; c.beginPath(); c.ellipse(lx, ly, s * 1.2, s * 0.8, 0, 0, 7); c.fill();
      var sp = pos === "in" ? [lx, ly] : pos === "side" ? [lx + s * 1.9, ly] : [lx, ly - s * 1.6];
      S.dot(c, sp[0], sp[1], 7, S.tempColor(T), "#fff");
      S.dot(c, lx, h - 18, 6, "#60a5fa"); c.fillStyle = "#93c5fd"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText("관측자", lx, h - 4); c.fillText("성간운", lx, ly + s * 0.8 + 16); c.textAlign = "left";
      c.strokeStyle = "rgba(255,255,255,.3)"; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(lx, h - 24); c.lineTo(lx, ly + s * 0.8); c.stroke(); c.setLineDash([]);
      c.fillStyle = "rgba(255,255,255,.6)"; c.fillText("위에서 본 배치", 10, 16);
      // 오른쪽: 보이는 모습
      var vx = w * 0.7, vy = h * 0.5, V = Math.min(w * 0.27, h * 0.45);
      c.save(); c.beginPath(); c.rect(vx - V, vy - V, 2 * V, 2 * V); c.clip();
      c.fillStyle = "#020309"; c.fillRect(vx - V, vy - V, 2 * V, 2 * V);
      var R2 = S.rand(9); for (var k = 0; k < 160; k++) { var x = vx - V + R2() * 2 * V, y = vy - V + R2() * 2 * V; var dd = Math.hypot((x - vx) / (V * 0.75), (y - vy) / (V * 0.55)); if (dd < 1 && pos !== "side") continue; c.fillStyle = "rgba(255,255,255," + (0.3 + R2() * 0.6) + ")"; c.fillRect(x, y, 1.4, 1.4); }
      var hot = T >= 20000, kind = "";
      var scx = pos === "side" ? vx + V * 0.75 : vx, scy = vy;
      if (pos === "behind") {
        var g0 = c.createRadialGradient(vx, vy, 0, vx, vy, V * 1.2); g0.addColorStop(0, hot ? "rgba(255,90,110,.65)" : "rgba(255,240,210,.35)"); g0.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g0; c.fillRect(vx - V, vy - V, 2 * V, 2 * V);
        blobs.forEach(function (b) { c.fillStyle = "rgba(4,4,8,.75)"; c.beginPath(); c.arc(vx + b[0] * V, vy + b[1] * V, b[2] * V * 0.6, 0, 7); c.fill(); });
        kind = "암흑 성운: 성간운이 뒤쪽 " + (hot ? "방출 성운" : "별빛") + "을 가려 검은 실루엣으로 보인다.";
      } else {
        if (hot) { var g1 = c.createRadialGradient(scx, scy, 0, scx, scy, V * 0.9); g1.addColorStop(0, "rgba(255,120,140,.95)"); g1.addColorStop(0.5, "rgba(230,60,90,.55)"); g1.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g1; c.fillRect(vx - V, vy - V, 2 * V, 2 * V); }
        var g2 = c.createRadialGradient(scx, scy, 0, scx, scy, V * (hot ? 1.1 : 0.8)); g2.addColorStop(0, "rgba(120,170,255," + (hot ? 0.25 : 0.75) + ")"); g2.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = g2; c.fillRect(vx - V, vy - V, 2 * V, 2 * V);
        blobs.forEach(function (b, i) { if (i % 3) return; c.fillStyle = "rgba(10,8,12,.45)"; c.beginPath(); c.arc(vx + b[0] * V, vy + b[1] * V * 1.2, b[2] * V * 0.35, 0, 7); c.fill(); });
        S.dot(c, scx, scy, 4, "#fff");
        kind = hot ? "방출 성운: 뜨거운 별의 자외선이 수소를 이온화 → 붉은 Hα 빛 (가장자리에는 푸른 반사광도 섞인다)" : "반사 성운: 별빛이 약해 이온화는 못 하고, 티끌이 별빛을 산란해 푸르게 보인다.";
      }
      c.restore();
      c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(vx - V, vy - V, 2 * V, 2 * V);
      $("neb-out").innerHTML = "<b>" + kind.split(":")[0] + "</b>:" + kind.split(":").slice(1).join(":");
    }
    it.addEventListener("input", draw); ip.addEventListener("change", draw); draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: 소광 스펙트럼 ---------- */
  (function () {
    var cv = $("sim-ext"); if (!cv) return;
    var it = $("ext-t"), ia = $("ext-a");
    function planck(l, T) { var x = 1.4388e7 / (l * T); return 1 / (Math.pow(l, 5) * (Math.exp(x) - 1)); }
    function ext(l) { return Math.pow(550 / l, 1.3); }
    function draw() {
      var f = S.fit(cv, 0.5), c = f.ctx, w = f.w, h = f.h, T = +it.value, Av = +ia.value;
      $("ext-tv").textContent = T.toLocaleString() + " K"; $("ext-av").textContent = Av.toFixed(2) + " 등급";
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      var mx = 0; for (var l = 300; l <= 1000; l += 5) mx = Math.max(mx, planck(l, T));
      var A = S.axes(c, { x: 50, y: 14, w: w * 0.7 - 50, h: h - 52, x0: 300, x1: 1000, y0: 0, y1: 1.05, xl: "파장 (nm)", yl: "상대 세기", yt: [0, 0.5, 1] });
      for (var l2 = 380; l2 < 700; l2 += 4) { var hue = 270 - (l2 - 380) / 320 * 270; c.fillStyle = "hsla(" + hue + ",90%,55%,.18)"; c.fillRect(A.X(l2), 14, A.X(l2 + 4) - A.X(l2) + 0.5, h - 52); }
      c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 2; c.beginPath(); for (var l3 = 300; l3 <= 1000; l3 += 5) { var y = planck(l3, T) / mx; if (l3 === 300) c.moveTo(A.X(l3), A.Y(y)); else c.lineTo(A.X(l3), A.Y(y)); } c.stroke();
      c.strokeStyle = "#fbbf24"; c.beginPath(); for (var l4 = 300; l4 <= 1000; l4 += 5) { var y2 = planck(l4, T) / mx * Math.pow(10, -0.4 * Av * ext(l4)); if (l4 === 300) c.moveTo(A.X(l4), A.Y(y2)); else c.lineTo(A.X(l4), A.Y(y2)); } c.stroke(); c.lineWidth = 1;
      [[440, "B"], [550, "V"], [2200, "K"]].forEach(function (q) { if (q[0] > 1000) return; c.strokeStyle = "rgba(255,255,255,.4)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(A.X(q[0]), 14); c.lineTo(A.X(q[0]), h - 38); c.stroke(); c.setLineDash([]); c.fillStyle = "#fff"; c.font = S.font(11, true); c.fillText(q[1], A.X(q[0]) + 3, 28); });
      function rgb(att) { var r = 0, g = 0, b = 0; for (var l = 400; l <= 700; l += 10) { var v = planck(l, T) * (att ? Math.pow(10, -0.4 * Av * ext(l)) : 1); if (l > 580) r += v; else if (l > 490) g += v; else b += v; } var m = Math.max(r, g, b); return "rgb(" + Math.round(255 * r / m) + "," + Math.round(255 * g / m) + "," + Math.round(255 * b / m) + ")"; }
      var cx = w * 0.85, cy = h * 0.32;
      S.dot(c, cx, cy, Math.min(w, h) * 0.08, rgb(false)); S.dot(c, cx, h * 0.72, Math.min(w, h) * 0.08 * Math.pow(10, -0.1 * Av), rgb(true));
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText("티끌 없음", cx, cy + Math.min(w, h) * 0.08 + 16); c.fillText("티끌 통과 후", cx, h * 0.72 + Math.min(w, h) * 0.08 + 16); c.textAlign = "left";
      var AB = Av * ext(440), E = AB - Av;
      $("ext-out").innerHTML = "A<sub>B</sub> = <b>" + AB.toFixed(2) + "</b>, A<sub>V</sub> = <b>" + Av.toFixed(2) + "</b> 등급<br>색 초과 E(B−V) = A<sub>B</sub> − A<sub>V</sub> = <b>" + E.toFixed(2) + "</b><br>A<sub>V</sub>/E(B−V) = <b>" + (E > 0 ? (Av / E).toFixed(2) : "–") + "</b> (≈ 3.1)<br>K 밴드(2.2 μm) 소광 ≈ <b>" + (0.112 * Av).toFixed(2) + "</b> 등급";
    }
    it.addEventListener("input", draw); ia.addEventListener("input", draw); draw(); S.onResize(draw);
  })();

  /* ---------- 데이터 랩: 소광 지도 ---------- */
  (function () {
    var cv = $("lab-map"); if (!cv) return;
    var ZAMS = [[-0.1, -0.4], [0.0, 0.8], [0.2, 2.2], [0.4, 3.3], [0.6, 4.6], [0.8, 5.8], [1.0, 6.6], [1.2, 7.4], [1.4, 8.8]];
    function Mv(bv) { for (var i = 0; i < ZAMS.length - 1; i++) if (bv <= ZAMS[i + 1][0]) { var k = (bv - ZAMS[i][0]) / (ZAMS[i + 1][0] - ZAMS[i][0]); return ZAMS[i][1] + k * (ZAMS[i + 1][1] - ZAMS[i][1]); } return 8.8; }
    function Av(x, y) { var r = Math.hypot((x - 0.5) * 1.05, (y - 0.5) * 0.95); return r > 0.46 ? 0 : 32 / (1 + Math.pow(r / 0.09, 2)) - 32 / (1 + Math.pow(0.46 / 0.09, 2)); }
    var R = S.rand(68), ST = [];
    for (var i = 0; i < 700; i++) {
      var x = R(), y = R(), bv0 = Math.min(1.4, Math.max(-0.1, 0.75 + R.gauss() * 0.35)), d = 1500 + R() * 4500, DM = 5 * Math.log10(d) - 5, a = Av(x, y);
      var V0 = Mv(bv0) - 1.5 * R() + DM; // 일부 진화한 별로 조금 더 밝게
      var V = V0 + a + R.gauss() * 0.03, BV = bv0 + a / 3.1 + R.gauss() * 0.03, K = V0 - (2.2 * bv0 + 0.1) + 0.112 * a + R.gauss() * 0.03;
      ST.push({ x: x, y: y, bv0: +bv0.toFixed(2), V: +V.toFixed(2), BV: +BV.toFixed(3), K: +K.toFixed(2), A: a, dV: V < 22, dK: K < 19 });
    }
    ST.forEach(function (s) { s.Aest = s.dV ? 3.1 * (s.BV - s.bv0) : s.dK ? s.A + R.gauss() * 0.5 : null; });
    var view = "V", ig = $("lab-g");
    $("lab-view").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; view = b.dataset.v; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    ig.addEventListener("input", draw);
    $("lab-csv").addEventListener("click", function () { S.csv("dark_cloud_stars.csv", ["id", "x_arcmin", "y_arcmin", "V", "B_V", "K", "B_V_intrinsic", "detected_V", "detected_K"], ST.map(function (s, i) { return [i + 1, (s.x * 8).toFixed(3), (s.y * 8).toFixed(3), s.dV ? s.V : "", s.dV ? s.BV : "", s.dK ? s.K : "", s.bv0, s.dV ? 1 : 0, s.dK ? 1 : 0]; })); });
    function heat(v) { var t = Math.max(0, Math.min(1, v / 20)); var stops = [[13, 8, 135], [126, 3, 168], [204, 71, 120], [248, 149, 64], [240, 249, 33]]; var p = t * 4, k = Math.min(3, Math.floor(p)), u = p - k; var a = stops[k], b = stops[k + 1]; return "rgb(" + Math.round(a[0] + (b[0] - a[0]) * u) + "," + Math.round(a[1] + (b[1] - a[1]) * u) + "," + Math.round(a[2] + (b[2] - a[2]) * u) + ")"; }
    function draw() {
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h, N = +ig.value;
      $("lab-gv").textContent = N + " × " + N + " 칸";
      c.fillStyle = "#020309"; c.fillRect(0, 0, w, h);
      var sz = Math.min(w * 0.62, h - 20), ox = 12, oy = (h - sz) / 2;
      var nV = ST.filter(function (s) { return s.dV; }).length, nK = ST.filter(function (s) { return s.dK; }).length;
      if (view === "V" || view === "K") {
        ST.forEach(function (s) {
          var det = view === "V" ? s.dV : s.dK; if (!det) return;
          var mag = view === "V" ? s.V : s.K, r = Math.max(0.8, (view === "V" ? 22.5 : 18.5) - mag) * 0.55;
          var col = view === "V" ? S.tempColor(Math.max(2500, 7090 / (Math.min(3, s.BV) + 0.72))) : "rgba(255,200,170,.95)";
          c.fillStyle = col; c.beginPath(); c.arc(ox + s.x * sz, oy + s.y * sz, r, 0, 7); c.fill();
        });
        S.tag(c, view === "V" ? "V 필터 (가시광선)" : "K 필터 (근적외선 2.2 μm)", ox + 6, oy + 18, { size: 11 });
      } else if (view === "map") {
        var cell = sz / N;
        for (var gx = 0; gx < N; gx++) for (var gy = 0; gy < N; gy++) {
          var arr = ST.filter(function (s) { return s.Aest !== null && Math.floor(s.x * N) === gx && Math.floor(s.y * N) === gy; });
          if (!arr.length) { c.fillStyle = "#3f3f46"; } else { var m = arr.reduce(function (p, s) { return p + s.Aest; }, 0) / arr.length; c.fillStyle = heat(m); }
          c.fillRect(ox + gx * cell, oy + gy * cell, cell + 0.5, cell + 0.5);
        }
        var lx = ox + sz + 16; for (var k = 0; k <= 20; k++) { c.fillStyle = heat(20 - k); c.fillRect(lx, oy + k / 20 * sz * 0.6, 14, sz * 0.6 / 20 + 1); }
        c.fillStyle = "#fff"; c.font = S.font(10); c.fillText("A_V 20+", lx + 18, oy + 8); c.fillText("0", lx + 18, oy + sz * 0.6);
      } else {
        var A = S.axes(c, { x: 56, y: 14, w: w * 0.62, h: h - 52, x0: 0, x1: 4, y0: 0, y1: 35, xl: "구름 중심에서의 거리 (′)", yl: "A_V (등급)" });
        ST.forEach(function (s) { if (s.Aest === null) return; var r = Math.hypot(s.x - 0.5, s.y - 0.5) * 8; if (r > 4) return; S.dot(c, A.X(r), A.Y(Math.max(0, Math.min(35, s.Aest))), 2.5, s.dV ? "#60a5fa" : "#fb923c"); });
        c.strokeStyle = "#fbbf24"; c.lineWidth = 2; c.beginPath(); for (var rr = 0; rr <= 4; rr += 0.05) { var yv = Av(0.5 + rr / 8, 0.5); if (rr === 0) c.moveTo(A.X(rr), A.Y(yv)); else c.lineTo(A.X(rr), A.Y(yv)); } c.stroke(); c.lineWidth = 1;
        c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(11); c.fillText("● V로 잰 별  ● K로만 잰 별  — 모형", A.X(1.5), 30);
      }
      var cells = 0, filled = 0, Ncell = N * N;
      if (view === "map") { for (var a2 = 0; a2 < N; a2++) for (var b2 = 0; b2 < N; b2++) { cells++; if (ST.some(function (s) { return s.Aest !== null && Math.floor(s.x * N) === a2 && Math.floor(s.y * N) === b2; })) filled++; } }
      $("lab-kpi").innerHTML = "<div><small>V 검출 별</small><b>" + nV + "</b></div><div><small>K 검출 별</small><b>" + nK + "</b></div><div><small>전체 배경 별</small><b>" + ST.length + "</b></div>" + (view === "map" ? "<div><small>값이 있는 칸</small><b>" + Math.round(filled / Ncell * 100) + "%</b></div>" : "");
      $("lab-out").innerHTML = { V: "구름 가운데에 별이 거의 없다. 가장자리 별들은 붉게(색지수가 크게) 보인다.", K: "근적외선에서는 구름 뒤쪽 별이 대부분 보인다! 별은 사라진 것이 아니라 가려져 있었다.", map: "V로 잰 별은 E(B−V)로, V에서 사라진 별은 근적외선 색(H−K)으로 A<sub>V</sub>를 구했다(실제 연구 방법). 칸마다 평균한 값을 색으로 나타냈다.", prof: "중심에 가까울수록 A<sub>V</sub>가 급격히 커진다. 중심부 수 분각 안은 A<sub>V</sub> 10등급 이상." }[view];
    }
    draw(); S.onResize(draw);
  })();
})();
