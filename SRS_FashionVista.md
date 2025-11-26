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

---

## 2. LUỒNG SỰ KIỆN (EVENT FLOWS)

### 2.1. Luồng hiện có (Đã implement)

#### 2.1.1. Luồng xem sản phẩm

User → Home Page → Xem danh sách sản phẩm → Lọc theo category → Xem chi tiết sản phẩm

#### 2.1.2. Luồng giỏ hàng (Local State)

User → Thêm sản phẩm vào giỏ → Mở giỏ hàng → Cập nhật số lượng → Xóa sản phẩm

### 2.2. Luồng cần bổ sung

#### 2.2.1. Luồng đăng ký/Đăng nhập

1. **Đăng ký:**  
   User → Click "Đăng ký" → Nhập thông tin → Validate → Tạo tài khoản → Gửi email xác nhận → Đăng nhập tự động

2. **Đăng nhập:**  
   User → Click "Đăng nhập" → Nhập email/password → Validate → Tạo session → Redirect về trang trước

3. **Đăng xuất:**  
   User → Click "Đăng xuất" → Xóa session → Redirect về Home

#### 2.2.2. Luồng xem chi tiết sản phẩm

User → Click sản phẩm → Product Detail Page → Xem hình ảnh, mô tả, size, màu sắc → Chọn size/màu → Thêm vào giỏ hàng / Mua ngay

#### 2.2.3. Luồng thanh toán

User → Giỏ hàng → Click "Thanh toán" → Checkout Page → Nhập thông tin giao hàng → Chọn phương thức thanh toán → Xác nhận đơn hàng → Chuyển đến cổng thanh toán → Thanh toán thành công → Tạo đơn hàng → Gửi email xác nhận → Redirect về trang "Đơn hàng của tôi"

#### 2.2.4. Luồng quản lý đơn hàng

User → "Đơn hàng của tôi" → Xem danh sách đơn hàng → Click đơn hàng → Xem chi tiết đơn hàng → Hủy đơn hàng (nếu chưa xử lý) / Theo dõi vận chuyển

#### 2.2.5. Luồng tìm kiếm

User → Nhập từ khóa vào search bar → Gợi ý tìm kiếm (autocomplete) → Click kết quả / Enter → Search Results Page → Lọc kết quả (giá, size, màu, category) → Xem sản phẩm

#### 2.2.6. Luồng đánh giá sản phẩm

User (đã mua) → Product Detail Page → "Viết đánh giá" → Chọn sao, viết review, upload hình → Submit → Hiển thị review trên trang sản phẩm

#### 2.2.7. Luồng quản lý tài khoản

User → "Tài khoản của tôi" → Xem/Chỉnh sửa thông tin cá nhân → Đổi mật khẩu → Quản lý địa chỉ giao hàng → Xem lịch sử mua hàng → Yêu thích sản phẩm

#### 2.2.8. Luồng Admin (Quản lý)

Admin → Login → Dashboard → Quản lý sản phẩm (CRUD) → Quản lý đơn hàng (Xem, Cập nhật trạng thái) → Quản lý người dùng → Quản lý danh mục → Thống kê doanh thu

---

## 3. NGHIỆP VỤ CẦN CÓ

### 3.1. Quản lý người dùng (User Management)

#### 3.1.1. Đăng ký/Đăng nhập

- Đăng ký: Email, password, username, họ tên, số điện thoại
- Đăng nhập: Email/Username + Password
- Xác thực email: Gửi link kích hoạt qua email
- Quên mật khẩu: Gửi link reset password
- Đăng nhập bằng Google/Facebook (Tùy chọn)

#### 3.1.2. Quản lý profile

- Xem/chỉnh sửa thông tin cá nhân
- Đổi mật khẩu
- Upload avatar
- Quản lý địa chỉ giao hàng (nhiều địa chỉ)

### 3.2. Quản lý sản phẩm (Product Management)

#### 3.2.1. Danh mục sản phẩm

- Categories: Áo, Quần, Váy, Áo khoác, Phụ kiện
- Collections: The New, Bộ Sưu Tập, Sale
- Tags: Màu sắc, Chất liệu, Style
- Filter: Giá, Size, Màu, Category, Brand

