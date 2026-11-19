/* 시뮬레이션 공통 도구 (모든 차시에서 사용) */
window.SIM = (function () {
  var FF = 'Pretendard, "Malgun Gothic", sans-serif';
  function $(id) { return document.getElementById(id); }
  function fit(cv, aspect) {
    var dpr = window.devicePixelRatio || 1;
    var w = cv.clientWidth || 600, h = Math.round(w * aspect);
    cv.style.height = h + "px";
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    var ctx = cv.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: w, h: h };
  }
  function font(px, bold) { return (bold ? "700 " : "") + px + "px " + FF; }
  function tag(ctx, text, x, y, opt) {
    opt = opt || {};
    var sz = opt.size || 13;
    ctx.font = font(sz, true);
    var w = ctx.measureText(text).width + 12, h = sz + 9;
    var bx = opt.align === "center" ? x - w / 2 : opt.align === "right" ? x - w : x;
    ctx.fillStyle = opt.bg || "rgba(0,0,0,.6)";
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(bx, y - h + 4, w, h, 6); else ctx.rect(bx, y - h + 4, w, h);
    ctx.fill();
    ctx.fillStyle = opt.color || "#fff";
    ctx.fillText(text, bx + 6, y - 1);
  }
  function arrow(ctx, x1, y1, x2, y2, col, w) {
    var a = Math.atan2(y2 - y1, x2 - x1), hl = 9 + (w || 2);
    ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = w || 2;
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(a) * hl * 0.6, y2 - Math.sin(a) * hl * 0.6); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - hl * Math.cos(a - 0.4), y2 - hl * Math.sin(a - 0.4));
    ctx.lineTo(x2 - hl * Math.cos(a + 0.4), y2 - hl * Math.sin(a + 0.4));
    ctx.fill(); ctx.lineWidth = 1;
  }
  /* 세로 막대 게이지 */
  function gauge(ctx, x, y, w, h, k, col, label, val) {
    ctx.fillStyle = "rgba(255,255,255,.1)"; ctx.fillRect(x, y, w, h);
    k = Math.max(0, Math.min(1, k));
    ctx.fillStyle = col; ctx.fillRect(x, y + h * (1 - k), w, h * k);
    ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.font = font(12, true);
    var tw = ctx.measureText(label).width; ctx.fillText(label, x + w / 2 - tw / 2, y + h + 16);
    if (val !== undefined) { ctx.font = font(11); tw = ctx.measureText(val).width; ctx.fillText(val, x + w / 2 - tw / 2, y - 6); }
  }
  /* 단계형 목록(ol.stepper)과 다음/처음 버튼 연결 */
  function stepper(listId, nextId, resetId, onChange) {
    var items = $(listId).querySelectorAll("li"), bN = $(nextId), bR = resetId ? $(resetId) : null, cur = 0;
    function set(i) {
      cur = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function (li, k) { li.classList.toggle("on", k === cur); li.classList.toggle("done", k < cur); });
      if (bN) { bN.disabled = cur >= items.length - 1; bN.textContent = cur >= items.length - 1 ? "완료" : "다음 단계 ▶"; }
      onChange(cur);
    }
    items.forEach(function (li, k) { li.addEventListener("click", function () { set(k); }); });
    if (bN) bN.addEventListener("click", function () { set(cur + 1); });
    if (bR) bR.addEventListener("click", function () { set(0); onChange(0, true); });
    set(0);
    return { get: function () { return cur; }, set: set };
  }
  function loop(fn) {
    var last = performance.now();
    function f(t) { var dt = Math.min(0.05, (t - last) / 1000); last = t; fn(dt, t / 1000); requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function approach(cur, target, rate, dt) { return cur + (target - cur) * Math.min(1, rate * dt); }
  return { $: $, fit: fit, font: font, tag: tag, arrow: arrow, gauge: gauge, stepper: stepper, loop: loop, lerp: lerp, approach: approach };
})();
