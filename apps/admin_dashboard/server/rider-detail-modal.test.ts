import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Rider Detail Modal Integration", () => {
  it("should fetch 30-day trend data for a rider", async () => {
    // Get a rider from leaderboard first
    const leaderboard = await db.getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      limit: 1,
    });

    if (leaderboard && leaderboard.leaderboard.length > 0) {
      const riderId = leaderboard.leaderboard[0].riderId;
      const trendData = await db.get30DayTrend(riderId);

      expect(trendData).toBeDefined();
      if (trendData) {
        expect(Array.isArray(trendData)).toBe(true);
        expect(trendData.length).toBe(30); // Should have 30 days of data
        
        // Check data structure
        if (trendData.length > 0) {
          expect(trendData[0]).toHaveProperty('date');
          expect(trendData[0]).toHaveProperty('deliveries');
          expect(trendData[0]).toHaveProperty('earnings');
          expect(trendData[0]).toHaveProperty('onTimeRate');
        }
      }
    }
  });

  it("should fetch performance details with metrics", async () => {
    const leaderboard = await db.getRiderLeaderboard({
      period: 'month',
      category: 'overall',
      limit: 1,
    });

    if (leaderboard && leaderboard.leaderboard.length > 0) {
      const riderId = leaderboard.leaderboard[0].riderId;
      const details = await db.getRiderPerformanceDetails(riderId, 'month');

      expect(details).toBeDefined();
      if (details) {
        expect(details.rider).toBeDefined();
        expect(details.rider.id).toBe(riderId);
        
        if (details.metrics) {
          expect(details.metrics).toHaveProperty('performanceScore');
          expect(details.metrics).toHaveProperty('scoreBreakdown');
          expect(details.metrics).toHaveProperty('deliveries');
          expect(details.metrics).toHaveProperty('totalEarnings');
          expect(details.metrics).toHaveProperty('earningsPerDelivery');
        }
      }
    }
  });

  it("should calculate daily trend correctly", async () => {
    const leaderboard = await db.getRiderLeaderboard({
      period: 'month',
      category: 'overall',
      limit: 1,
    });

    if (leaderboard && leaderboard.leaderboard.length > 0) {
      const riderId = leaderboard.leaderboard[0].riderId;
      const trendData = await db.get30DayTrend(riderId);

      if (trendData && trendData.length > 0) {
        // Verify dates are in chronological order
        for (let i = 1; i < trendData.length; i++) {
          const prevDate = new Date(trendData[i - 1].date);
          const currDate = new Date(trendData[i].date);
          expect(currDate.getTime()).toBeGreaterThan(prevDate.getTime());
        }

        // Verify all numeric values are non-negative
        trendData.forEach(day => {
          expect(day.deliveries).toBeGreaterThanOrEqual(0);
          expect(day.earnings).toBeGreaterThanOrEqual(0);
          expect(day.onTimeRate).toBeGreaterThanOrEqual(0);
          expect(day.onTimeRate).toBeLessThanOrEqual(100);
        });
      }
    }
  });
});
