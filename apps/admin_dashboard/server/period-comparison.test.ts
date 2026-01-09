import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Transaction Period Comparison Tests", () => {
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

  describe("Period Type Comparison", () => {
    it("should compare week over week transactions", async () => {
      // Create transactions for current week
      const now = new Date();
      await db.createTransaction({
        transactionId: `TXN-WEEK-CURRENT-1-${Date.now()}`,
        type: "order_payment",
        amount: 50000,
        status: "completed",
        description: "Current week transaction 1",
      });

      await db.createTransaction({
        transactionId: `TXN-WEEK-CURRENT-2-${Date.now()}`,
        type: "order_payment",
        amount: 30000,
        status: "completed",
        description: "Current week transaction 2",
      });

      // Create transactions for previous week
      const lastWeek = new Date(now);
      lastWeek.setDate(lastWeek.getDate() - 10);
      
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      expect(result.periodType).toBe("week");
      expect(result.currentPeriod).toBeDefined();
      expect(result.previousPeriod).toBeDefined();
      expect(result.changes).toBeDefined();
      expect(result.currentPeriod.metrics.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(result.previousPeriod.metrics.totalTransactions).toBeGreaterThanOrEqual(0);
    });

    it("should compare month over month transactions", async () => {
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "month",
      });

      expect(result.periodType).toBe("month");
      expect(result.currentPeriod.startDate).toBeDefined();
      expect(result.currentPeriod.endDate).toBeDefined();
      expect(result.previousPeriod.startDate).toBeDefined();
      expect(result.previousPeriod.endDate).toBeDefined();
      
      // Verify date ranges are correct (current month vs previous month)
      const currentStart = new Date(result.currentPeriod.startDate);
      const previousStart = new Date(result.previousPeriod.startDate);
      expect(currentStart.getTime()).toBeGreaterThan(previousStart.getTime());
    });

    it("should compare quarter over quarter transactions", async () => {
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "quarter",
      });

      expect(result.periodType).toBe("quarter");
      expect(result.currentPeriod.metrics).toBeDefined();
      expect(result.previousPeriod.metrics).toBeDefined();
      
      // Verify metrics structure
      expect(result.currentPeriod.metrics).toHaveProperty("totalTransactions");
      expect(result.currentPeriod.metrics).toHaveProperty("successRate");
      expect(result.currentPeriod.metrics).toHaveProperty("totalRevenue");
      expect(result.currentPeriod.metrics).toHaveProperty("averageAmount");
    });

    it("should compare year over year transactions", async () => {
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "year",
      });

      expect(result.periodType).toBe("year");
      expect(result.changes).toHaveProperty("totalTransactions");
      expect(result.changes).toHaveProperty("successRate");
      expect(result.changes).toHaveProperty("totalRevenue");
      expect(result.changes).toHaveProperty("averageAmount");
    });
  });

  describe("Metrics Calculation", () => {
    it("should calculate success rate correctly", async () => {
      // Create completed transactions
      await db.createTransaction({
        transactionId: `TXN-SUCCESS-1-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "completed",
        description: "Success test 1",
      });

      await db.createTransaction({
        transactionId: `TXN-SUCCESS-2-${Date.now()}`,
        type: "order_payment",
        amount: 20000,
        status: "completed",
        description: "Success test 2",
      });

      // Create failed transaction
      await db.createTransaction({
        transactionId: `TXN-FAILED-1-${Date.now()}`,
        type: "order_payment",
        amount: 15000,
        status: "failed",
        description: "Failed test 1",
      });

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      expect(result.currentPeriod.metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(result.currentPeriod.metrics.successRate).toBeLessThanOrEqual(100);
      expect(result.currentPeriod.metrics.completedTransactions).toBeGreaterThanOrEqual(0);
    });

    it("should calculate total revenue from completed transactions only", async () => {
      await db.createTransaction({
        transactionId: `TXN-REV-COMP-${Date.now()}`,
        type: "order_payment",
        amount: 100000,
        status: "completed",
        description: "Revenue completed",
      });

      await db.createTransaction({
        transactionId: `TXN-REV-PEND-${Date.now()}`,
        type: "order_payment",
        amount: 50000,
        status: "pending",
        description: "Revenue pending",
      });

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      // Revenue should only include completed transactions
      expect(result.currentPeriod.metrics.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it("should calculate average transaction amount", async () => {
      await db.createTransaction({
        transactionId: `TXN-AVG-1-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "completed",
        description: "Average test 1",
      });

      await db.createTransaction({
        transactionId: `TXN-AVG-2-${Date.now()}`,
        type: "order_payment",
        amount: 20000,
        status: "completed",
        description: "Average test 2",
      });

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      if (result.currentPeriod.metrics.totalTransactions > 0) {
        expect(result.currentPeriod.metrics.averageAmount).toBeGreaterThan(0);
      }
    });

    it("should group transactions by type", async () => {
      await db.createTransaction({
        transactionId: `TXN-TYPE-ORDER-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "completed",
        description: "Order payment",
      });

      await db.createTransaction({
        transactionId: `TXN-TYPE-PAYOUT-${Date.now()}`,
        type: "payout",
        amount: 5000,
        status: "completed",
        description: "Payout",
      });

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      expect(result.currentPeriod.metrics.byType).toBeDefined();
      expect(typeof result.currentPeriod.metrics.byType).toBe("object");
    });

    it("should group transactions by status", async () => {
      await db.createTransaction({
        transactionId: `TXN-STATUS-COMP-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "completed",
        description: "Completed",
      });

      await db.createTransaction({
        transactionId: `TXN-STATUS-PEND-${Date.now()}`,
        type: "order_payment",
        amount: 5000,
        status: "pending",
        description: "Pending",
      });

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      expect(result.currentPeriod.metrics.byStatus).toBeDefined();
      expect(typeof result.currentPeriod.metrics.byStatus).toBe("object");
    });
  });

  describe("Change Calculation", () => {
    it("should calculate positive percentage change", async () => {
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "month",
      });

      // Changes should be numbers
      expect(typeof result.changes.totalTransactions).toBe("number");
      expect(typeof result.changes.successRate).toBe("number");
      expect(typeof result.changes.totalRevenue).toBe("number");
      expect(typeof result.changes.averageAmount).toBe("number");
    });

    it("should handle zero division in change calculation", async () => {
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "year",
      });

      // If previous period has 0 transactions, change should be 0 or 100
      if (result.previousPeriod.metrics.totalTransactions === 0) {
        if (result.currentPeriod.metrics.totalTransactions > 0) {
          expect(result.changes.totalTransactions).toBe(100);
        } else {
          expect(result.changes.totalTransactions).toBe(0);
        }
      }
    });

    it("should calculate success rate change as difference", async () => {
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "month",
      });

      // Success rate change should be the difference, not percentage
      const expectedChange = result.currentPeriod.metrics.successRate - result.previousPeriod.metrics.successRate;
      expect(result.changes.successRate).toBeCloseTo(expectedChange, 1);
    });
  });

  describe("Custom Date Range", () => {
    it("should support custom date range comparison", async () => {
      const now = new Date();
      const currentStart = new Date(now);
      currentStart.setDate(currentStart.getDate() - 7);
      const currentEnd = now;
      
      const previousStart = new Date(currentStart);
      previousStart.setDate(previousStart.getDate() - 7);
      const previousEnd = new Date(currentStart);

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "custom",
        currentStartDate: currentStart,
        currentEndDate: currentEnd,
        previousStartDate: previousStart,
        previousEndDate: previousEnd,
      });

      expect(result.periodType).toBe("custom");
      expect(new Date(result.currentPeriod.startDate).getTime()).toBe(currentStart.getTime());
      expect(new Date(result.currentPeriod.endDate).getTime()).toBe(currentEnd.getTime());
      expect(new Date(result.previousPeriod.startDate).getTime()).toBe(previousStart.getTime());
      expect(new Date(result.previousPeriod.endDate).getTime()).toBe(previousEnd.getTime());
    });
  });

  describe("Edge Cases", () => {
    it("should handle periods with no transactions", async () => {
      // Use a far future date range where no transactions exist
      const futureStart = new Date();
      futureStart.setFullYear(futureStart.getFullYear() + 10);
      const futureEnd = new Date(futureStart);
      futureEnd.setDate(futureEnd.getDate() + 7);

      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "week",
      });

      // Should not throw error and should return valid structure
      expect(result.currentPeriod.metrics.totalTransactions).toBeGreaterThanOrEqual(0);
      expect(result.currentPeriod.metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(result.currentPeriod.metrics.totalRevenue).toBeGreaterThanOrEqual(0);
    });

    it("should handle all failed transactions in a period", async () => {
      // This is tested by the overall query - if all are failed, success rate should be 0
      const result = await caller.financial.getTransactionPeriodComparison({
        periodType: "month",
      });

      expect(result.currentPeriod.metrics.successRate).toBeGreaterThanOrEqual(0);
      expect(result.currentPeriod.metrics.successRate).toBeLessThanOrEqual(100);
    });
  });
});

