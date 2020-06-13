var cacheName = 'discord-pwa';
var filesToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js',
	'./images/'
];

/* Start the service worker and cache all of the app's content */
self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(cacheName).then(function (cache) {
            return cache.addAll(filesToCache);
        })
    );
});

function update(request) {
    caches.open(cacheName).then(function (cache) {
        fetch(request).then(function (response) {
            cache.put(request, response.clone())
        });
    });
}

/* Serve cached content, fallback to network, update cache from network regardless. */
self.addEventListener('fetch', function (e) {
    e.respondWith(
        caches.match(e.request).then(function (response) {
            return response || fetch(e.request);
        })
    );
    e.waitUntil(update(e.request));
});