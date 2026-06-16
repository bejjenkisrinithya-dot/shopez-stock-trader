import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      setIsSubmitting(true);
      await register(name, email, password, role);
      navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Error signing up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center min-vh-75 mt-4">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="glass-card shadow-lg p-5">
            <div className="text-center mb-4">
              <i className="bi bi-graph-up-arrow text-primary fs-1"></i>
              <h2 className="mt-3 display-font fw-bold">Create Account</h2>
              <p className="text-secondary">Start trading virtual stocks in real time</p>
            </div>

            {localError && (
              <div className="alert alert-danger badge-down py-3 mb-4 d-flex align-items-center" role="alert">
                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                <div>{localError}</div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-color text-secondary">
                    <i className="bi bi-person"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control glass-input border-start-0 ps-0"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-color text-secondary">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control glass-input border-start-0 ps-0"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label text-secondary small fw-semibold">Password</label>
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

              <div className="mb-4">
                <label className="form-label text-secondary small fw-semibold">Account Type (for demo purposes)</label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-color text-secondary">
                    <i className="bi bi-shield-check"></i>
                  </span>
                  <select 
                    className="form-select glass-input border-start-0 ps-0"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ backgroundPosition: 'right 0.75rem center', backgroundSize: '16px 12px' }}
                  >
                    <option value="USER">Standard Trader (USER)</option>
                    <option value="ADMIN">Moderator (ADMIN)</option>
                  </select>
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-4">
              <span className="text-secondary small">Already have an account? </span>
              <Link to="/login" className="text-primary fw-semibold small text-decoration-none hover-underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
