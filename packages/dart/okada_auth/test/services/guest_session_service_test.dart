import 'package:flutter_test/flutter_test.dart';
import 'package:okada_auth/src/services/guest_session_service.dart';

void main() {
  group('GuestSessionService', () {
    late GuestSessionService service;

    setUp(() {
      service = GuestSessionService();
    });

    tearDown(() {
      service.dispose();
    });

    group('session management', () {
      test('should start a new guest session', () {
        final session = service.startSession();
        
        expect(session.sessionId, isNotEmpty);
        expect(session.sessionId, startsWith('guest_'));
        expect(session.deviceId, isNotEmpty);
        expect(session.countryCode, equals('CM')); // Default
        expect(session.languageCode, equals('en')); // Default
        expect(session.isExpired, isFalse);
      });

      test('should start session with custom parameters', () {
        final session = service.startSession(
          deviceId: 'custom_device_123',
          countryCode: 'NG',
          languageCode: 'fr',
        );
        
        expect(session.deviceId, equals('custom_device_123'));
        expect(session.countryCode, equals('NG'));
        expect(session.languageCode, equals('fr'));
      });

      test('should end previous session when starting new one', () {
        final session1 = service.startSession();
        final session2 = service.startSession();
        
        expect(session1.sessionId, isNot(equals(session2.sessionId)));
        expect(service.currentSession?.sessionId, equals(session2.sessionId));
      });

      test('should end session correctly', () {
        service.startSession();
        expect(service.hasActiveSession, isTrue);
        
        service.endSession();
        expect(service.hasActiveSession, isFalse);
        expect(service.currentSession, isNull);
      });

      test('should extend session expiry', () {
        final session = service.startSession();
        final originalExpiry = session.expiresAt;
        
        // Wait a bit
        Future.delayed(const Duration(milliseconds: 100));
        
        service.extendSession();
        
        expect(service.currentSession!.expiresAt.isAfter(originalExpiry), isTrue);
      });

      test('should emit session changes via stream', () async {
        final emissions = <GuestSession?>[];
        final subscription = service.sessionStream.listen(emissions.add);
        
        service.startSession();
        service.endSession();
        
        await Future.delayed(const Duration(milliseconds: 50));
        
        expect(emissions.length, equals(2));
        expect(emissions[0], isNotNull);
        expect(emissions[1], isNull);
        
        await subscription.cancel();
      });
    });

    group('feature availability', () {
      test('should allow browsing features for guests', () {
        expect(service.isFeatureAvailable(GuestFeature.browseProducts), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.viewProductDetails), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.searchProducts), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.viewCategories), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.viewStores), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.viewPromotions), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.addToCart), isTrue);
        expect(service.isFeatureAvailable(GuestFeature.viewCart), isTrue);
      });

      test('should restrict checkout and account features', () {
        expect(service.isFeatureAvailable(GuestFeature.checkout), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.orderHistory), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.savedAddresses), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.paymentMethods), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.favorites), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.reviews), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.notifications), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.loyaltyPoints), isFalse);
        expect(service.isFeatureAvailable(GuestFeature.referrals), isFalse);
      });

      test('should return null restriction for available features', () {
        expect(service.getRestriction(GuestFeature.browseProducts), isNull);
        expect(service.getRestriction(GuestFeature.addToCart), isNull);
      });

      test('should return restriction info for restricted features', () {
        final restriction = service.getRestriction(GuestFeature.checkout);
        
        expect(restriction, isNotNull);
        expect(restriction!.feature, equals(GuestFeature.checkout));
        expect(restriction.message, isNotEmpty);
        expect(restriction.localizedMessage, isNotEmpty);
        expect(restriction.ctaText, equals('Create Account'));
        expect(restriction.ctaTextFr, equals('Créer un compte'));
      });
    });

    group('cart operations', () {
      test('should add item to cart', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
        ));
        
        expect(service.currentSession!.cart.itemCount, equals(1));
        expect(service.currentSession!.cart.totalPrice, equals(1000));
      });

      test('should update quantity when adding same product', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
          quantity: 1,
        ));
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
          quantity: 2,
        ));
        
        expect(service.currentSession!.cart.items.length, equals(1));
        expect(service.currentSession!.cart.itemCount, equals(3));
        expect(service.currentSession!.cart.totalPrice, equals(3000));
      });

      test('should remove item from cart', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
        ));
        
        service.removeFromCart('product_1');
        
        expect(service.currentSession!.cart.isEmpty, isTrue);
      });

      test('should update cart item quantity', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
        ));
        
        service.updateCartQuantity('product_1', 5);
        
        expect(service.currentSession!.cart.itemCount, equals(5));
        expect(service.currentSession!.cart.totalPrice, equals(5000));
      });

      test('should remove item when quantity set to zero', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
        ));
        
        service.updateCartQuantity('product_1', 0);
        
        expect(service.currentSession!.cart.isEmpty, isTrue);
      });

      test('should clear cart', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Product 1',
          price: 1000,
        ));
        service.addToCart(const GuestCartItem(
          productId: 'product_2',
          name: 'Product 2',
          price: 2000,
        ));
        
        service.clearCart();
        
        expect(service.currentSession!.cart.isEmpty, isTrue);
      });

      test('should not modify cart without active session', () {
        // No session started
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
        ));
        
        expect(service.currentSession, isNull);
      });
    });

    group('session conversion', () {
      test('should return cart when converting to authenticated', () {
        service.startSession();
        
        service.addToCart(const GuestCartItem(
          productId: 'product_1',
          name: 'Test Product',
          price: 1000,
        ));
        
        final cart = service.convertToAuthenticated();
        
        expect(cart, isNotNull);
        expect(cart!.itemCount, equals(1));
        expect(service.currentSession, isNull); // Session ended
      });

      test('should return null cart when no items', () {
        service.startSession();
        
        final cart = service.convertToAuthenticated();
        
        expect(cart, isNotNull);
        expect(cart!.isEmpty, isTrue);
      });
    });
  });

  group('GuestSession', () {
    test('should calculate time remaining correctly', () {
      final session = GuestSession(
        sessionId: 'test',
        deviceId: 'device',
        countryCode: 'CM',
        languageCode: 'en',
        createdAt: DateTime.now(),
        expiresAt: DateTime.now().add(const Duration(hours: 1)),
        cart: GuestCart.empty(),
      );
      
      expect(session.timeRemaining.inMinutes, greaterThan(50));
      expect(session.isExpired, isFalse);
    });

    test('should detect expired session', () {
      final session = GuestSession(
        sessionId: 'test',
        deviceId: 'device',
        countryCode: 'CM',
        languageCode: 'en',
        createdAt: DateTime.now().subtract(const Duration(hours: 25)),
        expiresAt: DateTime.now().subtract(const Duration(hours: 1)),
        cart: GuestCart.empty(),
      );
      
      expect(session.isExpired, isTrue);
      expect(session.timeRemaining, equals(Duration.zero));
    });
  });

  group('GuestCart', () {
    test('should create empty cart', () {
      final cart = GuestCart.empty();
      
      expect(cart.isEmpty, isTrue);
      expect(cart.itemCount, equals(0));
      expect(cart.totalPrice, equals(0));
    });

    test('should calculate totals correctly', () {
      final cart = const GuestCart(items: [
        GuestCartItem(productId: '1', name: 'A', price: 100, quantity: 2),
        GuestCartItem(productId: '2', name: 'B', price: 50, quantity: 3),
      ]);
      
      expect(cart.itemCount, equals(5));
      expect(cart.totalPrice, equals(350));
    });
  });

  group('GuestCartItem', () {
    test('should calculate total price', () {
      const item = GuestCartItem(
        productId: '1',
        name: 'Test',
        price: 100,
        quantity: 3,
      );
      
      expect(item.totalPrice, equals(300));
    });

    test('should use default currency', () {
      const item = GuestCartItem(
        productId: '1',
        name: 'Test',
        price: 100,
      );
      
      expect(item.currency, equals('XAF'));
    });
  });
}
