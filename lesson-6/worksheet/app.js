(function(){
'use strict';
var KEY='tafuka.daf.v1', DEVKEY='tafuka.daf.device.v1', SALT='lev-tafuka-daf-2026';
var QS=[{"id": "q1", "title": "חישוב תפוקת לב", "w": 15, "text": "לאסף נמדד דופק של 75 פעימות לדקה ונפח פעימה של 80 מ״ל. חשבו את תפוקת הלב שלו בליטר לדקה.", "parts": [{"id": "a", "type": "num", "label": "תפוקת הלב של אסף", "unit": "ליטר/דקה", "ans": 6, "tol": 0.05, "conv": "L", "pts": 15}], "model": "<span class='eq'>75 × 80 = 6,000</span> מ״ל לדקה = <b>6 ליטר/דקה</b>. (1,000 מ״ל = 1 ליטר)"}, {"id": "q2", "title": "חישוב הפוך", "w": 15, "text": "תפוקת הלב של שירה בזמן ריצה קלה היא 9 ליטר לדקה, והדופק שלה 120 פעימות לדקה. מהו נפח הפעימה שלה?", "parts": [{"id": "a", "type": "num", "label": "נפח הפעימה של שירה", "unit": "מ״ל", "ans": 75, "tol": 0.6, "conv": "ml", "pts": 15}], "model": "נפח פעימה = תפוקה ÷ דופק. ממירים ל־מ״ל: <span class='eq'>9,000 ÷ 120 = 75</span> ← <b>75 מ״ל</b>."}, {"id": "q3", "title": "קריאת טבלה", "w": 20, "text": "בטבלה ערכים מקורבים של אדם בוגר במצבים שונים (כמו בסימולציה).", "table": true, "parts": [{"id": "c1", "type": "num", "cell": true, "label": "מנוחה", "unit": "ליטר/דקה", "ans": 4.9, "tol": 0.1, "conv": "L", "pts": 2}, {"id": "c2", "type": "num", "cell": true, "label": "פעילות מתונה", "unit": "ליטר/דקה", "ans": 10.45, "tol": 0.1, "conv": "L", "pts": 2}, {"id": "c3", "type": "num", "cell": true, "label": "מאמץ עצים", "unit": "ליטר/דקה", "ans": 20.7, "tol": 0.1, "conv": "L", "pts": 2}, {"id": "c4", "type": "num", "cell": true, "label": "איבוד דם", "unit": "ליטר/דקה", "ans": 4.56, "tol": 0.1, "conv": "L", "pts": 2}, {"id": "b", "type": "num", "label": "ב. פי כמה גדלה תפוקת הלב במעבר ממנוחה למאמץ עצים?", "unit": "פי", "ans": 4.2, "tol": 0.25, "pts": 6}, {"id": "c", "type": "mc", "label": "ג. במעבר ממנוחה למאמץ עצים, איזה גורם גדל פי יותר?", "opts": ["הדופק: גדל פי 2.6 בערך (⁦180 ÷ 70⁩), ונפח הפעימה רק פי 1.6 בערך (⁦115 ÷ 70⁩)", "נפח הפעימה: גדל פי 2.6 בערך, והדופק רק פי 1.6 בערך", "שניהם גדלו באותו שיעור, פי 2 בערך", "הדופק גדל ונפח הפעימה לא השתנה"], "correct": 0, "pts": 6}], "model": "א. <b>4.9 · 10.5 · 20.7 · 4.6</b> ליטר/דקה (דופק × נפח פעימה ÷ 1,000).<br>ב. <span class='eq'>20.7 ÷ 4.9 ≈ 4.2</span>: פי 4 בערך.<br>ג. דופק: <span class='eq'>180 ÷ 70 ≈ 2.6</span>; נפח פעימה: <span class='eq'>115 ÷ 70 ≈ 1.6</span>. <b>הדופק גדל פי יותר.</b>"}, {"id": "q4", "title": "איבוד דם", "w": 20, "text": "לאחר איבוד דם, נפח הפעימה ירד מ־70 מ״ל ל־38 מ״ל, אבל תפוקת הלב ירדה רק מ־4.9 ל־4.6 ליטר/דקה.", "parts": [{"id": "a", "type": "open", "label": "א. הסבירו מדוע נפח הפעימה ירד.", "pts": 11, "model": "נפח הדם בגוף קטן ← פחות דם חוזר ללב (החזר ורידי קטן) ← החדר מתמלא פחות ← פחות דם נפלט בכל פעימה: נפח פעימה קטן.", "kps": [{"t": "פחות דם חוזר ללב: ההחזר הוורידי קטן (כי נפח הדם בגוף קטן)", "pts": 6, "kw": ["החזר", "חוזר", "פחות דם", "נפח הדם", "ורידי"]}, {"t": "החדר מתמלא פחות ← פחות דם נפלט בכל פעימה", "pts": 5, "kw": ["מתמלא", "נפלט", "פולט", "פחות"]}]}, {"id": "b", "type": "open", "label": "ב. הסבירו מדוע תפוקת הלב כמעט לא ירדה.", "pts": 9, "model": "הדופק עולה מ־70 ל־120. תפוקת לב = דופק × נפח פעימה, ולכן העלייה בדופק מפצה על רוב הירידה בנפח הפעימה.", "kps": [{"t": "הדופק עולה (מ־70 ל־120)", "pts": 5, "kw": ["דופק", "120", "עולה"]}, {"t": "תפוקת לב = דופק × נפח פעימה ← העלייה בדופק מפצה על הירידה בנפח הפעימה", "pts": 4, "kw": ["מפצה", "פיצוי", "מכפלה", "×", "כפול"]}]}]}, {"id": "q7", "title": "ספורטאית מאומנת", "w": 15, "text": "לדנה, רצת למרחקים ארוכים, דופק במנוחה של 50 פעימות לדקה ותפוקת לב של 5 ליטר/דקה. לתמר, שאינה מתאמנת, דופק במנוחה של 70 ותפוקת לב של 4.9 ליטר/דקה.", "parts": [{"id": "a1", "type": "num", "label": "א. נפח הפעימה של דנה", "unit": "מ״ל", "ans": 100, "tol": 0.6, "conv": "ml", "pts": 3}, {"id": "a2", "type": "num", "label": "א. נפח הפעימה של תמר", "unit": "מ״ל", "ans": 70, "tol": 0.6, "conv": "ml", "pts": 3}, {"id": "b", "type": "open", "label": "ב. הסבירו את ההבדל בדופק ובנפח הפעימה בין השתיים.", "pts": 9, "model": "אימון סיבולת מגדיל את חדר שמאל ומחזק את שריר הלב ← נפח פעימה גדול. תפוקת הלב במנוחה של שתיהן דומה (כ־5 ליטר/דקה), ולכן אצל דנה, עם נפח פעימה גדול, הדופק נמוך יותר.", "kps": [{"t": "אימון מגדיל את חדר שמאל ומחזק את שריר הלב ← נפח פעימה גדול יותר", "pts": 5, "kw": ["חדר", "שריר", "חזק", "גדול", "אימון"]}, {"t": "תפוקת הלב דומה ← עם נפח פעימה גדול הדופק נמוך", "pts": 4, "kw": ["דומה", "תפוקה", "תפוקת", "פחות פעימות", "נמוך"]}]}], "model": "דנה: <span class='eq'>5,000 ÷ 50 = 100</span> מ״ל. תמר: <span class='eq'>4,900 ÷ 70 = 70</span> מ״ל."}, {"id": "q8", "title": "קישור לכלי הדם", "w": 15, "text": "בזמן הליכה שרירי השלד ברגליים מתכווצים ונרפים שוב ושוב. הסבירו כיצד זה משפיע על תפוקת הלב. השתמשו במונחים: ורידים, מסתמים, החזר ורידי, נפח פעימה.", "parts": [{"id": "a", "type": "open", "label": "", "pts": 15, "model": "כיווץ השרירים לוחץ על הוורידים, והמסתמים מונעים זרימה לאחור ← הדם נדחף לכיוון הלב ← ההחזר הוורידי גדל ← החדר מתמלא יותר ופולט יותר דם בכל פעימה ← נפח הפעימה ותפוקת הלב גדלים.", "kps": [{"t": "השרירים לוחצים על הוורידים, המסתמים מונעים זרימה לאחור ← הדם נדחף ללב", "pts": 4, "kw": ["מסתמ", "לוחצ", "לוחץ", "נדחף", "דוחפ"]}, {"t": "ההחזר הוורידי גדל", "pts": 3, "kw": ["החזר"]}, {"t": "החדר מתמלא יותר ופולט יותר דם בכל פעימה", "pts": 4, "kw": ["מתמלא", "יותר דם", "פולט", "נפלט"]}, {"t": "נפח הפעימה ותפוקת הלב גדלים", "pts": 4, "kw": ["נפח פעימה", "נפח הפעימה", "תפוקת", "תפוקה"]}]}]}];
var TROWS=[['מנוחה',70,70],['פעילות מתונה',110,95],['מאמץ עצים',180,115],['איבוד דם',120,38]];
var LET=['א','ב','ג','ד'];
function $(id){return document.getElementById(id);}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmt(x){var r=Math.round(x*10)/10;return (r%1===0?String(r):r.toFixed(1));}

/* ---------- state ---------- */
function load(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v||d;}catch(e){return d;}}
var dev=load(DEVKEY,{attempts:0});
function fresh(){dev.attempts=(dev.attempts||0)+1;try{localStorage.setItem(DEVKEY,JSON.stringify(dev));}catch(e){}
  return {student:null,answers:{},attempt:dev.attempts,id:Math.random().toString(36).slice(2,8).toUpperCase()};}
var st=load(KEY,null); if(!st||!st.answers) st=fresh();
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
save();

/* ---------- helpers ---------- */
function normName(s){return String(s||'').replace(/\s+/g,' ').trim();}
function parseNum(s){
  s=String(s||'').replace(/(\d),(\d{3})(?!\d)/g,'$1$2').replace(/,/g,'.');
  var m=s.match(/-?\d*\.?\d+/); return m?parseFloat(m[0]):NaN;
}
function convert(p,x){
  if(p.conv==='L'&&x>=300) return {v:x/1000,note:'(הומר מ־מ״ל לליטר)'};
  if(p.conv==='ml'&&x>0&&x<1) return {v:x*1000,note:'(הומר מליטר ל־מ״ל)'};
  return {v:x,note:''};
}
function normTxt(s){return String(s||'').replace(/[\u0591-\u05C7]/g,'').replace(/[״"׳']/g,'').replace(/[\u2013\u2014-]/g,' ').toLowerCase();}
function kwHit(kp,text){
  var t=normTxt(text);
  (kp.strip||[]).forEach(function(w){t=t.split(normTxt(w)).join(' ');});
  return (kp.kw||[]).some(function(w){return t.indexOf(normTxt(w))>=0;});
}
function cyrb53(str,seed){var h1=0xdeadbeef^(seed||0),h2=0x41c6ce57^(seed||0);for(var i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0);}
function codeFor(name,score){var s=cyrb53(SALT+'|'+normName(name)+'|'+score).toString(36).toUpperCase();while(s.length<8)s='0'+s;s=s.slice(-8);return s.slice(0,4)+'-'+s.slice(4);}
function hasOpen(q){return q.parts.some(function(p){return p.type==='open';});}
function qDone(q){return !!st.answers[q.id];}
function doneCount(){return QS.filter(qDone).length;}
function allDone(){return !!st.student&&doneCount()===QS.length;}
function partPts(q,p){
  var a=st.answers[q.id]; if(!a) return 0; var r=a.parts[p.id]; if(!r) return 0;
  if(p.type==='open') return 0;
  return r.correct?p.pts:0;
}
function qAuto(q){var s=0,m=0;q.parts.forEach(function(p){if(p.type!=='open'){s+=partPts(q,p);m+=p.pts;}});return {s:s,m:m};}
function qOpenMax(q){var m=0;q.parts.forEach(function(p){if(p.type==='open')m+=p.pts;});return m;}
function autoPts(){var s=0;QS.forEach(function(q){s+=qAuto(q).s;});return s;}
function autoMax(){var s=0;QS.forEach(function(q){s+=qAuto(q).m;});return s;}
function openMax(){var s=0;QS.forEach(function(q){s+=qOpenMax(q);});return s;}
function autoPct(){var m=autoMax();return m?Math.round(autoPts()/m*100):0;}
function dt(iso){if(!iso)return '-';var d=new Date(iso);var p=function(n){return (n<10?'0':'')+n;};return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());}

/* ---------- student ---------- */
function renderStudent(){
  var started=Object.keys(st.answers).length>0;
  if(st.student){$('st-name').value=st.student.name;$('st-class').value=st.student.cls;}
  $('st-name').disabled=started;$('st-class').disabled=started;$('st-save').disabled=started;
  $('st-save').textContent=st.student?'עדכון':'שמירה והתחלה';
  var n=$('student-locked');
  if(st.student){n.hidden=false;n.textContent='✓ נרשמו: '+st.student.name+' · כיתה '+st.student.cls+(started?' (הפרטים ננעלו כי כבר התחלתם לענות)':'');} else n.hidden=true;
}
$('student-form').addEventListener('submit',function(e){
  e.preventDefault(); if(Object.keys(st.answers).length) return;
  var n=normName($('st-name').value),c=normName($('st-class').value);
  if(n.length<2){$('st-name').focus();return;} if(!c){$('st-class').focus();return;}
  st.student={name:n,cls:c,at:new Date().toISOString()}; save(); renderStudent(); renderAll();
  var q=$('q-q1'); if(q) q.scrollIntoView({behavior:'smooth',block:'start'});
});

/* ---------- render a question ---------- */
function numInput(q,p,a){
  var r=a&&a.parts[p.id];
  return '<input type="text" inputmode="decimal" autocomplete="off" data-p="'+p.id+'" aria-label="'+esc(p.label)+'" placeholder="?" '+(a?'disabled value="'+esc(r?r.raw:'')+'"':'')+'>';
}
function partFb(p,r){
  if(!r) return '';
  if(p.type==='num') return '<div class="pf '+(r.correct?'ok':'no')+'">'+(r.correct?'✓ נכון':'✗ לא נכון. התשובה: <span class="eq">'+fmt(p.ans)+'</span> '+esc(p.unit))+(r.note?' <span class="small">'+r.note+'</span>':'')+'</div>';
  return '';
}
function renderQ(q,i){
  var a=st.answers[q.id], gated=!st.student, done=qDone(q);
  var el=document.createElement('article'); el.className='q'+(done?' done':'')+(gated&&!a?' disabled':''); el.id='q-'+q.id;
  var h='<div class="qh"><span class="qn">'+(i+1)+'</span><div><span class="qt">'+esc(q.title)+'</span></div>'+(a?'<span class="lock">🔒 ננעל</span>':'')+'</div>';
  h+='<p class="qtext">'+esc(q.text)+'</p>';
  if(q.table){
    h+='<p class="pl" style="font-weight:700;margin-top:10px">א. השלימו את עמודת תפוקת הלב (ספרה אחת אחרי הנקודה).</p>';
    h+='<table class="tbl"><thead><tr><th>מצב</th><th>דופק<br>(פעימות/דקה)</th><th>נפח פעימה<br>(מ״ל)</th><th>תפוקת לב<br>(ליטר/דקה)</th></tr></thead><tbody>';
    TROWS.forEach(function(row,k){
      var p=q.parts[k], r=a&&a.parts[p.id];
      h+='<tr><td>'+row[0]+'</td><td>'+row[1]+'</td><td>'+row[2]+'</td><td>'+numInput(q,p,a)+'</td></tr>';
    });
    h+='</tbody></table>';
  }
  q.parts.forEach(function(p){
    if(p.cell) return;
    var r=a&&a.parts[p.id];
    h+='<div class="part">';
    if(p.label) h+='<div class="pl">'+esc(p.label)+'</div>';
    if(p.type==='num'){
      h+='<div class="numrow">'+(p.unit==='פי'?'<span class="unit">פי</span>':'')+numInput(q,p,a)+(p.unit!=='פי'?'<span class="unit">'+esc(p.unit)+'</span>':'')+'</div>';
    } else if(p.type==='mc'){
      h+='<ul class="opts">';
      p.opts.forEach(function(o,k){
        var cls='opt'; if(r&&k===r.value) cls+=' sel';
        h+='<li><label class="'+cls+'"><input type="radio" name="'+q.id+'_'+p.id+'" data-p="'+p.id+'" value="'+k+'"'+(a?' disabled':'')+(r&&r.value===k?' checked':'')+'><span><b>'+LET[k]+'.</b> '+esc(o)+'</span></label></li>';
      });
      h+='</ul>';
    } else {
      h+='<textarea data-p="'+p.id+'" placeholder="כתבו את ההסבר במשפטים שלכם" '+(a?'disabled':'')+'>'+(r?esc(r.raw):'')+'</textarea>';
    }
    h+='</div>';
  });
  if(!a){
    h+='<div class="qa"><button type="button" class="btn primary" data-submit disabled>שליחת תשובה</button><span class="hint">ענו על כל הסעיפים · שליחה פעם אחת</span></div>';
  } else {
    h+='<div class="saved">✓ התשובה נשמרה וננעלה</div>';
  }
  el.innerHTML=h;
  if(!a) wireInputs(q,el);
  return el;
}
function wireInputs(q,el){
  var btn=el.querySelector('[data-submit]');
  function ready(){
    var ok=q.parts.every(function(p){
      if(p.type==='num'){var i=el.querySelector('input[data-p="'+p.id+'"]');return i&&!isNaN(parseNum(i.value));}
      if(p.type==='mc') return !!el.querySelector('input[data-p="'+p.id+'"]:checked');
      var t=el.querySelector('textarea[data-p="'+p.id+'"]'); return t&&t.value.trim().length>=3;
    });
    btn.disabled=!ok||!st.student;
  }
  Array.prototype.forEach.call(el.querySelectorAll('input,textarea'),function(inp){
    inp.addEventListener('input',function(){ready();draft(q,el);});
    inp.addEventListener('change',function(){
      if(inp.type==='radio') Array.prototype.forEach.call(inp.closest('.opts').querySelectorAll('.opt'),function(l){l.classList.toggle('sel',l.querySelector('input').checked);});
      ready();draft(q,el);
    });
  });
  // restore draft
  var d=(st.drafts||{})[q.id];
  if(d){ Object.keys(d).forEach(function(pid){
    var t=el.querySelector('textarea[data-p="'+pid+'"]')||el.querySelector('input[type=text][data-p="'+pid+'"]');
    if(t) t.value=d[pid];
    else { var rb=el.querySelector('input[type=radio][data-p="'+pid+'"][value="'+d[pid]+'"]'); if(rb){rb.checked=true;rb.closest('.opt').classList.add('sel');} }
  }); }
  ready();
  btn.addEventListener('click',function(){submit(q,el);});
}
function draft(q,el){
  st.drafts=st.drafts||{}; var d={};
  q.parts.forEach(function(p){
    if(p.type==='mc'){var c=el.querySelector('input[data-p="'+p.id+'"]:checked'); if(c) d[p.id]=c.value;}
    else {var i=el.querySelector('[data-p="'+p.id+'"]'); if(i&&i.value) d[p.id]=i.value;}
  });
  st.drafts[q.id]=d; save();
}
function submit(q,el){
  if(st.answers[q.id]||!st.student) return;
  var rec={parts:{},at:new Date().toISOString()};
  q.parts.forEach(function(p){
    if(p.type==='num'){
      var raw=el.querySelector('input[data-p="'+p.id+'"]').value.trim(), x=parseNum(raw), c=convert(p,x);
      rec.parts[p.id]={raw:raw,value:c.v,note:c.note,correct:Math.abs(c.v-p.ans)<=p.tol+1e-9};
    } else if(p.type==='mc'){
      var v=+el.querySelector('input[data-p="'+p.id+'"]:checked').value; rec.parts[p.id]={value:v,correct:v===p.correct};
    } else {
      var t=el.querySelector('textarea[data-p="'+p.id+'"]').value.trim();
      rec.parts[p.id]={raw:t,hits:p.kps.map(function(k){return kwHit(k,t);}),marks:p.kps.map(function(){return null;})};
    }
  });
  if(!st.startedAt) st.startedAt=rec.at;
  st.answers[q.id]=rec; if(st.drafts) delete st.drafts[q.id];
  maybeFinish();
  save(); renderStudent(); renderAll();
  var nx=QS.filter(function(x){return !st.answers[x.id];})[0], n=nx?$('q-'+nx.id):$('results'); if(n) n.scrollIntoView({behavior:'smooth',block:'start'});
}
function maybeFinish(){ if(doneCount()===QS.length&&!st.finishedAt) st.finishedAt=new Date().toISOString(); }

function renderAll(){
  var box=$('questions'); box.innerHTML='';
  $('gate').hidden=!!st.student;
  QS.forEach(function(q,i){box.appendChild(renderQ(q,i));});
  var n=doneCount(); $('prog').style.width=(n/QS.length*100)+'%'; $('prog-txt').textContent=n+' מתוך '+QS.length;
  renderResults();
}

/* ---------- results ---------- */
var pdfCache=null;
function renderResults(){
  var done=allDone();
  $('res-pending').hidden=done; $('res-done').hidden=!done;
  renderSave(done);
  if(!done) return;
  if(!st.finishedAt){st.finishedAt=new Date().toISOString();save();}
  $('sname').textContent=st.student.name+' · כיתה '+st.student.cls;
}

/* ---------- PDF ---------- */
function pdfName(){return ('דף_עבודה_תפוקת_הלב_'+st.student.name+'_'+st.student.cls).replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,'_')+'.pdf';}
function buildPages(){
  var stage=$('pdf-stage'); stage.innerHTML='';
  var items=[];
  items.push('<div><div class="ptop"><div><h1>דף עבודה: תפוקת הלב</h1><p>ביולוגיה · מערכת ההובלה · כיתה י׳ · התשובות שלי</p></div></div>'+
    '<div class="pinfo"><div><span>שם</span><b>'+esc(st.student.name)+'</b></div><div><span>כיתה</span><b>'+esc(st.student.cls)+'</b></div>'+
    '<div><span>התחלה</span><b><bdi dir="ltr">'+dt(st.startedAt)+'</bdi></b></div><div><span>סיום</span><b><bdi dir="ltr">'+dt(st.finishedAt)+'</bdi></b></div></div>'+
    '<p class="pnote">עותק גיבוי של התשובות. הציון והמשוב יגיעו מהמורה.</p></div>');
  QS.forEach(function(q,i){
    var a=st.answers[q.id];
    var h='<div class="pq"><div class="qh2"><span>'+(i+1)+'. '+esc(q.title)+'</span></div>';
    h+='<div class="pmodel" style="color:#13233A">'+esc(q.text)+'</div>';
    q.parts.forEach(function(p){
      var r=a.parts[p.id]; h+='<div class="pp">';
      var lab=p.cell?('א. תפוקת לב, '+p.label):(p.label||'');
      if(p.type==='num'){
        h+=(lab?'<span class="pl2">'+esc(lab)+': </span>':'')+'<span>'+esc(r.raw)+' '+(p.unit==='פי'?'':esc(p.unit))+'</span>';
      } else if(p.type==='mc'){
        h+=(lab?'<div class="pl2">'+esc(lab)+'</div>':'')+'<span>בחרתי: '+LET[r.value]+'. '+esc(p.opts[r.value])+'</span>';
      } else {
        h+='<div class="pl2">'+esc(lab||'תשובה פתוחה')+'</div><div class="tx">'+esc(r.raw)+'</div>';
      }
      h+='</div>';
    });
    h+='</div>'; items.push(h);
  });
  items.push('<div class="pq" style="border-color:#D7263D"><b>להגשה:</b> לוחצים «שליחה למורה» בדף. הקובץ הזה הוא גיבוי של התשובות.</div>');
  var pages=[],body=null;
  function newPage(){var page=document.createElement('div');page.className='pdf-page';body=document.createElement('div');page.appendChild(body);var f=document.createElement('div');f.className='pfoot';page.appendChild(f);stage.appendChild(page);pages.push(page);}
  newPage(); var LIMIT=1123-40-56;
  items.forEach(function(html){var w=document.createElement('div');w.innerHTML=html;var el=w.firstChild;body.appendChild(el);
    if(body.offsetHeight>LIMIT&&body.childNodes.length>1){body.removeChild(el);newPage();body.appendChild(el);}});
  pages.forEach(function(p,i){p.querySelector('.pfoot').innerHTML='<span>'+esc(st.student.name)+' · כיתה '+esc(st.student.cls)+'</span><span>עמוד '+(i+1)+' מתוך '+pages.length+'</span>';});
  return pages;
}
var pdfPending=null;
function makePdf(silent){
  if(pdfCache) return Promise.resolve(pdfCache);
  if(pdfPending) return pdfPending;
  var status=$('pdf-status'); if(!silent) status.textContent='מכין את הקובץ…';
  pdfPending=(document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){
    var pages=buildPages(); var doc=new window.jspdf.jsPDF({orientation:'p',unit:'mm',format:'a4',compress:true}); var chain=Promise.resolve();
    pages.forEach(function(p,i){chain=chain.then(function(){
      return html2canvas(p,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,onclone:function(d){var s=d.getElementById('pdf-stage');if(s){s.style.left='0';s.style.top='0';s.style.position='absolute';}}})
      .then(function(c){if(i>0)doc.addPage();doc.addImage(c.toDataURL('image/jpeg',0.88),'JPEG',0,0,210,297);});});});
    return chain.then(function(){
      doc.setProperties({title:'דף עבודה תפוקת הלב – '+st.student.name,author:st.student.name});
      var blob=doc.output('blob'); $('pdf-stage').innerHTML=''; if(!silent) status.textContent='הקובץ מוכן ✓';
      pdfCache={blob:blob,name:pdfName(),pages:pages.length}; return pdfCache;});
  }).catch(function(e){status.textContent='יצירת הקובץ נכשלה. נסו 🖨 הדפסה / שמירה כ-PDF, או צלמו מסך של התשובות. ('+(e&&e.message||e)+')';showFallback();throw e;});
  pdfPending.then(function(){pdfPending=null;},function(){pdfPending=null;});
  return pdfPending;
}
var UA=navigator.userAgent||'';
var isIOS=/iPhone|iPad|iPod/i.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1);
var isAndroid=/Android/i.test(UA);
var inApp=/WhatsApp|Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A|Line\/|Snapchat|TikTok|musical_ly|Telegram|MicroMessenger/i.test(UA)||(isAndroid&&/; ?wv\)/.test(UA));
var canShareFiles=false;
try{canShareFiles=!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[new File([new Blob(['x'],{type:'application/pdf'})],'t.pdf',{type:'application/pdf'})]}));}catch(e){}
if(inApp){ $('inapp-top').hidden=false; $('inapp-res').hidden=false;
  if(isIOS) Array.prototype.forEach.call(document.querySelectorAll('.inapp-main'),function(m){m.textContent=m.textContent.replace('Chrome','Safari או Chrome');}); }
