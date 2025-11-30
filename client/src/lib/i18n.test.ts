import { describe, it, expect, beforeEach, vi } from "vitest";
import i18n from "./i18n";

/**
 * Comprehensive test suite for i18n system
 * Tests translation loading, language switching, namespaces, and fallback behavior
 */

describe("i18n Configuration", () => {
  beforeEach(async () => {
    // Reset i18n to English before each test
    await i18n.changeLanguage("en");
  });

  it("should initialize with English as default language", () => {
    expect(i18n.language).toBe("en");
  });

  it("should have all required namespaces registered", () => {
    const expectedNamespaces = [
      "common",
      "dashboard",
      "orders",
      "users",
      "riders",
      "products",
      "sellers",
      "financial",
      "commission",
      "payment",
      "payout",
      "leaderboard",
      "quality",
    ];

    expectedNamespaces.forEach((ns) => {
      expect(i18n.options.ns).toContain(ns);
    });
  });

  it("should have common namespace as default", () => {
    expect(i18n.options.defaultNS).toBe("common");
  });

  it("should have English as fallback language", () => {
    expect(i18n.options.fallbackLng).toEqual(["en"]);
  });
});

describe("Language Switching", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should switch from English to French", async () => {
    await i18n.changeLanguage("fr");
    expect(i18n.language).toBe("fr");
  });

  it("should switch from French to English", async () => {
    await i18n.changeLanguage("fr");
    await i18n.changeLanguage("en");
    expect(i18n.language).toBe("en");
  });

  it("should persist language preference in localStorage", async () => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    global.localStorage = localStorageMock as any;

    await i18n.changeLanguage("fr");

    // i18next-browser-languagedetector should save to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });
});

describe("Common Namespace Translations", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should load English common translations", () => {
    expect(i18n.t("common:welcome")).toBe("Welcome");
    expect(i18n.t("common:loading")).toBe("Loading...");
    expect(i18n.t("common:error")).toBe("Error");
    expect(i18n.t("common:success")).toBe("Success");
  });

  it("should load French common translations", async () => {
    await i18n.changeLanguage("fr");

    expect(i18n.t("common:welcome")).toBe("Bienvenue");
    expect(i18n.t("common:loading")).toBe("Chargement...");
    expect(i18n.t("common:error")).toBe("Erreur");
    expect(i18n.t("common:success")).toBe("Succès");
  });

  it("should translate action buttons in English", () => {
    expect(i18n.t("common:save")).toBe("Save");
    expect(i18n.t("common:cancel")).toBe("Cancel");
    expect(i18n.t("common:delete")).toBe("Delete");
    expect(i18n.t("common:edit")).toBe("Edit");
  });

  it("should translate action buttons in French", async () => {
    await i18n.changeLanguage("fr");

    expect(i18n.t("common:save")).toBe("Enregistrer");
    expect(i18n.t("common:cancel")).toBe("Annuler");
    expect(i18n.t("common:delete")).toBe("Supprimer");
    expect(i18n.t("common:edit")).toBe("Modifier");
  });
});

describe("Dashboard Namespace Translations", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should load English dashboard translations", () => {
    expect(i18n.t("dashboard:title")).toBe("Dashboard");
    expect(i18n.t("dashboard:welcome_message")).toBe("Welcome to your admin dashboard");
    expect(i18n.t("dashboard:total_orders")).toBe("Total Orders");
    expect(i18n.t("dashboard:active_users")).toBe("Active Users");
  });

  it("should load French dashboard translations", async () => {
    await i18n.changeLanguage("fr");

    expect(i18n.t("dashboard:title")).toBe("Tableau de bord");
    expect(i18n.t("dashboard:welcome_message")).toBe("Bienvenue sur votre tableau de bord administrateur");
    expect(i18n.t("dashboard:total_orders")).toBe("Total des commandes");
    expect(i18n.t("dashboard:active_users")).toBe("Utilisateurs actifs");
  });
});

describe("Leaderboard Namespace Translations", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should load English leaderboard translations", () => {
    expect(i18n.t("leaderboard:title")).toBe("Rider Performance Leaderboard");
    expect(i18n.t("leaderboard:subtitle")).toBe("Track and celebrate top-performing riders");
    expect(i18n.t("leaderboard:lastUpdated")).toBe("Last updated");
    expect(i18n.t("leaderboard:autoRefresh")).toBe("Auto-refreshes every 30s");
    expect(i18n.t("leaderboard:refresh")).toBe("Refresh");
  });

  it("should load French leaderboard translations", async () => {
    await i18n.changeLanguage("fr");

    expect(i18n.t("leaderboard:title")).toBe("Classement des Performances des Livreurs");
    expect(i18n.t("leaderboard:subtitle")).toBe("Suivre et célébrer les meilleurs livreurs");
    expect(i18n.t("leaderboard:lastUpdated")).toBe("Dernière mise à jour");
    expect(i18n.t("leaderboard:autoRefresh")).toBe("Actualisation automatique toutes les 30s");
    expect(i18n.t("leaderboard:refresh")).toBe("Actualiser");
  });
});

