export interface OrderItem {
  id: number;
  productName: string;
  productSlug: string;
  productImage?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  shippingMethod?: string;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  subtotal: number;
  shippingFee: number;
  discount: number;
  voucherDiscount?: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  paymentUrl?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  customerEmail?: string | null;
  customerPhone?: string | null;
  customerGroup?: string | null;
  transactionId?: string | null;
  history?: Array<{
    field: string;
    oldValue?: string | null;
    newValue?: string | null;
    actor?: string | null;
    note?: string | null;
    createdAt: string;
  }>;
}

export interface RefundResponse {
  id: number;
  orderNumber: string;
  amount: number;
  refundMethod: 'ORIGINAL' | 'MANUAL_CASH';
  reason?: string | null;
  refundedItemIds?: number[] | null;
  refundedBy?: string | null;
  createdAt: string;
}

// Re-export để giữ tương thích ngược cho các import cũ
export type { CheckoutRequest } from './checkout';

