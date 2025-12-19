# Hướng dẫn Test các Task D6, D7, D8, D9

**Ngày tạo:** 2025-01-27

---

## Tổng quan

Các task này tập trung vào:
- **D6**: Bulk actions cho orders (cập nhật trạng thái hàng loạt)
- **D7**: Order History Timeline (lịch sử thay đổi đơn hàng)
- **D8**: Bổ sung thông tin Order Detail (thông tin khách hàng, billing, transaction)
- **D9**: Payment Success/Failed pages riêng

---

## D6: Bulk Actions cho Orders

### Mục đích
Cho phép admin cập nhật trạng thái nhiều đơn hàng cùng lúc.

### Test Cases

#### Test Case 1: Chọn đơn hàng và hiển thị bulk actions bar
**Bước:**
1. Đăng nhập admin → `/admin/orders`
2. Chọn checkbox của 1 đơn hàng
3. Kiểm tra bulk actions bar xuất hiện ở trên bảng
4. Kiểm tra hiển thị số lượng đơn đã chọn (ví dụ: "Đã chọn 1 đơn hàng")

**Kết quả mong đợi:**
- Bulk actions bar hiển thị với các nút: "Chuyển sang Đã xác nhận", "Chuyển sang Đang giao", "Chuyển sang Đã giao"
- Có nút "Bỏ chọn tất cả"

DONE

#### Test Case 2: Chọn tất cả đơn hàng
**Bước:**
1. Click checkbox "Chọn tất cả" ở header bảng
2. Kiểm tra tất cả đơn hàng trong trang hiện tại được chọn
3. Kiểm tra số lượng đơn đã chọn = số đơn trong trang

**Kết quả mong đợi:**
- Tất cả checkbox được đánh dấu
- Bulk actions bar hiển thị số lượng đúng

DONE

#### Test Case 3: Bulk update status sang "Đã xác nhận"
**Bước:**
1. Chọn 2-3 đơn hàng có status = PENDING
2. Click "Chuyển sang Đã xác nhận"
3. Xác nhận action (nếu có confirm dialog)
4. Kiểm tra toast thông báo thành công
5. Refresh danh sách và kiểm tra status của các đơn đã chọn

**Kết quả mong đợi:**
- Toast hiển thị: "Đã cập nhật trạng thái X đơn hàng thành công"
- Các đơn hàng đã chọn có status = CONFIRMED
- Bulk actions bar biến mất sau khi cập nhật
- Danh sách tự động refresh

DONE

#### Test Case 4: Bulk update status sang "Đang giao"
**Bước:**
1. Chọn 2-3 đơn hàng có status = CONFIRMED hoặc PROCESSING
2. Click "Chuyển sang Đang giao"
3. Kiểm tra toast và refresh danh sách

**Kết quả mong đợi:**
- Status của các đơn = SHIPPING
- Toast thành công

DONE

#### Test Case 5: Bulk update status sang "Đã giao"
**Bước:**
1. Chọn 2-3 đơn hàng có status = SHIPPING
2. Click "Chuyển sang Đã giao"
3. Kiểm tra toast và refresh danh sách

**Kết quả mong đợi:**
- Status của các đơn = DELIVERED
- Toast thành công

DONE

#### Test Case 6: Bỏ chọn đơn hàng
**Bước:**
1. Chọn 3 đơn hàng
2. Bỏ chọn 1 đơn bằng cách click lại checkbox
3. Kiểm tra số lượng đơn đã chọn giảm xuống 2

**Kết quả mong đợi:**
- Số lượng đơn đã chọn cập nhật đúng
- Nếu không còn đơn nào được chọn, bulk actions bar biến mất

DONE

#### Test Case 7: Xử lý lỗi khi bulk update
**Bước:**
1. Chọn 1 đơn hàng không hợp lệ (ví dụ: đã bị xóa)
2. Click "Chuyển sang Đã xác nhận"
3. Kiểm tra toast lỗi

**Kết quả mong đợi:**
- Toast hiển thị lỗi: "Không thể cập nhật trạng thái đơn hàng"
- Danh sách không thay đổi


DONE

---

## D7: Order History Timeline

### Mục đích
Hiển thị lịch sử thay đổi của đơn hàng (status, paymentStatus, trackingNumber).

### Test Cases

