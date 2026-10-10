// Service Worker — مسیرها نسبی‌اند تا برنامه هم روی دامنه اصلی، هم روی زیرمسیر
// (مثل https://user.github.io/repo/) و هم آفلاین درست کار کند.
const CACHE = 'hka-v2';
const ASSETS = ['./', './index.html', './app-icon.png', './manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // منابع بیرونی دست‌کاری نمی‌شوند

  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(req, copy));
        return res;
      })
      .catch(() =>
        // وقتی آفلاین هستیم: اگر مسیر یک «صفحه» بود، پوسته برنامه را بده
        caches.match(req).then((cached) => cached || caches.match('./index.html'))
      )
  );
});
