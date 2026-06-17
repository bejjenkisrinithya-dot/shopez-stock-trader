# Project Planning Backlog: ShopEZ Stock Trading Platform

This document outlines the Product Backlog, Sprint Schedule, Estimation, and Velocity metrics for the MERN-based **ShopEZ Stock Trading Platform**.

---

## Project Parameters
* **Project Name**: ShopEZ Stock Trading Platform
* **Date**: 17 June 2026
* **Team ID**: MERN-Group-04
* **Sprints**: 4 Sprints (6 working days per sprint)
* **Starting Velocity**: 9.0 Story Points per sprint (Daily Output Rate of 1.5 SP/day)

---

## Product Backlog, Sprint Schedule, and Estimation

Use the table below to track user stories, priorities, estimations, and sprint assignments:

| Sprint | Functional Requirement (Epic) | User Story Number | User Story / Task | Story Points | Priority | Assigned Developer |
| :--- | :--- | :--- | :--- | :---: | :--- | :--- |
| **Sprint-1** | User Authentication & Profiles | **USN-1** | As a user, I can register for an account by entering my name, email, password, and confirming password, automatically receiving a starting virtual balance of $10,000. | 3 | High | Dev-01 |
| **Sprint-1** | User Authentication & Profiles | **USN-2** | As a registered user, I can log in securely using my email and password to receive a JWT session token and access the trading dashboard. | 3 | High | Dev-02 |
| **Sprint-1** | User Authentication & Profiles | **USN-3** | As an authenticated user, I can view my current account profile and live virtual balance in the navbar. | 2 | Medium | Dev-02 |
| **Sprint-2** | Market Dashboard & Stock Browsing | **USN-4** | As a user, I can view a live dashboard showing stock listings, market updates, and featured tickers with Outfit/Inter typography and soft pastel UI. | 3 | High | Dev-01 |
| **Sprint-2** | Market Dashboard & Stock Browsing | **USN-5** | As a user, I can search for active listings by ticker symbol or company name to quickly locate specific stocks. | 2 | Medium | Dev-02 |
| **Sprint-2** | Market Dashboard & Stock Browsing | **USN-6** | As a developer, I can implement a background price simulator that fluctuates listed stock prices by -1.2% to +1.2% every 5 seconds. | 5 | High | Dev-01 |
| **Sprint-3** | Simulated Trading Flow | **USN-7** | As a trader, I can view detailed stock charts (30-day historical performance) and execute buy orders that validate my virtual cash balance before deducting funds. | 5 | High | Dev-01 |
| **Sprint-3** | Simulated Trading Flow | **USN-8** | As a trader, I can execute sell orders that validate my owned stock quantity before crediting my balance. | 4 | High | Dev-02 |
| **Sprint-3** | Simulated Trading Flow | **USN-9** | As a trader, I can view my transactional history logs showing timestamps, buy/sell flags, execution prices, and share volumes. | 2 | Medium | Dev-02 |
| **Sprint-4** | Portfolio Tracking | **USN-10** | As a trader, I can view my holdings aggregated on a portfolio screen displaying cost basis, current market value, and overall profit/loss with soft-red or mint-green indicators. | 3 | High | Dev-01 |
| **Sprint-4** | Administration & Moderation | **USN-11** | As an administrator, I can view a dashboard showing all registered users, manage active stock tickers (create, edit, delete), and inspect the global audit trail. | 4 | High | Dev-02 |
| **Sprint-4** | Dynamic Updates & Alerts | **USN-12** | As a user, I can see real-time updates and success/error status alerts in the viewport when trades occur or prices fluctuate. | 2 | Low | Dev-01 |

---

## Project Tracker, Velocity & Burndown Chart

### Velocity Calculations
* **Total Story Points (SP)**: 38 Story Points completed.
* **Sprint Duration**: 6 working days per sprint.
* **Total Project Duration**: 24 working days (4 Sprints).
* **Average Velocity**: 9.5 Story Points per sprint iteration.
* **Daily Output Rate**: 1.58 Story Points per day.

\[
\text{Daily Output Rate} = \frac{\text{Velocity}}{\text{Sprint Duration}} = \frac{9.5\text{ SP}}{6\text{ Days}} \approx 1.58\text{ SP/Day}
\]

### Burndown Chart Metrics

The burndown chart tracks remaining story points across the 24-day project timeline:
* **Day 0**: 38 SP remaining
* **Day 6 (End of Sprint 1)**: 30 SP remaining (USN-1, USN-2, USN-3 completed)
* **Day 12 (End of Sprint 2)**: 20 SP remaining (USN-4, USN-5, USN-6 completed)
* **Day 18 (End of Sprint 3)**: 9 SP remaining (USN-7, USN-8, USN-9 completed)
* **Day 24 (End of Sprint 4)**: 0 SP remaining (USN-10, USN-11, USN-12 completed)
