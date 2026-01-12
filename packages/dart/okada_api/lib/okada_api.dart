/// Okada API Package
/// 
/// This package provides all API services, providers, and models for the Okada
/// delivery platform. It includes:
/// 
/// - **API Client**: Dio-based HTTP client with authentication and error handling
/// - **Services**: Product, Store, Cart, Order, Payment, and WebSocket services
/// - **Providers**: Riverpod providers for state management across all features
/// - **Real-time**: WebSocket integration for live tracking and messaging
/// - **Payments**: MTN Mobile Money and Orange Money integrations
library okada_api;

// ============ Core Exports ============
export 'src/client/api_client.dart';
export 'src/client/api_interceptors.dart';

// ============ Exceptions ============
export 'src/exceptions/api_exceptions.dart';

// ============ Models ============
export 'src/models/auth_models.dart';
export 'src/models/order_models.dart';
export 'src/models/api_models.dart';

// ============ Services ============
export 'src/services/auth_service.dart';
export 'src/services/order_service.dart';
export 'src/services/product_service.dart';
export 'src/services/store_service.dart';
export 'src/services/cart_service.dart';
export 'src/services/customer_order_service.dart';
export 'src/services/rider_order_service.dart';
export 'src/services/rider_earnings_service.dart';

// WebSocket Services
export 'src/services/websocket/websocket_service.dart';
export 'src/services/websocket/websocket_manager.dart';

// Location Services
export 'src/services/location/location_tracking_service.dart';

// Payment Services
export 'src/services/payment/payment_service.dart';
export 'src/services/payment/mtn_momo_service.dart';
export 'src/services/payment/orange_money_service.dart';
export 'src/services/payment/mtn_momo_integration.dart';
export 'src/services/payment/orange_money_integration.dart';

// ============ Providers ============
export 'src/providers/api_providers.dart';
export 'src/providers/realtime_providers.dart';
export 'src/providers/payment_providers.dart';
export 'src/providers/live_tracking_providers.dart';
export 'src/providers/chat_providers.dart';
export 'src/providers/unified_payment_providers.dart';
