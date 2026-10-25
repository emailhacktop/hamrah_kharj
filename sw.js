// Service Worker — مسیرها نسبی‌اند تا برنامه هم روی دامنه اصلی، هم روی زیرمسیر
// (مثل https://user.github.io/repo/) و هم آفلاین درست کار کند.
// در زمان بیلد، فهرست کامل فایل‌های ساخته‌شده (assets/* و fonts/*) به‌صورت خودکار
// توسط vite.config.js در ثابت ASSETS تزریق می‌شود تا همه منابع آفلاین در دسترس باشند.
const CACHE = 'hka-v3';
const ASSETS = ["./","./index.html","./app-icon.png","./favicon.png","./logo.png","./manifest.webmanifest","./assets/index-8G5dCMhP.js","./assets/index-Y83qxB3B.css","./fonts/Vazirmatn-Bold.woff2","./fonts/Vazirmatn-ExtraBold.woff2","./fonts/Vazirmatn-Medium.woff2","./fonts/Vazirmatn-Regular.woff2","./fonts/Vazirmatn-SemiBold.woff2"];

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
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          // فقط درخواست‌های باز کردن صفحه به پوسته index.html برمی‌گردند (نه اسکریپت یا فونت)
          if (req.mode === 'navigate') return caches.match('./index.html');
          return Response.error();
        })
      )
  );
});
