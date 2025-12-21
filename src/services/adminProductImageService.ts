import { axiosClient } from './axiosClient';

export interface AdminProductImageResponse {
  id: number;
  url: string;
  alt?: string | null;
  order: number;
  primary: boolean;
  cloudinaryPublicId?: string | null;
}

export interface ReorderImagesRequest {
  imageIds: number[];
}

export const adminProductImageService = {
  async getProductImages(productId: number): Promise<AdminProductImageResponse[]> {
    const response = await axiosClient.get<AdminProductImageResponse[]>(`/admin/products/${productId}/images`);
    return response.data;
  },

  async uploadImages(productId: number, imageFiles: File[]): Promise<AdminProductImageResponse[]> {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    const response = await axiosClient.post<AdminProductImageResponse[]>(
      `/admin/products/${productId}/images`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  async setPrimary(productId: number, imageId: number): Promise<AdminProductImageResponse> {
    const response = await axiosClient.patch<AdminProductImageResponse>(
      `/admin/products/${productId}/images/${imageId}/set-primary`
    );
    return response.data;
  },

  async deleteImage(productId: number, imageId: number): Promise<void> {
    await axiosClient.delete(`/admin/products/${productId}/images/${imageId}`);
  },

  async reorderImages(productId: number, imageIds: number[]): Promise<AdminProductImageResponse[]> {
    const response = await axiosClient.patch<AdminProductImageResponse[]>(
      `/admin/products/${productId}/images/reorder`,
      { imageIds }
    );
    return response.data;
  },
};

