import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { TrendingUp, TrendingDown, DollarSign, CheckCircle, XCircle, Download, ArrowUpRight, ArrowDownRight, Minus, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function TransactionAnalytics() {
  const [periodType, setPeriodType] = useState<"week" | "month" | "quarter" | "year">("month");
  const [dateRange, setDateRange] = useState("7");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState("");
  const [emailMessage, setEmailMessage] = useState("");

  const exportPDF = trpc.financial.exportPeriodComparisonPDF.useMutation({
    onSuccess: (data) => {
      // Convert HTML to PDF and download
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-comparison-${data.periodType}-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Comparison report exported successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export report");
    },
  });

  const handleExportPDF = () => {
    exportPDF.mutate({ periodType });
  };

  const emailReport = trpc.financial.emailPeriodComparisonReport.useMutation({
    onSuccess: (data) => {
      toast.success(`Report emailed successfully to ${data.recipientCount} recipient(s)`);
      setShowEmailDialog(false);
      setEmailRecipients("");
      setEmailMessage("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to email report");
    },
  });

  const handleEmailReport = () => {
    if (!emailRecipients.trim()) {
      toast.error("Please enter at least one recipient email");
      return;
    }
    emailReport.mutate({
      periodType,
      recipients: emailRecipients,
      message: emailMessage || undefined,
    });
  };

  // Fetch period comparison data
  const { data: comparisonData, isLoading: comparisonLoading } = trpc.financial.getTransactionPeriodComparison.useQuery({
    periodType,
  });

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

  // Prepare data for type distribution chart
  const typeData = Object.entries(transactionsByType).map(([type, count]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    value: count,
  }));

  // Prepare revenue by type data
  const revenueByType = completedTransactions.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const revenueData = Object.entries(revenueByType).map(([type, amount]) => ({
    name: type.replace('_', ' ').toUpperCase(),
    revenue: amount / 100, // Convert to FCFA
  }));

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Helper function to render change indicator
  const renderChangeIndicator = (change: number) => {
    if (change > 0) {
      return (
        <span className="flex items-center text-green-600 text-sm font-medium">
          <ArrowUpRight className="h-4 w-4 mr-1" />
          +{change.toFixed(1)}%
        </span>
      );
    } else if (change < 0) {
      return (
        <span className="flex items-center text-red-600 text-sm font-medium">
          <ArrowDownRight className="h-4 w-4 mr-1" />
          {change.toFixed(1)}%
        </span>
      );
    } else {
      return (
        <span className="flex items-center text-gray-600 text-sm font-medium">
          <Minus className="h-4 w-4 mr-1" />
          0%
        </span>
      );
    }
  };

  // Helper function to format period label
  const getPeriodLabel = (type: string) => {
    const labels = {
      week: "This Week vs Last Week",
      month: "This Month vs Last Month",
      quarter: "This Quarter vs Last Quarter",
      year: "This Year vs Last Year",
    };
    return labels[type as keyof typeof labels] || "Period Comparison";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Transaction Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Analyze transaction performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                disabled={comparisonLoading}
                className="gap-2"
              >
                <Mail className="h-4 w-4" />
                Email Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Comparison Report</DialogTitle>
                <DialogDescription>
                  Send the {periodType} over {periodType} comparison report to stakeholders via email
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="recipients">Recipient Email(s) *</Label>
                  <Input
                    id="recipients"
                    placeholder="email@example.com, another@example.com"
                    value={emailRecipients}
                    onChange={(e) => setEmailRecipients(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate multiple emails with commas
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    placeholder="Add a personal message to include in the email..."
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailDialog(false)}
                  disabled={emailReport.isPending}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmailReport}
                  disabled={emailReport.isPending}
                  className="gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {emailReport.isPending ? "Sending..." : "Send Email"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={handleExportPDF}
            disabled={exportPDF.isPending || comparisonLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {exportPDF.isPending ? "Exporting..." : "Export Report"}
          </Button>
        </div>
      </div>

      {/* Period Comparison Selector */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Period Comparison</CardTitle>
          <CardDescription>
            Compare transaction performance across different time periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="period-type">Compare Period</Label>
              <Select value={periodType} onValueChange={(value: any) => setPeriodType(value)}>
                <SelectTrigger id="period-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week over Week</SelectItem>
                  <SelectItem value="month">Month over Month</SelectItem>
                  <SelectItem value="quarter">Quarter over Quarter</SelectItem>
                  <SelectItem value="year">Year over Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1 pt-6">
              <p className="text-sm text-muted-foreground">
                {comparisonData && getPeriodLabel(comparisonData.periodType)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comparison Stats Cards */}
      {comparisonData && !comparisonLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comparisonData.currentPeriod.metrics.totalTransactions.toLocaleString()}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  vs {comparisonData.previousPeriod.metrics.totalTransactions.toLocaleString()} previous
                </p>
                {renderChangeIndicator(comparisonData.changes.totalTransactions)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {comparisonData.currentPeriod.metrics.successRate.toFixed(1)}%
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  vs {comparisonData.previousPeriod.metrics.successRate.toFixed(1)}% previous
                </p>
                {renderChangeIndicator(comparisonData.changes.successRate)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(comparisonData.currentPeriod.metrics.totalRevenue / 100).toLocaleString()} FCFA
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  vs {(comparisonData.previousPeriod.metrics.totalRevenue / 100).toLocaleString()} FCFA
                </p>
                {renderChangeIndicator(comparisonData.changes.totalRevenue)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(comparisonData.currentPeriod.metrics.averageAmount / 100).toLocaleString()} FCFA
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  vs {(comparisonData.previousPeriod.metrics.averageAmount / 100).toLocaleString()} FCFA
                </p>
                {renderChangeIndicator(comparisonData.changes.averageAmount)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Original Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time transactions</p>
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
            <div className="text-2xl font-bold">
              {(totalRevenue / 100).toLocaleString()} FCFA
            </div>
            <p className="text-xs text-muted-foreground">From completed transactions</p>
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
              {totalTransactions > 0 
                ? ((failedTransactions.length / totalTransactions) * 100).toFixed(1)
                : "0"}% failure rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Trends</CardTitle>
            <CardDescription>Daily transaction volume and completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Total" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Type Distribution</CardTitle>
            <CardDescription>Breakdown by transaction type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Transaction Type</CardTitle>
            <CardDescription>Total revenue breakdown by type (FCFA)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue (FCFA)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

