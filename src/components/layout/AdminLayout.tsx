import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ADMIN_AUTH_CHANGE_EVENT } from '../../constants/events';

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

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      <aside className="hidden md:flex w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 p-6 flex-col">
        <div className="space-y-6 flex-1">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400 mb-1">Admin</p>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
              SixthSoul
            </h1>
            <p className="text-xs text-slate-500 mt-1">Control center</p>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) =>
              item.children ? (
                <div key={item.path} className="space-y-1">
                  <Link
                    to={item.path}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 transition-colors"
                  >
                    {item.label}
                  </Link>
                  <div className="ml-4 space-y-1 border-l border-slate-800 pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className="block rounded-lg px-3 py-1 text-xs text-slate-300 hover:bg-slate-800/60 transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        <div className="mt-8 pt-4 border-t border-slate-800 text-center">
          <div className="space-y-1">
            <p className="text-sm font-medium">{adminInfo?.user?.fullName ?? 'Admin'}</p>
            <p className="text-xs text-slate-400 break-words">{adminInfo?.user?.email ?? 'admin@sixthsoul.com'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-slate-700 px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-center"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between border-b border-slate-800 px-4 md:px-8 py-4 bg-slate-950/80 backdrop-blur">
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


