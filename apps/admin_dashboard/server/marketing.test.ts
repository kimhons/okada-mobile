import { beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Marketing & Promotions Features", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeEach(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Clean up test data
    await db.delete(users).execute();

    // Create test admin user
    await db.insert(users).values({
      openId: "test-admin",
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin",
    });

    const testUsers = await db.select().from(users).where(eq(users.openId, "test-admin"));
    testUserId = testUsers[0].id;

    // Create caller with admin context
    caller = appRouter.createCaller({
      user: {
        id: testUserId,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
        loginMethod: "oauth",
      },
      req: {} as any,
      res: {} as any,
    });
  });

  describe("Coupon Management", () => {
    it("should create a new coupon", async () => {
      const coupon = await caller.marketing.createCoupon({
        code: `TEST${Date.now()}`,
        discountType: "percentage",
        discountValue: 2000, // 20%
        minOrderAmount: 5000,
        maxDiscountAmount: 1000,
        usageLimit: 100,
        usageLimitPerUser: 1,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      expect(coupon).toBeDefined();
      expect(coupon.code).toContain("TEST");
      expect(coupon.discountType).toBe("percentage");
      expect(coupon.discountValue).toBe(2000);
    });

    it("should get all coupons", async () => {
      await caller.marketing.createCoupon({
        code: `COUPON1${Date.now()}`,
        discountType: "fixed",
        discountValue: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      const coupons = await caller.marketing.getAllCoupons({});
      expect(coupons.length).toBeGreaterThan(0);
    });

    it("should update a coupon", async () => {
      const coupon = await caller.marketing.createCoupon({
        code: `UPDATE${Date.now()}`,
        discountType: "percentage",
        discountValue: 1500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      const updated = await caller.marketing.updateCoupon({
        id: coupon.id,
        discountValue: 2500,
        isActive: false,
      });

      expect(updated.discountValue).toBe(2500);
      expect(updated.isActive).toBe(false);
    });

    it("should delete a coupon", async () => {
      const coupon = await caller.marketing.createCoupon({
        code: `DELETE${Date.now()}`,
        discountType: "fixed",
        discountValue: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      await caller.marketing.deleteCoupon({ id: coupon.id });

      const coupons = await caller.marketing.getAllCoupons({});
      const deletedCoupon = coupons.find((c) => c.id === coupon.id);
      expect(deletedCoupon).toBeUndefined();
    });

    it("should filter coupons by status", async () => {
      await caller.marketing.createCoupon({
        code: `ACTIVE${Date.now()}`,
        discountType: "percentage",
        discountValue: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      await caller.marketing.createCoupon({
        code: `INACTIVE${Date.now()}`,
        discountType: "percentage",
        discountValue: 1000,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: false,
      });

      const activeCoupons = await caller.marketing.getAllCoupons({ isActive: true });
      expect(activeCoupons.every((c) => c.isActive)).toBe(true);
    });

    it("should search coupons by code", async () => {
      const uniqueCode = `SEARCH${Date.now()}`;
      await caller.marketing.createCoupon({
        code: uniqueCode,
        discountType: "fixed",
        discountValue: 500,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
      });

      const coupons = await caller.marketing.getAllCoupons({ search: uniqueCode });
      expect(coupons.length).toBeGreaterThan(0);
      expect(coupons[0].code).toBe(uniqueCode);
    });
  });

  describe("Promotional Campaigns", () => {
    it("should create a new promotional campaign", async () => {
      const campaign = await caller.marketing.createPromotionalCampaign({
        name: `Campaign ${Date.now()}`,
        description: "Test campaign",
        type: "discount",
        targetAudience: "all",
        budget: 100000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "draft",
      });

      expect(campaign).toBeDefined();
      expect(campaign.name).toContain("Campaign");
      expect(campaign.type).toBe("discount");
      expect(campaign.status).toBe("draft");
    });

    it("should get all promotional campaigns", async () => {
      await caller.marketing.createPromotionalCampaign({
        name: `Campaign 1 ${Date.now()}`,
        type: "free_delivery",
        targetAudience: "new_users",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "active",
      });

      const campaigns = await caller.marketing.getAllPromotionalCampaigns({});
      expect(campaigns.length).toBeGreaterThan(0);
    });

    it("should update a promotional campaign", async () => {
      const campaign = await caller.marketing.createPromotionalCampaign({
        name: `Update Campaign ${Date.now()}`,
        type: "cashback",
        targetAudience: "all",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "draft",
      });

      const updated = await caller.marketing.updatePromotionalCampaign({
        id: campaign.id,
        status: "active",
        budget: 50000,
      });

      expect(updated.status).toBe("active");
      expect(updated.budget).toBe(50000);
    });

    it("should delete a promotional campaign", async () => {
      const campaign = await caller.marketing.createPromotionalCampaign({
        name: `Delete Campaign ${Date.now()}`,
        type: "bundle",
        targetAudience: "active_users",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "draft",
      });

      await caller.marketing.deletePromotionalCampaign({ id: campaign.id });

      const campaigns = await caller.marketing.getAllPromotionalCampaigns({});
      const deletedCampaign = campaigns.find((c) => c.id === campaign.id);
      expect(deletedCampaign).toBeUndefined();
    });

    it("should filter campaigns by status", async () => {
      await caller.marketing.createPromotionalCampaign({
        name: `Active Campaign ${Date.now()}`,
        type: "discount",
        targetAudience: "all",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "active",
      });

      const activeCampaigns = await caller.marketing.getAllPromotionalCampaigns({
        status: "active",
      });
      expect(activeCampaigns.every((c) => c.status === "active")).toBe(true);
    });

    it("should filter campaigns by type", async () => {
      await caller.marketing.createPromotionalCampaign({
        name: `Discount Campaign ${Date.now()}`,
        type: "discount",
        targetAudience: "all",
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "draft",
      });

      const discountCampaigns = await caller.marketing.getAllPromotionalCampaigns({
        type: "discount",
      });
      expect(discountCampaigns.every((c) => c.type === "discount")).toBe(true);
    });
  });

  describe("Loyalty Program", () => {
    it("should create a new loyalty program member", async () => {
      const program = await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 100,
        tier: "bronze",
      });

      expect(program).toBeDefined();
      expect(program.userId).toBe(testUserId);
      expect(program.points).toBe(100);
      expect(program.tier).toBe("bronze");
    });

    it("should get all loyalty programs", async () => {
      await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 500,
        tier: "silver",
      });

      const programs = await caller.marketing.getAllLoyaltyPrograms();
      expect(programs.length).toBeGreaterThan(0);
    });

    it("should update a loyalty program", async () => {
      await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 200,
        tier: "bronze",
      });

      const updated = await caller.marketing.updateLoyaltyProgram({
        userId: testUserId,
        points: 1000,
        tier: "gold",
      });

      expect(updated.points).toBe(1000);
      expect(updated.tier).toBe("gold");
    });

    it("should delete a loyalty program", async () => {
      await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 300,
        tier: "silver",
      });

      await caller.marketing.deleteLoyaltyProgram({ userId: testUserId });

      const programs = await caller.marketing.getAllLoyaltyPrograms();
      const deletedProgram = programs.find((p) => p.userId === testUserId);
      expect(deletedProgram).toBeUndefined();
    });

    it("should create a loyalty transaction", async () => {
      await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 100,
        tier: "bronze",
      });

      const transaction = await caller.marketing.createLoyaltyTransaction({
        userId: testUserId,
        type: "earned",
        points: 50,
        description: "Order bonus",
        orderId: 123,
      });

      expect(transaction).toBeDefined();
      expect(transaction.type).toBe("earned");
      expect(transaction.points).toBe(50);
    });

    it("should get loyalty transactions for a user", async () => {
      await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 100,
        tier: "bronze",
      });

      await caller.marketing.createLoyaltyTransaction({
        userId: testUserId,
        type: "earned",
        points: 25,
        description: "Welcome bonus",
      });

      const transactions = await caller.marketing.getLoyaltyTransactions({
        userId: testUserId,
      });
      expect(transactions.length).toBeGreaterThan(0);
    });

    it("should handle point redemption transactions", async () => {
      await caller.marketing.createLoyaltyProgram({
        userId: testUserId,
        points: 500,
        tier: "silver",
      });

      const transaction = await caller.marketing.createLoyaltyTransaction({
        userId: testUserId,
        type: "redeemed",
        points: 100,
        description: "Reward redemption",
      });

      expect(transaction.type).toBe("redeemed");
      expect(transaction.points).toBe(100); // Points are stored as positive, sign is determined by type
    });
  });
});

