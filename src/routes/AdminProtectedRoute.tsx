import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { adminService } from '../services/adminService';

export const AdminProtectedRoute = () => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAdminAuth = async () => {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('adminAuth') : null;
      
      if (!raw) {
        setIsAuthorized(false);
        setIsValidating(false);
        return;
      }

      try {
        // Validate token bằng cách gọi API admin - nếu token không hợp lệ hoặc không phải admin sẽ throw error
        await adminService.getOverview();
        setIsAuthorized(true);
      } catch (error) {
        // Token không hợp lệ hoặc không phải admin - xóa và redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('adminAuth');
        }
        setIsAuthorized(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateAdminAuth();
  }, []);

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Đang xác thực...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};


