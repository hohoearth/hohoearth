/* 지구시스템과학 수업 자료 · 공통 스크립트
   각 차시 HTML은 <body data-lesson="1-1"> 과 <main> 만 가지고 있으면,
   상단 바·왼쪽 목차·차시 흐름·형성 평가를 이 파일이 만들어 준다.
   <body data-v2> 가 붙은 차시에는 새 기능(글씨 크기 조절, 접는 심화 노트,
   화면 맞춤 슬라이드, 판서)이 켜진다. 지금은 1-1에만 적용되어 있다. */
(function () {
  var UNITS = [
    { name: "I. 지구 탄생과 생동하는 지구", lessons: [
      { id: "1-1", t: "지구의 형성 과정", p: "10 ~ 15", ready: true },
      { id: "1-2", t: "생명체와 지구시스템의 상호작용", p: "16 ~ 21", ready: true },
      { id: "1-3", t: "판 구조론의 발달사와 플룸 구조론", p: "22 ~ 30", ready: true },
      { id: "1-4", t: "화산 활동과 화성암의 특성", p: "31 ~ 35", ready: true },
      { id: "1-5", t: "지진파와 지구 내부 구조", p: "36 ~ 44", ready: true } ] },
    { name: "II. 해수의 운동과 순환", lessons: [
      { id: "2-1", t: "해수를 움직이는 힘", p: "54 ~ 57", ready: true },
      { id: "2-2", t: "지형류", p: "58 ~ 61", ready: true },
      { id: "2-3", t: "해파", p: "62 ~ 65", ready: true },
      { id: "2-4", t: "해일", p: "66 ~ 69", ready: true },
      { id: "2-5", t: "조석", p: "70 ~ 74", ready: true } ] },
    { name: "III. 강수 과정과 대기의 운동", lessons: [
      { id: "3-1", t: "지구의 대기와 생명체", p: "84 ~ 87", ready: true },
      { id: "3-2", t: "지구 열수지", p: "88 ~ 91", ready: true },
      { id: "3-3", t: "대기 안정도와 강수", p: "92 ~ 99", ready: true },
      { id: "3-4", t: "기압의 연직 분포와 대기를 움직이는 힘", p: "100 ~ 103", ready: true },
      { id: "3-5", t: "여러 가지 바람", p: "104 ~ 107", ready: true },
      { id: "3-6", t: "편서풍 파동", p: "108 ~ 114", ready: true } ] }
  ];
  window.ESC_UNITS = UNITS;
  if (!document.querySelector("link[rel=icon]")) {
    var ic = document.createElement("link"); ic.rel = "icon";
    ic.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='14' fill='%232563eb'/%3E%3Cpath d='M6 14c5-3 9 3 14 0s6-1 6-1v7c-5 3-9-2-14 0s-6 1-6 1z' fill='%2365a30d'/%3E%3C/svg%3E";
    document.head.appendChild(ic);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function code(id) { var a = id.split("-"); return pad(+a[0]) + "-" + pad(+a[1]); }
  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }
    catch (e) { return null; }
  }
  var flat = [];
  UNITS.forEach(function (u) { u.lessons.forEach(function (l) { l.unit = u.name; flat.push(l); }); });

  var body = document.body;
  var id = body.dataset.lesson;
  var main = document.querySelector("main");
  if (!id || !main) return;
  var me = flat.filter(function (l) { return l.id === id; })[0];
  var order = flat.indexOf(me) + 1;
  var V2 = body.hasAttribute("data-v2");
  var FSZ = '<div class="fsz" title="글씨 크기"><button class="tbtn" type="button" data-fs="down" title="글씨 작게">가−</button>' +
    '<button class="fs-val" type="button" data-fs="reset" title="100%로 되돌리기">100%</button>' +
    '<button class="tbtn" type="button" data-fs="up" title="글씨 크게">가＋</button></div>';

  /* ---- 상단 바 ---- */
  var top = document.createElement("header");
  top.className = "topbar";
  top.innerHTML =
    '<a class="back" href="../index.html">← 메인 아카이브</a>' +
    '<div class="crumb"><span class="idx">[' + pad(order) + "/" + pad(flat.length) + ']</span>' +
    '<span class="path">' + me.unit + '<span>›</span>' + code(id).slice(3) + ". " + me.t + "</span></div>" +
    '<div class="spacer"></div>' +
    (V2 ? FSZ : "") +
    '<button class="tbtn" id="btn-teacher" title="교사용 메모 보이기/숨기기">교사용 메모</button>' +
    '<button class="tbtn" id="btn-wide" title="목차를 숨기고 글자를 키웁니다">⤢ 넓은 화면 모드</button>' +
    '<button class="tbtn" id="btn-slide" title="카드를 한 장씩 PPT처럼 봅니다 (←/→, Esc)">▣ 슬라이드 모드</button>' +
    '<span class="pages">교재 p. ' + me.p + "</span>";
  body.insertBefore(top, body.firstChild);

  /* ---- 글씨 크기 (v2) ---- */
  var fsScale = 1;
  function applyFont() {
    if (!V2) return;
    var base = (body.classList.contains("slides") || body.classList.contains("wide")) ? 19 : 16;
    document.documentElement.style.fontSize = (base * fsScale).toFixed(2) + "px";
    document.querySelectorAll(".fs-val").forEach(function (el) { el.textContent = Math.round(fsScale * 100) + "%"; });
  }
  function setFont(s) {
    fsScale = Math.round(Math.max(0.7, Math.min(1.8, s)) * 10) / 10;
    store("esc-fs", String(fsScale));
    applyFont();
    window.dispatchEvent(new Event("resize"));
  }
  if (V2) {
    fsScale = parseFloat(store("esc-fs")) || 1;
    document.addEventListener("click", function (e) {
      var b = e.target.closest("[data-fs]"); if (!b) return;
      var a = b.dataset.fs;
      setFont(a === "up" ? fsScale + 0.1 : a === "down" ? fsScale - 0.1 : 1);
    });
  }

  /* ---- 레이아웃 ---- */
  var shell = document.createElement("div");
  shell.className = "shell";
  main.parentNode.insertBefore(shell, main);
  var side = document.createElement("aside");
  side.className = "side";
  shell.appendChild(side);
  shell.appendChild(main);

  /* 차시 흐름(이 페이지 섹션) */
  var secs = Array.prototype.slice.call(main.querySelectorAll(".sec[data-nav]"));
  var flowHtml = '<div class="side-box"><div class="side-head"><b>이 차시 흐름</b><span>' + secs.length + ' STEPS</span></div><ul class="toc flow-nav">';
  secs.forEach(function (s, i) {
    if (!s.id) s.id = "sec" + (i + 1);
    flowHtml += '<li><a href="#' + s.id + '"><span class="dot"></span>' + s.dataset.nav + "</a></li>";
  });
  flowHtml += "</ul></div>";

  var tocHtml = '<div class="side-box"><div class="side-head"><b>교재 전체 목차</b><span>' + flat.length + ' UNITS</span></div><ul class="toc">';
  UNITS.forEach(function (u) {
    tocHtml += '<li class="grp">' + u.name + "</li>";
    u.lessons.forEach(function (l) {
      var cls = l.id === id ? "active" : (l.ready ? "" : "todo");
      var n = code(l.id).slice(3);
      tocHtml += '<li><a class="' + cls + '" href="' + l.id + '.html"><span>' + n + ". " + l.t + '</span><span class="cd">' + code(l.id) + "</span></a></li>";
    });
  });
  tocHtml += "</ul></div>";
  side.innerHTML = flowHtml + tocHtml;

  /* 스크롤 위치에 따라 흐름 강조 */
  var navLinks = side.querySelectorAll(".flow-nav a");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle("here", a.getAttribute("href") === "#" + en.target.id); });
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---- 버튼 ---- */
  function toggle(cls, btnId, key) {
    var b = document.getElementById(btnId);
    function set(on) { body.classList.toggle(cls, on); b.classList.toggle("on", on); store(key, on ? "1" : "0"); applyFont(); }
    b.addEventListener("click", function () { set(!body.classList.contains(cls)); window.dispatchEvent(new Event("resize")); });
    set(store(key) === "1");
  }
  toggle("teacher", "btn-teacher", "esc-teacher");
  toggle("wide", "btn-wide", "esc-wide");
  applyFont();

  /* ---- 접는 심화 노트 (v2) ----
     '심화해서 알아보기' 노트는 제목(질문)만 보이고, 누르면 내용이 펼쳐진다. */
  if (V2) {
    main.querySelectorAll(".dnote").forEach(function (d) {
      var lb = d.querySelector(".lb");
      if (!lb || lb.textContent.indexOf("심화") < 0) return;
      d.classList.add("fold");
      d.setAttribute("role", "button");
      d.setAttribute("aria-expanded", "false");
      d.tabIndex = 0;
      function tg() { var o = d.classList.toggle("open"); d.setAttribute("aria-expanded", o ? "true" : "false"); }
      d.addEventListener("click", function (e) { if (e.target.closest("a")) return; tg(); });
      d.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); e.stopPropagation(); tg(); } });
    });
  }

  if (V2) v2Slides(); else legacySlides();

  /* =====================================================================
     슬라이드(PPT) 모드 · 기존 방식: 카드 한 장 = 슬라이드 한 장
     ===================================================================== */
  function legacySlides() {
    var cards = Array.prototype.slice.call(main.querySelectorAll(".sec > .card"));
    var cur = 0;
    var pager = document.createElement("div");
    pager.className = "slide-pager";
    pager.innerHTML = '<button class="tbtn" data-a="prev">◀ 이전</button>' +
      '<span class="sp-title"></span><div class="sp-bar"><i></i></div><span class="sp-count"></span>' +
      '<button class="tbtn on" data-a="next">다음 ▶</button>' +
      '<button class="tbtn" data-a="full" title="전체 화면">⛶</button>' +
      '<button class="tbtn" data-a="exit">✕ 종료</button>';
    body.appendChild(pager);
    function show(i) {
      cur = Math.max(0, Math.min(cards.length - 1, i));
      var sec = cards[cur].closest(".sec");
      main.querySelectorAll(".sec").forEach(function (s) { s.classList.toggle("off", s !== sec); });
      cards.forEach(function (c, k) { c.classList.toggle("off", k !== cur); });
      pager.querySelector(".sp-count").textContent = (cur + 1) + " / " + cards.length;
      pager.querySelector(".sp-bar i").style.width = ((cur + 1) / cards.length * 100) + "%";
      pager.querySelector(".sp-title").textContent = sec.dataset.nav || "";
      window.scrollTo(0, 0);
      try { history.replaceState(null, "", "#slide-" + (cur + 1)); } catch (e) {}
      window.dispatchEvent(new Event("resize"));
    }
    function slideMode(on, start) {
      body.classList.toggle("slides", on);
      document.getElementById("btn-slide").classList.toggle("on", on);
      if (on) show(start === undefined ? cur : start);
      else {
        main.querySelectorAll(".off").forEach(function (el) { el.classList.remove("off"); });
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
        cards[cur].scrollIntoView({ block: "start" });
        window.dispatchEvent(new Event("resize"));
      }
    }
    document.getElementById("btn-slide").addEventListener("click", function () {
      if (body.classList.contains("slides")) { slideMode(false); return; }
      var start = 0;
      cards.forEach(function (c, k) { if (c.getBoundingClientRect().top < window.innerHeight * 0.4) start = k; });
      slideMode(true, start);
    });
    pager.addEventListener("click", function (e) {
      var a = e.target.closest("button"); if (!a) return;
      var act = a.dataset.a;
      if (act === "prev") show(cur - 1);
      if (act === "next") show(cur + 1);
      if (act === "exit") slideMode(false);
      if (act === "full") {
        if (document.fullscreenElement) document.exitFullscreen();
        else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
      }
    });
    side.querySelectorAll(".flow-nav a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (!body.classList.contains("slides")) return;
        e.preventDefault();
        var sec = document.querySelector(a.getAttribute("href"));
        var k = cards.findIndex(function (c) { return sec.contains(c); });
        if (k >= 0) show(k);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (!body.classList.contains("slides")) return;
      var t = e.target.tagName;
      if (t === "TEXTAREA" || t === "INPUT" || t === "SELECT") return;
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); show(cur + 1); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(cur - 1); }
      else if (e.key === "Home") show(0);
      else if (e.key === "End") show(cards.length - 1);
      else if (e.key === "Escape" && !document.fullscreenElement) slideMode(false);
    });
    var mh = location.hash.match(/^#slide-(\d+)$/);
    if (mh) slideMode(true, parseInt(mh[1], 10) - 1);
  }

  /* =====================================================================
     슬라이드(PPT) 모드 · v2
     - 카드가 화면보다 길면 여러 쪽으로 나눈다 (넘칠 때만).
     - 시뮬레이션은 항상 별도 쪽으로 보여 준다.
     - 그래도 넘치면 그 쪽만 살짝 축소한다.
     - 판서(펜): 슬라이드마다 따로 남는다 (새로 고치면 사라짐).
     ===================================================================== */
  function v2Slides() {
    var cards = Array.prototype.slice.call(main.querySelectorAll(".sec > .card"));
    var slides = [], cur = 0, busy = false, timer = null, penOn = false;
    var btnSlide = document.getElementById("btn-slide");

    var pager = document.createElement("div");
    pager.className = "slide-pager";
    pager.innerHTML =
      '<button class="tbtn" type="button" data-a="prev">◀ 이전</button>' +
      '<span class="sp-title"></span><div class="sp-bar"><i></i></div><span class="sp-count"></span>' +
      '<button class="tbtn on" type="button" data-a="next">다음 ▶</button>' +
      '<span class="sp-sep"></span>' + FSZ +
      '<button class="tbtn" type="button" data-a="memo" title="교사용 메모 보이기/숨기기">메모</button>' +
      '<button class="tbtn" type="button" data-a="pen" title="판서 켜기/끄기 (P)">✎ 판서</button>' +
      '<button class="tbtn" type="button" data-a="full" title="전체 화면 (F)">⛶</button>' +
      '<button class="tbtn" type="button" data-a="exit" title="슬라이드 모드 끝내기 (Esc)">✕ 종료</button>';
    body.appendChild(pager);
    applyFont();

    function on() { return body.classList.contains("slides"); }
    function kids(el) { return Array.prototype.slice.call(el.children); }
    function hide(el) { el.classList.add("pg-off"); }
    function fireResize() { busy = true; window.dispatchEvent(new Event("resize")); busy = false; }
    function toTop() { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }
    function limit() { return window.innerHeight - pager.offsetHeight - 14; }
    function bottomOf(el) { return el.getBoundingClientRect().bottom + window.scrollY; }
    function fits(card) { return bottomOf(card) <= limit() + 0.5; }
    function scaleNeeded(card) {
      var topY = card.getBoundingClientRect().top + window.scrollY;
      return (limit() - topY) / (bottomOf(card) - topY);
    }

    /* 카드 안에서 쪽 나누기의 단위가 되는 덩어리. 소제목(h4)은 다음 소제목 전까지 한 덩어리. */
    function hostOf(card) { return card.classList.contains("split") ? (card.querySelector(":scope > .body") || card) : card; }
    function topBlocks(card) {
      var h = hostOf(card), out = [], grp = null;
      kids(h).forEach(function (el) {
        if (el.classList.contains("sim") || el.classList.contains("notes")) return;
        if (h === card && el.tagName === "H3") return;
        if (el.tagName === "H4") { grp = [el]; out.push(grp); return; }
        if (grp) grp.push(el); else out.push([el]);
      });
      return out;
    }
    function canSplit(el) {
      return el.children.length > 1 && !el.matches(".figs, .chain, .tw, .eq, figure, table, ol, .reveal, .mini, .qbox, svg, .grid2");
    }
    function clearCard(card) {
      card.querySelectorAll(".pg-off").forEach(function (e) { e.classList.remove("pg-off"); });
      card.classList.remove("cont", "sim-only");
      unscale(card);
    }
    function applyMain(card, all, page, first) {
      all.forEach(hide);
      card.querySelectorAll(".sim").forEach(hide);
      page.forEach(function (blk) {
        blk.forEach(function (el) { var x = el; while (x && x !== card) { x.classList.remove("pg-off"); x = x.parentElement; } });
      });
      var notes = card.querySelector(":scope > .notes");
      if (notes) notes.classList.toggle("pg-off", !first);
      card.classList.toggle("cont", !first);
    }
    function applySim(card, sim) {
      card.classList.add("sim-only");
      var x = sim;
      while (x && x !== card) {
        var p = x.parentElement;
        kids(p).forEach(function (k) { if (k !== x && !(p === card && k.tagName === "H3")) hide(k); });
        x = p;
      }
    }
    function paginate(card) {
      var queue = topBlocks(card), all = [], pages = [[]], guard = 0;
      queue.forEach(function (b) { all.push.apply(all, b); });
      var n = queue.length;
      while (queue.length && guard++ < 400) {
        var b = queue.shift(), page = pages[pages.length - 1];
        page.push(b); applyMain(card, all, page, pages.length === 1);
        if (fits(card) || scaleNeeded(card) >= 0.85) continue; // 조금만 넘치면 나누지 않고 살짝 축소
        page.pop();
        if (page.length) { pages.push([]); queue.unshift(b); continue; }
        if (b.length === 1 && canSplit(b[0])) {
          var ks = kids(b[0]);
          all.push.apply(all, ks);
          queue = ks.map(function (k) { return [k]; }).concat(queue);
          continue;
        }
        page.push(b); // 혼자서도 넘치는 덩어리 → 보여 줄 때 축소
      }
      pages = pages.filter(function (p) { return p.length; });
      if (!pages.length) pages = [[]];
      return { all: all, pages: pages, n: n };
    }

    function build() {
      busy = true;
      var keep = slides[cur] ? slides[cur].key : null;
      slides = [];
      toTop();
      main.querySelectorAll(".sec").forEach(function (s) { s.classList.add("off"); });
      cards.forEach(function (c) { c.classList.add("off"); clearCard(c); });
      cards.forEach(function (card, ci) {
        var sec = card.closest(".sec");
        sec.classList.remove("off"); card.classList.remove("off");
        var sims = Array.prototype.slice.call(card.querySelectorAll(".sim"));
        var r = paginate(card);
        if (r.n || !sims.length) {
          r.pages.forEach(function (pg, pi) {
            slides.push({ card: card, kind: "main", all: r.all, page: pg, pi: pi, pn: r.pages.length, key: ci + "m" + pi });
          });
        }
        sims.forEach(function (sim, si) { slides.push({ card: card, kind: "sim", sim: sim, si: si, key: ci + "s" + si }); });
        clearCard(card);
        sec.classList.add("off"); card.classList.add("off");
      });
      busy = false;
      if (keep) {
        var k = slides.findIndex(function (s) { return s.key === keep; });
        if (k < 0) k = slides.findIndex(function (s) { return s.key.indexOf(keep.replace(/[ms]\d+$/, "")) === 0; });
        cur = k >= 0 ? k : Math.min(cur, slides.length - 1);
      }
    }

    function show(i) {
      if (!slides.length) return;
      cur = Math.max(0, Math.min(slides.length - 1, i));
      var s = slides[cur], sec = s.card.closest(".sec");
      main.querySelectorAll(".sec").forEach(function (x) { x.classList.toggle("off", x !== sec); });
      cards.forEach(function (c) { c.classList.toggle("off", c !== s.card); clearCard(c); });
      if (s.kind === "main") applyMain(s.card, s.all, s.page, s.pi === 0);
      else applySim(s.card, s.sim);
      var sub = s.kind === "sim" ? " · 시뮬레이션" : (s.pn > 1 ? " · " + (s.pi + 1) + "/" + s.pn + "쪽" : "");
      pager.querySelector(".sp-title").textContent = (sec.dataset.nav || "") + sub;
      pager.querySelector(".sp-count").textContent = (cur + 1) + " / " + slides.length;
      pager.querySelector(".sp-bar i").style.width = ((cur + 1) / slides.length * 100) + "%";
      pager.querySelector('[data-a="memo"]').classList.toggle("on", body.classList.contains("teacher"));
      toTop();
      try { history.replaceState(null, "", "#slide-" + (cur + 1)); } catch (e) {}
      fireResize();
      fitCurrent();
      ink.load(s.key);
    }

    /* 지금 쪽이 화면을 넘치면 그 쪽만 축소해서 맞춘다 (노트·답안을 펼쳤을 때도) */
    function unscale(card) { card.style.transform = card.style.transformOrigin = card.style.marginBottom = ""; }
    function fitCurrent() {
      var s = slides[cur]; if (!s || !on()) return;
      var card = s.card;
      shell.style.paddingBottom = (pager.offsetHeight + 12) + "px";
      unscale(card);
      if (fits(card)) return;
      var topY = card.getBoundingClientRect().top + window.scrollY, h = bottomOf(card) - topY;
      var z = Math.max(0.45, scaleNeeded(card));
      card.style.transformOrigin = "top center";
      card.style.transform = "scale(" + z.toFixed(4) + ")";
      card.style.marginBottom = (-h * (1 - z)).toFixed(1) + "px";
    }

    function rebuildSoon() {
      clearTimeout(timer);
      timer = setTimeout(function () { if (!on()) return; build(); show(cur); }, 160);
    }
    window.addEventListener("resize", function () { if (!busy && on()) { ink.size(); rebuildSoon(); } });
    window.addEventListener("load", function () { if (on()) rebuildSoon(); });
    var quizBox = document.getElementById("quiz");
    if (quizBox && "MutationObserver" in window) {
      new MutationObserver(function () { if (on() && !busy) rebuildSoon(); }).observe(quizBox, { childList: true });
    }
    main.addEventListener("click", function () {
      if (!on()) return;
      requestAnimationFrame(function () { requestAnimationFrame(fitCurrent); });
    });

    function slideMode(want, startCard) {
      body.classList.toggle("slides", want);
      btnSlide.classList.toggle("on", want);
      applyFont();
      if (want) {
        build();
        if (startCard) { var k = slides.findIndex(function (s) { return s.card === startCard; }); cur = k < 0 ? 0 : k; }
        ink.size();
        show(cur);
      } else {
        pen(false);
        var c = slides[cur] && slides[cur].card;
        cards.forEach(clearCard);
        shell.style.paddingBottom = "";
        main.querySelectorAll(".off").forEach(function (el) { el.classList.remove("off"); });
        try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
        window.dispatchEvent(new Event("resize"));
        if (c) c.scrollIntoView({ block: "start" });
      }
    }
    function fullscreen() {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
    }

    btnSlide.addEventListener("click", function () {
      if (on()) { slideMode(false); return; }
      var start = cards[0];
      cards.forEach(function (c) { if (c.getBoundingClientRect().top < window.innerHeight * 0.4) start = c; });
      slideMode(true, start);
    });
    pager.addEventListener("click", function (e) {
      var a = e.target.closest("button[data-a]"); if (!a) return;
      var act = a.dataset.a;
      if (act === "prev") show(cur - 1);
      if (act === "next") show(cur + 1);
      if (act === "exit") slideMode(false);
      if (act === "full") fullscreen();
      if (act === "pen") pen(!penOn);
      if (act === "memo") { document.getElementById("btn-teacher").click(); a.classList.toggle("on", body.classList.contains("teacher")); }
    });
    side.querySelectorAll(".flow-nav a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        if (!on()) return;
        e.preventDefault();
        var sec = document.querySelector(a.getAttribute("href"));
        var k = slides.findIndex(function (s) { return sec.contains(s.card); });
        if (k >= 0) show(k);
      });
    });
    document.addEventListener("keydown", function (e) {
      if (!on()) return;
      var t = e.target, tg = t.tagName;
      if (tg === "TEXTAREA" || tg === "INPUT" || tg === "SELECT") return;
      var k = e.key;
      if (k === "ArrowRight" || k === "PageDown" || (k === " " && !t.closest("button, .dnote"))) { e.preventDefault(); show(cur + 1); }
      else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); show(cur - 1); }
      else if (k === "Home") show(0);
      else if (k === "End") show(slides.length - 1);
      else if (e.code === "KeyP" && !e.ctrlKey && !e.metaKey) pen(!penOn);
      else if (e.code === "KeyF" && !e.ctrlKey && !e.metaKey) fullscreen();
      else if (k === "+" || k === "=") setFont(fsScale + 0.1);
      else if (k === "-") setFont(fsScale - 0.1);
      else if (k === "Escape") { if (penOn) pen(false); else if (!document.fullscreenElement) slideMode(false); }
    });

    /* ---------------- 판서 ---------------- */
    var ink = (function () {
      var cv = document.createElement("canvas");
      cv.className = "ink-layer";
      body.appendChild(cv);
      var bar = document.createElement("div");
      bar.className = "ink-tools";
      var PENS = [["#e03131", "빨강"], ["#1c7ed6", "파랑"], ["#2f9e44", "초록"], ["auto", "검정/흰색 (화면 색에 맞춤)"]];
      bar.innerHTML = PENS.map(function (p, i) {
        return '<button type="button" class="sw' + (i === 0 ? " on" : "") + '" data-c="' + p[0] + '" title="' + p[1] + ' 펜" style="background:' + (p[0] === "auto" ? "var(--text)" : p[0]) + '"></button>';
      }).join("") +
        '<button type="button" class="tbtn" data-t="hl" title="형광펜">형광펜</button>' +
        '<button type="button" class="tbtn" data-t="w" title="굵기 바꾸기">굵기 <b>보통</b></button>' +
        '<button type="button" class="tbtn" data-t="er" title="선을 문질러 지우기">지우개</button>' +
        '<button type="button" class="tbtn" data-t="undo" title="되돌리기 (Ctrl+Z)">↶</button>' +
        '<button type="button" class="tbtn" data-t="clr" title="이 쪽의 판서 모두 지우기">이 쪽 지우기</button>' +
        '<button type="button" class="tbtn on" data-t="done" title="판서 끝내기 (P)">완료</button>';
      body.appendChild(bar);
      var data = {}, key = null, strokes = [], ctx = cv.getContext("2d"), dpr = 1;
      var tool = { c: "#e03131", mode: "pen", wi: 1 }, WIDTHS = [[2.5, "가늘게"], [4.5, "보통"], [8, "굵게"]];
      var drawing = null, raf = 0;
      function color(c) { return c === "auto" ? getComputedStyle(body).color : c; }
      function size() {
        dpr = window.devicePixelRatio || 1;
        var w = window.innerWidth, h = window.innerHeight;
        cv.style.width = w + "px"; cv.style.height = h + "px";
        cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
        bar.style.bottom = (pager.offsetHeight + 12) + "px";
        render();
      }
      function line(s) {
        var p = s.p; if (!p.length) return;
        ctx.globalAlpha = s.a; ctx.strokeStyle = ctx.fillStyle = color(s.c); ctx.lineWidth = s.w;
        ctx.lineCap = "round"; ctx.lineJoin = "round";
        if (p.length === 1) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], s.w / 2, 0, 7); ctx.fill(); ctx.globalAlpha = 1; return; }
        ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
        for (var i = 1; i < p.length - 1; i++) {
          ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
        }
        ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]); ctx.stroke(); ctx.globalAlpha = 1;
      }
      function render() {
        raf = 0;
        ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
        ctx.setTransform(dpr, 0, 0, dpr, -window.scrollX * dpr, -window.scrollY * dpr);
        strokes.forEach(line);
      }
      function later() { if (!raf) raf = requestAnimationFrame(render); }
      function pt(e) { return [e.clientX + window.scrollX, e.clientY + window.scrollY]; }
      function erase(q) {
        var n = strokes.length;
        strokes = strokes.filter(function (s) {
          var r = 12 + s.w / 2;
          return !s.p.some(function (a) { return Math.abs(a[0] - q[0]) < r && Math.abs(a[1] - q[1]) < r; });
        });
        if (strokes.length !== n) { data[key] = strokes; later(); }
      }
      cv.addEventListener("pointerdown", function (e) {
        if (!penOn) return;
        e.preventDefault(); cv.setPointerCapture(e.pointerId);
        var q = pt(e);
        if (tool.mode === "er") { drawing = { er: true }; erase(q); return; }
        var hl = tool.mode === "hl";
        drawing = { c: hl ? "#ffd43b" : tool.c, w: hl ? 22 : WIDTHS[tool.wi][0], a: hl ? 0.38 : 1, p: [q] };
        strokes.push(drawing); data[key] = strokes; later();
      });
      cv.addEventListener("pointermove", function (e) {
        if (!drawing) return;
        var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
        if (!evs.length) evs = [e];
        evs.forEach(function (ev) { var q = pt(ev); if (drawing.er) erase(q); else drawing.p.push(q); });
        later();
      });
      function end() { drawing = null; }
      cv.addEventListener("pointerup", end);
      cv.addEventListener("pointercancel", end);
      window.addEventListener("scroll", function () { if (on()) later(); }, { passive: true });
      document.addEventListener("keydown", function (e) {
        if (penOn && (e.ctrlKey || e.metaKey) && e.code === "KeyZ") { e.preventDefault(); strokes.pop(); later(); }
      });
      function setMode(m) {
        tool.mode = m;
        bar.querySelector('[data-t="hl"]').classList.toggle("on", m === "hl");
        bar.querySelector('[data-t="er"]').classList.toggle("on", m === "er");
        bar.querySelectorAll(".sw").forEach(function (b) { b.classList.toggle("on", m === "pen" && b.dataset.c === tool.c); });
        cv.classList.toggle("erasing", m === "er");
      }
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        if (b.dataset.c) { tool.c = b.dataset.c; setMode("pen"); return; }
        var t = b.dataset.t;
        if (t === "hl") setMode(tool.mode === "hl" ? "pen" : "hl");
        if (t === "er") setMode(tool.mode === "er" ? "pen" : "er");
        if (t === "w") { tool.wi = (tool.wi + 1) % WIDTHS.length; b.querySelector("b").textContent = WIDTHS[tool.wi][1]; if (tool.mode === "er") setMode("pen"); }
        if (t === "undo") { strokes.pop(); later(); }
        if (t === "clr") { strokes = data[key] = []; later(); }
        if (t === "done") pen(false);
      });
      return {
        size: size,
        load: function (k) { key = k; strokes = data[k] || (data[k] = []); size(); }
      };
    })();
    function pen(v) {
      penOn = v;
      body.classList.toggle("drawing", v);
      pager.querySelector('[data-a="pen"]').classList.toggle("on", v);
      if (v) ink.size();
    }

    var mh = location.hash.match(/^#slide-(\d+)$/);
    if (mh) { slideMode(true); show(parseInt(mh[1], 10) - 1); }
  }

  /* ---- 펼쳐 보기 ---- */
  document.querySelectorAll(".reveal > button").forEach(function (b) {
    b.addEventListener("click", function () { b.parentNode.classList.toggle("open"); });
  });

  /* ---- 형성 평가 ---- */
  var dataEl = document.getElementById("quiz-data");
  var quizBox = document.getElementById("quiz");
  if (dataEl && quizBox) {
    var items = JSON.parse(dataEl.textContent);
    var answered, right;
    var scoreEl = document.createElement("div");
    scoreEl.className = "score";
    var render = function () {
      quizBox.innerHTML = ""; answered = 0; right = 0;
      items.forEach(function (it, qi) {
        var wrap = document.createElement("div");
        wrap.className = "quiz-item";
        wrap.innerHTML = '<div class="q"><span class="no">' + (qi + 1) + "</span>" + it.q +
          (it.lv ? '<span class="lv">' + it.lv + "</span>" : "") + "</div>" +
          (it.box ? '<div class="qbox">' + it.box + "</div>" : "");
        var opts = document.createElement("div");
        var long = it.options.some(function (o) { return o.length > 16; });
        opts.className = "opts" + (long ? " long" : "");
        var fb = document.createElement("div");
        fb.className = "feedback";
        it.options.forEach(function (o, oi) {
          var b = document.createElement("button");
          b.className = "opt"; b.innerHTML = o;
          b.addEventListener("click", function () {
            var all = opts.querySelectorAll(".opt");
            all.forEach(function (x) { x.disabled = true; });
            all[it.answer].classList.add("correct");
            var ok = oi === it.answer;
            if (!ok) b.classList.add("wrong");
            fb.className = "feedback show " + (ok ? "ok" : "no");
            fb.innerHTML = "<b>" + (ok ? "정답" : "오답") + "</b>" + it.explain;
            answered++; if (ok) right++;
            update();
          });
          opts.appendChild(b);
        });
        wrap.appendChild(opts); wrap.appendChild(fb);
        quizBox.appendChild(wrap);
      });
      quizBox.appendChild(scoreEl);
      update();
    };
    var update = function () {
      scoreEl.innerHTML = (answered < items.length
        ? "<span>풀이 진행 " + answered + " / " + items.length + "</span>"
        : '<span>결과 <span class="val">' + right + " / " + items.length + "</span></span><span>" +
          (right === items.length ? "모두 맞혔습니다." : "틀린 문항의 해설을 다시 확인하세요.") + "</span>") +
        '<button class="tbtn" type="button">다시 풀기</button>';
      scoreEl.querySelector("button").addEventListener("click", render);
    };
    render();
  }
})();
