import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { ADMIN_AUTH_CHANGE_EVENT } from '../../constants/events';
import { ChevronDown } from 'lucide-react';

const navItems = [
  { label: 'Tổng quan', path: '/admin' },
  {
    label: 'Sản phẩm',
    path: '/admin/products',
    children: [
      { label: 'Danh sách', path: '/admin/products' },
      { label: 'Thêm sản phẩm', path: '/admin/products/new' },
    ],
  },
  { label: 'Đơn hàng', path: '/admin/orders' },
  { label: 'Khách hàng', path: '/admin/customers' },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});
  
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

  return (
    <div className="min-h-screen bg-slate-950 text-white relative">
      {/* Sidebar với absolute positioning */}
      <aside className="hidden md:block fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-10">
        <div className="h-full flex flex-col p-6">
          {/* Header */}
          <div className="flex-shrink-0 mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">Admin</p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
              SixthSoul
            </h1>
            <p className="text-xs text-slate-500 mt-1">Control center</p>
          </div>

          {/* Navigation - có thể scroll nếu quá dài */}
          <nav className="flex-1 overflow-y-auto space-y-2">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.path} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleSubmenu(item.path)}
                    className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                      shouldSubmenuBeOpen(item.children)
                        ? 'bg-slate-800 text-slate-100 font-semibold'
                        : 'bg-transparent border-0 text-slate-200 hover:bg-slate-800'
                    }`}
                    style={{
                      backgroundColor: shouldSubmenuBeOpen(item.children) ? undefined : 'transparent',
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
                    <div className="ml-4 space-y-1 border-l border-slate-800 pl-4 pt-1">
                      {item.children.map((child) => {
                        const isActive = location.pathname === child.path;
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`block rounded-lg px-3 py-1 text-xs transition-colors ${
                              isActive
                                ? 'bg-slate-800 text-slate-100 font-medium'
                                : 'text-slate-300 hover:bg-slate-800/60'
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                    location.pathname === item.path
                      ? 'bg-slate-800 text-slate-100 font-semibold'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Footer - cố định ở dưới */}
          <div className="flex-shrink-0 mt-8 pt-4 border-t border-slate-800 text-center">
            <div className="space-y-1">
              <p className="text-sm font-medium">{adminInfo?.user?.fullName ?? 'Admin'}</p>
              <p className="text-xs text-slate-400 break-words">{adminInfo?.user?.email ?? 'admin@sixthsoul.com'}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-center bg-[var(--primary)] text-[var(--primary-foreground)] hover:bg-[#0064c0]"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content với padding-left để tránh bị che bởi sidebar */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        <header className="flex items-center justify-between border-b border-slate-800 px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur sticky top-0 z-5">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-500">Control center</p>
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


