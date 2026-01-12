import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

// Import from shared package
import 'package:okada_shared/services/fcm_service.dart';

/// Customer App specific notification handler
class CustomerNotificationHandler {
  static final CustomerNotificationHandler _instance = 
      CustomerNotificationHandler._internal();
  factory CustomerNotificationHandler() => _instance;
  CustomerNotificationHandler._internal();

  final FCMService _fcmService = FCMService();
  StreamSubscription<NotificationPayload>? _subscription;
  BuildContext? _context;

  /// Initialize notification handler
  Future<void> initialize() async {
    await _fcmService.initialize();

    // Subscribe to customer-specific topics
    await _fcmService.subscribeToTopic('customer_all');
    await _fcmService.subscribeToTopic('promotions');

    // Listen for notifications
    _subscription = _fcmService.onNotification.listen(_handleNotification);
  }

  /// Set navigation context
  void setContext(BuildContext context) {
    _context = context;
  }

  /// Handle incoming notification
  void _handleNotification(NotificationPayload payload) {
    debugPrint('Customer notification received: ${payload.title}');

    switch (payload.channel) {
      case NotificationChannel.orders:
        _handleOrderNotification(payload);
        break;
      case NotificationChannel.deliveries:
        _handleDeliveryNotification(payload);
        break;
      case NotificationChannel.chat:
        _handleChatNotification(payload);
        break;
      case NotificationChannel.promotions:
        _handlePromotionNotification(payload);
        break;
      default:
        debugPrint('Unhandled notification channel: ${payload.channel}');
    }
  }

  /// Handle order-related notifications
  void _handleOrderNotification(NotificationPayload payload) {
    final orderId = payload.data['orderId'] as String?;
    final status = payload.data['status'] as String?;

    if (orderId == null) return;

    // Show in-app notification
    _showInAppNotification(
      title: payload.title ?? 'Order Update',
      message: payload.body ?? 'Your order status has changed',
      icon: Icons.shopping_bag,
      onTap: () => _navigateToOrder(orderId),
    );

    // Update order state if provider is available
    debugPrint('Order $orderId status: $status');
  }

  /// Handle delivery tracking notifications
  void _handleDeliveryNotification(NotificationPayload payload) {
    final orderId = payload.data['orderId'] as String?;
    final riderLat = payload.data['riderLat'] as double?;
    final riderLng = payload.data['riderLng'] as double?;
    final eta = payload.data['eta'] as int?;

    if (orderId == null) return;

    // Show in-app notification for significant updates
    final updateType = payload.data['updateType'] as String?;
    if (updateType == 'rider_assigned' || 
        updateType == 'picked_up' || 
        updateType == 'nearby') {
      _showInAppNotification(
        title: payload.title ?? 'Delivery Update',
        message: payload.body ?? 'Your delivery is on the way',
        icon: Icons.delivery_dining,
        onTap: () => _navigateToTracking(orderId),
      );
    }

    // Update tracking state
    debugPrint('Delivery update - Order: $orderId, ETA: $eta minutes');
  }

  /// Handle chat notifications
  void _handleChatNotification(NotificationPayload payload) {
    final chatId = payload.data['chatId'] as String?;
    final senderId = payload.data['senderId'] as String?;
    final senderName = payload.data['senderName'] as String?;

    if (chatId == null) return;

    _showInAppNotification(
      title: senderName ?? 'New Message',
      message: payload.body ?? 'You have a new message',
      icon: Icons.chat_bubble,
      onTap: () => _navigateToChat(chatId),
    );
  }

  /// Handle promotion notifications
  void _handlePromotionNotification(NotificationPayload payload) {
    final promoId = payload.data['promoId'] as String?;
    final promoCode = payload.data['promoCode'] as String?;

    _showInAppNotification(
      title: payload.title ?? 'Special Offer!',
      message: payload.body ?? 'Check out this deal',
      icon: Icons.local_offer,
      backgroundColor: Colors.orange,
      onTap: () => _navigateToPromotion(promoId),
    );
  }

  /// Show in-app notification banner
  void _showInAppNotification({
    required String title,
    required String message,
    required IconData icon,
    Color? backgroundColor,
    VoidCallback? onTap,
  }) {
    if (_context == null) return;

    final overlay = Overlay.of(_context!);
    
    late OverlayEntry entry;
    entry = OverlayEntry(
      builder: (context) => _InAppNotificationBanner(
        title: title,
        message: message,
        icon: icon,
        backgroundColor: backgroundColor ?? Theme.of(context).primaryColor,
        onTap: () {
          entry.remove();
          onTap?.call();
        },
        onDismiss: () => entry.remove(),
      ),
    );

    overlay.insert(entry);

    // Auto-dismiss after 5 seconds
    Future.delayed(const Duration(seconds: 5), () {
      if (entry.mounted) {
        entry.remove();
      }
    });
  }

  /// Navigate to order details
  void _navigateToOrder(String orderId) {
    if (_context == null) return;
    GoRouter.of(_context!).push('/orders/$orderId');
  }

  /// Navigate to tracking screen
  void _navigateToTracking(String orderId) {
    if (_context == null) return;
    GoRouter.of(_context!).push('/tracking/$orderId');
  }

