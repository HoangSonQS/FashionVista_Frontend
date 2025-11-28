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
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
        <div className="mb-6 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500 mb-2">Admin Portal</p>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            SixthSoul
          </h1>
          <p className="text-sm text-slate-400 mt-2">Đăng nhập để quản trị hệ thống.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label htmlFor="identifier" className="text-sm text-slate-300">
              Email hoặc số điện thoại
            </label>
            <input
              id="identifier"
              name="identifier"
              type="text"
              value={form.identifier}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="admin@sixthsoul.com"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-slate-300">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="********"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-white/90 text-slate-950 py-2.5 font-medium hover:bg-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập quản trị'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


