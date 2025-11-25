import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, TrendingUp, Users, DollarSign, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type Period = 'day' | 'week' | 'month' | 'year';

export default function GeoAnalytics() {
  const [period, setPeriod] = useState<Period>('month');
  const [selectedRegion, setSelectedRegion] = useState<number | null>(null);

  const { data: regions, isLoading: regionsLoading, refetch: refetchRegions } = trpc.geoAnalytics.getRegions.useQuery({
    regionType: 'city',
  });

  const { data: performanceData, isLoading: performanceLoading, refetch: refetchPerformance } = trpc.geoAnalytics.getPerformanceComparison.useQuery({
    period,
  });

  const { data: heatmapData, isLoading: heatmapLoading } = trpc.geoAnalytics.getOrderHeatmap.useQuery();

  const { data: regionalAnalytics } = trpc.geoAnalytics.getRegionalAnalytics.useQuery(
    {
      regionId: selectedRegion!,
      period,
    },
    {
      enabled: selectedRegion !== null,
    }
  );

  const handleRefresh = () => {
    refetchRegions();
    refetchPerformance();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const getPerformanceTrend = (value: number | undefined) => {
    if (!value) return { color: 'text-gray-500', icon: null };
    if (value > 0) return { color: 'text-green-600', icon: <TrendingUp className="w-4 h-4" /> };
    return { color: 'text-red-600', icon: <AlertCircle className="w-4 h-4" /> };
  };

  if (regionsLoading || performanceLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Geo Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Regional performance and order distribution across Cameroon
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Map Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Cameroon Regional Map
          </CardTitle>
          <CardDescription>
            Click on a region to view detailed analytics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 rounded-lg p-8 min-h-[400px] relative">
            {/* Simplified map visualization - in production, use a proper mapping library */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {regions?.map((region) => {
                const regionPerf = performanceData?.find(p => p.regionId === region.id);
                return (
                  <button
                    key={region.id}
                    onClick={() => setSelectedRegion(region.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedRegion === region.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="text-left">
                        <h3 className="font-semibold">{region.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{region.regionType}</p>
                      </div>
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    {regionPerf && (
                      <div className="mt-3 space-y-1">
                        <div className="text-xs text-muted-foreground">Orders</div>
                        <div className="text-lg font-bold">{regionPerf.totalOrders}</div>
                        <div className="text-xs text-muted-foreground">Revenue</div>
                        <div className="text-sm font-semibold">{formatCurrency(regionPerf.totalRevenue)}</div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {regions?.length === 0 && (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No regions configured yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Add regions to start tracking geographic performance
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Regional Performance Cards */}
      {performanceData && performanceData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {performanceData.slice(0, 4).map((region) => (
            <Card key={region.regionId}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center justify-between">
                  {region.regionName}
                  <Badge variant="outline">{period}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Total Orders</span>
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <p className="text-2xl font-bold mt-1">{region.totalOrders}</p>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                  <p className="text-lg font-semibold">{formatCurrency(region.totalRevenue)}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                  <div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Users</span>
                    </div>
                    <p className="text-sm font-medium">{region.activeUsers}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Riders</span>
                    </div>
                    <p className="text-sm font-medium">{region.activeRiders}</p>
                  </div>
                </div>
                {region.avgDeliveryTime && (
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>Avg: {region.avgDeliveryTime} min</span>
                  </div>
                )}
                {region.customerSatisfaction && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {region.customerSatisfaction}% Satisfaction
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Region Details */}
      {selectedRegion && regionalAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>
              {regions?.find(r => r.id === selectedRegion)?.name} - Detailed Analytics
            </CardTitle>
            <CardDescription>
              Performance metrics for the selected {period}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Total Orders</div>
                <p className="text-3xl font-bold mt-1">{regionalAnalytics.totalOrders}</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Revenue</div>
                <p className="text-2xl font-bold mt-1">{formatCurrency(regionalAnalytics.totalRevenue)}</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Users</div>
                <p className="text-3xl font-bold mt-1">{regionalAnalytics.activeUsers}</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Riders</div>
                <p className="text-3xl font-bold mt-1">{regionalAnalytics.activeRiders}</p>
              </div>
            </div>
            
            {regionalAnalytics.avgDeliveryTime && (
              <div className="mt-6 pt-6 border-t">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Avg Delivery Time</div>
                    <p className="text-xl font-semibold mt-1">{regionalAnalytics.avgDeliveryTime} min</p>
                  </div>
                  {regionalAnalytics.orderDensity && (
                    <div>
                      <div className="text-sm text-muted-foreground">Order Density</div>
                      <p className="text-xl font-semibold mt-1">{regionalAnalytics.orderDensity}/km²</p>
                    </div>
                  )}
                  {regionalAnalytics.customerSatisfaction && (
                    <div>
                      <div className="text-sm text-muted-foreground">Customer Satisfaction</div>
                      <p className="text-xl font-semibold mt-1">{regionalAnalytics.customerSatisfaction}%</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Order Heatmap */}
      {heatmapData && heatmapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Density Heatmap</CardTitle>
            <CardDescription>
              Order distribution across regions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heatmapData
                .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
                .map((region) => {
                  const intensity = Math.min((region.orderCount || 0) / 100, 1);
                  return (
                    <div
                      key={region.regionId}
                      className="p-4 rounded-lg border"
                      style={{
                        backgroundColor: `rgba(59, 130, 246, ${intensity * 0.2})`,
                        borderColor: `rgba(59, 130, 246, ${intensity})`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{region.regionName}</h4>
                          <p className="text-sm text-muted-foreground">
                            {region.latitude}, {region.longitude}
                          </p>
                        </div>
                        <Badge variant="secondary">{region.orderCount} orders</Badge>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Data State */}
      {performanceData?.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analytics Data Available</h3>
              <p className="text-muted-foreground mb-4">
                Regional analytics will appear here once orders are placed in different regions
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
