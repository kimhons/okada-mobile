import { eq, desc, like, and, or, count, sql, gte, lte, asc, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  languages,
  translations,
  InsertTranslation,
  incidents,
  InsertIncident,
  customerFeedback,
  InsertCustomerFeedback,
  trainingModules,
  InsertTrainingModule,
  trainingQuizQuestions,
  InsertTrainingQuizQuestion,
  riderTrainingProgress,
  InsertRiderTrainingProgress,
  customReports,
  InsertCustomReport,
  scheduledReports,
  InsertScheduledReport,
  reportExecutionHistory,
  InsertReportExecutionHistory,
  realtimeNotifications,
  InsertRealtimeNotification,
  mobileTrainingSync,
  InsertMobileTrainingSync,
  orders, orderItems, riders, products, categories, qualityPhotos, riderEarnings, sellers, sellerPayouts, paymentTransactions, commissionSettings, InsertCommissionSetting, supportTickets, supportTicketMessages, InsertSupportTicketMessage, deliveryZones, InsertDeliveryZone, notifications, InsertNotification, activityLog, InsertActivityLog, campaigns, InsertCampaign, campaignUsage, InsertCampaignUsage, apiKeys, InsertApiKey, backupLogs, InsertBackupLog, faqs, InsertFaq, helpDocs, InsertHelpDoc, reports, InsertReport, exportHistory, InsertExportHistory, emailTemplates, InsertEmailTemplate, notificationPreferences, InsertNotificationPreference, pushNotificationsLog, InsertPushNotificationLog, coupons, InsertCoupon, couponUsage, InsertCouponUsage, promotionalCampaigns, InsertPromotionalCampaign, loyaltyProgram, InsertLoyaltyProgram, loyaltyTransactions, InsertLoyaltyTransaction, payouts, InsertPayout, transactions, InsertTransaction, revenueAnalytics, InsertRevenueAnalytics, riderLocations, InsertRiderLocation, inventoryAlerts, InsertInventoryAlert, inventoryThresholds, InsertInventoryThreshold, riderTierHistory, verificationRequests, platformStatistics, disputes, disputeMessages, riderAchievements, systemSettings, contentModerationQueue, fraudAlerts, liveDashboardEvents, geoRegions, regionalAnalytics, referrals, referralRewards, loyaltyTiers, userLoyaltyPoints, loyaltyPointsTransactions, loyaltyRewards, loyaltyRedemptions, riderShifts, InsertRiderShift, riderEarningsTransactions, InsertRiderEarningsTransaction, shiftSwaps, InsertShiftSwap, riderAvailability, InsertRiderAvailability, riderPayouts, InsertRiderPayout, badges, riderBadges, badgeNotifications, orderStatusHistory, customerNotes, customerTags, customerTagAssignments, orderEditHistory, backupSchedules, InsertBackupSchedule } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Order Management Functions

export async function getAllOrders(filters?: {
  status?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  // Use denormalized customerName field for better performance
  let query = db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerId: orders.customerId,
      customerName: orders.customerName,
      customerPhone: orders.customerPhone,
      customerEmail: orders.customerEmail,
      riderId: orders.riderId,
      status: orders.status,
      total: orders.total,
      deliveryFee: orders.deliveryFee,
      deliveryAddress: orders.deliveryAddress,
      deliveryLat: orders.deliveryLat,
      deliveryLng: orders.deliveryLng,
      pickupAddress: orders.pickupAddress,
      pickupLat: orders.pickupLat,
      pickupLng: orders.pickupLng,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      notes: orders.notes,
      estimatedDeliveryTime: orders.estimatedDeliveryTime,
      actualDeliveryTime: orders.actualDeliveryTime,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
    })
    .from(orders);

  // Apply filters
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(orders.orderNumber, `%${filters.search}%`),
        like(orders.deliveryAddress, `%${filters.search}%`),
        like(orders.customerName, `%${filters.search}%`),
        like(orders.customerPhone, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  // Order by most recent first
  query = query.orderBy(desc(orders.createdAt)) as any;

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  if (filters?.offset) {
    query = query.offset(filters.offset) as any;
  }

  return await query;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function getOrderQualityPhotos(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(qualityPhotos).where(eq(qualityPhotos.orderId, orderId));
}

export async function updateOrderStatus(orderId: number, status: string) {
  const db = await getDb();
  if (!db) return null;

  await db.update(orders)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  return await getOrderById(orderId);
}

// Rider Management Functions

export async function getAllRiders(filters?: {
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(riders);

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(riders.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(riders.name, `%${filters.search}%`),
        like(riders.phone, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query;
}

export async function getRiderById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(riders).where(eq(riders.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateRiderStatus(riderId: number, status: 'pending' | 'approved' | 'rejected' | 'suspended') {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(riders).set({ status }).where(eq(riders.id, riderId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to update rider status:', error);
    return false;
  }
}

// Dashboard Statistics

export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [orderCount] = await db.select({ count: sql<number>`count(*)` }).from(orders);
  const [userCount] = await db.select({ count: sql<number>`count(*)` }).from(users);
  const [riderCount] = await db.select({ count: sql<number>`count(*)` }).from(riders);
  const [revenueSum] = await db.select({ sum: sql<number>`sum(total)` }).from(orders).where(eq(orders.paymentStatus, 'paid'));

  return {
    totalOrders: orderCount.count || 0,
    totalUsers: userCount.count || 0,
    totalRiders: riderCount.count || 0,
    totalRevenue: revenueSum.sum || 0,
  };
}

// Get recent orders for dashboard
export async function getRecentOrders(limit: number = 5) {
  const db = await getDb();
  if (!db) return [];

  const recentOrders = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerId: orders.customerId,
      customerName: orders.customerName,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .orderBy(sql`${orders.createdAt} DESC`)
    .limit(limit);

  // Map to display format using denormalized customerName
  return recentOrders.map((order) => ({
    id: order.orderNumber,
    customer: order.customerName || 'Unknown Customer',
    status: order.status,
    amount: `${(order.total / 100).toLocaleString()} FCFA`,
    createdAt: order.createdAt,
  }));
}

// Analytics Functions

export async function getRevenueByPeriod(period: 'day' | 'week' | 'month') {
  const db = await getDb();
  if (!db) return [];

  let dateFormat: string;
  switch (period) {
    case 'day':
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      dateFormat = '%Y-%u';
      break;
    case 'month':
      dateFormat = '%Y-%m';
      break;
  }

  const results = await db
    .select({
      period: sql<string>`DATE_FORMAT(created_at, ${dateFormat})`,
      revenue: sql<number>`SUM(total)`,
      orderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(eq(orders.paymentStatus, 'paid'))
    .groupBy(sql`DATE_FORMAT(created_at, ${dateFormat})`)
    .orderBy(sql`DATE_FORMAT(created_at, ${dateFormat})`);

  return results;
}

export async function getOrdersByStatus() {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      status: orders.status,
      count: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .groupBy(orders.status);

  return results;
}

export async function getTopRiders(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      riderId: riderEarnings.riderId,
      riderName: riders.name,
      totalEarnings: sql<number>`SUM(${riderEarnings.amount})`,
      deliveryCount: sql<number>`COUNT(*)`,
    })
    .from(riderEarnings)
    .leftJoin(riders, eq(riderEarnings.riderId, riders.id))
    .groupBy(riderEarnings.riderId, riders.name)
    .orderBy(desc(sql`SUM(${riderEarnings.amount})`))
    .limit(limit);

  return results;
}



// User Management Queries

export async function getAllUsers(filters?: { search?: string; role?: string }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(users);

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      sql`${users.name} LIKE ${searchTerm} OR ${users.email} LIKE ${searchTerm}`
    ) as any;
  }

  if (filters?.role) {
    query = query.where(eq(users.role, filters.role as any)) as any;
  }

  return await query.orderBy(desc(users.createdAt));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.customerId, userId))
    .orderBy(desc(orders.createdAt));
}

export async function updateUserRole(userId: number, role: 'admin' | 'user') {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(users).set({ role }).where(eq(users.id, userId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to update user role:', error);
    return false;
  }
}

// User Suspension Management

export async function suspendUser(userId: number, reason: string, duration: string) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Calculate suspension end date based on duration
    let suspendedUntil: Date | null = null;
    const now = new Date();
    
    switch (duration) {
      case '7_days':
        suspendedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case '30_days':
        suspendedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        break;
      case '90_days':
        suspendedUntil = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
        break;
      case 'permanent':
      default:
        suspendedUntil = null; // null means permanent
        break;
    }

    // Update user status (we'll use a status field or a separate suspension record)
    // For now, we'll log the suspension in activity log
    await db.insert(activityLog).values({
      adminId: 0, // System action
      adminName: 'System',
      action: 'user_suspended',
      entityType: 'user',
      entityId: userId,
      details: JSON.stringify({ reason, duration, suspendedUntil }),
      ipAddress: 'system',
    });

    return true;
  } catch (error) {
    console.error('[Database] Failed to suspend user:', error);
    return false;
  }
}

export async function unsuspendUser(userId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    // Log the unsuspension
    await db.insert(activityLog).values({
      adminId: 0, // System action
      adminName: 'System',
      action: 'user_unsuspended',
      entityType: 'user',
      entityId: userId,
      details: JSON.stringify({ unsuspendedAt: new Date() }),
      ipAddress: 'system',
    });

    return true;
  } catch (error) {
    console.error('[Database] Failed to unsuspend user:', error);
    return false;
  }
}

export async function getUserSuspensionHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    const history = await db
      .select()
      .from(activityLog)
      .where(
        and(
          eq(activityLog.entityType, 'user'),
          eq(activityLog.entityId, userId),
          or(
            eq(activityLog.action, 'user_suspended'),
            eq(activityLog.action, 'user_unsuspended')
          )
        )
      )
      .orderBy(desc(activityLog.createdAt));

    return history.map(log => ({
      id: log.id,
      action: log.action,
      details: log.details ? JSON.parse(log.details) : {},
      createdAt: log.createdAt,
    }));
  } catch (error) {
    console.error('[Database] Failed to get suspension history:', error);
    return [];
  }
}

// Additional Rider Management Queries (getAllRiders and updateRiderStatus are defined above)

export async function getRiderEarningsHistory(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(riderEarnings)
    .where(eq(riderEarnings.riderId, riderId))
    .orderBy(desc(riderEarnings.createdAt));
}

export async function getRiderDeliveries(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.riderId, riderId))
    .orderBy(desc(orders.createdAt));
}



// Product Management Queries

export async function getAllProducts(filters?: { search?: string; categoryId?: number }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(products);

  if (filters?.search) {
    const searchTerm = `%${filters.search}%`;
    query = query.where(
      sql`${products.name} LIKE ${searchTerm} OR ${products.description} LIKE ${searchTerm}`
    ) as any;
  }

  if (filters?.categoryId) {
    query = query.where(eq(products.categoryId, filters.categoryId)) as any;
  }

  return await query.orderBy(desc(products.createdAt));
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  stock: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(products).values(product);
    return await getProductById(result[0].insertId);
  } catch (error) {
    console.error('[Database] Failed to create product:', error);
    return null;
  }
}

export async function updateProduct(id: number, updates: {
  name?: string;
  description?: string;
  price?: number;
  categoryId?: number;
  imageUrl?: string;
  stock?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(products).set(updates).where(eq(products.id, id));
    return await getProductById(id);
  } catch (error) {
    console.error('[Database] Failed to update product:', error);
    return null;
  }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(products).where(eq(products.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to delete product:', error);
    return false;
  }
}

// Category Management Queries

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(category: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(categories).values(category);
    return await getCategoryById(result[0].insertId);
  } catch (error) {
    console.error('[Database] Failed to create category:', error);
    return null;
  }
}

export async function updateCategory(id: number, updates: {
  name?: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.update(categories).set(updates).where(eq(categories.id, id));
    return await getCategoryById(id);
  } catch (error) {
    console.error('[Database] Failed to update category:', error);
    return null;
  }
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(categories).where(eq(categories.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to delete category:', error);
    return false;
  }
}




// ==================== Quality Verification Management ====================

export async function getPendingQualityPhotos() {
  const db = await getDb();
  if (!db) return [];

  const photos = await db
    .select({
      id: qualityPhotos.id,
      orderId: qualityPhotos.orderId,
      orderNumber: orders.orderNumber,
      photoUrl: qualityPhotos.photoUrl,
      uploadedBy: qualityPhotos.uploadedBy,
      riderName: riders.name,
      approvalStatus: qualityPhotos.approvalStatus,
      createdAt: qualityPhotos.createdAt,
      customerName: users.name,
      deliveryAddress: orders.deliveryAddress,
    })
    .from(qualityPhotos)
    .leftJoin(orders, eq(qualityPhotos.orderId, orders.id))
    .leftJoin(riders, eq(qualityPhotos.uploadedBy, riders.id))
    .leftJoin(users, eq(orders.customerId, users.id))
    .where(eq(qualityPhotos.approvalStatus, "pending"))
    .orderBy(desc(qualityPhotos.createdAt));

  return photos;
}

export async function getQualityPhotosByOrderId(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  const photos = await db
    .select()
    .from(qualityPhotos)
    .where(eq(qualityPhotos.orderId, orderId))
    .orderBy(desc(qualityPhotos.createdAt));

  return photos;
}

export async function approveQualityPhoto(photoId: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(qualityPhotos)
    .set({ approvalStatus: "approved", updatedAt: new Date() })
    .where(eq(qualityPhotos.id, photoId));

  return { success: true };
}

export async function rejectQualityPhoto(photoId: number, reason: string) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(qualityPhotos)
    .set({
      approvalStatus: "rejected",
      rejectionReason: reason,
      updatedAt: new Date(),
    })
    .where(eq(qualityPhotos.id, photoId));

  return { success: true };
}

export async function getQualityPhotoAnalytics() {
  const db = await getDb();
  if (!db) {
    return {
      totalPhotos: 0,
      approvedPhotos: 0,
      rejectedPhotos: 0,
      pendingPhotos: 0,
      approvalRate: 0,
    };
  }

  const [stats] = await db
    .select({
      totalPhotos: count(),
      approvedPhotos: count(
        sql`CASE WHEN ${qualityPhotos.approvalStatus} = 'approved' THEN 1 END`
      ),
      rejectedPhotos: count(
        sql`CASE WHEN ${qualityPhotos.approvalStatus} = 'rejected' THEN 1 END`
      ),
      pendingPhotos: count(
        sql`CASE WHEN ${qualityPhotos.approvalStatus} = 'pending' THEN 1 END`
      ),
    })
    .from(qualityPhotos);

  const approvalRate =
    stats.totalPhotos > 0
      ? Math.round((stats.approvedPhotos / stats.totalPhotos) * 100)
      : 0;

  return {
    ...stats,
    approvalRate,
  };
}

// ==================== Seller Management ====================

export async function getAllSellers() {
  const db = await getDb();
  if (!db) return [];

  const sellersList = await db
    .select({
      id: sellers.id,
      userId: sellers.userId,
      businessName: sellers.businessName,
      businessType: sellers.businessType,
      businessEmail: sellers.businessEmail,
      businessPhone: sellers.businessPhone,
      status: sellers.status,
      totalSales: sellers.totalSales,
      totalOrders: sellers.totalOrders,
      rating: sellers.rating,
      commissionRate: sellers.commissionRate,
      createdAt: sellers.createdAt,
      ownerName: users.name,
      ownerEmail: users.email,
    })
    .from(sellers)
    .leftJoin(users, eq(sellers.userId, users.id))
    .orderBy(desc(sellers.createdAt));

  return sellersList;
}

export async function getSellerById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [seller] = await db
    .select({
      id: sellers.id,
      userId: sellers.userId,
      businessName: sellers.businessName,
      businessType: sellers.businessType,
      businessAddress: sellers.businessAddress,
      businessPhone: sellers.businessPhone,
      businessEmail: sellers.businessEmail,
      taxId: sellers.taxId,
      bankName: sellers.bankName,
      bankAccountNumber: sellers.bankAccountNumber,
      mobileMoneyProvider: sellers.mobileMoneyProvider,
      mobileMoneyNumber: sellers.mobileMoneyNumber,
      status: sellers.status,
      verificationDocuments: sellers.verificationDocuments,
      commissionRate: sellers.commissionRate,
      totalSales: sellers.totalSales,
      totalOrders: sellers.totalOrders,
      rating: sellers.rating,
      createdAt: sellers.createdAt,
      updatedAt: sellers.updatedAt,
      ownerName: users.name,
      ownerEmail: users.email,
      ownerPhone: users.phone,
    })
    .from(sellers)
    .leftJoin(users, eq(sellers.userId, users.id))
    .where(eq(sellers.id, id))
    .limit(1);

  return seller;
}

export async function updateSellerStatus(
  id: number,
  status: "pending" | "approved" | "rejected" | "suspended"
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(sellers)
    .set({ status, updatedAt: new Date() })
    .where(eq(sellers.id, id));

  return { success: true };
}

export async function getSellerProducts(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  const sellerProducts = await db
    .select()
    .from(products)
    .where(eq(products.sellerId, sellerId))
    .orderBy(desc(products.createdAt));

  return sellerProducts;
}




// ============================================================================
// Financial Management
// ============================================================================

export async function getFinancialOverview() {
  const db = await getDb();
  if (!db) return null;

  const [ordersData, payoutsData, transactionsData] = await Promise.all([
    db.select().from(orders),
    db.select().from(sellerPayouts),
    db.select().from(paymentTransactions),
  ]);

  const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
  const totalPayouts = payoutsData.reduce((sum, payout) => sum + (payout.amount || 0), 0);
  const pendingPayouts = payoutsData
    .filter((p) => p.status === "pending")
    .reduce((sum, payout) => sum + (payout.amount || 0), 0);

  return {
    totalRevenue,
    totalPayouts,
    pendingPayouts,
    netRevenue: totalRevenue - totalPayouts,
    transactionCount: transactionsData.length,
  };
}

export async function getCommissionSettings() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(commissionSettings);
}

export async function updateCommissionSetting(id: number, updates: Partial<InsertCommissionSetting>) {
  const db = await getDb();
  if (!db) return { success: false };
  
  try {
    await db.update(commissionSettings).set(updates).where(eq(commissionSettings.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error updating commission setting:", error);
    return { success: false };
  }
}

export async function getPaymentTransactions(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(paymentTransactions).limit(limit).orderBy(desc(paymentTransactions.createdAt));
}

export async function getMobileMoneyAnalytics() {
  const db = await getDb();
  if (!db) return null;

  const transactions = await db.select().from(paymentTransactions);

  const mtnTotal = transactions
    .filter((t) => t.provider === "mtn_money" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const orangeTotal = transactions
    .filter((t) => t.provider === "orange_money" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const cashTotal = transactions
    .filter((t) => t.provider === "cash" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    mtnMoney: mtnTotal,
    orangeMoney: orangeTotal,
    cash: cashTotal,
    total: mtnTotal + orangeTotal + cashTotal,
  };
}

export async function getPendingSellerPayouts() {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(sellerPayouts)
    .where(eq(sellerPayouts.status, "pending"))
    .orderBy(desc(sellerPayouts.createdAt));
}

export async function processPayoutBatch(payoutIds: number[]) {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    for (const id of payoutIds) {
      await db
        .update(sellerPayouts)
        .set({ status: "completed", processedAt: new Date() })
        .where(eq(sellerPayouts.id, id));
    }
    return { success: true, processed: payoutIds.length };
  } catch (error) {
    console.error("Error processing payouts:", error);
    return { success: false };
  }
}

// ============================================================================
// Customer Support
// ============================================================================

export async function getAllSupportTickets() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(supportTickets).orderBy(desc(supportTickets.createdAt));
}

export async function getSupportTicketById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getSupportTicketMessages(ticketId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(supportTicketMessages)
    .where(eq(supportTicketMessages.ticketId, ticketId))
    .orderBy(supportTicketMessages.createdAt);
}

export async function addSupportTicketMessage(message: InsertSupportTicketMessage) {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    await db.insert(supportTicketMessages).values(message);
    return { success: true };
  } catch (error) {
    console.error("Error adding ticket message:", error);
    return { success: false };
  }
}

export async function updateSupportTicketStatus(id: number, status: "open" | "in_progress" | "resolved" | "closed") {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    const updates: any = { status };
    if (status === "resolved" || status === "closed") {
      updates.resolvedAt = new Date();
    }
    await db.update(supportTickets).set(updates).where(eq(supportTickets.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return { success: false };
  }
}

// ============================================================================
// Delivery Zones
// ============================================================================

export async function getAllDeliveryZones() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(deliveryZones).orderBy(deliveryZones.city, deliveryZones.name);
}

export async function getDeliveryZoneById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(deliveryZones).where(eq(deliveryZones.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDeliveryZone(zone: InsertDeliveryZone) {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    await db.insert(deliveryZones).values(zone);
    return { success: true };
  } catch (error) {
    console.error("Error creating delivery zone:", error);
    return { success: false };
  }
}

export async function updateDeliveryZone(id: number, updates: Partial<InsertDeliveryZone>) {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    await db.update(deliveryZones).set(updates).where(eq(deliveryZones.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error updating delivery zone:", error);
    return { success: false };
  }
}

export async function deleteDeliveryZone(id: number) {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    await db.delete(deliveryZones).where(eq(deliveryZones.id, id));
    return { success: true };
  } catch (error) {
    console.error("Error deleting delivery zone:", error);
    return { success: false };
  }
}




// ============================================================================
// Notifications Management
// ============================================================================

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(notifications).values(data);
}

// ============================================================================
// Activity Log
// ============================================================================

export async function logActivity(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(activityLog).values(data);
}

export async function createActivityLog(data: InsertActivityLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(activityLog).values(data);
  const insertId = Number(result[0].insertId);
  
  // Return the created activity log
  const created = await db.select().from(activityLog).where(eq(activityLog.id, insertId)).limit(1);
  return created[0];
}

export async function getActivityLogs(filters?: {
  adminId?: number;
  action?: string;
  entityType?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(activityLog);
  
  if (filters?.adminId) {
    query = query.where(eq(activityLog.adminId, filters.adminId)) as any;
  }
  if (filters?.action) {
    query = query.where(eq(activityLog.action, filters.action)) as any;
  }
  if (filters?.entityType) {
    query = query.where(eq(activityLog.entityType, filters.entityType)) as any;
  }
  
  query = query.orderBy(desc(activityLog.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return query;
}

// ============================================================================
// Promotional Campaigns
// ============================================================================

export async function createCampaign(data: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(campaigns).values(data);
  return result;
}

export async function getAllCampaigns() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateCampaign(id: number, data: Partial<InsertCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
}

export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(campaigns).where(eq(campaigns.id, id));
}

export async function getCampaignUsage(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(campaignUsage).where(eq(campaignUsage.campaignId, campaignId));
}

export async function getCampaignByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(campaigns).where(eq(campaigns.discountCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveCampaigns() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(campaigns).where(eq(campaigns.isActive, true)).orderBy(desc(campaigns.createdAt));
}

export async function getUserCampaignUsage(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(campaignUsage).where(eq(campaignUsage.userId, userId));
}

export async function hasUserUsedCampaign(userId: number, campaignId: number) {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(campaignUsage)
    .where(and(eq(campaignUsage.userId, userId), eq(campaignUsage.campaignId, campaignId)))
    .limit(1);
  return result.length > 0;
}

export async function recordCampaignUsage(data: InsertCampaignUsage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(campaignUsage).values(data);
  
  // Increment usage count
  await db.update(campaigns)
    .set({ usageCount: sql`${campaigns.usageCount} + 1` })
    .where(eq(campaigns.id, data.campaignId));
}




// ============================================================================
// Settings & Configuration Functions
// ============================================================================

// Admin Users Management
export async function getAllAdminUsers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Return all users for admin management (not just admins)
  return await db.select().from(users);
}

export async function promoteUserToAdmin(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
}

export async function demoteAdminToUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(users).set({ role: "user" }).where(eq(users.id, userId));
}

// API Keys Management
export async function createApiKey(data: InsertApiKey) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(apiKeys).values(data);
}

export async function getAllApiKeys() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
}

export async function getApiKeyById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateApiKey(id: number, data: Partial<InsertApiKey>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(apiKeys).set(data).where(eq(apiKeys.id, id));
}

export async function deleteApiKey(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(apiKeys).where(eq(apiKeys.id, id));
}

export async function updateApiKeyLastUsed(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, id));
}

// Backup & Restore
export async function createBackupLog(data: InsertBackupLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(backupLogs).values(data);
}

export async function getAllBackupLogs() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(backupLogs).orderBy(desc(backupLogs.createdAt));
}

