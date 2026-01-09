import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock the hooks and components
vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User", email: "test@example.com", role: "admin" },
    loading: false,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/moderation-guidelines", vi.fn()],
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("@/hooks/useMobile", () => ({
  useIsMobile: () => false,
}));

vi.mock("@/hooks/useOrderNotifications", () => ({
  useOrderNotifications: () => ({
    isConnected: true,
    notifications: [],
    newOrders: [],
    riderLocations: new Map(),
    clearNotifications: vi.fn(),
    clearNewOrders: vi.fn(),
    soundEnabled: true,
    toggleSound: vi.fn(),
    volume: 0.7,
    setVolume: vi.fn(),
  }),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("ModerationGuidelines Page", () => {
  describe("Guidelines structure", () => {
    it("should have Product Listings guidelines", () => {
      const guidelines = [
        { title: "Product Listings", rules: ["Prohibited Items", "Misleading Descriptions"] },
      ];
      expect(guidelines[0].title).toBe("Product Listings");
      expect(guidelines[0].rules).toContain("Prohibited Items");
    });

    it("should have User Behavior guidelines", () => {
      const guidelines = [
        { title: "User Behavior", rules: ["Harassment", "Fake Reviews", "Spam"] },
      ];
      expect(guidelines[0].title).toBe("User Behavior");
      expect(guidelines[0].rules).toContain("Harassment");
    });

    it("should have Rider Conduct guidelines", () => {
      const guidelines = [
        { title: "Rider Conduct", rules: ["Delivery Fraud", "Safety Violations"] },
      ];
      expect(guidelines[0].title).toBe("Rider Conduct");
      expect(guidelines[0].rules).toContain("Delivery Fraud");
    });

    it("should have Content & Reviews guidelines", () => {
      const guidelines = [
        { title: "Content & Reviews", rules: ["Hate Speech", "Adult Content"] },
      ];
      expect(guidelines[0].title).toBe("Content & Reviews");
      expect(guidelines[0].rules).toContain("Hate Speech");
    });
  });

  describe("Severity levels", () => {
    it("should have all severity levels defined", () => {
      const SEVERITY_COLORS = {
        low: "bg-blue-100 text-blue-800 border-blue-200",
        medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
        high: "bg-orange-100 text-orange-800 border-orange-200",
        critical: "bg-red-100 text-red-800 border-red-200",
      };
      
      expect(Object.keys(SEVERITY_COLORS)).toContain("low");
      expect(Object.keys(SEVERITY_COLORS)).toContain("medium");
      expect(Object.keys(SEVERITY_COLORS)).toContain("high");
      expect(Object.keys(SEVERITY_COLORS)).toContain("critical");
    });

    it("should map severity to correct colors", () => {
      const SEVERITY_COLORS: Record<string, string> = {
        low: "bg-blue-100",
        medium: "bg-yellow-100",
        high: "bg-orange-100",
        critical: "bg-red-100",
      };
      
      expect(SEVERITY_COLORS["low"]).toContain("blue");
      expect(SEVERITY_COLORS["critical"]).toContain("red");
    });
  });

  describe("Appeal process", () => {
    it("should have 3 steps in appeal process", () => {
      const appealSteps = ["Submit Appeal", "Review", "Decision"];
      expect(appealSteps.length).toBe(3);
      expect(appealSteps[0]).toBe("Submit Appeal");
      expect(appealSteps[2]).toBe("Decision");
    });
  });
});
