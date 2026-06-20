# Editorial Storefront — Design Spec
**Date:** 2026-06-20  
**Brand:** FashionVista / SixthSoul  
**Aesthetic:** Luxury Understated — minimal, serif typography, muted palette  
**Brand Color:** Dusty Blue `#7B9BB2`

---

## Overview

Refactor the customer-facing storefront across three layers:
1. `ProductCard` — badge system + remove hover CTA
2. `HomePage` — replace tab system with editorial vertical sections
3. `ProductList` — replace sidebar filter with top filter bar

No new pages. No backend changes required (all data fields already exist). Tag-based sections are conditional — hidden if no products match.

---

## 1. Brand Color

Replace `var(--primary)` in the CSS variable definitions with `#7B9BB2` (Dusty Blue). This affects all existing active states, focus rings, and hover accents site-wide.

**Locations to update:**
- `src/index.css` or wherever CSS custom properties are defined — change `--primary` value to `#7B9BB2`
- `--primary-foreground` should remain white (`#ffffff`)

---

## 2. ProductCard

**File:** `src/components/common/ProductCard.tsx`

### Badge System
Display at most one badge per card, evaluated in priority order:

| Priority | Badge | Condition |
|----------|-------|-----------|
| 1 | `NEW` | `isNew === true` (prop, computed by caller from `visibleUpdatedAt < 14 days`) |
| 2 | `SALE` | `compareAtPrice > price` |
| 3 | `EXCLUSIVE` | `tags` array includes `"Luxury"` |

**Badge style:**
- Font: 9px, uppercase, `tracking-[0.2em]`, `font-light`
- Background: `rgba(255,255,255,0.92)`
- No border, no border-radius
- Position: `absolute top-3 left-3 px-2 py-0.5`
- Text color: `var(--foreground)` (dark on white bg)

### Props added to `BasicProductCardProps`
```ts
isNew?: boolean
tags?: string[]
```

### Interaction
- Remove hover "Add to Cart" button entirely — the button lives in `ProductList.tsx` wrapping the card, not inside `ProductCard` itself. In `ProductList.tsx`, delete the `<div className="mt-3 ... opacity-0 group-hover:opacity-100 ...">` block.
- Keep hover image swap (unchanged).
- Entire card is a link to `/products/:slug`.

### Typography
- Product name: keep `text-[11px] font-medium uppercase tracking-[0.16em]`
- Price: keep `text-[11px] font-light`
- No other changes to layout.

---

## 3. HomePage

**File:** `src/pages/public/HomePage.tsx`

### Remove
- `TabType` type and `activeTab` state
- `section` URL param logic
- All tab UI (`activeTab === 'new'`, `activeTab === 'collection'`, `activeTab === 'sale'` blocks)
- `featuredProducts` state (replaced by tag-based sections)
- `saleProducts` state (Sale section removed from homepage; lives on `/sale` page)

### Add: Editorial Sections

Replace the single `#products-section` with three independent vertical sections:

#### Section A — "The New Season"
- Data: `productService.getNewArrivals(8)` — already exists
- Heading label: `Online Shop` (10px, dusty blue `#7B9BB2`, uppercase, tracking wide)
- Heading: `The New Season` (serif, 2xl–3xl, font-light, uppercase, tracking wide)
- Sub-caption: `Những thiết kế mới nhất mùa này` (12px, muted, font-light)
- Grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`, `gap-x-4 gap-y-10`
- "View all" link → `/products`
- Spacing: `py-20 md:py-28`
- Pass `isNew={true}` to every `ProductCard` in this section

#### Section B — "The Luxury Edit"
- Data: `productService.getProducts({ tag: 'Luxury', size: 4 })` — uses existing `getProducts` with tag param. If backend does not yet support `tag` param, fetch `getNewArrivals(20)` and filter client-side by `tags?.includes('Luxury')`.
- **Conditional:** only render if result has `length > 0`
- Heading: `The Luxury Edit`
- Grid: `grid-cols-2 md:grid-cols-4`, 4 products max
- "Khám phá" link → `/products?tag=Luxury` (or `/products`)
- Spacing: `py-20 md:py-28`
- Background: `var(--background)` (same as page)

#### Section C — "The Muse"
- Data: `productService.getProducts({ tag: 'Muse', size: 4 })` — same pattern as B
- **Conditional:** only render if result has `length > 0`
- Heading: `The Muse`
- Grid: same as B
- "Xem thêm" link → `/products`
- Spacing: `py-20 md:py-28`
- **Background:** `var(--muted)` — creates visual separation between sections

### Section heading component pattern
Each editorial section shares the same heading structure:

```tsx
<div className="mb-10 border-b border-[var(--border)] pb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
  <div>
    <p className="text-[10px] uppercase tracking-[0.28em] text-[#7B9BB2]">{label}</p>
    <h2 className="mt-2 font-serif text-2xl font-light uppercase tracking-[0.12em] md:text-3xl">{heading}</h2>
    {caption && <p className="mt-2 text-[11px] font-light text-[var(--muted-foreground)] tracking-wide">{caption}</p>}
  </div>
  <Link to={href} className="text-[10px] font-medium uppercase tracking-[0.22em] hover:text-[#7B9BB2]">
    {linkText}
  </Link>
