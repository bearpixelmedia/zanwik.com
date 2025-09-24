const CACHE_NAME = 'zanwik-api-directory-v1';
const STATIC_CACHE_URLS = [
  '/',
  '/apis',
  '/zanwik-icon.svg',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Install event - cache static resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('Service worker installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip requests to external domains
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Cache the response for future use
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline page if available
            if (event.request.destination === 'document') {
              return caches.match('/');
            }
          });
      })
  );
});

// Background sync for API data
self.addEventListener('sync', event => {
  if (event.tag === 'api-sync') {
    event.waitUntil(syncApiData());
  }
});

// Sync API data in background
async function syncApiData() {
  try {
    const response = await fetch('/api/apis');
    const data = await response.json();
    
    // Store in IndexedDB or send to main thread
    self.postMessage({
      type: 'API_DATA_SYNCED',
      data: data
    });
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New API updates available!',
    icon: '/zanwik-icon.svg',
    badge: '/zanwik-icon.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore APIs',
        icon: '/zanwik-icon.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/zanwik-icon.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Zanwik API Directory', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/apis')
    );
  }
});
