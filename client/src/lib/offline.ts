/**
 * Offline Manager
 * 
 * Handles offline state detection, mutation queuing, and background sync.
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

class OfflineManager {
  private db: IDBDatabase | null = null;
  private isOnline: boolean = navigator.onLine;
  private listeners: Set<(isOnline: boolean) => void> = new Set();
  private syncInProgress: boolean = false;

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
      this.notifyListeners(true);
      this.syncQueuedMutations();
    });

    window.addEventListener("offline", () => {
      console.log("[Offline] Connection lost");
      this.isOnline = false;
      this.notifyListeners(false);
    });

    // Register service worker
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js");
        console.log("[Offline] Service worker registered:", registration.scope);

        // Listen for sync events from service worker
        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data && event.data.type === "SYNC_COMPLETE") {
            console.log(`[Offline] Sync complete: ${event.data.count} mutations synced`);
            this.notifyListeners(this.isOnline);
          }
        });
      } catch (error) {
        console.error("[Offline] Service worker registration failed:", error);
      }
    }
  }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("okada-offline", 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains("mutations")) {
          db.createObjectStore("mutations", { keyPath: "id", autoIncrement: true });
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
   * Subscribe to online/offline state changes
   */
  public subscribe(listener: (isOnline: boolean) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(isOnline: boolean) {
    this.listeners.forEach((listener) => listener(isOnline));
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
      request.onsuccess = () => resolve();
    });
  }

  /**
   * Sync all queued mutations
   */
  public async syncQueuedMutations(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;

    try {
      const mutations = await this.getQueuedMutations();
      console.log(`[Offline] Syncing ${mutations.length} queued mutations`);

      for (const mutation of mutations) {
        try {
          const response = await fetch(mutation.url, {
            method: mutation.method,
            headers: mutation.headers,
            body: mutation.body,
          });

          if (response.ok) {
            // Remove successfully synced mutation
            await this.deleteMutation(mutation.id!);
            console.log("[Offline] Synced mutation:", mutation.id);
          } else {
            console.error("[Offline] Failed to sync mutation:", mutation.id, response.status);
          }
        } catch (error) {
          console.error("[Offline] Failed to sync mutation:", mutation.id, error);
        }
      }
    } catch (error) {
      console.error("[Offline] Sync failed:", error);
    } finally {
      this.syncInProgress = false;
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
        resolve();
      };
    });
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

/**
 * React hook for offline state
 */
export function useOffline() {
  const [isOnline, setIsOnline] = React.useState(offlineManager.getIsOnline());
  const [queuedCount, setQueuedCount] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = offlineManager.subscribe((online) => {
      setIsOnline(online);
      updateQueuedCount();
    });

    updateQueuedCount();

    return unsubscribe;
  }, []);

  const updateQueuedCount = async () => {
    const mutations = await offlineManager.getQueuedMutations();
    setQueuedCount(mutations.length);
  };

  return {
    isOnline,
    queuedCount,
    syncNow: () => offlineManager.syncQueuedMutations(),
  };
}

// Import React for the hook
import * as React from "react";
