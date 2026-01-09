import 'package:flutter/material.dart';

/// Okada Platform Spacing System
/// 
/// Uses an 8px base grid system for consistent spacing throughout the app.
/// All spacing values are multiples of 4px for flexibility.
abstract class OkadaSpacing {
  OkadaSpacing._();

  // ============================================
  // BASE SPACING VALUES
  // ============================================
  
  /// 0px - No spacing
  static const double none = 0;
  
  /// 2px - Minimal spacing
  static const double xxxs = 2;
  
  /// 4px - Extra extra small
  static const double xxs = 4;
  
  /// 8px - Extra small (base unit)
  static const double xs = 8;
  
  /// 12px - Small
  static const double sm = 12;
  
  /// 16px - Medium (2x base)
  static const double md = 16;
  
  /// 20px - Medium large
  static const double lg = 20;
  
  /// 24px - Large (3x base)
  static const double xl = 24;
  
  /// 32px - Extra large (4x base)
  static const double xxl = 32;
  
  /// 40px - Extra extra large (5x base)
  static const double xxxl = 40;
  
  /// 48px - Huge (6x base)
  static const double huge = 48;
  
  /// 56px - Massive
  static const double massive = 56;
  
  /// 64px - Giant (8x base)
  static const double giant = 64;

  // ============================================
  // SEMANTIC SPACING
  // ============================================
  
  /// Spacing between inline elements (icons, text)
  static const double inline = 4;
  
  /// Spacing between related items in a group
  static const double itemGap = 8;
  
  /// Spacing between sections
  static const double sectionGap = 24;
  
  /// Spacing between major page sections
  static const double pageGap = 32;

  // ============================================
  // COMPONENT-SPECIFIC SPACING
  // ============================================
  
  /// Button internal padding
  static const double buttonPaddingHorizontal = 16;
  static const double buttonPaddingVertical = 12;
  
  /// Card internal padding
  static const double cardPadding = 16;
  static const double cardPaddingLarge = 20;
  
  /// List item padding
  static const double listItemPaddingHorizontal = 16;
  static const double listItemPaddingVertical = 12;
  
  /// Input field padding
  static const double inputPaddingHorizontal = 16;
  static const double inputPaddingVertical = 14;
  
  /// Dialog padding
  static const double dialogPadding = 24;
  
  /// Bottom sheet padding
  static const double bottomSheetPadding = 20;
  
  /// Modal padding
  static const double modalPadding = 24;

  // ============================================
  // SCREEN EDGE PADDING
  // ============================================
  
  /// Default horizontal screen padding
  static const double screenHorizontal = 16;
  
  /// Default vertical screen padding
  static const double screenVertical = 16;
  
  /// Safe area additional padding
  static const double safeAreaPadding = 8;

  // ============================================
  // EDGE INSETS PRESETS
  // ============================================
  
  /// No padding
  static const EdgeInsets zero = EdgeInsets.zero;
  
  /// All sides - Extra small (4px)
  static const EdgeInsets allXxs = EdgeInsets.all(xxs);
  
  /// All sides - Small (8px)
  static const EdgeInsets allXs = EdgeInsets.all(xs);
  
  /// All sides - Medium (16px)
  static const EdgeInsets allMd = EdgeInsets.all(md);
  
  /// All sides - Large (24px)
  static const EdgeInsets allXl = EdgeInsets.all(xl);
  
  /// Horizontal only - Medium (16px)
  static const EdgeInsets horizontalMd = EdgeInsets.symmetric(horizontal: md);
  
  /// Horizontal only - Large (24px)
  static const EdgeInsets horizontalXl = EdgeInsets.symmetric(horizontal: xl);
  
  /// Vertical only - Small (8px)
  static const EdgeInsets verticalXs = EdgeInsets.symmetric(vertical: xs);
  
  /// Vertical only - Medium (16px)
  static const EdgeInsets verticalMd = EdgeInsets.symmetric(vertical: md);
  
  /// Screen padding (horizontal: 16px)
  static const EdgeInsets screenPadding = EdgeInsets.symmetric(
    horizontal: screenHorizontal,
  );
  
  /// Screen padding with vertical (16px all)
  static const EdgeInsets screenPaddingAll = EdgeInsets.symmetric(
    horizontal: screenHorizontal,
    vertical: screenVertical,
  );
  
  /// Card padding (16px all)
  static const EdgeInsets cardEdgeInsets = EdgeInsets.all(cardPadding);
  
  /// List item padding
  static const EdgeInsets listItemEdgeInsets = EdgeInsets.symmetric(
    horizontal: listItemPaddingHorizontal,
    vertical: listItemPaddingVertical,
  );
  
  /// Button padding
  static const EdgeInsets buttonEdgeInsets = EdgeInsets.symmetric(
    horizontal: buttonPaddingHorizontal,
    vertical: buttonPaddingVertical,
  );
  
  /// Input field padding
  static const EdgeInsets inputEdgeInsets = EdgeInsets.symmetric(
    horizontal: inputPaddingHorizontal,
    vertical: inputPaddingVertical,
  );
  
  /// Dialog padding
  static const EdgeInsets dialogEdgeInsets = EdgeInsets.all(dialogPadding);
  
  /// Bottom sheet padding
  static const EdgeInsets bottomSheetEdgeInsets = EdgeInsets.all(bottomSheetPadding);

  // ============================================
  // GAP WIDGETS (for Row/Column)
  // ============================================
  
  /// Horizontal gap - Extra small (4px)
  static const SizedBox gapHorizontalXxs = SizedBox(width: xxs);
  
  /// Horizontal gap - Small (8px)
  static const SizedBox gapHorizontalXs = SizedBox(width: xs);
  
  /// Horizontal gap - Medium (16px)
  static const SizedBox gapHorizontalMd = SizedBox(width: md);
  
  /// Horizontal gap - Large (24px)
  static const SizedBox gapHorizontalXl = SizedBox(width: xl);
  
  /// Vertical gap - Extra small (4px)
  static const SizedBox gapVerticalXxs = SizedBox(height: xxs);
  
  /// Vertical gap - Small (8px)
  static const SizedBox gapVerticalXs = SizedBox(height: xs);
  
  /// Vertical gap - Medium (12px)
  static const SizedBox gapVerticalSm = SizedBox(height: sm);
  
  /// Vertical gap - Medium (16px)
  static const SizedBox gapVerticalMd = SizedBox(height: md);
  
  /// Vertical gap - Large (24px)
  static const SizedBox gapVerticalXl = SizedBox(height: xl);
  
  /// Vertical gap - Extra large (32px)
  static const SizedBox gapVerticalXxl = SizedBox(height: xxl);
  
  /// Section gap (24px)
  static const SizedBox gapSection = SizedBox(height: sectionGap);
  
  /// Page section gap (32px)
  static const SizedBox gapPage = SizedBox(height: pageGap);

  // ============================================
  // HELPER METHODS
  // ============================================
  
  /// Create symmetric EdgeInsets
  static EdgeInsets symmetric({double horizontal = 0, double vertical = 0}) {
    return EdgeInsets.symmetric(horizontal: horizontal, vertical: vertical);
  }
  
  /// Create EdgeInsets with only specific sides
  static EdgeInsets only({
    double left = 0,
    double top = 0,
    double right = 0,
    double bottom = 0,
  }) {
    return EdgeInsets.only(left: left, top: top, right: right, bottom: bottom);
  }
  
  /// Create a horizontal SizedBox gap
  static SizedBox horizontalGap(double width) => SizedBox(width: width);
  
  /// Create a vertical SizedBox gap
  static SizedBox verticalGap(double height) => SizedBox(height: height);
}
