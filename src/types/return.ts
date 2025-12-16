export type ReturnStatus = 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'REFUND_PENDING' | 'REFUNDED';

export type RefundMethod = 'ORIGINAL' | 'MANUAL_CASH' | null;

export interface ReturnItemResponse {
  orderItemId: number;
  productName: string;
  productImage?: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface ReturnRequestResponse {
  id: number;
  orderId: number;
  orderNumber: string;
  status: ReturnStatus;
  reason: string;
  note?: string | null;
  evidenceUrls?: string[] | null;
  refundAmount?: number | null;
  refundMethod?: RefundMethod;
  adminNote?: string | null;
  items: ReturnItemResponse[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  refundedAt?: string | null;
}

export interface CreateReturnRequestPayload {
  orderId: number;
  items: { orderItemId: number; quantity: number }[];
  reason: string;
  note?: string;
  evidenceUrls?: string[];
}

export interface UpdateReturnStatusPayload {
  status: ReturnStatus;
  adminNote?: string;
  refundMethod?: RefundMethod;
  refundAmount?: number;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}


