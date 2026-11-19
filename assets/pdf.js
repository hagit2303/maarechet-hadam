// הורדת PDF מכל דפדפן — הועתק מקורס החקלאות; צבעי אטלס
async function downloadPdf(el,fname,filter){const scale=2;const canvas=await htmlToImage.toCanvas(el,{pixelRatio:scale,backgroundColor:'#ffffff',filter});
 const{jsPDF}=window.jspdf;const pdf=new jsPDF({unit:'mm',format:'a4'});const pw=190,ph=277,px=canvas.width/pw,pageH=Math.floor(ph*px);let y=0,first=true;
 while(y<canvas.height-2){const end=Math.min(y+pageH,canvas.height);const c=document.createElement('canvas');c.width=canvas.width;c.height=end-y;c.getContext('2d').drawImage(canvas,0,y,canvas.width,end-y,0,0,canvas.width,end-y);
  if(!first)pdf.addPage();pdf.addImage(c.toDataURL('image/jpeg',.9),'JPEG',10,10,pw,(end-y)/px);first=false;y=end}deliverPdf(pdf,fname)}
/* מסירת הקובץ: ניסיון הורדה אוטומטית + חלון עם כפתורים שהתלמיד לוחץ בעצמו (כרום, טלפונים ואפליקציות חוסמים הורדה אוטומטית) */
function deliverPdf(pdf,fname){const blob=pdf.output('blob'),url=URL.createObjectURL(blob);let file=null;try{file=new File([blob],fname,{type:'application/pdf'})}catch(e){}
 try{const a=document.createElement('a');a.href=url;a.download=fname;a.style.display='none';document.body.appendChild(a);a.click();setTimeout(()=>a.remove(),1000)}catch(e){}
 const canShare=!!(file&&navigator.canShare&&navigator.canShare({files:[file]}));const inApp=/; wv\)|GSA\/|FBAN|FBAV|Instagram|Line\/|CriOS/.test(navigator.userAgent);
 let box=document.getElementById('pdfBox');if(!box){box=document.createElement('div');box.id='pdfBox';document.body.appendChild(box)}
 box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
 box.style.cssText='position:fixed;inset:0;z-index:2000;background:rgba(19,35,58,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Assistant,Arial,sans-serif;direction:rtl';
 const btn='display:block;text-align:center;text-decoration:none;font:700 18px Assistant,Arial,sans-serif;padding:12px;border:2px solid #13233A;margin-top:8px;cursor:pointer;width:100%;box-sizing:border-box';
 box.innerHTML=`<div style="background:#fff;border:3px solid #13233A;max-width:440px;width:100%;padding:20px;color:#13233A"><h2 style="font-family:Assistant,Arial,sans-serif;font-weight:800;margin:0 0 6px">✅ הקובץ מוכן</h2>
 <p style="margin:0 0 8px;background:#FFF1E6;border:2px solid #C2410C;border-radius:10px;padding:8px 10px;font-weight:700">⚠️ במשימה ב-Classroom: "הוספה או יצירה" ← "קובץ" ← בוחרים את הקובץ ששמרתם. לא מדביקים קישור: קישור כזה נפתח רק במחשב שלכם, ואי אפשר לבדוק אותו.</p>
 <p style="margin:0 0 6px">שמרו את הקובץ, ואז העלו אותו למשימה ב-Classroom. אם ההורדה לא התחילה לבד — לחצו כאן:</p>
 <a href="${url}" download="${fname}" style="${btn};background:#13233A;color:#fff">⬇ הורדת הקובץ</a>
 ${canShare?`<button type="button" id="pdfShare" style="${btn};background:#F2B705;color:#13233A">📤 שיתוף / שמירה בקבצים</button>`:''}
 <a href="${url}" target="_blank" rel="noopener" style="${btn};background:#fff;color:#13233A">📄 פתיחת הקובץ (ומשם שמירה)</a>
 ${inApp?'<p style="background:#FFF8E1;border:1.5px dashed #F2B705;padding:8px;font-size:15px">פתחתם מתוך אפליקציה? אם לא מצליח: לחצו על ⋮ או על ••• ובחרו "פתיחה בדפדפן" (Chrome או Safari), וחזרו על הלחיצה.</p>':''}
 <p style="font-size:14px;color:#5E6E82;margin:8px 0 0">שם הקובץ: ${fname}</p>
 <button type="button" id="pdfClose" style="${btn};background:#fff;color:#5E6E82;border-color:#5E6E82">סגירה</button></div>`;
 const sh=document.getElementById('pdfShare');if(sh)sh.onclick=()=>navigator.share({files:[file],title:fname}).catch(()=>{});
 document.getElementById('pdfClose').onclick=()=>{box.remove()}}
