import { useEffect, useState, useCallback, useRef } from "react";
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

const SOUND_ENABLED_KEY = "okada_notification_sound_enabled";
const SOUND_VOLUME_KEY = "okada_notification_sound_volume";

interface UseOrderNotificationsReturn {
  isConnected: boolean;
  notifications: OrderNotification[];
  newOrders: NewOrderAlert[];
  riderLocations: Map<number, RiderLocation>;
  clearNotifications: () => void;
  clearNewOrders: () => void;
  // Sound controls
  soundEnabled: boolean;
  toggleSound: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

export function useOrderNotifications(): UseOrderNotificationsReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [newOrders, setNewOrders] = useState<NewOrderAlert[]>([]);
  const [riderLocations, setRiderLocations] = useState<Map<number, RiderLocation>>(new Map());
  
  // Sound state
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(SOUND_ENABLED_KEY);
    return stored === null ? true : stored === "true";
  });
  
  const [volume, setVolumeState] = useState<number>(() => {
    if (typeof window === "undefined") return 0.7;
    const stored = localStorage.getItem(SOUND_VOLUME_KEY);
    return stored ? parseFloat(stored) : 0.7;
  });

  // Audio ref
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInitialized = useRef(false);

  // Initialize audio on first user interaction
  const initializeAudio = useCallback(() => {
    if (audioInitialized.current) return;
    
    try {
      audioRef.current = new Audio("/sounds/new-order.wav");
      audioRef.current.preload = "auto";
      audioRef.current.volume = volume;
      audioInitialized.current = true;
      console.log("[NotificationSound] Audio initialized");
    } catch (error) {
      console.warn("[NotificationSound] Could not initialize audio:", error);
    }
  }, [volume]);

  // Play notification sound
  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    
    // Initialize audio if not done yet
    if (!audioInitialized.current) {
      initializeAudio();
    }

    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = volume;
      audioRef.current.play().catch((error) => {
        console.warn("[NotificationSound] Playback failed:", error.message);
      });
    }
  }, [soundEnabled, volume, initializeAudio]);

  // Initialize audio on mount and user interaction
  useEffect(() => {
    const handleInteraction = () => {
      initializeAudio();
      // Remove listeners after first interaction
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };

    document.addEventListener("click", handleInteraction);
    document.addEventListener("keydown", handleInteraction);

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [initializeAudio]);

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
      
      // Play notification sound
      playSound();
      
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
  }, [playSound]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearNewOrders = useCallback(() => {
    setNewOrders([]);
  }, []);

  const toggleSound = useCallback(() => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem(SOUND_ENABLED_KEY, String(newValue));
    
    // Play a test sound when enabling
    if (newValue) {
      setTimeout(() => playSound(), 100);
    }
  }, [soundEnabled, playSound]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    localStorage.setItem(SOUND_VOLUME_KEY, String(clampedVolume));
    
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  return {
    isConnected,
    notifications,
    newOrders,
    riderLocations,
    clearNotifications,
    clearNewOrders,
    soundEnabled,
    toggleSound,
    volume,
    setVolume,
  };
}

export default useOrderNotifications;
