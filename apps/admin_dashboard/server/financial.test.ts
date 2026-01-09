import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Financial Management", () => {
  let testUserId: number;

  beforeAll(async () => {
    // Create a test user for financial operations
    await db.upsertUser({
      openId: `test-financial-${Date.now()}`,
      name: "Financial Test User",
      email: "financial@test.com",
      role: "admin",
    });

    const user = await db.getUser(`test-financial-${Date.now()}`);
    testUserId = user?.id || 1;
  });

  describe("Payouts Management", () => {
    it("should create a payout", async () => {
      const payout = await db.createPayout({
        recipientId: testUserId,
        recipientType: "rider",
        amount: 50000, // 500 FCFA in cents
        paymentMethod: "mobile_money",
        accountDetails: "+237123456789",
        notes: "Test payout",
      });

      expect(payout).toBeDefined();
      expect(payout.recipientId).toBe(testUserId);
      expect(payout.recipientType).toBe("rider");
      expect(payout.amount).toBe(50000);
      expect(payout.status).toBe("pending");
    });

    it("should get all payouts", async () => {
      const payouts = await db.getAllPayouts();
      expect(Array.isArray(payouts)).toBe(true);
      expect(payouts.length).toBeGreaterThan(0);
    });

    it("should filter payouts by status", async () => {
      const pendingPayouts = await db.getAllPayouts({ status: "pending" });
      expect(Array.isArray(pendingPayouts)).toBe(true);
      pendingPayouts.forEach(payout => {
        expect(payout.status).toBe("pending");
      });
    });

    it("should filter payouts by recipient type", async () => {
      const riderPayouts = await db.getAllPayouts({ recipientType: "rider" });
      expect(Array.isArray(riderPayouts)).toBe(true);
      riderPayouts.forEach(payout => {
        expect(payout.recipientType).toBe("rider");
      });
    });

    it("should update payout status", async () => {
      const payout = await db.createPayout({
        recipientId: testUserId,
        recipientType: "seller",
        amount: 75000,
        paymentMethod: "bank_transfer",
      });

      const updated = await db.updatePayout(payout.id, {
        status: "approved",
        approvedAt: new Date(),
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe("approved");
      expect(updated?.approvedAt).toBeDefined();
    });

    it("should get payout by ID", async () => {
      const payout = await db.createPayout({
        recipientId: testUserId,
        recipientType: "rider",
        amount: 60000,
        paymentMethod: "mobile_money",
      });

      const retrieved = await db.getPayoutById(payout.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(payout.id);
      expect(retrieved?.amount).toBe(payout.amount);
    });

    it("should delete a payout", async () => {
      const payout = await db.createPayout({
        recipientId: testUserId,
        recipientType: "rider",
        amount: 40000,
        paymentMethod: "cash",
      });

      await db.deletePayout(payout.id);
      const retrieved = await db.getPayoutById(payout.id);
      expect(retrieved).toBeUndefined();
    });
  });

  describe("Transactions Management", () => {
    it("should create a transaction", async () => {
      const transaction = await db.createTransaction({
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "order_payment",
        amount: 100000, // 1000 FCFA in cents
        status: "completed",
        userId: testUserId,
        description: "Test order payment",
      });

      expect(transaction).toBeDefined();
      expect(transaction.type).toBe("order_payment");
      expect(transaction.amount).toBe(100000);
      expect(transaction.status).toBe("completed");
    });

    it("should get all transactions", async () => {
      const transactions = await db.getAllTransactions();
      expect(Array.isArray(transactions)).toBe(true);
      expect(transactions.length).toBeGreaterThan(0);
    });

    it("should filter transactions by type", async () => {
      const orderPayments = await db.getAllTransactions({ type: "order_payment" });
      expect(Array.isArray(orderPayments)).toBe(true);
      orderPayments.forEach(txn => {
        expect(txn.type).toBe("order_payment");
      });
    });

    it("should filter transactions by status", async () => {
      const completedTransactions = await db.getAllTransactions({ status: "completed" });
      expect(Array.isArray(completedTransactions)).toBe(true);
      completedTransactions.forEach(txn => {
        expect(txn.status).toBe("completed");
      });
    });

    it("should search transactions by transaction ID", async () => {
      const txnId = `TXN-SEARCH-${Date.now()}`;
      await db.createTransaction({
        transactionId: txnId,
        type: "refund",
        amount: 50000,
        status: "completed",
        description: "Test refund",
      });

      const results = await db.getAllTransactions({ search: "SEARCH" });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(txn => txn.transactionId.includes("SEARCH"))).toBe(true);
    });

    it("should update transaction status", async () => {
      const transaction = await db.createTransaction({
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "commission",
        amount: 25000,
        status: "pending",
        description: "Test commission",
      });

      const updated = await db.updateTransaction(transaction.id, {
        status: "completed",
      });

      expect(updated).toBeDefined();
      expect(updated?.status).toBe("completed");
    });

    it("should get transaction by ID", async () => {
      const transaction = await db.createTransaction({
        transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "fee",
        amount: 15000,
        status: "completed",
        description: "Test fee",
      });

      const retrieved = await db.getTransactionById(transaction.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(transaction.id);
      expect(retrieved?.amount).toBe(15000);
    });
  });

  describe("Revenue Analytics", () => {
    it("should create revenue analytics", async () => {
      const analytics = await db.createRevenueAnalytics({
        date: new Date(),
        period: "daily",
        totalRevenue: 500000,
        orderCount: 50,
        averageOrderValue: 10000,
        commissionEarned: 50000,
        payoutsProcessed: 300000,
        netRevenue: 200000,
      });

      expect(analytics).toBeDefined();
      expect(analytics.period).toBe("daily");
      expect(analytics.totalRevenue).toBe(500000);
      expect(analytics.orderCount).toBe(50);
    });

    it("should get all revenue analytics", async () => {
      const analytics = await db.getAllRevenueAnalytics();
      expect(Array.isArray(analytics)).toBe(true);
      expect(analytics.length).toBeGreaterThan(0);
    });

    it("should filter revenue analytics by period", async () => {
      const dailyAnalytics = await db.getAllRevenueAnalytics({ period: "daily" });
      expect(Array.isArray(dailyAnalytics)).toBe(true);
      dailyAnalytics.forEach(item => {
        expect(item.period).toBe("daily");
      });
    });

    it("should filter revenue analytics by date range", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const analytics = await db.getAllRevenueAnalytics({
        startDate,
        endDate,
      });

      expect(Array.isArray(analytics)).toBe(true);
      analytics.forEach(item => {
        const itemDate = new Date(item.date);
        expect(itemDate >= startDate && itemDate <= endDate).toBe(true);
      });
    });

    it("should create weekly revenue analytics", async () => {
      const analytics = await db.createRevenueAnalytics({
        date: new Date(),
        period: "weekly",
        totalRevenue: 3000000,
        orderCount: 300,
        averageOrderValue: 10000,
        commissionEarned: 300000,
        payoutsProcessed: 2000000,
        netRevenue: 1000000,
      });

      expect(analytics).toBeDefined();
      expect(["daily", "weekly", "monthly"]).toContain(analytics.period);
    });

    it("should create monthly revenue analytics", async () => {
      const analytics = await db.createRevenueAnalytics({
        date: new Date(),
        period: "monthly",
        totalRevenue: 12000000,
        orderCount: 1200,
        averageOrderValue: 10000,
        commissionEarned: 1200000,
        payoutsProcessed: 8000000,
        netRevenue: 4000000,
      });

      expect(analytics).toBeDefined();
      expect(["daily", "weekly", "monthly"]).toContain(analytics.period);
    });
  });
});

