import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Portfolio = () => {
  const { user } = useAuth();
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolioData();
    // Poll portfolio details every 6 seconds to reflect real-time updates
    const interval = setInterval(fetchPortfolioData, 6000);
    return () => clearInterval(interval);
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const portRes = await axios.get('/portfolio');
      setPortfolio(portRes.data);

      const txRes = await axios.get('/transactions');
      setTransactions(txRes.data.slice(0, 10)); // take only 10 latest transactions
      setError(null);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Could not retrieve portfolio information.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !portfolio) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading Portfolio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="mb-5">
        <h1 className="fw-bold display-font display-5 mb-1">Investment Portfolio</h1>
        <p className="text-secondary mb-0">Monitor your assets, holdings, cost bases, and transaction records.</p>
      </div>

      {error && (
        <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-cloud-slash-fill me-2 fs-4"></i>
          <div>{error}</div>
        </div>
      )}

      {portfolio && (
        <>
          {/* Main Portfolio Stats Cards */}
          <div className="row g-4 mb-5">
            <div className="col-12 col-md-4">
              <div className="glass-card h-100">
                <div className="text-secondary small mb-1 fw-bold uppercase">PORTFOLIO VALUE</div>
                <h2 className="fw-bold display-font mb-0">
                  ${portfolio.totalPortfolioValue?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <div className="text-secondary small mt-2">Combined cash + assets valuation</div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div className="glass-card h-100">
                <div className="text-secondary small mb-1 fw-bold uppercase">CASH BALANCE</div>
                <h2 className="fw-bold display-font text-success mb-0">
                  ${portfolio.cash?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <div className="text-secondary small mt-2">Available funds for stock purchases</div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-md-4">
              <div className="glass-card h-100">
                <div className="text-secondary small mb-1 fw-bold uppercase">OVERALL RETURN</div>
                <h2 className={`fw-bold display-font mb-0 ${portfolio.overallProfitLoss >= 0 ? 'stock-up' : 'stock-down'}`}>
                  {portfolio.overallProfitLoss >= 0 ? '+' : ''}
                  ${portfolio.overallProfitLoss?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
                <div className={`small fw-semibold mt-2 ${portfolio.overallProfitLoss >= 0 ? 'stock-up' : 'stock-down'}`}>
                  {portfolio.overallProfitLoss >= 0 ? '▲' : '▼'} {portfolio.overallProfitLossPercent?.toFixed(2)}% (vs. initial $10k)
                </div>
              </div>
            </div>
          </div>

          {/* Holdings Section */}
          <div className="glass-card p-4 mb-5">
            <h4 className="fw-bold display-font mb-4">Your Holdings</h4>
            
            {portfolio.holdings.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-wallet2 text-secondary display-3 mb-3"></i>
                <h5 className="fw-bold">No Stocks Owned</h5>
                <p className="text-secondary mb-4">Your portfolio is empty. Explore the market and place a buy order.</p>
                <Link to="/market" className="btn gradient-btn px-4 py-2">
                  Browse Market
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th className="text-end">Qty</th>
                      <th className="text-end">Avg Cost</th>
                      <th className="text-end">Current Price</th>
                      <th className="text-end d-none d-md-table-cell">Cost Basis</th>
                      <th className="text-end d-none d-md-table-cell">Market Value</th>
                      <th className="text-end">Total Return</th>
                      <th className="text-center">Trade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.holdings.map(item => {
                      const isProfit = item.profitLoss >= 0;
                      return (
                        <tr key={item.symbol}>
                          <td>
                            <Link to={`/stocks/${item.symbol}`} className="text-decoration-none text-primary d-block">
                              <span className="fw-bold fs-5">{item.symbol}</span>
                              <span className="text-secondary d-block small" style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {item.name}
                              </span>
                            </Link>
                          </td>
                          <td className="text-end fw-semibold">{item.quantity}</td>
                          <td className="text-end text-secondary">${item.avgBuyPrice.toFixed(2)}</td>
                          <td className="text-end fw-semibold">${item.currentPrice.toFixed(2)}</td>
                          <td className="text-end text-secondary d-none d-md-table-cell">${item.totalCost.toFixed(2)}</td>
                          <td className="text-end fw-semibold d-none d-md-table-cell">${item.currentValue.toFixed(2)}</td>
                          <td className={`text-end fw-bold ${isProfit ? 'stock-up' : 'stock-down'}`}>
                            <div>{isProfit ? '+' : ''}${item.profitLoss.toFixed(2)}</div>
                            <span className="small">{isProfit ? '+' : ''}{item.profitLossPercent.toFixed(2)}%</span>
                          </td>
                          <td className="text-center">
                            <Link to={`/stocks/${item.symbol}`} className="btn btn-sm btn-outline-primary glass-input py-1 px-3">
                              Trade
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Transaction History Section */}
      <div className="glass-card p-4">
        <h4 className="fw-bold display-font mb-4">Recent Transactions</h4>
        
        {transactions.length === 0 ? (
          <p className="text-secondary text-center py-4 mb-0">No past transactions recorded.</p>
        ) : (
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Symbol</th>
                  <th>Type</th>
                  <th className="text-end">Shares</th>
                  <th className="text-end">Price</th>
                  <th className="text-end">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => {
                  const isBuy = tx.type === 'BUY';
                  const date = new Date(tx.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });
                  return (
                    <tr key={tx._id}>
                      <td className="text-secondary">{date}</td>
                      <td>
                        <Link to={`/stocks/${tx.symbol}`} className="text-decoration-none text-primary fw-bold">
                          {tx.symbol}
                        </Link>
                      </td>
                      <td>
                        <span className={`badge ${isBuy ? 'badge-up' : 'badge-down'} py-2 px-3`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="text-end fw-semibold">{tx.quantity}</td>
                      <td className="text-end text-secondary">${tx.price.toFixed(2)}</td>
                      <td className="text-end fw-semibold">
                        ${(tx.quantity * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Portfolio;
