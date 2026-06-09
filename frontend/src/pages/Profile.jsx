import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile, getAccounts } from '../services/api';

function formatCurrency(val) {
  return 'KES ' + Number(val || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 });
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getProfile(), getAccounts()]).then(([p, a]) => {
      setProfile(p.user);
      setAccounts(a);
      setForm({ first_name: p.user.first_name, last_name: p.user.last_name, phone: p.user.phone || '' });
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      const updated = await updateProfile(form);
      setProfile(updated);
      updateUser(updated);
      setEditing(false);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(Object.values(err || {}).flat()[0] || 'Update failed.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="page-container"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  const p = profile || user;
  const initials = p ? `${p.first_name?.[0] || ''}${p.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
        {!editing && (
          <button className="btn btn-outline" onClick={() => { setEditing(true); setSuccess(''); setError(''); }}>
            <i className="bi bi-pencil"></i> Edit Profile
          </button>
        )}
      </div>

      {success && <div className="alert alert-success"><i className="bi bi-check-circle"></i>{success}</div>}
      {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: Profile card */}
        <div>
          <div className="card mb-2">
            <div className="profile-header">
              <div className="profile-avatar-large">{initials}</div>
              <div>
                <div className="profile-info-name">{p?.first_name} {p?.last_name}</div>
                <div className="profile-info-email"><i className="bi bi-envelope" style={{ marginRight: 4 }}></i>{p?.email}</div>
                {p?.phone && <div className="profile-info-email"><i className="bi bi-phone" style={{ marginRight: 4 }}></i>{p.phone}</div>}
                <div className="profile-info-account">ACC: {p?.account_number}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge badge-success"><i className="bi bi-shield-check"></i> Verified</span>
              <span className="badge badge-blue"><i className="bi bi-person-check"></i> Active</span>
              <span className="badge badge-purple"><i className="bi bi-calendar3"></i> Since {new Date(p?.date_joined).getFullYear()}</span>
            </div>
          </div>

          {/* Accounts */}
          <div className="card">
            <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              <i className="bi bi-credit-card-2-front" style={{ color: 'var(--brand)', marginRight: 6 }}></i> My Accounts
            </h3>
            {accounts.map(a => (
              <div key={a.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '0.875rem', background: 'var(--bg-input)',
                borderRadius: 'var(--radius-sm)', marginBottom: '0.5rem'
              }}>
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {a.account_type} Account
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.currency} • {a.is_active ? 'Active' : 'Inactive'}</div>
                </div>
                <div style={{ fontFamily: 'Space Mono, monospace', fontWeight: 700, color: 'var(--brand)', fontSize: '0.95rem' }}>
                  {formatCurrency(a.balance)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Edit / Info */}
        <div>
          {editing ? (
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
                <i className="bi bi-pencil-square" style={{ color: 'var(--brand)', marginRight: 6 }}></i> Edit Information
              </h3>
              <form onSubmit={handleSave}>
                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input className="form-control" type="text" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input className="form-control" type="text" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-phone input-icon"></i>
                    <input className="form-control" type="tel" placeholder="0712 345 678" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn btn-secondary" type="button" onClick={() => setEditing(false)} style={{ flex: 1 }}>Cancel</button>
                  <button className="btn btn-primary" type="submit" disabled={saving} style={{ flex: 1 }}>
                    {saving ? 'Saving...' : <><i className="bi bi-check-lg"></i> Save Changes</>}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="card">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
                <i className="bi bi-person-lines-fill" style={{ color: 'var(--accent-blue)', marginRight: 6 }}></i> Account Details
              </h3>
              {[
                { label: 'Full Name',       value: `${p?.first_name} ${p?.last_name}`, icon: 'bi-person' },
                { label: 'Email',           value: p?.email,            icon: 'bi-envelope'        },
                { label: 'Phone',           value: p?.phone || 'Not set',icon: 'bi-phone'           },
                { label: 'Account Number',  value: p?.account_number,   icon: 'bi-credit-card'     },
                { label: 'Member Since',    value: new Date(p?.date_joined).toLocaleDateString('en-KE', { year: 'numeric', month: 'long', day: 'numeric' }), icon: 'bi-calendar3' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: 'var(--bg-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <i className={`bi ${row.icon}`}></i>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{row.label}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, fontFamily: row.label === 'Account Number' ? 'Space Mono, monospace' : 'inherit' }}>{row.value}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Security reminder */}
          <div className="card mt-2" style={{ background: 'var(--accent-amber-dim)', border: '1px solid var(--accent-amber)30' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <i className="bi bi-shield-lock" style={{ color: 'var(--accent-amber)', fontSize: '1.2rem' }}></i>
              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Security Tip</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Never share your password or security question answers with anyone. EquityBank staff will never ask for these.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}