import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:audioplayers/audioplayers.dart';
import 'package:vibration/vibration.dart';

// Import from shared package
import 'package:okada_shared/services/fcm_service.dart';

/// Rider App specific notification handler
class RiderNotificationHandler {
  static final RiderNotificationHandler _instance = 
      RiderNotificationHandler._internal();
  factory RiderNotificationHandler() => _instance;
  RiderNotificationHandler._internal();

  final FCMService _fcmService = FCMService();
  final AudioPlayer _audioPlayer = AudioPlayer();
  
  StreamSubscription<NotificationPayload>? _subscription;
  BuildContext? _context;
  
  // Callback for new order requests
  Function(Map<String, dynamic>)? onNewOrderRequest;
  
  // Callback for order updates
  Function(String orderId, String status)? onOrderStatusUpdate;

  /// Initialize notification handler
  Future<void> initialize() async {
    await _fcmService.initialize();

    // Subscribe to rider-specific topics
    await _fcmService.subscribeToTopic('rider_all');
    await _fcmService.subscribeToTopic('rider_announcements');

    // Listen for notifications
    _subscription = _fcmService.onNotification.listen(_handleNotification);
  }

  /// Set navigation context
  void setContext(BuildContext context) {
    _context = context;
  }

  /// Handle incoming notification
  void _handleNotification(NotificationPayload payload) {
    debugPrint('Rider notification received: ${payload.title}');

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
      case NotificationChannel.earnings:
        _handleEarningsNotification(payload);
        break;
      case NotificationChannel.system:
        _handleSystemNotification(payload);
        break;
      default:
        debugPrint('Unhandled notification channel: ${payload.channel}');
    }
  }

  /// Handle order-related notifications (new orders, cancellations, etc.)
  void _handleOrderNotification(NotificationPayload payload) {
    final type = payload.data['type'] as String?;
    final orderId = payload.data['orderId'] as String?;

    switch (type) {
      case 'new_order_request':
        _handleNewOrderRequest(payload);
        break;
      case 'order_cancelled':
        _handleOrderCancelled(payload);
        break;
      case 'order_reassigned':
        _handleOrderReassigned(payload);
        break;
      default:
        _showInAppNotification(
          title: payload.title ?? 'Order Update',
          message: payload.body ?? 'You have an order update',
          icon: Icons.shopping_bag,
          onTap: orderId != null ? () => _navigateToOrder(orderId) : null,
        );
    }
  }

  /// Handle new order request with urgent notification
  void _handleNewOrderRequest(NotificationPayload payload) {
    // Play alert sound
    _playOrderAlert();
    
    // Vibrate device
    _vibrateDevice();

    final orderData = {
      'orderId': payload.data['orderId'],
      'pickupAddress': payload.data['pickupAddress'],
      'deliveryAddress': payload.data['deliveryAddress'],
      'distance': payload.data['distance'],
      'estimatedEarnings': payload.data['estimatedEarnings'],
      'expiresAt': payload.data['expiresAt'],
      'customerName': payload.data['customerName'],
      'itemCount': payload.data['itemCount'],
    };

    // Trigger callback for order request modal
    onNewOrderRequest?.call(orderData);

    // Show full-screen order request
    _showOrderRequestOverlay(orderData);
  }

  /// Handle order cancelled notification
  void _handleOrderCancelled(NotificationPayload payload) {
    final orderId = payload.data['orderId'] as String?;
    final reason = payload.data['reason'] as String?;

    _showInAppNotification(
      title: 'Order Cancelled',
      message: reason ?? 'The customer has cancelled this order',
      icon: Icons.cancel,
      backgroundColor: Colors.red,
      onTap: orderId != null ? () => _navigateToOrder(orderId) : null,
    );

    onOrderStatusUpdate?.call(orderId ?? '', 'cancelled');
  }

  /// Handle order reassigned notification
  void _handleOrderReassigned(NotificationPayload payload) {
    final orderId = payload.data['orderId'] as String?;

    _showInAppNotification(
      title: 'Order Reassigned',
      message: 'This order has been reassigned to another rider',
      icon: Icons.swap_horiz,
      backgroundColor: Colors.orange,
    );

    onOrderStatusUpdate?.call(orderId ?? '', 'reassigned');
  }

  /// Handle delivery-related notifications
  void _handleDeliveryNotification(NotificationPayload payload) {
    final orderId = payload.data['orderId'] as String?;
    final type = payload.data['type'] as String?;

    switch (type) {
      case 'customer_nearby':
        _showInAppNotification(
          title: 'Customer Nearby',
          message: 'The customer is waiting at the delivery location',
          icon: Icons.person_pin_circle,
          onTap: orderId != null ? () => _navigateToNavigation(orderId) : null,
        );
        break;
      case 'address_updated':
        _showInAppNotification(
          title: 'Address Updated',
          message: payload.body ?? 'The delivery address has been updated',
          icon: Icons.location_on,
          backgroundColor: Colors.orange,
          onTap: orderId != null ? () => _navigateToNavigation(orderId) : null,
        );
        _vibrateDevice();
        break;
      default:
        _showInAppNotification(
          title: payload.title ?? 'Delivery Update',
          message: payload.body ?? 'You have a delivery update',
          icon: Icons.delivery_dining,
          onTap: orderId != null ? () => _navigateToOrder(orderId) : null,
        );
    }
  }

  /// Handle chat notifications
  void _handleChatNotification(NotificationPayload payload) {
    final chatId = payload.data['chatId'] as String?;
    final senderName = payload.data['senderName'] as String?;

    _showInAppNotification(
      title: senderName ?? 'New Message',
      message: payload.body ?? 'You have a new message',
      icon: Icons.chat_bubble,
      onTap: chatId != null ? () => _navigateToChat(chatId) : null,
    );
  }

  /// Handle earnings notifications
  void _handleEarningsNotification(NotificationPayload payload) {
    final type = payload.data['type'] as String?;
    final amount = payload.data['amount'] as num?;

    String title = payload.title ?? 'Earnings Update';
    IconData icon = Icons.account_balance_wallet;
    Color color = Colors.green;

    switch (type) {
      case 'payment_received':
        title = 'Payment Received';
        icon = Icons.payments;
        break;
      case 'bonus_earned':
        title = 'Bonus Earned!';
        icon = Icons.star;
        color = Colors.amber;
        break;
      case 'tip_received':
        title = 'Tip Received';
        icon = Icons.volunteer_activism;
        break;
      case 'payout_processed':
        title = 'Payout Processed';
        icon = Icons.account_balance;
        break;
    }

    _showInAppNotification(
      title: title,
      message: amount != null 
          ? '${payload.body} - ${amount.toStringAsFixed(0)} FCFA'
          : payload.body ?? 'Check your earnings',
      icon: icon,
      backgroundColor: color,
      onTap: () => _navigateToEarnings(),
    );
  }

  /// Handle system notifications
  void _handleSystemNotification(NotificationPayload payload) {
    final type = payload.data['type'] as String?;

    switch (type) {
      case 'document_expiring':
        _showInAppNotification(
          title: 'Document Expiring',
          message: payload.body ?? 'One of your documents is expiring soon',
          icon: Icons.warning,
          backgroundColor: Colors.orange,
          onTap: () => _navigateToDocuments(),
        );
        break;
      case 'account_update':
        _showInAppNotification(
          title: 'Account Update',
          message: payload.body ?? 'Your account has been updated',
          icon: Icons.person,
          onTap: () => _navigateToProfile(),
        );
        break;
      case 'announcement':
        _showInAppNotification(
          title: payload.title ?? 'Announcement',
          message: payload.body ?? 'You have a new announcement',
          icon: Icons.campaign,
          onTap: () => _navigateToAnnouncements(),
        );
        break;
      default:
        _showInAppNotification(
          title: payload.title ?? 'System Notification',
          message: payload.body ?? 'You have a new notification',
          icon: Icons.info,
        );
    }
  }

  /// Play order alert sound
  Future<void> _playOrderAlert() async {
    try {
      await _audioPlayer.play(AssetSource('sounds/order_alert.mp3'));
    } catch (e) {
      debugPrint('Error playing alert sound: $e');
    }
  }

  /// Vibrate device
  Future<void> _vibrateDevice() async {
    try {
      final hasVibrator = await Vibration.hasVibrator() ?? false;
      if (hasVibrator) {
        Vibration.vibrate(pattern: [0, 500, 200, 500]);
      }
    } catch (e) {
      debugPrint('Error vibrating device: $e');
    }
  }

  /// Show order request overlay
  void _showOrderRequestOverlay(Map<String, dynamic> orderData) {
    if (_context == null) return;

    showModalBottomSheet(
      context: _context!,
      isDismissible: false,
      enableDrag: false,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _OrderRequestModal(
        orderData: orderData,
        onAccept: () {
          Navigator.pop(context);
          _acceptOrder(orderData['orderId'] as String);
        },
        onReject: () {
          Navigator.pop(context);
          _rejectOrder(orderData['orderId'] as String);
        },
      ),
    );
  }

  /// Accept order
  void _acceptOrder(String orderId) {
    debugPrint('Accepting order: $orderId');
    // TODO: Call API to accept order
    _navigateToOrder(orderId);
  }

  /// Reject order
  void _rejectOrder(String orderId) {
    debugPrint('Rejecting order: $orderId');
    // TODO: Call API to reject order
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

  // Navigation methods
  void _navigateToOrder(String orderId) {
    if (_context == null) return;
    GoRouter.of(_context!).push('/orders/$orderId');
  }

  void _navigateToNavigation(String orderId) {
    if (_context == null) return;
    GoRouter.of(_context!).push('/navigation/$orderId');
  }

  void _navigateToChat(String chatId) {
    if (_context == null) return;
    GoRouter.of(_context!).push('/chat/$chatId');
  }

  void _navigateToEarnings() {
    if (_context == null) return;
    GoRouter.of(_context!).push('/earnings');
  }

  void _navigateToDocuments() {
    if (_context == null) return;
    GoRouter.of(_context!).push('/documents');
  }

  void _navigateToProfile() {
    if (_context == null) return;
    GoRouter.of(_context!).push('/profile');
  }

  void _navigateToAnnouncements() {
    if (_context == null) return;
    GoRouter.of(_context!).push('/announcements');
  }

  /// Subscribe to zone-specific notifications
  Future<void> subscribeToZone(String zoneId) async {
    await _fcmService.subscribeToTopic('zone_$zoneId');
  }

  /// Unsubscribe from zone-specific notifications
  Future<void> unsubscribeFromZone(String zoneId) async {
    await _fcmService.unsubscribeFromTopic('zone_$zoneId');
  }

  /// Subscribe to rider-specific notifications
  Future<void> subscribeToRider(String riderId) async {
    await _fcmService.subscribeToTopic('rider_$riderId');
  }

  /// Get FCM token for backend registration
  String? get fcmToken => _fcmService.fcmToken;

  /// Dispose resources
  void dispose() {
    _subscription?.cancel();
    _audioPlayer.dispose();
    _fcmService.dispose();
  }
}

