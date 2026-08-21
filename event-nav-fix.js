(()=>{'use strict';
const EVENT_KEY='comicmarket-active-event',PREFIX='comicmarket-event-',EVENTS=['C108','C109','C110','C111','C112','C113','C114','C115'];
const get=Storage.prototype.getItem,set=Storage.prototype.setItem;
const activeEvent=()=>{const v=get.call(localStorage,EVENT_KEY);return EVENTS.includes(v)?v:'C108'};
const switchEvent=id=>{if(EVENTS.includes(id)){set.call(localStorage,EVENT_KEY,id);window.location.reload()}};
function updateStatus(button){const id=button.dataset.id,status=button.dataset.status;if(!id||!status)return false;const key=PREFIX+activeEvent();let state;try{state=JSON.parse(get.call(localStorage,key)||'null')}catch{return false}if(!state||!Array.isArray(state.circles))return false;const c=state.circles.find(x=>x.id===id);if(!c)return false;c.status=status;const now=new Date().toISOString();if(status==='COMPLETED'){c.completedAt=now;delete c.soldOutAt}else if(status==='SOLD_OUT'){c.soldOutAt=now;delete c.completedAt}else{delete c.completedAt;delete c.soldOutAt}set.call(localStorage,key,JSON.stringify(state));window.location.reload();return true}
function bind(){document.addEventListener('click',e=>{const eb=e.target.closest('#eventTabs [data-event]');if(eb){e.preventDefault();e.stopImmediatePropagation();switchEvent(eb.dataset.event);return}const sb=e.target.closest('#list .statusBtn');if(sb){e.preventDefault();e.stopImmediatePropagation();updateStatus(sb)}},true)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();})();
