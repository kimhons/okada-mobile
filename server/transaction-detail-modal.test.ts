import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import * as db from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Transaction Detail Modal", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;
  let testUserId: number;
  let testTransaction: any;

  beforeEach(async () => {
    // Create test context with admin user
    caller = appRouter.createCaller({
      user: {
        id: 1,
        openId: "test-admin",
        name: "Test Admin",
        email: "admin@test.com",
        role: "admin",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
      req: {} as any,
      res: {} as any,
    });

    // Create test user
    const testUserOpenId = `test-user-${Date.now()}`;
    await db.upsertUser({
      openId: testUserOpenId,
      name: "Test User",
      email: "user@test.com",
      role: "user",
    });
    const database = await db.getDb();
    if (database) {
      const userRecords = await database.select().from(users).where(eq(users.openId, testUserOpenId));
      testUserId = userRecords[0]?.id || 1;
    } else {
      testUserId = 1;
    }

    // Create test transaction
    testTransaction = await caller.financial.createTransaction({
      transactionId: `TXN-${Date.now()}`,
      type: "order_payment",
      amount: 50000,
      status: "completed",
      description: "Test transaction for detail modal",
      userId: testUserId,
      orderId: 123,
      metadata: JSON.stringify({
        paymentMethod: "mobile_money",
        phoneNumber: "+237612345678",
      }),
    });
  });

  it("should retrieve transaction with all metadata", async () => {
    const transactions = await caller.financial.getAllTransactions({});
    const transaction = transactions.find((t) => t.id === testTransaction.id);

    expect(transaction).toBeDefined();
    expect(transaction?.transactionId).toBe(testTransaction.transactionId);
    expect(transaction?.type).toBe("order_payment");
    expect(transaction?.amount).toBe(50000);
    expect(transaction?.status).toBe("completed");
    expect(transaction?.description).toBe("Test transaction for detail modal");
    expect(transaction?.userId).toBe(testUserId);
    expect(transaction?.orderId).toBe(123);
  });

  it("should include metadata in transaction details", async () => {
    const transactions = await caller.financial.getAllTransactions({});
    const transaction = transactions.find((t) => t.id === testTransaction.id);

    expect(transaction?.metadata).toBeDefined();
    const metadata = typeof transaction?.metadata === 'string' 
      ? JSON.parse(transaction.metadata) 
      : transaction?.metadata;
    expect(metadata).toHaveProperty("paymentMethod", "mobile_money");
    expect(metadata).toHaveProperty("phoneNumber", "+237612345678");
  });

  it("should show related entity IDs", async () => {
    const transactions = await caller.financial.getAllTransactions({});
    const transaction = transactions.find((t) => t.id === testTransaction.id);

    expect(transaction?.userId).toBe(testUserId);
    expect(transaction?.orderId).toBe(123);
    expect(transaction?.payoutId).toBeNull();
  });

  it("should include timestamps for audit trail", async () => {
    const transactions = await caller.financial.getAllTransactions({});
    const transaction = transactions.find((t) => t.id === testTransaction.id);

    expect(transaction?.createdAt).toBeDefined();
    expect(transaction?.updatedAt).toBeDefined();
    expect(new Date(transaction!.createdAt)).toBeInstanceOf(Date);
    expect(new Date(transaction!.updatedAt)).toBeInstanceOf(Date);
  });

  it("should handle transactions without metadata", async () => {
    const noMetadataTransaction = await caller.financial.createTransaction({
      transactionId: `TXN-NO-META-${Date.now()}`,
      type: "commission",
      amount: 5000,
      status: "completed",
      description: "Commission without metadata",
    });

    const transactions = await caller.financial.getAllTransactions({});
    const transaction = transactions.find((t) => t.id === noMetadataTransaction.id);

    expect(transaction).toBeDefined();
    expect(transaction?.metadata).toBeNull();
  });

  it("should handle transactions without related entities", async () => {
    const standaloneTransaction = await caller.financial.createTransaction({
      transactionId: `TXN-STANDALONE-${Date.now()}`,
      type: "adjustment",
      amount: 1000,
      status: "completed",
      description: "Standalone adjustment",
    });

    const transactions = await caller.financial.getAllTransactions({});
    const transaction = transactions.find((t) => t.id === standaloneTransaction.id);

    expect(transaction).toBeDefined();
    expect(transaction?.userId).toBeNull();
    expect(transaction?.orderId).toBeNull();
    expect(transaction?.payoutId).toBeNull();
  });

  it("should show different transaction statuses", async () => {
    const pendingTransaction = await caller.financial.createTransaction({
      transactionId: `TXN-PENDING-${Date.now()}`,
      type: "refund",
      amount: 25000,
      status: "pending",
      description: "Pending refund",
    });

    const failedTransaction = await caller.financial.createTransaction({
      transactionId: `TXN-FAILED-${Date.now()}`,
      type: "payout",
      amount: 75000,
      status: "failed",
      description: "Failed payout",
    });

    const transactions = await caller.financial.getAllTransactions({});
    const pending = transactions.find((t) => t.id === pendingTransaction.id);
    const failed = transactions.find((t) => t.id === failedTransaction.id);

    expect(pending?.status).toBe("pending");
    expect(failed?.status).toBe("failed");
  });

  it("should show all transaction types", async () => {
    const types = ["order_payment", "payout", "refund", "commission", "fee", "adjustment"];
    const createdTransactions = [];

    for (const type of types) {
      const txn = await caller.financial.createTransaction({
        transactionId: `TXN-${type.toUpperCase()}-${Date.now()}`,
        type: type as any,
        amount: 10000,
        status: "completed",
        description: `Test ${type}`,
      });
      createdTransactions.push(txn);
    }

    const transactions = await caller.financial.getAllTransactions({});
    
    for (const created of createdTransactions) {
      const found = transactions.find((t) => t.id === created.id);
      expect(found).toBeDefined();
      expect(types).toContain(found?.type);
    }
  });
});

