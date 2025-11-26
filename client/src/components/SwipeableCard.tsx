import { ReactNode, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2, Edit, Check, X } from "lucide-react";

interface SwipeableCardProps {
  children: ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
  onComplete?: () => void;
  deleteLabel?: string;
  editLabel?: string;
  completeLabel?: string;
  className?: string;
  disabled?: boolean;
}

export function SwipeableCard({
  children,
  onDelete,
  onEdit,
  onComplete,
  deleteLabel = "Delete",
  editLabel = "Edit",
  completeLabel = "Complete",
  className = "",
  disabled = false,
}: SwipeableCardProps) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);

  const SWIPE_THRESHOLD = 80; // Minimum swipe distance to reveal actions
  const MAX_SWIPE = 160; // Maximum swipe distance

  const handlers = useSwipeable({
    onSwiping: (eventData) => {
      if (disabled) return;
      
      setIsSwiping(true);
      const deltaX = eventData.deltaX;
      
      // Left swipe (negative deltaX) reveals delete button
      // Right swipe (positive deltaX) reveals edit/complete buttons
      const newOffset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX));
      setSwipeOffset(newOffset);
    },
    onSwiped: (eventData) => {
      if (disabled) return;
      
      setIsSwiping(false);
      const deltaX = eventData.deltaX;
      
      // If swiped past threshold, keep actions visible
      if (Math.abs(deltaX) >= SWIPE_THRESHOLD) {
        setSwipeOffset(deltaX < 0 ? -SWIPE_THRESHOLD : SWIPE_THRESHOLD);
      } else {
        // Otherwise, snap back to center
        setSwipeOffset(0);
      }
    },
    trackMouse: true,
    trackTouch: true,
  });

  const handleAction = (action: () => void) => {
    action();
    setSwipeOffset(0); // Reset swipe after action
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons behind the card */}
      <div className="absolute inset-0 flex items-center">
        {/* Left side - Delete button */}
        {onDelete && (
          <div
            className="absolute right-0 h-full flex items-center justify-center bg-destructive px-6 transition-opacity"
            style={{
              opacity: swipeOffset < -20 ? 1 : 0,
              width: Math.abs(Math.min(swipeOffset, 0)),
            }}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleAction(onDelete)}
              className="text-destructive-foreground hover:bg-destructive/90"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {deleteLabel}
            </Button>
          </div>
        )}

        {/* Right side - Edit/Complete buttons */}
        {(onEdit || onComplete) && (
          <div
            className="absolute left-0 h-full flex items-center justify-center gap-2 bg-primary px-6 transition-opacity"
            style={{
              opacity: swipeOffset > 20 ? 1 : 0,
              width: Math.max(swipeOffset, 0),
            }}
          >
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(onEdit)}
                className="text-primary-foreground hover:bg-primary/90"
              >
                <Edit className="h-5 w-5 mr-2" />
                {editLabel}
              </Button>
            )}
            {onComplete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleAction(onComplete)}
                className="text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-5 w-5 mr-2" />
                {completeLabel}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Swipeable card content */}
      <div
        {...handlers}
        style={{
          transform: `translateX(${swipeOffset}px)`,
          transition: isSwiping ? "none" : "transform 0.3s ease-out",
        }}
        className={`relative ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-grab active:cursor-grabbing"}`}
      >
        <Card className={`${className} touch-none`}>
          {children}
        </Card>
      </div>

      {/* Tap to close swipe actions */}
      {swipeOffset !== 0 && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setSwipeOffset(0)}
        />
      )}
    </div>
  );
}
