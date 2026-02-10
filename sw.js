var MEDIA_CACHE = 'heic2jpeg-media';

self.addEventListener('install', function () {
  self.skipWaiting();
});

self.addEventListener('activate', function () {
  self.clients.claim();
});

self.addEventListener('fetch', function (event) {
  var url = new URL(event.request.url);

  if (url.pathname === '/share-target' && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
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
