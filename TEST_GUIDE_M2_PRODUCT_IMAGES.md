# Test Guide - M2: Quản lý Hình ảnh Sản phẩm

## Tổng quan
Module này cho phép admin quản lý hình ảnh của sản phẩm: upload, sắp xếp thứ tự, đặt ảnh chính, xóa ảnh.

## Điều kiện tiên quyết
1. Đã đăng nhập với tài khoản ADMIN
2. Đã có ít nhất 1 sản phẩm trong hệ thống
3. Có sẵn một số file ảnh để test (JPG, PNG, max 5MB mỗi file)

## Các test case

### TC-M2-01: Truy cập trang quản lý ảnh từ danh sách sản phẩm
**Mục đích**: Kiểm tra navigation đến trang quản lý ảnh

**Các bước**:
1. Đăng nhập với tài khoản ADMIN
2. Vào `/admin/products`
3. Tìm một sản phẩm bất kỳ trong danh sách
4. Click vào button "Quản lý ảnh" ở cột "Thao tác"

**Kết quả mong đợi**:
- ✅ Chuyển đến trang `/admin/products/{productId}/images`
- ✅ Hiển thị tên sản phẩm ở header
- ✅ Có link "← Quay lại danh sách sản phẩm"
- ✅ Có button "Chỉnh sửa sản phẩm"

DONE

### TC-M2-02: Upload một ảnh đơn lẻ
**Mục đích**: Kiểm tra upload ảnh thành công

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Click vào upload zone hoặc kéo thả một file ảnh vào zone
3. Chọn một file ảnh (JPG hoặc PNG, < 5MB)
4. Đợi upload hoàn tất

**Kết quả mong đợi**:
- ✅ Ảnh được upload thành công
- ✅ Ảnh hiển thị trong grid với badge "#1"
- ✅ Ảnh đầu tiên tự động được đặt làm ảnh chính (có badge star)
- ✅ Hiển thị toast "Đã upload 1 ảnh thành công"
- ✅ Upload zone trở về trạng thái bình thường

DONE

### TC-M2-03: Upload nhiều ảnh cùng lúc
**Mục đích**: Kiểm tra upload nhiều ảnh cùng lúc

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Click vào upload zone
3. Chọn nhiều file ảnh cùng lúc (Ctrl+Click hoặc Shift+Click)
4. Đợi upload hoàn tất

