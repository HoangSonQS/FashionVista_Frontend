import { FormEvent, useState } from 'react';
import { productService } from '../../services/productService';
import type { ProductCreateRequest } from '../../types/product';

const initialForm: ProductCreateRequest = {
  name: '',
  slug: '',
  sku: '',
  price: 0,
  description: '',
  shortDescription: '',
  featured: false,
  status: 'ACTIVE',
  tags: [],
  sizes: [],
  colors: [],
  variants: [
    {
      size: '',
      color: '',
      sku: '',
      price: 0,
      stock: 0,
      active: true,
    },
  ],
};

const ProductCreatePage = () => {
  const [form, setForm] = useState<ProductCreateRequest>(initialForm);
  const [files, setFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const payload: ProductCreateRequest = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        tags: form.tags?.filter(Boolean),
        sizes: form.sizes?.filter(Boolean),
        colors: form.colors?.filter(Boolean),
        variants: form.variants?.map((variant) => ({
          ...variant,
          price: variant.price ? Number(variant.price) : undefined,
          stock: Number(variant.stock ?? 0),
        })),
      };

      await productService.createProduct(payload, files);
      setStatus('Đã tạo sản phẩm thành công.');
      setForm(initialForm);
      setFiles([]);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Không thể tạo sản phẩm.');
    } finally {
      setLoading(false);
    }
  };

  const updateVariant = (index: number, field: string, value: string) => {
    setForm((prev) => {
      const variants = prev.variants ? [...prev.variants] : [];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Tạo sản phẩm mới
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Upload thông tin sản phẩm và hình ảnh.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 border border-[var(--border)] rounded-2xl p-6 bg-[var(--card)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: 'name', label: 'Tên sản phẩm' },
              { field: 'slug', label: 'Slug' },
              { field: 'sku', label: 'SKU' },
            ].map((item) => (
              <div key={item.field} className="space-y-2">
                <label className="text-sm text-[var(--muted-foreground)]">{item.label}</label>
                <input
                  type="text"
                  value={(form as never)[item.field]}
                  onChange={(e) => setForm((prev) => ({ ...prev, [item.field]: e.target.value }))}
                  className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Giá</label>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm((prev) => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted-foreground)]">Giá gốc</label>
              <input
                type="number"
                min={0}
                value={form.compareAtPrice ?? ''}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, compareAtPrice: e.target.value ? Number(e.target.value) : undefined }))
                }
                className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Mô tả ngắn</label>
            <textarea
              value={form.shortDescription ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, shortDescription: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Mô tả</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { field: 'categorySlug', label: 'Slug danh mục', placeholder: 'dresses' },
              { field: 'tags', label: 'Tags (cách nhau bằng dấu phẩy)', placeholder: 'new,hot' },
              { field: 'sizes', label: 'Sizes (cách nhau bằng dấu phẩy)', placeholder: 'S,M,L' },
              { field: 'colors', label: 'Colors (cách nhau bằng dấu phẩy)', placeholder: 'Black,White' },
            ].map((item) => (
              <div key={item.field} className="space-y-2">
                <label className="text-sm text-[var(--muted-foreground)]">{item.label}</label>
                <input
                  type="text"
                  placeholder={item.placeholder}
                  value={Array.isArray((form as never)[item.field]) ? (form as never)[item.field].join(',') : (form as never)[item.field] ?? ''}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      [item.field]:
                        item.field === 'categorySlug'
                          ? e.target.value
                          : e.target.value
                              .split(',')
                              .map((value) => value.trim())
                              .filter(Boolean),
                    }))
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Biến thể</h2>
            {form.variants?.map((variant, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 border border-[var(--border)] rounded-2xl p-4">
                {['size', 'color', 'sku'].map((field) => (
                  <input
                    key={field}
                    type="text"
                    placeholder={field.toUpperCase()}
                    value={(variant as never)[field] ?? ''}
                    onChange={(e) => updateVariant(index, field, e.target.value)}
                    className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                ))}
                <input
                  type="number"
                  min={0}
                  placeholder="Giá"
                  value={variant.price ?? ''}
                  onChange={(e) => updateVariant(index, 'price', e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Tồn kho"
                  value={variant.stock ?? 0}
                  onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                  className="rounded-lg border border-[var(--border)] bg-transparent px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  variants: [
                    ...(prev.variants ?? []),
                    { size: '', color: '', sku: '', price: 0, stock: 0, active: true },
                  ],
                }))
              }
              className="text-sm text-[var(--primary)]"
            >
              + Thêm biến thể
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-[var(--muted-foreground)]">Hình ảnh sản phẩm</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
              className="w-full text-sm text-[var(--muted-foreground)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] py-3 font-medium hover:bg-[#0064c0] transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang tạo...' : 'Tạo sản phẩm'}
          </button>

          {status && <p className="text-sm text-[var(--muted-foreground)]">{status}</p>}
        </form>
      </div>
    </div>
  );
};

export default ProductCreatePage;

