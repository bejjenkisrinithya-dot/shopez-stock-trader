import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [portfolioInfo, setPortfolioInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // Poll updates every 6 seconds to show dynamic changes
    const interval = setInterval(fetchDashboardData, 6000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      const stocksRes = await axios.get('/stocks');
      setStocks(stocksRes.data);

      if (isAuthenticated) {
        const portfolioRes = await axios.get('/portfolio');
        setPortfolioInfo(portfolioRes.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Could not retrieve market statistics. Ensure the server is online.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && stocks.length === 0) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading Market...</span>
        </div>
      </div>
    );
  }

  // Calculate market stats
  const gainers = [...stocks].sort((a, b) => b.dailyStats.changePercent - a.dailyStats.changePercent);
  const topGainer = gainers[0];
  const topLoser = gainers[gainers.length - 1];
  const featuredStocks = stocks.slice(0, 4); // show first 4 stocks as featured

  return (
    <div className="container py-5">
      {/* Header and Welcome */}
      <div className="row mb-5 align-items-center">
        <div className="col-12 col-md-8">
          <h1 className="fw-bold display-font display-4 mb-2">
            Welcome, <span className="gradient-text">{isAuthenticated ? user.name : 'Trader'}</span>!
          </h1>
          <p className="text-secondary fs-5">
            {isAuthenticated 
              ? 'Explore hot listings, monitor your investments, and execute virtual stock orders.' 
              : 'Join the platform to access live stock trading simulator with a virtual $10,000 budget.'}
          </p>
        </div>
        {!isAuthenticated && (
          <div className="col-12 col-md-4 text-md-end mt-3 mt-md-0">
            <Link to="/register" className="btn gradient-btn px-4 py-3">
              Get Started for Free
            </Link>
          </div>
        )}
      </div>

      {error && (
        <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-cloud-slash-fill me-2 fs-4"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Portfolio Quick Overview (Conditional on Auth) */}
      {isAuthenticated && portfolioInfo && (
        <div className="row mb-5">
          <div className="col-12">
            <div className="glass-card glow-blue" style={{ borderLeft: '4px solid #8b5cf6' }}>
              <h4 className="text-secondary small fw-bold uppercase tracking-wider mb-4">PORTFOLIO OVERVIEW</h4>
              <div className="row g-4">
                <div className="col-6 col-md-3">
                  <div className="text-secondary small mb-1">Total Valuation</div>
                  <h3 className="fw-bold display-font">
                    ${portfolioInfo.totalPortfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-secondary small mb-1">Cash Balance</div>
                  <h3 className="fw-bold display-font">
                    ${portfolioInfo.cash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-secondary small mb-1">Assets Value</div>
                  <h3 className="fw-bold display-font">
                    ${portfolioInfo.totalHoldingsValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="col-6 col-md-3">
                  <div className="text-secondary small mb-1">Total Return</div>
                  <h3 className={`fw-bold display-font ${portfolioInfo.overallProfitLoss >= 0 ? 'stock-up' : 'stock-down'}`}>
                    {portfolioInfo.overallProfitLoss >= 0 ? '+' : ''}
                    ${portfolioInfo.overallProfitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    <span className="fs-6 ms-1">({portfolioInfo.overallProfitLossPercent?.toFixed(2)}%)</span>
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Summary Cards */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-4">
          <div className="glass-card h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <span className="text-secondary small fw-bold uppercase">MARKET STATUS</span>
              <span className="badge badge-up py-2 px-3 rounded-pill">SIMULATOR ACTIVE</span>
            </div>
            <h4 className="fw-bold display-font mb-1">
              {stocks.length} Listings Available
            </h4>
            <p className="text-secondary small mb-0">Prices refresh in real-time every 5 seconds.</p>
          </div>
        </div>

        {topGainer && (
          <div className="col-12 col-sm-6 col-md-4">
            <Link to={`/stocks/${topGainer.symbol}`} className="text-decoration-none">
              <div className="glass-card h-100 border-success border-opacity-25">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-secondary small fw-bold uppercase">TOP GAINER TODAY</span>
                  <i className="bi bi-arrow-up-right-circle-fill text-success fs-4"></i>
                </div>
                <div className="d-flex justify-content-between align-items-baseline">
                  <h4 className="fw-bold display-font mb-0">{topGainer.symbol}</h4>
                  <span className="badge badge-up">+{topGainer.dailyStats.changePercent.toFixed(2)}%</span>
                </div>
                <div className="text-secondary small mt-2">{topGainer.name}</div>
                <div className="fw-semibold mt-1">${topGainer.currentPrice.toFixed(2)}</div>
              </div>
            </Link>
          </div>
        )}

        {topLoser && (
          <div className="col-12 col-sm-6 col-md-4">
            <Link to={`/stocks/${topLoser.symbol}`} className="text-decoration-none">
              <div className="glass-card h-100 border-danger border-opacity-25">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-secondary small fw-bold uppercase">TOP LOSER TODAY</span>
                  <i className="bi bi-arrow-down-left-circle-fill text-danger fs-4"></i>
                </div>
                <div className="d-flex justify-content-between align-items-baseline">
                  <h4 className="fw-bold display-font mb-0">{topLoser.symbol}</h4>
                  <span className="badge badge-down">{topLoser.dailyStats.changePercent.toFixed(2)}%</span>
                </div>
                <div className="text-secondary small mt-2">{topLoser.name}</div>
                <div className="fw-semibold mt-1">${topLoser.currentPrice.toFixed(2)}</div>
              </div>
            </Link>
          </div>
        )}
      </div>

      {/* Featured Stocks and Call to Action */}
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="glass-card h-100">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold display-font mb-0">Featured Listings</h4>
              <Link to="/market" className="btn btn-outline-primary btn-sm glass-input px-3">
                View All <i className="bi bi-arrow-right ms-1"></i>
              </Link>
            </div>

            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {featuredStocks.map(stock => (
                    <tr key={stock.symbol} style={{ cursor: 'pointer' }}>
                      <td>
                        <Link to={`/stocks/${stock.symbol}`} className="text-decoration-none fw-bold text-primary">
                          {stock.symbol}
                        </Link>
                      </td>
                      <td className="text-secondary">{stock.name}</td>
                      <td className="text-end fw-semibold">${stock.currentPrice.toFixed(2)}</td>
                      <td className={`text-end fw-bold ${stock.dailyStats.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                        {stock.dailyStats.change >= 0 ? '+' : ''}
                        {stock.dailyStats.changePercent.toFixed(2)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="glass-card h-100 d-flex flex-column justify-content-center p-5 text-center bg-gradient glow-blue" style={{ background: 'linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(96, 165, 250, 0.1) 100%)' }}>
            <i className="bi bi-wallet2 text-primary fs-1 mb-4"></i>
            <h4 className="fw-bold display-font mb-2">Simulated Investments</h4>
            <p className="text-secondary small mb-4">
              Practice stock purchasing strategies using virtual paper funds. No real money risk, maximum financial learning.
            </p>
            {isAuthenticated ? (
              <Link to="/portfolio" className="btn gradient-btn py-3">
                Go to My Portfolio <i className="bi bi-chevron-right ms-1"></i>
              </Link>
            ) : (
              <Link to="/register" className="btn gradient-btn py-3">
                Join ShopEZ Trader <i className="bi bi-chevron-right ms-1"></i>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
