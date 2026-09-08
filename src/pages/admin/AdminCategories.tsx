import { useEffect, useMemo, useState } from 'react';
import { adminCategoryService, type AdminCategoryResponse, type CategoryCreateRequest, type CategoryUpdateRequest } from '../../services/adminCategoryService';
import { useToast } from '../../hooks/useToast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const AdminCategories = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400); // Debounce 400ms
  const [isActive, setIsActive] = useState<string>('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<{ content: AdminCategoryResponse[]; totalElements: number; totalPages: number; number: number; size: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CategoryCreateRequest>({
    name: '',
    slug: '',
    description: '',
    image: '',
    parentId: undefined,
    order: 0,
    isActive: true,
  });
  const [categories, setCategories] = useState<AdminCategoryResponse[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { showToast } = useToast();

  const filters = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      isActive: isActive === '' ? undefined : isActive === 'true',
      page,
      size: 20,
    }),
    [debouncedSearch, isActive, page],
  );

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await adminCategoryService.getAllCategories(filters);
        setData(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể tải danh sách danh mục.');
        showToast(err instanceof Error ? err.message : 'Không thể tải danh sách danh mục.', 'error');
      } finally {
        setLoading(false);
      }
    };

    void fetchCategories();
  }, [filters, showToast, refreshKey]);

  // Load all categories for parent selection
  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const response = await adminCategoryService.getAllCategories({ size: 1000 });
        setCategories(response.content);
      } catch {
        // Ignore error
      }
    };
    void loadAllCategories();
  }, []);

  const handleOpenModal = (category?: AdminCategoryResponse) => {
    if (category) {
      setEditingId(category.id);
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        image: category.image || '',
        parentId: category.parentId || undefined,
        order: category.order,
        isActive: category.isActive,
      });
      setImagePreview(category.image || null);
      setSelectedImageFile(null);
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        image: '',
        parentId: undefined,
        order: 0,
        isActive: true,
      });
      setImagePreview(null);
      setSelectedImageFile(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setImagePreview(null);
    setSelectedImageFile(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      image: '',
      parentId: undefined,
      order: 0,
      isActive: true,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        showToast('Vui lòng chọn file hình ảnh.', 'error');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('Kích thước file không được vượt quá 5MB.', 'error');
        return;
      }
      // Lưu file để upload sau
      setSelectedImageFile(file);
      // Read file as data URL để preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
      };
      reader.onerror = () => {
        showToast('Lỗi khi đọc file hình ảnh.', 'error');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setSelectedImageFile(null);
    setFormData({ ...formData, image: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        const updateRequest: CategoryUpdateRequest = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          // Nếu có file mới, không gửi URL (backend sẽ upload file)
          // Nếu không có file nhưng có URL, gửi URL
          image: selectedImageFile ? undefined : (formData.image || undefined),
          parentId: formData.parentId || null,
          order: formData.order,
          isActive: formData.isActive,
        };
        // Gửi file nếu có, backend sẽ upload lên Cloudinary
        const updatedCategory = await adminCategoryService.updateCategory(editingId, updateRequest, selectedImageFile || undefined);
        showToast('Cập nhật danh mục thành công.', 'success');
        
        // Optimistic update: Cập nhật item trong list ngay lập tức thay vì reload toàn bộ
        if (data) {
          setData({
            ...data,
            content: data.content.map((cat) =>
              cat.id === editingId
                ? {
                    ...updatedCategory,
                    // Giữ nguyên productCount từ item cũ (không cần fetch lại)
                    productCount: cat.productCount,
                  }
                : cat
            ),
          });
        }
        
        // Chỉ update categories list cho parent selection nếu parentId thay đổi
        const oldCategory = categories.find((c) => c.id === editingId);
        if (oldCategory && oldCategory.parentId !== updatedCategory.parentId) {
          // Reload categories list để có parent name mới
          try {
            const allResponse = await adminCategoryService.getAllCategories({ size: 1000 });
            setCategories(allResponse.content);
          } catch {
            // Ignore error
          }
        } else {
          // Update item trong categories list
          setCategories((prev) =>
            prev.map((cat) => (cat.id === editingId ? updatedCategory : cat))
          );
        }
        
        handleCloseModal();
        return; // Return sớm để không trigger refresh
      } else {
        const createRequest: CategoryCreateRequest = {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || undefined,
          // Nếu có file mới, không gửi URL (backend sẽ upload file)
          // Nếu không có file nhưng có URL, gửi URL
          image: selectedImageFile ? undefined : (formData.image || undefined),
          parentId: formData.parentId,
          order: formData.order,
          isActive: formData.isActive,
        };
        await adminCategoryService.createCategory(createRequest, selectedImageFile || undefined);
        showToast('Tạo danh mục thành công.', 'success');
        // Reset về trang đầu tiên và clear search để hiển thị category mới
        setPage(0);
        setSearch('');
        handleCloseModal();
        // Fetch lại data ngay lập tức với page=0 và không có search
        try {
          const refreshFilters = {
            search: undefined,
            isActive: isActive === '' ? undefined : isActive === 'true',
            page: 0,
            size: 20,
          };
          const response = await adminCategoryService.getAllCategories(refreshFilters);
          setData(response);
          // Reload all categories for parent selection
          const allResponse = await adminCategoryService.getAllCategories({ size: 1000 });
          setCategories(allResponse.content);
        } catch {
          // Ignore error, sẽ được fetch lại bởi useEffect
        }
        return; // Return sớm để không chạy code bên dưới
      }
      handleCloseModal();
      // Trigger refresh bằng cách tăng refreshKey cho trường hợp update
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      // Extract error message from axios error response
      let errorMessage = 'Có lỗi xảy ra.';
      
      // Handle axios error response
      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data;
        
        // Extract message from error response
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data) {
          // Try to extract message from nested structure
          errorMessage = JSON.stringify(data);
        }
        
        // Handle specific status codes
        if (status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện hành động này.';
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      console.error('Error creating/updating category:', err);
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      return;
    }
    try {
      await adminCategoryService.deleteCategory(id);
      showToast('Xóa danh mục thành công.', 'success');
      // Refresh data
      const response = await adminCategoryService.getAllCategories(filters);
      setData(response);
      // Reload all categories for parent selection
      const allResponse = await adminCategoryService.getAllCategories({ size: 1000 });
      setCategories(allResponse.content);
    } catch (err: any) {
      // Extract error message from axios error response
      let errorMessage = 'Không thể xóa danh mục.';
      
      // Handle axios error response
      if (err?.response) {
        const data = err.response.data;
        if (data?.message) {
          errorMessage = data.message;
        } else if (typeof data === 'string') {
          errorMessage = data;
        } else if (data) {
          errorMessage = JSON.stringify(data);
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      showToast(errorMessage, 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>
            Danh mục
          </h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            Quản lý các danh mục sản phẩm để tổ chức hàng hóa.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleOpenModal()}
          className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] transition-colors"
        >
          + Tạo danh mục
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="search"
          placeholder="Tìm theo tên, slug..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        />
        <select
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(0);
          }}
          className="rounded-xl border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          <option value="">Tất cả</option>
          <option value="true">Đang kích hoạt</option>
          <option value="false">Đã vô hiệu hóa</option>
        </select>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--muted)] text-[var(--muted-foreground)] text-sm leading-normal">
              <th className="py-4 px-6 font-semibold w-1/3">Tên danh mục</th>
              <th className="py-4 px-6 font-semibold">Slug</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Danh mục cha</th>
              <th className="py-4 px-6 font-semibold text-center whitespace-nowrap">Số sản phẩm</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Trạng thái</th>
              <th className="py-4 px-6 font-semibold whitespace-nowrap">Thứ tự</th>
              <th className="py-4 px-6 font-semibold text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="text-[var(--muted-foreground)] text-sm">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Đang tải...
                </td>
              </tr>
            ) : data && data.content.length > 0 ? (
              data.content.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--border)] hover:bg-[var(--muted)]/30 transition-colors group"
                >
                  <td className="py-4 px-6 align-top">
                    <div className="font-bold text-[var(--primary)] text-base mb-1 group-hover:underline cursor-pointer">
                      {item.name}
                    </div>
                    {item.description && (
                      <p className="text-xs text-[var(--muted-foreground)] leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </td>
                  <td className="py-4 px-6 align-top font-mono text-xs text-[var(--primary)]">
                    {item.slug}
                  </td>
                  <td className="py-4 px-6 align-top text-[var(--muted-foreground)]">
                    {item.parentName ? item.parentName : '—'}
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--muted)] text-[var(--foreground)]">
                      {item.productCount}
                    </span>
                  </td>
                  <td className="py-4 px-6 align-top">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                        item.isActive
                          ? 'bg-[var(--success-bg)] text-[var(--success)]'
                          : 'bg-[var(--muted)] text-[var(--foreground)]'
                      }`}
                    >
                      {item.isActive ? 'Kích hoạt' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="py-4 px-6 align-top text-[var(--primary)] font-medium">
                    {item.order}
                  </td>
                  <td className="py-4 px-6 align-top text-center">
                    <div className="flex flex-col items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(item)}
                        className="w-full px-3 py-1 text-xs font-medium text-[var(--primary)] bg-[var(--card)] border border-[var(--primary)]/30 rounded-full hover:bg-[var(--primary)]/10 transition-colors"
                      >
                        Chỉnh sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="w-full px-3 py-1 text-xs font-medium text-[var(--error)] bg-[var(--card)] border border-[var(--error)]/30 rounded-full hover:bg-[var(--error)]/10 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-6 text-center text-[var(--muted-foreground)]">
                  Chưa có danh mục nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data && (
        <div className="text-center text-xs text-[var(--muted-foreground)] mt-4">
          {data.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <span>
                Hiển thị {data.content.length} trên tổng số {data.totalElements} danh mục
              </span>
              <div className="space-x-2">
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                  className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)] transition-colors"
                >
                  Trước
                </button>
                <button
                  type="button"
                  disabled={page + 1 >= data.totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-full border border-[var(--border)] px-3 py-1 disabled:opacity-50 hover:bg-[var(--muted)] transition-colors"
                >
                  Sau
                </button>
              </div>
            </div>
          ) : (
            <span>Hiển thị {data.totalElements} trên tổng số {data.totalElements} danh mục</span>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingId ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}
              </h2>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-full p-2 hover:bg-[var(--muted)]"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên danh mục *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Áo thun, Quần jean, Váy công sở..."
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Ví dụ: ao-thun, quan-jean, vay-cong-so (không dấu, cách nhau bằng dấu gạch ngang)"
                  required
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mô tả</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả ngắn gọn về danh mục này (tùy chọn)..."
                  rows={3}
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Hình ảnh (tùy chọn)</label>
                <div className="space-y-2">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border border-[var(--border)]"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                        title="Xóa ảnh"
                      >
                        <span className="text-xs">✕</span>
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-4 text-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        id="category-image-upload"
                      />
                      <label
                        htmlFor="category-image-upload"
                        className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[var(--muted)] rounded-lg hover:bg-[var(--muted)]/80 transition-colors"
                      >
                        <span className="text-sm">📷 Chọn ảnh từ máy tính</span>
                      </label>
                      <p className="text-xs text-[var(--muted-foreground)] mt-2">
                        Hoặc nhập URL bên dưới
                      </p>
                    </div>
                  )}
                  {!imagePreview || imagePreview.startsWith('http') ? (
                    <input
                      type="text"
                      value={formData.image && !formData.image.startsWith('data:') ? formData.image : ''}
                      onChange={(e) => {
                        const url = e.target.value;
                        setFormData({ ...formData, image: url });
                        if (url) {
                          setImagePreview(url);
                        } else {
                          setImagePreview(null);
                        }
                      }}
                      placeholder="https://example.com/image.jpg (hoặc chọn ảnh từ máy tính)"
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  ) : (
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Đã chọn ảnh từ máy tính. Click ✕ để xóa và chọn lại hoặc nhập URL.
                    </p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Danh mục cha</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      parentId: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                >
                  <option value="">Không có (danh mục gốc)</option>
                  {categories
                    .filter((c) => !editingId || c.id !== editingId)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    placeholder="0, 1, 2... (số càng nhỏ hiển thị càng trước)"
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--input-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                  >
                    <option value="true">Kích hoạt</option>
                    <option value="false">Vô hiệu hóa</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--muted)]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-50"
                >
                  {submitting ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;

