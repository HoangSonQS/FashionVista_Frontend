import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { cartService } from '../services/cartService';
import type { CartResponse } from '../types/cart';
import { emitCartUpdated } from '../utils/cartEvents';

interface CartDrawerContextValue {
  open: boolean;
  cart: CartResponse | null;
  loading: boolean;
  openDrawer: (options?: { cart?: CartResponse }) => void;
  closeDrawer: () => void;
  updateCartState: (cart: CartResponse | null) => void;
  refreshCart: () => Promise<void>;
}

const CartDrawerContext = createContext<CartDrawerContextValue | undefined>(undefined);

export const useCartDrawer = () => {
  const context = useContext(CartDrawerContext);
  if (!context) {
    throw new Error('useCartDrawer must be used within CartDrawerProvider');
  }
  return context;
};

export const CartDrawerProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
      emitCartUpdated(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const openDrawer = useCallback(
    (options?: { cart?: CartResponse }) => {
      if (options?.cart) {
        setCart(options.cart);
        emitCartUpdated(options.cart);
      } else {
        void refreshCart();
      }
      setOpen(true);
    },
    [refreshCart]
  );

  const closeDrawer = useCallback(() => setOpen(false), []);

  const value = useMemo<CartDrawerContextValue>(
    () => ({
      cart,
      loading,
      open,
      openDrawer,
      closeDrawer,
      updateCartState: setCart,
      refreshCart,
    }),
    [cart, loading, open, openDrawer, closeDrawer, refreshCart]
  );

  return (
    <CartDrawerContext.Provider value={value}>
      {children}
    </CartDrawerContext.Provider>
  );
};


