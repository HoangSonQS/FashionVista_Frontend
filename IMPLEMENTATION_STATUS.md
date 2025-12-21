# Trạng thái Implementation các Task

**Ngày cập nhật:** 2025-01-27

---

## NHÓM 4: Quản lý sản phẩm nâng cao

### Task D1: Product Visibility Management ✅ HOÀN THÀNH

**Backend:** ✅
- Migration: `add_product_visibility.sql`
- Entity/DTO/Service/Controller: `Product.java`, `ProductListItemDto.java`, `ProductService.java`, `ProductServiceImpl.java`, `AdminProductController.java`
- Validation: không cho bật hiển thị nếu thiếu ảnh/giá/tồn kho
- Endpoints: `PATCH /api/admin/products/:id/visibility`, `PATCH /api/admin/products/visibility/bulk`, filter `visible` trong `GET /api/admin/products`

**Frontend:** ✅
- Trang `AdminProductVisibility.tsx`: search, filter Visible/Hidden & Status, pagination
- Toggle visibility từng sản phẩm, bulk bật/ẩn
- Hiển thị Thumbnail, SKU, Variants Count, Status, Visible badge, Visible Updated At
- Toast thông báo thành công/thất bại
- Routes: `/admin/product-visibility` (AppRoutes)
- Service/Types: `adminProductService.ts`, `types/product.ts` (isVisible, variantsCount, visibleUpdatedAt)

**Files đã tạo/sửa:**
- `FashionVista_Backend/src/main/resources/db/migration/add_product_visibility.sql` ✅
- `FashionVista_Backend/src/main/java/com/fashionvista/backend/entity/Product.java` ✅
- `FashionVista_Backend/src/main/java/com/fashionvista/backend/dto/ProductListItemDto.java` ✅
- `FashionVista_Backend/src/main/java/com/fashionvista/backend/service/ProductService.java` ✅
- `FashionVista_Backend/src/main/java/com/fashionvista/backend/service/impl/ProductServiceImpl.java` ✅
- `FashionVista_Backend/src/main/java/com/fashionvista/backend/controller/AdminProductController.java` ✅

---

### Task D2: Import/Export sản phẩm ✅ HOÀN THÀNH (CSV)

**Backend:** ✅
- CSV template + export: `GET /api/admin/products/export-template`, `GET /api/admin/products/export` (filter search/status/featured/visible)
- Import CSV: `POST /api/admin/products/import` (create/update theo SKU, upsert variants)
- Validation cơ bản, ghi lỗi per-row

**Frontend:** ✅
- Nút Tải template / Export / Import trên `AdminProductList.tsx`
- Hiển thị kết quả import (created/updated/errors)
- Service methods: `downloadTemplate`, `exportProducts`, `importProducts`

---

## NHÓM 5: Vận chuyển & Logistics

### Task D3: Tích hợp đơn vị vận chuyển ✅ (Mock API)

**Backend:** ✅
- API mock GHN/GHTK/J&T:
  - `POST /api/admin/shipping/{orderNumber}/create` (tạo trackingNumber giả)
  - `POST /api/admin/shipping/{orderNumber}/cancel`
  - `POST /api/admin/shipping/webhook` (PickedUp/InTransit/Delivered/Return → update status)
- Fee mock: `GET /api/shipping/fee` (30.000 VND)
- Mapping trạng thái: PickedUp/InTransit → SHIPPING, Delivered → DELIVERED, Return → RETURNED

**Frontend:** ⏳ (chưa có UI tạo/hủy vận đơn; dùng API trực tiếp)

---

### Task D4: In ấn & xuất dữ liệu ✅ (HTML/CSV cơ bản)

**Backend:** ✅
- `GET /api/admin/orders/{orderNumber}/invoice` (HTML)
- `GET /api/admin/orders/{orderNumber}/delivery-note` (HTML)
- `GET /api/admin/orders/{orderNumber}/packing-slip` (HTML)
- `GET /api/admin/orders/export` (CSV danh sách đơn, filter status)

**Frontend:** ✅ (export CSV đơn hàng)
- AdminOrders: nút “Xuất CSV đơn hàng”
- Chưa có UI tải invoice/delivery/packing; có thể gọi API trực tiếp

---

## NHÓM 5 (tiếp): Order Management nâng cao

### Task D6: Bulk actions cho orders ✅ HOÀN THÀNH

