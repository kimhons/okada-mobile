import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared/api/okada_api_client.dart';

// Notification model
class AppNotification {
  final String id;
  final String type; // 'order', 'promotion', 'product'
  final String title;
  final String message;
  final DateTime time;
  final bool isRead;
  final Map<String, dynamic>? data;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.message,
    required this.time,
    this.isRead = false,
    this.data,
  });

  factory AppNotification.fromJson(Map<String, dynamic> json) {
    return AppNotification(
      id: json['id'] as String,
      type: json['type'] as String,
      title: json['title'] as String,
      message: json['message'] as String,
      time: DateTime.parse(json['time'] as String),
      isRead: json['isRead'] as bool? ?? false,
      data: json['data'] as Map<String, dynamic>?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'title': title,
      'message': message,
      'time': time.toIso8601String(),
      'isRead': isRead,
      'data': data,
    };
  }

  AppNotification copyWith({
    String? id,
    String? type,
    String? title,
    String? message,
    DateTime? time,
    bool? isRead,
    Map<String, dynamic>? data,
  }) {
    return AppNotification(
      id: id ?? this.id,
      type: type ?? this.type,
      title: title ?? this.title,
      message: message ?? this.message,
      time: time ?? this.time,
      isRead: isRead ?? this.isRead,
      data: data ?? this.data,
    );
  }
}

// Notifications state
class NotificationsState {
  final List<AppNotification> notifications;
  final bool isLoading;
  final String? error;
  final int unreadCount;

  NotificationsState({
    this.notifications = const [],
    this.isLoading = false,
    this.error,
    this.unreadCount = 0,
  });

  NotificationsState copyWith({
    List<AppNotification>? notifications,
    bool? isLoading,
    String? error,
    int? unreadCount,
  }) {
    return NotificationsState(
      notifications: notifications ?? this.notifications,
      isLoading: isLoading ?? this.isLoading,
      error: error,
      unreadCount: unreadCount ?? this.unreadCount,
    );
  }
}

// Notifications provider
class NotificationsNotifier extends StateNotifier<NotificationsState> {
  final OkadaApiClient _apiClient;

  NotificationsNotifier(this._apiClient) : super(NotificationsState()) {
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(seconds: 1));

      // Mock notifications
      final notifications = [
        AppNotification(
          id: '1',
          type: 'order',
          title: 'Order Delivered',
          message: 'Your order #12347 has been delivered successfully',
          time: DateTime.now().subtract(const Duration(hours: 2)),
          isRead: false,
        ),
        AppNotification(
          id: '2',
          type: 'promotion',
          title: '50% Off on Fresh Vegetables',
          message: 'Get 50% discount on all fresh vegetables this weekend',
          time: DateTime.now().subtract(const Duration(hours: 5)),
          isRead: false,
        ),
        AppNotification(
          id: '3',
          type: 'order',
          title: 'Order Out for Delivery',
          message: 'Your order #12346 is out for delivery',
          time: DateTime.now().subtract(const Duration(days: 1)),
          isRead: true,
        ),
      ];

      final unreadCount =
          notifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: notifications,
        unreadCount: unreadCount,
        isLoading: false,
      );
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: 'Failed to load notifications: $e',
      );
    }
  }

  Future<void> markAsRead(String notificationId) async {
    final index =
        state.notifications.indexWhere((n) => n.id == notificationId);
    if (index == -1) return;

    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedNotifications = List<AppNotification>.from(state.notifications);
      updatedNotifications[index] = updatedNotifications[index].copyWith(isRead: true);

      final unreadCount =
          updatedNotifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: unreadCount,
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to mark notification as read: $e');
    }
  }

  Future<void> markAllAsRead() async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedNotifications = state.notifications
          .map((n) => n.copyWith(isRead: true))
          .toList();

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: 0,
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to mark all as read: $e');
    }
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      // TODO: Replace with actual API call
      await Future.delayed(const Duration(milliseconds: 500));

      final updatedNotifications = state.notifications
          .where((n) => n.id != notificationId)
          .toList();

      final unreadCount =
          updatedNotifications.where((n) => !n.isRead).length;

      state = state.copyWith(
        notifications: updatedNotifications,
        unreadCount: unreadCount,
      );
    } catch (e) {
      state = state.copyWith(error: 'Failed to delete notification: $e');
    }
  }
}

// Provider instance
final notificationsProvider =
    StateNotifierProvider<NotificationsNotifier, NotificationsState>((ref) {
  final apiClient = ref.watch(okadaApiClientProvider);
  return NotificationsNotifier(apiClient);
});

// Unread count provider
final unreadNotificationsCountProvider = Provider<int>((ref) {
  return ref.watch(notificationsProvider).unreadCount;
});

