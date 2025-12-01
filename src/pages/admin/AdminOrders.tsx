import { useEffect, useMemo, useState } from 'react';
import {
  adminOrderService,
  type AdminOrderListResponse,
  type UpdateOrderStatusRequest,
} from '../../services/adminOrderService';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import type { OrderResponse } from '../../types/order';

type Palette = 'info' | 'success' | 'warning' | 'danger' | 'refund';

const statusOptions: Array<{ label: string; value: string; palette?: Palette }> = [
  { label: 'Tất cả', value: '' },
  { label: 'Chờ duyệt', value: 'PENDING', palette: 'warning' },
  { label: 'Đã xác nhận', value: 'CONFIRMED', palette: 'info' },
  { label: 'Đang xử lý', value: 'PROCESSING', palette: 'info' },
  { label: 'Đang giao', value: 'SHIPPING', palette: 'info' },
  { label: 'Đã giao', value: 'DELIVERED', palette: 'success' },
  { label: 'Đã hủy', value: 'CANCELLED', palette: 'danger' },
  { label: 'Đã hoàn tiền', value: 'REFUNDED', palette: 'refund' },
];

const statusWorkflow: Record<string, string[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPING', 'CANCELLED'],
  SHIPPING: ['DELIVERED', 'REFUNDED'],
  DELIVERED: ['REFUNDED'],
};

const paymentMethodOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'COD', value: 'COD' },
  { label: 'Chuyển khoản', value: 'BANK_TRANSFER' },
  { label: 'VNPay', value: 'VNPAY' },
  { label: 'MoMo', value: 'MOMO' },
];

const paymentStatusOptions: Array<{ label: string; value: string; palette: Palette }> = [
  { label: 'Chờ thanh toán', value: 'PENDING', palette: 'warning' },
  { label: 'Đã thanh toán', value: 'PAID', palette: 'success' },
  { label: 'Thanh toán thất bại', value: 'FAILED', palette: 'danger' },
  { label: 'Đã hoàn tiền', value: 'REFUNDED', palette: 'refund' },
];

const getPaletteClasses = (palette: Palette | undefined, active: boolean) => {
  if (!palette) {
    return active
      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent'
      : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--foreground)]';
  }

  if (!active) {
    switch (palette) {
      case 'warning':
        return 'border-[var(--warning)] text-[var(--warning)] bg-transparent hover:bg-[var(--warning-bg)]';
      case 'success':
        return 'border-[var(--success)] text-[var(--success)] bg-transparent hover:bg-[var(--success-bg)]';
      case 'danger':
        return 'border-[var(--error)] text-[var(--error)] bg-transparent hover:bg-[var(--error-bg)]';
      case 'refund':
        return 'border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--muted)]';
      case 'info':
      default:
        return 'border-[var(--primary)] text-[var(--primary)] bg-transparent hover:bg-[var(--primary-foreground)]';
    }
  }

  switch (palette) {
    case 'warning':
      return 'bg-[var(--warning)] text-[var(--warning-foreground)] border-transparent';
    case 'success':
      return 'bg-[var(--success)] text-[var(--success-foreground)] border-transparent';
    case 'danger':
      return 'bg-[var(--error)] text-[var(--error-foreground)] border-transparent';
    case 'refund':
      return 'bg-[var(--muted)] text-[var(--foreground)] border-transparent';
    case 'info':
    default:
      return 'bg-[var(--primary)] text-[var(--primary-foreground)] border-transparent';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'bg-[var(--warning-bg)] text-[var(--warning)]';
    case 'CONFIRMED':
    case 'PROCESSING':
      return 'bg-[var(--success-bg)] text-[var(--success)]';
    case 'SHIPPING':
      return 'bg-[var(--primary)]/10 text-[var(--primary)]';
    case 'DELIVERED':
      return 'bg-[var(--success-bg)] text-[var(--success)]';
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-[var(--error-bg)] text-[var(--error)]';
    default:
      return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
  }
};

