import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminCollectionService } from '../../services/adminCollectionService';
import { adminProductService } from '../../services/adminProductService';
import type { CollectionPayload } from '../../services/adminCollectionService';
import type { ProductListItem } from '../../types/product';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import HtmlEditor from '../../components/common/HtmlEditor';

const initialForm: CollectionPayload = {
  name: '',
  slug: '',
  description: '',
  longDescriptionHtml: '',
  heroImageUrl: '',
  status: 'ACTIVE',
  visible: true,
  startAt: '',
  endAt: '',
  seoTitle: '',
  seoDescription: '',
};

const AdminCollectionCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = !!id;
  const [form, setForm] = useState<CollectionPayload>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productOptions, setProductOptions] = useState<ProductListItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductListItem[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productPage, setProductPage] = useState(0);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMinPrice, setFilterMinPrice] = useState<string>('');
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('');
  const debouncedSearch = useDebouncedValue(productSearch, 450);
  const debouncedCategory = useDebouncedValue(filterCategory, 450);
  const debouncedMinPrice = useDebouncedValue(filterMinPrice, 450);
  const debouncedMaxPrice = useDebouncedValue(filterMaxPrice, 450);

  const hasDateError = useMemo(() => {
    if (!form.startAt || !form.endAt) return false;
    return new Date(form.endAt).getTime() < new Date(form.startAt).getTime();
  }, [form.startAt, form.endAt]);

  const handleChange = (field: keyof CollectionPayload, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value as never }));
  };

  const addProduct = (product: ProductListItem) => {
    setSelectedProducts((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeProduct = (id: number) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const moveProduct = (id: number, direction: 'up' | 'down') => {
    setSelectedProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const clearSelected = () => setSelectedProducts([]);

  const clearHeroImage = () => {
    setForm((prev) => ({ ...prev, heroImageUrl: '' }));
    setPreviewUrl('');
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setForm((prev) => ({ ...prev, heroImageUrl: result }));
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.slug.trim()) {
      setError('Vui lòng nhập tên và slug.');
      return;
    }
    if (hasDateError) {
      setError('Thời gian kết thúc phải sau hoặc bằng thời gian bắt đầu.');
      return;
    }
    setSaving(true);
    try {
      const payload: CollectionPayload = {
        ...form,
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description?.trim() ?? '',
        longDescriptionHtml: form.longDescriptionHtml ?? '',
        heroImageUrl: form.heroImageUrl?.trim() ?? '',
        seoTitle: form.seoTitle?.trim() ?? '',
        seoDescription: form.seoDescription?.trim() ?? '',
        // Gửi đúng chuỗi local datetime (yyyy-MM-ddTHH:mm) cho BE, tránh lệch múi giờ
        startAt: form.startAt || null,
        endAt: form.endAt || null,
      };
      if (isEdit && id) {
        const updated = await adminCollectionService.update(Number(id), payload);
        await adminCollectionService.setProducts(
          updated.id,
          selectedProducts.map((p) => p.id),
        );
      } else {
        const created = await adminCollectionService.create(payload);
        if (selectedProducts.length > 0) {
          await adminCollectionService.setProducts(
            created.id,
            selectedProducts.map((p) => p.id),
          );
        }
      }
      navigate('/admin/collections');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo bộ sưu tập.');
    } finally {
      setSaving(false);
    }
  };

  // Load products for selection
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const res = await adminProductService.getProducts({
          search: debouncedSearch.trim() || undefined,
          status: filterStatus || undefined,
          page: productPage,
          size: 10,
        });
        let items = res.items;
        const min = debouncedMinPrice ? Number(debouncedMinPrice) : undefined;
        const max = debouncedMaxPrice ? Number(debouncedMaxPrice) : undefined;
        if (debouncedCategory.trim()) {
          const kw = debouncedCategory.trim().toLowerCase();
          items = items.filter((p) => (p.category ?? '').toLowerCase().includes(kw));
        }
        if (!Number.isNaN(min) && min !== undefined) {
          items = items.filter((p) => p.price >= min);
        }
        if (!Number.isNaN(max) && max !== undefined) {
          items = items.filter((p) => p.price <= max);
        }
        setProductOptions(items);
        setProductTotalPages(res.totalPages);
      } catch {
        // ignore
      } finally {
        setLoadingProducts(false);
      }
    };
    void fetchProducts();
  }, [debouncedSearch, debouncedCategory, filterStatus, debouncedMinPrice, debouncedMaxPrice, productPage]);

  // Load collection detail when edit
  useEffect(() => {
    const loadDetail = async () => {
      if (!isEdit || !id) return;
      setLoadingDetail(true);
      try {
        const detail = await adminCollectionService.getDetail(Number(id));
        setForm({
          name: detail.name ?? '',
          slug: detail.slug ?? '',
          description: detail.description ?? '',
          longDescriptionHtml: detail.longDescriptionHtml ?? '',
          heroImageUrl: detail.heroImageUrl ?? '',
          status: detail.status,
          visible: detail.visible,
          startAt: detail.startAt ?? '',
          endAt: detail.endAt ?? '',
          seoTitle: detail.seoTitle ?? '',
          seoDescription: detail.seoDescription ?? '',
        });
        setPreviewUrl(detail.heroImageUrl ?? '');
        // preserve order as returned
        const mapped = (detail.products ?? []).map((p) => ({
          id: p.id,
          name: p.name,
          slug: p.slug,
          sku: p.sku,
          price: p.price,
          compareAtPrice: p.compareAtPrice ?? undefined,
          status: p.status,
          featured: p.featured,
          category: p.category ?? null,
          thumbnailUrl: p.thumbnailUrl ?? undefined,
        }));
        setSelectedProducts(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tải được bộ sưu tập.');
      } finally {
        setLoadingDetail(false);
      }
    };
    void loadDetail();
  }, [isEdit, id]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
          {isEdit ? 'Edit Collection' : 'New Collection'}
        </p>
        <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
          {isEdit ? 'Chỉnh sửa bộ sưu tập' : 'Tạo bộ sưu tập mới'}
        </h1>
        <p className="text-sm text-[var(--muted-foreground)]">
          {isEdit
            ? 'Cập nhật thông tin bộ sưu tập & danh sách sản phẩm đính kèm.'
            : 'Điền thông tin bộ sưu tập chuẩn SEO & thiết lập hiển thị.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-3 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6 shadow-sm"
      >
        {loadingDetail && isEdit && (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/30 p-3 text-sm text-[var(--muted-foreground)]">
            Đang tải dữ liệu bộ sưu tập...
          </div>
        )}
        {/* Tên & Slug */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Tên bộ sưu tập *</label>
            <input
              required
              type="text"
              placeholder="Ví dụ: Summer Sale 2025"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Slug (đường dẫn ngắn) *</label>
            <input
              required
              type="text"
              placeholder="summer-sale-2025"
              value={form.slug}
              onChange={(e) => handleChange('slug', e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Trạng thái & Visible */}
        <div className="grid gap-4 md:grid-cols-2 items-center">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">Trạng thái *</label>
            <select
              value={form.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            >
              <option value="DRAFT">DRAFT (Nháp)</option>
              <option value="SCHEDULED">SCHEDULED (Lên lịch)</option>
              <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
              <option value="ENDED">ENDED (Kết thúc)</option>
              <option value="ARCHIVED">ARCHIVED (Lưu trữ)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={form.visible ?? true}
              onChange={(e) => handleChange('visible', e.target.checked)}
            />
            Hiển thị trên menu (Visible)
          </label>
        </div>

        {/* Mô tả ngắn */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Mô tả ngắn (hiển thị tóm tắt)</label>
          <textarea
            rows={3}
            placeholder="Mô tả ngắn gọn về bộ sưu tập..."
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>

        {/* Mô tả chi tiết (rich text) */}
        <HtmlEditor
          label="Mô tả chi tiết (hiển thị trên trang bộ sưu tập)"
          value={form.longDescriptionHtml ?? ''}
          onChange={(value) => handleChange('longDescriptionHtml', value)}
          placeholder="Bạn có thể viết nội dung dài, in đậm, in nghiêng, xuống dòng..."
        />

        {/* Hình ảnh */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--muted-foreground)]">Hero / Cover Image URL</label>
          <div className="grid gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <input
              type="text"
              placeholder="https://example.com/images/banner.jpg"
              value={form.heroImageUrl}
              onChange={(e) => {
                const value = e.target.value;
                handleChange('heroImageUrl', value);
                setPreviewUrl(value || '');
              }}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <p className="text-xs text-[var(--muted-foreground)]">
              Hỗ trợ PNG/JPG, tối đa 5MB mỗi ảnh. Nếu không chọn file mới, ảnh hiện tại sẽ được giữ nguyên.
            </p>
            {previewUrl && (
              <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-3 inline-block">
                <p className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.2em] mb-2">
                  Ảnh hiện tại
                </p>
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="relative overflow-hidden rounded-xl border border-[var(--border)] bg-white">
                    <button
                      type="button"
                      onClick={clearHeroImage}
                      className="absolute right-1 top-1 h-4 w-4 rounded-full bg-red-500 text-[10px] leading-4 text-white flex items-center justify-center shadow"
                      aria-label="Xóa ảnh"
                    >
                      ×
                    </button>
                    <img
                      src={previewUrl}
                      alt="Ảnh hiện tại"
                      className="h-48 w-40 object-contain"
                    />
                  </div>
                  <p className="text-xs text-[var(--muted-foreground)]">Đã xuất bản</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lịch trình */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Lịch trình (Tuỳ chọn)</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Bắt đầu lúc</label>
              <input
                type="datetime-local"
                value={form.startAt ?? ''}
                onChange={(e) => handleChange('startAt', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[var(--muted-foreground)]">Kết thúc lúc</label>
              <input
                type="datetime-local"
                value={form.endAt ?? ''}
                onChange={(e) => handleChange('endAt', e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>
          {hasDateError && (
            <p className="text-xs text-[var(--error)]">Kết thúc phải sau hoặc bằng thời gian bắt đầu.</p>
          )}
        </div>

        {/* SEO */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Cấu hình SEO</p>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">SEO Title</label>
            <input
              type="text"
              placeholder="Ví dụ: Summer Sale 2025 - Ưu đãi đến 50%"
              value={form.seoTitle}
              onChange={(e) => handleChange('seoTitle', e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--muted-foreground)]">SEO Description</label>
            <textarea
              rows={3}
              placeholder="Ví dụ: Bộ sưu tập mùa hè với váy, áo, suit cao cấp giảm giá đến 50%, giao nhanh toàn quốc."
              value={form.seoDescription}
              onChange={(e) => handleChange('seoDescription', e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
        </div>

        {/* Gắn sản phẩm */}
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">Gắn sản phẩm</p>
          <div className="grid gap-3">
            <input
              type="search"
              placeholder="Tìm sản phẩm theo tên hoặc SKU..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <div className="border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="p-3 border-b border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[var(--muted-foreground)]">Kết quả tìm kiếm</p>
                  <span className="text-xs text-[var(--muted-foreground)]">Đã chọn: {selectedProducts.length}</span>
                </div>
                <div className="grid gap-2 md:grid-cols-4">
                  <input
                    type="text"
                    placeholder="Tất cả danh mục (slug, chứa keyword)"
                    value={filterCategory}
                    onChange={(e) => {
                      setProductPage(0);
                      setFilterCategory(e.target.value);
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => {
                      setProductPage(0);
                      setFilterStatus(e.target.value);
                    }}
                    className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="ACTIVE">Đang bán</option>
                    <option value="INACTIVE">Ẩn</option>
                    <option value="OUT_OF_STOCK">Hết hàng</option>
                  </select>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      placeholder="Min ₫"
                      value={filterMinPrice}
                      onChange={(e) => {
                        setProductPage(0);
                        setFilterMinPrice(e.target.value);
                      }}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    <span className="text-[var(--muted-foreground)] text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max ₫"
                      value={filterMaxPrice}
                      onChange={(e) => {
                        setProductPage(0);
                        setFilterMaxPrice(e.target.value);
                      }}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setProductSearch('');
                      setFilterCategory('');
                      setFilterStatus('');
                      setFilterMinPrice('');
                      setFilterMaxPrice('');
                      setProductPage(0);
                    }}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-xs hover:bg-[var(--muted)] transition-colors"
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {loadingProducts ? (
                  <p className="text-xs text-[var(--muted-foreground)] p-3">Đang tải sản phẩm...</p>
                ) : productOptions.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)] p-3">Không có sản phẩm phù hợp.</p>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead className="bg-[var(--muted)] text-[var(--muted-foreground)]">
                        <tr>
                          <th className="px-3 py-2 text-left">Sản phẩm</th>
                          <th className="px-3 py-2 text-left">SKU</th>
                          <th className="px-3 py-2 text-left">Danh mục</th>
                          <th className="px-3 py-2 text-right">Giá</th>
                          <th className="px-3 py-2 text-center">Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productOptions.map((p) => (
                          <tr key={p.id} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30">
                            <td className="px-3 py-2 font-medium">{p.name}</td>
                            <td className="px-3 py-2 text-xs text-[var(--muted-foreground)]">{p.sku ?? '—'}</td>
                            <td className="px-3 py-2 text-xs text-[var(--muted-foreground)]">{p.category ?? '—'}</td>
                            <td className="px-3 py-2 text-right font-mono">{p.price.toLocaleString('vi-VN')}₫</td>
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => addProduct(p)}
                                disabled={!!selectedProducts.find((sp) => sp.id === p.id)}
                                className="text-xs rounded-full border border-[var(--border)] px-3 py-1 hover:bg-[var(--muted)] disabled:opacity-50"
                              >
                                {selectedProducts.find((sp) => sp.id === p.id) ? 'Đã thêm' : 'Thêm'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {productTotalPages > 1 && (
                      <div className="flex items-center justify-between px-3 py-2 text-xs text-[var(--muted-foreground)] border-t border-[var(--border)]">
                        <span>
                          Trang {productPage + 1}/{productTotalPages}
                        </span>
                        <div className="space-x-2">
                          <button
                            type="button"
                            disabled={productPage === 0}
                            onClick={() => setProductPage((prev) => Math.max(prev - 1, 0))}
                            className="rounded-md border border-[var(--border)] px-2 py-1 disabled:opacity-50"
                          >
                            Trước
                          </button>
                          <button
                            type="button"
                            disabled={productPage + 1 >= productTotalPages}
                            onClick={() => setProductPage((prev) => Math.min(prev + 1, productTotalPages - 1))}
                            className="rounded-md border border-[var(--border)] px-2 py-1 disabled:opacity-50"
                          >
                            Sau
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="border border-[var(--border)] rounded-xl bg-[var(--card)]">
              <div className="p-3 border-b border-[var(--border)] flex items-center justify-between">
                <p className="text-xs text-[var(--muted-foreground)]">Sản phẩm đã chọn</p>
                <button
                  type="button"
                  onClick={clearSelected}
                  disabled={selectedProducts.length === 0}
                  className="text-xs text-[var(--error)] disabled:opacity-40"
                >
                  Xóa tất cả
                </button>
              </div>
              {selectedProducts.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)] p-3">Chưa chọn sản phẩm nào.</p>
              ) : (
                <div className="divide-y divide-[var(--border)]">
                  {selectedProducts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <p className="text-xs text-[var(--muted-foreground)] truncate">SKU: {p.sku ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col gap-1">
                          <button
                            type="button"
                            onClick={() => moveProduct(p.id, 'up')}
                            className="text-xs rounded border border-[var(--border)] px-2 py-0.5"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            onClick={() => moveProduct(p.id, 'down')}
                            className="text-xs rounded border border-[var(--border)] px-2 py-0.5"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeProduct(p.id)}
                          className="text-xs text-[var(--error)] rounded-full border border-[var(--border)] px-2 py-1"
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-sm font-medium hover:bg-[var(--primary-hover)] disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo bộ sưu tập'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/collections')}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)]"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCollectionCreate;


