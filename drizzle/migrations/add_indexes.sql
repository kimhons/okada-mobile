-- Database Indexes Migration for Okada Admin
-- Optimizes query performance for frequently accessed tables

-- Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customerId);
CREATE INDEX IF NOT EXISTS idx_orders_rider_id ON orders(riderId);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(paymentStatus);
CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, createdAt);

-- Riders table indexes
CREATE INDEX IF NOT EXISTS idx_riders_status ON riders(status);
CREATE INDEX IF NOT EXISTS idx_riders_created_at ON riders(createdAt);
CREATE INDEX IF NOT EXISTS idx_riders_rating ON riders(rating);

-- Rider earnings table indexes
CREATE INDEX IF NOT EXISTS idx_rider_earnings_rider_id ON riderEarnings(riderId);
CREATE INDEX IF NOT EXISTS idx_rider_earnings_created_at ON riderEarnings(createdAt);
CREATE INDEX IF NOT EXISTS idx_rider_earnings_status ON riderEarnings(status);
CREATE INDEX IF NOT EXISTS idx_rider_earnings_rider_status ON riderEarnings(riderId, status);

-- Quality photos table indexes
CREATE INDEX IF NOT EXISTS idx_quality_photos_order_id ON qualityPhotos(orderId);
CREATE INDEX IF NOT EXISTS idx_quality_photos_approval_status ON qualityPhotos(approvalStatus);
CREATE INDEX IF NOT EXISTS idx_quality_photos_uploaded_by ON qualityPhotos(uploadedBy);

-- Order items table indexes
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON orderItems(orderId);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON orderItems(productId);

-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(sellerId);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(isActive);

-- Notifications table indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(userId);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(isRead);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(createdAt);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(createdAt);

-- Sellers table indexes
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(userId);
CREATE INDEX IF NOT EXISTS idx_sellers_status ON sellers(status);

-- Support tickets indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON supportTickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON supportTickets(userId);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON supportTickets(priority);

-- Activity logs indexes
CREATE INDEX IF NOT EXISTS idx_activity_logs_admin_id ON activityLogs(adminId);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON activityLogs(entityType);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activityLogs(createdAt);

-- Transactions table indexes (if exists)
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(createdAt);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(userId);
