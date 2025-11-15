/// Okada Platform Design Tokens - Spacing
/// Generated from design-tokens.json
/// Version: 1.0.0
/// Last Updated: 2024-04-01

class OkadaSpacing {
  OkadaSpacing._(); // Private constructor

  // ============================================================================
  // SPACING SCALE (4px base unit)
  // ============================================================================

  static const double xs = 4.0;   // 4px
  static const double sm = 8.0;   // 8px
  static const double md = 12.0;  // 12px
  static const double lg = 16.0;  // 16px
  static const double xl = 20.0;  // 20px
  static const double xl2 = 24.0; // 24px
  static const double xl3 = 32.0; // 32px
  static const double xl4 = 40.0; // 40px
  static const double xl5 = 48.0; // 48px
  static const double xl6 = 64.0; // 64px

  // ============================================================================
  // SEMANTIC SPACING
  // ============================================================================

  // Padding
  static const double paddingXs = xs;
  static const double paddingSm = sm;
  static const double paddingMd = md;
  static const double paddingLg = lg;
  static const double paddingXl = xl;
  static const double paddingXl2 = xl2;
  static const double paddingXl3 = xl3;

  // Margin
  static const double marginXs = xs;
  static const double marginSm = sm;
  static const double marginMd = md;
  static const double marginLg = lg;
  static const double marginXl = xl;
  static const double marginXl2 = xl2;
  static const double marginXl3 = xl3;

  // Gap (for Flex layouts)
  static const double gapXs = xs;
  static const double gapSm = sm;
  static const double gapMd = md;
  static const double gapLg = lg;
  static const double gapXl = xl;

  // ============================================================================
  // COMPONENT-SPECIFIC SPACING
  // ============================================================================

  // Screen padding
  static const double screenPaddingHorizontal = lg; // 16px
  static const double screenPaddingVertical = xl2; // 24px

  // Card padding
  static const double cardPadding = lg; // 16px
  static const double cardPaddingLarge = xl2; // 24px

  // Button padding
  static const double buttonPaddingHorizontal = xl2; // 24px
  static const double buttonPaddingVertical = md; // 12px
  static const double buttonPaddingSmall = sm; // 8px

  // Input padding
  static const double inputPaddingHorizontal = lg; // 16px
  static const double inputPaddingVertical = md; // 12px

  // List item padding
  static const double listItemPadding = lg; // 16px
  static const double listItemGap = sm; // 8px

  // Section spacing
  static const double sectionGap = xl2; // 24px
  static const double sectionGapLarge = xl3; // 32px

  // ============================================================================
  // BORDER RADIUS
  // ============================================================================

  static const double radiusXs = 2.0;   // 2px
  static const double radiusSm = 4.0;   // 4px
  static const double radiusMd = 8.0;   // 8px
  static const double radiusLg = 12.0;  // 12px
  static const double radiusXl = 16.0;  // 16px
  static const double radiusFull = 9999.0; // Fully rounded

  // Component-specific radius
  static const double buttonRadius = radiusMd; // 8px
  static const double cardRadius = radiusLg; // 12px
  static const double inputRadius = radiusMd; // 8px
  static const double chipRadius = radiusFull; // Fully rounded
  static const double avatarRadius = radiusFull; // Fully rounded

  // ============================================================================
  // ICON SIZES
  // ============================================================================

  static const double iconXs = 12.0; // 12px
  static const double iconSm = 16.0; // 16px
  static const double iconMd = 20.0; // 20px
  static const double iconLg = 24.0; // 24px
  static const double iconXl = 32.0; // 32px
  static const double iconXl2 = 48.0; // 48px

  // ============================================================================
  // ELEVATION (Shadow depth)
  // ============================================================================

  static const double elevationNone = 0.0;
  static const double elevationSm = 2.0;
  static const double elevationMd = 4.0;
  static const double elevationLg = 8.0;
  static const double elevationXl = 16.0;

  // ============================================================================
  // TOUCH TARGETS (Accessibility)
  // ============================================================================

  /// Minimum touch target size for accessibility (44x44 dp on iOS, 48x48 dp on Android)
  static const double minTouchTarget = 48.0;

  /// Recommended touch target size
  static const double touchTarget = 48.0;

  /// Large touch target (for primary actions)
  static const double touchTargetLarge = 56.0;

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /// Get spacing by multiplier
  static double scale(double multiplier) {
    return xs * multiplier;
  }

  /// Get horizontal padding
  static double horizontal(double value) {
    return value;
  }

  /// Get vertical padding
  static double vertical(double value) {
    return value;
  }
}

