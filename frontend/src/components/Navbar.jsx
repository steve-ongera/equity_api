import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [dropOpen, setDropOpen] = useState(false);

  const initials = user ? `${user.first_name[0]}${user.last_name[0]}`.toUpperCase() : 'U';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle" onClick={onMenuToggle} aria-label="Toggle menu">
          <i className="bi bi-list"></i>
        </button>
        <div className="navbar-brand">
          <span className="brand-icon"><i className="bi bi-bank2"></i></span>
          <span className="brand-text">Equity<span>Bank</span></span>
        </div>
      </div>

      <div className="navbar-right">
        <button className="icon-btn" onClick={toggleTheme} title="Toggle theme">
          <i className={`bi bi-${theme === 'dark' ? 'sun' : 'moon-stars'}`}></i>
        </button>

        <button className="icon-btn notif-btn" title="Notifications">
          <i className="bi bi-bell"></i>
          <span className="notif-dot"></span>
        </button>

        <div className="user-menu">
          <button className="user-avatar-btn" onClick={() => setDropOpen(o => !o)}>
            <div className="avatar">{initials}</div>
            <div className="user-info">
              <span className="user-name">{user?.first_name} {user?.last_name}</span>
              <span className="user-account">{user?.account_number}</span>
            </div>
            <i className={`bi bi-chevron-${dropOpen ? 'up' : 'down'} chevron`}></i>
          </button>

          {dropOpen && (
            <div className="dropdown-menu">
              <a href="/profile" className="dropdown-item" onClick={() => setDropOpen(false)}>
                <i className="bi bi-person"></i> Profile
              </a>
              <a href="/settings" className="dropdown-item" onClick={() => setDropOpen(false)}>
                <i className="bi bi-gear"></i> Settings
              </a>
              <div className="dropdown-divider"></div>
              <button className="dropdown-item logout-item" onClick={logout}>
                <i className="bi bi-box-arrow-right"></i> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}