import React, { useEffect, useState } from 'react';
import { getReports } from '../services/api';

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

const REPORT_CARDS = [
  { key: 'deposit',    label: 'Total Deposits',     icon: 'bi-download',         bg: 'var(--accent-green-dim)',  color: 'var(--accent-green)'  },
  { key: 'withdrawal', label: 'Total Withdrawals',  icon: 'bi-upload',            bg: 'var(--accent-red-dim)',    color: 'var(--accent-red)'    },
  { key: 'send',       label: 'Money Sent',         icon: 'bi-send',              bg: 'var(--accent-blue-dim)',   color: 'var(--accent-blue)'   },
  { key: 'receive',    label: 'Money Received',     icon: 'bi-inbox-fill',        bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' },
];

function SimpleBar({ data, maxVal }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {data.map((item, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
              {item.month} — <span style={{ textTransform: 'capitalize', color: 'var(--text-muted)' }}>{item.type}</span>
            </span>
            <span style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-primary)', fontSize: '0.72rem' }}>
              {formatCurrency(item.total)}
            </span>
          </div>
          <div style={{ background: 'var(--bg-input)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              borderRadius: 999,
              width: `${maxVal > 0 ? (item.total / maxVal) * 100 : 0}%`,
              background: item.type === 'deposit' || item.type === 'receive'
                ? 'linear-gradient(90deg, var(--accent-green), var(--brand))'
                : 'linear-gradient(90deg, var(--accent-red), var(--accent-amber))',
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReports().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  const byType = data?.by_type || {};
  const monthly = data?.monthly || [];
  const maxMonthly = Math.max(...monthly.map(m => m.total), 1);

  const netFlow = (byType.deposit?.total || 0) + (byType.receive?.total || 0)
                - (byType.withdrawal?.total || 0) - (byType.send?.total || 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Overview of your banking activity</p>
        </div>
        <span className={`badge ${netFlow >= 0 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>
          <i className={`bi bi-arrow-${netFlow >= 0 ? 'up' : 'down'}-circle`}></i>
          Net: {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="report-grid">
        {REPORT_CARDS.map(c => (
          <div className="report-card" key={c.key}>
            <div className="report-card-icon" style={{ background: c.bg, color: c.color }}>
              <i className={`bi ${c.icon}`}></i>
            </div>
            <div className="report-card-label">{c.label}</div>
            <div className="report-card-value">{formatCurrency(byType[c.key]?.total)}</div>
            <div className="report-card-count">{byType[c.key]?.count || 0} transactions</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Net Flow Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            <i className="bi bi-pie-chart" style={{ color: 'var(--brand)', marginRight: 6 }}></i> Flow Breakdown
          </h3>
          {REPORT_CARDS.map(c => {
            const total = byType[c.key]?.total || 0;
            const allTotals = REPORT_CARDS.reduce((s, x) => s + (byType[x.key]?.total || 0), 0);
            const pct = allTotals > 0 ? ((total / allTotals) * 100).toFixed(1) : 0;
            return (
              <div key={c.key} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', fontSize: '0.8rem' }}>
                  <span style={{ color: c.color, fontWeight: 600 }}>
                    <i className={`bi ${c.icon}`} style={{ marginRight: 4 }}></i>{c.label}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>{pct}%</span>
                </div>
                <div style={{ background: 'var(--bg-input)', borderRadius: 999, height: 10, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    background: c.color, width: `${pct}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontFamily: 'Space Mono, monospace' }}>
                  {formatCurrency(total)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Monthly Activity */}
        <div className="card">
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            <i className="bi bi-bar-chart-line" style={{ color: 'var(--accent-blue)', marginRight: 6 }}></i> Monthly Activity
          </h3>
          {monthly.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem' }}>
              <i className="bi bi-bar-chart-line"></i>
              <p>No monthly data yet</p>
            </div>
          ) : (
            <SimpleBar data={monthly.slice(0, 12)} maxVal={maxMonthly} />
          )}
        </div>
      </div>

      {/* Transaction count summary */}
      <div className="card mt-2">
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          <i className="bi bi-list-check" style={{ color: 'var(--accent-amber)', marginRight: 6 }}></i> Transaction Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1rem' }}>
          {REPORT_CARDS.map(c => (
            <div key={c.key} style={{ textAlign: 'center', padding: '1rem', background: c.bg, borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: c.color, fontFamily: 'Space Mono, monospace' }}>
                {byType[c.key]?.count || 0}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}