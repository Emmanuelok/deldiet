/* Only the offline page and its icon are stored. */
const CACHE = 'deldiet-offline-v3';
const OFFLINE_PAGE = '/offline.html';
const FAVICON = '/brand/crimson/favicon.svg';
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll([OFFLINE_PAGE, FAVICON]);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith('deldiet-offline-') && key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname === FAVICON) {
    event.respondWith(fetch(event.request).catch(() => caches.match(FAVICON, { cacheName: CACHE }).then(icon => icon || Response.error())));
  } else if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE_PAGE, { cacheName: CACHE }).then(page => page || Response.error())));
  }
});
