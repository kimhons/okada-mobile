import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, MapPin, Package, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { exportOrdersToPDF, exportOrdersToExcel } from "@/lib/exportUtils";
import OrderTrackingTimeline from "@/components/OrderTrackingTimeline";

const statusColors = {
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

export default function Orders() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders, isLoading, refetch } = trpc.orders.list.useQuery({
    search: search || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const { data: orderDetails } = trpc.orders.getById.useQuery(
    { id: selectedOrderId! },
    { enabled: selectedOrderId !== null }
  );

  const updateStatus = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated successfully");
      refetch();
      setSelectedOrderId(null);
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const formatDate = (date: Date | null) => {
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
          <Button
            onClick={handleExportPDF}
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            {t('orders:export_pdf')}
          </Button>
          <Button
            onClick={handleExportExcel}
            className="bg-[#2D8659] hover:bg-[#236B47]"
          >
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            {t('orders:export_excel')}
          </Button>
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
                        <Badge
                          className={`${
                            statusColors[order.status as keyof typeof statusColors]
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {order.deliveryAddress.substring(0, 60)}...
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
                      onClick={() => setSelectedOrderId(order.id)}
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
      <Dialog open={selectedOrderId !== null} onOpenChange={() => setSelectedOrderId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('orders:order_details')}</DialogTitle>
            <DialogDescription>
              {orderDetails?.order?.orderNumber}
            </DialogDescription>
          </DialogHeader>

          {orderDetails && (
            <div className="space-y-6">
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
                  <Badge
                    className={`mt-1 ${
                      statusColors[orderDetails.order?.status as keyof typeof statusColors]
                    }`}
                  >
                    {orderDetails.order?.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('orders:total_amount')}</p>
                  <p className="font-bold text-lg mt-1">
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
              </div>

              {/* Delivery Address */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{t('orders:delivery_address')}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {orderDetails.order?.deliveryAddress}
                </p>
              </div>

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

              {/* Update Status */}
              <div>
                <p className="font-semibold mb-3">{t('orders:update_status')}</p>
                <div className="flex gap-2 flex-wrap">
                  {statusOptions.slice(1).map((status) => (
                    <Button
                      key={status.value}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({
                          orderId: selectedOrderId!,
                          status: status.value,
                        })
                      }
                      disabled={orderDetails.order?.status === status.value}
                    >
                      {status.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

