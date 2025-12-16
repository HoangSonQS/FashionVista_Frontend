export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO';
export type ShippingMethod = 'STANDARD' | 'FAST' | 'EXPRESS';

// Khớp với CheckoutRequest.java
export interface CheckoutRequest {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  shippingMethod: ShippingMethod;
  voucherCode?: string;
}

// Khớp với AddressResponse.java (và Address trong FE)
export interface AddressResponse {
  id: number;
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  isDefault: boolean;
}

// Khớp với CartResponse.java (dùng lại CartItem từ types/cart)
import type { CartItem } from './cart';

export interface CartSummaryResponse {
  id: number;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

// Khớp với OrderSummaryResponse.java
export interface OrderSummaryResponse {
  id: number;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  itemCount: number;
  createdAt: string;
}

export interface VoucherValidationResponse {
  valid: boolean;
  message: string;
  discount: number;
  subtotal: number;
  finalTotal: number;
}


