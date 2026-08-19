(() => {
  const KEY='comicmarket-map-v7';
  const originalSetItem=Storage.prototype.setItem;
  const originalGet=Storage.prototype.getItem;
  Storage.prototype.setItem=function(key,value){
    if(key===KEY){
      try{
        const oldRaw=originalGet.call(this,key);
        const oldState=oldRaw?JSON.parse(oldRaw):null;
        const next=JSON.parse(value);
        if(Array.isArray(next.circles)){
          const oldById=new Map((oldState?.circles||[]).map(c=>[c.id,c]));
          next.circles.forEach(c=>{
            const old=oldById.get(c.id);
            if(!old || old.status!==c.status){
              const now=new Date().toISOString();
              if(c.status==='COMPLETED') c.completedAt=now; else delete c.completedAt;
              if(c.status==='SOLD_OUT') c.soldOutAt=now; else delete c.soldOutAt;
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
})();
