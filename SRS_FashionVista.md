# SRS - Software Requirements Specification

## SIXTHSOUL - Fashion E-commerce Platform

**Version:** 1.0  
**Date:** 2025-01-27  
**Project:** sixthsoul - Website Bán Quần Áo Nữ Cao Cấp

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1. Mục tiêu

Xây dựng nền tảng thương mại điện tử bán quần áo thời trang nữ cao cấp với:

- Trải nghiệm người dùng hiện đại, thanh lịch
- Quản lý sản phẩm, đơn hàng, người dùng hiệu quả
- Hệ thống thanh toán và vận chuyển tích hợp
- Hỗ trợ đa ngôn ngữ và đa tiền tệ (VND)

### 1.2. Phạm vi

- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Spring Boot (Java) + PostgreSQL
- **Database:** PostgreSQL với JPA/Hibernate
- **Authentication:** Spring Security (JWT + OAuth2 Optional)
- **Payment:** Tích hợp cổng thanh toán (VNPay/Momo)

### 1.3. Các Task Đã Hoàn Thành (Completed Tasks)

#### ✅ NHÓM 1: Hoàn thiện Category & SALE (Completed: 2025-01-27)

- **Task A1: Category description từ backend** ✅
  - CategoryPage hiển thị description từ API (`CategorySummary.description`)
  - Fallback text: "Khám phá các thiết kế trong danh mục [Tên category]." khi không có description
  - Implementation: `CategoryPage.tsx` (dòng 72-74)

- **Task A2.1: Badge SALE trên ProductDetail** ✅
  - Badge hiển thị với style: `bg-[#4DA3E8] text-white px-3 py-1 text-xs font-medium tracking-wide`
  - Format: "SALE -X%" (X là phần trăm giảm, làm tròn)
  - Công thức: `Math.round(((compareAtPrice - price) / compareAtPrice) * 100)`
  - Implementation: `ProductDetail.tsx` (dòng 294-298)

- **Task A2.2: Badge SALE thống nhất trên tất cả ProductCard** ✅
  - Tất cả trang sử dụng ProductCard đều hiển thị badge nhất quán:
    - HomePage ✅
    - SalePage ✅
    - CategoryPage ✅
  - CollectionDetail ✅
    - SearchResults ✅
    - ProductList ✅
  - Style thống nhất: `bg-[#4DA3E8] text-white px-3 py-1 text-xs font-medium tracking-wide`
  - Badge hiển thị ở góc trên trái ảnh với format "-X%"
  - Implementation: `ProductCard.tsx` (dòng 47-51)

- **Task A2.3: Công thức tính phần trăm giảm chính xác** ✅
  - Công thức: `Math.round(((compareAtPrice - price) / compareAtPrice) * 100)`
  - Edge cases đã được xử lý:
    - compareAtPrice = 100000, price = 99999 → -0% (không hiển thị badge vì `hasDiscount` chỉ true khi `compareAtPrice > price`)
    - compareAtPrice = 100000, price = 50000 → -50% ✅
  - Badge chỉ hiển thị khi `compareAtPrice > price` và `discountPercent > 0`

#### ✅ NHÓM 2: Củng cố Order UX & Tracking (Completed: 2025-01-27)

- **Task B1.1: Status Timeline hiển thị đúng với mọi status** ✅
  - Timeline hiển thị 5 bước: PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED
  - Indicator màu sắc:
    - Bước hiện tại (active): `bg-[var(--primary)]` (xanh dương)
    - Các bước đã qua (completed): `bg-[var(--success)]` (xanh lá)
    - Các bước chưa đến: `bg-transparent border-[var(--muted-foreground)]` (xám)
    - Đơn bị hủy/hoàn tiền (CANCELLED/REFUNDED): Hiển thị riêng với `bg-[var(--error)]` (đỏ)
  - Test với các status: PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED ✅
  - Implementation: `UserOrderDetail.tsx` (dòng 241-288, đã cải thiện để xử lý CANCELLED/REFUNDED)

- **Task B1.2: Shipping Address parse JSON và hiển thị đúng** ✅
  - Parse JSON string format: `{"fullName":"...","phone":"...","address":"...","ward":"...","district":"...","city":"..."}`
  - Hiển thị: fullName, phone, address, ward/district/city (ghép thành dòng)
  - Fallback về plain text nếu không phải JSON
  - Implementation: `UserOrderDetail.tsx` (dòng 297-318)

- **Task B1.3: Payment Method hiển thị đầy đủ thông tin** ✅
  - Hiển thị phương thức thanh toán:
    - COD → "Thanh toán khi nhận hàng (COD)"
    - VNPAY → "VNPay"
    - MOMO → "MoMo"
  - Hiển thị trạng thái thanh toán với màu sắc:
    - PAID → `text-[var(--success)]` (xanh lá) - "Đã thanh toán"
    - FAILED → `text-[var(--error)]` (đỏ) - "Thanh toán thất bại"
    - PENDING → `text-[var(--warning)]` (vàng) - "Chờ thanh toán"
  - Test với COD, VNPAY, MOMO và các trạng thái PAID, FAILED, PENDING ✅
  - Implementation: `UserOrderDetail.tsx` (dòng 321-359)

- **Task B2.1: Nút "Xem các đơn khác cùng trạng thái" hoạt động** ✅
  - Nút hiển thị trong header của Order Detail
  - Khi click, navigate về `/orders` với state: `{ statusFilter: order.status }`
  - UserOrders.tsx nhận state và tự động set statusFilter dropdown
  - Danh sách đơn được filter theo status đó
  - Implementation: `UserOrderDetail.tsx` (dòng 230-236), `UserOrders.tsx` (dòng 54-56, 88-90)

- **Task B2.2: Filter được giữ khi navigate từ Order Detail về Order List** ✅
  - UserOrders.tsx đọc `locationState?.statusFilter` và set vào state `statusFilter`
  - Filter được áp dụng ngay khi component mount
  - Test filter persistence khi quay lại từ Order Detail ✅
  - Implementation: `UserOrders.tsx` (dòng 46-56, 82-118)

#### ✅ NHÓM 3: Nhỏ nhưng hữu ích - Notifications (Completed: 2025-01-27)

- **Task C1.1: Toast notification hiển thị khi tạo đơn thành công (COD)** ✅
  - Toast hiển thị ở góc dưới bên phải (`fixed bottom-4 right-4`)
  - Message: "Đơn #[orderNumber] đã được tạo, xem chi tiết"
  - Icon: CheckCircle (success type)
  - Nút "Xem đơn" dưới message (underline, hover effect)
  - Duration: 6000ms (6 giây)
  - Có nút X để đóng toast
  - Implementation: `CheckoutPage.tsx` (dòng 264-274), `Toast.tsx` (dòng 21-95)

- **Task C1.2: Nút "Xem đơn" trong toast navigate đúng** ✅
  - Khi click nút "Xem đơn", navigate đến `/orders/[orderNumber]`
  - Toast tự động đóng sau khi click action button
  - Implementation: `CheckoutPage.tsx` (dòng 269-272), `Toast.tsx` (dòng 61-66)

- **Task C1.3: Toast với VNPay payment** ✅
  - Khi chọn VNPay và có paymentUrl, toast hiển thị: "Đang chuyển sang cổng thanh toán VNPay..."
  - Không có toast "Đơn #... đã được tạo" (vì redirect ngay)
  - Redirect đến VNPay payment page ngay sau toast
  - Implementation: `CheckoutPage.tsx` (dòng 258-261)

- **Task C1.4: Toast tự động đóng sau 6 giây** ✅
  - Toast có useEffect với setTimeout dựa trên duration
  - CheckoutPage truyền duration = 6000ms cho toast tạo đơn thành công
  - Toast tự động đóng sau 6 giây với animation mượt mà
  - Implementation: `Toast.tsx` (dòng 21-29), `CheckoutPage.tsx` (dòng 267)

- **Task C1.5: Multiple toasts stack đúng** ✅
  - ToastContainer hiển thị nhiều toast trong flex-col với gap-2
  - Các toast stack theo chiều dọc (từ dưới lên)
  - Mỗi toast có `pointer-events-auto` riêng, có thể đóng riêng bằng nút X
  - Không bị overlap hoặc UI broken
  - Implementation: `ToastContainer.tsx` (dòng 110-131), `useToast.ts` (dòng 6-35)

---

## 2. LUỒNG SỰ KIỆN (EVENT FLOWS)

### 2.1. Luồng hiện có (Đã implement) **✅**

#### 2.1.1. Luồng xem sản phẩm **✅ ĐÃ IMPLEMENT**

User → Home Page → Xem danh sách sản phẩm → Lọc theo category → Xem chi tiết sản phẩm

#### 2.1.2. Luồng giỏ hàng (Local State) **✅ ĐÃ IMPLEMENT**

User → Thêm sản phẩm vào giỏ → Mở giỏ hàng → Cập nhật số lượng → Xóa sản phẩm

### 2.2. Luồng cần bổ sung

#### 2.2.1. Luồng đăng ký/Đăng nhập **✅ ĐÃ IMPLEMENT**

1. **Đăng ký:**  
   User → Click "Đăng ký" → Nhập thông tin → Validate → Tạo tài khoản → Gửi email xác nhận → Đăng nhập tự động

