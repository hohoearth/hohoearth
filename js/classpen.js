/* =====================================================================
   수업 판서 · 학급별 저장 · 진도 체크 (모든 수업자료 공통)
   사용법: 수업 페이지 </body> 바로 앞에 한 줄만 넣으면 됩니다.
     <script src="(홈페이지 맨 위 폴더까지 경로)/js/classpen.js" data-course="earth"></script>
     data-course : earth(지구과학) · earthsystem(지구시스템과학) · planetary(행성우주과학)
     data-lesson : 생략하면 파일 이름(예: unit-01-01, 1-1)을 차시 번호로 씁니다.
   저장 위치: 이 컴퓨터의 브라우저(localStorage). [학급 · 백업]에서 파일로 옮길 수 있습니다.
   ===================================================================== */
(function () {
  if (window.__classpen) return; window.__classpen = true;
  var me = document.currentScript;
  var ROOT = me.src.replace(/js\/classpen\.js(\?.*)?$/, "");
  var COURSE = me.getAttribute("data-course") || "earth";
  var LESSON = me.getAttribute("data-lesson") || document.body.getAttribute("data-lesson") ||
    decodeURIComponent(location.pathname.split("/").pop().replace(/\.html?$/, "")) || "index";
  var P = "cp.";                                   // 저장 키 앞머리
  function K() { return P + Array.prototype.join.call(arguments, "."); }
  function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function put(k, v) {
    try { if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch (e) { toast("브라우저 저장 공간이 부족합니다. [학급 · 백업]에서 백업 후 오래된 판서를 지워 주세요."); return false; }
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function today() { var d = new Date(); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function md(s) { var a = String(s).split("-"); return +a[1] + "/" + +a[2]; }

  /* 과목·차시 목록 불러오기 (진도표용) */
  var courses = null;
  function loadCourses(cb) {
    if (window.CP_COURSES) { courses = window.CP_COURSES; cb(); return; }
    var s = document.createElement("script"); s.src = ROOT + "js/courses-data.js";
    s.onload = function () { courses = window.CP_COURSES || {}; cb(); };
    s.onerror = function () { courses = {}; cb(); };
    document.head.appendChild(s);
  }
  function courseInfo() { return (courses && courses[COURSE]) || { name: COURSE, lessons: [] }; }

  /* ---------------- 상태 ---------------- */
  var classes = get(K("classes", COURSE), []);
  var cls = get(K("cur", COURSE), "");
  if (cls && classes.indexOf(cls) < 0) cls = "";
  var penOn = false;

  /* ---------------- 스타일 ---------------- */
  var css = document.createElement("style");
  css.textContent = [
    ".cp-dock{position:fixed;right:14px;bottom:14px;z-index:2147483000;display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;font:600 13px/1.2 'Pretendard',system-ui,-apple-system,'Malgun Gothic',sans-serif;color:#0f172a;max-width:calc(100vw - 28px)}",
    ".cp-dock *{box-sizing:border-box}",
    ".cp-b{appearance:none;border:1px solid #cbd5e1;background:#fff;color:#0f172a;border-radius:999px;padding:8px 13px;font:inherit;cursor:pointer;box-shadow:0 4px 14px -6px rgba(15,23,42,.35);white-space:nowrap}",
    ".cp-b:hover{background:#f1f5f9}.cp-b.on{background:#0f172a;color:#fff;border-color:#0f172a}",
    ".cp-b.done{background:#16a34a;color:#fff;border-color:#16a34a}",
    ".cp-sel{appearance:none;border:1px solid #6366f1;background:#eef2ff;color:#3730a3;border-radius:999px;padding:8px 28px 8px 13px;font:inherit;cursor:pointer;box-shadow:0 4px 14px -6px rgba(15,23,42,.35);background-image:linear-gradient(45deg,transparent 50%,#3730a3 50%),linear-gradient(135deg,#3730a3 50%,transparent 50%);background-position:calc(100% - 15px) 52%,calc(100% - 10px) 52%;background-size:5px 5px;background-repeat:no-repeat}",
    ".cp-min .cp-hide{display:none}",
    ".cp-ink{position:fixed;left:0;top:0;z-index:2147482990;pointer-events:none;touch-action:none}",
    ".cp-ink.on{pointer-events:auto;cursor:crosshair}",
    ".cp-tools{position:fixed;left:50%;transform:translateX(-50%);bottom:64px;z-index:2147483001;display:none;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center;padding:8px 10px;border-radius:16px;background:rgba(255,255,255,.97);border:1px solid #cbd5e1;box-shadow:0 10px 30px -10px rgba(15,23,42,.45);font:600 13px/1.2 'Pretendard',system-ui,'Malgun Gothic',sans-serif;max-width:calc(100vw - 20px)}",
    ".cp-tools.show{display:flex}",
    ".cp-sw{width:28px;height:28px;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 1px #cbd5e1;cursor:pointer;padding:0}",
    ".cp-sw.on{box-shadow:0 0 0 3px #0f172a}",
    ".cp-tools .cp-b{box-shadow:none;padding:7px 11px}",
    ".cp-tag{font-size:11px;font-weight:800;color:#64748b;padding:0 4px}",
    ".cp-toast{position:fixed;left:50%;top:18px;transform:translateX(-50%);z-index:2147483003;background:#0f172a;color:#fff;padding:10px 16px;border-radius:12px;font:600 13px/1.4 'Pretendard',system-ui,'Malgun Gothic',sans-serif;box-shadow:0 10px 30px -10px rgba(0,0,0,.5);display:none;max-width:90vw;text-align:center}",
    ".cp-toast button{margin-left:10px;background:#6366f1;color:#fff;border:0;border-radius:8px;padding:5px 10px;font:inherit;cursor:pointer}",
    ".cp-modal{position:fixed;inset:0;z-index:2147483002;background:rgba(15,23,42,.55);display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:40px 14px;font:14px/1.5 'Pretendard',system-ui,'Malgun Gothic',sans-serif;color:#0f172a}",
    ".cp-box{background:#fff;border-radius:20px;max-width:980px;width:100%;padding:22px 22px 18px;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}",
    ".cp-box h3{margin:0 0 4px;font-size:19px;font-weight:900}.cp-box .cp-sub{color:#64748b;font-size:12.5px;margin:0 0 14px}",
    ".cp-box h4{margin:16px 0 8px;font-size:14px;font-weight:800}",
    ".cp-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center}",
    ".cp-chip{display:inline-flex;align-items:center;gap:6px;border:1px solid #c7d2fe;background:#eef2ff;color:#3730a3;border-radius:999px;padding:5px 6px 5px 12px;font-weight:700}",
    ".cp-chip button{border:0;background:#fff;border-radius:999px;width:22px;height:22px;cursor:pointer;color:#e11d48;font-weight:900}",
    ".cp-in{border:1px solid #cbd5e1;border-radius:10px;padding:7px 10px;font:inherit;min-width:0}",
    ".cp-x{float:right;border:0;background:#f1f5f9;border-radius:10px;width:34px;height:34px;font-size:18px;cursor:pointer}",
    ".cp-tbl{width:100%;border-collapse:collapse;font-size:12.5px}",
    ".cp-wrap{overflow:auto;border:1px solid #e2e8f0;border-radius:12px;max-height:62vh}",
    ".cp-tbl th,.cp-tbl td{border-bottom:1px solid #eef2f7;padding:6px 8px;text-align:center;white-space:nowrap}",
    ".cp-tbl th{position:sticky;top:0;background:#f8fafc;z-index:1;font-weight:800}",
    ".cp-tbl td.l{text-align:left;max-width:260px;overflow:hidden;text-overflow:ellipsis}",
    ".cp-tbl td.l a{color:#0f172a;text-decoration:none}.cp-tbl td.l a:hover{text-decoration:underline}",
    ".cp-tbl tr.me td{background:#fffbeb}",
    ".cp-tbl tr.unit td{background:#f1f5f9;font-weight:800;text-align:left;color:#475569}",
    ".cp-ok{display:inline-block;min-width:44px;padding:2px 6px;border-radius:8px;background:#dcfce7;color:#166534;font-weight:800}",
    ".cp-no{color:#cbd5e1}.cp-ink-dot{color:#6366f1;font-size:10px;margin-left:2px}",
    ".cp-sum td{font-weight:800;background:#f8fafc}",
    ".cp-note{font-size:12px;color:#64748b;margin-top:10px}",
    "@media print{.cp-dock,.cp-tools,.cp-ink,.cp-toast{display:none!important}}",
    "body.slides .slide-pager [data-a=pen]{display:none!important}"
  ].join("");
  document.head.appendChild(css);

  /* ---------------- 알림 ---------------- */
  var tEl = document.createElement("div"); tEl.className = "cp-toast"; document.body.appendChild(tEl);
  var tTimer = 0;
  function toast(msg, btn, fn, ms) {
    tEl.innerHTML = esc(msg) + (btn ? '<button type="button">' + esc(btn) + "</button>" : "");
    tEl.style.display = "block";
    if (btn) tEl.querySelector("button").onclick = function () { tEl.style.display = "none"; fn(); };
    clearTimeout(tTimer); tTimer = setTimeout(function () { tEl.style.display = "none"; }, ms || (btn ? 7000 : 2600));
  }

  /* ---------------- 아래쪽 도구 모음 ---------------- */
  var dock = document.createElement("div");
  dock.className = "cp-dock";
  document.body.appendChild(dock);
  function renderDock() {
    var done = cls ? get(K("done", COURSE, cls), {})[LESSON] : null;
    dock.innerHTML =
      '<select class="cp-sel" title="수업하는 학급 (판서·진도가 학급별로 저장됩니다)">' +
        '<option value="">학급 선택</option>' + classes.map(function (c) { return '<option' + (c === cls ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("") +
        '<option value="__manage">＋ 학급 · 백업 관리</option></select>' +
      '<button class="cp-b' + (penOn ? " on" : "") + '" data-a="pen" title="화면에 판서하기">✎ 판서</button>' +
      '<button class="cp-b cp-hide' + (done ? " done" : "") + '" data-a="done" title="이 학급에서 이 차시 수업을 마쳤으면 누르세요">' + (done ? "✓ 완료 " + md(done) : "☐ 수업 완료") + "</button>" +
      '<button class="cp-b cp-hide" data-a="table" title="학급별 진도표">진도표</button>' +
      '<button class="cp-b" data-a="min" title="도구 접기/펴기">' + (dock.classList.contains("cp-min") ? "◂" : "▸") + "</button>";
    positionBars();
  }
  dock.addEventListener("change", function (e) {
    if (!e.target.classList.contains("cp-sel")) return;
    var v = e.target.value;
    if (v === "__manage") { e.target.value = cls; openManager(); return; }
    setClass(v, true);
  });
  dock.addEventListener("click", function (e) {
    var b = e.target.closest("button[data-a]"); if (!b) return;
    var a = b.dataset.a;
    if (a === "pen") pen(!penOn);
    if (a === "done") toggleDone();
    if (a === "table") openTable();
    if (a === "min") { dock.classList.toggle("cp-min"); renderDock(); }
  });

  function needClass(then) {
    if (cls) return true;
    if (!classes.length) { toast("먼저 수업하는 학급을 등록해 주세요.", "학급 등록", openManager); return false; }
    toast("왼쪽 [학급 선택]에서 학급을 먼저 골라 주세요.");
    var s = dock.querySelector(".cp-sel"); if (s) s.focus();
    return false;
  }

  function setClass(c, ask) {
    savePos();
    cls = c; put(K("cur", COURSE), c || null);
    ink.load();
    renderDock();
    if (!c) return;
    var pos = get(K("pos", COURSE, LESSON, c), null);
    var done = get(K("done", COURSE, c), {})[LESSON];
    if (ask && pos && (pos.y > 200 || pos.slide)) {
      toast(c + " · 지난 시간에 멈춘 곳" + (pos.d ? "(" + md(pos.d) + ")" : "") + "으로 갈까요?", "이동", function () { goPos(pos); });
    } else if (ask) {
      toast(c + " 학급으로 바꿨어요." + (done ? " 이 차시는 " + md(done) + "에 완료했어요." : ""));
    }
  }

  /* ---------------- 위치 기억 ---------------- */
  function slideNo() { var m = location.hash.match(/^#slide-(\d+)$/); return document.body.classList.contains("slides") && m ? +m[1] : 0; }
  function savePos() {
    if (!cls) return;
    var y = window.scrollY, s = slideNo();
    if (y < 50 && !s) return;
    put(K("pos", COURSE, LESSON, cls), { y: Math.round(y), h: document.documentElement.scrollHeight, slide: s, d: today() });
  }
  function goPos(p) {
    if (p.slide && document.getElementById("btn-slide")) {
      location.hash = "#slide-" + p.slide;
      if (!document.body.classList.contains("slides")) location.reload();
      return;
    }
    var h = document.documentElement.scrollHeight, y = p.h && Math.abs(h - p.h) > 200 ? p.y * h / p.h : p.y;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
  var posT = 0;
  window.addEventListener("scroll", function () { clearTimeout(posT); posT = setTimeout(savePos, 800); }, { passive: true });
  window.addEventListener("hashchange", function () { savePos(); ink.load(); });
  window.addEventListener("pagehide", savePos);

  /* ---------------- 수업 완료 ---------------- */
  function toggleDone() {
    if (!needClass()) return;
    var all = get(K("done", COURSE, cls), {});
    if (all[LESSON]) {
      if (!confirm(cls + " 학급의 이 차시 '수업 완료' 표시를 지울까요?")) return;
      delete all[LESSON];
    } else all[LESSON] = today();
    put(K("done", COURSE, cls), all);
    renderDock();
    if (all[LESSON]) toast(cls + " · 이 차시 수업 완료로 기록했어요 (" + md(all[LESSON]) + ")");
  }

  /* ---------------- 판서 ---------------- */
  var ink = (function () {
    var cv = document.createElement("canvas"); cv.className = "cp-ink"; document.body.appendChild(cv);
    var ctx = cv.getContext("2d"), dpr = 1, raf = 0, drawing = null;
    var doc = { w: 0, pages: {} }, strokes = [];
    var tool = { c: "#e03131", mode: "pen", wi: 1 };
    var WID = [[2.5, "가늘게"], [4.5, "보통"], [8, "굵게"]];
    var PENS = [["#e03131", "빨강"], ["#1c7ed6", "파랑"], ["#2f9e44", "초록"], ["#111827", "검정"], ["#ffffff", "흰색"]];
    var bar = document.createElement("div"); bar.className = "cp-tools";
    function drawBar() {
      bar.innerHTML = '<span class="cp-tag">' + esc(cls || "학급 없음") + "</span>" +
        PENS.map(function (p) { return '<button type="button" class="cp-sw' + (tool.mode === "pen" && tool.c === p[0] ? " on" : "") + '" data-c="' + p[0] + '" title="' + p[1] + ' 펜" style="background:' + p[0] + '"></button>'; }).join("") +
        '<button type="button" class="cp-b' + (tool.mode === "hl" ? " on" : "") + '" data-t="hl">형광펜</button>' +
        '<button type="button" class="cp-b" data-t="w">굵기 ' + WID[tool.wi][1] + "</button>" +
        '<button type="button" class="cp-b' + (tool.mode === "er" ? " on" : "") + '" data-t="er">지우개</button>' +
        '<button type="button" class="cp-b" data-t="undo" title="되돌리기 (Ctrl+Z)">↶</button>' +
        '<button type="button" class="cp-b" data-t="clr" title="이 화면(쪽)의 판서 모두 지우기">모두 지우기</button>' +
        '<button type="button" class="cp-b on" data-t="done" title="판서 끝내기 (Esc)">완료</button>';
    }
    document.body.appendChild(bar);
    bar.addEventListener("click", function (e) {
      var b = e.target.closest("button"); if (!b) return;
      if (b.dataset.c) { tool.c = b.dataset.c; tool.mode = "pen"; }
      var t = b.dataset.t;
      if (t === "hl") tool.mode = tool.mode === "hl" ? "pen" : "hl";
      if (t === "er") tool.mode = tool.mode === "er" ? "pen" : "er";
      if (t === "w") tool.wi = (tool.wi + 1) % WID.length;
      if (t === "undo") { strokes.pop(); commit(); }
      if (t === "clr" && strokes.length && confirm("이 화면의 판서를 모두 지울까요?")) { strokes.length = 0; commit(); }
      if (t === "done") { pen(false); return; }
      drawBar();
    });
    function pageKey() { var s = slideNo(); return s ? "s" + s : "doc"; }
    function storeKey() { return K("ink", COURSE, LESSON, cls || "_"); }
    var curPage = null;
    /* 슬라이드를 넘기면(주소의 #slide-N이 바뀌면) 그 쪽의 판서로 바꿔 끼움 */
    function syncPage() {
      var k = pageKey();
      if (k === curPage) return;
      curPage = k;
      strokes = doc.pages[k] = doc.pages[k] || [];
    }
    function load() {
      doc = get(storeKey(), null) || { w: window.innerWidth, pages: {} };
      curPage = null; syncPage();
      drawBar(); later();
      var n = Object.keys(doc.pages).reduce(function (a, k) { return a + doc.pages[k].length; }, 0);
      if (n && doc.w && Math.abs(doc.w - window.innerWidth) > window.innerWidth * 0.15 && !load.warned) {
        load.warned = true;
        toast("다른 크기의 화면에서 쓴 판서라 위치가 조금 어긋날 수 있어요.");
      }
    }
    function commit() {
      doc.pages[curPage] = strokes;
      Object.keys(doc.pages).forEach(function (k) { if (!doc.pages[k].length) delete doc.pages[k]; });
      var empty = !Object.keys(doc.pages).some(function (k) { return doc.pages[k].length; });
      if (!empty) doc.w = doc.w || window.innerWidth;
      put(storeKey(), empty ? null : doc);
      later();
    }
    function size() {
      dpr = window.devicePixelRatio || 1;
      var w = window.innerWidth, h = window.innerHeight;
      cv.style.width = w + "px"; cv.style.height = h + "px";
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      render();
    }
    function line(s) {
      var p = s.p; if (!p.length) return;
      ctx.globalAlpha = s.a || 1; ctx.strokeStyle = ctx.fillStyle = s.c; ctx.lineWidth = s.w;
      ctx.lineCap = "round"; ctx.lineJoin = "round";
      if (p.length < 2) { ctx.beginPath(); ctx.arc(p[0][0], p[0][1], s.w / 2, 0, 7); ctx.fill(); ctx.globalAlpha = 1; return; }
      ctx.beginPath(); ctx.moveTo(p[0][0], p[0][1]);
      for (var i = 1; i < p.length - 1; i++) ctx.quadraticCurveTo(p[i][0], p[i][1], (p[i][0] + p[i + 1][0]) / 2, (p[i][1] + p[i + 1][1]) / 2);
      ctx.lineTo(p[p.length - 1][0], p[p.length - 1][1]); ctx.stroke(); ctx.globalAlpha = 1;
    }
    function render() {
      raf = 0;
      if (!drawing) syncPage();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      /* 슬라이드 쪽이 길어 스크롤해도 글씨가 내용과 함께 움직이도록 항상 문서 좌표로 그림 */
      ctx.setTransform(dpr, 0, 0, dpr, -window.scrollX * dpr, -window.scrollY * dpr);
      strokes.forEach(line);
    }
    function later() { if (!raf) raf = requestAnimationFrame(render); }
    function pt(e) { return [Math.round(e.clientX + window.scrollX), Math.round(e.clientY + window.scrollY)]; }
    function erase(q) {
      var n = strokes.length;
      for (var i = strokes.length - 1; i >= 0; i--) {
        var s = strokes[i], r = 12 + s.w / 2;
        if (s.p.some(function (a) { return Math.abs(a[0] - q[0]) < r && Math.abs(a[1] - q[1]) < r; })) strokes.splice(i, 1);
      }
      if (strokes.length !== n) later();
    }
    cv.addEventListener("pointerdown", function (e) {
      if (!penOn) return;
      e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {}
      syncPage();
      var q = pt(e);
      if (tool.mode === "er") { drawing = { er: true }; erase(q); return; }
      var hl = tool.mode === "hl";
      drawing = { c: hl ? "#ffd43b" : tool.c, w: hl ? 22 : WID[tool.wi][0], a: hl ? 0.38 : 1, p: [q] };
      strokes.push(drawing); later();
    });
    cv.addEventListener("pointermove", function (e) {
      if (!drawing) return;
      var evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e]; if (!evs.length) evs = [e];
      evs.forEach(function (ev) { var q = pt(ev); if (drawing.er) erase(q); else drawing.p.push(q); });
      later();
    });
    function end() { if (drawing) { drawing = null; commit(); } }
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);
    window.addEventListener("scroll", later, { passive: true });
    window.addEventListener("resize", size);
    /* 슬라이드 모드 전환(지구시스템과학 1-1 등) 감지 */
    if ("MutationObserver" in window) new MutationObserver(function () { load(); positionBars(); }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    document.addEventListener("keydown", function (e) {
      if (!penOn) return;
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") { e.preventDefault(); e.stopPropagation(); strokes.pop(); commit(); }
      if (e.key === "Escape") { e.stopPropagation(); pen(false); }
    }, true);
    size();
    return { load: load, size: size, cv: cv, bar: bar, drawBar: drawBar };
  })();

  function pen(on) {
    if (on && !cls && classes.length) { needClass(); }
    penOn = on;
    ink.cv.classList.toggle("on", on);
    ink.bar.classList.toggle("show", on);
    ink.drawBar();
    renderDock();
    if (on && !cls) toast(classes.length ? "학급을 고르지 않아 '학급 없음'으로 저장돼요." : "학급을 등록하면 판서가 학급별로 저장돼요.", classes.length ? null : "학급 등록", openManager);
  }

  /* 슬라이드 아래쪽 막대와 겹치지 않게 */
  function positionBars() {
    var sp = document.querySelector(".slide-pager");
    var off = sp && getComputedStyle(sp).display !== "none" && document.body.classList.contains("slides") ? sp.offsetHeight + 10 : 0;
    dock.style.bottom = (14 + off) + "px";
    ink.bar.style.bottom = (64 + off) + "px";
  }

  /* ---------------- 진도표 ---------------- */
  function modal(html) {
    var m = document.createElement("div"); m.className = "cp-modal";
    m.innerHTML = '<div class="cp-box"><button class="cp-x" type="button" title="닫기">✕</button>' + html + "</div>";
    m.addEventListener("click", function (e) { if (e.target === m || e.target.classList.contains("cp-x")) m.remove(); });
    document.body.appendChild(m);
    return m;
  }
  function openTable() {
    loadCourses(function () {
      var c = courseInfo();
      if (!classes.length) { toast("먼저 학급을 등록해 주세요.", "학급 등록", openManager); return; }
      var dones = {}, inks = {};
      classes.forEach(function (k) { dones[k] = get(K("done", COURSE, k), {}); });
      var head = '<tr><th style="text-align:left">차시</th>' + classes.map(function (k) { return "<th>" + esc(k) + "</th>"; }).join("") + "</tr>";
      var rows = "", lastU = null;
      c.lessons.forEach(function (l, i) {
        if (l.u !== lastU) { lastU = l.u; rows += '<tr class="unit"><td colspan="' + (classes.length + 1) + '">' + esc(l.u) + "</td></tr>"; }
        rows += '<tr class="' + (l.id === LESSON ? "me" : "") + '"><td class="l"><a href="' + ROOT + l.url + '">' + (i + 1) + ". " + esc(l.t) + "</a></td>" +
          classes.map(function (k) {
            var d = dones[k][l.id], hasInk = !!localStorage.getItem(K("ink", COURSE, l.id, k));
            return "<td>" + (d ? '<span class="cp-ok">✓ ' + md(d) + "</span>" : '<span class="cp-no">·</span>') + (hasInk ? '<span class="cp-ink-dot" title="판서 있음">✎</span>' : "") + "</td>";
          }).join("") + "</tr>";
      });
      var ids = c.lessons.map(function (l) { return l.id; });
      var sum = '<tr class="cp-sum"><td class="l">완료 차시 / 마지막 완료</td>' + classes.map(function (k) {
        var done = ids.filter(function (id) { return dones[k][id]; });
        var last = done.length ? done[done.length - 1] : null, li = last ? ids.indexOf(last) + 1 : 0;
        return "<td>" + done.length + "/" + ids.length + (li ? "<br><small>" + li + "차시까지</small>" : "") + "</td>";
      }).join("") + "</tr>";
      modal("<h3>" + esc(c.name) + " 학급별 진도표</h3>" +
        '<p class="cp-sub">각 칸의 날짜는 [수업 완료]를 누른 날입니다. ✎ 표시는 그 학급의 판서가 저장된 차시예요. 노란 줄이 지금 보고 있는 차시입니다.</p>' +
        '<div class="cp-wrap"><table class="cp-tbl"><thead>' + head + "</thead><tbody>" + rows + sum + "</tbody></table></div>" +
        '<p class="cp-note">진도와 판서는 이 컴퓨터의 브라우저에 저장됩니다. 다른 컴퓨터로 옮길 때는 [학급 · 백업 관리]에서 백업 파일을 쓰세요.</p>');
    });
  }

  /* ---------------- 학급 · 백업 관리 ---------------- */
  function openManager() {
    loadCourses(function () {
      var c = courseInfo();
      var m = modal("<h3>" + esc(c.name) + " · 학급 관리</h3>" +
        '<p class="cp-sub">이 과목을 수업하는 학급을 등록하세요. 판서·수업 완료·멈춘 위치가 학급마다 따로 저장됩니다.</p>' +
        '<div class="cp-row" id="cpChips"></div>' +
        '<div class="cp-row" style="margin-top:10px"><input class="cp-in" id="cpNew" placeholder="예: 2-1, 3학년 3반" style="flex:1"><button class="cp-b on" type="button" id="cpAdd">추가</button></div>' +
        "<h4>백업 · 다른 컴퓨터로 옮기기</h4>" +
        '<p class="cp-sub" style="margin:0 0 8px">교실 컴퓨터에서도 이어서 쓰려면: 지금 컴퓨터에서 <b>백업 파일 저장</b> → USB·메일·드라이브로 옮겨 → 교실 컴퓨터에서 <b>백업 불러오기</b>. 수업 후 반대로 옮겨 오면 됩니다. (세 과목 모두 한 파일에 담깁니다)</p>' +
        '<div class="cp-row"><button class="cp-b" type="button" id="cpExp">💾 백업 파일 저장</button>' +
        '<label class="cp-b" style="display:inline-block">📂 백업 불러오기<input type="file" id="cpImp" accept=".json,application/json" hidden></label>' +
        '<button class="cp-b" type="button" id="cpClrInk" style="color:#e11d48">이 차시 판서 모두 지우기</button></div>' +
        '<p class="cp-note" id="cpUse"></p>');
      function chips() {
        m.querySelector("#cpChips").innerHTML = classes.length ? classes.map(function (k, i) {
          return '<span class="cp-chip">' + esc(k) + ' <button type="button" data-i="' + i + '" title="삭제">×</button></span>';
        }).join("") : '<span class="cp-sub" style="margin:0">아직 등록된 학급이 없어요.</span>';
        var n = 0; for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (kk && kk.indexOf(P) === 0) n += (localStorage.getItem(kk) || "").length; }
        m.querySelector("#cpUse").textContent = "저장 공간 사용량: 약 " + Math.round(n * 2 / 1024) + "KB (브라우저 한도는 보통 5MB 안팎)";
      }
      chips();
      function add() {
        var inp = m.querySelector("#cpNew");
        inp.value.split(/[,\n]/).map(function (s) { return s.trim(); }).filter(Boolean).forEach(function (v) { if (classes.indexOf(v) < 0) classes.push(v); });
        inp.value = ""; put(K("classes", COURSE), classes); chips(); renderDock();
        if (!cls && classes.length === 1) setClass(classes[0], false);
      }
      m.querySelector("#cpAdd").onclick = add;
      m.querySelector("#cpNew").addEventListener("keydown", function (e) { if (e.key === "Enter") add(); });
      m.querySelector("#cpChips").addEventListener("click", function (e) {
        var b = e.target.closest("button[data-i]"); if (!b) return;
        var k = classes[+b.dataset.i];
        if (!confirm("'" + k + "' 학급을 목록에서 뺄까요?\n(이미 저장된 판서·진도는 지워지지 않고, 같은 이름으로 다시 추가하면 되살아납니다)")) return;
        classes.splice(+b.dataset.i, 1); put(K("classes", COURSE), classes);
        if (cls === k) setClass("", false);
        chips(); renderDock();
      });
      m.querySelector("#cpExp").onclick = function () {
        var out = {};
        for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (kk && kk.indexOf(P) === 0) out[kk] = localStorage.getItem(kk); }
        var blob = new Blob([JSON.stringify({ app: "hohoearth-classpen", v: 1, saved: new Date().toISOString(), data: out })], { type: "application/json" });
        var a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "수업판서_진도_백업_" + today() + ".json";
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 3000);
      };
      m.querySelector("#cpImp").onchange = function (e) {
        var f = e.target.files[0]; if (!f) return;
        var r = new FileReader();
        r.onload = function () {
          try {
            var j = JSON.parse(r.result);
            if (!j || j.app !== "hohoearth-classpen" || !j.data) throw 0;
            if (!confirm("백업 파일(" + (j.saved || "").slice(0, 10) + ")을 불러올까요?\n같은 학급·차시의 기록은 백업 파일 내용으로 바뀝니다.")) return;
            Object.keys(j.data).forEach(function (k) { if (k.indexOf(P) === 0) localStorage.setItem(k, j.data[k]); });
            classes = get(K("classes", COURSE), []); cls = get(K("cur", COURSE), "");
            ink.load(); renderDock(); chips(); toast("백업을 불러왔어요.");
          } catch (x) { alert("이 프로그램의 백업 파일이 아닙니다."); }
        };
        r.readAsText(f);
      };
      m.querySelector("#cpClrInk").onclick = function () {
        if (!confirm("이 차시의 판서를 모든 학급에서 지울까요? 되돌릴 수 없습니다.")) return;
        var del = [];
        for (var i = 0; i < localStorage.length; i++) { var kk = localStorage.key(i); if (kk && kk.indexOf(K("ink", COURSE, LESSON) + ".") === 0) del.push(kk); }
        del.forEach(function (k) { localStorage.removeItem(k); });
        ink.load(); chips(); toast("이 차시의 판서를 지웠어요.");
      };
    });
  }

  renderDock();
  ink.load();
  if (cls) setTimeout(function () { setClass(cls, true); }, 600);
})();
