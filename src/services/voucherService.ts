import { axiosClient } from './axiosClient';
import type { VoucherValidationResponse } from '../types/checkout';

export const voucherService = {
  async validateVoucher(code: string, subtotal: number) {
    const response = await axiosClient.get<VoucherValidationResponse>('/vouchers/validate', {
      params: {
        code,
        subtotal,
      },
    });
    return response.data;
  },
};


