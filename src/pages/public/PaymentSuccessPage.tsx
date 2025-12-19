import { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-12">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center space-y-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[var(--success-bg)] text-[var(--success)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Thanh toán thành công
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Cảm ơn bạn đã thanh toán đơn hàng. Bạn có thể xem chi tiết đơn và theo dõi trạng thái giao hàng.
          </p>
          {orderNumber && (
            <div className="pt-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                Mã đơn hàng: <span className="font-mono font-semibold text-[var(--foreground)]">{orderNumber}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 w-full">
          {orderNumber && (
            <button
              type="button"
              onClick={() => navigate(`/orders/${orderNumber}`)}
              className="rounded-full bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
            >
              Xem chi tiết đơn hàng
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-full border border-[var(--border)] px-6 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Xem danh sách đơn hàng
          </button>
          <Link
            to="/"
            className="rounded-full px-6 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>

        <div className="pt-4 border-t border-[var(--border)] w-full">
          <p className="text-xs text-[var(--muted-foreground)] mb-2">Cần hỗ trợ?</p>
          <Link
            to="/contact"
            className="text-xs text-[var(--primary)] hover:underline"
          >
            Liên hệ với chúng tôi
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;

