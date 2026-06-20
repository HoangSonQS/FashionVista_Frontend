# Editorial Storefront Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign FashionVista storefront with Luxury Understated aesthetic — Dusty Blue brand color, editorial product sections on HomePage, ProductCard badge system, and top filter bar on ProductList.

**Architecture:** Four sequential tasks — foundation (colors + types + service) → ProductCard → HomePage → ProductList. Each task is independently type-checkable and committable.

**Tech Stack:** React 18 + Vite, TypeScript strict, Tailwind CSS v4, React Router DOM v6, Axios, Lucide React icons

## Global Constraints

- TypeScript strict — no `any` without explicit justification comment
- Tailwind CSS v4 — utility classes only, no CSS modules, no new npm packages
- Brand color: Dusty Blue `#7B9BB2`, hover darker `#5E8A9F`
- Never modify `.env` files
- Verify each task: `cd D:\FashionVista\FashionVista_Frontend && npx tsc --noEmit`
- Spec: `docs/superpowers/specs/2026-06-20-editorial-storefront-design.md`

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/index.css` | Modify | Update `--primary` and related vars to Dusty Blue; add `.scrollbar-none` |
| `src/types/product.ts` | Modify | Add `tags?: string[] \| null` to `ProductListItem` |
| `src/services/productService.ts` | Modify | Add `tag?: string` and `sort?: SortOption` to `ProductQueryParams` |
| `src/components/common/ProductCard.tsx` | Modify | Badge system (NEW/SALE/EXCLUSIVE) + `isNew`/`tags` props |
| `src/pages/public/HomePage.tsx` | Modify | Replace tab system with 3 editorial sections |
| `src/pages/public/ProductList.tsx` | Modify | Replace sidebar with sticky top filter bar, remove hover CTA |

---

### Task 1: Brand Color + Types + Service

**Files:**
- Modify: `src/index.css`
- Modify: `src/types/product.ts`
- Modify: `src/services/productService.ts`

**Interfaces:**
- Produces: CSS `--primary: #7B9BB2` and related vars; `ProductListItem.tags?: string[] | null`; `ProductQueryParams.tag?: string`, `ProductQueryParams.sort?: 'newest' | 'price_asc' | 'price_desc'`

- [ ] **Step 1: Update CSS primary color block in `src/index.css`**

Replace lines 23–27 (the `/* === Primary Button & Actions === */` block):

```css
/* === Primary Button & Actions (Dusty Blue) === */
--primary: #7B9BB2;
--primary-foreground: #FFFFFF;
--primary-hover: #5E8A9F;
--primary-focus: #9BB8C8;
```

Then update every other reference to the old `#7FAFD6` blue in the same file:

```css
--input-border-focus: #7B9BB2;
--checkbox-checked: #7B9BB2;
--auth-text-link: #5E8A9F;
--auth-focus-ring: #9BB8C8;
--auth-button-bg: #7B9BB2;
--primary-focus-ring: rgba(123, 155, 178, 0.32);
--scrollbar-thumb-hover: #7B9BB2;
```

Update `::selection` (near top of file):
```css
::selection {
  background: rgba(123, 155, 178, 0.28);
  color: var(--foreground);
}
```

Add `.scrollbar-none` utility at the very end of `src/index.css`:
```css
.scrollbar-none {
  scrollbar-width: none;
}
.scrollbar-none::-webkit-scrollbar {
  display: none;
}
```

- [ ] **Step 2: Add `tags` to `ProductListItem` in `src/types/product.ts`**

After `colors?: string[] | null;`, add one line:

```ts
tags?: string[] | null;
```

Full updated interface:
```ts
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  compareAtPrice?: number;
  status: string;
  featured: boolean;
  isVisible?: boolean;
  variantsCount?: number;
  totalStock?: number;
  visibleUpdatedAt?: string;
  category?: string | null;
  thumbnailUrl?: string | null;
  hoverThumbnailUrl?: string | null;
  sizes?: string[] | null;
  colors?: string[] | null;
  tags?: string[] | null;
}
```

- [ ] **Step 3: Add `tag` and `sort` to `ProductQueryParams` in `src/services/productService.ts`**

```ts
export interface ProductQueryParams {
  category?: string;
  search?: string;
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  tag?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc';
}
```

No other changes needed — `getProducts` already spreads `rest` (which includes `tag` and `sort`) into the query params automatically.

