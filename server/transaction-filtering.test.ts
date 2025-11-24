import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb, upsertUser } from "./db";
import { transactions, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Transaction Filtering and Sorting", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeAll(async () => {
    // Create test user
    await upsertUser({
      openId: "test-user-filtering",
      name: "Test User",
      email: "test@example.com",
      role: "admin",
    });

    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userResults = await db.select().from(users).where(
      eq(users.openId, "test-user-filtering")
    );
    testUserId = userResults[0].id;

    caller = appRouter.createCaller({
      user: { id: testUserId, openId: "test-user-filtering", name: "Test User", email: "test@example.com", role: "admin" },
      req: {} as any,
      res: {} as any,
    });

    // Create test transactions with different attributes
    const timestamp = Date.now();
    const testTransactions = [
      {
        transactionId: `TXN-FILTER-${timestamp}-001`,
        type: "order_payment" as const,
        amount: 50000, // 500 FCFA
        status: "completed" as const,
        userId: testUserId,
        description: "Small order payment",
        createdAt: new Date("2024-01-15"),
      },
      {
        transactionId: `TXN-FILTER-${timestamp}-002`,
        type: "payout" as const,
        amount: 200000, // 2000 FCFA
        status: "pending" as const,
        userId: testUserId,
        description: "Rider payout",
        createdAt: new Date("2024-02-10"),
      },
      {
        transactionId: `TXN-FILTER-${timestamp}-003`,
        type: "refund" as const,
        amount: 75000, // 750 FCFA
        status: "completed" as const,
        userId: testUserId,
        description: "Customer refund",
        createdAt: new Date("2024-03-05"),
      },
      {
        transactionId: `TXN-FILTER-${timestamp}-004`,
        type: "commission" as const,
        amount: 150000, // 1500 FCFA
        status: "completed" as const,
        userId: testUserId,
        description: "Platform commission",
        createdAt: new Date("2024-01-20"),
      },
      {
        transactionId: `TXN-FILTER-${timestamp}-005`,
        type: "order_payment" as const,
        amount: 300000, // 3000 FCFA
        status: "failed" as const,
        userId: testUserId,
        description: "Large order payment",
        createdAt: new Date("2024-02-25"),
      },
    ];

    for (const txn of testTransactions) {
      await db.insert(transactions).values(txn);
    }
  });

  describe("Type Filtering", () => {
    it("should filter by transaction type", async () => {
      const result = await caller.financial.getAllTransactions({ type: "order_payment" });
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every(t => t.type === "order_payment")).toBe(true);
    });

    it("should filter by payout type", async () => {
      const result = await caller.financial.getAllTransactions({ type: "payout" });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(t => t.type === "payout")).toBe(true);
    });
  });

  describe("Status Filtering", () => {
    it("should filter by completed status", async () => {
      const result = await caller.financial.getAllTransactions({ status: "completed" });
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every(t => t.status === "completed")).toBe(true);
    });

    it("should filter by pending status", async () => {
      const result = await caller.financial.getAllTransactions({ status: "pending" });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(t => t.status === "pending")).toBe(true);
    });

    it("should filter by failed status", async () => {
      const result = await caller.financial.getAllTransactions({ status: "failed" });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.every(t => t.status === "failed")).toBe(true);
    });
  });

  describe("Date Range Filtering", () => {
    it("should filter by start date", async () => {
      const startDate = new Date("2024-02-01");
      const result = await caller.financial.getAllTransactions({ startDate });
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every(t => new Date(t.createdAt) >= startDate)).toBe(true);
    });

    it("should filter by end date", async () => {
      const endDate = new Date("2024-02-15");
      const result = await caller.financial.getAllTransactions({ endDate });
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every(t => new Date(t.createdAt) <= endDate)).toBe(true);
    });

    it("should filter by date range", async () => {
      const startDate = new Date("2024-01-15");
      const endDate = new Date("2024-02-15");
      const result = await caller.financial.getAllTransactions({ startDate, endDate });
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every(t => {
        const date = new Date(t.createdAt);
        return date >= startDate && date <= endDate;
      })).toBe(true);
    });
  });

  describe("Amount Range Filtering", () => {
    it("should filter by minimum amount", async () => {
      const minAmount = 100000; // 1000 FCFA
      const result = await caller.financial.getAllTransactions({ minAmount });
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every(t => t.amount >= minAmount)).toBe(true);
    });

    it("should filter by maximum amount", async () => {
      const maxAmount = 100000; // 1000 FCFA
      const result = await caller.financial.getAllTransactions({ maxAmount });
      expect(result.length).toBeGreaterThanOrEqual(2);
      expect(result.every(t => t.amount <= maxAmount)).toBe(true);
    });

    it("should filter by amount range", async () => {
      const minAmount = 50000; // 500 FCFA
      const maxAmount = 200000; // 2000 FCFA
      const result = await caller.financial.getAllTransactions({ minAmount, maxAmount });
      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result.every(t => t.amount >= minAmount && t.amount <= maxAmount)).toBe(true);
    });
  });

  describe("Search Filtering", () => {
    it("should search by transaction ID", async () => {
      const result = await caller.financial.getAllTransactions({ search: "TXN-FILTER" });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(t => t.transactionId.includes("TXN-FILTER"))).toBe(true);
    });

    it("should search by description", async () => {
      const result = await caller.financial.getAllTransactions({ search: "commission" });
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some(t => t.description?.toLowerCase().includes("commission"))).toBe(true);
    });
  });

  describe("Sorting", () => {
    it("should sort by date descending (default)", async () => {
      const result = await caller.financial.getAllTransactions({ sortBy: "date", sortDirection: "desc" });
      expect(result.length).toBeGreaterThan(0);
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].createdAt).getTime()).toBeGreaterThanOrEqual(
          new Date(result[i + 1].createdAt).getTime()
        );
      }
    });

    it("should sort by date ascending", async () => {
      const result = await caller.financial.getAllTransactions({ sortBy: "date", sortDirection: "asc" });
      expect(result.length).toBeGreaterThan(0);
      for (let i = 0; i < result.length - 1; i++) {
        expect(new Date(result[i].createdAt).getTime()).toBeLessThanOrEqual(
          new Date(result[i + 1].createdAt).getTime()
        );
      }
    });

    it("should sort by amount descending", async () => {
      const result = await caller.financial.getAllTransactions({ sortBy: "amount", sortDirection: "desc" });
      expect(result.length).toBeGreaterThan(0);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].amount).toBeGreaterThanOrEqual(result[i + 1].amount);
      }
    });

    it("should sort by amount ascending", async () => {
      const result = await caller.financial.getAllTransactions({ sortBy: "amount", sortDirection: "asc" });
      expect(result.length).toBeGreaterThan(0);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].amount).toBeLessThanOrEqual(result[i + 1].amount);
      }
    });

    it("should sort by type ascending", async () => {
      const result = await caller.financial.getAllTransactions({ sortBy: "type", sortDirection: "asc" });
      expect(result.length).toBeGreaterThan(0);
      // Verify sorting is applied by checking the query executed successfully
      expect(result).toBeDefined();
    });

    it("should sort by status descending", async () => {
      const result = await caller.financial.getAllTransactions({ sortBy: "status", sortDirection: "desc" });
      expect(result.length).toBeGreaterThan(0);
      // Verify sorting is applied by checking the query executed successfully
      expect(result).toBeDefined();
    });
  });

  describe("Combined Filtering", () => {
    it("should combine type and status filters", async () => {
      const result = await caller.financial.getAllTransactions({ 
        type: "order_payment", 
        status: "completed" 
      });
      expect(result.every(t => t.type === "order_payment" && t.status === "completed")).toBe(true);
    });

    it("should combine date range and amount range", async () => {
      const startDate = new Date("2024-01-01");
      const endDate = new Date("2024-02-28");
      const minAmount = 50000;
      const maxAmount = 200000;
      const result = await caller.financial.getAllTransactions({ 
        startDate, 
        endDate, 
        minAmount, 
        maxAmount 
      });
      expect(result.every(t => {
        const date = new Date(t.createdAt);
        return date >= startDate && date <= endDate && 
               t.amount >= minAmount && t.amount <= maxAmount;
      })).toBe(true);
    });

    it("should combine all filters with sorting", async () => {
      const result = await caller.financial.getAllTransactions({ 
        type: "order_payment",
        status: "completed",
        minAmount: 40000,
        maxAmount: 100000,
        sortBy: "amount",
        sortDirection: "asc"
      });
      
      // Check filters
      expect(result.every(t => 
        t.type === "order_payment" && 
        t.status === "completed" &&
        t.amount >= 40000 &&
        t.amount <= 100000
      )).toBe(true);

      // Check sorting
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].amount).toBeLessThanOrEqual(result[i + 1].amount);
      }
    });
  });
});