</div>
```

### Keep unchanged
- Hero Carousel (all 3 slides)
- Categories showcase section
- Promotional banner section
- Newsletter section

---

## 4. ProductList

**File:** `src/pages/public/ProductList.tsx`

### Remove
- Entire sidebar `<div className="bg-white border ... p-4 space-y-4 md:sticky md:top-24">` block
- `grid grid-cols-1 md:grid-cols-4` layout wrapper → replace with single-column layout

### Add: Top Filter Bar

Sticky bar above the product grid:

```
[Tất cả] [Đầm bí] [Đầm 2 dây] [Đầm dài] ...    [Lọc thêm ▾]  [Mới nhất ▾]
```

**Structure:**
```tsx
<div className="sticky top-[64px] z-20 bg-[var(--background)] border-b border-[var(--border)] py-3 mb-8">
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
    {/* Category pills */}
    {/* Spacer */}
    {/* "Lọc thêm" dropdown */}
    {/* Sort dropdown */}
  </div>
</div>
```

**Category pills:**
- "Tất cả" + one pill per category from `categories`
- Style inactive: `border border-[var(--border)] px-4 py-1.5 text-[10px] uppercase tracking-[0.16em] whitespace-nowrap`
- Style active: `bg-[#7B9BB2] text-white border-[#7B9BB2]`
- On click: sets `filters.category`

**"Lọc thêm ▾" dropdown:**
- Opens a small popover panel below with Price range, Size, Color inputs (same inputs as current sidebar, just moved)
- Close on outside click

**Sort dropdown:**
- Options: `Mới nhất`, `Giá: Thấp → Cao`, `Giá: Cao → Thấp`
- Adds `sort` field to `FilterState` and passes to `productService.getProducts`
- Style: `text-[10px] uppercase tracking-wide border-none bg-transparent`

**Search:**
- Remove from filter bar — user uses the existing SiteHeader search
- Remove `searchInput` state and search input from this page

### Product grid
- Full-width (no sidebar column)
- `grid-cols-2 md:grid-cols-3 xl:grid-cols-4` — 3 col desktop (larger cards than current 4-col)
- Remove hover Add to Cart wrapper div — keep only `<ProductCard />`
- Pass `isNew` computed from `product.visibleUpdatedAt` (within 14 days)
- Pass `tags` from `product.tags` if available in `ProductListItem` type (add field if missing)

### Keep
- Pagination (prev/next)
- LoginModal
- Variant selection modal (still needed for future quick-add from ProductDetail)

---

## 5. Type & Service Changes

**`src/types/product.ts` — `ProductListItem`:**
```ts
tags?: string[] | null   // add this field
```

Backend already returns tags for products; frontend type just needs to include it.

**`src/services/productService.ts` — `ProductQueryParams`:**
```ts
export interface ProductQueryParams {
  category?: string;
  search?: string;
  size?: string;        // variant size filter (existing, conflicts with pageSize — keep as-is)
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
  tag?: string;         // add — passed as query param to backend
  sort?: 'newest' | 'price_asc' | 'price_desc';  // add — passed as query param to backend
}
```

**Tag-based sections strategy:**
- Pass `tag` as query param via `getProducts({ tag: 'Luxury', pageSize: 4 })`
- If backend returns empty (param not supported), the section is hidden anyway (conditional render)
- No fallback to client-side filtering needed — empty = hidden is acceptable behavior
- Can verify backend support at integration test time

**Sort mapping** (frontend → backend query param):
- `newest` → `sort=newest`
- `price_asc` → `sort=price_asc`  
- `price_desc` → `sort=price_desc`
- Backend may ignore unknown sort values and use default ordering — acceptable

---

## 6. `isNew` Computation

- In **HomePage "The New Season"** section: pass `isNew={true}` to all ProductCards — these products come from `getNewArrivals()` which already filters by recency server-side.
- In **ProductList**: `isNew` is NOT shown — too many products, badge would lose meaning. Skip the `isNew` prop entirely in ProductList.
- In **tag sections** (Luxury Edit, The Muse): pass `isNew={false}`, pass `tags={product.tags ?? []}` so `EXCLUSIVE` badge can show.

---

## 7. Data Flow Summary

```
HomePage
  ├── getNewArrivals(8) → "The New Season" section
  ├── getProducts({tag:'Luxury', size:4}) → "The Luxury Edit" (conditional)
  └── getProducts({tag:'Muse', size:4}) → "The Muse" (conditional)

ProductList
  └── getProducts({category, sort, minPrice, maxPrice, size, color}) → grid

ProductCard
  └── Props: slug, name, price, compareAtPrice, thumbnailUrl, hoverThumbnailUrl, isNew?, tags?
```

---

## 8. Out of Scope

- Lookbook / editorial full-width image sections (future feature)
- Sticky category nav with horizontal scroll on ProductDetail
- Mixed-size product grid (first card larger)
- Backend changes — all filtering uses existing API params; tag filtering falls back to client-side if needed
- SiteHeader redesign
- Mobile navigation changes

---

## 9. Files Changed

| File | Change |
|------|--------|
| `src/index.css` | Update `--primary` to `#7B9BB2` |
| `src/components/common/ProductCard.tsx` | Badge system, remove hover CTA, add `isNew`/`tags` props |
| `src/pages/public/HomePage.tsx` | Replace tabs with 3 editorial sections |
| `src/pages/public/ProductList.tsx` | Replace sidebar with top filter bar, remove search input, remove hover CTA wrapper |
| `src/types/product.ts` | Add `tags` field to `ProductListItem` |
| `src/services/productService.ts` | Add `tag` and `sort` to `ProductQueryParams` |
