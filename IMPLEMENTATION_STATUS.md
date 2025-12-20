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

## Tổng kết

- **Task đã hoàn thành:** D1, D2, D3, D4, D6, D7, D8, D9, D15 (9 tasks)
- **Task đang làm:** 0
- **Task chưa bắt đầu:** D10, D11, D12, D13, D14, D16

**Ưu tiên tiếp theo:**
1. Task D10: Thông báo khi đơn đổi trạng thái
2. Task D11: Newsletter subscription
3. Task D12: Các trang tĩnh