if(canShareFiles) $('share-btn').hidden=false;
Array.prototype.forEach.call(document.querySelectorAll('.copy-link'),function(b){
  b.addEventListener('click',function(){var url=location.href.split('#')[0];
    function done(){b.textContent='✓ הועתק. הדביקו בשורת הכתובת של Chrome';}
    function legacy(){try{var t=document.createElement('textarea');t.value=url;document.body.appendChild(t);t.select();var ok=document.execCommand('copy');t.remove();if(ok)done();else prompt('העתיקו את הקישור:',url);}catch(e){prompt('העתיקו את הקישור:',url);}}
    if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(url).then(done,legacy);else legacy();});
});
function showFallback(){$('fallback').hidden=false;}
function markSaved(){if(!st.pdfAt){st.pdfAt=new Date().toISOString();save();}}
function download(p){
  var url=URL.createObjectURL(p.blob),a=document.createElement('a');a.href=url;a.download=p.name;a.rel='noopener';document.body.appendChild(a);a.click();
  setTimeout(function(){URL.revokeObjectURL(url);a.remove();},60000); markSaved(); showFallback();
  $('pdf-status').textContent=inApp?'אם לא הופיעה הורדה, פתחו את הקישור ב-Chrome (ראו ההודעה למעלה).':'הקובץ ירד למכשיר ✓ (בתיקיית ההורדות / Files). זה גיבוי של התשובות. ההגשה היא בכפתור «שליחה למורה».';
}
function share(p){
  if(navigator.userActivation&&!navigator.userActivation.isActive){$('pdf-status').textContent='הקובץ מוכן ✓ לחצו שוב על 📤 שיתוף.';return Promise.resolve();}
  var f=new File([p.blob],p.name,{type:'application/pdf'});
  return navigator.share({files:[f],title:'דף עבודה תפוקת הלב – '+st.student.name}).then(function(){markSaved();showFallback();$('pdf-status').textContent='הקובץ שותף ✓';})
  .catch(function(e){showFallback();if(e&&e.name==='AbortError'){$('pdf-status').textContent='השיתוף בוטל. אפשר ללחוץ על ⬇ שמירת PDF.';return;}download(p);});
}
function busy(b,fn){if(b.disabled)return;b.disabled=true;makePdf().then(fn).catch(function(){}).then(function(){b.disabled=!allDone();});}
$('pdf-btn').addEventListener('click',function(){busy(this,download);});
$('share-btn').addEventListener('click',function(){busy(this,share);});
$('open-btn').addEventListener('click',function(){
  if(!pdfCache){busy(this,function(){$('pdf-status').textContent='הקובץ מוכן ✓ לחצו שוב על 📄 פתיחת ה-PDF.';});return;}
  var url=URL.createObjectURL(pdfCache.blob),w=null;try{w=window.open(url,'_blank');}catch(e){} markSaved();
  $('pdf-status').textContent=w?'ה-PDF נפתח בחלון חדש. שמרו או שתפו אותו משם.':'החלון לא נפתח. נסו 🖨 הדפסה / שמירה כ-PDF.';
});
$('print-btn').addEventListener('click',function(){
  if(!allDone())return;
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(function(){
    buildPages();document.documentElement.classList.add('printing');
    var clean=function(){document.documentElement.classList.remove('printing');$('pdf-stage').innerHTML='';window.removeEventListener('afterprint',clean);};
    window.addEventListener('afterprint',clean);markSaved();setTimeout(function(){try{window.print();}catch(e){}},60);});
});
var prebuilt=false;

