
const kimCache = 'kimrestaurant-review-v2';

let filesToCache = [
    '/',
    'manifest.json',
    'restaurant.html',
    'index.html',
    'js/main.js',
    'js/dbhelper.js',
    'js/restaurant_info.js',
    'data/restaurants.json',
    'img/1.jpg',
    'img/2.jpg',
    'img/3.jpg',
    'img/4.jpg',
    'img/5.jpg',
    'img/6.jpg',
    'img/7.jpg',
    'img/8.jpg',
    'img/9.jpg',
    'img/10.jpg',
    'img/rr-512.png',
    'img/rr-icon.png'

  ];
  

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(kimCache).then( cache => {
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('fetch', (event) => {
    // for mapbox
    if (event.request.url.indexOf('https://api.tiles.mapbox.com') == 0) {
        fetch(event.request);
    }
  
    event.respondWith(
      caches.open(kimCache).then((cache) => {
        return cache.match(event.request).then((response) => {
          return response || fetch(event.request).then((response) => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  });

  // self.addEventListener('activate', function (event) {
  //   event.waitUntil(
  //     caches.keys().then(cacheNames => {
  //       cacheNames.filter(function (cacheName) {
  //         return cacheName.startsWith('kimrestaurant-') && cacheName != kimCache; 
  //       }).map(function (cacheName) {
  //         return caches.delete(cacheName);
  //       })
  //     })
  //   );
  // });