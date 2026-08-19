(() => {
  const viewport = document.getElementById('mapViewport');
  const canvas = document.getElementById('mapCanvas');
  const image = document.getElementById('mapImage');
  const maps = document.getElementById('maps');
  if (!viewport || !canvas || !image || !maps) return;

  const ASSETS = {
    '東123': { src: './maps/east123.webp', ratio: 1320 / 571 },
    '西12':  { src: './maps/west12.webp', ratio: 1201 / 860 },
    '東7':   { src: './maps/east7.jpg', ratio: 874 / 877 },
    '南12':  { src: './maps/south12.jpg', ratio: 1253 / 698 }
  };

  viewport.style.touchAction = 'none';
  viewport.style.webkitUserSelect = 'none';
  viewport.style.userSelect = 'none';
  viewport.style.webkitTouchCallout = 'none';
  image.style.pointerEvents = 'none';
  image.style.touchAction = 'none';

  function readState() {
    try { return JSON.parse(localStorage.getItem('comicmarket-map-v6') || 'null') || {}; }
    catch { return {}; }
  }
  function writeState(s) { localStorage.setItem('comicmarket-map-v6', JSON.stringify(s)); }
  function activeDay() { return document.querySelector('#days [data-day].active')?.dataset.day || '1日目'; }
  function activeMap() { return document.querySelector('#maps [data-map].active')?.dataset.map || readState().map || '東123'; }
  function applyAsset(id) { const a=ASSETS[id]; if(!a)return; image.src=a.src; image.alt=`コミケット公式 ${id} 白地図`; canvas.style.aspectRatio=String(a.ratio); }
  function patchMapButtons(){const active=activeMap();[...maps.querySelectorAll('[data-map]')].forEach(b=>{if(ASSETS[b.dataset.map]){b.disabled=false;b.textContent=b.dataset.map;b.classList.toggle('active',b.dataset.map===active)}});applyAsset(active)}
  patchMapButtons();
  new MutationObserver(patchMapButtons).observe(maps,{childList:true,subtree:true});
  maps.addEventListener('click',e=>{const b=e.target.closest('[data-map]');if(!b||!ASSETS[b.dataset.map])return;b.disabled=false;setTimeout(()=>{applyAsset(b.dataset.map);scale=1;tx=0;ty=0;draw()},0)},true);

  let scale=1,tx=0,ty=0,start=null,moved=false,touches=new Map(),registering=false,pendingPoint=null;

  // Keep the map inside the viewport. Because transform-origin is center/center,
  // the maximum safe translation is half of the overflow on each axis.
  // This prevents the user from panning the map completely off-screen.
  function clampPan(){
    const vw=viewport.clientWidth;
    const vh=viewport.clientHeight;
    const bw=canvas.offsetWidth;
    const bh=canvas.offsetHeight;
    if(!vw||!vh||!bw||!bh)return;
    const maxX=Math.max(0,(bw*scale-vw)/2);
    const maxY=Math.max(0,(bh*scale-vh)/2);
    tx=Math.max(-maxX,Math.min(maxX,tx));
    ty=Math.max(-maxY,Math.min(maxY,ty));
  }

  function draw(){clampPan();canvas.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${scale})`;const z=document.getElementById('zoomReset');if(z)z.textContent=`${Math.round(scale*100)}%`}
  function setRegisterMode(on){registering=on;const hint=document.getElementById('mapModeHint');const btn=document.getElementById('registerMode');if(hint)hint.classList.toggle('hidden',!on);if(btn)btn.textContent=on?'登録モード終了':'＋ 地図から登録';viewport.classList.toggle('registering',on)}
  function mapPoint(x,y){const r=canvas.getBoundingClientRect();return{x:Math.max(0,Math.min(1,(x-r.left)/r.width)),y:Math.max(0,Math.min(1,(y-r.top)/r.height))}}

  document.getElementById('registerMode')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();setRegisterMode(!registering)},true);

  // Robust item-add handler: capture the click before any other handler so it works on iOS Safari/PWA.
  document.addEventListener('click',e=>{
    const btn=e.target.closest('#addItem');
    if(!btn)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const rows=document.getElementById('itemRows');
    if(!rows)return;
    const row=document.createElement('div');
    row.className='item-row';
    row.innerHTML='<label>商品<input class="i-name" autocomplete="off" placeholder="新刊など"></label><label>数量<input class="i-qty" type="number" min="1" value="1"></label><label>単価<input class="i-price" type="number" min="0" value="0"></label><button class="ghost removeItem" type="button" aria-label="商品を削除">×</button>';
    const total=()=>{
      let n=0;
      rows.querySelectorAll('.item-row').forEach(r=>n+=(Number(r.querySelector('.i-qty')?.value)||1)*(Number(r.querySelector('.i-price')?.value)||0));
      const t=document.getElementById('formTotal');if(t)t.textContent='¥'+Math.round(n).toLocaleString('ja-JP');
    };
    row.querySelectorAll('input').forEach(i=>i.addEventListener('input',total));
    row.querySelector('.removeItem').addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();row.remove();total()});
    rows.appendChild(row);
    row.querySelector('.i-name')?.focus();
    total();
  },true);

  function openRegistration(p){
    pendingPoint=p;
    const card=document.getElementById('formCard');if(!card)return;
    document.getElementById('positionText').textContent=`地図位置：${(p.x*100).toFixed(1)}% / ${(p.y*100).toFixed(1)}%`;
    document.getElementById('circleName').value='';document.getElementById('space').value='';document.getElementById('buyer').value='';
    const rows=document.getElementById('itemRows');rows.innerHTML='';document.getElementById('addItem')?.click();
    document.getElementById('saveCircle').textContent='登録する';card.classList.remove('hidden');document.getElementById('circleName')?.focus();
  }
  function finishRegistration(){
    if(!pendingPoint)return false;
    const name=document.getElementById('circleName').value.trim(),space=document.getElementById('space').value.trim(),buyer=document.getElementById('buyer').value.trim();
    const items=[...document.querySelectorAll('#itemRows .item-row')].map(r=>({name:r.querySelector('.i-name')?.value.trim()||'',qty:Number(r.querySelector('.i-qty')?.value)||1,price:Number(r.querySelector('.i-price')?.value)||0})).filter(i=>i.name);
    if(!name||!space){alert('サークル名とスペースは必須です');return true}if(!items.length){alert('購入するものを1件以上入力してください');return true}
    const state=readState();state.circles=Array.isArray(state.circles)?state.circles:[];state.circles.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),day:activeDay(),map:activeMap(),name,space,buyer,items,x:pendingPoint.x,y:pendingPoint.y,status:'UNVISITED'});writeState(state);pendingPoint=null;document.getElementById('formCard').classList.add('hidden');location.reload();return true;
  }
  document.getElementById('saveCircle')?.addEventListener('click',e=>{if(!pendingPoint)return;e.preventDefault();e.stopImmediatePropagation();finishRegistration()},true);
  document.getElementById('cancelForm')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();pendingPoint=null;document.getElementById('formCard').classList.add('hidden')},true);

  function registerAt(x,y){openRegistration(mapPoint(x,y));setRegisterMode(false)}
  function beginTouch(list){touches=new Map([...list].map(t=>[t.identifier,{x:t.clientX,y:t.clientY}]));moved=false;if(touches.size===1){const p=[...touches.values()][0];start={x:p.x,y:p.y,tx,ty,scale}}else if(touches.size>=2){const a=[...touches.values()];start={dist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),scale}}}
  viewport.addEventListener('touchstart',e=>{if(e.target.closest('.marker'))return;e.preventDefault();e.stopImmediatePropagation();beginTouch(e.touches)},{capture:true,passive:false});
  viewport.addEventListener('touchmove',e=>{if(!start)return;e.preventDefault();e.stopImmediatePropagation();touches=new Map([...e.touches].map(t=>[t.identifier,{x:t.clientX,y:t.clientY}]));if(touches.size===1&&start.dist==null){const p=[...touches.values()][0];tx=start.tx+p.x-start.x;ty=start.ty+p.y-start.y;if(Math.hypot(p.x-start.x,p.y-start.y)>7)moved=true;draw()}else if(touches.size>=2&&start.dist>0){const a=[...touches.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);scale=Math.max(.8,Math.min(5,start.scale*d/start.dist));moved=true;draw()}},{capture:true,passive:false});
  viewport.addEventListener('touchend',e=>{if(!start)return;e.preventDefault();e.stopImmediatePropagation();const wasSingle=start.dist==null,t=e.changedTouches[0];touches=new Map([...e.touches].map(x=>[x.identifier,{x:x.clientX,y:x.clientY}]));if(wasSingle&&!moved&&!touches.size&&registering&&t)registerAt(t.clientX,t.clientY);if(!touches.size){clampPan();start=null}else if(touches.size===1){const p=[...touches.values()][0];start={x:p.x,y:p.y,tx,ty,scale};moved=false;draw()}},{capture:true,passive:false});
  viewport.addEventListener('touchcancel',e=>{e.preventDefault();e.stopImmediatePropagation();touches.clear();start=null;moved=false;draw()},{capture:true,passive:false});
  let mouse=null;viewport.addEventListener('mousedown',e=>{if(e.target.closest('.marker'))return;mouse={x:e.clientX,y:e.clientY,tx,ty};moved=false},true);viewport.addEventListener('mousemove',e=>{if(!mouse)return;tx=mouse.tx+e.clientX-mouse.x;ty=mouse.ty+e.clientY-mouse.y;if(Math.hypot(e.clientX-mouse.x,e.clientY-mouse.y)>6)moved=true;draw()},true);viewport.addEventListener('mouseup',e=>{if(!mouse)return;if(!moved&&registering)registerAt(e.clientX,e.clientY);mouse=null;draw()},true);
  viewport.addEventListener('wheel',e=>{e.preventDefault();scale=Math.max(.8,Math.min(5,scale+(e.deltaY<0?.15:-.15)));draw()},{capture:true,passive:false});
  document.getElementById('zoomIn')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();scale=Math.min(5,scale+.25);draw()},true);document.getElementById('zoomOut')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();scale=Math.max(.8,scale-.25);draw()},true);document.getElementById('zoomReset')?.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();scale=1;tx=0;ty=0;draw()},true);
  window.addEventListener('resize',draw);
  image.addEventListener('load',draw);
  draw();
})();
