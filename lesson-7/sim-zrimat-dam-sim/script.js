(function () {
  'use strict';

  // ---------- data (approximate textbook values, person at rest) ----------
  var SEG = [
    { id: 'artery', name: 'עורק', loc: 'בעורק', v: 35, vtxt: '35', range: '30 עד 40', diam: 'כ־2.5 ס״מ (אבי העורקים)', area: 3, areaTxt: 'כ־3',
      wall: 'עבה ואלסטית, עם שכבת שריר', note: 'הדם יוצא מהלב אל העורק. כאן מהירות הזרימה הגבוהה ביותר.' },
    { id: 'arterioles', name: 'עורקיקים', loc: 'בעורקיקים', v: 2.5, vtxt: '2.5', range: '1 עד 5', diam: 'כ־10 עד 100 מיקרומטר', area: 40, areaTxt: 'כ־40',
      wall: 'שכבת שריר חלק', note: 'העורק מתפצל לעורקיקים רבים. שטח החתך הכולל גדל, והמהירות יורדת.' },
    { id: 'capillaries', name: 'נימים', loc: 'בנימים', v: 0.04, vtxt: '0.04', range: '0.03 עד 0.1', diam: 'כ־5 עד 10 מיקרומטר (תאי הדם האדומים עוברים בטור)', area: 2500, areaTxt: 'כ־2,500',
      wall: 'שכבת תאים אחת', note: 'שטח החתך הכולל הגדול ביותר, והמהירות הנמוכה ביותר. בזמן הזה מתרחש מעבר חומרים בין הדם לבין תאי הרקמה.' },
    { id: 'venules', name: 'ורידונים', loc: 'בורידונים', v: 0.5, vtxt: '0.5', range: '0.5 עד 1', diam: 'כ־10 עד 100 מיקרומטר', area: 200, areaTxt: 'כ־200',
      wall: 'דקה', note: 'הנימים מתאחדים לורידונים. שטח החתך הכולל קטן, והמהירות עולה.' },
    { id: 'vein', name: 'וריד', loc: 'בוריד', v: 12, vtxt: '12', range: '10 עד 20', diam: 'כ־3 ס״מ (הוריד הנבוב)', area: 8, areaTxt: 'כ־8',
      wall: 'דקה יחסית לחלל הרחב, עם מסתמים', note: 'המהירות עולה שוב, אך נשארת נמוכה מהמהירות בעורק. שטח החתך הכולל של הוורידים הגדולים גדול משטח החתך של העורק.' }
  ];
  var ZB = [0, 0.215, 0.40, 0.60, 0.785, 1];
  var H = 440;
  var YA = [95, 220, 345], OFF = [-45, -15, 15, 45];
  var TRACE_A = 0, TRACE_C = 2;

  // ---------- geometry ----------
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function ss(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function tw(u, a, b, y0, y1) { return y0 + (y1 - y0) * ss((u - a) / (b - a)); }
  function yAt(u, a, c) {
    var Y0 = 220, ya = YA[a], yc = ya + OFF[c];
    if (u < 0.17) return Y0;
    if (u < 0.27) return tw(u, 0.17, 0.27, Y0, ya);
    if (u < 0.34) return ya;
    if (u < 0.42) return tw(u, 0.34, 0.42, ya, yc);
    if (u < 0.58) return yc;
    if (u < 0.66) return tw(u, 0.58, 0.66, yc, ya);
    if (u < 0.73) return ya;
    if (u < 0.84) return tw(u, 0.73, 0.84, ya, Y0);
    return Y0;
  }
  var CAPR = 2.8;
  function rAt(u) {
    if (u < 0.165) return 24;
    if (u < 0.225) return tw(u, 0.165, 0.225, 24, 9.5);
    if (u < 0.34) return tw(u, 0.225, 0.34, 9.5, 7);
    if (u < 0.42) return tw(u, 0.34, 0.42, 7, CAPR);
    if (u < 0.58) return CAPR;
    if (u < 0.66) return tw(u, 0.58, 0.66, CAPR, 6);
    if (u < 0.77) return tw(u, 0.66, 0.77, 6, 10);
    if (u < 0.85) return tw(u, 0.77, 0.85, 10, 30);
    return 30;
  }
  function wAt(u) {
    if (u < 0.165) return 7.5;
    if (u < 0.225) return tw(u, 0.165, 0.225, 7.5, 4);
    if (u < 0.34) return 4;
    if (u < 0.42) return tw(u, 0.34, 0.42, 4, 1.1);
    if (u < 0.58) return 1.1;
    if (u < 0.66) return tw(u, 0.58, 0.66, 1.1, 1.6);
    if (u < 0.77) return 1.6;
    if (u < 0.85) return tw(u, 0.77, 0.85, 1.6, 3);
    return 3;
  }
  function zoneOf(u) { for (var i = 0; i < 5; i++) if (u < ZB[i + 1]) return i; return 4; }

  // ---------- state ----------
  var cv = document.getElementById('vessels'), ctx = cv.getContext('2d');
  var ch = document.getElementById('chart'), cx = ch.getContext('2d');
  var wrapEl = document.getElementById('canvasWrap');
  var L = 1000, sc = 1, dpr = 1, cssW = 0, bg = null, sprites = [], cellR = 3.3;
  var cells = [], exch = [];
  var running = false, rate = 1, realScale = false, showArea = false, logY = false;
  var tracerU = 0.005, maxG = -1, graphFull = false, laps = 0, started = false;
  var hoverZ = -1, selZ = -1, lastZ = -1, lastT = 0;

  function animSpeed(i) { // logical px per second
    var r = SEG[i].v / SEG[0].v;
    var base = realScale ? 300 * r : 300 * Math.pow(r, 0.45);
    return base * rate * (L / 1000);
  }
  function tracerSpeed(u) { // smooth (log-space) across zone boundaries
    var w = 0.022, i = zoneOf(u);
    var lv = Math.log(animSpeed(i));
    for (var b = 1; b < 5; b++) {
      var d = u - ZB[b];
      if (Math.abs(d) < w) {
        var t = ss((d + w) / (2 * w));
        lv = Math.log(animSpeed(b - 1)) * (1 - t) + Math.log(animSpeed(b)) * t;
      }
    }
    return Math.exp(lv);
  }

  // ---------- colors ----------
  function mix(c1, c2, t) {
    var a = [parseInt(c1.substr(1, 2), 16), parseInt(c1.substr(3, 2), 16), parseInt(c1.substr(5, 2), 16)];
    var b = [parseInt(c2.substr(1, 2), 16), parseInt(c2.substr(3, 2), 16), parseInt(c2.substr(5, 2), 16)];
    return 'rgb(' + Math.round(a[0] + (b[0] - a[0]) * t) + ',' + Math.round(a[1] + (b[1] - a[1]) * t) + ',' + Math.round(a[2] + (b[2] - a[2]) * t) + ')';
  }
  function oxy(u) { return ss((u - 0.44) / (0.62 - 0.44)); } // 0 oxygen-rich, 1 oxygen-poor
  var NS = 10;
  function makeSprites() {
    sprites = [];
    var px = Math.max(6, Math.ceil(cellR * 2.6 * sc * dpr));
    for (var k = 0; k < NS; k++) {
      var t = k / (NS - 1);
      var c = document.createElement('canvas'); c.width = c.height = px;
      var g = c.getContext('2d'), R = px / 2;
      var grd = g.createRadialGradient(R, R, R * 0.1, R, R, R * 0.92);
      grd.addColorStop(0, mix('#f07a7a', '#a8566f', t));
      grd.addColorStop(0.45, mix('#dc2f33', '#8c2a4c', t));
      grd.addColorStop(0.8, mix('#b3141b', '#6d1838', t));
      grd.addColorStop(1, mix('#8f0f16', '#521129', t));
      g.fillStyle = grd; g.beginPath(); g.arc(R, R, R * 0.92, 0, Math.PI * 2); g.fill();
      sprites.push(c);
    }
  }

  // ---------- static vessel picture ----------
  function tubePath(path, a, c, extra, fromU, toU) {
    var N = 260, top = [], bot = [];
    for (var k = 0; k <= N; k++) {
      var u = fromU + (toU - fromU) * k / N;
      var x = u * L, y = yAt(u, a, c), r = rAt(u) + extra(u);
      top.push([x, y - r]); bot.push([x, y + r]);
    }
    path.moveTo(top[0][0], top[0][1]);
    for (k = 1; k < top.length; k++) path.lineTo(top[k][0], top[k][1]);
    for (k = bot.length - 1; k >= 0; k--) path.lineTo(bot[k][0], bot[k][1]);
    path.closePath();
  }
  function allRoutes(extra) {
    var p = new Path2D();
    for (var a = 0; a < 3; a++) for (var c = 0; c < 4; c++) tubePath(p, a, c, extra, -0.01, 1.01);
    return p;
  }
  function hGrad(g, stops) {
    var gr = g.createLinearGradient(0, 0, L, 0);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    return gr;
  }
  function drawBg() {
    bg = document.createElement('canvas');
    bg.width = Math.round(cssW * dpr); bg.height = Math.round(H * sc * dpr);
    var g = bg.getContext('2d');
    g.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0);
    g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, L, H);

    // tissue around the capillaries
    var tx0 = 0.385 * L, tx1 = 0.615 * L;
    g.fillStyle = '#f6eee3';
    roundRect(g, tx0, 26, tx1 - tx0, H - 52, 26); g.fill();
    g.save(); g.globalAlpha = 0.55; g.strokeStyle = '#e3d3bd'; g.lineWidth = 1;
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    for (var yy = 40; yy < H - 40; yy += 15) {
      for (var xx = tx0 + 14; xx < tx1 - 10; xx += 22) {
        var ox = xx + (Math.floor((yy - 40) / 15) % 2) * 11 + (rnd() - 0.5) * 4, oy = yy + (rnd() - 0.5) * 3;
        g.beginPath(); g.ellipse(ox, oy, 9, 6, 0, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#e8d8c2'; g.beginPath(); g.arc(ox, oy, 1.8, 0, Math.PI * 2); g.fill();
      }
    }
    g.restore();

    var wallPath = allRoutes(function (u) { return wAt(u); });
    var lumenPath = allRoutes(function () { return 0; });
    var hiPath = new Path2D();
    for (var a = 0; a < 3; a++) for (var c = 0; c < 4; c++) {
      // a thin light strip near the upper inner wall, for a rounded-tube look
      (function (a, c) {
        var N = 200, top = [], bot = [];
        for (var k = 0; k <= N; k++) {
          var u = -0.01 + 1.02 * k / N, x = u * L, y = yAt(u, a, c), r = rAt(u);
          top.push([x, y - r * 0.78]); bot.push([x, y - r * 0.5]);
        }
        hiPath.moveTo(top[0][0], top[0][1]);
        top.forEach(function (p) { hiPath.lineTo(p[0], p[1]); });
        for (var k2 = bot.length - 1; k2 >= 0; k2--) hiPath.lineTo(bot[k2][0], bot[k2][1]);
        hiPath.closePath();
      })(a, c);
    }

    g.save();
    g.shadowColor = 'rgba(80,20,30,0.22)'; g.shadowBlur = 8 * dpr; g.shadowOffsetY = 3 * dpr;
    g.fillStyle = hGrad(g, [[0, '#b71c1c'], [0.2, '#c62828'], [0.4, '#cf3a3a'], [0.5, '#b94458'], [0.6, '#8e3d6a'], [0.8, '#7a3466'], [1, '#62285a']]);
    g.fill(wallPath, 'nonzero');
    g.restore();
    g.fillStyle = hGrad(g, [[0, '#f9d9d4'], [0.38, '#fbe2dd'], [0.62, '#efdde9'], [1, '#e7d8ea']]);
    g.fill(lumenPath, 'nonzero');
    g.save(); g.globalAlpha = 0.45; g.fillStyle = '#ffffff'; g.fill(hiPath, 'nonzero'); g.restore();

    // vein valves (paired flaps pointing downstream)
    g.fillStyle = 'rgba(98,40,90,0.55)';
    [0.9, 0.965].forEach(function (u) {
      var x = u * L, y = 220, r = 30;
      g.beginPath(); g.moveTo(x - 4, y - r); g.quadraticCurveTo(x + 10, y - r + 6, x + 16, y - 5); g.quadraticCurveTo(x + 4, y - r + 12, x + 2, y - r); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(x - 4, y + r); g.quadraticCurveTo(x + 10, y + r - 6, x + 16, y + 5); g.quadraticCurveTo(x + 4, y + r - 12, x + 2, y + r); g.closePath(); g.fill();
    });
  }
  function roundRect(g, x, y, w, h, r) {
    g.beginPath(); g.moveTo(x + r, y); g.lineTo(x + w - r, y); g.quadraticCurveTo(x + w, y, x + w, y + r);
    g.lineTo(x + w, y + h - r); g.quadraticCurveTo(x + w, y + h, x + w - r, y + h); g.lineTo(x + r, y + h);
    g.quadraticCurveTo(x, y + h, x, y + h - r); g.lineTo(x, y + r); g.quadraticCurveTo(x, y, x + r, y); g.closePath();
  }

  // ---------- cells ----------
  function initCells() {
    cells = []; exch = [];
    var f = L / 1000;
    var counts = [92, 70, 132, 76, 132].map(function (n, i) { return i === 2 ? 132 : Math.round(n * f); });
    for (var z = 0; z < 5; z++) {
      var n = counts[z], z0 = ZB[z], len = ZB[z + 1] - ZB[z];
      for (var k = 0; k < n; k++) {
        var a, c, u, lat;
        if (z === 2) {
          var idx = k % 12; a = (idx / 4) | 0; c = idx % 4;
          var per = n / 12, j = (k / 12) | 0;
          u = z0 + (j + 0.5 + (Math.random() - 0.5) * 0.15) / per * len;
          lat = 0;
        } else {
          a = k % 3; c = ((k / 3) | 0) % 4;
          u = z0 + (k + Math.random()) / n * len;
          lat = (Math.random() * 2 - 1);
        }
        var prof = (z === 0 || z === 4) ? 1 + 0.14 * (1 - lat * lat) - 0.07 : 1;
        cells.push({ z: z, a: a, c: c, u: u, lat: lat, prof: prof, rot: Math.random() });
      }
    }
  }

  // ---------- layout ----------
  function resize() {
    var w = wrapEl.clientWidth;
    if (!w) return;
    cssW = w; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var newL = w < 640 ? 620 : 1000;
    var changed = newL !== L || !cells.length;
    L = newL; sc = cssW / L;
    CAPR = L < 1000 ? 3.2 : 2.8;
    cellR = L < 1000 ? 3.7 : 3.3;
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(H * sc * dpr);
    cv.style.height = (H * sc) + 'px';
    drawBg(); makeSprites();
    if (changed) initCells();
    var cw = ch.parentNode.clientWidth, chh = ch.parentNode.clientHeight;
    ch.width = Math.round(cw * dpr); ch.height = Math.round(chh * dpr);
    drawChart();
    drawScene();
  }

  // ---------- frame ----------
  function step(dt) {
    for (var i = 0; i < cells.length; i++) {
      var p = cells[i], z0 = ZB[p.z], z1 = ZB[p.z + 1];
      p.u += animSpeed(p.z) * p.prof * dt / L;
      if (p.u >= z1) {
        p.u -= (z1 - z0);
        if (p.z !== 2) { p.a = (Math.random() * 3) | 0; p.c = (Math.random() * 4) | 0; }
      }
    }
    // tracer
    var before = tracerU;
    tracerU += tracerSpeed(tracerU) * dt / L;
    if (tracerU >= 1) { tracerU = 0; graphFull = true; laps++; }
    var g = graphPos(tracerU);
    if (tracerU >= before && g > maxG) maxG = g;
    // exchange of materials in the capillaries
    if (Math.random() < dt * 7 * Math.sqrt(rate)) {
      var a = (Math.random() * 3) | 0, c = (Math.random() * 4) | 0, u = 0.43 + Math.random() * 0.14;
      var out = Math.random() < 0.6, side = Math.random() < 0.5 ? -1 : 1;
      exch.push({ a: a, c: c, u: u, side: side, out: out, t: 0 });
      if (exch.length > 90) exch.shift();
    }
    for (var e = exch.length - 1; e >= 0; e--) { exch[e].t += dt / 2.2; if (exch[e].t >= 1) exch.splice(e, 1); }
  }
  function graphPos(u) {
    var i = zoneOf(u), f = (u - ZB[i]) / (ZB[i + 1] - ZB[i]);
    return clamp(i + f - 0.5, 0, 4);
  }

  function drawCell(x, y, u, narrow, scale) {
    var s = sprites[Math.round(oxy(u) * (NS - 1))];
    var rr = cellR * (scale || 1);
    var w = narrow ? rr * 2.5 : rr * 2, h = narrow ? rr * 1.55 : rr * 2;
    ctx.drawImage(s, x - w / 2, y - h / 2, w, h);
  }
  function drawScene() {
    if (!bg) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(bg, 0, 0);
    ctx.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0);
    // exchange dots
    for (var e = 0; e < exch.length; e++) {
      var q = exch[e], y0 = yAt(q.u, q.a, q.c), d = q.out ? 4 + q.t * 11 : 15 - q.t * 11;
      ctx.globalAlpha = Math.sin(Math.PI * q.t) * 0.85;
      ctx.fillStyle = q.out ? '#1f9d8b' : '#7b8190';
      ctx.beginPath(); ctx.arc(q.u * L, y0 + q.side * d, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < cells.length; i++) {
      var p = cells[i], r = rAt(p.u), y = yAt(p.u, p.a, p.c) + p.lat * Math.max(0, r - cellR * 1.05);
      drawCell(p.u * L, y, p.u, r < cellR * 1.6, 1);
    }
    // dim the other zones when one is chosen
    var z = selZ >= 0 ? selZ : hoverZ;
    if (z >= 0) {
      ctx.fillStyle = 'rgba(251,250,247,0.62)';
      for (var k = 0; k < 5; k++) if (k !== z) ctx.fillRect(ZB[k] * L, 0, (ZB[k + 1] - ZB[k]) * L, H);
      ctx.strokeStyle = 'rgba(15,118,110,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.strokeRect(ZB[z] * L + 1, 1, (ZB[z + 1] - ZB[z]) * L - 2, H - 2); ctx.setLineDash([]);
    }
    // tracer
    var tu = tracerU, ty = yAt(tu, TRACE_A, TRACE_C), tr = rAt(tu);
    ctx.beginPath(); ctx.arc(tu * L, ty, cellR * 2.1, 0, Math.PI * 2);
    ctx.lineWidth = 2.6; ctx.strokeStyle = '#f2b632'; ctx.stroke();
    ctx.beginPath(); ctx.arc(tu * L, ty, cellR * 2.1 + 2.4, 0, Math.PI * 2);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(242,182,50,0.45)'; ctx.stroke();
    drawCell(tu * L, ty, tu, tr < cellR * 1.6, 1.15);
  }

  // ---------- chart ----------
  var VMAX = 40, AMAX = 3000;
  function drawChart() {
    var W = ch.width / dpr, Hh = ch.height / dpr;
    if (!W || !Hh) return;
    var g = cx;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, Hh);
    var small = W < 420;
    var padL = small ? 54 : 66, padR = showArea ? (small ? 50 : 62) : 16, padT = 26, padB = small ? 58 : 64;
    var pw = W - padL - padR, ph = Hh - padT - padB;
    var X = function (i) { return padL + (i + 0.5) * pw / 5; };
    var lg = function (x, lo, hi) { return (Math.log(x) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)); };
    var Y = function (v) { return padT + ph * (1 - (logY ? lg(Math.max(v, 0.01), 0.01, 100) : v / VMAX)); };
    var YAr = function (a) { return padT + ph * (1 - (logY ? lg(Math.max(a, 1), 1, 10000) : a / AMAX)); };
    var f = small ? 11.5 : 13;
    g.font = f + 'px Heebo, sans-serif';
    // grid + left ticks
    g.strokeStyle = '#ebe6dd'; g.lineWidth = 1; g.fillStyle = '#5d6370'; g.textAlign = 'right'; g.textBaseline = 'middle';
    g.direction = 'ltr';
    var vt = logY ? [0.01, 0.1, 1, 10, 100] : [0, 10, 20, 30, 40];
    vt.forEach(function (v) {
      g.beginPath(); g.moveTo(padL, Y(v)); g.lineTo(padL + pw, Y(v)); g.stroke();
      g.fillText(String(v), padL - 7, Y(v));
    });
    if (showArea) {
      g.textAlign = 'left'; g.fillStyle = '#0f766e';
      (logY ? [1, 10, 100, 1000, 10000] : [0, 1000, 2000, 3000]).forEach(function (a) { g.fillText(a.toLocaleString('en-US'), padL + pw + 6, YAr(a)); });
    }
    // axes
    g.strokeStyle = '#4a4f59'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(padL, padT - 6); g.lineTo(padL, padT + ph); g.lineTo(padL + pw, padT + ph); g.stroke();
    if (showArea) { g.strokeStyle = '#0f766e'; g.beginPath(); g.moveTo(padL + pw, padT - 6); g.lineTo(padL + pw, padT + ph); g.stroke(); }
    // category labels
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'top';
    for (var i = 0; i < 5; i++) {
      var on = (graphFull || maxG >= i - 0.5);
      g.fillStyle = on ? '#24262b' : '#8b909a';
      g.font = '700 ' + f + 'px Heebo, sans-serif';
      g.fillText(SEG[i].name, X(i), padT + ph + 7);
      g.strokeStyle = '#4a4f59'; g.beginPath(); g.moveTo(X(i), padT + ph); g.lineTo(X(i), padT + ph + 4); g.stroke();
    }
    g.font = (small ? 12 : 13.5) + 'px Heebo, sans-serif'; g.fillStyle = '#24262b';
    g.fillText('כלי הדם (משתנה בלתי תלוי)', padL + pw / 2, padT + ph + (small ? 30 : 34));
    // y title (rotated)
    g.save(); g.translate(small ? 13 : 16, padT + ph / 2); g.rotate(-Math.PI / 2);
    g.textBaseline = 'middle'; g.fillText('מהירות זרימת הדם (ס״מ/שנייה)', 0, 0);
    g.font = (small ? 10.5 : 12) + 'px Heebo, sans-serif'; g.fillStyle = '#5d6370';
    g.fillText('(משתנה תלוי)', 0, small ? 13 : 15);
    g.restore();
    if (showArea) {
      g.save(); g.translate(W - (small ? 8 : 10), padT + ph / 2); g.rotate(Math.PI / 2);
      g.textBaseline = 'middle'; g.fillStyle = '#0f766e'; g.font = (small ? 11 : 12.5) + 'px Heebo, sans-serif';
      g.fillText('שטח חתך כולל (סמ״ר)', 0, 0); g.restore();
    }

    // area line (complete, dashed)
    if (showArea) {
      g.strokeStyle = '#0f766e'; g.lineWidth = 2.2; g.setLineDash([7, 5]);
      g.beginPath();
      for (i = 0; i < 5; i++) { if (i) g.lineTo(X(i), YAr(SEG[i].area)); else g.moveTo(X(i), YAr(SEG[i].area)); }
      g.stroke(); g.setLineDash([]);
      g.fillStyle = '#0f766e'; g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'bottom';
      g.font = '600 ' + (small ? 10.5 : 12) + 'px Heebo, sans-serif';
      for (i = 0; i < 5; i++) {
        g.fillRect(X(i) - 3.5, YAr(SEG[i].area) - 3.5, 7, 7);
        if (i === 2) g.fillText('2,500', X(i), YAr(SEG[i].area) - 6);
      }
    }

    // velocity line, drawn up to the tracer's progress
    var G = graphFull ? 4 : maxG;
    if (G < 0 && !graphFull) {
      g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#8b909a';
      g.font = (small ? 13 : 15) + 'px Heebo, sans-serif';
      g.fillText('לחצו «הפעלת זרימה» והגרף ייבנה', padL + pw / 2, padT + ph * 0.42);
      return;
    }
    g.strokeStyle = '#c62828'; g.lineWidth = 3; g.lineJoin = 'round';
    g.beginPath(); g.moveTo(X(0), Y(SEG[0].v));
    var full = Math.floor(G);
    for (i = 1; i <= full; i++) g.lineTo(X(i), Y(SEG[i].v));
    if (full < 4 && G > full) {
      var t = G - full;
      g.lineTo(X(full) + (X(full + 1) - X(full)) * t, Y(SEG[full].v + (SEG[full + 1].v - SEG[full].v) * t));
    }
    g.stroke();
    g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'bottom';
    for (i = 0; i < 5; i++) {
      if (!(graphFull || G >= i - 0.5)) continue;
      g.fillStyle = '#fff'; g.strokeStyle = '#c62828'; g.lineWidth = 2.5;
      g.beginPath(); g.arc(X(i), Y(SEG[i].v), 5.5, 0, Math.PI * 2); g.fill(); g.stroke();
      g.fillStyle = '#8e1f2f'; g.font = '700 ' + (small ? 12 : 13.5) + 'px Heebo, sans-serif';
      var ly = Y(SEG[i].v) - 9;
      g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineJoin = 'round';
      g.strokeText(SEG[i].vtxt, X(i), ly);
      g.fillText(SEG[i].vtxt, X(i), ly);
    }
    // moving marker, synced with the tracer
    if (started) {
      var gp = graphPos(tracerU), j = Math.min(3, Math.floor(gp)), tt = gp - j;
      var mx = X(j) + (X(j + 1) - X(j)) * tt, my = Y(SEG[j].v + (SEG[j + 1].v - SEG[j].v) * tt);
      g.strokeStyle = 'rgba(242,182,50,0.9)'; g.lineWidth = 1.5; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(mx, padT); g.lineTo(mx, padT + ph); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#d32f2f'; g.beginPath(); g.arc(mx, my, 6.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#f2b632'; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, 9, 0, Math.PI * 2); g.stroke();
    }
  }

  // ---------- UI ----------
  var zonesEl = document.getElementById('zones');
  SEG.forEach(function (s, i) {
    var d = document.createElement('div');
    d.className = 'zone z' + i; d.setAttribute('role', 'listitem'); d.tabIndex = 0;
    d.style.flex = '0 0 ' + ((ZB[i + 1] - ZB[i]) * 100) + '%';
    d.innerHTML = '<span class="zname">' + s.name + '</span><span class="zspeed"><span class="zpre">מהירות: </span><b><bdi dir="ltr">~' + s.vtxt + '</bdi></b> <span class="zunit">ס״מ/שנייה</span></span>';
    d.addEventListener('click', function () { selZ = selZ === i ? -1 : i; updateInfo(); if (!running) drawScene(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); } });
    zonesEl.appendChild(d);
  });
  var zoneEls = zonesEl.children;
  var tb = document.getElementById('valuesBody');
  SEG.forEach(function (s) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><b>' + s.name + '</b></td><td><bdi dir="ltr">~' + s.vtxt + '</bdi> <span class="small">(' + s.range + ')</span></td><td>' + s.diam + '</td><td>' + s.areaTxt + '</td>';
    tb.appendChild(tr);
  });

  var info = document.getElementById('info');
  var hintHTML = info.innerHTML;
  function updateInfo() {
    var z = selZ >= 0 ? selZ : hoverZ;
    for (var k = 0; k < 5; k++) zoneEls[k].classList.toggle('sel', k === z);
    if (z < 0) { info.innerHTML = hintHTML; return; }
    var s = SEG[z];
    info.innerHTML = '<h3>' + s.name + '</h3>' +
      '<p><span class="k">מהירות: </span><b><bdi dir="ltr">~' + s.vtxt + '</bdi> ס״מ/שנייה</b> <span class="k">(' + s.range + ')</span></p>' +
      '<p><span class="k">קוטר כלי בודד: </span>' + s.diam + '</p>' +
      '<p><span class="k">שטח חתך כולל: </span>' + s.areaTxt + ' סמ״ר · <span class="k">דופן: </span>' + s.wall + '</p>' +
      '<p>' + s.note + '</p>';
  }
  function zoneFromEvent(e) {
    var r = cv.getBoundingClientRect();
    var u = (e.clientX - r.left) / r.width;
    return (u >= 0 && u <= 1) ? zoneOf(u) : -1;
  }
  cv.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var z = zoneFromEvent(e); if (z !== hoverZ) { hoverZ = z; updateInfo(); if (!running) drawScene(); }
  });
  cv.addEventListener('pointerleave', function () { if (hoverZ !== -1) { hoverZ = -1; updateInfo(); if (!running) drawScene(); } });
  cv.addEventListener('click', function (e) {
    var z = zoneFromEvent(e); selZ = (selZ === z) ? -1 : z; updateInfo(); if (!running) drawScene();
  });

  var readoutText = document.getElementById('readoutText'), meterFill = document.getElementById('meterFill');
  function updateReadout(force) {
    var z = zoneOf(tracerU);
    if (z === lastZ && !force) return;
    lastZ = z;
    for (var k = 0; k < 5; k++) zoneEls[k].classList.toggle('active', started && k === z);
    if (!started) { readoutText.innerHTML = 'התא המסומן מחכה בתחילת העורק.'; meterFill.style.width = '0'; return; }
    var s = SEG[z];
    readoutText.innerHTML = 'התא המסומן נמצא <b>' + s.loc + '</b> · מהירות: <b><bdi dir="ltr">~' + s.vtxt + '</bdi> ס״מ/שנייה</b>';
    var w = (Math.log(s.v) - Math.log(0.02)) / (Math.log(40) - Math.log(0.02));
    meterFill.style.width = (clamp(w, 0.04, 1) * 100).toFixed(1) + '%';
  }

  var btnPlay = document.getElementById('btnPlay');
  function setRunning(on) {
    running = on;
    if (on) started = true;
    btnPlay.textContent = on ? '⏸ השהיה' : (started ? '▶ המשך זרימה' : '▶ הפעלת זרימה');
    btnPlay.setAttribute('aria-pressed', on ? 'true' : 'false');
    document.body.classList.toggle('running', started);
    updateReadout(true);
  }
  btnPlay.addEventListener('click', function () { setRunning(!running); });
  document.getElementById('btnReset').addEventListener('click', function () {
    tracerU = 0.005; maxG = -1; graphFull = false; laps = 0; started = false; lastZ = -1;
    initCells(); setRunning(false); drawChart(); drawScene();
  });
  var rateEl = document.getElementById('rate'), rateOut = document.getElementById('rateOut');
  rateEl.addEventListener('input', function () { rate = parseFloat(rateEl.value); rateOut.textContent = '×' + rate; });
  var scaleNote = document.getElementById('scaleNote'), noteScaled = scaleNote.textContent;
  document.getElementById('realScale').addEventListener('change', function (e) {
    realScale = e.target.checked;
    scaleNote.textContent = realScale ? 'עכשיו היחס בין המהירויות אמיתי: בנימים התאים כמעט לא זזים. לחזרה לתצוגה המוקטנת בטלו את הסימון.' : noteScaled;
  });
  document.getElementById('logY').addEventListener('change', function (e) { logY = e.target.checked; drawChart(); });
  document.getElementById('showArea').addEventListener('change', function (e) {
    showArea = e.target.checked; document.getElementById('areaCaption').hidden = !showArea; drawChart();
  });
  var simPanel = document.querySelector('.sim-panel');
  document.getElementById('btnFull').addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (simPanel.requestFullscreen) simPanel.requestFullscreen();
  });
  document.addEventListener('fullscreenchange', function () { setTimeout(resize, 60); });

  // ---------- questions (saved in this browser) ----------
  var KEY = 'zrimat-dam-sim:';
  var saveState = document.getElementById('saveState'), saveTimer = null;
  var tas = document.querySelectorAll('.qlist textarea');
  Array.prototype.forEach.call(tas, function (ta) {
    try { ta.value = localStorage.getItem(KEY + ta.dataset.key) || ''; } catch (e) {}
    ta.addEventListener('input', function () {
      try { localStorage.setItem(KEY + ta.dataset.key, ta.value); saveState.textContent = 'נשמר ✓'; } catch (e) { saveState.textContent = 'לא ניתן לשמור בדפדפן הזה'; }
      clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveState.textContent = ''; }, 1800);
    });
  });
  document.getElementById('btnCopy').addEventListener('click', function () {
    var parts = ['שאלות לחשיבה · מהירות זרימת הדם', ''];
    Array.prototype.forEach.call(document.querySelectorAll('.qlist li'), function (li, i) {
      parts.push((i + 1) + '. ' + li.querySelector('label').textContent.trim());
      parts.push('תשובה: ' + (li.querySelector('textarea').value.trim() || '(עדיין אין תשובה)'));
      parts.push('');
    });
    var text = parts.join('\n');
    function done() { saveState.textContent = 'הועתק ✓'; clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveState.textContent = ''; }, 2000); }
    function fallback() {
      var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0';
      document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(t);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  // ---------- loop ----------
  function loop(t) {
    var dt = lastT ? Math.min(0.05, (t - lastT) / 1000) : 0;
    lastT = t;
    if (running && dt > 0) {
      step(dt);
      drawScene();
      drawChart();
      updateReadout(false);
    }
    requestAnimationFrame(loop);
  }
  if (window.ResizeObserver) new ResizeObserver(function () { resize(); }).observe(wrapEl);
  window.addEventListener('resize', resize);
  resize();
  updateReadout(true);
  requestAnimationFrame(loop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawChart(); });

  // read-only hook for automated checks
  window.__sim = {
    state: function () { return { running: running, tracerU: tracerU, zone: zoneOf(tracerU), maxG: maxG, graphFull: graphFull, laps: laps, L: L }; },
    speeds: function () { return SEG.map(function (s, i) { return { name: s.name, v: s.v, anim: animSpeed(i) }; }); },
    jump: function (u) { tracerU = u; }
  };
})();
