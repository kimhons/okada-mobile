import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Trophy, TrendingUp, Users, DollarSign, Award } from "lucide-react";
import RiderDetailModal from "@/components/RiderDetailModal";

type Period = 'today' | 'week' | 'month' | 'all';
type Category = 'overall' | 'earnings' | 'deliveries' | 'rating' | 'speed';

const tierColors = {
  platinum: "bg-purple-100 text-purple-800 border-purple-300",
  gold: "bg-yellow-100 text-yellow-800 border-yellow-300",
  silver: "bg-gray-100 text-gray-800 border-gray-300",
  bronze: "bg-orange-100 text-orange-800 border-orange-300",
  rookie: "bg-blue-100 text-blue-800 border-blue-300",
};

const statusColors = {
  available: "bg-green-500",
  en_route_pickup: "bg-blue-500",
  en_route_delivery: "bg-blue-500",
  idle: "bg-yellow-500",
  offline: "bg-gray-400",
};

export default function RiderLeaderboard() {
  const [period, setPeriod] = useState<Period>('week');
  const [category, setCategory] = useState<Category>('overall');
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: leaderboardData, isLoading } = trpc.leaderboard.getLeaderboard.useQuery({
    period,
    category,
    limit: 50,
    offset: 0,
  });

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const formatCurrency = (cents: number) => {
    return (cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case 'today': return 'Today';
      case 'week': return 'This Week';
      case 'month': return 'This Month';
      case 'all': return 'All Time';
    }
  };

  const handleRowClick = (riderId: number) => {
    setSelectedRiderId(riderId);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Rider Performance Leaderboard
        </h1>
        <p className="text-muted-foreground mt-1">Track and celebrate top-performing riders</p>
      </div>

      {!isLoading && leaderboardData && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboardData.stats.totalRiders}</div>
              <p className="text-xs text-muted-foreground">Active in {getPeriodLabel(period).toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboardData.stats.totalDeliveries.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Completed {getPeriodLabel(period).toLowerCase()}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Performance</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leaderboardData.stats.avgPerformanceScore}</div>
              <p className="text-xs text-muted-foreground">Out of 100 points</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(leaderboardData.stats.totalEarnings)} FCFA</div>
              <p className="text-xs text-muted-foreground">Earned {getPeriodLabel(period).toLowerCase()}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Leaderboard</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>

              <Select value={category} onValueChange={(value) => setCategory(value as Category)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall Performance</SelectItem>
                  <SelectItem value="earnings">Top Earners</SelectItem>
                  <SelectItem value="deliveries">Delivery Champions</SelectItem>
                  <SelectItem value="rating">Customer Favorites</SelectItem>
                  <SelectItem value="speed">Speed Masters</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : leaderboardData && leaderboardData.leaderboard.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Rank</TableHead>
                    <TableHead>Rider</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Deliveries</TableHead>
                    <TableHead className="text-right">Rating</TableHead>
                    <TableHead className="text-right">On-Time</TableHead>
                    <TableHead className="text-right">Earnings</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.leaderboard.map((rider) => {
                    const medal = getMedalEmoji(rider.rank);
                    return (
                      <TableRow 
                        key={rider.riderId}
                        className={`${rider.rank <= 3 ? "bg-yellow-50/50" : ""} cursor-pointer hover:bg-muted/50`}
                        onClick={() => handleRowClick(rider.riderId)}
                      >
                        <TableCell className="font-medium">
                          {medal ? <span className="text-2xl">{medal}</span> : <span className="text-muted-foreground">#{rider.rank}</span>}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{rider.name}</div>
                            <div className="text-sm text-muted-foreground">{rider.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={tierColors[rider.tier]}>{rider.tier.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-bold text-lg">{rider.performanceScore}</div>
                          <div className="text-xs text-muted-foreground">/ 100</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{rider.deliveries}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="font-medium">{rider.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-medium">{rider.onTimeRate}%</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium">{formatCurrency(rider.totalEarnings)}</div>
                          <div className="text-xs text-muted-foreground">FCFA</div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${statusColors[rider.currentStatus] || statusColors.offline}`} />
                            <span className="text-xs text-muted-foreground capitalize">{rider.currentStatus?.replace('_', ' ') || 'offline'}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No riders found for {getPeriodLabel(period).toLowerCase()}</div>
          )}
        </CardContent>
      </Card>

      <RiderDetailModal riderId={selectedRiderId} open={modalOpen} onOpenChange={setModalOpen} />
    </div>
  );
}
