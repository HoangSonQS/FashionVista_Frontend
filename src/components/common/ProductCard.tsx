import { Link } from 'react-router-dom';

// Giá có thể bị thiếu trong một số API (ví dụ search suggestions),
// nên cần hàm format chịu được undefined / null để tránh lỗi runtime.
const formatCurrency = (value?: number | null) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }
  return `${value.toLocaleString('vi-VN')}₫`;
};

export type BasicProductCardProps = {
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  thumbnailUrl?: string | null;
};

export const ProductCard = ({
  slug,
  name,
  price,
  compareAtPrice,
  thumbnailUrl,
}: BasicProductCardProps) => {
  const hasDiscount = typeof compareAtPrice === 'number' && compareAtPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  return (
    <div className="group relative">
      <Link to={`/products/${slug}`} className="block">
        <div className="relative overflow-hidden bg-white aspect-square flex items-center justify-center">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={name}
              className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
              <span className="text-sm">No Image</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-4 left-4 bg-[#4DA3E8] text-white px-3 py-1 text-xs font-medium tracking-wide">
              -{discountPercent}%
            </div>
          )}
        </div>
      </Link>
      <div className="mt-4 space-y-1">
        <Link to={`/products/${slug}`}>
          <h3 className="font-light text-sm text-[#4DA3E8] hover:underline transition-all line-clamp-2 tracking-wide">
            {name}
          </h3>
        </Link>
        <div className="flex items-baseline gap-2">
          <span className="font-normal text-sm text-[#4DA3E8]">
            {formatCurrency(price)}
          </span>
          {hasDiscount && typeof compareAtPrice === 'number' && (
            <span className="text-xs text-gray-500 line-through font-light">
              {formatCurrency(compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};