describe("Quality Namespace Translations", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should load English quality translations", () => {
    expect(i18n.t("quality:title")).toBe("Quality Verification Review");
    expect(i18n.t("quality:subtitle")).toBe("Review and approve delivery quality photos submitted by riders");
    expect(i18n.t("quality:loading")).toBe("Loading quality verification photos...");
  });

  it("should load French quality translations", async () => {
    await i18n.changeLanguage("fr");

    expect(i18n.t("quality:title")).toBe("Vérification de la Qualité");
    expect(i18n.t("quality:subtitle")).toBe("Examiner et approuver les photos de qualité de livraison soumises par les livreurs");
    expect(i18n.t("quality:loading")).toBe("Chargement des photos de vérification de qualité...");
  });
});

describe("Fallback Behavior", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should return key when translation is missing", () => {
    const missingKey = "nonexistent.translation.key";
    expect(i18n.t(missingKey)).toBe(missingKey);
  });

  it("should fallback to English when French translation is missing", async () => {
    await i18n.changeLanguage("fr");

    // Test with a key that might only exist in English
    const key = "common:welcome";
    const translation = i18n.t(key);

    // Should either have French translation or fallback to English
    expect(translation).toBeTruthy();
    expect(translation).not.toBe(key);
  });

  it("should handle missing namespace gracefully", () => {
    const result = i18n.t("nonexistent_namespace:some_key");
    // i18n returns just the key without namespace prefix when namespace doesn't exist
    expect(result).toBe("some_key");
  });
});

describe("Interpolation", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("should support variable interpolation", () => {
    // Add a test translation with interpolation
    i18n.addResourceBundle("en", "test", {
      greeting: "Hello, {{name}}!",
    });

    const result = i18n.t("test:greeting", { name: "John" });
    expect(result).toBe("Hello, John!");
  });

  it("should support pluralization", () => {
    // Add test translations with pluralization
    i18n.addResourceBundle("en", "test", {
      items_one: "{{count}} item",
      items_other: "{{count}} items",
    });

    expect(i18n.t("test:items", { count: 1 })).toBe("1 item");
    expect(i18n.t("test:items", { count: 5 })).toBe("5 items");
  });
});

describe("Namespace Loading", () => {
  it("should load multiple namespaces simultaneously", () => {
    const namespaces = ["common", "dashboard", "leaderboard", "quality"];

    namespaces.forEach((ns) => {
      expect(i18n.hasResourceBundle("en", ns)).toBe(true);
      expect(i18n.hasResourceBundle("fr", ns)).toBe(true);
    });
  });

  it("should access translations from different namespaces", () => {
    expect(i18n.t("common:welcome")).toBeTruthy();
    expect(i18n.t("dashboard:title")).toBeTruthy();
    expect(i18n.t("leaderboard:title")).toBeTruthy();
    expect(i18n.t("quality:title")).toBeTruthy();
  });
});

describe("Resource Bundle Management", () => {
  it("should allow adding new resource bundles", () => {
    i18n.addResourceBundle("en", "test_namespace", {
      test_key: "Test Value",
    });

    expect(i18n.t("test_namespace:test_key")).toBe("Test Value");
  });

  it("should allow updating existing resource bundles", () => {
    i18n.addResourceBundle(
      "en",
      "common",
      {
        new_key: "New Value",
      },
      true,
      true
    );

    expect(i18n.t("common:new_key")).toBe("New Value");
  });

  it("should check if resource bundle exists", () => {
    expect(i18n.hasResourceBundle("en", "common")).toBe(true);
    expect(i18n.hasResourceBundle("en", "nonexistent")).toBe(false);
  });
});

describe("Language Detection", () => {
  it("should detect browser language", () => {
    // i18next-browser-languagedetector uses navigator.language
    expect(i18n.options.detection?.order).toContain("navigator");
  });

  it("should cache language preference in localStorage", () => {
    expect(i18n.options.detection?.caches).toContain("localStorage");
  });
});

describe("Configuration Options", () => {
  it("should not escape values (React handles escaping)", () => {
    expect(i18n.options.interpolation?.escapeValue).toBe(false);
  });

  it("should have proper detection order", () => {
    expect(i18n.options.detection?.order).toEqual(["localStorage", "navigator"]);
  });
});
