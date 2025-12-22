# Test Guide - M9: Quản lý Yêu cầu Đổi trả (Return Requests)

## Tổng quan
Trang `/admin/returns` cho phép admin:
- Xem danh sách yêu cầu đổi trả, filter theo trạng thái
- Chọn nhiều yêu cầu và bulk cập nhật trạng thái (Duyệt / Từ chối)
- Xem chi tiết từng yêu cầu (lý do, ghi chú, items, ảnh bằng chứng)

## Điều kiện tiên quyết
1. Đăng nhập tài khoản ADMIN
2. Có sẵn một số yêu cầu đổi trả ở các trạng thái khác nhau (REQUESTED, APPROVED, REJECTED, REFUND_PENDING, REFUNDED)
3. Trình duyệt có thể truy cập `/admin/returns`

## Test cases

### TC-M9-01: Hiển thị danh sách và filter trạng thái
**Bước:**
1. Mở `/admin/returns`
2. Chọn filter “Yêu cầu đổi trả” (REQUESTED)
3. Chọn filter “Đã chấp nhận” (APPROVED)
4. Chọn “Tất cả”
**Kỳ vọng:**
- Hiển thị danh sách đúng với trạng thái đã chọn
- Pagination hoạt động, hiển thị số trang chính xác

DONE

### TC-M9-02: Bulk duyệt (APPROVED) nhiều yêu cầu
**Bước:**
1. Filter “Yêu cầu đổi trả”
2. Tick chọn >= 2 yêu cầu đang REQUESTED
3. Bấm “Duyệt”
4. Xác nhận trên dialog
**Kỳ vọng:**
- Không lỗi, toast “Đã cập nhật trạng thái.”
- Danh sách refresh, các yêu cầu vừa chọn chuyển sang APPROVED
- Checkbox được reset

DONE

### TC-M9-03: Bulk từ chối (REJECTED) nhiều yêu cầu
**Bước:**
1. Filter “Yêu cầu đổi trả”
2. Chọn >= 2 yêu cầu REQUESTED
3. Bấm “Từ chối”
4. Xác nhận
**Kỳ vọng:**
- Toast thành công, danh sách refresh, trạng thái chuyển REJECTED

DONE

### TC-M9-04: Bulk khi không chọn yêu cầu (Negative)
**Bước:**
1. Không chọn dòng nào
2. Bấm “Duyệt” hoặc “Từ chối”
**Kỳ vọng:**
- Hiển thị toast lỗi “Vui lòng chọn ít nhất một yêu cầu.”
- Không call API

DONE

### TC-M9-05: Xem chi tiết yêu cầu đổi trả
**Bước:**
1. Click “Xem chi tiết” trên một yêu cầu
2. Quan sát modal
**Kỳ vọng:**
- Hiển thị: mã đơn, trạng thái, lý do, ghi chú (nếu có), danh sách sản phẩm (tên, SL, ảnh, line total)
- Nếu có evidenceUrls: danh sách link ảnh, mở được tab mới

DONE

### TC-M9-06: Pagination
**Bước:**
1. Với danh sách > 1 trang, bấm “Sau” / “Trước”
2. Kiểm tra số trang hiển thị
**Kỳ vọng:**
- Chuyển trang đúng, hiển thị dữ liệu trang hiện tại

DONE

### TC-M9-07: Loading state
**Bước:**
1. Quan sát khi fetch danh sách (lần đầu hoặc đổi filter)
**Kỳ vọng:**
- (Nếu có) loading indicator; UI không crash; checkbox reset khi load xong

DONE

### TC-M9-08: Lỗi mạng/API (Negative)
**Bước:**
1. Ngắt mạng hoặc mock lỗi 500 khi load list hoặc bulk update
**Kỳ vọng:**
- Hiển thị toast lỗi: “Không thể tải danh sách đổi trả.” hoặc “Không thể cập nhật trạng thái.”
- Không crash, có thể thử lại

DONE

## Checklist
- [ ] Filter trạng thái hoạt động
- [ ] Bulk Duyệt hoạt động, reset selection
- [ ] Bulk Từ chối hoạt động, reset selection
- [ ] Toast hiển thị đúng thông điệp lỗi/thành công
- [ ] Modal chi tiết hiển thị đủ thông tin (reason, note, items, evidence)
- [ ] Pagination hoạt động
- [ ] Xử lý lỗi mạng/API không crash

## Ghi chú
- Bulk update hiện hỗ trợ hai trạng thái: APPROVED và REJECTED
- Chưa bao gồm bulk REFUND_PENDING/REFUNDED (nếu bổ sung sau cần thêm test)
- Evidence hiển thị dưới dạng link; cần mở tab mới để xem ảnh

