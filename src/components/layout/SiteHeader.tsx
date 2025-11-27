import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CircleHelp, LogOut, Menu, Search, ShoppingBag, User, type LucideIcon } from 'lucide-react';

import type { AuthResponse } from '../../types/auth';
import { cartService } from '../../services/cartService';
import { AUTH_CHANGE_EVENT, CART_UPDATED_EVENT } from '../../constants/events';
import { useCartDrawer } from '../../context/CartDrawerContext';

const NAV_ITEMS = [
  { label: 'THE NEW', href: '/?section=new' },
  { label: 'BỘ SƯU TẬP', href: '/?section=collections' },
  { label: 'SALE', href: '/?section=sale' },
];

const readAuthState = (): AuthResponse | null => {
  if (typeof window === 'undefined') {
    return null;
  }
  const raw = window.localStorage.getItem('auth');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
};

type IconButtonProps = {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  badge?: number;
};

const IconButton = ({ icon: Icon, label, onClick, className = '', badge }: IconButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-transparent text-[var(--foreground)] transition-colors hover:bg-[rgba(255,255,255,0.08)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] ${className}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {badge > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-[#ef4444] px-1 text-[10px] font-semibold text-white">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <span className="sr-only">{label}</span>
    </button>
  );
};

const SiteHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [auth, setAuth] = useState<AuthResponse | null>(() => (typeof window !== 'undefined' ? readAuthState() : null));
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { openDrawer } = useCartDrawer();

  const customerName = useMemo(() => auth?.user?.fullName ?? 'Khách hàng', [auth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleAuthChange = () => {
      setAuth(readAuthState());
    };

    window.addEventListener('storage', handleAuthChange);
    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);
    };
  }, []);

  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  const loadCartCount = useCallback(async () => {
    if (!auth?.token) {
      setCartCount(0);
      return;
    }
    try {
      const cart = await cartService.getCart();
      const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalItems);
    } catch {
      setCartCount(0);
    }
  }, [auth?.token]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handleCartUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ count?: number }>;
      if (typeof customEvent.detail?.count === 'number') {
        setCartCount(customEvent.detail.count);
      } else {
        loadCartCount();
      }
    };
    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdate as EventListener);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdate as EventListener);
    };
  }, [loadCartCount]);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountMenuOpen]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth');
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }
    setAuth(null);
    setCartCount(0);
    setAccountMenuOpen(false);
    navigate('/login');
  };

  const handleAccountAction = () => {
    if (!auth) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setAccountMenuOpen((prev) => !prev);
  };

  const handleCartClick = () => {
    if (!auth) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    openDrawer();
  };

  const handleHelpClick = () => {
    if (typeof window !== 'undefined') {
      window.open('mailto:support@sixthsoul.vn', '_blank');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[rgba(7,18,40,0.92)] backdrop-blur supports-[backdrop-filter]:bg-[rgba(7,18,40,0.75)]">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="font-serif text-2xl font-bold uppercase tracking-[0.25em] text-[var(--foreground)]"
            >
              sixthsoul
            </Link>
          </div>

          <nav className="hidden items-center gap-6 lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className="uppercase text-xs font-medium tracking-[0.35em] text-[var(--foreground)] transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <IconButton icon={Search} label="Tìm kiếm" onClick={() => navigate('/')} />

            <div className="relative" ref={accountMenuRef}>
              <IconButton
                icon={User}
                label={auth ? 'Tài khoản' : 'Đăng nhập'}
                onClick={handleAccountAction}
              />

              {accountMenuOpen && auth && (
                <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl">
                  <div className="mb-3">
                    <p className="text-sm font-semibold">{customerName}</p>
                    <p className="text-xs text-[var(--muted-foreground)]">{auth.user.email}</p>
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <button
                      type="button"
                      className="w-full rounded-xl border border-transparent bg-[rgba(255,255,255,0.05)] px-3 py-2 text-left text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.1)]"
                      onClick={() => {
                        navigate('/profile');
                        setAccountMenuOpen(false);
                      }}
                    >
                      Hồ sơ của tôi
                    </button>
                    <button
                      type="button"
                      className="w-full rounded-xl border border-transparent bg-[rgba(255,255,255,0.05)] px-3 py-2 text-left text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.1)]"
                      onClick={() => {
                        navigate('/profile', { state: { section: 'orders' } });
                        setAccountMenuOpen(false);
                      }}
                    >
                      Đơn hàng
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-between rounded-xl border border-transparent bg-[rgba(255,255,255,0.05)] px-3 py-2 text-sm font-medium text-red-200 hover:bg-red-500/10"
                      onClick={handleLogout}
                    >
                      Đăng xuất
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <IconButton icon={CircleHelp} label="Hỗ trợ" onClick={handleHelpClick} className="hidden sm:inline-flex" />

            <IconButton icon={ShoppingBag} label="Giỏ hàng" onClick={handleCartClick} badge={cartCount} />

            <IconButton
              icon={Menu}
              label="Mở menu"
              onClick={() => setMobileNavOpen((prev) => !prev)}
              className="lg:hidden"
            />
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="border-t border-[var(--border)] bg-[rgba(7,18,40,0.98)] px-4 py-4 lg:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setMobileNavOpen(false)}
                className="rounded-xl border border-transparent px-3 py-2 text-sm uppercase tracking-[0.4em] text-[var(--foreground)] hover:bg-[rgba(255,255,255,0.08)]"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2 text-sm">
              {auth ? (
                <>
                  <button
                    type="button"
                    className="rounded-xl border border-transparent bg-[rgba(255,255,255,0.05)] px-3 py-2 text-left"
                    onClick={() => {
                      navigate('/profile');
                      setMobileNavOpen(false);
                    }}
                  >
                    Hồ sơ của tôi
                  </button>
                  <button
                    type="button"
                    className="rounded-xl border border-transparent bg-[rgba(255,255,255,0.05)] px-3 py-2 text-left"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="rounded-xl border border-transparent bg-[var(--primary)] px-3 py-2 text-left font-semibold text-[var(--primary-foreground)]"
                  onClick={() => {
                    navigate('/login');
                    setMobileNavOpen(false);
                  }}
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;


