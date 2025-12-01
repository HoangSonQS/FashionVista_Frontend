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
  const locationState = location.state as { recentOrderNumber?: string } | undefined;

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
    return orders.filter((order) => {
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }
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
  }, [orders, search, statusFilter]);

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
          <div className="flex gap-2">
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
              <option value="CANCELLED">Đã hủy</option>
              <option value="RETURNED">Đã trả</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
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

          {!loading && !error && filteredOrders.length === 0 && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Bạn chưa có đơn hàng nào hoặc không tìm thấy đơn hàng phù hợp.
            </p>
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


