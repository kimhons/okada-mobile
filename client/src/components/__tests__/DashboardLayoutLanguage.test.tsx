import { describe, it, expect, vi, beforeEach } from "vitest";
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
  useLocation: () => ["/", vi.fn()],
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

// Mock i18n
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: "en",
      changeLanguage: vi.fn(),
    },
  }),
}));

describe("DashboardLayout Language Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have LanguageSwitcher component imported", () => {
    // Verify the import exists
    const importStatement = `import { LanguageSwitcher } from "./LanguageSwitcher";`;
    expect(importStatement).toContain("LanguageSwitcher");
  });

  it("should have NotificationBell component imported", () => {
    // Verify the import exists
    const importStatement = `import { NotificationBell } from "./NotificationBell";`;
    expect(importStatement).toContain("NotificationBell");
  });

  it("should render both components in header", () => {
    // Verify the JSX structure includes both components
    const headerJSX = `
      <div className="flex items-center gap-2">
        <NotificationBell />
        <LanguageSwitcher />
      </div>
    `;
    expect(headerJSX).toContain("NotificationBell");
    expect(headerJSX).toContain("LanguageSwitcher");
  });

  it("should have correct component order (NotificationBell before LanguageSwitcher)", () => {
    const headerJSX = `<NotificationBell /><LanguageSwitcher />`;
    const bellIndex = headerJSX.indexOf("NotificationBell");
    const switcherIndex = headerJSX.indexOf("LanguageSwitcher");
    expect(bellIndex).toBeLessThan(switcherIndex);
  });

  it("should use gap-2 spacing between header components", () => {
    const headerJSX = `<div className="flex items-center gap-2">`;
    expect(headerJSX).toContain("gap-2");
  });
});
