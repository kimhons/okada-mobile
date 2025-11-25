import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Riders from "./pages/Riders";
import Products from "./pages/Products";
import Analytics from "./pages/Analytics";
import QualityVerification from "./pages/QualityVerification";
import QualityPhotoAnalytics from "./pages/QualityPhotoAnalytics";
import Sellers from "./pages/Sellers";
import SellerDetail from "./pages/SellerDetail";
import FinancialOverview from "./pages/FinancialOverview";
import CommissionSettings from "./pages/CommissionSettings";
import PaymentTransactions from "./pages/PaymentTransactions";
import PayoutManagement from "./pages/PayoutManagement";
import RevenueAnalytics from "./pages/RevenueAnalytics";
import MobileMoneyAnalytics from "./pages/MobileMoneyAnalytics";
import DeliveryZones from "./pages/DeliveryZones";
import CustomerSupport from "./pages/CustomerSupport";
import SupportTicketDetail from "./pages/SupportTicketDetail";
import NotificationsCenter from "./pages/NotificationsCenter";
import NotificationHistory from "./pages/NotificationHistory";
import ActivityLog from "./pages/ActivityLog";
import PromotionalCampaigns from "./pages/promotional-campaigns";
import AdminUsers from "./pages/admin-users";
import AuditTrail from "./pages/audit-trail";
import BackupRestore from "./pages/backup-restore";
import APIManagement from "./pages/api-management";
import FAQManagement from "./pages/faq-management";
import SupportTickets from "./pages/support-tickets";
import HelpDocumentation from "./pages/help-documentation";
import ReportBuilder from "./pages/report-builder";
import ScheduledReports from "./pages/scheduled-reports";
import DataExport from "./pages/data-export";
import PushNotifications from "./pages/push-notifications";
import EmailTemplates from "./pages/email-templates";
import NotificationPreferences from "./pages/notification-preferences";
import CouponManagement from "./pages/coupon-management";
import LoyaltyProgram from "./pages/loyalty-program";
import TransactionHistory from "./pages/TransactionHistory";
import TransactionAnalytics from "./pages/TransactionAnalytics";
import OrderTrackingMap from "./pages/OrderTrackingMap";
import InventoryAlerts from "./pages/InventoryAlerts";
import UserVerification from "./pages/UserVerification";
import PlatformStatistics from "./pages/PlatformStatistics";
import DisputeResolution from "./pages/DisputeResolution";
import SystemSettings from "./pages/SystemSettings";
import ContentModeration from "./pages/ContentModeration";
import FraudDetection from "./pages/FraudDetection";
import LiveDashboard from "./pages/LiveDashboard";
import IncidentManagement from "./pages/IncidentManagement";
import CustomerFeedbackAnalysis from "./pages/CustomerFeedbackAnalysis";
import RiderTrainingTracker from "./pages/RiderTrainingTracker";
import RiderLeaderboard from "./pages/RiderLeaderboard";
import GeoAnalytics from "./pages/GeoAnalytics";
import ReferralProgram from "./pages/ReferralProgram";
import AdvancedReporting from "./pages/AdvancedReporting";


