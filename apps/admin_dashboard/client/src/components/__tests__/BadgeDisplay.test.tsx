import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BadgeDisplay, BadgeData } from "../BadgeDisplay";
import { TooltipProvider } from "@/components/ui/tooltip";

// Wrapper component for tooltip context
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <TooltipProvider>{children}</TooltipProvider>
);

describe("BadgeDisplay Component", () => {
  const mockBadges: BadgeData[] = [
    { id: 1, name: "First Delivery", icon: "🏆", tier: "bronze", points: 10 },
    { id: 2, name: "Speed Demon", icon: "⚡", tier: "silver", points: 25 },
    { id: 3, name: "Perfect Rating", icon: "⭐", tier: "gold", points: 50 },
  ];

  describe("Rendering", () => {
    it("should render empty state when no badges", () => {
      render(
        <TestWrapper>
          <BadgeDisplay badges={[]} />
        </TestWrapper>
      );
      expect(screen.getByText("No badges earned yet")).toBeInTheDocument();
    });

    it("should render badges when provided", () => {
      render(
        <TestWrapper>
          <BadgeDisplay badges={mockBadges} />
        </TestWrapper>
      );
      // Should not show empty state
      expect(screen.queryByText("No badges earned yet")).not.toBeInTheDocument();
    });

    it("should limit displayed badges to maxDisplay", () => {
      const manyBadges: BadgeData[] = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Badge ${i + 1}`,
        tier: "bronze" as const,
        points: 10,
      }));

      render(
        <TestWrapper>
          <BadgeDisplay badges={manyBadges} maxDisplay={6} />
        </TestWrapper>
      );
      
      // Should show +4 for remaining badges
      expect(screen.getByText("+4")).toBeInTheDocument();
    });
  });

  describe("Points calculation", () => {
    it("should show total points when showPoints is true", () => {
      render(
        <TestWrapper>
          <BadgeDisplay badges={mockBadges} showPoints={true} />
        </TestWrapper>
      );
      expect(screen.getByText("85 total points")).toBeInTheDocument();
    });

    it("should not show points when showPoints is false", () => {
      render(
        <TestWrapper>
          <BadgeDisplay badges={mockBadges} showPoints={false} />
        </TestWrapper>
      );
      expect(screen.queryByText("85 total points")).not.toBeInTheDocument();
    });
  });

  describe("Size variants", () => {
    it("should apply correct size classes for sm", () => {
      const { container } = render(
        <TestWrapper>
          <BadgeDisplay badges={mockBadges} size="sm" />
        </TestWrapper>
      );
      const badgeElements = container.querySelectorAll(".w-8.h-8");
      expect(badgeElements.length).toBeGreaterThan(0);
    });

    it("should apply correct size classes for md", () => {
      const { container } = render(
        <TestWrapper>
          <BadgeDisplay badges={mockBadges} size="md" />
        </TestWrapper>
      );
      const badgeElements = container.querySelectorAll(".w-12.h-12");
      expect(badgeElements.length).toBeGreaterThan(0);
    });

    it("should apply correct size classes for lg", () => {
      const { container } = render(
        <TestWrapper>
          <BadgeDisplay badges={mockBadges} size="lg" />
        </TestWrapper>
      );
      const badgeElements = container.querySelectorAll(".w-16.h-16");
      expect(badgeElements.length).toBeGreaterThan(0);
    });
  });

  describe("Tier styling", () => {
    it("should apply bronze tier styling", () => {
      const bronzeBadge: BadgeData[] = [{ id: 1, name: "Bronze", tier: "bronze" }];
      const { container } = render(
        <TestWrapper>
          <BadgeDisplay badges={bronzeBadge} />
        </TestWrapper>
      );
      const badge = container.querySelector(".border-amber-600");
      expect(badge).toBeInTheDocument();
    });

    it("should apply gold tier styling", () => {
      const goldBadge: BadgeData[] = [{ id: 1, name: "Gold", tier: "gold" }];
      const { container } = render(
        <TestWrapper>
          <BadgeDisplay badges={goldBadge} />
        </TestWrapper>
      );
      const badge = container.querySelector(".border-yellow-500");
      expect(badge).toBeInTheDocument();
    });
  });
});
