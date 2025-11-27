import { CART_UPDATED_EVENT } from '../constants/events';
import type { CartResponse } from '../types/cart';

const computeCount = (cart?: CartResponse) => {
  if (!cart) {
    return undefined;
  }
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
};

export const emitCartUpdated = (cart?: CartResponse) => {
  if (typeof window === 'undefined') {
    return;
  }
  const detailCount = computeCount(cart);
  window.dispatchEvent(
    new CustomEvent<{ count?: number }>(CART_UPDATED_EVENT, {
      detail: detailCount !== undefined ? { count: detailCount } : undefined,
    }),
  );
};


