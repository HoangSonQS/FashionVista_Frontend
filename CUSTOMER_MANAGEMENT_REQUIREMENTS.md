# TÀI LIỆU NGHIỆP VỤ: QUẢN LÝ KHÁCH HÀNG (CUSTOMER MANAGEMENT)

## 1. MÔ TẢ GIAO DIỆN HIỆN TẠI

### Trang Admin Quản lý Người dùng (`/admin/users`)

**Giao diện hiện tại bao gồm:**

1. **Header Section:**
   - Tiêu đề: "Quản lý người dùng"
   - Mô tả: "Theo dõi và quản lý tất cả người dùng trong hệ thống."

2. **Filter Section:**
   - Search input: Tìm theo email, tên, số điện thoại
   - Select Role: Lọc theo vai trò (Tất cả, Khách hàng, Quản trị viên)
   - Select Status: Lọc theo trạng thái (Tất cả, Đang hoạt động, Đã khóa)

3. **Table hiển thị:**
   - **Email**: Email của người dùng (font-medium)
   - **Họ tên**: Tên đầy đủ hoặc "N/A"
   - **Số điện thoại**: Số điện thoại hoặc "N/A"
   - **Vai trò**: Badge hiển thị "Khách hàng" hoặc "Quản trị viên"
   - **Trạng thái**: Badge màu xanh (Đang hoạt động) hoặc đỏ (Đã khóa)
   - **Số đơn hàng**: Tổng số đơn hàng đã đặt
   - **Ngày tạo**: Ngày tạo tài khoản (format vi-VN)
   - **Thao tác**: Nút "Khóa" hoặc "Mở khóa" với màu tương ứng

4. **Pagination:**
   - Hiển thị: "Trang X/Y (Z người dùng)"
   - Nút "Trước" và "Sau" để điều hướng

**Tính năng hiện có:**
- ✅ Xem danh sách users với pagination
- ✅ Search theo email, tên, số điện thoại
- ✅ Filter theo role và active status
- ✅ Khóa/Mở khóa tài khoản
- ❌ Chưa có: Thay đổi role, Soft delete, Xem chi tiết user

---

## 2. NGHIỆP VỤ CẦN CÓ CHO MODULE QUẢN LÝ KHÁCH HÀNG

### 2.1. Quản lý thông tin cơ bản

**Các trường cần quản lý:**
- ✅ Email (đã có)
- ✅ Họ tên / Full Name (đã có)
- ✅ Số điện thoại (đã có)
- ❌ Avatar/Ảnh đại diện (chưa có)
- ❌ Giới tính (MALE/FEMALE/OTHER) (chưa có)
- ❌ Ngày sinh (chưa có)

**Chức năng:**
- Admin có thể xem và chỉnh sửa thông tin cơ bản của khách hàng
- Upload/Thay đổi avatar
- Validate format ngày sinh, giới tính

### 2.2. Quản lý trạng thái tài khoản

**Các trạng thái cần có:**
- ✅ `ACTIVE` - Đang hoạt động (đã có)
- ❌ `INACTIVE` - Tạm ngưng (chưa có - khác với banned)
- ❌ `BANNED` - Bị cấm (chưa có - do vi phạm)
- ❌ `NEED_VERIFY` - Cần xác thực email (chưa có)
- ❌ `DELETED` - Đã xóa mềm (chưa có)

**Chức năng:**
- Admin có thể thay đổi trạng thái tài khoản
- Ghi log lý do khóa/ban
- Tự động chuyển sang NEED_VERIFY khi đăng ký mới
- Soft delete: Ẩn khỏi danh sách nhưng giữ lại dữ liệu lịch sử

### 2.3. Quản lý điểm thưởng (Loyalty Points)

**Cần có:**
- ❌ Trường `loyaltyPoints` trong User entity
- ❌ Bảng `loyalty_point_history` để lưu lịch sử tích/tiêu điểm
- ❌ Quy tắc tích điểm: % theo giá trị đơn hàng
- ❌ Quy tắc tiêu điểm: 1 điểm = X VNĐ giảm giá

**Chức năng:**
- Admin có thể thêm/bớt điểm thủ công (có lý do)
- Xem lịch sử tích/tiêu điểm
- Tự động tích điểm khi đơn hàng hoàn tất
- Tự động trừ điểm khi khách dùng điểm để giảm giá

### 2.4. Phân nhóm khách hàng (Customer Segmentation)

