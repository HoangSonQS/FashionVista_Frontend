# Test Guide - M5: Quản lý Sản phẩm trong Bộ sưu tập

## Tổng quan
Module này cho phép admin quản lý sản phẩm trong bộ sưu tập: xem danh sách, thêm/xóa sản phẩm, sắp xếp thứ tự bằng drag & drop, bulk actions.

## Điều kiện tiên quyết
1. Đã đăng nhập với tài khoản ADMIN
2. Đã có ít nhất 1 bộ sưu tập trong hệ thống
3. Đã có ít nhất một số sản phẩm trong hệ thống

## Các test case

### TC-M5-01: Truy cập trang quản lý sản phẩm từ danh sách bộ sưu tập
**Mục đích**: Kiểm tra navigation đến trang quản lý sản phẩm

**Các bước**:
1. Đăng nhập với tài khoản ADMIN
2. Vào `/admin/collections`
3. Tìm một bộ sưu tập bất kỳ trong danh sách
4. Click vào button "Quản lý sản phẩm" ở cột "Thao tác"

**Kết quả mong đợi**:
- ✅ Chuyển đến trang `/admin/collections/{collectionId}/products`
- ✅ Hiển thị tên bộ sưu tập ở header
- ✅ Có link "← Quay lại danh sách bộ sưu tập"
- ✅ Có button "Chỉnh sửa bộ sưu tập"

DONE

### TC-M5-02: Xem danh sách sản phẩm trong bộ sưu tập
**Mục đích**: Kiểm tra hiển thị danh sách sản phẩm

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập
2. Xem danh sách sản phẩm

**Kết quả mong đợi**:
- ✅ Hiển thị bảng danh sách sản phẩm với các cột: Checkbox, Drag handle, Sản phẩm (ảnh + tên), SKU, Giá, Tồn kho, Trạng thái, Thao tác
- ✅ Mỗi sản phẩm hiển thị: thumbnail, tên, SKU, giá, tồn kho, trạng thái
- ✅ Có pagination nếu có nhiều sản phẩm
- ✅ Nếu chưa có sản phẩm: hiển thị "Chưa có sản phẩm nào trong bộ sưu tập."

DONE

### TC-M5-03: Tìm kiếm sản phẩm trong bộ sưu tập
**Mục đích**: Kiểm tra chức năng search

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có nhiều sản phẩm
2. Nhập từ khóa vào ô tìm kiếm (theo tên hoặc SKU)
3. Xem kết quả

**Kết quả mong đợi**:
- ✅ Kết quả được filter theo từ khóa (tên hoặc SKU)
- ✅ Hiển thị "Không tìm thấy sản phẩm nào." nếu không có kết quả
- ✅ Search có debounce (không gọi API liên tục khi gõ)

DONE

### TC-M5-04: Thêm một sản phẩm vào bộ sưu tập
**Mục đích**: Kiểm tra chức năng thêm sản phẩm đơn lẻ

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập
2. Click button "Thêm sản phẩm"
3. Nhập từ khóa tìm kiếm sản phẩm
4. Chọn một sản phẩm từ danh sách kết quả
5. Click "Thêm (1)"
6. Đợi thêm hoàn tất

**Kết quả mong đợi**:
- ✅ Modal "Thêm sản phẩm vào bộ sưu tập" mở ra
- ✅ Có ô tìm kiếm sản phẩm
- ✅ Danh sách sản phẩm được filter (chỉ hiển thị sản phẩm chưa có trong collection)
- ✅ Có checkbox để chọn sản phẩm
- ✅ Click "Thêm": sản phẩm được thêm vào collection
- ✅ Hiển thị toast "Đã thêm 1 sản phẩm vào bộ sưu tập."
- ✅ Modal đóng lại
- ✅ Danh sách sản phẩm được refresh, sản phẩm mới xuất hiện

DONE

### TC-M5-05: Thêm nhiều sản phẩm cùng lúc
**Mục đích**: Kiểm tra thêm nhiều sản phẩm hàng loạt

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập
2. Click button "Thêm sản phẩm"
3. Nhập từ khóa tìm kiếm
4. Chọn nhiều sản phẩm (check nhiều checkbox)
5. Click "Thêm (X)" (X = số sản phẩm đã chọn)
6. Đợi thêm hoàn tất

**Kết quả mong đợi**:
- ✅ Có thể chọn nhiều sản phẩm cùng lúc
- ✅ Button "Thêm" hiển thị số lượng sản phẩm đã chọn
- ✅ Tất cả sản phẩm được thêm thành công
- ✅ Hiển thị toast "Đã thêm X sản phẩm vào bộ sưu tập."
- ✅ Danh sách được refresh với tất cả sản phẩm mới

DONE

