import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface RiderLocation {
  riderId: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: Date;
}

interface OrderUpdate {
  orderId: number;
  status: string;
  riderId?: number;
  timestamp: Date;
}

interface DeliveryComplete {
  orderId: number;
  riderId: number;
  photoUrl?: string;
  timestamp: Date;
}

interface RiderStatus {
  riderId: number;
  timestamp: Date;
}

interface WebSocketState {
  isConnected: boolean;
  riderLocations: Map<number, RiderLocation>;
  onlineRiders: Set<number>;
  lastOrderUpdate: OrderUpdate | null;
  lastDeliveryComplete: DeliveryComplete | null;
}

export function useWebSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    riderLocations: new Map(),
    onlineRiders: new Set(),
    lastOrderUpdate: null,
    lastDeliveryComplete: null,
  });

  useEffect(() => {
    // Connect to WebSocket server
    const socket = io(window.location.origin, {
      path: "/ws",
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[WebSocket] Connected");
      setState(prev => ({ ...prev, isConnected: true }));
      
      // Register as admin
      socket.emit("admin:register");
    });

    socket.on("disconnect", () => {
      console.log("[WebSocket] Disconnected");
      setState(prev => ({ ...prev, isConnected: false }));
    });

    // Handle rider location updates
    socket.on("rider:location:update", (data: RiderLocation) => {
      setState(prev => {
        const newLocations = new Map(prev.riderLocations);
        newLocations.set(data.riderId, data);
        return { ...prev, riderLocations: newLocations };
      });
    });

    // Handle rider online status
    socket.on("rider:online", (data: RiderStatus) => {
      setState(prev => {
        const newOnlineRiders = new Set(prev.onlineRiders);
        newOnlineRiders.add(data.riderId);
        return { ...prev, onlineRiders: newOnlineRiders };
      });
    });

    // Handle rider offline status
    socket.on("rider:offline", (data: RiderStatus) => {
      setState(prev => {
        const newOnlineRiders = new Set(prev.onlineRiders);
        newOnlineRiders.delete(data.riderId);
        const newLocations = new Map(prev.riderLocations);
        newLocations.delete(data.riderId);
        return { ...prev, onlineRiders: newOnlineRiders, riderLocations: newLocations };
      });
    });

    // Handle order status updates
    socket.on("order:status:update", (data: OrderUpdate) => {
      setState(prev => ({ ...prev, lastOrderUpdate: data }));
    });

    // Handle new orders
    socket.on("order:new", (data: { order: any; timestamp: Date }) => {
      console.log("[WebSocket] New order received:", data.order);
    });

    // Handle delivery completion
    socket.on("delivery:completed", (data: DeliveryComplete) => {
      setState(prev => ({ ...prev, lastDeliveryComplete: data }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const getRiderLocation = useCallback((riderId: number): RiderLocation | undefined => {
    return state.riderLocations.get(riderId);
  }, [state.riderLocations]);

  const isRiderOnline = useCallback((riderId: number): boolean => {
    return state.onlineRiders.has(riderId);
  }, [state.onlineRiders]);

  const getAllRiderLocations = useCallback((): RiderLocation[] => {
    return Array.from(state.riderLocations.values());
  }, [state.riderLocations]);

  const getOnlineRiderCount = useCallback((): number => {
    return state.onlineRiders.size;
  }, [state.onlineRiders]);

  return {
    isConnected: state.isConnected,
    riderLocations: state.riderLocations,
    onlineRiders: state.onlineRiders,
    lastOrderUpdate: state.lastOrderUpdate,
    lastDeliveryComplete: state.lastDeliveryComplete,
    getRiderLocation,
    isRiderOnline,
    getAllRiderLocations,
    getOnlineRiderCount,
    socket: socketRef.current,
  };
}

export default useWebSocket;
