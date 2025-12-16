import { axiosClient } from './axiosClient';
import type {
  PageResponse,
  ReturnRequestResponse,
  UpdateReturnStatusPayload,
  ReturnStatus,
} from '../types/return';

export const adminReturnService = {
  async list(params?: { status?: ReturnStatus; page?: number; size?: number }): Promise<PageResponse<ReturnRequestResponse>> {
    const response = await axiosClient.get<PageResponse<ReturnRequestResponse>>('/admin/returns', {
      params,
    });
    return response.data;
  },

  async getByOrder(orderId: number): Promise<ReturnRequestResponse> {
    const response = await axiosClient.get<ReturnRequestResponse>(`/admin/returns/by-order/${orderId}`);
    return response.data;
  },

  async updateStatus(id: number, payload: UpdateReturnStatusPayload): Promise<ReturnRequestResponse> {
    const response = await axiosClient.patch<ReturnRequestResponse>(`/admin/returns/${id}`, payload);
    return response.data;
  },
};


