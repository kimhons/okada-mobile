import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:shared_preferences/shared_preferences.dart';

/// Background message handler - must be a top-level function
@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  debugPrint('Handling background message: ${message.messageId}');
  
  // Store notification for later processing
  final prefs = await SharedPreferences.getInstance();
  final pendingNotifications = prefs.getStringList('pending_notifications') ?? [];
  pendingNotifications.add(jsonEncode(message.toMap()));
  await prefs.setStringList('pending_notifications', pendingNotifications);
}

/// Notification channel types for the Okada platform
enum NotificationChannel {
  orders('orders', 'Order Updates', 'Notifications about your orders'),
  deliveries('deliveries', 'Delivery Updates', 'Real-time delivery tracking'),
  promotions('promotions', 'Promotions & Offers', 'Special deals and discounts'),
  chat('chat', 'Messages', 'Chat messages from riders/customers'),
  earnings('earnings', 'Earnings', 'Payment and earnings notifications'),
  system('system', 'System', 'Important system notifications');

  final String id;
  final String name;
  final String description;

  const NotificationChannel(this.id, this.name, this.description);
}

/// Notification payload model
class NotificationPayload {
  final String? title;
  final String? body;
  final String? imageUrl;
  final Map<String, dynamic> data;
  final NotificationChannel channel;
  final DateTime receivedAt;

  NotificationPayload({
    this.title,
    this.body,
    this.imageUrl,
    required this.data,
    required this.channel,
    required this.receivedAt,
  });

  factory NotificationPayload.fromRemoteMessage(RemoteMessage message) {
    final channelId = message.data['channel'] ?? 'system';
    final channel = NotificationChannel.values.firstWhere(
      (c) => c.id == channelId,
      orElse: () => NotificationChannel.system,
    );

    return NotificationPayload(
      title: message.notification?.title,
      body: message.notification?.body,
      imageUrl: message.notification?.android?.imageUrl ?? 
                message.notification?.apple?.imageUrl,
      data: message.data,
      channel: channel,
      receivedAt: DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    'title': title,
    'body': body,
    'imageUrl': imageUrl,
    'data': data,
    'channel': channel.id,
    'receivedAt': receivedAt.toIso8601String(),
  };
}

/// Firebase Cloud Messaging Service
class FCMService {
  static final FCMService _instance = FCMService._internal();
  factory FCMService() => _instance;
  FCMService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = 
      FlutterLocalNotificationsPlugin();

  final StreamController<NotificationPayload> _notificationController = 
      StreamController<NotificationPayload>.broadcast();

  Stream<NotificationPayload> get onNotification => _notificationController.stream;

  String? _fcmToken;
  String? get fcmToken => _fcmToken;

  bool _initialized = false;

  /// Initialize FCM service
  Future<void> initialize() async {
    if (_initialized) return;

    // Initialize Firebase
    await Firebase.initializeApp();

    // Request permissions
    await _requestPermissions();

    // Initialize local notifications
    await _initializeLocalNotifications();

    // Create notification channels (Android)
    await _createNotificationChannels();

    // Get FCM token
    _fcmToken = await _messaging.getToken();
    debugPrint('FCM Token: $_fcmToken');

    // Listen for token refresh
    _messaging.onTokenRefresh.listen((token) {
      _fcmToken = token;
      _onTokenRefresh(token);
    });

    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // Handle notification tap when app is in background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // Check for initial notification (app opened from terminated state)
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }

    // Process any pending background notifications
    await _processPendingNotifications();

    _initialized = true;
    debugPrint('FCM Service initialized');
  }

