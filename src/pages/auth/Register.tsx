import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gift
} from 'lucide-react';
import { authService } from '../../services/authService';

interface FormState {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

const initialFormState: FormState = {
  fullName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
};

const Register = () => {
  const [form, setForm] = useState<FormState>(initialFormState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.email || !form.phoneNumber || !form.password || !form.confirmPassword) {
      setError('Vui lòng điền đầy đủ thông tin.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu và Xác nhận mật khẩu không khớp.');
      return;
    }

    try {
      setLoading(true);
      await authService.register({
        fullName: form.fullName,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
      });
      navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Đã xảy ra lỗi khi đăng ký. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: <ShieldCheck className="h-5 w-5 text-[var(--primary)]" />,
      title: "Bảo mật tài khoản",
      desc: "Thông tin cá nhân được bảo vệ tối đa."
    },
    {
      icon: <Zap className="h-5 w-5 text-[var(--primary)]" />,
      title: "Thanh toán nhanh",
      desc: "Lưu địa chỉ và phương thức thanh toán."
    },
    {
      icon: <Gift className="h-5 w-5 text-[var(--primary)]" />,
      title: "Ưu đãi đặc biệt",
      desc: "Nhận thông báo về sale và quà tặng."
    }
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12 bg-[var(--background)]"
      style={{
        background: 'var(--auth-background-gradient)',
      }}
    >
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden rounded-sm border border-[var(--border)] bg-[var(--card)] shadow-2xl">
        {/* Left Column - Benefits & Branding */}
        <div className="hidden lg:flex lg:col-span-5 bg-[var(--muted)] p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl opacity-50"></div>

          <div className="relative z-10">
            <Link to="/" className="inline-block mb-12">
              <span className="text-xl font-light tracking-[0.25em] uppercase text-[var(--foreground)] font-serif">
                SIXTHSOUL
              </span>
            </Link>

            <h1 className="text-4xl font-light mb-6 leading-tight text-[var(--foreground)]" style={{ fontFamily: 'var(--font-serif)' }}>
              Join the <br />
              <span className="text-[var(--primary)] font-medium italic">SixthSoul Society</span>
            </h1>

            <p className="text-[var(--muted-foreground)] mb-12 max-w-sm">
              Gia nhập cộng đồng thời trang cao cấp của chúng tôi để tận hưởng những trải nghiệm mua sắm đẳng cấp nhất.
            </p>

            <div className="space-y-8">
              {benefits.map((item, idx) => (
                <div key={idx} className="flex gap-4 group">
                  <div className="flex-shrink-0 w-12 h-12 rounded-sm bg-[var(--card)] flex items-center justify-center shadow-sm border border-[var(--border)] group-hover:border-[var(--primary)] transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--foreground)]">{item.title}</h3>
                    <p className="text-sm text-[var(--muted-foreground)]">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-[var(--border)]">
            <p className="text-sm text-[var(--muted-foreground)]">
              Đã có tài khoản?
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 mt-2 font-semibold text-[var(--primary)] hover:gap-3 transition-all">
              Đăng nhập ngay <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="col-span-1 lg:col-span-7 p-8 md:p-12 lg:p-16">
          <div className="max-w-md mx-auto">
            <div className="mb-10 lg:hidden">
              <span className="text-lg font-light tracking-[0.2em] uppercase text-[var(--foreground)] font-serif">
                SIXTHSOUL
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-light text-[var(--foreground)] mb-2" style={{ fontFamily: 'var(--font-serif)' }}>CREATE ACCOUNT</h2>
              <p className="text-[11px] uppercase tracking-widest text-[var(--muted-foreground)]">Identify yourself to join us.</p>
            </div>

            {error && (
              <div className="mb-6 flex items-center gap-3 text-[11px] uppercase tracking-wider text-[var(--error)] bg-[var(--error-bg)] border border-[var(--error)]/20 rounded-sm px-4 py-3 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex-shrink-0 w-1 h-1 rounded-full bg-[var(--error)]"></div>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] ml-1">
                  Họ và tên
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors z-10" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full !pl-12 pr-4 py-3.5 rounded-sm border border-[var(--border)] bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-all"
                    placeholder="CHÊNE"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors z-10" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full !pl-12 pr-4 py-3.5 rounded-sm border border-[var(--border)] bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-all"
                      placeholder="YOU@SIXTHSOUL.COM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] ml-1">
                    Số điện thoại
                  </label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors z-10" />
                    <input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      required
                      value={form.phoneNumber}
                      onChange={handleChange}
                      className="w-full !pl-12 pr-4 py-3.5 rounded-sm border border-[var(--border)] bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-all"
                      placeholder="+84"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] ml-1">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors z-10" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full !pl-12 !pr-12 py-3.5 rounded-sm border border-[var(--border)] bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors z-10"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] ml-1">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)] group-focus-within:text-[var(--primary)] transition-colors z-10" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full !pl-12 !pr-12 py-3.5 rounded-sm border border-[var(--border)] bg-[var(--input-background)] text-[var(--foreground)] placeholder:text-[var(--input-placeholder)] focus:outline-none focus:border-[var(--primary)] transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors z-10"
                  >
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    required
                    className="mt-1"
                  />
                  <span className="text-[10px] uppercase tracking-widest text-[var(--muted-foreground)] leading-relaxed group-hover:text-[var(--foreground)] transition-colors">
                    I agree to the <Link to="/terms" className="text-[var(--primary)] hover:underline">Terms</Link> and <Link to="/privacy" className="text-[var(--primary)] hover:underline">Privacy Policy</Link> of SIXTHSOUL.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 py-4 rounded-sm text-[11px] uppercase tracking-[0.2em] font-medium bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] items-center justify-center flex gap-2 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Tạo tài khoản ngay
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 lg:hidden text-center">
              <p className="text-sm text-[var(--muted-foreground)]">
                Đã có tài khoản?{' '}
                <Link to="/login" className="font-medium text-[var(--primary)] hover:underline uppercase tracking-widest">
                  Login here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
