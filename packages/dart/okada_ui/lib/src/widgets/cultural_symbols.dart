import 'package:flutter/material.dart';
import '../theme/okada_design_system.dart';

/// Traditional Cameroonian Cultural Symbols
/// 
/// These symbols are used throughout the Okada platform to reinforce
/// cultural identity and provide visual communication.
enum CulturalSymbol {
  /// Crocodile - Represents adaptability
  /// Used in onboarding to show platform flexibility
  crocodile,
  
  /// Sun - Represents prosperity
  /// Used in earnings displays and success states
  sun,
  
  /// Linked Hearts - Represents unity
  /// Used in community features and referrals
  linkedHearts,
  
  /// Palm Tree - Represents growth
  /// Used in progress indicators
  palmTree,
  
  /// Basket - Represents abundance
  /// Used in cart and shopping features
  basket,
  
  /// Motorcycle (Okada) - Represents speed and reliability
  /// Used in delivery tracking
  motorcycle,
}

/// Cultural Symbol Widget
/// 
/// Renders traditional Cameroonian symbols as custom painted icons.
class CulturalSymbolIcon extends StatelessWidget {
  const CulturalSymbolIcon({
    super.key,
    required this.symbol,
    this.size = 24,
    this.color,
    this.backgroundColor,
  });

  final CulturalSymbol symbol;
  final double size;
  final Color? color;
  final Color? backgroundColor;

  @override
  Widget build(BuildContext context) {
    final symbolColor = color ?? _getDefaultColor(symbol);
    
    return Container(
      width: size,
      height: size,
      decoration: backgroundColor != null
          ? BoxDecoration(
              color: backgroundColor,
              shape: BoxShape.circle,
            )
          : null,
      child: CustomPaint(
        size: Size(size, size),
        painter: _CulturalSymbolPainter(
          symbol: symbol,
          color: symbolColor,
        ),
      ),
    );
  }

  Color _getDefaultColor(CulturalSymbol symbol) {
    switch (symbol) {
      case CulturalSymbol.crocodile:
        return OkadaDesignSystem.ndopBlue;
      case CulturalSymbol.sun:
        return OkadaDesignSystem.okadaYellow;
      case CulturalSymbol.linkedHearts:
        return OkadaDesignSystem.okadaRed;
      case CulturalSymbol.palmTree:
        return OkadaDesignSystem.palmGreen;
      case CulturalSymbol.basket:
        return OkadaDesignSystem.marketSoil;
      case CulturalSymbol.motorcycle:
        return OkadaDesignSystem.okadaGreen;
    }
  }
}

class _CulturalSymbolPainter extends CustomPainter {
  _CulturalSymbolPainter({
    required this.symbol,
    required this.color,
  });

  final CulturalSymbol symbol;
  final Color color;

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;
    
    final strokePaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = size.width * 0.08
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;

