import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, ShoppingCart, Bike, Activity, Server, Database, Cpu, HardDrive, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function PlatformStatistics() {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: currentStats, isLoading, refetch } = trpc.platformStats.getCurrent.useQuery();
  const { data: historicalStats } = trpc.platformStats.getHistorical.useQuery({ hours: 24 });

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
      setLastUpdated(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const handleManualRefresh = () => {
    refetch();
    setLastUpdated(new Date());
  };

  const getHealthStatus = (uptime: number) => {
    if (uptime >= 9900) return { label: "Excellent", color: "bg-green-500" };
    if (uptime >= 9500) return { label: "Good", color: "bg-blue-500" };
    if (uptime >= 9000) return { label: "Fair", color: "bg-yellow-500" };
    return { label: "Poor", color: "bg-red-500" };
  };

  const getResponseTimeStatus = (ms: number) => {
    if (ms < 100) return { label: "Excellent", color: "bg-green-500" };
    if (ms < 300) return { label: "Good", color: "bg-blue-500" };
    if (ms < 500) return { label: "Fair", color: "bg-yellow-500" };
    return { label: "Slow", color: "bg-red-500" };
  };

  const healthStatus = currentStats ? getHealthStatus(currentStats.systemUptime) : { label: "Unknown", color: "bg-gray-500" };
  const responseStatus = currentStats ? getResponseTimeStatus(currentStats.avgResponseTime) : { label: "Unknown", color: "bg-gray-500" };

  // Prepare chart data
  const chartData = historicalStats?.map((stat) => ({
    time: new Date(stat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    activeUsers: stat.activeUsers,
    concurrentOrders: stat.concurrentOrders,
    availableRiders: stat.availableRiders,
    responseTime: stat.avgResponseTime,
  })) || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Platform Statistics</h1>
            <p className="text-muted-foreground">Real-time system health and performance monitoring</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleManualRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${healthStatus.color} flex items-center justify-center`}>
                  <Server className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{currentStats ? (currentStats.systemUptime / 100).toFixed(2) : "0.00"}%</div>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <Badge className="mt-1">{healthStatus.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                API Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full ${responseStatus.color} flex items-center justify-center`}>
                  <Activity className="h-8 w-8 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold">{currentStats?.avgResponseTime || 0}ms</div>
                  <p className="text-sm text-muted-foreground">Avg Response Time</p>
                  <Badge className="mt-1">{responseStatus.label}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Real-time Metrics */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">Online in last 5 min</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concurrent Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.concurrentOrders || 0}</div>
              <p className="text-xs text-muted-foreground">Orders in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Riders</CardTitle>
              <Bike className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.availableRiders || 0}</div>
              <p className="text-xs text-muted-foreground">Ready for assignment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Busy Riders</CardTitle>
              <Bike className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.busyRiders || 0}</div>
              <p className="text-xs text-muted-foreground">On delivery</p>
            </CardContent>
          </Card>
        </div>

        {/* System Resources */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.cpuUsage || 0}%</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${currentStats?.cpuUsage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
              <HardDrive className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.memoryUsage || 0}%</div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${currentStats?.memoryUsage || 0}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DB Connections</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.databaseConnections || 0}</div>
              <p className="text-xs text-muted-foreground">Active connections</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">API Calls</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStats?.apiCallVolume || 0}</div>
              <p className="text-xs text-muted-foreground">Calls per minute</p>
            </CardContent>
          </Card>
        </div>

        {/* Error Rate */}
        <Card>
          <CardHeader>
            <CardTitle>Error Rate</CardTitle>
            <CardDescription>Current system error rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {currentStats ? (currentStats.errorRate / 100).toFixed(2) : "0.00"}%
              </div>
              <div className="flex-1">
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      (currentStats?.errorRate || 0) < 100 ? "bg-green-500" :
                      (currentStats?.errorRate || 0) < 500 ? "bg-yellow-500" :
                      "bg-red-500"
                    }`}
                    style={{ width: `${Math.min((currentStats?.errorRate || 0) / 10, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Historical Trends */}
        <Card>
          <CardHeader>
            <CardTitle>24-Hour Trends</CardTitle>
            <CardDescription>Historical platform metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="activeUsers" stroke="#8884d8" name="Active Users" />
                  <Line type="monotone" dataKey="concurrentOrders" stroke="#82ca9d" name="Concurrent Orders" />
                  <Line type="monotone" dataKey="availableRiders" stroke="#ffc658" name="Available Riders" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No historical data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Response Time Trend */}
        <Card>
          <CardHeader>
            <CardTitle>API Response Time Trend</CardTitle>
            <CardDescription>Average response time over 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="responseTime" stroke="#ff7300" name="Response Time (ms)" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No historical data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
