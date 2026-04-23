import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8085/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const isTokenExpired = (token: string): boolean => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const { exp } = JSON.parse(jsonPayload);
    if (!exp) return false;
    return Date.now() >= exp * 1000;
  } catch {
    return true;
  }
};

const handleLogout = (isAdmin: boolean) => {
  const storageKey = isAdmin ? 'adminAuth' : 'auth';
  localStorage.removeItem(storageKey);
  if (typeof window !== 'undefined') {
    const loginPath = isAdmin ? '/admin/login' : '/login';
    // Use window.location.href to force a full redirect and stop any running app logic
    if (window.location.pathname !== loginPath) {
      window.location.href = loginPath;
    }
  }
};

axiosClient.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;

  const url = config.url ?? '';
  const normalized = url.startsWith('/') ? url : `/${url}`;
  
  // Skip token attachment for auth endpoints
  const isAuthEndpoint = normalized.includes('/auth/login') || 
                        normalized.includes('/auth/register') || 
                        normalized.includes('/auth/refresh-token');
                        
  if (isAuthEndpoint) return config;

  const isFormData = config.data instanceof FormData;
  if (isFormData) {
    delete config.headers['Content-Type'];
  }

  const isAdminEndpoint = normalized.startsWith('/admin/');
  const storageKey = isAdminEndpoint ? 'adminAuth' : 'auth';
  const raw = localStorage.getItem(storageKey);

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed?.token) {
        if (isTokenExpired(parsed.token)) {
          // Optional: we could trigger refresh here, but intercepting 401 is usually more reliable
        }
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // ignore
    }
  }

  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    const url = originalRequest.url ?? '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/refresh-token');

    // If 401 occurs on an auth request, it's either wrong credentials or invalid refresh token
    if (error.response?.status === 401 && isAuthRequest) {
      const isAdmin = url.includes('/admin/');
      handleLogout(isAdmin);
      return Promise.reject(error);
    }

    // Handle 401 for normal requests
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const isAdmin = url.includes('/admin/');
      const storageKey = isAdmin ? 'adminAuth' : 'auth';

      try {
        const raw = localStorage.getItem(storageKey);
        const authData = raw ? JSON.parse(raw) : null;
        const refreshToken = authData?.refreshToken;

        if (!refreshToken) throw new Error('No refresh token');

        // Note: use base axios to avoid client interceptors for refresh call
        const response = await axios.post(`${baseURL}${isAdmin ? '/admin' : ''}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;
        const updatedAuth = { ...authData, token, refreshToken: newRefreshToken };
        localStorage.setItem(storageKey, JSON.stringify(updatedAuth));

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        processQueue(null, token);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        handleLogout(isAdmin);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


