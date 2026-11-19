/* II-01 태양 관측 */
(function () {
  var S = window.SIM, $ = S.$, D2R = Math.PI / 180;

  /* ---------- 시뮬레이션 1: 흑점으로 자전 주기 ---------- */
  (function () {
    var cv = $("sim-rot"); if (!cv) return;
    function syn(lat) { var s2 = Math.pow(Math.sin(lat * D2R), 2); return 14.71 - 2.39 * s2 - 1.78 * s2 * s2 - 0.9856; }
    var SP = [["A", 0, -78], ["B", 20, -70], ["C", 35, -74]], rec = [];
    var id = $("rot-d");
    function lon(sp, d) { return sp[2] + syn(sp[1]) * d; }
    $("rot-rec").addEventListener("click", function () { var d = +id.value; rec = rec.filter(function (r) { return r.d !== d; }); rec.push({ d: d, l: SP.map(function (s) { return lon(s, d); }) }); rec.sort(function (a, b) { return a.d - b.d; }); draw(); });
    $("rot-clr").addEventListener("click", function () { rec = []; draw(); });
    id.addEventListener("input", draw);
    function draw() {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h, d = +id.value;
      $("rot-dv").textContent = d + "일째";
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      var cx = w * 0.42, cy = h * 0.5, R = Math.min(w * 0.36, h * 0.44);
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, "#fff1c1"); g.addColorStop(0.7, "#fbbf24"); g.addColorStop(1, "#c2410c");
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
      // 경위선
      c.strokeStyle = "rgba(0,0,0,.18)";
      for (var L = -75; L <= 75; L += 15) { c.beginPath(); for (var la = -90; la <= 90; la += 3) { var x = cx + R * Math.cos(la * D2R) * Math.sin(L * D2R), y = cy - R * Math.sin(la * D2R); if (la === -90) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke(); }
      [-60, -40, -20, 0, 20, 40, 60].forEach(function (la) { var y = cy - R * Math.sin(la * D2R), hw = R * Math.cos(la * D2R); c.beginPath(); c.moveTo(cx - hw, y); c.lineTo(cx + hw, y); c.stroke(); });
      c.fillStyle = "rgba(0,0,0,.55)"; c.font = S.font(10, true); c.fillText("0°", cx + R * 0.02, cy - 3); c.fillText("20°", cx + R * 0.02, cy - R * Math.sin(20 * D2R) - 3); c.fillText("35°", cx + R * 0.02, cy - R * Math.sin(35 * D2R) - 3);
      SP.forEach(function (s, k) {
        var l = lon(s, d); if (Math.abs(l) >= 88) return;
        var x = cx + R * Math.cos(s[1] * D2R) * Math.sin(l * D2R), y = cy - R * Math.sin(s[1] * D2R), fs = Math.cos(l * D2R);
        c.fillStyle = "rgba(60,30,10,.55)"; c.beginPath(); c.ellipse(x, y, 13 * fs, 11, 0, 0, 7); c.fill();
        c.fillStyle = "#1c0f05"; c.beginPath(); c.ellipse(x, y, 6 * fs, 5, 0, 0, 7); c.fill();
        S.tag(c, s[0], x + 10, y - 10, { size: 11 });
      });
      c.fillStyle = "rgba(255,255,255,.8)"; c.font = S.font(12, true); c.fillText("동", cx - R - 22, cy + 4); c.fillText("서", cx + R + 8, cy + 4);
      // 기록 표
      var tx = w * 0.82;
      c.font = S.font(11, true); c.fillStyle = "rgba(255,255,255,.85)"; c.fillText("기록 (경도°)", tx - 20, 22);
      c.font = S.font(11); rec.slice(-12).forEach(function (r, i) { c.fillText(r.d + "일: " + r.l.map(function (v) { return Math.abs(v) < 90 ? Math.round(v) : "–"; }).join(" / "), tx - 20, 42 + i * 16); });
      var html = "흑점 A(0°) · B(20°) · C(35°)<br>현재 경도: " + SP.map(function (s) { var l = lon(s, d); return s[0] + " " + (Math.abs(l) < 90 ? Math.round(l) + "°" : "뒷면"); }).join(", ");
      if (rec.length >= 2) {
        var a = rec[0], b = rec[rec.length - 1], dd = b.d - a.d;
        html += "<br><b>" + a.d + " → " + b.d + "일 계산</b>";
        SP.forEach(function (s, k) { if (Math.abs(a.l[k]) < 90 && Math.abs(b.l[k]) < 90 && dd > 0) { var rate = (b.l[k] - a.l[k]) / dd; html += "<br>" + s[0] + ": " + rate.toFixed(2) + "°/일 → 회합 주기 <b>" + (360 / rate).toFixed(1) + "일</b>"; } });
      } else html += "<br>날짜를 바꿔 가며 두 번 이상 기록하자.";
      $("rot-out").innerHTML = html;
    }
    draw(); S.onResize(draw);
  })();

  /* ---------- 시뮬레이션 2: 나비 도표 ---------- */
  (function () {
    var cv = $("sim-bfly"); if (!cv) return;
    var R = S.rand(1858), t = 0, run = true, pts = [], spots = [], counts = [];
    $("bf-play").addEventListener("click", function () { run = !run; this.textContent = run ? "⏸ 멈춤" : "▶ 재생"; this.classList.toggle("on", run); });
    $("bf-reset").addEventListener("click", function () { t = 0; pts = []; spots = []; counts = []; });
    var TMAX = 33;
    function act(tt) { var a = 0; for (var c = -1; c < 4; c++) { var s = (tt - 11 * c) / 11; if (s >= 0 && s <= 1.25) a += Math.pow(Math.sin(Math.PI * s / 1.25), 2) * (c === 1 ? 1.3 : c === 2 ? 0.8 : 1); } return a; }
    S.loop(function (dt) {
      var f = S.fit(cv, 0.56), c = f.ctx, w = f.w, h = f.h;
      if (run && t < TMAX) {
        var step = dt * +$("bf-sp").value * 0.6; t += step;
        for (var cyc = -1; cyc < 4; cyc++) {
          var s = (t - 11 * cyc) / 11; if (s < 0 || s > 1.25) continue;
          var rate = Math.pow(Math.sin(Math.PI * s / 1.25), 2) * (cyc === 1 ? 1.3 : cyc === 2 ? 0.8 : 1) * 60 * step;
          for (var k = 0; k < rate; k++) {
            if (rate - k < 1 && R() > rate - k) break;
            var lat = (30 - 24 * Math.min(1, s)) + R.gauss() * 4.5, sg = R() < 0.5 ? -1 : 1;
            pts.push([t, sg * Math.max(2, lat)]);
            spots.push({ lat: sg * lat, lon: -80 + R() * 160, life: 0.25 + R() * 0.3 });
          }
        }
        counts.push([t, act(t)]);
      }
      spots.forEach(function (s) { s.life -= dt * +$("bf-sp").value * 0.6; }); spots = spots.filter(function (s) { return s.life > 0; });
      c.fillStyle = "#05070e"; c.fillRect(0, 0, w, h);
      // 태양 원반
      var cx = w * 0.17, cy = h * 0.5, Rr = Math.min(w * 0.14, h * 0.4);
      var g = c.createRadialGradient(cx, cy, 0, cx, cy, Rr); g.addColorStop(0, "#fff1c1"); g.addColorStop(0.75, "#fbbf24"); g.addColorStop(1, "#c2410c");
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, Rr, 0, 7); c.fill();
      spots.forEach(function (s) { var x = cx + Rr * Math.cos(s.lat * D2R) * Math.sin(s.lon * D2R), y = cy - Rr * Math.sin(s.lat * D2R); c.fillStyle = "rgba(30,15,5,.85)"; c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); });
      c.fillStyle = "#fff"; c.font = S.font(12, true); c.textAlign = "center"; c.fillText(Math.floor(1986 + t) + "년", cx, cy + Rr + 22); c.textAlign = "left";
      // 나비 도표
      var A = S.axes(c, { x: w * 0.4, y: 12, w: w * 0.57, h: h * 0.52, x0: 0, x1: TMAX, y0: -45, y1: 45, yt: [-40, -20, 0, 20, 40], xt: [0, 11, 22, 33], xfmt: function (v) { return 1986 + v; }, yl: "위도(°)" });
      pts.forEach(function (p) { c.fillStyle = "rgba(251,191,36,.7)"; c.fillRect(A.X(p[0]), A.Y(p[1]), 2, 2); });
      var B = S.axes(c, { x: w * 0.4, y: h * 0.7, w: w * 0.57, h: h * 0.2, x0: 0, x1: TMAX, y0: 0, y1: 1.5, yt: [], xt: [0, 11, 22, 33], xfmt: function (v) { return 1986 + v; }, yl: "흑점 수" });
      c.strokeStyle = "#60a5fa"; c.lineWidth = 2; c.beginPath(); counts.forEach(function (q, i) { if (i) c.lineTo(B.X(q[0]), B.Y(q[1])); else c.moveTo(B.X(q[0]), B.Y(q[1])); }); c.stroke(); c.lineWidth = 1;
      var s0 = ((t % 11) + 11) % 11;
      $("bf-out").innerHTML = "주기 시작 후 <b>" + s0.toFixed(1) + "년</b><br>새 흑점의 평균 위도 약 <b>" + Math.round(30 - 24 * Math.min(1, s0 / 11)) + "°</b><br>(모형: 주기 11년, 실제 자료처럼 이웃 주기가 조금 겹침)";
    });
  })();

  /* ---------- 시뮬레이션 3: 다파장 태양 ---------- */
  (function () {
    var cv = $("sim-wave"); if (!cv) return;
    var mode = "vis", cache = {};
    var INFO = {
      vis: "가시광선: 광구(약 5800 K). 흑점은 <b>어둡게</b>, 가장자리는 주연 감광으로 어둡다. 코로나·필라멘트는 보이지 않는다.",
      ha: "Hα: 채층(약 1만 K). 활동 영역 주변이 밝은 플라주로, 필라멘트는 <b>어두운 실</b>로, 가장자리 밖 홍염은 <b>밝게</b> 보인다.",
      euv: "극자외선 171 Å: 약 60만 ~ 100만 K의 코로나. 활동 영역 위 <b>코로나 고리</b>가 밝고, 코로나 구멍은 어둡다. 가장자리 밖으로도 빛이 퍼진다.",
      xray: "X선: 수백만 K의 뜨거운 코로나. 활동 영역(흑점 위)이 <b>가장 밝고</b>, 코로나 구멍은 <b>검게</b> 보인다. 광구는 거의 보이지 않는다."
    };
    $("wave-sel").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; mode = b.dataset.w; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    $("wave-ann").addEventListener("change", draw);
    function hash(x, y) { var n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); }
    function noise(x, y) { var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; var a = hash(xi, yi), b = hash(xi + 1, yi), c2 = hash(xi, yi + 1), d = hash(xi + 1, yi + 1); var u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (c2 - a) * v + (a - b - c2 + d) * u * v; }
    function P(lat, lon) { return [Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R)]; }
    var AR = [P(16, -28), P(-12, 30)], CH = P(-42, -4), FIL = [P(36, -18), P(38, -2), P(34, 14), P(37, 28)], PROM = [-1, 0.12];
    function render(m, n) {
      var cvs = document.createElement("canvas"); cvs.width = n; cvs.height = n;
      var c = cvs.getContext("2d"), img = c.createImageData(n, n), d = img.data, Rp = n * 0.36;
      for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
        var x = (i - n / 2) / Rp, y = -(j - n / 2) / Rp, r = Math.hypot(x, y), k = (j * n + i) * 4, v = 0, rgb;
        var dAR = Math.min(Math.hypot(x - AR[0][0], y - AR[0][1]), Math.hypot(x - AR[1][0], y - AR[1][1]));
        var dCH = Math.hypot((x - CH[0]) * 0.8, (y - CH[1]) * 1.3);
        var dF = 9; for (var q = 0; q < FIL.length - 1; q++) { var ax = FIL[q][0], ay = FIL[q][1], bx = FIL[q + 1][0], by = FIL[q + 1][1], t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) * (bx - ax) + (by - ay) * (by - ay)))); dF = Math.min(dF, Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay))); }
        if (m === "vis") {
          if (r < 1) { var mu = Math.sqrt(1 - r * r); v = (0.4 + 0.6 * mu) * (0.94 + 0.06 * noise(x * 90, y * 90)); if (dAR < 0.035) v *= 0.22; else if (dAR < 0.07) v *= 0.6; } else v = 0;
          rgb = [255 * v, 205 * v, 120 * v];
        } else if (m === "ha") {
          if (r < 1) { var mu2 = Math.sqrt(1 - r * r); v = (0.6 + 0.4 * mu2) * (0.78 + 0.3 * noise(x * 28, y * 28)); v += 0.5 * Math.exp(-Math.pow(dAR / 0.12, 2)); if (dAR < 0.03) v *= 0.4; v *= 1 - 0.75 * Math.exp(-Math.pow(dF / 0.018, 2)); }
          else { var ang = Math.atan2(y - PROM[1], x - PROM[0]), dp = Math.hypot(x - PROM[0], y - PROM[1]); v = r < 1.02 ? 0.35 : 0; if (x < 0 && dp > 0.02 && dp < 0.16 && Math.abs(Math.hypot(x + 1.0, (y - 0.12) * 1.4) - 0.1) < 0.025 && x < -0.98) v = 0.9 * (0.7 + 0.3 * noise(x * 60, y * 60)); }
          rgb = [255 * Math.min(1, v), 70 * v, 50 * v];
        } else if (m === "euv") {
          var base = r < 1 ? 0.32 + 0.25 * Math.pow(r, 6) : 0.55 * Math.exp(-(r - 1) / 0.08);
          base *= 0.85 + 0.3 * noise(x * 14, y * 14);
          var loops = 0; [0, 1].forEach(function (a) { var dx = x - AR[a][0], dy = y - AR[a][1], rr2 = Math.hypot(dx, dy * 1.6); loops += Math.exp(-Math.pow((rr2 - 0.09) / 0.02, 2)) * (0.6 + 0.4 * Math.sin(Math.atan2(dy, dx) * 9)) + 1.2 * Math.exp(-Math.pow(rr2 / 0.07, 2)); });
          v = base + 0.8 * loops; if (r < 1) v *= 1 - 0.8 * Math.exp(-Math.pow(dCH / 0.14, 4)); if (r < 1) v *= 1 - 0.35 * Math.exp(-Math.pow(dF / 0.03, 2));
          rgb = [255 * Math.min(1, v * 1.1), 190 * Math.min(1, v), 60 * Math.min(1, v)];
        } else {
          var bx2 = r < 1 ? 0.13 : 0.2 * Math.exp(-(r - 1) / 0.06);
          bx2 *= 0.8 + 0.4 * noise(x * 10, y * 10);
          v = bx2 + 1.6 * Math.exp(-Math.pow(dAR / 0.09, 2)); if (r < 1) v *= 1 - 0.95 * Math.exp(-Math.pow(dCH / 0.15, 4));
          rgb = [235 * Math.min(1, v), 235 * Math.min(1, v), 245 * Math.min(1, v)];
        }
        d[k] = rgb[0]; d[k + 1] = rgb[1]; d[k + 2] = rgb[2]; d[k + 3] = 255;
      }
      c.putImageData(img, 0, 0); return cvs;
    }
    function draw() {
      var f = S.fit(cv, 0.6), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
      var n = Math.round(Math.min(h, w * 0.7) * (window.devicePixelRatio || 1));
      var key = mode + n; if (!cache[key]) cache[key] = render(mode, n);
      var sz = Math.min(h, w * 0.7), ox = (w - sz) / 2, oy = (h - sz) / 2;
      c.drawImage(cache[key], ox, oy, sz, sz);
      if ($("wave-ann").checked) {
        var Rp = sz * 0.36, cx = ox + sz / 2, cy = oy + sz / 2;
        function at(p) { return [cx + p[0] * Rp, cy - p[1] * Rp]; }
        var a1 = at(AR[0]), a2 = at(AR[1]), ch = at(CH), fl = at(FIL[2]);
        S.tag(c, "활동 영역 1", a1[0] - 40, a1[1] - 22, { size: 11, bg: "rgba(37,99,235,.8)" });
        S.tag(c, "활동 영역 2", a2[0] + 14, a2[1] + 24, { size: 11, bg: "rgba(37,99,235,.8)" });
        S.tag(c, "코로나 구멍", ch[0] - 30, ch[1] + 40, { size: 11, bg: "rgba(37,99,235,.8)" });
        S.tag(c, "필라멘트", fl[0] + 8, fl[1] - 16, { size: 11, bg: "rgba(37,99,235,.8)" });
        S.tag(c, "홍염", cx - Rp - 54, cy - 0.12 * Rp - 12, { size: 11, bg: "rgba(37,99,235,.8)" });
      }
      var lab = { vis: "가시광선 (광구)", ha: "Hα 656.3 nm (채층)", euv: "극자외선 171 Å (코로나)", xray: "X선 (뜨거운 코로나)" }[mode];
      S.tag(c, lab, 10, 24, { bg: "rgba(0,0,0,.7)" });
      $("wave-out").innerHTML = INFO[mode];
    }
    draw(); S.onResize(function () { cache = {}; draw(); });
  })();

  /* ---------- 데이터 랩: 흑점 수 ---------- */
  (function () {
    var cv = $("lab-ssn"); if (!cv) return;
    // [주기, 극소 연도, 극대 연도, 극대 흑점 수(13개월 평활, 2판)]
    var C = [[0, 1744.9, 1750.3, 140], [1, 1755.2, 1761.5, 144.1], [2, 1766.5, 1769.7, 193.0], [3, 1775.5, 1778.4, 264.3], [4, 1784.7, 1788.1, 235.3],
      [5, 1798.3, 1805.2, 82.0], [6, 1810.6, 1816.4, 81.2], [7, 1823.3, 1829.9, 119.2], [8, 1833.9, 1837.2, 244.9], [9, 1843.5, 1848.1, 219.9],
      [10, 1855.9, 1860.1, 186.2], [11, 1867.2, 1870.6, 234.0], [12, 1878.9, 1883.9, 124.4], [13, 1890.2, 1894.1, 146.5], [14, 1902.0, 1906.2, 107.1],
      [15, 1913.6, 1917.6, 175.7], [16, 1923.6, 1928.4, 130.2], [17, 1933.8, 1937.4, 198.6], [18, 1944.2, 1947.4, 218.7], [19, 1954.3, 1958.2, 285.0],
      [20, 1964.9, 1968.9, 156.6], [21, 1976.5, 1979.9, 232.9], [22, 1986.8, 1989.6, 212.5], [23, 1996.4, 2001.9, 180.3], [24, 2008.9, 2014.3, 116.4],
      [25, 2019.9, 2024.8, 161.0]];
    var R = S.rand(1749), Y = [], N = [];
    for (var yr = 1749; yr <= 2024; yr++) {
      var t = yr + 0.5, v = 8;
      for (var i = 0; i < C.length; i++) {
        var mn = C[i][1], mx = C[i][2], nx = i + 1 < C.length ? C[i + 1][1] : 2031, A = C[i][3];
        if (t >= mn && t < mx) { var x = (t - mn) / (mx - mn); v = 8 + (A * 0.93 - 8) * (1 - Math.cos(Math.PI * x)) / 2; }
        else if (t >= mx && t < nx) { var y2 = (t - mx) / (nx - mx); v = 8 + (A * 0.93 - 8) * Math.pow((1 + Math.cos(Math.PI * y2)) / 2, 1.25); }
      }
      Y.push(yr); N.push(Math.max(1, +(v * (1 + R.gauss() * 0.07)).toFixed(1)));
    }
    var mode = "ts";
    $("lab-mode").addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (!b) return; mode = b.dataset.m; this.querySelectorAll(".chip").forEach(function (x) { x.classList.toggle("on", x === b); }); draw(); });
    $("lab-csv").addEventListener("click", function () { S.csv("sunspot_yearly.csv", ["year", "sunspot_number"], Y.map(function (y, i) { return [y, N[i]]; })); });
    // 봉우리
    var peaks = [];
    for (var k = 0; k < N.length; k++) { var ok = N[k] > 45; for (var j = Math.max(0, k - 4); j <= Math.min(N.length - 1, k + 4); j++) if (N[j] > N[k]) ok = false; if (ok) peaks.push(k); }
    var gaps = []; for (var p = 1; p < peaks.length; p++) gaps.push(Y[peaks[p]] - Y[peaks[p - 1]]);
    var gm = gaps.reduce(function (a, b) { return a + b; }, 0) / gaps.length, gs = Math.sqrt(gaps.reduce(function (a, b) { return a + (b - gm) * (b - gm); }, 0) / (gaps.length - 1));
    // DFT
    var mean = N.reduce(function (a, b) { return a + b; }, 0) / N.length, spec = [];
    for (var per = 2; per <= 150; per *= 1.01) { var re = 0, im = 0; N.forEach(function (v, i) { var a = 2 * Math.PI * i / per; re += (v - mean) * Math.cos(a); im += (v - mean) * Math.sin(a); }); spec.push([per, (re * re + im * im) / N.length]); }
    var top = spec.reduce(function (m, q) { return q[1] > m[1] ? q : m; });
    // 상승 기간–세기
    var rise = C.slice(1).map(function (q) { return [+(q[2] - q[1]).toFixed(1), q[3], q[0]]; }), L = S.linreg(rise.map(function (q) { return q[0]; }), rise.map(function (q) { return q[1]; }));
    var rr = -Math.sqrt(L.r2);
    function draw() {
      var f = S.fit(cv, 0.42), c = f.ctx, w = f.w, h = f.h;
      c.fillStyle = "#0b0e17"; c.fillRect(0, 0, w, h);
      if (mode === "ts" || mode === "peak") {
        var A = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: 1749, x1: 2025, y0: 0, y1: 300, xl: "연도", yl: "흑점 수", xfmt: function (v) { return v; } });
        c.fillStyle = "rgba(251,191,36,.25)"; c.beginPath(); c.moveTo(A.X(1749), A.Y(0)); Y.forEach(function (y, i) { c.lineTo(A.X(y), A.Y(N[i])); }); c.lineTo(A.X(2024), A.Y(0)); c.fill();
        c.strokeStyle = "#fbbf24"; c.lineWidth = 1.5; c.beginPath(); Y.forEach(function (y, i) { if (i) c.lineTo(A.X(y), A.Y(N[i])); else c.moveTo(A.X(y), A.Y(N[i])); }); c.stroke(); c.lineWidth = 1;
        if (mode === "peak") peaks.forEach(function (k, i) { S.dot(c, A.X(Y[k]), A.Y(N[k]), 4, "#ef4444"); if (i) { c.fillStyle = "rgba(255,255,255,.75)"; c.font = S.font(10); c.textAlign = "center"; c.fillText(gaps[i - 1], (A.X(Y[k]) + A.X(Y[peaks[i - 1]])) / 2, A.Y(Math.max(N[k], N[peaks[i - 1]])) - 8); c.textAlign = "left"; } });
        $("lab-out").innerHTML = mode === "ts" ? "연평균 흑점 수 · <b>" + Y.length + "년</b> 자료<br>극대의 높이가 주기마다 크게 다르다는 점에 주목하자. 1800 ~ 1830년의 약한 주기들은 '돌턴 극소기'라고 부른다." : "찾은 극대 <b>" + peaks.length + "개</b> (앞뒤 4년 중 가장 크고 45 이상인 해)<br>극대 간격(년): " + gaps.join(", ");
      } else if (mode === "dft") {
        var B = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: 2, x1: 150, y0: 0, y1: top[1] * 1.1, xlog: true, xt: [2, 5, 10, 20, 50, 100, 150], xl: "주기 (년, 로그 눈금)", yl: "세기", yt: [0] });
        c.strokeStyle = "#a78bfa"; c.lineWidth = 2; c.beginPath(); spec.forEach(function (q, i) { if (i) c.lineTo(B.X(q[0]), B.Y(q[1])); else c.moveTo(B.X(q[0]), B.Y(q[1])); }); c.stroke(); c.lineWidth = 1;
        S.tag(c, "최대: " + top[0].toFixed(1) + "년", B.X(top[0]) + 6, B.Y(top[1]) + 14, { bg: "rgba(220,38,38,.85)" });
        $("lab-out").innerHTML = "푸리에 변환으로 각 주기의 진동이 자료에 얼마나 강하게 들어 있는지 계산했다.<br>가장 강한 주기 <b>" + top[0].toFixed(1) + "년</b>. 80 ~ 120년 부근의 넓은 봉우리도 살펴보자.";
      } else {
        var Cx = S.axes(c, { x: 56, y: 14, w: w - 72, h: h - 52, x0: 2.5, x1: 7.5, y0: 50, y1: 300, xl: "상승 기간: 극소 → 극대 (년)", yl: "극대 흑점 수" });
        c.strokeStyle = "rgba(251,191,36,.8)"; c.lineWidth = 2; c.beginPath(); c.moveTo(Cx.X(2.5), Cx.Y(L.m * 2.5 + L.b)); c.lineTo(Cx.X(7.5), Cx.Y(L.m * 7.5 + L.b)); c.stroke(); c.lineWidth = 1;
        rise.forEach(function (q) { S.dot(c, Cx.X(q[0]), Cx.Y(q[1]), 5, "#60a5fa", "#000"); c.fillStyle = "rgba(255,255,255,.6)"; c.font = S.font(10); c.fillText(q[2], Cx.X(q[0]) + 7, Cx.Y(q[1]) + 3); });
        $("lab-out").innerHTML = "점 옆 숫자는 주기 번호. 회귀선: 극대 = <b>" + L.m.toFixed(1) + "</b> × 상승 기간 + " + L.b.toFixed(0) + "<br>상관 계수 r = <b>" + rr.toFixed(2) + "</b> → " + (rr < -0.5 ? "뚜렷한 음의 상관" : "약한 음의 상관");
      }
      $("lab-kpi").innerHTML = "<div><small>극대 간격 평균</small><b>" + gm.toFixed(1) + " 년</b></div><div><small>표준 편차</small><b>" + gs.toFixed(1) + " 년</b></div><div><small>범위</small><b>" + Math.min.apply(null, gaps) + " ~ " + Math.max.apply(null, gaps) + " 년</b></div><div><small>DFT 최대</small><b>" + top[0].toFixed(1) + " 년</b></div>";
    }
    draw(); S.onResize(draw);
  })();
})();
