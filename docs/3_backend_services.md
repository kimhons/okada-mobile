# Backend Services Implementation Checklist with AI Integration

## 1. Core Backend Services Architecture

### 1.1. Project Structure Setup

- [ ] Create the backend services project structure:
  ```bash
  mkdir -p okada-backend
  cd okada-backend
  flutter create --template=package okada_core
  mkdir -p okada_api
  mkdir -p okada_services
  ```

- [ ] Set up the backend project with proper folder structure:
  ```bash
  cd okada_api
  mkdir -p lib/src/{controllers,models,routes,middleware,utils,config}
  touch lib/src/app.dart
  touch lib/src/server.dart
  ```

### 1.2. Backend Dependencies Setup

- [ ] Create the backend API pubspec.yaml file:
  ```bash
  cat > okada_api/pubspec.yaml << 'EOL'
  name: okada_api
  description: Okada backend API services
  version: 1.0.0
  
  environment:
    sdk: '>=3.0.0 <4.0.0'
  
  dependencies:
    shelf: ^1.4.1
    shelf_router: ^1.1.4
    postgres: ^2.6.1
    redis: ^3.1.0
    jwt_decoder: ^2.0.1
    dotenv: ^4.1.0
    logging: ^1.2.0
    http: ^1.1.0
    uuid: ^3.0.7
    intl: ^0.18.1
    okada_core:
      path: ../okada_core
    shelf_cors_headers: ^0.1.5
    mongo_dart: ^0.9.1
    shelf_multipart: ^1.0.0
    image: ^4.0.17
    path: ^1.8.3
    crypto: ^3.0.3
    googleapis: ^11.4.0
    googleapis_auth: ^1.4.1
    grpc: ^3.2.4
    protobuf: ^3.1.0
    firebase_admin: ^0.2.0
    shelf_static: ^1.1.2
  
  dev_dependencies:
    lints: ^2.1.1
    test: ^1.24.3
    mockito: ^5.4.2
    build_runner: ^2.4.6
  EOL
  ```

- [ ] Create the core services pubspec.yaml file:
  ```bash
  cat > okada_core/pubspec.yaml << 'EOL'
  name: okada_core
  description: Okada core services and models
  version: 1.0.0
  
  environment:
    sdk: '>=3.0.0 <4.0.0'
  
  dependencies:
    equatable: ^2.0.5
    json_annotation: ^4.8.1
    uuid: ^3.0.7
    http: ^1.1.0
    intl: ^0.18.1
    logging: ^1.2.0
    meta: ^1.9.1
    path: ^1.8.3
    crypto: ^3.0.3
    collection: ^1.17.2
    googleapis: ^11.4.0
    googleapis_auth: ^1.4.1
    grpc: ^3.2.4
    protobuf: ^3.1.0
  
  dev_dependencies:
    lints: ^2.1.1
    test: ^1.24.3
    build_runner: ^2.4.6
    json_serializable: ^6.7.1
  EOL
  ```

### 1.3. Database Schema Setup

- [ ] Create database schema migration script:
  ```bash
  mkdir -p okada_api/db/migrations
  touch okada_api/db/migrations/001_initial_schema.sql
  ```

- [ ] Define the initial database schema:
  ```sql
  -- 001_initial_schema.sql
  
  -- Enable UUID extension
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  
  -- Users table
  CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'active',
    profile_image_url VARCHAR(255),
    fcm_token VARCHAR(255),
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE
  );
  
  -- User addresses table
  CREATE TABLE user_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Cameroon',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    label VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Categories table
  CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    parent_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Products table
  CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sale_price DECIMAL(10, 2),
    sku VARCHAR(100) UNIQUE,
    barcode VARCHAR(100),
    category_id UUID REFERENCES categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight DECIMAL(10, 2),
    weight_unit VARCHAR(10) DEFAULT 'kg',
    stock_quantity INT DEFAULT 0,
    low_stock_threshold INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    brand VARCHAR(100),
    tax_rate DECIMAL(5, 2) DEFAULT 0.00
  );
  
  -- Product images table
  CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Dark stores table
  CREATE TABLE dark_stores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL DEFAULT 'Cameroon',
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    operating_hours VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    coverage_radius_km DECIMAL(5, 2) DEFAULT 5.00
  );
  
  -- Store inventory table
  CREATE TABLE store_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES dark_stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 0,
    last_restock_date TIMESTAMP WITH TIME ZONE,
    restock_threshold INT DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(store_id, product_id)
  );
  
  -- Riders table
  CREATE TABLE riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(50) NOT NULL,
    license_number VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    current_latitude DECIMAL(10, 8),
    current_longitude DECIMAL(11, 8),
    last_location_update TIMESTAMP WITH TIME ZONE,
    rating DECIMAL(3, 2),
    total_deliveries INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_store_id UUID REFERENCES dark_stores(id),
    status VARCHAR(50) DEFAULT 'offline'
  );
  
  -- Orders table
  CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    store_id UUID NOT NULL REFERENCES dark_stores(id),
    rider_id UUID REFERENCES riders(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0.00,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    delivery_address_id UUID REFERENCES user_addresses(id),
    delivery_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    estimated_delivery_time TIMESTAMP WITH TIME ZONE,
    actual_delivery_time TIMESTAMP WITH TIME ZONE,
    order_code VARCHAR(20) UNIQUE NOT NULL
  );
  
  -- Order items table
  CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Order status history table
  CREATE TABLE order_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
  );
  
  -- User ratings table
  CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    order_id UUID REFERENCES orders(id),
    rider_id UUID REFERENCES riders(id),
    product_id UUID REFERENCES products(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- User search history table
  CREATE TABLE user_search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_query VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- User product views table
  CREATE TABLE user_product_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    view_count INT DEFAULT 1,
    last_viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Promotions table
  CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    minimum_order_amount DECIMAL(10, 2) DEFAULT 0.00,
    usage_limit INT,
    usage_count INT DEFAULT 0,
    promo_code VARCHAR(50) UNIQUE
  );
  
  -- AI recommendation logs table
  CREATE TABLE ai_recommendation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    items JSONB NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_id VARCHAR(100),
    is_clicked BOOLEAN DEFAULT FALSE,
    clicked_item_id UUID,
    clicked_at TIMESTAMP WITH TIME ZONE
  );
  
  -- AI demand forecast table
  CREATE TABLE ai_demand_forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID NOT NULL REFERENCES dark_stores(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    forecast_quantity INT NOT NULL,
    confidence_lower DECIMAL(10, 2),
    confidence_upper DECIMAL(10, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    model_version VARCHAR(50),
    actual_quantity INT,
    UNIQUE(store_id, product_id, forecast_date)
  );
  
  -- AI route optimization logs table
  CREATE TABLE ai_route_optimization_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id UUID REFERENCES riders(id) ON DELETE SET NULL,
    orders JSONB NOT NULL,
    optimized_route JSONB NOT NULL,
    optimization_params JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_distance DECIMAL(10, 2),
    estimated_time INT,
    actual_time INT,
    model_version VARCHAR(50)
  );
  
  -- Create indexes
  CREATE INDEX idx_users_phone_number ON users(phone_number);
  CREATE INDEX idx_users_email ON users(email);
  CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
  CREATE INDEX idx_products_category_id ON products(category_id);
  CREATE INDEX idx_products_is_active ON products(is_active);
  CREATE INDEX idx_store_inventory_store_id ON store_inventory(store_id);
  CREATE INDEX idx_store_inventory_product_id ON store_inventory(product_id);
  CREATE INDEX idx_orders_user_id ON orders(user_id);
  CREATE INDEX idx_orders_store_id ON orders(store_id);
  CREATE INDEX idx_orders_rider_id ON orders(rider_id);
  CREATE INDEX idx_orders_status ON orders(status);
  CREATE INDEX idx_order_items_order_id ON order_items(order_id);
  CREATE INDEX idx_order_items_product_id ON order_items(product_id);
  CREATE INDEX idx_ratings_user_id ON ratings(user_id);
  CREATE INDEX idx_user_search_history_user_id ON user_search_history(user_id);
  CREATE INDEX idx_user_product_views_user_id ON user_product_views(user_id);
  CREATE INDEX idx_user_product_views_product_id ON user_product_views(product_id);
  CREATE INDEX idx_ai_recommendation_logs_user_id ON ai_recommendation_logs(user_id);
  CREATE INDEX idx_ai_demand_forecasts_store_product ON ai_demand_forecasts(store_id, product_id);
  CREATE INDEX idx_ai_route_optimization_logs_rider_id ON ai_route_optimization_logs(rider_id);
  ```

### 1.4. Environment Configuration

- [ ] Create environment configuration file:
  ```bash
  cat > okada_api/.env.example << 'EOL'
  # Server Configuration
  PORT=8080
  HOST=0.0.0.0
  ENV=development
  
  # Database Configuration
  DB_HOST=localhost
  DB_PORT=5432
  DB_NAME=okada_db
  DB_USER=okada_user
  DB_PASSWORD=okada_password
  
  # Redis Configuration
  REDIS_HOST=localhost
  REDIS_PORT=6379
  REDIS_PASSWORD=
  
  # JWT Configuration
  JWT_SECRET=your_jwt_secret_key_change_in_production
  JWT_EXPIRY=86400
  
  # AI Brain Configuration
  AI_BRAIN_URL=http://localhost:8000
  AI_BRAIN_API_KEY=your_api_key_change_in_production
  
  # Firebase Configuration
  FIREBASE_CREDENTIALS_FILE=firebase-credentials.json
  
  # Storage Configuration
  STORAGE_TYPE=local
  STORAGE_LOCAL_PATH=./uploads
  STORAGE_BUCKET=okada-storage
  
  # SMS Gateway Configuration
  SMS_PROVIDER=twilio
  SMS_API_KEY=your_sms_api_key
  SMS_SENDER_ID=OKADA
  
  # Payment Gateway Configuration
  PAYMENT_PROVIDER=stripe
  PAYMENT_API_KEY=your_payment_api_key
  PAYMENT_SECRET_KEY=your_payment_secret_key
  
  # Mobile Money Configuration
  MOMO_PROVIDER=mtn
  MOMO_API_KEY=your_momo_api_key
  MOMO_SECRET_KEY=your_momo_secret_key
  
  # Logging Configuration
  LOG_LEVEL=info
  LOG_FILE=logs/okada.log
  
  # Cameroon Flag Colors (Branding)
  BRAND_GREEN=#007A5E
  BRAND_RED=#CE1126
  BRAND_YELLOW=#FCD116
  EOL
  ```

