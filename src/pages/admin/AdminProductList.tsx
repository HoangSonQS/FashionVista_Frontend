import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { adminProductService } from '../../services/adminProductService';
import type { ProductListItem, ProductListResponse, ProductImportResult, ProductDetail, ProductVariant } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';

const statusOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang bán', value: 'ACTIVE' },
  { label: 'Ẩn', value: 'INACTIVE' },
  { label: 'Hết hàng', value: 'OUT_OF_STOCK' },
];

const AdminProductList = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importResult, setImportResult] = useState<ProductImportResult | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedProducts, setExpandedProducts] = useState<Set<number>>(new Set());
  const [productVariants, setProductVariants] = useState<Record<number, ProductVariant[]>>({});
  const [loadingVariants, setLoadingVariants] = useState<Set<number>>(new Set());

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
  }, [filters, refreshKey]);

  const handleToggleVariants = async (productId: number) => {
    if (expandedProducts.has(productId)) {
      // Collapse
      setExpandedProducts((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
      return;
    }

    // Expand - fetch variants
    setLoadingVariants((prev) => new Set(prev).add(productId));
    try {
      const productDetail = await adminProductService.getProduct(productId);
      setProductVariants((prev) => ({
        ...prev,
        [productId]: productDetail.variants || [],
      }));
      setExpandedProducts((prev) => new Set(prev).add(productId));
    } catch (err) {
      showToast('Không thể tải thông tin biến thể.', 'error');
    } finally {
      setLoadingVariants((prev) => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

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

  const handleDownloadTemplate = async () => {
    try {
      const blob = await adminProductService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'product_template.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showToast('Không thể tải template.', 'error');
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await adminProductService.exportProducts({
        search: filters.search,
        status: filters.status,
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'products.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      showToast('Xuất file thành công.', 'success');
    } catch (err) {
      showToast('Không thể xuất file.', 'error');
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    if (!file) {
      showToast('Vui lòng chọn file CSV để import.', 'warning');
      return;
    }
    try {
      setImporting(true);
      const result = await adminProductService.importProducts(file);
      setImportResult(result);
      showToast(`Import xong: +${result.createdCount} tạo, +${result.updatedCount} cập nhật`, 'success');
      // reload data từ server để thấy product mới
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      showToast('Không thể import sản phẩm.', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Quản lý sản phẩm
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Theo dõi và cập nhật danh sách sản phẩm đang bán.</p>
        </div>
        <Link
          to="/admin/products/new"
          className="inline-flex items-center justify-center rounded-full bg-[var(--card)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--card)]/90 transition-colors"
        >
          + Thêm sản phẩm
        </Link>
      </div>

      <div className="bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)] p-4 md:p-6 mb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--primary-foreground)] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Tải template CSV
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--muted)] px-4 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {exporting ? 'Đang xuất...' : 'Xuất CSV'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t lg:border-t-0 border-[var(--border)] pt-4 lg:pt-0 w-full lg:w-auto">
            <div className="flex items-center gap-3 text-xs md:text-sm text-[var(--muted-foreground)] w-full lg:w-auto">
              <span className="whitespace-nowrap font-medium">Import CSV:</span>
              <label className="flex-1 lg:flex-none cursor-pointer">
                <span className="sr-only">Chọn file CSV</span>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-xs md:text-sm text-[var(--muted-foreground)] file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs md:file:text-sm file:font-medium file:bg-[var(--primary)]/10 file:text-[var(--primary)] hover:file:bg-[var(--primary)]/15"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleImport}
              disabled={importing}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)]/10 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {importing ? 'Đang import...' : 'Thực hiện import'}
            </button>
          </div>
        </div>
        {importResult && (
          <div className="text-xs text-[var(--muted-foreground)] space-y-1">
            <p>
              Đã tạo: {importResult.createdCount} | Đã cập nhật: {importResult.updatedCount}{' '}
              {importResult.errors.length > 0 ? `(Lỗi: ${importResult.errors.length})` : ''}
            </p>
            {importResult.errors.length > 0 && (
              <details className="text-[var(--error)]">
                <summary>Lỗi import</summary>
                <ul className="list-disc pl-5 space-y-0.5">
                  {importResult.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        )}
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
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        <table className="min-w-full text-sm">
          <thead className="bg-[var(--muted)] text-left text-[var(--muted-foreground)]">
            <tr>
              <th className="px-4 py-3 font-medium">Sản phẩm</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Danh mục</th>
              <th className="px-4 py-3 font-medium">Giá</th>
              <th className="px-4 py-3 font-medium">Sale</th>
              <th className="px-4 py-3 font-medium">Tồn kho</th>
              <th className="px-4 py-3 font-medium">Trạng thái</th>
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
              data.items.map((item) => {
                const hasVariants = (item.variantsCount || 0) > 0;
                const isExpanded = expandedProducts.has(item.id);
                const variants = productVariants[item.id] || [];
                
                return (
                  <React.Fragment key={item.id}>
                    <tr className="border-t border-[var(--border)] hover:bg-[var(--muted)]/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {hasVariants && (
                            <button
                              type="button"
                              onClick={() => handleToggleVariants(item.id)}
                              className="p-1 hover:bg-[var(--muted)] rounded transition-colors"
                              disabled={loadingVariants.has(item.id)}
                            >
                              {loadingVariants.has(item.id) ? (
                                <span className="text-xs">...</span>
                              ) : isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{item.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">{item.sku ?? '—'}</td>
                      <td className="px-4 py-3">{item.category ?? '—'}</td>
                      <td className="px-4 py-3">{item.price.toLocaleString('vi-VN')}₫</td>
                      <td className="px-4 py-3">
                        {typeof item.compareAtPrice === 'number' && item.compareAtPrice > item.price ? (
                          <span className="inline-flex items-center rounded-full bg-[var(--error-bg)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--error)]">
                            Sale
                          </span>
                        ) : (
                          <span className="text-xs text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {hasVariants ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-[var(--primary)]">
                              {item.totalStock?.toLocaleString('vi-VN') || 0}
                            </span>
                            <span className="text-xs text-[var(--muted-foreground)]">
                              ({item.variantsCount} biến thể)
                            </span>
                          </div>
                        ) : (
                          <span className="font-medium">
                            {item.totalStock?.toLocaleString('vi-VN') || 0}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === 'ACTIVE' ? 'bg-[var(--success-bg)] text-[var(--success)]' : 'bg-[var(--muted)] text-[var(--foreground)]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 space-x-2">
                        <Link
                          to={`/admin/products/${item.id}/edit`}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                        >
                          Chỉnh sửa
                        </Link>
                        <Link
                          to={`/admin/products/${item.id}/images`}
                          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                        >
                          Quản lý ảnh
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(item)}
                          disabled={updatingId === item.id}
                          className="rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)] disabled:opacity-50"
                        >
                          {item.status === 'ACTIVE' ? 'Ẩn' : 'Bật'}
                        </button>
                      </td>
                    </tr>
                    {/* Expanded variants row */}
                    {hasVariants && isExpanded && variants.length > 0 && (
                      <tr className="border-t border-[var(--border)] bg-[var(--muted)]/20">
                        <td colSpan={8} className="px-4 py-3">
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-2">
                              Biến thể ({variants.length})
                            </p>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="border-b border-[var(--border)]">
                                    <th className="px-3 py-2 text-left font-medium">SKU</th>
                                    <th className="px-3 py-2 text-left font-medium">Size</th>
                                    <th className="px-3 py-2 text-left font-medium">Color</th>
                                    <th className="px-3 py-2 text-right font-medium">Giá</th>
                                    <th className="px-3 py-2 text-right font-medium">Tồn kho</th>
                                    <th className="px-3 py-2 text-center font-medium">Trạng thái</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {variants.map((variant) => (
                                    <tr key={variant.id} className="border-b border-[var(--border)]/50">
                                      <td className="px-3 py-2 font-mono text-[10px]">{variant.sku}</td>
                                      <td className="px-3 py-2">{variant.size || '—'}</td>
                                      <td className="px-3 py-2">{variant.color || '—'}</td>
                                      <td className="px-3 py-2 text-right">{variant.price.toLocaleString('vi-VN')}₫</td>
                                      <td className="px-3 py-2 text-right">
                                        <span className={`font-medium ${variant.stock === 0 ? 'text-[var(--error)]' : variant.stock < 10 ? 'text-orange-600' : 'text-[var(--success)]'}`}>
                                          {variant.stock.toLocaleString('vi-VN')}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span
                                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${
                                            variant.active
                                              ? 'bg-[var(--success-bg)] text-[var(--success)]'
                                              : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                                          }`}
                                        >
                                          {variant.active ? 'Hoạt động' : 'Ẩn'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
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

export default AdminProductList;



