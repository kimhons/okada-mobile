import { describe, it, expect, beforeAll } from 'vitest';
import { getRiderLeaderboard, get30DayTrend, getRiderPerformanceDetails, compareRiders } from './db';
import * as db from './db';

describe('Rider Leaderboard Functions', () => {
  describe('getRiderLeaderboard', () => {
    it('should return leaderboard data for all time period', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('leaderboard');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('stats');
      expect(Array.isArray(result.leaderboard)).toBe(true);
    });

    it('should return leaderboard data for week period', async () => {
      const result = await getRiderLeaderboard({
        period: 'week',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('leaderboard');
      expect(Array.isArray(result.leaderboard)).toBe(true);
    });

    it('should return leaderboard data for month period', async () => {
      const result = await getRiderLeaderboard({
        period: 'month',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('leaderboard');
      expect(Array.isArray(result.leaderboard)).toBe(true);
    });

    it('should return leaderboard data for today period', async () => {
      const result = await getRiderLeaderboard({
        period: 'today',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      expect(result).toHaveProperty('leaderboard');
      expect(Array.isArray(result.leaderboard)).toBe(true);
    });

    it('should sort by earnings when category is earnings', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'earnings',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 1) {
        expect(result.leaderboard[0].totalEarnings).toBeGreaterThanOrEqual(
          result.leaderboard[1].totalEarnings
        );
      }
    });

    it('should sort by deliveries when category is deliveries', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'deliveries',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 1) {
        expect(result.leaderboard[0].deliveries).toBeGreaterThanOrEqual(
          result.leaderboard[1].deliveries
        );
      }
    });

    it('should sort by rating when category is rating', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'rating',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 1) {
        expect(result.leaderboard[0].rating).toBeGreaterThanOrEqual(
          result.leaderboard[1].rating
        );
      }
    });

    it('should sort by on-time rate when category is speed', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'speed',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 1) {
        expect(result.leaderboard[0].onTimeRate).toBeGreaterThanOrEqual(
          result.leaderboard[1].onTimeRate
        );
      }
    });

    it('should include rank in leaderboard entries', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 0) {
        expect(result.leaderboard[0]).toHaveProperty('rank');
        expect(result.leaderboard[0].rank).toBe(1);
      }
    });

    it('should include tier in leaderboard entries', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 0) {
        expect(result.leaderboard[0]).toHaveProperty('tier');
        expect(['platinum', 'gold', 'silver', 'bronze', 'rookie']).toContain(
          result.leaderboard[0].tier
        );
      }
    });

    it('should include badges in leaderboard entries', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 0) {
        expect(result.leaderboard[0]).toHaveProperty('badges');
        expect(Array.isArray(result.leaderboard[0].badges)).toBe(true);
      }
    });

    it('should respect limit parameter', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 5,
        offset: 0,
      });

      expect(result.leaderboard.length).toBeLessThanOrEqual(5);
    });

    it('should respect offset parameter', async () => {
      const result1 = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 5,
        offset: 0,
      });

      const result2 = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 5,
        offset: 5,
      });

      if (result1.leaderboard.length > 0 && result2.leaderboard.length > 0) {
        expect(result1.leaderboard[0].riderId).not.toBe(result2.leaderboard[0].riderId);
      }
    });

    it('should include stats with correct properties', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      expect(result.stats).toHaveProperty('totalRiders');
      expect(result.stats).toHaveProperty('totalDeliveries');
      expect(result.stats).toHaveProperty('avgPerformanceScore');
      expect(result.stats).toHaveProperty('totalEarnings');
    });

    it('should calculate performance score correctly', async () => {
      const result = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 10,
        offset: 0,
      });

      if (result.leaderboard.length > 0) {
        const entry = result.leaderboard[0];
        expect(entry.performanceScore).toBeGreaterThanOrEqual(0);
        expect(entry.performanceScore).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('get30DayTrend', () => {
    it('should return empty array for non-existent rider', async () => {
      const result = await get30DayTrend(999999);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return 30 days of data', async () => {
      // Get a rider ID from leaderboard
      const leaderboard = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 1,
        offset: 0,
      });

      if (leaderboard.leaderboard.length > 0) {
        const riderId = leaderboard.leaderboard[0].riderId;
        const result = await get30DayTrend(riderId);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(30);
      }
    });

    it('should include required fields in trend data', async () => {
      const leaderboard = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 1,
        offset: 0,
      });

      if (leaderboard.leaderboard.length > 0) {
        const riderId = leaderboard.leaderboard[0].riderId;
        const result = await get30DayTrend(riderId);
        
        if (result.length > 0) {
          expect(result[0]).toHaveProperty('date');
          expect(result[0]).toHaveProperty('deliveries');
          expect(result[0]).toHaveProperty('earnings');
          expect(result[0]).toHaveProperty('onTimeRate');
        }
      }
    });
  });

  describe('getRiderPerformanceDetails', () => {
    it('should return null for non-existent rider', async () => {
      const result = await getRiderPerformanceDetails(999999, 'all');
      expect(result).toBeNull();
    });

    it('should return performance details for existing rider', async () => {
      const leaderboard = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 1,
        offset: 0,
      });

      if (leaderboard.leaderboard.length > 0) {
        const riderId = leaderboard.leaderboard[0].riderId;
        const result = await getRiderPerformanceDetails(riderId, 'all');
        
        expect(result).not.toBeNull();
        if (result) {
          expect(result).toHaveProperty('rider');
          expect(result).toHaveProperty('deliveries');
          expect(result).toHaveProperty('totalEarnings');
          expect(result).toHaveProperty('earningsBreakdown');
          expect(result).toHaveProperty('rating');
          expect(result).toHaveProperty('acceptanceRate');
        }
      }
    });

    it('should include earnings breakdown', async () => {
      const leaderboard = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 1,
        offset: 0,
      });

      if (leaderboard.leaderboard.length > 0) {
        const riderId = leaderboard.leaderboard[0].riderId;
        const result = await getRiderPerformanceDetails(riderId, 'all');
        
        if (result) {
          expect(result.earningsBreakdown).toHaveProperty('base');
          expect(result.earningsBreakdown).toHaveProperty('bonus');
          expect(result.earningsBreakdown).toHaveProperty('tips');
        }
      }
    });

    it('should work with week period', async () => {
      const leaderboard = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 1,
        offset: 0,
      });

      if (leaderboard.leaderboard.length > 0) {
        const riderId = leaderboard.leaderboard[0].riderId;
        const result = await getRiderPerformanceDetails(riderId, 'week');
        
        expect(result).not.toBeNull();
      }
    });

    it('should work with month period', async () => {
      const leaderboard = await getRiderLeaderboard({
        period: 'all',
        category: 'overall',
        limit: 1,
        offset: 0,
      });

      if (leaderboard.leaderboard.length > 0) {
        const riderId = leaderboard.leaderboard[0].riderId;
        const result = await getRiderPerformanceDetails(riderId, 'month');
        
        expect(result).not.toBeNull();
      }
    });
  });
});

