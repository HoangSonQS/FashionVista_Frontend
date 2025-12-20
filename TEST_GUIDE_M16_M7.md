# Hướng dẫn Test - M16: Quản lý Voucher & M7: Quản lý Thanh toán

## Mục lục
- [M16: Quản lý Voucher](#m16-quản-lý-voucher)
  - [Test Case 1: Tạo voucher giảm giá phần trăm](#test-case-1-tạo-voucher-giảm-giá-phần-trăm)
  - [Test Case 2: Tạo voucher giảm giá số tiền cố định](#test-case-2-tạo-voucher-giảm-giá-số-tiền-cố-định)
  - [Test Case 3: Tạo voucher miễn phí vận chuyển](#test-case-3-tạo-voucher-miễn-phí-vận-chuyển)
  - [Test Case 4: Tạo voucher với thời hạn và giới hạn sử dụng](#test-case-4-tạo-voucher-với-thời-hạn-và-giới-hạn-sử-dụng)
  - [Test Case 5: Tìm kiếm và lọc voucher](#test-case-5-tìm-kiếm-và-lọc-voucher)
  - [Test Case 6: Cập nhật voucher](#test-case-6-cập-nhật-voucher)
  - [Test Case 7: Xóa voucher](#test-case-7-xóa-voucher)
  - [Test Case 8: Kiểm tra trạng thái voucher](#test-case-8-kiểm-tra-trạng-thái-voucher)
- [M7: Quản lý Thanh toán](#m7-quản-lý-thanh-toán)
  - [Test Case 1: Xem danh sách thanh toán](#test-case-1-xem-danh-sách-thanh-toán)
  - [Test Case 2: Tìm kiếm thanh toán](#test-case-2-tìm-kiếm-thanh-toán)
  - [Test Case 3: Lọc theo phương thức thanh toán](#test-case-3-lọc-theo-phương-thức-thanh-toán)
  - [Test Case 4: Lọc theo trạng thái thanh toán](#test-case-4-lọc-theo-trạng-thái-thanh-toán)
  - [Test Case 5: Xem chi tiết đơn hàng từ thanh toán](#test-case-5-xem-chi-tiết-đơn-hàng-từ-thanh-toán)
  - [Test Case 6: Kiểm tra hiển thị số tiền đã hoàn](#test-case-6-kiểm-tra-hiển-thị-số-tiền-đã-hoàn)

---

## M16: Quản lý Voucher

### Đường dẫn
- **URL**: `/admin/vouchers`
- **Menu**: Admin → Voucher

### Test Case 1: Tạo voucher giảm giá phần trăm

**Mục đích**: Kiểm tra tạo voucher giảm giá 10% cho đơn hàng

**Các bước thực hiện**:
1. Đăng nhập với tài khoản Admin
2. Truy cập `/admin/vouchers`
3. Click nút **"+ Tạo voucher"**
4. Điền form:
   - **Mã voucher**: `SALE10`
   - **Loại voucher**: `Phần trăm (%)`
   - **Giá trị**: `10`
   - **Miễn phí vận chuyển**: Bỏ chọn
   - **Đơn tối thiểu**: `500000`
   - **Giới hạn sử dụng**: `100`
   - **Bắt đầu**: Để trống
   - **Hết hạn**: Để trống
   - **Trạng thái**: `Kích hoạt`
5. Click **"Tạo"**

**Kết quả mong đợi**:
- ✅ Toast hiển thị: "Tạo voucher thành công."
- ✅ Voucher mới xuất hiện trong danh sách
- ✅ Hiển thị đúng thông tin:
  - Mã: `SALE10`
  - Loại: `Phần trăm`
  - Giá trị: `10%`
  - Đơn tối thiểu: `500,000₫`
  - Đã dùng: `0 / 100`
  - Trạng thái: `Đang hoạt động` (màu xanh)

DONE

### Test Case 2: Tạo voucher giảm giá số tiền cố định

**Mục đích**: Kiểm tra tạo voucher giảm 50,000₫

**Các bước thực hiện**:
1. Click **"+ Tạo voucher"**
2. Điền form:
   - **Mã voucher**: `DISCOUNT50K`
   - **Loại voucher**: `Số tiền cố định (₫)`
   - **Giá trị**: `50000`
   - **Miễn phí vận chuyển**: Bỏ chọn
   - **Đơn tối thiểu**: `200000`
   - **Giới hạn sử dụng**: Để trống (không giới hạn)
   - **Bắt đầu**: Để trống
   - **Hết hạn**: Để trống
   - **Trạng thái**: `Kích hoạt`
3. Click **"Tạo"**

**Kết quả mong đợi**:
- ✅ Toast hiển thị: "Tạo voucher thành công."
- ✅ Voucher mới xuất hiện trong danh sách
- ✅ Hiển thị đúng thông tin:
  - Mã: `DISCOUNT50K`
  - Loại: `Số tiền cố định`
  - Giá trị: `50,000₫`
  - Đã dùng: `0 / ∞` (không giới hạn)

DONE

### Test Case 3: Tạo voucher miễn phí vận chuyển

**Mục đích**: Kiểm tra tạo voucher FREESHIP

**Các bước thực hiện**:
1. Click **"+ Tạo voucher"**
2. Điền form:
   - **Mã voucher**: `FREESHIP`
   - **Loại voucher**: `Miễn phí vận chuyển`
   - **Giá trị**: (Tự động ẩn)
   - **Miễn phí vận chuyển**: Tự động checked
   - **Đơn tối thiểu**: `300000`
   - **Giới hạn sử dụng**: `50`
   - **Bắt đầu**: Để trống
   - **Hết hạn**: Để trống
   - **Trạng thái**: `Kích hoạt`
3. Click **"Tạo"**

**Kết quả mong đợi**:
- ✅ Toast hiển thị: "Tạo voucher thành công."
- ✅ Voucher mới xuất hiện trong danh sách
- ✅ Hiển thị đúng thông tin:
  - Mã: `FREESHIP`
  - Loại: `Miễn phí ship`
  - Giá trị: `Miễn phí vận chuyển`
  - Đã dùng: `0 / 50`

DONE

### Test Case 4: Tạo voucher với thời hạn và giới hạn sử dụng

**Mục đích**: Kiểm tra tạo voucher có thời hạn

**Các bước thực hiện**:
1. Click **"+ Tạo voucher"**
2. Điền form:
   - **Mã voucher**: `NEWYEAR2025`
   - **Loại voucher**: `Phần trăm (%)`
   - **Giá trị**: `20`
   - **Miễn phí vận chuyển**: Bỏ chọn
   - **Đơn tối thiểu**: `1000000`
   - **Giới hạn sử dụng**: `200`
   - **Bắt đầu**: Chọn ngày hiện tại, giờ hiện tại
   - **Hết hạn**: Chọn ngày sau 30 ngày, cùng giờ
   - **Trạng thái**: `Kích hoạt`
3. Click **"Tạo"**

**Kết quả mong đợi**:
- ✅ Toast hiển thị: "Tạo voucher thành công."
- ✅ Voucher mới xuất hiện trong danh sách
- ✅ Hiển thị đúng thông tin:
  - Mã: `NEWYEAR2025`
  - Giá trị: `20%`
  - Thời hạn: Hiển thị đúng ngày bắt đầu và hết hạn
  - Trạng thái: `Đang hoạt động` (nếu trong thời hạn) hoặc `Chưa bắt đầu` (nếu chưa đến ngày bắt đầu)

DONE

### Test Case 5: Tìm kiếm và lọc voucher

**Mục đích**: Kiểm tra chức năng tìm kiếm và lọc

**Các bước thực hiện**:
1. **Tìm kiếm**:
   - Nhập `SALE10` vào ô tìm kiếm
   - Đợi 400ms (debounce)
   - Kiểm tra kết quả chỉ hiển thị voucher có mã chứa `SALE10`

2. **Lọc theo trạng thái**:
   - Chọn `Đang kích hoạt` từ dropdown
   - Kiểm tra chỉ hiển thị voucher có `active = true`

3. **Lọc theo trạng thái vô hiệu hóa**:
   - Chọn `Đã vô hiệu hóa`
   - Kiểm tra chỉ hiển thị voucher có `active = false`

4. **Kết hợp tìm kiếm và lọc**:
   - Nhập `DISCOUNT` vào ô tìm kiếm
   - Chọn `Đang kích hoạt`
   - Kiểm tra kết quả phù hợp cả 2 điều kiện

**Kết quả mong đợi**:
- ✅ Tìm kiếm hoạt động với debounce 400ms
- ✅ Lọc theo trạng thái hoạt động chính xác
- ✅ Kết hợp tìm kiếm và lọc hoạt động đúng
- ✅ Pagination hoạt động khi có nhiều kết quả

DONE

### Test Case 6: Cập nhật voucher

**Mục đích**: Kiểm tra chỉnh sửa voucher

**Các bước thực hiện**:
1. Tìm voucher `SALE10` (tạo ở Test Case 1)
2. Click nút **"Chỉnh sửa"**
3. Thay đổi:
   - **Giá trị**: `15` (từ 10)
   - **Đơn tối thiểu**: `300000` (từ 500000)
   - **Giới hạn sử dụng**: `150` (từ 100)
4. Click **"Cập nhật"**

**Kết quả mong đợi**:
- ✅ Toast hiển thị: "Cập nhật voucher thành công."
- ✅ Voucher được cập nhật ngay lập tức (optimistic update)
- ✅ Hiển thị đúng giá trị mới:
  - Giá trị: `15%`
  - Đơn tối thiểu: `300,000₫`
  - Đã dùng: `0 / 150`

DONE

### Test Case 7: Xóa voucher

**Mục đích**: Kiểm tra xóa voucher

**Các bước thực hiện**:
1. Tìm voucher `DISCOUNT50K` (tạo ở Test Case 2)
2. Click nút **"Xóa"**
3. Xác nhận trong dialog: **"Bạn có chắc chắn muốn xóa voucher này?"**
4. Click **"OK"** (hoặc tương đương)

**Kết quả mong đợi**:
- ✅ Toast hiển thị: "Xóa voucher thành công."
- ✅ Voucher biến mất khỏi danh sách
- ✅ Danh sách tự động refresh

DONE

### Test Case 8: Kiểm tra trạng thái voucher

**Mục đích**: Kiểm tra hiển thị trạng thái voucher theo điều kiện

**Các bước thực hiện**:

1. **Voucher đã hết hạn**:
   - Tạo voucher với ngày hết hạn là ngày hôm qua
   - Kiểm tra trạng thái hiển thị: `Hết hạn` (màu đỏ)

2. **Voucher chưa bắt đầu**:
   - Tạo voucher với ngày bắt đầu là ngày mai
   - Kiểm tra trạng thái hiển thị: `Chưa bắt đầu` (màu vàng)

3. **Voucher đã hết lượt**:
   - Tạo voucher với `usageLimit = 1` và `usedCount = 1`
   - Kiểm tra trạng thái hiển thị: `Đã hết lượt` (màu cam)

4. **Voucher vô hiệu hóa**:
   - Tạo voucher với `active = false`
   - Kiểm tra trạng thái hiển thị: `Vô hiệu hóa` (màu xám)

5. **Voucher đang hoạt động**:
   - Tạo voucher với `active = true`, trong thời hạn, còn lượt
   - Kiểm tra trạng thái hiển thị: `Đang hoạt động` (màu xanh)

**Kết quả mong đợi**:
- ✅ Mỗi trạng thái hiển thị đúng màu và label
- ✅ Logic xác định trạng thái chính xác theo thứ tự ưu tiên:
  1. Vô hiệu hóa (`active = false`)
  2. Hết hạn (`expiresAt < now`)
  3. Chưa bắt đầu (`startsAt > now`)
  4. Đã hết lượt (`usedCount >= usageLimit`)
  5. Đang hoạt động (còn lại)

DONE

## M7: Quản lý Thanh toán

### Đường dẫn
- **URL**: `/admin/payments`
- **Menu**: Admin → Thanh toán

### Test Case 1: Xem danh sách thanh toán

**Mục đích**: Kiểm tra hiển thị danh sách thanh toán

**Các bước thực hiện**:
1. Đăng nhập với tài khoản Admin
2. Truy cập `/admin/payments`
3. Kiểm tra danh sách thanh toán

**Kết quả mong đợi**:
- ✅ Hiển thị bảng với các cột:
  - Mã đơn hàng
  - Phương thức
  - Số tiền
  - Đã hoàn
  - Trạng thái
  - Transaction ID
  - Thời gian
  - Thao tác
- ✅ Mỗi dòng hiển thị đầy đủ thông tin thanh toán
- ✅ Pagination hoạt động nếu có nhiều hơn 20 thanh toán
- ✅ Hiển thị số lượng: "Hiển thị X trên tổng số Y giao dịch"

DONE

### Test Case 2: Tìm kiếm thanh toán

**Mục đích**: Kiểm tra tìm kiếm theo mã đơn hoặc transaction ID

**Các bước thực hiện**:
1. Nhập mã đơn hàng vào ô tìm kiếm (ví dụ: `ORD-2025-001`)
2. Đợi 400ms (debounce)
3. Kiểm tra kết quả

**Kết quả mong đợi**:
- ✅ Chỉ hiển thị thanh toán có mã đơn chứa từ khóa tìm kiếm
- ✅ Hoặc hiển thị thanh toán có transaction ID chứa từ khóa
- ✅ Debounce hoạt động đúng (không gọi API quá nhiều lần)
- ✅ Pagination reset về trang 1 khi tìm kiếm

**Test với transaction ID**:
1. Nhập một phần transaction ID vào ô tìm kiếm
2. Kiểm tra kết quả chỉ hiển thị thanh toán có transaction ID khớp

DONE

### Test Case 3: Lọc theo phương thức thanh toán

**Mục đích**: Kiểm tra lọc theo COD, VNPay, MoMo, Bank Transfer

**Các bước thực hiện**:
1. Chọn `Thanh toán khi nhận hàng` từ dropdown "Tất cả phương thức"
2. Kiểm tra kết quả chỉ hiển thị thanh toán COD

3. Chọn `VNPay`
4. Kiểm tra kết quả chỉ hiển thị thanh toán VNPay

5. Chọn `MoMo`
6. Kiểm tra kết quả chỉ hiển thị thanh toán MoMo

7. Chọn `Chuyển khoản`
8. Kiểm tra kết quả chỉ hiển thị thanh toán Bank Transfer

9. Chọn `Tất cả phương thức`
10. Kiểm tra hiển thị tất cả thanh toán

**Kết quả mong đợi**:
- ✅ Mỗi phương thức lọc đúng
- ✅ Label hiển thị đúng:
  - COD → "Thanh toán khi nhận hàng"
  - VNPAY → "VNPay"
  - MOMO → "MoMo"
  - BANK_TRANSFER → "Chuyển khoản"
- ✅ Pagination reset về trang 1 khi lọc

DONE

### Test Case 4: Lọc theo trạng thái thanh toán

**Mục đích**: Kiểm tra lọc theo các trạng thái thanh toán

**Các bước thực hiện**:
1. Chọn `Chờ thanh toán` từ dropdown "Tất cả trạng thái"
2. Kiểm tra kết quả chỉ hiển thị thanh toán `PENDING` (màu vàng)

3. Chọn `Đã thanh toán`
4. Kiểm tra kết quả chỉ hiển thị thanh toán `PAID` (màu xanh)

5. Chọn `Thất bại`
6. Kiểm tra kết quả chỉ hiển thị thanh toán `FAILED` (màu đỏ)

7. Chọn `Chờ hoàn tiền`
8. Kiểm tra kết quả chỉ hiển thị thanh toán `REFUND_PENDING` (màu cam)

9. Chọn `Đã hoàn tiền`
10. Kiểm tra kết quả chỉ hiển thị thanh toán `REFUNDED` (màu xám)

11. Chọn `Tất cả trạng thái`
12. Kiểm tra hiển thị tất cả thanh toán

**Kết quả mong đợi**:
- ✅ Mỗi trạng thái lọc đúng
- ✅ Badge trạng thái hiển thị đúng màu:
  - PENDING → "Chờ thanh toán" (vàng)
  - PAID → "Đã thanh toán" (xanh)
  - FAILED → "Thất bại" (đỏ)
  - REFUND_PENDING → "Chờ hoàn tiền" (cam)
  - REFUNDED → "Đã hoàn tiền" (xám)

DONE

### Test Case 5: Xem chi tiết đơn hàng từ thanh toán

**Mục đích**: Kiểm tra link đến chi tiết đơn hàng

**Các bước thực hiện**:
1. Tìm một thanh toán bất kỳ trong danh sách
2. Click nút **"Xem đơn hàng"** ở cột "Thao tác"
3. Kiểm tra navigation

**Kết quả mong đợi**:
- ✅ Navigate đến `/admin/orders/{orderId}`
- ✅ Trang chi tiết đơn hàng hiển thị đúng thông tin
- ✅ Có thể quay lại trang thanh toán bằng browser back

DONE

### Test Case 6: Kiểm tra hiển thị số tiền đã hoàn

**Mục đích**: Kiểm tra hiển thị số tiền đã hoàn cho các trường hợp

**Các bước thực hiện**:

1. **Thanh toán chưa hoàn tiền**:
   - Tìm thanh toán có `refundAmount = 0`
   - Kiểm tra cột "Đã hoàn" hiển thị: `—`

2. **Thanh toán đã hoàn một phần**:
   - Tìm thanh toán có `refundAmount > 0` và `refundAmount < amount`
   - Kiểm tra cột "Đã hoàn" hiển thị số tiền màu đỏ: `X,XXX₫`

3. **Thanh toán đã hoàn toàn bộ**:
   - Tìm thanh toán có `refundAmount = amount`
   - Kiểm tra cột "Đã hoàn" hiển thị số tiền màu đỏ: `X,XXX₫`
   - Trạng thái là `REFUNDED`

**Kết quả mong đợi**:
- ✅ Số tiền đã hoàn hiển thị đúng format: `X,XXX₫`
- ✅ Màu đỏ khi có số tiền đã hoàn
- ✅ Hiển thị `—` khi chưa hoàn tiền
- ✅ Số tiền được format theo locale Việt Nam

DONE

## Test Cases Tổng hợp

### Test Case: Kết hợp nhiều filter

**Mục đích**: Kiểm tra kết hợp tìm kiếm, lọc phương thức và trạng thái

**Các bước thực hiện**:
1. Nhập mã đơn vào ô tìm kiếm
2. Chọn phương thức thanh toán: `VNPay`
3. Chọn trạng thái: `Đã thanh toán`
4. Kiểm tra kết quả

**Kết quả mong đợi**:
- ✅ Kết quả thỏa mãn cả 3 điều kiện:
  - Mã đơn chứa từ khóa tìm kiếm
  - Phương thức là VNPay
  - Trạng thái là PAID
- ✅ Pagination hoạt động đúng với kết quả đã lọc

DONE

### Test Case: Pagination

**Mục đích**: Kiểm tra phân trang khi có nhiều thanh toán

**Các bước thực hiện**:
1. Đảm bảo có hơn 20 thanh toán trong hệ thống
2. Kiểm tra hiển thị nút "Trước" và "Sau"
3. Click "Sau" để chuyển trang
4. Click "Trước" để quay lại
5. Kiểm tra nút "Trước" bị disable ở trang đầu
6. Kiểm tra nút "Sau" bị disable ở trang cuối

**Kết quả mong đợi**:
- ✅ Hiển thị đúng số lượng: "Hiển thị X trên tổng số Y giao dịch"
- ✅ Nút "Trước" disable ở trang đầu (page = 0)
- ✅ Nút "Sau" disable ở trang cuối (page + 1 >= totalPages)
- ✅ Chuyển trang mượt mà, không reload toàn bộ trang

DONE

## Checklist Test Tổng thể

### M16: Voucher
- [ ] Tạo voucher PERCENT thành công
- [ ] Tạo voucher FIXED_AMOUNT thành công
- [ ] Tạo voucher FREESHIP thành công
- [ ] Tạo voucher với thời hạn thành công
- [ ] Tìm kiếm voucher hoạt động
- [ ] Lọc theo trạng thái hoạt động
- [ ] Cập nhật voucher thành công (optimistic update)
- [ ] Xóa voucher thành công
- [ ] Hiển thị trạng thái voucher chính xác
- [ ] Validation form hoạt động đúng
- [ ] Error handling hiển thị toast đúng

### M7: Thanh toán
- [ ] Hiển thị danh sách thanh toán
- [ ] Tìm kiếm theo mã đơn hoạt động
- [ ] Tìm kiếm theo transaction ID hoạt động
- [ ] Lọc theo phương thức thanh toán hoạt động
- [ ] Lọc theo trạng thái thanh toán hoạt động
- [ ] Kết hợp nhiều filter hoạt động
- [ ] Link đến chi tiết đơn hàng hoạt động
- [ ] Hiển thị số tiền đã hoàn chính xác
- [ ] Pagination hoạt động đúng
- [ ] Format số tiền và thời gian đúng

---

## Lưu ý khi Test

1. **Debounce**: Tìm kiếm có debounce 400ms, cần đợi sau khi nhập
2. **Optimistic Update**: Cập nhật voucher sẽ cập nhật UI ngay lập tức
3. **Pagination**: Mỗi trang hiển thị 20 items
4. **Error Handling**: Kiểm tra toast hiển thị khi có lỗi
5. **Validation**: Kiểm tra các trường bắt buộc (code, type, value)
6. **Date Format**: Thời gian hiển thị theo format Việt Nam
7. **Currency Format**: Số tiền hiển thị theo format `X,XXX₫`

---

## Kết luận

Sau khi hoàn thành tất cả test cases trên, hệ thống quản lý Voucher và Thanh toán đã sẵn sàng để sử dụng trong môi trường production.

