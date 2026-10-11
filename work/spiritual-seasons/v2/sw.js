/* Spiritual Seasons v2 — offline-first service worker (cache-first) */
const CACHE = 'ss-v2-1';
const PRECACHE = [
  './', './index.html',
  './css/styles.css', './js/app.js',
  './content/book.json', './content/quiz.json',
  './manifest.webmanifest',
  './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/images/book-cover.webp',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return; // only same-origin
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: false }).then((hit) => {
      if (hit) return hit;
      return fetch(event.request).then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        }
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