  /// Navigate to chat screen
  void _navigateToChat(String chatId) {
    if (_context == null) return;
    GoRouter.of(_context!).push('/chat/$chatId');
  }

  /// Navigate to promotion
  void _navigateToPromotion(String? promoId) {
    if (_context == null) return;
    if (promoId != null) {
      GoRouter.of(_context!).push('/promotions/$promoId');
    } else {
      GoRouter.of(_context!).push('/promotions');
    }
  }

  /// Subscribe to user-specific notifications
  Future<void> subscribeToUser(String userId) async {
    await _fcmService.subscribeToTopic('user_$userId');
  }

  /// Unsubscribe from user-specific notifications
  Future<void> unsubscribeFromUser(String userId) async {
    await _fcmService.unsubscribeFromTopic('user_$userId');
  }

  /// Get FCM token for backend registration
  String? get fcmToken => _fcmService.fcmToken;

  /// Dispose resources
  void dispose() {
    _subscription?.cancel();
    _fcmService.dispose();
  }
}

/// In-app notification banner widget
class _InAppNotificationBanner extends StatefulWidget {
  final String title;
  final String message;
  final IconData icon;
  final Color backgroundColor;
  final VoidCallback? onTap;
  final VoidCallback? onDismiss;

  const _InAppNotificationBanner({
    required this.title,
    required this.message,
    required this.icon,
    required this.backgroundColor,
    this.onTap,
    this.onDismiss,
  });

  @override
  State<_InAppNotificationBanner> createState() => _InAppNotificationBannerState();
}

class _InAppNotificationBannerState extends State<_InAppNotificationBanner>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, -1),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(_controller);

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _dismiss() {
    _controller.reverse().then((_) {
      widget.onDismiss?.call();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Positioned(
      top: MediaQuery.of(context).padding.top + 8,
      left: 16,
      right: 16,
      child: SlideTransition(
        position: _slideAnimation,
        child: FadeTransition(
          opacity: _fadeAnimation,
          child: GestureDetector(
            onTap: widget.onTap,
            onVerticalDragEnd: (details) {
              if (details.velocity.pixelsPerSecond.dy < 0) {
                _dismiss();
              }
            },
            child: Material(
              elevation: 8,
              borderRadius: BorderRadius.circular(12),
              color: widget.backgroundColor,
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(
                        widget.icon,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            widget.title,
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            widget.message,
                            style: TextStyle(
                              color: Colors.white.withOpacity(0.9),
                              fontSize: 12,
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close, color: Colors.white),
                      onPressed: _dismiss,
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Notification settings screen
class NotificationSettingsScreen extends ConsumerStatefulWidget {
  const NotificationSettingsScreen({super.key});

  @override
  ConsumerState<NotificationSettingsScreen> createState() => 
      _NotificationSettingsScreenState();
}

class _NotificationSettingsScreenState 
    extends ConsumerState<NotificationSettingsScreen> {
  late NotificationPreferences _prefs;
  Set<NotificationChannel> _enabledChannels = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final prefs = await SharedPreferences.getInstance();
    _prefs = NotificationPreferences(prefs);
    setState(() {
      _enabledChannels = _prefs.getEnabledChannels();
      _loading = false;
    });
  }

  Future<void> _toggleChannel(NotificationChannel channel, bool enabled) async {
    setState(() {
      if (enabled) {
        _enabledChannels.add(channel);
      } else {
        _enabledChannels.remove(channel);
      }
    });
    await _prefs.setEnabledChannels(_enabledChannels);
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Notification Settings'),
      ),
      body: ListView(
        children: [
          _buildSection(
            title: 'Order Notifications',
            children: [
              _buildToggle(
                channel: NotificationChannel.orders,
                title: 'Order Updates',
                subtitle: 'Get notified about order confirmations and status changes',
              ),
              _buildToggle(
                channel: NotificationChannel.deliveries,
                title: 'Delivery Tracking',
                subtitle: 'Real-time updates on your delivery status',
              ),
            ],
          ),
          _buildSection(
            title: 'Communication',
            children: [
              _buildToggle(
                channel: NotificationChannel.chat,
                title: 'Messages',
                subtitle: 'Chat messages from riders',
              ),
            ],
          ),
          _buildSection(
            title: 'Marketing',
            children: [
              _buildToggle(
                channel: NotificationChannel.promotions,
                title: 'Promotions & Offers',
                subtitle: 'Special deals, discounts, and exclusive offers',
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSection({
    required String title,
    required List<Widget> children,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 24, 16, 8),
          child: Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: Theme.of(context).primaryColor,
            ),
          ),
        ),
        ...children,
        const Divider(),
      ],
    );
  }

  Widget _buildToggle({
    required NotificationChannel channel,
    required String title,
    required String subtitle,
  }) {
    return SwitchListTile(
      title: Text(title),
      subtitle: Text(subtitle),
      value: _enabledChannels.contains(channel),
      onChanged: (value) => _toggleChannel(channel, value),
    );
  }
}

// Required import for SharedPreferences
import 'package:shared_preferences/shared_preferences.dart';
