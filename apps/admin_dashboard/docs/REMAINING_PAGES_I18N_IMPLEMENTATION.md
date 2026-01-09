# i18n Implementation Guide for Remaining 5 Pages

## Status

✅ **Translation Data**: All 448 translations seeded to database  
✅ **i18n Config**: All 6 namespaces added to i18n.ts  
✅ **Delivery Zones**: Fully implemented with i18n  
⏳ **Remaining**: 5 pages need i18n hooks added to components

---

## Implementation Pattern

Each page needs:

1. **Import hooks**:
```tsx
import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";
```

2. **Initialize in component**:
```tsx
const { t } = useTranslation("namespace");
useI18nLoader(["namespace"]);
```

3. **Replace hardcoded strings** with `t("key")` calls

---

## Page 1: Customer Support (`/client/src/pages/CustomerSupport.tsx`)

**Namespace**: `support`

### Key Replacements

**Header**:
- `"Customer Support"` → `t("title")`
- `"Manage support tickets, track resolutions, and assist customers"` → `t("subtitle")`
- `"Loading support tickets..."` → `t("loading")`

**Stats Cards**:
- `"Total Tickets"` → `t("stats.totalTickets")`
- `"Open Tickets"` → `t("stats.openTickets")`
- `"In Progress"` → `t("stats.inProgress")`
- `"Resolved"` → `t("stats.resolved")`

**Filters**:
- `"Search tickets..."` → `t("filters.searchPlaceholder")`
- `"All Statuses"` → `t("filters.allStatuses")`
- `"Open"` → `t("filters.open")`
- `"In Progress"` → `t("filters.inProgress")`
- `"Resolved"` → `t("filters.resolved")`
- `"Closed"` → `t("filters.closed")`
- `"All Priorities"` → `t("filters.allPriorities")`
- `"High"` → `t("filters.high")`
- `"Medium"` → `t("filters.medium")`
- `"Low"` → `t("filters.low")`

**Table**:
- `"Ticket ID"` → `t("table.ticketId")`
- `"Customer"` → `t("table.customer")`
- `"Subject"` → `t("table.subject")`
- `"Priority"` → `t("table.priority")`
- `"Status"` → `t("table.status")`
- `"Created"` → `t("table.created")`
- `"Actions"` → `t("table.actions")`
- `"View"` → `t("table.view")`

**Empty State**:
- `"No support tickets found"` → `t("empty.noTickets")`

---

## Page 2: Notifications Center (`/client/src/pages/NotificationsCenter.tsx`)

**Namespace**: `notifications`

### Key Replacements

**Header**:
- `"Notifications Center"` → `t("title")`
- `"Send notifications to users, riders, and sellers"` → `t("subtitle")`
- `"Compose Notification"` → `t("compose")`
- `"Loading notifications..."` → `t("loading")`

**Stats Cards**:
- `"Total Sent"` → `t("stats.totalSent")`
- `"Delivered"` → `t("stats.delivered")`
- `"Pending"` → `t("stats.pending")`
- `"Failed"` → `t("stats.failed")`

**Dialog**:
- `"Compose Notification"` → `t("dialog.composeTitle")`
- `"Send a notification to specific user groups"` → `t("dialog.composeDescription")`
- `"Title"` → `t("dialog.notificationTitle")`
- `"Enter notification title"` → `t("dialog.titlePlaceholder")`
- `"Message"` → `t("dialog.message")`
- `"Enter notification message"` → `t("dialog.messagePlaceholder")`
- `"Target Audience"` → `t("dialog.targetAudience")`
- `"All Users"` → `t("dialog.allUsers")`
- `"Customers"` → `t("dialog.customers")`
- `"Riders"` → `t("dialog.riders")`
- `"Sellers"` → `t("dialog.sellers")`
- `"Cancel"` → `t("dialog.cancel")`
- `"Send Notification"` → `t("dialog.send")`

**Table**:
- `"Title"` → `t("table.title")`
- `"Message"` → `t("table.message")`
- `"Audience"` → `t("table.audience")`
- `"Status"` → `t("table.status")`
- `"Sent At"` → `t("table.sentAt")`
- `"Delivery Rate"` → `t("table.deliveryRate")`