2. **Đăng nhập:**  
   User → Click "Đăng nhập" → Nhập email/password → Validate → Tạo session → Redirect về trang trước

3. **Đăng xuất:**  
   User → Click "Đăng xuất" → Xóa session → Redirect về Home

#### 2.2.2. Luồng xem chi tiết sản phẩm **✅ ĐÃ IMPLEMENT**

User → Click sản phẩm → Product Detail Page → Xem hình ảnh, mô tả, size, màu sắc → Chọn size/màu → Thêm vào giỏ hàng / Mua ngay

#### 2.2.3. Luồng thanh toán **✅ ĐÃ IMPLEMENT (COD + VNPay cơ bản)**

User → Giỏ hàng → Click "Thanh toán" → Checkout Page → Nhập thông tin giao hàng → Chọn phương thức thanh toán → Xác nhận đơn hàng → Chuyển đến cổng thanh toán → Thanh toán thành công → Tạo đơn hàng → Gửi email xác nhận → Redirect về trang "Đơn hàng của tôi"

#### 2.2.4. Luồng quản lý đơn hàng **✅ ĐÃ IMPLEMENT (user xem đơn + hủy đơn)**

User → "Đơn hàng của tôi" → Xem danh sách đơn hàng → Click đơn hàng → Xem chi tiết đơn hàng → Hủy đơn hàng (nếu chưa xử lý) / Theo dõi vận chuyển

#### 2.2.5. Luồng tìm kiếm *(ĐÃ IMPLEMENT: Header Search + ProductList.tsx + /products route)* **✅**

1. User click icon **Search** trên header → ô input tìm kiếm bung rộng từ nút Search về phía logo, tạm ẩn các link `THE NEW / BỘ SƯU TẬP / SALE`.  
2. User nhập từ khóa (tên sản phẩm, loại váy/áo, màu sắc, bộ sưu tập...).  
3. Hệ thống debounce và gọi API `/search/suggestions` → hiển thị tối đa **5 gợi ý sản phẩm** ngay bên dưới input (ảnh + tên).  
4. Nhánh xử lý:
   - User click một gợi ý → đóng thanh search → chuyển thẳng tới **Product Detail** tương ứng (`/products/:slug`).  
   - User nhấn **Enter** hoặc nút "Tìm" → đóng thanh search → điều hướng tới **trang kết quả chung** `/products?search=...`.  
5. Trang `/products` (sử dụng `ProductList.tsx`) đọc query `search` và:
   - Gọi API `/products` với tham số `search` + các filter giá/size/màu/category.
   - Hiển thị danh sách kết quả theo phân trang; user có thể tiếp tục filter/tìm hẹp hơn.
   - Đây là trang kết quả chính cho mọi tìm kiếm full-text (kể cả khi có 1.000+ sản phẩm).  
6. UI gợi ý trong header dùng nền `--background` khi hover để giữ trải nghiệm nhẹ, sáng, không lấn át trang.

#### 2.2.6. Luồng đánh giá sản phẩm **✅ ĐÃ IMPLEMENT (viết + hiển thị review)**

User (đã mua) → Product Detail Page → "Viết đánh giá" → Chọn sao, viết review, upload hình → Submit → Hiển thị review trên trang sản phẩm

#### 2.2.7. Luồng quản lý tài khoản **⏳ MỘT PHẦN (profile, địa chỉ, đơn hàng, wishlist, reviews)**

User → "Tài khoản của tôi" → Xem/Chỉnh sửa thông tin cá nhân → Đổi mật khẩu → Quản lý địa chỉ giao hàng → Xem lịch sử mua hàng → Yêu thích sản phẩm

#### 2.2.8. Luồng Admin (Quản lý) **⏳ MỘT PHẦN (dashboard + CRUD chính, thiếu báo cáo nâng cao)**

Admin → Login → Dashboard → Quản lý sản phẩm (CRUD) → Quản lý đơn hàng (Xem, Cập nhật trạng thái) → Quản lý người dùng → Quản lý danh mục → Thống kê doanh thu

---

## 3. NGHIỆP VỤ CẦN CÓ

### 3.1. Quản lý người dùng (User Management) **⏳ ĐÃ LÀM CƠ BẢN**

#### 3.1.1. Đăng ký/Đăng nhập **✅ ĐÃ IMPLEMENT (email/password, quên mật khẩu)**

- Đăng ký: Email, password, username, họ tên, số điện thoại
- Đăng nhập: Email/Username + Password
- Xác thực email: Gửi link kích hoạt qua email
- Quên mật khẩu: Gửi link reset password
- Đăng nhập bằng Google/Facebook (Tùy chọn)

#### 3.1.2. Quản lý profile **⏳ Hồ sơ + địa chỉ đã có, avatar/1 số mục nâng cao chưa làm**

- Xem/chỉnh sửa thông tin cá nhân
- Đổi mật khẩu
- Upload avatar
- Quản lý địa chỉ giao hàng (nhiều địa chỉ)

### 3.2. Quản lý sản phẩm (Product Management) **⏳ PHẦN LỚN ĐÃ LÀM, MỘT SỐ TÍNH NĂNG NÂNG CAO CHƯA**

#### 3.2.1. Cấu trúc dữ liệu **✅ ĐÃ IMPLEMENT (products + product_variants + attributes JSONB cơ bản)**

- Thông tin cơ bản: tên, slug, SKU, barcode, trạng thái hiển thị, mô tả ngắn/dài.
- Giá: giá niêm yết, giá sale, giá flash sale, đơn vị tiền tệ, lịch áp dụng.
- Tồn kho: tổng stock, stock theo biến thể (size, màu, chất liệu), ngưỡng cảnh báo.
- Media: danh sách hình ảnh, ảnh đại diện, video/360, thứ tự hiển thị.
- Danh mục: category cha/con, collections theo chiến dịch, danh sách tags.
- Thuộc tính mở rộng (EAV): chất liệu, style, season, care instructions, fitting.
- SEO fields: meta title, meta description, keywords, canonical URL.

#### 3.2.2. Nghiệp vụ CRUD **⏳ CRUD + ẩn/hiện đã có, versioning/audit log/duplicate chưa đủ**

- Thêm sản phẩm nhiều bước (thông tin → giá → tồn kho → media → SEO).
- Chỉnh sửa có versioning, lưu audit log (ai sửa gì, khi nào).
- Ẩn/hiện sản phẩm, chuyển trạng thái Coming Soon/Stopped.
- Soft delete: chỉ đánh dấu `ARCHIVED` nếu sản phẩm đã có đơn hàng.
- Nhân bản sản phẩm (duplicate) để tạo dòng tương tự nhanh.

#### 3.2.3. Quản lý tồn kho & biến thể **✅ ĐÃ IMPLEMENT (variant, trừ tồn theo biến thể, khóa bán khi stock=0)**

- Variant gồm size, màu, vật liệu… với SKU riêng, giá override và barcode.
- Trừ tồn theo biến thể, tích hợp import tồn kho từ hệ thống WMS.
- Cho phép khoá bán tự động khi stock ≤ 0, cảnh báo low-stock.
- Khi sản phẩm nằm trong giỏ của user: kiểm tra stock trước khi checkout, thông báo nếu không đủ.

#### 3.2.4. Hình ảnh & media **⏳ Upload nhiều ảnh + thumbnail đã có, video/360 & một số UX nâng cao chưa**

- Upload nhiều hình ảnh, kéo thả reorder, chọn ảnh thumbnail.
- Gán ALT text cho SEO, hỗ trợ upload từ URL/CDN.
- Preview trực tiếp trước khi lưu, đánh dấu ảnh chỉ dùng cho một variant.

#### 3.2.5. Danh mục, bộ sưu tập, tag **⏳ Category + Collections đã có, tag/drag & drop tree view còn thiếu**

- Tree view quản lý category cha/con, drag & drop đổi thứ tự hiển thị.
- Collections theo chiến dịch (Sale, New Arrival, Holiday), gắn nhiều sản phẩm cùng lúc.
- Tagging tự do để phục vụ filter và chiến dịch marketing.

#### 3.2.6. Giá & khuyến mãi **⏳ Giá sale cơ bản (compareAtPrice) + trang SALE đã có, flash sale/lịch sale/chính sách stack voucher chưa**

- Giá sale theo % hoặc số tiền cố định; flash sale với thời gian bắt đầu/kết thúc.
- Cho phép set lịch giảm giá, chọn có stack với voucher hay không.
- Theo dõi lịch sử thay đổi giá, cảnh báo nếu giá sale thấp hơn cost.

#### 3.2.7. SEO & URL **⏳ Slug + một phần SEO đã có, OG/structured data/snippet preview chưa**

- Chỉnh slug thân thiện, tự sinh nhưng cho phép override.
- Meta title/description/keywords, snippet preview như Google SERP.
- Thiết lập OG tags, structured data cho sản phẩm.

#### 3.2.8. Kiểm tra & quy tắc **⏳ Một phần rule (stock/order) đã áp dụng, audit log + rule nâng cao chưa**

- Validate trùng SKU, trùng slug, trùng tên trong cùng category.
- Không cho xoá sản phẩm có order; chỉ đổi trạng thái.
- Khi đổi giá/tồn kho: kiểm tra các đơn Pending, giỏ hàng đang giữ; ghi log thay đổi.

#### 3.2.9. Import/Export **❌ CHƯA IMPLEMENT**

