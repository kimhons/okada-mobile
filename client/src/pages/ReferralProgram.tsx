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
import { Users, Gift, TrendingUp, DollarSign, Share2, CheckCircle, Clock, XCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function ReferralProgram() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [rewardDialogOpen, setRewardDialogOpen] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("bronze");
  const [formData, setFormData] = useState({
    referrerUserId: "",
    referredUserEmail: "",
    referredUserPhone: "",
    rewardTier: "bronze",
  });
  const [rewardFormData, setRewardFormData] = useState({
    tier: "bronze",
    referrerReward: "",
    referredReward: "",
    minOrderValue: "",
    description: "",
  });

  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = trpc.referrals.getStats.useQuery({});
  const { data: rewards, isLoading: rewardsLoading, refetch: refetchRewards } = trpc.referrals.getRewards.useQuery();

  const createMutation = trpc.referrals.create.useMutation({
    onSuccess: () => {
      toast.success("Referral created successfully");
      setCreateDialogOpen(false);
      refetchStats();
      setFormData({
        referrerUserId: "",
        referredUserEmail: "",
        referredUserPhone: "",
        rewardTier: "bronze",
      });
    },
    onError: (error) => {
      toast.error(`Failed to create referral: ${error.message}`);
    },
  });

  const updateRewardMutation = trpc.referrals.updateReward.useMutation({
    onSuccess: () => {
      toast.success("Reward configuration updated successfully");
      setRewardDialogOpen(false);
      refetchRewards();
    },
    onError: (error) => {
      toast.error(`Failed to update reward: ${error.message}`);
    },
  });

  const handleCreateReferral = () => {
    if (!formData.referrerUserId) {
      toast.error("Please enter a referrer user ID");
      return;
    }
    createMutation.mutate({
      referrerUserId: parseInt(formData.referrerUserId),
      referredUserEmail: formData.referredUserEmail || undefined,
      referredUserPhone: formData.referredUserPhone || undefined,
      rewardTier: formData.rewardTier,
    });
  };

  const handleUpdateReward = () => {
    if (!rewardFormData.referrerReward || !rewardFormData.referredReward || !rewardFormData.minOrderValue) {
      toast.error("Please fill in all required fields");
      return;
    }
    updateRewardMutation.mutate({
      tier: rewardFormData.tier,
      referrerReward: parseInt(rewardFormData.referrerReward),
      referredReward: parseInt(rewardFormData.referredReward),
      minOrderValue: parseInt(rewardFormData.minOrderValue),
      description: rewardFormData.description || undefined,
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      bronze: "bg-orange-100 text-orange-800 border-orange-200",
      silver: "bg-gray-100 text-gray-800 border-gray-200",
      gold: "bg-yellow-100 text-yellow-800 border-yellow-200",
      platinum: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[tier] || colors.bronze;
  };

  if (statsLoading || rewardsLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
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
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground mt-1">
            Manage referrals and reward configurations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => { refetchStats(); refetchRewards(); }}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Share2 className="w-4 h-4 mr-2" />
            Create Referral
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats?.totalReferrals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">{stats?.completedReferrals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingReferrals || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              Total Rewards Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(stats?.totalRewards || 0)}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Pending: {formatCurrency(stats?.pendingRewards || 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Reward Tiers */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Reward Tiers Configuration</CardTitle>
              <CardDescription>
                Manage reward amounts for different referral tiers
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setRewardDialogOpen(true)}>
              Edit Rewards
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {rewards?.map((reward) => (
              <Card key={reward.tier} className={`border-2 ${getTierColor(reward.tier)}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center justify-between">
                    {reward.tier}
                    <Gift className="w-5 h-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground">Referrer Reward</div>
                    <p className="text-xl font-bold">{formatCurrency(reward.referrerReward)}</p>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Referred User Reward</div>
                    <p className="text-lg font-semibold">{formatCurrency(reward.referredReward)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">Min Order Value</div>
                    <p className="text-sm font-medium">{formatCurrency(reward.minOrderValue)}</p>
                  </div>
                  {reward.description && (
                    <p className="text-xs text-muted-foreground">{reward.description}</p>
                  )}
                  <Badge variant={reward.isActive ? "default" : "secondary"} className="text-xs">
                    {reward.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          {rewards?.length === 0 && (
            <div className="text-center py-12">
              <Gift className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reward tiers configured yet</p>
              <Button variant="outline" className="mt-4" onClick={() => setRewardDialogOpen(true)}>
                Configure Rewards
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Referral Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Referral</DialogTitle>
            <DialogDescription>
              Generate a referral code for a user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="referrerUserId">Referrer User ID *</Label>
              <Input
                id="referrerUserId"
                type="number"
                value={formData.referrerUserId}
                onChange={(e) => setFormData({ ...formData, referrerUserId: e.target.value })}
                placeholder="Enter user ID"
              />
            </div>
            <div>
              <Label htmlFor="referredUserEmail">Referred User Email</Label>
              <Input
                id="referredUserEmail"
                type="email"
                value={formData.referredUserEmail}
                onChange={(e) => setFormData({ ...formData, referredUserEmail: e.target.value })}
                placeholder="optional@example.com"
              />
            </div>
            <div>
              <Label htmlFor="referredUserPhone">Referred User Phone</Label>
              <Input
                id="referredUserPhone"
                type="tel"
                value={formData.referredUserPhone}
                onChange={(e) => setFormData({ ...formData, referredUserPhone: e.target.value })}
                placeholder="+237 6XX XX XX XX"
              />
            </div>
            <div>
              <Label htmlFor="rewardTier">Reward Tier</Label>
              <Select value={formData.rewardTier} onValueChange={(value) => setFormData({ ...formData, rewardTier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateReferral} disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Create Referral"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Reward Dialog */}
      <Dialog open={rewardDialogOpen} onOpenChange={setRewardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Reward Configuration</DialogTitle>
            <DialogDescription>
              Update reward amounts and requirements for a tier
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tier">Tier</Label>
              <Select value={rewardFormData.tier} onValueChange={(value) => setRewardFormData({ ...rewardFormData, tier: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="referrerReward">Referrer Reward (FCFA) *</Label>
              <Input
                id="referrerReward"
                type="number"
                value={rewardFormData.referrerReward}
                onChange={(e) => setRewardFormData({ ...rewardFormData, referrerReward: e.target.value })}
                placeholder="5000"
              />
            </div>
            <div>
              <Label htmlFor="referredReward">Referred User Reward (FCFA) *</Label>
              <Input
                id="referredReward"
                type="number"
                value={rewardFormData.referredReward}
                onChange={(e) => setRewardFormData({ ...rewardFormData, referredReward: e.target.value })}
                placeholder="2500"
              />
            </div>
            <div>
              <Label htmlFor="minOrderValue">Minimum Order Value (FCFA) *</Label>
              <Input
                id="minOrderValue"
                type="number"
                value={rewardFormData.minOrderValue}
                onChange={(e) => setRewardFormData({ ...rewardFormData, minOrderValue: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={rewardFormData.description}
                onChange={(e) => setRewardFormData({ ...rewardFormData, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRewardDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateReward} disabled={updateRewardMutation.isPending}>
              {updateRewardMutation.isPending ? "Updating..." : "Update Reward"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
