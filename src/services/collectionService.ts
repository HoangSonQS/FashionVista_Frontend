import { axiosClient } from './axiosClient';
import type { CollectionDetail, CollectionSummary } from '../types/collection';

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
    const response = await axiosClient.get<PagedCollectionResponse>('/collections', { params });
    return response.data;
  },

  async getCollection(slug: string): Promise<CollectionDetail> {
    const response = await axiosClient.get<CollectionDetail>(`/collections/${slug}`);
    return response.data;
  },
};