- Template Excel chứa thông tin sản phẩm + variants + stock.
- Import hỗ trợ update (match theo SKU) và tạo mới, ghi log kết quả.
- Export để đồng bộ với kho/marketplace; cho phép lọc trước khi export.

#### 3.2.10. Danh sách sản phẩm **✅ ĐÃ IMPLEMENT (filter/search/bulk đơn giản)**

- Filter theo category, status (Active/Hidden/Archived), tồn kho (Out-of-stock), tag, featured.
- Search theo tên, SKU, barcode.
- Bulk actions: đổi category, bật/tắt hiển thị, set featured, export, gắn collection.

#### 3.2.11. Product Visibility Management **⏳ ĐANG IMPLEMENT (Backend đã xong, Frontend đang làm)**

**Mục tiêu:**  
Cho phép admin quản lý riêng trạng thái hiển thị (Visible) của sản phẩm trên trang Product List, tách bạch với dữ liệu gốc của sản phẩm.

**Trang quản trị:** `/admin/product-visibility`

**Bảng danh sách sản phẩm**

- **Thumbnail**: Ảnh đại diện sản phẩm.
- **Name**: Tên sản phẩm.
- **SKU**: Mã sản phẩm.
- **Variants Count**: Tổng số biến thể (size/màu…).
- **Status**: Trạng thái sản phẩm (Active / Inactive).
- **Visibility**: Toggle Hiện / Ẩn (isVisible = true/false).
- **Updated At**: Ngày giờ cập nhật visibility gần nhất.
- **Actions**: View Detail (mở trang chi tiết sản phẩm).

**Chức năng FE**

- Tìm kiếm theo **tên** và **SKU**.
- Bộ lọc:
  - Theo **Visible / Hidden**.
  - Theo **Active / Inactive**.
- Sắp xếp:
  - Name (A–Z).
  - Last Updated (visible_updated_at).
- Toggle visibility trực tiếp trên bảng:
  - Bật → gọi API `PATCH /api/admin/products/:id/visibility`.
  - Tắt → gọi API `PATCH /api/admin/products/:id/visibility`.
  - Sau khi update: cập nhật lại row hoặc reload bảng.
- **Bulk actions**:
  - Chọn nhiều sản phẩm.
  - Gọi `PATCH /api/admin/products/visibility/bulk` với `visible = true/false`.
- Phân trang, đảm bảo hoạt động tốt với danh sách lớn.

**Flow hiển thị**

1. FE gọi `GET /api/admin/products?search=&visible=&status=&sort=&page=&size=&include=visibility`.
2. Render bảng theo cấu trúc response (bao gồm visible, variantsCount, updatedAt).
3. Khi admin bật/tắt visibility:
   - FE gọi **PATCH** tương ứng.
   - Nếu thành công: cập nhật UI; nếu lỗi (fail rule) thì hiển thị tooltip/lỗi chi tiết.

**Validation FE**

- Không cho phép bật Visible nếu sản phẩm:
  - Không có ảnh đại diện.
  - Không có giá hợp lệ.
  - Tổng tồn kho = 0 hoặc không có biến thể hợp lệ.
- FE hiển thị tooltip/lý do khi hover vào toggle bị disable hoặc khi API trả error.

**Mở rộng UI/UX**

- Cho phép hiển thị badge cảnh báo (ví dụ: “No image”, “No inventory”) ngay trong bảng.
- Khi đổi visibility thành công, hiển thị toast “Cập nhật hiển thị sản phẩm thành công”.

#### 3.2.12. Bộ sưu tập (Collections)

- Khái niệm: Nhóm sản phẩm theo chiến dịch/chủ đề (New Arrival, Holiday, Capsule, Sale). Một sản phẩm có thể thuộc nhiều bộ sưu tập. **✅ ĐÃ IMPLEMENT (BE + FE)**
- Trạng thái & lịch hiển thị: `DRAFT`, `SCHEDULED`, `ACTIVE`, `ENDED`/`ARCHIVED`; trường `startAt`, `endAt`; toggle `isVisible` để ẩn/hiện mà không xóa. **✅ ĐÃ IMPLEMENT**
- Nội dung/SEO: name, slug duy nhất, description, hero/cover image, SEO title/description, optional banner CTA. **✅ ĐÃ IMPLEMENT (trừ banner CTA)**
- Gắn sản phẩm: CRUD liên kết sản phẩm–collection, cho phép sắp xếp thủ công `position`; optional bulk add; validate không cho ACTIVE nếu rỗng hoặc thiếu hero image (configurable). **✅ ĐÃ IMPLEMENT (CRUD + position + validate cơ bản)**
- API công khai: **✅ ĐÃ IMPLEMENT**
  - `GET /api/collections` (lọc ACTIVE + visible + trong khoảng thời gian; search by name; phân trang).
  - `GET /api/collections/:slug` trả về thông tin + danh sách sản phẩm với filter kế thừa từ products (category, size, color, price, sort manual/newest/price asc/desc; pagination).
- API admin: **✅ ĐÃ IMPLEMENT**
  - CRUD collection (`/api/admin/collections`), upload hero image.
  - Quản lý sản phẩm trong collection: set/bulk update list + `position`, toggle visibility, reorder.
  - Filter/search by name/slug/status/visible/date range.
- FE công khai: **✅ ĐÃ IMPLEMENT**
  - Trang `/collections` (grid danh sách collection với badge trạng thái “Sắp diễn ra/Đang diễn ra/Đã kết thúc”).
  - Trang `/collections/:slug` (hero + mô tả + CTA + list sản phẩm, filter/sort/pagination; fallback 404 hoặc thông báo nếu hết hạn/ẩn).
- FE admin: **✅ ĐÃ IMPLEMENT**
  - Trang danh sách collection: search, filter trạng thái/visible, toggle, xem lịch.
  - Form tạo/sửa: name, slug, mô tả, hero image, lịch start/end, SEO, visibility.
  - Tab gắn sản phẩm: search/filter sản phẩm, select nhiều, drag & drop reorder, bulk remove.

### 3.3. Quản lý giỏ hàng (Cart Management)

#### 3.3.1. Chức năng cơ bản **✅ ĐÃ IMPLEMENT**

- Thêm sản phẩm vào giỏ (chọn size, màu, số lượng)
- Xem giỏ hàng
- Cập nhật số lượng
- Xóa sản phẩm
- Lưu giỏ hàng vào database (đối với user đã đăng nhập)

#### 3.3.2. Tính năng nâng cao **⏳ MỘT PHẦN**

- Lưu giỏ hàng giữa các session
- Gợi ý sản phẩm tương tự
- Kiểm tra tồn kho trước khi thêm vào giỏ

### 3.4. Quản lý đơn hàng (Order Management) **⏳ ĐÃ LÀM CƠ BẢN, THIẾU SHIPPING/REFUND NÂNG CAO**

#### 3.4.1. Trạng thái chuẩn **✅ CÓ CẤU TRÚC VÀ STATUS CHÍNH**

- `Pending`: User đặt đơn, hệ thống chờ kiểm tra thông tin.
- `Confirmed`: CSKH xác minh địa chỉ, phí ship, khóa giá.
- `Processing`: Đã xác nhận thanh toán (online) hoặc khóa COD.
- `Packing`: Kho đóng gói, in packing list, gán vận đơn.
- `Shipping`: Đơn đã bàn giao cho GHN/GHTK/J&T, tracking chạy.
- `Completed`: Giao thành công, đối soát doanh thu, cộng điểm.
- `Cancelled`: Huỷ trước khi giao, ghi rõ lý do.
- `Returned`: Khách trả hàng/RTS (Return To Sender).
- `Refunded`: Hoàn tiền toàn phần/partial và ghi lại chứng từ.

#### 3.4.2. Thông tin chi tiết một đơn **⏳ ĐÃ CÓ TRANG CHI TIẾT ĐẦY ĐỦ CƠ BẢN, THIẾU MỘT SỐ TRƯỜNG NÂNG CAO**

**Đã có trên trang User Order Detail:**
- ✅ Status timeline (PENDING → CONFIRMED → PROCESSING → SHIPPING → DELIVERED) với visual indicator.
- ✅ Địa chỉ giao hàng (shipping address) hiển thị rõ, parse JSON nếu cần.
- ✅ Phương thức thanh toán (COD/VNPay/MoMo) + trạng thái thanh toán (PAID/PENDING/FAILED) hiển thị rõ.
- ✅ Vận chuyển: mã vận đơn, tracking URL (nếu có), phí ship.
- ✅ Sản phẩm: danh sách items với ảnh snapshot, biến thể (size/màu), giá tại thời điểm mua, số lượng, subtotal.
- ✅ Tổng thanh toán: subtotal, phí ship, giảm giá, tổng cuối.
- ✅ Tracking info: mã vận đơn + link tracking (nếu đang giao/đã giao).
- ✅ Nút hủy đơn (nếu status cho phép).
- ✅ Modal yêu cầu đổi trả (nếu đã giao).

**Còn thiếu (sẽ bổ sung sau):**
- ⏳ Khách hàng: email, phone, nhóm khách (New/VIP), ghi chú CSKH.
- ⏳ Billing address (địa chỉ thanh toán riêng).
- ⏳ TransactionId chi tiết từ payment gateway.
- ⏳ Ưu đãi: voucher/mã giảm giá chi tiết, điểm loyalty, phần trăm chiết khấu cụ thể.
- ⏳ Log thay đổi: timeline chi tiết với thời gian, nhân viên thao tác, mô tả hành động.

