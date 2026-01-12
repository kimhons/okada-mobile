import 'package:intl/intl.dart';

/// Number extensions for Okada Platform
extension NumExtensions on num {
  /// Format as currency (FCFA)
  String get formatCurrency {
    final formatter = NumberFormat('#,###', 'fr');
    return '${formatter.format(this)} FCFA';
  }

  /// Format as compact currency (e.g., "10K FCFA")
  String get formatCompactCurrency {
    if (this >= 1000000) {
      return '${(this / 1000000).toStringAsFixed(1)}M FCFA';
    } else if (this >= 1000) {
      return '${(this / 1000).toStringAsFixed(this % 1000 == 0 ? 0 : 1)}K FCFA';
    }
    return formatCurrency;
  }

  /// Format as number with thousands separator
  String get formatNumber {
    final formatter = NumberFormat('#,###', 'fr');
    return formatter.format(this);
  }

  /// Format as compact number (e.g., "10K")
  String get formatCompact {
    if (this >= 1000000) {
      return '${(this / 1000000).toStringAsFixed(1)}M';
    } else if (this >= 1000) {
      return '${(this / 1000).toStringAsFixed(this % 1000 == 0 ? 0 : 1)}K';
    }
    return toString();
  }

  /// Format as percentage
  String get formatPercentage {
    return '${toStringAsFixed(1)}%';
  }

  /// Format as distance (km or m)
  String get formatDistance {
    if (this >= 1000) {
      return '${(this / 1000).toStringAsFixed(1)} km';
    }
    return '${toStringAsFixed(0)} m';
  }

  /// Format as weight (kg or g)
  String get formatWeight {
    if (this >= 1000) {
      return '${(this / 1000).toStringAsFixed(1)} kg';
    }
    return '${toStringAsFixed(0)} g';
  }

  /// Format as rating (e.g., "4.5")
  String get formatRating {
    return toStringAsFixed(1);
  }

  /// Format as duration in minutes
  String get formatDurationMinutes {
    if (this >= 60) {
      final hours = (this / 60).floor();
      final minutes = (this % 60).round();
      if (minutes > 0) {
        return '${hours}h ${minutes}min';
      }
      return '${hours}h';
    }
    return '${round()}min';
  }

  /// Check if number is between range (inclusive)
  bool isBetween(num min, num max) => this >= min && this <= max;

  /// Clamp value between min and max
  num clampValue(num min, num max) {
    if (this < min) return min;
    if (this > max) return max;
    return this;
  }

  /// Convert to ordinal (e.g., 1 -> "1er", 2 -> "2ème")
  String get toOrdinalFr {
    if (this == 1) return '1er';
    return '${toStringAsFixed(0)}ème';
  }

  /// Round to decimal places
  double roundToDecimal(int places) {
    final mod = 10.0 * places;
    return (this * mod).round() / mod;
  }
}

/// Int extensions
extension IntExtensions on int {
  /// Generate list from 0 to this value
  List<int> get range => List.generate(this, (i) => i);

  /// Generate list from 1 to this value
  List<int> get rangeFrom1 => List.generate(this, (i) => i + 1);

  /// Check if number is even
  bool get isEven => this % 2 == 0;

  /// Check if number is odd
  bool get isOdd => this % 2 != 0;

  /// Convert seconds to Duration
  Duration get seconds => Duration(seconds: this);

  /// Convert minutes to Duration
  Duration get minutes => Duration(minutes: this);

  /// Convert hours to Duration
  Duration get hours => Duration(hours: this);

  /// Convert days to Duration
  Duration get days => Duration(days: this);

  /// Convert milliseconds to Duration
  Duration get milliseconds => Duration(milliseconds: this);
}

/// Double extensions
extension DoubleExtensions on double {
  /// Check if double is approximately equal to another
  bool approximatelyEquals(double other, {double epsilon = 0.001}) {
    return (this - other).abs() < epsilon;
  }

  /// Convert to int if it's a whole number
  num get toIntIfWhole {
    return this == toInt() ? toInt() : this;
  }

  /// Format as price (no decimals for XAF)
  String get formatPrice {
    return toInt().formatCurrency;
  }
}
