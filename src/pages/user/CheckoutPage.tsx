import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { MapPin, Truck, CreditCard, Ticket } from 'lucide-react';
import axios from 'axios';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { cartService } from '../../services/cartService';
import { voucherService } from '../../services/voucherService';
import { shippingService } from '../../services/shippingService';
import type { CartResponse, CartItem } from '../../types/cart';
import type { Address } from '../../types/user';
import type { CheckoutRequest, PaymentMethod, ShippingMethod } from '../../types/checkout';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';

const checkoutSchema = z.object({
  fullName: z.string().min(1, 'Vui lòng nhập họ tên'),
  phone: z.string().min(8, 'Vui lòng nhập số điện thoại hợp lệ'),
  address: z.string().min(1, 'Vui lòng nhập địa chỉ'),
  ward: z.string().min(1, 'Vui lòng nhập phường/xã'),
  district: z.string().min(1, 'Vui lòng nhập quận/huyện'),
  city: z.string().min(1, 'Vui lòng nhập tỉnh/thành phố'),
  notes: z.string().optional(),
  paymentMethod: z.enum(['COD', 'BANK_TRANSFER', 'VNPAY', 'MOMO']),
  shippingMethod: z.enum(['STANDARD', 'FAST', 'EXPRESS']),
  addressId: z.number().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const SHIPPING_BASE_FEE = 30000;
const FREE_SHIPPING_THRESHOLD = 1_000_000;

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { selectedItemIds?: number[] } | undefined;
  // Lưu selectedItemIds vào state để tránh tạo mới mảng [] mỗi lần render
  const [selectedItemIds] = useState<number[]>(() => locationState?.selectedItemIds ?? []);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherApplying, setVoucherApplying] = useState(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<string | null>(null);
  const [voucherMessage, setVoucherMessage] = useState<string | null>(null);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('STANDARD');
  const [dynamicShippingFee, setDynamicShippingFee] = useState<number | null>(null);
  const [, setLoadingShippingFee] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      ward: '',
      district: '',
      city: '',
      paymentMethod: 'COD',
      shippingMethod: 'STANDARD',
    },
  });

  // Load profile & địa chỉ
  useEffect(() => {
    const loadUser = async () => {
      try {
        const [profile, userAddresses] = await Promise.all([userService.getProfile(), userService.getAddresses()]);

        setValue('fullName', profile.fullName ?? '');
        setValue('phone', profile.phoneNumber ?? '');

        const sorted = [...userAddresses].sort((a, b) => {
          if (a.isDefault === b.isDefault) return a.id - b.id;
          return a.isDefault ? -1 : 1;
        });
        setAddresses(sorted);
        if (sorted.length > 0) {
          const defaultAddress = sorted[0];
          setSelectedAddressId(defaultAddress.id);
          setValue('addressId', defaultAddress.id);
          setValue('address', defaultAddress.address);
          setValue('ward', defaultAddress.ward);
          setValue('district', defaultAddress.district);
          setValue('city', defaultAddress.city);
          void fetchDynamicShipping(defaultAddress.id, shippingMethod);
        }
      } catch {
        // ignore profile/address errors
      }
    };

    void loadUser();
  }, [setValue]);

  // Load giỏ hàng (chỉ các item đã chọn)
  useEffect(() => {
    const loadCart = async () => {
      setLoadingCart(true);
      try {
        const data = await cartService.getCart();
        let items: CartItem[] = data.items;
        if (selectedItemIds.length > 0) {
          const selectedSet = new Set(selectedItemIds);
          items = data.items.filter((item) => selectedSet.has(item.id));
        }
        const filteredCart: CartResponse = {
          ...data,
          items,
          subtotal: items.reduce((sum, item) => sum + item.subtotal, 0),
          total: items.reduce((sum, item) => sum + item.subtotal, 0) + data.shippingFee,
        };
        setCart(filteredCart);
      } catch (error) {
        showToast('Không thể tải giỏ hàng. Vui lòng thử lại.', 'error');
      } finally {
        setLoadingCart(false);
      }
    };

    void loadCart();
    // selectedItemIds là nguồn duy nhất cần theo dõi
  }, [selectedItemIds]);

  const items = cart?.items ?? [];
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.subtotal, 0),
    [items],
  );

  const computedShippingFee = useMemo(() => {
    if (dynamicShippingFee !== null) return dynamicShippingFee;
    if (subtotal === 0) return 0;
    if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
    switch (shippingMethod) {
      case 'FAST':
        return SHIPPING_BASE_FEE + 10000;
      case 'EXPRESS':
        return SHIPPING_BASE_FEE + 20000;
      case 'STANDARD':
      default:
        return SHIPPING_BASE_FEE;
    }
  }, [dynamicShippingFee, subtotal, shippingMethod]);

  const total = Math.max(subtotal + computedShippingFee - discount, 0);

  const fetchDynamicShipping = async (addrId: number | null, method: ShippingMethod) => {
    if (!addrId) {
      setDynamicShippingFee(null);
      return;
    }
    setLoadingShippingFee(true);
    try {
      const fee = await shippingService.getFee(addrId, method);
      setDynamicShippingFee(fee.fee ?? null);
    } catch {
      setDynamicShippingFee(null);
    } finally {
      setLoadingShippingFee(false);
    }
  };

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setValue('addressId', address.id);
    setValue('fullName', address.fullName);
    setValue('phone', address.phone);
    setValue('address', address.address);
    setValue('ward', address.ward);
    setValue('district', address.district);
    setValue('city', address.city);
    void fetchDynamicShipping(address.id, shippingMethod);
  };

  const handleApplyVoucher = async () => {
    const trimmed = voucherCode.trim();
    if (!trimmed) {
      showToast('Vui lòng nhập mã voucher.', 'error');
      return;
    }
    if (subtotal <= 0) {
      showToast('Giỏ hàng trống, không thể áp dụng voucher.', 'error');
      return;
    }

    setVoucherApplying(true);
    try {
      const result = await voucherService.validateVoucher(trimmed, subtotal);
      const discountAmount = Math.min(result.discount ?? 0, subtotal);
      setDiscount(discountAmount);
      setAppliedVoucherCode(trimmed);
      const message = result.message || 'Áp dụng voucher thành công.';
      setVoucherMessage(message);
      showToast(message, 'success');
    } catch (error) {
      setDiscount(0);
      setAppliedVoucherCode(null);
      setVoucherMessage(null);
      let message = 'Không thể áp dụng voucher. Vui lòng thử mã khác.';
      if (axios.isAxiosError(error)) {
        message =
          (error.response?.data as { message?: string } | undefined)?.message ??
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      showToast(message, 'error');
    } finally {
      setVoucherApplying(false);
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (addresses.length > 0 && !selectedAddressId) {
      showToast('Vui lòng chọn địa chỉ giao hàng.', 'error');
      return;
    }
    if (items.length === 0) {
      showToast('Giỏ hàng trống, không thể đặt hàng.', 'error');
      return;
    }

    const payload: CheckoutRequest = {
      fullName: values.fullName,
      phone: values.phone,
      address: values.address,
      ward: values.ward,
      district: values.district,
      city: values.city,
      notes: values.notes,
      paymentMethod: values.paymentMethod as PaymentMethod,
      shippingMethod: values.shippingMethod as ShippingMethod,
      voucherCode: appliedVoucherCode ?? undefined,
    };

    setSubmitting(true);
    try {
      const order = await orderService.checkout(payload);

      // Nếu chọn VNPay và backend trả về paymentUrl thì redirect sang VNPay
      if (values.paymentMethod === 'VNPAY' && order.paymentUrl) {
        showToast('Đang chuyển sang cổng thanh toán VNPay...', 'success');
        window.location.href = order.paymentUrl;
        return;
      }

      showToast(
        `Đơn #${order.orderNumber} đã được tạo, xem chi tiết`,
        'success',
        6000,
        {
          label: 'Xem đơn',
          onClick: () => {
            navigate(`/orders/${order.orderNumber}`);
          },
        },
      );
      navigate('/orders', { state: { recentOrderNumber: order.orderNumber } });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Không thể tạo đơn hàng. Vui lòng thử lại.';
      showToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods: Array<{
    value: PaymentMethod;
    label: string;
    description: string;
    disabled?: boolean;
    badge?: string;
  }> = [
    {
      value: 'COD',
      label: 'Thanh toán khi nhận hàng (COD)',
      description: 'Thanh toán tiền mặt cho nhân viên giao hàng.',
    },
    {
      value: 'BANK_TRANSFER',
      label: 'Chuyển khoản ngân hàng',
      description: 'Thanh toán qua chuyển khoản ngân hàng.',
      disabled: true,
      badge: 'Sắp ra mắt',
    },
    {
      value: 'VNPAY',
      label: 'VNPay',
      description: 'Thanh toán online an toàn qua cổng VNPay.',
    },
    {
      value: 'MOMO',
      label: 'Ví MoMo',
      description: 'Thanh toán bằng ví MoMo.',
      disabled: true,
      badge: 'Sắp ra mắt',
    },
  ];

  return (
    <div className="checkout-page min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Thanh toán
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Hoàn tất thông tin giao hàng và phương thức thanh toán.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]"
        >
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Customer & Address */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg space-y-5">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Thông tin giao hàng
                </h2>
              </div>

              {/* Customer basic info */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    {...register('fullName')}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {errors.fullName && (
                    <p className="text-xs text-[var(--error)]">{errors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[var(--muted-foreground)]">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    {...register('phone')}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {errors.phone && (
                    <p className="text-xs text-[var(--error)]">{errors.phone.message}</p>
                  )}
                </div>
              </div>

              {/* Address cards */}
              <div className="space-y-3">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  Địa chỉ giao hàng đã lưu
                </p>
                {addresses.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Bạn chưa có địa chỉ nào. Vui lòng thêm địa chỉ trong trang hồ sơ hoặc nhập trực
                    tiếp bên dưới.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {addresses.map((addr) => {
                      const isActive = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => handleSelectAddress(addr)}
                          className={`w-full rounded-2xl border px-3 py-3 text-left text-xs sm:text-sm transition-colors ${
                            isActive
                              ? 'border-[var(--primary)] bg-[var(--primary-foreground)]/80'
                              : 'border-[var(--border)] hover:border-[var(--primary)]/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">
                              {addr.fullName} • {addr.phone}
                            </p>
                            {addr.isDefault && (
                              <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                                Mặc định
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[11px] sm:text-xs text-[var(--muted-foreground)]">
                            {addr.address}, {addr.ward}, {addr.district}, {addr.city}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Manual address override */}
              <div className="space-y-2 pt-3 border-t border-dashed border-[var(--border)]">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">
                  Hoặc chỉnh sửa địa chỉ giao hàng
                </p>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Địa chỉ (số nhà, tên đường...)"
                    {...register('address')}
                    className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  {errors.address && (
                    <p className="text-xs text-[var(--error)]">{errors.address.message}</p>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Phường/Xã"
                      {...register('ward')}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    {errors.ward && (
                      <p className="text-xs text-[var(--error)]">{errors.ward.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Quận/Huyện"
                      {...register('district')}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    {errors.district && (
                      <p className="text-xs text-[var(--error)]">{errors.district.message}</p>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      placeholder="Tỉnh/Thành phố"
                      {...register('city')}
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                    {errors.city && (
                      <p className="text-xs text-[var(--error)]">{errors.city.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-medium text-[var(--muted-foreground)]">
                  Ghi chú cho đơn hàng
                </label>
                <textarea
                  rows={3}
                  {...register('notes')}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao..."
                />
              </div>
            </section>

            {/* Shipping Method */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Phương thức vận chuyển
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShippingMethod('STANDARD');
                    setValue('shippingMethod', 'STANDARD');
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors cursor-pointer ${
                    shippingMethod === 'STANDARD'
                      ? 'border-[var(--primary)] bg-[var(--primary-foreground)]/80 text-[var(--foreground)] hover:bg-[#E6F0FF] hover:border-[var(--primary)]'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/60 hover:bg-[#E6F0FF]'
                  }`}
                >
                  <div>
                    <p className="font-medium">Tiêu chuẩn (GHN / GHTK)</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">3-5 ngày làm việc</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">
                      {subtotal >= FREE_SHIPPING_THRESHOLD ? 'Miễn phí' : formatCurrency(SHIPPING_BASE_FEE)}
                    </span>
                    <input
                      type="radio"
                      value="STANDARD"
                      checked={shippingMethod === 'STANDARD'}
                      onChange={() => {
                        setShippingMethod('STANDARD');
                        setValue('shippingMethod', 'STANDARD');
                      }}
                      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                    />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShippingMethod('FAST');
                    setValue('shippingMethod', 'FAST');
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors cursor-pointer ${
                    shippingMethod === 'FAST'
                      ? 'border-[var(--primary)] bg-[var(--primary-foreground)]/80 text-[var(--foreground)] hover:bg-[#E6F0FF] hover:border-[var(--primary)]'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/60 hover:bg-[#E6F0FF]'
                  }`}
                >
                  <div>
                    <p className="font-medium">Nhanh</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">2-3 ngày làm việc</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">
                      {subtotal >= FREE_SHIPPING_THRESHOLD
                        ? 'Miễn phí'
                        : formatCurrency(SHIPPING_BASE_FEE + 10000)}
                    </span>
                    <input
                      type="radio"
                      value="FAST"
                      checked={shippingMethod === 'FAST'}
                      onChange={() => {
                        setShippingMethod('FAST');
                        setValue('shippingMethod', 'FAST');
                      }}
                      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                    />
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShippingMethod('EXPRESS');
                    setValue('shippingMethod', 'EXPRESS');
                  }}
                  className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors cursor-pointer ${
                    shippingMethod === 'EXPRESS'
                      ? 'border-[var(--primary)] bg-[var(--primary-foreground)]/80 text-[var(--foreground)] hover:bg-[#E6F0FF] hover:border-[var(--primary)]'
                      : 'border-[var(--border)] hover:border-[var(--primary)]/60 hover:bg-[#E6F0FF]'
                  }`}
                >
                  <div>
                    <p className="font-medium">Express</p>
                    <p className="text-[11px] text-[var(--muted-foreground)]">Trong 24-48h</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold">
                      {subtotal >= FREE_SHIPPING_THRESHOLD
                        ? 'Miễn phí'
                        : formatCurrency(SHIPPING_BASE_FEE + 20000)}
                    </span>
                    <input
                      type="radio"
                      value="EXPRESS"
                      checked={shippingMethod === 'EXPRESS'}
                      onChange={() => {
                        setShippingMethod('EXPRESS');
                        setValue('shippingMethod', 'EXPRESS');
                      }}
                      className="h-4 w-4 cursor-pointer accent-[var(--primary)]"
                    />
                  </div>
                </button>
                <p className="pt-1 text-[11px] text-[var(--muted-foreground)]">
                  Đơn từ {formatCurrency(FREE_SHIPPING_THRESHOLD)} được miễn phí vận chuyển.
                </p>
              </div>
            </section>

            {/* Payment Method */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Phương thức thanh toán
                </h2>
              </div>
              <div className="space-y-3 text-xs sm:text-sm">
                {paymentMethods.map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => {
                      if (method.disabled) return;
                      setValue('paymentMethod', method.value);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border px-3 py-3 text-left transition-colors ${
                      method.disabled
                        ? 'border-[var(--border)] bg-[var(--muted)]/40 text-[var(--muted-foreground)] cursor-not-allowed opacity-60'
                        : 'border-[var(--border)] cursor-pointer hover:border-[var(--primary)]/60 hover:bg-[#E6F0FF]'
                    }`}
                  >
                    <div>
                      <p className="font-medium">{method.label}</p>
                      <p className="text-[11px] text-[var(--muted-foreground)]">
                        {method.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <input
                        type="radio"
                        value={method.value}
                        disabled={method.disabled}
                        {...register('paymentMethod')}
                        className="h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                      />
                      {method.disabled && method.badge && (
                        <span className="rounded-full bg-[var(--muted)] px-2 py-0.5 text-[10px] font-medium text-[var(--muted-foreground)]">
                          {method.badge}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
                {errors.paymentMethod && (
                  <p className="text-xs text-[var(--error)] pt-1">
                    {errors.paymentMethod.message}
                  </p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <aside className="lg:sticky lg:top-24 space-y-4 h-fit">
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Ticket className="h-5 w-5 text-[var(--primary)]" />
                <h2 className="text-base font-semibold uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                  Đơn hàng của bạn
                </h2>
              </div>

              {/* Product list */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {loadingCart ? (
                  <p className="text-xs text-[var(--muted-foreground)]">Đang tải giỏ hàng...</p>
                ) : items.length === 0 ? (
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Không có sản phẩm nào được chọn để thanh toán.
                  </p>
                ) : (
                  items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 text-xs sm:text-sm">
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]">
                        {item.thumbnailUrl ? (
                          <img
                            src={item.thumbnailUrl}
                            alt={item.productName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">
                            No image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-medium sm:text-sm">{item.productName}</p>
                        {(item.size || item.color) && (
                          <p className="text-[11px] text-[var(--muted-foreground)]">
                            {item.size && <>Size: {item.size} </>}
                            {item.color && <>• Màu: {item.color}</>}
                          </p>
                        )}
                      </div>
                      <div className="text-right space-y-0.5">
                        <p className="text-[11px] text-[var(--muted-foreground)]">
                          x{item.quantity}
                        </p>
                        <p className="text-xs font-semibold sm:text-sm">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Voucher */}
              <div className="mt-2 space-y-2">
                <p className="text-xs font-medium text-[var(--muted-foreground)]">Mã giảm giá</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    placeholder="Nhập mã voucher"
                    className="flex-1 rounded-full border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <button
                    type="button"
                    onClick={handleApplyVoucher}
                    disabled={voucherApplying}
                    className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium border transition-colors ${
                      voucherApplying
                        ? 'bg-[var(--muted)] cursor-not-allowed opacity-70 border-[var(--border)] text-[var(--muted-foreground)]'
                        : 'bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] hover:bg-[var(--muted)]'
                    }`}
                  >
                    {voucherApplying ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </div>
                {discount > 0 && (
                  <div className="text-[11px] text-[var(--success)] space-y-1">
                    <p>
                      Đã áp dụng giảm {formatCurrency(discount)}
                      {appliedVoucherCode ? ` (Mã: ${appliedVoucherCode})` : ''}.
                    </p>
                    {voucherMessage && <p>{voucherMessage}</p>}
                  </div>
                )}
              </div>

              {/* Billing */}
              <div className="mt-4 space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Tạm tính</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Phí vận chuyển</span>
                  <span>
                    {computedShippingFee === 0
                      ? 'Miễn phí'
                      : formatCurrency(computedShippingFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--muted-foreground)]">Giảm giá</span>
                  <span>-{discount > 0 ? formatCurrency(discount) : '0₫'}</span>
                </div>
                <div className="flex justify-between border-t border-[var(--border)] pt-3 text-sm sm:text-base font-semibold">
                  <span>Tổng thanh toán</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || items.length === 0}
                className="mt-4 w-full rounded-full bg-[var(--primary)] py-3 text-sm font-semibold tracking-wide text-[var(--primary-foreground)] transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#E6F0FF]"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </section>
          </aside>
        </form>

        <ToastContainer toasts={toasts} onClose={removeToast} />
      </div>
    </div>
  );
};

export default CheckoutPage;

