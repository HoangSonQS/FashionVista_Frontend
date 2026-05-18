import { axiosClient } from './axiosClient';
import type {
  CategorySummary,
  ProductDetail,
  ProductListItem,
  ProductListResponse,
  SearchSuggestion,
} from '../types/product';
import { cachedRequest } from './requestCache';

const HOME_DATA_CACHE_TTL_MS = 60_000;

export interface ProductQueryParams {
  category?: string;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export const productService = {
  async getProducts(params: ProductQueryParams): Promise<ProductListResponse> {
    const { pageSize, ...rest } = params;
    const response = await axiosClient.get<ProductListResponse>('/products', {
      params: {
        ...rest,
        size: pageSize, // backend expects `size` for page size
      },
    });
    return response.data;
  },

  async getProduct(slug: string): Promise<ProductDetail> {
    const response = await axiosClient.get<ProductDetail>(`/products/${slug}`);
    return response.data;
  },

  async getCategories(): Promise<CategorySummary[]> {
    return cachedRequest('categories', async () => {
      const response = await axiosClient.get<CategorySummary[]>('/categories');
      return response.data;
    }, HOME_DATA_CACHE_TTL_MS);
  },

  async getSuggestions(keyword: string): Promise<SearchSuggestion[]> {
    if (!keyword) return [];
    const response = await axiosClient.get<SearchSuggestion[]>('/search/suggestions', {
      params: { keyword },
    });
    return response.data;
  },

  async getFeaturedProducts(limit: number = 8): Promise<ProductListItem[]> {
    return cachedRequest(`products:featured:${limit}`, async () => {
      const response = await axiosClient.get<ProductListItem[]>('/products/featured', {
        params: { limit },
      });
      return response.data;
    }, HOME_DATA_CACHE_TTL_MS);
  },

  async getNewArrivals(limit: number = 8): Promise<ProductListItem[]> {
    return cachedRequest(`products:new-arrivals:${limit}`, async () => {
      const response = await axiosClient.get<ProductListItem[]>('/products/new-arrivals', {
        params: { limit },
      });
      return response.data;
    }, HOME_DATA_CACHE_TTL_MS);
  },

  async getSaleProducts(limit: number = 24): Promise<ProductListItem[]> {
    const response = await axiosClient.get<ProductListItem[]>('/products/sale', {
      params: { limit },
    });
    return response.data;
  },
};
