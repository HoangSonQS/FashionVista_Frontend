import { axiosClient } from './axiosClient';
import type { CollectionDetail, CollectionSummary } from '../types/collection';
import type { ProductListItem } from '../types/product';

export interface AdminCollectionQuery {
  keyword?: string;
  status?: string;
  visible?: boolean;
  page?: number;
  size?: number;
}

export interface AdminPagedCollectionResponse {
  content: CollectionSummary[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface CollectionPayload {
  name: string;
  slug: string;
  description?: string;
  longDescriptionHtml?: string;
  heroImageUrl?: string;
  status?: 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'ARCHIVED';
  visible?: boolean;
  startAt?: string | null;
  endAt?: string | null;
  seoTitle?: string;
  seoDescription?: string;
}

export const adminCollectionService = {
  async search(params: AdminCollectionQuery): Promise<AdminPagedCollectionResponse> {
    const response = await axiosClient.get<AdminPagedCollectionResponse>('/admin/collections', {
      params,
    });
    return response.data;
  },

  async getDetail(id: number): Promise<CollectionDetail> {
    const response = await axiosClient.get<CollectionDetail>(`/admin/collections/${id}`);
    return response.data;
  },

  async create(payload: CollectionPayload): Promise<CollectionDetail> {
    const response = await axiosClient.post<CollectionDetail>('/admin/collections', payload);
    return response.data;
  },

  async update(id: number, payload: CollectionPayload): Promise<CollectionDetail> {
    const response = await axiosClient.put<CollectionDetail>(`/admin/collections/${id}`, payload);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`/admin/collections/${id}`);
  },

  async updateVisibility(id: number, visible: boolean): Promise<void> {
    await axiosClient.patch(`/admin/collections/${id}/visibility`, { visible });
  },

  async setProducts(id: number, productIds: number[]): Promise<void> {
    await axiosClient.put(`/admin/collections/${id}/products`, { productIds });
  },

  // Collection Products Management
  async getCollectionProducts(
    id: number,
    params: { page?: number; size?: number }
  ): Promise<AdminPagedProductResponse> {
    const response = await axiosClient.get<AdminPagedProductResponse>(
      `/admin/collections/${id}/products`,
      { params }
    );
    return response.data;
  },

  async addProductToCollection(collectionId: number, productId: number): Promise<void> {
    await axiosClient.post(`/admin/collections/${collectionId}/products/${productId}`);
  },

  async removeProductFromCollection(collectionId: number, productId: number): Promise<void> {
    await axiosClient.delete(`/admin/collections/${collectionId}/products/${productId}`);
  },

  async reorderCollectionProducts(collectionId: number, productIds: number[]): Promise<void> {
    await axiosClient.patch(`/admin/collections/${collectionId}/products/reorder`, {
      productIds,
    });
  },

  async bulkAddRemoveProducts(
    collectionId: number,
    addProductIds?: number[],
    removeProductIds?: number[]
  ): Promise<void> {
    await axiosClient.post(`/admin/collections/${collectionId}/products/bulk`, {
      addProductIds: addProductIds || [],
      removeProductIds: removeProductIds || [],
    });
  },
};

export interface AdminPagedProductResponse {
  content: ProductListItem[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}


