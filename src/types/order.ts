export interface OrderItem {
  id: number;
  productName: string;
  productSlug: string;
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
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

export interface CheckoutRequest {
  fullName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  notes?: string;
  paymentMethod: string;
}

