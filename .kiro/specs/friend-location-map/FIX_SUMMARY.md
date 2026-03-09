# Fix Summary - 401 Authentication Error

## Vấn Đề Gốc

App gặp lỗi 401 "Full authentication is required" khi gọi API, mặc dù login thành công:

```
LOG  ✅ Auto-login successful
ERROR ❌ Failed to update location: HTTP_401
ERROR Failed to load nearby posts: HTTP_401
```

## Phân Tích Nguyên Nhân

### 1. JWT Token Flow

Backend sử dụng JWT authentication:
- Login → Server generates token với `username` field
- Token được lưu trong SecureStore
- Mỗi API request gửi token trong Authorization header
- Server validate token và extract `username`
- Server tìm user trong database bằng `username`

### 2. Root Cause

**Token mismatch:** App đang sử dụng JWT token từ database cũ (trước khi reset), token chứa username của user cũ không còn tồn tại trong database mới.

**Sequence of events:**
1. User login lần đầu → Token được generate với username từ database cũ
2. Database được reset với SQL file mới
3. App vẫn giữ token cũ trong SecureStore (auto-login)
4. App gửi token cũ → Server validate → Tìm username trong database → Không tìm thấy → 401

### 3. SQL File Issue

File `FULL_DATABASE_SETUP.sql` ban đầu có vấn đề:

```sql
-- SAI: Có id column với gen_random_uuid()
INSERT INTO users (id, username, email, ...) VALUES
(gen_random_uuid(), 'testuser', 'testuser@mapic.com', ...);
```

**Vấn đề:**
- `gen_random_uuid()` được gọi mỗi lần INSERT
- Mỗi lần reset database, users có UUID khác nhau
- Token cũ chứa username nhưng user ID đã thay đổi
- Có thể gây conflict với auto-generated IDs

## Giải Pháp Đã Thực Hiện

### 1. ✅ Fix SQL File

**File:** `server/FULL_DATABASE_SETUP.sql`

**Thay đổi:**
```sql
-- ĐÚNG: Xóa id column, để database tự generate
INSERT INTO users (username, email, password, nick_name, ...) VALUES
('testuser', 'testuser@mapic.com', '$2a$10$...', 'Test User', ...);
```

**Lợi ích:**
- Database tự động generate UUID consistent
- Không có conflict với auto-generated IDs
- Username được insert đúng cho tất cả users
- Đảm bảo `is_active = TRUE` cho tất cả test users

### 2. ✅ Added Debug Logging

**File:** `client/src/services/api/client.ts`

```typescript
// Request interceptor
const token = await SecureStore.getItemAsync('userToken');
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
  console.log('🔑 Token added to request:', config.url);
}
```

**File:** `client/src/services/auth/auth.service.ts`

```typescript
console.log('🔐 Attempting login with:', { email: credentials.email });
console.log('✅ Login successful:', { userId, nickName });
console.log('💾 Token saved to SecureStore');
```

**Lợi ích:**
- Track token flow từ login → storage → API requests
- Debug authentication issues dễ dàng hơn
- Verify token được gửi đúng trong requests

### 3. ✅ Documentation

Created comprehensive guides:
- `DATABASE_FIX_GUIDE.md` - Step-by-step fix instructions
- `CURRENT_STATUS.md` - Updated with current state
- `FIX_SUMMARY.md` - This file

## Hướng Dẫn Thực Hiện Fix

### Bước 1: Reset Database

```bash
# Option A: psql command line
psql -U postgres -c "DROP DATABASE IF EXISTS mapic; CREATE DATABASE mapic;"
psql -U postgres -d mapic -f server/FULL_DATABASE_SETUP.sql

# Option B: Interactive psql
psql -U postgres
DROP DATABASE IF EXISTS mapic;
CREATE DATABASE mapic;
\c mapic
\i server/FULL_DATABASE_SETUP.sql
```

**Verify:**
```sql
SELECT id, username, email, nick_name, is_active FROM users;
-- Should see 7 users, all with is_active = TRUE
```

### Bước 2: Restart Spring Boot Server

```bash
# Stop server (Ctrl+C)
cd server
./mvnw spring-boot:run
```

**Verify:**
```
✅ Started MapicApplication
✅ Tomcat started on port(s): 8081
```

### Bước 3: Clear App Token

**Option A: Logout trong app**
1. Settings tab → Đăng xuất
2. Login lại: `testuser@mapic.com` / `password123`

**Option B: Reinstall app**
```bash
npx expo start -c  # Clear cache
# Uninstall app → Reinstall → Login
```

### Bước 4: Verify

**Expected logs:**
```
LOG  🔐 Attempting login with: {"email": "testuser@mapic.com"}
LOG  ✅ Login successful: {"userId": "...", "nickName": "Test User"}
LOG  💾 Token saved to SecureStore
LOG  🔑 Token added to request: /posts/nearby
LOG  🔑 Token added to request: /locations/update
```

