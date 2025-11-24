import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Email Report Feature Tests", () => {
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

  describe("Email Report Generation", () => {
    it("should generate email report for week over week comparison", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "week",
        recipients: "stakeholder@example.com",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(1);
      expect(result.recipients).toBe("stakeholder@example.com");
      expect(result.html).toBeDefined();
      expect(result.html).toContain("OKADA Admin");
      expect(result.html).toContain("Transaction Analytics Report");
    });

    it("should generate email report for month over month comparison", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.html).toContain("Month over Month");
    });

    it("should generate email report for quarter over quarter comparison", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "quarter",
        recipients: "stakeholder@example.com",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.html).toContain("Quarter over Quarter");
    });

    it("should generate email report for year over year comparison", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "year",
        recipients: "stakeholder@example.com",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.html).toContain("Year over Year");
    });
  });

  describe("Multiple Recipients", () => {
    it("should handle multiple comma-separated email recipients", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "user1@example.com, user2@example.com, user3@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(3);
      expect(result.recipients).toContain("user1@example.com");
      expect(result.recipients).toContain("user2@example.com");
      expect(result.recipients).toContain("user3@example.com");
    });

    it("should handle recipients with extra whitespace", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "  user1@example.com  ,  user2@example.com  ",
      });

      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(2);
    });

    it("should filter out empty email strings", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "user1@example.com, , user2@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.recipientCount).toBe(2);
    });
  });

  describe("Email Validation", () => {
    it("should reject invalid email format", async () => {
      await expect(
        caller.financial.emailPeriodComparisonReport({
          periodType: "month",
          recipients: "invalid-email",
        })
      ).rejects.toThrow("Invalid email format");
    });

    it("should reject empty recipients", async () => {
      await expect(
        caller.financial.emailPeriodComparisonReport({
          periodType: "month",
          recipients: "",
        })
      ).rejects.toThrow();
    });

    it("should reject recipients with only whitespace", async () => {
      await expect(
        caller.financial.emailPeriodComparisonReport({
          periodType: "month",
          recipients: "   ",
        })
      ).rejects.toThrow();
    });

    it("should identify specific invalid emails in a list", async () => {
      await expect(
        caller.financial.emailPeriodComparisonReport({
          periodType: "month",
          recipients: "valid@example.com, invalid-email, another@example.com",
        })
      ).rejects.toThrow("invalid-email");
    });
  });

  describe("Optional Message Field", () => {
    it("should include custom message in email HTML", async () => {
      const customMessage = "Please review the quarterly performance metrics.";
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "quarter",
        recipients: "stakeholder@example.com",
        message: customMessage,
      });

      expect(result.html).toContain(customMessage);
      expect(result.html).toContain("user-message");
    });

    it("should work without optional message", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
    });

    it("should handle empty message string", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
        message: "",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Email Content", () => {
    it("should include sender information in email", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.html).toContain(testUser.name || "An admin");
      expect(result.html).toContain("Sent by:");
    });

    it("should include all key metrics in email", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.html).toContain("Total Transactions");
      expect(result.html).toContain("Success Rate");
      expect(result.html).toContain("Total Revenue");
      expect(result.html).toContain("Average Amount");
      expect(result.html).toContain("FCFA");
    });

    it("should include comparison table in email", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.html).toContain("Detailed Comparison");
      expect(result.html).toContain("Current Period");
      expect(result.html).toContain("Previous Period");
      expect(result.html).toContain("Change");
      expect(result.html).toContain("comparison-table");
    });

    it("should include professional email styling", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.html).toContain("<style>");
      expect(result.html).toContain("email-container");
      expect(result.html).toContain("metrics-grid");
      expect(result.html).toContain("metric-card");
    });

    it("should include report metadata", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.html).toContain("Report ID: EMAIL-");
      expect(result.html).toContain("Generated on");
    });

    it("should include contact information in footer", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      expect(result.html).toContain("support@okada-admin.com");
      expect(result.html).toContain("footer");
    });
  });

  describe("Activity Logging", () => {
    it("should log email report activity", async () => {
      await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
      });

      const activities = await db.getActivityLogs({ limit: 1 });

      expect(activities.length).toBeGreaterThan(0);
      const lastActivity = activities[0];
      expect(lastActivity.action).toBe("email_period_comparison");
      expect(lastActivity.entityType).toBe("analytics");
      expect(lastActivity.details).toContain("Month over Month");
      expect(lastActivity.details).toContain("stakeholder@example.com");
    });

    it("should log recipient count in activity", async () => {
      await caller.financial.emailPeriodComparisonReport({
        periodType: "week",
        recipients: "user1@example.com, user2@example.com, user3@example.com",
      });

      const activities = await db.getActivityLogs({ limit: 1 });
      const lastActivity = activities[0];
      
      expect(lastActivity.details).toContain("3 recipient(s)");
    });
  });

  describe("Edge Cases", () => {
    it("should handle periods with no transactions", async () => {
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "year",
        recipients: "stakeholder@example.com",
      });

      expect(result.success).toBe(true);
      expect(result.html).toBeDefined();
    });

    it("should handle very long custom messages", async () => {
      const longMessage = "A".repeat(500);
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "month",
        recipients: "stakeholder@example.com",
        message: longMessage,
      });

      expect(result.success).toBe(true);
      expect(result.html).toContain(longMessage);
    });

    it("should handle special characters in message", async () => {
      const specialMessage = "Review Q4 results: <important> & 'urgent'";
      const result = await caller.financial.emailPeriodComparisonReport({
        periodType: "quarter",
        recipients: "stakeholder@example.com",
        message: specialMessage,
      });

      expect(result.success).toBe(true);
    });
  });
});

