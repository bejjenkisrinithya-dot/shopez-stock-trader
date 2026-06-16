import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light glass-navbar py-3">
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <i className="bi bi-graph-up-arrow text-primary me-2 fs-4"></i>
          <span className="fw-bold fs-4 display-font">
            ShopEZ <span className="gradient-text">Trader</span>
          </span>
        </Link>

        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/">
                <i className="bi bi-speedometer2 me-1"></i> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/market">
                <i className="bi bi-shop me-1"></i> Market
              </NavLink>
            </li>
            {isAuthenticated && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/portfolio">
                  <i className="bi bi-wallet2 me-1"></i> Portfolio
                </NavLink>
              </li>
            )}
            {isAuthenticated && isAdmin && (
              <li className="nav-item">
                <NavLink className={({ isActive }) => `nav-link nav-link-custom ${isActive ? 'active' : ''}`} to="/admin">
                  <i className="bi bi-shield-lock me-1"></i> Admin Panel
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                <div className="d-none d-md-flex flex-column align-items-end">
                  <span className="text-secondary small">Virtual Balance</span>
                  <span className="fw-bold text-success display-font">
                    ${user.virtualBalance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                
                <div className="dropdown">
                  <button 
                    className="btn dropdown-toggle glass-input d-flex align-items-center gap-2" 
                    type="button" 
                    id="profileDropdown" 
                    data-bs-toggle="dropdown" 
                    aria-expanded="false"
                  >
                    <i className="bi bi-person-circle text-primary"></i>
                    <span>{user.name}</span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end mt-2 glass-card p-2 shadow" aria-labelledby="profileDropdown" style={{ minWidth: '200px', border: '1px solid var(--border-color)' }}>
                    <li className="dropdown-item py-2 border-bottom border-color">
                      <div className="text-secondary small">Logged in as</div>
                      <div className="text-dark fw-semibold">{user.email}</div>
                    </li>
                    <li>
                      <button className="dropdown-item text-danger py-2 mt-1" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right me-2"></i> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary px-4 py-2" style={{ borderRadius: '10px' }}>
                  Login
                </Link>
                <Link to="/register" className="btn gradient-btn px-4 py-2">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
