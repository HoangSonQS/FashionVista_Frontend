import { axiosClient } from './axiosClient';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';

export interface AdminPaymentResponse {
  id: number;
  orderId: number;
  orderNumber: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  amount: number;
  refundAmount: number;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminPaymentListResponse {
  content: AdminPaymentResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminPaymentService = {
  async getAllPayments(params?: {
    search?: string;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    page?: number;
    size?: number;
  }): Promise<AdminPaymentListResponse> {
    const response = await axiosClient.get<AdminPaymentListResponse>('/admin/payments', { params });
    return response.data;
  },

  async getPaymentById(id: number): Promise<AdminPaymentResponse> {
    const response = await axiosClient.get<AdminPaymentResponse>(`/admin/payments/${id}`);
    return response.data;
  },

  async updatePaymentStatus(id: number, paymentStatus: PaymentStatus): Promise<AdminPaymentResponse> {
    const response = await axiosClient.patch<AdminPaymentResponse>(`/admin/payments/${id}/status`, {
      paymentStatus,
    });
    return response.data;
  },

  async syncCodDeliveredPayments(): Promise<{ message: string; updatedCount: number }> {
    const response = await axiosClient.post<{ message: string; updatedCount: number }>(
      '/admin/payments/sync-cod-delivered'
    );
    return response.data;
  },
};

