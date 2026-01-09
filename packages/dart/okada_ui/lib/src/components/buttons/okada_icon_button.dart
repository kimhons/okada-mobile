import 'package:flutter/material.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_border_radius.dart';

/// Icon button variants
enum OkadaIconButtonVariant {
  /// Filled background
  filled,
  
  /// Tonal (lighter) background
  tonal,
  
  /// Outlined border
  outlined,
  
  /// Standard (no background)
  standard,
}

/// Icon button sizes
enum OkadaIconButtonSize {
  /// Small - 32px
  small,
  
  /// Medium - 40px
  medium,
  
  /// Large - 48px
  large,
}

/// Okada Platform Icon Button Component
class OkadaIconButton extends StatelessWidget {
  /// Icon to display
  final IconData icon;
  
  /// Button variant
  final OkadaIconButtonVariant variant;
  
  /// Button size
  final OkadaIconButtonSize size;
  
  /// Callback when pressed
  final VoidCallback? onPressed;
  
  /// Custom color
  final Color? color;
  
  /// Whether button is loading
  final bool isLoading;
  
  /// Tooltip text
  final String? tooltip;

  const OkadaIconButton({
    super.key,
    required this.icon,
    this.variant = OkadaIconButtonVariant.standard,
    this.size = OkadaIconButtonSize.medium,
    this.onPressed,
    this.color,
    this.isLoading = false,
    this.tooltip,
  });

  @override
  Widget build(BuildContext context) {
    final buttonSize = _getSize();
    final iconSize = _getIconSize();
    final effectiveColor = color ?? OkadaColors.primary;
    
    Widget button = SizedBox(
      width: buttonSize,
      height: buttonSize,
      child: _buildButton(effectiveColor, iconSize),
    );
    
    if (tooltip != null) {
      button = Tooltip(
        message: tooltip!,
        child: button,
      );
    }
    
    return button;
  }

  Widget _buildButton(Color effectiveColor, double iconSize) {
    if (isLoading) {
      return Center(
        child: SizedBox(
          width: iconSize,
          height: iconSize,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(effectiveColor),
          ),
        ),
      );
    }

    switch (variant) {
      case OkadaIconButtonVariant.filled:
        return _buildFilledButton(effectiveColor, iconSize);
      case OkadaIconButtonVariant.tonal:
        return _buildTonalButton(effectiveColor, iconSize);
      case OkadaIconButtonVariant.outlined:
        return _buildOutlinedButton(effectiveColor, iconSize);
      case OkadaIconButtonVariant.standard:
        return _buildStandardButton(effectiveColor, iconSize);
    }
  }

  Widget _buildFilledButton(Color color, double iconSize) {
    return Material(
      color: onPressed != null ? color : OkadaColors.neutral200,
      borderRadius: OkadaBorderRadius.radiusFull,
      child: InkWell(
        onTap: onPressed,
        borderRadius: OkadaBorderRadius.radiusFull,
        child: Center(
          child: Icon(
            icon,
            size: iconSize,
            color: onPressed != null 
                ? OkadaColors.textInverse 
                : OkadaColors.textDisabled,
          ),
        ),
      ),
    );
  }

  Widget _buildTonalButton(Color color, double iconSize) {
    return Material(
      color: onPressed != null 
          ? color.withOpacity(0.1) 
          : OkadaColors.neutral100,
      borderRadius: OkadaBorderRadius.radiusFull,
      child: InkWell(
        onTap: onPressed,
        borderRadius: OkadaBorderRadius.radiusFull,
        child: Center(
          child: Icon(
            icon,
            size: iconSize,
            color: onPressed != null ? color : OkadaColors.textDisabled,
          ),
        ),
      ),
    );
  }

  Widget _buildOutlinedButton(Color color, double iconSize) {
    return Material(
      color: Colors.transparent,
      shape: CircleBorder(
        side: BorderSide(
          color: onPressed != null ? color : OkadaColors.neutral300,
          width: 1.5,
        ),
      ),
      child: InkWell(
        onTap: onPressed,
        borderRadius: OkadaBorderRadius.radiusFull,
        child: Center(
          child: Icon(
            icon,
            size: iconSize,
            color: onPressed != null ? color : OkadaColors.textDisabled,
          ),
        ),
      ),
    );
  }

  Widget _buildStandardButton(Color color, double iconSize) {
    return IconButton(
      onPressed: onPressed,
      icon: Icon(icon),
      iconSize: iconSize,
      color: onPressed != null ? color : OkadaColors.textDisabled,
    );
  }

  double _getSize() {
    switch (size) {
      case OkadaIconButtonSize.small:
        return 32;
      case OkadaIconButtonSize.medium:
        return 40;
      case OkadaIconButtonSize.large:
        return 48;
    }
  }

  double _getIconSize() {
    switch (size) {
      case OkadaIconButtonSize.small:
        return 18;
      case OkadaIconButtonSize.medium:
        return 22;
      case OkadaIconButtonSize.large:
        return 26;
    }
  }
}
