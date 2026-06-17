# User Acceptance Testing (UAT) Template: ShopEZ Stock Trading Platform

This document presents the testing parameters, test environments, detailed test scenarios, and bug tracking logs for the **ShopEZ Stock Trading Platform**.

---

## Project Overview
* **Project Name**: ShopEZ Stock Trading Platform
* **Project Description**: A full-stack MERN (MongoDB, Express, React, Node) application allowing users to view market tickers, observe simulated real-time price fluctuations, buy and sell mock equities with a virtual balance, track portfolio cost bases, and access administrative audits.
* **Project Version**: 1.0.0
* **Testing Period**: June 10, 2026 to June 17, 2026

---

## Testing Environment
* **Frontend Location**: Local Development URL `http://localhost:5173`
* **Backend API Location**: Local API URL `http://localhost:5000/api`
* **Pre-seeded Accounts (Credentials)**:
  * **Standard Trader (USER Role)**: `user@shopez.com` / `password123`
  * **Platform Administrator (ADMIN Role)**: `admin@shopez.com` / `password123`

---

## Test Cases

| Test Case ID | Test Scenario | Test Steps | Expected Result | Actual Result | Pass/Fail |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-001** | User Registration (Positive) | 1. Navigate to `/register`. <br>2. Fill in Name, unique email, password, and role "USER". <br>3. Click Register. | Account is created in MongoDB, password is encrypted with bcrypt, starting balance is set to $10,000, empty portfolio is created, and user is redirected to dashboard. | Account successfully created, empty portfolio instantiated, and redirected to `/`. | **Pass** |
| **TC-002** | User Registration (Negative) | 1. Navigate to `/register`. <br>2. Enter an email that is already registered. <br>3. Click Register. | Registration fails. Server returns a 400 error status, and React client displays the validation message "User already exists". | Validation error message displayed, registration blocked. | **Pass** |
| **TC-003** | User Authentication Login | 1. Navigate to `/login`. <br>2. Enter email `user@shopez.com` and password `password123`. <br>3. Click Sign In. | JWT token is returned from backend, stored in local storage, Axios headers default to `Bearer <token>`, and user is authenticated. | Token saved, AuthContext state updated, and user redirected to Dashboard. | **Pass** |
| **TC-004** | Live Price Fluctuation | 1. Open the Dashboard or Market page. <br>2. Observe listed stock prices for 10-15 seconds. | Stock prices change by -1.2% to +1.2% every 5 seconds, updating open, high, low, absolute change, and percentage stats in Mongoose. | Prices and change stats fluctuate dynamically in grid and charts. | **Pass** |
| **TC-005** | Buy Stock Order (Positive) | 1. Navigate to `/stocks/AAPL`. <br>2. Select "BUY" tab. <br>3. Enter quantity `10` and click BUY. | Virtual cash balance is deducted by cost (price * 10), AAPL holding is created/updated in portfolio with average cost basis, and a Transaction document is saved. | Cash balance deducted, holdings updated on UI in real-time, order successful. | **Pass** |
| **TC-006** | Buy Stock Order (Negative) | 1. Navigate to `/stocks/NVDA` (price ~$920). <br>2. Enter quantity `50` (estimated cost exceeds current balance). <br>3. Click BUY. | Order fails. Server rejects transaction and returns a 400 error status with message "Insufficient balance", which is shown in red on the UI. | Error message shown, transaction blocked. | **Pass** |
| **TC-007** | Sell Stock Order (Positive) | 1. Navigate to `/stocks/AAPL`. <br>2. Select "SELL" tab. <br>3. Enter quantity `5` (user owns 10 shares). <br>4. Click SELL. | Revenue is added to virtual balance, AAPL holding quantity decreases to 5, and a SELL Transaction record is logged. | Cash balance credited, owned shares updated, order successful. | **Pass** |
| **TC-008** | Sell Stock Order (Negative) | 1. Navigate to `/stocks/AAPL`. <br>2. Select "SELL" tab. <br>3. Enter quantity `12` (user only owns 5 shares). <br>4. Click SELL. | Transaction is rejected. Server returns a 400 error status with message "Insufficient shares", and the transaction is blocked. | Error alert displayed, transaction rejected. | **Pass** |
| **TC-009** | Admin Stock Listing Management | 1. Log in as `admin@shopez.com`. <br>2. Go to Admin Panel → Manage Stocks. <br>3. Click List New Stock, enter `TSLA`, company name, price, and click Publish. | New stock ticker is added to MongoDB and starts fluctuating; immediately visible on Trader dashboard. | Stock successfully listed and visible across the app. | **Pass** |
| **TC-010** | Admin Global Audit Trails | 1. Log in as `admin@shopez.com`. <br>2. Go to Admin Panel → Users Database. <br>3. Go to Admin Panel → Audit Logs. | Admin can view the names, emails, roles, balances, and asset valuations of all users, and trace all BUY/SELL trade actions. | Database listing and global transaction logs successfully rendered. | **Pass** |

---

## Bug Tracking Log

| Bug ID | Bug Description | Steps to Reproduce | Severity | Status | Additional Feedback / Resolution |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **BG-001** | Missing buy/sell input validation (zero/negative numbers). | 1. Go to stock detail page. <br>2. Input `-5` in quantity. <br>3. Click BUY. | **High** | **Closed** | Added client-side html `min="0.0001"` attribute and server-side validation to reject quantities <= 0. |
| **BG-002** | Route protection failure when accessing portfolio directly. | 1. Log out. <br>2. Directly type `http://localhost:5173/portfolio` in browser. | **High** | **Closed** | Implemented `ProtectedRoute.jsx` client router guard to redirect unauthenticated requests to `/login`. |
| **BG-003** | Navbar dropdown rendering in dark colors. | 1. Log in. <br>2. Click profile dropdown. | **Low** | **Closed** | Removed `dropdown-menu-dark` class from profile dropdown and added custom light-theme borders. |

---

## Sign-off
* **Tester Name**: Srinithya
* **Date**: 17 June 2026
* **Notes**: All core trading flows, real-time updates, role guards, and light-theme visual configurations have passed testing successfully.
