const CACHE='comicmarket-map-v19';
const CORE=['./','./index.html','./style.css?v=19','./event-layer.js?v=3','./app-v2.js?v=3','./interaction-fix.js?v=1','./ui-fixes.js?v=4','./manifest.json','./maps/east123.webp','./maps/west12.webp','./maps/east7.jpg','./maps/south12.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy)).catch(()=>{})}return r}).catch(()=>caches.match('./index.html'))))});
