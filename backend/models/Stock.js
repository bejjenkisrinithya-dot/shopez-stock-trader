const mongoose = require('mongoose');

const HistoricalDataSchema = new mongoose.Schema({
  date: {
    type: String, // format YYYY-MM-DD
    required: true
  },
  price: {
    type: Number,
    required: true
  }
}, { _id: false });

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  currentPrice: {
    type: Number,
    required: true
  },
  dailyStats: {
    open: { type: Number, default: 0 },
    high: { type: Number, default: 0 },
    low: { type: Number, default: 0 },
    change: { type: Number, default: 0 },
    changePercent: { type: Number, default: 0 }
  },
  historicalData: [HistoricalDataSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Stock', StockSchema);
