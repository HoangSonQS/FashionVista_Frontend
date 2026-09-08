import { axiosClient } from './axiosClient';
import { cachedRequest } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export const shippingService = {
  async getFee(addressId: number, service: string) {
    return cachedRequest(`shipping:fee:${addressId}:${service}`, async () => {
      const response = await axiosClient.get<{
        fee: number;
        currency: string;
        provider: string;
        service: string;
        note?: string;
      }>(`/shipping/fee`, {
        params: { addressId, service },
      });
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },
};

