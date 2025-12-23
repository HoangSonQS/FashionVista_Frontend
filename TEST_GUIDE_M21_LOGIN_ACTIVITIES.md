# Test Guide - M21: Quản lý Hoạt động Đăng nhập

## Tổng quan
Trang `/admin/login-activities` cho phép admin xem lịch sử đăng nhập, phát hiện hoạt động đáng ngờ (IP lạ, nhiều lần thất bại), và xem thống kê.

---

## Test Cases

### TC-M21-01: Xem thống kê hoạt động đăng nhập
**Mục đích:** Kiểm tra hiển thị thống kê tổng quan.

**Các bước:**
1. Đăng nhập admin
2. Vào `/admin/login-activities`
3. Xem phần thống kê ở đầu trang

**Kết quả mong đợi:**
- Hiển thị 6 card thống kê:
  - Tổng số lần đăng nhập
  - Đăng nhập thành công (màu xanh lá)
  - Đăng nhập thất bại (màu đỏ)
  - Hoạt động đáng ngờ (màu vàng, có icon AlertTriangle)
  - Số user đã đăng nhập
  - Số IP khác nhau
- Số liệu chính xác và được format với dấu phẩy

DONE

### TC-M21-02: Xem danh sách lịch sử đăng nhập (không filter)
**Mục đích:** Kiểm tra hiển thị danh sách lịch sử đăng nhập mặc định.

**Các bước:**
1. Vào `/admin/login-activities`
2. Xem bảng lịch sử đăng nhập

**Kết quả mong đợi:**
- Bảng hiển thị các cột: ID, User, IP, Thiết bị, Vị trí, Trạng thái, Thời gian
- Dữ liệu được sắp xếp theo thời gian mới nhất
- Trạng thái thành công hiển thị badge xanh lá với icon ShieldCheck
- Trạng thái thất bại hiển thị badge đỏ với icon Shield
- Hoạt động đáng ngờ có background màu vàng nhạt và hiển thị "Đáng ngờ" với icon AlertTriangle

DONE

### TC-M21-03: Filter theo User ID
**Mục đích:** Kiểm tra filter lịch sử theo User ID.

**Các bước:**
1. Vào `/admin/login-activities`
2. Nhập User ID vào ô "User ID" (ví dụ: 1)
3. Xem kết quả

**Kết quả mong đợi:**
- Chỉ hiển thị lịch sử đăng nhập của user có ID = 1
- Bảng được cập nhật ngay lập tức

---

### TC-M21-04: Filter theo trạng thái
**Mục đích:** Kiểm tra filter theo trạng thái đăng nhập.

**Các bước:**
1. Vào `/admin/login-activities`
2. Chọn trạng thái từ dropdown (ví dụ: "Thất bại")
3. Xem kết quả

**Kết quả mong đợi:**
- Chỉ hiển thị các lần đăng nhập thất bại
- Các option: "Tất cả", "Thành công", "Thất bại"

---

### TC-M21-05: Filter theo IP Address
**Mục đích:** Kiểm tra filter theo IP address.

**Các bước:**
1. Vào `/admin/login-activities`
2. Nhập IP address vào ô "IP Address" (ví dụ: "192.168")
3. Xem kết quả

**Kết quả mong đợi:**
- Chỉ hiển thị các lần đăng nhập có IP chứa chuỗi đã nhập
- Search không phân biệt hoa thường

---

### TC-M21-06: Filter theo khoảng thời gian
**Mục đích:** Kiểm tra filter theo khoảng thời gian.

**Các bước:**
1. Vào `/admin/login-activities`
2. Chọn "Từ ngày" và "Đến ngày" (ví dụ: hôm nay)
3. Xem kết quả

**Kết quả mong đợi:**
- Chỉ hiển thị các lần đăng nhập trong khoảng thời gian đã chọn
- Thống kê cũng được cập nhật theo khoảng thời gian

---

### TC-M21-07: Kết hợp nhiều filter
**Mục đích:** Kiểm tra filter kết hợp nhiều điều kiện.

**Các bước:**
1. Vào `/admin/login-activities`
2. Nhập User ID = 1
3. Chọn trạng thái = "Thất bại"
4. Chọn khoảng thời gian
5. Xem kết quả

