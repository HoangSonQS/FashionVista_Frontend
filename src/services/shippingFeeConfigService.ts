import { axiosClient } from './axiosClient';
import type { ShippingFeeConfig, ShippingFeeConfigUpdateRequest } from '../types/shipping';
import type { ShippingMethod } from '../types/checkout';

export const shippingFeeConfigService = {
  getAll: async (): Promise<ShippingFeeConfig[]> => {
    const response = await axiosClient.get<ShippingFeeConfig[]>('/shipping-fee-configs');
    return response.data;
  },

  getByMethod: async (method: ShippingMethod): Promise<ShippingFeeConfig> => {
    const response = await axiosClient.get<ShippingFeeConfig>('/shipping-fee-configs/by-method', {
      params: { method },
    });
    return response.data;
  },

  // Admin APIs
  adminGetAll: async (): Promise<ShippingFeeConfig[]> => {
    const response = await axiosClient.get<ShippingFeeConfig[]>('/admin/shipping-fee-configs');
    return response.data;
  },

  adminUpdate: async (id: number, request: ShippingFeeConfigUpdateRequest): Promise<ShippingFeeConfig> => {
    const response = await axiosClient.put<ShippingFeeConfig>(`/admin/shipping-fee-configs/${id}`, request);
    return response.data;
  },
};

