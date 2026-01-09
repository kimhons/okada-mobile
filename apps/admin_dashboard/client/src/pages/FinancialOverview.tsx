import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Wallet, ShoppingCart, RefreshCw } from "lucide-react";
import { Area, AreaChart, Pie, PieChart, Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from "recharts";
import DashboardLayout from "@/components/DashboardLayout";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function FinancialOverview() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [trendDays, setTrendDays] = useState(30);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const utils = trpc.useUtils();
  const { data: overview, isLoading: overviewLoading } = trpc.financialOverview.getOverview.useQuery({ period });
  const { data: trends, isLoading: trendsLoading } = trpc.financialOverview.getRevenueTrends.useQuery({ days: trendDays });
  const { data: commissions, isLoading: commissionsLoading } = trpc.financialOverview.getCommissionSummary.useQuery();
  const { data: payoutStatuses, isLoading: payoutsLoading } = trpc.financialOverview.getPayoutStatuses.useQuery();
  const { data: topCategories, isLoading: categoriesLoading } = trpc.financialOverview.getTopRevenueCategories.useQuery({ limit: 5 });
  const { data: paymentMethods, isLoading: paymentMethodsLoading } = trpc.financialOverview.getRevenueByPaymentMethod.useQuery();

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [period, trendDays]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      utils.financialOverview.getOverview.invalidate(),
      utils.financialOverview.getRevenueTrends.invalidate(),
      utils.financialOverview.getCommissionSummary.invalidate(),
      utils.financialOverview.getPayoutStatuses.invalidate(),
      utils.financialOverview.getTopRevenueCategories.invalidate(),
      utils.financialOverview.getRevenueByPaymentMethod.invalidate(),
    ]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

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
    { name: t('financial:platform_commission'), value: commissions.platformCommission },
    { name: t('financial:rider_commissions'), value: commissions.riderCommissions },
    { name: t('financial:delivery_fees'), value: commissions.deliveryFees },
  ] : [];

  // Prepare payout status data
  const payoutData = payoutStatuses ? [
    { name: t('financial:completed'), value: payoutStatuses.completed.total, count: payoutStatuses.completed.count },
    { name: t('financial:pending'), value: payoutStatuses.pending.total, count: payoutStatuses.pending.count },
    { name: t('financial:failed'), value: payoutStatuses.failed.total, count: payoutStatuses.failed.count },
  ] : [];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{t("financial:title")}</h1>
            <p className="text-muted-foreground">{t("financial:description")}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {t("financial:last_updated")}: {formatTime(lastUpdated)} • {t("financial:auto_refreshes")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t("financial:refresh")}
            </Button>
            <Select value={period} onValueChange={(v) => setPeriod(v as typeof period)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t("financial:today")}</SelectItem>
                <SelectItem value="week">{t("financial:this_week")}</SelectItem>
                <SelectItem value="month">{t("financial:this_month")}</SelectItem>
                <SelectItem value="year">{t("financial:this_year")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("financial:total_revenue")}</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(overview?.current.revenue || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.revenue)} {t("financial:vs_previous_period")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("financial:commissions")}</CardTitle>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(overview?.current.commissions || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.commissions)} {t("financial:vs_previous_period")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("financial:payouts")}</CardTitle>
              <Wallet className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatCurrency(overview?.current.payouts || 0)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.payouts)} {t("financial:vs_previous_period")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{t("financial:orders")}</CardTitle>
              <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {overviewLoading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.current.orders || 0}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {overview && formatGrowth(overview.growth.orders)} {t("financial:vs_previous_period")}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Revenue Trends Chart */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("financial:revenue_trends")}</CardTitle>
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
              <CardTitle>{t("financial:commission_breakdown")}</CardTitle>
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
              <CardTitle>{t("financial:payout_status")}</CardTitle>
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
                    <Bar dataKey="value" fill="#3b82f6" name={t("financial:amount")} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Top Revenue Categories */}
        <Card>
          <CardHeader>
            <CardTitle>{t("financial:top_revenue_categories")}</CardTitle>
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
                        <div className="font-medium">{category.categoryName || t('financial:uncategorized')}</div>
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
            <CardTitle>{t("financial:revenue_by_payment_method")}</CardTitle>
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
                        <div className="font-medium capitalize">{method.paymentMethod || t('financial:unknown')}</div>
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