describe('Tier Filtering', () => {
  it('should filter by platinum tier', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'platinum',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('platinum');
    });
  });

  it('should filter by gold tier', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'gold',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('gold');
    });
  });

  it('should filter by silver tier', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'silver',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('silver');
    });
  });

  it('should filter by bronze tier', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'bronze',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('bronze');
    });
  });

  it('should filter by rookie tier', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'rookie',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('rookie');
    });
  });

  it('should show all tiers when tier is "all"', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'all',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    // Should include riders from multiple tiers (if data exists)
    if (result.leaderboard.length > 0) {
      const uniqueTiers = new Set(result.leaderboard.map((r) => r.tier));
      expect(uniqueTiers.size).toBeGreaterThan(0);
    }
  });

  it('should show all tiers when tier is undefined', async () => { const result = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    // Should include riders from multiple tiers (if data exists)
    if (result.leaderboard.length > 0) {
      const uniqueTiers = new Set(result.leaderboard.map((r) => r.tier));
      expect(uniqueTiers.size).toBeGreaterThan(0);
    }
  });

  it('should work with tier filter and week period', async () => {
    const result = await getRiderLeaderboard({
      period: 'week',
      category: 'overall',
      tier: 'gold',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('gold');
    });
  });

  it('should work with tier filter and earnings category', async () => {
    const result = await getRiderLeaderboard({
      period: 'all',
      category: 'earnings',
      tier: 'platinum',
      limit: 50,
      offset: 0,
    });

    expect(Array.isArray(result.leaderboard)).toBe(true);
    result.leaderboard.forEach((rider) => {
      expect(rider.tier).toBe('platinum');
    });
  });

  it('should return correct total count when filtered by tier', async () => {
    const allResult = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      limit: 1000,
      offset: 0,
    });

    const platinumResult = await getRiderLeaderboard({
      period: 'all',
      category: 'overall',
      tier: 'platinum',
      limit: 1000,
      offset: 0,
    });

    expect(platinumResult.total).toBeLessThanOrEqual(allResult.total);
    expect(platinumResult.total).toBe(platinumResult.leaderboard.length);
  });
});

