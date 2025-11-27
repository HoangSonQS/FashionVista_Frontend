import { axiosClient } from './axiosClient';
import type { CartResponse } from '../types/cart';

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await axiosClient.get<CartResponse>('/cart');
    return response.data;
  },

  async addItem(variantSku: string, quantity = 1): Promise<CartResponse> {
    const response = await axiosClient.post<CartResponse>('/cart/items', { variantSku, quantity });
    return response.data;
  },

  async updateItem(itemId: number, quantity: number): Promise<CartResponse> {
    const response = await axiosClient.put<CartResponse>(`/cart/items/${itemId}`, { quantity });
    return response.data;
  },

  async removeItem(itemId: number): Promise<CartResponse> {
    const response = await axiosClient.delete<CartResponse>(`/cart/items/${itemId}`);
    return response.data;
  },
};

