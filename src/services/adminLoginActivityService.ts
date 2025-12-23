import { axiosClient } from './axiosClient';

export interface AdminLoginActivityResponse {
  id: number;
  userId: number;
  userEmail: string;
  userFullName: string;
  ipAddress: string;
  userAgent: string;
  deviceType: string;
  location: string;
  loginSuccess: boolean;
  failureReason: string | null;
  createdAt: string;
  suspicious: boolean;
}

export interface AdminLoginActivityStatsResponse {
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  suspiciousActivities: number;
  uniqueUsers: number;
  uniqueIPs: number;
}

interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

export const adminLoginActivityService = {
  async getHistory(params?: {
    userId?: number;
    loginSuccess?: boolean;
    ipAddress?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<PageResponse<AdminLoginActivityResponse>> {
    const response = await axiosClient.get<PageResponse<AdminLoginActivityResponse>>(
      '/admin/login-activities',
      { params }
    );
    return response.data;
  },

  async getStats(params?: { startDate?: string; endDate?: string }): Promise<AdminLoginActivityStatsResponse> {
    const response = await axiosClient.get<AdminLoginActivityStatsResponse>('/admin/login-activities/stats', {
      params,
    });
    return response.data;
  },
};

