import { axiosClient } from './axiosClient';
import type { ShippingFeeConfig, ShippingFeeConfigUpdateRequest } from '../types/shipping';
import type { ShippingMethod } from '../types/checkout';
import { cachedRequest, clearCachedRequestsByPrefix } from './requestCache';

const SHIPPING_CONFIG_CACHE_TTL_MS = 60_000;

export const shippingFeeConfigService = {
  getAll: async (): Promise<ShippingFeeConfig[]> => {
    return cachedRequest('shipping-fee-configs', async () => {
      const response = await axiosClient.get<ShippingFeeConfig[]>('/shipping-fee-configs');
      return response.data;
    }, SHIPPING_CONFIG_CACHE_TTL_MS);
  },

  getByMethod: async (method: ShippingMethod): Promise<ShippingFeeConfig> => {
    return cachedRequest(`shipping-fee-configs:method:${method}`, async () => {
      const response = await axiosClient.get<ShippingFeeConfig>('/shipping-fee-configs/by-method', {
        params: { method },
      });
      return response.data;
    }, SHIPPING_CONFIG_CACHE_TTL_MS);
  },

  // Admin APIs
  adminGetAll: async (): Promise<ShippingFeeConfig[]> => {
    return cachedRequest('admin:shipping-fee-configs', async () => {
      const response = await axiosClient.get<ShippingFeeConfig[]>('/admin/shipping-fee-configs');
      return response.data;
    }, SHIPPING_CONFIG_CACHE_TTL_MS);
  },

  adminUpdate: async (id: number, request: ShippingFeeConfigUpdateRequest): Promise<ShippingFeeConfig> => {
    const response = await axiosClient.put<ShippingFeeConfig>(`/admin/shipping-fee-configs/${id}`, request);
    clearCachedRequestsByPrefix('shipping-fee-configs');
    clearCachedRequestsByPrefix('admin:shipping-fee-configs');
    return response.data;
  },
};
