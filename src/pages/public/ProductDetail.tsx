import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import { getAuthSession } from '../../services/authSession';
import { ChevronLeft, ChevronRight, X, Maximize2, Minus, Plus, Heart } from 'lucide-react';

const ProductDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Sửa lỗi logic: Khi đổi variant, kiểm tra lại số lượng nếu vượt quá stock thì reset về stock hoặc 1
  useEffect(() => {
    if (selectedVariant && quantity > selectedVariant.stock) {
      setQuantity(selectedVariant.stock || 1);
    }
  }, [selectedVariant, quantity]);

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
    if (!getAuthSession('user')) {
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
    if (!getAuthSession('user')) {
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-20">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-[10px] uppercase tracking-[0.2em] text-[var(--muted-foreground)]">
        <Link to="/" className="hover:text-[var(--foreground)]">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/category/${product.categorySlug}`} className="hover:text-[var(--foreground)]">{product.category}</Link>
        <span className="mx-2">/</span>
        <span className="text-[var(--foreground)]">{product.name}</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Column 1 & 2: Images (8/12) */}
          <div className="lg:col-span-8 flex flex-col md:flex-row gap-6">
            
            {/* Vertical Thumbnails */}
            {product.images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3 w-20 shrink-0">
                {product.images.map((image, idx) => (
                  <button
                    key={image.id}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`aspect-[3/4] border transition-all duration-300 overflow-hidden ${
                      activeImageIndex === idx ? 'border-[var(--foreground)]' : 'border-transparent hover:border-[var(--border)]'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`Thumbnail ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 aspect-[3/4] bg-[var(--background)] group">
              {product.images.length > 0 ? (
                <>
                  <img
                    src={product.images[activeImageIndex]?.url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setIsViewerOpen(true)}
                    className="absolute bottom-6 right-6 p-3 bg-[var(--background)]/80 backdrop-blur-sm rounded-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-[var(--background)]"
                  >
                    <Maximize2 size={20} className="text-[var(--foreground)]" />
                  </button>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--muted-foreground)] uppercase tracking-widest text-[11px]">
                  No Image Available
                </div>
              )}
              
              {/* Mobile Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex md:hidden gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
                  {product.images.map((image, idx) => (
                    <button
                      key={image.id}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-16 aspect-[3/4] shrink-0 border transition-all ${
                        activeImageIndex === idx ? 'border-gray-900' : 'border-transparent'
                      }`}
                    >
                      <img src={image.url} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Product Info (4/12) */}
          <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-8 self-start">
            <div>
              <h1 className="text-2xl font-medium uppercase tracking-wider mb-2">{product.name}</h1>
              <div className="flex flex-col gap-1 text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">
                <span>SKU: {product.sku}</span>
                <span className="text-[var(--foreground)] font-medium">Pre-order</span>
              </div>
              
              <div className="h-[1px] bg-[var(--border)]/30 w-full my-6" />

              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-2xl font-medium text-[var(--error)]">
                  {product.price.toLocaleString('vi-VN')}₫
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-[var(--muted-foreground)] line-through text-lg">
                    {product.compareAtPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
              </div>

              {/* Variant Selectors */}
              <div className="space-y-6">
                {uniqueSizes.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-medium">Size</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueSizes.map((size) => {
                        const isSelected = selectedVariant?.size === size;
                        const matchingVariant = availableVariants.find(
                          (v) => v.size === size && (!selectedVariant?.color || v.color === selectedVariant.color)
                        ) || availableVariants.find((v) => v.size === size);

                        return (
                          <button
                            key={size}
                            onClick={() => matchingVariant && setSelectedVariant(matchingVariant)}
                            className={`min-w-[48px] h-10 border text-[12px] transition-all ${
                              isSelected 
                                ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]' 
                                : 'border-[var(--border)] hover:border-[var(--foreground)]'
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
                  <div className="space-y-3">
                    <p className="text-[11px] uppercase tracking-[0.2em] font-medium">Color</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueColors.map((color) => {
                        const isSelected = selectedVariant?.color === color;
                        const matchingVariant = availableVariants.find(
                          (v) => v.color === color && (!selectedVariant?.size || v.size === selectedVariant.size)
                        ) || availableVariants.find((v) => v.color === color);

                        return (
                          <button
                            key={color}
                            onClick={() => matchingVariant && setSelectedVariant(matchingVariant)}
                            className={`px-4 h-10 border text-[12px] transition-all uppercase tracking-widest ${
                              isSelected 
                                ? 'bg-[var(--foreground)] text-[var(--background)] border-[var(--foreground)]' 
                                : 'border-[var(--border)] hover:border-[var(--foreground)]'
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-[var(--border)] w-32 h-12 text-[var(--foreground)] rounded-sm">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="flex-1 hover:bg-[var(--muted)] h-full flex items-center justify-center transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      readOnly
                      className="w-10 text-center text-sm font-medium focus:outline-none bg-transparent"
                    />
                    <button
                      onClick={() => setQuantity(q => Math.min(q + 1, selectedVariant?.stock || 1))}
                      className="flex-1 hover:bg-[var(--muted)] h-full flex items-center justify-center transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className="flex-1 bg-[var(--primary)] text-[var(--primary-foreground)] h-12 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:bg-[var(--muted)] rounded-sm"
                  >
                    Add to cart
                  </button>
                </div>

                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="w-full h-12 border border-[var(--primary)] text-[var(--primary)] text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all disabled:border-[var(--border)] disabled:text-[var(--muted-foreground)]"
                >
                  Buy Now
                </button>
                
                {/* Wishlist Button - Minimalist */}
                <button
                  onClick={async () => {
                    if (!ensureAuthenticated()) return;
                    setTogglingWishlist(true);
                    try {
                      const added = await wishlistService.toggle(product.id);
                      setInWishlist(added);
                    } finally {
                      setTogglingWishlist(false);
                    }
                  }}
                  disabled={togglingWishlist}
                  className="flex items-center justify-center gap-2 w-full text-[11px] uppercase tracking-widest text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors py-2"
                >
                  <Heart size={14} className={inWishlist ? 'fill-[var(--foreground)] text-[var(--foreground)]' : ''} />
                  {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>
            </div>

            {/* Product Details Accordin/Sections */}
            <div className="pt-8 border-t border-[var(--border)]/50">
              <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-6">Thông tin sản phẩm</h3>
              <div className="prose prose-sm text-[var(--muted-foreground)] font-light leading-relaxed max-w-none">
                {product.shortDescription || product.description}
              </div>
            </div>
            
            {status && (
              <p className="mt-4 text-[11px] text-[var(--error)] uppercase tracking-widest text-center">{status}</p>
            )}
          </div>
        </div>

        {/* Reviews Section - Bottom */}
        <div className="mt-24 pt-16 border-t border-[var(--border)]/50">
          <div className="max-w-3xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-[14px] uppercase tracking-[0.3em] font-semibold mb-2">Đánh giá từ khách hàng</h2>
                <div className="flex items-center gap-4">
                  <div className="flex text-[var(--foreground)]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className="text-sm">
                        {s <= Math.round(averageRating) ? '★' : '☆'}
                      </span>
                    ))}
                  </div>
                  <span className="text-[12px] font-medium tracking-widest text-[var(--muted-foreground)]">
                    {averageRating.toFixed(1)} / 5.0 ({reviews.length} đánh giá)
                  </span>
                </div>
              </div>

              {/* Form trigger would be here or simple inline form */}
            </div>

            {/* Form tạo review */}
            <div className="bg-[var(--muted)]/50 p-8 space-y-6">
              <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)]">Gửi đánh giá của bạn</p>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <select
                    value={newReviewRating}
                    onChange={(e) => setNewReviewRating(Number(e.target.value))}
                    className="bg-transparent border-b border-[var(--border)] py-2 text-[11px] uppercase tracking-widest focus:outline-none focus:border-[var(--foreground)]"
                  >
                    {[5, 4, 3, 2, 1].map((star) => (
                      <option key={star} value={star}>{star} Stars</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    placeholder="CHIA SẺ CẢM NHẬN CỦA BẠN..."
                    className="flex-1 bg-transparent border-b border-[var(--border)] py-2 text-[11px] tracking-[0.1em] focus:outline-none focus:border-[var(--foreground)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50"
                  />
                </div>
                <button
                  type="button"
                  disabled={submittingReview}
                  onClick={async () => {
                    if (!ensureAuthenticated()) return;
                    setSubmittingReview(true);
                    try {
                      const created = await reviewService.createReview({
                        productId: product.id,
                        rating: newReviewRating,
                        comment: newReviewComment || undefined,
                      });
                      setReviews((prev) => [created, ...prev]);
                      setNewReviewComment('');
                    } catch (err) {
                      const axiosError = err as AxiosError<{ message?: string }>;
                      setStatus(axiosError.response?.data?.message || 'Không thể gửi đánh giá.');
                    } finally {
                      setSubmittingReview(false);
                    }
                  }}
                  className="self-end text-[10px] uppercase tracking-[0.3em] font-semibold hover:underline transition-all disabled:text-[var(--muted-foreground)] text-[var(--foreground)]"
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </div>
            </div>

            {/* Danh sách review */}
            <div className="space-y-10">
              {loadingReviews ? (
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] text-center py-10">Đang tải đánh giá...</p>
              ) : reviews.length === 0 ? (
                <p className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] text-center py-10">Chưa có đánh giá nào.</p>
              ) : (
                <>
                  <div className="divide-y divide-[var(--border)]/30">
                    {displayedReviews.map((review) => (
                      <div key={review.id} className="py-8 space-y-3">
                        <div className="flex justify-between items-center text-[var(--foreground)]">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <span key={s} className="text-[10px]">
                                {s <= review.rating ? '★' : '☆'}
                              </span>
                            ))}
                          </div>
                          <span className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-widest">
                            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-[12px] text-[var(--muted-foreground)] font-light leading-relaxed tracking-[0.05em]">
                            {review.comment}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    {!showAllReviews && lowRatingReviews.length > 0 && (
                      <button
                        onClick={() => setShowAllReviews(true)}
                        className="text-[10px] uppercase tracking-[0.3em] font-semibold border-b border-[var(--foreground)] pb-1 hover:border-transparent transition-all text-[var(--foreground)]"
                      >
                        VIEW ALL REVIEWS
                      </button>
                    )}
                    {showAllReviews && lowRatingReviews.length > 0 && (
                      <button
                        onClick={() => setShowAllReviews(false)}
                        className="text-[10px] uppercase tracking-[0.3em] font-semibold border-b border-[var(--foreground)] pb-1 hover:border-transparent transition-all text-[var(--foreground)]"
                      >
                        SHOW LESS
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Image Viewer Modal */}
      {isViewerOpen && (
        <div className="fixed inset-0 z-[100] bg-[var(--background)] flex flex-col items-center justify-center animate-in fade-in duration-300">
          <button 
            onClick={() => setIsViewerOpen(false)}
            className="absolute top-10 right-10 p-2 hover:bg-[var(--muted)] rounded-full transition-colors z-10"
          >
            <X size={24} className="text-[var(--foreground)]" />
          </button>

          <div className="relative w-full h-full flex items-center justify-center px-20">
            <button 
              onClick={() => setActiveImageIndex(i => (i - 1 + product.images.length) % product.images.length)}
              className="absolute left-10 p-4 hover:bg-[var(--muted)] rounded-full transition-all"
            >
              <ChevronLeft size={32} strokeWidth={1} className="text-[var(--foreground)]" />
            </button>

            <div className="h-[80vh] aspect-[3/4] shadow-2xl overflow-hidden bg-[var(--background)]">
              <img 
                src={product.images[activeImageIndex]?.url} 
                alt="" 
                className="w-full h-full object-contain"
              />
            </div>

            <button 
              onClick={() => setActiveImageIndex(i => (i + 1) % product.images.length)}
              className="absolute right-10 p-4 hover:bg-[var(--muted)] rounded-full transition-all"
            >
              <ChevronRight size={32} strokeWidth={1} className="text-[var(--foreground)]" />
            </button>
          </div>

          {/* Pagination Dots */}
          <div className="absolute bottom-12 flex gap-3">
            {product.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  activeImageIndex === idx ? 'bg-[var(--foreground)] w-4' : 'bg-[var(--border)]'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để thực hiện chức năng này."
      />
    </div>
  );
};

export default ProductDetailPage;