**Kết quả mong đợi:**
- Chỉ hiển thị các lần đăng nhập thỏa mãn TẤT CẢ các điều kiện
- Kết quả chính xác

---

### TC-M21-08: Phân trang
**Mục đích:** Kiểm tra phân trang khi có nhiều dữ liệu.

**Các bước:**
1. Vào `/admin/login-activities`
2. Xem phần phân trang ở cuối bảng
3. Click "Trước" và "Sau"

**Kết quả mong đợi:**
- Hiển thị "Trang X / Y"
- Nút "Trước" disabled khi ở trang đầu
- Nút "Sau" disabled khi ở trang cuối
- Dữ liệu được cập nhật khi chuyển trang

---

### TC-M21-09: Phát hiện hoạt động đáng ngờ - IP lạ
**Mục đích:** Kiểm tra phát hiện IP lạ (IP chưa từng đăng nhập thành công cho user).

**Các bước:**
1. Tạo một user mới và đăng nhập thành công từ IP A
2. Đăng nhập từ IP B (IP mới, chưa từng đăng nhập thành công)
3. Vào `/admin/login-activities`
4. Tìm lần đăng nhập từ IP B

**Kết quả mong đợi:**
- Lần đăng nhập từ IP B được đánh dấu là "đáng ngờ"
- Row có background màu vàng nhạt
- Hiển thị "Đáng ngờ" với icon AlertTriangle trong cột Trạng thái

---

### TC-M21-10: Phát hiện hoạt động đáng ngờ - Nhiều lần thất bại
**Mục đích:** Kiểm tra phát hiện nhiều lần thất bại (> 3 lần trong 1 giờ).

**Các bước:**
1. Tạo một user
2. Thực hiện > 3 lần đăng nhập thất bại trong vòng 1 giờ
3. Vào `/admin/login-activities`
4. Tìm các lần đăng nhập thất bại đó

**Kết quả mong đợi:**
- Các lần đăng nhập thất bại được đánh dấu là "đáng ngờ"
- Row có background màu vàng nhạt
- Hiển thị "Đáng ngờ" với icon AlertTriangle

---

### TC-M21-11: Hiển thị thông tin user trong bảng
**Mục đích:** Kiểm tra hiển thị thông tin user trong bảng.

**Các bước:**
1. Vào `/admin/login-activities`
2. Xem cột "User" trong bảng

**Kết quả mong đợi:**
- Hiển thị tên user (fullName) ở dòng đầu
- Hiển thị email ở dòng thứ hai (màu xám, font nhỏ hơn)
- Nếu không có fullName, hiển thị "N/A"

---

### TC-M21-12: Hiển thị thông tin thiết bị và vị trí
**Mục đích:** Kiểm tra hiển thị thông tin thiết bị và vị trí.

**Các bước:**
1. Vào `/admin/login-activities`
2. Xem cột "Thiết bị" và "Vị trí"

**Kết quả mong đợi:**
- Cột "Thiết bị" hiển thị deviceType (MOBILE, TABLET, DESKTOP) hoặc "N/A"
- Cột "Vị trí" hiển thị location (thành phố/quốc gia) hoặc "N/A"

---

### TC-M21-13: Hiển thị lý do thất bại
**Mục đích:** Kiểm tra hiển thị lý do thất bại khi đăng nhập thất bại.

**Các bước:**
1. Vào `/admin/login-activities`
2. Tìm một lần đăng nhập thất bại
3. Xem cột "Trạng thái"

**Kết quả mong đợi:**
- Hiển thị badge "Thất bại" màu đỏ
- Hiển thị failureReason bên dưới badge (nếu có)
- Nếu không có failureReason, không hiển thị gì thêm

---

### TC-M21-14: Format thời gian
**Mục đích:** Kiểm tra format thời gian hiển thị.

**Các bước:**
1. Vào `/admin/login-activities`
2. Xem cột "Thời gian" trong bảng

**Kết quả mong đợi:**
- Thời gian được format theo locale 'vi-VN'
- Hiển thị đầy đủ ngày, giờ (ví dụ: "27/01/2025, 14:30:00")

---

### TC-M21-15: Loading states
**Mục đích:** Kiểm tra hiển thị loading khi tải dữ liệu.

**Các bước:**
1. Vào `/admin/login-activities`
2. Thay đổi filter hoặc chuyển trang
3. Quan sát trạng thái loading

