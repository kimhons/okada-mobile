# Translation Mapping for Remaining 6 Pages

## Overview
This document maps all translation keys needed for the 6 remaining untranslated pages in the Okada Admin Dashboard.

**Pages to Translate**:
1. Delivery Zones (449 lines)
2. Customer Support (301 lines)
3. Notifications Center (325 lines)
4. Activity Log (213 lines)
5. Promotional Campaigns (762 lines)
6. Analytics (376 lines)

**Total Estimated Keys**: ~180-200 keys
**Total Translations**: ~360-400 (EN + FR)

---

## 1. Delivery Zones Page

**Namespace**: `zones`

### Header Section (5 keys)
- `title`: "Delivery Zones"
- `subtitle`: "Configure delivery zones for Douala and Yaoundé with pricing tiers and time estimates"
- `addZone`: "Add Zone"
- `loading`: "Loading delivery zones..."
- `deleteConfirm`: "Are you sure you want to delete this delivery zone?"

### Create/Edit Dialog (12 keys)
- `createTitle`: "Create Delivery Zone"
- `createDescription`: "Add a new delivery zone with pricing and time estimates"
- `editTitle`: "Edit Delivery Zone"
- `editDescription`: "Update delivery zone pricing and time estimates"
- `zoneName`: "Zone Name"
- `zoneNamePlaceholder`: "e.g., Akwa, Bonanjo"
- `city`: "City"
- `baseFee`: "Base Fee (FCFA)"
- `perKmFee`: "Per KM Fee (FCFA)"
- `estimatedTime`: "Estimated Delivery Time (minutes)"
- `cancel`: "Cancel"
- `create`: "Create Zone"
- `update`: "Update Zone"

### City Cards (8 keys)
- `doualaZones`: "Douala Zones"
- `yaoundeZones`: "Yaoundé Zones"
- `zonesConfigured`: "delivery zones configured"
- `noZonesDouala`: "No delivery zones configured for Douala"
- `noZonesYaounde`: "No delivery zones configured for Yaoundé"
- `douala`: "Douala"
- `yaounde`: "Yaoundé"

### Table (7 keys)
- `zone`: "Zone"
- `pricing`: "Pricing"
- `time`: "Time"
- `status`: "Status"
- `actions`: "Actions"
- `active`: "Active"
- `inactive`: "Inactive"
- `base`: "base"
- `perKm`: "/km"
- `min`: "min"

### Toast Messages (3 keys)
- `createSuccess`: "Delivery zone created successfully"
- `updateSuccess`: "Delivery zone updated successfully"
- `deleteSuccess`: "Delivery zone deleted successfully"

**Total**: ~35 keys

---

## 2. Customer Support Page

**Namespace**: `support`

### Header Section (3 keys)
- `title`: "Customer Support"
- `subtitle`: "Manage customer support tickets and inquiries"
- `loading`: "Loading support tickets..."

### Stats Cards (8 keys)
- `totalTickets`: "Total Tickets"
- `openTickets`: "Open Tickets"
- `inProgress`: "In Progress"
- `resolved`: "Resolved"
- `allTickets`: "All support tickets"
- `needsAttention`: "Needs attention"
- `beingHandled`: "Being handled"
- `successfullyResolved`: "Successfully resolved"

### Filters (10 keys)
- `searchPlaceholder`: "Search tickets..."
- `allStatuses`: "All Statuses"
- `open`: "Open"
- `inProgressStatus`: "In Progress"
- `resolvedStatus`: "Resolved"
- `closed`: "Closed"
- `allPriorities`: "All Priorities"
- `high`: "High"
- `medium`: "Medium"
- `low`: "Low"

### Table (8 keys)
- `ticketId`: "Ticket ID"
- `customer`: "Customer"
- `subject`: "Subject"
- `priority`: "Priority"
- `status`: "Status"
- `created`: "Created"
- `actions`: "Actions"
- `view`: "View"

### Empty State (2 keys)
- `noTickets`: "No support tickets found"
- `noTicketsMessage`: "No tickets match your current filters"

**Total**: ~31 keys

---

## 3. Notifications Center Page

**Namespace**: `notifications`

### Header Section (4 keys)
- `title`: "Notifications Center"
- `subtitle`: "Send notifications to users, riders, and sellers"
- `compose`: "Compose Notification"
- `loading`: "Loading notifications..."

