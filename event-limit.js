(() => {
  const allowed=window.CMAllowedEvents||['C108','C109','C110','C111','C112','C113','C114','C115'];
  const clean=()=>document.querySelectorAll('#eventTabs [data-event]').forEach(b=>{if(!allowed.includes(b.dataset.event))b.remove()});
  new MutationObserver(clean).observe(document.body,{subtree:true,childList:true});
  clean();
})();
