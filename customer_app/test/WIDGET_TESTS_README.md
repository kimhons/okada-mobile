# Widget Tests - Order Tracking Screen

## Overview

This directory contains comprehensive widget tests for the Order Tracking screen UI components. Widget tests verify that UI components render correctly, respond to user interactions, and display the correct information based on state.

## Test Files

### Widget Test Files

| File | Tests | Purpose |
|:-----|------:|:--------|
| `screens/order_tracking_screen_test.dart` | 18 | Main screen UI, layout, states |
| `widgets/order_tracking_map_test.dart` | 16 | Google Maps, real-time location |
| `widgets/delay_warning_banner_test.dart` | 20 | Delayed delivery state |
| `widgets/rider_info_card_test.dart` | 10 | Rider info and timeline |
| `helpers/widget_test_helpers.dart` | - | Test utilities and helpers |

**Total Widget Tests:** 64 tests

## Running Widget Tests

### Run All Widget Tests

```bash
cd customer_app
flutter test test/widgets/
flutter test test/screens/
```

### Run Specific Widget Test

```bash
# Map component tests
flutter test test/widgets/order_tracking_map_test.dart

# Delay banner tests
flutter test test/widgets/delay_warning_banner_test.dart

# Screen tests
flutter test test/screens/order_tracking_screen_test.dart
```

### Run with Verbose Output

```bash
flutter test --verbose test/widgets/
```

### Generate Coverage

```bash
flutter test --coverage test/widgets/
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

## Test Structure

### Using Test Helpers

```dart
import '../helpers/widget_test_helpers.dart';

testWidgets('should display widget', (tester) async {
  // Arrange
  final state = WidgetTestHelpers.createMockState(
    trackingData: TrackingDataFixtures.inTransitTrackingData,
  );

  // Act
  await tester.pumpWidget(
    WidgetTestHelpers.createTestableWidget(
      child: MyWidget(),
      overrides: [
        WidgetTestHelpers.createOrderTrackingOverride(
          orderId: 'ORD-123',
          state: state,
        ),
      ],
    ),
  );

  // Assert
  expect(find.text('Expected Text'), findsOneWidget);
});
```

## Test Categories

### 1. Screen Tests (18 tests)

Tests for the main OrderTrackingScreen:
- App bar and title
- Loading/error/empty states
- Bottom sheet layout
- Component integration
- User interactions

### 2. Map Component Tests (16 tests)

Tests for OrderTrackingMap widget:
- Google Maps rendering
- Real-time location updates
- Map controls (center, fit all)
- ETA indicators
- Marker display
- Route polyline

### 3. Delay State Tests (20 tests)

Tests for DelayWarningBanner widget:
- Banner display logic
- Delay information display
- Different delay reasons
- User actions (contact rider)
- Edge cases (missing data)

### 4. Component Tests (10 tests)

Tests for RiderInfoCard and OrderStatusTimeline:
- Rider information display
- Contact functionality
- Status timeline steps
- Visual elements

## Test Helpers

### WidgetTestHelpers

**Core Methods:**

```dart
// Create testable widget with providers
WidgetTestHelpers.createTestableWidget(
  child: widget,
  overrides: [/* providers */],
);

// Create provider override
WidgetTestHelpers.createOrderTrackingOverride(
  orderId: 'ORD-123',
  state: mockState,
);

// Create mock state
WidgetTestHelpers.createMockState(
  isLoading: false,
  trackingData: data,
  error: null,
);

// Finder helpers
WidgetTestHelpers.findByKey('key');
WidgetTestHelpers.findByText('text');
WidgetTestHelpers.findByIcon(Icons.icon);

// Interaction helpers
await WidgetTestHelpers.tapAndSettle(tester, finder);
await WidgetTestHelpers.scroll(tester, finder);

// Assertion helpers
WidgetTestHelpers.expectVisible(finder);
WidgetTestHelpers.expectNotVisible(finder);
```

### WidgetTester Extensions

```dart
// Find widget by type
tester.findWidgetByType<MyWidget>();

// Text assertions
tester.expectText('Expected');
tester.expectNoText('Not Expected');

// Icon assertions
tester.expectIcon(Icons.check);

