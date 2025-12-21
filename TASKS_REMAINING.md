# Danh sách Task Còn Lại Cần Hoàn Thành

**Ngày cập nhật:** 2025-01-27  
**Trạng thái:** Đang lên kế hoạch

---

## ✅ Đã Hoàn Thành

### Phase 1 (Ưu tiên cao) ✅
- ✅ **M4: Quản lý Danh mục (Categories)** - 6-8 giờ
- ✅ **M16: Quản lý Voucher (Vouchers)** - 8-10 giờ
- ✅ **M7: Quản lý Thanh toán (Payments)** - 6-8 giờ

### Các Task D khác ✅
- ✅ D1: Product Visibility Management
- ✅ D2: Import/Export sản phẩm (CSV)
- ✅ D3: Tích hợp đơn vị vận chuyển (Mock API)
- ✅ D4: In ấn & xuất dữ liệu
- ✅ D6: Bulk actions cho orders
- ✅ D7: Order History Timeline
- ✅ D8: Bổ sung thông tin Order Detail
- ✅ D9: Payment Success/Failed pages
- ✅ D15: Partial refund

---

## 📋 Task Còn Lại - Ưu Tiên Trung Bình

### NHÓM 1: Quản lý Sản phẩm và Biến thể

#### M1: Trang quản lý Biến thể Sản phẩm (Product Variants) ⏳ **CHƯA HOÀN THÀNH**
**Thời gian ước tính:** 6-8 giờ  
**Mức độ:** Trung bình

**Trạng thái hiện tại:**
- ✅ Có hiển thị variants trong AdminProductList (expandable, read-only)
- ❌ Chưa có trang riêng `/admin/product-variants`
- ❌ Chưa có API CRUD riêng cho variants
- ❌ Chưa có chức năng thêm/sửa/xóa variant riêng lẻ
- ❌ Chưa có quick edit stock/giá

**Yêu cầu:**
- Trang `/admin/product-variants`
- List tất cả variants với filter theo sản phẩm, size, color, stock
- Thêm/sửa/xóa variant riêng lẻ
- Cập nhật stock và giá nhanh
- Link đến sản phẩm chính

**Cần làm:**
- Backend: API CRUD cho product variants (`AdminProductVariantController`)
- Frontend: Trang AdminProductVariants.tsx với bảng list, filter, quick edit
- Frontend: Route `/admin/product-variants` trong AppRoutes
- Frontend: Menu item trong AdminLayout

---

#### M2: Trang quản lý Hình ảnh Sản phẩm (Product Images) ⏳
**Thời gian ước tính:** 8-10 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/product-images/:productId`
- Upload nhiều ảnh
- Drag & drop để sắp xếp thứ tự
- Preview ảnh
- Xóa ảnh
- Set ảnh chính (thumbnail)

**Cần làm:**
- Backend: API upload, reorder, set primary, delete images
- Frontend: Trang AdminProductImages.tsx với drag & drop, preview

---

### NHÓM 2: Quản lý Danh mục và Bộ sưu tập

#### M5: Trang quản lý Sản phẩm trong Bộ sưu tập (Collection Products) ⏳
**Thời gian ước tính:** 8-10 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/collections/:id/products`
- List sản phẩm trong collection
- Thêm/xóa sản phẩm hàng loạt
- Sắp xếp thứ tự sản phẩm trong collection

**Cần làm:**
- Backend: API list, add, remove, reorder products trong collection
- Frontend: Trang AdminCollectionProducts.tsx với bulk actions, drag & drop

---

### NHÓM 3: Quản lý Đơn hàng và Thanh toán

#### M6: Trang quản lý Chi tiết Đơn hàng (Order Items) ⏳ **CHƯA HOÀN THÀNH**
**Thời gian ước tính:** 8-10 giờ  
**Mức độ:** Trung bình

**Trạng thái hiện tại:**
- ✅ Có hiển thị order items trong AdminOrders modal (read-only)
- ❌ Chưa có chức năng chỉnh sửa số lượng item
- ❌ Chưa có chức năng hủy item riêng lẻ
- ❌ Chưa có chức năng thêm item mới vào đơn
- ❌ Backend chưa có API PATCH/POST/DELETE cho order items

