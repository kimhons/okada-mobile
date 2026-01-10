import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';

/// Ndop Pattern Widget
/// 
/// Renders traditional Cameroonian Ndop cloth-inspired geometric patterns.
/// Used as decorative elements in headers, borders, and backgrounds.
/// 
/// The Ndop cloth is a traditional Cameroonian textile featuring
/// indigo blue and white geometric patterns.
class NdopPattern extends StatelessWidget {
  const NdopPattern({
    super.key,
    this.width,
    this.height = 8,
    this.primaryColor,
    this.secondaryColor,
    this.patternType = NdopPatternType.border,
    this.opacity = 1.0,
  });

  /// Width of the pattern (defaults to full width)
  final double? width;
  
  /// Height of the pattern
  final double height;
  
  /// Primary pattern color (defaults to Ndop Blue)
  final Color? primaryColor;
  
  /// Secondary pattern color (defaults to white)
  final Color? secondaryColor;
  
  /// Type of pattern to render
  final NdopPatternType patternType;
  
  /// Opacity of the pattern
  final double opacity;

  @override
  Widget build(BuildContext context) {
    final primary = primaryColor ?? OkadaDesignSystem.ndopPatternPrimary;
    final secondary = secondaryColor ?? OkadaDesignSystem.ndopPatternSecondary;
    
    return Opacity(
      opacity: opacity,
      child: SizedBox(
        width: width,
        height: height,
        child: CustomPaint(
          painter: _NdopPatternPainter(
            primaryColor: primary,
            secondaryColor: secondary,
            patternType: patternType,
          ),
          size: Size(width ?? double.infinity, height),
        ),
      ),
    );
  }
}

/// Types of Ndop patterns available
enum NdopPatternType {
  /// Simple border pattern with repeating diamonds
  border,
  
  /// Zigzag pattern
  zigzag,
  
  /// Geometric squares pattern
  squares,
  
  /// Traditional interlocking pattern
  interlocking,
  
  /// Subtle dots pattern
  dots,
}

class _NdopPatternPainter extends CustomPainter {
  _NdopPatternPainter({
    required this.primaryColor,
    required this.secondaryColor,
    required this.patternType,
  });

  final Color primaryColor;
  final Color secondaryColor;
  final NdopPatternType patternType;

  @override
  void paint(Canvas canvas, Size size) {
    switch (patternType) {
      case NdopPatternType.border:
        _paintBorderPattern(canvas, size);
        break;
      case NdopPatternType.zigzag:
        _paintZigzagPattern(canvas, size);
        break;
      case NdopPatternType.squares:
        _paintSquaresPattern(canvas, size);
        break;
      case NdopPatternType.interlocking:
        _paintInterlockingPattern(canvas, size);
        break;
      case NdopPatternType.dots:
        _paintDotsPattern(canvas, size);
        break;
    }
  }

  void _paintBorderPattern(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
    
    // Diamond pattern
    final diamondPaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.fill;
    
    final diamondSize = size.height * 0.6;
    final spacing = diamondSize * 1.5;
    
    for (double x = spacing / 2; x < size.width; x += spacing) {
      final path = Path();
      final centerY = size.height / 2;
      
      path.moveTo(x, centerY - diamondSize / 2);
      path.lineTo(x + diamondSize / 2, centerY);
      path.lineTo(x, centerY + diamondSize / 2);
      path.lineTo(x - diamondSize / 2, centerY);
      path.close();
      
      canvas.drawPath(path, diamondPaint);
    }
  }

  void _paintZigzagPattern(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
    
    // Zigzag
    final zigzagPaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.height * 0.15;
    
    final path = Path();
    final amplitude = size.height * 0.3;
    final wavelength = size.height * 1.5;
    
    path.moveTo(0, size.height / 2);
    
    for (double x = 0; x < size.width; x += wavelength) {
      path.lineTo(x + wavelength / 2, size.height / 2 - amplitude);
      path.lineTo(x + wavelength, size.height / 2 + amplitude);
    }
    
    canvas.drawPath(path, zigzagPaint);
  }

