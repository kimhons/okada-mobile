import 'package:flutter/material.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_typography.dart';
import '../../theme/okada_spacing.dart';
import '../../theme/okada_border_radius.dart';

/// Button variants for different use cases
enum OkadaButtonVariant {
  /// Primary filled button - main CTAs
  primary,
  
  /// Secondary filled button - secondary actions
  secondary,
  
  /// Outlined button - tertiary actions
  outlined,
  
  /// Text button - minimal emphasis
  text,
  
  /// Destructive button - dangerous actions
  destructive,
  
  /// Success button - confirmation actions
  success,
}

/// Button sizes
enum OkadaButtonSize {
  /// Small button - 36px height
  small,
  
  /// Medium button - 44px height (default)
  medium,
  
  /// Large button - 52px height
  large,
}

/// Okada Platform Button Component
/// 
/// A versatile button component with multiple variants and sizes.
/// Supports loading state, icons, and full-width mode.
class OkadaButton extends StatelessWidget {
  /// Button label text
  final String label;
  
  /// Button variant
  final OkadaButtonVariant variant;
  
  /// Button size
  final OkadaButtonSize size;
  
  /// Callback when button is pressed
  final VoidCallback? onPressed;
  
  /// Whether button is in loading state
  final bool isLoading;
  
  /// Whether button should take full width
  final bool fullWidth;
  
  /// Leading icon
  final IconData? leadingIcon;
  
  /// Trailing icon
  final IconData? trailingIcon;
  
  /// Custom background color (overrides variant)
  final Color? backgroundColor;
  
  /// Custom foreground color (overrides variant)
  final Color? foregroundColor;

  const OkadaButton({
    super.key,
    required this.label,
    this.variant = OkadaButtonVariant.primary,
    this.size = OkadaButtonSize.medium,
    this.onPressed,
    this.isLoading = false,
    this.fullWidth = false,
    this.leadingIcon,
    this.trailingIcon,
    this.backgroundColor,
    this.foregroundColor,
  });

  @override
  Widget build(BuildContext context) {
    final isDisabled = onPressed == null || isLoading;
    
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: _getHeight(),
      child: _buildButton(context, isDisabled),
    );
  }

  Widget _buildButton(BuildContext context, bool isDisabled) {
    switch (variant) {
      case OkadaButtonVariant.primary:
      case OkadaButtonVariant.secondary:
      case OkadaButtonVariant.destructive:
      case OkadaButtonVariant.success:
        return _buildFilledButton(context, isDisabled);
      case OkadaButtonVariant.outlined:
        return _buildOutlinedButton(context, isDisabled);
      case OkadaButtonVariant.text:
        return _buildTextButton(context, isDisabled);
    }
  }

  Widget _buildFilledButton(BuildContext context, bool isDisabled) {
    return ElevatedButton(
      onPressed: isDisabled ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor ?? _getBackgroundColor(),
        foregroundColor: foregroundColor ?? _getForegroundColor(),
        disabledBackgroundColor: OkadaColors.neutral200,
        disabledForegroundColor: OkadaColors.textDisabled,
        padding: _getPadding(),
        shape: RoundedRectangleBorder(
          borderRadius: _getBorderRadius(),
        ),
        elevation: 0,
      ),
      child: _buildContent(),
    );
  }

  Widget _buildOutlinedButton(BuildContext context, bool isDisabled) {
    final color = backgroundColor ?? OkadaColors.primary;
    
    return OutlinedButton(
      onPressed: isDisabled ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: foregroundColor ?? color,
        disabledForegroundColor: OkadaColors.textDisabled,
        padding: _getPadding(),
        shape: RoundedRectangleBorder(
          borderRadius: _getBorderRadius(),
        ),
        side: BorderSide(
          color: isDisabled ? OkadaColors.neutral300 : color,
          width: 1.5,
        ),
      ),
      child: _buildContent(),
    );
  }

  Widget _buildTextButton(BuildContext context, bool isDisabled) {
    return TextButton(
      onPressed: isDisabled ? null : onPressed,
      style: TextButton.styleFrom(
        foregroundColor: foregroundColor ?? OkadaColors.primary,
        disabledForegroundColor: OkadaColors.textDisabled,
        padding: _getPadding(),
        shape: RoundedRectangleBorder(
          borderRadius: _getBorderRadius(),
        ),
      ),
      child: _buildContent(),
    );
  }

  Widget _buildContent() {
    if (isLoading) {
      return SizedBox(
        width: _getIconSize(),
        height: _getIconSize(),
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(
            variant == OkadaButtonVariant.outlined || 
            variant == OkadaButtonVariant.text
                ? OkadaColors.primary
                : OkadaColors.textInverse,
          ),
        ),
      );
    }

    final textStyle = _getTextStyle();
    
    if (leadingIcon == null && trailingIcon == null) {
      return Text(label, style: textStyle);
    }

    return Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (leadingIcon != null) ...[
          Icon(leadingIcon, size: _getIconSize()),
          SizedBox(width: OkadaSpacing.xs),
        ],
        Text(label, style: textStyle),
        if (trailingIcon != null) ...[
          SizedBox(width: OkadaSpacing.xs),
          Icon(trailingIcon, size: _getIconSize()),
        ],
      ],
    );
  }

  double _getHeight() {
    switch (size) {
      case OkadaButtonSize.small:
        return 36;
      case OkadaButtonSize.medium:
        return 44;
      case OkadaButtonSize.large:
        return 52;
    }
  }

  EdgeInsets _getPadding() {
    switch (size) {
      case OkadaButtonSize.small:
        return const EdgeInsets.symmetric(horizontal: 12, vertical: 8);
      case OkadaButtonSize.medium:
        return const EdgeInsets.symmetric(horizontal: 16, vertical: 12);
      case OkadaButtonSize.large:
        return const EdgeInsets.symmetric(horizontal: 24, vertical: 14);
    }
  }

  BorderRadius _getBorderRadius() {
    switch (size) {
      case OkadaButtonSize.small:
        return OkadaBorderRadius.buttonSmall;
      case OkadaButtonSize.medium:
        return OkadaBorderRadius.button;
      case OkadaButtonSize.large:
        return OkadaBorderRadius.buttonLarge;
    }
  }

  double _getIconSize() {
    switch (size) {
      case OkadaButtonSize.small:
        return 16;
      case OkadaButtonSize.medium:
        return 20;
      case OkadaButtonSize.large:
        return 24;
    }
  }

  TextStyle _getTextStyle() {
    switch (size) {
      case OkadaButtonSize.small:
        return OkadaTypography.labelMedium;
      case OkadaButtonSize.medium:
        return OkadaTypography.labelLarge;
      case OkadaButtonSize.large:
        return OkadaTypography.titleSmall;
    }
  }

  Color _getBackgroundColor() {
    switch (variant) {
      case OkadaButtonVariant.primary:
        return OkadaColors.primary;
      case OkadaButtonVariant.secondary:
        return OkadaColors.secondary;
      case OkadaButtonVariant.destructive:
        return OkadaColors.error;
      case OkadaButtonVariant.success:
        return OkadaColors.success;
      case OkadaButtonVariant.outlined:
      case OkadaButtonVariant.text:
        return Colors.transparent;
    }
  }

  Color _getForegroundColor() {
    switch (variant) {
      case OkadaButtonVariant.primary:
      case OkadaButtonVariant.secondary:
      case OkadaButtonVariant.destructive:
      case OkadaButtonVariant.success:
        return OkadaColors.textInverse;
      case OkadaButtonVariant.outlined:
      case OkadaButtonVariant.text:
        return OkadaColors.primary;
    }
  }
}
