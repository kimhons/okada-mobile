import 'package:flutter/material.dart';
import '../models/tracking_data.dart';

/// Widget to display order status as a vertical timeline
class OrderStatusTimeline extends StatelessWidget {
  final List<OrderStatusStep> steps;

  const OrderStatusTimeline({
    Key? key,
    required this.steps,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Order Status',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 16),
        ...steps.asMap().entries.map((entry) {
          final index = entry.key;
          final step = entry.value;
          final isLast = index == steps.length - 1;

          return _buildTimelineItem(step, isLast);
        }).toList(),
      ],
    );
  }

  Widget _buildTimelineItem(OrderStatusStep step, bool isLast) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline indicator column
          Column(
            children: [
              _buildStatusIcon(step.status),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 2,
                    margin: const EdgeInsets.symmetric(vertical: 4),
                    color: _getLineColor(step.status),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          // Content column
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    step.title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: step.status == OrderStepStatus.active
                          ? FontWeight.bold
                          : FontWeight.normal,
                      color: _getTextColor(step.status),
                    ),
                  ),
                  if (step.timestamp != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      _formatTime(step.timestamp!),
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusIcon(OrderStepStatus status) {
    switch (status) {
      case OrderStepStatus.completed:
        return Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: Color(0xFF2D8659),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.check,
            color: Colors.white,
            size: 16,
          ),
        );

      case OrderStepStatus.active:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: const Color(0xFF2D8659),
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: const Color(0xFF2D8659).withOpacity(0.3),
                blurRadius: 8,
                spreadRadius: 2,
              ),
            ],
          ),
          child: Container(
            margin: const EdgeInsets.all(6),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
          ),
        );

      case OrderStepStatus.warning:
        return Container(
          width: 24,
          height: 24,
          decoration: const BoxDecoration(
            color: Color(0xFFFFA500),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.warning,
            color: Colors.white,
            size: 16,
          ),
        );

      case OrderStepStatus.error:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.red[400],
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.close,
            color: Colors.white,
            size: 16,
          ),
        );

      case OrderStepStatus.pending:
        return Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            border: Border.all(
              color: Colors.grey[300]!,
              width: 2,
            ),
          ),
        );
    }
  }

  Color _getLineColor(OrderStepStatus status) {
    switch (status) {
      case OrderStepStatus.completed:
        return const Color(0xFF2D8659);
      case OrderStepStatus.active:
        return const Color(0xFF2D8659);
      case OrderStepStatus.warning:
        return const Color(0xFFFFA500);
      case OrderStepStatus.error:
        return Colors.red[400]!;
      case OrderStepStatus.pending:
        return Colors.grey[300]!;
    }
  }

  Color _getTextColor(OrderStepStatus status) {
    switch (status) {
      case OrderStepStatus.completed:
      case OrderStepStatus.active:
        return Colors.black;
      case OrderStepStatus.warning:
        return const Color(0xFFFFA500);
      case OrderStepStatus.error:
        return Colors.red[700]!;
      case OrderStepStatus.pending:
        return Colors.grey[500]!;
    }
  }

  String _formatTime(DateTime time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}

