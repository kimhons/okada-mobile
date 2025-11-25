import { eq, desc, like, and, or, count, sql, gte, lte, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, orderItems, riders, products, categories, qualityPhotos, riderEarnings, sellers, sellerPayouts, paymentTransactions, commissionSettings, InsertCommissionSetting, supportTickets, supportTicketMessages, InsertSupportTicketMessage, deliveryZones, InsertDeliveryZone, notifications, InsertNotification, activityLog, InsertActivityLog, campaigns, InsertCampaign, campaignUsage, InsertCampaignUsage, apiKeys, InsertApiKey, backupLogs, InsertBackupLog, faqs, InsertFaq, helpDocs, InsertHelpDoc, reports, InsertReport, scheduledReports, InsertScheduledReport, exportHistory, InsertExportHistory, emailTemplates, InsertEmailTemplate, notificationPreferences, InsertNotificationPreference, pushNotificationsLog, InsertPushNotificationLog, coupons, InsertCoupon, couponUsage, InsertCouponUsage, promotionalCampaigns, InsertPromotionalCampaign, loyaltyProgram, InsertLoyaltyProgram, loyaltyTransactions, InsertLoyaltyTransaction, payouts, InsertPayout, transactions, InsertTransaction, revenueAnalytics, InsertRevenueAnalytics, riderLocations, InsertRiderLocation, inventoryAlerts, InsertInventoryAlert, inventoryThresholds, InsertInventoryThreshold, riderTierHistory } from "../drizzle/schema";
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

  let query = db.select().from(orders);

  // Apply filters
  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(orders.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(orders.orderNumber, `%${filters.search}%`),
        like(orders.deliveryAddress, `%${filters.search}%`)
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

// Additional Rider Management Queries (getAllRiders and updateRiderStatus are defined above)

export async function getRiderEarnings(riderId: number) {
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

export async function getPendingPayouts() {
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

export async function getNotifications(filters?: {
  userId?: number;
  type?: string;
  isRead?: boolean;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(notifications);
  
  if (filters?.userId) {
    query = query.where(eq(notifications.userId, filters.userId)) as any;
  }
  if (filters?.type) {
    query = query.where(eq(notifications.type, filters.type as any)) as any;
  }
  if (filters?.isRead !== undefined) {
    query = query.where(eq(notifications.isRead, filters.isRead)) as any;
  }
  
  query = query.orderBy(desc(notifications.createdAt)) as any;
  
  if (filters?.limit) {
    query = query.limit(filters.limit) as any;
  }
  
  return query;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
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
    conditions.push(eq(scheduledReports.reportType, filters.reportType));
  }

  if (filters?.frequency) {
    conditions.push(eq(scheduledReports.frequency, filters.frequency as any));
  }

  if (filters?.isActive !== undefined) {
    conditions.push(eq(scheduledReports.isActive, filters.isActive));
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

export async function createScheduledReport(data: InsertScheduledReport) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(scheduledReports).values(data);
}

export async function updateScheduledReport(id: number, data: Partial<InsertScheduledReport>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(scheduledReports).set(data).where(eq(scheduledReports.id, id));
}

export async function deleteScheduledReport(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(scheduledReports).where(eq(scheduledReports.id, id));
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

export async function updateInventoryThreshold(productId: number, data: Partial<InsertInventoryThreshold>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(inventoryThresholds)
    .set(data)
    .where(eq(inventoryThresholds.productId, productId));
}

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
      let ordersQuery = db
        .select({
          id: orders.id,
          status: orders.status,
          total: orders.total,
          createdAt: orders.createdAt,
          actualDeliveryTime: orders.actualDeliveryTime,
          estimatedDeliveryTime: orders.estimatedDeliveryTime,
        })
        .from(orders)
        .where(eq(orders.riderId, rider.riderId));

      if (startDate) {
        ordersQuery = ordersQuery.where(gte(orders.createdAt, startDate)) as any;
      }

      const riderOrders = await ordersQuery;
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
        .select({ orderId: qualityPhotos.orderId, status: qualityPhotos.status })
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
      let earningsQuery = db
        .select({
          amount: riderEarnings.amount,
          bonus: riderEarnings.bonus,
          tip: riderEarnings.tip,
        })
        .from(riderEarnings)
        .where(eq(riderEarnings.riderId, rider.riderId));

      if (startDate) {
        earningsQuery = earningsQuery.where(gte(riderEarnings.createdAt, startDate)) as any;
      }

      const earnings = await earningsQuery;
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

export async function getRiderPerformanceDetails(riderId: number, period: 'week' | 'month' | 'all') {
  const db = await getDb();
  if (!db) return null;

  // Get rider info
  const rider = await db.select().from(riders).where(eq(riders.id, riderId)).limit(1);
  if (rider.length === 0) return null;

  // Calculate date range
  const now = new Date();
  let startDate: Date | null = null;

  switch (period) {
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
  let ordersQuery = db
    .select()
    .from(orders)
    .where(eq(orders.riderId, riderId));

  if (startDate) {
    ordersQuery = ordersQuery.where(gte(orders.createdAt, startDate)) as any;
  }

  const riderOrders = await ordersQuery;
  const completedOrders = riderOrders.filter((o) => o.status === 'delivered');

  // Get earnings
  let earningsQuery = db
    .select()
    .from(riderEarnings)
    .where(eq(riderEarnings.riderId, riderId));

  if (startDate) {
    earningsQuery = earningsQuery.where(gte(riderEarnings.createdAt, startDate)) as any;
  }

  const earnings = await earningsQuery;

  // Calculate metrics
  const totalEarnings = earnings.reduce(
    (sum, e) => sum + (e.amount || 0) + (e.bonus || 0) + (e.tip || 0),
    0
  );
  const baseEarnings = earnings.reduce((sum, e) => sum + (e.amount || 0), 0);
  const bonusEarnings = earnings.reduce((sum, e) => sum + (e.bonus || 0), 0);
  const tipEarnings = earnings.reduce((sum, e) => sum + (e.tip || 0), 0);

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
