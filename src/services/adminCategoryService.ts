import { axiosClient } from './axiosClient';

export interface AdminCategoryResponse {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  parentName?: string;
  order: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryCreateRequest {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: number;
  order?: number;
  isActive?: boolean;
}

export interface CategoryUpdateRequest {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  parentId?: number | null;
  order?: number;
  isActive?: boolean;
}

export interface AdminCategoryListResponse {
  content: AdminCategoryResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export const adminCategoryService = {
  async getAllCategories(params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Promise<AdminCategoryListResponse> {
    const response = await axiosClient.get<AdminCategoryListResponse>('/admin/categories', { params });
    return response.data;
  },

  async getCategoryById(id: number): Promise<AdminCategoryResponse> {
    const response = await axiosClient.get<AdminCategoryResponse>(`/admin/categories/${id}`);
    return response.data;
  },

  async uploadImage(imageFile: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', imageFile);
    const response = await axiosClient.post<{ url: string }>('/admin/categories/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.url;
  },

  async createCategory(request: CategoryCreateRequest, imageFile?: File): Promise<AdminCategoryResponse> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await axiosClient.post<AdminCategoryResponse>('/admin/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch((error) => {
      // Re-throw để component có thể handle
      throw error;
    });
    return response.data;
  },

  async updateCategory(id: number, request: CategoryUpdateRequest, imageFile?: File): Promise<AdminCategoryResponse> {
    const formData = new FormData();
    formData.append('category', new Blob([JSON.stringify(request)], { type: 'application/json' }));
    if (imageFile) {
      formData.append('image', imageFile);
    }
    const response = await axiosClient.patch<AdminCategoryResponse>(`/admin/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }).catch((error) => {
      // Re-throw để component có thể handle
      throw error;
    });
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await axiosClient.delete(`/admin/categories/${id}`);
  },
};

