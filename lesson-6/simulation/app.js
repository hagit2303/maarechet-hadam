(function(){
'use strict';
var KEY='cosim.v1', DEVKEY='cosim.device.v1', SALT='lev-tafuka-2026';

/* ---------- Content ---------- */
var SCEN=[
 {id:'rest',ico:'😌',name:'מנוחה',hr:70,sv:70,
  text:'במנוחה צריכת החמצן ברקמות נמוכה. תפוקת הלב כ-5 ליטר בדקה: בערך כל נפח הדם בגוף עובר בלב בכל דקה.',
  chips:['מנוחה','כ-5 ליטר/דקה']},
 {id:'sleep',ico:'😴',name:'שינה',hr:55,sv:65,
  text:'בשינה קצב חילוף החומרים יורד וצריכת החמצן בגוף יורדת. הדופק יורד, וגם נפח הפעימה קטן מעט. התוצאה: תפוקת לב נמוכה יותר מאשר בערות במנוחה.',
  chips:['חילוף חומרים איטי']},
 {id:'moderate',ico:'🚶',name:'פעילות גופנית מתונה',hr:110,sv:95,
  text:'בפעילות מתונה צריכת החמצן בשרירים הפעילים עולה. הדופק עולה, וגם נפח הפעימה גדל: כיווץ שרירי הרגליים סוחט את הוורידים, יותר דם חוזר ללב, והחדר מתמלא ופולט יותר דם בכל פעימה.',
  chips:['דופק עולה','החזר ורידי','נפח פעימה גדל']},
 {id:'intense',ico:'🏃',name:'מאמץ גופני עצים',hr:180,sv:115,
  text:'במאמץ מרבי עולים מאוד גם הדופק וגם נפח הפעימה. תפוקת הלב גדלה פי 4 בערך – כ-20 ליטר בדקה – ורוב זרימת הדם עוברת לשרירי השלד, שבהם כלי הדם מורחבים. בדופק גבוה מאוד זמן המילוי של החדר קצר, ולכן נפח הפעימה כמעט מפסיק לעלות.',
  chips:['דופק גבוה','נפח פעימה גדול','כ-20 ליטר/דקה']},
 {id:'athlete',ico:'🏅',name:'ספורטאי מאומן במנוחה',hr:50,sv:100,
  text:'אימון סיבולת מגדיל את חדר שמאל ומחזק את שריר הלב, ולכן נפח הפעימה גדול יותר והדופק במנוחה נמוך. תפוקת הלב במנוחה דומה לזו של אדם לא מאומן (כ-5 ליטר בדקה): נפח פעימה גדול × דופק נמוך.',
  chips:['נפח פעימה גדול','לב מאומן']},
 {id:'athleteMax',ico:'🚴',name:'ספורטאי מאומן במאמץ מרבי',hr:185,sv:160,
  text:'אצל ספורטאי סיבולת נפח הפעימה במאמץ גבוה בהרבה מאשר אצל אדם לא מאומן, ואילו הדופק המרבי דומה (תלוי בעיקר בגיל). לכן תפוקת הלב המרבית שלו גבוהה בהרבה, ובכל דקה מגיע יותר חמצן לשרירים.',
  chips:['נפח פעימה גדול','דופק מרבי']},
 {id:'bleed',ico:'🩸',name:'איבוד דם / התייבשות',hr:120,sv:38,
  text:'נפח הדם קטן ← פחות דם חוזר ללב ← החדר מתמלא פחות ← נפח הפעימה יורד. הדופק עולה, ולכן הירידה בתפוקת הלב קטנה יותר מהירידה בנפח הפעימה.',
  chips:['נפח דם','החזר ורידי','דופק עולה']},
 {id:'fever',ico:'🤒',name:'חום גבוה (קדחת)',hr:100,sv:70,
  text:'בחום גבוה קצב חילוף החומרים עולה וצריכת החמצן ברקמות עולה. הדופק עולה – בערך 10 פעימות נוספות לכל מעלה – ולכן תפוקת הלב עולה. כלי הדם בעור מתרחבים, זרימת הדם לעור עולה ופליטת החום מהעור גדלה.',
  chips:['חילוף חומרים','דופק עולה']},
 {id:'failure',ico:'💔',name:'אי-ספיקת לב',hr:95,sv:40,
  text:'שריר הלב מוחלש ועוצמת ההתכווצות שלו נמוכה, ולכן נפח הפעימה נמוך. הדופק עולה, אך תפוקת הלב נשארת נמוכה, ובמאמץ היא עולה מעט בלבד. אספקת החמצן לשרירים מוגבלת, ומופיעים עייפות וקוצר נשימה, במיוחד במאמץ.',
  chips:['עוצמת התכווצות נמוכה','נפח פעימה נמוך']}
];

function eq(s){return '<span class="eq" dir="ltr">'+s.split(' ').map(function(t){return '<span>'+t+'</span>';}).join('')+'</span>';}
var QS=[
 {id:'q1',type:'num',unit:'ליטר/דקה',answer:6,tol:0.05,
  text:'אצל אדם במנוחה נמדדו דופק של 75 פעימות לדקה ונפח פעימה של 80 מ״ל. מהי תפוקת הלב שלו (בליטרים לדקה)?',
  exp:'תפוקת לב = דופק × נפח פעימה: '+eq('75 × 80 = 6,000')+' מ״ל לדקה, כלומר 6 ליטר לדקה.'},
 {id:'q2',type:'mc',
  text:'אדם איבד כמות גדולה של דם בתאונה. מה צפוי לקרות לנפח הפעימה ולדופק שלו (בשלב הראשון)?',
  opts:['נפח הפעימה עולה, והדופק יורד','גם נפח הפעימה וגם הדופק יורדים','נפח הפעימה יורד, והדופק עולה','אין שינוי – הלב אינו מושפע מנפח הדם'],correct:2,
  exp:'פחות דם ← פחות החזר ורידי ← החדר מתמלא פחות ← נפח הפעימה קטן. הדופק עולה, והעלייה בדופק מקטינה את הירידה בתפוקת הלב.'},
 {id:'q3',type:'mc',
  text:'מדוע הדופק במנוחה של ספורטאי סיבולת מאומן נמוך מזה של אדם לא מאומן?',
  opts:['שריר הלב שלו חלש יותר, ולכן מתכווץ לאט יותר','חדר שמאל שלו גדול וחזק יותר ונפח הפעימה גדול, ולכן אותה תפוקת לב מתקבלת בפחות פעימות','צריכת החמצן של גופו במנוחה נמוכה מזו של כל אדם אחר','אצלו הקוצב (הקשר הסינוטריאלי) אינו פעיל במנוחה'],correct:1,
  exp:'אימון סיבולת מגדיל את חדר שמאל ומחזק אותו, ולכן נפח הפעימה גדל. תפוקת הלב במנוחה דומה לזו של אדם לא מאומן (כ-5 ליטר לדקה), ועם נפח פעימה גדול יותר היא מתקבלת בדופק נמוך יותר: '+eq('50 × 100 = 5,000')+' מ״ל לדקה.'},
 {id:'q6',type:'num',unit:'מ״ל',answer:120,tol:0.5,
  text:'בזמן מאמץ נמדדו תפוקת לב של 18 ליטר לדקה ודופק של 150 פעימות לדקה. מהו נפח הפעימה (במ״ל)?',
  exp:'נפח פעימה = תפוקת לב ÷ דופק. ממירים ליטרים למ״ל: 18 ליטר = 18,000 מ״ל. '+eq('18,000 ÷ 150 = 120')+' מ״ל.'},
 {id:'q8',type:'mc',
  text:'שני אנשים במנוחה: לאדם א׳ דופק 50 ונפח פעימה 100 מ״ל; לאדם ב׳ דופק 100 ונפח פעימה 50 מ״ל. איזו טענה נכונה?',
  opts:['לאדם ב׳ תפוקת לב גבוהה יותר, כי הדופק שלו גבוה יותר','לאדם א׳ תפוקת לב גבוהה יותר, כי נפח הפעימה שלו גדול יותר','לשניהם אותה תפוקת לב (5 ליטר לדקה); אצל א׳ היא מתקבלת בפחות פעימות – כמו בלב מאומן','אי אפשר לחשב תפוקת לב בלי לדעת את לחץ הדם'],correct:2,
  exp:eq('50 × 100 = 5,000')+' מ״ל וגם '+eq('100 × 50 = 5,000')+' מ״ל – כלומר 5 ליטר לדקה לשניהם. תפוקת הלב תלויה במכפלה של שני הגורמים, לא בגורם אחד בלבד.'}
];
var LETTERS=['א','ב','ג','ד'];

/* ---------- State ---------- */
function load(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v||d;}catch(e){return d;}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(st));}catch(e){}}
var dev=load(DEVKEY,{attempts:0});
var st=load(KEY,null);
function fresh(){dev.attempts=(dev.attempts||0)+1;try{localStorage.setItem(DEVKEY,JSON.stringify(dev));}catch(e){}return {student:null,answers:{},visited:[],custom:[],attemptId:rid(),attemptNo:dev.attempts,startedAt:null,finishedAt:null};}
function rid(){var a='';for(var i=0;i<6;i++)a+='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random()*32)];return a;}
if(!st||typeof st!=='object'||!st.answers){st=fresh();save();}

var $=function(id){return document.getElementById(id);};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fmt1(x){return (Math.round(x*10)/10).toFixed(1);}
function thousands(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',');}

