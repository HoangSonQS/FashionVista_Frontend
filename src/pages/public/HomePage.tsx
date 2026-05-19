import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import type { CategorySummary, ProductListItem } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';
import { Carousel } from '../../components/common/Carousel';
import type { EmblaOptionsType } from 'embla-carousel';
import heroBoutiqueRose from '../../assets/home/hero-boutique-rose.jpg';
import heroEveningAtelier from '../../assets/home/hero-evening-atelier.jpg';
import heroStudioCream from '../../assets/home/hero-studio-cream.jpg';

type TabType = 'new' | 'collection' | 'sale';

const CAROUSEL_OPTIONS: EmblaOptionsType = { loop: true };

const HomePage = () => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductListItem[]>([]);
  const [saleProducts, setLoadingSaleProducts] = useState<ProductListItem[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [loadingSale, setLoadingSale] = useState(false);

  const carouselSlides = useMemo(() => [
    <div
      key={1}
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroStudioCream})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/20 to-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-serif mb-4 tracking-tight">New Season Edit</h1>
          <p className="text-lg md:text-xl font-light mb-8 tracking-wide">
            Những thiết kế nữ tính, thanh lịch cho nhịp sống hiện đại.
          </p>
          <Link
            to="/products"
            className="inline-block border border-white bg-white/10 backdrop-blur-md text-white px-8 py-3 text-sm font-light tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            Khám phá ngay
          </Link>
        </div>
      </div>
    </div>,
    <div
      key={2}
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroBoutiqueRose})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-l from-black/45 via-black/20 to-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-serif mb-4 tracking-tight">Soft Tailoring</h1>
          <p className="text-lg md:text-xl font-light mb-8 tracking-wide">
            Blazer, set đồ và phom dáng tối giản cho vẻ ngoài tự tin.
          </p>
          <Link
            to="/collections"
            className="inline-block border border-white bg-[var(--accent)] text-white px-8 py-3 text-sm font-light tracking-widest uppercase hover:bg-opacity-80 transition-all duration-300"
          >
            Xem bộ sưu tập
          </Link>
        </div>
      </div>
    </div>,
    <div
      key={3}
      className="relative h-[85vh] min-h-[600px] w-full overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url(${heroEveningAtelier})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/10" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white px-4 max-w-4xl">
          <h1 className="text-4xl md:text-6xl font-serif mb-4 tracking-tight">Evening Atelier</h1>
          <p className="text-lg md:text-xl font-light mb-8 tracking-wide">
            Chất liệu mềm, đường nét tinh tế cho những buổi tối đặc biệt.
          </p>
          <Link
            to="/sale"
            className="inline-block border border-white bg-white/10 backdrop-blur-md text-white px-8 py-3 text-sm font-light tracking-widest uppercase hover:bg-white hover:text-black transition-all duration-300"
          >
            Xem ưu đãi
          </Link>
        </div>
      </div>
    </div>,
  ], []);

  // Get active tab from URL params
  const section = searchParams.get('section');
  const activeTab: TabType =
    section === 'collections' ? 'collection' :
      section === 'sale' ? 'sale' :
        'new';

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cats, featured, newProducts] = await Promise.all([
          productService.getCategories().catch(() => []),
          productService.getFeaturedProducts(8).catch(() => []),
          productService.getNewArrivals(8).catch(() => []),
        ]);
        setCategories(cats);
        setFeaturedProducts(featured);
        setNewArrivals(newProducts);
      } catch (error) {
        showToast('Không thể tải dữ liệu trang chủ.', 'error');
      } finally {
        setLoadingFeatured(false);
        setLoadingNewArrivals(false);
      }
    };
    void loadData();
  }, [showToast]);

  useEffect(() => {
    const loadSaleProducts = async () => {
      if (activeTab !== 'sale') return;
      setLoadingSale(true);
      try {
        const sale = await productService.getSaleProducts(8);
        setLoadingSaleProducts(sale);
      } catch (error) {
        showToast('Không thể tải sản phẩm sale.', 'error');
      } finally {
        setLoadingSale(false);
      }
    };
    void loadSaleProducts();
  }, [activeTab, showToast]);

  // Scroll to products section when tab changes
  useEffect(() => {
    const productsSection = document.getElementById('products-section');
    if (productsSection && section) {
      setTimeout(() => {
        productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [section]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section id="home-hero" className="relative w-full">
        <Carousel slides={carouselSlides} options={CAROUSEL_OPTIONS} />
      </section>

      {/* Dynamic Products Section based on active tab */}
      <section id="products-section" className="bg-[var(--background)] py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {activeTab === 'new' && (
            <>
              {loadingNewArrivals ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-100" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : newArrivals.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {newArrivals.map((product) => (
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
                  <p className="text-gray-500 font-light">Chưa có sản phẩm mới.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'collection' && (
            <>
              {loadingFeatured ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-100" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {featuredProducts.map((product) => (
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
                  <p className="text-gray-500 font-light">Chưa có sản phẩm nổi bật.</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sale' && (
            <>
              {loadingSale ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] bg-gray-100" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : saleProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
                  {saleProducts.map((product) => (
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
                  <p className="text-gray-500 font-light">Chưa có sản phẩm đang giảm giá.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Categories Showcase - Modern E-commerce Style */}
      {categories.length > 0 && (
        <section className="bg-[var(--background)] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-[var(--primary)] tracking-wide uppercase">
                Danh mục
              </h2>
              <Link
                to="/products"
                className="flex items-center gap-1 text-xs font-light text-[var(--primary)] hover:underline tracking-wider uppercase"
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
                  <h3 className="text-[10px] font-medium text-[var(--foreground)] tracking-[0.2em] uppercase">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banner - Modern E-commerce Style */}
      <section className="bg-[var(--primary)] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-light text-white tracking-wide uppercase">
            Giảm giá lên đến 50%
          </h2>
          <p className="mb-8 text-sm md:text-base text-white/90 font-light tracking-wide">
            Khám phá bộ sưu tập sale với nhiều ưu đãi hấp dẫn
          </p>
          <Link
            to="/products"
            className="inline-block border border-white text-white px-8 py-3 text-xs font-light tracking-widest uppercase hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
          >
            Mua ngay
          </Link>
        </div>
      </section>

      {/* Newsletter Signup - Modern E-commerce Style */}
      <section className="bg-[var(--background)] border-t border-[var(--border)] py-16 md:py-24">
        <div className="mx-auto max-w-2xl px-4 md:px-8 text-center">
          <h2 className="mb-4 text-2xl md:text-3xl font-light text-[#4A3728] tracking-[0.1em] uppercase font-serif">
            SixthSoul Newsletter
          </h2>
          <p className="mb-10 text-[12px] text-[#8B7355] font-light tracking-wide uppercase">
            Join our society for early access and exclusive collection updates.
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="YOUR EMAIL ADDRESS"
              className="flex-1 border-b border-[var(--border)] bg-transparent px-0 py-3 text-[11px] font-light tracking-widest text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors uppercase"
            />
            <button className="text-[10px] font-medium tracking-[0.2em] uppercase text-[var(--foreground)] hover:text-[var(--primary)] transition-all duration-300">
              SUBSCRIBE
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
