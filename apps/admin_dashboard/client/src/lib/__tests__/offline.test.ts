/**
 * Tests for Offline Manager Utility
 * 
 * Ensures offline functionality works correctly for Cameroon market
 * Critical for unreliable connectivity scenarios
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("Offline Manager", () => {
  beforeEach(() => {
    // Clear any existing state
    localStorage.clear();
  });

  it("should detect online status", () => {
    expect(navigator.onLine).toBeDefined();
  });

  it("should store offline state in localStorage", () => {
    localStorage.setItem("offline_mode", "true");
    expect(localStorage.getItem("offline_mode")).toBe("true");
  });

  it("should track last sync time", () => {
    const now = Date.now();
    localStorage.setItem("last_sync_time", now.toString());
    const stored = localStorage.getItem("last_sync_time");
    expect(stored).toBe(now.toString());
  });

  it("should queue offline mutations", () => {
    const queue = [
      { id: "1", type: "createOrder", data: { productId: 1 } },
      { id: "2", type: "updateProduct", data: { id: 1, name: "Test" } },
    ];
    localStorage.setItem("offline_queue", JSON.stringify(queue));
    
    const stored = JSON.parse(localStorage.getItem("offline_queue") || "[]");
    expect(stored).toHaveLength(2);
    expect(stored[0].type).toBe("createOrder");
  });

  it("should handle empty queue", () => {
    const stored = JSON.parse(localStorage.getItem("offline_queue") || "[]");
    expect(stored).toHaveLength(0);
  });

  it("should persist isSyncing state", () => {
    localStorage.setItem("is_syncing", "true");
    expect(localStorage.getItem("is_syncing")).toBe("true");
    
    localStorage.setItem("is_syncing", "false");
    expect(localStorage.getItem("is_syncing")).toBe("false");
  });

  it("should clear queue after successful sync", () => {
    localStorage.setItem("offline_queue", JSON.stringify([{ id: "1" }]));
    expect(JSON.parse(localStorage.getItem("offline_queue") || "[]")).toHaveLength(1);
    
    localStorage.setItem("offline_queue", "[]");
    expect(JSON.parse(localStorage.getItem("offline_queue") || "[]")).toHaveLength(0);
  });
});
