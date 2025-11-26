import { Link } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div className="text-foreground">
          <p className="text-xs md:text-sm tracking-[0.25em] uppercase text-[hsl(210,35%,80%)] mb-3">
            FashionVista
          </p>
          <h1
            className="text-3xl md:text-5xl font-semibold mb-4"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Thời trang nữ cao cấp.
          </h1>
          <p className="text-sm md:text-base text-[hsl(210,35%,88%)] leading-relaxed mb-6 max-w-md">
            Khám phá bộ sưu tập SixthSoul với các thiết kế tối giản, hiện đại và sang trọng dành riêng
            cho bạn.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-full text-sm font-medium bg-[#0055A0] text-[#FFF8E7] hover:bg-[#0064c0] transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-full text-sm font-medium border border-[#8CC1E9] text-[#8CC1E9] hover:bg-[#8CC1E9] hover:text-[#12284B] transition-colors"
            >
              Đăng ký
            </Link>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="relative aspect-[4/5] max-w-sm ml-auto rounded-3xl overflow-hidden border border-[hsl(210,40%,35%)]"
               style={{ boxShadow: '0 22px 55px rgba(0,0,0,0.6)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.12)] to-[rgba(0,0,0,0.2)]" />
            <div className="absolute bottom-6 left-6 right-6 text-[hsl(0,0%,98%)]">
              <p className="text-xs tracking-[0.35em] uppercase text-[hsl(210,35%,80%)] mb-1">
                SixthSoul Studio
              </p>
              <p className="text-lg font-medium">
                New Collection 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