// Interaction shortcuts
await tester.tapText('Button');
await tester.tapIcon(Icons.close);
await tester.enterTextInField(finder, 'text');
```

## Common Test Patterns

### Testing Widget Display

```dart
testWidgets('should display component', (tester) async {
  // Arrange
  await tester.pumpWidget(
    WidgetTestHelpers.createTestableWidget(
      child: MyWidget(data: testData),
    ),
  );

  // Assert
  expect(find.text('Expected Text'), findsOneWidget);
  expect(find.byIcon(Icons.check), findsOneWidget);
});
```

### Testing User Interactions

```dart
testWidgets('should handle button tap', (tester) async {
  // Arrange
  bool tapped = false;

  await tester.pumpWidget(
    WidgetTestHelpers.createTestableWidget(
      child: MyWidget(onTap: () => tapped = true),
    ),
  );

  // Act
  await tester.tap(find.text('Button'));
  await tester.pumpAndSettle();

  // Assert
  expect(tapped, true);
});
```

### Testing State Changes

```dart
testWidgets('should update when state changes', (tester) async {
  // Arrange - initial state
  await tester.pumpWidget(
    WidgetTestHelpers.createTestableWidget(
      child: MyWidget(data: initialData),
    ),
  );

  expect(find.text('Initial'), findsOneWidget);

  // Act - update state
  await tester.pumpWidget(
    WidgetTestHelpers.createTestableWidget(
      child: MyWidget(data: updatedData),
    ),
  );

  await tester.pumpAndSettle();

  // Assert
  expect(find.text('Updated'), findsOneWidget);
});
```

### Testing with Mock Providers

```dart
testWidgets('should use provider data', (tester) async {
  // Arrange
  final mockState = WidgetTestHelpers.createMockState(
    trackingData: TrackingDataFixtures.inTransitTrackingData,
  );

  // Act
  await tester.pumpWidget(
    WidgetTestHelpers.createTestableWidget(
      child: OrderTrackingScreen(orderId: 'ORD-123'),
      overrides: [
        WidgetTestHelpers.createOrderTrackingOverride(
          orderId: 'ORD-123',
          state: mockState,
        ),
      ],
    ),
  );

  // Assert
  expect(find.text('Daniel Okoro'), findsOneWidget);
});
```

## Best Practices

### 1. Use Descriptive Test Names

✅ Good:
```dart
testWidgets('should display delay warning banner for delayed orders', (tester) async {
```

❌ Bad:
```dart
testWidgets('delay test', (tester) async {
```

### 2. Follow AAA Pattern

```dart
testWidgets('test description', (tester) async {
  // Arrange - set up test data
  final data = TestData();
  
  // Act - perform action
  await tester.pumpWidget(widget);
  await tester.tap(button);
  
  // Assert - verify result
  expect(result, expected);
});
```

### 3. Use Test Helpers

```dart
// Use helpers for common operations
await WidgetTestHelpers.tapAndSettle(tester, finder);
WidgetTestHelpers.expectVisible(finder);
```

### 4. Test One Thing Per Test

✅ Good:
```dart
testWidgets('should display title', ...);
testWidgets('should display subtitle', ...);
```

❌ Bad:
```dart
testWidgets('should display title and subtitle and button', ...);
```

### 5. Clean Up After Tests

```dart
testWidgets('test', (tester) async {
  // Test code
  
  // Cleanup happens automatically
  // But dispose controllers if needed
});
```

## Troubleshooting

### Issue: Widget not found

**Solution:** Ensure widget is pumped and settled:
```dart
await tester.pumpWidget(widget);
await tester.pumpAndSettle();
```

### Issue: Provider not available

**Solution:** Wrap with ProviderScope:
```dart
WidgetTestHelpers.createTestableWidget(
  child: widget,
  overrides: [/* providers */],
);
```

### Issue: Async operations timeout

**Solution:** Increase pump duration:
```dart
await tester.pumpAndSettle(const Duration(seconds: 5));
```

### Issue: Multiple widgets found

**Solution:** Use more specific finder:
```dart
// Instead of
find.text('Button')

// Use
find.ancestor(
  of: find.text('Button'),
  matching: find.byType(ElevatedButton),
)
```

## Test Metrics

**Widget Tests:**
- Total Tests: 64
- Test Files: 4
- Helper Files: 1
- Total Lines: 1,528
- Execution Time: < 10 seconds

**Combined with Unit Tests:**
- Total Tests: 110 (46 unit + 64 widget)
- Total Lines: 2,765
- Total Files: 11

## Next Steps

1. ✅ Run all widget tests
2. ✅ Verify all tests pass
3. ⏳ Generate coverage report
4. ⏳ Add golden tests
5. ⏳ Add integration tests
6. ⏳ Test on different screen sizes

## Resources

- [Flutter Widget Testing](https://docs.flutter.dev/cookbook/testing/widget/introduction)
- [Flutter Test Package](https://api.flutter.dev/flutter/flutter_test/flutter_test-library.html)
- [Riverpod Testing](https://riverpod.dev/docs/cookbooks/testing)

---

**Status:** ✅ Complete and Ready for Use
**Last Updated:** November 15, 2025

