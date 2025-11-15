import 'package:flutter/material.dart';
import 'package:okada_shared/ui/theme/colors.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import 'package:okada_shared/ui/constants/cameroon_constants.dart';

/// Product Card Widget
/// Matches the product cards in mockup: 05_home_screen.png
class ProductCard extends StatelessWidget {
  final Map<String, dynamic> product;

  const ProductCard({
    super.key,
    required this.product,
  });

  @override
  Widget build(BuildContext context) {
    final name = product['name'] as String? ?? 'Product';
    final price = product['price'] as num? ?? 0;
    final imageUrl = product['image_url'] as String?;
    final images = product['images'] as List<dynamic>?;
    
    // Get first image URL
    String? displayImage = imageUrl;
    if (displayImage == null && images != null && images.isNotEmpty) {
      final firstImage = images.first as Map<String, dynamic>;
      displayImage = firstImage['url'] as String?;
    }

    return GestureDetector(
      onTap: () {
        // TODO: Navigate to product detail
        Navigator.of(context).pushNamed(
          '/product-detail',
          arguments: product,
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Product Image
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: OkadaColors.backgroundLight,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                ),
                child: displayImage != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.vertical(
                          top: Radius.circular(12),
                        ),
                        child: Image.network(
                          displayImage,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return _buildPlaceholder();
                          },
                        ),
                      )
                    : _buildPlaceholder(),
              ),
            ),

            // Product Info
            Padding(
              padding: EdgeInsets.all(OkadaSpacing.sm),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Product Name
                  Text(
                    name,
                    style: OkadaTypography.bodyMedium.copyWith(
                      color: OkadaColors.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),

                  SizedBox(height: OkadaSpacing.xs),

                  // Price
                  Text(
                    CameroonConstants.formatCurrency(price.toDouble()),
                    style: OkadaTypography.h4.copyWith(
                      color: OkadaColors.textPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),

                  SizedBox(height: OkadaSpacing.sm),

                  // Add to Cart Button
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () {
                        // TODO: Add to cart
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('$name added to cart'),
                            backgroundColor: OkadaColors.success,
                            duration: Duration(seconds: 2),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: OkadaColors.primary,
                        foregroundColor: Colors.white,
                        padding: EdgeInsets.symmetric(
                          vertical: OkadaSpacing.sm,
                        ),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        elevation: 0,
                      ),
                      child: Text(
                        'Add to Cart',
                        style: OkadaTypography.bodySmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
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
    return Center(
      child: Icon(
        Icons.image_outlined,
        size: 48,
        color: OkadaColors.textSecondary.withOpacity(0.3),
      ),
    );
  }
}

