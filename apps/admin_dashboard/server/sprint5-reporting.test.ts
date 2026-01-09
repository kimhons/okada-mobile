import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Sprint 5: Advanced Reporting Suite", () => {
  let testReportId: number;
  let testScheduledReportId: number;

  beforeAll(async () => {
    // Ensure database is available
    const database = await db.getDb();
    expect(database).toBeDefined();
  });

  describe("Custom Reports", () => {
    it("should create a custom report", async () => {
      const result = await db.createCustomReport({
        name: "Test Monthly Revenue Report",
        description: "Monthly revenue breakdown by region",
        reportType: "revenue",
        createdBy: 1,
        filters: JSON.stringify({ dateRange: "last_30_days", region: "all" }),
        metrics: JSON.stringify(["total_revenue", "order_count", "avg_order_value"]),
        groupBy: "region",
        sortBy: "total_revenue",
        sortOrder: "desc",
        isPublic: 0,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBeTypeOf("number");
      testReportId = result?.id!;
    });

    it("should retrieve all custom reports", async () => {
      const reports = await db.getCustomReports();
      
      expect(reports).toBeDefined();
      expect(Array.isArray(reports)).toBe(true);
      expect(reports.length).toBeGreaterThan(0);
    });

    it("should retrieve a specific report by ID", async () => {
      const report = await db.getCustomReportById(testReportId);
      
      expect(report).toBeDefined();
      expect(report?.id).toBe(testReportId);
      expect(report?.name).toBe("Test Monthly Revenue Report");
      expect(report?.reportType).toBe("revenue");
    });

    it("should filter reports by type", async () => {
      const revenueReports = await db.getCustomReports({ reportType: "revenue" });
      
      expect(revenueReports).toBeDefined();
      expect(Array.isArray(revenueReports)).toBe(true);
      if (revenueReports.length > 0) {
        expect(revenueReports[0].reportType).toBe("revenue");
      }
    });

    it("should update a custom report", async () => {
      const result = await db.updateCustomReport(testReportId, {
        description: "Updated: Monthly revenue breakdown with new metrics",
        metrics: JSON.stringify(["total_revenue", "order_count", "avg_order_value", "profit_margin"]),
      });

      expect(result).toBeDefined();
    });

    it("should filter reports by creator", async () => {
      const myReports = await db.getCustomReports({ createdBy: 1 });
      
      expect(myReports).toBeDefined();
      expect(Array.isArray(myReports)).toBe(true);
    });
  });

  describe("Scheduled Reports", () => {
    it("should create a scheduled report", async () => {
      const result = await db.createScheduledReport({
        reportId: testReportId,
        name: "Weekly Revenue Email",
        frequency: "weekly",
        scheduleTime: "09:00",
        dayOfWeek: 1, // Monday
        timezone: "Africa/Douala",
        recipients: "admin@okada.cm,manager@okada.cm",
        format: "pdf",
        subject: "Weekly Revenue Report",
        message: "Please find attached the weekly revenue report.",
        createdBy: 1,
        isActive: 1,
      });

      expect(result).toBeDefined();
      expect(result?.id).toBeTypeOf("number");
      testScheduledReportId = result?.id!;
    });

    it("should retrieve all scheduled reports", async () => {
      const scheduled = await db.getScheduledReports();
      
      expect(scheduled).toBeDefined();
      expect(Array.isArray(scheduled)).toBe(true);
      expect(scheduled.length).toBeGreaterThan(0);
    });

    it("should filter scheduled reports by active status", async () => {
      const activeReports = await db.getScheduledReports({ isActive: true });
      
      expect(activeReports).toBeDefined();
      expect(Array.isArray(activeReports)).toBe(true);
      if (activeReports.length > 0) {
        expect(activeReports[0].isActive).toBe(1);
      }
    });

    it("should update a scheduled report", async () => {
      const result = await db.updateScheduledReport(testScheduledReportId, {
        scheduleTime: "10:00",
        recipients: "admin@okada.cm,manager@okada.cm,cfo@okada.cm",
      });

      expect(result).toBeDefined();
    });

    it("should deactivate a scheduled report", async () => {
      const result = await db.updateScheduledReport(testScheduledReportId, {
        isActive: 0,
      });

      expect(result).toBeDefined();
      
      const scheduled = await db.getScheduledReports({ isActive: false });
      const deactivated = scheduled.find(s => s.id === testScheduledReportId);
      expect(deactivated?.isActive).toBe(0);
    });
  });

  describe("Report Execution", () => {
    it("should execute a report and log execution history", async () => {
      const result = await db.executeReport(testReportId, 1, "manual");
      
      expect(result).toBeDefined();
      expect(result?.id).toBeTypeOf("number");
      expect(result?.reportId).toBe(testReportId);
      expect(result?.status).toBe("success");
      expect(result?.executionType).toBe("manual");
    });

    it("should retrieve execution history", async () => {
      const history = await db.getReportExecutionHistory();
      
      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);
      expect(history.length).toBeGreaterThan(0);
    });

    it("should filter execution history by report ID", async () => {
      const reportHistory = await db.getReportExecutionHistory({ reportId: testReportId });
      
      expect(reportHistory).toBeDefined();
      expect(Array.isArray(reportHistory)).toBe(true);
      if (reportHistory.length > 0) {
        expect(reportHistory[0].reportId).toBe(testReportId);
      }
    });

    it("should filter execution history by status", async () => {
      const successfulExecutions = await db.getReportExecutionHistory({ status: "success" });
      
      expect(successfulExecutions).toBeDefined();
      expect(Array.isArray(successfulExecutions)).toBe(true);
      if (successfulExecutions.length > 0) {
        expect(successfulExecutions[0].status).toBe("success");
      }
    });

    it("should filter execution history by executor", async () => {
      const myExecutions = await db.getReportExecutionHistory({ executedBy: 1 });
      
      expect(myExecutions).toBeDefined();
      expect(Array.isArray(myExecutions)).toBe(true);
    });
  });

  describe("Report Cleanup", () => {
    it("should delete a custom report", async () => {
      const result = await db.deleteCustomReport(testReportId);
      
      expect(result).toBeDefined();
      
      // Verify deletion
      const deleted = await db.getCustomReportById(testReportId);
      expect(deleted).toBeUndefined();
    });
  });
});
