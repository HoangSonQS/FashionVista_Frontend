const Footer = () => {
  return (
    <footer className="bg-[var(--background)] text-[var(--foreground)] border-t border-[var(--border)] mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <div>
            <h3 className="font-serif text-lg font-semibold uppercase mb-4 text-[var(--foreground)]">Về sixthsoul</h3>
            <ul className="space-y-2">
              {['Giới thiệu', 'Tuyển dụng', 'Tìm cửa hàng'].map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold uppercase mb-4 text-[var(--foreground)]">Hỗ trợ</h3>
            <ul className="space-y-2">
              {['Liên hệ', 'Vận chuyển', 'Đổi trả', 'FAQ'].map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold uppercase mb-4 text-[var(--foreground)]">Pháp lý</h3>
            <ul className="space-y-2">
              {['Chính sách bảo mật', 'Điều khoản sử dụng'].map((label) => (
                <li key={label}>
                  <a href="#" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-serif text-lg font-semibold uppercase mb-4 text-[var(--foreground)]">Đăng ký nhận tin</h3>
            <p className="text-sm text-[var(--muted-foreground)] mb-4">
              Nhận thông tin về sản phẩm mới và ưu đãi đặc biệt
            </p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Email của bạn"
                className="flex h-9 w-full rounded-md border bg-[var(--background)] border-[var(--border)] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] text-[var(--primary-foreground)] border border-[var(--primary)] h-9 w-9 hover:bg-[#0064c0] transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect width="20" height="16" x="2" y="4" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </button>
            </form>
            <div className="flex gap-4 mt-6">
              {[
                { label: 'Facebook', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                { label: 'Instagram', path: null },
                { label: 'Twitter', path: null },
              ].map((item) => (
                <a key={item.label} href="#" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" aria-label={item.label}>
                  {item.label === 'Facebook' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d={item.path ?? ''} />
                    </svg>
                  )}
                  {item.label === 'Instagram' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                    </svg>
                  )}
                  {item.label === 'Twitter' && (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] mt-12 pt-8">
          <p className="text-center text-sm text-[var(--muted-foreground)]">© 2025 sixthsoul. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


