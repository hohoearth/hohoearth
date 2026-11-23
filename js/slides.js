/* =====================================================================
   지구과학 수업 화면 · 슬라이드(PPT) 모드
   - 수업 페이지 위쪽 [▣ 슬라이드 모드] 버튼으로 켭니다. (키보드: ← → 넘기기, F 전체 화면, Esc 종료)
   - 본문(#content-area)의 덩어리를 화면 크기에 맞춰 여러 쪽으로 나눕니다.
   - 한 덩어리가 화면보다 크면 그 쪽만 살짝 축소합니다.
   - 판서는 js/classpen.js 가 쪽(#slide-N)마다, 학급마다 따로 저장합니다.
   사용법: 수업 페이지 </body> 앞, classpen.js 줄 바로 위에
     <script src="../js/slides.js"></script>
   ===================================================================== */
(function () {
  var area = document.getElementById("content-area");
  if (!area || window.__slides) return;
  window.__slides = true;
  var body = document.body, root = document.documentElement;

  /* ---------------- 스타일 ---------------- */
  var css = document.createElement("style");
  css.textContent = [
    ".sl-off{display:none!important}",
    "body.slides>header,body.slides>section,body.slides>footer,body.slides #sidebar-aside{display:none!important}",
    "body.slides{background:#f8fafc}",
    "body.slides #main-container{display:block!important;max-width:1320px!important;padding-top:18px!important;padding-bottom:0!important}",
    "body.slides #content-area{max-width:none!important}",
    "body.slides #content-area>*+*{margin-top:0!important}",
    "body.slides .scroll-mt-24{scroll-margin-top:0}",
    ".slide-pager{position:fixed;left:0;right:0;bottom:0;z-index:2147482995;display:none;align-items:center;gap:8px;padding:8px 14px;background:rgba(255,255,255,.97);border-top:1px solid #e2e8f0;box-shadow:0 -6px 20px -12px rgba(15,23,42,.35);font:600 13px/1.2 'Pretendard',system-ui,'Malgun Gothic',sans-serif;color:#0f172a}",
    "body.slides .slide-pager{display:flex}",
    ".slide-pager button{appearance:none;border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:10px;padding:7px 12px;font:inherit;cursor:pointer;white-space:nowrap}",
    ".slide-pager button:hover{background:#f1f5f9}.slide-pager button.on{background:#0f172a;color:#fff;border-color:#0f172a}",
    ".slide-pager .sp-title{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:800}",
    ".slide-pager .sp-bar{width:140px;height:6px;border-radius:9px;background:#e2e8f0;overflow:hidden;flex:none}",
    ".slide-pager .sp-bar i{display:block;height:100%;background:#4f46e5;width:0;transition:width .2s}",
    ".slide-pager .sp-count{font-family:ui-monospace,monospace;color:#475569;flex:none}",
    ".slide-pager .sp-sep{width:1px;height:22px;background:#e2e8f0;flex:none}",
    ".slide-pager .fs-val{min-width:54px}",
    "@media (max-width:760px){.slide-pager .sp-bar,.slide-pager .sp-title{display:none}}",
    ".sl-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 12px;border-radius:12px;border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;font-size:12px;font-weight:800;cursor:pointer;white-space:nowrap}",
    ".sl-btn:hover{background:#e0e7ff}",
    "@media print{.slide-pager{display:none!important}}"
  ].join("");
  document.head.appendChild(css);

  /* ---------------- 시작 버튼 (위쪽 '넓은 화면 모드' 옆) ---------------- */
  var btn = document.createElement("button");
  btn.type = "button"; btn.id = "btn-slide"; btn.className = "sl-btn";
  btn.title = "한 화면씩 넘기며 수업하기 (← → 키)";
  btn.innerHTML = "▣ 슬라이드 모드";
  var wide = Array.prototype.slice.call(document.querySelectorAll("header button")).filter(function (b) { return /넓은 화면/.test(b.textContent); })[0];
  if (wide) wide.parentNode.insertBefore(btn, wide.nextSibling);
  else {
    btn.style.cssText = "position:fixed;top:12px;right:14px;z-index:2147482994";
    body.appendChild(btn);
  }

  /* ---------------- 아래쪽 넘김 막대 ---------------- */
  var pager = document.createElement("div");
  pager.className = "slide-pager";
  pager.innerHTML =
    '<button type="button" data-a="prev">◀ 이전</button>' +
    '<span class="sp-title"></span><span class="sp-bar"><i></i></span><span class="sp-count"></span>' +
    '<button type="button" class="on" data-a="next">다음 ▶</button>' +
    '<span class="sp-sep"></span>' +
    '<button type="button" data-a="fs-" title="글씨 작게 (-)">가−</button><button type="button" class="fs-val" data-a="fs0" title="원래 크기로">100%</button><button type="button" data-a="fs+" title="글씨 크게 (+)">가＋</button>' +
    '<button type="button" data-a="pen" title="판서 켜기/끄기">✎ 판서</button>' +
    '<button type="button" data-a="full" title="전체 화면 (F)">⛶</button>' +
    '<button type="button" data-a="exit" title="슬라이드 모드 끝내기 (Esc)">✕ 종료</button>';
  body.appendChild(pager);

  /* ---------------- 글씨 크기 (슬라이드 모드에서만) ---------------- */
  var FKEY = "sl.font";
  var fs = 1;
  try { fs = parseFloat(localStorage.getItem(FKEY)) || 1; } catch (e) {}
  function applyFont() {
    root.style.fontSize = on() ? (fs * 100) + "%" : "";
    pager.querySelector(".fs-val").textContent = Math.round(fs * 100) + "%";
  }
  function setFont(v) {
    fs = Math.max(0.7, Math.min(1.8, Math.round(v * 10) / 10));
    try { localStorage.setItem(FKEY, fs); } catch (e) {}
    applyFont(); rebuildSoon();
  }

  /* ---------------- 쪽 나누기 ---------------- */
  var slides = [], cur = 0, timer = 0, busy = false;
  function on() { return body.classList.contains("slides"); }
  function kids(el) { return Array.prototype.filter.call(el.children, function (k) { return k.tagName !== "SCRIPT" && k.tagName !== "STYLE"; }); }
  /* 본문 묶음: #content-area의 자식. 섹션 여러 개를 감싼 상자(예: 핵심 개념 1~4)는 섹션 단위로 풀어서 씀 */
  var units = [];
  kids(area).forEach(function (k) {
    var secs = kids(k).filter(function (x) { return x.tagName === "SECTION"; });
    if (k.tagName !== "SECTION" && secs.length >= 2) units.push.apply(units, kids(k));
    else units.push(k);
  });
  /* 아래쪽 넘김 막대와 판서 도구(학급 선택·판서 버튼)에 가리지 않는 높이까지 */
  function limit() {
    var dock = document.querySelector(".cp-dock");
    return window.innerHeight - pager.offsetHeight - (dock ? dock.offsetHeight + 10 : 0) - 12;
  }
  function bottom() { return area.getBoundingClientRect().bottom + window.scrollY; }
  function topY() { return area.getBoundingClientRect().top + window.scrollY; }
  function fits() { return bottom() <= limit() + 0.5; }
  function ratio() { return (limit() - topY()) / Math.max(1, bottom() - topY()); }
  /* 더 잘게 나눌 수 있는 덩어리인지: 자식이 여럿이고 그림 묶음·표·시뮬레이션 같은 한 덩어리가 아님 */
  function canSplit(el) {
    if (!kids(el).length) return false;
    if (el.matches("figure, table, svg, canvas, form, details, button, label, [class*='grid-cols-12']")) return false;
    if (el.matches("ul, ol") && kids(el).length < 4) return false;   // 짧은 목록은 한 덩어리로
    if (el.querySelector(":scope > canvas, :scope > input, :scope > select")) return false;
    return true;
  }
  /* 섹션 머리(예: '핵심 개념 1 · 1. 해수의 수온')는 이어지는 쪽에도 계속 보여 줌 */
  function headOf(u) {
    var f = kids(u)[0];
    return f && kids(u).length > 1 && f.querySelector("h2, h3") && f.getBoundingClientRect().height < 160 ? f : null;
  }
  function titleOf(u) {
    /* 제목 태그가 없으면 첫 줄(예: '동기 유발 · 생각해보기')을 씀. 정답이 제목에 나오지 않도록 strong은 보지 않음 */
    var h = u.querySelector("h2, h3, h4");
    var first = kids(u)[0];
    var t = "";
    if (h) {                                     // 수식(KaTeX)은 화면 글자만 남김
      var c = h.cloneNode(true);
      c.querySelectorAll(".katex-mathml").forEach(function (m) { m.remove(); });
      t = c.textContent;
    } else if (first) t = (first.innerText || first.textContent).split("\n").map(function (s) { return s.trim(); }).filter(Boolean)[0] || "";
    t = t.replace(/\s+/g, " ").trim();
    return t.length > 60 ? t.slice(0, 58) + "…" : t;
  }
  function clearAll() {
    area.querySelectorAll(".sl-off").forEach(function (e) { e.classList.remove("sl-off"); });
    unscale();
  }
  function showOnly(u, all, page, head) {
    units.forEach(function (x) {
      var keep = x === u || x.contains(u) || u.contains(x);
      x.classList.toggle("sl-off", !keep);
    });
    /* 감싸는 상자 안에 있는 섹션이면, 상자는 보이고 다른 형제 섹션만 숨김 */
    var p = u.parentElement;
    while (p && p !== area) { p.classList.remove("sl-off"); p = p.parentElement; }
    all.forEach(function (e) { e.classList.add("sl-off"); });
    if (head) head.classList.remove("sl-off");
    page.forEach(function (e) { var x = e; while (x && x !== u) { x.classList.remove("sl-off"); x = x.parentElement; } });
  }
  function paginate(u) {
    var head = headOf(u);
    var queue = kids(u).filter(function (k) { return k !== head; }), all = queue.slice(), pages = [[]], guard = 0;
    if (!queue.length) return { pages: [[]], all: [], head: null };
    if (limit() < 200) return { pages: [queue], all: all, head: head };   // 창이 숨겨져 크기를 잴 수 없을 때
    while (queue.length && guard++ < 600) {
      var b = queue.shift(), page = pages[pages.length - 1];
      page.push(b); showOnly(u, all, page, head);
      if (fits() || ratio() >= 0.88) continue;
      page.pop();
      if (page.length) { pages.push([]); queue.unshift(b); continue; }   // 다음 쪽에서 새로 시작
      if (canSplit(b)) {                        // 혼자서도 넘치는 덩어리 → 자식 단위로 쪼개서 다시 시도
        var ks = kids(b); all.push.apply(all, ks);
        queue = ks.concat(queue); continue;
      }
      page.push(b);                              // 혼자서도 넘침 → 보여 줄 때 축소
    }
    return { pages: pages.filter(function (p) { return p.length; }), all: all, head: head };
  }
  function build() {
    busy = true;
    var keep = slides[cur] ? slides[cur].key : null;
    slides = [];
    window.scrollTo(0, 0);
    units.forEach(function (u, ui) {
      clearAll();
      var r = paginate(u);
      r.pages.forEach(function (pg, pi) {
        slides.push({ u: u, all: r.all, page: pg, head: r.head, pi: pi, pn: r.pages.length, title: titleOf(u), key: ui + "." + pi });
      });
    });
    clearAll();
    busy = false;
    if (keep) { var k = slides.findIndex(function (s) { return s.key === keep; }); if (k >= 0) cur = k; }
    cur = Math.max(0, Math.min(cur, slides.length - 1));
  }

  /* ---------------- 보여 주기 ---------------- */
  function unscale() { area.style.transform = area.style.transformOrigin = area.style.marginBottom = ""; }
  function fitCurrent() {
    if (!on()) return;
    unscale();
    if (fits()) return;
    var h = bottom() - topY(), z = Math.max(0.5, ratio());
    area.style.transformOrigin = "top center";
    area.style.transform = "scale(" + z.toFixed(4) + ")";
    area.style.marginBottom = (-h * (1 - z)).toFixed(1) + "px";
  }
  function show(i) {
    if (!slides.length) return;
    cur = Math.max(0, Math.min(slides.length - 1, i));
    var s = slides[cur];
    clearAll();
    showOnly(s.u, s.all, s.page, s.head);
    pager.querySelector(".sp-title").textContent = s.title + (s.pn > 1 ? " · " + (s.pi + 1) + "/" + s.pn + "쪽" : "");
    pager.querySelector(".sp-count").textContent = (cur + 1) + " / " + slides.length;
    pager.querySelector(".sp-bar i").style.width = ((cur + 1) / slides.length * 100) + "%";
    window.scrollTo(0, 0);
    try { history.replaceState(null, "", location.pathname + location.search + "#slide-" + (cur + 1)); } catch (e) {}
    fitCurrent();
    busy = true; window.dispatchEvent(new Event("resize")); busy = false;   // 판서 화면 다시 그리기
  }
  /* 창이 숨겨져 있다가 보이게 되면 다시 나누기 */
  document.addEventListener("visibilitychange", function () { if (!document.hidden) rebuildSoon(); });
  function rebuildSoon() {
    if (!on()) return;
    clearTimeout(timer);
    timer = setTimeout(function () { build(); show(cur); }, 180);
  }

  function slideMode(want, start) {
    body.classList.toggle("slides", want);
    btn.classList.toggle("on", want);
    applyFont();
    if (want) {
      build();
      cur = typeof start === "number" ? start : 0;
      show(cur);
    } else {
      penBtn(false);
      clearAll();
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      busy = true; window.dispatchEvent(new Event("resize")); busy = false;
      var u = slides[cur] && slides[cur].u;
      if (u) u.scrollIntoView({ block: "start" });
    }
  }
  /* 지금 화면에서 보고 있던 덩어리(몇 번째 묶음)를 기억 */
  function visibleUnit() {
    var best = units[0];
    units.forEach(function (u) { if (u.getBoundingClientRect().top < window.innerHeight * 0.4) best = u; });
    return best;
  }

  /* 판서는 classpen.js 의 [✎ 판서] 버튼을 그대로 씀 */
  function penBtn(force) {
    var b = document.querySelector(".cp-dock [data-a=pen]");
    if (!b) return;
    var isOn = b.classList.contains("on");
    if (force === undefined || force !== isOn) b.click();
    setTimeout(function () {
      var nb = document.querySelector(".cp-dock [data-a=pen]");
      pager.querySelector('[data-a="pen"]').classList.toggle("on", !!(nb && nb.classList.contains("on")));
    }, 30);
  }
  function fullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (root.requestFullscreen) root.requestFullscreen();
  }

  btn.addEventListener("click", function () {
    if (on()) { slideMode(false); return; }
    var u = visibleUnit();
    slideMode(true, 0);
    var k = slides.findIndex(function (s) { return s.u === u; });
    if (k > 0) show(k);
  });
  pager.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-a]"); if (!b) return;
    var a = b.dataset.a;
    if (a === "prev") show(cur - 1);
    if (a === "next") show(cur + 1);
    if (a === "exit") slideMode(false);
    if (a === "full") fullscreen();
    if (a === "pen") penBtn();
    if (a === "fs+") setFont(fs + 0.1);
    if (a === "fs-") setFont(fs - 0.1);
    if (a === "fs0") setFont(1);
  });
  document.addEventListener("keydown", function (e) {
    if (!on()) return;
    var t = e.target, tg = t.tagName;
    if (tg === "TEXTAREA" || tg === "INPUT" || tg === "SELECT" || t.isContentEditable) return;
    if (document.querySelector(".cp-ink.on")) return;            // 판서 중에는 넘김 키 막기
    var k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || (k === " " && !t.closest("button"))) { e.preventDefault(); show(cur + 1); }
    else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); show(cur - 1); }
    else if (k === "Home") show(0);
    else if (k === "End") show(slides.length - 1);
    else if (e.code === "KeyF" && !e.ctrlKey && !e.metaKey) fullscreen();
    else if (k === "+" || k === "=") setFont(fs + 0.1);
    else if (k === "-") setFont(fs - 0.1);
    else if (k === "Escape" && !document.fullscreenElement) slideMode(false);
  });
  /* 정답 펼치기·계산기처럼 내용 높이가 바뀌면 그 쪽만 다시 맞춤 */
  area.addEventListener("click", function () { if (on()) requestAnimationFrame(function () { requestAnimationFrame(fitCurrent); }); });
  window.addEventListener("resize", function () { if (!busy && on()) rebuildSoon(); });
  /* 아래쪽 판서 도구에서 켜고 끈 것도 넘김 막대의 [✎ 판서] 표시에 맞춤 */
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".cp-dock [data-a=pen], .cp-tools [data-t=done]")) return;
    setTimeout(function () {
      var nb = document.querySelector(".cp-dock [data-a=pen]");
      pager.querySelector('[data-a="pen"]').classList.toggle("on", !!(nb && nb.classList.contains("on")));
    }, 30);
  });

  /* 주소에 #slide-N 이 있으면(지난 위치로 이동 등) 그 쪽으로 시작 */
  window.addEventListener("load", function () {
    var m = location.hash.match(/^#slide-(\d+)$/);
    if (m) { body.classList.add("slides"); slideMode(true, parseInt(m[1], 10) - 1); }
  });
})();
