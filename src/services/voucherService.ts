import { axiosClient } from './axiosClient';
import type { VoucherValidationResponse } from '../types/checkout';
import { cachedRequest } from './requestCache';

const PAGE_CACHE_TTL_MS = 500;

export const voucherService = {
  async validateVoucher(code: string, subtotal: number) {
    return cachedRequest(`vouchers:validate:${code}:${subtotal}`, async () => {
      const response = await axiosClient.get<VoucherValidationResponse>('/vouchers/validate', {
        params: {
          code,
          subtotal,
        },
      });
      return response.data;
    }, PAGE_CACHE_TTL_MS);
  },
};