- [ ] Create the actual environment file:
  ```bash
  cp okada_api/.env.example okada_api/.env
  ```

## 2. Core Models Implementation

### 2.1. Base Models

- [ ] Create base model class:
  ```bash
  mkdir -p okada_core/lib/src/models
  touch okada_core/lib/src/models/base_model.dart
  ```

- [ ] Implement base model:
  ```dart
  // okada_core/lib/src/models/base_model.dart
  import 'package:equatable/equatable.dart';
  import 'package:json_annotation/json_annotation.dart';
  import 'package:meta/meta.dart';
  
  /// Base class for all models in the application
  @immutable
  abstract class BaseModel extends Equatable {
    /// Unique identifier for the model
    final String id;
  
    /// Timestamp when the model was created
    final DateTime? createdAt;
  
    /// Timestamp when the model was last updated
    final DateTime? updatedAt;
  
    /// Creates a new instance of [BaseModel]
    const BaseModel({
      required this.id,
      this.createdAt,
      this.updatedAt,
    });
  
    /// Converts the model to a JSON map
    Map<String, dynamic> toJson();
  
    @override
    List<Object?> get props => [id];
  }
  ```

### 2.2. User Models

- [ ] Create user model:
  ```bash
  touch okada_core/lib/src/models/user.dart
  ```

- [ ] Implement user model:
  ```dart
  // okada_core/lib/src/models/user.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'user.g.dart';
  
  /// Status of a user account
  enum UserStatus {
    /// User account is active
    active,
    
    /// User account is inactive
    inactive,
    
    /// User account is suspended
    suspended,
    
    /// User account is pending verification
    pending
  }
  
  /// User model representing a user in the system
  @JsonSerializable()
  class User extends BaseModel {
    /// Phone number of the user
    final String phoneNumber;
    
    /// Email address of the user
    final String? email;
    
    /// First name of the user
    final String firstName;
    
    /// Last name of the user
    final String lastName;
    
    /// Status of the user account
    final UserStatus status;
    
    /// URL to the user's profile image
    final String? profileImageUrl;
    
    /// Firebase Cloud Messaging token for push notifications
    final String? fcmToken;
    
    /// Whether the user's phone number is verified
    final bool isPhoneVerified;
    
    /// Whether the user's email is verified
    final bool isEmailVerified;
    
    /// Timestamp of the user's last login
    final DateTime? lastLogin;
  
    /// Creates a new instance of [User]
    const User({
      required super.id,
      required this.phoneNumber,
      this.email,
      required this.firstName,
      required this.lastName,
      this.status = UserStatus.active,
      this.profileImageUrl,
      this.fcmToken,
      this.isPhoneVerified = false,
      this.isEmailVerified = false,
      this.lastLogin,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [User] from JSON
    factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$UserToJson(this);
  
    /// Gets the full name of the user
    String get fullName => '$firstName $lastName';
  
    /// Creates a copy of this user with the given fields replaced
    User copyWith({
      String? id,
      String? phoneNumber,
      String? email,
      String? firstName,
      String? lastName,
      UserStatus? status,
      String? profileImageUrl,
      String? fcmToken,
      bool? isPhoneVerified,
      bool? isEmailVerified,
      DateTime? lastLogin,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return User(
        id: id ?? this.id,
        phoneNumber: phoneNumber ?? this.phoneNumber,
        email: email ?? this.email,
        firstName: firstName ?? this.firstName,
        lastName: lastName ?? this.lastName,
        status: status ?? this.status,
        profileImageUrl: profileImageUrl ?? this.profileImageUrl,
        fcmToken: fcmToken ?? this.fcmToken,
        isPhoneVerified: isPhoneVerified ?? this.isPhoneVerified,
        isEmailVerified: isEmailVerified ?? this.isEmailVerified,
        lastLogin: lastLogin ?? this.lastLogin,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          phoneNumber,
          email,
          firstName,
          lastName,
          status,
          profileImageUrl,
          fcmToken,
          isPhoneVerified,
          isEmailVerified,
          lastLogin,
          createdAt,
          updatedAt,
        ];
  }
  ```

### 2.3. Product Models

- [ ] Create product model:
  ```bash
  touch okada_core/lib/src/models/product.dart
  ```

- [ ] Implement product model:
  ```dart
  // okada_core/lib/src/models/product.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'product.g.dart';
  
  /// Product model representing a product in the system
  @JsonSerializable()
  class Product extends BaseModel {
    /// Name of the product
    final String name;
    
    /// Description of the product
    final String? description;
    
    /// Regular price of the product
    final double price;
    
    /// Sale price of the product (if on sale)
    final double? salePrice;
    
    /// Stock Keeping Unit (SKU) of the product
    final String? sku;
    
    /// Barcode of the product
    final String? barcode;
    
    /// ID of the category this product belongs to
    final String categoryId;
    
    /// Whether the product is active
    final bool isActive;
    
    /// Weight of the product
    final double? weight;
    
    /// Unit of weight measurement
    final String? weightUnit;
    
    /// Current stock quantity
    final int stockQuantity;
    
    /// Threshold for low stock warning
    final int lowStockThreshold;
    
    /// Whether the product is featured
    final bool isFeatured;
    
    /// Brand of the product
    final String? brand;
    
    /// Tax rate applied to the product
    final double taxRate;
    
    /// List of image URLs for the product
    final List<ProductImage> images;
  
    /// Creates a new instance of [Product]
    const Product({
      required super.id,
      required this.name,
      this.description,
      required this.price,
      this.salePrice,
      this.sku,
      this.barcode,
      required this.categoryId,
      this.isActive = true,
      this.weight,
      this.weightUnit = 'kg',
      this.stockQuantity = 0,
      this.lowStockThreshold = 5,
      this.isFeatured = false,
      this.brand,
      this.taxRate = 0.0,
      this.images = const [],
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [Product] from JSON
    factory Product.fromJson(Map<String, dynamic> json) => _$ProductFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$ProductToJson(this);
  
    /// Gets the current price of the product (sale price if available, otherwise regular price)
    double get currentPrice => salePrice ?? price;
  
    /// Checks if the product is on sale
    bool get isOnSale => salePrice != null && salePrice! < price;
  
    /// Checks if the product is in stock
    bool get isInStock => stockQuantity > 0;
  
    /// Checks if the product has low stock
    bool get hasLowStock => stockQuantity <= lowStockThreshold;
  
    /// Gets the primary image URL of the product
    String? get primaryImageUrl {
      final primaryImage = images.firstWhere(
        (image) => image.isPrimary,
        orElse: () => images.isNotEmpty ? images.first : const ProductImage(imageUrl: ''),
      );
      return primaryImage.imageUrl.isNotEmpty ? primaryImage.imageUrl : null;
    }
  
    /// Creates a copy of this product with the given fields replaced
    Product copyWith({
      String? id,
      String? name,
      String? description,
      double? price,
      double? salePrice,
      String? sku,
      String? barcode,
      String? categoryId,
      bool? isActive,
      double? weight,
      String? weightUnit,
      int? stockQuantity,
      int? lowStockThreshold,
      bool? isFeatured,
      String? brand,
      double? taxRate,
      List<ProductImage>? images,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return Product(
        id: id ?? this.id,
        name: name ?? this.name,
        description: description ?? this.description,
        price: price ?? this.price,
        salePrice: salePrice ?? this.salePrice,
        sku: sku ?? this.sku,
        barcode: barcode ?? this.barcode,
        categoryId: categoryId ?? this.categoryId,
        isActive: isActive ?? this.isActive,
        weight: weight ?? this.weight,
        weightUnit: weightUnit ?? this.weightUnit,
        stockQuantity: stockQuantity ?? this.stockQuantity,
        lowStockThreshold: lowStockThreshold ?? this.lowStockThreshold,
        isFeatured: isFeatured ?? this.isFeatured,
        brand: brand ?? this.brand,
        taxRate: taxRate ?? this.taxRate,
        images: images ?? this.images,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          name,
          description,
          price,
          salePrice,
          sku,
          barcode,
          categoryId,
          isActive,
          weight,
          weightUnit,
          stockQuantity,
          lowStockThreshold,
          isFeatured,
          brand,
          taxRate,
          images,
          createdAt,
          updatedAt,
        ];
  }
  
  /// Product image model
  @JsonSerializable()
  class ProductImage {
    /// URL of the image
    final String imageUrl;
    
    /// Whether this is the primary image
    final bool isPrimary;
    
    /// Display order of the image
    final int displayOrder;
  
    /// Creates a new instance of [ProductImage]
    const ProductImage({
      required this.imageUrl,
      this.isPrimary = false,
      this.displayOrder = 0,
    });
  
    /// Creates a [ProductImage] from JSON
    factory ProductImage.fromJson(Map<String, dynamic> json) => _$ProductImageFromJson(json);
  
    /// Converts the image to a JSON map
    Map<String, dynamic> toJson() => _$ProductImageToJson(this);
  }
  ```

### 2.4. Order Models

- [ ] Create order model:
  ```bash
  touch okada_core/lib/src/models/order.dart
  ```