export async function getBackupLogById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(backupLogs).where(eq(backupLogs.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateBackupLog(id: number, data: Partial<InsertBackupLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(backupLogs).set(data).where(eq(backupLogs.id, id));
}

export async function getRecentBackups(limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(backupLogs).orderBy(desc(backupLogs.createdAt)).limit(limit);
}



// ============================================================================
// Support & Help Functions
// ============================================================================

// FAQ Management
export async function getAllFaqs(filters?: {
  category?: string;
  isPublished?: boolean;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(faqs);

  const conditions = [];
  if (filters?.category) {
    conditions.push(eq(faqs.category, filters.category));
  }
  if (filters?.isPublished !== undefined) {
    conditions.push(eq(faqs.isPublished, filters.isPublished));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(faqs.question, `%${filters.search}%`),
        like(faqs.answer, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await (query as any).orderBy(faqs.order, desc(faqs.createdAt));
}

export async function getFaqById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return result[0];
}

export async function createFaq(data: InsertFaq) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(faqs).values(data);
}

export async function updateFaq(id: number, data: Partial<InsertFaq>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(faqs).set(data).where(eq(faqs.id, id));
}

export async function deleteFaq(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(faqs).where(eq(faqs.id, id));
}

export async function incrementFaqViews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(faqs).set({ views: sql`${faqs.views} + 1` }).where(eq(faqs.id, id));
}

export async function voteFaqHelpful(id: number, helpful: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (helpful) {
    return await db.update(faqs).set({ helpful: sql`${faqs.helpful} + 1` }).where(eq(faqs.id, id));
  } else {
    return await db.update(faqs).set({ notHelpful: sql`${faqs.notHelpful} + 1` }).where(eq(faqs.id, id));
  }
}

// Help Documentation Management
export async function getAllHelpDocs(filters?: {
  category?: string;
  isPublished?: boolean;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(helpDocs);

  const conditions = [];
  if (filters?.category) {
    conditions.push(eq(helpDocs.category, filters.category));
  }
  if (filters?.isPublished !== undefined) {
    conditions.push(eq(helpDocs.isPublished, filters.isPublished));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(helpDocs.title, `%${filters.search}%`),
        like(helpDocs.content, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await (query as any).orderBy(desc(helpDocs.createdAt));
}

export async function getHelpDocById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(helpDocs).where(eq(helpDocs.id, id)).limit(1);
  return result[0];
}

export async function getHelpDocBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(helpDocs).where(eq(helpDocs.slug, slug)).limit(1);
  return result[0];
}

export async function createHelpDoc(data: InsertHelpDoc) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(helpDocs).values(data);
}

export async function updateHelpDoc(id: number, data: Partial<InsertHelpDoc>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(helpDocs).set(data).where(eq(helpDocs.id, id));
}

export async function deleteHelpDoc(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(helpDocs).where(eq(helpDocs.id, id));
}

export async function incrementHelpDocViews(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(helpDocs).set({ views: sql`${helpDocs.views} + 1` }).where(eq(helpDocs.id, id));
}

export async function voteHelpDocHelpful(id: number, helpful: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (helpful) {
    return await db.update(helpDocs).set({ helpful: sql`${helpDocs.helpful} + 1` }).where(eq(helpDocs.id, id));
  } else {
    return await db.update(helpDocs).set({ notHelpful: sql`${helpDocs.notHelpful} + 1` }).where(eq(helpDocs.id, id));
  }
}


// ============================================================================
// Reports Management
// ============================================================================

export async function getAllReports(filters?: {
  reportType?: string;
  isPublic?: boolean;
  createdBy?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.reportType) {
    conditions.push(eq(reports.reportType, filters.reportType));
  }

  if (filters?.isPublic !== undefined) {
    conditions.push(eq(reports.isPublic, filters.isPublic));
  }

  if (filters?.createdBy) {
    conditions.push(eq(reports.createdBy, filters.createdBy));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(reports.name, `%${filters.search}%`),
        like(reports.description, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(reports)
    .where(whereClause)
    .orderBy(desc(reports.createdAt));
}

export async function getReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(reports).where(eq(reports.id, id)).limit(1);
  return result[0];
}

export async function createReport(data: InsertReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(reports).values(data);
}

export async function updateReport(id: number, data: Partial<InsertReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(reports).set(data).where(eq(reports.id, id));
}

export async function deleteReport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(reports).where(eq(reports.id, id));
}

// ============================================================================
// Scheduled Reports Management
// ============================================================================

export async function getAllScheduledReports(filters?: {
  reportType?: string;
  frequency?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.reportType) {
    // Note: reportType is stored via reportId reference, filter by name instead
    conditions.push(eq(scheduledReports.name, filters.reportType));
  }

  if (filters?.frequency) {
    conditions.push(eq(scheduledReports.frequency, filters.frequency as any));
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(scheduledReports.isActive, filters.isActive ? 1 : 0));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(scheduledReports)
    .where(whereClause)
    .orderBy(desc(scheduledReports.createdAt));
}

export async function getScheduledReportById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(scheduledReports).where(eq(scheduledReports.id, id)).limit(1);
  return result[0];
}

// ============================================================================
// Export History Management
// ============================================================================

export async function getAllExportHistory(filters?: {
  exportType?: string;
  format?: string;
  status?: string;
  createdBy?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.exportType) {
    conditions.push(eq(exportHistory.exportType, filters.exportType));
  }

  if (filters?.format) {
    conditions.push(eq(exportHistory.format, filters.format as any));
  }

  if (filters?.status) {
    conditions.push(eq(exportHistory.status, filters.status as any));
  }

  if (filters?.createdBy) {
    conditions.push(eq(exportHistory.createdBy, filters.createdBy));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(exportHistory)
    .where(whereClause)
    .orderBy(desc(exportHistory.createdAt));
}

export async function getExportHistoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(exportHistory).where(eq(exportHistory.id, id)).limit(1);
  return result[0];
}

export async function createExportHistory(data: InsertExportHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(exportHistory).values(data);
}

export async function updateExportHistory(id: number, data: Partial<InsertExportHistory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(exportHistory).set(data).where(eq(exportHistory.id, id));
}

export async function deleteExportHistory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(exportHistory).where(eq(exportHistory.id, id));
}



// ============================================================================
// Email Templates Management
// ============================================================================

export async function getAllEmailTemplates(filters?: {
  category?: string;
  isActive?: boolean;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(emailTemplates.category, filters.category));
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(emailTemplates.isActive, filters.isActive));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(emailTemplates.name, `%${filters.search}%`),
        like(emailTemplates.subject, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(emailTemplates)
    .where(whereClause)
    .orderBy(desc(emailTemplates.createdAt));
}

export async function getEmailTemplateById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(emailTemplates).where(eq(emailTemplates.id, id)).limit(1);
  return result[0];
}

export async function createEmailTemplate(data: InsertEmailTemplate) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(emailTemplates).values(data);
}

export async function updateEmailTemplate(id: number, data: Partial<InsertEmailTemplate>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(emailTemplates).set(data).where(eq(emailTemplates.id, id));
}

export async function deleteEmailTemplate(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(emailTemplates).where(eq(emailTemplates.id, id));
}

// ============================================================================
// Notification Preferences Management
// ============================================================================

export async function getAllNotificationPreferences() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(notificationPreferences)
    .orderBy(desc(notificationPreferences.createdAt));
}

export async function getNotificationPreferenceByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);
  
  return result[0];
}

export async function createNotificationPreference(data: InsertNotificationPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(notificationPreferences).values(data);
}

export async function updateNotificationPreference(userId: number, data: Partial<InsertNotificationPreference>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(notificationPreferences)
    .set(data)
    .where(eq(notificationPreferences.userId, userId));
}

export async function deleteNotificationPreference(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId));
}

// ============================================================================
// Push Notifications Management
// ============================================================================

export async function getAllPushNotifications(filters?: {
  type?: string;
  targetAudience?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.type) {
    conditions.push(eq(pushNotificationsLog.type, filters.type as any));
  }

  if (filters?.targetAudience) {
    conditions.push(eq(pushNotificationsLog.targetAudience, filters.targetAudience as any));
  }

  if (filters?.status) {
    conditions.push(eq(pushNotificationsLog.status, filters.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(pushNotificationsLog)
    .where(whereClause)
    .orderBy(desc(pushNotificationsLog.createdAt));
}

export async function getPushNotificationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(pushNotificationsLog)
    .where(eq(pushNotificationsLog.id, id))
    .limit(1);
  
  return result[0];
}

export async function createPushNotification(data: InsertPushNotificationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(pushNotificationsLog).values(data);
}

export async function updatePushNotification(id: number, data: Partial<InsertPushNotificationLog>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(pushNotificationsLog)
    .set(data)
    .where(eq(pushNotificationsLog.id, id));
}

export async function deletePushNotification(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(pushNotificationsLog)
    .where(eq(pushNotificationsLog.id, id));
}


// ============================================================================
// Coupon Management
// ============================================================================

export async function getAllCoupons(filters?: {
  isActive?: boolean;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.isActive !== undefined) {
    conditions.push(eq(coupons.isActive, filters.isActive));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(coupons.code, `%${filters.search}%`),
        like(coupons.description, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(coupons)
    .where(whereClause)
    .orderBy(desc(coupons.createdAt));
}

export async function getCouponById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);
  
  return result[0];
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, code))
    .limit(1);
  
  return result[0];
}

export async function createCoupon(data: InsertCoupon) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(coupons).values(data);
  
  // Return the created coupon
  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.code, data.code))
    .limit(1);
  
  return result[0];
}

export async function updateCoupon(id: number, data: Partial<InsertCoupon>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(coupons)
    .set(data)
    .where(eq(coupons.id, id));
  
  // Return the updated coupon
  const result = await db
    .select()
    .from(coupons)
    .where(eq(coupons.id, id))
    .limit(1);
  
  return result[0];
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(coupons)
    .where(eq(coupons.id, id));
}

export async function getCouponUsage(couponId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(couponUsage)
    .where(eq(couponUsage.couponId, couponId))
    .orderBy(desc(couponUsage.usedAt));
}

export async function createCouponUsage(data: InsertCouponUsage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(couponUsage).values(data);
}

// ============================================================================
// Promotional Campaigns
// ============================================================================

export async function getAllPromotionalCampaigns(filters?: {
  status?: string;
  type?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(promotionalCampaigns.status, filters.status as any));
  }

  if (filters?.type) {
    conditions.push(eq(promotionalCampaigns.type, filters.type as any));
  }

  if (filters?.search) {
    conditions.push(
      or(
        like(promotionalCampaigns.name, `%${filters.search}%`),
        like(promotionalCampaigns.description, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(promotionalCampaigns)
    .where(whereClause)
    .orderBy(desc(promotionalCampaigns.createdAt));
}

export async function getPromotionalCampaignById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(promotionalCampaigns)
    .where(eq(promotionalCampaigns.id, id))
    .limit(1);
  
  return result[0];
}

export async function createPromotionalCampaign(data: InsertPromotionalCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(promotionalCampaigns).values(data);
  
  // Return the created campaign
  const result = await db
    .select()
    .from(promotionalCampaigns)
    .where(eq(promotionalCampaigns.name, data.name))
    .orderBy(desc(promotionalCampaigns.createdAt))
    .limit(1);
  
  return result[0];
}

export async function updatePromotionalCampaign(id: number, data: Partial<InsertPromotionalCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(promotionalCampaigns)
    .set(data)
    .where(eq(promotionalCampaigns.id, id));
  
  // Return the updated campaign
  const result = await db
    .select()
    .from(promotionalCampaigns)
    .where(eq(promotionalCampaigns.id, id))
    .limit(1);
  
  return result[0];
}

export async function deletePromotionalCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(promotionalCampaigns)
    .where(eq(promotionalCampaigns.id, id));
}

// ============================================================================
// Loyalty Program
// ============================================================================

export async function getAllLoyaltyPrograms() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(loyaltyProgram)
    .orderBy(desc(loyaltyProgram.points));
}

export async function getLoyaltyProgramByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(loyaltyProgram)
    .where(eq(loyaltyProgram.userId, userId))
    .limit(1);
  
  return result[0];
}

export async function createLoyaltyProgram(data: InsertLoyaltyProgram) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(loyaltyProgram).values(data);
  
  // Return the created program
  const result = await db
    .select()
    .from(loyaltyProgram)
    .where(eq(loyaltyProgram.userId, data.userId))
    .limit(1);
  
  return result[0];
}

export async function updateLoyaltyProgram(userId: number, data: Partial<InsertLoyaltyProgram>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(loyaltyProgram)
    .set(data)
    .where(eq(loyaltyProgram.userId, userId));
  
  // Return the updated program
  const result = await db
    .select()
    .from(loyaltyProgram)
    .where(eq(loyaltyProgram.userId, userId))
    .limit(1);
  
  return result[0];
}

export async function deleteLoyaltyProgram(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(loyaltyProgram)
    .where(eq(loyaltyProgram.userId, userId));
}

export async function getLoyaltyTransactions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, userId))
    .orderBy(desc(loyaltyTransactions.createdAt));
}

export async function createLoyaltyTransaction(data: InsertLoyaltyTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(loyaltyTransactions).values(data);
  
  // Return the created transaction
  const result = await db
    .select()
    .from(loyaltyTransactions)
    .where(eq(loyaltyTransactions.userId, data.userId))
    .orderBy(desc(loyaltyTransactions.createdAt))
    .limit(1);
  
  return result[0];
}


// ============================================================================
// Financial Management - Payouts
// ============================================================================

export async function getAllPayouts(filters?: { status?: string; recipientType?: string; search?: string }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(payouts.status, filters.status as any));
  }
  if (filters?.recipientType) {
    conditions.push(eq(payouts.recipientType, filters.recipientType as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(payouts.paymentMethod, `%${filters.search}%`),
        sql`CAST(${payouts.recipientId} AS CHAR) LIKE ${`%${filters.search}%`}`
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(payouts)
    .where(whereClause)
    .orderBy(desc(payouts.createdAt));
}

export async function getPayoutById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(payouts)
    .where(eq(payouts.id, id))
    .limit(1);
  
  return result[0];
}

export async function createPayout(data: InsertPayout) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(payouts).values(data);
  
  // Return the created payout
  const result = await db
    .select()
    .from(payouts)
    .where(eq(payouts.recipientId, data.recipientId))
    .orderBy(desc(payouts.createdAt))
    .limit(1);
  
  return result[0];
}

export async function updatePayout(id: number, data: Partial<InsertPayout>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(payouts)
    .set(data)
    .where(eq(payouts.id, id));
  
  // Return the updated payout
  const result = await db
    .select()
    .from(payouts)
    .where(eq(payouts.id, id))
    .limit(1);
  
  return result[0];
}

export async function deletePayout(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .delete(payouts)
    .where(eq(payouts.id, id));
}

// ============================================================================
// Financial Management - Transactions
// ============================================================================

export async function getAllTransactions(filters?: { 
  type?: string; 
  status?: string; 
  search?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount" | "type" | "status";
  sortDirection?: "asc" | "desc";
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.type) {
    conditions.push(eq(transactions.type, filters.type as any));
  }
  if (filters?.status) {
    conditions.push(eq(transactions.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(transactions.transactionId, `%${filters.search}%`),
        like(transactions.description, `%${filters.search}%`)
      )
    );
  }
  if (filters?.startDate) {
    conditions.push(gte(transactions.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(transactions.createdAt, filters.endDate));
  }
  if (filters?.minAmount !== undefined) {
    conditions.push(gte(transactions.amount, filters.minAmount));
  }
  if (filters?.maxAmount !== undefined) {
    conditions.push(lte(transactions.amount, filters.maxAmount));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Determine sort column and direction
  const sortColumn = filters?.sortBy || "date";
  const sortDir = filters?.sortDirection || "desc";
  
  let orderByClause;
  switch (sortColumn) {
    case "amount":
      orderByClause = sortDir === "asc" ? asc(transactions.amount) : desc(transactions.amount);
      break;
    case "type":
      orderByClause = sortDir === "asc" ? asc(transactions.type) : desc(transactions.type);
      break;
    case "status":
      orderByClause = sortDir === "asc" ? asc(transactions.status) : desc(transactions.status);
      break;
    case "date":
    default:
      orderByClause = sortDir === "asc" ? asc(transactions.createdAt) : desc(transactions.createdAt);
      break;
  }

  return await db
    .select()
    .from(transactions)
    .where(whereClause)
    .orderBy(orderByClause);
}

export async function getTransactionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);
  
  return result[0];
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(transactions).values(data);
  
  // Return the created transaction
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.transactionId, data.transactionId))
    .limit(1);
  
  return result[0];
}

export async function updateTransaction(id: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(transactions)
    .set(data)
    .where(eq(transactions.id, id));
  
  // Return the updated transaction
  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.id, id))
    .limit(1);
  
  return result[0];
}

// ============================================================================
// Financial Management - Revenue Analytics
// ============================================================================

