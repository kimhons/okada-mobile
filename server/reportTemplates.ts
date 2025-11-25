/**
 * Pre-built Report Templates Library
 * 
 * This file contains 15 ready-to-use report templates for common business intelligence needs.
 * Templates are categorized by: Sales, Operations, Finance, Quality, and Platform Health.
 */

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: "sales" | "operations" | "finance" | "quality" | "platform";
  reportType: "orders" | "revenue" | "riders" | "users" | "products" | "incidents" | "feedback" | "training" | "custom";
  filters: Record<string, any>;
  metrics: string[];
  groupBy?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  icon: string;
  frequency?: "daily" | "weekly" | "monthly" | "quarterly";
}

export const REPORT_TEMPLATES: ReportTemplate[] = [
  // ============================================================================
  // SALES CATEGORY
  // ============================================================================
  {
    id: "daily-sales-summary",
    name: "Daily Sales Summary",
    description: "Daily overview of orders, revenue, and average order value with hour-by-hour breakdown",
    category: "sales",
    reportType: "orders",
    filters: {
      dateRange: "today",
      status: ["delivered", "confirmed"],
    },
    metrics: ["total_orders", "total_revenue", "avg_order_value", "orders_by_hour"],
    groupBy: "hour",
    sortBy: "hour",
    sortOrder: "asc",
    icon: "📊",
    frequency: "daily",
  },
  {
    id: "weekly-revenue-report",
    name: "Weekly Revenue Report",
    description: "Comprehensive weekly revenue analysis with day-over-day comparison and growth trends",
    category: "sales",
    reportType: "revenue",
    filters: {
      dateRange: "last_7_days",
    },
    metrics: ["total_revenue", "order_count", "avg_order_value", "revenue_by_day", "growth_rate"],
    groupBy: "day",
    sortBy: "date",
    sortOrder: "asc",
    icon: "💰",
    frequency: "weekly",
  },
  {
    id: "product-performance-analysis",
    name: "Product Performance Analysis",
    description: "Top-selling products, revenue contribution, and inventory turnover metrics",
    category: "sales",
    reportType: "products",
    filters: {
      dateRange: "last_30_days",
      minOrders: 5,
    },
    metrics: ["units_sold", "revenue", "avg_price", "inventory_turnover", "profit_margin"],
    groupBy: "product",
    sortBy: "revenue",
    sortOrder: "desc",
    icon: "📦",
    frequency: "monthly",
  },
  {
    id: "seller-performance-report",
    name: "Seller Performance Report",
    description: "Seller rankings by revenue, order volume, customer ratings, and fulfillment speed",
    category: "sales",
    reportType: "custom",
    filters: {
      dateRange: "last_30_days",
      minOrders: 10,
    },
    metrics: ["total_orders", "total_revenue", "avg_rating", "fulfillment_time", "return_rate"],
    groupBy: "seller",
    sortBy: "total_revenue",
    sortOrder: "desc",
    icon: "🏪",
    frequency: "monthly",
  },

  // ============================================================================
  // OPERATIONS CATEGORY
  // ============================================================================
  {
    id: "monthly-rider-performance",
    name: "Monthly Rider Performance",
    description: "Rider efficiency metrics including deliveries, earnings, ratings, and on-time performance",
    category: "operations",
    reportType: "riders",
    filters: {
      dateRange: "last_30_days",
      status: "active",
    },
    metrics: ["deliveries_completed", "total_earnings", "avg_rating", "on_time_rate", "distance_traveled"],
    groupBy: "rider",
    sortBy: "deliveries_completed",
    sortOrder: "desc",
    icon: "🏍️",
    frequency: "monthly",
  },
  {
    id: "order-fulfillment-metrics",
    name: "Order Fulfillment Metrics",
    description: "End-to-end order fulfillment analysis with pickup, delivery times, and success rates",
    category: "operations",
    reportType: "orders",
    filters: {
      dateRange: "last_7_days",
    },
    metrics: ["total_orders", "avg_pickup_time", "avg_delivery_time", "success_rate", "cancellation_rate"],
    groupBy: "status",
    sortBy: "total_orders",
    sortOrder: "desc",
    icon: "⏱️",
    frequency: "weekly",
  },
  {
    id: "delivery-zone-analytics",
    name: "Delivery Zone Analytics",
    description: "Geographic performance analysis by delivery zone with demand patterns and coverage",
    category: "operations",
    reportType: "custom",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["order_volume", "avg_delivery_time", "rider_coverage", "peak_hours", "revenue"],
    groupBy: "zone",
    sortBy: "order_volume",
    sortOrder: "desc",
    icon: "🗺️",
    frequency: "monthly",
  },
  {
    id: "incident-summary-report",
    name: "Incident Summary Report",
    description: "Safety incident tracking with severity analysis, resolution times, and trends",
    category: "operations",
    reportType: "incidents",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["total_incidents", "by_severity", "avg_resolution_time", "insurance_claims", "trends"],
    groupBy: "severity",
    sortBy: "total_incidents",
    sortOrder: "desc",
    icon: "⚠️",
    frequency: "monthly",
  },

  // ============================================================================
  // FINANCE CATEGORY
  // ============================================================================
  {
    id: "financial-overview-report",
    name: "Financial Overview Report",
    description: "Complete financial snapshot with revenue, expenses, commissions, and profit margins",
    category: "finance",
    reportType: "revenue",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["total_revenue", "platform_commission", "rider_earnings", "seller_payouts", "net_profit"],
    groupBy: "category",
    sortBy: "amount",
    sortOrder: "desc",
    icon: "💵",
    frequency: "monthly",
  },
  {
    id: "commission-analysis-report",
    name: "Commission Analysis Report",
    description: "Platform commission breakdown by seller, product category, and order value tiers",
    category: "finance",
    reportType: "revenue",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["commission_earned", "commission_rate", "order_count", "avg_commission_per_order"],
    groupBy: "seller",
    sortBy: "commission_earned",
    sortOrder: "desc",
    icon: "💳",
    frequency: "monthly",
  },

  // ============================================================================
  // QUALITY CATEGORY
  // ============================================================================
  {
    id: "customer-satisfaction-monthly",
    name: "Customer Satisfaction Report",
    description: "Monthly customer feedback analysis with sentiment scores, ratings, and improvement areas",
    category: "quality",
    reportType: "feedback",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["total_feedback", "avg_rating", "sentiment_score", "positive_rate", "negative_rate", "top_issues"],
    groupBy: "sentiment",
    sortBy: "count",
    sortOrder: "desc",
    icon: "⭐",
    frequency: "monthly",
  },
  {
    id: "quality-verification-report",
    name: "Quality Verification Report",
    description: "Product quality metrics with photo verification rates, rejection reasons, and trends",
    category: "quality",
    reportType: "custom",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["photos_submitted", "verification_rate", "rejection_rate", "avg_quality_score", "top_rejection_reasons"],
    groupBy: "status",
    sortBy: "count",
    sortOrder: "desc",
    icon: "📸",
    frequency: "monthly",
  },

  // ============================================================================
  // PLATFORM HEALTH CATEGORY
  // ============================================================================
  {
    id: "user-growth-report",
    name: "User Growth Report",
    description: "User acquisition and retention metrics with cohort analysis and churn rates",
    category: "platform",
    reportType: "users",
    filters: {
      dateRange: "last_90_days",
    },
    metrics: ["new_users", "active_users", "retention_rate", "churn_rate", "growth_rate"],
    groupBy: "week",
    sortBy: "date",
    sortOrder: "asc",
    icon: "📈",
    frequency: "monthly",
  },
  {
    id: "training-completion-report",
    name: "Training Completion Report",
    description: "Rider training progress with module completion rates, quiz scores, and certifications",
    category: "platform",
    reportType: "training",
    filters: {
      dateRange: "last_30_days",
    },
    metrics: ["riders_enrolled", "completion_rate", "avg_quiz_score", "certifications_issued", "time_to_complete"],
    groupBy: "module",
    sortBy: "completion_rate",
    sortOrder: "desc",
    icon: "🎓",
    frequency: "monthly",
  },
  {
    id: "platform-health-report",
    name: "Platform Health Report",
    description: "Overall platform performance with key metrics, system uptime, and operational efficiency",
    category: "platform",
    reportType: "custom",
    filters: {
      dateRange: "last_7_days",
    },
    metrics: ["active_users", "active_riders", "orders_per_day", "avg_response_time", "error_rate", "uptime"],
    groupBy: "day",
    sortBy: "date",
    sortOrder: "asc",
    icon: "🖥️",
    frequency: "weekly",
  },
];

/**
 * Get all report templates
 */
export function getAllTemplates(): ReportTemplate[] {
  return REPORT_TEMPLATES;
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: ReportTemplate["category"]): ReportTemplate[] {
  return REPORT_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get a specific template by ID
 */
export function getTemplateById(id: string): ReportTemplate | undefined {
  return REPORT_TEMPLATES.find(t => t.id === id);
}

/**
 * Get templates by frequency
 */
export function getTemplatesByFrequency(frequency: ReportTemplate["frequency"]): ReportTemplate[] {
  return REPORT_TEMPLATES.filter(t => t.frequency === frequency);
}
