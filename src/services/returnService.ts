import { axiosClient } from './axiosClient';
import type {
  CreateReturnRequestPayload,
  PageResponse,
  ReturnRequestResponse,
} from '../types/return';
import { buildRequestCacheKey, cachedRequest, clearCachedRequestsByPrefix } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export const returnService = {
  async create(payload: CreateReturnRequestPayload): Promise<ReturnRequestResponse> {
    const response = await axiosClient.post<ReturnRequestResponse>('/returns', payload);
    clearCachedRequestsByPrefix('returns:mine');
    return response.data;
  },

  async listMine(params?: { page?: number; size?: number }): Promise<PageResponse<ReturnRequestResponse>> {
    return cachedRequest(buildRequestCacheKey('returns:mine', params), async () => {
      const response = await axiosClient.get<PageResponse<ReturnRequestResponse>>('/returns', {
        params,
      });
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },
};


