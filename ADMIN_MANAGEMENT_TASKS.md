# Danh sách Task Quản lý Admin - Phân tích và Kế hoạch

**Ngày tạo:** 2025-01-27  
**Mục đích:** Phân tích các chức năng quản lý admin đã có và chưa có, lên kế hoạch hiện thực

---

## 📊 Tổng quan

### Đã có ✅
- Quản lý Sản phẩm: List, Create/Edit (có variants trong form), Visibility, Import/Export
- Quản lý Bộ sưu tập: List, Create/Edit
- Quản lý Đơn hàng: List, Update status, Bulk actions, Order History (D7), Partial Refund (D15)
- Quản lý Người dùng: List, Detail
- Quản lý Phí vận chuyển: Config shipping fees
- Return Requests: API có sẵn, hiển thị trong Order Detail modal

### Chưa có hoặc chưa đủ ⏳
- Quản lý Biến thể Sản phẩm (riêng biệt)
- Quản lý Hình ảnh Sản phẩm (riêng biệt)
- Quản lý Thuộc tính Sản phẩm
- Quản lý Danh mục (CRUD)
- Quản lý Sản phẩm trong Bộ sưu tập
- Quản lý Chi tiết Đơn hàng (chỉnh sửa item)
- Trang quản lý Payments riêng
- Trang quản lý Return Requests riêng
- Quản lý Địa chỉ
- Quản lý Đánh giá
- Quản lý Wishlist
- Quản lý Loyalty Points
- Quản lý Vouchers (CRUD)
- Quản lý Carts
- Quản lý Security tokens
- Quản lý Login Activity

---

## 📋 Chi tiết từng Task

### NHÓM 1: Quản lý Sản phẩm và Biến thể

#### Task M1: Trang quản lý Biến thể Sản phẩm (Product Variants) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Variants được quản lý trong form tạo/sửa sản phẩm (`ProductCreate.tsx`)
- ❌ Chưa có trang riêng để quản lý variants của tất cả sản phẩm
- ❌ Chưa có chức năng thêm/sửa/xóa variant riêng lẻ ngoài form sản phẩm

**Yêu cầu:**
- Trang `/admin/product-variants`
- List tất cả variants với filter theo sản phẩm, size, color, stock
- Thêm/sửa/xóa variant riêng lẻ
- Cập nhật stock và giá nhanh
- Link đến sản phẩm chính

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/product-variants` (list với filter)
   - [ ] API `POST /api/admin/product-variants` (tạo variant mới)
   - [ ] API `PATCH /api/admin/product-variants/:id` (cập nhật variant)
   - [ ] API `DELETE /api/admin/product-variants/:id` (xóa variant)
   - [ ] Validation: không cho xóa variant nếu đã có trong order

2. Frontend:
   - [ ] Trang `AdminProductVariants.tsx`
   - [ ] Bảng list variants: Product, Size, Color, SKU, Price, Stock, Active
   - [ ] Filter: Product, Size, Color, Stock status
   - [ ] Quick edit: Stock, Price inline
   - [ ] Modal thêm/sửa variant
   - [ ] Link đến sản phẩm chính

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 6-8 giờ

---

#### Task M2: Trang quản lý Hình ảnh Sản phẩm (Product Images) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Upload images trong form tạo/sửa sản phẩm
- ❌ Chưa có trang riêng để quản lý images
- ❌ Chưa có chức năng sắp xếp thứ tự images
- ❌ Chưa có preview và tối ưu hóa

**Yêu cầu:**
- Trang `/admin/product-images/:productId`
- Upload nhiều ảnh
- Drag & drop để sắp xếp thứ tự
- Preview ảnh
- Xóa ảnh
- Set ảnh chính (thumbnail)

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/products/:id/images` (list images với thứ tự)
   - [ ] API `POST /api/admin/products/:id/images` (upload images)
   - [ ] API `PATCH /api/admin/products/:id/images/reorder` (sắp xếp thứ tự)
   - [ ] API `PATCH /api/admin/products/:id/images/:imageId/set-primary` (set thumbnail)
   - [ ] API `DELETE /api/admin/products/:id/images/:imageId` (xóa image)

