import { describe, it, expect, vi } from "vitest";
import {
  formatCameroonPhoneNumber,
  isValidCameroonNumber,
  SMSService,
} from "./smsService";

describe("SMS Service", () => {
  describe("formatCameroonPhoneNumber", () => {
    it("should format a 9-digit Cameroon number starting with 6", () => {
      expect(formatCameroonPhoneNumber("612345678")).toBe("+237612345678");
    });

    it("should handle numbers with leading zero", () => {
      expect(formatCameroonPhoneNumber("0612345678")).toBe("+237612345678");
    });

    it("should handle numbers already in international format", () => {
      expect(formatCameroonPhoneNumber("+237612345678")).toBe("+237612345678");
    });

    it("should handle numbers with 237 prefix without +", () => {
      expect(formatCameroonPhoneNumber("237612345678")).toBe("+237612345678");
    });

    it("should handle numbers with spaces and dashes", () => {
      expect(formatCameroonPhoneNumber("6 12-34-56-78")).toBe("+237612345678");
    });

    it("should handle 8-digit numbers by adding leading 6", () => {
      expect(formatCameroonPhoneNumber("12345678")).toBe("+237612345678");
    });

    it("should preserve other country codes", () => {
      expect(formatCameroonPhoneNumber("+234812345678")).toBe("+234812345678");
    });
  });

  describe("isValidCameroonNumber", () => {
    it("should validate correct Cameroon mobile numbers", () => {
      expect(isValidCameroonNumber("+237612345678")).toBe(true);
      expect(isValidCameroonNumber("612345678")).toBe(true);
      expect(isValidCameroonNumber("0612345678")).toBe(true);
    });

    it("should handle edge cases", () => {
      // The formatter adds leading 6 to 8-digit numbers, making them valid
      // So 61234567 becomes +237661234567 which is valid
      expect(isValidCameroonNumber("61234567")).toBe(true);
      
      // 10 digits starting with 6 - too long for Cameroon
      expect(isValidCameroonNumber("6123456789")).toBe(false);
      
      // Doesn't start with 6 after formatting
      expect(isValidCameroonNumber("512345678")).toBe(false);
    });

    it("should validate MTN Cameroon numbers (65x, 67x)", () => {
      expect(isValidCameroonNumber("650123456")).toBe(true);
      expect(isValidCameroonNumber("670123456")).toBe(true);
    });

    it("should validate Orange Cameroon numbers (69x)", () => {
      expect(isValidCameroonNumber("690123456")).toBe(true);
    });

    it("should validate Nexttel Cameroon numbers (66x)", () => {
      expect(isValidCameroonNumber("660123456")).toBe(true);
    });
  });

  describe("SMSService", () => {
    describe("isConfigured", () => {
      it("should return false when API key is not set", () => {
        // In test environment, API key is not set
        expect(SMSService.isConfigured()).toBe(false);
      });
    });

    describe("send (mock mode)", () => {
      it("should return success in mock mode when not configured", async () => {
        const result = await SMSService.send(
          "+237612345678",
          "Test message"
        );
        
        expect(result.success).toBe(true);
        expect(result.status).toBe("sent");
        expect(result.messageId).toMatch(/^mock-/);
      });

      it("should handle order context in mock mode", async () => {
        const result = await SMSService.send(
          "+237612345678",
          "Your order has been confirmed",
          {
            orderId: 123,
            notificationType: "order_confirmed",
          }
        );
        
        expect(result.success).toBe(true);
        expect(result.status).toBe("sent");
      });
    });

    describe("sendBulk (mock mode)", () => {
      it("should send to multiple recipients in mock mode", async () => {
        const recipients = [
          "+237612345678",
          "+237698765432",
          "+237650000000",
        ];
        
        const result = await SMSService.sendBulk(
          recipients,
          "Bulk test message"
        );
        
        expect(result.total).toBe(3);
        expect(result.successful).toBe(3);
        expect(result.failed).toBe(0);
        expect(result.results.length).toBe(3);
        expect(result.results.every(r => r.success)).toBe(true);
      });
    });

    describe("getBalance", () => {
      it("should return null when not configured", async () => {
        const balance = await SMSService.getBalance();
        expect(balance).toBeNull();
      });
    });
  });
});
