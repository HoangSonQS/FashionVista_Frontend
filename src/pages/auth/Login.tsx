import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

interface LoginFormState {
  email: string;
  password: string;
}

const initialFormState: LoginFormState = {
  email: '',
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

    if (!form.email || !form.password) {
      setError('Vui lòng nhập email và mật khẩu.');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.login({
        email: form.email,
        password: form.password,
      });
      // Lưu token + user vào localStorage cho các phần khác dùng sau này
      localStorage.setItem('auth', JSON.stringify(result));
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
        background: 'radial-gradient(circle at top, hsla(210, 45%, 35%, 0.9), hsl(210, 45%, 25%))',
      }}
    >
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block text-foreground">
          <p className="text-sm tracking-[0.3em] uppercase text-[hsl(210,35%,75%)] mb-3">
            SixthSoul Studio
          </p>
          <h1
            className="text-4xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Thời trang nữ cao cấp
          </h1>
          <p className="text-sm md:text-base text-[hsl(210,35%,85%)] leading-relaxed max-w-md">
            Đăng nhập để khám phá các bộ sưu tập mới nhất, ưu đãi dành riêng cho bạn và trải nghiệm mua
            sắm được cá nhân hóa.
          </p>
        </div>

        <div
          className="bg-[hsl(210,42%,28%)] border border-[hsl(210,38%,35%)] rounded-2xl shadow-lg p-8 md:p-10"
          style={{ boxShadow: '0 18px 45px rgba(0,0,0,0.55)' }}
        >
          <div className="mb-6 text-center md:text-left">
            <p className="text-xs tracking-[0.25em] uppercase text-[hsl(210,35%,75%)] mb-2">
              Welcome back
            </p>
            <h2 className="text-2xl font-semibold text-foreground">Đăng nhập</h2>
          </div>

          {error && (
            <div className="mb-4 text-xs md:text-sm text-red-300 bg-red-950/40 border border-red-500/40 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs md:text-sm font-medium text-[hsl(210,35%,88%)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-[hsl(210,40%,35%)] bg-[hsl(210,43%,27%)] px-3 py-2 text-sm text-foreground placeholder:text-[hsl(210,35%,75%)] focus:outline-none focus:ring-2 focus:ring-[hsl(210,45%,50%)]"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs md:text-sm font-medium text-[hsl(210,35%,88%)]"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-[hsl(210,40%,35%)] bg-[hsl(210,43%,27%)] px-3 py-2 text-sm text-foreground placeholder:text-[hsl(210,35%,75%)] focus:outline-none focus:ring-2 focus:ring-[hsl(210,45%,50%)]"
                placeholder="********"
              />
            </div>

            <div className="flex items-center justify-between text-xs md:text-sm text-[hsl(210,35%,80%)]">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-3 w-3 rounded border-[hsl(210,40%,35%)] bg-[hsl(210,43%,27%)]"
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="bg-transparent border-none p-0 text-[hsl(210,45%,70%)] hover:text-[hsl(210,45%,80%)]"
              >
                Quên mật khẩu?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 rounded-full text-sm font-medium bg-[hsl(210,45%,40%)] text-[hsl(0,0%,98%)] hover:bg-[hsl(210,45%,46%)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          <p className="mt-5 text-xs md:text-sm text-center text-[hsl(210,35%,80%)]">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[hsl(210,45%,70%)] hover:text-[hsl(210,45%,80%)]">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