export async function getAllRevenueAnalytics(filters?: { period?: string; startDate?: Date; endDate?: Date }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.period) {
    conditions.push(eq(revenueAnalytics.period, filters.period as any));
  }
  if (filters?.startDate) {
    conditions.push(sql`${revenueAnalytics.date} >= ${filters.startDate}`);
  }
  if (filters?.endDate) {
    conditions.push(sql`${revenueAnalytics.date} <= ${filters.endDate}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(revenueAnalytics)
    .where(whereClause)
    .orderBy(desc(revenueAnalytics.date));
}

export async function createRevenueAnalytics(data: InsertRevenueAnalytics) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(revenueAnalytics).values(data);
  
  // Return the created analytics
  const result = await db
    .select()
    .from(revenueAnalytics)
    .orderBy(desc(revenueAnalytics.createdAt))
    .limit(1);
  
  return result[0];
}



// ============================================================================
// Rider Locations Functions
// ============================================================================

export async function getAllRiderLocations(filters?: { status?: string; riderId?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(riderLocations.status, filters.status as any));
  }
  if (filters?.riderId) {
    conditions.push(eq(riderLocations.riderId, filters.riderId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(riderLocations)
    .where(whereClause)
    .orderBy(desc(riderLocations.timestamp));
}

export async function getRiderLocationById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(riderLocations)
    .where(eq(riderLocations.id, id))
    .limit(1);

  return result[0];
}

export async function getLatestRiderLocation(riderId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(riderLocations)
    .where(eq(riderLocations.riderId, riderId))
    .orderBy(desc(riderLocations.timestamp))
    .limit(1);

  return result[0];
}

export async function createRiderLocation(data: InsertRiderLocation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(riderLocations).values(data);
  
  // Return the created location
  const result = await db
    .select()
    .from(riderLocations)
    .where(eq(riderLocations.riderId, data.riderId))
    .orderBy(desc(riderLocations.createdAt))
    .limit(1);
  
  return result[0];
}

export async function updateRiderLocation(riderId: number, data: Partial<InsertRiderLocation>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(riderLocations)
    .set(data)
    .where(eq(riderLocations.riderId, riderId));
}

export async function getActiveDeliveries() {
  const db = await getDb();
  if (!db) return [];

  // Get all orders with status in_transit along with their rider locations
  const result = await db
    .select({
      order: orders,
      rider: riders,
      location: riderLocations,
    })
    .from(orders)
    .leftJoin(riders, eq(orders.riderId, riders.id))
    .leftJoin(riderLocations, eq(riders.id, riderLocations.riderId))
    .where(eq(orders.status, "in_transit"))
    .orderBy(desc(orders.createdAt));

  return result;
}

// ============================================================================
// Inventory Alerts Functions
// ============================================================================

export async function getAllInventoryAlerts(filters?: { status?: string; severity?: string; productId?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(inventoryAlerts.status, filters.status as any));
  }
  if (filters?.severity) {
    conditions.push(eq(inventoryAlerts.severity, filters.severity as any));
  }
  if (filters?.productId) {
    conditions.push(eq(inventoryAlerts.productId, filters.productId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(inventoryAlerts)
    .where(whereClause)
    .orderBy(desc(inventoryAlerts.createdAt));
}

export async function getInventoryAlertById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(inventoryAlerts)
    .where(eq(inventoryAlerts.id, id))
    .limit(1);

  return result[0];
}

export async function createInventoryAlert(data: InsertInventoryAlert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(inventoryAlerts).values(data);
  
  // Return the created alert
  const result = await db
    .select()
    .from(inventoryAlerts)
    .orderBy(desc(inventoryAlerts.createdAt))
    .limit(1);
  
  return result[0];
}

export async function updateInventoryAlert(id: number, data: Partial<InsertInventoryAlert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inventoryAlerts)
    .set(data)
    .where(eq(inventoryAlerts.id, id));
}

export async function resolveInventoryAlert(id: number, userId: number, notes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inventoryAlerts)
    .set({
      status: "resolved",
      resolvedAt: new Date(),
      resolvedBy: userId,
      notes: notes || null,
    })
    .where(eq(inventoryAlerts.id, id));
}

export async function dismissInventoryAlert(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inventoryAlerts)
    .set({ status: "dismissed" })
    .where(eq(inventoryAlerts.id, id));
}

export async function bulkResolveInventoryAlerts(ids: number[], userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const id of ids) {
    await resolveInventoryAlert(id, userId);
  }
}

// ============================================================================
// Inventory Thresholds Functions
// ============================================================================

export async function getAllInventoryThresholds() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(inventoryThresholds)
    .orderBy(desc(inventoryThresholds.createdAt));
}

export async function getInventoryThresholdByProductId(productId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(inventoryThresholds)
    .where(eq(inventoryThresholds.productId, productId))
    .limit(1);

  return result[0];
}

export async function createInventoryThreshold(data: InsertInventoryThreshold) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(inventoryThresholds).values(data);
  
  // Return the created threshold
  const result = await db
    .select()
    .from(inventoryThresholds)
    .where(eq(inventoryThresholds.productId, data.productId))
    .limit(1);
  
  return result[0];
}

// Removed duplicate - using the more comprehensive version below

export async function deleteInventoryThreshold(productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(inventoryThresholds)
    .where(eq(inventoryThresholds.productId, productId));
}

export async function checkStockLevelsAndCreateAlerts() {
  const db = await getDb();
  if (!db) return [];

  // Get all products with their thresholds
  const productsWithThresholds = await db
    .select({
      product: products,
      threshold: inventoryThresholds,
    })
    .from(products)
    .leftJoin(inventoryThresholds, eq(products.id, inventoryThresholds.productId));

  const newAlerts = [];

  for (const item of productsWithThresholds) {
    if (!item.threshold || !item.product) continue;

    const stock = item.product.stock;
    const { productId, lowStockThreshold, criticalStockThreshold, overstockThreshold } = item.threshold;

    // Check if there's already an active alert for this product
    const existingAlerts = await db
      .select()
      .from(inventoryAlerts)
      .where(
        and(
          eq(inventoryAlerts.productId, productId),
          eq(inventoryAlerts.status, "active")
        )
      );

    if (existingAlerts.length > 0) continue; // Skip if alert already exists

    // Determine alert type and severity
    let alertType: "low_stock" | "out_of_stock" | "overstocked" | null = null;
    let severity: "critical" | "warning" | "info" | null = null;
    let threshold = 0;

    if (stock === 0) {
      alertType = "out_of_stock";
      severity = "critical";
      threshold = 0;
    } else if (stock <= criticalStockThreshold) {
      alertType = "low_stock";
      severity = "critical";
      threshold = criticalStockThreshold;
    } else if (stock <= lowStockThreshold) {
      alertType = "low_stock";
      severity = "warning";
      threshold = lowStockThreshold;
    } else if (overstockThreshold && stock >= overstockThreshold) {
      alertType = "overstocked";
      severity = "info";
      threshold = overstockThreshold;
    }

    if (alertType && severity) {
      const newAlert = await createInventoryAlert({
        productId,
        alertType,
        threshold,
        currentStock: stock,
        severity,
        status: "active",
        resolvedAt: null,
        resolvedBy: null,
        notes: null,
      });
      newAlerts.push(newAlert);
    }
  }

  return newAlerts;
}


// ============================================================================
// Rider Leaderboard Functions
// ============================================================================
import { inArray } from "drizzle-orm";

export async function getRiderLeaderboard(params: {
  period: 'today' | 'week' | 'month' | 'all';
  category: 'overall' | 'earnings' | 'deliveries' | 'rating' | 'speed';
  tier?: 'platinum' | 'gold' | 'silver' | 'bronze' | 'rookie' | 'all';
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { leaderboard: [], total: 0, stats: null };

  const { period, category, tier, limit = 50, offset = 0 } = params;

  // Calculate date range based on period
  const now = new Date();
  let startDate: Date | null = null;

  switch (period) {
    case 'today':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + mondayOffset);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all':
      startDate = null; // No date filter
      break;
  }

  // Build the query
  const riderQuery = db
    .select({
      riderId: riders.id,
      name: riders.name,
      email: riders.email,
      phone: riders.phone,
      rating: riders.rating,
      acceptanceRate: riders.acceptanceRate,
      totalDeliveries: riders.totalDeliveries,
      status: riders.status,
      createdAt: riders.createdAt,
    })
    .from(riders)
    .where(eq(riders.status, 'approved'));

  const allRiders = await riderQuery;

  // For each rider, calculate metrics based on period
  const leaderboardData = await Promise.all(
    allRiders.map(async (rider) => {
      // Get orders for this rider in the period
      const orderConditions = [eq(orders.riderId, rider.riderId)];
      if (startDate) {
        orderConditions.push(gte(orders.createdAt, startDate));
      }

      const riderOrders = await db
        .select({
          id: orders.id,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
          actualDeliveryTime: orders.actualDeliveryTime,
          estimatedDeliveryTime: orders.estimatedDeliveryTime,
        })
        .from(orders)
        .where(and(...orderConditions));
      const completedOrders = riderOrders.filter((o) => o.status === 'delivered');

      // Calculate metrics
      const deliveryCount = completedOrders.length;
      const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);

      // Calculate on-time deliveries
      const onTimeOrders = completedOrders.filter((o) => {
        if (!o.actualDeliveryTime || !o.estimatedDeliveryTime) return false;
        return new Date(o.actualDeliveryTime) <= new Date(o.estimatedDeliveryTime);
      });
      const onTimeRate = deliveryCount > 0 ? (onTimeOrders.length / deliveryCount) * 100 : 0;

      // Get quality photo compliance
      const photosQuery = db
        .select({ orderId: qualityPhotos.orderId, approvalStatus: qualityPhotos.approvalStatus })
        .from(qualityPhotos)
        .where(
          inArray(
            qualityPhotos.orderId,
            completedOrders.map((o) => o.id)
          )
        );

      const photos = completedOrders.length > 0 ? await photosQuery : [];
      const qualityCompliance =
        completedOrders.length > 0 ? (photos.length / completedOrders.length) * 100 : 0;

      // Calculate average delivery time (in minutes)
      const deliveryTimes = completedOrders
        .filter((o) => o.actualDeliveryTime && o.createdAt)
        .map((o) => {
          const start = new Date(o.createdAt!).getTime();
          const end = new Date(o.actualDeliveryTime!).getTime();
          return (end - start) / (1000 * 60); // Convert to minutes
        });
      const avgDeliveryTime =
        deliveryTimes.length > 0
          ? deliveryTimes.reduce((sum, t) => sum + t, 0) / deliveryTimes.length
          : 0;

      // Get earnings from riderEarnings table
      const earningsConditions = [eq(riderEarnings.riderId, rider.riderId)];
      if (startDate) {
        earningsConditions.push(gte(riderEarnings.createdAt, startDate));
      }

      const earnings = await db
        .select({
          amount: riderEarnings.amount,
          bonus: riderEarnings.bonus,
          tip: riderEarnings.tip,
        })
        .from(riderEarnings)
        .where(and(...earningsConditions));
      const periodEarnings = earnings.reduce(
        (sum, e) => sum + (e.amount || 0) + (e.bonus || 0) + (e.tip || 0),
        0
      );

      return {
        rider,
        deliveryCount,
        totalEarnings: periodEarnings,
        rating: rider.rating || 0,
        onTimeRate,
        acceptanceRate: rider.acceptanceRate || 0,
        qualityCompliance,
        avgDeliveryTime,
      };
    })
  );

  // Calculate normalized scores (0-100) for each metric
  const maxDeliveries = Math.max(...leaderboardData.map((d) => d.deliveryCount), 1);
  const maxEarnings = Math.max(...leaderboardData.map((d) => d.totalEarnings), 1);

  const scoredData = leaderboardData.map((data) => {
    const deliveryScore = (data.deliveryCount / maxDeliveries) * 100;
    const ratingScore = (data.rating / 5.0) * 100;
    const onTimeScore = data.onTimeRate;
    const acceptanceScore = data.acceptanceRate;
    const qualityScore = data.qualityCompliance;

    // Calculate overall performance score (weighted average)
    const performanceScore =
      deliveryScore * 0.25 +
      ratingScore * 0.25 +
      onTimeScore * 0.2 +
      acceptanceScore * 0.15 +
      qualityScore * 0.15;

    // Assign tier based on performance score
    let tier: 'platinum' | 'gold' | 'silver' | 'bronze' | 'rookie';
    if (performanceScore >= 90) tier = 'platinum';
    else if (performanceScore >= 80) tier = 'gold';
    else if (performanceScore >= 70) tier = 'silver';
    else if (performanceScore >= 60) tier = 'bronze';
    else tier = 'rookie';

    // Calculate achievement badges
    const badges: string[] = [];
    if (data.deliveryCount >= 100) badges.push('century_club');
    if (data.deliveryCount >= 500) badges.push('delivery_master');
    if (data.rating >= 4.8) badges.push('five_star');
    if (data.onTimeRate >= 95) badges.push('punctuality_master');
    if (data.qualityCompliance >= 98) badges.push('quality_champion');
    
    // Calculate days on platform for veteran badges
    const daysOnPlatform = Math.floor(
      (now.getTime() - new Date(data.rider.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysOnPlatform >= 365) badges.push('one_year_veteran');
    if (daysOnPlatform >= 730) badges.push('two_year_veteran');

    // Top earner badge (top 10%)
    const earningsPercentile =
      (leaderboardData.filter((d) => d.totalEarnings > data.totalEarnings).length /
        leaderboardData.length) *
      100;
    if (earningsPercentile <= 10) badges.push('top_earner');

    return {
      ...data,
      performanceScore: Math.round(performanceScore * 100) / 100,
      tier,
      badges,
      earningsPerDelivery: data.deliveryCount > 0 ? data.totalEarnings / data.deliveryCount : 0,
    };
  });

  // Sort based on category
  let sortedData = [...scoredData];
  switch (category) {
    case 'overall':
      sortedData.sort((a, b) => b.performanceScore - a.performanceScore);
      break;
    case 'earnings':
      sortedData.sort((a, b) => b.totalEarnings - a.totalEarnings);
      break;
    case 'deliveries':
      sortedData.sort((a, b) => b.deliveryCount - a.deliveryCount);
      break;
    case 'rating':
      sortedData.sort((a, b) => b.rating - a.rating);
      break;
    case 'speed':
      sortedData.sort((a, b) => b.onTimeRate - a.onTimeRate);
      break;
  }

  // Add rank
  const rankedData = sortedData.map((data, index) => ({
    rank: index + 1,
    riderId: data.rider.riderId,
    name: data.rider.name || 'Unknown',
    email: data.rider.email,
    phone: data.rider.phone,
    status: data.rider.status,
    performanceScore: data.performanceScore,
    deliveries: data.deliveryCount,
    totalEarnings: data.totalEarnings,
    earningsPerDelivery: Math.round(data.earningsPerDelivery),
    rating: data.rating,
    onTimeRate: Math.round(data.onTimeRate * 100) / 100,
    acceptanceRate: Math.round(data.acceptanceRate * 100) / 100,
    qualityCompliance: Math.round(data.qualityCompliance * 100) / 100,
    avgDeliveryTime: Math.round(data.avgDeliveryTime * 100) / 100,
    tier: data.tier,
    badges: data.badges,
  }));

  // Calculate overall stats
  const stats = {
    totalRiders: rankedData.length,
    totalDeliveries: rankedData.reduce((sum, r) => sum + r.deliveries, 0),
    avgPerformanceScore:
      rankedData.length > 0
        ? Math.round(
            (rankedData.reduce((sum, r) => sum + r.performanceScore, 0) / rankedData.length) * 100
          ) / 100
        : 0,
    totalEarnings: rankedData.reduce((sum, r) => sum + r.totalEarnings, 0),
  };

  // Apply tier filter if specified
  let filteredData = rankedData;
  if (tier && tier !== 'all') {
    filteredData = rankedData.filter((r) => r.tier === tier);
  }

  // Apply pagination
  const paginatedData = filteredData.slice(offset, offset + limit);

  return {
    leaderboard: paginatedData,
    total: filteredData.length,
    stats,
  };
}

export async function get30DayTrend(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  // Get all orders for this rider in the last 30 days
  const riderOrders = await db
    .select({
      id: orders.id,
      status: orders.status,
      total: orders.total,
      createdAt: orders.createdAt,
      actualDeliveryTime: orders.actualDeliveryTime,
      estimatedDeliveryTime: orders.estimatedDeliveryTime,
    })
    .from(orders)
    .where(and(eq(orders.riderId, riderId), gte(orders.createdAt, thirtyDaysAgo)));

  // Get earnings for the last 30 days
  const riderEarningsData = await db
    .select({
      amount: riderEarnings.amount,
      bonus: riderEarnings.bonus,
      tip: riderEarnings.tip,
      createdAt: riderEarnings.createdAt,
    })
    .from(riderEarnings)
    .where(and(eq(riderEarnings.riderId, riderId), gte(riderEarnings.createdAt, thirtyDaysAgo)));

  // Group by date
  const dailyData: Record<
    string,
    { deliveries: number; earnings: number; onTimeCount: number; totalCount: number }
  > = {};

  // Initialize all 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo);
    date.setDate(thirtyDaysAgo.getDate() + i);
    const dateKey = date.toISOString().split('T')[0];
    dailyData[dateKey] = { deliveries: 0, earnings: 0, onTimeCount: 0, totalCount: 0 };
  }

  // Aggregate orders
  riderOrders.forEach((order) => {
    if (order.status === 'delivered' && order.createdAt) {
      const dateKey = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].deliveries += 1;
        dailyData[dateKey].totalCount += 1;

        // Check if on-time
        if (order.actualDeliveryTime && order.estimatedDeliveryTime) {
          if (new Date(order.actualDeliveryTime) <= new Date(order.estimatedDeliveryTime)) {
            dailyData[dateKey].onTimeCount += 1;
          }
        }
      }
    }
  });

  // Aggregate earnings
  riderEarningsData.forEach((earning) => {
    if (earning.createdAt) {
      const dateKey = new Date(earning.createdAt).toISOString().split('T')[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].earnings +=
          (earning.amount || 0) + (earning.bonus || 0) + (earning.tip || 0);
      }
    }
  });

  // Convert to array and calculate on-time rate
  const trendData = Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      deliveries: data.deliveries,
      earnings: data.earnings,
      onTimeRate: data.totalCount > 0 ? (data.onTimeCount / data.totalCount) * 100 : 0,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return trendData;
}

export async function getRiderPerformanceDetails(riderId: number, period: 'today' | 'week' | 'month' | 'all') {
  const db = await getDb();
  if (!db) return null;

  // Get rider info
  const rider = await db.select().from(riders).where(eq(riders.id, riderId)).limit(1);
  if (rider.length === 0) return null;

  // Calculate date range
  const now = new Date();
  let startDate: Date | null = null;

  switch (period) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + mondayOffset);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'all':
      startDate = null;
      break;
  }

  // Get orders
  const orderConditions = [eq(orders.riderId, riderId)];
  if (startDate) {
    orderConditions.push(gte(orders.createdAt, startDate));
  }

  const riderOrders = await db
    .select()
    .from(orders)
    .where(and(...orderConditions));
  const completedOrders = riderOrders.filter((o) => o.status === 'delivered');

  // Get earnings
  const earningsConditions = [eq(riderEarnings.riderId, riderId)];
  if (startDate) {
    earningsConditions.push(gte(riderEarnings.createdAt, startDate));
  }

  const earnings = await db
    .select()
    .from(riderEarnings)
    .where(and(...earningsConditions));

  // Calculate metrics
  const totalEarnings = earnings.reduce(
    (sum, e) => sum + (e.amount || 0) + (e.bonus || 0) + (e.tip || 0),
    0
  );
  const baseEarnings = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
  const bonusEarnings = earnings.reduce((sum, e) => sum + (e.bonus || 0), 0);
  const tipEarnings = earnings.reduce((sum, e) => sum + (e.tip || 0), 0);

  // Calculate on-time rate from completed orders
  const onTimeOrders = completedOrders.filter((o) => {
    if (!o.actualDeliveryTime || !o.estimatedDeliveryTime) return false;
    return new Date(o.actualDeliveryTime) <= new Date(o.estimatedDeliveryTime);
  });
  const onTimeRate = completedOrders.length > 0 ? (onTimeOrders.length / completedOrders.length) * 100 : 0;

  // Calculate quality photo rate (orders with notes - as proxy for quality verification)
  const ordersWithPhoto = completedOrders.filter((o) => o.notes);
  const qualityPhotoRate = completedOrders.length > 0 ? (ordersWithPhoto.length / completedOrders.length) * 100 : 0;

  return {
    rider: rider[0],
    deliveries: completedOrders.length,
    totalEarnings,
    earningsBreakdown: {
      base: baseEarnings,
      bonus: bonusEarnings,
      tips: tipEarnings,
    },
    rating: rider[0].rating || 0,
    acceptanceRate: rider[0].acceptanceRate || 0,
    onTimeRate: Math.round(onTimeRate * 10) / 10,
    qualityPhotoRate: Math.round(qualityPhotoRate * 10) / 10,
  };
}

/**
 * Compare two riders side-by-side with performance metrics and trends
 */
export async function compareRiders(
  riderId1: number,
  riderId2: number,
  period: 'today' | 'week' | 'month' | 'all' = 'all'
) {
  const db = await getDb();
  if (!db) return null;

  // Fetch both riders' details in parallel
  const [rider1Details, rider2Details, rider1Trend, rider2Trend] = await Promise.all([
    getRiderPerformanceDetails(riderId1, period),
    getRiderPerformanceDetails(riderId2, period),
    get30DayTrend(riderId1),
    get30DayTrend(riderId2),
  ]);

  if (!rider1Details || !rider2Details) {
    return null;
  }

  // Calculate performance score for each rider
  const calculateScore = (details: NonNullable<Awaited<ReturnType<typeof getRiderPerformanceDetails>>>) => {
    const deliveryScore = Math.min(details.deliveries / 100, 1) * 25;
    const ratingScore = (details.rating / 5) * 25;
    const onTimeScore = details.onTimeRate * 0.2;
    const acceptanceScore = details.acceptanceRate * 0.15;
    const qualityScore = details.qualityPhotoRate * 0.15;
    return deliveryScore + ratingScore + onTimeScore + acceptanceScore + qualityScore;
  };

  const rider1Score = calculateScore(rider1Details);
  const rider2Score = calculateScore(rider2Details);

  // Determine winner for each metric
  const comparison = {
    rider1: {
      ...rider1Details,
      performanceScore: Math.round(rider1Score * 10) / 10,
      trend: rider1Trend,
    },
    rider2: {
      ...rider2Details,
      performanceScore: Math.round(rider2Score * 10) / 10,
      trend: rider2Trend,
    },
    winners: {
      performanceScore: rider1Score > rider2Score ? 1 : rider1Score < rider2Score ? 2 : 0,
      deliveries: rider1Details.deliveries > rider2Details.deliveries ? 1 : rider1Details.deliveries < rider2Details.deliveries ? 2 : 0,
      earnings: rider1Details.totalEarnings > rider2Details.totalEarnings ? 1 : rider1Details.totalEarnings < rider2Details.totalEarnings ? 2 : 0,
      rating: rider1Details.rating > rider2Details.rating ? 1 : rider1Details.rating < rider2Details.rating ? 2 : 0,
      onTimeRate: rider1Details.onTimeRate > rider2Details.onTimeRate ? 1 : rider1Details.onTimeRate < rider2Details.onTimeRate ? 2 : 0,
      acceptanceRate: rider1Details.acceptanceRate > rider2Details.acceptanceRate ? 1 : rider1Details.acceptanceRate < rider2Details.acceptanceRate ? 2 : 0,
      qualityPhotoRate: rider1Details.qualityPhotoRate > rider2Details.qualityPhotoRate ? 1 : rider1Details.qualityPhotoRate < rider2Details.qualityPhotoRate ? 2 : 0,
    },
    differences: {
      performanceScore: Math.round((rider1Score - rider2Score) * 10) / 10,
      deliveries: rider1Details.deliveries - rider2Details.deliveries,
      earnings: rider1Details.totalEarnings - rider2Details.totalEarnings,
      rating: Math.round((rider1Details.rating - rider2Details.rating) * 10) / 10,
      onTimeRate: Math.round((rider1Details.onTimeRate - rider2Details.onTimeRate) * 10) / 10,
      acceptanceRate: Math.round((rider1Details.acceptanceRate - rider2Details.acceptanceRate) * 10) / 10,
      qualityPhotoRate: Math.round((rider1Details.qualityPhotoRate - rider2Details.qualityPhotoRate) * 10) / 10,
    },
  };

  return comparison;
}

// ============================================================================
// TIER PROMOTION SYSTEM
// ============================================================================

import { notifyOwner } from './_core/notification';

/**
 * Check and update rider tier based on current performance
 * Returns true if tier changed, false otherwise
 */
export async function checkAndUpdateRiderTier(riderId: number): Promise<{
  tierChanged: boolean;
  previousTier: string | null;
  newTier: string;
  performanceScore: number;
} | null> {
  const db = await getDb();
  if (!db) return null;

  // Get current leaderboard data for this rider
  const leaderboard = await getRiderLeaderboard({
    period: 'all',
    category: 'overall',
    limit: 1000,
    offset: 0,
  });

  const riderData = leaderboard.leaderboard.find((r) => r.riderId === riderId);
  if (!riderData) return null;

  // Get rider's current tier from database (if stored) or from history
  const historyResult = await db
    .select()
    .from(riderTierHistory)
    .where(eq(riderTierHistory.riderId, riderId))
    .orderBy(desc(riderTierHistory.promotionDate))
    .limit(1);

  const previousTier = historyResult[0]?.newTier || null;
  const newTier = riderData.tier;

  // Check if tier changed
  if (previousTier === newTier) {
    return {
      tierChanged: false,
      previousTier,
      newTier,
      performanceScore: riderData.performanceScore,
    };
  }

  // Record tier change in history
  await db.insert(riderTierHistory).values({
    riderId,
    previousTier: previousTier as any,
    newTier: newTier as any,
    performanceScore: Math.round(riderData.performanceScore),
    notificationSent: 0,
  });

  return {
    tierChanged: true,
    previousTier,
    newTier,
    performanceScore: riderData.performanceScore,
  };
}

/**
 * Send tier promotion notification to rider
 */
export async function sendTierPromotionNotification(riderId: number, promotionData: {
  previousTier: string | null;
  newTier: string;
  performanceScore: number;
}): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get rider details
  const riderResult = await db
    .select()
    .from(riders)
    .where(eq(riders.id, riderId))
    .limit(1);

  if (riderResult.length === 0) return false;
  const rider = riderResult[0];

  // Generate congratulatory message
  const tierEmojis: Record<string, string> = {
    platinum: '🏆',
    gold: '🥇',
    silver: '🥈',
    bronze: '🥉',
    rookie: '🔰',
  };

  const tierNames: Record<string, string> = {
    platinum: 'Platinum',
    gold: 'Gold',
    silver: 'Silver',
    bronze: 'Bronze',
    rookie: 'Rookie',
  };

  const nextTierRequirements: Record<string, string> = {
    gold: 'Reach 90+ performance score to unlock Platinum tier',
    silver: 'Reach 75+ performance score to unlock Gold tier',
    bronze: 'Reach 60+ performance score to unlock Silver tier',
    rookie: 'Reach 45+ performance score to unlock Bronze tier',
  };

  const emoji = tierEmojis[promotionData.newTier] || '🎉';
  const tierName = tierNames[promotionData.newTier] || promotionData.newTier;
  const previousTierName = promotionData.previousTier
    ? tierNames[promotionData.previousTier]
    : 'Unranked';

  let title = `${emoji} Congratulations! You've been promoted to ${tierName} Tier!`;
  let content = `Great news, ${rider.name}!\n\n`;

  if (promotionData.previousTier) {
    content += `You've advanced from ${previousTierName} to ${tierName} tier with a performance score of ${Math.round(promotionData.performanceScore)}!\n\n`;
  } else {
    content += `You've achieved ${tierName} tier with a performance score of ${Math.round(promotionData.performanceScore)}!\n\n`;
  }

  content += `Your hard work and dedication have paid off. Keep up the excellent service!\n\n`;

  if (promotionData.newTier !== 'platinum') {
    const nextReq = nextTierRequirements[promotionData.newTier];
    if (nextReq) {
      content += `Next Goal: ${nextReq}`;
    }
  } else {
    content += `You're now at the highest tier! Maintain your excellence to stay at the top.`;
  }

  // Use the existing notifyOwner function as a placeholder
  // In production, this should send to the rider via push notification or SMS
  try {
    await notifyOwner({
      title,
      content: `Rider ${rider.name} (ID: ${riderId}) promoted to ${tierName} tier`,
    });

    // Mark notification as sent in tier history
    await db
      .update(riderTierHistory)
      .set({
        notificationSent: 1,
        notificationSentAt: new Date(),
      })
      .where(
        and(
          eq(riderTierHistory.riderId, riderId),
          eq(riderTierHistory.newTier, promotionData.newTier as any)
        )
      );

    return true;
  } catch (error) {
    console.error('Failed to send tier promotion notification:', error);
    return false;
  }
}

/**
 * Check all riders for tier promotions
 * Returns count of riders promoted
 */
export async function checkAllRiderTierPromotions(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Get all approved riders
  const allRiders = await db
    .select({ id: riders.id })
    .from(riders)
    .where(eq(riders.status, 'approved'));

  let promotedCount = 0;

  for (const rider of allRiders) {
    const result = await checkAndUpdateRiderTier(rider.id);
    
    if (result && result.tierChanged) {
      // Send notification
      await sendTierPromotionNotification(rider.id, {
        previousTier: result.previousTier,
        newTier: result.newTier,
        performanceScore: result.performanceScore,
      });
      promotedCount++;
    }
  }

  return promotedCount;
}

/**
 * Get tier promotion history for a rider
 */
export async function getRiderTierHistory(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  const history = await db
    .select()
    .from(riderTierHistory)
    .where(eq(riderTierHistory.riderId, riderId))
    .orderBy(desc(riderTierHistory.promotionDate));

  return history;
}

// ============================================================================
// FINANCIAL OVERVIEW DASHBOARD
// ============================================================================

/**
 * Get comprehensive financial overview
 */
export async function getFinancialDashboard(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      previousEndDate = new Date(startDate);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      startDate = new Date(now);
      startDate.setDate(now.getDate() - dayOfWeek);
      startDate.setHours(0, 0, 0, 0);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      previousEndDate = new Date(startDate);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEndDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      previousStartDate = new Date(now.getFullYear() - 1, 0, 1);
      previousEndDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      break;
  }

  // Current period revenue
  const [currentRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, 'paid'),
        gte(orders.createdAt, startDate)
      )
    );

  // Previous period revenue
  const [previousRevenue] = await db
    .select({ total: sql<number>`COALESCE(SUM(${orders.total}), 0)` })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, 'paid'),
        gte(orders.createdAt, previousStartDate),
        lte(orders.createdAt, previousEndDate)
      )
    );

  // Current period commissions
  const [currentCommissions] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${riderEarnings.amount}), 0) AS SIGNED)` })
    .from(riderEarnings)
    .where(gte(riderEarnings.createdAt, startDate));

  // Previous period commissions
  const [previousCommissions] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${riderEarnings.amount}), 0) AS SIGNED)` })
    .from(riderEarnings)
    .where(
      and(
        gte(riderEarnings.createdAt, previousStartDate),
        lte(riderEarnings.createdAt, previousEndDate)
      )
    );

  // Current period payouts
  const [currentPayouts] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${payouts.amount}), 0) AS SIGNED)` })
    .from(payouts)
    .where(gte(payouts.createdAt, startDate));

  // Previous period payouts
  const [previousPayouts] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${payouts.amount}), 0) AS SIGNED)` })
    .from(payouts)
    .where(
      and(
        gte(payouts.createdAt, previousStartDate),
        lte(payouts.createdAt, previousEndDate)
      )
    );

  // Order count
  const [currentOrders] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, 'paid'),
        gte(orders.createdAt, startDate)
      )
    );

  const [previousOrders] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, 'paid'),
        gte(orders.createdAt, previousStartDate),
        lte(orders.createdAt, previousEndDate)
      )
    );

  // Calculate growth percentages
  const revenueGrowth = previousRevenue.total > 0
    ? ((currentRevenue.total - previousRevenue.total) / previousRevenue.total) * 100
    : 0;

  const commissionsGrowth = previousCommissions.total > 0
    ? ((currentCommissions.total - previousCommissions.total) / previousCommissions.total) * 100
    : 0;

  const payoutsGrowth = previousPayouts.total > 0
    ? ((currentPayouts.total - previousPayouts.total) / previousPayouts.total) * 100
    : 0;

  const ordersGrowth = previousOrders.count > 0
    ? ((currentOrders.count - previousOrders.count) / previousOrders.count) * 100
    : 0;

  return {
    current: {
      revenue: currentRevenue.total,
      commissions: currentCommissions.total,
      payouts: currentPayouts.total,
      orders: currentOrders.count,
    },
    previous: {
      revenue: previousRevenue.total,
      commissions: previousCommissions.total,
      payouts: previousPayouts.total,
      orders: previousOrders.count,
    },
    growth: {
      revenue: revenueGrowth,
      commissions: commissionsGrowth,
      payouts: payoutsGrowth,
      orders: ordersGrowth,
    },
    period,
  };
}

/**
 * Get revenue trends over time
 */
export async function getRevenueTrends(days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await db
    .select({
      date: sql<string>`DATE(${orders.createdAt})`.as('date'),
      revenue: sql<number>`CAST(COALESCE(SUM(${orders.total}), 0) AS SIGNED)`,
      orderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(
      and(
        eq(orders.paymentStatus, 'paid'),
        gte(orders.createdAt, startDate)
      )
    )
    .groupBy(sql`DATE(${orders.createdAt})`)
    .orderBy(sql`DATE(${orders.createdAt})`);

  return trends;
}

/**
 * Get commission summary breakdown
 */
export async function getCommissionSummary() {
  const db = await getDb();
  if (!db) return null;

  // Total commissions by type
  const [platformCommission] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${orders.total} * 0.10), 0) AS SIGNED)` })
    .from(orders)
    .where(eq(orders.paymentStatus, 'paid'));

  const [riderCommissions] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${riderEarnings.amount}), 0) AS SIGNED)` })
    .from(riderEarnings);

  const [deliveryFees] = await db
    .select({ total: sql<number>`CAST(COALESCE(SUM(${orders.deliveryFee}), 0) AS SIGNED)` })
    .from(orders)
    .where(eq(orders.paymentStatus, 'paid'));

  return {
    platformCommission: platformCommission.total,
    riderCommissions: riderCommissions.total,
    deliveryFees: deliveryFees.total,
    total: platformCommission.total + riderCommissions.total + deliveryFees.total,
  };
}

/**
 * Get payout statuses summary
 */
export async function getPayoutStatuses() {
  const db = await getDb();
  if (!db) return null;

  const statusCounts = await db
    .select({
      status: payouts.status,
      count: sql<number>`COUNT(*)`,
      total: sql<number>`CAST(COALESCE(SUM(${payouts.amount}), 0) AS SIGNED)`,
    })
    .from(payouts)
    .groupBy(payouts.status);

  const summary = {
    pending: { count: 0, total: 0 },
    completed: { count: 0, total: 0 },
    failed: { count: 0, total: 0 },
  };

  statusCounts.forEach((item) => {
    if (item.status in summary) {
      summary[item.status as keyof typeof summary] = {
        count: item.count,
        total: item.total,
      };
    }
  });

  return summary;
}

/**
 * Get top revenue categories
 */
export async function getTopRevenueCategories(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const topCategories = await db
    .select({
      categoryId: products.categoryId,
      categoryName: categories.name,
      revenue: sql<number>`COALESCE(SUM(${orderItems.quantity} * ${orderItems.price}), 0)`,
      orderCount: sql<number>`COUNT(DISTINCT ${orders.id})`,
    })
    .from(orderItems)
    .leftJoin(orders, eq(orderItems.orderId, orders.id))
    .leftJoin(products, eq(orderItems.productId, products.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(orders.paymentStatus, 'paid'))
    .groupBy(products.categoryId, categories.name)
    .orderBy(desc(sql`SUM(${orderItems.quantity} * ${orderItems.price})`))
    .limit(limit);

  return topCategories;
}

/**
 * Get revenue by payment method
 */
export async function getRevenueByPaymentMethod() {
  const db = await getDb();
  if (!db) return [];

  const paymentMethods = await db
    .select({
      paymentMethod: orders.paymentMethod,
      revenue: sql<number>`COALESCE(SUM(${orders.total}), 0)`,
      orderCount: sql<number>`COUNT(*)`,
    })
    .from(orders)
    .where(eq(orders.paymentStatus, 'paid'))
    .groupBy(orders.paymentMethod);

  return paymentMethods;
}


// ============================================================================
// INVENTORY ALERTS FUNCTIONS
// ============================================================================

/**
 * Get inventory alerts with filtering
 */
export async function getInventoryAlerts(filters?: {
  severity?: "critical" | "warning" | "info";
  status?: "active" | "resolved" | "dismissed";
  alertType?: "low_stock" | "out_of_stock" | "overstocked";
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      id: inventoryAlerts.id,
      productId: inventoryAlerts.productId,
      productName: products.name,
      alertType: inventoryAlerts.alertType,
      threshold: inventoryAlerts.threshold,
      currentStock: inventoryAlerts.currentStock,
      severity: inventoryAlerts.severity,
      status: inventoryAlerts.status,
      resolvedAt: inventoryAlerts.resolvedAt,
      resolvedBy: inventoryAlerts.resolvedBy,
      notes: inventoryAlerts.notes,
      createdAt: inventoryAlerts.createdAt,
      updatedAt: inventoryAlerts.updatedAt,
    })
    .from(inventoryAlerts)
    .leftJoin(products, eq(inventoryAlerts.productId, products.id))
    .$dynamic();

  const conditions = [];
  if (filters?.severity) {
    conditions.push(eq(inventoryAlerts.severity, filters.severity));
  }
  if (filters?.status) {
    conditions.push(eq(inventoryAlerts.status, filters.status));
  }
  if (filters?.alertType) {
    conditions.push(eq(inventoryAlerts.alertType, filters.alertType));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const alerts = await query.orderBy(desc(inventoryAlerts.createdAt));
  return alerts;
}

// Removed duplicate - using the original version above

// Removed duplicate - using the original version above

/**
 * Update alert threshold for a product
 */
export async function updateInventoryThreshold(productId: number, thresholds: {
  lowStockThreshold: number;
  criticalStockThreshold: number;
  overstockThreshold?: number;
  autoReorder?: boolean;
  reorderQuantity?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  // Check if threshold exists
  const existing = await db
    .select()
    .from(inventoryThresholds)
    .where(eq(inventoryThresholds.productId, productId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(inventoryThresholds)
      .set({
        ...thresholds,
        autoReorder: thresholds.autoReorder ? 1 : 0,
      })
      .where(eq(inventoryThresholds.productId, productId));
  } else {
    await db.insert(inventoryThresholds).values({
      productId,
      ...thresholds,
      autoReorder: thresholds.autoReorder ? 1 : 0,
    });
  }

  return true;
}

/**
 * Get inventory threshold for a product
 */
export async function getInventoryThreshold(productId: number) {
  const db = await getDb();
  if (!db) return null;

  const [threshold] = await db
    .select()
    .from(inventoryThresholds)
    .where(eq(inventoryThresholds.productId, productId))
    .limit(1);

  return threshold || null;
}

// ============================================================================
// USER VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Get verification requests with filtering
 */
export async function getVerificationRequests(filters?: {
  userType?: "customer" | "seller" | "rider";
  status?: "pending" | "approved" | "rejected" | "more_info_needed";
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      id: verificationRequests.id,
      userId: verificationRequests.userId,
      userType: verificationRequests.userType,
      userName: users.name,
      userEmail: users.email,
      documentType: verificationRequests.documentType,
      documentUrl: verificationRequests.documentUrl,
      additionalDocuments: verificationRequests.additionalDocuments,
      status: verificationRequests.status,
      reviewedBy: verificationRequests.reviewedBy,
      reviewedAt: verificationRequests.reviewedAt,
      rejectionReason: verificationRequests.rejectionReason,
      notes: verificationRequests.notes,
      submittedAt: verificationRequests.submittedAt,
      createdAt: verificationRequests.createdAt,
      updatedAt: verificationRequests.updatedAt,
    })
    .from(verificationRequests)
    .leftJoin(users, eq(verificationRequests.userId, users.id))
    .$dynamic();

  const conditions = [];
  if (filters?.userType) {
    conditions.push(eq(verificationRequests.userType, filters.userType));
  }
  if (filters?.status) {
    conditions.push(eq(verificationRequests.status, filters.status));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const requests = await query.orderBy(desc(verificationRequests.submittedAt));
  return requests;
}

/**
 * Approve verification request
 */
export async function approveVerification(requestId: number, reviewedBy: number, notes?: string) {
  const db = await getDb();
  if (!db) return null;

  // Get the request details first for notification
  const request = await db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.id, requestId))
    .limit(1);

  if (!request[0]) return null;

  // Get user details based on userType
  let userDetails: { email?: string | null; phone?: string | null; name?: string | null } = {};
  if (request[0].userType === 'rider') {
    const rider = await db.select().from(riders).where(eq(riders.id, request[0].userId)).limit(1);
    if (rider[0]) {
      userDetails = { email: rider[0].email, phone: rider[0].phone, name: rider[0].name };
    }
  } else {
    const user = await db.select().from(users).where(eq(users.id, request[0].userId)).limit(1);
    if (user[0]) {
      userDetails = { email: user[0].email, phone: user[0].phone, name: user[0].name };
    }
  }

  await db
    .update(verificationRequests)
    .set({
      status: "approved",
      reviewedBy,
      reviewedAt: new Date(),
      notes,
    })
    .where(eq(verificationRequests.id, requestId));

  return {
    success: true,
    userId: request[0].userId,
    email: userDetails.email || null,
    phone: userDetails.phone || null,
    userName: userDetails.name || null,
    userType: request[0].userType,
  };
}

/**
 * Reject verification request
 */
export async function rejectVerification(requestId: number, reviewedBy: number, rejectionReason: string, notes?: string) {
  const db = await getDb();
  if (!db) return null;

  // Get the request details first for notification
  const request = await db
    .select()
    .from(verificationRequests)
    .where(eq(verificationRequests.id, requestId))
    .limit(1);

  if (!request[0]) return null;

  // Get user details based on userType
  let userDetails: { email?: string | null; phone?: string | null; name?: string | null } = {};
  if (request[0].userType === 'rider') {
    const rider = await db.select().from(riders).where(eq(riders.id, request[0].userId)).limit(1);
    if (rider[0]) {
      userDetails = { email: rider[0].email, phone: rider[0].phone, name: rider[0].name };
    }
  } else {
    const user = await db.select().from(users).where(eq(users.id, request[0].userId)).limit(1);
    if (user[0]) {
      userDetails = { email: user[0].email, phone: user[0].phone, name: user[0].name };
    }
  }

  await db
    .update(verificationRequests)
    .set({
      status: "rejected",
      reviewedBy,
      reviewedAt: new Date(),
      rejectionReason,
      notes,
    })
    .where(eq(verificationRequests.id, requestId));

  return {
    success: true,
    userId: request[0].userId,
    email: userDetails.email || null,
    phone: userDetails.phone || null,
    userName: userDetails.name || null,
    userType: request[0].userType,
  };
}

/**
 * Request more information for verification
 */
export async function requestMoreInfo(requestId: number, reviewedBy: number, notes: string) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(verificationRequests)
    .set({
      status: "more_info_needed",
      reviewedBy,
      reviewedAt: new Date(),
      notes,
    })
    .where(eq(verificationRequests.id, requestId));

  return true;
}

