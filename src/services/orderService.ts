import { axiosClient } from './axiosClient';
import type { CheckoutRequest, OrderResponse } from '../types/order';

export const orderService = {
  async checkout(payload: CheckoutRequest): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>('/orders/checkout', payload);
    return response.data;
  },

  async getOrders(): Promise<OrderResponse[]> {
    const response = await axiosClient.get<OrderResponse[]>('/orders');
    return response.data;
  },

  async getOrder(orderNumber: string): Promise<OrderResponse> {
    const response = await axiosClient.get<OrderResponse>(`/orders/${orderNumber}`);
    return response.data;
  },

  async cancel(orderNumber: string): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>(`/orders/${orderNumber}/cancel`);
    return response.data;
  },
};

