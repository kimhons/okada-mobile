import 'package:flutter/material.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';
import '../../theme/okada_spacing.dart';
import '../buttons/okada_button.dart';

/// Okada Platform Empty State Component
/// 
/// Displays a friendly message when there's no content to show.
/// Supports icons, illustrations, titles, descriptions, and action buttons.
class EmptyState extends StatelessWidget {
  /// Icon to display
  final IconData? icon;
  
  /// Custom illustration widget (overrides icon)
  final Widget? illustration;
  
  /// Title text
  final String title;
  
  /// Description text
  final String? description;
  
  /// Primary action button label
  final String? actionLabel;
  
  /// Primary action callback
  final VoidCallback? onAction;
  
  /// Secondary action button label
  final String? secondaryActionLabel;
  
  /// Secondary action callback
  final VoidCallback? onSecondaryAction;
  
  /// Icon color
  final Color? iconColor;
  
  /// Icon size
  final double iconSize;
  
  /// Whether to use compact layout
  final bool compact;

  const EmptyState({
    super.key,
    this.icon,
    this.illustration,
    required this.title,
    this.description,
    this.actionLabel,
    this.onAction,
    this.secondaryActionLabel,
    this.onSecondaryAction,
    this.iconColor,
    this.iconSize = 64,
    this.compact = false,
  });

  /// Empty cart state
  factory EmptyState.cart({
    VoidCallback? onBrowse,
  }) {
    return EmptyState(
      icon: Icons.shopping_cart_outlined,
      title: 'Your cart is empty',
      description: 'Browse our products and add items to your cart.',
      actionLabel: 'Browse Products',
      onAction: onBrowse,
    );
  }

  /// Empty orders state
  factory EmptyState.orders({
    VoidCallback? onBrowse,
  }) {
    return EmptyState(
      icon: Icons.receipt_long_outlined,
      title: 'No orders yet',
      description: 'Your order history will appear here once you make a purchase.',
      actionLabel: 'Start Shopping',
      onAction: onBrowse,
    );
  }

  /// Empty search results state
  factory EmptyState.searchResults({
    String? query,
    VoidCallback? onClearSearch,
  }) {
    return EmptyState(
      icon: Icons.search_off_outlined,
      title: 'No results found',
      description: query != null 
          ? 'We couldn\'t find anything for "$query". Try a different search.'
          : 'Try adjusting your search or filters.',
      actionLabel: 'Clear Search',
      onAction: onClearSearch,
    );
  }

  /// Empty favorites state
  factory EmptyState.favorites({
    VoidCallback? onBrowse,
  }) {
    return EmptyState(
      icon: Icons.favorite_outline,
      title: 'No favorites yet',
      description: 'Save your favorite products here for quick access.',
      actionLabel: 'Browse Products',
      onAction: onBrowse,
    );
  }

  /// Empty notifications state
  factory EmptyState.notifications() {
    return const EmptyState(
      icon: Icons.notifications_none_outlined,
      title: 'No notifications',
      description: 'You\'re all caught up! Check back later for updates.',
    );
  }

  /// Empty addresses state
  factory EmptyState.addresses({
    VoidCallback? onAddAddress,
  }) {
    return EmptyState(
      icon: Icons.location_off_outlined,
      title: 'No saved addresses',
      description: 'Add a delivery address to make checkout faster.',
      actionLabel: 'Add Address',
      onAction: onAddAddress,
    );
  }

  /// No internet connection state
  factory EmptyState.noConnection({
    VoidCallback? onRetry,
  }) {
    return EmptyState(
      icon: Icons.wifi_off_outlined,
      title: 'No internet connection',
      description: 'Please check your connection and try again.',
      actionLabel: 'Retry',
      onAction: onRetry,
      iconColor: OkadaColors.warning,
    );
  }

  /// Generic error state
  factory EmptyState.error({
    String? message,
    VoidCallback? onRetry,
  }) {
    return EmptyState(
      icon: Icons.error_outline,
      title: 'Something went wrong',
      description: message ?? 'An unexpected error occurred. Please try again.',
      actionLabel: 'Retry',
      onAction: onRetry,
      iconColor: OkadaColors.error,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: compact 
            ? OkadaSpacing.allMd 
            : const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _buildIllustration(),
            SizedBox(height: compact ? OkadaSpacing.md : OkadaSpacing.xl),
            Text(
              title,
              style: compact 
                  ? OkadaTypography.titleMedium 
                  : OkadaTypography.headlineSmall,
              textAlign: TextAlign.center,
            ),
            if (description != null) ...[
              SizedBox(height: compact ? OkadaSpacing.xs : OkadaSpacing.sm),
              Text(
                description!,
                style: OkadaTypography.bodyMedium.copyWith(
                  color: OkadaColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (actionLabel != null && onAction != null) ...[
              SizedBox(height: compact ? OkadaSpacing.md : OkadaSpacing.xl),
              OkadaButton(
                label: actionLabel!,
                onPressed: onAction,
                size: compact ? OkadaButtonSize.small : OkadaButtonSize.medium,
              ),
            ],
            if (secondaryActionLabel != null && onSecondaryAction != null) ...[
              OkadaSpacing.gapVerticalSm,
              OkadaButton(
                label: secondaryActionLabel!,
                variant: OkadaButtonVariant.text,
                onPressed: onSecondaryAction,
                size: compact ? OkadaButtonSize.small : OkadaButtonSize.medium,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildIllustration() {
    if (illustration != null) {
      return illustration!;
    }
    
    if (icon != null) {
      return Container(
        width: iconSize + 32,
        height: iconSize + 32,
        decoration: BoxDecoration(
          color: (iconColor ?? OkadaColors.primary).withOpacity(0.1),
          shape: BoxShape.circle,
        ),
        child: Icon(
          icon,
          size: iconSize,
          color: iconColor ?? OkadaColors.primary,
        ),
      );
    }
    
    return const SizedBox.shrink();
  }
}
