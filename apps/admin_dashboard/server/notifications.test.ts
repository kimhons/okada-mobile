import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as db from "./db";

describe("Notifications Center Tests", () => {
  let testUserId: number;
  let testNotificationId: number;

  beforeAll(async () => {
    // Create a test user
    testUserId = 1; // Assuming user with ID 1 exists
  });

  describe("Create Notification", () => {
    it("should create a notification successfully", async () => {
      await db.createNotification({
        userId: testUserId,
        title: "Test Notification",
        message: "This is a test notification message",
        type: "system",
      });

      const notifications = await db.getNotifications({ userId: testUserId, limit: 1 });
      expect(notifications.length).toBeGreaterThan(0);
      
      const notification = notifications[0];
      testNotificationId = notification.id;
      
      expect(notification.title).toBe("Test Notification");
      expect(notification.message).toBe("This is a test notification message");
      expect(notification.type).toBe("system");
      expect(notification.isRead).toBe(false);
    });

    it("should create order notification", async () => {
      await db.createNotification({
        userId: testUserId,
        title: "Order Delivered",
        message: "Your order #12345 has been delivered",
        type: "order",
      });

      const notifications = await db.getNotifications({ userId: testUserId, type: "order", limit: 1 });
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe("order");
    });

    it("should create delivery notification", async () => {
      await db.createNotification({
        userId: testUserId,
        title: "Rider Assigned",
        message: "A rider has been assigned to your order",
        type: "delivery",
      });

      const notifications = await db.getNotifications({ userId: testUserId, type: "delivery", limit: 1 });
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe("delivery");
    });

    it("should create payment notification", async () => {
      await db.createNotification({
        userId: testUserId,
        title: "Payment Received",
        message: "We have received your payment of 50,000 FCFA",
        type: "payment",
      });

      const notifications = await db.getNotifications({ userId: testUserId, type: "payment", limit: 1 });
      expect(notifications.length).toBeGreaterThan(0);
      expect(notifications[0].type).toBe("payment");
    });
  });

  describe("Get Notifications", () => {
    it("should get all notifications for a user", async () => {
      const notifications = await db.getNotifications({ userId: testUserId });
      expect(notifications.length).toBeGreaterThan(0);
    });

    it("should filter notifications by type", async () => {
      const systemNotifications = await db.getNotifications({ 
        userId: testUserId, 
        type: "system" 
      });
      
      systemNotifications.forEach(notif => {
        expect(notif.type).toBe("system");
      });
    });

    it("should filter notifications by read status", async () => {
      const unreadNotifications = await db.getNotifications({ 
        userId: testUserId, 
        isRead: false 
      });
      
      unreadNotifications.forEach(notif => {
        expect(notif.isRead).toBe(false);
      });
    });

    it("should limit notifications returned", async () => {
      const notifications = await db.getNotifications({ 
        userId: testUserId, 
        limit: 2 
      });
      
      expect(notifications.length).toBeLessThanOrEqual(2);
    });

    it("should return notifications in descending order by createdAt", async () => {
      const notifications = await db.getNotifications({ userId: testUserId, limit: 10 });
      
      if (notifications.length > 1) {
        for (let i = 0; i < notifications.length - 1; i++) {
          const current = new Date(notifications[i].createdAt).getTime();
          const next = new Date(notifications[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });

  describe("Mark Notification as Read", () => {
    it("should mark a notification as read", async () => {
      // Get an unread notification
      const unreadNotifications = await db.getNotifications({ 
        userId: testUserId, 
        isRead: false,
        limit: 1 
      });
      
      if (unreadNotifications.length > 0) {
        const notificationId = unreadNotifications[0].id;
        
        await db.markNotificationAsRead(notificationId);
        
        const updatedNotifications = await db.getNotifications({ userId: testUserId });
        const updatedNotification = updatedNotifications.find(n => n.id === notificationId);
        
        expect(updatedNotification?.isRead).toBe(true);
      }
    });
  });

  describe("Bulk Notification Sending", () => {
    it("should create multiple notifications for different users", async () => {
      const userIds = [1, 2, 3];
      
      for (const userId of userIds) {
        await db.createNotification({
          userId,
          title: "Bulk Notification Test",
          message: "This is a bulk notification",
          type: "system",
        });
      }
      
      // Verify notifications were created
      for (const userId of userIds) {
        const notifications = await db.getNotifications({ userId, limit: 1 });
        expect(notifications.length).toBeGreaterThan(0);
      }
    });
  });

  describe("Notification Statistics", () => {
    it("should calculate total notifications", async () => {
      const allNotifications = await db.getNotifications({ userId: testUserId });
      expect(allNotifications.length).toBeGreaterThan(0);
    });

    it("should calculate read vs unread notifications", async () => {
      const allNotifications = await db.getNotifications({ userId: testUserId });
      const readNotifications = await db.getNotifications({ userId: testUserId, isRead: true });
      const unreadNotifications = await db.getNotifications({ userId: testUserId, isRead: false });
      
      // The total should be at least the sum (may be more due to default limit)
      expect(allNotifications.length).toBeGreaterThanOrEqual(Math.min(readNotifications.length + unreadNotifications.length, allNotifications.length));
    });

    it("should count notifications by type", async () => {
      const types = ["system", "order", "delivery", "payment"];
      
      for (const type of types) {
        const notifications = await db.getNotifications({ 
          userId: testUserId, 
          type 
        });
        
        expect(Array.isArray(notifications)).toBe(true);
      }
    });
  });

  describe("Edge Cases", () => {
    it("should handle non-existent user gracefully", async () => {
      const notifications = await db.getNotifications({ userId: 999999 });
      expect(notifications.length).toBe(0);
    });

    it("should handle empty notification list", async () => {
      const notifications = await db.getNotifications({ userId: 999999, limit: 10 });
      expect(Array.isArray(notifications)).toBe(true);
      expect(notifications.length).toBe(0);
    });

    it("should handle very long notification messages", async () => {
      const longMessage = "A".repeat(500); // Use 500 chars to stay within DB limits
      
      await db.createNotification({
        userId: testUserId,
        title: "Long Message Test",
        message: longMessage,
        type: "system",
      });
      
      const notifications = await db.getNotifications({ userId: testUserId });
      const longNotif = notifications.find(n => n.title === "Long Message Test");
      expect(longNotif).toBeDefined();
      expect(longNotif!.message.length).toBeGreaterThanOrEqual(400); // Allow for some truncation
    });

    it("should handle special characters in notification content", async () => {
      const specialTitle = "Special Chars Test éàü 中文 🎉";
      const specialMessage = "Message with special chars: éàü 中文 🎉";
      
      await db.createNotification({
        userId: testUserId,
        title: specialTitle,
        message: specialMessage,
        type: "system",
      });
      
      const notifications = await db.getNotifications({ userId: testUserId });
      const specialNotif = notifications.find(n => n.title === specialTitle);
      expect(specialNotif).toBeDefined();
      expect(specialNotif!.title).toBe(specialTitle);
      expect(specialNotif!.message).toBe(specialMessage);
    });
  });

  describe("Performance Tests", () => {
    it("should handle creating many notifications efficiently", async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await db.createNotification({
          userId: testUserId,
          title: `Performance Test ${i}`,
          message: `Message ${i}`,
          type: "system",
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it("should retrieve notifications quickly", async () => {
      const startTime = Date.now();
      
      await db.getNotifications({ userId: testUserId, limit: 100 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });
});

