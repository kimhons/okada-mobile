import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Package, Bike, CheckCircle, Clock } from "lucide-react";

interface OrderTrackingTimelineProps {
  order: {
    id: number;
    orderNumber: string;
    status: string;
    pickupLocation: string;
    deliveryLocation: string;
    createdAt: Date;
    updatedAt: Date;
  };
  rider?: {
    name: string;
    phone: string;
    vehicleType?: string;
    vehicleNumber?: string;
  };
}

const statusSteps = [
  { key: "pending", label: "Order Placed", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "rider_assigned", label: "Rider Assigned", icon: Bike },
  { key: "in_transit", label: "In Transit", icon: MapPin },
  { key: "quality_verification", label: "Quality Check", icon: Clock },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

export default function OrderTrackingTimeline({
  order,
  rider,
}: OrderTrackingTimelineProps) {
  const currentStatusIndex = statusSteps.findIndex((step) => step.key === order.status);

  const getStepStatus = (index: number) => {
    if (order.status === "cancelled" || order.status === "rejected") {
      return "cancelled";
    }
    if (index < currentStatusIndex) return "completed";
    if (index === currentStatusIndex) return "current";
    return "pending";
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#2D8659] text-white";
      case "current":
        return "bg-blue-600 text-white animate-pulse";
      case "cancelled":
        return "bg-red-600 text-white";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  const getLineColor = (index: number) => {
    const status = getStepStatus(index);
    if (status === "completed") return "bg-[#2D8659]";
    if (status === "cancelled") return "bg-red-600";
    return "bg-gray-200";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#2D8659]" />
          Order Tracking - {order.orderNumber}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Status</p>
              <Badge
                className={
                  order.status === "delivered"
                    ? "bg-green-600 hover:bg-green-700"
                    : order.status === "cancelled" || order.status === "rejected"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              >
                {order.status.replace(/_/g, " ").toUpperCase()}
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-sm font-medium">
                {new Date(order.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="relative">
            {statusSteps.map((step, index) => {
              const stepStatus = getStepStatus(index);
              const Icon = step.icon;
              const isLast = index === statusSteps.length - 1;

              return (
                <div key={step.key} className="relative flex items-start gap-4 pb-8">
                  {/* Vertical Line */}
                  {!isLast && (
                    <div
                      className={`absolute left-5 top-12 w-0.5 h-full ${getLineColor(
                        index
                      )}`}
                    />
                  )}

                  {/* Icon Circle */}
                  <div
                    className={`relative z-10 flex items-center justify-center h-10 w-10 rounded-full ${getStepColor(
                      stepStatus
                    )}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-1">
                    <p
                      className={`font-medium ${
                        stepStatus === "current"
                          ? "text-blue-700"
                          : stepStatus === "completed"
                          ? "text-[#2D8659]"
                          : stepStatus === "cancelled"
                          ? "text-red-700"
                          : "text-gray-500"
                      }`}
                    >
                      {step.label}
                    </p>
                    {stepStatus === "current" && (
                      <p className="text-sm text-gray-600 mt-1">In progress...</p>
                    )}
                    {stepStatus === "completed" && (
                      <p className="text-sm text-gray-500 mt-1">Completed</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Location Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-[#2D8659] flex items-center justify-center flex-shrink-0">
                <Package className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">Pickup Location</div>
                <div className="text-sm text-gray-600 mt-1">{order.pickupLocation}</div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                <MapPin className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900">
                  Delivery Location
                </div>
                <div className="text-sm text-gray-600 mt-1">{order.deliveryLocation}</div>
              </div>
            </div>
          </div>

          {/* Rider Info */}
          {rider && (
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border-t">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Bike className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm text-gray-900">Assigned Rider</div>
                  <Badge className="bg-blue-600">Active</Badge>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {rider.name} • {rider.phone}
                </div>
                {rider.vehicleType && (
                  <div className="text-xs text-gray-500 mt-1">
                    {rider.vehicleType} - {rider.vehicleNumber}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Cancelled/Rejected Message */}
          {(order.status === "cancelled" || order.status === "rejected") && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm font-medium text-red-800">
                This order has been {order.status}
              </p>
              <p className="text-xs text-red-600 mt-1">
                No further tracking updates will be available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