**Các nhóm cần có:**
- ❌ **NEW** - Khách mới (đơn hàng đầu tiên trong 30 ngày)
- ❌ **REGULAR** - Khách thường xuyên (2-5 đơn)
- ❌ **LOYAL** - Khách thân thiết (6-10 đơn)
- ❌ **VIP** - Khách VIP (10+ đơn hoặc tổng chi tiêu > X VNĐ)

**Hoặc theo hạng (Tier System):**
- ❌ **BRONZE** - Đồng (0-1,000,000 VNĐ)
- ❌ **SILVER** - Bạc (1,000,000 - 5,000,000 VNĐ)
- ❌ **GOLD** - Vàng (5,000,000 - 20,000,000 VNĐ)
- ❌ **PLATINUM** - Bạch kim (20,000,000+ VNĐ)

**Chức năng:**
- Tự động phân nhóm dựa trên số đơn hoặc tổng chi tiêu
- Admin có thể phân nhóm thủ công
- Filter theo nhóm/hạng
- Hiển thị badge hạng trên profile

### 2.5. Tổng quan hành vi khách hàng (Customer Insights)

**Metrics cần hiển thị:**
- ✅ Số đơn đã đặt (đã có)
- ❌ Tổng chi tiêu (totalSpent)
- ❌ Đơn hàng trung bình (AOV - Average Order Value)
- ❌ Tỉ lệ hoàn hàng (%)
- ❌ Lần đăng nhập gần nhất (lastLoginAt)
- ❌ Số ngày kể từ lần mua cuối
- ❌ Sản phẩm yêu thích (từ wishlist và đơn hàng)

**Chức năng:**
- Dashboard hiển thị insights cho từng khách
- Biểu đồ lịch sử mua hàng
- Phân tích xu hướng mua hàng

### 2.6. Quản lý địa chỉ giao hàng

**Cần có:**
- ✅ Bảng `addresses` (đã có)
- ✅ Quan hệ User 1-N Address (đã có)

**Chức năng:**
- Admin xem danh sách địa chỉ của khách
- Thêm/Sửa/Xóa địa chỉ (nếu cần)
- Đánh dấu địa chỉ mặc định

### 2.7. Xem lịch sử đơn hàng

**Cần có:**
- ✅ Quan hệ User 1-N Order (đã có)
- ❌ Trang chi tiết user hiển thị danh sách đơn hàng

**Chức năng:**
- Xem tất cả đơn hàng của khách
- Filter theo trạng thái, khoảng thời gian
- Link đến chi tiết đơn hàng

### 2.8. Xem Wishlist

**Cần có:**
- ✅ Quan hệ User 1-N Wishlist (đã có)
- ❌ Trang chi tiết user hiển thị wishlist

**Chức năng:**
- Xem danh sách sản phẩm yêu thích
- Thống kê: số lượng, danh mục yêu thích

### 2.9. Xem lịch sử đánh giá

**Cần có:**
- ✅ Quan hệ User 1-N Review (đã có)
- ❌ Trang chi tiết user hiển thị reviews

**Chức năng:**
- Xem tất cả reviews khách đã viết
- Filter theo rating, sản phẩm
- Link đến sản phẩm được review

### 2.10. Nhật ký hoạt động (Login History)

**Cần có:**
- ❌ Bảng `login_activity` hoặc `user_activity_log`
- ❌ Lưu: IP address, device, browser, location, thời gian

**Chức năng:**
- Xem lịch sử đăng nhập
- Phát hiện đăng nhập bất thường
- Export log để phân tích

### 2.11. Reset mật khẩu

**Chức năng:**
- Admin có thể reset mật khẩu cho khách
- Gửi email chứa link đặt lại mật khẩu
- Hoặc tạo mật khẩu tạm và gửi qua email

### 2.12. Khóa/Mở khóa tài khoản

**Cần có:**
- ✅ Trường `active` (đã có)
- ❌ Trường `bannedReason` - Lý do khóa
- ❌ Trường `bannedAt` - Thời gian khóa

**Chức năng:**
- ✅ Khóa/Mở khóa (đã có)
- ❌ Ghi lý do khóa
- ❌ Tự động mở khóa sau X ngày (nếu cần)

### 2.13. Xuất danh sách (Export)

**Chức năng:**
- Export CSV/Excel danh sách khách hàng
- Bao gồm: email, tên, số đơn, tổng chi tiêu, hạng, trạng thái
- Filter trước khi export

### 2.14. Quản lý vai trò (Role Management)

