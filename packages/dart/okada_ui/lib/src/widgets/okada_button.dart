import 'package:flutter/material.dart';

/// Primary button style for Okada apps
class OkadaButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isOutlined;
  final bool isFullWidth;
  final IconData? icon;
  final Color? backgroundColor;
  final Color? textColor;
  final double? height;
  final double borderRadius;
  
  const OkadaButton({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isOutlined = false,
    this.isFullWidth = true,
    this.icon,
    this.backgroundColor,
    this.textColor,
    this.height = 56,
    this.borderRadius = 12,
  });
  
  /// Primary filled button
  const OkadaButton.primary({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.height = 56,
    this.borderRadius = 12,
  }) : isOutlined = false,
       backgroundColor = null,
       textColor = null;
  
  /// Secondary outlined button
  const OkadaButton.secondary({
    super.key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isFullWidth = true,
    this.icon,
    this.height = 56,
    this.borderRadius = 12,
  }) : isOutlined = true,
       backgroundColor = null,
       textColor = null;
  
  /// Text button
  factory OkadaButton.text({
    Key? key,
    required String text,
    VoidCallback? onPressed,
    IconData? icon,
    Color? textColor,
  }) {
    return OkadaButton(
      key: key,
      text: text,
      onPressed: onPressed,
      icon: icon,
      textColor: textColor,
      isFullWidth: false,
      height: 40,
      backgroundColor: Colors.transparent,
    );
  }
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final primaryColor = theme.primaryColor;
    
    final bgColor = backgroundColor ?? 
        (isOutlined ? Colors.transparent : primaryColor);
    final fgColor = textColor ?? 
        (isOutlined ? primaryColor : Colors.black);
    
    Widget child = isLoading
        ? SizedBox(
            height: 24,
            width: 24,
            child: CircularProgressIndicator(
              strokeWidth: 2.5,
              valueColor: AlwaysStoppedAnimation<Color>(fgColor),
            ),
          )
        : Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (icon != null) ...[
                Icon(icon, size: 20, color: fgColor),
                const SizedBox(width: 8),
              ],
              Text(
                text,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: fgColor,
                ),
              ),
            ],
          );
    
    if (isOutlined) {
      return SizedBox(
        width: isFullWidth ? double.infinity : null,
        height: height,
        child: OutlinedButton(
          onPressed: isLoading ? null : onPressed,
          style: OutlinedButton.styleFrom(
            side: BorderSide(color: primaryColor, width: 1.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(borderRadius),
            ),
          ),
          child: child,
        ),
      );
    }
    
    return SizedBox(
      width: isFullWidth ? double.infinity : null,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: fgColor,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
        child: child,
      ),
    );
  }
}

/// Icon button with Okada styling
class OkadaIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback? onPressed;
  final Color? backgroundColor;
  final Color? iconColor;
  final double size;
  final String? tooltip;
  final bool hasBadge;
  final int badgeCount;
  
  const OkadaIconButton({
    super.key,
    required this.icon,
    this.onPressed,
    this.backgroundColor,
    this.iconColor,
    this.size = 48,
    this.tooltip,
    this.hasBadge = false,
    this.badgeCount = 0,
  });
  
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    Widget button = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: backgroundColor ?? theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(size / 4),
        border: Border.all(
          color: theme.dividerColor,
          width: 1,
        ),
      ),
      child: IconButton(
        icon: Icon(icon, color: iconColor ?? theme.iconTheme.color),
        onPressed: onPressed,
        padding: EdgeInsets.zero,
      ),
    );
    
    if (hasBadge && badgeCount > 0) {
      button = Badge(
        label: Text(
          badgeCount > 99 ? '99+' : badgeCount.toString(),
          style: const TextStyle(fontSize: 10),
        ),
        child: button,
      );
    }
    
    if (tooltip != null) {
      return Tooltip(message: tooltip!, child: button);
    }
    
    return button;
  }
}
