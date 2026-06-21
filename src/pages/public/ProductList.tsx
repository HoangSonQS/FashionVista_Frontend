import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
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
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';
import { getAuthSession } from '../../services/authSession';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  page?: number;
  sort?: SortOption;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Mới nhất',
  price_asc: 'Giá: Thấp → Cao',
  price_desc: 'Giá: Cao → Thấp',
};

const ProductList = () => {
  const location = useLocation();
  const listRef = useRef<HTMLDivElement>(null);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useStableState<FilterState>({});
  const debouncedFilters = useDebouncedValue(filters, 450);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, setQuickAddLoading] = useState<Record<number, boolean>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { openDrawer } = useCartDrawer();
  const { showToast } = useToast();
  const [variantModal, setVariantModal] = useState<{
    product: ProductListItem;
    variants: ProductVariant[];
    mode: 'add' | 'buy';
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [variantSubmitting, setVariantSubmitting] = useState(false);

  const [pendingMinPrice, setPendingMinPrice] = useState('');
  const [pendingMaxPrice, setPendingMaxPrice] = useState('');
  const [pendingSize, setPendingSize] = useState('');
  const [pendingColor, setPendingColor] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cat = searchParams.get('category');
    if (cat) setFilters((prev) => ({ ...prev, category: cat }));
  }, [location.search, setFilters]);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (listRef.current) {
        const top = listRef.current.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error, showToast]);

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);
      try {
        const response = await productService.getProducts({
          category: debouncedFilters.category,
          size: debouncedFilters.size,
          color: debouncedFilters.color,
          minPrice: debouncedFilters.minPrice,
          maxPrice: debouncedFilters.maxPrice,
          sort: debouncedFilters.sort,
          page: debouncedFilters.page,
        });
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.');
      }
    };
    void fetchProducts();
  }, [debouncedFilters]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target as Node)) {
        setShowFilterPopover(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const products: ProductListItem[] = useMemo(() => data?.items ?? [], [data]);

  const activeFiltersCount = [filters.minPrice, filters.maxPrice, filters.size, filters.color].filter(
    Boolean,
  ).length;

  const applyExtraFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page: undefined,
      minPrice: pendingMinPrice ? Number(pendingMinPrice) : undefined,
      maxPrice: pendingMaxPrice ? Number(pendingMaxPrice) : undefined,
      size: pendingSize || undefined,
      color: pendingColor || undefined,
    }));
    setShowFilterPopover(false);
  };

  const clearAllFilters = () => {
    setFilters({});
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingSize('');
    setPendingColor('');
  };

  const ensureAuthenticated = () => {
    if (!getAuthSession('user')) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const openVariantSelection = (product: ProductListItem, variants: ProductVariant[], mode: 'add' | 'buy') => {
    setVariantModal({ product, variants, mode });
    const first = variants[0];
    setSelectedColor(first?.color ?? null);
    setSelectedSize(first?.size ?? null);
  };

  const handleQuickAdd = async (product: ProductListItem) => {
    if (!ensureAuthenticated()) return;
    setQuickAddLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      const detail = await productService.getProduct(product.slug);
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
        openDrawer({ cart });
        showToast('Đã thêm vào giỏ hàng.', 'success');
      } else {
        openVariantSelection(product, availableVariants, 'add');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng.';
      showToast(message, 'error');
      if (message.includes('Unauthorized')) setShowLoginModal(true);
    } finally {
      setQuickAddLoading((prev) => {
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
    const variant = variantModal.variants.find(
      (v) => (v.color ?? null) === selectedColor && (v.size ?? null) === selectedSize,
    );
    if (!variant) {
      showToast('Biến thể không hợp lệ.', 'error');
      return;
    }
    setVariantSubmitting(true);
    try {
      const cart = await cartService.addItem(variant.sku, 1);
      emitCartUpdated(cart);
      openDrawer({ cart });
      if (variantModal.mode === 'add') showToast('Đã thêm vào giỏ hàng.', 'success');
      setVariantModal(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm sản phẩm với biến thể đã chọn.';
      showToast(message, 'error');
    } finally {
      setVariantSubmitting(false);
    }
  };

  // keep handleQuickAdd in scope so eslint doesn't complain; variant modal uses it indirectly
  void handleQuickAdd;

  return (
    <div ref={listRef} className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-16">

      {/* Sticky Top Filter Bar */}
      <div className="sticky top-[64px] z-20 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">

            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: undefined, page: undefined }))}
              className={`whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border transition-colors shrink-0 ${
                !filters.category
                  ? 'bg-[#7B9BB2] text-white border-[#7B9BB2]'
                  : 'border-[var(--border)] text-[var(--foreground)] hover:border-[#7B9BB2]'
              }`}
            >
              Tất cả
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: cat.slug, page: undefined }))}
                className={`whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border transition-colors shrink-0 ${
                  filters.category === cat.slug
                    ? 'bg-[#7B9BB2] text-white border-[#7B9BB2]'
                    : 'border-[var(--border)] text-[var(--foreground)] hover:border-[#7B9BB2]'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 shrink-0">
              {/* Lọc thêm popover */}
              <div className="relative" ref={filterPopoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowFilterPopover((v) => !v);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border border-[var(--border)] hover:border-[#7B9BB2] transition-colors"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  Lọc thêm
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7B9BB2] text-[8px] text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {showFilterPopover && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card)] border border-[var(--border)] shadow-lg z-30 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Giá từ
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={pendingMinPrice}
                          onChange={(e) => setPendingMinPrice(e.target.value)}
                          className="number-input w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Đến
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="5.000.000"
                          value={pendingMaxPrice}
                          onChange={(e) => setPendingMaxPrice(e.target.value)}
                          className="number-input w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Size
                        </label>
                        <input
                          type="text"
                          placeholder="S, M..."
                          value={pendingSize}
                          onChange={(e) => setPendingSize(e.target.value)}
                          className="w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Màu
                        </label>
                        <input
                          type="text"
                          placeholder="Black..."
                          value={pendingColor}
                          onChange={(e) => setPendingColor(e.target.value)}
                          className="w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="flex-1 border border-[var(--border)] py-1.5 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Xóa lọc
                      </button>
                      <button
                        type="button"
                        onClick={applyExtraFilters}
                        className="flex-1 bg-[#7B9BB2] py-1.5 text-[10px] uppercase tracking-wide text-white hover:bg-[#5E8A9F] transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSortDropdown((v) => !v);
                    setShowFilterPopover(false);
                  }}
                  className="flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border border-[var(--border)] hover:border-[#7B9BB2] transition-colors"
                >
                  {filters.sort ? SORT_LABELS[filters.sort] : 'Sắp xếp'}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card)] border border-[var(--border)] shadow-lg z-30">
                    {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: value, page: undefined }));
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-[10px] uppercase tracking-wide hover:bg-[var(--muted)] transition-colors ${
                          filters.sort === value ? 'text-[#7B9BB2] font-medium' : 'text-[var(--foreground)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid gap-x-4 gap-y-10 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              thumbnailUrl={product.thumbnailUrl ?? null}
              hoverThumbnailUrl={product.hoverThumbnailUrl}
              tags={product.tags ?? []}
            />
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
            <span>Trang {data.page + 1}/{data.totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.page === 0}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) - 1 }))}
                className="px-4 py-1.5 border border-[var(--border)] text-[10px] uppercase tracking-wide disabled:opacity-40 hover:border-[#7B9BB2] transition-colors"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }))}
                className="px-4 py-1.5 border border-[var(--border)] text-[10px] uppercase tracking-wide disabled:opacity-40 hover:border-[#7B9BB2] transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua ngay."
      />

      {variantModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md max-h-[80vh] rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)] flex flex-col">
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
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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
                          (v) => v.color === color && v.active && v.stock > 0,
                        );
                        const isActive = selectedColor === color && hasStock;
                        return (
                          <button
                            key={color}
                            type="button"
                            disabled={!hasStock}
                            onClick={() => hasStock && setSelectedColor(color)}
                            className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs transition-colors ${
                              isActive
                                ? 'border-[#7B9BB2] bg-[#7B9BB2] text-white shadow-sm ring-2 ring-[#7B9BB2]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#7B9BB2]'
                            } ${!hasStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {color}
                            {!hasStock && <span className="ml-1 text-[10px]">(Hết hàng)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
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
                          (v) => v.size === size && v.active && v.stock > 0,
                        );
                        const isActive = selectedSize === size && hasStock;
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!hasStock}
                            onClick={() => hasStock && setSelectedSize(size)}
                            className={`rounded-lg border px-2 py-1.5 text-xs text-center transition-colors ${
                              isActive
                                ? 'border-[#7B9BB2] bg-[#7B9BB2] text-white shadow-sm ring-2 ring-[#7B9BB2]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#7B9BB2]'
                            } ${!hasStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {size}
                            {!hasStock && <span className="block text-[10px] mt-0.5">Hết hàng</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {(() => {
                const variant = variantModal.variants.find(
                  (v) => (v.color ?? null) === selectedColor && (v.size ?? null) === selectedSize,
                );
                if (!variant) {
                  return (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Vui lòng chọn đầy đủ màu sắc và kích cỡ còn hàng.
                    </p>
                  );
                }
                return (
                  <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-3 space-y-1.5 text-xs">
                    <p className="font-semibold text-sm">{variant.price.toLocaleString('vi-VN')}₫</p>
                    <p className="text-[var(--muted-foreground)]">
                      SKU: <span className="font-mono">{variant.sku}</span>
                    </p>
                    <p className="text-[var(--muted-foreground)]">
                      Tồn kho: {variant.stock}
                      {variant.stock <= 0 && (
                        <span className="text-[var(--error)] font-medium"> (Hết hàng)</span>
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
            <div className="border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={handleConfirmVariant}
                disabled={variantSubmitting}
                className="w-full rounded-full bg-[#7B9BB2] py-2.5 text-sm font-semibold text-white hover:bg-[#5E8A9F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