/// Order request modal widget
class _OrderRequestModal extends StatefulWidget {
  final Map<String, dynamic> orderData;
  final VoidCallback onAccept;
  final VoidCallback onReject;

  const _OrderRequestModal({
    required this.orderData,
    required this.onAccept,
    required this.onReject,
  });

  @override
  State<_OrderRequestModal> createState() => _OrderRequestModalState();
}

class _OrderRequestModalState extends State<_OrderRequestModal> {
  int _remainingSeconds = 30;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _startTimer();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        _remainingSeconds--;
      });
      if (_remainingSeconds <= 0) {
        timer.cancel();
        widget.onReject();
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(24),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Timer bar
          Container(
            height: 6,
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey[200],
              borderRadius: BorderRadius.circular(3),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: _remainingSeconds / 30,
              child: Container(
                decoration: BoxDecoration(
                  color: _remainingSeconds > 10 ? Colors.green : Colors.red,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
          ),
          
          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.delivery_dining,
                    color: Colors.green,
                    size: 32,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'New Order Request',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        '${_remainingSeconds}s remaining',
                        style: TextStyle(
                          color: _remainingSeconds > 10 
                              ? Colors.grey 
                              : Colors.red,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '${widget.orderData['estimatedEarnings']} FCFA',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
          ),

          const Divider(height: 32),

          // Order details
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: [
                _buildDetailRow(
                  icon: Icons.store,
                  label: 'Pickup',
                  value: widget.orderData['pickupAddress'] ?? 'Unknown',
                ),
                const SizedBox(height: 12),
                _buildDetailRow(
                  icon: Icons.location_on,
                  label: 'Delivery',
                  value: widget.orderData['deliveryAddress'] ?? 'Unknown',
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildInfoChip(
                        icon: Icons.straighten,
                        value: '${widget.orderData['distance'] ?? '?'} km',
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: _buildInfoChip(
                        icon: Icons.shopping_bag,
                        value: '${widget.orderData['itemCount'] ?? '?'} items',
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Action buttons
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: widget.onReject,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      side: const BorderSide(color: Colors.red),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Reject',
                      style: TextStyle(
                        color: Colors.red,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: widget.onAccept,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: const Text(
                      'Accept Order',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDetailRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      children: [
        Icon(icon, size: 20, color: Colors.grey),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(
            color: Colors.grey,
            fontWeight: FontWeight.w500,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(fontWeight: FontWeight.w500),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }

  Widget _buildInfoChip({
    required IconData icon,
    required String value,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 12),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 6),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w500,
              color: Colors.grey[800],
            ),
          ),
        ],
      ),
    );
  }
}

/// In-app notification banner widget (same as customer app)
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
