const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// @route   GET api/stocks
// @desc    Get all stocks
// @access  Public (or Private)
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find().select('-historicalData'); // exclude heavy historical data for list view
    res.json(stocks);
  } catch (error) {
    console.error('Fetch stocks error:', error);
    res.status(500).json({ message: 'Server error fetching stocks' });
  }
});

// @route   GET api/stocks/:symbol
// @desc    Get specific stock with historical data
// @access  Public (or Private)
router.get('/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const stock = await Stock.findOne({ symbol });
    
    if (!stock) {
      return res.status(404).json({ message: `Stock with symbol ${symbol} not found` });
    }
    
    res.json(stock);
  } catch (error) {
    console.error('Fetch stock detail error:', error);
    res.status(500).json({ message: 'Server error fetching stock detail' });
  }
});

module.exports = router;
