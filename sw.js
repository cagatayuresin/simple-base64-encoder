/**
 * Caches the static app so it can open offline after the first visit.
 * Paths are relative so GitHub Pages project sites resolve correctly.
 */

const CACHE = "static-v3.3.1";
const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./src/css/style.css",
  "./src/js/app.js",
  "./src/js/theme.js",
  "./src/js/converters.js",
  "./src/js/fileHandler.js",
  "./src/img/favicon.svg",
  "./src/img/icon-180.png",
  "./src/img/icon-192.png",
  "./src/img/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") return response;
          const copy = response.clone();
          caches
            .open(CACHE)
            .then((cache) => cache.put(event.request, copy))
            .catch(() => {
              /* A failed cache write still leaves the network response usable. */
            });
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") return caches.match("./index.html");
          return Response.error();
        });
    })
  );
});
