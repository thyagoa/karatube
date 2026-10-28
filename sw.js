const CACHE = 'karatube-1793220470';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-180.png'];
const EXTRA = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdn.jsdelivr.net', 'i.ytimg.com'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const same = u.origin === location.origin;
  if (same && u.pathname.endsWith('version.json')) return; // sempre da rede
  if (!same && !EXTRA.includes(u.hostname)) return; // APIs (oEmbed, MusicBrainz…) passam direto
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(r, { ignoreSearch: same });
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(net); return hit; }
    const res = await net;
    if (res) return res;
    if (r.mode === 'navigate') return (await c.match('index.html')) || Response.error();
    return Response.error();
  }));
});
