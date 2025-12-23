import { useEffect, useMemo, useState } from 'react';
import {
  adminVoucherService,
  type AdminVoucherResponse,
  type VoucherCreateRequest,
  type VoucherType,
} from '../../services/adminVoucherService';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

// Helper function to convert ISO string (from backend) to local datetime-local format
// Backend returns LocalDateTime as ISO string (e.g., "2025-12-20T10:00:00" or "2025-12-20T10:00:00.000Z")
// We need to parse it and display as local time
const isoToLocalDateTime = (isoString: string): string => {
  // Remove timezone info if present and parse as local time
  const dateStr = isoString.replace('Z', '').split('.')[0]; // Remove Z and milliseconds
  const [datePart, timePart] = dateStr.split('T');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes] = (timePart || '00:00').split(':').map(Number);
  
  // Format as datetime-local (YYYY-MM-DDTHH:mm)
  return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// Helper function to convert local datetime-local value to ISO string for backend
// datetime-local input returns value in local time (e.g., "2025-12-20T10:00")
// Backend expects LocalDateTime, so we send it as ISO string without timezone
// Format: "YYYY-MM-DDTHH:mm:ss" (no Z, no timezone)
const localDateTimeToIso = (localDateTime: string): string => {
  // datetime-local format is already "YYYY-MM-DDTHH:mm"
  // Just append ":00" to make it "YYYY-MM-DDTHH:mm:ss" for backend
  return `${localDateTime}:00`;
};

