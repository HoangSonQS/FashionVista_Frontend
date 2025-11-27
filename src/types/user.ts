export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  phoneNumber: string;
  role: string;
  active: boolean;
}

export interface Address {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

export interface AddressRequest {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

