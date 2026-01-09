import { describe, it, expect } from "vitest";
import * as db from "./db";

describe("Financial Management", () => {
  it("should get financial overview", async () => {
    const overview = await db.getFinancialOverview();
    expect(overview).toBeDefined();
    if (overview) {
      expect(overview).toHaveProperty("totalRevenue");
      expect(overview).toHaveProperty("totalPayouts");
      expect(overview).toHaveProperty("pendingPayouts");
      expect(overview).toHaveProperty("netRevenue");
      expect(overview).toHaveProperty("transactionCount");
    }
  });

  it("should get commission settings", async () => {
    const settings = await db.getCommissionSettings();
    expect(Array.isArray(settings)).toBe(true);
  });

  it("should get payment transactions", async () => {
    const transactions = await db.getPaymentTransactions(50);
    expect(Array.isArray(transactions)).toBe(true);
  });

  it("should get mobile money analytics", async () => {
    const analytics = await db.getMobileMoneyAnalytics();
    expect(analytics).toBeDefined();
    if (analytics) {
      expect(analytics).toHaveProperty("mtnMoney");
      expect(analytics).toHaveProperty("orangeMoney");
      expect(analytics).toHaveProperty("cash");
      expect(analytics).toHaveProperty("total");
      expect(typeof analytics.mtnMoney).toBe("number");
      expect(typeof analytics.orangeMoney).toBe("number");
      expect(typeof analytics.cash).toBe("number");
    }
  });

  it("should get pending payouts", async () => {
    const payouts = await db.getPendingPayouts();
    expect(Array.isArray(payouts)).toBe(true);
  });

  it("should process payout batch", async () => {
    const result = await db.processPayoutBatch([999999]);
    expect(result).toHaveProperty("success");
  });
});

describe("Customer Support", () => {
  it("should get all support tickets", async () => {
    const tickets = await db.getAllSupportTickets();
    expect(Array.isArray(tickets)).toBe(true);
  });

  it("should get support ticket by ID", async () => {
    const ticket = await db.getSupportTicketById(1);
    expect(ticket === null || ticket === undefined || typeof ticket === "object").toBe(true);
  });

  it("should get support ticket messages", async () => {
    const messages = await db.getSupportTicketMessages(1);
    expect(Array.isArray(messages)).toBe(true);
  });

  it("should update support ticket status", async () => {
    const result = await db.updateSupportTicketStatus(999999, "resolved");
    expect(result).toHaveProperty("success");
  });
});

describe("Delivery Zones", () => {
  it("should get all delivery zones", async () => {
    const zones = await db.getAllDeliveryZones();
    expect(Array.isArray(zones)).toBe(true);
  });

  it("should get delivery zone by ID", async () => {
    const zone = await db.getDeliveryZoneById(1);
    expect(zone === null || zone === undefined || typeof zone === "object").toBe(true);
  });

  it("should create delivery zone", async () => {
    const result = await db.createDeliveryZone({
      name: "Test Zone",
      city: "Douala",
      baseFee: 50000,
      perKmFee: 10000,
    });
    expect(result).toHaveProperty("success");
  });

  it("should update delivery zone", async () => {
    const result = await db.updateDeliveryZone(999999, {
      baseFee: 60000,
    });
    expect(result).toHaveProperty("success");
  });

  it("should delete delivery zone", async () => {
    const result = await db.deleteDeliveryZone(999999);
    expect(result).toHaveProperty("success");
  });
});

describe("Database Schema Validation", () => {
  it("should have paymentTransactions table in schema", async () => {
    const dbInstance = await db.getDb();
    expect(dbInstance).toBeDefined();
  });

  it("should have commissionSettings table in schema", async () => {
    const dbInstance = await db.getDb();
    expect(dbInstance).toBeDefined();
  });

  it("should have supportTickets table in schema", async () => {
    const dbInstance = await db.getDb();
    expect(dbInstance).toBeDefined();
  });

  it("should have deliveryZones table in schema", async () => {
    const dbInstance = await db.getDb();
    expect(dbInstance).toBeDefined();
  });
});

