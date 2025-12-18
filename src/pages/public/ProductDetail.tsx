import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { AxiosError } from 'axios';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import type { ProductDetail, ProductVariant } from '../../types/product';
import { emitCartUpdated } from '../../utils/cartEvents';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../../components/common/LoginModal';
import { reviewService } from '../../services/reviewService';
import type { ReviewSummary } from '../../types/review';
import { wishlistService } from '../../services/wishlistService';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { openDrawer } = useCartDrawer();
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      try {
        const detail = await productService.getProduct(slug);
        setProduct(detail);
        // Chỉ lấy biến thể còn hàng (active && stock > 0)
        const availableVariants = detail.variants.filter((v) => v.active && v.stock > 0);
        if (availableVariants.length > 0) {
          setSelectedVariant(availableVariants[0]);
        } else {
          // Tất cả biến thể đều hết hàng
          setSelectedVariant(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không tìm thấy sản phẩm.');
      }
    };
    fetchProduct();
  }, [slug]);

  // Load reviews khi đã có product
  useEffect(() => {
    if (!product) return;
    const loadReviews = async () => {
      setLoadingReviews(true);
      try {
        const data = await reviewService.getProductReviews(product.id);
        setReviews(data);
      } catch {
        // ignore review error, không chặn trang
      } finally {
        setLoadingReviews(false);
      }
    };
    void loadReviews();
  }, [product]);

  // Kiểm tra trạng thái wishlist để hiển thị đúng nhãn (nếu đã đăng nhập)
  useEffect(() => {
    if (!product) return;
    const rawAuth = typeof window !== 'undefined' ? window.localStorage.getItem('auth') : null;
    if (!rawAuth) {
      setInWishlist(false);
      return;
    }
    let cancelled = false;
    const checkWishlist = async () => {
      try {
        const items = await wishlistService.getMyWishlist();
        if (!cancelled) {
          setInWishlist(items.some((item) => item.productId === product.id));
        }
      } catch {
        if (!cancelled) {
          setInWishlist(false);
        }
      }
    };
    void checkWishlist();
    return () => {
      cancelled = true;
    };
  }, [product]);

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

  const handleAddToCart = async () => {
    if (!ensureAuthenticated()) {
      return;
    }
    if (!selectedVariant) {
      setStatus('Sản phẩm đã hết hàng.');
      return;
    }
    if (selectedVariant.stock < quantity) {
      setStatus(`Chỉ còn ${selectedVariant.stock} sản phẩm.`);
      return;
    }
    try {
      const cart = await cartService.addItem(selectedVariant.sku, quantity);
      emitCartUpdated(cart);
      openDrawer({ cart });
      setStatus('Đã thêm vào giỏ hàng.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng.');
      if ((err as Error).message.includes('Unauthorized')) {
        setShowLoginModal(true);
      }
    }
  };

  const handleBuyNow = async () => {
    if (!ensureAuthenticated()) {
      return;
    }
    if (!selectedVariant) {
      setStatus('Sản phẩm đã hết hàng.');
      return;
    }
    if (selectedVariant.stock < quantity) {
      setStatus(`Chỉ còn ${selectedVariant.stock} sản phẩm.`);
      return;
    }
    try {
      // Nếu biến thể đã có trong giỏ: chỉ mở giỏ để người dùng tự chỉnh số lượng & checkout
      try {
        const currentCart = await cartService.getCart();
        const existingItem = currentCart.items.find((i) => i.variantId === selectedVariant.id);
        if (existingItem) {
          openDrawer({ cart: currentCart });
          setStatus('Sản phẩm đã có trong giỏ hàng. Vui lòng kiểm tra và thanh toán.');
          return;
        }
      } catch {
        // ignore, tiếp tục addItem bên dưới
      }

      const cart = await cartService.addItem(selectedVariant.sku, quantity);
      emitCartUpdated(cart);
      openDrawer({ cart });
      setStatus('Đã thêm sản phẩm vào giỏ hàng. Vui lòng kiểm tra và thanh toán.');
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Không thể mua ngay lúc này.');
      if ((err as Error).message.includes('Unauthorized')) {
        setShowLoginModal(true);
      }
    }
  };

  // Chỉ lấy biến thể còn hàng (active && stock > 0)
  const availableVariants = useMemo(() => {
    if (!product) return [];
    return product.variants.filter((v) => v.active && v.stock > 0);
  }, [product]);

  const uniqueSizes = useMemo(() => {
    const sizes = availableVariants
      .map((variant) => variant.size)
      .filter((size): size is string => Boolean(size));
    return Array.from(new Set(sizes));
  }, [availableVariants]);

  const uniqueColors = useMemo(() => {
    const colors = availableVariants
      .map((variant) => variant.color)
      .filter((color): color is string => Boolean(color));
    return Array.from(new Set(colors));
  }, [availableVariants]);

  const filteredVariants = useMemo(() => {
    if (!product) return [];
    return availableVariants.filter((variant) => {
      if (selectedVariant?.size && variant.size !== selectedVariant.size) return false;
      if (selectedVariant?.color && variant.color !== selectedVariant.color) return false;
      return true;
    });
  }, [product, selectedVariant, availableVariants]);

  const isOutOfStock = availableVariants.length === 0;

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  // Filter reviews: chỉ hiển thị >= 4 sao mặc định
  const highRatingReviews = reviews.filter((r) => r.rating >= 4);
  const lowRatingReviews = reviews.filter((r) => r.rating < 4);
  const displayedReviews = showAllReviews ? reviews : highRatingReviews;

  if (error) {
    return <p className="p-6 text-center text-red-300">{error}</p>;
  }

  if (!product) {
    return <p className="p-6 text-center text-[var(--muted-foreground)]">Đang tải...</p>;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="space-y-4 flex flex-col items-center">
          {product.images.length > 0 ? (
            product.images.map((image) => (
              <div
                key={image.id}
                className="rounded-3xl border border-[var(--border)] bg-[var(--background)] inline-flex items-center justify-center px-6 py-4 shadow-lg"
              >
                <img
                  src={image.url}
                  alt={image.alt ?? product.name}
                  className="max-h-[600px] w-auto object-contain"
                />
              </div>
            ))
          ) : (
            <div className="w-full h-96 rounded-3xl border border-[var(--border)] flex items-center justify-center text-[var(--muted-foreground)]">
              Đang cập nhật hình ảnh
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--muted-foreground)] mb-2">
              SixthSoul Studio
            </p>
            <div className="flex items-start justify-between gap-3">
            <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
              {product.name}
            </h1>
              <button
                type="button"
                onClick={async () => {
                  if (!ensureAuthenticated()) return;
                  if (!product) return;
                  setTogglingWishlist(true);
                  try {
                    const added = await wishlistService.toggle(product.id);
                    setInWishlist(added);
                    setStatus(
                      added
                        ? 'Đã thêm sản phẩm vào danh sách yêu thích.'
                        : 'Đã xóa sản phẩm khỏi danh sách yêu thích.',
                    );
                  } catch (err) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : 'Không thể cập nhật danh sách yêu thích. Vui lòng thử lại.';
                    setStatus(msg);
                  } finally {
                    setTogglingWishlist(false);
                  }
                }}
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  inWishlist
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
                disabled={togglingWishlist}
              >
                {togglingWishlist
                  ? 'Đang xử lý...'
                  : inWishlist
                  ? 'Xóa yêu thích'
                  : 'Thêm vào yêu thích'}
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <span className="inline-flex items-center rounded-full bg-[#4DA3E8] text-white px-3 py-1 text-xs font-medium tracking-wide">
                  SALE -{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}%
                </span>
              )}
              <p className="text-2xl font-semibold text-[var(--primary)]">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
              {product.compareAtPrice && product.compareAtPrice > product.price && (
                <p className="text-sm text-[var(--muted-foreground)] line-through">
                  {product.compareAtPrice.toLocaleString('vi-VN')}₫
                </p>
              )}
            </div>
          </div>

          {/* Reviews */}
          <section className="space-y-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-light text-[#4DA3E8] tracking-wide uppercase">
                Đánh giá sản phẩm
              </h2>
              {reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-sm ${
                        star <= Math.round(averageRating) ? 'text-[#4DA3E8]' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                  <span className="text-xs text-gray-600 font-light ml-2">
                    {averageRating.toFixed(1)} / 5 · {reviews.length} đánh giá
                  </span>
                </div>
              )}
            </div>

            {/* Form tạo review */}
            <div className="space-y-2 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4">
              <p className="text-xs text-[var(--muted-foreground)]">
                Chỉ khách đã mua mới có thể đánh giá. Nếu bạn chưa đăng nhập, hệ thống sẽ yêu cầu đăng nhập.
              </p>
              <div className="flex items-center gap-3">
                <select
                  value={newReviewRating}
                  onChange={(e) => setNewReviewRating(Number(e.target.value))}
                  className="rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  {[5, 4, 3, 2, 1].map((star) => (
                    <option key={star} value={star}>
                      {star} sao
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Chia sẻ cảm nhận của bạn..."
                  className="flex-1 rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={async () => {
                    if (!ensureAuthenticated()) return;
                    if (!product) return;
                    setSubmittingReview(true);
                    try {
                      const created = await reviewService.createReview({
                        productId: product.id,
                        rating: newReviewRating,
                        comment: newReviewComment || undefined,
                      });
                      setReviews((prev) => [created, ...prev]);
                      setNewReviewComment('');
                      setStatus('Cảm ơn bạn đã đánh giá sản phẩm.');
                    } catch (err) {
                      const axiosError = err as AxiosError<{ message?: string }>;
                      const msg =
                        axiosError.response?.data?.message ||
                        axiosError.message ||
                        'Không thể gửi đánh giá. Vui lòng thử lại.';
                      setStatus(msg);
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                  className="rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-4 py-2 text-xs sm:text-sm font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>

            {/* Danh sách review */}
            <div className="space-y-3">
              {loadingReviews ? (
                <p className="text-xs text-[var(--muted-foreground)]">Đang tải đánh giá...</p>
              ) : reviews.length === 0 ? (
                <p className="text-xs text-[var(--muted-foreground)]">
                  Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này.
                </p>
              ) : (
                <>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {displayedReviews.map((review) => (
                      <div
                        key={review.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4 text-sm"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-xs ${
                                  star <= review.rating ? 'text-[#4DA3E8]' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                            <span className="text-xs text-gray-500 font-light ml-1">
                              {review.rating}/5
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-light">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        {review.comment && (
                          <p className="mt-2 text-gray-700 font-light leading-relaxed">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  {!showAllReviews && lowRatingReviews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews(true)}
                      className="w-full mt-3 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium underline"
                    >
                      Xem tất cả đánh giá
                    </button>
                  )}
                  {showAllReviews && lowRatingReviews.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowAllReviews(false)}
                      className="w-full mt-3 text-xs text-[var(--primary)] hover:text-[var(--primary-hover)] font-medium underline"
                    >
                      Ẩn đánh giá
                    </button>
                  )}
                </>
              )}
            </div>
          </section>

          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{product.shortDescription}</p>

          {isOutOfStock ? (
            <div className="rounded-lg border border-[var(--error)] bg-[var(--error-bg)] p-4">
              <p className="text-sm font-medium text-[var(--error)]">Sản phẩm đã hết hàng</p>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">Tất cả biến thể của sản phẩm này đã hết hàng.</p>
            </div>
          ) : (
            <>
          {uniqueSizes.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--muted-foreground)]">Size</p>
              <div className="flex flex-wrap gap-2">
                    {uniqueSizes.map((size) => {
                      // Tìm biến thể có size này và còn hàng
                      const variantWithSize = availableVariants.find((v) => v.size === size);
                      return (
                  <button
                    key={size}
                    type="button"
                          onClick={() => {
                            if (variantWithSize) {
                              setSelectedVariant(variantWithSize);
                    }
                          }}
                    className={`px-3 py-1 rounded-full border ${
                            selectedVariant?.size === size
                              ? 'border-[var(--primary)] text-[var(--primary)]'
                              : 'border-[var(--border)]'
                    }`}
                  >
                    {size}
                  </button>
                      );
                    })}
              </div>
            </div>
          )}

          {uniqueColors.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--muted-foreground)]">Màu sắc</p>
              <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((color) => {
                      // Tìm biến thể có color này và còn hàng
                      const variantWithColor = availableVariants.find((v) => v.color === color);
                      return (
                  <button
                    key={color}
                    type="button"
                          onClick={() => {
                            if (variantWithColor) {
                              setSelectedVariant(variantWithColor);
                    }
                          }}
                    className={`px-3 py-1 rounded-full border ${
                            selectedVariant?.color === color
                              ? 'border-[var(--primary)] text-[var(--primary)]'
                              : 'border-[var(--border)]'
                    }`}
                  >
                    {color}
                  </button>
                      );
                    })}
              </div>
            </div>
          )}

          {/* Chỉ hiển thị select biến thể khi không có UI chọn size/màu phía trên */}
          {uniqueSizes.length === 0 && uniqueColors.length === 0 && filteredVariants.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm text-[var(--muted-foreground)]">Chọn biến thể</p>
              <select
                value={selectedVariant?.id ?? ''}
                onChange={(e) => {
                  const variant = availableVariants.find(
                    (item) => item.id === Number(e.target.value),
                  );
                  setSelectedVariant(variant ?? null);
                }}
                className="w-full rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {filteredVariants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.size ?? 'Free size'} / {variant.color ?? 'Đa sắc'} - {variant.stock} còn lại
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={!selectedVariant || quantity <= 1}
                  className="h-9 w-9 rounded-full border border-[var(--input-border)] bg-[var(--input-background)] text-lg leading-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  max={selectedVariant?.stock ?? 1}
                  value={quantity}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    if (Number.isNaN(raw) || raw <= 0) {
                      setQuantity(1);
                      return;
                    }
                    const max = selectedVariant?.stock ?? 1;
                    setQuantity(Math.min(raw, max));
                  }}
                  className="w-20 rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-center text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <button
                  type="button"
                  onClick={() =>
                    setQuantity((prev) => {
                      const max = selectedVariant?.stock ?? 1;
                      return Math.min(prev + 1, max);
                    })
                  }
                  disabled={!selectedVariant || quantity >= (selectedVariant?.stock ?? 1)}
                  className="h-9 w-9 rounded-full border border-[var(--input-border)] bg-[var(--input-background)] text-lg leading-none flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--muted)]"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedVariant}
                className="flex-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Thêm vào giỏ
              </button>
            </div>
            {selectedVariant && (
              <p className="text-xs text-[var(--muted-foreground)]">
                Còn {selectedVariant.stock} sản phẩm trong kho.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
                disabled={!selectedVariant}
                className="w-full rounded-full border border-[var(--primary)] text-[var(--primary)] py-3 font-medium hover:bg-[var(--primary)]/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Mua ngay & thanh toán
          </button>
            </>
          )}

          {status && <p className="text-sm text-[var(--muted-foreground)]">{status}</p>}
        </div>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua ngay."
      />
    </div>
  );
};

export default ProductDetailPage;

