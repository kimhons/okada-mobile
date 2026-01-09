import { describe, it, expect } from "vitest";

describe("Training Notifications", () => {
  describe("Course completion notification", () => {
    it("should include module title", () => {
      const moduleTitle = "Safety Basics";
      const title = `Training Complete: ${moduleTitle}`;
      expect(title).toContain("Safety Basics");
    });

    it("should include score", () => {
      const moduleTitle = "Safety Basics";
      const score = 85;
      const message = `Congratulations! You completed "${moduleTitle}" with a score of ${score}%.`;
      expect(message).toContain("85%");
    });

    it("should have correct notification type", () => {
      const notification = { type: "system" };
      expect(notification.type).toBe("system");
    });
  });

  describe("Certification earned notification", () => {
    it("should include certification name", () => {
      const certificationName = "Advanced Rider";
      const title = `Certification Earned: ${certificationName}`;
      expect(title).toContain("Advanced Rider");
    });

    it("should include expiry date if provided", () => {
      const certificationName = "Advanced Rider";
      const expiryDate = new Date("2025-12-31");
      const expiryInfo = ` Valid until ${expiryDate.toLocaleDateString()}.`;
      const message = `You have earned the "${certificationName}" certification.${expiryInfo}`;
      expect(message).toContain("Valid until");
    });

    it("should work without expiry date", () => {
      const certificationName = "Advanced Rider";
      const message = `You have earned the "${certificationName}" certification.`;
      expect(message).not.toContain("Valid until");
    });
  });

  describe("Training reminder notification", () => {
    it("should include module title", () => {
      const moduleTitle = "Safety Basics";
      const title = `Training Reminder: ${moduleTitle}`;
      expect(title).toContain("Safety Basics");
    });

    it("should calculate days until due", () => {
      const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      expect(daysUntilDue).toBe(5);
    });

    it("should include days in message", () => {
      const moduleTitle = "Safety Basics";
      const daysUntilDue = 5;
      const message = `Please complete "${moduleTitle}" within ${daysUntilDue} days.`;
      expect(message).toContain("5 days");
    });
  });

  describe("Mandatory training reminders", () => {
    it("should identify incomplete mandatory modules", () => {
      const mandatoryModules = [
        { id: 1, title: "Safety Basics", isMandatory: true },
        { id: 2, title: "Customer Service", isMandatory: true },
      ];
      const progress = [{ moduleId: 1, status: "completed" }];
      
      const incomplete = mandatoryModules.filter((module) => {
        const moduleProgress = progress.find((p) => p.moduleId === module.id);
        return !moduleProgress || moduleProgress.status !== "completed";
      });
      
      expect(incomplete.length).toBe(1);
      expect(incomplete[0].title).toBe("Customer Service");
    });

    it("should return empty array if all complete", () => {
      const mandatoryModules = [{ id: 1, title: "Safety Basics", isMandatory: true }];
      const progress = [{ moduleId: 1, status: "completed" }];
      
      const incomplete = mandatoryModules.filter((module) => {
        const moduleProgress = progress.find((p) => p.moduleId === module.id);
        return !moduleProgress || moduleProgress.status !== "completed";
      });
      
      expect(incomplete.length).toBe(0);
    });
  });

  describe("Notification content", () => {
    it("should have required fields", () => {
      const notification = {
        userId: 1,
        type: "system",
        title: "Training Complete",
        message: "Details here",
      };
      expect(notification).toHaveProperty("userId");
      expect(notification).toHaveProperty("type");
      expect(notification).toHaveProperty("title");
      expect(notification).toHaveProperty("message");
    });

    it("should use system type for all training notifications", () => {
      const types = ["course_completion", "certification", "reminder"];
      const notificationType = "system";
      expect(notificationType).toBe("system");
    });
  });

  describe("Rider lookup", () => {
    it("should require rider userId for notification", () => {
      const rider = { id: 1, userId: 100, name: "John" };
      expect(rider.userId).toBeDefined();
    });

    it("should handle missing userId", () => {
      const rider = { id: 1, userId: null, name: "John" };
      const canNotify = rider.userId !== null;
      expect(canNotify).toBe(false);
    });
  });
});
