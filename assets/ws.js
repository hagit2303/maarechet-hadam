/* מנוע דפי עבודה עם בדיקה (בפורמט דף העבודה של האופרון):
   ניסיון אחד לכל שאלה, משוב והסבר מיד, ציון בסוף, קובץ PDF למורה עם קוד אימות.
   שאלות פתוחות: בדיקה משולבת. התלמיד מסמן לפי המחוון מה כלול בתשובה, והדף מחפש בתשובה מילות מפתח לכל סעיף במחוון.
   סעיף נספר רק אם סומן וגם נמצאו בו מילות המפתח. סומן ולא נמצא: מסומן "לבדיקת המורה" בדוח.
   הכול רץ בדפדפן. אין שרת, אין שליחת מידע לשום מקום. */
(function () {
  const W = window.WS, Q = W.Q, KEY = 'hadam-ws-' + W.id, $ = id => document.getElementById(id);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plain = h => String(h).replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  const norm = s => String(s).toLowerCase().replace(/[֑-ׇ]/g, '').replace(/₂/g, '2').replace(/[״"׳'`]/g, '').replace(/[-־–]/g, ' ').replace(/\s+/g, ' ');
  const TYPE = { mc: 'בחירה', tf: 'נכון / לא נכון', match: 'התאמה', order: 'סידור', open: 'שאלה פתוחה' };
  let S = { who: '', ans: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s && s.ans) S = s } catch (e) { }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)) } catch (e) { } };

  /* ---------- ציון לכל סוג ---------- */
  function grade(q, r) {
    if (q.type === 'mc') { const ok = +r === q.ans; return { got: ok ? q.pts : 0, d: [ok] } }
    if (q.type === 'tf') { const per = q.pts / q.rows.length, d = q.rows.map((row, k) => r[k] === (row[1] ? 'T' : 'F')); return { got: Math.round(d.filter(Boolean).length * per), d } }
    if (q.type === 'match') { const per = q.pts / q.rows.length, d = q.rows.map((row, k) => r[k] === row[1]); return { got: Math.round(d.filter(Boolean).length * per), d } }
    if (q.type === 'order') { const d = q.steps.map((s, k) => r[k] === k); return { got: Math.round(d.filter(Boolean).length / q.steps.length * q.pts), d } }
    if (q.type === 'open') {
      const t = norm(r.text || ''), d = q.crit.map((c, k) => {
        const found = c.kw.every(g => new RegExp(norm(g)).test(t)), tick = !!(r.ticks || [])[k];
        return tick && found ? 'ok' : tick ? 'flag' : 'no';
      });
      return { got: d.reduce((s, x, k) => s + (x === 'ok' ? q.crit[k].pts : 0), 0), d };
    }
  }
  const done = i => { const a = S.ans[i]; return a && (Q[i].type !== 'open' || a.stage === 2) };

  /* ---------- בניית השאלות ---------- */
  function body(q, i) {
    if (q.type === 'mc') return `<div class="opts">${shuffle(q.opts.map((o, k) => [o, k])).map(([o, k]) => `<label data-k="${k}"><input type="radio" name="m${i}" value="${k}"><span>${o}</span></label>`).join('')}</div>`;
    if (q.type === 'tf') return `<div class="tf">${q.rows.map((row, k) => `<div class="r" data-k="${k}"><span>${row[0]}</span><span class="ch"><label><input type="radio" name="t${i}_${k}" value="T">נכון</label><label><input type="radio" name="t${i}_${k}" value="F">לא נכון</label></span></div>`).join('')}</div>`;
    if (q.type === 'match') { const all = q.rows.map(r => r[1]); return `<div class="mt">${q.rows.map((row, k) => `<div class="r" data-k="${k}"><b>${row[0]}</b><select aria-label="${esc(plain(row[0]))}"><option value="">בחרו…</option>${shuffle(all).map(o => `<option>${esc(o)}</option>`).join('')}</select></div>`).join('')}</div>` }
    if (q.type === 'order') return `<p class="hint">השלבים המעורבבים:</p><div class="pool">${shuffle(q.steps.map((s, k) => [s, k])).map(([s, k]) => `<button type="button" class="chip" data-k="${k}">${s}</button>`).join('')}</div><p class="hint">הסדר שלכם:</p><div class="seq"></div>`;
    if (q.type === 'open') return `<textarea aria-label="התשובה שלכם" placeholder="${q.ph || 'כתבו תשובה מלאה: קביעה, ואחריה הסבר.'}"></textarea>
      <div class="rub" hidden><p><b>📋 המחוון:</b> סמנו בכנות מה כלול בתשובה שכתבתם. הדף בודק גם את המילים בתשובה.</p>
      ${q.crit.map((c, k) => `<label><input type="checkbox" data-k="${k}"><span>${c.t} <span class="hint">(${c.pts} נק׳)</span></span></label>`).join('')}</div>`;
  }
  function card(q, i) {
    return `<section class="card" id="q${i}"><div class="qh"><span class="qn">שאלה ${i + 1}</span><span class="qt">${TYPE[q.type]}</span><span class="pts">${q.pts} נקודות</span></div>
     <div class="stem">${q.stem}</div>${q.fig ? `<div class="fig">${q.fig}</div>` : ''}${body(q, i)}
     <div class="msg"></div><button class="ck" type="button">${q.type === 'open' ? 'שליחת התשובה' : 'בדיקה'}</button><div class="res"></div>
     ${q.src ? `<p class="src">מקור: ${q.src}</p>` : ''}</section>`;
  }

  /* ---------- איסוף תשובה ---------- */
  function collect(q, el) {
    if (q.type === 'mc') { const c = el.querySelector('input:checked'); return c ? +c.value : null }
    if (q.type === 'tf') { const r = q.rows.map((_, k) => { const c = el.querySelector(`.r[data-k="${k}"] input:checked`); return c ? c.value : null }); return r.includes(null) ? null : r }
    if (q.type === 'match') { const r = [...el.querySelectorAll('.mt select')].map(s => s.value); return r.includes('') ? null : r }
    if (q.type === 'order') { const r = [...el.querySelectorAll('.seq .chip')].map(c => +c.dataset.k); return r.length === q.steps.length ? r : null }
  }

  /* ---------- הצגת תוצאה ונעילה ---------- */
  function badge(el, got, max) { const h = el.querySelector('.qh'); h.querySelector('.pts').outerHTML = `<span class="got ${got === max ? 'full' : got ? 'part' : 'zero'}">${got} / ${max}</span>` }
  function show(i) {
    const q = Q[i], el = $('q' + i), a = S.ans[i], res = el.querySelector('.res'), btn = el.querySelector('.ck');
    if (q.type === 'open') {
      const ta = el.querySelector('textarea'); ta.value = a.text; ta.readOnly = true;
      const rub = el.querySelector('.rub'); rub.hidden = false;
      if (a.stage === 1) { btn.textContent = 'סיום הבדיקה לפי המחוון'; return }
      rub.querySelectorAll('input').forEach((c, k) => { c.checked = !!a.ticks[k]; c.disabled = true });
      const g = grade(q, a);
      res.innerHTML = `<div class="rub" style="background:var(--soft)"><b>תוצאת הבדיקה:</b>${q.crit.map((c, k) => `<div class="cr ${g.d[k]}"><span class="ic">${g.d[k] === 'ok' ? '✓' : g.d[k] === 'flag' ? '⚑' : '✗'}</span><span>${c.t}${g.d[k] === 'flag' ? '<br><span class="hint">סימנתם שזה כלול, אבל המילים המרכזיות לא נמצאו בתשובה. הסעיף יופיע בדוח לבדיקת המורה.</span>' : ''}</span></div>`).join('')}</div>
        <div class="model"><b>✏️ תשובה לדוגמה:</b> ${q.model}</div>`;
      btn.remove(); el.classList.add('locked'); badge(el, g.got, q.pts); return;
    }
    const r = a.r, g = grade(q, r);
    if (q.type === 'mc') {
      el.querySelectorAll('.opts label').forEach(l => { const k = +l.dataset.k; l.querySelector('input').checked = k === r; if (k === q.ans) l.classList.add('right'); else if (k === r) l.classList.add('wrong') });
      res.innerHTML = `<div class="fb ${g.d[0] ? 'ok' : 'no'}">${g.d[0] ? '✓ נכון! ' : '✗ לא מדויק. '}${q.why}</div>`;
    }
    if (q.type === 'tf') q.rows.forEach((row, k) => {
      const rr = el.querySelector(`.r[data-k="${k}"]`); rr.querySelector(`input[value="${r[k]}"]`).checked = true; rr.classList.add(g.d[k] ? 'right' : 'wrong');
      rr.insertAdjacentHTML('beforeend', `<span class="why">${g.d[k] ? '✓' : '✗'} ${row[1] ? '<b>נכון.</b>' : '<b>לא נכון.</b>'} ${row[2]}</span>`);
    });
    if (q.type === 'match') q.rows.forEach((row, k) => {
      const rr = el.querySelectorAll('.mt .r')[k]; rr.querySelector('select').value = r[k]; rr.classList.add(g.d[k] ? 'right' : 'wrong');
      if (!g.d[k]) rr.insertAdjacentHTML('beforeend', `<span class="why">✗ ההתאמה הנכונה: <b>${row[1]}</b></span>`);
    });
    if (q.type === 'order') {
      const pool = el.querySelector('.pool'), seq = el.querySelector('.seq');
      r.forEach((k, pos) => { const c = el.querySelector(`.chip[data-k="${k}"]`); seq.appendChild(c); c.classList.add(g.d[pos] ? 'right' : 'wrong') });
      pool.remove(); el.querySelectorAll('.hint').forEach(h => { if (h.textContent.startsWith('השלבים')) h.remove() });
      res.innerHTML = `<div class="fb ${g.got === q.pts ? 'ok' : 'no'}"><b>הסדר הנכון:</b><ol style="padding-inline-start:1.4em">${q.steps.map(s => `<li>${s}</li>`).join('')}</ol>${q.why || ''}</div>`;
    }
    if (q.type !== 'mc' && q.why && q.type !== 'order') res.insertAdjacentHTML('beforeend', `<div class="fb mid">${q.why}</div>`);
    el.querySelectorAll('input,select,.chip').forEach(x => x.disabled = true);
    btn.remove(); el.classList.add('locked'); badge(el, g.got, q.pts);
  }

  /* ---------- טיפול בלחיצות ---------- */
  function wire(i) {
    const q = Q[i], el = $('q' + i), msg = el.querySelector('.msg');
    if (q.type === 'order') el.addEventListener('click', e => {
      const c = e.target.closest('.chip'); if (!c || c.disabled) return;
      (c.parentElement.classList.contains('pool') ? el.querySelector('.seq') : el.querySelector('.pool')).appendChild(c);
    });
    el.querySelector('.ck').addEventListener('click', () => {
      if (!gate()) return;
      msg.textContent = '';
      if (q.type === 'open') {
        const a = S.ans[i];
        if (!a) {
          const t = el.querySelector('textarea').value.trim();
          if (t.length < 20 || t.split(/\s+/).length < 4) { msg.textContent = 'כתבו תשובה מלאה (לפחות משפט אחד) לפני השליחה.'; return }
          S.ans[i] = { text: t, stage: 1 }; save(); show(i); prog(); return;
        }
        a.ticks = [...el.querySelectorAll('.rub input')].map(c => c.checked); a.stage = 2; save(); show(i); prog(); return;
      }
      const r = collect(q, el);
      if (r === null) { msg.textContent = q.type === 'order' ? 'סדרו את כל השלבים לפני הבדיקה.' : 'ענו על כל החלקים לפני הבדיקה.'; return }
      S.ans[i] = { r }; save(); show(i); prog();
    });
  }

  /* ---------- התקדמות, ציון, קוד אימות ---------- */
  const total = () => Q.reduce((s, q, i) => s + (done(i) ? grade(q, Q[i].type === 'open' ? S.ans[i] : S.ans[i].r).got : 0), 0);
  const maxPts = Q.reduce((s, q) => s + q.pts, 0);
  const score = () => Math.round(total() / maxPts * 100);
  const today = () => { const d = new Date(); return `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}` };
  function vcode(name, cls, sc, date) {
    const s = [W.id, String(name).replace(/\s+/g, ''), String(cls).replace(/\s+/g, ''), +sc, String(date).trim(), 'hadam-ws'].join('|');
    let h = 2166136261; for (const ch of s) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619) >>> 0 }
    const c = h.toString(36).toUpperCase().padStart(7, '0').slice(-7); return c.slice(0, 3) + '-' + c.slice(3);
  }
  function prog() {
    const n = Q.filter((_, i) => done(i)).length;
    $('pTxt').textContent = `ענית על ${n} מתוך ${Q.length}`; $('pBar').style.width = (n / Q.length * 100) + '%';
    $('fin').disabled = n < Q.length;
    $('finMsg').textContent = n < Q.length ? `נשארו ${Q.length - n} שאלות. הציון והקובץ ייפתחו כשתסיימו את כולן.` : 'סיימתם את כל השאלות! 🎉';
    if (S.final) final();
  }
  function final() {
    S.final = S.final || today(); save();
    const sc = score(), st = window.STUDENT || {}, code = vcode(st.name, st.cls, sc, S.final);
    const flags = Q.reduce((s, q, i) => s + (q.type === 'open' ? grade(q, S.ans[i]).d.filter(x => x === 'flag').length : 0), 0);
    $('result').hidden = false;
    $('result').innerHTML = `<div class="score">${sc}</div><p>${st.name} · ${st.cls} · ${S.final}</p>
     <table class="sumt"><tr><th>שאלה</th><th>סוג</th><th>ניקוד</th></tr>${Q.map((q, i) => { const g = grade(q, q.type === 'open' ? S.ans[i] : S.ans[i].r); return `<tr><td>${i + 1}</td><td>${TYPE[q.type]}</td><td>${g.got} / ${q.pts}${q.type === 'open' && g.d.includes('flag') ? ' ⚑' : ''}</td></tr>` }).join('')}</table>
     ${flags ? `<p class="fb mid">⚑ ${flags} סעיפים בשאלות הפתוחות סומנו לבדיקת המורה. המורה עשויה להוסיף עליהם נקודות.</p>` : ''}
     <p>קוד אימות: <span class="code">${code}</span></p><p class="hint">הקוד מופיע גם בקובץ. הוא מאפשר למורה לוודא שהציון לא שונה.</p>
     <button class="dl" id="dl" type="button">⬇ הורדת הדוח (PDF) למורה</button><p class="hint" id="dlmsg"></p>`;
    $('dl').onclick = pdf;
  }
  async function pdf() {
    const b = $('dl'), st = window.STUDENT || {}, sc = score(), code = vcode(st.name, st.cls, sc, S.final);
    const r = $('report');
    r.innerHTML = `<h1>${W.title}</h1><div class="meta"><span><b>שם:</b> ${esc(st.name)}</span><span><b>כיתה:</b> ${esc(st.cls)}</span><span><b>תאריך:</b> ${S.final}</span><span><b>קוד אימות:</b> ${code}</span></div>
     <div class="big">ציון: ${sc}</div>
     ${Q.map((q, i) => {
      const a = S.ans[i], g = grade(q, q.type === 'open' ? a : a.r); let det = '';
      if (q.type === 'open') det = `<div class="ans">${esc(a.text)}</div>${q.crit.map((c, k) => `<div class="${g.d[k] === 'ok' ? 'y' : g.d[k] === 'flag' ? 'f' : 'n'}">${g.d[k] === 'ok' ? '✓' : g.d[k] === 'flag' ? '⚑ לבדיקת המורה:' : '✗'} ${plain(c.t)} (${c.pts})</div>`).join('')}`;
      else if (q.type === 'mc') det = `<div class="${g.d[0] ? 'y' : 'n'}">${g.d[0] ? '✓' : '✗'} נבחר: ${plain(q.opts[a.r])}</div>`;
      else det = `<div>${g.d.map(x => x ? '<span class="y">✓</span>' : '<span class="n">✗</span>').join(' ')}</div>`;
      return `<div class="rq"><div class="h"><span>שאלה ${i + 1} · ${TYPE[q.type]}</span><span>${g.got} / ${q.pts}</span></div><div>${plain(q.stem).slice(0, 160)}${plain(q.stem).length > 160 ? '…' : ''}</div>${det}</div>`;
    }).join('')}
     <p style="margin-top:10px;color:#5E6E82">⚑ = התלמיד סימן במחוון שהסעיף כלול, אבל מילות המפתח לא נמצאו בתשובה. מומלץ לקרוא את התשובה ולהחליט.</p>`;
    b.disabled = true; const old = b.textContent; b.textContent = 'מכין קובץ…';
    try { r.style.display = 'block'; const nm = String(st.name || 'תלמיד').replace(/[\\/:*?"<>|]/g, ''); await downloadPdf(r, `${W.file}-${nm}.pdf`); $('dlmsg').textContent = 'הקובץ מוכן. שמרו אותו והעלו למשימה ב-Classroom.' }
    catch (e) { $('dlmsg').textContent = 'ההורדה לא הצליחה. נסו שוב, או הדפיסו את הדף (Ctrl+P) ושמרו כ-PDF.' }
    r.style.display = 'none'; b.disabled = false; b.textContent = old;
  }

  /* ---------- כניסה: שם וכיתה ---------- */
  function gate() { if (window.STUDENT && window.STUDENT.name) return true; $('gate').hidden = false; $('gName').focus(); return false }
  function setWho(nm, cl) {
    window.STUDENT = { name: nm, cls: cl };
    document.querySelectorAll('[data-fill="name"]').forEach(e => e.textContent = '👋 ' + nm + ' · ' + cl);
  }

  /* ---------- הפעלה ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    $('qs').innerHTML = Q.map(card).join('');
    Q.forEach((q, i) => { wire(i); if (S.ans[i]) show(i) });
    const n = $('gName'), c = $('gClass');
    try { const s = JSON.parse(localStorage.getItem('hadam-student') || '{}'); n.value = s.name || ''; c.value = s.cls || '' } catch (e) { }
    $('gGo').onclick = () => {
      const nm = n.value.trim(), cl = c.value.trim();
      if (nm.replace(/\s/g, '').length < 2 || !cl) { $('gErr').textContent = 'כתבו שם (לפחות 2 אותיות) וכיתה.'; return }
      try { localStorage.setItem('hadam-student', JSON.stringify({ name: nm, cls: cl })) } catch (e) { }
      const who = nm + '|' + cl;
      if (S.who && S.who !== who) { S = { who, ans: {} }; save(); location.reload(); return }  // תלמיד אחר באותו מחשב: מתחילים מאפס
      S.who = who; save(); setWho(nm, cl); $('gate').hidden = true;
    };
    n.addEventListener('keydown', e => { if (e.key === 'Enter') c.focus() });
    c.addEventListener('keydown', e => { if (e.key === 'Enter') $('gGo').click() });
    if (S.who) { const [nm, cl] = S.who.split('|'); setWho(nm, cl); $('gate').hidden = true } else n.focus();
    $('fin').onclick = () => { final(); $('result').scrollIntoView({ behavior: 'smooth', block: 'start' }) };
    $('tvGo').onclick = () => {
      const v = id => $(id).value.trim(), ok = vcode(v('tvN'), v('tvC'), v('tvS'), v('tvD')) === v('tvK').toUpperCase().replace(/\s/g, '');
      $('tvR').className = 'fb ' + (ok ? 'ok' : 'no');
      $('tvR').textContent = ok ? '✅ הקוד תואם: הציון בדוח לא שונה.' : '❌ הקוד לא תואם. בדקו שהשם, הכיתה, הציון והתאריך הוקלדו בדיוק כמו בדוח.';
    };
    prog();
  });
})();
