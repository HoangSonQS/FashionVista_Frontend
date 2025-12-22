import { useEffect, useMemo, useState } from 'react';
import { axiosClient } from '../../services/axiosClient';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface AdminReview {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  userId: number;
  userName: string;
  userEmail: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface AdminReviewPage {
  content: AdminReview[];
  totalPages: number;
  number: number;
}

interface ReviewOverview {
  totalReviews: number;
  avgRating: number;
  positiveRate: number;
  negativeRate: number;
  ratingCounts: Record<number, number>;
}

interface ReviewTrendPoint {
  date: string;
  count: number;
  avgRating: number;
}

interface TopProduct {
  productId: number;
  productName: string;
  productSlug: string;
  thumbnailUrl: string | null;
  reviewCount: number;
  avgRating: number;
  negativeRate: number;
}

const RATING_OPTIONS = [
  { label: 'Tất cả', value: '' },
  { label: '1 sao', value: '1' },
  { label: '2 sao', value: '2' },
  { label: '3 sao', value: '3' },
  { label: '4 sao', value: '4' },
  { label: '5 sao', value: '5' },
];

const AdminReviews = () => {
  const [overview, setOverview] = useState<ReviewOverview | null>(null);
  const [trend, setTrend] = useState<ReviewTrendPoint[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [data, setData] = useState<AdminReviewPage | null>(null);
  const [page, setPage] = useState(0);
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [loading, setLoading] = useState(false);
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [topLoading, setTopLoading] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({
      productId: selectedProductId || undefined,
      rating: ratingFilter || undefined,
      search: debouncedSearch || undefined,
      page,
      size: 20,
    }),
    [selectedProductId, ratingFilter, debouncedSearch, page],
  );

  const maxTrendCount = useMemo(
    () => (trend.length > 0 ? Math.max(...trend.map((t) => t.count)) : 0),
    [trend],
  );

  useEffect(() => {
    const fetchOverviewAndTop = async () => {
      try {
        setOverviewLoading(true);
        setTopLoading(true);
        const [ovRes, topRes] = await Promise.all([
          axiosClient.get<ReviewOverview>('/admin/reviews/analytics/overview'),
          axiosClient.get<TopProduct[]>('/admin/reviews/analytics/top-products', { params: { limit: 5 } }),
        ]);
        setOverview(ovRes.data);
        setTopProducts(topRes.data);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Không thể tải dữ liệu tổng quan đánh giá.';
        showToast(msg, 'error');
      } finally {
        setOverviewLoading(false);
        setTopLoading(false);
      }
    };

    const fetchTrend = async () => {
      try {
        const res = await axiosClient.get<ReviewTrendPoint[]>('/admin/reviews/analytics/trend', {
          params: { days: 30 },
        });
        setTrend(res.data);
      } catch {
        // im lặng, không chặn UI chính
      }
    };

    fetchOverviewAndTop();
    fetchTrend();
  }, [showToast]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosClient.get<AdminReviewPage>('/admin/reviews', { params: filters });
        setData(res.data);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Không thể tải danh sách đánh giá.';
        showToast(msg, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, showToast]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa review này?')) return;
    try {
      setDeletingId(id);
      await axiosClient.delete(`/admin/reviews/${id}`);
      showToast('Đã xóa review.', 'success');
      const res = await axiosClient.get<AdminReviewPage>('/admin/reviews', { params: filters });
      setData(res.data);
      if (selectedReview?.id === id) {
        setSelectedReview(null);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Không thể xóa review.';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      {/* Overview / Analytics */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Quản lý đánh giá</h1>
            <p className="text-sm text-[var(--muted-foreground)]">
              Tổng quan chất lượng đánh giá & quản lý feedback khách hàng
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {overviewLoading && !overview ? (
            <div className="col-span-2 md:col-span-4 h-16 rounded-xl bg-[var(--muted)]/40 animate-pulse" />
          ) : (
            <>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-1">
                <p className="text-xs text-[var(--muted-foreground)]">Tổng số đánh giá</p>
                <p className="text-lg font-semibold">{overview?.totalReviews ?? 0}</p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-1">
                <p className="text-xs text-[var(--muted-foreground)]">Rating trung bình</p>
                <p className="text-lg font-semibold">
                  {overview ? overview.avgRating.toFixed(2) : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-1">
                <p className="text-xs text-[var(--muted-foreground)]">% đánh giá tích cực (4–5★)</p>
                <p className="text-lg font-semibold text-emerald-600">
                  {overview ? `${Math.round(overview.positiveRate * 100)}%` : '-'}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-1">
                <p className="text-xs text-[var(--muted-foreground)]">% đánh giá tiêu cực (1–2★)</p>
                <p className="text-lg font-semibold text-rose-600">
                  {overview ? `${Math.round(overview.negativeRate * 100)}%` : '-'}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Rating distribution & trend (simple) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-2">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">Phân bố rating</p>
            <div className="space-y-1 text-xs">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = overview?.ratingCounts?.[star] ?? 0;
                const total = overview?.totalReviews ?? 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="w-10">{star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-[var(--muted)]/40 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-[var(--primary)]"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 space-y-2">
            <p className="text-xs font-semibold text-[var(--muted-foreground)]">
              Xu hướng số lượng đánh giá (30 ngày)
            </p>
            <div className="h-24 flex items-end gap-1 border-b border-[var(--border)] pb-1">
              {trend.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">Chưa đủ dữ liệu.</p>
              ) : (
                trend.map((t) => {
                  const h = maxTrendCount > 0 ? (t.count / maxTrendCount) * 100 : 0;
                  return (
                    <div key={t.date} className="flex-1 flex flex-col items-center">
                      <div
                        className="w-full bg-[var(--primary)]/60 rounded-t"
                        style={{ height: `${h}%` }}
                        title={`${t.date}: ${t.count} reviews, avg ${t.avgRating.toFixed(2)}`}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content: Product-centric (left) + Review table (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.7fr)] gap-4">
        {/* Product insights */}
        <div className="space-y-3">
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3">
            <p className="text-sm font-semibold mb-2">Sản phẩm nổi bật theo đánh giá</p>
            {topLoading && topProducts.length === 0 ? (
              <div className="h-24 rounded-xl bg-[var(--muted)]/40 animate-pulse" />
            ) : topProducts.length === 0 ? (
              <p className="text-xs text-[var(--muted-foreground)]">Chưa có dữ liệu đánh giá.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {topProducts.map((p) => (
                  <button
                    key={p.productId}
                    type="button"
                    onClick={() => {
                      setSelectedProductId((prev) => (prev === p.productId ? null : p.productId));
                      setPage(0);
                    }}
                    className={`w-full flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors ${
                      selectedProductId === p.productId
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10'
                        : 'border-[var(--border)] hover:bg-[var(--muted)]/40'
                    }`}
                  >
                    {p.thumbnailUrl && (
                      <img
                        src={p.thumbnailUrl}
                        alt={p.productName}
                        className="w-8 h-8 rounded object-cover border border-[var(--border)]"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-xs">{p.productName}</p>
                      <p className="text-[10px] text-[var(--muted-foreground)] truncate">
                        {p.productSlug}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {p.reviewCount} review
                      </span>
                      <span className="text-[10px] font-semibold">
                        {p.avgRating.toFixed(1)}★
                      </span>
                      {p.negativeRate > 0.2 ? (
                        <span className="text-[10px] text-rose-600">⚠ {Math.round(p.negativeRate * 100)}% xấu</span>
                      ) : p.avgRating >= 4.5 ? (
                        <span className="text-[10px] text-emerald-600">⭐ Đánh giá cao</span>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Review table */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Tìm sản phẩm, khách hàng..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm w-64"
              />
              <select
                value={ratingFilter}
                onChange={(e) => {
                  setRatingFilter(e.target.value);
                  setPage(0);
                }}
                className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm"
              >
                {RATING_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--muted)]/40 text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 text-left">Sản phẩm</th>
                <th className="px-4 py-3 text-left">Khách hàng</th>
                <th className="px-4 py-3 text-left">Rating</th>
                <th className="px-4 py-3 text-left">Nội dung</th>
                <th className="px-4 py-3 text-left">Ngày</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && (!data || data.content.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[var(--muted-foreground)]">
                    Chưa có đánh giá nào.
                  </td>
                </tr>
              )}
              {data?.content.map((r: AdminReview) => (
                <tr
                  key={r.id}
                  className="border-t border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{r.productName}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{r.productSlug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium">{r.userName}</span>
                      <span className="text-xs text-[var(--muted-foreground)]">{r.userEmail}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">{'★'.repeat(r.rating)}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{r.comment}</td>
                  <td className="px-4 py-3">
                    {new Date(r.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedReview(r)}
                        className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                      >
                        Xem
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(r.id)}
                        disabled={deletingId === r.id}
                        className="rounded-lg border border-[var(--error)] text-[var(--error)] px-3 py-1 text-xs hover:bg-[var(--error)]/10 disabled:opacity-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] text-sm">
            <span className="text-[var(--muted-foreground)]">
              Trang {data.number + 1} / {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)]"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)]"
              >
                Sau
              </button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 z-[9999] bg-[var(--overlay)] flex items-center justify-center px-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Chi tiết đánh giá</h2>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Sản phẩm: {selectedReview.productName}
                </p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Khách hàng: {selectedReview.userName} ({selectedReview.userEmail})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="rounded-lg p-1 hover:bg-[var(--muted)]"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Rating</p>
              <p className="text-lg">{'★'.repeat(selectedReview.rating)}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Nội dung</p>
              <p className="text-sm whitespace-pre-wrap">{selectedReview.comment || '(Không có nội dung)'}</p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-[var(--muted-foreground)]">
                Tạo lúc: {new Date(selectedReview.createdAt).toLocaleString('vi-VN')}
              </p>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminReviews;


