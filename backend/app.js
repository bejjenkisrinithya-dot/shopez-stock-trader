const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');

// Load environment variables
dotenv.config();

const app = express();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez-stock-trader';

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for dev/testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Custom request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    console.log('Ensure MongoDB is installed and running locally.');
  });

// Load Routers
const authRouter = require('./routes/auth');
const stocksRouter = require('./routes/stocks');
const transactionsRouter = require('./routes/transactions');
const portfolioRouter = require('./routes/portfolio');
const adminRouter = require('./routes/admin');

// Map Route handlers
app.use('/api/auth', authRouter);
app.use('/api/stocks', stocksRouter);
app.use('/api/transactions', transactionsRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/admin', adminRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Background stock price simulator task
const simulatePrices = async () => {
  try {
    const stocks = await Stock.find();
    if (stocks.length === 0) return;

    const todayStr = new Date().toISOString().split('T')[0];

    for (const stock of stocks) {
      const oldPrice = stock.currentPrice;
      
      // Random walk change: -1.2% to +1.2%
      const changePercent = (Math.random() * 2.4 - 1.2) / 100;
      const priceChange = oldPrice * changePercent;
      const newPrice = Math.round((oldPrice + priceChange) * 100) / 100;

      if (newPrice <= 0) continue;

      const openPrice = stock.dailyStats.open || oldPrice;
      const currentHigh = stock.dailyStats.high || oldPrice;
      const currentLow = stock.dailyStats.low || oldPrice;

      stock.currentPrice = newPrice;
      stock.dailyStats.high = Math.max(currentHigh, newPrice);
      stock.dailyStats.low = Math.min(currentLow, newPrice);
      stock.dailyStats.change = Math.round((newPrice - openPrice) * 100) / 100;
      stock.dailyStats.changePercent = Math.round(((newPrice - openPrice) / openPrice) * 100 * 100) / 100;

      const histIndex = stock.historicalData.findIndex(h => h.date === todayStr);
      if (histIndex >= 0) {
        stock.historicalData[histIndex].price = newPrice;
      } else {
        if (stock.historicalData.length >= 40) {
          stock.historicalData.shift();
        }
        stock.historicalData.push({ date: todayStr, price: newPrice });
      }

      await stock.save();
    }
  } catch (error) {
    console.error('Price Simulator iteration failed:', error.message);
  }
};

// Start background task
console.log('Starting price simulator background worker...');
setInterval(simulatePrices, 5000);

module.exports = app;
