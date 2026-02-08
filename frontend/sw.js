
const CACHE_NAME = 'hostelease-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/offline.html'
  // Note: CDN URLs (Tailwind, Google Fonts) are NOT cached here due to CORS restrictions
  // They will be fetched on-demand and cached if the browser allows
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Only handle navigation requests for offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request).then(fetchResponse => {
           // Optional: Dynamic caching of fetched assets
           return fetchResponse;
        }).catch(err => {
          // Log the error but don't throw - return empty response
          console.debug('Service Worker: Fetch failed for', event.request.url, err);
          // Return a minimal response instead of crashing
          return new Response('Service unavailable', { status: 503 });
        });
      })
      .catch(err => {
        // Handle cache match errors
        console.debug('Service Worker: Cache match failed', err);
        return new Response('Service unavailable', { status: 503 });
      })
  );
});
