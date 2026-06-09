import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SECURITY_QUESTIONS = [
  { key: 'security_question_pet',      icon: 'bi-heart', label: 'Favorite Pet', placeholder: 'e.g. Max, Buddy, Whiskers' },
  { key: 'security_question_food',     icon: 'bi-egg-fried', label: 'Favorite Food', placeholder: 'e.g. Pizza, Ugali, Sushi' },
  { key: 'security_question_nickname', icon: 'bi-person-badge', label: 'Your Nickname', placeholder: 'e.g. Jaymo, Stacy' },
  { key: 'security_question_color',    icon: 'bi-palette', label: 'Favorite Color', placeholder: 'e.g. Blue, Emerald Green' },
];

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [form, setForm] = useState({
    identifier: '',
    password: '',
    email: '',
    phone: '',
    first_name: '',
    last_name: '',
    confirm_password: '',
    security_question_pet: '',
    security_question_food: '',
    security_question_nickname: '',
    security_question_color: '',
  });

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(form.identifier, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err?.non_field_errors?.[0] || err?.detail || 'Invalid credentials. Please try again.');
    } finally { setLoading(false); }
  };

  const handleRegisterStep1 = (e) => {
    e.preventDefault();
    setError('');
    if (!form.first_name || !form.last_name || !form.email || !form.password) {
      return setError('Please fill in all required fields.');
    }
    if (form.password !== form.confirm_password) {
      return setError('Passwords do not match.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setStep(2);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    const allSec = SECURITY_QUESTIONS.every(q => form[q.key].trim());
    if (!allSec) {
      setLoading(false);
      return setError('Please answer all security questions.');
    }
    try {
      const payload = {
        email: form.email,
        phone: form.phone,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
        confirm_password: form.confirm_password,
        security_question_pet: form.security_question_pet,
        security_question_food: form.security_question_food,
        security_question_nickname: form.security_question_nickname,
        security_question_color: form.security_question_color,
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      const msgs = Object.values(err || {}).flat();
      setError(msgs[0] || 'Registration failed. Please try again.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      {/* Hero Panel */}
      <div className="auth-hero">
        <div className="auth-hero-bg"></div>
        <div className="auth-hero-content">
          <div className="auth-hero-logo"><i className="bi bi-bank2"></i> Equity<span>Bank</span></div>
          <p className="auth-hero-tagline">
            Your money, your future. Smart banking built for everyday Kenyans.
          </p>
          <div className="auth-stats">
            <div className="auth-stat-item">
              <span className="auth-stat-val">5M+</span>
              <span className="auth-stat-lab">Customers</span>
            </div>
            <div className="auth-stat-item">
              <span className="auth-stat-val">KES 1T+</span>
              <span className="auth-stat-lab">Transactions</span>
            </div>
            <div className="auth-stat-item">
              <span className="auth-stat-val">99.9%</span>
              <span className="auth-stat-lab">Uptime</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-panel">
        <div className="auth-form-wrap">
          {mode === 'login' ? (
            <>
              <div className="auth-form-header">
                <h2 className="auth-form-title">Welcome back</h2>
                <p className="auth-form-subtitle">
                  Don't have an account?{' '}
                  <a className="auth-link" onClick={() => { setMode('register'); setStep(1); setError(''); }}>
                    Create one
                  </a>
                </p>
              </div>

              {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <label className="form-label">Email or Phone Number</label>
                  <div className="input-icon-wrap">
                    <i className="bi bi-person input-icon"></i>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="email@example.com or 0712345678"
                      value={form.identifier}
                      onChange={e => set('identifier', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Password</label>
                  <div className="input-icon-wrap" style={{ position: 'relative' }}>
                    <i className="bi bi-lock input-icon"></i>
                    <input
                      className="form-control"
                      type={showPass ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={e => set('password', e.target.value)}
                      required
                      style={{ paddingRight: '3rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(s => !s)}
                      style={{ position: 'absolute', right: '0.9rem', top: '50%', transform: 'translateY(-50%)', background: 'none', color: 'var(--text-muted)', fontSize: '1rem' }}
                    >
                      <i className={`bi bi-eye${showPass ? '-slash' : ''}`}></i>
                    </button>
                  </div>
                </div>

                <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Signing in...</> : <><i className="bi bi-box-arrow-in-right"></i> Sign In</>}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="auth-form-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  {step === 2 && (
                    <button onClick={() => setStep(1)} style={{ background: 'none', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
                      <i className="bi bi-arrow-left"></i>
                    </button>
                  )}
                  <h2 className="auth-form-title">{step === 1 ? 'Create account' : 'Security setup'}</h2>
                </div>
                <p className="auth-form-subtitle">
                  {step === 1
                    ? <>Already have an account? <a className="auth-link" onClick={() => { setMode('login'); setError(''); }}>Sign in</a></>
                    : 'These questions help us verify your identity if you ever need account recovery.'
                  }
                </p>
              </div>

              {/* Step indicators */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[1, 2].map(s => (
                  <div key={s} style={{
                    height: 4, flex: 1, borderRadius: 999,
                    background: step >= s ? 'var(--brand)' : 'var(--border)',
                    transition: 'background 0.3s'
                  }} />
                ))}
              </div>

              {error && <div className="alert alert-error"><i className="bi bi-exclamation-circle"></i>{error}</div>}

              {step === 1 ? (
                <form onSubmit={handleRegisterStep1}>
                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">First Name</label>
                      <input className="form-control" type="text" placeholder="John" value={form.first_name} onChange={e => set('first_name', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Last Name</label>
                      <input className="form-control" type="text" placeholder="Doe" value={form.last_name} onChange={e => set('last_name', e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-icon-wrap">
                      <i className="bi bi-envelope input-icon"></i>
                      <input className="form-control" type="email" placeholder="john@example.com" value={form.email} onChange={e => set('email', e.target.value)} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Phone Number <span style={{ color: 'var(--text-muted)' }}>(optional)</span></label>
                    <div className="input-icon-wrap">
                      <i className="bi bi-phone input-icon"></i>
                      <input className="form-control" type="tel" placeholder="0712 345 678" value={form.phone} onChange={e => set('phone', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input className="form-control" type="password" placeholder="Min. 6 characters" value={form.password} onChange={e => set('password', e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Confirm Password</label>
                      <input className="form-control" type="password" placeholder="Repeat password" value={form.confirm_password} onChange={e => set('confirm_password', e.target.value)} required />
                    </div>
                  </div>

                  <button className="btn btn-primary btn-block btn-lg" type="submit">
                    Continue <i className="bi bi-arrow-right"></i>
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister}>
                  <div className="security-section">
                    <div className="security-section-title">
                      <i className="bi bi-shield-lock"></i> Security Questions
                    </div>
                    <div className="security-grid">
                      {SECURITY_QUESTIONS.map(q => (
                        <div className="form-group" key={q.key} style={{ marginBottom: '0.75rem' }}>
                          <label className="form-label">
                            <i className={`bi ${q.icon}`} style={{ marginRight: 4, color: 'var(--accent-amber)' }}></i>
                            {q.label}
                          </label>
                          <input
                            className="form-control"
                            type="text"
                            placeholder={q.placeholder}
                            value={form[q.key]}
                            onChange={e => set(q.key, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="alert alert-info" style={{ marginBottom: '1.25rem' }}>
                    <i className="bi bi-info-circle"></i>
                    Keep these answers secret. They help recover your account.
                  </div>

                  <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                    {loading ? <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></span> Creating account...</> : <><i className="bi bi-check-circle"></i> Create Account</>}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}