2. Frontend:
   - [ ] Trang `AdminProductImages.tsx`
   - [ ] Upload zone với drag & drop
   - [ ] Grid hiển thị images với thứ tự
   - [ ] Drag & drop để sắp xếp
   - [ ] Preview modal
   - [ ] Nút "Set làm ảnh chính"
   - [ ] Nút xóa image

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 8-10 giờ

---

#### Task M3: Trang quản lý Thuộc tính Sản phẩm (Product Attributes) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Sản phẩm có tags, sizes, colors (nhưng là array đơn giản)
- ❌ Chưa có hệ thống quản lý attributes tập trung
- ❌ Chưa có thuộc tính như chất liệu, thương hiệu

**Yêu cầu:**
- Trang `/admin/product-attributes`
- Quản lý các loại attributes: Material, Brand, Size, Color, etc.
- Gán attributes cho sản phẩm
- Filter sản phẩm theo attributes

**Cần làm:**
1. Backend:
   - [ ] Tạo entity `ProductAttribute` (name, type, value)
   - [ ] Migration tạo bảng `product_attributes`
   - [ ] API CRUD cho attributes
   - [ ] API gán attributes cho sản phẩm
   - [ ] Filter sản phẩm theo attributes

2. Frontend:
   - [ ] Trang `AdminProductAttributes.tsx`
   - [ ] List attributes với type (Material, Brand, etc.)
   - [ ] Thêm/sửa/xóa attribute
   - [ ] Gán attributes cho sản phẩm trong form

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 10-12 giờ

---

### NHÓM 2: Quản lý Danh mục và Bộ sưu tập

#### Task M4: Trang quản lý Danh mục (Categories) ✅ HOÀN THÀNH

**Trạng thái:** ✅ Đã hoàn thành
- ✅ API admin CRUD categories
- ✅ Trang `/admin/categories` với đầy đủ chức năng
- ✅ Upload image từ máy tính hoặc URL, tích hợp Cloudinary
- ✅ Tự động xóa ảnh trên Cloudinary khi xóa category
- ✅ Search, filter, pagination
- ✅ Optimistic update cho edit
- ✅ Hiển thị ảnh category trên trang home và public category pages

**Test Guide:** `TEST_GUIDE_M4_CATEGORIES.md`

---

#### Task M5: Trang quản lý Sản phẩm trong Bộ sưu tập (Collection Products) ⏳ CHƯA ĐỦ

**Trạng thái hiện tại:**
- ✅ Có `AdminCollectionCreate.tsx` - có thể gán sản phẩm khi tạo/sửa collection
- ❌ Chưa có trang riêng để quản lý sản phẩm trong collection
- ❌ Chưa có bulk add/remove products

