import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Search, ShoppingBag, User, X, type LucideIcon } from 'lucide-react';

import type { AuthResponse } from '../../types/auth';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { AUTH_CHANGE_EVENT, CART_UPDATED_EVENT } from '../../constants/events';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../common/LoginModal';
import { productService } from '../../services/productService';
import { getAuthSession } from '../../services/authSession';
import { logoutSession } from '../../services/axiosClient';
import type { SearchSuggestion } from '../../types/product';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import sixthSoulLogo from '../../assets/logo/sixthsoul_logo_blue.png';

const NAV_ITEMS = [
  { label: 'THE NEW', href: '/?section=new' },
  // Dẫn tới trang danh sách bộ sưu tập public
  { label: 'BỘ SƯU TẬP', href: '/collections' },
  { label: 'SALE', href: '/sale' },
];

const readAuthState = (): AuthResponse | null => {
  return getAuthSession('user');
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
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[var(--border)] bg-white/85 text-[var(--foreground)] transition-colors hover:border-[var(--primary)] hover:text-[var(--primary)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--primary)] ${className}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-[var(--primary)] px-1 text-[10px] font-semibold text-white">
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
  const [wishlistCount, setWishlistCount] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { openDrawer } = useCartDrawer();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const debouncedSearch = useDebouncedValue(searchTerm, 450);
  const headerRef = useRef<HTMLElement | null>(null);
  const [isOverHero, setIsOverHero] = useState(false);

  const customerName = useMemo(() => auth?.user?.fullName ?? 'Khách hàng', [auth]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleAuthChange = () => {
      setAuth(readAuthState());
    };

    window.addEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);

    return () => {
      window.removeEventListener(AUTH_CHANGE_EVENT, handleAuthChange as EventListener);
    };
  }, []);

  useEffect(() => {
    setAccountMenuOpen(false);
    setMobileNavOpen(false);
  }, [location.pathname]);

  // Đổi màu logo / nav khi header nằm đè lên hero banner trang chủ
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (location.pathname !== '/') {
      setIsOverHero(false);
      return;
    }

    const updateHeroOverlap = () => {
      const hero = document.getElementById('home-hero');
      const header = headerRef.current;

      // Ở vị trí top (chưa scroll) thì luôn coi như không over hero
      if (!hero || !header || window.scrollY <= 0) {
        setIsOverHero(false);
        return;
      }

      const heroRect = hero.getBoundingClientRect();
      const headerHeight = header.offsetHeight || 0;

      // Header được xem là "đang nằm trên hero" nếu phần trên của hero
      // nằm phía sau header và hero vẫn còn một phần trong viewport
      const overlapping = heroRect.top < headerHeight && heroRect.bottom > 0;
      setIsOverHero(overlapping);
    };

    updateHeroOverlap();
    window.addEventListener('scroll', updateHeroOverlap);
    window.addEventListener('resize', updateHeroOverlap);

    return () => {
      window.removeEventListener('scroll', updateHeroOverlap);
      window.removeEventListener('resize', updateHeroOverlap);
    };
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

  const loadWishlistCount = useCallback(async () => {
    if (!auth?.token) {
      setWishlistCount(0);
      return;
    }
    try {
      const wishlist = await wishlistService.getMyWishlist();
      setWishlistCount(wishlist.length);
    } catch {
      setWishlistCount(0);
    }
  }, [auth?.token]);

  useEffect(() => {
    loadCartCount();
    loadWishlistCount();
  }, [loadCartCount, loadWishlistCount]);

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
    if (typeof window === 'undefined') {
      return;
    }
    const handleWishlistUpdate = () => {
      loadWishlistCount();
    };
    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [loadWishlistCount]);

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

  // Tự động focus input khi mở search + đóng khi Esc
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      setSearchSuggestions([]);
      setSearchTerm('');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  // Gợi ý search từ header
  useEffect(() => {
    const keyword = debouncedSearch.trim();
    if (!searchOpen || keyword.length < 2) {
      setSearchSuggestions([]);
      return;
    }

    let cancelled = false;

    const fetch = async () => {
      try {
        setSearchLoading(true);
        const result = await productService.getSuggestions(keyword);
        if (!cancelled) {
          setSearchSuggestions(result.slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setSearchSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSearchLoading(false);
        }
      }
    };

    void fetch();

    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, searchOpen]);

  const handleLogout = async () => {
    await logoutSession('user');
    setAuth(null);
    setCartCount(0);
    setAccountMenuOpen(false);
    navigate('/');
  };

  const handleAccountAction = () => {
    if (!auth) {
      setShowLoginModal(true);
      return;
    }
    setAccountMenuOpen((prev) => !prev);
  };

  const handleCartClick = () => {
    if (!auth) {
      setShowLoginModal(true);
      return;
    }
    openDrawer();
  };

  const handleWishlistClick = () => {
    if (!auth) {
      setShowLoginModal(true);
      return;
    }
    navigate('/wishlist');
  };


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = searchTerm.trim();
    if (!keyword) {
      return;
    }
    setSearchOpen(false);
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <header ref={headerRef} className="sticky top-0 z-50 w-full">
      {/* Main header with background đổi màu khi đè lên hero banner */}
      <div
        className={`relative border-b-[0.5px] border-[var(--border)] shadow-[0_1px_0_rgba(36,50,74,0.03)] ${isOverHero ? 'bg-white/88 backdrop-blur-xl' : 'bg-[var(--background)]/96 backdrop-blur-xl'
          }`}
      >
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                to="/"
                className="inline-flex items-center transition-opacity hover:opacity-80"
                aria-label="SixthSoul"
              >
                <img
                  src={sixthSoulLogo}
                  alt="SixthSoul"
                  className="h-8 w-auto md:h-9"
                />
              </Link>
            </div>

            {/* Navigation links - center, luôn hiện */}
            <div className="flex-1 flex items-center justify-center">
              <nav className="hidden items-center gap-8 md:gap-12 lg:flex">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="uppercase text-[11px] font-medium tracking-[0.18em] text-[var(--foreground)] transition-colors hover:text-[var(--primary)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Icon buttons - right side */}
            <div className="flex items-center gap-1.5">
              <IconButton
                icon={Search}
                label="Tìm kiếm"
                onClick={() => setSearchOpen((prev) => !prev)}
                className={searchOpen ? 'bg-[var(--muted)]' : ''}
              />

              {auth ? (
                <>
                  <div className="relative" ref={accountMenuRef}>
                    <IconButton
                      icon={User}
                      label="Tài khoản"
                      onClick={handleAccountAction}
                    />

                    {accountMenuOpen && (
                      <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-2xl">
                        <div className="mb-3">
                          <p className="text-sm font-semibold">{customerName}</p>
                          <p className="text-xs text-[var(--muted-foreground)]">{auth.user?.email}</p>
                        </div>
                        <div className="flex flex-col gap-1.5 text-sm">
                          <button
                            type="button"
                            className="w-full rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left text-[var(--foreground)] hover:bg-[var(--muted)]/80"
                            onClick={() => {
                              navigate('/profile');
                              setAccountMenuOpen(false);
                            }}
                          >
                            Hồ sơ của tôi
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left text-[var(--foreground)] hover:bg-[var(--muted)]/80"
                            onClick={() => {
                              navigate('/orders');
                              setAccountMenuOpen(false);
                            }}
                          >
                            Đơn hàng
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left text-[var(--foreground)] hover:bg-[var(--muted)]/80"
                            onClick={() => {
                              navigate('/wishlist');
                              setAccountMenuOpen(false);
                            }}
                          >
                            Yêu thích
                          </button>
                          <button
                            type="button"
                            className="w-full rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left text-[var(--foreground)] hover:bg-[var(--muted)]/80"
                            onClick={() => {
                              navigate('/reviews');
                              setAccountMenuOpen(false);
                            }}
                          >
                            Đánh giá của tôi
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center justify-between rounded-xl border border-transparent bg-[var(--error-bg)] px-3 py-2 text-sm font-medium text-[var(--error)] hover:bg-[var(--error-bg)]/80"
                            onClick={handleLogout}
                          >
                            Đăng xuất
                            <LogOut className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <IconButton icon={Heart} label="Yêu thích" onClick={handleWishlistClick} badge={wishlistCount} />

                  <IconButton icon={ShoppingBag} label="Giỏ hàng" onClick={handleCartClick} badge={cartCount} />

                  <IconButton
                    icon={Menu}
                    label="Mở menu"
                    onClick={() => setMobileNavOpen((prev) => !prev)}
                    className="lg:hidden"
                  />
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center justify-center gap-2 rounded-sm border border-[var(--primary)] bg-white/80 px-5 py-2 text-[10px] uppercase tracking-[0.12em] font-medium text-[var(--foreground)] shadow-sm transition-all hover:bg-[var(--primary)] hover:text-white focus-visible:outline-none"
                >
                  <User className="h-3.5 w-3.5" />
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {mobileNavOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--card)]/98 px-4 py-4 lg:hidden">
          {auth ? (
            <nav className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="rounded-xl border border-transparent px-3 py-2 text-sm uppercase tracking-[0.4em] text-[var(--foreground)] hover:bg-[var(--muted)]"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-3 flex flex-col gap-2 text-sm">
                <button
                  type="button"
                  className="rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left"
                  onClick={() => {
                    navigate('/orders');
                    setMobileNavOpen(false);
                  }}
                >
                  Đơn hàng
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left"
                  onClick={() => {
                    navigate('/wishlist');
                    setMobileNavOpen(false);
                  }}
                >
                  Yêu thích
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left"
                  onClick={() => {
                    navigate('/reviews');
                    setMobileNavOpen(false);
                  }}
                >
                  Đánh giá của tôi
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left"
                  onClick={() => {
                    navigate('/profile');
                    setMobileNavOpen(false);
                  }}
                >
                  Hồ sơ của tôi
                </button>
                <button
                  type="button"
                  className="rounded-xl border border-transparent bg-[var(--muted)] px-3 py-2 text-left"
                  onClick={handleLogout}
                >
                  Đăng xuất
                </button>
              </div>
            </nav>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-transparent bg-[var(--primary)] px-4 py-3 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-md"
                onClick={() => {
                  navigate('/login');
                  setMobileNavOpen(false);
                }}
              >
                <User className="h-4 w-4" />
                Đăng nhập
              </button>
            </div>
          )}
        </div>
      )}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để sử dụng tính năng này."
      />

      {/* Full-screen search overlay */}
      {searchOpen && createPortal(
        <div
          className="fixed inset-0 z-[200] flex flex-col"
          style={{ animation: 'fadeInOverlay 0.22s ease' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSearchOpen(false)}
          />

          {/* Search panel */}
          <div className="relative z-10 bg-[var(--background)] px-4 pt-8 pb-10 md:px-8">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-4 top-4 p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors md:right-8"
              aria-label="Đóng tìm kiếm"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto max-w-2xl">
              <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#7B9BB2]">Tìm kiếm</p>

              {/* Search form */}
              <form onSubmit={handleSearchSubmit} className="relative">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--muted-foreground)]" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Tìm sản phẩm, bộ sưu tập..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-b-2 border-[var(--foreground)] bg-transparent pl-8 pr-16 pb-3 text-xl font-light text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]/50 focus:outline-none md:text-2xl"
                  autoComplete="off"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                    aria-label="Xóa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Suggestions */}
              <div className="mt-2">
                {searchLoading && (
                  <div className="flex items-center gap-2 py-4 text-xs text-[var(--muted-foreground)]">
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-[var(--primary)] border-t-transparent" />
                    Đang tìm kiếm...
                  </div>
                )}
                {!searchLoading && searchTerm.trim().length >= 2 && searchSuggestions.length === 0 && (
                  <p className="py-4 text-sm text-[var(--muted-foreground)]">
                    Không tìm thấy kết quả cho &ldquo;{searchTerm}&rdquo;.
                  </p>
                )}
                {!searchLoading && searchSuggestions.length > 0 && (
                  <ul className="divide-y divide-[var(--border)]/40">
                    {searchSuggestions.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(`/products/${item.slug}`);
                          }}
                          className="flex w-full items-center gap-4 py-3 text-left transition-colors hover:text-[#7B9BB2]"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden border border-[var(--border)]/60 bg-[var(--muted)]">
                            {item.thumbnailUrl ? (
                              <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
                            ) : null}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium tracking-wide">{item.name}</p>
                            <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                              Xem sản phẩm
                            </p>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
};

export default SiteHeader;


