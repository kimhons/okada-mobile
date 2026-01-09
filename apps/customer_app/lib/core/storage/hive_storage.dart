import 'package:hive_flutter/hive_flutter.dart';
import 'package:path_provider/path_provider.dart';
import '../constants/app_constants.dart';
import '../errors/exceptions.dart';
import '../../data/models/user_model.dart';
import '../../data/models/product_model.dart';
import '../../data/models/cart_model.dart';
import '../../data/models/order_model.dart';

class HiveStorage {
  static HiveStorage? _instance;
  late final Box<UserModel> _userBox;
  late final Box<CartModel> _cartBox;
  late final Box<ProductModel> _productsBox;
  late final Box<OrderModel> _ordersBox;
  late final Box<AddressModel> _addressesBox;
  late final Box<dynamic> _settingsBox;

  HiveStorage._();

  static HiveStorage get instance {
    _instance ??= HiveStorage._();
    return _instance!;
  }

  Future<void> initialize() async {
    try {
      await Hive.initFlutter();

      // Register adapters
      _registerAdapters();

      // Open boxes
      await _openBoxes();
    } catch (e) {
      throw StorageException('Failed to initialize Hive storage: $e');
    }
  }

  void _registerAdapters() {
    // Register all Hive type adapters
    if (!Hive.isAdapterRegistered(0)) {
      Hive.registerAdapter(UserModelAdapter());
    }
    if (!Hive.isAdapterRegistered(1)) {
      Hive.registerAdapter(UserPreferencesModelAdapter());
    }
    if (!Hive.isAdapterRegistered(2)) {
      Hive.registerAdapter(AddressModelAdapter());
    }
    if (!Hive.isAdapterRegistered(3)) {
      Hive.registerAdapter(PaymentMethodModelAdapter());
    }
    if (!Hive.isAdapterRegistered(4)) {
      Hive.registerAdapter(ProductModelAdapter());
    }
    if (!Hive.isAdapterRegistered(5)) {
      Hive.registerAdapter(CategoryModelAdapter());
    }
    if (!Hive.isAdapterRegistered(6)) {
      Hive.registerAdapter(BrandModelAdapter());
    }
    if (!Hive.isAdapterRegistered(7)) {
      Hive.registerAdapter(ProductReviewModelAdapter());
    }
    if (!Hive.isAdapterRegistered(8)) {
      Hive.registerAdapter(CartModelAdapter());
    }
    if (!Hive.isAdapterRegistered(9)) {
      Hive.registerAdapter(CartItemModelAdapter());
    }
    if (!Hive.isAdapterRegistered(10)) {
      Hive.registerAdapter(CartDiscountModelAdapter());
    }
    if (!Hive.isAdapterRegistered(11)) {
      Hive.registerAdapter(OrderModelAdapter());
    }
    if (!Hive.isAdapterRegistered(12)) {
      Hive.registerAdapter(OrderItemModelAdapter());
    }
    if (!Hive.isAdapterRegistered(13)) {
      Hive.registerAdapter(OrderSummaryModelAdapter());
    }
    if (!Hive.isAdapterRegistered(14)) {
      Hive.registerAdapter(OrderStatusUpdateModelAdapter());
    }
    if (!Hive.isAdapterRegistered(15)) {
      Hive.registerAdapter(OrderDeliveryInfoModelAdapter());
    }
    if (!Hive.isAdapterRegistered(16)) {
      Hive.registerAdapter(DeliveryTrackingPointModelAdapter());
    }
  }

  Future<void> _openBoxes() async {
    try {
      _userBox = await Hive.openBox<UserModel>(AppConstants.userBox);
      _cartBox = await Hive.openBox<CartModel>(AppConstants.cartBox);
      _productsBox = await Hive.openBox<ProductModel>(AppConstants.productsBox);
      _ordersBox = await Hive.openBox<OrderModel>(AppConstants.ordersBox);
      _addressesBox = await Hive.openBox<AddressModel>(AppConstants.addressesBox);
      _settingsBox = await Hive.openBox(AppConstants.settingsBox);
    } catch (e) {
      throw StorageException('Failed to open Hive boxes: $e');
    }
  }

