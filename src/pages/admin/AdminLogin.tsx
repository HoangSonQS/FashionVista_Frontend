import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ADMIN_AUTH_CHANGE_EVENT } from '../../constants/events';

interface LoginFormState {
  identifier: string;
  password: string;
}

const initialState: LoginFormState = {
  identifier: '',
  password: '',
};

const AdminLogin = () => {
  const [form, setForm] = useState<LoginFormState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.identifier || !form.password) {
      setError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await authService.loginAdmin({
        identifier: form.identifier,
        password: form.password,
      });
      localStorage.setItem('adminAuth', JSON.stringify(response));
      window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể đăng nhập quản trị.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--admin-background)] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 shadow-lg">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-2">Admin Portal</p>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            SixthSoul
          </h1>
          <p className="text-sm text-[var(--muted-foreground)] mt-2">Đăng nhập để quản trị hệ thống.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[var(--error)]/30 bg-[var(--error-bg)] px-3 py-2 text-sm text-[var(--error)]">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="identifier" className="text-sm text-[var(--foreground)]">
              Email hoặc số điện thoại
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={form.identifier}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="admin@sixthsoul.com"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-[var(--foreground)]">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-2.5 font-medium hover:bg-[var(--primary-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


