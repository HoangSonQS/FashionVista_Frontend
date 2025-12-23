import { useEffect, useMemo, useState } from 'react';
import {
  adminPaymentService,
  type AdminPaymentResponse,
  type PaymentMethod,
  type PaymentStatus,
} from '../../services/adminPaymentService';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const AdminPayments = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | ''>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    content: AdminPaymentResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentResponse | null>(null);
  const [paymentStatusForm, setPaymentStatusForm] = useState<PaymentStatus>('PENDING');
  const [updating, setUpdating] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      paymentMethod: paymentMethod || undefined,
      paymentStatus: paymentStatus || undefined,
      page,
      size: 20,
    }),
    [debouncedSearch, paymentMethod, paymentStatus, page],
  );

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminPaymentService.getAllPayments(filters);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách thanh toán.');
        showToast(err instanceof Error ? err.message : 'Không thể tải danh sách thanh toán.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void fetchPayments();
  }, [filters, showToast]);

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng';
      case 'VNPAY':
        return 'VNPay';
      case 'MOMO':
        return 'MoMo';
      case 'BANK_TRANSFER':
        return 'Chuyển khoản';
      default:
        return method;
    }
  };

  const getPaymentStatusLabel = (status: PaymentStatus): { label: string; color: string } => {
    switch (status) {
      case 'PENDING':
        return { label: 'Chờ thanh toán', color: 'bg-yellow-100 text-yellow-700' };
      case 'PAID':
        return { label: 'Đã thanh toán', color: 'bg-green-100 text-green-700' };
      case 'FAILED':
        return { label: 'Thất bại', color: 'bg-red-100 text-red-700' };
      case 'REFUND_PENDING':
        return { label: 'Chờ hoàn tiền', color: 'bg-orange-100 text-orange-700' };
      case 'REFUNDED':
        return { label: 'Đã hoàn tiền', color: 'bg-gray-100 text-gray-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const handleViewPayment = async (payment: AdminPaymentResponse) => {
    setSelectedPayment(payment);
    setPaymentStatusForm(payment.paymentStatus);
    setShowDetailModal(true);
  };

  const handleUpdatePaymentStatus = async () => {
    if (!selectedPayment) return;
    setUpdating(true);
    try {
      const updated = await adminPaymentService.updatePaymentStatus(selectedPayment.id, paymentStatusForm);
      showToast('Cập nhật trạng thái thanh toán thành công.', 'success');
      setSelectedPayment(updated);
      // Update in list
      if (data) {
        setData({
          ...data,
          content: data.content.map((p) => (p.id === updated.id ? updated : p)),
        });
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái thanh toán.';
      showToast(errorMessage, 'error');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Thanh toán
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Quản lý và theo dõi các giao dịch thanh toán.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            if (!confirm('Bạn có chắc chắn muốn đồng bộ payment status cho tất cả đơn COD đã giao? Điều này sẽ cập nhật payment status từ PENDING sang PAID.')) {
              return;
            }
            try {
              const result = await adminPaymentService.syncCodDeliveredPayments();
              showToast(result.message, 'success');
              // Refresh data
              const response = await adminPaymentService.getAllPayments(filters);
              setData(response);
            } catch (err: any) {
              const errorMessage = err?.response?.data?.message || err?.message || 'Không thể đồng bộ payment status.';
              showToast(errorMessage, 'error');
            }
          }}
          className="inline-flex items-center justify-center rounded-full border border-[var(--primary)] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          Đồng bộ COD đã giao
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="search"
          placeholder="Tìm theo mã đơn, transaction ID..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={paymentMethod}
          onChange={(e) => {
            setPaymentMethod((e.target.value as PaymentMethod) || '');
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả phương thức</option>
          <option value="COD">Thanh toán khi nhận hàng</option>
          <option value="VNPAY">VNPay</option>
          <option value="MOMO">MoMo</option>
          <option value="BANK_TRANSFER">Chuyển khoản</option>
        </select>
        <select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus((e.target.value as PaymentStatus) || '');
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ thanh toán</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="FAILED">Thất bại</option>
          <option value="REFUND_PENDING">Chờ hoàn tiền</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
        </select>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm leading-normal">
              <th className="py-4 px-6 font-semibold">Mã đơn hàng</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Phương thức</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Số tiền</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Đã hoàn</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Trạng thái</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Transaction ID</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Thời gian</th>
              <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted-foreground)] text-sm">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.content.length > 0 ? (
              data.content.map((item) => {
                const status = getPaymentStatusLabel(item.paymentStatus);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors group"
                  >
                    <td className="py-4 px-6 align-top">
                      <div className="font-bold text-[var(--primary)] text-base mb-1 group-hover:underline cursor-pointer">
                        {item.orderNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
                        {getPaymentMethodLabel(item.paymentMethod)}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top text-[var(--primary)] font-medium">
                      {item.amount.toLocaleString('vi-VN')}₫
                    </td>
                    <td className="py-4 px-6 align-top">
                      {item.refundAmount > 0 ? (
                        <span className="text-[var(--error)] font-medium">
                          {item.refundAmount.toLocaleString('vi-VN')}₫
                        </span>
                      ) : (
                        <span className="text-[var(--muted-foreground)]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top font-mono text-xs text-[var(--muted-foreground)]">
                      {item.transactionId || '—'}
                    </td>
                    <td className="py-4 px-6 align-top text-xs text-[var(--muted-foreground)]">
                      {new Date(item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-4 px-6 align-top text-center">
                      <button
                        type="button"
                        onClick={() => handleViewPayment(item)}
                        className="w-full px-3 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--card)] border border-[var(--primary)]/30 rounded-full hover:bg-[var(--primary)]/10 transition-colors"
                      >
                        Xem đơn hàng
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Chưa có giao dịch thanh toán nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <span>
                Hiển thị {data.content.length} trên tổng số {data.totalElements} giao dịch
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)] transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          ) : (
            <span>Hiển thị {data.totalElements} trên tổng số {data.totalElements} giao dịch</span>
          )}
        </div>
      )}

      {/* Modal Xem Chi Tiết Payment */}
      {showDetailModal && selectedPayment && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] px-4"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Thanh toán</p>
                <h3 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
                  {selectedPayment.orderNumber}
                </h3>
                <p className="text-xs text-[var(--muted-foreground)]">
                  Tạo ngày {new Date(selectedPayment.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
              >
                Đóng
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-6">
                {/* Thông tin thanh toán */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    Thông tin thanh toán
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em] mb-1">
                        Phương thức
                      </p>
                      <p className="font-medium">{getPaymentMethodLabel(selectedPayment.paymentMethod)}</p>
                    </div>
                    <div>
                      <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em] mb-1">
                        Trạng thái
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getPaymentStatusLabel(selectedPayment.paymentStatus).color}`}>
                        {getPaymentStatusLabel(selectedPayment.paymentStatus).label}
                      </span>
                    </div>
                    <div>
                      <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em] mb-1">
                        Số tiền
                      </p>
                      <p className="text-lg font-semibold text-[var(--primary)]">
                        {selectedPayment.amount.toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                    <div>
                      <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em] mb-1">
                        Đã hoàn
                      </p>
                      <p className={`text-lg font-semibold ${selectedPayment.refundAmount > 0 ? 'text-[var(--error)]' : 'text-[var(--muted-foreground)]'}`}>
                        {selectedPayment.refundAmount > 0
                          ? `${selectedPayment.refundAmount.toLocaleString('vi-VN')}₫`
                          : '—'}
                      </p>
                    </div>
                    {selectedPayment.transactionId && (
                      <div className="col-span-2">
                        <p className="text-[var(--muted-foreground)] text-xs uppercase tracking-[0.2em] mb-1">
                          Transaction ID
                        </p>
                        <p className="font-mono text-xs text-[var(--muted-foreground)] break-all">
                          {selectedPayment.transactionId}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Cập nhật trạng thái */}
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 space-y-4">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
                    Cập nhật trạng thái thanh toán
                  </h4>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Trạng thái thanh toán</label>
                    <select
                      value={paymentStatusForm}
                      onChange={(e) => setPaymentStatusForm(e.target.value as PaymentStatus)}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    >
                      <option value="PENDING">Chờ thanh toán</option>
                      <option value="PAID">Đã thanh toán</option>
                      <option value="FAILED">Thất bại</option>
                      <option value="REFUND_PENDING">Chờ hoàn tiền</option>
                      <option value="REFUNDED">Đã hoàn tiền</option>
                    </select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDetailModal(false)}
                      className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdatePaymentStatus}
                      disabled={updating || paymentStatusForm === selectedPayment.paymentStatus}
                      className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {updating ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;