    switch (symbol) {
      case CulturalSymbol.crocodile:
        _paintCrocodile(canvas, size, paint, strokePaint);
        break;
      case CulturalSymbol.sun:
        _paintSun(canvas, size, paint, strokePaint);
        break;
      case CulturalSymbol.linkedHearts:
        _paintLinkedHearts(canvas, size, paint);
        break;
      case CulturalSymbol.palmTree:
        _paintPalmTree(canvas, size, paint, strokePaint);
        break;
      case CulturalSymbol.basket:
        _paintBasket(canvas, size, paint, strokePaint);
        break;
      case CulturalSymbol.motorcycle:
        _paintMotorcycle(canvas, size, paint, strokePaint);
        break;
    }
  }

  void _paintCrocodile(Canvas canvas, Size size, Paint fill, Paint stroke) {
    final path = Path();
    final w = size.width;
    final h = size.height;
    
    // Simplified crocodile silhouette
    path.moveTo(w * 0.1, h * 0.5);
    path.quadraticBezierTo(w * 0.15, h * 0.35, w * 0.25, h * 0.4);
    path.lineTo(w * 0.7, h * 0.4);
    path.quadraticBezierTo(w * 0.85, h * 0.35, w * 0.9, h * 0.45);
    path.lineTo(w * 0.95, h * 0.5);
    path.lineTo(w * 0.9, h * 0.55);
    path.quadraticBezierTo(w * 0.85, h * 0.65, w * 0.7, h * 0.6);
    path.lineTo(w * 0.25, h * 0.6);
    path.quadraticBezierTo(w * 0.15, h * 0.65, w * 0.1, h * 0.5);
    path.close();
    
    // Legs
    canvas.drawLine(Offset(w * 0.3, h * 0.6), Offset(w * 0.25, h * 0.75), stroke);
    canvas.drawLine(Offset(w * 0.35, h * 0.6), Offset(w * 0.4, h * 0.75), stroke);
    canvas.drawLine(Offset(w * 0.55, h * 0.6), Offset(w * 0.5, h * 0.75), stroke);
    canvas.drawLine(Offset(w * 0.6, h * 0.6), Offset(w * 0.65, h * 0.75), stroke);
    
    canvas.drawPath(path, fill);
    
    // Eye
    canvas.drawCircle(
      Offset(w * 0.8, h * 0.45),
      w * 0.03,
      Paint()..color = Colors.white,
    );
  }

  void _paintSun(Canvas canvas, Size size, Paint fill, Paint stroke) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width * 0.25;
    
    // Sun rays
    for (int i = 0; i < 12; i++) {
      final angle = (i * 30) * 3.14159 / 180;
      final innerRadius = radius * 1.2;
      final outerRadius = radius * 1.6;
      
      canvas.drawLine(
        Offset(
          center.dx + innerRadius * cos(angle),
          center.dy + innerRadius * sin(angle),
        ),
        Offset(
          center.dx + outerRadius * cos(angle),
          center.dy + outerRadius * sin(angle),
        ),
        stroke,
      );
    }
    
    // Sun circle
    canvas.drawCircle(center, radius, fill);
  }

  void _paintLinkedHearts(Canvas canvas, Size size, Paint fill) {
    final w = size.width;
    final h = size.height;
    
    // Left heart
    final leftHeart = Path();
    leftHeart.moveTo(w * 0.35, h * 0.55);
    leftHeart.cubicTo(w * 0.35, h * 0.35, w * 0.1, h * 0.35, w * 0.1, h * 0.5);
    leftHeart.cubicTo(w * 0.1, h * 0.7, w * 0.35, h * 0.8, w * 0.35, h * 0.8);
    leftHeart.cubicTo(w * 0.35, h * 0.8, w * 0.6, h * 0.7, w * 0.6, h * 0.5);
    leftHeart.cubicTo(w * 0.6, h * 0.35, w * 0.35, h * 0.35, w * 0.35, h * 0.55);
    leftHeart.close();
    
    // Right heart (overlapping)
    final rightHeart = Path();
    rightHeart.moveTo(w * 0.65, h * 0.45);
    rightHeart.cubicTo(w * 0.65, h * 0.25, w * 0.4, h * 0.25, w * 0.4, h * 0.4);
    rightHeart.cubicTo(w * 0.4, h * 0.6, w * 0.65, h * 0.7, w * 0.65, h * 0.7);
    rightHeart.cubicTo(w * 0.65, h * 0.7, w * 0.9, h * 0.6, w * 0.9, h * 0.4);
    rightHeart.cubicTo(w * 0.9, h * 0.25, w * 0.65, h * 0.25, w * 0.65, h * 0.45);
    rightHeart.close();
    
    canvas.drawPath(leftHeart, fill);
    canvas.drawPath(rightHeart, fill);
  }

  void _paintPalmTree(Canvas canvas, Size size, Paint fill, Paint stroke) {
    final w = size.width;
    final h = size.height;
    
    // Trunk
    final trunk = Path();
    trunk.moveTo(w * 0.45, h * 0.95);
    trunk.lineTo(w * 0.55, h * 0.95);
    trunk.lineTo(w * 0.52, h * 0.45);
    trunk.lineTo(w * 0.48, h * 0.45);
    trunk.close();
    canvas.drawPath(trunk, fill);
    
    // Fronds
    for (int i = 0; i < 5; i++) {
      final angle = (-60 + i * 30) * 3.14159 / 180;
      final frond = Path();
      final startX = w * 0.5;
      final startY = h * 0.4;
      final length = w * 0.4;
      
      frond.moveTo(startX, startY);
      frond.quadraticBezierTo(
        startX + length * 0.5 * cos(angle),
        startY + length * 0.5 * sin(angle) - h * 0.1,
        startX + length * cos(angle),
        startY + length * sin(angle),
      );
      
      canvas.drawPath(frond, stroke);
    }
  }

  void _paintBasket(Canvas canvas, Size size, Paint fill, Paint stroke) {
    final w = size.width;
    final h = size.height;
    
    // Basket body
    final basket = Path();
    basket.moveTo(w * 0.15, h * 0.4);
    basket.lineTo(w * 0.25, h * 0.85);
    basket.lineTo(w * 0.75, h * 0.85);
    basket.lineTo(w * 0.85, h * 0.4);
    basket.close();
    
    canvas.drawPath(basket, fill);
    
    // Basket weave pattern
    for (double y = h * 0.5; y < h * 0.8; y += h * 0.1) {
      canvas.drawLine(
        Offset(w * 0.2, y),
        Offset(w * 0.8, y),
        stroke..color = color.withOpacity(0.5),
      );
    }
    
    // Handle
    final handle = Path();
    handle.moveTo(w * 0.3, h * 0.4);
    handle.quadraticBezierTo(w * 0.5, h * 0.1, w * 0.7, h * 0.4);
    canvas.drawPath(handle, stroke);
  }

  void _paintMotorcycle(Canvas canvas, Size size, Paint fill, Paint stroke) {
    final w = size.width;
    final h = size.height;
    
    // Wheels
    canvas.drawCircle(Offset(w * 0.25, h * 0.7), w * 0.12, stroke);
    canvas.drawCircle(Offset(w * 0.75, h * 0.7), w * 0.12, stroke);
    
    // Body
    final body = Path();
    body.moveTo(w * 0.25, h * 0.6);
    body.lineTo(w * 0.4, h * 0.4);
    body.lineTo(w * 0.6, h * 0.35);
    body.lineTo(w * 0.75, h * 0.5);
    body.lineTo(w * 0.75, h * 0.6);
    body.close();
    canvas.drawPath(body, fill);
    
    // Handlebars
    canvas.drawLine(
      Offset(w * 0.55, h * 0.35),
      Offset(w * 0.65, h * 0.25),
      stroke,
    );
    canvas.drawLine(
      Offset(w * 0.6, h * 0.25),
      Offset(w * 0.7, h * 0.25),
      stroke,
    );
    
    // Seat
    canvas.drawLine(
      Offset(w * 0.35, h * 0.4),
      Offset(w * 0.55, h * 0.35),
      stroke..strokeWidth = size.width * 0.06,
    );
  }

  double cos(double radians) => _cos(radians);
  double sin(double radians) => _sin(radians);
  
  static double _cos(double radians) {
    return (radians == 0) ? 1.0 : 
           (radians == 1.5708) ? 0.0 :
           (radians == 3.1416) ? -1.0 :
           (radians == 4.7124) ? 0.0 :
           _taylorCos(radians);
  }
  
  static double _sin(double radians) {
    return (radians == 0) ? 0.0 :
           (radians == 1.5708) ? 1.0 :
           (radians == 3.1416) ? 0.0 :
           (radians == 4.7124) ? -1.0 :
           _taylorSin(radians);
  }
  
  static double _taylorCos(double x) {
    double result = 1.0;
    double term = 1.0;
    for (int n = 1; n <= 10; n++) {
      term *= -x * x / ((2 * n - 1) * (2 * n));
      result += term;
    }
    return result;
  }
  
  static double _taylorSin(double x) {
    double result = x;
    double term = x;
    for (int n = 1; n <= 10; n++) {
      term *= -x * x / ((2 * n) * (2 * n + 1));
      result += term;
    }
    return result;
  }

  @override
  bool shouldRepaint(covariant _CulturalSymbolPainter oldDelegate) {
    return oldDelegate.symbol != symbol || oldDelegate.color != color;
  }
}

