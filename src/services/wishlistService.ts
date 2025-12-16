import { axiosClient } from './axiosClient';
import type { WishlistItem } from '../types/wishlist';

export const wishlistService = {
  async getMyWishlist(): Promise<WishlistItem[]> {
    const response = await axiosClient.get<WishlistItem[]>('/wishlist');
    return response.data;
  },

  async add(productId: number): Promise<void> {
    await axiosClient.post('/wishlist', null, { params: { productId } });
  },

  async remove(productId: number): Promise<void> {
    await axiosClient.delete('/wishlist', { params: { productId } });
  },

  async toggle(productId: number): Promise<boolean> {
    const response = await axiosClient.post('/wishlist/toggle', null, { params: { productId } });
    // 201 Created = added, 204 No Content = removed
    return response.status === 201;
  },
};


