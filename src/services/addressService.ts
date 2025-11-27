import { axiosClient } from './axiosClient';
import type { AddressOption } from '../types/address';

export const addressService = {
  async getProvinces(): Promise<AddressOption[]> {
    const response = await axiosClient.get<AddressOption[]>('/addresses/provinces');
    return response.data;
  },

  async getDistricts(provinceCode: string): Promise<AddressOption[]> {
    if (!provinceCode) return [];
    const response = await axiosClient.get<AddressOption[]>(`/addresses/provinces/${provinceCode}/districts`);
    return response.data;
  },

  async getWards(districtCode: string): Promise<AddressOption[]> {
    if (!districtCode) return [];
    const response = await axiosClient.get<AddressOption[]>(`/addresses/districts/${districtCode}/wards`);
    return response.data;
  },
};


