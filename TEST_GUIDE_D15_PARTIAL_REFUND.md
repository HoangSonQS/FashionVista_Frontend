# Hướng dẫn Test D15: Partial Refund (Hoàn tiền một phần)

**Ngày tạo:** 2025-01-27  
**Tính năng:** Hoàn tiền một phần cho đơn hàng đã thanh toán

---

## 📋 Tổng quan

Tính năng cho phép admin hoàn tiền một phần hoặc toàn bộ cho đơn hàng đã thanh toán (PAID), với các tính năng:
- Chọn items cụ thể để hoàn tiền (tùy chọn)
- Nhập số tiền hoàn
- Chọn phương thức hoàn tiền (Hoàn về phương thức gốc / Hoàn tiền mặt)
- Nhập lý do hoàn tiền
- Xem lịch sử hoàn tiền

---

## 🔧 Chuẩn bị

### 1. Backend
- Đảm bảo migration `V7__create_refunds_and_add_refund_amount.sql` đã chạy
- Backend đang chạy tại `http://localhost:8085`

### 2. Frontend
- Frontend đang chạy tại `http://localhost:5173`
- Đăng nhập với tài khoản Admin

### 3. Dữ liệu test
- Cần có ít nhất 1 đơn hàng với `paymentStatus = PAID`
- Đơn hàng có ít nhất 2 items để test partial refund

---

## ✅ Test Cases

### Test Case 1: Hoàn tiền toàn bộ đơn hàng

**Mục tiêu:** Kiểm tra hoàn tiền toàn bộ đơn hàng

**Các bước:**
1. Vào trang **Admin Orders** (`/admin/orders`)
2. Tìm một đơn hàng có `paymentStatus = PAID`
3. Click nút **"Cập nhật"** để mở modal
4. Kiểm tra nút **"Hoàn tiền"** xuất hiện (chỉ hiện khi `paymentStatus = PAID`)
5. Click nút **"Hoàn tiền"**
6. Modal hoàn tiền mở ra
7. **Không chọn** items nào (để hoàn toàn bộ)
8. Nhập số tiền = tổng tiền đơn hàng
9. Chọn phương thức: **"Hoàn về phương thức gốc"**
10. Nhập lý do: "Khách hàng yêu cầu hủy đơn"
11. Click **"Xác nhận hoàn tiền"**

**Kết quả mong đợi:**
- ✅ Toast hiển thị: "Hoàn tiền thành công."
- ✅ Modal đóng lại
- ✅ Order status chuyển thành `REFUNDED`
- ✅ Payment status chuyển thành `REFUNDED`
- ✅ Lịch sử refund hiển thị trong modal khi mở lại
- ✅ Order history có log: "refund" với thông tin hoàn tiền

**Kiểm tra Database:**
```sql
-- Kiểm tra refund record
SELECT * FROM refunds WHERE order_id = <order_id>;

-- Kiểm tra payment refund_amount
SELECT id, amount, refund_amount, payment_status 
FROM payments 
WHERE order_id = <order_id>;

-- Kiểm tra order status
SELECT id, status, payment_status 
FROM orders 
WHERE id = <order_id>;
```
DONE
---

### Test Case 2: Hoàn tiền một phần (chọn items)

**Mục tiêu:** Kiểm tra hoàn tiền một phần khi chọn items cụ thể

**Các bước:**
1. Vào trang **Admin Orders**
2. Tìm một đơn hàng có `paymentStatus = PAID` và có ít nhất 2 items
3. Click **"Cập nhật"** → **"Hoàn tiền"**
4. **Chọn 1 item** trong danh sách sản phẩm (checkbox)
5. Nhập số tiền = giá trị của item đã chọn
6. Chọn phương thức: **"Hoàn tiền mặt"**
7. Nhập lý do: "Sản phẩm bị lỗi, hoàn tiền cho item này"
8. Click **"Xác nhận hoàn tiền"**

**Kết quả mong đợi:**
- ✅ Toast hiển thị: "Hoàn tiền thành công."
- ✅ Payment status chuyển thành `REFUND_PENDING` (nếu chưa hoàn hết)
- ✅ Order status vẫn giữ nguyên (chưa REFUNDED)
- ✅ Refund record có `refunded_item_ids` chứa ID của item đã chọn
- ✅ `payment.refund_amount` = số tiền đã hoàn

**Kiểm tra Database:**
```sql
-- Kiểm tra refunded_item_ids
SELECT id, amount, refunded_item_ids 
FROM refunds 
WHERE order_id = <order_id>;
-- refunded_item_ids phải là JSON array: [<item_id>]
```

---

### Test Case 3: Hoàn tiền nhiều lần (tích lũy)

