import { axiosClient } from './axiosClient';
import type { Address, AddressRequest, UserProfile } from '../types/user';
import { cachedRequest, clearCachedRequest, setCachedRequestValue } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export const userService = {
  async getProfile(): Promise<UserProfile> {
    return cachedRequest('users:me', async () => {
      const response = await axiosClient.get<UserProfile>('/users/me');
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },

  async updateProfile(payload: { fullName: string; phoneNumber: string }): Promise<UserProfile> {
    const response = await axiosClient.put<UserProfile>('/users/me', payload);
    setCachedRequestValue('users:me', response.data, PAGE_CACHE_TTL_MS);
    return response.data;
  },

  async getAddresses(): Promise<Address[]> {
    return cachedRequest('users:me:addresses', async () => {
      const response = await axiosClient.get<Address[]>('/users/me/addresses');
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },

  async createAddress(payload: AddressRequest): Promise<Address> {
    const response = await axiosClient.post<Address>('/users/me/addresses', payload);
    clearCachedRequest('users:me:addresses');
    return response.data;
  },

  async updateAddress(id: number, payload: AddressRequest): Promise<Address> {
    const response = await axiosClient.put<Address>(`/users/me/addresses/${id}`, payload);
    clearCachedRequest('users:me:addresses');
    return response.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await axiosClient.delete(`/users/me/addresses/${id}`);
    clearCachedRequest('users:me:addresses');
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<void> {
    await axiosClient.post('/users/me/change-password', payload);
  },
};