#### 3.2.2. Thông tin sản phẩm

- Tên, mô tả, giá, hình ảnh (nhiều ảnh)
- Size (XS, S, M, L, XL, XXL)
- Màu sắc
- Số lượng tồn kho
- Trạng thái (Còn hàng, Hết hàng, Sắp về)
- SKU (Stock Keeping Unit)
- Tags, Categories

#### 3.2.3. Tìm kiếm sản phẩm

- Full-text search: Tìm kiếm theo tên, mô tả, tags, brand
- Dictionary-based query parsing: Phân tích từ khóa để hiểu ý định người dùng
- Autocomplete suggestions: Gợi ý tìm kiếm khi người dùng nhập
- Lưu lịch sử tìm kiếm: Lưu các từ khóa đã tìm để gợi ý sau
- Search analytics: Theo dõi các từ khóa phổ biến

#### 3.2.4. Lọc sản phẩm (Filter System)

**Filter UI Components:**

- Sidebar Filter: Hiển thị các filter options ở sidebar trái
- Dropdown Filters: Dropdown menu với các tag/search filters
- Tag Chips: Hiển thị các tag đã chọn dưới dạng chips có thể xóa
- Active Filters Display: Hiển thị tất cả filters đang active
- Clear All Filters: Nút xóa tất cả filters

**Filter Types:**

- Fixed Attributes (Fixed Schema): Category, Price Range, Size, Color, Brand, Availability
- Dynamic Attributes (EAV - Entity-Attribute-Value): Chất liệu, Style, Pattern, Fit, Season, Care Instructions
- Variant-based Filters: Size availability, Color availability, Price range theo variant
- JSONB Attributes (Flexible): Custom attributes linh hoạt

**Filter Behavior:**

- Multi-select: Cho phép chọn nhiều giá trị trong cùng một filter
- AND logic: Tất cả filters được kết hợp bằng AND
- OR logic trong cùng filter: Các giá trị trong cùng filter dùng OR
- Real-time filtering: Cập nhật kết quả ngay khi chọn filter
- Filter count: Hiển thị số lượng sản phẩm sau mỗi filter option
- Filter persistence: Lưu filters trong URL query params để share và bookmark
- Smart defaults: Gợi ý filters phổ biến dựa trên category

**Precomputed Filter Table:**

- Bảng cache chứa tất cả combinations của filters
- Tăng tốc độ query khi có nhiều filters
- Tự động cập nhật khi sản phẩm thay đổi
- Hỗ trợ filter suggestions dựa trên dữ liệu thực tế

### 3.3. Quản lý giỏ hàng (Cart Management)

#### 3.3.1. Chức năng cơ bản

- Thêm sản phẩm vào giỏ (chọn size, màu, số lượng)
- Xem giỏ hàng
- Cập nhật số lượng
- Xóa sản phẩm
- Lưu giỏ hàng vào database (đối với user đã đăng nhập)

#### 3.3.2. Tính năng nâng cao

- Lưu giỏ hàng giữa các session
- Gợi ý sản phẩm tương tự
- Kiểm tra tồn kho trước khi thêm vào giỏ

### 3.4. Quản lý đơn hàng (Order Management)

#### 3.4.1. Tạo đơn hàng

- Từ giỏ hàng → Checkout
- Nhập thông tin giao hàng
- Chọn phương thức thanh toán
- Chọn phương thức vận chuyển
- Tính phí vận chuyển
- Áp dụng mã giảm giá (nếu có)

#### 3.4.2. Trạng thái đơn hàng

- Pending: Chờ xác nhận
- Confirmed: Đã xác nhận
- Processing: Đang xử lý
- Shipping: Đang giao hàng
- Delivered: Đã giao hàng
- Cancelled: Đã hủy
- Refunded: Đã hoàn tiền

#### 3.4.3. Theo dõi đơn hàng

- Mã đơn hàng (Order ID)
- Lịch sử cập nhật trạng thái
- Thông tin vận chuyển (tracking number)
- Thời gian ước tính giao hàng

### 3.5. Thanh toán (Payment)

