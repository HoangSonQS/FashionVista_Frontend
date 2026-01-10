import { axiosClient } from './axiosClient';
import type { AdminCartListResponse, AdminCartListPage } from '../types/adminCart';

export interface AdminCartParams {
    page?: number;
    size?: number;
    search?: string;
    isAbandoned?: boolean;
}

export const adminCartService = {
    getAdminCarts: async (params: AdminCartParams) => {
        const response = await axiosClient.get<AdminCartListPage>('/admin/carts', {
            params,
        });
        return response.data;
    },

    sendReminder: async (id: number) => {
        await axiosClient.post(`/admin/carts/${id}/remind`);
    },
};
