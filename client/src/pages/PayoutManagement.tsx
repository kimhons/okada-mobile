import { useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      title: t("payout:pending_payouts"),
      value: payouts?.length || 0,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: t("payout:total_pending_amount"),
      value: formatCurrency(
        payouts?.reduce((sum: number, p: any) => sum + (p.amount || 0), 0) || 0
      ),
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("payout:selected_payouts"),
      value: selectedPayouts.length,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("payout:selected_amount"),
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
          <h1 className="text-3xl font-bold">{t("payout:title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("payout:description")}
          </p>
        </div>
        <Button
          onClick={handleProcessPayouts}
          disabled={selectedPayouts.length === 0 || processPayouts.isPending}
          size="lg"
        >
          {processPayouts.isPending ? t("payout:processing") : t("payout:process_payouts", { count: selectedPayouts.length })}
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
          <CardTitle>{t("payout:pending_payouts")}</CardTitle>
          <CardDescription>
            {t("payout:table_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="h-12 w-12 text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("payout:all_caught_up")}</h3>
              <p className="text-muted-foreground">{t("payout:no_pending")}</p>
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
                    <TableHead>{t("payout:seller_id")}</TableHead>
                    <TableHead>{t("payout:period")}</TableHead>
                    <TableHead className="text-right">{t("payout:amount")}</TableHead>
                    <TableHead>{t("payout:status")}</TableHead>
                    <TableHead>{t("payout:created")}</TableHead>
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
              {t("payout:confirm_processing")}
            </DialogTitle>
            <DialogDescription>
              {t("payout:confirm_description", { count: selectedPayouts.length, amount: formatCurrency(totalSelectedAmount) })}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payout:number_of_payouts")}</span>
                <span className="font-semibold">{selectedPayouts.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payout:total_amount")}</span>
                <span className="font-semibold">{formatCurrency(totalSelectedAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("payout:payment_method")}</span>
                <span className="font-semibold">{t("payout:bank_transfer")}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={processPayouts.isPending}
            >
              {t("payout:cancel")}
            </Button>
            <Button
              onClick={confirmProcessPayouts}
              disabled={processPayouts.isPending}
            >
              {processPayouts.isPending ? t("payout:processing") : t("payout:confirm_and_process")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