/// Cultural Symbol Badge
/// 
/// A badge widget that displays a cultural symbol with optional label.
class CulturalSymbolBadge extends StatelessWidget {
  const CulturalSymbolBadge({
    super.key,
    required this.symbol,
    this.label,
    this.size = 48,
    this.showBackground = true,
  });

  final CulturalSymbol symbol;
  final String? label;
  final double size;
  final bool showBackground;

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: size,
          height: size,
          decoration: showBackground
              ? BoxDecoration(
                  color: OkadaDesignSystem.marketWhite,
                  shape: BoxShape.circle,
                  boxShadow: OkadaDesignSystem.shadowSmall,
                )
              : null,
          padding: EdgeInsets.all(size * 0.15),
          child: CulturalSymbolIcon(
            symbol: symbol,
            size: size * 0.7,
          ),
        ),
        if (label != null) ...[
          const SizedBox(height: 8),
          Text(
            label!,
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w500,
              color: OkadaDesignSystem.marketSoil,
            ),
          ),
        ],
      ],
    );
  }
}

/// Get the meaning of a cultural symbol
String getCulturalSymbolMeaning(CulturalSymbol symbol, {String locale = 'en'}) {
  final meanings = {
    CulturalSymbol.crocodile: {
      'en': 'Adaptability',
      'fr': 'Adaptabilité',
    },
    CulturalSymbol.sun: {
      'en': 'Prosperity',
      'fr': 'Prospérité',
    },
    CulturalSymbol.linkedHearts: {
      'en': 'Unity',
      'fr': 'Unité',
    },
    CulturalSymbol.palmTree: {
      'en': 'Growth',
      'fr': 'Croissance',
    },
    CulturalSymbol.basket: {
      'en': 'Abundance',
      'fr': 'Abondance',
    },
    CulturalSymbol.motorcycle: {
      'en': 'Speed & Reliability',
      'fr': 'Rapidité et Fiabilité',
    },
  };
  
  return meanings[symbol]?[locale] ?? meanings[symbol]?['en'] ?? '';
}
