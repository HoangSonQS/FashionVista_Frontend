import type { AxiosError } from 'axios';
import { axiosClient } from './axiosClient';
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types/auth';

function extractErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosError<{ message?: string }>;
  
  // Ưu tiên message từ server response
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  
  // Xử lý các HTTP status codes cụ thể
  if (axiosError.response) {
    const status = axiosError.response.status;
    switch (status) {
      case 404:
        return 'Không tìm thấy dịch vụ. Vui lòng kiểm tra lại kết nối hoặc liên hệ quản trị viên.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      case 503:
        return 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.';
      case 401:
        return 'Email/số điện thoại hoặc mật khẩu không đúng.';
      case 403:
        return 'Bạn không có quyền truy cập.';
      case 400:
        return 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      default:
        return `Lỗi kết nối (${status}). Vui lòng thử lại sau.`;
    }
  }
  
  // Xử lý lỗi mạng
  if (axiosError.code === 'ECONNABORTED' || axiosError.message?.includes('timeout')) {
    return 'Hết thời gian chờ. Vui lòng kiểm tra kết nối mạng và thử lại.';
  }
  
  if (axiosError.code === 'ERR_NETWORK' || axiosError.message?.includes('Network Error')) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
  }
  
  // Fallback về message mặc định
  return fallback;
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

  async forgotPassword(email: string): Promise<void> {
    try {
      await axiosClient.post('/auth/forgot-password', { email });
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại.'));
    }
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      await axiosClient.post('/auth/reset-password', { token, newPassword });
    } catch (error) {
      throw new Error(extractErrorMessage(error, 'Không thể đặt lại mật khẩu. Vui lòng thử lại.'));
    }
  },
};


