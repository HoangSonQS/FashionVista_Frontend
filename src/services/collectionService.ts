import { axiosClient } from './axiosClient';
import type { CollectionDetail, CollectionSummary } from '../types/collection';
import { buildRequestCacheKey, cachedRequest } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export interface CollectionQueryParams {
  page?: number;
  size?: number;
}

export interface PagedCollectionResponse {
  content: CollectionSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export const collectionService = {
  async getCollections(params?: CollectionQueryParams): Promise<PagedCollectionResponse> {
    return cachedRequest(buildRequestCacheKey('collections', params), async () => {
      const response = await axiosClient.get<PagedCollectionResponse>('/collections', { params });
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },

  async getCollection(slug: string): Promise<CollectionDetail> {
    return cachedRequest(`collections:${slug}`, async () => {
      const response = await axiosClient.get<CollectionDetail>(`/collections/${slug}`);
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },
};


