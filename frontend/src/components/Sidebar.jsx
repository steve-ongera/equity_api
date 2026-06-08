import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', icon: 'bi-grid-1x2', label: 'Dashboard' },
  { path: '/transactions', icon: 'bi-arrow-left-right', label: 'Transactions' },
  { path: '/send-money', icon: 'bi-send', label: 'Send Money' },
  { path: '/deposit', icon: 'bi-download', label: 'Deposit' },
  { path: '/withdraw', icon: 'bi-upload', label: 'Withdraw' },
  { path: '/save', icon: 'bi-piggy-bank', label: 'Savings' },
  { path: '/reports', icon: 'bi-bar-chart-line', label: 'Reports' },
  { path: '/profile', icon: 'bi-person-circle', label: 'Profile' },
  { path: '/settings', icon: 'bi-gear', label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNav = (path) => {
    navigate(path);
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-logo">
            <i className="bi bi-bank2"></i> EquityBank
          </span>
          <button className="sidebar-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">MENU</p>
          {navItems.slice(0, 7).map(item => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
              {location.pathname === item.path && <span className="active-indicator"></span>}
            </button>
          ))}

          <p className="nav-section-label" style={{ marginTop: '1.5rem' }}>ACCOUNT</p>
          {navItems.slice(7).map(item => (
            <button
              key={item.path}
              className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNav(item.path)}
            >
              <i className={`bi ${item.icon}`}></i>
              <span>{item.label}</span>
              {location.pathname === item.path && <span className="active-indicator"></span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-badge">
            <i className="bi bi-shield-check"></i>
            <div>
              <span className="badge-title">Secured</span>
              <span className="badge-sub">256-bit encryption</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}