// ============================================================================
// PLATFORM STATISTICS FUNCTIONS
// ============================================================================

/**
 * Get current platform statistics
 */
export async function getPlatformStatistics() {
  const db = await getDb();
  if (!db) return null;

  // Get active users (online in last 5 minutes)
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const [activeUsersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users)
    .where(gte(users.lastSignedIn, fiveMinutesAgo));

  // Get concurrent orders (in progress)
  const [concurrentOrdersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(orders)
    .where(
      or(
        eq(orders.status, "confirmed"),
        eq(orders.status, "rider_assigned"),
        eq(orders.status, "in_transit"),
        eq(orders.status, "quality_verification")
      )
    );

  // Get rider availability
  const [availableRidersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(riders)
    .where(eq(riders.status, "approved"));

  const [busyRidersResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${orders.riderId})` })
    .from(orders)
    .where(
      and(
        or(
          eq(orders.status, "rider_assigned"),
          eq(orders.status, "in_transit"),
          eq(orders.status, "quality_verification")
        ),
        sql`${orders.riderId} IS NOT NULL`
      )
    );

  // Get latest platform statistics record
  const [latestStats] = await db
    .select()
    .from(platformStatistics)
    .orderBy(desc(platformStatistics.timestamp))
    .limit(1);

  return {
    activeUsers: activeUsersResult.count,
    concurrentOrders: concurrentOrdersResult.count,
    availableRiders: availableRidersResult.count,
    busyRiders: busyRidersResult.count,
    offlineRiders: availableRidersResult.count - busyRidersResult.count,
    avgResponseTime: latestStats?.avgResponseTime || 0,
    errorRate: latestStats?.errorRate || 0,
    systemUptime: latestStats?.systemUptime || 9999, // 99.99%
    apiCallVolume: latestStats?.apiCallVolume || 0,
    databaseConnections: latestStats?.databaseConnections || 0,
    memoryUsage: latestStats?.memoryUsage || 0,
    cpuUsage: latestStats?.cpuUsage || 0,
    timestamp: new Date(),
  };
}

/**
 * Record platform statistics snapshot
 */
export async function recordPlatformStatistics(stats: {
  activeUsers: number;
  concurrentOrders: number;
  availableRiders: number;
  busyRiders: number;
  offlineRiders: number;
  avgResponseTime: number;
  errorRate: number;
  systemUptime: number;
  apiCallVolume: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(platformStatistics).values(stats);
  return result.insertId;
}

/**
 * Get historical platform statistics
 */
export async function getHistoricalStatistics(hours: number = 24) {
  const db = await getDb();
  if (!db) return [];

  const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

  const stats = await db
    .select()
    .from(platformStatistics)
    .where(gte(platformStatistics.timestamp, startTime))
    .orderBy(platformStatistics.timestamp);

  return stats;
}

// ============================================================================
// DISPUTE RESOLUTION FUNCTIONS
// ============================================================================

/**
 * Get disputes with filtering
 */
export async function getDisputes(filters?: {
  status?: "open" | "investigating" | "resolved" | "escalated" | "closed";
  priority?: "low" | "medium" | "high" | "urgent";
  disputeType?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select({
      id: disputes.id,
      disputeNumber: disputes.disputeNumber,
      orderId: disputes.orderId,
      orderNumber: orders.orderNumber,
      customerId: disputes.customerId,
      customerName: users.name,
      riderId: disputes.riderId,
      sellerId: disputes.sellerId,
      disputeType: disputes.disputeType,
      status: disputes.status,
      priority: disputes.priority,
      subject: disputes.subject,
      description: disputes.description,
      resolutionType: disputes.resolutionType,
      resolutionAmount: disputes.resolutionAmount,
      resolutionNotes: disputes.resolutionNotes,
      assignedTo: disputes.assignedTo,
      resolvedBy: disputes.resolvedBy,
      resolvedAt: disputes.resolvedAt,
      escalatedAt: disputes.escalatedAt,
      createdAt: disputes.createdAt,
      updatedAt: disputes.updatedAt,
    })
    .from(disputes)
    .leftJoin(orders, eq(disputes.orderId, orders.id))
    .leftJoin(users, eq(disputes.customerId, users.id))
    .$dynamic();

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(disputes.status, filters.status));
  }
  if (filters?.priority) {
    conditions.push(eq(disputes.priority, filters.priority));
  }
  if (filters?.disputeType) {
    conditions.push(eq(disputes.disputeType, filters.disputeType as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  const disputeList = await query.orderBy(desc(disputes.createdAt));
  return disputeList;
}

/**
 * Get dispute details with messages
 */
export async function getDisputeDetails(disputeId: number) {
  const db = await getDb();
  if (!db) return null;

  const [dispute] = await db
    .select({
      id: disputes.id,
      disputeNumber: disputes.disputeNumber,
      orderId: disputes.orderId,
      orderNumber: orders.orderNumber,
      customerId: disputes.customerId,
      customerName: users.name,
      customerEmail: users.email,
      riderId: disputes.riderId,
      sellerId: disputes.sellerId,
      disputeType: disputes.disputeType,
      status: disputes.status,
      priority: disputes.priority,
      subject: disputes.subject,
      description: disputes.description,
      resolutionType: disputes.resolutionType,
      resolutionAmount: disputes.resolutionAmount,
      resolutionNotes: disputes.resolutionNotes,
      assignedTo: disputes.assignedTo,
      resolvedBy: disputes.resolvedBy,
      resolvedAt: disputes.resolvedAt,
      escalatedAt: disputes.escalatedAt,
      createdAt: disputes.createdAt,
      updatedAt: disputes.updatedAt,
    })
    .from(disputes)
    .leftJoin(orders, eq(disputes.orderId, orders.id))
    .leftJoin(users, eq(disputes.customerId, users.id))
    .where(eq(disputes.id, disputeId))
    .limit(1);

  if (!dispute) return null;

  // Get messages
  const messages = await db
    .select()
    .from(disputeMessages)
    .where(eq(disputeMessages.disputeId, disputeId))
    .orderBy(disputeMessages.createdAt);

  return {
    ...dispute,
    messages,
  };
}

/**
 * Create dispute
 */
export async function createDispute(dispute: {
  orderId: number;
  customerId: number;
  riderId?: number;
  sellerId?: number;
  disputeType: string;
  priority?: "low" | "medium" | "high" | "urgent";
  subject: string;
  description: string;
}) {
  const db = await getDb();
  if (!db) return null;

  // Generate dispute number
  const disputeNumber = `DSP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const [result] = await db.insert(disputes).values({
    ...dispute,
    disputeNumber,
    disputeType: dispute.disputeType as any,
    priority: dispute.priority || "medium",
  });

  return result.insertId;
}

/**
 * Add message to dispute
 */
export async function addDisputeMessage(message: {
  disputeId: number;
  senderId: number;
  senderType: "customer" | "admin" | "rider" | "seller";
  message: string;
  attachments?: string;
  isInternal?: boolean;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(disputeMessages).values({
    ...message,
    isInternal: message.isInternal ? 1 : 0,
  });

  return result.insertId;
}

/**
 * Resolve dispute
 */
export async function resolveDispute(
  disputeId: number,
  resolvedBy: number,
  resolution: {
    resolutionType: "refund" | "replacement" | "compensation" | "dismissed" | "other";
    resolutionAmount?: number;
    resolutionNotes: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(disputes)
    .set({
      status: "resolved",
      resolvedBy,
      resolvedAt: new Date(),
      ...resolution,
    })
    .where(eq(disputes.id, disputeId));

  return true;
}

/**
 * Escalate dispute
 */
export async function escalateDispute(disputeId: number, assignedTo: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(disputes)
    .set({
      status: "escalated",
      escalatedAt: new Date(),
      assignedTo,
    })
    .where(eq(disputes.id, disputeId));

  return true;
}

/**
 * Update dispute status
 */
export async function updateDisputeStatus(
  disputeId: number,
  status: "open" | "investigating" | "resolved" | "escalated" | "closed"
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(disputes)
    .set({ status })
    .where(eq(disputes.id, disputeId));

  return true;
}


// ============================================================================
// Rider Performance Leaderboard
// ============================================================================
// Note: getRiderLeaderboard is already defined earlier in this file (line ~2781)
// with more comprehensive parameters. Using that implementation.

/**
 * Get rider achievements
 */
export async function getRiderAchievements(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  const achievements = await db
    .select()
    .from(riderAchievements)
    .where(eq(riderAchievements.riderId, riderId))
    .orderBy(desc(riderAchievements.earnedAt));

  return achievements;
}

/**
 * Award achievement to rider
 */
export async function awardRiderAchievement(achievement: {
  riderId: number;
  achievementType: string;
  metadata?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(riderAchievements).values(achievement as any);
  return result.insertId;
}

// ============================================================================
// System Settings
// ============================================================================

/**
 * Get all system settings
 */
export async function getSystemSettings(category?: string) {
  const db = await getDb();
  if (!db) return [];

  const whereClause = category ? eq(systemSettings.category, category as any) : undefined;

  const settings = await db
    .select()
    .from(systemSettings)
    .where(whereClause)
    .orderBy(systemSettings.category, systemSettings.settingKey);
  return settings;
}

/**
 * Get single system setting by key
 */
export async function getSystemSetting(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(systemSettings)
    .where(eq(systemSettings.settingKey, key))
    .limit(1);

  return result[0] || null;
}

/**
 * Update system setting
 */
export async function updateSystemSetting(
  key: string,
  value: string,
  updatedBy: number
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(systemSettings)
    .set({
      settingValue: value,
      updatedBy,
      updatedAt: new Date(),
    })
    .where(eq(systemSettings.settingKey, key));

  return true;
}

/**
 * Create system setting
 */
export async function createSystemSetting(setting: {
  settingKey: string;
  settingValue: string;
  settingType: "string" | "number" | "boolean" | "json";
  category: string;
  description?: string;
  isPublic?: boolean;
  updatedBy?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(systemSettings).values({
    ...setting,
    isPublic: setting.isPublic ? 1 : 0,
  } as any);

  return result.insertId;
}

// ============================================================================
// Content Moderation
// ============================================================================

/**
 * Get content moderation queue
 */
export async function getContentModerationQueue(filters?: {
  status?: string;
  contentType?: string;
  priority?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(contentModerationQueue.status, filters.status as any));
  }
  if (filters?.contentType) {
    conditions.push(eq(contentModerationQueue.contentType, filters.contentType as any));
  }
  if (filters?.priority) {
    conditions.push(eq(contentModerationQueue.priority, filters.priority as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const items = await db
    .select({
      id: contentModerationQueue.id,
      contentType: contentModerationQueue.contentType,
      contentId: contentModerationQueue.contentId,
      userId: contentModerationQueue.userId,
      userName: users.name,
      userEmail: users.email,
      contentUrl: contentModerationQueue.contentUrl,
      contentText: contentModerationQueue.contentText,
      status: contentModerationQueue.status,
      priority: contentModerationQueue.priority,
      flagReason: contentModerationQueue.flagReason,
      moderatorId: contentModerationQueue.moderatorId,
      moderatorNotes: contentModerationQueue.moderatorNotes,
      moderatedAt: contentModerationQueue.moderatedAt,
      createdAt: contentModerationQueue.createdAt,
    })
    .from(contentModerationQueue)
    .leftJoin(users, eq(users.id, contentModerationQueue.userId))
    .where(whereClause)
    .orderBy(
      desc(contentModerationQueue.priority),
      desc(contentModerationQueue.createdAt)
    );

  return items;
}

/**
 * Moderate content item
 */
export async function moderateContent(
  itemId: number,
  moderatorId: number,
  decision: {
    status: "approved" | "rejected" | "flagged";
    moderatorNotes?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(contentModerationQueue)
    .set({
      status: decision.status,
      moderatorId,
      moderatorNotes: decision.moderatorNotes,
      moderatedAt: new Date(),
    })
    .where(eq(contentModerationQueue.id, itemId));

  return true;
}

/**
 * Add content to moderation queue
 */
export async function addToModerationQueue(item: {
  contentType: string;
  contentId: number;
  userId: number;
  contentUrl?: string;
  contentText?: string;
  contentMetadata?: string;
  priority?: string;
  flagReason?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(contentModerationQueue).values({
    ...item,
    priority: (item.priority as any) || "medium",
  } as any);

  return result.insertId;
}

// ============================================================================
// Fraud Detection
// ============================================================================

/**
 * Get fraud alerts
 */
export async function getFraudAlerts(filters?: {
  status?: string;
  severity?: string;
  alertType?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(fraudAlerts.status, filters.status as any));
  }
  if (filters?.severity) {
    conditions.push(eq(fraudAlerts.severity, filters.severity as any));
  }
  if (filters?.alertType) {
    conditions.push(eq(fraudAlerts.alertType, filters.alertType as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const alerts = await db
    .select({
      id: fraudAlerts.id,
      alertType: fraudAlerts.alertType,
      userId: fraudAlerts.userId,
      userName: users.name,
      userEmail: users.email,
      orderId: fraudAlerts.orderId,
      riskScore: fraudAlerts.riskScore,
      severity: fraudAlerts.severity,
      description: fraudAlerts.description,
      detectionMethod: fraudAlerts.detectionMethod,
      evidenceData: fraudAlerts.evidenceData,
      status: fraudAlerts.status,
      assignedTo: fraudAlerts.assignedTo,
      investigationNotes: fraudAlerts.investigationNotes,
      actionTaken: fraudAlerts.actionTaken,
      resolvedAt: fraudAlerts.resolvedAt,
      createdAt: fraudAlerts.createdAt,
    })
    .from(fraudAlerts)
    .leftJoin(users, eq(users.id, fraudAlerts.userId))
    .where(whereClause)
    .orderBy(
      desc(fraudAlerts.severity),
      desc(fraudAlerts.riskScore),
      desc(fraudAlerts.createdAt)
    );

  return alerts;
}

/**
 * Create fraud alert
 */
export async function createFraudAlert(alert: {
  alertType: string;
  userId?: number;
  orderId?: number;
  riskScore: number;
  severity: string;
  description: string;
  detectionMethod?: string;
  evidenceData?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(fraudAlerts).values(alert as any);
  return result.insertId;
}

/**
 * Update fraud alert
 */
export async function updateFraudAlert(
  alertId: number,
  update: {
    status?: string;
    assignedTo?: number;
    investigationNotes?: string;
    actionTaken?: string;
  }
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { ...update };
  if (update.status === "resolved") {
    updateData.resolvedAt = new Date();
  }

  await db
    .update(fraudAlerts)
    .set(updateData)
    .where(eq(fraudAlerts.id, alertId));

  return true;
}

// ============================================================================
// Live Dashboard
// ============================================================================

/**
 * Get recent dashboard events
 */
export async function getLiveDashboardEvents(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const events = await db
    .select()
    .from(liveDashboardEvents)
    .orderBy(desc(liveDashboardEvents.timestamp))
    .limit(limit);

  return events;
}

/**
 * Get active riders with locations
 */
export async function getActiveRidersWithLocations() {
  const db = await getDb();
  if (!db) return [];

  const activeRiders = await db
    .select({
      riderId: riders.id,
      riderName: riders.name,
      riderPhone: riders.phone,
      latitude: riderLocations.latitude,
      longitude: riderLocations.longitude,
      lastUpdate: riderLocations.timestamp,
      currentOrderId: orders.id,
      currentOrderStatus: orders.status,
    })
    .from(riders)
    .leftJoin(
      riderLocations,
      and(
        eq(riderLocations.riderId, riders.id),
        gte(riderLocations.timestamp, sql`DATE_SUB(NOW(), INTERVAL 10 MINUTE)`)
      )
    )
    .leftJoin(
      orders,
      and(
        eq(orders.riderId, riders.id),
        sql`${orders.status} IN ('assigned', 'picked_up', 'in_transit')`
      )
    )
    .where(eq(riders.status, "approved"))
    .groupBy(riders.id);

  return activeRiders;
}

/**
 * Record dashboard event
 */
export async function recordDashboardEvent(event: {
  eventType: string;
  entityId: number;
  entityType: string;
  eventData?: string;
  latitude?: string;
  longitude?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(liveDashboardEvents).values(event as any);
  return result.insertId;
}

/**
 * Get live dashboard statistics
 */
export async function getLiveDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db.select({
    activeOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.status} IN ('assigned', 'picked_up', 'in_transit') THEN ${orders.id} END)`,
    activeRiders: sql<number>`COUNT(DISTINCT CASE WHEN ${riders.status} = 'active' THEN ${riders.id} END)`,
    pendingOrders: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.status} = 'pending' THEN ${orders.id} END)`,
    completedToday: sql<number>`COUNT(DISTINCT CASE WHEN ${orders.status} = 'delivered' THEN ${orders.id} END)`,
  }).from(orders)
    .leftJoin(riders, eq(riders.id, orders.riderId));

  return stats || { activeOrders: 0, activeRiders: 0, pendingOrders: 0, completedToday: 0 };
}


// ==================== GEO ANALYTICS FUNCTIONS ====================

/**
 * Get all geographic regions
 */
export async function getGeoRegions(filters?: { regionType?: string; parentId?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(geoRegions.isActive, 1)];

  if (filters?.regionType) {
    conditions.push(eq(geoRegions.regionType, filters.regionType as any));
  }
  if (filters?.parentId !== undefined) {
    if (filters.parentId === null) {
      conditions.push(sql`${geoRegions.parentId} IS NULL`);
    } else {
      conditions.push(eq(geoRegions.parentId, filters.parentId));
    }
  }

  return await db
    .select()
    .from(geoRegions)
    .where(and(...conditions));
}

/**
 * Get regional analytics for a specific region and period
 */
export async function getRegionalAnalytics(regionId: number, period: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(regionalAnalytics)
    .where(
      and(
        eq(regionalAnalytics.regionId, regionId),
        eq(regionalAnalytics.period, period as any)
      )
    )
    .orderBy(desc(regionalAnalytics.periodStart))
    .limit(1);

  return result[0] || null;
}

/**
 * Get regional performance comparison
 */
export async function getRegionalPerformanceComparison(period: string = "month") {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      regionId: regionalAnalytics.regionId,
      regionName: geoRegions.name,
      totalOrders: regionalAnalytics.totalOrders,
      totalRevenue: regionalAnalytics.totalRevenue,
      activeUsers: regionalAnalytics.activeUsers,
      activeRiders: regionalAnalytics.activeRiders,
      avgDeliveryTime: regionalAnalytics.avgDeliveryTime,
      orderDensity: regionalAnalytics.orderDensity,
      customerSatisfaction: regionalAnalytics.customerSatisfaction,
    })
    .from(regionalAnalytics)
    .innerJoin(geoRegions, eq(geoRegions.id, regionalAnalytics.regionId))
    .where(eq(regionalAnalytics.period, period as any))
    .orderBy(desc(regionalAnalytics.totalRevenue));

  return results;
}

/**
 * Create or update regional analytics
 */
export async function upsertRegionalAnalytics(data: {
  regionId: number;
  period: string;
  periodStart: Date;
  periodEnd: Date;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  activeRiders: number;
  avgDeliveryTime?: number;
  orderDensity?: number;
  customerSatisfaction?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(regionalAnalytics).values(data as any);
  return result.insertId;
}

/**
 * Get order heatmap data by region
 */
export async function getOrderHeatmapData() {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      regionId: geoRegions.id,
      regionName: geoRegions.name,
      latitude: geoRegions.latitude,
      longitude: geoRegions.longitude,
      orderCount: sql<number>`COUNT(${orders.id})`,
    })
    .from(geoRegions)
    .leftJoin(orders, sql`${orders.deliveryAddress} LIKE CONCAT('%', ${geoRegions.name}, '%')`)
    .where(eq(geoRegions.isActive, 1))
    .groupBy(geoRegions.id);

  return results;
}

// ==================== REFERRAL PROGRAM FUNCTIONS ====================

/**
 * Generate unique referral code
 */
function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Create a new referral
 */
export async function createReferral(data: {
  referrerUserId: number;
  referredUserEmail?: string;
  referredUserPhone?: string;
  rewardTier?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const referralCode = generateReferralCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90); // 90 days expiry

  const [result] = await db.insert(referrals).values({
    referrerUserId: data.referrerUserId,
    referralCode,
    rewardTier: (data.rewardTier as any) || 'bronze',
    referredUserEmail: data.referredUserEmail,
    referredUserPhone: data.referredUserPhone,
    expiresAt,
  } as any);

  return { id: result.insertId, referralCode };
}

/**
 * Get referrals by user
 */
export async function getUserReferrals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(referrals)
    .where(eq(referrals.referrerUserId, userId))
    .orderBy(desc(referrals.createdAt));
}

/**
 * Get referral by code
 */
export async function getReferralByCode(code: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referralCode, code))
    .limit(1);

  return result[0] || null;
}

/**
 * Complete a referral (when referred user signs up and completes first order)
 */
export async function completeReferral(referralId: number, referredUserId: number, orderValue: number) {
  const db = await getDb();
  if (!db) return null;

  // Get referral details
  const referral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.id, referralId))
    .limit(1);

  if (!referral[0]) return null;

  // Get reward configuration
  const rewardConfig = await db
    .select()
    .from(referralRewards)
    .where(eq(referralRewards.tier, referral[0].rewardTier))
    .limit(1);

  if (!rewardConfig[0] || orderValue < rewardConfig[0].minOrderValue) {
    return null;
  }

  // Update referral status
  await db
    .update(referrals)
    .set({
      status: 'completed',
      referredUserId,
      completedAt: new Date(),
      rewardAmount: rewardConfig[0].referrerReward,
      rewardStatus: 'approved',
    } as any)
    .where(eq(referrals.id, referralId));

  return {
    referrerReward: rewardConfig[0].referrerReward,
    referredReward: rewardConfig[0].referredReward,
  };
}

/**
 * Get referral statistics
 */
export async function getReferralStats(userId?: number) {
  const db = await getDb();
  if (!db) return null;

  const whereClause = userId ? eq(referrals.referrerUserId, userId) : undefined;

  const [stats] = await db
    .select({
      totalReferrals: sql<number>`COUNT(*)`,
      completedReferrals: sql<number>`COUNT(CASE WHEN ${referrals.status} = 'completed' THEN 1 END)`,
      pendingReferrals: sql<number>`COUNT(CASE WHEN ${referrals.status} = 'pending' THEN 1 END)`,
      totalRewards: sql<number>`SUM(CASE WHEN ${referrals.rewardStatus} = 'paid' THEN ${referrals.rewardAmount} ELSE 0 END)`,
      pendingRewards: sql<number>`SUM(CASE WHEN ${referrals.rewardStatus} = 'approved' THEN ${referrals.rewardAmount} ELSE 0 END)`,
    })
    .from(referrals)
    .where(whereClause);

  return stats;
}

/**
 * Get or create referral reward configuration
 */
export async function getReferralRewards() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(referralRewards).where(eq(referralRewards.isActive, 1));
}

/**
 * Update referral reward configuration
 */
export async function updateReferralReward(tier: string, data: {
  referrerReward: number;
  referredReward: number;
  minOrderValue: number;
  description?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(referralRewards)
    .set(data as any)
    .where(eq(referralRewards.tier, tier as any));

  return true;
}

// ==================== LOYALTY PROGRAM FUNCTIONS ====================

/**
 * Get all loyalty tiers
 */
export async function getLoyaltyTiers() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(loyaltyTiers)
    .where(eq(loyaltyTiers.isActive, 1))
    .orderBy(loyaltyTiers.minPoints);
}

/**
 * Get user loyalty points and tier
 */
export async function getUserLoyaltyInfo(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: userLoyaltyPoints.id,
      userId: userLoyaltyPoints.userId,
      currentPoints: userLoyaltyPoints.currentPoints,
      lifetimePoints: userLoyaltyPoints.lifetimePoints,
      currentTierId: userLoyaltyPoints.currentTierId,
      tierAchievedAt: userLoyaltyPoints.tierAchievedAt,
      pointsToNextTier: userLoyaltyPoints.pointsToNextTier,
      lastActivityAt: userLoyaltyPoints.lastActivityAt,
      tierName: loyaltyTiers.name,
      tierMinPoints: loyaltyTiers.minPoints,
      tierMaxPoints: loyaltyTiers.maxPoints,
      discountPercentage: loyaltyTiers.discountPercentage,
      pointsMultiplier: loyaltyTiers.pointsMultiplier,
      benefits: loyaltyTiers.benefits,
      tierIcon: loyaltyTiers.icon,
      tierColor: loyaltyTiers.color,
    })
    .from(userLoyaltyPoints)
    .leftJoin(loyaltyTiers, eq(loyaltyTiers.id, userLoyaltyPoints.currentTierId))
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Initialize loyalty points for a new user
 */
export async function initializeUserLoyalty(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get the first tier (Bronze)
  const tiers = await getLoyaltyTiers();
  const firstTier = tiers[0];

  const [result] = await db.insert(userLoyaltyPoints).values({
    userId,
    currentPoints: 0,
    lifetimePoints: 0,
    currentTierId: firstTier?.id,
    tierAchievedAt: new Date(),
    pointsToNextTier: tiers[1]?.minPoints || 0,
  } as any);

  return result.insertId;
}

/**
 * Add loyalty points to user
 */
export async function addLoyaltyPoints(
  userId: number,
  points: number,
  transactionType: string,
  description: string,
  orderId?: number
) {
  const db = await getDb();
  if (!db) return null;

  // Get current user loyalty info
  let userLoyalty = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  // Initialize if doesn't exist
  if (!userLoyalty[0]) {
    await initializeUserLoyalty(userId);
    userLoyalty = await db
      .select()
      .from(userLoyaltyPoints)
      .where(eq(userLoyaltyPoints.userId, userId))
      .limit(1);
  }

  const current = userLoyalty[0];
  const balanceBefore = current.currentPoints;
  const balanceAfter = balanceBefore + points;

  // Record transaction
  await db.insert(loyaltyPointsTransactions).values({
    userId,
    transactionType: transactionType as any,
    points,
    orderId,
    description,
    balanceBefore,
    balanceAfter,
  } as any);

  // Update user points
  await db
    .update(userLoyaltyPoints)
    .set({
      currentPoints: balanceAfter,
      lifetimePoints: current.lifetimePoints + (points > 0 ? points : 0),
      lastActivityAt: new Date(),
    } as any)
    .where(eq(userLoyaltyPoints.userId, userId));

  // Check for tier upgrade
  await checkAndUpgradeTier(userId, balanceAfter);

  return balanceAfter;
}

/**
 * Check and upgrade user tier if eligible
 */
async function checkAndUpgradeTier(userId: number, currentPoints: number) {
  const db = await getDb();
  if (!db) return;

  const tiers = await getLoyaltyTiers();
  const userLoyalty = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (!userLoyalty[0]) return;

  // Find the appropriate tier
  let newTier = tiers[0];
  for (const tier of tiers) {
    if (currentPoints >= tier.minPoints && (!tier.maxPoints || currentPoints <= tier.maxPoints)) {
      newTier = tier;
    }
  }

  // Update if tier changed
  if (newTier.id !== userLoyalty[0].currentTierId) {
    const nextTier = tiers.find(t => t.minPoints > currentPoints);
    await db
      .update(userLoyaltyPoints)
      .set({
        currentTierId: newTier.id,
        tierAchievedAt: new Date(),
        pointsToNextTier: nextTier ? nextTier.minPoints - currentPoints : 0,
      } as any)
      .where(eq(userLoyaltyPoints.userId, userId));
  }
}

/**
 * Get loyalty rewards catalog
 */
export async function getLoyaltyRewardsCatalog(userId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(loyaltyRewards.isActive, 1)];

  if (userId) {
    const userLoyalty = await getUserLoyaltyInfo(userId);
    if (userLoyalty?.currentTierId) {
      conditions.push(
        or(
          sql`${loyaltyRewards.minTierRequired} IS NULL`,
          sql`${loyaltyRewards.minTierRequired} <= ${userLoyalty.currentTierId}`
        )!
      );
    }
  }

  return await db
    .select()
    .from(loyaltyRewards)
    .where(and(...conditions))
    .orderBy(loyaltyRewards.pointsCost);
}

