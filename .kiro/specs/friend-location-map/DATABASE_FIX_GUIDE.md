# Database Fix Guide - 401 Authentication Error

## Vấn Đề

App đang gặp lỗi 401 "Full authentication is required" khi gọi API, mặc dù đã login thành công.

## Nguyên Nhân

1. **Token cũ từ database trước đó:** App đang sử dụng JWT token được generate từ database cũ
2. **Username mismatch:** Token chứa username từ user cũ, không match với database mới
3. **Database INSERT có vấn đề:** SQL file trước đó có `gen_random_uuid()` trong INSERT statements

## Giải Pháp

### 1. Fix SQL File ✅

File `server/FULL_DATABASE_SETUP.sql` đã được fix:

**Thay đổi:**
```sql
-- TRƯỚC (SAI):
INSERT INTO users (id, username, email, ...) VALUES
(gen_random_uuid(), 'testuser', 'testuser@mapic.com', ...);

-- SAU (ĐÚNG):
INSERT INTO users (username, email, ...) VALUES
('testuser', 'testuser@mapic.com', ...);
```

**Lý do:**
- Xóa `id` column khỏi INSERT để database tự động generate UUID
- Đảm bảo không có conflict với auto-generated IDs
- `username` column được insert đúng cho tất cả users

### 2. Reset Database

**Option A: Sử dụng psql command line**

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop và recreate database
DROP DATABASE IF EXISTS mapic;
CREATE DATABASE mapic;
\c mapic

# Run SQL file
\i server/FULL_DATABASE_SETUP.sql

# Verify
SELECT id, username, email, nick_name, is_active FROM users;
```

**Option B: Sử dụng pgAdmin hoặc DBeaver**

1. Right-click database → Delete/Drop
2. Create new database "mapic"
3. Open Query Tool
4. Load và run `server/FULL_DATABASE_SETUP.sql`

**Option C: Command line một dòng**

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS mapic; CREATE DATABASE mapic;"
psql -U postgres -d mapic -f server/FULL_DATABASE_SETUP.sql
```

### 3. Restart Spring Boot Server

**Tại sao cần restart?**
- Clear cached user data
- Reload database connections
- Ensure fresh state

**Cách restart:**

```bash
# Stop server (Ctrl+C)
# Then start again:
cd server
./mvnw spring-boot:run
```

Hoặc nếu dùng IDE (IntelliJ, Eclipse):
- Stop application
- Run lại

**Verify server started:**
```
✅ Started MapicApplication in X.XXX seconds
✅ Tomcat started on port(s): 8081
```

### 4. Clear App Token và Login Lại

**Option A: Logout trong app**

1. Mở app
2. Vào Settings tab (tab cuối)
3. Scroll xuống
4. Tap "Đăng xuất" / "Logout"
5. Login lại:
   - Email: `testuser@mapic.com`
   - Password: `password123`

**Option B: Reinstall app**

```bash
# Clear Expo cache
npx expo start -c

# Uninstall app từ device
# Reinstall và login lại
```

**Option C: Clear SecureStore programmatically**

Nếu cần, có thể thêm code để clear token:

```typescript
import * as SecureStore from 'expo-secure-store';

// Clear all auth data
await SecureStore.deleteItemAsync('userToken');
await SecureStore.deleteItemAsync('userData');
```

## Verification Checklist

Sau khi thực hiện các bước trên:

### Database
- [ ] Database "mapic" đã được recreate
- [ ] 7 users tồn tại (testuser, minh, lan, hung, hoa, tuan, linh)
- [ ] Tất cả users có `is_active = TRUE`
- [ ] Tất cả users có `username` column không NULL
- [ ] 17 posts tồn tại
- [ ] 6 friend locations tồn tại

```sql
-- Verify users
SELECT COUNT(*) FROM users WHERE is_active = TRUE;
-- Should return: 7

-- Verify posts
SELECT COUNT(*) FROM posts;
-- Should return: 17

-- Verify locations
SELECT COUNT(*) FROM user_locations WHERE is_current = TRUE;
-- Should return: 6
```

### Server
- [ ] Spring Boot server đang chạy
- [ ] No errors trong console
- [ ] Port 8081 accessible

```bash
# Test server
curl http://192.168.1.5:8081/api/auth/login
# Should return: 405 Method Not Allowed (expected, means endpoint exists)
```

### App
- [ ] Login thành công với testuser@mapic.com
- [ ] Không còn lỗi 401 trong console
- [ ] Posts hiển thị trên map (17 posts)
- [ ] Friend locations hiển thị (6 friends)
- [ ] MapLayerToggle hoạt động
- [ ] Có thể tap markers
- [ ] Privacy settings load được

## Debug Tips

### Nếu vẫn gặp 401 sau khi fix:

1. **Check token trong app:**
   ```typescript
   // Thêm log trong client/src/services/api/client.ts
   console.log('🔑 Token:', token);
   ```

2. **Check server logs:**
   ```
   # Tìm dòng này trong server console:
   ✅ Login successful - Token generated for: testuser
   ```

3. **Verify username trong database:**
   ```sql
   SELECT id, username, email FROM users WHERE email = 'testuser@mapic.com';
   -- username phải là 'testuser', không phải NULL
   ```

4. **Test JWT token:**
   - Copy token từ app logs
   - Paste vào https://jwt.io
   - Check "sub" field = "testuser"

### Nếu database không có data:

```sql
-- Check if tables exist
\dt

-- Check users
SELECT * FROM users;

-- If empty, run SQL file again
\i server/FULL_DATABASE_SETUP.sql
```

## Test Credentials

Sau khi fix, có thể login với bất kỳ account nào:

| Email | Password | Username | Nick Name |
|-------|----------|----------|-----------|
| testuser@mapic.com | password123 | testuser | Test User |
| minh@mapic.com | password123 | minh | Minh Nguyen |
| lan@mapic.com | password123 | lan | Lan Tran |
| hung@mapic.com | password123 | hung | Hung Le |
| hoa@mapic.com | password123 | hoa | Hoa Pham |
| tuan@mapic.com | password123 | tuan | Tuan Vo |
| linh@mapic.com | password123 | linh | Linh Nguyen |

Tất cả accounts:
- ✅ Active (is_active = TRUE)
- ✅ Password: `password123`
- ✅ Username field populated
- ✅ Can login immediately

## Summary

**Root Cause:** App sử dụng JWT token từ database cũ, token chứa username không tồn tại trong database mới.

**Solution:** 
1. ✅ Fix SQL file (remove `id` from INSERT)
2. ✅ Reset database với SQL file mới
3. ✅ Restart server
4. ✅ Logout và login lại trong app

**Expected Result:** App hoạt động bình thường, không còn lỗi 401.
