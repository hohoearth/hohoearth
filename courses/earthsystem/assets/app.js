/* 지구시스템과학 수업 자료 · 공통 스크립트
   각 차시 HTML은 <body data-lesson="1-1"> 과 <main> 만 가지고 있으면,
   상단 바·왼쪽 목차·차시 흐름·형성 평가를 이 파일이 만들어 준다. */
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

  /* ---- 상단 바 ---- */
  var top = document.createElement("header");
  top.className = "topbar";
  top.innerHTML =
    '<a class="back" href="../index.html">← 메인 아카이브</a>' +
    '<div class="crumb"><span class="idx">[' + pad(order) + "/" + pad(flat.length) + ']</span>' +
    '<span class="path">' + me.unit + '<span>›</span>' + code(id).slice(3) + ". " + me.t + "</span></div>" +
    '<div class="spacer"></div>' +
    '<button class="tbtn" id="btn-teacher" title="교사용 메모 보이기/숨기기">교사용 메모</button>' +
    '<button class="tbtn" id="btn-wide" title="목차를 숨기고 글자를 키웁니다">⤢ 넓은 화면 모드</button>' +
    '<button class="tbtn" id="btn-slide" title="카드를 한 장씩 PPT처럼 봅니다 (←/→, Esc)">▣ 슬라이드 모드</button>' +
    '<span class="pages">교재 p. ' + me.p + "</span>";
  body.insertBefore(top, body.firstChild);

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
    function set(on) { body.classList.toggle(cls, on); b.classList.toggle("on", on); store(key, on ? "1" : "0"); }
    b.addEventListener("click", function () { set(!body.classList.contains(cls)); window.dispatchEvent(new Event("resize")); });
    set(store(key) === "1");
  }
  toggle("teacher", "btn-teacher", "esc-teacher");
  toggle("wide", "btn-wide", "esc-wide");

  /* ---- 슬라이드(PPT) 모드 ----
     카드 한 장 = 슬라이드 한 장. 섹션 제목은 그 섹션의 슬라이드마다 함께 보인다.
     [HoHo earth 홈페이지 수정] 카드 안의 시뮬레이션(.sim)은 설명과 나눠 따로 한 장씩 보여 준다.
       설명 쪽 → 시뮬레이션 1 → 시뮬레이션 2 … 순서. 화면보다 조금 길면 그 쪽만 살짝 축소한다.
       (이 파일을 새 버전으로 바꾸면 이 부분도 다시 넣어야 합니다) */
  var cards = Array.prototype.slice.call(main.querySelectorAll(".sec > .card"));
  var cur = 0;
  var slides = [];          // { k: 카드 번호, sim: 시뮬레이션 요소 또는 null }
  cards.forEach(function (c, k) {
    var sims = Array.prototype.slice.call(c.querySelectorAll(".sim"));
    var hasText = Array.prototype.some.call(c.children, function (el) { return !el.classList.contains("sim") && el.tagName !== "H3" && !el.querySelector(".sim"); }) || !sims.length;
    if (hasText) slides.push({ k: k, sim: null });
    sims.forEach(function (s) { slides.push({ k: k, sim: s }); });
  });
  function clearCard(c) {
    c.querySelectorAll(".off").forEach(function (el) { el.classList.remove("off"); });
    c.style.transform = c.style.transformOrigin = c.style.marginBottom = "";
  }
  /* 설명 쪽: 시뮬레이션만 숨김 / 시뮬레이션 쪽: 카드 제목(h3)과 그 시뮬레이션만 남김 */
  function applySlide(s) {
    var c = cards[s.k];
    clearCard(c);
    if (!s.sim) { c.querySelectorAll(".sim").forEach(function (el) { el.classList.add("off"); }); return; }
    var x = s.sim;
    while (x && x !== c) {
      var p = x.parentElement;
      Array.prototype.forEach.call(p.children, function (k) { if (k !== x && !(p === c && k.tagName === "H3")) k.classList.add("off"); });
      x = p;
    }
  }
  function fitSlide(c) {
    var pagerH = (document.querySelector(".slide-pager") || {}).offsetHeight || 0;
    var dock = document.querySelector(".cp-dock");
    var lim = window.innerHeight - pagerH - (dock ? dock.offsetHeight + 10 : 0) - 10;
    var r = c.getBoundingClientRect();
    if (r.bottom <= lim) return;
    var z = Math.max(0.75, (lim - r.top) / r.height);   // 너무 작아지면 축소 대신 스크롤
    c.style.transformOrigin = "top center";
    c.style.transform = "scale(" + z.toFixed(4) + ")";
    c.style.marginBottom = (-r.height * (1 - z)).toFixed(1) + "px";
  }
  var pager = document.createElement("div");
  pager.className = "slide-pager";
  pager.innerHTML = '<button class="tbtn" data-a="prev">◀ 이전</button>' +
    '<span class="sp-title"></span><div class="sp-bar"><i></i></div><span class="sp-count"></span>' +
    '<button class="tbtn on" data-a="next">다음 ▶</button>' +
    '<button class="tbtn" data-a="full" title="전체 화면">⛶</button>' +
    '<button class="tbtn" data-a="exit">✕ 종료</button>';
  body.appendChild(pager);
  // 교사용 카드는 교사용 메모를 켰을 때만 슬라이드에 넣는다
  function usable(i) {
    return !(cards[slides[i].k].classList.contains("teacher-only") && !body.classList.contains("teacher"));
  }
  function show(i) {
    var dir = i < cur ? -1 : 1;
    i = Math.max(0, Math.min(slides.length - 1, i));
    var j = i;
    while (j >= 0 && j < slides.length && !usable(j)) j += dir;
    if (j < 0 || j >= slides.length) { j = i; while (j >= 0 && j < slides.length && !usable(j)) j -= dir; }
    cur = (j >= 0 && j < slides.length) ? j : 0;
    var s = slides[cur], card = cards[s.k];
    var sec = card.closest(".sec");
    main.querySelectorAll(".sec").forEach(function (x) { x.classList.toggle("off", x !== sec); });
    cards.forEach(function (c, k) { c.classList.toggle("off", k !== s.k); if (k !== s.k) clearCard(c); });
    applySlide(s);
    var vis = slides.filter(function (x, k) { return usable(k); });
    var pos = vis.indexOf(s) + 1;
    pager.querySelector(".sp-count").textContent = pos + " / " + vis.length;
    pager.querySelector(".sp-bar i").style.width = (pos / vis.length * 100) + "%";
    var simName = s.sim && s.sim.querySelector(".sim-head b");
    pager.querySelector(".sp-title").textContent = (sec.dataset.nav || "") + (s.sim ? " · " + (simName ? simName.textContent : "시뮬레이션") : "");
    window.scrollTo(0, 0);
    try { history.replaceState(null, "", "#slide-" + (cur + 1)); } catch (e) {}
    window.dispatchEvent(new Event("resize"));     // 시뮬레이션 캔버스 크기 다시 맞추기
    requestAnimationFrame(function () { fitSlide(card); window.dispatchEvent(new Event("resize")); });
  }
  function slideMode(on, start) {
    body.classList.toggle("slides", on);
    document.getElementById("btn-slide").classList.toggle("on", on);
    if (on) show(start === undefined ? cur : start);
    else {
      cards.forEach(clearCard);
      main.querySelectorAll(".off").forEach(function (el) { el.classList.remove("off"); });
      try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
      var c = slides[cur] && cards[slides[cur].k];
      if (c) c.scrollIntoView({ block: "start" });
      window.dispatchEvent(new Event("resize"));
    }
  }
  // 정답 펼치기 등으로 내용 높이가 바뀌면 그 쪽만 다시 맞춤
  main.addEventListener("click", function () {
    if (!body.classList.contains("slides")) return;
    requestAnimationFrame(function () { var c = cards[slides[cur].k]; c.style.transform = c.style.marginBottom = ""; fitSlide(c); });
  });
  document.getElementById("btn-slide").addEventListener("click", function () {
    if (body.classList.contains("slides")) { slideMode(false); return; }
    // 지금 보고 있는 카드부터 시작
    var start = 0;
    cards.forEach(function (c, k) {
      if (c.getBoundingClientRect().top < window.innerHeight * 0.4) {
        var i = slides.findIndex(function (s) { return s.k === k; });
        if (i >= 0) start = i;
      }
    });
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
  // 흐름 목차를 누르면 해당 섹션 첫 슬라이드로
  side.querySelectorAll(".flow-nav a").forEach(function (a) {
    a.addEventListener("click", function (e) {
      if (!body.classList.contains("slides")) return;
      e.preventDefault();
      var sec = document.querySelector(a.getAttribute("href"));
      var k = slides.findIndex(function (s) { return sec.contains(cards[s.k]); });
      if (k >= 0) show(k);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (!body.classList.contains("slides")) return;
    var t = e.target.tagName;
    if (t === "TEXTAREA" || t === "INPUT" || t === "SELECT") return;
    if (document.querySelector(".cp-ink.on")) return;   // 판서 중에는 넘김 키 막기 (홈페이지 판서 기능)
    if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { e.preventDefault(); show(cur + 1); }
    else if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); show(cur - 1); }
    else if (e.key === "Home") show(0);
    else if (e.key === "End") show(slides.length - 1);
    else if (e.key === "Escape" && !document.fullscreenElement) slideMode(false);
  });
  var mh = location.hash.match(/^#slide-(\d+)$/);
  if (mh) slideMode(true, parseInt(mh[1], 10) - 1);

  /* ---- O/X 개념 확인 ---- */
  document.querySelectorAll(".ox-list").forEach(function (list) {
    var items = list.querySelectorAll(".ox"), done = 0, ok = 0;
    var sc = document.createElement("div"); sc.className = "ox-score"; list.appendChild(sc);
    function upd() { sc.textContent = done < items.length ? "확인 " + done + " / " + items.length : "결과 " + ok + " / " + items.length + (ok === items.length ? " · 모두 맞았어요!" : " · 틀린 문장의 설명을 확인하세요"); }
    items.forEach(function (it) {
      var st = it.innerHTML, why = it.dataset.why || "";
      it.innerHTML = '<div class="st">' + st + '</div><div class="bt"><button type="button">O</button><button type="button">X</button></div>' + (why ? '<div class="why">' + why + "</div>" : "");
      it.querySelectorAll(".bt button").forEach(function (b, k) {
        b.addEventListener("click", function () {
          var ans = it.dataset.a === "o" ? 0 : 1, right = k === ans;
          it.classList.add(right ? "right" : "wrong");
          it.querySelectorAll(".bt button").forEach(function (x) { x.disabled = true; });
          it.querySelectorAll(".bt button")[ans].style.background = "var(--ok)"; it.querySelectorAll(".bt button")[ans].style.color = "#fff";
          done++; if (right) ok++; upd();
        });
      });
    });
    upd();
  });

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
