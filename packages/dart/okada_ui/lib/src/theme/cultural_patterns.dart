import 'package:flutter/material.dart';
import 'african_countries.dart';
import 'okada_colors.dart';

/// Types of African cultural patterns
enum CulturalPatternType {
  /// Geometric patterns (Ndebele, Kente)
  geometric,
  
  /// Organic/flowing patterns (Adire, Ankara)
  organic,
  
  /// Symbolic patterns (Adinkra symbols)
  symbolic,
  
  /// Embroidery-style patterns (Toghu, Tibeb)
  embroidery,
}

/// Cultural pattern configuration
class CulturalPattern {
  /// Pattern name
  final String name;
  
  /// Country of origin
  final AfricanCountry country;
  
  /// Pattern type
  final CulturalPatternType type;
  
  /// Primary colors used in the pattern
  final List<Color> colors;
  
  /// Description of the pattern's cultural significance
  final String significance;
  
  /// SVG path data for the pattern (simplified)
  final String? svgPattern;

  const CulturalPattern({
    required this.name,
    required this.country,
    required this.type,
    required this.colors,
    required this.significance,
    this.svgPattern,
  });
}

/// Registry of African cultural patterns
class CulturalPatternRegistry {
  CulturalPatternRegistry._();

  static final Map<AfricanCountry, CulturalPattern> _patterns = {
    // Cameroon - Toghu embroidery
    AfricanCountry.cameroon: CulturalPattern(
      name: 'Toghu',
      country: AfricanCountry.cameroon,
      type: CulturalPatternType.embroidery,
      colors: [
        const Color(0xFF000000), // Black base
        const Color(0xFFFFD700), // Gold embroidery
        const Color(0xFFFF0000), // Red accents
        const Color(0xFF008000), // Green accents
      ],
      significance: 'Traditional royal garment of the Bamenda Grassfields, symbolizing prestige and cultural identity.',
    ),

    // Nigeria - Adire
    AfricanCountry.nigeria: CulturalPattern(
      name: 'Adire',
      country: AfricanCountry.nigeria,
      type: CulturalPatternType.organic,
      colors: [
        const Color(0xFF1A237E), // Deep indigo
        const Color(0xFFFFFFFF), // White resist
        const Color(0xFF3949AB), // Medium indigo
      ],
      significance: 'Yoruba resist-dyed cloth representing creativity, status, and cultural heritage.',
    ),

    // Ghana - Kente
    AfricanCountry.ghana: CulturalPattern(
      name: 'Kente',
      country: AfricanCountry.ghana,
      type: CulturalPatternType.geometric,
      colors: [
        const Color(0xFFFFD700), // Gold (royalty)
        const Color(0xFF008000), // Green (growth)
        const Color(0xFFFF0000), // Red (sacrifice)
        const Color(0xFF000000), // Black (maturity)
      ],
      significance: 'Sacred Akan cloth where each pattern tells a story of history, philosophy, and social values.',
    ),

    // Kenya - Kikoy
    AfricanCountry.kenya: CulturalPattern(
      name: 'Kikoy',
      country: AfricanCountry.kenya,
      type: CulturalPatternType.geometric,
      colors: [
        const Color(0xFFE53935), // Red
        const Color(0xFF1E88E5), // Blue
        const Color(0xFF43A047), // Green
        const Color(0xFFFFFFFF), // White stripes
      ],
      significance: 'Traditional Swahili coast fabric representing coastal culture and craftsmanship.',
    ),

    // South Africa - Ndebele
    AfricanCountry.southAfrica: CulturalPattern(
      name: 'Ndebele',
      country: AfricanCountry.southAfrica,
      type: CulturalPatternType.geometric,
      colors: [
        const Color(0xFF000000), // Black outlines
        const Color(0xFFFFFFFF), // White base
        const Color(0xFF0066CC), // Blue
        const Color(0xFFFF6600), // Orange
        const Color(0xFFFFCC00), // Yellow
        const Color(0xFF00CC66), // Green
      ],
      significance: 'Bold geometric house paintings representing identity, status, and artistic expression.',
    ),

    // Senegal - Thioup
    AfricanCountry.senegal: CulturalPattern(
      name: 'Thioup',
      country: AfricanCountry.senegal,
      type: CulturalPatternType.organic,
      colors: [
        const Color(0xFF8B4513), // Brown
        const Color(0xFFFFD700), // Gold
        const Color(0xFF006400), // Dark green
      ],
      significance: 'Traditional Senegalese fabric used in ceremonial dress and celebrations.',
    ),

    // Côte d'Ivoire - Korhogo
    AfricanCountry.coteDivoire: CulturalPattern(
      name: 'Korhogo',
      country: AfricanCountry.coteDivoire,
      type: CulturalPatternType.symbolic,
      colors: [
        const Color(0xFFF5F5DC), // Beige/cream base
        const Color(0xFF000000), // Black designs
        const Color(0xFF8B4513), // Brown earth tones
      ],
      significance: 'Hand-painted cloth featuring symbolic animals and figures from Senufo culture.',
    ),

    // Tanzania - Kanga
    AfricanCountry.tanzania: CulturalPattern(
      name: 'Kanga',
      country: AfricanCountry.tanzania,
      type: CulturalPatternType.organic,
      colors: [
        const Color(0xFFFF6B6B), // Vibrant red
        const Color(0xFF4ECDC4), // Teal
        const Color(0xFFFFE66D), // Yellow
        const Color(0xFF000000), // Black borders
      ],
      significance: 'Colorful cloth with Swahili proverbs, used for communication and cultural expression.',
    ),

    // Rwanda - Imigongo
    AfricanCountry.rwanda: CulturalPattern(
      name: 'Imigongo',
      country: AfricanCountry.rwanda,
      type: CulturalPatternType.geometric,
      colors: [
        const Color(0xFF000000), // Black
        const Color(0xFFFFFFFF), // White
        const Color(0xFFCC0000), // Red
        const Color(0xFF808080), // Gray
      ],
      significance: 'Traditional geometric art created from cow dung, representing Rwandan artistic heritage.',
    ),

    // Ethiopia - Tibeb
    AfricanCountry.ethiopia: CulturalPattern(
      name: 'Tibeb',
      country: AfricanCountry.ethiopia,
      type: CulturalPatternType.embroidery,
      colors: [
        const Color(0xFFFFFFFF), // White cotton base
        const Color(0xFFFFD700), // Gold thread
        const Color(0xFF008000), // Green
        const Color(0xFFFF0000), // Red
      ],
      significance: 'Traditional Ethiopian embroidery adorning white cotton garments, symbolizing purity and celebration.',
    ),
  };

