import { axiosClient } from './axiosClient';
import type { PageResponse } from '../types/return';

export interface AdminProductVariantResponse {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  size: string;
  color: string;
  sku: string;
  price: number;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProductVariantCreateRequest {
  productId: number;
  size: string;
  color: string;
  sku: string;
  stock: number;
  price?: number;
  active?: boolean;
}

export interface AdminProductVariantUpdateRequest {
  size: string;
  color: string;
  sku: string;
  stock?: number;
  price?: number;
  active?: boolean;
}

export interface AdminProductVariantFilters {
  productId?: number;
  search?: string;
  size?: string; // Filter by variant size
  color?: string;
  active?: boolean;
  minStock?: number;
  page?: number;
  pageSize?: number; // Page size for pagination
}

export const adminProductVariantService = {
  async getAll(filters: AdminProductVariantFilters): Promise<PageResponse<AdminProductVariantResponse>> {
    const params = new URLSearchParams();
    if (filters.productId) params.append('productId', filters.productId.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.size) params.append('variantSize', filters.size); // Filter by variant size - use variantSize to avoid conflict with pageable 'size'
    if (filters.color) params.append('color', filters.color);
    if (filters.active !== undefined) params.append('active', filters.active.toString());
    if (filters.minStock !== undefined) params.append('minStock', filters.minStock.toString());
    if (filters.page !== undefined) params.append('page', filters.page.toString());
    if (filters.pageSize !== undefined) params.append('size', filters.pageSize.toString()); // Page size for pagination

    const response = await axiosClient.get<PageResponse<AdminProductVariantResponse>>(
      `/admin/product-variants?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: number): Promise<AdminProductVariantResponse> {
    const response = await axiosClient.get<AdminProductVariantResponse>(`/admin/product-variants/${id}`);
    return response.data;
  },

  async create(request: AdminProductVariantCreateRequest): Promise<AdminProductVariantResponse> {
    const response = await axiosClient.post<AdminProductVariantResponse>('/admin/product-variants', request);
    return response.data;
  },

  async update(id: number, request: AdminProductVariantUpdateRequest): Promise<AdminProductVariantResponse> {
    const response = await axiosClient.put<AdminProductVariantResponse>(`/admin/product-variants/${id}`, request);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await axiosClient.delete(`/admin/product-variants/${id}`);
  },

  async updateStock(id: number, stock: number): Promise<AdminProductVariantResponse> {
    const response = await axiosClient.patch<AdminProductVariantResponse>(
      `/admin/product-variants/${id}/stock?stock=${stock}`
    );
    return response.data;
  },

  async updatePrice(id: number, price: number): Promise<AdminProductVariantResponse> {
    const response = await axiosClient.patch<AdminProductVariantResponse>(
      `/admin/product-variants/${id}/price?price=${price}`
    );
    return response.data;
  },
};

