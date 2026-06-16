const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Stock = require('../models/Stock');
const Transaction = require('../models/Transaction');
const Portfolio = require('../models/Portfolio');
const { auth } = require('../middleware/auth');

// @route   POST api/transactions/buy
// @desc    Buy shares of a stock
// @access  Private
router.post('/buy', auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = parseFloat(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: 'Invalid symbol or quantity' });
    }

    // Find stock
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    const price = stock.currentPrice;
    const totalCost = price * qty;

    // Check user balance
    const user = await User.findById(req.user.id);
    if (user.virtualBalance < totalCost) {
      return res.status(400).json({ 
        message: `Insufficient balance. Required: $${totalCost.toFixed(2)}, Available: $${user.virtualBalance.toFixed(2)}` 
      });
    }

    // Find or create Portfolio
    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id, holdings: [] });
    }

    // Update holdings
    const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === stock.symbol);
    
    if (holdingIndex >= 0) {
      const existingHolding = portfolio.holdings[holdingIndex];
      const newQty = existingHolding.quantity + qty;
      const newAvgBuyPrice = ((existingHolding.avgBuyPrice * existingHolding.quantity) + (price * qty)) / newQty;
      
      portfolio.holdings[holdingIndex].quantity = newQty;
      portfolio.holdings[holdingIndex].avgBuyPrice = newAvgBuyPrice;
    } else {
      portfolio.holdings.push({
        symbol: stock.symbol,
        quantity: qty,
        avgBuyPrice: price
      });
    }

    // Deduct user balance
    user.virtualBalance -= totalCost;

    // Save transaction
    const transaction = new Transaction({
      user: req.user.id,
      symbol: stock.symbol,
      type: 'BUY',
      quantity: qty,
      price: price
    });

    await portfolio.save();
    await user.save();
    await transaction.save();

    res.json({
      message: `Successfully bought ${qty} shares of ${stock.symbol}`,
      transaction,
      virtualBalance: user.virtualBalance,
      holdings: portfolio.holdings
    });
  } catch (error) {
    console.error('Buy transaction error:', error);
    res.status(500).json({ message: 'Server error processing purchase' });
  }
});

// @route   POST api/transactions/sell
// @desc    Sell shares of a stock
// @access  Private
router.post('/sell', auth, async (req, res) => {
  try {
    const { symbol, quantity } = req.body;
    const qty = parseFloat(quantity);

    if (!symbol || !qty || qty <= 0) {
      return res.status(400).json({ message: 'Invalid symbol or quantity' });
    }

    // Find stock
    const stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      return res.status(404).json({ message: 'Stock not found' });
    }

    // Find Portfolio
    const portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      return res.status(400).json({ message: 'Portfolio not found. You do not own any stocks.' });
    }

    // Find holding
    const holdingIndex = portfolio.holdings.findIndex(h => h.symbol === stock.symbol);
    if (holdingIndex === -1 || portfolio.holdings[holdingIndex].quantity < qty) {
      const ownedQty = holdingIndex === -1 ? 0 : portfolio.holdings[holdingIndex].quantity;
      return res.status(400).json({ 
        message: `Insufficient shares. Attempted to sell ${qty}, but you only own ${ownedQty} shares of ${stock.symbol}`
      });
    }

    const price = stock.currentPrice;
    const revenue = price * qty;
    const user = await User.findById(req.user.id);

    // Update holdings
    const existingHolding = portfolio.holdings[holdingIndex];
    const newQty = existingHolding.quantity - qty;

    if (newQty === 0) {
      // Remove holding if all shares sold
      portfolio.holdings.splice(holdingIndex, 1);
    } else {
      portfolio.holdings[holdingIndex].quantity = newQty;
    }

    // Add revenue to user's balance
    user.virtualBalance += revenue;

    // Save transaction
    const transaction = new Transaction({
      user: req.user.id,
      symbol: stock.symbol,
      type: 'SELL',
      quantity: qty,
      price: price
    });

    await portfolio.save();
    await user.save();
    await transaction.save();

    res.json({
      message: `Successfully sold ${qty} shares of ${stock.symbol}`,
      transaction,
      virtualBalance: user.virtualBalance,
      holdings: portfolio.holdings
    });
  } catch (error) {
    console.error('Sell transaction error:', error);
    res.status(500).json({ message: 'Server error processing sale' });
  }
});

// @route   GET api/transactions
// @desc    Get user transaction history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 }); // newest first
    res.json(transactions);
  } catch (error) {
    console.error('Fetch transaction history error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
});

module.exports = router;
