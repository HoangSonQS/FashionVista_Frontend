import { axiosClient } from './axiosClient';

export interface AdminLoyaltyPointHistoryResponse {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  points: number;
  balanceAfter: number;
  transactionType: string; // EARNED, SPENT, MANUAL_ADJUST, EXPIRED
  source: string;
  description: string;
  createdAt: string;
  createdByName: string | null;
}

export interface AdminLoyaltyPointStatsResponse {
  totalUsers: number;
  totalPoints: number;
  pointsByTier: Record<string, number>; // BRONZE, SILVER, GOLD, PLATINUM
  usersByTier: Record<string, number>;
}

export interface AdjustLoyaltyPointsRequest {
  userId: number;
  points: number; // Có thể âm để trừ điểm
  description?: string;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const adminLoyaltyPointService = {
  async getHistory(params?: {
    userId?: number;
    transactionType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<AdminLoyaltyPointHistoryResponse>> {
    const response = await axiosClient.get<PageResponse<AdminLoyaltyPointHistoryResponse>>(
      '/admin/loyalty-points/history',
      { params }
    );
    return response.data;
  },

  async adjustPoints(request: AdjustLoyaltyPointsRequest): Promise<AdminLoyaltyPointHistoryResponse> {
    const response = await axiosClient.post<AdminLoyaltyPointHistoryResponse>(
      '/admin/loyalty-points/adjust',
      request
    );
    return response.data;
  },

  async getStats(): Promise<AdminLoyaltyPointStatsResponse> {
    const response = await axiosClient.get<AdminLoyaltyPointStatsResponse>('/admin/loyalty-points/stats');
    return response.data;
  },
};

