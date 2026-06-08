const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Token management
export const getAccessToken = () => localStorage.getItem('access_token');
export const getRefreshToken = () => localStorage.getItem('refresh_token');
export const setTokens = (access, refresh) => {
  localStorage.setItem('access_token', access);
  if (refresh) localStorage.setItem('refresh_token', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

// Refresh access token silently
export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error('No refresh token');
  const res = await fetch(`${BASE_URL}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) throw new Error('Refresh failed');
  const data = await res.json();
  setTokens(data.access, data.refresh);
  return data.access;
};

// Core fetch wrapper with auto-refresh
const apiFetch = async (endpoint, options = {}, retry = true) => {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken();
      return apiFetch(endpoint, {
        ...options,
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
      }, false);
    } catch {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw err;
  }

  return res.json();
};

// Auth
export const login = (identifier, password) =>
  apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ identifier, password }),
  });

export const register = (data) =>
  apiFetch('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// Profile
export const getProfile = () => apiFetch('/profile/');
export const updateProfile = (data) =>
  apiFetch('/profile/update/', { method: 'PUT', body: JSON.stringify(data) });

// Dashboard
export const getDashboard = () => apiFetch('/dashboard/');

// Accounts
export const getAccounts = () => apiFetch('/accounts/');

// Transactions
export const getTransactions = (type) =>
  apiFetch(`/transactions/${type ? `?type=${type}` : ''}`);

// Operations
export const deposit = (account_id, amount, description) =>
  apiFetch('/deposit/', {
    method: 'POST',
    body: JSON.stringify({ account_id, amount, description }),
  });

export const withdraw = (account_id, amount, description) =>
  apiFetch('/withdraw/', {
    method: 'POST',
    body: JSON.stringify({ account_id, amount, description }),
  });

export const sendMoney = (from_account_id, recipient_account, amount, description) =>
  apiFetch('/send/', {
    method: 'POST',
    body: JSON.stringify({ from_account_id, recipient_account, amount, description }),
  });

// Savings
export const getSavings = () => apiFetch('/savings/');
export const createSavingsGoal = (data) =>
  apiFetch('/savings/', { method: 'POST', body: JSON.stringify(data) });
export const contributeSavings = (account_id, goal_id, amount) =>
  apiFetch('/savings/contribute/', {
    method: 'POST',
    body: JSON.stringify({ account_id, goal_id, amount }),
  });

// Reports
export const getReports = () => apiFetch('/reports/');