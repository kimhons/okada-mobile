# Dashboard Issues Found

## Issue 1: Translation Keys Showing Instead of Translated Text
- Status badges showing "orders.status_delivered" instead of "Delivered"
- Status badges showing "orders.status_in_transit" instead of "In Transit"
- Status badges showing "orders.status_quality_verification" instead of "Quality Verification"
- Status badges showing "orders.status_confirmed" instead of "Confirmed"

## Issue 2: tRPC Error - dashboard.recentOrders Not Found
- Error: "No procedure found on path 'dashboard.recentOrders'"
- The Home.tsx uses static mock data, not tRPC calls
- Some other component must be calling this procedure

## Investigation
- Home.tsx uses static recentOrders array (mock data)
- The getStatusLabel function uses t(`orders.status_${status}`) which requires translation keys
- Need to check if translations are loaded properly
