import { axiosClient } from './axiosClient';
import type { OrderResponse } from '../types/order';

export interface AdminOrderListResponse {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  createdAt: string;
  itemCount: number;
}

export interface AdminOrderListParams {
  search?: string;
  status?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface AdminOrderListPage {
  content: AdminOrderListResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UpdateOrderStatusRequest {
  status: string;
  paymentStatus?: string;
  notes?: string;
  notifyCustomer?: boolean;
}

export interface UpdateTrackingNumberRequest {
  trackingNumber: string;
  notifyCustomer?: boolean;
}

export const adminOrderService = {
  async getAllOrders(params: AdminOrderListParams): Promise<AdminOrderListPage> {
    const response = await axiosClient.get<AdminOrderListPage>('/admin/orders', { params });
    return response.data;
  },

  async getOrderById(orderId: number): Promise<OrderResponse> {
    const response = await axiosClient.get<OrderResponse>(`/admin/orders/${orderId}`);
    return response.data;
  },

  async updateOrderStatus(orderId: number, request: UpdateOrderStatusRequest): Promise<OrderResponse> {
    const response = await axiosClient.patch<OrderResponse>(`/admin/orders/${orderId}/status`, request);
    return response.data;
  },

  async updateTrackingNumber(orderId: number, request: UpdateTrackingNumberRequest): Promise<OrderResponse> {
    const response = await axiosClient.patch<OrderResponse>(`/admin/orders/${orderId}/tracking`, request);
    return response.data;
  },
};

