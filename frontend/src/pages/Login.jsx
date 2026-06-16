import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center min-vh-75 mt-5">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="glass-card shadow-lg p-5">
            <div className="text-center mb-4">
              <i className="bi bi-graph-up-arrow text-primary fs-1"></i>
              <h2 className="mt-3 display-font fw-bold">Welcome Back</h2>
              <p className="text-secondary">Sign in to manage your mock investment portfolio</p>
            </div>

            {localError && (
              <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{localError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold uppercase tracking-wider">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-color text-secondary">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control glass-input border-start-0 ps-0"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold uppercase tracking-wider">Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-color text-secondary">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type="password"
                    className="form-control glass-input border-start-0 ps-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn gradient-btn w-100 py-3 mb-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-secondary small">Don't have an account? </span>
              <Link to="/register" className="text-primary fw-semibold small text-decoration-none hover-underline">
                Create Account
              </Link>
            </div>

            <div className="mt-4 pt-3 border-top border-secondary border-opacity-25 text-center">
              <div className="text-secondary small mb-2 fw-semibold">Demo Credentials:</div>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <span 
                  className="badge glass-input py-2 px-3 cursor-pointer text-start"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEmail('user@shopez.com');
                    setPassword('password123');
                  }}
                >
                  <span className="text-secondary">User:</span> user@shopez.com
                </span>
                <span 
                  className="badge glass-input py-2 px-3 cursor-pointer text-start"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setEmail('admin@shopez.com');
                    setPassword('password123');
                  }}
                >
                  <span className="text-secondary">Admin:</span> admin@shopez.com
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
