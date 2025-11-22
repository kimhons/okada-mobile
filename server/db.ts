import { eq, desc, like, and, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, orders, orderItems, riders, products, qualityPhotos, riderEarnings } from "../drizzle/schema";
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