/**
 * Redeem a loyalty reward
 */
export async function redeemLoyaltyReward(userId: number, rewardId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get reward details
  const reward = await db
    .select()
    .from(loyaltyRewards)
    .where(eq(loyaltyRewards.id, rewardId))
    .limit(1);

  if (!reward[0]) return { success: false, error: 'Reward not found' };

  // Get user loyalty info
  const userLoyalty = await getUserLoyaltyInfo(userId);
  if (!userLoyalty) return { success: false, error: 'User loyalty not initialized' };

  // Check if user has enough points
  if (userLoyalty.currentPoints < reward[0].pointsCost) {
    return { success: false, error: 'Insufficient points' };
  }

  // Check tier requirement
  if (reward[0].minTierRequired && (userLoyalty.currentTierId ?? 0) < reward[0].minTierRequired) {
    return { success: false, error: 'Tier requirement not met' };
  }

  // Check stock
  if (reward[0].stock !== null && reward[0].stock <= 0) {
    return { success: false, error: 'Reward out of stock' };
  }

  // Generate redemption code
  const redemptionCode = `RWD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + reward[0].validityDays);

  // Create redemption record
  const [redemption] = await db.insert(loyaltyRedemptions).values({
    userId,
    rewardId,
    pointsSpent: reward[0].pointsCost,
    status: 'approved',
    redemptionCode,
    expiresAt,
  } as any);

  // Deduct points
  await addLoyaltyPoints(
    userId,
    -reward[0].pointsCost,
    'redeemed',
    `Redeemed: ${reward[0].name}`,
    undefined
  );

  // Update stock if applicable
  if (reward[0].stock !== null) {
    await db
      .update(loyaltyRewards)
      .set({ stock: reward[0].stock - 1 } as any)
      .where(eq(loyaltyRewards.id, rewardId));
  }

  return {
    success: true,
    redemptionId: redemption.insertId,
    redemptionCode,
    expiresAt,
    rewardName: reward[0].name,
    rewardValue: reward[0].rewardValue || reward[0].name,
  };
}

/**
 * Get user loyalty transactions history
 */
export async function getUserLoyaltyTransactions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(loyaltyPointsTransactions)
    .where(eq(loyaltyPointsTransactions.userId, userId))
    .orderBy(desc(loyaltyPointsTransactions.createdAt))
    .limit(limit);
}

/**
 * Get user loyalty redemptions
 */
export async function getUserLoyaltyRedemptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: loyaltyRedemptions.id,
      rewardName: loyaltyRewards.name,
      rewardType: loyaltyRewards.rewardType,
      rewardValue: loyaltyRewards.rewardValue,
      pointsSpent: loyaltyRedemptions.pointsSpent,
      status: loyaltyRedemptions.status,
      redemptionCode: loyaltyRedemptions.redemptionCode,
      usedAt: loyaltyRedemptions.usedAt,
      expiresAt: loyaltyRedemptions.expiresAt,
      createdAt: loyaltyRedemptions.createdAt,
    })
    .from(loyaltyRedemptions)
    .innerJoin(loyaltyRewards, eq(loyaltyRewards.id, loyaltyRedemptions.rewardId))
    .where(eq(loyaltyRedemptions.userId, userId))
    .orderBy(desc(loyaltyRedemptions.createdAt));
}

/**
 * Get loyalty program statistics
 */
export async function getLoyaltyProgramStats() {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db
    .select({
      totalMembers: sql<number>`COUNT(DISTINCT ${userLoyaltyPoints.userId})`,
      totalPointsIssued: sql<number>`SUM(${userLoyaltyPoints.lifetimePoints})`,
      totalPointsRedeemed: sql<number>`SUM(CASE WHEN ${loyaltyPointsTransactions.transactionType} = 'redeemed' THEN ABS(${loyaltyPointsTransactions.points}) ELSE 0 END)`,
      totalRedemptions: sql<number>`COUNT(DISTINCT ${loyaltyRedemptions.id})`,
    })
    .from(userLoyaltyPoints)
    .leftJoin(loyaltyPointsTransactions, eq(loyaltyPointsTransactions.userId, userLoyaltyPoints.userId))
    .leftJoin(loyaltyRedemptions, eq(loyaltyRedemptions.userId, userLoyaltyPoints.userId));

  return stats;
}


// ============================================================================
// INCIDENT MANAGEMENT
// ============================================================================

/**
 * Get all incidents with filters
 */
export async function getIncidents(filters?: {
  status?: string;
  severity?: string;
  incidentType?: string;
  riderId?: number;
  customerId?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(incidents.status, filters.status as any));
  }
  if (filters?.severity) {
    conditions.push(eq(incidents.severity, filters.severity as any));
  }
  if (filters?.incidentType) {
    conditions.push(eq(incidents.incidentType, filters.incidentType as any));
  }
  if (filters?.riderId) {
    conditions.push(eq(incidents.riderId, filters.riderId));
  }
  if (filters?.customerId) {
    conditions.push(eq(incidents.customerId, filters.customerId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(incidents)
    .where(whereClause)
    .orderBy(desc(incidents.createdAt))
    .limit(filters?.limit || 50);
}

/**
 * Get incident by ID
 */
export async function getIncidentById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [incident] = await db
    .select()
    .from(incidents)
    .where(eq(incidents.id, id))
    .limit(1);

  return incident;
}

/**
 * Create new incident
 */
export async function createIncident(data: InsertIncident) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(incidents).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Update incident
 */
export async function updateIncident(id: number, data: Partial<InsertIncident>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(incidents).set(data).where(eq(incidents.id, id));
  return await getIncidentById(id);
}

/**
 * Update incident status
 */
export async function updateIncidentStatus(
  id: number,
  status: string,
  resolvedBy?: number,
  resolutionNotes?: string
) {
  const db = await getDb();
  if (!db) return null;

  const updateData: any = { status };
  if (status === 'resolved' || status === 'closed') {
    updateData.resolvedAt = new Date();
    updateData.resolvedBy = resolvedBy;
    if (resolutionNotes) {
      updateData.resolutionNotes = resolutionNotes;
    }
  }

  await db.update(incidents).set(updateData).where(eq(incidents.id, id));
  return await getIncidentById(id);
}

/**
 * Get incident statistics
 */
export async function getIncidentStats() {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db
    .select({
      totalIncidents: sql<number>`COUNT(*)`,
      pendingIncidents: sql<number>`SUM(CASE WHEN ${incidents.status} = 'pending' THEN 1 ELSE 0 END)`,
      investigatingIncidents: sql<number>`SUM(CASE WHEN ${incidents.status} = 'investigating' THEN 1 ELSE 0 END)`,
      resolvedIncidents: sql<number>`SUM(CASE WHEN ${incidents.status} = 'resolved' THEN 1 ELSE 0 END)`,
      criticalIncidents: sql<number>`SUM(CASE WHEN ${incidents.severity} = 'critical' THEN 1 ELSE 0 END)`,
      totalClaimAmount: sql<number>`SUM(${incidents.claimAmount})`,
      totalCompensation: sql<number>`SUM(${incidents.compensationAmount})`,
    })
    .from(incidents);

  return stats;
}

// ============================================================================
// CUSTOMER FEEDBACK
// ============================================================================

/**
 * Get all customer feedback with filters
 */
export async function getCustomerFeedback(filters?: {
  status?: string;
  sentiment?: string;
  category?: string;
  riderId?: number;
  sellerId?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.status) {
    conditions.push(eq(customerFeedback.status, filters.status as any));
  }
  if (filters?.sentiment) {
    conditions.push(eq(customerFeedback.sentiment, filters.sentiment as any));
  }
  if (filters?.category) {
    conditions.push(eq(customerFeedback.category, filters.category as any));
  }
  if (filters?.riderId) {
    conditions.push(eq(customerFeedback.riderId, filters.riderId));
  }
  if (filters?.sellerId) {
    conditions.push(eq(customerFeedback.sellerId, filters.sellerId));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(customerFeedback)
    .where(whereClause)
    .orderBy(desc(customerFeedback.createdAt))
    .limit(filters?.limit || 50);
}

/**
 * Get feedback by ID
 */
export async function getFeedbackById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [feedback] = await db
    .select()
    .from(customerFeedback)
    .where(eq(customerFeedback.id, id))
    .limit(1);

  return feedback;
}

/**
 * Create customer feedback
 */
export async function createCustomerFeedback(data: InsertCustomerFeedback) {
  const db = await getDb();
  if (!db) return null;

  // Simple sentiment analysis based on rating
  let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
  let sentimentScore = 0;

  if (data.overallRating >= 4) {
    sentiment = 'positive';
    sentimentScore = (data.overallRating - 3) * 50;
  } else if (data.overallRating <= 2) {
    sentiment = 'negative';
    sentimentScore = (data.overallRating - 3) * 50;
  }

  const feedbackData = {
    ...data,
    sentiment,
    sentimentScore,
  };

  const [result] = await db.insert(customerFeedback).values(feedbackData);
  return { id: Number(result.insertId), ...feedbackData };
}

/**
 * Update feedback
 */
export async function updateFeedback(id: number, data: Partial<InsertCustomerFeedback>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(customerFeedback).set(data).where(eq(customerFeedback.id, id));
  return await getFeedbackById(id);
}

/**
 * Respond to feedback
 */
export async function respondToFeedback(
  id: number,
  responseText: string,
  respondedBy: number
) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(customerFeedback)
    .set({
      responseText,
      respondedBy,
      respondedAt: new Date(),
      status: 'responded',
    })
    .where(eq(customerFeedback.id, id));

  return await getFeedbackById(id);
}

/**
 * Get feedback statistics
 */
export async function getFeedbackStats() {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db
    .select({
      totalFeedback: sql<number>`COUNT(*)`,
      averageRating: sql<number>`AVG(${customerFeedback.overallRating})`,
      averageQualityPhotoRating: sql<number>`AVG(${customerFeedback.qualityPhotoRating})`,
      positiveFeedback: sql<number>`SUM(CASE WHEN ${customerFeedback.sentiment} = 'positive' THEN 1 ELSE 0 END)`,
      neutralFeedback: sql<number>`SUM(CASE WHEN ${customerFeedback.sentiment} = 'neutral' THEN 1 ELSE 0 END)`,
      negativeFeedback: sql<number>`SUM(CASE WHEN ${customerFeedback.sentiment} = 'negative' THEN 1 ELSE 0 END)`,
      pendingFeedback: sql<number>`SUM(CASE WHEN ${customerFeedback.status} = 'pending' THEN 1 ELSE 0 END)`,
      respondedFeedback: sql<number>`SUM(CASE WHEN ${customerFeedback.status} = 'responded' THEN 1 ELSE 0 END)`,
    })
    .from(customerFeedback);

  return stats;
}

/**
 * Get feedback trends over time
 */
export async function getFeedbackTrends(period: 'day' | 'week' | 'month' = 'month') {
  const db = await getDb();
  if (!db) return [];

  let dateFormat = '%Y-%m-%d';
  if (period === 'week') dateFormat = '%Y-%U';
  if (period === 'month') dateFormat = '%Y-%m';

  return await db
    .select({
      period: sql<string>`DATE_FORMAT(${customerFeedback.createdAt}, ${dateFormat})`,
      totalFeedback: sql<number>`COUNT(*)`,
      averageRating: sql<number>`AVG(${customerFeedback.overallRating})`,
      positiveCount: sql<number>`SUM(CASE WHEN ${customerFeedback.sentiment} = 'positive' THEN 1 ELSE 0 END)`,
      negativeCount: sql<number>`SUM(CASE WHEN ${customerFeedback.sentiment} = 'negative' THEN 1 ELSE 0 END)`,
    })
    .from(customerFeedback)
    .groupBy(sql`DATE_FORMAT(${customerFeedback.createdAt}, ${dateFormat})`)
    .orderBy(sql`DATE_FORMAT(${customerFeedback.createdAt}, ${dateFormat})`);
}

// ============================================================================
// RIDER TRAINING
// ============================================================================

/**
 * Get all training modules
 */
export async function getTrainingModules(filters?: {
  category?: string;
  isMandatory?: boolean;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.category) {
    conditions.push(eq(trainingModules.category, filters.category as any));
  }
  if (filters?.isMandatory !== undefined) {
    conditions.push(eq(trainingModules.isMandatory, filters.isMandatory ? 1 : 0));
  }
  if (filters?.isActive !== undefined) {
    conditions.push(eq(trainingModules.isActive, filters.isActive ? 1 : 0));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select()
    .from(trainingModules)
    .where(whereClause)
    .orderBy(trainingModules.displayOrder);
}

/**
 * Get training module by ID
 */
export async function getTrainingModuleById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [module] = await db
    .select()
    .from(trainingModules)
    .where(eq(trainingModules.id, id))
    .limit(1);

  return module;
}

/**
 * Create training module
 */
export async function createTrainingModule(data: InsertTrainingModule) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(trainingModules).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Update training module
 */
export async function updateTrainingModule(id: number, data: Partial<InsertTrainingModule>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(trainingModules).set(data).where(eq(trainingModules.id, id));
  return await getTrainingModuleById(id);
}

/**
 * Get quiz questions for a module
 */
export async function getModuleQuizQuestions(moduleId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(trainingQuizQuestions)
    .where(eq(trainingQuizQuestions.moduleId, moduleId))
    .orderBy(trainingQuizQuestions.displayOrder);
}

/**
 * Create quiz question
 */
export async function createQuizQuestion(data: InsertTrainingQuizQuestion) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(trainingQuizQuestions).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Get rider training progress
 */
export async function getRiderTrainingProgress(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: riderTrainingProgress.id,
      moduleId: riderTrainingProgress.moduleId,
      moduleTitle: trainingModules.title,
      moduleCategory: trainingModules.category,
      isMandatory: trainingModules.isMandatory,
      status: riderTrainingProgress.status,
      progressPercentage: riderTrainingProgress.progressPercentage,
      quizAttempts: riderTrainingProgress.quizAttempts,
      lastQuizScore: riderTrainingProgress.lastQuizScore,
      bestQuizScore: riderTrainingProgress.bestQuizScore,
      certificateIssued: riderTrainingProgress.certificateIssued,
      certificateNumber: riderTrainingProgress.certificateNumber,
      startedAt: riderTrainingProgress.startedAt,
      completedAt: riderTrainingProgress.completedAt,
      timeSpent: riderTrainingProgress.timeSpent,
    })
    .from(riderTrainingProgress)
    .innerJoin(trainingModules, eq(trainingModules.id, riderTrainingProgress.moduleId))
    .where(eq(riderTrainingProgress.riderId, riderId))
    .orderBy(trainingModules.displayOrder);
}

/**
 * Start training module for rider
 */
export async function startTrainingModule(riderId: number, moduleId: number) {
  const db = await getDb();
  if (!db) return null;

  // Check if progress already exists
  const [existing] = await db
    .select()
    .from(riderTrainingProgress)
    .where(
      and(
        eq(riderTrainingProgress.riderId, riderId),
        eq(riderTrainingProgress.moduleId, moduleId)
      )
    )
    .limit(1);

  if (existing) {
    // Update existing progress
    await db
      .update(riderTrainingProgress)
      .set({
        status: 'in_progress',
        startedAt: existing.startedAt || new Date(),
        lastAccessedAt: new Date(),
      })
      .where(eq(riderTrainingProgress.id, existing.id));
    return existing;
  }

  // Create new progress
  const [result] = await db.insert(riderTrainingProgress).values({
    riderId,
    moduleId,
    status: 'in_progress',
    startedAt: new Date(),
    lastAccessedAt: new Date(),
  });

  return { id: Number(result.insertId), riderId, moduleId };
}

/**
 * Submit quiz answers
 */
export async function submitQuizAnswers(
  riderId: number,
  moduleId: number,
  answers: Array<{ questionId: number; answer: string }>
) {
  const db = await getDb();
  if (!db) return null;

  // Get quiz questions
  const questions = await getModuleQuizQuestions(moduleId);
  if (questions.length === 0) return null;

  // Calculate score
  let correctAnswers = 0;
  for (const answer of answers) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.answer) {
      correctAnswers++;
    }
  }

  const score = Math.round((correctAnswers / questions.length) * 100);

  // Get module to check passing score
  const module = await getTrainingModuleById(moduleId);
  if (!module) return null;

  const passed = score >= module.minPassingScore;

  // Get existing progress
  const [progress] = await db
    .select()
    .from(riderTrainingProgress)
    .where(
      and(
        eq(riderTrainingProgress.riderId, riderId),
        eq(riderTrainingProgress.moduleId, moduleId)
      )
    )
    .limit(1);

  if (!progress) return null;

  // Update progress
  const updateData: any = {
    quizAttempts: progress.quizAttempts + 1,
    lastQuizScore: score,
    bestQuizScore: Math.max(score, progress.bestQuizScore || 0),
    quizAnswers: JSON.stringify(answers),
    lastAccessedAt: new Date(),
  };

  if (passed) {
    updateData.status = 'completed';
    updateData.completedAt = new Date();
    updateData.progressPercentage = 100;

    // Issue certificate if not already issued
    if (!progress.certificateIssued) {
      updateData.certificateIssued = 1;
      updateData.certificateNumber = `CERT-${riderId}-${moduleId}-${Date.now()}`;
      updateData.certificateIssuedAt = new Date();

      if (module.certificateValidityDays) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + module.certificateValidityDays);
        updateData.certificateExpiresAt = expiryDate;
      }
    }
  } else {
    updateData.status = 'failed';
  }

  await db
    .update(riderTrainingProgress)
    .set(updateData)
    .where(eq(riderTrainingProgress.id, progress.id));

  return {
    score,
    passed,
    correctAnswers,
    totalQuestions: questions.length,
  };
}

/**
 * Get training statistics
 */
export async function getTrainingStats() {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db
    .select({
      totalModules: sql<number>`COUNT(DISTINCT ${trainingModules.id})`,
      mandatoryModules: sql<number>`SUM(CASE WHEN ${trainingModules.isMandatory} = 1 THEN 1 ELSE 0 END)`,
      totalEnrollments: sql<number>`COUNT(DISTINCT ${riderTrainingProgress.id})`,
      completedModules: sql<number>`SUM(CASE WHEN ${riderTrainingProgress.status} = 'completed' THEN 1 ELSE 0 END)`,
      certificatesIssued: sql<number>`SUM(CASE WHEN ${riderTrainingProgress.certificateIssued} = 1 THEN 1 ELSE 0 END)`,
      averageScore: sql<number>`AVG(${riderTrainingProgress.bestQuizScore})`,
    })
    .from(trainingModules)
    .leftJoin(riderTrainingProgress, eq(riderTrainingProgress.moduleId, trainingModules.id));

  return stats;
}

/**
 * Get rider training completion rate
 */
export async function getRiderTrainingCompletionRate(riderId: number) {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db
    .select({
      totalModules: sql<number>`COUNT(*)`,
      completedModules: sql<number>`SUM(CASE WHEN ${riderTrainingProgress.status} = 'completed' THEN 1 ELSE 0 END)`,
      mandatoryCompleted: sql<number>`SUM(CASE WHEN ${trainingModules.isMandatory} = 1 AND ${riderTrainingProgress.status} = 'completed' THEN 1 ELSE 0 END)`,
      totalMandatory: sql<number>`SUM(CASE WHEN ${trainingModules.isMandatory} = 1 THEN 1 ELSE 0 END)`,
    })
    .from(trainingModules)
    .leftJoin(
      riderTrainingProgress,
      and(
        eq(riderTrainingProgress.moduleId, trainingModules.id),
        eq(riderTrainingProgress.riderId, riderId)
      )
    )
    .where(eq(trainingModules.isActive, 1));

  return stats;
}


// ============================================================================
// ADVANCED REPORTING SUITE
// ============================================================================

/**
 * Create custom report template
 */
export async function createCustomReport(data: InsertCustomReport) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(customReports).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Get custom reports
 */
export async function getCustomReports(filters?: {
  createdBy?: number;
  reportType?: string;
  isPublic?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(customReports);

  if (filters?.createdBy) {
    query = query.where(eq(customReports.createdBy, filters.createdBy)) as any;
  }
  if (filters?.reportType) {
    query = query.where(eq(customReports.reportType, filters.reportType as any)) as any;
  }
  if (filters?.isPublic !== undefined) {
    query = query.where(eq(customReports.isPublic, filters.isPublic ? 1 : 0)) as any;
  }

  return await query;
}

/**
 * Get custom report by ID
 */
export async function getCustomReportById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const [report] = await db
    .select()
    .from(customReports)
    .where(eq(customReports.id, id))
    .limit(1);

  return report;
}

/**
 * Update custom report
 */
export async function updateCustomReport(id: number, data: Partial<InsertCustomReport>) {
  const db = await getDb();
  if (!db) return false;

  await db.update(customReports).set(data).where(eq(customReports.id, id));
  return true;
}

/**
 * Delete custom report
 */
export async function deleteCustomReport(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(customReports).where(eq(customReports.id, id));
  return true;
}

/**
 * Create scheduled report
 */
export async function createScheduledReport(data: InsertScheduledReport) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(scheduledReports).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Get scheduled reports
 */
export async function getScheduledReports(filters?: { isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(scheduledReports);

  if (filters?.isActive !== undefined) {
    query = query.where(eq(scheduledReports.isActive, filters.isActive ? 1 : 0)) as any;
  }

  return await query;
}

/**
 * Update scheduled report
 */
export async function updateScheduledReport(id: number, data: Partial<InsertScheduledReport>) {
  const db = await getDb();
  if (!db) return false;

  await db.update(scheduledReports).set(data).where(eq(scheduledReports.id, id));
  return true;
}

/**
 * Delete a scheduled report
 */
export async function deleteScheduledReport(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(scheduledReports).where(eq(scheduledReports.id, id));
  return true;
}

/**
 * Execute report and save to history
 */
export async function executeReport(
  reportId: number,
  executedBy: number,
  executionType: "manual" | "scheduled"
) {
  const db = await getDb();
  if (!db) return null;

  const report = await getCustomReportById(reportId);
  if (!report) return null;

  const startedAt = new Date();

  // Create execution history record
  const [result] = await db.insert(reportExecutionHistory).values({
    reportId,
    executedBy,
    executionType,
    status: "in_progress",
    format: "pdf",
    startedAt,
  });

  const executionId = Number(result.insertId);

  try {
    // TODO: Generate actual report data based on report.reportType and report.filters
    // For now, return placeholder data
    const recordCount = 100;
    const fileUrl = `/reports/report-${executionId}.pdf`;
    const completedAt = new Date();
    const duration = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    // Update execution history with results
    await db
      .update(reportExecutionHistory)
      .set({
        status: "success",
        recordCount,
        fileUrl,
        fileSize: 1024 * 100, // 100KB placeholder
        completedAt,
        duration,
      })
      .where(eq(reportExecutionHistory.id, executionId));

    return { id: executionId, status: "success", fileUrl, recordCount };
  } catch (error) {
    // Update execution history with error
    await db
      .update(reportExecutionHistory)
      .set({
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
        completedAt: new Date(),
      })
      .where(eq(reportExecutionHistory.id, executionId));

    return { id: executionId, status: "failed", error };
  }
}

/**
 * Get report execution history
 */
export async function getReportExecutionHistory(filters?: {
  reportId?: number;
  executedBy?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(reportExecutionHistory);

  if (filters?.reportId) {
    query = query.where(eq(reportExecutionHistory.reportId, filters.reportId)) as any;
  }
  if (filters?.executedBy) {
    query = query.where(eq(reportExecutionHistory.executedBy, filters.executedBy)) as any;
  }
  if (filters?.status) {
    query = query.where(eq(reportExecutionHistory.status, filters.status as any)) as any;
  }

  return await query.orderBy(desc(reportExecutionHistory.createdAt));
}

// ============================================================================
// REAL-TIME NOTIFICATION SYSTEM
// ============================================================================

/**
 * Create real-time notification
 */
export async function createRealtimeNotification(data: InsertRealtimeNotification) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(realtimeNotifications).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Get notifications for a recipient
 */
export async function getNotifications(filters?: {
  recipientId?: number;
  recipientType?: string;
  isRead?: boolean;
  type?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(realtimeNotifications);

  if (filters?.recipientId) {
    query = query.where(eq(realtimeNotifications.recipientId, filters.recipientId)) as any;
  }
  if (filters?.recipientType) {
    query = query.where(eq(realtimeNotifications.recipientType, filters.recipientType as any)) as any;
  }
  if (filters?.isRead !== undefined) {
    query = query.where(eq(realtimeNotifications.isRead, filters.isRead ? 1 : 0)) as any;
  }
  if (filters?.type) {
    query = query.where(eq(realtimeNotifications.type, filters.type as any)) as any;
  }

  return await query.orderBy(desc(realtimeNotifications.createdAt)).limit(100);
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(realtimeNotifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(eq(realtimeNotifications.id, id));

  return true;
}

/**
 * Mark all notifications as read for a recipient
 */
export async function markAllNotificationsAsRead(recipientId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(realtimeNotifications)
    .set({ isRead: 1, readAt: new Date() })
    .where(
      and(
        eq(realtimeNotifications.recipientId, recipientId),
        eq(realtimeNotifications.isRead, 0)
      )
    );

  return true;
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount(recipientId: number) {
  const db = await getDb();
  if (!db) return 0;

  const [result] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(realtimeNotifications)
    .where(
      and(
        eq(realtimeNotifications.recipientId, recipientId),
        eq(realtimeNotifications.isRead, 0)
      )
    );

  return result?.count || 0;
}

/**
 * Broadcast notification to all admins
 */
export async function broadcastNotificationToAdmins(
  title: string,
  message: string,
  type: "incident" | "feedback" | "training" | "order" | "system" | "alert" | "info",
  severity: "low" | "medium" | "high" | "critical" = "medium",
  metadata?: any
) {
  const db = await getDb();
  if (!db) return null;

  const notification = await createRealtimeNotification({
    title,
    message,
    type,
    severity,
    recipientType: "admin",
    deliveryStatus: "sent",
    metadata: metadata ? JSON.stringify(metadata) : null,
  });

  // TODO: Emit WebSocket event to connected admin clients
  // websocketServer.emit('notification', notification);

  return notification;
}

// ============================================================================
// MOBILE TRAINING SYNC
// ============================================================================

/**
 * Create mobile training sync record
 */
export async function createMobileTrainingSync(data: InsertMobileTrainingSync) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(mobileTrainingSync).values(data);
  return { id: Number(result.insertId), ...data };
}

/**
 * Get pending sync records for a rider
 */
export async function getPendingSync(riderId: number, deviceId: string) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(mobileTrainingSync)
    .where(
      and(
        eq(mobileTrainingSync.riderId, riderId),
        eq(mobileTrainingSync.deviceId, deviceId),
        eq(mobileTrainingSync.syncStatus, "pending")
      )
    )
    .orderBy(mobileTrainingSync.offlineTimestamp);
}

/**
 * Process mobile training sync
 */
export async function processMobileSync(syncId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    const [syncRecord] = await db
      .select()
      .from(mobileTrainingSync)
      .where(eq(mobileTrainingSync.id, syncId))
      .limit(1);

    if (!syncRecord) return false;

    const data = JSON.parse(syncRecord.data);

    // Process based on sync type
    switch (syncRecord.syncType) {
      case "progress":
        // Update rider training progress
        await db
          .update(riderTrainingProgress)
          .set({
            progressPercentage: data.progressPercentage,
            timeSpent: data.timeSpent,
            lastAccessedAt: new Date(data.timestamp),
          })
          .where(
            and(
              eq(riderTrainingProgress.riderId, syncRecord.riderId),
              eq(riderTrainingProgress.moduleId, syncRecord.moduleId)
            )
          );
        break;

      case "quiz_answers":
        // Update quiz answers
        await db
          .update(riderTrainingProgress)
          .set({
            quizAnswers: JSON.stringify(data.answers),
            quizAttempts: sql`${riderTrainingProgress.quizAttempts} + 1`,
          })
          .where(
            and(
              eq(riderTrainingProgress.riderId, syncRecord.riderId),
              eq(riderTrainingProgress.moduleId, syncRecord.moduleId)
            )
          );
        break;

      case "completion":
        // Mark module as completed
        await db
          .update(riderTrainingProgress)
          .set({
            status: "completed",
            completedAt: new Date(data.completedAt),
          })
          .where(
            and(
              eq(riderTrainingProgress.riderId, syncRecord.riderId),
              eq(riderTrainingProgress.moduleId, syncRecord.moduleId)
            )
          );
        break;
    }

    // Mark sync as completed
    await db
      .update(mobileTrainingSync)
      .set({
        syncStatus: "synced",
        syncedAt: new Date(),
        onlineTimestamp: new Date(),
      })
      .where(eq(mobileTrainingSync.id, syncId));

    return true;
  } catch (error) {
    // Mark sync as failed
    await db
      .update(mobileTrainingSync)
      .set({
        syncStatus: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      })
      .where(eq(mobileTrainingSync.id, syncId));

    return false;
  }
}

/**
 * Get sync status for a rider
 */
export async function getSyncStatus(riderId: number, deviceId: string) {
  const db = await getDb();
  if (!db) return null;

  const [stats] = await db
    .select({
      totalSync: sql<number>`COUNT(*)`,
      pendingSync: sql<number>`SUM(CASE WHEN ${mobileTrainingSync.syncStatus} = 'pending' THEN 1 ELSE 0 END)`,
      syncedCount: sql<number>`SUM(CASE WHEN ${mobileTrainingSync.syncStatus} = 'synced' THEN 1 ELSE 0 END)`,
      failedCount: sql<number>`SUM(CASE WHEN ${mobileTrainingSync.syncStatus} = 'failed' THEN 1 ELSE 0 END)`,
    })
    .from(mobileTrainingSync)
    .where(
      and(
        eq(mobileTrainingSync.riderId, riderId),
        eq(mobileTrainingSync.deviceId, deviceId)
      )
    );

  return stats;
}


// ============================================================================
// SPRINT 7: RIDER MANAGEMENT - SHIFT SCHEDULING & EARNINGS
// ============================================================================

/**
 * Get shifts for a date range
 */
export async function getShifts(filters?: {
  riderId?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  shiftType?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(riderShifts);

  const conditions = [];
  if (filters?.riderId) {
    conditions.push(eq(riderShifts.riderId, filters.riderId));
  }
  if (filters?.startDate) {
    conditions.push(sql`${riderShifts.shiftDate} >= ${filters.startDate}`);
  }
  if (filters?.endDate) {
    conditions.push(sql`${riderShifts.shiftDate} <= ${filters.endDate}`);
  }
  if (filters?.status) {
    conditions.push(eq(riderShifts.status, filters.status as any));
  }
  if (filters?.shiftType) {
    conditions.push(eq(riderShifts.shiftType, filters.shiftType as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(riderShifts.shiftDate);
}

/**
 * Create a new shift
 */
export async function createShift(shift: InsertRiderShift) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(riderShifts).values(shift);
  return result.insertId;
}

/**
 * Update shift status
 */
export async function updateShiftStatus(shiftId: number, status: string, notes?: string) {
  const db = await getDb();
  if (!db) return false;

  const updateData: any = { status };
  if (status === "confirmed") {
    updateData.confirmedAt = new Date();
  }
  if (notes) {
    updateData.notes = notes;
  }

  await db
    .update(riderShifts)
    .set(updateData)
    .where(eq(riderShifts.id, shiftId));

  return true;
}

/**
 * Cancel a shift
 */
export async function cancelShift(shiftId: number, reason: string) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(riderShifts)
    .set({
      status: "cancelled",
      cancellationReason: reason,
    })
    .where(eq(riderShifts.id, shiftId));

  return true;
}

/**
 * Get rider earnings for a period (Sprint 7 - detailed version)
 */
export async function getRiderEarningsDetailed(filters: {
  riderId: number;
  startDate: Date;
  endDate: Date;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [
    eq(riderEarningsTransactions.riderId, filters.riderId),
    sql`${riderEarningsTransactions.transactionDate} >= ${filters.startDate}`,
    sql`${riderEarningsTransactions.transactionDate} <= ${filters.endDate}`
  ];

  if (filters.status) {
    conditions.push(eq(riderEarningsTransactions.status, filters.status as any));
  }

  return await db
    .select()
    .from(riderEarningsTransactions)
    .where(and(...conditions))
    .orderBy(desc(riderEarningsTransactions.transactionDate));
}

/**
 * Get earnings summary for a rider
 */
export async function getRiderEarningsSummary(riderId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const [summary] = await db
    .select({
      totalEarnings: sql<number>`SUM(CASE WHEN ${riderEarningsTransactions.transactionType} IN ('delivery_fee', 'tip', 'bonus') THEN ${riderEarningsTransactions.amount} ELSE 0 END)`,
      totalDeductions: sql<number>`SUM(CASE WHEN ${riderEarningsTransactions.transactionType} IN ('penalty', 'refund') THEN ${riderEarningsTransactions.amount} ELSE 0 END)`,
      deliveryFees: sql<number>`SUM(CASE WHEN ${riderEarningsTransactions.transactionType} = 'delivery_fee' THEN ${riderEarningsTransactions.amount} ELSE 0 END)`,
      tips: sql<number>`SUM(CASE WHEN ${riderEarningsTransactions.transactionType} = 'tip' THEN ${riderEarningsTransactions.amount} ELSE 0 END)`,
      bonuses: sql<number>`SUM(CASE WHEN ${riderEarningsTransactions.transactionType} = 'bonus' THEN ${riderEarningsTransactions.amount} ELSE 0 END)`,
      penalties: sql<number>`SUM(CASE WHEN ${riderEarningsTransactions.transactionType} = 'penalty' THEN ${riderEarningsTransactions.amount} ELSE 0 END)`,
      transactionCount: sql<number>`COUNT(*)`,
    })
    .from(riderEarningsTransactions)
    .where(
      and(
        eq(riderEarningsTransactions.riderId, riderId),
        sql`${riderEarningsTransactions.transactionDate} >= ${startDate}`,
        sql`${riderEarningsTransactions.transactionDate} <= ${endDate}`
      )
    );

  return summary;
}

/**
 * Create an earnings transaction
 */
export async function createEarningsTransaction(transaction: InsertRiderEarningsTransaction) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(riderEarningsTransactions).values(transaction);
  return result.insertId;
}

/**
 * Approve an earnings transaction
 */
export async function approveEarningsTransaction(transactionId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(riderEarningsTransactions)
    .set({
      status: "approved",
      approvedBy,
      approvedAt: new Date(),
    })
    .where(eq(riderEarningsTransactions.id, transactionId));

  return true;
}

/**
 * Get pending shift swaps
 */
export async function getPendingShiftSwaps() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(shiftSwaps)
    .where(eq(shiftSwaps.status, "pending"))
    .orderBy(shiftSwaps.createdAt);
}

/**
 * Get shift swaps for a rider
 */
export async function getRiderShiftSwaps(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(shiftSwaps)
    .where(
      or(
        eq(shiftSwaps.requesterId, riderId),
        eq(shiftSwaps.targetRiderId, riderId)
      )
    )
    .orderBy(desc(shiftSwaps.createdAt));
}

/**
 * Create a shift swap request
 */
export async function createShiftSwap(swap: InsertShiftSwap) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(shiftSwaps).values(swap);
  return result.insertId;
}

/**
 * Review a shift swap (approve/reject)
 */
export async function reviewShiftSwap(
  swapId: number,
  status: "approved" | "rejected",
  reviewedBy: number,
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(shiftSwaps)
    .set({
      status,
      reviewedBy,
      reviewedAt: new Date(),
      reviewNotes,
    })
    .where(eq(shiftSwaps.id, swapId));

  // If approved, update the shifts
  if (status === "approved") {
    const [swap] = await db
      .select()
      .from(shiftSwaps)
      .where(eq(shiftSwaps.id, swapId))
      .limit(1);

    if (swap && swap.requestType === "swap" && swap.targetRiderId && swap.targetShiftId) {
      // Swap the riders on the shifts
      await db
        .update(riderShifts)
        .set({ riderId: swap.targetRiderId })
        .where(eq(riderShifts.id, swap.requesterShiftId));

      await db
        .update(riderShifts)
        .set({ riderId: swap.requesterId })
        .where(eq(riderShifts.id, swap.targetShiftId));
    }
  }

  return true;
}

/**
 * Get rider availability for a date range
 */
export async function getRiderAvailability(riderId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(riderAvailability)
    .where(
      and(
        eq(riderAvailability.riderId, riderId),
        sql`${riderAvailability.availabilityDate} >= ${startDate}`,
        sql`${riderAvailability.availabilityDate} <= ${endDate}`
      )
    )
    .orderBy(riderAvailability.availabilityDate);
}

/**
 * Set rider availability
 */
export async function setRiderAvailability(availability: InsertRiderAvailability) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(riderAvailability).values(availability);
  return result.insertId;
}

/**
 * Update rider availability
 */
export async function updateRiderAvailability(
  availabilityId: number,
  updates: Partial<InsertRiderAvailability>
) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(riderAvailability)
    .set(updates)
    .where(eq(riderAvailability.id, availabilityId));

  return true;
}

/**
 * Get pending rider payouts (Sprint 7)
 */
export async function getPendingRiderPayouts() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(riderPayouts)
    .where(eq(riderPayouts.status, "pending"))
    .orderBy(riderPayouts.payoutDate);
}

/**
 * Get rider payouts
 */
export async function getRiderPayouts(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(riderPayouts)
    .where(eq(riderPayouts.riderId, riderId))
    .orderBy(desc(riderPayouts.payoutDate));
}

/**
 * Create a rider payout (Sprint 7)
 */
export async function createRiderPayout(payout: InsertRiderPayout) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db.insert(riderPayouts).values(payout);
  return result.insertId;
}

/**
 * Update payout status
 */
export async function updatePayoutStatus(
  payoutId: number,
  status: string,
  processedBy?: number,
  failureReason?: string
) {
  const db = await getDb();
  if (!db) return false;

  const updateData: any = { status };
  if (processedBy) {
    updateData.processedBy = processedBy;
    updateData.processedAt = new Date();
  }
  if (failureReason) {
    updateData.failureReason = failureReason;
  }

  await db
    .update(riderPayouts)
    .set(updateData)
    .where(eq(riderPayouts.id, payoutId));

  // If payout is completed, mark all related transactions as paid
  if (status === "completed") {
    const [payout] = await db
      .select()
      .from(riderPayouts)
      .where(eq(riderPayouts.id, payoutId))
      .limit(1);

    if (payout && payout.transactionIds) {
      const transactionIds = JSON.parse(payout.transactionIds);
      await db
        .update(riderEarningsTransactions)
        .set({
          status: "paid",
          payoutId,
          paidAt: new Date(),
        })
        .where(sql`${riderEarningsTransactions.id} IN (${transactionIds.join(",")})`);
    }
  }

  return true;
}

/**
 * Retry a failed payout
 */
export async function retryPayout(payoutId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(riderPayouts)
    .set({
      status: "processing",
      retryCount: sql`${riderPayouts.retryCount} + 1`,
      lastRetryAt: new Date(),
    })
    .where(eq(riderPayouts.id, payoutId));

  return true;
}


// ============================================================================
// GAMIFICATION & BADGES
// ============================================================================

/**
 * Get all badge definitions
 */
export async function getAllBadges(filters?: { category?: string; tier?: string; isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(badges);

  if (filters?.category) {
    query = query.where(eq(badges.category, filters.category as any)) as any;
  }
  if (filters?.tier) {
    query = query.where(eq(badges.tier, filters.tier as any)) as any;
  }
  if (filters?.isActive !== undefined) {
    query = query.where(eq(badges.isActive, filters.isActive)) as any;
  }

  return await query.orderBy(badges.tier, badges.category);
}

/**
 * Get badges earned by a specific rider
 */
export async function getRiderBadges(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: riderBadges.id,
      badgeId: riderBadges.badgeId,
      progress: riderBadges.progress,
      earnedAt: riderBadges.earnedAt,
      metadata: riderBadges.metadata,
      badge: badges,
    })
    .from(riderBadges)
    .leftJoin(badges, eq(riderBadges.badgeId, badges.id))
    .where(eq(riderBadges.riderId, riderId))
    .orderBy(desc(riderBadges.earnedAt));
}

/**
 * Get badge progress for a rider
 */
export async function getBadgeProgress(riderId: number, badgeId: number) {
  const db = await getDb();
  if (!db) return null;

  const [result] = await db
    .select()
    .from(riderBadges)
    .where(and(
      eq(riderBadges.riderId, riderId),
      eq(riderBadges.badgeId, badgeId)
    ))
    .limit(1);

  return result;
}

/**
 * Award a badge to a rider
 */
export async function awardBadge(riderId: number, badgeId: number, metadata?: any) {
  const db = await getDb();
  if (!db) return null;

  // Check if badge already earned
  const existing = await getBadgeProgress(riderId, badgeId);
  if (existing && existing.earnedAt) {
    return existing; // Already earned
  }

  if (existing) {
    // Update existing progress to earned
    await db
      .update(riderBadges)
      .set({
        progress: 100,
        earnedAt: new Date(),
        metadata: metadata ? JSON.stringify(metadata) : null,
      })
      .where(eq(riderBadges.id, existing.id));

    return { ...existing, earnedAt: new Date(), progress: 100 };
  } else {
    // Create new badge entry
    const [result] = await db.insert(riderBadges).values({
      riderId,
      badgeId,
      progress: 100,
      earnedAt: new Date(),
      metadata: metadata ? JSON.stringify(metadata) : null,
    });

    return { id: result.insertId, riderId, badgeId, progress: 100, earnedAt: new Date() };
  }
}

/**
 * Update badge progress for a rider
 */
export async function updateBadgeProgress(riderId: number, badgeId: number, progress: number) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getBadgeProgress(riderId, badgeId);

  if (existing) {
    await db
      .update(riderBadges)
      .set({ progress: Math.min(progress, 100) })
      .where(eq(riderBadges.id, existing.id));
  } else {
    await db.insert(riderBadges).values({
      riderId,
      badgeId,
      progress: Math.min(progress, 100),
    });
  }

  return { riderId, badgeId, progress: Math.min(progress, 100) };
}

/**
 * Check and award badges based on rider statistics
 */
export async function checkAndAwardBadges(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  const newlyEarnedBadges: any[] = [];

  // Get rider stats
  const rider = await getRiderById(riderId);
  if (!rider) return [];

  // Get all active badges
  const allBadges = await getAllBadges({ isActive: true });

  for (const badge of allBadges) {
    try {
      const criteria = JSON.parse(badge.criteria);
      let earned = false;
      let progress = 0;

      switch (criteria.type) {
        case "earnings": {
          // Get total earnings
          const now = new Date();
          const startDate = new Date(0); // All time
          const summary = await getRiderEarningsSummary(riderId, startDate, now);
          const totalEarnings = summary?.totalEarnings || 0;

          progress = Math.min((totalEarnings / criteria.threshold) * 100, 100);
          earned = totalEarnings >= criteria.threshold;
          break;
        }

        case "deliveries": {
          progress = Math.min((rider.totalDeliveries / criteria.count) * 100, 100);
          earned = rider.totalDeliveries >= criteria.count;
          break;
        }

        case "rating": {
          const ratingValue = (rider.rating ?? 0) / 10; // Convert from stored format (48 -> 4.8)
          progress = Math.min((ratingValue / criteria.threshold) * 100, 100);
          earned = ratingValue >= criteria.threshold;
          break;
        }

        case "streak": {
          // TODO: Implement streak tracking
          // For now, skip streak badges
          break;
        }

        default:
          continue;
      }

      // Update progress
      await updateBadgeProgress(riderId, badge.id, progress);

      // Award badge if earned
      if (earned) {
        const existingBadge = await getBadgeProgress(riderId, badge.id);
        if (!existingBadge || !existingBadge.earnedAt) {
          await awardBadge(riderId, badge.id, { earnedAt: new Date().toISOString() });
          newlyEarnedBadges.push(badge);

          // Create notification
          await db.insert(badgeNotifications).values({
            riderId,
            badgeId: badge.id,
            type: "earned",
            message: `Congratulations! You've earned the "${badge.name}" badge!`,
          });
        }
      }
    } catch (error) {
      console.error(`[Badges] Error checking badge ${badge.id}:`, error);
    }
  }

  return newlyEarnedBadges;
}

