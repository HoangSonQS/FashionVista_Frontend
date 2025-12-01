import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') {
    return config;
  }

  const url = config.url ?? '';
  const normalized = url.startsWith('/') ? url : `/${url}`;
  const isAuthEndpoint = normalized.startsWith('/auth/') || normalized.startsWith('/admin/auth/');
  if (isAuthEndpoint) {
    return config;
  }

  const isAdminEndpoint = normalized.startsWith('/admin/');
  const storageKey = isAdminEndpoint ? 'adminAuth' : 'auth';
  const raw = localStorage.getItem(storageKey);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed?.token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // ignore parse error
    }
  }

  return config;
});


