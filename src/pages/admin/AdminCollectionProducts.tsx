import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { GripVertical, Plus, Search, Trash2, X } from 'lucide-react';
import { adminCollectionService, type AdminPagedProductResponse } from '../../services/adminCollectionService';
import { adminProductService } from '../../services/adminProductService';
import type { ProductListItem } from '../../types/product';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/common/Toast';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

interface CollectionInfo {
  id: number;
  name: string;
  slug: string;
}

const AdminCollectionProducts = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toasts, showToast, removeToast } = useToast();
  const collectionId = id ? Number(id) : null;

  const [collectionInfo, setCollectionInfo] = useState<CollectionInfo | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [data, setData] = useState<AdminPagedProductResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [addProductSearch, setAddProductSearch] = useState('');
  const [addProductOptions, setAddProductOptions] = useState<ProductListItem[]>([]);
  const [selectedAddProducts, setSelectedAddProducts] = useState<Set<number>>(new Set());
  const [loadingAddProducts, setLoadingAddProducts] = useState(false);
  const [addingProducts, setAddingProducts] = useState(false);
  const [removingProducts, setRemovingProducts] = useState(false);

  const debouncedSearch = useDebouncedValue(search, 400);

  // Load collection info
  useEffect(() => {
    if (!collectionId) {
      setError('Collection ID không hợp lệ.');
      return;
    }

    const loadCollectionInfo = async () => {
      try {
        const detail = await adminCollectionService.getDetail(collectionId);
        setCollectionInfo({
          id: detail.id,
          name: detail.name,
          slug: detail.slug,
        });
      } catch (err) {
        setError('Không thể tải thông tin bộ sưu tập.');
        showToast('Không thể tải thông tin bộ sưu tập.', 'error');
      }
    };

    loadCollectionInfo();
  }, [collectionId, showToast]);

  // Load products
  useEffect(() => {
    if (!collectionId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminCollectionService.getCollectionProducts(collectionId, {
          page,
          size: 20,
        });
        setData(response);
      } catch (err: any) {
        const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách sản phẩm.';
        setError(errorMessage);
        showToast(errorMessage, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [collectionId, page, showToast]);

  // Search products to add
  useEffect(() => {
    if (!showAddModal || !addProductSearch.trim()) {
      setAddProductOptions([]);
      return;
    }

    const searchProducts = async () => {
      try {
        setLoadingAddProducts(true);
        const response = await adminProductService.getProducts({
          search: addProductSearch.trim(),
          page: 0,
          size: 20,
        });
        // Filter out products already in collection
        const existingProductIds = new Set(data?.content.map((p) => p.id) || []);
        setAddProductOptions(
          response.items.filter((p) => !existingProductIds.has(p.id))
        );
      } catch (err) {
        showToast('Không thể tìm kiếm sản phẩm.', 'error');
      } finally {
        setLoadingAddProducts(false);
      }
    };

    const timeoutId = setTimeout(searchProducts, 400);
    return () => clearTimeout(timeoutId);
  }, [addProductSearch, showAddModal, data]);

  const handleDragStart = useCallback((index: number) => {
    setDragStartIndex(index);
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDraggedIndex(index);
  }, [draggedIndex]);

  const handleDragEnd = useCallback(async () => {
    if (dragStartIndex === null || draggedIndex === null || !data || !collectionId) {
      setDraggedIndex(null);
      setDragStartIndex(null);
      return;
    }

    // Nếu vị trí không thay đổi, không cần làm gì
    if (dragStartIndex === draggedIndex) {
      setDraggedIndex(null);
      setDragStartIndex(null);
      return;
    }

    const currentOrder = data.content.map((p) => p.id);
    const newOrder = [...currentOrder];
    const draggedProductId = newOrder[dragStartIndex];
    
    // Xóa item ở vị trí cũ
    newOrder.splice(dragStartIndex, 1);
    // Chèn vào vị trí mới
    newOrder.splice(draggedIndex, 0, draggedProductId);

    setDraggedIndex(null);
    setDragStartIndex(null);

    try {
      setReordering(true);
      await adminCollectionService.reorderCollectionProducts(collectionId, newOrder);
      // Không hiển thị toast khi drag & drop thành công (silent update)
      // Reload data
      const response = await adminCollectionService.getCollectionProducts(collectionId, {
        page,
        size: 20,
      });
      setData(response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể sắp xếp lại thứ tự.';
      showToast(errorMessage, 'error');
    } finally {
      setReordering(false);
    }
  }, [dragStartIndex, draggedIndex, data, collectionId, page, showToast]);

  const handleSelectProduct = useCallback((productId: number) => {
    setSelectedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (!data) return;
    if (selectedProducts.size === data.content.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(data.content.map((p) => p.id)));
    }
  }, [data, selectedProducts.size]);

  const handleBulkRemove = useCallback(async () => {
    if (!collectionId || selectedProducts.size === 0) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa ${selectedProducts.size} sản phẩm khỏi bộ sưu tập?`)) {
      return;
    }

    try {
      setRemovingProducts(true);
      const productIds = Array.from(selectedProducts);
      await Promise.all(
        productIds.map((productId) =>
          adminCollectionService.removeProductFromCollection(collectionId, productId)
        )
      );
      showToast(`Đã xóa ${productIds.length} sản phẩm khỏi bộ sưu tập.`, 'success');
      setSelectedProducts(new Set());
      // Reload data
      const response = await adminCollectionService.getCollectionProducts(collectionId, {
        page,
        size: 20,
      });
      setData(response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể xóa sản phẩm.';
      showToast(errorMessage, 'error');
    } finally {
      setRemovingProducts(false);
    }
  }, [collectionId, selectedProducts, page, showToast]);

  const handleAddProducts = useCallback(async (productIds: number[]) => {
    if (!collectionId || productIds.length === 0) return;

    try {
      setAddingProducts(true);
      await Promise.all(
        productIds.map((productId) =>
          adminCollectionService.addProductToCollection(collectionId, productId)
        )
      );
      showToast(`Đã thêm ${productIds.length} sản phẩm vào bộ sưu tập.`, 'success');
      setShowAddModal(false);
      setAddProductSearch('');
      setAddProductOptions([]);
      setSelectedAddProducts(new Set());
      // Reload data
      const response = await adminCollectionService.getCollectionProducts(collectionId, {
        page,
        size: 20,
      });
      setData(response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể thêm sản phẩm.';
      showToast(errorMessage, 'error');
    } finally {
      setAddingProducts(false);
    }
  }, [collectionId, page, showToast]);

  const handleRemoveProduct = useCallback(async (productId: number) => {
    if (!collectionId) return;

    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi bộ sưu tập?')) {
      return;
    }

    try {
      await adminCollectionService.removeProductFromCollection(collectionId, productId);
      showToast('Đã xóa sản phẩm khỏi bộ sưu tập.', 'success');
      // Reload data
      const response = await adminCollectionService.getCollectionProducts(collectionId, {
        page,
        size: 20,
      });
      setData(response);
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Không thể xóa sản phẩm.';
      showToast(errorMessage, 'error');
    }
  }, [collectionId, showToast]);

  const filteredProducts = useMemo(() => {
    if (!data || !debouncedSearch.trim()) return data?.content || [];
    const searchLower = debouncedSearch.toLowerCase();
    return data.content.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower)
    );
  }, [data, debouncedSearch]);

  if (!collectionId) {
    return (
      <div className="p-6">
        <div className="text-red-600">Collection ID không hợp lệ.</div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-6">
        <div className="text-red-600">{error}</div>
        <button
          onClick={() => navigate('/admin/collections')}
          className="mt-4 px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg"
        >
          Quay lại danh sách bộ sưu tập
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <Link
              to="/admin/collections"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-2 inline-block"
            >
              ← Quay lại danh sách bộ sưu tập
            </Link>
            <h1 className="text-2xl font-bold">
              {collectionInfo ? `Quản lý sản phẩm: ${collectionInfo.name}` : 'Quản lý sản phẩm'}
            </h1>
          </div>
          <div className="flex gap-2">
            {collectionInfo && (
              <Link
                to={`/admin/collections/${collectionId}/edit`}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
              >
                Chỉnh sửa bộ sưu tập
              </Link>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary-hover)] flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm sản phẩm
          </button>
          {selectedProducts.size > 0 && (
            <button
              onClick={handleBulkRemove}
              disabled={removingProducts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Xóa ({selectedProducts.size})
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      {loading && !data ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">Đang tải...</div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          {search.trim() ? 'Không tìm thấy sản phẩm nào.' : 'Chưa có sản phẩm nào trong bộ sưu tập.'}
        </div>
      ) : (
        <>
          <div className="border border-[var(--border)] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[var(--muted)]">
                <tr>
                  <th className="w-12 p-3 text-left">
                    <input
                      type="checkbox"
                      checked={data && selectedProducts.size === data.content.length && data.content.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-[var(--border)]"
                    />
                  </th>
                  <th className="w-12 p-3 text-left"></th>
                  <th className="p-3 text-left">Sản phẩm</th>
                  <th className="p-3 text-left">SKU</th>
                  <th className="p-3 text-left">Giá</th>
                  <th className="p-3 text-left">Tồn kho</th>
                  <th className="p-3 text-left">Trạng thái</th>
                  <th className="p-3 text-left">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product, index) => {
                  const actualIndex = data?.content.findIndex((p) => p.id === product.id) ?? index;
                  const isDragging = draggedIndex === actualIndex;
                  return (
                    <tr
                      key={product.id}
                      draggable={!reordering}
                      onDragStart={() => handleDragStart(actualIndex)}
                      onDragOver={(e) => handleDragOver(e, actualIndex)}
                      onDragEnd={handleDragEnd}
                      className={`border-b border-[var(--border)] hover:bg-[var(--muted)] transition-colors ${
                        isDragging ? 'opacity-50' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="rounded border-[var(--border)]"
                        />
                      </td>
                      <td className="p-3">
                        <GripVertical className="w-4 h-4 text-[var(--muted-foreground)] cursor-move" />
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {product.thumbnailUrl && (
                            <img
                              src={product.thumbnailUrl}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                          )}
                          <div>
                            <Link
                              to={`/admin/products/${product.id}`}
                              className="font-medium hover:text-[var(--primary)]"
                            >
                              {product.name}
                            </Link>
                            {product.category && (
                              <div className="text-sm text-[var(--muted-foreground)]">{product.category}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-[var(--muted-foreground)]">{product.sku || '—'}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {product.price.toLocaleString('vi-VN')} ₫
                          </span>
                          {product.compareAtPrice && product.compareAtPrice > product.price && (
                            <span className="text-sm text-[var(--muted-foreground)] line-through">
                              {product.compareAtPrice.toLocaleString('vi-VN')} ₫
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-sm">
                        {product.totalStock !== undefined ? (
                          <span className={product.totalStock > 0 ? '' : 'text-red-600'}>
                            {product.totalStock}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            product.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {product.status === 'ACTIVE' ? 'Đang bán' : 'Ẩn'}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => handleRemoveProduct(product.id)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Xóa khỏi bộ sưu tập"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-[var(--muted-foreground)]">
                Hiển thị {data.content.length} / {data.totalElements} sản phẩm
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="px-4 py-2">
                  Trang {page + 1} / {data.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                  disabled={page >= data.totalPages - 1}
                  className="px-4 py-2 border border-[var(--border)] rounded-lg disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Products Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--background)] rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Thêm sản phẩm vào bộ sưu tập</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddProductSearch('');
                  setAddProductOptions([]);
                  setSelectedAddProducts(new Set());
                }}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--muted-foreground)] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm..."
                  value={addProductSearch}
                  onChange={(e) => setAddProductSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--input-background)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mb-4">
              {loadingAddProducts ? (
                <div className="text-center py-8 text-[var(--muted-foreground)]">Đang tìm kiếm...</div>
              ) : addProductOptions.length === 0 ? (
                <div className="text-center py-8 text-[var(--muted-foreground)]">
                  {addProductSearch.trim() ? 'Không tìm thấy sản phẩm nào.' : 'Nhập từ khóa để tìm kiếm sản phẩm.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {addProductOptions.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-3 p-3 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
                    >
                      <input
                        type="checkbox"
                        onChange={() => {
                          setSelectedAddProducts((prev) => {
                            const newSet = new Set(prev);
                            if (newSet.has(product.id)) {
                              newSet.delete(product.id);
                            } else {
                              newSet.add(product.id);
                            }
                            return newSet;
                          });
                        }}
                        checked={selectedAddProducts.has(product.id)}
                        className="rounded border-[var(--border)]"
                      />
                      {product.thumbnailUrl && (
                        <img
                          src={product.thumbnailUrl}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-[var(--muted-foreground)]">
                          {product.sku} • {product.price.toLocaleString('vi-VN')} ₫
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddProductSearch('');
                  setAddProductOptions([]);
                  setSelectedAddProducts(new Set());
                }}
                className="px-4 py-2 border border-[var(--border)] rounded-lg hover:bg-[var(--muted)]"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  const selectedIds = Array.from(selectedAddProducts);
                  if (selectedIds.length > 0) {
                    handleAddProducts(selectedIds);
                  }
                }}
                disabled={addingProducts || selectedAddProducts.size === 0}
                className="px-4 py-2 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-lg hover:bg-[var(--primary-hover)] disabled:opacity-50"
              >
                {addingProducts ? 'Đang thêm...' : `Thêm (${selectedAddProducts.size})`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCollectionProducts;