**Yêu cầu:**
- Trang `/admin/collections/:id/products`
- List sản phẩm trong collection
- Thêm/xóa sản phẩm hàng loạt
- Sắp xếp thứ tự sản phẩm trong collection

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/collections/:id/products` (list với pagination)
   - [ ] API `POST /api/admin/collections/:id/products` (thêm sản phẩm)
   - [ ] API `DELETE /api/admin/collections/:id/products/:productId` (xóa sản phẩm)
   - [ ] API `PATCH /api/admin/collections/:id/products/reorder` (sắp xếp thứ tự)
   - [ ] API `POST /api/admin/collections/:id/products/bulk` (thêm/xóa hàng loạt)

2. Frontend:
   - [ ] Trang `AdminCollectionProducts.tsx`
   - [ ] Bảng list sản phẩm trong collection
   - [ ] Search và filter sản phẩm để thêm
   - [ ] Checkbox để chọn nhiều, bulk add/remove
   - [ ] Drag & drop để sắp xếp thứ tự

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 8-10 giờ

---

### NHÓM 3: Quản lý Đơn hàng và Thanh toán

#### Task M6: Trang quản lý Chi tiết Đơn hàng (Order Items) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Xem order items trong Order Detail modal
- ❌ Chưa có chức năng chỉnh sửa số lượng item
- ❌ Chưa có chức năng hủy item riêng lẻ

**Yêu cầu:**
- Trong Order Detail modal, cho phép:
  - Chỉnh sửa số lượng item (nếu order chưa shipped)
  - Hủy item riêng lẻ
  - Thêm item mới vào đơn (nếu order chưa shipped)

**Cần làm:**
1. Backend:
   - [ ] API `PATCH /api/admin/orders/:id/items/:itemId` (cập nhật số lượng)
   - [ ] API `DELETE /api/admin/orders/:id/items/:itemId` (xóa item)
   - [ ] API `POST /api/admin/orders/:id/items` (thêm item mới)
   - [ ] Validation: chỉ cho phép khi order status = PENDING hoặc CONFIRMED
   - [ ] Tự động recalculate order total
   - [ ] Ghi Order History

2. Frontend:
   - [ ] UI trong Order Detail modal:
   - [ ] Inline edit số lượng
   - [ ] Nút "Xóa item"
   - [ ] Nút "Thêm sản phẩm" với modal chọn sản phẩm
   - [ ] Hiển thị warning nếu order đã shipped

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 8-10 giờ

---

#### Task M7: Trang quản lý Thanh toán (Payments) ✅ HOÀN THÀNH

**Trạng thái:** ✅ Đã hoàn thành
- ✅ Trang `/admin/payments` với đầy đủ chức năng
- ✅ List payments với search, filter theo method và status
- ✅ Sort theo createdAt DESC (mới nhất trước)
- ✅ Modal chi tiết payment với cập nhật trạng thái
- ✅ Đồng bộ COD payments khi order chuyển sang DELIVERED
- ✅ Validation: COD không thể set PAID nếu order chưa DELIVERED
- ✅ Nút "Đồng bộ COD đã giao" để sync các đơn cũ

**Test Guide:** `TEST_GUIDE_M16_M7.md`

---

#### Task M8: Trang quản lý Lịch sử Đơn hàng (Order History) ✅ ĐÃ CÓ (D7)

**Trạng thái:** ✅ Đã hoàn thành trong Task D7
- Order History hiển thị trong Order Detail modal
- Ghi log tự động khi thay đổi status, paymentStatus, trackingNumber

**Không cần làm thêm**

---

### NHÓM 4: Quản lý Hoàn tiền và Trả hàng

#### Task M9: Trang quản lý Yêu cầu Trả hàng (Return Requests) ⏳ CHƯA ĐỦ

**Trạng thái hiện tại:**
- ✅ API `GET /api/admin/returns` (list return requests)
- ✅ API `PATCH /api/admin/returns/:id` (update status)
- ✅ Hiển thị return request trong Order Detail modal
- ❌ Chưa có trang riêng để quản lý return requests

**Yêu cầu:**
- Trang `/admin/returns`
- List tất cả return requests với filter
- Phê duyệt/từ chối hàng loạt
- Xem chi tiết return request

**Cần làm:**
1. Backend:
   - [ ] API đã có sẵn, chỉ cần kiểm tra filter options

2. Frontend:
   - [ ] Trang `AdminReturns.tsx`
   - [ ] Bảng list return requests: Order, Customer, Status, Date, Amount
   - [ ] Filter: Status, Date range
   - [ ] Bulk actions: Approve/Reject hàng loạt
   - [ ] Modal chi tiết return request
   - [ ] Link đến order detail

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 6-8 giờ

---

#### Task M10: Trang quản lý Chi tiết Trả hàng (Return Items) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Return items hiển thị trong Order Detail modal
- ❌ Chưa có chức năng quản lý return items riêng

**Yêu cầu:**
- Trong Return Request detail, cho phép:
  - Xem chi tiết items được trả
  - Kiểm tra stock khi hoàn trả
  - Cập nhật số lượng items được trả

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/returns/:id/items` (chi tiết return items)
   - [ ] API `PATCH /api/admin/returns/:id/items/:itemId` (cập nhật số lượng)
   - [ ] Logic tự động restock khi return được approved

2. Frontend:
   - [ ] UI trong Return Request detail:
   - [ ] Bảng list return items
   - [ ] Hiển thị stock status
   - [ ] Chỉnh sửa số lượng (nếu cần)

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 4-6 giờ

---

#### Task M11: Trang quản lý Hoàn tiền (Refunds) ✅ ĐÃ CÓ (D15)

**Trạng thái:** ✅ Đã hoàn thành trong Task D15
- Partial refund đã implement
- Refund history hiển thị trong modal

**Không cần làm thêm**

---