#### 3.4.3. Luồng xử lý nhân viên **⏳ MỘT PHẦN (workflow cơ bản, chưa đủ RMA/đổi địa chỉ nâng cao)**

1. CSKH duyệt đơn: kiểm tra thông tin, cập nhật ghi chú, xác nhận thanh toán.
2. Kho tạo vận đơn (qua API), đóng gói, cập nhật `Packing`.
3. Khi hãng lấy hàng → chuyển `Shipping` và push thông báo.
4. Theo dõi tracking, xử lý yêu cầu đổi địa chỉ, đổi lịch giao.
5. Đơn giao thành công → `Completed`, đối soát tiền, cộng điểm.
6. Huỷ/đổi trả: chọn lý do, trả tồn, hoàn voucher/điểm, xử lý refund.

#### 3.4.4. Audit log & tồn kho **⏳ MỘT PHẦN (log cơ bản, chưa đủ chi tiết/audit đầy đủ)**

- Mọi thay đổi trạng thái ghi vào `order_history` (thời gian, userId, action, ghi chú).
- Trừ tồn:
  - Tuỳ loại sản phẩm: trừ ngay khi `Confirmed` hoặc khi `Packing`.
  - Có cấu hình “giữ tồn” cho đơn Pending trong X phút.
- Khi hủy/Returned/Refunded: tự động trả tồn và ghi lại phiếu nhập kho ngược.

#### 3.4.5. Tích hợp đơn vị vận chuyển **❌ CHƯA TÍCH HỢP HÃNG SHIP**

- API tạo vận đơn GHN/GHTK/J&T: truyền cân nặng, COD, địa chỉ, gói dịch vụ.
- Nhận webhook trạng thái (Picked up, In transit, Delivered, Return) → auto update đơn.
- Cho phép huỷ vận đơn (nếu hãng hỗ trợ) và tạo lại khi đổi địa chỉ.
- Lưu file vận đơn/nhãn PDF để in trực tiếp.

#### 3.4.6. Quản lý thanh toán **⏳ VNPay cơ bản; Momo/partial refund chưa**

- COD: theo dõi tiền thu hộ, đối soát với hãng giao nhận, cảnh báo nợ COD.
- Online: lưu transaction VNPay/MoMo, xử lý callback/webhook, tự động chuyển trạng thái.
- Partial refund: chọn item/số tiền hoàn, ghi chú lý do, cập nhật Payment record.

#### 3.4.7. Màn hình danh sách đơn **⏳ ĐÃ CÓ LIST/FILTER CƠ BẢN (USER & ADMIN), THIẾU BULK/IN ẤN**

- Filter theo trạng thái cho user (trang "Đơn hàng của tôi") và admin.
- Filter nhanh theo khoảng thời gian đặt đơn cho user (Mọi thời gian / 7 ngày gần đây / 30 ngày gần đây).
- Search theo mã đơn, email/phone khách, SKU trong đơn (admin).
- Empty state cho user: chưa có đơn → CTA "Tiếp tục mua sắm"; không có kết quả phù hợp → nút "Xóa bộ lọc".
- Badge "Mới" cho đơn vừa tạo (hiển thị dựa trên orderNumber vừa đặt).
- Bulk actions: duyệt hàng loạt, in hàng loạt, cập nhật trạng thái. **(chưa implement)**

#### 3.4.8. In ấn & xuất dữ liệu **❌ CHƯA IMPLEMENT**

- In hóa đơn VAT, phiếu giao hàng, packing slip, tem sản phẩm.
- Xuất Excel/CSV theo filter hiện tại để gửi kế toán/kho.
- Sinh vận đơn giấy theo template từng hãng.

#### 3.4.9. Edge cases quan trọng **⏳ MỘT PHẦN (hủy + trả tồn cơ bản; RTS/partial refund chưa)**

- Huỷ sau khi tạo vận đơn: gửi request huỷ tới hãng, trả tồn, log lý do.
- RTS (Return To Sender): cập nhật trạng thái Returned, kho xác nhận hàng hoàn, cho phép ship lại.
- Khách đổi địa chỉ sau khi packing: huỷ vận đơn cũ, tạo vận đơn mới, log thao tác.
- Thanh toán thất bại: tạo sub-state “Payment Failed”, cho phép khách retry hoặc CSKH chuyển COD.
- Refund một phần: vẫn giữ item đã nhận, chỉ hoàn tiền phần còn lại.

#### 3.4.10. Vai trò

- Admin: cấu hình quy trình, phân quyền, duyệt refund lớn, xem báo cáo.
- CSKH: duyệt đơn, chỉnh thông tin khách, xử lý hủy/đổi/complaint.
- Kho: đóng gói, cập nhật tồn, tạo/huỷ vận đơn, xác nhận hàng hoàn.

### 3.5. Thanh toán (Payment) **⏳ COD + VNPay cơ bản; Momo/Zalo chưa**

#### 3.5.1. Phương thức thanh toán **⏳ COD + VNPay; Momo/Zalo chưa**

- Thanh toán khi nhận hàng (COD)
- Chuyển khoản ngân hàng
- VNPay (Thẻ tín dụng/ghi nợ)
- Momo (Ví điện tử)
- ZaloPay (Tùy chọn)

#### 3.5.2. Xử lý thanh toán **⏳ MỨC CƠ BẢN (tạo payment, redirect VNPay, cập nhật đơn; webhook/partial refund chưa đủ)**

- Tích hợp API thanh toán
- Webhook xử lý kết quả thanh toán
- Cập nhật trạng thái đơn hàng sau thanh toán
- Gửi email xác nhận thanh toán

### 3.6. Đánh giá và Review

#### 3.6.1. Đánh giá sản phẩm **✅ ĐÃ IMPLEMENT (rating + text; upload ảnh sẽ bổ sung sau)**

- Chỉ user đã mua mới được đánh giá
- Rating (1-5 sao)
- Viết review (text)
- Upload hình ảnh sản phẩm
- Like/Dislike review của người khác

#### 3.6.2. Hiển thị review **✅ ĐÃ IMPLEMENT (trang Product Detail)**

- Hiển thị trên trang chi tiết sản phẩm
- Sort theo: Mới nhất, Hữu ích nhất, Rating cao nhất
- Phân trang reviews

### 3.7. Yêu thích sản phẩm (Wishlist) **✅ ĐÃ IMPLEMENT (thêm/xóa/xem danh sách, thêm vào giỏ)**

- Thêm/Xóa sản phẩm vào wishlist
- Xem danh sách yêu thích
- Chia sẻ wishlist
- Thông báo khi sản phẩm yêu thích giảm giá

### 3.8. Thông báo (Notifications) **⏳ MỘT PHẦN (email order + in-app cơ bản đã có, promo/newsletter chưa)**

**Đã có:**
- ✅ Email xác nhận đơn hàng (order confirmation email) khi đặt hàng thành công.
- ✅ In-app notification cơ bản cho order creation: Toast notification với message "Đơn #... đã được tạo, xem chi tiết" và nút "Xem đơn" để navigate đến order detail.
- ✅ Banner "Đặt hàng thành công" trên trang `/orders` khi vừa tạo đơn (hiển thị order number).

**Còn thiếu:**
- ⏳ Thông báo khi đơn đổi trạng thái (PENDING → CONFIRMED → SHIPPING → DELIVERED) qua in-app notification.
- ⏳ Thông báo sản phẩm mới.
- ⏳ Thông báo khuyến mãi (flash sale, voucher mới, etc.).
- ⏳ Newsletter subscription.

### 3.9. Quản trị viên (Admin) **⏳ CÁC MÀN CHÍNH ĐÃ CÓ, TÍNH NĂNG NÂNG CAO/REPORT CHƯA ĐỦ**

#### 3.9.1. Dashboard **⏳ ĐÃ CÓ DASHBOARD CƠ BẢN, KPI/BÁO CÁO NÂNG CAO CHƯA**

- Cards KPI: doanh thu hôm nay/tháng/năm, tỷ lệ chuyển đổi, khách mới
- Biểu đồ doanh thu theo thời gian, đơn hàng gần nhất, sản phẩm bán chạy
- Cảnh báo sản phẩm sắp hết hàng, hiệu suất nhân viên/chiến dịch marketing

#### 3.9.2. Quản lý sản phẩm & danh mục **⏳ CRUD + variants + collections đã có, hiển thị trạng thái sale cơ bản; flash sale/import/export nâng cao chưa**

- CRUD sản phẩm, quản lý biến thể (size, màu), tồn kho theo variant
- Thiết lập giá gốc/giá sale/flash sale, gắn tags/bộ sưu tập chủ đề
- Upload hình ảnh, quản lý danh mục cha/con, sắp xếp thứ tự hiển thị
- (Import/Export Excel được hoãn, sẽ bổ sung sau nếu cần)

#### 3.9.3. Quản lý đơn hàng ✅ **(đã có màn list + chi tiết + đổi trạng thái cơ bản)**

