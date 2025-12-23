import { useEffect, useMemo, useState } from 'react';
import { adminLoginActivityService } from '../../services/adminLoginActivityService';
import type {
  AdminLoginActivityResponse,
  AdminLoginActivityStatsResponse,
} from '../../services/adminLoginActivityService';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { X, AlertTriangle, Shield, ShieldCheck } from 'lucide-react';

const AdminLoginActivities = () => {
  const [data, setData] = useState<{
    content: AdminLoginActivityResponse[];
    totalPages: number;
    number: number;
  }>({
    content: [],
    totalPages: 0,
    number: 0,
  });
  const [stats, setStats] = useState<AdminLoginActivityStatsResponse | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [loginSuccess, setLoginSuccess] = useState<boolean | undefined>(undefined);
  const [ipAddress, setIpAddress] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [loggingEnabled, setLoggingEnabled] = useState<boolean | null>(null);
  const [loggingToggleLoading, setLoggingToggleLoading] = useState(false);
  const debouncedUserId = useDebouncedValue(userId, 400);
  const debouncedIpAddress = useDebouncedValue(ipAddress, 400);
  const { toasts, showToast, removeToast } = useToast();

  const statTooltips: Record<string, string> = {
    totalLogins: 'Tổng số lượt đăng nhập (thành công + thất bại) theo bộ lọc hiện tại.',
    successfulLogins: 'Số lượt đăng nhập thành công.',
    failedLogins: 'Số lượt đăng nhập thất bại (mật khẩu sai hoặc không đủ quyền).',
    suspiciousActivities:
      'Hoạt động bị đánh dấu đáng ngờ: IP lạ hoặc nhiều lần đăng nhập thất bại trong thời gian ngắn.',
    uniqueUsers: 'Số người dùng khác nhau có hoạt động đăng nhập trong bộ lọc.',
    uniqueIPs: 'Số địa chỉ IP khác nhau được ghi nhận trong bộ lọc.',
  };

  const filters = useMemo(
    () => ({
      userId: debouncedUserId ? Number(debouncedUserId) : undefined,
      loginSuccess: loginSuccess,
      ipAddress: debouncedIpAddress || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      size: 20,
    }),
    [debouncedUserId, loginSuccess, debouncedIpAddress, startDate, endDate, page]
  );

  useEffect(() => {
    const fetchLoggingConfig = async () => {
      try {
        const res = await adminLoginActivityService.getLoggingConfig();
        setLoggingEnabled(res.enabled);
      } catch (err: any) {
        const message =
          err?.response?.data?.message || err?.message || 'Không thể tải cấu hình ghi log đăng nhập.';
        showToast(message, 'error');
      }
    };
    fetchLoggingConfig();
  }, [showToast]);

  const handleToggleLogging = async () => {
    if (loggingEnabled === null || loggingToggleLoading) return;
    try {
      setLoggingToggleLoading(true);
      const next = !loggingEnabled;
      const res = await adminLoginActivityService.updateLoggingConfig(next);
      setLoggingEnabled(res.enabled);
      showToast(
        res.enabled ? 'Đã bật ghi log hoạt động đăng nhập.' : 'Đã tắt ghi log hoạt động đăng nhập.',
        'success'
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || 'Không thể cập nhật cấu hình ghi log đăng nhập.';
      showToast(message, 'error');
    } finally {
      setLoggingToggleLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminLoginActivityService.getHistory(filters);
        setData({ content: res.content, totalPages: res.totalPages, number: res.number });
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Không thể tải lịch sử đăng nhập.';
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filters, showToast]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const res = await adminLoginActivityService.getStats({
          startDate: startDate || undefined,
          endDate: endDate || undefined,
        });
        setStats(res);
      } catch (err: any) {
        console.error('Không thể tải thống kê:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [startDate, endDate]);

  const handleClearFilters = () => {
    setUserId('');
    setLoginSuccess(undefined);
    setIpAddress('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Quản lý Hoạt động Đăng nhập</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted-foreground)]">Ghi log đăng nhập</span>
            <button
              type="button"
              onClick={handleToggleLogging}
              disabled={loggingEnabled === null || loggingToggleLoading}
              className={`relative inline-flex h-6 w-11 items-center rounded-full border px-0.5 transition-colors ${
                loggingEnabled
                  ? 'border-emerald-500 bg-emerald-500/90'
                  : 'border-[var(--border)] bg-[var(--muted)]'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                  loggingEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stats Section */}
        {statsLoading ? (
          <div className="mb-6 text-center text-sm text-[var(--muted-foreground)]">Đang tải thống kê...</div>
        ) : stats ? (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              title={statTooltips.totalLogins}
            >
              <div className="text-sm text-[var(--muted-foreground)]">Tổng số lần đăng nhập</div>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                {stats.totalLogins.toLocaleString('vi-VN')}
              </div>
            </div>
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              title={statTooltips.successfulLogins}
            >
              <div className="text-sm text-[var(--muted-foreground)]">Đăng nhập thành công</div>
              <div className="mt-1 text-2xl font-bold text-emerald-600">
                {stats.successfulLogins.toLocaleString('vi-VN')}
              </div>
            </div>
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              title={statTooltips.failedLogins}
            >
              <div className="text-sm text-[var(--muted-foreground)]">Đăng nhập thất bại</div>
              <div className="mt-1 text-2xl font-bold text-rose-600">
                {stats.failedLogins.toLocaleString('vi-VN')}
              </div>
            </div>
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              title={statTooltips.suspiciousActivities}
            >
              <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)]">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Hoạt động đáng ngờ
              </div>
              <div className="mt-1 text-2xl font-bold text-amber-600">
                {stats.suspiciousActivities.toLocaleString('vi-VN')}
              </div>
            </div>
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              title={statTooltips.uniqueUsers}
            >
              <div className="text-sm text-[var(--muted-foreground)]">Số user đã đăng nhập</div>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                {stats.uniqueUsers.toLocaleString('vi-VN')}
              </div>
            </div>
            <div
              className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4"
              title={statTooltips.uniqueIPs}
            >
              <div className="text-sm text-[var(--muted-foreground)]">Số IP khác nhau</div>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                {stats.uniqueIPs.toLocaleString('vi-VN')}
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="mb-4 rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Bộ lọc</h2>
            <button
              type="button"
              onClick={handleClearFilters}
              className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--muted)]"
            >
              <X className="h-4 w-4" />
              Xóa bộ lọc
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">User ID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Lọc theo User ID"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Trạng thái</label>
              <select
                value={loginSuccess === undefined ? '' : loginSuccess.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  setLoginSuccess(value === '' ? undefined : value === 'true');
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                <option value="">Tất cả</option>
                <option value="true">Thành công</option>
                <option value="false">Thất bại</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">IP Address</label>
              <input
                type="text"
                value={ipAddress}
                onChange={(e) => setIpAddress(e.target.value)}
                placeholder="Lọc theo IP"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Từ ngày</label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Đến ngày</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)]">
          {loading ? (
            <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Đang tải...</div>
          ) : data.content.length === 0 ? (
            <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">Không có dữ liệu.</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[var(--border)] bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">User</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">IP</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Thiết bị
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Vị trí
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Thời gian
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {data.content.map((activity) => (
                      <tr
                        key={activity.id}
                        className={`hover:bg-[var(--muted)]/50 ${
                          activity.suspicious ? 'bg-amber-50 dark:bg-amber-900/10' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">{activity.id}</td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                          <div>
                            <div className="font-medium">{activity.userFullName || 'N/A'}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{activity.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                          {activity.ipAddress || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {activity.deviceType || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {activity.location || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {activity.loginSuccess ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
                              <ShieldCheck className="h-3 w-3" />
                              Thành công
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700 border border-rose-200">
                              <Shield className="h-3 w-3" />
                              Thất bại
                            </span>
                          )}
                          {activity.suspicious && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                              <AlertTriangle className="h-3 w-3" />
                              Đáng ngờ
                            </div>
                          )}
                          {activity.failureReason && (
                            <div className="mt-1 text-xs text-[var(--muted-foreground)]">
                              {activity.failureReason}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {new Date(activity.createdAt).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="border-t border-[var(--border)] p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--muted-foreground)]">
                      Trang {data.number + 1} / {data.totalPages}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-50"
                      >
                        Trước
                      </button>
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                        disabled={page >= data.totalPages - 1}
                        className="rounded-lg border border-[var(--border)] px-3 py-1 text-sm disabled:opacity-50"
                      >
                        Sau
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminLoginActivities;

