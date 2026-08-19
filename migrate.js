(()=>{try{const old=localStorage.getItem('comicmarket-map-v6');const cur=localStorage.getItem('comicmarket-map-v7');if(old&&!cur)localStorage.setItem('comicmarket-map-v7',old)}catch{}})();

window.addEventListener('load',()=>{
  const vp=document.getElementById('mapViewport');
  if(!vp)return;
  let activePointer=null,startX=0,startY=0,moved=false,suppressClick=false;

  // 登録モードでは、既存のドラッグ処理より先にタップを確保する。
  vp.addEventListener('pointerdown',e=>{
    if(!vp.classList.contains('registering') || e.target.closest('.marker')) return;
    activePointer=e.pointerId;
    startX=e.clientX; startY=e.clientY; moved=false;
    e.preventDefault();
    e.stopImmediatePropagation();
  },{capture:true,passive:false});

  vp.addEventListener('pointermove',e=>{
    if(activePointer!==e.pointerId)return;
    if(Math.hypot(e.clientX-startX,e.clientY-startY)>10)moved=true;
    e.preventDefault();
    e.stopImmediatePropagation();
  },{capture:true,passive:false});

  vp.addEventListener('pointerup',e=>{
    if(activePointer!==e.pointerId)return;
    const wasTap=!moved;
    activePointer=null;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(wasTap && vp.classList.contains('registering')){
      const p=mapPoint(e.clientX,e.clientY);
      openForm(p.x,p.y);
      vp.classList.remove('registering');
      document.getElementById('mapModeHint')?.classList.add('hidden');
      const btn=document.getElementById('registerMode');
      if(btn)btn.textContent='＋ 地図から登録';
      suppressClick=true;
      setTimeout(()=>{suppressClick=false},400);
    }
  },{capture:true,passive:false});

  vp.addEventListener('pointercancel',e=>{
    if(activePointer!==e.pointerId)return;
    activePointer=null;moved=false;
    e.preventDefault();e.stopImmediatePropagation();
  },{capture:true,passive:false});

  // Safari/PWAでclickが遅れて発生した場合の二重登録防止。
  vp.addEventListener('click',e=>{
    if(suppressClick){
      e.preventDefault();
      e.stopImmediatePropagation();
      suppressClick=false;
    }
  },{capture:true});
});