import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email) {
      setError('Vui lòng nhập email.');
      return;
    }
    try {
      setLoading(true);
      await authService.forgotPassword(email);
      setMessage('Nếu email tồn tại, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Không thể gửi yêu cầu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--auth-background-gradient)]">
      <div className="w-full max-w-md bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">Quên mật khẩu</h1>
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Nhập email của bạn, chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>

        {error && (
          <div className="mb-4 text-xs md:text-sm text-[var(--error-foreground)] bg-[var(--error-bg)] border border-[var(--error)]/40 rounded-md px-3 py-2">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-4 text-xs md:text-sm text-[var(--success-foreground,#166534)] bg-[var(--success-bg,#ecfdf3)] border border-[var(--success,#16a34a)]/30 rounded-md px-3 py-2">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs md:text-sm font-medium text-[var(--foreground)]">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="you@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-full text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang gửi...' : 'Gửi yêu cầu'}
          </button>
        </form>

        <p className="mt-5 text-xs md:text-sm text-center text-[var(--muted-foreground)]">
          <Link to="/login" className="text-[var(--foreground)] hover:text-[var(--primary-hover)]">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;


