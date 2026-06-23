import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import { productService } from '../../services/productService';
import type { CartItem, CartResponse } from '../../types/cart';
import { emitCartUpdated } from '../../utils/cartEvents';

const CartPage = () => {
  const location = useLocation();
  const locationState = location.state as { selectedItemIds?: number[] } | undefined;

  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>(() => locationState?.selectedItemIds ?? []);
  const [outOfStockItems, setOutOfStockItems] = useState<Set<number>>(new Set());
  const [stockCheckMessages, setStockCheckMessages] = useState<Record<number, string>>({});
  const navigate = useNavigate();
  // Chỉ tính tiền các item đã chọn và còn hàng
  const selectedItems = useMemo(
    () =>
      cart
        ? cart.items.filter(
            (item) => selectedItemIds.includes(item.id) && !outOfStockItems.has(item.id)
          )
        : [],
    [cart, selectedItemIds, outOfStockItems]
  );
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedShipping = selectedItems.length === 0 ? 0 : cart?.shippingFee ?? 0;
  const selectedTotal = selectedSubtotal + selectedShipping;
  const allSelected = cart ? selectedItemIds.length === cart.items.length && cart.items.length > 0 : false;
  const hasSelection = selectedItems.length > 0;

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

  const toggleSelectAll = async () => {
    if (!cart) return;
    if (allSelected) {
      setSelectedItemIds([]);
    } else {
      // Kiểm tra stock của tất cả items trước khi chọn
      const availableItems: number[] = [];
      for (const item of cart.items) {
        const isAvailable = await checkItemStock(item);
        if (isAvailable) {
          availableItems.push(item.id);
        }
      }
      setSelectedItemIds(availableItems);
    }
  };

  const toggleItemSelection = async (itemId: number) => {
    if (!cart) return;
    const item = cart.items.find((i) => i.id === itemId);
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

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      setCart(response);
      emitCartUpdated(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải giỏ hàng.');
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Tự động kiểm tra stock của các items đã chọn khi cart thay đổi
  useEffect(() => {
    if (!cart || selectedItemIds.length === 0) return;
    
    const checkSelectedItemsStock = async () => {
      for (const itemId of selectedItemIds) {
        const item = cart.items.find((i) => i.id === itemId);
        if (item) {
          await checkItemStock(item);
        }
      }
    };
    
    void checkSelectedItemsStock();
  }, [cart?.items, selectedItemIds, checkItemStock]);

  const handleQuantityChange = async (item: CartItem, quantity: number) => {
    try {
      const updated = await cartService.updateItem(item.id, quantity);
      setCart(updated);
      setSelectedItemIds((prev) => {
        const nextIds = updated.items.map((i) => i.id);
        const nextSet = new Set(nextIds);
        const filtered = prev.filter((id) => nextSet.has(id));
        return filtered.length > 0 ? filtered : nextIds;
      });
      emitCartUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật số lượng.');
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      const updated = await cartService.removeItem(itemId);
      setCart(updated);
      setSelectedItemIds((prev) => prev.filter((id) => id !== itemId));
      emitCartUpdated(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa sản phẩm.');
    }
  };

  if (!initialized) {
    return <p className="p-6 text-center text-[var(--muted-foreground)]">Đang tải giỏ hàng...</p>;
  }

  if (!cart) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6 text-center">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Giỏ hàng
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Không thể tải giỏ hàng vào lúc này. Vui lòng thử lại sau.
          </p>
          <button
            type="button"
            onClick={fetchCart}
            className="mx-auto rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + '₫';

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-2 sm:px-4 py-6">
      <div className="mx-auto space-y-6 max-w-[1250px]">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Giỏ hàng
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Kiểm tra sản phẩm trước khi tiến hành thanh toán.
          </p>
        </header>

        {error && <p className="text-sm text-red-300">{error}</p>}
        {loading && <p className="text-xs text-[var(--muted-foreground)]">Đang đồng bộ dữ liệu...</p>}

        {cart.items.length === 0 ? (
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-sm text-[var(--muted-foreground)] shadow-lg">
            Giỏ hàng đang trống.{' '}
            <Link to="/" className="text-[var(--primary)] hover:underline">
              Mua sắm ngay
            </Link>
          </div>
        ) : (
          <>
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted-foreground)] shadow-lg flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4"
                  checked={allSelected && cart.items.length > 0}
                  onChange={toggleSelectAll}
                />
                Chọn tất cả ({cart.items.length})
              </label>
              <button
                type="button"
                onClick={() => setSelectedItemIds([])}
                className="text-xs text-red-300 hover:text-red-100"
              >
                Bỏ chọn
              </button>
            </div>

            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
              <div className="hidden md:grid grid-cols-[60px_1fr_120px_120px_140px_120px] px-6 py-3 text-xs uppercase tracking-widest text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <span />
                <span>Sản phẩm</span>
                <span className="text-center">Đơn giá</span>
                <span className="text-center">Số lượng</span>
                <span className="text-center">Số tiền</span>
                <span className="text-center">Thao tác</span>
              </div>

              <div className="divide-y divide-[var(--border)]">
                {cart.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col md:grid md:grid-cols-[60px_1fr_120px_120px_140px_120px] gap-4 px-4 md:px-6 py-4 items-center"
                  >
                    <div className="flex w-full items-center justify-between md:justify-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 disabled:opacity-50 disabled:cursor-not-allowed"
                        checked={selectedItemIds.includes(item.id) && !outOfStockItems.has(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        disabled={outOfStockItems.has(item.id)}
                      />
                    </div>
                    <div className="flex w-full items-center gap-4">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        {item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.productName} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] text-[var(--muted-foreground)]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-1 text-left">
                        <p className="text-sm font-semibold leading-snug">{item.productName}</p>
                        <p className="text-xs text-[var(--muted-foreground)]">
                          SKU: {item.variantId ?? item.productId}
                        </p>
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
                    </div>

                    <p className="md:text-center text-sm text-[var(--muted-foreground)]">
                      {formatCurrency(item.unitPrice)}
                    </p>

                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--border)]"
                        onClick={() => handleQuantityChange(item, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item, Number(e.target.value))}
                        className="w-16 rounded-lg border border-[var(--border)] bg-transparent px-2 py-1 text-center"
                      />
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] hover:bg-[var(--border)]"
                        onClick={() => handleQuantityChange(item, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <p className="md:text-center text-base font-semibold">
                      {formatCurrency(item.subtotal)}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="text-sm text-[var(--error)] hover:text-[var(--error)]/80 transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-3 shadow-2xl lg:max-w-md">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Tạm tính</span>
                  <span>{formatCurrency(selectedSubtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">Phí vận chuyển</span>
                  <span>{selectedShipping === 0 ? 'Miễn phí' : formatCurrency(selectedShipping)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold border-t border-[var(--border)] pt-3">
                  <span>Tổng cộng</span>
                  <span>{formatCurrency(selectedTotal)}</span>
                </div>
                  <button
                    type="button"
                  onClick={() => navigate('/checkout', { state: { selectedItemIds: selectedItems.map((i) => i.id) } })}
                  disabled={!hasSelection || selectedItems.length === 0}
                  className="w-full rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-semibold tracking-wide hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                  {selectedItems.length === 0 && selectedItemIds.length > 0
                    ? 'Vui lòng bỏ chọn sản phẩm hết hàng'
                    : `Thanh toán (${selectedItems.length})`}
                  </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;

