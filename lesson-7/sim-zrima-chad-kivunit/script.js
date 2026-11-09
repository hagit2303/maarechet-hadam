(function () {
  'use strict';

  // ---------- model: compartments along the vein ----------
  // 0..3 leg vein segments (bottom to top), 4 abdominal vein (וריד נבוב, בטן), 5 thoracic part (חזה) -> right atrium
  function createModel() {
    var M = {};
    var V0 = [30, 30, 30, 30, 40, 24];
    var Cb = [1.2, 1.2, 1.2, 1.2, 2.0, 1.6];
    var G = [3, 3, 3, 3, 2];        // hydrostatic step k -> k+1 (standing person)
    var g = [5, 5, 5, 5, 7];        // conductance k -> k+1
    var VALVE = [true, true, true, true, false]; // V1..V4, no valve between abdomen and chest
    var gIn = 1.0, gRA = 7, GRA = 1;
    var PRES = 30;                  // residual pressure + arterial column feeding the leg venules
    M.V0 = V0;
    M.on = { muscle: false, breath: false, heart: false };
    M.leaky = false;
    M.reset = function () {
      M.t = 0; M.vol = V0.map(function (v, i) { return v + Cb[i] * 12; });
      M.C = Cb.slice(); M.stretch = 0;
      M.a = [1, 1, 1, 1, 1];        // valve opening 0..1
      M.q = [0, 0, 0, 0, 0, 0];     // q[0]=inflow, q[1..4]=through V1..V4, q[5]=abdomen->chest
      M.qRA = 0; M.P = [0, 0, 0, 0, 0, 0]; M.Pra = 3;
      M.mus = 0; M.inh = 0; M.hp = 0; M.raRelax = 0;
      M.musPhase = 0; M.brPhase = 0; M.hPhase = 0;
      M.returned = 0; M.back = [0, 0, 0, 0];
    };
    function ss(x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); }
    M.MUS_T = 1.6; M.BR_T = 4.0; M.H_T = 0.8;
    function drive(dt) {
      // phases always advance, a mechanism that is off contributes nothing
      M.musPhase = (M.musPhase + dt / M.MUS_T) % 1;
      M.brPhase = (M.brPhase + dt / M.BR_T) % 1;
      M.hPhase = (M.hPhase + dt / M.H_T) % 1;
      var p = M.musPhase;  // contract 0..0.4, relax after
      var m = p < 0.12 ? ss(p / 0.12) : p < 0.36 ? 1 : p < 0.46 ? 1 - ss((p - 0.36) / 0.1) : 0;
      M.mus += ((M.on.muscle ? m : 0) - M.mus) * Math.min(1, dt / 0.03);
      var b = M.brPhase;   // inhale 0..0.4, exhale 0.4..1
      var inh = b < 0.4 ? Math.sin(Math.PI * b / 0.4 * 0.5) : Math.cos(Math.PI * 0.5 * (b - 0.4) / 0.6);
      inh = b < 0.4 ? ss(b / 0.4) : 1 - ss((b - 0.4) / 0.6);
      M.inh += ((M.on.breath ? inh : 0) - M.inh) * Math.min(1, dt / 0.05);
      var h = M.hPhase, ra = 4, relax = 0;   // atrial systole 0..0.14, then relaxation (diastole) with low pressure
      if (M.on.heart) {
        if (h < 0.14) { ra = 4 + 3 * Math.sin(Math.PI * h / 0.14); }
        else if (h < 0.62) { relax = Math.sin(Math.PI * (h - 0.14) / 0.48); ra = 4 - 8 * relax; }
        else { ra = 4; }
      }
      M.raRelax = relax;
      M.Pra = ra - 5 * M.inh;
    }
    function stepOnce(dt) {
      drive(dt);
      var target = M.leaky ? 1 : 0;
      M.stretch += (target - M.stretch) * Math.min(1, dt / (M.leaky ? 5 : 3));
      M.C[2] = Cb[2] * (1 + 1.8 * M.stretch);
      M.C[1] = Cb[1] * (1 + 0.5 * M.stretch);
      var ext = [0, 38 * M.mus, 38 * M.mus, 0, 7 * M.inh, -6 * M.inh];
      var P = M.P;
      for (var i = 0; i < 6; i++) P[i] = ext[i] + (M.vol[i] - V0[i]) / M.C[i];
      var qin = gIn * (PRES - P[0]); if (qin < 0) qin = 0;
      M.q[0] = qin;
      for (var k = 0; k < 5; k++) {
        var d = P[k] - P[k + 1] - G[k], q;
        if (VALVE[k]) {
              var tgt = d > 0.15 ? 1 : d < -0.05 ? 0 : (M.a[k] > 0.5 ? 1 : 0);
          var tau = tgt > M.a[k] ? 0.04 : 0.09;
          M.a[k] += (tgt - M.a[k]) * Math.min(1, dt / tau);
          var open = M.a[k];
          if (M.leaky && k === 2 && d < 0) open = Math.max(open, 0.8);
          q = g[k] * open * d;
        } else q = g[k] * d;
        M.q[k + 1] = q;
      }
      var qra = gRA * (P[5] - M.Pra - GRA); if (qra < -2) qra = -2;
      M.qRA = qra;
      M.vol[0] += (qin - M.q[1]) * dt;
      for (var j = 1; j < 6; j++) M.vol[j] += (M.q[j] - (j < 5 ? M.q[j + 1] : qra)) * dt;
      M.returned += qra * dt; M.t += dt;
    }
    M.step = function (dt) { var n = Math.max(1, Math.ceil(dt / 0.002)), h = dt / n; for (var i = 0; i < n; i++) stepOnce(h); };
    M.reset();
    return M;
  }

  // ---------- scene ----------
  var M = createModel();
  var cv = document.getElementById('scene'), g = cv.getContext('2d');
  var gc = document.getElementById('graph'), gg = gc.getContext('2d');
  var wrapEl = document.getElementById('canvasWrap');
  var H = 600, W = 760, sc = 1, dpr = 1, cx = 300;
  var B = [592, 522, 452, 382, 306, 214, 96];   // boundaries bottom -> top (y)
  var RB = [15, 15, 15, 15.5, 19, 20];           // base radius per compartment
  var VREF = [];
  var running = true, rate = 1, last = 0, cells = [];
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function smooth(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
  function compOf(y) { for (var i = 0; i < 6; i++) if (y >= B[i + 1]) return i; return 6; }
  function radiusOf(i) {
    var rr = RB[i] * Math.sqrt(clamp(M.vol[i] / VREF[i], 0.55, 2.6));
    if (i === 1 || i === 2) rr *= 1 - 0.28 * M.mus;
    return rr;
  }
  var R = [12, 12, 12, 12, 16, 17];
  function rAtY(y) { // smooth radius along the vein
    var i = compOf(y); if (i > 5) return R[5];
    var mid = (B[i] + B[i + 1]) / 2, j = y < mid ? i + 1 : i - 1;
    if (j < 0 || j > 5) return R[i];
    var bnd = y < mid ? B[i + 1] : B[i], dist = Math.abs(y - bnd);
    var t = smooth(1 - dist / 14) * 0.5;
    return R[i] * (1 - t) + R[j] * t;
  }
  function flowAtY(y) {
    var i = compOf(y); if (i > 5) return M.qRA;
    var qb = i === 0 ? M.q[0] : M.q[i], qt = i < 5 ? M.q[i + 1] : M.qRA;
    var f = (B[i] - y) / (B[i] - B[i + 1]);
    return qb + (qt - qb) * f;
  }

  // cells ride the blood: each cell keeps its "volume distance" s from the atrium,
  // and s shrinks by exactly the volume that enters the atrium. Volume is conserved.
  var KV = [0.7, 0.7, 0.7, 0.7, 0.6, 0.0], CYC = 0, ATR = 12;
  function eff(i) { return Math.max(2, M.vol[i] - KV[i] * M.V0[i]); }
  function initCells() {
    cells = [];
    var tot = 0; for (var i = 0; i < 6; i++) tot += eff(i);
    CYC = tot * 1.25 + ATR;
    var n = Math.round(CYC * (W < 600 ? 0.62 : 0.72));
    for (var k = 0; k < n; k++) cells.push({ s: -ATR + Math.random() * CYC, o: (Math.random() * 2 - 1) * 0.72, sz: 0.8 + Math.random() * 0.4, ph: Math.random() * 6.28, y: 0 });
    placeCells();
  }
  function stepCells(dt) {
    var dv = M.qRA * dt;
    for (var k = 0; k < cells.length; k++) {
      var p = cells[k]; p.s -= dv;
      if (p.s < -ATR) { p.s += CYC; p.o = (Math.random() * 2 - 1) * 0.72; }
      if (p.s > CYC - ATR) p.s -= CYC;
    }
    placeCells();
  }
  function placeCells() {
    var E = [], i; for (i = 0; i < 6; i++) E[i] = eff(i);
    for (var k = 0; k < cells.length; k++) {
      var p = cells[k], s = p.s;
      if (s < 0) { p.y = B[6] - (-s / ATR) * 46; continue; }
      var acc = 0, y = 9999;
      for (i = 5; i >= 0; i--) {
        if (s < acc + E[i]) { var f = (s - acc) / E[i]; y = B[i + 1] + f * (B[i] - B[i + 1]); break; }
        acc += E[i];
      }
      p.y = y;
    }
  }

  function resize() {
    var w = wrapEl.clientWidth; if (!w) return;
    dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    var nW = w < 640 ? 430 : 640, changed = nW !== W || !cells.length;
    W = nW; sc = w / W; cx = W < 600 ? 205 : 320;
    cv.width = Math.round(w * dpr); cv.height = Math.round(H * sc * dpr); cv.style.height = (H * sc) + 'px';
    if (changed) initCells();
    var gw = gc.parentNode.clientWidth, gh = gc.parentNode.clientHeight;
    gc.width = Math.round(gw * dpr); gc.height = Math.round(gh * dpr);
    draw(); drawGraph();
  }

  function rr(x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
  function label(t, x, y, opt) {
    opt = opt || {};
    g.font = (opt.w || 600) + ' ' + (opt.s || 13) + 'px Heebo, sans-serif';
    g.textAlign = opt.al || 'center'; g.textBaseline = 'middle';
    if (opt.bg) {
      var tw = g.measureText(t).width, px = opt.al === 'right' ? x - tw - 6 : opt.al === 'left' ? x - 6 : x - tw / 2 - 6;
      g.fillStyle = opt.bg; rr(px, y - (opt.s || 13) * 0.75, tw + 12, (opt.s || 13) * 1.5, 7); g.fill();
      if (opt.bd) { g.strokeStyle = opt.bd; g.lineWidth = 1.2; g.stroke(); }
    }
    g.fillStyle = opt.c || '#24262b'; g.fillText(t, x, y);
  }
  var trunkL, trunkR;
  function drawBody() {
    // faint body outline: torso and leg
    var tw = W < 600 ? 150 : 170, lw = 58;
    g.fillStyle = '#f4ebe1'; g.strokeStyle = '#e3d5c5'; g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(cx - tw, 20); g.lineTo(cx + tw, 20);
    g.quadraticCurveTo(cx + tw + 8, 200, cx + tw - 14, 300);
    g.quadraticCurveTo(cx + lw + 30, 320, cx + lw, 360);
    g.lineTo(cx + lw - 8, 520); g.quadraticCurveTo(cx + lw - 4, 560, cx + lw - 16, 600);
    g.lineTo(cx - lw + 6, 600); g.quadraticCurveTo(cx - lw - 2, 560, cx - lw + 2, 520);
    g.lineTo(cx - lw - 6, 360); g.quadraticCurveTo(cx - tw + 10, 330, cx - tw + 6, 300);
    g.quadraticCurveTo(cx - tw - 8, 200, cx - tw, 20);
    g.closePath(); g.fill(); g.stroke();
    trunkL = cx - tw; trunkR = cx + tw;
    // lungs
    var e = 1 + 0.07 * M.inh;
    g.fillStyle = 'rgba(214,170,176,.38)'; g.strokeStyle = 'rgba(176,120,130,.45)';
    [-1, 1].forEach(function (s) {
      g.save(); g.translate(cx + s * (tw * 0.55), 152); g.scale(e, e);
      g.beginPath(); g.ellipse(0, 0, tw * 0.33, 58, 0, 0, 6.283); g.fill(); g.stroke(); g.restore();
    });
    // ribs
    g.strokeStyle = 'rgba(190,170,150,.35)'; g.lineWidth = 2;
    for (var k = 0; k < 4; k++) { var yy = 110 + k * 26; g.beginPath(); g.moveTo(cx - tw + 10, yy + 10); g.quadraticCurveTo(cx, yy - 12, cx + tw - 10, yy + 10); g.stroke(); }
    // diaphragm: dome, lower and flatter on inhalation
    var dy = 196 + 22 * M.inh, edge = 236 + 4 * M.inh;
    g.strokeStyle = '#b65a5e'; g.lineWidth = 6; g.lineCap = 'round';
    g.beginPath(); g.moveTo(cx - tw + 6, edge); g.bezierCurveTo(cx - tw * 0.55, dy - 6, cx + tw * 0.55, dy - 6, cx + tw - 6, edge); g.stroke();
    g.lineCap = 'butt';
  }

  function drawVein() {
    for (var i = 0; i < 6; i++) R[i] = radiusOf(i);
    var ys = [];
    for (var y = B[0] + 8; y >= B[6] - 4; y -= 3) ys.push(y);
    function side(s, extra) {
      ys.forEach(function (y, k) {
        var wig = 0, ci = compOf(y);
        if (M.stretch > 0.02 && (ci === 1 || ci === 2)) wig = Math.sin(y / 9) * 5 * M.stretch;
        var x = cx + wig + s * (rAtY(y) + extra);
        if (k === 0) g.moveTo(x, y); else g.lineTo(x, y);
      });
    }
    // wall
    g.beginPath(); side(-1, 2.6); for (var k = ys.length - 1; k >= 0; k--) { var y = ys[k], ci = compOf(y), wig = (M.stretch > 0.02 && (ci === 1 || ci === 2)) ? Math.sin(y / 9) * 5 * M.stretch : 0; g.lineTo(cx + wig + rAtY(y) + 2.6, y); }
    g.closePath(); g.fillStyle = '#8c5a86'; g.fill();
    // lumen
    g.beginPath(); side(-1, 0); for (var k2 = ys.length - 1; k2 >= 0; k2--) { var y2 = ys[k2], c2 = compOf(y2), w2 = (M.stretch > 0.02 && (c2 === 1 || c2 === 2)) ? Math.sin(y2 / 9) * 5 * M.stretch : 0; g.lineTo(cx + w2 + rAtY(y2), y2); }
    g.closePath();
    var gr = g.createLinearGradient(cx - 18, 0, cx + 18, 0);
    gr.addColorStop(0, '#5c1f3a'); gr.addColorStop(0.5, '#7d2a45'); gr.addColorStop(1, '#5c1f3a');
    g.fillStyle = gr; g.fill();
    // inflow from venules at the bottom
    g.strokeStyle = '#8c5a86'; g.lineWidth = 3;
    [-1, 1].forEach(function (s) { g.beginPath(); g.moveTo(cx + s * 30, 600); g.quadraticCurveTo(cx + s * 12, 594, cx + s * 6, 586); g.stroke(); });
  }
  function wigAt(y) { var ci = compOf(y); return (M.stretch > 0.02 && (ci === 1 || ci === 2)) ? Math.sin(y / 9) * 5 * M.stretch : 0; }

  function drawCells() {
    for (var k = 0; k < cells.length; k++) {
      var p = cells[k]; if (p.y > B[0] - 2) continue;
      var r = rAtY(p.y), x = cx + wigAt(p.y) + p.o * (r - 4);
      if (p.y < B[6]) x = cx + p.o * 22;
      g.fillStyle = '#b3263a'; g.strokeStyle = '#7d1526'; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(x, p.y, 4.4 * p.sz, 3.2 * p.sz, p.ph, 0, 6.283); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,190,190,.35)'; g.beginPath(); g.ellipse(x, p.y, 1.8 * p.sz, 1.2 * p.sz, p.ph, 0, 6.283); g.fill();
    }
  }

  function drawValves() {
    for (var vi = 1; vi <= 4; vi++) {
      var by = B[vi], a = M.a[vi - 1], bad = M.leaky && vi === 3;
      var wg = wigAt(by), r = rAtY(by + 4) + 1.5;
      var reach = bad ? 0.5 : 1, L = 22;
      [-1, 1].forEach(function (s) {
        var wx = cx + wg + s * r, base = by + L * 0.55;
        var closedTip = cx + wg + s * (bad ? r * 0.5 : 0.8);
        var openTip = cx + wg + s * (r * 0.62);
        var tipX = openTip + (closedTip - openTip) * (1 - a) * (bad ? 1 : 1);
        var tipY = by - L * 0.45 + 4 * (1 - a);
        // leaflet: crescent from the wall to the free edge, free edge pointing toward the heart
        g.beginPath(); g.moveTo(wx, base);
        g.quadraticCurveTo(wx - s * 1, tipY + 2, tipX, tipY);
        g.quadraticCurveTo(tipX + (wx - tipX) * 0.35, base - 3, wx, base + 5);
        g.closePath();
        g.fillStyle = bad ? '#f6d2ad' : '#f3e3ea'; g.fill();
        g.strokeStyle = bad ? '#d9822b' : '#b98aa8'; g.lineWidth = 1.8; g.stroke();
      });
      if (bad) { g.strokeStyle = 'rgba(243,156,61,.9)'; g.setLineDash([3, 3]); g.lineWidth = 1.5; g.beginPath(); g.arc(cx + wg, by, r + 8, 0, 6.283); g.stroke(); g.setLineDash([]); }
      var open = a > 0.5, bxr = cx - 92;
      var txt = bad ? 'מסתם ' + vi + ' פגום' : 'מסתם ' + vi + (open ? ' פתוח' : ' סגור');
      g.strokeStyle = bad ? '#e7a565' : '#cfc6b8'; g.lineWidth = 1; g.beginPath(); g.moveTo(bxr + 3, by); g.lineTo(cx - r - 5, by); g.stroke();
      label(txt, bxr, by, { al: 'right', s: 13, w: 700, c: bad ? '#a24f0b' : open ? '#0f766e' : '#555b66', bg: bad ? '#fdebd9' : open ? '#e3f3f1' : '#efedea', bd: bad ? '#e7a565' : open ? '#9fd1ca' : '#d8d3cb' });
    }
  }

  function drawMuscles() {
    var y0 = B[1] - 4, y1 = B[3] + 4, mid = (y0 + y1) / 2, hh = (y0 - y1) / 2 - 4 * M.mus;
    var bul = 18 + 13 * M.mus;
    var inner = R[1] + 4;
    [-1, 1].forEach(function (s) {
      var xc = cx + s * (inner + bul);
      var gr = g.createRadialGradient(xc, mid, 4, xc, mid, hh);
      gr.addColorStop(0, M.on.muscle && M.mus > 0.3 ? '#d97b78' : '#dc9a94'); gr.addColorStop(1, '#bd6b68');
      g.fillStyle = gr; g.strokeStyle = '#a65552'; g.lineWidth = 1.4;
      g.beginPath(); g.ellipse(xc, mid, bul, hh, 0, 0, 6.283); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.28)'; g.lineWidth = 1;
      for (var k = -2; k <= 2; k++) { g.beginPath(); g.ellipse(xc + k * bul * 0.28, mid, bul * 0.12, hh * 0.86, 0, 0, 6.283); g.stroke(); }
    });
    var lx = cx + inner + 2 * bul + 10;
    label('שריר שלד', lx, mid - 10, { al: 'left', s: 13, w: 700, c: '#8e3b38' });
    label(M.on.muscle ? (M.mus > 0.5 ? 'מתכווץ' : 'נרפה') : 'במנוחה', lx, mid + 10, { al: 'left', s: 12.5, c: '#8e3b38' });
  }

  function drawHeart() {
    var hx = cx, hy = 58;
    // ventricle hint
    g.fillStyle = 'rgba(176,58,72,.18)'; g.strokeStyle = 'rgba(150,50,60,.4)'; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(hx + 62, hy + 6, 46, 34, 0.35, 0, 6.283); g.fill(); g.stroke();
    label('לב', hx + 74, hy + 8, { s: 12, c: '#8e1f2f' });
    var sys = (M.on.heart && M.hPhase < 0.14) ? Math.sin(Math.PI * M.hPhase / 0.14) : 0;
    var s = 1 + 0.22 * M.raRelax - 0.16 * sys;
    g.fillStyle = '#6a2343'; g.strokeStyle = '#4a1530'; g.lineWidth = 2;
    g.beginPath(); g.ellipse(hx, hy, 30 * s, 24 * s, 0, 0, 6.283); g.fill(); g.stroke();
    label('עלייה ימנית', hx - 40 * s - 4, hy - 6, { al: 'right', s: 13, w: 700, c: '#4a1530' });
    var pr = Math.max(0, M.Pra + 5 * M.inh);
    var st = !M.on.heart ? 'לחץ כ־' + Math.round(pr) + ' ממ״כ' : (M.raRelax > 0.2 ? 'נרפית · לחץ נמוך' : sys > 0.2 ? 'מתכווצת' : 'לחץ כ־' + Math.round(pr) + ' ממ״כ');
    label(st, hx - 40 * s - 4, hy + 13, { al: 'right', s: 12, c: '#6a2343' });
  }

  function drawPressureTags() {
    var lx = trunkL + 8, al = 'left';
    var chestTxt = M.on.breath ? (M.inh > 0.15 && M.brPhase < 0.4 ? 'לחץ בבית החזה ↓ יורד' : M.brPhase >= 0.4 && M.inh > 0.1 ? 'לחץ בבית החזה ↑ חוזר' : 'לחץ בבית החזה') : 'לחץ בבית החזה';
    var bellyTxt = M.on.breath ? (M.inh > 0.15 && M.brPhase < 0.4 ? 'לחץ בבטן ↑ עולה' : M.brPhase >= 0.4 && M.inh > 0.1 ? 'לחץ בבטן ↓ חוזר' : 'לחץ בבטן') : 'לחץ בבטן';
    var act = M.on.breath && M.inh > 0.15;
    label(chestTxt, cx + 26, 168, { al: 'left', s: 12.5, w: 700, c: act ? '#0f5e58' : '#5d6370', bg: act ? '#e3f3f1' : 'rgba(255,255,255,.8)', bd: act ? '#9fd1ca' : '#e4dfd7' });
    label(bellyTxt, cx + 26, 268, { al: 'left', s: 12.5, w: 700, c: act ? '#7a4a06' : '#5d6370', bg: act ? '#fdf1d8' : 'rgba(255,255,255,.8)', bd: act ? '#f0cf86' : '#e4dfd7' });
    label('סרעפת', trunkR - 14, 236 + 4 * M.inh - 26, { al: 'right', s: 12, w: 700, c: '#9b4448' });
    label(M.on.breath ? (M.brPhase < 0.4 ? 'שאיפה' : 'נשיפה') : '', cx - 26, 132, { al: 'right', s: 13, w: 700, c: '#0f5e58' });
    // gauge of chest pressure (relative)
    label('בית החזה', trunkL + 10, 112, { al: 'left', s: 11.5, c: '#8a7458' });
    label('בטן', trunkL + 10, 290, { al: 'left', s: 11.5, c: '#8a7458' });
    label('רגל', cx - 90, 560, { al: 'right', s: 11.5, c: '#8a7458' });
  }

  function drawArrows() {
    // up arrow near the vein top
    g.strokeStyle = '#0f766e'; g.fillStyle = '#0f766e'; g.lineWidth = 2.5;
    var ax = cx + 30, a1 = 330, a2 = 296;
    if (W >= 600) { g.beginPath(); g.moveTo(ax, a1); g.lineTo(ax, a2); g.stroke(); g.beginPath(); g.moveTo(ax - 6, a2 + 8); g.lineTo(ax, a2); g.lineTo(ax + 6, a2 + 8); g.stroke(); label('אל הלב', ax + 8, (a1 + a2) / 2, { al: 'left', s: 12.5, w: 700, c: '#0f766e' }); }
    label('מהנימים והורידונים', cx, 593, { s: 11.5, w: 600, c: '#5d6370', bg: 'rgba(255,255,255,.85)' });
    // backflow through the damaged valve
    if (M.leaky && M.q[3] < -0.4) {
      var y = B[3] + 26, x = cx + wigAt(y);
      g.strokeStyle = '#f39c3d'; g.lineWidth = 4; g.lineCap = 'round';
      g.beginPath(); g.moveTo(x, y - 20); g.lineTo(x, y + 16); g.stroke();
      g.beginPath(); g.moveTo(x - 7, y + 7); g.lineTo(x, y + 17); g.lineTo(x + 7, y + 7); g.stroke(); g.lineCap = 'butt';
      label('זרימה לאחור', cx - 92, B[3] + 28, { al: 'right', s: 12.5, w: 800, c: '#a24f0b', bg: '#fdebd9', bd: '#e7a565' });
    }
    if (M.leaky && M.stretch > 0.35) label('הוריד מתרחב (דליות)', cx - 92, B[2] + 36, { al: 'right', s: 12, w: 700, c: '#6c2d5f', bg: 'rgba(255,255,255,.85)' });
  }

  function draw() {
    g.setTransform(sc * dpr, 0, 0, sc * dpr, 0, 0);
    g.clearRect(0, 0, W, H);
    g.fillStyle = '#fbfaf7'; g.fillRect(0, 0, W, H);
    drawBody(); drawMuscles(); drawVein(); drawCells(); drawValves(); drawHeart(); drawPressureTags(); drawArrows();
  }

  // ---------- graph: blood returned to the heart over time ----------
  var hist = [], sampleT = 0, WIN = 40;
  function nOn() { return (M.on.muscle ? 1 : 0) + (M.on.breath ? 1 : 0) + (M.on.heart ? 1 : 0); }
  function sample() { hist.push({ t: M.t, v: M.returned, n: nOn() }); while (hist.length && hist[0].t < M.t - WIN - 1) hist.shift(); }
  var BAND = ['#f6f3ee', '#e6f2f0', '#cfe8e4', '#b3dcd6'];
  function drawGraph() {
    var w = gc.width / dpr, h = gc.height / dpr; if (!w) return;
    gg.setTransform(dpr, 0, 0, dpr, 0, 0); gg.clearRect(0, 0, w, h);
    var padL = 46, padR = 12, padT = 26, padB = 34, pw = w - padL - padR, ph = h - padT - padB;
    var t1 = Math.max(WIN, M.t), t0 = t1 - WIN;
    var pts = hist.filter(function (p) { return p.t >= t0; });
    var vmin = pts.length ? pts[0].v : 0, vmax = pts.length ? pts[pts.length - 1].v : 1;
    vmax = Math.max(vmax, vmin + 60);
    var X = function (t) { return padL + (t - t0) / WIN * pw; };
    var Y = function (v) { return padT + ph * (1 - (v - vmin) / (vmax - vmin)); };
    // bands: number of active mechanisms
    gg.font = '700 12px Heebo, sans-serif'; gg.textAlign = 'center'; gg.textBaseline = 'middle';
    for (var k = 0; k < pts.length - 1; k++) { gg.fillStyle = BAND[pts[k].n]; gg.fillRect(X(pts[k].t), padT, X(pts[k + 1].t) - X(pts[k].t) + 0.6, ph); }
    var segStart = 0;
    for (var k2 = 1; k2 <= pts.length; k2++) {
      if (k2 === pts.length || pts[k2].n !== pts[segStart].n) {
        var xa = X(pts[segStart].t), xb = X(pts[k2 - 1].t);
        if (xb - xa > 18) { gg.fillStyle = '#0f5e58'; gg.fillText(String(pts[segStart].n), (xa + xb) / 2, padT - 9); }
        segStart = k2;
      }
    }
    gg.strokeStyle = '#d8d1c5'; gg.lineWidth = 1; gg.strokeRect(padL, padT, pw, ph);
    // grid + y ticks
    gg.fillStyle = '#5d6370'; gg.font = '12px Heebo, sans-serif'; gg.textAlign = 'right';
    var step = niceStep((vmax - vmin) / 4);
    for (var v = Math.ceil(vmin / step) * step; v <= vmax; v += step) {
      var yy = Y(v); gg.strokeStyle = 'rgba(0,0,0,.06)'; gg.beginPath(); gg.moveTo(padL, yy); gg.lineTo(padL + pw, yy); gg.stroke();
      gg.fillText(String(Math.round(v)), padL - 5, yy);
    }
    // x ticks
    gg.textAlign = 'center'; gg.textBaseline = 'top';
    for (var tt = Math.ceil(t0 / 10) * 10; tt <= t1; tt += 10) { gg.fillText(String(tt), X(tt), padT + ph + 4); }
    gg.fillText('זמן (שניות)', padL + pw / 2, padT + ph + 18);
    gg.save(); gg.translate(12, padT + ph / 2); gg.rotate(-Math.PI / 2); gg.textBaseline = 'middle'; gg.fillText('נפח הדם שחזר ללב', 0, 0); gg.restore();
    // line
    if (pts.length > 1) {
      gg.strokeStyle = '#8e1f2f'; gg.lineWidth = 2.6; gg.lineJoin = 'round'; gg.beginPath();
      pts.forEach(function (p, i) { if (i === 0) gg.moveTo(X(p.t), Y(p.v)); else gg.lineTo(X(p.t), Y(p.v)); });
      gg.stroke();
      var lp = pts[pts.length - 1]; gg.fillStyle = '#8e1f2f'; gg.beginPath(); gg.arc(X(lp.t), Y(lp.v), 4.5, 0, 6.283); gg.fill();
    }
  }
  function niceStep(x) { var p = Math.pow(10, Math.floor(Math.log10(x))), m = x / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }

  // ---------- readout ----------
  var el = function (id) { return document.getElementById(id); };
  var rateHist = [];
  function updateReadout() {
    var n = nOn();
    el('nActive').textContent = n;
    el('rdMuscle').textContent = !M.on.muscle ? 'כבויה' : M.mus > 0.5 ? 'השריר מתכווץ ולוחץ על הוריד. המסתם שמעליו נפתח והמסתם שמתחתיו נסגר, והדם נדחף כלפי מעלה.' : 'השריר נרפה. הדם נופל מעט לאחור וסוגר את המסתם העליון, והוריד מתמלא מלמטה.';
    var insp = M.brPhase < 0.4;
    el('rdBreath').textContent = !M.on.breath ? 'כבויה' : insp ? 'שאיפה: הסרעפת יורדת. הלחץ בבית החזה יורד והלחץ בבטן עולה, והדם נע מהבטן אל בית החזה.' : 'נשיפה: הסרעפת עולה והלחצים חוזרים לערכם.';
    el('rdHeart').textContent = !M.on.heart ? 'כבויה' : M.raRelax > 0.15 ? 'העלייה הימנית נרפית (דיאסטולה). הלחץ בה נמוך, והדם נכנס אליה מהוריד הנבוב.' : M.hPhase < 0.14 ? 'העלייה הימנית מתכווצת (סיסטולה) ומעבירה דם לחדר הימני.' : 'הלב בין פעימות.';
    ['muscle', 'breath', 'heart'].forEach(function (k) { el('row-' + k).classList.toggle('on', M.on[k]); });
    var vs = '';
    for (var i = 0; i < 4; i++) { var bad = M.leaky && i === 2, op = M.a[i] > 0.5; vs += '<span class="vb ' + (bad ? 'bad' : op ? 'open' : 'shut') + '">' + (i + 1) + ' ' + (bad ? 'פגום' : op ? 'פתוח' : 'סגור') + '</span>'; }
    el('valveRow').innerHTML = vs;
    rateHist.push({ t: M.t, v: M.returned }); while (rateHist.length > 2 && rateHist[0].t < M.t - 4) rateHist.shift();
    var r0 = rateHist[0], r1 = rateHist[rateHist.length - 1], rateNow = r1.t > r0.t + 0.5 ? (r1.v - r0.v) / (r1.t - r0.t) : 0;
    rateNow = Math.max(0, rateNow); el('rateNum').textContent = rateNow.toFixed(1);
    el('rateBar').style.width = clamp(rateNow / 14 * 100, 2, 100).toFixed(0) + '%';
    el('leakNote').hidden = !M.leaky;
  }

  // ---------- loop ----------
  var acc = 0, roAcc = 0;
  function frame(ts) {
    var dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (running && dt > 0) {
      var d = dt * rate; M.step(d); stepCells(d);
      acc += d; if (acc > 0.1) { acc = 0; sample(); drawGraph(); }
      roAcc += dt; if (roAcc > 0.15) { roAcc = 0; updateReadout(); }
      draw();
    }
    requestAnimationFrame(frame);
  }

  // ---------- controls ----------
  function setMech(k, on) {
    M.on[k] = on; var b = el('b-' + k); b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.classList.toggle('on', on);
    updateReadout(); if (!running) { draw(); drawGraph(); }
  }
  ['muscle', 'breath', 'heart'].forEach(function (k) { el('b-' + k).addEventListener('click', function () { setMech(k, !M.on[k]); }); });
  el('btnAll').addEventListener('click', function () { var all = M.on.muscle && M.on.breath && M.on.heart; ['muscle', 'breath', 'heart'].forEach(function (k) { setMech(k, !all); }); });
  function setRunning(on) { running = on; el('btnPlay').textContent = on ? '⏸ השהיה' : '▶ המשך'; el('btnPlay').setAttribute('aria-pressed', on ? 'false' : 'true'); }
  el('btnPlay').addEventListener('click', function () { setRunning(!running); });
  el('btnReset').addEventListener('click', function () { M.on = { muscle: false, breath: false, heart: false }; M.leaky = false; M.reset(); M.step(25); M.t = 0; M.returned = 0; hist = []; rateHist = []; initCells(); ['muscle', 'breath', 'heart'].forEach(function (k) { setMech(k, false); }); el('leaky').checked = false; M.leaky = false; sample(); updateReadout(); draw(); drawGraph(); });
  el('leaky').addEventListener('change', function (e) { M.leaky = e.target.checked; updateReadout(); if (!running) draw(); });
  el('rate').addEventListener('input', function (e) { rate = parseFloat(e.target.value); el('rateOut').textContent = '×' + rate; });
  var simPanel = document.querySelector('.sim-panel');
  el('btnFull').addEventListener('click', function () { if (document.fullscreenElement) document.exitFullscreen(); else if (simPanel.requestFullscreen) simPanel.requestFullscreen(); });
  document.addEventListener('fullscreenchange', function () { setTimeout(resize, 60); });
  window.addEventListener('resize', function () { clearTimeout(resize.t); resize.t = setTimeout(resize, 120); });

  // ---------- questions (saved in this browser) ----------
  var KEY = 'zrima-chad-kivunit:';
  var saveState = el('saveState'), saveTimer = null;
  Array.prototype.forEach.call(document.querySelectorAll('.qlist textarea'), function (ta) {
    try { ta.value = localStorage.getItem(KEY + ta.dataset.key) || ''; } catch (e) {}
    ta.addEventListener('input', function () {
      try { localStorage.setItem(KEY + ta.dataset.key, ta.value); saveState.textContent = 'נשמר ✓'; } catch (e) { saveState.textContent = 'לא ניתן לשמור בדפדפן הזה'; }
      clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveState.textContent = ''; }, 1800);
    });
  });
  el('btnCopy').addEventListener('click', function () {
    var parts = ['שאלות לחשיבה · זרימה חד כיוונית בוורידים', ''];
    Array.prototype.forEach.call(document.querySelectorAll('.qlist li'), function (li, i) {
      parts.push((i + 1) + '. ' + li.querySelector('label').textContent.trim());
      parts.push('תשובה: ' + (li.querySelector('textarea').value.trim() || '(עדיין אין תשובה)')); parts.push('');
    });
    var text = parts.join('\n');
    function done() { saveState.textContent = 'הועתק ✓'; clearTimeout(saveTimer); saveTimer = setTimeout(function () { saveState.textContent = ''; }, 2000); }
    function fallback() { var t = document.createElement('textarea'); t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); done(); } catch (e) {} document.body.removeChild(t); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback); else fallback();
  });

  // ---------- start ----------
  M.step(25); M.t = 0; M.returned = 0;
  VREF = M.vol.slice();
  if (reduce) setRunning(false);
  window.__sim = M;
  resize(); sample(); updateReadout();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { draw(); drawGraph(); });
  requestAnimationFrame(frame);
})();