  /// Get pattern for a specific country
  static CulturalPattern getPattern(AfricanCountry country) {
    return _patterns[country]!;
  }

  /// Get all patterns
  static List<CulturalPattern> get allPatterns => _patterns.values.toList();
}

/// Decorative pattern painter for backgrounds
class CulturalPatternPainter extends CustomPainter {
  final AfricanCountry country;
  final double opacity;
  final bool subtle;

  CulturalPatternPainter({
    required this.country,
    this.opacity = 0.1,
    this.subtle = true,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final pattern = CulturalPatternRegistry.getPattern(country);
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = subtle ? 1.0 : 2.0;

    // Draw pattern based on type
    switch (pattern.type) {
      case CulturalPatternType.geometric:
        _drawGeometricPattern(canvas, size, pattern, paint);
        break;
      case CulturalPatternType.organic:
        _drawOrganicPattern(canvas, size, pattern, paint);
        break;
      case CulturalPatternType.symbolic:
        _drawSymbolicPattern(canvas, size, pattern, paint);
        break;
      case CulturalPatternType.embroidery:
        _drawEmbroideryPattern(canvas, size, pattern, paint);
        break;
    }
  }

  void _drawGeometricPattern(Canvas canvas, Size size, CulturalPattern pattern, Paint paint) {
    final gridSize = size.width / 8;
    paint.color = pattern.colors.first.withOpacity(opacity);

    for (var x = 0.0; x < size.width; x += gridSize) {
      for (var y = 0.0; y < size.height; y += gridSize) {
        // Draw diamond shapes
        final path = Path()
          ..moveTo(x + gridSize / 2, y)
          ..lineTo(x + gridSize, y + gridSize / 2)
          ..lineTo(x + gridSize / 2, y + gridSize)
          ..lineTo(x, y + gridSize / 2)
          ..close();
        canvas.drawPath(path, paint);
      }
    }
  }

  void _drawOrganicPattern(Canvas canvas, Size size, CulturalPattern pattern, Paint paint) {
    paint.color = pattern.colors.first.withOpacity(opacity);
    final waveHeight = 20.0;
    final waveLength = size.width / 4;

    for (var y = 0.0; y < size.height; y += 40) {
      final path = Path()..moveTo(0, y);
      for (var x = 0.0; x < size.width; x += waveLength) {
        path.quadraticBezierTo(
          x + waveLength / 4, y - waveHeight,
          x + waveLength / 2, y,
        );
        path.quadraticBezierTo(
          x + 3 * waveLength / 4, y + waveHeight,
          x + waveLength, y,
        );
      }
      canvas.drawPath(path, paint);
    }
  }

  void _drawSymbolicPattern(Canvas canvas, Size size, CulturalPattern pattern, Paint paint) {
    paint.color = pattern.colors.first.withOpacity(opacity);
    final spacing = 60.0;

    for (var x = spacing / 2; x < size.width; x += spacing) {
      for (var y = spacing / 2; y < size.height; y += spacing) {
        // Draw simple symbolic circles
        canvas.drawCircle(Offset(x, y), 8, paint);
        canvas.drawCircle(Offset(x, y), 15, paint);
      }
    }
  }

  void _drawEmbroideryPattern(Canvas canvas, Size size, CulturalPattern pattern, Paint paint) {
    paint.color = pattern.colors[1].withOpacity(opacity); // Usually gold
    final spacing = 40.0;

    for (var x = 0.0; x < size.width; x += spacing) {
      for (var y = 0.0; y < size.height; y += spacing) {
        // Draw cross-stitch style pattern
        canvas.drawLine(
          Offset(x, y),
          Offset(x + 10, y + 10),
          paint,
        );
        canvas.drawLine(
          Offset(x + 10, y),
          Offset(x, y + 10),
          paint,
        );
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

/// Widget to display cultural pattern as background
class CulturalPatternBackground extends StatelessWidget {
  final AfricanCountry country;
  final Widget child;
  final double opacity;
  final bool subtle;

  const CulturalPatternBackground({
    super.key,
    required this.country,
    required this.child,
    this.opacity = 0.05,
    this.subtle = true,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(
          child: CustomPaint(
            painter: CulturalPatternPainter(
              country: country,
              opacity: opacity,
              subtle: subtle,
            ),
          ),
        ),
        child,
      ],
    );
  }
}
