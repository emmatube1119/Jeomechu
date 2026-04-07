const CACHE_NAME = 'jemechu-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './main.js'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 즉시 활성화
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .catch(err => console.log('Cache addAll failed:', err))
  );
});

self.addEventListener('activate', event => {
  // 이전 캐시 버전 삭제
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // 외부 API 요청은 절대 가로채지 않고 그대로 통과시킴
  if (url.origin !== location.origin) {
    return; // 네트워크로 바로 전달 (CORS 문제 방지)
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
      .catch(() => caches.match('./index.html'))
  );
});
