/// API endpoint constants for Okada Platform
class ApiEndpoints {
  ApiEndpoints._();

  // ============================================
  // BASE PATHS
  // ============================================
  
  static const String apiVersion = 'v1';
  static const String basePath = '/api/$apiVersion';

  // ============================================
  // AUTHENTICATION
  // ============================================
  
  static const String auth = '$basePath/auth';
  static const String login = '$auth/login';
  static const String register = '$auth/register';
  static const String logout = '$auth/logout';
  static const String refreshToken = '$auth/refresh';
  static const String verifyOtp = '$auth/verify-otp';
  static const String resendOtp = '$auth/resend-otp';
  static const String forgotPassword = '$auth/forgot-password';
  static const String resetPassword = '$auth/reset-password';
  static const String changePassword = '$auth/change-password';
  static const String biometricRegister = '$auth/biometric/register';
  static const String biometricLogin = '$auth/biometric/login';

  // ============================================
  // USER
  // ============================================
  
  static const String users = '$basePath/users';
  static const String userProfile = '$users/profile';
  static const String userAddresses = '$users/addresses';
  static const String userFavorites = '$users/favorites';
  static const String userNotifications = '$users/notifications';
  static const String userPreferences = '$users/preferences';
  static const String userDevices = '$users/devices';
  static const String deleteAccount = '$users/delete';

  // ============================================
  // PRODUCTS
  // ============================================
  
  static const String products = '$basePath/products';
  static const String productSearch = '$products/search';
  static const String productCategories = '$products/categories';
  static const String productReviews = '$products/reviews';
  static const String productRecommendations = '$products/recommendations';
  static const String productTrending = '$products/trending';

  // ============================================
  // VENDORS
  // ============================================
  
  static const String vendors = '$basePath/vendors';
  static const String vendorSearch = '$vendors/search';
  static const String vendorCategories = '$vendors/categories';
  static const String vendorProducts = '$vendors/products';
  static const String vendorReviews = '$vendors/reviews';
  static const String nearbyVendors = '$vendors/nearby';

  // ============================================
  // CART
  // ============================================
  
  static const String cart = '$basePath/cart';
  static const String cartItems = '$cart/items';
  static const String cartClear = '$cart/clear';
  static const String cartValidate = '$cart/validate';
  static const String cartApplyCoupon = '$cart/apply-coupon';
  static const String cartRemoveCoupon = '$cart/remove-coupon';

  // ============================================
  // ORDERS
  // ============================================
  
  static const String orders = '$basePath/orders';
  static const String orderCreate = '$orders/create';
  static const String orderCancel = '$orders/cancel';
  static const String orderTrack = '$orders/track';
  static const String orderHistory = '$orders/history';
  static const String orderReorder = '$orders/reorder';
  static const String orderRate = '$orders/rate';
  static const String orderReceipt = '$orders/receipt';

  // ============================================
  // PAYMENTS
  // ============================================
  
  static const String payments = '$basePath/payments';
  static const String paymentMethods = '$payments/methods';
  static const String paymentInitiate = '$payments/initiate';
  static const String paymentVerify = '$payments/verify';
  static const String paymentHistory = '$payments/history';
  static const String mtnMomo = '$payments/mtn-momo';
  static const String orangeMoney = '$payments/orange-money';
  static const String walletBalance = '$payments/wallet/balance';
  static const String walletTopup = '$payments/wallet/topup';

  // ============================================
  // DELIVERY
  // ============================================
  
  static const String delivery = '$basePath/delivery';
  static const String deliveryEstimate = '$delivery/estimate';
  static const String deliveryTrack = '$delivery/track';
  static const String deliverySlots = '$delivery/slots';
  static const String deliveryZones = '$delivery/zones';

  // ============================================
  // RIDER (Rider App)
  // ============================================
  
  static const String rider = '$basePath/rider';
  static const String riderProfile = '$rider/profile';
  static const String riderStatus = '$rider/status';
  static const String riderLocation = '$rider/location';
  static const String riderDeliveries = '$rider/deliveries';
  static const String riderAcceptDelivery = '$rider/deliveries/accept';
  static const String riderRejectDelivery = '$rider/deliveries/reject';
  static const String riderCompleteDelivery = '$rider/deliveries/complete';
  static const String riderEarnings = '$rider/earnings';
  static const String riderWithdraw = '$rider/withdraw';
  static const String riderDocuments = '$rider/documents';
  static const String riderVehicle = '$rider/vehicle';
  static const String riderPerformance = '$rider/performance';

  // ============================================
  // NOTIFICATIONS
  // ============================================
  
  static const String notifications = '$basePath/notifications';
  static const String notificationMarkRead = '$notifications/mark-read';
  static const String notificationMarkAllRead = '$notifications/mark-all-read';
  static const String notificationSettings = '$notifications/settings';
  static const String registerPushToken = '$notifications/push-token';

  // ============================================
  // SUPPORT
  // ============================================
  
  static const String support = '$basePath/support';
  static const String supportTickets = '$support/tickets';
  static const String supportChat = '$support/chat';
  static const String supportFaq = '$support/faq';

  // ============================================
  // MISC
  // ============================================
  
  static const String config = '$basePath/config';
  static const String appConfig = '$config/app';
  static const String featureFlags = '$config/features';
  static const String promotions = '$basePath/promotions';
  static const String banners = '$basePath/banners';
  static const String announcements = '$basePath/announcements';

  // ============================================
  // WEBSOCKET
  // ============================================
  
  static const String wsOrders = '/ws/orders';
  static const String wsDelivery = '/ws/delivery';
  static const String wsNotifications = '/ws/notifications';
  static const String wsRiderLocation = '/ws/rider/location';
}
