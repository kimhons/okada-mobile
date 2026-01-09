import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { OfflineIndicator } from "./components/OfflineIndicator";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useI18nLoader } from "./hooks/useI18nLoader";
import DashboardLayout from "./components/DashboardLayout";
import { PageLoader } from "./components/PageLoader";

// Core pages - eager load for fast initial access
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Riders from "./pages/Riders";
import Products from "./pages/Products";
import Sellers from "./pages/Sellers";

// Lazy-loaded pages for code splitting
import {
  LazyGeoAnalytics,
  LazyAdvancedReporting,
  LazyQualityPhotoAnalytics,
  LazyRevenueAnalytics,
  LazyMobileMoneyAnalytics,
  LazyTransactionAnalytics,
  LazyPlatformStatistics,
  LazyAdminUsers,
  LazyAuditTrail,
  LazyBackupRestore,
  LazyAPIManagement,
  LazySystemSettings,
  LazySecurityMonitoring,
  LazySystemHealth,
  LazyTaxCompliance,
  LazyPromotionalCampaigns,
  LazyCouponManagement,
  LazyLoyaltyProgram,
  LazyReferralProgram,
  LazyABTesting,
  LazySEOManagement,
  LazyFAQManagement,
  LazyHelpDocumentation,
  LazySupportTickets,
  LazySupportTicketDetail,
  LazyPushNotifications,
  LazyEmailTemplates,
  LazyNotificationPreferences,
  LazyNotificationHistory,
  LazyRiderLeaderboard,
  LazyRiderTrainingTracker,
  LazyRiderAvailabilityCalendar,
  LazyRiderEarningsBreakdown,
  LazyBadgeShowcase,
  LazyShiftScheduling,
  LazyReportBuilder,
  LazyScheduledReports,
  LazyDataExport,
  LazyContentModeration,
  LazyModerationGuidelines,
  LazyFraudDetection,
  LazyUserVerification,
  LazyDisputeResolution,
  LazyLiveDashboard,
  LazyOrderTrackingMap,
  LazyIncidentManagement,
  LazyTranslationManagement,
  LazyInventoryAlerts,
  LazyCustomerFeedbackAnalysis,
  LazyTransactionHistory,
  LazySMSLogs,
  LazySellerOnboarding,
  LazyCustomerSegmentation,
  LazyMarketingAutomation,
  LazyRiskManagement,
  LazyComplianceCenter,
  LazyWebhookManagement,
  LazyVendorManagement,
  LazyFleetManagement,
  LazyBackupRecovery,
} from "./routes/lazyRoutes";

// Pages that don't have lazy versions yet - keep eager imports
import Analytics from "./pages/Analytics";
import QualityVerification from "./pages/QualityVerification";
import SellerDetail from "./pages/SellerDetail";
import FinancialOverview from "./pages/FinancialOverview";
import CommissionSettings from "./pages/CommissionSettings";
import PaymentTransactions from "./pages/PaymentTransactions";
import PayoutManagement from "./pages/PayoutManagement";
import DeliveryZones from "./pages/DeliveryZones";
import CustomerSupport from "./pages/CustomerSupport";
import NotificationsCenter from "./pages/NotificationsCenter";
import ActivityLog from "./pages/ActivityLog";
import CreateOrder from "./pages/CreateOrder";
import CustomerDetail from "./pages/CustomerDetail";

/**
 * Wraps a lazy component with DashboardLayout and Suspense
 */
function LazyRoute({ component: Component }: { component: React.ComponentType }) {
  return (
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        <Component />
      </Suspense>
    </DashboardLayout>
  );
}

/**
 * Wraps a lazy component with Suspense only (no DashboardLayout)
 */
