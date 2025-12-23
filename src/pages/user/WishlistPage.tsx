import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { wishlistService } from '../../services/wishlistService';
import type { WishlistItem } from '../../types/wishlist';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { LoginModal } from '../../components/common/LoginModal';

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

const WishlistPage = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const loadWishlist = async () => {
      try {
        const items = await wishlistService.getMyWishlist();
        setWishlistItems(items);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          setShowLoginModal(true);
        } else {
          showToast('Không thể tải danh sách yêu thích.', 'error');
        }
      } finally {
        setLoading(false);
      }
    };
    void loadWishlist();
  }, [showToast]);

  const handleRemove = async (productId: number, wishlistId: number) => {
    setRemovingIds((prev) => new Set(prev).add(wishlistId));
    try {
      await wishlistService.remove(productId);
      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistId));
      showToast('Đã xóa khỏi danh sách yêu thích.', 'success');
      // Dispatch event để header cập nhật số lượng
      window.dispatchEvent(new CustomEvent('wishlist-updated'));
    } catch (err) {
      showToast('Không thể xóa sản phẩm. Vui lòng thử lại.', 'error');
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(wishlistId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square bg-gray-100" />
                <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-light text-[#4DA3E8] tracking-wide uppercase">
            Danh sách yêu thích
          </h1>
          {wishlistItems.length > 0 && (
            <span className="text-sm text-gray-600 font-light">
              {wishlistItems.length} sản phẩm
            </span>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-xl font-light text-gray-600 mb-2">Danh sách yêu thích trống</h2>
            <p className="text-sm text-gray-500 mb-6">Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
            <Link
              to="/products"
              className="inline-block border border-[#4DA3E8] text-[#4DA3E8] px-6 py-2 text-sm font-light tracking-wider uppercase hover:bg-[#4DA3E8] hover:text-white transition-all duration-300"
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
            {wishlistItems.map((item) => {
              const hasDiscount = item.compareAtPrice && item.compareAtPrice > item.price;
              const discountPercent = hasDiscount
                ? Math.round(((item.compareAtPrice! - item.price) / item.compareAtPrice!) * 100)
                : 0;
              const isRemoving = removingIds.has(item.id);

              return (
                <div key={item.id} className="group relative">
                  <Link to={`/products/${item.productSlug}`} className="block">
                    <div className="relative overflow-hidden bg-white aspect-square">
                      {item.thumbnailUrl ? (
                        <img
                          src={item.thumbnailUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                          <ShoppingBag className="h-12 w-12" />
                        </div>
                      )}
                      {hasDiscount && (
                        <div className="absolute top-4 left-4 bg-[#4DA3E8] text-white px-3 py-1 text-xs font-medium tracking-wide">
                          -{discountPercent}%
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="mt-4 space-y-1">
                    <Link to={`/products/${item.productSlug}`}>
                      <h3 className="font-light text-sm text-[#4DA3E8] hover:underline transition-all line-clamp-2 tracking-wide">
                        {item.productName}
                      </h3>
                    </Link>
                    <div className="flex items-baseline gap-2">
                      <span className="font-normal text-sm text-[#4DA3E8]">
                        {formatCurrency(item.price)}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-gray-500 line-through font-light">
                          {formatCurrency(item.compareAtPrice!)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.productId, item.id)}
                    disabled={isRemoving}
                    className="mt-2 w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-light text-gray-700 hover:bg-gray-50 hover:border-[#4DA3E8] transition-all disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        Đang xóa...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default WishlistPage;