**Mục tiêu:** Kiểm tra có thể hoàn tiền nhiều lần cho cùng một đơn

**Các bước:**
1. Tạo refund lần 1: Hoàn 50,000 VND
2. Mở lại modal hoàn tiền
3. Kiểm tra **"Lịch sử hoàn tiền"** hiển thị refund lần 1
4. Tạo refund lần 2: Hoàn thêm 30,000 VND
5. Mở lại modal hoàn tiền
6. Kiểm tra lịch sử có 2 refunds

**Kết quả mong đợi:**
- ✅ Lịch sử refund hiển thị đầy đủ các lần hoàn
- ✅ `payment.refund_amount` = tổng các lần hoàn (80,000 VND)
- ✅ Nếu tổng refund = payment amount → status = `REFUNDED`
- ✅ Nếu tổng refund < payment amount → status = `REFUND_PENDING`

---
DONE 

### Test Case 4: Validation - Số tiền vượt quá tổng đơn

**Mục tiêu:** Kiểm tra validation không cho hoàn quá số tiền đã thanh toán

**Các bước:**
1. Mở modal hoàn tiền
2. Nhập số tiền = `order.total + 10000` (vượt quá)
3. Click **"Xác nhận hoàn tiền"**

**Kết quả mong đợi:**
- ✅ Toast hiển thị: "Số tiền hoàn không được vượt quá tổng tiền đơn hàng."
- ✅ Refund không được tạo
- ✅ Database không có record mới

---
Done

### Test Case 5: Validation - Số tiền không hợp lệ

**Mục tiêu:** Kiểm tra validation số tiền

**Các bước:**
1. Mở modal hoàn tiền
2. Để trống số tiền hoặc nhập 0 hoặc số âm
3. Click **"Xác nhận hoàn tiền"**

**Kết quả mong đợi:**
- ✅ Button bị disable khi số tiền trống/0
- ✅ Toast hiển thị: "Vui lòng nhập số tiền hoàn hợp lệ."
- ✅ Refund không được tạo

---
DONE

### Test Case 6: Hoàn tiền khi đơn chưa thanh toán

**Mục tiêu:** Kiểm tra không cho hoàn tiền khi đơn chưa thanh toán

**Các bước:**
1. Tìm đơn hàng có `paymentStatus = PENDING` hoặc `FAILED`
2. Click **"Cập nhật"**
3. Kiểm tra nút **"Hoàn tiền"** không xuất hiện

**Kết quả mong đợi:**
- ✅ Nút "Hoàn tiền" không hiển thị
- ✅ Chỉ đơn `PAID` mới có nút hoàn tiền

---
DONEDONE

### Test Case 7: Hiển thị lịch sử refund trong Order Detail

**Mục tiêu:** Kiểm tra lịch sử refund hiển thị đúng trong modal

**Các bước:**
1. Tạo 2-3 refunds cho cùng một đơn
2. Mở modal hoàn tiền
3. Kiểm tra section **"Lịch sử hoàn tiền"**

**Kết quả mong đợi:**
- ✅ Hiển thị tất cả refunds theo thứ tự mới nhất trước
- ✅ Mỗi refund hiển thị: số tiền, ngày giờ, lý do (nếu có)
- ✅ Format số tiền đúng (VND)
- ✅ Format ngày giờ đúng (vi-VN)

---
DONEDONE

### Test Case 8: Chọn/Bỏ chọn items

**Mục tiêu:** Kiểm tra UI chọn items hoạt động đúng

**Các bước:**
1. Mở modal hoàn tiền
2. Chọn item 1 → checkbox checked
3. Chọn item 2 → checkbox checked
4. Bỏ chọn item 1 → checkbox unchecked
5. Kiểm tra `selectedRefundItemIds` chỉ chứa item 2

**Kết quả mong đợi:**
- ✅ Checkbox hoạt động đúng
- ✅ Có thể chọn/bỏ chọn nhiều items
- ✅ Khi submit, `refunded_item_ids` chứa đúng IDs đã chọn

---
DONE

### Test Case 9: Order History log refund

**Mục tiêu:** Kiểm tra refund được ghi vào Order History

**Các bước:**
1. Tạo refund
2. Mở modal **"Xem chi tiết"** hoặc **"Cập nhật"**
3. Scroll xuống section **"Lịch sử thay đổi"**
4. Tìm entry có `field = "refund"`

**Kết quả mong đợi:**
- ✅ Có entry mới với field = "refund"
- ✅ oldValue = "Đã hoàn: X" (tổng refund trước đó)
- ✅ newValue = "Đã hoàn: Y" (tổng refund sau khi thêm)
- ✅ note = "Hoàn tiền: X VND. Lý do: ..."
- ✅ actor = email của admin thực hiện

---
DONE

