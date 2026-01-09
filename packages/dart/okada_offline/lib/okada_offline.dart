/// Okada Platform - Offline Package
/// 
/// This package contains the offline sync engine, caching layer, and queue
/// management for offline-first functionality in the Okada Platform apps.
library okada_offline;

// Sync Engine
export 'src/sync/sync_engine.dart';
export 'src/sync/sync_operation.dart';
export 'src/sync/sync_status.dart';
export 'src/sync/conflict_resolver.dart';

// Cache
export 'src/cache/cache_manager.dart';
export 'src/cache/product_cache.dart';
export 'src/cache/category_cache.dart';
export 'src/cache/cart_cache.dart';

// Queue
export 'src/queue/operation_queue.dart';
export 'src/queue/queue_processor.dart';
