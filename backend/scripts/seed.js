const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Stock = require('../models/Stock');
const Portfolio = require('../models/Portfolio');
const Transaction = require('../models/Transaction');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shopez-stock-trader';

// Mock list of stocks with starting prices
const sampleStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.30 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 415.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 170.20 },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 180.10 },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.40 },
  { symbol: 'NVDA', name: 'Nvidia Corp.', price: 920.00 },
  { symbol: 'META', name: 'Meta Platforms Inc.', price: 475.20 },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 610.30 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 160.50 },
  { symbol: 'BABA', name: 'Alibaba Group', price: 75.80 }
];

// Helper to generate 30 days of synthetic historical data
const generateHistoricalData = (startPrice, days = 30) => {
  const history = [];
  let current = startPrice;
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Fluctuate price by -2% to +2% daily
    const changePercent = (Math.random() * 4 - 2) / 100;
    current = current * (1 + changePercent);
    history.push({ date: dateStr, price: Math.round(current * 100) / 100 });
  }
  return history;
};

const seedDatabase = async () => {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}...`);
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected.');

    // Clear existing data
    console.log('Purging database...');
    await User.deleteMany({});
    await Stock.deleteMany({});
    await Portfolio.deleteMany({});
    await Transaction.deleteMany({});
    console.log('Database purged.');

    // Seed Stocks
    console.log('Seeding stocks...');
    for (const item of sampleStocks) {
      const history = generateHistoricalData(item.price, 30);
      const currentPrice = history[history.length - 1].price;
      const yesterdayPrice = history[history.length - 2].price;
      
      const change = currentPrice - yesterdayPrice;
      const changePercent = (change / yesterdayPrice) * 100;

      const stock = new Stock({
        symbol: item.symbol,
        name: item.name,
        currentPrice: currentPrice,
        dailyStats: {
          open: yesterdayPrice,
          high: Math.max(currentPrice, yesterdayPrice) * (1 + Math.random() * 0.02),
          low: Math.min(currentPrice, yesterdayPrice) * (1 - Math.random() * 0.02),
          change: change,
          changePercent: changePercent
        },
        historicalData: history
      });

      await stock.save();
    }
    console.log('Stocks seeded successfully.');

    // Seed Admin & User
    console.log('Seeding standard user and administrator...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const normalUser = new User({
      name: 'John Doe',
      email: 'user@shopez.com',
      password: hashedPassword,
      role: 'USER',
      virtualBalance: 10000
    });
    await normalUser.save();

    // Create portfolio for normal user
    const normalUserPortfolio = new Portfolio({
      user: normalUser._id,
      holdings: []
    });
    await normalUserPortfolio.save();

    const adminUser = new User({
      name: 'ShopEZ Admin',
      email: 'admin@shopez.com',
      password: hashedPassword,
      role: 'ADMIN',
      virtualBalance: 10000
    });
    await adminUser.save();

    // Create portfolio for admin user
    const adminUserPortfolio = new Portfolio({
      user: adminUser._id,
      holdings: []
    });
    await adminUserPortfolio.save();

    console.log('Users and Portfolios seeded successfully.');
    console.log('Seeding completed successfully!');
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();
