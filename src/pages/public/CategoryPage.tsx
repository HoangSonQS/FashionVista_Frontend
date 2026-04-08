import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import type { CategorySummary, ProductListItem, ProductListResponse } from '../../types/product';
import { ProductCard } from '../../components/common/ProductCard';
import { useToast } from '../../hooks/useToast';

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { showToast } = useToast();
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
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Hero / header section */}
      <section className={`border-b border-[var(--border)]/30 ${activeCategory?.image ? 'relative overflow-hidden' : 'bg-[var(--muted)]'}`}>
        {activeCategory?.image && (
          <>
            <div className="absolute inset-0">
              <img
                src={activeCategory.image}
                alt={activeCategory.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-transparent" />
            </div>
          </>
        )}
        <div className={`relative mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 md:flex-row md:items-end md:justify-between md:py-10 ${activeCategory?.image ? 'text-white' : ''}`}>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.3em] mb-3 ${activeCategory?.image ? 'text-white/90' : 'text-[var(--primary)]'}`}>
              COLLECTION
            </p>
            <h1 className={`text-3xl md:text-5xl font-light tracking-wide font-serif ${activeCategory?.image ? 'text-white' : 'text-[var(--foreground)]'}`}>
              {title}
            </h1>
            {activeCategory && (
              <p className={`mt-3 max-w-xl text-sm font-light ${activeCategory?.image ? 'text-white/90' : 'text-gray-600'}`}>
                {activeCategory.description || `Khám phá các thiết kế trong danh mục ${activeCategory.name}.`}
              </p>
            )}
          </div>
          <div className={`flex items-center gap-2 text-xs ${activeCategory?.image ? 'text-white/80' : 'text-gray-500'}`}>
            <Link to="/" className="hover:underline">
              Trang chủ
            </Link>
            <span>/</span>
            <span className={activeCategory?.image ? 'text-white' : 'text-gray-700'}>
              {activeCategory?.name ?? 'Danh mục'}
            </span>
          </div>
        </div>
      </section>

      {/* Products grid */}
      <section className="bg-white py-10 md:py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8 space-y-6">
          {/* Sort controls */}
          {products.length > 0 && (
            <div className="flex items-center justify-end gap-3 uppercase tracking-[0.1em]">
              <span className="text-[10px] text-[var(--muted-foreground)] tracking-[0.2em]">
                SORT BY
              </span>
              <div className="inline-flex rounded-sm border border-[var(--border)] bg-[var(--card)] p-0.5">
                <button
                  type="button"
                  onClick={() => setSort('latest')}
                  className={`rounded-sm px-4 py-1.5 text-[10px] tracking-[0.15em] transition-colors ${
                    sort === 'latest'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  LATEST
                </button>
                <button
                  type="button"
                  onClick={() => setSort('price-asc')}
                  className={`rounded-sm px-4 py-1.5 text-[10px] tracking-[0.15em] transition-colors ${
                    sort === 'price-asc'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  PRICE ↑
                </button>
                <button
                  type="button"
                  onClick={() => setSort('price-desc')}
                  className={`rounded-sm px-4 py-1.5 text-[10px] tracking-[0.15em] transition-colors ${
                    sort === 'price-desc'
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                  }`}
                >
                  PRICE ↓
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
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {sortedProducts.map((product) => (
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
              <p className="text-gray-500 font-light">
                Chưa có sản phẩm nào trong danh mục này.
              </p>
              <Link
                to="/products"
                className="mt-6 inline-block border border-[var(--primary)] px-8 py-3 text-[10px] font-medium uppercase tracking-[0.3em] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all rounded-sm"
              >
                VIEW ALL ITEMS
              </Link>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default CategoryPage;


