const CACHE = "mir-lery-20261111-232818";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // сама игра: сначала сеть (чтобы была свежая версия), без интернета — из сохранённого
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request, { cache: "no-store" }).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put("./index.html", copy)); return res; }).catch(() => caches.match("./index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => {
    const net = fetch(e.request).then(res => {
      if (res && (res.ok || res.type === "opaque")) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
