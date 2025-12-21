import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { ADMIN_AUTH_CHANGE_EVENT } from '../../constants/events';
import { ChevronDown, Menu, X } from 'lucide-react';

const navItems = [
  { label: 'Tổng quan', path: '/admin' },
  {
    label: 'Sản phẩm',
    path: '/admin/products',
    children: [
      { label: 'Danh sách', path: '/admin/products' },
      { label: 'Thêm sản phẩm', path: '/admin/products/new' },
      { label: 'Hiển thị sản phẩm', path: '/admin/product-visibility' },
      { label: 'Biến thể', path: '/admin/product-variants' },
      { label: 'Danh mục', path: '/admin/categories' },
    ],
  },
  {
    label: 'Bộ sưu tập',
    path: '/admin/collections',
    children: [
      { label: 'Danh sách', path: '/admin/collections' },
      { label: 'Thêm bộ sưu tập', path: '/admin/collections/new' },
    ],
  },
  { label: 'Đơn hàng', path: '/admin/orders' },
  { label: 'Thanh toán', path: '/admin/payments' },
  { label: 'Người dùng', path: '/admin/users' },
  { label: 'Voucher', path: '/admin/vouchers' },
  { label: 'Phí vận chuyển', path: '/admin/shipping-fee-configs' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  
  const adminInfo = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const raw = localStorage.getItem('adminAuth');
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as { user?: { fullName?: string; email?: string } };
    } catch {
      return null;
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    window.dispatchEvent(new Event(ADMIN_AUTH_CHANGE_EVENT));
    navigate('/admin/login');
  };

  const toggleSubmenu = (path: string) => {
    setOpenSubmenus((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Kiểm tra xem submenu có nên mở mặc định không (dựa trên route hiện tại)
  const shouldSubmenuBeOpen = (children: typeof navItems[0]['children']) => {
    if (!children) return false;
    return children.some((child) => location.pathname === child.path);
  };

  // Initialize submenu state based on current route
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const shouldOpen = shouldSubmenuBeOpen(item.children);
        if (shouldOpen) {
          setOpenSubmenus((prev) => {
            if (prev[item.path] === undefined) {
              return { ...prev, [item.path]: true };
            }
            return prev;
          });
        }
      }
    });
  }, [location.pathname]);

  // Keyboard shortcut để toggle menu (phím `)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Phím ` (backtick) để toggle menu
      if (e.key === '`' && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // Chỉ toggle khi không có modifier keys và không đang focus vào input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
          e.preventDefault();
          setIsMenuOpen((prev) => !prev);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Handler để đóng menu khi click vào menu item
  const handleMenuClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] relative">
      {/* Sidebar với absolute positioning */}
      <aside 
        className={`hidden md:block fixed inset-y-0 left-0 bg-[var(--card)] border-r border-[var(--border)] z-10 shadow-lg transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'w-64' : 'w-12'
        }`}
      >
        {/* Toggle button - luôn hiển thị, dính với menu */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="absolute top-4 right-2 z-20"
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            padding: '0.375rem',
            borderRadius: '0.5rem',
            cursor: 'pointer',
            color: 'var(--foreground)',
            fontSize: '1rem',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--muted)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <div className={`h-full flex flex-col p-6 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Header */}
          <div className="flex-shrink-0 mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[var(--muted-foreground)] mb-1">Admin</p>
            <h1 className="text-2xl font-semibold text-[var(--primary)]" style={{ fontFamily: 'var(--font-serif)' }}>
              SixthSoul
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Control center</p>
          </div>

          {/* Navigation - có thể scroll nếu quá dài */}
          <nav 
            className={`flex-1 overflow-y-auto space-y-2 ${!isMenuOpen ? 'overflow-x-hidden' : ''}`}
            style={{
              scrollbarWidth: isMenuOpen ? 'thin' : 'none',
              msOverflowStyle: isMenuOpen ? 'auto' : 'none',
            }}
          >
            {navItems.map((item) =>
              item.children ? (
                <div key={item.path} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.path)}
                    className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors"
                    style={{
                      backgroundColor: 'var(--primary-foreground)',
                      color: 'var(--primary)',
                      border: 'none',
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.875rem',
                      fontWeight: 400,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-foreground)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--primary-foreground)';
                      e.currentTarget.style.color = 'var(--primary)';
                    }}
                  >
                    <span>{item.label}</span>
                    <span className="transition-transform duration-200" style={{ transform: openSubmenus[item.path] ? 'rotate(0deg)' : 'rotate(-90deg)' }}>
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                  {/* Submenu với animation */}
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{
                      maxHeight: openSubmenus[item.path] ? '500px' : '0',
                      opacity: openSubmenus[item.path] ? 1 : 0,
                    }}
                  >
                    <div className="ml-4 space-y-1 border-l border-[var(--border)] pl-4 pt-1">
                      {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                          onClick={handleMenuClick}
                          className="block rounded-lg px-3 py-1 text-xs text-[var(--primary)] transition-colors"
                          >
                            {child.label}
                          </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleMenuClick}
                  className="block rounded-lg px-3 py-2 text-sm text-[var(--primary)] transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Footer - cố định ở dưới */}
          <div className="flex-shrink-0 mt-8 pt-4 border-t border-[var(--border)] text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">{adminInfo?.user?.fullName ?? 'Admin'}</p>
              <p className="text-xs text-[var(--muted-foreground)] break-words">{adminInfo?.user?.email ?? 'admin@sixthsoul.com'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm hover:bg-[var(--muted)] transition-colors text-center bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content với padding-left để tránh bị che bởi sidebar */}
      <div className={`md:transition-all md:duration-300 flex flex-col min-h-screen ${isMenuOpen ? 'md:pl-64' : 'md:pl-12'}`}>
        <header className="flex items-center justify-between border-b border-[var(--border)] px-4 md:px-8 py-4 bg-[var(--card)]/80 backdrop-blur sticky top-0 z-5">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)]">Control center</p>
            <h2 className="text-lg font-semibold">Bảng điều khiển</h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


