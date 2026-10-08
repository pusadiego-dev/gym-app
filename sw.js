// Service worker: guarda la app para usarla sin conexión en el gimnasio.
const CACHE = "gymapp-v21";
const FILES = ["./", "index.html", "css/styles.css", "js/app.js", "js/cardio.js", "js/anim.js", "js/exercises.js", "js/program.js", "js/store.js", "js/drive.js", "js/timer.js", "js/theme.js", "js/config.js", "js/extras.js", "manifest.webmanifest", "icons/icon.svg", "icons/icon-180.png", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Red primero para los archivos de la app (así recibes actualizaciones), caché si no hay conexión.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return;
  e.respondWith(
    // no-cache: pide siempre al servidor si hay versión nueva (GitHub Pages cachea 10 min)
    fetch(e.request.mode === "navigate" ? e.request.url : e.request, { cache: "no-cache" })
      .then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html")))
  );
});
