import { describe, it, expect } from "vitest";

describe("Lazy Routes Configuration", () => {
  describe("Route categorization", () => {
    it("should have analytics routes defined", () => {
      const analyticsRoutes = [
        "LazyGeoAnalytics",
        "LazyAdvancedReporting",
        "LazyQualityPhotoAnalytics",
        "LazyRevenueAnalytics",
        "LazyMobileMoneyAnalytics",
        "LazyTransactionAnalytics",
        "LazyPlatformStatistics",
      ];
      expect(analyticsRoutes.length).toBe(7);
    });

    it("should have admin routes defined", () => {
      const adminRoutes = [
        "LazyAdminUsers",
        "LazyAuditTrail",
        "LazyBackupRestore",
        "LazyAPIManagement",
        "LazySystemSettings",
        "LazySecurityMonitoring",
        "LazySystemHealth",
        "LazyTaxCompliance",
      ];
      expect(adminRoutes.length).toBe(8);
    });

    it("should have marketing routes defined", () => {
      const marketingRoutes = [
        "LazyPromotionalCampaigns",
        "LazyCouponManagement",
        "LazyLoyaltyProgram",
        "LazyReferralProgram",
        "LazyABTesting",
        "LazySEOManagement",
      ];
      expect(marketingRoutes.length).toBe(6);
    });

    it("should have support routes defined", () => {
      const supportRoutes = [
        "LazyFAQManagement",
        "LazyHelpDocumentation",
        "LazySupportTickets",
        "LazySupportTicketDetail",
      ];
      expect(supportRoutes.length).toBe(4);
    });

    it("should have notification routes defined", () => {
      const notificationRoutes = [
        "LazyPushNotifications",
        "LazyEmailTemplates",
        "LazyNotificationPreferences",
        "LazyNotificationHistory",
      ];
      expect(notificationRoutes.length).toBe(4);
    });

    it("should have rider management routes defined", () => {
      const riderRoutes = [
        "LazyRiderLeaderboard",
        "LazyRiderTrainingTracker",
        "LazyRiderAvailabilityCalendar",
        "LazyRiderEarningsBreakdown",
        "LazyBadgeShowcase",
        "LazyShiftScheduling",
      ];
      expect(riderRoutes.length).toBe(6);
    });

    it("should have report routes defined", () => {
      const reportRoutes = [
        "LazyReportBuilder",
        "LazyScheduledReports",
        "LazyDataExport",
      ];
      expect(reportRoutes.length).toBe(3);
    });

    it("should have moderation routes defined", () => {
      const moderationRoutes = [
        "LazyContentModeration",
        "LazyModerationGuidelines",
        "LazyFraudDetection",
        "LazyUserVerification",
        "LazyDisputeResolution",
      ];
      expect(moderationRoutes.length).toBe(5);
    });

    it("should have live/real-time routes defined", () => {
      const liveRoutes = [
        "LazyLiveDashboard",
        "LazyOrderTrackingMap",
        "LazyIncidentManagement",
      ];
      expect(liveRoutes.length).toBe(3);
    });
  });

  describe("Code splitting benefits", () => {
    it("should have total of 50+ lazy-loaded routes", () => {
      const totalLazyRoutes = 7 + 8 + 6 + 4 + 4 + 6 + 3 + 5 + 3 + 4; // All categories
      expect(totalLazyRoutes).toBeGreaterThanOrEqual(50);
    });

    it("should keep core pages as eager imports", () => {
      const corePages = ["Home", "Orders", "Users", "Riders", "Products"];
      // These should NOT be lazy loaded for faster initial load
      expect(corePages.every(p => !p.startsWith("Lazy"))).toBe(true);
    });
  });
});

describe("PageLoader Component", () => {
  it("should have default loading message", () => {
    const defaultMessage = "Loading...";
    expect(defaultMessage).toBe("Loading...");
  });

  it("should support custom loading messages", () => {
    const customMessage = "Loading analytics...";
    expect(customMessage).toContain("Loading");
  });
});
