/* Pompon au CP : le site continue de marcher sans internet (version 5d7bff61) */
const CACHE="pompon-5d7bff61",SONS="pompon-sons",POLICES="pompon-polices",VOIX="pompon-voix";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./favicon.svg","./favicon-32.png","./apple-touch-icon.png","./marelle.ttf"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>![CACHE,SONS,POLICES,VOIX].includes(k)).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
/* d'abord le cache (sons, polices) : ils ne changent jamais */
const cacheFirst=(name,r)=>caches.open(name).then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==="opaque")c.put(r,res.clone());return res})));
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.hostname.endsWith("supabase.co"))return; /* la base de données : jamais en cache */
  if(u.origin===location.origin&&u.pathname.includes("/audio/"))return e.respondWith(cacheFirst(SONS,r));
  if(/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname))return e.respondWith(cacheFirst(POLICES,r));
  if(u.origin!==location.origin)return;
  /* la page : la version en ligne si elle arrive vite, sinon celle gardée sur la tablette */
  e.respondWith(new Promise(res=>{let done=false;
    const net=fetch(r).then(x=>{if(x.ok){const cp=x.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return x});
    const fallback=()=>caches.match(r,{ignoreSearch:true}).then(m=>m||caches.match("./index.html"));
    const t=setTimeout(()=>fallback().then(m=>{if(m&&!done){done=true;res(m)}}),5000);
    net.then(x=>{clearTimeout(t);if(!done){done=true;res(x)}}).catch(()=>{clearTimeout(t);fallback().then(m=>{if(!done){done=true;res(m||Response.error())}})});
  }));
});
