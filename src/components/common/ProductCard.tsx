import { Link } from 'react-router-dom';

// Giá có thể bị thiếu trong một số API (ví dụ search suggestions),
// nên cần hàm format chịu được undefined / null để tránh lỗi runtime.
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
}

export const ProductCard = ({
  slug,
  name,
  price,
  compareAtPrice,
  thumbnailUrl,
  hoverThumbnailUrl,
}: BasicProductCardProps) => {
  const hasDiscount = typeof compareAtPrice === 'number' && compareAtPrice > price;

  return (
    <div className="group relative bg-[var(--card)]">
      <Link to={`/products/${slug}`} className="block">
        <div className="relative overflow-hidden aspect-[3/4] bg-[var(--background)]">
          {thumbnailUrl ? (
            <>
              <img
                src={thumbnailUrl}
                alt={name}
                className={`h-full w-full object-cover transition-all duration-700 ${
                  hoverThumbnailUrl ? 'group-hover:opacity-0 group-hover:scale-105' : 'group-hover:scale-105'
                }`}
              />
              {hoverThumbnailUrl && (
                <img
                  src={hoverThumbnailUrl}
                  alt={`${name} hover`}
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition-all duration-700 group-hover:opacity-100 group-hover:scale-105"
                />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--muted)] text-[var(--muted-foreground)]">
              <span className="text-[10px] uppercase tracking-widest">No Image</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-[var(--foreground)] text-[var(--background)] px-2 py-0.5 text-[9px] font-medium tracking-widest uppercase">
              Sale
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4 text-center px-1">
        <Link to={`/products/${slug}`}>
          <h3 className="text-[11px] font-medium text-[var(--foreground)] uppercase tracking-[0.15em] line-clamp-1 hover:opacity-60 transition-opacity">
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


