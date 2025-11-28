import type { AxiosError } from 'axios';
import { axiosClient } from './axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    fallback
  );
}

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<AuthResponse>('/auth/register', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.'));
    }
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<AuthResponse>('/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.'));
    }
  },

  async loginAdmin(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await axiosClient.post<AuthResponse>('/admin/auth/login', data);
      return response.data;
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Đã xảy ra lỗi khi đăng nhập admin. Vui lòng thử lại.'));
    }
  },
};


