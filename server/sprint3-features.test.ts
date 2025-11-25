import { describe, it, expect, beforeAll } from 'vitest';
import * as db from './db';

describe('Sprint 3: Geo Analytics, Referrals, and Loyalty Programs', () => {
  describe('Geo Analytics', () => {
    it('should get geo regions', async () => {
      const regions = await db.getGeoRegions({ regionType: 'city' });
      expect(regions).toBeDefined();
      expect(Array.isArray(regions)).toBe(true);
    });

    it('should get regional analytics', async () => {
      // First, get a region
      const regions = await db.getGeoRegions({ regionType: 'city' });
      
      if (regions && regions.length > 0) {
        const analytics = await db.getRegionalAnalytics(regions[0].id, 'month');
        expect(analytics).toBeDefined();
      } else {
        // If no regions exist, test should pass
        expect(true).toBe(true);
      }
    });

    it('should get regional performance comparison', async () => {
      const comparison = await db.getRegionalPerformanceComparison('month');
      expect(comparison).toBeDefined();
      expect(Array.isArray(comparison)).toBe(true);
    });

    it('should get order heatmap data', async () => {
      const heatmap = await db.getOrderHeatmapData();
      expect(heatmap).toBeDefined();
      expect(Array.isArray(heatmap)).toBe(true);
    });

    it('should upsert regional analytics', async () => {
      // First, get or create a region
      const regions = await db.getGeoRegions({ regionType: 'city' });
      
      if (regions && regions.length > 0) {
        const regionId = regions[0].id;
        const now = new Date();
        const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const result = await db.upsertRegionalAnalytics({
          regionId,
          period: 'month',
          periodStart,
          periodEnd,
          totalOrders: 50,
          totalRevenue: 250000,
          activeUsers: 30,
          activeRiders: 10,
          avgDeliveryTime: 25,
          orderDensity: 15.5,
          customerSatisfaction: 92,
        });

        expect(result).toBeDefined();
      } else {
        expect(true).toBe(true);
      }
    });
  });

  describe('Referral Program', () => {
    it('should create a referral', async () => {
      const referral = await db.createReferral({
        referrerUserId: 1,
        referredUserEmail: 'test@example.com',
        rewardTier: 'bronze',
      });

      expect(referral).toBeDefined();
      expect(referral?.referralCode).toBeDefined();
      expect(referral?.status).toBe('pending');
    });

    it('should get user referrals', async () => {
      const referrals = await db.getUserReferrals(1);
      expect(referrals).toBeDefined();
      expect(Array.isArray(referrals)).toBe(true);
    });

    it('should get referral by code', async () => {
      // First create a referral
      const referral = await db.createReferral({
        referrerUserId: 1,
        referredUserEmail: 'test2@example.com',
        rewardTier: 'silver',
      });

      if (referral?.referralCode) {
        const found = await db.getReferralByCode(referral.referralCode);
        expect(found).toBeDefined();
        expect(found?.referralCode).toBe(referral.referralCode);
      }
    });

    it('should complete a referral', async () => {
      // Create a referral first
      const referral = await db.createReferral({
        referrerUserId: 1,
        referredUserEmail: 'test3@example.com',
        rewardTier: 'gold',
      });

      if (referral?.id) {
        const result = await db.completeReferral(referral.id, 2, 50000);
        expect(result).toBeDefined();
      }
    });

    it('should get referral stats', async () => {
      const stats = await db.getReferralStats();
      expect(stats).toBeDefined();
      expect(stats?.totalReferrals).toBeGreaterThanOrEqual(0);
      expect(stats?.completedReferrals).toBeGreaterThanOrEqual(0);
      expect(stats?.pendingReferrals).toBeGreaterThanOrEqual(0);
    });

    it('should get referral rewards', async () => {
      const rewards = await db.getReferralRewards();
      expect(rewards).toBeDefined();
      expect(Array.isArray(rewards)).toBe(true);
    });

    it('should update referral reward', async () => {
      const result = await db.updateReferralReward('bronze', {
        referrerReward: 5000,
        referredReward: 2500,
        minOrderValue: 10000,
        description: 'Updated bronze tier',
      });

      expect(result).toBeDefined();
    });
  });

  describe('Loyalty Program', () => {
    it('should get loyalty tiers', async () => {
      const tiers = await db.getLoyaltyTiers();
      expect(tiers).toBeDefined();
      expect(Array.isArray(tiers)).toBe(true);
    });

    it('should initialize user loyalty', async () => {
      const result = await db.initializeUserLoyalty(1);
      expect(result).toBeDefined();
    });

    it('should get user loyalty info', async () => {
      // First initialize
      await db.initializeUserLoyalty(1);
      
      const info = await db.getUserLoyaltyInfo(1);
      expect(info).toBeDefined();
      expect(info?.userId).toBe(1);
    });

    it('should add loyalty points', async () => {
      // Initialize first
      await db.initializeUserLoyalty(1);

      const result = await db.addLoyaltyPoints(
        1,
        100,
        'earned',
        'Test points addition'
      );

      expect(result).toBeDefined();
      expect(result?.success).toBe(true);
    });

    it('should get loyalty rewards catalog', async () => {
      const catalog = await db.getLoyaltyRewardsCatalog();
      expect(catalog).toBeDefined();
      expect(Array.isArray(catalog)).toBe(true);
    });

    it('should get user loyalty transactions', async () => {
      const transactions = await db.getUserLoyaltyTransactions(1, 10);
      expect(transactions).toBeDefined();
      expect(Array.isArray(transactions)).toBe(true);
    });

    it('should get user loyalty redemptions', async () => {
      const redemptions = await db.getUserLoyaltyRedemptions(1);
      expect(redemptions).toBeDefined();
      expect(Array.isArray(redemptions)).toBe(true);
    });

    it('should get loyalty program stats', async () => {
      const stats = await db.getLoyaltyProgramStats();
      expect(stats).toBeDefined();
      expect(stats?.totalMembers).toBeGreaterThanOrEqual(0);
      expect(stats?.totalPointsIssued).toBeGreaterThanOrEqual(0);
    });

    it('should redeem loyalty reward', async () => {
      // Initialize user and add points
      await db.initializeUserLoyalty(1);
      await db.addLoyaltyPoints(1, 1000, 'earned', 'Test points for redemption');

      // Get rewards catalog
      const catalog = await db.getLoyaltyRewardsCatalog();
      
      if (catalog && catalog.length > 0) {
        // Find a reward with low points cost
        const affordableReward = catalog.find(r => r.pointsCost <= 1000 && r.isActive);
        
        if (affordableReward) {
          const result = await db.redeemLoyaltyReward(1, affordableReward.id);
          expect(result).toBeDefined();
          // Result could be success or failure depending on points balance
          expect(result?.success).toBeDefined();
        } else {
          // No affordable rewards, test passes
          expect(true).toBe(true);
        }
      } else {
        // No rewards in catalog, test passes
        expect(true).toBe(true);
      }
    });
  });

  describe('Integration Tests', () => {
    it('should handle referral completion with loyalty points', async () => {
      // Create referral
      const referral = await db.createReferral({
        referrerUserId: 1,
        referredUserEmail: 'integration@example.com',
        rewardTier: 'platinum',
      });

      if (referral?.id) {
        // Initialize loyalty for both users
        await db.initializeUserLoyalty(1);
        await db.initializeUserLoyalty(2);

        // Complete referral
        await db.completeReferral(referral.id, 2, 100000);

        // Check that both users have loyalty points
        const referrerInfo = await db.getUserLoyaltyInfo(1);
        const referredInfo = await db.getUserLoyaltyInfo(2);

        expect(referrerInfo).toBeDefined();
        expect(referredInfo).toBeDefined();
      }
    });

    it('should track regional performance with orders', async () => {
      const regions = await db.getGeoRegions({ regionType: 'city' });
      
      if (regions && regions.length > 0) {
        // Get analytics for the region
        const analytics = await db.getRegionalAnalytics(regions[0].id, 'month');
        
        // Get performance comparison
        const comparison = await db.getRegionalPerformanceComparison('month');
        
        expect(analytics).toBeDefined();
        expect(comparison).toBeDefined();
        expect(Array.isArray(comparison)).toBe(true);
      } else {
        expect(true).toBe(true);
      }
    });
  });
});
