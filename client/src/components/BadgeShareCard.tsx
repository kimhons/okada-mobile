import { useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";

interface BadgeShareCardProps {
  badgeName: string;
  badgeIcon: string;
  badgeTier: string;
  badgeDescription: string;
  riderName: string;
  earnedDate: Date;
  points?: number;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "bg-gradient-to-br from-amber-700 to-amber-900",
  silver: "bg-gradient-to-br from-gray-400 to-gray-600",
  gold: "bg-gradient-to-br from-yellow-400 to-yellow-600",
  platinum: "bg-gradient-to-br from-cyan-400 to-cyan-600",
  diamond: "bg-gradient-to-br from-purple-500 to-purple-700",
};

const TIER_BG: Record<string, string> = {
  bronze: "bg-amber-50",
  silver: "bg-gray-50",
  gold: "bg-yellow-50",
  platinum: "bg-cyan-50",
  diamond: "bg-purple-50",
};

export function BadgeShareCard({
  badgeName,
  badgeIcon,
  badgeTier,
  badgeDescription,
  riderName,
  earnedDate,
  points,
}: BadgeShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={cardRef}
      className={`w-[600px] h-[315px] ${TIER_BG[badgeTier] || "bg-gray-50"} p-8 relative overflow-hidden`}
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-gray-900 to-transparent rounded-full -translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-gray-900 to-transparent rounded-full translate-x-32 translate-y-32" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 object-contain" />
            )}
            <div>
              <div className="text-sm font-semibold text-gray-900">{APP_TITLE}</div>
              <div className="text-xs text-gray-600">Achievement Unlocked</div>
            </div>
          </div>
          <Badge className="bg-gray-900 text-white text-xs px-3 py-1">
            {badgeTier.toUpperCase()}
          </Badge>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center gap-8">
          {/* Badge Icon */}
          <div className={`w-40 h-40 rounded-full ${TIER_COLORS[badgeTier] || "bg-gray-500"} flex items-center justify-center shadow-2xl`}>
            <span className="text-7xl">{badgeIcon}</span>
          </div>

          {/* Badge Info */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{badgeName}</h2>
            <p className="text-base text-gray-700 mb-4">{badgeDescription}</p>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">{riderName}</span>
              </div>
              {points && (
                <div className="flex items-center gap-1">
                  <span>•</span>
                  <span className="font-semibold">{points} points</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Earned on {earnedDate.toLocaleDateString()}</span>
          <span className="font-semibold">Keep up the great work! 🎉</span>
        </div>
      </div>
    </div>
  );
}

export function BadgeShareCardRef({
  badgeName,
  badgeIcon,
  badgeTier,
  badgeDescription,
  riderName,
  earnedDate,
  points,
}: BadgeShareCardProps) {
  return (
    <BadgeShareCard
      badgeName={badgeName}
      badgeIcon={badgeIcon}
      badgeTier={badgeTier}
      badgeDescription={badgeDescription}
      riderName={riderName}
      earnedDate={earnedDate}
      points={points}
    />
  );
}
