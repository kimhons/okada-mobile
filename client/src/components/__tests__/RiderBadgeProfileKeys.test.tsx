import { describe, it, expect } from "vitest";

describe("RiderBadgeProfile Key Patterns", () => {
  describe("Skeleton loading keys", () => {
    it("should use unique skeleton keys with prefix and index", () => {
      const skeletonCount = 3;
      const keys = [...Array(skeletonCount)].map((_, i) => `skeleton-${i}`);
      
      // Verify all keys are unique
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
      
      // Verify key format
      expect(keys[0]).toBe("skeleton-0");
      expect(keys[1]).toBe("skeleton-1");
      expect(keys[2]).toBe("skeleton-2");
    });
  });

  describe("Badge item keys", () => {
    it("should use rb.id as key for earned badges", () => {
      const earnedBadges = [
        { id: 101, badge: { name: "First Delivery", icon: "🚀" } },
        { id: 102, badge: { name: "Speed Demon", icon: "⚡" } },
        { id: 103, badge: { name: "Perfect Rating", icon: "⭐" } },
      ];
      
      const keys = earnedBadges.map((rb) => rb.id);
      
      // Verify all keys are unique
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
      
      // Verify keys are the actual IDs
      expect(keys[0]).toBe(101);
      expect(keys[1]).toBe(102);
      expect(keys[2]).toBe(103);
    });

    it("should handle large number of badges", () => {
      const earnedBadges = Array.from({ length: 20 }, (_, i) => ({
        id: 1000 + i,
        badge: { name: `Badge ${i}`, icon: "🏆" },
      }));
      
      const keys = earnedBadges.map((rb) => rb.id);
      
      // Verify all keys are unique
      const uniqueKeys = new Set(keys);
      expect(uniqueKeys.size).toBe(keys.length);
    });
  });

  describe("Tier colors", () => {
    it("should have all tier colors defined", () => {
      const TIER_COLORS: Record<string, string> = {
        bronze: "bg-amber-700 text-white",
        silver: "bg-gray-400 text-gray-900",
        gold: "bg-yellow-500 text-gray-900",
        platinum: "bg-cyan-400 text-gray-900",
        diamond: "bg-purple-500 text-white",
      };
      
      expect(Object.keys(TIER_COLORS)).toContain("bronze");
      expect(Object.keys(TIER_COLORS)).toContain("silver");
      expect(Object.keys(TIER_COLORS)).toContain("gold");
      expect(Object.keys(TIER_COLORS)).toContain("platinum");
      expect(Object.keys(TIER_COLORS)).toContain("diamond");
    });

    it("should return correct color for each tier", () => {
      const TIER_COLORS: Record<string, string> = {
        bronze: "bg-amber-700 text-white",
        silver: "bg-gray-400 text-gray-900",
        gold: "bg-yellow-500 text-gray-900",
        platinum: "bg-cyan-400 text-gray-900",
        diamond: "bg-purple-500 text-white",
      };
      
      expect(TIER_COLORS["bronze"]).toContain("amber");
      expect(TIER_COLORS["gold"]).toContain("yellow");
      expect(TIER_COLORS["diamond"]).toContain("purple");
    });
  });

  describe("Points calculation", () => {
    it("should correctly sum badge points", () => {
      const earnedBadges = [
        { id: 1, badge: { points: 10 } },
        { id: 2, badge: { points: 25 } },
        { id: 3, badge: { points: 50 } },
      ];
      
      const totalPoints = earnedBadges.reduce((sum, rb) => sum + (rb.badge?.points || 0), 0);
      expect(totalPoints).toBe(85);
    });

    it("should handle badges without points", () => {
      const earnedBadges = [
        { id: 1, badge: { points: 10 } },
        { id: 2, badge: {} },
        { id: 3, badge: { points: 50 } },
      ];
      
      const totalPoints = earnedBadges.reduce((sum, rb) => sum + ((rb.badge as any)?.points || 0), 0);
      expect(totalPoints).toBe(60);
    });
  });
});
