(() => {
  'use strict';
  const KEY='comicmarket-map-v7';
  const $=id=>document.getElementById(id);
  const sections={map:'mapSection',list:'listSection',money:'moneySection',time:'timeSection'};
  const scrollToSection=id=>{const el=$(id);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});};
  document.addEventListener('click',e=>{
    const nav=e.target.closest('.bottom-nav [data-nav]');
    if(nav){e.preventDefault();document.querySelectorAll('.bottom-nav button').forEach(b=>b.classList.toggle('active',b===nav));scrollToSection(sections[nav.dataset.nav]);return;}
    const ev=e.target.closest('[data-event]');
    if(ev){e.preventDefault();try{localStorage.setItem('comicmarket-active-event',ev.dataset.event)}catch{}location.reload();return;}
    const sort=e.target.closest('#sortList');
    if(sort){e.preventDefault();sort.dispatchEvent(new CustomEvent('cm-sort',{bubbles:true}));return;}
  },true);
  document.addEventListener('change',e=>{
    if(e.target.id==='travelerSelect'){
      try{const raw=localStorage.getItem(KEY);if(raw){const s=JSON.parse(raw);s.travelerFilter=e.target.value;localStorage.setItem(KEY,JSON.stringify(s));}}catch{}
      if(typeof window.render==='function')window.render();else location.reload();
    }
  },true);
  const lockWidth=()=>{document.documentElement.style.maxWidth='100vw';document.body.style.maxWidth='100vw';document.body.style.overflowX='hidden';};
  lockWidth();window.addEventListener('resize',lockWidth,{passive:true});
})();
