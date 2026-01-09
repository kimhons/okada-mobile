import { ReactNode, useEffect, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import hapticFeedback from "@/lib/haptic";

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
  disabled?: boolean;
  pullThreshold?: number;
}

export function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  pullThreshold = 80,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canPull, setCanPull] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || disabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh when scrolled to top
      if (container.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        setCanPull(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || isRefreshing) return;

      currentY.current = e.touches[0].clientY;
      const distance = currentY.current - startY.current;

      // Only pull down (positive distance)
      if (distance > 0) {
        // Prevent default scroll behavior when pulling
        e.preventDefault();
        
        // Apply resistance to pull distance (diminishing returns)
        const resistance = 0.5;
        const adjustedDistance = Math.min(distance * resistance, pullThreshold * 1.5);
        setPullDistance(adjustedDistance);
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull) return;

      setCanPull(false);

      // Trigger refresh if pulled past threshold
      if (pullDistance >= pullThreshold && !isRefreshing) {
        hapticFeedback.refresh();
        setIsRefreshing(true);
        setPullDistance(pullThreshold); // Lock at threshold during refresh

        try {
          await onRefresh();
          hapticFeedback.success();
        } catch (error) {
          console.error("Refresh failed:", error);
          hapticFeedback.error();
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
        }
      } else {
        // Snap back if not pulled enough
        setPullDistance(0);
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: false });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [canPull, pullDistance, pullThreshold, isRefreshing, onRefresh, disabled]);

  const refreshProgress = Math.min((pullDistance / pullThreshold) * 100, 100);
  const showRefreshIndicator = pullDistance > 0 || isRefreshing;

  return (
    <div
      ref={containerRef}
      className="relative h-full overflow-auto"
      style={{
        transform: `translateY(${pullDistance}px)`,
        transition: canPull ? "none" : "transform 0.3s ease-out",
      }}
    >
      {/* Refresh indicator */}
      {showRefreshIndicator && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center"
          style={{
            height: `${pullDistance}px`,
            opacity: Math.min(refreshProgress / 100, 1),
          }}
        >
          <div className="flex flex-col items-center gap-2 py-4">
            <RefreshCw
              className={`h-6 w-6 text-primary ${isRefreshing ? "animate-spin" : ""}`}
              style={{
                transform: `rotate(${refreshProgress * 3.6}deg)`,
                transition: isRefreshing ? "none" : "transform 0.2s ease-out",
              }}
            />
            <span className="text-sm text-muted-foreground">
              {isRefreshing
                ? "Refreshing..."
                : pullDistance >= pullThreshold
                ? "Release to refresh"
                : "Pull to refresh"}
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <div>{children}</div>
    </div>
  );
}
