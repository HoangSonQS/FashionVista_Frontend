import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { OrderResponse } from '../../types/order';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
  RETURNED: 'Đã trả',
  REFUNDED: 'Đã hoàn tiền',
};

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-[var(--warning-bg)] text-[var(--warning)]';
    case 'CONFIRMED':
    case 'PROCESSING':
    case 'SHIPPING':
      return 'bg-[var(--primary)]/10 text-[var(--primary)]';
    case 'DELIVERED':
      return 'bg-[var(--success-bg)] text-[var(--success)]';
    case 'CANCELLED':
    case 'RETURNED':
    case 'REFUNDED':
      return 'bg-[var(--error-bg)] text-[var(--error)]';
    default:
      return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
  }
};

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

const UserOrderDetailPage = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderNumber) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrder(orderNumber);
        setOrder(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrder();
  }, [orderNumber]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
        >
          ← Về danh sách đơn hàng
        </button>

        {loading && (
          <p className="text-sm text-[var(--muted-foreground)]">Đang tải chi tiết đơn hàng...</p>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        {!loading && !error && order && (
          <>
            <header className="space-y-2">
              <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
                Đơn hàng {order.orderNumber}
              </h1>
              <p className="text-sm text-[var(--muted-foreground)]">
                Đặt lúc{' '}
                {new Date(order.createdAt).toLocaleString('vi-VN', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
              <div className="flex flex-wrap gap-2 items-center">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                >
                  {STATUS_LABEL[order.status] ?? order.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                  Thanh toán: {order.paymentStatus}
                </span>
                {order.shippingMethod && (
                  <span className="inline-flex items-center rounded-full bg-[var(--muted)] px-2 py-0.5 text-xs text-[var(--muted-foreground)]">
                    Vận chuyển: {order.shippingMethod}
                  </span>
                )}
              </div>
            </header>

            <section className="grid gap-6 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)]">
              {/* Items */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Sản phẩm trong đơn
                </h2>
                <div className="divide-y divide-[var(--border)]">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex gap-3 py-3">
                      <div className="h-14 w-14 flex-shrink-0 rounded-md border border-[var(--border)] bg-[var(--background)] overflow-hidden">
                        {item.productImage ? (
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="text-sm font-medium hover:underline"
                          style={{ fontFamily: 'var(--font-serif)' }}
                        >
                          {item.productName}
                        </Link>
                        {(item.size || item.color) && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {item.size && `Size: ${item.size}`}
                            {item.color && (item.size ? ' • ' : '')}
                            {item.color && `Màu: ${item.color}`}
                          </p>
                        )}
                        <p className="text-xs text-[var(--muted-foreground)]">
                          SL: {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Thanh toán
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Tạm tính</span>
                    <span>{formatCurrency(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Phí vận chuyển</span>
                    <span>
                      {order.shippingFee === 0 ? 'Miễn phí' : formatCurrency(order.shippingFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Giảm giá</span>
                    <span className="text-[var(--error)]">- {formatCurrency(order.discount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-[var(--border)] pt-2 text-base font-semibold">
                    <span>Tổng thanh toán</span>
                    <span className="text-[var(--primary)]">{formatCurrency(order.total)}</span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                  Khi có thay đổi trạng thái (đang giao, đã giao, hủy, hoàn tiền), chúng tôi sẽ gửi
                  thông báo qua email hoặc tại mục Đơn hàng của bạn.
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default UserOrderDetailPage;