**Toast**:
- `"Notification sent successfully"` → `t("toast.sendSuccess")`
- `"Failed to send notification"` → `t("toast.sendError")`

---

## Page 3: Activity Log (`/client/src/pages/ActivityLog.tsx`)

**Namespace**: `activity`

### Key Replacements

**Header**:
- `"Activity Log"` → `t("title")`
- `"Track all admin actions with timestamps for security auditing"` → `t("subtitle")`
- `"Loading activity log..."` → `t("loading")`

**Stats Cards**:
- `"Total Activities"` → `t("stats.totalActivities")`
- `"Today's Activities"` → `t("stats.todaysActivities")`
- `"Active Admins"` → `t("stats.activeAdmins")`
- `"All recorded actions"` → `t("stats.allRecorded")`
- `"Actions performed today"` → `t("stats.performedToday")`
- `"Unique administrators"` → `t("stats.uniqueAdmins")`

**Filters**:
- `"Search activities..."` → `t("filters.searchPlaceholder")`
- `"Filter by action"` → `t("filters.filterByAction")`
- `"All Actions"` → `t("filters.allActions")`
- `"Create Actions"` → `t("filters.createActions")`
- `"Update Actions"` → `t("filters.updateActions")`
- `"Delete Actions"` → `t("filters.deleteActions")`
- `"Send Actions"` → `t("filters.sendActions")`

**Table**:
- `"Admin"` → `t("table.admin")`
- `"Action"` → `t("table.action")`
- `"Entity"` → `t("table.entity")`
- `"Details"` → `t("table.details")`
- `"IP Address"` → `t("table.ipAddress")`
- `"Timestamp"` → `t("table.timestamp")`

**Empty State**:
- `"No activities found"` → `t("empty.noActivities")`

---

## Page 4: Promotional Campaigns (`/client/src/pages/promotional-campaigns.tsx`)

**Namespace**: `campaigns`

### Key Replacements

**Header**:
- `"Promotional Campaigns"` → `t("title")`
- `"Create and manage marketing campaigns and promotions"` → `t("subtitle")`
- `"Create Campaign"` → `t("createCampaign")`
- `"Loading campaigns..."` → `t("loading")`

**Stats Cards**:
- `"Active Campaigns"` → `t("stats.activeCampaigns")`
- `"Total Reach"` → `t("stats.totalReach")`
- `"Conversion Rate"` → `t("stats.conversionRate")`
- `"Total Revenue"` → `t("stats.totalRevenue")`

**Dialog**:
- `"Create Campaign"` → `t("dialog.createTitle")`
- `"Launch a new promotional campaign"` → `t("dialog.createDescription")`
- `"Edit Campaign"` → `t("dialog.editTitle")`
- `"Update campaign details"` → `t("dialog.editDescription")`
- `"Campaign Name"` → `t("dialog.campaignName")`
- `"Enter campaign name"` → `t("dialog.namePlaceholder")`
- `"Description"` → `t("dialog.description")`
- `"Enter campaign description"` → `t("dialog.descriptionPlaceholder")`
- `"Discount Type"` → `t("dialog.discountType")`
- `"Percentage"` → `t("dialog.percentage")`
- `"Fixed Amount"` → `t("dialog.fixedAmount")`
- `"Discount Value"` → `t("dialog.discountValue")`
- `"Enter discount value"` → `t("dialog.valuePlaceholder")`
- `"Start Date"` → `t("dialog.startDate")`
- `"End Date"` → `t("dialog.endDate")`
- `"Target Audience"` → `t("dialog.targetAudience")`
- `"All Users"` → `t("dialog.allUsers")`
- `"New Users"` → `t("dialog.newUsers")`
- `"Returning Users"` → `t("dialog.returningUsers")`
- `"Cancel"` → `t("dialog.cancel")`
- `"Create Campaign"` → `t("dialog.create")`
- `"Update Campaign"` → `t("dialog.update")`

**Filters**:
- `"Search campaigns..."` → `t("filters.searchPlaceholder")`
- `"All Statuses"` → `t("filters.allStatuses")`
- `"Active"` → `t("filters.active")`
- `"Scheduled"` → `t("filters.scheduled")`
- `"Ended"` → `t("filters.ended")`
- `"Paused"` → `t("filters.paused")`