  /// Request notification permissions
  Future<void> _requestPermissions() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );

    debugPrint('Notification permission status: ${settings.authorizationStatus}');

    // For iOS, also request provisional authorization for quiet notifications
    if (Platform.isIOS) {
      await _messaging.setForegroundNotificationPresentationOptions(
        alert: true,
        badge: true,
        sound: true,
      );
    }
  }

  /// Initialize local notifications plugin
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false,
      requestBadgePermission: false,
      requestSoundPermission: false,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onLocalNotificationTap,
    );
  }

  /// Create Android notification channels
  Future<void> _createNotificationChannels() async {
    if (!Platform.isAndroid) return;

    final androidPlugin = _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>();

    if (androidPlugin == null) return;

    for (final channel in NotificationChannel.values) {
      await androidPlugin.createNotificationChannel(
        AndroidNotificationChannel(
          channel.id,
          channel.name,
          description: channel.description,
          importance: _getImportance(channel),
          enableVibration: true,
          playSound: true,
        ),
      );
    }
  }

  Importance _getImportance(NotificationChannel channel) {
    switch (channel) {
      case NotificationChannel.orders:
      case NotificationChannel.deliveries:
      case NotificationChannel.chat:
        return Importance.high;
      case NotificationChannel.earnings:
        return Importance.defaultImportance;
      case NotificationChannel.promotions:
        return Importance.low;
      case NotificationChannel.system:
        return Importance.defaultImportance;
    }
  }

  /// Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message received: ${message.messageId}');

    final payload = NotificationPayload.fromRemoteMessage(message);
    _notificationController.add(payload);

    // Show local notification
    _showLocalNotification(payload);
  }

  /// Handle notification tap
  void _handleNotificationTap(RemoteMessage message) {
    debugPrint('Notification tapped: ${message.messageId}');

    final payload = NotificationPayload.fromRemoteMessage(message);
    _notificationController.add(payload);

    // Navigate based on notification data
    _handleNavigation(payload);
  }

  /// Handle local notification tap
  void _onLocalNotificationTap(NotificationResponse response) {
    if (response.payload == null) return;

    try {
      final data = jsonDecode(response.payload!) as Map<String, dynamic>;
      final channelId = data['channel'] ?? 'system';
      final channel = NotificationChannel.values.firstWhere(
        (c) => c.id == channelId,
        orElse: () => NotificationChannel.system,
      );

      final payload = NotificationPayload(
        title: data['title'],
        body: data['body'],
        data: data,
        channel: channel,
        receivedAt: DateTime.now(),
      );

      _handleNavigation(payload);
    } catch (e) {
      debugPrint('Error parsing notification payload: $e');
    }
  }

  /// Show local notification
  Future<void> _showLocalNotification(NotificationPayload payload) async {
    final androidDetails = AndroidNotificationDetails(
      payload.channel.id,
      payload.channel.name,
      channelDescription: payload.channel.description,
      importance: _getImportance(payload.channel),
      priority: Priority.high,
      styleInformation: payload.body != null && payload.body!.length > 50
          ? BigTextStyleInformation(payload.body!)
          : null,
    );

    const iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );

    final details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      payload.title,
      payload.body,
      details,
      payload: jsonEncode(payload.toJson()),
    );
  }

  /// Handle navigation based on notification type
  void _handleNavigation(NotificationPayload payload) {
    final data = payload.data;
    final type = data['type'] as String?;
    final id = data['id'] as String?;

    switch (type) {
      case 'order_update':
        // Navigate to order details
        debugPrint('Navigate to order: $id');
        break;
      case 'delivery_update':
        // Navigate to tracking screen
        debugPrint('Navigate to tracking: $id');
        break;
      case 'chat_message':
        // Navigate to chat screen
        debugPrint('Navigate to chat: $id');
        break;
      case 'promotion':
        // Navigate to promotion details
        debugPrint('Navigate to promotion: $id');
        break;
      case 'earnings':
        // Navigate to earnings screen
        debugPrint('Navigate to earnings');
        break;
      default:
        debugPrint('Unknown notification type: $type');
    }
  }

  /// Token refresh handler
  void _onTokenRefresh(String token) {
    debugPrint('FCM Token refreshed: $token');
    // TODO: Send new token to backend
  }

  /// Process pending background notifications
  Future<void> _processPendingNotifications() async {
    final prefs = await SharedPreferences.getInstance();
    final pending = prefs.getStringList('pending_notifications') ?? [];

    for (final json in pending) {
      try {
        final map = jsonDecode(json) as Map<String, dynamic>;
        final message = RemoteMessage.fromMap(map);
        final payload = NotificationPayload.fromRemoteMessage(message);
        _notificationController.add(payload);
      } catch (e) {
        debugPrint('Error processing pending notification: $e');
      }
    }

    await prefs.remove('pending_notifications');
  }

  /// Subscribe to a topic
  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
    debugPrint('Subscribed to topic: $topic');
  }

  /// Unsubscribe from a topic
  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
    debugPrint('Unsubscribed from topic: $topic');
  }

  /// Get notification settings
  Future<NotificationSettings> getNotificationSettings() async {
    return await _messaging.getNotificationSettings();
  }

  /// Check if notifications are enabled
  Future<bool> areNotificationsEnabled() async {
    final settings = await getNotificationSettings();
    return settings.authorizationStatus == AuthorizationStatus.authorized ||
           settings.authorizationStatus == AuthorizationStatus.provisional;
  }

  /// Dispose resources
  void dispose() {
    _notificationController.close();
  }
}

/// Notification preferences manager
class NotificationPreferences {
  static const String _prefsKey = 'notification_preferences';

  final SharedPreferences _prefs;

  NotificationPreferences(this._prefs);

  /// Get enabled channels
  Set<NotificationChannel> getEnabledChannels() {
    final json = _prefs.getString(_prefsKey);
    if (json == null) {
      // All channels enabled by default
      return NotificationChannel.values.toSet();
    }

    final list = jsonDecode(json) as List;
    return list
        .map((id) => NotificationChannel.values.firstWhere(
              (c) => c.id == id,
              orElse: () => NotificationChannel.system,
            ))
        .toSet();
  }

  /// Set enabled channels
  Future<void> setEnabledChannels(Set<NotificationChannel> channels) async {
    final list = channels.map((c) => c.id).toList();
    await _prefs.setString(_prefsKey, jsonEncode(list));
  }

  /// Enable a channel
  Future<void> enableChannel(NotificationChannel channel) async {
    final channels = getEnabledChannels();
    channels.add(channel);
    await setEnabledChannels(channels);
  }

  /// Disable a channel
  Future<void> disableChannel(NotificationChannel channel) async {
    final channels = getEnabledChannels();
    channels.remove(channel);
    await setEnabledChannels(channels);
  }

  /// Check if a channel is enabled
  bool isChannelEnabled(NotificationChannel channel) {
    return getEnabledChannels().contains(channel);
  }
}
