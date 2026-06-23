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
