// This file makes the app work offline by caching its files.
// Data is handled by Firestore's built-in offline cache.

const CACHE_NAME = 'workout-tracker-cache-v4'; // Incremented cache version
// This list includes all the files your app needs to run.
const FILES_TO_CACHE = [
 'index.html',
 'manifest.json',
 'https://cdn.tailwindcss.com' // Cache the Tailwind CSS file
];

// 1. Install Event: Cache all the app files
self.addEventListener('install', (event) => {
 event.waitUntil(
   caches.open(CACHE_NAME)
     .then((cache) => {
       console.log('Opened cache');
       // Add all the files to the cache
       return cache.addAll(FILES_TO_CACHE);
     })
 );
 self.skipWaiting();
});

// 2. Fetch Event: Serve files from cache first
// This allows the app shell to work offline
self.addEventListener('fetch', (event) => {
   // We only want to cache GET requests for our app shell and Tailwind
   if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
       // Don't cache Firestore API calls, etc.
       return;
   }

   event.respondWith(
       caches.match(event.request)
       .then((response) => {
           // If the file is in the cache, return it.
           if (response) {
           return response;
           }
           
           // Otherwise, fetch it from the network, cache it, and return it.
           return fetch(event.request).then((networkResponse) => {
               // Check if we received a valid response
               if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                   if (event.request.url.includes('tailwindcss')) {
                        // Don't cache opaque responses (like from CDN)
                       return networkResponse;
                   }
               }
               
               // Clone the response because it's a stream
               const responseToCache = networkResponse.clone();
               
               caches.open(CACHE_NAME)
                   .then((cache) => {
                       cache.put(event.request, responseToCache);
                   });
               
               return networkResponse;
           });
       })
   );
});


// 3. Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
 const cacheWhitelist = [CACHE_NAME];
 event.waitUntil(
   caches.keys().then((cacheNames) => {
     return Promise.all(
       cacheNames.map((cacheName) => {
         if (cacheWhitelist.indexOf(cacheName) === -1) {
           console.log('Deleting old cache:', cacheName);
           return caches.delete(cacheName);
         }
       })
     );
   })
 );
 self.clients.claim();

});