### NHÓM 5: Quản lý Khách hàng và Tương tác

#### Task M12: Trang quản lý Địa chỉ (Addresses) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ User có thể quản lý addresses trong account
- ❌ Admin chưa có trang để xem/quản lý addresses của users

**Yêu cầu:**
- Trang `/admin/addresses` hoặc trong User Detail
- List địa chỉ của user
- Xem chi tiết địa chỉ
- Chỉnh sửa/xóa địa chỉ (nếu cần)

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/users/:userId/addresses` (list addresses)
   - [ ] API `PATCH /api/admin/addresses/:id` (cập nhật)
   - [ ] API `DELETE /api/admin/addresses/:id` (xóa)

2. Frontend:
   - [ ] Section trong `AdminUserDetail.tsx`:
   - [ ] List addresses của user
   - [ ] Modal chỉnh sửa địa chỉ
   - [ ] Nút xóa địa chỉ

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 4-6 giờ

---

#### Task M13: Trang quản lý Đánh giá (Reviews) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ API `ReviewController` có sẵn (public)
- ❌ Chưa có trang admin quản lý reviews

**Yêu cầu:**
- Trang `/admin/reviews`
- List tất cả reviews với filter
- Phê duyệt/xóa review
- Trả lời bình luận
- Filter theo sản phẩm, rating, status

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/reviews` (list với filter)
   - [ ] API `PATCH /api/admin/reviews/:id/approve` (phê duyệt)
   - [ ] API `PATCH /api/admin/reviews/:id/reject` (từ chối)
   - [ ] API `DELETE /api/admin/reviews/:id` (xóa)
   - [ ] API `POST /api/admin/reviews/:id/reply` (trả lời)

2. Frontend:
   - [ ] Trang `AdminReviews.tsx`
   - [ ] Bảng list reviews: Product, Customer, Rating, Comment, Status, Date
   - [ ] Filter: Product, Rating, Status (Pending/Approved/Rejected)
   - [ ] Modal chi tiết review
   - [ ] Nút phê duyệt/từ chối/xóa
   - [ ] Form trả lời bình luận

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 8-10 giờ

---

#### Task M14: Trang quản lý Danh sách Yêu thích (Wishlists) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ User có thể thêm vào wishlist
- ❌ Admin chưa có trang để xem wishlists

**Yêu cầu:**
- Trang `/admin/wishlists` hoặc trong User Detail
- Xem wishlist của từng user
- Phân tích: sản phẩm được yêu thích nhất

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/wishlists` (list với filter user)
   - [ ] API `GET /api/admin/wishlists/stats` (thống kê sản phẩm được yêu thích)

2. Frontend:
   - [ ] Trang `AdminWishlists.tsx` hoặc section trong User Detail
   - [ ] List wishlist items của user
   - [ ] Thống kê: Top sản phẩm được yêu thích

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 4-6 giờ

---

#### Task M15: Trang quản lý Lịch sử Điểm Thân thiết (Loyalty Point History) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Loyalty points được tích tự động khi thanh toán (theo memory)
- ❌ Admin chưa có trang để xem/quản lý points

**Yêu cầu:**
- Trang `/admin/loyalty-points` hoặc trong User Detail
- Xem lịch sử tích điểm của user
- Cộng/trừ điểm thủ công
- Thống kê tổng điểm theo tier

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/users/:userId/loyalty-points` (lịch sử points)
   - [ ] API `POST /api/admin/users/:userId/loyalty-points` (cộng/trừ điểm thủ công)
   - [ ] API `GET /api/admin/loyalty-points/stats` (thống kê)

2. Frontend:
   - [ ] Trang `AdminLoyaltyPoints.tsx` hoặc section trong User Detail
   - [ ] Bảng lịch sử: Date, Type, Points, Balance, Note
   - [ ] Modal cộng/trừ điểm thủ công
   - [ ] Thống kê: Tổng điểm, Tier distribution

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 6-8 giờ

---

#### Task M16: Trang quản lý Voucher (Vouchers) ✅ HOÀN THÀNH

