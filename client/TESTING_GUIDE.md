# Hướng Dẫn Kiểm Thử - Profile & Security Enhancement

## Tổng Quan

Tài liệu này cung cấp hướng dẫn chi tiết để kiểm thử các tính năng bảo mật và quản lý hồ sơ người dùng.

## 1. Kiểm Thử Đổi Mật Khẩu (Change Password)

### 1.1. Test Cases Thành Công

**TC-CP-001: Đổi mật khẩu thành công**
- **Điều kiện tiên quyết**: Người dùng đã đăng nhập
- **Các bước**:
  1. Mở màn hình Settings
  2. Chọn "Đổi mật khẩu"
  3. Nhập mật khẩu hiện tại đúng
  4. Nhập mật khẩu mới (tối thiểu 6 ký tự)
  5. Nhập xác nhận mật khẩu mới (khớp với mật khẩu mới)
  6. Nhấn "Đổi mật khẩu"
- **Kết quả mong đợi**:
  - Hiển thị loading indicator
  - Thông báo thành công: "Đổi mật khẩu thành công"
  - Form được reset về trạng thái ban đầu
  - Có thể đăng nhập với mật khẩu mới

### 1.2. Test Cases Lỗi Validation

**TC-CP-002: Mật khẩu hiện tại trống**
- **Các bước**: Để trống trường "Mật khẩu hiện tại", nhập các trường khác
- **Kết quả**: Hiển thị lỗi "Vui lòng nhập mật khẩu hiện tại"

**TC-CP-003: Mật khẩu mới trống**
- **Các bước**: Nhập mật khẩu hiện tại, để trống mật khẩu mới
- **Kết quả**: Hiển thị lỗi "Vui lòng nhập mật khẩu mới"

**TC-CP-004: Mật khẩu mới quá ngắn**
- **Các bước**: Nhập mật khẩu mới < 6 ký tự
- **Kết quả**: Hiển thị lỗi "Mật khẩu phải có ít nhất 6 ký tự"

**TC-CP-005: Xác nhận mật khẩu không khớp**
