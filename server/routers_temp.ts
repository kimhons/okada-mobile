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
});

export type AppRouter = typeof appRouter;

