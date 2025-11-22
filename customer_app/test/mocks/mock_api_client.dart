import 'package:mockito/mockito.dart';
import 'package:okada_shared/api/okada_api_client.dart';
import 'package:dio/dio.dart';

/// Mock API client for testing
class MockOkadaApiClient extends Mock implements OkadaApiClient {}

/// Mock Dio Response for testing
class MockResponse extends Mock implements Response {
  @override
  final dynamic data;

  @override
  final int statusCode;

  MockResponse({
    required this.data,
    this.statusCode = 200,
  });
}