/* ---------- Simulation ---------- */
var hr=70, sv=70, current='rest', manual=false, paused=false;
var hrIn=$('hr'), svIn=$('sv');

function coNow(){return hr*sv/1000;}
function band(co){
  if(co<4) return 'נמוכה מהרגיל – פחות דם וחמצן מגיעים לרקמות.';
  if(co<=6.2) return 'בטווח של מנוחה (כ-5 ליטר לדקה).';
  if(co<=12) return 'מוגברת – כמו בפעילות קלה עד מתונה.';
  if(co<=25) return 'גבוהה – כמו במאמץ גופני.';
  return 'גבוהה מאוד – אופייני רק לספורטאי סיבולת במאמץ מרבי.';
}
function render(){
  var co=coNow();
  $('f-co').textContent=fmt1(co);
  $('f-hr').textContent=hr;
  $('f-sv').textContent=sv;
  $('hr-out').textContent=hr+' פעימות/דקה';
  $('sv-out').textContent=sv+' מ״ל';
  $('calc-line').innerHTML='<bdi dir="ltr">'+hr+' × '+sv+' = '+thousands(hr*sv)+'</bdi> מ״ל לדקה = <bdi dir="ltr">'+fmt1(co)+'</bdi> ליטר לדקה';
  $('g-val').textContent=fmt1(co)+' ליטר/דקה';
  $('g-fill').style.width=Math.min(100,co/35*100)+'%';
  $('g-meter').setAttribute('aria-valuenow',fmt1(co));
  $('g-note').textContent='תפוקת הלב '+band(co);
  $('beat-info').textContent='פעימה כל '+(60/hr).toFixed(2)+' שניות';
  hrIn.value=hr; svIn.value=sv;
  setFill(hrIn,40,200,'#c8102e'); setFill(svIn,30,180,'#2563eb');
}
function setFill(el,min,max,c){var p=(el.value-min)/(max-min)*100;
  el.style.background='linear-gradient(to left,'+c+' 0%,'+c+' '+p+'%,#e8ebf2 '+p+'%,#e8ebf2 100%)';
  el.style.borderRadius='999px';el.style.backgroundSize='100% 10px';el.style.backgroundRepeat='no-repeat';el.style.backgroundPosition='center';}

