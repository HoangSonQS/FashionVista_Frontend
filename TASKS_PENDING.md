# Danh sách các Task Cần Hoàn Thành

**Ngày tạo:** 2025-01-27  
**Trạng thái:** Đang lên kế hoạch

---

## NHÓM 4: Quản lý sản phẩm nâng cao

### Task D1: Product Visibility Management ⏳ IN PROGRESS
**Mức độ:** Trung bình  
**Thời gian ước tính:** 4-6 giờ

**Yêu cầu:**
- Tạo màn `/admin/product-visibility` riêng
- Toggle visibility, bulk actions, filter/search
- Validation: không cho bật Visible nếu thiếu ảnh/giá/tồn kho

**Cần làm:**
1. Backend:
   - [ ] Tạo migration thêm field `is_visible` và `visible_updated_at` vào bảng `products`
   - [ ] Update Product entity với field `isVisible` và `visibleUpdatedAt`
   - [ ] Tạo API endpoint `PATCH /api/admin/products/:id/visibility`
   - [ ] Tạo API endpoint `PATCH /api/admin/products/visibility/bulk`
   - [ ] Update `getAdminProducts` để support filter `visible`
   - [ ] Validation logic: không cho bật visible nếu thiếu ảnh/giá/tồn kho

2. Frontend:
   - [ ] Tạo page `AdminProductVisibility.tsx`
   - [ ] Bảng danh sách với: Thumbnail, Name, SKU, Variants Count, Status, Visibility toggle
   - [ ] Search theo tên và SKU
   - [ ] Filter theo Visible/Hidden và Active/Inactive
   - [ ] Sort theo Name và Last Updated
   - [ ] Toggle visibility trực tiếp trên bảng
   - [ ] Bulk actions: chọn nhiều, toggle visibility hàng loạt
   - [ ] Phân trang
   - [ ] Validation UI: disable toggle nếu không đủ điều kiện

---

### Task D2: Import/Export sản phẩm ⏳ PENDING
**Mức độ:** Phức tạp  
**Thời gian ước tính:** 8-12 giờ

**Yêu cầu:**
- Template Excel cho sản phẩm + variants + stock
- Import hỗ trợ update (match theo SKU) và tạo mới
- Export với filter, ghi log kết quả

**Cần làm:**
1. Backend:
   - [ ] Tạo service `ProductImportExportService`
   - [ ] API `GET /api/admin/products/export-template` - Download template Excel
   - [ ] API `POST /api/admin/products/import` - Upload và import Excel
   - [ ] API `GET /api/admin/products/export` - Export với filter
   - [ ] Logic parse Excel: sản phẩm, variants, stock
   - [ ] Logic match theo SKU để update hoặc tạo mới
   - [ ] Validation dữ liệu import
   - [ ] Ghi log kết quả import/export

2. Frontend:
   - [ ] Nút "Tải template Excel" trên AdminProductList
   - [ ] Nút "Import sản phẩm" với upload file
   - [ ] Hiển thị progress và kết quả import
   - [ ] Nút "Export" với filter hiện tại
   - [ ] Download file Excel

---

## NHÓM 5: Vận chuyển & Logistics

### Task D3: Tích hợp đơn vị vận chuyển ⏳ PENDING
**Mức độ:** Rất phức tạp  
**Thời gian ước tính:** 16-24 giờ

**Yêu cầu:**
- API tạo vận đơn GHN/GHTK/J&T
- Webhook trạng thái (Picked up, In transit, Delivered, Return)
- Hủy/tạo lại vận đơn, lưu file PDF

**Cần làm:**
1. Backend:
   - [ ] Tạo service `ShippingService` (mở rộng từ service hiện có)
   - [ ] Tích hợp API GHN: tạo vận đơn, hủy vận đơn, lấy tracking
   - [ ] Tích hợp API GHTK: tạo vận đơn, hủy vận đơn, lấy tracking
   - [ ] Tích hợp API J&T: tạo vận đơn, hủy vận đơn, lấy tracking
   - [ ] Webhook endpoints cho từng hãng
   - [ ] Auto update order status từ webhook
   - [ ] Lưu file PDF vận đơn
   - [ ] API hủy/tạo lại vận đơn