/**
 * Get badge leaderboard
 */
export async function getBadgeLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      riderId: riderBadges.riderId,
      riderName: riders.name,
      badgeCount: sql<number>`COUNT(DISTINCT ${riderBadges.badgeId})`,
      totalPoints: sql<number>`SUM(${badges.points})`,
    })
    .from(riderBadges)
    .leftJoin(riders, eq(riderBadges.riderId, riders.id))
    .leftJoin(badges, eq(riderBadges.badgeId, badges.id))
    .where(sql`${riderBadges.earnedAt} IS NOT NULL`)
    .groupBy(riderBadges.riderId, riders.name)
    .orderBy(desc(sql`SUM(${badges.points})`))
    .limit(limit);

  return results;
}

/**
 * Get unread badge notifications for a rider
 */
export async function getUnreadBadgeNotifications(riderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: badgeNotifications.id,
      badgeId: badgeNotifications.badgeId,
      type: badgeNotifications.type,
      message: badgeNotifications.message,
      createdAt: badgeNotifications.createdAt,
      badge: badges,
    })
    .from(badgeNotifications)
    .leftJoin(badges, eq(badgeNotifications.badgeId, badges.id))
    .where(and(
      eq(badgeNotifications.riderId, riderId),
      eq(badgeNotifications.isRead, false)
    ))
    .orderBy(desc(badgeNotifications.createdAt));
}

/**
 * Mark badge notification as read
 */
export async function markBadgeNotificationRead(notificationId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(badgeNotifications)
    .set({
      isRead: true,
      readAt: new Date(),
    })
    .where(eq(badgeNotifications.id, notificationId));

  return true;
}

/**
 * Seed initial badge definitions
 */
export async function seedBadges() {
  const db = await getDb();
  if (!db) return;

  const badgeDefinitions = [
    // Earnings Badges
    {
      name: "First Earnings",
      description: "Earned your first 100,000 FCFA",
      icon: "💰",
      category: "earnings" as const,
      tier: "bronze" as const,
      criteria: JSON.stringify({ type: "earnings", threshold: 10000000 }), // 100k FCFA in cents
      points: 10,
    },
    {
      name: "Earnings Champion",
      description: "Earned 500,000 FCFA total",
      icon: "🏆",
      category: "earnings" as const,
      tier: "silver" as const,
      criteria: JSON.stringify({ type: "earnings", threshold: 50000000 }), // 500k FCFA in cents
      points: 50,
    },
    {
      name: "Millionaire",
      description: "Earned 1,000,000 FCFA total",
      icon: "💎",
      category: "earnings" as const,
      tier: "gold" as const,
      criteria: JSON.stringify({ type: "earnings", threshold: 100000000 }), // 1M FCFA in cents
      points: 100,
    },

    // Delivery Badges
    {
      name: "First Delivery",
      description: "Completed your first 10 deliveries",
      icon: "📦",
      category: "deliveries" as const,
      tier: "bronze" as const,
      criteria: JSON.stringify({ type: "deliveries", count: 10 }),
      points: 5,
    },
    {
      name: "Delivery Pro",
      description: "Completed 50 deliveries",
      icon: "🚀",
      category: "deliveries" as const,
      tier: "silver" as const,
      criteria: JSON.stringify({ type: "deliveries", count: 50 }),
      points: 25,
    },
    {
      name: "Delivery Master",
      description: "Completed 100 deliveries",
      icon: "⭐",
      category: "deliveries" as const,
      tier: "gold" as const,
      criteria: JSON.stringify({ type: "deliveries", count: 100 }),
      points: 50,
    },
    {
      name: "Delivery Legend",
      description: "Completed 500 deliveries",
      icon: "👑",
      category: "deliveries" as const,
      tier: "platinum" as const,
      criteria: JSON.stringify({ type: "deliveries", count: 500 }),
      points: 200,
    },

    // Quality Badges
    {
      name: "5-Star Service",
      description: "Maintained a 4.5+ star rating",
      icon: "⭐",
      category: "quality" as const,
      tier: "silver" as const,
      criteria: JSON.stringify({ type: "rating", threshold: 4.5 }),
      points: 30,
    },
    {
      name: "Perfect Service",
      description: "Maintained a 4.8+ star rating",
      icon: "🌟",
      category: "quality" as const,
      tier: "gold" as const,
      criteria: JSON.stringify({ type: "rating", threshold: 4.8 }),
      points: 75,
    },
  ];

  for (const badge of badgeDefinitions) {
    try {
      await db.insert(badges).values(badge);
    } catch (error) {
      // Ignore duplicate errors
      console.log(`[Badges] Skipping existing badge: ${badge.name}`);
    }
  }

  console.log("[Badges] Seeded badge definitions");
}


// ========================================
// I18N (Multi-Language Support) Functions
// ========================================

export async function getLanguages() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(languages)
    .where(eq(languages.isActive, true))
    .orderBy(desc(languages.isDefault), asc(languages.name));
}

export async function getDefaultLanguage() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(languages)
    .where(eq(languages.isDefault, true))
    .limit(1);

  return result[0] || null;
}

export async function getTranslations(languageCode: string, namespace?: string) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(translations.languageCode, languageCode)];
  
  if (namespace) {
    conditions.push(eq(translations.namespace, namespace));
  }

  return await db
    .select()
    .from(translations)
    .where(and(...conditions));
}

export async function upsertTranslation(data: InsertTranslation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(translations)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        value: data.value,
        context: data.context,
        updatedAt: new Date(),
      },
    });
}

export async function bulkUpsertTranslations(translationData: InsertTranslation[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < translationData.length; i += batchSize) {
    const batch = translationData.slice(i, i + batchSize);
    await db.insert(translations).values(batch).onDuplicateKeyUpdate({
      set: {
        value: sql`VALUES(value)`,
        context: sql`VALUES(context)`,
        updatedAt: new Date(),
      },
    });
  }
}

export async function deleteTranslation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(translations).where(eq(translations.id, id));
}

export async function getTranslationCoverage() {
  const db = await getDb();
  if (!db) return [];

  // Get count of translations per language and namespace
  const coverage = await db
    .select({
      languageCode: translations.languageCode,
      namespace: translations.namespace,
      count: sql<number>`COUNT(*)`,
    })
    .from(translations)
    .groupBy(translations.languageCode, translations.namespace);

  return coverage;
}


// ============================================================================
// ORDER CREATION
// ============================================================================

/**
 * Generate a unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * Create a new order with items
 */
