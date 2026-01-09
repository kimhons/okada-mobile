import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_border_radius.dart';

/// Skeleton shape types
enum SkeletonShape {
  /// Rectangle shape
  rectangle,
  
  /// Circle shape
  circle,
  
  /// Rounded rectangle
  rounded,
  
  /// Pill/Stadium shape
  pill,
}

/// Okada Platform Skeleton Loader Component
/// 
/// A shimmer-based loading placeholder for content that is being loaded.
/// Supports various shapes and sizes.
class SkeletonLoader extends StatelessWidget {
  /// Width of the skeleton
  final double? width;
  
  /// Height of the skeleton
  final double? height;
  
  /// Shape of the skeleton
  final SkeletonShape shape;
  
  /// Border radius (for rectangle and rounded shapes)
  final BorderRadius? borderRadius;
  
  /// Base color for shimmer
  final Color? baseColor;
  
  /// Highlight color for shimmer
  final Color? highlightColor;

  const SkeletonLoader({
    super.key,
    this.width,
    this.height,
    this.shape = SkeletonShape.rounded,
    this.borderRadius,
    this.baseColor,
    this.highlightColor,
  });

  /// Create a text line skeleton
  factory SkeletonLoader.text({
    double width = double.infinity,
    double height = 16,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      shape: SkeletonShape.rounded,
    );
  }

  /// Create a title skeleton
  factory SkeletonLoader.title({
    double width = 200,
    double height = 24,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      shape: SkeletonShape.rounded,
    );
  }

  /// Create a paragraph skeleton (multiple lines)
  static Widget paragraph({
    int lines = 3,
    double lineHeight = 14,
    double spacing = 8,
    double lastLineWidth = 0.7,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: List.generate(lines, (index) {
        final isLast = index == lines - 1;
        return Padding(
          padding: EdgeInsets.only(bottom: isLast ? 0 : spacing),
          child: SkeletonLoader(
            width: isLast ? double.infinity * lastLineWidth : double.infinity,
            height: lineHeight,
            shape: SkeletonShape.rounded,
          ),
        );
      }),
    );
  }

  /// Create an avatar skeleton
  factory SkeletonLoader.avatar({
    double size = 48,
  }) {
    return SkeletonLoader(
      width: size,
      height: size,
      shape: SkeletonShape.circle,
    );
  }

  /// Create an image skeleton
  factory SkeletonLoader.image({
    double width = double.infinity,
    double height = 200,
    BorderRadius? borderRadius,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      shape: SkeletonShape.rounded,
      borderRadius: borderRadius ?? OkadaBorderRadius.image,
    );
  }

  /// Create a button skeleton
  factory SkeletonLoader.button({
    double width = 120,
    double height = 44,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      shape: SkeletonShape.rounded,
      borderRadius: OkadaBorderRadius.button,
    );
  }

  /// Create a card skeleton
  factory SkeletonLoader.card({
    double width = double.infinity,
    double height = 120,
  }) {
    return SkeletonLoader(
      width: width,
      height: height,
      shape: SkeletonShape.rounded,
      borderRadius: OkadaBorderRadius.card,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? OkadaColors.shimmerBase,
      highlightColor: highlightColor ?? OkadaColors.shimmerHighlight,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: _getBorderRadius(),
          shape: shape == SkeletonShape.circle 
              ? BoxShape.circle 
              : BoxShape.rectangle,
        ),
      ),
    );
  }

  BorderRadius? _getBorderRadius() {
    if (shape == SkeletonShape.circle) return null;
    
    if (borderRadius != null) return borderRadius;
    
    switch (shape) {
      case SkeletonShape.rectangle:
        return BorderRadius.zero;
      case SkeletonShape.rounded:
        return OkadaBorderRadius.radiusSm;
      case SkeletonShape.pill:
        return OkadaBorderRadius.radiusFull;
      case SkeletonShape.circle:
        return null;
    }
  }
}

/// A skeleton list item with avatar, title, and subtitle
class SkeletonListItem extends StatelessWidget {
  /// Whether to show avatar
  final bool showAvatar;
  
  /// Avatar size
  final double avatarSize;
  
  /// Whether to show subtitle
  final bool showSubtitle;
  
  /// Whether to show trailing
  final bool showTrailing;

  const SkeletonListItem({
    super.key,
    this.showAvatar = true,
    this.avatarSize = 48,
    this.showSubtitle = true,
    this.showTrailing = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          if (showAvatar) ...[
            SkeletonLoader.avatar(size: avatarSize),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SkeletonLoader(
                  width: 150,
                  height: 16,
                  shape: SkeletonShape.rounded,
                ),
                if (showSubtitle) ...[
                  const SizedBox(height: 8),
                  const SkeletonLoader(
                    width: 100,
                    height: 12,
                    shape: SkeletonShape.rounded,
                  ),
                ],
              ],
            ),
          ),
          if (showTrailing) ...[
            const SizedBox(width: 12),
            const SkeletonLoader(
              width: 60,
              height: 16,
              shape: SkeletonShape.rounded,
            ),
          ],
        ],
      ),
    );
  }
}

/// A skeleton product card
class SkeletonProductCard extends StatelessWidget {
  /// Card width
  final double width;
  
  /// Image height
  final double imageHeight;

  const SkeletonProductCard({
    super.key,
    this.width = 160,
    this.imageHeight = 120,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: OkadaBorderRadius.card,
        border: Border.all(color: OkadaColors.borderLight),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SkeletonLoader.image(
            width: width,
            height: imageHeight,
            borderRadius: OkadaBorderRadius.topLg,
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                SkeletonLoader.text(width: width - 24, height: 14),
                const SizedBox(height: 8),
                SkeletonLoader.text(width: (width - 24) * 0.6, height: 12),
                const SizedBox(height: 12),
                SkeletonLoader.text(width: 80, height: 18),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
