import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("PDF Export and Bug Fix Tests", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUser: typeof users.$inferSelect;

  beforeEach(async () => {
    // Create test user
    await db.upsertUser({
      openId: `test-user-${Date.now()}`,
      name: "Test Admin",
      email: "admin@test.com",
      role: "admin",
    });

    const allUsers = await db.getDb().then(database => 
      database?.select().from(users).where(eq(users.email, "admin@test.com"))
    );
    testUser = allUsers?.[0]!;

    caller = appRouter.createCaller({
      user: testUser,
      req: {} as any,
      res: {} as any,
    });
  });

  describe("PDF Export Feature", () => {
    it("should export week over week comparison report", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "week",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.periodType).toBe("week");
      expect(result.html).toContain("OKADA Admin");
      expect(result.html).toContain("Transaction Analytics Report");
      expect(result.html).toContain("Week over Week");
    });

    it("should export month over month comparison report", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "month",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      expect(result.periodType).toBe("month");
      expect(result.html).toContain("Month over Month");
    });

    it("should export quarter over quarter comparison report", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "quarter",
      });

      expect(result).toBeDefined();
      expect(result.periodType).toBe("quarter");
      expect(result.html).toContain("Quarter over Quarter");
    });

    it("should export year over year comparison report", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "year",
      });

      expect(result).toBeDefined();
      expect(result.periodType).toBe("year");
      expect(result.html).toContain("Year over Year");
    });

    it("should include all required metrics in PDF", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "month",
      });

      expect(result.html).toContain("Total Transactions");
      expect(result.html).toContain("Success Rate");
      expect(result.html).toContain("Total Revenue");
      expect(result.html).toContain("Average Amount");
      expect(result.html).toContain("FCFA");
    });

    it("should include comparison table in PDF", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "month",
      });

      expect(result.html).toContain("Detailed Comparison");
      expect(result.html).toContain("Current Period");
      expect(result.html).toContain("Previous Period");
      expect(result.html).toContain("Change");
    });

    it("should include proper styling in PDF HTML", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "month",
      });

      expect(result.html).toContain("<style>");
      expect(result.html).toContain("font-family");
      expect(result.html).toContain(".metric-card");
      expect(result.html).toContain(".comparison-table");
    });

    it("should include report metadata in PDF", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "month",
      });

      expect(result.html).toContain("Generated on");
      expect(result.html).toContain("Report ID:");
      expect(result.html).toContain("COMP-");
    });

    it("should format currency values correctly in PDF", async () => {
      // Create a test transaction
      await db.createTransaction({
        transactionId: `TXN-PDF-TEST-${Date.now()}`,
        type: "order_payment",
        amount: 100000, // 1000 FCFA
        status: "completed",
        description: "PDF test transaction",
      });

      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "week",
      });

      // Should contain FCFA currency
      expect(result.html).toContain("FCFA");
    });

    it("should handle periods with no transactions gracefully", async () => {
      const result = await caller.financial.exportPeriodComparisonPDF({
        periodType: "year",
      });

      expect(result).toBeDefined();
      expect(result.html).toBeDefined();
      // Should not throw error even with no transactions
    });
  });

  describe("Campaign Duplicate Key Fix", () => {
    it("should return campaigns with unique IDs", async () => {
      // Create test campaigns
      await db.createCampaign({
        name: "Test Campaign 1",
        description: "Test description 1",
        discountCode: `TEST1-${Date.now()}`,
        discountType: "percentage",
        discountValue: 10,
        minOrderAmount: 0,
        targetAudience: "all",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        createdBy: testUser.id,
      });

      await db.createCampaign({
        name: "Test Campaign 2",
        description: "Test description 2",
        discountCode: `TEST2-${Date.now()}`,
        discountType: "percentage",
        discountValue: 20,
        minOrderAmount: 0,
        targetAudience: "all",
        startDate: new Date(),
        endDate: new Date(Date.now() + 86400000),
        createdBy: testUser.id,
      });

      const campaigns = await caller.campaigns.list();

      expect(campaigns).toBeDefined();
      expect(Array.isArray(campaigns)).toBe(true);

      // Check that all IDs are unique
      const ids = campaigns.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should handle empty campaign list", async () => {
      const campaigns = await caller.campaigns.list();

      expect(campaigns).toBeDefined();
      expect(Array.isArray(campaigns)).toBe(true);
    });
  });

  describe("Activity Logging for PDF Export", () => {
    it("should log PDF export activity", async () => {
      await caller.financial.exportPeriodComparisonPDF({
        periodType: "month",
      });

      const activities = await db.getActivityLogs({ limit: 1 });

      expect(activities.length).toBeGreaterThan(0);
      const lastActivity = activities[0];
      expect(lastActivity.action).toBe("export_period_comparison");
      expect(lastActivity.entityType).toBe("analytics");
      expect(lastActivity.details).toContain("Month over Month");
    });
  });
});

