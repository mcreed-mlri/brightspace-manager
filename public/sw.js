const CACHE_NAME = "bsm-admin-v4";
const ASSETS_TO_CACHE = ["/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png"];

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

function shouldBypassCache(event, url) {
  if (event.request.method !== "GET") return true;
  if (url.protocol !== "http:" && url.protocol !== "https:") return true;

  // Authenticated app documents and Next.js route payloads must always hit the
  // network so cookie/session changes are reflected immediately.
  if (event.request.mode === "navigate") return true;
  if (event.request.destination === "document") return true;
  if (url.search) return true;
  if (url.pathname.startsWith("/api/")) return true;
  if (url.pathname.startsWith("/auth/")) return true;
  if (url.pathname === "/sign-in" || url.pathname.startsWith("/sign-in/")) return true;
  if (event.request.headers.get("rsc") === "1") return true;
  if (event.request.headers.get("next-router-prefetch")) return true;
  if (event.request.headers.get("next-router-state-tree")) return true;

  return false;
}

function shouldCacheResponse(url, response) {
  if (!response || response.status !== 200) return false;
  if (url.pathname.startsWith("/_next/static/")) return true;
  return ASSETS_TO_CACHE.includes(url.pathname);
}

// Fetch Event. Only cache safe public/static assets. Authenticated app
// documents, API calls, and Next.js route payloads go straight to the network.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (shouldBypassCache(event, url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (shouldCacheResponse(url, networkResponse)) {
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
