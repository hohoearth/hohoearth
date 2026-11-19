/* I-4 화산 활동과 화성암의 특성 · 시뮬레이션 */
(function () {
  var S = window.SIM, $ = S.$;

  /* ---------- 1. 암석의 순환 (그림 누르기) ---------- */
  (function () {
    var box = $("cycle-map"); if (!box) return;
    var info = $("cycle-info");
    var D = {
      ig: ["화성암", "마그마가 식어 굳어진 암석. 지표 부근에서 빨리 식으면 화산암, 지하 깊은 곳에서 천천히 식으면 심성암이 된다."],
      sed: ["퇴적암", "지표의 암석이 풍화·침식되어 운반·퇴적된 퇴적물이 다져지고 굳어지는 속성 작용을 거쳐 만들어진다."],
      met: ["변성암", "화성암이나 퇴적암이 높은 열과 압력을 받아(변성 작용) 구성 광물과 조직이 바뀐 암석이다."],
      mag: ["마그마", "암석이 지하 깊은 곳에서 녹아(용융) 만들어진다. 주변 암석보다 밀도가 작아 위로 올라와 마그마방을 만든다."],
      sd: ["퇴적물", "지표로 드러난 암석이 풍화·침식 작용을 받아 부서진 뒤 운반되어 쌓인 물질이다."],
      vol: ["화산 활동의 역할", "지구 내부의 물질(마그마)을 지표로 올려 <b>새로운 화성암을 만든다</b>. 암석의 순환에서 지구 내부와 지표를 이어 주는 통로이다."]
    };
    function show(k) {
      box.querySelectorAll("[data-k]").forEach(function (el) { el.classList.toggle("sel", el.dataset.k === k); });
      info.innerHTML = "<div style='font-size:1.05rem;font-weight:800'>" + D[k][0] + "</div><p style='margin:8px 0 0'>" + D[k][1] + "</p>";
    }
    box.querySelectorAll("[data-k]").forEach(function (el) { el.style.cursor = "pointer"; el.addEventListener("click", function () { show(el.dataset.k); }); });
    show("vol");
  })();

  /* ---------- 2. 마그마의 성질과 화산의 형태 ---------- */
  (function () {
    var cv = $("sim-volc"); if (!cv) return;
    var sSi = $("v-si"), sT = $("v-t"), sG = $("v-g"), out = $("v-out"), g, parts = [], flows = [];
    function size() { g = S.fit(cv, 0.64); }
    size(); window.addEventListener("resize", size);
    [sSi, sT, sG].forEach(function (el) { el.addEventListener("input", function () { parts = []; flows = []; }); });
    S.loop(function (dt, now) {
      var si = +sSi.value, T = +sT.value, gas = +sG.value / 100;
      $("v-siv").textContent = si + " %"; $("v-tv").textContent = T + " °C"; $("v-gv").textContent = gas < 0.34 ? "적음" : gas < 0.67 ? "보통" : "많음";
      var visc = Math.max(0, Math.min(1, (si - 45) / 30 * 0.7 + (1250 - T) / 550 * 0.3));
      var expl = Math.max(0, Math.min(1, visc * 0.6 + gas * 0.5));
      var kind = visc < 0.38 ? "순상 화산" : visc < 0.72 ? "성층 화산" : "종상 화산";
      var magma = si <= 52 ? "현무암질" : si <= 63 ? "안산암질" : "유문암질";
      var ctx = g.ctx, W = g.w, H = g.h, base = H * 0.86, cx = W * 0.5;
      var sky = ctx.createLinearGradient(0, 0, 0, base); sky.addColorStop(0, "#9cc3e6"); sky.addColorStop(1, "#dbe9f4");
      ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#5c4a3a"; ctx.fillRect(0, base, W, H - base);
      // 화산체 모양
      var halfW, hgt;
      if (kind === "순상 화산") { halfW = W * 0.45; hgt = H * 0.2; }
      else if (kind === "성층 화산") { halfW = W * 0.3; hgt = H * 0.5; }
      else { halfW = W * 0.13; hgt = H * 0.28; }
      var topW = kind === "종상 화산" ? halfW * 0.55 : halfW * 0.06;
      ctx.fillStyle = kind === "순상 화산" ? "#3a2e2a" : "#6a5a4c";
      ctx.beginPath(); ctx.moveTo(cx - halfW, base);
      if (kind === "종상 화산") { ctx.bezierCurveTo(cx - halfW, base - hgt * 1.1, cx + halfW, base - hgt * 1.1, cx + halfW, base); }
      else if (kind === "순상 화산") { ctx.quadraticCurveTo(cx - halfW * 0.4, base - hgt * 1.05, cx - topW, base - hgt); ctx.lineTo(cx + topW, base - hgt); ctx.quadraticCurveTo(cx + halfW * 0.4, base - hgt * 1.05, cx + halfW, base); }
      else { ctx.quadraticCurveTo(cx - halfW * 0.25, base - hgt * 0.55, cx - topW, base - hgt); ctx.lineTo(cx + topW, base - hgt); ctx.quadraticCurveTo(cx + halfW * 0.25, base - hgt * 0.55, cx + halfW, base); }
      ctx.fill();
      if (kind === "성층 화산") { // 층상 구조
        ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 3;
        for (var l = 1; l < 6; l++) { var k = l / 6; ctx.beginPath(); ctx.moveTo(cx - halfW * (1 - k * 0.85), base - hgt * k * 0.9); ctx.lineTo(cx + halfW * (1 - k * 0.85), base - hgt * k * 0.9); ctx.stroke(); }
        ctx.lineWidth = 1;
      }
      var top = base - hgt;
      // 분출
      if (expl < 0.5) {
        // 용암이 흘러내림
        if (Math.random() < dt * 6) flows.push({ s: Math.random() < 0.5 ? -1 : 1, k: 0, sp: 0.25 + (1 - visc) * 0.5 });
        flows = flows.filter(function (f) { f.k += dt * f.sp; return f.k < 1.1; });
        flows.forEach(function (f) {
          var x = cx + f.s * (topW + (halfW - topW) * Math.min(1, f.k)), y = top + hgt * Math.pow(Math.min(1, f.k), kind === "순상 화산" ? 0.7 : 1);
          ctx.fillStyle = "rgba(255," + Math.round(120 + 80 * (1 - f.k)) + ",30,.95)"; ctx.beginPath(); ctx.arc(x, y - 3, 5 + 3 * (1 - visc), 0, 7); ctx.fill();
        });
        ctx.fillStyle = "#ff7a2a"; ctx.fillRect(cx - topW - 4, top - 4, topW * 2 + 8, 6);
      }
      // 화산 가스와 화산 쇄설물
      var colH = H * (0.12 + expl * 0.7);
      if (Math.random() < dt * (4 + expl * 30)) parts.push({ x: cx + (Math.random() - 0.5) * 20, y: top, vx: (Math.random() - 0.5) * (20 + expl * 120), vy: -(40 + expl * 260) * (0.5 + Math.random()), r: expl > 0.5 ? 2 + Math.random() * 7 : 3 + Math.random() * 3, ash: expl > 0.5 && Math.random() < 0.6 });
      parts = parts.filter(function (p) {
        p.vy += (p.ash ? 30 : 160) * dt; p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.ash && p.y < top - colH) { p.vy = 0; p.vx += 30 * dt; }
        var a = Math.max(0, 1 - (top - p.y) / (colH + 60));
        ctx.fillStyle = p.ash ? "rgba(90,85,85," + (0.35 + a * 0.4) + ")" : (expl > 0.5 ? "rgba(60,40,35,.9)" : "rgba(220,220,225," + (0.5 * a + 0.1) + ")");
        ctx.beginPath(); ctx.arc(p.x, p.y, p.ash ? p.r * 2.4 : p.r, 0, 7); ctx.fill();
        return p.y < base + 10 && p.x > -50 && p.x < W + 50;
      });
      S.tag(ctx, kind, cx, base + 22 > H - 4 ? H - 6 : base + 22, { align: "center", size: 14, bg: "rgba(0,0,0,.7)" });
      S.tag(ctx, expl < 0.5 ? "조용히 분출: 용암이 흘러내림" : "폭발적 분출: 화산 쇄설물·화산재", 10, 26, { size: 13, bg: expl < 0.5 ? "rgba(170,70,10,.85)" : "rgba(60,60,70,.85)" });
      out.innerHTML = "<b>마그마</b> " + magma + "<br><b>점성</b> " + (visc < 0.38 ? "작음 (유동성 큼)" : visc < 0.72 ? "중간" : "큼 (유동성 작음)") +
        "<br><b>분출 양상</b> " + (expl < 0.5 ? "비교적 조용함" : "폭발적") +
        "<br><b>주된 분출물</b> " + (expl < 0.5 ? "용암 + 화산 가스" : "화산 쇄설물(화산재·화산력 등) + 화산 가스" + (visc < 0.72 ? " + 용암" : ""));
    });
  })();

  /* ---------- 화성암 조직 생성기 (결정 핵 생성과 성장) ---------- */
  var MODES = {
    deep:  { n: "지하 깊은 곳 · 천천히 식음", phases: [{ until: 1e9, nr: 0.22, gr: 0.32, stopNuc: 45 }], glassAt: 1e9 },
    near:  { n: "지표 부근 · 빠르게 식음", phases: [{ until: 1e9, nr: 28, gr: 0.08 }], glassAt: 1e9 },
    quench:{ n: "용암이 물·공기에 닿아 매우 빠르게 식음", phases: [{ until: 1e9, nr: 0.25, gr: 0.06 }], glassAt: 45 },
    porph: { n: "지하에서 천천히 식다가 상승해 빠르게 식음", phases: [{ until: 55, nr: 0.09, gr: 0.32 }, { until: 1e9, nr: 9, gr: 0.1 }], glassAt: 1e9 }
  };
  var PAL = [[240, 240, 245], [205, 205, 210], [150, 150, 160], [250, 230, 140], [120, 170, 240], [230, 120, 200], [130, 220, 170], [250, 170, 90], [90, 110, 200]];
  function Rock(gw, gh, mode, seed) {
    var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(seed || 12345);
    var own = new Int32Array(gw * gh).fill(-1), cr = [], step = 0, free = gw * gh, done = false, M = MODES[mode];
    function nucleate(n) {
      var whole = Math.floor(n), k = whole + (rnd() < n - whole ? 1 : 0);
      for (var i = 0; i < k; i++) for (var a = 0; a < 25; a++) {
        var x = Math.floor(rnd() * gw), y = Math.floor(rnd() * gh);
        if (own[y * gw + x] < 0) {
          var mafic = rnd() < 0.22;
          cr.push({ x: x, y: y, r: 0.6, ori: rnd() * Math.PI, ic: PAL[Math.floor(rnd() * PAL.length)], pl: mafic ? [120 + rnd() * 40, 95 + rnd() * 40, 60] : [228 + rnd() * 20, 226 + rnd() * 20, 220 + rnd() * 15], gr: 0.7 + rnd() * 0.6, stuck: 0, el: 0.6 + rnd() * 0.8, ea: rnd() * Math.PI });
          own[y * gw + x] = cr.length - 1; free--; break;
        }
      }
    }
    function stepOnce() {
      if (done) return;
      var ph = M.phases[0]; for (var i = 0; i < M.phases.length; i++) if (step < M.phases[i].until) { ph = M.phases[i]; break; }
      if (!(ph.stopNuc && step > ph.stopNuc)) nucleate(ph.nr);
      for (var c = 0; c < cr.length; c++) {
        var C = cr[c]; if (C.stuck > 6) continue;
        C.r += ph.gr * C.gr;
        var R = Math.ceil(C.r * Math.max(1, C.el)), got = 0, ca = Math.cos(C.ea), sa = Math.sin(C.ea);
        for (var y = Math.max(0, C.y - R); y <= Math.min(gh - 1, C.y + R); y++) for (var x = Math.max(0, C.x - R); x <= Math.min(gw - 1, C.x + R); x++) {
          var idx = y * gw + x; if (own[idx] >= 0) continue;
          var dx = x - C.x, dy = y - C.y, u = (dx * ca + dy * sa) / C.el, v = (-dx * sa + dy * ca) * C.el;
          if (u * u + v * v <= C.r * C.r) { own[idx] = c; free--; got++; }
        }
        C.stuck = got ? 0 : C.stuck + 1;
      }
      step++;
      if (free <= 0 || step >= M.glassAt || step > 600) done = true;
    }
    return { gw: gw, gh: gh, own: own, cr: cr, step: stepOnce, isDone: function () { return done; }, freeFrac: function () { return free / (gw * gh); }, n: function () { return cr.length; } };
  }
  function paint(ctx, rock, x0, y0, w, h, view, theta, melt) {
    var gw = rock.gw, gh = rock.gh, img = ctx.createImageData(gw, gh), d = img.data, own = rock.own, cr = rock.cr;
    for (var i = 0; i < gw * gh; i++) {
      var o = own[i], r, g, b;
      if (o < 0) { if (melt) { r = 235; g = 95; b = 30; } else if (view === "xpl") { r = g = b = 8; } else { r = 70; g = 52; b = 40; } }
      else {
        var C = cr[o];
        if (view === "xpl") { var k = Math.abs(Math.sin(2 * (theta - C.ori))); k = 0.08 + 0.92 * k; r = C.ic[0] * k; g = C.ic[1] * k; b = C.ic[2] * k; }
        else if (view === "ppl") { r = C.pl[0]; g = C.pl[1]; b = C.pl[2]; }
        else { r = C.ic[0]; g = C.ic[1]; b = C.ic[2]; }
        var x = i % gw, y = (i / gw) | 0;
        if ((x + 1 < gw && own[i + 1] !== o) || (y + 1 < gh && own[i + gw] !== o)) { r *= 0.45; g *= 0.45; b *= 0.45; }
      }
      d[i * 4] = r; d[i * 4 + 1] = g; d[i * 4 + 2] = b; d[i * 4 + 3] = 255;
    }
    var tmp = paint.tmp || (paint.tmp = document.createElement("canvas"));
    tmp.width = gw; tmp.height = gh; tmp.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false; ctx.drawImage(tmp, x0, y0, w, h);
  }
  function textureName(rock, mode) {
    var glass = rock.freeFrac(), n = rock.n();
    if (glass > 0.5) return "유리질 조직";
    if (mode === "porph") return "반상 조직";
    return n < 120 ? "조립질 조직" : "세립질 조직";
  }

  /* ---------- 3. 냉각 속도와 결정의 크기 ---------- */
  (function () {
    var cv = $("sim-cool"); if (!cv) return;
    var sel = $("cool-mode"), bGo = $("cool-go"), out = $("cool-out"), g, rock, running = false;
    function size() { g = S.fit(cv, 0.55); }
    function start() { rock = Rock(170, 110, sel.value, Math.floor(Math.random() * 1e6) + 1); running = true; }
    size(); window.addEventListener("resize", size);
    bGo.addEventListener("click", start); sel.addEventListener("change", start);
    start();
    S.loop(function () {
      if (running) { for (var i = 0; i < 3; i++) rock.step(); if (rock.isDone()) running = false; }
      var ctx = g.ctx; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, g.w, g.h);
      paint(ctx, rock, 0, 0, g.w, g.h, "color", 0, running);
      var phase = sel.value === "porph" ? (rock.n() && running && rock.n() < 30 ? "1단계: 지하에서 천천히 (큰 결정 = 반정)" : "2단계: 지표 부근에서 빠르게 (작은 결정 = 석기)") : MODES[sel.value].n;
      S.tag(ctx, running ? "냉각 중… " + phase : "다 굳음 → " + textureName(rock, sel.value), 10, 26, { size: 13, bg: "rgba(0,0,0,.75)" });
      var glass = rock.freeFrac();
      out.innerHTML = "<b>냉각 환경</b> " + MODES[sel.value].n + "<br><b>결정 수</b> " + rock.n() + "개<br><b>결정이 되지 못한 부분(유리질)</b> " + Math.round((rock.isDone() ? glass : 0) * 100) + "%" +
        (rock.isDone() ? "<br><b>조직</b> " + textureName(rock, sel.value) : "");
    });
  })();

  /* ---------- 4. 가상 편광 현미경 ---------- */
  (function () {
    var cv = $("sim-scope"); if (!cv) return;
    var sel = $("scope-sample"), sRot = $("scope-rot"), bN = $("scope-nicol"), out = $("scope-out"), g, rock, xpl = false;
    var SAMPLES = {
      granite: { n: "화강암 (심성암)", mode: "deep", seed: 77 },
      basalt: { n: "현무암 (화산암)", mode: "near", seed: 31 },
      andesite: { n: "반상 조직 화산암", mode: "porph", seed: 913 },
      obsidian: { n: "흑요암 (화산암)", mode: "quench", seed: 5 }
    };
    function build() {
      var sm = SAMPLES[sel.value]; rock = Rock(150, 150, sm.mode, sm.seed);
      while (!rock.isDone()) rock.step();
    }
    function size() { g = S.fit(cv, 0.62); }
    size(); build(); window.addEventListener("resize", size);
    sel.addEventListener("change", build);
    bN.addEventListener("click", function () { xpl = !xpl; bN.classList.toggle("on", xpl); bN.textContent = xpl ? "상부 편광판 넣음 (직교 니콜)" : "상부 편광판 뺌 (개방 니콜)"; });
    S.loop(function () {
      var ctx = g.ctx, W = g.w, H = g.h, R = Math.min(W, H) * 0.46, cx = W * 0.42, cy = H / 2, th = +sRot.value * Math.PI / 180;
      $("scope-rotv").textContent = sRot.value + "°";
      ctx.fillStyle = "#111"; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.clip();
      ctx.translate(cx, cy); ctx.rotate(th); ctx.translate(-cx, -cy);
      paint(ctx, rock, cx - R * 1.45, cy - R * 1.45, R * 2.9, R * 2.9, xpl ? "xpl" : "ppl", th);
      ctx.restore();
      ctx.strokeStyle = "#444"; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0,0,0,.5)"; ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke();
      // 축척 막대
      var bar = R * 2.9 / 150 * 30;
      ctx.fillStyle = "#fff"; ctx.fillRect(W - bar - 24, H - 30, bar, 5); ctx.font = S.font(12, true); ctx.fillText("1 mm", W - bar / 2 - 40, H - 36);
      S.tag(ctx, xpl ? "직교 니콜" : "개방 니콜", W - 14, 26, { align: "right", size: 13, bg: xpl ? "rgba(70,40,140,.85)" : "rgba(0,0,0,.7)" });
      var t = textureName(rock, SAMPLES[sel.value].mode);
      out.innerHTML = "<b>박편</b> " + SAMPLES[sel.value].n + "<br><b>조직</b> " + t +
        "<br><b>관찰 포인트</b> " + (t === "조립질 조직" ? "결정이 크고 크기가 고르다." : t === "세립질 조직" ? "결정이 매우 작아 하나하나 구분하기 어렵다." : t === "반상 조직" ? "작은 결정(석기) 사이에 큰 결정(반정)이 박혀 있다." : "결정이 거의 없다. 직교 니콜에서 거의 검게 보인다.");
    });
  })();
})();
