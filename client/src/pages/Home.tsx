import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, Bike, TrendingUp, Package, DollarSign, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { t } = useTranslation();
  
  // Fetch real dashboard stats from database
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery();
  const { data: recentOrders, isLoading: ordersLoading } = trpc.dashboard.recentOrders.useQuery({ limit: 5 });

  // Format currency in FCFA
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M FCFA`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K FCFA`;
    }
    return `${amount.toLocaleString()} FCFA`;
  };

  // Format percentage change
  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change}%`;
  };

  const statCards = [
    {
      titleKey: "total_orders",
      value: stats?.totalOrders?.toLocaleString() || "0",
      change: stats?.ordersChange || 0,
      icon: ShoppingBag,
    },
    {
      titleKey: "active_users",
      value: stats?.totalUsers?.toLocaleString() || "0",
      change: stats?.usersChange || 0,
      icon: Users,
    },
    {
      titleKey: "active_riders",
      value: stats?.totalRiders?.toLocaleString() || "0",
      change: stats?.ridersChange || 0,
      icon: Bike,
    },
    {
      titleKey: "total_revenue",
      value: stats?.totalRevenue ? formatCurrency(stats.totalRevenue) : "0 FCFA",
      change: stats?.revenueChange || 0,
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
        {statCards.map((stat) => {
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
                {statsLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      <span className={stat.change >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                        {formatChange(stat.change)}
                      </span>{" "}
                      {t("dashboard:from_last_month")}
                    </p>
                  </>
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
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <ShoppingBag className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">{order.customerName}</p>
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
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders yet</p>
            </div>
          )}
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
