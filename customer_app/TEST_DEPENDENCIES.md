# Test Dependencies for Order Tracking Tests

## Required Test Dependencies

Add the following to your `pubspec.yaml` under `dev_dependencies`:

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  
  # Testing framework
  flutter_lints: ^3.0.0
  
  # Mocking library
  mockito: ^5.4.4
  build_runner: ^2.4.7
  
  # Code coverage
  coverage: ^1.7.1
```

## Installation

```bash
cd customer_app
flutter pub add --dev mockito build_runner coverage
flutter pub get
```

## Running Tests

### Basic Test Run

```bash
# Run all tests
flutter test

# Run specific test file
flutter test test/providers/order_tracking_provider_test.dart

# Run tests with verbose output
flutter test --verbose
```

### With Coverage

```bash
# Generate coverage report
flutter test --coverage

# View coverage in terminal
lcov --summary coverage/lcov.info

# Generate HTML coverage report
genhtml coverage/lcov.info -o coverage/html

# Open coverage report in browser
open coverage/html/index.html  # macOS
xdg-open coverage/html/index.html  # Linux
start coverage/html/index.html  # Windows
```

### Watch Mode

```bash
# Run tests in watch mode (re-run on file changes)
flutter test --watch
```

### Specific Test Groups

```bash
# Run only tests in a specific group
flutter test --plain-name "Initialization"

# Run tests matching a pattern
flutter test --name "WebSocket"
```

## Test Structure

```
customer_app/
├── lib/
│   └── ... (source code)
├── test/
│   ├── fixtures/
│   │   └── tracking_data_fixtures.dart
│   ├── mocks/
│   │   └── mock_api_client.dart
│   ├── providers/
│   │   ├── order_tracking_provider_test.dart
│   │   └── order_tracking_websocket_test.dart
│   ├── test_config.dart
│   └── README.md
└── pubspec.yaml
```

## Test Commands Cheat Sheet

| Command | Description |
|:--------|:------------|
| `flutter test` | Run all tests |
| `flutter test --coverage` | Run tests with coverage |
| `flutter test --watch` | Run tests in watch mode |
| `flutter test --verbose` | Run with verbose output |
| `flutter test test/providers/` | Run tests in specific directory |
| `flutter test --name "pattern"` | Run tests matching pattern |
| `flutter test --plain-name "exact"` | Run tests with exact name |

## Coverage Thresholds

Recommended coverage thresholds for the project:

```yaml
# coverage.yaml (optional)
coverage:
  line-rate: 85
  branch-rate: 80
  exclude:
    - '**/*.g.dart'
    - '**/*.freezed.dart'
    - '**/main.dart'
```

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Flutter
      uses: subosito/flutter-action@v2
      with:
        flutter-version: '3.16.0'
        channel: 'stable'
    
    - name: Install dependencies
      run: |
        cd customer_app
        flutter pub get
    
    - name: Run tests
      run: |
        cd customer_app
        flutter test --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: customer_app/coverage/lcov.info
        fail_ci_if_error: true
```

## Troubleshooting

### Issue: "MockOkadaApiClient is not a subtype of OkadaApiClient"

**Solution:** Ensure mockito is properly configured:

```dart
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

@GenerateMocks([OkadaApiClient])
void main() {
  // tests
}
```

Then run:
```bash
flutter pub run build_runner build
```

### Issue: "Cannot find test fixtures"

**Solution:** Ensure test files are in the `test/` directory and imports use relative paths:

```dart
import '../fixtures/tracking_data_fixtures.dart';
```

### Issue: Tests timeout

**Solution:** Increase timeout for async operations:

```dart
test('async test', () async {
  // ...
}, timeout: const Timeout(Duration(seconds: 30)));
```

### Issue: Coverage not generated

**Solution:** Ensure you're running from the correct directory:

```bash
cd customer_app
flutter test --coverage
```

## Best Practices

1. **Run tests before committing**
   ```bash
   flutter test
   ```

2. **Check coverage regularly**
   ```bash
   flutter test --coverage
   lcov --summary coverage/lcov.info
   ```

3. **Keep tests fast**
   - Mock external dependencies
   - Avoid real network calls
   - Use small test data sets

4. **Write descriptive test names**
   ```dart
   test('should update rider location when receiving WebSocket event', () {
   ```

5. **Use setUp and tearDown**
   ```dart
   setUp(() {
     // Initialize
   });
   
   tearDown(() {
     // Clean up
   });
   ```

## Test Metrics

Current test suite metrics:

- **Total Tests:** 46
- **Test Files:** 2 main test files
- **Fixture Files:** 1
- **Mock Files:** 1
- **Total Test Code:** ~935 lines
- **Expected Execution Time:** < 5 seconds
- **Coverage Target:** 85%+

## Next Steps

1. Install test dependencies
2. Run tests to verify setup
3. Generate coverage report
4. Add more tests as needed
5. Set up CI/CD pipeline
6. Monitor coverage over time

---

**Last Updated:** November 15, 2025
**Status:** ✅ Ready for Use

