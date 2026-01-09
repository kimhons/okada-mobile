import 'package:flutter/material.dart';

/// Okada Platform Shadow System
/// 
/// Provides consistent elevation and shadow styles throughout the app.
/// Uses subtle shadows for a clean, modern look.
abstract class OkadaShadows {
  OkadaShadows._();

  // ============================================
  // SHADOW COLORS
  // ============================================
  
  static const Color _shadowColorLight = Color(0x1A000000); // 10% black
  static const Color _shadowColorMedium = Color(0x26000000); // 15% black
  static const Color _shadowColorDark = Color(0x33000000); // 20% black

  // ============================================
  // ELEVATION LEVELS
  // ============================================
  
  /// No shadow
  static const List<BoxShadow> none = [];

  /// Elevation 1 - Subtle lift (cards at rest)
  static const List<BoxShadow> elevation1 = [
    BoxShadow(
      color: _shadowColorLight,
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  /// Elevation 2 - Light shadow (cards on hover, buttons)
  static const List<BoxShadow> elevation2 = [
    BoxShadow(
      color: _shadowColorLight,
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
    BoxShadow(
      color: Color(0x0D000000),
      blurRadius: 2,
      offset: Offset(0, 1),
    ),
  ];

  /// Elevation 3 - Medium shadow (dropdowns, popovers)
  static const List<BoxShadow> elevation3 = [
    BoxShadow(
      color: _shadowColorMedium,
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
    BoxShadow(
      color: _shadowColorLight,
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];

  /// Elevation 4 - Strong shadow (modals, dialogs)
  static const List<BoxShadow> elevation4 = [
    BoxShadow(
      color: _shadowColorMedium,
      blurRadius: 16,
      offset: Offset(0, 8),
    ),
    BoxShadow(
      color: _shadowColorLight,
      blurRadius: 8,
      offset: Offset(0, 4),
    ),
  ];

  /// Elevation 5 - Heavy shadow (bottom sheets, navigation drawers)
  static const List<BoxShadow> elevation5 = [
    BoxShadow(
      color: _shadowColorDark,
      blurRadius: 24,
      offset: Offset(0, 12),
    ),
    BoxShadow(
      color: _shadowColorMedium,
      blurRadius: 12,
      offset: Offset(0, 6),
    ),
  ];

  // ============================================
  // SEMANTIC SHADOWS
  // ============================================
  
  /// Card shadow (default)
  static const List<BoxShadow> card = elevation2;
  
  /// Card shadow (elevated/focused)
  static const List<BoxShadow> cardElevated = elevation3;
  
  /// Button shadow
  static const List<BoxShadow> button = elevation1;
  
  /// Button shadow (pressed)
  static const List<BoxShadow> buttonPressed = none;
  
  /// Floating action button shadow
  static const List<BoxShadow> fab = elevation4;
  
  /// App bar shadow
  static const List<BoxShadow> appBar = elevation2;
  
  /// Bottom navigation shadow
  static const List<BoxShadow> bottomNav = [
    BoxShadow(
      color: _shadowColorLight,
      blurRadius: 8,
      offset: Offset(0, -2),
    ),
  ];
  
  /// Bottom sheet shadow
  static const List<BoxShadow> bottomSheet = [
    BoxShadow(
      color: _shadowColorMedium,
      blurRadius: 16,
      offset: Offset(0, -4),
    ),
  ];
  
  /// Modal/Dialog shadow
  static const List<BoxShadow> modal = elevation5;
  
  /// Dropdown shadow
  static const List<BoxShadow> dropdown = elevation3;
  
  /// Tooltip shadow
  static const List<BoxShadow> tooltip = elevation2;
  
  /// Search bar shadow
  static const List<BoxShadow> searchBar = elevation2;
  
  /// Sticky header shadow
  static const List<BoxShadow> stickyHeader = [
    BoxShadow(
      color: _shadowColorLight,
      blurRadius: 4,
      offset: Offset(0, 2),
    ),
  ];

  // ============================================
  // COLORED SHADOWS
  // ============================================
  
  /// Primary color shadow (for primary buttons)
  static List<BoxShadow> primaryShadow = [
    BoxShadow(
      color: const Color(0xFF22C55E).withOpacity(0.3),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];
  
  /// Secondary color shadow
  static List<BoxShadow> secondaryShadow = [
    BoxShadow(
      color: const Color(0xFF3B82F6).withOpacity(0.3),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];
  
  /// Accent color shadow
  static List<BoxShadow> accentShadow = [
    BoxShadow(
      color: const Color(0xFFF97316).withOpacity(0.3),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];
  
  /// Error color shadow
  static List<BoxShadow> errorShadow = [
    BoxShadow(
      color: const Color(0xFFEF4444).withOpacity(0.3),
      blurRadius: 8,
      offset: const Offset(0, 4),
    ),
  ];

  // ============================================
  // INNER SHADOWS
  // ============================================
  
  /// Inner shadow for pressed states
  static const List<BoxShadow> innerShadow = [
    BoxShadow(
      color: Color(0x1A000000),
      blurRadius: 4,
      offset: Offset(0, 2),
      spreadRadius: -2,
    ),
  ];

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /// Get shadow for a specific elevation level (0-5)
  static List<BoxShadow> forElevation(int level) {
    switch (level) {
      case 0:
        return none;
      case 1:
        return elevation1;
      case 2:
        return elevation2;
      case 3:
        return elevation3;
      case 4:
        return elevation4;
      case 5:
      default:
        return elevation5;
    }
  }
  
  /// Create a custom shadow
  static List<BoxShadow> custom({
    Color color = _shadowColorMedium,
    double blurRadius = 8,
    double spreadRadius = 0,
    Offset offset = const Offset(0, 4),
  }) {
    return [
      BoxShadow(
        color: color,
        blurRadius: blurRadius,
        spreadRadius: spreadRadius,
        offset: offset,
      ),
    ];
  }
}
