import { axiosClient } from './axiosClient';
import type { Address, AddressRequest, UserProfile } from '../types/user';

export const userService = {
  async getProfile(): Promise<UserProfile> {
    const response = await axiosClient.get<UserProfile>('/users/me');
    return response.data;
  },

  async updateProfile(payload: { fullName: string; phoneNumber: string }): Promise<UserProfile> {
    const response = await axiosClient.put<UserProfile>('/users/me', payload);
    return response.data;
  },

  async getAddresses(): Promise<Address[]> {
    const response = await axiosClient.get<Address[]>('/users/me/addresses');
    return response.data;
  },

  async createAddress(payload: AddressRequest): Promise<Address> {
    const response = await axiosClient.post<Address>('/users/me/addresses', payload);
    return response.data;
  },

  async updateAddress(id: number, payload: AddressRequest): Promise<Address> {
    const response = await axiosClient.put<Address>(`/users/me/addresses/${id}`, payload);
    return response.data;
  },

  async deleteAddress(id: number): Promise<void> {
    await axiosClient.delete(`/users/me/addresses/${id}`);
  },
};

