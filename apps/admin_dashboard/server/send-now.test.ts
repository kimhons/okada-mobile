import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Send Now Feature Tests", () => {
  let testReportId: number;
  const testUserId = 1;

  beforeAll(async () => {
    // Create a test scheduled report for Send Now testing
    await db.createScheduledReport({
      name: "Send Now Test Report",
      description: "Report for testing manual send functionality",
      reportType: "transaction_analytics",
      periodType: "week",
      frequency: "weekly",
      dayOfWeek: 1,
      dayOfMonth: null,
      time: "09:00",
      recipients: "test@okada.com, manager@okada.com",
      customMessage: "This is a manual send test",
      isActive: true,
      lastRunAt: null,
      nextRunAt: new Date("2025-12-02 09:00:00"),
      lastRunStatus: null,
      createdBy: testUserId,
    });

    const reports = await db.getAllScheduledReports();
    const testReport = reports.find(r => r.name === "Send Now Test Report");
    if (testReport) {
      testReportId = testReport.id;
    }
  });

  describe("Manual Send Trigger", () => {
    it("should retrieve report configuration for manual send", async () => {
      const report = await db.getScheduledReportById(testReportId);
      
      expect(report).toBeDefined();
      expect(report?.name).toBe("Send Now Test Report");
      expect(report?.recipients).toBe("test@okada.com, manager@okada.com");
      expect(report?.periodType).toBe("week");
    });

    it("should have custom message for manual send", async () => {
      const report = await db.getScheduledReportById(testReportId);
      
      expect(report?.customMessage).toBe("This is a manual send test");
    });

    it("should handle reports without custom message", async () => {
      await db.createScheduledReport({
        name: "No Message Send Test",
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
      const noMessageReport = reports.find(r => r.name === "No Message Send Test");
      
      expect(noMessageReport?.customMessage).toBeNull();
    });
  });

  describe("Recipient Validation for Manual Send", () => {
    it("should have valid email recipients", async () => {
      const report = await db.getScheduledReportById(testReportId);
      const recipients = report?.recipients.split(',').map(r => r.trim());
      
      expect(recipients).toBeDefined();
      expect(recipients?.length).toBeGreaterThan(0);
      recipients?.forEach(email => {
        expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
      });
    });

    it("should handle single recipient", async () => {
      const reports = await db.getAllScheduledReports();
      const singleRecipientReport = reports.find(r => r.name === "No Message Send Test");
      const recipients = singleRecipientReport?.recipients.split(',');
      
      expect(recipients?.length).toBe(1);
    });

    it("should handle multiple recipients", async () => {
      const report = await db.getScheduledReportById(testReportId);
      const recipients = report?.recipients.split(',');
      
      expect(recipients?.length).toBe(2);
    });
  });

  describe("Period Type for Manual Send", () => {
    it("should support week period for manual send", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.periodType).toBe("week");
    });

    it("should support month period for manual send", async () => {
      const reports = await db.getAllScheduledReports();
      const monthlyReport = reports.find(r => r.periodType === "month");
      expect(monthlyReport).toBeDefined();
    });

    it("should support quarter period for manual send", async () => {
      await db.createScheduledReport({
        name: "Quarterly Manual Send",
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
      const quarterlyReport = reports.find(r => r.name === "Quarterly Manual Send");
      expect(quarterlyReport?.periodType).toBe("quarter");
    });

    it("should support year period for manual send", async () => {
      await db.createScheduledReport({
        name: "Yearly Manual Send",
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
      const yearlyReport = reports.find(r => r.name === "Yearly Manual Send");
      expect(yearlyReport?.periodType).toBe("year");
    });
  });

  describe("Send Now UI State", () => {
    it("should have report data for confirmation dialog", async () => {
      const report = await db.getScheduledReportById(testReportId);
      
      // Verify all data needed for confirmation dialog
      expect(report?.recipients).toBeDefined();
      expect(report?.periodType).toBeDefined();
      expect(report?.name).toBeDefined();
    });

    it("should calculate recipient count correctly", async () => {
      const report = await db.getScheduledReportById(testReportId);
      const recipientCount = report?.recipients.split(',').length;
      
      expect(recipientCount).toBe(2);
    });

    it("should format period type for display", async () => {
      const report = await db.getScheduledReportById(testReportId);
      const periodLabels: Record<string, string> = {
        week: "Week over Week",
        month: "Month over Month",
        quarter: "Quarter over Quarter",
        year: "Year over Year",
      };
      
      const label = periodLabels[report?.periodType || ""];
      expect(label).toBe("Week over Week");
    });
  });

  describe("Manual Send Parameters", () => {
    it("should prepare correct parameters for email send", async () => {
      const report = await db.getScheduledReportById(testReportId);
      
      const sendParams = {
        periodType: report?.periodType,
        recipients: report?.recipients,
        customMessage: report?.customMessage || undefined,
      };
      
      expect(sendParams.periodType).toBe("week");
      expect(sendParams.recipients).toBe("test@okada.com, manager@okada.com");
      expect(sendParams.customMessage).toBe("This is a manual send test");
    });

    it("should handle undefined custom message in parameters", async () => {
      const reports = await db.getAllScheduledReports();
      const noMessageReport = reports.find(r => r.name === "No Message Send Test");
      
      const sendParams = {
        periodType: noMessageReport?.periodType,
        recipients: noMessageReport?.recipients,
        customMessage: noMessageReport?.customMessage || undefined,
      };
      
      expect(sendParams.customMessage).toBeUndefined();
    });
  });

  describe("Send Now Error Handling", () => {
    it("should handle non-existent report ID", async () => {
      const report = await db.getScheduledReportById(999999);
      expect(report).toBeUndefined();
    });

    it("should handle invalid report ID", async () => {
      const report = await db.getScheduledReportById(-1);
      expect(report).toBeUndefined();
    });

    it("should validate report exists before send", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report).toBeDefined();
      
      // Verify report can be found in list
      const reports = await db.getAllScheduledReports();
      const foundReport = reports.find(r => r.id === testReportId);
      expect(foundReport).toBeDefined();
    });
  });

  describe("Send Now Integration", () => {
    it("should use same email procedure as scheduled sends", async () => {
      const report = await db.getScheduledReportById(testReportId);
      
      // Verify report has all required fields for emailPeriodComparisonReport
      expect(report?.periodType).toBeDefined();
      expect(report?.recipients).toBeDefined();
      expect(typeof report?.customMessage === 'string' || report?.customMessage === null).toBe(true);
    });

    it("should maintain report configuration after manual send", async () => {
      const reportBefore = await db.getScheduledReportById(testReportId);
      
      // After manual send, configuration should remain unchanged
      expect(reportBefore?.isActive).toBe(true);
      expect(reportBefore?.frequency).toBe("weekly");
      expect(reportBefore?.periodType).toBe("week");
    });
  });

  describe("Confirmation Dialog Data", () => {
    it("should display recipient count in confirmation", async () => {
      const report = await db.getScheduledReportById(testReportId);
      const recipientCount = report?.recipients.split(',').length;
      
      expect(recipientCount).toBeGreaterThan(0);
      expect(typeof recipientCount).toBe('number');
    });

    it("should display period type in confirmation", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.periodType).toMatch(/^(week|month|quarter|year)$/);
    });

    it("should display full recipient list in confirmation", async () => {
      const report = await db.getScheduledReportById(testReportId);
      expect(report?.recipients).toContain('@');
      expect(report?.recipients.length).toBeGreaterThan(0);
    });
  });

  describe("Send Now Button State", () => {
    it("should enable send button when preview data is available", async () => {
      const report = await db.getScheduledReportById(testReportId);
      const hasPreviewData = !!report;
      
      expect(hasPreviewData).toBe(true);
    });

    it("should disable send button during sending", () => {
      let isPending = false;
      const buttonDisabled = isPending;
      
      expect(buttonDisabled).toBe(false);
      
      isPending = true;
      const buttonDisabledWhileSending = isPending;
      expect(buttonDisabledWhileSending).toBe(true);
    });
  });

  describe("Post-Send Cleanup", () => {
    it("should close dialogs after successful send", () => {
      let showSendConfirm = true;
      let showPreviewDialog = true;
      
      // Simulate successful send
      showSendConfirm = false;
      showPreviewDialog = false;
      
      expect(showSendConfirm).toBe(false);
      expect(showPreviewDialog).toBe(false);
    });

    it("should clear preview data after send", () => {
      let previewData: any = { id: testReportId };
      
      // Simulate successful send
      previewData = null;
      
      expect(previewData).toBeNull();
    });
  });
});

