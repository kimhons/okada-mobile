import 'dart:async';

import 'package:flutter/material.dart';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../services/offline_storage_service.dart';
import '../services/sync_service.dart';

/// Connectivity indicator widget that shows offline status
class ConnectivityIndicator extends StatefulWidget {
  final Widget child;
  final bool showBanner;
  final bool showSnackbar;
  final Duration snackbarDuration;

  const ConnectivityIndicator({
    super.key,
    required this.child,
    this.showBanner = true,
    this.showSnackbar = true,
    this.snackbarDuration = const Duration(seconds: 3),
  });

  @override
  State<ConnectivityIndicator> createState() => _ConnectivityIndicatorState();
}

class _ConnectivityIndicatorState extends State<ConnectivityIndicator>
    with SingleTickerProviderStateMixin {
  final OfflineStorageService _offlineStorage = OfflineStorageService();
  final SyncService _syncService = SyncService();
  
  late AnimationController _animationController;
  late Animation<double> _slideAnimation;
  
  bool _isOnline = true;
  bool _isSyncing = false;
  int _pendingActions = 0;
  SyncProgress? _syncProgress;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _slideAnimation = Tween<double>(
      begin: -1.0,
      end: 0.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));

    _initializeConnectivity();
  }

  Future<void> _initializeConnectivity() async {
    await _offlineStorage.initialize();
    
    _isOnline = _offlineStorage.isOnline;
    _pendingActions = _offlineStorage.pendingActionsCount;
    
    _offlineStorage.onConnectivityChanged = _onConnectivityChanged;
    
    _syncService.onSyncProgress = (progress) {
      setState(() {
        _isSyncing = true;
        _syncProgress = progress;
      });
    };
    
    _syncService.onSyncComplete = (result) {
      setState(() {
        _isSyncing = false;
        _syncProgress = null;
        _pendingActions = _offlineStorage.pendingActionsCount;
      });
      
      if (widget.showSnackbar && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result.message),
            backgroundColor: result.success ? Colors.green : Colors.orange,
            duration: widget.snackbarDuration,
          ),
        );
      }
    };

    if (!_isOnline) {
      _animationController.forward();
    }
    
    setState(() {});
  }

  void _onConnectivityChanged() {
    final wasOnline = _isOnline;
    _isOnline = _offlineStorage.isOnline;
    _pendingActions = _offlineStorage.pendingActionsCount;

    if (wasOnline && !_isOnline) {
      // Went offline
      _animationController.forward();
      if (widget.showSnackbar && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('You are offline. Changes will sync when connected.'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } else if (!wasOnline && _isOnline) {
      // Came online
      _animationController.reverse();
      if (widget.showSnackbar && mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Back online! Syncing data...'),
            backgroundColor: Colors.green,
          ),
        );
      }
    }

    setState(() {});
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        widget.child,
        
        // Offline banner
        if (widget.showBanner)
          AnimatedBuilder(
            animation: _slideAnimation,
            builder: (context, child) {
              return Positioned(
                top: MediaQuery.of(context).padding.top,
                left: 0,
                right: 0,
                child: Transform.translate(
                  offset: Offset(0, _slideAnimation.value * 50),
                  child: child,
                ),
              );
            },
            child: _buildBanner(),
          ),
      ],
    );
  }

  Widget _buildBanner() {
    if (_isOnline && !_isSyncing) {
      return const SizedBox.shrink();
    }

    return Material(
      elevation: 4,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        color: _isSyncing ? Colors.blue : Colors.orange,
        child: SafeArea(
          bottom: false,
          child: Row(
            children: [
              if (_isSyncing)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                  ),
                )
              else
                const Icon(
                  Icons.cloud_off,
                  color: Colors.white,
                  size: 18,
                ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  _isSyncing
                      ? _syncProgress?.message ?? 'Syncing...'
                      : _pendingActions > 0
                          ? 'Offline • $_pendingActions pending changes'
                          : 'You are offline',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
              if (_isSyncing && _syncProgress != null)
                Text(
                  '${(_syncProgress!.progress * 100).toInt()}%',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Offline-aware button that queues actions when offline
class OfflineAwareButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final VoidCallback? onOfflinePressed;
  final Widget child;
  final ButtonStyle? style;
  final bool showOfflineIndicator;

  const OfflineAwareButton({
    super.key,
    required this.onPressed,
    this.onOfflinePressed,
    required this.child,
    this.style,
    this.showOfflineIndicator = true,
  });

  @override
  Widget build(BuildContext context) {
    final offlineStorage = OfflineStorageService();
    final isOnline = offlineStorage.isOnline;

    return ElevatedButton(
      onPressed: isOnline ? onPressed : onOfflinePressed,
      style: style?.copyWith(
        backgroundColor: !isOnline && showOfflineIndicator
            ? WidgetStateProperty.all(Colors.grey)
            : null,
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (!isOnline && showOfflineIndicator) ...[
            const Icon(Icons.cloud_off, size: 16),
            const SizedBox(width: 8),
          ],
          child,
        ],
      ),
    );
  }
}

/// Offline status badge widget
class OfflineStatusBadge extends StatefulWidget {
  final bool showPendingCount;
  final VoidCallback? onTap;

  const OfflineStatusBadge({
    super.key,
    this.showPendingCount = true,
    this.onTap,
  });

  @override
  State<OfflineStatusBadge> createState() => _OfflineStatusBadgeState();
}

class _OfflineStatusBadgeState extends State<OfflineStatusBadge> {
  final OfflineStorageService _offlineStorage = OfflineStorageService();
  bool _isOnline = true;
  int _pendingCount = 0;

  @override
  void initState() {
    super.initState();
    _initializeState();
  }

  Future<void> _initializeState() async {
    await _offlineStorage.initialize();
    
    _isOnline = _offlineStorage.isOnline;
    _pendingCount = _offlineStorage.pendingActionsCount;
    
    _offlineStorage.onConnectivityChanged = () {
      setState(() {
        _isOnline = _offlineStorage.isOnline;
        _pendingCount = _offlineStorage.pendingActionsCount;
      });
    };
    
    setState(() {});
  }

  @override
  Widget build(BuildContext context) {
    if (_isOnline && _pendingCount == 0) {
      return const SizedBox.shrink();
    }

    return GestureDetector(
      onTap: widget.onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        decoration: BoxDecoration(
          color: _isOnline ? Colors.green : Colors.orange,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              _isOnline ? Icons.sync : Icons.cloud_off,
              color: Colors.white,
              size: 14,
            ),
            if (widget.showPendingCount && _pendingCount > 0) ...[
              const SizedBox(width: 4),
              Text(
                '$_pendingCount',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Offline data wrapper that shows cached data with indicator
class OfflineDataWrapper<T> extends StatelessWidget {
  final T? data;
  final bool isFromCache;
  final DateTime? cacheTime;
  final Widget Function(T data) builder;
  final Widget? loadingWidget;
  final Widget? errorWidget;

  const OfflineDataWrapper({
    super.key,
    required this.data,
    required this.isFromCache,
    this.cacheTime,
    required this.builder,
    this.loadingWidget,
    this.errorWidget,
  });

  @override
  Widget build(BuildContext context) {
    if (data == null) {
      return errorWidget ?? const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.cloud_off, size: 48, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'No data available offline',
              style: TextStyle(color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return Column(
      children: [
        if (isFromCache)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            color: Colors.orange.withOpacity(0.1),
            child: Row(
              children: [
                const Icon(
                  Icons.offline_bolt,
                  size: 16,
                  color: Colors.orange,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    cacheTime != null
                        ? 'Showing cached data from ${_formatCacheTime(cacheTime!)}'
                        : 'Showing cached data',
                    style: const TextStyle(
                      fontSize: 12,
                      color: Colors.orange,
                    ),
                  ),
                ),
              ],
            ),
          ),
        Expanded(child: builder(data as T)),
      ],
    );
  }

  String _formatCacheTime(DateTime time) {
    final now = DateTime.now();
    final diff = now.difference(time);

    if (diff.inMinutes < 1) {
      return 'just now';
    } else if (diff.inMinutes < 60) {
      return '${diff.inMinutes}m ago';
    } else if (diff.inHours < 24) {
      return '${diff.inHours}h ago';
    } else {
      return '${diff.inDays}d ago';
    }
  }
}

/// Sync status dialog
class SyncStatusDialog extends StatefulWidget {
  const SyncStatusDialog({super.key});

  @override
  State<SyncStatusDialog> createState() => _SyncStatusDialogState();
}

class _SyncStatusDialogState extends State<SyncStatusDialog> {
  final SyncService _syncService = SyncService();
  final OfflineStorageService _offlineStorage = OfflineStorageService();
  
  bool _isSyncing = false;
  SyncProgress? _progress;
  SyncResult? _result;

  @override
  void initState() {
    super.initState();
    
    _syncService.onSyncProgress = (progress) {
      setState(() {
        _isSyncing = true;
        _progress = progress;
      });
    };
    
    _syncService.onSyncComplete = (result) {
      setState(() {
        _isSyncing = false;
        _result = result;
      });
    };
  }

  Future<void> _startSync() async {
    setState(() {
      _result = null;
    });
    await _syncService.syncAll();
  }

  @override
  Widget build(BuildContext context) {
    final pendingCount = _offlineStorage.pendingActionsCount;
    final isOnline = _offlineStorage.isOnline;

    return AlertDialog(
      title: const Text('Sync Status'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Connection status
          Row(
            children: [
              Icon(
                isOnline ? Icons.cloud_done : Icons.cloud_off,
                color: isOnline ? Colors.green : Colors.orange,
              ),
              const SizedBox(width: 8),
              Text(isOnline ? 'Online' : 'Offline'),
            ],
          ),
          const SizedBox(height: 16),
          
          // Pending actions
          Row(
            children: [
              const Icon(Icons.pending_actions, color: Colors.blue),
              const SizedBox(width: 8),
              Text('$pendingCount pending actions'),
            ],
          ),
          const SizedBox(height: 16),
          
          // Sync progress
          if (_isSyncing && _progress != null) ...[
            LinearProgressIndicator(value: _progress!.progress),
            const SizedBox(height: 8),
            Text(
              _progress!.message,
              style: const TextStyle(fontSize: 12, color: Colors.grey),
            ),
          ],
          
          // Sync result
          if (_result != null) ...[
            const Divider(),
            Row(
              children: [
                Icon(
                  _result!.success ? Icons.check_circle : Icons.warning,
                  color: _result!.success ? Colors.green : Colors.orange,
                ),
                const SizedBox(width: 8),
                Expanded(child: Text(_result!.message)),
              ],
            ),
            if (_result!.syncedItems > 0 || _result!.failedItems > 0) ...[
              const SizedBox(height: 8),
              Text(
                'Synced: ${_result!.syncedItems}, Failed: ${_result!.failedItems}',
                style: const TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Close'),
        ),
        if (isOnline)
          ElevatedButton(
            onPressed: _isSyncing ? null : _startSync,
            child: Text(_isSyncing ? 'Syncing...' : 'Sync Now'),
          ),
      ],
    );
  }
}