#### Test Case 1: Hiển thị history khi mở modal chi tiết đơn
**Bước:**
1. Admin → `/admin/orders`
2. Click vào một đơn hàng để mở modal chi tiết
3. Scroll xuống phần "Lịch sử thay đổi"

**Kết quả mong đợi:**
- Section "Lịch sử thay đổi" hiển thị
- Danh sách history items được sắp xếp theo thời gian (cũ → mới)
- Mỗi item hiển thị: field name, oldValue → newValue, actor, note (nếu có), createdAt


DONE

#### Test Case 2: History khi cập nhật status
**Bước:**
1. Mở modal chi tiết đơn có status = PENDING
2. Cập nhật status sang CONFIRMED
3. Đóng và mở lại modal
4. Kiểm tra history

**Kết quả mong đợi:**
- Có 1 history item mới với:
  - field = "status"
  - oldValue = "PENDING"
  - newValue = "CONFIRMED"
  - actor = email của admin hiện tại
  - createdAt = thời gian vừa cập nhật

  
DONE

#### Test Case 3: History khi cập nhật paymentStatus
**Bước:**
1. Mở modal chi tiết đơn có paymentStatus = PENDING
2. Cập nhật paymentStatus sang PAID
3. Đóng và mở lại modal
4. Kiểm tra history

**Kết quả mong đợi:**
- Có 1 history item mới với:
  - field = "paymentStatus"
  - oldValue = "PENDING"
  - newValue = "PAID"
  - actor = email admin

  
DONE

#### Test Case 4: History khi cập nhật trackingNumber
**Bước:**
1. Mở modal chi tiết đơn có status = SHIPPING
2. Nhập mã vận đơn mới và cập nhật
3. Đóng và mở lại modal
4. Kiểm tra history

**Kết quả mong đợi:**
- Có 1 history item mới với:
  - field = "trackingNumber"
  - oldValue = null hoặc mã cũ
  - newValue = mã vận đơn mới
  - actor = email admin
  
DONE

#### Test Case 5: History khi bulk update
**Bước:**
1. Chọn 1 đơn hàng và bulk update status sang CONFIRMED
2. Mở modal chi tiết đơn đó
3. Kiểm tra history

**Kết quả mong đợi:**
- Có history item với field = "status", actor = email admin
- Note có thể chứa "cập nhật hàng loạt"


DONE

#### Test Case 6: Format hiển thị history
**Bước:**
1. Mở modal chi tiết đơn có nhiều history items
2. Kiểm tra format hiển thị

**Kết quả mong đợi:**
- Field name được format: "status" → "Trạng thái", "paymentStatus" → "Thanh toán", "trackingNumber" → "Mã vận đơn"
- oldValue → newValue hiển thị rõ ràng với dấu →
- oldValue có style line-through (nếu có)
- newValue có màu primary
- Actor hiển thị: "Bởi: {email}"
- Note hiển thị italic (nếu có)
- createdAt format: "DD/MM/YYYY, HH:mm:ss" (locale vi-VN)


DONE

#### Test Case 7: Scroll history khi có nhiều items
**Bước:**
1. Mở modal chi tiết đơn có > 10 history items
2. Kiểm tra scroll trong section history

**Kết quả mong đợi:**
- Section có max-height và scroll được
- Tất cả items đều hiển thị khi scroll

DONE

---

## D8: Bổ sung thông tin Order Detail

### Mục đích
Hiển thị đầy đủ thông tin khách hàng, billing address, transaction ID, voucher discount trong modal chi tiết đơn.

### Test Cases

#### Test Case 1: Hiển thị thông tin khách hàng cơ bản
**Bước:**
1. Admin → `/admin/orders`
2. Mở modal chi tiết đơn hàng
3. Kiểm tra section "Thông tin khách hàng"

**Kết quả mong đợi:**
- Section hiển thị với:
  - Email khách hàng (nếu có)
  - Số điện thoại (nếu có)
  - Nhóm khách (NEW/VIP/...) với badge màu primary
  - Mã giao dịch (transactionId) với font mono (nếu có)
  
DONE

#### Test Case 2: Hiển thị billing address
**Bước:**
1. Mở modal chi tiết đơn có billingAddress
2. Kiểm tra phần "Địa chỉ thanh toán"

**Kết quả mong đợi:**
- Hiển thị trong section "Thông tin khách hàng"
- Format JSON được parse và hiển thị dễ đọc (giống shippingAddress)
- Có border-top phân cách với phần trên

