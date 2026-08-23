(()=>{'use strict';
const KEY='comicmarket-map-v7';
const LABEL={NO_LINE:'列形成なし',WAITING_LINE:'列待機中',COMPLETED:'購入済み',SOLD_OUT:'完売'};
function activeKey(){return 'comicmarket-event-'+(localStorage.getItem('comicmarket-active-event')||'C108')}
function read(){try{return JSON.parse(localStorage.getItem(activeKey())||localStorage.getItem(KEY)||'{}')}catch{return {}}}
function write(s){localStorage.setItem(activeKey(),JSON.stringify(s))}
function render(){const s=read(),list=document.getElementById('timeList'),empty=document.getElementById('timeEmpty');if(!list)return;const rows=(s.circles||[]).filter(c=>c.statusAt&&c.statusLabel).sort((a,b)=>new Date(b.statusAt)-new Date(a.statusAt));empty?.classList.toggle('hidden',rows.length>0);list.innerHTML=rows.map(c=>`<article class="time-row"><strong>${String(c.name||'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]))}</strong><span>${c.statusLabel}　${new Date(c.statusAt).toLocaleString('ja-JP')}</span></article>`).join('')}
document.addEventListener('click',e=>{const b=e.target.closest('.statusBtn');if(!b)return;setTimeout(()=>{const s=read(),c=(s.circles||[]).find(x=>x.id===b.dataset.id);if(!c)return;c.statusAt=new Date().toISOString();c.statusLabel=LABEL[b.dataset.status]||b.dataset.status;if(b.dataset.status!=='COMPLETED'&&b.dataset.status!=='SOLD_OUT'){c.statusAt=null;c.statusLabel=null}write(s);render()},0)},{passive:true});
document.addEventListener('click',e=>{if(e.target.closest('[data-nav="time"]'))setTimeout(render,0)},{passive:true});window.CMStatusTime={refresh:render};
})();
