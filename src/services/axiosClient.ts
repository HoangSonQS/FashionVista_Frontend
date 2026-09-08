import axios from 'axios';
import { clearAuthSession, getAccessToken, setAuthSession } from './authSession';
import type { AuthResponse, User } from '../types/auth';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8085/api';

export const axiosClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type AuthKind = 'user' | 'admin';

let refreshPromise: Promise<string> | null = null;

const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    return payload.exp ? Date.now() >= payload.exp * 1000 : false;
  } catch {
    return true;
  }
};

const inferKind = (url?: string): AuthKind => (url?.includes('/admin/') ? 'admin' : 'user');

const refreshAccessToken = async (kind: AuthKind): Promise<string> => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post<AuthResponse>(`${baseURL}/v1/auth/refresh`, {}, { withCredentials: true })
      .then((response) => {
        const token = response.data.accessToken || response.data.token;
        if (!token) throw new Error('Refresh response missing access token.');
        setAuthSession(kind, { ...response.data, token, accessToken: token });
        return token;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

export const bootstrapAuthSession = async (kind: AuthKind = 'user'): Promise<boolean> => {
  try {
    const token = await refreshAccessToken(kind);
    const me = await axios.get<User>(`${baseURL}/v1/auth/me`, {
      withCredentials: true,
      headers: { Authorization: `Bearer ${token}` },
    });
    const role = String(me.data.role || '');
    if (kind === 'admin' && role !== 'ADMIN' && role !== 'STAFF') {
      clearAuthSession(kind);
      return false;
    }
    setAuthSession(kind, { token, accessToken: token, user: me.data });
    return true;
  } catch {
    clearAuthSession(kind);
    return false;
  }
};

export const logoutSession = async (kind: AuthKind = 'user') => {
  try {
    await axiosClient.post('/v1/auth/logout');
  } finally {
    clearAuthSession(kind);
  }
};

axiosClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const normalized = (config.url ?? '').startsWith('/') ? config.url ?? '' : `/${config.url ?? ''}`;
  const isAuthEndpoint = normalized.includes('/auth/login') ||
    normalized.includes('/auth/register') ||
    normalized.includes('/auth/refresh') ||
    normalized.includes('/auth/refresh-token');
  if (isAuthEndpoint) return config;

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const kind = inferKind(normalized);
  const token = getAccessToken(kind) || getAccessToken('user');
  if (token && !isTokenExpired(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const url = originalRequest.url ?? '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/refresh');
    if (error.response?.status === 401 && isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const kind = inferKind(url);
      try {
        const token = await refreshAccessToken(kind);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosClient(originalRequest);
      } catch (refreshError) {
        clearAuthSession(kind);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
