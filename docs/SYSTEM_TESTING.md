# System Testing Guide
## End-to-End (E2E) Testing Strategy

### Overview
This document outlines the approach for system-level testing of the FoodFlow application.

---

## Testing Framework Recommendation
For future E2E testing implementation, we recommend **Playwright** for its:
- Cross-browser support (Chrome, Firefox, Safari)
- Built-in waiting mechanisms
- Screenshot/video recording
- Mobile emulation

---

## Installation (Future Implementation)
```bash
cd client
npm install -D @playwright/test
npx playwright install
```

---

## Example System Test Scenarios

### Scenario 1: Complete Order Flow
```javascript
// tests/e2e/order-flow.spec.js
import { test, expect } from '@playwright/test';

test('complete order flow - from browse to confirmation', async ({ page }) => {
  // 1. Navigate to home
  await page.goto('http://localhost:5173');
  
  // 2. Click "View Restaurants"
  await page.click('text=View Restaurants');
  
  // 3. Select a restaurant
  await page.click('.restaurant-card').first();
  
  // 4. Add items to cart
  await page.click('button:has-text("Add to Cart")').first();
  await expect(page.locator('text=Added to Cart')).toBeVisible();
  
  // 5. Navigate to cart
  await page.click('a[href="/cart"]');
  
  // 6. Proceed to checkout
  await page.click('text=Proceed to Checkout');
  
  // 7. Fill delivery details
  await page.fill('input[name="street"]', '123 Test St');
  await page.fill('input[name="city"]', 'Test City');
  
  // 8. Place order
  await page.click('button:has-text("Place Order")');
  
  // 9. Verify success page
  await expect(page).toHaveURL(/.*order-success.*/);
  await expect(page.locator('text=Order Placed Successfully')).toBeVisible();
});
```

### Scenario 2: Authentication Flow
```javascript
test('user registration and login flow', async ({ page }) => {
  await page.goto('http://localhost:5173/login');
  
  // Register new user
  await page.click('text=Sign up for free');
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Sign Up")');
  
  // Verify redirect after registration
  await expect(page).toHaveURL(/.*restaurants.*/);
});
```

### Scenario 3: Owner Dashboard
```javascript
test('owner can manage menu items', async ({ page }) => {
  // Login as owner
  await page.goto('http://localhost:5173/login');
  await page.fill('input[name="email"]', 'owner@test.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button:has-text("Sign In")');
  
  // Navigate to menu management
  await page.click('text=Menu');
  
  // Add new item
  await page.click('text=Add New Item');
  await page.fill('input[name="name"]', 'Test Burger');
  await page.fill('input[name="price"]', '12.99');
  await page.click('button:has-text("Save")');
  
  // Verify item added
  await expect(page.locator('text=Test Burger')).toBeVisible();
});
```

---

## Running E2E Tests (When Implemented)
```bash
# Run all tests
npx playwright test

# Run in UI mode (interactive)
npx playwright test --ui

# Run specific test file
npx playwright test tests/e2e/order-flow.spec.js

# Generate HTML report
npx playwright show-report
```

---

## Test Data Requirements
- Seeded database with test restaurants and menu items
- Test user accounts for each role (customer, owner, staff)
- Mock payment gateway for checkout tests

---

## Current Status
**Status**: ⚠️ Framework outlined, not yet implemented

**Reason**: To avoid breaking the existing application, E2E tests are documented but not installed. Full implementation recommended during CI/CD setup phase.

**Next Steps**:
1. Install Playwright in client directory
2. Create `tests/e2e/` folder
3. Implement test scenarios above
4. Add to CI/CD pipeline
5. Set up test database seeding

---

## Manual Testing Alternative
Until automated E2E tests are implemented, refer to `UAT_PLAN.md` for comprehensive manual testing procedures.
