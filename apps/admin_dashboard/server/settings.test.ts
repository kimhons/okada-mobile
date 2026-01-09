import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "../server/routers";
import * as db from "../server/db";

// Mock context for authenticated admin user
const createMockContext = (role: "admin" | "user" = "admin") => ({
  user: {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@okada.cm",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: "email",
  },
  req: {} as any,
  res: {} as any,
});

describe("Settings & Configuration", () => {
  describe("Admin Users Management", () => {
    it("should get all admin users", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const users = await caller.settings.getAllAdminUsers();
      
      expect(users).toBeDefined();
      expect(Array.isArray(users)).toBe(true);
    });

    it("should promote user to admin", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // First create a regular user
      await db.upsertUser({
        openId: "test-user-promote",
        name: "Test User",
        email: "user@okada.cm",
        role: "user",
      });
      
      // Get the user
      const users = await caller.settings.getAllAdminUsers();
      const user = users.find(u => u.openId === "test-user-promote");
      expect(user).toBeDefined();
      
      if (user) {
        // Promote to admin
        const result = await caller.settings.promoteUserToAdmin({ userId: user.id });
        expect(result.success).toBe(true);
        
        // Verify promotion
        const updatedUsers = await caller.settings.getAllAdminUsers();
        const updatedUser = updatedUsers.find(u => u.id === user.id);
        expect(updatedUser?.role).toBe("admin");
      }
    });

    it("should demote admin to user", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // First create an admin user
      await db.upsertUser({
        openId: "test-admin-demote",
        name: "Test Admin",
        email: "admin-demote@okada.cm",
        role: "admin",
      });
      
      // Get the admin
      const users = await caller.settings.getAllAdminUsers();
      const admin = users.find(u => u.openId === "test-admin-demote");
      expect(admin).toBeDefined();
      
      if (admin) {
        // Demote to user
        const result = await caller.settings.demoteAdminToUser({ userId: admin.id });
        expect(result.success).toBe(true);
        
        // Verify demotion
        const updatedUsers = await caller.settings.getAllAdminUsers();
        const updatedUser = updatedUsers.find(u => u.id === admin.id);
        expect(updatedUser?.role).toBe("user");
      }
    });

    it("should log activity when promoting user", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create a user
      await db.upsertUser({
        openId: "test-user-log",
        name: "Test User Log",
        email: "userlog@okada.cm",
        role: "user",
      });
      
      const users = await caller.settings.getAllAdminUsers();
      const user = users.find(u => u.openId === "test-user-log");
      
      if (user) {
        await caller.settings.promoteUserToAdmin({ userId: user.id });
        
        // Check activity log
        const activities = await db.getActivityLogs();
        const promoteActivity = activities.find(
          a => a.action === "promote_user_to_admin" && a.entityId === user.id
        );
        
        expect(promoteActivity).toBeDefined();
        expect(promoteActivity?.adminId).toBe(1);
        expect(promoteActivity?.entityType).toBe("user");
      }
    });

    it("should log activity when demoting admin", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create an admin
      await db.upsertUser({
        openId: "test-admin-log",
        name: "Test Admin Log",
        email: "adminlog@okada.cm",
        role: "admin",
      });
      
      const users = await caller.settings.getAllAdminUsers();
      const admin = users.find(u => u.openId === "test-admin-log");
      
      if (admin) {
        await caller.settings.demoteAdminToUser({ userId: admin.id });
        
        // Check activity log
        const activities = await db.getActivityLogs();
        const demoteActivity = activities.find(
          a => a.action === "demote_admin_to_user" && a.entityId === admin.id
        );
        
        expect(demoteActivity).toBeDefined();
        expect(demoteActivity?.adminId).toBe(1);
        expect(demoteActivity?.entityType).toBe("user");
      }
    });
  });

  describe("Audit Trail", () => {
    it("should retrieve all activity logs", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const activities = await db.getActivityLogs();
      
      expect(activities).toBeDefined();
      expect(Array.isArray(activities)).toBe(true);
    });

    it("should include admin information in logs", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create a test activity
      await db.logActivity({
        adminId: 1,
        adminName: "Test Admin",
        action: "test_action",
        entityType: "test",
        entityId: 999,
        details: "Test details",
      });
      
      const activities = await db.getActivityLogs();
      const testActivity = activities.find(a => a.action === "test_action");
      
      expect(testActivity).toBeDefined();
      expect(testActivity?.adminId).toBe(1);
      expect(testActivity?.adminName).toBe("Test Admin");
      expect(testActivity?.entityType).toBe("test");
      expect(testActivity?.entityId).toBe(999);
    });

    it("should track timestamps for all activities", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      await db.logActivity({
        adminId: 1,
        adminName: "Test Admin",
        action: "timestamp_test",
        entityType: "test",
      });
      
      const activities = await db.getActivityLogs();
      const activity = activities.find(a => a.action === "timestamp_test");
      
      expect(activity).toBeDefined();
      expect(activity?.createdAt).toBeDefined();
      expect(activity?.createdAt).toBeInstanceOf(Date);
    });
  });

  describe("Backup & Restore", () => {
    it("should get all backup logs", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const backups = await caller.settings.getAllBackupLogs();
      
      expect(backups).toBeDefined();
      expect(Array.isArray(backups)).toBe(true);
    });

    it("should create a manual backup", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      const result = await caller.settings.createBackup({
        filename: "test-backup-manual.sql",
        type: "manual",
      });
      
      expect(result.success).toBe(true);
      
      // Verify backup was created
      const backups = await caller.settings.getAllBackupLogs();
      const backup = backups.find(b => b.filename === "test-backup-manual.sql");
      
      expect(backup).toBeDefined();
      expect(backup?.type).toBe("manual");
      expect(backup?.status).toBe("pending");
    });

    it("should create an automatic backup", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      const result = await caller.settings.createBackup({
        filename: "test-backup-auto.sql",
        type: "automatic",
      });
      
      expect(result.success).toBe(true);
      
      const backups = await caller.settings.getAllBackupLogs();
      const backup = backups.find(b => b.filename === "test-backup-auto.sql");
      
      expect(backup).toBeDefined();
      expect(backup?.type).toBe("automatic");
    });

    it("should update backup status to completed", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create backup
      await caller.settings.createBackup({
        filename: "test-backup-complete.sql",
        type: "manual",
      });
      
      const backups = await caller.settings.getAllBackupLogs();
      const backup = backups.find(b => b.filename === "test-backup-complete.sql");
      
      expect(backup).toBeDefined();
      
      if (backup) {
        // Update to completed
        const result = await caller.settings.updateBackupLog({
          id: backup.id,
          status: "completed",
          size: 25000000, // 25 MB
        });
        
        expect(result.success).toBe(true);
        
        // Verify update
        const updatedBackups = await caller.settings.getAllBackupLogs();
        const updatedBackup = updatedBackups.find(b => b.id === backup.id);
        
        expect(updatedBackup?.status).toBe("completed");
        expect(updatedBackup?.size).toBe(25000000);
        expect(updatedBackup?.completedAt).toBeDefined();
      }
    });

    it("should update backup status to failed with error message", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create backup
      await caller.settings.createBackup({
        filename: "test-backup-failed.sql",
        type: "manual",
      });
      
      const backups = await caller.settings.getAllBackupLogs();
      const backup = backups.find(b => b.filename === "test-backup-failed.sql");
      
      if (backup) {
        // Update to failed
        const result = await caller.settings.updateBackupLog({
          id: backup.id,
          status: "failed",
          errorMessage: "Disk space insufficient",
        });
        
        expect(result.success).toBe(true);
        
        // Verify update
        const updatedBackups = await caller.settings.getAllBackupLogs();
        const updatedBackup = updatedBackups.find(b => b.id === backup.id);
        
        expect(updatedBackup?.status).toBe("failed");
        expect(updatedBackup?.errorMessage).toBe("Disk space insufficient");
        expect(updatedBackup?.completedAt).toBeDefined();
      }
    });

    it("should log activity when creating backup", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      await caller.settings.createBackup({
        filename: "test-backup-activity.sql",
        type: "manual",
      });
      
      const activities = await db.getActivityLogs();
      const backupActivity = activities.find(
        a => a.action === "create_backup" && a.details?.includes("test-backup-activity.sql")
      );
      
      expect(backupActivity).toBeDefined();
      expect(backupActivity?.entityType).toBe("backup");
    });
  });

  describe("API Management", () => {
    it("should get all API keys", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const apiKeys = await caller.settings.getAllApiKeys();
      
      expect(apiKeys).toBeDefined();
      expect(Array.isArray(apiKeys)).toBe(true);
    });

    it("should create a new API key", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      const randomKey = `ok_test${Math.random().toString(36).substring(7)}`;
      const result = await caller.settings.createApiKey({
        name: "Test API Key",
        key: randomKey,
        secret: `sk_secret${Math.random().toString(36).substring(7)}`,
        permissions: "read:orders,write:products",
      });
      
      expect(result.success).toBe(true);
      
      // Verify API key was created
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Test API Key");
      
      expect(apiKey).toBeDefined();
      expect(apiKey?.key).toBe(randomKey);
      expect(apiKey?.permissions).toBe("read:orders,write:products");
      expect(apiKey?.isActive).toBe(true);
    });

    it("should create API key with expiration date", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30); // 30 days from now
      
      const randomKey = `ok_expiring${Math.random().toString(36).substring(7)}`;
      const result = await caller.settings.createApiKey({
        name: "Expiring API Key",
        key: randomKey,
        secret: `sk_expiring${Math.random().toString(36).substring(7)}`,
        expiresAt: expirationDate.toISOString(),
      });
      
      expect(result.success).toBe(true);
      
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Expiring API Key");
      
      expect(apiKey).toBeDefined();
      expect(apiKey?.expiresAt).toBeDefined();
    });

    it("should update API key status", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create API key
      const randomKey = `ok_status${Math.random().toString(36).substring(7)}`;
      await caller.settings.createApiKey({
        name: "Status Test Key",
        key: randomKey,
        secret: `sk_status${Math.random().toString(36).substring(7)}`,
      });
      
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Status Test Key");
      
      expect(apiKey).toBeDefined();
      
      if (apiKey) {
        // Deactivate
        const result = await caller.settings.updateApiKey({
          id: apiKey.id,
          isActive: false,
        });
        
        expect(result.success).toBe(true);
        
        // Verify update
        const updatedKeys = await caller.settings.getAllApiKeys();
        const updatedKey = updatedKeys.find(k => k.id === apiKey.id);
        
        expect(updatedKey?.isActive).toBe(false);
      }
    });

    it("should update API key name and permissions", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create API key
      const randomKey = `ok_update${Math.random().toString(36).substring(7)}`;
      await caller.settings.createApiKey({
        name: "Original Name",
        key: randomKey,
        secret: `sk_update${Math.random().toString(36).substring(7)}`,
        permissions: "read:orders",
      });
      
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Original Name");
      
      if (apiKey) {
        // Update name and permissions
        const result = await caller.settings.updateApiKey({
          id: apiKey.id,
          name: "Updated Name",
          permissions: "read:orders,write:orders",
        });
        
        expect(result.success).toBe(true);
        
        // Verify update
        const updatedKeys = await caller.settings.getAllApiKeys();
        const updatedKey = updatedKeys.find(k => k.id === apiKey.id);
        
        expect(updatedKey?.name).toBe("Updated Name");
        expect(updatedKey?.permissions).toBe("read:orders,write:orders");
      }
    });

    it("should delete API key", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create API key
      const randomKey = `ok_delete${Math.random().toString(36).substring(7)}`;
      await caller.settings.createApiKey({
        name: "Delete Test Key",
        key: randomKey,
        secret: `sk_delete${Math.random().toString(36).substring(7)}`,
      });
      
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Delete Test Key");
      
      expect(apiKey).toBeDefined();
      
      if (apiKey) {
        // Delete
        const result = await caller.settings.deleteApiKey({ id: apiKey.id });
        expect(result.success).toBe(true);
        
        // Verify deletion
        const updatedKeys = await caller.settings.getAllApiKeys();
        const deletedKey = updatedKeys.find(k => k.id === apiKey.id);
        
        expect(deletedKey).toBeUndefined();
      }
    });

    it("should log activity when creating API key", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      const randomKey = `ok_activity${Math.random().toString(36).substring(7)}`;
      await caller.settings.createApiKey({
        name: "Activity Log Key",
        key: randomKey,
        secret: `sk_activity${Math.random().toString(36).substring(7)}`,
      });
      
      const activities = await db.getActivityLogs();
      const createActivity = activities.find(
        a => a.action === "create_api_key" && a.details?.includes("Activity Log Key")
      );
      
      expect(createActivity).toBeDefined();
      expect(createActivity?.entityType).toBe("api_key");
    });

    it("should log activity when updating API key", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create API key
      const randomKey2 = `ok_updatelog${Math.random().toString(36).substring(7)}`;
      await caller.settings.createApiKey({
        name: "Update Log Key",
        key: randomKey2,
        secret: `sk_updatelog${Math.random().toString(36).substring(7)}`,
      });
      
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Update Log Key");
      
      if (apiKey) {
        // Update
        await caller.settings.updateApiKey({
          id: apiKey.id,
          isActive: false,
        });
        
        const activities = await db.getActivityLogs();
        const updateActivity = activities.find(
          a => a.action === "update_api_key" && a.entityId === apiKey.id
        );
        
        expect(updateActivity).toBeDefined();
        expect(updateActivity?.entityType).toBe("api_key");
      }
    });

    it("should log activity when deleting API key", async () => {
      const caller = appRouter.createCaller(createMockContext());
      
      // Create API key
      const randomKey3 = `ok_deletelog${Math.random().toString(36).substring(7)}`;
      await caller.settings.createApiKey({
        name: "Delete Log Key",
        key: randomKey3,
        secret: `sk_deletelog${Math.random().toString(36).substring(7)}`,
      });
      
      const apiKeys = await caller.settings.getAllApiKeys();
      const apiKey = apiKeys.find(k => k.name === "Delete Log Key");
      
      if (apiKey) {
        // Delete
        await caller.settings.deleteApiKey({ id: apiKey.id });
        
        const activities = await db.getActivityLogs();
        const deleteActivity = activities.find(
          a => a.action === "delete_api_key" && a.entityId === apiKey.id
        );
        
        expect(deleteActivity).toBeDefined();
        expect(deleteActivity?.entityType).toBe("api_key");
      }
    });
  });
});

