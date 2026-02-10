var CACHE_NAME = 'heic2jpeg-v1';
var MEDIA_CACHE = 'heic2jpeg-media';

var PRECACHE_URLS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.js'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (k) { return k !== CACHE_NAME && k !== MEDIA_CACHE; })
          .map(function (k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(function (cached) {
      return cached || fetch(event.request);
    })
  );
});

function handleShareTarget(request) {
  return request.formData().then(function (formData) {
    var file = formData.get('file');
    if (!file) {
      return Response.redirect('/', 303);
    }

    return caches.open(MEDIA_CACHE).then(function (cache) {
      var headers = new Headers({ 'X-Filename': file.name || 'shared.heic' });
      var response = new Response(file, { headers: headers });
      return cache.put('/shared-file', response).then(function () {
        return Response.redirect('/?share-target', 303);
      });
    });
  });
}
