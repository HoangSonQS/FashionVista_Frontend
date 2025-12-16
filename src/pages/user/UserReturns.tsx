import { useEffect, useMemo, useState } from 'react';
import { returnService } from '../../services/returnService';
import type { ReturnRequestResponse, ReturnStatus } from '../../types/return';

const STATUS_LABEL: Record<ReturnStatus, string> = {
  REQUESTED: 'Yêu cầu đổi trả',
  APPROVED: 'Đã hoàn trả',
  REJECTED: 'Từ chối',
  REFUND_PENDING: 'Đang hoàn tiền',
  REFUNDED: 'Đã hoàn tiền',
};

const STATUS_BADGE: Record<ReturnStatus, string> = {
  REQUESTED: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  APPROVED: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  REJECTED: 'bg-[var(--error-bg)] text-[var(--error)]',
  REFUND_PENDING: 'bg-[var(--warning-bg)] text-[var(--warning)]',
  REFUNDED: 'bg-[var(--muted)] text-[var(--foreground)]',
};

const formatCurrency = (value: number | null | undefined) =>
  value != null ? `${value.toLocaleString('vi-VN')}₫` : '—';

const formatDateTime = (value: string | undefined) =>
  value ? new Date(value).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const UserReturnsPage = () => {
  const [data, setData] = useState<ReturnRequestResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReturns = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await returnService.listMine();
        setData(res.content ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải yêu cầu đổi trả.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void fetchReturns();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return data;
    return data.filter((item) => item.status === statusFilter);
  }, [data, statusFilter]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Yêu cầu đổi trả
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Theo dõi trạng thái các yêu cầu đổi trả và tiền hoàn.
          </p>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReturnStatus | 'ALL')}
              className="rounded-full border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="REQUESTED">Yêu cầu đổi trả</option>
              <option value="APPROVED">Đã hoàn trả</option>
              <option value="REFUND_PENDING">Đang hoàn tiền</option>
              <option value="REFUNDED">Đã hoàn tiền</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </header>

        {loading && (
          <p className="text-sm text-[var(--muted-foreground)]">Đang tải yêu cầu đổi trả...</p>
        )}

        {error && !loading && (
          <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="text-sm text-[var(--muted-foreground)]">Chưa có yêu cầu đổi trả nào.</p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-[var(--muted-foreground)]">
                      Mã đơn {item.orderNumber}
                    </p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      Tạo: {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${STATUS_BADGE[item.status]}`}
                  >
                    {STATUS_LABEL[item.status]}
                  </span>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-semibold">Lý do</p>
                  <p className="text-[var(--muted-foreground)]">{item.reason}</p>
                  {item.note && (
                    <>
                      <p className="font-semibold mt-1">Ghi chú</p>
                      <p className="text-[var(--muted-foreground)] whitespace-pre-wrap">{item.note}</p>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold">Sản phẩm</p>
                  <div className="space-y-2">
                    {item.items.map((p) => (
                      <div
                        key={p.orderItemId}
                        className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2 text-xs"
                      >
                        <div>
                          <p className="font-medium">{p.productName}</p>
                          <p className="text-[var(--muted-foreground)]">SL: {p.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">{formatCurrency(p.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <span className="text-[var(--muted-foreground)]">Tiền hoàn dự kiến:</span>
                    <span className="font-semibold text-[var(--primary)]">{formatCurrency(item.refundAmount)}</span>
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    Cập nhật: {formatDateTime(item.updatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReturnsPage;

