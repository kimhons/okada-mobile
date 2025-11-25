import { describe, it, expect } from "vitest";
import { 
  getAllTemplates, 
  getTemplatesByCategory, 
  getTemplateById,
  getTemplatesByFrequency,
  type ReportTemplate 
} from "./reportTemplates";

describe("Sprint 6: Report Templates Library", () => {
  describe("Template Retrieval", () => {
    it("should retrieve all 15 templates", () => {
      const templates = getAllTemplates();
      
      expect(templates).toBeDefined();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBe(15);
    });

    it("should have templates in all categories", () => {
      const templates = getAllTemplates();
      const categories = new Set(templates.map(t => t.category));
      
      expect(categories.has("sales")).toBe(true);
      expect(categories.has("operations")).toBe(true);
      expect(categories.has("finance")).toBe(true);
      expect(categories.has("quality")).toBe(true);
      expect(categories.has("platform")).toBe(true);
    });

    it("should retrieve templates by category - sales", () => {
      const salesTemplates = getTemplatesByCategory("sales");
      
      expect(salesTemplates).toBeDefined();
      expect(Array.isArray(salesTemplates)).toBe(true);
      expect(salesTemplates.length).toBeGreaterThan(0);
      expect(salesTemplates.every(t => t.category === "sales")).toBe(true);
    });

    it("should retrieve templates by category - operations", () => {
      const operationsTemplates = getTemplatesByCategory("operations");
      
      expect(operationsTemplates).toBeDefined();
      expect(operationsTemplates.length).toBeGreaterThan(0);
      expect(operationsTemplates.every(t => t.category === "operations")).toBe(true);
    });

    it("should retrieve templates by category - finance", () => {
      const financeTemplates = getTemplatesByCategory("finance");
      
      expect(financeTemplates).toBeDefined();
      expect(financeTemplates.length).toBeGreaterThan(0);
      expect(financeTemplates.every(t => t.category === "finance")).toBe(true);
    });

    it("should retrieve templates by category - quality", () => {
      const qualityTemplates = getTemplatesByCategory("quality");
      
      expect(qualityTemplates).toBeDefined();
      expect(qualityTemplates.length).toBeGreaterThan(0);
      expect(qualityTemplates.every(t => t.category === "quality")).toBe(true);
    });

    it("should retrieve templates by category - platform", () => {
      const platformTemplates = getTemplatesByCategory("platform");
      
      expect(platformTemplates).toBeDefined();
      expect(platformTemplates.length).toBeGreaterThan(0);
      expect(platformTemplates.every(t => t.category === "platform")).toBe(true);
    });

    it("should retrieve specific template by ID", () => {
      const template = getTemplateById("daily-sales-summary");
      
      expect(template).toBeDefined();
      expect(template?.id).toBe("daily-sales-summary");
      expect(template?.name).toBe("Daily Sales Summary");
      expect(template?.category).toBe("sales");
      expect(template?.reportType).toBe("orders");
    });

    it("should return undefined for non-existent template ID", () => {
      const template = getTemplateById("non-existent-template");
      
      expect(template).toBeUndefined();
    });

    it("should retrieve templates by frequency - daily", () => {
      const dailyTemplates = getTemplatesByFrequency("daily");
      
      expect(dailyTemplates).toBeDefined();
      expect(Array.isArray(dailyTemplates)).toBe(true);
      expect(dailyTemplates.every(t => t.frequency === "daily")).toBe(true);
    });

    it("should retrieve templates by frequency - weekly", () => {
      const weeklyTemplates = getTemplatesByFrequency("weekly");
      
      expect(weeklyTemplates).toBeDefined();
      expect(weeklyTemplates.length).toBeGreaterThan(0);
      expect(weeklyTemplates.every(t => t.frequency === "weekly")).toBe(true);
    });

    it("should retrieve templates by frequency - monthly", () => {
      const monthlyTemplates = getTemplatesByFrequency("monthly");
      
      expect(monthlyTemplates).toBeDefined();
      expect(monthlyTemplates.length).toBeGreaterThan(0);
      expect(monthlyTemplates.every(t => t.frequency === "monthly")).toBe(true);
    });
  });

  describe("Template Structure Validation", () => {
    it("should have all required fields in each template", () => {
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.reportType).toBeDefined();
        expect(template.filters).toBeDefined();
        expect(template.metrics).toBeDefined();
        expect(Array.isArray(template.metrics)).toBe(true);
        expect(template.icon).toBeDefined();
      });
    });

    it("should have valid report types", () => {
      const templates = getAllTemplates();
      const validTypes = ["orders", "revenue", "riders", "users", "products", "incidents", "feedback", "training", "custom"];
      
      templates.forEach(template => {
        expect(validTypes).toContain(template.reportType);
      });
    });

    it("should have valid categories", () => {
      const templates = getAllTemplates();
      const validCategories = ["sales", "operations", "finance", "quality", "platform"];
      
      templates.forEach(template => {
        expect(validCategories).toContain(template.category);
      });
    });

    it("should have non-empty metrics arrays", () => {
      const templates = getAllTemplates();
      
      templates.forEach(template => {
        expect(template.metrics.length).toBeGreaterThan(0);
      });
    });

    it("should have valid frequency values", () => {
      const templates = getAllTemplates();
      const validFrequencies = ["daily", "weekly", "monthly", "quarterly", undefined];
      
      templates.forEach(template => {
        expect(validFrequencies).toContain(template.frequency);
      });
    });
  });

  describe("Specific Template Validation", () => {
    it("should have Daily Sales Summary with correct configuration", () => {
      const template = getTemplateById("daily-sales-summary");
      
      expect(template).toBeDefined();
      expect(template?.frequency).toBe("daily");
      expect(template?.metrics).toContain("total_orders");
      expect(template?.metrics).toContain("total_revenue");
      expect(template?.groupBy).toBe("hour");
    });

    it("should have Weekly Revenue Report with correct configuration", () => {
      const template = getTemplateById("weekly-revenue-report");
      
      expect(template).toBeDefined();
      expect(template?.frequency).toBe("weekly");
      expect(template?.reportType).toBe("revenue");
      expect(template?.groupBy).toBe("day");
    });

    it("should have Monthly Rider Performance with correct configuration", () => {
      const template = getTemplateById("monthly-rider-performance");
      
      expect(template).toBeDefined();
      expect(template?.frequency).toBe("monthly");
      expect(template?.reportType).toBe("riders");
      expect(template?.metrics).toContain("deliveries_completed");
      expect(template?.metrics).toContain("avg_rating");
    });

    it("should have Customer Satisfaction Report with correct configuration", () => {
      const template = getTemplateById("customer-satisfaction-monthly");
      
      expect(template).toBeDefined();
      expect(template?.category).toBe("quality");
      expect(template?.reportType).toBe("feedback");
      expect(template?.metrics).toContain("sentiment_score");
    });

    it("should have Platform Health Report with correct configuration", () => {
      const template = getTemplateById("platform-health-report");
      
      expect(template).toBeDefined();
      expect(template?.category).toBe("platform");
      expect(template?.frequency).toBe("weekly");
      expect(template?.metrics).toContain("active_users");
      expect(template?.metrics).toContain("uptime");
    });
  });

  describe("Template Count by Category", () => {
    it("should have 4 sales templates", () => {
      const salesTemplates = getTemplatesByCategory("sales");
      expect(salesTemplates.length).toBe(4);
    });

    it("should have 4 operations templates", () => {
      const operationsTemplates = getTemplatesByCategory("operations");
      expect(operationsTemplates.length).toBe(4);
    });

    it("should have 2 finance templates", () => {
      const financeTemplates = getTemplatesByCategory("finance");
      expect(financeTemplates.length).toBe(2);
    });

    it("should have 2 quality templates", () => {
      const qualityTemplates = getTemplatesByCategory("quality");
      expect(qualityTemplates.length).toBe(2);
    });

    it("should have 3 platform templates", () => {
      const platformTemplates = getTemplatesByCategory("platform");
      expect(platformTemplates.length).toBe(3);
    });
  });
});