- [ ] **Step 4: Type check**

```powershell
cd D:\FashionVista\FashionVista_Frontend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 5: Commit**

```powershell
cd D:\FashionVista\FashionVista_Frontend
git add src/index.css src/types/product.ts src/services/productService.ts
git commit -m "feat(ui): update brand color to Dusty Blue, add tags/sort to product types"
```

---

### Task 2: ProductCard Badge System

**Files:**
- Modify: `src/components/common/ProductCard.tsx`

**Interfaces:**
- Consumes: `ProductListItem.tags?: string[] | null` (Task 1)
- Produces: `BasicProductCardProps` with `isNew?: boolean`, `tags?: string[] | null`; badge renders `NEW | SALE | EXCLUSIVE` (priority order); existing callers unaffected (both props optional)

- [ ] **Step 1: Replace `src/components/common/ProductCard.tsx`**

```tsx
import { Link } from 'react-router-dom';

const formatCurrency = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toLocaleString('vi-VN')}₫`;
};

export interface BasicProductCardProps {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  thumbnailUrl: string | null;
  hoverThumbnailUrl?: string | null;
  isNew?: boolean;
  tags?: string[] | null;
}

export const ProductCard = ({
  slug,
  name,
  price,
  compareAtPrice,
  thumbnailUrl,
  hoverThumbnailUrl,
  isNew,
  tags,
}: BasicProductCardProps) => {
  const hasDiscount = typeof compareAtPrice === 'number' && compareAtPrice > price;
  const hasHoverImage = Boolean(hoverThumbnailUrl && hoverThumbnailUrl !== thumbnailUrl);

  const badge = (() => {
    if (isNew) return 'NEW';
    if (hasDiscount) return 'SALE';
    if (tags?.includes('Luxury')) return 'EXCLUSIVE';
    return null;
  })();

  return (
    <div className="group relative bg-transparent">
      <Link to={`/products/${slug}`} className="block">
        <div
          className={`relative overflow-hidden aspect-[3/4] bg-[var(--muted)] ${
            hasHoverImage ? 'product-card-image-frame' : ''
          }`}
        >
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={name}
                className="product-card-image product-card-image-primary"
              />
              {hasHoverImage && (
                <img
                  src={hoverThumbnailUrl ?? ''}
                  alt={name}
                  className="product-card-image product-card-image-secondary"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]">
              <span className="text-[10px] uppercase tracking-widest">No Image</span>
            </div>
          )}
          {badge && (
            <div className="absolute left-3 top-3 bg-white/90 px-2 py-0.5 text-[9px] font-light uppercase tracking-[0.2em] text-[var(--foreground)] shadow-sm">
              {badge}
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4 px-1 text-center">
        <Link to={`/products/${slug}`}>
          <h3 className="line-clamp-1 text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--foreground)] transition-colors hover:text-[var(--primary)]">
            {name}
          </h3>
        </Link>
        <div className="mt-1.5 flex flex-col items-center gap-1">
          <span className="text-[11px] font-light text-[var(--foreground)] tracking-wider">
            {formatCurrency(price)}
          </span>
          {hasDiscount && typeof compareAtPrice === 'number' && (
            <span className="text-[10px] text-[var(--muted-foreground)] line-through font-light tracking-wide">
              {formatCurrency(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 2: Type check**

```powershell
cd D:\FashionVista\FashionVista_Frontend
npx tsc --noEmit
```

Expected: No errors. Existing callers (CategoryPage, SalePage, CollectionDetail, SearchResults) don't pass `isNew`/`tags` — that's fine, both are optional.

- [ ] **Step 3: Commit**

```powershell
cd D:\FashionVista\FashionVista_Frontend
git add src/components/common/ProductCard.tsx
git commit -m "feat(ui): add NEW/SALE/EXCLUSIVE badge system to ProductCard, remove hover CTA"
```

---

### Task 3: HomePage Editorial Sections

**Files:**
- Modify: `src/pages/public/HomePage.tsx`

**Interfaces:**
- Consumes: `BasicProductCardProps.isNew`, `BasicProductCardProps.tags` (Task 2); `ProductQueryParams.tag` (Task 1); `productService.getProducts`, `productService.getNewArrivals`, `productService.getCategories`
- Produces: HomePage with 3 vertical editorial sections; tab system removed; `useMemo` on carousel removed (slides are stable JSX, no deps)

- [ ] **Step 1: Replace `src/pages/public/HomePage.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import type { CategorySummary, ProductListItem } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';
import { Carousel } from '../../components/common/Carousel';
import type { EmblaOptionsType } from 'embla-carousel';

