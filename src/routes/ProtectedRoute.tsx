import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const ProtectedRoute = () => {
  const location = useLocation();
  const authRaw = typeof window !== 'undefined' ? localStorage.getItem('auth') : null;

  if (!authRaw) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

