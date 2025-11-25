import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, ShoppingCart } from "lucide-react";
import { Area, AreaChart, Pie, PieChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialOverview() {
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [trendDays, setTrendDays] = useState(30);

  const { data: overview, isLoading: overviewLoading } = trpc.financialOverview.getOverview.useQuery({ period });
  const { data: trends, isLoading: trendsLoading } = trpc.financialOverview.getRevenueTrends.useQuery({ days: trendDays });
  const { data: commissions, isLoading: commissionsLoading } = trpc.financialOverview.getCommissionSummary.useQuery();
  const { data: payoutStatuses, isLoading: payoutsLoading } = trpc.financialOverview.getPayoutStatuses.useQuery();
  const { data: topCategories, isLoading: categoriesLoading } = trpc.financialOverview.getTopRevenueCategories.useQuery({ limit: 5 });
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = trpc.financialOverview.getRevenueByPaymentMethod.useQuery();

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  // Prepare commission breakdown data
  const commissionData = commissions ? [
    { name: 'Platform Commission', value: commissions.platformCommission },
    { name: 'Rider Commissions', value: commissions.riderCommissions },
    { name: 'Delivery Fees', value: commissions.deliveryFees },
  ] : [];

  // Prepare payout status data
  const payoutData = payoutStatuses ? [
    { name: 'Completed', value: payoutStatuses.completed.total, count: payoutStatuses.completed.count },
    { name: 'Pending', value: payoutStatuses.pending.total, count: payoutStatuses.pending.count },
    { name: 'Failed', value: payoutStatuses.failed.total, count: payoutStatuses.failed.count },
  ] : [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">Track revenue, commissions, and payouts</p>
          </div>
          <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(overview?.current.revenue || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.revenue)} vs previous period
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Commissions</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(overview?.current.commissions || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.commissions)} vs previous period
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payouts</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(overview?.current.payouts || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.payouts)} vs previous period
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.current.orders || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.orders)} vs previous period
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trends Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Trends</CardTitle>
            <Select value={trendDays.toString()} onValueChange={(v) => setTrendDays(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 Days</SelectItem>
                <SelectItem value="30">30 Days</SelectItem>
                <SelectItem value="90">90 Days</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {trendsLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trends || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `${(value / 100).toFixed(0)}k`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Commission Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Commission Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {commissionsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={commissionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {commissionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Payout Status */}
          <Card>
            <CardHeader>
              <CardTitle>Payout Status</CardTitle>
            </CardHeader>
            <CardContent>
              {payoutsLoading ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={payoutData}>
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => `${(value / 100).toFixed(0)}k`} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend />
                    <Bar dataKey="value" fill="#3b82f6" name="Amount" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Revenue Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Top Revenue Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {categoriesLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                {topCategories?.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{category.categoryName || 'Uncategorized'}</div>
                        <div className="text-sm text-muted-foreground">{category.orderCount} orders</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(category.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            {paymentMethodsLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <div className="space-y-4">
                {paymentMethods?.map((method, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium capitalize">{method.paymentMethod || 'Unknown'}</div>
                        <div className="text-sm text-muted-foreground">{method.orderCount} transactions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{formatCurrency(method.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