export async function createOrder(orderData: {
  customerId: number;
  items: Array<{
    productId: number;
    productName: string;
    quantity: number;
    price: number; // In FCFA cents
  }>;
  deliveryAddress: string;
  deliveryLat?: string;
  deliveryLng?: string;
  pickupAddress?: string;
  pickupLat?: string;
  pickupLng?: string;
  paymentMethod: 'mtn_money' | 'orange_money' | 'cash';
  deliveryFee: number; // In FCFA cents
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate subtotal and total
  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + orderData.deliveryFee;

  // Generate unique order number
  const orderNumber = generateOrderNumber();

  // Create the order
  const [orderResult] = await db.insert(orders).values({
    orderNumber,
    customerId: orderData.customerId,
    status: 'pending',
    subtotal,
    deliveryFee: orderData.deliveryFee,
    total,
    paymentMethod: orderData.paymentMethod,
    paymentStatus: 'pending',
    deliveryAddress: orderData.deliveryAddress,
    deliveryLat: orderData.deliveryLat,
    deliveryLng: orderData.deliveryLng,
    pickupAddress: orderData.pickupAddress,
    pickupLat: orderData.pickupLat,
    pickupLng: orderData.pickupLng,
    notes: orderData.notes,
  });

  const orderId = orderResult.insertId;

  // Create order items
  if (orderData.items.length > 0) {
    await db.insert(orderItems).values(
      orderData.items.map(item => ({
        orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        total: item.price * item.quantity,
      }))
    );
  }

  return {
    id: orderId,
    orderNumber,
    subtotal,
    deliveryFee: orderData.deliveryFee,
    total,
  };
}

/**
 * Get all customers (users who have placed orders or all users)
 */
export async function getCustomers(filters?: { search?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  
  if (filters?.search) {
    conditions.push(
      or(
        like(users.name, `%${filters.search}%`),
        like(users.email, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  return await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(desc(users.createdAt))
    .limit(filters?.limit || 100);
}

/**
 * Get all active products for order creation
 */
export async function getActiveProducts(filters?: { categoryId?: number; search?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(products.isActive, true)];
  
  if (filters?.categoryId) {
    conditions.push(eq(products.categoryId, filters.categoryId));
  }
  
  if (filters?.search) {
    conditions.push(like(products.name, `%${filters.search}%`));
  }

  return await db
    .select({
      id: products.id,
      name: products.name,
      price: products.price,
      stock: products.stock,
      categoryId: products.categoryId,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(and(...conditions))
    .orderBy(products.name)
    .limit(filters?.limit || 100);
}

/**
 * Get all active delivery zones
 */
export async function getActiveDeliveryZones() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: deliveryZones.id,
      name: deliveryZones.name,
      city: deliveryZones.city,
      baseFee: deliveryZones.baseFee,
      perKmFee: deliveryZones.perKmFee,
      minDeliveryTime: deliveryZones.minDeliveryTime,
      maxDeliveryTime: deliveryZones.maxDeliveryTime,
    })
    .from(deliveryZones)
    .where(eq(deliveryZones.isActive, true))
    .orderBy(deliveryZones.name);
}


/**
 * Update order status with history tracking
 */
export async function updateOrderStatusWithHistory(
  orderId: number,
  newStatus: string,
  changedBy: number,
  changedByType: 'admin' | 'rider' | 'system' = 'admin',
  riderId?: number,
  notes?: string
) {
  const db = await getDb();
  if (!db) return null;

  // Get current order status
  const currentOrder = await getOrderById(orderId);
  if (!currentOrder) return null;

  const previousStatus = currentOrder.status;

  // Update order status
  await db.update(orders)
    .set({ 
      status: newStatus as any, 
      riderId: riderId || currentOrder.riderId,
      updatedAt: new Date() 
    })
    .where(eq(orders.id, orderId));

  // Insert status history record
  await db.insert(orderStatusHistory).values({
    orderId,
    previousStatus,
    newStatus,
    changedBy,
    changedByType,
    riderId,
    notes,
  });

  return await getOrderById(orderId);
}

/**
 * Get order status history
 */
export async function getOrderStatusHistory(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: orderStatusHistory.id,
      orderId: orderStatusHistory.orderId,
      previousStatus: orderStatusHistory.previousStatus,
      newStatus: orderStatusHistory.newStatus,
      changedBy: orderStatusHistory.changedBy,
      changedByType: orderStatusHistory.changedByType,
      riderId: orderStatusHistory.riderId,
      notes: orderStatusHistory.notes,
      createdAt: orderStatusHistory.createdAt,
    })
    .from(orderStatusHistory)
    .where(eq(orderStatusHistory.orderId, orderId))
    .orderBy(desc(orderStatusHistory.createdAt));
}

/**
 * Get available riders for assignment
 */
export async function getAvailableRiders() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: riders.id,
      name: riders.name,
      phone: riders.phone,
      rating: riders.rating,
      totalDeliveries: riders.totalDeliveries,
    })
    .from(riders)
    .where(eq(riders.status, 'approved'))
    .orderBy(desc(riders.rating));
}

/**
 * Get customer by ID with full details
 */
export async function getCustomerById(customerId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      createdAt: users.createdAt,
      lastSignedIn: users.lastSignedIn,
    })
    .from(users)
    .where(eq(users.id, customerId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get customer order history
 */
export async function getCustomerOrders(customerId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      total: orders.total,
      paymentMethod: orders.paymentMethod,
      paymentStatus: orders.paymentStatus,
      deliveryAddress: orders.deliveryAddress,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt))
    .limit(limit);
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(customerId: number) {
  const db = await getDb();
  if (!db) return { totalOrders: 0, totalSpent: 0, avgOrderValue: 0 };

  const result = await db
    .select({
      totalOrders: count(orders.id),
      totalSpent: sum(orders.total),
    })
    .from(orders)
    .where(eq(orders.customerId, customerId));

  const stats = result[0];
  const totalOrders = Number(stats?.totalOrders) || 0;
  const totalSpent = Number(stats?.totalSpent) || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;

  return { totalOrders, totalSpent, avgOrderValue };
}

/**
 * Add customer note
 */
export async function addCustomerNote(customerId: number, note: string, createdBy: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(customerNotes).values({
    customerId,
    note,
    createdBy,
  });

  return { id: Number(result[0].insertId), customerId, note, createdBy };
}

/**
 * Get customer notes
 */
export async function getCustomerNotes(customerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: customerNotes.id,
      note: customerNotes.note,
      createdBy: customerNotes.createdBy,
      createdAt: customerNotes.createdAt,
    })
    .from(customerNotes)
    .where(eq(customerNotes.customerId, customerId))
    .orderBy(desc(customerNotes.createdAt));
}

/**
 * Get all customer tags
 */
export async function getCustomerTags() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(customerTags)
    .orderBy(customerTags.name);
}

/**
 * Create customer tag
 */
export async function createCustomerTag(name: string, color: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(customerTags).values({ name, color });
  return { id: Number(result[0].insertId), name, color };
}

/**
 * Get tags assigned to a customer
 */
export async function getCustomerTagAssignments(customerId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: customerTagAssignments.id,
      tagId: customerTagAssignments.tagId,
      tagName: customerTags.name,
      tagColor: customerTags.color,
      createdAt: customerTagAssignments.createdAt,
    })
    .from(customerTagAssignments)
    .innerJoin(customerTags, eq(customerTagAssignments.tagId, customerTags.id))
    .where(eq(customerTagAssignments.customerId, customerId));
}

/**
 * Assign tag to customer
 */
export async function assignTagToCustomer(customerId: number, tagId: number, assignedBy: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(customerTagAssignments).values({
    customerId,
    tagId,
    assignedBy,
  });

  return { id: Number(result[0].insertId), customerId, tagId };
}

/**
 * Remove tag from customer
 */
export async function removeTagFromCustomer(customerId: number, tagId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(customerTagAssignments)
    .where(and(
      eq(customerTagAssignments.customerId, customerId),
      eq(customerTagAssignments.tagId, tagId)
    ));

  return true;
}

/**
 * Update order with edit history
 */
export async function updateOrderWithHistory(
  orderId: number,
  updates: {
    deliveryAddress?: string;
    deliveryLat?: string;
    deliveryLng?: string;
    paymentMethod?: string;
    notes?: string;
  },
  editedBy: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) return null;

  // Get current order
  const currentOrder = await getOrderById(orderId);
  if (!currentOrder) return null;

  // Track changes
  const changes: Array<{ field: string; oldValue: string | null; newValue: string | null }> = [];

  if (updates.deliveryAddress && updates.deliveryAddress !== currentOrder.deliveryAddress) {
    changes.push({
      field: 'deliveryAddress',
      oldValue: currentOrder.deliveryAddress,
      newValue: updates.deliveryAddress,
    });
  }

  if (updates.paymentMethod && updates.paymentMethod !== currentOrder.paymentMethod) {
    changes.push({
      field: 'paymentMethod',
      oldValue: currentOrder.paymentMethod,
      newValue: updates.paymentMethod,
    });
  }

  if (updates.notes !== undefined && updates.notes !== currentOrder.notes) {
    changes.push({
      field: 'notes',
      oldValue: currentOrder.notes || null,
      newValue: updates.notes || null,
    });
  }

  // Apply updates
  const updateData: any = { updatedAt: new Date() };
  if (updates.deliveryAddress) updateData.deliveryAddress = updates.deliveryAddress;
  if (updates.deliveryLat) updateData.deliveryLat = updates.deliveryLat;
  if (updates.deliveryLng) updateData.deliveryLng = updates.deliveryLng;
  if (updates.paymentMethod) updateData.paymentMethod = updates.paymentMethod;
  if (updates.notes !== undefined) updateData.notes = updates.notes;

  await db.update(orders)
    .set(updateData)
    .where(eq(orders.id, orderId));

  // Record edit history
  for (const change of changes) {
    await db.insert(orderEditHistory).values({
      orderId,
      editedBy,
      fieldChanged: change.field,
      oldValue: change.oldValue,
      newValue: change.newValue,
      reason,
    });
  }

  return await getOrderById(orderId);
}

/**
 * Update order items
 */
