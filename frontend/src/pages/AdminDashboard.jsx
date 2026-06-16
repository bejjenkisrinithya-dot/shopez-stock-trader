import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
  const [stocks, setStocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('stocks'); // stocks, users, logs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form states for adding/editing stock
  const [showForm, setShowForm] = useState(false);
  const [editStockId, setEditStockId] = useState(null);
  const [formSymbol, setFormSymbol] = useState('');
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formOpen, setFormOpen] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'stocks') {
        const res = await axios.get('/stocks');
        setStocks(res.data);
      } else if (activeTab === 'users') {
        const res = await axios.get('/admin/users');
        setUsers(res.data);
      } else if (activeTab === 'logs') {
        const res = await axios.get('/admin/transactions');
        setTransactions(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to fetch administration data. Ensure you have administrator access.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrEditStock = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formSymbol || !formName || !formPrice) {
      setFormError('Symbol, Name, and Price are required.');
      return;
    }

    try {
      setSubmitting(true);
      if (editStockId) {
        // Edit Stock
        await axios.put(`/admin/stocks/${editStockId}`, {
          name: formName,
          currentPrice: parseFloat(formPrice),
          open: parseFloat(formOpen) || undefined
        });
        setFormSuccess('Stock updated successfully!');
      } else {
        // Create Stock
        await axios.post('/admin/stocks', {
          symbol: formSymbol,
          name: formName,
          currentPrice: parseFloat(formPrice),
          open: parseFloat(formOpen) || parseFloat(formPrice)
        });
        setFormSuccess('Stock listing created successfully!');
      }

      // Reset form fields
      setFormSymbol('');
      setFormName('');
      setFormPrice('');
      setFormOpen('');
      setEditStockId(null);
      
      // Refresh list
      const res = await axios.get('/stocks');
      setStocks(res.data);
      
      setTimeout(() => {
        setShowForm(false);
        setFormSuccess('');
      }, 1500);

    } catch (err) {
      console.error('Stock modification error:', err);
      setFormError(err.response?.data?.message || 'Error modifying stock listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (stock) => {
    setEditStockId(stock._id);
    setFormSymbol(stock.symbol);
    setFormName(stock.name);
    setFormPrice(stock.currentPrice.toString());
    setFormOpen(stock.dailyStats?.open?.toString() || '');
    setShowForm(true);
    setFormError('');
    setFormSuccess('');
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm('Are you sure you want to delete this stock listing? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.delete(`/admin/stocks/${id}`);
      setStocks(stocks.filter(s => s._id !== id));
    } catch (err) {
      console.error('Delete stock error:', err);
      alert(err.response?.data?.message || 'Error deleting stock listing.');
    }
  };

  return (
    <div className="container py-5">
      <div className="mb-5">
        <h1 className="fw-bold display-font display-5 mb-1">Admin Dashboard</h1>
        <p className="text-secondary mb-0">Manage listed stock assets, review registered users, and audit platform trades.</p>
      </div>

      {error && (
        <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
          <i className="bi bi-shield-exclamation me-2 fs-4"></i>
          <div>{error}</div>
        </div>
      )}

      {/* Admin navigation tabs */}
      <div className="row g-2 mb-4 bg-secondary bg-opacity-10 p-2 rounded-3 mx-0 border border-color">
        <div className="col-4">
          <button 
            onClick={() => { setActiveTab('stocks'); setShowForm(false); }} 
            className={`btn w-100 py-3 fw-semibold ${activeTab === 'stocks' ? 'btn-primary' : 'text-secondary bg-transparent border-0'}`}
          >
            <i className="bi bi-graph-up me-2"></i> Manage Stocks
          </button>
        </div>
        <div className="col-4">
          <button 
            onClick={() => { setActiveTab('users'); setShowForm(false); }} 
            className={`btn w-100 py-3 fw-semibold ${activeTab === 'users' ? 'btn-primary' : 'text-secondary bg-transparent border-0'}`}
          >
            <i className="bi bi-people me-2"></i> Users Database
          </button>
        </div>
        <div className="col-4">
          <button 
            onClick={() => { setActiveTab('logs'); setShowForm(false); }} 
            className={`btn w-100 py-3 fw-semibold ${activeTab === 'logs' ? 'btn-primary' : 'text-secondary bg-transparent border-0'}`}
          >
            <i className="bi bi-journal-text me-2"></i> Audit Logs
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="glass-card p-4">
        {/* Loading state */}
        {loading && !showForm && (
          <div className="text-center py-5">
            <div className="spinner-border text-primary my-4" role="status">
              <span className="visually-hidden">Fetching panel data...</span>
            </div>
          </div>
        )}

        {/* 1. MANAGE STOCKS TAB */}
        {!loading && activeTab === 'stocks' && (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
              <h4 className="fw-bold display-font mb-0">Active Stock Listings</h4>
              <button 
                className="btn gradient-btn py-2 px-4"
                onClick={() => {
                  setEditStockId(null);
                  setFormSymbol('');
                  setFormName('');
                  setFormPrice('');
                  setFormOpen('');
                  setShowForm(!showForm);
                  setFormError('');
                  setFormSuccess('');
                }}
              >
                <i className={`bi ${showForm ? 'bi-x-lg' : 'bi-plus-lg'} me-1`}></i> 
                {showForm ? 'Close Editor' : 'List New Stock'}
              </button>
            </div>

            {showForm && (
              <div className="p-4 bg-light rounded-3 mb-4 border border-color">
                <h5 className="fw-bold mb-3">{editStockId ? 'Edit Stock Details' : 'Create New Stock Profile'}</h5>
                
                {formError && (
                  <div className="alert alert-danger badge-down py-2 mb-3 small" role="alert">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="alert alert-success badge-up py-2 mb-3 small" role="alert">
                    {formSuccess}
                  </div>
                )}

                <form onSubmit={handleCreateOrEditStock}>
                  <div className="row g-3">
                    <div className="col-12 col-sm-6 col-md-3">
                      <label className="form-label text-secondary small fw-bold">Symbol (Ticker)</label>
                      <input
                        type="text"
                        className="form-control glass-input"
                        placeholder="e.g. NVDA"
                        value={formSymbol}
                        onChange={(e) => setFormSymbol(e.target.value.toUpperCase())}
                        disabled={!!editStockId || submitting}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <label className="form-label text-secondary small fw-bold">Company Name</label>
                      <input
                        type="text"
                        className="form-control glass-input"
                        placeholder="e.g. Nvidia Corporation"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <label className="form-label text-secondary small fw-bold">Current Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control glass-input"
                        placeholder="e.g. 920.00"
                        value={formPrice}
                        onChange={(e) => setFormPrice(e.target.value)}
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div className="col-12 col-sm-6 col-md-3">
                      <label className="form-label text-secondary small fw-bold">Daily Open ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        className="form-control glass-input"
                        placeholder="Default matches Price"
                        value={formOpen}
                        onChange={(e) => setFormOpen(e.target.value)}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div className="d-flex justify-content-end mt-3 gap-2">
                    <button 
                      type="button" 
                      onClick={() => setShowForm(false)} 
                      className="btn btn-outline-secondary btn-sm glass-input"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary btn-sm px-4"
                      disabled={submitting}
                    >
                      {submitting ? 'Submitting...' : editStockId ? 'Save Changes' : 'Publish Listing'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th className="text-end">Price</th>
                    <th className="text-end">Change %</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map(stock => (
                    <tr key={stock._id}>
                      <td className="fw-bold text-primary">{stock.symbol}</td>
                      <td className="text-secondary">{stock.name}</td>
                      <td className="text-end fw-semibold">${stock.currentPrice.toFixed(2)}</td>
                      <td className={`text-end fw-semibold ${stock.dailyStats?.change >= 0 ? 'stock-up' : 'stock-down'}`}>
                        {stock.dailyStats?.change >= 0 ? '+' : ''}{stock.dailyStats?.changePercent?.toFixed(2)}%
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button 
                            className="btn btn-sm btn-outline-info py-1 px-2"
                            onClick={() => handleEditClick(stock)}
                          >
                            <i className="bi bi-pencil"></i> Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger py-1 px-2"
                            onClick={() => handleDeleteStock(stock._id)}
                          >
                            <i className="bi bi-trash"></i> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2. USER DATABASE TAB */}
        {!loading && activeTab === 'users' && (
          <>
            <h4 className="fw-bold display-font mb-4">Registered Platform Accounts</h4>
            <div className="table-responsive">
              <table className="custom-table mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th className="text-end">Cash Balance</th>
                    <th className="text-end">Assets Value</th>
                    <th className="text-end">Total Valuation</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u._id}>
                      <td className="fw-semibold text-dark">{u.name}</td>
                      <td className="text-secondary">{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'bg-danger' : 'bg-primary'} py-1 px-3`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-end text-success fw-semibold">${u.virtualBalance.toFixed(2)}</td>
                      <td className="text-end text-secondary">${u.totalHoldingsValue.toFixed(2)}</td>
                      <td className="text-end fw-bold">${u.totalPortfolioValue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 3. AUDIT LOGS TAB */}
        {!loading && activeTab === 'logs' && (
          <>
            <h4 className="fw-bold display-font mb-4">Global Transaction Audit Trail</h4>
            {transactions.length === 0 ? (
              <p className="text-secondary text-center py-4">No global transactions found.</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table mb-0">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Trader Profile</th>
                      <th>Symbol</th>
                      <th>Order</th>
                      <th className="text-end">Shares</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Valuation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => {
                      const isBuy = tx.type === 'BUY';
                      const txDate = new Date(tx.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      return (
                        <tr key={tx._id}>
                          <td className="text-secondary small">{txDate}</td>
                          <td>
                            <div className="fw-semibold text-dark">{tx.user?.name || 'Unknown'}</div>
                            <div className="text-secondary small">{tx.user?.email || 'N/A'}</div>
                          </td>
                          <td className="fw-bold text-primary">{tx.symbol}</td>
                          <td>
                            <span className={`badge ${isBuy ? 'badge-up' : 'badge-down'} py-2 px-3`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="text-end fw-semibold">{tx.quantity}</td>
                          <td className="text-end text-secondary">${tx.price.toFixed(2)}</td>
                          <td className="text-end fw-bold">
                            ${(tx.quantity * tx.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
