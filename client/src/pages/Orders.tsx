import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Eye, MapPin, Package, FileText, FileSpreadsheet, Plus, 
  User, Edit, History, Truck, CheckCircle, XCircle, Clock, 
  AlertCircle, ArrowRight, Save
} from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { exportOrdersToPDF, exportOrdersToExcel } from "@/lib/exportUtils";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  rider_assigned: "bg-purple-100 text-purple-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  quality_verification: "bg-yellow-100 text-yellow-800",
  waiting_approval: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "rider_assigned", label: "Rider Assigned" },
  { value: "in_transit", label: "In Transit" },
  { value: "quality_verification", label: "Quality Verification" },
  { value: "waiting_approval", label: "Waiting Approval" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

// Define valid status transitions
const statusTransitions: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["rider_assigned", "cancelled"],
  rider_assigned: ["in_transit", "cancelled"],
  in_transit: ["quality_verification", "delivered", "cancelled"],
  quality_verification: ["waiting_approval", "delivered", "rejected"],
  waiting_approval: ["delivered", "rejected"],
  delivered: [],
  cancelled: [],
  rejected: [],
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  confirmed: <CheckCircle className="h-4 w-4" />,
  rider_assigned: <User className="h-4 w-4" />,
  in_transit: <Truck className="h-4 w-4" />,
  quality_verification: <AlertCircle className="h-4 w-4" />,
  waiting_approval: <Clock className="h-4 w-4" />,
  delivered: <CheckCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
};

