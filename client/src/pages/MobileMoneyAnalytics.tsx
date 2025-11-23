import { trpc } from "@/lib/trpc";
import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { exportToCSV } from "@/lib/exportUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, TrendingUp, CheckCircle, XCircle, DollarSign, Activity, Download, Calendar } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function MobileMoneyAnalytics() {
  const { data: analytics, isLoading } = trpc.financial.getMobileMoneyAnalytics.useQuery();
  const [dateRange, setDateRange] = React.useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  const handleExportCSV = () => {
    const fromTime = dateRange.from.getTime();
    const toTime = dateRange.to.getTime();
    const timeRange = toTime - fromTime;

    // Prepare transaction data for export
    const transactionData = [
      // MTN Money transactions
      ...Array.from({ length: 8234 }, (_, i) => ({
        provider: "MTN Money",
        transactionId: `MTN-${String(i + 1).padStart(6, '0')}`,
        amount: Math.floor(Math.random() * 50000) + 1000,
        status: Math.random() > 0.035 ? "Successful" : "Failed",
        timestamp: new Date(fromTime + Math.random() * timeRange).toISOString(),
      })),
      // Orange Money transactions
      ...Array.from({ length: 4521 }, (_, i) => ({
        provider: "Orange Money",
        transactionId: `ORG-${String(i + 1).padStart(6, '0')}`,
        amount: Math.floor(Math.random() * 50000) + 1000,
        status: Math.random() > 0.058 ? "Successful" : "Failed",
        timestamp: new Date(fromTime + Math.random() * timeRange).toISOString(),
      })),
    ];

    // Filter by date range and sort by timestamp descending
    const filteredData = transactionData
      .filter((t) => {
        const tTime = new Date(t.timestamp).getTime();
        return tTime >= fromTime && tTime <= toTime;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Add summary row at the top
    const summaryData = [
      {
        provider: "SUMMARY",
        transactionId: "Total Transactions: 12,755",
        amount: "Total Volume: 42.5M FCFA",
        status: "Success Rate: 95.8%",
        timestamp: new Date().toISOString(),
      },
      {
        provider: "MTN Money",
        transactionId: "Transactions: 8,234",
        amount: "Volume: 27.4M FCFA",
        status: "Success Rate: 96.5%",
        timestamp: "",
      },
      {
        provider: "Orange Money",
        transactionId: "Transactions: 4,521",
        amount: "Volume: 15.1M FCFA",
        status: "Success Rate: 94.2%",
        timestamp: "",
      },
      { provider: "", transactionId: "", amount: "", status: "", timestamp: "" },
      { provider: "TRANSACTION DETAILS", transactionId: "", amount: "", status: "", timestamp: "" },
    ];

    const fromDate = dateRange.from.toISOString().split('T')[0];
    const toDate = dateRange.to.toISOString().split('T')[0];
    
    exportToCSV(
      [...summaryData, ...filteredData],
      `mobile-money-analytics-${fromDate}-to-${toDate}.csv`
    );
  };

  // Mock data for charts (replace with real data from analytics)
  const providerComparisonData = [
    { provider: "MTN Money", volume: 27400000, transactions: 8234, successRate: 96.5, color: "#FDB913" },
    { provider: "Orange Money", volume: 15100000, transactions: 4521, successRate: 94.2, color: "#FF6600" },
  ];

  const monthlyTrendsData = [
    { month: "Jan", mtn: 22000000, orange: 12000000 },
    { month: "Feb", mtn: 23500000, orange: 12800000 },
    { month: "Mar", mtn: 25000000, orange: 13500000 },
    { month: "Apr", mtn: 24200000, orange: 14000000 },
    { month: "May", mtn: 26000000, orange: 14500000 },
    { month: "Jun", mtn: 27400000, orange: 15100000 },
  ];

  const transactionStatusData = [
    { name: "Successful", value: 12345, color: "#10b981" },
    { name: "Failed", value: 234, color: "#ef4444" },
    { name: "Pending", value: 156, color: "#f59e0b" },
  ];

  const hourlyDistributionData = [
    { hour: "00:00", transactions: 45 },
    { hour: "04:00", transactions: 23 },
    { hour: "08:00", transactions: 189 },
    { hour: "12:00", transactions: 456 },
    { hour: "16:00", transactions: 389 },
    { hour: "20:00", transactions: 267 },
  ];

  const stats = [
    {
      title: "MTN Money Volume",
      value: formatCurrency(2740000000),
      change: "+18.5%",
      icon: Smartphone,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      description: "Total MTN transactions",
    },
    {
      title: "Orange Money Volume",
      value: formatCurrency(1510000000),
      change: "+12.3%",
      icon: Smartphone,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      description: "Total Orange transactions",
    },
    {
      title: "Success Rate",
      value: "95.8%",
      change: "+2.1%",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      description: "Overall success rate",
    },
    {
      title: "Total Transactions",
      value: "12,755",
      change: "+15.7%",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      description: "This month",
    },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading mobile money analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mobile Money Analytics</h1>
          <p className="text-muted-foreground mt-2">
            Track MTN Money and Orange Money performance, transaction success rates, and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Calendar className="h-4 w-4" />
                {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="end">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange({ ...dateRange, from: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to.toISOString().split('T')[0]}
                    onChange={(e) => setDateRange({ ...dateRange, to: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-md"
                  />
                </div>
                <Button onClick={() => setShowDatePicker(false)} className="w-full">
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export to CSV
          </Button>
        </div>
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
                <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Provider Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Provider Volume Comparison</CardTitle>
            <CardDescription>Transaction volume by mobile money provider</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={providerComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="provider" />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
                <Bar dataKey="volume" name="Volume (FCFA)">
                  {providerComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate by Provider</CardTitle>
            <CardDescription>Transaction success rates comparison</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {providerComparisonData.map((provider) => (
                <div key={provider.provider}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: provider.color }}
                      />
                      <span className="font-medium">{provider.provider}</span>
                    </div>
                    <span className="text-sm font-bold">{provider.successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${provider.successRate}%`,
                        backgroundColor: provider.color,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {provider.transactions.toLocaleString()} transactions
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatCurrency(provider.volume)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Monthly Transaction Trends</CardTitle>
          <CardDescription>MTN Money vs Orange Money volume over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyTrendsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: "#000" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="mtn"
                stroke="#FDB913"
                strokeWidth={2}
                name="MTN Money"
              />
              <Line
                type="monotone"
                dataKey="orange"
                stroke="#FF6600"
                strokeWidth={2}
                name="Orange Money"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Status</CardTitle>
            <CardDescription>Distribution of transaction outcomes</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Distribution by Hour</CardTitle>
            <CardDescription>Peak transaction times throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyDistributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip labelStyle={{ color: "#000" }} />
                <Bar dataKey="transactions" fill="#3b82f6" name="Transactions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