#### 3.5.1. Phương thức thanh toán

- Thanh toán khi nhận hàng (COD)
- Chuyển khoản ngân hàng
- VNPay (Thẻ tín dụng/ghi nợ)
- Momo (Ví điện tử)
- ZaloPay (Tùy chọn)

#### 3.5.2. Xử lý thanh toán

- Tích hợp API thanh toán
- Webhook xử lý kết quả thanh toán
- Cập nhật trạng thái đơn hàng sau thanh toán
- Gửi email xác nhận thanh toán

### 3.6. Đánh giá và Review

#### 3.6.1. Đánh giá sản phẩm

- Chỉ user đã mua mới được đánh giá
- Rating (1-5 sao)
- Viết review (text)
- Upload hình ảnh sản phẩm
- Like/Dislike review của người khác

#### 3.6.2. Hiển thị review

- Hiển thị trên trang chi tiết sản phẩm
- Sort theo: Mới nhất, Hữu ích nhất, Rating cao nhất
- Phân trang reviews

### 3.7. Yêu thích sản phẩm (Wishlist)

- Thêm/Xóa sản phẩm vào wishlist
- Xem danh sách yêu thích
- Chia sẻ wishlist
- Thông báo khi sản phẩm yêu thích giảm giá

### 3.8. Thông báo (Notifications)

- Thông báo đơn hàng (email, in-app)
- Thông báo sản phẩm mới
- Thông báo khuyến mãi
- Newsletter subscription

### 3.9. Quản trị viên (Admin)

#### 3.9.1. Dashboard

- Tổng quan doanh thu, đơn hàng, người dùng
- Biểu đồ thống kê
- Top sản phẩm bán chạy

#### 3.9.2. Quản lý sản phẩm

- CRUD sản phẩm
- Upload nhiều hình ảnh
- Quản lý tồn kho
- Quản lý categories, tags

#### 3.9.3. Quản lý đơn hàng

- Xem danh sách đơn hàng
- Cập nhật trạng thái đơn hàng
- In hóa đơn
- Export dữ liệu

#### 3.9.4. Quản lý người dùng

- Xem danh sách user
- Khóa/Mở khóa tài khoản
- Xem lịch sử mua hàng của user

---

## 5. CÁC TRANG FRONTEND CẦN CÓ

### 5.1. Trang công khai (Public Pages)

#### 5.1.1. Home Page (`/`)
- Component: `Home.tsx` (Đã có)
- Tính năng: Hero section, danh sách sản phẩm nổi bật, categories navigation, featured collections, newsletter signup

#### 5.1.2. Product Listing Page (`/products`)
- Component: `ProductListing.tsx`
- Tính năng: Grid/List view toggle, Filter Sidebar, Sort, Pagination, Breadcrumb, URL sync

#### 5.1.3. Product Detail Page (`/products/:slug`)
- Component: `ProductDetail.tsx`
- Tính năng: Image gallery, Product info, Size/Color selector, Quantity selector, Add to cart / Buy now, Product reviews, Related products

#### 5.1.4. Search Results Page (`/search?q=...`)
- Component: `SearchResults.tsx`
- Tính năng: Search Input với Autocomplete, Query Parsing Display, Search Results, Filter Sidebar, Search Refinements, Sort, Pagination

#### 5.1.5. Category Page (`/categories/:slug`)
- Component: `CategoryPage.tsx`
- Tính năng: Hiển thị sản phẩm theo category, Category description, Filter và sort

### 5.2. Trang xác thực (Auth Pages)

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

### 5.3. Trang người dùng (User Pages) - Yêu cầu đăng nhập

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

### 5.4. Trang thanh toán (Checkout Pages)

#### 5.4.1. Checkout Page (`/checkout`)
- Component: `Checkout.tsx`
- Tính năng: Review giỏ hàng, Chọn địa chỉ giao hàng, Chọn phương thức thanh toán, Nhập mã giảm giá, Order summary, Place order button

#### 5.4.2. Payment Success Page (`/checkout/success`)
- Component: `PaymentSuccess.tsx`
- Tính năng: Thông báo thanh toán thành công, Order number, Link đến order detail, Continue shopping button

