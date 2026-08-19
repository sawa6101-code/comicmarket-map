(() => {
  const APP_KEY='comicmarket-map-v7', EVENT_KEY='comicmarket-active-event', PREFIX='comicmarket-event-';
  const get=Storage.prototype.getItem, set=Storage.prototype.setItem, remove=Storage.prototype.removeItem;
  const events=['C108',...Array.from({length:7},(_,i)=>`C${109+i}`)];
  window.CMEvent={events,get(){return get.call(localStorage,EVENT_KEY)||'C108'},set(v){if(events.includes(v))set.call(localStorage,EVENT_KEY,v)},switch(v){if(events.includes(v)){this.set(v);location.reload()}}};
  for(let n=116;n<=130;n++)remove.call(localStorage,PREFIX+`C${n}`);
  if(!get.call(localStorage,PREFIX+'C108')){const legacy=get.call(localStorage,APP_KEY);if(legacy)set.call(localStorage,PREFIX+'C108',legacy)}
  const active=()=>PREFIX+(events.includes(get.call(localStorage,EVENT_KEY))?get.call(localStorage,EVENT_KEY):'C108');
  Storage.prototype.getItem=function(k){return k===APP_KEY?get.call(this,active()):get.call(this,k)};
  Storage.prototype.setItem=function(k,v){return k===APP_KEY?set.call(this,active(),v):set.call(this,k,v)};
  Storage.prototype.removeItem=function(k){return k===APP_KEY?remove.call(this,active()):remove.call(this,k)};
  window.CMAllowedEvents=events;
})();
