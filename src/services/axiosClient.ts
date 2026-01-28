import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8085/api';

export const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper to check token expiration
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

  // Don't override Content-Type if it's FormData (axios will set it automatically with boundary)
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
      if (parsed?.token && !isTokenExpired(parsed.token)) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    } catch {
      // ignore parse error
    }
  }

  return config;
});

// Flag & Queue to handle multiple concurrent 401s
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Suppress console error cho 404
    if (
      error.response?.status === 404 &&
      error.config?.url?.includes('/admin/returns/by-order/')
    ) {
      error.isExpected404 = true;
      return Promise.reject(error);
    }

    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Prevent infinite loop if auth endpoints themselves fail
      if (
        originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/refresh-token')
      ) {
        return Promise.reject(error);
      }

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

      const isAdminEndpoint = originalRequest.url?.includes('/admin/');
      const storageKey = isAdminEndpoint ? 'adminAuth' : 'auth';

      try {
        const raw = localStorage.getItem(storageKey);
        const authData = raw ? JSON.parse(raw) : null;
        const refreshToken = authData?.refreshToken;

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Update Token & Rotation
        const updatedAuth = { ...authData, token, refreshToken: newRefreshToken };
        localStorage.setItem(storageKey, JSON.stringify(updatedAuth));

        axiosClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        originalRequest.headers['Authorization'] = `Bearer ${token}`;

        processQueue(null, token);
        return axiosClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        console.warn('Session expired. Logging out...');
        localStorage.removeItem(storageKey);
        if (typeof window !== 'undefined') {
          // Chỉ reload nếu đang ở trang cần auth, nếu public thì thôi?
          // Public API lỗi -> clear token -> thành guest. Reload để reset trạng thái UI.
          window.location.reload();
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);