### Test Case 10: API Endpoints

**Mục tiêu:** Kiểm tra API endpoints hoạt động đúng

#### 10.1. POST /api/admin/orders/:id/refund

**Request:**
```json
POST /api/admin/orders/1/refund
{
  "amount": 50000,
  "refundMethod": "ORIGINAL",
  "reason": "Sản phẩm bị lỗi",
  "itemIds": [1, 2]
}
```

**Response mong đợi:**
```json
{
  "id": 1,
  "orderNumber": "ORD-20250127-0001",
  "amount": 50000,
  "refundMethod": "ORIGINAL",
  "reason": "Sản phẩm bị lỗi",
  "refundedItemIds": [1, 2],
  "refundedBy": "admin@example.com",
  "createdAt": "2025-01-27T10:30:00"
}
```

#### 10.2. GET /api/admin/orders/:id/refunds

**Request:**
```
GET /api/admin/orders/1/refunds
```

**Response mong đợi:**
```json
[
  {
    "id": 1,
    "orderNumber": "ORD-20250127-0001",
    "amount": 50000,
    "refundMethod": "ORIGINAL",
    "reason": "Sản phẩm bị lỗi",
    "refundedItemIds": [1, 2],
    "refundedBy": "admin@example.com",
    "createdAt": "2025-01-27T10:30:00"
  }
]
```

---

## 🐛 Edge Cases

### Edge Case 1: Refund khi đã refund hết
- Nếu `payment.refund_amount >= payment.amount` → không cho refund thêm
- Backend sẽ throw error: "Tổng số tiền hoàn không được vượt quá..."

### Edge Case 2: Refund với itemIds không tồn tại
- Backend sẽ bỏ qua itemIds không hợp lệ
- Chỉ lưu các itemIds hợp lệ vào `refunded_item_ids`

### Edge Case 3: Refund với số tiền = 0
- Frontend validation sẽ chặn
- Backend validation sẽ throw error

---

## 📊 Checklist Test

- [ ] Test Case 1: Hoàn tiền toàn bộ
- [ ] Test Case 2: Hoàn tiền một phần (chọn items)
- [ ] Test Case 3: Hoàn tiền nhiều lần
- [ ] Test Case 4: Validation số tiền vượt quá
- [ ] Test Case 5: Validation số tiền không hợp lệ
- [ ] Test Case 6: Hoàn tiền khi đơn chưa thanh toán
- [ ] Test Case 7: Hiển thị lịch sử refund
- [ ] Test Case 8: Chọn/Bỏ chọn items
- [ ] Test Case 9: Order History log refund
- [ ] Test Case 10: API Endpoints

---

## 🔍 Kiểm tra Database

Sau khi test, kiểm tra database:

```sql
-- 1. Kiểm tra refunds table
SELECT 
    r.id,
    r.order_id,
    r.amount,
    r.refund_method,
    r.reason,
    r.refunded_item_ids,
    r.refunded_by,
    r.created_at,
    o.order_number
FROM refunds r
JOIN orders o ON r.order_id = o.id
ORDER BY r.created_at DESC;

-- 2. Kiểm tra payment refund_amount
SELECT 
    p.id,
    p.order_id,
    p.amount AS payment_amount,
    p.refund_amount,
    p.payment_status,
    o.order_number
FROM payments p
JOIN orders o ON p.order_id = o.id
WHERE p.refund_amount > 0;

-- 3. Kiểm tra order status sau refund
SELECT 
    o.id,
    o.order_number,
    o.status,
    o.payment_status,
    o.total,
    p.refund_amount
FROM orders o
LEFT JOIN payments p ON o.id = p.order_id
WHERE o.status = 'REFUNDED' OR o.payment_status IN ('REFUND_PENDING', 'REFUNDED');
```

---

## ✅ Kết quả mong đợi

Sau khi hoàn thành tất cả test cases:

1. ✅ UI hoạt động mượt mà, không có lỗi console
2. ✅ Validation hoạt động đúng
3. ✅ Database lưu đúng dữ liệu
4. ✅ Order History ghi log đầy đủ
5. ✅ Payment status cập nhật đúng
6. ✅ Lịch sử refund hiển thị đúng

---

## 📝 Notes

- Refund chỉ áp dụng cho đơn `PAID`
- Refund có thể thực hiện nhiều lần (tích lũy)
- Khi tổng refund = payment amount → status = `REFUNDED`
- Khi tổng refund < payment amount → status = `REFUND_PENDING`
- `refunded_item_ids` là JSON array, có thể null (nếu hoàn toàn bộ)

---

**Người test:** _______________  
**Ngày test:** _______________  
**Kết quả:** ☐ Pass  ☐ Fail  
**Ghi chú:** _______________

