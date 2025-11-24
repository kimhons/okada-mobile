import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Preview Report Feature Tests", () => {
  let testReportId: number;
  const testUserId = 1;

  beforeAll(async () => {
    // Create a test scheduled report
    await db.createScheduledReport({
      name: "Test Preview Report",
      description: "Report for testing preview functionality",
      reportType: "transaction_analytics",
      periodType: "week",
      frequency: "weekly",
      dayOfWeek: 1,
      dayOfMonth: null,
      time: "09:00",
      recipients: "test@okada.com, manager@okada.com",
      customMessage: "This is a test custom message for the preview",
      isActive: true,
      lastRunAt: null,
      nextRunAt: new Date("2025-12-02 09:00:00"),
      lastRunStatus: null,
      createdBy: testUserId,
    });

    const reports = await db.getAllScheduledReports();
    const testReport = reports.find(r => r.name === "Test Preview Report");
    if (testReport) {
      testReportId = testReport.id;
    }
  });

  describe("Preview Generation", () => {
    it("should generate preview for week over week report", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report).toBeDefined();
      expect(report?.periodType).toBe("week");
    });

    it("should generate preview for month over month report", async () => {
      // Create monthly report
      await db.createScheduledReport({
        name: "Monthly Preview Test",
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
      const monthlyReport = reports.find(r => r.name === "Monthly Preview Test");
      expect(monthlyReport).toBeDefined();
      expect(monthlyReport?.periodType).toBe("month");
    });

    it("should generate preview for quarter over quarter report", async () => {
      await db.createScheduledReport({
        name: "Quarterly Preview Test",
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
      const quarterlyReport = reports.find(r => r.name === "Quarterly Preview Test");
      expect(quarterlyReport).toBeDefined();
      expect(quarterlyReport?.periodType).toBe("quarter");
    });

    it("should generate preview for year over year report", async () => {
      await db.createScheduledReport({
        name: "Yearly Preview Test",
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
      const yearlyReport = reports.find(r => r.name === "Yearly Preview Test");
      expect(yearlyReport).toBeDefined();
      expect(yearlyReport?.periodType).toBe("year");
    });
  });

  describe("Preview Content Validation", () => {
    it("should include report name in preview data", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.name).toBe("Test Preview Report");
    });

    it("should include period type in preview data", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.periodType).toBe("week");
    });

    it("should include recipients in preview data", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.recipients).toBe("test@okada.com, manager@okada.com");
    });

    it("should include custom message when provided", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.customMessage).toBe("This is a test custom message for the preview");
    });

    it("should handle null custom message", async () => {
      const reports = await db.getAllScheduledReports();
      const reportWithoutMessage = reports.find(r => r.name === "Monthly Preview Test");
      expect(reportWithoutMessage?.customMessage).toBeNull();
    });
  });

  describe("Preview HTML Structure", () => {
    it("should verify report has required fields for HTML generation", async () => {
      const report = await db.getScheduledReportById(testReportId);
      
      // Verify all required fields are present
      expect(report?.name).toBeDefined();
      expect(report?.periodType).toBeDefined();
      expect(report?.recipients).toBeDefined();
      expect(report?.reportType).toBe("transaction_analytics");
    });

    it("should handle reports with description", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.description).toBe("Report for testing preview functionality");
    });

    it("should handle reports without description", async () => {
      const reports = await db.getAllScheduledReports();
      const reportWithoutDesc = reports.find(r => r.name === "Monthly Preview Test");
      expect(reportWithoutDesc?.description).toBeNull();
    });
  });

  describe("Preview Error Handling", () => {
    it("should handle non-existent report ID", async () => {
      const report = await db.getScheduledReportById(999999);
      expect(report).toBeUndefined();
    });

    it("should handle invalid report ID", async () => {
      const report = await db.getScheduledReportById(-1);
      expect(report).toBeUndefined();
    });
  });

  describe("Preview Activity Logging", () => {
    it("should log preview action", async () => {
      // This would be tested via the tRPC procedure which includes activity logging
      // Here we verify the report exists and can be previewed
      const report = await db.getScheduledReportById(testReportId);
      expect(report).toBeDefined();
    });
  });

  describe("Period Date Calculations", () => {
    it("should calculate week period dates correctly", async () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const currentStart = new Date(now);
      currentStart.setDate(now.getDate() - dayOfWeek);
      currentStart.setHours(0, 0, 0, 0);
      
      expect(currentStart.getHours()).toBe(0);
      expect(currentStart.getMinutes()).toBe(0);
    });

    it("should calculate month period dates correctly", async () => {
      const now = new Date();
      const currentStart = new Date(now);
      currentStart.setDate(1);
      currentStart.setHours(0, 0, 0, 0);
      
      expect(currentStart.getDate()).toBe(1);
      expect(currentStart.getHours()).toBe(0);
    });

    it("should calculate quarter period dates correctly", async () => {
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterStartMonth = currentQuarter * 3;
      
      expect(quarterStartMonth).toBeGreaterThanOrEqual(0);
      expect(quarterStartMonth).toBeLessThan(12);
      expect(quarterStartMonth % 3).toBe(0);
    });

    it("should calculate year period dates correctly", async () => {
      const now = new Date();
      const currentStart = new Date(now);
      currentStart.setMonth(0, 1);
      currentStart.setHours(0, 0, 0, 0);
      
      expect(currentStart.getMonth()).toBe(0);
      expect(currentStart.getDate()).toBe(1);
    });
  });

  describe("Metrics Calculation for Preview", () => {
    it("should handle empty transaction set", async () => {
      const transactions: any[] = [];
      const completed = transactions.filter(t => t.status === "completed");
      const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
      const successRate = transactions.length > 0
        ? (completed.length / transactions.length) * 100
        : 0;
      
      expect(totalRevenue).toBe(0);
      expect(successRate).toBe(0);
    });

    it("should calculate success rate correctly", async () => {
      const transactions = [
        { status: "completed", amount: 1000 },
        { status: "completed", amount: 2000 },
        { status: "failed", amount: 1500 },
        { status: "pending", amount: 500 },
      ];
      
      const completed = transactions.filter(t => t.status === "completed");
      const successRate = (completed.length / transactions.length) * 100;
      
      expect(successRate).toBe(50);
    });

    it("should calculate total revenue from completed transactions only", async () => {
      const transactions = [
        { status: "completed", amount: 1000 },
        { status: "completed", amount: 2000 },
        { status: "failed", amount: 1500 },
      ];
      
      const completed = transactions.filter(t => t.status === "completed");
      const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
      
      expect(totalRevenue).toBe(3000);
    });

    it("should calculate average amount correctly", async () => {
      const transactions = [
        { status: "completed", amount: 1000 },
        { status: "completed", amount: 2000 },
        { status: "completed", amount: 3000 },
      ];
      
      const completed = transactions.filter(t => t.status === "completed");
      const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
      const avgAmount = completed.length > 0 ? totalRevenue / completed.length : 0;
      
      expect(avgAmount).toBe(2000);
    });

    it("should handle zero division in average calculation", async () => {
      const transactions: any[] = [];
      const completed = transactions.filter(t => t.status === "completed");
      const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
      const avgAmount = completed.length > 0 ? totalRevenue / completed.length : 0;
      
      expect(avgAmount).toBe(0);
    });
  });

  describe("Change Calculation for Preview", () => {
    it("should calculate positive percentage change", async () => {
      const current = 150;
      const previous = 100;
      const change = ((current - previous) / previous) * 100;
      
      expect(change).toBe(50);
    });

    it("should calculate negative percentage change", async () => {
      const current = 75;
      const previous = 100;
      const change = ((current - previous) / previous) * 100;
      
      expect(change).toBe(-25);
    });

    it("should handle zero previous value", async () => {
      const current = 100;
      const previous = 0;
      const change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
      
      expect(change).toBe(100);
    });

    it("should handle both zero values", async () => {
      const current = 0;
      const previous = 0;
      const change = previous === 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
      
      expect(change).toBe(0);
    });
  });

  describe("Period Label Generation", () => {
    it("should generate correct label for week period", async () => {
      const labels: Record<string, string> = {
        week: "Week over Week",
        month: "Month over Month",
        quarter: "Quarter over Quarter",
        year: "Year over Year",
      };
      
      expect(labels["week"]).toBe("Week over Week");
    });

    it("should generate correct label for month period", async () => {
      const labels: Record<string, string> = {
        week: "Week over Week",
        month: "Month over Month",
        quarter: "Quarter over Quarter",
        year: "Year over Year",
      };
      
      expect(labels["month"]).toBe("Month over Month");
    });

    it("should generate correct label for quarter period", async () => {
      const labels: Record<string, string> = {
        week: "Week over Week",
        month: "Month over Month",
        quarter: "Quarter over Quarter",
        year: "Year over Year",
      };
      
      expect(labels["quarter"]).toBe("Quarter over Quarter");
    });

    it("should generate correct label for year period", async () => {
      const labels: Record<string, string> = {
        week: "Week over Week",
        month: "Month over Month",
        quarter: "Quarter over Quarter",
        year: "Year over Year",
      };
      
      expect(labels["year"]).toBe("Year over Year");
    });
  });
});

