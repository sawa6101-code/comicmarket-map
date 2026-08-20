(()=>{'use strict';
function bind(){
 document.addEventListener('click',e=>{
  const b=e.target.closest('#eventTabs [data-event]');
  if(!b)return;
  e.preventDefault();
  e.stopPropagation();
  const id=b.dataset.event;
  if(window.CMEvent && window.CMEvent.events.includes(id)){
   window.CMEvent.set(id);
   // Reload is intentional: it switches the storage namespace before app state is loaded.
   window.location.reload();
  }
 },true);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