2. Frontend:
   - [ ] UI chọn hãng vận chuyển trên Admin Orders
   - [ ] Nút "Tạo vận đơn" với form nhập thông tin
   - [ ] Hiển thị tracking number và link tracking
   - [ ] Nút "Hủy vận đơn" và "Tạo lại vận đơn"
   - [ ] Download PDF vận đơn

---

### Task D4: In ấn & xuất dữ liệu ⏳ PENDING
**Mức độ:** Phức tạp  
**Thời gian ước tính:** 10-14 giờ

**Yêu cầu:**
- In hóa đơn VAT, phiếu giao hàng, packing slip
- Xuất Excel/CSV theo filter
- Sinh vận đơn giấy theo template từng hãng

**Cần làm:**
1. Backend:
   - [ ] Tạo service `PrintService`
   - [ ] API `GET /api/admin/orders/:id/invoice` - Generate PDF hóa đơn VAT
   - [ ] API `GET /api/admin/orders/:id/delivery-note` - Generate PDF phiếu giao hàng
   - [ ] API `GET /api/admin/orders/:id/packing-slip` - Generate PDF packing slip
   - [ ] API `GET /api/admin/orders/export` - Export Excel/CSV với filter
   - [ ] Template PDF cho từng loại document
   - [ ] Template vận đơn theo từng hãng (GHN/GHTK/J&T)

2. Frontend:
   - [ ] Nút "In hóa đơn" trên Order Detail
   - [ ] Nút "In phiếu giao hàng"
   - [ ] Nút "In packing slip"
   - [ ] Nút "Xuất Excel" trên Order List với filter
   - [ ] Preview PDF trước khi in

---

## NHÓM 6: Thanh toán nâng cao

### Task D5: Tích hợp Momo payment ⏳ PENDING
**Mức độ:** Phức tạp  
**Thời gian ước tính:** 8-12 giờ

**Yêu cầu:**
- API Momo, redirect payment
- Webhook callback, cập nhật trạng thái đơn

**Cần làm:**
1. Backend:
   - [ ] Tạo service `MomoService` (tương tự VnPayService)
   - [ ] API `POST /api/payments/momo/create` - Tạo payment URL
   - [ ] API `GET /api/payments/momo/return` - Return URL handler
   - [ ] API `POST /api/payments/momo/ipn` - IPN webhook handler
   - [ ] Tích hợp Momo API: tạo payment, verify signature
   - [ ] Cập nhật trạng thái đơn và payment sau khi thanh toán
   - [ ] Tích điểm loyalty khi thanh toán thành công

2. Frontend:
   - [ ] Thêm option "MoMo" vào CheckoutPage payment methods
   - [ ] Redirect đến Momo payment page
   - [ ] Xử lý return từ Momo

---

### Task D15: Partial refund ⏳ PENDING
**Mức độ:** Phức tạp  
**Thời gian ước tính:** 10-14 giờ

**Yêu cầu:**
- Chọn item/số tiền hoàn, ghi chú lý do
- Cập nhật Payment record
- Xử lý refund một phần

**Cần làm:**
1. Backend:
   - [ ] Tạo entity `Refund` hoặc thêm field vào `Payment`
   - [ ] API `POST /api/admin/orders/:id/refund` - Tạo refund
   - [ ] Logic tính toán refund: chọn items, số tiền
   - [ ] Cập nhật Payment record với refund amount
   - [ ] Cập nhật Order total sau refund
   - [ ] Ghi log refund

2. Frontend:
   - [ ] Modal "Hoàn tiền" trên Admin Order Detail
   - [ ] Chọn items cần hoàn
   - [ ] Nhập số tiền hoàn, lý do
   - [ ] Hiển thị lịch sử refund

---

## Tổng kết

- **Tổng số task:** 6 task
- **Tổng thời gian ước tính:** 56-82 giờ
- **Mức độ:** Từ Trung bình đến Rất phức tạp

**Ưu tiên:**
1. **Cao:** Task D1 (Product Visibility) - Cần thiết cho quản lý sản phẩm
2. **Trung bình:** Task D5 (Momo payment) - Mở rộng phương thức thanh toán
3. **Thấp:** Task D2, D3, D4, D15 - Tính năng nâng cao

