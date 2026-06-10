import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { bootstrapAuthSession } from '../services/axiosClient';
import { getAuthSession } from '../services/authSession';
import { adminService } from '../services/adminService';

export const AdminProtectedRoute = () => {
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAdminAuth = async () => {
      try {
        const hasMemoryAuth = Boolean(getAuthSession('admin'));
        const refreshed = hasMemoryAuth || await bootstrapAuthSession('admin');
        if (!refreshed) {
          setIsAuthorized(false);
          return;
        }
        await adminService.getOverview();
        setIsAuthorized(true);
      } catch {
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
        <p className="text-[var(--muted-foreground)]">Dang xac thuc...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
