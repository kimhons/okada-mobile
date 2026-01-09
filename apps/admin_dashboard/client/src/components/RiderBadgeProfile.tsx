import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, Star } from "lucide-react";

interface RiderBadgeProfileProps {
  riderId: number;
}

const TIER_COLORS: Record<string, string> = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-gray-400 text-gray-900",
  gold: "bg-yellow-500 text-gray-900",
  platinum: "bg-cyan-400 text-gray-900",
  diamond: "bg-purple-500 text-white",
};

export function RiderBadgeProfile({ riderId }: RiderBadgeProfileProps) {
  const { data: riderBadges, isLoading } = trpc.riders.getBadges.useQuery({ riderId });

  const earnedBadges = riderBadges?.filter((rb) => rb.earnedAt) || [];
  const totalPoints = earnedBadges.reduce((sum, rb) => sum + (rb.badge?.points || 0), 0);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={`skeleton-${i}`} className="h-16 w-16 rounded-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (earnedBadges.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges & Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No badges earned yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Badges & Achievements
          </span>
          <div className="flex items-center gap-2 text-sm font-normal text-gray-600">
            <Star className="h-4 w-4 text-yellow-500" />
            <span>{totalPoints} points</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {earnedBadges.slice(0, 6).map((rb) => (
            <div
              key={rb.id}
              className="group relative"
              title={rb.badge?.description}
            >
              {/* Badge Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-3xl shadow-md hover:shadow-lg transition-shadow cursor-pointer">
                {rb.badge?.icon}
              </div>

              {/* Tier Badge */}
              {rb.badge?.tier && (
                <div className="absolute -top-1 -right-1">
                  <Badge className={`${TIER_COLORS[rb.badge.tier]} text-xs px-1 py-0`}>
                    {rb.badge.tier[0].toUpperCase()}
                  </Badge>
                </div>
              )}

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                  {rb.badge?.name}
                </div>
              </div>
            </div>
          ))}

          {earnedBadges.length > 6 && (
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600">
              +{earnedBadges.length - 6}
            </div>
          )}
        </div>

        {earnedBadges.length > 0 && (
          <div className="mt-4 text-sm text-gray-600">
            {earnedBadges.length} badge{earnedBadges.length !== 1 ? "s" : ""} earned
          </div>
        )}
      </CardContent>
    </Card>
  );
}
