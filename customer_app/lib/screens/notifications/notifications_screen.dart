import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/ui/theme/colors.dart';
import 'package:intl/intl.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Mock notifications - will be replaced with provider data
    final notifications = [
      {
        'id': '1',
        'type': 'order',
        'title': 'Order Delivered',
        'message': 'Your order #12347 has been delivered successfully',
        'time': DateTime.now().subtract(const Duration(hours: 2)),
        'isRead': false,
      },
      {
        'id': '2',
        'type': 'promotion',
        'title': '50% Off on Fresh Vegetables',
        'message': 'Get 50% discount on all fresh vegetables this weekend',
        'time': DateTime.now().subtract(const Duration(hours: 5)),
        'isRead': false,
      },
      {
        'id': '3',
        'type': 'order',
        'title': 'Order Out for Delivery',
        'message': 'Your order #12346 is out for delivery',
        'time': DateTime.now().subtract(const Duration(days: 1)),
        'isRead': true,
      },
      {
        'id': '4',
        'type': 'product',
        'title': 'New Products Available',
        'message': 'Check out our new collection of organic fruits',
        'time': DateTime.now().subtract(const Duration(days: 2)),
        'isRead': true,
      },
      {
        'id': '5',
        'type': 'order',
        'title': 'Order Confirmed',
        'message': 'Your order #12345 has been confirmed',
        'time': DateTime.now().subtract(const Duration(days: 3)),
        'isRead': true,
      },
    ];

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.black),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Notifications',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              // TODO: Mark all as read
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('All notifications marked as read')),
              );
            },
            child: const Text(
              'Mark all read',
              style: TextStyle(
                color: OkadaColors.primary,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
      body: notifications.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                return _buildNotificationItem(context, notifications[index]);
              },
            ),
    );
  }

  Widget _buildNotificationItem(
      BuildContext context, Map<String, dynamic> notification) {
    final isRead = notification['isRead'] as bool;
    final type = notification['type'] as String;
    final time = notification['time'] as DateTime;

    return InkWell(
      onTap: () {
        Navigator.pushNamed(
          context,
          '/notifications/details',
          arguments: notification,
        );
      },
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isRead ? Colors.white : OkadaColors.primary.withOpacity(0.05),
          border: Border(
            bottom: BorderSide(color: Colors.grey[200]!),
          ),
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: _getIconBackgroundColor(type),
                shape: BoxShape.circle,
              ),
              child: Icon(
                _getIconForType(type),
                color: _getIconColor(type),
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            // Content
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          notification['title'] as String,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight:
                                isRead ? FontWeight.w500 : FontWeight.bold,
                          ),
                        ),
                      ),
                      if (!isRead)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: OkadaColors.primary,
                            shape: BoxShape.circle,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    notification['message'] as String,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 4),
                  Text(
                    _formatTime(time),
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[400],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 80,
            color: Colors.grey[300],
          ),
          const SizedBox(height: 16),
          Text(
            'No notifications',
            style: TextStyle(
              fontSize: 18,
              color: Colors.grey[600],
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'You\'re all caught up!',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[400],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForType(String type) {
    switch (type) {
      case 'order':
        return Icons.shopping_bag;
      case 'promotion':
        return Icons.local_offer;
      case 'product':
        return Icons.inventory_2;
      default:
        return Icons.notifications;
    }
  }

  Color _getIconBackgroundColor(String type) {
    switch (type) {
      case 'order':
        return OkadaColors.primary.withOpacity(0.1);
      case 'promotion':
        return Colors.orange.withOpacity(0.1);
      case 'product':
        return Colors.blue.withOpacity(0.1);
      default:
        return Colors.grey.withOpacity(0.1);
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'order':
        return OkadaColors.primary;
      case 'promotion':
        return Colors.orange;
      case 'product':
        return Colors.blue;
      default:
        return Colors.grey;
    }
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM dd').format(time);
    }
  }
}

