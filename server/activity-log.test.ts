import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Activity Log Tests", () => {
  let testAdminId: number;
  let testActivityId: number;

  beforeAll(async () => {
    // Use existing admin user
    testAdminId = 1;
  });

  describe("Create Activity Log", () => {
    it("should create an activity log entry successfully", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "create_order",
        entityType: "order",
        entityId: 12345,
        details: "Created order #12345",
        ipAddress: "192.168.1.1",
      });

      expect(activity).toBeDefined();
      expect(activity.adminId).toBe(testAdminId);
      expect(activity.action).toBe("create_order");
      testActivityId = activity.id;
    });

    it("should create activity log for update action", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "update_user",
        entityType: "user",
        entityId: 456,
        details: "Updated user profile",
        ipAddress: "192.168.1.1",
      });

      expect(activity.action).toBe("update_user");
      expect(activity.entityType).toBe("user");
    });

    it("should create activity log for delete action", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "delete_product",
        entityType: "product",
        entityId: 789,
        details: "Deleted product #789",
        ipAddress: "192.168.1.1",
      });

      expect(activity.action).toBe("delete_product");
    });

    it("should create activity log without entity details", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "export_report",
        ipAddress: "192.168.1.1",
      });

      expect(activity.action).toBe("export_report");
      expect(activity.entityType).toBeNull();
      expect(activity.entityId).toBeNull();
    });

    it("should create activity log without IP address", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "view_dashboard",
      });

      expect(activity.action).toBe("view_dashboard");
      expect(activity.ipAddress).toBeNull();
    });
  });

  describe("Get Activity Logs", () => {
    it("should get all activity logs", async () => {
      const activities = await db.getActivityLogs({ limit: 100 });
      expect(activities.length).toBeGreaterThan(0);
    });

    it("should filter activities by admin ID", async () => {
      const activities = await db.getActivityLogs({ 
        adminId: testAdminId,
        limit: 10 
      });
      
      activities.forEach(activity => {
        expect(activity.adminId).toBe(testAdminId);
      });
    });

    it("should filter activities by action", async () => {
      const activities = await db.getActivityLogs({ 
        action: "create_order",
        limit: 10 
      });
      
      activities.forEach(activity => {
        expect(activity.action).toBe("create_order");
      });
    });

    it("should filter activities by entity type", async () => {
      const activities = await db.getActivityLogs({ 
        entityType: "order",
        limit: 10 
      });
      
      activities.forEach(activity => {
        expect(activity.entityType).toBe("order");
      });
    });

    it("should limit activities returned", async () => {
      const activities = await db.getActivityLogs({ limit: 5 });
      expect(activities.length).toBeLessThanOrEqual(5);
    });

    it("should return activities in descending order by createdAt", async () => {
      const activities = await db.getActivityLogs({ limit: 10 });
      
      if (activities.length > 1) {
        for (let i = 0; i < activities.length - 1; i++) {
          const current = new Date(activities[i].createdAt).getTime();
          const next = new Date(activities[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });
  });

  describe("Activity Log Statistics", () => {
    it("should count total activities", async () => {
      const activities = await db.getActivityLogs({ limit: 100 });
      expect(activities.length).toBeGreaterThan(0);
    });

    it("should count activities by action type", async () => {
      const createActions = await db.getActivityLogs({ 
        action: "create_order",
        limit: 100 
      });
      
      const updateActions = await db.getActivityLogs({ 
        action: "update_user",
        limit: 100 
      });
      
      expect(Array.isArray(createActions)).toBe(true);
      expect(Array.isArray(updateActions)).toBe(true);
    });

    it("should count activities by admin", async () => {
      const adminActivities = await db.getActivityLogs({ 
        adminId: testAdminId,
        limit: 100 
      });
      
      expect(adminActivities.length).toBeGreaterThan(0);
      expect(adminActivities.every(a => a.adminId === testAdminId)).toBe(true);
    });

    it("should count activities by entity type", async () => {
      const orderActivities = await db.getActivityLogs({ 
        entityType: "order",
        limit: 100 
      });
      
      const userActivities = await db.getActivityLogs({ 
        entityType: "user",
        limit: 100 
      });
      
      expect(Array.isArray(orderActivities)).toBe(true);
      expect(Array.isArray(userActivities)).toBe(true);
    });
  });

  describe("Activity Log Audit Trail", () => {
    it("should track order creation activities", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "create_order",
        entityType: "order",
        entityId: 999,
        details: "Created order #999 for customer John Doe",
        ipAddress: "192.168.1.100",
      });

      expect(activity.action).toBe("create_order");
      expect(activity.entityId).toBe(999);
    });

    it("should track user management activities", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "update_user_role",
        entityType: "user",
        entityId: 555,
        details: "Changed user role from user to admin",
        ipAddress: "192.168.1.100",
      });

      expect(activity.action).toBe("update_user_role");
      expect(activity.details).toContain("admin");
    });

    it("should track product management activities", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "update_product_price",
        entityType: "product",
        entityId: 777,
        details: "Updated product price from 10,000 to 12,000 FCFA",
        ipAddress: "192.168.1.100",
      });

      expect(activity.action).toBe("update_product_price");
      expect(activity.details).toContain("FCFA");
    });

    it("should track rider approval activities", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "approve_rider",
        entityType: "rider",
        entityId: 333,
        details: "Approved rider application for John Smith",
        ipAddress: "192.168.1.100",
      });

      expect(activity.action).toBe("approve_rider");
      expect(activity.entityType).toBe("rider");
    });

    it("should track quality verification activities", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "approve_quality_photo",
        entityType: "quality_verification",
        entityId: 888,
        details: "Approved quality verification photos for order #888",
        ipAddress: "192.168.1.100",
      });

      expect(activity.action).toBe("approve_quality_photo");
      expect(activity.details).toContain("quality verification");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long details text", async () => {
      const longDetails = "A".repeat(500);
      
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "bulk_operation",
        details: longDetails,
        ipAddress: "192.168.1.100",
      });

      expect(activity.details).toBeDefined();
      expect(activity.details!.length).toBeGreaterThanOrEqual(400);
    });

    it("should handle special characters in details", async () => {
      const specialDetails = "Updated with special chars: éàü 中文 🎉";
      
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "update_settings",
        details: specialDetails,
        ipAddress: "192.168.1.100",
      });

      expect(activity.details).toBe(specialDetails);
    });

    it("should handle IPv6 addresses", async () => {
      const ipv6 = "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
      
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "login",
        ipAddress: ipv6,
      });

      expect(activity.ipAddress).toBe(ipv6);
    });

    it("should handle non-existent admin gracefully", async () => {
      const activity = await db.createActivityLog({
        adminId: 999999,
        adminName: "Non-existent Admin",
        action: "test_action",
        ipAddress: "192.168.1.100",
      });

      expect(activity).toBeDefined();
      expect(activity.adminId).toBe(999999);
    });

    it("should handle empty activity list", async () => {
      const activities = await db.getActivityLogs({ 
        adminId: 999999,
        limit: 10 
      });
      
      expect(Array.isArray(activities)).toBe(true);
    });
  });

  describe("Performance Tests", () => {
    it("should handle creating many activity logs efficiently", async () => {
      const startTime = Date.now();
      
      for (let i = 0; i < 50; i++) {
        await db.createActivityLog({
          adminId: testAdminId,
          adminName: "Test Admin",
          action: `performance_test_${i}`,
          details: `Performance test activity ${i}`,
          ipAddress: "192.168.1.100",
        });
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 5 seconds)
      expect(duration).toBeLessThan(5000);
    });

    it("should retrieve activity logs quickly", async () => {
      const startTime = Date.now();
      
      await db.getActivityLogs({ limit: 100 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });
  });

  describe("Security and Compliance", () => {
    it("should log all sensitive operations", async () => {
      const sensitiveActions = [
        "delete_user",
        "update_user_role",
        "approve_payout",
        "update_commission_settings",
      ];

      for (const action of sensitiveActions) {
        const activity = await db.createActivityLog({
          adminId: testAdminId,
          adminName: "Test Admin",
          action,
          details: `Sensitive operation: ${action}`,
          ipAddress: "192.168.1.100",
        });

        expect(activity.action).toBe(action);
      }
    });

    it("should preserve IP address for audit trail", async () => {
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "security_test",
        ipAddress: "203.0.113.42",
      });

      expect(activity.ipAddress).toBe("203.0.113.42");
    });

    it("should timestamp all activities accurately", async () => {
      const beforeTime = new Date();
      // Add small buffer for database timestamp precision
      beforeTime.setMilliseconds(beforeTime.getMilliseconds() - 1000);
      
      const activity = await db.createActivityLog({
        adminId: testAdminId,
        adminName: "Test Admin",
        action: "timestamp_test",
        ipAddress: "192.168.1.100",
      });
      
      const afterTime = new Date();
      afterTime.setMilliseconds(afterTime.getMilliseconds() + 1000);
      const activityTime = new Date(activity.createdAt);

      expect(activityTime.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(activityTime.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });
});

