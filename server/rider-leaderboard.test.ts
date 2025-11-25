import { describe, it, expect, beforeAll } from 'vitest';
import { getRiderLeaderboard, get30DayTrend, getRiderPerformanceDetails } from './db';

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
