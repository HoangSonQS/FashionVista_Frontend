import { axiosClient } from './axiosClient';
import type { OrderResponse, RefundResponse } from '../types/order';

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

export interface BulkUpdateOrderStatusRequest {
  orderIds: number[];
  status: string;
  paymentStatus?: string;
  notes?: string;
  notifyCustomer?: boolean;
}

export const adminOrderService = {
  async getAllOrders(params: AdminOrderListParams): Promise<AdminOrderListPage> {
    const response = await axiosClient.get<AdminOrderListPage>('/admin/orders', { params });
    return response.data;
  },

  async exportOrders(params: { status?: string }): Promise<Blob> {
    const response = await axiosClient.get('/admin/orders/export', {
      params,
      responseType: 'blob',
    });
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

  async bulkUpdateStatus(request: BulkUpdateOrderStatusRequest): Promise<void> {
    await axiosClient.patch('/admin/orders/bulk-status', request);
  },

  async createPartialRefund(orderId: number, request: {
    amount: number;
    refundMethod: 'ORIGINAL' | 'MANUAL_CASH';
    reason?: string;
    itemIds?: number[];
  }): Promise<RefundResponse> {
    const response = await axiosClient.post<RefundResponse>(`/admin/orders/${orderId}/refund`, request);
    return response.data;
  },

  async getRefundsByOrderId(orderId: number): Promise<RefundResponse[]> {
    const response = await axiosClient.get<RefundResponse[]>(`/admin/orders/${orderId}/refunds`);
    return response.data;
  },

  // Order Items Management
  async updateOrderItem(orderId: number, itemId: number, quantity: number): Promise<OrderResponse> {
    const response = await axiosClient.patch<OrderResponse>(
      `/admin/orders/${orderId}/items/${itemId}`,
      { quantity }
    );
    return response.data;
  },

  async deleteOrderItem(orderId: number, itemId: number): Promise<OrderResponse> {
    const response = await axiosClient.delete<OrderResponse>(
      `/admin/orders/${orderId}/items/${itemId}`
    );
    return response.data;
  },

  async addOrderItem(orderId: number, request: {
    productId: number;
    variantId?: number;
    quantity: number;
  }): Promise<OrderResponse> {
    const response = await axiosClient.post<OrderResponse>(
      `/admin/orders/${orderId}/items`,
      request
    );
    return response.data;
  },
};

