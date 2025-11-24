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


/**
 * Sellers table for marketplace vendor management
 */
export const sellers = mysqlTable("sellers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // Reference to users table
  businessName: varchar("businessName", { length: 255 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  businessAddress: text("businessAddress"),
  businessPhone: varchar("businessPhone", { length: 20 }),
  businessEmail: varchar("businessEmail", { length: 320 }),
  taxId: varchar("taxId", { length: 100 }),
  bankName: varchar("bankName", { length: 100 }),
  bankAccountNumber: varchar("bankAccountNumber", { length: 50 }),
  mobileMoneyProvider: mysqlEnum("mobileMoneyProvider", ["mtn_money", "orange_money"]),
  mobileMoneyNumber: varchar("mobileMoneyNumber", { length: 20 }),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "suspended"]).default("pending").notNull(),
  verificationDocuments: text("verificationDocuments"), // JSON array of document URLs
  commissionRate: int("commissionRate").default(15).notNull(), // Platform commission percentage
  totalSales: int("totalSales").default(0).notNull(), // In FCFA cents
  totalOrders: int("totalOrders").default(0).notNull(),
  rating: int("rating").default(0), // Stored as integer (e.g., 45 for 4.5)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Seller = typeof sellers.$inferSelect;
export type InsertSeller = typeof sellers.$inferInsert;

/**
 * Seller payouts table for financial management
 */
export const sellerPayouts = mysqlTable("sellerPayouts", {
  id: int("id").autoincrement().primaryKey(),
  sellerId: int("sellerId").notNull(),
  amount: int("amount").notNull(), // In FCFA cents
  platformFee: int("platformFee").notNull(), // In FCFA cents
  netAmount: int("netAmount").notNull(), // In FCFA cents
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "mtn_money", "orange_money"]).notNull(),
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed"]).default("pending").notNull(),
  transactionId: varchar("transactionId", { length: 100 }),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SellerPayout = typeof sellerPayouts.$inferSelect;
export type InsertSellerPayout = typeof sellerPayouts.$inferInsert;


/**
 * Payment transactions table for MTN/Orange Money tracking
 */
export const paymentTransactions = mysqlTable("paymentTransactions", {
  id: int("id").autoincrement().primaryKey(),
  orderId: int("orderId").notNull(),
  transactionId: varchar("transactionId", { length: 100 }).notNull().unique(),
  provider: mysqlEnum("provider", ["mtn_money", "orange_money", "cash"]).notNull(),
  amount: int("amount").notNull(), // In FCFA cents
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  reference: varchar("reference", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PaymentTransaction = typeof paymentTransactions.$inferSelect;
export type InsertPaymentTransaction = typeof paymentTransactions.$inferInsert;

/**
 * Commission settings table for platform configuration
 */
export const commissionSettings = mysqlTable("commissionSettings", {
  id: int("id").autoincrement().primaryKey(),
  entityType: mysqlEnum("entityType", ["seller", "rider"]).notNull(),
  commissionType: mysqlEnum("commissionType", ["percentage", "fixed"]).notNull(),
  value: int("value").notNull(), // Percentage or cents
  minAmount: int("minAmount").default(0), // In FCFA cents
  maxAmount: int("maxAmount"), // In FCFA cents
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CommissionSetting = typeof commissionSettings.$inferSelect;
export type InsertCommissionSetting = typeof commissionSettings.$inferInsert;

/**
 * Support tickets table for customer support
 */
export const supportTickets = mysqlTable("supportTickets", {
  id: int("id").autoincrement().primaryKey(),
  ticketNumber: varchar("ticketNumber", { length: 50 }).notNull().unique(),
  userId: int("userId").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  category: mysqlEnum("category", ["order", "payment", "delivery", "technical", "other"]).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["open", "in_progress", "resolved", "closed"]).default("open").notNull(),
  assignedTo: int("assignedTo"), // Admin user ID
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;

/**
 * Support ticket messages table
 */
export const supportTicketMessages = mysqlTable("supportTicketMessages", {
  id: int("id").autoincrement().primaryKey(),
  ticketId: int("ticketId").notNull(),
  userId: int("userId").notNull(),
  message: text("message").notNull(),
  isStaff: boolean("isStaff").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;
export type InsertSupportTicketMessage = typeof supportTicketMessages.$inferInsert;

/**
 * Delivery zones table for zone-based pricing
 */
export const deliveryZones = mysqlTable("deliveryZones", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  description: text("description"),
  baseFee: int("baseFee").notNull(), // In FCFA cents
  perKmFee: int("perKmFee").notNull(), // In FCFA cents
  minDeliveryTime: int("minDeliveryTime"), // In minutes
  maxDeliveryTime: int("maxDeliveryTime"), // In minutes
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type InsertDeliveryZone = typeof deliveryZones.$inferInsert;



// Payment Gateway Integration tables
export const paymentGatewayConfig = mysqlTable("payment_gateway_config", {
  id: int("id").autoincrement().primaryKey(),
  provider: mysqlEnum("provider", ["mtn_money", "orange_money"]).notNull(),
  apiKey: varchar("apiKey", { length: 255 }),
  apiSecret: varchar("apiSecret", { length: 255 }),
  webhookUrl: varchar("webhookUrl", { length: 512 }),
  isActive: boolean("isActive").default(false).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const paymentGatewaySyncLog = mysqlTable("payment_gateway_sync_log", {
  id: int("id").autoincrement().primaryKey(),
  provider: mysqlEnum("provider", ["mtn_money", "orange_money"]).notNull(),
  syncType: mysqlEnum("syncType", ["manual", "automatic", "webhook"]).notNull(),
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  transactionsSynced: int("transactionsSynced").default(0).notNull(),
  errorMessage: text("errorMessage"),
  syncedAt: timestamp("syncedAt").defaultNow().notNull(),
});

export type PaymentGatewayConfig = typeof paymentGatewayConfig.$inferSelect;
export type InsertPaymentGatewayConfig = typeof paymentGatewayConfig.$inferInsert;
export type PaymentGatewaySyncLog = typeof paymentGatewaySyncLog.$inferSelect;
export type InsertPaymentGatewaySyncLog = typeof paymentGatewaySyncLog.$inferInsert;




/**
 * Activity Log table for tracking admin actions
 */
export const activityLog = mysqlTable("activity_log", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("adminId").notNull(),
  adminName: varchar("adminName", { length: 255 }).notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  details: text("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = typeof activityLog.$inferInsert;

/**
 * Promotional Campaigns table for marketing campaigns
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  discountCode: varchar("discountCode", { length: 50 }).notNull().unique(),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(), // Percentage (0-100) or cents for fixed
  minOrderAmount: int("minOrderAmount").default(0), // In cents
  maxDiscountAmount: int("maxDiscountAmount"), // In cents, null for unlimited
  usageLimit: int("usageLimit"), // Null for unlimited
  usageCount: int("usageCount").default(0).notNull(),
  targetAudience: mysqlEnum("targetAudience", ["all", "new_users", "existing_users", "specific_users"]).default("all").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Campaign Usage table for tracking campaign redemptions
 */
export const campaignUsage = mysqlTable("campaign_usage", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  userId: int("userId").notNull(),
  orderId: int("orderId").notNull(),
  discountAmount: int("discountAmount").notNull(), // In cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CampaignUsage = typeof campaignUsage.$inferSelect;
export type InsertCampaignUsage = typeof campaignUsage.$inferInsert;

