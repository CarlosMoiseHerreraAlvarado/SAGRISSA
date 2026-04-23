// Service Worker - SAGRISSA PWA
// Fundamentos para modo Offline-First según Sección 13 de la Fuente Técnica Maestra

const CACHE_NAME = 'sagrissa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/favicon.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Estrategia: Cache First con Network Fallback para Offline
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
