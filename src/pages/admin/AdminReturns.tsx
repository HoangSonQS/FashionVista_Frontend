import { useEffect, useMemo, useState } from 'react';
import { adminReturnService } from '../../services/adminReturnService';
import type { ReturnRequestResponse, ReturnStatus, ReturnItemUpdate } from '../../types/return';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import { Save, RotateCcw } from 'lucide-react';
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

  // Selected Request & Form State
  const [selected, setSelected] = useState<ReturnRequestResponse | null>(null);
  const [itemDecisions, setItemDecisions] = useState<Record<number, { status: ReturnStatus; acceptedQuantity: number }>>({});
  const [restock, setRestock] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [detailUpdating, setDetailUpdating] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({ status: statusFilter || undefined, search: debouncedSearch || undefined, page, size: 20 }),
    [statusFilter, debouncedSearch, page],
  );

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

  useEffect(() => {
    fetchList();
  }, [filters]);

  // Initialize form when opening modal
  useEffect(() => {
    if (selected) {
      const initialDecisions: Record<number, { status: ReturnStatus; acceptedQuantity: number }> = {};
      selected.items.forEach(item => {
        initialDecisions[item.orderItemId] = {
          status: item.status === 'REQUESTED' ? 'APPROVED' : item.status,
          acceptedQuantity: item.acceptedQuantity ?? item.quantity // default to requested quantity
        };
      });
      setItemDecisions(initialDecisions);
      setRestock(false);
      setAdminNote(selected.adminNote || '');
    }
  }, [selected]);

  const estimatedRefund = useMemo(() => {
    if (!selected) return 0;
    return selected.items.reduce((sum, item) => {
      const decision = itemDecisions[item.orderItemId];
      if (decision?.status === 'APPROVED') {
        return sum + (decision.acceptedQuantity * item.unitPrice);
      }
      return sum;
    }, 0);
  }, [selected, itemDecisions]);

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
    if (selectedIds.length === 0) return;
    if (!confirm(`Xác nhận cập nhật ${selectedIds.length} yêu cầu về trạng thái ${status}?`)) return;

    try {
      setBulkUpdating(true);
      await Promise.all(
        selectedIds.map((id) => adminReturnService.updateStatus(id, { status }))
      );
      showToast('Đã cập nhật trạng thái.', 'success');
      fetchList();
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật', 'error');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleSaveDetail = async () => {
    if (!selected) return;

    // Check constraints
    let hasApproved = false;
    for (const item of selected.items) {
      const d = itemDecisions[item.orderItemId];
      if (d.status === 'APPROVED') {
        hasApproved = true;
        if (d.acceptedQuantity <= 0) {
          showToast(`Sản phẩm ${item.productName} được duyệt nhưng số lượng <= 0`, 'error');
          return;
        }
        if (d.acceptedQuantity > item.quantity) {
          showToast(`Sản phẩm ${item.productName} số lượng chấp nhận vượt quá yêu cầu`, 'error');
          return;
        }
      }
    }

    // Warning if approving without restock
    if (hasApproved && !restock) {
      if (!confirm('Bạn ĐANG KHÔNG CHỌN nhập kho lại sản phẩm (Restock).\nKho hàng sẽ KHÔNG được cộng thêm.\nBạn có chắc chắn muốn tiếp tục?')) {
        return;
      }
    }

    try {
      setDetailUpdating(true);

      const itemsUpdate: ReturnItemUpdate[] = Object.entries(itemDecisions).map(([k, v]) => ({
        orderItemId: Number(k),
        status: v.status,
        acceptedQuantity: v.acceptedQuantity
      }));

      const finalStatus = hasApproved ? 'APPROVED' : 'REJECTED';

      await adminReturnService.updateStatus(selected.id, {
        status: finalStatus,
        items: itemsUpdate,
        restockItems: restock,
        adminNote: adminNote,
        refundAmount: estimatedRefund // Optional: allow backend to recalc or use this
      });

      showToast('Đã cập nhật chi tiết yêu cầu.', 'success');
      fetchList(); // Refresh list
      setSelected(null); // Close modal
    } catch (err: any) {
      showToast(err.message || 'Lỗi cập nhật chi tiết', 'error');
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

  const calculateQuantities = (items: ReturnRequestResponse['items']) => {
    const total = items.reduce((sum, i) => sum + i.quantity, 0);
    const accepted = items.reduce((sum, i) => sum + (i.acceptedQuantity || 0), 0);
    return { total, accepted };
  };

  return (
    <div className="p-4 md:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Quản lý đổi trả</h1>
          <p className="text-sm text-[var(--muted-foreground)]">Danh sách yêu cầu đổi trả</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Filters & Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm mã đơn, khách hàng, sản phẩm..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as ReturnStatus | ''); setPage(0); }}
            className="rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.label} value={opt.value}>{opt.label}</option>
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
                <th className="px-4 py-3 text-left">SL (Chấp nhận / Tổng)</th>
                <th className="px-4 py-3 text-left">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && data.content.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-6 text-center text-[var(--muted-foreground)]">Không có yêu cầu đổi trả.</td></tr>
              )}
              {data.content.map((item) => {
                const qty = calculateQuantities(item.items);
                return (
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
                    <td className="px-4 py-3">
                      <span className="font-medium">{qty.accepted}</span>
                      <span className="text-[var(--muted-foreground)]"> / {qty.total}</span>
                    </td>
                    <td className="px-4 py-3">{new Date(item.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="rounded-lg border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--muted)]"
                      >
                        Xử lý
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selected && (
        <div className="fixed inset-0 z-[9999] bg-[var(--overlay)] flex items-center justify-center px-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">Xử lý Đổi trả #{selected.id}</h2>
                <div className="text-sm text-[var(--muted-foreground)] mt-1">
                  Đơn hàng: <span className="font-mono text-[var(--foreground)]">{selected.orderNumber}</span> •
                  Lý do: <span className="text-[var(--foreground)]">{selected.reason}</span>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">✕</button>
            </div>

            {/* PRODUCT LIST FORM */}
            <div className="border rounded-xl overflow-hidden mt-4">
              <table className="w-full text-sm">
                <thead className="bg-[var(--muted)]/50">
                  <tr>
                    <th className="px-4 py-2 text-left">Sản phẩm</th>
                    <th className="px-4 py-2 text-center w-32">Yêu cầu</th>
                    <th className="px-4 py-2 text-center w-40">Quyết định</th>
                    <th className="px-4 py-2 text-center w-24">Chấp nhận</th>
                    <th className="px-4 py-2 text-right">Hoàn tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {selected.items.map(item => {
                    const decision = itemDecisions[item.orderItemId] || { status: 'APPROVED', acceptedQuantity: item.quantity };
                    return (
                      <tr key={item.orderItemId} className={decision.status === 'REJECTED' ? 'bg-red-50/50' : ''}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {item.productImage && <img src={item.productImage} className="w-10 h-10 rounded object-cover border" />}
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-xs text-[var(--muted-foreground)]">{item.unitPrice.toLocaleString()} ₫</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                        <td className="px-4 py-3">
                          <select
                            value={decision.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as ReturnStatus;
                              setItemDecisions(prev => ({
                                ...prev,
                                [item.orderItemId]: {
                                  ...prev[item.orderItemId],
                                  status: newStatus,
                                  acceptedQuantity: newStatus === 'REJECTED' ? 0 : item.quantity // Auto reset qty
                                }
                              }));
                            }}
                            className="w-full rounded border px-2 py-1 text-xs"
                          >
                            <option value="APPROVED">Duyệt</option>
                            <option value="REJECTED">Từ chối</option>
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            min={0}
                            max={item.quantity}
                            disabled={decision.status !== 'APPROVED'}
                            value={decision.acceptedQuantity}
                            onChange={(e) => {
                              const val = Math.min(item.quantity, Math.max(0, Number(e.target.value)));
                              setItemDecisions(prev => ({
                                ...prev,
                                [item.orderItemId]: { ...prev[item.orderItemId], acceptedQuantity: val }
                              }));
                            }}
                            className="w-16 rounded border px-2 py-1 text-center text-xs"
                          />
                        </td>
                        <td className="px-4 py-3 text-right font-semibold">
                          {decision.status === 'APPROVED'
                            ? (decision.acceptedQuantity * item.unitPrice).toLocaleString()
                            : 0} ₫
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* SUMMARY & ACTIONS */}
            <div className="flex flex-col md:flex-row gap-6 mt-6 pt-4 border-t border-[var(--border)]">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Ghi chú của Admin</label>
                  <textarea
                    className="w-full rounded-lg border border-[var(--border)] p-2 text-sm h-20"
                    placeholder="Nhập ghi chú hoặc lý do từ chối..."
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="restock-check"
                    type="checkbox"
                    checked={restock}
                    onChange={e => setRestock(e.target.checked)}
                    className="rounded border-[var(--border)] w-4 h-4"
                  />
                  <label htmlFor="restock-check" className="text-sm font-medium select-none cursor-pointer flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    Nhập kho lại các sản phẩm được duyệt
                  </label>
                </div>
              </div>

              <div className="w-full md:w-80 space-y-4 bg-[var(--muted)]/20 p-4 rounded-xl h-fit">
                <div className="flex justify-between text-sm">
                  <span>Tổng hoàn tiền dự kiến:</span>
                  <span className="font-bold text-lg text-[var(--primary)]">{estimatedRefund.toLocaleString()} ₫</span>
                </div>

                <button
                  onClick={handleSaveDetail}
                  disabled={detailUpdating}
                  className="w-full flex items-center justify-center gap-2 bg-[var(--primary)] text-white py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {detailUpdating ? 'Đang xử lý...' : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu & Cập nhật
                    </>
                  )}
                </button>
                <p className="text-xs text-[var(--muted-foreground)] text-center">
                  Hệ thống sẽ tự động chuyển trạng thái đơn hàng dựa trên các sản phẩm được duyệt.
                </p>
              </div>
            </div>

            {selected.evidenceUrls && selected.evidenceUrls.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-sm font-semibold mb-2">Hình ảnh bằng chứng</p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selected.evidenceUrls.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} className="h-20 w-auto rounded border hover:opacity-80 transition-opacity" />
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

