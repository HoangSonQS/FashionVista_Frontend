import { axiosClient } from './axiosClient';

export type VoucherType = 'PERCENT' | 'FIXED_AMOUNT' | 'FREESHIP';

export interface AdminVoucherResponse {
  id: number;
  code: string;
  type: VoucherType;
  value?: number;
  freeShipping: boolean;
  minOrderTotal?: number;
  usageLimit?: number;
  usedCount: number;
  active: boolean;
  startsAt?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VoucherCreateRequest {
  code: string;
  type: VoucherType;
  value?: number;
  freeShipping?: boolean;
  minOrderTotal?: number;
  usageLimit?: number;
  active?: boolean;
  startsAt?: string;
  expiresAt?: string;
}

export interface VoucherUpdateRequest {
  code?: string;
  type?: VoucherType;
  value?: number;
  freeShipping?: boolean;
  minOrderTotal?: number;
  usageLimit?: number;
  active?: boolean;
  startsAt?: string;
  expiresAt?: string;
}

export interface AdminVoucherListResponse {
  content: AdminVoucherResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminVoucherService = {
  async getAllVouchers(params?: {
    search?: string;
    active?: boolean;
    page?: number;
    size?: number;
  }): Promise<AdminVoucherListResponse> {
    const response = await axiosClient.get<AdminVoucherListResponse>('/admin/vouchers', { params });
    return response.data;
  },

  async getVoucherById(id: number): Promise<AdminVoucherResponse> {
    const response = await axiosClient.get<AdminVoucherResponse>(`/admin/vouchers/${id}`);
    return response.data;
  },

  async createVoucher(request: VoucherCreateRequest): Promise<AdminVoucherResponse> {
    const response = await axiosClient.post<AdminVoucherResponse>('/admin/vouchers', request);
    return response.data;
  },

  async updateVoucher(id: number, request: VoucherUpdateRequest): Promise<AdminVoucherResponse> {
    const response = await axiosClient.patch<AdminVoucherResponse>(`/admin/vouchers/${id}`, request);
    return response.data;
  },

  async deleteVoucher(id: number): Promise<void> {
    await axiosClient.delete(`/admin/vouchers/${id}`);
  },
};

