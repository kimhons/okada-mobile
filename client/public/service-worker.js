/**
 * Enhanced Service Worker for Okada Admin Dashboard
 * 
 * Provides comprehensive offline support for Cameroon's unreliable connectivity:
 * - API response caching with stale-while-revalidate strategy
 * - Offline mutation queue with retry logic and exponential backoff
 * - Background sync for queued mutations
 * - Conflict resolution strategies
 * - Enhanced error handling and logging
 */

const CACHE_VERSION = "v2";
const CACHE_NAME = `okada-admin-${CACHE_VERSION}`;
const API_CACHE_NAME = `okada-admin-api-${CACHE_VERSION}`;
const MAX_RETRY_ATTEMPTS = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Static assets to cache
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/offline.html",
];

// API endpoints to cache for offline access (read-only operations)
const CACHEABLE_API_PATTERNS = [
  // Riders
  /\/api\/trpc\/riders\.getShifts/,
  /\/api\/trpc\/riders\.getAvailability/,
  /\/api\/trpc\/riders\.getAllRiders/,
  /\/api\/trpc\/riders\.list/,
  
  // Orders
  /\/api\/trpc\/orders\.list/,
  /\/api\/trpc\/orders\.getById/,
  /\/api\/trpc\/orders\.getStats/,
  
  // Products
  /\/api\/trpc\/products\.list/,
  /\/api\/trpc\/products\.getById/,
  /\/api\/trpc\/products\.getCategories/,
  
  // Users
  /\/api\/trpc\/users\.list/,
  /\/api\/trpc\/users\.getById/,
  
  // Dashboard
  /\/api\/trpc\/dashboard\.getStats/,
  /\/api\/trpc\/dashboard\.getRecentOrders/,
  
  // Auth
  /\/api\/trpc\/auth\.me/,
  
  // I18N
  /\/api\/trpc\/i18n\.getLanguages/,
  /\/api\/trpc\/i18n\.getTranslations/,
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing enhanced version...");
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[Service Worker] Caching static assets");
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error("[Service Worker] Failed to cache static assets:", error);
      });
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating enhanced version...");
  
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
    }).then(() => {
      console.log("[Service Worker] Cache cleanup complete");
    })
  );
  
  // Take control of all pages immediately
  return self.clients.claim();
});

// Fetch event - serve from cache when offline, with stale-while-revalidate
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching (but queue mutations)
  if (request.method !== "GET") {
    handleMutation(event, request);
    return;
  }
  
  // Handle API requests with stale-while-revalidate strategy
  if (url.pathname.startsWith("/api/trpc/")) {
    const shouldCache = CACHEABLE_API_PATTERNS.some((pattern) =>
      pattern.test(url.pathname + url.search)
    );
    
    if (shouldCache) {
      event.respondWith(staleWhileRevalidate(request));
      return;
    }
  }
  
  // Handle static assets - cache first, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update in background
        fetch(request).then((response) => {
          if (response.ok && request.url.startsWith(self.location.origin)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, response.clone());
            });
          }
        }).catch(() => {
          // Ignore fetch errors for background updates
        });
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
      }).catch(async (error) => {
        console.error("[Service Worker] Fetch failed:", request.url, error);
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
          const offlinePage = await caches.match('/offline.html');
          if (offlinePage) {
            return offlinePage;
          }
        }
        return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
      });
    })
  );
});

/**
 * Stale-while-revalidate strategy for API requests
 * Returns cached version immediately while fetching fresh data in background
 */
async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      // Cache successful responses
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.log("[Service Worker] Fetch failed, using cache:", request.url);
      return null;
    });
  
  // Return cached response immediately if available
  if (cachedResponse) {
    console.log("[Service Worker] Serving from cache (stale-while-revalidate):", request.url);
    // Update cache in background
    fetchPromise.catch(() => {});
    return cachedResponse;
  }
  
  // Wait for network if no cache available
  const networkResponse = await fetchPromise;
  if (networkResponse) {
    return networkResponse;
  }
  
  // Return offline response if both cache and network fail
  return new Response(
    JSON.stringify({ 
      error: "Offline - no cached data available",
      offline: true 
    }),
    {
      status: 503,
      headers: { "Content-Type": "application/json" },
    }
  );
}

/**
 * Handle mutations (POST/PUT/DELETE) - queue for background sync if offline
 */
function handleMutation(event, request) {
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(async (error) => {
        console.log("[Service Worker] Mutation failed, queuing for sync:", request.url);
        
        // Queue mutation for background sync
        const db = await openDatabase();
        const body = await request.clone().text();
        
        const mutation = {
          url: request.url,
          method: request.method,
          headers: Object.fromEntries(request.headers.entries()),
          body: body,
          timestamp: Date.now(),
          retryCount: 0,
        };
        
        await addMutation(db, mutation);
        
        // Register background sync
        if (self.registration.sync) {
          await self.registration.sync.register("sync-mutations");
        }
        
        // Notify client that mutation was queued
        const clients = await self.clients.matchAll();
        clients.forEach((client) => {
          client.postMessage({
            type: "MUTATION_QUEUED",
            url: request.url,
            method: request.method,
          });
        });
        
        return new Response(
          JSON.stringify({ 
            error: "Offline - request queued for sync",
            queued: true,
            offline: true
          }),
          {
            status: 202, // Accepted
            headers: { "Content-Type": "application/json" },
          }
        );
      })
  );
}

