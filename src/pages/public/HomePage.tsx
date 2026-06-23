import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productService } from '../../services/productService';
import type { CategorySummary, ProductListItem } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ProductCard } from '../../components/common/ProductCard';
import { Carousel } from '../../components/common/Carousel';
import type { EmblaOptionsType } from 'embla-carousel';

const CAROUSEL_OPTIONS: EmblaOptionsType = { loop: true };

interface EditorialSectionProps {
  label: string;
  heading: string;
  caption?: string;
  linkText: string;
  linkHref: string;
  products: ProductListItem[];
  loading: boolean;
  isNewSection?: boolean;
  background?: string;
}

const EditorialSection = ({
  label,
  heading,
  caption,
  linkText,
  linkHref,
  products,
  loading,
  isNewSection = false,
  background = 'bg-[var(--background)]',
}: EditorialSectionProps) => {
  if (!loading && products.length === 0) return null;

  return (
    <section className={`${background} py-20 md:py-28`}>
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-10 flex flex-col gap-4 border-b border-[var(--border)] pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#7B9BB2]">{label}</p>
            <h2 className="mt-2 font-serif text-2xl font-light uppercase tracking-[0.12em] md:text-3xl">
              {heading}
            </h2>
            {caption && (
              <p className="mt-2 text-[11px] font-light text-[var(--muted-foreground)] tracking-wide">
                {caption}
              </p>
            )}
          </div>
          <Link
            to={linkHref}
            className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--foreground)] hover:text-[#7B9BB2] transition-colors"
          >
            {linkText} <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[var(--border)]" />
                <div className="mt-4 h-3 w-3/4 rounded bg-[var(--border)] mx-auto" />
                <div className="mt-2 h-3 w-1/2 rounded bg-[var(--border)] mx-auto" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 md:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                slug={product.slug}
                name={product.name}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                thumbnailUrl={product.thumbnailUrl ?? null}
                hoverThumbnailUrl={product.hoverThumbnailUrl}
                isNew={isNewSection}
                tags={product.tags ?? []}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const carouselSlides = [
  <div
    key={1}
    className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-cover bg-center"
    style={{ backgroundImage: 'url(/sixthsoul-banner.png)' }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-black/44 via-black/16 to-transparent" />
    <div className="absolute inset-x-0 bottom-12 md:bottom-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8 text-white">
        <h1 className="max-w-2xl text-4xl md:text-7xl font-serif mb-4">New Season Edit</h1>
        <p className="max-w-xl text-sm md:text-base font-light mb-8 tracking-wide">
          Những thiết kế nữ tính, thanh lịch cho nhịp sống hiện đại.
        </p>
        <Link
          to="/products"
          className="inline-block border border-white bg-white text-[var(--foreground)] px-8 py-3 text-[11px] font-medium tracking-widest uppercase hover:bg-transparent hover:text-white transition-all duration-300"
        >
          Khám phá ngay
        </Link>
      </div>
    </div>
  </div>,
  <div
    key={2}
    className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-cover bg-top"
    style={{ backgroundImage: 'url(/sixthsoul-banner-02.png)' }}
  >
    <Link to="/collections" className="absolute inset-0" aria-label="Xem bộ sưu tập White Romance" />
  </div>,
  <div
    key={3}
    className="relative h-[78vh] min-h-[560px] w-full overflow-hidden bg-cover bg-top"
    style={{ backgroundImage: 'url(/sixthsoul-banner-03.png)' }}
  >
    <Link to="/sale" className="absolute inset-0" aria-label="Xem ưu đãi Puffy Dress" />
  </div>,
];

const HomePage = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [newArrivals, setNewArrivals] = useState<ProductListItem[]>([]);
  const [luxuryProducts, setLuxuryProducts] = useState<ProductListItem[]>([]);
  const [museProducts, setMuseProducts] = useState<ProductListItem[]>([]);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingLuxury, setLoadingLuxury] = useState(true);
  const [loadingMuse, setLoadingMuse] = useState(true);

  useEffect(() => {
    const loadBase = async () => {
      try {
        const [cats, newProducts] = await Promise.all([
          productService.getCategories().catch(() => [] as CategorySummary[]),
          productService.getNewArrivals(8).catch(() => [] as ProductListItem[]),
        ]);
        setCategories(cats);
        setNewArrivals(newProducts);
      } catch {
        showToast('Không thể tải dữ liệu trang chủ.', 'error');
      } finally {
        setLoadingNew(false);
      }
    };
    void loadBase();
  }, [showToast]);

  useEffect(() => {
    productService
      .getProducts({ tag: 'Luxury', pageSize: 4 })
      .then((res) => setLuxuryProducts(res.items))
      .catch(() => undefined)
      .finally(() => setLoadingLuxury(false));
  }, []);

  useEffect(() => {
    productService
      .getProducts({ tag: 'Muse', pageSize: 4 })
      .then((res) => setMuseProducts(res.items))
      .catch(() => undefined)
      .finally(() => setLoadingMuse(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section id="home-hero" className="relative w-full">
        <Carousel slides={carouselSlides} options={CAROUSEL_OPTIONS} />
      </section>

      <EditorialSection
        label="Online Shop"
        heading="The New Season"
        caption="Những thiết kế mới nhất mùa này"
        linkText="View all"
        linkHref="/products"
        products={newArrivals}
        loading={loadingNew}
        isNewSection
      />

      <EditorialSection
        label="Curated Edit"
        heading="The Luxury Edit"
        linkText="Khám phá"
        linkHref="/products"
        products={luxuryProducts}
        loading={loadingLuxury}
      />

      <EditorialSection
        label="Signature Piece"
        heading="The Muse"
        linkText="Xem thêm"
        linkHref="/products"
        products={museProducts}
        loading={loadingMuse}
        background="bg-[var(--muted)]"
      />

      {/* Categories */}
      {categories.length > 0 && (
        <section className="bg-[var(--background)] py-16 md:py-20">
          <div className="mx-auto max-w-7xl px-4 md:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-light tracking-[0.12em] uppercase">
                Danh mục
              </h2>
              <Link
                to="/products"
                className="flex items-center gap-1 text-xs font-light text-[#7B9BB2] hover:underline tracking-wider uppercase"
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
                  <h3 className="text-[10px] font-medium tracking-[0.2em] uppercase">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
};

export default HomePage;