DONE

#### Test Case 3: Hiển thị voucher discount
**Bước:**
1. Mở modal chi tiết đơn có voucherDiscount > 0
2. Kiểm tra phần "Giảm giá voucher"

**Kết quả mong đợi:**
- Hiển thị trong section "Thông tin khách hàng"
- Format: "-{số tiền}" với màu error (đỏ)
- Có border-top phân cách

DONE

#### Test Case 4: Ẩn section nếu không có thông tin
**Bước:**
1. Mở modal chi tiết đơn không có billingAddress, customerEmail, customerPhone, customerGroup, transactionId, voucherDiscount = 0
2. Kiểm tra section "Thông tin khách hàng"

**Kết quả mong đợi:**
- Section không hiển thị (hoặc hiển thị nhưng rỗng)

DONE

#### Test Case 5: Format transactionId
**Bước:**
1. Mở modal chi tiết đơn có transactionId từ VNPay
2. Kiểm tra format hiển thị

**Kết quả mong đợi:**
- TransactionId hiển thị với font mono (font-mono)
- Font size nhỏ (text-xs)

DONE

#### Test Case 6: Customer group badge
**Bước:**
1. Mở modal chi tiết đơn có customerGroup = "VIP"
2. Kiểm tra badge

**Kết quả mong đợi:**
- Badge hiển thị với background primary/20, text primary
- Rounded-full, padding phù hợp

---

## D9: Payment Success/Failed Pages

### Mục đích
Tạo các trang riêng cho kết quả thanh toán thành công/thất bại với UI đầy đủ.

### Test Cases

#### Test Case 1: Truy cập Payment Success Page
**Bước:**
1. Truy cập `/checkout/success?orderNumber=ORD-20250127-0001`
2. Kiểm tra UI

**Kết quả mong đợi:**
- Icon checkmark màu xanh trong circle
- Tiêu đề: "Thanh toán thành công"
- Mô tả: "Cảm ơn bạn đã thanh toán đơn hàng..."
- Hiển thị mã đơn hàng (nếu có orderNumber trong URL)
- Các nút: "Xem chi tiết đơn hàng", "Xem danh sách đơn hàng", "Về trang chủ"
- Link "Liên hệ với chúng tôi" ở cuối

#### Test Case 2: Click "Xem chi tiết đơn hàng" từ Success Page
**Bước:**
1. Truy cập `/checkout/success?orderNumber=ORD-20250127-0001`
2. Click "Xem chi tiết đơn hàng"

**Kết quả mong đợi:**
- Navigate đến `/orders/ORD-20250127-0001`
- Hiển thị chi tiết đơn hàng

#### Test Case 3: Truy cập Payment Failed Page
**Bước:**
1. Truy cập `/checkout/failed?orderNumber=ORD-20250127-0001`
2. Kiểm tra UI

**Kết quả mong đợi:**
- Icon X màu đỏ trong circle
- Tiêu đề: "Thanh toán không thành công"
- Mô tả: "Thanh toán qua VNPay chưa hoàn tất..."
- Hiển thị mã đơn hàng
- Các nút: "Xem chi tiết đơn hàng", "Thanh toán lại", "Xem danh sách đơn hàng", "Về trang chủ"
- Link "Liên hệ với chúng tôi"

#### Test Case 4: Click "Thanh toán lại" từ Failed Page
**Bước:**
1. Truy cập `/checkout/failed?orderNumber=ORD-20250127-0001`
2. Click "Thanh toán lại"

**Kết quả mong đợi:**
- Navigate đến `/checkout?orderNumber=ORD-20250127-0001`
- Hiển thị trang checkout với thông tin đơn hàng

#### Test Case 5: VNPay redirect đến Success Page
**Bước:**
1. Tạo đơn hàng và thanh toán qua VNPay
2. Thanh toán thành công
3. Kiểm tra redirect URL

**Kết quả mong đợi:**
- Redirect đến `/checkout/success?orderNumber={orderNumber}`
- Không còn redirect đến `/payment/result?status=success&orderNumber=...`

#### Test Case 6: VNPay redirect đến Failed Page
**Bước:**
1. Tạo đơn hàng và thanh toán qua VNPay
2. Hủy thanh toán hoặc thanh toán thất bại
3. Kiểm tra redirect URL

**Kết quả mong đợi:**
- Redirect đến `/checkout/failed?orderNumber={orderNumber}`