// Rider Comparison Tests
describe('Rider Comparison', () => {
  it('should compare two riders successfully', async () => {
    const comparison = await db.compareRiders(1, 2, 'all');
    
    expect(comparison).toBeDefined();
    if (comparison) {
      expect(comparison.rider1).toBeDefined();
      expect(comparison.rider2).toBeDefined();
      expect(comparison.winners).toBeDefined();
      expect(comparison.differences).toBeDefined();
    }
  });

  it('should calculate performance scores for both riders', async () => {
    const comparison = await db.compareRiders(1, 2, 'all');
    
    if (comparison) {
      expect(comparison.rider1.performanceScore).toBeGreaterThanOrEqual(0);
      expect(comparison.rider1.performanceScore).toBeLessThanOrEqual(100);
      expect(comparison.rider2.performanceScore).toBeGreaterThanOrEqual(0);
      expect(comparison.rider2.performanceScore).toBeLessThanOrEqual(100);
    }
  });

  it('should determine winners for each metric', async () => {
    const comparison = await db.compareRiders(1, 2, 'all');
    
    if (comparison) {
      // Winner values should be 0 (tie), 1 (rider1), or 2 (rider2)
      expect([0, 1, 2]).toContain(comparison.winners.performanceScore);
      expect([0, 1, 2]).toContain(comparison.winners.deliveries);
      expect([0, 1, 2]).toContain(comparison.winners.earnings);
      expect([0, 1, 2]).toContain(comparison.winners.rating);
    }
  });

  it('should calculate differences between riders', async () => {
    const comparison = await db.compareRiders(1, 2, 'all');
    
    if (comparison) {
      expect(typeof comparison.differences.performanceScore).toBe('number');
      expect(typeof comparison.differences.deliveries).toBe('number');
      expect(typeof comparison.differences.earnings).toBe('number');
      expect(typeof comparison.differences.rating).toBe('number');
    }
  });

  it('should include 30-day trends for both riders', async () => {
    const comparison = await db.compareRiders(1, 2, 'all');
    
    if (comparison) {
      expect(Array.isArray(comparison.rider1.trend)).toBe(true);
      expect(Array.isArray(comparison.rider2.trend)).toBe(true);
      expect(comparison.rider1.trend.length).toBeLessThanOrEqual(30);
      expect(comparison.rider2.trend.length).toBeLessThanOrEqual(30);
    }
  });

  it('should handle comparison for different time periods', async () => {
    const periods: Array<'today' | 'week' | 'month' | 'all'> = ['today', 'week', 'month', 'all'];
    
    for (const period of periods) {
      const comparison = await db.compareRiders(1, 2, period);
      if (comparison) {
        expect(comparison.rider1).toBeDefined();
        expect(comparison.rider2).toBeDefined();
      }
    }
  });

  it('should return null for invalid rider IDs', async () => {
    const comparison = await db.compareRiders(99999, 99998, 'all');
    expect(comparison).toBeNull();
  });

  it('should handle comparison when one rider has no data', async () => {
    // This test assumes rider 1 exists but rider 99999 doesn't
    const comparison = await db.compareRiders(1, 99999, 'all');
    expect(comparison).toBeNull();
  });
});
