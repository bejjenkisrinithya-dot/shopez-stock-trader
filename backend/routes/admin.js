const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { auth, admin } = require('../middleware/auth');

// Protect all admin routes
router.use(auth, admin);

// Helper to generate mock historical data for new stocks
const generateHistoricalData = (startPrice, days = 30) => {
  const history = [];
  let current = startPrice;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Random fluctuation of -2% to +2%
    const changePercent = (Math.random() * 4 - 2) / 100;
    current = current * (1 + changePercent);
    history.push({ date: dateStr, price: Math.round(current * 100) / 100 });
  }
  return history;
};

// @route   POST api/admin/stocks
// @desc    Add a new stock listing
// @access  Admin only
router.post('/stocks', async (req, res) => {
  try {
    const { symbol, name, currentPrice, open, high, low } = req.body;

    if (!symbol || !name || !currentPrice) {
      return res.status(400).json({ message: 'Symbol, name, and currentPrice are required' });
    }

    const uppercaseSymbol = symbol.toUpperCase();

    // Check if stock symbol already exists
    const stockExists = await Stock.findOne({ symbol: uppercaseSymbol });
    if (stockExists) {
      return res.status(400).json({ message: `Stock with symbol ${uppercaseSymbol} already exists` });
    }

    const priceNum = parseFloat(currentPrice);
    const openPrice = parseFloat(open) || priceNum;
    const highPrice = parseFloat(high) || Math.max(priceNum, openPrice) * 1.02;
    const lowPrice = parseFloat(low) || Math.min(priceNum, openPrice) * 0.98;
    const change = priceNum - openPrice;
    const changePercent = (change / openPrice) * 100;

    const historicalData = generateHistoricalData(priceNum, 30);

    const newStock = new Stock({
      symbol: uppercaseSymbol,
      name,
      currentPrice: priceNum,
      dailyStats: {
        open: openPrice,
        high: highPrice,
        low: lowPrice,
        change,
        changePercent
      },
      historicalData
    });

    await newStock.save();
    res.status(201).json(newStock);
  } catch (error) {
    console.error('Admin create stock error:', error);
    res.status(500).json({ message: 'Server error creating stock listing' });
  }
});

// @route   PUT api/admin/stocks/:id
// @desc    Modify an existing stock listing
// @access  Admin only
router.put('/stocks/:id', async (req, res) => {
  try {
    const { name, currentPrice, open, high, low } = req.body;

    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock listing not found' });
    }

    if (name) stock.name = name;
    if (currentPrice !== undefined) {
      const priceNum = parseFloat(currentPrice);
      const openPrice = open !== undefined ? parseFloat(open) : stock.dailyStats.open;
      
      stock.currentPrice = priceNum;
      stock.dailyStats.open = openPrice;
      stock.dailyStats.high = high !== undefined ? parseFloat(high) : Math.max(priceNum, openPrice, stock.dailyStats.high);
      stock.dailyStats.low = low !== undefined ? parseFloat(low) : Math.min(priceNum, openPrice, stock.dailyStats.low);
      
      stock.dailyStats.change = priceNum - openPrice;
      stock.dailyStats.changePercent = (stock.dailyStats.change / openPrice) * 100;

      // Update today's entry in historical data, or add it
      const todayStr = new Date().toISOString().split('T')[0];
      const todayIndex = stock.historicalData.findIndex(h => h.date === todayStr);
      if (todayIndex >= 0) {
        stock.historicalData[todayIndex].price = priceNum;
      } else {
        stock.historicalData.push({ date: todayStr, price: priceNum });
      }
    }

    await stock.save();
    res.json(stock);
  } catch (error) {
    console.error('Admin modify stock error:', error);
    res.status(500).json({ message: 'Server error modifying stock listing' });
  }
});

// @route   DELETE api/admin/stocks/:id
// @desc    Delete a stock listing
// @access  Admin only
router.delete('/stocks/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) {
      return res.status(404).json({ message: 'Stock listing not found' });
    }
    res.json({ message: `Successfully deleted stock listing: ${stock.symbol}` });
  } catch (error) {
    console.error('Admin delete stock error:', error);
    res.status(500).json({ message: 'Server error deleting stock listing' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users (with portfolio balances)
// @access  Admin only
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    const enrichedUsers = [];

    for (const user of users) {
      const portfolio = await Portfolio.findOne({ user: user._id });
      let totalHoldingsValue = 0;

      if (portfolio) {
        for (const holding of portfolio.holdings) {
          const stock = await Stock.findOne({ symbol: holding.symbol });
          const price = stock ? stock.currentPrice : holding.avgBuyPrice;
          totalHoldingsValue += holding.quantity * price;
        }
      }

      enrichedUsers.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        virtualBalance: user.virtualBalance,
        totalHoldingsValue,
        totalPortfolioValue: user.virtualBalance + totalHoldingsValue,
        createdAt: user.createdAt
      });
    }

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Admin fetch users error:', error);
    res.status(500).json({ message: 'Server error fetching user database' });
  }
});

// @route   GET api/admin/transactions
// @desc    Get all transactions across the entire system
// @access  Admin only
router.get('/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error('Admin fetch transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transaction history logs' });
  }
});

module.exports = router;
