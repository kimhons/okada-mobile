import { eq, desc, like, and, or, count, sql, gte, lte, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, orderItems, riders, products, categories, qualityPhotos, riderEarnings, sellers, sellerPayouts, paymentTransactions, commissionSettings, InsertCommissionSetting, supportTickets, supportTicketMessages, InsertSupportTicketMessage, deliveryZones, InsertDeliveryZone, notifications, InsertNotification, activityLog, InsertActivityLog, campaigns, InsertCampaign, campaignUsage, InsertCampaignUsage, apiKeys, InsertApiKey, backupLogs, InsertBackupLog, faqs, InsertFaq, helpDocs, InsertHelpDoc, reports, InsertReport, scheduledReports, InsertScheduledReport, exportHistory, InsertExportHistory, emailTemplates, InsertEmailTemplate, notificationPreferences, InsertNotificationPreference, pushNotificationsLog, InsertPushNotificationLog, coupons, InsertCoupon, couponUsage, InsertCouponUsage, promotionalCampaigns, InsertPromotionalCampaign, loyaltyProgram, InsertLoyaltyProgram, loyaltyTransactions, InsertLoyaltyTransaction, payouts, InsertPayout, transactions, InsertTransaction, revenueAnalytics, InsertRevenueAnalytics } from "../drizzle/schema";
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
  reportId?: number;
  frequency?: string;
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];

  if (filters?.reportId) {
    conditions.push(eq(scheduledReports.reportId, filters.reportId));
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


