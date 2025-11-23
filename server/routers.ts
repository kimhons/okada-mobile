import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  orders: router({
    list: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllOrders(input || {});
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await db.getOrderById(input.id);
        const items = await db.getOrderItems(input.id);
        const photos = await db.getOrderQualityPhotos(input.id);
        return { order, items, photos };
      }),
    
    updateStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.string(),
      }))
      .mutation(async ({ input }) => {
        return await db.updateOrderStatus(input.orderId, input.status);
      }),
  }),

  dashboard: router({
    stats: protectedProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
  }),

  analytics: router({
    revenueByPeriod: protectedProcedure
      .input(z.object({ period: z.enum(['day', 'week', 'month']) }))
      .query(async ({ input }) => {
        return await db.getRevenueByPeriod(input.period);
      }),
    
    ordersByStatus: protectedProcedure.query(async () => {
      return await db.getOrdersByStatus();
    }),
    
    topRiders: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getTopRiders(input?.limit || 10);
      }),
  }),

  users: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), role: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllUsers(input);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const user = await db.getUserById(input.id);
        const userOrders = await db.getUserOrders(input.id);
        return { user, orders: userOrders };
      }),
    updateRole: protectedProcedure
      .input(z.object({ userId: z.number(), role: z.enum(['admin', 'user']) }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can update user roles');
        }
        const success = await db.updateUserRole(input.userId, input.role);
        return { success };
      }),
  }),

  riders: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), status: z.string().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllRiders(input);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const rider = await db.getRiderById(input.id);
        const earnings = await db.getRiderEarnings(input.id);
        const deliveries = await db.getRiderDeliveries(input.id);
        return { rider, earnings, deliveries };
      }),
    updateStatus: protectedProcedure
      .input(z.object({ riderId: z.number(), status: z.enum(['pending', 'approved', 'rejected', 'suspended']) }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can update rider status');
        }
        const success = await db.updateRiderStatus(input.riderId, input.status);
        return { success };
      }),
  }),

  products: router({
    list: protectedProcedure
      .input(z.object({ search: z.string().optional(), categoryId: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getAllProducts(input);
      }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.number(),
        categoryId: z.number(),
        imageUrl: z.string().optional(),
        stock: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can create products');
        }
        return await db.createProduct(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.number().optional(),
        categoryId: z.number().optional(),
        imageUrl: z.string().optional(),
        stock: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can update products');
        }
        const { id, ...updates } = input;
        return await db.updateProduct(id, updates);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can delete products');
        }
        return await db.deleteProduct(input.id);
      }),
  }),

  categories: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryById(input.id);
      }),
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        parentId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can create categories');
        }
        return await db.createCategory(input);
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can update categories');
        }
        const { id, ...updates } = input;
        return await db.updateCategory(id, updates);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can delete categories');
        }
        return await db.deleteCategory(input.id);
      }),
  }),


});

export type AppRouter = typeof appRouter;

