# TODO - Paystack checkout reliability

- [x] Add auth guard to admin/orders/page.tsx using useAuth() and isAdmin (page-level guard added)
- [x] Verify Firestore rules for order creation (request.auth != null already in place)
- [x] Implement Paystack webhook with API verification before saving orders
- [x] Integrate price finalization API into checkout flow for server-side validation

## Changes Made

1. **src/app/admin/orders/page.tsx**: Added explicit auth guard using `useAuth()` and `isAdmin` check at page level
2. **src/app/api/webhook/paystack/route.ts**: Added `verifyPaymentWithPaystack()` function that calls Paystack API to verify transaction status before creating orders
3. **src/app/checkout/page.tsx**: Integrated price finalization API call for cart checkout; webhooks now handle order creation after payment verification

