import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Package, CheckCircle, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWebSocket } from "@/hooks/useWebSocket";
import { toast } from "sonner";

export default function LiveDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // WebSocket connection for real-time updates
  const { 
    isConnected, 
    getAllRiderLocations, 
    getOnlineRiderCount,
    lastOrderUpdate,
    lastDeliveryComplete 
  } = useWebSocket();

  const { data: stats, isLoading: statsLoading } = trpc.liveDashboard.getStats.useQuery();
  const { data: activeRiders, isLoading: ridersLoading } = trpc.liveDashboard.getActiveRiders.useQuery();
  const { data: events, isLoading: eventsLoading } = trpc.liveDashboard.getEvents.useQuery({ limit: 20 });

  const utils = trpc.useUtils();
  
  // Real-time rider locations from WebSocket
  const wsRiderLocations = getAllRiderLocations();
  const wsOnlineCount = getOnlineRiderCount();

  // Show toast notifications for real-time events
  useEffect(() => {
    if (lastOrderUpdate) {
      toast.info(`Order #${lastOrderUpdate.orderId} status: ${lastOrderUpdate.status}`);
      utils.liveDashboard.getStats.invalidate();
      utils.liveDashboard.getEvents.invalidate();
    }
  }, [lastOrderUpdate]);

  useEffect(() => {
    if (lastDeliveryComplete) {
      toast.success(`Delivery completed for order #${lastDeliveryComplete.orderId}`);
      utils.liveDashboard.getStats.invalidate();
      utils.liveDashboard.getEvents.invalidate();
    }
  }, [lastDeliveryComplete]);

  // Auto-refresh every 10 seconds (fallback when WebSocket is not connected)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        utils.liveDashboard.getStats.invalidate();
        utils.liveDashboard.getActiveRiders.invalidate();
        utils.liveDashboard.getEvents.invalidate();
      }
      setLastUpdate(new Date());
    }, 10000);

    return () => clearInterval(interval);
  }, [utils, isConnected]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "order_created":
        return <Package className="h-4 w-4 text-blue-600" />;
      case "order_assigned":
        return <Users className="h-4 w-4 text-purple-600" />;
      case "order_picked_up":
        return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case "order_delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rider_online":
        return <Activity className="h-4 w-4 text-green-600" />;
      case "rider_offline":
        return <Activity className="h-4 w-4 text-gray-400" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "order_created":
        return "bg-blue-100 text-blue-800";
      case "order_assigned":
        return "bg-purple-100 text-purple-800";
      case "order_picked_up":
        return "bg-orange-100 text-orange-800";
      case "order_delivered":
        return "bg-green-100 text-green-800";
      case "rider_online":
        return "bg-green-100 text-green-800";
      case "rider_offline":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getTimeAgo = (timestamp: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-green-600 animate-pulse" />
            Live Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time operations monitoring • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={isConnected ? "bg-green-600" : "bg-yellow-600"}>
            {isConnected ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
            {isConnected ? "WebSocket Connected" : "Polling Mode"}
          </Badge>
          <Badge className="bg-green-600 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-white mr-2" />
            LIVE
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.activeOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">In progress right now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.activeRiders || 0}
            </div>
            <p className="text-xs text-muted-foreground">Online and available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.pendingOrders || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? "..." : stats?.completedToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">Delivered successfully</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Active Riders */}
        <Card>
          <CardHeader>
            <CardTitle>Active Riders</CardTitle>
            <CardDescription>
              Riders currently online and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {ridersLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading riders...</div>
            ) : !activeRiders || activeRiders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No active riders</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activeRiders.map((rider: any) => (
                  <div
                    key={rider.riderId}
                    className="flex items-center gap-3 p-3 rounded-lg border"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={rider.riderPhoto || undefined} />
                      <AvatarFallback>{rider.riderName?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-semibold">{rider.riderName}</div>
                      <div className="text-sm text-muted-foreground">{rider.riderPhone}</div>
                    </div>
                    <div className="text-right">
                      {rider.currentOrderId ? (
                        <Badge className="bg-blue-600">
                          Order #{rider.currentOrderId}
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600">Available</Badge>
                      )}
                      {rider.lastUpdate && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {getTimeAgo(rider.lastUpdate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Live Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle>Live Activity Feed</CardTitle>
            <CardDescription>
              Recent events and system activity
            </CardDescription>
          </CardHeader>
          <CardContent>
            {eventsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading events...</div>
            ) : !events || events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No recent events</div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {events.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg border"
                  >
                    <div className="mt-0.5">{getEventIcon(event.eventType)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getEventColor(event.eventType)} variant="outline">
                          {formatEventType(event.eventType)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getTimeAgo(event.timestamp)}
                        </span>
                      </div>
                      <div className="text-sm mt-1">
                        {event.entityType} ID: {event.entityId}
                      </div>
                      {event.eventData && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {event.eventData}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
