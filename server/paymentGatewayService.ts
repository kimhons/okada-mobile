import { getDb } from "./db";
import { paymentGatewayConfig, paymentGatewaySyncLog, paymentTransactions } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Payment Gateway Service
 * Handles integration with MTN Mobile Money and Orange Money APIs
 * 
 * Note: This is a framework for payment gateway integration.
 * Actual API credentials and endpoints need to be configured per provider.
 */

export interface PaymentGatewayTransaction {
  transactionId: string;
  provider: "mtn_money" | "orange_money";
  amount: number; // in cents
  currency: string;
  status: "pending" | "completed" | "failed";
  phoneNumber: string;
  orderId?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class PaymentGatewayService {
  /**
   * Sync transactions from MTN Mobile Money API
   * This is a placeholder - implement actual MTN Money API integration
   */
  static async syncMTNMoneyTransactions(fromDate: Date, toDate: Date): Promise<PaymentGatewayTransaction[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if MTN Money is configured and active
    const config = await db
      .select()
      .from(paymentGatewayConfig)
      .where(eq(paymentGatewayConfig.provider, "mtn_money"))
      .limit(1);

    if (!config[0] || !config[0].isActive) {
      throw new Error("MTN Money gateway not configured or inactive");
    }

    // TODO: Implement actual MTN Money API call
    // Example: const response = await fetch(`${MTN_API_URL}/transactions`, {
    //   headers: { 'Authorization': `Bearer ${config[0].apiKey}` },
    //   ...
    // });

    // For now, return mock data
    const mockTransactions: PaymentGatewayTransaction[] = [];
    
    // Log sync attempt
    await db.insert(paymentGatewaySyncLog).values({
      provider: "mtn_money",
      syncType: "manual",
      status: "success",
      transactionsSynced: mockTransactions.length,
      syncedAt: new Date(),
    });

    return mockTransactions;
  }

  /**
   * Sync transactions from Orange Money API
   * This is a placeholder - implement actual Orange Money API integration
   */
  static async syncOrangeMoneyTransactions(fromDate: Date, toDate: Date): Promise<PaymentGatewayTransaction[]> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Check if Orange Money is configured and active
    const config = await db
      .select()
      .from(paymentGatewayConfig)
      .where(eq(paymentGatewayConfig.provider, "orange_money"))
      .limit(1);

    if (!config[0] || !config[0].isActive) {
      throw new Error("Orange Money gateway not configured or inactive");
    }

    // TODO: Implement actual Orange Money API call
    // Example: const response = await fetch(`${ORANGE_API_URL}/transactions`, {
    //   headers: { 'X-API-Key': config[0].apiKey },
    //   ...
    // });

    // For now, return mock data
    const mockTransactions: PaymentGatewayTransaction[] = [];
    
    // Log sync attempt
    await db.insert(paymentGatewaySyncLog).values({
      provider: "orange_money",
      syncType: "manual",
      status: "success",
      transactionsSynced: mockTransactions.length,
      syncedAt: new Date(),
    });

    return mockTransactions;
  }

  /**
   * Save synced transactions to database
   */
  static async saveTransactions(transactions: PaymentGatewayTransaction[]): Promise<void> {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    for (const tx of transactions) {
      // Skip transactions without orderId since it's required
      if (!tx.orderId) {
        console.warn(`Skipping transaction ${tx.transactionId} - no orderId`);
        continue;
      }
      
      await db.insert(paymentTransactions).values({
        orderId: parseInt(tx.orderId),
        transactionId: tx.transactionId,
        provider: tx.provider,
        amount: tx.amount,
        status: tx.status,
        phoneNumber: tx.phoneNumber,
        createdAt: tx.timestamp,
        updatedAt: tx.timestamp,
      });
    }
  }

  /**
   * Get payment gateway configuration
   */
  static async getConfig(provider: "mtn_money" | "orange_money") {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const config = await db
      .select()
      .from(paymentGatewayConfig)
      .where(eq(paymentGatewayConfig.provider, provider))
      .limit(1);

    return config[0];
  }

  /**
   * Update payment gateway configuration
   */
  static async updateConfig(
    provider: "mtn_money" | "orange_money",
    config: {
      apiKey?: string;
      apiSecret?: string;
      webhookUrl?: string;
      isActive?: boolean;
    }
  ) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const existing = await this.getConfig(provider);

    if (existing) {
      await db
        .update(paymentGatewayConfig)
        .set({ ...config, updatedAt: new Date() })
        .where(eq(paymentGatewayConfig.provider, provider));
    } else {
      await db.insert(paymentGatewayConfig).values({
        provider,
        ...config,
      });
    }
  }

  /**
   * Get sync logs
   */
  static async getSyncLogs(provider?: "mtn_money" | "orange_money", limit = 50) {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    let query = db.select().from(paymentGatewaySyncLog);

    if (provider) {
      query = query.where(eq(paymentGatewaySyncLog.provider, provider)) as any;
    }

    const logs = await query.limit(limit);
    return logs;
  }
}

