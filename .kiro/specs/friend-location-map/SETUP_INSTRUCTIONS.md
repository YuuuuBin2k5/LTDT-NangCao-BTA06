# Hướng Dẫn Setup - Friend Location Map

## ⚠️ Vấn Đề Hiện Tại
- Không thấy posts hoặc friends trên map
- Có thể do: database chưa có dữ liệu hoặc PostGIS chưa được enable

## ✅ Giải Pháp - 4 Bước Đơn Giản

### Bước 1: Enable PostGIS và Import Dữ Liệu Test

Mở terminal và chạy lệnh sau (thay `postgres` và `mapic_db` nếu khác):

```bash
# Import file complete_test_data.sql (file này đã có sẵn PostGIS extension)
psql -U postgres -d mapic_db -f server/complete_test_data.sql
```

**File này sẽ:**
- ✅ Enable PostGIS extension
- ✅ Xóa dữ liệu cũ (nếu có)
- ✅ Tạo 8 users (testuser + 6 friends + 1 stranger)
- ✅ Tạo friendships giữa các users
- ✅ Tạo 17 posts với locations ở TP.HCM
- ✅ Tạo friend locations (vị trí hiện tại của bạn bè)
- ✅ Tạo avatar frames
- ✅ Tạo friend interactions
- ✅ Tạo likes và comments

**Tài khoản test:**
- Email: `testuser@mapic.com`
- Password: `password123`
- Vị trí: Nguyen Hue Walking Street (10.7743, 106.7011)

**Bạn bè online:**
- `minh@mapic.com` - 500m away, có status "Working from cafe ☕"
- `lan@mapic.com` - 300m away, có status "Shopping time 🛍️"
- `hung@mapic.com` - 2km away
- `tuan@mapic.com` - 1km away, close friend, có status "At the gym 💪"
- `linh@mapic.com` - 200m away, có status "At art museum 🎨"

**Bạn bè offline:**
- `hoa@mapic.com` - last seen 2 hours ago

### Bước 2: Restart Spring Boot Server

```bash
cd server
# Stop server nếu đang chạy (Ctrl+C)
mvn spring-boot:run
```

**Kiểm tra log:**
- Phải thấy: `Started MapicApplication`
- KHÔNG có lỗi về PostGIS

### Bước 3: Clear Metro Cache và Restart Client

```bash
cd client
# Stop Metro nếu đang chạy (Ctrl+C)
npx expo start -c
```

**Lưu ý:** Flag `-c` sẽ clear cache để fix lỗi AsyncStorage

### Bước 4: Test Trên App

1. **Login:**
   - Email: `testuser@mapic.com`
   - Password: `password123`

2. **Vào Home Tab:**
   - Phải thấy MapLayerToggle ở góc trên trái
   - Phải thấy Privacy indicator (👥 Tất cả) bên dưới toggle

3. **Test Layer Toggle:**
   - Chọn "Bài viết" → Phải thấy 17 post markers (📍)
   - Chọn "Bạn bè" → Phải thấy 5-6 friend markers (avatar)
   - Chọn "Cả hai" → Phải thấy cả posts và friends

4. **Test Interactions:**
   - Tap vào post marker → Xem post card
   - Tap vào friend marker → Xem friend details
   - Tap vào marker của mình → Set status message
   - Gửi interaction (heart, wave) cho bạn

## 🔍 Kiểm Tra Nếu Vẫn Lỗi

### Kiểm tra database có dữ liệu:
```bash
psql -U postgres -d mapic_db

-- Kiểm tra posts
SELECT COUNT(*) FROM posts;
-- Kết quả phải là: 17

-- Kiểm tra users
SELECT COUNT(*) FROM users;
-- Kết quả phải là: 8

-- Kiểm tra friend locations
SELECT COUNT(*) FROM user_locations WHERE is_current = true;
-- Kết quả phải là: 7

-- Kiểm tra PostGIS
SELECT * FROM pg_extension WHERE extname = 'postgis';
-- Phải có 1 row

\q
```

### Kiểm tra API từ browser hoặc curl:
```bash
# Test posts endpoint
curl "http://192.168.1.5:8081/api/posts/nearby?latitude=10.7743&longitude=106.7011&radius=5.0"

# Phải trả về JSON với 17 posts
```

### Kiểm tra logs:

**Client logs (Metro terminal):**
```
✅ Auto-login successful          <- Login OK
📍 Updating location on server    <- Location tracking OK
✅ Friend locations fetched        <- Friend data OK
```

**Server logs:**
```
Started MapicApplication           <- Server started
HHH000001: Hibernate ORM          <- Database connected
```

## 📍 Vị Trí Test Data

Tất cả dữ liệu test nằm ở khu vực **District 1, TP.HCM**:
- Center: Nguyen Hue Walking Street (10.7743, 106.7011)
- Radius: ~2km

Nếu bạn test ở vị trí khác, có thể không thấy posts. Giải pháp:
1. Zoom out map để thấy toàn bộ TP.HCM
2. Hoặc thay đổi vị trí GPS simulator về TP.HCM

## ✅ Kết Quả Mong Đợi

Sau khi hoàn thành 4 bước trên:
- ✅ Map hiển thị với vị trí hiện tại
- ✅ MapLayerToggle hoạt động
- ✅ Thấy 17 post markers khi chọn "Bài viết"
- ✅ Thấy 5-6 friend markers khi chọn "Bạn bè"
- ✅ Tap markers để xem details
- ✅ Gửi interactions cho bạn bè
- ✅ Set status message cho mình

## 🎯 Tính Năng Đã Hoàn Thành

### Phase 2 Integration (100% Complete):
- ✅ Map layer toggle (Posts/Friends/Both)
- ✅ Friend markers on map
- ✅ Privacy mode indicator
- ✅ Friend details bottom sheet
- ✅ Interaction effects overlay
- ✅ Status message input
- ✅ Avatar frame selector in Settings
- ✅ Location privacy settings
- ✅ Viewport filtering for performance

### Backend (100% Complete):
- ✅ All REST endpoints
- ✅ PostGIS integration
- ✅ Privacy filtering
- ✅ Interaction cooldown
- ✅ Avatar frame unlock system
- ✅ Proximity notifications

## 📞 Nếu Vẫn Gặp Vấn Đề

Hãy cung cấp:
1. Output của lệnh kiểm tra database ở trên
2. Server logs khi khởi động
3. Client logs từ Metro terminal
4. Screenshot của map (nếu có)

Tôi sẽ giúp debug tiếp!
