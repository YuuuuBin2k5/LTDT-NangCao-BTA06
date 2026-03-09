# Test Friend Locations API

## Bước 1: Reset Database với dữ liệu mẫu

Chạy lệnh sau trong PostgreSQL:

```bash
psql -U postgres -d mapic_db -f FULL_DATABASE_SETUP.sql
```

Hoặc dùng pgAdmin để chạy file `FULL_DATABASE_SETUP.sql`

## Bước 2: Kiểm tra dữ liệu trong database

```sql
-- Check current friend locations
SELECT 
    u.username,
    ul.latitude,
    ul.longitude,
    ul.is_current,
    ul.status_message,
    ul.created_at
FROM user_locations ul
JOIN users u ON ul.user_id = u.id
WHERE ul.is_current = TRUE
ORDER BY u.username;
```

Kết quả mong đợi: 6 bạn bè có vị trí hiện tại (minh, lan, hung, tuan, linh, hoa)

## Bước 3: Test API bằng curl hoặc Postman

### Login để lấy token:

```bash
curl -X POST http://192.168.1.5:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@mapic.com","password":"password123"}'
```

Lưu lại `token` từ response.

### Get friend locations:

```bash
curl -X GET http://192.168.1.5:8081/api/locations/friends \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

Kết quả mong đợi: Array có 6 friend locations với thông tin:
- userId
- username  
- nickName
- avatarUrl
- latitude
- longitude
- lastUpdated
- statusMessage (optional)
- statusEmoji (optional)

## Bước 4: Kiểm tra trong app

1. Mở app và login với `testuser@mapic.com` / `password123`
2. Vào tab "Friends" hoặc "Friend Map"
3. Bật layer "Friend Locations" trên map
4. Bạn sẽ thấy 6 markers của bạn bè xung quanh District 1, TP.HCM

## Vị trí các bạn bè (test data):

- **testuser**: 10.7743, 106.7011 (Nguyen Hue Walking Street)
- **minh**: 10.7797, 106.6991 (Starbucks Reserve) - "At coffee shop ☕"
- **lan**: 10.7768, 106.7009 (Vincom Center) - "Shopping! 🛍️"
- **hung**: 10.7854, 106.6995 (Dreamplex)
- **tuan**: 10.7823, 106.6976 (Tao Dan Park) - "Working out 💪"
- **linh**: 10.7689, 106.7001 (HCMC Museum) - "At museum 🎨"

Tất cả đều ở gần nhau trong District 1, nên sẽ thấy trên cùng một map view.

## Troubleshooting

### Không thấy bạn bè trên map?

1. **Kiểm tra API response**: Xem console log trong app, tìm log "Retrieved X friend locations"
2. **Kiểm tra database**: Chạy query ở Bước 2 để xác nhận dữ liệu có trong DB
3. **Kiểm tra friendships**: 
   ```sql
   SELECT * FROM friendships 
   WHERE (user_id = (SELECT id FROM users WHERE email = 'testuser@mapic.com')
      OR friend_id = (SELECT id FROM users WHERE email = 'testuser@mapic.com'))
     AND status = 'ACCEPTED';
   ```
4. **Restart server**: Đảm bảo server đã load code mới nhất
5. **Check app logs**: Xem có error nào khi gọi `/locations/friends` không