function buildPresets(){
  var box=$('presets');box.innerHTML='';
  SCEN.forEach(function(s){
    var b=document.createElement('button');b.type='button';b.className='preset';b.dataset.id=s.id;
    b.innerHTML='<span class="ico" aria-hidden="true">'+s.ico+'</span><span>'+esc(s.name)+'</span>';
    b.addEventListener('click',function(){applyPreset(s.id);});
    box.appendChild(b);
  });
  markPresets();
}
function markPresets(){
  Array.prototype.forEach.call(document.querySelectorAll('.preset'),function(b){
    b.classList.toggle('active',!manual&&b.dataset.id===current);
    b.classList.toggle('visited',st.visited.indexOf(b.dataset.id)>=0);
    b.setAttribute('aria-pressed',(!manual&&b.dataset.id===current)?'true':'false');
  });
}
function applyPreset(id){
  var s=SCEN.filter(function(x){return x.id===id;})[0];if(!s)return;
  current=id;manual=false;hr=s.hr;sv=s.sv;
  if(st.visited.indexOf(id)<0){st.visited.push(id);save();}
  showExplain();render();markPresets();renderChart();
}
function showExplain(){
  if(manual){
    $('ex-title').textContent='הערכים שבחרתם';
    $('ex-text').textContent='תפוקת הלב '+band(coNow())+' שימו לב: אותה תפוקת לב אפשר לקבל בשילובים שונים של דופק ונפח פעימה. להשוואה לחצו על הכפתור + הוספת הערכים שלי.';
    $('ex-chips').innerHTML='';return;
  }
  var s=SCEN.filter(function(x){return x.id===current;})[0];
  $('ex-title').textContent=s.ico+' '+s.name+' – '+s.hr+' × '+s.sv+' מ״ל ≈ '+fmt1(s.hr*s.sv/1000)+' ליטר/דקה';
  $('ex-title').innerHTML=esc(s.ico+' '+s.name)+' <small class="muted" style="font-weight:500">(<bdi dir="ltr">'+s.hr+' × '+s.sv+'</bdi> מ״ל ≈ '+fmt1(s.hr*s.sv/1000)+' ליטר/דקה)</small>';
  $('ex-text').textContent=s.text;
  $('ex-chips').innerHTML=s.chips.map(function(c){return '<span class="chip">'+esc(c)+'</span>';}).join('');
}
function onSlide(){
  hr=+hrIn.value; sv=+svIn.value; manual=true; render(); showExplain(); markPresets();
}
hrIn.addEventListener('input',onSlide); svIn.addEventListener('input',onSlide);
$('add-custom').addEventListener('click',function(){
  st.custom.push({hr:hr,sv:sv}); if(st.custom.length>4) st.custom.shift(); save(); renderChart();
});
function renderChart(){
  var rows=[];
  SCEN.forEach(function(s){ if(st.visited.indexOf(s.id)>=0) rows.push({l:s.ico+' '+s.name,sub:s.hr+' × '+s.sv,co:s.hr*s.sv/1000,c:false,active:!manual&&s.id===current}); });
  st.custom.forEach(function(c,i){ rows.push({l:'✏️ הערכים שלי '+(i+1),sub:c.hr+' × '+c.sv,co:c.hr*c.sv/1000,c:true}); });
  var ch=$('chart');
  if(!rows.length){ch.innerHTML='<p class="empty">עוד לא בדקתם מצבים. לחצו על מצב למעלה והוא יופיע כאן.</p>';return;}
  var max=Math.max(35,Math.max.apply(null,rows.map(function(r){return r.co;})));
  ch.innerHTML=rows.map(function(r){
    return '<div class="row'+(r.c?' custom':'')+'"><div class="lbl" title="'+esc(r.l)+'">'+esc(r.l)+'<small><bdi dir="ltr">'+r.sub+'</bdi> מ״ל</small></div><div class="track"><i style="width:'+(r.co/max*100).toFixed(1)+'%"></i></div><div class="v">'+fmt1(r.co)+'</div></div>';
  }).join('')+'<p class="muted small" style="margin:4px 0 0">ליטר לדקה</p>';
}

