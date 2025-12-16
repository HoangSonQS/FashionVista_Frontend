import { axiosClient } from './axiosClient';

export const shippingService = {
  async getFee(addressId: number, service: string) {
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
  },
};