- ✅ Danh sách đơn, tra cứu theo mã, khách, trạng thái
- ✅ Quy trình duyệt → đóng gói → giao → hoàn tất, cập nhật trạng thái
- ⏳ Hủy đơn có lý do, xử lý đổi trả (RMA), đồng bộ đơn vị vận chuyển (sẽ bổ sung sau)
- ⏳ In hóa đơn/phiếu giao hàng, xuất vận đơn (sẽ bổ sung sau)

#### 3.9.4. Quản lý người dùng & khách hàng ✅ **(list, khóa/mở khóa, xem chi tiết)**

- ✅ Danh sách khách, thông tin cá nhân + lịch sử đơn
- ✅ Khóa/Mở khóa tài khoản
- ⏳ Phân nhóm (VIP, mới, trung thành...), quản lý loyalty points (sẽ bổ sung sau)
- ⏳ Blacklist khách (nếu cần), ghi chú CSKH (sẽ bổ sung sau)

#### 3.9.5. Quản lý thanh toán & vận chuyển **⏳ CẤU HÌNH CƠ BẢN, TÍCH HỢP SHIPPER THẬT/ĐỐI SOÁT CHƯA**

- Cấu hình phương thức thanh toán (COD, VNPay, MoMo...), theo dõi giao dịch, hoàn tiền
- Thiết lập đơn vị vận chuyển (GHN, GHTK, J&T...), phí ship theo khu vực
- Theo dõi trạng thái giao hàng, xử lý hàng hoàn (return-to-sender)

#### 3.9.6. Quản lý kho (Warehouse) **❌ CHƯA IMPLEMENT**

- Danh sách kho, nhập kho/xuất kho, kiểm kê tồn kho
- Theo dõi sản phẩm sắp hết hàng, nhật ký chuyển kho giữa chi nhánh

#### 3.9.7. Quản lý người dùng nội bộ & phân quyền **⏳ ĐÃ CÓ LIST ADMIN/STaff, PHÂN QUYỀN CHI TIẾT/AUDIT LOG CHƯA ĐỦ**

- Danh sách admin/staff, phân quyền theo vai trò (quản trị, kho, CSKH…)
- Tách riêng route đăng nhập `/api/admin/auth/login`
- Ghi nhật ký hoạt động (audit log) cho thao tác quan trọng

#### 3.9.8. Báo cáo & tìm kiếm nâng cao **❌ CHƯA IMPLEMENT PHẦN REPORT NÂNG CAO**

- Báo cáo doanh thu, lợi nhuận, tỷ lệ hủy/trả, hiệu suất chiến dịch
- Tìm kiếm nâng cao trong admin: theo sản phẩm, SKU, đơn hàng, khách hàng

### 3.10. Quản lý tài khoản (Account Management) **⏳ MỘT PHẦN (user account đã có, loyalty/segmentation chưa)**

#### 3.10.1. Khách hàng (User)

- Hồ sơ: họ tên, email, số điện thoại, ngày sinh, giới tính, điểm tích lũy, nhóm khách (new/loyal/VIP).
- Địa chỉ: cho phép lưu nhiều địa chỉ, chọn mặc định shipping/billing, ghi chú riêng cho shipper.
- Trạng thái: `active`, `inactive`, `banned`; CSKH có thể khoá/mở khóa, bắt khách đặt lại mật khẩu.
- Lịch sử: đơn hàng, thanh toán, voucher đã dùng, loyalty logs, đánh giá sản phẩm.
- Phân nhóm tự động dựa trên doanh thu, lượt mua; cho phép gắn tag thủ công.
- Bảo mật: reset mật khẩu (email OTP), bắt buộc đổi khi nghi ngờ, ghi log đăng nhập (thiết bị/IP).

#### 3.10.2. Admin/Staff

- Tạo tài khoản với role: Super Admin, Product Manager, Order Manager, CSKH, Marketing, Warehouse.
- Phân quyền chi tiết theo module + action (view/add/edit/delete/export/approve).
- Audit log: lưu lại ai chỉnh sản phẩm, ai đổi trạng thái đơn, ai cập nhật quyền.
- Bảo mật nâng cao: hỗ trợ 2FA (OTP email/app), cảnh báo đăng nhập lạ, bắt đổi mật khẩu lần đầu/định kỳ.
- Reset mật khẩu admin, khoá tạm thời khi nghi bị compromise.
- Màn hình quản lý staff: filter theo role, trạng thái, xem lịch sử hoạt động và đăng nhập gần nhất.

---

## 5. CÁC TRANG FRONTEND CẦN CÓ

### 5.1. Trang công khai (Public Pages) **⏳ PHẦN LỚN ĐÃ CÓ, CATEGORY PAGE SẼ BỔ SUNG SAU**

#### 5.1.1. Home Page (`/`) **✅ ĐÃ IMPLEMENT (hero + featured + collections + newsletter)**
- Component: `Home.tsx` (Đã có)
- Tính năng: Hero section, danh sách sản phẩm nổi bật, categories navigation, featured collections, newsletter signup

#### 5.1.2. Product Listing Page (`/products`) **⏳ ĐÃ CÓ GRID + FILTER + SORT CƠ BẢN, CHƯA ĐỦ TOÀN BỘ SPEC**
- Component: `ProductListing.tsx`
- Tính năng: Grid/List view toggle, Filter Sidebar, Sort, Pagination, Breadcrumb, URL sync

#### 5.1.3. Product Detail Page (`/products/:slug`) **✅ ĐÃ IMPLEMENT ĐẦY ĐỦ (gallery, biến thể, review, mua ngay, badge SALE)**
- Component: `ProductDetail.tsx`
- Tính năng: ✅ Image gallery, Product info, Size/Color selector, Quantity selector, Add to cart / Buy now, Product reviews, Related products. ✅ Badge SALE hiển thị với style thống nhất (`bg-[#4DA3E8] text-white px-3 py-1 text-xs font-medium tracking-wide`) và phần trăm giảm giá tính chính xác.

#### 5.1.4. Search Results Page (`/search?q=...`) **✅ ĐÃ IMPLEMENT**
- Component: `SearchResults.tsx`
- Tính năng: Search Input với Autocomplete, Query Parsing Display, Search Results, Filter Sidebar, Search Refinements, Sort, Pagination

#### 5.1.5. Category Page (`/categories/:slug`) **✅ ĐÃ IMPLEMENT ĐẦY ĐỦ**
- Component: `CategoryPage.tsx`
- Tính năng: ✅ Hiển thị sản phẩm theo category, hero/breadcrumb, empty state, sort cơ bản (Mới nhất / Giá ↑ / Giá ↓). ✅ Category description lấy từ backend với fallback text khi không có description. ✅ Badge SALE thống nhất trên ProductCard.

### 5.2. Trang xác thực (Auth Pages) **✅ ĐÃ IMPLEMENT ĐẦY ĐỦ (login/register/forgot/reset)**

#### 5.2.1. Login Page (`/login`)
- Component: `Login.tsx`
- Tính năng: Form đăng nhập, "Remember me", Link "Quên mật khẩu", Link "Đăng ký", Social login

#### 5.2.2. Register Page (`/register`)
- Component: `Register.tsx`
- Tính năng: Form đăng ký, Validation, Terms & Conditions, Link "Đã có tài khoản?"

#### 5.2.3. Forgot Password Page (`/forgot-password`)
- Component: `ForgotPassword.tsx`
- Tính năng: Form nhập email, Gửi link reset password

#### 5.2.4. Reset Password Page (`/reset-password/:token`)
- Component: `ResetPassword.tsx`
- Tính năng: Form nhập password mới, Validate token

### 5.3. Trang người dùng (User Pages) - Yêu cầu đăng nhập **⏳ CÁC MÀN CHÍNH ĐÃ CÓ, MỘT SỐ TÍNH NĂNG NÂNG CAO CHƯA**

#### 5.3.1. Account Dashboard (`/account`)
- Component: `AccountDashboard.tsx`
- Tính năng: Overview, Quick links, Recent orders

#### 5.3.2. Profile Page (`/account/profile`)
- Component: `Profile.tsx`
- Tính năng: Xem/chỉnh sửa thông tin cá nhân, Upload avatar, Đổi mật khẩu

#### 5.3.3. Addresses Page (`/account/addresses`)
- Component: `Addresses.tsx`
- Tính năng: Danh sách địa chỉ, Thêm/Sửa/Xóa địa chỉ, Set địa chỉ mặc định

#### 5.3.4. Orders Page (`/account/orders`)
- Component: `Orders.tsx`
- Tính năng: Danh sách đơn hàng, Filter theo trạng thái, Pagination, Link đến chi tiết đơn hàng

#### 5.3.5. Order Detail Page (`/account/orders/:id`)
- Component: `OrderDetail.tsx`
- Tính năng: Chi tiết đơn hàng, Trạng thái đơn hàng, Tracking information, Danh sách sản phẩm, Nút hủy đơn, Nút đánh giá sản phẩm

#### 5.3.6. Wishlist Page (`/account/wishlist`)
- Component: `Wishlist.tsx`
- Tính năng: Danh sách sản phẩm yêu thích, Xóa khỏi wishlist, Thêm vào giỏ hàng

#### 5.3.7. Reviews Page (`/account/reviews`)
- Component: `MyReviews.tsx`
- Tính năng: Danh sách reviews đã viết, Sửa/Xóa review

