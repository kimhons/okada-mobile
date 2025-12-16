import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { ShoppingBag, Users, Bike, TrendingUp, Package, DollarSign, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t } = useTranslation();

  // Fetch real data from database
  const { data: dashboardStats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentOrders, isLoading: ordersLoading } = trpc.dashboard.recentOrders.useQuery({ limit: 5 });

  // Format large numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return num.toLocaleString();
    }
    return num.toString();
  };

  // Format revenue in FCFA
  const formatRevenue = (cents: number) => {
    const fcfa = cents / 100;
    if (fcfa >= 1000000) {
      return `${(fcfa / 1000000).toFixed(1)}M FCFA`;
    }
    return `${fcfa.toLocaleString()} FCFA`;
  };

  const stats = [
    {
      titleKey: "total_orders",
      value: statsLoading ? null : formatNumber(dashboardStats?.totalOrders || 0),
      icon: ShoppingBag,
    },
    {
      titleKey: "active_users",
      value: statsLoading ? null : formatNumber(dashboardStats?.totalUsers || 0),
      icon: Users,
    },
    {
      titleKey: "active_riders",
      value: statsLoading ? null : formatNumber(dashboardStats?.totalRiders || 0),
      icon: Bike,
    },
    {
      titleKey: "total_revenue",
      value: statsLoading ? null : formatRevenue(dashboardStats?.totalRevenue || 0),
      icon: DollarSign,
    },
  ];

  const statusColors: Record<string, string> = {
    delivered: "bg-green-100 text-green-800",
    in_transit: "bg-blue-100 text-blue-800",
    quality_verification: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-purple-100 text-purple-800",
    pending: "bg-gray-100 text-gray-800",
    rider_assigned: "bg-indigo-100 text-indigo-800",
    waiting_approval: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
    rejected: "bg-red-100 text-red-800",
  };

  const getStatusLabel = (status: string) => {
    return t(`orders:status_${status}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">{t("dashboard:title")}</h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard:welcome_message")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.titleKey}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t(`dashboard:${stat.titleKey}`)}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {stat.value === null ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl font-bold">{stat.value}</div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard:recent_orders")}</CardTitle>
          <CardDescription>{t("dashboard:recent_orders_description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ordersLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))
            ) : recentOrders && recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.customer}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                    <p className="font-semibold text-foreground min-w-[100px] text-right">
                      {order.amount}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              // Empty state
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-sm">{t("common:no_data") || "No recent orders"}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {t("dashboard:manage_products")}
            </CardTitle>
            <CardDescription>{t("dashboard:manage_products_description")}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary" />
              {t("dashboard:approve_riders")}
            </CardTitle>
            <CardDescription>{t("dashboard:approve_riders_description")}</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {t("dashboard:view_analytics")}
            </CardTitle>
            <CardDescription>{t("dashboard:view_analytics_description")}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