**Trạng thái:** ✅ Đã hoàn thành
- ✅ Trang `/admin/vouchers` với đầy đủ chức năng CRUD
- ✅ Hỗ trợ 3 loại voucher: PERCENT, FIXED_AMOUNT, FREESHIP
- ✅ Quản lý thời hạn (startsAt, expiresAt) với xử lý timezone đúng
- ✅ Theo dõi số lần sử dụng (usedCount, usageLimit)
- ✅ Search, filter theo trạng thái
- ✅ Hiển thị trạng thái thông minh (Đang hoạt động, Hết hạn, Chưa bắt đầu, Đã hết lượt, Vô hiệu hóa)
- ✅ Fix bug: usedCount chỉ tăng sau khi order được tạo thành công

**Test Guide:** `TEST_GUIDE_M16_M7.md`

---

### NHÓM 6: Quản lý Giỏ hàng và Bỏ giỏ

#### Task M17: Trang quản lý Giỏ hàng (Carts) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ User có thể quản lý cart
- ❌ Admin chưa có trang để xem carts
- ❌ Chưa có chức năng theo dõi abandoned carts

**Yêu cầu:**
- Trang `/admin/carts`
- List carts đang hoạt động
- List abandoned carts (carts cũ chưa checkout)
- Gửi email nhắc nhở cho abandoned carts

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/carts` (list với filter: active/abandoned)
   - [ ] API `GET /api/admin/carts/abandoned` (list abandoned carts)
   - [ ] API `POST /api/admin/carts/:id/send-reminder` (gửi email nhắc nhở)

2. Frontend:
   - [ ] Trang `AdminCarts.tsx`
   - [ ] Tab: Active Carts, Abandoned Carts
   - [ ] Bảng list carts: Customer, Items, Total, Last Updated
   - [ ] Nút "Gửi nhắc nhở" cho abandoned carts
   - [ ] Filter: Date range, Customer

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 8-10 giờ

---

#### Task M18: Trang quản lý Chi tiết Giỏ hàng (Cart Items) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Cart items hiển thị trong cart của user
- ❌ Admin chưa có trang để xem cart items

**Yêu cầu:**
- Trong Cart detail, hiển thị:
  - Chi tiết items trong cart
  - Phân tích lý do bỏ giỏ (nếu có)

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/carts/:id/items` (chi tiết cart items)
   - [ ] API `GET /api/admin/carts/:id/analysis` (phân tích abandoned cart)

2. Frontend:
   - [ ] Modal Cart Detail:
   - [ ] List cart items
   - [ ] Hiển thị phân tích (nếu abandoned)

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 4-6 giờ

---

### NHÓM 7: Quản lý Bảo mật và Xác thực

#### Task M19: Trang quản lý Token Xác thực Email (Email Verification Tokens) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Tokens được tạo tự động khi đăng ký
- ❌ Admin chưa có trang để xem tokens

**Yêu cầu:**
- Trang `/admin/email-verification-tokens` hoặc trong User Detail
- Xem tokens của user
- Resend verification email
- Xử lý token hết hạn

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/users/:userId/verification-tokens` (list tokens)
   - [ ] API `POST /api/admin/users/:userId/resend-verification` (gửi lại email)

2. Frontend:
   - [ ] Section trong User Detail:
   - [ ] List verification tokens
   - [ ] Nút "Gửi lại email xác thực"

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 3-4 giờ

---

#### Task M20: Trang quản lý Token Đặt lại Mật khẩu (Password Reset Tokens) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Tokens được tạo tự động khi reset password
- ❌ Admin chưa có trang để xem tokens

**Yêu cầu:**
- Trang `/admin/password-reset-tokens` hoặc trong User Detail
- Xem tokens của user
- Invalidate token (nếu cần)

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/users/:userId/password-reset-tokens` (list tokens)
   - [ ] API `DELETE /api/admin/password-reset-tokens/:id` (invalidate token)

2. Frontend:
   - [ ] Section trong User Detail:
   - [ ] List password reset tokens
   - [ ] Nút "Vô hiệu hóa token"

**Ưu tiên:** Thấp  
**Thời gian ước tính:** 3-4 giờ

---

#### Task M21: Trang quản lý Hoạt động Đăng nhập (Login Activity) ⏳ CHƯA CÓ

**Trạng thái hiện tại:**
- ✅ Có `LoginActivityRepository` và entity
- ❌ Chưa có trang admin để xem login activity

