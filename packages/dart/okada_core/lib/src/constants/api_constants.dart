/// API endpoint constants for Okada Platform
class ApiConstants {
  ApiConstants._();

  // Base URLs
  static const String productionBaseUrl = 'https://api.okada.cm';
  static const String stagingBaseUrl = 'https://staging-api.okada.cm';
  static const String developmentBaseUrl = 'http://localhost:3000';

  // API Version
  static const String apiVersion = 'v1';
  static const String apiPrefix = '/api';
  static const String trpcPrefix = '/api/trpc';

  // Auth Endpoints
  static const String authRequestOtp = '/mobile/auth/request-otp';
  static const String authVerifyOtp = '/mobile/auth/verify-otp';
  static const String authRefreshToken = '/mobile/auth/refresh';
  static const String authLogout = '/mobile/auth/logout';
  static const String authMe = '/mobile/auth/me';
  static const String authProfile = '/mobile/auth/profile';
  static const String authAvatar = '/mobile/auth/avatar';
  static const String authPushToken = '/mobile/auth/push-token';
  static const String authDeleteAccount = '/mobile/auth/account';

  // Customer Endpoints
  static const String customerProducts = '/mobile/products';
  static const String customerCategories = '/mobile/categories';
  static const String customerStores = '/mobile/stores';
  static const String customerCart = '/mobile/cart';
  static const String customerOrders = '/mobile/orders';
  static const String customerAddresses = '/mobile/addresses';
  static const String customerFavorites = '/mobile/favorites';
  static const String customerPromotions = '/mobile/promotions';
  static const String customerLoyalty = '/mobile/loyalty';
  static const String customerNotifications = '/mobile/notifications';
  static const String customerSupport = '/mobile/support';
  static const String customerPayments = '/mobile/payments';
  static const String customerWallet = '/mobile/wallet';
  static const String customerReviews = '/mobile/reviews';

  // Rider Endpoints
  static const String riderProfile = '/mobile/rider/profile';
  static const String riderRegister = '/mobile/rider/register';
  static const String riderDocuments = '/mobile/rider/documents';
  static const String riderStatus = '/mobile/rider/status';
  static const String riderLocation = '/mobile/rider/location';
  static const String riderOrders = '/mobile/rider/orders';
  static const String riderEarnings = '/mobile/rider/earnings';
  static const String riderPayouts = '/mobile/rider/payouts';
  static const String riderPerformance = '/mobile/rider/performance';
  static const String riderTraining = '/mobile/rider/training';
  static const String riderAchievements = '/mobile/rider/achievements';

  // Real-time Endpoints
  static const String wsOrderTracking = '/ws/order-tracking';
  static const String wsRiderLocation = '/ws/rider-location';
  static const String wsChat = '/ws/chat';
  static const String wsNotifications = '/ws/notifications';

  // Payment Endpoints
  static const String paymentMtnMomo = '/mobile/payments/mtn-momo';
  static const String paymentOrangeMoney = '/mobile/payments/orange-money';
  static const String paymentCard = '/mobile/payments/card';
  static const String paymentVerify = '/mobile/payments/verify';
  static const String paymentHistory = '/mobile/payments/history';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const Duration uploadTimeout = Duration(minutes: 5);

  // Retry Configuration
  static const int maxRetries = 3;
  static const Duration retryDelay = Duration(seconds: 2);

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
}
