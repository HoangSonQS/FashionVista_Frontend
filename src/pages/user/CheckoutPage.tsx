import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { userService } from '../../services/userService';
import { addressService } from '../../services/addressService';
import type { CheckoutRequest } from '../../types/order';
import type { UserProfile } from '../../types/user';
import type { AddressOption } from '../../types/address';

const defaultForm: CheckoutRequest = {
  fullName: '',
  phone: '',
  address: '',
  ward: '',
  district: '',
  city: '',
  paymentMethod: 'COD',
};

const CheckoutPage = () => {
  const [form, setForm] = useState<CheckoutRequest>(defaultForm);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [prefilled, setPrefilled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
        setForm((prev) => ({
          ...prev,
          fullName: data.fullName ?? '',
          phone: data.phoneNumber ?? '',
        }));
      } catch {
        // ignore
      }
    };
    fetchProfile();
  }, []);

  const findOptionByName = (options: AddressOption[], value: string) => {
    if (!value) return undefined;
    return options.find(
      (option) =>
        option.fullName === value ||
        option.name === value ||
        option.codeName === value ||
        option.code === value,
    );
  };

  useEffect(() => {
    addressService.getProvinces().then(setProvinces).catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    if (!provinces.length || prefilled) {
      return;
    }
    if (!form.city) {
      setPrefilled(true);
      return;
    }
    const provinceMatch = findOptionByName(provinces, form.city);
    if (!provinceMatch) {
      setPrefilled(true);
      return;
    }
    const hydrate = async () => {
      setSelectedProvince(provinceMatch.code);
      const districtData = await addressService.getDistricts(provinceMatch.code);
      setDistricts(districtData);
      const districtMatch = findOptionByName(districtData, form.district);
      if (districtMatch) {
        setSelectedDistrict(districtMatch.code);
        const wardData = await addressService.getWards(districtMatch.code);
        setWards(wardData);
        const wardMatch = findOptionByName(wardData, form.ward);
        if (wardMatch) {
          setSelectedWard(wardMatch.code);
        }
      }
      setPrefilled(true);
    };
    hydrate().catch(() => setPrefilled(true));
  }, [provinces, form.city, form.district, form.ward, prefilled]);

  const handleProvinceSelect = async (code: string) => {
    setSelectedProvince(code);
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    if (!code) {
      setForm((prev) => ({ ...prev, city: '', district: '', ward: '' }));
      return;
    }
    const province = provinces.find((item) => item.code === code);
    setForm((prev) => ({ ...prev, city: province?.fullName ?? '', district: '', ward: '' }));
    try {
      const districtData = await addressService.getDistricts(code);
      setDistricts(districtData);
    } catch {
      setDistricts([]);
    }
  };

  const handleDistrictSelect = async (code: string) => {
    setSelectedDistrict(code);
    setSelectedWard('');
    setWards([]);
    if (!code) {
      setForm((prev) => ({ ...prev, district: '', ward: '' }));
      return;
    }
    const district = districts.find((item) => item.code === code);
    setForm((prev) => ({ ...prev, district: district?.fullName ?? '', ward: '' }));
    try {
      const wardData = await addressService.getWards(code);
      setWards(wardData);
    } catch {
      setWards([]);
    }
  };

  const handleWardSelect = (code: string) => {
    setSelectedWard(code);
    const ward = wards.find((item) => item.code === code);
    setForm((prev) => ({ ...prev, ward: ward?.fullName ?? '' }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const order = await orderService.checkout(form);
      setStatus(`Đặt hàng thành công! Mã đơn: ${order.orderNumber}`);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Không thể tạo đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CheckoutRequest, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
          Thanh toán
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 border border-[var(--border)] rounded-2xl p-6 bg-[var(--card)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Họ và tên</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Số điện thoại</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Địa chỉ</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              required
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Tỉnh/Thành phố</label>
              <select
                value={selectedProvince}
                onChange={(e) => handleProvinceSelect(e.target.value)}
                required
                className="w-full rounded-lg border border-[var(--border)] bg-white text-[var(--background)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                <option value="">Chọn tỉnh/thành</option>
                {provinces.map((province) => (
                  <option key={province.code} value={province.code}>
                    {province.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Quận/Huyện</label>
              <select
                value={selectedDistrict}
                onChange={(e) => handleDistrictSelect(e.target.value)}
                required
                disabled={!districts.length}
                className="w-full rounded-lg border border-[var(--border)] bg-white text-[var(--background)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-200 disabled:text-gray-500"
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map((district) => (
                  <option key={district.code} value={district.code}>
                    {district.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Phường/Xã</label>
              <select
                value={selectedWard}
                onChange={(e) => handleWardSelect(e.target.value)}
                required
                disabled={!wards.length}
                className="w-full rounded-lg border border-[var(--border)] bg-white text-[var(--background)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:bg-gray-200 disabled:text-gray-500"
              >
                <option value="">Chọn phường/xã</option>
                {wards.map((ward) => (
                  <option key={ward.code} value={ward.code}>
                    {ward.fullName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Ghi chú</label>
            <textarea
              value={form.notes ?? ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-medium hover:bg-[#0064c0] transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đặt hàng (COD)'}
          </button>

          {status && <p className="text-sm text-[var(--muted-foreground)]">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;

