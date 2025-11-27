import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import type {
  CategorySummary,
  ProductListItem,
  ProductListResponse,
} from '../../types/product';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useStableState } from '../../hooks/useStableState';
import { cartService } from '../../services/cartService';
import { emitCartUpdated } from '../../utils/cartEvents';
import { useCartDrawer } from '../../context/CartDrawerContext';

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
  const [filters, setFilters] = useStableState<FilterState>({});
  const debouncedFilters = useDebouncedValue(filters, 450);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [quickAddLoading, setQuickAddLoading] = useState<Record<number, boolean>>({});
  const [quickBuyLoading, setQuickBuyLoading] = useState<Record<number, boolean>>({});
  const { openDrawer } = useCartDrawer();

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedFilters]);

  useEffect(() => {
    if (!actionMessage) {
      return;
    }
    const timeoutId = window.setTimeout(() => setActionMessage(null), 4000);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [actionMessage]);

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
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }
    return true;
  };

  const handleQuickAdd = async (product: ProductListItem) => {
    setActionMessage(null);
    if (!ensureAuthenticated()) {
      return;
    }
    setQuickAddLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      const detail = await productService.getProduct(product.slug);
      const variant =
        detail.variants.find((v) => v.active && v.stock > 0) ?? detail.variants[0];
      if (!variant) {
        setActionMessage('Sản phẩm đang tạm hết hàng.');
        return;
      }
      const cart = await cartService.addItem(variant.sku, 1);
      emitCartUpdated(cart);
      openDrawer({ cart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng.';
      setActionMessage(message);
      if (message.includes('Unauthorized')) {
        navigate('/login', { state: { from: location.pathname } });
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
    setActionMessage(null);
    if (!ensureAuthenticated()) {
      return;
    }
    setQuickBuyLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      const detail = await productService.getProduct(product.slug);
      const variant =
        detail.variants.find((v) => v.active && v.stock > 0) ?? detail.variants[0];
      if (!variant) {
        setActionMessage('Sản phẩm đang tạm hết hàng.');
        return;
      }
      const cart = await cartService.addItem(variant.sku, 1);
      emitCartUpdated(cart);
      navigate('/checkout');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể mua ngay sản phẩm.';
      setActionMessage(message);
      if (message.includes('Unauthorized')) {
        navigate('/login', { state: { from: location.pathname } });
      }
    } finally {
      setQuickBuyLoading((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-0 pb-16">
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0f1f3c] to-[var(--background)]">
        <div className="absolute inset-0 opacity-5">
          {/* <div className="absolute top-20 left-20 w-72 h-72 bg-[var(--primary)] rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[var(--primary)] rounded-full blur-3xl" /> */}
        </div>
        <div className="relative mx-auto flex max-w-6xl h-168 flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <h1
            className="font-serif text-7xl md:text-8xl lg:text-9xl font-bold mb-8 text-foreground tracking-tight"
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

        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-4 space-y-4">
            <h2 className="text-lg font-semibold">Bộ lọc</h2>

            <div className="space-y-2 text-sm">
              <label htmlFor="search" className="block text-[var(--muted-foreground)]">
                Tìm kiếm
              </label>
              <input
                id="search"
                type="search"
                placeholder="Áo, váy, màu sắc..."
                value={filters.search ?? ''}
                onChange={(e) => handleInputChange('search', e.target.value)}
                className="w-full rounded-lg border border-[hsl(211,35%,55%)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
                className="w-full rounded-lg border border-[hsl(211,35%,55%)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
                  className="w-full rounded-lg border border-[hsl(211,35%,55%)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[var(--muted-foreground)]">Màu</label>
                <input
                  type="text"
                  placeholder="Black..."
                  value={filters.color ?? ''}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full rounded-lg border border-[hsl(211,35%,55%)] bg-[rgba(255,255,255,0.03)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
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
            {loading && !error && (
              <p className="text-sm text-[var(--muted-foreground)]">Đang tải sản phẩm...</p>
            )}
            {error && <p className="text-sm text-red-300">{error}</p>}
            {actionMessage && !error && (
              <p className="text-sm text-[var(--muted-foreground)]">{actionMessage}</p>
            )}

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
                        className="w-full rounded-full bg-[var(--primary)] py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[#0064c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );
};

export default ProductList;

