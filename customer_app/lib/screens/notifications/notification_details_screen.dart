import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/ui/theme/colors.dart';
import 'package:intl/intl.dart';

class NotificationDetailsScreen extends ConsumerWidget {
  final Map<String, dynamic> notification;

  const NotificationDetailsScreen({
    super.key,
    required this.notification,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final type = notification['type'] as String;
    final title = notification['title'] as String;
    final message = notification['message'] as String;
    final time = notification['time'] as DateTime;

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
          'Notification',
          style: TextStyle(
            color: Colors.black,
            fontSize: 20,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.delete_outline, color: Colors.black),
            onPressed: () {
              _showDeleteDialog(context);
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Icon
            Center(
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: _getIconBackgroundColor(type),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  _getIconForType(type),
                  color: _getIconColor(type),
                  size: 40,
                ),
              ),
            ),
            const SizedBox(height: 24),
            // Title
            Center(
              child: Text(
                title,
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
            const SizedBox(height: 8),
            // Time
            Center(
              child: Text(
                DateFormat('MMM dd, yyyy • hh:mm a').format(time),
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.grey[600],
                ),
              ),
            ),
            const SizedBox(height: 32),
            // Message
            Text(
              message,
              style: TextStyle(
                fontSize: 16,
                color: Colors.grey[800],
                height: 1.5,
              ),
            ),
            const SizedBox(height: 32),
            // Action button (if applicable)
            if (type == 'order') _buildOrderActionButton(context),
            if (type == 'promotion') _buildPromotionActionButton(context),
            if (type == 'product') _buildProductActionButton(context),
          ],
        ),
      ),
    );
  }

  Widget _buildOrderActionButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: () {
          Navigator.pushNamed(context, '/order/history');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: OkadaColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: const Text(
          'View Order',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildPromotionActionButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: () {
          Navigator.pushNamed(context, '/home');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: OkadaColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: const Text(
          'Shop Now',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildProductActionButton(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: ElevatedButton(
        onPressed: () {
          Navigator.pushNamed(context, '/home');
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: OkadaColors.primary,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 0,
        ),
        child: const Text(
          'Browse Products',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
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

  void _showDeleteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Notification'),
        content: const Text('Are you sure you want to delete this notification?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to notifications list
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Notification deleted'),
                  backgroundColor: Colors.red,
                ),
              );
            },
            child: const Text(
              'Delete',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