### Stats Cards (8 keys)
- `totalSent`: "Total Sent"
- `delivered`: "Delivered"
- `pending`: "Pending"
- `failed`: "Failed"
- `allNotifications`: "All notifications sent"
- `successfullyDelivered`: "Successfully delivered"
- `awaitingDelivery`: "Awaiting delivery"
- `deliveryFailed`: "Delivery failed"

### Compose Dialog (12 keys)
- `composeTitle`: "Compose Notification"
- `composeDescription`: "Send a notification to specific user groups"
- `notificationTitle`: "Title"
- `titlePlaceholder`: "Enter notification title"
- `message`: "Message"
- `messagePlaceholder`: "Enter notification message"
- `targetAudience`: "Target Audience"
- `allUsers`: "All Users"
- `customers`: "Customers"
- `riders`: "Riders"
- `sellers`: "Sellers"
- `cancel`: "Cancel"
- `send`: "Send Notification"

### Table (7 keys)
- `title`: "Title"
- `message`: "Message"
- `audience`: "Audience"
- `status`: "Status"
- `sentAt`: "Sent At"
- `deliveryRate`: "Delivery Rate"

### Toast Messages (3 keys)
- `sendSuccess`: "Notification sent successfully"
- `sendError`: "Failed to send notification"

**Total**: ~34 keys

---

## 4. Activity Log Page

**Namespace**: `activity`

### Header Section (3 keys)
- `title`: "Activity Log"
- `subtitle`: "Track all admin actions with timestamps for security auditing"
- `loading`: "Loading activity log..."

### Stats Cards (9 keys)
- `totalActivities`: "Total Activities"
- `todaysActivities`: "Today's Activities"
- `activeAdmins`: "Active Admins"
- `allRecorded`: "All recorded actions"
- `performedToday`: "Actions performed today"
- `uniqueAdmins`: "Unique administrators"

### Filters (8 keys)
- `searchPlaceholder`: "Search activities..."
- `filterByAction`: "Filter by action"
- `allActions`: "All Actions"
- `createActions`: "Create Actions"
- `updateActions`: "Update Actions"
- `deleteActions`: "Delete Actions"
- `sendActions`: "Send Actions"

### Table (7 keys)
- `admin`: "Admin"
- `action`: "Action"
- `entity`: "Entity"
- `details`: "Details"
- `ipAddress`: "IP Address"
- `timestamp`: "Timestamp"

### Empty State (2 keys)
- `noActivities`: "No activities found"
- `noActivitiesMessage`: "No activities match your search criteria"

**Total**: ~29 keys

---

## 5. Promotional Campaigns Page

**Namespace**: `campaigns`

### Header Section (4 keys)
- `title`: "Promotional Campaigns"
- `subtitle`: "Create and manage marketing campaigns and promotions"
- `createCampaign`: "Create Campaign"
- `loading`: "Loading campaigns..."

### Stats Cards (12 keys)
- `activeCampaigns`: "Active Campaigns"
- `totalReach`: "Total Reach"
- `conversionRate`: "Conversion Rate"
- `totalRevenue`: "Total Revenue"
- `currentlyRunning`: "Currently running"
- `usersReached`: "Users reached"
- `campaignConversions`: "Campaign conversions"
- `generatedRevenue`: "Generated revenue"

### Create/Edit Dialog (20 keys)
- `createTitle`: "Create Campaign"
- `createDescription`: "Launch a new promotional campaign"
- `editTitle`: "Edit Campaign"
- `editDescription`: "Update campaign details"
- `campaignName`: "Campaign Name"
- `namePlaceholder`: "Enter campaign name"
- `description`: "Description"
- `descriptionPlaceholder`: "Enter campaign description"
- `discountType`: "Discount Type"
- `percentage`: "Percentage"
- `fixedAmount`: "Fixed Amount"
- `discountValue`: "Discount Value"
- `valuePlaceholder`: "Enter discount value"
- `startDate`: "Start Date"
- `endDate`: "End Date"
- `targetAudience`: "Target Audience"
- `allUsers`: "All Users"
- `newUsers`: "New Users"
- `returningUsers`: "Returning Users"
- `cancel`: "Cancel"
- `create`: "Create Campaign"
- `update`: "Update Campaign"