function LazyRouteNoDashboard({ component: Component }: { component: React.ComponentType }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function Router() {
  return (
    <Switch>
      {/* Core pages - eager loaded */}
      <Route path="/" component={() => <DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/orders" component={() => <DashboardLayout><Orders /></DashboardLayout>} />
      <Route path="/orders/create" component={CreateOrder} />
      <Route path="/users" component={() => <DashboardLayout><Users /></DashboardLayout>} />
      <Route path="/customers/:id" component={() => <DashboardLayout><CustomerDetail /></DashboardLayout>} />
      <Route path="/riders" component={() => <DashboardLayout><Riders /></DashboardLayout>} />
      <Route path="/products" component={() => <DashboardLayout><Products /></DashboardLayout>} />
      <Route path="/sellers" component={() => <DashboardLayout><Sellers /></DashboardLayout>} />
      <Route path="/sellers/:id" component={() => <DashboardLayout><SellerDetail /></DashboardLayout>} />
      
      {/* Analytics - lazy loaded */}
      <Route path="/analytics" component={() => <DashboardLayout><Analytics /></DashboardLayout>} />
      <Route path="/quality-verification" component={() => <DashboardLayout><QualityVerification /></DashboardLayout>} />
      <Route path="/quality-analytics" component={() => <LazyRoute component={LazyQualityPhotoAnalytics} />} />
      <Route path="/geo-analytics" component={() => <LazyRoute component={LazyGeoAnalytics} />} />
      <Route path="/revenue-analytics" component={() => <LazyRoute component={LazyRevenueAnalytics} />} />
      <Route path="/mobile-money-analytics" component={() => <LazyRoute component={LazyMobileMoneyAnalytics} />} />
      <Route path="/transaction-analytics" component={() => <LazyRoute component={LazyTransactionAnalytics} />} />
      <Route path="/platform-statistics" component={() => <LazyRoute component={LazyPlatformStatistics} />} />
      <Route path="/advanced-reporting" component={() => <LazyRoute component={LazyAdvancedReporting} />} />
      
      {/* Financial - mixed */}
      <Route path="/financial" component={() => <DashboardLayout><FinancialOverview /></DashboardLayout>} />
      <Route path="/commission-settings" component={() => <DashboardLayout><CommissionSettings /></DashboardLayout>} />
      <Route path="/payment-transactions" component={() => <DashboardLayout><PaymentTransactions /></DashboardLayout>} />
      <Route path="/payout-management" component={() => <DashboardLayout><PayoutManagement /></DashboardLayout>} />
      <Route path="/transaction-history" component={() => <LazyRoute component={LazyTransactionHistory} />} />
      
      {/* Delivery & Operations */}
      <Route path="/delivery-zones" component={() => <DashboardLayout><DeliveryZones /></DashboardLayout>} />
      <Route path="/order-tracking" component={() => <LazyRoute component={LazyOrderTrackingMap} />} />
      <Route path="/inventory-alerts" component={() => <LazyRoute component={LazyInventoryAlerts} />} />
      
      {/* Support */}
      <Route path="/support" component={() => <DashboardLayout><CustomerSupport /></DashboardLayout>} />
      <Route path="/support/:id" component={() => <LazyRoute component={LazySupportTicketDetail} />} />
      <Route path="/support-tickets" component={() => <LazyRoute component={LazySupportTickets} />} />
      <Route path="/faq-management" component={() => <LazyRoute component={LazyFAQManagement} />} />
      <Route path="/help-documentation" component={() => <LazyRoute component={LazyHelpDocumentation} />} />
      
      {/* Notifications */}
      <Route path="/notifications-center" component={() => <DashboardLayout><NotificationsCenter /></DashboardLayout>} />
      <Route path="/notification-history" component={() => <LazyRoute component={LazyNotificationHistory} />} />
      <Route path="/push-notifications" component={() => <LazyRoute component={LazyPushNotifications} />} />
      <Route path="/email-templates" component={() => <LazyRoute component={LazyEmailTemplates} />} />
      <Route path="/notification-preferences" component={() => <LazyRoute component={LazyNotificationPreferences} />} />
      
      {/* Activity & Logs */}
      <Route path="/activity-log" component={() => <DashboardLayout><ActivityLog /></DashboardLayout>} />
      <Route path="/audit-trail" component={() => <LazyRoute component={LazyAuditTrail} />} />
      
      {/* Marketing & Campaigns */}
      <Route path="/promotional-campaigns" component={() => <LazyRoute component={LazyPromotionalCampaigns} />} />
      <Route path="/coupon-management" component={() => <LazyRoute component={LazyCouponManagement} />} />
      <Route path="/loyalty-program" component={() => <LazyRoute component={LazyLoyaltyProgram} />} />
      <Route path="/referral-program" component={() => <LazyRoute component={LazyReferralProgram} />} />
      <Route path="/ab-testing" component={() => <LazyRoute component={LazyABTesting} />} />
      <Route path="/seo-management" component={() => <LazyRoute component={LazySEOManagement} />} />
      
      {/* Admin & System */}
      <Route path="/admin-users" component={() => <LazyRoute component={LazyAdminUsers} />} />
      <Route path="/backup-restore" component={() => <LazyRoute component={LazyBackupRestore} />} />
      <Route path="/api-management" component={() => <LazyRoute component={LazyAPIManagement} />} />
      <Route path="/system-settings" component={() => <LazyRoute component={LazySystemSettings} />} />
      <Route path="/security-monitoring" component={() => <LazyRoute component={LazySecurityMonitoring} />} />
      <Route path="/system-health" component={() => <LazyRoute component={LazySystemHealth} />} />
      <Route path="/tax-compliance" component={() => <LazyRoute component={LazyTaxCompliance} />} />
      <Route path="/translation-management" component={() => <LazyRoute component={LazyTranslationManagement} />} />
      
      {/* Reports */}
      <Route path="/report-builder" component={() => <LazyRoute component={LazyReportBuilder} />} />
      <Route path="/scheduled-reports" component={() => <LazyRoute component={LazyScheduledReports} />} />
      <Route path="/data-export" component={() => <LazyRoute component={LazyDataExport} />} />
      
      {/* Rider Management - lazy loaded */}
      <Route path="/rider-leaderboard" component={() => <LazyRoute component={LazyRiderLeaderboard} />} />
      <Route path="/rider-training" component={() => <LazyRouteNoDashboard component={LazyRiderTrainingTracker} />} />
      <Route path="/rider-availability" component={() => <LazyRoute component={LazyRiderAvailabilityCalendar} />} />
      <Route path="/rider-earnings" component={() => <LazyRoute component={LazyRiderEarningsBreakdown} />} />
      <Route path="/badges" component={() => <LazyRoute component={LazyBadgeShowcase} />} />
      <Route path="/shift-scheduling" component={() => <LazyRoute component={LazyShiftScheduling} />} />
      
      {/* Moderation & Compliance */}
      <Route path="/content-moderation" component={() => <LazyRoute component={LazyContentModeration} />} />
      <Route path="/moderation-guidelines" component={() => <LazyRouteNoDashboard component={LazyModerationGuidelines} />} />
      <Route path="/fraud-detection" component={() => <LazyRoute component={LazyFraudDetection} />} />
      <Route path="/user-verification" component={() => <LazyRoute component={LazyUserVerification} />} />
      <Route path="/disputes" component={() => <LazyRoute component={LazyDisputeResolution} />} />
      
      {/* Live & Real-time */}
      <Route path="/live-dashboard" component={() => <LazyRouteNoDashboard component={LazyLiveDashboard} />} />
      <Route path="/incidents" component={() => <LazyRouteNoDashboard component={LazyIncidentManagement} />} />
      <Route path="/feedback-analysis" component={() => <LazyRouteNoDashboard component={LazyCustomerFeedbackAnalysis} />} />
      <Route path="/sms-logs" component={() => <LazyRoute component={LazySMSLogs} />} />
      <Route path="/seller-onboarding" component={() => <LazyRoute component={LazySellerOnboarding} />} />

      {/* Sprint 24 - Final Admin Screens */}
      <Route path="/customer-segmentation" component={() => <LazyRoute component={LazyCustomerSegmentation} />} />
      <Route path="/marketing-automation" component={() => <LazyRoute component={LazyMarketingAutomation} />} />
      <Route path="/risk-management" component={() => <LazyRoute component={LazyRiskManagement} />} />
      <Route path="/compliance-center" component={() => <LazyRoute component={LazyComplianceCenter} />} />
      <Route path="/webhook-management" component={() => <LazyRoute component={LazyWebhookManagement} />} />
      <Route path="/vendor-management" component={() => <LazyRoute component={LazyVendorManagement} />} />
      <Route path="/fleet-management" component={() => <LazyRoute component={LazyFleetManagement} />} />
      <Route path="/backup-recovery" component={() => <LazyRoute component={LazyBackupRecovery} />} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Load translations from database on mount
  useI18nLoader();
  
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <OfflineIndicator />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
