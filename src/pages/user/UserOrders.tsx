import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import type { OrderResponse } from '../../types/order';

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Chờ duyệt',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  RETURN_REQUESTED: 'Yêu cầu đổi trả',
  RETURN_APPROVED: 'Đã hoàn trả',
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
      return 'bg-[var(--primary)]/10 text-[var(--primary)]';
    case 'SHIPPING':
      return 'bg-[var(--primary)]/10 text-[var(--primary)]';
    case 'DELIVERED':
      return 'bg-[var(--success-bg)] text-[var(--success)]';
    case 'RETURN_REQUESTED':
      return 'bg-[var(--warning-bg)] text-[var(--warning)]';
    case 'RETURN_APPROVED':
      return 'bg-[var(--warning-bg)] text-[var(--warning)]';
    case 'CANCELLED':
    case 'RETURNED':
    case 'REFUNDED':
      return 'bg-[var(--error-bg)] text-[var(--error)]';
    default:
      return 'bg-[var(--muted)] text-[var(--muted-foreground)]';
  }
};

const UserOrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as
    | { recentOrderNumber?: string; statusFilter?: string }
    | undefined;

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(
    locationState?.statusFilter || 'ALL',
  );
  const [dateFilter, setDateFilter] = useState<'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS'>('ALL');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await orderService.getOrders();
        // Sắp xếp mới nhất lên trên
        const sorted = [...data].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(sorted);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng của bạn.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    void fetchOrders();
  }, []);

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date().getTime();

    return orders.filter((order) => {
      // Lọc theo trạng thái
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }

      // Lọc theo khoảng thời gian
      if (dateFilter !== 'ALL') {
        const created = new Date(order.createdAt).getTime();
        const diffDays = (now - created) / (1000 * 60 * 60 * 24);
        if (dateFilter === 'LAST_7_DAYS' && diffDays > 7) {
          return false;
        }
        if (dateFilter === 'LAST_30_DAYS' && diffDays > 30) {
          return false;
        }
      }

      // Lọc theo từ khóa
      if (!term) return true;
      if (order.orderNumber.toLowerCase().includes(term)) return true;
      if (
        order.items.some(
          (item) =>
            item.productName.toLowerCase().includes(term) ||
            (item.productSlug && item.productSlug.toLowerCase().includes(term)),
        )
      ) {
        return true;
      }
      return false;
    });
  }, [orders, search, statusFilter, dateFilter]);

  const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Đơn hàng của tôi
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Theo dõi trạng thái và lịch sử các đơn hàng bạn đã đặt.
          </p>
          {locationState?.recentOrderNumber && (
            <div className="mt-2 rounded-xl border border-[var(--success)] bg-[var(--success-bg)] px-4 py-2 text-sm text-[var(--success-foreground)]">
              Đặt hàng thành công! Mã đơn của bạn là{' '}
              <span className="font-semibold">{locationState.recentOrderNumber}</span>. Bạn có thể
              theo dõi trạng thái tại đây.
            </div>
          )}
        </header>

        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 flex gap-2">
            <input
              type="search"
              placeholder="Tìm theo mã đơn hoặc tên sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 rounded-full border border-[var(--border)] bg-[var(--input-background)] px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="PROCESSING">Đang xử lý</option>
              <option value="SHIPPING">Đang giao</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="RETURN_REQUESTED">Yêu cầu đổi trả</option>
              <option value="RETURN_APPROVED">Đã hoàn trả</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="RETURNED">Đã trả</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'ALL' | 'LAST_7_DAYS' | 'LAST_30_DAYS')}
              className="rounded-full border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="ALL">Mọi thời gian</option>
              <option value="LAST_7_DAYS">7 ngày gần đây</option>
              <option value="LAST_30_DAYS">30 ngày gần đây</option>
            </select>
          </div>
        </section>

        <section className="space-y-4">
          {loading && (
            <p className="text-sm text-[var(--muted-foreground)]">Đang tải đơn hàng của bạn...</p>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {/* Empty states */}
          {!loading && !error && filteredOrders.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] px-6 py-8 text-center space-y-3">
              {orders.length === 0 && !search.trim() && statusFilter === 'ALL' && dateFilter === 'ALL' ? (
                <>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Bạn chưa có đơn hàng nào.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/products')}
                    className="mt-2 inline-flex items-center justify-center rounded-full border border-[var(--primary)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-colors"
                  >
                    Tiếp tục mua sắm
                  </button>
                </>
              ) : (
                <>
                  <p className="text-sm text-[var(--muted-foreground)]">
                    Không tìm thấy đơn hàng phù hợp với bộ lọc hiện tại.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('ALL');
                      setDateFilter('ALL');
                    }}
                    className="mt-2 inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </>
              )}
            </div>
          )}

          {!loading && !error && filteredOrders.length > 0 && (
            <div className="space-y-3">
              {filteredOrders.map((order) => (
                <button
                  type="button"
                  key={order.id}
                  onClick={() => navigate(`/orders/${order.orderNumber}`)}
                  className="w-full text-left rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-transform"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                        Mã đơn
                      </p>
                      <p className="font-semibold text-sm sm:text-base">{order.orderNumber}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        Ngày đặt:{' '}
                        {new Date(order.createdAt).toLocaleString('vi-VN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-start gap-1 sm:items-end">
                      {/* Badge "Mới" cho đơn vừa tạo */}
                      {(locationState?.recentOrderNumber === order.orderNumber) && (
                        <span className="inline-flex items-center rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
                          Mới
                        </span>
                      )}
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(order.status)}`}
                      >
                        {STATUS_LABEL[order.status] ?? order.status}
                      </span>
                      <p className="text-xs text-[var(--muted-foreground)]">
                        {order.items.length} sản phẩm
                      </p>
                      <p className="text-sm font-semibold text-[var(--primary)]">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default UserOrdersPage;


