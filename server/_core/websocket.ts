import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { verifyToken } from "./jwt";
import type { User } from "../../drizzle/schema";

/**
 * WebSocket Server for Real-time Notifications
 * 
 * Provides instant alerts for:
 * - Critical incidents
 * - Negative customer feedback
 * - Failed scheduled reports
 * - Training completions
 * - System alerts
 */

export interface AuthenticatedWebSocket extends WebSocket {
  userId?: number;
  user?: User;
  isAlive?: boolean;
}

export interface NotificationMessage {
  type: "incident" | "feedback" | "report" | "training" | "system";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
}

let wss: WebSocketServer | null = null;
const clients = new Map<number, Set<AuthenticatedWebSocket>>();

/**
 * Initialize WebSocket server
 */
export function initializeWebSocketServer(server: any) {
  wss = new WebSocketServer({ server, path: "/ws" });

  wss.on("connection", async (ws: AuthenticatedWebSocket, req: IncomingMessage) => {
    console.log("[WebSocket] New connection attempt");

    // Extract token from query string or headers
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const token = url.searchParams.get("token") || req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("[WebSocket] No token provided, closing connection");
      ws.close(1008, "Authentication required");
      return;
    }

    // Verify token and authenticate user
    try {
      const decoded = verifyToken(token);
      if (!decoded || !decoded.userId) {
        console.log("[WebSocket] Invalid token, closing connection");
        ws.close(1008, "Invalid token");
        return;
      }

      ws.userId = decoded.userId;
      ws.isAlive = true;

      // Add client to the clients map
      if (!clients.has(decoded.userId)) {
        clients.set(decoded.userId, new Set());
      }
      clients.get(decoded.userId)!.add(ws);

      console.log(`[WebSocket] User ${decoded.userId} connected (${clients.get(decoded.userId)!.size} connections)`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: "system",
        severity: "low",
        title: "Connected",
        message: "Real-time notifications enabled",
        timestamp: new Date(),
      }));

      // Handle incoming messages
      ws.on("message", (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          handleClientMessage(ws, message);
        } catch (error) {
          console.error("[WebSocket] Error parsing message:", error);
        }
      });

      // Handle pong responses
      ws.on("pong", () => {
        ws.isAlive = true;
      });

      // Handle disconnection
      ws.on("close", () => {
        if (ws.userId) {
          const userClients = clients.get(ws.userId);
          if (userClients) {
            userClients.delete(ws);
            if (userClients.size === 0) {
              clients.delete(ws.userId);
            }
          }
          console.log(`[WebSocket] User ${ws.userId} disconnected`);
        }
      });

      // Handle errors
      ws.on("error", (error) => {
        console.error("[WebSocket] Connection error:", error);
      });

    } catch (error) {
      console.error("[WebSocket] Authentication error:", error);
      ws.close(1008, "Authentication failed");
    }
  });

  // Heartbeat to detect broken connections
  const heartbeat = setInterval(() => {
    wss?.clients.forEach((ws: WebSocket) => {
      const client = ws as AuthenticatedWebSocket;
      if (client.isAlive === false) {
        console.log(`[WebSocket] Terminating inactive connection for user ${client.userId}`);
        return client.terminate();
      }

      client.isAlive = false;
      client.ping();
    });
  }, 30000); // Every 30 seconds

  wss.on("close", () => {
    clearInterval(heartbeat);
  });

  console.log("[WebSocket] Server initialized on /ws");
  return wss;
}

/**
 * Handle messages from clients
 */
function handleClientMessage(ws: AuthenticatedWebSocket, message: any) {
  console.log(`[WebSocket] Message from user ${ws.userId}:`, message);

  // Handle ping/pong
  if (message.type === "ping") {
    ws.send(JSON.stringify({ type: "pong", timestamp: new Date() }));
    return;
  }

  // Handle subscription to specific channels
  if (message.type === "subscribe") {
    // Future: Implement channel-based subscriptions
    ws.send(JSON.stringify({
      type: "system",
      severity: "low",
      title: "Subscribed",
      message: `Subscribed to ${message.channel}`,
      timestamp: new Date(),
    }));
    return;
  }
}

/**
 * Broadcast notification to a specific user
 */
export function notifyUser(userId: number, notification: NotificationMessage) {
  const userClients = clients.get(userId);
  if (!userClients || userClients.size === 0) {
    console.log(`[WebSocket] No active connections for user ${userId}`);
    return false;
  }

  const message = JSON.stringify(notification);
  let sent = 0;

  userClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      sent++;
    }
  });

  console.log(`[WebSocket] Sent notification to user ${userId} (${sent}/${userClients.size} connections)`);
  return sent > 0;
}

/**
 * Broadcast notification to all connected users
 */
export function broadcastToAll(notification: NotificationMessage) {
  if (!wss) {
    console.log("[WebSocket] Server not initialized");
    return 0;
  }

  const message = JSON.stringify(notification);
  let sent = 0;

  wss.clients.forEach((ws: WebSocket) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
      sent++;
    }
  });

  console.log(`[WebSocket] Broadcast notification to ${sent} clients`);
  return sent;
}

/**
 * Broadcast notification to multiple users
 */
export function notifyUsers(userIds: number[], notification: NotificationMessage) {
  let totalSent = 0;

  userIds.forEach((userId) => {
    if (notifyUser(userId, notification)) {
      totalSent++;
    }
  });

  return totalSent;
}

/**
 * Get connection statistics
 */
export function getConnectionStats() {
  return {
    totalConnections: wss?.clients.size || 0,
    uniqueUsers: clients.size,
    userConnections: Array.from(clients.entries()).map(([userId, connections]) => ({
      userId,
      connections: connections.size,
    })),
  };
}

/**
 * Close all connections and shut down server
 */
export function shutdownWebSocketServer() {
  if (wss) {
    wss.clients.forEach((ws) => {
      ws.close(1001, "Server shutting down");
    });
    wss.close();
    clients.clear();
    wss = null;
    console.log("[WebSocket] Server shut down");
  }
}
