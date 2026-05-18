import { axiosClient } from './axiosClient';
import type { CartResponse } from '../types/cart';
import { cachedRequest, setCachedRequestValue } from './requestCache';

const CART_CACHE_TTL_MS = 2_000;

const getCartCacheKey = () => {
  if (typeof window === 'undefined') {
    return 'cart:anonymous';
  }
  const raw = window.localStorage.getItem('auth');
  if (!raw) {
    return 'cart:anonymous';
  }
  try {
    const token = (JSON.parse(raw) as { token?: string }).token;
    return `cart:${token?.slice(-16) ?? 'anonymous'}`;
  } catch {
    return 'cart:anonymous';
  }
};

export const cartService = {
  async getCart(): Promise<CartResponse> {
    return cachedRequest(getCartCacheKey(), async () => {
      const response = await axiosClient.get<CartResponse>('/cart');
      return response.data;
    }, CART_CACHE_TTL_MS);
  },

  async addItem(variantSku: string, quantity = 1): Promise<CartResponse> {
    const response = await axiosClient.post<CartResponse>('/cart/items', { variantSku, quantity });
    setCachedRequestValue(getCartCacheKey(), response.data, CART_CACHE_TTL_MS);
    return response.data;
  },

  async updateItem(itemId: number, quantity: number): Promise<CartResponse> {
    const response = await axiosClient.put<CartResponse>(`/cart/items/${itemId}`, { quantity });
    setCachedRequestValue(getCartCacheKey(), response.data, CART_CACHE_TTL_MS);
    return response.data;
  },

  async removeItem(itemId: number): Promise<CartResponse> {
    const response = await axiosClient.delete<CartResponse>(`/cart/items/${itemId}`);
    setCachedRequestValue(getCartCacheKey(), response.data, CART_CACHE_TTL_MS);
    return response.data;
  },
};

