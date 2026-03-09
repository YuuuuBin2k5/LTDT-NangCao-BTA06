# Báo cáo Quá trình Thực hiện Dự án MAPIC (BTA02 - BTA06)

Tài liệu này tóm tắt các logic và công nghệ cốt lõi được sử dụng trong quá trình phát triển ứng dụng MAPIC qua các giai đoạn bài tập cá nhân.

---

## 🔐 Bài tập A02: Xác thực & Bảo mật (Auth & Security)
**Nội dung:** Đăng ký (OTP), Đăng nhập (JWT), Quên mật khẩu (OTP).

*   **Logic:** 
    *   **Register:** Sử dụng `EmailService` để gửi mã OTP 6 số. Tài khoản ở trạng thái `INACTIVE` cho đến khi verify thành công.
    *   **Login:** Xác thực thông tin và trả về **JWT Token** (Stored in SecureStore).
    *   **Forget Password:** Verify qua OTP trước khi cho phép cập nhật mật khẩu mới (`BCrypt` hashing).
*   **Công nghệ:** Spring Security, JWT, Java Mail Sender, BCrypt, Expo SecureStore.

---

## 🏠 Bài tập A03: Kiến trúc & Trang chủ (Home Screen)
**Nội dung:** Xây dựng cấu trúc dự án và giao diện trang chủ chính.

*   **Logic:**
    *   **Kiến trúc:** Triển khai mô hình **Layered Architecture** (Controller -> Service -> Repository) cho Backend và **Feature-based** cho Frontend.
    *   **Bảo mật API:** Áp dụng JWT Authentication filter, CORS configuration, Password Encrypting, và Input Validation.
    *   **Giao diện:** Tích hợp `react-native-maps` để làm trung tâm của ứng dụng. Điều hướng bằng `Expo Router` (Tab & Stack).
*   **Công nghệ:** Tailwind CSS (NativeWind), React Navigation, Expo Router, Spring Boot.

---

## 👤 Bài tập A04: Profile & Tìm kiếm (Features)
**Nội dung:** Quản lý cá nhân, Tìm kiếm địa điểm, Chi tiết địa điểm.

*   **Logic:**
    *   **Profile:** Chức năng upload Avatar sử dụng `MultipartFile` và lưu trữ local. Đồng bộ hóa thông qua `AuthContext` cập nhật tức thời (Update Local State).
    *   **Search & Filter:** Tìm kiếm địa điểm (Posts/Places) theo keyword và khoảng cách (GPS).
    *   **Detail:** Hiển thị thông tin chi tiết, hình ảnh Carousel và các đánh giá liên quan.
*   **Công nghệ:** Expo ImagePicker, PostGIS (cho địa lý), Lucene/JPA Search.

---

## 📊 Bài tập A05: Tối ưu hóa Trang chủ & Category
**Nội dung:** Category Slide, Top 10 Trending, 20 Discount Products.

*   **Logic (Áp dụng cho MAPIC):**
    *   **Categories:** Slider ngang hiển thị các loại hình (Ẩm thực, Văn hóa, Thiên nhiên...).
    *   **Trending (Top 10):** Truy vấn dựa trên số lượng tương tác (Like/View) trong 7 ngày gần nhất.
    *   **Grid View (2 cột):** Hiển thị danh sách bài viết/địa điểm theo dạng Masonry để tối ưu diện tích và thẩm mỹ.
*   **Công nghệ:** React Native Reanimated (Animations), Hook `useMemo` & `useCallback` để tối ưu render.

---

## 🛒 Bài tập A06: State Management & Mission Journey
**Nội dung:** Quản lý State (Zustand), Phân trang, Giỏ hàng nhiệm vụ (Cart), Theo dõi hành trình.

*   **Logic:**
    *   **State Management:** Sử dụng **Zustand** cho Cart (Mission Journey) và Privacy Settings. Sử dụng **TanStack Query** để quản lý Server State (Caching, Pagination).
    *   **Lazy Loading:** Áp dụng Infinite Scroll cho danh sách Nhiệm vụ (Missions) và Bảng tin (Feed).
    *   **Mission Cart (Giỏ hàng):** Cho phép người dùng chọn nhiều mục tiêu trước khi "Bắt đầu hành trình". Trạng thái được lưu trên cả Server và Local.
    *   **Hành trình (Tracker):** Theo dõi 6 trạng thái đơn hàng/nhiệm vụ (Mới -> Đã xác nhận -> Đang thực hiện -> Đã đến điểm -> Hoàn thành -> Hủy).
    *   **Thanh toán/Check-in:** Xác thực hoàn thành nhiệm vụ bằng GPS (Geofencing) thay cho COD truyền thống.
*   **Công nghệ:** Zustand, TanStack Query, Expo Location, AsyncStorage.

---

**Người thực hiện:** YuuuuBin2k5
**Dự án:** MAPIC - Local Discovery App
