import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminProductService } from '../../services/adminProductService';
import type { ProductListItem, ProductListResponse } from '../../types/product';

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang bán', value: 'ACTIVE' },
  { label: 'Ẩn', value: 'INACTIVE' },
  { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
];

const AdminProductList = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status || undefined,
      page,
      size: 15,
    }),
    [search, status, page],
  );

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await adminProductService.getProducts(filters);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts().catch(() => setError('Không thể tải danh sách sản phẩm.'));
  }, [filters]);

  const handleToggleStatus = async (item: ProductListItem) => {
    const nextStatus = item.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      setUpdatingId(item.id);
      await adminProductService.updateStatus(item.id, { status: nextStatus });
      setData((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.map((product) => (product.id === item.id ? { ...product, status: nextStatus } : product)),
            }
          : prev,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-slate-400">Theo dõi và cập nhật danh sách sản phẩm đang bán.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-white transition-colors"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="search"
          placeholder="Tìm theo tên, SKU..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          {statusOptions.map((option) => (
            <option value={option.value} key={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p className="text-sm text-red-300">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-900/60 text-left text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Danh mục</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
              <th className="px-4 py-3 font-medium">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((item) => (
                <tr key={item.id} className="border-t border-slate-800">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-slate-400">{item.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.sku ?? '—'}</td>
                  <td className="px-4 py-3">{item.category ?? '—'}</td>
                  <td className="px-4 py-3">{item.price.toLocaleString('vi-VN')}₫</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Link
                      to={`/admin/products/${item.id}/edit`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800"
                    >
                      Chỉnh sửa
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(item)}
                      disabled={updatingId === item.id}
                      className="rounded-full border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800 disabled:opacity-50"
                    >
                      {item.status === 'ACTIVE' ? 'Ẩn' : 'Bật'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            Trang {data.page + 1}/{data.totalPages}
          </span>
          <div className="space-x-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page + 1 >= data.totalPages}
              onClick={() => setPage((prev) => prev + 1)}
              className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductList;



