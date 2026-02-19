const CACHE_NAME = "domtech-app-v1";
const STATIC_CACHE = "static-v1";
const DYNAMIC_CACHE = "dynamic-v1";

// Files that make your app load (App Shell)
const APP_SHELL = [
  "/",
  "/index.html",
  "/site.webmanifest",
  "/apple-touch-icon.png",
  "/favicon.ico",
  "/favicon.svg",
  "/web-app-manifest-192x192.png",
  "/web-app-manifest-512x512.png"
];


// INSTALL - Cache App Shell
self.addEventListener("install", event => {
  console.log("Service Worker Installing...");
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(APP_SHELL);
    })
  );

  self.skipWaiting();
});


// ACTIVATE - Cleanup old caches
self.addEventListener("activate", event => {
  console.log("Service Worker Activated");

  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (
            key !== STATIC_CACHE &&
            key !== DYNAMIC_CACHE
          ) {
            return caches.delete(key);
          }
        })
      );
    })
  );

  self.clients.claim();
});


// FETCH - Offline Strategy
self.addEventListener("fetch", event => {
  const request = event.request;

  // Only cache GET requests
  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse; // return from cache
      }

      return fetch(request)
        .then(networkResponse => {
          return caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Optional offline fallback page
          if (request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
