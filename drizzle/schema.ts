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
 * Scheduled Reports table for automated report generation
 */
export const scheduledReports = mysqlTable("scheduledReports", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  reportType: varchar("reportType", { length: 50 }).default("transaction_analytics").notNull(), // transaction_analytics, revenue, etc.
  periodType: mysqlEnum("periodType", ["week", "month", "quarter", "year"]).default("month").notNull(),
  frequency: mysqlEnum("frequency", ["daily", "weekly", "monthly"]).notNull(),
  dayOfWeek: int("dayOfWeek"), // 0-6 for weekly reports (0=Sunday)
  dayOfMonth: int("dayOfMonth"), // 1-31 for monthly reports
  time: varchar("time", { length: 10 }).notNull(), // HH:MM format (24-hour)
  recipients: text("recipients").notNull(), // Comma-separated email addresses
  customMessage: text("customMessage"), // Optional message to include in email
  isActive: boolean("isActive").default(true).notNull(),
  lastRunAt: timestamp("lastRunAt"),
  nextRunAt: timestamp("nextRunAt"),
  lastRunStatus: varchar("lastRunStatus", { length: 50 }), // success, failed, skipped
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScheduledReport = typeof scheduledReports.$inferSelect;
export type InsertScheduledReport = typeof scheduledReports.$inferInsert;

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


