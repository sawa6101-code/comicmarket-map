const CACHE='comicmarket-map-v16';
const ASSETS=['./','./index.html','./style.css?v=17','./event-layer.js?v=2','./app-v2.js?v=2','./pdf-map.js?v=3','./ui-fixes.js?v=2','./manifest.json','./maps/east123.webp','./maps/west12.webp','./maps/east7.jpg','./maps/south12.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).catch(()=>{}));self.skipWaiting()});
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match('./index.html'))))});
