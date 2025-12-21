import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminProductVariantService,
  type AdminProductVariantResponse,
  type AdminProductVariantCreateRequest,
  type AdminProductVariantUpdateRequest,
} from '../../services/adminProductVariantService';
import { adminProductService } from '../../services/adminProductService';
import type { ProductListItem } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

// Helper function to convert Vietnamese text to slug format
const toSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .toUpperCase();
};

const AdminProductVariants = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [productId, setProductId] = useState<number | ''>('');
  const [sizeFilter, setSizeFilter] = useState('');
  const [colorFilter, setColorFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('');
  const [minStock, setMinStock] = useState<number | ''>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    items: AdminProductVariantResponse[];
    totalElements: number;
    totalPages: number;
    page: number;
    size: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<AdminProductVariantCreateRequest>({
    productId: 0,
    size: '',
    color: '',
    sku: '',
    stock: 0,
    price: undefined,
    active: true,
  });
  const [stockInput, setStockInput] = useState<string>(''); // String state for stock input
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [quickEditingId, setQuickEditingId] = useState<number | null>(null);
  const [quickEditField, setQuickEditField] = useState<'stock' | 'price' | null>(null);
  const [quickEditValue, setQuickEditValue] = useState<string>('');
  const [autoGenerateSku, setAutoGenerateSku] = useState(true); // Track if SKU should be auto-generated
  const [priceInput, setPriceInput] = useState<string>(''); // String state for price input
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({
      productId: productId === '' ? undefined : Number(productId),
      search: debouncedSearch.trim() || undefined,
      size: sizeFilter || undefined, // Filter by variant size
      color: colorFilter || undefined,
      active: activeFilter === '' ? undefined : activeFilter === 'true',
      minStock: minStock === '' ? undefined : Number(minStock),
      page,
      pageSize: 20, // Page size for pagination
    }),
    [debouncedSearch, productId, sizeFilter, colorFilter, activeFilter, minStock, page],
  );

  useEffect(() => {
    const fetchVariants = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching variants with filters:', filters);
        const response = await adminProductVariantService.getAll(filters);
        console.log('API Response:', response);
        setData({
          items: response.content || [],
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          page: response.number || 0,
          size: response.size || 20,
        });
      } catch (err) {
        console.error('Error fetching variants:', err);
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách biến thể.');
        showToast(err instanceof Error ? err.message : 'Không thể tải danh sách biến thể.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void fetchVariants();
  }, [filters, showToast]);

  // Load products for selection
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await adminProductService.getProducts({ size: 1000 });
        setProducts(response.items || []);
      } catch (err) {
        // Ignore error
      }
    };
    void loadProducts();
  }, []);

  // Auto-generate SKU from product name + size + color
  const generateSku = (productId: number, size: string, color: string): string => {
    if (!productId || !size || !color) return '';
    const product = products.find((p) => p.id === productId);
    if (!product) return '';
    const productSlug = toSlug(product.name);
    const sizeSlug = toSlug(size);
    const colorSlug = toSlug(color);
    return `${productSlug}-${sizeSlug}-${colorSlug}`;
  };

  const handleOpenModal = (variant?: AdminProductVariantResponse) => {
    if (variant) {
      setEditingId(variant.id);
      setFormData({
        productId: variant.productId,
        size: variant.size,
        color: variant.color,
        sku: variant.sku,
        stock: variant.stock,
        price: variant.price,
        active: variant.active,
      });
      setStockInput(variant.stock.toString());
      setPriceInput(variant.price ? variant.price.toString() : '');
      setAutoGenerateSku(false); // Don't auto-generate when editing
    } else {
      setEditingId(null);
      setFormData({
        productId: productId === '' ? 0 : Number(productId),
        size: '',
        color: '',
        sku: '',
        stock: 0,
        price: undefined,
        active: true,
      });
      setStockInput('');
      setPriceInput('');
      setAutoGenerateSku(true); // Auto-generate when creating new
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      productId: 0,
      size: '',
      color: '',
      sku: '',
      stock: 0,
      price: undefined,
      active: true,
    });
    setStockInput('');
    setPriceInput('');
    setAutoGenerateSku(true);
  };

  // Handle product selection change
  const handleProductChange = (selectedProductId: number) => {
    setFormData((prev) => {
      const newData = { ...prev, productId: selectedProductId };
      if (autoGenerateSku && selectedProductId && prev.size && prev.color) {
        newData.sku = generateSku(selectedProductId, prev.size, prev.color);
      }
      return newData;
    });
  };

  // Handle size change
  const handleSizeChange = (size: string) => {
    setFormData((prev) => {
      const newData = { ...prev, size };
      if (autoGenerateSku && prev.productId && size && prev.color) {
        newData.sku = generateSku(prev.productId, size, prev.color);
      }
      return newData;
    });
  };

  // Handle color change
  const handleColorChange = (color: string) => {
    setFormData((prev) => {
      const newData = { ...prev, color };
      if (autoGenerateSku && prev.productId && prev.size && color) {
        newData.sku = generateSku(prev.productId, prev.size, color);
      }
      return newData;
    });
  };

  // Handle SKU manual edit - disable auto-generation
  const handleSkuChange = (sku: string) => {
    setFormData((prev) => ({ ...prev, sku }));
    setAutoGenerateSku(false); // Disable auto-generation when user manually edits SKU
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const updateRequest: AdminProductVariantUpdateRequest = {
          size: formData.size,
          color: formData.color,
          sku: formData.sku,
          stock: formData.stock,
          price: formData.price,
          active: formData.active,
        };
        const updated = await adminProductVariantService.update(editingId, updateRequest);
        showToast('Cập nhật biến thể thành công.', 'success');
        // Optimistic update
        if (data) {
          setData({
            ...data,
            items: data.items.map((item) => (item.id === editingId ? updated : item)),
          });
        }
        handleCloseModal();
        return;
      } else {
        const createRequest: AdminProductVariantCreateRequest = {
          productId: formData.productId,
          size: formData.size,
          color: formData.color,
          sku: formData.sku,
          stock: formData.stock,
          price: formData.price,
          active: formData.active,
        };
        await adminProductVariantService.create(createRequest);
        showToast('Tạo biến thể thành công.', 'success');
        setPage(0);
        handleCloseModal();
        // Refresh data
        const response = await adminProductVariantService.getAll({ ...filters, page: 0 });
        setData({
          items: response.content || [],
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          page: response.number || 0,
          size: response.size || 20,
        });
        return;
      }
    } catch (err: any) {
      let errorMessage = 'Có lỗi xảy ra.';
      if (err?.response) {
        const data = err.response.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
        if (err.response.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (err.response.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện hành động này.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa biến thể này?')) {
      return;
    }
    try {
      await adminProductVariantService.delete(id);
      showToast('Xóa biến thể thành công.', 'success');
      // Refresh data
      const response = await adminProductVariantService.getAll(filters);
      setData({
        items: response.content || [],
        totalElements: response.totalElements || 0,
        totalPages: response.totalPages || 0,
        page: response.number || 0,
        size: response.size || 20,
      });
    } catch (err: any) {
      let errorMessage = 'Không thể xóa biến thể.';
      if (err?.response) {
        const data = err.response.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    }
  };

  const handleQuickEditStart = (variant: AdminProductVariantResponse, field: 'stock' | 'price') => {
    setQuickEditingId(variant.id);
    setQuickEditField(field);
    setQuickEditValue(field === 'stock' ? variant.stock.toString() : variant.price?.toString() || '');
  };

  const handleQuickEditCancel = () => {
    setQuickEditingId(null);
    setQuickEditField(null);
    setQuickEditValue('');
  };

  const handleQuickEditSave = async (id: number, field: 'stock' | 'price') => {
    try {
      if (field === 'stock') {
        const stock = parseInt(quickEditValue, 10);
        if (isNaN(stock) || stock < 0) {
          showToast('Stock phải là số >= 0.', 'error');
          return;
        }
        const updated = await adminProductVariantService.updateStock(id, stock);
        showToast('Cập nhật stock thành công.', 'success');
        if (data) {
          setData({
            ...data,
            items: data.items.map((item) => (item.id === id ? updated : item)),
          });
        }
      } else {
        const price = parseFloat(quickEditValue);
        if (isNaN(price) || price < 0) {
          showToast('Price phải là số >= 0.', 'error');
          return;
        }
        const updated = await adminProductVariantService.updatePrice(id, price);
        showToast('Cập nhật giá thành công.', 'success');
        if (data) {
          setData({
            ...data,
            items: data.items.map((item) => (item.id === id ? updated : item)),
          });
        }
      }
      handleQuickEditCancel();
    } catch (err: any) {
      let errorMessage = 'Có lỗi xảy ra.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    }
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Get unique sizes and colors from data
  const uniqueSizes = useMemo(() => {
    if (!data) return [];
    const sizes = new Set<string>();
    data.items.forEach((item) => {
      if (item.size) sizes.add(item.size);
    });
    return Array.from(sizes).sort();
  }, [data]);

  const uniqueColors = useMemo(() => {
    if (!data) return [];
    const colors = new Set<string>();
    data.items.forEach((item) => {
      if (item.color) colors.add(item.color);
    });
    return Array.from(colors).sort();
  }, [data]);

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Biến thể Sản phẩm
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Quản lý các biến thể (size, color) của sản phẩm.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Tạo biến thể
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <input
          type="search"
          placeholder="Tìm theo SKU, size, color, tên sản phẩm..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value === '' ? '' : Number(e.target.value));
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả sản phẩm</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={sizeFilter}
          onChange={(e) => {
            setSizeFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả size</option>
          {uniqueSizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={colorFilter}
          onChange={(e) => {
            setColorFilter(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả màu</option>
          {uniqueColors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(0);
            }}
            className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          >
            <option value="">Tất cả</option>
            <option value="true">Đang kích hoạt</option>
            <option value="false">Đã vô hiệu hóa</option>
          </select>
          <input
            type="number"
            placeholder="Min stock"
            value={minStock}
            onChange={(e) => {
              setMinStock(e.target.value === '' ? '' : Number(e.target.value));
              setPage(0);
            }}
            className="w-24 rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {error && <p className="text-sm text-[var(--error)]">{error}</p>}

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm leading-normal">
              <th className="py-4 px-6 font-semibold">Sản phẩm</th>
              <th className="py-4 px-6 font-semibold">Size</th>
              <th className="py-4 px-6 font-semibold">Color</th>
              <th className="py-4 px-6 font-semibold">SKU</th>
              <th className="py-4 px-6 font-semibold text-right">Giá</th>
              <th className="py-4 px-6 font-semibold text-right">Stock</th>
              <th className="py-4 px-6 font-semibold text-center">Trạng thái</th>
              <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted-foreground)] text-sm">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <Link
                      to={`/admin/products/${item.productId}/edit`}
                      className="text-[var(--primary)] hover:underline font-medium"
                    >
                      {item.productName}
                    </Link>
                  </td>
                  <td className="py-4 px-6">{item.size}</td>
                  <td className="py-4 px-6">{item.color}</td>
                  <td className="py-4 px-6 font-mono text-xs">{item.sku}</td>
                  <td className="py-4 px-6 text-right">
                    {quickEditingId === item.id && quickEditField === 'price' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={quickEditValue}
                          onChange={(e) => setQuickEditValue(e.target.value)}
                          className="w-24 rounded border border-[var(--border)] bg-[var(--input-background)] px-2 py-1 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              void handleQuickEditSave(item.id, 'price');
                            } else if (e.key === 'Escape') {
                              handleQuickEditCancel();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void handleQuickEditSave(item.id, 'price')}
                          className="text-xs text-[var(--primary)] hover:underline"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickEditCancel}
                          className="text-xs text-[var(--error)] hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span
                        className="cursor-pointer hover:text-[var(--primary)]"
                        onClick={() => handleQuickEditStart(item, 'price')}
                        title="Click để chỉnh sửa"
                      >
                        {formatCurrency(item.price)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    {quickEditingId === item.id && quickEditField === 'stock' ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={quickEditValue}
                          onChange={(e) => setQuickEditValue(e.target.value)}
                          className="w-20 rounded border border-[var(--border)] bg-[var(--input-background)] px-2 py-1 text-xs"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              void handleQuickEditSave(item.id, 'stock');
                            } else if (e.key === 'Escape') {
                              handleQuickEditCancel();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => void handleQuickEditSave(item.id, 'stock')}
                          className="text-xs text-[var(--primary)] hover:underline"
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          onClick={handleQuickEditCancel}
                          className="text-xs text-[var(--error)] hover:underline"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`cursor-pointer hover:text-[var(--primary)] ${
                          item.stock === 0
                            ? 'text-[var(--error)] font-semibold'
                            : item.stock < 10
                              ? 'text-orange-500 font-medium'
                              : ''
                        }`}
                        onClick={() => handleQuickEditStart(item, 'stock')}
                        title="Click để chỉnh sửa"
                      >
                        {item.stock}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        item.active
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--muted)] text-[var(--foreground)]'
                      }`}
                    >
                      {item.active ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="w-full px-3 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--card)] border border-[var(--primary)]/30 rounded-full hover:bg-[var(--primary)]/10 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(item.id)}
                        className="w-full px-3 py-1 text-xs font-medium text-[var(--error)] bg-[var(--card)] border border-[var(--error)]/30 rounded-full hover:bg-[var(--error)]/10 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Không có biến thể nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--muted-foreground)]">
            Hiển thị {data.items.length} trên tổng số {data.totalElements} biến thể
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)] transition-colors"
            >
              Trước
            </button>
            <span className="px-3 py-1 text-sm">
              Trang {page + 1} / {data.totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
              disabled={page >= data.totalPages - 1}
              className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--muted)] transition-colors"
            >
              Sau
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Chỉnh sửa biến thể' : 'Tạo biến thể mới'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Sản phẩm *</label>
                <select
                  value={formData.productId}
                  onChange={(e) => handleProductChange(Number(e.target.value))}
                  required
                  disabled={!!editingId}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value={0}>Chọn sản phẩm</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Size *</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => handleSizeChange(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color *</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => handleColorChange(e.target.value)}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  SKU * {!editingId && autoGenerateSku && <span className="text-xs text-[var(--muted-foreground)]">(Tự động sinh)</span>}
                </label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => handleSkuChange(e.target.value)}
                  required
                  placeholder={!editingId && autoGenerateSku ? 'SKU sẽ được tự động sinh...' : ''}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                {!editingId && !autoGenerateSku && (
                  <button
                    type="button"
                    onClick={() => {
                      if (formData.productId && formData.size && formData.color) {
                        const generatedSku = generateSku(formData.productId, formData.size, formData.color);
                        setFormData((prev) => ({ ...prev, sku: generatedSku }));
                        setAutoGenerateSku(true);
                      }
                    }}
                    className="mt-1 text-xs text-[var(--primary)] hover:underline"
                  >
                    Tự động sinh lại SKU
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock *</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={stockInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid numbers
                      if (value === '' || /^\d+$/.test(value)) {
                        setStockInput(value);
                        // Update formData only if value is valid number
                        const numValue = value === '' ? 0 : parseInt(value, 10);
                        if (!isNaN(numValue) && numValue >= 0) {
                          setFormData({ ...formData, stock: numValue });
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure stock is at least 0 when blur
                      const value = e.target.value.trim();
                      if (value === '' || isNaN(parseInt(value, 10))) {
                        setStockInput('0');
                        setFormData({ ...formData, stock: 0 });
                      } else {
                        const numValue = Math.max(0, parseInt(value, 10));
                        setStockInput(numValue.toString());
                        setFormData({ ...formData, stock: numValue });
                      }
                    }}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Giá (₫) - Tùy chọn</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={priceInput}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string or valid numbers (including decimals)
                      if (value === '' || /^\d*\.?\d*$/.test(value)) {
                        setPriceInput(value);
                        // Update formData only if value is valid number
                        if (value === '') {
                          setFormData({ ...formData, price: undefined });
                        } else {
                          const numValue = parseFloat(value);
                          if (!isNaN(numValue) && numValue >= 0) {
                            setFormData({ ...formData, price: numValue });
                          }
                        }
                      }
                    }}
                    onBlur={(e) => {
                      // Ensure price is valid when blur
                      const value = e.target.value.trim();
                      if (value === '') {
                        setPriceInput('');
                        setFormData({ ...formData, price: undefined });
                      } else {
                        const numValue = parseFloat(value);
                        if (isNaN(numValue) || numValue < 0) {
                          setPriceInput('');
                          setFormData({ ...formData, price: undefined });
                        } else {
                          // Round to 2 decimal places
                          const roundedValue = Math.round(numValue * 100) / 100;
                          setPriceInput(roundedValue.toString());
                          setFormData({ ...formData, price: roundedValue });
                        }
                      }
                    }}
                    placeholder="Để trống để dùng giá sản phẩm"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded border-[var(--border)]"
                  />
                  <span className="text-sm">Kích hoạt</span>
                </label>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductVariants;

