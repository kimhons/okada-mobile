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
});

export type AppRouter = typeof appRouter;
