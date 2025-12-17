import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Menu, Search, ShoppingBag, User, type LucideIcon } from 'lucide-react';

import type { AuthResponse } from '../../types/auth';
import { cartService } from '../../services/cartService';
import { wishlistService } from '../../services/wishlistService';
import { AUTH_CHANGE_EVENT, CART_UPDATED_EVENT } from '../../constants/events';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../common/LoginModal';
import { productService } from '../../services/productService';
import type { SearchSuggestion } from '../../types/product';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const NAV_ITEMS = [
  { label: 'THE NEW', href: '/?section=new' },
  // Dẫn tới trang danh sách bộ sưu tập public
  { label: 'BỘ SƯU TẬP', href: '/collections' },
  { label: 'SALE', href: '/sale' },
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
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-md border border-transparent bg-[#4DA3E8] text-white transition-colors hover:bg-[#3A8BC7] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4DA3E8] ${className}`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {badge !== undefined && badge > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-white px-1 text-[10px] font-semibold text-[#4DA3E8]">
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

  // Tự động focus input khi mở search
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!searchOpen) {
      setSearchSuggestions([]);
    }
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('auth');
      window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
    }
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
      {/* Top dark grey bar */}
      <div className="h-1 bg-gray-800"></div>
      
      {/* Main header with background đổi màu khi đè lên hero banner */}
      <div
        className={`relative border-b-2 border-[#4DA3E8] ${
          isOverHero ? 'bg-[#4DA3E8]' : 'bg-[#E5F1FB]'
        }`}
      >
        {/* Vertical light streaks effect */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute left-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute left-[40%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute left-[60%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute left-[80%] top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
          <div className="absolute right-0 top-0 h-full w-px bg-gradient-to-b from-transparent via-white to-transparent"></div>
        </div>
        
        <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Brand name - left side */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <Link
                to="/"
                className={`font-serif text-xl md:text-2xl font-bold uppercase tracking-wide transition-colors ${
                  isOverHero ? 'text-[var(--primary-foreground)]' : 'text-[#4DA3E8]'
                }`}
              >
                SIXTHSOUL
              </Link>
            </div>

            {/* Navigation links - center */}
            <div className="flex-1 flex items-center justify-center">
            {searchOpen ? (
              <div className="relative w-full max-w-md origin-right transition-all duration-1000 scale-100 opacity-100">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--input-background)] px-3 py-1.5 shadow-sm">
                  <Search className="h-4 w-4 text-[var(--muted-foreground)]" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Tìm váy, áo, màu sắc, bộ sưu tập..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[var(--foreground)] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-[var(--primary)] px-3 py-1 text-xs font-semibold text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)]"
                  >
                    Tìm
                  </button>
                </form>
                <div className="absolute left-0 right-0 mt-2 max-h-72 overflow-y-auto rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-xl">
                  {!searchLoading && searchTerm.trim().length >= 2 && searchSuggestions.length === 0 && (
                    <div className="px-4 py-2 text-xs text-[var(--muted-foreground)]">
                      Không tìm thấy sản phẩm phù hợp.
                    </div>
                  )}
                  {!searchLoading &&
                    searchSuggestions.map((item) => (
                      <div
                        key={item.slug}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setSearchOpen(false);
                          navigate(`/products/${item.slug}`);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSearchOpen(false);
                            navigate(`/products/${item.slug}`);
                          }
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2 text-left transition-colors cursor-pointer bg-[var(--card)] hover:bg-[var(--background)]"
                      >
                        <div className="h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)]">
                          {item.thumbnailUrl ? (
                            <img src={item.thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-[var(--muted-foreground)]">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1 text-[var(--foreground)]">
                            {item.name}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted-foreground)]">
                            Xem chi tiết sản phẩm
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <nav className="hidden items-center gap-8 md:gap-12 lg:flex">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => {
                      // Scroll to products section after navigation
                      setTimeout(() => {
                        const productsSection = document.getElementById('products-section');
                        if (productsSection) {
                          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 200);
                    }}
                    className={`uppercase text-sm md:text-base font-medium tracking-wider transition-colors ${
                      isOverHero ? 'text-[var(--primary-foreground)] hover:text-white/80' : 'text-[#4DA3E8] hover:text-[#3A8BC7]'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}
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
                    <p className="text-xs text-[var(--muted-foreground)]">{auth.user.email}</p>
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
                className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-[var(--primary-foreground)] shadow-sm transition-all hover:bg-[var(--primary-hover)] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
              >
                <User className="h-4 w-4" />
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
    </header>
  );
};

export default SiteHeader;


