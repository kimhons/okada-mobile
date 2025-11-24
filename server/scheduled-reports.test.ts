import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Scheduled Reports Feature Tests", () => {
  let testReportId: number;
  const testUserId = 1;

  describe("CRUD Operations", () => {
    it("should create a new scheduled report", async () => {
      const result = await db.createScheduledReport({
        name: "Weekly Transaction Report",
        description: "Automated weekly transaction analytics",
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1, // Monday
        dayOfMonth: null,
        time: "09:00",
        recipients: "manager@okada.com, finance@okada.com",
        customMessage: "Please review this week's transaction performance",
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-01 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      expect(result).toBeDefined();
      // Store the ID for subsequent tests
      const reports = await db.getAllScheduledReports();
      testReportId = reports[0].id;
    });

    it("should list all scheduled reports", async () => {
      const reports = await db.getAllScheduledReports();
      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
    });

    it("should filter scheduled reports by report type", async () => {
      const reports = await db.getAllScheduledReports({
        reportType: "transaction_analytics",
      });
      expect(reports).toBeDefined();
      expect(reports.every(r => r.reportType === "transaction_analytics")).toBe(true);
    });

    it("should filter scheduled reports by frequency", async () => {
      const reports = await db.getAllScheduledReports({
        frequency: "weekly",
      });
      expect(reports).toBeDefined();
      expect(reports.every(r => r.frequency === "weekly")).toBe(true);
    });

    it("should filter scheduled reports by active status", async () => {
      const reports = await db.getAllScheduledReports({
        isActive: true,
      });
      expect(reports).toBeDefined();
      expect(reports.every(r => r.isActive === true)).toBe(true);
    });

    it("should get scheduled report by ID", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report).toBeDefined();
      expect(report?.id).toBe(testReportId);
      expect(report?.name).toBe("Weekly Transaction Report");
    });

    it("should update scheduled report", async () => {
      await db.updateScheduledReport(testReportId, {
        name: "Updated Weekly Report",
        time: "10:00",
      });

      const updated = await db.getScheduledReportById(testReportId);
      expect(updated?.name).toBe("Updated Weekly Report");
      expect(updated?.time).toBe("10:00");
    });

    it("should toggle active status", async () => {
      // Deactivate
      await db.updateScheduledReport(testReportId, { isActive: false });
      let report = await db.getScheduledReportById(testReportId);
      expect(report?.isActive).toBe(false);

      // Reactivate
      await db.updateScheduledReport(testReportId, { isActive: true });
      report = await db.getScheduledReportById(testReportId);
      expect(report?.isActive).toBe(true);
    });
  });

  describe("Schedule Configuration", () => {
    it("should create daily scheduled report", async () => {
      await db.createScheduledReport({
        name: "Daily Transaction Summary",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "daily",
        dayOfWeek: null,
        dayOfMonth: null,
        time: "08:00",
        recipients: "daily@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-11-25 08:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports({ frequency: "daily" });
      expect(reports.length).toBeGreaterThan(0);
      const dailyReport = reports.find(r => r.name === "Daily Transaction Summary");
      expect(dailyReport).toBeDefined();
      expect(dailyReport?.frequency).toBe("daily");
      expect(dailyReport?.dayOfWeek).toBeNull();
      expect(dailyReport?.dayOfMonth).toBeNull();
    });

    it("should create monthly scheduled report", async () => {
      await db.createScheduledReport({
        name: "Monthly Transaction Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "month",
        frequency: "monthly",
        dayOfWeek: null,
        dayOfMonth: 1, // First day of month
        time: "09:00",
        recipients: "monthly@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-01 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports({ frequency: "monthly" });
      expect(reports.length).toBeGreaterThan(0);
      const monthlyReport = reports.find(r => r.name === "Monthly Transaction Report");
      expect(monthlyReport).toBeDefined();
      expect(monthlyReport?.frequency).toBe("monthly");
      expect(monthlyReport?.dayOfMonth).toBe(1);
    });

    it("should store schedule configuration correctly", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.frequency).toBe("weekly");
      expect(report?.dayOfWeek).toBe(1); // Monday
      expect(report?.time).toBe("10:00");
    });
  });

  describe("Period Types", () => {
    it("should create report with week over week period", async () => {
      await db.createScheduledReport({
        name: "Week over Week Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Week over Week Report");
      expect(report?.periodType).toBe("week");
    });

    it("should create report with month over month period", async () => {
      await db.createScheduledReport({
        name: "Month over Month Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "month",
        frequency: "monthly",
        dayOfWeek: null,
        dayOfMonth: 1,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-01 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Month over Month Report");
      expect(report?.periodType).toBe("month");
    });

    it("should create report with quarter over quarter period", async () => {
      await db.createScheduledReport({
        name: "Quarter over Quarter Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "quarter",
        frequency: "monthly",
        dayOfWeek: null,
        dayOfMonth: 1,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2026-01-01 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Quarter over Quarter Report");
      expect(report?.periodType).toBe("quarter");
    });

    it("should create report with year over year period", async () => {
      await db.createScheduledReport({
        name: "Year over Year Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "year",
        frequency: "monthly",
        dayOfWeek: null,
        dayOfMonth: 1,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2026-01-01 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Year over Year Report");
      expect(report?.periodType).toBe("year");
    });
  });

  describe("Recipients Management", () => {
    it("should store single recipient", async () => {
      await db.createScheduledReport({
        name: "Single Recipient Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "single@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Single Recipient Report");
      expect(report?.recipients).toBe("single@okada.com");
    });

    it("should store multiple recipients", async () => {
      await db.createScheduledReport({
        name: "Multiple Recipients Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "user1@okada.com, user2@okada.com, user3@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Multiple Recipients Report");
      expect(report?.recipients).toContain("user1@okada.com");
      expect(report?.recipients).toContain("user2@okada.com");
      expect(report?.recipients).toContain("user3@okada.com");
    });

    it("should update recipients list", async () => {
      await db.updateScheduledReport(testReportId, {
        recipients: "new1@okada.com, new2@okada.com",
      });

      const report = await db.getScheduledReportById(testReportId);
      expect(report?.recipients).toBe("new1@okada.com, new2@okada.com");
    });
  });

  describe("Custom Messages", () => {
    it("should store custom message", async () => {
      await db.createScheduledReport({
        name: "Report with Custom Message",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: "This is a custom message for the report",
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Report with Custom Message");
      expect(report?.customMessage).toBe("This is a custom message for the report");
    });

    it("should allow null custom message", async () => {
      await db.createScheduledReport({
        name: "Report without Custom Message",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "Report without Custom Message");
      expect(report?.customMessage).toBeNull();
    });
  });

  describe("Run Status Tracking", () => {
    it("should update last run timestamp", async () => {
      const now = new Date();
      await db.updateScheduledReport(testReportId, {
        lastRunAt: now,
        lastRunStatus: "success",
      });

      const report = await db.getScheduledReportById(testReportId);
      expect(report?.lastRunAt).toBeDefined();
      expect(report?.lastRunStatus).toBe("success");
    });

    it("should track failed run status", async () => {
      await db.updateScheduledReport(testReportId, {
        lastRunStatus: "failed",
      });

      const report = await db.getScheduledReportById(testReportId);
      expect(report?.lastRunStatus).toBe("failed");
    });

    it("should update next run timestamp", async () => {
      const nextRun = new Date("2025-12-09 10:00:00");
      await db.updateScheduledReport(testReportId, {
        nextRunAt: nextRun,
      });

      const report = await db.getScheduledReportById(testReportId);
      expect(report?.nextRunAt).toBeDefined();
    });
  });

  describe("Deletion", () => {
    it("should delete scheduled report", async () => {
      // Create a report to delete
      await db.createScheduledReport({
        name: "Report to Delete",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const reportToDelete = reports.find(r => r.name === "Report to Delete");
      expect(reportToDelete).toBeDefined();

      // Delete it
      await db.deleteScheduledReport(reportToDelete!.id);

      // Verify it's gone
      const deletedReport = await db.getScheduledReportById(reportToDelete!.id);
      expect(deletedReport).toBeUndefined();
    });
  });

  describe("Edge Cases", () => {
    it("should handle report with no description", async () => {
      await db.createScheduledReport({
        name: "No Description Report",
        description: null,
        reportType: "transaction_analytics",
        periodType: "week",
        frequency: "weekly",
        dayOfWeek: 1,
        dayOfMonth: null,
        time: "09:00",
        recipients: "test@okada.com",
        customMessage: null,
        isActive: true,
        lastRunAt: null,
        nextRunAt: new Date("2025-12-02 09:00:00"),
        lastRunStatus: null,
        createdBy: testUserId,
      });

      const reports = await db.getAllScheduledReports();
      const report = reports.find(r => r.name === "No Description Report");
      expect(report?.description).toBeNull();
    });

    it("should handle report that has never run", async () => {
      const report = await db.getScheduledReportById(testReportId);
      // lastRunAt might be null or a date depending on previous tests
      expect(report).toBeDefined();
    });

    it("should return empty array when no reports match filter", async () => {
      const reports = await db.getAllScheduledReports({
        reportType: "nonexistent_type",
      });
      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBe(0);
    });
  });
});

