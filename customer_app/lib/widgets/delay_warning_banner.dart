import 'package:flutter/material.dart';

/// Widget to display delay warning with new ETA
class DelayWarningBanner extends StatelessWidget {
  final DateTime newEta;
  final String reason;
  final VoidCallback? onViewOptions;

  const DelayWarningBanner({
    Key? key,
    required this.newEta,
    required this.reason,
    this.onViewOptions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final minutesUntilArrival = newEta.difference(DateTime.now()).inMinutes;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFFFA500),
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Warning header
          Row(
            children: [
              const Icon(
                Icons.warning_amber_rounded,
                color: Colors.white,
                size: 24,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Delivery Delayed',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          // New ETA
          Text(
            'New ETA: ${minutesUntilArrival > 0 ? "$minutesUntilArrival minutes" : "arriving soon"}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 14,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(height: 12),
          // Reason card
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.95),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  _getReasonIcon(reason),
                  color: const Color(0xFFFFA500),
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    _getReasonText(reason),
                    style: const TextStyle(
                      fontSize: 14,
                      color: Colors.black87,
                    ),
                  ),
                ),
              ],
            ),
          ),
          // View options button
          if (onViewOptions != null) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: onViewOptions,
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.white,
                  side: const BorderSide(color: Colors.white, width: 2),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'View Options',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  IconData _getReasonIcon(String reason) {
    switch (reason) {
      case 'traffic_congestion':
        return Icons.traffic;
      case 'weather':
        return Icons.cloud;
      case 'vehicle_issue':
        return Icons.build;
      case 'high_demand':
        return Icons.trending_up;
      default:
        return Icons.info_outline;
    }
  }

  String _getReasonText(String reason) {
    switch (reason) {
      case 'traffic_congestion':
        return 'Your order is running late due to heavy traffic';
      case 'weather':
        return 'Delivery delayed due to weather conditions';
      case 'vehicle_issue':
        return 'Minor vehicle issue - rider is resolving it';
      case 'high_demand':
        return 'High demand in your area is causing delays';
      case 'unknown':
        return 'Your order is running late';
      default:
        return 'Your order is experiencing a delay';
    }
  }
}