**Backend:** ✅
- DTO: `BulkUpdateOrderStatusRequest` (orderIds, status, paymentStatus, notes)
- Service: `AdminOrderService.bulkUpdateStatus()` → cập nhật status/paymentStatus hàng loạt, ghi log vào notes
- Endpoint: `PATCH /api/admin/orders/bulk-status`
- Ghi history tự động cho mỗi đơn (status, paymentStatus)

**Frontend:** ✅
- `AdminOrders.tsx`: checkbox chọn từng đơn, "Chọn tất cả"
- Bulk actions bar: hiển thị khi có đơn được chọn
- Nút "Chuyển sang Đã xác nhận", "Đang giao", "Đã giao"
- Toast thông báo kết quả, refresh danh sách sau khi cập nhật
- Service: `adminOrderService.bulkUpdateStatus()`

---

### Task D7: Order History Timeline chi tiết ✅ HOÀN THÀNH

**Backend:** ✅
- Entity: `OrderHistory` (order, field, oldValue, newValue, actor, note, createdAt)
- Repository: `OrderHistoryRepository.findByOrderIdOrderByCreatedAtAsc()`
- DTO: `OrderHistoryItemResponse`
- Tự động ghi history trong `updateOrderStatus()`, `updateTrackingNumber()`, `bulkUpdateStatus()`
- `OrderResponse.history`: danh sách history items

**Frontend:** ✅
- `AdminOrders.tsx`: hiển thị timeline history trong modal chi tiết đơn
- Format: field name (status/paymentStatus/trackingNumber), oldValue → newValue, actor, note, createdAt
- Scrollable với max-height

---

### Task D8: Bổ sung thông tin Order Detail ✅ HOÀN THÀNH

**Backend:** ✅
- `OrderResponse` mở rộng:
  - `customerEmail`, `customerPhone`, `customerGroup` (từ User)
  - `billingAddress` (từ Order)
  - `transactionId` (từ Payment)
  - `voucherDiscount` (= order.discount)
- Mapping trong `AdminOrderServiceImpl.toOrderResponse()`

**Frontend:** ✅
- `AdminOrders.tsx`: hiển thị section "Thông tin khách hàng"
  - Email, Số điện thoại, Nhóm khách (badge), Mã giao dịch
  - Địa chỉ thanh toán (nếu có)
  - Giảm giá voucher (nếu > 0)

---

### Task D9: Payment Success/Failed pages riêng ✅ HOÀN THÀNH

**Backend:** ✅
- `VnPayController`: redirect đến `/checkout/success` hoặc `/checkout/failed` (thay vì `/payment/result?status=...`)

**Frontend:** ✅
- `PaymentSuccessPage.tsx`: UI thành công với icon checkmark, nút "Xem chi tiết đơn", "Xem danh sách đơn", "Về trang chủ", "Liên hệ"
- `PaymentFailedPage.tsx`: UI thất bại với icon X, nút "Thanh toán lại", "Xem chi tiết đơn", "Xem danh sách đơn", "Về trang chủ", "Liên hệ"
- Routes: `/checkout/success`, `/checkout/failed`
- `PaymentResult.tsx`: redirect đến các trang mới (backward compatibility)

---

## NHÓM 6: Thanh toán nâng cao (Tạm bỏ qua task này)

### Task D5: Tích hợp Momo payment ⏳ CANCELLED

**Status:** Tạm bỏ qua theo yêu cầu

---

### Task D15: Partial refund ✅ HOÀN THÀNH

**Backend:** ✅
- Entity: `Refund` (order, amount, refundMethod, reason, refundedItemIds, refundedBy, createdAt)
- Migration: `V7__create_refunds_and_add_refund_amount.sql` (tạo bảng refunds, thêm refund_amount vào payments)
- Repository: `RefundRepository.findByOrderIdOrderByCreatedAtDesc()`
- DTOs: `PartialRefundRequest`, `RefundResponse`
- Service: `AdminOrderService.createPartialRefund()`, `getRefundsByOrderId()`
- Endpoints: `POST /api/admin/orders/:id/refund`, `GET /api/admin/orders/:id/refunds`
- Validation: chỉ cho refund khi paymentStatus = PAID, không cho vượt quá payment amount
- Logic: cập nhật payment.refundAmount, paymentStatus (REFUND_PENDING/REFUNDED), order.status (REFUNDED nếu hoàn hết)
- Ghi Order History tự động

