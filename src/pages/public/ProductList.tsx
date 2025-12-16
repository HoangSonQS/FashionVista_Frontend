import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import type {
  CategorySummary,
  ProductListItem,
  ProductListResponse,
  ProductVariant,
} from '../../types/product';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useStableState } from '../../hooks/useStableState';
import { cartService } from '../../services/cartService';
import { emitCartUpdated } from '../../utils/cartEvents';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../../components/common/LoginModal';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

interface FilterState {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  page?: number;
}

const ProductList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') ?? undefined;
  const [filters, setFilters] = useStableState<FilterState>(initialSearch ? { search: initialSearch } : {});
  const debouncedFilters = useDebouncedValue(filters, 450);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quickAddLoading, setQuickAddLoading] = useState<Record<number, boolean>>({});
  const [quickBuyLoading, setQuickBuyLoading] = useState<Record<number, boolean>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { openDrawer } = useCartDrawer();
  const { toasts, showToast, removeToast } = useToast();
  const [variantModal, setVariantModal] = useState<{
    product: ProductListItem;
    variants: ProductVariant[];
    mode: 'add' | 'buy';
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const [searchInput, setSearchInput] = useState(initialSearch ?? '');

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  // Hiển thị error toast khi có lỗi
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error, showToast]);

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);
      try {
        const response = await productService.getProducts({
          category: debouncedFilters.category,
          search: debouncedFilters.search,
          size: debouncedFilters.size,
          color: debouncedFilters.color,
          minPrice: debouncedFilters.minPrice,
          maxPrice: debouncedFilters.maxPrice,
        });
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.');
      }
    };
    fetchProducts();
  }, [debouncedFilters]);

  const updateFilterField = (field: keyof FilterState, rawValue: string | number | undefined) => {
    setFilters((prev) => {
      const next: FilterState = { ...prev };
      if (field !== 'page') {
        delete next.page;
      }

      const shouldRemove =
        rawValue === undefined ||
        rawValue === '' ||
        (typeof rawValue === 'string' && rawValue.trim().length === 0);

      if (shouldRemove) {
        delete next[field];
      } else {
        next[field] = rawValue as never;
      }
      return next;
    });
  };

  const handleInputChange = (field: keyof FilterState, value: string) => {
    const normalized = value.trim();
    updateFilterField(field, normalized.length > 0 ? normalized : undefined);
  };

  const handleNumberChange = (field: 'minPrice' | 'maxPrice', raw: string) => {
    if (!raw) {
      updateFilterField(field, undefined);
      return;
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      return;
    }
    updateFilterField(field, parsed);
  };

  const products: ProductListItem[] = useMemo(() => data?.items ?? [], [data]);

  const ensureAuthenticated = () => {
    if (typeof window === 'undefined') {
      return false;
    }
    const raw = window.localStorage.getItem('auth');
    if (!raw) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const openVariantSelection = (
    product: ProductListItem,
    variants: ProductVariant[],
    mode: 'add' | 'buy',
  ) => {
    setVariantModal({ product, variants, mode });
    const first = variants[0];
    setSelectedColor(first?.color ?? null);
    setSelectedSize(first?.size ?? null);
  };

  const handleQuickAdd = async (product: ProductListItem) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setQuickAddLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      const detail = await productService.getProduct(product.slug);
      // Check tất cả biến thể - chỉ lấy biến thể có stock > 0 và active
      const availableVariants = detail.variants.filter((v) => v.active && v.stock > 0);
      if (availableVariants.length === 0) {
        showToast('Sản phẩm đã hết hàng.', 'error');
        return;
      }

      const hasSelectableVariant = availableVariants.some(
        (v) => (v.size && v.size.trim().length > 0) || (v.color && v.color.trim().length > 0),
      );

      if (!hasSelectableVariant) {
        // Không có size/màu, thêm thẳng biến thể đầu tiên
        const variant = availableVariants[0];
        const cart = await cartService.addItem(variant.sku, 1);
        emitCartUpdated(cart);
        openDrawer({ cart });
        showToast('Đã thêm vào giỏ hàng.', 'success');
      } else {
        // Có variant size/màu → mở modal chọn biến thể
        openVariantSelection(product, availableVariants, 'add');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng.';
      showToast(message, 'error');
      if (message.includes('Unauthorized')) {
        setShowLoginModal(true);
      }
    } finally {
      setQuickAddLoading((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  };

  const handleQuickBuy = async (product: ProductListItem) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setQuickBuyLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      const detail = await productService.getProduct(product.slug);
      // Check tất cả biến thể - chỉ lấy biến thể có stock > 0 và active
      const availableVariants = detail.variants.filter((v) => v.active && v.stock > 0);
      if (availableVariants.length === 0) {
        showToast('Sản phẩm đã hết hàng.', 'error');
        return;
      }

      const hasSelectableVariant = availableVariants.some(
        (v) => (v.size && v.size.trim().length > 0) || (v.color && v.color.trim().length > 0),
      );

      if (!hasSelectableVariant) {
        const variant = availableVariants[0];
        const cart = await cartService.addItem(variant.sku, 1);
        emitCartUpdated(cart);
        navigate('/checkout');
      } else {
        openVariantSelection(product, availableVariants, 'buy');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể mua ngay sản phẩm.';
      showToast(message, 'error');
      if (message.includes('Unauthorized')) {
        setShowLoginModal(true);
      }
    } finally {
      setQuickBuyLoading((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  };

  const handleConfirmVariant = async () => {
    if (!variantModal) {
      showToast('Vui lòng chọn biến thể.', 'error');
      return;
    }

    const variant = variantModal.variants.find((v) => {
      const color = v.color ?? null;
      const size = v.size ?? null;
      return color === selectedColor && size === selectedSize;
    });

    if (!variant) {
      showToast('Biến thể không hợp lệ.', 'error');
      return;
    }

    setVariantSubmitting(true);
    try {
      const cart = await cartService.addItem(variant.sku, 1);
      emitCartUpdated(cart);

      if (variantModal.mode === 'add') {
        openDrawer({ cart });
        showToast('Đã thêm vào giỏ hàng.', 'success');
      } else {
        navigate('/checkout');
      }
      setVariantModal(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể thêm sản phẩm với biến thể đã chọn.';
      showToast(message, 'error');
    } finally {
      setVariantSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-0 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--primary)] to-[var(--background)]">
        <div className="absolute inset-0 opacity-5">
          {/* <div className="absolute top-20 left-20 w-72 h-72 bg-[var(--primary)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl" /> */}
        </div>
        <div className="relative mx-auto flex max-w-6xl h-168 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <h1
            className="font-serif text-7xl md:text-8xl lg:text-9xl font-bold mb-8 text-primary tracking-tight"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            sixthsoul
          </h1>
          <p className="text-base md:text-lg lg:text-xl uppercase tracking-[0.3em] text-foreground/90 font-sans font-light">
            "LIVE YOUR BEAUTY. LIVE YOUR SIXTHSOUL."
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto space-y-8 px-4 pt-10">

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {/* Sidebar filter - sticky on desktop after banner */}
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-4 md:sticky md:top-24">
            <h2 className="text-lg font-semibold">Bộ lọc</h2>

            <div className="space-y-2 text-sm relative">
              <label htmlFor="search" className="block text-[var(--muted-foreground)]">
                Tìm kiếm
              </label>
              <input
                id="search"
                type="search"
                placeholder="Áo, váy, màu sắc..."
                value={searchInput}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchInput(value);
                  handleInputChange('search', value);
                }}
                className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>

            <div className="space-y-2 text-sm">
              <label htmlFor="category" className="block text-[var(--muted-foreground)]">
                Danh mục
              </label>
              <select
                id="category"
                value={filters.category ?? ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Tất cả</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <label className="block text-[var(--muted-foreground)]">Giá từ</label>
                <input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={filters.minPrice ?? ''}
                  onChange={(e) => handleNumberChange('minPrice', e.target.value)}
                  className="number-input w-full rounded-lg border border-[hsl(211,35%,55%)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[var(--muted-foreground)]">Đến</label>
                <input
                  type="number"
                  min={0}
                  placeholder="5.000.000"
                  value={filters.maxPrice ?? ''}
                  onChange={(e) => handleNumberChange('maxPrice', e.target.value)}
                  className="number-input w-full rounded-lg border border-[hsl(211,35%,55%)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="space-y-2">
                <label className="block text-[var(--muted-foreground)]">Size</label>
                <input
                  type="text"
                  placeholder="S, M..."
                  value={filters.size ?? ''}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[var(--muted-foreground)]">Màu</label>
                <input
                  type="text"
                  placeholder="Black..."
                  value={filters.color ?? ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFilters({})}
              className="w-full rounded-full border border-[var(--border)] py-2 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--border)] transition-colors"
            >
              Xóa bộ lọc
            </button>
          </div>

          <div className="md:col-span-3 space-y-4">
            {/* {loading && !error && (
              <p className="text-sm text-[var(--muted-foreground)]">Đang tải sản phẩm...</p>
            )} */}

            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-lg hover:-translate-y-1 transition-transform flex flex-col"
                >
                  <Link to={`/products/${product.slug}`}>
                    <div className="bg-[var(--background)] relative flex items-center justify-center overflow-hidden border border-[var(--border)] rounded-2xl p-4 min-h-[280px]">
                      {product.thumbnailUrl ? (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="max-h-[320px] w-full object-contain group-hover:scale-[1.03] transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] text-sm">
                          Đang cập nhật
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="p-4 space-y-2 flex-1 flex flex-col">
                    <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted-foreground)]">
                      {product.featured ? 'Featured' : 'New'}
                    </p>
                    <Link
                      to={`/products/${product.slug}`}
                      className="text-lg font-semibold hover:underline"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {product.name}
                    </Link>
                    {(product.sizes || product.colors) && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {product.sizes && product.sizes.length > 0 && (
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                            Size: {product.sizes.join(', ')}
                          </span>
                        )}
                        {product.colors && product.colors.length > 0 && (
                          <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
                            Màu: {product.colors.join(', ')}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--primary)] font-semibold">
                        {product.price.toLocaleString('vi-VN')}₫
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-[var(--muted-foreground)] line-through">
                          {product.compareAtPrice.toLocaleString('vi-VN')}₫
                        </span>
                      )}
                    </div>
                    <div className="mt-auto pt-4 space-y-2">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        disabled={Boolean(quickAddLoading[product.id])}
                        className="w-full rounded-full border border-[var(--border)] py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quickAddLoading[product.id] ? 'Đang thêm...' : 'Thêm vào giỏ'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickBuy(product)}
                        disabled={Boolean(quickBuyLoading[product.id])}
                        className="w-full rounded-full bg-[var(--primary)] py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {quickBuyLoading[product.id] ? 'Đang xử lý...' : 'Mua ngay'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                <span>
                  Trang {data.page + 1}/{data.totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={data.page === 0}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) - 1 }))}
                    className="px-3 py-1 rounded-full border border-[var(--border)] disabled:opacity-40"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={data.page + 1 >= data.totalPages}
                    onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }))}
                    className="px-3 py-1 rounded-full border border-[var(--border)] disabled:opacity-40"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua ngay."
      />
      <ToastContainer toasts={toasts} onClose={removeToast} />

      {variantModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md max-h-[80vh] rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-[var(--border)]">
              <div>
                <p className="text-sm font-semibold">Chọn biến thể</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Vui lòng chọn đầy đủ thuộc tính trước khi{' '}
                  {variantModal.mode === 'add' ? 'thêm vào giỏ.' : 'mua ngay.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantModal(null)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Đóng
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Color selector */}
              {(() => {
                const colors = Array.from(
                  new Set(
                    variantModal.variants
                      .map((v) => v.color)
                      .filter((c): c is string => Boolean(c && c.trim().length > 0)),
                  ),
                );
                if (colors.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">Màu sắc</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {colors.map((color) => {
                        const hasStock = variantModal.variants.some(
                          (v) =>
                            v.color === color && v.active && v.stock > 0,
                        );
                        const disabled = !hasStock;
                        const isActive = selectedColor === color && !disabled;
                        return (
                          <button
                            key={color}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && setSelectedColor(color)}
                             className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs transition-colors ${
                              isActive
                                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm ring-2 ring-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--foreground)]'
                            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {color}
                            {disabled && <span className="ml-1 text-[10px]"> (Hết hàng)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Size selector */}
              {(() => {
                const baseVariants =
                  selectedColor != null
                    ? variantModal.variants.filter((v) => v.color === selectedColor)
                    : variantModal.variants;

                const sizes = Array.from(
                  new Set(
                    baseVariants
                      .map((v) => v.size)
                      .filter((s): s is string => Boolean(s && s.trim().length > 0)),
                  ),
                );
                if (sizes.length === 0) return null;

                return (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">Kích cỡ</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {sizes.map((size) => {
                        const hasStock = baseVariants.some(
                          (v) =>
                            v.size === size && v.active && v.stock > 0,
                        );
                        const disabled = !hasStock;
                        const isActive = selectedSize === size && !disabled;
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={disabled}
                            onClick={() => !disabled && setSelectedSize(size)}
                            className={`rounded-lg border px-2 py-1.5 text-xs text-center transition-colors ${
                              isActive
                                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm ring-2 ring-[var(--primary)]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--foreground)]'
                            } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {size}
                            {disabled && <span className="block text-[10px] mt-0.5">Hết hàng</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Variant info */}
              {(() => {
                const variant = variantModal.variants.find((v) => {
                  const color = v.color ?? null;
                  const size = v.size ?? null;
                  return color === selectedColor && size === selectedSize;
                });

                if (!variant) {
                  return (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Vui lòng chọn đầy đủ màu sắc và kích cỡ còn hàng.
                    </p>
                  );
                }

                return (
                  <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-3 space-y-1.5 text-xs">
                    <p className="font-semibold text-sm">
                      {variant.price.toLocaleString('vi-VN')}₫
                    </p>
                    <p className="text-[var(--muted-foreground)]">
                      SKU: <span className="font-mono">{variant.sku}</span>
                    </p>
                    <p className="text-[var(--muted-foreground)]">
                      Tồn kho: {variant.stock}{' '}
                      {variant.stock <= 0 && (
                        <span className="text-[var(--error)] font-medium">(Hết hàng)</span>
                      )}
                    </p>
                    <p className="text-[var(--muted-foreground)]">
                      Thuộc tính:{' '}
                      <span className="font-medium">
                        {variant.color && `Màu: ${variant.color}`}
                        {variant.size && (variant.color ? ' • ' : '')}
                        {variant.size && `Size: ${variant.size}`}
                      </span>
                    </p>
                  </div>
                );
              })()}
            </div>

            {/* Footer actions */}
            <div className="border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={handleConfirmVariant}
                disabled={variantSubmitting}
                className="w-full rounded-full bg-[var(--primary)] py-2.5 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {variantSubmitting
                  ? 'Đang xử lý...'
                  : variantModal.mode === 'add'
                    ? 'Thêm vào giỏ hàng'
                    : 'Mua ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;

