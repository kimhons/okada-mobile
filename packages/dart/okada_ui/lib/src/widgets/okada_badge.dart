import 'package:flutter/material.dart';
import '../theme/okada_colors.dart';
import '../theme/okada_typography.dart';
import '../theme/okada_border_radius.dart';

enum OkadaBadgeVariant { primary, secondary, success, warning, error, neutral }
enum OkadaBadgeSize { small, medium, large }

/// Okada Platform Badge Widget
class OkadaBadge extends StatelessWidget {
  final String label;
  final OkadaBadgeVariant variant;
  final OkadaBadgeSize size;
  final IconData? icon;
  final bool outlined;

  const OkadaBadge({
    super.key,
    required this.label,
    this.variant = OkadaBadgeVariant.primary,
    this.size = OkadaBadgeSize.medium,
    this.icon,
    this.outlined = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: _getPadding(),
      decoration: BoxDecoration(
        color: outlined ? Colors.transparent : _getBackgroundColor(),
        borderRadius: OkadaBorderRadius.radiusFull,
        border: outlined ? Border.all(color: _getForegroundColor()) : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: _getIconSize(), color: _getForegroundColor()),
            SizedBox(width: size == OkadaBadgeSize.small ? 4 : 6),
          ],
          Text(label, style: _getTextStyle()),
        ],
      ),
    );
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case OkadaBadgeSize.small: return const EdgeInsets.symmetric(horizontal: 8, vertical: 2);
      case OkadaBadgeSize.medium: return const EdgeInsets.symmetric(horizontal: 10, vertical: 4);
      case OkadaBadgeSize.large: return const EdgeInsets.symmetric(horizontal: 12, vertical: 6);
    }
  }

  double _getIconSize() {
    switch (size) {
      case OkadaBadgeSize.small: return 12;
      case OkadaBadgeSize.medium: return 14;
      case OkadaBadgeSize.large: return 16;
    }
  }

  TextStyle _getTextStyle() {
    final baseStyle = size == OkadaBadgeSize.small 
        ? OkadaTypography.labelSmall 
        : OkadaTypography.labelMedium;
    return baseStyle.copyWith(color: _getForegroundColor());
  }

  Color _getBackgroundColor() {
    switch (variant) {
      case OkadaBadgeVariant.primary: return OkadaColors.primary100;
      case OkadaBadgeVariant.secondary: return OkadaColors.secondary100;
      case OkadaBadgeVariant.success: return OkadaColors.successLight;
      case OkadaBadgeVariant.warning: return OkadaColors.warningLight;
      case OkadaBadgeVariant.error: return OkadaColors.errorLight;
      case OkadaBadgeVariant.neutral: return OkadaColors.neutral100;
    }
  }

  Color _getForegroundColor() {
    switch (variant) {
      case OkadaBadgeVariant.primary: return OkadaColors.primary700;
      case OkadaBadgeVariant.secondary: return OkadaColors.secondary700;
      case OkadaBadgeVariant.success: return OkadaColors.successDark;
      case OkadaBadgeVariant.warning: return OkadaColors.warningDark;
      case OkadaBadgeVariant.error: return OkadaColors.errorDark;
      case OkadaBadgeVariant.neutral: return OkadaColors.neutral700;
    }
  }
}

/// Notification badge (dot or count)
class NotificationBadge extends StatelessWidget {
  final Widget child;
  final int? count;
  final bool showDot;
  final Color? color;

  const NotificationBadge({
    super.key,
    required this.child,
    this.count,
    this.showDot = false,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final hasContent = (count != null && count! > 0) || showDot;
    
    return Stack(
      clipBehavior: Clip.none,
      children: [
        child,
        if (hasContent)
          Positioned(
            right: -4,
            top: -4,
            child: Container(
              padding: showDot ? null : const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              constraints: showDot ? null : const BoxConstraints(minWidth: 18),
              decoration: BoxDecoration(
                color: color ?? OkadaColors.error,
                shape: showDot ? BoxShape.circle : BoxShape.rectangle,
                borderRadius: showDot ? null : OkadaBorderRadius.radiusFull,
              ),
              width: showDot ? 10 : null,
              height: showDot ? 10 : null,
              child: showDot ? null : Text(
                count! > 99 ? '99+' : count.toString(),
                style: OkadaTypography.labelSmall.copyWith(color: Colors.white, fontSize: 10),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
}
