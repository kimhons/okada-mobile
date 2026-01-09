import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Transaction Features Tests", () => {
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

  describe("Bulk Transaction Operations", () => {
    it("should bulk update transaction status to completed", async () => {
      // Create test transactions
      const tx1 = await db.createTransaction({
        transactionId: `TXN-BULK-1-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "pending",
        description: "Bulk test 1",
      });

      const tx2 = await db.createTransaction({
        transactionId: `TXN-BULK-2-${Date.now()}`,
        type: "order_payment",
        amount: 20000,
        status: "pending",
        description: "Bulk test 2",
      });

      const result = await caller.financial.bulkUpdateTransactionStatus({
        ids: [tx1.id, tx2.id],
        status: "completed",
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);

      // Verify transactions were updated
      const updated1 = await db.getTransactionById(tx1.id);
      const updated2 = await db.getTransactionById(tx2.id);
      expect(updated1?.status).toBe("completed");
      expect(updated2?.status).toBe("completed");
    });

    it("should bulk create refund transactions", async () => {
      // Create test transactions
      const tx1 = await db.createTransaction({
        transactionId: `TXN-REFUND-1-${Date.now()}`,
        type: "order_payment",
        amount: 15000,
        status: "completed",
        description: "Refund test 1",
      });

      const tx2 = await db.createTransaction({
        transactionId: `TXN-REFUND-2-${Date.now()}`,
        type: "order_payment",
        amount: 25000,
        status: "completed",
        description: "Refund test 2",
      });

      const result = await caller.financial.bulkRefundTransactions({
        ids: [tx1.id, tx2.id],
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);

      // Verify refund transactions were created
      const allTransactions = await db.getAllTransactions({});
      const refunds = allTransactions.filter(t => t.type === "refund");
      expect(refunds.length).toBeGreaterThanOrEqual(2);
    });

    it("should bulk reconcile transactions", async () => {
      // Create test transactions
      const tx1 = await db.createTransaction({
        transactionId: `TXN-RECON-1-${Date.now()}`,
        type: "order_payment",
        amount: 30000,
        status: "pending",
        description: "Reconcile test 1",
      });

      const tx2 = await db.createTransaction({
        transactionId: `TXN-RECON-2-${Date.now()}`,
        type: "order_payment",
        amount: 40000,
        status: "pending",
        description: "Reconcile test 2",
      });

      const result = await caller.financial.bulkReconcileTransactions({
        ids: [tx1.id, tx2.id],
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(2);

      // Verify transactions were reconciled (marked as completed)
      const updated1 = await db.getTransactionById(tx1.id);
      const updated2 = await db.getTransactionById(tx2.id);
      expect(updated1?.status).toBe("completed");
      expect(updated2?.status).toBe("completed");
    });

    it("should handle empty bulk operations", async () => {
      const result = await caller.financial.bulkUpdateTransactionStatus({
        ids: [],
        status: "completed",
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(0);
    });

    it("should log activity for bulk operations", async () => {
      const tx = await db.createTransaction({
        transactionId: `TXN-LOG-${Date.now()}`,
        type: "order_payment",
        amount: 5000,
        status: "pending",
        description: "Activity log test",
      });

      await caller.financial.bulkUpdateTransactionStatus({
        ids: [tx.id],
        status: "completed",
      });

      const logs = await db.getActivityLogs({});
      const bulkLog = logs.find(log => log.action === "bulk_update_transaction_status");
      expect(bulkLog).toBeDefined();
      expect(bulkLog?.adminId).toBe(testUser.id);
    });
  });

  describe("Transaction Receipt Generation", () => {
    it("should generate receipt HTML with transaction details", async () => {
      const tx = await db.createTransaction({
        transactionId: `TXN-RECEIPT-${Date.now()}`,
        type: "order_payment",
        amount: 50000,
        status: "completed",
        description: "Receipt test transaction",
        userId: 123,
        orderId: 456,
      });

      const result = await caller.financial.generateTransactionReceipt({
        transactionId: tx.id,
      });

      expect(result.html).toContain("OKADA Admin");
      expect(result.html).toContain(tx.transactionId);
      expect(result.html).toContain("ORDER PAYMENT");
      expect(result.html).toContain("500 FCFA"); // 50000 / 100
      expect(result.html).toContain("User ID");
      expect(result.html).toContain("123");
      expect(result.html).toContain("Order ID");
      expect(result.html).toContain("456");
      expect(result.transactionId).toBe(tx.transactionId);
    });

    it("should include QR code in receipt", async () => {
      const tx = await db.createTransaction({
        transactionId: `TXN-QR-${Date.now()}`,
        type: "payout",
        amount: 100000,
        status: "completed",
        description: "QR code test",
      });

      const result = await caller.financial.generateTransactionReceipt({
        transactionId: tx.id,
      });

      // Check for QR code data URL
      expect(result.html).toContain("data:image/png;base64");
      expect(result.html).toContain("Scan to verify transaction");
    });

    it("should handle different transaction statuses in receipt", async () => {
      const txCompleted = await db.createTransaction({
        transactionId: `TXN-STATUS-COMP-${Date.now()}`,
        type: "commission",
        amount: 5000,
        status: "completed",
        description: "Completed status test",
      });

      const resultCompleted = await caller.financial.generateTransactionReceipt({
        transactionId: txCompleted.id,
      });

      expect(resultCompleted.html).toContain("status-completed");
      expect(resultCompleted.html).toContain("COMPLETED");

      const txPending = await db.createTransaction({
        transactionId: `TXN-STATUS-PEND-${Date.now()}`,
        type: "fee",
        amount: 3000,
        status: "pending",
        description: "Pending status test",
      });

      const resultPending = await caller.financial.generateTransactionReceipt({
        transactionId: txPending.id,
      });

      expect(resultPending.html).toContain("status-pending");
      expect(resultPending.html).toContain("PENDING");
    });

    it("should throw error for non-existent transaction", async () => {
      await expect(
        caller.financial.generateTransactionReceipt({
          transactionId: 999999,
        })
      ).rejects.toThrow("Transaction not found");
    });

    it("should log activity for receipt generation", async () => {
      const tx = await db.createTransaction({
        transactionId: `TXN-RECEIPT-LOG-${Date.now()}`,
        type: "refund",
        amount: 20000,
        status: "completed",
        description: "Receipt activity log test",
      });

      await caller.financial.generateTransactionReceipt({
        transactionId: tx.id,
      });

      const logs = await db.getActivityLogs({});
      const receiptLog = logs.find(log => 
        log.action === "generate_receipt" && log.entityId === tx.id
      );
      expect(receiptLog).toBeDefined();
      expect(receiptLog?.adminId).toBe(testUser.id);
    });
  });

  describe("Transaction Analytics", () => {
    it("should calculate correct success rate", async () => {
      // Create mix of completed and failed transactions
      await db.createTransaction({
        transactionId: `TXN-ANALYTICS-1-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "completed",
        description: "Analytics test 1",
      });

      await db.createTransaction({
        transactionId: `TXN-ANALYTICS-2-${Date.now()}`,
        type: "order_payment",
        amount: 20000,
        status: "completed",
        description: "Analytics test 2",
      });

      await db.createTransaction({
        transactionId: `TXN-ANALYTICS-3-${Date.now()}`,
        type: "order_payment",
        amount: 15000,
        status: "failed",
        description: "Analytics test 3",
      });

      const transactions = await caller.financial.getAllTransactions({});
      const completed = transactions.filter(t => t.status === "completed");
      const successRate = (completed.length / transactions.length) * 100;

      expect(successRate).toBeGreaterThan(0);
      expect(successRate).toBeLessThanOrEqual(100);
    });

    it("should group transactions by type", async () => {
      await db.createTransaction({
        transactionId: `TXN-TYPE-1-${Date.now()}`,
        type: "order_payment",
        amount: 10000,
        status: "completed",
        description: "Type test 1",
      });

      await db.createTransaction({
        transactionId: `TXN-TYPE-2-${Date.now()}`,
        type: "payout",
        amount: 20000,
        status: "completed",
        description: "Type test 2",
      });

      await db.createTransaction({
        transactionId: `TXN-TYPE-3-${Date.now()}`,
        type: "order_payment",
        amount: 15000,
        status: "completed",
        description: "Type test 3",
      });

      const transactions = await caller.financial.getAllTransactions({});
      const byType = transactions.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      expect(byType["order_payment"]).toBeGreaterThanOrEqual(2);
      expect(byType["payout"]).toBeGreaterThanOrEqual(1);
    });

    it("should calculate revenue by type", async () => {
      await db.createTransaction({
        transactionId: `TXN-REV-1-${Date.now()}`,
        type: "order_payment",
        amount: 50000,
        status: "completed",
        description: "Revenue test 1",
      });

      await db.createTransaction({
        transactionId: `TXN-REV-2-${Date.now()}`,
        type: "commission",
        amount: 10000,
        status: "completed",
        description: "Revenue test 2",
      });

      const transactions = await caller.financial.getAllTransactions({});
      const completed = transactions.filter(t => t.status === "completed");
      const revenueByType = completed.reduce((acc, t) => {
        acc[t.type] = (acc[t.type] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      expect(revenueByType["order_payment"]).toBeGreaterThan(0);
      expect(revenueByType["commission"]).toBeGreaterThan(0);
    });

    it("should filter transactions by date range", async () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);

      await db.createTransaction({
        transactionId: `TXN-DATE-${Date.now()}`,
        type: "order_payment",
        amount: 25000,
        status: "completed",
        description: "Date filter test",
      });

      const transactions = await caller.financial.getAllTransactions({
        startDate: yesterday,
        endDate: tomorrow,
      });

      expect(transactions.length).toBeGreaterThan(0);
      transactions.forEach(tx => {
        const txDate = new Date(tx.createdAt);
        expect(txDate.getTime()).toBeGreaterThanOrEqual(yesterday.getTime());
        expect(txDate.getTime()).toBeLessThanOrEqual(tomorrow.getTime());
      });
    });
  });
});