**Yêu cầu:**
- Trong Order Detail modal, cho phép:
  - Chỉnh sửa số lượng item (nếu order chưa shipped)
  - Hủy item riêng lẻ
  - Thêm item mới vào đơn (nếu order chưa shipped)

**Cần làm:**
- Backend: API `PATCH /api/admin/orders/:id/items/:itemId` (update quantity)
- Backend: API `DELETE /api/admin/orders/:id/items/:itemId` (delete item)
- Backend: API `POST /api/admin/orders/:id/items` (add item)
- Backend: Validation chỉ cho phép khi order status = PENDING hoặc CONFIRMED
- Backend: Tự động recalculate order total
- Frontend: UI trong Order Detail modal với inline edit, add item, delete item

---

### NHÓM 4: Quản lý Hoàn tiền và Trả hàng

#### M9: Trang quản lý Yêu cầu Trả hàng (Return Requests) ⏳ **CHƯA HOÀN THÀNH**
**Thời gian ước tính:** 6-8 giờ  
**Mức độ:** Trung bình

**Trạng thái hiện tại:**
- ✅ Backend có `AdminReturnController` với API list, getByOrder, updateStatus
- ✅ Frontend có `adminReturnService` và hiển thị return requests trong AdminOrders modal
- ❌ Chưa có trang riêng `/admin/returns` trong routes
- ❌ Chưa có menu item trong AdminLayout
- ❌ Chưa có UI đầy đủ với bảng list, filter, bulk actions

**Yêu cầu:**
- Trang `/admin/returns`
- List tất cả return requests với filter
- Phê duyệt/từ chối hàng loạt
- Xem chi tiết return request

**Cần làm:**
- Backend: API đã có sẵn (`GET /api/admin/returns`, `PATCH /api/admin/returns/:id`)
- Frontend: Trang AdminReturns.tsx với bảng list, filter, bulk actions, modal detail
- Frontend: Route `/admin/returns` trong AppRoutes
- Frontend: Menu item "Đổi trả" trong AdminLayout

---

### NHÓM 5: Quản lý Khách hàng và Tương tác

#### M13: Trang quản lý Đánh giá (Reviews) ⏳
**Thời gian ước tính:** 8-10 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/reviews`
- List tất cả reviews với filter
- Phê duyệt/xóa review
- Trả lời bình luận
- Filter theo sản phẩm, rating, status

**Cần làm:**
- Backend: API list, approve, reject, delete, reply reviews
- Frontend: Trang AdminReviews.tsx với bảng list, filter, modal detail

---

#### M15: Trang quản lý Lịch sử Điểm Thân thiết (Loyalty Point History) ⏳
**Thời gian ước tính:** 6-8 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/loyalty-points` hoặc trong User Detail
- Xem lịch sử tích điểm của user
- Cộng/trừ điểm thủ công
- Thống kê tổng điểm theo tier

**Cần làm:**
- Backend: API list history, add/subtract points, stats
- Frontend: Trang AdminLoyaltyPoints.tsx hoặc section trong User Detail

---

#### M21: Trang quản lý Hoạt động Đăng nhập (Login Activity) ⏳
**Thời gian ước tính:** 6-8 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/login-activities` hoặc trong User Detail
- List lịch sử đăng nhập
- Phát hiện hoạt động đáng ngờ (IP lạ, nhiều lần thất bại)

**Cần làm:**
- Backend: API list với filter, detect suspicious activities
- Frontend: Trang AdminLoginActivities.tsx với bảng list, filter, highlight suspicious

---

## 📋 Task Còn Lại - Ưu Tiên Thấp

### NHÓM 1: Quản lý Sản phẩm

#### M3: Trang quản lý Thuộc tính Sản phẩm (Product Attributes) ⏳
**Thời gian ước tính:** 10-12 giờ  
**Mức độ:** Phức tạp

**Yêu cầu:**
- Trang `/admin/product-attributes`
- Quản lý các loại attributes: Material, Brand, Size, Color, etc.
- Gán attributes cho sản phẩm
- Filter sản phẩm theo attributes

---

### NHÓM 4: Quản lý Hoàn tiền và Trả hàng

#### M10: Trang quản lý Chi tiết Trả hàng (Return Items) ⏳
**Thời gian ước tính:** 4-6 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trong Return Request detail, cho phép:
  - Xem chi tiết items được trả
  - Kiểm tra stock khi hoàn trả
  - Cập nhật số lượng items được trả

---

### NHÓM 5: Quản lý Khách hàng

#### M12: Trang quản lý Địa chỉ (Addresses) ⏳
**Thời gian ước tính:** 4-6 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/addresses` hoặc trong User Detail
- List địa chỉ của user
- Xem chi tiết địa chỉ
- Chỉnh sửa/xóa địa chỉ (nếu cần)

