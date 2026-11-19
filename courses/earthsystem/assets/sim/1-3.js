/* I-3 판 구조론의 발달사와 플룸 구조론 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 음향 측심법으로 해저 지형 그리기 ---------- */
  (function () {
    var cv = $("sim-sonar"); if (!cv) return;
    var sx = $("sonar-x"), bAuto = $("sonar-auto"), bName = $("sonar-name"), out = $("sonar-out"), g;
    var V = 1500; // 바닷물 속 음파 속력 (m/s)
    function depth(u) { // u: 0~1, 반환: 수심 km
      function bump(c, w, h) { var d = (u - c) / w; return h * Math.exp(-d * d); }
      var d;
      if (u < 0.06) d = 0.12;
      else if (u < 0.14) d = 0.12 + (u - 0.06) / 0.08 * 4.0;
      else if (u < 0.17) d = 4.12 + (u - 0.14) / 0.03 * 0.4;
      else d = 4.5;
      d -= bump(0.3, 0.025, 3.2);                 // 해산
      d -= bump(0.42, 0.012, 4.3) * (u < 0.43 ? 1 : 1); // 화산섬 (수면 위)
      // 해령: 중심이 얕고 양쪽으로 깊어짐 + 열곡
      var r = Math.abs(u - 0.62); d -= Math.max(0, 2.0 - r * 9) ;
      d += Math.exp(-Math.pow((u - 0.62) / 0.006, 2)) * 0.6;
      // 해구
      d += Math.exp(-Math.pow((u - 0.87) / 0.018, 2)) * 4.0;
      if (u > 0.9) d = Math.max(0.15, d - (u - 0.9) / 0.06 * 4.3);
      if (u > 0.96) d = -0.4; // 육지
      return d;
    }
    var NAMES = [[0.035, "대륙붕"], [0.11, "대륙 사면"], [0.22, "심해저 평원"], [0.3, "해산"], [0.42, "화산섬"], [0.62, "해령"], [0.87, "해구"]];
    var seen = new Float32Array(400).fill(NaN), auto = false, showN = false, ping = 0;
    function size() { g = S.fit(cv, 0.46); }
    size(); window.addEventListener("resize", size);
    bAuto.addEventListener("click", function () { auto = !auto; bAuto.textContent = auto ? "❚❚ 멈춤" : "▶ 자동 탐사"; if (auto && +sx.value >= 0.995) sx.value = 0; });
    bName.addEventListener("click", function () { showN = !showN; bName.classList.toggle("on", showN); });
    sx.addEventListener("input", function () { ping = 0; });
    S.loop(function (dt) {
      if (auto) { sx.value = Math.min(1, +sx.value + dt * 0.06); if (+sx.value >= 1) { auto = false; bAuto.textContent = "▶ 자동 탐사"; } }
      var u = +sx.value, d = depth(u);
      seen[Math.min(399, Math.round(u * 399))] = d;
      ping = (ping + dt * 0.9) % 1;
      var ctx = g.ctx, W = g.w, H = g.h, top = 46, maxD = 9, Hd = H - top - 14;
      function Y(dk) { return top + dk / maxD * Hd; }
      ctx.fillStyle = "#cfe6f7"; ctx.fillRect(0, 0, W, top);
      var sea = ctx.createLinearGradient(0, top, 0, H); sea.addColorStop(0, "#2a78b8"); sea.addColorStop(1, "#0b2a4a");
      ctx.fillStyle = sea; ctx.fillRect(0, top, W, H - top);
      // 아직 모르는 해저(희미하게)
      if (showN) { ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); ctx.moveTo(0, H);
        for (var i = 0; i <= 400; i++) { var uu = i / 400; ctx.lineTo(uu * W, Y(Math.max(-0.4, depth(uu)))); } ctx.lineTo(W, H); ctx.fill(); }
      // 측정한 지점
      ctx.fillStyle = "#c8a46a";
      for (var j = 0; j < 400; j++) if (!isNaN(seen[j])) { var x = j / 399 * W; ctx.fillRect(x - 1, Y(Math.max(-0.4, seen[j])), W / 400 + 2, H); }
      // 배와 음파
      var x0 = u * W;
      ctx.fillStyle = "#e9edf2"; ctx.beginPath(); ctx.moveTo(x0 - 18, top - 2); ctx.lineTo(x0 + 18, top - 2); ctx.lineTo(x0 + 12, top + 8); ctx.lineTo(x0 - 12, top + 8); ctx.fill();
      ctx.fillStyle = "#c0392b"; ctx.fillRect(x0 - 4, top - 14, 8, 12);
      if (d > 0) {
        var yb = Y(d), k = ping, py = k < 0.5 ? top + 8 + (yb - top - 8) * k * 2 : yb - (yb - top - 8) * (k - 0.5) * 2;
        ctx.strokeStyle = "rgba(255,255,255,.4)"; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(x0, top + 8); ctx.lineTo(x0, yb); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = k < 0.5 ? "#ffe066" : "#7cf0c0"; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x0, py, 9, k < 0.5 ? 0.15 * Math.PI : 1.15 * Math.PI, k < 0.5 ? 0.85 * Math.PI : 1.85 * Math.PI); ctx.stroke(); ctx.lineWidth = 1;
      }
      if (showN) NAMES.forEach(function (n) { S.tag(ctx, n[1], n[0] * W, Y(Math.max(0, depth(n[0]))) - 10, { align: "center", size: 12, bg: "rgba(0,0,0,.7)" }); });
      // 눈금
      ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.font = S.font(11);
      [2, 4, 6, 8].forEach(function (k2) { ctx.fillText(k2 + " km", 4, Y(k2) + 4); });
      var t = d > 0 ? 2 * d * 1000 / V : 0;
      out.innerHTML = d > 0
        ? "<b>왕복 시간</b> t = " + t.toFixed(2) + " 초<br><b>수심</b> = ½ × v × t = ½ × 1500 × " + t.toFixed(2) + " ≈ <b>" + Math.round(d * 1000).toLocaleString() + " m</b>"
        : "<b>육지</b> (측정 불가)";
    });
  })();

  /* ---------- 2. 해양저 확장과 고지자기 줄무늬 ---------- */
  (function () {
    var cv = $("sim-mag"); if (!cv) return;
    var sv = $("mag-v"), sp = $("mag-probe"), bp = $("mag-play"), br = $("mag-reset"), out = $("mag-out"), g;
    var REV = [0.7, 1.5, 1.9, 2.6, 3.3, 4.1, 4.5, 5.3, 6.0, 6.6, 7.4, 8.1, 8.6, 9.4, 10.3, 11.0, 11.8];
    function pol(tm) { var n = 0; for (var i = 0; i < REV.length; i++) if (tm >= REV[i]) n++; return n % 2 === 0; } // true=정자극기
    var t = 6, run = false;
    function size() { g = S.fit(cv, 0.5); }
    size(); window.addEventListener("resize", size);
    bp.addEventListener("click", function () { run = !run; bp.textContent = run ? "❚❚ 멈춤" : "▶ 계속"; if (t >= 12) t = 0; });
    br.addEventListener("click", function () { t = 0; run = false; bp.textContent = "▶ 확장 시작"; });
    S.loop(function (dt) {
      if (run) { t = Math.min(12, t + dt * 0.8); if (t >= 12) { run = false; bp.textContent = "▶ 다시"; } }
      var v = +sv.value, ctx = g.ctx, W = g.w, H = g.h, cx = W / 2, half = W / 2 - 10, KM = 320; // 화면 반폭 = 320 km
      $("mag-vv").textContent = v + " cm/년";
      var maxAge = t, pxPerKm = half / KM;
      ctx.fillStyle = "#0b0e17"; ctx.fillRect(0, 0, W, H);
      var y1 = 34, h1 = H * 0.36, y2 = y1 + h1 + 30, h2 = H - y2 - 20;
      // 위에서 본 모습: 고지자기 줄무늬
      ctx.fillStyle = "#6b5a46"; ctx.fillRect(0, y1, W, h1); // 대륙(아직 열리지 않음)
      for (var px = 0; px <= half; px++) {
        var km = px / pxPerKm, age = km / (v * 10); // v cm/년 = 10v km/백만 년
        if (age > maxAge) break;
        ctx.fillStyle = pol(t - age) ? "#111827" : "#f3f4f6";
        ctx.fillRect(cx + px, y1, 1.5, h1); ctx.fillRect(cx - px - 1, y1, 1.5, h1);
      }
      ctx.strokeStyle = "#ff5a3d"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx, y1 - 6); ctx.lineTo(cx, y1 + h1 + 6); ctx.stroke(); ctx.lineWidth = 1;
      S.tag(ctx, "해령", cx, y1 - 8, { align: "center", size: 12, bg: "#c0392b" });
      S.tag(ctx, "위에서 본 해양 지각 (검정 = 정자극기, 흰색 = 역자극기)", 8, y1 + h1 + 22, { size: 11 });
      // 단면: 나이와 퇴적물
      for (var p2 = 0; p2 <= half; p2++) {
        var km2 = p2 / pxPerKm, a2 = km2 / (v * 10);
        if (a2 > maxAge) { ctx.fillStyle = "#6b5a46"; ctx.fillRect(cx + p2, y2 + 10, 1.5, h2 - 10); ctx.fillRect(cx - p2 - 1, y2 + 10, 1.5, h2 - 10); continue; }
        var dep = 10 + Math.sqrt(a2) * 14, sed = Math.min(26, a2 * 2.2);
        var c = "hsl(" + Math.round(10 + a2 * 20) + ",70%,50%)";
        ctx.fillStyle = "#1c4f7c"; ctx.fillRect(cx + p2, y2, 1.5, dep); ctx.fillRect(cx - p2 - 1, y2, 1.5, dep);
        ctx.fillStyle = "#b99a6a"; ctx.fillRect(cx + p2, y2 + dep - sed, 1.5, sed); ctx.fillRect(cx - p2 - 1, y2 + dep - sed, 1.5, sed);
        ctx.fillStyle = c; ctx.fillRect(cx + p2, y2 + dep, 1.5, h2 - dep); ctx.fillRect(cx - p2 - 1, y2 + dep, 1.5, h2 - dep);
      }
      S.tag(ctx, "단면: 색 = 해양 지각의 나이(빨강 = 젊음), 갈색 = 퇴적물", 8, H - 4, { size: 11 });
      // 탐침
      var pk = +sp.value, xp = cx + pk * pxPerKm;
      if (pk * pxPerKm <= half) {
        ctx.strokeStyle = "#7cf0c0"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(xp, y1); ctx.lineTo(xp, H - 20); ctx.stroke(); ctx.lineWidth = 1;
      }
      var ageP = pk / (v * 10);
      out.innerHTML = "<b>경과 시간</b> " + t.toFixed(1) + " 백만 년 · 지금은 " + (pol(t) ? "정자극기" : "역자극기") +
        "<br><b>탐침</b> 해령에서 " + pk + " km" +
        (ageP <= t ? "<br>→ 나이 = 거리 ÷ 속도 = " + (ageP).toFixed(2) + " 백만 년<br>→ 생성 당시 " + (pol(t - ageP) ? "정자극기" : "역자극기") : "<br>→ 아직 해양 지각이 만들어지지 않은 곳");
    });
  })();

  /* ---------- 3. 판을 움직이는 힘 ---------- */
  (function () {
    var cv = $("sim-force"); if (!cv) return;
    var cbP = $("force-push"), cbS = $("force-pull"), sel = $("force-case"), out = $("force-out"), g, off = 0;
    function size() { g = S.fit(cv, 0.45); }
    size(); window.addEventListener("resize", size);
    S.loop(function (dt) {
      var slab = sel.value === "sub", push = cbP.checked, pull = cbS.checked && slab;
      cbS.disabled = !slab;
      var spd = (push ? 1 : 0) + (pull ? 3 : 0);
      off += dt * spd * 14;
      var ctx = g.ctx, W = g.w, H = g.h, sea = H * 0.22, base = H * 0.5, rx = W * 0.14, tx = W * 0.72;
      ctx.fillStyle = "#cfe6f7"; ctx.fillRect(0, 0, W, sea);
      ctx.fillStyle = "#2a6ea8"; ctx.fillRect(0, sea, W, H * 0.12);
      ctx.fillStyle = "#e09a5a"; ctx.fillRect(0, base, W, H - base); // 연약권
      ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.font = S.font(12, true); ctx.fillText("연약권 (유동성이 있는 고체)", W * 0.3, H - 12);
      // 해령 지형 + 판
      function plateTop(x) { var r = Math.abs(x - rx); return sea + 14 + Math.min(40, r * 0.25); }
      var plateTh = 34;
      ctx.fillStyle = "#4b5563";
      ctx.beginPath(); ctx.moveTo(0, plateTop(0));
      for (var x = 0; x <= tx; x += 4) ctx.lineTo(x, plateTop(x));
      if (slab) {
        ctx.lineTo(tx + 40, plateTop(tx) + 30); ctx.lineTo(tx + 120, H); ctx.lineTo(tx + 120 - plateTh * 1.4, H); ctx.lineTo(tx - 10, plateTop(tx) + plateTh + 20);
      } else { ctx.lineTo(W, plateTop(tx)); ctx.lineTo(W, plateTop(tx) + plateTh); }
      for (var x2 = slab ? tx - 10 : W; x2 >= 0; x2 -= 4) ctx.lineTo(x2, plateTop(Math.min(x2, tx)) + plateTh);
      ctx.fill();
      // 움직임 표시(점)
      ctx.fillStyle = "rgba(255,255,255,.5)";
      for (var m = 0; m < 30; m++) { var px = ((m * 40 + off) % (tx - rx)) + rx; ctx.fillRect(px, plateTop(px) + plateTh / 2 - 2, 10, 4); var px2 = rx - ((m * 40 + off) % rx); ctx.fillRect(px2, plateTop(px2) + plateTh / 2 - 2, 10, 4); }
      // 대륙
      ctx.fillStyle = "#8a7a5a";
      if (slab) { ctx.beginPath(); ctx.moveTo(tx + 20, sea + 10); ctx.lineTo(W, sea - 30); ctx.lineTo(W, base + 20); ctx.lineTo(tx + 60, base); ctx.fill(); S.tag(ctx, "대륙판", W - 70, sea - 34, { size: 12 }); S.tag(ctx, "해구", tx + 8, sea + 32, { size: 12, bg: "rgba(0,0,0,.7)" }); }
      else { ctx.fillRect(tx + 40, sea - 30, W - tx - 40, 30 + plateTop(tx) - sea); S.tag(ctx, "대륙 (같은 판에 붙어 있음)", tx + 46, sea - 34, { size: 12 }); }
      S.tag(ctx, "해령", rx, sea + 6, { align: "center", size: 12, bg: "#c0392b" });
      // 힘 화살표
      if (push) {
        S.arrow(ctx, rx + 14, plateTop(rx + 14) - 12, rx + 120, plateTop(rx + 120) - 12, "#ffd34d", 4);
        S.arrow(ctx, rx - 14, plateTop(rx - 14) - 12, rx - 110, plateTop(rx - 110) - 12, "#ffd34d", 4);
        S.tag(ctx, "해령에서 미는 힘 (경사면을 미끄러져 내려감)", rx + 10, plateTop(rx) - 30, { size: 12, bg: "rgba(130,90,0,.85)" });
      }
      if (pull) {
        S.arrow(ctx, tx + 70, plateTop(tx) + 80, tx + 105, H - 20, "#ff6a3d", 5);
        S.tag(ctx, "섭입하는 판이 당기는 힘", tx - 150, H - 22, { size: 12, bg: "rgba(150,40,10,.85)" });
      }
      var spdTxt = spd === 0 ? "판이 거의 움직이지 않음" : spd <= 1 ? "느리게 이동" : "빠르게 이동";
      out.innerHTML = "<b>판의 이동</b> " + spdTxt + "<br>" +
        (slab ? "섭입대가 있어 차갑고 무거운 판이 맨틀로 가라앉으며 나머지 판을 잡아당긴다." : "섭입대가 없어 '당기는 힘'이 작용하지 않는다. (예: 남아메리카판)");
    });
  })();

  /* ---------- 4. 열점과 하와이 열도 ---------- */
  (function () {
    var cv = $("sim-hot"); if (!cv) return;
    var sv = $("hot-v"), bp = $("hot-play"), br = $("hot-reset"), out = $("hot-out"), g;
    var t = 0, run = false, isl = [], lastBorn = -9;
    function size() { g = S.fit(cv, 0.42); }
    size(); window.addEventListener("resize", size);
    function reset() { t = 0; isl = []; lastBorn = -9; run = false; bp.textContent = "▶ 시작"; }
    bp.addEventListener("click", function () { run = !run; bp.textContent = run ? "❚❚ 멈춤" : "▶ 계속"; });
    br.addEventListener("click", reset);
    S.loop(function (dt, now) {
      var v = +sv.value; $("hot-vv").textContent = v + " cm/년";
      if (run) {
        t += dt * 0.6; // 백만 년
        isl.forEach(function (i) { i.x += v * 10 * dt * 0.6; }); // km
        if (t - lastBorn > 0.9) { lastBorn = t; isl.push({ born: t, x: 0 }); }
      }
      var ctx = g.ctx, W = g.w, H = g.h, hx = W * 0.82, sea = H * 0.42, plate = sea + 26, PX = W / 700; // 화면 700 km
      ctx.fillStyle = "#cfe6f7"; ctx.fillRect(0, 0, W, sea);
      ctx.fillStyle = "#2a6ea8"; ctx.fillRect(0, sea, W, plate - sea);
      ctx.fillStyle = "#4b5563"; ctx.fillRect(0, plate, W, 26);
      ctx.fillStyle = "#e09a5a"; ctx.fillRect(0, plate + 26, W, H - plate - 26);
      // 플룸
      var pg = ctx.createLinearGradient(0, H, 0, plate); pg.addColorStop(0, "rgba(255,80,20,.95)"); pg.addColorStop(1, "rgba(255,200,60,.9)");
      ctx.fillStyle = pg; ctx.beginPath(); ctx.moveTo(hx - 16, H); ctx.lineTo(hx - 10, plate + 30); ctx.quadraticCurveTo(hx, plate + 10, hx + 10, plate + 30); ctx.lineTo(hx + 16, H); ctx.fill();
      S.tag(ctx, "열점 (위치 고정)", hx, H - 8, { align: "center", size: 12, bg: "rgba(150,40,0,.85)" });
      // 판 이동 방향
      S.arrow(ctx, W * 0.45, plate + 13, W * 0.25, plate + 13, "#fff", 3);
      S.tag(ctx, "판의 이동 방향 (북서쪽)", W * 0.02, plate + 20, { size: 11 });
      // 화산섬
      isl = isl.filter(function (i) { return hx - i.x * PX > -40; });
      isl.forEach(function (i) {
        var age = t - i.born, x = hx - i.x * PX, hgt = Math.max(8, 70 - age * 9), wid = 30 + Math.min(20, age * 3);
        var active = age < 0.9;
        ctx.fillStyle = active ? "#6b3f2a" : "#5f7a3a";
        ctx.beginPath(); ctx.moveTo(x - wid, plate); ctx.lineTo(x, sea - hgt); ctx.lineTo(x + wid, plate); ctx.fill();
        if (active) { ctx.fillStyle = "#ff6a2a"; ctx.fillRect(x - 3, sea - hgt - 2, 6, 3); ctx.strokeStyle = "rgba(255,120,40,.7)"; ctx.beginPath(); ctx.moveTo(x, plate + 26); ctx.lineTo(x, sea - hgt); ctx.stroke(); }
        S.tag(ctx, age < 0.05 ? "생성 중" : (age * 100).toFixed(0) + "만 년", x, sea - hgt - 10, { align: "center", size: 11 });
      });
      var n = isl.length, oldest = n ? isl[0] : null;
      out.innerHTML = "<b>판의 속도</b> " + v + " cm/년 = " + (v * 10) + " km/백만 년" +
        "<br><b>관찰</b> 열점 바로 위의 섬이 가장 젊고, 판의 이동 방향(북서쪽)으로 갈수록 섬의 나이가 많아진다." +
        (oldest ? "<br><b>가장 먼 섬</b> 열점에서 " + Math.round(oldest.x) + " km, " + ((t - oldest.born) * 100).toFixed(0) + "만 년 전 생성" : "");
    });
  })();

  /* ---------- 5. 판 구조론 정립의 역사 (연표) ---------- */
  (function () {
    var box = $("hist-chips"); if (!box) return;
    var info = $("hist-info");
    var H = [
      { y: "1912", n: "대륙 이동설", who: "베게너", dev: "—", d: "해안선의 유사성, 지질 구조의 연속성, 화석 분포, 빙하 흔적을 근거로 판게아가 갈라져 이동했다고 주장했다. 그러나 대륙을 움직이는 원동력을 설명하지 못해 받아들여지지 않았다." },
      { y: "1929", n: "맨틀 대류설", who: "홈스", dev: "—", d: "방사성 동위 원소의 붕괴열로 맨틀이 대류하며 대륙이 이동한다고 설명했다. 당시 기술로는 맨틀 대류를 확인할 수 없었다." },
      { y: "1900년대 초~", n: "해저 지형 탐사", who: "", dev: "음향 측심기", d: "음파가 해저에서 반사되어 돌아오는 시간으로 수심을 재어, 전 지구적으로 이어진 해령과 깊은 해구의 존재를 알아냈다." },
      { y: "1950년대", n: "고지자기 조사", who: "", dev: "자력계", d: "암석의 고지자기를 조사해 지자기 역전이 여러 번 있었고, 정자극기·역자극기 줄무늬가 해령을 중심으로 대칭임을 알아냈다." },
      { y: "1962", n: "해양저 확장설", who: "헤스, 디츠", dev: "음향 측심기", d: "해령 아래에서 맨틀 물질이 올라와 새 해양 지각을 만들고, 해양 지각이 양쪽으로 이동하다 해구에서 맨틀로 들어간다고 주장했다." },
      { y: "1963", n: "고지자기 줄무늬 해석", who: "바인, 매슈스", dev: "자력계", d: "고지자기 줄무늬가 대칭인 것은 해령에서 생긴 해양 지각이 당시 자기장 방향을 기록한 채 양쪽으로 이동했기 때문이라고 설명했다." },
      { y: "1965", n: "변환 단층", who: "윌슨", dev: "지진계", d: "해령과 해령 사이를 잇는 단층을 새로운 형태의 단층으로 보고 변환 단층이라 이름 붙였다. 지진은 판이 반대로 움직이는 구간에서 주로 일어난다." },
      { y: "1960년대", n: "세계 표준 지진 관측망", who: "", dev: "지진계", d: "지진의 위치와 깊이를 정확히 측정해, 지진이 해령·변환 단층·해구 주변에 집중되고 해구에서 대륙 쪽으로 갈수록 깊어진다는 것을 밝혔다." },
      { y: "1960년대 후반", n: "심해저 시추", who: "", dev: "심해저 시추기", d: "해령에서 멀어질수록 해양 지각의 나이가 대칭적으로 많아지고 퇴적물이 두꺼워짐을 확인했다. 해양저 확장설을 받아들이는 결정적 계기가 되었다." },
      { y: "1960년대 후반", n: "판 구조론 정립", who: "아이작스, 매켄지, 모건 등", dev: "", d: "판은 지각과 상부 맨틀로 이루어져 있고, 10여 개의 판의 상대 운동으로 지진·화산 등 여러 지질 현상이 일어난다는 판 구조론이 정립되었다." }
    ];
    H.forEach(function (h, i) {
      var b = document.createElement("button"); b.className = "chip"; b.type = "button";
      b.textContent = h.y + " · " + h.n;
      b.addEventListener("click", function () { show(i); });
      box.appendChild(b);
    });
    function show(i) {
      var h = H[i];
      box.querySelectorAll(".chip").forEach(function (c, k) { c.classList.toggle("on", k === i); });
      info.innerHTML = "<div style='font-size:1.1rem;font-weight:800'>" + h.y + " · " + h.n + "</div>" +
        (h.who ? "<div style='color:var(--muted);font-size:.85rem'>" + h.who + "</div>" : "") +
        (h.dev && h.dev !== "—" ? "<div style='margin:6px 0'><span class='pill inquiry'>관측 기기 · " + h.dev + "</span></div>" : "") +
        "<p style='margin:8px 0 0'>" + h.d + "</p>";
    }
    show(0);
  })();
})();
