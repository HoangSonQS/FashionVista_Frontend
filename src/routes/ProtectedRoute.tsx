import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { bootstrapAuthSession } from '../services/axiosClient';
import { getAuthSession } from '../services/authSession';

export const ProtectedRoute = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(!getAuthSession('user'));
  const [authorized, setAuthorized] = useState(Boolean(getAuthSession('user')));

  useEffect(() => {
    if (authorized) return;
    bootstrapAuthSession('user').then((ok) => {
      setAuthorized(ok);
      setChecking(false);
    });
  }, [authorized]);

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-[var(--muted-foreground)]">Dang xac thuc...</div>;
  }

  if (!authorized) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