**Cần có:**
- ✅ Trường `role` (CUSTOMER/ADMIN) (đã có)
- ❌ Chức năng thay đổi role (chưa có)
- ❌ Validation: Admin không thể tự đổi role của mình

**Chức năng:**
- Admin có thể thay đổi role của user khác
- Không cho phép admin tự thay đổi role của chính mình
- Ghi log khi thay đổi role

---

## 3. CÁC PHẦN CÒN THIẾU TRONG ENTITY USER

### 3.1. Thông tin cá nhân

```java
// THIẾU:
private String avatarUrl;           // URL ảnh đại diện
private Gender gender;              // Enum: MALE, FEMALE, OTHER
private LocalDate dateOfBirth;      // Ngày sinh
```

### 3.2. Trạng thái và xác thực

```java
// THIẾU:
private AccountStatus status;       // Enum: ACTIVE, INACTIVE, BANNED, NEED_VERIFY
private boolean isEmailVerified;     // Đã xác thực email chưa
private String bannedReason;        // Lý do bị khóa
private LocalDateTime bannedAt;     // Thời gian khóa
private LocalDateTime deletedAt;    // Soft delete timestamp
```

### 3.3. Loyalty & Tier

```java
// THIẾU:
private Integer loyaltyPoints;      // Điểm thưởng hiện tại
private CustomerTier tier;          // Enum: BRONZE, SILVER, GOLD, PLATINUM
```

### 3.4. Thống kê

```java
// THIẾU:
private BigDecimal totalSpent;      // Tổng chi tiêu (tính từ orders)
private Integer totalOrders;        // Tổng số đơn (có thể tính từ orders.size())
private LocalDateTime lastLoginAt;  // Lần đăng nhập gần nhất
```

### 3.5. OAuth/Social Login

```java
// THIẾU:
private AuthProvider provider;      // Enum: LOCAL, GOOGLE, FACEBOOK
private String providerId;          // ID từ provider (nếu OAuth)
```

### 3.6. Relationships cần bổ sung

```java
// THIẾU:
@OneToMany(mappedBy = "user")
private List<LoyaltyPointHistory> loyaltyPointHistories;

@OneToMany(mappedBy = "user")
private List<LoginActivity> loginActivities;

@ManyToOne
@JoinColumn(name = "tier_id")
private CustomerTier customerTier; // Nếu dùng bảng riêng
```

---

## 4. CẤU TRÚC DATABASE CẦN BỔ SUNG

### 4.1. Bảng `customer_tiers`

