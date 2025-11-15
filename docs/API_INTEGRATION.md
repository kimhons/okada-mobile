# Okada Mobile - API Integration Guide

Complete guide for integrating the Okada Platform API into Flutter mobile apps.

## 📚 Table of Contents

- [Overview](#overview)
- [Setup](#setup)
- [API Client Usage](#api-client-usage)
- [Authentication](#authentication)
- [Common Patterns](#common-patterns)
- [Error Handling](#error-handling)
- [Offline Support](#offline-support)
- [Best Practices](#best-practices)

---

## 🌟 Overview

The Okada mobile apps use a custom API client wrapper (`OkadaApiClient`) built on top of Dio for HTTP requests. The client provides:

- ✅ Automatic authentication handling
- ✅ Request/response interceptors
- ✅ Error handling
- ✅ Cameroon-specific formatting (FCFA, +237)
- ✅ Environment-based base URLs
- ✅ Type-safe API calls

---

## 🔧 Setup

### 1. Add Dependencies

The shared package already includes the necessary dependencies in `pubspec.yaml`:

```yaml
dependencies:
  dio: ^5.4.0
  flutter: ^3.0.0
```

### 2. Import the API Client

```dart
import 'package:okada_shared/api/okada_api_client.dart';
```

### 3. Initialize the Client

```dart
// In your app initialization (e.g., main.dart)
final apiClient = OkadaApiClient();

// Or with custom base URL
final apiClient = OkadaApiClient(
  baseUrl: 'https://api.okada.cm/v1',
);

// Or with existing access token
final apiClient = OkadaApiClient(
  accessToken: 'your_saved_token',
);
```

### 4. Provide to App (Using Riverpod)

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Create a provider for the API client
final apiClientProvider = Provider<OkadaApiClient>((ref) {
  return OkadaApiClient();
});

// Use in your app
void main() {
  runApp(
    ProviderScope(
      child: MyApp(),
    ),
  );
}
```

---

## 🔐 Authentication

### Register

```dart
try {
  final response = await apiClient.register(
    name: 'Jean Dupont',
    email: 'jean.dupont@email.com',
    password: 'SecurePassword123!',
    phone: '+237650123456',
    role: 'customer',
    language: 'fr',
  );
  
  // Token is automatically saved in the client
  final user = response['user'];
  print('Welcome ${user['name']}!');
} catch (e) {
  print('Registration failed: $e');
}
```

### Login

```dart
try {
  final response = await apiClient.login(
    email: 'jean.dupont@email.com',
    password: 'SecurePassword123!',
  );
  
  // Token is automatically saved
  final accessToken = response['access_token'];
  final user = response['user'];
  
  // Save token to secure storage for persistence
  await secureStorage.write(key: 'access_token', value: accessToken);
} catch (e) {
  print('Login failed: $e');
}
```

### Logout

```dart
try {
  await apiClient.logout();
  
  // Clear saved token
  await secureStorage.delete(key: 'access_token');
} catch (e) {
  print('Logout failed: $e');
}
```

### Restore Session

```dart
// On app startup, restore saved token
final savedToken = await secureStorage.read(key: 'access_token');
if (savedToken != null) {
  apiClient.setAccessToken(savedToken);
  
  // Verify token is still valid
  try {
    final user = await apiClient.getCurrentUser();
    print('Session restored for ${user['name']}');
  } catch (e) {
    // Token expired, clear it
    apiClient.clearAccessToken();
    await secureStorage.delete(key: 'access_token');
  }
}
```

---

## 🛒 API Client Usage

### Products

**List Products:**
```dart
final response = await apiClient.listProducts(
  page: 1,
  perPage: 20,
  categoryId: 1,
  search: 'phone',
  minPrice: 100000,
  maxPrice: 500000,
  sort: 'price_asc',
);

final products = response['data'] as List;
final meta = response['meta'];
print('Showing ${products.length} of ${meta['total']} products');
```

**Get Product Details:**
```dart
final product = await apiClient.getProduct(123);
print('${product['name']}: ${product['price']} FCFA');
```

**Create Product (Seller):**
```dart
final product = await apiClient.createProduct(
  name: 'Samsung Galaxy S21',
  description: 'Latest Samsung flagship',
  price: 350000,
  stock: 50,
  categoryIds: [1, 2],
);
print('Product created with ID: ${product['id']}');
```

**Upload Product Images:**
```dart
final images = await apiClient.uploadProductImages(
  productId,
  ['/path/to/image1.jpg', '/path/to/image2.jpg'],
);
print('Uploaded ${images.length} images');
```

### Shopping Cart

**Get Cart:**
```dart
final cart = await apiClient.getCart();
print('Cart total: ${cart['total']} FCFA');
```

**Add to Cart:**
```dart
final cart = await apiClient.addCartItem(
  productId: 123,
  quantity: 2,
);
print('Cart updated: ${cart['items'].length} items');
```

**Update Cart Item:**
```dart
final cart = await apiClient.updateCartItem(
  itemId,
  quantity: 3,
);
```

**Remove from Cart:**
```dart
final cart = await apiClient.removeCartItem(itemId);
```

**Clear Cart:**
```dart
await apiClient.clearCart();
```

### Orders

**Create Order:**
```dart
final order = await apiClient.createOrder(
  deliveryAddress: {
    'street': '123 Avenue de la Liberté',
    'city': 'Douala',
    'region': 'Littoral',
    'country': 'Cameroon',
    'phone': '+237650123456',
  },
  paymentMethod: 'mtn_money',
  phoneNumber: '+237650123456',
  notes: 'Please call before delivery',
);

print('Order created: ${order['order_number']}');
```

**Get Order Details:**
```dart
final order = await apiClient.getOrder(123);
print('Order status: ${order['status']}');
```

**List Orders:**
```dart
final response = await apiClient.listOrders(
  page: 1,
  status: 'in_transit',
);

final orders = response['data'] as List;
```

**Cancel Order:**
```dart
final order = await apiClient.cancelOrder(123);
print('Order cancelled');
```

### Quality Verification (KEY DIFFERENTIATOR!)

**Submit Photos (Rider):**
```dart
final verification = await apiClient.submitQualityVerification(
  orderId: 123,
  photoPaths: [
    '/path/to/photo1.jpg',
    '/path/to/photo2.jpg',
    '/path/to/photo3.jpg',
  ],
  notes: 'Product looks good, ready for delivery',
);

print('Verification submitted, status: ${verification['status']}');
```

**Get Verification:**
```dart
final verification = await apiClient.getQualityVerification(123);
print('Status: ${verification['status']}');
print('Photos: ${verification['photos'].length}');
```

**Approve Photos (Customer):**
```dart
final verification = await apiClient.approveQualityVerification(123);
print('Photos approved!');
```

**Reject Photos (Customer):**
```dart
final verification = await apiClient.rejectQualityVerification(
  123,
  reason: 'Product appears damaged',
);
print('Photos rejected');
```

### Payments

**Initiate Payment:**
```dart
final payment = await apiClient.initiatePayment(
  orderId: 123,
  paymentMethod: 'mtn_money',
  phoneNumber: '+237650123456',
);

print('Payment initiated: ${payment['transaction_id']}');
print('Status: ${payment['status']}');
```

**Check Payment Status:**
```dart
final payment = await apiClient.getPaymentStatus(123);
print('Payment status: ${payment['status']}');
```

### Deliveries (Rider)

**Get Available Deliveries:**
```dart
final deliveries = await apiClient.getAvailableDeliveries(
  latitude: 4.0511,
  longitude: 9.7679,
  radius: 5.0,
);

print('${deliveries.length} deliveries available');
```

**Accept Delivery:**
```dart
final delivery = await apiClient.acceptDelivery(123);
print('Delivery accepted');
```

**Confirm Pickup:**
```dart
final delivery = await apiClient.confirmPickup(123);
print('Pickup confirmed');
```

**Update Location:**
```dart
await apiClient.updateDeliveryLocation(
  123,
  latitude: 4.0511,
  longitude: 9.7679,
);
```

**Complete Delivery:**
```dart
final delivery = await apiClient.completeDelivery(
  123,
  signature: base64EncodedSignature,
  notes: 'Delivered successfully',
);
print('Delivery completed!');
```

### Reviews

**Create Review:**
```dart
final review = await apiClient.createReview(
  productId: 123,
  rating: 5,
  comment: 'Excellent product!',
);
```

**Get Product Reviews:**
```dart
final response = await apiClient.getProductReviews(
  123,
  page: 1,
);

final reviews = response['data'] as List;
```

### Seller Dashboard

**Get Dashboard:**
```dart
final dashboard = await apiClient.getSellerDashboard();
print('Total revenue: ${dashboard['total_revenue']} FCFA');
print('Total orders: ${dashboard['total_orders']}');
```

**Get Earnings:**
```dart
final earnings = await apiClient.getSellerEarnings(
  startDate: '2024-01-01',
  endDate: '2024-01-31',
);
print('Earnings: ${earnings['total_earnings']} FCFA');
```

### Rider Dashboard

**Get Dashboard:**
```dart
final dashboard = await apiClient.getRiderDashboard();
print('Total deliveries: ${dashboard['total_deliveries']}');
print('Today earnings: ${dashboard['today_earnings']} FCFA');
```

**Update Status:**
```dart
await apiClient.updateRiderStatus(status: 'online');
```

### Notifications

**Get Notifications:**
```dart
final response = await apiClient.getNotifications(
  page: 1,
  read: false,
);

final notifications = response['data'] as List;
```

**Mark as Read:**
```dart
await apiClient.markNotificationRead(123);
```

**Register Device Token:**
```dart
await apiClient.registerDeviceToken(
  token: fcmToken,
  platform: 'android',
);
```

---

## 🎯 Common Patterns

### Using with Riverpod State Management

**Create a provider:**
```dart
final productsProvider = FutureProvider.autoDispose.family<Map<String, dynamic>, int>(
  (ref, page) async {
    final apiClient = ref.read(apiClientProvider);
    return await apiClient.listProducts(page: page);
  },
);
```

**Use in a widget:**
```dart
class ProductListScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productsAsync = ref.watch(productsProvider(1));
    
    return productsAsync.when(
      data: (response) {
        final products = response['data'] as List;
        return ListView.builder(
          itemCount: products.length,
          itemBuilder: (context, index) {
            final product = products[index];
            return ProductCard(product: product);
          },
        );
      },
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => Text('Error: $error'),
    );
  }
}
```

### Pagination

```dart
class ProductListNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  final OkadaApiClient apiClient;
  int currentPage = 1;
  bool hasMore = true;
  
  ProductListNotifier(this.apiClient) : super(const AsyncValue.loading()) {
    loadProducts();
  }
  
  Future<void> loadProducts() async {
    if (!hasMore) return;
    
    try {
      final response = await apiClient.listProducts(page: currentPage);
      final products = (response['data'] as List).cast<Map<String, dynamic>>();
      final meta = response['meta'];
      
      state = AsyncValue.data([
        ...state.value ?? [],
        ...products,
      ]);
      
      hasMore = currentPage < meta['last_page'];
      currentPage++;
    } catch (e, stack) {
      state = AsyncValue.error(e, stack);
    }
  }
}
```

### Search with Debouncing

```dart
import 'dart:async';

class ProductSearchNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  final OkadaApiClient apiClient;
  Timer? _debounce;
  
  ProductSearchNotifier(this.apiClient) : super(const AsyncValue.data([]));
  
  void search(String query) {
    if (_debounce?.isActive ?? false) _debounce!.cancel();
    
    _debounce = Timer(const Duration(milliseconds: 500), () async {
      if (query.isEmpty) {
        state = const AsyncValue.data([]);
        return;
      }
      
      state = const AsyncValue.loading();
      
      try {
        final response = await apiClient.listProducts(search: query);
        final products = (response['data'] as List).cast<Map<String, dynamic>>();
        state = AsyncValue.data(products);
      } catch (e, stack) {
        state = AsyncValue.error(e, stack);
      }
    });
  }
  
  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}
```

---

## 🚨 Error Handling

### Try-Catch Pattern

```dart
try {
  final product = await apiClient.getProduct(123);
  // Handle success
} on DioException catch (e) {
  if (e.response?.statusCode == 404) {
    print('Product not found');
  } else if (e.response?.statusCode == 401) {
    print('Unauthorized - please login');
  } else {
    print('Error: ${e.message}');
  }
} catch (e) {
  print('Unexpected error: $e');
}
```

### Global Error Handler

```dart
class ApiErrorHandler {
  static void handle(dynamic error, {VoidCallback? onUnauthorized}) {
    if (error is DioException) {
      final statusCode = error.response?.statusCode;
      final data = error.response?.data;
      
      switch (statusCode) {
        case 401:
          // Unauthorized - token expired
          onUnauthorized?.call();
          break;
        case 422:
          // Validation error
          final errors = data['errors'] as Map<String, dynamic>;
          // Show validation errors
          break;
        case 429:
          // Rate limit exceeded
          final retryAfter = error.response?.headers['retry-after'];
          // Show rate limit message
          break;
        default:
          // Generic error
          final message = data['message'] ?? 'An error occurred';
          // Show error message
      }
    }
  }
}
```

---

## 📴 Offline Support

### Caching Responses

```dart
import 'package:hive_flutter/hive_flutter.dart';

class CachedApiClient {
  final OkadaApiClient apiClient;
  final Box cache;
  
  CachedApiClient(this.apiClient, this.cache);
  
  Future<Map<String, dynamic>> getProduct(int id) async {
    final cacheKey = 'product_$id';
    
    try {
      // Try to fetch from API
      final product = await apiClient.getProduct(id);
      
      // Cache the result
      await cache.put(cacheKey, product);
      
      return product;
    } catch (e) {
      // If offline, return cached data
      final cached = cache.get(cacheKey);
      if (cached != null) {
        return cached;
      }
      rethrow;
    }
  }
}
```

### Offline Queue

```dart
class OfflineQueue {
  final Box queue;
  
  OfflineQueue(this.queue);
  
  Future<void> addToCart(int productId, int quantity) async {
    try {
      await apiClient.addCartItem(productId: productId, quantity: quantity);
    } catch (e) {
      // If offline, queue the action
      await queue.add({
        'action': 'add_to_cart',
        'product_id': productId,
        'quantity': quantity,
        'timestamp': DateTime.now().toIso8601String(),
      });
    }
  }
  
  Future<void> processQueue() async {
    final items = queue.values.toList();
    
    for (var item in items) {
      try {
        if (item['action'] == 'add_to_cart') {
          await apiClient.addCartItem(
            productId: item['product_id'],
            quantity: item['quantity'],
          );
          await queue.delete(item.key);
        }
      } catch (e) {
        // Keep in queue if still failing
        print('Failed to process queue item: $e');
      }
    }
  }
}
```

---

## ✅ Best Practices

### 1. Use Environment Variables

```dart
class ApiConfig {
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://api.okada.cm/v1',
  );
}

final apiClient = OkadaApiClient(baseUrl: ApiConfig.baseUrl);
```

### 2. Secure Token Storage

```dart
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

final secureStorage = FlutterSecureStorage();

// Save token
await secureStorage.write(key: 'access_token', value: token);

// Read token
final token = await secureStorage.read(key: 'access_token');

// Delete token
await secureStorage.delete(key: 'access_token');
```

### 3. Loading States

```dart
class ProductDetailScreen extends ConsumerWidget {
  final int productId;
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final productAsync = ref.watch(productProvider(productId));
    
    return Scaffold(
      body: productAsync.when(
        data: (product) => ProductView(product: product),
        loading: () => Center(child: CircularProgressIndicator()),
        error: (error, stack) => ErrorView(error: error),
      ),
    );
  }
}
```

### 4. Retry Logic

```dart
Future<T> retryRequest<T>(
  Future<T> Function() request, {
  int maxAttempts = 3,
  Duration delay = const Duration(seconds: 1),
}) async {
  int attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      return await request();
    } catch (e) {
      attempts++;
      if (attempts >= maxAttempts) rethrow;
      await Future.delayed(delay * attempts);
    }
  }
  
  throw Exception('Max retry attempts reached');
}

// Usage
final product = await retryRequest(() => apiClient.getProduct(123));
```

### 5. Request Cancellation

```dart
import 'package:dio/dio.dart';

final cancelToken = CancelToken();

// Make request with cancel token
apiClient.dio.get('/products', cancelToken: cancelToken);

// Cancel request
cancelToken.cancel('User cancelled');
```

---

## 📚 Additional Resources

- **OpenAPI Specification**: `../okada-backend/docs/api/openapi.yaml`
- **API Documentation**: `../okada-backend/docs/api/README.md`
- **Dio Documentation**: https://pub.dev/packages/dio
- **Riverpod Documentation**: https://riverpod.dev

---

**Last Updated**: January 2024  
**API Version**: 1.0.0