#### Test Case 7: Backward compatibility - PaymentResult redirect
**Bước:**
1. Truy cập `/payment/result?status=success&orderNumber=ORD-20250127-0001`
2. Kiểm tra redirect

**Kết quả mong đợi:**
- Tự động redirect đến `/checkout/success?orderNumber=ORD-20250127-0001`

#### Test Case 8: PaymentResult với status=failed
**Bước:**
1. Truy cập `/payment/result?status=failed&orderNumber=ORD-20250127-0001`
2. Kiểm tra redirect

**Kết quả mong đợi:**
- Tự động redirect đến `/checkout/failed?orderNumber=ORD-20250127-0001`

#### Test Case 9: Success Page không có orderNumber
**Bước:**
1. Truy cập `/checkout/success` (không có query param)
2. Kiểm tra UI

**Kết quả mong đợi:**
- Page vẫn hiển thị bình thường
- Không hiển thị mã đơn hàng
- Nút "Xem chi tiết đơn hàng" không hiển thị (hoặc disabled)

#### Test Case 10: Responsive design
**Bước:**
1. Truy cập `/checkout/success` trên mobile
2. Kiểm tra layout

**Kết quả mong đợi:**
- Layout responsive, các nút xếp hàng dọc trên mobile
- Text không bị tràn
- Icon và spacing phù hợp

---

## Test Integration: D6 + D7

### Test Case: Bulk update và kiểm tra history
**Bước:**
1. Chọn 2 đơn hàng và bulk update status sang CONFIRMED
2. Mở modal chi tiết từng đơn
3. Kiểm tra history của mỗi đơn

**Kết quả mong đợi:**
- Mỗi đơn có history item mới với field = "status"
- Actor = email admin hiện tại
- CreatedAt gần đúng với thời gian bulk update

---

## Test Integration: D7 + D8

### Test Case: History và thông tin khách hàng cùng hiển thị
**Bước:**
1. Mở modal chi tiết đơn có đầy đủ thông tin
2. Kiểm tra cả history và thông tin khách hàng

**Kết quả mong đợi:**
- Cả 2 sections đều hiển thị đúng
- Layout không bị overlap
- Scroll mượt mà

---

## Checklist tổng hợp

### D6: Bulk Actions
- [ ] Checkbox chọn đơn hoạt động
- [ ] "Chọn tất cả" hoạt động
- [ ] Bulk actions bar hiển thị/ẩn đúng
- [ ] Bulk update status thành công
- [ ] Toast thông báo hiển thị
- [ ] Danh sách tự động refresh

### D7: Order History
- [ ] History hiển thị trong modal chi tiết
- [ ] History được sắp xếp đúng thứ tự
- [ ] Format hiển thị đẹp (field name, oldValue → newValue, actor, note, time)
- [ ] History được ghi khi update status
- [ ] History được ghi khi update paymentStatus
- [ ] History được ghi khi update trackingNumber
- [ ] History được ghi khi bulk update

### D8: Order Detail Enhancement
- [ ] Thông tin khách hàng hiển thị (email, phone, group)
- [ ] Billing address hiển thị (nếu có)
- [ ] TransactionId hiển thị với font mono
- [ ] Voucher discount hiển thị (nếu > 0)
- [ ] Section ẩn khi không có thông tin

### D9: Payment Pages
- [ ] `/checkout/success` hiển thị đúng UI
- [ ] `/checkout/failed` hiển thị đúng UI
- [ ] Các nút hành động hoạt động (navigate đúng)
- [ ] VNPay redirect đến đúng URL
- [ ] PaymentResult backward compatible
- [ ] Responsive design tốt

---

## Lưu ý khi test

1. **Dữ liệu test:**
   - Tạo đơn hàng test với đầy đủ thông tin (email, phone, billingAddress, voucher)
   - Tạo đơn hàng với VNPay để test redirect

2. **Browser Console:**
   - Kiểm tra không có lỗi JavaScript
   - Kiểm tra network requests thành công

3. **Database:**
   - Kiểm tra `order_history` table có records mới sau khi update
   - Kiểm tra `orders` table có status được cập nhật đúng

4. **Performance:**
   - Bulk update nhiều đơn (> 10) vẫn hoạt động mượt
   - History với nhiều items (> 20) scroll mượt

---

**Kết thúc hướng dẫn test**

