import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';
import '../../theme/okada_colors.dart';
import '../../theme/okada_border_radius.dart';

/// Shimmer image with loading placeholder
class ShimmerImage extends StatelessWidget {
  final String? imageUrl;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final Widget? errorWidget;

  const ShimmerImage({
    super.key,
    this.imageUrl,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.errorWidget,
  });

  @override
  Widget build(BuildContext context) {
    if (imageUrl == null || imageUrl!.isEmpty) {
      return _buildPlaceholder();
    }

    return ClipRRect(
      borderRadius: borderRadius ?? OkadaBorderRadius.radiusMd,
      child: Image.network(
        imageUrl!,
        width: width,
        height: height,
        fit: fit,
        loadingBuilder: (context, child, loadingProgress) {
          if (loadingProgress == null) return child;
          return _buildShimmer();
        },
        errorBuilder: (context, error, stackTrace) {
          return errorWidget ?? _buildPlaceholder();
        },
      ),
    );
  }

  Widget _buildShimmer() {
    return Shimmer.fromColors(
      baseColor: OkadaColors.shimmerBase,
      highlightColor: OkadaColors.shimmerHighlight,
      child: Container(
        width: width,
        height: height,
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: borderRadius ?? OkadaBorderRadius.radiusMd,
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: OkadaColors.neutral100,
        borderRadius: borderRadius ?? OkadaBorderRadius.radiusMd,
      ),
      child: const Center(
        child: Icon(Icons.image_outlined, color: OkadaColors.neutral400, size: 32),
      ),
    );
  }
}
