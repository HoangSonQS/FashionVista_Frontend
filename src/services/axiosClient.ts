import axios from 'axios';

export const axiosClient = axios.create({
  baseURL: 'http://localhost:8085/api',
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

// Response interceptor để suppress 404 errors cho return request endpoint
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Suppress console error cho 404 khi không tìm thấy return request (trạng thái bình thường)
    if (
      error.response?.status === 404 &&
      error.config?.url?.includes('/admin/returns/by-order/')
    ) {
      // Đánh dấu để component biết đây là 404 hợp lệ (không có return request)
      // Component sẽ handle và return null, không cần log vào console
      error.isExpected404 = true;
      return Promise.reject(error);
    }
    // Các lỗi khác vẫn log bình thường
    return Promise.reject(error);
  }
);


