const V='aarti-v13';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','manifest.json','icon-180.png','icon-192.png'].map(x=>new Request(x,{cache:'reload'}))).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  const ok=u.origin===location.origin||u.hostname==='fonts.googleapis.com'||u.hostname==='fonts.gstatic.com';
  if(!ok)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const nav=r.mode==='navigate'||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname));
    const key=nav?new URL('./',location.href).href:(u.origin===location.origin?u.origin+u.pathname:r);
    const m=await c.match(key);
    const net=(u.origin===location.origin?fetch(nav?key:u.origin+u.pathname,{cache:'no-cache',credentials:'same-origin'}):fetch(r)).then(x=>{if(x&&(x.ok||x.type==='opaque'))c.put(key,x.clone());return x}).catch(()=>null);
    if(nav&&m){const t=new Promise(res=>setTimeout(()=>res(null),3000));const x=await Promise.race([net,t]);if(x&&x.ok)return x;e.waitUntil(net);return m}
    if(m){e.waitUntil(net);return m}
    const x=await net;if(x)return x;
    if(r.mode==='navigate'){const h=await c.match('./',{ignoreSearch:true});if(h)return h}
    return new Response('Offline',{status:503})
  })())
});
