import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Link2,
  Share2,
  Check,
} from "lucide-react";
import {
  shareOnFacebook,
  shareOnTwitter,
  shareOnLinkedIn,
  shareOnWhatsApp,
  copyShareLink,
  nativeShare,
  isNativeShareAvailable,
  type ShareData,
} from "@/lib/socialShare";
import { BadgeShareCard } from "./BadgeShareCard";
import hapticFeedback from "@/lib/haptic";
import { toast } from "sonner";

interface BadgeShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  badgeName: string;
  badgeIcon: string;
  badgeTier: string;
  badgeDescription: string;
  riderName: string;
  earnedDate: Date;
  points?: number;
}

export function BadgeShareDialog({
  open,
  onOpenChange,
  badgeName,
  badgeIcon,
  badgeTier,
  badgeDescription,
  riderName,
  earnedDate,
  points,
}: BadgeShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareData: ShareData = {
    badgeName,
    badgeTier,
    riderName,
  };

  const handleShare = async (platform: string) => {
    hapticFeedback.tap();

    switch (platform) {
      case "facebook":
        shareOnFacebook(shareData);
        break;
      case "twitter":
        shareOnTwitter(shareData);
        break;
      case "linkedin":
        shareOnLinkedIn(shareData);
        break;
      case "whatsapp":
        shareOnWhatsApp(shareData);
        break;
      case "copy":
        const success = await copyShareLink(shareData);
        if (success) {
          setCopied(true);
          hapticFeedback.success();
          toast.success("Link copied to clipboard!");
          setTimeout(() => setCopied(false), 2000);
        } else {
          toast.error("Failed to copy link");
        }
        break;
      case "native":
        const shared = await nativeShare(shareData);
        if (shared) {
          hapticFeedback.success();
          toast.success("Shared successfully!");
        }
        break;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Your Achievement
          </DialogTitle>
          <DialogDescription>
            Celebrate your success by sharing this badge with your network!
          </DialogDescription>
        </DialogHeader>

        {/* Share Card Preview */}
        <div className="my-4 overflow-hidden rounded-lg border border-gray-200 shadow-sm">
          <div className="scale-75 origin-top-left" style={{ width: "133.33%", height: "420px" }}>
            <BadgeShareCard
              badgeName={badgeName}
              badgeIcon={badgeIcon}
              badgeTier={badgeTier}
              badgeDescription={badgeDescription}
              riderName={riderName}
              earnedDate={earnedDate}
              points={points}
            />
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Share on:</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Native Share (Mobile) */}
            {isNativeShareAvailable() && (
              <Button
                variant="outline"
                className="h-12 justify-start gap-3"
                onClick={() => handleShare("native")}
              >
                <Share2 className="h-5 w-5 text-gray-600" />
                <span>Share...</span>
              </Button>
            )}

            {/* Facebook */}
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleShare("facebook")}
            >
              <Facebook className="h-5 w-5 text-blue-600" />
              <span>Facebook</span>
            </Button>

            {/* Twitter */}
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-5 w-5 text-sky-500" />
              <span>Twitter / X</span>
            </Button>

            {/* LinkedIn */}
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-5 w-5 text-blue-700" />
              <span>LinkedIn</span>
            </Button>

            {/* WhatsApp */}
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleShare("whatsapp")}
            >
              <MessageCircle className="h-5 w-5 text-green-600" />
              <span>WhatsApp</span>
            </Button>

            {/* Copy Link */}
            <Button
              variant="outline"
              className="h-12 justify-start gap-3"
              onClick={() => handleShare("copy")}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-green-600">Copied!</span>
                </>
              ) : (
                <>
                  <Link2 className="h-5 w-5 text-gray-600" />
                  <span>Copy Link</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tier Badge */}
        <div className="flex justify-center pt-2">
          <Badge className="bg-gray-900 text-white">
            {badgeTier.toUpperCase()} TIER
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}
