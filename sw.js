/**
 * Caches the static app so it can open offline after the first visit.
 * Paths are relative so GitHub Pages project sites resolve correctly.
 */

const CACHE = "static-v3.3.3";
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

async function cacheResponse(request, response) {
  if (response?.status === 200 && response?.type === "basic") {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
}

async function fromNetwork(request) {
  const response = await fetch(request);
  try {
    await cacheResponse(request, response);
  } catch {
    /* A failed cache write still leaves the network response usable. */
  }
  return response;
}

async function fromCacheOrNetwork(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    return await fromNetwork(request);
  } catch {
    if (request.destination === "document") return caches.match("./index.html");
    return Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(fromCacheOrNetwork(event.request));
});
