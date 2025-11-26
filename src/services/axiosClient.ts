import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const url = config.url ?? '';
    if (url.startsWith('/auth/')) {
      return config;
    }

    const raw = localStorage.getItem('auth');
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
  }

  return config;
});


