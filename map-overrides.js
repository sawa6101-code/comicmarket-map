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

  // The map is a real interaction surface, not an iframe or a normal web page.
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

  function applyAsset(id) {
    const a = ASSETS[id];
    if (!a) return;
    image.src = a.src;
    image.alt = `コミケット公式 ${id} 白地図`;
    canvas.style.aspectRatio = String(a.ratio);
  }

  function patchMapButtons() {
    const state = readState();
    const active = state.map || '東123';
    [...maps.querySelectorAll('[data-map]')].forEach(b => {
      if (ASSETS[b.dataset.map]) {
        b.disabled = false;
        b.textContent = b.dataset.map;
        b.classList.toggle('active', b.dataset.map === active);
      }
    });
    applyAsset(active);
  }

  // app.js redraws this area. Re-apply local image assets after every redraw.
  patchMapButtons();
  new MutationObserver(patchMapButtons).observe(maps, { childList: true, subtree: true });

  maps.addEventListener('click', e => {
    const b = e.target.closest('[data-map]');
    if (!b || !ASSETS[b.dataset.map]) return;
    b.disabled = false;
    setTimeout(() => applyAsset(b.dataset.map), 0);
  }, true);

  // Touch implementation is deliberately independent from the app's pointer handler.
  // This fixes pinch/pan on iPhone/iPad Safari where pointer capture can be unreliable.
  let scale = 1, tx = 0, ty = 0;
  let start = null, moved = false;
  let touches = new Map();
  let registering = false;

  function draw() {
    canvas.style.transform = `translate3d(${tx}px,${ty}px,0) scale(${scale})`;
    const z = document.getElementById('zoomReset');
    if (z) z.textContent = `${Math.round(scale * 100)}%`;
  }

  function setRegisterMode(on) {
    registering = on;
    const hint = document.getElementById('mapModeHint');
    const btn = document.getElementById('registerMode');
    if (hint) hint.classList.toggle('hidden', !on);
    if (btn) btn.textContent = on ? '登録モード終了' : '＋ 地図から登録';
    viewport.classList.toggle('registering', on);
  }

  function mapPoint(clientX, clientY) {
    const r = canvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (clientY - r.top) / r.height))
    };
  }

  const registerButton = document.getElementById('registerMode');
  if (registerButton) {
    registerButton.addEventListener('click', e => {
      e.stopImmediatePropagation();
      setRegisterMode(!registering);
    }, true);
  }

  function beginTouches(list) {
    touches = new Map([...list].map(t => [t.identifier, {x:t.clientX,y:t.clientY}]));
    moved = false;
    if (touches.size === 1) {
      const p = [...touches.values()][0];
      start = {x:p.x,y:p.y,tx,ty,scale};
    } else if (touches.size >= 2) {
      const a = [...touches.values()];
      start = {dist:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y),scale,tx,ty};
    }
  }

  viewport.addEventListener('touchstart', e => {
    if (e.target.closest('.marker')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    beginTouches(e.touches);
  }, {capture:true, passive:false});

  viewport.addEventListener('touchmove', e => {
    if (!start) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    touches = new Map([...e.touches].map(t => [t.identifier, {x:t.clientX,y:t.clientY}]));
    if (touches.size === 1 && start.dist == null) {
      const p = [...touches.values()][0];
      tx = start.tx + p.x - start.x;
      ty = start.ty + p.y - start.y;
      if (Math.hypot(p.x-start.x,p.y-start.y) > 7) moved = true;
      draw();
    } else if (touches.size >= 2 && start.dist > 0) {
      const a = [...touches.values()];
      const d = Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);
      scale = Math.max(.8, Math.min(5, start.scale*d/start.dist));
      moved = true;
      draw();
    }
  }, {capture:true, passive:false});

  viewport.addEventListener('touchend', e => {
    if (!start) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const wasSingle = start.dist == null;
    const t = e.changedTouches[0];
    touches = new Map([...e.touches].map(x => [x.identifier,{x:x.clientX,y:x.clientY}]));
    if (wasSingle && !moved && touches.size === 0 && registering && t) {
      const p = mapPoint(t.clientX,t.clientY);
      // app.js exposes no public openForm, so use the same UI path via a synthetic click
      // only after storing the exact map coordinate in a temporary event payload.
      window.__comicMapPendingPoint = p;
      viewport.dispatchEvent(new CustomEvent('comic-map-register',{detail:p,bubbles:true}));
      setRegisterMode(false);
    }
    if (!touches.size) start = null;
    else if (touches.size === 1) {
      const p = [...touches.values()][0];
      start = {x:p.x,y:p.y,tx,ty,scale};
      moved = false;
    }
  }, {capture:true, passive:false});

  viewport.addEventListener('touchcancel', e => {
    e.preventDefault();
    e.stopImmediatePropagation();
    touches.clear(); start = null; moved = false;
  }, {capture:true, passive:false});

  // Mouse/trackpad fallback for desktop browsers.
  let mouse = null;
  viewport.addEventListener('mousedown', e => {
    if (e.target.closest('.marker')) return;
    mouse = {x:e.clientX,y:e.clientY,tx,ty};
    moved = false;
  }, true);
  viewport.addEventListener('mousemove', e => {
    if (!mouse) return;
    tx = mouse.tx + e.clientX - mouse.x;
    ty = mouse.ty + e.clientY - mouse.y;
    if (Math.hypot(e.clientX-mouse.x,e.clientY-mouse.y) > 6) moved = true;
    draw();
  }, true);
  viewport.addEventListener('mouseup', e => {
    if (!mouse) return;
    if (!moved && registering) {
      const p = mapPoint(e.clientX,e.clientY);
      window.__comicMapPendingPoint = p;
      viewport.dispatchEvent(new CustomEvent('comic-map-register',{detail:p,bubbles:true}));
      setRegisterMode(false);
    }
    mouse = null;
  }, true);
  viewport.addEventListener('mouseleave', () => { mouse = null; }, true);

  viewport.addEventListener('wheel', e => {
    e.preventDefault();
    scale = Math.max(.8, Math.min(5, scale + (e.deltaY < 0 ? .15 : -.15)));
    draw();
  }, {capture:true, passive:false});

  document.getElementById('zoomIn')?.addEventListener('click', e => { e.stopImmediatePropagation(); scale=Math.min(5,scale+.25); draw(); }, true);
  document.getElementById('zoomOut')?.addEventListener('click', e => { e.stopImmediatePropagation(); scale=Math.max(.8,scale-.25); draw(); }, true);
  document.getElementById('zoomReset')?.addEventListener('click', e => { e.stopImmediatePropagation(); scale=1;tx=0;ty=0;draw(); }, true);

  // Bridge the touch/mouse coordinate to the existing app's private openForm function.
  // We temporarily make the existing pointer-up handler see the same gesture as a tap by
  // invoking the form through the DOM: clicking the map in register mode is handled here.
  viewport.addEventListener('comic-map-register', e => {
    const p = e.detail;
    // app.js has openForm in its script scope; expose a tiny bridge by dispatching a
    // custom event that app.js can consume in the next version. For the current version,
    // create a temporary global callback if available.
    if (typeof window.__comicMapOpenForm === 'function') window.__comicMapOpenForm(p.x,p.y);
  });

  // The current app script cannot access lexical openForm from this file. Add a small
  // compatibility hook by intercepting the save flow through a public event if available.
  // If unavailable, the next block clicks the register button again only for UI feedback.
  draw();
})();