### 5.4. Trang thanh toán (Checkout Pages) **⏳ TRANG CHECKOUT CHÍNH ĐÃ CÓ, SUCCESS/FAILED RIÊNG CHƯA ĐẦY ĐỦ**

#### 5.4.1. Checkout Page (`/checkout`)
- Component: `Checkout.tsx`
- Tính năng: Review giỏ hàng, Chọn địa chỉ giao hàng, Chọn phương thức thanh toán, Nhập mã giảm giá, Order summary, Place order button

#### 5.4.2. Payment Success Page (`/checkout/success`)
- Component: `PaymentSuccess.tsx`
- Tính năng: Thông báo thanh toán thành công, Order number, Link đến order detail, Continue shopping button

#### 5.4.3. Payment Failed Page (`/checkout/failed`)
- Component: `PaymentFailed.tsx`
- Tính năng: Thông báo lỗi, Retry payment button, Contact support

### 5.5. Trang Admin (Admin Pages) - Yêu cầu role admin **⏳ ĐÃ CÓ DASHBOARD + PRODUCTS/ORDERS/USERS, CÒN THIẾU MỘT SỐ MÀN**

#### 5.5.1. Admin Dashboard (`/admin`) **⏳ DASHBOARD ĐƠN GIẢN ĐÃ CÓ**
- Component: `AdminDashboard.tsx`
- Tính năng: Statistics cards, Charts, Recent orders table, Quick actions

#### 5.5.2. Products Management (`/admin/products`) **✅ ĐÃ IMPLEMENT (list + CRUD cơ bản)**
- Component: `AdminProducts.tsx`
- Tính năng: Danh sách sản phẩm, Search, filter, CRUD operations, Bulk actions

#### 5.5.3. Product Form (`/admin/products/new`, `/admin/products/:id/edit`) **⏳ FORM ĐANG DÙNG `ProductCreate.tsx`, RICH TEXT VÀ 1 SỐ SPEC NÂNG CAO CHƯA ĐỦ**
- Component: `ProductForm.tsx`
- Tính năng: Form tạo/sửa sản phẩm, Upload nhiều hình ảnh, Quản lý variants, Rich text editor

#### 5.5.4. Orders Management (`/admin/orders`) ✅
- Component: `AdminOrders.tsx`
- Tính năng: ✅ Danh sách đơn hàng, ✅ Filter theo trạng thái, ngày, phương thức thanh toán, ✅ Cập nhật trạng thái, ✅ Xem chi tiết, ⏳ In hóa đơn (sẽ bổ sung sau)

#### 5.5.5. Users Management (`/admin/users`) ✅
- Component: `AdminUsers.tsx`
- Tính năng: ✅ Danh sách users, ✅ Search, filter, ✅ Xem chi tiết, ✅ Khóa/Mở khóa tài khoản

#### 5.5.6. Categories Management (`/admin/categories`) **⏳ CRUD DANH MỤC ĐANG ĐƯỢC ĐƠN GIẢN HOÁ; TREE + DRAG&DROP CHƯA ĐỦ**
- Component: `AdminCategories.tsx`
- Tính năng: Tree view categories, CRUD categories, Drag & drop để sắp xếp

### 5.6. Trang khác (Other Pages) **❌ PHẦN LỚN CHƯA IMPLEMENT (About/Contact/FAQ/Terms/Privacy...)**

#### 5.6.1. About Us (`/about`)
- Component: `About.tsx`
- Tính năng: Giới thiệu về brand, Mission, Vision, Team members

#### 5.6.2. Contact (`/contact`)
- Component: `Contact.tsx`
- Tính năng: Contact form, Thông tin liên hệ, Map (nếu có)

#### 5.6.3. FAQ (`/faq`)
- Component: `FAQ.tsx`
- Tính năng: Accordion với các câu hỏi thường gặp, Search trong FAQ

#### 5.6.4. Terms & Conditions (`/terms`)
- Component: `Terms.tsx`
- Tính năng: Điều khoản sử dụng

#### 5.6.5. Privacy Policy (`/privacy`)
- Component: `Privacy.tsx`
- Tính năng: Chính sách bảo mật

#### 5.6.6. 404 Not Found (`/404`)
- Component: `NotFound.tsx` (Đã có)
- Tính năng: Thông báo trang không tồn tại, Link về trang chủ

---

## 8. SECURITY REQUIREMENTS **⏳ MỘT PHẦN (AUTH + BASIC SECURITY ĐÃ CÓ, RATE LIMIT/PCI DSS CHƯA)**

### 8.1. Authentication & Authorization

- JWT tokens cho API authentication
- Session management cho web
- Role-based access control (RBAC)
- Password hashing (bcrypt)

### 8.2. Data Protection

- Input validation và sanitization
- SQL injection prevention (Hibernate/JPA)
- XSS protection
- CSRF tokens
- Rate limiting

### 8.3. Payment Security

- PCI DSS compliance (khi tích hợp payment gateway)
- Encrypt sensitive data
- Secure webhook endpoints

---

## 9. PERFORMANCE REQUIREMENTS **❌ CHƯA CÓ ĐO ĐẠC/SETUP CHÍNH THỨC, MỚI Ở MỨC HƯỚNG DẪN**

### 9.1. Frontend

- First Contentful Paint < 1.5s
- Time to Interactive < 3s
- Image optimization (WebP, lazy loading)
- Code splitting
- Caching strategies

### 9.2. Backend

- API response time < 200ms (p95)
- Database query optimization
- Caching (Redis - tùy chọn)
- CDN cho static assets

---

## 10. TESTING REQUIREMENTS (Chắc là không có phần này) **❌ CHƯA IMPLEMENT TEST TỰ ĐỘNG**

### 10.1. Unit Tests

- Service layer
- Utility functions
- Components (React Testing Library)

### 10.2. Integration Tests

- API endpoints
- Database operations
- Payment flows

### 10.3. E2E Tests

- Critical user flows (Purchase, Checkout)
- Authentication flows

---

## 11. DEPLOYMENT & INFRASTRUCTURE **❌ ĐANG CHẠY LOCAL/DEV, CHƯA CÓ HẠ TẦNG TRIỂN KHAI CHUẨN**

### 11.1. Environment

- Development
- Staging
- Production

### 11.2. CI/CD (chắc không có phần này)

- Automated testing
- Build và deploy pipeline
- Database migrations

### 11.3. Monitoring

- Error tracking (Sentry)
- Performance monitoring
- Logging

---

## 12. PHÂN CHIA ƯU TIÊN PHÁT TRIỂN **✅ PHASE 1 HOÀN THÀNH, CÁC PHASE SAU ĐANG LÀ ROADMAP**

### Phase 1: MVP (Minimum Viable Product) **✅ HOÀN THÀNH**

1. ✅ User authentication (Register/Login)
2. ✅ Product listing và detail
3. ✅ Basic filtering (Fixed attributes: Category, Price, Size, Color)
4. ✅ Simple search (Full-text PostgreSQL)
5. ✅ Cart management (backend)
6. ✅ Checkout và Order creation
7. ✅ Basic payment (COD)
8. ✅ User profile

### Phase 2: Enhanced Features **⏳ ĐANG LÀM / MỘT PHẦN**

1. ⏳ Advanced Filtering System: Hybrid Filter (Fixed + EAV + JSONB), Precomputed Filter Table, Dynamic filter options, Filter counts và suggestions — mới có filter cố định (category/price/size/color); chưa có EAV/hybrid/precomputed.
2. ⏳ Advanced Search: Dictionary-based query parsing, Autocomplete với suggestions, Search analytics, Search refinements — autocomplete/gợi ý đã có; parser/analytics/refinements chưa đủ.
3. ⏳ Payment gateway integration (VNPay, Momo) — VNPay cơ bản đã tích hợp; Momo chưa.
4. ✅ Product reviews.
5. ✅ Wishlist.
6. ⏳ Email notifications — mới ở mức cơ bản cho đơn hàng; promo/in-app chưa đầy đủ.

### Phase 3: Admin Panel **⏳ ĐANG LÀM / MỘT PHẦN**

1. ⏳ Admin dashboard — đã có dashboard cơ bản.
2. ✅ Product management.
3. ✅ Order management (cơ bản).
4. ✅ User management.

### Phase 4: Advanced Features **❌ CHƯA THỰC HIỆN**

1. Coupon system.
2. Advanced analytics.
3. Multi-language support (nếu cần).
4. Mobile app (nếu cần).

---

## 13. MÔ HÌNH LỌC VÀ TÌM KIẾM - CHI TIẾT KỸ THUẬT **❌ CHƯA TRIỂN KHAI, TÀI LIỆU ĐỊNH HƯỚNG**

### 13.1. Hybrid Filter System (Fixed + EAV + Variant + JSONB)

#### 13.1.1. Kiến trúc

Hệ thống filter sử dụng 4 mô hình kết hợp để tối ưu hiệu năng và linh hoạt:

1. **Fixed Schema (Fixed Attributes)**
   - Lưu trực tiếp trong bảng `products`
   - Dùng cho các attributes cố định, thường xuyên query
   - Ví dụ: `category_id`, `price`, `status`
   - Index trực tiếp trên các cột này

