import 'package:flutter/material.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';

/// Offline status indicator banner
class OfflineIndicator extends StatelessWidget {
  final bool isOffline;
  final String? message;
  final VoidCallback? onRetry;
  final bool showRetry;

  const OfflineIndicator({
    super.key,
    required this.isOffline,
    this.message,
    this.onRetry,
    this.showRetry = true,
  });

  @override
  Widget build(BuildContext context) {
    if (!isOffline) return const SizedBox.shrink();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      color: OkadaColors.warning,
      child: SafeArea(
        bottom: false,
        child: Row(
          children: [
            const Icon(Icons.wifi_off, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message ?? 'You\'re offline. Some features may be limited.',
                style: OkadaTypography.bodySmall.copyWith(color: Colors.white),
              ),
            ),
            if (showRetry && onRetry != null)
              TextButton(
                onPressed: onRetry,
                child: Text(
                  'Retry',
                  style: OkadaTypography.labelMedium.copyWith(color: Colors.white),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
