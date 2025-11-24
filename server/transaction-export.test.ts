import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { users, transactions } from "../drizzle/schema";

describe("Transaction Export Functionality", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;

  beforeAll(async () => {
    // Create test user
    const testUser = {
      openId: `test-export-${Date.now()}`,
      name: "Export Test User",
      email: "export@test.com",
      role: "admin" as const,
    };

    await db.upsertUser(testUser);
    const user = await db.getUser(testUser.openId);
    if (!user) throw new Error("Failed to create test user");
    testUserId = user.id;

    // Create tRPC caller
    caller = appRouter.createCaller({
      user,
      req: {} as any,
      res: {} as any,
    });

    // Create test transactions for export
    const timestamp = Date.now();
    const testTransactions = [
      {
        transactionId: `TXN-EXPORT-${timestamp}-001`,
        type: "order_payment" as const,
        amount: 50000,
        status: "completed" as const,
        userId: testUserId,
        description: "Test order payment",
        createdAt: new Date("2024-01-15"),
      },
      {
        transactionId: `TXN-EXPORT-${timestamp}-002`,
        type: "payout" as const,
        amount: 200000,
        status: "completed" as const,
        userId: testUserId,
        description: "Test payout",
        createdAt: new Date("2024-02-10"),
      },
      {
        transactionId: `TXN-EXPORT-${timestamp}-003`,
        type: "refund" as const,
        amount: 75000,
        status: "pending" as const,
        userId: testUserId,
        description: "Test refund",
        createdAt: new Date("2024-03-05"),
      },
    ];

    const dbInstance = await db.getDb();
    if (!dbInstance) throw new Error("Database not available");

    for (const txn of testTransactions) {
      await dbInstance.insert(transactions).values(txn);
    }
  });

  describe("CSV Export", () => {
    it("should export all transactions to CSV", async () => {
      const result = await caller.financial.exportTransactionsCSV({});
      
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
      
      // Check CSV format
      const lines = result.content.split('\n');
      expect(lines.length).toBeGreaterThan(1); // Header + data rows
      expect(lines[0]).toContain('Transaction ID');
      expect(lines[0]).toContain('Type');
      expect(lines[0]).toContain('Amount');
    });

    it("should export filtered transactions to CSV", async () => {
      const result = await caller.financial.exportTransactionsCSV({
        type: "order_payment",
        status: "completed",
      });
      
      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(1);
      
      // Verify filtered data
      const lines = result.content.split('\n');
      const dataLines = lines.slice(1).filter(line => line.trim());
      dataLines.forEach(line => {
        expect(line).toContain('order_payment');
        expect(line).toContain('completed');
      });
    });

    it("should export transactions within date range to CSV", async () => {
      const result = await caller.financial.exportTransactionsCSV({
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-02-28"),
      });
      
      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it("should export transactions within amount range to CSV", async () => {
      const result = await caller.financial.exportTransactionsCSV({
        minAmount: 50000,
        maxAmount: 100000,
      });
      
      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it("should format amounts correctly in CSV", async () => {
      const result = await caller.financial.exportTransactionsCSV({});
      
      const lines = result.content.split('\n');
      const dataLines = lines.slice(1).filter(line => line.trim());
      
      // Check that amounts are formatted as decimals (e.g., "500.00" for 50000 cents)
      dataLines.forEach(line => {
        const match = line.match(/"([0-9]+\.[0-9]{2})"/);
        if (match) {
          const amount = parseFloat(match[1]);
          expect(amount).toBeGreaterThan(0);
        }
      });
    });
  });

  describe("Excel Export", () => {
    it("should export all transactions to Excel format", async () => {
      const result = await caller.financial.exportTransactionsExcel({});
      
      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.count).toBeGreaterThan(0);
      
      // Check data structure
      if (result.data.length > 0) {
        const firstRow = result.data[0];
        expect(firstRow).toHaveProperty('Transaction ID');
        expect(firstRow).toHaveProperty('Type');
        expect(firstRow).toHaveProperty('Amount (FCFA)');
        expect(firstRow).toHaveProperty('Status');
      }
    });

    it("should export filtered transactions to Excel format", async () => {
      const result = await caller.financial.exportTransactionsExcel({
        type: "payout",
      });
      
      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(1);
      
      // Verify filtered data
      result.data.forEach(row => {
        expect(row['Type']).toBe('payout');
      });
    });

    it("should export transactions with search filter to Excel", async () => {
      const result = await caller.financial.exportTransactionsExcel({
        search: "Test",
      });
      
      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThanOrEqual(1);
    });

    it("should format amounts correctly in Excel", async () => {
      const result = await caller.financial.exportTransactionsExcel({});
      
      result.data.forEach(row => {
        const amount = parseFloat(row['Amount (FCFA)']);
        expect(amount).toBeGreaterThan(0);
        // Check decimal formatting
        expect(row['Amount (FCFA)']).toMatch(/^\d+\.\d{2}$/);
      });
    });
  });

  describe("Export Activity Logging", () => {
    it("should log CSV export activity", async () => {
      const beforeCount = (await db.getActivityLogs({})).length;
      
      await caller.financial.exportTransactionsCSV({});
      
      const afterCount = (await db.getActivityLogs({})).length;
      expect(afterCount).toBeGreaterThan(beforeCount);
      
      const logs = await db.getActivityLogs({});
      const exportLog = logs.find(log => 
        log.action === 'export' && 
        log.entityType === 'transaction' &&
        log.details?.includes('CSV')
      );
      expect(exportLog).toBeDefined();
    });

    it("should log Excel export activity", async () => {
      const beforeCount = (await db.getActivityLogs({})).length;
      
      await caller.financial.exportTransactionsExcel({});
      
      const afterCount = (await db.getActivityLogs({})).length;
      expect(afterCount).toBeGreaterThan(beforeCount);
      
      const logs = await db.getActivityLogs({});
      const exportLog = logs.find(log => 
        log.action === 'export' && 
        log.entityType === 'transaction' &&
        log.details?.includes('Excel')
      );
      expect(exportLog).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle export with no results", async () => {
      const result = await caller.financial.exportTransactionsCSV({
        type: "nonexistent_type",
      });
      
      expect(result).toBeDefined();
      expect(result.count).toBe(0);
      expect(result.content).toContain('Transaction ID'); // Header should still be present
    });

    it("should handle export with empty filters", async () => {
      const result = await caller.financial.exportTransactionsExcel({});
      
      expect(result).toBeDefined();
      expect(result.count).toBeGreaterThan(0);
    });
  });
});