2. **EAV (Entity-Attribute-Value)**
   - Bảng `product_attributes` với cấu trúc: `product_id`, `attribute_key`, `attribute_value`
   - Dùng cho các attributes động, có thể thêm mới mà không cần migration
   - Ví dụ: Material, Style, Pattern, Fit
   - Query: `JOIN product_attributes WHERE attribute_key = 'material' AND attribute_value = 'Cotton'`

3. **Variant-based**
   - Lọc dựa trên `product_variants`
   - Dùng cho size, color với stock availability
   - Query: `JOIN product_variants WHERE size = 'M' AND stock > 0`

4. **JSONB Attributes**
   - Cột `attributes JSONB` trong bảng `products`
   - Dùng cho custom attributes, metadata linh hoạt
   - Query: `WHERE attributes @> '{"material": "Cotton"}'`
   - Index: GIN index trên JSONB column

#### 13.1.2. Query Strategy

```typescript
// Pseudo-code cho filter query
function buildFilterQuery(filters: ProductFilters) {
  let query = db.select().from(products);

  // Fixed attributes
  if (filters.categoryId) {
    query = query.where(eq(products.categoryId, filters.categoryId));
  }

  // EAV attributes
  if (filters.material) {
    query = query
      .innerJoin(productAttributes, eq(products.id, productAttributes.productId))
      .where(
        and(
          eq(productAttributes.attributeKey, 'material'),
          inArray(productAttributes.attributeValue, filters.material)
        )
      );
  }

  // Variant-based
  if (filters.size) {
    query = query
      .innerJoin(productVariants, eq(products.id, productVariants.productId))
      .where(
        and(
          inArray(productVariants.size, filters.size),
          gt(productVariants.stock, 0)
        )
      );
  }

  // JSONB attributes
  if (filters.style) {
    query = query.where(
      sql`${products.attributes} @> ${JSON.stringify({ style: filters.style })}`
    );
  }

  return query;
}

### 13.2. Precomputed Filter Table

#### 13.2.1. Mục đích

- **Cache kết quả** các tổ hợp filter để tăng tốc độ truy vấn.
- **Hỗ trợ gợi ý filter** (filter suggestions) dựa trên dữ liệu thực tế.
- **Giảm tải database** khi người dùng áp dụng nhiều bộ lọc phức tạp.

#### 13.2.2. Cơ chế hoạt động

**Build Filter Hash**

```typescript
function buildFilterHash(filters: ProductFilters): string {
  const normalized = {
    category: filters.categoryId,
    priceRange: filters.priceRange,
    sizes: filters.size?.sort(),
    colors: filters.color?.sort(),
    attributes: filters.attributes,
  };

  return crypto
    .createHash('md5')
    .update(JSON.stringify(normalized))
    .digest('hex');
}
```

**Cache Lookup**

```typescript
async function getCachedResults(filterHash: string) {
  const cached = await db
    .select()
    .from(filterCache)
    .where(eq(filterCache.filterHash, filterHash))
    .where(gt(filterCache.lastUpdated, Date.now() - CACHE_TTL));

  return cached ? cached.productIds : null;
}
```

**Cache Update & Invalidation**

- Khi product được **tạo mới/cập nhật/xóa**.
- Khi **tồn kho của variant thay đổi** (các filter size/color liên quan).
- Scheduled job (cron) định kỳ **refresh các bản ghi cache cũ**.

### 13.3. Full-text PostgreSQL Search

#### 13.3.1. Setup

```sql
-- Enable extensions
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Create search vector column
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION products_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.short_description, '')), 'C') ||
    to_tsvector('english', array_to_string(NEW.tags, ' '));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER products_search_vector_update
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_update();

-- Create GIN index
CREATE INDEX idx_products_search_vector ON products USING GIN(search_vector);
```

#### 13.3.2. Query Implementation

```typescript
async function fullTextSearch(query: string, filters?: ProductFilters) {
  const searchQuery = query
    .split(' ')
    .map(term => `${term}:*`)
    .join(' & ');

  let sqlQuery = db
    .select({
      id: products.id,
      name: products.name,
      rank: sql<number>`ts_rank(${products.searchVector}, plainto_tsquery('english', ${query}))`
    })
    .from(products)
    .where(
      sql`${products.searchVector} @@ plainto_tsquery('english', ${query})`
    )
    .orderBy(sql`rank DESC`);

  if (filters) {
    sqlQuery = applyFilters(sqlQuery, filters);
  }

  return sqlQuery;
}
```

### 13.4. Dictionary-based Query Parsing

#### 13.4.1. Dictionary Structure

```typescript
interface DictionaryEntry {
  keyword: string;
  type: 'synonym' | 'category' | 'attribute' | 'stopword';
  mappings: {
    synonyms?: string[];
    category?: string;
    attributes?: Record<string, any>;
  };
  priority: number;
}
```

#### 13.4.2. Query Parsing Algorithm

```typescript
async function parseQuery(query: string): Promise<ParsedQuery> {
  const terms = query.toLowerCase().split(/\s+/);
  const parsed: ParsedQuery = {
    keywords: [],
    categories: [],
    attributes: {},
    originalQuery: query
  };

  for (const term of terms) {
    const dictEntry = await getDictionaryEntry(term);
    if (!dictEntry) {
      parsed.keywords.push(term);
      continue;
    }

    switch (dictEntry.type) {
      case 'synonym':
        parsed.keywords.push(...(dictEntry.mappings.synonyms || []));
        break;
      case 'category':
        if (dictEntry.mappings.category) {
          parsed.categories.push(dictEntry.mappings.category);
        }
        break;
      case 'attribute':
        Object.assign(parsed.attributes, dictEntry.mappings.attributes);
        break;
      case 'stopword':
        // bỏ qua
        break;
    }
  }

  return parsed;
}
```

### 13.5. Filter UI Implementation

#### 13.5.1. Component Structure

```typescript
// FilterSidebar.tsx
interface FilterSidebarProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  availableFilters: AvailableFilters;
}

// FilterGroup.tsx
interface FilterGroupProps {
  title: string;
  type: 'checkbox' | 'radio' | 'range' | 'color';
  options: FilterOption[];
  selected: string[];
  onSelect: (value: string) => void;
  showCount?: boolean;
}

