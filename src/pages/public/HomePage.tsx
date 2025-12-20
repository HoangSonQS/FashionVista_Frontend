import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import type { CategorySummary, ProductListItem } from '../../types/product';
import { ToastContainer } from '../../components/common/Toast';
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';

const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')}₫`;

type TabType = 'new' | 'collection' | 'sale';

const HomePage = () => {
  const { toasts, showToast, removeToast } = useToast();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<ProductListItem[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductListItem[]>([]);
  const [saleProducts, setSaleProducts] = useState<ProductListItem[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNewArrivals, setLoadingNewArrivals] = useState(true);
  const [loadingSale, setLoadingSale] = useState(false);

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
        setSaleProducts(sale);
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
    <div className="min-h-screen bg-white text-black">
      {/* Hero Banner - ZARA Style */}
      <section id="home-hero" className="relative w-full">
        <div className="relative h-[85vh] min-h-[600px] bg-[#4DA3E8] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-[#4DA3E8]/40 via-[#4DA3E8]/20 to-transparent z-10" />
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="text-center px-4 max-w-4xl">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-6 tracking-tight">
                SIXTHSOUL
              </h1>
              <p className="text-lg md:text-xl text-white/90 font-light mb-8 tracking-wide">
                Khám phá bộ sưu tập mới nhất
              </p>
              <Link
                to="/products"
                className="inline-block border border-white text-white px-8 py-3 text-sm font-light tracking-widest uppercase hover:bg-white hover:text-[#4DA3E8] transition-all duration-300"
              >
                Xem bộ sưu tập
              </Link>
            </div>
          </div>
          {/* Placeholder for hero image - can be replaced with actual image */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#4DA3E8] via-[#3A8BC7] to-[#2D6FA0]" />
        </div>
      </section>

      {/* Dynamic Products Section based on active tab */}
      <section id="products-section" className="bg-white py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {activeTab === 'new' && (
            <>
              {loadingNewArrivals ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-100" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : newArrivals.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {newArrivals.map((product) => (
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
                      <div className="aspect-square bg-gray-100" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : featuredProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {featuredProducts.map((product) => (
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
                      <div className="aspect-square bg-gray-100" />
                      <div className="mt-4 h-3 w-3/4 rounded bg-gray-100" />
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                  ))}
                </div>
              ) : saleProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
                  {saleProducts.map((product) => (
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
                  <p className="text-gray-500 font-light">Chưa có sản phẩm đang giảm giá.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Categories Showcase - ZARA Style */}
      {categories.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-light text-[#4DA3E8] tracking-wide uppercase">
                Danh mục
              </h2>
              <Link
                to="/products"
                className="flex items-center gap-1 text-xs font-light text-[#4DA3E8] hover:underline tracking-wider uppercase"
              >
                Xem tất cả <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.slug}
                  to={`/categories/${category.slug}`}
                  className="group text-center transition-opacity hover:opacity-70"
                >
                  <div className="mb-3 aspect-square bg-[#4DA3E8]/10 overflow-hidden rounded-sm">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-[#4DA3E8]/5 group-hover:bg-[#4DA3E8]/15 transition-colors">
                        <span className="text-xs text-[#4DA3E8] uppercase tracking-wider">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-light text-[#4DA3E8] tracking-wide uppercase">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promotional Banner - ZARA Style */}
      <section className="bg-[#4DA3E8] py-20 md:py-24">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center">
          <h2 className="mb-4 text-3xl md:text-4xl font-light text-white tracking-wide uppercase">
            Giảm giá lên đến 50%
          </h2>
          <p className="mb-8 text-sm md:text-base text-white/90 font-light tracking-wide">
            Khám phá bộ sưu tập sale với nhiều ưu đãi hấp dẫn
          </p>
          <Link
            to="/products"
            className="inline-block border border-white text-white px-8 py-3 text-xs font-light tracking-widest uppercase hover:bg-white hover:text-[#4DA3E8] transition-all duration-300"
          >
            Mua ngay
          </Link>
        </div>
      </section>

      {/* Newsletter Signup - ZARA Style */}
      <section className="bg-white border-t border-[#4DA3E8]/20 py-16 md:py-20">
        <div className="mx-auto max-w-2xl px-4 md:px-8 text-center">
          <h2 className="mb-3 text-xl md:text-2xl font-light text-[#4DA3E8] tracking-wide uppercase">
            Đăng ký nhận tin
          </h2>
          <p className="mb-8 text-sm text-gray-600 font-light tracking-wide">
            Nhận thông tin về sản phẩm mới và khuyến mãi đặc biệt
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 border-b border-[#4DA3E8] bg-transparent px-0 py-2 text-sm font-light text-[#4DA3E8] placeholder:text-gray-400 focus:outline-none focus:border-[#4DA3E8]/70 transition-colors"
            />
            <button className="border border-[#4DA3E8] text-[#4DA3E8] px-8 py-2 text-xs font-light tracking-widest uppercase hover:bg-[#4DA3E8] hover:text-white transition-all duration-300">
              Đăng ký
            </button>
          </div>
        </div>
      </section>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default HomePage;

