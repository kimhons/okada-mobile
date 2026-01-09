import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

interface OrderNotification {
  orderId: number;
  orderNumber: string;
  status: string;
  customerName?: string;
  message: string;
  type: "status_change" | "new_order" | "rider_assigned" | "delivery_complete";
  timestamp: Date;
}

interface NewOrderAlert {
  id: number;
  orderNumber: string;
  customerName?: string;
  total: number;
  deliveryAddress: string;
  timestamp: Date;
}

interface RiderAssignment {
  orderId: number;
  orderNumber: string;
  riderId: number;
  riderName: string;
  timestamp: Date;
}

interface RiderLocation {
  riderId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

interface UseOrderNotificationsReturn {
  isConnected: boolean;
  notifications: OrderNotification[];
  newOrders: NewOrderAlert[];
  riderLocations: Map<number, RiderLocation>;
  clearNotifications: () => void;
  clearNewOrders: () => void;
}

export function useOrderNotifications(): UseOrderNotificationsReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [newOrders, setNewOrders] = useState<NewOrderAlert[]>([]);
  const [riderLocations, setRiderLocations] = useState<Map<number, RiderLocation>>(new Map());

  useEffect(() => {
    // Connect to WebSocket server
    const wsUrl = window.location.origin;
    const newSocket = io(wsUrl, {
      path: "/ws",
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("[WebSocket] Connected to server");
      setIsConnected(true);
      
      // Register as admin
      newSocket.emit("admin:register");
    });

    newSocket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected from server");
      setIsConnected(false);
    });

    // Handle order notifications
    newSocket.on("order:notification", (data: OrderNotification) => {
      console.log("[WebSocket] Order notification received:", data);
      setNotifications((prev) => [data, ...prev.slice(0, 49)]); // Keep last 50
      
      // Show toast notification
      const toastType = data.type === "delivery_complete" ? "success" : "info";
      if (toastType === "success") {
        toast.success(data.message, {
          description: `Order ${data.orderNumber}`,
        });
      } else {
        toast.info(data.message, {
          description: `Order ${data.orderNumber}`,
        });
      }
    });

    // Handle new order alerts
    newSocket.on("order:new:alert", (data: NewOrderAlert) => {
      console.log("[WebSocket] New order alert:", data);
      setNewOrders((prev) => [data, ...prev.slice(0, 19)]); // Keep last 20
      
      // Play notification sound (if available)
      try {
        const audio = new Audio("/sounds/new-order.mp3");
        audio.play().catch(() => {}); // Ignore if audio fails
      } catch (e) {
        // Ignore audio errors
      }
      
      toast.success("New Order Received!", {
        description: `${data.orderNumber} - ${data.customerName || "Customer"} - ${(data.total / 100).toLocaleString()} FCFA`,
        duration: 10000,
      });
    });

    // Handle rider assignment
    newSocket.on("order:rider:assigned", (data: RiderAssignment) => {
      console.log("[WebSocket] Rider assigned:", data);
      toast.info(`Rider Assigned`, {
        description: `${data.riderName} assigned to order ${data.orderNumber}`,
      });
    });

    // Handle rider location updates
    newSocket.on("rider:location:update", (data: RiderLocation) => {
      setRiderLocations((prev) => {
        const newMap = new Map(prev);
        newMap.set(data.riderId, data);
        return newMap;
      });
    });

    // Handle rider online/offline
    newSocket.on("rider:online", (data: { riderId: number }) => {
      toast.info(`Rider ${data.riderId} is now online`);
    });

    newSocket.on("rider:offline", (data: { riderId: number }) => {
      toast.warning(`Rider ${data.riderId} went offline`);
      setRiderLocations((prev) => {
        const newMap = new Map(prev);
        newMap.delete(data.riderId);
        return newMap;
      });
    });

    // Handle order status updates
    newSocket.on("order:status:update", (data: { orderId: number; status: string }) => {
      console.log("[WebSocket] Order status update:", data);
    });

    // Handle delivery completion
    newSocket.on("delivery:completed", (data: { orderId: number; riderId: number }) => {
      toast.success("Delivery Completed!", {
        description: `Order #${data.orderId} has been delivered`,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearNewOrders = useCallback(() => {
    setNewOrders([]);
  }, []);

  return {
    isConnected,
    notifications,
    newOrders,
    riderLocations,
    clearNotifications,
    clearNewOrders,
  };
}

export default useOrderNotifications;