// Background sync event - sync queued mutations with retry logic
self.addEventListener("sync", (event) => {
  console.log("[Service Worker] Background sync triggered:", event.tag);
  
  if (event.tag === "sync-mutations") {
    event.waitUntil(syncQueuedMutations());
  }
});

/**
 * Sync queued mutations when back online with exponential backoff retry
 */
async function syncQueuedMutations() {
  try {
    const db = await openDatabase();
    const mutations = await getAllMutations(db);
    
    console.log(`[Service Worker] Syncing ${mutations.length} queued mutations`);
    
    let successCount = 0;
    let failureCount = 0;
    
    for (const mutation of mutations) {
      try {
        // Calculate retry delay with exponential backoff
        const retryDelay = INITIAL_RETRY_DELAY * Math.pow(2, mutation.retryCount);
        
        // Skip if max retries exceeded
        if (mutation.retryCount >= MAX_RETRY_ATTEMPTS) {
          console.error("[Service Worker] Max retries exceeded for mutation:", mutation.id);
          await deleteMutation(db, mutation.id);
          failureCount++;
          continue;
        }
        
        // Wait for retry delay if this is a retry
        if (mutation.retryCount > 0) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
        
        const response = await fetch(mutation.url, {
          method: mutation.method,
          headers: mutation.headers,
          body: mutation.body,
        });
        
        if (response.ok) {
          // Remove successfully synced mutation
          await deleteMutation(db, mutation.id);
          console.log("[Service Worker] Synced mutation:", mutation.id);
          successCount++;
        } else if (response.status === 409) {
          // Conflict - apply conflict resolution strategy
          console.warn("[Service Worker] Conflict detected for mutation:", mutation.id);
          await handleConflict(db, mutation, response);
          failureCount++;
        } else {
          // Increment retry count and keep in queue
          mutation.retryCount++;
          await updateMutation(db, mutation);
          console.warn("[Service Worker] Mutation failed, will retry:", mutation.id, "Attempt:", mutation.retryCount);
          failureCount++;
        }
      } catch (error) {
        console.error("[Service Worker] Failed to sync mutation:", mutation.id, error);
        // Increment retry count
        mutation.retryCount++;
        await updateMutation(db, mutation);
        failureCount++;
      }
    }
    
    // Notify clients that sync is complete
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        successCount,
        failureCount,
        totalCount: mutations.length,
      });
    });
    
    console.log(`[Service Worker] Sync complete: ${successCount} succeeded, ${failureCount} failed`);
  } catch (error) {
    console.error("[Service Worker] Sync failed:", error);
  }
}

/**
 * Handle conflict resolution for mutations
 * Strategy: Last-write-wins (server version takes precedence)
 */
async function handleConflict(db, mutation, response) {
  try {
    const serverData = await response.json();
    console.log("[Service Worker] Conflict resolution: Server version wins", serverData);
    
    // Remove conflicting mutation from queue
    await deleteMutation(db, mutation.id);
    
    // Notify clients about conflict
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "CONFLICT_RESOLVED",
        mutation,
        serverData,
      });
    });
  } catch (error) {
    console.error("[Service Worker] Conflict resolution failed:", error);
  }
}

// IndexedDB helpers
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("okada-offline", 2);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create mutations store if it doesn't exist
      if (!db.objectStoreNames.contains("mutations")) {
        const store = db.createObjectStore("mutations", { keyPath: "id", autoIncrement: true });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("retryCount", "retryCount", { unique: false });
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

function addMutation(db, mutation) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["mutations"], "readwrite");
    const store = transaction.objectStore("mutations");
    const request = store.add(mutation);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function updateMutation(db, mutation) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["mutations"], "readwrite");
    const store = transaction.objectStore("mutations");
    const request = store.put(mutation);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
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
  } else if (event.data && event.data.type === "MANUAL_SYNC") {
    // Handle manual sync request from client
    syncQueuedMutations().then(() => {
      event.ports[0].postMessage({ success: true });
    }).catch((error) => {
      event.ports[0].postMessage({ success: false, error: error.message });
    });
  } else if (event.data && event.data.type === "GET_QUEUE_STATUS") {
    // Return current queue status
    openDatabase().then((db) => {
      return getAllMutations(db);
    }).then((mutations) => {
      event.ports[0].postMessage({
        queueSize: mutations.length,
        mutations: mutations.map((m) => ({
          id: m.id,
          url: m.url,
          method: m.method,
          timestamp: m.timestamp,
          retryCount: m.retryCount,
        })),
      });
    }).catch((error) => {
      event.ports[0].postMessage({ error: error.message });
    });
  }
});

// Periodic background sync (if supported)
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "sync-mutations-periodic") {
    event.waitUntil(syncQueuedMutations());
  }
});

console.log("[Service Worker] Enhanced service worker loaded");