**Kết quả mong đợi:**
- Hiển thị "Đang tải..." khi đang fetch dữ liệu
- Hiển thị "Đang tải thống kê..." khi đang fetch stats

---

### TC-M21-16: Empty state
**Mục đích:** Kiểm tra hiển thị khi không có dữ liệu.

**Các bước:**
1. Vào `/admin/login-activities`
2. Áp dụng filter không có kết quả (ví dụ: User ID = 99999)

**Kết quả mong đợi:**
- Hiển thị "Không có dữ liệu." ở giữa bảng
- Không hiển thị phần phân trang

---

### TC-M21-17: Clear filters
**Mục đích:** Kiểm tra chức năng xóa bộ lọc.

**Các bước:**
1. Vào `/admin/login-activities`
2. Áp dụng một số filter
3. Click nút "Xóa bộ lọc"

**Kết quả mong đợi:**
- Tất cả filter được reset về giá trị mặc định
- Dữ liệu được reload và hiển thị tất cả

---

### TC-M21-18: Thống kê theo khoảng thời gian
**Mục đích:** Kiểm tra thống kê được cập nhật theo khoảng thời gian.

**Các bước:**
1. Vào `/admin/login-activities`
2. Chọn "Từ ngày" và "Đến ngày"
3. Xem thống kê

**Kết quả mong đợi:**
- Thống kê chỉ tính các lần đăng nhập trong khoảng thời gian đã chọn
- Số liệu chính xác

---

### TC-M21-19: Highlight hoạt động đáng ngờ
**Mục đích:** Kiểm tra highlight hoạt động đáng ngờ trong bảng.

**Các bước:**
1. Vào `/admin/login-activities`
2. Tìm các row có hoạt động đáng ngờ

**Kết quả mong đợi:**
- Row có background màu vàng nhạt (amber-50)
- Hiển thị "Đáng ngờ" với icon AlertTriangle trong cột Trạng thái
- Dễ dàng nhận biết các hoạt động đáng ngờ

---

### TC-M21-20: Error handling
**Mục đích:** Kiểm tra xử lý lỗi khi API fail.

**Các bước:**
1. Vào `/admin/login-activities`
2. Ngắt kết nối mạng hoặc gây lỗi API
3. Thực hiện các thao tác (load data, filter)

**Kết quả mong đợi:**
- Hiển thị toast lỗi với thông báo phù hợp
- Không crash ứng dụng
- Có thể thử lại sau khi kết nối lại

---

## Checklist

- [ ] TC-M21-01: Xem thống kê hoạt động đăng nhập
- [ ] TC-M21-02: Xem danh sách lịch sử đăng nhập (không filter)
- [ ] TC-M21-03: Filter theo User ID
- [ ] TC-M21-04: Filter theo trạng thái
- [ ] TC-M21-05: Filter theo IP Address
- [ ] TC-M21-06: Filter theo khoảng thời gian
- [ ] TC-M21-07: Kết hợp nhiều filter
- [ ] TC-M21-08: Phân trang
- [ ] TC-M21-09: Phát hiện hoạt động đáng ngờ - IP lạ
- [ ] TC-M21-10: Phát hiện hoạt động đáng ngờ - Nhiều lần thất bại
- [ ] TC-M21-11: Hiển thị thông tin user trong bảng
- [ ] TC-M21-12: Hiển thị thông tin thiết bị và vị trí
- [ ] TC-M21-13: Hiển thị lý do thất bại
- [ ] TC-M21-14: Format thời gian
- [ ] TC-M21-15: Loading states
- [ ] TC-M21-16: Empty state
- [ ] TC-M21-17: Clear filters
- [ ] TC-M21-18: Thống kê theo khoảng thời gian
- [ ] TC-M21-19: Highlight hoạt động đáng ngờ
- [ ] TC-M21-20: Error handling

---

## Ghi chú

- Tất cả các endpoint yêu cầu quyền ADMIN
- Hoạt động đáng ngờ được phát hiện dựa trên:
  - IP lạ: IP chưa từng đăng nhập thành công cho user đó
  - Nhiều lần thất bại: > 3 lần thất bại trong 1 giờ gần đây
- Format số sử dụng locale 'vi-VN' với dấu phẩy phân cách hàng nghìn
- Thống kê có thể được filter theo khoảng thời gian