export async function updateOrderItems(
  orderId: number,
  items: Array<{ productId: number; productName: string; quantity: number; price: number }>,
  editedBy: number,
  reason?: string
) {
  const db = await getDb();
  if (!db) return null;

  // Get current order
  const currentOrder = await getOrderById(orderId);
  if (!currentOrder) return null;

  // Get current items
  const currentItems = await getOrderItems(orderId);

  // Delete existing items
  await db.delete(orderItems).where(eq(orderItems.orderId, orderId));

  // Insert new items and calculate totals
  let subtotal = 0;
  for (const item of items) {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;
    
    await db.insert(orderItems).values({
      orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: itemTotal,
    });
  }

  // Update order totals
  const total = subtotal + currentOrder.deliveryFee;
  await db.update(orders)
    .set({ subtotal, total, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  // Record edit history
  await db.insert(orderEditHistory).values({
    orderId,
    editedBy,
    fieldChanged: 'items',
    oldValue: JSON.stringify(currentItems),
    newValue: JSON.stringify(items),
    reason,
  });

  return await getOrderById(orderId);
}

/**
 * Get order edit history
 */
export async function getOrderEditHistory(orderId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select({
      id: orderEditHistory.id,
      orderId: orderEditHistory.orderId,
      editedBy: orderEditHistory.editedBy,
      fieldChanged: orderEditHistory.fieldChanged,
      oldValue: orderEditHistory.oldValue,
      newValue: orderEditHistory.newValue,
      reason: orderEditHistory.reason,
      createdAt: orderEditHistory.createdAt,
    })
    .from(orderEditHistory)
    .where(eq(orderEditHistory.orderId, orderId))
    .orderBy(desc(orderEditHistory.createdAt));
}

// ============================================================================
// SMS Logs Management
// ============================================================================

import { smsLogs, InsertSMSLog, SMSLog } from "../drizzle/schema";

export async function getSMSLogs(options: {
  status?: string;
  startDate?: Date;
  endDate?: Date;
  recipient?: string;
  orderId?: number;
  limit?: number;
  offset?: number;
}): Promise<SMSLog[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(smsLogs);
    const conditions = [];

    if (options.status && options.status !== 'all') {
      conditions.push(eq(smsLogs.status, options.status as "sent" | "delivered" | "failed" | "pending" | "rejected"));
    }
    if (options.startDate) {
      conditions.push(gte(smsLogs.sentAt, options.startDate));
    }
    if (options.endDate) {
      conditions.push(lte(smsLogs.sentAt, options.endDate));
    }
    if (options.recipient) {
      conditions.push(like(smsLogs.recipient, `%${options.recipient}%`));
    }
    if (options.orderId) {
      conditions.push(eq(smsLogs.orderId, options.orderId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query
      .orderBy(desc(smsLogs.sentAt))
      .limit(options.limit || 50)
      .offset(options.offset || 0);

    return result;
  } catch (error) {
    console.error('[Database] Failed to get SMS logs:', error);
    return [];
  }
}

export async function getSMSLogById(id: number): Promise<SMSLog | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(smsLogs).where(eq(smsLogs.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get SMS log by ID:', error);
    return null;
  }
}

export async function createSMSLog(log: InsertSMSLog): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(smsLogs).values(log);
    return result[0].insertId;
  } catch (error) {
    console.error('[Database] Failed to create SMS log:', error);
    return null;
  }
}

export async function updateSMSLogStatus(
  id: number,
  status: "sent" | "delivered" | "failed" | "pending" | "rejected",
  errorMessage?: string,
  deliveredAt?: Date
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    const updateData: Partial<SMSLog> = { status };
    if (errorMessage) updateData.errorMessage = errorMessage;
    if (deliveredAt) updateData.deliveredAt = deliveredAt;

    await db.update(smsLogs).set(updateData).where(eq(smsLogs.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to update SMS log status:', error);
    return false;
  }
}

export async function getSMSStats(): Promise<{
  total: number;
  sent: number;
  delivered: number;
  failed: number;
  pending: number;
}> {
  const db = await getDb();
  if (!db) return { total: 0, sent: 0, delivered: 0, failed: 0, pending: 0 };

  try {
    const allLogs = await db.select().from(smsLogs);
    const stats = {
      total: allLogs.length,
      sent: allLogs.filter(l => l.status === 'sent').length,
      delivered: allLogs.filter(l => l.status === 'delivered').length,
      failed: allLogs.filter(l => l.status === 'failed').length,
      pending: allLogs.filter(l => l.status === 'pending').length,
    };
    return stats;
  } catch (error) {
    console.error('[Database] Failed to get SMS stats:', error);
    return { total: 0, sent: 0, delivered: 0, failed: 0, pending: 0 };
  }
}

export async function retrySMSDelivery(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Reset status to pending for retry
    await db.update(smsLogs).set({ 
      status: 'pending',
      errorMessage: null,
    }).where(eq(smsLogs.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to retry SMS delivery:', error);
    return false;
  }
}

// ============================================================================
// Do Not Disturb Schedule Management
// ============================================================================

import { dndSchedules, InsertDNDSchedule, DNDSchedule } from "../drizzle/schema";

export async function getDNDSchedules(userId: number): Promise<DNDSchedule[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db.select().from(dndSchedules).where(eq(dndSchedules.userId, userId));
  } catch (error) {
    console.error('[Database] Failed to get DND schedules:', error);
    return [];
  }
}

export async function getDNDScheduleById(id: number): Promise<DNDSchedule | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(dndSchedules).where(eq(dndSchedules.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get DND schedule by ID:', error);
    return null;
  }
}

export async function createDNDSchedule(schedule: InsertDNDSchedule): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(dndSchedules).values(schedule);
    return result[0].insertId;
  } catch (error) {
    console.error('[Database] Failed to create DND schedule:', error);
    return null;
  }
}

export async function updateDNDSchedule(id: number, updates: Partial<InsertDNDSchedule>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(dndSchedules).set(updates).where(eq(dndSchedules.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to update DND schedule:', error);
    return false;
  }
}

export async function deleteDNDSchedule(id: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(dndSchedules).where(eq(dndSchedules.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to delete DND schedule:', error);
    return false;
  }
}

export async function toggleDNDSchedule(id: number, isActive: boolean): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(dndSchedules).set({ isActive }).where(eq(dndSchedules.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to toggle DND schedule:', error);
    return false;
  }
}

export async function isInDNDPeriod(userId: number): Promise<{ isDND: boolean; schedule: DNDSchedule | null }> {
  const db = await getDb();
  if (!db) return { isDND: false, schedule: null };

  try {
    const schedules = await db.select().from(dndSchedules)
      .where(and(
        eq(dndSchedules.userId, userId),
        eq(dndSchedules.isActive, true)
      ));

    const now = new Date();
    const currentDay = now.getDay(); // 0-6, Sunday = 0
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    for (const schedule of schedules) {
      const days = schedule.daysOfWeek.split(',').map(Number);
      if (!days.includes(currentDay)) continue;

      const { startTime, endTime } = schedule;
      
      // Handle overnight schedules (e.g., 22:00 - 07:00)
      if (startTime > endTime) {
        if (currentTime >= startTime || currentTime <= endTime) {
          return { isDND: true, schedule };
        }
      } else {
        if (currentTime >= startTime && currentTime <= endTime) {
          return { isDND: true, schedule };
        }
      }
    }

    return { isDND: false, schedule: null };
  } catch (error) {
    console.error('[Database] Failed to check DND period:', error);
    return { isDND: false, schedule: null };
  }
}

// ============================================================================
// Seller Application Management
// ============================================================================

import { sellerApplications, InsertSellerApplication, SellerApplication } from "../drizzle/schema";

export async function getSellerApplications(options?: {
  status?: string;
  search?: string;
}): Promise<SellerApplication[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    let query = db.select().from(sellerApplications);
    const conditions = [];

    if (options?.status && options.status !== 'all') {
      conditions.push(eq(sellerApplications.status, options.status as any));
    }
    if (options?.search) {
      conditions.push(
        or(
          like(sellerApplications.businessName, `%${options.search}%`),
          like(sellerApplications.applicantName, `%${options.search}%`),
          like(sellerApplications.applicantEmail, `%${options.search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    return await query.orderBy(desc(sellerApplications.createdAt));
  } catch (error) {
    console.error('[Database] Failed to get seller applications:', error);
    return [];
  }
}

export async function getSellerApplicationById(id: number): Promise<SellerApplication | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.select().from(sellerApplications).where(eq(sellerApplications.id, id)).limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('[Database] Failed to get seller application by ID:', error);
    return null;
  }
}

export async function createSellerApplication(application: InsertSellerApplication): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(sellerApplications).values(application);
    return result[0].insertId;
  } catch (error) {
    console.error('[Database] Failed to create seller application:', error);
    return null;
  }
}

export async function updateSellerApplication(id: number, updates: Partial<InsertSellerApplication>): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(sellerApplications).set(updates).where(eq(sellerApplications.id, id));
    return true;
  } catch (error) {
    console.error('[Database] Failed to update seller application:', error);
    return false;
  }
}

export async function approveSellerApplication(
  applicationId: number,
  reviewerId: number,
  reviewNotes?: string
): Promise<{ success: boolean; sellerId?: number }> {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    // Get the application
    const application = await getSellerApplicationById(applicationId);
    if (!application) return { success: false };

    // Create seller from application
    const sellerResult = await db.insert(sellers).values({
      userId: 0, // Will be linked when user registers
      businessName: application.businessName,
      businessType: application.businessType,
      businessAddress: application.businessAddress,
      businessPhone: application.applicantPhone,
      businessEmail: application.applicantEmail,
      bankName: application.bankName,
      bankAccountNumber: application.bankAccountNumber,
      mobileMoneyProvider: application.mobileMoneyProvider,
      mobileMoneyNumber: application.mobileMoneyNumber,
      status: 'approved',
      verificationDocuments: JSON.stringify([
        application.idDocument,
        application.businessLicense,
        application.taxCertificate,
        application.proofOfAddress,
      ].filter(Boolean)),
    });

    const sellerId = sellerResult[0].insertId;

    // Update application status
    await db.update(sellerApplications).set({
      status: 'approved',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes,
      sellerId,
    }).where(eq(sellerApplications.id, applicationId));

    return { success: true, sellerId };
  } catch (error) {
    console.error('[Database] Failed to approve seller application:', error);
    return { success: false };
  }
}

export async function rejectSellerApplication(
  applicationId: number,
  reviewerId: number,
  rejectionReason: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(sellerApplications).set({
      status: 'rejected',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      rejectionReason,
    }).where(eq(sellerApplications.id, applicationId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to reject seller application:', error);
    return false;
  }
}

export async function requestMoreInfoForApplication(
  applicationId: number,
  reviewerId: number,
  reviewNotes: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.update(sellerApplications).set({
      status: 'requires_info',
      reviewedBy: reviewerId,
      reviewedAt: new Date(),
      reviewNotes,
    }).where(eq(sellerApplications.id, applicationId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to request more info:', error);
    return false;
  }
}

// ============================================================================
// Bulk Order Operations
// ============================================================================

export async function bulkUpdateOrderStatus(
  orderIds: number[],
  status: string,
  updatedBy: number,
  notes?: string
): Promise<{ success: number; failed: number }> {
  const db = await getDb();
  if (!db) return { success: 0, failed: orderIds.length };

  let success = 0;
  let failed = 0;

  try {
    for (const orderId of orderIds) {
      try {
        await db.update(orders).set({ 
          status: status as any,
          updatedAt: new Date() 
        }).where(eq(orders.id, orderId));
        
        // Log status change
        await db.insert(orderStatusHistory).values({
          orderId,
          newStatus: status,
          changedBy: updatedBy,
          changedByType: 'admin' as const,
          notes: notes || `Bulk status update to ${status}`,
        });
        
        success++;
      } catch (error) {
        console.error(`Failed to update order ${orderId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  } catch (error) {
    console.error('[Database] Failed to bulk update orders:', error);
    return { success: 0, failed: orderIds.length };
  }
}

export async function bulkAssignRider(
  orderIds: number[],
  riderId: number,
  updatedBy: number
): Promise<{ success: number; failed: number }> {
  const db = await getDb();
  if (!db) return { success: 0, failed: orderIds.length };

  let success = 0;
  let failed = 0;

  try {
    for (const orderId of orderIds) {
      try {
        await db.update(orders).set({ 
          riderId,
          status: 'rider_assigned' as any,
          updatedAt: new Date() 
        }).where(eq(orders.id, orderId));
        
        // Log status change
        await db.insert(orderStatusHistory).values({
          orderId,
          newStatus: 'rider_assigned',
          changedBy: updatedBy,
          changedByType: 'admin' as const,
          riderId,
          notes: `Bulk assigned to rider ID: ${riderId}`,
        });
        
        success++;
      } catch (error) {
        console.error(`Failed to assign rider to order ${orderId}:`, error);
        failed++;
      }
    }

    return { success, failed };
  } catch (error) {
    console.error('[Database] Failed to bulk assign rider:', error);
    return { success: 0, failed: orderIds.length };
  }
}

// ============================================================================
// Order Assignment to Riders
// ============================================================================

export async function assignOrderToRider(
  orderId: number,
  riderId: number,
  assignedBy: number,
  notes?: string
): Promise<{ success: boolean; order?: any; rider?: any }> {
  const db = await getDb();
  if (!db) return { success: false };

  try {
    // Get current order
    const order = await getOrderById(orderId);
    if (!order) {
      return { success: false };
    }

    // Get rider info
    const riderResult = await db.select().from(riders).where(eq(riders.id, riderId)).limit(1);
    if (riderResult.length === 0) {
      return { success: false };
    }
    const rider = riderResult[0];

    // Check if rider is available (approved status)
    if (rider.status !== 'approved') {
      return { success: false };
    }

    const previousStatus = order.status;

    // Update order with rider assignment
    await db.update(orders).set({
      riderId,
      status: 'rider_assigned' as any,
      updatedAt: new Date(),
    }).where(eq(orders.id, orderId));

    // Log status change
    await db.insert(orderStatusHistory).values({
      orderId,
      previousStatus,
      newStatus: 'rider_assigned',
      changedBy: assignedBy,
      changedByType: 'admin' as const,
      riderId,
      notes: notes || `Assigned to ${rider.name}`,
    });

    // Get updated order
    const updatedOrder = await getOrderById(orderId);

    return { success: true, order: updatedOrder, rider };
  } catch (error) {
    console.error('[Database] Failed to assign order to rider:', error);
    return { success: false };
  }
}

export async function unassignOrderFromRider(
  orderId: number,
  unassignedBy: number,
  reason?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Get current order
    const order = await getOrderById(orderId);
    if (!order) return false;

    const previousStatus = order.status;

    // Update order to remove rider
    await db.update(orders).set({
      riderId: null,
      status: 'confirmed' as any,
      updatedAt: new Date(),
    }).where(eq(orders.id, orderId));

    // Log status change
    await db.insert(orderStatusHistory).values({
      orderId,
      previousStatus,
      newStatus: 'confirmed',
      changedBy: unassignedBy,
      changedByType: 'admin' as const,
      notes: reason || 'Rider unassigned',
    });

    return true;
  } catch (error) {
    console.error('[Database] Failed to unassign order from rider:', error);
    return false;
  }
}

export async function getRiderAssignmentStats(riderId: number): Promise<{
  activeOrders: number;
  completedToday: number;
  totalDeliveries: number;
}> {
  const db = await getDb();
  if (!db) return { activeOrders: 0, completedToday: 0, totalDeliveries: 0 };

  try {
    // Get active orders count
    const activeResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(and(
        eq(orders.riderId, riderId),
        inArray(orders.status, ['rider_assigned', 'in_transit', 'quality_verification'] as any)
      ));

    // Get completed today count
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedResult = await db.select({ count: sql<number>`COUNT(*)` })
      .from(orders)
      .where(and(
        eq(orders.riderId, riderId),
        eq(orders.status, 'delivered' as any),
        gte(orders.updatedAt, today)
      ));

    // Get rider total deliveries
    const riderResult = await db.select({ totalDeliveries: riders.totalDeliveries })
      .from(riders)
      .where(eq(riders.id, riderId))
      .limit(1);

    return {
      activeOrders: Number(activeResult[0]?.count || 0),
      completedToday: Number(completedResult[0]?.count || 0),
      totalDeliveries: riderResult[0]?.totalDeliveries || 0,
    };
  } catch (error) {
    console.error('[Database] Failed to get rider assignment stats:', error);
    return { activeOrders: 0, completedToday: 0, totalDeliveries: 0 };
  }
}


/**
 * Generate fraud report data
 */
export async function generateFraudReport(filters?: {
  startDate?: Date;
  endDate?: Date;
  severity?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(fraudAlerts.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(fraudAlerts.createdAt, filters.endDate));
  }
  if (filters?.severity) {
    conditions.push(eq(fraudAlerts.severity, filters.severity as any));
  }
  if (filters?.status) {
    conditions.push(eq(fraudAlerts.status, filters.status as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get all alerts matching criteria
  const alerts = await db
    .select()
    .from(fraudAlerts)
    .leftJoin(users, eq(users.id, fraudAlerts.userId))
    .where(whereClause)
    .orderBy(desc(fraudAlerts.createdAt));

  // Calculate summary statistics
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter((a) => a.fraudAlerts.severity === "critical").length;
  const highAlerts = alerts.filter((a) => a.fraudAlerts.severity === "high").length;
  const mediumAlerts = alerts.filter((a) => a.fraudAlerts.severity === "medium").length;
  const lowAlerts = alerts.filter((a) => a.fraudAlerts.severity === "low").length;

  const resolvedAlerts = alerts.filter((a) => a.fraudAlerts.status === "resolved").length;
  const confirmedFraud = alerts.filter((a) => a.fraudAlerts.status === "confirmed").length;
  const falsePositives = alerts.filter((a) => a.fraudAlerts.status === "false_positive").length;

  // Group by alert type
  const alertsByType: Record<string, number> = {};
  alerts.forEach((a) => {
    const type = a.fraudAlerts.alertType;
    alertsByType[type] = (alertsByType[type] || 0) + 1;
  });

  // Calculate average risk score
  const avgRiskScore =
    alerts.length > 0
      ? alerts.reduce((sum, a) => sum + (a.fraudAlerts.riskScore || 0), 0) / alerts.length
      : 0;

  // Get top affected users
  const userAlertCounts: Record<number, { count: number; name: string | null }> = {};
  alerts.forEach((a) => {
    if (a.fraudAlerts.userId) {
      if (!userAlertCounts[a.fraudAlerts.userId]) {
        userAlertCounts[a.fraudAlerts.userId] = { count: 0, name: a.users?.name || null };
      }
      userAlertCounts[a.fraudAlerts.userId].count++;
    }
  });

  const topAffectedUsers = Object.entries(userAlertCounts)
    .map(([userId, data]) => ({ userId: parseInt(userId), ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    summary: {
      totalAlerts,
      bySeverity: {
        critical: criticalAlerts,
        high: highAlerts,
        medium: mediumAlerts,
        low: lowAlerts,
      },
      byStatus: {
        resolved: resolvedAlerts,
        confirmed: confirmedFraud,
        falsePositives,
        pending: totalAlerts - resolvedAlerts - confirmedFraud - falsePositives,
      },
      alertsByType,
      averageRiskScore: Math.round(avgRiskScore * 100) / 100,
    },
    topAffectedUsers,
    recentAlerts: alerts.slice(0, 20).map((a) => ({
      id: a.fraudAlerts.id,
      alertType: a.fraudAlerts.alertType,
      severity: a.fraudAlerts.severity,
      riskScore: a.fraudAlerts.riskScore,
      status: a.fraudAlerts.status,
      userName: a.users?.name,
      createdAt: a.fraudAlerts.createdAt,
    })),
    generatedAt: new Date(),
    filters,
  };
}


/**
 * Generate safety report data
 */
export async function generateSafetyReport(filters?: {
  startDate?: Date;
  endDate?: Date;
  severity?: string;
  incidentType?: string;
}) {
  const db = await getDb();
  if (!db) return null;

  const conditions = [];
  if (filters?.startDate) {
    conditions.push(gte(incidents.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(incidents.createdAt, filters.endDate));
  }
  if (filters?.severity) {
    conditions.push(eq(incidents.severity, filters.severity as any));
  }
  if (filters?.incidentType) {
    conditions.push(eq(incidents.incidentType, filters.incidentType as any));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get all incidents matching criteria
  const incidentList = await db
    .select()
    .from(incidents)
    .leftJoin(riders, eq(riders.id, incidents.riderId))
    .where(whereClause)
    .orderBy(desc(incidents.createdAt));

  // Calculate summary statistics
  const totalIncidents = incidentList.length;
  const criticalIncidents = incidentList.filter((i) => i.incidents.severity === "critical").length;
  const severeIncidents = incidentList.filter((i) => i.incidents.severity === "severe").length;
  const moderateIncidents = incidentList.filter((i) => i.incidents.severity === "moderate").length;
  const minorIncidents = incidentList.filter((i) => i.incidents.severity === "minor").length;

  const resolvedIncidents = incidentList.filter((i) => i.incidents.status === "resolved").length;
  const investigatingIncidents = incidentList.filter((i) => i.incidents.status === "investigating").length;
  const pendingIncidents = incidentList.filter((i) => i.incidents.status === "pending").length;

  // Group by incident type
  const incidentsByType: Record<string, number> = {};
  incidentList.forEach((i) => {
    const type = i.incidents.incidentType;
    incidentsByType[type] = (incidentsByType[type] || 0) + 1;
  });

  // Calculate total claims and compensation
  const totalClaimAmount = incidentList.reduce((sum, i) => sum + (i.incidents.claimAmount || 0), 0);
  const totalCompensation = incidentList.reduce((sum, i) => sum + (i.incidents.compensationAmount || 0), 0);

  // Get riders with most incidents
  const riderIncidentCounts: Record<number, { count: number; name: string | null }> = {};
  incidentList.forEach((i) => {
    if (i.incidents.riderId) {
      if (!riderIncidentCounts[i.incidents.riderId]) {
        riderIncidentCounts[i.incidents.riderId] = { count: 0, name: i.riders?.name || null };
      }
      riderIncidentCounts[i.incidents.riderId].count++;
    }
  });

  const ridersWithMostIncidents = Object.entries(riderIncidentCounts)
    .map(([riderId, data]) => ({ riderId: parseInt(riderId), ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    summary: {
      totalIncidents,
      bySeverity: {
        critical: criticalIncidents,
        severe: severeIncidents,
        moderate: moderateIncidents,
        minor: minorIncidents,
      },
      byStatus: {
        resolved: resolvedIncidents,
        investigating: investigatingIncidents,
        pending: pendingIncidents,
      },
      incidentsByType,
      financials: {
        totalClaimAmount,
        totalCompensation,
        pendingClaims: totalClaimAmount - totalCompensation,
      },
    },
    ridersWithMostIncidents,
    recentIncidents: incidentList.slice(0, 20).map((i) => ({
      id: i.incidents.id,
      incidentType: i.incidents.incidentType,
      severity: i.incidents.severity,
      status: i.incidents.status,
      riderName: i.riders?.name,
      claimAmount: i.incidents.claimAmount,
      createdAt: i.incidents.createdAt,
    })),
    generatedAt: new Date(),
    filters,
  };
}


/**
 * Send loyalty points earned notification
 */
export async function sendLoyaltyPointsNotification(
  userId: number,
  points: number,
  reason: string,
  newBalance: number
) {
  const db = await getDb();
  if (!db) return null;

  const notification = await createNotification({
    userId,
    type: "system",
    title: `You earned ${points} loyalty points!`,
    message: `${reason}. Your new balance is ${newBalance} points.`,
  });

  return notification;
}

/**
 * Send tier upgrade notification
 */
export async function sendTierUpgradeNotification(
  userId: number,
  oldTier: string,
  newTier: string,
  benefits: string[]
) {
  const db = await getDb();
  if (!db) return null;

  const benefitsList = benefits.length > 0 ? ` New benefits: ${benefits.join(", ")}` : "";
  
  const notification = await createNotification({
    userId,
    type: "system",
    title: `Congratulations! You've been upgraded to ${newTier}!`,
    message: `You've moved from ${oldTier} to ${newTier}.${benefitsList}`,
  });

  return notification;
}

/**
 * Send reward available notification
 */
export async function sendRewardAvailableNotification(
  userId: number,
  rewardName: string,
  pointsCost: number
) {
  const db = await getDb();
  if (!db) return null;

  const notification = await createNotification({
    userId,
    type: "system",
    title: `New reward available: ${rewardName}`,
    message: `You can now redeem ${rewardName} for ${pointsCost} points.`,
  });

  return notification;
}

/**
 * Check and process tier upgrade
 */
export async function checkAndProcessTierUpgrade(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get user's current points and tier
  const [userPoints] = await db
    .select()
    .from(userLoyaltyPoints)
    .where(eq(userLoyaltyPoints.userId, userId))
    .limit(1);

  if (!userPoints) return null;

  // Get all tiers ordered by minimum points
  const tiers = await db
    .select()
    .from(loyaltyTiers)
    .orderBy(asc(loyaltyTiers.minPoints));

  // Find the appropriate tier based on lifetime points
  let newTier = tiers[0];
  for (const tier of tiers) {
    if (userPoints.lifetimePoints >= tier.minPoints) {
      newTier = tier;
    }
  }

  // Check if tier changed
  if (newTier && userPoints.currentTierId !== newTier.id) {
    const oldTier = tiers.find((t) => t.id === userPoints.currentTierId);
    
    // Update user's tier
    await db
      .update(userLoyaltyPoints)
      .set({ currentTierId: newTier.id })
      .where(eq(userLoyaltyPoints.userId, userId));

    // Send notification
    const benefits = newTier.benefits ? JSON.parse(newTier.benefits as string) : [];
    await sendTierUpgradeNotification(
      userId,
      oldTier?.name || "Basic",
      newTier.name,
      benefits
    );

    return { upgraded: true, oldTier: oldTier?.name, newTier: newTier.name };
  }

  return { upgraded: false };
}


/**
 * Send training course completion notification
 */
export async function sendCourseCompletionNotification(
  riderId: number,
  moduleTitle: string,
  score: number
) {
  const db = await getDb();
  if (!db) return null;

  // Get rider info
  const rider = await getRiderById(riderId);
  if (!rider) return null;

  const notification = await createNotification({
    userId: riderId, // Use riderId as userId for rider notifications
    type: "system",
    title: `Training Complete: ${moduleTitle}`,
    message: `Congratulations! You completed "${moduleTitle}" with a score of ${score}%.`,
  });

  return notification;
}

/**
 * Send certification earned notification
 */
export async function sendCertificationEarnedNotification(
  riderId: number,
  certificationName: string,
  expiryDate?: Date
) {
  const db = await getDb();
  if (!db) return null;

  // Get rider info
  const rider = await getRiderById(riderId);
  if (!rider) return null;

  const expiryInfo = expiryDate ? ` Valid until ${expiryDate.toLocaleDateString()}.` : "";
  
  const notification = await createNotification({
    userId: riderId, // Use riderId as userId for rider notifications
    type: "system",
    title: `Certification Earned: ${certificationName}`,
    message: `You have earned the "${certificationName}" certification.${expiryInfo}`,
  });

  return notification;
}

/**
 * Send training reminder notification
 */
export async function sendTrainingReminderNotification(
  riderId: number,
  moduleTitle: string,
  dueDate: Date
) {
  const db = await getDb();
  if (!db) return null;

  // Get rider info
  const rider = await getRiderById(riderId);
  if (!rider) return null;

  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  
  const notification = await createNotification({
    userId: riderId, // Use riderId as userId for rider notifications
    type: "system",
    title: `Training Reminder: ${moduleTitle}`,
    message: `Please complete "${moduleTitle}" within ${daysUntilDue} days.`,
  });

  return notification;
}

/**
 * Check and send mandatory training reminders
 */
export async function sendMandatoryTrainingReminders() {
  const db = await getDb();
  if (!db) return [];

  // Get all active riders
  const activeRiders = await getAllRiders({ status: "approved" });
  const reminders: { riderId: number; moduleTitle: string }[] = [];

  for (const rider of activeRiders) {
    // Get rider's training progress
    const progress = await getRiderTrainingProgress(rider.id);
    
    // Get all mandatory modules
    const mandatoryModules = await getTrainingModules({ isMandatory: true, isActive: true });
    
    // Find incomplete mandatory modules
    for (const module of mandatoryModules) {
      const moduleProgress = progress.find((p) => p.moduleId === module.id);
      if (!moduleProgress || moduleProgress.status !== "completed") {
        reminders.push({ riderId: rider.id, moduleTitle: module.title });
      }
    }
  }

  return reminders;
}


// ============================================================================
// SPRINT 24: Customer Segmentation, Marketing Automation, Risk Management,
// Compliance, Webhooks, Vendors, Fleet, and Route Optimization
// ============================================================================

import {
  customerSegments, InsertCustomerSegment, CustomerSegment,
  marketingAutomations, InsertMarketingAutomation, MarketingAutomation,
  riskAssessments, InsertRiskAssessment, RiskAssessment,
  complianceChecks, InsertComplianceCheck, ComplianceCheck,
  complianceViolations, InsertComplianceViolation, ComplianceViolation,
  webhookEndpoints, InsertWebhookEndpoint, WebhookEndpoint,
  webhookLogs, InsertWebhookLog, WebhookLog,
  vendors, InsertVendor, Vendor,
  vendorContracts, InsertVendorContract, VendorContract,
  vehicles, InsertVehicle, Vehicle,
  vehicleMaintenance, InsertVehicleMaintenance, VehicleMaintenance,
  deliveryRoutes, InsertDeliveryRoute, DeliveryRoute,
  routeWaypoints, InsertRouteWaypoint, RouteWaypoint
} from "../drizzle/schema";

// ============================================================================
// Customer Segmentation Functions
// ============================================================================

export async function getCustomerSegments(filters?: { isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(customerSegments);
  
  if (filters?.isActive !== undefined) {
    query = query.where(eq(customerSegments.isActive, filters.isActive)) as typeof query;
  }
  
  return await query.orderBy(desc(customerSegments.createdAt));
}

export async function getCustomerSegmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(customerSegments).where(eq(customerSegments.id, id)).limit(1);
  return result[0] || null;
}

export async function createCustomerSegment(segment: InsertCustomerSegment) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(customerSegments).values(segment);
  return { id: Number(result[0].insertId), ...segment };
}

export async function updateCustomerSegment(id: number, updates: Partial<InsertCustomerSegment>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(customerSegments).set(updates).where(eq(customerSegments.id, id));
  return await getCustomerSegmentById(id);
}

export async function deleteCustomerSegment(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(customerSegments).where(eq(customerSegments.id, id));
  return true;
}

// ============================================================================
// Marketing Automation Functions
// ============================================================================

export async function getMarketingAutomations(filters?: { status?: string; segmentId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(marketingAutomations);
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(marketingAutomations.status, filters.status as any));
  }
  if (filters?.segmentId) {
    conditions.push(eq(marketingAutomations.segmentId, filters.segmentId));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(marketingAutomations.createdAt));
}

export async function getMarketingAutomationById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(marketingAutomations).where(eq(marketingAutomations.id, id)).limit(1);
  return result[0] || null;
}

export async function createMarketingAutomation(automation: InsertMarketingAutomation) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(marketingAutomations).values(automation);
  return { id: Number(result[0].insertId), ...automation };
}

export async function updateMarketingAutomation(id: number, updates: Partial<InsertMarketingAutomation>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(marketingAutomations).set(updates).where(eq(marketingAutomations.id, id));
  return await getMarketingAutomationById(id);
}

export async function deleteMarketingAutomation(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(marketingAutomations).where(eq(marketingAutomations.id, id));
  return true;
}

export async function updateAutomationMetrics(id: number, metrics: { sentCount?: number; openedCount?: number; clickedCount?: number; convertedCount?: number }) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(marketingAutomations).set(metrics).where(eq(marketingAutomations.id, id));
  return await getMarketingAutomationById(id);
}

// ============================================================================
// Risk Assessment Functions
// ============================================================================

export async function getRiskAssessments(filters?: { category?: string; severity?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(riskAssessments);
  
  const conditions = [];
  if (filters?.category) {
    conditions.push(eq(riskAssessments.category, filters.category as any));
  }
  if (filters?.severity) {
    conditions.push(eq(riskAssessments.severity, filters.severity as any));
  }
  if (filters?.status) {
    conditions.push(eq(riskAssessments.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(riskAssessments.riskScore));
}

export async function getRiskAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(riskAssessments).where(eq(riskAssessments.id, id)).limit(1);
  return result[0] || null;
}

export async function createRiskAssessment(assessment: InsertRiskAssessment) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(riskAssessments).values(assessment);
  return { id: Number(result[0].insertId), ...assessment };
}

export async function updateRiskAssessment(id: number, updates: Partial<InsertRiskAssessment>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(riskAssessments).set(updates).where(eq(riskAssessments.id, id));
  return await getRiskAssessmentById(id);
}

export async function deleteRiskAssessment(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(riskAssessments).where(eq(riskAssessments.id, id));
  return true;
}

// ============================================================================
// Compliance Functions
// ============================================================================

export async function getComplianceChecks(filters?: { area?: string; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(complianceChecks);
  
  const conditions = [];
  if (filters?.area) {
    conditions.push(eq(complianceChecks.area, filters.area as any));
  }
  if (filters?.status) {
    conditions.push(eq(complianceChecks.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(complianceChecks.nextCheckDate));
}

export async function getComplianceCheckById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(complianceChecks).where(eq(complianceChecks.id, id)).limit(1);
  return result[0] || null;
}

export async function createComplianceCheck(check: InsertComplianceCheck) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(complianceChecks).values(check);
  return { id: Number(result[0].insertId), ...check };
}

export async function updateComplianceCheck(id: number, updates: Partial<InsertComplianceCheck>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(complianceChecks).set(updates).where(eq(complianceChecks.id, id));
  return await getComplianceCheckById(id);
}

export async function getComplianceViolations(filters?: { checkId?: number; severity?: string; remediationStatus?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(complianceViolations);
  
  const conditions = [];
  if (filters?.checkId) {
    conditions.push(eq(complianceViolations.checkId, filters.checkId));
  }
  if (filters?.severity) {
    conditions.push(eq(complianceViolations.severity, filters.severity as any));
  }
  if (filters?.remediationStatus) {
    conditions.push(eq(complianceViolations.remediationStatus, filters.remediationStatus as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(complianceViolations.createdAt));
}

export async function createComplianceViolation(violation: InsertComplianceViolation) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(complianceViolations).values(violation);
  return { id: Number(result[0].insertId), ...violation };
}

export async function updateComplianceViolation(id: number, updates: Partial<InsertComplianceViolation>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(complianceViolations).set(updates).where(eq(complianceViolations.id, id));
  const result = await db.select().from(complianceViolations).where(eq(complianceViolations.id, id)).limit(1);
  return result[0] || null;
}

// ============================================================================
// Webhook Functions
// ============================================================================

export async function getWebhookEndpoints(filters?: { isActive?: boolean }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(webhookEndpoints);
  
  if (filters?.isActive !== undefined) {
    query = query.where(eq(webhookEndpoints.isActive, filters.isActive)) as typeof query;
  }
  
  return await query.orderBy(desc(webhookEndpoints.createdAt));
}

export async function getWebhookEndpointById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(webhookEndpoints).where(eq(webhookEndpoints.id, id)).limit(1);
  return result[0] || null;
}

export async function createWebhookEndpoint(endpoint: InsertWebhookEndpoint) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(webhookEndpoints).values(endpoint);
  return { id: Number(result[0].insertId), ...endpoint };
}

export async function updateWebhookEndpoint(id: number, updates: Partial<InsertWebhookEndpoint>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(webhookEndpoints).set(updates).where(eq(webhookEndpoints.id, id));
  return await getWebhookEndpointById(id);
}

export async function deleteWebhookEndpoint(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(webhookEndpoints).where(eq(webhookEndpoints.id, id));
  return true;
}

export async function getWebhookLogs(filters?: { endpointId?: number; status?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(webhookLogs);
  
  const conditions = [];
  if (filters?.endpointId) {
    conditions.push(eq(webhookLogs.endpointId, filters.endpointId));
  }
  if (filters?.status) {
    conditions.push(eq(webhookLogs.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  query = query.orderBy(desc(webhookLogs.createdAt)) as typeof query;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as typeof query;
  }
  
  return await query;
}

export async function createWebhookLog(log: InsertWebhookLog) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(webhookLogs).values(log);
  return { id: Number(result[0].insertId), ...log };
}

export async function updateWebhookLog(id: number, updates: Partial<InsertWebhookLog>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(webhookLogs).set(updates).where(eq(webhookLogs.id, id));
  const result = await db.select().from(webhookLogs).where(eq(webhookLogs.id, id)).limit(1);
  return result[0] || null;
}

// ============================================================================
// Vendor Functions
// ============================================================================

export async function getVendors(filters?: { status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(vendors);
  
  if (filters?.status) {
    query = query.where(eq(vendors.status, filters.status as any)) as typeof query;
  }
  
  return await query.orderBy(desc(vendors.createdAt));
}

export async function getVendorById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(vendors).where(eq(vendors.id, id)).limit(1);
  return result[0] || null;
}

export async function createVendor(vendor: InsertVendor) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(vendors).values(vendor);
  return { id: Number(result[0].insertId), ...vendor };
}

export async function updateVendor(id: number, updates: Partial<InsertVendor>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(vendors).set(updates).where(eq(vendors.id, id));
  return await getVendorById(id);
}

export async function deleteVendor(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(vendors).where(eq(vendors.id, id));
  return true;
}

export async function getVendorContracts(filters?: { vendorId?: number; status?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(vendorContracts);
  
  const conditions = [];
  if (filters?.vendorId) {
    conditions.push(eq(vendorContracts.vendorId, filters.vendorId));
  }
  if (filters?.status) {
    conditions.push(eq(vendorContracts.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(vendorContracts.endDate));
}

export async function createVendorContract(contract: InsertVendorContract) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(vendorContracts).values(contract);
  return { id: Number(result[0].insertId), ...contract };
}

export async function updateVendorContract(id: number, updates: Partial<InsertVendorContract>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(vendorContracts).set(updates).where(eq(vendorContracts.id, id));
  const result = await db.select().from(vendorContracts).where(eq(vendorContracts.id, id)).limit(1);
  return result[0] || null;
}

// ============================================================================
// Fleet Management Functions
// ============================================================================

export async function getVehicles(filters?: { status?: string; type?: string; assignedRiderId?: number }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(vehicles);
  
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(vehicles.status, filters.status as any));
  }
  if (filters?.type) {
    conditions.push(eq(vehicles.type, filters.type as any));
  }
  if (filters?.assignedRiderId) {
    conditions.push(eq(vehicles.assignedRiderId, filters.assignedRiderId));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(vehicles.createdAt));
}

export async function getVehicleById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return result[0] || null;
}

export async function getVehicleByPlate(plateNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(vehicles).where(eq(vehicles.plateNumber, plateNumber)).limit(1);
  return result[0] || null;
}

export async function createVehicle(vehicle: InsertVehicle) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(vehicles).values(vehicle);
  return { id: Number(result[0].insertId), ...vehicle };
}

export async function updateVehicle(id: number, updates: Partial<InsertVehicle>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(vehicles).set(updates).where(eq(vehicles.id, id));
  return await getVehicleById(id);
}

export async function deleteVehicle(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(vehicles).where(eq(vehicles.id, id));
  return true;
}

export async function getVehicleMaintenance(filters?: { vehicleId?: number; status?: string; type?: string }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(vehicleMaintenance);
  
  const conditions = [];
  if (filters?.vehicleId) {
    conditions.push(eq(vehicleMaintenance.vehicleId, filters.vehicleId));
  }
  if (filters?.status) {
    conditions.push(eq(vehicleMaintenance.status, filters.status as any));
  }
  if (filters?.type) {
    conditions.push(eq(vehicleMaintenance.type, filters.type as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(vehicleMaintenance.scheduledDate));
}

export async function createVehicleMaintenance(maintenance: InsertVehicleMaintenance) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(vehicleMaintenance).values(maintenance);
  return { id: Number(result[0].insertId), ...maintenance };
}

export async function updateVehicleMaintenance(id: number, updates: Partial<InsertVehicleMaintenance>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(vehicleMaintenance).set(updates).where(eq(vehicleMaintenance.id, id));
  const result = await db.select().from(vehicleMaintenance).where(eq(vehicleMaintenance.id, id)).limit(1);
  return result[0] || null;
}

// ============================================================================
// Route Optimization Functions
// ============================================================================

export async function getDeliveryRoutes(filters?: { riderId?: number; vehicleId?: number; status?: string; date?: Date }) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(deliveryRoutes);
  
  const conditions = [];
  if (filters?.riderId) {
    conditions.push(eq(deliveryRoutes.riderId, filters.riderId));
  }
  if (filters?.vehicleId) {
    conditions.push(eq(deliveryRoutes.vehicleId, filters.vehicleId));
  }
  if (filters?.status) {
    conditions.push(eq(deliveryRoutes.status, filters.status as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }
  
  return await query.orderBy(desc(deliveryRoutes.date));
}

export async function getDeliveryRouteById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(deliveryRoutes).where(eq(deliveryRoutes.id, id)).limit(1);
  return result[0] || null;
}

export async function createDeliveryRoute(route: InsertDeliveryRoute) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(deliveryRoutes).values(route);
  return { id: Number(result[0].insertId), ...route };
}

export async function updateDeliveryRoute(id: number, updates: Partial<InsertDeliveryRoute>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(deliveryRoutes).set(updates).where(eq(deliveryRoutes.id, id));
  return await getDeliveryRouteById(id);
}

export async function deleteDeliveryRoute(id: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Delete waypoints first
  await db.delete(routeWaypoints).where(eq(routeWaypoints.routeId, id));
  await db.delete(deliveryRoutes).where(eq(deliveryRoutes.id, id));
  return true;
}

export async function getRouteWaypoints(routeId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(routeWaypoints)
    .where(eq(routeWaypoints.routeId, routeId))
    .orderBy(asc(routeWaypoints.sequenceNumber));
}

export async function createRouteWaypoint(waypoint: InsertRouteWaypoint) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(routeWaypoints).values(waypoint);
  return { id: Number(result[0].insertId), ...waypoint };
}

export async function updateRouteWaypoint(id: number, updates: Partial<InsertRouteWaypoint>) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(routeWaypoints).set(updates).where(eq(routeWaypoints.id, id));
  const result = await db.select().from(routeWaypoints).where(eq(routeWaypoints.id, id)).limit(1);
  return result[0] || null;
}

export async function bulkCreateRouteWaypoints(waypoints: InsertRouteWaypoint[]) {
  const db = await getDb();
  if (!db) return [];
  
  if (waypoints.length === 0) return [];
  
  await db.insert(routeWaypoints).values(waypoints);
  return waypoints;
}

// ============================================================================
// Dashboard Statistics for Sprint 24 Features
// ============================================================================

export async function getSprint24Stats() {
  const db = await getDb();
  if (!db) return null;
  
  const [segmentCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(customerSegments);
  const [automationCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(marketingAutomations);
  const [riskCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(riskAssessments);
  const [complianceCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(complianceChecks);
  const [webhookCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(webhookEndpoints);
  const [vendorCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(vendors);
  const [vehicleCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(vehicles);
  const [routeCount] = await db.select({ count: sql<number>`COUNT(*)` }).from(deliveryRoutes);
  
  return {
    segments: segmentCount?.count || 0,
    automations: automationCount?.count || 0,
    risks: riskCount?.count || 0,
    complianceChecks: complianceCount?.count || 0,
    webhooks: webhookCount?.count || 0,
    vendors: vendorCount?.count || 0,
    vehicles: vehicleCount?.count || 0,
    routes: routeCount?.count || 0,
  };
}


// ============================================================================
// Backup Schedule Functions
// ============================================================================

export async function getBackupSchedules() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(backupSchedules).orderBy(desc(backupSchedules.createdAt));
}

export async function createBackupSchedule(data: {
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  isEnabled: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const result = await db.insert(backupSchedules).values(data);
  return { id: result[0].insertId, ...data };
}

export async function updateBackupSchedule(id: number, data: Partial<{
  name: string;
  type: 'full' | 'incremental' | 'differential';
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  time: string;
  retentionDays: number;
  isEnabled: boolean;
  lastRun: Date;
  nextRun: Date;
}>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(backupSchedules).set(data).where(eq(backupSchedules.id, id));
  return { success: true };
}

export async function deleteBackupLog(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(backupLogs).where(eq(backupLogs.id, id));
  return { success: true };
}