/* heart + ECG animation */
var heartBody=$('heart-body'), flash=$('beat-flash'), cv=$('ecg'), ctx=cv.getContext('2d');
var tSince=0, last=null, trace=[], SPEED=110, W=0, H=0, DPR=1, acc=0;
function sizeCanvas(){DPR=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=Math.round(W*DPR);cv.height=Math.round(H*DPR);ctx.setTransform(DPR,0,0,DPR,0,0);
  var n=Math.ceil(W); if(trace.length>n) trace=trace.slice(trace.length-n); while(trace.length<n) trace.unshift(0);}
window.addEventListener('resize',sizeCanvas);
function gauss(x,m,s){return Math.exp(-((x-m)*(x-m))/(2*s*s));}
function ecgVal(t,T){ // t = seconds since beat (R peak at ~0.04s)
  var amp=0.75+ (sv-30)/150*0.35;
  var v=0;
  v+= -0.12*gauss(t,0.015,0.008);
  v+= 1.0*amp*gauss(t,0.04,0.010);
  v+= -0.22*gauss(t,0.065,0.010);
  var tt=Math.min(0.30,0.16+0.12*T); v+=0.26*gauss(t,tt,0.045);
  var tp=T-0.12; if(tp>0.25) v+=0.12*gauss(t,tp,0.025);
  return v;
}
function frame(ts){
  if(last===null) last=ts;
  var dt=Math.min(0.05,(ts-last)/1000); last=ts;
  if(!paused){
    var T=60/hr; tSince+=dt;
    if(tSince>=T){ tSince-=T; if(tSince>T) tSince=0; }
    // heart
    var fillN=(sv-30)/150; // 0..1
    var base=0.84+0.28*fillN, amp=0.05+0.15*fillN;
    var sys=Math.min(0.32,0.38*T), s=0;
    if(tSince<sys) s=Math.sin(Math.PI*tSince/sys);
    var atr=0; var ta=T-0.1; if(ta>sys && tSince>ta-0.05 && tSince<ta+0.05) atr=0.25*Math.sin(Math.PI*(tSince-(ta-0.05))/0.1);
    var sc=base*(1-amp*s-amp*atr);
    heartBody.setAttribute('transform','translate(100 100) scale('+sc.toFixed(4)+') translate(-100 -100)');
    flash.style.opacity=(s*0.9).toFixed(3);
    // ecg
    acc+=dt*SPEED; var add=Math.floor(acc); acc-=add;
    for(var i=0;i<add;i++){ var tb=tSince-(add-1-i)/SPEED; var v=ecgVal(tb<0?tb+T:tb,T); trace.push(v); }
    if(trace.length>W+2) trace.splice(0,trace.length-Math.ceil(W));
    drawEcg();
  }
  requestAnimationFrame(frame);
}
function drawEcg(){
  ctx.clearRect(0,0,W,H);
  ctx.strokeStyle='rgba(60,180,110,.13)';ctx.lineWidth=1;ctx.beginPath();
  for(var x=0;x<W;x+=20){ctx.moveTo(x+.5,0);ctx.lineTo(x+.5,H);} for(var y=0;y<H;y+=20){ctx.moveTo(0,y+.5);ctx.lineTo(W,y+.5);} ctx.stroke();
  ctx.strokeStyle='#4ade80';ctx.lineWidth=2;ctx.lineJoin='round';ctx.beginPath();
  var mid=H*0.62, k=H*0.5, n=trace.length;
  for(var j=0;j<n;j++){var px=W-n+j, py=mid-trace[j]*k; if(j===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);} ctx.stroke();
  ctx.fillStyle='#4ade80';ctx.font='600 13px Rubik, sans-serif';ctx.textAlign='left';ctx.fillText('♥ '+hr,8,18);
}
$('pause').addEventListener('click',function(){paused=!paused;this.textContent=paused?'▶ הפעלת האנימציה':'⏸ עצירת האנימציה';this.setAttribute('aria-pressed',paused?'true':'false');});

/* ---------- Student ---------- */
function normName(s){return String(s||'').replace(/\s+/g,' ').trim();}
function answeredCount(){return QS.filter(function(q){return st.answers[q.id];}).length;}
function renderStudent(){
  var f=$('student-form'), note=$('student-locked');
  if(st.student){ $('st-name').value=st.student.name; $('st-class').value=st.student.cls; }
  var lockedNames=answeredCount()>0;
  $('st-name').disabled=lockedNames; $('st-class').disabled=lockedNames; $('st-save').disabled=lockedNames;
  $('st-save').textContent=st.student?'עדכון':'שמירה והתחלה';
  if(st.student){
    note.hidden=false;
    note.textContent='✓ נרשמו: '+st.student.name+' · כיתה '+st.student.cls+(lockedNames?' (הפרטים ננעלו כי כבר התחלתם לענות)':'');
  } else note.hidden=true;
}
$('student-form').addEventListener('submit',function(e){
  e.preventDefault(); if(answeredCount()>0) return;
  var n=normName($('st-name').value), c=normName($('st-class').value);
  if(n.length<2){$('st-name').focus();return;} if(!c){$('st-class').focus();return;}
  st.student={name:n,cls:c,savedAt:new Date().toISOString()}; save(); renderStudent(); renderQuiz();
  $('sim').scrollIntoView({behavior:'smooth',block:'start'});
});

