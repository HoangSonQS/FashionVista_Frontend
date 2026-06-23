import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collectionService, type PagedCollectionResponse } from '../../services/collectionService';

const CollectionsPage = () => {
  const [data, setData] = useState<PagedCollectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    const fetchCollections = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await collectionService.getCollections({ page, size: 12 });
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách bộ sưu tập.');
      } finally {
        setLoading(false);
      }
    };

    void fetchCollections();
  }, [page]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Bộ sưu tập
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Khám phá các bộ sưu tập được tuyển chọn bởi SixthSoul.
          </p>
        </header>

        {error && (
          <p className="text-sm text-[var(--error)]">
            {error}
          </p>
        )}

        {loading && !data && (
          <p className="text-sm text-[var(--muted-foreground)]">
            Đang tải bộ sưu tập...
          </p>
        )}

        {data && data.content.length === 0 && !loading && (
          <p className="text-sm text-[var(--muted-foreground)]">
            Chưa có bộ sưu tập nào đang diễn ra.
          </p>
        )}

        {data && data.content.length > 0 && (
          <>
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {data.content.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.slug}`}
                  className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden hover:-translate-y-1 transition-transform"
                >
                  <div className="relative h-48 w-full bg-[var(--muted)] flex items-center justify-center">
                    {collection.heroImageUrl ? (
                      <img
                        src={collection.heroImageUrl}
                        alt={collection.name}
                        className="h-full w-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                    ) : (
                      <span className="text-xs text-[var(--muted-foreground)]">
                        Đang cập nhật hình ảnh
                      </span>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h2
                      className="text-lg font-semibold"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {collection.name}
                    </h2>
                    {collection.description && (
                      <p className="text-xs text-[var(--muted-foreground)] line-clamp-2">
                        {collection.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-[var(--muted-foreground)]">
                <span>
                  Trang {data.number + 1}/{data.totalPages}
                </span>
                <div className="space-x-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50"
                  >
                    Trước
                  </button>
                  <button
                    type="button"
                    disabled={page + 1 >= data.totalPages}
                    onClick={() => setPage((prev) => prev + 1)}
                    className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CollectionsPage;


