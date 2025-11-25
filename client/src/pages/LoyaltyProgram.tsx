import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Award, TrendingUp, Users, Gift, Star, Crown, Medal, Trophy, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function LoyaltyProgram() {
  const [addPointsDialogOpen, setAddPointsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    userId: "",
    points: "",
    transactionType: "earned",
    description: "",
  });

  const { data: tiers, isLoading: tiersLoading, refetch: refetchTiers } = trpc.loyalty.getTiers.useQuery();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.loyalty.getStats.useQuery();
  const { data: rewardsCatalog, isLoading: rewardsLoading } = trpc.loyalty.getRewardsCatalog.useQuery({});

  const addPointsMutation = trpc.loyalty.addPoints.useMutation({
    onSuccess: () => {
      toast.success("Points added successfully");
      setAddPointsDialogOpen(false);
      refetchStats();
      setFormData({
        userId: "",
        points: "",
        transactionType: "earned",
        description: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to add points: ${error.message}`);
    },
  });

  const handleAddPoints = () => {
    if (!formData.userId || !formData.points || !formData.description) {
      toast.error("Please fill in all required fields");
      return;
    }
    addPointsMutation.mutate({
      userId: parseInt(formData.userId),
      points: parseInt(formData.points),
      transactionType: formData.transactionType,
      description: formData.description,
    });
  };

  const getTierIcon = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('platinum')) return <Crown className="w-6 h-6" />;
    if (name.includes('gold')) return <Trophy className="w-6 h-6" />;
    if (name.includes('silver')) return <Medal className="w-6 h-6" />;
    return <Star className="w-6 h-6" />;
  };

  const getTierGradient = (tierName: string) => {
    const name = tierName.toLowerCase();
    if (name.includes('platinum')) return 'from-purple-500 to-pink-500';
    if (name.includes('gold')) return 'from-yellow-500 to-orange-500';
    if (name.includes('silver')) return 'from-gray-400 to-gray-600';
    return 'from-orange-500 to-red-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  if (tiersLoading || statsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Loyalty Program</h1>
          <p className="text-muted-foreground mt-1">
            Manage loyalty tiers, points, and rewards
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { refetchTiers(); refetchStats(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setAddPointsDialogOpen(true)}>
            <Gift className="w-4 h-4 mr-2" />
            Add Points
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Total Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalMembers || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-muted-foreground" />
              Points Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalPointsIssued?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="w-4 h-4 text-muted-foreground" />
              Points Redeemed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalPointsRedeemed?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              Total Redemptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalRedemptions || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Loyalty Tiers */}
      <Card>
        <CardHeader>
          <CardTitle>Loyalty Tiers</CardTitle>
          <CardDescription>
            Membership tiers with benefits and requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers?.map((tier) => (
              <Card key={tier.id} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${getTierGradient(tier.name)}`} />
                <CardHeader className="pb-3 pt-6">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg capitalize">{tier.name}</CardTitle>
                    <div className={`p-2 rounded-full bg-gradient-to-r ${getTierGradient(tier.name)} text-white`}>
                      {getTierIcon(tier.name)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Points Range</div>
                    <p className="text-lg font-bold">
                      {tier.minPoints.toLocaleString()} - {tier.maxPoints?.toLocaleString() || '∞'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-muted-foreground">Discount</div>
                      <p className="text-sm font-semibold">{tier.discountPercentage}%</p>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Multiplier</div>
                      <p className="text-sm font-semibold">{(tier.pointsMultiplier / 100).toFixed(1)}x</p>
                    </div>
                  </div>
                  {tier.benefits && (
                    <div className="pt-2 border-t">
                      <div className="text-xs text-muted-foreground mb-1">Benefits</div>
                      <div className="flex flex-wrap gap-1">
                        {JSON.parse(tier.benefits).slice(0, 2).map((benefit: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {benefit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <Badge variant={tier.isActive ? "default" : "secondary"} className="text-xs">
                    {tier.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {tiers?.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No loyalty tiers configured yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rewards Catalog */}
      <Card>
        <CardHeader>
          <CardTitle>Rewards Catalog</CardTitle>
          <CardDescription>
            Available rewards for members to redeem
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rewardsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48" />
              ))}
            </div>
          ) : rewardsCatalog && rewardsCatalog.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rewardsCatalog.map((reward) => (
                <Card key={reward.id} className="border-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{reward.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {reward.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Points Cost</div>
                        <p className="text-2xl font-bold">{reward.pointsCost.toLocaleString()}</p>
                      </div>
                      <Gift className="w-8 h-8 text-primary" />
                    </div>
                    {reward.rewardValue && (
                      <div>
                        <div className="text-xs text-muted-foreground">Value</div>
                        <p className="text-lg font-semibold">{formatCurrency(reward.rewardValue)}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="outline" className="capitalize text-xs">
                        {reward.rewardType.replace('_', ' ')}
                      </Badge>
                      {reward.stock !== null && (
                        <span className="text-xs text-muted-foreground">
                          Stock: {reward.stock}
                        </span>
                      )}
                    </div>
                    <Badge variant={reward.isActive ? "default" : "secondary"} className="text-xs">
                      {reward.isActive ? "Available" : "Unavailable"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rewards available yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Points Dialog */}
      <Dialog open={addPointsDialogOpen} onOpenChange={setAddPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Loyalty Points</DialogTitle>
            <DialogDescription>
              Award or deduct points from a user's account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID *</Label>
              <Input
                id="userId"
                type="number"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <Label htmlFor="points">Points *</Label>
              <Input
                id="points"
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="Enter points (positive or negative)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use positive numbers to add points, negative to deduct
              </p>
            </div>
            <div>
              <Label htmlFor="transactionType">Transaction Type *</Label>
              <Select value={formData.transactionType} onValueChange={(value) => setFormData({ ...formData, transactionType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="earned">Earned</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Reason for points adjustment"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPointsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPoints} disabled={addPointsMutation.isPending}>
              {addPointsMutation.isPending ? "Processing..." : "Add Points"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
