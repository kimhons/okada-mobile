/**
 * Enhanced Offline Manager
 * 
 * Handles offline state detection, mutation queuing, and background sync
 * with enhanced features for Cameroon's unreliable connectivity:
 * - Sync status tracking (isSyncing)
 * - Last sync time tracking
 * - Manual sync triggering
 * - Service worker integration
 * - Real-time queue updates
 */

export interface QueuedMutation {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  retryCount: number;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: number | null;
  successCount: number;
  failureCount: number;
}

class OfflineManager {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<() => void> = new Set();
  private syncStatus: SyncStatus = {
    isSyncing: false,
    lastSyncTime: this.getStoredLastSyncTime(),
    successCount: 0,
    failureCount: 0,
  };

  constructor() {
    this.init();
  }

  private async init() {
    // Initialize IndexedDB
    try {
      this.db = await this.openDatabase();
    } catch (error) {
      console.error("[Offline] Failed to initialize database:", error);
    }

    // Listen for online/offline events
    window.addEventListener("online", () => {
      console.log("[Offline] Connection restored");
      this.isOnline = true;
      this.notifyListeners();
      // Automatically sync when coming back online
      this.syncQueuedMutations();
    });

    window.addEventListener("offline", () => {
      console.log("[Offline] Connection lost");
      this.isOnline = false;
      this.notifyListeners();
    });

    // Register service worker
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("[Offline] Service worker registered:", registration.scope);

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data) {
            switch (event.data.type) {
              case "SYNC_COMPLETE":
                console.log(`[Offline] Sync complete from SW:`, event.data);
                this.syncStatus.isSyncing = false;
                this.syncStatus.successCount = event.data.successCount || 0;
                this.syncStatus.failureCount = event.data.failureCount || 0;
                if (event.data.successCount > 0) {
                  this.updateLastSyncTime();
                }
                this.notifyListeners();
                break;
              
              case "MUTATION_QUEUED":
                console.log("[Offline] Mutation queued by SW:", event.data.url);
                this.notifyListeners();
                break;
              
              case "CONFLICT_RESOLVED":
                console.warn("[Offline] Conflict resolved by SW:", event.data);
                this.notifyListeners();
                break;
            }
          }
        });

        // Check for updates
        registration.addEventListener("updatefound", () => {
          console.log("[Offline] Service worker update found");
        });
      } catch (error) {
        console.error("[Offline] Service worker registration failed:", error);
      }
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("okada-offline", 2);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create mutations store if it doesn't exist
        if (!db.objectStoreNames.contains("mutations")) {
          const store = db.createObjectStore("mutations", { keyPath: "id", autoIncrement: true });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("retryCount", "retryCount", { unique: false });
        }
      };
    });
  }

  /**
   * Check if the app is currently online
   */
  public getIsOnline(): boolean {
    return this.isOnline;
  }

  /**
   * Get current sync status
   */
  public getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Subscribe to state changes (online/offline, queue updates, sync status)
   */
  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Queue a mutation for background sync
   */
  public async queueMutation(mutation: Omit<QueuedMutation, "id">): Promise<void> {
    if (!this.db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mutations"], "readwrite");
      const store = transaction.objectStore("mutations");
      const request = store.add(mutation);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("[Offline] Mutation queued:", request.result);
        this.notifyListeners();
        resolve();
      };
    });
  }

  /**
   * Get all queued mutations
   */
  public async getQueuedMutations(): Promise<QueuedMutation[]> {
    if (!this.db) {
      return [];
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mutations"], "readonly");
      const store = transaction.objectStore("mutations");
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Get count of queued mutations
   */
  public async getQueuedCount(): Promise<number> {
    if (!this.db) {
      return 0;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mutations"], "readonly");
      const store = transaction.objectStore("mutations");
      const request = store.count();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * Delete a queued mutation
   */
  private async deleteMutation(id: number): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mutations"], "readwrite");
      const store = transaction.objectStore("mutations");
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.notifyListeners();
        resolve();
      };
    });
  }

  /**
   * Sync all queued mutations with retry logic
   */
  public async syncQueuedMutations(): Promise<void> {
    if (this.syncStatus.isSyncing || !this.isOnline) {
      console.log("[Offline] Sync skipped:", this.syncStatus.isSyncing ? "already syncing" : "offline");
      return;
    }

    this.syncStatus.isSyncing = true;
    this.syncStatus.successCount = 0;
    this.syncStatus.failureCount = 0;
    this.notifyListeners();

    try {
      // Try to use service worker for sync if available
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const messageChannel = new MessageChannel();
        
        const syncPromise = new Promise<void>((resolve, reject) => {
          messageChannel.port1.onmessage = (event) => {
            if (event.data.success) {
              resolve();
            } else {
              reject(new Error(event.data.error));
            }
          };
          
          // Timeout after 30 seconds
          setTimeout(() => reject(new Error("Sync timeout")), 30000);
        });

        navigator.serviceWorker.controller.postMessage(
          { type: "MANUAL_SYNC" },
          [messageChannel.port2]
        );

        await syncPromise;
        console.log("[Offline] Service worker sync completed");
      } else {
        // Fallback to direct sync if service worker not available
        await this.directSync();
      }

      this.updateLastSyncTime();
    } catch (error) {
      console.error("[Offline] Sync failed:", error);
    } finally {
      this.syncStatus.isSyncing = false;
      this.notifyListeners();
    }
  }

  /**
   * Direct sync without service worker (fallback)
   */
  private async directSync(): Promise<void> {
    const mutations = await this.getQueuedMutations();
    console.log(`[Offline] Direct syncing ${mutations.length} queued mutations`);

    for (const mutation of mutations) {
      try {
        const response = await fetch(mutation.url, {
          method: mutation.method,
          headers: mutation.headers,
          body: mutation.body,
        });

        if (response.ok) {
          await this.deleteMutation(mutation.id!);
          console.log("[Offline] Synced mutation:", mutation.id);
          this.syncStatus.successCount++;
        } else {
          console.error("[Offline] Failed to sync mutation:", mutation.id, response.status);
          this.syncStatus.failureCount++;
        }
      } catch (error) {
        console.error("[Offline] Failed to sync mutation:", mutation.id, error);
        this.syncStatus.failureCount++;
      }
    }
  }

  /**
   * Clear all queued mutations
   */
  public async clearQueue(): Promise<void> {
    if (!this.db) {
      return;
    }

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["mutations"], "readwrite");
      const store = transaction.objectStore("mutations");
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log("[Offline] Queue cleared");
        this.notifyListeners();
        resolve();
      };
    });
  }

  /**
   * Update last sync time
   */
  private updateLastSyncTime() {
    this.syncStatus.lastSyncTime = Date.now();
    localStorage.setItem("okada-last-sync", this.syncStatus.lastSyncTime.toString());
  }

  /**
   * Get stored last sync time from localStorage
   */
  private getStoredLastSyncTime(): number | null {
    const stored = localStorage.getItem("okada-last-sync");
    return stored ? parseInt(stored, 10) : null;
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

/**
 * React hook for offline state with enhanced features
 */
export function useOffline() {
  const [isOnline, setIsOnline] = React.useState(offlineManager.getIsOnline());
  const [queuedCount, setQueuedCount] = React.useState(0);
  const [syncStatus, setSyncStatus] = React.useState(offlineManager.getSyncStatus());

  React.useEffect(() => {
    const updateState = async () => {
      setIsOnline(offlineManager.getIsOnline());
      setSyncStatus(offlineManager.getSyncStatus());
      const count = await offlineManager.getQueuedCount();
      setQueuedCount(count);
    };

    const unsubscribe = offlineManager.subscribe(updateState);
    updateState();

    // Poll for queue updates every 5 seconds
    const interval = setInterval(updateState, 5000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    queuedCount,
    isSyncing: syncStatus.isSyncing,
    lastSyncTime: syncStatus.lastSyncTime,
    syncNow: () => offlineManager.syncQueuedMutations(),
  };
}

// Import React for the hook
import * as React from "react";
