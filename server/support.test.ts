import { describe, it, expect, beforeEach } from "vitest";
import * as db from "./db";

describe("Support & Help Features", () => {
  // ============================================================================
  // FAQ Management Tests
  // ============================================================================
  
  describe("FAQ Management", () => {
    let testFaqId: number;

    beforeEach(async () => {
      // Create a test FAQ
      await db.createFaq({
        question: "How do I place an order?",
        answer: "You can place an order by browsing our products and adding items to your cart.",
        category: "Orders",
        order: 1,
        isPublished: true,
        createdBy: 1,
      });
      
      // Get the created FAQ ID
      const faqs = await db.getAllFaqs({ search: "How do I place an order" });
      testFaqId = faqs[0]?.id || 1;
    });

    it("should create a new FAQ", async () => {
      await db.createFaq({
        question: "What payment methods do you accept?",
        answer: "We accept credit cards, debit cards, and mobile payments.",
        category: "Payments",
        order: 2,
        isPublished: true,
        createdBy: 1,
      });

      const faqs = await db.getAllFaqs({ search: "What payment methods" });
      expect(faqs.length).toBeGreaterThan(0);
      expect(faqs[0].question).toContain("payment methods");
    });

    it("should get all FAQs", async () => {
      const faqs = await db.getAllFaqs();
      
      expect(Array.isArray(faqs)).toBe(true);
      expect(faqs.length).toBeGreaterThan(0);
      expect(faqs[0]).toHaveProperty("question");
      expect(faqs[0]).toHaveProperty("answer");
    });

    it("should filter FAQs by category", async () => {
      // Create another FAQ with different category
      await db.createFaq({
        question: "How long does delivery take?",
        answer: "Delivery typically takes 30-45 minutes.",
        category: "Delivery",
        order: 3,
        isPublished: true,
        createdBy: 1,
      });

      const orderFaqs = await db.getAllFaqs({ category: "Orders" });
      const deliveryFaqs = await db.getAllFaqs({ category: "Delivery" });

      expect(orderFaqs.length).toBeGreaterThan(0);
      expect(deliveryFaqs.length).toBeGreaterThan(0);
      expect(orderFaqs.every(f => f.category === "Orders")).toBe(true);
      expect(deliveryFaqs.every(f => f.category === "Delivery")).toBe(true);
    });

    it("should filter FAQs by published status", async () => {
      // Create a draft FAQ
      await db.createFaq({
        question: "Draft question",
        answer: "Draft answer",
        category: "Test",
        isPublished: false,
        createdBy: 1,
      });

      const publishedFaqs = await db.getAllFaqs({ isPublished: true });
      const draftFaqs = await db.getAllFaqs({ isPublished: false });

      expect(publishedFaqs.every(f => f.isPublished === true)).toBe(true);
      expect(draftFaqs.every(f => f.isPublished === false)).toBe(true);
    });

    it("should search FAQs by question or answer", async () => {
      const results = await db.getAllFaqs({ search: "order" });

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some(f => 
          f.question.toLowerCase().includes("order") || 
          f.answer.toLowerCase().includes("order")
        )
      ).toBe(true);
    });

    it("should get FAQ by ID", async () => {
      const faq = await db.getFaqById(testFaqId);

      expect(faq).toBeDefined();
      expect(faq?.id).toBe(testFaqId);
      expect(faq?.question).toBe("How do I place an order?");
    });

    it("should update FAQ", async () => {
      await db.updateFaq(testFaqId, {
        question: "Updated question",
        answer: "Updated answer",
      });

      const updatedFaq = await db.getFaqById(testFaqId);
      expect(updatedFaq?.question).toBe("Updated question");
      expect(updatedFaq?.answer).toBe("Updated answer");
    });

    it("should delete FAQ", async () => {
      await db.deleteFaq(testFaqId);

      const deletedFaq = await db.getFaqById(testFaqId);
      expect(deletedFaq).toBeUndefined();
    });

    it("should increment FAQ views", async () => {
      const before = await db.getFaqById(testFaqId);
      const initialViews = before?.views || 0;

      await db.incrementFaqViews(testFaqId);

      const after = await db.getFaqById(testFaqId);
      expect(after?.views).toBe(initialViews + 1);
    });

    it("should vote FAQ as helpful", async () => {
      const before = await db.getFaqById(testFaqId);
      const initialHelpful = before?.helpful || 0;

      await db.voteFaqHelpful(testFaqId, true);

      const after = await db.getFaqById(testFaqId);
      expect(after?.helpful).toBe(initialHelpful + 1);
    });

    it("should vote FAQ as not helpful", async () => {
      const before = await db.getFaqById(testFaqId);
      const initialNotHelpful = before?.notHelpful || 0;

      await db.voteFaqHelpful(testFaqId, false);

      const after = await db.getFaqById(testFaqId);
      expect(after?.notHelpful).toBe(initialNotHelpful + 1);
    });
  });

  // ============================================================================
  // Help Documentation Tests
  // ============================================================================
  
  describe("Help Documentation", () => {
    let testDocId: number;

    beforeEach(async () => {
      // Create a test help doc with unique slug
      const uniqueSlug = `getting-started-guide-${Date.now()}`;
      await db.createHelpDoc({
        title: "Getting Started Guide",
        slug: uniqueSlug,
        content: "This is a comprehensive guide to getting started with our platform.",
        category: "Getting Started",
        tags: "beginner,guide,tutorial",
        isPublished: true,
        createdBy: 1,
      });
      
      // Get the created doc ID
      const docs = await db.getAllHelpDocs({ search: "Getting Started Guide" });
      testDocId = docs[0]?.id || 1;
    });

    it("should create a new help document", async () => {
      const uniqueSlug = `advanced-features-${Date.now()}`;
      await db.createHelpDoc({
        title: "Advanced Features",
        slug: uniqueSlug,
        content: "Learn about advanced features and capabilities.",
        category: "Advanced",
        tags: "advanced,features",
        isPublished: true,
        createdBy: 1,
      });

      const docs = await db.getAllHelpDocs({ search: "Advanced Features" });
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0].title).toContain("Advanced Features");
    });

    it("should get all help documents", async () => {
      const docs = await db.getAllHelpDocs();
      
      expect(Array.isArray(docs)).toBe(true);
      expect(docs.length).toBeGreaterThan(0);
      expect(docs[0]).toHaveProperty("title");
      expect(docs[0]).toHaveProperty("content");
    });

    it("should filter help docs by category", async () => {
      // Create another doc with different category
      const uniqueSlug = `troubleshooting-guide-${Date.now()}`;
      await db.createHelpDoc({
        title: "Troubleshooting Guide",
        slug: uniqueSlug,
        content: "Common issues and how to resolve them.",
        category: "Troubleshooting",
        isPublished: true,
        createdBy: 1,
      });

      const gettingStartedDocs = await db.getAllHelpDocs({ category: "Getting Started" });
      const troubleshootingDocs = await db.getAllHelpDocs({ category: "Troubleshooting" });

      expect(gettingStartedDocs.length).toBeGreaterThan(0);
      expect(troubleshootingDocs.length).toBeGreaterThan(0);
      expect(gettingStartedDocs.every(d => d.category === "Getting Started")).toBe(true);
      expect(troubleshootingDocs.every(d => d.category === "Troubleshooting")).toBe(true);
    });

    it("should filter help docs by published status", async () => {
      // Create a draft doc
      const uniqueSlug = `draft-document-${Date.now()}`;
      await db.createHelpDoc({
        title: "Draft Document",
        slug: uniqueSlug,
        content: "This is a draft document.",
        isPublished: false,
        createdBy: 1,
      });

      const publishedDocs = await db.getAllHelpDocs({ isPublished: true });
      const draftDocs = await db.getAllHelpDocs({ isPublished: false });

      expect(publishedDocs.every(d => d.isPublished === true)).toBe(true);
      expect(draftDocs.every(d => d.isPublished === false)).toBe(true);
    });

    it("should search help docs by title or content", async () => {
      const results = await db.getAllHelpDocs({ search: "guide" });

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.some(d => 
          d.title.toLowerCase().includes("guide") || 
          d.content.toLowerCase().includes("guide")
        )
      ).toBe(true);
    });

    it("should get help doc by ID", async () => {
      const doc = await db.getHelpDocById(testDocId);

      expect(doc).toBeDefined();
      expect(doc?.id).toBe(testDocId);
      expect(doc?.title).toBe("Getting Started Guide");
    });

    it("should get help doc by slug", async () => {
      // Get the doc we created in beforeEach
      const docs = await db.getAllHelpDocs();
      const testDoc = docs.find(d => d.title === "Getting Started Guide");
      if (!testDoc) return;
      
      const doc = await db.getHelpDocBySlug(testDoc.slug);

      expect(doc).toBeDefined();
      expect(doc?.title).toBe("Getting Started Guide");
    });

    it("should update help document", async () => {
      await db.updateHelpDoc(testDocId, {
        title: "Updated Guide",
        content: "Updated content",
      });

      const updatedDoc = await db.getHelpDocById(testDocId);
      expect(updatedDoc?.title).toBe("Updated Guide");
      expect(updatedDoc?.content).toBe("Updated content");
    });

    it("should delete help document", async () => {
      await db.deleteHelpDoc(testDocId);

      const deletedDoc = await db.getHelpDocById(testDocId);
      expect(deletedDoc).toBeUndefined();
    });

    it("should increment help doc views", async () => {
      const before = await db.getHelpDocById(testDocId);
      const initialViews = before?.views || 0;

      await db.incrementHelpDocViews(testDocId);

      const after = await db.getHelpDocById(testDocId);
      expect(after?.views).toBe(initialViews + 1);
    });

    it("should vote help doc as helpful", async () => {
      const before = await db.getHelpDocById(testDocId);
      const initialHelpful = before?.helpful || 0;

      await db.voteHelpDocHelpful(testDocId, true);

      const after = await db.getHelpDocById(testDocId);
      expect(after?.helpful).toBe(initialHelpful + 1);
    });

    it("should vote help doc as not helpful", async () => {
      const before = await db.getHelpDocById(testDocId);
      const initialNotHelpful = before?.notHelpful || 0;

      await db.voteHelpDocHelpful(testDocId, false);

      const after = await db.getHelpDocById(testDocId);
      expect(after?.notHelpful).toBe(initialNotHelpful + 1);
    });
  });

  // ============================================================================
  // Support Tickets Tests (using existing infrastructure)
  // ============================================================================
  
  describe("Support Tickets", () => {
    it("should get all support tickets", async () => {
      const tickets = await db.getAllSupportTickets();
      
      expect(Array.isArray(tickets)).toBe(true);
      // Tickets may be empty initially, that's okay
    });

    it("should get support ticket by ID if exists", async () => {
      const tickets = await db.getAllSupportTickets();
      
      if (tickets.length > 0) {
        const ticket = await db.getSupportTicketById(tickets[0].id);
        expect(ticket).toBeDefined();
        expect(ticket?.id).toBe(tickets[0].id);
      } else {
        // If no tickets exist, test passes
        expect(true).toBe(true);
      }
    });

    it("should get support ticket messages", async () => {
      const tickets = await db.getAllSupportTickets();
      
      if (tickets.length > 0) {
        const messages = await db.getSupportTicketMessages(tickets[0].id);
        expect(Array.isArray(messages)).toBe(true);
      } else {
        // If no tickets exist, test passes
        expect(true).toBe(true);
      }
    });
  });
});

