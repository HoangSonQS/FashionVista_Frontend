import { useEffect, useMemo, useState } from 'react';
import { productService } from '../../services/productService';
import type { ProductListItem, ProductListResponse } from '../../types/product';
import { ProductCard } from '../../components/common/ProductCard';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';

const SalePage = () => {
  const { toasts, showToast, removeToast } = useToast();
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
    <div className="min-h-screen bg-white text-black">
      {/* Hero section cho trang SALE */}
      <section className="relative w-full bg-[#4DA3E8] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-20">
          <h1 className="text-4xl md:text-5xl font-light tracking-wide uppercase mb-4">
            SALE
          </h1>
          <p className="max-w-xl text-sm md:text-base text-white/90 font-light tracking-wide">
            Khám phá các sản phẩm đang được ưu đãi với mức giá tốt hơn giá gốc.
          </p>
        </div>
      </section>

      {/* Danh sách sản phẩm sale */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-6">
          {/* Sort controls */}
          {data.length > 0 && (
            <div className="flex items-center justify-end gap-3 text-xs text-gray-600">
              <span className="uppercase tracking-[0.25em] text-[10px] text-gray-500">
                Sắp xếp
              </span>
              <div className="inline-flex rounded-full border border-gray-200 bg-white p-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setSort('latest')}
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                    sort === 'latest'
                      ? 'bg-[#4DA3E8] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSort('price-asc')}
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                    sort === 'price-asc'
                      ? 'bg-[#4DA3E8] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Giá ↑
                </button>
                <button
                  type="button"
                  onClick={() => setSort('price-desc')}
                  className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em] ${
                    sort === 'price-desc'
                      ? 'bg-[#4DA3E8] text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Giá ↓
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-gray-100" />
                  <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : sortedData.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {sortedData.map((product) => (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  compareAtPrice={product.compareAtPrice}
                  thumbnailUrl={product.thumbnailUrl}
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

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default SalePage;


