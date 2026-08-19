(() => {
  const APP_KEY='comicmarket-map-v7', EVENT_KEY='comicmarket-active-event', PREFIX='comicmarket-event-';
  const get=Storage.prototype.getItem, set=Storage.prototype.setItem, remove=Storage.prototype.removeItem;
  window.CMEvent={events:['C108',...Array.from({length:22},(_,i)=>`C${109+i}`)],get(){return get.call(localStorage,EVENT_KEY)||'C108'},set(v){set.call(localStorage,EVENT_KEY,v)},switch(v){this.set(v);location.reload()}};
  if(!get.call(localStorage,PREFIX+'C108')){const legacy=get.call(localStorage,APP_KEY);if(legacy)set.call(localStorage,PREFIX+'C108',legacy)}
  const active=()=>PREFIX+(get.call(localStorage,EVENT_KEY)||'C108');
  Storage.prototype.getItem=function(k){return k===APP_KEY?get.call(this,active()):get.call(this,k)};
  Storage.prototype.setItem=function(k,v){return k===APP_KEY?set.call(this,active(),v):set.call(this,k,v)};
  Storage.prototype.removeItem=function(k){return k===APP_KEY?remove.call(this,active()):remove.call(this,k)};
})();
