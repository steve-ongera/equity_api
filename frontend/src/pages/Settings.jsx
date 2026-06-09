import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();

  const [notifications, setNotifications] = useState({
    transactions: true,
    login: true,
    promotions: false,
    reports: true,
  });

  const [security, setSecurity] = useState({
    twoFactor: false,
    loginAlerts: true,
    sessionTimeout: true,
  });

  const [saved, setSaved] = useState(false);

  const toggle = (group, key) => {
    if (group === 'notifications') setNotifications(s => ({ ...s, [key]: !s[key] }));
    else setSecurity(s => ({ ...s, [key]: !s[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const Toggle = ({ checked, onChange }) => (
    <label className="toggle">
      <input type="checkbox" checked={checked} onChange={onChange} />
      <span className="toggle-slider"></span>
    </label>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your preferences and security</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave}>
          {saved ? <><i className="bi bi-check-lg"></i> Saved!</> : <><i className="bi bi-floppy"></i> Save Changes</>}
        </button>
      </div>

      {saved && <div className="alert alert-success"><i className="bi bi-check-circle"></i> Settings saved successfully.</div>}

      {/* Appearance */}
      <div className="settings-section">
        <div className="settings-section-header">
          <i className="bi bi-palette" style={{ color: 'var(--brand)' }}></i>
          <span className="settings-section-title">Appearance</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-label">Dark Mode</span>
            <span className="settings-row-desc">Switch between light and dark interface</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <i className={`bi bi-${theme === 'dark' ? 'moon-stars' : 'sun'}`}></i> {theme === 'dark' ? 'Dark' : 'Light'}
            </span>
            <label className="toggle">
              <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-label">Language</span>
            <span className="settings-row-desc">Select your preferred language</span>
          </div>
          <select className="form-control form-select" style={{ width: 'auto', minWidth: 130, padding: '0.45rem 2.5rem 0.45rem 0.75rem' }}>
            <option>English</option>
            <option>Swahili</option>
          </select>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-label">Currency Display</span>
            <span className="settings-row-desc">Choose your default currency</span>
          </div>
          <select className="form-control form-select" style={{ width: 'auto', minWidth: 130, padding: '0.45rem 2.5rem 0.45rem 0.75rem' }}>
            <option>KES — Kenyan Shilling</option>
            <option>USD — US Dollar</option>
            <option>EUR — Euro</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-section">
        <div className="settings-section-header">
          <i className="bi bi-bell" style={{ color: 'var(--accent-blue)' }}></i>
          <span className="settings-section-title">Notifications</span>
        </div>
        {[
          { key: 'transactions', label: 'Transaction Alerts', desc: 'Get notified for every debit/credit on your account' },
          { key: 'login',        label: 'Login Notifications', desc: 'Receive alerts when your account is accessed' },
          { key: 'reports',      label: 'Monthly Reports', desc: 'Receive monthly spending and savings summary' },
          { key: 'promotions',   label: 'Promotions & Offers', desc: 'EquityBank product updates and special offers' },
        ].map(row => (
          <div className="settings-row" key={row.key}>
            <div className="settings-row-left">
              <span className="settings-row-label">{row.label}</span>
              <span className="settings-row-desc">{row.desc}</span>
            </div>
            <Toggle checked={notifications[row.key]} onChange={() => toggle('notifications', row.key)} />
          </div>
        ))}
      </div>

      {/* Security */}
      <div className="settings-section">
        <div className="settings-section-header">
          <i className="bi bi-shield-lock" style={{ color: 'var(--accent-amber)' }}></i>
          <span className="settings-section-title">Security</span>
        </div>
        {[
          { key: 'twoFactor',      label: 'Two-Factor Authentication', desc: 'Require OTP code for every login' },
          { key: 'loginAlerts',    label: 'Login Alerts',              desc: 'Be notified of any new login from unknown devices' },
          { key: 'sessionTimeout', label: 'Auto Session Timeout',      desc: 'Automatically log out after 1 minute of inactivity' },
        ].map(row => (
          <div className="settings-row" key={row.key}>
            <div className="settings-row-left">
              <span className="settings-row-label">{row.label}</span>
              <span className="settings-row-desc">{row.desc}</span>
            </div>
            <Toggle checked={security[row.key]} onChange={() => toggle('security', row.key)} />
          </div>
        ))}

        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-label">Change Password</span>
            <span className="settings-row-desc">Update your account password</span>
          </div>
          <button className="btn btn-secondary btn-sm">
            <i className="bi bi-key"></i> Change
          </button>
        </div>
      </div>

      {/* Danger zone */}
      <div className="settings-section" style={{ borderColor: 'var(--accent-red)30' }}>
        <div className="settings-section-header" style={{ borderColor: 'var(--accent-red)30' }}>
          <i className="bi bi-exclamation-triangle" style={{ color: 'var(--accent-red)' }}></i>
          <span className="settings-section-title" style={{ color: 'var(--accent-red)' }}>Danger Zone</span>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-label">Log Out</span>
            <span className="settings-row-desc">Sign out of your current session</span>
          </div>
          <button className="btn btn-danger btn-sm" onClick={logout}>
            <i className="bi bi-box-arrow-right"></i> Log Out
          </button>
        </div>
        <div className="settings-row">
          <div className="settings-row-left">
            <span className="settings-row-label" style={{ color: 'var(--accent-red)' }}>Close Account</span>
            <span className="settings-row-desc">Permanently close your EquityBank account</span>
          </div>
          <button className="btn btn-danger btn-sm">
            <i className="bi bi-trash3"></i> Close Account
          </button>
        </div>
      </div>

      {/* App Info */}
      <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
        <i className="bi bi-bank2" style={{ color: 'var(--brand)', fontSize: '1.5rem', display: 'block', marginBottom: '0.5rem' }}></i>
        <div style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>EquityBank Digital</div>
        <div>Version 2.4.1 • Built with ❤️ in Nairobi, Kenya</div>
        <div style={{ marginTop: '0.5rem' }}>
          <a href="#" style={{ color: 'var(--brand)', marginRight: '1rem' }}>Privacy Policy</a>
          <a href="#" style={{ color: 'var(--brand)', marginRight: '1rem' }}>Terms of Service</a>
          <a href="#" style={{ color: 'var(--brand)' }}>Help Center</a>
        </div>
      </div>
    </div>
  );
}