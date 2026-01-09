import { useState } from "react";
import { Bell, Wifi, WifiOff, X, Package, Truck, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";
import { formatDistanceToNow } from "date-fns";

export function NotificationBell() {
  const { isConnected, notifications, newOrders, clearNotifications, clearNewOrders } = useOrderNotifications();
  const [open, setOpen] = useState(false);

  const totalUnread = notifications.length + newOrders.length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return <Package className="h-4 w-4 text-green-500" />;
      case "rider_assigned":
        return <Truck className="h-4 w-4 text-blue-500" />;
      case "delivery_complete":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "status_change":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatTime = (timestamp: Date | string) => {
    try {
      const date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "just now";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalUnread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalUnread > 9 ? "9+" : totalUnread}
            </Badge>
          )}
          {/* Connection indicator */}
          <span
            className={`absolute bottom-0 right-0 h-2 w-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold">Notifications</h4>
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
          </div>
          {totalUnread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                clearNotifications();
                clearNewOrders();
              }}
            >
              Clear all
            </Button>
          )}
        </div>

        <ScrollArea className="h-[300px]">
          {totalUnread === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Bell className="h-10 w-10 mb-2 opacity-50" />
              <p className="text-sm">No new notifications</p>
              <p className="text-xs mt-1">
                {isConnected ? "You're connected for real-time updates" : "Reconnecting..."}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {/* New Orders */}
              {newOrders.map((order, index) => (
                <div
                  key={`order-${order.id}-${index}`}
                  className="p-3 hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Package className="h-4 w-4 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">New Order</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {order.orderNumber} - {order.customerName || "Customer"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(order.total / 100).toLocaleString()} FCFA
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(order.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Other Notifications */}
              {notifications.map((notification, index) => (
                <div
                  key={`notif-${notification.orderId}-${index}`}
                  className="p-3 hover:bg-accent/50 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{notification.message}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {notification.orderNumber}
                        {notification.customerName && ` - ${notification.customerName}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t">
          <p className="text-xs text-center text-muted-foreground">
            {isConnected
              ? "Real-time updates active"
              : "Connecting to server..."}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationBell;
