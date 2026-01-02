import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import * as db from "./db";

let io: Server | null = null;

// Store active rider connections
const riderConnections = new Map<number, string>(); // riderId -> socketId
const adminConnections = new Set<string>(); // socketIds of admin users

export function initializeWebSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    path: "/ws",
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`);

    // Handle rider authentication and registration
    socket.on("rider:register", async (data: { riderId: number }) => {
      const { riderId } = data;
      riderConnections.set(riderId, socket.id);
      socket.join(`rider:${riderId}`);
      console.log(`[WebSocket] Rider ${riderId} registered`);
      
      // Notify admins that a rider came online
      io?.to("admins").emit("rider:online", { riderId, timestamp: new Date() });
    });

    // Handle admin registration
    socket.on("admin:register", () => {
      adminConnections.add(socket.id);
      socket.join("admins");
      console.log(`[WebSocket] Admin registered: ${socket.id}`);
    });

    // Handle rider location updates
    socket.on("rider:location", async (data: {
      riderId: number;
      latitude: number;
      longitude: number;
      heading?: number;
      speed?: number;
    }) => {
      const { riderId, latitude, longitude, heading, speed } = data;
      
      // Store location in database
      try {
        await db.updateRiderLocation(riderId, {
          latitude: latitude.toString(),
          longitude: longitude.toString(),
          heading: heading || 0,
          speed: speed || 0,
        });
      } catch (error) {
        console.error(`[WebSocket] Failed to update rider location:`, error);
      }

      // Broadcast to admins
      io?.to("admins").emit("rider:location:update", {
        riderId,
        latitude,
        longitude,
        heading,
        speed,
        timestamp: new Date(),
      });
    });

    // Handle order status updates
    socket.on("order:status", async (data: {
      orderId: number;
      status: string;
      riderId?: number;
    }) => {
      const { orderId, status, riderId } = data;
      
      // Broadcast to admins
      io?.to("admins").emit("order:status:update", {
        orderId,
        status,
        riderId,
        timestamp: new Date(),
      });

      // Notify specific rider if assigned
      if (riderId) {
        io?.to(`rider:${riderId}`).emit("order:assigned", { orderId, status });
      }
    });

    // Handle delivery completion
    socket.on("delivery:complete", async (data: {
      orderId: number;
      riderId: number;
      photoUrl?: string;
    }) => {
      const { orderId, riderId, photoUrl } = data;
      
      // Broadcast to admins
      io?.to("admins").emit("delivery:completed", {
        orderId,
        riderId,
        photoUrl,
        timestamp: new Date(),
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`);
      
      // Remove from rider connections
      riderConnections.forEach((socketId, riderId) => {
        if (socketId === socket.id) {
          riderConnections.delete(riderId);
          io?.to("admins").emit("rider:offline", { riderId, timestamp: new Date() });
        }
      });
      
      // Remove from admin connections
      adminConnections.delete(socket.id);
    });

    // Handle ping for connection health
    socket.on("ping", () => {
      socket.emit("pong", { timestamp: new Date() });
    });
  });

  console.log("[WebSocket] Server initialized");
  return io;
}

// Helper functions for emitting events from other parts of the application
export function emitToAdmins(event: string, data: any) {
  io?.to("admins").emit(event, data);
}

export function emitToRider(riderId: number, event: string, data: any) {
  io?.to(`rider:${riderId}`).emit(event, data);
}

export function emitOrderUpdate(orderId: number, status: string, data?: any) {
  io?.to("admins").emit("order:status:update", {
    orderId,
    status,
    ...data,
    timestamp: new Date(),
  });
}

export function emitNewOrder(order: any) {
  io?.to("admins").emit("order:new", {
    order,
    timestamp: new Date(),
  });
}

export function emitRiderLocationUpdate(riderId: number, location: {
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}) {
  io?.to("admins").emit("rider:location:update", {
    riderId,
    ...location,
    timestamp: new Date(),
  });
}

export function getActiveRiders(): number[] {
  return Array.from(riderConnections.keys());
}

export function isRiderOnline(riderId: number): boolean {
  return riderConnections.has(riderId);
}

export function getConnectedAdminCount(): number {
  return adminConnections.size;
}

export function getIO() {
  return io;
}
