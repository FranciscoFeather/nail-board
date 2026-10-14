// Nail board offline copy: the page is saved on the phone, so the board opens
// with no internet. A fresh copy is used when it arrives within 3 seconds,
// otherwise the saved one. Only this page; never the mockup service (another
// address) and never anything posted.
const C='nail-board-v1';
self.addEventListener('install',e=>e.waitUntil(caches.open(C).then(c=>c.addAll(['./'])).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
 const key=r.mode==='navigate'?'./':r,saved=()=>caches.match(key,{ignoreSearch:true});
 const fresh=fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(key,cp))}return res});
 e.respondWith(new Promise(done=>{let over=false;const end=x=>{if(!over&&x){over=true;done(x)}};
  const t=setTimeout(()=>saved().then(end),3000);
  fresh.then(x=>{clearTimeout(t);end(x)}).catch(()=>{clearTimeout(t);saved().then(m=>{end(m);if(!m)end(Response.error())})})}))});