const AdminVouchers = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [active, setActive] = useState<string>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{
    content: AdminVoucherResponse[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<VoucherCreateRequest>({
    code: '',
    type: 'PERCENT',
    value: undefined,
    freeShipping: false,
    minOrderTotal: undefined,
    usageLimit: undefined,
    active: true,
    startsAt: undefined,
    expiresAt: undefined,
  });
  const [submitting, setSubmitting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      active: active === '' ? undefined : active === 'true',
      page,
      size: 20,
    }),
    [debouncedSearch, active, page],
  );

  useEffect(() => {
    const fetchVouchers = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminVoucherService.getAllVouchers(filters);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách voucher.');
        showToast(err instanceof Error ? err.message : 'Không thể tải danh sách voucher.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void fetchVouchers();
  }, [filters, showToast]);

  const handleOpenModal = (voucher?: AdminVoucherResponse) => {
    if (voucher) {
      setEditingId(voucher.id);
      setFormData({
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        freeShipping: voucher.freeShipping,
        minOrderTotal: voucher.minOrderTotal,
        usageLimit: voucher.usageLimit,
        active: voucher.active,
        startsAt: voucher.startsAt,
        expiresAt: voucher.expiresAt,
      });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        type: 'PERCENT',
        value: undefined,
        freeShipping: false,
        minOrderTotal: undefined,
        usageLimit: undefined,
        active: true,
        startsAt: undefined,
        expiresAt: undefined,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      code: '',
      type: 'PERCENT',
      value: undefined,
      freeShipping: false,
      minOrderTotal: undefined,
      usageLimit: undefined,
      active: true,
      startsAt: undefined,
      expiresAt: undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const updatedVoucher = await adminVoucherService.updateVoucher(editingId, formData);
        showToast('Cập nhật voucher thành công.', 'success');

        // Optimistic update
        if (data) {
          setData({
            ...data,
            content: data.content.map((v) => (v.id === editingId ? updatedVoucher : v)),
          });
        }
        handleCloseModal();
        return;
      } else {
        await adminVoucherService.createVoucher(formData);
        showToast('Tạo voucher thành công.', 'success');
        setPage(0);
        setSearch('');
        handleCloseModal();
        // Refresh data
        try {
          const refreshFilters = {
            search: undefined,
            active: active === '' ? undefined : active === 'true',
            page: 0,
            size: 20,
          };
          const response = await adminVoucherService.getAllVouchers(refreshFilters);
          setData(response);
        } catch (err) {
          // Ignore error
        }
        return;
      }
    } catch (err: any) {
      let errorMessage = 'Có lỗi xảy ra.';
      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data) {
          errorMessage = JSON.stringify(data);
        }
        if (status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện hành động này.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      console.error('Error creating/updating voucher:', err);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      return;
    }
    try {
      await adminVoucherService.deleteVoucher(id);
      showToast('Xóa voucher thành công.', 'success');
      // Refresh data
      const response = await adminVoucherService.getAllVouchers(filters);
      setData(response);
    } catch (err: any) {
      let errorMessage = 'Không thể xóa voucher.';
      if (err?.response) {
        const data = err.response.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data) {
          errorMessage = JSON.stringify(data);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      showToast(errorMessage, 'error');
    }
  };

  const formatVoucherValue = (voucher: AdminVoucherResponse): string => {
    if (voucher.type === 'FREESHIP') {
      return 'Miễn phí vận chuyển';
    }
    if (voucher.type === 'PERCENT') {
      return `${voucher.value || 0}%`;
    }
    if (voucher.type === 'FIXED_AMOUNT') {
      return `${(voucher.value || 0).toLocaleString('vi-VN')}₫`;
    }
    return '-';
  };

  const getVoucherStatus = (voucher: AdminVoucherResponse): { label: string; color: string } => {
    if (!voucher.active) {
      return { label: 'Vô hiệu hóa', color: 'bg-gray-100 text-gray-700' };
    }
    const now = new Date();
    if (voucher.expiresAt && new Date(voucher.expiresAt) < now) {
      return { label: 'Hết hạn', color: 'bg-red-100 text-red-700' };
    }
    if (voucher.startsAt && new Date(voucher.startsAt) > now) {
      return { label: 'Chưa bắt đầu', color: 'bg-yellow-100 text-yellow-700' };
    }
    if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
      return { label: 'Đã hết lượt', color: 'bg-orange-100 text-orange-700' };
    }
    return { label: 'Đang hoạt động', color: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Voucher
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Quản lý các mã giảm giá và khuyến mãi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Tạo voucher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="search"
          placeholder="Tìm theo mã voucher..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả</option>
          <option value="true">Đang kích hoạt</option>
          <option value="false">Đã vô hiệu hóa</option>
        </select>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm leading-normal">
              <th className="py-4 px-6 font-semibold">Mã voucher</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Loại</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Giá trị</th>
              <th className="py-4 px-6 font-semibold text-center whitespace-nowrap">Đã dùng</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Trạng thái</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Thời hạn</th>
              <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted-foreground)] text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.content.length > 0 ? (
              data.content.map((item) => {
                const status = getVoucherStatus(item);
                return (
                  <tr
                    key={item.id}
                    className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors group"
                  >
                    <td className="py-4 px-6 align-top">
                      <div className="font-bold text-[var(--primary)] text-base mb-1 group-hover:underline cursor-pointer">
                        {item.code}
                      </div>
                      {item.minOrderTotal && (
                        <p className="text-xs text-[var(--muted-foreground)]">
                          Đơn tối thiểu: {item.minOrderTotal.toLocaleString('vi-VN')}₫
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 align-top">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
                        {item.type === 'PERCENT'
                          ? 'Phần trăm'
                          : item.type === 'FIXED_AMOUNT'
                            ? 'Số tiền cố định'
                            : 'Miễn phí ship'}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top text-[var(--primary)] font-medium">
                      {formatVoucherValue(item)}
                    </td>
                    <td className="py-4 px-6 align-top text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
                        {item.usedCount}
                        {item.usageLimit ? ` / ${item.usageLimit}` : ' / ∞'}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 align-top text-xs text-[var(--muted-foreground)]">
                      {item.startsAt && (
                        <div>
                          Từ: {new Date(item.startsAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      {item.expiresAt && (
                        <div>
                          Đến: {new Date(item.expiresAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                      {!item.startsAt && !item.expiresAt && <span>—</span>}
                    </td>
                    <td className="py-4 px-6 align-top text-center">
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenModal(item)}
                          className="w-full px-3 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--card)] border border-[var(--primary)]/30 rounded-full hover:bg-[var(--primary)]/10 transition-colors"
                        >
                          Chỉnh sửa
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="w-full px-3 py-1 text-xs font-medium text-[var(--error)] bg-[var(--card)] border border-[var(--error)]/30 rounded-full hover:bg-[var(--error)]/10 transition-colors"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Chưa có voucher nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <span>
                Hiển thị {data.content.length} trên tổng số {data.totalElements} voucher
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)] transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          ) : (
            <span>Hiển thị {data.totalElements} trên tổng số {data.totalElements} voucher</span>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Chỉnh sửa voucher' : 'Tạo voucher mới'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-2 hover:bg-[var(--muted)]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Mã voucher *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="Ví dụ: SALE10, FREESHIP"
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Loại voucher *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => {
                      const newType = e.target.value as VoucherType;
                      setFormData({
                        ...formData,
                        type: newType,
                        // Reset value khi đổi loại
                        value: newType === 'FREESHIP' ? undefined : formData.value,
                      });
                    }}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="PERCENT">Phần trăm (%)</option>
                    <option value="FIXED_AMOUNT">Số tiền cố định (₫)</option>
                    <option value="FREESHIP">Miễn phí vận chuyển</option>
                  </select>
                </div>
              </div>

              {formData.type !== 'FREESHIP' && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Giá trị {formData.type === 'PERCENT' ? '(%)' : '(₫)'} *
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={formData.type === 'PERCENT' ? 100 : undefined}
                    value={formData.value || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        value: e.target.value ? Number(e.target.value) : undefined,
                      })
                    }
                    placeholder={formData.type === 'PERCENT' ? 'Ví dụ: 10 (10%)' : 'Ví dụ: 50000 (50,000₫)'}
                    required
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Miễn phí vận chuyển</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.freeShipping || false}
                    onChange={(e) => setFormData({ ...formData, freeShipping: e.target.checked })}
                    className="rounded border-[var(--border)]"
                  />
                  <span className="text-sm">Áp dụng miễn phí vận chuyển</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Đơn tối thiểu (₫)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.minOrderTotal || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minOrderTotal: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ví dụ: 500000 (tùy chọn)"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Giới hạn sử dụng</label>
                <input
                  type="number"
                  min={1}
                  value={formData.usageLimit || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      usageLimit: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  placeholder="Ví dụ: 100 (để trống = không giới hạn)"
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={formData.startsAt ? isoToLocalDateTime(formData.startsAt) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startsAt: e.target.value ? localDateTimeToIso(e.target.value) : undefined,
                      })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hết hạn</label>
                  <input
                    type="datetime-local"
                    value={formData.expiresAt ? isoToLocalDateTime(formData.expiresAt) : ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expiresAt: e.target.value ? localDateTimeToIso(e.target.value) : undefined,
                      })
                    }
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <select
                  value={formData.active ? 'true' : 'false'}
                  onChange={(e) => setFormData({ ...formData, active: e.target.value === 'true' })}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="true">Kích hoạt</option>
                  <option value="false">Vô hiệu hóa</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVouchers;