export default function Orders() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedAddress, setEditedAddress] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [editReason, setEditReason] = useState("");
  const [statusChangeNotes, setStatusChangeNotes] = useState("");
  const [selectedRiderId, setSelectedRiderId] = useState<number | undefined>();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const { data: orders, isLoading, refetch } = trpc.orders.list.useQuery({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: orderDetails, refetch: refetchDetails } = trpc.orders.getById.useQuery(
    { id: selectedOrderId! },
    { enabled: selectedOrderId !== null }
  );

  const { data: statusHistory } = trpc.orders.getStatusHistory.useQuery(
    { orderId: selectedOrderId! },
    { enabled: selectedOrderId !== null && activeTab === "history" }
  );

  const { data: editHistory } = trpc.orders.getEditHistory.useQuery(
    { orderId: selectedOrderId! },
    { enabled: selectedOrderId !== null && activeTab === "history" }
  );

  const { data: availableRiders } = trpc.orders.getAvailableRiders.useQuery(
    undefined,
    { enabled: isStatusDialogOpen && pendingStatus === "rider_assigned" }
  );

  const updateStatusWithHistory = trpc.orders.updateStatusWithHistory.useMutation({
    onSuccess: () => {
      toast.success("Order status updated successfully");
      refetch();
      refetchDetails();
      setIsStatusDialogOpen(false);
      setPendingStatus(null);
      setStatusChangeNotes("");
      setSelectedRiderId(undefined);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const updateOrder = trpc.orders.updateOrder.useMutation({
    onSuccess: () => {
      toast.success("Order updated successfully");
      refetchDetails();
      setIsEditMode(false);
      setEditReason("");
    },
    onError: (error) => {
      toast.error(`Failed to update order: ${error.message}`);
    },
  });

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleExportPDF = () => {
    if (!orders || orders.length === 0) {
      toast.error("No orders to export");
      return;
    }
    exportOrdersToPDF(orders);
    toast.success("Orders exported to PDF");
  };

  const handleExportExcel = () => {
    if (!orders || orders.length === 0) {
      toast.error("No orders to export");
      return;
    }
    exportOrdersToExcel(orders);
    toast.success("Orders exported to Excel");
  };

  const handleStatusChange = (newStatus: string) => {
    setPendingStatus(newStatus);
    setIsStatusDialogOpen(true);
  };

  const confirmStatusChange = () => {
    if (!selectedOrderId || !pendingStatus) return;
    
    updateStatusWithHistory.mutate({
      orderId: selectedOrderId,
      status: pendingStatus,
      riderId: selectedRiderId,
      notes: statusChangeNotes || undefined,
    });
  };

  const handleEditSave = () => {
    if (!selectedOrderId) return;
    
    updateOrder.mutate({
      orderId: selectedOrderId,
      deliveryAddress: editedAddress || undefined,
      notes: editedNotes || undefined,
      reason: editReason || undefined,
    });
  };

  const startEditMode = () => {
    if (orderDetails?.order) {
      setEditedAddress(orderDetails.order.deliveryAddress);
      setEditedNotes(orderDetails.order.notes || "");
      setIsEditMode(true);
    }
  };

  const getNextStatuses = (currentStatus: string) => {
    return statusTransitions[currentStatus] || [];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('orders:title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('orders:description')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportPDF} variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            {t('orders:export_pdf')}
          </Button>
          <Button onClick={handleExportExcel} variant="outline">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t('orders:export_excel')}
          </Button>
          <Link href="/orders/create">
            <Button className="bg-[#2D8659] hover:bg-[#236B47]">
              <Plus className="h-4 w-4 mr-2" />
              Create Order
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders:filters')}</CardTitle>
          <CardDescription>{t('orders:filters_description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('orders:search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('orders:filter_by_status')} />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('orders:orders_list')}</CardTitle>
          <CardDescription>
            {t('orders:orders_found', { count: orders?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('orders:loading')}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground">
                          {order.orderNumber}
                        </p>
                        <Badge className={statusColors[order.status] || "bg-gray-100"}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.customerName || "Unknown Customer"} • {order.deliveryAddress.substring(0, 40)}...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-foreground">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {order.paymentMethod.replace(/_/g, " ")}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setActiveTab("details");
                        setIsEditMode(false);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t('orders:view')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t('orders:no_orders')}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={selectedOrderId !== null} onOpenChange={() => {
        setSelectedOrderId(null);
        setIsEditMode(false);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{t('orders:order_details')}</span>
              {orderDetails?.order && !isEditMode && (
                <Button variant="outline" size="sm" onClick={startEditMode}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Order
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {orderDetails?.order?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {orderDetails && (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="status">Status Workflow</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Tracking Timeline */}
                <OrderTrackingTimeline
                  order={{
                    id: orderDetails.order!.id,
                    orderNumber: orderDetails.order!.orderNumber,
                    status: orderDetails.order!.status,
                    pickupLocation: orderDetails.order!.pickupAddress || "Pickup location",
                    deliveryLocation: orderDetails.order!.deliveryAddress,
                    createdAt: orderDetails.order!.createdAt,
                    updatedAt: orderDetails.order!.updatedAt,
                  }}
                  rider={
                    orderDetails.order!.riderId
                      ? {
                          name: "Rider #" + orderDetails.order!.riderId,
                          phone: "N/A",
                        }
                      : undefined
                  }
                />

                {/* Order Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('orders:status')}</p>
                    <Badge className={`mt-1 ${statusColors[orderDetails.order?.status || ""] || "bg-gray-100"}`}>
                      {orderDetails.order?.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('orders:total_amount')}</p>
                    <p className="font-semibold mt-1">
                      {formatCurrency(orderDetails.order?.total || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('orders:payment_method')}</p>
                    <p className="font-medium mt-1">
                      {orderDetails.order?.paymentMethod.replace(/_/g, " ")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('orders:payment_status')}</p>
                    <p className="font-medium mt-1">
                      {orderDetails.order?.paymentStatus}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <Link href={`/customers/${orderDetails.order?.customerId}`}>
                      <Button variant="link" className="p-0 h-auto font-medium">
                        <User className="h-4 w-4 mr-1" />
                        View Customer
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <p className="font-semibold">{t('orders:delivery_address')}</p>
                  </div>
                  {isEditMode ? (
                    <Textarea
                      value={editedAddress}
                      onChange={(e) => setEditedAddress(e.target.value)}
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {orderDetails.order?.deliveryAddress}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <p className="font-semibold mb-2">Notes</p>
                  {isEditMode ? (
                    <Textarea
                      value={editedNotes}
                      onChange={(e) => setEditedNotes(e.target.value)}
                      placeholder="Add notes about this order..."
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {orderDetails.order?.notes || "No notes"}
                    </p>
                  )}
                </div>

                {/* Edit Mode Actions */}
                {isEditMode && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="text-sm font-medium">Reason for Edit</label>
                      <Input
                        value={editReason}
                        onChange={(e) => setEditReason(e.target.value)}
                        placeholder="Why are you editing this order?"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleEditSave} disabled={updateOrder.isPending}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* Order Items */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-4 w-4 text-primary" />
                    <p className="font-semibold">{t('orders:order_items')}</p>
                  </div>
                  <div className="space-y-2">
                    {orderDetails.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 bg-accent/30 rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('orders:quantity')}: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold">{formatCurrency(item.total)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quality Photos */}
                {orderDetails.photos.length > 0 && (
                  <div>
                    <p className="font-semibold mb-3">{t('orders:quality_photos')}</p>
                    <div className="grid grid-cols-3 gap-3">
                      {orderDetails.photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <img
                            src={photo.photoUrl}
                            alt="Quality verification"
                            className="w-full h-32 object-cover rounded-lg border border-border"
                          />
                          <Badge
                            className={`absolute top-2 right-2 ${
                              photo.approvalStatus === "approved"
                                ? "bg-green-100 text-green-800"
                                : photo.approvalStatus === "rejected"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {photo.approvalStatus}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="status" className="space-y-6 mt-4">
                <div className="text-center py-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    {statusIcons[orderDetails.order?.status || ""]}
                    <Badge className={`text-lg px-4 py-2 ${statusColors[orderDetails.order?.status || ""] || "bg-gray-100"}`}>
                      {orderDetails.order?.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                </div>

                {/* Next Status Options */}
                <div>
                  <p className="font-semibold mb-3">Transition to Next Status</p>
                  {getNextStatuses(orderDetails.order?.status || "").length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {getNextStatuses(orderDetails.order?.status || "").map((status) => (
                        <Button
                          key={status}
                          variant="outline"
                          className="flex items-center justify-between p-4 h-auto"
                          onClick={() => handleStatusChange(status)}
                        >
                          <div className="flex items-center gap-2">
                            {statusIcons[status]}
                            <span className="capitalize">{status.replace(/_/g, " ")}</span>
                          </div>
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      This order has reached its final status
                    </p>
                  )}
                </div>

                {/* Status Flow Diagram */}
                <div className="pt-4 border-t">
                  <p className="font-semibold mb-3">Order Status Flow</p>
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {["pending", "confirmed", "rider_assigned", "in_transit", "quality_verification", "delivered"].map((status, index) => (
                      <div key={status} className="flex items-center">
                        <Badge 
                          className={`${
                            orderDetails.order?.status === status 
                              ? statusColors[status] 
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {status.replace(/_/g, " ")}
                        </Badge>
                        {index < 5 && <ArrowRight className="h-4 w-4 mx-1 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-4">
                {/* Status History */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <History className="h-4 w-4 text-primary" />
                    <p className="font-semibold">Status History</p>
                  </div>
                  {statusHistory && statusHistory.length > 0 ? (
                    <div className="space-y-3">
                      {statusHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 p-3 bg-accent/30 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            {statusIcons[entry.newStatus]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {entry.previousStatus && (
                                <>
                                  <Badge className={statusColors[entry.previousStatus] || "bg-gray-100"}>
                                    {entry.previousStatus.replace(/_/g, " ")}
                                  </Badge>
                                  <ArrowRight className="h-4 w-4" />
                                </>
                              )}
                              <Badge className={statusColors[entry.newStatus] || "bg-gray-100"}>
                                {entry.newStatus.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(entry.createdAt)} • By {entry.changedByType}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No status history available
                    </p>
                  )}
                </div>

                {/* Edit History */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Edit className="h-4 w-4 text-primary" />
                    <p className="font-semibold">Edit History</p>
                  </div>
                  {editHistory && editHistory.length > 0 ? (
                    <div className="space-y-3">
                      {editHistory.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-3 bg-accent/30 rounded-lg"
                        >
                          <p className="font-medium capitalize">{entry.fieldChanged.replace(/_/g, " ")} changed</p>
                          {entry.reason && (
                            <p className="text-sm text-muted-foreground">Reason: {entry.reason}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(entry.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      No edit history available
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Confirmation Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Change order status to "{pendingStatus?.replace(/_/g, " ")}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {pendingStatus === "rider_assigned" && (
              <div>
                <label className="text-sm font-medium">Select Rider</label>
                <Select 
                  value={selectedRiderId?.toString()} 
                  onValueChange={(v) => setSelectedRiderId(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a rider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRiders?.map((rider) => (
                      <SelectItem key={rider.id} value={rider.id.toString()}>
                        {rider.name} - {rider.totalDeliveries} deliveries
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Textarea
                value={statusChangeNotes}
                onChange={(e) => setStatusChangeNotes(e.target.value)}
                placeholder="Add notes about this status change..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmStatusChange}
              disabled={
                updateStatusWithHistory.isPending || 
                (pendingStatus === "rider_assigned" && !selectedRiderId)
              }
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
