import { axiosClient } from './axiosClient';
import type { CreateReviewRequest, ReviewSummary } from '../types/review';
import { cachedRequest, clearCachedRequest, clearCachedRequestsByPrefix } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export const reviewService = {
  async createReview(payload: CreateReviewRequest): Promise<ReviewSummary> {
    const response = await axiosClient.post<ReviewSummary>('/reviews', payload);
    clearCachedRequestsByPrefix('reviews:product');
    clearCachedRequest('reviews:me');
    return response.data;
  },

  async getProductReviews(productId: number): Promise<ReviewSummary[]> {
    return cachedRequest(`reviews:product:${productId}`, async () => {
      const response = await axiosClient.get<ReviewSummary[]>(`/reviews/product/${productId}`);
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },

  async getMyReviews(): Promise<ReviewSummary[]> {
    return cachedRequest('reviews:me', async () => {
      const response = await axiosClient.get<ReviewSummary[]>('/me/reviews');
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },
};


