import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { addressService } from '../../services/addressService';
import type { Address, UserProfile } from '../../types/user';
import type { AddressOption } from '../../types/address';
import { reviewService } from '../../services/reviewService';
import type { ReviewSummary } from '../../types/review';
import { wishlistService } from '../../services/wishlistService';
import type { WishlistItem } from '../../types/wishlist';

const defaultProfile = {
  fullName: '',
  phoneNumber: '',
};

const defaultAddress = {
  fullName: '',
  phone: '',
  address: '',
  ward: '',
  district: '',
  city: '',
  isDefault: false,
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileForm, setProfileForm] = useState(defaultProfile);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressForm, setAddressForm] = useState(defaultAddress);
  const [message, setMessage] = useState<string | null>(null);
  const [provinces, setProvinces] = useState<AddressOption[]>([]);
  const [districts, setDistricts] = useState<AddressOption[]>([]);
  const [wards, setWards] = useState<AddressOption[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [activeTab, setActiveTab] = useState<'INFO' | 'ADDRESS' | 'REVIEWS' | 'WISHLIST'>('INFO');
  const [isModalOpen, setModalOpen] = useState(false);
  const [addressType, setAddressType] = useState<'HOME' | 'OFFICE'>('HOME');
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [myReviews, setMyReviews] = useState<ReviewSummary[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [removingWishlistIds, setRemovingWishlistIds] = useState<number[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const loadData = async () => {
    const [profileData, addressData] = await Promise.all([
      userService.getProfile(),
      userService.getAddresses(),
    ]);
    setProfile(profileData);
    setProfileForm({ fullName: profileData.fullName, phoneNumber: profileData.phoneNumber });
    const sorted = [...addressData].sort((a, b) => {
      if (a.isDefault === b.isDefault) {
        return a.id - b.id;
      }
      return a.isDefault ? -1 : 1;
    });
    setAddresses(sorted);
  };

  useEffect(() => {
    loadData().catch(() => setMessage('Không thể tải thông tin người dùng.'));
    addressService
      .getProvinces()
      .then((data) => setProvinces(sortProvinces(data)))
      .catch(() => setProvinces([]));

    setLoadingReviews(true);
    reviewService
      .getMyReviews()
      .then((data) => setMyReviews(data))
      .catch(() => setMyReviews([]))
      .finally(() => setLoadingReviews(false));

    setLoadingWishlist(true);
    wishlistService
      .getMyWishlist()
      .then((data) => setWishlist(data))
      .catch(() => setWishlist([]))
      .finally(() => setLoadingWishlist(false));
  }, []);

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const updated = await userService.updateProfile(profileForm);
      setProfile(updated);
      setMessage('Đã cập nhật thông tin cá nhân.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể cập nhật thông tin.');
    }
  };

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      setMessage('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    try {
      setChangingPassword(true);
      await userService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      setMessage('Đã đổi mật khẩu thành công.');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể đổi mật khẩu.');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleAddressSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      if (editingAddressId) {
        await userService.updateAddress(editingAddressId, addressForm);
        setMessage('Đã cập nhật địa chỉ.');
      } else {
        await userService.createAddress(addressForm);
        setMessage('Đã thêm địa chỉ mới.');
      }
      setAddressForm(defaultAddress);
      setSelectedProvince('');
      setSelectedDistrict('');
      setSelectedWard('');
      setDistricts([]);
      setWards([]);
      setAddressType('HOME');
      setEditingAddressId(null);
      setModalOpen(false);
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể thêm địa chỉ.');
    }
  };

  const municipalities = ['01', '79', '31', '48', '92'];

  const sortOptions = (options: AddressOption[]) =>
    [...options].sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));

  const sortProvinces = (options: AddressOption[]) => {
    const sticky = options.filter((item) => municipalities.includes(item.code));
    const rest = options.filter((item) => !municipalities.includes(item.code));
    sticky.sort((a, b) => municipalities.indexOf(a.code) - municipalities.indexOf(b.code));
    rest.sort((a, b) => a.fullName.localeCompare(b.fullName, 'vi'));
    return [...sticky, ...rest];
  };

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

  const handleProvinceChange = async (code: string) => {
    setSelectedProvince(code);
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    if (!code) {
      setAddressForm((prev) => ({ ...prev, city: '', district: '', ward: '' }));
      return;
    }
    const province = provinces.find((item) => item.code === code);
    setAddressForm((prev) => ({ ...prev, city: province?.fullName ?? '', district: '', ward: '' }));
    try {
      const districtData = await addressService.getDistricts(code);
      setDistricts(sortOptions(districtData));
    } catch {
      setDistricts([]);
    }
  };

  const handleDistrictChange = async (code: string) => {
    setSelectedDistrict(code);
    setSelectedWard('');
    setWards([]);
    if (!code) {
      setAddressForm((prev) => ({ ...prev, district: '', ward: '' }));
      return;
    }
    const district = districts.find((item) => item.code === code);
    setAddressForm((prev) => ({ ...prev, district: district?.fullName ?? '', ward: '' }));
    try {
      const wardData = await addressService.getWards(code);
      setWards(sortOptions(wardData));
    } catch {
      setWards([]);
    }
  };

  const handleWardChange = (code: string) => {
    setSelectedWard(code);
    const ward = wards.find((item) => item.code === code);
    setAddressForm((prev) => ({ ...prev, ward: ward?.fullName ?? '' }));
  };

  const openAddModal = () => {
    setEditingAddressId(null);
    setAddressForm(defaultAddress);
    setSelectedProvince('');
    setSelectedDistrict('');
    setSelectedWard('');
    setDistricts([]);
    setWards([]);
    setAddressType('HOME');
    setModalOpen(true);
  };

  const openEditModal = async (address: Address) => {
    setEditingAddressId(address.id);
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      ward: address.ward,
      district: address.district,
      city: address.city,
      isDefault: address.isDefault,
    });
    setModalOpen(true);
    try {
      const provinceMatch = findOptionByName(provinces, address.city);
      if (provinceMatch) {
        setSelectedProvince(provinceMatch.code);
        const districtData = await addressService.getDistricts(provinceMatch.code);
        const sortedDistricts = sortOptions(districtData);
        setDistricts(sortedDistricts);
        const districtMatch = findOptionByName(sortedDistricts, address.district);
        if (districtMatch) {
          setSelectedDistrict(districtMatch.code);
          const wardData = await addressService.getWards(districtMatch.code);
          const sortedWards = sortOptions(wardData);
          setWards(sortedWards);
          const wardMatch = findOptionByName(sortedWards, address.ward);
          if (wardMatch) {
            setSelectedWard(wardMatch.code);
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      return;
    }
    try {
      await userService.deleteAddress(id);
      setMessage('Đã xóa địa chỉ.');
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể xóa địa chỉ.');
    }
  };

  const handleSetDefault = async (address: Address) => {
    try {
      await userService.updateAddress(address.id, {
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        ward: address.ward,
        district: address.district,
        city: address.city,
        isDefault: true,
      });
      setMessage('Đã đặt làm địa chỉ mặc định.');
      loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không thể cập nhật địa chỉ.');
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <form onSubmit={handleProfileSubmit} className="space-y-4 border border-[var(--border)] rounded-3xl p-6 bg-[var(--card)] shadow-lg">
        <h2 className="text-xl font-semibold">Thông tin cá nhân</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Cập nhật thông tin hồ sơ và số điện thoại của bạn.</p>
        <div className="space-y-2">
          <label className="text-sm text-[var(--muted-foreground)]">Email</label>
          <input
            type="email"
            value={profile?.email ?? ''}
            readOnly
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 opacity-70"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--muted-foreground)]">Họ và tên</label>
          <input
            type="text"
            value={profileForm.fullName}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[var(--muted-foreground)]">Số điện thoại</label>
          <input
            type="tel"
            value={profileForm.phoneNumber}
            onChange={(e) => setProfileForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-medium hover:bg-[var(--primary-hover)] transition-colors"
        >
          Lưu thay đổi
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="space-y-4 border border-[var(--border)] rounded-3xl p-6 bg-[var(--card)] shadow-lg">
        <h2 className="text-xl font-semibold">Đổi mật khẩu</h2>
        <p className="text-sm text-[var(--muted-foreground)]">Thay đổi mật khẩu đăng nhập của bạn.</p>
        <div className="space-y-2">
          <label className="text-sm text-[var(--muted-foreground)]">Mật khẩu hiện tại</label>
          <input
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Mật khẩu mới</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={passwordForm.confirmNewPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmNewPassword: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              required
              minLength={6}
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={changingPassword}
            className="flex-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-medium hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {changingPassword ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
          </button>
          <button
            type="button"
            onClick={() => setPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' })}
            className="rounded-full border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
          >
            Xóa mật khẩu
          </button>
        </div>
      </form>
    </div>
  );

  const renderAddressList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Địa chỉ</h2>
          <p className="text-sm text-[var(--muted-foreground)]">Quản lý địa chỉ nhận hàng của bạn.</p>
        </div>
        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
        >
          + Thêm địa chỉ mới
        </button>
      </div>
      {addresses.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">Chưa có địa chỉ nào.</p>
      ) : (
        <div className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 shadow-lg">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="grid gap-4 border-b border-[var(--border)] pb-4 last:border-0 last:pb-0 lg:grid-cols-[1fr_auto]"
            >
              <div className="text-sm leading-relaxed">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="font-semibold text-[var(--foreground)]">{address.fullName}</span>
                  <span className="text-[var(--muted-foreground)]">(+84) {address.phone}</span>
                </div>
                <p className="text-[var(--muted-foreground)]">{address.address}</p>
                <p className="text-[var(--muted-foreground)]">
                  {address.ward}, {address.district}, {address.city}
                </p>
                {address.isDefault && (
                  <span className="mt-2 inline-flex w-fit rounded border border-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-[var(--accent)]">
                    Mặc định
                  </span>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 text-[var(--primary)]">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <button type="button" className="hover:underline" onClick={() => openEditModal(address)}>
                    Cập nhật
                  </button>
                  <button type="button" className="hover:underline" onClick={() => handleDeleteAddress(address.id)}>
                    Xóa
                  </button>
                </div>
                <button
                  type="button"
                  disabled={address.isDefault}
                  onClick={() => handleSetDefault(address)}
                  className={`rounded border px-3 py-1 text-xs ${
                    address.isDefault
                      ? 'border-[var(--muted-foreground)] text-[var(--muted-foreground)] cursor-not-allowed'
                      : 'border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--border)]'
                  }`}
                >
                  Thiết lập mặc định
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReviews = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Đánh giá của tôi</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Xem lại các đánh giá bạn đã viết cho sản phẩm đã mua.
        </p>
      </div>
      {loadingReviews ? (
        <p className="text-sm text-[var(--muted-foreground)]">Đang tải đánh giá...</p>
      ) : myReviews.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Bạn chưa có đánh giá nào. Hãy mua hàng và chia sẻ cảm nhận của bạn.
        </p>
      ) : (
        <div className="space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--card)] px-5 py-4 shadow-lg">
          {myReviews.map((review) => (
            <div
              key={review.id}
              className="border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold">{review.productName}</p>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    {review.rating} / 5 sao
                  </p>
                </div>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {new Date(review.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              {review.comment && (
                <p className="mt-1 text-sm text-[var(--muted-foreground)]">{review.comment}</p>
              )}
              <button
                type="button"
                className="mt-1 text-xs text-[var(--primary)] hover:underline"
                onClick={() => {
                  // Điều hướng sang trang chi tiết sản phẩm
                  if (review.productSlug) {
                    window.location.href = `/products/${review.productSlug}`;
                  }
                }}
              >
                Xem sản phẩm
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Sản phẩm yêu thích</h2>
        <p className="text-sm text-[var(--muted-foreground)]">
          Danh sách các sản phẩm bạn đã thêm vào yêu thích.
        </p>
      </div>
      {loadingWishlist ? (
        <p className="text-sm text-[var(--muted-foreground)]">Đang tải danh sách yêu thích...</p>
      ) : wishlist.length === 0 ? (
        <p className="text-sm text-[var(--muted-foreground)]">
          Bạn chưa thêm sản phẩm nào vào danh sách yêu thích.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-transform"
            >
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/products/${item.productSlug}`;
                }}
                className="text-left w-full"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[var(--background)]">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-[var(--muted-foreground)]">
                      Đang cập nhật
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-sm font-semibold line-clamp-2">{item.productName}</p>
                  <p className="text-sm font-semibold text-[var(--primary)]">
                    {item.price.toLocaleString('vi-VN')}₫
                  </p>
                  {item.compareAtPrice && (
                    <p className="text-xs text-[var(--muted-foreground)] line-through">
                      {item.compareAtPrice.toLocaleString('vi-VN')}₫
                    </p>
                  )}
                </div>
              </button>
              <div className="flex items-center justify-between px-3 pb-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = `/products/${item.productSlug}`;
                  }}
                  className="flex-1 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--foreground)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors"
                >
                  Xem sản phẩm
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    setRemovingWishlistIds((prev) => [...prev, item.productId]);
                    try {
                      await wishlistService.remove(item.productId);
                      setWishlist((prev) => prev.filter((w) => w.productId !== item.productId));
                    } finally {
                      setRemovingWishlistIds((prev) => prev.filter((id) => id !== item.productId));
                    }
                  }}
                  disabled={removingWishlistIds.includes(item.productId)}
                  className="flex-1 rounded-full border border-[var(--error,#ef4444)] text-[var(--error,#ef4444)] px-3 py-2 text-xs font-medium hover:bg-[var(--error,#ef4444)]/10 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {removingWishlistIds.includes(item.productId) ? 'Đang xóa...' : 'Xóa yêu thích'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderModal = () => {
    if (!isModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
        <form
          onSubmit={handleAddressSubmit}
          className="w-full max-w-xl space-y-4 rounded-3xl bg-[var(--card)] p-6 text-[var(--foreground)] shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">Địa chỉ mới</h3>
              <p className="text-sm text-[var(--muted-foreground)]">Dùng thông tin trước sáp nhập</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setModalOpen(false);
                setEditingAddressId(null);
              }}
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Họ và tên"
              value={addressForm.fullName}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
              className="rounded-lg border border-[var(--border)] px-3 py-2 focus:border-[var(--input-border-focus)] focus:outline-none"
            />
            <input
              type="tel"
              placeholder="Số điện thoại"
              value={addressForm.phone}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, phone: e.target.value }))}
              required
              className="rounded-lg border border-[var(--border)] px-3 py-2 focus:border-[var(--input-border-focus)] focus:outline-none"
            />
          </div>
          <select
            value={selectedProvince}
            onChange={(e) => handleProvinceChange(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[var(--background)] focus:border-[#0f1f3c] focus:outline-none"
          >
            <option value="">Tỉnh/Thành phố</option>
            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.fullName}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              required
              disabled={!districts.length}
              className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--input-border-focus)] focus:outline-none disabled:bg-[var(--muted)]"
            >
              <option value="">Quận/Huyện</option>
              {districts.map((district) => (
                <option key={district.code} value={district.code}>
                  {district.fullName}
                </option>
              ))}
            </select>
            <select
              value={selectedWard}
              onChange={(e) => handleWardChange(e.target.value)}
              required
              disabled={!wards.length}
              className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:border-[var(--input-border-focus)] focus:outline-none disabled:bg-[var(--muted)]"
            >
              <option value="">Phường/Xã</option>
              {wards.map((ward) => (
                <option key={ward.code} value={ward.code}>
                  {ward.fullName}
                </option>
              ))}
            </select>
          </div>
          <input
            type="text"
            placeholder="Địa chỉ cụ thể"
            value={addressForm.address}
            onChange={(e) => setAddressForm((prev) => ({ ...prev, address: e.target.value }))}
            required
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[var(--background)] focus:border-[#0f1f3c] focus:outline-none"
          />
          <div className="space-y-2">
            <span className="text-sm text-[var(--muted-foreground)]">Loại địa chỉ</span>
            <div className="flex gap-3">
              <label
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                  addressType === 'HOME' ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border-[var(--border)] text-[var(--muted-foreground)]'
                }`}
              >
                <input
                  type="radio"
                  name="addressType"
                  value="HOME"
                  className="hidden"
                  checked={addressType === 'HOME'}
                  onChange={() => setAddressType('HOME')}
                />
                Nhà riêng
              </label>
              <label
                className={`flex-1 cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
                  addressType === 'OFFICE' ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]' : 'border-[var(--border)] text-[var(--muted-foreground)]'
                }`}
              >
                <input
                  type="radio"
                  name="addressType"
                  value="OFFICE"
                  className="hidden"
                  checked={addressType === 'OFFICE'}
                  onChange={() => setAddressType('OFFICE')}
                />
                Văn phòng
              </label>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
            <input
              type="checkbox"
              checked={addressForm.isDefault}
              onChange={(e) => setAddressForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
            />
            Đặt làm địa chỉ mặc định
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full border border-[var(--border)] px-6 py-2 text-sm font-semibold text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
            >
              Trở lại
            </button>
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-6 py-2 text-sm font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"
            >
              Hoàn thành
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="w-full rounded-3xl border border-[var(--border)] bg-[var(--card)] px-4 py-6 shadow-lg lg:w-64">
          <div className="flex items-center gap-3 border-b border-[var(--border)] pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--muted)] font-serif text-lg">
              {profile?.fullName?.charAt(0) ?? 'S'}
            </div>
            <div>
              <p className="text-sm text-[var(--muted-foreground)]">Tài khoản của</p>
              <p className="text-base font-semibold">{profile?.fullName ?? 'Khách hàng'}</p>
            </div>
          </div>
          <nav className="mt-4 space-y-1 text-sm">
            <p className="px-3 text-[var(--muted-foreground)] uppercase tracking-[0.35em]">Tài khoản của tôi</p>
            <button
              type="button"
              onClick={() => setActiveTab('INFO')}
              className={`w-full rounded-2xl px-3 py-2 text-left ${
                activeTab === 'INFO' ? 'bg-[var(--muted)] font-semibold' : 'text-[var(--muted-foreground)]'
              }`}
            >
              Hồ sơ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ADDRESS')}
              className={`w-full rounded-2xl px-3 py-2 text-left ${
                activeTab === 'ADDRESS'
                  ? 'bg-[var(--muted)] font-semibold'
                  : 'text-[var(--muted-foreground)]'
              }`}
            >
              Địa chỉ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('REVIEWS')}
              className={`w-full rounded-2xl px-3 py-2 text-left ${
                activeTab === 'REVIEWS'
                  ? 'bg-[var(--muted)] font-semibold'
                  : 'text-[var(--muted-foreground)]'
              }`}
            >
              Đánh giá của tôi
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('WISHLIST')}
              className={`w-full rounded-2xl px-3 py-2 text-left ${
                activeTab === 'WISHLIST'
                  ? 'bg-[var(--muted)] font-semibold'
                  : 'text-[var(--muted-foreground)]'
              }`}
            >
              Sản phẩm yêu thích
            </button>
            <button
              type="button"
              onClick={() => navigate('/orders')}
              className="w-full rounded-2xl px-3 py-2 text-left text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:font-semibold transition-colors"
            >
              Đơn hàng của tôi
            </button>
          </nav>
        </aside>

        <section className="flex-1 space-y-6">
          {message && (
            <p className="rounded-2xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
              {message}
            </p>
          )}
          {activeTab === 'INFO'
            ? renderProfileTab()
            : activeTab === 'ADDRESS'
            ? renderAddressList()
            : activeTab === 'REVIEWS'
            ? renderReviews()
            : renderWishlist()}
        </section>
      </div>
      {renderModal()}
    </div>
  );
};

export default ProfilePage;

