# Quick Fix - 401 Authentication Error

## ✅ Problem Fixed: AsyncStorage Package

The missing AsyncStorage package has been installed:
```bash
✅ Installed: @react-native-async-storage/async-storage@2.2.0
```

## ⚠️ Current Issue: Invalid Token

Your app is using an old/expired token from a previous session. The logs show:
```
✅ Auto-login successful  ← Token retrieved from storage
❌ HTTP 401 errors        ← But token is invalid/expired
```

## 🔧 Solution: Logout and Login Again

### Step 1: Logout
1. Open the app (it should be running)
2. Go to **Settings** tab (last tab)
3. Scroll down
4. Tap **"Đăng xuất"** or **"Logout"**

### Step 2: Login with Test Account
Use these credentials:
- **Email:** `testuser@mapic.com`
- **Password:** `password123`

### Step 3: Verify Everything Works
After login, you should see:
- ✅ No more 401 errors in console
- ✅ 17 posts on the map (around District 1, TP.HCM)
- ✅ 6 friend locations on the map
- ✅ MapLayerToggle at top (Posts / Friends / Both)
- ✅ Privacy indicator showing current mode
- ✅ Can tap markers to see details

## 📊 Test Data Available

The database has been set up with:
- **7 users** (testuser + 6 friends)
- **17 posts** around District 1, TP.HCM
- **6 friend locations** with different statuses
- **Friendships** between users
- **Avatar frames** to unlock
- **Interactions** history

## 🎯 What to Test After Login

1. **Map Layer Toggle:**
   - Switch between "Bài viết", "Bạn bè", "Cả hai"
   - Verify markers appear/disappear correctly

2. **Post Markers:**
   - Tap on post markers
   - View post details
   - Like/comment functionality

3. **Friend Markers:**
   - Tap on friend markers
   - View friend details
   - Send interactions (wave, heart, poke)
   - Get directions

4. **Privacy Settings:**
   - Tap privacy indicator
   - Change privacy mode
   - Manage close friends list

5. **Avatar Frames:**
   - Go to Settings tab
   - Tap "Khung avatar"
   - View unlocked frames
   - See unlock conditions

6. **Status Message:**
   - Tap your own marker
   - Set status message
   - View status on marker

## 🚨 If Still Having Issues

If you still get 401 errors after logout/login:

1. **Check server is running:**
   ```bash
   # Should respond with login endpoint
   curl http://192.168.1.5:8081/api/auth/login
   ```

2. **Verify database has data:**
   ```sql
   SELECT email, nick_name FROM users WHERE email = 'testuser@mapic.com';
   ```

3. **Clear app completely:**
   - Uninstall app from device
   - Run: `npx expo start -c` (clear cache)
   - Reinstall and login again

4. **Check API URL:**
   - File: `client/src/shared/constants/api.constants.ts`
   - Should be: `http://192.168.1.5:8081/api`

## 📝 Summary

- ✅ AsyncStorage package installed (v2.2.0)
- ✅ App is running
- ⚠️ Need to logout and login with new credentials
- 🎯 Test account: testuser@mapic.com / password123
- 📍 All data is around District 1, TP.HCM (10.7743, 106.7011)

**Next Action:** Logout from Settings tab, then login with testuser@mapic.com / password123
