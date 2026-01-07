import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
}));

// Import after mocking
import { OrderNotificationService } from "./orderNotificationService";

describe("OrderNotificationService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getNotificationType", () => {
    it("should return correct notification type for confirmed status", () => {
      const result = OrderNotificationService.getNotificationType("confirmed");
      expect(result).toBe("order_confirmed");
    });

    it("should return correct notification type for rider_assigned status", () => {
      const result = OrderNotificationService.getNotificationType("rider_assigned");
      expect(result).toBe("rider_assigned");
    });

    it("should return correct notification type for in_transit status", () => {
      const result = OrderNotificationService.getNotificationType("in_transit");
      expect(result).toBe("order_in_transit");
    });

    it("should return correct notification type for delivered status", () => {
      const result = OrderNotificationService.getNotificationType("delivered");
      expect(result).toBe("order_delivered");
    });

    it("should return correct notification type for cancelled status", () => {
      const result = OrderNotificationService.getNotificationType("cancelled");
      expect(result).toBe("order_cancelled");
    });

    it("should return correct notification type for quality_verification status", () => {
      const result = OrderNotificationService.getNotificationType("quality_verification");
      expect(result).toBe("quality_verification_required");
    });

    it("should return default notification type for unknown status", () => {
      const result = OrderNotificationService.getNotificationType("unknown_status");
      expect(result).toBe("order_confirmed");
    });
  });

  describe("getNotificationContent", () => {
    const mockVariables = {
      orderNumber: "ORD-12345",
      customerName: "John Doe",
      riderName: "Rider A",
      deliveryAddress: "123 Main St, Douala",
      total: "5,000 FCFA",
      estimatedTime: "14:30",
      trackingLink: "https://okada.cm/track/ORD-12345",
      supportPhone: "+237 6XX XXX XXX",
      supportEmail: "support@okada.cm",
    };

    it("should return correct content for order_confirmed", () => {
      const result = OrderNotificationService.getNotificationContent(
        "order_confirmed",
        mockVariables
      );

      expect(result.smsMessage).toContain("ORD-12345");
      expect(result.smsMessage).toContain("confirmed");
      expect(result.emailSubject).toContain("Order Confirmed");
      expect(result.emailBody).toContain("John Doe");
    });

    it("should return correct content for rider_assigned", () => {
      const result = OrderNotificationService.getNotificationContent(
        "rider_assigned",
        mockVariables
      );

      expect(result.smsMessage).toContain("Rider A");
      expect(result.emailSubject).toContain("Rider Assigned");
      expect(result.emailBody).toContain("Rider A");
    });

    it("should return correct content for order_in_transit", () => {
      const result = OrderNotificationService.getNotificationContent(
        "order_in_transit",
        mockVariables
      );

      expect(result.smsMessage).toContain("on the way");
      expect(result.emailSubject).toContain("On The Way");
      expect(result.emailBody).toContain("in transit");
    });

    it("should return correct content for order_delivered", () => {
      const result = OrderNotificationService.getNotificationContent(
        "order_delivered",
        mockVariables
      );

      expect(result.smsMessage).toContain("delivered");
      expect(result.emailSubject).toContain("Delivered");
      expect(result.emailBody).toContain("successfully delivered");
    });

    it("should return correct content for order_cancelled", () => {
      const result = OrderNotificationService.getNotificationContent(
        "order_cancelled",
        mockVariables
      );

      expect(result.smsMessage).toContain("cancelled");
      expect(result.emailSubject).toContain("Cancelled");
      expect(result.emailBody).toContain("cancelled");
    });

    it("should include tracking link in email body", () => {
      const result = OrderNotificationService.getNotificationContent(
        "order_confirmed",
        mockVariables
      );

      expect(result.emailBody).toContain(mockVariables.trackingLink);
    });

    it("should include support contact in relevant notifications", () => {
      const result = OrderNotificationService.getNotificationContent(
        "order_delivered",
        mockVariables
      );

      expect(result.emailBody).toContain(mockVariables.supportEmail);
    });
  });

  describe("sendSMS", () => {
    it("should return true for valid SMS message", async () => {
      const result = await OrderNotificationService.sendSMS({
        to: "+237612345678",
        message: "Test message",
      });

      expect(result).toBe(true);
    });
  });

  describe("sendEmail", () => {
    it("should return true for valid email message", async () => {
      const result = await OrderNotificationService.sendEmail({
        to: "test@example.com",
        subject: "Test Subject",
        body: "<p>Test body</p>",
      });

      expect(result).toBe(true);
    });
  });

  describe("sendOrderStatusNotification", () => {
    it("should return false results when database is not available", async () => {
      const result = await OrderNotificationService.sendOrderStatusNotification(
        1,
        "confirmed"
      );

      expect(result).toEqual({ sms: false, email: false, push: false });
    });
  });

  describe("notifyRiderAssignment", () => {
    it("should return false when database is not available", async () => {
      const result = await OrderNotificationService.notifyRiderAssignment(1, 1);

      expect(result).toBe(false);
    });
  });
});