const AdminOrders = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [data, setData] = useState<{ content: AdminOrderListResponse[]; totalElements: number; totalPages: number; number: number; size: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderListResponse | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderDetail, setOrderDetail] = useState<OrderResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [orderStatusForm, setOrderStatusForm] = useState('');
  const [paymentStatusForm, setPaymentStatusForm] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [notifyCustomer, setNotifyCustomer] = useState(true);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status || undefined,
      paymentMethod: paymentMethod || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      size: 20,
      sortBy: 'createdAt',
      sortDir: 'DESC' as const,
    }),
    [search, status, paymentMethod, startDate, endDate, page],
  );

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminOrderService.getAllOrders(filters);
        setData(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng.';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders().catch(() => {
      const message = 'Không thể tải danh sách đơn hàng.';
      setError(message);
      showToast(message, 'error');
    });
  }, [filters, refreshKey, showToast]);

  const handleOpenModal = async (order: AdminOrderListResponse) => {
    setSelectedOrder(order);
    setShowStatusModal(true);
    setDetailLoading(true);
    setOrderDetail(null);
    setOrderStatusForm(order.status);
    setPaymentStatusForm(order.paymentStatus);
    setInternalNotes('');
    setNotifyCustomer(true);

    try {
      const detail = await adminOrderService.getOrderById(order.id);
      setOrderDetail(detail);
      setOrderStatusForm(detail.status);
      setPaymentStatusForm(detail.paymentStatus);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể tải chi tiết đơn hàng.';
      showToast(message, 'error');
      setShowStatusModal(false);
      setSelectedOrder(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSubmitUpdate = async () => {
    if (!selectedOrder || !orderDetail) {
      showToast('Không tìm thấy thông tin đơn hàng.', 'error');
      return;
    }

    try {
      setUpdatingId(selectedOrder.id);
      const payload: UpdateOrderStatusRequest = {
        status: orderStatusForm,
        paymentStatus: paymentStatusForm,
        notes: internalNotes.trim() || undefined,
        notifyCustomer,
      };
      await adminOrderService.updateOrderStatus(selectedOrder.id, payload);
      showToast('Đã cập nhật đơn hàng.', 'success');
      setShowStatusModal(false);
      setOrderDetail(null);
      setSelectedOrder(null);
      setInternalNotes('');
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật đơn hàng.';
      showToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + '₫';

  const renderShippingAddress = (snapshot?: string | null) => {
    if (!snapshot) return 'Không có thông tin';
    try {
      const parsed = JSON.parse(snapshot) as Record<string, string>;
      return `${parsed.fullName ?? ''} | ${parsed.phone ?? ''}\n${parsed.address ?? ''}, ${parsed.ward ?? ''}, ${parsed.district ?? ''}, ${parsed.city ?? ''}`;
    } catch {
      return snapshot;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Quản lý đơn hàng
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Theo dõi và quản lý tất cả đơn hàng của khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setPage(0);
              setSearch('');
              setStatus('');
              setPaymentMethod('');
              setStartDate('');
              setEndDate('');
              setRefreshKey((prev) => prev + 1);
            }}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
          >
            Xóa bộ lọc
          </button>
          <button
            type="button"
            onClick={() => setRefreshKey((prev) => prev + 1)}
            className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
          >
            Tải lại
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[2fr_repeat(3,1fr)] gap-4">
        <input
          type="search"
          placeholder="Tìm theo mã đơn, email, tên..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {paymentMethodOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(0);
            }}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(0);
            }}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-[var(--muted-foreground)]">Đang tải...</div>
      )}

      {!loading && data && (
        <>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Mã đơn
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Khách hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Thanh toán
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Tổng tiền
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Ngày đặt
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.content.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{order.orderNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div className="font-medium">{order.customerName || 'N/A'}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{order.customerEmail}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                          {statusOptions.find((opt) => opt.value === order.status)?.label || order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div>
                          <div>{paymentMethodOptions.find((opt) => opt.value === order.paymentMethod)?.label || order.paymentMethod}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{order.paymentStatus}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(order.total)}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(order)}
                          className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors"
                        >
                          Cập nhật
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>
                Trang {data.number + 1}/{data.totalPages} ({data.totalElements} đơn hàng)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.number === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={data.number + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showStatusModal && selectedOrder && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] px-4"
          onClick={() => setShowStatusModal(false)}
        >
          <div
            className="w-full max-w-5xl max-h-[90vh] rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Đơn hàng</p>
                <h3 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
                  {selectedOrder.orderNumber}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Đặt ngày {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {detailLoading && (
                <p className="text-center text-sm text-[var(--muted-foreground)]">Đang tải chi tiết đơn hàng...</p>
              )}

              {!detailLoading && orderDetail && (
                <div className="grid gap-6 lg:grid-cols-[1.8fr_minmax(0,1.1fr)]">
                  <div className="space-y-5">
                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em]">
                            Trạng thái đơn hàng
                          </p>
                          <span className={`mt-1 inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(orderDetail.status)}`}>
                            {statusOptions.find((opt) => opt.value === orderDetail.status)?.label || orderDetail.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em]">Thanh toán</p>
                          <p className="mt-1 text-sm font-medium">{orderDetail.paymentMethod}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{orderDetail.paymentStatus}</p>
                        </div>
                        <div>
                          <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em]">Vận chuyển</p>
                          <p className="mt-1 text-sm font-medium">{orderDetail.shippingMethod || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] p-3 space-y-1">
                          <p className="text-xs text-[var(--muted-foreground)]">Tạm tính</p>
                          <p className="text-base font-semibold">{formatCurrency(orderDetail.subtotal)}</p>
                        </div>
                        <div className="rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] p-3 space-y-1">
                          <p className="text-xs text-[var(--muted-foreground)]">Phí ship</p>
                          <p className="text-base font-semibold">
                            {orderDetail.shippingFee === 0 ? 'Miễn phí' : formatCurrency(orderDetail.shippingFee)}
                          </p>
                        </div>
                        <div className="rounded-xl bg-[var(--muted)]/30 border border-[var(--border)] p-3 space-y-1 col-span-2">
                          <p className="text-xs text-[var(--muted-foreground)]">Tổng thanh toán</p>
                          <p className="text-xl font-semibold">{formatCurrency(orderDetail.total)}</p>
                        </div>
                      </div>
                      {orderDetail.shippingAddress && (
                        <div className="rounded-xl bg-[var(--muted)]/20 border border-dashed border-[var(--border)] p-3 text-xs space-y-1">
                          <p className="text-[var(--muted-foreground)] uppercase tracking-[0.2em] text-[10px]">Địa chỉ giao</p>
                          <pre className="whitespace-pre-wrap text-sm font-sans">{renderShippingAddress(orderDetail.shippingAddress)}</pre>
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
                      <p className="text-sm font-semibold">Sản phẩm ({orderDetail.items.length})</p>
                      <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                        {orderDetail.items.map((item) => (
                          <div key={item.id} className="flex items-start justify-between gap-3 text-xs border-b border-[var(--border)] pb-2 last:border-0">
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              {(item.color || item.size) && (
                                <p className="text-[var(--muted-foreground)]">
                                  {item.color && `Màu: ${item.color}`} {item.size && `• Size: ${item.size}`}
                                </p>
                              )}
                              <p className="text-[var(--muted-foreground)]">SL: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
                    <p className="text-sm font-semibold">Cập nhật đơn hàng</p>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">Trạng thái đơn hàng</p>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions
                          .filter((opt) => opt.value !== '')
                          .map((opt) => {
                            const allowedTargets = statusWorkflow[orderDetail.status] ?? [];
                            const disabled =
                              opt.value !== orderDetail.status &&
                              allowedTargets.length > 0 &&
                              !allowedTargets.includes(opt.value);
                            const isActive = orderStatusForm === opt.value;
                            return (
                              <div
                                key={opt.value}
                                role="button"
                                tabIndex={disabled ? -1 : 0}
                                aria-disabled={disabled}
                                onClick={() => {
                                  if (!disabled) setOrderStatusForm(opt.value);
                                }}
                                onKeyDown={(e) => {
                                  if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                                    e.preventDefault();
                                    setOrderStatusForm(opt.value);
                                  }
                                }}
                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${getPaletteClasses(
                                  opt.palette,
                                  isActive,
                                )} ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                              >
                                {opt.label}
                              </div>
                            );
                          })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-medium text-[var(--muted-foreground)]">Trạng thái thanh toán</p>
                      <div className="grid grid-cols-2 gap-2">
                        {paymentStatusOptions.map((opt) => {
                          const isActive = paymentStatusForm === opt.value;
                          return (
                            <div
                              key={opt.value}
                              role="button"
                              tabIndex={0}
                              onClick={() => setPaymentStatusForm(opt.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  setPaymentStatusForm(opt.value);
                                }
                              }}
                              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${getPaletteClasses(
                                opt.palette,
                                isActive,
                              )}`}
                            >
                              {opt.label}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-[var(--muted-foreground)]">
                        Ghi chú nội bộ (nhấn để thêm nội dung khác, tùy chọn)
                      </label>
                      <textarea
                        rows={4}
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        placeholder="Ví dụ: Đã liên hệ, đang chuẩn bị hàng..."
                      />
                    </div>

                    <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                      <input
                        type="checkbox"
                        checked={notifyCustomer}
                        onChange={(e) => setNotifyCustomer(e.target.checked)}
                        className="h-4 w-4 rounded border-[var(--border)]"
                      />
                      Gửi email thông báo cho khách hàng
                    </label>

                    <button
                      type="button"
                      onClick={handleSubmitUpdate}
                      disabled={updatingId === selectedOrder.id}
                      className="w-full rounded-full bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                    >
                      {updatingId === selectedOrder.id ? 'Đang cập nhật...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminOrders;

