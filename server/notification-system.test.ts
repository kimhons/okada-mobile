import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { users } from "../drizzle/schema";

describe("Notification System Features", () => {
  let testUserId: number;
  let testAdminId: number;
  let testEmailTemplateId: number;
  let testPushNotificationId: number;

  beforeAll(async () => {
    // Create test users for all operations
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const adminResult = await database
      .insert(users)
      .values({
        openId: `test-notifications-admin-${Date.now()}`,
        name: "Test Notifications Admin",
        email: "notifications-admin@test.com",
        role: "admin",
      });

    testAdminId = Number(adminResult[0].insertId);

    const userResult = await database
      .insert(users)
      .values({
        openId: `test-notifications-user-${Date.now()}`,
        name: "Test Notifications User",
        email: "notifications-user@test.com",
        role: "user",
      });

    testUserId = Number(userResult[0].insertId);
  });

  // ============================================================================
  // Email Templates Tests
  // ============================================================================

  describe("Email Templates", () => {
    it("should create a new email template", async () => {
      await db.createEmailTemplate({
        name: "Welcome Email",
        subject: "Welcome to Okada!",
        body: "<h1>Welcome {{user_name}}!</h1><p>Thank you for joining us.</p>",
        category: "user",
        variables: JSON.stringify(["{{user_name}}", "{{user_email}}"]),
        isActive: true,
        createdBy: testAdminId,
      });

      const templates = await db.getAllEmailTemplates();
      const createdTemplate = templates.find(t => t.name === "Welcome Email");
      
      expect(createdTemplate).toBeDefined();
      expect(createdTemplate?.subject).toBe("Welcome to Okada!");
      expect(createdTemplate?.category).toBe("user");
      expect(createdTemplate?.isActive).toBe(true);
      
      testEmailTemplateId = createdTemplate!.id;
    });

    it("should get email template by ID", async () => {
      const template = await db.getEmailTemplateById(testEmailTemplateId);
      
      expect(template).toBeDefined();
      expect(template?.name).toBe("Welcome Email");
      expect(template?.category).toBe("user");
    });

    it("should filter email templates by category", async () => {
      await db.createEmailTemplate({
        name: "Order Confirmation",
        subject: "Your order has been confirmed",
        body: "<h1>Order {{order_id}}</h1>",
        category: "order",
        isActive: true,
        createdBy: testAdminId,
      });

      const userTemplates = await db.getAllEmailTemplates({ category: "user" });
      const orderTemplates = await db.getAllEmailTemplates({ category: "order" });
      
      expect(userTemplates.length).toBeGreaterThan(0);
      expect(orderTemplates.length).toBeGreaterThan(0);
      expect(userTemplates.every(t => t.category === "user")).toBe(true);
      expect(orderTemplates.every(t => t.category === "order")).toBe(true);
    });

    it("should filter email templates by active status", async () => {
      await db.createEmailTemplate({
        name: "Inactive Template",
        subject: "Test inactive",
        body: "<p>Test</p>",
        category: "system",
        isActive: false,
        createdBy: testAdminId,
      });

      const activeTemplates = await db.getAllEmailTemplates({ isActive: true });
      const inactiveTemplates = await db.getAllEmailTemplates({ isActive: false });
      
      expect(activeTemplates.length).toBeGreaterThan(0);
      expect(inactiveTemplates.length).toBeGreaterThan(0);
      expect(activeTemplates.every(t => t.isActive === true)).toBe(true);
      expect(inactiveTemplates.every(t => t.isActive === false)).toBe(true);
    });

    it("should search email templates by name", async () => {
      const searchResults = await db.getAllEmailTemplates({ search: "Welcome" });
      
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some(t => t.name.includes("Welcome"))).toBe(true);
    });

    it("should update email template", async () => {
      await db.updateEmailTemplate(testEmailTemplateId, {
        name: "Updated Welcome Email",
        subject: "Updated Welcome Subject",
        isActive: false,
      });

      const updatedTemplate = await db.getEmailTemplateById(testEmailTemplateId);
      
      expect(updatedTemplate?.name).toBe("Updated Welcome Email");
      expect(updatedTemplate?.subject).toBe("Updated Welcome Subject");
      expect(updatedTemplate?.isActive).toBe(false);
    });

    it("should delete email template", async () => {
      const tempTemplate = await db.createEmailTemplate({
        name: "Temp Template",
        subject: "Temp",
        body: "<p>Temp</p>",
        createdBy: testAdminId,
      });

      const templates = await db.getAllEmailTemplates();
      const tempTemplateId = templates.find(t => t.name === "Temp Template")?.id;
      
      expect(tempTemplateId).toBeDefined();
      
      await db.deleteEmailTemplate(tempTemplateId!);
      
      const deletedTemplate = await db.getEmailTemplateById(tempTemplateId!);
      expect(deletedTemplate).toBeUndefined();
    });
  });

  // ============================================================================
  // Push Notifications Tests
  // ============================================================================

  describe("Push Notifications", () => {
    it("should create a push notification", async () => {
      await db.createPushNotification({
        title: "New Order Alert",
        message: "You have a new order!",
        type: "info",
        targetAudience: "sellers",
        sentCount: 0,
        deliveredCount: 0,
        clickedCount: 0,
        status: "pending",
        sentBy: testAdminId,
      });

      const notifications = await db.getAllPushNotifications();
      const createdNotification = notifications.find(n => n.title === "New Order Alert");
      
      expect(createdNotification).toBeDefined();
      expect(createdNotification?.message).toBe("You have a new order!");
      expect(createdNotification?.type).toBe("info");
      expect(createdNotification?.targetAudience).toBe("sellers");
      expect(createdNotification?.status).toBe("pending");
      
      testPushNotificationId = createdNotification!.id;
    });

    it("should get push notification by ID", async () => {
      const notification = await db.getPushNotificationById(testPushNotificationId);
      
      expect(notification).toBeDefined();
      expect(notification?.title).toBe("New Order Alert");
      expect(notification?.targetAudience).toBe("sellers");
    });

    it("should filter push notifications by type", async () => {
      await db.createPushNotification({
        title: "Success Notification",
        message: "Operation successful",
        type: "success",
        targetAudience: "all",
        status: "sent",
        sentBy: testAdminId,
      });

      const infoNotifications = await db.getAllPushNotifications({ type: "info" });
      const successNotifications = await db.getAllPushNotifications({ type: "success" });
      
      expect(infoNotifications.length).toBeGreaterThan(0);
      expect(successNotifications.length).toBeGreaterThan(0);
      expect(infoNotifications.every(n => n.type === "info")).toBe(true);
      expect(successNotifications.every(n => n.type === "success")).toBe(true);
    });

    it("should filter push notifications by target audience", async () => {
      await db.createPushNotification({
        title: "Rider Alert",
        message: "New delivery available",
        type: "info",
        targetAudience: "riders",
        status: "sent",
        sentBy: testAdminId,
      });

      const sellersNotifications = await db.getAllPushNotifications({ targetAudience: "sellers" });
      const ridersNotifications = await db.getAllPushNotifications({ targetAudience: "riders" });
      
      expect(sellersNotifications.length).toBeGreaterThan(0);
      expect(ridersNotifications.length).toBeGreaterThan(0);
      expect(sellersNotifications.every(n => n.targetAudience === "sellers")).toBe(true);
      expect(ridersNotifications.every(n => n.targetAudience === "riders")).toBe(true);
    });

    it("should filter push notifications by status", async () => {
      await db.createPushNotification({
        title: "Failed Notification",
        message: "Test failed",
        type: "error",
        targetAudience: "all",
        status: "failed",
        sentBy: testAdminId,
      });

      const pendingNotifications = await db.getAllPushNotifications({ status: "pending" });
      const sentNotifications = await db.getAllPushNotifications({ status: "sent" });
      const failedNotifications = await db.getAllPushNotifications({ status: "failed" });
      
      expect(pendingNotifications.length).toBeGreaterThan(0);
      expect(sentNotifications.length).toBeGreaterThan(0);
      expect(failedNotifications.length).toBeGreaterThan(0);
      expect(pendingNotifications.every(n => n.status === "pending")).toBe(true);
      expect(sentNotifications.every(n => n.status === "sent")).toBe(true);
      expect(failedNotifications.every(n => n.status === "failed")).toBe(true);
    });

    it("should update push notification status and counts", async () => {
      await db.updatePushNotification(testPushNotificationId, {
        status: "sent",
        sentCount: 100,
        deliveredCount: 95,
        clickedCount: 50,
      });

      const updatedNotification = await db.getPushNotificationById(testPushNotificationId);
      
      expect(updatedNotification?.status).toBe("sent");
      expect(updatedNotification?.sentCount).toBe(100);
      expect(updatedNotification?.deliveredCount).toBe(95);
      expect(updatedNotification?.clickedCount).toBe(50);
    });

    it("should delete push notification", async () => {
      const tempNotification = await db.createPushNotification({
        title: "Temp Notification",
        message: "Temp",
        type: "info",
        targetAudience: "all",
        status: "pending",
        sentBy: testAdminId,
      });

      const notifications = await db.getAllPushNotifications();
      const tempNotificationId = notifications.find(n => n.title === "Temp Notification")?.id;
      
      expect(tempNotificationId).toBeDefined();
      
      await db.deletePushNotification(tempNotificationId!);
      
      const deletedNotification = await db.getPushNotificationById(tempNotificationId!);
      expect(deletedNotification).toBeUndefined();
    });
  });

  // ============================================================================
  // Notification Preferences Tests
  // ============================================================================

  describe("Notification Preferences", () => {
    it("should create notification preferences for a user", async () => {
      await db.createNotificationPreference({
        userId: testUserId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        riderUpdates: true,
        paymentAlerts: true,
      });

      const preferences = await db.getAllNotificationPreferences();
      const createdPreference = preferences.find(p => p.userId === testUserId);
      
      expect(createdPreference).toBeDefined();
      expect(createdPreference?.emailNotifications).toBe(true);
      expect(createdPreference?.pushNotifications).toBe(true);
      expect(createdPreference?.smsNotifications).toBe(false);
      expect(createdPreference?.orderUpdates).toBe(true);
      expect(createdPreference?.promotions).toBe(false);
    });

    it("should get notification preferences by user ID", async () => {
      const preference = await db.getNotificationPreferenceByUserId(testUserId);
      
      expect(preference).toBeDefined();
      expect(preference?.userId).toBe(testUserId);
      expect(preference?.emailNotifications).toBe(true);
    });

    it("should update notification preferences", async () => {
      await db.updateNotificationPreference(testUserId, {
        emailNotifications: false,
        smsNotifications: true,
        promotions: true,
        newsletter: true,
      });

      const updatedPreference = await db.getNotificationPreferenceByUserId(testUserId);
      
      expect(updatedPreference?.emailNotifications).toBe(false);
      expect(updatedPreference?.smsNotifications).toBe(true);
      expect(updatedPreference?.promotions).toBe(true);
      expect(updatedPreference?.newsletter).toBe(true);
    });

    it("should get all notification preferences", async () => {
      // Create another user's preferences
      const database = await db.getDb();
      if (!database) throw new Error("Database not available");

      const anotherUserResult = await database
        .insert(users)
        .values({
          openId: `test-notifications-user2-${Date.now()}`,
          name: "Test User 2",
          email: "user2@test.com",
          role: "user",
        });

      const anotherUserId = Number(anotherUserResult[0].insertId);

      await db.createNotificationPreference({
        userId: anotherUserId,
        emailNotifications: true,
        pushNotifications: false,
        smsNotifications: true,
        orderUpdates: true,
        promotions: true,
        newsletter: false,
        riderUpdates: false,
        paymentAlerts: true,
      });

      const allPreferences = await db.getAllNotificationPreferences();
      
      expect(allPreferences.length).toBeGreaterThanOrEqual(2);
      expect(allPreferences.some(p => p.userId === testUserId)).toBe(true);
      expect(allPreferences.some(p => p.userId === anotherUserId)).toBe(true);
    });

    it("should delete notification preferences", async () => {
      const database = await db.getDb();
      if (!database) throw new Error("Database not available");

      const tempUserResult = await database
        .insert(users)
        .values({
          openId: `test-notifications-temp-${Date.now()}`,
          name: "Temp User",
          email: "temp@test.com",
          role: "user",
        });

      const tempUserId = Number(tempUserResult[0].insertId);

      await db.createNotificationPreference({
        userId: tempUserId,
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        riderUpdates: true,
        paymentAlerts: true,
      });

      const preference = await db.getNotificationPreferenceByUserId(tempUserId);
      expect(preference).toBeDefined();
      
      await db.deleteNotificationPreference(tempUserId);
      
      const deletedPreference = await db.getNotificationPreferenceByUserId(tempUserId);
      expect(deletedPreference).toBeUndefined();
    });
  });
});

