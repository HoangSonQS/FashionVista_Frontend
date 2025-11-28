import { axiosClient } from './axiosClient';
import type { AdminOverview } from '../types/admin';

export const adminService = {
  async getOverview(): Promise<AdminOverview> {
    const response = await axiosClient.get<AdminOverview>('/admin/overview');
    return response.data;
  },
};