- [ ] Implement order model:
  ```dart
  // okada_core/lib/src/models/order.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'order.g.dart';
  
  /// Status of an order
  enum OrderStatus {
    /// Order is pending
    pending,
    
    /// Order is confirmed
    confirmed,
    
    /// Order is being prepared
    preparing,
    
    /// Order is ready for pickup
    readyForPickup,
    
    /// Order is out for delivery
    outForDelivery,
    
    /// Order is delivered
    delivered,
    
    /// Order is cancelled
    cancelled,
    
    /// Order is returned
    returned
  }
  
  /// Status of a payment
  enum PaymentStatus {
    /// Payment is pending
    pending,
    
    /// Payment is completed
    completed,
    
    /// Payment failed
    failed,
    
    /// Payment is refunded
    refunded,
    
    /// Payment is partially refunded
    partiallyRefunded
  }
  
  /// Payment method for an order
  enum PaymentMethod {
    /// Cash on delivery
    cashOnDelivery,
    
    /// Credit card
    creditCard,
    
    /// Mobile money
    mobileMoney,
    
    /// Bank transfer
    bankTransfer
  }
  
  /// Order model representing an order in the system
  @JsonSerializable()
  class Order extends BaseModel {
    /// ID of the user who placed the order
    final String userId;
    
    /// ID of the store fulfilling the order
    final String storeId;
    
    /// ID of the rider delivering the order
    final String? riderId;
    
    /// Status of the order
    final OrderStatus status;
    
    /// Total amount of the order
    final double totalAmount;
    
    /// Delivery fee for the order
    final double deliveryFee;
    
    /// Tax amount for the order
    final double taxAmount;
    
    /// Discount amount applied to the order
    final double discountAmount;
    
    /// Payment method used for the order
    final PaymentMethod paymentMethod;
    
    /// Status of the payment
    final PaymentStatus paymentStatus;
    
    /// ID of the delivery address
    final String deliveryAddressId;
    
    /// Notes for delivery
    final String? deliveryNotes;
    
    /// Estimated delivery time
    final DateTime? estimatedDeliveryTime;
    
    /// Actual delivery time
    final DateTime? actualDeliveryTime;
    
    /// Order code (for tracking)
    final String orderCode;
    
    /// Items in the order
    final List<OrderItem> items;
    
    /// Status history of the order
    final List<OrderStatusHistory> statusHistory;
  
    /// Creates a new instance of [Order]
    const Order({
      required super.id,
      required this.userId,
      required this.storeId,
      this.riderId,
      this.status = OrderStatus.pending,
      required this.totalAmount,
      required this.deliveryFee,
      required this.taxAmount,
      this.discountAmount = 0.0,
      required this.paymentMethod,
      this.paymentStatus = PaymentStatus.pending,
      required this.deliveryAddressId,
      this.deliveryNotes,
      this.estimatedDeliveryTime,
      this.actualDeliveryTime,
      required this.orderCode,
      this.items = const [],
      this.statusHistory = const [],
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates an [Order] from JSON
    factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$OrderToJson(this);
  
    /// Gets the subtotal of the order (before tax, delivery fee, and discounts)
    double get subtotal => items.fold(0, (sum, item) => sum + item.totalPrice);
  
    /// Gets the total number of items in the order
    int get itemCount => items.fold(0, (sum, item) => sum + item.quantity);
  
    /// Checks if the order is in a final state (delivered, cancelled, or returned)
    bool get isCompleted => status == OrderStatus.delivered || 
                           status == OrderStatus.cancelled || 
                           status == OrderStatus.returned;
  
    /// Creates a copy of this order with the given fields replaced
    Order copyWith({
      String? id,
      String? userId,
      String? storeId,
      String? riderId,
      OrderStatus? status,
      double? totalAmount,
      double? deliveryFee,
      double? taxAmount,
      double? discountAmount,
      PaymentMethod? paymentMethod,
      PaymentStatus? paymentStatus,
      String? deliveryAddressId,
      String? deliveryNotes,
      DateTime? estimatedDeliveryTime,
      DateTime? actualDeliveryTime,
      String? orderCode,
      List<OrderItem>? items,
      List<OrderStatusHistory>? statusHistory,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return Order(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        storeId: storeId ?? this.storeId,
        riderId: riderId ?? this.riderId,
        status: status ?? this.status,
        totalAmount: totalAmount ?? this.totalAmount,
        deliveryFee: deliveryFee ?? this.deliveryFee,
        taxAmount: taxAmount ?? this.taxAmount,
        discountAmount: discountAmount ?? this.discountAmount,
        paymentMethod: paymentMethod ?? this.paymentMethod,
        paymentStatus: paymentStatus ?? this.paymentStatus,
        deliveryAddressId: deliveryAddressId ?? this.deliveryAddressId,
        deliveryNotes: deliveryNotes ?? this.deliveryNotes,
        estimatedDeliveryTime: estimatedDeliveryTime ?? this.estimatedDeliveryTime,
        actualDeliveryTime: actualDeliveryTime ?? this.actualDeliveryTime,
        orderCode: orderCode ?? this.orderCode,
        items: items ?? this.items,
        statusHistory: statusHistory ?? this.statusHistory,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          userId,
          storeId,
          riderId,
          status,
          totalAmount,
          deliveryFee,
          taxAmount,
          discountAmount,
          paymentMethod,
          paymentStatus,
          deliveryAddressId,
          deliveryNotes,
          estimatedDeliveryTime,
          actualDeliveryTime,
          orderCode,
          items,
          statusHistory,
          createdAt,
          updatedAt,
        ];
  }
  
  /// Order item model
  @JsonSerializable()
  class OrderItem {
    /// ID of the order item
    final String id;
    
    /// ID of the product
    final String productId;
    
    /// Name of the product
    final String productName;
    
    /// Quantity of the product
    final int quantity;
    
    /// Unit price of the product
    final double unitPrice;
    
    /// Total price for this item
    final double totalPrice;
  
    /// Creates a new instance of [OrderItem]
    const OrderItem({
      required this.id,
      required this.productId,
      required this.productName,
      required this.quantity,
      required this.unitPrice,
      required this.totalPrice,
    });
  
    /// Creates an [OrderItem] from JSON
    factory OrderItem.fromJson(Map<String, dynamic> json) => _$OrderItemFromJson(json);
  
    /// Converts the order item to a JSON map
    Map<String, dynamic> toJson() => _$OrderItemToJson(this);
  }
  
  /// Order status history model
  @JsonSerializable()
  class OrderStatusHistory {
    /// ID of the status history entry
    final String id;
    
    /// Status of the order
    final OrderStatus status;
    
    /// Notes about the status change
    final String? notes;
    
    /// Timestamp when the status was changed
    final DateTime createdAt;
    
    /// ID of the user who changed the status
    final String? createdBy;
  
    /// Creates a new instance of [OrderStatusHistory]
    const OrderStatusHistory({
      required this.id,
      required this.status,
      this.notes,
      required this.createdAt,
      this.createdBy,
    });
  
    /// Creates an [OrderStatusHistory] from JSON
    factory OrderStatusHistory.fromJson(Map<String, dynamic> json) => _$OrderStatusHistoryFromJson(json);
  
    /// Converts the status history to a JSON map
    Map<String, dynamic> toJson() => _$OrderStatusHistoryToJson(this);
  }
  ```

### 2.5. Store and Inventory Models

- [ ] Create store model:
  ```bash
  touch okada_core/lib/src/models/store.dart
  ```

- [ ] Implement store model:
  ```dart
  // okada_core/lib/src/models/store.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'store.g.dart';
  
  /// Dark store model representing a physical store location
  @JsonSerializable()
  class DarkStore extends BaseModel {
    /// Name of the store
    final String name;
    
    /// Address of the store
    final String address;
    
    /// City where the store is located
    final String city;
    
    /// State/province where the store is located
    final String? state;
    
    /// Postal code of the store location
    final String? postalCode;
    
    /// Country where the store is located
    final String country;
    
    /// Latitude coordinate of the store
    final double latitude;
    
    /// Longitude coordinate of the store
    final double longitude;
    
    /// Contact phone number for the store
    final String? contactPhone;
    
    /// Contact email for the store
    final String? contactEmail;
    
    /// Whether the store is active
    final bool isActive;
    
    /// Operating hours of the store
    final String? operatingHours;
    
    /// Coverage radius in kilometers
    final double coverageRadiusKm;
  
    /// Creates a new instance of [DarkStore]
    const DarkStore({
      required super.id,
      required this.name,
      required this.address,
      required this.city,
      this.state,
      this.postalCode,
      this.country = 'Cameroon',
      required this.latitude,
      required this.longitude,
      this.contactPhone,
      this.contactEmail,
      this.isActive = true,
      this.operatingHours,
      this.coverageRadiusKm = 5.0,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [DarkStore] from JSON
    factory DarkStore.fromJson(Map<String, dynamic> json) => _$DarkStoreFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$DarkStoreToJson(this);
  
    /// Gets the full address of the store
    String get fullAddress {
      final parts = [
        address,
        city,
        if (state != null) state,
        if (postalCode != null) postalCode,
        country,
      ];
      return parts.join(', ');
    }
  
    /// Creates a copy of this store with the given fields replaced
    DarkStore copyWith({
      String? id,
      String? name,
      String? address,
      String? city,
      String? state,
      String? postalCode,
      String? country,
      double? latitude,
      double? longitude,
      String? contactPhone,
      String? contactEmail,
      bool? isActive,
      String? operatingHours,
      double? coverageRadiusKm,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return DarkStore(
        id: id ?? this.id,
        name: name ?? this.name,
        address: address ?? this.address,
        city: city ?? this.city,
        state: state ?? this.state,
        postalCode: postalCode ?? this.postalCode,
        country: country ?? this.country,
        latitude: latitude ?? this.latitude,
        longitude: longitude ?? this.longitude,
        contactPhone: contactPhone ?? this.contactPhone,
        contactEmail: contactEmail ?? this.contactEmail,
        isActive: isActive ?? this.isActive,
        operatingHours: operatingHours ?? this.operatingHours,
        coverageRadiusKm: coverageRadiusKm ?? this.coverageRadiusKm,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          name,
          address,
          city,
          state,
          postalCode,
          country,
          latitude,
          longitude,
          contactPhone,
          contactEmail,
          isActive,
          operatingHours,
          coverageRadiusKm,
          createdAt,
          updatedAt,
        ];
  }
  
  /// Store inventory model
  @JsonSerializable()
  class StoreInventory extends BaseModel {
    /// ID of the store
    final String storeId;
    
    /// ID of the product
    final String productId;
    
    /// Quantity in stock
    final int quantity;
    
    /// Date of last restock
    final DateTime? lastRestockDate;
    
    /// Threshold for restock alerts
    final int restockThreshold;
  
    /// Creates a new instance of [StoreInventory]
    const StoreInventory({
      required super.id,
      required this.storeId,
      required this.productId,
      required this.quantity,
      this.lastRestockDate,
      this.restockThreshold = 5,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [StoreInventory] from JSON
    factory StoreInventory.fromJson(Map<String, dynamic> json) => _$StoreInventoryFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$StoreInventoryToJson(this);
  
    /// Checks if the inventory needs restocking
    bool get needsRestock => quantity <= restockThreshold;
  
    /// Creates a copy of this inventory with the given fields replaced
    StoreInventory copyWith({
      String? id,
      String? storeId,
      String? productId,
      int? quantity,
      DateTime? lastRestockDate,
      int? restockThreshold,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return StoreInventory(
        id: id ?? this.id,
        storeId: storeId ?? this.storeId,
        productId: productId ?? this.productId,
        quantity: quantity ?? this.quantity,
        lastRestockDate: lastRestockDate ?? this.lastRestockDate,
        restockThreshold: restockThreshold ?? this.restockThreshold,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          storeId,
          productId,
          quantity,
          lastRestockDate,
          restockThreshold,
          createdAt,
          updatedAt,
        ];
  }
  ```

