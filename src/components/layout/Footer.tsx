import sixthSoulLogo from '../../assets/logo/sixthsoul_logo_blue.png';

const Footer = () => {
  return (
    <footer className="mt-24 border-t border-[var(--border)]/60 bg-white text-[var(--foreground)]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-14 flex flex-col gap-5 border-b border-[var(--border)] pb-10 md:flex-row md:items-end md:justify-between">
          <div>
            <img src={sixthSoulLogo} alt="SixthSoul" className="h-10 w-auto" />
            <p className="mt-5 max-w-md text-[12px] font-light uppercase tracking-[0.16em] text-[var(--muted-foreground)]">
              Soft wardrobe pieces for women who dress with ease, detail and intention.
            </p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[var(--primary)]">
            Live your beauty. Live your SixthSoul.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="font-serif text-[15px] font-medium uppercase tracking-[0.05em] mb-6 text-[var(--foreground)] font-sans">Về thương hiệu</h3>
            <ul className="space-y-3">
              {[
                { label: 'Giới thiệu', path: '/about' },
                { label: 'Sản phẩm', path: '/products' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.path} className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-[15px] font-medium uppercase tracking-[0.05em] mb-6 text-[var(--foreground)] font-sans">Dịch vụ khách hàng</h3>
            <ul className="space-y-3">
              {[
                { label: 'Liên hệ', path: '/contact' },
                { label: 'Vận chuyển', path: '/shipping-policy' },
                { label: 'Đổi trả', path: '/refund-policy' },
                { label: 'Thanh toán', path: '/payment-methods' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.path} className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-[15px] font-medium uppercase tracking-[0.05em] mb-6 text-[var(--foreground)] font-sans">Pháp lý</h3>
            <ul className="space-y-3">
              {[
                { label: 'Bảo mật', path: '/privacy-policy' },
                { label: 'Điều khoản', path: '/terms-of-service' },
              ].map((item) => (
                <li key={item.label}>
                  <a href={item.path} className="text-[11px] uppercase tracking-[0.1em] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-[15px] font-medium uppercase tracking-[0.05em] mb-6 text-[var(--foreground)] font-sans">Bản tin</h3>
            <p className="text-[12px] text-[var(--muted-foreground)] mb-6 font-light leading-relaxed">
              Nhận thông tin về bộ sưu tập mới và ưu đãi đặc quyền từ SixthSoul.
            </p>
            <form className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="EMAIL CỦA BẠN"
                className="w-full bg-transparent border-b border-[var(--border)] py-2 text-[11px] tracking-[0.1em] focus:outline-none focus:border-[var(--primary)] text-[var(--foreground)]"
              />
              <button
                type="submit"
                className="self-start text-[10px] uppercase tracking-[0.2em] font-medium text-[var(--foreground)] hover:text-[var(--primary)] transition-colors font-sans"
                aria-label="Gửi email"
              >
                ĐĂNG KÝ
              </button>
            </form>
            <div className="flex gap-5 mt-8">
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'Instagram', path: null },
              ].map((item) => (
                <a key={item.label} href="#" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label={item.label}>
                  {item.label === 'Facebook' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d={item.path ?? ''} />
                    </svg>
                  )}
                  {item.label === 'Instagram' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y2="17.51" y1="6.5" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)]/30 mt-16 pt-8">
          <p className="text-center text-[10px] text-[var(--muted-foreground)] uppercase tracking-[0.2em]">© 2026. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;



