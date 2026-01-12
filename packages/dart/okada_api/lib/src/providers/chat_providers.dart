import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/websocket/websocket_manager.dart';

// ============ Chat Models ============

/// Chat message model
class ChatMessage {
  final int id;
  final int orderId;
  final String senderId;
  final String senderType; // 'customer' or 'rider'
  final String message;
  final String? imageUrl;
  final DateTime timestamp;
  final bool isRead;
  final MessageStatus status;

  ChatMessage({
    required this.id,
    required this.orderId,
    required this.senderId,
    required this.senderType,
    required this.message,
    this.imageUrl,
    required this.timestamp,
    this.isRead = false,
    this.status = MessageStatus.sent,
  });

  ChatMessage copyWith({
    int? id,
    int? orderId,
    String? senderId,
    String? senderType,
    String? message,
    String? imageUrl,
    DateTime? timestamp,
    bool? isRead,
    MessageStatus? status,
  }) {
    return ChatMessage(
      id: id ?? this.id,
      orderId: orderId ?? this.orderId,
      senderId: senderId ?? this.senderId,
      senderType: senderType ?? this.senderType,
      message: message ?? this.message,
      imageUrl: imageUrl ?? this.imageUrl,
      timestamp: timestamp ?? this.timestamp,
      isRead: isRead ?? this.isRead,
      status: status ?? this.status,
    );
  }

  factory ChatMessage.fromEvent(ChatMessageEvent event) {
    return ChatMessage(
      id: event.messageId,
      orderId: event.orderId,
      senderId: event.senderId,
      senderType: event.senderType,
      message: event.message,
      imageUrl: event.imageUrl,
      timestamp: event.timestamp,
      isRead: false,
      status: MessageStatus.delivered,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'orderId': orderId,
    'senderId': senderId,
    'senderType': senderType,
    'message': message,
    if (imageUrl != null) 'imageUrl': imageUrl,
    'timestamp': timestamp.toIso8601String(),
    'isRead': isRead,
    'status': status.name,
  };
}

/// Message delivery status
enum MessageStatus {
  sending,
  sent,
  delivered,
  read,
  failed,
}

// ============ Chat State ============

/// Chat state for an order conversation
class ChatState {
  final int orderId;
  final List<ChatMessage> messages;
  final bool isLoading;
  final bool isTyping; // Other party is typing
  final bool isSending;
  final String? error;
  final DateTime? lastReadTimestamp;

  ChatState({
    required this.orderId,
    this.messages = const [],
    this.isLoading = false,
    this.isTyping = false,
    this.isSending = false,
    this.error,
    this.lastReadTimestamp,
  });

  ChatState copyWith({
    int? orderId,
    List<ChatMessage>? messages,
    bool? isLoading,
    bool? isTyping,
    bool? isSending,
    String? error,
    DateTime? lastReadTimestamp,
  }) {
    return ChatState(
      orderId: orderId ?? this.orderId,
      messages: messages ?? this.messages,
      isLoading: isLoading ?? this.isLoading,
      isTyping: isTyping ?? this.isTyping,
      isSending: isSending ?? this.isSending,
      error: error,
      lastReadTimestamp: lastReadTimestamp ?? this.lastReadTimestamp,
    );
  }

  int get unreadCount => messages.where((m) => !m.isRead).length;
  
  ChatMessage? get lastMessage => messages.isNotEmpty ? messages.last : null;
}

// ============ Chat Notifier ============

/// Chat state notifier for managing conversation
class ChatNotifier extends StateNotifier<ChatState> {
  final WebSocketManager _wsManager;
  final int orderId;
  final String currentUserId;
  final String currentUserType;
  
  StreamSubscription? _messageSubscription;
  StreamSubscription? _typingSubscription;
  StreamSubscription? _readSubscription;
  
  int _tempMessageId = -1;

  ChatNotifier({
    required WebSocketManager wsManager,
    required this.orderId,
    required this.currentUserId,
    required this.currentUserType,
  }) : _wsManager = wsManager, super(ChatState(orderId: orderId)) {
    _initialize();
  }

  void _initialize() {
    // Subscribe to chat for this order
    _wsManager.subscribeToChat(orderId);

    // Listen for new messages
    _messageSubscription = _wsManager.chatMessageStream
        .where((event) => event.orderId == orderId)
        .listen(_onMessageReceived);

    // Listen for typing indicators
    _typingSubscription = _wsManager.chatTypingStream
        .where((event) => event.orderId == orderId && event.senderId != currentUserId)
        .listen(_onTypingReceived);
  }

