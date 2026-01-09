import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Award, Star, Trophy, Zap, Target, Clock, Shield, Heart, Flame, Crown } from "lucide-react";

export interface BadgeData {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  tier?: "bronze" | "silver" | "gold" | "platinum" | "diamond";
  points?: number;
  earnedAt?: Date | string;
  category?: string;
}

interface BadgeDisplayProps {
  badges: BadgeData[];
  maxDisplay?: number;
  size?: "sm" | "md" | "lg";
  showPoints?: boolean;
  showTooltip?: boolean;
}

const TIER_STYLES: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: "bg-amber-100", border: "border-amber-600", text: "text-amber-800" },
  silver: { bg: "bg-gray-100", border: "border-gray-400", text: "text-gray-700" },
  gold: { bg: "bg-yellow-100", border: "border-yellow-500", text: "text-yellow-800" },
  platinum: { bg: "bg-cyan-100", border: "border-cyan-400", text: "text-cyan-800" },
  diamond: { bg: "bg-purple-100", border: "border-purple-500", text: "text-purple-800" },
};

const SIZE_STYLES = {
  sm: { container: "w-8 h-8", icon: "h-4 w-4", text: "text-xs" },
  md: { container: "w-12 h-12", icon: "h-6 w-6", text: "text-sm" },
  lg: { container: "w-16 h-16", icon: "h-8 w-8", text: "text-base" },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  "🏆": Trophy,
  "⭐": Star,
  "⚡": Zap,
  "🎯": Target,
  "⏱️": Clock,
  "🛡️": Shield,
  "❤️": Heart,
  "🔥": Flame,
  "👑": Crown,
  default: Award,
};

function getBadgeIcon(icon?: string) {
  if (!icon) return Award;
  return ICON_MAP[icon] || ICON_MAP.default;
}

export function BadgeDisplay({
  badges,
  maxDisplay = 6,
  size = "md",
  showPoints = false,
  showTooltip = true,
}: BadgeDisplayProps) {
  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;
  const totalPoints = badges.reduce((sum, b) => sum + (b.points || 0), 0);
  const sizeStyle = SIZE_STYLES[size];

  if (badges.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Award className="h-5 w-5 opacity-50" />
        <span className="text-sm">No badges earned yet</span>
      </div>
    );
  }

  const BadgeItem = ({ badge }: { badge: BadgeData }) => {
    const IconComponent = getBadgeIcon(badge.icon);
    const tierStyle = badge.tier ? TIER_STYLES[badge.tier] : TIER_STYLES.bronze;

    const content = (
      <div
        className={`${sizeStyle.container} rounded-full ${tierStyle.bg} border-2 ${tierStyle.border} flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-sm`}
      >
        <IconComponent className={`${sizeStyle.icon} ${tierStyle.text}`} />
      </div>
    );

    if (!showTooltip) return content;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            {badge.description && (
              <p className="text-xs text-muted-foreground max-w-[200px]">{badge.description}</p>
            )}
            {badge.tier && (
              <Badge variant="outline" className="mt-1 capitalize">
                {badge.tier}
              </Badge>
            )}
            {badge.points && <p className="text-xs mt-1">{badge.points} points</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center">
        {displayBadges.map((badge) => (
          <BadgeItem key={badge.id} badge={badge} />
        ))}

        {remainingCount > 0 && (
          <div
            className={`${sizeStyle.container} rounded-full bg-muted flex items-center justify-center ${sizeStyle.text} font-medium text-muted-foreground`}
          >
            +{remainingCount}
          </div>
        )}
      </div>

      {showPoints && totalPoints > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Star className="h-4 w-4 text-yellow-500" />
          <span>{totalPoints} total points</span>
        </div>
      )}
    </div>
  );
}

export default BadgeDisplay;
