import React, { useEffect, useState } from 'react';
import { getSavings, createSavingsGoal, contributeSavings, getAccounts } from '../services/api';

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

export default function Save() {
  const [goals, setGoals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showContribute, setShowContribute] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: '', target_amount: '', deadline: '' });
  const [contribForm, setContribForm] = useState({ account_id: '', amount: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [g, a] = await Promise.all([getSavings(), getAccounts()]);
      setGoals(g); setAccounts(a);
      if (a.length) setContribForm(f => ({ ...f, account_id: a[0].id }));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await createSavingsGoal(form);
      setForm({ name: '', target_amount: '', deadline: '' });
      setShowCreate(false);
      setSuccess('Savings goal created!');
      load();
    } catch (err) {
      setError(Object.values(err || {}).flat()[0] || 'Failed to create goal.');
    } finally { setSubmitting(false); }
  };

  const handleContribute = async (e) => {
    e.preventDefault();
    setError(''); setSubmitting(true);
    try {
      await contributeSavings(contribForm.account_id, showContribute.id, contribForm.amount);
      setShowContribute(null);
      setSuccess('Contribution added!');
      setContribForm(f => ({ ...f, amount: '' }));
      load();
    } catch (err) {
      setError(err?.error || Object.values(err || {}).flat()[0] || 'Contribution failed.');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Savings Goals</h1>
          <p className="page-subtitle">Track and grow your savings</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowCreate(true); setError(''); }}>
          <i className="bi bi-plus-circle"></i> New Goal
        </button>
      </div>

      {success && <div className="alert alert-success mb-2"><i className="bi bi-check-circle"></i>{success}</div>}
      {error && <div className="alert alert-error mb-2"><i className="bi bi-exclamation-circle"></i>{error}</div>}

      {/* Create Goal Modal */}
      {showCreate && (
        <div className="session-overlay" onClick={() => setShowCreate(false)}>
          <div className="session-modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'left', marginBottom: '1.25rem' }}><i className="bi bi-piggy-bank" style={{ color: 'var(--brand)', marginRight: 8 }}></i> New Savings Goal</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Goal Name</label>
                <input className="form-control" type="text" placeholder="e.g. Holiday, Car, Emergency Fund" value={form.name} onChange={e => set('name', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Target Amount (KES)</label>
                <input className="form-control" type="number" placeholder="0.00" min="1" step="0.01" value={form.target_amount} onChange={e => set('target_amount', e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Deadline <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                <input className="form-control" type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} min={new Date().toISOString().split('T')[0]} />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowCreate(false)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Modal */}
      {showContribute && (
        <div className="session-overlay" onClick={() => setShowContribute(null)}>
          <div className="session-modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <h3 style={{ textAlign: 'left', marginBottom: '0.5rem' }}><i className="bi bi-plus-circle" style={{ color: 'var(--brand)', marginRight: 8 }}></i> Contribute</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{showContribute.name}</p>
            <form onSubmit={handleContribute}>
              <div className="form-group">
                <label className="form-label">From Account</label>
                <select className="form-control form-select" value={contribForm.account_id} onChange={e => setContribForm(f => ({ ...f, account_id: e.target.value }))}>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.account_type} — {formatCurrency(a.balance)}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Amount (KES)</label>
                <input className="form-control" type="number" placeholder="0.00" min="1" step="0.01" value={contribForm.amount} onChange={e => setContribForm(f => ({ ...f, amount: e.target.value }))} required />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                <button className="btn btn-secondary" type="button" onClick={() => setShowContribute(null)} style={{ flex: 1 }}>Cancel</button>
                <button className="btn btn-primary" type="submit" disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? 'Saving...' : 'Add Funds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner"><div className="spinner"></div></div>
      ) : goals.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <i className="bi bi-piggy-bank"></i>
            <p>No savings goals yet</p>
            <button className="btn btn-outline btn-sm" onClick={() => setShowCreate(true)}>Create your first goal</button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {goals.map(goal => (
            <div className="goal-card" key={goal.id}>
              <div className="goal-header">
                <div>
                  <div className="goal-name">{goal.name}</div>
                  {goal.deadline && (
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      <i className="bi bi-calendar3"></i> {new Date(goal.deadline).toLocaleDateString('en-KE')}
                    </div>
                  )}
                </div>
                <span className={`badge goal-badge ${goal.is_completed ? 'badge-success' : 'badge-amber'}`}>
                  {goal.is_completed ? 'Completed' : `${Math.round(goal.progress_percentage)}%`}
                </span>
              </div>

              <div className="progress-wrap">
                <div className="progress-bar" style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}></div>
              </div>

              <div className="goal-amounts">
                <span>{formatCurrency(goal.current_amount)} saved</span>
                <span>Target: {formatCurrency(goal.target_amount)}</span>
              </div>

              {!goal.is_completed && (
                <button
                  className="btn btn-outline btn-sm btn-block"
                  style={{ marginTop: '0.75rem' }}
                  onClick={() => { setShowContribute(goal); setError(''); }}
                >
                  <i className="bi bi-plus-circle"></i> Add Funds
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}