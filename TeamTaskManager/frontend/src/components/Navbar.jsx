import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineSquares2X2,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';
import './Navbar.css';

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#eab308', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6',
];

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner container">
        <Link to="/dashboard" className="navbar-brand" id="navbar-brand">
          <div className="navbar-logo">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logo-gradient)" />
              <path d="M8 10h12M8 14h8M8 18h10" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-gradient" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#22c55e" />
                  <stop offset="1" stopColor="#4ade80" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="navbar-title">TaskFlow</span>
        </Link>

        <div className="navbar-nav">
          <Link
            to="/dashboard"
            className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
            id="nav-dashboard"
          >
            <HiOutlineSquares2X2 size={18} />
            <span>Dashboard</span>
          </Link>
        </div>

        <div className="navbar-actions">
          <div className="navbar-user" id="navbar-user">
            <div
              className="avatar"
              style={{ background: getAvatarColor(user?.name || 'U') }}
            >
              {getInitials(user?.name || 'User')}
            </div>
            <div className="navbar-user-info">
              <span className="navbar-user-name">{user?.name}</span>
              <span className="navbar-user-email">{user?.email}</span>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title="Logout"
            id="logout-btn"
          >
            <HiArrowRightOnRectangle size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export { getAvatarColor, getInitials };
export default Navbar;
