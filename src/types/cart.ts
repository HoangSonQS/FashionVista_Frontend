export interface CartItem {
  id: number;
  productId: number;
  variantId?: number;
  productName: string;
  productSlug: string;
  thumbnailUrl?: string | null;
  size?: string | null;
  color?: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

