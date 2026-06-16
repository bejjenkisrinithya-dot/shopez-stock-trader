import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

const StockDetail = () => {
  const { symbol } = useParams();
  const { user, isAuthenticated, refreshUserBalance } = useAuth();
  
  const [stock, setStock] = useState(null);
  const [ownedQty, setOwnedQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Trading states
  const [tradeType, setTradeType] = useState('BUY'); // BUY or SELL
  const [quantity, setQuantity] = useState('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeMessage, setTradeMessage] = useState(null);
  const [tradeError, setTradeError] = useState(null);

  useEffect(() => {
    fetchStockData();
    // Poll updates for prices every 5 seconds
    const interval = setInterval(fetchStockData, 5000);
    return () => clearInterval(interval);
  }, [symbol, isAuthenticated]);

  const fetchStockData = async () => {
    try {
      const response = await axios.get(`/stocks/${symbol}`);
      setStock(response.data);
      setError(null);

      if (isAuthenticated) {
        // Fetch user portfolio to check how many shares they own
        const portRes = await axios.get('/portfolio');
        const holding = portRes.data.holdings.find(h => h.symbol === symbol.toUpperCase());
        setOwnedQty(holding ? holding.quantity : 0);
      }
    } catch (err) {
      console.error('Error fetching stock detail:', err);
      setError('Could not retrieve stock details.');
    } finally {
      setLoading(false);
    }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    setTradeMessage(null);
    setTradeError(null);

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setTradeError('Quantity must be greater than zero');
      return;
    }

    try {
      setTradeLoading(true);
      const endpoint = tradeType === 'BUY' ? '/transactions/buy' : '/transactions/sell';
      const response = await axios.post(endpoint, {
        symbol: symbol.toUpperCase(),
        quantity: qty
      });

      setTradeMessage(response.data.message);
      setQuantity('');
      refreshUserBalance(); // update global balance in context
      
      // Update owned quantity immediately
      const updatedHoldings = response.data.holdings;
      const h = updatedHoldings.find(holding => holding.symbol === symbol.toUpperCase());
      setOwnedQty(h ? h.quantity : 0);
    } catch (err) {
      console.error('Trade error:', err);
      setTradeError(err.response?.data?.message || 'Transaction failed. Please try again.');
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading && !stock) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary my-5" role="status">
          <span className="visually-hidden">Loading stock details...</span>
        </div>
      </div>
    );
  }

  if (error || !stock) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger badge-down py-3 mb-4 text-center" role="alert">
          <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
          <div>{error || 'Stock not found'}</div>
          <Link to="/market" className="btn btn-outline-primary mt-3">Back to Market</Link>
        </div>
      </div>
    );
  }

  // Calculate live numbers
  const isUp = stock.dailyStats.change >= 0;
  const estimatedCost = (parseFloat(quantity) || 0) * stock.currentPrice;

  // Chart configuration
  const chartLabels = stock.historicalData.map(d => d.date);
  const chartPrices = stock.historicalData.map(d => d.price);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        fill: true,
        label: `${stock.symbol} Price ($)`,
        data: chartPrices,
        borderColor: isUp ? '#0d9488' : '#e11d48',
        backgroundColor: isUp ? 'rgba(13, 148, 136, 0.04)' : 'rgba(225, 29, 72, 0.04)',
        borderWidth: 2.5,
        pointRadius: 1,
        pointHoverRadius: 6,
        tension: 0.15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: '#ffffff',
        titleColor: '#475569',
        bodyColor: '#1e293b',
        borderColor: 'rgba(15, 23, 42, 0.08)',
        borderWidth: 1,
        callbacks: {
          label: function (context) {
            return `Price: $${context.raw.toFixed(2)}`;
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(15, 23, 42, 0.02)',
        },
        ticks: {
          color: '#475569',
          maxTicksLimit: 8,
          font: { size: 10 }
        },
      },
      y: {
        grid: {
          color: 'rgba(15, 23, 42, 0.03)',
        },
        ticks: {
          color: '#475569',
          font: { size: 11 }
        },
      },
    },
  };

  return (
    <div className="container py-5">
      {/* Navigation and Symbol header */}
      <div className="mb-4">
        <Link to="/market" className="text-secondary text-decoration-none small hover-underline">
          <i className="bi bi-arrow-left me-1"></i> Back to Market
        </Link>
      </div>

      <div className="row g-4 mb-4 align-items-center">
        <div className="col-12 col-md-8">
          <div className="d-flex align-items-baseline gap-3 flex-wrap">
            <h1 className="fw-bold display-font display-4 mb-0">{stock.symbol}</h1>
            <h3 className="text-secondary fw-normal mb-0">{stock.name}</h3>
          </div>
        </div>
        <div className="col-12 col-md-4 text-md-end">
          <div className="d-flex align-items-baseline justify-content-md-end gap-2">
            <h2 className="fw-bold display-font mb-0">${stock.currentPrice.toFixed(2)}</h2>
            <span className={`badge ${isUp ? 'badge-up' : 'badge-down'} fs-5 py-2 px-3`}>
              {isUp ? '+' : ''}{stock.dailyStats.changePercent.toFixed(2)}%
            </span>
          </div>
          <div className="text-secondary small mt-1">
            Change: {isUp ? '+' : ''}${stock.dailyStats.change.toFixed(2)} Today
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Chart Column */}
        <div className="col-12 col-lg-8">
          <div className="glass-card mb-4" style={{ minHeight: '400px' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold display-font mb-0">Historical Performance (30 Days)</h5>
              <span className="text-secondary small">Live Updates</span>
            </div>
            <div style={{ height: '320px', position: 'relative' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

          {/* Daily Stats Grid */}
          <div className="glass-card">
            <h5 className="fw-bold display-font mb-4">Daily Statistics</h5>
            <div className="row g-3">
              <div className="col-6 col-md-3">
                <div className="text-secondary small mb-1">Open Price</div>
                <div className="fw-semibold fs-5">${stock.dailyStats.open.toFixed(2)}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-secondary small mb-1">Daily High</div>
                <div className="fw-semibold fs-5 text-success">${stock.dailyStats.high.toFixed(2)}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-secondary small mb-1">Daily Low</div>
                <div className="fw-semibold fs-5 text-danger">${stock.dailyStats.low.toFixed(2)}</div>
              </div>
              <div className="col-6 col-md-3">
                <div className="text-secondary small mb-1">Last Update</div>
                <div className="fw-semibold text-secondary small pt-1">Just Now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Trade Form Column */}
        <div className="col-12 col-lg-4">
          <div className="glass-card glow-blue sticky-top" style={{ top: '100px', zIndex: 10 }}>
            <h4 className="fw-bold display-font mb-4">Execute Order</h4>
            
            {/* Tabs */}
            <div className="row g-2 mb-4 bg-secondary bg-opacity-10 p-1 rounded-3 mx-0">
              <div className="col-6">
                <div 
                  onClick={() => { setTradeType('BUY'); setTradeMessage(null); setTradeError(null); }}
                  className={`trade-tab trade-tab-buy ${tradeType === 'BUY' ? 'active' : 'text-secondary'}`}
                >
                  BUY
                </div>
              </div>
              <div className="col-6">
                <div 
                  onClick={() => { setTradeType('SELL'); setTradeMessage(null); setTradeError(null); }}
                  className={`trade-tab trade-tab-sell ${tradeType === 'SELL' ? 'active' : 'text-secondary'}`}
                >
                  SELL
                </div>
              </div>
            </div>

            {/* User Portfolio Balance Context */}
            {isAuthenticated ? (
              <div className="mb-4 p-3 bg-light rounded-3 border border-color">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Your Cash:</span>
                  <span className="text-dark fw-bold">
                    ${user.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary small">Owned Shares:</span>
                  <span className="text-dark fw-bold">{ownedQty} shares</span>
                </div>
              </div>
            ) : (
              <div className="alert alert-warning badge-down py-3 mb-4 text-center" role="alert">
                <i className="bi bi-lock-fill me-1"></i> Log in to begin trading.
                <div className="mt-2">
                  <Link to="/login" className="btn btn-sm btn-primary px-3 py-1 mt-1">Sign In</Link>
                </div>
              </div>
            )}

            {/* Trade feedback */}
            {tradeMessage && (
              <div className="alert alert-success badge-up py-3 mb-4 d-flex align-items-center" role="alert">
                <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                <div>{tradeMessage}</div>
              </div>
            )}
            {tradeError && (
              <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{tradeError}</div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleTradeSubmit}>
              <div className="mb-4">
                <label className="form-label text-secondary small fw-bold">Quantity (Shares)</label>
                <input
                  type="number"
                  step="any"
                  min="0.0001"
                  className="form-control glass-input"
                  placeholder="0.00"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  disabled={!isAuthenticated || tradeLoading}
                  required
                />
              </div>

              {/* Estimate Calculations */}
              {quantity && (
                <div className="mb-4 py-2 border-top border-bottom border-color d-flex justify-content-between align-items-center">
                  <span className="text-secondary small">Estimated {tradeType === 'BUY' ? 'Cost' : 'Credit'}:</span>
                  <h4 className={`mb-0 fw-bold display-font ${tradeType === 'BUY' ? 'stock-down' : 'stock-up'}`}>
                    ${estimatedCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h4>
                </div>
              )}

              <button
                type="submit"
                className={`btn w-100 py-3 ${tradeType === 'BUY' ? 'btn-success' : 'btn-danger'} text-white fw-bold`}
                style={{ borderRadius: '10px' }}
                disabled={!isAuthenticated || tradeLoading || !quantity}
              >
                {tradeLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Executing...
                  </>
                ) : (
                  `${tradeType === 'BUY' ? 'BUY' : 'SELL'} ${stock.symbol}`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
