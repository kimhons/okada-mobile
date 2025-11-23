import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from '../server/routers';
import { getDb } from '../server/db';
import { users, riders } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

// Mock context for testing
const createMockContext = (role: 'admin' | 'user' = 'admin') => ({
  user: {
    id: 1,
    openId: 'test-open-id',
    name: 'Test Admin',
    email: 'admin@test.com',
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    loginMethod: 'oauth',
  },
  req: {} as any,
  res: {} as any,
});

describe('User Management API', () => {
  let testUserId: number;
  let caller: any;

  beforeAll(async () => {
    caller = appRouter.createCaller(createMockContext('admin'));
    
    // Create a test user
    const db = await getDb();
    if (db) {
      const result = await db.insert(users).values({
        openId: 'test-user-123',
        name: 'Test User',
        email: 'testuser@example.com',
        role: 'user',
        loginMethod: 'oauth',
      });
      testUserId = result[0].insertId;
    }
  });

  afterAll(async () => {
    // Clean up test user
    const db = await getDb();
    if (db && testUserId) {
      await db.delete(users).where(eq(users.id, testUserId));
    }
  });

  it('should list all users', async () => {
    const result = await caller.users.list({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should filter users by search term', async () => {
    const result = await caller.users.list({ search: 'Test User' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // Should find our test user
    const foundUser = result.find((u: any) => u.name === 'Test User');
    expect(foundUser).toBeDefined();
  });

  it('should filter users by role', async () => {
    const result = await caller.users.list({ role: 'user' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // All returned users should have 'user' role
    result.forEach((user: any) => {
      expect(user.role).toBe('user');
    });
  });

  it('should get user by ID with orders', async () => {
    const result = await caller.users.getById({ id: testUserId });
    expect(result).toBeDefined();
    expect(result.user).toBeDefined();
    expect(result.user?.id).toBe(testUserId);
    expect(result.user?.name).toBe('Test User');
    expect(result.orders).toBeDefined();
    expect(Array.isArray(result.orders)).toBe(true);
  });

  it('should update user role (admin only)', async () => {
    const result = await caller.users.updateRole({
      userId: testUserId,
      role: 'admin',
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Verify the role was updated
    const db = await getDb();
    if (db) {
      const [updatedUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, testUserId))
        .limit(1);
      expect(updatedUser.role).toBe('admin');

      // Reset role back to user
      await db.update(users).set({ role: 'user' }).where(eq(users.id, testUserId));
    }
  });

  it('should reject role update from non-admin user', async () => {
    const nonAdminCaller = appRouter.createCaller(createMockContext('user'));
    
    await expect(
      nonAdminCaller.users.updateRole({
        userId: testUserId,
        role: 'admin',
      })
    ).rejects.toThrow('Only admins can update user roles');
  });
});

describe('Rider Management API', () => {
  let testRiderId: number;
  let caller: any;

  beforeAll(async () => {
    caller = appRouter.createCaller(createMockContext('admin'));
    
    // Create a test rider
    const db = await getDb();
    if (db) {
      const result = await db.insert(riders).values({
        name: 'Test Rider',
        phone: '+237600000001',
        vehicleType: 'motorcycle',
        vehicleNumber: 'TEST-001',
        status: 'pending',
        rating: 0,
      });
      testRiderId = result[0].insertId;
    }
  });

  afterAll(async () => {
    // Clean up test rider
    const db = await getDb();
    if (db && testRiderId) {
      await db.delete(riders).where(eq(riders.id, testRiderId));
    }
  });

  it('should list all riders', async () => {
    const result = await caller.riders.list({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should filter riders by search term', async () => {
    const result = await caller.riders.list({ search: 'Test Rider' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // Should find our test rider
    const foundRider = result.find((r: any) => r.name === 'Test Rider');
    expect(foundRider).toBeDefined();
  });

  it('should filter riders by status', async () => {
    const result = await caller.riders.list({ status: 'pending' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    // All returned riders should have 'pending' status
    result.forEach((rider: any) => {
      expect(rider.status).toBe('pending');
    });
  });

  it('should get rider by ID with earnings and deliveries', async () => {
    const result = await caller.riders.getById({ id: testRiderId });
    expect(result).toBeDefined();
    expect(result.rider).toBeDefined();
    expect(result.rider?.id).toBe(testRiderId);
    expect(result.rider?.name).toBe('Test Rider');
    expect(result.earnings).toBeDefined();
    expect(Array.isArray(result.earnings)).toBe(true);
    expect(result.deliveries).toBeDefined();
    expect(Array.isArray(result.deliveries)).toBe(true);
  });

  it('should approve rider (admin only)', async () => {
    const result = await caller.riders.updateStatus({
      riderId: testRiderId,
      status: 'approved',
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Verify the status was updated
    const db = await getDb();
    if (db) {
      const [updatedRider] = await db
        .select()
        .from(riders)
        .where(eq(riders.id, testRiderId))
        .limit(1);
      expect(updatedRider.status).toBe('approved');
    }
  });

  it('should reject rider (admin only)', async () => {
    const result = await caller.riders.updateStatus({
      riderId: testRiderId,
      status: 'rejected',
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Verify the status was updated
    const db = await getDb();
    if (db) {
      const [updatedRider] = await db
        .select()
        .from(riders)
        .where(eq(riders.id, testRiderId))
        .limit(1);
      expect(updatedRider.status).toBe('rejected');
    }
  });

  it('should suspend rider (admin only)', async () => {
    // First set to approved
    await caller.riders.updateStatus({
      riderId: testRiderId,
      status: 'approved',
    });

    // Then suspend
    const result = await caller.riders.updateStatus({
      riderId: testRiderId,
      status: 'suspended',
    });
    expect(result).toBeDefined();
    expect(result.success).toBe(true);

    // Verify the status was updated
    const db = await getDb();
    if (db) {
      const [updatedRider] = await db
        .select()
        .from(riders)
        .where(eq(riders.id, testRiderId))
        .limit(1);
      expect(updatedRider.status).toBe('suspended');
    }
  });

  it('should reject status update from non-admin user', async () => {
    const nonAdminCaller = appRouter.createCaller(createMockContext('user'));
    
    await expect(
      nonAdminCaller.riders.updateStatus({
        riderId: testRiderId,
        status: 'approved',
      })
    ).rejects.toThrow('Only admins can update rider status');
  });
});