### 2.6. Rider Models

- [ ] Create rider model:
  ```bash
  touch okada_core/lib/src/models/rider.dart
  ```

- [ ] Implement rider model:
  ```dart
  // okada_core/lib/src/models/rider.dart
  import 'package:json_annotation/json_annotation.dart';
  import 'base_model.dart';
  
  part 'rider.g.dart';
  
  /// Status of a rider
  enum RiderStatus {
    /// Rider is offline
    offline,
    
    /// Rider is online and available
    available,
    
    /// Rider is busy with a delivery
    busy,
    
    /// Rider is on break
    onBreak,
    
    /// Rider is inactive
    inactive
  }
  
  /// Type of vehicle used by the rider
  enum VehicleType {
    /// Motorcycle
    motorcycle,
    
    /// Bicycle
    bicycle,
    
    /// Car
    car,
    
    /// On foot
    onFoot
  }
  
  /// Rider model representing a delivery person
  @JsonSerializable()
  class Rider extends BaseModel {
    /// ID of the user associated with this rider
    final String userId;
    
    /// Type of vehicle used by the rider
    final VehicleType vehicleType;
    
    /// License number of the rider's vehicle
    final String? licenseNumber;
    
    /// Whether the rider is active
    final bool isActive;
    
    /// Current latitude of the rider
    final double? currentLatitude;
    
    /// Current longitude of the rider
    final double? currentLongitude;
    
    /// Timestamp of the last location update
    final DateTime? lastLocationUpdate;
    
    /// Average rating of the rider
    final double? rating;
    
    /// Total number of deliveries completed
    final int totalDeliveries;
    
    /// ID of the store the rider is assigned to
    final String? assignedStoreId;
    
    /// Current status of the rider
    final RiderStatus status;
  
    /// Creates a new instance of [Rider]
    const Rider({
      required super.id,
      required this.userId,
      required this.vehicleType,
      this.licenseNumber,
      this.isActive = true,
      this.currentLatitude,
      this.currentLongitude,
      this.lastLocationUpdate,
      this.rating,
      this.totalDeliveries = 0,
      this.assignedStoreId,
      this.status = RiderStatus.offline,
      super.createdAt,
      super.updatedAt,
    });
  
    /// Creates a [Rider] from JSON
    factory Rider.fromJson(Map<String, dynamic> json) => _$RiderFromJson(json);
  
    @override
    Map<String, dynamic> toJson() => _$RiderToJson(this);
  
    /// Checks if the rider is currently available for deliveries
    bool get isAvailable => isActive && status == RiderStatus.available;
  
    /// Checks if the rider has a valid location
    bool get hasValidLocation => currentLatitude != null && currentLongitude != null;
  
    /// Creates a copy of this rider with the given fields replaced
    Rider copyWith({
      String? id,
      String? userId,
      VehicleType? vehicleType,
      String? licenseNumber,
      bool? isActive,
      double? currentLatitude,
      double? currentLongitude,
      DateTime? lastLocationUpdate,
      double? rating,
      int? totalDeliveries,
      String? assignedStoreId,
      RiderStatus? status,
      DateTime? createdAt,
      DateTime? updatedAt,
    }) {
      return Rider(
        id: id ?? this.id,
        userId: userId ?? this.userId,
        vehicleType: vehicleType ?? this.vehicleType,
        licenseNumber: licenseNumber ?? this.licenseNumber,
        isActive: isActive ?? this.isActive,
        currentLatitude: currentLatitude ?? this.currentLatitude,
        currentLongitude: currentLongitude ?? this.currentLongitude,
        lastLocationUpdate: lastLocationUpdate ?? this.lastLocationUpdate,
        rating: rating ?? this.rating,
        totalDeliveries: totalDeliveries ?? this.totalDeliveries,
        assignedStoreId: assignedStoreId ?? this.assignedStoreId,
        status: status ?? this.status,
        createdAt: createdAt ?? this.createdAt,
        updatedAt: updatedAt ?? this.updatedAt,
      );
    }
  
    @override
    List<Object?> get props => [
          id,
          userId,
          vehicleType,
          licenseNumber,
          isActive,
          currentLatitude,
          currentLongitude,
          lastLocationUpdate,
          rating,
          totalDeliveries,
          assignedStoreId,
          status,
          createdAt,
          updatedAt,
        ];
  }
  ```

### 2.7. AI Models

- [ ] Create AI recommendation model:
  ```bash
  touch okada_core/lib/src/models/ai_recommendation.dart
  ```

- [ ] Implement AI recommendation model:
  ```dart
  // okada_core/lib/src/models/ai_recommendation.dart
  import 'package:json_annotation/json_annotation.dart';
  
  part 'ai_recommendation.g.dart';
  
  /// Types of recommendations
  enum RecommendationType {
    /// Product recommendations
    product,
    
    /// Category recommendations
    category,
    
    /// Store recommendations
    store,
    
    /// Search query recommendations
    searchQuery
  }
  
  /// AI recommendation request model
  @JsonSerializable()
  class RecommendationRequest {
    /// ID of the user to get recommendations for
    final String? userId;
    
    /// ID of the product to get similar recommendations for
    final String? productId;
    
    /// ID of the category to get recommendations within
    final String? categoryId;
    
    /// Type of recommendation to get
    final RecommendationType type;
    
    /// Maximum number of recommendations to return
    final int limit;
    
    /// Context information for the recommendation
    final RecommendationContext? context;
  
    /// Creates a new instance of [RecommendationRequest]
    const RecommendationRequest({
      this.userId,
      this.productId,
      this.categoryId,
      required this.type,
      this.limit = 10,
      this.context,
    });
  
    /// Creates a [RecommendationRequest] from JSON
    factory RecommendationRequest.fromJson(Map<String, dynamic> json) => _$RecommendationRequestFromJson(json);
  
    /// Converts the request to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationRequestToJson(this);
  }
  
  /// Context information for recommendations
  @JsonSerializable()
  class RecommendationContext {
    /// Current location of the user
    final LocationContext? location;
    
    /// Time of day (morning, afternoon, evening, night)
    final String? timeOfDay;
    
    /// Day of the week
    final String? dayOfWeek;
    
    /// Weather conditions
    final String? weather;
    
    /// Recent search queries
    final List<String>? recentSearches;
    
    /// Recently viewed products
    final List<String>? recentViews;
    
    /// Type of device being used
    final String? deviceType;
    
    /// Current cart items
    final List<String>? cartItems;
  
    /// Creates a new instance of [RecommendationContext]
    const RecommendationContext({
      this.location,
      this.timeOfDay,
      this.dayOfWeek,
      this.weather,
      this.recentSearches,
      this.recentViews,
      this.deviceType,
      this.cartItems,
    });
  
    /// Creates a [RecommendationContext] from JSON
    factory RecommendationContext.fromJson(Map<String, dynamic> json) => _$RecommendationContextFromJson(json);
  
    /// Converts the context to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationContextToJson(this);
  }
  
  /// Location context for recommendations
  @JsonSerializable()
  class LocationContext {
    /// Latitude coordinate
    final double latitude;
    
    /// Longitude coordinate
    final double longitude;
    
    /// City name
    final String? city;
    
    /// Neighborhood name
    final String? neighborhood;
  
    /// Creates a new instance of [LocationContext]
    const LocationContext({
      required this.latitude,
      required this.longitude,
      this.city,
      this.neighborhood,
    });
  
    /// Creates a [LocationContext] from JSON
    factory LocationContext.fromJson(Map<String, dynamic> json) => _$LocationContextFromJson(json);
  
    /// Converts the location context to a JSON map
    Map<String, dynamic> toJson() => _$LocationContextToJson(this);
  }
  
  /// Recommendation item model
  @JsonSerializable()
  class RecommendationItem {
    /// ID of the recommended item
    final String id;
    
    /// Type of the recommended item
    final RecommendationType type;
    
    /// Score/confidence of the recommendation
    final double score;
    
    /// Reason for the recommendation
    final String? reason;
  
    /// Creates a new instance of [RecommendationItem]
    const RecommendationItem({
      required this.id,
      required this.type,
      required this.score,
      this.reason,
    });
  
    /// Creates a [RecommendationItem] from JSON
    factory RecommendationItem.fromJson(Map<String, dynamic> json) => _$RecommendationItemFromJson(json);
  
    /// Converts the recommendation item to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationItemToJson(this);
  }
  
  /// AI recommendation response model
  @JsonSerializable()
  class RecommendationResponse {
    /// List of recommended items
    final List<RecommendationItem> items;
    
    /// ID of the request
    final String requestId;
    
    /// Version of the model used
    final String modelVersion;
  
    /// Creates a new instance of [RecommendationResponse]
    const RecommendationResponse({
      required this.items,
      required this.requestId,
      required this.modelVersion,
    });
  
    /// Creates a [RecommendationResponse] from JSON
    factory RecommendationResponse.fromJson(Map<String, dynamic> json) => _$RecommendationResponseFromJson(json);
  
    /// Converts the response to a JSON map
    Map<String, dynamic> toJson() => _$RecommendationResponseToJson(this);
  }
  ```

