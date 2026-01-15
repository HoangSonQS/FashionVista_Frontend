import { useEffect, useState } from 'react';
import { adminCartService } from '../../services/adminCartService';
import type { AdminCartListResponse } from '../../types/adminCart';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useToast } from '../../hooks/useToast';
import { Mail, ShoppingCart, User as UserIcon, Eye } from 'lucide-react';
import AdminCartDetailModal from './components/AdminCartDetailModal';

const AdminCarts = () => {
    const { showToast } = useToast();
    const [carts, setCarts] = useState<AdminCartListResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState<'ALL' | 'ACTIVE' | 'ABANDONED'>('ALL');
    const [selectedCart, setSelectedCart] = useState<AdminCartListResponse | null>(null);

    const debouncedSearch = useDebouncedValue(search, 500);

    const fetchCarts = async () => {
        try {
            setLoading(true);
            const isAbandoned = filterType === 'ALL' ? undefined : filterType === 'ABANDONED';

            const res = await adminCartService.getAdminCarts({
                page,
                size: 10,
                search: debouncedSearch,
                isAbandoned
            });

            setCarts(res.content);
            setTotalPages(res.totalPages);
        } catch {
            showToast('Không thể tải danh sách giỏ hàng', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCarts();
    }, [page, debouncedSearch, filterType]);

    const handleRemind = async (id: number) => {
        if (!window.confirm('Gửi email nhắc nhở cho giỏ hàng này?')) return;
        try {
            await adminCartService.sendReminder(id);
            showToast('Đã gửi email nhắc nhở', 'success');
        } catch (error) {
            showToast('Gửi email thất bại', 'error');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN');
    };

    return (
        <div className="p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Quản lý Giỏ hàng</h1>
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setFilterType('ALL'); setPage(0); }}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterType === 'ALL'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Tất cả
                        </button>
                        <button
                            onClick={() => { setFilterType('ACTIVE'); setPage(0); }}
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterType === 'ACTIVE'
                                ? 'bg-green-600 text-white shadow-md shadow-green-200'
                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            Đang hoạt động
                        </button>
                        <div className="relative group">
                            <button
                                onClick={() => { setFilterType('ABANDONED'); setPage(0); }}
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${filterType === 'ABANDONED'
                                    ? 'bg-red-600 text-white shadow-md shadow-red-200'
                                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                Bỏ quên
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                        * "Bỏ quên": Giỏ hàng không được cập nhật trong 24 giờ qua.
                    </p>
                </div>
            </div>

            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo email, tên user..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full max-w-md rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                />
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-500">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-700">
                            <tr>
                                <th className="px-6 py-4">Giỏ hàng / User</th>
                                <th className="px-6 py-4">Số lượng</th>
                                <th className="px-6 py-4">Tổng trị giá</th>
                                <th className="px-6 py-4">Cập nhật cuối</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">Đang tải...</td>
                                </tr>
                            ) : carts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-8 text-center text-gray-500">Không tìm thấy giỏ hàng nào.</td>
                                </tr>
                            ) : (
                                carts.map((cart) => (
                                    <tr key={cart.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                    {cart.userId ? <UserIcon size={20} /> : <ShoppingCart size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{cart.userName}</p>
                                                    <p className="text-xs text-gray-500">{cart.userEmail || 'Guest'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium">{cart.itemsCount} sản phẩm</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{formatCurrency(cart.totalValue)}</td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <p>{formatDate(cart.updatedAt)}</p>
                                            <p className="text-xs">Tạo: {formatDate(cart.createdAt)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium \${
                        cart.isAbandoned 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                                                {cart.isAbandoned ? 'Đã bỏ quên' : 'Đang hoạt động'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedCart(cart)}
                                                    className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                >
                                                    <Eye size={14} />
                                                    Xem
                                                </button>
                                                {cart.isAbandoned && cart.userEmail && (
                                                    <button
                                                        onClick={() => handleRemind(cart.id)}
                                                        className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                                                    >
                                                        <Mail size={14} />
                                                        Nhắc nhở
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Trước
                        </button>
                        <span className="text-sm text-gray-700">
                            Trang {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {selectedCart && (
                <AdminCartDetailModal
                    cart={selectedCart}
                    onClose={() => setSelectedCart(null)}
                />
            )}
        </div>
    );
};

export default AdminCarts;
