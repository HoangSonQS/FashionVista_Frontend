import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { adminUserService, type CreateUserRequest } from '../../../services/adminUserService';
import { useToast } from '../../../hooks/useToast';

interface AdminCreateUserModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AdminCreateUserModal = ({ onClose, onSuccess }: AdminCreateUserModalProps) => {
    const [formData, setFormData] = useState<CreateUserRequest>({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        role: 'CUSTOMER',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminUserService.createUser(formData);
            showToast('Đã tạo tài khoản thành công.', 'success');
            onSuccess();
            onClose();
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Không thể tạo tài khoản.';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] px-4"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-[var(--card)] shadow-2xl border border-[var(--border)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
                    <h2 className="text-lg font-semibold">Thêm tài khoản mới</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 hover:bg-[var(--muted)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Email <span className="text-[var(--error)]">*</span></label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="example@fashionvista.com"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Mật khẩu <span className="text-[var(--error)]">*</span></label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] pr-10"
                                placeholder="Ít nhất 6 ký tự"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Họ và tên <span className="text-[var(--error)]">*</span></label>
                        <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="Nguyễn Văn A"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Số điện thoại</label>
                        <input
                            type="tel"
                            value={formData.phoneNumber || ''}
                            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                            placeholder="0912345678"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Vai trò <span className="text-[var(--error)]">*</span></label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'CUSTOMER' | 'ADMIN' | 'STAFF' })}
                            className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                        >
                            <option value="CUSTOMER">Khách hàng (CUSTOMER)</option>
                            <option value="STAFF">Nhân viên (STAFF)</option>
                            <option value="ADMIN">Quản trị viên (ADMIN)</option>
                        </select>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            ADMIN: Toàn quyền hệ thống. STAFF: Giới hạn (tùy config). CUSTOMER: Người mua hàng.
                        </p>
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold hover:bg-[var(--muted)] transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Đang tạo...' : 'Tạo tài khoản'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminCreateUserModal;