const CAROUSEL_OPTIONS: EmblaOptionsType = { loop: true };

interface EditorialSectionProps {
  label: string;
  heading: string;
  caption?: string;
  linkText: string;
  linkHref: string;
  products: ProductListItem[];
  loading: boolean;
  isNewSection?: boolean;
  background?: string;
}

const EditorialSection = ({
  label,
  heading,
  caption,
  linkText,
  linkHref,
  products,
  loading,
  isNewSection = false,
  background = 'bg-[var(--background)]',
}: EditorialSectionProps) => {
  if (!loading && products.length === 0) return null;

  return (
    <section className={`${background} py-20 md:py-28`}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#7B9BB2]">{label}</p>
            <h2 className="mt-2 font-serif text-2xl font-light uppercase tracking-[0.12em] md:text-3xl">
              {heading}
            </h2>
            {caption && (
              <p className="mt-2 text-[11px] font-light text-[var(--muted-foreground)] tracking-wide">
                {caption}
              </p>
            )}
          </div>
          <Link
            to={linkHref}
            className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--foreground)] hover:text-[#7B9BB2] transition-colors"
          >
            {linkText} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[var(--border)]" />
                <div className="mt-4 h-3 w-3/4 rounded bg-[var(--border)] mx-auto" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[var(--border)] mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                thumbnailUrl={product.thumbnailUrl ?? null}
                hoverThumbnailUrl={product.hoverThumbnailUrl}
                isNew={isNewSection}
                tags={product.tags ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const carouselSlides = [
  <div
    key={1}
    className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-cover bg-center"
    style={{ backgroundImage: 'url(/sixthsoul-banner.png)' }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-black/44 via-black/16 to-transparent" />
    <div className="absolute inset-x-0 bottom-12 md:bottom-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8 text-white">
        <h1 className="max-w-2xl text-4xl md:text-7xl font-serif mb-4">New Season Edit</h1>
        <p className="max-w-xl text-sm md:text-base font-light mb-8 tracking-wide">
          Những thiết kế nữ tính, thanh lịch cho nhịp sống hiện đại.
        </p>
        <Link
          to="/products"
          className="inline-block border border-white bg-white text-[var(--foreground)] px-8 py-3 text-[11px] font-medium tracking-widest uppercase hover:bg-transparent hover:text-white transition-all duration-300"
        >
          Khám phá ngay
        </Link>
      </div>
    </div>
  </div>,
  <div
    key={2}
    className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-cover bg-center"
    style={{ backgroundImage: 'url(/sixthsoul-banner-02.png)' }}
  >
    <Link to="/collections" className="absolute inset-0" aria-label="Xem bộ sưu tập White Romance" />
  </div>,
  <div
    key={3}
    className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-cover bg-center"
    style={{ backgroundImage: 'url(/sixthsoul-banner-03.png)' }}
  >
    <Link to="/sale" className="absolute inset-0" aria-label="Xem ưu đãi Puffy Dress" />
  </div>,
];

const HomePage = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductListItem[]>([]);
  const [luxuryProducts, setLuxuryProducts] = useState<ProductListItem[]>([]);
  const [museProducts, setMuseProducts] = useState<ProductListItem[]>([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingLuxury, setLoadingLuxury] = useState(true);
  const [loadingMuse, setLoadingMuse] = useState(true);

  useEffect(() => {
    const loadBase = async () => {
      try {
        const [cats, newProducts] = await Promise.all([
          productService.getCategories().catch(() => [] as CategorySummary[]),
          productService.getNewArrivals(8).catch(() => [] as ProductListItem[]),
        ]);
        setCategories(cats);
        setNewArrivals(newProducts);
      } catch {
        showToast('Không thể tải dữ liệu trang chủ.', 'error');
      } finally {
        setLoadingNew(false);
      }
    };
    void loadBase();
  }, [showToast]);

  useEffect(() => {
    productService
      .getProducts({ tag: 'Luxury', pageSize: 4 })
      .then((res) => setLuxuryProducts(res.items))
      .catch(() => undefined)
      .finally(() => setLoadingLuxury(false));
  }, []);

  useEffect(() => {
    productService
      .getProducts({ tag: 'Muse', pageSize: 4 })
      .then((res) => setMuseProducts(res.items))
      .catch(() => undefined)
      .finally(() => setLoadingMuse(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section id="home-hero" className="relative w-full">
        <Carousel slides={carouselSlides} options={CAROUSEL_OPTIONS} />
      </section>

      <EditorialSection
        label="Online Shop"
        heading="The New Season"
        caption="Những thiết kế mới nhất mùa này"
        linkText="View all"
        linkHref="/products"
        products={newArrivals}
        loading={loadingNew}
        isNewSection
      />

      <EditorialSection
        label="Curated Edit"
        heading="The Luxury Edit"
        linkText="Khám phá"
        linkHref="/products"
        products={luxuryProducts}
        loading={loadingLuxury}
      />

      <EditorialSection
        label="Signature Piece"
        heading="The Muse"
        linkText="Xem thêm"
        linkHref="/products"
        products={museProducts}
        loading={loadingMuse}
        background="bg-[var(--muted)]"
      />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-[var(--background)] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-light tracking-[0.12em] uppercase">
                Danh mục
              </h2>
              <Link
                to="/products"
                className="flex items-center gap-1 text-xs font-light text-[#7B9BB2] hover:underline tracking-wider uppercase"
              >
                Xem tất cả <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  to={`/categories/${category.slug}`}
                  className="group text-center transition-all"
                >
                  <div className="mb-4 aspect-square bg-[var(--muted)] overflow-hidden rounded-sm border border-[var(--border)]/30">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[var(--muted)] group-hover:bg-[var(--border)] transition-colors">
                        <span className="text-[10px] text-[var(--muted-foreground)] uppercase tracking-widest">
                          {category.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banner */}
      <section className="bg-[var(--foreground)] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-light text-white tracking-[0.12em] uppercase">
            Giảm giá lên đến 50%
          </h2>
          <p className="mb-8 text-sm md:text-base text-white/90 font-light tracking-wide">
            Khám phá bộ sưu tập sale với nhiều ưu đãi hấp dẫn
          </p>
          <Link
            to="/products"
            className="inline-block border border-white text-white px-8 py-3 text-xs font-light tracking-widest uppercase hover:bg-white hover:text-[var(--foreground)] transition-all duration-300"
          >
            Mua ngay
          </Link>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[var(--background)] border-t border-[var(--border)] py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-8 text-center">
          <h2 className="mb-4 text-2xl md:text-3xl font-light tracking-[0.1em] uppercase font-serif">
            SixthSoul Newsletter
          </h2>
          <p className="mb-10 text-[12px] text-[var(--muted-foreground)] font-light tracking-wide uppercase">
            Join our society for early access and exclusive collection updates.
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className="flex-1 border-b border-[var(--border)] bg-transparent px-0 py-3 text-[11px] font-light tracking-widest placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[#7B9BB2] transition-colors uppercase"
            />
            <button className="text-[10px] font-medium tracking-[0.2em] uppercase hover:text-[#7B9BB2] transition-all duration-300">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
```

- [ ] **Step 2: Type check**

```powershell
cd D:\FashionVista\FashionVista_Frontend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Commit**

```powershell
cd D:\FashionVista\FashionVista_Frontend
git add src/pages/public/HomePage.tsx
git commit -m "feat(ui): replace tab system with editorial sections on HomePage"
```

---

### Task 4: ProductList — Top Filter Bar

**Files:**
- Modify: `src/pages/public/ProductList.tsx`

**Interfaces:**
- Consumes: `BasicProductCardProps.isNew`, `BasicProductCardProps.tags` (Task 2); `ProductQueryParams.sort` (Task 1)
- Produces: ProductList with sticky top filter bar (category pills + sort dropdown + "Lọc thêm" popover); full-width 3-col grid; no hover CTA; no sidebar; no search input

**Notes:**
- `FilterState` gains `sort?: 'newest' | 'price_asc' | 'price_desc'`
- `search` field removed from `FilterState` (SiteHeader handles search)
- "Lọc thêm" uses local pending state — applied only on button click, not on keystroke
- Variant modal retained for future use (quick-add from ProductDetail)
- `scrollbar-none` class defined in Task 1

- [ ] **Step 1: Replace `src/pages/public/ProductList.tsx`**

```tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { productService } from '../../services/productService';
import type {
  CategorySummary,
  ProductListItem,
  ProductListResponse,
  ProductVariant,
} from '../../types/product';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { useStableState } from '../../hooks/useStableState';
import { cartService } from '../../services/cartService';
import { emitCartUpdated } from '../../utils/cartEvents';
import { useCartDrawer } from '../../context/CartDrawerContext';
import { LoginModal } from '../../components/common/LoginModal';
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';
import { getAuthSession } from '../../services/authSession';

type SortOption = 'newest' | 'price_asc' | 'price_desc';

interface FilterState {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  page?: number;
  sort?: SortOption;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Mới nhất',
  price_asc: 'Giá: Thấp → Cao',
  price_desc: 'Giá: Cao → Thấp',
};

const ProductList = () => {
  const location = useLocation();
  const listRef = useRef<HTMLDivElement>(null);
  const filterPopoverRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useStableState<FilterState>({});
  const debouncedFilters = useDebouncedValue(filters, 450);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [data, setData] = useState<ProductListResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quickAddLoading, setQuickAddLoading] = useState<Record<number, boolean>>({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const { openDrawer } = useCartDrawer();
  const { showToast } = useToast();
  const [variantModal, setVariantModal] = useState<{
    product: ProductListItem;
    variants: ProductVariant[];
    mode: 'add' | 'buy';
  } | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [variantSubmitting, setVariantSubmitting] = useState(false);

  // Local pending state for "Lọc thêm" — applied only on confirm
  const [pendingMinPrice, setPendingMinPrice] = useState('');
  const [pendingMaxPrice, setPendingMaxPrice] = useState('');
  const [pendingSize, setPendingSize] = useState('');
  const [pendingColor, setPendingColor] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const cat = searchParams.get('category');
    if (cat) setFilters((prev) => ({ ...prev, category: cat }));
  }, [location.search, setFilters]);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (listRef.current) {
        const top = listRef.current.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error, showToast]);

  useEffect(() => {
    const fetchProducts = async () => {
      setError(null);
      try {
        const response = await productService.getProducts({
          category: debouncedFilters.category,
          size: debouncedFilters.size,
          color: debouncedFilters.color,
          minPrice: debouncedFilters.minPrice,
          maxPrice: debouncedFilters.maxPrice,
          sort: debouncedFilters.sort,
          page: debouncedFilters.page,
        });
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách sản phẩm.');
      }
    };
    void fetchProducts();
  }, [debouncedFilters]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterPopoverRef.current && !filterPopoverRef.current.contains(e.target as Node)) {
        setShowFilterPopover(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const products: ProductListItem[] = useMemo(() => data?.items ?? [], [data]);

  const activeFiltersCount = [filters.minPrice, filters.maxPrice, filters.size, filters.color].filter(
    Boolean,
  ).length;

  const applyExtraFilters = () => {
    setFilters((prev) => ({
      ...prev,
      page: undefined,
      minPrice: pendingMinPrice ? Number(pendingMinPrice) : undefined,
      maxPrice: pendingMaxPrice ? Number(pendingMaxPrice) : undefined,
      size: pendingSize || undefined,
      color: pendingColor || undefined,
    }));
    setShowFilterPopover(false);
  };

  const clearAllFilters = () => {
    setFilters({});
    setPendingMinPrice('');
    setPendingMaxPrice('');
    setPendingSize('');
    setPendingColor('');
  };

  const ensureAuthenticated = () => {
    if (!getAuthSession('user')) {
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  const openVariantSelection = (product: ProductListItem, variants: ProductVariant[], mode: 'add' | 'buy') => {
    setVariantModal({ product, variants, mode });
    const first = variants[0];
    setSelectedColor(first?.color ?? null);
    setSelectedSize(first?.size ?? null);
  };

  const handleQuickAdd = async (product: ProductListItem) => {
    if (!ensureAuthenticated()) return;
    setQuickAddLoading((prev) => ({ ...prev, [product.id]: true }));
    try {
      const detail = await productService.getProduct(product.slug);
      const availableVariants = detail.variants.filter((v) => v.active && v.stock > 0);
      if (availableVariants.length === 0) {
        showToast('Sản phẩm đã hết hàng.', 'error');
        return;
      }
      const hasSelectableVariant = availableVariants.some(
        (v) => (v.size && v.size.trim().length > 0) || (v.color && v.color.trim().length > 0),
      );
      if (!hasSelectableVariant) {
        const variant = availableVariants[0];
        const cart = await cartService.addItem(variant.sku, 1);
        emitCartUpdated(cart);
        openDrawer({ cart });
        showToast('Đã thêm vào giỏ hàng.', 'success');
      } else {
        openVariantSelection(product, availableVariants, 'add');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm vào giỏ hàng.';
      showToast(message, 'error');
      if (message.includes('Unauthorized')) setShowLoginModal(true);
    } finally {
      setQuickAddLoading((prev) => {
        const next = { ...prev };
        delete next[product.id];
        return next;
      });
    }
  };

  const handleConfirmVariant = async () => {
    if (!variantModal) {
      showToast('Vui lòng chọn biến thể.', 'error');
      return;
    }
    const variant = variantModal.variants.find(
      (v) => (v.color ?? null) === selectedColor && (v.size ?? null) === selectedSize,
    );
    if (!variant) {
      showToast('Biến thể không hợp lệ.', 'error');
      return;
    }
    setVariantSubmitting(true);
    try {
      const cart = await cartService.addItem(variant.sku, 1);
      emitCartUpdated(cart);
      openDrawer({ cart });
      if (variantModal.mode === 'add') showToast('Đã thêm vào giỏ hàng.', 'success');
      setVariantModal(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể thêm sản phẩm với biến thể đã chọn.';
      showToast(message, 'error');
    } finally {
      setVariantSubmitting(false);
    }
  };

  return (
    <div ref={listRef} className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-16">

      {/* Sticky Top Filter Bar */}
      <div className="sticky top-[64px] z-20 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-none">

            <button
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, category: undefined, page: undefined }))}
              className={`whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border transition-colors shrink-0 ${
                !filters.category
                  ? 'bg-[#7B9BB2] text-white border-[#7B9BB2]'
                  : 'border-[var(--border)] text-[var(--foreground)] hover:border-[#7B9BB2]'
              }`}
            >
              Tất cả
            </button>

            {categories.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, category: cat.slug, page: undefined }))}
                className={`whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border transition-colors shrink-0 ${
                  filters.category === cat.slug
                    ? 'bg-[#7B9BB2] text-white border-[#7B9BB2]'
                    : 'border-[var(--border)] text-[var(--foreground)] hover:border-[#7B9BB2]'
                }`}
              >
                {cat.name}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2 shrink-0">
              {/* Lọc thêm popover */}
              <div className="relative" ref={filterPopoverRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowFilterPopover((v) => !v);
                    setShowSortDropdown(false);
                  }}
                  className="flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border border-[var(--border)] hover:border-[#7B9BB2] transition-colors"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  Lọc thêm
                  {activeFiltersCount > 0 && (
                    <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#7B9BB2] text-[8px] text-white">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {showFilterPopover && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--card)] border border-[var(--border)] shadow-lg z-30 p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Giá từ
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={pendingMinPrice}
                          onChange={(e) => setPendingMinPrice(e.target.value)}
                          className="number-input w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Đến
                        </label>
                        <input
                          type="number"
                          min={0}
                          placeholder="5.000.000"
                          value={pendingMaxPrice}
                          onChange={(e) => setPendingMaxPrice(e.target.value)}
                          className="number-input w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Size
                        </label>
                        <input
                          type="text"
                          placeholder="S, M..."
                          value={pendingSize}
                          onChange={(e) => setPendingSize(e.target.value)}
                          className="w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                          Màu
                        </label>
                        <input
                          type="text"
                          placeholder="Black..."
                          value={pendingColor}
                          onChange={(e) => setPendingColor(e.target.value)}
                          className="w-full border border-[var(--border)] bg-transparent px-2 py-1.5 text-[11px] focus:outline-none focus:border-[#7B9BB2]"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="flex-1 border border-[var(--border)] py-1.5 text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
                      >
                        Xóa lọc
                      </button>
                      <button
                        type="button"
                        onClick={applyExtraFilters}
                        className="flex-1 bg-[#7B9BB2] py-1.5 text-[10px] uppercase tracking-wide text-white hover:bg-[#5E8A9F] transition-colors"
                      >
                        Áp dụng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Sort dropdown */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setShowSortDropdown((v) => !v);
                    setShowFilterPopover(false);
                  }}
                  className="flex items-center gap-1.5 whitespace-nowrap px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] border border-[var(--border)] hover:border-[#7B9BB2] transition-colors"
                >
                  {filters.sort ? SORT_LABELS[filters.sort] : 'Sắp xếp'}
                  <ChevronDown className="h-3 w-3" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[var(--card)] border border-[var(--border)] shadow-lg z-30">
                    {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => {
                          setFilters((prev) => ({ ...prev, sort: value, page: undefined }));
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2.5 text-left text-[10px] uppercase tracking-wide hover:bg-[var(--muted)] transition-colors ${
                          filters.sort === value ? 'text-[#7B9BB2] font-medium' : 'text-[var(--foreground)]'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto max-w-6xl px-4 pt-10">
        <div className="grid gap-x-4 gap-y-10 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              slug={product.slug}
              name={product.name}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              thumbnailUrl={product.thumbnailUrl ?? null}
              hoverThumbnailUrl={product.hoverThumbnailUrl}
              tags={product.tags ?? []}
            />
          ))}
        </div>

        {data && data.totalPages > 1 && (
          <div className="mt-12 flex items-center justify-between text-sm text-[var(--muted-foreground)]">
            <span>Trang {data.page + 1}/{data.totalPages}</span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={data.page === 0}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) - 1 }))}
                className="px-4 py-1.5 border border-[var(--border)] text-[10px] uppercase tracking-wide disabled:opacity-40 hover:border-[#7B9BB2] transition-colors"
              >
                Trước
              </button>
              <button
                type="button"
                disabled={data.page + 1 >= data.totalPages}
                onClick={() => setFilters((prev) => ({ ...prev, page: (prev.page ?? 0) + 1 }))}
                className="px-4 py-1.5 border border-[var(--border)] text-[10px] uppercase tracking-wide disabled:opacity-40 hover:border-[#7B9BB2] transition-colors"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng hoặc mua ngay."
      />

      {variantModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md max-h-[80vh] rounded-3xl bg-[var(--card)] shadow-2xl border border-[var(--border)] flex flex-col">
            <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-[var(--border)]">
              <div>
                <p className="text-sm font-semibold">Chọn biến thể</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Vui lòng chọn đầy đủ thuộc tính trước khi{' '}
                  {variantModal.mode === 'add' ? 'thêm vào giỏ.' : 'mua ngay.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVariantModal(null)}
                className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                Đóng
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {(() => {
                const colors = Array.from(
                  new Set(
                    variantModal.variants
                      .map((v) => v.color)
                      .filter((c): c is string => Boolean(c && c.trim().length > 0)),
                  ),
                );
                if (colors.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">Màu sắc</p>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {colors.map((color) => {
                        const hasStock = variantModal.variants.some(
                          (v) => v.color === color && v.active && v.stock > 0,
                        );
                        const isActive = selectedColor === color && hasStock;
                        return (
                          <button
                            key={color}
                            type="button"
                            disabled={!hasStock}
                            onClick={() => hasStock && setSelectedColor(color)}
                            className={`whitespace-nowrap rounded-full border px-3.5 py-2 text-xs transition-colors ${
                              isActive
                                ? 'border-[#7B9BB2] bg-[#7B9BB2] text-white shadow-sm ring-2 ring-[#7B9BB2]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#7B9BB2]'
                            } ${!hasStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {color}
                            {!hasStock && <span className="ml-1 text-[10px]">(Hết hàng)</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {(() => {
                const baseVariants =
                  selectedColor != null
                    ? variantModal.variants.filter((v) => v.color === selectedColor)
                    : variantModal.variants;
                const sizes = Array.from(
                  new Set(
                    baseVariants
                      .map((v) => v.size)
                      .filter((s): s is string => Boolean(s && s.trim().length > 0)),
                  ),
                );
                if (sizes.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[var(--muted-foreground)]">Kích cỡ</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {sizes.map((size) => {
                        const hasStock = baseVariants.some(
                          (v) => v.size === size && v.active && v.stock > 0,
                        );
                        const isActive = selectedSize === size && hasStock;
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!hasStock}
                            onClick={() => hasStock && setSelectedSize(size)}
                            className={`rounded-lg border px-2 py-1.5 text-xs text-center transition-colors ${
                              isActive
                                ? 'border-[#7B9BB2] bg-[#7B9BB2] text-white shadow-sm ring-2 ring-[#7B9BB2]'
                                : 'border-[var(--border)] text-[var(--muted-foreground)] hover:border-[#7B9BB2]'
                            } ${!hasStock ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {size}
                            {!hasStock && <span className="block text-[10px] mt-0.5">Hết hàng</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              {(() => {
                const variant = variantModal.variants.find(
                  (v) => (v.color ?? null) === selectedColor && (v.size ?? null) === selectedSize,
                );
                if (!variant) {
                  return (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Vui lòng chọn đầy đủ màu sắc và kích cỡ còn hàng.
                    </p>
                  );
                }
                return (
                  <div className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--card)]/60 p-3 space-y-1.5 text-xs">
                    <p className="font-semibold text-sm">{variant.price.toLocaleString('vi-VN')}₫</p>
                    <p className="text-[var(--muted-foreground)]">
                      SKU: <span className="font-mono">{variant.sku}</span>
                    </p>
                    <p className="text-[var(--muted-foreground)]">
                      Tồn kho: {variant.stock}
                      {variant.stock <= 0 && (
                        <span className="text-[var(--error)] font-medium"> (Hết hàng)</span>
                      )}
                    </p>
                    <p className="text-[var(--muted-foreground)]">
                      Thuộc tính:{' '}
                      <span className="font-medium">
                        {variant.color && `Màu: ${variant.color}`}
                        {variant.size && (variant.color ? ' • ' : '')}
                        {variant.size && `Size: ${variant.size}`}
                      </span>
                    </p>
                  </div>
                );
              })()}
            </div>
            <div className="border-t border-[var(--border)] px-5 py-4">
              <button
                type="button"
                onClick={handleConfirmVariant}
                disabled={variantSubmitting}
                className="w-full rounded-full bg-[#7B9BB2] py-2.5 text-sm font-semibold text-white hover:bg-[#5E8A9F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {variantSubmitting
                  ? 'Đang xử lý...'
                  : variantModal.mode === 'add'
                  ? 'Thêm vào giỏ hàng'
                  : 'Mua ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
```

- [ ] **Step 2: Type check**

```powershell
cd D:\FashionVista\FashionVista_Frontend
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 3: Lint check**

```powershell
cd D:\FashionVista\FashionVista_Frontend
npm run lint
```

Expected: No new errors beyond pre-existing warnings.

- [ ] **Step 4: Commit**

```powershell
cd D:\FashionVista\FashionVista_Frontend
git add src/pages/public/ProductList.tsx
git commit -m "feat(ui): replace sidebar with top filter bar on ProductList"
```

---

## Self-Review

**Spec coverage:**
- [x] `--primary` → `#7B9BB2` — Task 1, Step 1
- [x] `tags` on `ProductListItem` — Task 1, Step 2
- [x] `tag`/`sort` on `ProductQueryParams` — Task 1, Step 3
- [x] Badge `NEW/SALE/EXCLUSIVE` — Task 2
- [x] Hover CTA removed from ProductCard — Task 2 (not present in new component)
- [x] Hover CTA wrapper removed from ProductList — Task 4 (not present in new file)
- [x] Editorial sections: New Season, Luxury Edit, The Muse — Task 3
- [x] Conditional sections (empty → hidden) — Task 3 (`if (!loading && products.length === 0) return null`)
- [x] Serif headings on editorial sections — Task 3 (`font-serif` class)
- [x] Dusty Blue accent on labels — Task 3 (`text-[#7B9BB2]`)
- [x] Top filter bar with category pills — Task 4
- [x] Active category pill → Dusty Blue — Task 4
- [x] Sort dropdown — Task 4
- [x] "Lọc thêm" popover with price/size/color — Task 4
- [x] Outside click closes popovers — Task 4, `handleClickOutside`
- [x] Full-width grid 3-col desktop / 2-col mobile — Task 4
- [x] Search removed from ProductList — Task 4 (`search` not in `FilterState`)
- [x] Pagination kept — Task 4
- [x] Variant modal kept — Task 4
- [x] `scrollbar-none` for filter bar — Task 1 (CSS), Task 4 (usage)
- [x] `handleQuickAdd` kept in ProductList (for variant modal flow) — Task 4

**Type consistency:** `SortOption` defined inline in Task 4; `ProductQueryParams.sort` uses same union type from Task 1. `tags?: string[] | null` propagates from Task 1 → Task 2 (prop) → Task 3 (passed) → Task 4 (passed).
