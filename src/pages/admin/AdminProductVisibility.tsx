import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminProductService } from '../../services/adminProductService';
import type { ProductListItem, ProductListResponse } from '../../types/product';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

const statusOptions = [
  { label: 'Tất cả trạng thái', value: '' },
  { label: 'Đang bán', value: 'ACTIVE' },
  { label: 'Ẩn', value: 'INACTIVE' },
  { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
];

const visibleOptions = [
  { label: 'Tất cả hiển thị', value: '' },
  { label: 'Đang hiển thị', value: 'true' },
  { label: 'Đang ẩn', value: 'false' },
];

const PAGE_SIZE = 15;

const AdminProductVisibility = () => {
  const { toasts, showToast, removeToast } = useToast();

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [visible, setVisible] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Debounce search theo tên/SKU để giảm số lần gọi API
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 400);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const filters = useMemo(() => {
    const parsedVisible = visible === '' ? undefined : visible === 'true';
    return {
      search: search || undefined,
      status: status || undefined,
      visible: parsedVisible,
      page,
      size: PAGE_SIZE,
    };
  }, [search, status, visible, page]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminProductService.getProducts(filters);
        setData(response);
        setSelectedIds([]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts().catch(() => setError('Không thể tải danh sách sản phẩm.'));
  }, [filters]);

  const toggleSelectAll = () => {
    if (!data?.items) return;
    if (selectedIds.length === data.items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.items.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]));
  };

  const handleToggleVisibility = async (item: ProductListItem) => {
    const nextVisible = !(item.isVisible ?? true);
    try {
      setUpdatingId(item.id);
      await adminProductService.updateVisibility(item.id, nextVisible);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p) =>
                p.id === item.id
                  ? {
                      ...p,
                      isVisible: nextVisible,
                      visibleUpdatedAt: new Date().toISOString(),
                    }
                  : p,
              ),
            }
          : prev,
      );
      showToast('Cập nhật hiển thị sản phẩm thành công', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể cập nhật hiển thị sản phẩm. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleBulkVisibility = async (visibleValue: boolean) => {
    if (selectedIds.length === 0) {
      showToast('Vui lòng chọn ít nhất một sản phẩm.', 'warning');
      return;
    }
    try {
      setBulkUpdating(true);
      await adminProductService.updateVisibilityBulk(selectedIds, visibleValue);
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((p) =>
                selectedIds.includes(p.id)
                  ? {
                      ...p,
                      isVisible: visibleValue,
                      visibleUpdatedAt: new Date().toISOString(),
                    }
                  : p,
              ),
            }
          : prev,
      );
      setSelectedIds([]);
      showToast('Cập nhật hiển thị hàng loạt thành công', 'success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể cập nhật hiển thị hàng loạt. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setBulkUpdating(false);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Quản lý hiển thị sản phẩm
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Toggle hiển thị, lọc Visible/Hidden và thao tác bulk.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleBulkVisibility(true)}
            disabled={bulkUpdating || selectedIds.length === 0}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
          >
            Bật hiển thị
          </button>
          <button
            type="button"
            onClick={() => handleBulkVisibility(false)}
            disabled={bulkUpdating || selectedIds.length === 0}
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-50"
          >
            Ẩn hàng loạt
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="search"
          placeholder="Tìm theo tên, SKU..."
          value={searchInput}
          onChange={(e) => {
            setSearchInput(e.target.value);
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
          {statusOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={visible}
          onChange={(e) => {
            setVisible(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {visibleOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error ? <p className="text-sm text-[var(--error)]">{error}</p> : <div />}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">
                <input
                  type="checkbox"
                  checked={data?.items?.length ? selectedIds.length === data.items.length : false}
                  onChange={toggleSelectAll}
                  aria-label="Chọn tất cả"
                />
              </th>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Biến thể</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Hiển thị</th>
              <th className="px-4 py-3 font-medium">Cập nhật</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--muted-foreground)]">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectOne(item.id)}
                      aria-label={`Chọn sản phẩm ${item.name}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-start gap-3">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.name}
                          className="h-12 w-12 rounded-md object-cover border border-[var(--border)]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-[var(--muted)] border border-[var(--border)]" />
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{item.slug}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">{item.category ?? '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.sku ?? '—'}</td>
                  <td className="px-4 py-3">{item.variantsCount ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === 'ACTIVE'
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--muted)] text-[var(--foreground)]'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(item)}
                      disabled={updatingId === item.id}
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border ${
                        item.isVisible
                          ? 'bg-[var(--success-bg)] text-[var(--success)] border-[var(--success)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
                      } disabled:opacity-50`}
                    >
                      <span className="block h-2 w-2 rounded-full bg-current" />
                      {item.isVisible ? 'Visible' : 'Hidden'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-[var(--muted-foreground)]">
                    {formatDate(item.visibleUpdatedAt)}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Link
                      to={`/admin/products/${item.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                    >
                      Chỉnh sửa
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-[var(--muted-foreground)]">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <span>
            Trang {data.page + 1}/{data.totalPages}
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

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminProductVisibility;

