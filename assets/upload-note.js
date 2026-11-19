/* שורת הנחיה קבועה מתחת לכל כפתור הורדה/שמירה כ-PDF: מעלים את הקובץ עצמו ל-Classroom, לא קישור */
(function(){
  var TXT='📤 <b>העלו את הקובץ שירד (PDF) למשימה ב-Classroom, לא קישור.</b> ב-Classroom: "הוספה או יצירה" ← "קובץ" ← בוחרים את הקובץ מתיקיית ההורדות.';
  var SEL='#dl, button.dl, .pdfbtn, button.print, button[onclick*="print()"]';
  var css=document.createElement('style');
  css.textContent='.upnote{display:block;max-width:640px;margin:10px auto 0;background:#FFF8E1;border:2px solid #F2B705;border-radius:12px;padding:8px 14px;color:#13233A;font:600 15px/1.5 Assistant,Heebo,Arial,sans-serif;text-align:start;direction:rtl}.upnote b{font-weight:800}@media print{.upnote{display:none!important}}';
  document.head.appendChild(css);
  function add(){
    document.querySelectorAll(SEL).forEach(function(b){
      if(b.dataset.upnote) return; b.dataset.upnote='1';
      var n=document.createElement('p'); n.className='upnote'; n.innerHTML=TXT;
      var anchor=b; var nx=b.nextElementSibling;
      if(nx && (nx.id==='dlmsg' || /pdfhint/.test(nx.className))) anchor=nx;
      anchor.insertAdjacentElement('afterend', n);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', add); else add();
  try{ new MutationObserver(add).observe(document.body||document.documentElement,{childList:true,subtree:true}); }catch(e){}
})();
