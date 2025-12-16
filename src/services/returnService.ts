import { axiosClient } from './axiosClient';
import type {
  CreateReturnRequestPayload,
  PageResponse,
  ReturnRequestResponse,
} from '../types/return';

export const returnService = {
  async create(payload: CreateReturnRequestPayload): Promise<ReturnRequestResponse> {
    const response = await axiosClient.post<ReturnRequestResponse>('/returns', payload);
    return response.data;
  },

  async listMine(params?: { page?: number; size?: number }): Promise<PageResponse<ReturnRequestResponse>> {
    const response = await axiosClient.get<PageResponse<ReturnRequestResponse>>('/returns', {
      params,
    });
    return response.data;
  },
};


