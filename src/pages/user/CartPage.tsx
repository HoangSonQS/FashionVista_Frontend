import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../../services/cartService';
import type { CartItem, CartResponse } from '../../types/cart';
import { emitCartUpdated } from '../../utils/cartEvents';

const CartPage = () => {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const navigate = useNavigate();
  const selectedItems = useMemo(
    () => (cart ? cart.items.filter((item) => selectedItemIds.includes(item.id)) : []),
    [cart, selectedItemIds]
  );
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedShipping = selectedItems.length === 0 ? 0 : cart?.shippingFee ?? 0;
  const selectedTotal = selectedSubtotal + selectedShipping;
  const allSelected = cart ? selectedItemIds.length === cart.items.length && cart.items.length > 0 : false;
  const hasSelection = selectedItems.length > 0;

  const toggleSelectAll = () => {
    if (!cart) return;
    if (allSelected) {
      setSelectedItemIds([]);
    } else {
      setSelectedItemIds(cart.items.map((item) => item.id));
    }
  };

  const toggleItemSelection = (itemId: number) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await cartService.getCart();
      setCart(response);
      setSelectedItemIds([]);
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
            className="mx-auto rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 font-medium hover:bg-[#0064c0] transition-colors"
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
                  className="h-4 w-4 accent-[var(--primary)]"
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
                        className="h-4 w-4 accent-[var(--primary)]"
                        checked={selectedItemIds.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
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
                      className="text-sm text-red-300 hover:text-red-100 transition-colors"
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
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    disabled={!hasSelection}
                    className="w-full rounded-full bg-[#1f7ae0] text-white py-3 font-semibold tracking-wide hover:bg-[#2a88f0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mua ngay ({selectedItems.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/checkout')}
                    disabled={!hasSelection}
                    className="w-full rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-semibold tracking-wide hover:bg-[#0064c0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Mua hàng ({selectedItems.length})
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CartPage;

