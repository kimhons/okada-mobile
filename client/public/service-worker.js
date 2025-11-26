/**
 * Service Worker for Okada Admin Dashboard
 * 
 * Provides offline support for shift scheduling and rider availability features.
 * Caches static assets and API responses for offline access.
 */

const CACHE_VERSION = "v1";
const CACHE_NAME = `okada-admin-${CACHE_VERSION}`;
const API_CACHE_NAME = `okada-admin-api-${CACHE_VERSION}`;

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// API endpoints to cache for offline access
const CACHEABLE_API_PATTERNS = [
  /\/api\/trpc\/riders\.getShifts/,
  /\/api\/trpc\/riders\.getAvailability/,
  /\/api\/trpc\/riders\.getAllRiders/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log("[Service Worker] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== "GET") {
    // For POST/PUT/DELETE, queue for background sync if offline
    if (!navigator.onLine) {
      event.respondWith(
        new Response(
          JSON.stringify({ error: "Offline - request queued for sync" }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith("/api/trpc/")) {
    const shouldCache = CACHEABLE_API_PATTERNS.some((pattern) =>
      pattern.test(url.pathname + url.search)
    );
    
    if (shouldCache) {
      event.respondWith(
        caches.open(API_CACHE_NAME).then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.ok) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached response when offline
              return cache.match(request).then((cachedResponse) => {
                if (cachedResponse) {
                  console.log("[Service Worker] Serving from cache:", request.url);
                  return cachedResponse;
                }
                // Return offline response
                return new Response(
                  JSON.stringify({ error: "Offline - no cached data available" }),
                  {
                    status: 503,
                    headers: { "Content-Type": "application/json" },
                  }
                );
              });
            });
        })
      );
      return;
    }
  }
  
  // Handle static assets - cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request).then((response) => {
        // Cache successful responses for static assets
        if (response.ok && request.url.startsWith(self.location.origin)) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      });
    })
  );
});

// Background sync event - sync queued mutations
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync triggered:", event.tag);
  
  if (event.tag === "sync-mutations") {
    event.waitUntil(syncQueuedMutations());
  }
});

// Sync queued mutations when back online
async function syncQueuedMutations() {
  try {
    // Get queued mutations from IndexedDB
    const db = await openDatabase();
    const mutations = await getAllMutations(db);
    
    console.log(`[Service Worker] Syncing ${mutations.length} queued mutations`);
    
    for (const mutation of mutations) {
      try {
        const response = await fetch(mutation.url, {
          method: mutation.method,
          headers: mutation.headers,
          body: mutation.body,
        });
        
        if (response.ok) {
          // Remove successfully synced mutation
          await deleteMutation(db, mutation.id);
          console.log("[Service Worker] Synced mutation:", mutation.id);
        }
      } catch (error) {
        console.error("[Service Worker] Failed to sync mutation:", mutation.id, error);
      }
    }
    
    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        count: mutations.length,
      });
    });
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("okada-offline", 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("mutations")) {
        db.createObjectStore("mutations", { keyPath: "id", autoIncrement: true });
      }
    };
  });
}

function getAllMutations(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["mutations"], "readonly");
    const store = transaction.objectStore("mutations");
    const request = store.getAll();
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function deleteMutation(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["mutations"], "readwrite");
    const store = transaction.objectStore("mutations");
    const request = store.delete(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Message event - handle messages from clients
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
