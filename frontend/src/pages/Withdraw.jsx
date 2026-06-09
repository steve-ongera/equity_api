import React, { useEffect, useState } from 'react';
import { getAccounts, withdraw } from '../services/api';

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 20000];

export default function Withdraw() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ account_id: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getAccounts().then(data => {
      setAccounts(data);
      if (data.length) setForm(f => ({ ...f, account_id: data[0].id }));
    });
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const selectedAccount = accounts.find(a => a.id === form.account_id);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(null);
    if (!form.amount || Number(form.amount) <= 0) return setError('Enter a valid amount.');
    if (selectedAccount && Number(form.amount) > Number(selectedAccount.balance)) return setError('Insufficient funds in selected account.');
    setLoading(true);
    try {
      const txn = await withdraw(form.account_id, form.amount, form.description || 'Withdrawal');
      setSuccess(txn);
      setForm(f => ({ ...f, amount: '', description: '' }));
    } catch (err) {
      setError(err?.error || err?.detail || 'Withdrawal failed.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 440, margin: '3rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', color: 'var(--accent-green)', marginBottom: '1rem' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Withdrawal Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{formatCurrency(success.amount)} withdrawn from your account</p>
          <div style={{ background: 'var(--bg-input)', borderRadius: 'var(--radius-sm)', padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Reference</span>
              <span className="text-mono">{success.reference}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>New Balance</span>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{formatCurrency(success.balance_after)}</span>
            </div>
          </div>
          <button className="btn btn-primary btn-block" onClick={() => setSuccess(null)}>
            <i className="bi bi-arrow-repeat"></i> New Withdrawal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Withdraw Funds</h1>
          <p className="page-subtitle">Withdraw cash from your account</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

          <div className="card mb-2">
            <div className="form-group">
              <label className="form-label">Withdraw From</label>
              <select
                className="form-control form-select"
                value={form.account_id}
                onChange={e => set('account_id', e.target.value)}
              >
                {accounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)} — {formatCurrency(a.balance)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Amount (KES)</label>
              <div className="input-icon-wrap">
                <i className="bi bi-currency-exchange input-icon"></i>
                <input
                  className="form-control"
                  type="number"
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  required
                />
              </div>
              {selectedAccount && (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  Available: <strong style={{ color: 'var(--brand)' }}>{formatCurrency(selectedAccount.balance)}</strong>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Quick Select</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => set('amount', amt)}
                    disabled={selectedAccount && amt > Number(selectedAccount.balance)}
                    style={{
                      padding: '0.5rem',
                      background: Number(form.amount) === amt ? 'var(--accent-green-dim)' : 'var(--bg-input)',
                      border: `1.5px solid ${Number(form.amount) === amt ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: Number(form.amount) === amt ? 'var(--brand)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: selectedAccount && amt > Number(selectedAccount.balance) ? 'not-allowed' : 'pointer',
                      fontFamily: 'Space Mono, monospace',
                      opacity: selectedAccount && amt > Number(selectedAccount.balance) ? 0.4 : 1,
                      transition: 'all 0.2s',
                    }}
                  >
                    {amt >= 1000 ? `${amt / 1000}K` : amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. ATM, Cash at counter..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Processing...</> : <><i className="bi bi-upload"></i> Withdraw Funds</>}
          </button>
        </form>

        <div>
          <div className="card mb-2" style={{ background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)30' }}>
            {selectedAccount && (
              <>
                <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>Balance Preview</h4>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Balance</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Space Mono, monospace', color: 'var(--text-primary)' }}>
                    {formatCurrency(selectedAccount.balance)}
                  </div>
                </div>
                {form.amount > 0 && (
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>After Withdrawal</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Space Mono, monospace', color: Number(form.amount) > Number(selectedAccount.balance) ? 'var(--accent-red)' : 'var(--accent-green)' }}>
                      {formatCurrency(Math.max(0, Number(selectedAccount.balance) - Number(form.amount)))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <i className="bi bi-info-circle" style={{ color: 'var(--accent-blue)', fontSize: '1.2rem' }}></i>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Withdrawal Info</span>
            </div>
            {[
              { label: 'Min Withdrawal', value: 'KES 100' },
              { label: 'Max per day',    value: 'KES 150,000' },
              { label: 'Processing',     value: 'Instant' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border)', fontSize: '0.8rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>{l.label}</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{l.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}