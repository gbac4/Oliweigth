// OliWeight — service worker
// Change VERSION à chaque mise en ligne : les téléphones récupèrent alors la nouvelle version.
const VERSION = 'oliweight-v3.4.1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './css/app.css',
  './js/config.js',
  './js/cycle.js',
  './js/util.js',
  './js/store.js',
  './js/rules.js',
  './js/energy.js',
  './js/kcal.js',
  './js/weights.js',
  './js/photos.js',
  './js/menus.js',
  './js/foods.js',
  './js/recipes.js',
  './js/creator.js',
  './js/pantry.js',
  './js/today.js',
  './js/progress.js',
  './js/settings.js',
  './js/sync.js',
  './js/feedback.js',
  './js/profile.js',
  './js/app.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(CORE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // Pages : réseau d'abord (pour recevoir les mises à jour), cache si hors ligne
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html')),
    );
    return;
  }

  // Autres fichiers : cache d'abord, puis réseau
  event.respondWith(
    caches.match(req).then(
      (cached) =>
        cached ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
