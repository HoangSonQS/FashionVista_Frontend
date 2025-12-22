# Test Guide - M13: Trang quản lý Đánh giá (Admin Reviews)

## Tổng quan
Trang `/admin/reviews` cho phép admin:
- Xem danh sách tất cả review của khách hàng
- Lọc theo rating
- Tìm kiếm theo tên sản phẩm, slug, tên khách, email, nội dung
- Xem chi tiết review
- Xóa review vi phạm

## Điều kiện tiên quyết
1. Đăng nhập tài khoản ADMIN
2. Có sẵn một số review trong hệ thống (nhiều sản phẩm, nhiều user, rating khác nhau)
3. Đảm bảo API `/api/admin/reviews` hoạt động (BE đã build)

## Test cases

### TC-M13-01: Hiển thị danh sách reviews
**Bước:**
1. Mở `/admin/reviews`
2. Quan sát bảng danh sách
**Kỳ vọng:**
- Hiển thị các cột: Sản phẩm, Khách hàng, Rating, Nội dung, Ngày, Thao tác
- Mỗi dòng thể hiện đúng dữ liệu trả về từ API

### TC-M13-02: Overview cards & phân bố rating
**Bước:**
1. Mở `/admin/reviews`
2. Quan sát 4 cards tổng quan + block “Phân bố rating”
**Kỳ vọng:**
- Tổng số đánh giá, rating trung bình, % tích cực, % tiêu cực hiển thị hợp lý với dữ liệu seed
- Biểu đồ thanh 1–5★ có chiều dài tương đối đúng theo số lượng

### TC-M13-03: Xu hướng đánh giá theo thời gian
**Bước:**
1. Mở `/admin/reviews`
2. Quan sát block “Xu hướng số lượng đánh giá (30 ngày)”
**Kỳ vọng:**
- Nếu có dữ liệu trong 30 ngày: hiển thị cột (sparkline đơn giản) với tooltip count + avg rating
- Nếu không có: hiển thị text “Chưa đủ dữ liệu.”

### TC-M13-04: Filter theo rating
**Bước:**
1. Mở `/admin/reviews`
2. Chọn filter “5 sao”
3. Chọn filter “1 sao”
4. Chọn lại “Tất cả”
**Kỳ vọng:**
- Khi chọn “5 sao”: chỉ hiển thị các review rating = 5
- Khi chọn “1 sao”: chỉ hiển thị rating = 1
- “Tất cả”: hiển thị mọi rating

### TC-M13-05: Tìm kiếm theo sản phẩm / khách hàng
**Bước:**
1. Gõ tên một sản phẩm vào ô search
2. Xóa, sau đó gõ tên một khách hàng
3. Xóa, sau đó gõ email khách hàng
4. Xóa, sau đó gõ một từ khóa trong nội dung comment
**Kỳ vọng:**
- Kết quả chỉ chứa review tương ứng với từ khóa (sản phẩm / khách / email / nội dung)
- Debounce hoạt động, không spam request

### TC-M13-06: Sản phẩm nổi bật & filter theo sản phẩm
**Bước:**
1. Quan sát khối “Sản phẩm nổi bật theo đánh giá” bên trái
2. Click vào 1 sản phẩm trong danh sách
**Kỳ vọng:**
- Danh sách bên trái hiển thị: tên sản phẩm, slug, số review, avg rating, badge cảnh báo/đánh giá cao (nếu thỏa điều kiện)
- Khi click một sản phẩm: bảng review bên phải chỉ hiển thị review của sản phẩm đó
- Click lại sản phẩm đang chọn → bỏ filter, hiển thị tất cả

### TC-M13-07: Xem chi tiết review
**Bước:**
1. Tại danh sách, chọn một review bất kỳ
2. Click nút “Xem”
**Kỳ vọng:**
- Modal chi tiết hiển thị:
  - Tên sản phẩm
  - Tên + email khách hàng
  - Rating (★ lặp lại)
  - Nội dung đầy đủ (không bị truncate)
  - Thời gian tạo

### TC-M13-08: Xóa review
**Bước:**
1. Chọn một review
2. Click nút “Xóa”
3. Xác nhận trên dialog
**Kỳ vọng:**
- Review bị xóa khỏi danh sách
- Nếu modal chi tiết đang mở cho review đó → modal đóng hoặc không lỗi
- Toast hiển thị “Đã xóa review.”

### TC-M13-09: Xóa thất bại (Negative)
**Bước:**
1. Mock lỗi API `DELETE /api/admin/reviews/:id` trả lỗi 500 hoặc 404
2. Thử xóa review
**Kỳ vọng:**
- Hiển thị toast lỗi: “Không thể xóa review.” (hoặc message từ backend)
- Review vẫn còn trong danh sách

### TC-M13-10: Pagination
**Bước:**
1. Với danh sách > 1 trang, dùng nút “Trước” / “Sau”
**Kỳ vọng:**
- Trang hiện tại update đúng
- Số trang hiển thị chính xác

## Checklist
- [ ] Cards tổng quan hiển thị đúng (total, avg, positive/negative rate)
- [ ] Biểu đồ phân bố rating hoạt động
- [ ] Biểu đồ xu hướng hiển thị khi có dữ liệu
- [ ] Danh sách sản phẩm nổi bật (top products) hiển thị đúng, filter theo product hoạt động
- [ ] Danh sách review hiển thị đúng dữ liệu
- [ ] Filter theo rating hoạt động
- [ ] Search theo sản phẩm/khách/email hoạt động
- [ ] Modal chi tiết hiển thị đầy đủ
- [ ] Xóa review hoạt động, có toast thông báo
- [ ] Pagination hoạt động
- [ ] Xử lý lỗi mạng/API không crash