  // User operations
  Future<void> saveUser(UserModel user) async {
    try {
      await _userBox.put('current_user', user);
    } catch (e) {
      throw StorageException('Failed to save user: $e');
    }
  }

  UserModel? getUser() {
    try {
      return _userBox.get('current_user');
    } catch (e) {
      throw StorageException('Failed to get user: $e');
    }
  }

  Future<void> deleteUser() async {
    try {
      await _userBox.delete('current_user');
    } catch (e) {
      throw StorageException('Failed to delete user: $e');
    }
  }

  // Cart operations
  Future<void> saveCart(CartModel cart) async {
    try {
      await _cartBox.put('current_cart', cart);
    } catch (e) {
      throw StorageException('Failed to save cart: $e');
    }
  }

  CartModel? getCart() {
    try {
      return _cartBox.get('current_cart');
    } catch (e) {
      throw StorageException('Failed to get cart: $e');
    }
  }

  Future<void> deleteCart() async {
    try {
      await _cartBox.delete('current_cart');
    } catch (e) {
      throw StorageException('Failed to delete cart: $e');
    }
  }

  // Product operations
  Future<void> saveProduct(ProductModel product) async {
    try {
      await _productsBox.put(product.id, product);
    } catch (e) {
      throw StorageException('Failed to save product: $e');
    }
  }

  Future<void> saveProducts(List<ProductModel> products) async {
    try {
      final Map<String, ProductModel> productMap = {
        for (var product in products) product.id: product
      };
      await _productsBox.putAll(productMap);
    } catch (e) {
      throw StorageException('Failed to save products: $e');
    }
  }

  ProductModel? getProduct(String id) {
    try {
      return _productsBox.get(id);
    } catch (e) {
      throw StorageException('Failed to get product: $e');
    }
  }

  List<ProductModel> getAllProducts() {
    try {
      return _productsBox.values.toList();
    } catch (e) {
      throw StorageException('Failed to get all products: $e');
    }
  }

  List<ProductModel> getProductsByCategory(String categoryId) {
    try {
      return _productsBox.values
          .where((product) => product.category.id == categoryId)
          .toList();
    } catch (e) {
      throw StorageException('Failed to get products by category: $e');
    }
  }

  List<ProductModel> searchProducts(String query) {
    try {
      final lowercaseQuery = query.toLowerCase();
      return _productsBox.values
          .where((product) =>
              product.name.toLowerCase().contains(lowercaseQuery) ||
              product.description.toLowerCase().contains(lowercaseQuery) ||
              product.tags.any((tag) => tag.toLowerCase().contains(lowercaseQuery)))
          .toList();
    } catch (e) {
      throw StorageException('Failed to search products: $e');
    }
  }

  Future<void> deleteProduct(String id) async {
    try {
      await _productsBox.delete(id);
    } catch (e) {
      throw StorageException('Failed to delete product: $e');
    }
  }

  Future<void> clearProducts() async {
    try {
      await _productsBox.clear();
    } catch (e) {
      throw StorageException('Failed to clear products: $e');
    }
  }

  // Order operations
  Future<void> saveOrder(OrderModel order) async {
    try {
      await _ordersBox.put(order.id, order);
    } catch (e) {
      throw StorageException('Failed to save order: $e');
    }
  }

  Future<void> saveOrders(List<OrderModel> orders) async {
    try {
      final Map<String, OrderModel> orderMap = {
        for (var order in orders) order.id: order
      };
      await _ordersBox.putAll(orderMap);
    } catch (e) {
      throw StorageException('Failed to save orders: $e');
    }
  }

  OrderModel? getOrder(String id) {
    try {
      return _ordersBox.get(id);
    } catch (e) {
      throw StorageException('Failed to get order: $e');
    }
  }

  List<OrderModel> getAllOrders() {
    try {
      return _ordersBox.values.toList()
        ..sort((a, b) => b.orderDate.compareTo(a.orderDate));
    } catch (e) {
      throw StorageException('Failed to get all orders: $e');
    }
  }

  List<OrderModel> getOrdersByStatus(int status) {
    try {
      return _ordersBox.values
          .where((order) => order.orderStatus == status)
          .toList()
        ..sort((a, b) => b.orderDate.compareTo(a.orderDate));
    } catch (e) {
      throw StorageException('Failed to get orders by status: $e');
    }
  }

