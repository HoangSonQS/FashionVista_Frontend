import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { adminProductImageService, type AdminProductImageResponse } from '../../services/adminProductImageService';
import { adminProductService } from '../../services/adminProductService';
import type { ProductDetail } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { X, Upload, GripVertical, Star, Trash2 } from 'lucide-react';
import { optimizeImages } from '../../utils/imageOptimizer';

interface PendingImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
  primary: boolean;
  cloudinaryPublicId?: string | null;
  isUploading: boolean;
  uploadProgress?: number;
}

// Memoized ImageItem component để tránh re-render không cần thiết
interface ImageItemProps {
  image: AdminProductImageResponse;
  index: number;
  pendingCount: number;
  isDeleting: boolean;
  draggedIndex: number | null;
  onDragStart: (index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  onSetPrimary: (id: number) => void;
  onDelete: (id: number) => void;
  onPreview: (image: AdminProductImageResponse) => void;
}

const ImageItem = memo(({
  image,
  index,
  pendingCount,
  isDeleting,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDragEnd,
  onSetPrimary,
  onDelete,
  onPreview,
}: ImageItemProps) => {
  const actualIndex = pendingCount + index;
  const isDragging = draggedIndex === actualIndex;

  return (
    <div
      draggable={!isDeleting}
      onDragStart={() => onDragStart(actualIndex)}
      onDragOver={(e) => onDragOver(e, actualIndex)}
      onDragEnd={onDragEnd}
      className={`group relative rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden transition-opacity ${
        isDragging ? 'opacity-50' : ''
      } ${isDeleting ? 'opacity-50 pointer-events-none' : ''} ${
        image.primary ? 'ring-2 ring-[var(--primary)]' : ''
      }`}
    >
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black/50 rounded p-1 cursor-move">
          <GripVertical className="w-4 h-4 text-white" />
        </div>
      </div>

      {image.primary && (
        <div className="absolute top-2 right-2 z-10">
          <div className="bg-[var(--primary)] rounded-full p-1">
            <Star className="w-4 h-4 text-white fill-white" />
          </div>
        </div>
      )}

      <div className="absolute bottom-2 left-2 z-10">
        <div className="bg-black/50 rounded px-2 py-1">
          <span className="text-xs text-white font-medium">#{actualIndex + 1}</span>
        </div>
      </div>

      {isDeleting && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
          <div className="bg-white rounded-full p-3">
            <div className="w-6 h-6 border-2 border-[var(--error)] border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      )}

      <div
        className="aspect-square cursor-pointer"
        onClick={() => !isDeleting && onPreview(image)}
      >
        <img
          src={image.url}
          alt={image.alt || `Image ${actualIndex + 1}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {!isDeleting && (
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          {!image.primary && (
            <button
              type="button"
              onClick={() => onSetPrimary(image.id)}
              className="rounded-full bg-[var(--primary)] p-2 text-white hover:bg-[var(--primary-hover)] transition-colors"
              title="Đặt làm ảnh chính"
            >
              <Star className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onPreview(image)}
            className="rounded-full bg-white p-2 text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="Xem ảnh lớn"
          >
            <Upload className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(image.id)}
            className="rounded-full bg-[var(--error)] p-2 text-white hover:bg-red-600 transition-colors"
            title="Xóa ảnh"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
});

ImageItem.displayName = 'ImageItem';

const AdminProductImages = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [images, setImages] = useState<AdminProductImageResponse[]>([]);
  const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<AdminProductImageResponse | PendingImage | null>(null);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    if (!productId) {
      navigate('/admin/products');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [productData, imagesData] = await Promise.all([
          adminProductService.getProduct(Number(productId)),
          adminProductImageService.getProductImages(Number(productId)),
        ]);
        setProduct(productData);
        setImages(imagesData);
      } catch (err) {
        showToast(err instanceof Error ? err.message : 'Không thể tải dữ liệu.', 'error');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [productId, navigate, showToast]);

  // Create preview URL from file (parallel)
  const createPreviewUrls = useCallback(async (files: File[]): Promise<string[]> => {
    const readers = files.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
    return Promise.all(readers);
  }, []);

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!productId) return;

    const fileArray = Array.from(files);

    // Validate files
    for (const file of fileArray) {
      if (!file.type.startsWith('image/')) {
        showToast(`File ${file.name} không phải là hình ảnh.`, 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast(`File ${file.name} vượt quá 5MB.`, 'error');
        return;
      }
    }

    // Optimize images in parallel (client-side resize & compress)
    let optimizedFiles: File[];
    try {
      optimizedFiles = await optimizeImages(fileArray);
    } catch (err) {
      showToast('Không thể tối ưu ảnh. Upload ảnh gốc...', 'warning');
      optimizedFiles = fileArray; // Fallback to original files
    }

    // Create preview URLs in parallel
    const previewUrls = await createPreviewUrls(optimizedFiles);
    const nextOrder = images.length + pendingImages.length;

    // Create pending images immediately (optimistic UI)
    const newPendingImages: PendingImage[] = previewUrls.map((url, i) => ({
      id: `pending-${Date.now()}-${i}`,
      url,
      alt: null,
      order: nextOrder + i,
      primary: images.length === 0 && pendingImages.length === 0 && i === 0,
      isUploading: true,
      uploadProgress: 0,
    }));

    // Add pending images immediately
    setPendingImages((prev) => [...prev, ...newPendingImages]);
    setUploading(true);

    try {
      // Parallel upload to backend
      const uploaded = await adminProductImageService.uploadImages(Number(productId), optimizedFiles);

      // Remove pending images and add real images (optimistic update)
      setPendingImages((prev) => prev.filter((img) => !newPendingImages.some((p) => p.id === img.id)));
      setImages((prev) => [...prev, ...uploaded]);
      showToast(`Đã upload ${uploaded.length} ảnh thành công.`, 'success');
    } catch (err: any) {
      // Remove failed pending images
      setPendingImages((prev) => prev.filter((img) => !newPendingImages.some((p) => p.id === img.id)));

      let errorMessage = 'Không thể upload ảnh.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setUploading(false);
    }
  }, [productId, images.length, pendingImages.length, createPreviewUrls, showToast]);

  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const actualIndex = index - pendingImages.length;
    const actualDraggedIndex = draggedIndex - pendingImages.length;

    if (actualIndex < 0 || actualDraggedIndex < 0) return;

    // Only update state during drag (visual feedback)
    // Actual reorder happens on dragEnd
    setDraggedIndex(index);
  }, [draggedIndex, pendingImages.length]);

  const handleDragEnd = useCallback(async () => {
    if (draggedIndex === null) return;

    const actualDraggedIndex = draggedIndex - pendingImages.length;
    if (actualDraggedIndex < 0) {
      setDraggedIndex(null);
      return;
    }

    // Calculate new order from current images state
    const newOrder = images.map((img) => img.id);
    setDraggedIndex(null);

    try {
      const reordered = await adminProductImageService.reorderImages(Number(productId), newOrder);
      setImages(reordered);
      showToast('Đã sắp xếp lại thứ tự ảnh.', 'success');
    } catch (err: any) {
      const revert = await adminProductImageService.getProductImages(Number(productId));
      setImages(revert);
      showToast('Không thể sắp xếp lại thứ tự. Đã khôi phục.', 'error');
    }
  }, [draggedIndex, images, pendingImages.length, productId, showToast]);

  const handleSetPrimary = useCallback(async (imageId: number) => {
    if (!productId) return;

    // Optimistic update
    const previousImages = images;
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        primary: img.id === imageId,
      }))
    );

    try {
      await adminProductImageService.setPrimary(Number(productId), imageId);
      showToast('Đã đặt làm ảnh chính.', 'success');
    } catch (err: any) {
      // Rollback on error
      setImages(previousImages);
      let errorMessage = 'Không thể đặt làm ảnh chính.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    }
  }, [productId, images, showToast]);

  const handleDelete = useCallback(async (imageId: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh này?')) {
      return;
    }
    if (!productId) return;

    // Optimistic delete: remove from UI immediately
    const imageToDelete = images.find((img) => img.id === imageId);
    const wasPrimary = imageToDelete?.primary;
    const previousImages = images;
    const remainingImages = images.filter((img) => img.id !== imageId);

    setDeletingIds((prev) => new Set(prev).add(imageId));
    setImages(remainingImages);

    // If deleted image was primary and there are remaining images, set first as primary
    if (wasPrimary && remainingImages.length > 0) {
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          primary: img.id === remainingImages[0].id,
        }))
      );
    }

    try {
      await adminProductImageService.deleteImage(Number(productId), imageId);
      showToast('Đã xóa ảnh thành công.', 'success');

      // If was primary, update the new primary on backend
      if (wasPrimary && remainingImages.length > 0) {
        await adminProductImageService.setPrimary(Number(productId), remainingImages[0].id);
      }
    } catch (err: any) {
      // Rollback on error
      setImages(previousImages);
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });

      let errorMessage = 'Không thể xóa ảnh.';
      if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      showToast(errorMessage, 'error');
    } finally {
      setDeletingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  }, [productId, images, showToast]);

  const handleDropZoneDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      void handleFileSelect(files);
    }
  }, [handleFileSelect]);

  const handleDropZoneOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Memoize deletingIds check to avoid re-renders
  const isDeleting = useCallback((id: number) => deletingIds.has(id), [deletingIds]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--muted-foreground)]">Đang tải...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-[var(--error)]">Không tìm thấy sản phẩm.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              to="/admin/products"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--primary)]"
            >
              ← Quay lại danh sách sản phẩm
            </Link>
          </div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Quản lý Hình ảnh: {product.name}
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Upload, sắp xếp và quản lý hình ảnh sản phẩm
          </p>
        </div>
        <Link
          to={`/admin/products/${productId}/edit`}
          className="inline-flex items-center justify-center rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)] transition-colors"
        >
          Chỉnh sửa sản phẩm
        </Link>
      </div>

      <div
        onDrop={handleDropZoneDrop}
        onDragOver={handleDropZoneOver}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          uploading
            ? 'border-[var(--primary)] bg-[var(--primary)]/10'
            : 'border-[var(--border)] hover:border-[var(--primary)]/50 hover:bg-[var(--muted)]/30'
        }`}
      >
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => void handleFileSelect(e.target.files)}
          disabled={uploading}
          className="hidden"
          id="image-upload"
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer flex flex-col items-center gap-3 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Upload className="w-12 h-12 text-[var(--muted-foreground)]" />
          <div>
            <p className="text-sm font-medium">
              {uploading ? 'Đang upload...' : 'Kéo thả ảnh vào đây hoặc click để chọn'}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Hỗ trợ nhiều ảnh cùng lúc • Tự động tối ưu ảnh
            </p>
          </div>
        </label>
      </div>

      {(images.length > 0 || pendingImages.length > 0) ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pendingImages.map((image, index) => (
            <div
              key={image.id}
              className={`group relative rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden ${
                image.primary ? 'ring-2 ring-[var(--primary)]' : ''
              } ${image.isUploading ? 'opacity-75' : ''}`}
            >
              {image.isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <div className="bg-white rounded-full p-3">
                    <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              )}

              {image.primary && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="bg-[var(--primary)] rounded-full p-1">
                    <Star className="w-4 h-4 text-white fill-white" />
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 left-2 z-10">
                <div className="bg-black/50 rounded px-2 py-1">
                  <span className="text-xs text-white font-medium">#{image.order + 1}</span>
                </div>
              </div>

              <div className="aspect-square">
                <img
                  src={image.url}
                  alt={image.alt || `Uploading ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          ))}

          {images.map((image, index) => (
            <ImageItem
              key={image.id}
              image={image}
              index={index}
              pendingCount={pendingImages.length}
              isDeleting={isDeleting(image.id)}
              draggedIndex={draggedIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onSetPrimary={handleSetPrimary}
              onDelete={handleDelete}
              onPreview={setPreviewImage}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
          <p className="text-[var(--muted-foreground)]">Chưa có ảnh nào. Hãy upload ảnh để bắt đầu.</p>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-4">
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImage.url}
              alt={previewImage.alt || 'Preview'}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {previewImage.primary && (
              <div className="absolute bottom-4 left-4 bg-[var(--primary)] rounded-full px-3 py-1 flex items-center gap-2">
                <Star className="w-4 h-4 text-white fill-white" />
                <span className="text-sm text-white font-medium">Ảnh chính</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductImages;