**Yêu cầu:**
- Trang `/admin/login-activities` hoặc trong User Detail
- List lịch sử đăng nhập
- Phát hiện hoạt động đáng ngờ (IP lạ, nhiều lần thất bại)

**Cần làm:**
1. Backend:
   - [ ] API `GET /api/admin/login-activities` (list với filter)
   - [ ] API `GET /api/admin/users/:userId/login-activities` (lịch sử của user)
   - [ ] API `GET /api/admin/login-activities/suspicious` (phát hiện hoạt động đáng ngờ)

2. Frontend:
   - [ ] Trang `AdminLoginActivities.tsx` hoặc section trong User Detail
   - [ ] Bảng list: User, IP, Location, Device, Status, Date
   - [ ] Filter: User, IP, Date range, Status
   - [ ] Highlight các hoạt động đáng ngờ

**Ưu tiên:** Trung bình  
**Thời gian ước tính:** 6-8 giờ

---

### NHÓM 8: Quản lý Cấu hình và Tích hợp

#### Task M22: Trang quản lý Cấu hình Phí Vận chuyển ✅ ĐÃ CÓ

**Trạng thái:** ✅ Đã hoàn thành
- Trang `/admin/shipping-fee-configs`
- Quản lý phí vận chuyển theo method

**Không cần làm thêm**

---

## 📊 Tổng kết

### Đã có (Không cần làm)
- ✅ Order History (D7)
- ✅ Partial Refund (D15)
- ✅ Shipping Fee Configs
- ✅ **M4: Quản lý Danh mục (Categories)** ✅ HOÀN THÀNH
- ✅ **M16: Quản lý Voucher (Vouchers)** ✅ HOÀN THÀNH
- ✅ **M7: Quản lý Thanh toán (Payments)** ✅ HOÀN THÀNH

### Cần làm (Ưu tiên trung bình)
4. **M1: Quản lý Biến thể Sản phẩm** - 6-8 giờ
5. **M2: Quản lý Hình ảnh Sản phẩm** - 8-10 giờ
6. **M5: Quản lý Sản phẩm trong Bộ sưu tập** - 8-10 giờ
7. **M6: Quản lý Chi tiết Đơn hàng** - 8-10 giờ
8. **M9: Trang quản lý Return Requests** - 6-8 giờ
9. **M13: Quản lý Đánh giá (Reviews)** - 8-10 giờ
10. **M15: Quản lý Loyalty Points** - 6-8 giờ
11. **M21: Quản lý Login Activity** - 6-8 giờ

### Cần làm (Ưu tiên thấp)
12. **M3: Quản lý Thuộc tính Sản phẩm** - 10-12 giờ
13. **M10: Quản lý Chi tiết Trả hàng** - 4-6 giờ
14. **M12: Quản lý Địa chỉ** - 4-6 giờ
15. **M14: Quản lý Wishlist** - 4-6 giờ
16. **M17: Quản lý Giỏ hàng** - 8-10 giờ
17. **M18: Quản lý Chi tiết Giỏ hàng** - 4-6 giờ
18. **M19: Quản lý Email Verification Tokens** - 3-4 giờ
19. **M20: Quản lý Password Reset Tokens** - 3-4 giờ

---

## 🎯 Kế hoạch thực hiện

**Gợi ý thứ tự ưu tiên:**

**Phase 1 (Ưu tiên cao) ✅ HOÀN THÀNH:**
1. ✅ M4: Quản lý Danh mục
2. ✅ M16: Quản lý Voucher
3. ✅ M7: Quản lý Thanh toán

**Phase 2 (Ưu tiên trung bình - 58-72 giờ):**
4. M1: Quản lý Biến thể Sản phẩm
5. M2: Quản lý Hình ảnh Sản phẩm
6. M5: Quản lý Sản phẩm trong Bộ sưu tập
7. M6: Quản lý Chi tiết Đơn hàng
8. M9: Trang quản lý Return Requests
9. M13: Quản lý Đánh giá
10. M15: Quản lý Loyalty Points
11. M21: Quản lý Login Activity

**Phase 3 (Ưu tiên thấp - 37-50 giờ):**
- Các task còn lại

---

**Tổng thời gian ước tính còn lại:** 95-122 giờ (đã hoàn thành 20-26 giờ)

