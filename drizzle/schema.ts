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




/**
 * API Keys table for third-party integrations
 */
export const apiKeys = mysqlTable("apiKeys", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  key: varchar("key", { length: 255 }).notNull().unique(),
  secret: text("secret"),
  permissions: text("permissions"), // JSON array of permissions
  isActive: boolean("isActive").default(true).notNull(),
  lastUsedAt: timestamp("lastUsedAt"),
  expiresAt: timestamp("expiresAt"),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

/**
 * Backup Logs table for database backup history
 */
export const backupLogs = mysqlTable("backupLogs", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  size: int("size"), // File size in bytes
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  type: mysqlEnum("type", ["manual", "automatic"]).default("manual").notNull(),
  errorMessage: text("errorMessage"),
  createdBy: int("createdBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type BackupLog = typeof backupLogs.$inferSelect;
export type InsertBackupLog = typeof backupLogs.$inferInsert;


/**
 * FAQ table for frequently asked questions
 */
export const faqs = mysqlTable("faqs", {
  id: int("id").autoincrement().primaryKey(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: varchar("category", { length: 100 }),
  order: int("order").default(0).notNull(), // Display order
  isPublished: boolean("isPublished").default(true).notNull(),
  views: int("views").default(0).notNull(),
  helpful: int("helpful").default(0).notNull(), // Helpful votes
  notHelpful: int("notHelpful").default(0).notNull(), // Not helpful votes
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Faq = typeof faqs.$inferSelect;
export type InsertFaq = typeof faqs.$inferInsert;

/**
 * Help Documentation table for knowledge base articles
 */
export const helpDocs = mysqlTable("helpDocs", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }),
  tags: text("tags"), // Comma-separated tags
  isPublished: boolean("isPublished").default(true).notNull(),
  views: int("views").default(0).notNull(),
  helpful: int("helpful").default(0).notNull(),
  notHelpful: int("notHelpful").default(0).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HelpDoc = typeof helpDocs.$inferSelect;
export type InsertHelpDoc = typeof helpDocs.$inferInsert;


/**
 * Reports table for custom report definitions
 */
export const reports = mysqlTable("reports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  reportType: varchar("reportType", { length: 100 }).notNull(), // orders, users, revenue, riders, etc.
  filters: text("filters"), // JSON string of filter configuration
  columns: text("columns"), // JSON array of selected columns
  groupBy: varchar("groupBy", { length: 100 }), // Grouping field
  sortBy: varchar("sortBy", { length: 100 }), // Sorting field
  sortOrder: mysqlEnum("sortOrder", ["asc", "desc"]).default("desc"),
  chartType: varchar("chartType", { length: 50 }), // bar, line, pie, table
  isPublic: boolean("isPublic").default(false).notNull(), // Share with other admins
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Report = typeof reports.$inferSelect;
export type InsertReport = typeof reports.$inferInsert;

/**
 * Export History table for tracking data exports
 */
export const exportHistory = mysqlTable("exportHistory", {
  id: int("id").autoincrement().primaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  exportType: varchar("exportType", { length: 100 }).notNull(), // orders, users, products, etc.
  format: mysqlEnum("format", ["csv", "excel", "pdf"]).notNull(),
  filters: text("filters"), // JSON string of applied filters
  recordCount: int("recordCount").default(0).notNull(),
  fileSize: int("fileSize"), // File size in bytes
  status: mysqlEnum("status", ["pending", "completed", "failed"]).default("pending").notNull(),
  downloadUrl: text("downloadUrl"),
  errorMessage: text("errorMessage"),
  expiresAt: timestamp("expiresAt"), // Download link expiration
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type ExportHistory = typeof exportHistory.$inferSelect;
export type InsertExportHistory = typeof exportHistory.$inferInsert;


/**
 * Email Templates table for managing email communications
 */
export const emailTemplates = mysqlTable("emailTemplates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body").notNull(), // HTML email body
  category: varchar("category", { length: 100 }), // order, user, rider, system
  variables: text("variables"), // JSON array of available template variables
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EmailTemplate = typeof emailTemplates.$inferSelect;
export type InsertEmailTemplate = typeof emailTemplates.$inferInsert;

/**
 * Notification Preferences table for user notification settings
 */
export const notificationPreferences = mysqlTable("notificationPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  emailNotifications: boolean("emailNotifications").default(true).notNull(),
  pushNotifications: boolean("pushNotifications").default(true).notNull(),
  smsNotifications: boolean("smsNotifications").default(false).notNull(),
  orderUpdates: boolean("orderUpdates").default(true).notNull(),
  promotions: boolean("promotions").default(true).notNull(),
  newsletter: boolean("newsletter").default(false).notNull(),
  riderUpdates: boolean("riderUpdates").default(true).notNull(),
  paymentAlerts: boolean("paymentAlerts").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

/**
 * Push Notifications Log table for tracking sent notifications
 */
export const pushNotificationsLog = mysqlTable("pushNotificationsLog", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", ["info", "success", "warning", "error"]).default("info").notNull(),
  targetAudience: mysqlEnum("targetAudience", ["all", "users", "riders", "sellers", "specific"]).notNull(),
  targetUserIds: text("targetUserIds"), // Comma-separated user IDs for specific targeting
  sentCount: int("sentCount").default(0).notNull(),
  deliveredCount: int("deliveredCount").default(0).notNull(),
  clickedCount: int("clickedCount").default(0).notNull(),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).default("pending").notNull(),
  scheduledFor: timestamp("scheduledFor"),
  sentBy: int("sentBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
});

export type PushNotificationLog = typeof pushNotificationsLog.$inferSelect;
export type InsertPushNotificationLog = typeof pushNotificationsLog.$inferInsert;


/**
 * Coupons table for discount codes and promotions
 */
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  description: text("description"),
  discountType: mysqlEnum("discountType", ["percentage", "fixed"]).notNull(),
  discountValue: int("discountValue").notNull(), // Percentage (1-100) or fixed amount in cents
  minOrderAmount: int("minOrderAmount").default(0).notNull(), // Minimum order amount in cents
  maxDiscountAmount: int("maxDiscountAmount"), // Maximum discount cap in cents (for percentage)
  usageLimit: int("usageLimit"), // Total usage limit (null = unlimited)
  usageCount: int("usageCount").default(0).notNull(), // Current usage count
  perUserLimit: int("perUserLimit").default(1).notNull(), // Usage limit per user
  validFrom: timestamp("validFrom").notNull(),
  validUntil: timestamp("validUntil").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;

/**
 * Coupon Usage table for tracking coupon redemptions
 */
export const couponUsage = mysqlTable("couponUsage", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull(),
  userId: int("userId").notNull(),
  orderId: int("orderId"),
  discountAmount: int("discountAmount").notNull(), // Actual discount applied in cents
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type CouponUsage = typeof couponUsage.$inferSelect;
export type InsertCouponUsage = typeof couponUsage.$inferInsert;

/**
 * Promotional Campaigns table for marketing campaigns
 */
export const promotionalCampaigns = mysqlTable("promotionalCampaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  type: mysqlEnum("type", ["discount", "free_delivery", "cashback", "bundle"]).notNull(),
  targetAudience: mysqlEnum("targetAudience", ["all", "new_users", "active_users", "inactive_users", "specific"]).notNull(),
  targetUserIds: text("targetUserIds"), // Comma-separated user IDs for specific targeting
  budget: int("budget"), // Campaign budget in cents
  spent: int("spent").default(0).notNull(), // Amount spent so far in cents
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  status: mysqlEnum("status", ["draft", "scheduled", "active", "paused", "completed", "cancelled"]).default("draft").notNull(),
  impressions: int("impressions").default(0).notNull(), // Number of times shown
  clicks: int("clicks").default(0).notNull(), // Number of clicks
  conversions: int("conversions").default(0).notNull(), // Number of successful conversions
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PromotionalCampaign = typeof promotionalCampaigns.$inferSelect;
export type InsertPromotionalCampaign = typeof promotionalCampaigns.$inferInsert;

/**
 * Loyalty Program table for user points and rewards
 */
export const loyaltyProgram = mysqlTable("loyaltyProgram", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  points: int("points").default(0).notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  lifetimePoints: int("lifetimePoints").default(0).notNull(), // Total points earned all time
  lifetimeSpent: int("lifetimeSpent").default(0).notNull(), // Total amount spent in cents
  lastActivityAt: timestamp("lastActivityAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyProgram = typeof loyaltyProgram.$inferSelect;
export type InsertLoyaltyProgram = typeof loyaltyProgram.$inferInsert;

/**
 * Loyalty Transactions table for tracking points earned/redeemed
 */
export const loyaltyTransactions = mysqlTable("loyaltyTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["earned", "redeemed", "expired", "adjusted"]).notNull(),
  points: int("points").notNull(), // Positive for earned, negative for redeemed/expired
  description: text("description").notNull(),
  orderId: int("orderId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type InsertLoyaltyTransaction = typeof loyaltyTransactions.$inferInsert;


/**
 * Payouts table for managing payments to riders and sellers
 */
export const payouts = mysqlTable("payouts", {
  id: int("id").autoincrement().primaryKey(),
  recipientId: int("recipientId").notNull(), // User ID of rider or seller
  recipientType: mysqlEnum("recipientType", ["rider", "seller"]).notNull(),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("XAF").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "processing", "completed", "failed"]).default("pending").notNull(),
  paymentMethod: varchar("paymentMethod", { length: 50 }).notNull(), // e.g., "mobile_money", "bank_transfer"
  accountDetails: text("accountDetails"), // JSON string with payment details
  notes: text("notes"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Payout = typeof payouts.$inferSelect;
export type InsertPayout = typeof payouts.$inferInsert;

/**
 * Transactions table for comprehensive financial tracking
 */
export const transactions = mysqlTable("transactions", {
  id: int("id").autoincrement().primaryKey(),
  transactionId: varchar("transactionId", { length: 100 }).notNull().unique(), // Unique transaction reference
  type: mysqlEnum("type", ["order_payment", "payout", "refund", "commission", "fee", "adjustment"]).notNull(),
  amount: int("amount").notNull(), // Amount in cents
  currency: varchar("currency", { length: 3 }).default("XAF").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "cancelled"]).notNull(),
  userId: int("userId"), // User involved in transaction
  orderId: int("orderId"), // Related order if applicable
  payoutId: int("payoutId"), // Related payout if applicable
  description: text("description").notNull(),
  metadata: text("metadata"), // JSON string with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Revenue Analytics table for tracking daily/monthly revenue metrics
 */
export const revenueAnalytics = mysqlTable("revenueAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  date: timestamp("date").notNull(),
  period: mysqlEnum("period", ["daily", "weekly", "monthly"]).notNull(),
  totalRevenue: int("totalRevenue").default(0).notNull(), // Total revenue in cents
  orderCount: int("orderCount").default(0).notNull(),
  averageOrderValue: int("averageOrderValue").default(0).notNull(), // In cents
  commissionEarned: int("commissionEarned").default(0).notNull(), // Platform commission in cents
  payoutsProcessed: int("payoutsProcessed").default(0).notNull(), // Total payouts in cents
  netRevenue: int("netRevenue").default(0).notNull(), // Revenue minus payouts in cents
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RevenueAnalytics = typeof revenueAnalytics.$inferSelect;
export type InsertRevenueAnalytics = typeof revenueAnalytics.$inferInsert;



/**
 * Rider Locations table for real-time tracking
 */
export const riderLocations = mysqlTable("riderLocations", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  orderId: int("orderId"), // Current order being delivered
  latitude: varchar("latitude", { length: 20 }).notNull(),
  longitude: varchar("longitude", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["idle", "en_route_pickup", "en_route_delivery", "offline"]).default("idle").notNull(),
  speed: int("speed").default(0), // Speed in km/h
  heading: int("heading").default(0), // Direction in degrees (0-360)
  accuracy: int("accuracy").default(0), // GPS accuracy in meters
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderLocation = typeof riderLocations.$inferSelect;
export type InsertRiderLocation = typeof riderLocations.$inferInsert;

/**
 * Inventory Alerts table for low stock notifications
 */
export const inventoryAlerts = mysqlTable("inventoryAlerts", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull(),
  alertType: mysqlEnum("alertType", ["low_stock", "out_of_stock", "overstocked"]).notNull(),
  threshold: int("threshold").notNull(), // Stock level that triggers alert
  currentStock: int("currentStock").notNull(),
  severity: mysqlEnum("severity", ["critical", "warning", "info"]).notNull(),
  status: mysqlEnum("status", ["active", "resolved", "dismissed"]).default("active").notNull(),
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"), // User ID who resolved the alert
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryAlert = typeof inventoryAlerts.$inferSelect;
export type InsertInventoryAlert = typeof inventoryAlerts.$inferInsert;

/**
 * Inventory Thresholds table for alert configuration
 */
export const inventoryThresholds = mysqlTable("inventoryThresholds", {
  id: int("id").autoincrement().primaryKey(),
  productId: int("productId").notNull().unique(),
  lowStockThreshold: int("lowStockThreshold").notNull(),
  criticalStockThreshold: int("criticalStockThreshold").notNull(),
  overstockThreshold: int("overstockThreshold"),
  autoReorder: int("autoReorder").default(0).notNull(), // Boolean: 0 or 1
  reorderQuantity: int("reorderQuantity"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InventoryThreshold = typeof inventoryThresholds.$inferSelect;
export type InsertInventoryThreshold = typeof inventoryThresholds.$inferInsert;


/**
 * Rider Tier History table for tracking tier promotions
 */
export const riderTierHistory = mysqlTable("riderTierHistory", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  previousTier: mysqlEnum("previousTier", ["platinum", "gold", "silver", "bronze", "rookie"]),
  newTier: mysqlEnum("newTier", ["platinum", "gold", "silver", "bronze", "rookie"]).notNull(),
  performanceScore: int("performanceScore").notNull(), // Score at time of promotion
  promotionDate: timestamp("promotionDate").defaultNow().notNull(),
  notificationSent: int("notificationSent").default(0).notNull(), // Boolean: 0 or 1
  notificationSentAt: timestamp("notificationSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RiderTierHistory = typeof riderTierHistory.$inferSelect;
export type InsertRiderTierHistory = typeof riderTierHistory.$inferInsert;


/**
 * Verification Requests table for user/seller/rider verification
 */
export const verificationRequests = mysqlTable("verificationRequests", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Reference to users or riders table
  userType: mysqlEnum("userType", ["customer", "seller", "rider"]).notNull(),
  documentType: mysqlEnum("documentType", ["national_id", "drivers_license", "business_license", "tax_certificate", "bank_statement"]).notNull(),
  documentUrl: varchar("documentUrl", { length: 500 }).notNull(),
  additionalDocuments: text("additionalDocuments"), // JSON array of additional document URLs
  status: mysqlEnum("status", ["pending", "approved", "rejected", "more_info_needed"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"), // Admin user ID
  reviewedAt: timestamp("reviewedAt"),
  rejectionReason: text("rejectionReason"),
  notes: text("notes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VerificationRequest = typeof verificationRequests.$inferSelect;
export type InsertVerificationRequest = typeof verificationRequests.$inferInsert;

/**
 * Platform Statistics table for system health monitoring
 */
export const platformStatistics = mysqlTable("platformStatistics", {
  id: int("id").autoincrement().primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  activeUsers: int("activeUsers").default(0).notNull(), // Users online in last 5 minutes
  concurrentOrders: int("concurrentOrders").default(0).notNull(), // Orders in progress
  availableRiders: int("availableRiders").default(0).notNull(), // Riders available for assignment
  busyRiders: int("busyRiders").default(0).notNull(), // Riders currently on delivery
  offlineRiders: int("offlineRiders").default(0).notNull(), // Riders offline
  avgResponseTime: int("avgResponseTime").default(0).notNull(), // API response time in ms
  errorRate: int("errorRate").default(0).notNull(), // Error rate as percentage (e.g., 5 for 0.05%)
  systemUptime: int("systemUptime").default(0).notNull(), // Uptime percentage (e.g., 9999 for 99.99%)
  apiCallVolume: int("apiCallVolume").default(0).notNull(), // API calls in last minute
  databaseConnections: int("databaseConnections").default(0).notNull(), // Active DB connections
  memoryUsage: int("memoryUsage").default(0).notNull(), // Memory usage percentage
  cpuUsage: int("cpuUsage").default(0).notNull(), // CPU usage percentage
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PlatformStatistic = typeof platformStatistics.$inferSelect;
export type InsertPlatformStatistic = typeof platformStatistics.$inferInsert;

/**
 * Disputes table for conflict resolution
 */
export const disputes = mysqlTable("disputes", {
  id: int("id").autoincrement().primaryKey(),
  disputeNumber: varchar("disputeNumber", { length: 50 }).notNull().unique(),
  orderId: int("orderId").notNull(),
  customerId: int("customerId").notNull(),
  riderId: int("riderId"),
  sellerId: int("sellerId"),
  disputeType: mysqlEnum("disputeType", [
    "delivery_issue",
    "product_quality",
    "missing_items",
    "wrong_order",
    "payment_issue",
    "rider_behavior",
    "seller_issue",
    "other"
  ]).notNull(),
  status: mysqlEnum("status", ["open", "investigating", "resolved", "escalated", "closed"]).default("open").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  subject: varchar("subject", { length: 255 }).notNull(),
  description: text("description").notNull(),
  resolutionType: mysqlEnum("resolutionType", ["refund", "replacement", "compensation", "dismissed", "other"]),
  resolutionAmount: int("resolutionAmount"), // Amount in cents if refund/compensation
  resolutionNotes: text("resolutionNotes"),
  assignedTo: int("assignedTo"), // Admin user ID
  resolvedBy: int("resolvedBy"), // Admin user ID
  resolvedAt: timestamp("resolvedAt"),
  escalatedAt: timestamp("escalatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = typeof disputes.$inferInsert;

/**
 * Dispute Messages table for communication history
 */
export const disputeMessages = mysqlTable("disputeMessages", {
  id: int("id").autoincrement().primaryKey(),
  disputeId: int("disputeId").notNull(),
  senderId: int("senderId").notNull(),
  senderType: mysqlEnum("senderType", ["customer", "admin", "rider", "seller"]).notNull(),
  message: text("message").notNull(),
  attachments: text("attachments"), // JSON array of attachment URLs
  isInternal: int("isInternal").default(0).notNull(), // Boolean: internal admin notes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type DisputeMessage = typeof disputeMessages.$inferSelect;
export type InsertDisputeMessage = typeof disputeMessages.$inferInsert;


// Removed duplicates - these tables are already defined earlier in the schema


/**
 * Rider Performance Achievements table for leaderboard gamification
 */
export const riderAchievements = mysqlTable("riderAchievements", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  achievementType: mysqlEnum("achievementType", [
    "top_performer",
    "fast_delivery",
    "customer_favorite",
    "quality_champion",
    "consistency_king",
    "milestone_100",
    "milestone_500",
    "milestone_1000"
  ]).notNull(),
  earnedAt: timestamp("earnedAt").defaultNow().notNull(),
  metadata: text("metadata"), // JSON for additional achievement data
});

export type RiderAchievement = typeof riderAchievements.$inferSelect;
export type InsertRiderAchievement = typeof riderAchievements.$inferInsert;

/**
 * System Settings table for platform configuration
 */
export const systemSettings = mysqlTable("systemSettings", {
  id: int("id").autoincrement().primaryKey(),
  settingKey: varchar("settingKey", { length: 100 }).notNull().unique(),
  settingValue: text("settingValue").notNull(),
  settingType: mysqlEnum("settingType", ["string", "number", "boolean", "json"]).notNull(),
  category: mysqlEnum("category", [
    "general",
    "payment",
    "delivery",
    "notification",
    "security",
    "api",
    "feature_flags"
  ]).notNull(),
  description: text("description"),
  isPublic: int("isPublic").default(0).notNull(), // Boolean: visible to non-admin users
  updatedBy: int("updatedBy"), // Admin user ID
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = typeof systemSettings.$inferInsert;

/**
 * Content Moderation Queue table
 */
export const contentModerationQueue = mysqlTable("contentModerationQueue", {
  id: int("id").autoincrement().primaryKey(),
  contentType: mysqlEnum("contentType", [
    "user_profile",
    "product_listing",
    "review",
    "seller_profile",
    "rider_profile",
    "support_message",
    "other"
  ]).notNull(),
  contentId: int("contentId").notNull(), // ID of the content being moderated
  userId: int("userId").notNull(), // User who created the content
  contentUrl: varchar("contentUrl", { length: 500 }),
  contentText: text("contentText"),
  contentMetadata: text("contentMetadata"), // JSON for additional content data
  status: mysqlEnum("status", ["pending", "approved", "rejected", "flagged"]).default("pending").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  flagReason: text("flagReason"),
  moderatorId: int("moderatorId"), // Admin user ID
  moderatorNotes: text("moderatorNotes"),
  moderatedAt: timestamp("moderatedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ContentModerationItem = typeof contentModerationQueue.$inferSelect;
export type InsertContentModerationItem = typeof contentModerationQueue.$inferInsert;

/**
 * Fraud Detection Alerts table
 */
export const fraudAlerts = mysqlTable("fraudAlerts", {
  id: int("id").autoincrement().primaryKey(),
  alertType: mysqlEnum("alertType", [
    "suspicious_transaction",
    "multiple_accounts",
    "fake_orders",
    "payment_fraud",
    "identity_theft",
    "bot_activity",
    "unusual_pattern"
  ]).notNull(),
  userId: int("userId"), // User involved in the alert
  orderId: int("orderId"), // Order involved in the alert
  riskScore: int("riskScore").notNull(), // 0-100 risk score
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  description: text("description").notNull(),
  detectionMethod: varchar("detectionMethod", { length: 100 }), // e.g., "ml_model", "rule_based"
  evidenceData: text("evidenceData"), // JSON with evidence details
  status: mysqlEnum("status", ["new", "investigating", "confirmed", "false_positive", "resolved"]).default("new").notNull(),
  assignedTo: int("assignedTo"), // Admin user ID
  investigationNotes: text("investigationNotes"),
  actionTaken: text("actionTaken"),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FraudAlert = typeof fraudAlerts.$inferSelect;
export type InsertFraudAlert = typeof fraudAlerts.$inferInsert;

/**
 * Live Dashboard Events table for real-time tracking
 */
export const liveDashboardEvents = mysqlTable("liveDashboardEvents", {
  id: int("id").autoincrement().primaryKey(),
  eventType: mysqlEnum("eventType", [
    "order_created",
    "order_assigned",
    "order_picked_up",
    "order_delivered",
    "rider_online",
    "rider_offline",
    "rider_location_update",
    "payment_completed",
    "issue_reported"
  ]).notNull(),
  entityId: int("entityId").notNull(), // ID of order, rider, etc.
  entityType: varchar("entityType", { length: 50 }).notNull(),
  eventData: text("eventData"), // JSON with event details
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type LiveDashboardEvent = typeof liveDashboardEvents.$inferSelect;
export type InsertLiveDashboardEvent = typeof liveDashboardEvents.$inferInsert;


/**
 * Geographic Regions table for Cameroon cities/zones
 */
export const geoRegions = mysqlTable("geoRegions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(), // e.g., "Douala", "Yaoundé"
  regionType: mysqlEnum("regionType", ["city", "zone", "district"]).notNull(),
  parentId: int("parentId"), // For hierarchical regions (zone -> city)
  latitude: varchar("latitude", { length: 20 }),
  longitude: varchar("longitude", { length: 20 }),
  boundaryData: text("boundaryData"), // GeoJSON polygon data
  population: int("population"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeoRegion = typeof geoRegions.$inferSelect;
export type InsertGeoRegion = typeof geoRegions.$inferInsert;

/**
 * Regional Analytics table for performance metrics by region
 */
export const regionalAnalytics = mysqlTable("regionalAnalytics", {
  id: int("id").autoincrement().primaryKey(),
  regionId: int("regionId").notNull(),
  period: mysqlEnum("period", ["day", "week", "month", "year"]).notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  totalOrders: int("totalOrders").default(0).notNull(),
  totalRevenue: int("totalRevenue").default(0).notNull(), // In FCFA
  activeUsers: int("activeUsers").default(0).notNull(),
  activeRiders: int("activeRiders").default(0).notNull(),
  avgDeliveryTime: int("avgDeliveryTime"), // In minutes
  orderDensity: int("orderDensity").default(0).notNull(), // Orders per square km
  customerSatisfaction: int("customerSatisfaction"), // 0-100 score
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RegionalAnalytics = typeof regionalAnalytics.$inferSelect;
export type InsertRegionalAnalytics = typeof regionalAnalytics.$inferInsert;

/**
 * Referral Program table
 */
export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  referrerUserId: int("referrerUserId").notNull(), // User who refers
  referredUserId: int("referredUserId"), // User who was referred (null until signup)
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  status: mysqlEnum("status", ["pending", "completed", "expired", "cancelled"]).default("pending").notNull(),
  rewardTier: mysqlEnum("rewardTier", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  rewardAmount: int("rewardAmount").default(0).notNull(), // In FCFA
  rewardStatus: mysqlEnum("rewardStatus", ["pending", "approved", "paid", "rejected"]).default("pending").notNull(),
  referredUserEmail: varchar("referredUserEmail", { length: 320 }),
  referredUserPhone: varchar("referredUserPhone", { length: 20 }),
  completedAt: timestamp("completedAt"), // When referred user completed first order
  rewardPaidAt: timestamp("rewardPaidAt"),
  expiresAt: timestamp("expiresAt"),
  metadata: text("metadata"), // JSON with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

/**
 * Referral Rewards Configuration table
 */
export const referralRewards = mysqlTable("referralRewards", {
  id: int("id").autoincrement().primaryKey(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum"]).notNull().unique(),
  referrerReward: int("referrerReward").notNull(), // Amount for referrer in FCFA
  referredReward: int("referredReward").notNull(), // Amount for referred user in FCFA
  minOrderValue: int("minOrderValue").default(0).notNull(), // Minimum first order value
  description: text("description"),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReferralReward = typeof referralRewards.$inferSelect;
export type InsertReferralReward = typeof referralRewards.$inferInsert;

/**
 * Loyalty Program Tiers table
 */
export const loyaltyTiers = mysqlTable("loyaltyTiers", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(), // Bronze, Silver, Gold, Platinum
  minPoints: int("minPoints").notNull(), // Minimum points to reach this tier
  maxPoints: int("maxPoints"), // Maximum points (null for highest tier)
  discountPercentage: int("discountPercentage").default(0).notNull(), // Discount on orders
  pointsMultiplier: int("pointsMultiplier").default(100).notNull(), // 100 = 1x, 150 = 1.5x
  benefits: text("benefits"), // JSON array of benefits
  icon: varchar("icon", { length: 100 }),
  color: varchar("color", { length: 20 }),
  isActive: int("isActive").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type InsertLoyaltyTier = typeof loyaltyTiers.$inferInsert;

/**
 * User Loyalty Points table
 */
export const userLoyaltyPoints = mysqlTable("userLoyaltyPoints", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  currentPoints: int("currentPoints").default(0).notNull(),
  lifetimePoints: int("lifetimePoints").default(0).notNull(),
  currentTierId: int("currentTierId"),
  tierAchievedAt: timestamp("tierAchievedAt"),
  pointsToNextTier: int("pointsToNextTier").default(0).notNull(),
  lastActivityAt: timestamp("lastActivityAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserLoyaltyPoints = typeof userLoyaltyPoints.$inferSelect;
export type InsertUserLoyaltyPoints = typeof userLoyaltyPoints.$inferInsert;

/**
 * Loyalty Points Transactions table
 */
export const loyaltyPointsTransactions = mysqlTable("loyaltyPointsTransactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  transactionType: mysqlEnum("transactionType", [
    "earned",
    "redeemed",
    "expired",
    "bonus",
    "adjustment",
    "refund"
  ]).notNull(),
  points: int("points").notNull(), // Positive for earned, negative for redeemed
  orderId: int("orderId"), // Related order if applicable
  description: text("description"),
  balanceBefore: int("balanceBefore").notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  expiresAt: timestamp("expiresAt"), // For earned points
  metadata: text("metadata"), // JSON with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LoyaltyPointsTransaction = typeof loyaltyPointsTransactions.$inferSelect;
export type InsertLoyaltyPointsTransaction = typeof loyaltyPointsTransactions.$inferInsert;

/**
 * Loyalty Rewards Catalog table
 */
export const loyaltyRewards = mysqlTable("loyaltyRewards", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  pointsCost: int("pointsCost").notNull(),
  rewardType: mysqlEnum("rewardType", [
    "discount_coupon",
    "free_delivery",
    "cashback",
    "product",
    "service"
  ]).notNull(),
  rewardValue: int("rewardValue"), // Value in FCFA or percentage
  imageUrl: varchar("imageUrl", { length: 500 }),
  stock: int("stock"), // null for unlimited
  minTierRequired: int("minTierRequired"), // Minimum tier ID required
  isActive: int("isActive").default(1).notNull(),
  validityDays: int("validityDays").default(30).notNull(), // How long reward is valid after redemption
  termsAndConditions: text("termsAndConditions"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type InsertLoyaltyReward = typeof loyaltyRewards.$inferInsert;

/**
 * Loyalty Reward Redemptions table
 */
export const loyaltyRedemptions = mysqlTable("loyaltyRedemptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  rewardId: int("rewardId").notNull(),
  pointsSpent: int("pointsSpent").notNull(),
  status: mysqlEnum("status", ["pending", "approved", "used", "expired", "cancelled"]).default("pending").notNull(),
  redemptionCode: varchar("redemptionCode", { length: 50 }).unique(),
  usedAt: timestamp("usedAt"),
  expiresAt: timestamp("expiresAt"),
  orderId: int("orderId"), // Order where reward was used
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LoyaltyRedemption = typeof loyaltyRedemptions.$inferSelect;
export type InsertLoyaltyRedemption = typeof loyaltyRedemptions.$inferInsert;


/**
 * Incidents table - Track accidents, safety incidents, and insurance claims
 */
export const incidents = mysqlTable("incidents", {
  id: int("id").autoincrement().primaryKey(),
  incidentType: mysqlEnum("incidentType", [
    "accident",
    "theft",
    "damage",
    "injury",
    "complaint",
    "other"
  ]).notNull(),
  severity: mysqlEnum("severity", ["minor", "moderate", "severe", "critical"]).notNull(),
  status: mysqlEnum("status", ["pending", "investigating", "resolved", "closed"]).default("pending").notNull(),
  
  // Involved parties
  riderId: int("riderId"),
  customerId: int("customerId"),
  orderId: int("orderId"),
  thirdPartyName: varchar("thirdPartyName", { length: 200 }),
  thirdPartyContact: varchar("thirdPartyContact", { length: 100 }),
  
  // Incident details
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 500 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  incidentDate: timestamp("incidentDate").notNull(),
  
  // Insurance and liability
  insuranceClaimNumber: varchar("insuranceClaimNumber", { length: 100 }),
  claimStatus: mysqlEnum("claimStatus", ["not_filed", "filed", "approved", "denied", "settled"]).default("not_filed"),
  claimAmount: int("claimAmount"), // Amount in FCFA
  liabilityAssessment: text("liabilityAssessment"),
  
  // Evidence
  photoUrls: text("photoUrls"), // JSON array of photo URLs
  witnessStatements: text("witnessStatements"), // JSON array
  policeReportNumber: varchar("policeReportNumber", { length: 100 }),
  
  // Resolution
  resolutionNotes: text("resolutionNotes"),
  compensationAmount: int("compensationAmount"), // Amount in FCFA
  resolvedAt: timestamp("resolvedAt"),
  resolvedBy: int("resolvedBy"), // Admin user ID
  
  // Metadata
  reportedBy: int("reportedBy"), // User ID who reported
  assignedTo: int("assignedTo"), // Admin user ID
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = typeof incidents.$inferInsert;

/**
 * Customer Feedback table - Store customer feedback and ratings
 */
export const customerFeedback = mysqlTable("customerFeedback", {
  id: int("id").autoincrement().primaryKey(),
  customerId: int("customerId").notNull(),
  orderId: int("orderId"),
  riderId: int("riderId"),
  sellerId: int("sellerId"),
  
  // Ratings
  overallRating: int("overallRating").notNull(), // 1-5 stars
  qualityPhotoRating: int("qualityPhotoRating"), // 1-5 stars
  deliveryRating: int("deliveryRating"), // 1-5 stars
  serviceRating: int("serviceRating"), // 1-5 stars
  productRating: int("productRating"), // 1-5 stars
  
  // Feedback content
  feedbackText: text("feedbackText"),
  category: mysqlEnum("category", [
    "delivery_speed",
    "quality_photos",
    "product_quality",
    "rider_behavior",
    "app_experience",
    "pricing",
    "customer_service",
    "other"
  ]),
  
  // Sentiment analysis
  sentiment: mysqlEnum("sentiment", ["positive", "neutral", "negative"]),
  sentimentScore: int("sentimentScore"), // -100 to 100
  keywords: text("keywords"), // JSON array of extracted keywords
  
  // Response
  responseText: text("responseText"),
  respondedBy: int("respondedBy"), // Admin user ID
  respondedAt: timestamp("respondedAt"),
  
  // Status
  status: mysqlEnum("status", ["pending", "reviewed", "responded", "resolved"]).default("pending").notNull(),
  isPublic: int("isPublic").default(1).notNull(), // Can be displayed publicly
  isFeatured: int("isFeatured").default(0).notNull(), // Featured testimonial
  
  // Metadata
  source: varchar("source", { length: 100 }), // app, web, sms, email
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type InsertCustomerFeedback = typeof customerFeedback.$inferInsert;

/**
 * Training Modules table - Define training content for riders
 */
export const trainingModules = mysqlTable("trainingModules", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", [
    "safety",
    "customer_service",
    "app_usage",
    "quality_photos",
    "delivery_procedures",
    "compliance",
    "maintenance"
  ]).notNull(),
  
  // Content
  contentType: mysqlEnum("contentType", ["video", "document", "interactive", "quiz"]).notNull(),
  contentUrl: varchar("contentUrl", { length: 500 }),
  duration: int("duration"), // Duration in minutes
  
  // Requirements
  isMandatory: int("isMandatory").default(0).notNull(),
  prerequisiteModuleId: int("prerequisiteModuleId"), // Must complete this module first
  minPassingScore: int("minPassingScore").default(70).notNull(), // Percentage
  
  // Certification
  certificateTemplate: varchar("certificateTemplate", { length: 500 }),
  certificateValidityDays: int("certificateValidityDays"), // null for permanent
  
  // Metadata
  displayOrder: int("displayOrder").default(0).notNull(), // Display order
  isActive: int("isActive").default(1).notNull(),
  version: varchar("version", { length: 20 }).default("1.0").notNull(),
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingModule = typeof trainingModules.$inferSelect;
export type InsertTrainingModule = typeof trainingModules.$inferInsert;

/**
 * Training Quiz Questions table
 */
export const trainingQuizQuestions = mysqlTable("trainingQuizQuestions", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  questionText: text("questionText").notNull(),
  questionType: mysqlEnum("questionType", ["multiple_choice", "true_false", "short_answer"]).notNull(),
  
  // Options (JSON array for multiple choice)
  options: text("options"), // JSON: [{text: string, isCorrect: boolean}]
  correctAnswer: text("correctAnswer"),
  explanation: text("explanation"),
  
  // Metadata
  points: int("points").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  isActive: int("isActive").default(1).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TrainingQuizQuestion = typeof trainingQuizQuestions.$inferSelect;
export type InsertTrainingQuizQuestion = typeof trainingQuizQuestions.$inferInsert;

/**
 * Rider Training Progress table - Track rider completion of training modules
 */
export const riderTrainingProgress = mysqlTable("riderTrainingProgress", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  moduleId: int("moduleId").notNull(),
  
  // Progress
  status: mysqlEnum("status", ["not_started", "in_progress", "completed", "failed"]).default("not_started").notNull(),
  progressPercentage: int("progressPercentage").default(0).notNull(),
  
  // Quiz results
  quizAttempts: int("quizAttempts").default(0).notNull(),
  lastQuizScore: int("lastQuizScore"), // Percentage
  bestQuizScore: int("bestQuizScore"), // Percentage
  quizAnswers: text("quizAnswers"), // JSON array of answers
  
  // Timestamps
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  lastAccessedAt: timestamp("lastAccessedAt"),
  
  // Certification
  certificateIssued: int("certificateIssued").default(0).notNull(),
  certificateNumber: varchar("certificateNumber", { length: 100 }).unique(),
  certificateIssuedAt: timestamp("certificateIssuedAt"),
  certificateExpiresAt: timestamp("certificateExpiresAt"),
  
  // Metadata
  timeSpent: int("timeSpent").default(0).notNull(), // Total time in minutes
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderTrainingProgress = typeof riderTrainingProgress.$inferSelect;
export type InsertRiderTrainingProgress = typeof riderTrainingProgress.$inferInsert;


/**
 * Custom Reports table - Save report templates and configurations
 */
export const customReports = mysqlTable("customReports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  reportType: mysqlEnum("reportType", [
    "orders",
    "revenue",
    "riders",
    "users",
    "products",
    "incidents",
    "feedback",
    "training",
    "custom"
  ]).notNull(),
  
  // Configuration
  filters: text("filters"), // JSON: {dateRange, status, category, etc}
  metrics: text("metrics"), // JSON: array of metrics to include
  groupBy: varchar("groupBy", { length: 100 }), // Group results by field
  sortBy: varchar("sortBy", { length: 100 }),
  sortOrder: mysqlEnum("sortOrder", ["asc", "desc"]).default("desc"),
  
  // Metadata
  createdBy: int("createdBy").notNull(),
  isPublic: int("isPublic").default(0).notNull(),
  tags: text("tags"), // JSON array of tags
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomReport = typeof customReports.$inferSelect;
export type InsertCustomReport = typeof customReports.$inferInsert;

/**
 * Scheduled Reports table - Automate report generation and delivery
 */
export const scheduledReports = mysqlTable("scheduledReports", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId").notNull(),
  name: varchar("name", { length: 200 }).notNull(),
  
  // Schedule
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly", "quarterly"]).notNull(),
  scheduleTime: varchar("scheduleTime", { length: 10 }), // HH:MM format
  dayOfWeek: int("dayOfWeek"), // 0-6 for weekly
  dayOfMonth: int("dayOfMonth"), // 1-31 for monthly
  timezone: varchar("timezone", { length: 50 }).default("Africa/Douala"),
  
  // Delivery
  recipients: text("recipients").notNull(), // JSON array of email addresses
  format: mysqlEnum("format", ["pdf", "excel", "csv"]).default("pdf").notNull(),
  subject: varchar("subject", { length: 300 }),
  message: text("message"),
  
  // Status
  isActive: int("isActive").default(1).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  lastStatus: mysqlEnum("lastStatus", ["success", "failed", "pending"]),
  errorMessage: text("errorMessage"),
  
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = typeof scheduledReports.$inferInsert;

/**
 * Report Execution History table - Track report generation history
 */
export const reportExecutionHistory = mysqlTable("reportExecutionHistory", {
  id: int("id").autoincrement().primaryKey(),
  reportId: int("reportId"),
  scheduledReportId: int("scheduledReportId"),
  
  // Execution details
  executedBy: int("executedBy"),
  executionType: mysqlEnum("executionType", ["manual", "scheduled"]).notNull(),
  status: mysqlEnum("status", ["success", "failed", "in_progress"]).notNull(),
  
  // Results
  recordCount: int("recordCount"),
  fileUrl: varchar("fileUrl", { length: 500 }),
  fileSize: int("fileSize"), // bytes
  format: mysqlEnum("format", ["pdf", "excel", "csv"]).notNull(),
  
  // Timing
  startedAt: timestamp("startedAt").notNull(),
  completedAt: timestamp("completedAt"),
  duration: int("duration"), // seconds
  
  errorMessage: text("errorMessage"),
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReportExecutionHistory = typeof reportExecutionHistory.$inferSelect;
export type InsertReportExecutionHistory = typeof reportExecutionHistory.$inferInsert;

/**
 * Real-time Notifications table - Store notification history
 */
export const realtimeNotifications = mysqlTable("realtimeNotifications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Notification content
  title: varchar("title", { length: 300 }).notNull(),
  message: text("message").notNull(),
  type: mysqlEnum("type", [
    "incident",
    "feedback",
    "training",
    "order",
    "system",
    "alert",
    "info"
  ]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).default("medium").notNull(),
  
  // Targeting
  recipientId: int("recipientId"), // null for broadcast
  recipientType: mysqlEnum("recipientType", ["admin", "rider", "user", "seller", "all"]).default("admin").notNull(),
  channel: varchar("channel", { length: 100 }), // WebSocket channel name
  
  // Related entities
  relatedEntityType: varchar("relatedEntityType", { length: 50 }),
  relatedEntityId: int("relatedEntityId"),
  
  // Status
  isRead: int("isRead").default(0).notNull(),
  readAt: timestamp("readAt"),
  deliveryStatus: mysqlEnum("deliveryStatus", ["pending", "sent", "failed"]).default("pending").notNull(),
  
  // Action
  actionUrl: varchar("actionUrl", { length: 500 }),
  actionLabel: varchar("actionLabel", { length: 100 }),
  
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RealtimeNotification = typeof realtimeNotifications.$inferSelect;
export type InsertRealtimeNotification = typeof realtimeNotifications.$inferInsert;

/**
 * Mobile Training Sync table - Track offline training progress for sync
 */
export const mobileTrainingSync = mysqlTable("mobileTrainingSync", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  deviceId: varchar("deviceId", { length: 100 }).notNull(),
  
  // Sync data
  syncType: mysqlEnum("syncType", ["progress", "quiz_answers", "completion", "certificate"]).notNull(),
  moduleId: int("moduleId").notNull(),
  data: text("data").notNull(), // JSON payload
  
  // Status
  syncStatus: mysqlEnum("syncStatus", ["pending", "synced", "failed"]).default("pending").notNull(),
  syncedAt: timestamp("syncedAt"),
  errorMessage: text("errorMessage"),
  
  // Metadata
  offlineTimestamp: timestamp("offlineTimestamp").notNull(),
  onlineTimestamp: timestamp("onlineTimestamp"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MobileTrainingSync = typeof mobileTrainingSync.$inferSelect;
export type InsertMobileTrainingSync = typeof mobileTrainingSync.$inferInsert;


/**
 * Rider Shifts table - Shift scheduling and management
 */
export const riderShifts = mysqlTable("riderShifts", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  
  // Shift details
  shiftDate: timestamp("shiftDate").notNull(),
  shiftType: mysqlEnum("shiftType", ["morning", "afternoon", "evening", "night", "split", "full_day"]).notNull(),
  startTime: varchar("startTime", { length: 10 }).notNull(), // HH:MM format
  endTime: varchar("endTime", { length: 10 }).notNull(),
  
  // Assignment
  assignedBy: int("assignedBy").notNull(),
  assignedAt: timestamp("assignedAt").defaultNow().notNull(),
  
  // Status
  status: mysqlEnum("status", ["scheduled", "confirmed", "in_progress", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  confirmedAt: timestamp("confirmedAt"),
  
  // Location
  zone: varchar("zone", { length: 100 }),
  location: varchar("location", { length: 255 }),
  
  // Notes
  notes: text("notes"),
  cancellationReason: text("cancellationReason"),
  
  // Recurring shift
  isRecurring: int("isRecurring").default(0).notNull(),
  recurringPattern: varchar("recurringPattern", { length: 100 }), // "weekly_monday", "daily", etc.
  recurringGroupId: varchar("recurringGroupId", { length: 50 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderShift = typeof riderShifts.$inferSelect;
export type InsertRiderShift = typeof riderShifts.$inferInsert;

/**
 * Rider Earnings Transactions table - Detailed earnings tracking
 */
export const riderEarningsTransactions = mysqlTable("riderEarningsTransactions", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  
  // Transaction details
  transactionDate: timestamp("transactionDate").defaultNow().notNull(),
  transactionType: mysqlEnum("transactionType", ["delivery_fee", "tip", "bonus", "penalty", "adjustment", "refund"]).notNull(),
  amount: int("amount").notNull(), // In cents/smallest currency unit
  currency: varchar("currency", { length: 10 }).default("XAF").notNull(),
  
  // Related entities
  orderId: int("orderId"),
  shiftId: int("shiftId"),
  
  // Description
  description: varchar("description", { length: 500 }).notNull(),
  category: varchar("category", { length: 100 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "paid", "cancelled"]).default("pending").notNull(),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  
  // Payout
  payoutId: int("payoutId"),
  paidAt: timestamp("paidAt"),
  
  // Metadata
  metadata: text("metadata"), // JSON for additional data
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderEarningsTransaction = typeof riderEarningsTransactions.$inferSelect;
export type InsertRiderEarningsTransaction = typeof riderEarningsTransactions.$inferInsert;

/**
 * Shift Swaps table - Shift swap and trade requests
 */
export const shiftSwaps = mysqlTable("shiftSwaps", {
  id: int("id").autoincrement().primaryKey(),
  
  // Swap details
  requesterId: int("requesterId").notNull(), // Rider requesting the swap
  requesterShiftId: int("requesterShiftId").notNull(),
  
  targetRiderId: int("targetRiderId"), // Rider being asked to swap (null for open swap)
  targetShiftId: int("targetShiftId"), // Shift being requested (null for just giving up shift)
  
  // Request info
  requestType: mysqlEnum("requestType", ["swap", "give_up", "take_over"]).notNull(),
  reason: text("reason"),
  
  // Status
  status: mysqlEnum("status", ["pending", "approved", "rejected", "cancelled", "completed"]).default("pending").notNull(),
  reviewedBy: int("reviewedBy"),
  reviewedAt: timestamp("reviewedAt"),
  reviewNotes: text("reviewNotes"),
  
  // Completion
  completedAt: timestamp("completedAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ShiftSwap = typeof shiftSwaps.$inferSelect;
export type InsertShiftSwap = typeof shiftSwaps.$inferInsert;

/**
 * Rider Availability table - Rider availability calendar
 */
export const riderAvailability = mysqlTable("riderAvailability", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  
  // Availability details
  availabilityDate: timestamp("availabilityDate").notNull(),
  availabilityType: mysqlEnum("availabilityType", ["available", "unavailable", "preferred", "maybe"]).notNull(),
  
  // Time slots
  timeSlots: text("timeSlots"), // JSON array: ["morning", "afternoon", "evening", "night"]
  startTime: varchar("startTime", { length: 10 }),
  endTime: varchar("endTime", { length: 10 }),
  
  // Reason for unavailability
  reason: mysqlEnum("reason", ["vacation", "sick", "personal", "other", "none"]).default("none"),
  notes: text("notes"),
  
  // Recurring availability
  isRecurring: int("isRecurring").default(0).notNull(),
  recurringPattern: varchar("recurringPattern", { length: 100 }),
  recurringEndDate: timestamp("recurringEndDate"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderAvailability = typeof riderAvailability.$inferSelect;
export type InsertRiderAvailability = typeof riderAvailability.$inferInsert;

/**
 * Rider Payouts table - Earnings payout management
 */
export const riderPayouts = mysqlTable("riderPayouts", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  
  // Payout details
  payoutDate: timestamp("payoutDate").notNull(),
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  // Amount breakdown
  totalEarnings: int("totalEarnings").notNull(), // In cents
  deductions: int("deductions").default(0).notNull(),
  bonuses: int("bonuses").default(0).notNull(),
  netAmount: int("netAmount").notNull(),
  currency: varchar("currency", { length: 10 }).default("XAF").notNull(),
  
  // Payment details
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "mobile_money", "cash", "wallet"]).notNull(),
  paymentAccount: varchar("paymentAccount", { length: 255 }),
  paymentReference: varchar("paymentReference", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  processedBy: int("processedBy"),
  processedAt: timestamp("processedAt"),
  
  // Failure handling
  failureReason: text("failureReason"),
  retryCount: int("retryCount").default(0).notNull(),
  lastRetryAt: timestamp("lastRetryAt"),
  
  // Receipt
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  receiptNumber: varchar("receiptNumber", { length: 100 }),
  
  // Metadata
  transactionIds: text("transactionIds"), // JSON array of transaction IDs included
  metadata: text("metadata"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderPayout = typeof riderPayouts.$inferSelect;
export type InsertRiderPayout = typeof riderPayouts.$inferInsert;


/**
 * Badge definitions for gamification system
 */
export const badges = mysqlTable("badges", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description").notNull(),
  icon: varchar("icon", { length: 100 }).notNull(), // Icon name or emoji
  category: mysqlEnum("category", ["earnings", "deliveries", "streak", "quality", "speed", "special"]).notNull(),
  tier: mysqlEnum("tier", ["bronze", "silver", "gold", "platinum", "diamond"]).notNull(),
  
  // Criteria for earning the badge (JSON format)
  // Example: {"type": "earnings", "threshold": 100000, "period": "all_time"}
  // Example: {"type": "deliveries", "count": 50, "period": "all_time"}
  // Example: {"type": "streak", "days": 7}
  criteria: text("criteria").notNull(),
  
  points: int("points").default(0).notNull(), // Points awarded for earning this badge
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Badge = typeof badges.$inferSelect;
export type InsertBadge = typeof badges.$inferInsert;

/**
 * Rider badges - tracks which badges each rider has earned
 */
export const riderBadges = mysqlTable("riderBadges", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  badgeId: int("badgeId").notNull(),
  
  // Progress towards earning the badge (0-100)
  progress: int("progress").default(0).notNull(),
  
  // When the badge was earned (null if not yet earned)
  earnedAt: timestamp("earnedAt"),
  
  // Metadata about how the badge was earned
  metadata: text("metadata"), // JSON format
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type RiderBadge = typeof riderBadges.$inferSelect;
export type InsertRiderBadge = typeof riderBadges.$inferInsert;

/**
 * Badge notifications - tracks when riders should be notified about badges
 */
export const badgeNotifications = mysqlTable("badgeNotifications", {
  id: int("id").autoincrement().primaryKey(),
  riderId: int("riderId").notNull(),
  badgeId: int("badgeId").notNull(),
  
  type: mysqlEnum("type", ["earned", "progress", "milestone"]).notNull(),
  message: text("message").notNull(),
  
  isRead: boolean("isRead").default(false).notNull(),
  readAt: timestamp("readAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BadgeNotification = typeof badgeNotifications.$inferSelect;
export type InsertBadgeNotification = typeof badgeNotifications.$inferInsert;