#### 5.4.3. Payment Failed Page (`/checkout/failed`)
- Component: `PaymentFailed.tsx`
- Tính năng: Thông báo lỗi, Retry payment button, Contact support

### 5.5. Trang Admin (Admin Pages) - Yêu cầu role admin

#### 5.5.1. Admin Dashboard (`/admin`)
- Component: `AdminDashboard.tsx`
- Tính năng: Statistics cards, Charts, Recent orders table, Quick actions

#### 5.5.2. Products Management (`/admin/products`)
- Component: `AdminProducts.tsx`
- Tính năng: Danh sách sản phẩm, Search, filter, CRUD operations, Bulk actions

#### 5.5.3. Product Form (`/admin/products/new`, `/admin/products/:id/edit`)
- Component: `ProductForm.tsx`
- Tính năng: Form tạo/sửa sản phẩm, Upload nhiều hình ảnh, Quản lý variants, Rich text editor

#### 5.5.4. Orders Management (`/admin/orders`)
- Component: `AdminOrders.tsx`
- Tính năng: Danh sách đơn hàng, Filter theo trạng thái, ngày, Cập nhật trạng thái, Xem chi tiết, In hóa đơn

#### 5.5.5. Users Management (`/admin/users`)
- Component: `AdminUsers.tsx`
- Tính năng: Danh sách users, Search, filter, Xem chi tiết, Khóa/Mở khóa tài khoản

#### 5.5.6. Categories Management (`/admin/categories`)
- Component: `AdminCategories.tsx`
- Tính năng: Tree view categories, CRUD categories, Drag & drop để sắp xếp

### 5.6. Trang khác (Other Pages)

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

## 8. SECURITY REQUIREMENTS

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

## 9. PERFORMANCE REQUIREMENTS

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

## 10. TESTING REQUIREMENTS (Chắc là không có phần này)

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

## 11. DEPLOYMENT & INFRASTRUCTURE

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

## 12. PHÂN CHIA ƯU TIÊN PHÁT TRIỂN

### Phase 1: MVP (Minimum Viable Product)

1. User authentication (Register/Login)
2. Product listing và detail
3. Basic filtering (Fixed attributes: Category, Price, Size, Color)
4. Simple search (Full-text PostgreSQL)
5. Cart management (backend)
6. Checkout và Order creation
7. Basic payment (COD)
8. User profile

### Phase 2: Enhanced Features

1. Advanced Filtering System: Hybrid Filter (Fixed + EAV + JSONB), Precomputed Filter Table, Dynamic filter options, Filter counts và suggestions
2. Advanced Search: Dictionary-based query parsing, Autocomplete với suggestions, Search analytics, Search refinements
3. Payment gateway integration (VNPay, Momo)
4. Product reviews
5. Wishlist
6. Email notifications

### Phase 3: Admin Panel

1. Admin dashboard
2. Product management
3. Order management
4. User management

### Phase 4: Advanced Features

1. Coupon system
2. Advanced analytics
3. Multi-language support (nếu cần)
4. Mobile app (nếu cần)

---

## 13. MÔ HÌNH LỌC VÀ TÌM KIẾM - CHI TIẾT KỸ THUẬT

### 13.1. Hybrid Filter System (Fixed + EAV + Variant + JSONB)

#### 13.1.1. Kiến trúc

Hệ thống filter sử dụng 4 mô hình kết hợp để tối ưu hiệu năng và linh hoạt:

1. **Fixed Schema (Fixed Attributes)**
   - Lưu trực tiếp trong bảng `products`
   - Dùng cho các attributes cố định, thường xuyên query
   - Ví dụ: `category_id`, `brand_id`, `price`, `status`
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
    brand: filters.brandId,
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
  type: 'synonym' | 'category' | 'brand' | 'attribute' | 'stopword';
  mappings: {
    synonyms?: string[];
    category?: string;
    brand?: string;
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
    brands: [],
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
      case 'brand':
        if (dictEntry.mappings.brand) {
          parsed.brands.push(dictEntry.mappings.brand);
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

Tài liệu này sẽ được cập nhật khi có thay đổi về yêu cầu hoặc phạm vi dự án.