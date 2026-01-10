import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:okada_ui/okada_ui.dart';

void main() {
  group('HomeScreen Data Models', () {
    group('CategoryItem', () {
      test('should create with required fields', () {
        const category = CategoryItem(
          id: 'fresh-produce',
          name: 'Fresh Produce',
          icon: Icons.eco,
          color: Colors.green,
        );
        
        expect(category.id, equals('fresh-produce'));
        expect(category.name, equals('Fresh Produce'));
        expect(category.productCount, equals(0));
      });

      test('should create with optional productCount', () {
        const category = CategoryItem(
          id: 'dairy',
          name: 'Dairy',
          icon: Icons.egg,
          color: Colors.blue,
          productCount: 89,
        );
        
        expect(category.productCount, equals(89));
      });
    });

    group('PromotionalBanner', () {
      test('should create with required fields', () {
        const banner = PromotionalBanner(
          id: 'promo-1',
          title: '20% Off First Order',
          subtitle: 'Use code OKADA20',
          imageUrl: 'https://example.com/banner.jpg',
          backgroundColor: Colors.green,
        );
        
        expect(banner.id, equals('promo-1'));
        expect(banner.title, equals('20% Off First Order'));
        expect(banner.actionUrl, isNull);
      });

      test('should create with optional actionUrl', () {
        const banner = PromotionalBanner(
          id: 'promo-2',
          title: 'Free Delivery',
          subtitle: 'Today only',
          imageUrl: 'https://example.com/banner2.jpg',
          backgroundColor: Colors.orange,
          actionUrl: '/promotions/free-delivery',
        );
        
        expect(banner.actionUrl, equals('/promotions/free-delivery'));
      });
    });

    group('ProductItem', () {
      test('should create with default stock status', () {
        const product = ProductItem(
          id: 'tomato-1',
          name: 'Fresh Tomatoes',
          price: 500,
          unit: 'kg',
          imageUrl: 'https://example.com/tomato.jpg',
        );
        
        expect(product.stockStatus, equals(StockStatus.inStock));
        expect(product.discountPercentage, isNull);
      });

      test('should create with low stock status', () {
        const product = ProductItem(
          id: 'onion-1',
          name: 'Red Onions',
          price: 300,
          unit: 'kg',
          imageUrl: 'https://example.com/onion.jpg',
          stockStatus: StockStatus.lowStock,
        );
        
        expect(product.stockStatus, equals(StockStatus.lowStock));
      });

      test('should create with discount', () {
        const product = ProductItem(
          id: 'fish-1',
          name: 'Fresh Tilapia',
          price: 2500,
          unit: 'kg',
          imageUrl: 'https://example.com/fish.jpg',
          discountPercentage: 15,
        );
        
        expect(product.discountPercentage, equals(15));
      });
    });

    group('StockStatus', () {
      test('should have all expected values', () {
        expect(StockStatus.values.length, equals(3));
        expect(StockStatus.values, contains(StockStatus.inStock));
        expect(StockStatus.values, contains(StockStatus.lowStock));
        expect(StockStatus.values, contains(StockStatus.outOfStock));
      });
    });
  });

  group('CategoryListItem', () {
    test('defaultCategories should have 10 categories', () {
      expect(CategoryListItem.defaultCategories.length, equals(10));
    });

    test('defaultCategories should include Fresh Produce', () {
      final freshProduce = CategoryListItem.defaultCategories
          .firstWhere((c) => c.id == 'fresh-produce');
      
      expect(freshProduce.name, equals('Fresh Produce'));
      expect(freshProduce.nameFr, equals('Produits Frais'));
      expect(freshProduce.productCount, equals(234));
    });

    test('defaultCategories should include Meat & Fish', () {
      final meatFish = CategoryListItem.defaultCategories
          .firstWhere((c) => c.id == 'meat-fish');
      
      expect(meatFish.name, equals('Meat & Fish'));
      expect(meatFish.nameFr, equals('Viande & Poisson'));
    });

    test('all categories should have French translations', () {
      for (final category in CategoryListItem.defaultCategories) {
        expect(category.nameFr, isNotEmpty);
      }
    });
  });

  group('OkadaNavDestination', () {
    test('should have correct indices', () {
      expect(OkadaNavDestination.home.index, equals(0));
      expect(OkadaNavDestination.categories.index, equals(1));
      expect(OkadaNavDestination.orders.index, equals(2));
      expect(OkadaNavDestination.account.index, equals(3));
    });

    test('should have correct English labels', () {
      expect(OkadaNavDestination.home.label, equals('Home'));
      expect(OkadaNavDestination.categories.label, equals('Categories'));
      expect(OkadaNavDestination.orders.label, equals('Orders'));
      expect(OkadaNavDestination.account.label, equals('Account'));
    });

    test('should have correct French labels', () {
      expect(OkadaNavDestination.home.labelFr, equals('Accueil'));
      expect(OkadaNavDestination.categories.labelFr, equals('Catégories'));
      expect(OkadaNavDestination.orders.labelFr, equals('Commandes'));
      expect(OkadaNavDestination.account.labelFr, equals('Compte'));
    });

    test('okadaNavDestinationFromIndex should return correct destination', () {
      expect(okadaNavDestinationFromIndex(0), equals(OkadaNavDestination.home));
      expect(okadaNavDestinationFromIndex(1), equals(OkadaNavDestination.categories));
      expect(okadaNavDestinationFromIndex(2), equals(OkadaNavDestination.orders));
      expect(okadaNavDestinationFromIndex(3), equals(OkadaNavDestination.account));
    });

    test('okadaNavDestinationFromIndex should default to home for invalid index', () {
      expect(okadaNavDestinationFromIndex(-1), equals(OkadaNavDestination.home));
      expect(okadaNavDestinationFromIndex(99), equals(OkadaNavDestination.home));
    });
  });

  group('SearchResultProduct', () {
    test('should create with default isInStock', () {
      const product = SearchResultProduct(
        id: 'product-1',
        name: 'Test Product',
        price: 1000,
        unit: 'piece',
      );
      
      expect(product.isInStock, isTrue);
    });

    test('should create with optional fields', () {
      const product = SearchResultProduct(
        id: 'product-2',
        name: 'Test Product 2',
        price: 2000,
        unit: 'kg',
        imageUrl: 'https://example.com/image.jpg',
        category: 'Fresh Produce',
        isInStock: false,
      );
      
      expect(product.imageUrl, isNotNull);
      expect(product.category, equals('Fresh Produce'));
      expect(product.isInStock, isFalse);
    });
  });

  group('CategoryProduct', () {
    test('should create with default stock status', () {
      const product = CategoryProduct(
        id: 'cat-product-1',
        name: 'Category Product',
        price: 500,
        unit: 'kg',
      );
      
      expect(product.stockStatus, equals(ProductStockStatus.inStock));
    });

    test('should create with out of stock status', () {
      const product = CategoryProduct(
        id: 'cat-product-2',
        name: 'Out of Stock Product',
        price: 1000,
        unit: 'piece',
        stockStatus: ProductStockStatus.outOfStock,
      );
      
      expect(product.stockStatus, equals(ProductStockStatus.outOfStock));
    });
  });
}
