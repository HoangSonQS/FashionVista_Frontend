import type { ShippingMethod } from './checkout';

export interface ShippingFeeConfig {
  id: number;
  method: ShippingMethod;
  baseFee: number;
  freeShippingThreshold: number;
}

export interface ShippingFeeConfigUpdateRequest {
  baseFee: number;
  freeShippingThreshold: number;
}

