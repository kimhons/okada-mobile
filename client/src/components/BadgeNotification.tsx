import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Trophy, Star, Share2 } from "lucide-react";
import hapticFeedback from "@/lib/haptic";
import confetti from "canvas-confetti";
import { BadgeShareDialog } from "./BadgeShareDialog";

interface BadgeNotificationProps {
  riderId: number;
}

export function BadgeNotification({ riderId }: BadgeNotificationProps) {
  const [showNotification, setShowNotification] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<any>(null);
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data: notifications, refetch } = trpc.riders.getBadgeNotifications.useQuery(
    { riderId },
    {
      refetchInterval: 30000, // Poll every 30 seconds
    }
  );

  const markReadMutation = trpc.riders.markNotificationRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  useEffect(() => {
    if (notifications && notifications.length > 0 && !showNotification) {
      const notification = notifications[0];
      setCurrentNotification(notification);
      setShowNotification(true);

      // Trigger celebration effects
      if (notification.type === "earned") {
        celebrateBadge();
      }
    }
  }, [notifications, showNotification]);

  const celebrateBadge = () => {
    // Haptic feedback
    hapticFeedback.success();

    // Confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FFD700", "#FFA500", "#FF6347"],
    });
  };

  const handleDismiss = () => {
    if (currentNotification) {
      markReadMutation.mutate({ notificationId: currentNotification.id });
    }
    setShowNotification(false);
    setCurrentNotification(null);
  };

  if (!showNotification || !currentNotification) {
    return null;
  }

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-right-5">
      <Card className="w-80 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-400 shadow-2xl">
        <div className="p-6 relative">
          {/* Close Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Badge Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl shadow-lg">
              {currentNotification.badge?.icon || <Trophy className="h-10 w-10 text-white" />}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-600" />
              <h3 className="text-lg font-bold text-gray-900">Badge Earned!</h3>
              <Star className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-gray-900">{currentNotification.badge?.name}</p>
          </div>

          {/* Message */}
          <p className="text-center text-sm text-gray-700 mb-4">
            {currentNotification.message}
          </p>

          {/* Points */}
          {currentNotification.badge?.points && (
            <div className="text-center text-sm text-gray-600 mb-4">
              <span className="font-semibold">+{currentNotification.badge.points} points</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={() => setShowShareDialog(true)}
              variant="outline"
              className="flex-1 border-yellow-500 text-yellow-700 hover:bg-yellow-50"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={handleDismiss}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold"
            >
              Awesome!
            </Button>
          </div>

          {/* Share Dialog */}
          {currentNotification?.badge && (
            <BadgeShareDialog
              open={showShareDialog}
              onOpenChange={setShowShareDialog}
              badgeName={currentNotification.badge.name}
              badgeIcon={currentNotification.badge.icon}
              badgeTier={currentNotification.badge.tier}
              badgeDescription={currentNotification.badge.description}
              riderName="Rider" // TODO: Get actual rider name
              earnedDate={new Date()}
              points={currentNotification.badge.points}
            />
          )}
        </div>
      </Card>
    </div>
  );
}

export function BadgeNotificationContainer({ riderId }: { riderId: number }) {
  return <BadgeNotification riderId={riderId} />;
}
