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

  // POST /products yêu cầu admin token (có @PreAuthorize("hasRole('ADMIN')"))
  const isAdminEndpoint = normalized.startsWith('/admin/') || 
    (config.method?.toUpperCase() === 'POST' && normalized === '/products');
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
  } else if (isAdminEndpoint) {
    // Nếu là admin endpoint nhưng không có token, có thể cần redirect
    console.warn('Admin endpoint called without token:', normalized);
  }

  return config;
});

// Thêm response interceptor để xử lý lỗi 403
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      // Nếu là 403/401 và đang ở admin route hoặc đang tạo sản phẩm, có thể token hết hạn hoặc không có quyền
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        const requestUrl = error.config?.url ?? '';
        const isAdminAction = currentPath.startsWith('/admin') || 
          (error.config?.method?.toUpperCase() === 'POST' && requestUrl.includes('/products'));
        
        if (isAdminAction) {
          // Xóa token và redirect về login
          localStorage.removeItem('adminAuth');
          window.dispatchEvent(new Event('admin-auth-change'));
          if (currentPath !== '/admin/login' && !currentPath.includes('/admin/login')) {
            window.location.href = '/admin/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);


