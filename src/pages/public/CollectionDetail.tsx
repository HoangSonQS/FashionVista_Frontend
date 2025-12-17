import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { collectionService } from '../../services/collectionService';
import type { CollectionDetail } from '../../types/collection';
import { ProductCard } from '../../components/common/ProductCard';

const CollectionDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [data, setData] = useState<CollectionDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    const fetchCollection = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await collectionService.getCollection(slug);
        setData(response);
      } catch (err) {
        // Xử lý riêng trường hợp bộ sưu tập đã kết thúc / không còn hiệu lực (404)
        if (typeof window !== 'undefined' && (err as any)?.response?.status === 404) {
          setError('Bộ sưu tập này đã kết thúc hoặc không còn khả dụng.');
        } else {
          setError(err instanceof Error ? err.message : 'Không thể tải bộ sưu tập.');
        }
      } finally {
        setLoading(false);
      }
    };

    void fetchCollection();
  }, [slug]);

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
        <div className="mx-auto max-w-4xl space-y-4">
          <p className="text-sm text-[var(--error)]">{error}</p>
          <Link
            to="/collections"
            className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-xs hover:bg-[var(--muted)]"
          >
            ← Quay lại bộ sưu tập
          </Link>
        </div>
      </div>
    );
  }

  if (!data || loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm text-[var(--muted-foreground)]">Đang tải bộ sưu tập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 pb-16">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[var(--primary)]/10 to-[var(--background)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 pt-10 pb-12 md:pt-16 md:pb-16 lg:pt-20">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex w-fit items-center justify-center rounded-full border border-[var(--border)] bg-[var(--card)] px-4 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors mb-2"
          >
            ← Quay lại
          </button>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            <div className="space-y-3">
              <p className="text-xs tracking-[0.3em] uppercase text-[var(--muted-foreground)]">
                SixthSoul Collection
              </p>
              <h1
                className="text-3xl md:text-4xl font-semibold"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                {data.name}
              </h1>
              {data.description && (
                <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
                  {data.description}
                </p>
              )}
            </div>
            <div className="h-56 md:h-64 rounded-3xl border border-[var(--border)] bg-[var(--card)] overflow-hidden flex items-center justify-center">
              {data.heroImageUrl ? (
                <img
                  src={data.heroImageUrl}
                  alt={data.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs text-[var(--muted-foreground)]">
                  Đang cập nhật hình ảnh
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Long description (rich text) */}
      {data.longDescriptionHtml && (
        <section className="mx-auto max-w-4xl px-4 pt-8">
          <div
            className="prose max-w-none prose-p:my-3 prose-strong:font-semibold prose-em:italic text-[var(--foreground)]"
            dangerouslySetInnerHTML={{ __html: data.longDescriptionHtml }}
          />
        </section>
      )}

      {/* Products */}
      <section className="mx-auto max-w-6xl px-4 pt-8 space-y-4">
        {data.products.length === 0 ? (
          <p className="text-sm text-[var(--muted-foreground)]">
            Chưa có sản phẩm nào trong bộ sưu tập này.
          </p>
        ) : (
          <>
            <h2 className="text-base font-semibold text-[var(--muted-foreground)] uppercase tracking-[0.2em]">
              Sản phẩm trong bộ sưu tập
            </h2>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {data.products.map((product) => (
                <div
                  key={product.id}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:-translate-y-1 transition-transform flex flex-col p-3"
                >
                  <ProductCard
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    thumbnailUrl={product.thumbnailUrl}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default CollectionDetailPage;


