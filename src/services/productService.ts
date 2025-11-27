import { axiosClient } from './axiosClient';
import type {
  CategorySummary,
  ProductCreateRequest,
  ProductDetail,
  ProductListResponse,
  SearchSuggestion,
} from '../types/product';

export interface ProductQueryParams {
  category?: string;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  size?: number;
}

export const productService = {
  async getProducts(params: ProductQueryParams): Promise<ProductListResponse> {
    const response = await axiosClient.get<ProductListResponse>('/products', { params });
    return response.data;
  },

  async getProduct(slug: string): Promise<ProductDetail> {
    const response = await axiosClient.get<ProductDetail>(`/products/${slug}`);
    return response.data;
  },

  async getCategories(): Promise<CategorySummary[]> {
    const response = await axiosClient.get<CategorySummary[]>('/categories');
    return response.data;
  },

  async getSuggestions(keyword: string): Promise<SearchSuggestion[]> {
    if (!keyword) return [];
    const response = await axiosClient.get<SearchSuggestion[]>('/search/suggestions', {
      params: { keyword },
    });
    return response.data;
  },

  async createProduct(payload: ProductCreateRequest, files: File[]): Promise<ProductDetail> {
    const formData = new FormData();
    formData.append('product', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    files.forEach((file) => formData.append('images', file));

    const response = await axiosClient.post<ProductDetail>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

