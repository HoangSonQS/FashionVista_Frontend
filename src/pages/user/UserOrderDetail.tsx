import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { returnService } from '../../services/returnService';
import type { OrderResponse } from '../../types/order';
import {
  FileText,
  CheckCircle,
  Package,
  Truck,
  Home,
  XCircle,
  AlertCircle,
  Check,
  RotateCcw
} from 'lucide-react';

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
  const [repaying, setRepaying] = useState(false);
  const [changingMethod, setChangingMethod] = useState(false);

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

  const handleRepay = async () => {
    if (!orderNumber) return;
    try {
      setRepaying(true);
      const updated = await orderService.repay(orderNumber);
      if (updated.paymentUrl) {
        window.location.href = updated.paymentUrl;
      } else {
        setOrder(updated);
        setActionMessage('Đã tạo liên kết thanh toán mới.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thực hiện thanh toán lại.';
      setActionMessage(message);
    } finally {
      setRepaying(false);
    }
  };

  const handleChangeToCOD = async () => {
    if (!orderNumber) return;
    const confirmed = window.confirm('Bạn muốn đổi sang thanh toán khi nhận hàng (COD)?');
    if (!confirmed) return;
    try {
      setChangingMethod(true);
      const updated = await orderService.changePaymentMethod(orderNumber, 'COD');
      setOrder(updated);
      setActionMessage('Đã đổi sang phương thức COD.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đổi phương thức thanh toán.';
      setActionMessage(message);
    } finally {
      setChangingMethod(false);
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
                {order.status === 'PENDING' && order.paymentMethod === 'VNPAY' && order.paymentStatus === 'PENDING' && (
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRepay}
                      disabled={repaying || cancelling}
                      className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60"
                    >
                      {repaying ? 'Đang xử lý...' : 'Thanh toán lại'}
                    </button>
                    <button
                      type="button"
                      onClick={handleChangeToCOD}
                      disabled={changingMethod || cancelling}
                      className="inline-flex items-center justify-center rounded-full border border-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-60"
                    >
                      {changingMethod ? 'Đang đổi...' : 'Đổi sang COD'}
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/orders', { state: { statusFilter: order.status } })}
                  className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                >
                  Xem các đơn khác cùng trạng thái →
                </button>
                {actionMessage && <span className="text-xs text-[var(--muted-foreground)]">{actionMessage}</span>}
              </div>
            </header>

            {/* Status Timeline */}
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-sm overflow-hidden">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)] mb-6">
                Trạng thái đơn hàng
              </h2>

              {/* CANCELLED / REFUNDED / RETURN State */}
              {(order.status === 'CANCELLED' || order.status === 'REFUNDED' || order.status.startsWith('RETURN')) ? (
                <div className="flex flex-col items-center justify-center py-6 text-center space-y-3 bg-[var(--muted)]/20 rounded-xl border border-[var(--border)] border-dashed">
                  {order.status === 'CANCELLED' ? (
                    <XCircle className="w-12 h-12 text-[var(--error)]" />
                  ) : order.status === 'REFUNDED' ? (
                    <RotateCcw className="w-12 h-12 text-[var(--success)]" />
                  ) : (
                    <AlertCircle className="w-12 h-12 text-[var(--warning)]" />
                  )}
                  <div>
                    <h3 className={`text-lg font-bold ${order.status === 'CANCELLED' ? 'text-[var(--error)]' :
                      order.status === 'REFUNDED' ? 'text-[var(--primary)]' : 'text-[var(--warning)]'
                      }`}>
                      {STATUS_LABEL[order.status]}
                    </h3>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {order.status === 'CANCELLED' ? 'Đơn hàng này đã bị hủy.' :
                        order.status === 'REFUNDED' ? 'Đơn hàng đã được hoàn tiền.' :
                          'Đơn hàng đang trong quy trình đổi trả.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Stepper for Standard Flow */
                <div className="relative">
                  {/* Desktop Connecting Line (Absolute) */}
                  <div className="hidden md:block absolute top-[22px] left-0 right-0 h-[2px] bg-[var(--border)] z-0" />

                  {/* Steps */}
                  <div className="flex flex-col md:flex-row justify-between relative z-10 gap-6 md:gap-0">
                    {[
                      { key: 'PENDING', label: 'Đặt hàng', icon: FileText },
                      { key: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle },
                      { key: 'PROCESSING', label: 'Đang xử lý', icon: Package },
                      { key: 'SHIPPING', label: 'Đang giao', icon: Truck },
                      { key: 'DELIVERED', label: 'Đã giao', icon: Home },
                    ].map((step, index, arr) => {
                      // Determine state
                      const statusOrder = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED'];
                      const currentStatusIdx = statusOrder.indexOf(order.status);
                      const stepIdx = statusOrder.indexOf(step.key);

                      const isCompleted = currentStatusIdx > stepIdx;
                      const isActive = currentStatusIdx === stepIdx;

                      // Line Color Logic (for visual progress bar effect, requires complex css or just static line behind)
                      // Simply using the static line background above for now.

                      return (
                        <div key={step.key} className="flex flex-row md:flex-col items-center gap-4 md:gap-2 flex-1 relative group">

                          {/* Vertical Connector for Mobile */}
                          {index !== arr.length - 1 && (
                            <div className={`md:hidden absolute left-[22px] top-[44px] bottom-[-24px] w-[2px] ${isCompleted ? 'bg-[var(--success)]' : 'bg-[var(--border)]'
                              }`} />
                          )}

                          {/* Icon Circle */}
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-full border-2 transition-all duration-300 ${isCompleted || isActive
                              ? 'bg-[var(--primary)] border-[var(--primary)] text-[var(--primary-foreground)] shadow-lg shadow-[var(--primary)]/20'
                              : 'bg-[var(--card)] border-[var(--border)] text-[var(--muted-foreground)]'
                              }`}
                          >
                            {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
                          </div>

                          {/* Text Info */}
                          <div className={`text-left md:text-center transition-colors duration-300 ${isActive ? 'scale-105 origin-left md:origin-center' : ''}`}>
                            <p className={`text-sm font-bold ${isActive ? 'text-[var(--primary)]' :
                              isCompleted ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'
                              }`}>
                              {step.label}
                            </p>
                            <p className="text-[10px] md:text-xs text-[var(--muted-foreground)] hidden sm:block">
                              {isActive ? 'Đang thực hiện' : isCompleted ? 'Hoàn tất' : 'Chờ xử lý'}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address & Payment Info */}
            <div className="grid gap-6 md:grid-cols-2">
              {order.shippingAddress && (
                <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)] mb-3">
                    Địa chỉ giao hàng
                  </h2>
                  <p className="text-sm text-[var(--foreground)] whitespace-pre-line">
                    {(() => {
                      try {
                        const parsed = JSON.parse(order.shippingAddress);
                        if (typeof parsed === 'object' && parsed !== null) {
                          return [
                            parsed.fullName,
                            parsed.phone,
                            parsed.address,
                            parsed.ward && parsed.district && parsed.city
                              ? `${parsed.ward}, ${parsed.district}, ${parsed.city}`
                              : parsed.city || parsed.district || parsed.ward,
                          ]
                            .filter(Boolean)
                            .join('\n');
                        }
                      } catch {
                        // Not JSON, return as-is
                      }
                      return order.shippingAddress;
                    })()}
                  </p>
                </div>
              )}
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)] mb-3">
                  Phương thức thanh toán
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Phương thức</span>
                    <span className="font-medium">
                      {order.paymentMethod === 'COD'
                        ? 'Thanh toán khi nhận hàng (COD)'
                        : order.paymentMethod === 'VNPAY'
                          ? 'VNPay'
                          : order.paymentMethod === 'MOMO'
                            ? 'MoMo'
                            : order.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--muted-foreground)]">Trạng thái</span>
                    <span
                      className={`font-medium ${order.paymentStatus === 'PAID'
                        ? 'text-[var(--success)]'
                        : order.paymentStatus === 'FAILED'
                          ? 'text-[var(--error)]'
                          : 'text-[var(--warning)]'
                        }`}
                    >
                      {order.paymentStatus === 'PAID'
                        ? 'Đã thanh toán'
                        : order.paymentStatus === 'FAILED'
                          ? 'Thanh toán thất bại'
                          : order.paymentStatus === 'PENDING'
                            ? 'Chờ thanh toán'
                            : order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

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