/* ---------- Quiz ---------- */
function parseNum(s){
  s=String(s||'').trim().replace(/\s/g,'');
  if(/^\d+,\d{1,2}$/.test(s)) s=s.replace(',','.'); else s=s.replace(/,/g,'');
  if(!/^-?\d*\.?\d+$/.test(s)) return NaN; return parseFloat(s);
}
function ansText(q,a){ if(!a) return '—'; return q.type==='mc'? (LETTERS[a.value]+'. '+q.opts[a.value]) : (a.raw+' '+q.unit); }
function correctText(q){ return q.type==='mc'? (LETTERS[q.correct]+'. '+q.opts[q.correct]) : (q.answer+' '+q.unit); }
function renderQuiz(){
  var ol=$('questions'); ol.innerHTML='';
  var gated=!st.student; $('quiz-gate').hidden=!gated;
  QS.forEach(function(q,i){
    var a=st.answers[q.id];
    var li=document.createElement('li'); li.className='q'+(a?' locked':'')+(gated&&!a?' disabled':''); li.id='q-'+q.id;
    var h='<div class="q-head"><span class="q-num">'+(i+1)+'</span><div><p class="q-text">'+esc(q.text)+'</p><span class="q-type">'+(q.type==='mc'?'שאלה אמריקאית – בחרו תשובה אחת':'שאלת חישוב – הקלידו מספר')+'</span></div>'+(a?'<span class="lock">🔒 ננעל</span>':'')+'</div>';
    if(q.type==='mc'){
      h+='<ul class="opts" role="radiogroup">';
      q.opts.forEach(function(o,k){
        var cls='opt';
        if(a){ if(k===q.correct) cls+=' correct'; else if(k===a.value) cls+=' wrong'; }
        var tag=''; if(a&&k===q.correct) tag='<span class="tag">✓ נכונה</span>'; else if(a&&k===a.value) tag='<span class="tag">✗ בחרתם</span>';
        h+='<li><label class="'+cls+'"><input type="radio" name="'+q.id+'" value="'+k+'"'+(a?' disabled':'')+(a&&a.value===k?' checked':'')+'><span><b>'+LETTERS[k]+'.</b> '+esc(o)+'</span>'+tag+'</label></li>';
      });
      h+='</ul>';
    } else {
      h+='<div class="num-in"><input type="text" inputmode="decimal" id="in-'+q.id+'" aria-label="תשובה" placeholder="?" '+(a?'disabled value="'+esc(a.raw)+'"':'')+'><span class="unit">'+q.unit+'</span></div>';
    }
    if(!a){
      h+='<div class="q-actions"><button type="button" class="btn primary small" data-submit="'+q.id+'" disabled>שליחת תשובה</button><span class="hint">אפשר לשלוח פעם אחת בלבד</span></div>';
    } else {
      h+='<div class="feedback '+(a.correct?'ok':'no')+'"><b class="verdict">'+(a.correct?'✓ תשובה נכונה!':'✗ התשובה אינה נכונה')+'</b>'+
        (a.correct?'':'התשובה הנכונה: <b>'+esc(correctText(q))+'</b>')+'<div class="exp">'+q.exp+'</div></div>';
    }
    li.innerHTML=h; ol.appendChild(li);
    if(!a){
      var btn=li.querySelector('[data-submit]');
      if(q.type==='mc'){
        Array.prototype.forEach.call(li.querySelectorAll('input[type=radio]'),function(r){
          r.addEventListener('change',function(){btn.disabled=false;
            Array.prototype.forEach.call(li.querySelectorAll('.opt'),function(l){l.classList.toggle('sel',l.querySelector('input').checked);});});
        });
      } else {
        var inp=li.querySelector('input');
        inp.addEventListener('input',function(){btn.disabled=isNaN(parseNum(inp.value));});
        inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&!btn.disabled){btn.click();}});
      }
      btn.addEventListener('click',function(){submit(q,li);});
    }
  });
  var n=answeredCount();
  $('q-prog').style.width=(n/QS.length*100)+'%';
  $('q-prog-txt').textContent=n+' מתוך '+QS.length+' נענו';
  renderResults();
}
function submit(q,li){
  if(st.answers[q.id]||!st.student) return;
  var rec;
  if(q.type==='mc'){
    var r=li.querySelector('input[type=radio]:checked'); if(!r) return;
    var v=+r.value; rec={value:v,correct:v===q.correct};
  } else {
    var raw=li.querySelector('input').value.trim(); var x=parseNum(raw); if(isNaN(x)) return;
    rec={value:x,raw:raw,correct:Math.abs(x-q.answer)<=q.tol};
  }
  rec.at=new Date().toISOString();
  if(!st.startedAt) st.startedAt=rec.at;
  st.answers[q.id]=rec;
  if(answeredCount()===QS.length && !st.finishedAt) st.finishedAt=rec.at;
  save(); renderStudent(); renderQuiz();
  var el=$('q-'+q.id); if(el){ var fb=el.querySelector('.feedback'); if(fb&&fb.scrollIntoView) fb.scrollIntoView({behavior:'smooth',block:'nearest'}); }
}

