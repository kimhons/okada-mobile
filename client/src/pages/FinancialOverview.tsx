import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";

export default function FinancialOverview() {
  const { data: overview, isLoading } = trpc.financial.getOverview.useQuery();
  const { data: mobileMoneyStats } = trpc.financial.getMobileMoneyAnalytics.useQuery();

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading financial overview...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: formatCurrency(overview?.totalRevenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+15.3%",
      changeType: "positive",
    },
    {
      title: "Total Payouts",
      value: formatCurrency(overview?.totalPayouts || 0),
      icon: TrendingDown,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "+8.2%",
      changeType: "negative",
    },
    {
      title: "Pending Payouts",
      value: formatCurrency(overview?.pendingPayouts || 0),
      icon: Wallet,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "12 pending",
      changeType: "neutral",
    },
    {
      title: "Net Revenue",
      value: formatCurrency(overview?.netRevenue || 0),
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12.7%",
      changeType: "positive",
    },
  ];

  const paymentMethods = [
    {
      title: "MTN Money",
      value: formatCurrency(mobileMoneyStats?.mtnMoney || 0),
      icon: CreditCard,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      percentage: mobileMoneyStats
        ? ((mobileMoneyStats.mtnMoney / mobileMoneyStats.total) * 100).toFixed(1)
        : "0",
    },
    {
      title: "Orange Money",
      value: formatCurrency(mobileMoneyStats?.orangeMoney || 0),
      icon: CreditCard,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      percentage: mobileMoneyStats
        ? ((mobileMoneyStats.orangeMoney / mobileMoneyStats.total) * 100).toFixed(1)
        : "0",
    },
    {
      title: "Cash",
      value: formatCurrency(mobileMoneyStats?.cash || 0),
      icon: DollarSign,
      color: "text-gray-600",
      bgColor: "bg-gray-100",
      percentage: mobileMoneyStats
        ? ((mobileMoneyStats.cash / mobileMoneyStats.total) * 100).toFixed(1)
        : "0",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Financial Overview</h1>
        <p className="text-muted-foreground mt-2">
          Track revenue, payouts, and payment transactions in FCFA
        </p>
      </div>

      {/* Revenue Stats */}
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
                <p
                  className={`text-xs mt-1 ${
                    stat.changeType === "positive"
                      ? "text-green-600"
                      : stat.changeType === "negative"
                      ? "text-red-600"
                      : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Methods Breakdown */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Payment Methods Breakdown</CardTitle>
          <CardDescription>Revenue by payment method</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.title} className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${method.bgColor}`}>
                    <Icon className={`h-6 w-6 ${method.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{method.title}</p>
                    <p className="text-2xl font-bold">{method.value}</p>
                    <p className="text-xs text-muted-foreground">{method.percentage}% of total</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Transaction Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
          <CardDescription>Recent transaction activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Total Transactions</p>
                <p className="text-2xl font-bold">{overview?.transactionCount || 0}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Average Transaction</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    overview && overview.transactionCount > 0
                      ? Math.floor(overview.totalRevenue / overview.transactionCount)
                      : 0
                  )}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

