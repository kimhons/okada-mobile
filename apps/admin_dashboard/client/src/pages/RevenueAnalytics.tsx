import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUp, DollarSign, Percent, Calendar } from "lucide-react";
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

export default function RevenueAnalytics() {
  const { t } = useTranslation("revenue");
  useI18nLoader(["revenue"]);
  const { data: analytics, isLoading } = trpc.financial.getRevenueAnalytics.useQuery();

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  // Mock data for charts (replace with real data from analytics)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 850000, commission: 127500 },
    { month: "Feb", revenue: 920000, commission: 138000 },
    { month: "Mar", revenue: 1050000, commission: 157500 },
    { month: "Apr", revenue: 980000, commission: 147000 },
    { month: "May", revenue: 1150000, commission: 172500 },
    { month: "Jun", revenue: 1250000, commission: 187500 },
  ];

  const categoryRevenueData = [
    { name: "Food & Groceries", value: 4500000, color: "#10b981" },
    { name: "Electronics", value: 2800000, color: "#3b82f6" },
    { name: "Fashion", value: 1900000, color: "#f59e0b" },
    { name: "Home & Garden", value: 1200000, color: "#8b5cf6" },
    { name: "Other", value: 800000, color: "#6b7280" },
  ];

  const stats = [
    {
      title: t("stats.totalRevenue"),
      value: formatCurrency(1250000000),
      change: "+15.3%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("stats.commissionEarned"),
      value: formatCurrency(187500000),
      change: "+12.8%",
      icon: Percent,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("stats.growthRate"),
      value: "8.5%",
      change: "+2.1%",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t("stats.thisMonth"),
      value: formatCurrency(125000000),
      change: "+18.2%",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("subtitle")}
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
                <p className="text-xs text-green-600 mt-1">{stat.change} {t("stats.fromLastMonth")}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Monthly Revenue Trend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t("charts.monthlyTrend.title")}</CardTitle>
          <CardDescription>{t("charts.monthlyTrend.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyRevenueData}>
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
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                name={t("charts.monthlyTrend.totalRevenue")}
              />
              <Line
                type="monotone"
                dataKey="commission"
                stroke="#3b82f6"
                strokeWidth={2}
                name={t("charts.monthlyTrend.commissionEarned")}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.revenueByCategory.title")}</CardTitle>
            <CardDescription>{t("charts.revenueByCategory.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Categories by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle>{t("charts.topCategories.title")}</CardTitle>
            <CardDescription>{t("charts.topCategories.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelStyle={{ color: "#000" }}
                />
                <Bar dataKey="value" name="Revenue">
                  {categoryRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