**Kết quả mong đợi**:
- ✅ Tất cả ảnh được upload thành công
- ✅ Ảnh hiển thị trong grid theo thứ tự upload
- ✅ Badge số thứ tự hiển thị đúng (#1, #2, #3...)
- ✅ Chỉ ảnh đầu tiên có badge star (ảnh chính)
- ✅ Hiển thị toast "Đã upload X ảnh thành công" (X = số ảnh)

DONE

### TC-M2-04: Upload bằng drag & drop
**Mục đích**: Kiểm tra upload bằng cách kéo thả file

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Mở File Explorer/Finder
3. Kéo một hoặc nhiều file ảnh vào upload zone
4. Thả file vào zone

**Kết quả mong đợi**:
- ✅ Upload zone highlight khi kéo file vào
- ✅ Ảnh được upload thành công khi thả
- ✅ Hiển thị toast thành công

DONE

### TC-M2-05: Upload file không phải ảnh (Negative Test)
**Mục đích**: Kiểm tra validation file type

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Click vào upload zone
3. Chọn một file không phải ảnh (ví dụ: .txt, .pdf, .doc)

**Kết quả mong đợi**:
- ✅ Hiển thị toast lỗi: "File {filename} không phải là hình ảnh"
- ✅ File không được upload
- ✅ Không có ảnh mới xuất hiện trong grid

DONE

### TC-M2-06: Upload file quá lớn (Negative Test)
**Mục đích**: Kiểm tra validation file size

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Click vào upload zone
3. Chọn một file ảnh có kích thước > 5MB

**Kết quả mong đợi**:
- ✅ Hiển thị toast lỗi: "File {filename} vượt quá 5MB"
- ✅ File không được upload
- ✅ Không có ảnh mới xuất hiện trong grid

DONE

### TC-M2-07: Xem preview ảnh lớn
**Mục đích**: Kiểm tra chức năng preview ảnh

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm có ít nhất 1 ảnh
2. Click vào một ảnh trong grid

**Kết quả mong đợi**:
- ✅ Mở modal preview với ảnh lớn
- ✅ Ảnh hiển thị đầy đủ, không bị crop
- ✅ Có button X ở góc trên bên phải để đóng modal
- ✅ Click vào background đen cũng đóng modal
- ✅ Nếu là ảnh chính, hiển thị badge "Ảnh chính" ở góc dưới bên trái

DONE

### TC-M2-08: Đặt ảnh làm ảnh chính
**Mục đích**: Kiểm tra chức năng set primary

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm có ít nhất 2 ảnh
2. Hover vào một ảnh không phải ảnh chính
3. Click vào button star (đặt làm ảnh chính)

**Kết quả mong đợi**:
- ✅ Ảnh được đặt làm ảnh chính
- ✅ Badge star xuất hiện ở góc trên bên phải của ảnh đó
- ✅ Badge star biến mất khỏi ảnh chính cũ
- ✅ Hiển thị toast "Đã đặt làm ảnh chính"
- ✅ Button star biến mất khỏi ảnh mới (vì đã là ảnh chính)

DONE

### TC-M2-09: Xóa ảnh
**Mục đích**: Kiểm tra chức năng xóa ảnh

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm có ít nhất 1 ảnh
2. Hover vào một ảnh
3. Click vào button trash (xóa)
4. Xác nhận trong dialog

**Kết quả mong đợi**:
- ✅ Hiển thị dialog xác nhận: "Bạn có chắc chắn muốn xóa ảnh này?"
- ✅ Nếu confirm: ảnh bị xóa khỏi grid
- ✅ Hiển thị toast "Đã xóa ảnh thành công"
- ✅ Nếu là ảnh chính và còn ảnh khác: ảnh đầu tiên tự động trở thành ảnh chính
- ✅ Nếu cancel: không có gì xảy ra

DONE

### TC-M2-10: Xóa ảnh chính cuối cùng
**Mục đích**: Kiểm tra logic khi xóa ảnh chính cuối cùng

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm có đúng 1 ảnh (ảnh chính)
2. Hover vào ảnh
3. Click vào button trash
4. Xác nhận xóa

**Kết quả mong đợi**:
- ✅ Ảnh được xóa thành công
- ✅ Grid trống, hiển thị message "Chưa có ảnh nào. Hãy upload ảnh để bắt đầu."
- ✅ Không có lỗi xảy ra

DONE

### TC-M2-11: Sắp xếp lại thứ tự bằng drag & drop
**Mục đích**: Kiểm tra chức năng drag & drop để sắp xếp

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm có ít nhất 3 ảnh
2. Kéo một ảnh (không phải ảnh đầu tiên) lên trên
3. Thả vào vị trí mới

**Kết quả mong đợi**:
- ✅ Khi kéo: ảnh có opacity giảm (50%)
- ✅ Khi hover vào vị trí khác: ảnh được di chuyển đến vị trí đó
- ✅ Khi thả: ảnh được sắp xếp lại
- ✅ Badge số thứ tự được cập nhật (#1, #2, #3...)
- ✅ Hiển thị toast "Đã sắp xếp lại thứ tự ảnh"
- ✅ Refresh trang: thứ tự được lưu đúng

DONE

### TC-M2-12: Drag & drop với lỗi mạng (Negative Test)
**Mục đích**: Kiểm tra xử lý lỗi khi reorder

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm có ít nhất 2 ảnh
2. Mở DevTools → Network tab → Throttle: Offline
3. Kéo một ảnh để sắp xếp lại
4. Thả vào vị trí mới

**Kết quả mong đợi**:
- ✅ Hiển thị toast lỗi: "Không thể sắp xếp lại thứ tự. Đã khôi phục."
- ✅ Thứ tự ảnh được khôi phục về trạng thái ban đầu
- ✅ Không có lỗi crash

DONE

### TC-M2-13: Upload khi đang upload (Negative Test)
**Mục đích**: Kiểm tra xử lý khi upload nhiều lần liên tiếp

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Click vào upload zone và chọn file
3. Ngay lập tức (trước khi upload xong) click lại và chọn file khác

**Kết quả mong đợi**:
- ✅ Upload zone disabled khi đang upload
- ✅ Hiển thị "Đang upload..." trong upload zone
- ✅ Upload đầu tiên hoàn tất trước khi bắt đầu upload thứ hai
- ✅ Hoặc cả hai upload đều thành công

DONE

### TC-M2-14: Kiểm tra UI/UX
**Mục đích**: Kiểm tra giao diện và trải nghiệm người dùng

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Kiểm tra các elements UI

**Kết quả mong đợi**:
- ✅ Upload zone có border dashed, hover effect
- ✅ Grid responsive: 2 cột (mobile), 3 cột (tablet), 4 cột (desktop)
- ✅ Mỗi ảnh có:
  - Drag handle (GripVertical icon) ở góc trên bên trái khi hover
  - Badge số thứ tự ở góc dưới bên trái
  - Badge star nếu là ảnh chính ở góc trên bên phải
  - Actions (star, preview, delete) khi hover
- ✅ Preview modal có background đen mờ, button X rõ ràng
- ✅ Toast notifications hiển thị đúng vị trí và tự động ẩn

DONE

### TC-M2-15: Kiểm tra quyền truy cập
**Mục đích**: Kiểm tra bảo mật

**Các bước**:
1. Đăng xuất khỏi tài khoản ADMIN
2. Truy cập trực tiếp URL: `/admin/products/1/images`

**Kết quả mong đợi**:
- ✅ Redirect về trang login
- ✅ Không thể truy cập trang quản lý ảnh

DONE

### TC-M2-16: Kiểm tra với sản phẩm không tồn tại
**Mục đích**: Kiểm tra xử lý lỗi khi productId không hợp lệ

**Các bước**:
1. Đăng nhập với tài khoản ADMIN
2. Truy cập URL: `/admin/products/99999/images` (ID không tồn tại)

**Kết quả mong đợi**:
- ✅ Hiển thị toast lỗi: "Không thể tải dữ liệu."
- ✅ Redirect về `/admin/products`
- ✅ Không có lỗi crash

DONE

### TC-M2-17: Kiểm tra performance với nhiều ảnh
**Mục đích**: Kiểm tra hiệu năng khi có nhiều ảnh

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Upload 20+ ảnh
3. Thực hiện các thao tác: drag & drop, set primary, delete

**Kết quả mong đợi**:
- ✅ Grid load nhanh, không lag
- ✅ Drag & drop mượt mà
- ✅ Các thao tác phản hồi nhanh
- ✅ Không có memory leak

---

### TC-M2-18: Kiểm tra responsive design
**Mục đích**: Kiểm tra giao diện trên các kích thước màn hình khác nhau

**Các bước**:
1. Vào trang quản lý ảnh của một sản phẩm
2. Thay đổi kích thước cửa sổ trình duyệt:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)

**Kết quả mong đợi**:
- ✅ Grid tự động điều chỉnh số cột
- ✅ Upload zone responsive
- ✅ Preview modal responsive
- ✅ Tất cả buttons và text đọc được

---

## Checklist tổng hợp

### Chức năng cơ bản
- [ ] Upload một ảnh
- [ ] Upload nhiều ảnh cùng lúc
- [ ] Upload bằng drag & drop
- [ ] Xem preview ảnh lớn
- [ ] Đặt ảnh làm ảnh chính
- [ ] Xóa ảnh
- [ ] Sắp xếp lại thứ tự bằng drag & drop

### Validation
- [ ] Reject file không phải ảnh
- [ ] Reject file quá lớn (>5MB)
- [ ] Hiển thị thông báo lỗi rõ ràng

### Edge cases
- [ ] Xóa ảnh chính cuối cùng
- [ ] Upload khi đang upload
- [ ] Drag & drop với lỗi mạng
- [ ] Sản phẩm không tồn tại
- [ ] Quyền truy cập (chưa đăng nhập)

### UI/UX
- [ ] Giao diện đẹp, nhất quán
- [ ] Responsive design
- [ ] Loading states
- [ ] Toast notifications
- [ ] Confirmation dialogs

### Performance
- [ ] Load nhanh với nhiều ảnh
- [ ] Drag & drop mượt mà
- [ ] Không có memory leak

---

## Ghi chú
- Tất cả ảnh được upload lên Cloudinary và lưu trong folder `fashionvista/products`
- Khi xóa ảnh, ảnh cũng bị xóa khỏi Cloudinary
- Thứ tự ảnh được lưu trong database (field `order`)
- Ảnh chính được đánh dấu bằng field `isPrimary`

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

