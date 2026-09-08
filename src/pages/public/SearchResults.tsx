import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { productService } from '../../services/productService';
import type { SearchSuggestion, ProductVariant } from '../../types/product';
import { cartService } from '../../services/cartService';
import { emitCartUpdated } from '../../utils/cartEvents';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../../components/common/LoginModal';
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';
import { getAuthSession } from '../../services/authSession';

// Kết quả dùng ở trang search: gồm thông tin suggestion + giá để hiển thị card giống trang home
type SearchResultItem = SearchSuggestion & {
  price: number;
  compareAtPrice?: number | null;
  hoverThumbnailUrl?: string | null;
};

const SearchResultsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('q') ?? params.get('search') ?? '';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quickAddLoading, setQuickAddLoading] = useState<Record<string, boolean>>({});
  const [variantModal, setVariantModal] = useState<{
    product: SearchSuggestion;
    variants: ProductVariant[];
    mode: 'add' | 'buy';
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [variantSubmitting, setVariantSubmitting] = useState(false);
  const { openDrawer } = useCartDrawer();
  const { showToast } = useToast();

  const currentQuery = params.get('q') ?? params.get('search') ?? '';

  // Mỗi lần điều hướng tới trang tìm kiếm (hoặc thay đổi query),
  // đảm bảo cuộn về đầu trang để không giữ vị trí cuộn cũ.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [location.pathname, location.search]);

  // Đồng bộ ô input với URL khi user thay đổi query từ header / back/forward
  useEffect(() => {
    setQuery((prev) => (prev === currentQuery ? prev : currentQuery));
  }, [currentQuery]);

  const performSearch = async (keyword: string) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }
    try {
      setError(null);
      setLoading(true);
      const suggestions = await productService.getSuggestions(trimmed);

      // Lấy thêm chi tiết sản phẩm để có giá / giá gạch giống card ở trang home
      const enriched = await Promise.all(
        suggestions.map(async (item) => {
          try {
            const detail = await productService.getProduct(item.slug);
            const primaryImage =
              item.thumbnailUrl ||
              detail.images.find((img) => img.primary)?.url ||
              detail.images[0]?.url ||
              null;

            const secondaryImage =
              detail.images.filter((img) => !img.primary)[0]?.url ||
              detail.images[1]?.url ||
              null;

            return {
              ...item,
              price: detail.price,
              compareAtPrice: detail.compareAtPrice ?? null,
              thumbnailUrl: primaryImage,
              hoverThumbnailUrl: secondaryImage,
            } as SearchResultItem;
          } catch {
            // Nếu lỗi lấy chi tiết một sản phẩm, bỏ qua sản phẩm đó
            return null;
          }
        }),
      );

      setResults(enriched.filter((x): x is SearchResultItem => x !== null));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải kết quả tìm kiếm.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Tự động search khi query trên URL thay đổi (ví dụ từ header)
  useEffect(() => {
    void performSearch(currentQuery);
  }, [currentQuery]);

  const ensureAuthenticated = () => {
    if (!getAuthSession('user')) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const openVariantSelection = (
    product: SearchSuggestion,
    variants: ProductVariant[],
    mode: 'add' | 'buy',
  ) => {
    setVariantModal({ product, variants, mode });
    const first = variants[0];
    setSelectedColor(first?.color ?? null);
    setSelectedSize(first?.size ?? null);
  };

  const handleQuickAdd = async (product: SearchSuggestion) => {
    if (!ensureAuthenticated()) {
      return;
    }
    setQuickAddLoading((prev) => ({ ...prev, [product.slug]: true }));
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
      if (message.includes('Unauthorized')) {
        setShowLoginModal(true);
      }
    } finally {
      setQuickAddLoading((prev) => {
        const next = { ...prev };
        delete next[product.slug];
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
        // Mua ngay: mở giỏ hàng (drawer) với item vừa thêm, user tự điều chỉnh rồi bấm checkout
        openDrawer({ cart });
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
    void performSearch(trimmed);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {/* Back button + Header search bar */}
        <section className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex w-fit items-center justify-center rounded-sm border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-[10px] uppercase tracking-widest text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            ← Back to Home
          </button>
          <h1
            className="text-2xl md:text-3xl font-semibold"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Kết quả tìm kiếm
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            {initialQuery
              ? `Hiển thị sản phẩm phù hợp với từ khóa “${initialQuery}”.`
              : 'Nhập từ khóa để tìm sản phẩm bạn quan tâm.'}
          </p>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-sm border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 shadow-sm max-w-xl"
          >
            <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH ITEMS, COLORS, COLLECTIONS..."
              className="flex-1 bg-transparent text-sm text-[var(--foreground)] focus:outline-none uppercase placeholder:text-[10px]"
            />
            <button
              type="submit"
              className="rounded-sm bg-[var(--primary)] px-4 py-1.5 text-[10px] uppercase tracking-widest font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-all"
            >
              Search
            </button>
          </form>
        </section>

        {/* Content */}
        <section className="space-y-4">
          {loading && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Đang tải kết quả tìm kiếm...
            </p>
          )}

          {error && !loading && (
            <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error)]">
              {error}
            </div>
          )}

          {!loading && !error && results.length === 0 && currentQuery && (
            <p className="text-sm text-[var(--muted-foreground)]">
              Không tìm thấy sản phẩm nào. Hãy thử từ khóa khác hoặc đơn giản hơn.
            </p>
          )}

          {!loading && !error && results.length > 0 && (
            <>
              <div className="grid gap-x-4 gap-y-10 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                {results.map((product) => (
                  <div
                    key={product.slug}
                    className="flex flex-col group transition-all duration-300"
                  >
                    <ProductCard
                      slug={product.slug}
                      name={product.name}
                      price={product.price}
                      compareAtPrice={product.compareAtPrice}
                      thumbnailUrl={product.thumbnailUrl ?? null}
                      hoverThumbnailUrl={(product as any).hoverThumbnailUrl}
                    />
                    <div className="mt-3 w-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button
                        type="button"
                        onClick={() => handleQuickAdd(product)}
                        disabled={Boolean(quickAddLoading[product.slug])}
                        className="w-full border border-black py-1.5 text-[10px] font-medium uppercase tracking-widest text-black hover:bg-black hover:text-white transition-all disabled:opacity-50"
                      >
                        {quickAddLoading[product.slug] ? '...' : 'Add to cart'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          message="Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua ngay."
        />



        {variantModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md max-h-[80vh] rounded-sm bg-[var(--card)] shadow-2xl border border-[var(--border)] flex flex-col">
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
                            (v) => v.color === color && v.active && v.stock > 0,
                          );
                          const disabled = !hasStock;
                          const isActive = selectedColor === color && !disabled;
                          return (
                            <button
                              key={color}
                              type="button"
                              disabled={disabled}
                              onClick={() => !disabled && setSelectedColor(color)}
                              className={`whitespace-nowrap rounded-sm border px-3.5 py-2 text-xs transition-colors ${isActive
                                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
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
                            (v) => v.size === size && v.active && v.stock > 0,
                          );
                          const disabled = !hasStock;
                          const isActive = selectedSize === size && !disabled;
                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={disabled}
                              onClick={() => !disabled && setSelectedSize(size)}
                              className={`rounded-sm border px-2 py-1.5 text-xs text-center transition-colors ${isActive
                                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
                                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/60 hover:text-[var(--foreground)]'
                                } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                            >
                              {size}
                              {disabled && (
                                <span className="block text-[10px] mt-0.5">Hết hàng</span>
                              )}
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
                  className="w-full rounded-sm bg-[var(--primary)] py-2.5 text-[11px] uppercase tracking-[0.2em] font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {variantSubmitting
                    ? 'Processing...'
                    : variantModal.mode === 'add'
                      ? 'Add to collection'
                      : 'Buy now'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;

