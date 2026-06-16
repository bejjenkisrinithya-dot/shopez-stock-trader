import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // ALL, GAINERS, LOSERS
  const navigate = useNavigate();

  useEffect(() => {
    fetchStocks();
    const interval = setInterval(fetchStocks, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      const response = await axios.get('/stocks');
      setStocks(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock listings:', err);
      setError('Could not fetch stock data from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (symbol) => {
    navigate(`/stocks/${symbol}`);
  };

  // Filter and search logic
  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.symbol.toLowerCase().includes(search.toLowerCase()) || 
                          stock.name.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'GAINERS') {
      return stock.dailyStats.change >= 0;
    } else if (filter === 'LOSERS') {
      return stock.dailyStats.change < 0;
    }
    
    return true;
  });

  return (
    <div className="container py-5">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
        <div>
          <h1 className="fw-bold display-font display-5 mb-1">Stock Market</h1>
          <p className="text-secondary mb-0">Explore and search companies listed on our simulated exchange.</p>
        </div>
        <div className="d-flex gap-2">
          <button 
            onClick={() => setFilter('ALL')} 
            className={`btn glass-input py-2 px-4 ${filter === 'ALL' ? 'active btn-primary' : 'text-secondary'}`}
          >
            All Listings
          </button>
          <button 
            onClick={() => setFilter('GAINERS')} 
            className={`btn glass-input py-2 px-4 ${filter === 'GAINERS' ? 'active btn-success badge-up' : 'text-secondary'}`}
          >
            Gainers
          </button>
          <button 
            onClick={() => setFilter('LOSERS')} 
            className={`btn glass-input py-2 px-4 ${filter === 'LOSERS' ? 'active btn-danger badge-down' : 'text-secondary'}`}
          >
            Losers
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text bg-transparent border-end-0 border-color text-secondary py-3 ps-4">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            className="form-control glass-input border-start-0 py-3 ps-2 fs-5"
            placeholder="Search by company name or ticker symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-cloud-slash-fill me-2 fs-4"></i>
          <div>{error}</div>
        </div>
      )}

      {loading && stocks.length === 0 ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary my-5" role="status">
            <span className="visually-hidden">Loading stocks...</span>
          </div>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="glass-card text-center p-5 mt-4">
          <i className="bi bi-search text-secondary display-1 mb-3"></i>
          <h4 className="fw-bold display-font">No Stocks Found</h4>
          <p className="text-secondary mb-0">Try typing a different name or ticker symbol.</p>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="table-responsive">
            <table className="custom-table mb-0">
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th className="text-end">Current Price</th>
                  <th className="text-end">24h Change</th>
                  <th className="text-end d-none d-md-table-cell">Open</th>
                  <th className="text-end d-none d-lg-table-cell">High</th>
                  <th className="text-end d-none d-lg-table-cell">Low</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStocks.map(stock => {
                  const isUp = stock.dailyStats.change >= 0;
                  return (
                    <tr 
                      key={stock.symbol} 
                      onClick={() => handleRowClick(stock.symbol)} 
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="fw-bold fs-5 text-primary">{stock.symbol}</td>
                      <td className="text-secondary">{stock.name}</td>
                      <td className="text-end fw-semibold">${stock.currentPrice.toFixed(2)}</td>
                      <td className={`text-end fw-bold ${isUp ? 'stock-up' : 'stock-down'}`}>
                        <span className={`badge ${isUp ? 'badge-up' : 'badge-down'} py-2 px-3`}>
                          {isUp ? '+' : ''}{stock.dailyStats.changePercent.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-end d-none d-md-table-cell text-secondary">${stock.dailyStats.open.toFixed(2)}</td>
                      <td className="text-end d-none d-lg-table-cell text-secondary">${stock.dailyStats.high.toFixed(2)}</td>
                      <td className="text-end d-none d-lg-table-cell text-secondary">${stock.dailyStats.low.toFixed(2)}</td>
                      <td className="text-center">
                        <button 
                          className="btn btn-sm btn-outline-primary px-3 py-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(stock.symbol);
                          }}
                          style={{ borderRadius: '8px' }}
                        >
                          Trade <i className="bi bi-chevron-right ms-1"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
