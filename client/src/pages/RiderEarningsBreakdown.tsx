import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, TrendingUp, Download, ArrowUpRight, ArrowDownRight, Wallet, Gift, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

type PeriodType = "today" | "week" | "month" | "year";

export default function RiderEarningsBreakdown() {
  const [selectedRider, setSelectedRider] = useState<string>("all");
  const [period, setPeriod] = useState<PeriodType>("month");

  // Fetch riders for dropdown
  const { data: riders, isLoading: loadingRiders } = trpc.riders.getAllRiders.useQuery({});

  // Fetch earnings data
  const { data: earningsData, isLoading: loadingEarnings, refetch } = trpc.riders.getEarningsBreakdown.useQuery({
    riderId: selectedRider === "all" ? undefined : parseInt(selectedRider),
    period,
  });

  // Calculate period label
  const periodLabel = useMemo(() => {
    const labels: Record<PeriodType, string> = {
      today: "Today",
      week: "This Week",
      month: "This Month",
      year: "This Year",
    };
    return labels[period];
  }, [period]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount / 100) + " FCFA";
  };

  // Prepare chart data
  const pieChartData = useMemo(() => {
    if (!earningsData) return [];
    return [
      { name: "Delivery Fees", value: earningsData.breakdown.deliveryFees, color: "#2D8659" },
      { name: "Tips", value: earningsData.breakdown.tips, color: "#10b981" },
      { name: "Bonuses", value: earningsData.breakdown.bonuses, color: "#3b82f6" },
      { name: "Penalties", value: Math.abs(earningsData.breakdown.penalties), color: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [earningsData]);

  // Prepare trend data
  const trendData = useMemo(() => {
    if (!earningsData?.trends) return [];
    return earningsData.trends.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      earnings: trend.amount / 100,
    }));
  }, [earningsData]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!earningsData) return;

    const csvRows = [
      ["Rider Earnings Breakdown", periodLabel],
      [""],
      ["Summary"],
      ["Total Earnings", formatCurrency(earningsData.summary.totalEarnings)],
      ["Total Deductions", formatCurrency(earningsData.summary.totalDeductions)],
      ["Net Earnings", formatCurrency(earningsData.summary.netEarnings)],
      ["Transaction Count", earningsData.summary.transactionCount.toString()],
      [""],
      ["Breakdown"],
      ["Delivery Fees", formatCurrency(earningsData.breakdown.deliveryFees)],
      ["Tips", formatCurrency(earningsData.breakdown.tips)],
      ["Bonuses", formatCurrency(earningsData.breakdown.bonuses)],
      ["Penalties", formatCurrency(earningsData.breakdown.penalties)],
      [""],
      ["Transactions"],
      ["Date", "Type", "Amount", "Status", "Description"],
      ...earningsData.transactions.map(t => [
        new Date(t.transactionDate).toLocaleDateString(),
        t.transactionType,
        formatCurrency(t.amount),
        t.status,
        t.description || "",
      ]),
    ];

    const csvContent = csvRows.map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rider-earnings-${period}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Rider Earnings Breakdown</h1>
            <p className="text-sm text-gray-600 mt-1">Detailed earnings analysis by period</p>
          </div>
          <Button onClick={handleExportCSV} disabled={!earningsData} className="h-12 px-6">
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
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

          <Select value={period} onValueChange={(value) => setPeriod(value as PeriodType)}>
            <SelectTrigger className="h-12 w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingEarnings ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : earningsData ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Total Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.summary.totalEarnings)}
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                  <ArrowUpRight className="h-4 w-4" />
                  <span>+12.5% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Total Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.summary.totalDeductions)}
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-red-600">
                  <ArrowDownRight className="h-4 w-4" />
                  <span>-3.2% from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Net Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(earningsData.summary.netEarnings)}
                </div>
                <div className="flex items-center gap-1 mt-1 text-sm text-blue-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Available for payout</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">
                  {earningsData.summary.transactionCount}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {periodLabel}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Breakdown</CardTitle>
                <CardDescription>Distribution by transaction type</CardDescription>
              </CardHeader>
              <CardContent>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No earnings data for this period
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Line Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Earnings Trend</CardTitle>
                <CardDescription>Daily earnings over time</CardDescription>
              </CardHeader>
              <CardContent>
                {trendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()} FCFA`} />
                      <Line type="monotone" dataKey="earnings" stroke="#2D8659" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">
                    No trend data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Transactions List */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Detailed transaction history for {periodLabel.toLowerCase()}</CardDescription>
            </CardHeader>
            <CardContent>
              {earningsData.transactions.length > 0 ? (
                <div className="space-y-3">
                  {earningsData.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900 capitalize">
                            {transaction.transactionType.replace("_", " ")}
                          </span>
                          <Badge variant={transaction.status === "approved" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{transaction.description || "No description"}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(transaction.transactionDate).toLocaleString()}
                        </p>
                      </div>
                      <div className={`text-lg font-bold ${
                        transaction.transactionType === "penalty" ? "text-red-600" : "text-green-600"
                      }`}>
                        {transaction.transactionType === "penalty" ? "-" : "+"}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No transactions found for this period</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>Select a rider and period to view earnings breakdown</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
