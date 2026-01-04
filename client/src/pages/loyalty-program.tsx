import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Award,
  TrendingUp,
  Users,
  DollarSign,
  History,
} from "lucide-react";

export default function LoyaltyProgram() {
  const [searchQuery, setSearchQuery] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionDialogOpen, setTransactionDialogOpen] = useState(false);
  const [addPointsDialogOpen, setAddPointsDialogOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

  const [formData, setFormData] = useState({
    userId: 0,
    points: 0,
    tier: "bronze" as "bronze" | "silver" | "gold" | "platinum",
  });

  const [transactionData, setTransactionData] = useState({
    type: "earned" as "earned" | "redeemed" | "expired" | "adjusted",
    points: 0,
    description: "",
    orderId: 0,
  });

  const { data: programs = [], refetch } = trpc.marketing.getAllLoyaltyPrograms.useQuery();
  const { data: transactions = [], refetch: refetchTransactions } =
    trpc.marketing.getLoyaltyTransactions.useQuery(
      { userId: selectedProgram?.userId || 0 },
      { enabled: !!selectedProgram }
    );

  const createMutation = trpc.marketing.createLoyaltyProgram.useMutation({
    onSuccess: () => {
      toast.success("Loyalty program created successfully");
      setCreateDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to create loyalty program: ${error.message}`);
    },
  });

  const updateMutation = trpc.marketing.updateLoyaltyProgram.useMutation({
    onSuccess: () => {
      toast.success("Loyalty program updated successfully");
      setEditDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update loyalty program: ${error.message}`);
    },
  });

  const deleteMutation = trpc.marketing.deleteLoyaltyProgram.useMutation({
    onSuccess: () => {
      toast.success("Loyalty program deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedProgram(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete loyalty program: ${error.message}`);
    },
  });

  const createTransactionMutation = trpc.marketing.createLoyaltyTransaction.useMutation({
    onSuccess: () => {
      toast.success("Points transaction created successfully");
      setAddPointsDialogOpen(false);
      setTransactionData({
        type: "earned",
        points: 0,
        description: "",
        orderId: 0,
      });
      refetch();
      refetchTransactions();
    },
    onError: (error) => {
      toast.error(`Failed to create transaction: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      userId: 0,
      points: 0,
      tier: "bronze",
    });
    setSelectedProgram(null);
  };

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!selectedProgram) return;
    updateMutation.mutate({
      ...formData,
      userId: selectedProgram.userId,
    });
  };

  const handleDelete = () => {
    if (!selectedProgram) return;
    deleteMutation.mutate({ userId: selectedProgram.userId });
  };

  const handleAddPoints = () => {
    if (!selectedProgram) return;
    createTransactionMutation.mutate({
      userId: selectedProgram.userId,
      ...transactionData,
    });
  };

  const openEditDialog = (program: any) => {
    setSelectedProgram(program);
    setFormData({
      userId: program.userId,
      points: program.points,
      tier: program.tier,
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (program: any) => {
    setSelectedProgram(program);
    setDeleteDialogOpen(true);
  };

  const openTransactionDialog = (program: any) => {
    setSelectedProgram(program);
    setTransactionDialogOpen(true);
  };

  const openAddPointsDialog = (program: any) => {
    setSelectedProgram(program);
    setAddPointsDialogOpen(true);
  };

  // Calculate stats
  const totalMembers = programs.length;
  const totalPoints = programs.reduce((sum, p) => sum + (p.points || 0), 0);
  const totalSpent = programs.reduce((sum, p) => sum + (p.lifetimeSpent || 0), 0);
  const tierDistribution = {
    bronze: programs.filter((p) => p.tier === "bronze").length,
    silver: programs.filter((p) => p.tier === "silver").length,
    gold: programs.filter((p) => p.tier === "gold").length,
    platinum: programs.filter((p) => p.tier === "platinum").length,
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze":
        return "outline";
      case "silver":
        return "secondary";
      case "gold":
        return "default";
      case "platinum":
        return "default";
      default:
        return "outline";
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "earned":
        return "default";
      case "redeemed":
        return "secondary";
      case "expired":
        return "destructive";
      case "adjusted":
        return "outline";
      default:
        return "outline";
    }
  };

  const filteredPrograms = programs.filter((program) =>
    program.userId.toString().includes(searchQuery)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Loyalty Program</h1>
            <p className="text-muted-foreground mt-1">
              Manage customer loyalty points and rewards
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalPoints.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${(totalSpent / 100).toFixed(2)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tier Distribution</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span>Bronze:</span>
                  <span className="font-semibold">{tierDistribution.bronze}</span>
                </div>
                <div className="flex justify-between">
                  <span>Silver:</span>
                  <span className="font-semibold">{tierDistribution.silver}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gold:</span>
                  <span className="font-semibold">{tierDistribution.gold}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platinum:</span>
                  <span className="font-semibold">{tierDistribution.platinum}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by user ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Programs Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Current Points</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Lifetime Points</TableHead>
                  <TableHead>Lifetime Spent</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrograms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No loyalty program members found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPrograms.map((program) => (
                    <TableRow key={program.id}>
                      <TableCell className="font-semibold">{program.userId}</TableCell>
                      <TableCell className="font-bold text-lg">
                        {(program.points || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTierColor(program.tier)}>
                          {program.tier.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{(program.lifetimePoints || 0).toLocaleString()}</TableCell>
                      <TableCell>${((program.lifetimeSpent || 0) / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(program.lastActivityAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openAddPointsDialog(program)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTransactionDialog(program)}
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(program)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(program)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Create Member Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Loyalty Program Member</DialogTitle>
              <DialogDescription>
                Add a new member to the loyalty program
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID *</Label>
                <Input
                  id="userId"
                  type="number"
                  placeholder="Enter user ID"
                  value={formData.userId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, userId: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="points">Initial Points</Label>
                <Input
                  id="points"
                  type="number"
                  placeholder="0"
                  value={formData.points || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tier">Tier *</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value: any) => setFormData({ ...formData, tier: value })}
                >
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
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Adding..." : "Add Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Member Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Loyalty Program Member</DialogTitle>
              <DialogDescription>Update member details</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>User ID</Label>
                <Input value={formData.userId} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  placeholder="0"
                  value={formData.points || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, points: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tier">Tier *</Label>
                <Select
                  value={formData.tier}
                  onValueChange={(value: any) => setFormData({ ...formData, tier: value })}
                >
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
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Member"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Points Dialog */}
        <Dialog open={addPointsDialogOpen} onOpenChange={setAddPointsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Points Transaction</DialogTitle>
              <DialogDescription>
                Add, redeem, or adjust points for user {selectedProgram?.userId}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-type">Transaction Type *</Label>
                <Select
                  value={transactionData.type}
                  onValueChange={(value: any) =>
                    setTransactionData({ ...transactionData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="earned">Earned</SelectItem>
                    <SelectItem value="redeemed">Redeemed</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="adjusted">Adjusted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-points">Points *</Label>
                <Input
                  id="transaction-points"
                  type="number"
                  placeholder="100"
                  value={transactionData.points || ""}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      points: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  For redeemed/expired, enter positive number (will be deducted automatically)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-description">Description *</Label>
                <Input
                  id="transaction-description"
                  placeholder="Purchase reward, order bonus, etc."
                  value={transactionData.description}
                  onChange={(e) =>
                    setTransactionData({ ...transactionData, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="transaction-orderId">Order ID (optional)</Label>
                <Input
                  id="transaction-orderId"
                  type="number"
                  placeholder="12345"
                  value={transactionData.orderId || ""}
                  onChange={(e) =>
                    setTransactionData({
                      ...transactionData,
                      orderId: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddPointsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPoints}
                disabled={createTransactionMutation.isPending}
              >
                {createTransactionMutation.isPending ? "Processing..." : "Add Transaction"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Transaction History Dialog */}
        <Dialog open={transactionDialogOpen} onOpenChange={setTransactionDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Transaction History - User {selectedProgram?.userId}</DialogTitle>
              <DialogDescription>
                View all points transactions for this member
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Badge variant={getTransactionTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`font-semibold ${
                            transaction.points > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {transaction.points > 0 ? "+" : ""}
                          {transaction.points}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell>{transaction.orderId || "-"}</TableCell>
                        <TableCell className="text-sm">
                          {new Date(transaction.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button onClick={() => setTransactionDialogOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Loyalty Program Member</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove user {selectedProgram?.userId} from the loyalty
                program? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

