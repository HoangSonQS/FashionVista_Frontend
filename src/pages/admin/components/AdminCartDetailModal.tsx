import { useEffect, useState } from 'react';
import { X, User, Package } from 'lucide-react';
import { adminCartService } from './../../../services/adminCartService';
import type { CartResponse } from './../../../types/cart';
import type { AdminCartListResponse } from './../../../types/adminCart';

interface AdminCartDetailModalProps {
    cart: AdminCartListResponse | null;
    onClose: () => void;
}

const AdminCartDetailModal = ({ cart, onClose }: AdminCartDetailModalProps) => {
    const [detail, setDetail] = useState<CartResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (cart) {
            fetchDetail();
        }
    }, [cart]);

    const fetchDetail = async () => {
        if (!cart) return;
        setLoading(true);
        setError('');
        try {
            const data = await adminCartService.getCartDetail(cart.id);
            setDetail(data);
        } catch (err) {
            console.error(err);
            setError('Không thể tải chi tiết giỏ hàng');
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    if (!cart) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-100 p-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">Chi tiết giỏ hàng #{cart.id}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                            Cập nhật lần cuối: {new Date(cart.updatedAt).toLocaleString('vi-VN')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="max-h-[80vh] overflow-y-auto p-6">
                    {/* User Info Section */}
                    <div className="mb-8 rounded-lg border border-gray-100 bg-gray-50 p-4">
                        <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase text-gray-600">
                            <User size={16} /> Thông tin khách hàng
                        </h4>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <p className="text-xs text-gray-500">Tên khách hàng</p>
                                <p className="font-medium text-gray-900">{cart.userName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{cart.userEmail || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Session ID</p>
                                <p className="font-medium text-gray-900 font-mono text-xs">{cart.sessionId || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Trạng thái</p>
                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cart.isAbandoned ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {cart.isAbandoned ? 'Bỏ quên' : 'Đang hoạt động'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex h-40 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : error ? (
                        <div className="rounded-lg bg-red-50 p-4 text-center text-red-600">
                            {error}
                        </div>
                    ) : detail ? (
                        <>
                            {/* Items List */}
                            <h4 className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase text-gray-600">
                                <Package size={16} /> Danh sách sản phẩm
                            </h4>
                            <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">Sản phẩm</th>
                                            <th className="px-4 py-3 font-medium text-center">Đơn giá</th>
                                            <th className="px-4 py-3 font-medium text-center">Số lượng</th>
                                            <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {detail.items.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        {item.thumbnailUrl && (
                                                            <img
                                                                src={item.thumbnailUrl}
                                                                alt={item.productName}
                                                                className="h-12 w-12 rounded object-cover border border-gray-200"
                                                            />
                                                        )}
                                                        <div>
                                                            <p className="font-medium text-gray-900 line-clamp-2">{item.productName}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {item.size && `Size: ${item.size}`}
                                                                {item.size && item.color && ' - '}
                                                                {item.color && `Màu: ${item.color}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">{formatCurrency(item.unitPrice)}</td>
                                                <td className="px-4 py-3 text-center font-medium">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(item.subtotal)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Summary */}
                            <div className="flex justify-end">
                                <div className="w-full max-w-xs space-y-2 rounded-lg bg-gray-50 p-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Tạm tính:</span>
                                        <span className="font-medium">{formatCurrency(detail.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Phí vận chuyển:</span>
                                        <span className="font-medium">{formatCurrency(detail.shippingFee)}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-bold text-gray-900">
                                        <span>Tổng cộng:</span>
                                        <span>{formatCurrency(detail.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center text-gray-500 py-8">Không có dữ liệu chi tiết</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminCartDetailModal;
