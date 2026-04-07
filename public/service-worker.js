const CACHE_NAME = 'jemechu-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './main.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache addAll failed:', err))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 외부 API (Open-Meteo, Kakao 등) 요청은 캐시를 거치지 않고 강제로 네트워크로 보냅니다.
  // 이 방식이 CORS 문제를 가장 깔끔하게 해결합니다.
  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('./index.html'))
  );
});
