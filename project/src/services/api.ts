import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ?? '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('veritas_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('veritas_token');
    }
    return Promise.reject(error);
  },
);

export const endpoints = {
  auth: {
    login: (email: string, password: string) =>
      api.post('/auth/login', { email, password }),
    register: (email: string, password: string, name: string) =>
      api.post('/auth/register', { email, password, name }),
    profile: () => api.get('/auth/profile'),
  },
  dashboard: {
    summary: () => api.get('/dashboard/summary'),
  },
  trends: {
    list: () => api.get('/trends'),
    top: () => api.get('/trends/top'),
    details: (id: string) => api.get(`/trends/${id}`),
  },
  detection: {
    analyze: (text: string) => api.post('/detection/analyze', { text }),
    history: () => api.get('/detection/history'),
  },
  model: {
    health: () => api.get('/model/health'),
  },
};
