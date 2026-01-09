import { describe, it, expect } from "vitest";

describe("SMS Logs", () => {
  describe("Status configuration", () => {
    const STATUS_CONFIG = {
      sent: { label: "Sent", color: "bg-blue-100 text-blue-700" },
      delivered: { label: "Delivered", color: "bg-green-100 text-green-700" },
      failed: { label: "Failed", color: "bg-red-100 text-red-700" },
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
      rejected: { label: "Rejected", color: "bg-orange-100 text-orange-700" },
    };

    it("should have all required status types", () => {
      expect(STATUS_CONFIG).toHaveProperty("sent");
      expect(STATUS_CONFIG).toHaveProperty("delivered");
      expect(STATUS_CONFIG).toHaveProperty("failed");
      expect(STATUS_CONFIG).toHaveProperty("pending");
      expect(STATUS_CONFIG).toHaveProperty("rejected");
    });

    it("should have labels for all statuses", () => {
      Object.values(STATUS_CONFIG).forEach((config) => {
        expect(config.label).toBeDefined();
        expect(config.label.length).toBeGreaterThan(0);
      });
    });

    it("should have color classes for all statuses", () => {
      Object.values(STATUS_CONFIG).forEach((config) => {
        expect(config.color).toBeDefined();
        expect(config.color).toContain("bg-");
        expect(config.color).toContain("text-");
      });
    });
  });

  describe("Message truncation", () => {
    const truncateMessage = (message: string, maxLength: number = 50) => {
      return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
    };

    it("should not truncate short messages", () => {
      const shortMessage = "Hello, your order is ready!";
      expect(truncateMessage(shortMessage)).toBe(shortMessage);
    });

    it("should truncate long messages", () => {
      const longMessage = "This is a very long message that exceeds the maximum length limit and should be truncated with ellipsis at the end.";
      const truncated = truncateMessage(longMessage, 50);
      expect(truncated.length).toBe(53); // 50 + "..."
      expect(truncated.endsWith("...")).toBe(true);
    });

    it("should handle exact length messages", () => {
      const exactMessage = "A".repeat(50);
      expect(truncateMessage(exactMessage, 50)).toBe(exactMessage);
    });

    it("should handle empty messages", () => {
      expect(truncateMessage("")).toBe("");
    });
  });

  describe("Phone number formatting", () => {
    it("should validate Cameroon phone numbers", () => {
      const validNumbers = ["+237612345678", "+237698765432", "237612345678"];
      const isValidCameroonNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        return cleaned.startsWith("237") && cleaned.length === 12;
      };

      validNumbers.forEach((num) => {
        expect(isValidCameroonNumber(num)).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidNumbers = ["123456", "+1234567890", "invalid"];
      const isValidCameroonNumber = (phone: string) => {
        const cleaned = phone.replace(/\D/g, "");
        return cleaned.startsWith("237") && cleaned.length === 12;
      };

      invalidNumbers.forEach((num) => {
        expect(isValidCameroonNumber(num)).toBe(false);
      });
    });
  });

  describe("SMS stats calculation", () => {
    it("should calculate stats correctly", () => {
      const logs = [
        { status: "sent" },
        { status: "sent" },
        { status: "delivered" },
        { status: "delivered" },
        { status: "delivered" },
        { status: "failed" },
        { status: "pending" },
      ];

      const stats = {
        total: logs.length,
        sent: logs.filter((l) => l.status === "sent").length,
        delivered: logs.filter((l) => l.status === "delivered").length,
        failed: logs.filter((l) => l.status === "failed").length,
        pending: logs.filter((l) => l.status === "pending").length,
      };

      expect(stats.total).toBe(7);
      expect(stats.sent).toBe(2);
      expect(stats.delivered).toBe(3);
      expect(stats.failed).toBe(1);
      expect(stats.pending).toBe(1);
    });

    it("should handle empty logs", () => {
      const logs: { status: string }[] = [];
      const stats = {
        total: logs.length,
        sent: logs.filter((l) => l.status === "sent").length,
        delivered: logs.filter((l) => l.status === "delivered").length,
        failed: logs.filter((l) => l.status === "failed").length,
        pending: logs.filter((l) => l.status === "pending").length,
      };

      expect(stats.total).toBe(0);
      expect(stats.sent).toBe(0);
      expect(stats.delivered).toBe(0);
      expect(stats.failed).toBe(0);
      expect(stats.pending).toBe(0);
    });
  });

  describe("Retry eligibility", () => {
    it("should allow retry for failed status", () => {
      const canRetry = (status: string) => status === "failed" || status === "rejected";
      expect(canRetry("failed")).toBe(true);
    });

    it("should allow retry for rejected status", () => {
      const canRetry = (status: string) => status === "failed" || status === "rejected";
      expect(canRetry("rejected")).toBe(true);
    });

    it("should not allow retry for delivered status", () => {
      const canRetry = (status: string) => status === "failed" || status === "rejected";
      expect(canRetry("delivered")).toBe(false);
    });

    it("should not allow retry for pending status", () => {
      const canRetry = (status: string) => status === "failed" || status === "rejected";
      expect(canRetry("pending")).toBe(false);
    });

    it("should not allow retry for sent status", () => {
      const canRetry = (status: string) => status === "failed" || status === "rejected";
      expect(canRetry("sent")).toBe(false);
    });
  });

  describe("Notification type formatting", () => {
    it("should format notification types correctly", () => {
      const formatType = (type: string | null) => 
        type?.replace(/_/g, " ") || "General";

      expect(formatType("order_confirmation")).toBe("order confirmation");
      expect(formatType("delivery_update")).toBe("delivery update");
      expect(formatType("payment_received")).toBe("payment received");
      expect(formatType(null)).toBe("General");
    });
  });
});
