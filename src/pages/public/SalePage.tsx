import { useEffect, useMemo, useState } from 'react';
import { productService } from '../../services/productService';
import type { ProductListItem } from '../../types/product';
import { ProductCard } from '../../components/common/ProductCard';
import { useToast } from '../../hooks/useToast';

const SalePage = () => {
  const { showToast } = useToast();
  const [data, setData] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'price-asc' | 'price-desc'>('latest');

  useEffect(() => {
    const fetchSaleProducts = async () => {
      setLoading(true);
      try {
        const saleItems: ProductListItem[] = await productService.getSaleProducts(48);
        setData(saleItems);
      } catch {
        showToast('Không thể tải danh sách sản phẩm sale.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void fetchSaleProducts();
  }, [showToast]);

  const sortedData = useMemo(() => {
    if (sort === 'price-asc') {
      return [...data].sort((a, b) => a.price - b.price);
    }
    if (sort === 'price-desc') {
      return [...data].sort((a, b) => b.price - a.price);
    }
    // 'latest' – giữ nguyên thứ tự backend (đã sort theo updatedAt desc)
    return data;
  }, [data, sort]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero section cho trang SALE */}
      <section className="relative w-full bg-[var(--primary)] text-[var(--primary-foreground)]">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.1em] uppercase mb-4 font-serif">
            EXCLUSIVE SALE
          </h1>
          <p className="max-w-xl text-[12px] md:text-sm text-[var(--primary-foreground)]/90 font-light tracking-[0.05em] uppercase">
            Curated pieces at exceptional prices.
          </p>
        </div>
      </section>

      {/* Danh sách sản phẩm sale */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-6">
          {/* Sort controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-end gap-3">
              <span className="uppercase tracking-[0.2em] text-[10px] text-[var(--muted-foreground)]">
                SORT BY
              </span>
              <div className="inline-flex rounded-sm border border-[var(--border)] bg-[var(--card)] p-0.5">
                <button
                  type="button"
                  onClick={() => setSort('latest')}
                  className={`rounded-sm px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                    sort === 'latest'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  Latest
                </button>
                <button
                  type="button"
                  onClick={() => setSort('price-asc')}
                  className={`rounded-sm px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                    sort === 'price-asc'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  Price ↑
                </button>
                <button
                  type="button"
                  onClick={() => setSort('price-desc')}
                  className={`rounded-sm px-4 py-1.5 text-[10px] uppercase tracking-[0.15em] transition-colors ${
                    sort === 'price-desc'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  Price ↓
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-gray-100" />
                  <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : sortedData.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {sortedData.map((product) => (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  thumbnailUrl={product.thumbnailUrl ?? null}
                  hoverThumbnailUrl={product.hoverThumbnailUrl}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 text-center">
              <p className="text-gray-500 font-light">Hiện chưa có sản phẩm đang giảm giá.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default SalePage;