### TC-M5-06: Xóa một sản phẩm khỏi bộ sưu tập
**Mục đích**: Kiểm tra chức năng xóa sản phẩm đơn lẻ

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có ít nhất 1 sản phẩm
2. Click vào icon trash (🗑️) ở cột "Thao tác" của một sản phẩm
3. Xác nhận trong dialog

**Kết quả mong đợi**:
- ✅ Hiển thị dialog xác nhận: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi bộ sưu tập?"
- ✅ Nếu confirm: sản phẩm bị xóa khỏi danh sách
- ✅ Hiển thị toast "Đã xóa sản phẩm khỏi bộ sưu tập."
- ✅ Danh sách được refresh
- ✅ Nếu cancel: không có gì xảy ra

DONE

### TC-M5-07: Xóa nhiều sản phẩm cùng lúc (Bulk Delete)
**Mục đích**: Kiểm tra chức năng xóa hàng loạt

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có ít nhất 2 sản phẩm
2. Chọn nhiều sản phẩm bằng checkbox (hoặc click "Chọn tất cả")
3. Click button "Xóa (X)" ở header
4. Xác nhận trong dialog

**Kết quả mong đợi**:
- ✅ Có thể chọn nhiều sản phẩm bằng checkbox
- ✅ Checkbox "Chọn tất cả" ở header cho phép chọn/bỏ chọn tất cả
- ✅ Button "Xóa" hiển thị số lượng sản phẩm đã chọn
- ✅ Hiển thị dialog xác nhận với số lượng sản phẩm
- ✅ Nếu confirm: tất cả sản phẩm đã chọn bị xóa
- ✅ Hiển thị toast "Đã xóa X sản phẩm khỏi bộ sưu tập."
- ✅ Danh sách được refresh
- ✅ Checkbox được reset

DONE

### TC-M5-08: Sắp xếp lại thứ tự bằng drag & drop
**Mục đích**: Kiểm tra chức năng drag & drop để sắp xếp

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có ít nhất 3 sản phẩm
2. Kéo một sản phẩm (không phải sản phẩm đầu tiên) lên trên
3. Thả vào vị trí mới

**Kết quả mong đợi**:
- ✅ Khi kéo: sản phẩm có opacity giảm (50%)
- ✅ Khi hover vào vị trí khác: sản phẩm được di chuyển đến vị trí đó (visual feedback)
- ✅ Khi thả: sản phẩm được sắp xếp lại
- ✅ Hiển thị toast "Đã sắp xếp lại thứ tự sản phẩm."
- ✅ Refresh trang: thứ tự được lưu đúng
- ✅ Thứ tự hiển thị đúng trong public collection page

DONE

### TC-M5-09: Drag & drop với lỗi mạng (Negative Test)
**Mục đích**: Kiểm tra xử lý lỗi khi reorder

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có ít nhất 2 sản phẩm
2. Mở DevTools → Network tab → Throttle: Offline
3. Kéo một sản phẩm để sắp xếp lại
4. Thả vào vị trí mới

**Kết quả mong đợi**:
- ✅ Hiển thị toast lỗi: "Không thể sắp xếp lại thứ tự."
- ✅ Thứ tự sản phẩm được khôi phục về trạng thái ban đầu
- ✅ Không có lỗi crash

DONE

### TC-M5-10: Thêm sản phẩm đã có trong collection (Negative Test)
**Mục đích**: Kiểm tra validation khi thêm sản phẩm trùng

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập
2. Click "Thêm sản phẩm"
3. Tìm kiếm một sản phẩm đã có trong collection
4. Cố gắng chọn và thêm sản phẩm đó

**Kết quả mong đợi**:
- ✅ Sản phẩm đã có trong collection không xuất hiện trong danh sách tìm kiếm
- ✅ Hoặc nếu xuất hiện và cố gắng thêm: hiển thị toast lỗi "Sản phẩm đã có trong bộ sưu tập."

DONE

### TC-M5-11: Pagination
**Mục đích**: Kiểm tra phân trang

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có nhiều sản phẩm (>20)
2. Xem pagination ở cuối trang
3. Click "Sau" để chuyển trang
4. Click "Trước" để quay lại

**Kết quả mong đợi**:
- ✅ Hiển thị "Hiển thị X / Y sản phẩm"
- ✅ Hiển thị "Trang X / Y"
- ✅ Button "Trước" disabled ở trang đầu
- ✅ Button "Sau" disabled ở trang cuối
- ✅ Chuyển trang thành công, danh sách được load đúng

DONE

### TC-M5-12: Kiểm tra UI/UX
**Mục đích**: Kiểm tra giao diện và trải nghiệm người dùng

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập
2. Kiểm tra các elements UI

