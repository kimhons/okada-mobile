import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";
import { users } from "../drizzle/schema";

describe("Reports & Export Features", () => {
  let testUserId: number;
  let testReportId: number;
  let testScheduledReportId: number;
  let testExportId: number;

  beforeAll(async () => {
    // Create a test user for all operations
    const database = await db.getDb();
    if (!database) throw new Error("Database not available");

    const userResult = await database
      .insert(users)
      .values({
        openId: `test-reports-${Date.now()}`,
        name: "Test Reports User",
        email: "reports@test.com",
        role: "admin",
      });

    testUserId = Number(userResult[0].insertId);
  });

  // ============================================================================
  // Custom Reports Tests
  // ============================================================================

  describe("Custom Reports", () => {
    it("should create a new report", async () => {
      await db.createReport({
        name: "Test Revenue Report",
        description: "Monthly revenue analysis",
        reportType: "revenue",
        chartType: "bar",
        isPublic: false,
        createdBy: testUserId,
      });

      const reports = await db.getAllReports();
      const createdReport = reports.find(r => r.name === "Test Revenue Report");
      
      expect(createdReport).toBeDefined();
      expect(createdReport?.reportType).toBe("revenue");
      expect(createdReport?.chartType).toBe("bar");
      expect(createdReport?.isPublic).toBe(false);
      
      testReportId = createdReport!.id;
    });

    it("should get report by ID", async () => {
      const report = await db.getReportById(testReportId);
      
      expect(report).toBeDefined();
      expect(report?.name).toBe("Test Revenue Report");
      expect(report?.reportType).toBe("revenue");
    });

    it("should filter reports by type", async () => {
      await db.createReport({
        name: "Test Orders Report",
        reportType: "orders",
        chartType: "table",
        createdBy: testUserId,
      });

      const revenueReports = await db.getAllReports({ reportType: "revenue" });
      const ordersReports = await db.getAllReports({ reportType: "orders" });
      
      expect(revenueReports.length).toBeGreaterThan(0);
      expect(ordersReports.length).toBeGreaterThan(0);
      expect(revenueReports.every(r => r.reportType === "revenue")).toBe(true);
      expect(ordersReports.every(r => r.reportType === "orders")).toBe(true);
    });

    it("should filter reports by visibility", async () => {
      await db.createReport({
        name: "Public Test Report",
        reportType: "users",
        chartType: "pie",
        isPublic: true,
        createdBy: testUserId,
      });

      const publicReports = await db.getAllReports({ isPublic: true });
      const privateReports = await db.getAllReports({ isPublic: false });
      
      expect(publicReports.length).toBeGreaterThan(0);
      expect(privateReports.length).toBeGreaterThan(0);
      expect(publicReports.every(r => r.isPublic === true)).toBe(true);
      expect(privateReports.every(r => r.isPublic === false)).toBe(true);
    });

    it("should search reports by name", async () => {
      const searchResults = await db.getAllReports({ search: "Revenue" });
      
      expect(searchResults.length).toBeGreaterThan(0);
      expect(searchResults.some(r => r.name.includes("Revenue"))).toBe(true);
    });

    it("should update report", async () => {
      await db.updateReport(testReportId, {
        name: "Updated Revenue Report",
        description: "Updated description",
        isPublic: true,
      });

      const updatedReport = await db.getReportById(testReportId);
      
      expect(updatedReport?.name).toBe("Updated Revenue Report");
      expect(updatedReport?.description).toBe("Updated description");
      expect(updatedReport?.isPublic).toBe(true);
    });

    it("should delete report", async () => {
      const tempReport = await db.createReport({
        name: "Temp Report",
        reportType: "products",
        chartType: "line",
        createdBy: testUserId,
      });

      const reports = await db.getAllReports();
      const tempReportId = reports.find(r => r.name === "Temp Report")?.id;
      
      expect(tempReportId).toBeDefined();
      
      await db.deleteReport(tempReportId!);
      
      const deletedReport = await db.getReportById(tempReportId!);
      expect(deletedReport).toBeUndefined();
    });
  });

  // ============================================================================
  // Scheduled Reports Tests
  // ============================================================================

  describe("Scheduled Reports", () => {
    it("should create a scheduled report", async () => {
      await db.createScheduledReport({
        reportId: testReportId,
        name: "Weekly Revenue Schedule",
        frequency: "weekly",
        dayOfWeek: 1, // Monday
        time: "09:00",
        recipients: "admin@test.com, manager@test.com",
        format: "pdf",
        isActive: true,
        createdBy: testUserId,
      });

      const schedules = await db.getAllScheduledReports();
      const createdSchedule = schedules.find(s => s.name === "Weekly Revenue Schedule");
      
      expect(createdSchedule).toBeDefined();
      expect(createdSchedule?.frequency).toBe("weekly");
      expect(createdSchedule?.dayOfWeek).toBe(1);
      expect(createdSchedule?.format).toBe("pdf");
      expect(createdSchedule?.isActive).toBe(true);
      
      testScheduledReportId = createdSchedule!.id;
    });

    it("should get scheduled report by ID", async () => {
      const schedule = await db.getScheduledReportById(testScheduledReportId);
      
      expect(schedule).toBeDefined();
      expect(schedule?.name).toBe("Weekly Revenue Schedule");
      expect(schedule?.reportId).toBe(testReportId);
    });

    it("should filter scheduled reports by frequency", async () => {
      await db.createScheduledReport({
        reportId: testReportId,
        name: "Daily Orders Schedule",
        frequency: "daily",
        time: "08:00",
        recipients: "daily@test.com",
        format: "csv",
        createdBy: testUserId,
      });

      const weeklySchedules = await db.getAllScheduledReports({ frequency: "weekly" });
      const dailySchedules = await db.getAllScheduledReports({ frequency: "daily" });
      
      expect(weeklySchedules.length).toBeGreaterThan(0);
      expect(dailySchedules.length).toBeGreaterThan(0);
      expect(weeklySchedules.every(s => s.frequency === "weekly")).toBe(true);
      expect(dailySchedules.every(s => s.frequency === "daily")).toBe(true);
    });

    it("should filter scheduled reports by active status", async () => {
      await db.createScheduledReport({
        reportId: testReportId,
        name: "Inactive Schedule",
        frequency: "monthly",
        dayOfMonth: 1,
        time: "10:00",
        recipients: "inactive@test.com",
        format: "excel",
        isActive: false,
        createdBy: testUserId,
      });

      const activeSchedules = await db.getAllScheduledReports({ isActive: true });
      const inactiveSchedules = await db.getAllScheduledReports({ isActive: false });
      
      expect(activeSchedules.length).toBeGreaterThan(0);
      expect(inactiveSchedules.length).toBeGreaterThan(0);
      expect(activeSchedules.every(s => s.isActive === true)).toBe(true);
      expect(inactiveSchedules.every(s => s.isActive === false)).toBe(true);
    });

    it("should update scheduled report", async () => {
      await db.updateScheduledReport(testScheduledReportId, {
        name: "Updated Weekly Schedule",
        frequency: "weekly",
        dayOfWeek: 5, // Friday
        isActive: false,
      });

      const updatedSchedule = await db.getScheduledReportById(testScheduledReportId);
      
      expect(updatedSchedule?.name).toBe("Updated Weekly Schedule");
      expect(updatedSchedule?.dayOfWeek).toBe(5);
      expect(updatedSchedule?.isActive).toBe(false);
    });

    it("should delete scheduled report", async () => {
      const tempSchedule = await db.createScheduledReport({
        reportId: testReportId,
        name: "Temp Schedule",
        frequency: "daily",
        time: "12:00",
        recipients: "temp@test.com",
        format: "pdf",
        createdBy: testUserId,
      });

      const schedules = await db.getAllScheduledReports();
      const tempScheduleId = schedules.find(s => s.name === "Temp Schedule")?.id;
      
      expect(tempScheduleId).toBeDefined();
      
      await db.deleteScheduledReport(tempScheduleId!);
      
      const deletedSchedule = await db.getScheduledReportById(tempScheduleId!);
      expect(deletedSchedule).toBeUndefined();
    });
  });

  // ============================================================================
  // Export History Tests
  // ============================================================================

  describe("Export History", () => {
    it("should create an export history record", async () => {
      await db.createExportHistory({
        filename: "orders_export_123.csv",
        exportType: "orders",
        format: "csv",
        recordCount: 150,
        fileSize: 50000,
        status: "completed",
        createdBy: testUserId,
      });

      const exports = await db.getAllExportHistory();
      const createdExport = exports.find(e => e.filename === "orders_export_123.csv");
      
      expect(createdExport).toBeDefined();
      expect(createdExport?.exportType).toBe("orders");
      expect(createdExport?.format).toBe("csv");
      expect(createdExport?.recordCount).toBe(150);
      expect(createdExport?.status).toBe("completed");
      
      testExportId = createdExport!.id;
    });

    it("should get export history by ID", async () => {
      const exportRecord = await db.getExportHistoryById(testExportId);
      
      expect(exportRecord).toBeDefined();
      expect(exportRecord?.filename).toBe("orders_export_123.csv");
      expect(exportRecord?.exportType).toBe("orders");
    });

    it("should filter exports by type", async () => {
      await db.createExportHistory({
        filename: "users_export_456.xlsx",
        exportType: "users",
        format: "excel",
        recordCount: 200,
        status: "completed",
        createdBy: testUserId,
      });

      const ordersExports = await db.getAllExportHistory({ exportType: "orders" });
      const usersExports = await db.getAllExportHistory({ exportType: "users" });
      
      expect(ordersExports.length).toBeGreaterThan(0);
      expect(usersExports.length).toBeGreaterThan(0);
      expect(ordersExports.every(e => e.exportType === "orders")).toBe(true);
      expect(usersExports.every(e => e.exportType === "users")).toBe(true);
    });

    it("should filter exports by format", async () => {
      await db.createExportHistory({
        filename: "products_export_789.pdf",
        exportType: "products",
        format: "pdf",
        recordCount: 50,
        status: "completed",
        createdBy: testUserId,
      });

      const csvExports = await db.getAllExportHistory({ format: "csv" });
      const pdfExports = await db.getAllExportHistory({ format: "pdf" });
      
      expect(csvExports.length).toBeGreaterThan(0);
      expect(pdfExports.length).toBeGreaterThan(0);
      expect(csvExports.every(e => e.format === "csv")).toBe(true);
      expect(pdfExports.every(e => e.format === "pdf")).toBe(true);
    });

    it("should filter exports by status", async () => {
      await db.createExportHistory({
        filename: "pending_export.csv",
        exportType: "riders",
        format: "csv",
        status: "pending",
        createdBy: testUserId,
      });

      await db.createExportHistory({
        filename: "failed_export.xlsx",
        exportType: "sellers",
        format: "excel",
        status: "failed",
        errorMessage: "Export failed due to timeout",
        createdBy: testUserId,
      });

      const completedExports = await db.getAllExportHistory({ status: "completed" });
      const pendingExports = await db.getAllExportHistory({ status: "pending" });
      const failedExports = await db.getAllExportHistory({ status: "failed" });
      
      expect(completedExports.length).toBeGreaterThan(0);
      expect(pendingExports.length).toBeGreaterThan(0);
      expect(failedExports.length).toBeGreaterThan(0);
      expect(completedExports.every(e => e.status === "completed")).toBe(true);
      expect(pendingExports.every(e => e.status === "pending")).toBe(true);
      expect(failedExports.every(e => e.status === "failed")).toBe(true);
    });

    it("should update export history status", async () => {
      const pendingExports = await db.getAllExportHistory({ status: "pending" });
      const pendingExportId = pendingExports[0]?.id;
      
      expect(pendingExportId).toBeDefined();
      
      await db.updateExportHistory(pendingExportId!, {
        status: "completed",
        recordCount: 100,
        fileSize: 75000,
        downloadUrl: "https://example.com/download/pending_export.csv",
      });

      const updatedExport = await db.getExportHistoryById(pendingExportId!);
      
      expect(updatedExport?.status).toBe("completed");
      expect(updatedExport?.recordCount).toBe(100);
      expect(updatedExport?.fileSize).toBe(75000);
      expect(updatedExport?.downloadUrl).toBe("https://example.com/download/pending_export.csv");
    });

    it("should delete export history", async () => {
      const tempExport = await db.createExportHistory({
        filename: "temp_export.csv",
        exportType: "transactions",
        format: "csv",
        status: "completed",
        createdBy: testUserId,
      });

      const exports = await db.getAllExportHistory();
      const tempExportId = exports.find(e => e.filename === "temp_export.csv")?.id;
      
      expect(tempExportId).toBeDefined();
      
      await db.deleteExportHistory(tempExportId!);
      
      const deletedExport = await db.getExportHistoryById(tempExportId!);
      expect(deletedExport).toBeUndefined();
    });
  });
});

