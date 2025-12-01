import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { productService } from '../../services/productService';
import { adminProductService } from '../../services/adminProductService';
import type { ProductCreateRequest, ProductDetail, ProductVariantRequest, ProductImage } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { ArrowLeft } from 'lucide-react';

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
  removedImageIds: [],
};

const statusOptions = [
  { value: 'ACTIVE', label: 'Đang bán' },
  { value: 'INACTIVE', label: 'Ẩn/Ngừng bán' },
  { value: 'OUT_OF_STOCK', label: 'Hết hàng' },
];

const baseFields: Array<{ field: keyof ProductCreateRequest; label: string; placeholder?: string; required?: boolean }> = [
  { field: 'name', label: 'Tên sản phẩm', required: true },
  { field: 'slug', label: 'Slug (đường dẫn ngắn)', required: true },
  { field: 'sku', label: 'SKU (mã kho)', required: true },
  { field: 'categorySlug', label: 'Slug danh mục', placeholder: 'dresses' },
];

const chipFields: Array<{ field: keyof ProductCreateRequest; label: string; placeholder?: string }> = [
  { field: 'tags', label: 'Tags (cách nhau bằng dấu phẩy)', placeholder: 'new,hot' },
  { field: 'sizes', label: 'Sizes (S,M,L)', placeholder: 'S,M,L' },
  { field: 'colors', label: 'Màu sắc', placeholder: 'Black,White' },
];

const variantTextFields: Array<{ field: keyof ProductVariantRequest; placeholder: string; className?: string }> = [
  { field: 'size', placeholder: 'Size (ví dụ M)', className: 'md:max-w-[150px]' },
  { field: 'color', placeholder: 'Màu (ví dụ Black)', className: 'md:max-w-[150px]' },
  { field: 'sku', placeholder: 'SKU biến thể', className: 'md:max-w-[200px]' },
];

interface FilePreview {
  file: File;
  preview: string;
}

