(() => {
  const KEY='comicmarket-map-v7';
  const originalSetItem=Storage.prototype.setItem;
  Storage.prototype.setItem=function(key,value){
    if(key===KEY){
      try{
        const oldRaw=originalGet.call(this,key);
        const oldState=oldRaw?JSON.parse(oldRaw):null;
        const next=JSON.parse(value);
        if(oldState&&Array.isArray(oldState.circles)&&Array.isArray(next.circles)){
          const oldById=new Map(oldState.circles.map(c=>[c.id,c]));
          next.circles.forEach(c=>{
            const old=oldById.get(c.id);
            if(!old || old.status!==c.status){
              if(c.status==='COMPLETED') c.completedAt=new Date().toISOString();
              else delete c.completedAt;
              if(c.status==='SOLD_OUT') c.soldOutAt=new Date().toISOString();
              else delete c.soldOutAt;
            } else {
              if(c.status==='COMPLETED' && old.completedAt) c.completedAt=old.completedAt;
              if(c.status==='SOLD_OUT' && old.soldOutAt) c.soldOutAt=old.soldOutAt;
            }
          });
          value=JSON.stringify(next);
        }
      }catch{}
    }
    return originalSetItem.call(this,key,value);
  };
  const originalGet=Storage.prototype.getItem;
})();
