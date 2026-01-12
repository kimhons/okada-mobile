import 'package:intl/intl.dart';

/// Formatters for Okada Platform
class Formatters {
  Formatters._();

  static final _currencyFormat = NumberFormat('#,###', 'fr');
  static final _dateFormat = DateFormat('d MMM yyyy', 'fr');
  static final _timeFormat = DateFormat('HH:mm');
  static final _dateTimeFormat = DateFormat("d MMM yyyy 'à' HH:mm", 'fr');

  /// Format currency (XAF/FCFA)
  static String formatCurrency(num amount) {
    return '${_currencyFormat.format(amount)} FCFA';
  }

  /// Format compact currency
  static String formatCompactCurrency(num amount) {
    if (amount >= 1000000) {
      return '${(amount / 1000000).toStringAsFixed(1)}M FCFA';
    } else if (amount >= 1000) {
      return '${(amount / 1000).toStringAsFixed(amount % 1000 == 0 ? 0 : 1)}K FCFA';
    }
    return formatCurrency(amount);
  }

  /// Format number with thousands separator
  static String formatNumber(num value) {
    return _currencyFormat.format(value);
  }

  /// Format date
  static String formatDate(DateTime date) {
    return _dateFormat.format(date);
  }

  /// Format time
  static String formatTime(DateTime time) {
    return _timeFormat.format(time);
  }

  /// Format date and time
  static String formatDateTime(DateTime dateTime) {
    return _dateTimeFormat.format(dateTime);
  }

  /// Format phone number (Cameroon)
  static String formatPhone(String phone) {
    final cleaned = phone.replaceAll(RegExp(r'[^0-9]'), '');
    if (cleaned.length == 9) {
      return '+237 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}';
    }
    if (cleaned.length == 12 && cleaned.startsWith('237')) {
      final local = cleaned.substring(3);
      return '+237 ${local.substring(0, 3)} ${local.substring(3, 6)} ${local.substring(6)}';
    }
    return phone;
  }

  /// Format distance
  static String formatDistance(double meters) {
    if (meters >= 1000) {
      return '${(meters / 1000).toStringAsFixed(1)} km';
    }
    return '${meters.toStringAsFixed(0)} m';
  }

  /// Format duration
  static String formatDuration(Duration duration) {
    if (duration.inHours > 0) {
      final hours = duration.inHours;
      final minutes = duration.inMinutes % 60;
      if (minutes > 0) {
        return '${hours}h ${minutes}min';
      }
      return '${hours}h';
    } else if (duration.inMinutes > 0) {
      return '${duration.inMinutes}min';
    } else {
      return '${duration.inSeconds}s';
    }
  }

  /// Format ETA
  static String formatEta(DateTime eta) {
    final now = DateTime.now();
    final difference = eta.difference(now);

    if (difference.isNegative) {
      return 'Maintenant';
    } else if (difference.inMinutes < 1) {
      return 'Moins d\'une minute';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} min';
    } else {
      final hours = difference.inHours;
      final minutes = difference.inMinutes % 60;
      if (minutes > 0) {
        return '${hours}h ${minutes}min';
      }
      return '${hours}h';
    }
  }

  /// Format relative time
  static String formatRelativeTime(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);

    if (difference.inSeconds < 60) {
      return 'À l\'instant';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return 'Il y a $minutes min${minutes > 1 ? 's' : ''}';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return 'Il y a $hours heure${hours > 1 ? 's' : ''}';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      return 'Il y a $days jour${days > 1 ? 's' : ''}';
    } else {
      return formatDate(dateTime);
    }
  }

  /// Format order ID
  static String formatOrderId(String orderId) {
    if (orderId.length > 8) {
      return '#${orderId.substring(0, 8).toUpperCase()}';
    }
    return '#${orderId.toUpperCase()}';
  }

  /// Format rating
  static String formatRating(double rating) {
    return rating.toStringAsFixed(1);
  }

  /// Format percentage
  static String formatPercentage(double value) {
    return '${value.toStringAsFixed(1)}%';
  }

  /// Format file size
  static String formatFileSize(int bytes) {
    if (bytes >= 1024 * 1024 * 1024) {
      return '${(bytes / (1024 * 1024 * 1024)).toStringAsFixed(1)} GB';
    } else if (bytes >= 1024 * 1024) {
      return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
    } else if (bytes >= 1024) {
      return '${(bytes / 1024).toStringAsFixed(1)} KB';
    }
    return '$bytes B';
  }

  /// Format vehicle plate
  static String formatVehiclePlate(String plate) {
    final cleaned = plate.toUpperCase().replaceAll(RegExp(r'[^A-Z0-9]'), '');
    if (cleaned.length >= 7) {
      return '${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}';
    }
    return plate.toUpperCase();
  }

  /// Format address for display
  static String formatAddress(String address, {int maxLength = 50}) {
    if (address.length <= maxLength) return address;
    return '${address.substring(0, maxLength - 3)}...';
  }

  /// Format count with unit
  static String formatCount(int count, String singular, String plural) {
    return '$count ${count == 1 ? singular : plural}';
  }
}
