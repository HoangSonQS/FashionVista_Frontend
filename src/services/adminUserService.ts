import { axiosClient } from './axiosClient';

export interface AdminUserListResponse {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  active: boolean;
  createdAt: string;
  orderCount: number;
}

export interface AdminUserListParams {
  search?: string;
  role?: string;
  active?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'ASC' | 'DESC';
}

export interface AdminUserListPage {
  content: AdminUserListResponse[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface UpdateUserStatusRequest {
  active: boolean;
}

export interface UpdateUserRoleRequest {
  role: string;
}

export const adminUserService = {
  async getAllUsers(params: AdminUserListParams): Promise<AdminUserListPage> {
    const response = await axiosClient.get<AdminUserListPage>('/admin/users', { params });
    return response.data;
  },

  async getUserById(userId: number): Promise<AdminUserListResponse> {
    const response = await axiosClient.get<AdminUserListResponse>(`/admin/users/${userId}`);
    return response.data;
  },

  async updateUserStatus(userId: number, request: UpdateUserStatusRequest): Promise<AdminUserListResponse> {
    const response = await axiosClient.patch<AdminUserListResponse>(`/admin/users/${userId}/status`, request);
    return response.data;
  },

  async updateUserRole(userId: number, request: UpdateUserRoleRequest): Promise<AdminUserListResponse> {
    const response = await axiosClient.patch<AdminUserListResponse>(`/admin/users/${userId}/role`, request);
    return response.data;
  },

  async getUserDetail(userId: number): Promise<any> {
    const response = await axiosClient.get<any>(`/admin/users/${userId}/detail`);
    return response.data;
  },

  async addLoyaltyPoints(userId: number, request: { points: number; transactionType: string; source?: string; description?: string }): Promise<AdminUserListResponse> {
    const response = await axiosClient.post<AdminUserListResponse>(`/admin/users/${userId}/loyalty-points`, request);
    return response.data;
  },

  async resetPassword(userId: number, request: { sendEmail?: boolean }): Promise<{ temporaryPassword: string; emailSent: boolean }> {
    const response = await axiosClient.post<{ temporaryPassword: string; emailSent: boolean }>(`/admin/users/${userId}/reset-password`, request);
    return response.data;
  },

  async exportUsers(params: AdminUserListParams): Promise<Blob> {
    const response = await axiosClient.get<Blob>(`/admin/users/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

