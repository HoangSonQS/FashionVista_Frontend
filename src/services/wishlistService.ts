import { axiosClient } from './axiosClient';
import type { WishlistItem } from '../types/wishlist';
import { cachedRequest, clearCachedRequest } from './requestCache';

const WISHLIST_CACHE_TTL_MS = 2_000;

const getWishlistCacheKey = () => {
  if (typeof window === 'undefined') {
    return 'wishlist:anonymous';
  }
  const raw = window.localStorage.getItem('auth');
  if (!raw) {
    return 'wishlist:anonymous';
  }
  try {
    const token = (JSON.parse(raw) as { token?: string }).token;
    return `wishlist:${token?.slice(-16) ?? 'anonymous'}`;
  } catch {
    return 'wishlist:anonymous';
  }
};

export const wishlistService = {
  async getMyWishlist(): Promise<WishlistItem[]> {
    return cachedRequest(getWishlistCacheKey(), async () => {
      const response = await axiosClient.get<WishlistItem[]>('/wishlist');
      return response.data;
    }, WISHLIST_CACHE_TTL_MS);
  },

  async add(productId: number): Promise<void> {
    await axiosClient.post('/wishlist', null, { params: { productId } });
    clearCachedRequest(getWishlistCacheKey());
  },

  async remove(productId: number): Promise<void> {
    await axiosClient.delete('/wishlist', { params: { productId } });
    clearCachedRequest(getWishlistCacheKey());
  },

  async toggle(productId: number): Promise<boolean> {
    const response = await axiosClient.post('/wishlist/toggle', null, { params: { productId } });
    clearCachedRequest(getWishlistCacheKey());
    // 201 Created = added, 204 No Content = removed
    return response.status === 201;
  },
};


