import { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { adminUserService, type AdminUserListResponse } from '../../../services/adminUserService';
import { useToast } from '../../../hooks/useToast';

interface AdminResetPasswordModalProps {
    user: AdminUserListResponse;
    onClose: () => void;
}

const AdminResetPasswordModal = ({ user, onClose }: AdminResetPasswordModalProps) => {
    const [newPassword, setNewPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await adminUserService.resetPassword(user.id, {
                newPassword: newPassword.trim() || undefined
            });
            setResult(response.password || '******');
            showToast('Đã đổi mật khẩu thành công.', 'success');
        } catch (err: any) {
            const msg = err?.response?.data?.message || err?.message || 'Không thể đổi mật khẩu.';
            showToast(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (result) {
        return (
            <div
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--overlay)] px-4"
                onClick={onClose}
            >
                <div
                    className="w-full max-w-sm rounded-2xl bg-[var(--card)] shadow-2xl border border-[var(--border)] p-6 text-center space-y-4"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="mx-auto w-12 h-12 rounded-full bg-[var(--success)]/20 flex items-center justify-center text-[var(--success)]">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold">Thành công!</h3>
                        <p className="text-sm text-[var(--muted-foreground)]">
                            Mật khẩu cho <strong>{user.email}</strong> đã được thay đổi.
                        </p>
                    </div>

                    <div className="bg-[var(--muted)]/50 rounded-xl p-3 border border-[var(--border)] break-all font-mono text-lg font-bold">
                        {result}
                    </div>
                    <p className="text-xs text-[var(--muted-foreground)]">
                        Hãy sao chép và gửi mật khẩu này cho người dùng.
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full rounded-full bg-[var(--primary)] py-2 text-sm font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

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
                    <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1 hover:bg-[var(--muted)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleReset} className="p-6 space-y-4">
                    <p className="text-sm text-[var(--muted-foreground)]">
                        Bạn đang thay đổi mật khẩu cho tài khoản <strong>{user.email}</strong>.
                    </p>

                    <div className="space-y-1">
                        <label className="text-sm font-medium">Mật khẩu mới (Tùy chọn)</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] pr-10"
                                placeholder="Để trống để tự sinh ngẫu nhiên"
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)]">
                            Nếu nhập tay, tối thiểu 6 ký tự.
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
                            {loading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminResetPasswordModal;
