import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { returnService } from '../../services/returnService';
import type { OrderResponse } from '../../types/order';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  RETURN_REQUESTED: 'Chờ đổi trả',
  RETURN_APPROVED: 'Đã đổi trả',
  CANCELLED: 'Đã hủy',
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
    case 'RETURN_REQUESTED':
    case 'RETURN_APPROVED':
      return 'bg-[var(--warning-bg)] text-[var(--warning)]';
    case 'CANCELLED':
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
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnNote, setReturnNote] = useState('');
  const [evidenceInput, setEvidenceInput] = useState('');
  const [returnQuantities, setReturnQuantities] = useState<Record<number, number>>({});
  const [returnRequested, setReturnRequested] = useState(false);

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

  useEffect(() => {
    if (!order) return;
    const initialQuantities: Record<number, number> = {};
    order.items.forEach((item) => {
      initialQuantities[item.id] = item.quantity;
    });
    setReturnQuantities(initialQuantities);
  }, [order]);

  const canCancel =
    order &&
    (order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'PROCESSING');

  const canRequestReturn = useMemo(() => {
    if (!order) return false;
    return order.status === 'DELIVERED' && !returnRequested;
  }, [order, returnRequested]);

  const handleCancel = async () => {
    if (!orderNumber || !order) return;
    const confirmed = window.confirm('Bạn chắc chắn muốn hủy đơn này?');
    if (!confirmed) return;
    try {
      setCancelling(true);
      const updated = await orderService.cancel(orderNumber);
      setOrder(updated);
      setActionMessage('Đã hủy đơn hàng.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể hủy đơn hàng.';
      setActionMessage(message);
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReturn = async () => {
    if (!order) return;
    if (!returnReason.trim()) {
      setActionMessage('Vui lòng nhập lý do đổi trả.');
      return;
    }

    const itemsPayload = order.items
      .map((item) => ({
        orderItemId: item.id,
        quantity: returnQuantities[item.id] ?? 0,
      }))
      .filter((entry) => entry.quantity > 0);

    if (itemsPayload.length === 0) {
      setActionMessage('Vui lòng chọn ít nhất 1 sản phẩm cần đổi trả.');
      return;
    }

    try {
      setReturnSubmitting(true);
      const evidenceUrls = evidenceInput
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      await returnService.create({
        orderId: order.id,
        reason: returnReason,
        note: returnNote,
        evidenceUrls,
        items: itemsPayload,
      });

      setActionMessage('Đã gửi yêu cầu đổi trả. Chúng tôi sẽ xem xét và phản hồi sớm.');
      setReturnRequested(true);
      setReturnModalOpen(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể gửi yêu cầu đổi trả.';
      setActionMessage(message);
    } finally {
      setReturnSubmitting(false);
    }
  };

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
              <div className="flex flex-wrap items-center gap-3">
                {canCancel && (
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--error)] px-4 py-2 text-sm font-semibold text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {cancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                  </button>
                  </div>
                )}
                {canRequestReturn && (
                  <button
                    type="button"
                    onClick={() => setReturnModalOpen(true)}
                    className="inline-flex items-center justify-center rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors"
                  >
                    Yêu cầu đổi trả
                  </button>
                )}
                {actionMessage && <span className="text-xs text-[var(--muted-foreground)]">{actionMessage}</span>}
              </div>
            </header>

            {/* Tracking Info */}
            {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && order.trackingNumber && (
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)] mb-1">
                      Mã vận đơn
                    </p>
                    <p className="text-base font-semibold">{order.trackingNumber}</p>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                    >
                      Theo dõi đơn hàng →
                    </a>
                  )}
                </div>
              </div>
            )}

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

      {returnModalOpen && order && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-2xl rounded-2xl bg-[var(--card)] p-6 shadow-xl border border-[var(--border)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Yêu cầu đổi trả</h3>
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-2">
                <label className="text-sm font-medium">Chọn sản phẩm và số lượng</label>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Tối đa: {item.quantity} • Giá: {formatCurrency(item.price)}
                        </p>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={returnQuantities[item.id] ?? 0}
                        onChange={(e) =>
                          setReturnQuantities((prev) => ({
                            ...prev,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                        className="w-24 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Lý do *</label>
                <input
                  type="text"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                  placeholder="Nhập lý do đổi trả"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú</label>
                <textarea
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                  placeholder="Thông tin bổ sung (tùy chọn)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Link hình ảnh minh chứng (cách nhau bởi dấu phẩy)</label>
                <textarea
                  value={evidenceInput}
                  onChange={(e) => setEvidenceInput(e.target.value)}
                  className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 text-sm"
                  placeholder="https://... , https://..."
                  rows={2}
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setReturnModalOpen(false)}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmitReturn}
                disabled={returnSubmitting}
                className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-60"
              >
                {returnSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOrderDetailPage;



