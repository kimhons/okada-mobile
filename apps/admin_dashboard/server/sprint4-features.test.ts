import { describe, it, expect, beforeAll } from "vitest";
import * as db from "./db";

describe("Sprint 4: Incident Management, Feedback Analysis, and Rider Training", () => {
  let testIncidentId: number;
  let testFeedbackId: number;
  let testModuleId: number;
  let testQuestionId: number;

  // Incident Management Tests
  describe("Incident Management", () => {
    it("should create a new incident", async () => {
      const incident = await db.createIncident({
        incidentType: "accident",
        severity: "moderate",
        title: "Minor collision at intersection",
        description: "Rider had a minor collision with a vehicle at the intersection of Main St and 5th Ave",
        incidentDate: new Date(),
        reportedBy: 1,
        riderId: 1,
        location: "Main St & 5th Ave, Douala",
        latitude: "4.0511",
        longitude: "9.7679",
        priority: "medium",
      });

      expect(incident).toBeDefined();
      expect(incident?.id).toBeGreaterThan(0);
      testIncidentId = incident?.id || 0;
    });

    it("should retrieve incident by ID", async () => {
      const incident = await db.getIncidentById(testIncidentId);
      expect(incident).toBeDefined();
      expect(incident?.title).toBe("Minor collision at intersection");
      expect(incident?.severity).toBe("moderate");
    });

    it("should update incident status", async () => {
      const result = await db.updateIncidentStatus(
        testIncidentId,
        "investigating",
        1,
        "Investigation started"
      );
      expect(result).toBe(true);

      const updated = await db.getIncidentById(testIncidentId);
      expect(updated?.status).toBe("investigating");
    });

    it("should get incidents with filters", async () => {
      const incidents = await db.getIncidents({
        status: "investigating",
        severity: "moderate",
      });
      expect(Array.isArray(incidents)).toBe(true);
      expect(incidents.length).toBeGreaterThan(0);
    });

    it("should get incident statistics", async () => {
      const stats = await db.getIncidentStats();
      expect(stats).toBeDefined();
      expect(stats.totalIncidents).toBeGreaterThan(0);
      expect(typeof stats.pendingIncidents).toBe("number");
      expect(typeof stats.criticalIncidents).toBe("number");
    });

    it("should update incident details", async () => {
      const result = await db.updateIncident(testIncidentId, {
        compensationAmount: 50000,
        claimStatus: "pending",
        claimAmount: 100000,
      });
      expect(result).toBe(true);

      const updated = await db.getIncidentById(testIncidentId);
      expect(updated?.compensationAmount).toBe(50000);
      expect(updated?.claimStatus).toBe("pending");
    });
  });

  // Customer Feedback Tests
  describe("Customer Feedback Analysis", () => {
    it("should create customer feedback", async () => {
      const feedback = await db.createCustomerFeedback({
        customerId: 1,
        orderId: 1,
        riderId: 1,
        overallRating: 5,
        qualityPhotoRating: 5,
        deliveryRating: 5,
        serviceRating: 4,
        feedbackText: "Excellent service! The quality photos helped me choose the right product.",
        category: "quality_photos",
      });

      expect(feedback).toBeDefined();
      expect(feedback?.id).toBeGreaterThan(0);
      testFeedbackId = feedback?.id || 0;
    });

    it("should retrieve feedback by ID", async () => {
      const feedback = await db.getFeedbackById(testFeedbackId);
      expect(feedback).toBeDefined();
      expect(feedback?.overallRating).toBe(5);
      expect(feedback?.sentiment).toBe("positive");
    });

    it("should respond to feedback", async () => {
      const result = await db.respondToFeedback(
        testFeedbackId,
        "Thank you for your positive feedback! We're glad you enjoyed our service.",
        1
      );
      expect(result).toBe(true);

      const updated = await db.getFeedbackById(testFeedbackId);
      expect(updated?.status).toBe("responded");
      expect(updated?.responseText).toContain("Thank you");
    });

    it("should get feedback with filters", async () => {
      const feedback = await db.getCustomerFeedback({
        sentiment: "positive",
        category: "quality_photos",
      });
      expect(Array.isArray(feedback)).toBe(true);
      expect(feedback.length).toBeGreaterThan(0);
    });

    it("should get feedback statistics", async () => {
      const stats = await db.getFeedbackStats();
      expect(stats).toBeDefined();
      expect(stats.totalFeedback).toBeGreaterThan(0);
      expect(stats.averageRating).toBeGreaterThan(0);
      expect(stats.averageRating).toBeLessThanOrEqual(5);
      expect(typeof stats.positiveFeedback).toBe("number");
      expect(typeof stats.negativeFeedback).toBe("number");
    });

    it("should get feedback trends", async () => {
      const trends = await db.getFeedbackTrends("month");
      expect(Array.isArray(trends)).toBe(true);
      // Trends might be empty if no historical data
    });

    it("should create negative feedback with correct sentiment", async () => {
      const negativeFeedback = await db.createCustomerFeedback({
        customerId: 2,
        orderId: 2,
        riderId: 2,
        overallRating: 2,
        qualityPhotoRating: 1,
        deliveryRating: 2,
        feedbackText: "Poor quality photos, couldn't see product details clearly.",
        category: "quality_photos",
      });

      expect(negativeFeedback).toBeDefined();
      const retrieved = await db.getFeedbackById(negativeFeedback?.id || 0);
      expect(retrieved?.sentiment).toBe("negative");
    });
  });

  // Rider Training Tests
  describe("Rider Training Progress Tracker", () => {
    it("should create a training module", async () => {
      const module = await db.createTrainingModule({
        title: "Safe Riding Practices",
        description: "Learn essential safety techniques for urban delivery",
        category: "safety",
        contentType: "video",
        contentUrl: "https://example.com/training/safety-basics.mp4",
        duration: 30,
        isMandatory: 1,
        minPassingScore: 80,
      });

      expect(module).toBeDefined();
      expect(module?.id).toBeGreaterThan(0);
      testModuleId = module?.id || 0;
    });

    it("should retrieve training module by ID", async () => {
      const module = await db.getTrainingModuleById(testModuleId);
      expect(module).toBeDefined();
      expect(module?.title).toBe("Safe Riding Practices");
      expect(module?.isMandatory).toBe(1);
    });

    it("should get training modules with filters", async () => {
      const modules = await db.getTrainingModules({
        category: "safety",
        isMandatory: true,
      });
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThan(0);
    });

    it("should create quiz questions", async () => {
      const question = await db.createQuizQuestion({
        moduleId: testModuleId,
        questionText: "What is the recommended safe following distance in urban areas?",
        questionType: "multiple_choice",
        options: JSON.stringify([
          "1 second",
          "2 seconds",
          "3 seconds",
          "5 seconds"
        ]),
        correctAnswer: "3 seconds",
        explanation: "A 3-second following distance gives you enough time to react to sudden stops.",
        points: 10,
      });

      expect(question).toBeDefined();
      expect(question?.id).toBeGreaterThan(0);
      testQuestionId = question?.id || 0;
    });

    it("should get quiz questions for a module", async () => {
      const questions = await db.getModuleQuizQuestions(testModuleId);
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      expect(questions[0].questionText).toContain("following distance");
    });

    it("should start training module for rider", async () => {
      const result = await db.startTrainingModule(1, testModuleId);
      expect(result).toBeDefined();
      expect(result?.riderId).toBe(1);
      expect(result?.moduleId).toBe(testModuleId);
      expect(result?.status).toBe("in_progress");
    });

    it("should get rider training progress", async () => {
      const progress = await db.getRiderTrainingProgress(1);
      expect(Array.isArray(progress)).toBe(true);
      expect(progress.length).toBeGreaterThan(0);
    });

    it("should submit quiz answers and calculate score", async () => {
      const result = await db.submitQuizAnswers(1, testModuleId, [
        { questionId: testQuestionId, answer: "3 seconds" }
      ]);

      expect(result).toBeDefined();
      expect(result?.score).toBe(100); // 1 correct answer out of 1
      expect(result?.passed).toBe(true); // Score >= 80%
    });

    it("should issue certificate for passing quiz", async () => {
      const progress = await db.getRiderTrainingProgress(1);
      const moduleProgress = progress.find(p => p.moduleId === testModuleId);
      expect(moduleProgress?.status).toBe("completed");
      expect(moduleProgress?.certificateIssued).toBe(1);
    });

    it("should get training statistics", async () => {
      const stats = await db.getTrainingStats();
      expect(stats).toBeDefined();
      expect(stats.totalModules).toBeGreaterThan(0);
      expect(typeof stats.mandatoryModules).toBe("number");
      expect(typeof stats.totalEnrollments).toBe("number");
      expect(typeof stats.completedModules).toBe("number");
    });

    it("should get rider completion rate", async () => {
      const completionRate = await db.getRiderTrainingCompletionRate(1);
      expect(completionRate).toBeDefined();
      expect(completionRate.totalModules).toBeGreaterThan(0);
      expect(completionRate.completedModules).toBeGreaterThan(0);
      expect(completionRate.completionPercentage).toBeGreaterThan(0);
      expect(completionRate.completionPercentage).toBeLessThanOrEqual(100);
    });

    it("should update training module", async () => {
      const result = await db.updateTrainingModule(testModuleId, {
        duration: 45,
        isActive: 1,
      });
      expect(result).toBe(true);

      const updated = await db.getTrainingModuleById(testModuleId);
      expect(updated?.duration).toBe(45);
    });

    it("should handle failed quiz attempt", async () => {
      // Create a new module for testing failure
      const failModule = await db.createTrainingModule({
        title: "Advanced Safety",
        category: "safety",
        contentType: "quiz",
        isMandatory: 1,
        minPassingScore: 80,
      });

      // Create multiple questions
      await db.createQuizQuestion({
        moduleId: failModule?.id || 0,
        questionText: "Question 1",
        questionType: "multiple_choice",
        correctAnswer: "A",
        points: 10,
      });
      await db.createQuizQuestion({
        moduleId: failModule?.id || 0,
        questionText: "Question 2",
        questionType: "multiple_choice",
        correctAnswer: "B",
        points: 10,
      });

      // Start module
      await db.startTrainingModule(1, failModule?.id || 0);

      // Submit wrong answers
      const questions = await db.getModuleQuizQuestions(failModule?.id || 0);
      const result = await db.submitQuizAnswers(1, failModule?.id || 0, [
        { questionId: questions[0].id, answer: "Wrong" },
        { questionId: questions[1].id, answer: "Wrong" }
      ]);

      expect(result?.score).toBe(0);
      expect(result?.passed).toBe(false);
      
      const progress = await db.getRiderTrainingProgress(1);
      const moduleProgress = progress.find(p => p.moduleId === failModule?.id);
      expect(moduleProgress?.status).toBe("failed");
      expect(moduleProgress?.certificateIssued).toBe(0);
    });
  });
});
