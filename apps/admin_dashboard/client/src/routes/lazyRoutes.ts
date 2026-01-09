import { lazy } from "react";

/**
 * Lazy-loaded page components for code splitting.
 * These components are loaded on-demand when the route is accessed,
 * reducing the initial bundle size.
 * 
 * Core pages (Home, Orders, Users, Riders) are kept as eager imports
 * for faster initial load of commonly accessed pages.
 */

// Analytics & Reporting (less frequently accessed)
export const LazyGeoAnalytics = lazy(() => import("@/pages/GeoAnalytics"));
export const LazyAdvancedReporting = lazy(() => import("@/pages/AdvancedReporting"));
export const LazyQualityPhotoAnalytics = lazy(() => import("@/pages/QualityPhotoAnalytics"));
export const LazyRevenueAnalytics = lazy(() => import("@/pages/RevenueAnalytics"));
export const LazyMobileMoneyAnalytics = lazy(() => import("@/pages/MobileMoneyAnalytics"));
export const LazyTransactionAnalytics = lazy(() => import("@/pages/TransactionAnalytics"));
export const LazyPlatformStatistics = lazy(() => import("@/pages/PlatformStatistics"));

// Admin & System (admin-only pages)
export const LazyAdminUsers = lazy(() => import("@/pages/admin-users"));
export const LazyAuditTrail = lazy(() => import("@/pages/audit-trail"));
export const LazyBackupRestore = lazy(() => import("@/pages/backup-restore"));
export const LazyAPIManagement = lazy(() => import("@/pages/api-management"));
export const LazySystemSettings = lazy(() => import("@/pages/SystemSettings"));
export const LazySecurityMonitoring = lazy(() => import("@/pages/SecurityMonitoring"));
export const LazySystemHealth = lazy(() => import("@/pages/SystemHealth"));
export const LazyTaxCompliance = lazy(() => import("@/pages/TaxCompliance"));

// Marketing & Campaigns (less frequently accessed)
export const LazyPromotionalCampaigns = lazy(() => import("@/pages/promotional-campaigns"));
export const LazyCouponManagement = lazy(() => import("@/pages/coupon-management"));
export const LazyLoyaltyProgram = lazy(() => import("@/pages/loyalty-program"));
export const LazyReferralProgram = lazy(() => import("@/pages/ReferralProgram"));
export const LazyABTesting = lazy(() => import("@/pages/ABTesting"));
export const LazySEOManagement = lazy(() => import("@/pages/SEOManagement"));

// Support & Documentation (less frequently accessed)
export const LazyFAQManagement = lazy(() => import("@/pages/faq-management"));
export const LazyHelpDocumentation = lazy(() => import("@/pages/help-documentation"));
export const LazySupportTickets = lazy(() => import("@/pages/support-tickets"));
export const LazySupportTicketDetail = lazy(() => import("@/pages/SupportTicketDetail"));

// Notifications (less frequently accessed)
export const LazyPushNotifications = lazy(() => import("@/pages/push-notifications"));
export const LazyEmailTemplates = lazy(() => import("@/pages/email-templates"));
export const LazyNotificationPreferences = lazy(() => import("@/pages/notification-preferences"));
export const LazyNotificationHistory = lazy(() => import("@/pages/NotificationHistory"));

// Rider Management (specialized pages)
export const LazyRiderLeaderboard = lazy(() => import("@/pages/RiderLeaderboard"));
export const LazyRiderTrainingTracker = lazy(() => import("@/pages/RiderTrainingTracker"));
export const LazyRiderAvailabilityCalendar = lazy(() => import("@/pages/RiderAvailabilityCalendar"));
export const LazyRiderEarningsBreakdown = lazy(() => import("@/pages/RiderEarningsBreakdown"));
export const LazyBadgeShowcase = lazy(() => import("@/pages/BadgeShowcase"));
export const LazyShiftScheduling = lazy(() => import("@/pages/ShiftScheduling"));

// Reports (less frequently accessed)
export const LazyReportBuilder = lazy(() => import("@/pages/report-builder"));
export const LazyScheduledReports = lazy(() => import("@/pages/scheduled-reports"));
export const LazyDataExport = lazy(() => import("@/pages/data-export"));

// Moderation & Compliance (admin-only)
export const LazyContentModeration = lazy(() => import("@/pages/ContentModeration"));
export const LazyModerationGuidelines = lazy(() => import("@/pages/ModerationGuidelines"));
export const LazyFraudDetection = lazy(() => import("@/pages/FraudDetection"));
export const LazyUserVerification = lazy(() => import("@/pages/UserVerification"));
export const LazyDisputeResolution = lazy(() => import("@/pages/DisputeResolution"));

// Live & Real-time (specialized)
export const LazyLiveDashboard = lazy(() => import("@/pages/LiveDashboard"));
export const LazyOrderTrackingMap = lazy(() => import("@/pages/OrderTrackingMap"));
export const LazyIncidentManagement = lazy(() => import("@/pages/IncidentManagement"));

// Other specialized pages
export const LazyTranslationManagement = lazy(() => import("@/pages/TranslationManagement"));
export const LazyInventoryAlerts = lazy(() => import("@/pages/InventoryAlerts"));
export const LazyCustomerFeedbackAnalysis = lazy(() => import("@/pages/CustomerFeedbackAnalysis"));
export const LazyTransactionHistory = lazy(() => import("@/pages/TransactionHistory"));
export const LazySMSLogs = lazy(() => import("@/pages/SMSLogs"));
export const LazySellerOnboarding = lazy(() => import("@/pages/SellerOnboarding"));

// Sprint 24 - Final Admin Screens
export const LazyCustomerSegmentation = lazy(() => import("@/pages/CustomerSegmentation"));
export const LazyMarketingAutomation = lazy(() => import("@/pages/MarketingAutomation"));
export const LazyRiskManagement = lazy(() => import("@/pages/RiskManagement"));
export const LazyComplianceCenter = lazy(() => import("@/pages/ComplianceCenter"));
export const LazyWebhookManagement = lazy(() => import("@/pages/WebhookManagement"));
export const LazyVendorManagement = lazy(() => import("@/pages/VendorManagement"));
export const LazyFleetManagement = lazy(() => import("@/pages/FleetManagement"));
export const LazyBackupRecovery = lazy(() => import("@/pages/BackupRecovery"));
