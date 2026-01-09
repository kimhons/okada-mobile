import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { appRouter } from './routers';
import { getDb } from './db';
import { products, categories } from '../drizzle/schema';
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

describe('Category Management API', () => {
  let testCategoryId: number;
  let caller: any;

  beforeAll(async () => {
    caller = appRouter.createCaller(createMockContext('admin'));
    
    // Create a test category
    const result = await caller.categories.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'A test category',
    });
    testCategoryId = result.id;
  });

  afterAll(async () => {
    // Clean up test category
    const db = await getDb();
    if (db && testCategoryId) {
      await db.delete(categories).where(eq(categories.id, testCategoryId));
    }
  });

  it('should list all categories', async () => {
    const result = await caller.categories.list();
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should get category by ID', async () => {
    const result = await caller.categories.getById({ id: testCategoryId });
    expect(result).toBeDefined();
    expect(result.id).toBe(testCategoryId);
    expect(result.name).toBe('Test Category');
  });

  it('should create category (admin only)', async () => {
    const result = await caller.categories.create({
      name: 'New Test Category',
      slug: 'new-test-category',
      description: 'Another test category',
    });
    
    expect(result).toBeDefined();
    expect(result.name).toBe('New Test Category');
    expect(result.slug).toBe('new-test-category');

    // Clean up
    const db = await getDb();
    if (db) {
      await db.delete(categories).where(eq(categories.id, result.id));
    }
  });

  it('should update category (admin only)', async () => {
    const result = await caller.categories.update({
      id: testCategoryId,
      name: 'Updated Test Category',
    });
    
    expect(result).toBeDefined();
    expect(result.name).toBe('Updated Test Category');
  });

  it('should reject category creation from non-admin user', async () => {
    const nonAdminCaller = appRouter.createCaller(createMockContext('user'));
    
    await expect(
      nonAdminCaller.categories.create({
        name: 'Unauthorized Category',
        slug: 'unauthorized',
      })
    ).rejects.toThrow('Only admins can create categories');
  });
});

describe('Product Management API', () => {
  let testProductId: number;
  let testCategoryId: number;
  let caller: any;

  beforeAll(async () => {
    caller = appRouter.createCaller(createMockContext('admin'));
    
    // Create a test category first
    const category = await caller.categories.create({
      name: 'Product Test Category',
      slug: 'product-test-category',
    });
    testCategoryId = category.id;

    // Create a test product
    const result = await caller.products.create({
      name: 'Test Product',
      slug: 'test-product',
      description: 'A test product',
      price: 250000, // 2500 FCFA
      categoryId: testCategoryId,
      stock: 100,
    });
    testProductId = result.id;
  });

  afterAll(async () => {
    // Clean up test product and category
    const db = await getDb();
    if (db) {
      if (testProductId) {
        await db.delete(products).where(eq(products.id, testProductId));
      }
      if (testCategoryId) {
        await db.delete(categories).where(eq(categories.id, testCategoryId));
      }
    }
  });

  it('should list all products', async () => {
    const result = await caller.products.list({});
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('should filter products by search term', async () => {
    const result = await caller.products.list({ search: 'Test Product' });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    const foundProduct = result.find((p: any) => p.name === 'Test Product');
    expect(foundProduct).toBeDefined();
  });

  it('should filter products by category', async () => {
    const result = await caller.products.list({ categoryId: testCategoryId });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
    result.forEach((product: any) => {
      expect(product.categoryId).toBe(testCategoryId);
    });
  });

  it('should get product by ID', async () => {
    const result = await caller.products.getById({ id: testProductId });
    expect(result).toBeDefined();
    expect(result.id).toBe(testProductId);
    expect(result.name).toBe('Test Product');
    expect(result.price).toBe(250000);
  });

  it('should create product (admin only)', async () => {
    const result = await caller.products.create({
      name: 'New Test Product',
      slug: 'new-test-product',
      description: 'Another test product',
      price: 150000,
      categoryId: testCategoryId,
      stock: 50,
    });
    
    expect(result).toBeDefined();
    expect(result.name).toBe('New Test Product');
    expect(result.price).toBe(150000);
    expect(result.stock).toBe(50);

    // Clean up
    const db = await getDb();
    if (db) {
      await db.delete(products).where(eq(products.id, result.id));
    }
  });

  it('should update product (admin only)', async () => {
    const result = await caller.products.update({
      id: testProductId,
      name: 'Updated Test Product',
      price: 300000,
      stock: 150,
    });
    
    expect(result).toBeDefined();
    expect(result.name).toBe('Updated Test Product');
    expect(result.price).toBe(300000);
    expect(result.stock).toBe(150);
  });

  it('should delete product (admin only)', async () => {
    // Create a product to delete
    const productToDelete = await caller.products.create({
      name: 'Product To Delete',
      slug: 'product-to-delete',
      price: 100000,
      categoryId: testCategoryId,
      stock: 10,
    });

    const result = await caller.products.delete({ id: productToDelete.id });
    expect(result).toBe(true);

    // Verify it's deleted
    const deletedProduct = await caller.products.getById({ id: productToDelete.id });
    expect(deletedProduct).toBeUndefined();
  });

  it('should reject product creation from non-admin user', async () => {
    const nonAdminCaller = appRouter.createCaller(createMockContext('user'));
    
    await expect(
      nonAdminCaller.products.create({
        name: 'Unauthorized Product',
        slug: 'unauthorized',
        price: 100000,
        categoryId: testCategoryId,
        stock: 10,
      })
    ).rejects.toThrow('Only admins can create products');
  });
});

