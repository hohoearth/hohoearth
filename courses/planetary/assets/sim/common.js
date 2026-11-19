/* 시뮬레이션 · 데이터 분석 공통 도구 (모든 차시에서 사용) */
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

  /* ---------- 데이터 과학 도구 ---------- */
  /* 재현 가능한 난수 (같은 seed → 같은 데이터) */
  function rand(seed) {
    var a = seed >>> 0;
    var r = function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    r.gauss = function () { var u = 1 - r(), v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
    return r;
  }
  /* 최소 제곱 직선 y = m x + b, 결정 계수 r² */
  function linreg(xs, ys) {
    var n = xs.length, sx = 0, sy = 0, sxx = 0, sxy = 0, syy = 0;
    for (var i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; sxx += xs[i] * xs[i]; sxy += xs[i] * ys[i]; syy += ys[i] * ys[i]; }
    var m = (n * sxy - sx * sy) / (n * sxx - sx * sx), b = (sy - m * sx) / n;
    var r = (n * sxy - sx * sy) / Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
    return { m: m, b: b, r2: r * r };
  }
  function nice(v, d) { if (!isFinite(v)) return "–"; d = d === undefined ? 2 : d; return Math.abs(v) >= 1e5 || (Math.abs(v) < 1e-3 && v !== 0) ? v.toExponential(d) : (+v.toFixed(d)).toLocaleString("ko-KR", { maximumFractionDigits: d }); }
  /* 좌표축: o = {x,y,w,h, x0,x1,y0,y1, xlog,ylog, xl,yl, xt,yt(눈금 배열), grid, xfmt,yfmt, light} */
  function axes(ctx, o) {
    var lx = function (v) { return o.xlog ? Math.log10(v) : v; }, ly = function (v) { return o.ylog ? Math.log10(v) : v; };
    var ax0 = lx(o.x0), ax1 = lx(o.x1), ay0 = ly(o.y0), ay1 = ly(o.y1);
    var X = function (v) { return o.x + (lx(v) - ax0) / (ax1 - ax0) * o.w; };
    var Y = function (v) { return o.y + o.h - (ly(v) - ay0) / (ay1 - ay0) * o.h; };
    var fg = o.light ? "rgba(20,23,31,.75)" : "rgba(255,255,255,.75)", gr = o.light ? "rgba(20,23,31,.08)" : "rgba(255,255,255,.08)";
    function ticks(a, b, log, given) {
      if (given) return given;
      var t = [], lo = Math.min(a, b), hi = Math.max(a, b); a = lo; b = hi;
      if (log) { for (var e = Math.floor(lx(a)); e <= Math.ceil(lx(b)); e++) t.push(Math.pow(10, e)); return t.filter(function (v) { return v >= a * 0.999 && v <= b * 1.001; }); }
      var span = b - a, step = Math.pow(10, Math.floor(Math.log10(span / 5))), k = span / step;
      if (k > 10) step *= 2; if (k > 20) step *= 2.5; if (k < 4) step /= 2;
      for (var v = Math.ceil(a / step) * step; v <= b + step * 1e-6; v += step) t.push(+v.toPrecision(10));
      return t;
    }
    ctx.save(); ctx.font = font(11); ctx.lineWidth = 1;
    var xt = ticks(o.x0, o.x1, o.xlog, o.xt), yt = ticks(o.y0, o.y1, o.ylog, o.yt);
    var xf = o.xfmt || function (v) { return o.xlog && v >= 1e4 ? "10^" + Math.round(Math.log10(v)) : nice(v); };
    var yf = o.yfmt || function (v) { return o.ylog && (v >= 1e4 || v < 1e-2) ? "10^" + Math.round(Math.log10(v)) : nice(v); };
    xt.forEach(function (v) { var px = X(v); if (o.grid !== false) { ctx.strokeStyle = gr; ctx.beginPath(); ctx.moveTo(px, o.y); ctx.lineTo(px, o.y + o.h); ctx.stroke(); } ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.fillText(xf(v), px, o.y + o.h + 15); });
    yt.forEach(function (v) { var py = Y(v); if (o.grid !== false) { ctx.strokeStyle = gr; ctx.beginPath(); ctx.moveTo(o.x, py); ctx.lineTo(o.x + o.w, py); ctx.stroke(); } ctx.fillStyle = fg; ctx.textAlign = "right"; ctx.fillText(yf(v), o.x - 6, py + 4); });
    ctx.strokeStyle = fg; ctx.beginPath(); ctx.moveTo(o.x, o.y); ctx.lineTo(o.x, o.y + o.h); ctx.lineTo(o.x + o.w, o.y + o.h); ctx.stroke();
    ctx.font = font(12, true); ctx.fillStyle = fg;
    if (o.xl) { ctx.textAlign = "center"; ctx.fillText(o.xl, o.x + o.w / 2, o.y + o.h + 33); }
    if (o.yl) { ctx.save(); ctx.translate(o.x - 44, o.y + o.h / 2); ctx.rotate(-Math.PI / 2); ctx.textAlign = "center"; ctx.fillText(o.yl, 0, 0); ctx.restore(); }
    ctx.restore();
    return { X: X, Y: Y, inX: function (px) { var a = ax0 + (px - o.x) / o.w * (ax1 - ax0); return o.xlog ? Math.pow(10, a) : a; }, inY: function (py) { var a = ay0 + (o.y + o.h - py) / o.h * (ay1 - ay0); return o.ylog ? Math.pow(10, a) : a; } };
  }
  function dot(ctx, x, y, r, col, stroke) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); } }
  /* CSV 내려받기 (학생이 스프레드시트·파이썬으로 분석할 수 있게) */
  function csv(name, header, rows) {
    var txt = "﻿" + [header].concat(rows).map(function (r) { return r.map(function (c) { c = String(c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(","); }).join("\n");
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: "text/csv;charset=utf-8" }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  /* 표 그리기: el 에 header/rows 로 table.data 생성 */
  function table(el, header, rows) {
    el.innerHTML = '<div class="tw"><table class="data"><thead><tr>' + header.map(function (h) { return "<th>" + h + "</th>"; }).join("") +
      "</tr></thead><tbody>" + rows.map(function (r) { return "<tr>" + r.map(function (c) { return "<td>" + c + "</td>"; }).join("") + "</tr>"; }).join("") + "</tbody></table></div>";
  }
  /* 리사이즈될 때 다시 그리기 */
  function onResize(fn) { var t; window.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(fn, 60); }); }
  /* 별 배경 */
  function stars(ctx, w, h, n, seed) { var r = rand(seed || 7); for (var i = 0; i < n; i++) { ctx.fillStyle = "rgba(255,255,255," + (0.15 + r() * 0.6) + ")"; ctx.fillRect(r() * w, r() * h, r() < 0.1 ? 2 : 1, r() < 0.1 ? 2 : 1); } }
  /* 색온도 → RGB (대략적인 흑체 색) */
  function tempColor(T) {
    var t = T / 100, r, g, b;
    if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04; }
    else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); b = 255; }
    var c = function (v) { return Math.max(0, Math.min(255, Math.round(v))); };
    return "rgb(" + c(r) + "," + c(g) + "," + c(b) + ")";
  }
  return { $: $, fit: fit, font: font, tag: tag, arrow: arrow, gauge: gauge, stepper: stepper, loop: loop, lerp: lerp, approach: approach,
    rand: rand, linreg: linreg, nice: nice, axes: axes, dot: dot, csv: csv, table: table, onResize: onResize, stars: stars, tempColor: tempColor };
})();