  void _onMessageReceived(ChatMessageEvent event) {
    final message = ChatMessage.fromEvent(event);
    
    // Check if this is a confirmation of our sent message
    final existingIndex = state.messages.indexWhere(
      (m) => m.id < 0 && m.message == message.message && m.senderId == currentUserId,
    );

    if (existingIndex >= 0) {
      // Update the temporary message with the real one
      final updatedMessages = [...state.messages];
      updatedMessages[existingIndex] = message.copyWith(status: MessageStatus.delivered);
      state = state.copyWith(messages: updatedMessages, isSending: false);
    } else {
      // Add new message from other party
      state = state.copyWith(
        messages: [...state.messages, message],
        isTyping: false,
      );
    }
  }

  void _onTypingReceived(ChatTypingEvent event) {
    state = state.copyWith(isTyping: event.isTyping);
  }

  /// Send a text message
  Future<void> sendMessage(String text, {String? imageUrl}) async {
    if (text.trim().isEmpty && imageUrl == null) return;

    // Create temporary message
    final tempMessage = ChatMessage(
      id: _tempMessageId--,
      orderId: orderId,
      senderId: currentUserId,
      senderType: currentUserType,
      message: text.trim(),
      imageUrl: imageUrl,
      timestamp: DateTime.now(),
      status: MessageStatus.sending,
    );

    // Add to state immediately for optimistic update
    state = state.copyWith(
      messages: [...state.messages, tempMessage],
      isSending: true,
    );

    // Send via WebSocket
    _wsManager.sendChatMessage(
      orderId: orderId,
      message: text.trim(),
      imageUrl: imageUrl,
    );

    // Update status to sent after a short delay
    await Future.delayed(const Duration(milliseconds: 500));
    if (mounted) {
      final updatedMessages = state.messages.map((m) {
        if (m.id == tempMessage.id) {
          return m.copyWith(status: MessageStatus.sent);
        }
        return m;
      }).toList();
      state = state.copyWith(messages: updatedMessages);
    }
  }

  /// Send typing indicator
  void setTyping(bool isTyping) {
    _wsManager.sendTypingIndicator(
      orderId: orderId,
      isTyping: isTyping,
    );
  }

  /// Mark messages as read
  void markAsRead(List<int> messageIds) {
    _wsManager.markMessagesRead(
      orderId: orderId,
      messageIds: messageIds,
    );

    // Update local state
    final updatedMessages = state.messages.map((m) {
      if (messageIds.contains(m.id)) {
        return m.copyWith(isRead: true);
      }
      return m;
    }).toList();
    state = state.copyWith(
      messages: updatedMessages,
      lastReadTimestamp: DateTime.now(),
    );
  }

  /// Mark all messages as read
  void markAllAsRead() {
    final unreadIds = state.messages
        .where((m) => !m.isRead && m.senderId != currentUserId)
        .map((m) => m.id)
        .toList();
    
    if (unreadIds.isNotEmpty) {
      markAsRead(unreadIds);
    }
  }

  /// Load chat history from API
  Future<void> loadHistory() async {
    state = state.copyWith(isLoading: true);
    
    try {
      // In a real app, this would call the API to get chat history
      // For now, we'll just clear the loading state
      await Future.delayed(const Duration(milliseconds: 500));
      state = state.copyWith(isLoading: false);
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        error: e.toString(),
      );
    }
  }

  /// Clear chat history
  void clearChat() {
    state = state.copyWith(messages: []);
  }

  /// Retry sending a failed message
  Future<void> retryMessage(int messageId) async {
    final messageIndex = state.messages.indexWhere((m) => m.id == messageId);
    if (messageIndex < 0) return;

    final message = state.messages[messageIndex];
    if (message.status != MessageStatus.failed) return;

    // Update status to sending
    final updatedMessages = [...state.messages];
    updatedMessages[messageIndex] = message.copyWith(status: MessageStatus.sending);
    state = state.copyWith(messages: updatedMessages);

    // Resend
    _wsManager.sendChatMessage(
      orderId: orderId,
      message: message.message,
      imageUrl: message.imageUrl,
    );
  }

  /// Delete a message (local only)
  void deleteMessage(int messageId) {
    final updatedMessages = state.messages.where((m) => m.id != messageId).toList();
    state = state.copyWith(messages: updatedMessages);
  }

  @override
  void dispose() {
    _messageSubscription?.cancel();
    _typingSubscription?.cancel();
    _readSubscription?.cancel();
    _wsManager.unsubscribeFromChat(orderId);
    super.dispose();
  }
}

// ============ Chat Providers ============

/// Current user ID provider (should be set by auth)
final currentUserIdProvider = Provider<String>((ref) {
  // This should come from auth state
  return '';
});

