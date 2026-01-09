# Okada Admin Dashboard API Documentation

This document provides comprehensive documentation for all tRPC procedures available in the Okada Admin Dashboard.

## Authentication

All protected procedures require authentication via session cookie. The session is established through Manus OAuth at `/api/oauth/callback`.

### Auth Procedures

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `auth.me` | Query | Public | Returns the current authenticated user or null |
| `auth.logout` | Mutation | Public | Clears the session cookie and logs out the user |

## Dashboard

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `dashboard.stats` | Query | Protected | Returns dashboard statistics (orders, users, riders, revenue) |
| `dashboard.recentOrders` | Query | Protected | Returns the 10 most recent orders with customer info |
| `dashboard.recentActivity` | Query | Protected | Returns recent platform activity |

## Orders Management

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `orders.list` | Query | Protected | List all orders with optional filters (status, search, date range) |
| `orders.getById` | Query | Protected | Get detailed order information by ID |
| `orders.updateStatus` | Mutation | Protected | Update order status with history tracking |
| `orders.assignRider` | Mutation | Protected | Assign a rider to an order |
| `orders.create` | Mutation | Protected | Create a new order |
| `orders.update` | Mutation | Protected | Update order details (address, items, etc.) |

### Order Status Values
- `pending` - Order placed, awaiting confirmation
- `confirmed` - Order confirmed by seller
- `rider_assigned` - Rider assigned for pickup
- `picked_up` - Order picked up from seller
- `in_transit` - Order in transit to customer
- `quality_verification` - Quality check in progress
- `delivered` - Order delivered successfully
- `cancelled` - Order cancelled

## Users Management

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `users.list` | Query | Protected | List all users with optional filters |
| `users.getById` | Query | Protected | Get user details with order history |
| `users.updateRole` | Mutation | Admin | Update user role (admin/user) |
| `users.suspend` | Mutation | Admin | Suspend a user account with reason and duration |
| `users.unsuspend` | Mutation | Admin | Reactivate a suspended user account |
| `users.getSuspensionHistory` | Query | Admin | Get suspension history for a user |

### Suspension Duration Options
- `7_days` - 7 day suspension
- `30_days` - 30 day suspension
- `90_days` - 90 day suspension
- `permanent` - Permanent suspension

## Riders Management

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `riders.list` | Query | Protected | List all riders with optional filters |
| `riders.getById` | Query | Protected | Get rider details with earnings and deliveries |
| `riders.updateStatus` | Mutation | Admin | Update rider status (pending/approved/rejected/suspended) |
| `riders.getBadges` | Query | Protected | Get badges earned by a rider |
| `riders.awardBadge` | Mutation | Admin | Award a badge to a rider |

## Sellers Management

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `sellers.list` | Query | Protected | List all sellers with optional filters |
| `sellers.getById` | Query | Protected | Get seller details |
| `sellers.updateStatus` | Mutation | Admin | Update seller status |
| `sellers.getProducts` | Query | Protected | Get products for a specific seller |

## Products Management

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `products.list` | Query | Protected | List all products with optional filters |
| `products.getById` | Query | Protected | Get product details |
| `products.updateStatus` | Mutation | Admin | Update product status (active/inactive) |

## Financial Management

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `financial.getOverview` | Query | Protected | Get financial overview statistics |
| `financial.getCommissionSettings` | Query | Protected | Get commission rate settings |
| `financial.updateCommissionSetting` | Mutation | Admin | Update a commission setting |
| `financial.getPaymentTransactions` | Query | Protected | Get payment transaction history |
| `financial.getMobileMoneyAnalytics` | Query | Protected | Get mobile money analytics |
| `financial.getPendingPayouts` | Query | Protected | Get pending rider payouts |
| `financial.processPayouts` | Mutation | Admin | Process a batch of payouts |
| `financial.getRevenueAnalytics` | Query | Protected | Get revenue analytics data |

## Quality Verification

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `quality.getPendingVerifications` | Query | Protected | Get orders pending quality verification |
| `quality.submitVerification` | Mutation | Protected | Submit quality verification result |
| `quality.getAnalytics` | Query | Protected | Get quality analytics data |

## Notifications

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `notifications.list` | Query | Protected | List all notifications |
| `notifications.markAsRead` | Mutation | Protected | Mark notification as read |
| `notifications.send` | Mutation | Admin | Send a notification to users |
| `pushNotifications.list` | Query | Protected | List push notification campaigns |
| `pushNotifications.send` | Mutation | Admin | Send push notification |
| `emailTemplates.list` | Query | Protected | List email templates |
| `emailTemplates.update` | Mutation | Admin | Update an email template |

## Loyalty & Rewards

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `loyalty.getProgram` | Query | Protected | Get loyalty program configuration |
| `loyalty.getUserPoints` | Query | Protected | Get user's loyalty points |
| `loyalty.awardPoints` | Mutation | Admin | Award points to a user |
| `loyalty.redeemReward` | Mutation | Protected | Redeem a loyalty reward |

## Referral Program

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `referral.getProgram` | Query | Protected | Get referral program configuration |
| `referral.getUserReferrals` | Query | Protected | Get user's referral history |
| `referral.generateCode` | Mutation | Protected | Generate a referral code |

## Analytics & Reporting

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `analytics.getOverview` | Query | Protected | Get analytics overview |
| `analytics.getOrderTrends` | Query | Protected | Get order trend data |
| `analytics.getRevenueBreakdown` | Query | Protected | Get revenue breakdown by category |
| `reports.generate` | Mutation | Protected | Generate a custom report |
| `reports.getScheduled` | Query | Protected | Get scheduled reports |
| `reports.schedule` | Mutation | Admin | Schedule a recurring report |

## System Administration

| Procedure | Type | Access | Description |
|-----------|------|--------|-------------|
| `system.notifyOwner` | Mutation | Protected | Send notification to platform owner |
| `admin.list` | Query | Admin | List admin users |
| `admin.updatePermissions` | Mutation | Admin | Update admin permissions |
| `auditTrail.list` | Query | Admin | Get audit trail entries |
| `backup.create` | Mutation | Admin | Create a database backup |
| `backup.restore` | Mutation | Admin | Restore from backup |

## Error Handling

All procedures return errors in a consistent format:

```typescript
{
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
  message: string,
  data?: any
}
```

## Rate Limiting

API requests are rate-limited to prevent abuse:
- Standard endpoints: 100 requests per minute
- Report generation: 10 requests per minute
- Bulk operations: 5 requests per minute

## WebSocket Events

Real-time updates are available via WebSocket connection at `/api/ws`:

| Event | Description |
|-------|-------------|
| `order:new` | New order created |
| `order:updated` | Order status changed |
| `rider:location` | Rider location update |
| `notification:new` | New notification received |

## Example Usage

### TypeScript/React

```typescript
import { trpc } from "@/lib/trpc";

// Query example
const { data: orders, isLoading } = trpc.orders.list.useQuery({
  status: "pending",
  limit: 20
});

// Mutation example
const updateStatus = trpc.orders.updateStatus.useMutation({
  onSuccess: () => {
    trpc.useUtils().orders.list.invalidate();
  }
});

updateStatus.mutate({
  orderId: 123,
  status: "confirmed"
});
```

---

*Last updated: January 2026*
