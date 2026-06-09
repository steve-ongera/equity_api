import React, { useEffect, useState } from 'react';
import { getAccounts, deposit } from '../services/api';

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

const QUICK_AMOUNTS = [500, 1000, 2500, 5000, 10000, 20000];

export default function Deposit() {
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
    setLoading(true);
    try {
      const txn = await deposit(form.account_id, form.amount, form.description || 'Deposit');
      setSuccess(txn);
      setForm(f => ({ ...f, amount: '', description: '' }));
    } catch (err) {
      setError(err?.error || err?.detail || 'Deposit failed.');
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <div className="page-container">
        <div className="card" style={{ maxWidth: 440, margin: '3rem auto', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', color: 'var(--accent-green)', marginBottom: '1rem' }}>
            <i className="bi bi-check-circle-fill"></i>
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Deposit Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{formatCurrency(success.amount)} added to your account</p>
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
            <i className="bi bi-plus-circle"></i> Make Another Deposit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Deposit Funds</h1>
          <p className="page-subtitle">Add money to your account securely</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

          <div className="card mb-2">
            <div className="form-group">
              <label className="form-label">Deposit To</label>
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
            </div>

            {/* Quick amounts */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Quick Select</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {QUICK_AMOUNTS.map(amt => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => set('amount', amt)}
                    style={{
                      padding: '0.5rem',
                      background: Number(form.amount) === amt ? 'var(--accent-green-dim)' : 'var(--bg-input)',
                      border: `1.5px solid ${Number(form.amount) === amt ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: 'var(--radius-sm)',
                      color: Number(form.amount) === amt ? 'var(--brand)' : 'var(--text-secondary)',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'Space Mono, monospace',
                      transition: 'all 0.2s',
                    }}
                  >
                    {amt >= 1000 ? `${amt / 1000}K` : amt}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. Salary, Business income..."
                value={form.description}
                onChange={e => set('description', e.target.value)}
              />
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Processing...</> : <><i className="bi bi-download"></i> Deposit Funds</>}
          </button>
        </form>

        <div className="card" style={{ background: 'var(--accent-green-dim)', border: '1px solid var(--brand)30' }}>
          {selectedAccount && (
            <>
              <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>Account Summary</h4>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current Balance</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'Space Mono, monospace', color: 'var(--brand)' }}>
                  {formatCurrency(selectedAccount.balance)}
                </div>
              </div>
              {form.amount > 0 && (
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>After Deposit</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Space Mono, monospace', color: 'var(--text-primary)' }}>
                    {formatCurrency(Number(selectedAccount.balance) + Number(form.amount))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}