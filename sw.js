// This file makes the app work offline by caching its files.

const CACHE_NAME = 'workout-tracker-cache-v1';
// This list includes all the files your app needs to run.
const FILES_TO_CACHE = [
 'workout_tracker.html',
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
// This allows the app to work offline
self.addEventListener('fetch', (event) => {
 event.respondWith(
   caches.match(event.request)
     .then((response) => {
       // If the file is in the cache, return it.
       if (response) {
         return response;
       }
       // Otherwise, fetch it from the network.
       return fetch(event.request);
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
           return caches.delete(cacheName);
         }
       })
     );
   })
 );
 self.clients.claim();
});