```sql
CREATE TABLE customer_tiers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE, -- BRONZE, SILVER, GOLD, PLATINUM
    display_name VARCHAR(100) NOT NULL, -- "Đồng", "Bạc", "Vàng", "Bạch kim"
    min_spent DECIMAL(10,2) NOT NULL, -- Ngưỡng tối thiểu để đạt hạng
    max_spent DECIMAL(10,2), -- Ngưỡng tối đa (NULL cho PLATINUM)
    discount_percentage DECIMAL(5,2) DEFAULT 0, -- % giảm giá cho hạng này
    points_multiplier DECIMAL(3,2) DEFAULT 1.0, -- Hệ số nhân điểm (VIP x2 điểm)
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Quan hệ:** User N:1 CustomerTier (nhiều user có cùng tier)

### 4.2. Bảng `loyalty_point_history`

```sql
CREATE TABLE loyalty_point_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    points INTEGER NOT NULL, -- Số điểm (có thể âm nếu tiêu điểm)
    balance_after INTEGER NOT NULL, -- Số dư sau giao dịch
    transaction_type VARCHAR(20) NOT NULL, -- EARNED, SPENT, MANUAL_ADJUST, EXPIRED
    source VARCHAR(100), -- "ORDER_123", "ADMIN_ADJUST", "PROMOTION_XYZ"
    description TEXT, -- Mô tả chi tiết
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by BIGINT REFERENCES users(id) -- Admin nào thực hiện (nếu manual)
);
```

**Quan hệ:** User 1:N LoyaltyPointHistory

**Index:**
- `idx_loyalty_user_created` ON (user_id, created_at DESC)

### 4.3. Bảng `login_activity` hoặc `user_activity_log`

```sql
CREATE TABLE login_activity (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ip_address VARCHAR(45), -- IPv4 hoặc IPv6
    user_agent TEXT, -- Browser/Device info
    device_type VARCHAR(20), -- MOBILE, TABLET, DESKTOP
    location VARCHAR(100), -- Thành phố/Quốc gia (từ IP geolocation)
    login_success BOOLEAN NOT NULL DEFAULT true,
    failure_reason VARCHAR(100), -- Nếu login_success = false
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

**Quan hệ:** User 1:N LoginActivity

**Index:**
- `idx_login_user_created` ON (user_id, created_at DESC)
- `idx_login_ip` ON (ip_address) -- Để phát hiện đăng nhập bất thường

### 4.4. Bảng `customer_segments` (Tùy chọn - nếu dùng phân nhóm thủ công)

```sql
CREATE TABLE customer_segments (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- "Khách mới", "Khách VIP"
    description TEXT,
    auto_assigned BOOLEAN DEFAULT false, -- Tự động phân nhóm hay thủ công
    criteria JSONB, -- Điều kiện tự động: {"minOrders": 10, "minSpent": 5000000}
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE user_segments (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    segment_id BIGINT NOT NULL REFERENCES customer_segments(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP NOT NULL DEFAULT NOW(),
    assigned_by BIGINT REFERENCES users(id), -- Admin nào gán (nếu thủ công)
    PRIMARY KEY (user_id, segment_id)
);
```

**Quan hệ:** User N:M CustomerSegment (nhiều-nhiều)

---

## 5. API VÀ SERVICE CẦN BỔ SUNG

### 5.1. API Thống kê (Customer Insights)

```
GET /api/admin/users/{userId}/insights
Response: {
  totalOrders: number,
  totalSpent: number,
  averageOrderValue: number,
  returnRate: number,
  lastLoginAt: string,
  daysSinceLastPurchase: number,
  favoriteCategories: string[],
  purchaseTrend: { month: string, amount: number }[]
}
```

### 5.2. API Phân loại/Tăng hạng

```
PATCH /api/admin/users/{userId}/tier
Body: { tierId: number }
- Tự động tính tier dựa trên totalSpent
- Hoặc admin gán thủ công
```

### 5.3. API Khóa tài khoản (Nâng cao)

```
PATCH /api/admin/users/{userId}/ban
Body: { 
  reason: string,
  duration?: number // Số ngày (nếu tạm thời)
}
```

### 5.4. API Thêm điểm thưởng

```
POST /api/admin/users/{userId}/loyalty-points
Body: {
  points: number, // Có thể âm để trừ điểm
  reason: string,
  source: string
}
```

### 5.5. API Xem lịch sử hoạt động

```
GET /api/admin/users/{userId}/activities
Query: { type?: 'LOGIN' | 'ORDER' | 'REVIEW' | 'ALL', page, size }
Response: {
  content: ActivityLog[],
  totalElements: number
}
```

### 5.6. API Lọc khách nâng cao

```
GET /api/admin/users
Query: {
  search?: string,
  role?: UserRole,
  active?: boolean,
  tier?: CustomerTier,
  minSpent?: number,
  maxSpent?: number,
  minOrders?: number,
  segmentId?: number,
  emailVerified?: boolean,
  lastLoginFrom?: string, // ISO date
  lastLoginTo?: string,
  page, size, sortBy, sortDir
}
```

### 5.7. API Export

```
GET /api/admin/users/export
Query: { ...filters giống như GET /api/admin/users }
Response: CSV/Excel file download
```

### 5.8. API Reset mật khẩu

```
POST /api/admin/users/{userId}/reset-password
Body: { sendEmail: boolean }
Response: { 
  temporaryPassword?: string, // Nếu không gửi email
  emailSent: boolean
}
```

### 5.9. API Thay đổi role

```
PATCH /api/admin/users/{userId}/role
Body: { role: UserRole }
- Validation: Admin không thể tự đổi role của mình
```

### 5.10. API Xem chi tiết user (Comprehensive)

```
GET /api/admin/users/{userId}/detail
Response: {
  // Thông tin cơ bản
  id, email, fullName, phoneNumber, avatarUrl, gender, dateOfBirth,
  role, status, active, isEmailVerified,
  // Thống kê
  totalOrders, totalSpent, loyaltyPoints, tier,
  lastLoginAt, createdAt,
  // Relationships
  addresses: Address[],
  recentOrders: Order[],
  wishlist: Product[],
  reviews: Review[],
  loyaltyHistory: LoyaltyPointHistory[],
  loginHistory: LoginActivity[]
}
```

---

## 6. CHECKLIST IMPLEMENTATION

### Phase 1: Cập nhật Entity User (Backend)

- [ ] Thêm trường `avatarUrl` (String, nullable)
- [ ] Thêm enum `Gender` (MALE, FEMALE, OTHER)
- [ ] Thêm trường `gender` (Gender, nullable)
- [ ] Thêm trường `dateOfBirth` (LocalDate, nullable)
- [ ] Thêm enum `AccountStatus` (ACTIVE, INACTIVE, BANNED, NEED_VERIFY)
- [ ] Thay `active: boolean` thành `status: AccountStatus`
- [ ] Thêm trường `isEmailVerified` (boolean, default false)
- [ ] Thêm trường `bannedReason` (String, nullable)
- [ ] Thêm trường `bannedAt` (LocalDateTime, nullable)
- [ ] Thêm trường `deletedAt` (LocalDateTime, nullable) cho soft delete
- [ ] Thêm trường `loyaltyPoints` (Integer, default 0)
- [ ] Thêm enum `CustomerTier` (BRONZE, SILVER, GOLD, PLATINUM)
- [ ] Thêm trường `tier` (CustomerTier, default BRONZE)
- [ ] Thêm trường `totalSpent` (BigDecimal, default 0)
- [ ] Thêm trường `totalOrders` (Integer, default 0) - hoặc tính từ orders.size()
- [ ] Thêm trường `lastLoginAt` (LocalDateTime, nullable)
- [ ] Thêm enum `AuthProvider` (LOCAL, GOOGLE, FACEBOOK)
- [ ] Thêm trường `provider` (AuthProvider, default LOCAL)
- [ ] Thêm trường `providerId` (String, nullable)
- [ ] Thêm `@SQLDelete` và `@Where` cho soft delete (nếu dùng Hibernate)
- [ ] Tạo migration script để thêm các cột mới

### Phase 2: Tạo các Entity mới (Backend)

- [ ] Tạo entity `CustomerTier` (nếu dùng bảng riêng)
- [ ] Tạo entity `LoyaltyPointHistory`
- [ ] Tạo entity `LoginActivity`
- [ ] Tạo entity `CustomerSegment` (nếu cần)
- [ ] Tạo entity `UserSegment` (nếu cần)
- [ ] Thêm relationships vào User entity

### Phase 3: Cập nhật Repository (Backend)

- [ ] Thêm method `findByEmailAndDeletedAtIsNull` (cho soft delete)
- [ ] Thêm method `findAllByTier` trong UserRepository
- [ ] Tạo `LoyaltyPointHistoryRepository`
- [ ] Tạo `LoginActivityRepository`
- [ ] Thêm Specification support cho filter nâng cao

### Phase 4: Cập nhật Service Layer (Backend)

- [ ] Cập nhật `AdminUserService`:
  - [ ] Method `updateUserRole` (với validation admin không tự đổi)
  - [ ] Method `getUserInsights`
  - [ ] Method `updateTier`
  - [ ] Method `banUser` (với reason)
  - [ ] Method `addLoyaltyPoints`
  - [ ] Method `getUserActivities`
  - [ ] Method `resetPassword`
  - [ ] Method `getUserDetail` (comprehensive)
- [ ] Tạo `LoyaltyPointService`:
  - [ ] Method `earnPoints` (tự động khi order completed)
  - [ ] Method `spendPoints` (khi dùng điểm giảm giá)
  - [ ] Method `getHistory`
- [ ] Tạo `LoginActivityService`:
  - [ ] Method `logLogin`
  - [ ] Method `getLoginHistory`
- [ ] Cập nhật `AuthService` để log login activity

### Phase 5: Cập nhật Controller (Backend)

- [ ] Thêm endpoint `PATCH /api/admin/users/{userId}/role`
- [ ] Thêm endpoint `GET /api/admin/users/{userId}/insights`
- [ ] Thêm endpoint `PATCH /api/admin/users/{userId}/tier`
- [ ] Thêm endpoint `PATCH /api/admin/users/{userId}/ban`
- [ ] Thêm endpoint `POST /api/admin/users/{userId}/loyalty-points`
- [ ] Thêm endpoint `GET /api/admin/users/{userId}/activities`
- [ ] Thêm endpoint `GET /api/admin/users/{userId}/detail`
- [ ] Thêm endpoint `POST /api/admin/users/{userId}/reset-password`
- [ ] Thêm endpoint `GET /api/admin/users/export`
- [ ] Cập nhật `GET /api/admin/users` với filter nâng cao

### Phase 6: Frontend - Service Layer

- [ ] Cập nhật `adminUserService.ts`:
  - [ ] Method `updateUserRole`
  - [ ] Method `getUserInsights`
  - [ ] Method `updateTier`
  - [ ] Method `banUser`
  - [ ] Method `addLoyaltyPoints`
  - [ ] Method `getUserActivities`
  - [ ] Method `resetPassword`
  - [ ] Method `getUserDetail`
  - [ ] Method `exportUsers`

### Phase 7: Frontend - AdminUsers Page

- [ ] Thêm cột "Hạng" (Tier) vào table
- [ ] Thêm cột "Tổng chi tiêu" vào table
- [ ] Thêm select "Vai trò" trong cột Vai trò (thay vì chỉ hiển thị)
- [ ] Validation: Disable select role nếu user.id === currentAdmin.id
- [ ] Thêm nút "Xem chi tiết" mở modal/drawer
- [ ] Thêm filter "Hạng" (Tier)
- [ ] Thêm filter "Tổng chi tiêu" (min/max)
- [ ] Thêm nút "Export CSV/Excel"
- [ ] Cập nhật UI để hiển thị trạng thái chi tiết hơn (ACTIVE/INACTIVE/BANNED)

### Phase 8: Frontend - User Detail Modal/Drawer

- [ ] Tab "Thông tin cơ bản":
  - [ ] Hiển thị avatar (có thể upload)
  - [ ] Form chỉnh sửa: email, tên, phone, gender, dateOfBirth
  - [ ] Select role (với validation)
  - [ ] Select status (ACTIVE/INACTIVE/BANNED/NEED_VERIFY)
  - [ ] Input bannedReason (nếu status = BANNED)
- [ ] Tab "Thống kê":
  - [ ] Cards: Tổng đơn, Tổng chi tiêu, AOV, Tỉ lệ hoàn hàng
  - [ ] Biểu đồ lịch sử mua hàng
  - [ ] Last login
- [ ] Tab "Đơn hàng":
  - [ ] Table danh sách đơn hàng
  - [ ] Link đến chi tiết đơn
- [ ] Tab "Wishlist":
  - [ ] Grid sản phẩm yêu thích
- [ ] Tab "Đánh giá":
  - [ ] List reviews đã viết
- [ ] Tab "Điểm thưởng":
  - [ ] Hiển thị số điểm hiện tại
  - [ ] Form thêm/bớt điểm (admin only)
  - [ ] Table lịch sử tích/tiêu điểm
- [ ] Tab "Hoạt động":
  - [ ] Table lịch sử đăng nhập
  - [ ] Hiển thị IP, device, location

### Phase 9: Business Logic - Tự động

- [ ] Job tính lại `totalSpent` từ orders (scheduled task)
- [ ] Job tính lại `totalOrders` từ orders (scheduled task)
- [ ] Job tự động phân hạng (tier) dựa trên totalSpent
- [ ] Tự động tích điểm khi order status = DELIVERED
- [ ] Tự động log login activity khi user đăng nhập
- [ ] Tự động cập nhật `lastLoginAt` khi user đăng nhập

### Phase 10: Testing & Documentation

- [ ] Unit tests cho các service mới
- [ ] Integration tests cho các API endpoints
- [ ] Test soft delete không ảnh hưởng đến orders/reviews
- [ ] Test admin không thể tự đổi role
- [ ] Test validation khi thêm/bớt điểm
- [ ] Cập nhật API documentation
- [ ] Cập nhật SRS với các tính năng mới

---

## 7. KẾT LUẬN

Module Quản lý Khách hàng hiện tại đã có nền tảng cơ bản nhưng còn thiếu nhiều tính năng quan trọng cho một hệ thống eCommerce hiện đại. Checklist trên cung cấp roadmap chi tiết để implement đầy đủ các nghiệp vụ cần thiết.

**Ưu tiên triển khai:**
1. **High Priority**: Soft delete, Thay đổi role, Thông tin cơ bản (avatar, gender, dateOfBirth)
2. **Medium Priority**: Loyalty points, Tier system, Customer insights
3. **Low Priority**: Login history, Export, Advanced segmentation

**Lưu ý:**
- Soft delete là bắt buộc để giữ lại lịch sử đơn hàng
- Tier system và Loyalty points cần thiết cho marketing và retention
- Login history giúp bảo mật và phát hiện gian lận

