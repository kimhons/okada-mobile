import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Award, Star, TrendingUp, Zap, Gift, Lock, Check, Share2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { BadgeShareDialog } from "@/components/BadgeShareDialog";

const CATEGORY_ICONS: Record<string, any> = {
  earnings: TrendingUp,
  deliveries: Zap,
  streak: Award,
  quality: Star,
  speed: Trophy,
  special: Gift,
};

const TIER_COLORS: Record<string, string> = {
  bronze: "bg-amber-700 text-white",
  silver: "bg-gray-400 text-gray-900",
  gold: "bg-yellow-500 text-gray-900",
  platinum: "bg-cyan-400 text-gray-900",
  diamond: "bg-purple-500 text-white",
};

export default function BadgeShowcase() {
  const [selectedRider, setSelectedRider] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedBadgeForShare, setSelectedBadgeForShare] = useState<any>(null);

  // Fetch riders
  const { data: riders, isLoading: loadingRiders } = trpc.riders.getAllRiders.useQuery({});

  // Fetch badge definitions
  const { data: badgeDefinitions, isLoading: loadingDefinitions } = trpc.riders.getAllBadgeDefinitions.useQuery();

  // Fetch rider badges
  const { data: riderBadges, isLoading: loadingBadges } = trpc.riders.getBadges.useQuery(
    { riderId: parseInt(selectedRider) },
    { enabled: selectedRider !== "all" && !isNaN(parseInt(selectedRider)) }
  );

  // Fetch leaderboard
  const { data: leaderboard, isLoading: loadingLeaderboard } = trpc.riders.getBadgeLeaderboard.useQuery({ limit: 10 });

  // Filter badges by category
  const filteredBadges = badgeDefinitions?.filter(
    (badge) => selectedCategory === "all" || badge.category === selectedCategory
  );

  // Get earned badge IDs
  const earnedBadgeIds = new Set(
    riderBadges?.filter((rb) => rb.earnedAt).map((rb) => rb.badgeId) || []
  );

  // Get badge progress map
  const badgeProgressMap = new Map(
    riderBadges?.map((rb) => [rb.badgeId, rb.progress]) || []
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Badge Showcase</h1>
        <p className="text-sm text-gray-600 mt-1">Track achievements and milestones</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Select value={selectedRider} onValueChange={setSelectedRider}>
          <SelectTrigger className="h-12 w-full sm:w-[200px]">
            <SelectValue placeholder="Select Rider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Riders</SelectItem>
            {riders?.map((rider) => (
              <SelectItem key={rider.id} value={rider.id.toString()}>
                {rider.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="h-12 w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="earnings">Earnings</SelectItem>
            <SelectItem value="deliveries">Deliveries</SelectItem>
            <SelectItem value="streak">Streak</SelectItem>
            <SelectItem value="quality">Quality</SelectItem>
            <SelectItem value="speed">Speed</SelectItem>
            <SelectItem value="special">Special</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="badges" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* Badges Tab */}
        <TabsContent value="badges">
          {loadingDefinitions || loadingBadges ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBadges && filteredBadges.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBadges.map((badge) => {
                const isEarned = earnedBadgeIds.has(badge.id);
                const progress = badgeProgressMap.get(badge.id) || 0;
                const CategoryIcon = CATEGORY_ICONS[badge.category] || Award;

                return (
                  <Card
                    key={badge.id}
                    className={`relative overflow-hidden transition-all ${
                      isEarned
                        ? "border-2 border-green-500 shadow-lg"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* Tier Badge */}
                    <div className="absolute top-2 right-2">
                      <Badge className={TIER_COLORS[badge.tier]}>
                        {badge.tier.toUpperCase()}
                      </Badge>
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <CategoryIcon className="h-4 w-4 text-gray-600" />
                        <span className="text-xs text-gray-600 capitalize">{badge.category}</span>
                      </div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {badge.name}
                        {isEarned && <Check className="h-5 w-5 text-green-600" />}
                      </CardTitle>
                    </CardHeader>

                    <CardContent>
                      {/* Badge Icon */}
                      <div className="flex justify-center mb-4">
                        <div
                          className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl ${
                            isEarned ? "bg-gradient-to-br from-yellow-400 to-yellow-600" : "bg-gray-200"
                          }`}
                        >
                          {isEarned ? badge.icon : <Lock className="h-12 w-12 text-gray-400" />}
                        </div>
                      </div>

                      {/* Description */}
                      <CardDescription className="text-center mb-4">
                        {badge.description}
                      </CardDescription>

                      {/* Progress Bar (if not earned and rider selected) */}
                      {!isEarned && selectedRider !== "all" && progress > 0 && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      )}

                      {/* Points */}
                      <div className="flex items-center justify-center gap-2 mt-4 text-sm text-gray-600">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>{badge.points} points</span>
                      </div>

                      {/* Share Button (only for earned badges) */}
                      {isEarned && selectedRider !== "all" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => {
                            const riderData = riders?.find(r => r.id === parseInt(selectedRider));
                            setSelectedBadgeForShare({
                              badge,
                              riderName: riderData?.name || "Rider",
                              earnedDate: riderBadges?.find(rb => rb.badgeId === badge.id)?.earnedAt || new Date(),
                            });
                            setShareDialogOpen(true);
                          }}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No badges found for this category</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard">
          {loadingLeaderboard ? (
            <Card>
              <CardContent className="py-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : leaderboard && leaderboard.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Top Badge Collectors</CardTitle>
                <CardDescription>Riders with the most badges and points</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div
                      key={entry.riderId}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        index === 0
                          ? "bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-400"
                          : index === 1
                          ? "bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-400"
                          : index === 2
                          ? "bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-400"
                          : "bg-gray-50"
                      }`}
                    >
                      {/* Rank */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center font-bold text-lg">
                        {index + 1}
                      </div>

                      {/* Rider Info */}
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{entry.riderName}</div>
                        <div className="text-sm text-gray-600">
                          {entry.badgeCount} badge{entry.badgeCount !== 1 ? "s" : ""}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="flex items-center gap-2 text-right">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="font-bold text-lg">{entry.totalPoints}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No leaderboard data available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Share Dialog */}
      {selectedBadgeForShare && (
        <BadgeShareDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          badgeName={selectedBadgeForShare.badge.name}
          badgeIcon={selectedBadgeForShare.badge.icon}
          badgeTier={selectedBadgeForShare.badge.tier}
          badgeDescription={selectedBadgeForShare.badge.description}
          riderName={selectedBadgeForShare.riderName}
          earnedDate={new Date(selectedBadgeForShare.earnedDate)}
          points={selectedBadgeForShare.badge.points}
        />
      )}
    </div>
  );
}
