/// Pagination models for list responses
class PaginatedList<T> {
  final List<T> items;
  final int total;
  final int page;
  final int pageSize;
  final bool hasMore;

  const PaginatedList({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
    required this.hasMore,
  });

  /// Create from API response
  factory PaginatedList.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final items = (json['items'] as List<dynamic>?)
            ?.map((e) => fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];
    final total = json['total'] as int? ?? items.length;
    final page = json['page'] as int? ?? 1;
    final pageSize = json['pageSize'] as int? ?? 20;
    final hasMore = json['hasMore'] as bool? ?? (items.length >= pageSize);

    return PaginatedList(
      items: items,
      total: total,
      page: page,
      pageSize: pageSize,
      hasMore: hasMore,
    );
  }

  /// Create empty list
  factory PaginatedList.empty() => const PaginatedList(
        items: [],
        total: 0,
        page: 1,
        pageSize: 20,
        hasMore: false,
      );

  /// Check if list is empty
  bool get isEmpty => items.isEmpty;

  /// Check if list is not empty
  bool get isNotEmpty => items.isNotEmpty;

  /// Get total pages
  int get totalPages => (total / pageSize).ceil();

  /// Check if has previous page
  bool get hasPrevious => page > 1;

  /// Check if has next page
  bool get hasNext => hasMore;

  /// Get current page start index
  int get startIndex => (page - 1) * pageSize;

  /// Get current page end index
  int get endIndex => startIndex + items.length;

  /// Map items to another type
  PaginatedList<R> map<R>(R Function(T item) mapper) => PaginatedList(
        items: items.map(mapper).toList(),
        total: total,
        page: page,
        pageSize: pageSize,
        hasMore: hasMore,
      );

  /// Merge with another paginated list (for infinite scroll)
  PaginatedList<T> merge(PaginatedList<T> other) => PaginatedList(
        items: [...items, ...other.items],
        total: other.total,
        page: other.page,
        pageSize: other.pageSize,
        hasMore: other.hasMore,
      );

  /// Convert to JSON
  Map<String, dynamic> toJson(Map<String, dynamic> Function(T item) toJson) => {
        'items': items.map(toJson).toList(),
        'total': total,
        'page': page,
        'pageSize': pageSize,
        'hasMore': hasMore,
      };

  @override
  String toString() =>
      'PaginatedList(items: ${items.length}, total: $total, page: $page, hasMore: $hasMore)';
}

/// Pagination request parameters
class PaginationParams {
  final int page;
  final int pageSize;
  final String? sortBy;
  final bool sortDesc;
  final String? search;
  final Map<String, dynamic>? filters;

  const PaginationParams({
    this.page = 1,
    this.pageSize = 20,
    this.sortBy,
    this.sortDesc = false,
    this.search,
    this.filters,
  });

  /// Create first page params
  factory PaginationParams.first({
    int pageSize = 20,
    String? sortBy,
    bool sortDesc = false,
    String? search,
    Map<String, dynamic>? filters,
  }) =>
      PaginationParams(
        page: 1,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDesc: sortDesc,
        search: search,
        filters: filters,
      );

  /// Get next page params
  PaginationParams nextPage() => PaginationParams(
        page: page + 1,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDesc: sortDesc,
        search: search,
        filters: filters,
      );

  /// Get previous page params
  PaginationParams previousPage() => PaginationParams(
        page: page > 1 ? page - 1 : 1,
        pageSize: pageSize,
        sortBy: sortBy,
        sortDesc: sortDesc,
        search: search,
        filters: filters,
      );

  /// Copy with new values
  PaginationParams copyWith({
    int? page,
    int? pageSize,
    String? sortBy,
    bool? sortDesc,
    String? search,
    Map<String, dynamic>? filters,
  }) =>
      PaginationParams(
        page: page ?? this.page,
        pageSize: pageSize ?? this.pageSize,
        sortBy: sortBy ?? this.sortBy,
        sortDesc: sortDesc ?? this.sortDesc,
        search: search ?? this.search,
        filters: filters ?? this.filters,
      );

  /// Convert to query parameters
  Map<String, dynamic> toQueryParams() {
    final params = <String, dynamic>{
      'page': page,
      'pageSize': pageSize,
    };
    if (sortBy != null) {
      params['sortBy'] = sortBy;
      params['sortDesc'] = sortDesc;
    }
    if (search != null && search!.isNotEmpty) {
      params['search'] = search;
    }
    if (filters != null) {
      params.addAll(filters!);
    }
    return params;
  }

  @override
  String toString() =>
      'PaginationParams(page: $page, pageSize: $pageSize, sortBy: $sortBy, search: $search)';
}

/// Cursor-based pagination for real-time data
class CursorPaginatedList<T> {
  final List<T> items;
  final String? nextCursor;
  final String? previousCursor;
  final bool hasMore;

  const CursorPaginatedList({
    required this.items,
    this.nextCursor,
    this.previousCursor,
    required this.hasMore,
  });

  /// Create from API response
  factory CursorPaginatedList.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJson,
  ) {
    final items = (json['items'] as List<dynamic>?)
            ?.map((e) => fromJson(e as Map<String, dynamic>))
            .toList() ??
        [];

    return CursorPaginatedList(
      items: items,
      nextCursor: json['nextCursor'] as String?,
      previousCursor: json['previousCursor'] as String?,
      hasMore: json['hasMore'] as bool? ?? false,
    );
  }

  /// Create empty list
  factory CursorPaginatedList.empty() => const CursorPaginatedList(
        items: [],
        hasMore: false,
      );

  /// Check if list is empty
  bool get isEmpty => items.isEmpty;

  /// Check if list is not empty
  bool get isNotEmpty => items.isNotEmpty;

  /// Merge with another cursor paginated list
  CursorPaginatedList<T> merge(CursorPaginatedList<T> other) =>
      CursorPaginatedList(
        items: [...items, ...other.items],
        nextCursor: other.nextCursor,
        previousCursor: previousCursor,
        hasMore: other.hasMore,
      );
}
