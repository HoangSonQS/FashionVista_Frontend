import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { cartService } from '../../services/cartService';
import type { ProductDetail, ProductVariant } from '../../types/product';
import { emitCartUpdated } from '../../utils/cartEvents';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../../components/common/LoginModal';

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
      const cart = await cartService.addItem(selectedVariant.sku, quantity);
      emitCartUpdated(cart);
      navigate('/checkout');
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

        <div className="space-y-6">
          <div>
            <p className="text-xs tracking-[0.35em] uppercase text-[var(--muted-foreground)] mb-2">
              SixthSoul Studio
            </p>
            <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
              {product.name}
            </h1>
            <div className="flex items-center gap-3 mt-4">
              <p className="text-2xl font-semibold text-[var(--primary)]">
                {product.price.toLocaleString('vi-VN')}₫
              </p>
              {product.compareAtPrice && (
                <p className="text-sm text-[var(--muted-foreground)] line-through">
                  {product.compareAtPrice.toLocaleString('vi-VN')}₫
                </p>
              )}
            </div>
          </div>

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

          <div className="space-y-2">
            <p className="text-sm text-[var(--muted-foreground)]">Chọn biến thể</p>
            <select
              value={selectedVariant?.id ?? ''}
              onChange={(e) => {
                    const variant = availableVariants.find((item) => item.id === Number(e.target.value));
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

          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
                  max={selectedVariant?.stock ?? 1}
              value={quantity}
                  onChange={(e) => setQuantity(Math.min(Number(e.target.value), selectedVariant?.stock ?? 1))}
                  className="w-20 rounded-lg border border-[var(--input-border)] bg-[var(--input-background)] px-3 py-2 text-center text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
            <button
              type="button"
              onClick={handleAddToCart}
                  disabled={!selectedVariant}
                  className="flex-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thêm vào giỏ
            </button>
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

