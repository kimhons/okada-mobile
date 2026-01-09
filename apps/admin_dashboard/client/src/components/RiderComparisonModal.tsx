import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Trophy, TrendingUp, DollarSign, Star, Clock, CheckCircle, Camera, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface RiderComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  riderId1: number;
  riderId2: number;
  period?: 'today' | 'week' | 'month' | 'all';
}

export default function RiderComparisonModal({
  open,
  onOpenChange,
  riderId1,
  riderId2,
  period = 'all',
}: RiderComparisonModalProps) {
  const { data: comparison, isLoading } = trpc.leaderboard.compareRiders.useQuery(
    { riderId1, riderId2, period },
    { enabled: open && riderId1 > 0 && riderId2 > 0 }
  );

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  const getWinnerIndicator = (winner: number, currentRider: 1 | 2) => {
    if (winner === 0) return <Minus className="h-4 w-4 text-gray-400" />;
    if (winner === currentRider) return <ArrowUp className="h-4 w-4 text-green-500" />;
    return <ArrowDown className="h-4 w-4 text-red-500" />;
  };

  const getDifferenceColor = (diff: number) => {
    if (diff > 0) return "text-green-600";
    if (diff < 0) return "text-red-600";
    return "text-gray-600";
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comparing Riders...</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!comparison) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comparison Not Available</DialogTitle>
          </DialogHeader>
          <p>Unable to load comparison data for these riders.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const { rider1, rider2, winners, differences } = comparison;

  // Prepare trend chart data
  const trendData = rider1.trend.map((day, index) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    rider1Deliveries: day.deliveries,
    rider2Deliveries: rider2.trend[index]?.deliveries || 0,
    rider1Earnings: day.earnings / 100,
    rider2Earnings: (rider2.trend[index]?.earnings || 0) / 100,
  }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Rider Performance Comparison</DialogTitle>
        </DialogHeader>

        {/* Rider Headers */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{rider1.rider.name}</span>
                {winners.performanceScore === 1 && <Trophy className="h-6 w-6 text-yellow-500" />}
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                {rider1.rider.phone}
              </Badge>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{rider2.rider.name}</span>
                {winners.performanceScore === 2 && <Trophy className="h-6 w-6 text-yellow-500" />}
              </CardTitle>
              <Badge variant="outline" className="w-fit">
                {rider2.rider.phone}
              </Badge>
            </CardHeader>
          </Card>
        </div>

        {/* Performance Metrics Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Performance Score */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.performanceScore, 1)}
                    <span className="text-2xl font-bold">{rider1.performanceScore}</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <Trophy className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">Performance Score</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.performanceScore)}`}>
                    {differences.performanceScore > 0 ? '+' : ''}{differences.performanceScore}
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{rider2.performanceScore}</span>
                    {getWinnerIndicator(winners.performanceScore, 2)}
                  </div>
                </div>
              </div>

              {/* Deliveries */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.deliveries, 1)}
                    <span className="text-xl font-semibold">{rider1.deliveries}</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <TrendingUp className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">Deliveries</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.deliveries)}`}>
                    {differences.deliveries > 0 ? '+' : ''}{differences.deliveries}
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{rider2.deliveries}</span>
                    {getWinnerIndicator(winners.deliveries, 2)}
                  </div>
                </div>
              </div>

              {/* Earnings */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.earnings, 1)}
                    <span className="text-xl font-semibold">{formatCurrency(rider1.totalEarnings)}</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <DollarSign className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">Total Earnings</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.earnings)}`}>
                    {differences.earnings > 0 ? '+' : ''}{formatCurrency(Math.abs(differences.earnings))}
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{formatCurrency(rider2.totalEarnings)}</span>
                    {getWinnerIndicator(winners.earnings, 2)}
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.rating, 1)}
                    <span className="text-xl font-semibold">{rider1.rating.toFixed(1)}★</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <Star className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">Customer Rating</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.rating)}`}>
                    {differences.rating > 0 ? '+' : ''}{differences.rating.toFixed(1)}
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{rider2.rating.toFixed(1)}★</span>
                    {getWinnerIndicator(winners.rating, 2)}
                  </div>
                </div>
              </div>

              {/* On-Time Rate */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.onTimeRate, 1)}
                    <span className="text-xl font-semibold">{rider1.onTimeRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <Clock className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">On-Time Rate</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.onTimeRate)}`}>
                    {differences.onTimeRate > 0 ? '+' : ''}{differences.onTimeRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{rider2.onTimeRate.toFixed(1)}%</span>
                    {getWinnerIndicator(winners.onTimeRate, 2)}
                  </div>
                </div>
              </div>

              {/* Acceptance Rate */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.acceptanceRate, 1)}
                    <span className="text-xl font-semibold">{rider1.acceptanceRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <CheckCircle className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">Acceptance Rate</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.acceptanceRate)}`}>
                    {differences.acceptanceRate > 0 ? '+' : ''}{differences.acceptanceRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{rider2.acceptanceRate.toFixed(1)}%</span>
                    {getWinnerIndicator(winners.acceptanceRate, 2)}
                  </div>
                </div>
              </div>

              {/* Quality Photo Rate */}
              <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center">
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {getWinnerIndicator(winners.qualityPhotoRate, 1)}
                    <span className="text-xl font-semibold">{rider1.qualityPhotoRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-center px-4">
                  <Camera className="h-5 w-5 mx-auto text-gray-400" />
                  <div className="text-sm text-gray-600">Quality Photo Rate</div>
                  <div className={`text-xs font-medium ${getDifferenceColor(differences.qualityPhotoRate)}`}>
                    {differences.qualityPhotoRate > 0 ? '+' : ''}{differences.qualityPhotoRate.toFixed(1)}%
                  </div>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-semibold">{rider2.qualityPhotoRate.toFixed(1)}%</span>
                    {getWinnerIndicator(winners.qualityPhotoRate, 2)}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 30-Day Deliveries Trend */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Delivery Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rider1Deliveries"
                  stroke="#8884d8"
                  name={rider1.rider.name}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rider2Deliveries"
                  stroke="#82ca9d"
                  name={rider2.rider.name}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 30-Day Earnings Trend */}
        <Card>
          <CardHeader>
            <CardTitle>30-Day Earnings Trend (FCFA)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rider1Earnings"
                  stroke="#8884d8"
                  name={rider1.rider.name}
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="rider2Earnings"
                  stroke="#82ca9d"
                  name={rider2.rider.name}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Earnings Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{rider1.rider.name} - Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Base Earnings:</span>
                <span className="font-semibold">{formatCurrency(rider1.earningsBreakdown.base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bonuses:</span>
                <span className="font-semibold">{formatCurrency(rider1.earningsBreakdown.bonus)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tips:</span>
                <span className="font-semibold">{formatCurrency(rider1.earningsBreakdown.tips)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Total:</span>
                <span className="font-bold">{formatCurrency(rider1.totalEarnings)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{rider2.rider.name} - Earnings Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Base Earnings:</span>
                <span className="font-semibold">{formatCurrency(rider2.earningsBreakdown.base)}</span>
              </div>
              <div className="flex justify-between">
                <span>Bonuses:</span>
                <span className="font-semibold">{formatCurrency(rider2.earningsBreakdown.bonus)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tips:</span>
                <span className="font-semibold">{formatCurrency(rider2.earningsBreakdown.tips)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="font-bold">Total:</span>
                <span className="font-bold">{formatCurrency(rider2.totalEarnings)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
