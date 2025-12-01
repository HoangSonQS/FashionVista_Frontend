import { useCallback, useEffect, useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import { emitCartUpdated } from '../../utils/cartEvents';
import type { CartItem } from '../../types/cart';

const CartDrawer = () => {
  const { open, cart, loading, closeDrawer, refreshCart, updateCartState } = useCartDrawer();
  const navigate = useNavigate();
  const cartItems = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;
  const shipping = cart?.shippingFee ?? 0;
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<Set<number>>(new Set());
  const [stockCheckMessages, setStockCheckMessages] = useState<Record<number, string>>({});

  const checkItemStock = useCallback(async (item: CartItem): Promise<boolean> => {
    try {
      const product = await productService.getProduct(item.productSlug);
      const variant = product.variants.find((v) => v.id === item.variantId);
      
      if (!variant) {
        setStockCheckMessages((prev) => ({
          ...prev,
          [item.id]: 'Biến thể sản phẩm không tồn tại.',
        }));
        return false;
      }

      if (!variant.active || variant.stock <= 0) {
        setStockCheckMessages((prev) => ({
          ...prev,
          [item.id]: 'Sản phẩm đã hết hàng.',
        }));
        setOutOfStockItems((prev) => new Set(prev).add(item.id));
        return false;
      }

      if (variant.stock < item.quantity) {
        setStockCheckMessages((prev) => ({
          ...prev,
          [item.id]: `Chỉ còn ${variant.stock} sản phẩm trong kho.`,
        }));
        setOutOfStockItems((prev) => new Set(prev).add(item.id));
        return false;
      }

      // Còn hàng, xóa thông báo và khỏi danh sách hết hàng
      setStockCheckMessages((prev) => {
        const next = { ...prev };
        delete next[item.id];
        return next;
      });
      setOutOfStockItems((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
      return true;
    } catch (error) {
      setStockCheckMessages((prev) => ({
        ...prev,
        [item.id]: 'Không thể kiểm tra tồn kho. Vui lòng thử lại.',
      }));
      return false;
    }
  }, []);

  useEffect(() => {
    if (open && !cart && !loading) {
      void refreshCart();
    }
  }, [open, cart, loading, refreshCart]);

  // Tự động kiểm tra stock của các items đã chọn khi cart thay đổi
  useEffect(() => {
    if (!cart || selectedItemIds.length === 0) return;
    
    const checkSelectedItemsStock = async () => {
      for (const itemId of selectedItemIds) {
        const item = cartItems.find((i) => i.id === itemId);
        if (item) {
          await checkItemStock(item);
        }
      }
    };
    
    void checkSelectedItemsStock();
  }, [cartItems, selectedItemIds, checkItemStock]);

  useEffect(() => {
    setSelectedItemIds((prev) => {
      const existingIds = cartItems
        .filter((item) => prev.includes(item.id))
        .map((item) => item.id);
      const newIds = cartItems
        .map((item) => item.id)
        .filter((id) => !existingIds.includes(id));
      const next = [...existingIds, ...newIds];
      if (next.length === prev.length && next.every((id, index) => id === prev[index])) {
        return prev;
      }
      return next;
    });
  }, [cartItems]);

  const handleQuantityChange = async (item: CartItem, quantity: number) => {
    if (quantity < 1) {
      return;
    }
    try {
      const updated = await cartService.updateItem(item.id, quantity);
      updateCartState(updated);
      emitCartUpdated(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      const updated = await cartService.removeItem(itemId);
      updateCartState(updated);
      emitCartUpdated(updated);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckout = () => {
    // Chỉ cho checkout các item còn hàng
    const availableSelectedIds = selectedItemIds.filter((id) => !outOfStockItems.has(id));
    if (availableSelectedIds.length === 0) {
      return;
    }
    closeDrawer();
    navigate('/checkout', { state: { selectedItemIds: availableSelectedIds } });
  };

  const handleContinueShopping = () => {
    closeDrawer();
    navigate('/');
  };

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + '₫';
  const allSelected = cartItems.length > 0 && selectedItemIds.length === cartItems.length;

  const toggleSelectAll = async () => {
    if (allSelected) {
      setSelectedItemIds([]);
      return;
    }

    // Kiểm tra stock của tất cả items trước khi chọn
    const availableItems: number[] = [];
    for (const item of cartItems) {
      const isAvailable = await checkItemStock(item);
      if (isAvailable) {
        availableItems.push(item.id);
      }
    }
    setSelectedItemIds(availableItems);
  };

  const toggleItemSelection = async (itemId: number) => {
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;

    // Nếu đang bỏ chọn, cho phép
    if (selectedItemIds.includes(itemId)) {
      setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
      return;
    }

    // Nếu đang chọn, kiểm tra stock trước
    const isAvailable = await checkItemStock(item);
    if (isAvailable) {
      setSelectedItemIds((prev) => [...prev, itemId]);
    }
  };

  // Chỉ tính tiền các item đã chọn và còn hàng
  const selectedItems = cartItems.filter(
    (item) => selectedItemIds.includes(item.id) && !outOfStockItems.has(item.id)
  );
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const hasSelection = selectedItemIds.length > 0;
  const proportionalShipping =
    hasSelection && subtotal > 0 ? Math.round((shipping * selectedSubtotal) / subtotal) : 0;
  const displaySubtotal = hasSelection ? selectedSubtotal : 0;
  const displayShipping = hasSelection ? proportionalShipping : 0;
  const displayTotal = hasSelection ? displaySubtotal + displayShipping : 0;

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[31.125rem] flex-col bg-[var(--card)] text-[var(--foreground)] shadow-2xl transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-3 border-b border-[var(--border)] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-semibold">Giỏ hàng</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                {cartItems.length} sản phẩm trong giỏ
              </p>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full border border-[var(--border)] p-2 hover:bg-[var(--border)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {cartItems.length > 0 && (
            <label className="flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="h-4 w-4"
              />
              Chọn tất cả
            </label>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-5">
          {loading ? (
            <p className="py-10 text-center text-sm text-[var(--muted-foreground)]">Đang tải...</p>
          ) : cartItems.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-[var(--muted-foreground)]">
              <ShoppingBag className="h-12 w-12" />
              <p>Giỏ hàng của bạn đang trống.</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 py-4">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id) && !outOfStockItems.has(item.id)}
                      onChange={() => toggleItemSelection(item.id)}
                      disabled={outOfStockItems.has(item.id)}
                      className="h-4 w-4 rounded border-[var(--border)] bg-transparent text-[var(--primary)] focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label={`Chọn ${item.productName}`}
                    />
                  </div>
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
                    {item.thumbnailUrl ? (
                      <img src={item.thumbnailUrl} alt={item.productName} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.productName}</p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-[var(--muted-foreground)]">
                            {item.size && <>Size: {item.size} </>}
                            {item.color && <>• Màu: {item.color}</>}
                          </p>
                        )}
                        {stockCheckMessages[item.id] && (
                          <p className="text-xs text-[var(--error)] mt-1 font-medium">
                            {stockCheckMessages[item.id]}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="text-xs text-red-300 hover:text-red-100"
                      >
                        Xóa
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{formatCurrency(item.subtotal)}</p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--border)]"
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          type="button"
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--border)]"
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 border-t border-[var(--border)] px-5 py-4">
          <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
            <span>Tạm tính</span>
            <span>{formatCurrency(displaySubtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
            <span>Phí vận chuyển</span>
            <span>{displayShipping === 0 ? 'Miễn phí' : formatCurrency(displayShipping)}</span>
          </div>
          <div className="flex justify-between text-lg font-semibold">
            <span>Tổng cộng</span>
            <span>{formatCurrency(displayTotal)}</span>
          </div>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={selectedItemIds.length === 0}
            className="w-full rounded-full bg-[var(--primary)] py-3 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            {selectedItemIds.length === 0 ? 'Chọn sản phẩm để thanh toán' : 'Thanh toán'}
          </button>
          <button
            type="button"
            onClick={handleContinueShopping}
            className="w-full rounded-full border border-[var(--border)] py-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;


