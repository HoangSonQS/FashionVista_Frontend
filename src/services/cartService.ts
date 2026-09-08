import { axiosClient } from './axiosClient';
import type { CartResponse } from '../types/cart';
import { cachedRequest, setCachedRequestValue } from './requestCache';
import { getAccessToken } from './authSession';

const CART_CACHE_TTL_MS = 2_000;

const getCartCacheKey = () => {
  const token = getAccessToken('user');
  return `cart:${token?.slice(-16) ?? 'anonymous'}`;
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

