/**
 * AI LABS BY NIMBUS - SERVICE WORKER
 * Network-first for real-time fidelity, falling back to cache when offline.
 */

const CACHE_NAME = 'nimbus-pwa-v20';

const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './dapper.css',
  './script.js',
  './manifest.webmanifest',
  './assets/logo.png',
  './assets/logo_tight.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/hero-01.png',
  './assets/hero-02.png',
  './assets/hero-03.png',
  './assets/hero-04.png',
  './assets/hero-05.png',
  './assets/hero-06.png',
  './assets/hero-07.png',
  './assets/hero-08.png',
  './assets/hero-09.png',
  './assets/hero-10.png',
  './assets/hero-cloud1.png',
  './assets/hero-cloud2.png',
  './assets/hero-cloud3.png',
  './assets/hero-cloud4.png',
  './assets/hero-cloud5.png',
  './assets/hero-cloud6.png',
  './assets/hero-cloud7.png',
  './assets/hero-cloud8.png',
  './assets/bg-footer.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Cache addAll failed for some assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-First with Cache Fallback (for instant updates and offline support)
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
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

