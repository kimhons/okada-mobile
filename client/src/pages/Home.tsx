import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, Users, Bike, TrendingUp, Package, DollarSign } from "lucide-react";

export default function Home() {
  // Mock data - will be replaced with real API calls
  const stats = [
    {
      title: "Total Orders",
      value: "1,234",
      change: "+12.5%",
      icon: ShoppingBag,
      trend: "up" as const,
    },
    {
      title: "Active Users",
      value: "8,432",
      change: "+8.2%",
      icon: Users,
      trend: "up" as const,
    },
    {
      title: "Active Riders",
      value: "156",
      change: "+5.1%",
      icon: Bike,
      trend: "up" as const,
    },
    {
      title: "Total Revenue",
      value: "12.5M FCFA",
      change: "+15.3%",
      icon: DollarSign,
      trend: "up" as const,
    },
  ];

  const recentOrders = [
    { id: "ORD-001", customer: "Jean Dupont", status: "delivered", amount: "25,000 FCFA" },
    { id: "ORD-002", customer: "Marie Kamga", status: "in_transit", amount: "18,500 FCFA" },
    { id: "ORD-003", customer: "Paul Nkeng", status: "quality_verification", amount: "32,000 FCFA" },
    { id: "ORD-004", customer: "Sophie Mballa", status: "confirmed", amount: "15,750 FCFA" },
    { id: "ORD-005", customer: "Eric Fotso", status: "pending", amount: "42,300 FCFA" },
  ];

  const statusColors = {
    delivered: "bg-green-100 text-green-800",
    in_transit: "bg-blue-100 text-blue-800",
    quality_verification: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-purple-100 text-purple-800",
    pending: "bg-gray-100 text-gray-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome to Okada Admin Dashboard
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="text-green-600 font-medium">{stat.change}</span> from last month
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest orders from customers</CardDescription>
        </CardHeader>
        <CardContent>
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
                    <p className="font-medium text-foreground">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[order.status as keyof typeof statusColors]
                    }`}
                  >
                    {order.status.replace(/_/g, " ")}
                  </span>
                  <p className="font-semibold text-foreground min-w-[100px] text-right">
                    {order.amount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Manage Products
            </CardTitle>
            <CardDescription>Add or edit product listings</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bike className="h-5 w-5 text-primary" />
              Approve Riders
            </CardTitle>
            <CardDescription>Review pending rider applications</CardDescription>
          </CardHeader>
        </Card>
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              View Analytics
            </CardTitle>
            <CardDescription>Check performance metrics</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