  Future<void> deleteOrder(String id) async {
    try {
      await _ordersBox.delete(id);
    } catch (e) {
      throw StorageException('Failed to delete order: $e');
    }
  }

  Future<void> clearOrders() async {
    try {
      await _ordersBox.clear();
    } catch (e) {
      throw StorageException('Failed to clear orders: $e');
    }
  }

  // Address operations
  Future<void> saveAddress(AddressModel address) async {
    try {
      await _addressesBox.put(address.id, address);
    } catch (e) {
      throw StorageException('Failed to save address: $e');
    }
  }

  Future<void> saveAddresses(List<AddressModel> addresses) async {
    try {
      final Map<String, AddressModel> addressMap = {
        for (var address in addresses) address.id: address
      };
      await _addressesBox.putAll(addressMap);
    } catch (e) {
      throw StorageException('Failed to save addresses: $e');
    }
  }

  AddressModel? getAddress(String id) {
    try {
      return _addressesBox.get(id);
    } catch (e) {
      throw StorageException('Failed to get address: $e');
    }
  }

  List<AddressModel> getAllAddresses() {
    try {
      return _addressesBox.values.toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } catch (e) {
      throw StorageException('Failed to get all addresses: $e');
    }
  }

  AddressModel? getDefaultAddress() {
    try {
      return _addressesBox.values
          .where((address) => address.isDefault)
          .firstOrNull;
    } catch (e) {
      throw StorageException('Failed to get default address: $e');
    }
  }

  Future<void> deleteAddress(String id) async {
    try {
      await _addressesBox.delete(id);
    } catch (e) {
      throw StorageException('Failed to delete address: $e');
    }
  }

  Future<void> clearAddresses() async {
    try {
      await _addressesBox.clear();
    } catch (e) {
      throw StorageException('Failed to clear addresses: $e');
    }
  }

  // Settings operations
  Future<void> saveSetting(String key, dynamic value) async {
    try {
      await _settingsBox.put(key, value);
    } catch (e) {
      throw StorageException('Failed to save setting: $e');
    }
  }

  T? getSetting<T>(String key, {T? defaultValue}) {
    try {
      return _settingsBox.get(key, defaultValue: defaultValue) as T?;
    } catch (e) {
      throw StorageException('Failed to get setting: $e');
    }
  }

  Future<void> deleteSetting(String key) async {
    try {
      await _settingsBox.delete(key);
    } catch (e) {
      throw StorageException('Failed to delete setting: $e');
    }
  }

  Map<dynamic, dynamic> getAllSettings() {
    try {
      return Map<dynamic, dynamic>.from(_settingsBox.toMap());
    } catch (e) {
      throw StorageException('Failed to get all settings: $e');
    }
  }

  Future<void> clearSettings() async {
    try {
      await _settingsBox.clear();
    } catch (e) {
      throw StorageException('Failed to clear settings: $e');
    }
  }

  // General operations
  Future<void> clearAll() async {
    try {
      await Future.wait([
        _userBox.clear(),
        _cartBox.clear(),
        _productsBox.clear(),
        _ordersBox.clear(),
        _addressesBox.clear(),
        _settingsBox.clear(),
      ]);
    } catch (e) {
      throw StorageException('Failed to clear all data: $e');
    }
  }

  Future<int> getTotalSize() async {
    try {
      return _userBox.length +
          _cartBox.length +
          _productsBox.length +
          _ordersBox.length +
          _addressesBox.length +
          _settingsBox.length;
    } catch (e) {
      throw StorageException('Failed to get total size: $e');
    }
  }

  Future<void> compact() async {
    try {
      await Future.wait([
        _userBox.compact(),
        _cartBox.compact(),
        _productsBox.compact(),
        _ordersBox.compact(),
        _addressesBox.compact(),
        _settingsBox.compact(),
      ]);
    } catch (e) {
      throw StorageException('Failed to compact storage: $e');
    }
  }

  Future<void> close() async {
    try {
      await Hive.close();
    } catch (e) {
      throw StorageException('Failed to close Hive: $e');
    }
  }
}

extension ListExtension<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
}