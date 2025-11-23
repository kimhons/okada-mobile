import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Wallet, DollarSign, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PayoutManagement() {
  const [selectedPayouts, setSelectedPayouts] = useState<number[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const { data: payouts, isLoading, refetch } = trpc.financial.getPendingPayouts.useQuery();

  const processPayouts = trpc.financial.processPayouts.useMutation({
    onSuccess: (result) => {
      toast.success(`Successfully processed ${result.processed} payout(s)`);
      setSelectedPayouts([]);
      setConfirmDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to process payouts: ${error.message}`);
    },
  });

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPayouts(payouts?.map((p: any) => p.id) || []);
    } else {
      setSelectedPayouts([]);
    }
  };

  const handleSelectPayout = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedPayouts([...selectedPayouts, id]);
    } else {
      setSelectedPayouts(selectedPayouts.filter((pid) => pid !== id));
    }
  };

  const handleProcessPayouts = () => {
    if (selectedPayouts.length === 0) {
      toast.error("Please select at least one payout to process");
      return;
    }
    setConfirmDialogOpen(true);
  };

  const confirmProcessPayouts = () => {
    processPayouts.mutate({ payoutIds: selectedPayouts });
  };

  const totalSelectedAmount = payouts
    ?.filter((p: any) => selectedPayouts.includes(p.id))
    .reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0;

  const stats = [
    {
      title: "Pending Payouts",
      value: payouts?.length || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: "Total Pending Amount",
      value: formatCurrency(
        payouts?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
      ),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Selected Payouts",
      value: selectedPayouts.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Selected Amount",
      value: formatCurrency(totalSelectedAmount),
      icon: Wallet,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading payout data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payout Management</h1>
          <p className="text-muted-foreground mt-2">
            Process pending seller payouts with batch operations
          </p>
        </div>
        <Button
          onClick={handleProcessPayouts}
          disabled={selectedPayouts.length === 0 || processPayouts.isPending}
          size="lg"
        >
          {processPayouts.isPending ? "Processing..." : `Process ${selectedPayouts.length} Payout(s)`}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Payouts</CardTitle>
          <CardDescription>
            Select payouts to process in batch. Funds will be transferred to seller accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
              <p className="text-muted-foreground">No pending payouts at the moment.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={
                          payouts.length > 0 && selectedPayouts.length === payouts.length
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Seller ID</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payouts.map((payout: any) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPayouts.includes(payout.id)}
                          onCheckedChange={(checked) =>
                            handleSelectPayout(payout.id, checked as boolean)
                          }
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        Seller #{payout.sellerId}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payout.periodStart && payout.periodEnd
                          ? `${new Date(payout.periodStart).toLocaleDateString()} - ${new Date(
                              payout.periodEnd
                            ).toLocaleDateString()}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(payout.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            payout.status === "pending"
                              ? "secondary"
                              : payout.status === "completed"
                              ? "default"
                              : "destructive"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(payout.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Confirm Payout Processing
            </DialogTitle>
            <DialogDescription>
              You are about to process {selectedPayouts.length} payout(s) totaling{" "}
              <span className="font-semibold">{formatCurrency(totalSelectedAmount)}</span>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Number of Payouts:</span>
                <span className="font-semibold">{selectedPayouts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Amount:</span>
                <span className="font-semibold">{formatCurrency(totalSelectedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-semibold">Bank Transfer</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={processPayouts.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmProcessPayouts}
              disabled={processPayouts.isPending}
            >
              {processPayouts.isPending ? "Processing..." : "Confirm & Process"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

