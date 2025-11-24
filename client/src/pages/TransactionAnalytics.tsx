import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, DollarSign, CheckCircle, XCircle, Download } from "lucide-react";
import { toast } from "sonner";

export default function TransactionAnalytics() {
  const [dateRange, setDateRange] = useState("7");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: transactions = [], isLoading } = trpc.financial.getAllTransactions.useQuery({
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
  });

  // Calculate analytics
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === "completed");
  const failedTransactions = transactions.filter(t => t.status === "failed");
  const successRate = totalTransactions > 0 
    ? ((completedTransactions.length / totalTransactions) * 100).toFixed(1)
    : "0";

  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.amount, 0);
  const averageTransactionValue = completedTransactions.length > 0
    ? totalRevenue / completedTransactions.length
    : 0;

  // Group transactions by type
  const transactionsByType = transactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group transactions by date for trend chart
  const transactionsByDate = transactions.reduce((acc, t) => {
    const date = new Date(t.createdAt).toLocaleDateString();
    if (!acc[date]) {
      acc[date] = { date, count: 0, amount: 0, completed: 0 };
    }
    acc[date].count++;
    acc[date].amount += t.amount;
    if (t.status === "completed") acc[date].completed++;
    return acc;
  }, {} as Record<string, { date: string; count: number; amount: number; completed: number }>);

  const trendData = Object.values(transactionsByDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Revenue by type
  const revenueByType = transactions.reduce((acc, t) => {
    if (t.status === "completed") {
      acc[t.type] = (acc[t.type] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      order_payment: "#3b82f6",
      payout: "#10b981",
      refund: "#ef4444",
      commission: "#8b5cf6",
      fee: "#f59e0b",
      adjustment: "#6b7280",
    };
    return colors[type] || "#6b7280";
  };

  const exportAnalytics = () => {
    const csvContent = [
      ['Metric', 'Value'],
      ['Total Transactions', totalTransactions],
      ['Completed Transactions', completedTransactions.length],
      ['Failed Transactions', failedTransactions.length],
      ['Success Rate', `${successRate}%`],
      ['Total Revenue', formatCurrency(totalRevenue)],
      ['Average Transaction Value', formatCurrency(averageTransactionValue)],
      ['', ''],
      ['Transaction Type', 'Count'],
      ...Object.entries(transactionsByType).map(([type, count]) => [type, count]),
      ['', ''],
      ['Date', 'Count', 'Amount', 'Completed'],
      ...trendData.map(d => [d.date, d.count, formatCurrency(d.amount), d.completed]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transaction_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    toast.success("Analytics exported successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Analytics</h1>
          <p className="text-muted-foreground">Visualize transaction trends and performance metrics</p>
        </div>
        <Button onClick={exportAnalytics} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Analytics
        </Button>
      </div>

      {/* Date Range Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <CardDescription>Select a time period for analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Quick Select</Label>
              <Select value={dateRange} onValueChange={(value) => {
                setDateRange(value);
                const end = new Date();
                const start = new Date();
                start.setDate(end.getDate() - parseInt(value));
                setStartDate(start.toISOString().split('T')[0]);
                setEndDate(end.toISOString().split('T')[0]);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Start Date</Label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All transactions in period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {completedTransactions.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From completed transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transactions</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedTransactions.length}</div>
            <p className="text-xs text-muted-foreground">
              {totalTransactions > 0 ? ((failedTransactions.length / totalTransactions) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Trends</CardTitle>
          <CardDescription>Daily transaction volume and completion rate</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading chart data...</p>
            </div>
          ) : trendData.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">No data available for selected period</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-64 flex items-end gap-2">
                {trendData.map((data, index) => {
                  const maxCount = Math.max(...trendData.map(d => d.count));
                  const height = (data.count / maxCount) * 100;
                  const completionRate = data.count > 0 ? (data.completed / data.count) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-blue-100 rounded-t relative group">
                        <div 
                          className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                          style={{ height: `${height}%`, minHeight: '4px' }}
                        />
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                          {data.date}<br/>
                          Count: {data.count}<br/>
                          Amount: {formatCurrency(data.amount)}<br/>
                          Success: {completionRate.toFixed(0)}%
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground transform -rotate-45 origin-top-left">
                        {new Date(data.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Type Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Type Distribution</CardTitle>
            <CardDescription>Count by transaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(transactionsByType).map(([type, count]) => {
                const percentage = (count / totalTransactions) * 100;
                return (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{type.replace('_', ' ').toUpperCase()}</span>
                      <span className="text-muted-foreground">{count} ({percentage.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: getTypeColor(type)
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Type</CardTitle>
            <CardDescription>Total revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(revenueByType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, amount]) => {
                  const percentage = totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0;
                  return (
                    <div key={type} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{type.replace('_', ' ').toUpperCase()}</span>
                        <span className="text-muted-foreground">{formatCurrency(amount)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: getTypeColor(type)
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

