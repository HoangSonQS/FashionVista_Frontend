import { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import type { AdminOverview } from '../../types/admin';

const cards = [
  { key: 'dailyRevenue', label: 'Doanh thu hôm nay' },
  { key: 'monthlyRevenue', label: 'Doanh thu tháng' },
  { key: 'yearlyRevenue', label: 'Doanh thu năm' },
  { key: 'conversionRate', label: 'Tỷ lệ chuyển đổi', suffix: '%' },
] as const;

const AdminDashboard = () => {
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        const data = await adminService.getOverview();
        setOverview(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu.');
      } finally {
        setLoading(false);
      }
    };
    fetchOverview().catch(() => setError('Không thể tải dữ liệu.'));
  }, []);

  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) {
      return '0₫';
    }
    const amount = typeof value === 'string' ? Number(value) : value;
    if (Number.isNaN(amount)) {
      return '0₫';
    }
    return `${amount.toLocaleString('vi-VN')}₫`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.key} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">{card.label}</p>
            <p className="text-2xl font-semibold mt-2">
              {card.key === 'conversionRate'
                ? `${overview?.conversionRate?.toFixed(2) ?? '0.00'}${card.suffix}`
                : formatCurrency(overview?.[card.key])}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Đơn hàng</p>
              <h3 className="text-lg font-semibold">Trạng thái hiện tại</h3>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-[var(--muted-foreground)]">Chờ duyệt</dt>
              <dd className="text-2xl font-semibold">{overview?.pendingOrders ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Đang giao</dt>
              <dd className="text-2xl font-semibold">{overview?.shippingOrders ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Hoàn tất</dt>
              <dd className="text-2xl font-semibold">{overview?.completedOrders ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted-foreground)]">Hủy/Hoàn tiền</dt>
              <dd className="text-2xl font-semibold">{overview?.cancelledOrders ?? 0}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Kho & khách hàng</p>
              <h3 className="text-lg font-semibold">Cảnh báo nhanh</h3>
            </div>
          </div>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2">
              <dt className="text-[var(--foreground)]">Sản phẩm sắp hết</dt>
              <dd className="text-lg font-semibold text-[var(--warning)]">{overview?.lowStockProducts ?? 0}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-[var(--muted)] px-3 py-2">
              <dt className="text-[var(--foreground)]">Khách hàng mới (7 ngày)</dt>
              <dd className="text-lg font-semibold text-[var(--success)]">{overview?.newCustomers ?? 0}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">Top sản phẩm</p>
            <h3 className="text-lg font-semibold">Bán chạy nhất</h3>
          </div>
        </div>
        {loading && <p className="text-sm text-[var(--muted-foreground)]">Đang tải dữ liệu...</p>}
        {error && !loading && <p className="text-sm text-[var(--error)]">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--muted-foreground)]">
                  <th className="py-2 font-medium">Sản phẩm</th>
                  <th className="py-2 font-medium">Số lượng</th>
                  <th className="py-2 font-medium text-right">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {overview?.topProducts?.length ? (
                  overview.topProducts.map((product) => (
                    <tr key={product.productId} className="border-t border-[var(--border)]">
                      <td className="py-3">{product.productName}</td>
                      <td className="py-3">{product.quantity}</td>
                      <td className="py-3 text-right">{formatCurrency(product.revenue)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-[var(--muted-foreground)]">
                      Chưa có dữ liệu.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;