const ProductCreatePage = () => {
  const [form, setForm] = useState<ProductCreateRequest>(initialForm);
  const [priceInput, setPriceInput] = useState<string>('');
  const [comparePriceInput, setComparePriceInput] = useState<string>('');
  const [uploadFiles, setUploadFiles] = useState<FilePreview[]>([]);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [variantPriceInputs, setVariantPriceInputs] = useState<Record<number, string>>({});
  const [variantStockInputs, setVariantStockInputs] = useState<Record<number, string>>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prefillLoading, setPrefillLoading] = useState(false);
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const cloneId = searchParams.get('clone');
  const editingId = id ? Number(id) : null;
  const isEditing = Boolean(editingId);
  const { toasts, showToast, removeToast } = useToast();
  const navigate = useNavigate();

  const headerTitle = isEditing ? 'Chỉnh sửa sản phẩm' : 'Tạo sản phẩm mới';
  const submitLabel = isEditing ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm';

  const safeVariants = useMemo<ProductVariantRequest[]>(() => form.variants ?? [], [form.variants]);

  useEffect(() => {
    const sourceId = editingId ?? (cloneId ? Number(cloneId) : null);
    if (!sourceId) {
      setForm(initialForm);
      setPriceInput('');
      setComparePriceInput('');
      setExistingImages([]);
      setRemovedImageIds([]);
      setVariantPriceInputs({});
      setVariantStockInputs({});
      return;
    }
    setPrefillLoading(true);
    adminProductService
      .getProduct(sourceId)
      .then((detail) => {
        const mapped = mapDetailToForm(detail, Boolean(cloneId));
        setForm(mapped);
        setPriceInput(mapped.price ? String(mapped.price) : '');
        setComparePriceInput(mapped.compareAtPrice ? String(mapped.compareAtPrice) : '');
        setExistingImages(Boolean(cloneId) ? [] : (detail.images ?? []));
        setRemovedImageIds([]);
        // Sync variant inputs
        const priceInputs: Record<number, string> = {};
        const stockInputs: Record<number, string> = {};
        mapped.variants?.forEach((variant, idx) => {
          priceInputs[idx] = variant.price ? String(variant.price) : '';
          stockInputs[idx] = variant.stock ? String(variant.stock) : '';
        });
        setVariantPriceInputs(priceInputs);
        setVariantStockInputs(stockInputs);
      })
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Không thể tải dữ liệu sản phẩm.';
        setStatusMessage(message);
        showToast(message, 'error');
      })
      .finally(() => setPrefillLoading(false));
  }, [editingId, cloneId]);

  const mapDetailToForm = (detail: ProductDetail, isClone: boolean): ProductCreateRequest => ({
    name: detail.name,
    slug: isClone ? `${detail.slug}-copy` : detail.slug,
    sku: isClone ? `${detail.slug}-SKU` : detail.slug,
    description: detail.description ?? '',
    shortDescription: detail.shortDescription ?? '',
    price: detail.price,
    compareAtPrice: detail.compareAtPrice,
    status: detail.status,
    featured: detail.featured,
    categorySlug: '',
    tags: detail.tags ?? [],
    sizes: detail.sizes ?? [],
    colors: detail.colors ?? [],
    variants:
      detail.variants?.map((variant) => ({
        id: isClone ? undefined : variant.id,
        size: variant.size ?? '',
        color: variant.color ?? '',
        sku: isClone ? `${variant.sku}-COPY` : variant.sku,
        price: variant.price,
        stock: variant.stock,
        active: variant.active,
      })) ?? [],
    removedImageIds: [],
  });

  const setFormField = <K extends keyof ProductCreateRequest>(field: K, value: ProductCreateRequest[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatusMessage(null);

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
        removedImageIds: removedImageIds.length ? removedImageIds : undefined,
      };

      if (isEditing && editingId) {
        await adminProductService.updateProduct(
          editingId,
          payload,
          uploadFiles.map((item) => item.file),
        );
        const msg = 'Đã cập nhật sản phẩm. Tự động quay lại danh sách sau 2 giây.';
        setStatusMessage(msg);
        showToast(msg, 'success');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } else {
        await productService.createProduct(
          payload,
          uploadFiles.map((item) => item.file),
        );
        const msg = 'Đã tạo sản phẩm thành công. Tự động quay lại danh sách sau 2 giây.';
        setStatusMessage(msg);
        showToast(msg, 'success');
        setForm(initialForm);
        setPriceInput('');
        setComparePriceInput('');
        setExistingImages([]);
        setRemovedImageIds([]);
        setVariantPriceInputs({});
        setVariantStockInputs({});
      }
      cleanupFilePreviews(uploadFiles);
      setUploadFiles([]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể lưu sản phẩm.';
      setStatusMessage(message);
      showToast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateVariant = (index: number, field: keyof ProductVariantRequest, value: string | number | boolean) => {
    setForm((prev) => {
      const variants = prev.variants ? [...prev.variants] : [];
      variants[index] = { ...variants[index], [field]: value };
      return { ...prev, variants };
    });
  };

  const removeVariant = (index: number) => {
    setForm((prev) => {
      const variants = prev.variants ? [...prev.variants] : [];
      variants.splice(index, 1);
      return { ...prev, variants: variants.length ? variants : [] };
    });
    // Update input states
    setVariantPriceInputs((prev) => {
      const next = { ...prev };
      delete next[index];
      // Reindex
      const reindexed: Record<number, string> = {};
      Object.keys(next).forEach((key) => {
        const idx = Number(key);
        if (idx > index) {
          reindexed[idx - 1] = next[idx];
        } else if (idx < index) {
          reindexed[idx] = next[idx];
        }
      });
      return reindexed;
    });
    setVariantStockInputs((prev) => {
      const next = { ...prev };
      delete next[index];
      // Reindex
      const reindexed: Record<number, string> = {};
      Object.keys(next).forEach((key) => {
        const idx = Number(key);
        if (idx > index) {
          reindexed[idx - 1] = next[idx];
        } else if (idx < index) {
          reindexed[idx] = next[idx];
        }
      });
      return reindexed;
    });
  };

  const handleRemoveExistingImage = (imageId?: number) => {
    if (!imageId) {
      return;
    }
    setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
    setRemovedImageIds((prev) => (prev.includes(imageId) ? prev : [...prev, imageId]));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    if (selectedFiles.length === 0) {
      return;
    }
    const previews = selectedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setUploadFiles((prev) => [...prev, ...previews]);
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed) {
        URL.revokeObjectURL(removed.preview);
      }
      return next;
    });
  };

  const cleanupFilePreviews = (filesToClean: FilePreview[]) => {
    filesToClean.forEach((item) => URL.revokeObjectURL(item.preview));
  };

  useEffect(() => {
    return () => {
      cleanupFilePreviews(uploadFiles);
    };
  }, [uploadFiles]);

  const getFieldValue = (field: keyof ProductCreateRequest): string => {
    const value = form[field];
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry)).join(',');
    }
    if (typeof value === 'number') {
      return value.toString();
    }
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    return (value as string | undefined) ?? '';
  };

  const generateVariantSku = (baseSku: string, size?: string, color?: string): string => {
    const parts = [baseSku.trim()];
    if (size && size.trim()) {
      parts.push(size.trim().replace(/\s+/g, '').toUpperCase());
    }
    if (color && color.trim()) {
      parts.push(color.trim().replace(/\s+/g, '').toUpperCase());
    }
    return parts.filter(Boolean).join('-');
  };

  const generateVariantsFromOptions = (sizes: string[], colors: string[], baseSku: string, basePrice: number) => {
    const cleanSizes = sizes.map((s) => s.trim()).filter(Boolean);
    const cleanColors = colors.map((c) => c.trim()).filter(Boolean);

    const variants: ProductVariantRequest[] = [];

    if (cleanSizes.length && cleanColors.length) {
      cleanSizes.forEach((size) => {
        cleanColors.forEach((color) => {
          variants.push({
            size,
            color,
            sku: generateVariantSku(baseSku, size, color),
            price: basePrice,
            stock: 0,
            active: true,
          });
        });
      });
    } else if (cleanSizes.length) {
      cleanSizes.forEach((size) => {
        variants.push({
          size,
          sku: generateVariantSku(baseSku, size),
          price: basePrice,
          stock: 0,
          active: true,
        });
      });
    } else if (cleanColors.length) {
      cleanColors.forEach((color) => {
        variants.push({
          color,
          sku: generateVariantSku(baseSku, undefined, color),
          price: basePrice,
          stock: 0,
          active: true,
        });
      });
    }

    return variants;
  };

  const handleOptionChange = (field: 'sizes' | 'colors', raw: string) => {
    // Parse values: hỗ trợ cả "S, M, L" và "S,M,L" và "S M L"
    const values = raw
      .split(/[,\s]+/)
      .map((v) => v.trim())
      .filter(Boolean);

    setForm((prev) => {
      const next: ProductCreateRequest = { ...prev, [field]: values };
      const sizes = (field === 'sizes' ? values : next.sizes ?? []) as string[];
      const colors = (field === 'colors' ? values : next.colors ?? []) as string[];

      // Sinh biến thể tự động nếu có size/màu và có SKU mã kho + giá bán
      if ((sizes.length || colors.length) && next.sku && next.price) {
        const autoVariants = generateVariantsFromOptions(sizes, colors, next.sku, Number(next.price));
        // Reset input states cho variants mới
        const newPriceInputs: Record<number, string> = {};
        const newStockInputs: Record<number, string> = {};
        autoVariants.forEach((variant, idx) => {
          newPriceInputs[idx] = variant.price ? String(variant.price) : '';
          newStockInputs[idx] = variant.stock ? String(variant.stock) : '';
        });
        setVariantPriceInputs(newPriceInputs);
        setVariantStockInputs(newStockInputs);
        return {
          ...next,
          variants: autoVariants,
        };
      }

      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="pt-6">
          <p className="text-xs uppercase tracking-[0.4em] text-[var(--muted-foreground)] mb-2">{isEditing ? 'Update product' : 'New product'}</p>
          <h1 className="text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            {headerTitle}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">Điền thông tin chuẩn SEO & kho hàng trước khi xuất bản.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 shadow-lg">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {baseFields.map((item) => (
              <div key={item.field} className="space-y-2">
                <label className="text-sm text-[var(--foreground)]">{item.label}</label>
                <input
                  type="text"
                  placeholder={item.placeholder}
                  value={getFieldValue(item.field)}
                  onChange={(e) => setFormField(item.field, e.target.value as ProductCreateRequest[typeof item.field])}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  required={item.required}
                />
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm text-[var(--foreground)]">Giá bán</label>
              <input
                type="number"
                min={0}
                value={priceInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^\d*$/.test(value)) return;
                  setPriceInput(value);
                  setForm((prev) => ({ ...prev, price: value === '' ? 0 : Number(value) }));
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--foreground)]">Giá gốc (nếu có)</label>
              <input
                type="number"
                min={0}
                value={comparePriceInput}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!/^\d*$/.test(value)) return;
                  setComparePriceInput(value);
                  setForm((prev) => ({
                    ...prev,
                    compareAtPrice: value === '' ? undefined : Number(value),
                  }));
                }}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-[var(--foreground)]">Trạng thái hiển thị</label>
              <select
                value={form.status}
                onChange={(e) => setFormField('status', e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input
                id="featured"
                type="checkbox"
                checked={form.featured ?? false}
                onChange={(e) => setFormField('featured', e.target.checked)}
                className="h-4 w-4"
              />
              <label htmlFor="featured" className="text-sm text-[var(--foreground)]">
                Gắn tag nổi bật
              </label>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {chipFields.map((item) => (
              <div key={item.field} className="space-y-2">
                <label className="text-sm text-[var(--foreground)]">{item.label}</label>
                <input
                  type="text"
                  placeholder={item.placeholder}
                  value={getFieldValue(item.field)}
                  onChange={(e) => {
                    if (item.field === 'sizes' || item.field === 'colors') {
                      handleOptionChange(item.field as 'sizes' | 'colors', e.target.value);
                    } else {
                      setFormField(
                        item.field,
                        e.target.value
                          .split(/[,\s]+/)
                          .map((value) => value.trim())
                          .filter(Boolean) as ProductCreateRequest[typeof item.field],
                      );
                    }
                  }}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Biến thể</h2>
                <p className="text-xs text-[var(--muted-foreground)]">Quản lý size/màu khác nhau và tồn kho tương ứng.</p>
              </div>
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
                className="rounded-full border border-[var(--border)] px-4 py-2 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--muted)]"
              >
                + Thêm biến thể
              </button>
            </div>

            {safeVariants.length === 0 && (
              <p className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--muted)] px-4 py-3 text-sm text-[var(--muted-foreground)]">
                Chưa có biến thể nào. Thêm biến thể để thiết lập tồn kho chi tiết.
              </p>
            )}

            {safeVariants.map((variant, index) => (
              <div
                key={index}
                className="relative flex flex-wrap gap-3 rounded-2xl bg-[var(--muted)] p-4 items-center"
              >
                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="!absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full !bg-[var(--error)] !text-[var(--error-foreground)] text-xs hover:!bg-[var(--error)]/90 z-10"
                  aria-label="Xóa biến thể"
                >
                  ×
                </button>
                {variantTextFields.map((input) => (
                  <input
                    key={input.field}
                    type="text"
                    placeholder={input.placeholder}
                    value={String(variant[input.field] ?? '')}
                    onChange={(e) => updateVariant(index, input.field, e.target.value)}
                    className={`rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                      input.field === 'size' ? 'w-24' : input.field === 'color' ? 'w-32' : 'w-48'
                    } ${input.className ?? ''}`}
                  />
                ))}
                <input
                  type="text"
                  placeholder="Giá biến thể"
                  value={variantPriceInputs[index] ?? (variant.price ? String(variant.price) : '')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (!/^\d*$/.test(value)) return;
                    setVariantPriceInputs((prev) => ({ ...prev, [index]: value }));
                    updateVariant(index, 'price', value === '' ? 0 : Number(value));
                  }}
                  className="w-32 rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Tồn kho"
                    value={variantStockInputs[index] ?? (variant.stock ? String(variant.stock) : '')}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (!/^\d*$/.test(value)) return;
                      setVariantStockInputs((prev) => ({ ...prev, [index]: value }));
                      updateVariant(index, 'stock', value === '' ? 0 : Number(value));
                    }}
                    className="w-24 rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                  <label className="flex items-center gap-2 text-xs text-[var(--foreground)] whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={variant.active ?? true}
                      onChange={(e) => updateVariant(index, 'active', e.target.checked)}
                      className="h-4 w-4"
                    />
                    Bật bán
                  </label>
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-2">
            <label className="text-sm text-[var(--foreground)]">Hình ảnh sản phẩm</label>
            <div className="rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] p-4">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--muted)]">
                <span>Chọn file hình ảnh</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">Hỗ trợ PNG/JPG, tối đa 5MB mỗi ảnh.</p>
              {isEditing && <p className="mt-1 text-xs text-[var(--muted-foreground)]">Nếu không chọn file mới, ảnh cũ sẽ được giữ nguyên.</p>}

              {existingImages.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-[var(--muted-foreground)]">Ảnh hiện tại</p>
                  <div className="flex flex-wrap gap-6">
                    {existingImages.map((image) => (
                      <div key={image.id} className="inline-block relative">
                        <img
                          src={image.url}
                          alt={image.alt ?? 'Product image'}
                          className="h-40 w-auto object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => image.id && handleRemoveExistingImage(image.id)}
                          className="absolute -top-2 -right-2 w-3 h-3 flex items-center justify-center rounded-full bg-[var(--error)] text-[var(--error-foreground)] text-xs hover:bg-[var(--error)]/90"
                          aria-label="Xóa ảnh"
                        >
                          ×
                        </button>
                        <p className="text-center text-sm mt-2 text-[var(--admin-foreground)]">
                          Đã xuất bản
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploadFiles.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Ảnh mới (chưa lưu)</p>
                  <div className="flex flex-wrap gap-6">
                    {uploadFiles.map((item, index) => (
                      <div key={`${item.file.name}-${index}`} className="inline-block relative">
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="h-40 w-auto object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 w-3 h-3 flex items-center justify-center rounded-full bg-[var(--error)] text-[var(--error-foreground)] text-xs hover:bg-[var(--error)]/90"
                          aria-label="Xóa file"
                        >
                          ×
                        </button>
                        <p className="text-center text-sm mt-2 text-gray-300 truncate">
                          {item.file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={loading || prefillLoading}
              className="w-full rounded-full bg-[var(--card)] py-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--card)]/90 disabled:opacity-50"
            >
              {loading ? 'Đang xử lý...' : submitLabel}
            </button>
            {prefillLoading && <p className="text-sm text-[var(--muted-foreground)]">Đang tải dữ liệu sản phẩm...</p>}
          </div>
        </form>
      </div>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
};

export default ProductCreatePage;