**Kết quả mong đợi**:
- ✅ Bảng có border, hover effect trên mỗi row
- ✅ Checkbox hoạt động đúng
- ✅ Drag handle (GripVertical icon) hiển thị rõ ràng
- ✅ Button "Thêm sản phẩm" nổi bật
- ✅ Button "Xóa" chỉ hiển thị khi có sản phẩm được chọn
- ✅ Modal add products có background đen mờ, button X rõ ràng
- ✅ Toast notifications hiển thị đúng vị trí và tự động ẩn
- ✅ Loading states hiển thị khi đang xử lý

DONE

### TC-M5-13: Kiểm tra quyền truy cập
**Mục đích**: Kiểm tra bảo mật

**Các bước**:
1. Đăng xuất khỏi tài khoản ADMIN
2. Truy cập trực tiếp URL: `/admin/collections/1/products`

**Kết quả mong đợi**:
- ✅ Redirect về trang login
- ✅ Không thể truy cập trang quản lý sản phẩm

DONE

### TC-M5-14: Kiểm tra với bộ sưu tập không tồn tại
**Mục đích**: Kiểm tra xử lý lỗi khi collectionId không hợp lệ

**Các bước**:
1. Đăng nhập với tài khoản ADMIN
2. Truy cập URL: `/admin/collections/99999/products` (ID không tồn tại)

**Kết quả mong đợi**:
- ✅ Hiển thị toast lỗi: "Không thể tải thông tin bộ sưu tập."
- ✅ Hoặc redirect về `/admin/collections`
- ✅ Không có lỗi crash

DONE

### TC-M5-15: Kiểm tra với collection rỗng
**Mục đích**: Kiểm tra hiển thị khi collection chưa có sản phẩm

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập mới (chưa có sản phẩm)
2. Xem giao diện

**Kết quả mong đợi**:
- ✅ Hiển thị message "Chưa có sản phẩm nào trong bộ sưu tập."
- ✅ Có button "Thêm sản phẩm" để bắt đầu
- ✅ Không có lỗi

DONE

### TC-M5-16: Kiểm tra performance với nhiều sản phẩm
**Mục đích**: Kiểm tra hiệu năng khi có nhiều sản phẩm

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập có 50+ sản phẩm
2. Thực hiện các thao tác: drag & drop, search, add, delete

**Kết quả mong đợi**:
- ✅ Danh sách load nhanh với pagination
- ✅ Drag & drop mượt mà
- ✅ Search phản hồi nhanh
- ✅ Các thao tác phản hồi nhanh
- ✅ Không có memory leak

CHƯA TEST

### TC-M5-17: Kiểm tra responsive design
**Mục đích**: Kiểm tra giao diện trên các kích thước màn hình khác nhau

**Các bước**:
1. Vào trang quản lý sản phẩm của một bộ sưu tập
2. Thay đổi kích thước cửa sổ trình duyệt:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Kết quả mong đợi**:
- ✅ Bảng responsive (có thể scroll ngang trên mobile)
- ✅ Modal add products responsive
- ✅ Tất cả buttons và text đọc được
- ✅ Layout không bị vỡ

---

## Checklist tổng hợp

### Chức năng cơ bản
- [ ] Xem danh sách sản phẩm trong collection
- [ ] Tìm kiếm sản phẩm
- [ ] Thêm sản phẩm (đơn lẻ và hàng loạt)
- [ ] Xóa sản phẩm (đơn lẻ và hàng loạt)
- [ ] Sắp xếp lại thứ tự bằng drag & drop

### Validation
- [ ] Không cho thêm sản phẩm trùng
- [ ] Hiển thị thông báo lỗi rõ ràng
- [ ] Xác nhận trước khi xóa

### Edge cases
- [ ] Collection rỗng
- [ ] Collection không tồn tại
- [ ] Drag & drop với lỗi mạng
- [ ] Quyền truy cập (chưa đăng nhập)

### UI/UX
- [ ] Giao diện đẹp, nhất quán
- [ ] Responsive design
- [ ] Loading states
- [ ] Toast notifications
- [ ] Confirmation dialogs

### Performance
- [ ] Load nhanh với nhiều sản phẩm
- [ ] Drag & drop mượt mà
- [ ] Search có debounce
- [ ] Không có memory leak

---

## Ghi chú
- Thứ tự sản phẩm được lưu trong database (field `position` trong bảng `collection_products`)
- Khi thêm sản phẩm mới, sản phẩm được thêm vào cuối danh sách
- Khi xóa sản phẩm, các sản phẩm còn lại được tự động reorder
- Thứ tự sản phẩm trong admin page phải khớp với thứ tự hiển thị trong public collection page

---

## Kết quả test
- **Ngày test**: ___________
- **Người test**: ___________
- **Môi trường**: Development / Staging / Production
- **Kết quả tổng thể**: ✅ Pass / ❌ Fail / ⚠️ Có vấn đề nhỏ

### Vấn đề phát hiện:
1. ___________
2. ___________
3. ___________

