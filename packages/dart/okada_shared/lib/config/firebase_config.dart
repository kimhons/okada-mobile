import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';

/// Firebase configuration for Okada apps
/// 
/// To set up Firebase:
/// 1. Create a Firebase project at https://console.firebase.google.com
/// 2. Add Android and iOS apps to the project
/// 3. Download google-services.json (Android) and GoogleService-Info.plist (iOS)
/// 4. Place them in the respective platform directories
/// 5. Update the values below with your project configuration
class FirebaseConfig {
  // Customer App - Android
  static const String customerAndroidApiKey = 'YOUR_ANDROID_API_KEY';
  static const String customerAndroidAppId = '1:YOUR_PROJECT_NUMBER:android:YOUR_APP_ID';
  static const String customerAndroidMessagingSenderId = 'YOUR_PROJECT_NUMBER';
  static const String customerAndroidProjectId = 'okada-customer';
  static const String customerAndroidStorageBucket = 'okada-customer.appspot.com';

  // Customer App - iOS
  static const String customerIosApiKey = 'YOUR_IOS_API_KEY';
  static const String customerIosAppId = '1:YOUR_PROJECT_NUMBER:ios:YOUR_APP_ID';
  static const String customerIosMessagingSenderId = 'YOUR_PROJECT_NUMBER';
  static const String customerIosProjectId = 'okada-customer';
  static const String customerIosStorageBucket = 'okada-customer.appspot.com';
  static const String customerIosBundleId = 'com.okada.customer';

  // Rider App - Android
  static const String riderAndroidApiKey = 'YOUR_ANDROID_API_KEY';
  static const String riderAndroidAppId = '1:YOUR_PROJECT_NUMBER:android:YOUR_APP_ID';
  static const String riderAndroidMessagingSenderId = 'YOUR_PROJECT_NUMBER';
  static const String riderAndroidProjectId = 'okada-rider';
  static const String riderAndroidStorageBucket = 'okada-rider.appspot.com';

  // Rider App - iOS
  static const String riderIosApiKey = 'YOUR_IOS_API_KEY';
  static const String riderIosAppId = '1:YOUR_PROJECT_NUMBER:ios:YOUR_APP_ID';
  static const String riderIosMessagingSenderId = 'YOUR_PROJECT_NUMBER';
  static const String riderIosProjectId = 'okada-rider';
  static const String riderIosStorageBucket = 'okada-rider.appspot.com';
  static const String riderIosBundleId = 'com.okada.rider';

  /// Get Firebase options for Customer App
  static FirebaseOptions get customerOptions {
    if (Platform.isAndroid) {
      return const FirebaseOptions(
        apiKey: customerAndroidApiKey,
        appId: customerAndroidAppId,
        messagingSenderId: customerAndroidMessagingSenderId,
        projectId: customerAndroidProjectId,
        storageBucket: customerAndroidStorageBucket,
      );
    } else if (Platform.isIOS) {
      return const FirebaseOptions(
        apiKey: customerIosApiKey,
        appId: customerIosAppId,
        messagingSenderId: customerIosMessagingSenderId,
        projectId: customerIosProjectId,
        storageBucket: customerIosStorageBucket,
        iosBundleId: customerIosBundleId,
      );
    }
    throw UnsupportedError('Unsupported platform');
  }

  /// Get Firebase options for Rider App
  static FirebaseOptions get riderOptions {
    if (Platform.isAndroid) {
      return const FirebaseOptions(
        apiKey: riderAndroidApiKey,
        appId: riderAndroidAppId,
        messagingSenderId: riderAndroidMessagingSenderId,
        projectId: riderAndroidProjectId,
        storageBucket: riderAndroidStorageBucket,
      );
    } else if (Platform.isIOS) {
      return const FirebaseOptions(
        apiKey: riderIosApiKey,
        appId: riderIosAppId,
        messagingSenderId: riderIosMessagingSenderId,
        projectId: riderIosProjectId,
        storageBucket: riderIosStorageBucket,
        iosBundleId: riderIosBundleId,
      );
    }
    throw UnsupportedError('Unsupported platform');
  }
}

/// Firebase initialization helper
class FirebaseInitializer {
  static bool _initialized = false;

  /// Initialize Firebase for Customer App
  static Future<void> initializeCustomerApp() async {
    if (_initialized) return;

    try {
      await Firebase.initializeApp(
        options: FirebaseConfig.customerOptions,
      );
      _initialized = true;
      debugPrint('Firebase initialized for Customer App');
    } catch (e) {
      debugPrint('Firebase initialization error: $e');
      rethrow;
    }
  }

  /// Initialize Firebase for Rider App
  static Future<void> initializeRiderApp() async {
    if (_initialized) return;

    try {
      await Firebase.initializeApp(
        options: FirebaseConfig.riderOptions,
      );
      _initialized = true;
      debugPrint('Firebase initialized for Rider App');
    } catch (e) {
      debugPrint('Firebase initialization error: $e');
      rethrow;
    }
  }
}

/// Firebase Cloud Messaging topics
class FCMTopics {
  // Global topics
  static const String allUsers = 'all_users';
  static const String promotions = 'promotions';
  static const String systemAlerts = 'system_alerts';

  // Customer-specific topics
  static const String customerAll = 'customer_all';
  static const String customerPromotions = 'customer_promotions';
  static const String customerDeals = 'customer_deals';

  // Rider-specific topics
  static const String riderAll = 'rider_all';
  static const String riderAnnouncements = 'rider_announcements';
  static const String riderEmergency = 'rider_emergency';

  // Zone-based topics (format: zone_{zoneId})
  static String zone(String zoneId) => 'zone_$zoneId';

  // User-specific topics (format: user_{userId})
  static String user(String userId) => 'user_$userId';

  // Rider-specific topics (format: rider_{riderId})
  static String rider(String riderId) => 'rider_$riderId';

  // Order-specific topics (format: order_{orderId})
  static String order(String orderId) => 'order_$orderId';
}

/// Notification payload types
class NotificationTypes {
  // Order notifications
  static const String orderConfirmed = 'order_confirmed';
  static const String orderPreparing = 'order_preparing';
  static const String orderReady = 'order_ready';
  static const String orderPickedUp = 'order_picked_up';
  static const String orderDelivered = 'order_delivered';
  static const String orderCancelled = 'order_cancelled';

  // Delivery notifications
  static const String riderAssigned = 'rider_assigned';
  static const String riderNearby = 'rider_nearby';
  static const String riderArrived = 'rider_arrived';
  static const String deliveryComplete = 'delivery_complete';

  // Rider notifications
  static const String newOrderRequest = 'new_order_request';
  static const String orderReassigned = 'order_reassigned';
  static const String customerMessage = 'customer_message';
  static const String paymentReceived = 'payment_received';
  static const String bonusEarned = 'bonus_earned';
  static const String documentExpiring = 'document_expiring';

  // Promotion notifications
  static const String newPromotion = 'new_promotion';
  static const String flashSale = 'flash_sale';
  static const String personalOffer = 'personal_offer';

  // System notifications
  static const String appUpdate = 'app_update';
  static const String maintenanceScheduled = 'maintenance_scheduled';
  static const String policyUpdate = 'policy_update';
}
