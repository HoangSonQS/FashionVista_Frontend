import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * PaymentResultPage - Redirects to dedicated success/failed pages
 * Kept for backward compatibility with old VNPay redirects
 */
const PaymentResultPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const status = params.get('status'); // 'success' | 'failed' | null
  const orderNumber = params.get('orderNumber');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.search]);

  // Redirect to dedicated pages
  if (status === 'success') {
    const search = orderNumber ? `?orderNumber=${orderNumber}` : '';
    return <Navigate to={`/checkout/success${search}`} replace />;
  }
  if (status === 'failed') {
    const search = orderNumber ? `?orderNumber=${orderNumber}` : '';
    return <Navigate to={`/checkout/failed${search}`} replace />;
  }

  // Fallback: redirect to home if no status
  return <Navigate to="/" replace />;
};

export default PaymentResultPage;




