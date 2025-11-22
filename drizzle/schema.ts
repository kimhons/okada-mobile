import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with Okada-specific fields for customer management.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Riders table for delivery personnel
 */
export const riders = mysqlTable("riders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull().unique(),
  email: varchar("email", { length: 320 }),
  vehicleType: varchar("vehicleType", { length: 50 }),
  vehicleNumber: varchar("vehicleNumber", { length: 50 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  rating: int("rating").default(0), // Stored as integer (e.g., 48 for 4.8)
  totalDeliveries: int("totalDeliveries").default(0).notNull(),
  acceptanceRate: int("acceptanceRate").default(0), // Stored as percentage (e.g., 95 for 95%)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rider = typeof riders.$inferSelect;
export type InsertRider = typeof riders.$inferInsert;

/**
 * Categories table for product organization
 */
export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  parentId: int("parentId"), // For nested categories
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Products table for inventory management
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: int("price").notNull(), // Stored in FCFA cents (e.g., 250000 for 2500 FCFA)
  categoryId: int("categoryId").notNull(),
  imageUrl: varchar("imageUrl", { length: 500 }),
  stock: int("stock").default(0).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  sellerId: int("sellerId"), // Reference to users table
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Orders table for order management
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerId: int("customerId").notNull(), // Reference to users table
  riderId: int("riderId"), // Reference to riders table
  status: mysqlEnum("status", [
    "pending",
    "confirmed",
    "rider_assigned",
    "in_transit",
    "quality_verification",
    "waiting_approval",
    "delivered",
    "cancelled",
    "rejected"
  ]).default("pending").notNull(),
  subtotal: int("subtotal").notNull(), // In FCFA cents
  deliveryFee: int("deliveryFee").notNull(), // In FCFA cents
  total: int("total").notNull(), // In FCFA cents
  paymentMethod: mysqlEnum("paymentMethod", ["mtn_money", "orange_money", "cash"]).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "paid", "refunded"]).default("pending").notNull(),
  deliveryAddress: text("deliveryAddress").notNull(),
  deliveryLat: varchar("deliveryLat", { length: 50 }),
  deliveryLng: varchar("deliveryLng", { length: 50 }),
  pickupAddress: text("pickupAddress"),
  pickupLat: varchar("pickupLat", { length: 50 }),
  pickupLng: varchar("pickupLng", { length: 50 }),
  estimatedDeliveryTime: timestamp("estimatedDeliveryTime"),
  actualDeliveryTime: timestamp("actualDeliveryTime"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table for individual products in an order
 */
export const orderItems = mysqlTable("orderItems", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  productId: int("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(),
  quantity: int("quantity").notNull(),
  price: int("price").notNull(), // In FCFA cents
  total: int("total").notNull(), // In FCFA cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Quality verification photos table
 */
export const qualityPhotos = mysqlTable("qualityPhotos", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  photoUrl: varchar("photoUrl", { length: 500 }).notNull(),
  uploadedBy: int("uploadedBy").notNull(), // Rider ID
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  rejectionReason: text("rejectionReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QualityPhoto = typeof qualityPhotos.$inferSelect;
export type InsertQualityPhoto = typeof qualityPhotos.$inferInsert;

/**
 * Rider earnings table
 */
export const riderEarnings = mysqlTable("riderEarnings", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  orderId: int("orderId").notNull(),
  amount: int("amount").notNull(), // In FCFA cents
  bonus: int("bonus").default(0).notNull(), // In FCFA cents
  tip: int("tip").default(0).notNull(), // In FCFA cents
  total: int("total").notNull(), // In FCFA cents
  status: mysqlEnum("status", ["pending", "paid", "withdrawn"]).default("pending").notNull(),
  paidAt: timestamp("paidAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiderEarning = typeof riderEarnings.$inferSelect;
export type InsertRiderEarning = typeof riderEarnings.$inferInsert;

/**
 * Notifications table for system notifications
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["order", "delivery", "payment", "system"]).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

