(function () {
  'use strict';

  // ---------- data (approximate textbook values, adult at rest) ----------
  // v: relative flow speed (cm/s) used only for the cell animation, matching the sister sim.
  var SEG = [
    { id: 'artery', name: 'עורק', loc: 'בעורק', v: 35, ptxt: '120/80', range: 'סיסטולי כ־120, דיאסטולי כ־80, ממוצע כ־95', pulse: 'חזק',
      wall: 'עבה ואלסטית, עם שכבת שריר', note: 'הלחץ הגבוה ביותר במערכת. בסיסטולה החדר השמאלי מתכווץ, דם נדחף אל העורק, ודופן העורק האלסטית נמתחת. בדיאסטולה הדופן חוזרת לממדיה ולוחצת על הדם, ולכן הלחץ בעורק אינו יורד לאפס והזרימה נמשכת.' },
    { id: 'arterioles', name: 'עורקיקים', loc: 'בעורקיקים', v: 2.5, ptxt: '95 עד 35', range: 'ממוצע מכ־95 לכ־35', pulse: 'נחלש ונעלם',
      wall: 'שכבת שריר חלק', note: 'כאן הירידה הגדולה ביותר בלחץ הדם. לעורקיקים קוטר קטן ודופן שרירית, וההתנגדות שלהם לזרימה גבוהה. התנודות בין סיסטולה לדיאסטולה נחלשות לאורכם עד שכמעט נעלמות.' },
    { id: 'capillaries', name: 'נימים', loc: 'בנימים', v: 0.04, ptxt: '35 עד 15', range: 'מכ־35 בקצה העורקי לכ־15 בקצה הורידי', pulse: 'אין',
      wall: 'שכבת תאים אחת', note: 'הלחץ יורד לאורך הנים. בקצה העורקי הלחץ גבוה יחסית, ונוזל עובר מהדם אל בין תאי הרקמה (נוזל רקמה). בקצה הורידי הלחץ נמוך יותר, וחלק מהנוזל חוזר אל הדם. הנימים צרים מאוד, אך הם רבים ומחוברים במקביל, ולכן ההתנגדות הכוללת שלהם קטנה מזו של העורקיקים.' },
    { id: 'venules', name: 'ורידונים', loc: 'בורידונים', v: 0.5, ptxt: '15 עד 10', range: 'מכ־15 לכ־10', pulse: 'אין',
      wall: 'דקה', note: 'הנימים מתאחדים לורידונים. הלחץ נמוך וממשיך לרדת, והזרימה רציפה, בלי דופק.' },
    { id: 'vein', name: 'וריד', loc: 'בוריד', v: 12, ptxt: '10 עד 0', range: 'מכ־10 לכ־0 עד 5 בעלייה הימנית', pulse: 'אין',
      wall: 'דקה יחסית לחלל הרחב, עם מסתמים', note: 'הלחץ הנמוך ביותר במערכת. מסתמים בוורידים מונעים זרימה לאחור. החזרת הדם אל הלב נעזרת בכיווץ שרירי השלד סביב הוורידים, בשינויי הלחץ בבית החזה בזמן הנשימה ובירידת הלחץ בעלייה הימנית.' }
  ];
  var ZB = [0, 0.215, 0.40, 0.60, 0.785, 1];
  var H = 440;
  var YA = [95, 220, 345], OFF = [-45, -15, 15, 45];
  var TRACE_A = 0, TRACE_C = 2;
  var PMAX = 130;

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


  // ---------- the cardiac cycle ----------
  // w(phase): arterial pressure wave, 0 = diastolic floor, 1 = systolic peak (with a dicrotic notch)
  var SYS_END = 0.37;
  function wave(p) {
    p = p - Math.floor(p);
    if (p < 0.13) return ss(p / 0.13);
    if (p < 0.33) return 1 - 0.32 * ss((p - 0.13) / 0.2);
    if (p < 0.36) return 0.68 - 0.08 * ss((p - 0.33) / 0.03);
    if (p < 0.41) return 0.60 + 0.06 * ss((p - 0.36) / 0.05);
    var x = (p - 0.41) / 0.59, k = 3.0;
    return 0.66 * (Math.exp(-k * x) - Math.exp(-k)) / (1 - Math.exp(-k));
  }
  // forward push of the cells in the arteries (mean = 1)
  var QN = 1;
  function qRaw(p) { p = p - Math.floor(p); return 0.32 + 2.6 * (p < 0.36 ? Math.sin(Math.PI * p / 0.36) : 0); }
  (function () { var m = 0; for (var i = 0; i < 1000; i++) m += qRaw(i / 1000); QN = m / 1000; })();
  function qFlow(p) { return qRaw(p) / QN; }
  function delayAt(u) { return 0.12 * Math.min(u, 0.42); } // the pressure wave travels along the arteries
  // diastolic floor and pulse pressure along the tree (mmHg)
  var BK = [[0, 80], [0.215, 79], [0.40, 35], [0.60, 15], [0.785, 10], [1.0, 2]];
  function baseP(u) {
    if (u <= 0) return BK[0][1];
    for (var i = 1; i < BK.length; i++) if (u <= BK[i][0]) {
      var t = (u - BK[i - 1][0]) / (BK[i][0] - BK[i - 1][0]);
      return BK[i - 1][1] + (BK[i][1] - BK[i - 1][1]) * t;
    }
    return BK[BK.length - 1][1];
  }
  function ppAt(u) {
    if (u < 0.215) return 40;
    if (u > 0.42) return 0;
    return 40 * Math.exp(-4.5 * (u - 0.215) / 0.185) * (1 - ss((u - 0.36) / 0.06));
  }
  function sysP(u) { return baseP(u) + ppAt(u); }
  function pNow(u, ph) { return baseP(u) + ppAt(u) * wave(ph - delayAt(u)); }
  function pulsAt(u) { return 1 - ss((u - 0.17) / (0.36 - 0.17)); }      // how pulsed the cell motion is
  function elastAt(u) { return 0.16 * (1 - ss((u - 0.16) / (0.30 - 0.16))); } // wall stretch in systole
  function rNow(u) {
    if (u > 0.30) return rAt(u);
    return rAt(u) * (1 + elastAt(u) * (wave(phase - delayAt(u)) - 0.4));
  }

  // ---------- state ----------
  var cv = document.getElementById('vessels'), ctx = cv.getContext('2d');
  var ch = document.getElementById('chart'), cx = ch.getContext('2d');
  var ch2 = document.getElementById('chartTime'), cx2 = ch2.getContext('2d');
  var wrapEl = document.getElementById('canvasWrap');
  var L = 1000, sc = 1, dpr = 1, cssW = 0, bg = null, sprites = [], cellR = 3.3;
  var cells = [], exch = [];
  var running = false, hr = 72, slow = false;
  var simT = 0, phase = 0;
  var tracerU = 0.005, maxU = -1, graphFull = false, laps = 0, started = false;
  var hoverZ = -1, selZ = -1, lastZ = -1, lastT = 0, lastTxt = 0;
  var MP = [{ name: 'עורק', loc: 'בעורק', u: 0.05, a: 1, c: 1 }, { name: 'נימים', loc: 'בנימים', u: 0.50, a: 1, c: 1 }, { name: 'וריד', loc: 'בוריד', u: 0.93, a: 1, c: 1 }];
  var mpIdx = 0, samples = [], SWEEP = 4;

  function animSpeed(i) { // logical px per second (relative order as in the velocity sim, compressed)
    var r = SEG[i].v / SEG[0].v;
    return 300 * Math.pow(r, 0.45) * (L / 1000);
  }
  function baseSpeed(u) { // smooth (log-space) across zone boundaries
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
  function pulseMul(u) { var k = pulsAt(u); return k <= 0 ? 1 : 1 + k * (qFlow(phase - delayAt(u)) - 1); }

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
  function tubePath(path, a, c, extra, fromU, toU, rf, N) {
    N = N || 260; rf = rf || rAt;
    var top = [], bot = [];
    for (var k = 0; k <= N; k++) {
      var u = fromU + (toU - fromU) * k / N;
      var x = u * L, y = yAt(u, a, c), r = rf(u) + extra(u);
      top.push([x, y - r]); bot.push([x, y + r]);
    }
    path.moveTo(top[0][0], top[0][1]);
    for (k = 1; k < top.length; k++) path.lineTo(top[k][0], top[k][1]);
    for (k = bot.length - 1; k >= 0; k--) path.lineTo(bot[k][0], bot[k][1]);
    path.closePath();
  }
  function hiStrip(path, a, c, fromU, toU, rf, N) {
    var top = [], bot = [];
    for (var k = 0; k <= N; k++) {
      var u = fromU + (toU - fromU) * k / N, x = u * L, y = yAt(u, a, c), r = rf(u);
      top.push([x, y - r * 0.78]); bot.push([x, y - r * 0.5]);
    }
    path.moveTo(top[0][0], top[0][1]);
    top.forEach(function (p) { path.lineTo(p[0], p[1]); });
    for (var k2 = bot.length - 1; k2 >= 0; k2--) path.lineTo(bot[k2][0], bot[k2][1]);
    path.closePath();
  }
  function hGrad(g, stops) {
    var gr = g.createLinearGradient(0, 0, L, 0);
    stops.forEach(function (s) { gr.addColorStop(s[0], s[1]); });
    return gr;
  }
  var WALL_STOPS = [[0, '#b71c1c'], [0.2, '#c62828'], [0.4, '#cf3a3a'], [0.5, '#b94458'], [0.6, '#8e3d6a'], [0.8, '#7a3466'], [1, '#62285a']];
  var LUMEN_STOPS = [[0, '#f9d9d4'], [0.38, '#fbe2dd'], [0.62, '#efdde9'], [1, '#e7d8ea']];
  // draws the tubes between fromU and toU; routes = list of [a, c]
  function drawTubes(g, routes, fromU, toU, rf, N, shadow) {
    var wallPath = new Path2D(), lumenPath = new Path2D(), hiPath = new Path2D();
    routes.forEach(function (rc) {
      tubePath(wallPath, rc[0], rc[1], function (u) { return wAt(u); }, fromU, toU, rf, N);
      tubePath(lumenPath, rc[0], rc[1], function () { return 0; }, fromU, toU, rf, N);
      hiStrip(hiPath, rc[0], rc[1], fromU, toU, rf, N);
    });
    g.save();
    if (shadow) { g.shadowColor = 'rgba(80,20,30,0.22)'; g.shadowBlur = 8 * dpr; g.shadowOffsetY = 3 * dpr; }
    g.fillStyle = hGrad(g, WALL_STOPS); g.fill(wallPath, 'nonzero');
    g.restore();
    g.fillStyle = hGrad(g, LUMEN_STOPS); g.fill(lumenPath, 'nonzero');
    g.save(); g.globalAlpha = 0.45; g.fillStyle = '#ffffff'; g.fill(hiPath, 'nonzero'); g.restore();
  }
  var ALL = [], ART = [[0, 0], [1, 0], [2, 0]];
  for (var a0 = 0; a0 < 3; a0++) for (var c0 = 0; c0 < 4; c0++) ALL.push([a0, c0]);
  var DYN_TO = 0.31;
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

    // everything downstream of the elastic part is static
    // the elastic part is drawn here at its narrowest (end of diastole); the frame draws it wider on top
    drawTubes(g, ALL, -0.01, 1.01, function (u) { return u > 0.30 ? rAt(u) : rAt(u) * (1 - elastAt(u) * 0.4); }, 300, true);

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
        cells.push({ z: z, a: a, c: c, u: u, lat: lat, prof: prof });
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
    [ch, ch2].forEach(function (c) {
      c.width = Math.round(c.parentNode.clientWidth * dpr); c.height = Math.round(c.parentNode.clientHeight * dpr);
    });
    drawCharts();
    drawScene();
  }

  // ---------- frame ----------
  function step(dt) {
    var sdt = dt * (slow ? 0.5 : 1);
    simT += sdt;
    phase = simT * hr / 60; phase -= Math.floor(phase);
    for (var i = 0; i < cells.length; i++) {
      var p = cells[i], z0 = ZB[p.z], z1 = ZB[p.z + 1];
      p.u += animSpeed(p.z) * pulseMul(p.u) * p.prof * sdt / L;
      if (p.u >= z1) {
        p.u -= (z1 - z0);
        if (p.z !== 2) { p.a = (Math.random() * 3) | 0; p.c = (Math.random() * 4) | 0; }
      }
    }
    // tracer
    var before = tracerU;
    tracerU += baseSpeed(tracerU) * pulseMul(tracerU) * sdt / L;
    if (tracerU >= 1) { tracerU = 0; graphFull = true; laps++; }
    if (tracerU >= before && tracerU > maxU) maxU = tracerU;
    // fluid leaves the capillaries near the arterial end and returns near the venous end
    if (Math.random() < sdt * 9) {
      var a = (Math.random() * 3) | 0, c = (Math.random() * 4) | 0, u = 0.425 + Math.random() * 0.15;
      var pOut = 1 - ss((u - 0.44) / (0.56 - 0.44));
      var out = Math.random() < pOut, side = Math.random() < 0.5 ? -1 : 1;
      exch.push({ a: a, c: c, u: u, side: side, out: out, t: 0 });
      if (exch.length > 90) exch.shift();
    }
    for (var e = exch.length - 1; e >= 0; e--) { exch[e].t += sdt / 2.2; if (exch[e].t >= 1) exch.splice(e, 1); }
    // pressure at the measuring point
    samples.push({ t: simT, p: pNow(MP[mpIdx].u, phase) });
    while (samples.length && samples[0].t < simT - SWEEP * 2) samples.shift();
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
    // the elastic artery and the first part of the arterioles, redrawn every frame
    ctx.save(); ctx.beginPath(); ctx.rect(-20, 0, DYN_TO * L + 20, H); ctx.clip();
    drawTubes(ctx, ART, -0.01, DYN_TO + 0.01, rNow, 120, false);
    ctx.restore();
    // fluid exchange dots
    for (var e = 0; e < exch.length; e++) {
      var q = exch[e], y0 = yAt(q.u, q.a, q.c), d = q.out ? 4 + q.t * 11 : 15 - q.t * 11;
      ctx.globalAlpha = Math.sin(Math.PI * q.t) * 0.85;
      ctx.fillStyle = q.out ? '#1f9d8b' : '#4f8fbf';
      ctx.beginPath(); ctx.arc(q.u * L, y0 + q.side * d, 1.8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (var i = 0; i < cells.length; i++) {
      var p = cells[i], r = rNow(p.u), y = yAt(p.u, p.a, p.c) + p.lat * Math.max(0, r - cellR * 1.05);
      drawCell(p.u * L, y, p.u, r < cellR * 1.6, 1);
    }
    // measuring point
    var m = MP[mpIdx], mx = m.u * L, my = yAt(m.u, m.a, m.c), mr = rNow(m.u) + wAt(m.u);
    ctx.save();
    ctx.strokeStyle = '#0f766e'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
    ctx.beginPath(); ctx.moveTo(mx, my - mr - 2); ctx.lineTo(mx, my - mr - 22); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = '#0f766e'; ctx.beginPath(); ctx.arc(mx, my - mr - 27, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my - mr - 27, 2.4, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
    // dim the other zones when one is chosen
    var z = selZ >= 0 ? selZ : hoverZ;
    if (z >= 0) {
      ctx.fillStyle = 'rgba(251,250,247,0.62)';
      for (var k = 0; k < 5; k++) if (k !== z) ctx.fillRect(ZB[k] * L, 0, (ZB[k + 1] - ZB[k]) * L, H);
      ctx.strokeStyle = 'rgba(15,118,110,0.55)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]);
      ctx.strokeRect(ZB[z] * L + 1, 1, (ZB[z + 1] - ZB[z]) * L - 2, H - 2); ctx.setLineDash([]);
    }
    // tracer
    var tu = tracerU, ty = yAt(tu, TRACE_A, TRACE_C), tr = rNow(tu);
    ctx.beginPath(); ctx.arc(tu * L, ty, cellR * 2.1, 0, Math.PI * 2);
    ctx.lineWidth = 2.6; ctx.strokeStyle = '#f2b632'; ctx.stroke();
    ctx.beginPath(); ctx.arc(tu * L, ty, cellR * 2.1 + 2.4, 0, Math.PI * 2);
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(242,182,50,0.45)'; ctx.stroke();
    drawCell(tu * L, ty, tu, tr < cellR * 1.6, 1.15);
    // heart beat icon
    var beat = 1 + 0.16 * (started ? wave(phase + 0.03) : 0);
    heartEl.style.transform = 'scale(' + beat.toFixed(3) + ')';
  }

  // ---------- charts ----------
  function frame(cvs, g) {
    var W = cvs.width / dpr, Hh = cvs.height / dpr;
    if (!W || !Hh) return null;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, W, Hh);
    var small = W < 420;
    var padL = small ? 58 : 70, padR = 16, padT = 26, padB = small ? 58 : 64;
    return { W: W, Hh: Hh, small: small, padL: padL, padR: padR, padT: padT, padB: padB, pw: W - padL - padR, ph: Hh - padT - padB, f: small ? 11.5 : 13 };
  }
  function yAxis(g, F, title, sub) {
    var Y = function (v) { return F.padT + F.ph * (1 - v / PMAX); };
    g.font = F.f + 'px Heebo, sans-serif';
    g.strokeStyle = '#ebe6dd'; g.lineWidth = 1; g.fillStyle = '#5d6370'; g.textAlign = 'right'; g.textBaseline = 'middle';
    g.direction = 'ltr';
    [0, 20, 40, 60, 80, 100, 120].forEach(function (v) {
      g.beginPath(); g.moveTo(F.padL, Y(v)); g.lineTo(F.padL + F.pw, Y(v)); g.stroke();
      g.fillText(String(v), F.padL - 7, Y(v));
    });
    g.strokeStyle = '#4a4f59'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(F.padL, F.padT - 6); g.lineTo(F.padL, F.padT + F.ph); g.lineTo(F.padL + F.pw, F.padT + F.ph); g.stroke();
    g.save(); g.translate(F.small ? 13 : 16, F.padT + F.ph / 2); g.rotate(-Math.PI / 2);
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#24262b';
    g.font = (F.small ? 12 : 13.5) + 'px Heebo, sans-serif';
    g.fillText(title, 0, 0);
    g.font = (F.small ? 10.5 : 12) + 'px Heebo, sans-serif'; g.fillStyle = '#5d6370';
    g.fillText(sub, 0, F.small ? 13 : 15);
    g.restore();
    return Y;
  }
  function label(g, txt, x, y, color, size, align) {
    g.font = '700 ' + size + 'px Heebo, sans-serif'; g.textAlign = align || 'center';
    g.lineWidth = 4; g.strokeStyle = 'rgba(255,255,255,0.95)'; g.lineJoin = 'round';
    g.strokeText(txt, x, y); g.fillStyle = color; g.fillText(txt, x, y);
  }
  function placeholder(g, F, txt) {
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#8b909a';
    g.font = (F.small ? 13 : 15) + 'px Heebo, sans-serif';
    g.fillText(txt, F.padL + F.pw / 2, F.padT + F.ph * 0.42);
  }
  function drawCharts() { drawProfile(); drawTime(); }

  // graph 1: pressure along the vessel tree
  function drawProfile() {
    var g = cx, F = frame(ch, g); if (!F) return;
    var Y = yAxis(g, F, 'לחץ הדם (מ״מ כספית)', '(משתנה תלוי)');
    var X = function (u) { return F.padL + u * F.pw; };
    // zone dividers and names
    g.strokeStyle = '#e2dbd0'; g.lineWidth = 1; g.setLineDash([3, 4]);
    for (var b = 1; b < 5; b++) { g.beginPath(); g.moveTo(X(ZB[b]), F.padT); g.lineTo(X(ZB[b]), F.padT + F.ph + 4); g.stroke(); }
    g.setLineDash([]);
    g.direction = 'rtl'; g.textAlign = 'center'; g.textBaseline = 'top';
    var reach = graphFull ? 1 : maxU;
    for (var i = 0; i < 5; i++) {
      var on = graphFull || reach >= ZB[i];
      g.fillStyle = on ? '#24262b' : '#8b909a';
      g.font = '700 ' + (F.small && i === 1 ? F.f - 1 : F.f) + 'px Heebo, sans-serif';
      g.fillText(SEG[i].name, X((ZB[i] + ZB[i + 1]) / 2), F.padT + F.ph + 7);
    }
    g.font = (F.small ? 12 : 13.5) + 'px Heebo, sans-serif'; g.fillStyle = '#24262b';
    g.fillText('כלי הדם (משתנה בלתי תלוי)', F.padL + F.pw / 2, F.padT + F.ph + (F.small ? 30 : 34));
    if (reach < 0) { placeholder(g, F, 'לחצו «הפעלת זרימה» והגרף ייבנה'); return; }
    var N = 220, k, u, n = Math.max(1, Math.round(N * reach));
    // systolic to diastolic band
    g.beginPath();
    for (k = 0; k <= n; k++) { u = reach * k / n; g[k ? 'lineTo' : 'moveTo'](X(u), Y(sysP(u))); }
    for (k = n; k >= 0; k--) { u = reach * k / n; g.lineTo(X(u), Y(baseP(u))); }
    g.closePath(); g.fillStyle = 'rgba(198,40,40,0.16)'; g.fill();
    // envelope lines
    g.lineWidth = 1.4; g.strokeStyle = 'rgba(142,31,47,0.55)'; g.setLineDash([5, 4]);
    g.beginPath(); for (k = 0; k <= n; k++) { u = reach * k / n; g[k ? 'lineTo' : 'moveTo'](X(u), Y(sysP(u))); } g.stroke();
    g.beginPath(); for (k = 0; k <= n; k++) { u = reach * k / n; g[k ? 'lineTo' : 'moveTo'](X(u), Y(baseP(u))); } g.stroke();
    g.setLineDash([]);
    // pressure right now along the tree
    g.lineWidth = 3; g.strokeStyle = '#c62828'; g.lineJoin = 'round';
    g.beginPath(); for (k = 0; k <= n; k++) { u = reach * k / n; g[k ? 'lineTo' : 'moveTo'](X(u), Y(pNow(u, phase))); } g.stroke();
    // value labels
    g.direction = 'ltr'; g.textBaseline = 'bottom';
    var sz = F.small ? 11.5 : 13;
    if (reach > 0.02) {
      g.direction = 'rtl';
      label(g, 'סיסטולי 120', X(0.005), Y(120) - 4, '#8e1f2f', sz, 'left');
      g.textBaseline = 'top'; label(g, 'דיאסטולי 80', X(0.005), Y(80) + 5, '#8e1f2f', sz, 'left'); g.textBaseline = 'bottom';
    }
    g.direction = 'rtl';
    [[0.40, 'כ־35'], [0.60, 'כ־15'], [0.785, 'כ־10'], [1.0, 'כ־2']].forEach(function (pt) {
      if (reach < pt[0] - 0.001) return;
      var x = X(pt[0]), y = Y(baseP(pt[0]));
      g.fillStyle = '#fff'; g.strokeStyle = '#c62828'; g.lineWidth = 2.2;
      g.beginPath(); g.arc(x, y, 4.5, 0, Math.PI * 2); g.fill(); g.stroke();
      label(g, pt[1], pt[0] === 1 ? x - 6 : x, y - 9, '#8e1f2f', sz, pt[0] === 1 ? 'right' : 'center');
    });
    // moving marker
    if (started) {
      var mx = X(tracerU), my = Y(pNow(tracerU, phase));
      g.strokeStyle = 'rgba(242,182,50,0.9)'; g.lineWidth = 1.5; g.setLineDash([4, 4]);
      g.beginPath(); g.moveTo(mx, F.padT); g.lineTo(mx, F.padT + F.ph); g.stroke(); g.setLineDash([]);
      g.fillStyle = '#d32f2f'; g.beginPath(); g.arc(mx, my, 6.5, 0, Math.PI * 2); g.fill();
      g.strokeStyle = '#f2b632'; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, 9, 0, Math.PI * 2); g.stroke();
    }
  }

  // graph 2: pressure over time at one point (a sweep, like a monitor)
  function drawTime() {
    var g = cx2, F = frame(ch2, g); if (!F) return;
    var Y = yAxis(g, F, 'לחץ הדם (מ״מ כספית)', '(משתנה תלוי)');
    var X = function (s) { return F.padL + (s / SWEEP) * F.pw; };
    g.direction = 'ltr'; g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = '#5d6370';
    g.font = F.f + 'px Heebo, sans-serif';
    for (var s = 0; s <= SWEEP; s++) {
      g.fillText(String(s), X(s), F.padT + F.ph + 7);
      g.strokeStyle = '#4a4f59'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(s), F.padT + F.ph); g.lineTo(X(s), F.padT + F.ph + 4); g.stroke();
    }
    g.direction = 'rtl'; g.font = (F.small ? 12 : 13.5) + 'px Heebo, sans-serif'; g.fillStyle = '#24262b';
    g.fillText('זמן (שניות)', F.padL + F.pw / 2, F.padT + F.ph + (F.small ? 30 : 34));
    if (!started) { placeholder(g, F, 'לחצו «הפעלת זרימה» ובחרו נקודת מדידה'); return; }
    var sweep = Math.floor(simT / SWEEP), cur = simT - sweep * SWEEP;
    g.lineWidth = 3; g.lineJoin = 'round'; g.strokeStyle = '#0f766e';
    function seg(filter, alpha) {
      g.globalAlpha = alpha; g.beginPath(); var first = true;
      for (var i = 0; i < samples.length; i++) {
        var sm = samples[i], sw = Math.floor(sm.t / SWEEP), x = sm.t - sw * SWEEP;
        if (!filter(sw, x)) { first = true; continue; }
        g[first ? 'moveTo' : 'lineTo'](X(x), Y(sm.p)); first = false;
      }
      g.stroke(); g.globalAlpha = 1;
    }
    seg(function (sw, x) { return sw === sweep - 1 && x > cur + 0.25; }, 0.3);
    seg(function (sw) { return sw === sweep; }, 1);
    // readings
    var last = samples.length ? samples[samples.length - 1].p : pNow(MP[mpIdx].u, phase);
    var lo = 1e9, hi = -1e9;
    samples.forEach(function (sm) { if (sm.t > simT - 2) { lo = Math.min(lo, sm.p); hi = Math.max(hi, sm.p); } });
    var mx = X(cur), my = Y(last);
    g.strokeStyle = 'rgba(242,182,50,0.9)'; g.lineWidth = 1.5; g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(mx, F.padT); g.lineTo(mx, F.padT + F.ph); g.stroke(); g.setLineDash([]);
    g.fillStyle = '#0f766e'; g.beginPath(); g.arc(mx, my, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#f2b632'; g.lineWidth = 3; g.beginPath(); g.arc(mx, my, 8.5, 0, Math.PI * 2); g.stroke();
    g.direction = 'rtl'; g.textBaseline = 'top';
    var t = MP[mpIdx].name + ': ' + (hi - lo > 3 ? 'בין ' + Math.round(lo) + ' ל־' + Math.round(hi) + ' · יש דופק' : 'כ־' + Math.round(last) + ' · אין דופק');
    label(g, t, F.padL + F.pw - 4, F.padT - 22, '#0b5c55', F.small ? 12 : 14, 'right');
  }

  // ---------- UI ----------
  var heartEl = document.getElementById('heart');
  var zonesEl = document.getElementById('zones');
  SEG.forEach(function (s, i) {
    var d = document.createElement('div');
    d.className = 'zone z' + i; d.setAttribute('role', 'listitem'); d.tabIndex = 0;
    d.style.flex = '0 0 ' + ((ZB[i + 1] - ZB[i]) * 100) + '%';
    d.innerHTML = '<span class="zname">' + s.name + '</span><span class="zspeed"><span class="zpre">לחץ: </span><b>' + s.ptxt + '</b> <span class="zunit">מ״מ כספית</span></span>';
    d.addEventListener('click', function () { selZ = selZ === i ? -1 : i; updateInfo(); if (!running) drawScene(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); d.click(); } });
    zonesEl.appendChild(d);
  });
  var zoneEls = zonesEl.children;
  var tb = document.getElementById('valuesBody');
  SEG.forEach(function (s) {
    var tr = document.createElement('tr');
    tr.innerHTML = '<td><b>' + s.name + '</b></td><td>' + s.range + '</td><td>' + s.pulse + '</td><td>' + s.wall + '</td>';
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
      '<p><span class="k">לחץ הדם: </span><b>' + s.range + '</b> <span class="k">מ״מ כספית</span></p>' +
      '<p><span class="k">דופק: </span>' + s.pulse + ' · <span class="k">דופן: </span>' + s.wall + '</p>' +
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
  var phaseEl = document.getElementById('phase');
  function updateReadout(force) {
    var z = zoneOf(tracerU);
    if (z !== lastZ || force) {
      lastZ = z;
      for (var k = 0; k < 5; k++) zoneEls[k].classList.toggle('active', started && k === z);
    }
    if (!started) {
      readoutText.innerHTML = 'התא המסומן מחכה בתחילת העורק.'; meterFill.style.width = '0';
      phaseEl.textContent = ''; phaseEl.className = 'phase'; return;
    }
    var now = performance.now();
    if (!force && now - lastTxt < 120) return;
    lastTxt = now;
    var p = pNow(tracerU, phase);
    readoutText.innerHTML = 'התא המסומן נמצא <b>' + SEG[z].loc + '</b> · לחץ הדם שם עכשיו: <b>כ־' + Math.round(p) + ' מ״מ כספית</b>';
    meterFill.style.width = (clamp(p / 125, 0.01, 1) * 100).toFixed(1) + '%';
    var sys = phase < SYS_END;
    phaseEl.textContent = sys ? 'סיסטולה: החדרים מתכווצים' : 'דיאסטולה: החדרים רפויים';
    phaseEl.className = 'phase ' + (sys ? 'sys' : 'dia');
  }

  var btnPlay = document.getElementById('btnPlay');
  function setRunning(on) {
    running = on;
    if (on) started = true;
    btnPlay.textContent = on ? '⏸ השהיה' : (started ? '▶ המשך' : '▶ הפעלת זרימה');
    btnPlay.setAttribute('aria-pressed', on ? 'true' : 'false');
    document.body.classList.toggle('running', started);
    updateReadout(true);
  }
  btnPlay.addEventListener('click', function () { setRunning(!running); });
  document.getElementById('btnReset').addEventListener('click', function () {
    tracerU = 0.005; maxU = -1; graphFull = false; laps = 0; started = false; lastZ = -1; simT = 0; phase = 0; samples = [];
    initCells(); setRunning(false); drawCharts(); drawScene();
  });
  var hrEl = document.getElementById('hr'), hrOut = document.getElementById('hrOut');
  hrEl.addEventListener('input', function () {
    var ph = phase; hr = parseFloat(hrEl.value); hrOut.textContent = hr;
    simT = ph * 60 / hr + Math.floor(simT * hr / 60) * 60 / hr; // keep the phase continuous
    samples = [];
  });
  document.getElementById('slow').addEventListener('change', function (e) { slow = e.target.checked; });
  Array.prototype.forEach.call(document.querySelectorAll('.mp button'), function (b, i) {
    b.addEventListener('click', function () {
      mpIdx = i; samples = [];
      Array.prototype.forEach.call(document.querySelectorAll('.mp button'), function (o, j) { o.setAttribute('aria-pressed', j === i ? 'true' : 'false'); });
      drawCharts(); drawScene();
    });
  });
  var simPanel = document.querySelector('.sim-panel');
  document.getElementById('btnFull').addEventListener('click', function () {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (simPanel.requestFullscreen) simPanel.requestFullscreen();
  });
  document.addEventListener('fullscreenchange', function () { setTimeout(resize, 60); });

  // ---------- questions (saved in this browser) ----------
  var KEY = 'lachatz-dam-sim:';
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
    var parts = ['שאלות לחשיבה · לחץ הדם בכלי הדם', ''];
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
      drawCharts();
      updateReadout(false);
    }
    requestAnimationFrame(loop);
  }
  if (window.ResizeObserver) { var ro = new ResizeObserver(function () { resize(); }); ro.observe(wrapEl); ro.observe(ch.parentNode); ro.observe(ch2.parentNode); }
  window.addEventListener('resize', resize);
  resize();
  updateReadout(true);
  requestAnimationFrame(loop);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { drawCharts(); });

  // read-only hook for automated checks
  window.__sim = {
    state: function () { return { running: running, tracerU: tracerU, zone: zoneOf(tracerU), maxU: maxU, graphFull: graphFull, laps: laps, L: L, phase: phase, simT: simT, mp: mpIdx, nSamples: samples.length }; },
    profile: function () { var o = []; for (var i = 0; i <= 20; i++) { var u = i / 20; o.push({ u: u, sys: sysP(u), dia: baseP(u) }); } return o; },
    pressure: function (u) { return pNow(u, phase); },
    recent: function () { return samples.slice(-200).map(function (s) { return s.p; }); },
    jump: function (u) { tracerU = u; if (u > maxU) maxU = u; }
  };
})();