function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <DashboardLayout><Home /></DashboardLayout>} />
      <Route path="/orders" component={() => <DashboardLayout><Orders /></DashboardLayout>} />
      <Route path="/users" component={() => <DashboardLayout><Users /></DashboardLayout>} />
      <Route path="/riders" component={() => <DashboardLayout><Riders /></DashboardLayout>} />
      <Route path="/products" component={() => <DashboardLayout><Products /></DashboardLayout>} />
      <Route path="/analytics" component={() => <DashboardLayout><Analytics /></DashboardLayout>} />
      <Route path="/quality-verification" component={() => <DashboardLayout><QualityVerification /></DashboardLayout>} />
      <Route path="/quality-analytics" component={() => <DashboardLayout><QualityPhotoAnalytics /></DashboardLayout>} />
      <Route path="/sellers" component={() => <DashboardLayout><Sellers /></DashboardLayout>} />
      <Route path="/sellers/:id" component={() => <DashboardLayout><SellerDetail /></DashboardLayout>} />
      <Route path="/financial" component={() => <DashboardLayout><FinancialOverview /></DashboardLayout>} />
      <Route path="/commission-settings" component={() => <DashboardLayout><CommissionSettings /></DashboardLayout>} />
      <Route path="/payment-transactions" component={() => <DashboardLayout><PaymentTransactions /></DashboardLayout>} />
      <Route path="/payout-management" component={() => <DashboardLayout><PayoutManagement /></DashboardLayout>} />
      <Route path="/revenue-analytics" component={() => <DashboardLayout><RevenueAnalytics /></DashboardLayout>} />
      <Route path="/mobile-money-analytics" component={() => <DashboardLayout><MobileMoneyAnalytics /></DashboardLayout>} />
      <Route path="/delivery-zones" component={() => <DashboardLayout><DeliveryZones /></DashboardLayout>} />
      <Route path="/support" component={() => <DashboardLayout><CustomerSupport /></DashboardLayout>} />
      <Route path="/support/:id" component={() => <DashboardLayout><SupportTicketDetail /></DashboardLayout>} />
      <Route path="/notifications-center" component={() => <DashboardLayout><NotificationsCenter /></DashboardLayout>} />
      <Route path="/notification-history" component={() => <DashboardLayout><NotificationHistory /></DashboardLayout>} />
      <Route path="/activity-log" component={() => <DashboardLayout><ActivityLog /></DashboardLayout>} />
      <Route path="/campaigns" component={() => <DashboardLayout><PromotionalCampaigns /></DashboardLayout>} />
      <Route path="/admin-users" component={() => <DashboardLayout><AdminUsers /></DashboardLayout>} />
      <Route path="/audit-trail" component={() => <DashboardLayout><AuditTrail /></DashboardLayout>} />
      <Route path="/backup-restore" component={() => <DashboardLayout><BackupRestore /></DashboardLayout>} />
      <Route path="/api-management" component={() => <DashboardLayout><APIManagement /></DashboardLayout>} />
      <Route path="/faq-management" component={() => <DashboardLayout><FAQManagement /></DashboardLayout>} />
      <Route path="/support-tickets" component={() => <DashboardLayout><SupportTickets /></DashboardLayout>} />
      <Route path="/help-documentation" component={() => <DashboardLayout><HelpDocumentation /></DashboardLayout>} />
      <Route path="/report-builder" component={() => <DashboardLayout><ReportBuilder /></DashboardLayout>} />
      <Route path="/scheduled-reports" component={() => <DashboardLayout><ScheduledReports /></DashboardLayout>} />
      <Route path="/data-export" component={() => <DashboardLayout><DataExport /></DashboardLayout>} />
      <Route path="/push-notifications" component={() => <DashboardLayout><PushNotifications /></DashboardLayout>} />
      <Route path="/email-templates" component={() => <DashboardLayout><EmailTemplates /></DashboardLayout>} />
      <Route path="/notification-preferences" component={() => <DashboardLayout><NotificationPreferences /></DashboardLayout>} />
      <Route path="/coupon-management" component={() => <DashboardLayout><CouponManagement /></DashboardLayout>} />
      <Route path="/loyalty-program" component={() => <DashboardLayout><LoyaltyProgram /></DashboardLayout>} />
      <Route path="/transaction-history" component={() => <DashboardLayout><TransactionHistory /></DashboardLayout>} />
      <Route path="/transaction-analytics" component={() => <DashboardLayout><TransactionAnalytics /></DashboardLayout>} />
      <Route path="/order-tracking" component={() => <DashboardLayout><OrderTrackingMap /></DashboardLayout>} />
      <Route path="/inventory-alerts" component={() => <DashboardLayout><InventoryAlerts /></DashboardLayout>} />
      <Route path="/user-verification" component={() => <DashboardLayout><UserVerification /></DashboardLayout>} />
      <Route path="/platform-statistics" component={() => <DashboardLayout><PlatformStatistics /></DashboardLayout>} />
      <Route path="/disputes" component={() => <DashboardLayout><DisputeResolution /></DashboardLayout>} />
      <Route path="/rider-leaderboard" component={() => <DashboardLayout><RiderLeaderboard /></DashboardLayout>} />
      <Route path="/geo-analytics" component={() => <DashboardLayout><GeoAnalytics /></DashboardLayout>} />
      <Route path="/referral-program" component={() => <DashboardLayout><ReferralProgram /></DashboardLayout>} />
      <Route path="/advanced-reporting" component={() => <DashboardLayout><AdvancedReporting /></DashboardLayout>} />
      <Route path="/system-settings" component={() => <DashboardLayout><SystemSettings /></DashboardLayout>} />
      <Route path="/content-moderation" component={() => <DashboardLayout><ContentModeration /></DashboardLayout>} />
      <Route path="/fraud-detection" component={() => <DashboardLayout><FraudDetection /></DashboardLayout>} />
      <Route path="/live-dashboard" component={LiveDashboard} />
      <Route path="/incidents" component={IncidentManagement} />
      <Route path="/feedback-analysis" component={CustomerFeedbackAnalysis} />
      <Route path="/rider-training" component={RiderTrainingTracker} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

