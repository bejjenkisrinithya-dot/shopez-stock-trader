const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const Stock = require('./models/Stock');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez-stock-trader';

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development and testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request logger middleware
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

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/stocks', require('./routes/stocks'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/portfolio', require('./routes/portfolio'));
app.use('/api/admin', require('./routes/admin'));

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});

// Stock Price Fluctuation Simulator
const runStockSimulator = () => {
  console.log('Stock Simulator initialized. Fluctuation task starting every 5 seconds...');
  
  setInterval(async () => {
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

        if (newPrice <= 0) continue; // prevent negative stock prices

        // Update stats
        const openPrice = stock.dailyStats.open || oldPrice;
        const currentHigh = stock.dailyStats.high || oldPrice;
        const currentLow = stock.dailyStats.low || oldPrice;

        stock.currentPrice = newPrice;
        stock.dailyStats.high = Math.max(currentHigh, newPrice);
        stock.dailyStats.low = Math.min(currentLow, newPrice);
        stock.dailyStats.change = Math.round((newPrice - openPrice) * 100) / 100;
        stock.dailyStats.changePercent = Math.round(((newPrice - openPrice) / openPrice) * 100 * 100) / 100;

        // Manage historical price entries
        // Update the last element if it's for today, otherwise push a new one.
        const histIndex = stock.historicalData.findIndex(h => h.date === todayStr);
        if (histIndex >= 0) {
          stock.historicalData[histIndex].price = newPrice;
        } else {
          // If today is a new day, keep history under 40 days to save memory
          if (stock.historicalData.length >= 40) {
            stock.historicalData.shift();
          }
          stock.historicalData.push({ date: todayStr, price: newPrice });
        }

        await stock.save();
      }
    } catch (error) {
      console.error('Simulator iteration failed:', error.message);
    }
  }, 5000);
};

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start the background simulation task
  runStockSimulator();
});
