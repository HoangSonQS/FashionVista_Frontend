import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import type { CategorySummary, ProductListItem, ProductListResponse } from '../../types/product';
import { ProductCard } from '../../components/common/ProductCard';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toasts, showToast, removeToast } = useToast();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<'latest' | 'price-asc' | 'price-desc'>('latest');

  const activeCategory = useMemo(
    () => categories.find((c) => c.slug === slug),
    [categories, slug],
  );

  const sortedProducts = useMemo(() => {
    if (sort === 'price-asc') {
      return [...products].sort((a, b) => a.price - b.price);
    }
    if (sort === 'price-desc') {
      return [...products].sort((a, b) => b.price - a.price);
    }
    // 'latest' – giữ nguyên thứ tự backend trả về (mặc định đã sort theo createdAt/updatedAt)
    return products;
  }, [products, sort]);

  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const [cats, productResponse]: [CategorySummary[], ProductListResponse] = await Promise.all([
          productService.getCategories(),
          productService.getProducts({ category: slug }),
        ]);
        setCategories(cats);
        setProducts(productResponse.items);
      } catch (error) {
        showToast('Không thể tải danh mục hoặc sản phẩm. Vui lòng thử lại sau.', 'error');
      } finally {
        setLoading(false);
      }
    };

    // Mỗi lần đổi category thì scroll lên đầu trang
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    void fetchData();
  }, [slug, showToast]);

  const title = activeCategory?.name ?? (slug ? slug.replace(/-/g, ' ').toUpperCase() : 'Danh mục');

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Hero / header section */}
      <section className="border-b border-gray-200 bg-[#F5FAFF]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 md:flex-row md:items-end md:justify-between md:py-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#4DA3E8] mb-2">Danh mục</p>
            <h1 className="text-3xl md:text-4xl font-light text-[#1F3A4D] tracking-wide">
              {title}
            </h1>
            {activeCategory && (
              <p className="mt-3 max-w-xl text-sm text-gray-600 font-light">
                Khám phá các thiết kế trong danh mục&nbsp;
                <span className="font-medium text-[#4DA3E8]">{activeCategory.name}</span>.
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Link to="/" className="hover:underline">
              Trang chủ
            </Link>
            <span>/</span>
            <span className="text-gray-700">{activeCategory?.name ?? 'Danh mục'}</span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-6">
          {/* Sort controls */}
          {products.length > 0 && (
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
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
              {sortedProducts.map((product) => (
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
              <p className="text-gray-500 font-light">
                Chưa có sản phẩm nào trong danh mục này.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-block border border-[#4DA3E8] px-6 py-2 text-xs font-light uppercase tracking-[0.3em] text-[#4DA3E8] hover:bg-[#4DA3E8] hover:text-white transition-all"
              >
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </div>
      </section>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default CategoryPage;


