import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { AlertTriangle, CheckCircle2, XCircle, Settings, RefreshCw, Package } from "lucide-react";
import { toast } from "sonner";

export default function InventoryAlerts() {
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([]);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showThresholdDialog, setShowThresholdDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [resolveNotes, setResolveNotes] = useState("");
  const [filterStatus, setFilterStatus] = useState<"active" | "resolved" | "dismissed" | undefined>("active");
  const [filterSeverity, setFilterSeverity] = useState<"critical" | "warning" | "info" | undefined>();

  // Threshold form state
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [criticalStockThreshold, setCriticalStockThreshold] = useState("");
  const [overstockThreshold, setOverstockThreshold] = useState("");

  const { data: alerts = [], isLoading, refetch } = trpc.inventoryAlerts.list.useQuery({
    status: filterStatus,
    severity: filterSeverity,
  });

  const checkStockMutation = trpc.inventoryAlerts.checkStockLevels.useMutation({
    onSuccess: (data) => {
      toast.success(`Stock check complete. ${data.newAlerts} new alerts created.`);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to check stock levels");
    },
  });

  const resolveMutation = trpc.inventoryAlerts.resolve.useMutation({
    onSuccess: () => {
      toast.success("Alert resolved successfully");
      setShowResolveDialog(false);
      setResolveNotes("");
      setSelectedAlerts([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resolve alert");
    },
  });

  const bulkResolveMutation = trpc.inventoryAlerts.bulkResolve.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} alerts resolved successfully`);
      setSelectedAlerts([]);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to resolve alerts");
    },
  });

  const dismissMutation = trpc.inventoryAlerts.dismiss.useMutation({
    onSuccess: () => {
      toast.success("Alert dismissed");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to dismiss alert");
    },
  });

  const createThresholdMutation = trpc.inventoryThresholds.create.useMutation({
    onSuccess: () => {
      toast.success("Threshold configured successfully");
      setShowThresholdDialog(false);
      setSelectedProduct(null);
      setLowStockThreshold("");
      setCriticalStockThreshold("");
      setOverstockThreshold("");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to configure threshold");
    },
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "info": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical": return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning": return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "info": return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const handleBulkResolve = () => {
    if (selectedAlerts.length === 0) {
      toast.error("Please select alerts to resolve");
      return;
    }
    bulkResolveMutation.mutate({ ids: selectedAlerts });
  };

  const handleToggleAlert = (alertId: number) => {
    setSelectedAlerts(prev =>
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAlerts.length === alerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(alerts.map((alert: any) => alert.id));
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage low stock and inventory issues
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkStockMutation.mutate()}
            disabled={checkStockMutation.isPending}
            className="gap-2"
          >
            {checkStockMutation.isPending ? (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Check Stock Levels
          </Button>
          {selectedAlerts.length > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkResolve}
              disabled={bulkResolveMutation.isPending}
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Resolve Selected ({selectedAlerts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === "active" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("active")}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === "resolved" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("resolved")}
            >
              Resolved
            </Button>
            <Button
              variant={filterStatus === "dismissed" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("dismissed")}
            >
              Dismissed
            </Button>
            <Button
              variant={filterStatus === undefined ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(undefined)}
            >
              All
            </Button>
            <div className="border-l mx-2"></div>
            <Button
              variant={filterSeverity === "critical" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity(filterSeverity === "critical" ? undefined : "critical")}
            >
              Critical
            </Button>
            <Button
              variant={filterSeverity === "warning" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity(filterSeverity === "warning" ? undefined : "warning")}
            >
              Warning
            </Button>
            <Button
              variant={filterSeverity === "info" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSeverity(filterSeverity === "info" ? undefined : "info")}
            >
              Info
            </Button>
          </div>
        </CardContent>
      </Card>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {filterStatus === "active"
                ? "All inventory levels are within normal ranges. Great job!"
                : "No alerts match the selected filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filterStatus === "active" && alerts.length > 0 && (
            <div className="flex items-center gap-2 px-4">
              <Checkbox
                checked={selectedAlerts.length === alerts.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                Select all ({alerts.length})
              </span>
            </div>
          )}

          {alerts.map((alert: any) => (
            <Card key={alert.id} className="border-l-4" style={{ borderLeftColor: alert.severity === 'critical' ? '#ef4444' : alert.severity === 'warning' ? '#eab308' : '#3b82f6' }}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {filterStatus === "active" && (
                    <Checkbox
                      checked={selectedAlerts.includes(alert.id)}
                      onCheckedChange={() => handleToggleAlert(alert.id)}
                    />
                  )}
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(alert.severity)}
                        <div>
                          <h3 className="font-semibold text-lg">{alert.product?.name || `Product #${alert.productId}`}</h3>
                          <p className="text-sm text-muted-foreground">
                            {alert.alertType.replace('_', ' ').toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Stock</p>
                        <p className="text-lg font-semibold">{alert.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Threshold</p>
                        <p className="text-lg font-semibold">{alert.threshold}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-sm capitalize">{alert.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Created</p>
                        <p className="text-sm">{new Date(alert.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {alert.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm"><strong>Notes:</strong> {alert.notes}</p>
                      </div>
                    )}

                    {alert.status === "active" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedAlerts([alert.id]);
                            setShowResolveDialog(true);
                          }}
                          className="gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Resolve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => dismissMutation.mutate({ id: alert.id })}
                          className="gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Dismiss
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedProduct(alert.product);
                            setShowThresholdDialog(true);
                          }}
                          className="gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Configure Threshold
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Alert</DialogTitle>
            <DialogDescription>
              Add notes about how this alert was resolved (optional).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Resolution Notes</Label>
              <Textarea
                id="notes"
                placeholder="e.g., Restocked 100 units from supplier..."
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowResolveDialog(false);
                setResolveNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedAlerts.length === 1) {
                  resolveMutation.mutate({
                    id: selectedAlerts[0],
                    notes: resolveNotes || undefined,
                  });
                }
              }}
              disabled={resolveMutation.isPending}
            >
              {resolveMutation.isPending ? "Resolving..." : "Resolve Alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Threshold Configuration Dialog */}
      <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configure Inventory Threshold</DialogTitle>
            <DialogDescription>
              Set stock level thresholds for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="critical">Critical Stock Threshold</Label>
              <Input
                id="critical"
                type="number"
                placeholder="e.g., 10"
                value={criticalStockThreshold}
                onChange={(e) => setCriticalStockThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock falls below this level (critical severity)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="low">Low Stock Threshold</Label>
              <Input
                id="low"
                type="number"
                placeholder="e.g., 50"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock falls below this level (warning severity)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="overstock">Overstock Threshold (Optional)</Label>
              <Input
                id="overstock"
                type="number"
                placeholder="e.g., 1000"
                value={overstockThreshold}
                onChange={(e) => setOverstockThreshold(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Alert when stock exceeds this level (info severity)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowThresholdDialog(false);
                setSelectedProduct(null);
                setLowStockThreshold("");
                setCriticalStockThreshold("");
                setOverstockThreshold("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedProduct && lowStockThreshold && criticalStockThreshold) {
                  createThresholdMutation.mutate({
                    productId: selectedProduct.id,
                    lowStockThreshold: parseInt(lowStockThreshold),
                    criticalStockThreshold: parseInt(criticalStockThreshold),
                    overstockThreshold: overstockThreshold ? parseInt(overstockThreshold) : undefined,
                  });
                }
              }}
              disabled={!lowStockThreshold || !criticalStockThreshold || createThresholdMutation.isPending}
            >
              {createThresholdMutation.isPending ? "Saving..." : "Save Threshold"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

