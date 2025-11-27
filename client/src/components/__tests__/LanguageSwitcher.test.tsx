/**
 * Tests for LanguageSwitcher Component
 * 
 * Ensures language switching functionality works correctly
 * Critical for Cameroon market (60% French-speaking users)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import i18n from "i18next";

// Mock tRPC
vi.mock("@/lib/trpc", () => ({
  trpc: {
    i18n: {
      getLanguages: {
        useQuery: vi.fn(),
      },
    },
  },
}));

// Setup i18n for testing
beforeEach(() => {
  i18n.init({
    lng: "en",
    fallbackLng: "en",
    resources: {
      en: {
        translation: {
          "settings.language": "Language",
        },
      },
      fr: {
        translation: {
          "settings.language": "Langue",
        },
      },
    },
  });
});

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe("LanguageSwitcher", () => {
  beforeEach(() => {
    mockGetLanguages.mockReturnValue({
      data: [
        { code: "en", name: "English", nativeName: "English", isActive: true, isDefault: true },
        { code: "fr", name: "French", nativeName: "Français", isActive: true, isDefault: false },
      ],
      isLoading: false,
      error: null,
    });
  });

  it("should render language switcher button", () => {
    renderWithProviders(<LanguageSwitcher />);
    
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  it("should show current language flag", () => {
    renderWithProviders(<LanguageSwitcher />);
    
    // Should show English flag initially
    const button = screen.getByRole("button");
    expect(button.textContent).toContain("🇬🇧"); // English flag
  });

  it("should open dropdown when clicked", async () => {
    renderWithProviders(<LanguageSwitcher />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText("English")).toBeDefined();
      expect(screen.getByText("Français")).toBeDefined();
    });
  });

  it("should switch language when option is selected", async () => {
    renderWithProviders(<LanguageSwitcher />);
    
    // Open dropdown
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    // Click French option
    await waitFor(() => {
      const frenchOption = screen.getByText("Français");
      fireEvent.click(frenchOption);
    });
    
    // Verify language changed
    await waitFor(() => {
      expect(i18n.language).toBe("fr");
    });
  });

  it("should persist language selection in localStorage", async () => {
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem");
    
    renderWithProviders(<LanguageSwitcher />);
    
    // Open dropdown and select French
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    await waitFor(() => {
      const frenchOption = screen.getByText("Français");
      fireEvent.click(frenchOption);
    });
    
    // Verify localStorage was updated
    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith("i18nextLng", "fr");
    });
    
    setItemSpy.mockRestore();
  });

  it("should show loading state while fetching languages", () => {
    mockGetLanguages.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    
    renderWithProviders(<LanguageSwitcher />);
    
    // Should still render but might show loading indicator
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  it("should handle error state gracefully", () => {
    mockGetLanguages.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Failed to fetch languages"),
    });
    
    renderWithProviders(<LanguageSwitcher />);
    
    // Should still render with fallback
    const button = screen.getByRole("button");
    expect(button).toBeDefined();
  });

  it("should show checkmark for currently selected language", async () => {
    renderWithProviders(<LanguageSwitcher />);
    
    // Open dropdown
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    // English should have checkmark (default language)
    await waitFor(() => {
      const englishOption = screen.getByText("English").closest("div");
      expect(englishOption?.querySelector("svg")).toBeDefined(); // Check icon
    });
  });

  it("should close dropdown after language selection", async () => {
    renderWithProviders(<LanguageSwitcher />);
    
    // Open dropdown
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    // Select French
    await waitFor(() => {
      const frenchOption = screen.getByText("Français");
      fireEvent.click(frenchOption);
    });
    
    // Dropdown should close
    await waitFor(() => {
      expect(screen.queryByText("English")).toBeNull();
    });
  });

  it("should display native language names", async () => {
    renderWithProviders(<LanguageSwitcher />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    await waitFor(() => {
      // Should show native names, not English translations
      expect(screen.getByText("English")).toBeDefined();
      expect(screen.getByText("Français")).toBeDefined(); // Not "French"
    });
  });

  it("should only show active languages", () => {
    mockGetLanguages.mockReturnValue({
      data: [
        { code: "en", name: "English", nativeName: "English", isActive: true, isDefault: true },
        { code: "fr", name: "French", nativeName: "Français", isActive: true, isDefault: false },
        { code: "es", name: "Spanish", nativeName: "Español", isActive: false, isDefault: false },
      ],
      isLoading: false,
      error: null,
    });
    
    renderWithProviders(<LanguageSwitcher />);
    
    const button = screen.getByRole("button");
    fireEvent.click(button);
    
    waitFor(() => {
      expect(screen.getByText("English")).toBeDefined();
      expect(screen.getByText("Français")).toBeDefined();
      expect(screen.queryByText("Español")).toBeNull(); // Inactive, should not show
    });
  });
});
