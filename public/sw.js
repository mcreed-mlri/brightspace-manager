const CACHE_NAME = "bsm-admin-v2";
const ASSETS_TO_CACHE = ["/", "/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png"];

// Install Event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()),
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Fetch Event. Two regimes:
//  - Navigations (HTML): network-FIRST, so sign-in redirects and sign-out
//    always reach the server; cache is only an offline fallback. Cache-first
//    here would keep serving authenticated pages after sign-out.
//  - Static assets: cache-first with background refresh.
//  - API: always network, never cached — admins must see fresh data.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip browser extensions and Next.js dev hot-reloading
  if (url.protocol !== "http:" && url.protocol !== "https:") return;
  if (url.pathname.includes("_next/webpack") || url.pathname.includes("hot-update")) return;

  // Never cache API responses — admins must always see fresh health/inventory data.
  if (url.pathname.startsWith("/api/")) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(event.request).then((cached) => cached || caches.match("/"))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      });

      return cachedResponse || fetchPromise;
    }),
  );
});
