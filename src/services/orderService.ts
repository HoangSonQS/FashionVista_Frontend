import { axiosClient } from './axiosClient';
import type { CheckoutRequest, OrderResponse } from '../types/order';
import { cachedRequest, clearCachedRequest, clearCachedRequestsByPrefix, setCachedRequestValue } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export const orderService = {
  async checkout(payload: CheckoutRequest): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>('/orders/checkout', payload);
    clearCachedRequest('orders');
    return response.data;
  },

  async getOrders(): Promise<OrderResponse[]> {
    return cachedRequest('orders', async () => {
      const response = await axiosClient.get<OrderResponse[]>('/orders');
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },

  async getOrder(orderNumber: string): Promise<OrderResponse> {
    return cachedRequest(`orders:${orderNumber}`, async () => {
      const response = await axiosClient.get<OrderResponse>(`/orders/${orderNumber}`);
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },

  async cancel(orderNumber: string): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>(`/orders/${orderNumber}/cancel`);
    setCachedRequestValue(`orders:${orderNumber}`, response.data, PAGE_CACHE_TTL_MS);
    clearCachedRequest('orders');
    return response.data;
  },

  async repay(orderNumber: string): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>(`/orders/${orderNumber}/repay`);
    clearCachedRequestsByPrefix('orders');
    return response.data;
  },

  async changePaymentMethod(orderNumber: string, method: string): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>(`/orders/${orderNumber}/change-payment-method?method=${method}`);
    setCachedRequestValue(`orders:${orderNumber}`, response.data, PAGE_CACHE_TTL_MS);
    clearCachedRequest('orders');
    return response.data;
  },
};

