# BỎ POSTGIS - HƯỚNG DẪN NHANH

## ✅ ĐÃ SỬA

Đã bỏ hoàn toàn PostGIS khỏi Java code:

### 1. Entity Classes
- ✅ `UserLocation.java` - Bỏ `Point location`, chỉ dùng `latitude/longitude`
- ✅ `CurrentLocation.java` - Đã dùng `latitude/longitude` từ trước

### 2. Service Classes
- ✅ `LocationService.java` - Bỏ `GeometryFactory`, bỏ tạo `Point`

### 3. Repository Classes
- ✅ `PostRepository.java` - Thay `earth_distance()` bằng Haversine formula
- ✅ `UserLocationRepository.java` - Thay `ST_Distance()` bằng Haversine formula

### 4. Database Schema
- ✅ `FULL_DATABASE_SETUP.sql` - Đã dùng `DOUBLE PRECISION` cho lat/lng

## 🚀 CHẠY LẠI

### Bước 1: Kill server hiện tại
```powershell
# Tìm PID
netstat -ano | findstr :8081

# Kill process (thay 13452 bằng PID của bạn)
taskkill /F /PID 13452
```

### Bước 2: Reset database
```powershell
# Vào thư mục server
cd server

# Drop và tạo lại database
psql -U postgres -c "DROP DATABASE IF EXISTS mapic_db;"
psql -U postgres -c "CREATE DATABASE mapic_db;"

# Chạy SQL setup (KHÔNG CẦN PostGIS!)
psql -U postgres -d mapic_db -f FULL_DATABASE_SETUP.sql
```

### Bước 3: Compile và chạy server
```powershell
# Vẫn trong thư mục server
./mvnw clean compile
./mvnw spring-boot:run
```

### Bước 4: Test trong app
1. Logout khỏi app
2. Login lại với `testuser@mapic.com` / `password123`
3. Kiểm tra:
   - Posts hiển thị trên map
   - Friend locations hiển thị
   - Update location không bị lỗi 400

## 📝 THAY ĐỔI CHÍNH

### Haversine Formula
Thay PostGIS functions bằng công thức Haversine:

```sql
-- Trước (PostGIS):
earth_distance(ll_to_earth(lat1, lng1), ll_to_earth(lat2, lng2))

-- Sau (Haversine):
6371000 * acos(
    cos(radians(lat1)) * cos(radians(lat2)) *
    cos(radians(lng2) - radians(lng1)) +
    sin(radians(lat1)) * sin(radians(lat2))
)
```

### Entity Changes
```java
// Trước:
@Column(name = "location", columnDefinition = "geography(Point, 4326)")
private Point location;

// Sau:
@Column(nullable = false)
private Double latitude;

@Column(nullable = false)
private Double longitude;
```

## ⚠️ LƯU Ý

- Haversine formula chính xác đủ cho khoảng cách < 1000km
- Không cần PostGIS extension trong PostgreSQL
- Database đơn giản hơn, dễ backup/restore
- Performance tương đương cho app này

## 🎯 KẾT QUẢ MONG ĐỢI

Sau khi chạy lại:
- ✅ Server khởi động không lỗi
- ✅ Login thành công
- ✅ `/posts/nearby` trả về posts
- ✅ `/locations/update` không lỗi 400
- ✅ Friend locations hiển thị trên map
