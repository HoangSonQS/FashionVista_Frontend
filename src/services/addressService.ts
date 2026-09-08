import { axiosClient } from './axiosClient';
import type { AddressOption } from '../types/address';
import { cachedRequest } from './requestCache';

const ADDRESS_CACHE_TTL_MS = 5 * 60_000;

export const addressService = {
  async getProvinces(): Promise<AddressOption[]> {
    return cachedRequest('addresses:provinces', async () => {
      const response = await axiosClient.get<AddressOption[]>('/addresses/provinces');
      return response.data;
    }, ADDRESS_CACHE_TTL_MS);
  },

  async getDistricts(provinceCode: string): Promise<AddressOption[]> {
    if (!provinceCode) return [];
    return cachedRequest(`addresses:districts:${provinceCode}`, async () => {
      const response = await axiosClient.get<AddressOption[]>(`/addresses/provinces/${provinceCode}/districts`);
      return response.data;
    }, ADDRESS_CACHE_TTL_MS);
  },

  async getWards(districtCode: string): Promise<AddressOption[]> {
    if (!districtCode) return [];
    return cachedRequest(`addresses:wards:${districtCode}`, async () => {
      const response = await axiosClient.get<AddressOption[]>(`/addresses/districts/${districtCode}/wards`);
      return response.data;
    }, ADDRESS_CACHE_TTL_MS);
  },
};


