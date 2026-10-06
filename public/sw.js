/*
 * Mok Car Rental — minimal service worker.
 *
 * Deliberately small: a network-first strategy with an offline fallback to
 * the app shell only. It does NOT cache API responses or car data, so stale
 * availability is never served. The PWA layer here is about installability
 * (manifest + SW + install prompt) and giving a repeat-booking "Rebook in one
 * tap" home-screen shortcut, not offline data.
 *
 * Regenerate/edit by hand as needed. It must exist at /sw.js for the browser
 * to treat the site as an installable PWA.
 */

const CACHE_NAME = 'mok-pwa-v1';
// App-shell precache. Keep this list short and explicit.
const APP_SHELL = ['/', '/cars', '/booking', '/faq', '/about', '/contact'];

// Expose the cache name so the install-prompt component can reference it.
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Only intercept same-origin HTML navigation + static assets. Never API/Supabase.
  if (url.origin !== self.location.origin) return;
  const isHtml = req.mode === 'navigate' || req.destination === 'document';
  if (!isHtml) return;

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return fetch(req)
        .then((res) => {
          // Store a fresh copy.
          const copy = res.clone();
          cache.put(req, copy).catch(() => {});
          return res;
        })
        .catch(() => {
          // Offline fallback: serve cached shell, else the root page.
          return cache.match(req).then((cached) => cached || cache.match('/'));
        });
    })
  );
});
