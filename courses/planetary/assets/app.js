/* 행성우주과학 수업 자료 · 공통 스크립트
   각 차시 HTML은 <body data-lesson="1-1"> 과 <main> 만 가지고 있으면,
   상단 바·왼쪽 목차·차시 흐름·형성 평가를 이 파일이 만들어 준다.
   교재 쪽수는 미래엔 『행성우주과학』 기준. */
(function () {
  var UNITS = [
    { name: "I. 우주 탐사와 행성계", lessons: [
      { id: "1-1", t: "우주 탐사의 성과", p: "10 ~ 15", ready: true },
      { id: "1-2", t: "우주 위험 감시", p: "16 ~ 21", ready: true },
      { id: "1-3", t: "케플러 법칙", p: "22 ~ 27", ready: true },
      { id: "1-4", t: "태양계 행성과 소천체", p: "28 ~ 33", ready: true },
      { id: "1-5", t: "외계 행성계 탐사", p: "34 ~ 38", ready: true } ] },
    { name: "II. 태양과 별의 관측", lessons: [
      { id: "2-1", t: "태양 관측", p: "48 ~ 53", ready: true },
      { id: "2-2", t: "별의 거리 측정", p: "54 ~ 57", ready: true },
      { id: "2-3", t: "별의 운동", p: "58 ~ 61", ready: true },
      { id: "2-4", t: "쌍성과 별의 질량", p: "62 ~ 66", ready: true },
      { id: "2-5", t: "변광성", p: "67 ~ 70", ready: true } ] },
    { name: "III. 은하와 우주", lessons: [
      { id: "3-1", t: "천체의 거리와 우리은하의 구조", p: "80 ~ 89", ready: true },
      { id: "3-2", t: "성간 물질", p: "90 ~ 93", ready: true },
      { id: "3-3", t: "우리은하의 회전과 질량 분포", p: "94 ~ 97", ready: true },
      { id: "3-4", t: "전천 탐사와 은하의 공간 분포", p: "98 ~ 100", ready: true },
      { id: "3-5", t: "은하의 집단과 우주거대구조", p: "101 ~ 104", ready: true } ] }
  ];
  window.ESC_UNITS = UNITS;
  if (!document.querySelector("link[rel=icon]")) {
    var ic = document.createElement("link"); ic.rel = "icon";
    ic.href = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='9' fill='%23f59e0b'/%3E%3Cellipse cx='16' cy='16' rx='15' ry='5' fill='none' stroke='%234f46e5' stroke-width='2.5' transform='rotate(-20 16 16)'/%3E%3C/svg%3E";
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
     카드 한 장 = 슬라이드 한 장. 섹션 제목은 그 섹션의 슬라이드마다 함께 보인다. */
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
    // 지금 보고 있는 카드부터 시작
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
  // 흐름 목차를 누르면 해당 섹션 첫 슬라이드로
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

  /* ---- 펼쳐 보기 ---- */
  document.querySelectorAll(".reveal > button").forEach(function (b) {
    b.addEventListener("click", function () { b.parentNode.classList.toggle("open"); });
  });

  /* ---- 두 영상 비교 슬라이더 ---- */
  document.querySelectorAll(".compare").forEach(function (box) {
    var top = box.querySelector(".top"), bar = box.querySelector(".bar"), drag = false;
    function set(x) {
      var r = box.getBoundingClientRect(), k = Math.max(0, Math.min(1, (x - r.left) / r.width));
      top.style.clipPath = "inset(0 " + ((1 - k) * 100) + "% 0 0)"; bar.style.left = (k * 100) + "%";
    }
    box.addEventListener("pointerdown", function (e) { drag = true; box.setPointerCapture(e.pointerId); set(e.clientX); });
    box.addEventListener("pointermove", function (e) { if (drag) set(e.clientX); });
    box.addEventListener("pointerup", function () { drag = false; });
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
        var long = it.options.some(function (o) { return o.replace(/<[^>]*>/g, "").length > 16; });
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