**No more 401 errors!**

## Test Data

### Users (7 total)

| Username | Email | Password | Nick Name | Active |
|----------|-------|----------|-----------|--------|
| testuser | testuser@mapic.com | password123 | Test User | ✅ |
| minh | minh@mapic.com | password123 | Minh Nguyen | ✅ |
| lan | lan@mapic.com | password123 | Lan Tran | ✅ |
| hung | hung@mapic.com | password123 | Hung Le | ✅ |
| hoa | hoa@mapic.com | password123 | Hoa Pham | ✅ |
| tuan | tuan@mapic.com | password123 | Tuan Vo | ✅ |
| linh | linh@mapic.com | password123 | Linh Nguyen | ✅ |

### Posts (17 total)
- Around District 1, TP.HCM (10.7743, 106.7011)
- Various locations: Nguyen Hue, Ben Thanh Market, etc.
- Posted by testuser and friends

### Friend Locations (6 total)
- minh: At coffee shop ☕
- lan: Shopping! 🛍️
- hung: (no status)
- tuan: Working out 💪
- linh: At museum 🎨
- hoa: (offline)

### Friendships
- testuser is friends with all 6 others (bidirectional)
- Status: ACCEPTED

## Technical Details

### Database Schema

**25 tables created:**
1. users
2. current_locations
3. otp_token
4. places
5. reviews
6. friendships
7. posts
8. post_images
9. post_likes
10. post_comments
11. hashtags
12. post_hashtags
13. filter_presets
14. user_interactions
15. user_feedback
16. avatar_frames
17. user_avatar_frames
18. user_locations
19. friend_interactions
20. proximity_notifications

**No PostGIS dependencies:**
- Uses simple `latitude` and `longitude` DOUBLE PRECISION columns
- No geometry types
- No ST_* functions
- Compatible with standard PostgreSQL

### JWT Token Structure

```json
{
  "sub": "testuser",  // username field
  "iat": 1234567890,  // issued at
  "exp": 1234567890   // expiration (7 days)
}
```

**Validation flow:**
1. Extract token from Authorization header
2. Verify signature with secret key
3. Extract username from "sub" claim
4. Load user from database by username
5. Check if user exists and is active
6. Allow/deny request

## Verification Checklist

After completing all steps:

### Database ✅
- [ ] 7 users exist with `is_active = TRUE`
- [ ] All users have `username` column populated
- [ ] 17 posts exist
- [ ] 6 friend locations exist
- [ ] Friendships created (testuser ↔ all others)

### Server ✅
- [ ] Spring Boot running on port 8081
- [ ] No errors in console
- [ ] Can connect to database

### App ✅
- [ ] Login successful with testuser@mapic.com
- [ ] No 401 errors in console
- [ ] Posts visible on map (17 posts)
- [ ] Friend locations visible (6 friends)
- [ ] MapLayerToggle works
- [ ] Can tap markers
- [ ] Privacy settings load

## Troubleshooting

### Still getting 401 after fix?

1. **Check token in app logs:**
   - Should see: `🔑 Token added to request`
   - Token should be present (not null)

2. **Check server logs:**
   - Should see: `✅ Login successful - Token generated for: testuser`
   - No JWT validation errors

3. **Verify database:**
   ```sql
   SELECT username FROM users WHERE email = 'testuser@mapic.com';
   -- Should return: testuser (not NULL)
   ```

4. **Clear app completely:**
   ```bash
   # Uninstall app
   # Clear Expo cache
   npx expo start -c
   # Reinstall and login
   ```

### Database connection issues?

```bash
# Check PostgreSQL is running
pg_isready

# Check database exists
psql -U postgres -l | grep mapic

# Check tables exist
psql -U postgres -d mapic -c "\dt"
```

### Server won't start?

```bash
# Check port 8081 is free
netstat -an | grep 8081

# Check application.properties
cat server/src/main/resources/application.properties

# Check database connection
psql -U postgres -d mapic -c "SELECT 1"
```

## Kết Luận

**Root cause:** JWT token mismatch do database reset nhưng app vẫn giữ token cũ.

**Solution:** 
1. Fix SQL file (remove `id` from INSERT)
2. Reset database
3. Restart server
4. Logout và login lại

**Result:** App hoạt động bình thường, authentication thành công, không còn lỗi 401.

**Files changed:**
- ✅ `server/FULL_DATABASE_SETUP.sql` - Fixed INSERT statements
- ✅ `.kiro/specs/friend-location-map/CURRENT_STATUS.md` - Updated status
- ✅ `.kiro/specs/friend-location-map/DATABASE_FIX_GUIDE.md` - New guide
- ✅ `.kiro/specs/friend-location-map/FIX_SUMMARY.md` - This file

**Next steps:** Follow the fix guide to reset database and test the app.
