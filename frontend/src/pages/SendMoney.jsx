import React, { useEffect, useState } from 'react';
import { getAccounts, sendMoney } from '../services/api';

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

export default function SendMoney() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ from_account_id: '', recipient_account: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts().then(data => {
      setAccounts(data);
      if (data.length) setForm(f => ({ ...f, from_account_id: data[0].id }));
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedAccount = accounts.find(a => a.id === form.from_account_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(null);
    if (!form.recipient_account.trim()) return setError('Please enter recipient account number.');
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount.');
    if (selectedAccount && Number(form.amount) > Number(selectedAccount.balance)) return setError('Insufficient funds.');
    setLoading(true);
    try {
      const txn = await sendMoney(form.from_account_id, form.recipient_account, form.amount, form.description || 'Send Money');
      setSuccess(txn);
      setForm(f => ({ ...f, recipient_account: '', amount: '', description: '' }));
    } catch (err) {
      setError(err?.error || err?.detail || Object.values(err || {}).flat()[0] || 'Transfer failed.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 480, margin: '3rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', color: 'var(--accent-green)', marginBottom: '1rem' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Transfer Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {formatCurrency(success.amount)} sent to {success.recipient_name || success.recipient_account}
          </p>
          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reference</span>
              <span className="text-mono" style={{ color: 'var(--text-primary)' }}>{success.reference}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>New Balance</span>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{formatCurrency(success.balance_after)}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setSuccess(null)}>
            <i className="bi bi-arrow-repeat"></i> New Transfer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Send Money</h1>
          <p className="page-subtitle">Transfer funds to any EquityBank account instantly</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <i className="bi bi-wallet2" style={{ color: 'var(--brand)', marginRight: 6 }}></i> From Account
            </h3>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Account</label>
              <select
                className="form-control form-select"
                value={form.from_account_id}
                onChange={e => set('from_account_id', e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)} — {formatCurrency(a.balance)}
                  </option>
                ))}
              </select>
            </div>
            {selectedAccount && (
              <div style={{ marginTop: '0.75rem', padding: '0.6rem 0.75rem', background: 'var(--accent-green-dim)', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem', color: 'var(--accent-green)' }}>
                <i className="bi bi-info-circle"></i> Available: <strong>{formatCurrency(selectedAccount.balance)}</strong>
              </div>
            )}
          </div>

          <div className="card" style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <i className="bi bi-person-check" style={{ color: 'var(--accent-blue)', marginRight: 6 }}></i> Recipient
            </h3>
            <div className="form-group">
              <label className="form-label">Account Number</label>
              <div className="input-icon-wrap">
                <i className="bi bi-person input-icon"></i>
                <input
                  className="form-control"
                  type="text"
                  placeholder="12-digit account number"
                  maxLength={12}
                  value={form.recipient_account}
                  onChange={e => set('recipient_account', e.target.value.replace(/\D/g, ''))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (KES)</label>
              <div className="input-icon-wrap">
                <i className="bi bi-currency-exchange input-icon"></i>
                <input
                  className="form-control"
                  type="number"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Rent, Business payment..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Sending...</> : <><i className="bi bi-send-fill"></i> Send Money</>}
          </button>
        </form>

        {/* Info Panel */}
        <div>
          <div className="card" style={{ marginBottom: '1rem', background: 'linear-gradient(135deg, var(--accent-blue-dim), var(--accent-purple-dim))' }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Transfer Limits</h4>
            {[
              { label: 'Per Transaction', value: 'KES 150,000' },
              { label: 'Daily Limit',     value: 'KES 300,000' },
              { label: 'Monthly Limit',   value: 'KES 2,000,000' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{l.label}</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, fontFamily: 'Space Mono, monospace', color: 'var(--text-primary)' }}>{l.value}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <i className="bi bi-shield-check" style={{ color: 'var(--brand)', fontSize: '1.2rem' }}></i>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Secured Transfer</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              All transfers are encrypted with 256-bit SSL and processed in real time. Funds are credited instantly to EquityBank accounts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}