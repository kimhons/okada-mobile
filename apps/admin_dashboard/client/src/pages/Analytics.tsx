import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
import { TrendingUp, DollarSign, Package, Users, Download, FileText, FileSpreadsheet } from "lucide-react";
import { exportAnalyticsToPDF } from "@/lib/exportUtils";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";

const COLORS = ["#2D8659", "#F4A460", "#4682B4", "#9370DB", "#FF6B6B", "#4ECDC4", "#FFD93D", "#95E1D3"];

export default function Analytics() {
  const { t } = useTranslation("analytics");
  useI18nLoader(["analytics"]);

  const [revenuePeriod, setRevenuePeriod] = useState<"day" | "week" | "month">("day");

  const handleExportPDF = () => {
    if (!dashboardStats || !revenueData || !ordersByStatus) {
      toast.error("Data not loaded yet");
      return;
    }

    const analyticsData = {
      totalOrders: dashboardStats.totalOrders,
      totalRevenue: dashboardStats.totalRevenue,
      activeUsers: dashboardStats.totalUsers,
      activeRiders: dashboardStats.totalRiders,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item.status] = item.count;
        return acc;
      }, {} as Record<string, number>),
      revenueByPeriod: revenueData.map((item) => ({
        date: item.period,
        revenue: item.revenue,
      })),
    };

    exportAnalyticsToPDF(analyticsData);
    toast.success("Analytics report exported to PDF");
  };

  const { data: revenueData, isLoading: revenueLoading } = trpc.analytics.revenueByPeriod.useQuery({
    period: revenuePeriod,
  });

  const { data: ordersByStatus, isLoading: statusLoading } = trpc.analytics.ordersByStatus.useQuery();

  const { data: topRiders, isLoading: ridersLoading } = trpc.analytics.topRiders.useQuery({
    limit: 10,
  });

  const { data: dashboardStats } = trpc.dashboard.stats.useQuery();

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const formatRevenue = (value: number) => {
    return `${(value / 100 / 1000).toFixed(1)}K`;
  };

  // Transform revenue data for chart
  const revenueChartData = revenueData?.map((item) => ({
    period: item.period,
    revenue: item.revenue / 100,
    orders: item.orderCount,
  })) || [];

  // Transform orders by status for pie chart
  const statusChartData = ordersByStatus?.map((item) => ({
    name: item.status.replace(/_/g, " "),
    value: item.count,
  })) || [];

  // Transform top riders for bar chart
  const ridersChartData = topRiders?.map((rider) => ({
    name: rider.riderName || `Rider ${rider.riderId}`,
    earnings: rider.totalEarnings / 100,
    deliveries: rider.deliveryCount,
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <Button
          onClick={handleExportPDF}
          className="bg-[#2D8659] hover:bg-[#236B47]"
        >
          <FileText className="h-4 w-4 mr-2" />
          {t("common.export")}
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(dashboardStats?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("stats.revenueGenerated")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalOrders")}</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {dashboardStats?.totalOrders.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("stats.ordersPlaced")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.activeUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {dashboardStats?.totalUsers.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("stats.registeredUsers")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.activeRiders")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {dashboardStats?.totalRiders.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("stats.availableRiders")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("charts.orderTrends")}</CardTitle>
              <CardDescription>{t("charts.orderTrendsDescription")}</CardDescription>
            </div>
            <Select value={revenuePeriod} onValueChange={(value: any) => setRevenuePeriod(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">{t("period.today")}</SelectItem>
                <SelectItem value="week">{t("period.week")}</SelectItem>
                <SelectItem value="month">{t("period.month")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {revenueLoading ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t("loading")}
            </div>
          ) : revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="period" stroke="#6b7280" />
                <YAxis tickFormatter={formatRevenue} stroke="#6b7280" />
                <Tooltip
                  formatter={(value: any, name: string) => {
                    if (name === "revenue") return [formatCurrency(value * 100), t("charts.revenue")];
                    return [value, t("charts.orders")];
                  }}
                  contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#2D8659"
                  strokeWidth={2}
                  name={t("charts.revenue")}
                  dot={{ fill: "#2D8659" }}
                />
                <Line
                  type="monotone"
                  dataKey="orders"
                  stroke="#F4A460"
                  strokeWidth={2}
                  name={t("charts.orders")}
                  dot={{ fill: "#F4A460" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t("empty.noData")}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
            <CardDescription>Distribution of order statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("loading")}
              </div>
            ) : statusChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("empty.noData")}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Riders */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.riderPerformance")}</CardTitle>
            <CardDescription>{t("charts.riderDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            {ridersLoading ? (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("loading")}
              </div>
            ) : ridersChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ridersChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tickFormatter={formatRevenue} stroke="#6b7280" />
                  <YAxis dataKey="name" type="category" width={100} stroke="#6b7280" />
                  <Tooltip
                    formatter={(value: any, name: string) => {
                      if (name === "earnings") return [formatCurrency(value * 100), "Earnings"];
                      return [value, t("charts.deliveries")];
                    }}
                    contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e5e7eb" }}
                  />
                  <Legend />
                  <Bar dataKey="earnings" fill="#2D8659" name="Earnings (FCFA)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                {t("empty.noData")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Riders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Rider Performance Details</CardTitle>
          <CardDescription>Detailed breakdown of top riders</CardDescription>
        </CardHeader>
        <CardContent>
          {ridersLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("loading")}
            </div>
          ) : topRiders && topRiders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Rank</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Rider Name</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">{t("charts.deliveries")}</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Total Earnings</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Avg per Delivery</th>
                  </tr>
                </thead>
                <tbody>
                  {topRiders.map((rider, index) => (
                    <tr key={rider.riderId} className="border-b border-border hover:bg-accent/50">
                      <td className="py-3 px-4 text-muted-foreground">#{index + 1}</td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {rider.riderName || `Rider ${rider.riderId}`}
                      </td>
                      <td className="py-3 px-4 text-right text-foreground">{rider.deliveryCount}</td>
                      <td className="py-3 px-4 text-right font-semibold text-primary">
                        {formatCurrency(rider.totalEarnings)}
                      </td>
                      <td className="py-3 px-4 text-right text-muted-foreground">
                        {formatCurrency(Math.round(rider.totalEarnings / rider.deliveryCount))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("empty.noData")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
