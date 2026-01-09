import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { LazyImage, LazyAvatar } from "../LazyImage";

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

beforeEach(() => {
  mockIntersectionObserver.mockImplementation((callback) => {
    return {
      observe: mockObserve.mockImplementation((element) => {
        // Simulate immediate intersection
        callback([{ isIntersecting: true, target: element }]);
      }),
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    };
  });
  
  window.IntersectionObserver = mockIntersectionObserver as any;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("LazyImage Component", () => {
  describe("Rendering", () => {
    it("should render with skeleton placeholder initially", () => {
      const { container } = render(
        <LazyImage src="/test.jpg" alt="Test image" />
      );
      
      // Should have a skeleton element
      const skeleton = container.querySelector('[class*="skeleton"]');
      expect(skeleton || container.querySelector('.animate-pulse')).toBeTruthy();
    });

    it("should render image when in view", async () => {
      render(<LazyImage src="/test.jpg" alt="Test image" />);
      
      // Image should be rendered (since we mock immediate intersection)
      await waitFor(() => {
        const img = screen.getByAltText("Test image");
        expect(img).toBeInTheDocument();
      });
    });

    it("should apply custom className", () => {
      const { container } = render(
        <LazyImage src="/test.jpg" alt="Test" className="custom-class" />
      );
      
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass("custom-class");
    });
  });

  describe("IntersectionObserver", () => {
    it("should create IntersectionObserver on mount", () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(mockIntersectionObserver).toHaveBeenCalled();
    });

    it("should observe the element", () => {
      render(<LazyImage src="/test.jpg" alt="Test" />);
      expect(mockObserve).toHaveBeenCalled();
    });

    it("should disconnect observer on unmount", () => {
      const { unmount } = render(<LazyImage src="/test.jpg" alt="Test" />);
      unmount();
      expect(mockDisconnect).toHaveBeenCalled();
    });

    it("should use custom threshold", () => {
      render(<LazyImage src="/test.jpg" alt="Test" threshold={0.5} />);
      
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ threshold: 0.5 })
      );
    });

    it("should use custom rootMargin", () => {
      render(<LazyImage src="/test.jpg" alt="Test" rootMargin="100px" />);
      
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        expect.objectContaining({ rootMargin: "100px" })
      );
    });
  });

  describe("Error handling", () => {
    it("should use fallback image on error", async () => {
      render(
        <LazyImage 
          src="/broken.jpg" 
          alt="Test" 
          fallback="/fallback.jpg" 
        />
      );
      
      const img = await screen.findByAltText("Test");
      
      // Simulate error
      img.dispatchEvent(new Event("error"));
      
      await waitFor(() => {
        expect(img).toHaveAttribute("src", "/fallback.jpg");
      });
    });
  });
});

describe("LazyAvatar Component", () => {
  describe("Rendering", () => {
    it("should show initials when no src provided", () => {
      render(<LazyAvatar alt="John Doe" />);
      expect(screen.getByText("JO")).toBeInTheDocument();
    });

    it("should use custom fallback initials", () => {
      render(<LazyAvatar alt="John Doe" fallbackInitials="JD" />);
      expect(screen.getByText("JD")).toBeInTheDocument();
    });

    it("should apply size classes correctly", () => {
      const { container: smContainer } = render(
        <LazyAvatar alt="Test" size="sm" />
      );
      expect(smContainer.firstChild).toHaveClass("w-8", "h-8");

      const { container: lgContainer } = render(
        <LazyAvatar alt="Test" size="lg" />
      );
      expect(lgContainer.firstChild).toHaveClass("w-12", "h-12");
    });
  });

  describe("Image loading", () => {
    it("should render image when src is provided and in view", async () => {
      render(<LazyAvatar src="/avatar.jpg" alt="User Avatar" />);
      
      await waitFor(() => {
        const img = screen.getByAltText("User Avatar");
        expect(img).toBeInTheDocument();
      });
    });
  });
});
