import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminUserService, type AdminUserListResponse, type UpdateUserStatusRequest, type UpdateUserRoleRequest } from '../../services/adminUserService';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { Download } from 'lucide-react';

const roleOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Khách hàng', value: 'CUSTOMER' },
  { label: 'Quản trị viên', value: 'ADMIN' },
];

const activeOptions = [
  { label: 'Tất cả', value: '' },
  { label: 'Đang hoạt động', value: 'true' },
  { label: 'Đã khóa', value: 'false' },
];

const AdminUsers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [active, setActive] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ content: AdminUserListResponse[]; totalElements: number; totalPages: number; number: number; size: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [updatingRoleId, setUpdatingRoleId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  const { toasts, showToast, removeToast } = useToast();

  // Lấy current admin ID từ localStorage
  const currentAdminId = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem('adminAuth');
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as { user?: { id?: number | string } };
      return parsed?.user?.id ? Number(parsed.user.id) : null;
    } catch {
      return null;
    }
  }, []);

  const filters = useMemo(
    () => ({
      search: search.trim() || undefined,
      role: role || undefined,
      active: active !== '' ? active === 'true' : undefined,
      page,
      size: 20,
      sortBy: 'createdAt',
      sortDir: 'DESC' as const,
    }),
    [search, role, active, page],
  );

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminUserService.getAllUsers(filters);
        setData(response);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers().catch(() => {
      const message = 'Không thể tải danh sách người dùng.';
      setError(message);
      showToast(message, 'error');
    });
  }, [filters, showToast]);

  const handleToggleStatus = async (user: AdminUserListResponse) => {
    try {
      setUpdatingId(user.id);
      const request: UpdateUserStatusRequest = {
        active: !user.active,
      };
      await adminUserService.updateUserStatus(user.id, request);
      showToast(user.active ? 'Đã khóa tài khoản.' : 'Đã mở khóa tài khoản.', 'success');
      // Refresh data
      const response = await adminUserService.getAllUsers(filters);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái.';
      showToast(message, 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRoleChange = async (user: AdminUserListResponse, newRole: string) => {
    if (newRole === user.role) return;
    try {
      setUpdatingRoleId(user.id);
      const request: UpdateUserRoleRequest = {
        role: newRole,
      };
      await adminUserService.updateUserRole(user.id, request);
      showToast('Đã cập nhật vai trò.', 'success');
      // Refresh data
      const response = await adminUserService.getAllUsers(filters);
      setData(response);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể cập nhật vai trò.';
      showToast(message, 'error');
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const blob = await adminUserService.exportUsers(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showToast('Đã xuất file CSV thành công.', 'success');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể xuất file.';
      showToast(message, 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Quản lý người dùng
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Theo dõi và quản lý tất cả người dùng trong hệ thống.</p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-2 text-sm font-medium hover:bg-[var(--muted)] transition-colors disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          {exporting ? 'Đang xuất...' : 'Xuất CSV'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="search"
          placeholder="Tìm theo email, tên, số điện thoại..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {roleOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={active}
          onChange={(e) => {
            setActive(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          {activeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error)]">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center py-8 text-[var(--muted-foreground)]">Đang tải...</div>
      )}

      {!loading && data && (
        <>
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--muted)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Họ tên
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Số điện thoại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Vai trò
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Số đơn hàng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted-foreground)]">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data.content.map((user) => (
                    <tr key={user.id} className="hover:bg-[var(--muted)]/50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium">{user.email}</td>
                      <td className="px-4 py-3 text-sm">{user.fullName || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{user.phoneNumber || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                          disabled={updatingRoleId === user.id || (currentAdminId !== null && user.id === currentAdminId)}
                          className={`rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-2 py-1 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed ${
                            user.role === 'ADMIN' ? 'bg-[var(--warning-bg)] text-[var(--warning)]' : 'bg-[var(--muted)] text-[var(--muted-foreground)]'
                          }`}
                          title={currentAdminId !== null && user.id === currentAdminId ? 'Bạn không thể thay đổi vai trò của chính mình' : ''}
                        >
                          {roleOptions.filter((opt) => opt.value !== '').map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            user.active
                              ? 'bg-[var(--success-bg)] text-[var(--success)]'
                              : 'bg-[var(--error-bg)] text-[var(--error)]'
                          }`}
                        >
                          {user.active ? 'Đang hoạt động' : 'Đã khóa'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{user.orderCount}</td>
                      <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${user.id}/detail`)}
                            className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-1.5 text-xs font-medium hover:bg-[var(--muted)] transition-colors"
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            disabled={updatingId === user.id}
                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
                              user.active
                                ? 'border-[var(--error)] bg-[var(--error-bg)] text-[var(--error-foreground)] hover:bg-[var(--error-bg)]/80'
                                : 'border-[var(--success)] bg-[var(--success-bg)] text-[var(--success-foreground)] hover:bg-[var(--success-bg)]/80'
                            }`}
                          >
                            {updatingId === user.id ? 'Đang xử lý...' : user.active ? 'Khóa' : 'Mở khóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
              <span>
                Trang {data.number + 1}/{data.totalPages} ({data.totalElements} người dùng)
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={data.number === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={data.number + 1 >= data.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-[var(--border)] px-3 py-1.5 disabled:opacity-40 hover:bg-[var(--muted)] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminUsers;

