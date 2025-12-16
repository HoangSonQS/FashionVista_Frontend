import { axiosClient } from './axiosClient';
import type { CreateReviewRequest, ReviewSummary } from '../types/review';

export const reviewService = {
  async createReview(payload: CreateReviewRequest): Promise<ReviewSummary> {
    const response = await axiosClient.post<ReviewSummary>('/reviews', payload);
    return response.data;
  },

  async getProductReviews(productId: number): Promise<ReviewSummary[]> {
    const response = await axiosClient.get<ReviewSummary[]>(`/reviews/product/${productId}`);
    return response.data;
  },

  async getMyReviews(): Promise<ReviewSummary[]> {
    const response = await axiosClient.get<ReviewSummary[]>('/me/reviews');
    return response.data;
  },
};


