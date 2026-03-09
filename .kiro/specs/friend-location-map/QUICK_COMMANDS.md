# Quick Commands - Database Reset & Fix

## 🚀 Quick Fix (Copy & Paste)

### 1. Reset Database (Windows)

```powershell
# Connect to PostgreSQL and reset database
psql -U postgres -c "DROP DATABASE IF EXISTS mapic; CREATE DATABASE mapic;"
psql -U postgres -d mapic -f server/FULL_DATABASE_SETUP.sql
```

### 2. Verify Database

```powershell
# Check users
psql -U postgres -d mapic -c "SELECT username, email, is_active FROM users;"

# Check posts
psql -U postgres -d mapic -c "SELECT COUNT(*) as post_count FROM posts;"

# Check locations
psql -U postgres -d mapic -c "SELECT COUNT(*) as location_count FROM user_locations WHERE is_current = TRUE;"
```

### 3. Restart Server

```powershell
# Navigate to server directory
cd server

# Start Spring Boot
./mvnw spring-boot:run
```

Or if using Maven wrapper on Windows:
```powershell
mvnw.cmd spring-boot:run
```

### 4. Clear Expo Cache (if needed)

```powershell
# Clear cache and restart
npx expo start -c
```

## 📋 Expected Output

### After Database Reset

```
DROP DATABASE
CREATE DATABASE
You are now connected to database "mapic" as user "postgres".
CREATE TABLE
CREATE TABLE
...
INSERT 0 7
INSERT 0 12
INSERT 0 17
...
```

### After Server Start

```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::                (v3.x.x)

✅ Started MapicApplication in X.XXX seconds
✅ Tomcat started on port(s): 8081
```

### After Login in App

```
LOG  🔐 Attempting login with: {"email": "testuser@mapic.com"}
LOG  ✅ Login successful: {"userId": "...", "nickName": "Test User"}
LOG  💾 Token saved to SecureStore
LOG  🔑 Token added to request: /posts/nearby
LOG  🔑 Token added to request: /locations/update
```

## 🔍 Quick Verification

### Check Database

```sql
-- Count users
SELECT COUNT(*) FROM users WHERE is_active = TRUE;
-- Expected: 7

-- List users
SELECT username, email, nick_name FROM users ORDER BY username;
-- Expected: testuser, minh, lan, hung, hoa, tuan, linh

-- Count posts
SELECT COUNT(*) FROM posts;
-- Expected: 17

-- Count friend locations
SELECT COUNT(*) FROM user_locations WHERE is_current = TRUE;
-- Expected: 6

-- Check friendships
SELECT COUNT(*) FROM friendships WHERE status = 'ACCEPTED';
-- Expected: 12 (6 bidirectional = 12 rows)
```

### Test Server

```powershell
# Test health (should return 405 - endpoint exists but wrong method)
curl http://192.168.1.5:8081/api/auth/login

# Test with POST (should work)
curl -X POST http://192.168.1.5:8081/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"testuser@mapic.com\",\"password\":\"password123\"}"
```

## 🐛 Troubleshooting Commands

### Database Issues

```powershell
# Check if PostgreSQL is running
pg_isready

# List all databases
psql -U postgres -l

# Connect to database
psql -U postgres -d mapic

# List tables
psql -U postgres -d mapic -c "\dt"

# Drop and recreate if needed
psql -U postgres -c "DROP DATABASE IF EXISTS mapic; CREATE DATABASE mapic;"
```

### Server Issues

```powershell
# Check if port 8081 is in use
netstat -an | findstr "8081"

# Kill process on port 8081 (if needed)
# Find PID first
netstat -ano | findstr "8081"
# Then kill
taskkill /PID <PID> /F

# Check Java version
java -version

# Check Maven
mvn -version
```

### App Issues

```powershell
# Clear Expo cache
npx expo start -c

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
cd client
rm -rf node_modules
npm install
```

## 📝 Test Credentials

All accounts use password: `password123`

```
testuser@mapic.com - Main test account (YOU)
minh@mapic.com     - Friend, at coffee shop
lan@mapic.com      - Friend, shopping
hung@mapic.com     - Friend, at tech meetup
hoa@mapic.com      - Friend, offline
tuan@mapic.com     - Friend, working out
linh@mapic.com     - Friend, at museum
```

## 🎯 One-Line Complete Reset

```powershell
# Complete reset in one command
psql -U postgres -c "DROP DATABASE IF EXISTS mapic; CREATE DATABASE mapic;" && psql -U postgres -d mapic -f server/FULL_DATABASE_SETUP.sql && echo "✅ Database reset complete!"
```

## 📊 Verification SQL Queries

```sql
-- Complete verification
SELECT 
    (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as active_users,
    (SELECT COUNT(*) FROM posts) as total_posts,
    (SELECT COUNT(*) FROM user_locations WHERE is_current = TRUE) as current_locations,
    (SELECT COUNT(*) FROM friendships WHERE status = 'ACCEPTED') as friendships,
    (SELECT COUNT(*) FROM avatar_frames) as avatar_frames;

-- Expected output:
-- active_users: 7
-- total_posts: 17
-- current_locations: 6
-- friendships: 12
-- avatar_frames: 5
```

## 🔄 Reset Everything (Nuclear Option)

If nothing works, reset everything:

```powershell
# 1. Stop server (Ctrl+C)

# 2. Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS mapic; CREATE DATABASE mapic;"
psql -U postgres -d mapic -f server/FULL_DATABASE_SETUP.sql

# 3. Clean server build
cd server
mvn clean
mvn install -DskipTests

# 4. Start server
./mvnw spring-boot:run

# 5. In another terminal, clear app
cd client
npx expo start -c

# 6. Uninstall app from device
# 7. Reinstall and login with testuser@mapic.com / password123
```

## ✅ Success Indicators

You know it's working when:

1. **Database:** 7 users, 17 posts, 6 locations
2. **Server:** Started on port 8081, no errors
3. **App:** Login successful, no 401 errors
4. **Map:** Shows posts and friend locations
5. **Console:** See token logs, no authentication errors

## 📞 Still Having Issues?

Check these files for detailed troubleshooting:
- `DATABASE_FIX_GUIDE.md` - Step-by-step guide
- `FIX_SUMMARY.md` - Technical details
- `CURRENT_STATUS.md` - Current state
- `TROUBLESHOOTING_GUIDE.md` - Common issues

Or verify:
1. PostgreSQL is running
2. Database "mapic" exists with data
3. Server is running on port 8081
4. App can reach server at 192.168.1.5:8081
5. Token is being saved and sent correctly
