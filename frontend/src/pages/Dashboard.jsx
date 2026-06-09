import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboard } from '../services/api';

const TXN_ICONS = {
  deposit:    { icon: 'bi-download', bg: 'var(--accent-green-dim)',  color: 'var(--accent-green)' },
  withdrawal: { icon: 'bi-upload',   bg: 'var(--accent-red-dim)',    color: 'var(--accent-red)'   },
  send:       { icon: 'bi-send',     bg: 'var(--accent-blue-dim)',   color: 'var(--accent-blue)'  },
  receive:    { icon: 'bi-inbox',    bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)'},
  transfer:   { icon: 'bi-arrow-left-right', bg: 'var(--accent-amber-dim)', color: 'var(--accent-amber)' },
};

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-spinner"><div className="spinner"></div></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Balance',
      value: formatCurrency(data?.total_balance),
      icon: 'bi-wallet2',
      bg: 'var(--accent-green-dim)',
      color: 'var(--accent-green)',
      change: '+2.4%',
      up: true,
    },
    {
      label: 'Money In',
      value: formatCurrency(data?.total_in),
      icon: 'bi-graph-up-arrow',
      bg: 'var(--accent-blue-dim)',
      color: 'var(--accent-blue)',
      change: '+8.1%',
      up: true,
    },
    {
      label: 'Money Out',
      value: formatCurrency(data?.total_out),
      icon: 'bi-graph-down-arrow',
      bg: 'var(--accent-red-dim)',
      color: 'var(--accent-red)',
      change: '-3.2%',
      up: false,
    },
    {
      label: 'Accounts',
      value: data?.accounts?.length ?? 0,
      icon: 'bi-credit-card-2-front',
      bg: 'var(--accent-purple-dim)',
      color: 'var(--accent-purple)',
    },
  ];

  const quickActions = [
    { label: 'Send Money',  icon: 'bi-send',      path: '/send-money'   },
    { label: 'Deposit',     icon: 'bi-download',  path: '/deposit'      },
    { label: 'Withdraw',    icon: 'bi-upload',    path: '/withdraw'     },
    { label: 'Save',        icon: 'bi-piggy-bank',path: '/save'         },
  ];

  return (
    <div className="page-container">
      {/* Greeting */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.first_name} 👋</h1>
          <p className="page-subtitle">Here's your financial overview for today.</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/reports')}>
          <i className="bi bi-bar-chart-line"></i> View Reports
        </button>
      </div>

      {/* Account Card */}
      {data?.accounts?.[0] && (
        <div className="account-card mb-3">
          <div className="account-card-type">{data.accounts[0].account_type} account</div>
          <div className="account-card-balance">{formatCurrency(data.accounts[0].balance)}</div>
          <div className="account-card-number">
            {user?.account_number?.replace(/(\d{4})(?=\d)/g, '$1 ')}
          </div>
          <div className="account-card-name">{user?.first_name} {user?.last_name}</div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        {stats.map(s => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={`bi ${s.icon}`}></i>
            </div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            {s.change && (
              <div className={`stat-change ${s.up ? 'stat-up' : 'stat-down'}`}>
                <i className={`bi bi-arrow-${s.up ? 'up' : 'down'}-short`}></i>
                {s.change} this month
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Quick Actions</h3>
      <div className="quick-actions mb-3">
        {quickActions.map(a => (
          <button className="action-btn" key={a.path} onClick={() => navigate(a.path)}>
            <div className="action-btn-icon"><i className={`bi ${a.icon}`}></i></div>
            {a.label}
          </button>
        ))}
      </div>

      {/* Two column: accounts + recent transactions */}
      <div className="grid-2">
        {/* Accounts */}
        <div className="card">
          <div className="flex-between mb-2">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Accounts</h3>
            <a className="auth-link" style={{ fontSize: '0.8rem' }} onClick={() => navigate('/transactions')}>View all</a>
          </div>
          {data?.accounts?.map(acc => (
            <div key={acc.id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0.75rem', background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)',
              marginBottom: '0.5rem'
            }}>
              <div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{acc.account_type}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{acc.currency}</div>
              </div>
              <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '0.9rem', fontWeight: 700, color: 'var(--brand)' }}>
                {formatCurrency(acc.balance)}
              </div>
            </div>
          ))}
        </div>

        {/* Recent Transactions */}
        <div className="card">
          <div className="flex-between mb-2">
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>Recent Activity</h3>
            <a className="auth-link" style={{ fontSize: '0.8rem' }} onClick={() => navigate('/transactions')}>See all</a>
          </div>
          {data?.recent_transactions?.length === 0 && (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <i className="bi bi-inbox"></i>
              <p>No transactions yet</p>
            </div>
          )}
          {data?.recent_transactions?.map(txn => {
            const meta = TXN_ICONS[txn.transaction_type] || TXN_ICONS.transfer;
            const isCredit = ['deposit', 'receive'].includes(txn.transaction_type);
            return (
              <div className="txn-item" key={txn.id}>
                <div className="txn-icon" style={{ background: meta.bg, color: meta.color }}>
                  <i className={`bi ${meta.icon}`}></i>
                </div>
                <div className="txn-info">
                  <div className="txn-desc">{txn.description || txn.transaction_type}</div>
                  <div className="txn-date">{timeAgo(txn.created_at)}</div>
                </div>
                <div className={`txn-amount ${isCredit ? 'credit' : 'debit'}`}>
                  {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}