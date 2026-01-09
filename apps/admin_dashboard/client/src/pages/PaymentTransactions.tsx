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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreditCard, Smartphone, Wallet, DollarSign, Filter, Search } from "lucide-react";

export default function PaymentTransactions() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: transactions, isLoading } = trpc.financial.getPaymentTransactions.useQuery({
    limit: 100,
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

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case "mtn_money":
        return <Smartphone className="h-4 w-4 text-yellow-600" />;
      case "orange_money":
        return <Smartphone className="h-4 w-4 text-orange-600" />;
      case "cash":
        return <Wallet className="h-4 w-4 text-green-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getProviderLabel = (provider: string) => {
    switch (provider) {
      case "mtn_money":
        return t("payment:mtn_money");
      case "orange_money":
        return t("payment:orange_money");
      case "cash":
        return t("payment:cash");
      default:
        return provider;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-600">{t("payment:completed")}</Badge>;
      case "pending":
        return <Badge variant="secondary">{t("payment:pending")}</Badge>;
      case "failed":
        return <Badge variant="destructive">{t("payment:failed")}</Badge>;
      case "refunded":
        return <Badge variant="outline">{t("payment:refunded")}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Filter transactions
  const filteredTransactions = transactions?.filter((tx: any) => {
    const matchesSearch =
      searchQuery === "" ||
      tx.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesProvider = providerFilter === "all" || tx.provider === providerFilter;
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;

    return matchesSearch && matchesProvider && matchesStatus;
  });

  // Calculate stats
  const stats = [
    {
      title: t("payment:total_transactions"),
      value: transactions?.length || 0,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("payment:mtn_money"),
      value: transactions?.filter((t: any) => t.provider === "mtn_money").length || 0,
      icon: Smartphone,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: t("payment:orange_money"),
      value: transactions?.filter((t: any) => t.provider === "orange_money").length || 0,
      icon: Smartphone,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: t("payment:total_volume"),
      value: formatCurrency(
        transactions?.reduce((sum: number, t: any) => sum + (t.amount || 0), 0) || 0
      ),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading payment transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("payment:title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("payment:description")}
        </p>
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

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t("payment:filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("payment:search")}</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("payment:search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("payment:payment_provider")}</label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("payment:all_providers")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("payment:all_providers")}</SelectItem>
                  <SelectItem value="mtn_money">MTN Money</SelectItem>
                  <SelectItem value="orange_money">Orange Money</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">{t("payment:status")}</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={t("payment:all_statuses")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("payment:all_statuses")}</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {(searchQuery || providerFilter !== "all" || statusFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setProviderFilter("all");
                  setStatusFilter("all");
                }}
              >
                {t("payment:clear_filters")}
              </Button>
              <p className="text-sm text-muted-foreground">
                Showing {filteredTransactions?.length || 0} of {transactions?.length || 0}{" "}
                transactions
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("payment:transaction_history")}</CardTitle>
          <CardDescription>{t("payment:transaction_history_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("payment:transaction_id")}</TableHead>
                  <TableHead>{t("payment:provider")}</TableHead>
                  <TableHead>{t("payment:phone_number")}</TableHead>
                  <TableHead className="text-right">{t("payment:amount")}</TableHead>
                  <TableHead>{t("payment:status")}</TableHead>
                  <TableHead>{t("payment:date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filteredTransactions || filteredTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("payment:no_transactions")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTransactions.map((transaction: any) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">
                        {transaction.transactionId || `TXN-${transaction.id}`}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getProviderIcon(transaction.provider)}
                          <span>{getProviderLabel(transaction.provider)}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {transaction.phoneNumber || "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(transaction.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