/* ---------- Results ---------- */
function cyrb53(str,seed){var h1=0xdeadbeef^(seed||0),h2=0x41c6ce57^(seed||0);for(var i=0,ch;i<str.length;i++){ch=str.charCodeAt(i);h1=Math.imul(h1^ch,2654435761);h2=Math.imul(h2^ch,1597334677);}
  h1=Math.imul(h1^(h1>>>16),2246822507)^Math.imul(h2^(h2>>>13),3266489909);h2=Math.imul(h2^(h2>>>16),2246822507)^Math.imul(h1^(h1>>>13),3266489909);return 4294967296*(2097151&h2)+(h1>>>0);}
function codeFor(name,score){var s=cyrb53(SALT+'|'+normName(name)+'|'+score).toString(36).toUpperCase();while(s.length<8)s='0'+s;s=s.slice(-8);return s.slice(0,4)+'-'+s.slice(4);}
function score(){return QS.filter(function(q){return st.answers[q.id]&&st.answers[q.id].correct;}).length;}
function dt(iso){if(!iso)return '—';var d=new Date(iso);var p=function(n){return (n<10?'0':'')+n;};return p(d.getDate())+'/'+p(d.getMonth()+1)+'/'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes());}
function renderResults(){
  var done=answeredCount()===QS.length && st.student;
  $('res-pending').hidden=!!done; $('res-done').hidden=!done; $('res-after').hidden=!done;
  renderSave(!!done);
  if(!done) return;
  var sc=score(), pct=Math.round(sc/QS.length*100);
  $('score-num').textContent=sc+'/'+QS.length; $('score-pct').textContent=pct+'%';
  $('score-ring').style.setProperty('--p',pct);
  $('score-name').textContent=st.student.name+' · כיתה '+st.student.cls;
  $('score-meta').innerHTML='הסתיים: <bdi dir="ltr">'+dt(st.finishedAt)+'</bdi> · ניסיון מס׳ '+st.attemptNo+' במכשיר זה';
  $('score-code').textContent=codeFor(st.student.name,sc);
}

