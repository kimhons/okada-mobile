import 'package:flutter/material.dart';
import '../theme/okada_colors.dart';
import '../theme/okada_spacing.dart';
import '../theme/okada_border_radius.dart';
import '../theme/okada_shadows.dart';

/// Card variants
enum OkadaCardVariant {
  /// Elevated card with shadow
  elevated,
  
  /// Outlined card with border
  outlined,
  
  /// Filled card with background color
  filled,
}

/// Okada Platform Card Component
class OkadaCard extends StatelessWidget {
  /// Card content
  final Widget child;
  
  /// Card variant
  final OkadaCardVariant variant;
  
  /// Custom padding
  final EdgeInsets? padding;
  
  /// Custom margin
  final EdgeInsets? margin;
  
  /// Custom border radius
  final BorderRadius? borderRadius;
  
  /// Custom background color
  final Color? backgroundColor;
  
  /// Custom border color (for outlined variant)
  final Color? borderColor;
  
  /// Callback when card is tapped
  final VoidCallback? onTap;
  
  /// Whether card is selected
  final bool isSelected;
  
  /// Whether card is disabled
  final bool isDisabled;

  const OkadaCard({
    super.key,
    required this.child,
    this.variant = OkadaCardVariant.outlined,
    this.padding,
    this.margin,
    this.borderRadius,
    this.backgroundColor,
    this.borderColor,
    this.onTap,
    this.isSelected = false,
    this.isDisabled = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: margin,
      decoration: BoxDecoration(
        color: _getBackgroundColor(),
        borderRadius: borderRadius ?? OkadaBorderRadius.card,
        border: _getBorder(),
        boxShadow: _getShadow(),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: borderRadius ?? OkadaBorderRadius.card,
        child: InkWell(
          onTap: isDisabled ? null : onTap,
          borderRadius: borderRadius ?? OkadaBorderRadius.card,
          child: Padding(
            padding: padding ?? OkadaSpacing.cardEdgeInsets,
            child: child,
          ),
        ),
      ),
    );
  }

  Color _getBackgroundColor() {
    if (isDisabled) return OkadaColors.neutral100;
    if (backgroundColor != null) return backgroundColor!;
    
    switch (variant) {
      case OkadaCardVariant.elevated:
      case OkadaCardVariant.outlined:
        return OkadaColors.surface;
      case OkadaCardVariant.filled:
        return OkadaColors.surfaceVariant;
    }
  }

  Border? _getBorder() {
    if (isSelected) {
      return Border.all(color: OkadaColors.primary, width: 2);
    }
    
    switch (variant) {
      case OkadaCardVariant.elevated:
        return null;
      case OkadaCardVariant.outlined:
        return Border.all(
          color: borderColor ?? OkadaColors.borderLight,
          width: 1,
        );
      case OkadaCardVariant.filled:
        return null;
    }
  }

  List<BoxShadow>? _getShadow() {
    if (isDisabled) return null;
    
    switch (variant) {
      case OkadaCardVariant.elevated:
        return OkadaShadows.card;
      case OkadaCardVariant.outlined:
      case OkadaCardVariant.filled:
        return null;
    }
  }
}

/// Product card component
class OkadaProductCard extends StatelessWidget {
  /// Product image URL
  final String? imageUrl;
  
  /// Product name
  final String name;
  
  /// Product price
  final double price;
  
  /// Original price (for discount)
  final double? originalPrice;
  
  /// Currency symbol
  final String currency;
  
  /// Product rating
  final double? rating;
  
  /// Number of reviews
  final int? reviewCount;
  
  /// Whether product is in stock
  final bool inStock;
  
  /// Callback when card is tapped
  final VoidCallback? onTap;
  
  /// Callback when add to cart is tapped
  final VoidCallback? onAddToCart;
  
  /// Callback when favorite is tapped
  final VoidCallback? onFavorite;
  
  /// Whether product is favorited
  final bool isFavorite;
  
  /// Card width
  final double? width;

  const OkadaProductCard({
    super.key,
    this.imageUrl,
    required this.name,
    required this.price,
    this.originalPrice,
    this.currency = 'XAF',
    this.rating,
    this.reviewCount,
    this.inStock = true,
    this.onTap,
    this.onAddToCart,
    this.onFavorite,
    this.isFavorite = false,
    this.width,
  });

  @override
  Widget build(BuildContext context) {
    return OkadaCard(
      variant: OkadaCardVariant.outlined,
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: SizedBox(
        width: width,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            // Image section
            Stack(
              children: [
                AspectRatio(
                  aspectRatio: 1,
                  child: ClipRRect(
                    borderRadius: OkadaBorderRadius.topLg,
                    child: imageUrl != null
                        ? Image.network(
                            imageUrl!,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) => _buildPlaceholder(),
                          )
                        : _buildPlaceholder(),
                  ),
                ),
                // Favorite button
                if (onFavorite != null)
                  Positioned(
                    top: 8,
                    right: 8,
                    child: GestureDetector(
                      onTap: onFavorite,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: OkadaColors.surface.withOpacity(0.9),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_border,
                          size: 20,
                          color: isFavorite 
                              ? OkadaColors.error 
                              : OkadaColors.textSecondary,
                        ),
                      ),
                    ),
                  ),
                // Out of stock badge
                if (!inStock)
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: OkadaColors.neutral800,
                        borderRadius: OkadaBorderRadius.radiusSm,
                      ),
                      child: Text(
                        'Out of Stock',
                        style: TextStyle(
                          color: OkadaColors.textInverse,
                          fontSize: 10,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            // Content section
            Padding(
              padding: const EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                      color: OkadaColors.textPrimary,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  OkadaSpacing.gapVerticalXs,
                  // Rating
                  if (rating != null) ...[
                    Row(
                      children: [
                        const Icon(
                          Icons.star,
                          size: 14,
                          color: OkadaColors.warning,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          rating!.toStringAsFixed(1),
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: OkadaColors.textSecondary,
                          ),
                        ),
                        if (reviewCount != null) ...[
                          Text(
                            ' ($reviewCount)',
                            style: const TextStyle(
                              fontSize: 12,
                              color: OkadaColors.textTertiary,
                            ),
                          ),
                        ],
                      ],
                    ),
                    OkadaSpacing.gapVerticalXs,
                  ],
                  // Price
                  Row(
                    children: [
                      Text(
                        '$currency ${price.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: OkadaColors.textPrimary,
                        ),
                      ),
                      if (originalPrice != null) ...[
                        const SizedBox(width: 8),
                        Text(
                          '$currency ${originalPrice!.toStringAsFixed(0)}',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w400,
                            color: OkadaColors.textTertiary,
                            decoration: TextDecoration.lineThrough,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      color: OkadaColors.neutral100,
      child: const Center(
        child: Icon(
          Icons.image_outlined,
          size: 48,
          color: OkadaColors.neutral400,
        ),
      ),
    );
  }
}
