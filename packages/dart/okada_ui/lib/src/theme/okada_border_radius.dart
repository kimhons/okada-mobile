import 'package:flutter/material.dart';

/// Okada Platform Border Radius System
/// 
/// Provides consistent border radius values throughout the app.
/// Uses a 4px base unit for flexibility.
abstract class OkadaBorderRadius {
  OkadaBorderRadius._();

  // ============================================
  // BASE RADIUS VALUES
  // ============================================
  
  /// No radius (sharp corners)
  static const double none = 0;
  
  /// Extra small radius - 2px
  static const double xxs = 2;
  
  /// Small radius - 4px
  static const double xs = 4;
  
  /// Small-medium radius - 6px
  static const double sm = 6;
  
  /// Medium radius - 8px
  static const double md = 8;
  
  /// Medium-large radius - 12px
  static const double lg = 12;
  
  /// Large radius - 16px
  static const double xl = 16;
  
  /// Extra large radius - 20px
  static const double xxl = 20;
  
  /// Extra extra large radius - 24px
  static const double xxxl = 24;
  
  /// Huge radius - 32px
  static const double huge = 32;
  
  /// Full/Circular radius - 9999px
  static const double full = 9999;

  // ============================================
  // BORDER RADIUS PRESETS
  // ============================================
  
  /// No radius
  static const BorderRadius radiusNone = BorderRadius.zero;
  
  /// Extra small (2px)
  static const BorderRadius radiusXxs = BorderRadius.all(Radius.circular(xxs));
  
  /// Small (4px)
  static const BorderRadius radiusXs = BorderRadius.all(Radius.circular(xs));
  
  /// Small-medium (6px)
  static const BorderRadius radiusSm = BorderRadius.all(Radius.circular(sm));
  
  /// Medium (8px)
  static const BorderRadius radiusMd = BorderRadius.all(Radius.circular(md));
  
  /// Medium-large (12px)
  static const BorderRadius radiusLg = BorderRadius.all(Radius.circular(lg));
  
  /// Large (16px)
  static const BorderRadius radiusXl = BorderRadius.all(Radius.circular(xl));
  
  /// Extra large (20px)
  static const BorderRadius radiusXxl = BorderRadius.all(Radius.circular(xxl));
  
  /// Extra extra large (24px)
  static const BorderRadius radiusXxxl = BorderRadius.all(Radius.circular(xxxl));
  
  /// Huge (32px)
  static const BorderRadius radiusHuge = BorderRadius.all(Radius.circular(huge));
  
  /// Full/Circular
  static const BorderRadius radiusFull = BorderRadius.all(Radius.circular(full));

  // ============================================
  // SEMANTIC BORDER RADIUS
  // ============================================
  
  /// Button radius (8px)
  static const BorderRadius button = radiusMd;
  
  /// Button small radius (6px)
  static const BorderRadius buttonSmall = radiusSm;
  
  /// Button large radius (12px)
  static const BorderRadius buttonLarge = radiusLg;
  
  /// Card radius (12px)
  static const BorderRadius card = radiusLg;
  
  /// Card small radius (8px)
  static const BorderRadius cardSmall = radiusMd;
  
  /// Input field radius (8px)
  static const BorderRadius input = radiusMd;
  
  /// Chip radius (full)
  static const BorderRadius chip = radiusFull;
  
  /// Badge radius (full)
  static const BorderRadius badge = radiusFull;
  
  /// Avatar radius (full)
  static const BorderRadius avatar = radiusFull;
  
  /// Modal/Dialog radius (16px)
  static const BorderRadius modal = radiusXl;
  
  /// Bottom sheet radius (top only, 20px)
  static const BorderRadius bottomSheet = BorderRadius.only(
    topLeft: Radius.circular(xxl),
    topRight: Radius.circular(xxl),
  );
  
  /// Dropdown radius (8px)
  static const BorderRadius dropdown = radiusMd;
  
  /// Tooltip radius (6px)
  static const BorderRadius tooltip = radiusSm;
  
  /// Image radius (8px)
  static const BorderRadius image = radiusMd;
  
  /// Image large radius (12px)
  static const BorderRadius imageLarge = radiusLg;
  
  /// Search bar radius (full)
  static const BorderRadius searchBar = radiusFull;
  
  /// Tab indicator radius (full)
  static const BorderRadius tabIndicator = radiusFull;
  
  /// Progress bar radius (full)
  static const BorderRadius progressBar = radiusFull;
  
  /// Snackbar radius (8px)
  static const BorderRadius snackbar = radiusMd;
  
  /// Toast radius (8px)
  static const BorderRadius toast = radiusMd;

  // ============================================
  // PARTIAL RADIUS (Top/Bottom only)
  // ============================================
  
  /// Top only - Medium (8px)
  static const BorderRadius topMd = BorderRadius.only(
    topLeft: Radius.circular(md),
    topRight: Radius.circular(md),
  );
  
  /// Top only - Large (12px)
  static const BorderRadius topLg = BorderRadius.only(
    topLeft: Radius.circular(lg),
    topRight: Radius.circular(lg),
  );
  
  /// Top only - Extra large (16px)
  static const BorderRadius topXl = BorderRadius.only(
    topLeft: Radius.circular(xl),
    topRight: Radius.circular(xl),
  );
  
  /// Bottom only - Medium (8px)
  static const BorderRadius bottomMd = BorderRadius.only(
    bottomLeft: Radius.circular(md),
    bottomRight: Radius.circular(md),
  );
  
  /// Bottom only - Large (12px)
  static const BorderRadius bottomLg = BorderRadius.only(
    bottomLeft: Radius.circular(lg),
    bottomRight: Radius.circular(lg),
  );

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /// Create a BorderRadius with all corners the same
  static BorderRadius all(double radius) {
    return BorderRadius.all(Radius.circular(radius));
  }
  
  /// Create a BorderRadius with only top corners
  static BorderRadius top(double radius) {
    return BorderRadius.only(
      topLeft: Radius.circular(radius),
      topRight: Radius.circular(radius),
    );
  }
  
  /// Create a BorderRadius with only bottom corners
  static BorderRadius bottom(double radius) {
    return BorderRadius.only(
      bottomLeft: Radius.circular(radius),
      bottomRight: Radius.circular(radius),
    );
  }
  
  /// Create a BorderRadius with only left corners
  static BorderRadius left(double radius) {
    return BorderRadius.only(
      topLeft: Radius.circular(radius),
      bottomLeft: Radius.circular(radius),
    );
  }
  
  /// Create a BorderRadius with only right corners
  static BorderRadius right(double radius) {
    return BorderRadius.only(
      topRight: Radius.circular(radius),
      bottomRight: Radius.circular(radius),
    );
  }
  
  /// Create a custom BorderRadius
  static BorderRadius custom({
    double topLeft = 0,
    double topRight = 0,
    double bottomLeft = 0,
    double bottomRight = 0,
  }) {
    return BorderRadius.only(
      topLeft: Radius.circular(topLeft),
      topRight: Radius.circular(topRight),
      bottomLeft: Radius.circular(bottomLeft),
      bottomRight: Radius.circular(bottomRight),
    );
  }
}
