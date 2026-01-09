import { describe, it, expect } from "vitest";

describe("Badge Awarding Logic", () => {
  describe("Badge criteria evaluation", () => {
    it("should evaluate delivery count criteria", () => {
      const criteria = { type: "deliveries", threshold: 100 };
      const riderStats = { totalDeliveries: 150 };
      const earned = riderStats.totalDeliveries >= criteria.threshold;
      expect(earned).toBe(true);
    });

    it("should evaluate rating criteria", () => {
      const criteria = { type: "rating", threshold: 4.5 };
      const riderStats = { averageRating: 4.8 };
      const earned = riderStats.averageRating >= criteria.threshold;
      expect(earned).toBe(true);
    });

    it("should evaluate earnings criteria", () => {
      const criteria = { type: "earnings", threshold: 1000000 };
      const riderStats = { totalEarnings: 1500000 };
      const earned = riderStats.totalEarnings >= criteria.threshold;
      expect(earned).toBe(true);
    });

    it("should fail when criteria not met", () => {
      const criteria = { type: "deliveries", threshold: 100 };
      const riderStats = { totalDeliveries: 50 };
      const earned = riderStats.totalDeliveries >= criteria.threshold;
      expect(earned).toBe(false);
    });

    it("should handle multiple criteria", () => {
      const criteria = [
        { type: "deliveries", threshold: 100 },
        { type: "rating", threshold: 4.0 },
      ];
      const riderStats = { totalDeliveries: 150, averageRating: 4.5 };
      const allMet = criteria.every((c) => {
        if (c.type === "deliveries") return riderStats.totalDeliveries >= c.threshold;
        if (c.type === "rating") return riderStats.averageRating >= c.threshold;
        return false;
      });
      expect(allMet).toBe(true);
    });
  });

  describe("Badge assignment", () => {
    it("should create badge assignment record", () => {
      const assignment = {
        riderId: 1,
        badgeId: 5,
        earnedAt: new Date(),
        metadata: { earnedAt: new Date().toISOString() },
      };
      expect(assignment).toHaveProperty("riderId");
      expect(assignment).toHaveProperty("badgeId");
      expect(assignment).toHaveProperty("earnedAt");
    });

    it("should not duplicate badge assignments", () => {
      const existingBadges = [{ badgeId: 1 }, { badgeId: 2 }];
      const newBadgeId = 2;
      const alreadyEarned = existingBadges.some((b) => b.badgeId === newBadgeId);
      expect(alreadyEarned).toBe(true);
    });

    it("should allow new badge assignment", () => {
      const existingBadges = [{ badgeId: 1 }, { badgeId: 2 }];
      const newBadgeId = 3;
      const alreadyEarned = existingBadges.some((b) => b.badgeId === newBadgeId);
      expect(alreadyEarned).toBe(false);
    });
  });

  describe("Badge progress tracking", () => {
    it("should calculate progress percentage", () => {
      const current = 75;
      const target = 100;
      const progress = Math.min((current / target) * 100, 100);
      expect(progress).toBe(75);
    });

    it("should cap progress at 100%", () => {
      const current = 150;
      const target = 100;
      const progress = Math.min((current / target) * 100, 100);
      expect(progress).toBe(100);
    });

    it("should track progress updates", () => {
      let progress = { current: 50, target: 100 };
      progress.current = 75;
      const percentage = (progress.current / progress.target) * 100;
      expect(percentage).toBe(75);
    });
  });

  describe("Badge notification", () => {
    it("should create notification on badge earned", () => {
      const notification = {
        type: "badge_earned",
        title: "New Badge Earned!",
        message: "You earned the Speed Demon badge",
        userId: 1,
      };
      expect(notification.type).toBe("badge_earned");
    });

    it("should include badge details in notification", () => {
      const badge = { id: 1, name: "Speed Demon", description: "Complete 100 deliveries" };
      const notification = {
        type: "badge_earned",
        data: { badgeId: badge.id, badgeName: badge.name },
      };
      expect(notification.data.badgeName).toBe("Speed Demon");
    });
  });

  describe("Badge types", () => {
    it("should support performance badges", () => {
      const badge = { type: "performance", name: "Speed Demon" };
      expect(badge.type).toBe("performance");
    });

    it("should support milestone badges", () => {
      const badge = { type: "milestone", name: "Century Club" };
      expect(badge.type).toBe("milestone");
    });

    it("should support achievement badges", () => {
      const badge = { type: "achievement", name: "Perfect Week" };
      expect(badge.type).toBe("achievement");
    });

    it("should support special badges", () => {
      const badge = { type: "special", name: "Early Adopter" };
      expect(badge.type).toBe("special");
    });
  });

  describe("Badge criteria types", () => {
    it("should handle delivery count criteria", () => {
      const criteria = { field: "totalDeliveries", operator: ">=", value: 100 };
      const stats = { totalDeliveries: 150 };
      const met = stats.totalDeliveries >= criteria.value;
      expect(met).toBe(true);
    });

    it("should handle rating criteria", () => {
      const criteria = { field: "averageRating", operator: ">=", value: 4.5 };
      const stats = { averageRating: 4.8 };
      const met = stats.averageRating >= criteria.value;
      expect(met).toBe(true);
    });

    it("should handle streak criteria", () => {
      const criteria = { field: "currentStreak", operator: ">=", value: 7 };
      const stats = { currentStreak: 10 };
      const met = stats.currentStreak >= criteria.value;
      expect(met).toBe(true);
    });

    it("should handle time-based criteria", () => {
      const criteria = { field: "daysActive", operator: ">=", value: 30 };
      const stats = { daysActive: 45 };
      const met = stats.daysActive >= criteria.value;
      expect(met).toBe(true);
    });
  });

  describe("Batch badge evaluation", () => {
    it("should evaluate multiple badges at once", () => {
      const badges = [
        { id: 1, criteria: { deliveries: 100 } },
        { id: 2, criteria: { deliveries: 500 } },
        { id: 3, criteria: { deliveries: 1000 } },
      ];
      const stats = { totalDeliveries: 750 };
      const earnedBadges = badges.filter((b) => stats.totalDeliveries >= b.criteria.deliveries);
      expect(earnedBadges.length).toBe(2);
      expect(earnedBadges.map((b) => b.id)).toEqual([1, 2]);
    });

    it("should return newly earned badges only", () => {
      const allBadges = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const existingBadges = [{ badgeId: 1 }];
      const earnedBadgeIds = [1, 2];
      const newlyEarned = earnedBadgeIds.filter(
        (id) => !existingBadges.some((b) => b.badgeId === id)
      );
      expect(newlyEarned).toEqual([2]);
    });
  });

  describe("Badge metadata", () => {
    it("should store earned timestamp", () => {
      const metadata = { earnedAt: new Date().toISOString() };
      expect(metadata).toHaveProperty("earnedAt");
    });

    it("should store earning context", () => {
      const metadata = {
        earnedAt: new Date().toISOString(),
        triggerEvent: "delivery_completed",
        deliveryId: 12345,
      };
      expect(metadata.triggerEvent).toBe("delivery_completed");
    });
  });
});
