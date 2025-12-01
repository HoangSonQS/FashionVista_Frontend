import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { AUTH_CHANGE_EVENT } from '../../constants/events';

interface LoginFormState {
  identifier: string; // Email hoặc số điện thoại
  password: string;
}

const initialFormState: LoginFormState = {
  identifier: '',
  password: '',
};

const Login = () => {
  const [form, setForm] = useState<LoginFormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.identifier || !form.password) {
      setError('Vui lòng nhập email/số điện thoại và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.login({
        identifier: form.identifier,
        password: form.password,
      });
      // Lưu token + user vào localStorage cho các phần khác dùng sau này
      localStorage.setItem('auth', JSON.stringify(result));
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
      // Chuyển về trang Home sau khi đăng nhập thành công
      navigate('/');
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: 'var(--auth-background-gradient)',
      }}
    >
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block text-[var(--foreground)]">
          <p className="text-sm tracking-[0.3em] uppercase text-[var(--muted-foreground)] mb-3">
            SixthSoul Studio
          </p>
          <h1
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Thời trang nữ cao cấp
          </h1>
          <p className="text-sm md:text-base text-[var(--foreground)] leading-relaxed max-w-md">
            Đăng nhập để khám phá các bộ sưu tập mới nhất, ưu đãi dành riêng cho bạn và trải nghiệm mua
            sắm được cá nhân hóa.
          </p>
        </div>

        <div
          className="bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-lg p-8 md:p-10"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        >
          <div className="mb-6 text-center md:text-left">
            <p className="text-xs tracking-[0.25em] uppercase text-[var(--muted-foreground)] mb-2">
              Welcome back
            </p>
            <h2 className="text-2xl font-semibold text-[var(--foreground)]">Đăng nhập</h2>
          </div>

          {error && (
            <div className="mb-4 text-xs md:text-sm text-[var(--error-foreground)] bg-[var(--error-bg)] border border-[var(--error)]/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="identifier"
                className="block text-xs md:text-sm font-medium text-[var(--foreground)]"
              >
                Email hoặc số điện thoại
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                value={form.identifier}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="you@example.com hoặc 0901234567"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs md:text-sm font-medium text-[var(--foreground)]"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="********"
              />
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm text-[var(--muted-foreground)]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3 w-3"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="bg-transparent border-none p-0 text-[var(--foreground)] hover:text-[var(--primary-hover)]"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-full text-sm font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-5 text-xs md:text-sm text-center text-[var(--muted-foreground)]">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[var(--foreground)] hover:text-[var(--primary-hover)]">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