/// Current user type provider (should be set by auth)
final currentUserTypeProvider = Provider<String>((ref) {
  // This should come from auth state - 'customer' or 'rider'
  return 'customer';
});

/// Chat provider family for each order
final chatProvider = StateNotifierProvider.family<ChatNotifier, ChatState, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  final userId = ref.watch(currentUserIdProvider);
  final userType = ref.watch(currentUserTypeProvider);
  
  return ChatNotifier(
    wsManager: wsManager,
    orderId: orderId,
    currentUserId: userId,
    currentUserType: userType,
  );
});

/// WebSocket manager provider (imported from live_tracking_providers)
final webSocketManagerProvider = Provider<WebSocketManager>((ref) {
  return WebSocketManager.instance;
});

/// Chat message stream for an order
final chatMessageStreamProvider = StreamProvider.family<ChatMessageEvent, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.chatMessageStream.where((event) => event.orderId == orderId);
});

/// Typing indicator stream for an order
final chatTypingStreamProvider = StreamProvider.family<ChatTypingEvent, int>((ref, orderId) {
  final wsManager = ref.watch(webSocketManagerProvider);
  return wsManager.chatTypingStream.where((event) => event.orderId == orderId);
});

/// Unread message count for an order
final unreadMessageCountProvider = Provider.family<int, int>((ref, orderId) {
  final chatState = ref.watch(chatProvider(orderId));
  return chatState.unreadCount;
});

/// Last message for an order
final lastMessageProvider = Provider.family<ChatMessage?, int>((ref, orderId) {
  final chatState = ref.watch(chatProvider(orderId));
  return chatState.lastMessage;
});

/// Is other party typing for an order
final isTypingProvider = Provider.family<bool, int>((ref, orderId) {
  final chatState = ref.watch(chatProvider(orderId));
  return chatState.isTyping;
});

// ============ Chat List Provider ============

/// Active chats state
class ActiveChatsState {
  final Map<int, ChatState> chats;
  final bool isLoading;

  ActiveChatsState({
    this.chats = const {},
    this.isLoading = false,
  });

  int get totalUnreadCount => chats.values.fold(0, (sum, chat) => sum + chat.unreadCount);
  
  List<int> get orderIds => chats.keys.toList();
}

/// Active chats notifier
class ActiveChatsNotifier extends StateNotifier<ActiveChatsState> {
  ActiveChatsNotifier() : super(ActiveChatsState());

  void addChat(int orderId, ChatState chatState) {
    state = ActiveChatsState(
      chats: {...state.chats, orderId: chatState},
      isLoading: state.isLoading,
    );
  }

  void removeChat(int orderId) {
    final updatedChats = Map<int, ChatState>.from(state.chats);
    updatedChats.remove(orderId);
    state = ActiveChatsState(
      chats: updatedChats,
      isLoading: state.isLoading,
    );
  }

  void updateChat(int orderId, ChatState chatState) {
    state = ActiveChatsState(
      chats: {...state.chats, orderId: chatState},
      isLoading: state.isLoading,
    );
  }
}

/// Active chats provider
final activeChatsProvider = StateNotifierProvider<ActiveChatsNotifier, ActiveChatsState>((ref) {
  return ActiveChatsNotifier();
});

/// Total unread message count across all chats
final totalUnreadCountProvider = Provider<int>((ref) {
  final activeChats = ref.watch(activeChatsProvider);
  return activeChats.totalUnreadCount;
});

// ============ Quick Replies ============

/// Quick reply suggestions
final quickRepliesProvider = Provider<List<String>>((ref) {
  return [
    'Je suis en route',
    'J\'arrive dans 5 minutes',
    'Je suis arrivé',
    'Où êtes-vous exactement?',
    'Merci!',
    'D\'accord',
    'Un moment s\'il vous plaît',
    'Pouvez-vous m\'appeler?',
  ];
});

/// Quick replies for riders
final riderQuickRepliesProvider = Provider<List<String>>((ref) {
  return [
    'Je suis en route',
    'J\'arrive dans 5 minutes',
    'Je suis au point de récupération',
    'J\'ai récupéré la commande',
    'Je suis à votre porte',
    'Pouvez-vous descendre?',
    'Merci pour votre commande!',
    'Un moment s\'il vous plaît',
  ];
});

/// Quick replies for customers
final customerQuickRepliesProvider = Provider<List<String>>((ref) {
  return [
    'Où êtes-vous?',
    'Combien de temps encore?',
    'Je suis là',
    'Merci!',
    'D\'accord',
    'Pouvez-vous m\'appeler?',
    'Je descends',
    'Attendez un moment',
  ];
});