### Filters (6 keys)
- `searchPlaceholder`: "Search campaigns..."
- `allStatuses`: "All Statuses"
- `active`: "Active"
- `scheduled`: "Scheduled"
- `ended`: "Ended"
- `paused`: "Paused"

### Table (10 keys)
- `campaign`: "Campaign"
- `discount`: "Discount"
- `period`: "Period"
- `reach`: "Reach"
- `conversions`: "Conversions"
- `revenue`: "Revenue"
- `status`: "Status"
- `actions`: "Actions"
- `edit`: "Edit"
- `delete`: "Delete"
- `pause`: "Pause"
- `resume`: "Resume"

### Toast Messages (5 keys)
- `createSuccess`: "Campaign created successfully"
- `updateSuccess`: "Campaign updated successfully"
- `deleteSuccess`: "Campaign deleted successfully"
- `pauseSuccess`: "Campaign paused successfully"
- `resumeSuccess`: "Campaign resumed successfully"

**Total**: ~57 keys

---

## 6. Analytics Page

**Namespace**: `analytics`

### Header Section (3 keys)
- `title`: "Analytics Dashboard"
- `subtitle`: "Comprehensive platform analytics and insights"
- `loading`: "Loading analytics..."

### Time Period Selector (5 keys)
- `today`: "Today"
- `week`: "This Week"
- `month`: "This Month"
- `quarter`: "This Quarter"
- `year`: "This Year"

### Overview Stats (16 keys)
- `totalOrders`: "Total Orders"
- `totalRevenue`: "Total Revenue"
- `activeUsers`: "Active Users"
- `activeRiders`: "Active Riders"
- `ordersPlaced`: "Orders placed"
- `revenueGenerated`: "Revenue generated"
- `registeredUsers`: "Registered users"
- `availableRiders`: "Available riders"
- `fromLastPeriod`: "from last period"

### Charts (15 keys)
- `orderTrends`: "Order Trends"
- `orderTrendsDescription`: "Daily order volume over time"
- `revenueAnalysis`: "Revenue Analysis"
- `revenueDescription`: "Revenue breakdown by category"
- `userGrowth`: "User Growth"
- `userGrowthDescription`: "New user registrations over time"
- `riderPerformance`: "Rider Performance"
- `riderDescription`: "Top performing riders by deliveries"
- `orders`: "Orders"
- `revenue`: "Revenue"
- `users`: "Users"
- `deliveries`: "Deliveries"

### Empty State (2 keys)
- `noData`: "No data available"
- `noDataMessage`: "No analytics data for the selected period"

**Total**: ~41 keys

---

## Summary

| Page | Namespace | Estimated Keys | Estimated Translations (EN+FR) |
|------|-----------|----------------|-------------------------------|
| Delivery Zones | zones | 35 | 70 |
| Customer Support | support | 31 | 62 |
| Notifications Center | notifications | 34 | 68 |
| Activity Log | activity | 29 | 58 |
| Promotional Campaigns | campaigns | 57 | 114 |
| Analytics | analytics | 41 | 82 |
| **TOTAL** | **6 namespaces** | **227 keys** | **454 translations** |

---

## Implementation Plan

### Phase 1: Delivery Zones & Customer Support
- Add i18n keys to DeliveryZones.tsx
- Add i18n keys to CustomerSupport.tsx
- Create seed script for zones and support namespaces
- Seed 70 + 62 = 132 translations

### Phase 2: Notifications Center & Activity Log
- Add i18n keys to NotificationsCenter.tsx
- Add i18n keys to ActivityLog.tsx
- Create seed script for notifications and activity namespaces
- Seed 68 + 58 = 126 translations

### Phase 3: Campaigns & Analytics
- Add i18n keys to promotional-campaigns.tsx
- Add i18n keys to Analytics.tsx
- Create seed script for campaigns and analytics namespaces
- Seed 114 + 82 = 196 translations

### Phase 4: Configuration & Testing
- Update i18n.ts with all 6 new namespaces
- Update useI18nLoader to load new namespaces
- Test all pages in English and French
- Update documentation with final counts

---

**Last Updated**: November 29, 2025
**Status**: Planning Complete - Ready for Implementation
