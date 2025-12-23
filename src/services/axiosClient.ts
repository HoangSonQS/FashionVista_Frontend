import axios from 'axios';

const baseURL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8085/api';

export const axiosClient = axios.create({
  baseURL,
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