**Frontend:** ✅
- `AdminOrders.tsx`: nút "Hoàn tiền" trong modal update (chỉ hiện khi paymentStatus = PAID)
- Modal hoàn tiền:
  - Chọn items để hoàn (tùy chọn, checkbox)
  - Nhập số tiền hoàn
  - Chọn phương thức (ORIGINAL / MANUAL_CASH)
  - Nhập lý do hoàn tiền
  - Hiển thị lịch sử refund
- Service: `adminOrderService.createPartialRefund()`, `getRefundsByOrderId()`
- Types: `RefundResponse` trong `order.ts`
- Validation: số tiền > 0, không vượt quá order.total

**Test Guide:** `TEST_GUIDE_D15_PARTIAL_REFUND.md`

---

## NHÓM 7: Quản lý Admin - Categories, Vouchers, Payments

### Task M4: Category Management ✅ HOÀN THÀNH

**Backend:** ✅
- Migration: `V9__alter_categories_image_to_text.sql`, `V10__add_cloudinary_public_id_to_categories.sql`
- Entity: `Category.java` (image TEXT, cloudinaryPublicId)
- Service/Controller: `AdminCategoryService`, `AdminCategoryController`
- Cloudinary integration: upload và xóa ảnh tự động
- Endpoints: `GET/POST/PATCH/DELETE /api/admin/categories`

**Frontend:** ✅
- Trang `AdminCategories.tsx`: CRUD đầy đủ
- Upload ảnh từ máy tính hoặc URL
- Search với debounce, filter, pagination
- Optimistic update cho edit
- Hiển thị ảnh category trên home và public category pages

**Test Guide:** `TEST_GUIDE_M4_CATEGORIES.md`

---

### Task M16: Voucher Management ✅ HOÀN THÀNH

**Backend:** ✅
- Service/Controller: `AdminVoucherService`, `AdminVoucherController`
- Hỗ trợ PERCENT, FIXED_AMOUNT, FREESHIP
- Fix bug: `usedCount` chỉ tăng sau khi order được tạo thành công
- Endpoints: `GET/POST/PATCH/DELETE /api/admin/vouchers`

**Frontend:** ✅
- Trang `AdminVouchers.tsx`: CRUD đầy đủ
- Form tạo/sửa voucher với validation
- Fix timezone handling cho datetime-local inputs
- Hiển thị trạng thái thông minh (active, expired, usage exceeded, etc.)
- Search, filter, pagination

**Test Guide:** `TEST_GUIDE_M16_M7.md`

---

### Task M7: Payment Management ✅ HOÀN THÀNH

**Backend:** ✅
- Service/Controller: `AdminPaymentService`, `AdminPaymentController`
- Sort mặc định theo createdAt DESC
- Update payment status với validation (COD phải DELIVERED mới được PAID)
- Sync COD payments khi order chuyển sang DELIVERED
- Endpoint sync: `POST /api/admin/payments/sync-cod-delivered`
- Endpoints: `GET /api/admin/payments`, `PATCH /api/admin/payments/:id/status`

**Frontend:** ✅
- Trang `AdminPayments.tsx`: list, search, filter
- Modal chi tiết payment với cập nhật trạng thái
- Nút "Đồng bộ COD đã giao"
- Hiển thị số tiền đã hoàn (refundAmount)

**Test Guide:** `TEST_GUIDE_M16_M7.md`

---

## Tổng kết

- **Task đã hoàn thành:** D1, D2, D3, D4, D6, D7, D8, D9, D15, **M4, M16, M7** (12 tasks)
- **Task đang làm:** 0
- **Task chưa bắt đầu:** D10, D11, D12, D13, D14, D16, M1, M2, M3, M5, M6, M9, M10, M12, M13, M14, M15, M17, M18, M19, M20, M21

**Ưu tiên tiếp theo:**
1. **M1: Quản lý Biến thể Sản phẩm** (6-8 giờ)
2. **M2: Quản lý Hình ảnh Sản phẩm** (8-10 giờ)
3. **M5: Quản lý Sản phẩm trong Bộ sưu tập** (8-10 giờ)
4. **M6: Quản lý Chi tiết Đơn hàng** (8-10 giờ)
5. **M9: Trang quản lý Return Requests** (6-8 giờ)

