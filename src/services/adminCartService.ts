import { axiosClient } from './axiosClient';
import type { AdminCartListResponse, AdminCartListPage } from '../types/adminCart';
import type { CartResponse } from '../types/cart';

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

    getCartDetail: async (id: number) => {
        const response = await axiosClient.get<CartResponse>(`/admin/carts/${id}`);
        return response.data;
    },

    sendReminder: async (id: number) => {
        await axiosClient.post(`/admin/carts/${id}/remind`);
    },
};
