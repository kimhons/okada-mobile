/**
 * Africa's Talking SMS Service
 * Handles SMS sending for Cameroon and other African countries
 */

import { getDb } from "./db";
import { smsLogs } from "../drizzle/schema";

// Africa's Talking credentials from environment
const AT_USERNAME = process.env.AFRICASTALKING_USERNAME || "sandbox";
const AT_API_KEY = process.env.AFRICASTALKING_API_KEY || "";
const AT_SENDER_ID = process.env.AFRICASTALKING_SENDER_ID || "OKADA";

// SMS delivery status types
export type SMSDeliveryStatus = "sent" | "delivered" | "failed" | "pending" | "rejected";

// SMS log entry
export interface SMSLogEntry {
  id?: number;
  recipient: string;
  message: string;
  status: SMSDeliveryStatus;
  messageId?: string;
  cost?: string;
  errorMessage?: string;
  sentAt: Date;
  deliveredAt?: Date;
  orderId?: number;
  notificationType?: string;
}

// SMS send result
export interface SMSSendResult {
  success: boolean;
  messageId?: string;
  cost?: string;
  status: SMSDeliveryStatus;
  errorMessage?: string;
}

// Initialize Africa's Talking SDK
let africastalking: any = null;
let sms: any = null;

function initializeAfricasTalking() {
  if (!AT_API_KEY) {
    console.warn("[SMS] Africa's Talking API key not configured");
    return false;
  }

  try {
    // Dynamic import for Africa's Talking
    const AfricasTalking = require("africastalking")({
      apiKey: AT_API_KEY,
      username: AT_USERNAME,
    });
    africastalking = AfricasTalking;
    sms = AfricasTalking.SMS;
    console.log("[SMS] Africa's Talking SDK initialized successfully");
    return true;
  } catch (error) {
    console.error("[SMS] Failed to initialize Africa's Talking SDK:", error);
    return false;
  }
}

/**
 * Format phone number for Cameroon
 * Cameroon country code: +237
 * Mobile prefixes: 6XX (MTN, Orange, Nexttel)
 */
export function formatCameroonPhoneNumber(phone: string): string {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");
  
  // If starts with +, keep it
  if (cleaned.startsWith("+")) {
    // Already international format
    if (cleaned.startsWith("+237")) {
      return cleaned;
    }
    // Other country code, return as-is
    return cleaned;
  }
  
  // Remove leading zeros
  cleaned = cleaned.replace(/^0+/, "");
  
  // If starts with 237, add +
  if (cleaned.startsWith("237")) {
    return `+${cleaned}`;
  }
  
  // If 9 digits starting with 6, it's a Cameroon mobile number
  if (cleaned.length === 9 && cleaned.startsWith("6")) {
    return `+237${cleaned}`;
  }
  
  // If 8 digits, might be missing the leading 6
  if (cleaned.length === 8) {
    return `+2376${cleaned}`;
  }
  
  // Default: assume Cameroon and add country code
  return `+237${cleaned}`;
}

/**
 * Validate Cameroon phone number
 */
export function isValidCameroonNumber(phone: string): boolean {
  const formatted = formatCameroonPhoneNumber(phone);
  // Cameroon numbers: +237 followed by 9 digits starting with 6
  const cameroonRegex = /^\+237[6][0-9]{8}$/;
  return cameroonRegex.test(formatted);
}

/**
 * SMS Service class
 */
