import 'package:flutter/material.dart';
import 'package:okada_shared/ui/theme/spacing.dart';
import 'package:okada_shared/ui/theme/typography.dart';
import 'package:okada_shared/ui/theme/colors.dart';

/// Category Card Widget
/// Matches the category cards in mockup: 05_home_screen.png
class CategoryCard extends StatelessWidget {
  final String name;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  const CategoryCard({
    super.key,
    required this.name,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 90,
        margin: EdgeInsets.only(right: OkadaSpacing.md),
        child: Column(
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                icon,
                size: 36,
                color: color.computeLuminance() > 0.5
                    ? OkadaColors.textPrimary
                    : Colors.white,
              ),
            ),
            SizedBox(height: OkadaSpacing.xs),
            Text(
              name,
              style: OkadaTypography.bodySmall.copyWith(
                color: OkadaColors.textPrimary,
                fontWeight: FontWeight.w500,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }
}