**Table**:
- `"Campaign"` → `t("table.campaign")`
- `"Discount"` → `t("table.discount")`
- `"Period"` → `t("table.period")`
- `"Reach"` → `t("table.reach")`
- `"Conversions"` → `t("table.conversions")`
- `"Revenue"` → `t("table.revenue")`
- `"Status"` → `t("table.status")`
- `"Actions"` → `t("table.actions")`
- `"Edit"` → `t("table.edit")`
- `"Delete"` → `t("table.delete")`
- `"Pause"` → `t("table.pause")`
- `"Resume"` → `t("table.resume")`

**Toast**:
- `"Campaign created successfully"` → `t("toast.createSuccess")`
- `"Campaign updated successfully"` → `t("toast.updateSuccess")`
- `"Campaign deleted successfully"` → `t("toast.deleteSuccess")`
- `"Campaign paused successfully"` → `t("toast.pauseSuccess")`
- `"Campaign resumed successfully"` → `t("toast.resumeSuccess")`

**Empty State**:
- `"No campaigns found"` → `t("empty.noCampaigns")`

---

## Page 5: Analytics (`/client/src/pages/Analytics.tsx`)

**Namespace**: `analytics`

### Key Replacements

**Header**:
- `"Analytics Dashboard"` → `t("title")`
- `"Comprehensive platform analytics and insights"` → `t("subtitle")`
- `"Loading analytics..."` → `t("loading")`

**Time Period**:
- `"Today"` → `t("period.today")`
- `"This Week"` → `t("period.week")`
- `"This Month"` → `t("period.month")`
- `"This Quarter"` → `t("period.quarter")`
- `"This Year"` → `t("period.year")`

**Stats Cards**:
- `"Total Orders"` → `t("stats.totalOrders")`
- `"Total Revenue"` → `t("stats.totalRevenue")`
- `"Active Users"` → `t("stats.activeUsers")`
- `"Active Riders"` → `t("stats.activeRiders")`
- `"Orders placed"` → `t("stats.ordersPlaced")`
- `"Revenue generated"` → `t("stats.revenueGenerated")`
- `"Registered users"` → `t("stats.registeredUsers")`
- `"Available riders"` → `t("stats.availableRiders")`
- `"from last period"` → `t("stats.fromLastPeriod")`

**Charts**:
- `"Order Trends"` → `t("charts.orderTrends")`
- `"Daily order volume over time"` → `t("charts.orderTrendsDescription")`
- `"Revenue Analysis"` → `t("charts.revenueAnalysis")`
- `"Revenue breakdown by category"` → `t("charts.revenueDescription")`
- `"User Growth"` → `t("charts.userGrowth")`
- `"New user registrations over time"` → `t("charts.userGrowthDescription")`
- `"Rider Performance"` → `t("charts.riderPerformance")`
- `"Top performing riders by deliveries"` → `t("charts.riderDescription")`
- `"Orders"` → `t("charts.orders")`
- `"Revenue"` → `t("charts.revenue")`
- `"Users"` → `t("charts.users")`
- `"Deliveries"` → `t("charts.deliveries")`

**Empty State**:
- `"No data available"` → `t("empty.noData")`

---

## Next Steps

### Option A: Automated Implementation (Recommended)
I can update all 5 page components with i18n hooks automatically. This will:
- Add import statements
- Initialize hooks
- Replace all hardcoded strings with t() calls
- Maintain existing functionality

### Option B: Manual Implementation
Use this guide to manually update each page component. Benefits:
- Full control over implementation
- Can review each change
- Learn the pattern for future pages

### Option C: Test First, Then Complete
1. Test Delivery Zones page first (already implemented)
2. Verify translations work correctly
3. Then proceed with remaining 5 pages

---

## Testing Checklist

After implementation, test each page:

- [ ] Page loads without errors
- [ ] All text displays in English by default
- [ ] Language switcher changes all text to French
- [ ] No untranslated strings visible
- [ ] Toast messages appear in correct language
- [ ] Dialog content translates correctly
- [ ] Table headers and content translate
- [ ] Empty states show translated messages

---

**Last Updated**: November 29, 2025  
**Status**: Translation data ready, awaiting component implementation
