# ShopEZ Stock Trader

A full-stack MERN stock trading platform that allows users to explore stocks, view market trends, execute simulated trades, and manage their investment portfolios in real time. It comes built with a real-time stock price fluctuation simulator and comprehensive administrative moderation tools.

## Key Features

- **JWT-Based Authentication**: Seamless and secure sign-up, sign-in, and route shielding.
- **Interactive Line Charts**: Renders historical 30-day performance trends for listed companies using Chart.js.
- **Simulated Trading**: Place mock BUY and SELL orders with live budget checks, average cost basis recalibration, and atomic transaction logs.
- **Real-Time Price Simulator**: A background task automatically fluctuates stock prices by `-1.2%` to `+1.2%` every 5 seconds, updating statistics (high, low, absolute change, percentage change) and appending price actions to historical records.
- **Admin Dashboard**: Reserved for administrators to manage stock profiles (publish new tickers, edit prices/info, delete listings), inspect user account assets, and audit global transaction logs.
- **Premium UI/UX Design**: Sleek custom dark-mode aesthetics utilizing glassmorphism cards, vibrant indicators, Outfit/Inter typography, and responsive Bootstrap layouts.

---

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, bcryptjs, cors, dotenv, axios
- **Frontend**: React.js (Vite), react-router-dom, axios, chart.js & react-chartjs-2, bootstrap & bootstrap-icons

---

## Project Structure

```text
shopez-stock-trader/
├── package.json              # Orchestrates installation and running concurrently
├── README.md                 # Setup and user guide (this file)
├── backend/
│   ├── models/               # Mongoose database schemas (User, Stock, Transaction, Portfolio)
│   ├── middleware/           # Auth validator and role-based checkpoint
│   ├── routes/               # API endpoints (Auth, Stocks, Transactions, Portfolio, Admin)
│   ├── scripts/              # DB seeder (seed.js)
│   ├── server.js             # Main server logic and stock simulator worker
│   └── .env                  # Backend configuration (PORT, MONGO_URI, JWT_SECRET)
└── frontend/
    ├── src/
    │   ├── components/       # Reusable components (Navbar, ProtectedRoute)
    │   ├── context/          # State providers (AuthContext)
    │   ├── pages/            # View pages (Dashboard, Market, StockDetail, Portfolio, AdminDashboard, Login, Register)
    │   ├── App.jsx           # Client-side router configuration
    │   ├── main.jsx          # Vite React entrypoint
    │   └── index.css         # Custom high-end glassmorphic CSS styling
    ├── .env                  # Frontend configuration (VITE_API_URL)
    └── package.json          # Frontend packages
```

---

## Installation & Setup

### Prerequisites
1. **Node.js**: Ensure Node.js (v18+) is installed on your computer.
2. **MongoDB**: Ensure MongoDB Community Server is installed and running locally on standard port `27017` (URI: `mongodb://127.0.0.1:27017/shopez-stock-trader`).

### Quick Start (Automatic Setup)

1. Open a terminal in the project root folder (`shopez-stock-trader`).
2. Install dependencies for the root, backend, and frontend directories:
   ```bash
   npm run install-all
   ```
3. Seed sample stocks and demo credentials into the database:
   ```bash
   npm run seed
   ```
4. Start both the Node.js backend server (running on port `5000`) and the Vite React development server (running on port `5173`) concurrently:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to: `http://localhost:5173`

---

## Demo Credentials

You can log in immediately using the pre-seeded profiles below or create your own accounts during registration:

### 1. Standard Trader (USER Role)
- **Email**: `user@shopez.com`
- **Password**: `password123`
- *Features: View Dashboard, browse Market list, trade stocks, manage Portfolio assets.*

### 2. Platform Administrator (ADMIN Role)
- **Email**: `admin@shopez.com`
- **Password**: `password123`
- *Features: Perform user-level activities, access the Admin Panel, add/edit/delete listings, review all users' balances, and trace global system transactions.*
