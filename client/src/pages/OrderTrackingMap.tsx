import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MapPin, Navigation, Clock, Package, User, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export default function OrderTrackingMap() {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { data: activeDeliveries = [], isLoading, refetch } = trpc.orderTracking.getActiveDeliveries.useQuery(
    undefined,
    {
      refetchInterval: autoRefresh ? 10000 : false, // Auto-refresh every 10 seconds
    }
  );

  // Calculate ETA based on distance and average speed
  const calculateETA = (lat1: string, lon1: string, lat2: string, lon2: string, speed: number = 30) => {
    const R = 6371; // Earth's radius in km
    const dLat = (parseFloat(lat2) - parseFloat(lat1)) * Math.PI / 180;
    const dLon = (parseFloat(lon2) - parseFloat(lon1)) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(parseFloat(lat1) * Math.PI / 180) * Math.cos(parseFloat(lat2) * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    
    const timeInHours = distance / speed;
    const timeInMinutes = Math.round(timeInHours * 60);
    
    return { distance: distance.toFixed(1), eta: timeInMinutes };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "in_transit": return "bg-blue-100 text-blue-800";
      case "delivered": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getRiderStatusColor = (status: string) => {
    switch (status) {
      case "idle": return "bg-gray-100 text-gray-800";
      case "en_route_pickup": return "bg-orange-100 text-orange-800";
      case "en_route_delivery": return "bg-blue-100 text-blue-800";
      case "offline": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Real-time Order Tracking</h1>
          <p className="text-muted-foreground mt-1">
            Monitor active deliveries and rider locations in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Now
          </Button>
        </div>
      </div>

      {activeDeliveries.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Deliveries</h3>
            <p className="text-muted-foreground text-center max-w-md">
              There are currently no orders in transit. Active deliveries will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Placeholder - In production, integrate with Google Maps or Leaflet */}
          <div className="lg:col-span-2">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Live Delivery Map
                </CardTitle>
                <CardDescription>
                  {activeDeliveries.length} active {activeDeliveries.length === 1 ? 'delivery' : 'deliveries'}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] bg-muted/30 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MapPin className="h-16 w-16 text-muted-foreground mx-auto" />
                  <div>
                    <h3 className="font-semibold text-lg">Map Integration</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Integrate with Google Maps API or Leaflet to display rider locations and routes.
                      Click on an order in the list to see its details.
                    </p>
                  </div>
                  {selectedOrder && (
                    <div className="mt-4 p-4 bg-background rounded-lg border">
                      <p className="text-sm font-medium">Selected Order: {selectedOrder.order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        Rider: {selectedOrder.rider?.name || 'Not assigned'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Deliveries List */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Active Deliveries</CardTitle>
                <CardDescription>
                  Orders currently in transit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[520px] overflow-y-auto">
                {activeDeliveries.map((delivery: any) => {
                  const order = delivery.order;
                  const rider = delivery.rider;
                  const location = delivery.location;
                  
                  // Calculate ETA if we have location data
                  let etaInfo = null;
                  if (location && order.deliveryLat && order.deliveryLng) {
                    etaInfo = calculateETA(
                      location.latitude,
                      location.longitude,
                      order.deliveryLat,
                      order.deliveryLng,
                      location.speed || 30
                    );
                  }

                  return (
                    <Card
                      key={order.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedOrder?.order.id === order.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedOrder(delivery)}
                    >
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-semibold">{order.orderNumber}</p>
                            <p className="text-sm text-muted-foreground">{order.customerName}</p>
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status.replace('_', ' ')}
                          </Badge>
                        </div>

                        {rider && (
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{rider.name}</span>
                            {location && (
                              <Badge variant="outline" className={getRiderStatusColor(location.status)}>
                                {location.status.replace('_', ' ')}
                              </Badge>
                            )}
                          </div>
                        )}

                        {rider && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{rider.phone}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Package className="h-4 w-4" />
                          <span>{order.totalAmount.toLocaleString()} FCFA</span>
                        </div>

                        {etaInfo && (
                          <div className="pt-2 border-t space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Navigation className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{etaInfo.distance} km away</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4" />
                              <span>ETA: ~{etaInfo.eta} minutes</span>
                            </div>
                            {location && location.speed > 0 && (
                              <div className="text-xs text-muted-foreground">
                                Speed: {location.speed} km/h
                              </div>
                            )}
                          </div>
                        )}

                        {!location && rider && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 inline mr-1" />
                              Location data not available
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