---

#### M14: Trang quản lý Danh sách Yêu thích (Wishlists) ⏳
**Thời gian ước tính:** 4-6 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/wishlists` hoặc trong User Detail
- Xem wishlist của từng user
- Phân tích: sản phẩm được yêu thích nhất

---

### NHÓM 6: Quản lý Giỏ hàng

#### M17: Trang quản lý Giỏ hàng (Carts) ⏳
**Thời gian ước tính:** 8-10 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trang `/admin/carts`
- List carts đang hoạt động
- List abandoned carts (carts cũ chưa checkout)
- Gửi email nhắc nhở cho abandoned carts

---

#### M18: Trang quản lý Chi tiết Giỏ hàng (Cart Items) ⏳
**Thời gian ước tính:** 4-6 giờ  
**Mức độ:** Trung bình

**Yêu cầu:**
- Trong Cart detail, hiển thị:
  - Chi tiết items trong cart
  - Phân tích lý do bỏ giỏ (nếu có)

---

### NHÓM 7: Quản lý Bảo mật

#### M19: Trang quản lý Token Xác thực Email ⏳
**Thời gian ước tính:** 3-4 giờ  
**Mức độ:** Dễ

**Yêu cầu:**
- Trang `/admin/email-verification-tokens` hoặc trong User Detail
- Xem tokens của user
- Resend verification email
- Xử lý token hết hạn

---

#### M20: Trang quản lý Token Đặt lại Mật khẩu ⏳
**Thời gian ước tính:** 3-4 giờ  
**Mức độ:** Dễ

**Yêu cầu:**
- Trang `/admin/password-reset-tokens` hoặc trong User Detail
- Xem tokens của user
- Invalidate token (nếu cần)

---

## 📊 Tổng Kết

### Thống kê
- **Tổng số task còn lại:** 18 tasks
- **Ưu tiên trung bình:** 8 tasks (58-72 giờ)
- **Ưu tiên thấp:** 10 tasks (37-50 giờ)
- **Tổng thời gian ước tính:** 95-122 giờ

### Gợi ý thứ tự thực hiện

**Phase 2 (Ưu tiên trung bình - 58-72 giờ):**
1. **M1:** Quản lý Biến thể Sản phẩm (6-8h)
2. **M2:** Quản lý Hình ảnh Sản phẩm (8-10h)
3. **M5:** Quản lý Sản phẩm trong Bộ sưu tập (8-10h)
4. **M6:** Quản lý Chi tiết Đơn hàng (8-10h)
5. **M9:** Trang quản lý Return Requests (6-8h)
6. **M13:** Quản lý Đánh giá (8-10h)
7. **M15:** Quản lý Loyalty Points (6-8h)
8. **M21:** Quản lý Login Activity (6-8h)

**Phase 3 (Ưu tiên thấp - 37-50 giờ):**
- Các task còn lại (M3, M10, M12, M14, M17, M18, M19, M20)

---

## 📝 Lưu ý

1. **Test Guide:** Mỗi task sau khi hoàn thành nên có test guide tương tự như M4, M16, M7
2. **Code Review:** Nên review code trước khi commit
3. **Documentation:** Cập nhật IMPLEMENTATION_STATUS.md sau mỗi task hoàn thành
4. **Priority:** Có thể điều chỉnh thứ tự ưu tiên dựa trên nhu cầu thực tế

