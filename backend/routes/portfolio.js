const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');
const { auth } = require('../middleware/auth');

// @route   GET api/portfolio
// @desc    Get user portfolio summary and holdings with live stock valuations
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let portfolio = await Portfolio.findOne({ user: req.user.id });
    if (!portfolio) {
      portfolio = new Portfolio({ user: req.user.id, holdings: [] });
      await portfolio.save();
    }

    // Enrich holdings with real-time stock prices
    const enrichedHoldings = [];
    let totalHoldingsValue = 0;
    let totalCostBasis = 0;

    for (const holding of portfolio.holdings) {
      const stock = await Stock.findOne({ symbol: holding.symbol });
      
      const currentPrice = stock ? stock.currentPrice : holding.avgBuyPrice;
      const stockName = stock ? stock.name : holding.symbol;
      const dailyChangePercent = stock ? stock.dailyStats.changePercent : 0;
      
      const totalCost = holding.quantity * holding.avgBuyPrice;
      const currentValue = holding.quantity * currentPrice;
      const profitLoss = currentValue - totalCost;
      const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

      totalHoldingsValue += currentValue;
      totalCostBasis += totalCost;

      enrichedHoldings.push({
        symbol: holding.symbol,
        name: stockName,
        quantity: holding.quantity,
        avgBuyPrice: holding.avgBuyPrice,
        currentPrice: currentPrice,
        dailyChangePercent: dailyChangePercent,
        totalCost,
        currentValue,
        profitLoss,
        profitLossPercent
      });
    }

    const totalPortfolioValue = user.virtualBalance + totalHoldingsValue;
    const overallProfitLoss = totalPortfolioValue - 10000; // relative to starting virtual cash of $10,000
    const overallProfitLossPercent = (overallProfitLoss / 10000) * 100;

    res.json({
      cash: user.virtualBalance,
      holdings: enrichedHoldings,
      totalHoldingsValue,
      totalCostBasis,
      totalPortfolioValue,
      overallProfitLoss,
      overallProfitLossPercent
    });
  } catch (error) {
    console.error('Fetch portfolio summary error:', error);
    res.status(500).json({ message: 'Server error fetching portfolio details' });
  }
});

module.exports = router;