- [ ] Create AI demand forecast model:
  ```bash
  touch okada_core/lib/src/models/ai_demand_forecast.dart
  ```

- [ ] Implement AI demand forecast model:
  ```dart
  // okada_core/lib/src/models/ai_demand_forecast.dart
  import 'package:json_annotation/json_annotation.dart';
  
  part 'ai_demand_forecast.g.dart';
  
  /// AI demand forecast request model
  @JsonSerializable()
  class DemandForecastRequest {
    /// List of product IDs to forecast demand for
    final List<String> productIds;
    
    /// ID of the store to forecast demand for
    final String storeId;
    
    /// Number of time periods to forecast
    final int horizon;
    
    /// Additional features for forecasting
    final ForecastFeatures? features;
  
    /// Creates a new instance of [DemandForecastRequest]
    const DemandForecastRequest({
      required this.productIds,
      required this.storeId,
      required this.horizon,
      this.features,
    });
  
    /// Creates a [DemandForecastRequest] from JSON
    factory DemandForecastRequest.fromJson(Map<String, dynamic> json) => _$DemandForecastRequestFromJson(json);
  
    /// Converts the request to a JSON map
    Map<String, dynamic> toJson() => _$DemandForecastRequestToJson(this);
  }
  
  /// Additional features for demand forecasting
  @JsonSerializable()
  class ForecastFeatures {
    /// Weather forecast data
    final Map<String, dynamic>? weatherForecast;
    
    /// Upcoming events that may affect demand
    final List<Map<String, dynamic>>? events;
    
    /// Upcoming promotions that may affect demand
    final List<Map<String, dynamic>>? promotions;
    
    /// Upcoming holidays that may affect demand
    final List<String>? holidays;
  
    /// Creates a new instance of [ForecastFeatures]
    const ForecastFeatures({
      this.weatherForecast,
      this.events,
      this.promotions,
      this.holidays,
    });
  
    /// Creates [ForecastFeatures] from JSON
    factory ForecastFeatures.fromJson(Map<String, dynamic> json) => _$ForecastFeaturesFromJson(json);
  
    /// Converts the features to a JSON map
    Map<String, dynamic> toJson() => _$ForecastFeaturesToJson(this);
  }
  
  /// Forecast item model
  @JsonSerializable()
  class ForecastItem {
    /// ID of the product
    final String productId;
    
    /// Timestamp of the forecast
    final DateTime timestamp;
    
    /// Forecasted quantity
    final double quantity;
    
    /// Confidence interval [lower_bound, upper_bound]
    final List<double> confidenceInterval;
  
    /// Creates a new instance of [ForecastItem]
    const ForecastItem({
      required this.productId,
      required this.timestamp,
      required this.quantity,
      required this.confidenceInterval,
    });
  
    /// Creates a [ForecastItem] from JSON
    factory ForecastItem.fromJson(Map<String, dynamic> json) => _$ForecastItemFromJson(json);
  
    /// Converts the forecast item to a JSON map
    Map<String, dynamic> toJson() => _$ForecastItemToJson(this);
  }
  
  /// AI demand forecast response model
  @JsonSerializable()
  class DemandForecastResponse {
    /// List of forecast items
    final List<ForecastItem> forecasts;
    
    /// ID of the request
    final String requestId;
    
    /// Version of the model used
    final String modelVersion;
  
    /// Creates a new instance of [DemandForecastResponse]
    const DemandForecastResponse({
      required this.forecasts,
      required this.requestId,
      required this.modelVersion,
    });
  
    /// Creates a [DemandForecastResponse] from JSON
    factory DemandForecastResponse.fromJson(Map<String, dynamic> json) => _$DemandForecastResponseFromJson(json);
  
    /// Converts the response to a JSON map
    Map<String, dynamic> toJson() => _$DemandForecastResponseToJson(this);
  }
  ```

- [ ] Create AI route optimization model:
  ```bash
  touch okada_core/lib/src/models/ai_route_optimization.dart
  ```

- [ ] Implement AI route optimization model:
  ```dart
  // okada_core/lib/src/models/ai_route_optimization.dart
  import 'package:json_annotation/json_annotation.dart';
  
  part 'ai_route_optimization.g.dart';
  
  /// AI route optimization request model
  @JsonSerializable()
  class RouteOptimizationRequest {
    /// List of orders to optimize routes for
    final List<OrderForRouting> orders;
    
    /// List of available riders
    final List<RiderForRouting> riders;
    
    /// What to optimize for (time, distance, or balanced)
    final String optimizeFor;
    
    /// Traffic conditions (light, moderate, heavy)
    final String? trafficConditions;
    
    /// Weather conditions (clear, rain, storm)
    final String? weatherConditions;
  
    /// Creates a new instance of [RouteOptimizationRequest]
    const RouteOptimizationRequest({
      required this.orders,
      required this.riders,
      this.optimizeFor = 'balanced',
      this.trafficConditions,
      this.weatherConditions,
    });
  
    /// Creates a [RouteOptimizationRequest] from JSON
    factory RouteOptimizationRequest.fromJson(Map<String, dynamic> json) => _$RouteOptimizationRequestFromJson(json);
  
    /// Converts the request to a JSON map
    Map<String, dynamic> toJson() => _$RouteOptimizationRequestToJson(this);
  }
  
  /// Order information for routing
  @JsonSerializable()
  class OrderForRouting {
    /// ID of the order
    final String orderId;
    
    /// Pickup location
    final LocationForRouting pickupLocation;
    
    /// Delivery location
    final LocationForRouting deliveryLocation;
    
    /// Time when the order will be ready for pickup
    final DateTime readyTime;
    
    /// Deadline for delivery
    final DateTime? deliveryDeadline;
    
    /// Priority of the order (higher number means higher priority)
    final int priority;
    
    /// Weight of the order
    final double? weight;
    
    /// Volume of the order
    final double? volume;
  
    /// Creates a new instance of [OrderForRouting]
    const OrderForRouting({
      required this.orderId,
      required this.pickupLocation,
      required this.deliveryLocation,
      required this.readyTime,
      this.deliveryDeadline,
      this.priority = 1,
      this.weight,
      this.volume,
    });
  
    /// Creates an [OrderForRouting] from JSON
    factory OrderForRouting.fromJson(Map<String, dynamic> json) => _$OrderForRoutingFromJson(json);
  
    /// Converts the order to a JSON map
    Map<String, dynamic> toJson() => _$OrderForRoutingToJson(this);
  }
  
  /// Rider information for routing
  @JsonSerializable()
  class RiderForRouting {
    /// ID of the rider
    final String riderId;
    
    /// Current location of the rider
    final LocationForRouting currentLocation;
    
    /// Time when the rider becomes available
    final DateTime availableFrom;
    
    /// Time until the rider is available
    final DateTime? availableUntil;
    
    /// Maximum weight the rider can carry
    final double? maxWeight;
    
    /// Maximum volume the rider can carry
    final double? maxVolume;
    
    /// Type of vehicle the rider uses
    final String vehicleType;
  
    /// Creates a new instance of [RiderForRouting]
    const RiderForRouting({
      required this.riderId,
      required this.currentLocation,
      required this.availableFrom,
      this.availableUntil,
      this.maxWeight,
      this.maxVolume,
      required this.vehicleType,
    });
  
    /// Creates a [RiderForRouting] from JSON
    factory RiderForRouting.fromJson(Map<String, dynamic> json) => _$RiderForRoutingFromJson(json);
  
    /// Converts the rider to a JSON map
    Map<String, dynamic> toJson() => _$RiderForRoutingToJson(this);
  }
  
  /// Location information for routing
  @JsonSerializable()
  class LocationForRouting {
    /// Latitude coordinate
    final double latitude;
    
    /// Longitude coordinate
    final double longitude;
    
    /// Address as text
    final String? address;
  
    /// Creates a new instance of [LocationForRouting]
    const LocationForRouting({
      required this.latitude,
      required this.longitude,
      this.address,
    });
  
    /// Creates a [LocationForRouting] from JSON
    factory LocationForRouting.fromJson(Map<String, dynamic> json) => _$LocationForRoutingFromJson(json);
  
    /// Converts the location to a JSON map
    Map<String, dynamic> toJson() => _$LocationForRoutingToJson(this);
  }
  
  /// Stop in an optimized route
  @JsonSerializable()
  class RouteStop {
    /// ID of the order
    final String orderId;
    
    /// Location of the stop
    final LocationForRouting location;
    
    /// Estimated arrival time
    final DateTime estimatedArrivalTime;
    
    /// Estimated departure time
    final DateTime estimatedDepartureTime;
  
    /// Creates a new instance of [RouteStop]
    const RouteStop({
      required this.orderId,
      required this.location,
      required this.estimatedArrivalTime,
      required this.estimatedDepartureTime,
    });
  
    /// Creates a [RouteStop] from JSON
    factory RouteStop.fromJson(Map<String, dynamic> json) => _$RouteStopFromJson(json);
  
    /// Converts the stop to a JSON map
    Map<String, dynamic> toJson() => _$RouteStopToJson(this);
  }
  
  /// Optimized route for a rider
  @JsonSerializable()
  class OptimizedRoute {
    /// ID of the rider
    final String riderId;
    
    /// List of stops in the route
    final List<RouteStop> stops;
    
    /// Total distance in kilometers
    final double totalDistance;
    
    /// Total time in minutes
    final int totalTime;
    
    /// Start time of the route
    final DateTime startTime;
    
    /// End time of the route
    final DateTime endTime;
  
    /// Creates a new instance of [OptimizedRoute]
    const OptimizedRoute({
      required this.riderId,
      required this.stops,
      required this.totalDistance,
      required this.totalTime,
      required this.startTime,
      required this.endTime,
    });
  
    /// Creates an [OptimizedRoute] from JSON
    factory OptimizedRoute.fromJson(Map<String, dynamic> json) => _$OptimizedRouteFromJson(json);
  
    /// Converts the route to a JSON map
    Map<String, dynamic> toJson() => _$OptimizedRouteToJson(this);
  }
  
  /// AI route optimization response model
  @JsonSerializable()
  class RouteOptimizationResponse {
    /// List of optimized routes
    final List<OptimizedRoute> routes;
    
    /// ID of the request
    final String requestId;
    
    /// Version of the model used
    final String modelVersion;
  
    /// Creates a new instance of [RouteOptimizationResponse]
    const RouteOptimizationResponse({
      required this.routes,
      required this.requestId,
      required this.modelVersion,
    });
  
    /// Creates a [RouteOptimizationResponse] from JSON
    factory RouteOptimizationResponse.fromJson(Map<String, dynamic> json) => _$RouteOptimizationResponseFromJson(json);
  
    /// Converts the response to a JSON map
    Map<String, dynamic> toJson() => _$RouteOptimizationResponseToJson(this);
  }
  ```

