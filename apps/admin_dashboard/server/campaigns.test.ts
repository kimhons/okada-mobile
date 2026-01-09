import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Promotional Campaigns Tests", () => {
  let testCampaignId: number;
  const testUserId = 1;
  const timestamp = Date.now();

  beforeAll(async () => {
    // Test data will be created in tests
  });

  describe("Create Campaign", () => {
    it("should create a campaign successfully", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Test Campaign",
        description: "Test campaign description",
        discountCode: `TEST${timestamp}`,
        discountType: "percentage",
        discountValue: 20,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
      testCampaignId = Number(result[0].insertId);
    });

    it("should create percentage discount campaign", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Percentage Off",
        discountCode: `PERCENT10_${timestamp}`,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 50,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
    });

    it("should create fixed amount discount campaign", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Fixed Amount Off",
        discountCode: `FIXED5000_${timestamp}`,
        discountType: "fixed",
        discountValue: 500000, // 5000 FCFA in cents
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
    });

    it("should create campaign with minimum order amount", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Min Order Campaign",
        discountCode: `MIN10K_${timestamp}`,
        discountType: "percentage",
        discountValue: 15,
        minOrderAmount: 1000000, // 10,000 FCFA in cents
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
    });

    it("should create campaign with maximum discount amount", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Max Discount Campaign",
        discountCode: `MAX5K_${timestamp}`,
        discountType: "percentage",
        discountValue: 25,
        maxDiscountAmount: 500000, // 5000 FCFA in cents
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
    });
  });

  describe("Get Campaigns", () => {
    it("should get all campaigns", async () => {
      const campaigns = await db.getAllCampaigns();
      expect(campaigns.length).toBeGreaterThan(0);
    });

    it("should get campaign by ID", async () => {
      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign).toBeDefined();
      expect(campaign?.id).toBe(testCampaignId);
    });

    it("should get campaign by code", async () => {
      const campaign = await db.getCampaignByCode(`TEST${timestamp}`);
      expect(campaign).toBeDefined();
      expect(campaign?.discountCode).toBe(`TEST${timestamp}`);
    });

    it("should get only active campaigns", async () => {
      const campaigns = await db.getActiveCampaigns();
      campaigns.forEach(campaign => {
        expect(campaign.isActive).toBe(true);
      });
    });
  });

  describe("Update Campaign", () => {
    it("should update campaign details", async () => {
      await db.updateCampaign(testCampaignId, {
        name: "Updated Test Campaign",
        description: "Updated description",
      });

      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign?.name).toBe("Updated Test Campaign");
    });

    it("should update campaign status", async () => {
      await db.updateCampaign(testCampaignId, {
        isActive: false,
      });

      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign?.isActive).toBe(false);
    });

    it("should update campaign usage count", async () => {
      await db.updateCampaign(testCampaignId, {
        usageCount: 5,
      });

      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign?.usageCount).toBe(5);
    });

    it("should update campaign dates", async () => {
      const newEndDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
      
      await db.updateCampaign(testCampaignId, {
        endDate: newEndDate,
      });

      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign?.endDate).toBeDefined();
    });
  });

  describe("Delete Campaign", () => {
    it("should delete a campaign", async () => {
      // Create a campaign to delete
      const result = await db.createCampaign({
        createdBy: 1,
        name: "To Delete",
        discountCode: `DELETE_ME_${timestamp}`,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 10,
        usageCount: 0,
        isActive: true,
      });

      const campaignId = Number(result[0].insertId);
      
      await db.deleteCampaign(campaignId);
      
      const campaign = await db.getCampaignById(campaignId);
      expect(campaign).toBeUndefined();
    });
  });

  describe("Campaign Usage Tracking", () => {
    it("should record campaign usage", async () => {
      await db.recordCampaignUsage({
        campaignId: testCampaignId,
        userId: testUserId,
        orderId: 12345,
        discountAmount: 200000, // 2000 FCFA in cents
      });

      const usage = await db.getCampaignUsage(testCampaignId);
      expect(usage.length).toBeGreaterThan(0);
    });

    it("should get campaign usage history", async () => {
      const usage = await db.getCampaignUsage(testCampaignId);
      expect(usage.length).toBeGreaterThan(0);
    });

    it("should get user campaign usage", async () => {
      const usage = await db.getUserCampaignUsage(testUserId);
      expect(Array.isArray(usage)).toBe(true);
    });

    it("should check if user has used campaign", async () => {
      const hasUsed = await db.hasUserUsedCampaign(testUserId, testCampaignId);
      expect(typeof hasUsed).toBe("boolean");
    });
  });

  describe("Campaign Validation", () => {
    it("should validate active campaign", async () => {
      // Reactivate test campaign
      await db.updateCampaign(testCampaignId, {
        isActive: true,
      });

      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign?.isActive).toBe(true);
    });

    it("should validate campaign dates", async () => {
      const campaign = await db.getCampaignById(testCampaignId);
      const now = new Date();
      
      expect(campaign).toBeDefined();
      expect(new Date(campaign!.startDate).getTime()).toBeLessThanOrEqual(now.getTime() + 24 * 60 * 60 * 1000);
      expect(new Date(campaign!.endDate).getTime()).toBeGreaterThan(now.getTime() - 24 * 60 * 60 * 1000);
    });

    it("should validate campaign usage limit", async () => {
      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign).toBeDefined();
      expect(campaign!.usageCount).toBeLessThanOrEqual(campaign!.usageLimit);
    });

    it("should validate discount value", async () => {
      const campaign = await db.getCampaignById(testCampaignId);
      expect(campaign).toBeDefined();
      expect(campaign!.discountValue).toBeGreaterThan(0);
    });
  });

  describe("Campaign Statistics", () => {
    it("should calculate total campaigns", async () => {
      const campaigns = await db.getAllCampaigns();
      expect(campaigns.length).toBeGreaterThan(0);
    });

    it("should calculate active campaigns count", async () => {
      const activeCampaigns = await db.getActiveCampaigns();
      expect(Array.isArray(activeCampaigns)).toBe(true);
    });

    it("should calculate campaign usage rate", async () => {
      const campaign = await db.getCampaignById(testCampaignId);
      if (campaign && campaign.usageLimit) {
        const usageRate = (campaign.usageCount / campaign.usageLimit) * 100;
        expect(usageRate).toBeGreaterThanOrEqual(0);
        expect(usageRate).toBeLessThanOrEqual(100);
      } else {
        expect(campaign).toBeDefined();
      }
    });

    it("should calculate total discount given", async () => {
      const usage = await db.getCampaignUsage(testCampaignId);
      const totalDiscount = usage.reduce((sum, u) => sum + u.discountAmount, 0);
      expect(totalDiscount).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Campaign Types", () => {
    it("should handle percentage discount campaigns", async () => {
      const campaign = await db.getCampaignByCode(`PERCENT10_${timestamp}`);
      expect(campaign).toBeDefined();
      expect(campaign?.discountType).toBe("percentage");
      expect(campaign?.discountValue).toBeLessThanOrEqual(100);
    });

    it("should handle fixed amount discount campaigns", async () => {
      const campaign = await db.getCampaignByCode(`FIXED5000_${timestamp}`);
      expect(campaign).toBeDefined();
      expect(campaign?.discountType).toBe("fixed");
      expect(campaign?.discountValue).toBeGreaterThan(0);
    });

    it("should handle campaigns with minimum order requirements", async () => {
      const campaign = await db.getCampaignByCode(`MIN10K_${timestamp}`);
      expect(campaign).toBeDefined();
      expect(campaign?.minOrderAmount).toBeGreaterThan(0);
    });

    it("should handle campaigns with maximum discount caps", async () => {
      const campaign = await db.getCampaignByCode(`MAX5K_${timestamp}`);
      expect(campaign).toBeDefined();
      expect(campaign?.maxDiscountAmount).toBeGreaterThan(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle non-existent campaign ID", async () => {
      const campaign = await db.getCampaignById(999999);
      expect(campaign).toBeUndefined();
    });

    it("should handle non-existent campaign code", async () => {
      const campaign = await db.getCampaignByCode("NONEXISTENT");
      expect(campaign).toBeUndefined();
    });

    it("should handle expired campaigns", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Expired Campaign",
        discountCode: `EXPIRED_${timestamp}`,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
      const campaignId = Number(result[0].insertId);
      const campaign = await db.getCampaignById(campaignId);
      expect(new Date(campaign!.endDate).getTime()).toBeLessThan(Date.now());
    });

    it("should handle campaigns with max uses reached", async () => {
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Fully Used Campaign",
        discountCode: `FULLYUSED_${timestamp}`,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 10,
        usageCount: 10,
        isActive: true,
      });

      const campaignId = Number(result[0].insertId);
      const campaign = await db.getCampaignById(campaignId);
      expect(campaign!.usageCount).toBe(campaign!.usageLimit);
    });

    it("should handle very long campaign names", async () => {
      const longName = "A".repeat(200);
      
      const result = await db.createCampaign({
        createdBy: 1,
        name: longName,
        discountCode: `LONGNAME_${timestamp}`,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
      const campaignId = Number(result[0].insertId);
      const campaign = await db.getCampaignById(campaignId);
      expect(campaign?.name).toBeDefined();
    });

    it("should handle special characters in campaign code", async () => {
      const specialCode = `SPECIAL-2024_TEST_${timestamp}`;
      
      const result = await db.createCampaign({
        createdBy: 1,
        name: "Special Code Campaign",
        discountCode: specialCode,
        discountType: "percentage",
        discountValue: 10,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
      });

      expect(result).toBeDefined();
      const campaign = await db.getCampaignByCode(specialCode);
      expect(campaign?.discountCode).toBe(specialCode);
    });
  });

  describe("Performance Tests", () => {
    it("should handle creating many campaigns efficiently", async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 20; i++) {
        await db.createCampaign({
        createdBy: 1,
          name: `Performance Test ${i}`,
          discountCode: `PERF${i}_${timestamp}`,
          discountType: "percentage",
          discountValue: 10,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          usageLimit: 100,
          usageCount: 0,
          isActive: true,
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 3 seconds)
      expect(duration).toBeLessThan(3000);
    });

    it("should retrieve campaigns quickly", async () => {
      const startTime = Date.now();
      
      await db.getAllCampaigns();
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});

