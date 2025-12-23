import { useEffect, useMemo, useState, useRef } from 'react';
import { adminLoyaltyPointService } from '../../services/adminLoyaltyPointService';
import type {
  AdminLoyaltyPointHistoryResponse,
  AdminLoyaltyPointStatsResponse,
  AdjustLoyaltyPointsRequest,
} from '../../services/adminLoyaltyPointService';
import { adminUserService, type AdminUserListResponse } from '../../services/adminUserService';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { Plus, Minus, TrendingUp, X, Search } from 'lucide-react';

const TRANSACTION_TYPES: { label: string; value: string }[] = [
  { label: 'Tất cả', value: '' },
  { label: 'Tích điểm', value: 'EARNED' },
  { label: 'Tiêu điểm', value: 'SPENT' },
  { label: 'Điều chỉnh thủ công', value: 'MANUAL_ADJUST' },
  { label: 'Hết hạn', value: 'EXPIRED' },
];

const TIER_LABELS: Record<string, string> = {
  BRONZE: 'Đồng',
  SILVER: 'Bạc',
  GOLD: 'Vàng',
  PLATINUM: 'Bạch kim',
};

const AdminLoyaltyPoints = () => {
  const [data, setData] = useState<{
    content: AdminLoyaltyPointHistoryResponse[];
    totalPages: number;
    number: number;
  }>({
    content: [],
    totalPages: 0,
    number: 0,
  });
  const [stats, setStats] = useState<AdminLoyaltyPointStatsResponse | null>(null);
  const [userId, setUserId] = useState<number | undefined>(undefined);
  const [transactionType, setTransactionType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustForm, setAdjustForm] = useState<{ userId: number; points: number; description: string }>({
    userId: 0,
    points: 0,
    description: '',
  });
  const [userSearch, setUserSearch] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<AdminUserListResponse[]>([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserListResponse | null>(null);
  const userSearchDebounced = useDebouncedValue(userSearch, 300);
  const userSearchRef = useRef<HTMLDivElement>(null);
  const { toasts, showToast, removeToast } = useToast();

  const filters = useMemo(
    () => ({
      userId: userId,
      transactionType: transactionType || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      page,
      size: 20,
    }),
    [userId, transactionType, startDate, endDate, page]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminLoyaltyPointService.getHistory(filters);
        setData({ content: res.content, totalPages: res.totalPages, number: res.number });
      } catch (err: any) {
        const message = err?.response?.data?.message || err?.message || 'Không thể tải lịch sử điểm.';
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
        const res = await adminLoyaltyPointService.getStats();
        setStats(res);
      } catch (err: any) {
        console.error('Không thể tải thống kê:', err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Search users for adjust form
  useEffect(() => {
    const searchUsers = async () => {
      if (!userSearchDebounced || userSearchDebounced.trim().length < 2) {
        setUserSearchResults([]);
        return;
      }

      try {
        setSearchingUsers(true);
        const res = await adminUserService.getAllUsers({
          search: userSearchDebounced,
          page: 0,
          size: 10,
        });
        setUserSearchResults(res.content);
        setShowUserDropdown(true);
      } catch (err: any) {
        console.error('Không thể tìm kiếm user:', err);
        setUserSearchResults([]);
      } finally {
        setSearchingUsers(false);
      }
    };

    searchUsers();
  }, [userSearchDebounced]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showUserDropdown) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(event.target as Node)) {
        setShowUserDropdown(false);
      }
    };

    // Use capture phase to catch events before they bubble
    document.addEventListener('mousedown', handleClickOutside, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showUserDropdown]);

  const handleClearFilters = () => {
    setUserId(undefined);
    setTransactionType('');
    setStartDate('');
    setEndDate('');
    setPage(0);
  };

  const handleSelectUser = (user: AdminUserListResponse) => {
    setSelectedUser(user);
    setAdjustForm((prev) => ({ ...prev, userId: user.id }));
    setUserSearch(`${user.fullName || 'N/A'} (${user.email})`);
    setShowUserDropdown(false);
    setUserSearchResults([]);
  };

  const resetAdjustModal = () => {
    setAdjustForm({ userId: 0, points: 0, description: '' });
    setUserSearch('');
    setUserSearchResults([]);
    setShowUserDropdown(false);
    setSelectedUser(null);
  };

  const handleAdjust = async () => {
    if (!adjustForm.userId || adjustForm.points === 0) {
      showToast('Vui lòng nhập đầy đủ thông tin.', 'error');
      return;
    }

    try {
      setAdjusting(true);
      const request: AdjustLoyaltyPointsRequest = {
        userId: adjustForm.userId,
        points: adjustForm.points,
        description: adjustForm.description || undefined,
      };
      await adminLoyaltyPointService.adjustPoints(request);
      showToast('Đã điều chỉnh điểm thành công.', 'success');
      setShowAdjustModal(false);
      resetAdjustModal();
      // Refresh data
      const res = await adminLoyaltyPointService.getHistory(filters);
      setData({ content: res.content, totalPages: res.totalPages, number: res.number });
      const statsRes = await adminLoyaltyPointService.getStats();
      setStats(statsRes);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Không thể điều chỉnh điểm.';
      showToast(message, 'error');
    } finally {
      setAdjusting(false);
    }
  };

  const renderTransactionType = (type: string) => {
    const labels: Record<string, { label: string; color: string }> = {
      EARNED: { label: 'Tích điểm', color: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
      SPENT: { label: 'Tiêu điểm', color: 'bg-rose-100 text-rose-700 border border-rose-200' },
      MANUAL_ADJUST: { label: 'Điều chỉnh', color: 'bg-blue-100 text-blue-700 border border-blue-200' },
      EXPIRED: { label: 'Hết hạn', color: 'bg-gray-100 text-gray-700 border border-gray-200' },
    };
    const info = labels[type] || { label: type, color: 'bg-gray-100 text-gray-700 border border-gray-200' };
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${info.color}`}>
        {info.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--background)] p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Quản lý Điểm Thân thiết</h1>
          <button
            type="button"
            onClick={() => {
              resetAdjustModal();
              setShowAdjustModal(true);
            }}
            className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Điều chỉnh điểm
          </button>
        </div>

        {/* Stats Section */}
        {statsLoading ? (
          <div className="mb-6 text-center text-sm text-[var(--muted-foreground)]">Đang tải thống kê...</div>
        ) : stats ? (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-sm text-[var(--muted-foreground)]">Tổng số user</div>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.totalUsers}</div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-sm text-[var(--muted-foreground)]">Tổng điểm</div>
              <div className="mt-1 text-2xl font-bold text-[var(--foreground)]">
                {stats.totalPoints.toLocaleString('vi-VN')}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-sm text-[var(--muted-foreground)]">Điểm theo tier</div>
              <div className="mt-2 space-y-1">
                {Object.entries(stats.pointsByTier).map(([tier, points]) => (
                  <div key={tier} className="flex justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">{TIER_LABELS[tier] || tier}:</span>
                    <span className="font-medium text-[var(--foreground)]">{points.toLocaleString('vi-VN')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4">
              <div className="text-sm text-[var(--muted-foreground)]">User theo tier</div>
              <div className="mt-2 space-y-1">
                {Object.entries(stats.usersByTier).map(([tier, count]) => (
                  <div key={tier} className="flex justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">{TIER_LABELS[tier] || tier}:</span>
                    <span className="font-medium text-[var(--foreground)]">{count}</span>
                  </div>
                ))}
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
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">User ID</label>
              <input
                type="number"
                value={userId || ''}
                onChange={(e) => setUserId(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="Lọc theo User ID"
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Loại giao dịch</label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
              >
                {TRANSACTION_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Điểm</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Số dư sau
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Loại</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">Nguồn</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Mô tả
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Thời gian
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--muted-foreground)]">
                        Admin
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {data.content.map((h) => (
                      <tr key={h.id} className="hover:bg-[var(--muted)]/50">
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">{h.id}</td>
                        <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                          <div>
                            <div className="font-medium">{h.userFullName || 'N/A'}</div>
                            <div className="text-xs text-[var(--muted-foreground)]">{h.userEmail}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={h.points > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                            {h.points > 0 ? '+' : ''}
                            {h.points.toLocaleString('vi-VN')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[var(--foreground)]">
                          {h.balanceAfter.toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-sm">{renderTransactionType(h.transactionType)}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">{h.source || 'N/A'}</td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {h.description || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {new Date(h.createdAt).toLocaleString('vi-VN')}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted-foreground)]">
                          {h.createdByName || 'Hệ thống'}
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

        {/* Adjust Modal */}
        {showAdjustModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
              <h2 className="mb-4 text-lg font-bold text-[var(--foreground)]">Điều chỉnh điểm</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Tìm user *</label>
                  <div className="relative" ref={userSearchRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
                      <input
                        type="text"
                        value={userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          if (e.target.value === '') {
                            setAdjustForm({ ...adjustForm, userId: 0 });
                            setUserSearchResults([]);
                            setSelectedUser(null);
                          }
                        }}
                        onFocus={() => {
                          if (userSearchResults.length > 0) {
                            setShowUserDropdown(true);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && userSearchResults.length > 0 && !selectedUser) {
                            e.preventDefault();
                            // Chọn user đầu tiên
                            handleSelectUser(userSearchResults[0]);
                          } else if (e.key === 'Escape') {
                            setShowUserDropdown(false);
                          }
                        }}
                        placeholder="Nhập ID, tên hoặc email user... (Enter để chọn user đầu tiên)"
                        className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 py-2 text-sm"
                      />
                    </div>
                    {showUserDropdown && userSearchResults.length > 0 && (
                      <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-[var(--border)] bg-[var(--card)] shadow-lg">
                        {userSearchResults.map((user, index) => (
                          <div
                            key={user.id}
                            role="button"
                            tabIndex={0}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Select immediately on mousedown
                              handleSelectUser(user);
                            }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectUser(user);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleSelectUser(user);
                              }
                            }}
                            className={`w-full cursor-pointer px-4 py-2 text-left transition-colors ${
                              index === 0 ? 'bg-[var(--muted)]/50' : ''
                            } hover:bg-[var(--muted)]`}
                          >
                            <div className="font-medium text-[var(--foreground)]">
                              {user.fullName || 'N/A'} (ID: {user.id})
                              {index === 0 && (
                                <span className="ml-2 text-xs text-[var(--muted-foreground)]">(Nhấn Enter)</span>
                              )}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">{user.email}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    {searchingUsers && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">
                        Đang tìm...
                      </div>
                    )}
                    {selectedUser && (
                      <div className="mt-2 rounded-lg border border-[var(--border)] bg-[var(--muted)]/30 p-3">
                        <div className="text-sm font-medium text-[var(--foreground)]">User đã chọn:</div>
                        <div className="mt-1 text-sm text-[var(--foreground)]">
                          <div className="font-semibold">{selectedUser.fullName || 'N/A'}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">{selectedUser.email}</div>
                          <div className="text-xs text-[var(--muted-foreground)]">ID: {selectedUser.id}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedUser(null);
                            setAdjustForm((prev) => ({ ...prev, userId: 0 }));
                            setUserSearch('');
                          }}
                          className="mt-2 text-xs text-[var(--error)] hover:underline"
                        >
                          Xóa chọn
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Số điểm *</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustForm({ ...adjustForm, points: Math.abs(adjustForm.points) })}
                      className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 hover:bg-emerald-100"
                    >
                      <Plus className="h-4 w-4" />
                      Cộng
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustForm({ ...adjustForm, points: -Math.abs(adjustForm.points) })}
                      className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 hover:bg-rose-100"
                    >
                      <Minus className="h-4 w-4" />
                      Trừ
                    </button>
                  </div>
                  <input
                    type="number"
                    value={adjustForm.points || ''}
                    onChange={(e) => setAdjustForm({ ...adjustForm, points: Number(e.target.value) })}
                    className="mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    placeholder="Nhập số điểm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-[var(--foreground)]">Mô tả</label>
                  <textarea
                    value={adjustForm.description}
                    onChange={(e) => setAdjustForm({ ...adjustForm, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm"
                    placeholder="Lý do điều chỉnh điểm..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    resetAdjustModal();
                  }}
                  className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleAdjust}
                  disabled={adjusting}
                  className="rounded-lg bg-[var(--primary)] px-4 py-2 text-sm text-white disabled:opacity-50"
                >
                  {adjusting ? 'Đang xử lý...' : 'Xác nhận'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminLoyaltyPoints;