### 2.8. Generate Model Files

- [ ] Run build_runner to generate JSON serialization code:
  ```bash
  cd okada_core
  flutter pub get
  flutter pub run build_runner build --delete-conflicting-outputs
  ```

## 3. API Controllers Implementation

### 3.1. Base Controller

- [ ] Create base controller:
  ```bash
  mkdir -p okada_api/lib/src/controllers
  touch okada_api/lib/src/controllers/base_controller.dart
  ```

- [ ] Implement base controller:
  ```dart
  // okada_api/lib/src/controllers/base_controller.dart
  import 'dart:convert';
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  import 'package:logging/logging.dart';
  
  /// Base controller class for API endpoints
  abstract class BaseController {
    /// Logger instance for this controller
    final Logger logger;
  
    /// Creates a new instance of [BaseController]
    BaseController(String name) : logger = Logger(name);
  
    /// Gets the router for this controller
    Router get router;
  
    /// Creates a JSON response
    Response jsonResponse(dynamic body, {int statusCode = 200}) {
      return Response(
        statusCode,
        body: json.encode(body),
        headers: {'content-type': 'application/json'},
      );
    }
  
    /// Creates a success response
    Response success(dynamic data, {String? message, int statusCode = 200}) {
      return jsonResponse({
        'success': true,
        'message': message,
        'data': data,
      }, statusCode: statusCode);
    }
  
    /// Creates an error response
    Response error(String message, {int statusCode = 400, dynamic details}) {
      return jsonResponse({
        'success': false,
        'message': message,
        'details': details,
      }, statusCode: statusCode);
    }
  
    /// Handles exceptions and returns an appropriate error response
    Response handleException(Object e, StackTrace stackTrace) {
      logger.severe('Exception caught', e, stackTrace);
  
      if (e is FormatException) {
        return error('Invalid request format', statusCode: 400);
      }
  
      return error('Internal server error', statusCode: 500);
    }
  
    /// Parses the request body as JSON
    Future<Map<String, dynamic>> parseJsonBody(Request request) async {
      final body = await request.readAsString();
      if (body.isEmpty) {
        return {};
      }
      return json.decode(body) as Map<String, dynamic>;
    }
  }
  ```

### 3.2. Auth Controller

- [ ] Create auth controller:
  ```bash
  touch okada_api/lib/src/controllers/auth_controller.dart
  ```

- [ ] Implement auth controller:
  ```dart
  // okada_api/lib/src/controllers/auth_controller.dart
  import 'dart:convert';
  import 'package:crypto/crypto.dart';
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  import 'package:uuid/uuid.dart';
  import 'package:jwt_decoder/jwt_decoder.dart';
  
  import '../services/user_service.dart';
  import '../services/auth_service.dart';
  import 'base_controller.dart';
  
  /// Controller for authentication endpoints
  class AuthController extends BaseController {
    /// User service instance
    final UserService _userService;
    
    /// Auth service instance
    final AuthService _authService;
  
    /// Creates a new instance of [AuthController]
    AuthController(this._userService, this._authService) : super('AuthController');
  
    @override
    Router get router {
      final router = Router();
  
      // Register a new user
      router.post('/register', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['phoneNumber', 'firstName', 'lastName', 'password'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null || body[field].toString().isEmpty) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Check if user already exists
          final existingUser = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (existingUser != null) {
            return error('User with this phone number already exists', statusCode: 409);
          }
  
          // Create user
          final userId = const Uuid().v4();
          final hashedPassword = _hashPassword(body['password']);
  
          final user = await _userService.createUser(
            id: userId,
            phoneNumber: body['phoneNumber'],
            email: body['email'],
            firstName: body['firstName'],
            lastName: body['lastName'],
            passwordHash: hashedPassword,
          );
  
          // Generate verification code and send SMS
          await _authService.sendVerificationCode(user.phoneNumber);
  
          return success({
            'userId': user.id,
            'phoneNumber': user.phoneNumber,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'requiresVerification': true,
          }, message: 'User registered successfully', statusCode: 201);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Login
      router.post('/login', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber') || !body.containsKey('password')) {
            return error('Phone number and password are required', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('Invalid credentials', statusCode: 401);
          }
  
          // Verify password
          final hashedPassword = _hashPassword(body['password']);
          final isValid = await _authService.verifyPassword(user.id, hashedPassword);
          if (!isValid) {
            return error('Invalid credentials', statusCode: 401);
          }
  
          // Generate token
          final token = await _authService.generateToken(user.id);
  
          // Update last login
          await _userService.updateLastLogin(user.id);
  
          return success({
            'token': token,
            'user': {
              'id': user.id,
              'phoneNumber': user.phoneNumber,
              'firstName': user.firstName,
              'lastName': user.lastName,
              'email': user.email,
              'profileImageUrl': user.profileImageUrl,
              'isPhoneVerified': user.isPhoneVerified,
            },
          }, message: 'Login successful');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Verify phone number
      router.post('/verify-phone', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber') || !body.containsKey('code')) {
            return error('Phone number and verification code are required', statusCode: 400);
          }
  
          // Verify code
          final isValid = await _authService.verifyCode(body['phoneNumber'], body['code']);
          if (!isValid) {
            return error('Invalid verification code', statusCode: 400);
          }
  
          // Update user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          await _userService.markPhoneAsVerified(user.id);
  
          // Generate token
          final token = await _authService.generateToken(user.id);
  
          return success({
            'token': token,
            'user': {
              'id': user.id,
              'phoneNumber': user.phoneNumber,
              'firstName': user.firstName,
              'lastName': user.lastName,
              'email': user.email,
              'profileImageUrl': user.profileImageUrl,
              'isPhoneVerified': true,
            },
          }, message: 'Phone number verified successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Resend verification code
      router.post('/resend-verification', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber')) {
            return error('Phone number is required', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          // Generate and send verification code
          await _authService.sendVerificationCode(user.phoneNumber);
  
          return success(null, message: 'Verification code sent successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Forgot password
      router.post('/forgot-password', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber')) {
            return error('Phone number is required', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          // Generate and send reset code
          await _authService.sendPasswordResetCode(user.phoneNumber);
  
          return success(null, message: 'Password reset code sent successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Reset password
      router.post('/reset-password', (Request request) async {
        try {
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('phoneNumber') || 
              !body.containsKey('code') || 
              !body.containsKey('newPassword')) {
            return error('Phone number, code, and new password are required', statusCode: 400);
          }
  
          // Verify code
          final isValid = await _authService.verifyResetCode(body['phoneNumber'], body['code']);
          if (!isValid) {
            return error('Invalid reset code', statusCode: 400);
          }
  
          // Find user
          final user = await _userService.findByPhoneNumber(body['phoneNumber']);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          // Update password
          final hashedPassword = _hashPassword(body['newPassword']);
          await _userService.updatePassword(user.id, hashedPassword);
  
          return success(null, message: 'Password reset successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Change password
      router.post('/change-password', (Request request) async {
        try {
          // Verify token
          final userId = await _getUserIdFromRequest(request);
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('currentPassword') || !body.containsKey('newPassword')) {
            return error('Current password and new password are required', statusCode: 400);
          }
  
          // Verify current password
          final hashedCurrentPassword = _hashPassword(body['currentPassword']);
          final isValid = await _authService.verifyPassword(userId, hashedCurrentPassword);
          if (!isValid) {
            return error('Current password is incorrect', statusCode: 400);
          }
  
          // Update password
          final hashedNewPassword = _hashPassword(body['newPassword']);
          await _userService.updatePassword(userId, hashedNewPassword);
  
          return success(null, message: 'Password changed successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Refresh token
      router.post('/refresh-token', (Request request) async {
        try {
          // Verify token
          final userId = await _getUserIdFromRequest(request);
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          // Generate new token
          final token = await _authService.generateToken(userId);
  
          return success({
            'token': token,
          }, message: 'Token refreshed successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  
    /// Hashes a password using SHA-256
    String _hashPassword(String password) {
      final bytes = utf8.encode(password);
      final digest = sha256.convert(bytes);
      return digest.toString();
    }
  
    /// Gets the user ID from the request's authorization header
    Future<String?> _getUserIdFromRequest(Request request) async {
      final authHeader = request.headers['authorization'];
      if (authHeader == null || !authHeader.startsWith('Bearer ')) {
        return null;
      }
  
      final token = authHeader.substring(7);
      try {
        final decodedToken = JwtDecoder.decode(token);
        return decodedToken['sub'] as String?;
      } catch (e) {
        return null;
      }
    }
  }
  ```

