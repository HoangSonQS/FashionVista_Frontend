import { useEffect, useState } from 'react';
import { shippingFeeConfigService } from '../../services/shippingFeeConfigService';
import type { ShippingFeeConfig, ShippingFeeConfigUpdateRequest } from '../../types/shipping';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';

const METHOD_LABELS: Record<string, string> = {
  STANDARD: 'Tiêu chuẩn (GHN / GHTK)',
  FAST: 'Nhanh',
  EXPRESS: 'Express',
};

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

export default function AdminShippingFeeConfig() {
  const [configs, setConfigs] = useState<ShippingFeeConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<ShippingFeeConfigUpdateRequest>({
    baseFee: 0,
    freeShippingThreshold: 0,
  });
  const [saving, setSaving] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    void loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const data = await shippingFeeConfigService.adminGetAll();
      setConfigs(data);
    } catch (error) {
      showToast('Không thể tải cấu hình phí vận chuyển', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (config: ShippingFeeConfig) => {
    setEditingId(config.id);
    setFormData({
      baseFee: config.baseFee,
      freeShippingThreshold: config.freeShippingThreshold,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ baseFee: 0, freeShippingThreshold: 0 });
  };

  const handleSave = async (id: number) => {
    if (formData.baseFee < 0 || formData.freeShippingThreshold < 0) {
      showToast('Giá trị phải >= 0', 'error');
      return;
    }

    try {
      setSaving(true);
      const updated = await shippingFeeConfigService.adminUpdate(id, formData);
      setConfigs((prev) => prev.map((c) => (c.id === id ? updated : c)));
      setEditingId(null);
      showToast('Cập nhật phí vận chuyển thành công', 'success');
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Không thể cập nhật phí vận chuyển', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Quản lý phí vận chuyển</h1>
        <p className="text-[var(--muted-foreground)]">
          Cấu hình phí vận chuyển cho các phương thức vận chuyển
        </p>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--muted)]/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Phương thức</th>
                <th className="px-4 py-3 text-left font-medium">Phí cơ bản</th>
                <th className="px-4 py-3 text-left font-medium">Ngưỡng miễn phí</th>
                <th className="px-4 py-3 text-right font-medium">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((config) => (
                <tr key={config.id} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3">
                    <span className="font-medium">{METHOD_LABELS[config.method] || config.method}</span>
                  </td>
                  <td className="px-4 py-3">
                    {editingId === config.id ? (
                      <input
                        type="number"
                        value={formData.baseFee}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, baseFee: Number(e.target.value) }))
                        }
                        className="w-full px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)]"
                        min="0"
                        step="1000"
                      />
                    ) : (
                      <span>{formatCurrency(config.baseFee)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === config.id ? (
                      <input
                        type="number"
                        value={formData.freeShippingThreshold}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            freeShippingThreshold: Number(e.target.value),
                          }))
                        }
                        className="w-full px-2 py-1 border border-[var(--border)] rounded bg-[var(--background)]"
                        min="0"
                        step="10000"
                      />
                    ) : (
                      <span>{formatCurrency(config.freeShippingThreshold)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingId === config.id ? (
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleSave(config.id)}
                          disabled={saving}
                          className="px-3 py-1 bg-[var(--primary)] text-white rounded hover:opacity-90 disabled:opacity-50"
                        >
                          {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={saving}
                          className="px-3 py-1 border border-[var(--border)] rounded hover:bg-[var(--muted)] disabled:opacity-50"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(config)}
                        className="px-3 py-1 bg-[var(--primary)] text-white rounded hover:opacity-90"
                      >
                        Sửa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}

