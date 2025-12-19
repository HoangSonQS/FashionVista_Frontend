import { axiosClient } from './axiosClient';
import type { ProductDetail, ProductListResponse, ProductCreateRequest, ProductImportResult } from '../types/product';

export interface AdminProductQuery {
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  visible?: boolean;
  page?: number;
  size?: number;
}

export const adminProductService = {
  async getProducts(params: AdminProductQuery): Promise<ProductListResponse> {
    const response = await axiosClient.get<ProductListResponse>('/admin/products', {
      params,
    });
    return response.data;
  },

  async getProduct(id: number): Promise<ProductDetail> {
    const response = await axiosClient.get<ProductDetail>(`/admin/products/${id}`);
    return response.data;
  },

  async updateProduct(id: number, payload: ProductCreateRequest, files: File[]): Promise<ProductDetail> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    files.forEach((file) => formData.append('images', file));

    const response = await axiosClient.put<ProductDetail>(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateStatus(id: number, data: { status?: string; featured?: boolean }): Promise<void> {
    await axiosClient.patch(`/admin/products/${id}/status`, data);
  },

  async updateVisibility(id: number, visible: boolean): Promise<void> {
    await axiosClient.patch(`/admin/products/${id}/visibility`, { visible });
  },

  async updateVisibilityBulk(productIds: number[], visible: boolean): Promise<void> {
    await axiosClient.patch(`/admin/products/visibility/bulk`, { productIds, visible });
  },

  async downloadTemplate(): Promise<Blob> {
    const response = await axiosClient.get('/admin/products/export-template', {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportProducts(params: AdminProductQuery & { visible?: boolean }): Promise<Blob> {
    const response = await axiosClient.get('/admin/products/export', {
      params,
      responseType: 'blob',
    });
    return response.data;
  },

  async importProducts(file: File): Promise<ProductImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<ProductImportResult>('/admin/products/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async deleteProduct(id: number): Promise<void> {
    await axiosClient.delete(`/admin/products/${id}`);
  },
};



