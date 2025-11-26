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
    getAllRiders: protectedProcedure
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
    getEarningsBreakdown: protectedProcedure
      .input(z.object({
        riderId: z.number().optional(),
        period: z.enum(['today', 'week', 'month', 'year']),
      }))
      .query(async ({ input }) => {
        // Calculate date range based on period
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        switch (input.period) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
        }

        // Get all riders if no specific rider selected
        const riders = input.riderId ? [{ id: input.riderId }] : await db.getAllRiders({});
        const riderIds = riders.map(r => r.id);

        // Aggregate earnings for all selected riders
        let totalEarnings = 0;
        let totalDeductions = 0;
        let deliveryFees = 0;
        let tips = 0;
        let bonuses = 0;
        let penalties = 0;
        let transactionCount = 0;
        const allTransactions: any[] = [];

        for (const riderId of riderIds) {
          const summary = await db.getRiderEarningsSummary(riderId, startDate, endDate);
          if (summary) {
            totalEarnings += summary.totalEarnings || 0;
            totalDeductions += summary.totalDeductions || 0;
            deliveryFees += summary.deliveryFees || 0;
            tips += summary.tips || 0;
            bonuses += summary.bonuses || 0;
            penalties += summary.penalties || 0;
            transactionCount += summary.transactionCount || 0;
          }

          const transactions = await db.getRiderEarningsDetailed({
            riderId,
            startDate,
            endDate,
          });
          allTransactions.push(...transactions);
        }

        // Sort transactions by date
        allTransactions.sort((a, b) => 
          new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
        );

        // Generate trend data (last 30 days)
        const trends: { date: string; amount: number }[] = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

          let dayEarnings = 0;
          for (const riderId of riderIds) {
            const daySummary = await db.getRiderEarningsSummary(riderId, dayStart, dayEnd);
            if (daySummary) {
              dayEarnings += (daySummary.totalEarnings || 0) - (daySummary.totalDeductions || 0);
            }
          }

          trends.push({
            date: dayStart.toISOString(),
            amount: dayEarnings,
          });
        }

        return {
          summary: {
            totalEarnings,
            totalDeductions,
            netEarnings: totalEarnings - totalDeductions,
            transactionCount,
          },
          breakdown: {
            deliveryFees,
            tips,
            bonuses,
            penalties,
          },
          transactions: allTransactions.slice(0, 50), // Limit to 50 most recent
          trends,
        };
      }),
    // Badge procedures
    getBadges: protectedProcedure
      .input(z.object({
        riderId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderBadges(input.riderId);
      }),
    getAllBadgeDefinitions: protectedProcedure
      .query(async () => {
        return await db.getAllBadges({ isActive: true });
      }),
    checkBadges: protectedProcedure
      .input(z.object({
        riderId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.checkAndAwardBadges(input.riderId);
      }),
    getBadgeLeaderboard: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getBadgeLeaderboard(input?.limit || 10);
      }),
    getBadgeNotifications: protectedProcedure
      .input(z.object({
        riderId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getUnreadBadgeNotifications(input.riderId);
      }),
    markNotificationRead: protectedProcedure
      .input(z.object({
        notificationId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.markBadgeNotificationRead(input.notificationId);
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

  notificationManagement: router({
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

  // Settings & Configuration
  settings: router({
    // Admin Users Management
    getAllAdminUsers: protectedProcedure.query(async () => {
      return await db.getAllAdminUsers();
    }),
    
    promoteUserToAdmin: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.promoteUserToAdmin(input.userId);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "promote_user_to_admin",
          entityType: "user",
          entityId: input.userId,
        });
        
        return { success: true };
      }),
    
    demoteAdminToUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.demoteAdminToUser(input.userId);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "demote_admin_to_user",
          entityType: "user",
          entityId: input.userId,
        });
        
        return { success: true };
      }),
    
    // API Keys Management
    getAllApiKeys: protectedProcedure.query(async () => {
      return await db.getAllApiKeys();
    }),
    
    createApiKey: protectedProcedure
      .input(z.object({
        name: z.string(),
        key: z.string(),
        secret: z.string().optional(),
        permissions: z.string().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const data: any = {
          ...input,
          createdBy: ctx.user.id,
        };
        
        if (input.expiresAt) {
          data.expiresAt = new Date(input.expiresAt);
        }
        
        await db.createApiKey(data);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_api_key",
          entityType: "api_key",
          details: JSON.stringify({ name: input.name }),
        });
        
        return { success: true };
      }),
    
    updateApiKey: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        isActive: z.boolean().optional(),
        permissions: z.string().optional(),
        expiresAt: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, expiresAt, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (expiresAt) {
          updateData.expiresAt = new Date(expiresAt);
        }
        
        await db.updateApiKey(id, updateData);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_api_key",
          entityType: "api_key",
          entityId: id,
          details: JSON.stringify(updateData),
        });
        
        return { success: true };
      }),
    
    deleteApiKey: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteApiKey(input.id);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_api_key",
          entityType: "api_key",
          entityId: input.id,
        });
        
        return { success: true };
      }),
    
    // Backup & Restore
    getAllBackupLogs: protectedProcedure.query(async () => {
      return await db.getAllBackupLogs();
    }),
    
    createBackup: protectedProcedure
      .input(z.object({
        filename: z.string(),
        type: z.enum(["manual", "automatic"]),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createBackupLog({
          filename: input.filename,
          type: input.type,
          status: "pending",
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_backup",
          entityType: "backup",
          details: JSON.stringify({ filename: input.filename, type: input.type }),
        });
        
        return { success: true };
      }),
    
    updateBackupLog: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed"]).optional(),
        size: z.number().optional(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        const updateData: any = { ...rest };
        
        if (input.status === "completed" || input.status === "failed") {
          updateData.completedAt = new Date();
        }
        
        await db.updateBackupLog(id, updateData);
        return { success: true };
      }),
  }),

  // Support & Help
  faqsAndHelpDocs: router({
    // FAQ Management
    getAllFaqs: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        isPublished: z.boolean().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllFaqs(input || {});
      }),
    
    getFaqById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFaqById(input.id);
      }),
    
    createFaq: protectedProcedure
      .input(z.object({
        question: z.string(),
        answer: z.string(),
        category: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createFaq({
          ...input,
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_faq",
          entityType: "faq",
          details: JSON.stringify({ question: input.question }),
        });
        
        return { success: true };
      }),
    
    updateFaq: protectedProcedure
      .input(z.object({
        id: z.number(),
        question: z.string().optional(),
        answer: z.string().optional(),
        category: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        await db.updateFaq(id, rest);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_faq",
          entityType: "faq",
          entityId: id,
        });
        
        return { success: true };
      }),
    
    deleteFaq: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteFaq(input.id);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_faq",
          entityType: "faq",
          entityId: input.id,
        });
        
        return { success: true };
      }),
    
    // Help Documentation Management
    getAllHelpDocs: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        isPublished: z.boolean().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllHelpDocs(input || {});
      }),
    
    getHelpDocById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getHelpDocById(input.id);
      }),
    
    createHelpDoc: protectedProcedure
      .input(z.object({
        title: z.string(),
        slug: z.string(),
        content: z.string(),
        category: z.string().optional(),
        tags: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createHelpDoc({
          ...input,
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_help_doc",
          entityType: "help_doc",
          details: JSON.stringify({ title: input.title }),
        });
        
        return { success: true };
      }),
    
    updateHelpDoc: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        slug: z.string().optional(),
        content: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        isPublished: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        await db.updateHelpDoc(id, rest);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_help_doc",
          entityType: "help_doc",
          entityId: id,
        });
        
        return { success: true };
      }),
    
    deleteHelpDoc: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteHelpDoc(input.id);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_help_doc",
          entityType: "help_doc",
          entityId: input.id,
        });
        
        return { success: true };
      }),
  }),

  // Reports & Export
  reports: router({
    // Custom Reports
    getAllReports: protectedProcedure
      .input(z.object({
        reportType: z.string().optional(),
        isPublic: z.boolean().optional(),
        createdBy: z.number().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllReports(input || {});
      }),
    
    getReportById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getReportById(input.id);
      }),
    
    createReport: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        reportType: z.string(),
        filters: z.string().optional(),
        columns: z.string().optional(),
        groupBy: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        chartType: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createReport({
          ...input,
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_report",
          entityType: "report",
          details: `Created report: ${input.name}`,
        });
        
        return { success: true };
      }),
    
    updateReport: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        reportType: z.string().optional(),
        filters: z.string().optional(),
        columns: z.string().optional(),
        groupBy: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        chartType: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        await db.updateReport(id, rest);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_report",
          entityType: "report",
          entityId: id,
        });
        
        return { success: true };
      }),
    
    deleteReport: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteReport(input.id);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_report",
          entityType: "report",
          entityId: input.id,
        });
        
        return { success: true };
      }),

    // Scheduled Reports
    getAllScheduledReports: protectedProcedure
      .input(z.object({
        reportId: z.number().optional(),
        frequency: z.string().optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllScheduledReports(input || {});
      }),
    
    getScheduledReportById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getScheduledReportById(input.id);
      }),
    
    createScheduledReport: protectedProcedure
      .input(z.object({
        reportId: z.number(),
        name: z.string(),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        time: z.string(),
        recipients: z.string(),
        format: z.enum(["pdf", "csv", "excel"]),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createScheduledReport({
          ...input,
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_scheduled_report",
          entityType: "scheduled_report",
          details: `Created scheduled report: ${input.name}`,
        });
        
        return { success: true };
      }),
    
    updateScheduledReport: protectedProcedure
      .input(z.object({
        id: z.number(),
        reportId: z.number().optional(),
        name: z.string().optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        time: z.string().optional(),
        recipients: z.string().optional(),
        format: z.enum(["pdf", "csv", "excel"]).optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        await db.updateScheduledReport(id, rest);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_scheduled_report",
          entityType: "scheduled_report",
          entityId: id,
        });
        
        return { success: true };
      }),
    
    deleteScheduledReport: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteScheduledReport(input.id);
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_scheduled_report",
          entityType: "scheduled_report",
          entityId: input.id,
        });
        
        return { success: true };
      }),

    // Export History
    getAllExportHistory: protectedProcedure
      .input(z.object({
        exportType: z.string().optional(),
        format: z.string().optional(),
        status: z.string().optional(),
        createdBy: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllExportHistory(input || {});
      }),
    
    getExportHistoryById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getExportHistoryById(input.id);
      }),
    
    createExportHistory: protectedProcedure
      .input(z.object({
        filename: z.string(),
        exportType: z.string(),
        format: z.enum(["csv", "excel", "pdf"]),
        filters: z.string().optional(),
        recordCount: z.number().optional(),
        fileSize: z.number().optional(),
        status: z.enum(["pending", "completed", "failed"]).optional(),
        downloadUrl: z.string().optional(),
        errorMessage: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createExportHistory({
          ...input,
          createdBy: ctx.user.id,
        });
        
        // Log activity
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_export",
          entityType: "export",
          details: `Created export: ${input.filename}`,
        });
        
        return { success: true };
      }),
    
    updateExportHistory: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed"]).optional(),
        downloadUrl: z.string().optional(),
        errorMessage: z.string().optional(),
        recordCount: z.number().optional(),
        fileSize: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await db.updateExportHistory(id, rest);
        return { success: true };
      }),
  }),

  // Notifications router for email templates, push notifications, and preferences
  emailAndPushNotifications: router({
    // Email Templates
    getAllEmailTemplates: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        isActive: z.boolean().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllEmailTemplates(input);
      }),
    
    getEmailTemplateById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getEmailTemplateById(input.id);
      }),
    
    createEmailTemplate: protectedProcedure
      .input(z.object({
        name: z.string(),
        subject: z.string(),
        body: z.string(),
        category: z.string().optional(),
        variables: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createEmailTemplate({
          ...input,
          createdBy: ctx.user.id,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_email_template",
          entityType: "email_template",
          details: `Created email template: ${input.name}`,
        });
        
        return { success: true };
      }),
    
    updateEmailTemplate: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        subject: z.string().optional(),
        body: z.string().optional(),
        category: z.string().optional(),
        variables: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        await db.updateEmailTemplate(id, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_email_template",
          entityType: "email_template",
          details: `Updated email template ID: ${id}`,
        });
        
        return { success: true };
      }),
    
    deleteEmailTemplate: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteEmailTemplate(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_email_template",
          entityType: "email_template",
          details: `Deleted email template ID: ${input.id}`,
        });
        
        return { success: true };
      }),
    
    // Push Notifications
    getAllPushNotifications: protectedProcedure
      .input(z.object({
        type: z.string().optional(),
        targetAudience: z.string().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllPushNotifications(input);
      }),
    
    getPushNotificationById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPushNotificationById(input.id);
      }),
    
    createPushNotification: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(["info", "success", "warning", "error"]).optional(),
        targetAudience: z.enum(["all", "users", "riders", "sellers", "specific"]),
        targetUserIds: z.string().optional(),
        scheduledFor: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createPushNotification({
          ...input,
          sentBy: ctx.user.id,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_push_notification",
          entityType: "push_notification",
          details: `Created push notification: ${input.title}`,
        });
        
        return { success: true };
      }),
    
    updatePushNotification: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "sent", "failed"]).optional(),
        sentCount: z.number().optional(),
        deliveredCount: z.number().optional(),
        clickedCount: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...rest } = input;
        await db.updatePushNotification(id, rest);
        return { success: true };
      }),
    
    deletePushNotification: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deletePushNotification(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_push_notification",
          entityType: "push_notification",
          details: `Deleted push notification ID: ${input.id}`,
        });
        
        return { success: true };
      }),
    
    // Notification Preferences
    getAllNotificationPreferences: protectedProcedure
      .query(async () => {
        return await db.getAllNotificationPreferences();
      }),
    
    getNotificationPreferenceByUserId: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getNotificationPreferenceByUserId(input.userId);
      }),
    
    createNotificationPreference: protectedProcedure
      .input(z.object({
        userId: z.number(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        orderUpdates: z.boolean().optional(),
        promotions: z.boolean().optional(),
        newsletter: z.boolean().optional(),
        riderUpdates: z.boolean().optional(),
        paymentAlerts: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.createNotificationPreference(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_notification_preference",
          entityType: "notification_preference",
          details: `Created notification preferences for user ID: ${input.userId}`,
        });
        
        return { success: true };
      }),
    
    updateNotificationPreference: protectedProcedure
      .input(z.object({
        userId: z.number(),
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        orderUpdates: z.boolean().optional(),
        promotions: z.boolean().optional(),
        newsletter: z.boolean().optional(),
        riderUpdates: z.boolean().optional(),
        paymentAlerts: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { userId, ...rest } = input;
        await db.updateNotificationPreference(userId, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_notification_preference",
          entityType: "notification_preference",
          details: `Updated notification preferences for user ID: ${userId}`,
        });
        
        return { success: true };
      }),
    
    deleteNotificationPreference: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteNotificationPreference(input.userId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_notification_preference",
          entityType: "notification_preference",
          details: `Deleted notification preferences for user ID: ${input.userId}`,
        });
        
        return { success: true };
      }),
  }),

  marketing: router({
    // Coupon Management
    getAllCoupons: protectedProcedure
      .input(z.object({
        isActive: z.boolean().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllCoupons(input || {});
      }),
    
    getCouponById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCouponById(input.id);
      }),
    
    createCoupon: protectedProcedure
      .input(z.object({
        code: z.string(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]),
        discountValue: z.number(),
        minOrderAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().optional(),
        perUserLimit: z.number().optional(),
        validFrom: z.date(),
        validUntil: z.date(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const coupon = await db.createCoupon({
          ...input,
          createdBy: ctx.user.id,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_coupon",
          entityType: "coupon",
          details: `Created coupon: ${input.code}`,
        });
        
        return coupon;
      }),
    
    updateCoupon: protectedProcedure
      .input(z.object({
        id: z.number(),
        code: z.string().optional(),
        description: z.string().optional(),
        discountType: z.enum(["percentage", "fixed"]).optional(),
        discountValue: z.number().optional(),
        minOrderAmount: z.number().optional(),
        maxDiscountAmount: z.number().optional(),
        usageLimit: z.number().optional(),
        perUserLimit: z.number().optional(),
        validFrom: z.date().optional(),
        validUntil: z.date().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        const updated = await db.updateCoupon(id, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_coupon",
          entityType: "coupon",
          details: `Updated coupon ID: ${id}`,
        });
        
        return updated;
      }),
    
    deleteCoupon: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteCoupon(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_coupon",
          entityType: "coupon",
          details: `Deleted coupon ID: ${input.id}`,
        });
        
        return { success: true };
      }),
    
    getCouponUsage: protectedProcedure
      .input(z.object({ couponId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCouponUsage(input.couponId);
      }),
    
    // Promotional Campaigns
    getAllPromotionalCampaigns: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        type: z.string().optional(),
        search: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllPromotionalCampaigns(input || {});
      }),
    
    getPromotionalCampaignById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPromotionalCampaignById(input.id);
      }),
    
    createPromotionalCampaign: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        type: z.enum(["discount", "free_delivery", "cashback", "bundle"]),
        targetAudience: z.enum(["all", "new_users", "active_users", "inactive_users", "specific"]),
        targetUserIds: z.string().optional(),
        budget: z.number().optional(),
        startDate: z.date(),
        endDate: z.date(),
        status: z.enum(["draft", "scheduled", "active", "paused", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const campaign = await db.createPromotionalCampaign({
          ...input,
          createdBy: ctx.user.id,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_promotional_campaign",
          entityType: "promotional_campaign",
          details: `Created promotional campaign: ${input.name}`,
        });
        
        return campaign;
      }),
    
    updatePromotionalCampaign: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        type: z.enum(["discount", "free_delivery", "cashback", "bundle"]).optional(),
        targetAudience: z.enum(["all", "new_users", "active_users", "inactive_users", "specific"]).optional(),
        targetUserIds: z.string().optional(),
        budget: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.enum(["draft", "scheduled", "active", "paused", "completed", "cancelled"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        const updated = await db.updatePromotionalCampaign(id, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_promotional_campaign",
          entityType: "promotional_campaign",
          details: `Updated promotional campaign ID: ${id}`,
        });
        
        return updated;
      }),
    
    deletePromotionalCampaign: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deletePromotionalCampaign(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_promotional_campaign",
          entityType: "promotional_campaign",
          details: `Deleted promotional campaign ID: ${input.id}`,
        });
        
        return { success: true };
      }),
    
    // Loyalty Program
    getAllLoyaltyPrograms: protectedProcedure
      .query(async () => {
        return await db.getAllLoyaltyPrograms();
      }),
    
    getLoyaltyProgramByUserId: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLoyaltyProgramByUserId(input.userId);
      }),
    
    createLoyaltyProgram: protectedProcedure
      .input(z.object({
        userId: z.number(),
        points: z.number().optional(),
        tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const program = await db.createLoyaltyProgram(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_loyalty_program",
          entityType: "loyalty_program",
          details: `Created loyalty program for user ID: ${input.userId}`,
        });
        
        return program;
      }),
    
    updateLoyaltyProgram: protectedProcedure
      .input(z.object({
        userId: z.number(),
        points: z.number().optional(),
        tier: z.enum(["bronze", "silver", "gold", "platinum"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { userId, ...rest } = input;
        const updated = await db.updateLoyaltyProgram(userId, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_loyalty_program",
          entityType: "loyalty_program",
          details: `Updated loyalty program for user ID: ${userId}`,
        });
        
        return updated;
      }),
    
    deleteLoyaltyProgram: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteLoyaltyProgram(input.userId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_loyalty_program",
          entityType: "loyalty_program",
          details: `Deleted loyalty program for user ID: ${input.userId}`,
        });
        
        return { success: true };
      }),
    
    getLoyaltyTransactions: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLoyaltyTransactions(input.userId);
      }),
    
    createLoyaltyTransaction: protectedProcedure
      .input(z.object({
        userId: z.number(),
        type: z.enum(["earned", "redeemed", "expired", "adjusted"]),
        points: z.number(),
        description: z.string(),
        orderId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transaction = await db.createLoyaltyTransaction(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_loyalty_transaction",
          entityType: "loyalty_transaction",
          details: `Created loyalty transaction for user ID: ${input.userId} - ${input.type}: ${input.points} points`,
        });
        
        return transaction;
      }),
  }),

  payoutsAndTransactions: router({
    // Payouts Management
    getAllPayouts: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        recipientType: z.string().optional(),
        search: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllPayouts(input);
      }),
    
    getPayoutById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getPayoutById(input.id);
      }),
    
    createPayout: protectedProcedure
      .input(z.object({
        recipientId: z.number(),
        recipientType: z.enum(["rider", "seller"]),
        amount: z.number(),
        currency: z.string().optional(),
        paymentMethod: z.string(),
        accountDetails: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const payout = await db.createPayout(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_payout",
          entityType: "payout",
          details: `Created payout for ${input.recipientType} ID: ${input.recipientId} - Amount: ${input.amount}`,
        });
        
        return payout;
      }),
    
    updatePayout: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "approved", "rejected", "processing", "completed", "failed"]).optional(),
        notes: z.string().optional(),
        approvedBy: z.number().optional(),
        approvedAt: z.date().optional(),
        processedAt: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        const updated = await db.updatePayout(id, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_payout",
          entityType: "payout",
          details: `Updated payout ID: ${id}`,
        });
        
        return updated;
      }),
    
    deletePayout: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deletePayout(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_payout",
          entityType: "payout",
          details: `Deleted payout ID: ${input.id}`,
        });
        
        return { success: true };
      }),
    
    // Transactions Management
    getAllTransactions: protectedProcedure
      .input(z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
        sortBy: z.enum(["date", "amount", "type", "status"]).optional(),
        sortDirection: z.enum(["asc", "desc"]).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllTransactions(input);
      }),
    
    getTransactionById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTransactionById(input.id);
      }),
    
    createTransaction: protectedProcedure
      .input(z.object({
        transactionId: z.string(),
        type: z.enum(["order_payment", "payout", "refund", "commission", "fee", "adjustment"]),
        amount: z.number(),
        currency: z.string().optional(),
        status: z.enum(["pending", "completed", "failed", "cancelled"]),
        userId: z.number().optional(),
        orderId: z.number().optional(),
        payoutId: z.number().optional(),
        description: z.string(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transaction = await db.createTransaction(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_transaction",
          entityType: "transaction",
          details: `Created transaction: ${input.transactionId}`,
        });
        
        return transaction;
      }),
    
    exportTransactionsCSV: protectedProcedure
      .input(z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transactions = await db.getAllTransactions(input);
        
        // Generate CSV content
        const headers = ['Transaction ID', 'Type', 'Amount (FCFA)', 'Status', 'Description', 'User ID', 'Order ID', 'Payout ID', 'Created At'];
        const rows = transactions.map(t => [
          t.transactionId,
          t.type,
          (t.amount / 100).toFixed(2),
          t.status,
          t.description || '',
          t.userId || '',
          t.orderId || '',
          t.payoutId || '',
          new Date(t.createdAt).toISOString()
        ]);
        
        const csvContent = [
          headers.join(','),
          ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        await db.createActivityLog({
          adminId: ctx.user.id,
          adminName: ctx.user.name || 'Unknown',
          action: 'export',
          entityType: 'transaction',
          entityId: 0, // 0 for bulk exports
          details: `Exported ${transactions.length} transactions to CSV`,
        });
        
        return { content: csvContent, count: transactions.length };
      }),

    exportTransactionsExcel: protectedProcedure
      .input(z.object({
        type: z.string().optional(),
        status: z.string().optional(),
        search: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        minAmount: z.number().optional(),
        maxAmount: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transactions = await db.getAllTransactions(input);
        
        // For Excel, we'll return the data and let the frontend handle the Excel generation
        // using a library like xlsx
        const data = transactions.map(t => ({
          'Transaction ID': t.transactionId,
          'Type': t.type,
          'Amount (FCFA)': (t.amount / 100).toFixed(2),
          'Status': t.status,
          'Description': t.description || '',
          'User ID': t.userId || '',
          'Order ID': t.orderId || '',
          'Payout ID': t.payoutId || '',
          'Created At': new Date(t.createdAt).toISOString()
        }));
        
        await db.createActivityLog({
          adminId: ctx.user.id,
          adminName: ctx.user.name || 'Unknown',
          action: 'export',
          entityType: 'transaction',
          entityId: 0, // 0 for bulk exports
          details: `Exported ${transactions.length} transactions to Excel`,
        });
        
        return { data, count: transactions.length };
      }),

    deleteTransaction: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pending", "completed", "failed", "cancelled"]).optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...rest } = input;
        const updated = await db.updateTransaction(id, rest);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_transaction",
          entityType: "transaction",
          details: `Updated transaction ID: ${id}`,
        });
        
        return updated;
      }),

    // Bulk Transaction Operations
    bulkUpdateTransactionStatus: protectedProcedure
      .input(z.object({
        ids: z.array(z.number()),
        status: z.enum(["pending", "completed", "failed", "cancelled"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const results = [];
        for (const id of input.ids) {
          const updated = await db.updateTransaction(id, { status: input.status });
          results.push(updated);
        }
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "bulk_update_transaction_status",
          entityType: "transaction",
          details: `Bulk updated ${input.ids.length} transactions to status: ${input.status}`,
        });
        
        return { success: true, count: results.length };
      }),

    bulkRefundTransactions: protectedProcedure
      .input(z.object({
        ids: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        const results = [];
        for (const id of input.ids) {
          // Get original transaction
          const original = await db.getTransactionById(id);
          if (!original || original.type !== 'order_payment') continue;
          
          // Create refund transaction
          const refund = await db.createTransaction({
            transactionId: `REF-${original.transactionId}-${Date.now()}`,
            type: 'refund',
            amount: original.amount,
            status: 'pending',
            userId: original.userId,
            orderId: original.orderId,
            description: `Refund for transaction ${original.transactionId}`,
            metadata: JSON.stringify({ originalTransactionId: original.id }),
          });
          results.push(refund);
        }
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "bulk_refund_transactions",
          entityType: "transaction",
          details: `Bulk created ${results.length} refund transactions`,
        });
        
        return { success: true, count: results.length };
      }),

    bulkReconcileTransactions: protectedProcedure
      .input(z.object({
        ids: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        const results = [];
        for (const id of input.ids) {
          const updated = await db.updateTransaction(id, { 
            status: 'completed',
            metadata: JSON.stringify({ reconciledAt: new Date().toISOString(), reconciledBy: ctx.user.id })
          });
          results.push(updated);
        }
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "bulk_reconcile_transactions",
          entityType: "transaction",
          details: `Bulk reconciled ${input.ids.length} transactions`,
        });
        
        return { success: true, count: results.length };
      }),

    // Transaction Receipt Generation
    generateTransactionReceipt: protectedProcedure
      .input(z.object({
        transactionId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transaction = await db.getTransactionById(input.transactionId);
        if (!transaction) {
          throw new Error("Transaction not found");
        }

        // Import QRCode dynamically
        const QRCode = (await import('qrcode')).default;
        
        // Generate QR code with transaction verification URL
        const verificationUrl = `https://okada-admin.manus.space/verify/${transaction.transactionId}`;
        const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl);
        
        // Generate receipt HTML
        const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 24px; font-weight: bold; color: #333; }
    .company-info { font-size: 12px; color: #666; margin-top: 10px; }
    .receipt-title { font-size: 20px; font-weight: bold; margin: 20px 0; }
    .transaction-info { margin: 20px 0; }
    .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    .amount { font-size: 24px; font-weight: bold; color: #2563eb; text-align: center; margin: 30px 0; }
    .qr-code { text-align: center; margin: 30px 0; }
    .qr-code img { width: 150px; height: 150px; }
    .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; font-size: 12px; color: #666; }
    .status { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 14px; font-weight: bold; }
    .status-completed { background-color: #10b981; color: white; }
    .status-pending { background-color: #f59e0b; color: white; }
    .status-failed { background-color: #ef4444; color: white; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">OKADA Admin</div>
    <div class="company-info">
      Transaction Receipt<br>
      Generated on ${new Date().toLocaleString()}
    </div>
  </div>
  
  <div class="receipt-title">Transaction Receipt</div>
  
  <div class="transaction-info">
    <div class="info-row">
      <span class="label">Transaction ID:</span>
      <span class="value">${transaction.transactionId}</span>
    </div>
    <div class="info-row">
      <span class="label">Type:</span>
      <span class="value">${transaction.type.replace('_', ' ').toUpperCase()}</span>
    </div>
    <div class="info-row">
      <span class="label">Status:</span>
      <span class="value">
        <span class="status status-${transaction.status}">${transaction.status.toUpperCase()}</span>
      </span>
    </div>
    <div class="info-row">
      <span class="label">Date:</span>
      <span class="value">${new Date(transaction.createdAt).toLocaleString()}</span>
    </div>
    ${transaction.description ? `
    <div class="info-row">
      <span class="label">Description:</span>
      <span class="value">${transaction.description}</span>
    </div>
    ` : ''}
    ${transaction.userId ? `
    <div class="info-row">
      <span class="label">User ID:</span>
      <span class="value">${transaction.userId}</span>
    </div>
    ` : ''}
    ${transaction.orderId ? `
    <div class="info-row">
      <span class="label">Order ID:</span>
      <span class="value">${transaction.orderId}</span>
    </div>
    ` : ''}
  </div>
  
  <div class="amount">
    ${(transaction.amount / 100).toLocaleString()} FCFA
  </div>
  
  <div class="qr-code">
    <img src="${qrCodeDataUrl}" alt="QR Code" />
    <div style="margin-top: 10px; font-size: 12px; color: #666;">
      Scan to verify transaction
    </div>
  </div>
  
  <div class="footer">
    This is an official receipt from OKADA Admin<br>
    For support, please contact support@okada-admin.com<br>
    <br>
    Receipt ID: ${transaction.id}-${Date.now()}
  </div>
</body>
</html>
        `;
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "generate_receipt",
          entityType: "transaction",
          entityId: transaction.id,
          details: `Generated receipt for transaction ${transaction.transactionId}`,
        });
        
        return { html: receiptHtml, transactionId: transaction.transactionId };
      }),
    
    // Revenue Analytics
    getAllRevenueAnalytics: protectedProcedure
      .input(z.object({
        period: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getAllRevenueAnalytics(input);
      }),

    // Transaction Period Comparison
    getTransactionPeriodComparison: protectedProcedure
      .input(z.object({
        periodType: z.enum(["week", "month", "quarter", "year", "custom"]),
        currentStartDate: z.date().optional(),
        currentEndDate: z.date().optional(),
        previousStartDate: z.date().optional(),
        previousEndDate: z.date().optional(),
      }))
      .query(async ({ input }) => {
        const { periodType, currentStartDate, currentEndDate, previousStartDate, previousEndDate } = input;
        
        // Calculate date ranges based on period type if not custom
        let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
        
        if (periodType === "custom" && currentStartDate && currentEndDate && previousStartDate && previousEndDate) {
          currentStart = currentStartDate;
          currentEnd = currentEndDate;
          previousStart = previousStartDate;
          previousEnd = previousEndDate;
        } else {
          const now = new Date();
          
          switch (periodType) {
            case "week":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setDate(currentStart.getDate() - 7);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setDate(previousStart.getDate() - 7);
              break;
            case "month":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 1);
              break;
            case "quarter":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 3);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 3);
              break;
            case "year":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setFullYear(currentStart.getFullYear() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setFullYear(previousStart.getFullYear() - 1);
              break;
            default:
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 1);
          }
        }
        
        // Get transactions for current period
        const currentTransactions = await db.getAllTransactions({
          startDate: currentStart,
          endDate: currentEnd,
        });
        
        // Get transactions for previous period
        const previousTransactions = await db.getAllTransactions({
          startDate: previousStart,
          endDate: previousEnd,
        });
        
        // Calculate metrics for current period
        const currentMetrics = {
          totalTransactions: currentTransactions.length,
          completedTransactions: currentTransactions.filter(t => t.status === "completed").length,
          successRate: currentTransactions.length > 0 
            ? (currentTransactions.filter(t => t.status === "completed").length / currentTransactions.length) * 100 
            : 0,
          totalRevenue: currentTransactions
            .filter(t => t.status === "completed")
            .reduce((sum, t) => sum + t.amount, 0),
          averageAmount: currentTransactions.length > 0
            ? currentTransactions.reduce((sum, t) => sum + t.amount, 0) / currentTransactions.length
            : 0,
          byType: currentTransactions.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byStatus: currentTransactions.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
        
        // Calculate metrics for previous period
        const previousMetrics = {
          totalTransactions: previousTransactions.length,
          completedTransactions: previousTransactions.filter(t => t.status === "completed").length,
          successRate: previousTransactions.length > 0
            ? (previousTransactions.filter(t => t.status === "completed").length / previousTransactions.length) * 100
            : 0,
          totalRevenue: previousTransactions
            .filter(t => t.status === "completed")
            .reduce((sum, t) => sum + t.amount, 0),
          averageAmount: previousTransactions.length > 0
            ? previousTransactions.reduce((sum, t) => sum + t.amount, 0) / previousTransactions.length
            : 0,
          byType: previousTransactions.reduce((acc, t) => {
            acc[t.type] = (acc[t.type] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
          byStatus: previousTransactions.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>),
        };
        
        // Calculate percentage changes
        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };
        
        const changes = {
          totalTransactions: calculateChange(currentMetrics.totalTransactions, previousMetrics.totalTransactions),
          completedTransactions: calculateChange(currentMetrics.completedTransactions, previousMetrics.completedTransactions),
          successRate: currentMetrics.successRate - previousMetrics.successRate,
          totalRevenue: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
          averageAmount: calculateChange(currentMetrics.averageAmount, previousMetrics.averageAmount),
        };
        
        return {
          periodType,
          currentPeriod: {
            startDate: currentStart,
            endDate: currentEnd,
            metrics: currentMetrics,
          },
          previousPeriod: {
            startDate: previousStart,
            endDate: previousEnd,
            metrics: previousMetrics,
          },
          changes,
        };
      }),
    
    createRevenueAnalytics: protectedProcedure
      .input(z.object({
        date: z.date(),
        period: z.enum(["daily", "weekly", "monthly"]),
        totalRevenue: z.number().optional(),
        orderCount: z.number().optional(),
        averageOrderValue: z.number().optional(),
        commissionEarned: z.number().optional(),
        payoutsProcessed: z.number().optional(),
        netRevenue: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const analytics = await db.createRevenueAnalytics(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_revenue_analytics",
          entityType: "revenue_analytics",
          details: `Created revenue analytics for ${input.period} period`,
        });
        
        return analytics;
      }),

    // Export Period Comparison Report as PDF
    exportPeriodComparisonPDF: protectedProcedure
      .input(z.object({
        periodType: z.enum(["week", "month", "quarter", "year"]),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get comparison data
        const comparisonData = await (async () => {
          const { periodType } = input;
          let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
          
          const now = new Date();
          switch (periodType) {
            case "week":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setDate(currentStart.getDate() - 7);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setDate(previousStart.getDate() - 7);
              break;
            case "month":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 1);
              break;
            case "quarter":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 3);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 3);
              break;
            case "year":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setFullYear(currentStart.getFullYear() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setFullYear(previousStart.getFullYear() - 1);
              break;
            default:
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 1);
          }
          
          const currentTransactions = await db.getAllTransactions({ startDate: currentStart, endDate: currentEnd });
          const previousTransactions = await db.getAllTransactions({ startDate: previousStart, endDate: previousEnd });
          
          const currentMetrics = {
            totalTransactions: currentTransactions.length,
            completedTransactions: currentTransactions.filter(t => t.status === "completed").length,
            successRate: currentTransactions.length > 0 ? (currentTransactions.filter(t => t.status === "completed").length / currentTransactions.length) * 100 : 0,
            totalRevenue: currentTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
            averageAmount: currentTransactions.length > 0 ? currentTransactions.reduce((sum, t) => sum + t.amount, 0) / currentTransactions.length : 0,
          };
          
          const previousMetrics = {
            totalTransactions: previousTransactions.length,
            completedTransactions: previousTransactions.filter(t => t.status === "completed").length,
            successRate: previousTransactions.length > 0 ? (previousTransactions.filter(t => t.status === "completed").length / previousTransactions.length) * 100 : 0,
            totalRevenue: previousTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
            averageAmount: previousTransactions.length > 0 ? previousTransactions.reduce((sum, t) => sum + t.amount, 0) / previousTransactions.length : 0,
          };
          
          const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
          };
          
          return {
            periodType,
            currentPeriod: { startDate: currentStart, endDate: currentEnd, metrics: currentMetrics },
            previousPeriod: { startDate: previousStart, endDate: previousEnd, metrics: previousMetrics },
            changes: {
              totalTransactions: calculateChange(currentMetrics.totalTransactions, previousMetrics.totalTransactions),
              successRate: currentMetrics.successRate - previousMetrics.successRate,
              totalRevenue: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
              averageAmount: calculateChange(currentMetrics.averageAmount, previousMetrics.averageAmount),
            },
          };
        })();
        
        const getPeriodLabel = (type: string) => {
          const labels = { week: "Week over Week", month: "Month over Month", quarter: "Quarter over Quarter", year: "Year over Year" };
          return labels[type as keyof typeof labels] || "Period Comparison";
        };
        
        const formatChange = (change: number) => {
          if (change > 0) return `+${change.toFixed(1)}%`;
          if (change < 0) return `${change.toFixed(1)}%`;
          return "0%";
        };
        
        const getChangeColor = (change: number) => {
          if (change > 0) return "#10b981";
          if (change < 0) return "#ef4444";
          return "#6b7280";
        };
        
        // Generate PDF HTML
        const pdfHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; }
    .header { text-align: center; border-bottom: 3px solid #2D8659; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #2D8659; }
    .report-title { font-size: 22px; font-weight: bold; margin: 20px 0 10px; }
    .report-subtitle { font-size: 14px; color: #666; margin-bottom: 30px; }
    .period-label { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .metric-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .metric-title { font-size: 14px; color: #666; margin-bottom: 10px; }
    .metric-value { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
    .metric-comparison { font-size: 12px; color: #666; }
    .metric-change { font-size: 14px; font-weight: 600; margin-top: 5px; }
    .section-title { font-size: 18px; font-weight: bold; margin: 30px 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .comparison-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .comparison-table th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border: 1px solid #e5e7eb; }
    .comparison-table td { padding: 12px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">OKADA Admin</div>
    <div style="margin-top: 10px; font-size: 14px; color: #666;">Transaction Analytics Report</div>
  </div>
  
  <div class="report-title">Period Comparison Report</div>
  <div class="report-subtitle">Generated on ${new Date().toLocaleString()}</div>
  <div class="period-label">${getPeriodLabel(comparisonData.periodType)}</div>
  
  <div class="metrics-grid">
    <div class="metric-card">
      <div class="metric-title">Total Transactions</div>
      <div class="metric-value">${comparisonData.currentPeriod.metrics.totalTransactions.toLocaleString()}</div>
      <div class="metric-comparison">vs ${comparisonData.previousPeriod.metrics.totalTransactions.toLocaleString()} previous</div>
      <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.totalTransactions)};">
        ${formatChange(comparisonData.changes.totalTransactions)}
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Success Rate</div>
      <div class="metric-value">${comparisonData.currentPeriod.metrics.successRate.toFixed(1)}%</div>
      <div class="metric-comparison">vs ${comparisonData.previousPeriod.metrics.successRate.toFixed(1)}% previous</div>
      <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.successRate)};">
        ${formatChange(comparisonData.changes.successRate)}
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Total Revenue</div>
      <div class="metric-value">${(comparisonData.currentPeriod.metrics.totalRevenue / 100).toLocaleString()} FCFA</div>
      <div class="metric-comparison">vs ${(comparisonData.previousPeriod.metrics.totalRevenue / 100).toLocaleString()} FCFA previous</div>
      <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.totalRevenue)};">
        ${formatChange(comparisonData.changes.totalRevenue)}
      </div>
    </div>
    
    <div class="metric-card">
      <div class="metric-title">Average Amount</div>
      <div class="metric-value">${(comparisonData.currentPeriod.metrics.averageAmount / 100).toLocaleString()} FCFA</div>
      <div class="metric-comparison">vs ${(comparisonData.previousPeriod.metrics.averageAmount / 100).toLocaleString()} FCFA previous</div>
      <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.averageAmount)};">
        ${formatChange(comparisonData.changes.averageAmount)}
      </div>
    </div>
  </div>
  
  <div class="section-title">Detailed Comparison</div>
  <table class="comparison-table">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Current Period</th>
        <th>Previous Period</th>
        <th>Change</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Period Range</td>
        <td>${new Date(comparisonData.currentPeriod.startDate).toLocaleDateString()} - ${new Date(comparisonData.currentPeriod.endDate).toLocaleDateString()}</td>
        <td>${new Date(comparisonData.previousPeriod.startDate).toLocaleDateString()} - ${new Date(comparisonData.previousPeriod.endDate).toLocaleDateString()}</td>
        <td>-</td>
      </tr>
      <tr>
        <td>Total Transactions</td>
        <td>${comparisonData.currentPeriod.metrics.totalTransactions.toLocaleString()}</td>
        <td>${comparisonData.previousPeriod.metrics.totalTransactions.toLocaleString()}</td>
        <td style="color: ${getChangeColor(comparisonData.changes.totalTransactions)};">${formatChange(comparisonData.changes.totalTransactions)}</td>
      </tr>
      <tr>
        <td>Completed Transactions</td>
        <td>${comparisonData.currentPeriod.metrics.completedTransactions.toLocaleString()}</td>
        <td>${comparisonData.previousPeriod.metrics.completedTransactions.toLocaleString()}</td>
        <td>-</td>
      </tr>
      <tr>
        <td>Success Rate</td>
        <td>${comparisonData.currentPeriod.metrics.successRate.toFixed(1)}%</td>
        <td>${comparisonData.previousPeriod.metrics.successRate.toFixed(1)}%</td>
        <td style="color: ${getChangeColor(comparisonData.changes.successRate)};">${formatChange(comparisonData.changes.successRate)}</td>
      </tr>
      <tr>
        <td>Total Revenue (FCFA)</td>
        <td>${(comparisonData.currentPeriod.metrics.totalRevenue / 100).toLocaleString()}</td>
        <td>${(comparisonData.previousPeriod.metrics.totalRevenue / 100).toLocaleString()}</td>
        <td style="color: ${getChangeColor(comparisonData.changes.totalRevenue)};">${formatChange(comparisonData.changes.totalRevenue)}</td>
      </tr>
      <tr>
        <td>Average Transaction Amount (FCFA)</td>
        <td>${(comparisonData.currentPeriod.metrics.averageAmount / 100).toLocaleString()}</td>
        <td>${(comparisonData.previousPeriod.metrics.averageAmount / 100).toLocaleString()}</td>
        <td style="color: ${getChangeColor(comparisonData.changes.averageAmount)};">${formatChange(comparisonData.changes.averageAmount)}</td>
      </tr>
    </tbody>
  </table>
  
  <div class="footer">
    This is an official report from OKADA Admin<br>
    For support, please contact support@okada-admin.com<br>
    <br>
    Report ID: COMP-${Date.now()}
  </div>
</body>
</html>
        `;
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "export_period_comparison",
          entityType: "analytics",
          details: `Exported ${getPeriodLabel(input.periodType)} comparison report`,
        });
        
        return { html: pdfHtml, periodType: input.periodType };
      }),

    // Email Period Comparison Report to Stakeholders
    emailPeriodComparisonReport: protectedProcedure
      .input(z.object({
        periodType: z.enum(["week", "month", "quarter", "year"]),
        recipients: z.string().min(1, "At least one recipient email is required"),
        message: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Parse recipients (comma-separated emails)
        const recipientEmails = input.recipients
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);

        if (recipientEmails.length === 0) {
          throw new Error("At least one valid recipient email is required");
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipientEmails.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
        }

        // Get comparison data (reuse logic from exportPeriodComparisonPDF)
        const comparisonData = await (async () => {
          const { periodType } = input;
          let currentStart: Date, currentEnd: Date, previousStart: Date, previousEnd: Date;
          
          const now = new Date();
          switch (periodType) {
            case "week":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setDate(currentStart.getDate() - 7);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setDate(previousStart.getDate() - 7);
              break;
            case "month":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 1);
              break;
            case "quarter":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 3);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 3);
              break;
            case "year":
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setFullYear(currentStart.getFullYear() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setFullYear(previousStart.getFullYear() - 1);
              break;
            default:
              currentEnd = now;
              currentStart = new Date(now);
              currentStart.setMonth(currentStart.getMonth() - 1);
              previousEnd = new Date(currentStart);
              previousStart = new Date(previousEnd);
              previousStart.setMonth(previousStart.getMonth() - 1);
          }
          
          const currentTransactions = await db.getAllTransactions({ startDate: currentStart, endDate: currentEnd });
          const previousTransactions = await db.getAllTransactions({ startDate: previousStart, endDate: previousEnd });
          
          const currentMetrics = {
            totalTransactions: currentTransactions.length,
            completedTransactions: currentTransactions.filter(t => t.status === "completed").length,
            successRate: currentTransactions.length > 0 ? (currentTransactions.filter(t => t.status === "completed").length / currentTransactions.length) * 100 : 0,
            totalRevenue: currentTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
            averageAmount: currentTransactions.length > 0 ? currentTransactions.reduce((sum, t) => sum + t.amount, 0) / currentTransactions.length : 0,
          };
          
          const previousMetrics = {
            totalTransactions: previousTransactions.length,
            completedTransactions: previousTransactions.filter(t => t.status === "completed").length,
            successRate: previousTransactions.length > 0 ? (previousTransactions.filter(t => t.status === "completed").length / previousTransactions.length) * 100 : 0,
            totalRevenue: previousTransactions.filter(t => t.status === "completed").reduce((sum, t) => sum + t.amount, 0),
            averageAmount: previousTransactions.length > 0 ? previousTransactions.reduce((sum, t) => sum + t.amount, 0) / previousTransactions.length : 0,
          };
          
          const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return ((current - previous) / previous) * 100;
          };
          
          return {
            periodType,
            currentPeriod: { startDate: currentStart, endDate: currentEnd, metrics: currentMetrics },
            previousPeriod: { startDate: previousStart, endDate: previousEnd, metrics: previousMetrics },
            changes: {
              totalTransactions: calculateChange(currentMetrics.totalTransactions, previousMetrics.totalTransactions),
              successRate: currentMetrics.successRate - previousMetrics.successRate,
              totalRevenue: calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue),
              averageAmount: calculateChange(currentMetrics.averageAmount, previousMetrics.averageAmount),
            },
          };
        })();

        const getPeriodLabel = (type: string) => {
          const labels = { week: "Week over Week", month: "Month over Month", quarter: "Quarter over Quarter", year: "Year over Year" };
          return labels[type as keyof typeof labels] || "Period Comparison";
        };
        
        const formatChange = (change: number) => {
          if (change > 0) return `+${change.toFixed(1)}%`;
          if (change < 0) return `${change.toFixed(1)}%`;
          return "0%";
        };
        
        const getChangeColor = (change: number) => {
          if (change > 0) return "#10b981";
          if (change < 0) return "#ef4444";
          return "#6b7280";
        };

        // Generate email HTML with embedded report
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 40px; background-color: #f9fafb; }
    .email-container { background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .header { text-align: center; border-bottom: 3px solid #2D8659; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #2D8659; }
    .greeting { font-size: 16px; color: #333; margin-bottom: 20px; line-height: 1.6; }
    .user-message { background-color: #f3f4f6; border-left: 4px solid #2D8659; padding: 15px; margin: 20px 0; font-style: italic; color: #555; }
    .report-title { font-size: 22px; font-weight: bold; margin: 20px 0 10px; }
    .report-subtitle { font-size: 14px; color: #666; margin-bottom: 30px; }
    .period-label { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 20px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
    .metric-card { border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; }
    .metric-title { font-size: 14px; color: #666; margin-bottom: 10px; }
    .metric-value { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
    .metric-comparison { font-size: 12px; color: #666; }
    .metric-change { font-size: 14px; font-weight: 600; margin-top: 5px; }
    .section-title { font-size: 18px; font-weight: bold; margin: 30px 0 15px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .comparison-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .comparison-table th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border: 1px solid #e5e7eb; }
    .comparison-table td { padding: 12px; border: 1px solid #e5e7eb; }
    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <div class="logo">OKADA Admin</div>
      <div style="margin-top: 10px; font-size: 14px; color: #666;">Transaction Analytics Report</div>
    </div>
    
    <div class="greeting">
      Hello,<br><br>
      ${ctx.user.name || 'An admin'} has shared a transaction analytics comparison report with you from OKADA Admin Dashboard.
    </div>
    
    ${input.message ? `<div class="user-message">${input.message}</div>` : ''}
    
    <div class="report-title">Period Comparison Report</div>
    <div class="report-subtitle">Generated on ${new Date().toLocaleString()}</div>
    <div class="period-label">${getPeriodLabel(comparisonData.periodType)}</div>
    
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-title">Total Transactions</div>
        <div class="metric-value">${comparisonData.currentPeriod.metrics.totalTransactions.toLocaleString()}</div>
        <div class="metric-comparison">vs ${comparisonData.previousPeriod.metrics.totalTransactions.toLocaleString()} previous</div>
        <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.totalTransactions)};">
          ${formatChange(comparisonData.changes.totalTransactions)}
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Success Rate</div>
        <div class="metric-value">${comparisonData.currentPeriod.metrics.successRate.toFixed(1)}%</div>
        <div class="metric-comparison">vs ${comparisonData.previousPeriod.metrics.successRate.toFixed(1)}% previous</div>
        <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.successRate)};">
          ${formatChange(comparisonData.changes.successRate)}
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Total Revenue</div>
        <div class="metric-value">${(comparisonData.currentPeriod.metrics.totalRevenue / 100).toLocaleString()} FCFA</div>
        <div class="metric-comparison">vs ${(comparisonData.previousPeriod.metrics.totalRevenue / 100).toLocaleString()} FCFA previous</div>
        <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.totalRevenue)};">
          ${formatChange(comparisonData.changes.totalRevenue)}
        </div>
      </div>
      
      <div class="metric-card">
        <div class="metric-title">Average Amount</div>
        <div class="metric-value">${(comparisonData.currentPeriod.metrics.averageAmount / 100).toLocaleString()} FCFA</div>
        <div class="metric-comparison">vs ${(comparisonData.previousPeriod.metrics.averageAmount / 100).toLocaleString()} FCFA previous</div>
        <div class="metric-change" style="color: ${getChangeColor(comparisonData.changes.averageAmount)};">
          ${formatChange(comparisonData.changes.averageAmount)}
        </div>
      </div>
    </div>
    
    <div class="section-title">Detailed Comparison</div>
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Metric</th>
          <th>Current Period</th>
          <th>Previous Period</th>
          <th>Change</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Period Range</td>
          <td>${new Date(comparisonData.currentPeriod.startDate).toLocaleDateString()} - ${new Date(comparisonData.currentPeriod.endDate).toLocaleDateString()}</td>
          <td>${new Date(comparisonData.previousPeriod.startDate).toLocaleDateString()} - ${new Date(comparisonData.previousPeriod.endDate).toLocaleDateString()}</td>
          <td>-</td>
        </tr>
        <tr>
          <td>Total Transactions</td>
          <td>${comparisonData.currentPeriod.metrics.totalTransactions.toLocaleString()}</td>
          <td>${comparisonData.previousPeriod.metrics.totalTransactions.toLocaleString()}</td>
          <td style="color: ${getChangeColor(comparisonData.changes.totalTransactions)};">${formatChange(comparisonData.changes.totalTransactions)}</td>
        </tr>
        <tr>
          <td>Completed Transactions</td>
          <td>${comparisonData.currentPeriod.metrics.completedTransactions.toLocaleString()}</td>
          <td>${comparisonData.previousPeriod.metrics.completedTransactions.toLocaleString()}</td>
          <td>-</td>
        </tr>
        <tr>
          <td>Success Rate</td>
          <td>${comparisonData.currentPeriod.metrics.successRate.toFixed(1)}%</td>
          <td>${comparisonData.previousPeriod.metrics.successRate.toFixed(1)}%</td>
          <td style="color: ${getChangeColor(comparisonData.changes.successRate)};">${formatChange(comparisonData.changes.successRate)}</td>
        </tr>
        <tr>
          <td>Total Revenue (FCFA)</td>
          <td>${(comparisonData.currentPeriod.metrics.totalRevenue / 100).toLocaleString()}</td>
          <td>${(comparisonData.previousPeriod.metrics.totalRevenue / 100).toLocaleString()}</td>
          <td style="color: ${getChangeColor(comparisonData.changes.totalRevenue)};">${formatChange(comparisonData.changes.totalRevenue)}</td>
        </tr>
        <tr>
          <td>Average Transaction Amount (FCFA)</td>
          <td>${(comparisonData.currentPeriod.metrics.averageAmount / 100).toLocaleString()}</td>
          <td>${(comparisonData.previousPeriod.metrics.averageAmount / 100).toLocaleString()}</td>
          <td style="color: ${getChangeColor(comparisonData.changes.averageAmount)};">${formatChange(comparisonData.changes.averageAmount)}</td>
        </tr>
      </tbody>
    </table>
    
    <div class="footer">
      This is an official report from OKADA Admin<br>
      For support, please contact support@okada-admin.com<br>
      <br>
      Report ID: EMAIL-${Date.now()}<br>
      Sent by: ${ctx.user.name || 'Admin'} (${ctx.user.email || 'N/A'})
    </div>
  </div>
</body>
</html>
        `;

        // Send notification to owner about the email being sent
        const recipientList = recipientEmails.join(', ');
        await notifyOwner({
          title: "Transaction Report Emailed",
          content: `${ctx.user.name || 'An admin'} sent a ${getPeriodLabel(input.periodType)} transaction comparison report to: ${recipientList}`,
        });

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "email_period_comparison",
          entityType: "analytics",
          details: `Emailed ${getPeriodLabel(input.periodType)} comparison report to ${recipientEmails.length} recipient(s): ${recipientList}`,
        });

        return {
          success: true,
          recipientCount: recipientEmails.length,
          recipients: recipientList,
          html: emailHtml,
        };
      }),
  }),

  // Scheduled Reports Management
  scheduledReports: router({
    // List all scheduled reports
    list: protectedProcedure
      .input(z.object({
        reportType: z.string().optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        isActive: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getAllScheduledReports(input || {});
      }),

    // Get single scheduled report by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getScheduledReportById(input.id);
      }),

    // Create new scheduled report
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        reportType: z.string().default("transaction_analytics"),
        periodType: z.enum(["week", "month", "quarter", "year"]),
        frequency: z.enum(["daily", "weekly", "monthly"]),
        dayOfWeek: z.number().min(0).max(6).optional(), // 0=Sunday
        dayOfMonth: z.number().min(1).max(31).optional(),
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Time must be in HH:MM format"),
        recipients: z.string().min(1, "At least one recipient is required"),
        customMessage: z.string().optional(),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input, ctx }) => {
        // Validate recipients
        const recipientEmails = input.recipients
          .split(',')
          .map(email => email.trim())
          .filter(email => email.length > 0);

        if (recipientEmails.length === 0) {
          throw new Error("At least one valid recipient email is required");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = recipientEmails.filter(email => !emailRegex.test(email));
        if (invalidEmails.length > 0) {
          throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
        }

        // Validate frequency-specific fields
        if (input.frequency === "weekly" && input.dayOfWeek === undefined) {
          throw new Error("Day of week is required for weekly reports");
        }
        if (input.frequency === "monthly" && input.dayOfMonth === undefined) {
          throw new Error("Day of month is required for monthly reports");
        }

        // Calculate next run time
        const calculateNextRun = () => {
          const now = new Date();
          const [hours, minutes] = input.time.split(':').map(Number);
          const next = new Date(now);
          next.setHours(hours, minutes, 0, 0);

          if (input.frequency === "daily") {
            if (next <= now) next.setDate(next.getDate() + 1);
          } else if (input.frequency === "weekly") {
            const targetDay = input.dayOfWeek!;
            const currentDay = next.getDay();
            let daysToAdd = targetDay - currentDay;
            if (daysToAdd <= 0 || (daysToAdd === 0 && next <= now)) {
              daysToAdd += 7;
            }
            next.setDate(next.getDate() + daysToAdd);
          } else if (input.frequency === "monthly") {
            next.setDate(input.dayOfMonth!);
            if (next <= now) {
              next.setMonth(next.getMonth() + 1);
            }
          }

          return next;
        };

        const nextRunAt = calculateNextRun();

        await db.createScheduledReport({
          name: input.name,
          description: input.description || null,
          reportType: input.reportType,
          periodType: input.periodType,
          frequency: input.frequency,
          dayOfWeek: input.dayOfWeek ?? null,
          dayOfMonth: input.dayOfMonth ?? null,
          time: input.time,
          recipients: input.recipients,
          customMessage: input.customMessage || null,
          isActive: input.isActive,
          nextRunAt,
          createdBy: ctx.user.id,
        });

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_scheduled_report",
          entityType: "scheduled_report",
          details: `Created scheduled report: ${input.name} (${input.frequency})`,
        });

        return { success: true };
      }),

    // Update existing scheduled report
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        periodType: z.enum(["week", "month", "quarter", "year"]).optional(),
        frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
        dayOfWeek: z.number().min(0).max(6).optional(),
        dayOfMonth: z.number().min(1).max(31).optional(),
        time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
        recipients: z.string().optional(),
        customMessage: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updateData } = input;

        // Validate recipients if provided
        if (updateData.recipients) {
          const recipientEmails = updateData.recipients
            .split(',')
            .map(email => email.trim())
            .filter(email => email.length > 0);

          if (recipientEmails.length === 0) {
            throw new Error("At least one valid recipient email is required");
          }

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const invalidEmails = recipientEmails.filter(email => !emailRegex.test(email));
          if (invalidEmails.length > 0) {
            throw new Error(`Invalid email format: ${invalidEmails.join(', ')}`);
          }
        }

        await db.updateScheduledReport(id, updateData as any);

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_scheduled_report",
          entityType: "scheduled_report",
          entityId: id,
          details: `Updated scheduled report ID ${id}`,
        });

        return { success: true };
      }),

    // Toggle active status
    toggleActive: protectedProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateScheduledReport(input.id, { isActive: input.isActive });

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: input.isActive ? "activate_scheduled_report" : "deactivate_scheduled_report",
          entityType: "scheduled_report",
          entityId: input.id,
          details: `${input.isActive ? 'Activated' : 'Deactivated'} scheduled report ID ${input.id}`,
        });

        return { success: true };
      }),

    // Delete scheduled report
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const report = await db.getScheduledReportById(input.id);
        
        await db.deleteScheduledReport(input.id);

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_scheduled_report",
          entityType: "scheduled_report",
          entityId: input.id,
          details: `Deleted scheduled report: ${report?.name || 'Unknown'}`,
        });

        return { success: true };
      }),

    // Preview scheduled report email
    preview: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const report = await db.getScheduledReportById(input.id);
        
        if (!report) {
          throw new Error("Scheduled report not found");
        }

        // Generate comparison data using the same logic as emailPeriodComparisonReport
        const getPeriodDates = (periodType: string) => {
          const now = new Date();
          const currentStart = new Date(now);
          const currentEnd = new Date(now);
          const previousStart = new Date(now);
          const previousEnd = new Date(now);

          if (periodType === "week") {
            const dayOfWeek = currentEnd.getDay();
            currentStart.setDate(currentEnd.getDate() - dayOfWeek);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setHours(23, 59, 59, 999);
            previousStart.setDate(currentStart.getDate() - 7);
            previousEnd.setDate(currentStart.getDate() - 1);
            previousEnd.setHours(23, 59, 59, 999);
          } else if (periodType === "month") {
            currentStart.setDate(1);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setMonth(currentEnd.getMonth() + 1, 0);
            currentEnd.setHours(23, 59, 59, 999);
            previousStart.setMonth(currentStart.getMonth() - 1, 1);
            previousStart.setHours(0, 0, 0, 0);
            previousEnd.setDate(0);
            previousEnd.setHours(23, 59, 59, 999);
          } else if (periodType === "quarter") {
            const currentQuarter = Math.floor(currentEnd.getMonth() / 3);
            currentStart.setMonth(currentQuarter * 3, 1);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setMonth(currentQuarter * 3 + 3, 0);
            currentEnd.setHours(23, 59, 59, 999);
            previousStart.setMonth(currentStart.getMonth() - 3, 1);
            previousStart.setHours(0, 0, 0, 0);
            previousEnd.setMonth(currentStart.getMonth(), 0);
            previousEnd.setHours(23, 59, 59, 999);
          } else if (periodType === "year") {
            currentStart.setMonth(0, 1);
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setMonth(11, 31);
            currentEnd.setHours(23, 59, 59, 999);
            previousStart.setFullYear(currentStart.getFullYear() - 1, 0, 1);
            previousStart.setHours(0, 0, 0, 0);
            previousEnd.setFullYear(currentStart.getFullYear() - 1, 11, 31);
            previousEnd.setHours(23, 59, 59, 999);
          }

          return { currentStart, currentEnd, previousStart, previousEnd };
        };

        const { currentStart, currentEnd, previousStart, previousEnd } = getPeriodDates(report.periodType);

        const currentTransactions = await db.getAllTransactions({ startDate: currentStart, endDate: currentEnd });
        const previousTransactions = await db.getAllTransactions({ startDate: previousStart, endDate: previousEnd });

        const calculateMetrics = (transactions: any[]) => {
          const completed = transactions.filter(t => t.status === "completed");
          const totalRevenue = completed.reduce((sum, t) => sum + t.amount, 0);
          const successRate = transactions.length > 0
            ? (completed.length / transactions.length) * 100
            : 0;
          const avgAmount = completed.length > 0 ? totalRevenue / completed.length : 0;

          const byType = transactions.reduce((acc: any, t) => {
            if (!acc[t.type]) acc[t.type] = { count: 0, revenue: 0 };
            acc[t.type].count++;
            if (t.status === "completed") acc[t.type].revenue += t.amount;
            return acc;
          }, {});

          const byStatus = transactions.reduce((acc: any, t) => {
            if (!acc[t.status]) acc[t.status] = 0;
            acc[t.status]++;
            return acc;
          }, {});

          return {
            totalTransactions: transactions.length,
            totalRevenue,
            successRate,
            avgAmount,
            byType,
            byStatus,
          };
        };

        const current = calculateMetrics(currentTransactions);
        const previous = calculateMetrics(previousTransactions);

        const calculateChange = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const getPeriodLabel = (periodType: string) => {
          const labels: Record<string, string> = {
            week: "Week over Week",
            month: "Month over Month",
            quarter: "Quarter over Quarter",
            year: "Year over Year",
          };
          return labels[periodType] || periodType;
        };

        // Generate email HTML
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 20px; font-family: Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 900px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px;">OKADA Admin Dashboard</h1>
      <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">Transaction Analytics Report</p>
    </div>

    <!-- Content -->
    <div style="padding: 30px;">
      <p style="margin: 0 0 20px 0; font-size: 16px; color: #374151;">Hello,</p>
      
      ${report.customMessage ? `
      <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 25px; border-radius: 4px;">
        <p style="margin: 0; color: #065f46; font-size: 14px;">${report.customMessage}</p>
      </div>
      ` : ''}

      <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px;">${getPeriodLabel(report.periodType)} Comparison</h2>

      <!-- Metrics Cards -->
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
        <!-- Total Transactions -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #fafafa;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Total Transactions</div>
          <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">${current.totalTransactions.toLocaleString()}</div>
          <div style="font-size: 13px; color: #6b7280;">
            Previous: ${previous.totalTransactions.toLocaleString()}
            <span style="color: ${calculateChange(current.totalTransactions, previous.totalTransactions) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; margin-left: 8px;">
              ${calculateChange(current.totalTransactions, previous.totalTransactions) >= 0 ? '↑' : '↓'} ${Math.abs(calculateChange(current.totalTransactions, previous.totalTransactions)).toFixed(1)}%
            </span>
          </div>
        </div>

        <!-- Success Rate -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #fafafa;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Success Rate</div>
          <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">${current.successRate.toFixed(1)}%</div>
          <div style="font-size: 13px; color: #6b7280;">
            Previous: ${previous.successRate.toFixed(1)}%
            <span style="color: ${(current.successRate - previous.successRate) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; margin-left: 8px;">
              ${(current.successRate - previous.successRate) >= 0 ? '↑' : '↓'} ${Math.abs(current.successRate - previous.successRate).toFixed(1)}pp
            </span>
          </div>
        </div>

        <!-- Total Revenue -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #fafafa;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Total Revenue</div>
          <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">${(current.totalRevenue / 100).toLocaleString()} FCFA</div>
          <div style="font-size: 13px; color: #6b7280;">
            Previous: ${(previous.totalRevenue / 100).toLocaleString()} FCFA
            <span style="color: ${calculateChange(current.totalRevenue, previous.totalRevenue) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; margin-left: 8px;">
              ${calculateChange(current.totalRevenue, previous.totalRevenue) >= 0 ? '↑' : '↓'} ${Math.abs(calculateChange(current.totalRevenue, previous.totalRevenue)).toFixed(1)}%
            </span>
          </div>
        </div>

        <!-- Average Amount -->
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background-color: #fafafa;">
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Average Amount</div>
          <div style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 8px;">${(current.avgAmount / 100).toLocaleString()} FCFA</div>
          <div style="font-size: 13px; color: #6b7280;">
            Previous: ${(previous.avgAmount / 100).toLocaleString()} FCFA
            <span style="color: ${calculateChange(current.avgAmount, previous.avgAmount) >= 0 ? '#10b981' : '#ef4444'}; font-weight: 600; margin-left: 8px;">
              ${calculateChange(current.avgAmount, previous.avgAmount) >= 0 ? '↑' : '↓'} ${Math.abs(calculateChange(current.avgAmount, previous.avgAmount)).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <!-- Comparison Table -->
      <h3 style="margin: 30px 0 15px 0; color: #1f2937; font-size: 18px;">Detailed Comparison</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
        <thead>
          <tr style="background-color: #f9fafb;">
            <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Metric</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Current</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Previous</th>
            <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; color: #6b7280; font-size: 13px; font-weight: 600;">Change</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">Total Transactions</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${current.totalTransactions.toLocaleString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: right;">${previous.totalTransactions.toLocaleString()}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: 600; color: ${calculateChange(current.totalTransactions, previous.totalTransactions) >= 0 ? '#10b981' : '#ef4444'};">${calculateChange(current.totalTransactions, previous.totalTransactions) >= 0 ? '+' : ''}${calculateChange(current.totalTransactions, previous.totalTransactions).toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">Success Rate</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${current.successRate.toFixed(1)}%</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: right;">${previous.successRate.toFixed(1)}%</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: 600; color: ${(current.successRate - previous.successRate) >= 0 ? '#10b981' : '#ef4444'};">${(current.successRate - previous.successRate) >= 0 ? '+' : ''}${(current.successRate - previous.successRate).toFixed(1)}pp</td>
          </tr>
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; font-size: 14px;">Total Revenue</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${(current.totalRevenue / 100).toLocaleString()} FCFA</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 14px; text-align: right;">${(previous.totalRevenue / 100).toLocaleString()} FCFA</td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; text-align: right; font-weight: 600; color: ${calculateChange(current.totalRevenue, previous.totalRevenue) >= 0 ? '#10b981' : '#ef4444'};">${calculateChange(current.totalRevenue, previous.totalRevenue) >= 0 ? '+' : ''}${calculateChange(current.totalRevenue, previous.totalRevenue).toFixed(1)}%</td>
          </tr>
          <tr>
            <td style="padding: 12px; color: #374151; font-size: 14px;">Average Amount</td>
            <td style="padding: 12px; color: #1f2937; font-size: 14px; text-align: right; font-weight: 600;">${(current.avgAmount / 100).toLocaleString()} FCFA</td>
            <td style="padding: 12px; color: #6b7280; font-size: 14px; text-align: right;">${(previous.avgAmount / 100).toLocaleString()} FCFA</td>
            <td style="padding: 12px; font-size: 14px; text-align: right; font-weight: 600; color: ${calculateChange(current.avgAmount, previous.avgAmount) >= 0 ? '#10b981' : '#ef4444'};">${calculateChange(current.avgAmount, previous.avgAmount) >= 0 ? '+' : ''}${calculateChange(current.avgAmount, previous.avgAmount).toFixed(1)}%</td>
          </tr>
        </tbody>
      </table>

      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
        <p style="margin: 0 0 10px 0;">This is an automated report from OKADA Admin Dashboard.</p>
        <p style="margin: 0; color: #9ca3af;">Report generated on ${new Date().toLocaleString()} | Report ID: ${report.id}</p>
      </div>
    </div>
  </div>
</body>
</html>
        `.trim();

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "preview_scheduled_report",
          entityType: "scheduled_report",
          entityId: input.id,
          details: `Previewed scheduled report: ${report.name}`,
        });

        return {
          reportName: report.name,
          periodType: report.periodType,
          recipients: report.recipients,
          subject: `Transaction Analytics Report - ${getPeriodLabel(report.periodType)}`,
          html: emailHtml,
        };
      }),
  }),

  orderTracking: router({
    getActiveDeliveries: protectedProcedure.query(async () => {
      return await db.getActiveDeliveries();
    }),

    getRiderLocation: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getLatestRiderLocation(input.riderId);
      }),

    updateRiderLocation: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        latitude: z.string(),
        longitude: z.string(),
        status: z.enum(["idle", "en_route_pickup", "en_route_delivery", "offline"]),
        orderId: z.number().optional(),
        speed: z.number().optional(),
        heading: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const location = await db.createRiderLocation({
          riderId: input.riderId,
          orderId: input.orderId || null,
          latitude: input.latitude,
          longitude: input.longitude,
          status: input.status,
          speed: input.speed || 0,
          heading: input.heading || 0,
          accuracy: 10,
          timestamp: new Date(),
        });

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_rider_location",
          entityType: "rider",
          entityId: input.riderId,
          details: `Updated rider location: ${input.latitude}, ${input.longitude}`,
        });

        return location;
      }),
  }),

  inventoryAlerts: router({
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["active", "resolved", "dismissed"]).optional(),
        severity: z.enum(["critical", "warning", "info"]).optional(),
        productId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const alerts = await db.getAllInventoryAlerts(input || {});
        
        // Enrich with product details
        const enrichedAlerts = await Promise.all(
          alerts.map(async (alert) => {
            const product = await db.getProductById(alert.productId);
            return { ...alert, product };
          })
        );
        
        return enrichedAlerts;
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryAlertById(input.id);
      }),

    resolve: protectedProcedure
      .input(z.object({
        id: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.resolveInventoryAlert(input.id, ctx.user.id, input.notes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "resolve_inventory_alert",
          entityType: "inventory_alert",
          entityId: input.id,
          details: `Resolved inventory alert${input.notes ? `: ${input.notes}` : ''}`,
        });
        
        return { success: true };
      }),

    bulkResolve: protectedProcedure
      .input(z.object({
        ids: z.array(z.number()),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.bulkResolveInventoryAlerts(input.ids, ctx.user.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "bulk_resolve_inventory_alerts",
          entityType: "inventory_alert",
          entityId: null, // Multiple IDs, cannot store as single int
          details: `Bulk resolved ${input.ids.length} inventory alerts`,
        });
        
        return { success: true, count: input.ids.length };
      }),

    dismiss: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.dismissInventoryAlert(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "dismiss_inventory_alert",
          entityType: "inventory_alert",
          entityId: input.id,
          details: "Dismissed inventory alert",
        });
        
        return { success: true };
      }),

    checkStockLevels: protectedProcedure.mutation(async ({ ctx }) => {
      const newAlerts = await db.checkStockLevelsAndCreateAlerts();
      
      await db.logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "check_stock_levels",
        entityType: "inventory",
        entityId: null,
        details: `Stock level check completed. Created ${newAlerts.length} new alerts.`,
      });
      
      return { newAlerts: newAlerts.length };
    }),
  }),

  inventoryThresholds: router({
    list: protectedProcedure.query(async () => {
      const thresholds = await db.getAllInventoryThresholds();
      
      // Enrich with product details
      const enrichedThresholds = await Promise.all(
        thresholds.map(async (threshold) => {
          const product = await db.getProductById(threshold.productId);
          return { ...threshold, product };
        })
      );
      
      return enrichedThresholds;
    }),

    getByProductId: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryThresholdByProductId(input.productId);
      }),

    create: protectedProcedure
      .input(z.object({
        productId: z.number(),
        lowStockThreshold: z.number(),
        criticalStockThreshold: z.number(),
        overstockThreshold: z.number().optional(),
        autoReorder: z.number().optional(),
        reorderQuantity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const threshold = await db.createInventoryThreshold({
          productId: input.productId,
          lowStockThreshold: input.lowStockThreshold,
          criticalStockThreshold: input.criticalStockThreshold,
          overstockThreshold: input.overstockThreshold || null,
          autoReorder: input.autoReorder || 0,
          reorderQuantity: input.reorderQuantity || null,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_inventory_threshold",
          entityType: "inventory_threshold",
          entityId: input.productId,
          details: `Created inventory threshold for product ${input.productId}`,
        });
        
        return threshold;
      }),

    update: protectedProcedure
      .input(z.object({
        productId: z.number(),
        lowStockThreshold: z.number().optional(),
        criticalStockThreshold: z.number().optional(),
        overstockThreshold: z.number().optional(),
        autoReorder: z.number().optional(),
        reorderQuantity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { productId, ...data } = input;
        await db.updateInventoryThreshold(productId, data);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_inventory_threshold",
          entityType: "inventory_threshold",
          entityId: productId,
          details: `Updated inventory threshold for product ${productId}`,
        });
        
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        await db.deleteInventoryThreshold(input.productId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_inventory_threshold",
          entityType: "inventory_threshold",
          entityId: input.productId,
          details: `Deleted inventory threshold for product ${input.productId}`,
        });
        
        return { success: true };
      }),
  }),

  leaderboard: router({
    getLeaderboard: protectedProcedure
      .input(z.object({
        period: z.enum(['today', 'week', 'month', 'all']),
        category: z.enum(['overall', 'earnings', 'deliveries', 'rating', 'speed']),
        tier: z.enum(['platinum', 'gold', 'silver', 'bronze', 'rookie', 'all']).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderLeaderboard(input);
      }),

    get30DayTrend: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.get30DayTrend(input.riderId);
      }),

    getPerformanceDetails: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        period: z.enum(['week', 'month', 'all']),
      }))
      .query(async ({ input }) => {
        return await db.getRiderPerformanceDetails(input.riderId, input.period);
      }),

    compareRiders: protectedProcedure
      .input(z.object({
        riderId1: z.number(),
        riderId2: z.number(),
        period: z.enum(['today', 'week', 'month', 'all']).default('all'),
      }))
      .query(async ({ input }) => {
        return await db.compareRiders(input.riderId1, input.riderId2, input.period);
      }),

    checkRiderTierPromotion: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.checkAndUpdateRiderTier(input.riderId);
        
        if (result && result.tierChanged) {
          await db.sendTierPromotionNotification(input.riderId, {
            previousTier: result.previousTier,
            newTier: result.newTier,
            performanceScore: result.performanceScore,
          });

          await db.logActivity({
            adminId: ctx.user.id,
            adminName: ctx.user.name || "Unknown",
            action: "tier_promotion",
            entityType: "rider",
            entityId: input.riderId,
            details: `Rider promoted from ${result.previousTier || 'unranked'} to ${result.newTier} tier`,
          });
        }

        return result;
      }),

    checkAllTierPromotions: protectedProcedure
      .mutation(async ({ ctx }) => {
        const promotedCount = await db.checkAllRiderTierPromotions();

        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "check_all_tier_promotions",
          entityType: "system",
          entityId: 0,
          details: `Checked all riders for tier promotions. ${promotedCount} riders promoted.`,
        });

        return { promotedCount };
      }),

    getTierHistory: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRiderTierHistory(input.riderId);
      }),
  }),

  financialOverview: router({
    getOverview: protectedProcedure
      .input(z.object({
        period: z.enum(['day', 'week', 'month', 'year']).default('month'),
      }))
      .query(async ({ input }) => {
        return await db.getFinancialDashboard(input.period);
      }),

    getRevenueTrends: protectedProcedure
      .input(z.object({
        days: z.number().default(30),
      }))
      .query(async ({ input }) => {
        return await db.getRevenueTrends(input.days);
      }),

    getCommissionSummary: protectedProcedure
      .query(async () => {
        return await db.getCommissionSummary();
      }),

    getPayoutStatuses: protectedProcedure
      .query(async () => {
        return await db.getPayoutStatuses();
      }),

    getTopRevenueCategories: protectedProcedure
      .input(z.object({
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return await db.getTopRevenueCategories(input.limit);
      }),

    getRevenueByPaymentMethod: protectedProcedure
      .query(async () => {
        return await db.getRevenueByPaymentMethod();
      }),
  }),

  // Inventory Alerts Router
  inventoryAlerts: router({
    getAlerts: protectedProcedure
      .input(z.object({
        severity: z.enum(['critical', 'warning', 'info']).optional(),
        status: z.enum(['active', 'resolved', 'dismissed']).optional(),
        alertType: z.enum(['low_stock', 'out_of_stock', 'overstocked']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getInventoryAlerts(input);
      }),

    resolveAlert: protectedProcedure
      .input(z.object({
        alertId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.resolveInventoryAlert(input.alertId, ctx.user.id, input.notes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "resolve_inventory_alert",
          entityType: "inventory_alert",
          entityId: input.alertId,
          details: `Resolved inventory alert`,
        });

        return result;
      }),

    updateThreshold: protectedProcedure
      .input(z.object({
        productId: z.number(),
        lowStockThreshold: z.number(),
        criticalStockThreshold: z.number(),
        overstockThreshold: z.number().optional(),
        autoReorder: z.boolean().optional(),
        reorderQuantity: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateInventoryThreshold(input.productId, input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_inventory_threshold",
          entityType: "product",
          entityId: input.productId,
          details: `Updated inventory thresholds`,
        });

        return result;
      }),

    getThreshold: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return await db.getInventoryThreshold(input.productId);
      }),
  }),

  // User Verification Router
  userVerification: router({
    getRequests: protectedProcedure
      .input(z.object({
        userType: z.enum(['customer', 'seller', 'rider']).optional(),
        status: z.enum(['pending', 'approved', 'rejected', 'more_info_needed']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getVerificationRequests(input);
      }),

    approve: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.approveVerification(input.requestId, ctx.user.id, input.notes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "approve_verification",
          entityType: "verification_request",
          entityId: input.requestId,
          details: `Approved verification request`,
        });

        return result;
      }),

    reject: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        rejectionReason: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.rejectVerification(input.requestId, ctx.user.id, input.rejectionReason, input.notes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "reject_verification",
          entityType: "verification_request",
          entityId: input.requestId,
          details: `Rejected verification request: ${input.rejectionReason}`,
        });

        return result;
      }),

    requestMoreInfo: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        notes: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.requestMoreInfo(input.requestId, ctx.user.id, input.notes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "request_more_info",
          entityType: "verification_request",
          entityId: input.requestId,
          details: `Requested more information`,
        });

        return result;
      }),
  }),

  // Platform Statistics Router
  platformStats: router({
    getCurrent: protectedProcedure
      .query(async () => {
        return await db.getPlatformStatistics();
      }),

    getHistorical: protectedProcedure
      .input(z.object({
        hours: z.number().default(24),
      }))
      .query(async ({ input }) => {
        return await db.getHistoricalStatistics(input.hours);
      }),

    record: protectedProcedure
      .input(z.object({
        activeUsers: z.number(),
        concurrentOrders: z.number(),
        availableRiders: z.number(),
        busyRiders: z.number(),
        offlineRiders: z.number(),
        avgResponseTime: z.number(),
        errorRate: z.number(),
        systemUptime: z.number(),
        apiCallVolume: z.number(),
        databaseConnections: z.number(),
        memoryUsage: z.number(),
        cpuUsage: z.number(),
      }))
      .mutation(async ({ input }) => {
        return await db.recordPlatformStatistics(input);
      }),
  }),

  // Dispute Resolution Router
  disputes: router({
    getList: protectedProcedure
      .input(z.object({
        status: z.enum(['open', 'investigating', 'resolved', 'escalated', 'closed']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        disputeType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getDisputes(input);
      }),

    getDetails: protectedProcedure
      .input(z.object({ disputeId: z.number() }))
      .query(async ({ input }) => {
        return await db.getDisputeDetails(input.disputeId);
      }),

    create: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        customerId: z.number(),
        riderId: z.number().optional(),
        sellerId: z.number().optional(),
        disputeType: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
        subject: z.string(),
        description: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const disputeId = await db.createDispute(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_dispute",
          entityType: "dispute",
          entityId: disputeId || 0,
          details: `Created dispute: ${input.subject}`,
        });

        return disputeId;
      }),

    addMessage: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        message: z.string(),
        attachments: z.string().optional(),
        isInternal: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.addDisputeMessage({
          disputeId: input.disputeId,
          senderId: ctx.user.id,
          senderType: "admin",
          message: input.message,
          attachments: input.attachments,
          isInternal: input.isInternal,
        });
      }),

    resolve: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        resolutionType: z.enum(['refund', 'replacement', 'compensation', 'dismissed', 'other']),
        resolutionAmount: z.number().optional(),
        resolutionNotes: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.resolveDispute(input.disputeId, ctx.user.id, {
          resolutionType: input.resolutionType,
          resolutionAmount: input.resolutionAmount,
          resolutionNotes: input.resolutionNotes,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "resolve_dispute",
          entityType: "dispute",
          entityId: input.disputeId,
          details: `Resolved dispute with ${input.resolutionType}`,
        });

        return result;
      }),

    escalate: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        assignedTo: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.escalateDispute(input.disputeId, input.assignedTo);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "escalate_dispute",
          entityType: "dispute",
          entityId: input.disputeId,
          details: `Escalated dispute`,
        });

        return result;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        disputeId: z.number(),
        status: z.enum(['open', 'investigating', 'resolved', 'escalated', 'closed']),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateDisputeStatus(input.disputeId, input.status);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_dispute_status",
          entityType: "dispute",
          entityId: input.disputeId,
          details: `Updated dispute status to ${input.status}`,
        });

        return result;
      }),
  }),

  // Rider Performance Leaderboard
  riderLeaderboard: router({
    getLeaderboard: protectedProcedure
      .input(z.object({
        period: z.enum(['day', 'week', 'month', 'all']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderLeaderboard(input.period);
      }),

    getAchievements: protectedProcedure
      .input(z.object({
        riderId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderAchievements(input.riderId);
      }),

    awardAchievement: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        achievementType: z.string(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.awardRiderAchievement(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "award_achievement",
          entityType: "rider",
          entityId: input.riderId,
          details: `Awarded ${input.achievementType} achievement`,
        });

        return result;
      }),
  }),

  // System Settings
  systemSettings: router({
    getAll: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getSystemSettings(input.category);
      }),

    getSetting: protectedProcedure
      .input(z.object({
        key: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getSystemSetting(input.key);
      }),

    update: protectedProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateSystemSetting(input.key, input.value, ctx.user.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_system_setting",
          entityType: "system_setting",
          entityId: 0,
          details: `Updated setting ${input.key}`,
        });

        return result;
      }),

    create: protectedProcedure
      .input(z.object({
        settingKey: z.string(),
        settingValue: z.string(),
        settingType: z.enum(['string', 'number', 'boolean', 'json']),
        category: z.string(),
        description: z.string().optional(),
        isPublic: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createSystemSetting({
          ...input,
          updatedBy: ctx.user.id,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_system_setting",
          entityType: "system_setting",
          entityId: result || 0,
          details: `Created setting ${input.settingKey}`,
        });

        return result;
      }),
  }),

  // Content Moderation
  contentModeration: router({
    getQueue: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        contentType: z.string().optional(),
        priority: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getContentModerationQueue(input);
      }),

    moderate: protectedProcedure
      .input(z.object({
        itemId: z.number(),
        status: z.enum(['approved', 'rejected', 'flagged']),
        moderatorNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.moderateContent(input.itemId, ctx.user.id, {
          status: input.status,
          moderatorNotes: input.moderatorNotes,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "moderate_content",
          entityType: "content",
          entityId: input.itemId,
          details: `Moderated content: ${input.status}`,
        });

        return result;
      }),

    addToQueue: protectedProcedure
      .input(z.object({
        contentType: z.string(),
        contentId: z.number(),
        userId: z.number(),
        contentUrl: z.string().optional(),
        contentText: z.string().optional(),
        contentMetadata: z.string().optional(),
        priority: z.string().optional(),
        flagReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        return await db.addToModerationQueue(input);
      }),
  }),

  // Fraud Detection
  fraudDetection: router({
    getAlerts: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        severity: z.string().optional(),
        alertType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFraudAlerts(input);
      }),

    createAlert: protectedProcedure
      .input(z.object({
        alertType: z.string(),
        userId: z.number().optional(),
        orderId: z.number().optional(),
        riskScore: z.number(),
        severity: z.string(),
        description: z.string(),
        detectionMethod: z.string().optional(),
        evidenceData: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createFraudAlert(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_fraud_alert",
          entityType: "fraud_alert",
          entityId: result || 0,
          details: `Created fraud alert: ${input.alertType}`,
        });

        return result;
      }),

    updateAlert: protectedProcedure
      .input(z.object({
        alertId: z.number(),
        status: z.string().optional(),
        assignedTo: z.number().optional(),
        investigationNotes: z.string().optional(),
        actionTaken: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateFraudAlert(input.alertId, {
          status: input.status,
          assignedTo: input.assignedTo,
          investigationNotes: input.investigationNotes,
          actionTaken: input.actionTaken,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_fraud_alert",
          entityType: "fraud_alert",
          entityId: input.alertId,
          details: `Updated fraud alert status`,
        });

        return result;
      }),
  }),

  // Live Dashboard
  liveDashboard: router({
    getEvents: protectedProcedure
      .input(z.object({
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getLiveDashboardEvents(input.limit);
      }),

    getActiveRiders: protectedProcedure
      .query(async () => {
        return await db.getActiveRidersWithLocations();
      }),

    getStats: protectedProcedure
      .query(async () => {
        return await db.getLiveDashboardStats();
      }),

    recordEvent: protectedProcedure
      .input(z.object({
        eventType: z.string(),
        entityId: z.number(),
        entityType: z.string(),
        eventData: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.recordDashboardEvent(input);
      }),
  }),

  // Geo Analytics
  geoAnalytics: router({
    getRegions: protectedProcedure
      .input(z.object({
        regionType: z.string().optional(),
        parentId: z.number().optional().nullable(),
      }))
      .query(async ({ input }) => {
        return await db.getGeoRegions(input);
      }),

    getRegionalAnalytics: protectedProcedure
      .input(z.object({
        regionId: z.number(),
        period: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getRegionalAnalytics(input.regionId, input.period);
      }),

    getPerformanceComparison: protectedProcedure
      .input(z.object({
        period: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRegionalPerformanceComparison(input.period);
      }),

    getOrderHeatmap: protectedProcedure
      .query(async () => {
        return await db.getOrderHeatmapData();
      }),

    upsertAnalytics: protectedProcedure
      .input(z.object({
        regionId: z.number(),
        period: z.string(),
        periodStart: z.date(),
        periodEnd: z.date(),
        totalOrders: z.number(),
        totalRevenue: z.number(),
        activeUsers: z.number(),
        activeRiders: z.number(),
        avgDeliveryTime: z.number().optional(),
        orderDensity: z.number().optional(),
        customerSatisfaction: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.upsertRegionalAnalytics(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_regional_analytics",
          entityType: "regional_analytics",
          entityId: result || 0,
          details: `Updated analytics for region ${input.regionId}`,
        });

        return result;
      }),
  }),

  // Referral Program
  referrals: router({
    create: protectedProcedure
      .input(z.object({
        referrerUserId: z.number(),
        referredUserEmail: z.string().optional(),
        referredUserPhone: z.string().optional(),
        rewardTier: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createReferral(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_referral",
          entityType: "referral",
          entityId: result?.id || 0,
          details: `Created referral for user ${input.referrerUserId}`,
        });

        return result;
      }),

    getUserReferrals: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getUserReferrals(input.userId);
      }),

    getByCode: protectedProcedure
      .input(z.object({
        code: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getReferralByCode(input.code);
      }),

    complete: protectedProcedure
      .input(z.object({
        referralId: z.number(),
        referredUserId: z.number(),
        orderValue: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.completeReferral(
          input.referralId,
          input.referredUserId,
          input.orderValue
        );
        
        if (result) {
          await db.logActivity({
            adminId: ctx.user.id,
            adminName: ctx.user.name || "Unknown",
            action: "complete_referral",
            entityType: "referral",
            entityId: input.referralId,
            details: `Completed referral ${input.referralId}`,
          });
        }

        return result;
      }),

    getStats: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getReferralStats(input.userId);
      }),

    getRewards: protectedProcedure
      .query(async () => {
        return await db.getReferralRewards();
      }),

    updateReward: protectedProcedure
      .input(z.object({
        tier: z.string(),
        referrerReward: z.number(),
        referredReward: z.number(),
        minOrderValue: z.number(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateReferralReward(input.tier, {
          referrerReward: input.referrerReward,
          referredReward: input.referredReward,
          minOrderValue: input.minOrderValue,
          description: input.description,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_referral_reward",
          entityType: "referral_reward",
          entityId: 0,
          details: `Updated ${input.tier} tier reward`,
        });

        return result;
      }),
  }),

  // Loyalty Program
  loyalty: router({
    getTiers: protectedProcedure
      .query(async () => {
        return await db.getLoyaltyTiers();
      }),

    getUserInfo: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getUserLoyaltyInfo(input.userId);
      }),

    initializeUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.initializeUserLoyalty(input.userId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "initialize_loyalty",
          entityType: "loyalty",
          entityId: result || 0,
          details: `Initialized loyalty for user ${input.userId}`,
        });

        return result;
      }),

    addPoints: protectedProcedure
      .input(z.object({
        userId: z.number(),
        points: z.number(),
        transactionType: z.string(),
        description: z.string(),
        orderId: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.addLoyaltyPoints(
          input.userId,
          input.points,
          input.transactionType,
          input.description,
          input.orderId
        );
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "add_loyalty_points",
          entityType: "loyalty",
          entityId: input.userId,
          details: `Added ${input.points} points to user ${input.userId}`,
        });

        return result;
      }),

    getRewardsCatalog: protectedProcedure
      .input(z.object({
        userId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getLoyaltyRewardsCatalog(input.userId);
      }),

    redeemReward: protectedProcedure
      .input(z.object({
        userId: z.number(),
        rewardId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.redeemLoyaltyReward(input.userId, input.rewardId);
        
        if (result.success) {
          await db.logActivity({
            adminId: ctx.user.id,
            adminName: ctx.user.name || "Unknown",
            action: "redeem_loyalty_reward",
            entityType: "loyalty",
            entityId: result.redemptionId || 0,
            details: `User ${input.userId} redeemed reward ${input.rewardId}`,
          });
        }

        return result;
      }),

    getTransactions: protectedProcedure
      .input(z.object({
        userId: z.number(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getUserLoyaltyTransactions(input.userId, input.limit);
      }),

    getRedemptions: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ input }) => {
        return await db.getUserLoyaltyRedemptions(input.userId);
      }),

    getStats: protectedProcedure
      .query(async () => {
        return await db.getLoyaltyProgramStats();
      }),
  }),

  // Incident Management
  incidents: router({
    getAll: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        severity: z.string().optional(),
        incidentType: z.string().optional(),
        riderId: z.number().optional(),
        customerId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getIncidents(input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getIncidentById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        incidentType: z.string(),
        severity: z.string(),
        title: z.string(),
        description: z.string(),
        incidentDate: z.date(),
        riderId: z.number().optional(),
        customerId: z.number().optional(),
        orderId: z.number().optional(),
        location: z.string().optional(),
        latitude: z.string().optional(),
        longitude: z.string().optional(),
        photoUrls: z.string().optional(),
        priority: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createIncident({
          ...input,
          reportedBy: ctx.user.id,
        } as any);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_incident",
          entityType: "incident",
          entityId: result?.id || 0,
          details: `Created incident: ${input.title}`,
        });

        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          status: z.string().optional(),
          severity: z.string().optional(),
          title: z.string().optional(),
          description: z.string().optional(),
          resolutionNotes: z.string().optional(),
          compensationAmount: z.number().optional(),
          claimStatus: z.string().optional(),
          claimAmount: z.number().optional(),
          assignedTo: z.number().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateIncident(input.id, input.data as any);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_incident",
          entityType: "incident",
          entityId: input.id,
          details: `Updated incident ${input.id}`,
        });

        return result;
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.string(),
        resolutionNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateIncidentStatus(
          input.id,
          input.status,
          ctx.user.id,
          input.resolutionNotes
        );
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_incident_status",
          entityType: "incident",
          entityId: input.id,
          details: `Updated incident ${input.id} status to ${input.status}`,
        });

        return result;
      }),

    getStats: protectedProcedure
      .query(async () => {
        return await db.getIncidentStats();
      }),
  }),

  // Customer Feedback
  feedback: router({
    getAll: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        sentiment: z.string().optional(),
        category: z.string().optional(),
        riderId: z.number().optional(),
        sellerId: z.number().optional(),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getCustomerFeedback(input);
      }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getFeedbackById(input.id);
      }),

    create: protectedProcedure
      .input(z.object({
        customerId: z.number(),
        orderId: z.number().optional(),
        riderId: z.number().optional(),
        sellerId: z.number().optional(),
        overallRating: z.number(),
        qualityPhotoRating: z.number().optional(),
        deliveryRating: z.number().optional(),
        serviceRating: z.number().optional(),
        productRating: z.number().optional(),
        feedbackText: z.string().optional(),
        category: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createCustomerFeedback(input as any);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_feedback",
          entityType: "feedback",
          entityId: result?.id || 0,
          details: `Created feedback from customer ${input.customerId}`,
        });

        return result;
      }),

    respond: protectedProcedure
      .input(z.object({
        id: z.number(),
        responseText: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.respondToFeedback(
          input.id,
          input.responseText,
          ctx.user.id
        );
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "respond_feedback",
          entityType: "feedback",
          entityId: input.id,
          details: `Responded to feedback ${input.id}`,
        });

        return result;
      }),

    getStats: protectedProcedure
      .query(async () => {
        return await db.getFeedbackStats();
      }),

    getTrends: protectedProcedure
      .input(z.object({
        period: z.enum(['day', 'week', 'month']).optional(),
      }))
      .query(async ({ input }) => {
        return await db.getFeedbackTrends(input.period);
      }),
  }),

  // Rider Training
  training: router({
    getModules: protectedProcedure
      .input(z.object({
        category: z.string().optional(),
        isMandatory: z.boolean().optional(),
        isActive: z.boolean().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTrainingModules(input);
      }),

    getModuleById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getTrainingModuleById(input.id);
      }),

    createModule: protectedProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string(),
        contentType: z.string(),
        contentUrl: z.string().optional(),
        duration: z.number().optional(),
        isMandatory: z.boolean().optional(),
        minPassingScore: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createTrainingModule({
          ...input,
          isMandatory: input.isMandatory ? 1 : 0,
        } as any);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_training_module",
          entityType: "training",
          entityId: result?.id || 0,
          details: `Created training module: ${input.title}`,
        });

        return result;
      }),

    updateModule: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          contentUrl: z.string().optional(),
          duration: z.number().optional(),
          isActive: z.boolean().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const updateData = {
          ...input.data,
          isActive: input.data.isActive !== undefined ? (input.data.isActive ? 1 : 0) : undefined,
        };
        
        const result = await db.updateTrainingModule(input.id, updateData as any);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_training_module",
          entityType: "training",
          entityId: input.id,
          details: `Updated training module ${input.id}`,
        });

        return result;
      }),

    getQuizQuestions: protectedProcedure
      .input(z.object({ moduleId: z.number() }))
      .query(async ({ input }) => {
        return await db.getModuleQuizQuestions(input.moduleId);
      }),

    createQuizQuestion: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        questionText: z.string(),
        questionType: z.string(),
        options: z.string().optional(),
        correctAnswer: z.string(),
        explanation: z.string().optional(),
        points: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createQuizQuestion(input as any);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_quiz_question",
          entityType: "training",
          entityId: result?.id || 0,
          details: `Created quiz question for module ${input.moduleId}`,
        });

        return result;
      }),

    getRiderProgress: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRiderTrainingProgress(input.riderId);
      }),

    startModule: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        moduleId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.startTrainingModule(input.riderId, input.moduleId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "start_training_module",
          entityType: "training",
          entityId: input.moduleId,
          details: `Rider ${input.riderId} started module ${input.moduleId}`,
        });

        return result;
      }),

    submitQuiz: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        moduleId: z.number(),
        answers: z.array(z.object({
          questionId: z.number(),
          answer: z.string(),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.submitQuizAnswers(
          input.riderId,
          input.moduleId,
          input.answers
        );
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "submit_quiz",
          entityType: "training",
          entityId: input.moduleId,
          details: `Rider ${input.riderId} submitted quiz for module ${input.moduleId} - Score: ${result?.score}%`,
        });

        return result;
      }),

    getStats: protectedProcedure
      .query(async () => {
        return await db.getTrainingStats();
      }),

    getRiderCompletionRate: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRiderTrainingCompletionRate(input.riderId);
      }),
  }),

  // ============================================================================
  // ADVANCED REPORTING SUITE
  // ============================================================================
  reports: router({
    // Custom Reports
    createReport: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        reportType: z.enum(["orders", "revenue", "riders", "users", "products", "incidents", "feedback", "training", "custom"]),
        filters: z.string().optional(),
        metrics: z.string().optional(),
        groupBy: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        isPublic: z.boolean().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createCustomReport({
          ...input,
          createdBy: ctx.user.id,
          isPublic: input.isPublic ? 1 : 0,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_report",
          entityType: "report",
          entityId: result?.id,
          details: `Created custom report: ${input.name}`,
        });

        return result;
      }),

    getReports: protectedProcedure
      .input(z.object({
        createdBy: z.number().optional(),
        reportType: z.string().optional(),
        isPublic: z.boolean().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getCustomReports(input);
      }),

    getReportById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomReportById(input.id);
      }),

    updateReport: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        filters: z.string().optional(),
        metrics: z.string().optional(),
        groupBy: z.string().optional(),
        sortBy: z.string().optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        isPublic: z.boolean().optional(),
        tags: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.updateCustomReport(id, {
          ...data,
          isPublic: data.isPublic !== undefined ? (data.isPublic ? 1 : 0) : undefined,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_report",
          entityType: "report",
          entityId: id,
          details: `Updated custom report ID: ${id}`,
        });

        return result;
      }),

    deleteReport: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.deleteCustomReport(input.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_report",
          entityType: "report",
          entityId: input.id,
          details: `Deleted custom report ID: ${input.id}`,
        });

        return result;
      }),

    // Scheduled Reports
    createScheduledReport: protectedProcedure
      .input(z.object({
        reportId: z.number(),
        name: z.string(),
        frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]),
        scheduleTime: z.string().optional(),
        dayOfWeek: z.number().optional(),
        dayOfMonth: z.number().optional(),
        timezone: z.string().optional(),
        recipients: z.string(),
        format: z.enum(["pdf", "excel", "csv"]).optional(),
        subject: z.string().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.createScheduledReport({
          ...input,
          createdBy: ctx.user.id,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_scheduled_report",
          entityType: "scheduled_report",
          entityId: result?.id,
          details: `Created scheduled report: ${input.name}`,
        });

        return result;
      }),

    getScheduledReports: protectedProcedure
      .input(z.object({ isActive: z.boolean().optional() }).optional())
      .query(async ({ input }) => {
        return await db.getScheduledReports(input);
      }),

    updateScheduledReport: protectedProcedure
      .input(z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        scheduleTime: z.string().optional(),
        recipients: z.string().optional(),
        format: z.enum(["pdf", "excel", "csv"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...data } = input;
        const result = await db.updateScheduledReport(id, {
          ...data,
          isActive: data.isActive !== undefined ? (data.isActive ? 1 : 0) : undefined,
        });
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_scheduled_report",
          entityType: "scheduled_report",
          entityId: id,
          details: `Updated scheduled report ID: ${id}`,
        });

        return result;
      }),

    // Execute Report
    executeReport: protectedProcedure
      .input(z.object({ reportId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.executeReport(input.reportId, ctx.user.id, "manual");
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "execute_report",
          entityType: "report",
          entityId: input.reportId,
          details: `Executed report ID: ${input.reportId}`,
        });

        return result;
      }),

    getExecutionHistory: protectedProcedure
      .input(z.object({
        reportId: z.number().optional(),
        executedBy: z.number().optional(),
        status: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getReportExecutionHistory(input);
      }),
  }),

  // ============================================================================
  // REAL-TIME NOTIFICATION SYSTEM
  // ============================================================================
  notifications: router({
    getNotifications: protectedProcedure
      .input(z.object({
        recipientId: z.number().optional(),
        recipientType: z.string().optional(),
        isRead: z.boolean().optional(),
        type: z.string().optional(),
      }).optional())
      .query(async ({ input }) => {
        return await db.getNotifications(input);
      }),

    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markNotificationAsRead(input.id);
      }),

    markAllAsRead: protectedProcedure
      .input(z.object({ recipientId: z.number() }))
      .mutation(async ({ input }) => {
        return await db.markAllNotificationsAsRead(input.recipientId);
      }),

    getUnreadCount: protectedProcedure
      .input(z.object({ recipientId: z.number() }))
      .query(async ({ input }) => {
        return await db.getUnreadNotificationCount(input.recipientId);
      }),

    broadcast: protectedProcedure
      .input(z.object({
        title: z.string(),
        message: z.string(),
        type: z.enum(["incident", "feedback", "training", "order", "system", "alert", "info"]),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        metadata: z.any().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.broadcastNotificationToAdmins(
          input.title,
          input.message,
          input.type,
          input.severity,
          input.metadata
        );
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "broadcast_notification",
          entityType: "notification",
          entityId: result?.id,
          details: `Broadcast notification: ${input.title}`,
        });

        return result;
      }),
  }),

  // ============================================================================
  // MOBILE TRAINING SYNC
  // ============================================================================
  mobileSync: router({
    createSync: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        deviceId: z.string(),
        syncType: z.enum(["progress", "quiz_answers", "completion", "certificate"]),
        moduleId: z.number(),
        data: z.string(),
        offlineTimestamp: z.date(),
      }))
      .mutation(async ({ input }) => {
        return await db.createMobileTrainingSync(input);
      }),

    getPendingSync: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        deviceId: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getPendingSync(input.riderId, input.deviceId);
      }),

    processSync: protectedProcedure
      .input(z.object({ syncId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.processMobileSync(input.syncId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "process_sync",
          entityType: "mobile_sync",
          entityId: input.syncId,
          details: `Processed mobile sync ID: ${input.syncId}`,
        });

        return result;
      }),

    getSyncStatus: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        deviceId: z.string(),
      }))
      .query(async ({ input }) => {
        return await db.getSyncStatus(input.riderId, input.deviceId);
      }),
  }),

  // Report Templates
  reportTemplates: router({
    getAll: publicProcedure.query(() => {
      const { getAllTemplates } = require("./reportTemplates");
      return getAllTemplates();
    }),
    
    getByCategory: publicProcedure
      .input(z.object({ category: z.enum(["sales", "operations", "finance", "quality", "platform"]) }))
      .query(({ input }) => {
        const { getTemplatesByCategory } = require("./reportTemplates");
        return getTemplatesByCategory(input.category);
      }),
    
    getById: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => {
        const { getTemplateById } = require("./reportTemplates");
        return getTemplateById(input.id);
      }),
    
    useTemplate: protectedProcedure
      .input(z.object({
        templateId: z.string(),
        customName: z.string().optional(),
        customFilters: z.record(z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { getTemplateById } = require("./reportTemplates");
        const template = getTemplateById(input.templateId);
        
        if (!template) {
          throw new Error("Template not found");
        }
        
        // Create a custom report from the template
        const reportData = {
          name: input.customName || template.name,
          description: template.description,
          reportType: template.reportType,
          filters: JSON.stringify(input.customFilters || template.filters),
          metrics: JSON.stringify(template.metrics),
          groupBy: template.groupBy,
          sortBy: template.sortBy,
          sortOrder: template.sortOrder,
          createdBy: ctx.user.id,
          isPublic: 0,
        };
        
        return await db.createCustomReport(reportData);
      }),
  }),

  // Sprint 7: Rider Management - Shift Scheduling & Earnings
  riderShifts: router({
    getShifts: protectedProcedure
      .input(z.object({
        riderId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        status: z.string().optional(),
        shiftType: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getShifts(input);
      }),

    createShift: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        shiftDate: z.date(),
        shiftType: z.enum(["morning", "afternoon", "evening", "night", "split", "full_day"]),
        startTime: z.string(),
        endTime: z.string(),
        assignedBy: z.number(),
        zone: z.string().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
        isRecurring: z.number().optional(),
        recurringPattern: z.string().optional(),
        recurringGroupId: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const shiftId = await db.createShift(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_shift",
          entityType: "shift",
          entityId: shiftId,
          details: `Created shift for rider ${input.riderId}`,
        });

        return { success: true, shiftId };
      }),

    updateShiftStatus: protectedProcedure
      .input(z.object({
        shiftId: z.number(),
        status: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateShiftStatus(input.shiftId, input.status, input.notes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_shift_status",
          entityType: "shift",
          entityId: input.shiftId,
          details: `Updated shift status to ${input.status}`,
        });

        return { success: result };
      }),

    cancelShift: protectedProcedure
      .input(z.object({
        shiftId: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.cancelShift(input.shiftId, input.reason);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "cancel_shift",
          entityType: "shift",
          entityId: input.shiftId,
          details: `Cancelled shift: ${input.reason}`,
        });

        return { success: result };
      }),
  }),

  riderEarnings: router({
    getEarnings: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderEarningsDetailed(input);
      }),

    getSummary: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderEarningsSummary(input.riderId, input.startDate, input.endDate);
      }),

    createTransaction: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        transactionType: z.enum(["delivery_fee", "tip", "bonus", "penalty", "adjustment", "refund"]),
        amount: z.number(),
        description: z.string(),
        orderId: z.number().optional(),
        shiftId: z.number().optional(),
        category: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const transactionId = await db.createEarningsTransaction(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_earnings_transaction",
          entityType: "earnings_transaction",
          entityId: transactionId,
          details: `Created ${input.transactionType} transaction for rider ${input.riderId}`,
        });

        return { success: true, transactionId };
      }),

    approveTransaction: protectedProcedure
      .input(z.object({ transactionId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.approveEarningsTransaction(input.transactionId, ctx.user.id);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "approve_earnings",
          entityType: "earnings_transaction",
          entityId: input.transactionId,
          details: `Approved earnings transaction`,
        });

        return { success: result };
      }),
  }),

  shiftSwaps: router({
    getPending: protectedProcedure.query(async () => {
      return await db.getPendingShiftSwaps();
    }),

    getRiderSwaps: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRiderShiftSwaps(input.riderId);
      }),

    createSwap: protectedProcedure
      .input(z.object({
        requesterId: z.number(),
        requesterShiftId: z.number(),
        targetRiderId: z.number().optional(),
        targetShiftId: z.number().optional(),
        requestType: z.enum(["swap", "give_up", "take_over"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const swapId = await db.createShiftSwap(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_shift_swap",
          entityType: "shift_swap",
          entityId: swapId,
          details: `Created ${input.requestType} request`,
        });

        return { success: true, swapId };
      }),

    reviewSwap: protectedProcedure
      .input(z.object({
        swapId: z.number(),
        status: z.enum(["approved", "rejected"]),
        reviewNotes: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.reviewShiftSwap(input.swapId, input.status, ctx.user.id, input.reviewNotes);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "review_shift_swap",
          entityType: "shift_swap",
          entityId: input.swapId,
          details: `${input.status} shift swap request`,
        });

        return { success: result };
      }),
  }),

  riderAvailability: router({
    getAvailability: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        startDate: z.date(),
        endDate: z.date(),
      }))
      .query(async ({ input }) => {
        return await db.getRiderAvailability(input.riderId, input.startDate, input.endDate);
      }),

    setAvailability: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        availabilityDate: z.date(),
        availabilityType: z.enum(["available", "unavailable", "preferred", "maybe"]),
        timeSlots: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        reason: z.enum(["vacation", "sick", "personal", "other", "none"]).optional(),
        notes: z.string().optional(),
        isRecurring: z.number().optional(),
        recurringPattern: z.string().optional(),
        recurringEndDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const availabilityId = await db.setRiderAvailability(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "set_availability",
          entityType: "rider_availability",
          entityId: availabilityId,
          details: `Set availability for rider ${input.riderId}`,
        });

        return { success: true, availabilityId };
      }),

    updateAvailability: protectedProcedure
      .input(z.object({
        availabilityId: z.number(),
        updates: z.object({
          availabilityType: z.enum(["available", "unavailable", "preferred", "maybe"]).optional(),
          timeSlots: z.string().optional(),
          notes: z.string().optional(),
        }),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updateRiderAvailability(input.availabilityId, input.updates);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_availability",
          entityType: "rider_availability",
          entityId: input.availabilityId,
          details: `Updated rider availability`,
        });

        return { success: result };
      }),
  }),

  riderPayouts: router({
    getPending: protectedProcedure.query(async () => {
      return await db.getPendingRiderPayouts();
    }),

    getRiderPayouts: protectedProcedure
      .input(z.object({ riderId: z.number() }))
      .query(async ({ input }) => {
        return await db.getRiderPayouts(input.riderId);
      }),

    createPayout: protectedProcedure
      .input(z.object({
        riderId: z.number(),
        payoutDate: z.date(),
        periodStart: z.date(),
        periodEnd: z.date(),
        totalEarnings: z.number(),
        deductions: z.number().optional(),
        bonuses: z.number().optional(),
        netAmount: z.number(),
        paymentMethod: z.enum(["bank_transfer", "mobile_money", "cash", "wallet"]),
        paymentAccount: z.string().optional(),
        transactionIds: z.string().optional(),
        metadata: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const payoutId = await db.createRiderPayout(input);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "create_payout",
          entityType: "rider_payout",
          entityId: payoutId,
          details: `Created payout for rider ${input.riderId}`,
        });

        return { success: true, payoutId };
      }),

    updatePayoutStatus: protectedProcedure
      .input(z.object({
        payoutId: z.number(),
        status: z.string(),
        failureReason: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.updatePayoutStatus(input.payoutId, input.status, ctx.user.id, input.failureReason);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "update_payout_status",
          entityType: "rider_payout",
          entityId: input.payoutId,
          details: `Updated payout status to ${input.status}`,
        });

        return { success: result };
      }),

    retryPayout: protectedProcedure
      .input(z.object({ payoutId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const result = await db.retryPayout(input.payoutId);
        
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "retry_payout",
          entityType: "rider_payout",
          entityId: input.payoutId,
          details: `Retried failed payout`,
        });

        return { success: result };
      }),
  }),

  // I18N (Multi-Language Support) - Critical for Cameroon market
  i18n: router({
    getLanguages: publicProcedure.query(async () => {
      return await db.getLanguages();
    }),

    getDefaultLanguage: publicProcedure.query(async () => {
      return await db.getDefaultLanguage();
    }),

    getTranslations: publicProcedure
      .input(z.object({
        languageCode: z.string(),
        namespace: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await db.getTranslations(input.languageCode, input.namespace);
      }),

    upsertTranslation: protectedProcedure
      .input(z.object({
        languageCode: z.string(),
        namespace: z.string(),
        key: z.string(),
        value: z.string(),
        context: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can manage translations');
        }
        await db.upsertTranslation(input);
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "upsert_translation",
          entityType: "translation",
          entityId: 0,
          details: `Upserted translation: ${input.languageCode}.${input.namespace}.${input.key}`,
        });
        return { success: true };
      }),

    bulkUpsertTranslations: protectedProcedure
      .input(z.array(z.object({
        languageCode: z.string(),
        namespace: z.string(),
        key: z.string(),
        value: z.string(),
        context: z.string().optional(),
      })))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can manage translations');
        }
        await db.bulkUpsertTranslations(input);
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "bulk_upsert_translations",
          entityType: "translation",
          entityId: 0,
          details: `Bulk upserted ${input.length} translations`,
        });
        return { success: true, count: input.length };
      }),

    deleteTranslation: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user.role !== 'admin') {
          throw new Error('Only admins can manage translations');
        }
        await db.deleteTranslation(input.id);
        await db.logActivity({
          adminId: ctx.user.id,
          adminName: ctx.user.name || "Unknown",
          action: "delete_translation",
          entityType: "translation",
          entityId: input.id,
          details: `Deleted translation ID: ${input.id}`,
        });
        return { success: true };
      }),

    getTranslationCoverage: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Only admins can view translation coverage');
      }
      return await db.getTranslationCoverage();
    }),
  }),
});

export type AppRouter = typeof appRouter;

