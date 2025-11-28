import { Navigate, Outlet, useLocation } from 'react-router-dom';

export const AdminProtectedRoute = () => {
  const location = useLocation();
  const raw = typeof window !== 'undefined' ? localStorage.getItem('adminAuth') : null;

  if (!raw) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};


