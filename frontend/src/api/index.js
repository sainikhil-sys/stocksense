import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh token on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
        localStorage.setItem('access_token', data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: () => api.post('/auth/logout/', { refresh: localStorage.getItem('refresh_token') }),
  forgotPassword: (email) => api.post('/auth/forgot-password/', { email }),
  resetPassword: (data) => api.post('/auth/reset-password/', data),
  me: () => api.get('/auth/me/'),
};

// ─── Profile ─────────────────────────────────────────────────────────────────
export const profileAPI = {
  get: () => api.get('/profile/'),
  setup: (data) => api.post('/profile/setup/', data),
  update: (data) => api.patch('/profile/update/', data),
  riskScore: () => api.get('/profile/risk-score/'),
};

// ─── Budget ──────────────────────────────────────────────────────────────────
export const budgetAPI = {
  current: () => api.get('/budget/current/'),
  history: () => api.get('/budget/history/'),
  save: (data) => api.post('/budget/', data),
  suggestions: () => api.get('/budget/suggestions/'),
  addTransaction: (data) => api.post('/transactions/', data),
  getTransactions: (params) => api.get('/transactions/', { params }),
  deleteTransaction: (id) => api.delete(`/transactions/${id}/`),
};

// ─── Goals ───────────────────────────────────────────────────────────────────
export const goalsAPI = {
  list: () => api.get('/goals/'),
  create: (data) => api.post('/goals/', data),
  update: (id, data) => api.patch(`/goals/${id}/`, data),
  delete: (id) => api.delete(`/goals/${id}/`),
  contribute: (id, amount) => api.post(`/goals/${id}/contribute/`, { amount }),
  plan: (id) => api.get(`/goals/${id}/plan/`),
};

// ─── Portfolio ───────────────────────────────────────────────────────────────
export const portfolioAPI = {
  overview: () => api.get('/portfolio/'),
  addHolding: (data) => api.post('/portfolio/holdings/', data),
  updateHolding: (id, data) => api.patch(`/portfolio/holdings/${id}/`, data),
  deleteHolding: (id) => api.delete(`/portfolio/holdings/${id}/`),
  netWorth: () => api.get('/portfolio/net-worth/'),
  allocation: () => api.get('/portfolio/allocation/'),
};

// ─── Stocks ──────────────────────────────────────────────────────────────────
export const stocksAPI = {
  search: (q) => api.get('/stocks/search/', { params: { q } }),
  detail: (symbol) => api.get(`/stocks/${symbol}/`),
  history: (symbol, period) => api.get(`/stocks/${symbol}/history/`, { params: { period } }),
  analysis: (symbol) => api.get(`/stocks/${symbol}/analysis/`),
  watchlist: () => api.get('/stocks/watchlist/'),
  addWatchlist: (symbol) => api.post('/stocks/watchlist/', { symbol }),
  removeWatchlist: (symbol) => api.delete(`/stocks/watchlist/${symbol}/`),
};

// ─── AI Assistant ─────────────────────────────────────────────────────────────
export const aiAPI = {
  chat: (message, sessionId) => api.post('/ai/chat/', { message, session_id: sessionId }),
  history: (sessionId) => api.get('/ai/chat/history/', { params: { session_id: sessionId } }),
  recommendations: () => api.get('/ai/recommendations/'),
  generateRecs: () => api.post('/ai/recommendations/generate/'),
  simulate: (data) => api.post('/ai/simulate/', data),
};