  void _paintSquaresPattern(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
    
    // Squares
    final squarePaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.fill;
    
    final squareSize = size.height * 0.4;
    final spacing = squareSize * 2;
    
    for (double x = spacing / 4; x < size.width; x += spacing) {
      final rect = Rect.fromCenter(
        center: Offset(x, size.height / 2),
        width: squareSize,
        height: squareSize,
      );
      canvas.drawRect(rect, squarePaint);
    }
  }

  void _paintInterlockingPattern(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
    
    // Interlocking pattern
    final linePaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.height * 0.1;
    
    final segmentWidth = size.height * 1.2;
    
    for (double x = 0; x < size.width; x += segmentWidth) {
      // Horizontal lines
      canvas.drawLine(
        Offset(x, size.height * 0.3),
        Offset(x + segmentWidth * 0.4, size.height * 0.3),
        linePaint,
      );
      canvas.drawLine(
        Offset(x + segmentWidth * 0.6, size.height * 0.7),
        Offset(x + segmentWidth, size.height * 0.7),
        linePaint,
      );
      
      // Vertical connector
      canvas.drawLine(
        Offset(x + segmentWidth * 0.4, size.height * 0.3),
        Offset(x + segmentWidth * 0.6, size.height * 0.7),
        linePaint,
      );
    }
  }

  void _paintDotsPattern(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = primaryColor
      ..style = PaintingStyle.fill;
    
    // Background
    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      paint,
    );
    
    // Dots
    final dotPaint = Paint()
      ..color = secondaryColor
      ..style = PaintingStyle.fill;
    
    final dotRadius = size.height * 0.15;
    final spacing = size.height * 0.8;
    
    for (double x = spacing / 2; x < size.width; x += spacing) {
      canvas.drawCircle(
        Offset(x, size.height / 2),
        dotRadius,
        dotPaint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant _NdopPatternPainter oldDelegate) {
    return oldDelegate.primaryColor != primaryColor ||
        oldDelegate.secondaryColor != secondaryColor ||
        oldDelegate.patternType != patternType;
  }
}

/// Ndop Pattern Border Decoration
/// 
/// A BoxDecoration that includes Ndop pattern as a border.
class NdopBorderDecoration extends BoxDecoration {
  NdopBorderDecoration({
    Color? backgroundColor,
    Color? patternColor,
    double borderWidth = 4,
    BorderRadius? borderRadius,
  }) : super(
    color: backgroundColor ?? OkadaDesignSystem.pureWhite,
    borderRadius: borderRadius ?? BorderRadius.circular(8),
    border: Border.all(
      color: patternColor ?? OkadaDesignSystem.ndopBlue,
      width: borderWidth,
    ),
  );
}

/// Ndop Pattern Header
/// 
/// A header widget with Ndop pattern decoration at the bottom.
class NdopPatternHeader extends StatelessWidget {
  const NdopPatternHeader({
    super.key,
    required this.child,
    this.backgroundColor,
    this.patternHeight = 8,
    this.patternType = NdopPatternType.border,
  });

  final Widget child;
  final Color? backgroundColor;
  final double patternHeight;
  final NdopPatternType patternType;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          color: backgroundColor ?? OkadaDesignSystem.okadaGreen,
          child: child,
        ),
        NdopPattern(
          height: patternHeight,
          patternType: patternType,
        ),
      ],
    );
  }
}

/// Ndop Pattern Divider
/// 
/// A divider with Ndop pattern styling.
class NdopPatternDivider extends StatelessWidget {
  const NdopPatternDivider({
    super.key,
    this.height = 4,
    this.patternType = NdopPatternType.dots,
    this.opacity = 0.3,
  });

  final double height;
  final NdopPatternType patternType;
  final double opacity;

  @override
  Widget build(BuildContext context) {
    return NdopPattern(
      height: height,
      patternType: patternType,
      opacity: opacity,
    );
  }
}