### 3.3. User Controller

- [ ] Create user controller:
  ```bash
  touch okada_api/lib/src/controllers/user_controller.dart
  ```

- [ ] Implement user controller:
  ```dart
  // okada_api/lib/src/controllers/user_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/user_service.dart';
  import '../middleware/auth_middleware.dart';
  import 'base_controller.dart';
  
  /// Controller for user endpoints
  class UserController extends BaseController {
    /// User service instance
    final UserService _userService;
  
    /// Creates a new instance of [UserController]
    UserController(this._userService) : super('UserController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get current user profile
      router.get('/me', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final user = await _userService.findById(userId);
          if (user == null) {
            return error('User not found', statusCode: 404);
          }
  
          return success({
            'id': user.id,
            'phoneNumber': user.phoneNumber,
            'firstName': user.firstName,
            'lastName': user.lastName,
            'email': user.email,
            'profileImageUrl': user.profileImageUrl,
            'isPhoneVerified': user.isPhoneVerified,
            'isEmailVerified': user.isEmailVerified,
            'createdAt': user.createdAt?.toIso8601String(),
            'lastLogin': user.lastLogin?.toIso8601String(),
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update user profile
      router.put('/me', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Update user
          final updatedUser = await _userService.updateUser(
            userId,
            firstName: body['firstName'],
            lastName: body['lastName'],
            email: body['email'],
          );
  
          return success({
            'id': updatedUser.id,
            'phoneNumber': updatedUser.phoneNumber,
            'firstName': updatedUser.firstName,
            'lastName': updatedUser.lastName,
            'email': updatedUser.email,
            'profileImageUrl': updatedUser.profileImageUrl,
            'isPhoneVerified': updatedUser.isPhoneVerified,
            'isEmailVerified': updatedUser.isEmailVerified,
          }, message: 'Profile updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update profile image
      router.put('/me/profile-image', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('imageUrl') || body['imageUrl'] == null) {
            return error('Image URL is required', statusCode: 400);
          }
  
          // Update profile image
          await _userService.updateProfileImage(userId, body['imageUrl']);
  
          return success(null, message: 'Profile image updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update FCM token
      router.put('/me/fcm-token', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('fcmToken') || body['fcmToken'] == null) {
            return error('FCM token is required', statusCode: 400);
          }
  
          // Update FCM token
          await _userService.updateFcmToken(userId, body['fcmToken']);
  
          return success(null, message: 'FCM token updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get user addresses
      router.get('/me/addresses', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final addresses = await _userService.getUserAddresses(userId);
  
          return success(addresses);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Add user address
      router.post('/me/addresses', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['addressLine1', 'city', 'country', 'latitude', 'longitude'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Add address
          final address = await _userService.addUserAddress(
            userId,
            addressLine1: body['addressLine1'],
            addressLine2: body['addressLine2'],
            city: body['city'],
            state: body['state'],
            postalCode: body['postalCode'],
            country: body['country'],
            latitude: body['latitude'],
            longitude: body['longitude'],
            isDefault: body['isDefault'] ?? false,
            label: body['label'],
          );
  
          return success(address, message: 'Address added successfully', statusCode: 201);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update user address
      router.put('/me/addresses/<addressId>', (Request request, String addressId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Update address
          final address = await _userService.updateUserAddress(
            userId,
            addressId,
            addressLine1: body['addressLine1'],
            addressLine2: body['addressLine2'],
            city: body['city'],
            state: body['state'],
            postalCode: body['postalCode'],
            country: body['country'],
            latitude: body['latitude'],
            longitude: body['longitude'],
            isDefault: body['isDefault'],
            label: body['label'],
          );
  
          if (address == null) {
            return error('Address not found', statusCode: 404);
          }
  
          return success(address, message: 'Address updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Delete user address
      router.delete('/me/addresses/<addressId>', (Request request, String addressId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          // Delete address
          final success = await _userService.deleteUserAddress(userId, addressId);
          if (!success) {
            return error('Address not found', statusCode: 404);
          }
  
          return this.success(null, message: 'Address deleted successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Set default address
      router.put('/me/addresses/<addressId>/default', (Request request, String addressId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          // Set default address
          final success = await _userService.setDefaultAddress(userId, addressId);
          if (!success) {
            return error('Address not found', statusCode: 404);
          }
  
          return this.success(null, message: 'Default address updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.4. Product Controller

- [ ] Create product controller:
  ```bash
  touch okada_api/lib/src/controllers/product_controller.dart
  ```

- [ ] Implement product controller:
  ```dart
  // okada_api/lib/src/controllers/product_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/product_service.dart';
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for product endpoints
  class ProductController extends BaseController {
    /// Product service instance
    final ProductService _productService;
    
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [ProductController]
    ProductController(this._productService, this._aiService) : super('ProductController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get all products with pagination and filtering
      router.get('/', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          
          // Parse filtering parameters
          final categoryId = queryParams['categoryId'];
          final query = queryParams['query'];
          final minPrice = double.tryParse(queryParams['minPrice'] ?? '');
          final maxPrice = double.tryParse(queryParams['maxPrice'] ?? '');
          final sortBy = queryParams['sortBy'] ?? 'name';
          final sortOrder = queryParams['sortOrder'] ?? 'asc';
          final featured = queryParams['featured'] == 'true';
          
          // Get products
          final result = await _productService.getProducts(
            page: page,
            limit: limit,
            categoryId: categoryId,
            query: query,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sortBy: sortBy,
            sortOrder: sortOrder,
            featured: featured,
          );
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get product by ID
      router.get('/<id>', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          
          final product = await _productService.getProductById(id);
          if (product == null) {
            return error('Product not found', statusCode: 404);
          }
  
          // Log product view if user is logged in
          if (userId != null) {
            await _productService.logProductView(userId, id);
          }
  
          return success(product);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get products by category
      router.get('/category/<categoryId>', (Request request, String categoryId) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          
          // Get products by category
          final result = await _productService.getProductsByCategory(
            categoryId,
            page: page,
            limit: limit,
          );
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get featured products
      router.get('/featured', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse limit parameter
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          // Get featured products
          final products = await _productService.getFeaturedProducts(limit: limit);
  
          return success(products);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Search products
      router.get('/search', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final query = queryParams['q'];
          if (query == null || query.isEmpty) {
            return error('Search query is required', statusCode: 400);
          }
          
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          final userId = request.context['userId'] as String?;
          
          // Search products
          final result = await _productService.searchProducts(
            query,
            page: page,
            limit: limit,
          );
  
          // Log search if user is logged in
          if (userId != null) {
            await _productService.logSearch(userId, query);
          }
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get product recommendations
      router.get('/recommendations', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
          
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final productId = queryParams['productId'];
          final categoryId = queryParams['categoryId'];
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          // Get recommendations from AI service
          final recommendations = await _aiService.getProductRecommendations(
            userId: userId,
            productId: productId,
            categoryId: categoryId,
            limit: limit,
          );
  
          // Get full product details for recommended products
          final products = await _productService.getProductsByIds(
            recommendations.map((r) => r.id).toList(),
          );
  
          return success({
            'products': products,
            'requestId': recommendations.requestId,
            'modelVersion': recommendations.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get all categories
      router.get('/categories', (Request request) async {
        try {
          final categories = await _productService.getAllCategories();
          return success(categories);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get category by ID
      router.get('/categories/<id>', (Request request, String id) async {
        try {
          final category = await _productService.getCategoryById(id);
          if (category == null) {
            return error('Category not found', statusCode: 404);
          }
  
          return success(category);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.5. Order Controller

- [ ] Create order controller:
  ```bash
  touch okada_api/lib/src/controllers/order_controller.dart
  ```

- [ ] Implement order controller:
  ```dart
  // okada_api/lib/src/controllers/order_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/order_service.dart';
  import '../services/store_service.dart';
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for order endpoints
  class OrderController extends BaseController {
    /// Order service instance
    final OrderService _orderService;
    
    /// Store service instance
    final StoreService _storeService;
    
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [OrderController]
    OrderController(this._orderService, this._storeService, this._aiService) : super('OrderController');
  
    @override
    Router get router {
      final router = Router();
  
      // Create a new order
      router.post('/', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['storeId', 'deliveryAddressId', 'items', 'paymentMethod'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Validate items
          final items = body['items'] as List<dynamic>;
          if (items.isEmpty) {
            return error('Order must contain at least one item', statusCode: 400);
          }
  
          for (final item in items) {
            if (!item.containsKey('productId') || !item.containsKey('quantity')) {
              return error('Each item must have productId and quantity', statusCode: 400);
            }
          }
  
          // Create order
          final order = await _orderService.createOrder(
            userId: userId,
            storeId: body['storeId'],
            deliveryAddressId: body['deliveryAddressId'],
            items: items.map((item) => {
              'productId': item['productId'],
              'quantity': item['quantity'],
            }).toList(),
            paymentMethod: body['paymentMethod'],
            deliveryNotes: body['deliveryNotes'],
          );
  
          // Assign rider using AI route optimization
          final nearbyRiders = await _storeService.getNearbyRiders(body['storeId']);
          if (nearbyRiders.isNotEmpty) {
            final optimizedRoute = await _aiService.optimizeRoute(
              orders: [order],
              riders: nearbyRiders,
            );
  
            if (optimizedRoute.routes.isNotEmpty) {
              final riderId = optimizedRoute.routes.first.riderId;
              await _orderService.assignRider(order.id, riderId);
            }
          }
  
          return success(order, message: 'Order created successfully', statusCode: 201);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get user orders with pagination
      router.get('/my-orders', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          // Parse filtering parameters
          final status = queryParams['status'];
          
          // Get orders
          final result = await _orderService.getUserOrders(
            userId,
            page: page,
            limit: limit,
            status: status,
          );
  
          return success({
            'orders': result.orders,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get order by ID
      router.get('/<id>', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          return success(order);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Cancel order
      router.post('/<id>/cancel', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          // Check if the order can be cancelled
          if (order.status != 'pending' && order.status != 'confirmed') {
            return error('Order cannot be cancelled at this stage', statusCode: 400);
          }
  
          // Cancel order
          await _orderService.cancelOrder(id, userId);
  
          return success(null, message: 'Order cancelled successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Rate order
      router.post('/<id>/rate', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('rating') || body['rating'] == null) {
            return error('Rating is required', statusCode: 400);
          }
  
          final rating = body['rating'] as int;
          if (rating < 1 || rating > 5) {
            return error('Rating must be between 1 and 5', statusCode: 400);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          // Check if the order is delivered
          if (order.status != 'delivered') {
            return error('Only delivered orders can be rated', statusCode: 400);
          }
  
          // Rate order
          await _orderService.rateOrder(
            orderId: id,
            userId: userId,
            rating: rating,
            review: body['review'],
            riderId: order.riderId,
          );
  
          return success(null, message: 'Order rated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Track order
      router.get('/<id>/track', (Request request, String id) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final order = await _orderService.getOrderById(id);
          if (order == null) {
            return error('Order not found', statusCode: 404);
          }
  
          // Check if the order belongs to the user
          if (order.userId != userId) {
            return error('Unauthorized', statusCode: 403);
          }
  
          // Get tracking information
          final tracking = await _orderService.getOrderTracking(id);
  
          return success(tracking);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.6. Store Controller

- [ ] Create store controller:
  ```bash
  touch okada_api/lib/src/controllers/store_controller.dart
  ```

- [ ] Implement store controller:
  ```dart
  // okada_api/lib/src/controllers/store_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/store_service.dart';
  import 'base_controller.dart';
  
  /// Controller for store endpoints
  class StoreController extends BaseController {
    /// Store service instance
    final StoreService _storeService;
  
    /// Creates a new instance of [StoreController]
    StoreController(this._storeService) : super('StoreController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get all stores
      router.get('/', (Request request) async {
        try {
          final stores = await _storeService.getAllStores();
          return success(stores);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get store by ID
      router.get('/<id>', (Request request, String id) async {
        try {
          final store = await _storeService.getStoreById(id);
          if (store == null) {
            return error('Store not found', statusCode: 404);
          }
  
          return success(store);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get nearby stores
      router.get('/nearby', (Request request) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final latitude = double.tryParse(queryParams['latitude'] ?? '');
          final longitude = double.tryParse(queryParams['longitude'] ?? '');
          
          if (latitude == null || longitude == null) {
            return error('Latitude and longitude are required', statusCode: 400);
          }
          
          final radius = double.tryParse(queryParams['radius'] ?? '5.0') ?? 5.0;
          
          // Get nearby stores
          final stores = await _storeService.getNearbyStores(
            latitude: latitude,
            longitude: longitude,
            radiusKm: radius,
          );
  
          return success(stores);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get store inventory
      router.get('/<id>/inventory', (Request request, String id) async {
        try {
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '20') ?? 20;
          
          // Parse filtering parameters
          final categoryId = queryParams['categoryId'];
          final query = queryParams['query'];
          
          // Get store inventory
          final result = await _storeService.getStoreInventory(
            storeId: id,
            page: page,
            limit: limit,
            categoryId: categoryId,
            query: query,
          );
  
          return success({
            'products': result.products,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Check product availability in store
      router.get('/<storeId>/products/<productId>/availability', (Request request, String storeId, String productId) async {
        try {
          final availability = await _storeService.checkProductAvailability(storeId, productId);
          
          return success({
            'available': availability.available,
            'quantity': availability.quantity,
            'storeId': storeId,
            'productId': productId,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.7. Rider Controller

- [ ] Create rider controller:
  ```bash
  touch okada_api/lib/src/controllers/rider_controller.dart
  ```

- [ ] Implement rider controller:
  ```dart
  // okada_api/lib/src/controllers/rider_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/rider_service.dart';
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for rider endpoints
  class RiderController extends BaseController {
    /// Rider service instance
    final RiderService _riderService;
    
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [RiderController]
    RiderController(this._riderService, this._aiService) : super('RiderController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get rider profile
      router.get('/me', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          return success(rider);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update rider status
      router.put('/me/status', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('status') || body['status'] == null) {
            return error('Status is required', statusCode: 400);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Update status
          await _riderService.updateRiderStatus(rider.id, body['status']);
  
          return success(null, message: 'Status updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update rider location
      router.put('/me/location', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('latitude') || !body.containsKey('longitude')) {
            return error('Latitude and longitude are required', statusCode: 400);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Update location
          await _riderService.updateRiderLocation(
            rider.id,
            latitude: body['latitude'],
            longitude: body['longitude'],
          );
  
          return success(null, message: 'Location updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get rider's current orders
      router.get('/me/orders', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          final orders = await _riderService.getRiderOrders(rider.id);
  
          return success(orders);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get rider's order history
      router.get('/me/order-history', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final queryParams = request.url.queryParameters;
          
          // Parse pagination parameters
          final page = int.tryParse(queryParams['page'] ?? '1') ?? 1;
          final limit = int.tryParse(queryParams['limit'] ?? '10') ?? 10;
          
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          final result = await _riderService.getRiderOrderHistory(
            rider.id,
            page: page,
            limit: limit,
          );
  
          return success({
            'orders': result.orders,
            'pagination': {
              'page': page,
              'limit': limit,
              'totalItems': result.totalItems,
              'totalPages': result.totalPages,
            },
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Update order status
      router.put('/me/orders/<orderId>/status', (Request request, String orderId) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          if (!body.containsKey('status') || body['status'] == null) {
            return error('Status is required', statusCode: 400);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Check if the order is assigned to this rider
          final order = await _riderService.getOrderById(orderId);
          if (order == null || order.riderId != rider.id) {
            return error('Order not found or not assigned to you', statusCode: 404);
          }
  
          // Update order status
          await _riderService.updateOrderStatus(
            orderId,
            status: body['status'],
            notes: body['notes'],
            riderId: rider.id,
          );
  
          return success(null, message: 'Order status updated successfully');
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get optimized route for current orders
      router.get('/me/optimized-route', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Get current orders
          final orders = await _riderService.getRiderOrders(rider.id);
          if (orders.isEmpty) {
            return success({
              'routes': [],
              'message': 'No active orders to optimize',
            });
          }
  
          // Get optimized route from AI service
          final optimizedRoute = await _aiService.optimizeRoute(
            orders: orders,
            riders: [rider],
          );
  
          return success({
            'route': optimizedRoute.routes.isNotEmpty ? optimizedRoute.routes.first : null,
            'requestId': optimizedRoute.requestId,
            'modelVersion': optimizedRoute.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get rider earnings
      router.get('/me/earnings', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final queryParams = request.url.queryParameters;
          
          // Parse parameters
          final period = queryParams['period'] ?? 'week'; // day, week, month, year
          
          final rider = await _riderService.getRiderByUserId(userId);
          if (rider == null) {
            return error('Rider profile not found', statusCode: 404);
          }
  
          // Get earnings
          final earnings = await _riderService.getRiderEarnings(rider.id, period: period);
  
          return success(earnings);
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      return router;
    }
  }
  ```

### 3.8. AI Controller

- [ ] Create AI controller:
  ```bash
  touch okada_api/lib/src/controllers/ai_controller.dart
  ```

- [ ] Implement AI controller:
  ```dart
  // okada_api/lib/src/controllers/ai_controller.dart
  import 'package:shelf/shelf.dart';
  import 'package:shelf_router/shelf_router.dart';
  
  import '../services/ai_service.dart';
  import 'base_controller.dart';
  
  /// Controller for AI endpoints
  class AIController extends BaseController {
    /// AI service instance
    final AIService _aiService;
  
    /// Creates a new instance of [AIController]
    AIController(this._aiService) : super('AIController');
  
    @override
    Router get router {
      final router = Router();
  
      // Get product recommendations
      router.post('/recommendations/products', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Get recommendations
          final recommendations = await _aiService.getProductRecommendations(
            userId: userId,
            productId: body['productId'],
            categoryId: body['categoryId'],
            limit: body['limit'] ?? 10,
            context: body['context'],
          );
  
          return success({
            'recommendations': recommendations.items,
            'requestId': recommendations.requestId,
            'modelVersion': recommendations.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Get demand forecast
      router.post('/forecast/demand', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['storeId', 'productIds', 'horizon'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Get forecast
          final forecast = await _aiService.getDemandForecast(
            storeId: body['storeId'],
            productIds: List<String>.from(body['productIds']),
            horizon: body['horizon'],
            features: body['features'],
          );
  
          return success({
            'forecasts': forecast.forecasts,
            'requestId': forecast.requestId,
            'modelVersion': forecast.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace);
        }
      });
  
      // Optimize routes
      router.post('/optimize/routes', (Request request) async {
        try {
          final userId = request.context['userId'] as String?;
          if (userId == null) {
            return error('Unauthorized', statusCode: 401);
          }
  
          final body = await parseJsonBody(request);
  
          // Validate required fields
          final requiredFields = ['orders', 'riders'];
          for (final field in requiredFields) {
            if (!body.containsKey(field) || body[field] == null) {
              return error('Missing required field: $field', statusCode: 400);
            }
          }
  
          // Optimize routes
          final optimizedRoutes = await _aiService.optimizeRouteFromJson(body);
  
          return success({
            'routes': optimizedRoutes.routes,
            'requestId': optimizedRoutes.requestId,
            'modelVersion': optimizedRoutes.modelVersion,
          });
        } catch (e, stackTrace) {
          return handleException(e, stackTrace
