import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";
import { getDb } from "./db";

/**
 * Test suite for i18n (multi-language support) functionality
 * Critical for Cameroon market (60% French-speaking users)
 */

// Mock context for testing
const createMockContext = (isAdmin = true): Context => ({
  user: {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@test.com",
    role: isAdmin ? "admin" : "user",
    loginMethod: "test",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
});

const createCaller = (ctx: Context) => appRouter.createCaller(ctx);

describe("I18N Router", () => {
  beforeAll(async () => {
    // Ensure database is connected
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection required for i18n tests");
    }
  });

  describe("getLanguages", () => {
    it("should return list of active languages", async () => {
      const caller = createCaller(createMockContext());
      const languages = await caller.i18n.getLanguages();

      expect(languages).toBeDefined();
      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      
      // Should include English and French
      const englishLang = languages.find((l) => l.code === "en");
      const frenchLang = languages.find((l) => l.code === "fr");
      
      expect(englishLang).toBeDefined();
      expect(englishLang?.name).toBe("English");
      expect(englishLang?.nativeName).toBe("English");
      expect(englishLang?.isActive).toBe(true);
      
      expect(frenchLang).toBeDefined();
      expect(frenchLang?.name).toBe("French");
      expect(frenchLang?.nativeName).toBe("Français");
      expect(frenchLang?.isActive).toBe(true);
    });
  });

  describe("getDefaultLanguage", () => {
    it("should return the default language (English)", async () => {
      const caller = createCaller(createMockContext());
      const defaultLang = await caller.i18n.getDefaultLanguage();

      expect(defaultLang).toBeDefined();
      expect(defaultLang?.code).toBe("en");
      expect(defaultLang?.isDefault).toBe(true);
    });
  });

  describe("getTranslations", () => {
    it("should return translations for English common namespace", async () => {
      const caller = createCaller(createMockContext());
      const translations = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "common",
      });

      expect(translations).toBeDefined();
      expect(Array.isArray(translations)).toBe(true);
      expect(translations.length).toBeGreaterThan(0);

      // Check for common translations
      const welcomeTranslation = translations.find((t) => t.key === "welcome");
      expect(welcomeTranslation).toBeDefined();
      expect(welcomeTranslation?.value).toBe("Welcome");
      expect(welcomeTranslation?.languageCode).toBe("en");
      expect(welcomeTranslation?.namespace).toBe("common");
    });

    it("should return translations for French common namespace", async () => {
      const caller = createCaller(createMockContext());
      const translations = await caller.i18n.getTranslations({
        languageCode: "fr",
        namespace: "common",
      });

      expect(translations).toBeDefined();
      expect(Array.isArray(translations)).toBe(true);
      expect(translations.length).toBeGreaterThan(0);

      // Check for French translations
      const welcomeTranslation = translations.find((t) => t.key === "welcome");
      expect(welcomeTranslation).toBeDefined();
      expect(welcomeTranslation?.value).toBe("Bienvenue");
      expect(welcomeTranslation?.languageCode).toBe("fr");
    });

    it("should return empty array for non-existent namespace", async () => {
      const caller = createCaller(createMockContext());
      const translations = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "non_existent_namespace",
      });

      expect(translations).toBeDefined();
      expect(Array.isArray(translations)).toBe(true);
      expect(translations.length).toBe(0);
    });
  });

  describe("upsertTranslation", () => {
    it("should allow admin to create new translation", async () => {
      const caller = createCaller(createMockContext(true));
      const result = await caller.i18n.upsertTranslation({
        languageCode: "en",
        namespace: "test",
        key: "test_key",
        value: "Test Value",
        context: "Test context",
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Verify translation was created
      const translations = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "test",
      });

      const testTranslation = translations.find((t) => t.key === "test_key");
      expect(testTranslation).toBeDefined();
      expect(testTranslation?.value).toBe("Test Value");
    });

    it("should allow admin to update existing translation", async () => {
      const caller = createCaller(createMockContext(true));
      
      // Create initial translation
      await caller.i18n.upsertTranslation({
        languageCode: "en",
        namespace: "test",
        key: "update_test",
        value: "Original Value",
      });

      // Update translation
      await caller.i18n.upsertTranslation({
        languageCode: "en",
        namespace: "test",
        key: "update_test",
        value: "Updated Value",
      });

      // Verify translation was updated
      const translations = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "test",
      });

      const updatedTranslation = translations.find((t) => t.key === "update_test");
      expect(updatedTranslation).toBeDefined();
      expect(updatedTranslation?.value).toBe("Updated Value");
    });

    it("should reject non-admin users from creating translations", async () => {
      const caller = createCaller(createMockContext(false));
      
      await expect(
        caller.i18n.upsertTranslation({
          languageCode: "en",
          namespace: "test",
          key: "forbidden_key",
          value: "Forbidden Value",
        })
      ).rejects.toThrow("Only admins can manage translations");
    });
  });

  describe("bulkUpsertTranslations", () => {
    it("should allow admin to bulk insert translations", async () => {
      const caller = createCaller(createMockContext(true));
      
      const bulkTranslations = [
        {
          languageCode: "en",
          namespace: "bulk_test",
          key: "bulk_key_1",
          value: "Bulk Value 1",
        },
        {
          languageCode: "en",
          namespace: "bulk_test",
          key: "bulk_key_2",
          value: "Bulk Value 2",
        },
        {
          languageCode: "fr",
          namespace: "bulk_test",
          key: "bulk_key_1",
          value: "Valeur en vrac 1",
        },
      ];

      const result = await caller.i18n.bulkUpsertTranslations(bulkTranslations);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.count).toBe(3);

      // Verify translations were created
      const enTranslations = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "bulk_test",
      });

      expect(enTranslations.length).toBeGreaterThanOrEqual(2);
    });

    it("should reject non-admin users from bulk inserting translations", async () => {
      const caller = createCaller(createMockContext(false));
      
      await expect(
        caller.i18n.bulkUpsertTranslations([
          {
            languageCode: "en",
            namespace: "test",
            key: "forbidden_bulk",
            value: "Forbidden",
          },
        ])
      ).rejects.toThrow("Only admins can manage translations");
    });
  });

  describe("deleteTranslation", () => {
    it("should allow admin to delete translation", async () => {
      const caller = createCaller(createMockContext(true));
      
      // Create a translation to delete
      await caller.i18n.upsertTranslation({
        languageCode: "en",
        namespace: "delete_test",
        key: "to_delete",
        value: "Will be deleted",
      });

      // Get the translation ID
      const translations = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "delete_test",
      });

      const toDelete = translations.find((t) => t.key === "to_delete");
      expect(toDelete).toBeDefined();

      // Delete the translation
      const result = await caller.i18n.deleteTranslation({ id: toDelete!.id });
      expect(result.success).toBe(true);

      // Verify translation was deleted
      const afterDelete = await caller.i18n.getTranslations({
        languageCode: "en",
        namespace: "delete_test",
      });

      const deletedTranslation = afterDelete.find((t) => t.key === "to_delete");
      expect(deletedTranslation).toBeUndefined();
    });

    it("should reject non-admin users from deleting translations", async () => {
      const caller = createCaller(createMockContext(false));
      
      await expect(
        caller.i18n.deleteTranslation({ id: 1 })
      ).rejects.toThrow("Only admins can manage translations");
    });
  });

  describe("getTranslationCoverage", () => {
    it("should return translation coverage statistics for admin", async () => {
      const caller = createCaller(createMockContext(true));
      const coverage = await caller.i18n.getTranslationCoverage();

      expect(coverage).toBeDefined();
      expect(Array.isArray(coverage)).toBe(true);
      expect(coverage.length).toBeGreaterThan(0);

      // Should have coverage for English and French
      const enCoverage = coverage.filter((c) => c.languageCode === "en");
      const frCoverage = coverage.filter((c) => c.languageCode === "fr");

      expect(enCoverage.length).toBeGreaterThan(0);
      expect(frCoverage.length).toBeGreaterThan(0);

      // Each coverage entry should have required fields
      coverage.forEach((entry) => {
        expect(entry.languageCode).toBeDefined();
        expect(entry.namespace).toBeDefined();
        expect(entry.count).toBeDefined();
        expect(Number(entry.count)).toBeGreaterThan(0);
      });
    });

    it("should reject non-admin users from viewing coverage", async () => {
      const caller = createCaller(createMockContext(false));
      
      await expect(
        caller.i18n.getTranslationCoverage()
      ).rejects.toThrow("Only admins can view translation coverage");
    });
  });
});
