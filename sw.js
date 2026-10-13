// Service worker: keeps a copy of the site on the phone so it opens without internet.
// V must match the cache name in index.html; change both on every deploy.
const V='aarti-v116';
// Font files (the same list is in index.html)
const FONTS=['inter-latin','inter-latin-ext','noto-sans-deva-devanagari','noto-sans-deva-latin','noto-sans-deva-latin-ext','tiro-marathi-devanagari','tiro-marathi-latin','tiro-marathi-latin-ext','tiro-sanskrit-devanagari','tiro-sanskrit-latin','tiro-sanskrit-latin-ext'].map(f=>'fonts/'+f+'.woff2');
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','manifest.json','icon-180.png','icon-192.png','icon-32.png','icon-maskable-192.png',...FONTS].map(x=>new Request(x,{cache:'reload'}))).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
// Same-site files: the page itself is fetched fresh when possible (3 s limit, then the saved copy);
// everything else is answered from the saved copy and refreshed in the background.
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith((async()=>{
    const c=await caches.open(V);
    const nav=r.mode==='navigate'||/\/(index\.html)?$/.test(u.pathname);
    const key=nav?new URL('./',location.href).href:u.origin+u.pathname;
    const m=await c.match(key);
    if(m&&u.pathname.includes('/fonts/'))return m; // font files never change
    const net=()=>fetch(nav?key:u.origin+u.pathname,{cache:'no-cache',credentials:'same-origin'}).then(x=>{if(x&&x.ok)c.put(key,x.clone());return x}).catch(()=>null);
    let n;
    if(nav&&m){const t=new Promise(res=>setTimeout(()=>res(null),3000));const x=await Promise.race([n=net(),t]);if(x&&x.ok)return x;e.waitUntil(n);return m}
    if(m){e.waitUntil(net());return m}
    const x=await net();if(x)return x;
    if(r.mode==='navigate'){const h=await c.match('./',{ignoreSearch:true});if(h)return h}
    return new Response('Offline',{status:503})
  })())
});
