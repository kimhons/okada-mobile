import 'package:intl/intl.dart';

/// DateTime extensions for Okada Platform
extension DateTimeExtensions on DateTime {
  /// Format as date string (e.g., "15 Jan 2024")
  String get formatDate {
    return DateFormat('d MMM yyyy', 'fr').format(this);
  }

  /// Format as short date (e.g., "15/01/24")
  String get formatShortDate {
    return DateFormat('dd/MM/yy').format(this);
  }

  /// Format as time string (e.g., "14:30")
  String get formatTime {
    return DateFormat('HH:mm').format(this);
  }

  /// Format as time with seconds (e.g., "14:30:45")
  String get formatTimeWithSeconds {
    return DateFormat('HH:mm:ss').format(this);
  }

  /// Format as date and time (e.g., "15 Jan 2024 à 14:30")
  String get formatDateTime {
    return DateFormat("d MMM yyyy 'à' HH:mm", 'fr').format(this);
  }

  /// Format as relative time (e.g., "Il y a 5 minutes")
  String get formatRelative {
    final now = DateTime.now();
    final difference = now.difference(this);

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
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'Il y a $weeks semaine${weeks > 1 ? 's' : ''}';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'Il y a $months mois';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'Il y a $years an${years > 1 ? 's' : ''}';
    }
  }

  /// Format as ETA (e.g., "Dans 15 minutes")
  String get formatEta {
    final now = DateTime.now();
    final difference = this.difference(now);

    if (difference.isNegative) {
      return 'Maintenant';
    } else if (difference.inMinutes < 1) {
      return 'Dans moins d\'une minute';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return 'Dans $minutes min${minutes > 1 ? 's' : ''}';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      final minutes = difference.inMinutes % 60;
      if (minutes > 0) {
        return 'Dans ${hours}h${minutes.toString().padLeft(2, '0')}';
      }
      return 'Dans $hours heure${hours > 1 ? 's' : ''}';
    } else {
      final days = difference.inDays;
      return 'Dans $days jour${days > 1 ? 's' : ''}';
    }
  }

  /// Format as day name (e.g., "Lundi")
  String get formatDayName {
    return DateFormat('EEEE', 'fr').format(this);
  }

  /// Format as month name (e.g., "Janvier")
  String get formatMonthName {
    return DateFormat('MMMM', 'fr').format(this);
  }

  /// Check if date is today
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Check if date is yesterday
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Check if date is tomorrow
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  /// Check if date is in the past
  bool get isPast => isBefore(DateTime.now());

  /// Check if date is in the future
  bool get isFuture => isAfter(DateTime.now());

  /// Get start of day
  DateTime get startOfDay => DateTime(year, month, day);

  /// Get end of day
  DateTime get endOfDay => DateTime(year, month, day, 23, 59, 59, 999);

  /// Get start of week (Monday)
  DateTime get startOfWeek {
    final daysToSubtract = weekday - 1;
    return subtract(Duration(days: daysToSubtract)).startOfDay;
  }

  /// Get end of week (Sunday)
  DateTime get endOfWeek {
    final daysToAdd = 7 - weekday;
    return add(Duration(days: daysToAdd)).endOfDay;
  }

  /// Get start of month
  DateTime get startOfMonth => DateTime(year, month, 1);

  /// Get end of month
  DateTime get endOfMonth => DateTime(year, month + 1, 0, 23, 59, 59, 999);

  /// Add business days (excluding weekends)
  DateTime addBusinessDays(int days) {
    var result = this;
    var addedDays = 0;
    while (addedDays < days) {
      result = result.add(const Duration(days: 1));
      if (result.weekday != DateTime.saturday &&
          result.weekday != DateTime.sunday) {
        addedDays++;
      }
    }
    return result;
  }

  /// Format for API (ISO 8601)
  String get toApiFormat => toIso8601String();

  /// Smart format based on context
  String get smartFormat {
    if (isToday) {
      return 'Aujourd\'hui à ${formatTime}';
    } else if (isYesterday) {
      return 'Hier à ${formatTime}';
    } else if (isTomorrow) {
      return 'Demain à ${formatTime}';
    } else if (difference(DateTime.now()).inDays.abs() < 7) {
      return '${formatDayName} à ${formatTime}';
    } else {
      return formatDateTime;
    }
  }
}

/// Duration extensions
extension DurationExtensions on Duration {
  /// Format as readable string (e.g., "2h 30min")
  String get formatReadable {
    if (inHours > 0) {
      final hours = inHours;
      final minutes = inMinutes % 60;
      if (minutes > 0) {
        return '${hours}h ${minutes}min';
      }
      return '${hours}h';
    } else if (inMinutes > 0) {
      return '${inMinutes}min';
    } else {
      return '${inSeconds}s';
    }
  }

  /// Format as countdown (e.g., "02:30:45")
  String get formatCountdown {
    final hours = inHours;
    final minutes = inMinutes % 60;
    final seconds = inSeconds % 60;
    if (hours > 0) {
      return '${hours.toString().padLeft(2, '0')}:${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
    }
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }
}
