import { useEffect, useMemo, useState } from 'react';
import { adminReturnService } from '../../services/adminReturnService';
import type { ReturnRequestResponse, ReturnStatus } from '../../types/return';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import { CheckCircle, XCircle } from 'lucide-react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const STATUS_OPTIONS: { label: string; value: ReturnStatus | '' }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Yêu cầu đổi trả', value: 'REQUESTED' },
  { label: 'Đã chấp nhận', value: 'APPROVED' },
  { label: 'Từ chối', value: 'REJECTED' },
  { label: 'Đang hoàn tiền', value: 'REFUND_PENDING' },
  { label: 'Đã hoàn tiền', value: 'REFUNDED' },
];

const AdminReturns = () => {
  const [data, setData] = useState<{ content: ReturnRequestResponse[]; totalPages: number; number: number }>({
    content: [],
    totalPages: 0,
    number: 0,
  });
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | ''>('');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<ReturnRequestResponse | null>(null);
   const [selectedIds, setSelectedIds] = useState<number[]>([]);
   const [bulkUpdating, setBulkUpdating] = useState(false);
  const [detailUpdating, setDetailUpdating] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({ status: statusFilter || undefined, search: debouncedSearch || undefined, page, size: 20 }),
    [statusFilter, debouncedSearch, page],
  );

  useEffect(() => {
    const fetchList = async () => {
      try {
        setLoading(true);
        const res = await adminReturnService.list(filters);
        setData({ content: res.content, totalPages: res.totalPages, number: res.number });
        setSelectedIds([]);
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Không thể tải danh sách đổi trả.';
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [filters, showToast]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (data.content.length === 0) return;
    const allIds = data.content.map((i) => i.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  };

  const handleBulkUpdate = async (status: ReturnStatus) => {
    if (selectedIds.length === 0) {
      showToast('Vui lòng chọn ít nhất một yêu cầu.', 'error');
      return;
    }
    if (!confirm(`Xác nhận cập nhật ${selectedIds.length} yêu cầu về trạng thái ${status}?`)) return;

    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedIds.map((id) => adminReturnService.updateStatus(id, { status }))
      );
      showToast('Đã cập nhật trạng thái.', 'success');
      const res = await adminReturnService.list(filters);
      setData({ content: res.content, totalPages: res.totalPages, number: res.number });
      setSelectedIds([]);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái.';
      showToast(message, 'error');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleBulkUpdateDetail = async (id: number, status: ReturnStatus) => {
    try {
      setDetailUpdating(true);
      const updated = await adminReturnService.updateStatus(id, { status });
      showToast('Đã cập nhật trạng thái.', 'success');

      // Cập nhật danh sách (lấy lại)
      const res = await adminReturnService.list(filters);
      setData({ content: res.content, totalPages: res.totalPages, number: res.number });

      // Nếu modal đang mở chính item này thì cập nhật selected
      if (selected && selected.id === id) {
        setSelected(updated);
      }
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái.';
      showToast(message, 'error');
    } finally {
      setDetailUpdating(false);
    }
  };

  const renderStatusBadge = (status: ReturnStatus) => {
    const label = STATUS_OPTIONS.find((s) => s.value === status)?.label || status;
    const palette: Record<ReturnStatus, string> = {
      REQUESTED: 'bg-amber-100 text-amber-700 border border-amber-200',
      APPROVED: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      REJECTED: 'bg-rose-100 text-rose-700 border border-rose-200',
      REFUND_PENDING: 'bg-sky-100 text-sky-700 border border-sky-200',
      REFUNDED: 'bg-green-100 text-green-700 border border-green-200',
    };
    return <span className={`px-2 py-1 text-xs rounded ${palette[status] || ''}`}>{label}</span>;
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Quản lý đổi trả</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Danh sách yêu cầu đổi trả</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm w-64"
            />
          </div>
          <button
            type="button"
            onClick={() => handleBulkUpdate('APPROVED')}
            disabled={selectedIds.length === 0 || bulkUpdating}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-emerald-50 disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            Duyệt
          </button>
          <button
            type="button"
            onClick={() => handleBulkUpdate('REJECTED')}
            disabled={selectedIds.length === 0 || bulkUpdating}
            className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-rose-50 disabled:opacity-50"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            Từ chối
          </button>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ReturnStatus | '');
              setPage(0);
            }}
            className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-[var(--muted)]/40 text-[var(--muted-foreground)]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={data.content.length > 0 && data.content.every((i) => selectedIds.includes(i.id))}
                    onChange={toggleSelectAll}
                    className="rounded border-[var(--border)]"
                  />
                </th>
                <th className="px-4 py-3 text-left">Mã đơn</th>
                <th className="px-4 py-3 text-left">Trạng thái</th>
                <th className="px-4 py-3 text-left">Số lượng sản phẩm</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && data.content.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-[var(--muted-foreground)]">
                    Không có yêu cầu đổi trả.
                  </td>
                </tr>
              )}
              {data.content.map((item) => (
                <tr key={item.id} className="border-t border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      className="rounded border-[var(--border)]"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{item.orderNumber}</td>
                  <td className="px-4 py-3">{renderStatusBadge(item.status)}</td>
                  <td className="px-4 py-3">{item.items.length}</td>
                  <td className="px-4 py-3">
                    {new Date(item.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)] text-sm">
            <span className="text-[var(--muted-foreground)]">
              Trang {data.number + 1} / {data.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)]"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={page >= data.totalPages - 1}
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                className="rounded-lg border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)]"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[9999] bg-[var(--overlay)] flex items-center justify-center px-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Đổi trả #{selected.id}</h2>
                <p className="text-sm text-[var(--muted-foreground)]">Đơn hàng: {selected.orderNumber}</p>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Trạng thái: {STATUS_OPTIONS.find((s) => s.value === selected.status)?.label || selected.status}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    handleBulkUpdateDetail(selected.id, 'APPROVED')
                  }
                  disabled={detailUpdating}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-emerald-50 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Duyệt
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleBulkUpdateDetail(selected.id, 'REJECTED')
                  }
                  disabled={detailUpdating}
                  className="inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs hover:bg-rose-50 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Từ chối
                </button>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-lg p-1 hover:bg-[var(--muted)]"
                >
                  Đóng
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold">Lý do</p>
              <p className="text-sm text-[var(--foreground)]">{selected.reason || 'Không có lý do'}</p>
              {selected.note && <p className="text-sm text-[var(--muted-foreground)]">Ghi chú: {selected.note}</p>}
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold">Sản phẩm</p>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {selected.items.map((it) => (
                  <div key={it.orderItemId} className="flex items-center gap-3 border-b border-[var(--border)] pb-2 last:border-0">
                    {it.productImage && (
                      <img src={it.productImage} alt={it.productName} className="w-12 h-12 rounded object-cover border" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{it.productName}</p>
                      <p className="text-xs text-[var(--muted-foreground)]">SL: {it.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold">{it.lineTotal.toLocaleString('vi-VN')} ₫</p>
                  </div>
                ))}
              </div>
            </div>

            {selected.evidenceUrls && selected.evidenceUrls.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-semibold">Hình ảnh bằng chứng</p>
                <div className="flex flex-wrap gap-2">
                  {selected.evidenceUrls.map((url, idx) => (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--primary)] underline text-sm break-all"
                    >
                      Ảnh {idx + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminReturns;

