# User Acceptance Testing (UAT) Plan
## FoodFlow Restaurant Ordering System

### Overview
This document outlines the User Acceptance Testing strategy to validate that the FoodFlow system meets business requirements and user expectations.

---

## Test Environment
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5001
- **Database**: MongoDB (local instance)
- **Test Accounts**:
  - Customer: `customer@test.com` / `password123`
  - Owner: `owner@test.com` / `password123`
  - Staff: `staff@test.com` / `password123`

---

## UAT Test Cases

### 1. User Registration & Authentication
**Objective**: Verify users can register, login, and access role-based features.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-001 | New customer registration | 1. Navigate to /login<br>2. Click "Sign up for free"<br>3. Enter valid details<br>4. Submit form | User registered, redirected to /restaurants | ✅ Pass |
| UAT-002 | Login with valid credentials | 1. Enter email/password<br>2. Click "Sign In" | User logged in, redirected based on role | ✅ Pass |
| UAT-003 | Login with invalid credentials | 1. Enter wrong password<br>2. Submit | Error message displayed | ✅ Pass |

---

### 2. Restaurant Browsing & Search
**Objective**: Verify users can browse and search restaurants effectively.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-004 | View all restaurants | 1. Navigate to /restaurants | List of restaurants displayed with images, ratings | ✅ Pass |
| UAT-005 | Search restaurants | 1. Enter search query<br>2. View results | Filtered results match search | ✅ Pass |
| UAT-006 | Filter by cuisine | 1. Select cuisine filter<br>2. Apply | Only restaurants with selected cuisine shown | ✅ Pass |
| UAT-007 | Add/remove favorites | 1. Click heart icon<br>2. Navigate to /favorites | Restaurant added to favorites list | ✅ Pass |

---

### 3. Menu Viewing & Ordering
**Objective**: Verify menu display and cart functionality.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-008 | View restaurant menu | 1. Click on restaurant card<br>2. View menu page | Menu items displayed with images, prices, descriptions | ✅ Pass |
| UAT-009 | Add items to cart | 1. Click "Add to Cart" on menu item | Item added, confirmation modal shown | ✅ Pass |
| UAT-010 | Update cart quantities | 1. Go to /cart<br>2. Change quantity | Cart total updates correctly | ✅ Pass |
| UAT-011 | Remove from cart | 1. Click remove button | Item removed, total recalculated | ✅ Pass |

---

### 4. Checkout & Order Placement
**Objective**: Verify the complete order flow from cart to confirmation.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-012 | Complete checkout | 1. Proceed to checkout<br>2. Enter delivery address<br>3. Select payment method<br>4. Place order | Order placed, redirected to success page | ✅ Pass |
| UAT-013 | View order history | 1. Navigate to /orders | List of past orders with status | ✅ Pass |
| UAT-014 | Cancel pending order | 1. Find pending order<br>2. Click cancel | Order status updated to "cancelled" | ✅ Pass |

---

### 5. Reviews & Ratings
**Objective**: Verify users can leave reviews for delivered orders.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-015 | Leave review | 1. Go to /orders<br>2. Click "Leave Review" on delivered order<br>3. Submit rating and comment | Review saved, displayed on restaurant page | ✅ Pass |
| UAT-016 | View restaurant reviews | 1. Open restaurant menu<br>2. Scroll to reviews section | All reviews displayed with ratings | ✅ Pass |

---

### 6. Owner Dashboard
**Objective**: Verify restaurant owners can manage their business.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-017 | View analytics | 1. Login as owner<br>2. View dashboard | Revenue chart, metrics displayed | ✅ Pass |
| UAT-018 | Add menu item | 1. Go to Menu tab<br>2. Click "Add New Item"<br>3. Fill form and submit | Item added to menu | ✅ Pass |
| UAT-019 | Edit menu item | 1. Click edit icon<br>2. Modify details<br>3. Save | Item updated successfully | ✅ Pass |
| UAT-020 | Toggle item availability | 1. Click availability toggle | Item marked as unavailable/available | ✅ Pass |

---

### 7. Real-Time Features
**Objective**: Verify WebSocket real-time updates work.

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-021 | Order status updates | 1. Owner updates order status<br>2. Customer views /orders page | Status updates without page refresh | ✅ Pass |

---

### 8. Mobile Responsiveness
**Objective**: Verify the app works on mobile devices (375px viewport).

| Test ID | Scenario | Steps | Expected Result | Status |
|---------|----------|-------|----------------|--------|
| UAT-022 | Mobile - Home page | 1. Resize to 375px<br>2. Navigate to / | Buttons stack vertically, readable text | ✅ Pass |
| UAT-023 | Mobile - Menu page | 1. Resize to 375px<br>2. View menu | Single column grid, sticky nav works | ✅ Pass |
| UAT-024 | Mobile - Auth pages | 1. Resize to 375px<br>2. View login | Image on top, form below | ✅ Pass |

---

## UAT Sign-Off

### Test Summary
- **Total Test Cases**: 24
- **Passed**: 24
- **Failed**: 0
- **Blocked**: 0
- **Success Rate**: 100%

### Stakeholder Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Product Owner | _______________ | _______________ | _________ |
| Business Analyst | _______________ | _______________ | _________ |
| QA Lead | _______________ | _______________ | _________ |
| Development Lead | _______________ | _______________ | _________ |

### Notes
All critical user journeys have been tested and validated. The system is ready for production deployment.
