import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, Server, Database, Cpu, HardDrive, Wifi, RefreshCw, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function SystemHealth() {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data - in production this would come from real monitoring
  const systemMetrics = {
    uptime: 99.97,
    responseTime: 145,
    errorRate: 0.03,
    activeConnections: 1247,
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 55,
    networkIn: 125.4,
    networkOut: 89.2,
  };

  const services = [
    { name: "API Server", status: "healthy", uptime: 99.99, responseTime: 45 },
    { name: "Database", status: "healthy", uptime: 99.98, responseTime: 12 },
    { name: "Cache Server", status: "healthy", uptime: 99.95, responseTime: 2 },
    { name: "File Storage", status: "healthy", uptime: 99.90, responseTime: 85 },
    { name: "Email Service", status: "warning", uptime: 98.50, responseTime: 250 },
    { name: "SMS Gateway", status: "healthy", uptime: 99.80, responseTime: 120 },
  ];

  const performanceHistory = [
    { time: "00:00", responseTime: 120, errorRate: 0.02, requests: 450 },
    { time: "04:00", responseTime: 95, errorRate: 0.01, requests: 180 },
    { time: "08:00", responseTime: 180, errorRate: 0.05, requests: 890 },
    { time: "12:00", responseTime: 210, errorRate: 0.08, requests: 1250 },
    { time: "16:00", responseTime: 165, errorRate: 0.04, requests: 980 },
    { time: "20:00", responseTime: 145, errorRate: 0.03, requests: 720 },
    { time: "Now", responseTime: 145, errorRate: 0.03, requests: 650 },
  ];

  const alerts = [
    { id: 1, type: "warning", message: "Email service response time elevated", time: "15 min ago" },
    { id: 2, type: "info", message: "Scheduled maintenance completed", time: "2 hours ago" },
    { id: 3, type: "success", message: "Database backup completed successfully", time: "6 hours ago" },
  ];

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      healthy: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      error: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[status] || ""}>{status.toUpperCase()}</Badge>;
  };

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99.9) return "text-green-600";
    if (uptime >= 99) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Health</h1>
          <p className="text-muted-foreground">Monitor uptime, performance, and system resources</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button
            size="sm"
            variant={autoRefresh ? "default" : "outline"}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? "animate-spin" : ""}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Server className="h-4 w-4" />
              System Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUptimeColor(systemMetrics.uptime)}`}>
              {systemMetrics.uptime}%
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Avg Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">P95 latency</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Error Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">Last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Active Connections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemMetrics.activeConnections}</div>
            <p className="text-xs text-muted-foreground">Current</p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Cpu className="h-4 w-4" />
              CPU Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemMetrics.cpuUsage}%</span>
                <Badge variant={systemMetrics.cpuUsage > 80 ? "destructive" : "secondary"}>
                  {systemMetrics.cpuUsage > 80 ? "High" : "Normal"}
                </Badge>
              </div>
              <Progress value={systemMetrics.cpuUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemMetrics.memoryUsage}%</span>
                <Badge variant={systemMetrics.memoryUsage > 85 ? "destructive" : "secondary"}>
                  {systemMetrics.memoryUsage > 85 ? "High" : "Normal"}
                </Badge>
              </div>
              <Progress value={systemMetrics.memoryUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Disk Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{systemMetrics.diskUsage}%</span>
                <Badge variant={systemMetrics.diskUsage > 90 ? "destructive" : "secondary"}>
                  {systemMetrics.diskUsage > 90 ? "Critical" : "Normal"}
                </Badge>
              </div>
              <Progress value={systemMetrics.diskUsage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Performance History</CardTitle>
          <CardDescription>Response time and request volume over the last 24 hours</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="responseTime"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.3}
                  name="Response Time (ms)"
                />
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="requests"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.3}
                  name="Requests"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>Health status of all system services</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(service.status)}
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.responseTime}ms</p>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(service.status)}
                  <p className={`text-sm ${getUptimeColor(service.uptime)}`}>{service.uptime}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>System alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />}
                {alert.type === "info" && <Activity className="h-5 w-5 text-blue-500 mt-0.5" />}
                {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />}
                <div className="flex-1">
                  <p className="font-medium">{alert.message}</p>
                  <p className="text-sm text-muted-foreground">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
