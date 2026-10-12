const V='aarti-v12';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','manifest.json','icon-180.png','icon-192.png'].map(x=>new Request(x,{cache:'reload'}))).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const ok=u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!ok)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const m=await c.match(r,{ignoreSearch:true});
    const net=(u.origin===location.origin?fetch(r.url,{cache:'no-cache',credentials:'same-origin'}):fetch(r)).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(r,x.clone());return x}).catch(()=>null);
    if(m){e.waitUntil(net);return m}
    const x=await net;if(x)return x;
    if(r.mode==='navigate'){const h=await c.match('./',{ignoreSearch:true});if(h)return h}
    return new Response('Offline',{status:503})
  })())
});