export const SMSService = {
  /**
   * Check if SMS service is configured
   */
  isConfigured(): boolean {
    return !!AT_API_KEY;
  },

  /**
   * Initialize the SMS service
   */
  initialize(): boolean {
    return initializeAfricasTalking();
  },

  /**
   * Send SMS using Africa's Talking
   */
  async send(
    to: string,
    message: string,
    options?: {
      orderId?: number;
      notificationType?: string;
      senderId?: string;
    }
  ): Promise<SMSSendResult> {
    // Format phone number
    const formattedPhone = formatCameroonPhoneNumber(to);
    
    // Validate phone number
    if (!isValidCameroonNumber(formattedPhone)) {
      console.warn(`[SMS] Invalid Cameroon phone number: ${to} -> ${formattedPhone}`);
      // Still try to send, might be a valid number from another country
    }

    // If not configured, log and return mock success (for development)
    if (!this.isConfigured()) {
      console.log(`[SMS] (Mock) Sending to ${formattedPhone}: ${message.substring(0, 50)}...`);
      await this.logSMS({
        recipient: formattedPhone,
        message,
        status: "sent",
        messageId: `mock-${Date.now()}`,
        sentAt: new Date(),
        orderId: options?.orderId,
        notificationType: options?.notificationType,
      });
      return {
        success: true,
        messageId: `mock-${Date.now()}`,
        status: "sent",
      };
    }

    // Initialize SDK if needed
    if (!sms) {
      if (!this.initialize()) {
        return {
          success: false,
          status: "failed",
          errorMessage: "SMS service not initialized",
        };
      }
    }

    try {
      // Send SMS via Africa's Talking
      const response = await sms.send({
        to: [formattedPhone],
        message,
        from: options?.senderId || AT_SENDER_ID,
        enqueue: true, // Queue for delivery
      });

      console.log("[SMS] Africa's Talking response:", JSON.stringify(response));

      // Parse response
      const recipients = response.SMSMessageData?.Recipients || [];
      const recipient = recipients[0];

      if (recipient) {
        const result: SMSSendResult = {
          success: recipient.status === "Success",
          messageId: recipient.messageId,
          cost: recipient.cost,
          status: recipient.status === "Success" ? "sent" : "failed",
          errorMessage: recipient.status !== "Success" ? recipient.status : undefined,
        };

        // Log the SMS
        await this.logSMS({
          recipient: formattedPhone,
          message,
          status: result.status,
          messageId: result.messageId,
          cost: result.cost,
          errorMessage: result.errorMessage,
          sentAt: new Date(),
          orderId: options?.orderId,
          notificationType: options?.notificationType,
        });

        return result;
      }

      // No recipient in response
      return {
        success: false,
        status: "failed",
        errorMessage: "No recipient data in response",
      };
    } catch (error: any) {
      console.error("[SMS] Error sending SMS:", error);
      
      // Log failed attempt
      await this.logSMS({
        recipient: formattedPhone,
        message,
        status: "failed",
        errorMessage: error.message || "Unknown error",
        sentAt: new Date(),
        orderId: options?.orderId,
        notificationType: options?.notificationType,
      });

      return {
        success: false,
        status: "failed",
        errorMessage: error.message || "Failed to send SMS",
      };
    }
  },

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulk(
    recipients: string[],
    message: string,
    options?: {
      senderId?: string;
    }
  ): Promise<{ total: number; successful: number; failed: number; results: SMSSendResult[] }> {
    const results: SMSSendResult[] = [];
    let successful = 0;
    let failed = 0;

    // Format all phone numbers
    const formattedRecipients = recipients.map(formatCameroonPhoneNumber);

    // If not configured, mock send
    if (!this.isConfigured()) {
      console.log(`[SMS] (Mock) Bulk sending to ${formattedRecipients.length} recipients`);
      for (const phone of formattedRecipients) {
        results.push({
          success: true,
          messageId: `mock-${Date.now()}-${phone}`,
          status: "sent",
        });
        successful++;
      }
      return { total: recipients.length, successful, failed, results };
    }

    // Initialize SDK if needed
    if (!sms) {
      if (!this.initialize()) {
        return {
          total: recipients.length,
          successful: 0,
          failed: recipients.length,
          results: recipients.map(() => ({
            success: false,
            status: "failed" as SMSDeliveryStatus,
            errorMessage: "SMS service not initialized",
          })),
        };
      }
    }

    try {
      // Send bulk SMS via Africa's Talking
      const response = await sms.send({
        to: formattedRecipients,
        message,
        from: options?.senderId || AT_SENDER_ID,
        enqueue: true,
      });

      console.log("[SMS] Bulk send response:", JSON.stringify(response));

      // Parse response
      const responseRecipients = response.SMSMessageData?.Recipients || [];
      
      for (const recipient of responseRecipients) {
        const result: SMSSendResult = {
          success: recipient.status === "Success",
          messageId: recipient.messageId,
          cost: recipient.cost,
          status: recipient.status === "Success" ? "sent" : "failed",
          errorMessage: recipient.status !== "Success" ? recipient.status : undefined,
        };
        results.push(result);
        
        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      }

      return { total: recipients.length, successful, failed, results };
    } catch (error: any) {
      console.error("[SMS] Error sending bulk SMS:", error);
      return {
        total: recipients.length,
        successful: 0,
        failed: recipients.length,
        results: recipients.map(() => ({
          success: false,
          status: "failed" as SMSDeliveryStatus,
          errorMessage: error.message || "Failed to send SMS",
        })),
      };
    }
  },

  /**
   * Log SMS to database for tracking
   */
  async logSMS(entry: SMSLogEntry): Promise<void> {
    const db = await getDb();
    if (!db) {
      console.log("[SMS] Database not available, skipping log");
      return;
    }

    try {
      await db.insert(smsLogs).values({
        recipient: entry.recipient,
        message: entry.message,
        status: entry.status,
        messageId: entry.messageId,
        cost: entry.cost,
        errorMessage: entry.errorMessage,
        sentAt: entry.sentAt,
        deliveredAt: entry.deliveredAt,
        orderId: entry.orderId,
        notificationType: entry.notificationType,
      });
    } catch (error) {
      console.error("[SMS] Failed to log SMS:", error);
    }
  },

  /**
   * Get SMS delivery status (if supported by carrier)
   */
  async getDeliveryStatus(messageId: string): Promise<SMSDeliveryStatus | null> {
    // Africa's Talking provides delivery reports via webhooks
    // This method would query the database for logged status
    const db = await getDb();
    if (!db) return null;

    try {
      const result = await db
        .select()
        .from(smsLogs)
        .where(eq(smsLogs.messageId, messageId))
        .limit(1);
      
      if (result.length > 0) {
        return result[0].status as SMSDeliveryStatus;
      }
      return null;
    } catch (error) {
      console.error("[SMS] Failed to get delivery status:", error);
      return null;
    }
  },

  /**
   * Get account balance (for monitoring)
   */
  async getBalance(): Promise<string | null> {
    if (!this.isConfigured() || !africastalking) {
      return null;
    }

    try {
      const application = africastalking.APPLICATION;
      const data = await application.fetchApplicationData();
      return data.UserData?.balance || null;
    } catch (error) {
      console.error("[SMS] Failed to get balance:", error);
      return null;
    }
  },
};

// Import eq for database queries
import { eq } from "drizzle-orm";

export default SMSService;
