/* II-03 별의 운동 */
(function () {
  var S = window.SIM, $ = S.$, D2R = Math.PI / 180;

  /* ---------- 시뮬레이션 1: 공간 속도 분해 ---------- */
  (function () {
    var cv = $("sim-vel"); if (!cv) return;
    var is = $("vel-s"), ia = $("vel-a"), idd = $("vel-d"), t = 0;
    S.loop(function (dt) {
      var f = S.fit(cv, 0.56), c = f.ctx, w = f.w, h = f.h;
      var v = +is.value, ang = +ia.value, d = +idd.value;
      $("vel-sv").textContent = v + " km/s"; $("vel-av").textContent = ang + "°"; $("vel-dv").textContent = d.toFixed(1) + " pc";
      var vr = v * Math.cos(ang * D2R), vt = v * Math.sin(ang * D2R), mu = vt / (4.74 * d);
      t += dt;
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 왼쪽: 벡터
      var ox = w * 0.22, oy = h * 0.88, sx = ox, sy = h * 0.46, sc = Math.min(w * 0.18, h * 0.34) / 200 / 0.9;
      S.dot(c, ox, oy, 6, "#60a5fa"); c.fillStyle = "#93c5fd"; c.font = S.font(11, true); c.textAlign = "center"; c.fillText("관측자 (태양계)", ox, oy + 20);
      c.strokeStyle = "rgba(255,255,255,.25)"; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(ox, oy); c.lineTo(sx, 20); c.stroke(); c.setLineDash([]);
      c.fillStyle = "rgba(255,255,255,.5)"; c.fillText("시선 방향", sx + 30, 30);
      var L = 0.9 * sc, ex = sx + Math.sin(ang * D2R) * v * L, ey = sy - Math.cos(ang * D2R) * v * L;
      S.arrow(c, sx, sy, sx, sy - vr * L, "#f87171", 3); S.arrow(c, sx, sy, sx + vt * L, sy, "#34d399", 3); S.arrow(c, sx, sy, ex, ey, "#fbbf24", 3.5);
      c.strokeStyle = "rgba(255,255,255,.25)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(ex, ey); c.lineTo(sx, sy - vr * L); c.moveTo(ex, ey); c.lineTo(sx + vt * L, sy); c.stroke(); c.setLineDash([]);
      S.dot(c, sx, sy, 8, "#fde68a");
      c.textAlign = "left"; c.font = S.font(11, true);
      c.fillStyle = "#fbbf24"; c.fillText("공간 속도 " + v, ex + 6, ey - 4);
      c.fillStyle = "#f87171"; c.fillText("시선 " + vr.toFixed(0), sx + 6, sy - vr * L + (vr > 0 ? -4 : 14));
      c.fillStyle = "#34d399"; c.fillText("접선 " + vt.toFixed(0), sx + vt * L + 4, sy + 16);
      // 오른쪽 위: 스펙트럼
      var gx = w * 0.48, gw = w * 0.49, gy = 18, gh = h * 0.3;
      var grd = c.createLinearGradient(gx, 0, gx + gw, 0);
      ["#6d28d9", "#2563eb", "#06b6d4", "#22c55e", "#facc15", "#f97316", "#dc2626"].forEach(function (col, i) { grd.addColorStop(i / 6, col); });
      c.fillStyle = grd; c.fillRect(gx, gy, gw, gh);
      var lines = [486.1, 589.0, 656.3], lam = function (l) { return gx + (l - 450) / (680 - 450) * gw; };
      lines.forEach(function (l) {
        var obs = l * (1 + vr / 3e5), x0 = lam(l), x1 = lam(l + (obs - l) * 60);
        c.strokeStyle = "rgba(255,255,255,.9)"; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x0, gy - 4); c.lineTo(x0, gy + gh + 4); c.stroke(); c.setLineDash([]);
        c.fillStyle = "#000"; c.fillRect(x1 - 1.5, gy, 3, gh);
      });
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11); c.fillText("스펙트럼 (이동량 60배 과장) · 점선 = 기준 파장", gx, gy + gh + 16);
      // 오른쪽 아래: 고유 운동
      var px = w * 0.48, py = h * 0.6, pw = w * 0.49, ph = h * 0.34;
      c.strokeStyle = "rgba(255,255,255,.25)"; c.strokeRect(px, py, pw, ph);
      var span = 100 * mu; // 100년 동안 이동(″)
      var scl = pw * 0.8 / Math.max(5, span * 1.2);
      var k = (t % 4) / 4;
      c.strokeStyle = "rgba(52,211,153,.5)"; c.beginPath(); c.moveTo(px + pw * 0.1, py + ph / 2); c.lineTo(px + pw * 0.1 + span * scl, py + ph / 2); c.stroke();
      S.dot(c, px + pw * 0.1 + span * scl * k, py + ph / 2, 5, "#fde68a");
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11); c.fillText("100년 동안 천구 위 이동: " + span.toFixed(1) + "″ (" + Math.round(1920 + 100 * k) + "년)", px + 6, py + 16);
      $("vel-out").innerHTML = "시선 속도 v<sub>r</sub> = <b>" + vr.toFixed(1) + " km/s</b> " + (vr > 0.5 ? "(멀어짐, 적색 편이)" : vr < -0.5 ? "(다가옴, 청색 편이)" : "") + "<br>접선 속도 v<sub>t</sub> = <b>" + vt.toFixed(1) + " km/s</b><br>고유 운동 μ = v<sub>t</sub>/(4.74 r) = <b>" + mu.toFixed(3) + "″/년</b><br>Hα 이동 Δλ = <b>" + (656.28 * vr / 3e5).toFixed(3) + " nm</b>";
    });
  })();

  /* ---------- 데이터 랩: 북두칠성 ---------- */
  (function () {
    var cv = $("lab-ud"); if (!cv) return;
    // [이름, 적경°, 적위°, μα*(mas/년), μδ(mas/년), 시차(mas), 시선 속도(km/s), V]
    var D = [["두베 (α)", 165.932, 61.751, -134.1, -34.7, 26.54, -9.4, 1.79], ["메라크 (β)", 165.460, 56.383, 81.4, 33.5, 40.90, -12.0, 2.37],
      ["페크다 (γ)", 178.458, 53.695, 107.7, 11.0, 39.21, -12.6, 2.44], ["메그레즈 (δ)", 183.857, 57.033, 104.1, 7.3, 40.05, -13.4, 3.31],
      ["알리오스 (ε)", 193.507, 55.960, 111.9, -8.2, 39.51, -9.3, 1.77], ["미자르 (ζ)", 200.981, 54.926, 119.0, -25.9, 38.01, -6.3, 2.27],
      ["알카이드 (η)", 206.885, 49.313, -121.2, -15.0, 31.38, -10.7, 1.86]];
    var LINES = [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]];
    var GROUP = [1, 2, 3, 4, 5];
    var it = $("lab-t"), view = "sky", anim = false, dir = 1;
    var ra0 = 186, de0 = 56.5;
    function derived(r) { var dist = 1000 / r[5], mu = Math.hypot(r[3], r[4]) / 1000, vt = 4.74 * mu * dist; return { d: dist, vt: vt, v: Math.hypot(vt, r[6]) }; }
    S.table($("lab-table"), ["별", "적경 (°)", "적위 (°)", "μα* (mas/년)", "μδ (mas/년)", "시차 (mas)", "거리 (pc)", "접선 속도 (km/s)", "시선 속도 (km/s)", "공간 속도 (km/s)"],
      D.map(function (r) { var q = derived(r); return [r[0], r[1].toFixed(2), r[2].toFixed(2), r[3], r[4], r[5], q.d.toFixed(1), q.vt.toFixed(1), r[6], q.v.toFixed(1)]; }));
    $("lab-anim").addEventListener("click", function () { anim = !anim; this.textContent = anim ? "⏸ 멈춤" : "▶ 자동 재생"; this.classList.toggle("on", anim); });
    $("lab-view").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; view = b.dataset.v; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); });
    $("lab-csv").addEventListener("click", function () { S.csv("big_dipper_hipparcos.csv", ["star", "ra_deg", "dec_deg", "pmra_masyr", "pmdec_masyr", "parallax_mas", "rv_kms", "Vmag"], D); });
    function pos(r, yr) { // 접평면 좌표 (도): x = 동쪽(+), y = 북쪽(+)
      var dx = (r[1] - ra0) * Math.cos(r[2] * D2R) + r[3] * yr / 3.6e6, dy = (r[2] - de0) + r[4] * yr / 3.6e6;
      return [dx, dy];
    }
    S.loop(function (dt) {
      if (anim) { var v = +it.value + dir * dt * 30000; if (v > 100000 || v < -100000) { dir = -dir; v = Math.max(-100000, Math.min(100000, v)); } it.value = v; }
      var f = S.fit(cv, 0.62), c = f.ctx, w = f.w, h = f.h, yr = +it.value;
      $("lab-tv").textContent = yr === 0 ? "현재" : (yr > 0 ? "+" : "") + (yr / 10000).toFixed(1) + "만 년";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      if (view === "sky") {
        S.stars(c, w, h, 90, 13);
        var sc = Math.min(w / 34, h / 22), cx = w / 2, cy = h / 2;
        function P(q) { return [cx - q[0] * sc, cy - q[1] * sc]; } // 동쪽이 왼쪽
        // 현재 모양 (흐리게)
        if (yr !== 0) { c.strokeStyle = "rgba(255,255,255,.15)"; c.setLineDash([3, 4]); LINES.forEach(function (l) { var a = P(pos(D[l[0]], 0)), b = P(pos(D[l[1]], 0)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }); c.setLineDash([]); }
        c.strokeStyle = "rgba(147,197,253,.7)"; c.lineWidth = 1.5; LINES.forEach(function (l) { var a = P(pos(D[l[0]], yr)), b = P(pos(D[l[1]], yr)); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }); c.lineWidth = 1;
        D.forEach(function (r, i) {
          var p = P(pos(r, yr)), rad = 7 - r[7] * 1.2;
          if ($("lab-vec").checked) { var q = P(pos(r, yr + 10000)); S.arrow(c, p[0], p[1], q[0], q[1], GROUP.indexOf(i) >= 0 ? "rgba(52,211,153,.8)" : "rgba(248,113,113,.9)", 1.5); }
          var g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], rad * 2.2); g.addColorStop(0, "#fff"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], rad * 2.2, 0, 7); c.fill();
          c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(11); c.fillText(r[0], p[0] + 8, p[1] - 8);
        });
        c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(11, true); c.fillText("북 ↑   ← 동", 12, 18);
      } else {
        var A = S.axes(c, { x: 60, y: 16, w: w - 80, h: h - 58, x0: -160, x1: 160, y0: -60, y1: 60, xl: "μα* (mas/년)", yl: "μδ (mas/년)" });
        c.strokeStyle = "rgba(52,211,153,.6)"; c.setLineDash([4, 4]); c.beginPath(); c.ellipse(A.X(104), A.Y(3.5), A.X(130) - A.X(104), A.Y(-30) - A.Y(3.5), 0, 0, 7); c.stroke(); c.setLineDash([]);
        D.forEach(function (r, i) { var X = A.X(r[3]), Y = A.Y(r[4]), g = GROUP.indexOf(i) >= 0; S.dot(c, X, Y, 6 + (r[5] - 25) / 4, g ? "#34d399" : "#f87171", "#000"); c.fillStyle = "rgba(255,255,255,.85)"; c.font = S.font(11); c.fillText(r[0] + " · " + (1000 / r[5]).toFixed(0) + " pc", X + 10, Y + 4); });
        S.tag(c, "운동 성단 후보", A.X(104), A.Y(40), { align: "center", bg: "rgba(15,157,107,.85)", size: 11 });
      }
      var sp = function (i, j) { var a = pos(D[i], yr), b = pos(D[j], yr); return Math.hypot(a[0] - b[0], a[1] - b[1]); };
      $("lab-out").innerHTML = (view === "sky" ? "두베–메라크 간격 <b>" + sp(0, 1).toFixed(2) + "°</b> (현재 " + Math.hypot(pos(D[0], 0)[0] - pos(D[1], 0)[0], pos(D[0], 0)[1] - pos(D[1], 0)[1]).toFixed(2) + "°)<br>미자르–알카이드 간격 <b>" + sp(5, 6).toFixed(2) + "°</b><br>초록 화살표: 같은 방향으로 움직이는 별" : "점 크기 = 시차(가까울수록 큼)<br>초록 무리: 고유 운동과 거리가 비슷한 5개 별<br>빨강: 다른 방향으로 움직이는 두베·알카이드");
    });
  })();
})();
