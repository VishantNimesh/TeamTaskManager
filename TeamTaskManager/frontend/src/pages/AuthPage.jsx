import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/Toast';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiEye,
  HiEyeSlash,
} from 'react-icons/hi2';
import './AuthPage.css';

const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'login';
  const [isLogin, setIsLogin] = useState(mode !== 'register');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, register, isAuthenticated, error, clearError } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const errs = {};
    if (!isLogin && !form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Min 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    clearError();

    let result;
    if (isLogin) {
      result = await login({ email: form.email, password: form.password });
    } else {
      result = await register(form);
    }

    if (result.success) {
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrors({});
    clearError();
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: '' });
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1"></div>
        <div className="auth-orb auth-orb-2"></div>
        <div className="auth-orb auth-orb-3"></div>
      </div>

      <div className="auth-container">
        <div className="auth-card">
          {/* Header */}
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="url(#auth-grad)" />
                <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <defs>
                  <linearGradient id="auth-grad" x1="0" y1="0" x2="28" y2="28">
                    <stop stopColor="#22c55e" />
                    <stop offset="1" stopColor="#4ade80" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h1 className="auth-title">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="auth-subtitle">
              {isLogin
                ? 'Sign in to manage your team tasks'
                : 'Start collaborating with your team'}
            </p>
          </div>

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit} id="auth-form">
            {!isLogin && (
              <div className="auth-field">
                <div className="auth-input-wrapper">
                  <HiOutlineUser className="auth-input-icon" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={form.name}
                    onChange={handleChange('name')}
                    className={`auth-input ${errors.name ? 'has-error' : ''}`}
                    id="input-name"
                  />
                </div>
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
            )}

            <div className="auth-field">
              <div className="auth-input-wrapper">
                <HiOutlineEnvelope className="auth-input-icon" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={form.email}
                  onChange={handleChange('email')}
                  className={`auth-input ${errors.email ? 'has-error' : ''}`}
                  id="input-email"
                />
              </div>
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="auth-field">
              <div className="auth-input-wrapper">
                <HiOutlineLockClosed className="auth-input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange('password')}
                  className={`auth-input ${errors.password ? 'has-error' : ''}`}
                  id="input-password"
                />
                <button
                  type="button"
                  className="auth-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <HiEyeSlash size={18} /> : <HiEye size={18} />}
                </button>
              </div>
              {errors.password && (
                <span className="form-error">{errors.password}</span>
              )}
            </div>

            {error && <div className="auth-error-banner">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
              id="auth-submit-btn"
            >
              {loading ? (
                <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></div>
              ) : isLogin ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="auth-toggle">
            <span>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </span>
            <button onClick={toggleMode} className="auth-toggle-btn" id="auth-toggle-btn">
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
