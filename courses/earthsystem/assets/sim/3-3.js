/* III-3 대기 안정도와 강수 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 산을 넘는 공기 덩어리: 상승 응결 고도와 푄 ---------- */
  (function () {
    var cv = $("sim-foehn"); if (!cv) return;
    var sT = $("fo-t"), sD = $("fo-td"), sH = $("fo-h"), bGo = $("fo-go"), out = $("fo-out"), g, s = 0, run = false;
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    bGo.addEventListener("click", function () { s = 0; run = true; });
    [sT, sD, sH].forEach(function (el) { el.addEventListener("input", function () { if (+sD.value > +sT.value) sD.value = sT.value; s = 0; run = false; }); });
    // 경로 위치 s(0~1) → 높이(km): 0~0.5 상승, 0.5~1 하강
    function state(T0, D0, Hm, sp) {
      var lcl = (T0 - D0) / 8, up = Math.min(sp, 0.5) * 2 * Hm, T, D, rain = false;
      if (up <= lcl) { T = T0 - 10 * up; D = D0 - 2 * up; }
      else { var Tl = T0 - 10 * lcl; T = Tl - 5 * (up - lcl); D = T; rain = true; }
      if (sp > 0.5) { var down = (sp - 0.5) * 2 * Hm, Ttop = state(T0, D0, Hm, 0.5); T = Ttop.T + 10 * down; D = Ttop.D + 2 * down; rain = false; }
      return { T: T, D: D, z: sp <= 0.5 ? up : Hm - (sp - 0.5) * 2 * Hm, lcl: lcl, rain: rain };
    }
    function rh(T, D) { function es(t) { return 6.11 * Math.exp(17.27 * t / (t + 237.3)); } return Math.min(100, 100 * es(D) / es(T)); }
    S.loop(function (dt) {
      var T0 = +sT.value, D0 = +sD.value, Hm = +sH.value;
      $("fo-tv").textContent = T0 + " °C"; $("fo-tdv").textContent = D0 + " °C"; $("fo-hv").textContent = Hm.toFixed(1) + " km";
      if (run) { s = Math.min(1, s + dt * 0.12); if (s >= 1) run = false; }
      var st = state(T0, D0, Hm, s), lcl = st.lcl;
      var ctx = g.ctx, W = g.w, H = g.h, base = H - 30, sc = (H - 60) / 3.2, x0 = W * 0.06, x1 = W * 0.94, xm = (x0 + x1) / 2;
      ctx.fillStyle = "#cfe6f7"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#7c8b5a"; ctx.beginPath(); ctx.moveTo(x0 - 20, base); ctx.lineTo(xm, base - Hm * sc); ctx.lineTo(x1 + 20, base); ctx.lineTo(W, base); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.lineTo(0, base); ctx.fill();
      if (lcl < Hm) {
        var yl = base - lcl * sc, xl = x0 + (xm - x0) * lcl / Hm;
        ctx.strokeStyle = "rgba(0,0,0,.35)"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(0, yl); ctx.lineTo(W, yl); ctx.stroke(); ctx.setLineDash([]);
        S.tag(ctx, "상승 응결 고도 " + lcl.toFixed(2) + " km", 6, yl - 4, { size: 11 });
        ctx.fillStyle = "rgba(255,255,255,.92)"; for (var c = 0; c < 6; c++) { ctx.beginPath(); ctx.ellipse(xl + (xm - xl) * c / 5, yl - 10 - (base - yl) * 0.02 * c, 34, 14, 0, 0, 7); ctx.fill(); }
        ctx.strokeStyle = "rgba(37,99,235,.6)"; for (var r = 0; r < 18; r++) { var rx = xl + (xm - xl) * (r / 18), ry = yl + 8 + (r * 13) % 30; ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 3, ry + 10); ctx.stroke(); }
      }
      // 공기 덩어리
      var px = x0 + (x1 - x0) * s, py = base - st.z * sc - 12;
      ctx.fillStyle = st.rain ? "#60a5fa" : "#fbbf24"; ctx.beginPath(); ctx.arc(px, py, 11, 0, 7); ctx.fill();
      S.tag(ctx, st.T.toFixed(1) + "°C / 이슬점 " + st.D.toFixed(1) + "°C", px, py - 16, { align: "center", size: 11 });
      S.arrow(ctx, 10, 30, 70, 30, "#1e3a8a", 2); S.tag(ctx, "바람", 74, 36, { size: 11, bg: "#1e3a8a" });
      var fin = state(T0, D0, Hm, 1), start = { T: T0, D: D0 };
      out.innerHTML = "<b>출발</b> 기온 " + T0 + "°C, 이슬점 " + D0 + "°C, 상대 습도 약 " + Math.round(rh(T0, D0)) + "%<br><b>상승 응결 고도</b> H = (T − Td)/8 = " + lcl.toFixed(2) + " km" + (lcl >= Hm ? " → 산 정상보다 높아 구름이 생기지 않음" : "") +
        "<br><b>산을 넘은 뒤</b> 기온 " + fin.T.toFixed(1) + "°C, 이슬점 " + fin.D.toFixed(1) + "°C, 상대 습도 약 " + Math.round(rh(fin.T, fin.D)) + "%" +
        (lcl < Hm ? "<br>→ 출발 때보다 <b>" + (fin.T - T0).toFixed(1) + "°C 높고 건조</b>해짐 (푄)" : "<br>→ 응결이 없으면 기온이 그대로 돌아온다");
    });
  })();

  /* ---------- 2. 대기 안정도와 구름의 모양 ---------- */
  (function () {
    var cv = $("sim-stab"); if (!cv) return;
    var sG = $("st-g"), sD = $("st-td"), out = $("st-out"), g;
    function size() { g = S.fit(cv, 0.58); draw(); }
    function draw() {
      if (!g) return;
      var gam = +sG.value, T0 = 30, Td = +sD.value; $("st-gv").textContent = gam + " °C/km"; $("st-tdv").textContent = Td + " °C";
      var lcl = (T0 - Td) / 8, ZM = 6;
      function parcel(z) { return z <= lcl ? T0 - 10 * z : T0 - 10 * lcl - 5 * (z - lcl); }
      function env(z) { return T0 - gam * z; }
      var ctx = g.ctx, W = g.w, H = g.h, L = 46, R = 200, T = 14, B = 34, Wd = W - L - R, Hd = H - T - B;
      function X(t) { return L + (t + 40) / 80 * Wd; } function Y(z) { return T + Hd - z / ZM * Hd; }
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#e5e7eb"; ctx.fillStyle = "#6b7280"; ctx.font = S.font(11);
      for (var t = -40; t <= 40; t += 10) { ctx.beginPath(); ctx.moveTo(X(t), T); ctx.lineTo(X(t), T + Hd); ctx.stroke(); ctx.fillText(t, X(t) - 6, H - 16); }
      for (var z = 0; z <= ZM; z++) { ctx.beginPath(); ctx.moveTo(L, Y(z)); ctx.lineTo(L + Wd, Y(z)); ctx.stroke(); ctx.fillText(z + " km", 6, Y(z) + 4); }
      ctx.fillText("기온 (°C)", L + Wd / 2 - 20, H - 2);
      // 주위 공기
      ctx.strokeStyle = "#111"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(env(0)), Y(0)); ctx.lineTo(X(env(ZM)), Y(ZM)); ctx.stroke();
      // 공기 덩어리
      ctx.strokeStyle = "#dc2626"; ctx.lineWidth = 3; ctx.beginPath();
      for (var zz = 0; zz <= ZM; zz += 0.05) { zz ? ctx.lineTo(X(parcel(zz)), Y(zz)) : ctx.moveTo(X(parcel(zz)), Y(zz)); } ctx.stroke(); ctx.lineWidth = 1;
      ctx.strokeStyle = "#2563eb"; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(L, Y(lcl)); ctx.lineTo(L + Wd, Y(lcl)); ctx.stroke(); ctx.setLineDash([]);
      S.tag(ctx, "상승 응결 고도", L + 4, Y(lcl) - 4, { size: 11, bg: "#1d4ed8" });
      // 자유 상승 시작 높이
      var lfc = null; for (var k = 0; k <= ZM; k += 0.01) if (parcel(k) > env(k) + 0.01 && k > 0.02) { lfc = k; break; }
      var sky = "", kind;
      if (gam < 5) kind = "절대 안정"; else if (gam > 10) kind = "절대 불안정"; else kind = "조건부 불안정";
      // 구름 그림 (오른쪽)
      var cx = W - R + 20, cw = R - 40;
      ctx.fillStyle = "#e0f2fe"; ctx.fillRect(cx - 10, T, cw + 20, Hd);
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(cx - 10, T + Hd, cw + 20, 6);
      var cloudTop;
      if (lcl > ZM) { sky = "구름 없음"; }
      else if (lfc === null || lfc > ZM) { cloudTop = Math.min(ZM, lcl + 0.4); sky = "층운형 구름 (얇고 옆으로 퍼짐)"; ctx.fillStyle = "#fff"; ctx.fillRect(cx, Y(cloudTop), cw, Y(lcl) - Y(cloudTop)); ctx.strokeStyle = "#cbd5e1"; ctx.strokeRect(cx, Y(cloudTop), cw, Y(lcl) - Y(cloudTop)); }
      else { cloudTop = ZM; sky = "적운형 구름 (두껍게 위로 발달)"; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.moveTo(cx + cw * 0.15, Y(lcl)); ctx.lineTo(cx + cw * 0.85, Y(lcl)); ctx.quadraticCurveTo(cx + cw, Y((lcl + cloudTop) / 2), cx + cw * 0.75, Y(cloudTop - 0.2)); ctx.quadraticCurveTo(cx + cw * 0.5, Y(cloudTop + 0.2), cx + cw * 0.25, Y(cloudTop - 0.2)); ctx.quadraticCurveTo(cx, Y((lcl + cloudTop) / 2), cx + cw * 0.15, Y(lcl)); ctx.fill(); ctx.strokeStyle = "#cbd5e1"; ctx.stroke(); if (lfc > lcl + 0.05) { ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fillRect(cx + 4, Y(lcl + 0.25), cw - 8, Y(lcl) - Y(lcl + 0.25)); } }
      S.tag(ctx, "검정: 주위 기온  빨강: 상승하는 공기 덩어리", L + Wd - 4, T + 16, { align: "right", size: 11, bg: "rgba(0,0,0,.6)" });
      out.innerHTML = "<b>기온 감률</b> " + gam + " °C/km → <b>" + kind + "</b><br>(건조 단열 감률 10, 습윤 단열 감률 5 °C/km와 비교)<br><b>상승 응결 고도</b> " + lcl.toFixed(2) + " km" +
        (lfc !== null && lfc <= ZM ? "<br><b>" + lfc.toFixed(2) + " km</b>부터 공기 덩어리가 주위보다 따뜻해져 저절로 상승" : "<br>공기 덩어리가 주위보다 늘 차가워 강제로 올려야만 상승") + "<br><b>구름</b> " + sky;
    }
    [sG, sD].forEach(function (el) { el.addEventListener("input", draw); });
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 3. 탐구: 단열선도로 대기 안정도 해석 ---------- */
  (function () {
    var cv = $("sim-ad"); if (!cv) return;
    var cA = $("ad-a"), cB = $("ad-b"), out = $("ad-out"), g;
    var Z = [0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500];
    var A = [10.0, 10.4, 10.8, 11.2, 11.6, 12.0, 12.4, 11.75, 11.1, 10.45, 9.8];   // 아래: 기온 역전 / 위: 1.3°C/100m
    var B = [17.0, 16.65, 16.3, 15.95, 15.6, 15.25, 14.9, 14.55, 14.2, 13.85, 13.5]; // 0.7°C/100m
    function size() { g = S.fit(cv, 0.6); draw(); }
    function draw() {
      if (!g) return;
      var ctx = g.ctx, W = g.w, H = g.h, L = 54, R = 20, T = 16, Bm = 36;
      function X(t) { return L + (t - 8) / 12 * (W - L - R); } function Y(z) { return H - Bm - z / 500 * (H - T - Bm); }
      ctx.fillStyle = "#fbfaf6"; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "#e5e7eb"; ctx.fillStyle = "#6b7280"; ctx.font = S.font(11);
      for (var t = 8; t <= 20; t++) { ctx.beginPath(); ctx.moveTo(X(t), T); ctx.lineTo(X(t), H - Bm); ctx.stroke(); if (t % 2 === 0) ctx.fillText(t, X(t) - 6, H - Bm + 14); }
      for (var z = 0; z <= 500; z += 100) { ctx.beginPath(); ctx.moveTo(L, Y(z)); ctx.lineTo(W - R, Y(z)); ctx.stroke(); ctx.fillText(z + " m", 8, Y(z) + 4); }
      ctx.fillText("기온 (°C)", W / 2 - 20, H - 6);
      // 단열선 (참고선)
      for (var t0 = 10; t0 <= 24; t0 += 2) {
        ctx.strokeStyle = "rgba(220,38,38,.35)"; ctx.beginPath(); ctx.moveTo(X(t0), Y(0)); ctx.lineTo(X(t0 - 5), Y(500)); ctx.stroke();
        ctx.strokeStyle = "rgba(37,99,235,.35)"; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(X(t0), Y(0)); ctx.lineTo(X(t0 - 2.5), Y(500)); ctx.stroke(); ctx.setLineDash([]);
      }
      S.tag(ctx, "빨강 실선: 건조 단열선 (1°C/100 m)", W - R - 4, T + 14, { align: "right", size: 11, bg: "#b91c1c" });
      S.tag(ctx, "파랑 점선: 습윤 단열선 (0.5°C/100 m)", W - R - 4, T + 36, { align: "right", size: 11, bg: "#1d4ed8" });
      function plot(arr, col, name) {
        ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); arr.forEach(function (v, i) { i ? ctx.lineTo(X(v), Y(Z[i])) : ctx.moveTo(X(v), Y(Z[i])); }); ctx.stroke(); ctx.lineWidth = 1;
        arr.forEach(function (v, i) { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(X(v), Y(Z[i]), 4, 0, 7); ctx.fill(); });
        S.tag(ctx, name, X(arr[arr.length - 1]), Y(500) - 8, { align: "center", size: 12, bg: col });
      }
      if (cA.checked) plot(A, "#059669", "(가)");
      if (cB.checked) plot(B, "#7c3aed", "(나)");
      out.innerHTML = "선의 <b>기울기</b>를 단열선과 비교한다.<br>• 기온이 위로 갈수록 오르거나, 습윤 단열선보다 덜 기울면(감률 &lt; 0.5°C/100 m) → <b>절대 안정</b><br>• 건조 단열선보다 더 기울면(감률 &gt; 1°C/100 m) → <b>절대 불안정</b><br>• 두 단열선 사이 → <b>조건부 불안정</b>";
    }
    [cA, cB].forEach(function (el) { el.addEventListener("change", draw); });
    size(); window.addEventListener("resize", size);
  })();

  /* ---------- 4. 강수 과정: 병합설과 빙정설 ---------- */
  (function () {
    var cv = $("sim-rain"); if (!cv) return;
    var sel = $("rn-mode"), bR = $("rn-reset"), out = $("rn-out"), g, P = [], mode = "";
    function size() { g = S.fit(cv, 0.55); }
    size(); window.addEventListener("resize", size);
    function reset() {
      mode = sel.value; P = [];
      for (var i = 0; i < 120; i++) {
        if (mode === "warm") P.push({ x: Math.random(), y: 0.1 + Math.random() * 0.5, r: 1.5 + Math.random() * (i < 6 ? 3 : 1.6), ice: false });
        else P.push({ x: Math.random(), y: 0.08 + Math.random() * 0.45, r: 1.6 + Math.random() * 1.2, ice: i < 8 });
      }
    }
    sel.addEventListener("change", reset); bR.addEventListener("click", reset); reset();
    S.loop(function (dt) {
      var ctx = g.ctx, W = g.w, H = g.h, cloudBot = H * 0.62, frz = H * 0.5;
      ctx.fillStyle = "#cbd5e1"; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(255,255,255,.85)"; ctx.fillRect(0, 0, W, cloudBot);
      ctx.fillStyle = "#94a3b8"; ctx.fillRect(0, H - 10, W, 10);
      if (mode === "cold") { ctx.strokeStyle = "#2563eb"; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(0, frz); ctx.lineTo(W, frz); ctx.stroke(); ctx.setLineDash([]); S.tag(ctx, "0 °C 높이", W - 8, frz - 4, { align: "right", size: 11, bg: "#1d4ed8" }); S.tag(ctx, "−40~0 °C: 빙정과 과냉각 물방울이 함께 있음", 8, 20, { size: 11, bg: "rgba(29,78,216,.85)" }); }
      else S.tag(ctx, "0 °C 이상: 구름이 물방울로만 이루어짐", 8, 20, { size: 11, bg: "rgba(5,150,105,.85)" });
      P.forEach(function (p) {
        var vy = 0.002 * p.r * p.r * (p.ice ? 0.5 : 1);
        p.y += vy * dt * 3; p.x += (Math.random() - 0.5) * 0.002;
        if (p.y < cloudBot / H && p.r < 3 && !p.ice) p.y -= vy * dt * 2.6; // 작은 물방울은 상승 기류에 떠 있음
        if (mode === "cold" && p.ice && p.y * H > frz) { p.ice = false; p.melted = true; }
      });
      if (mode === "warm") {
        for (var i = 0; i < P.length; i++) for (var j = 0; j < P.length; j++) {
          if (i === j || !P[i] || !P[j]) continue; var a = P[i], b = P[j];
          if (a.r > b.r && Math.abs(a.x - b.x) * W < a.r + b.r && Math.abs(a.y - b.y) * H < a.r + b.r) { a.r = Math.cbrt(a.r * a.r * a.r + b.r * b.r * b.r); b.dead = true; }
        }
      } else {
        P.forEach(function (p) {
          if (p.ice && p.y * H < frz) p.r += dt * 0.6;
          else if (!p.ice && !p.melted && p.y * H < frz) { p.r -= dt * 0.12; if (p.r < 0.6) p.dead = true; }
        });
      }
      P = P.filter(function (p) { return !p.dead && p.y < 1.02; });
      if (mode === "warm" && P.length < 90 && Math.random() < dt * 8) P.push({ x: Math.random(), y: 0.1 + Math.random() * 0.4, r: 1.5 + Math.random() * 1.4 });
      if (mode === "cold" && P.length < 90 && Math.random() < dt * 8) P.push({ x: Math.random(), y: 0.1 + Math.random() * 0.35, r: 1.6 + Math.random(), ice: Math.random() < 0.06 });
      P.forEach(function (p) {
        if (p.ice) { ctx.strokeStyle = "#0ea5e9"; ctx.lineWidth = 1.5; for (var k = 0; k < 3; k++) { var a = k * Math.PI / 3; ctx.beginPath(); ctx.moveTo(p.x * W - Math.cos(a) * p.r * 1.6, p.y * H - Math.sin(a) * p.r * 1.6); ctx.lineTo(p.x * W + Math.cos(a) * p.r * 1.6, p.y * H + Math.sin(a) * p.r * 1.6); ctx.stroke(); } ctx.lineWidth = 1; }
        else { ctx.fillStyle = p.r > 3.2 ? "#1d4ed8" : "#60a5fa"; ctx.beginPath(); ctx.arc(p.x * W, p.y * H, p.r, 0, 7); ctx.fill(); }
      });
      out.innerHTML = mode === "warm"
        ? "<b>병합설</b> (저위도, 여름철 중위도)<br>크기가 다른 물방울은 떨어지는 빠르기가 달라 서로 부딪쳐 합쳐진다. 커진 물방울이 무거워지면 떨어져 <b>비</b>가 된다."
        : "<b>빙정설</b> (고위도, 중위도)<br>같은 온도에서 과냉각 물방울의 포화 수증기압이 빙정보다 높아, 물방울은 증발해 작아지고 그 수증기가 <b>빙정에 달라붙어</b> 빙정이 자란다. 무거워진 빙정이 떨어지면 <b>눈</b>, 떨어지며 녹으면 <b>비</b>가 된다.";
    });
  })();
})();