/* ---------- send to teacher (Google Form) ---------- */
var FORM_URL='https://docs.google.com/forms/d/e/1FAIpQLScarNQOZU81-JMeyosdDLS5kKo1T8zyITl20EtM5x6jnTJBVw/formResponse';
var F={name:'entry.29222546',cls:'entry.342656258',pct:'entry.2080025695',code:'entry.745388352',meta:'entry.1990746261'};
var FQ=["entry.1333370635", "entry.1753476676", "entry.1977012154", "entry.2013220779", "entry.1233129455", "entry.1377283212", "entry.1292104681", "entry.892072544"];
function qText(q){
  var a=st.answers[q.id]||{parts:{}}, L=[], au=qAuto(q), om=qOpenMax(q);
  L.push((au.m?'אוטומטי: '+fmt(au.s)+' מתוך '+au.m+' נק׳':'')+(au.m&&om?' · ':'')+(om?'פתוח לבדיקת המורה: '+om+' נק׳':''));
  q.parts.forEach(function(p){
    var r=a.parts[p.id], lab=(p.label||'').trim();
    if(!r){L.push(lab+': (אין תשובה)');return;}
    if(p.type==='num'){L.push((lab||'תשובה')+': '+r.raw+(String(r.value)!==String(r.raw).trim()&&r.value!=null?' (= '+fmt(r.value)+')':'')+' '+(p.unit||'')+' → '+(r.correct?'✓ נכון':'✗ (נכון: '+p.ans+')')+' ['+fmt(partPts(q,p))+'/'+p.pts+']');}
    else if(p.type==='mc'){L.push((lab?lab+' ':'')+'בחירה: '+LET[r.value]+'. '+p.opts[r.value]+' → '+(r.correct?'✓ נכון':'✗ (נכון: '+LET[p.correct]+')')+' ['+fmt(partPts(q,p))+'/'+p.pts+']');}
    else{
      if(lab)L.push(lab);
      L.push('תשובת התלמיד/ה: «'+(r.raw||'')+'»');
      L.push('לבדיקה ('+p.pts+' נק׳), נקודות מפתח:');
      p.kps.forEach(function(k,i){L.push('  • '+k.t+' ('+k.pts+')'+(r.hits&&r.hits[i]?' · 🔍 מילת מפתח נמצאה':' · 🔍 לא נמצאה מילת מפתח'));});
    }
  });
  return L.join('\n');
}
function gradeText(){var p=autoPct();return p+'% (אוטומטי, לפני בדיקת פתוחות) · '+fmt(autoPts())+' מתוך '+autoMax()+' נק׳ אוטומטיות · פתוחות: עד '+openMax()+' נק׳ לבדיקה';}
function buildForm(){
  var pct=autoPct(), b=new URLSearchParams();
  b.append(F.name,st.student.name); b.append(F.cls,st.student.cls);
  b.append(F.pct,gradeText()); b.append(F.code,codeFor(st.student.name,pct));
  QS.forEach(function(q){b.append(FQ[parseInt(q.id.slice(1),10)-1],qText(q));});
  b.append(F.meta,'התחלה: '+dt(st.startedAt||st.student.at)+' · סיום: '+dt(st.finishedAt)+' · שליחה: '+dt(new Date().toISOString())+' · ניסיון '+(st.attempt||1)+' במכשיר · מזהה '+(st.id||'-')+' · התלמיד/ה לא ראה/תה ציון');
  return b;
}
var sending=false;
function renderSend(done){
  var b=$('send-btn'), s=$('send-status'); if(!b) return;
  if(st.sentAt){b.disabled=true;b.textContent='✅ נשלח למורה';b.classList.add('sent');s.innerHTML='נשלח ב-'+dt(st.sentAt)+'.<br><b style="font-size:1.15em">🔑 הקוד האישי שלך: <span style="direction:ltr;display:inline-block;letter-spacing:2px;background:#FEF3C7;padding:2px 8px;border-radius:8px">'+codeFor(st.student.name,autoPct())+'</span></b><br>צלמו מסך או רשמו אותו! איתו תראו את הציון והמשוב בקישור התוצאות שהמורה תשלח.';return;}
  b.classList.remove('sent'); b.textContent=st.sendFail?'🔁 שליחה חוזרת למורה':'📤 שליחה למורה';
  b.disabled=!done||sending;
}
$('send-btn').addEventListener('click',function(){
  if(!allDone()||st.sentAt||sending) return;
  sending=true; var b=$('send-btn'); b.disabled=true; b.textContent='⏳ שולח…'; $('send-status').textContent='';
  var body; try{body=buildForm();}catch(e){sending=false;st.sendFail=true;save();renderSend(true);$('send-status').textContent='משהו השתבש. נסו שוב או שמרו PDF.';return;}
  var ctl=('AbortController' in window)?new AbortController():null, to=setTimeout(function(){if(ctl)ctl.abort();},20000);
  fetch(FORM_URL,{method:'POST',mode:'no-cors',body:body,signal:ctl?ctl.signal:undefined}).then(function(){
    clearTimeout(to); sending=false; st.sentAt=new Date().toISOString(); st.sendFail=false; save(); renderSend(true);
  }).catch(function(){
    clearTimeout(to); sending=false; st.sendFail=true; save(); renderSend(true);
    $('send-status').textContent='⚠ לא נשלח: אין חיבור לרשת. בדקו את האינטרנט ולחצו שוב (או שמרו PDF של התשובות כגיבוי).';
  });
});
function renderSave(done){
  renderSend(done);
  $('pdf-btn').disabled=!done;$('share-btn').disabled=!done;$('pdf-lock').hidden=done;
  if(!done){$('pdf-lock-txt').textContent='הכפתור ייפתח אחרי שתסיימו את כל השאלות ('+doneCount()+' מתוך '+QS.length+')';$('fallback').hidden=true;}
  else{ if(inApp)showFallback(); if(!pdfCache&&!prebuilt){prebuilt=true;setTimeout(function(){makePdf(true).catch(function(){});},800);} }
}
$('reset-btn').addEventListener('click',function(){
  if(!confirm('למחוק את התשובות והפרטים מהמכשיר הזה ולהתחיל מחדש לתלמיד/ה הבא/ה? (רק אחרי שלחצתם «שליחה למורה»)'))return;
  st=fresh();save();pdfCache=null;location.hash='';location.reload();
});
var css=document.createElement('style');css.textContent='@media print{html.printing body>*{display:none!important}html.printing body>#pdf-stage{display:block!important;position:static!important;left:auto!important;width:auto!important}html.printing .pdf-page{width:210mm;height:296mm;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}@page{size:A4;margin:0}}';document.head.appendChild(css);

renderStudent(); renderAll();
window.__daf={codeFor:codeFor,makePdf:makePdf,autoPct:autoPct,gradeText:gradeText,buildForm:buildForm,state:function(){return st;}};
})();
