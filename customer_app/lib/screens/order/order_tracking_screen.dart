import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../models/tracking_data.dart';
import '../../providers/order_tracking_provider.dart';
import '../../widgets/order_status_timeline.dart';
import '../../widgets/rider_info_card.dart';
import '../../widgets/delay_warning_banner.dart';
import '../../widgets/order_tracking_map.dart';

/// Order Tracking Screen - Shows real-time delivery tracking
class OrderTrackingScreen extends ConsumerStatefulWidget {
  final String orderId;

  const OrderTrackingScreen({
    Key? key,
    required this.orderId,
  }) : super(key: key);

  @override
  ConsumerState<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends ConsumerState<OrderTrackingScreen> {
  final DraggableScrollableController _scrollController = DraggableScrollableController();

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final trackingState = ref.watch(orderTrackingProvider(widget.orderId));

    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        title: const Text(
          'Order Tracking',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        backgroundColor: const Color(0xFF2D8659),
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          // WebSocket connection indicator
          Padding(
            padding: const EdgeInsets.only(right: 16),
            child: Center(
              child: Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  color: trackingState.isWebSocketConnected
                      ? Colors.greenAccent
                      : Colors.red[300],
                  shape: BoxShape.circle,
                ),
              ),
            ),
          ),
        ],
      ),
      body: _buildBody(context, trackingState),
    );
  }

  Widget _buildBody(BuildContext context, OrderTrackingState trackingState) {
    if (trackingState.isLoading && !trackingState.hasData) {
      return _buildLoadingState();
    }

    if (trackingState.hasError && !trackingState.hasData) {
      return _buildErrorState(trackingState.error!);
    }

    if (!trackingState.hasData) {
      return _buildEmptyState();
    }

    return Stack(
      children: [
        // Map view (full screen)
        OrderTrackingMap(
          orderId: widget.orderId,
          trackingData: trackingState.trackingData!,
        ),

        // Compensation message (if any)
        if (trackingState.compensationMessage != null)
          Positioned(
            top: 16,
            left: 16,
            right: 16,
            child: _buildCompensationBanner(trackingState.compensationMessage!),
          ),

        // Draggable bottom sheet with order details
        DraggableScrollableSheet(
          controller: _scrollController,
          initialChildSize: 0.45,
          minChildSize: 0.35,
          maxChildSize: 0.85,
          builder: (context, scrollController) {
            return Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(24),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, -2),
                  ),
                ],
              ),
              child: ListView(
                controller: scrollController,
                padding: const EdgeInsets.all(0),
                children: [
                  // Drag handle
                  Center(
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 12),
                      width: 40,
                      height: 4,
                      decoration: BoxDecoration(
                        color: Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),

                  // Delay warning banner (if delayed)
                  if (trackingState.isDelayed)
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                      child: DelayWarningBanner(
                        newEta: trackingState.trackingData!.newEstimatedAt!,
                        reason: trackingState.trackingData!.delayReason ?? 'unknown',
                        onViewOptions: () => _showDelayOptions(context),
                      ),
                    ),

                  // Order status timeline
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: OrderStatusTimeline(
                      steps: _buildStatusSteps(trackingState.trackingData!),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Rider info card
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: RiderInfoCard(
                      rider: trackingState.trackingData!.rider,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Order details section
                  _buildOrderDetailsSection(trackingState.trackingData!),

                  const SizedBox(height: 24),
                ],
              ),
            );
          },
        ),
      ],
    );
  }

  Widget _buildLoadingState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(
            valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF2D8659)),
          ),
          SizedBox(height: 16),
          Text(
            'Loading tracking information...',
            style: TextStyle(
              fontSize: 16,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(String error) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red[300],
            ),
            const SizedBox(height: 16),
            Text(
              'Failed to load tracking',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 8),
            Text(
              error,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                ref.read(orderTrackingProvider(widget.orderId).notifier).refresh();
              },
              icon: const Icon(Icons.refresh),
              label: const Text('Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF2D8659),
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return const Center(
      child: Text(
        'No tracking data available',
        style: TextStyle(fontSize: 16, color: Colors.grey),
      ),
    );
  }

  Widget _buildCompensationBanner(String message) {
    return Material(
      color: Colors.transparent,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF2D8659),
          borderRadius: BorderRadius.circular(12),
          boxShadow: const [
            BoxShadow(
              color: Colors.black26,
              blurRadius: 10,
              offset: Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            const Icon(
              Icons.card_giftcard,
              color: Colors.white,
              size: 28,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<OrderStatusStep> _buildStatusSteps(TrackingData data) {
    // Build status steps based on current order status
    final steps = <OrderStatusStep>[
      OrderStatusStep(
        title: 'Order Placed',
        status: OrderStepStatus.completed,
        timestamp: data.statusHistory.isNotEmpty ? data.statusHistory[0].timestamp : null,
      ),
      OrderStatusStep(
        title: 'Confirmed',
        status: _getStepStatus(data.status, OrderStatus.confirmed),
        timestamp: null,
      ),
      OrderStatusStep(
        title: 'Rider Assigned',
        status: _getStepStatus(data.status, OrderStatus.riderAssigned),
        timestamp: null,
      ),
      OrderStatusStep(
        title: data.isDelayed ? 'In Transit (Delayed)' : 'In Transit',
        status: data.isDelayed
            ? OrderStepStatus.warning
            : _getStepStatus(data.status, OrderStatus.inTransit),
        timestamp: null,
      ),
    ];

    // Add arriving soon or delivered based on status
    if (data.status == OrderStatus.arrivingSoon || data.status == OrderStatus.delivered) {
      steps.add(OrderStatusStep(
        title: 'Arriving Soon',
        status: data.status == OrderStatus.delivered
            ? OrderStepStatus.completed
            : OrderStepStatus.active,
        timestamp: null,
      ));
    }

    return steps;
  }

  OrderStepStatus _getStepStatus(OrderStatus currentStatus, OrderStatus stepStatus) {
    final statusOrder = [
      OrderStatus.orderPlaced,
      OrderStatus.confirmed,
      OrderStatus.riderAssigned,
      OrderStatus.inTransit,
      OrderStatus.arrivingSoon,
      OrderStatus.delivered,
    ];

    final currentIndex = statusOrder.indexOf(currentStatus);
    final stepIndex = statusOrder.indexOf(stepStatus);

    if (currentIndex > stepIndex) {
      return OrderStepStatus.completed;
    } else if (currentIndex == stepIndex) {
      return OrderStepStatus.active;
    } else {
      return OrderStepStatus.pending;
    }
  }

  Widget _buildOrderDetailsSection(TrackingData data) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[50],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Order Details',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'ID: ${data.orderId}',
                style: TextStyle(
                  fontSize: 12,
                  color: Colors.grey[600],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            Icons.access_time,
            'Estimated Arrival',
            _formatTime(data.isDelayed ? data.newEstimatedAt! : data.estimatedAt),
          ),
          if (data.pickupLocation.address != null)
            _buildDetailRow(
              Icons.store,
              'Pickup',
              data.pickupLocation.address!,
            ),
          if (data.deliveryLocation.address != null)
            _buildDetailRow(
              Icons.location_on,
              'Delivery',
              data.deliveryLocation.address!,
            ),
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(icon, size: 18, color: Colors.grey[600]),
          const SizedBox(width: 8),
          Text(
            '$label: ',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey[600],
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  void _showDelayOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildDelayOptionsSheet(context),
    );
  }

  Widget _buildDelayOptionsSheet(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'What would you like to do?',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),
          _buildOptionButton(
            icon: Icons.access_time,
            title: 'Wait for Delivery',
            subtitle: 'Continue tracking your order',
            color: const Color(0xFF2D8659),
            onTap: () => Navigator.pop(context),
          ),
          const SizedBox(height: 12),
          _buildOptionButton(
            icon: Icons.cancel,
            title: 'Cancel Order',
            subtitle: 'Full refund to your account',
            color: Colors.red,
            onTap: () {
              Navigator.pop(context);
              _confirmCancelOrder(context);
            },
          ),
          const SizedBox(height: 12),
          _buildOptionButton(
            icon: Icons.support_agent,
            title: 'Contact Support',
            subtitle: 'Speak to our team',
            color: const Color(0xFF2D8659),
            onTap: () {
              Navigator.pop(context);
              // TODO: Navigate to support screen
            },
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildOptionButton({
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border.all(color: color.withOpacity(0.3)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: color),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey[600],
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

  void _confirmCancelOrder(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Cancel Order?'),
        content: const Text(
          'Are you sure you want to cancel this order? You will receive a full refund.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('No, Keep Order'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await ref
                    .read(orderTrackingProvider(widget.orderId).notifier)
                    .cancelOrder('Customer cancelled due to delay');
                
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Order cancelled successfully'),
                      backgroundColor: Color(0xFF2D8659),
                    ),
                  );
                }
              } catch (e) {
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to cancel order: $e'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            child: const Text(
              'Yes, Cancel',
              style: TextStyle(color: Colors.red),
            ),
          ),
        ],
      ),
    );
  }
}

