export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface LoginRequest {
  identifier: string; // Có thể là email hoặc số điện thoại
  password: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  role?: string;
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: User;
}


