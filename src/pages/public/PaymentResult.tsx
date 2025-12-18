import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const PaymentResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const status = params.get('status'); // 'success' | 'failed' | null
  const orderNumber = params.get('orderNumber');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.search]);

  const isSuccess = status === 'success';

  const title = isSuccess ? 'Thanh toán thành công' : 'Thanh toán không thành công';
  const description = isSuccess
    ? 'Cảm ơn bạn đã thanh toán đơn hàng. Bạn có thể xem chi tiết đơn và theo dõi trạng thái giao hàng.'
    : 'Thanh toán qua VNPay chưa hoàn tất hoặc đã thất bại. Bạn có thể xem lại đơn hàng và chọn hủy, đổi phương thức hoặc thanh toán lại nếu khả dụng.';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-12">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center space-y-6">
        <div
          className={`flex h-16 w-16 items-center justify-center rounded-full ${
            isSuccess ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--error-bg)] text-[var(--error)]'
          }`}
        >
          <span className="text-2xl">{isSuccess ? '✓' : '!'}</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            {title}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">{description}</p>
          {orderNumber && (
            <p className="text-xs text-[var(--muted-foreground)]">
              Mã đơn hàng: <span className="font-mono font-semibold">{orderNumber}</span>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {orderNumber && (
            <button
              type="button"
              onClick={() => navigate(`/orders/${orderNumber}`)}
              className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
            >
              Xem chi tiết đơn hàng
            </button>
          )}
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className="rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            Xem danh sách đơn hàng
          </button>
          <Link
            to="/"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)]/60 transition-colors"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentResultPage;


