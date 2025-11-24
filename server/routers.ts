import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { notifyOwner } from "./_core/notification";

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
    bulkCreate: protectedProcedure
      .input(z.array(z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
        price: z.number(),
        categoryId: z.number(),
        imageUrl: z.string().optional(),
        stock: z.number(),
      })))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can bulk create products');
        }
        const results = await Promise.all(
          input.map((product) => db.createProduct(product))
        );
        return { created: results.length };
      }),
    
    bulkUpdatePrices: protectedProcedure
      .input(z.array(z.object({
        id: z.number(),
        price: z.number(),
      })))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can bulk update prices');
        }
        const results = await Promise.all(
          input.map((update) => db.updateProduct(update.id, { price: update.price }))
        );
        return { updated: results.length };
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

  // Notification triggers for key events
  notifications: router({
    // Trigger notification when order status changes to quality_verification
    onQualityVerification: protectedProcedure
      .input(z.object({ orderId: z.number(), orderNumber: z.string() }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: "Quality Verification Required",
          content: `Order ${input.orderNumber} is awaiting quality verification. Please review the uploaded photos.`,
        });
        return { success: true };
      }),

    // Trigger notification when new rider applies
    onNewRiderApplication: protectedProcedure
      .input(z.object({ riderName: z.string(), riderId: z.number() }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: "New Rider Application",
          content: `${input.riderName} (ID: ${input.riderId}) has submitted a new rider application. Please review and approve/reject.`,
        });
        return { success: true };
      }),

    // Trigger notification when order is delivered
    onOrderDelivered: protectedProcedure
      .input(z.object({ orderId: z.number(), orderNumber: z.string(), total: z.number() }))
      .mutation(async ({ input }) => {
        await notifyOwner({
          title: "Order Delivered Successfully",
          content: `Order ${input.orderNumber} has been delivered. Total: ${(input.total / 100).toLocaleString()} FCFA`,
        });
        return { success: true };
      }),
  }),

  // Quality Verification Management
  qualityVerification: router({
    getPendingPhotos: protectedProcedure.query(async () => {
      return await db.getPendingQualityPhotos();
    }),

    getPhotosByOrder: protectedProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getQualityPhotosByOrderId(input.orderId);
      }),

    approvePhoto: protectedProcedure
      .input(z.object({ photoId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.approveQualityPhoto(input.photoId);
      }),

    rejectPhoto: protectedProcedure
      .input(z.object({ photoId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        return await db.rejectQualityPhoto(input.photoId, input.reason);
      }),

    getAnalytics: protectedProcedure.query(async () => {
      return await db.getQualityPhotoAnalytics();
    }),
  }),

  // Seller Management
  sellers: router({
    getAll: protectedProcedure.query(async () => {
      return await db.getAllSellers();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSellerById(input.id);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "approved", "rejected", "suspended"]),
        })
      )
      .mutation(async ({ input }) => {
        return await db.updateSellerStatus(input.id, input.status);
      }),

    getProducts: protectedProcedure
      .input(z.object({ sellerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSellerProducts(input.sellerId);
      }),
  }),

  // Financial Management
  financial: router({
    getOverview: protectedProcedure.query(async () => {
      return await db.getFinancialOverview();
    }),

    getCommissionSettings: protectedProcedure.query(async () => {
      return await db.getCommissionSettings();
    }),

    updateCommissionSetting: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          value: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateCommissionSetting(id, updates);
      }),

    getPaymentTransactions: protectedProcedure
      .input(z.object({ limit: z.number().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getPaymentTransactions(input?.limit);
      }),

    getMobileMoneyAnalytics: protectedProcedure.query(async () => {
      return await db.getMobileMoneyAnalytics();
    }),

    getPendingPayouts: protectedProcedure.query(async () => {
      return await db.getPendingPayouts();
    }),

    processPayouts: protectedProcedure
      .input(z.object({ payoutIds: z.array(z.number()) }))
      .mutation(async ({ input }) => {
        return await db.processPayoutBatch(input.payoutIds);
      }),

    getRevenueAnalytics: protectedProcedure.query(async () => {
      // Return mock data for now - can be replaced with real analytics later
      return {
        totalRevenue: 1250000000, // 12.5M FCFA in cents
        commissionEarned: 187500000, // 1.875M FCFA in cents
        growthRate: 8.5,
        monthlyRevenue: 125000000, // 1.25M FCFA in cents
      };
    }),

    // Payment Gateway Integration
    getGatewayConfig: protectedProcedure
      .input(z.object({ provider: z.enum(["mtn_money", "orange_money"]) }))
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can view gateway config');
        }
        const { PaymentGatewayService } = await import("./paymentGatewayService");
        return await PaymentGatewayService.getConfig(input.provider);
      }),

    updateGatewayConfig: protectedProcedure
      .input(z.object({
        provider: z.enum(["mtn_money", "orange_money"]),
        apiKey: z.string().optional(),
        apiSecret: z.string().optional(),
        webhookUrl: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can update gateway config');
        }
        const { provider, ...config } = input;
        const { PaymentGatewayService } = await import("./paymentGatewayService");
        await PaymentGatewayService.updateConfig(provider, config);
        return { success: true };
      }),

    syncGatewayTransactions: protectedProcedure
      .input(z.object({
        provider: z.enum(["mtn_money", "orange_money"]),
        fromDate: z.string(),
        toDate: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can sync transactions');
        }
        const { PaymentGatewayService } = await import("./paymentGatewayService");
        const fromDate = new Date(input.fromDate);
        const toDate = new Date(input.toDate);
        
        let transactions;
        if (input.provider === "mtn_money") {
          transactions = await PaymentGatewayService.syncMTNMoneyTransactions(fromDate, toDate);
        } else {
          transactions = await PaymentGatewayService.syncOrangeMoneyTransactions(fromDate, toDate);
        }
        
        await PaymentGatewayService.saveTransactions(transactions);
        return { synced: transactions.length };
      }),

    getSyncLogs: protectedProcedure
      .input(z.object({ provider: z.enum(["mtn_money", "orange_money"]).optional() }).optional())
      .query(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can view sync logs');
        }
        const { PaymentGatewayService } = await import("./paymentGatewayService");
        return await PaymentGatewayService.getSyncLogs(input?.provider);
      }),
  }),

  // Customer Support
  support: router({
    getAllTickets: protectedProcedure.query(async () => {
      return await db.getAllSupportTickets();
    }),

    getTicketById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupportTicketById(input.id);
      }),

    getTicketMessages: protectedProcedure
      .input(z.object({ ticketId: z.number() }))
      .query(async ({ input }) => {
        return await db.getSupportTicketMessages(input.ticketId);
      }),

    addMessage: protectedProcedure
      .input(
        z.object({
          ticketId: z.number(),
          userId: z.number(),
          message: z.string(),
          isStaff: z.boolean(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.addSupportTicketMessage(input);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["open", "in_progress", "resolved", "closed"]),
        })
      )
      .mutation(async ({ input }) => {
        return await db.updateSupportTicketStatus(input.id, input.status);
      }),
  }),

  // Delivery Zones Management
  deliveryZones: router({
    getAll: protectedProcedure.query(async () => {
      return await db.getAllDeliveryZones();
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getDeliveryZoneById(input.id);
      }),

    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          city: z.string(),
          description: z.string().optional(),
          baseFee: z.number(),
          perKmFee: z.number(),
          minDeliveryTime: z.number().optional(),
          maxDeliveryTime: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createDeliveryZone(input);
      }),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          baseFee: z.number().optional(),
          perKmFee: z.number().optional(),
          minDeliveryTime: z.number().optional(),
          maxDeliveryTime: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        return await db.updateDeliveryZone(id, updates);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteDeliveryZone(input.id);
      }),
  }),

  notifications: router({
    list: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
        type: z.string().optional(),
        isRead: z.boolean().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getNotifications(input || {});
      }),
    
    create: protectedProcedure
      .input(z.object({
        userId: z.number(),
        title: z.string(),
        message: z.string(),
        type: z.enum(["order", "delivery", "payment", "system"]),
      }))
      .mutation(async ({ input }) => {
        await db.createNotification(input);
        return { success: true };
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.markNotificationAsRead(input.id);
        return { success: true };
      }),
    
    sendBulk: protectedProcedure
      .input(z.object({
        userIds: z.array(z.number()),
        title: z.string(),
        message: z.string(),
        type: z.enum(["order", "delivery", "payment", "system"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { userIds, title, message, type } = input;
        
        // Create notifications for each user
        for (const userId of userIds) {
          await db.createNotification({ userId, title, message, type });
        }
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "send_bulk_notification",
          entityType: "notification",
          details: JSON.stringify({ userCount: userIds.length, title }),
        });
        
        return { success: true, count: userIds.length };
      }),
  }),

  activityLog: router({
    list: protectedProcedure
      .input(z.object({
        adminId: z.number().optional(),
        action: z.string().optional(),
        entityType: z.string().optional(),
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getActivityLogs(input || {});
      }),
  }),

  campaigns: router({
    list: protectedProcedure.query(async () => {
      return await db.getAllCampaigns();
    }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const campaign = await db.getCampaignById(input.id);
        const usage = await db.getCampaignUsage(input.id);
        return { campaign, usage };
      }),
    
    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        discountCode: z.string(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number(),
        minOrderAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().optional(),
        targetAudience: z.enum(["all", "new_users", "existing_users", "specific_users"]),
        startDate: z.string(),
        endDate: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createCampaign({
          ...input,
          startDate: new Date(input.startDate),
          endDate: new Date(input.endDate),
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_campaign",
          entityType: "campaign",
          details: JSON.stringify({ name: input.name, discountCode: input.discountCode }),
        });
        
        return { success: true };
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        discountValue: z.number().optional(),
        minOrderAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().optional(),
        targetAudience: z.enum(["all", "new_users", "existing_users", "specific_users"]).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, startDate, endDate, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (startDate) updateData.startDate = new Date(startDate);
        if (endDate) updateData.endDate = new Date(endDate);
        
        await db.updateCampaign(id, updateData);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_campaign",
          entityType: "campaign",
          entityId: id,
          details: JSON.stringify(updateData),
        });
        
        return { success: true };
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteCampaign(input.id);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_campaign",
          entityType: "campaign",
          entityId: input.id,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;;

