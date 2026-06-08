import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, refreshAccessToken, clearTokens, setTokens, getAccessToken, getRefreshToken } from '../services/api';

const AuthContext = createContext(null);

const SESSION_TIMEOUT = 60 * 1000; // 1 minute
const WARNING_BEFORE = 15 * 1000;  // warn 15s before

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [countdown, setCountdown] = useState(15);

  const timeoutRef = useRef(null);
  const warningRef = useRef(null);
  const countdownRef = useRef(null);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setShowTimeoutWarning(false);
  }, []);

  const clearAllTimers = () => {
    clearTimeout(timeoutRef.current);
    clearTimeout(warningRef.current);
    clearInterval(countdownRef.current);
  };

  const startSessionTimer = useCallback(() => {
    clearAllTimers();
    setShowTimeoutWarning(false);

    // Show warning 15s before logout
    warningRef.current = setTimeout(() => {
      setShowTimeoutWarning(true);
      setCountdown(15);
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, SESSION_TIMEOUT - WARNING_BEFORE);

    // Auto logout
    timeoutRef.current = setTimeout(() => {
      logout();
    }, SESSION_TIMEOUT);
  }, [logout]);

  const continueSession = useCallback(async () => {
    setShowTimeoutWarning(false);
    clearAllTimers();
    try {
      await refreshAccessToken();
      startSessionTimer();
    } catch {
      logout();
    }
  }, [startSessionTimer, logout]);

  // Reset timer on user activity
  const resetActivity = useCallback(() => {
    if (user) startSessionTimer();
  }, [user, startSessionTimer]);

  useEffect(() => {
    if (!user) { clearAllTimers(); return; }
    startSessionTimer();
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handler = () => {
      if (!showTimeoutWarning) resetActivity();
    };
    events.forEach(e => window.addEventListener(e, handler));
    return () => {
      clearAllTimers();
      events.forEach(e => window.removeEventListener(e, handler));
    };
  }, [user, startSessionTimer, resetActivity, showTimeoutWarning]);

  const login = async (identifier, password) => {
    const data = await apiLogin(identifier, password);
    setTokens(data.access, data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    startSessionTimer();
    return data;
  };

  const register = async (formData) => {
    const data = await apiRegister(formData);
    setTokens(data.access, data.refresh);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    startSessionTimer();
    return data;
  };

  const updateUser = (updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('user', JSON.stringify(merged));
    setUser(merged);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
      {showTimeoutWarning && (
        <div className="session-overlay">
          <div className="session-modal">
            <div className="session-icon"><i className="bi bi-clock-history"></i></div>
            <h3>Session Expiring</h3>
            <p>You'll be logged out in <span className="countdown">{countdown}s</span></p>
            <p className="session-sub">Do you want to continue your session?</p>
            <div className="session-actions">
              <button className="btn-continue" onClick={continueSession}>
                <i className="bi bi-arrow-clockwise"></i> Continue Session
              </button>
              <button className="btn-logout-now" onClick={logout}>
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};