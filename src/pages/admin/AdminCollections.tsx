import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminCollectionService, type AdminPagedCollectionResponse } from '../../services/adminCollectionService';
import type { CollectionSummary } from '../../types/collection';

const AdminCollections = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [visible, setVisible] = useState<string>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminPagedCollectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const filters = useMemo(
    () => ({
      keyword: search.trim() || undefined,
      status: status || undefined,
      visible: visible === '' ? undefined : visible === 'true',
      page,
      size: 15,
    }),
    [search, status, visible, page],
  );

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminCollectionService.search(filters);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách bộ sưu tập.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCollections();
  }, [filters]);

  const resetForm = () => {
    // no inline form now
  };

  const handleToggleVisible = async (item: CollectionSummary) => {
    try {
      await adminCollectionService.updateVisibility(item.id, !item.visible);
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((c) =>
                c.id === item.id ? { ...c, visible: !c.visible } : c,
              ),
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật hiển thị.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Bộ sưu tập
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Quản lý các bộ sưu tập chiến dịch, landing và grouping sản phẩm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate('/admin/collections/new')}
          className="inline-flex items-center justify-center rounded-full bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card)]/90 transition-colors"
        >
          + Tạo bộ sưu tập
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="search"
          placeholder="Tìm theo tên, slug..."
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
          <option value="">Tất cả trạng thái</option>
          <option value="DRAFT">Draft</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="ACTIVE">Active</option>
          <option value="ENDED">Ended</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          value={visible}
          onChange={(e) => {
            setVisible(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Hiển thị (tất cả)</option>
          <option value="true">Đang hiển thị</option>
          <option value="false">Đang ẩn</option>
        </select>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Tên bộ sưu tập</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Hiển thị</th>
              <th className="px-4 py-3 font-medium">Thời gian</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[var(--muted-foreground)]">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.content.length > 0 ? (
              data.content.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.slug}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-[var(--muted)] px-3 py-1 text-xs font-semibold">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleVisible(item)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.visible
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--muted)] text-[var(--foreground)]'
                      }`}
                    >
                      {item.visible ? 'Đang hiển thị' : 'Đang ẩn'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                    {item.startAt ? `Từ ${new Date(item.startAt).toLocaleString('vi-VN')}` : '—'}
                    <br />
                    {item.endAt ? `Đến ${new Date(item.endAt).toLocaleString('vi-VN')}` : '—'}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/collections/${item.id}/edit`)}
                      className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                    >
                      Chỉnh sửa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-[var(--muted-foreground)]">
                  Chưa có bộ sưu tập nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>
            Trang {data.number + 1}/{data.totalPages}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollections;