/* ---------- PDF ---------- */
var pdfCache=null;
function pdfName(){var n=(st.student.name+'_'+st.student.cls).replace(/[\\\/:*?"<>|]+/g,'').replace(/\s+/g,'_');return 'תפוקת-לב_'+n+'.pdf';}
function buildPages(){
  var stage=$('pdf-stage'); stage.innerHTML='';
  var sc=score(), code=codeFor(st.student.name,sc);
  var items=[];
  items.push('<div class="pdf-top"><div><h1>תפוקת הלב – תוצאות שאלות הבנה</h1><p>סימולציה: דופק × נפח פעימה = תפוקת לב</p></div><div class="pdf-score"><b>'+sc+'/'+QS.length+'</b><small>'+Math.round(sc/QS.length*100)+'%</small></div></div>');
  items.push('<div class="pdf-info"><div><span>שם</span><b>'+esc(st.student.name)+'</b></div><div><span>כיתה</span><b>'+esc(st.student.cls)+'</b></div><div><span>תאריך ושעת סיום</span><b><bdi dir="ltr">'+dt(st.finishedAt)+'</bdi></b></div>'+
    '<div><span>התחלת המענה</span><b><bdi dir="ltr">'+dt(st.startedAt)+'</bdi></b></div><div><span>ניסיון במכשיר זה</span><b>'+st.attemptNo+' (מזהה <bdi dir="ltr">'+st.attemptId+'</bdi>)</b></div><div><span>קוד אימות</span><b><bdi dir="ltr">'+code+'</bdi></b></div></div>');
  var vis=SCEN.filter(function(s){return st.visited.indexOf(s.id)>=0;}).map(function(s){return s.name;});
  items.push('<p class="pdf-visited">מצבים שנבדקו בסימולציה ('+vis.length+' מתוך '+SCEN.length+'): '+(vis.length?esc(vis.join(' · ')):'—')+'</p>');
  QS.forEach(function(q,i){
    var a=st.answers[q.id], ok=a&&a.correct;
    items.push('<div class="pdf-q '+(ok?'ok':'no')+'"><div class="qh"><div>'+(i+1)+'. '+esc(q.text)+'</div><div class="st">'+(ok?'✓ נכון':'✗ לא נכון')+'</div></div>'+
      '<div class="ans"><div><span>תשובת התלמיד/ה: </span>'+esc(ansText(q,a))+'</div>'+(ok?'':'<div><span>התשובה הנכונה: </span><b>'+esc(correctText(q))+'</b></div>')+'</div>'+
      '<div class="ex">'+q.exp+'</div></div>');
  });
  var pages=[], page=null, body=null;
  function newPage(){page=document.createElement('div');page.className='pdf-page';body=document.createElement('div');page.appendChild(body);
    var f=document.createElement('div');f.className='pfoot';page.appendChild(f);stage.appendChild(page);pages.push(page);}
  newPage();
  var LIMIT=1123-46-60;
  items.forEach(function(html){
    var w=document.createElement('div');w.innerHTML=html;var el=w.firstChild;body.appendChild(el);
    if(body.offsetHeight>LIMIT && body.childNodes.length>1){body.removeChild(el);newPage();body.appendChild(el);}
  });
  pages.forEach(function(p,i){p.querySelector('.pfoot').innerHTML='<span>'+esc(st.student.name)+' · כיתה '+esc(st.student.cls)+' · קוד <bdi dir="ltr">'+code+'</bdi></span><span>עמוד '+(i+1)+' מתוך '+pages.length+'</span>';});
  return pages;
}
var pdfPending=null;
function makePdf(silent){
  if(pdfCache) return Promise.resolve(pdfCache);
  if(pdfPending){ if(!silent) $('pdf-status').textContent='מכין את הקובץ…'; return pdfPending; }
  var status=$('pdf-status'); if(!silent) status.textContent='מכין את הקובץ…';
  pdfPending=(function(){
  var fontsReady=(document.fonts&&document.fonts.ready)?document.fonts.ready:Promise.resolve();
  return fontsReady.then(function(){
    var pages=buildPages();
    var jsPDF=window.jspdf.jsPDF; var doc=new jsPDF({orientation:'p',unit:'mm',format:'a4',compress:true});
    var chain=Promise.resolve();
    pages.forEach(function(p,i){
      chain=chain.then(function(){
        return html2canvas(p,{scale:2,backgroundColor:'#ffffff',useCORS:true,logging:false,
          onclone:function(d){var s=d.getElementById('pdf-stage');if(s){s.style.left='0';s.style.top='0';s.style.position='absolute';}}})
        .then(function(c){ if(i>0) doc.addPage(); doc.addImage(c.toDataURL('image/jpeg',0.9),'JPEG',0,0,210,297); });
      });
    });
    return chain.then(function(){
      doc.setProperties({title:'תפוקת הלב – '+st.student.name,subject:'תוצאות שאלות הבנה',author:st.student.name});
      var blob=doc.output('blob'); $('pdf-stage').innerHTML='';
      if(!silent) status.textContent='הקובץ מוכן ✓';
      pdfCache={blob:blob,name:pdfName()}; return pdfCache;
    });
  }).catch(function(e){status.textContent='יצירת הקובץ נכשלה. נסו את הכפתור 🖨 הדפסה / שמירה כ-PDF, או צלמו מסך של הסיכום. ('+(e&&e.message||e)+')';throw e;});
  })();
  pdfPending.then(function(){pdfPending=null;},function(){pdfPending=null;});
  return pdfPending;
}
/* ---------- Saving: share (phones) / download / open / print ---------- */
var UA=navigator.userAgent||'';
var isIOS=/iPhone|iPad|iPod/i.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1);
var isAndroid=/Android/i.test(UA);
var inApp=/WhatsApp|Instagram|FBAN|FBAV|FB_IAB|FBIOS|FB4A|Line\/|Snapchat|TikTok|musical_ly|Telegram|MicroMessenger/i.test(UA)||(isAndroid&&/; ?wv\)/.test(UA));
var canShareFiles=false;
try{ canShareFiles=!!(navigator.canShare&&navigator.share&&navigator.canShare({files:[new File([new Blob(['x'],{type:'application/pdf'})],'t.pdf',{type:'application/pdf'})]})); }catch(e){}
var SHARE_TITLE='תפוקת הלב – ', SHARE_TEXT='התוצאות שלי בשאלות על תפוקת הלב';
if(inApp){
  var browserName=isIOS?'Safari':'Chrome', how=isIOS?'(⋯ ← פתיחה ב-Safari)':'(⋮ ← פתיחה בדפדפן)';
  Array.prototype.forEach.call(document.querySelectorAll('.inapp-note'),function(n){
    var m=n.querySelector('.inapp-main'); if(m) m.innerHTML='לשמירת ה-PDF פתחו את הקישור בדפדפן '+browserName+'&rlm; <bdi dir="rtl">'+how+'</bdi>';
    n.hidden=false;
  });
}
Array.prototype.forEach.call(document.querySelectorAll('.copy-link'),function(b){
  b.addEventListener('click',function(){
    var url=location.href.split('#')[0];
    function done(){b.textContent='✓ הקישור הועתק – הדביקו אותו בשורת הכתובת של הדפדפן';}
    function legacy(){try{var t=document.createElement('textarea');t.value=url;t.setAttribute('readonly','');t.style.position='fixed';t.style.top='0';t.style.opacity='0';document.body.appendChild(t);t.select();t.setSelectionRange(0,url.length);var ok=document.execCommand('copy');t.remove();if(ok)done();else prompt('העתיקו את הקישור:',url);}catch(e){prompt('העתיקו את הקישור:',url);}}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(url).then(done,legacy);} else legacy();
  });
});
// Button roles: on phones that can share files, the main button opens the share sheet
// (WhatsApp / Drive / email…) and a second button downloads; elsewhere the main button downloads.
if(canShareFiles){ $('pdf-btn').textContent='📤 שליחה / שמירה של ה-PDF'; $('share-btn').hidden=false; }
function markSaved(){ if(!st.pdfAt){st.pdfAt=new Date().toISOString();save();} }
function showFallback(){ $('res-fallback').hidden=false; }
function download(p){
  var url=URL.createObjectURL(p.blob); var a=document.createElement('a'); a.href=url; a.download=p.name; a.rel='noopener'; document.body.appendChild(a); a.click();
  setTimeout(function(){URL.revokeObjectURL(url);a.remove();},60000);
  markSaved(); showFallback();
  $('pdf-status').textContent=inApp?'הקובץ מוכן. אם לא הופיעה הורדה – פתחו את הקישור בדפדפן (ראו ההודעה למעלה).':'הקובץ ירד למכשיר ✓ (בתיקיית ההורדות). לא רואים אותו? לחצו על 📄 פתיחת ה-PDF.';
}
function shareOrDownload(p){
  if(!canShareFiles){ download(p); return Promise.resolve(); }
  // share() needs a fresh tap; if the PDF took too long to build, ask for one more tap
  if(navigator.userActivation&&!navigator.userActivation.isActive){
    $('pdf-status').textContent='הקובץ מוכן ✓ לחצו שוב על 📤 שליחה / שמירה של ה-PDF.'; showFallback(); return Promise.resolve();
  }
  var file=new File([p.blob],p.name,{type:'application/pdf'});
  return navigator.share({files:[file],title:SHARE_TITLE+st.student.name,text:SHARE_TEXT}).then(function(){
    markSaved(); showFallback(); $('pdf-status').textContent='הקובץ נשלח / נשמר ✓';
  }).catch(function(e){ showFallback(); if(e&&e.name==='AbortError'){ $('pdf-status').textContent='השיתוף בוטל. אפשר לנסות שוב, או ללחוץ על ⬇ הורדה למכשיר.'; return; } download(p); });
}
function busy(b,fn){ if(b.disabled) return; b.disabled=true; makePdf().then(fn).catch(function(){showFallback();}).then(function(){b.disabled=!resultsDone();}); }
$('pdf-btn').addEventListener('click',function(){ busy(this,shareOrDownload); });
$('share-btn').addEventListener('click',function(){ busy(this,download); });
$('open-btn').addEventListener('click',function(){
  if(!pdfCache){ busy(this,function(p){ $('pdf-status').textContent='הקובץ מוכן ✓ לחצו שוב על 📄 פתיחת ה-PDF.'; }); return; }
  var url=URL.createObjectURL(pdfCache.blob); var w=null;
  try{ w=window.open(url,'_blank'); }catch(e){}
  markSaved();
  $('pdf-status').textContent=w?'ה-PDF נפתח בחלון חדש – שמרו או שתפו אותו משם.':'החלון לא נפתח. נסו את 🖨 הדפסה / שמירה כ-PDF, או צלמו מסך של הסיכום ושלחו למורה.';
});
$('print-btn').addEventListener('click',function(){
  if(!resultsDone()) return;
  var go=function(){
    buildPages(); document.documentElement.classList.add('printing');
    var clean=function(){document.documentElement.classList.remove('printing'); $('pdf-stage').innerHTML=''; window.removeEventListener('afterprint',clean);};
    window.addEventListener('afterprint',clean);
    markSaved();
    setTimeout(function(){ try{ window.print(); }catch(e){} },60);
  };
  (document.fonts&&document.fonts.ready?document.fonts.ready:Promise.resolve()).then(go);
});
function resultsDone(){ return !!(answeredCount()===QS.length && st.student); }
function renderSave(done){
  $('pdf-btn').disabled=!done; $('share-btn').disabled=!done; $('pdf-lock').hidden=!!done;
  if(!done){ $('pdf-lock-txt').textContent='הכפתור ייפתח אחרי שתענו על כל השאלות ('+answeredCount()+' מתוך '+QS.length+')'; $('res-fallback').hidden=true; }
  else { if(inApp) showFallback(); if(!pdfCache && !prebuildStarted){ prebuildStarted=true; setTimeout(function(){ makePdf(true).catch(function(){}); },700); } }
}
var prebuildStarted=false;
$('reset-btn').addEventListener('click',function(){
  if(!confirm('למחוק את התשובות והפרטים מהמכשיר הזה ולהתחיל מחדש לתלמיד/ה חדש/ה?')) return;
  st=fresh(); save(); pdfCache=null; location.hash=''; location.reload();
});

/* ---------- Teacher verify ---------- */
$('verify-form').addEventListener('submit',function(e){e.preventDefault();
  var ok=codeFor($('v-name').value,parseInt($('v-score').value,10))===$('v-code').value.trim().toUpperCase().replace(/[^0-9A-Z]/g,'').replace(/^(.{4})(.{4})$/,'$1-$2');
  var r=$('v-result'); r.className='v-result '+(ok?'ok':'no'); r.textContent=ok?'✓ הקוד תואם לשם ולציון':'✗ הקוד אינו תואם – ייתכן שהשם או הציון שונו (או שהוקלדו אחרת מהקובץ)';
});

/* ---------- Init ---------- */
buildPresets(); applyPreset('rest'); renderStudent(); renderQuiz(); sizeCanvas(); requestAnimationFrame(frame);
window.__cosim={codeFor:codeFor,makePdf:makePdf};
})();
