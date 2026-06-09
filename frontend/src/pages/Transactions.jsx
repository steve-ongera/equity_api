import React, { useEffect, useState } from 'react';
import { getTransactions } from '../services/api';

const TXN_META = {
  deposit:    { icon: 'bi-download',         bg: 'var(--accent-green-dim)',  color: 'var(--accent-green)',  label: 'Deposit'     },
  withdrawal: { icon: 'bi-upload',           bg: 'var(--accent-red-dim)',    color: 'var(--accent-red)',    label: 'Withdrawal'  },
  send:       { icon: 'bi-send',             bg: 'var(--accent-blue-dim)',   color: 'var(--accent-blue)',   label: 'Sent'        },
  receive:    { icon: 'bi-inbox-fill',       bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)', label: 'Received'    },
  transfer:   { icon: 'bi-arrow-left-right', bg: 'var(--accent-amber-dim)',  color: 'var(--accent-amber)',  label: 'Transfer'    },
};

const FILTERS = ['all', 'deposit', 'withdrawal', 'send', 'receive'];

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

function formatDate(str) {
  return new Date(str).toLocaleDateString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

export default function Transactions() {
  const [txns, setTxns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const load = async (type) => {
    setLoading(true);
    try {
      const data = await getTransactions(type === 'all' ? null : type);
      setTxns(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(filter); }, [filter]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Your complete transaction history</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 999,
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              border: '1.5px solid',
              borderColor: filter === f ? 'var(--brand)' : 'var(--border)',
              background: filter === f ? 'var(--accent-green-dim)' : 'var(--bg-card)',
              color: filter === f ? 'var(--brand)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              textTransform: 'capitalize',
            }}
          >
            {f === 'all' ? 'All' : TXN_META[f]?.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : txns.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="bi bi-inbox"></i>
            <p>No transactions found</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Balance After</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {txns.map(txn => {
                const meta = TXN_META[txn.transaction_type] || TXN_META.transfer;
                const isCredit = ['deposit', 'receive'].includes(txn.transaction_type);
                return (
                  <tr key={txn.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: meta.bg, color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                          <i className={`bi ${meta.icon}`}></i>
                        </div>
                        <span style={{ fontSize: '0.82rem', fontWeight: 600, color: meta.color, textTransform: 'capitalize' }}>
                          {meta.label}
                        </span>
                      </div>
                    </td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {txn.description || '—'}
                    </td>
                    <td><span className="text-mono" style={{ fontSize: '0.75rem' }}>{txn.reference}</span></td>
                    <td>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: isCredit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                        {isCredit ? '+' : '-'}{formatCurrency(txn.amount)}
                      </span>
                    </td>
                    <td><span className="text-mono" style={{ fontSize: '0.8rem' }}>{formatCurrency(txn.balance_after)}</span></td>
                    <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>{formatDate(txn.created_at)}</td>
                    <td>
                      <span className={`badge badge-${txn.status === 'completed' ? 'success' : txn.status === 'failed' ? 'danger' : 'amber'}`}>
                        <i className={`bi bi-${txn.status === 'completed' ? 'check-circle' : txn.status === 'failed' ? 'x-circle' : 'clock'}`}></i>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}