// ActiveFilters.tsx
interface ActiveFiltersProps {
  activeFilters: ProductFilters;
  onRemoveFilter: (filterKey: string, value?: string) => void;
  onClearAll: () => void;
}
```

#### 13.5.2. Filter State Management

```typescript
// useProductFilters.ts hook
function useProductFilters() {
  const [filters, setFilters] = useState<ProductFilters>({});
  const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlFilters = parseFiltersFromURL(params);
    setFilters(urlFilters);
  }, []);

  useEffect(() => {
    const params = buildURLFromFilters(filters);
    window.history.replaceState({}, '', `?${params}`);
    fetchAvailableFilters(filters).then(setAvailableFilters);
  }, [filters]);

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return { filters, availableFilters, updateFilter, clearFilters };
}
```

### 13.6. Performance Optimization

#### 13.6.1. Query Optimization

- Sử dụng **indexes** phù hợp cho mỗi loại filter.
- Giới hạn số lượng **JOIN** bằng cách pre-compute các combination phổ biến.
- Sử dụng **materialized views** cho các truy vấn phức tạp, thường xuyên được dùng.
- Áp dụng **pagination** để giảm lượng data trả về mỗi lần request.

#### 13.6.2. Caching Strategy

- Cache kết quả filter trong **Redis** (nếu hạ tầng cho phép).
- Cache danh sách **available filters** với TTL ngắn để giảm truy vấn lặp lại.
- Cache các **popular searches** (câu truy vấn phổ biến).
- Thiết kế cơ chế **cache invalidation rõ ràng** khi dữ liệu sản phẩm thay đổi.

#### 13.6.3. Frontend Optimization

- **Debounce** khi thay đổi filter để tránh gửi quá nhiều request liên tiếp.
- **Lazy load** các filter options phức tạp hoặc ít dùng.
- Sử dụng **virtual scrolling** cho danh sách filter dài.
- Áp dụng **Optimistic UI updates** để trải nghiệm người dùng mượt mà hơn.

---

## 14. DATABASE SCHEMA & ERD **✅ ĐÃ ÁP DỤNG (PostgreSQL + JPA/Hibernate)**

### 14.1. Tổng quan

Hệ thống sử dụng PostgreSQL với JPA/Hibernate ORM. Dưới đây là mô tả các bảng chính và mối quan hệ giữa chúng.

### 14.2. Các bảng chính

#### 14.2.1. **users**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `email` (VARCHAR, UNIQUE, NOT NULL)
- `password` (VARCHAR, NOT NULL)
- `full_name` (VARCHAR)
- `phone_number` (VARCHAR)
- `role` (ENUM: CUSTOMER, ADMIN, NOT NULL, DEFAULT: CUSTOMER)
- `active` (BOOLEAN, NOT NULL, DEFAULT: true)

#### 14.2.2. **addresses**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `user_id` (FK → users.id, NOT NULL)
- `full_name` (VARCHAR, NOT NULL)
- `phone` (VARCHAR, NOT NULL)
- `address` (VARCHAR, NOT NULL)
- `ward` (VARCHAR)
- `district` (VARCHAR)
- `city` (VARCHAR)
- `is_default` (BOOLEAN, NOT NULL, DEFAULT: false)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.3. **categories**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `name` (VARCHAR, NOT NULL)
- `slug` (VARCHAR, UNIQUE, NOT NULL)
- `description` (TEXT)
- `image` (VARCHAR)
- `parent_id` (FK → categories.id, NULLABLE) - Self-referencing cho category tree
- `display_order` (INTEGER, NOT NULL, DEFAULT: 0)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT: true)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.4. **products**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `name` (VARCHAR, NOT NULL)
- `slug` (VARCHAR, UNIQUE, NOT NULL)
- `description` (TEXT)
- `short_description` (TEXT)
- `price` (DECIMAL(10,2), NOT NULL)
- `compare_at_price` (DECIMAL(10,2))
- `sku` (VARCHAR, UNIQUE, NOT NULL)
- `status` (ENUM: ACTIVE, INACTIVE, OUT_OF_STOCK, NOT NULL, DEFAULT: ACTIVE)
- `featured` (BOOLEAN, NOT NULL, DEFAULT: false)
- `category_id` (FK → categories.id, NULLABLE)
- `sizes` (TEXT[], DEFAULT: '{}') - Array of available sizes
- `colors` (TEXT[], DEFAULT: '{}') - Array of available colors
- `attributes` (JSONB, DEFAULT: '{}') - Flexible attributes
- `tags` (TEXT[], DEFAULT: '{}') - Tags for filtering
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

**Lưu ý:** Bảng `brands` đã được loại bỏ vì hệ thống chỉ bán thương hiệu của chính mình (Single Brand model).

#### 14.2.5. **product_variants**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `product_id` (FK → products.id, NOT NULL)
- `size` (VARCHAR, NOT NULL)
- `color` (VARCHAR, NOT NULL)
- `sku` (VARCHAR, UNIQUE, NOT NULL)
- `price` (DECIMAL(10,2)) - Override product price if needed
- `stock` (INTEGER, NOT NULL, DEFAULT: 0)
- `is_active` (BOOLEAN, NOT NULL, DEFAULT: true)
- `version` (BIGINT, NOT NULL) - **Optimistic Locking** để xử lý concurrency
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

**Lưu ý:** Trường `version` được sử dụng cho Optimistic Locking để tránh race condition khi nhiều người dùng cùng đặt hàng một variant. Hibernate tự động tăng version mỗi khi entity được update.

#### 14.2.6. **product_images**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `product_id` (FK → products.id, NOT NULL)
- `url` (VARCHAR, NOT NULL)
- `alt` (VARCHAR)
- `display_order` (INTEGER, NOT NULL, DEFAULT: 0)
- `is_primary` (BOOLEAN, NOT NULL, DEFAULT: false)
- `created_at` (TIMESTAMP, NOT NULL)

#### 14.2.7. **product_attributes** (EAV Model)
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `product_id` (FK → products.id, NOT NULL)
- `attribute_key` (VARCHAR, NOT NULL) - e.g., 'material', 'style', 'pattern'
- `attribute_value` (VARCHAR, NOT NULL) - e.g., 'Cotton', 'Casual', 'Solid'
- `created_at` (TIMESTAMP, NOT NULL)

#### 14.2.8. **carts**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `user_id` (FK → users.id, NULLABLE) - NULL cho guest cart
- `session_id` (VARCHAR) - Cho guest cart
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.9. **cart_items**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `cart_id` (FK → carts.id, NOT NULL)
- `product_id` (FK → products.id, NOT NULL)
- `variant_id` (FK → product_variants.id, NULLABLE)
- `quantity` (INTEGER, NOT NULL, DEFAULT: 1)
- `price` (DECIMAL(10,2), NOT NULL) - Snapshot tại thời điểm thêm vào giỏ
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.10. **orders**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `order_number` (VARCHAR, UNIQUE, NOT NULL) - Format: ORD-YYYYMMDD-XXXX
- `user_id` (FK → users.id, NOT NULL)
- `status` (ENUM: PENDING, CONFIRMED, PROCESSING, SHIPPING, DELIVERED, CANCELLED, REFUNDED, NOT NULL, DEFAULT: PENDING)
- `subtotal` (DECIMAL(10,2), NOT NULL)
- `shipping_fee` (DECIMAL(10,2), NOT NULL, DEFAULT: 0)
- `discount` (DECIMAL(10,2), NOT NULL, DEFAULT: 0)
- `total` (DECIMAL(10,2), NOT NULL)
- `payment_method` (ENUM: COD, BANK_TRANSFER, VNPAY, MOMO, NOT NULL)
- `payment_status` (ENUM: PENDING, PAID, FAILED, REFUNDED, NOT NULL, DEFAULT: PENDING)
- `shipping_address` (JSONB, NOT NULL) - JSON snapshot
- `billing_address` (JSONB) - JSON snapshot (optional)
- `notes` (TEXT)
- `tracking_number` (VARCHAR)
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.11. **order_items**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `order_id` (FK → orders.id, NOT NULL)
- `product_id` (FK → products.id, NOT NULL)
- `variant_id` (FK → product_variants.id, NULLABLE)
- `product_name` (VARCHAR, NOT NULL) - Snapshot
- `product_image` (VARCHAR) - Snapshot
- `price` (DECIMAL(10,2), NOT NULL) - Snapshot
- `quantity` (INTEGER, NOT NULL)
- `subtotal` (DECIMAL(10,2), NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL)

#### 14.2.12. **payments**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `order_id` (FK → orders.id, UNIQUE, NOT NULL) - OneToOne với Order
- `payment_method` (ENUM: COD, BANK_TRANSFER, VNPAY, MOMO, NOT NULL)
- `payment_status` (ENUM: PENDING, PAID, FAILED, REFUNDED, NOT NULL, DEFAULT: PENDING)
- `amount` (DECIMAL(10,2), NOT NULL)
- `transaction_id` (VARCHAR) - From payment gateway
- `payment_gateway_response` (TEXT) - JSON response from gateway
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.13. **reviews**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `product_id` (FK → products.id, NOT NULL)
- `user_id` (FK → users.id, NOT NULL)
- `rating` (INTEGER, NOT NULL, DEFAULT: 5) - 1-5 stars
- `comment` (TEXT)
- `review_images` (TEXT[]) - Array of image URLs
- `created_at` (TIMESTAMP, NOT NULL)
- `updated_at` (TIMESTAMP, NOT NULL)

#### 14.2.14. **wishlists**
- `id` (PK, BIGINT, AUTO_INCREMENT)
- `user_id` (FK → users.id, NOT NULL)
- `product_id` (FK → products.id, NOT NULL)
- `created_at` (TIMESTAMP, NOT NULL)

### 14.3. Mối quan hệ (Relationships)

#### 14.3.1. User Relationships
- User **1:N** Address
- User **1:N** Cart
- User **1:N** Order (không CASCADE - giữ lại lịch sử)
- User **1:N** Review (không CASCADE - giữ lại reviews)
- User **1:N** Wishlist

#### 14.3.2. Category Relationships
- Category **N:1** Category (self-referencing - parent category)
- Category **1:N** Product

#### 14.3.3. Product Relationships
- Product **N:1** Category
- Product **1:N** ProductImage
- Product **1:N** ProductVariant
- Product **1:N** ProductAttribute (EAV)
- Product **1:N** Review
- Product **1:N** Wishlist
- Product **1:N** CartItem
- Product **1:N** OrderItem

#### 14.3.4. ProductVariant Relationships
- ProductVariant **N:1** Product
- ProductVariant **1:N** CartItem
- ProductVariant **1:N** OrderItem

**Lưu ý về Optimistic Locking:**
- Trường `version` trong `product_variants` được sử dụng để xử lý concurrency khi nhiều người dùng cùng đặt hàng.
- Khi update stock, Hibernate sẽ kiểm tra version. Nếu version không khớp (đã bị update bởi transaction khác), sẽ throw `OptimisticLockException`.
- Service layer cần handle exception này và retry hoặc thông báo lỗi cho user.

#### 14.3.5. Cart Relationships
- Cart **N:1** User (nullable - cho guest cart)
- Cart **1:N** CartItem

#### 14.3.6. Order Relationships
- Order **N:1** User
- Order **1:N** OrderItem
- Order **1:1** Payment

#### 14.3.7. Payment Relationships
- Payment **1:1** Order

### 14.4. Indexes quan trọng

- `users.email` (UNIQUE INDEX)
- `products.slug` (UNIQUE INDEX)
- `products.category_id` (INDEX)
- `products.sku` (UNIQUE INDEX)
- `product_variants.sku` (UNIQUE INDEX)
- `product_variants.product_id` (INDEX)
- `orders.order_number` (UNIQUE INDEX)
- `orders.user_id` (INDEX)
- `categories.slug` (UNIQUE INDEX)
- `categories.parent_id` (INDEX)
- Full-text search index trên `products.search_vector` (GIN index)
- JSONB index trên `products.attributes` (GIN index)

### 14.5. Thay đổi so với phiên bản trước

**Đã loại bỏ:**
- Bảng `brands` - Hệ thống chuyển sang mô hình Single Brand (chỉ bán thương hiệu của chính mình)
- Relationship `Product → Brand` - Đã xóa khỏi Product entity

**Đã thêm:**
- Trường `version` trong `product_variants` - Optimistic Locking để xử lý concurrency khi cập nhật tồn kho

Tài liệu này sẽ được cập nhật khi có thay đổi về yêu cầu hoặc phạm vi dự án.