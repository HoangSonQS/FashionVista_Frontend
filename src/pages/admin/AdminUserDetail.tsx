import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminUserService } from '../../services/adminUserService';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { ArrowLeft, Mail, Phone, Calendar, User, Gift, MapPin, ShoppingBag, Heart, Star, Activity } from 'lucide-react';

const AdminUserDetail = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'orders' | 'wishlist' | 'reviews' | 'loyalty' | 'activity'>('info');
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!userId) return;
    const fetchUserDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const detail = await adminUserService.getUserDetail(Number(userId));
        setUserDetail(detail);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Không thể tải thông tin người dùng.';
        setError(message);
        showToast(message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUserDetail();
  }, [userId, showToast]);

  const formatCurrency = (value: number) => value.toLocaleString('vi-VN') + '₫';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--muted-foreground)]">Đang tải...</p>
      </div>
    );
  }

  if (error || !userDetail) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại danh sách
        </button>
        <div className="rounded-xl border border-[var(--error)] bg-[var(--error-bg)] p-4 text-sm text-[var(--error-foreground)]">
          {error || 'Không tìm thấy người dùng.'}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'info', label: 'Thông tin', icon: User },
    { id: 'stats', label: 'Thống kê', icon: Activity },
    { id: 'orders', label: 'Đơn hàng', icon: ShoppingBag },
    { id: 'wishlist', label: 'Yêu thích', icon: Heart },
    { id: 'reviews', label: 'Đánh giá', icon: Star },
    { id: 'loyalty', label: 'Điểm thưởng', icon: Gift },
    { id: 'activity', label: 'Hoạt động', icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/users')}
            className="inline-flex items-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
              Chi tiết khách hàng
            </h1>
            <p className="text-sm text-[var(--muted-foreground)]">{userDetail.email}</p>
          </div>
        </div>
      </div>

      {/* Header Info Card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-start gap-6">
          <div className="h-20 w-20 rounded-full bg-[var(--muted)] flex items-center justify-center overflow-hidden">
            {userDetail.avatarUrl ? (
              <img src={userDetail.avatarUrl} alt={userDetail.fullName || 'Avatar'} className="w-full h-full object-cover" />
            ) : (
              <User className="h-10 w-10 text-[var(--muted-foreground)]" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold mb-2">{userDetail.fullName || 'Chưa có tên'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <Mail className="h-4 w-4" />
                {userDetail.email}
              </div>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <Phone className="h-4 w-4" />
                {userDetail.phoneNumber || 'N/A'}
              </div>
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <Calendar className="h-4 w-4" />
                {userDetail.dateOfBirth ? new Date(userDetail.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                  userDetail.tier === 'PLATINUM' ? 'bg-purple-100 text-purple-800' :
                  userDetail.tier === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                  userDetail.tier === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {userDetail.tier || 'BRONZE'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold mb-1">{formatCurrency(userDetail.totalSpent || 0)}</div>
            <div className="text-xs text-[var(--muted-foreground)]">Tổng chi tiêu</div>
            <div className="mt-2 text-sm">
              <span className="font-medium">{userDetail.totalOrders || 0}</span>
              <span className="text-[var(--muted-foreground)]"> đơn hàng</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--border)]">
        <div className="flex gap-2 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--primary)] text-[var(--primary)]'
                    : 'border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6">
        {activeTab === 'info' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <p className="text-sm">{userDetail.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Họ tên</label>
                <p className="text-sm">{userDetail.fullName || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <p className="text-sm">{userDetail.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Giới tính</label>
                <p className="text-sm">{userDetail.gender || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                <p className="text-sm">{userDetail.dateOfBirth ? new Date(userDetail.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Vai trò</label>
                <p className="text-sm">{userDetail.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Trạng thái</label>
                <p className="text-sm">{userDetail.status || (userDetail.active ? 'ACTIVE' : 'INACTIVE')}</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Xác thực email</label>
                <p className="text-sm">{userDetail.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'}</p>
              </div>
            </div>

            {userDetail.addresses && userDetail.addresses.length > 0 && (
              <div>
                <h4 className="text-md font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Địa chỉ giao hàng
                </h4>
                <div className="space-y-2">
                  {userDetail.addresses.map((addr: any) => (
                    <div key={addr.id} className="rounded-lg border border-[var(--border)] p-3 text-sm">
                      <div className="font-medium">{addr.fullName} - {addr.phone}</div>
                      <div className="text-[var(--muted-foreground)]">{addr.address}, {addr.ward}, {addr.district}, {addr.city}</div>
                      {addr.isDefault && (
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-[var(--primary)] text-[var(--primary-foreground)]">
                          Mặc định
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Thống kê</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Tổng đơn hàng</div>
                <div className="text-2xl font-semibold">{userDetail.totalOrders || 0}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Tổng chi tiêu</div>
                <div className="text-2xl font-semibold">{formatCurrency(userDetail.totalSpent || 0)}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Đơn hàng trung bình</div>
                <div className="text-2xl font-semibold">{formatCurrency(userDetail.averageOrderValue || 0)}</div>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Điểm thưởng</div>
                <div className="text-2xl font-semibold">{userDetail.loyaltyPoints || 0}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Lần đăng nhập gần nhất</div>
                <div className="text-sm">
                  {userDetail.lastLoginAt ? new Date(userDetail.lastLoginAt).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                </div>
              </div>
              <div className="rounded-lg border border-[var(--border)] p-4">
                <div className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Ngày kể từ lần mua cuối</div>
                <div className="text-sm">
                  {userDetail.daysSinceLastPurchase !== null ? `${userDetail.daysSinceLastPurchase} ngày` : 'Chưa có đơn hàng'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lịch sử đơn hàng</h3>
            {userDetail.recentOrders && userDetail.recentOrders.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Mã đơn</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Trạng thái</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Số lượng</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Tổng tiền</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {userDetail.recentOrders.map((order: any) => (
                      <tr key={order.id} className="hover:bg-[var(--muted)]/50">
                        <td className="px-4 py-2 text-sm font-medium">{order.orderNumber}</td>
                        <td className="px-4 py-2 text-sm">{order.status}</td>
                        <td className="px-4 py-2 text-sm">{order.itemCount}</td>
                        <td className="px-4 py-2 text-sm font-semibold">{formatCurrency(order.total)}</td>
                        <td className="px-4 py-2 text-sm text-[var(--muted-foreground)]">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Chưa có đơn hàng nào.</p>
            )}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Sản phẩm yêu thích</h3>
            {userDetail.wishlist && userDetail.wishlist.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userDetail.wishlist.map((item: any) => (
                  <div key={item.id} className="rounded-lg border border-[var(--border)] p-4">
                    {item.productImage && (
                      <img src={item.productImage} alt={item.productName} className="w-full h-32 object-cover rounded mb-2" />
                    )}
                    <div className="font-medium text-sm mb-1">{item.productName}</div>
                    <div className="text-sm font-semibold text-[var(--primary)]">{formatCurrency(item.price)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Chưa có sản phẩm yêu thích nào.</p>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lịch sử đánh giá</h3>
            {userDetail.reviews && userDetail.reviews.length > 0 ? (
              <div className="space-y-3">
                {userDetail.reviews.map((review: any) => (
                  <div key={review.id} className="rounded-lg border border-[var(--border)] p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="font-medium text-sm">{review.productName}</div>
                        <div className="text-xs text-[var(--muted-foreground)]">{review.productSlug}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-[var(--muted-foreground)]">{review.comment}</p>}
                    <div className="text-xs text-[var(--muted-foreground)] mt-2">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Chưa có đánh giá nào.</p>
            )}
          </div>
        )}

        {activeTab === 'loyalty' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Điểm thưởng</h3>
              <div className="text-2xl font-semibold text-[var(--primary)]">{userDetail.loyaltyPoints || 0} điểm</div>
            </div>
            {userDetail.loyaltyHistory && userDetail.loyaltyHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Ngày</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Điểm</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Số dư sau</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Loại</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Mô tả</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {userDetail.loyaltyHistory.map((history: any) => (
                      <tr key={history.id} className="hover:bg-[var(--muted)]/50">
                        <td className="px-4 py-2 text-sm">{new Date(history.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className={`px-4 py-2 text-sm font-medium ${history.points >= 0 ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                          {history.points >= 0 ? '+' : ''}{history.points}
                        </td>
                        <td className="px-4 py-2 text-sm">{history.balanceAfter}</td>
                        <td className="px-4 py-2 text-sm">{history.transactionType}</td>
                        <td className="px-4 py-2 text-sm text-[var(--muted-foreground)]">{history.description || history.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Chưa có lịch sử điểm thưởng.</p>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Lịch sử đăng nhập</h3>
            {userDetail.loginHistory && userDetail.loginHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Thời gian</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">IP Address</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Thiết bị</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Vị trí</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {userDetail.loginHistory.map((activity: any) => (
                      <tr key={activity.id} className="hover:bg-[var(--muted)]/50">
                        <td className="px-4 py-2 text-sm">{new Date(activity.createdAt).toLocaleString('vi-VN')}</td>
                        <td className="px-4 py-2 text-sm font-mono text-xs">{activity.ipAddress || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm">{activity.deviceType || 'N/A'}</td>
                        <td className="px-4 py-2 text-sm text-[var(--muted-foreground)]">{activity.location || 'N/A'}</td>
                        <td className="px-4 py-2">
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            activity.loginSuccess
                              ? 'bg-[var(--success-bg)] text-[var(--success-foreground)]'
                              : 'bg-[var(--error-bg)] text-[var(--error-foreground)]'
                          }`}>
                            {activity.loginSuccess ? 'Thành công' : activity.failureReason || 'Thất bại'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted-foreground)]">Chưa có lịch sử đăng nhập.</p>
            )}
          </div>
        )}
      </div>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default AdminUserDetail;

