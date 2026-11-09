// שיעור 6 · כלי הדם: נתונים משותפים ואיורים (מצגת וסימולציה)
// ערכים מקורבים לפי Guyton & Hall: שטח חתך כולל (סמ"ר); מהירות ממוצעת = 83 סמ"ק לשנייה (5 ליטר בדקה) ÷ שטח
const V = (() => {
  const RED = '#D7263D', BLUE = '#2457C5', INK = '#13233A', MUT = '#5E6E82', LINE = '#DCE3EA', GOLD = '#F2B705', BLOOD = '#B5162B', WALL = '#E7C7C3', MUSC = '#C9707A';
  const F = 'font-family="Assistant,Arial,sans-serif"';
  const SEG = [
    { k: 'aorta', n: 'אבי העורקים', short: 'אבי העורקים', area: 2.5, d: '2.5 ס״מ', count: '1', wall: 'עבה מאוד, הרבה סיבים אלסטיים ושריר חלק', p: [120, 80], pm: [100, 98], side: 'a' },
    { k: 'art', n: 'עורקים', short: 'עורקים', area: 20, d: '1–10 מ״מ', count: 'מאות', wall: 'עבה, שריר חלק וסיבים אלסטיים', p: [118, 78], pm: [98, 93], side: 'a' },
    { k: 'arl', n: 'עורקיקים', short: 'עורקיקים', area: 40, d: 'כ־0.03 מ״מ', count: 'מיליונים', wall: 'שכבת שריר חלק יחסית עבה, שמתכווצת ונרפית', p: [90, 35], pm: [93, 35], side: 'a' },
    { k: 'cap', n: 'נימים', short: 'נימים', area: 2500, d: 'כ־0.008 מ״מ (כמו תא דם אדום)', count: 'מיליארדים', wall: 'שכבת תאים אחת בלבד', p: [35, 15], pm: [35, 15], side: 'c' },
    { k: 'vnl', n: 'ורידונים', short: 'ורידונים', area: 250, d: 'כ־0.02 מ״מ', count: 'עשרות מיליונים', wall: 'דקה מאוד', p: [15, 11], pm: [15, 11], side: 'v' },
    { k: 'vein', n: 'ורידים', short: 'ורידים', area: 80, d: '1–10 מ״מ', count: 'מאות', wall: 'דקה, מעט שריר, מסתמים', p: [11, 6], pm: [11, 6], side: 'v' },
    { k: 'vc', n: 'ורידים נבובים', short: 'ורידים נבובים', area: 8, d: 'כ־3 ס״מ', count: '2', wall: 'דקה יחסית לקוטר, חלל רחב', p: [6, 2], pm: [6, 2], side: 'v' }
  ];
  SEG.forEach(s => s.v = 83 / s.area); // ס"מ לשנייה
  const fmtV = v => v >= 1 ? `${v.toFixed(v >= 10 ? 0 : 1)} ס״מ/שנ׳` : `${(v * 10).toFixed(v * 10 >= 1 ? 1 : 2)} מ״מ/שנ׳`;
  const fmtA = a => `${a.toLocaleString('en-US')} סמ״ר`;

  // לחץ לאורך המערכת: s בין 0 (תחילת אבי העורקים) ל־7 (סוף הורידים הנבובים)
  const MK = [100, 98, 93, 35, 15, 11, 6, 2], AK = [20, 20, 17, 2, 0, 0, 0, 0];
  const lerp = (arr, s) => { const i = Math.min(6, Math.floor(s)), t = s - i; return arr[i] + (arr[i + 1] - arr[i]) * t };
  const pMean = s => lerp(MK, s), pAmp = s => lerp(AK, s);

  // ---------- גרף לחץ דם (ציר הזמן מימין לשמאל, כמו בבגרות) ----------
  function pressure(o = {}) {
    const W = 900, H = 400, x0 = 800, x1 = 40, y0 = 320, y1 = 30, sx = s => x0 - (x0 - x1) * s / 7, sy = p => y0 - (y0 - y1) * p / 130;
    let osc = '', top = '', bot = '';
    for (let s = 0; s <= 7.0001; s += 0.01) { const m = pMean(s), a = pAmp(s); osc += (s ? 'L' : 'M') + sx(s).toFixed(1) + ',' + sy(m + a * Math.sin(s * 6 * Math.PI)).toFixed(1); top += (s ? 'L' : 'M') + sx(s).toFixed(1) + ',' + sy(m + a).toFixed(1); bot += (s ? 'L' : 'M') + sx(s).toFixed(1) + ',' + sy(m - a).toFixed(1) }
    const grid = [0, 20, 40, 60, 80, 100, 120].map(p => `<line x1="${x1}" x2="${x0}" y1="${sy(p)}" y2="${sy(p)}" stroke="${LINE}"/><text x="${x0 + 10}" y="${sy(p) + 5}" font-size="15" fill="${MUT}" text-anchor="end">${p}</text>`).join('');
    const labs = SEG.map((g, i) => `<line x1="${sx(i)}" x2="${sx(i)}" y1="${y1}" y2="${y0 + 6}" stroke="${LINE}" stroke-dasharray="3 4"/><text x="${(sx(i) + sx(i + 1)) / 2}" y="${y0 + 26}" font-size="15" font-weight="700" fill="${INK}" text-anchor="middle">${g.short}</text>`).join('');
    const hl = o.at != null ? `<rect x="${sx(o.at + 1)}" y="${y1}" width="${sx(o.at) - sx(o.at + 1)}" height="${y0 - y1}" fill="${GOLD}" opacity=".18"/>` : '';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="גרף: לחץ הדם בכלי הדם השונים במחזור הגדול" ${F}>
      ${hl}${grid}${labs}
      <line x1="${x0}" x2="${x0}" y1="${y1 - 10}" y2="${y0}" stroke="${INK}" stroke-width="2"/><line x1="${x1}" x2="${x0}" y1="${y0}" y2="${y0}" stroke="${INK}" stroke-width="2"/>
      <text x="${x0 + 20}" y="${y1 - 16}" font-size="15" font-weight="800" fill="${INK}" text-anchor="middle">מ״מ כספית</text>
      <path d="${osc}" fill="none" stroke="${MUT}" stroke-width="1.6" opacity=".55"/>
      <path d="${top}" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/>
      <path d="${bot}" fill="none" stroke="${BLUE}" stroke-width="4" stroke-dasharray="10 6" stroke-linecap="round"/>
      <text x="${W / 2}" y="${H - 8}" font-size="15" font-weight="700" fill="${MUT}" text-anchor="middle">← כיוון זרימת הדם</text>
      <g transform="translate(60,${y1 + 6})"><rect width="210" height="58" rx="10" fill="#fff" stroke="${LINE}"/>
        <line x1="120" x2="160" y1="20" y2="20" stroke="${RED}" stroke-width="4"/><text x="112" y="25" font-size="15" fill="${INK}" text-anchor="start">לחץ סיסטולי</text>
        <line x1="120" x2="160" y1="42" y2="42" stroke="${BLUE}" stroke-width="4" stroke-dasharray="8 5"/><text x="112" y="47" font-size="15" fill="${INK}" text-anchor="start">לחץ דיאסטולי</text></g>
    </svg>`;
  }

  // ---------- שטח חתך כולל ומהירות ----------
  function speed(o = {}) {
    const W = 900, H = 470, x0 = 800, x1 = 40, w = (x0 - x1) / 7;
    const panel = (y, h, vals, max, col, title, fmt) => {
      let s = `<text x="${x1}" y="${y - 10}" font-size="18" font-weight="800" fill="${col}" text-anchor="end">${title}</text><line x1="${x1}" x2="${x0}" y1="${y + h}" y2="${y + h}" stroke="${INK}" stroke-width="2"/>`;
      vals.forEach((v, i) => { const bh = Math.max(2, h * v / max), x = x0 - w * (i + 1) + w * .18, on = o.at === i;
        s += `<rect x="${x}" y="${y + h - bh}" width="${w * .64}" height="${bh}" rx="4" fill="${col}" opacity="${o.at != null && !on ? .35 : 1}"/><text x="${x + w * .32}" y="${y + h - bh - 6}" font-size="14" font-weight="700" fill="${INK}" text-anchor="middle">${fmt(v)}</text>` });
      return s;
    };
    const labs = SEG.map((g, i) => `<text x="${x0 - w * (i + .5)}" y="${H - 10}" font-size="15" font-weight="700" fill="${INK}" text-anchor="middle">${g.short}</text>`).join('');
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="גרפים: שטח החתך הכולל ומהירות הזרימה בכל סוג של כלי דם" ${F}>
      ${panel(40, 150, SEG.map(s => s.area), 2500, '#C99A00', 'שטח החתך הכולל (סמ״ר)', v => v.toLocaleString('en-US'))}
      ${panel(250, 150, SEG.map(s => s.v), 33.2, RED, 'מהירות זרימה ממוצעת (ס״מ בשנייה)', v => v >= 1 ? v.toFixed(v >= 10 ? 0 : 1) : v.toFixed(v < .1 ? 3 : 2))}
      ${labs}</svg>`;
  }

  // ---------- עץ כלי הדם: מתפצל ומתאחד ----------
  function tree(o = {}) {
    const W = 860, H = o.labels ? 330 : 280, cy = 130;
    let s = '';
    const lv = [[860, 760, 1, 26], [760, 640, 2, 12], [640, 520, 4, 6], [520, 420, 16, 1.6]]; // x מימין, x לשמאל, מספר, עובי
    const ys = n => Array.from({ length: n }, (_, i) => cy + (i - (n - 1) / 2) * (220 / Math.max(n, 2)) * (n === 1 ? 0 : 1));
    // צד העורקים
    for (let l = 0; l < lv.length; l++) { const [xa, xb, n, t] = lv[l], Y = ys(n), P = l ? ys(lv[l - 1][2]) : [cy];
      Y.forEach((y, i) => { const py = P[Math.floor(i * P.length / n)]; s += `<path d="M${xa},${py} C${(xa + xb) / 2 + 20},${py} ${(xa + xb) / 2 - 20},${y} ${xb},${y}" fill="none" stroke="${l === 3 ? '#C76B7A' : RED}" stroke-width="${t}" stroke-linecap="round"/>` }) }
    // צד הוורידים (מראה)
    const mx = x => 860 - x - 0; // 0..860 ↔ שמאל
    for (let l = 0; l < lv.length; l++) { const [xa, xb, n, t] = lv[l], Y = ys(n), P = l ? ys(lv[l - 1][2]) : [cy];
      Y.forEach((y, i) => { const py = P[Math.floor(i * P.length / n)]; const A = mx(xa) , B = mx(xb); s += `<path d="M${A},${py} C${(A + B) / 2 - 20},${py} ${(A + B) / 2 + 20},${y} ${B},${y}" fill="none" stroke="${l === 3 ? '#7C83C9' : BLUE}" stroke-width="${l === 0 ? 30 : t * 1.4}" stroke-linecap="round"/>` }) }
    // נימים במרכז
    ys(16).forEach(y => s += `<line x1="420" x2="440" y1="${y}" y2="${y}" stroke="${GOLD}" stroke-width="2.4"/>`);
    let lab = '';
    if (o.labels) { const L = [[810, 'אבי העורקים'], [700, 'עורקים'], [580, 'עורקיקים'], [430, 'נימים'], [280, 'ורידונים'], [160, 'ורידים'], [50, 'ורידים נבובים']];
      lab = L.map(([x, t]) => `<text x="${x}" y="300" font-size="17" font-weight="800" fill="${INK}" text-anchor="middle">${t}</text>`).join('') + `<text x="430" y="324" font-size="14" fill="${MUT}" text-anchor="middle">← כיוון זרימת הדם (במחזור הגדול)</text>`; }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="כלי הדם מתפצלים מאבי העורקים לנימים ומתאחדים לוורידים" ${F}>${s}${lab}</svg>`;
  }

  // ---------- חתכי רוחב ----------
  function cross() {
    const art = `<g transform="translate(720,150)"><circle r="110" fill="#F3E3E0" stroke="${MUT}" stroke-width="2"/><circle r="92" fill="${MUSC}"/>
      ${Array.from({ length: 4 }, (_, i) => `<circle r="${86 - i * 9}" fill="none" stroke="#F7E7A8" stroke-width="2.6" stroke-dasharray="14 6"/>`).join('')}
      <circle r="48" fill="#F7ECE9"/><circle r="44" fill="${BLOOD}"/>
      <text y="150" font-size="24" font-weight="800" fill="${INK}" text-anchor="middle">עורק</text><text y="176" font-size="16" fill="${MUT}" text-anchor="middle">דופן עבה, חלל צר יחסית</text></g>`;
    const vein = `<g transform="translate(150,150)"><ellipse rx="118" ry="96" fill="#F3E3E0" stroke="${MUT}" stroke-width="2"/><ellipse rx="104" ry="82" fill="${MUSC}" opacity=".6"/>
      <ellipse rx="94" ry="72" fill="#F7ECE9"/><ellipse rx="90" ry="68" fill="${BLOOD}"/>
      <path d="M-60,-30 Q0,30 60,-30" fill="none" stroke="#F7ECE9" stroke-width="7" stroke-linecap="round"/>
      <text y="150" font-size="24" font-weight="800" fill="${INK}" text-anchor="middle">וריד</text><text y="176" font-size="16" fill="${MUT}" text-anchor="middle">דופן דקה, חלל רחב, מסתם</text></g>`;
    const cap = `<g transform="translate(435,150)"><circle r="70" fill="none" stroke="${LINE}" stroke-dasharray="4 5"/>
      <path d="M0,-46 A46,46 0 0 1 40,23" fill="none" stroke="${WALL}" stroke-width="12"/><path d="M40,23 A46,46 0 0 1 -40,23" fill="none" stroke="#E2B6B0" stroke-width="12"/><path d="M-40,23 A46,46 0 0 1 0,-46" fill="none" stroke="${WALL}" stroke-width="12"/>
      <ellipse cx="34" cy="-30" rx="9" ry="5" fill="#8A4B57"/><ellipse cx="-38" cy="-24" rx="9" ry="5" fill="#8A4B57"/><ellipse cx="0" cy="48" rx="9" ry="5" fill="#8A4B57"/>
      <circle r="34" fill="${BLOOD}"/><circle r="15" fill="#9E1B32"/>
      <text y="150" font-size="24" font-weight="800" fill="${INK}" text-anchor="middle">נים</text><text y="176" font-size="16" fill="${MUT}" text-anchor="middle">שכבת תאים אחת, תא דם אדום אחד</text>
      <text y="-82" font-size="14" fill="${MUT}" text-anchor="middle">(מוגדל מאוד)</text></g>`;
    const key = `<g transform="translate(440,352)" font-size="15" fill="${INK}">${[[MUSC,'שריר חלק',150],['#F7E7A8','סיבים אלסטיים',0],['#F7ECE9','תאי דופן פנימיים',-170]].map(([c,t,x])=>`<rect x="${x + 50}" y="-12" width="16" height="16" fill="${c}" stroke="${MUT}"/><text x="${x + 42}" y="1" text-anchor="start">${t}</text>`).join('')}</g>`;
    return `<svg viewBox="0 0 880 370" role="img" aria-label="חתכי רוחב של וריד, נים ועורק" ${F}>${vein}${cap}${art}${key}</svg>`;
  }

  // ---------- מד לחץ ----------
  function cuff() {
    const cx = 160, cy = 160, R = 120, ang = p => Math.PI * (0.75 + 1.5 * p / 300);
    let t = '';
    for (let p = 0; p <= 300; p += 20) { const a = ang(p), L = p % 40 ? 10 : 18; t += `<line x1="${cx + Math.cos(a) * R}" y1="${cy + Math.sin(a) * R}" x2="${cx + Math.cos(a) * (R - L)}" y2="${cy + Math.sin(a) * (R - L)}" stroke="${INK}" stroke-width="2"/>`; if (!(p % 40)) t += `<text x="${cx + Math.cos(a) * (R - 34)}" y="${cy + Math.sin(a) * (R - 34) + 5}" font-size="15" text-anchor="middle" fill="${INK}">${p}</text>` }
    const arc = (p1, p2, c) => { const a = ang(p1), b = ang(p2); return `<path d="M${cx + Math.cos(a) * (R + 8)},${cy + Math.sin(a) * (R + 8)} A${R + 8},${R + 8} 0 0 1 ${cx + Math.cos(b) * (R + 8)},${cy + Math.sin(b) * (R + 8)}" fill="none" stroke="${c}" stroke-width="8"/>` };
    const n = ang(120);
    return `<svg viewBox="0 0 320 330" role="img" aria-label="מד לחץ דם" style="max-width:320px" ${F}><circle cx="${cx}" cy="${cy}" r="${R + 18}" fill="#fff" stroke="${INK}" stroke-width="4"/>${arc(80, 120, GOLD)}${t}
      <line x1="${cx}" y1="${cy}" x2="${cx + Math.cos(n) * (R - 20)}" y2="${cy + Math.sin(n) * (R - 20)}" stroke="${RED}" stroke-width="4" stroke-linecap="round"><animateTransform attributeName="transform" type="rotate" values="0 ${cx} ${cy};-36 ${cx} ${cy};0 ${cx} ${cy}" dur="1s" repeatCount="indefinite"/></line>
      <circle cx="${cx}" cy="${cy}" r="8" fill="${INK}"/><text x="${cx}" y="${cy + 60}" font-size="16" font-weight="800" text-anchor="middle" fill="${MUT}">מ״מ כספית</text>
      <text x="${cx}" y="318" font-size="15" text-anchor="middle" fill="${MUT}">המחוג נע בין 80 ל־120 בכל פעימה</text></svg>`;
  }

  // ---------- אבי העורקים האלסטי ----------
  function elastic() {
    const panel = (x, title, wide, sub) => `<g transform="translate(${x},0)"><text x="130" y="30" font-size="21" font-weight="800" text-anchor="middle" fill="${INK}">${title}</text>
      <rect x="0" y="70" width="44" height="120" rx="14" fill="${MUSC}"/><text x="22" y="215" font-size="14" text-anchor="middle" fill="${MUT}">חדר</text>
      <path d="M44,${130 - (wide ? 46 : 30)} C110,${130 - (wide ? 62 : 30)} 190,${130 - (wide ? 62 : 30)} 260,${130 - (wide ? 46 : 30)} L260,${130 + (wide ? 46 : 30)} C190,${130 + (wide ? 62 : 30)} 110,${130 + (wide ? 62 : 30)} 44,${130 + (wide ? 46 : 30)} Z" fill="${BLOOD}" stroke="#F7E7A8" stroke-width="9"/>
      ${wide ? `<path d="M60,110 L60,150" stroke="#fff" stroke-width="3"/><path d="M80,130 h120" stroke="#fff" stroke-width="5" marker-end="url(#ah)"/>${[100, 170].map(xx => `<path d="M${xx},${130 - 70} v-18 M${xx},${130 + 70} v18" stroke="${INK}" stroke-width="3" marker-end="url(#ah2)"/>`).join('')}`
        : `<path d="M52,108 L66,130 L52,152" fill="none" stroke="#fff" stroke-width="4"/><path d="M110,130 h110" stroke="#fff" stroke-width="5" marker-end="url(#ah)"/>${[110, 180].map(xx => `<path d="M${xx},${130 - 58} v16 M${xx},${130 + 58} v-16" stroke="${INK}" stroke-width="3" marker-end="url(#ah2)"/>`).join('')}`}
      <text x="130" y="250" font-size="16" text-anchor="middle" fill="${INK}">${sub}</text></g>`;
    return `<svg viewBox="0 0 600 270" role="img" aria-label="אבי העורקים בסיסטולה ובדיאסטולה" ${F}><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#fff"/></marker><marker id="ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="${INK}"/></marker></defs>
      ${panel(320, 'סיסטולה', true, 'הדופן נמתחת · לחץ 120')}${panel(10, 'דיאסטולה', false, 'הדופן חוזרת ודוחסת · לחץ 80')}</svg>`;
  }

  // ---------- צינור עם אגודל מול צינור מתפצל ----------
  function hose() {
    const arr = (x, y, len) => `<path d="M${x},${y} h${-len}" stroke="${BLUE}" stroke-width="4" marker-end="url(#hb)"/>`;
    let pipes = '';
    for (let i = 0; i < 8; i++) { const y = 200 + i * 14; pipes += `<path d="M250,250 C200,250 200,${y} 150,${y} L60,${y}" fill="none" stroke="${MUT}" stroke-width="7"/>` + arr(56, y, 14) }
    return `<svg viewBox="0 0 400 330" role="img" aria-label="צינור שנלחץ באגודל מול צינור שמתפצל לצינורות רבים" ${F}><defs><marker id="hb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="${BLUE}"/></marker></defs>
      <text x="200" y="26" font-size="17" font-weight="800" text-anchor="middle" fill="${INK}">צינור אחד שהוצר: מהר</text>
      <path d="M390,70 H200 L170,64 V76 L200,70" fill="none" stroke="${MUT}" stroke-width="22" stroke-linejoin="round"/><circle cx="196" cy="56" r="14" fill="${WALL}" stroke="${MUT}"/>
      ${arr(160, 70, 120)}
      <text x="200" y="168" font-size="17" font-weight="800" text-anchor="middle" fill="${INK}">צינור שמתפצל להרבה צינורות: לאט</text>
      <path d="M390,250 H250" stroke="${MUT}" stroke-width="22"/>${pipes}</svg>`;
  }

  // ---------- מסתמים בווריד ומשאבת השרירים ----------
  function valve() {
    const seg = (x, squeeze, title) => {
      const vw = squeeze ? 22 : 34, mus = squeeze ? 34 : 22;
      const v = (y, open) => open ? `<path d="M${x - vw},${y} L${x - 8},${y - 26} M${x + vw},${y} L${x + 8},${y - 26}" stroke="#F7ECE9" stroke-width="5" stroke-linecap="round"/>` : `<path d="M${x - vw},${y} Q${x - vw / 2},${y - 18} ${x},${y - 4} Q${x + vw / 2},${y - 18} ${x + vw},${y}" fill="none" stroke="#F7ECE9" stroke-width="5" stroke-linecap="round"/>`;
      return `<g><text x="${x}" y="24" font-size="17" font-weight="800" text-anchor="middle" fill="${INK}">${title}</text>
        <ellipse cx="${x - vw - mus}" cy="190" rx="${mus}" ry="90" fill="${MUSC}" opacity=".85"/><ellipse cx="${x + vw + mus}" cy="190" rx="${mus}" ry="90" fill="${MUSC}" opacity=".85"/>
        <rect x="${x - vw}" y="50" width="${vw * 2}" height="290" rx="${vw}" fill="${BLOOD}" stroke="${MUT}" stroke-width="3"/>
        ${v(90, squeeze)}${v(300, !squeeze)}
        ${squeeze ? `<path d="M${x},230 v-150" stroke="#fff" stroke-width="4" marker-end="url(#vu)"/>` : `<path d="M${x},340 v-30" stroke="#fff" stroke-width="4" marker-end="url(#vu)"/>`}
        <text x="${x}" y="370" font-size="15" text-anchor="middle" fill="${INK}">${squeeze ? 'מסתם עליון פתוח · תחתון סגור' : 'מסתם עליון סגור · דם נכנס מלמטה'}</text></g>`;
    };
    return `<svg viewBox="0 0 440 390" role="img" aria-label="וריד ברגל: מסתמים ומשאבת השרירים" ${F}><defs><marker id="vu" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0,0 L10,5 L0,10z" fill="#fff"/></marker></defs>
      <text x="220" y="46" font-size="14" text-anchor="middle" fill="${MUT}">↑ אל הלב</text>${seg(320, true, 'השריר מתכווץ')}${seg(110, false, 'השריר נרפה')}</svg>`;
  }

  const FIG = { pressure, speed, tree, path: () => tree({ labels: true }), cross, cuff, elastic, hose, valve };
  return { SEG, fmtV, fmtA, pMean, pAmp, fig: (n, o) => (FIG[n] ? FIG[n](o) : '') };
})();
