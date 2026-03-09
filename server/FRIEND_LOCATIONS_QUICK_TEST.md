# Quick Test: Friend Locations on Map

## ✅ Backend Status
- Server compiled successfully
- Server running on port 8081
- FilterServiceImpl fixed (userId/friendId instead of userId1/userId2)
- Database schema matches Java entities

## 🎯 What You Should See

When you open the app and go to the Home tab:

1. **MapLayerToggle** (top left corner):
   - 📍 Bài viết (Posts only)
   - 👥 Bạn bè (Friends only) ← **CLICK THIS**
   - 🗺️ Cả hai (Both)

2. **After clicking "👥 Bạn bè"**:
   - You should see 6 friend markers on the map
   - All friends are located around District 1, TP.HCM
   - Each marker shows friend's avatar and name

## 📍 Test Data Locations

Your test account (`testuser@mapic.com`) has 6 friends with current locations:

| Friend | Location | Coordinates |
|--------|----------|-------------|
| Alice Johnson | Bitexco Tower | 10.7717, 106.7036 |
| Bob Smith | Ben Thanh Market | 10.7729, 106.6981 |
| Charlie Brown | Notre Dame Cathedral | 10.7797, 106.6990 |
| Diana Prince | Saigon Opera House | 10.7769, 106.7009 |
| Eve Wilson | Independence Palace | 10.7769, 106.6955 |
| Frank Miller | Nguyen Hue Walking Street | 10.7743, 106.7011 |

## 🔍 Troubleshooting Steps

### Step 1: Check MapLayerToggle
- Open Home tab
- Look at top left corner
- You should see 3 buttons: "📍 Bài viết", "👥 Bạn bè", "🗺️ Cả hai"
- Click "👥 Bạn bè" or "🗺️ Cả hai"

### Step 2: Check API Call
Look at server logs for this message:
```
Get friend locations request from user: [your-user-id]
```

If you DON'T see this message, the client is not calling the API.

### Step 3: Check Client Console
In your React Native app, check for these logs:
- `⚠️ Offline, skipping friend location fetch` (if offline)
- `Failed to fetch friend locations:` (if API error)

### Step 4: Verify Database
Run this SQL to check if friends have locations:
```sql
SELECT u.username, ul.latitude, ul.longitude, ul.is_current 
FROM user_locations ul 
JOIN users u ON ul.user_id = u.id 
WHERE ul.is_current = true;
```

You should see 6 rows with is_current = true.

### Step 5: Check Friendships
Run this SQL to verify you have friends:
```sql
SELECT 
  u1.username as user,
  u2.username as friend,
  f.status
FROM friendships f
JOIN users u1 ON f.user_id = u1.id
JOIN users u2 ON f.friend_id = u2.id
WHERE u1.email = 'testuser@mapic.com' AND f.status = 'ACCEPTED';
```

You should see 6 rows with status = 'ACCEPTED'.

## 🐛 Common Issues

### Issue 1: "Not seeing any friends on map"
**Solution**: Make sure you clicked "👥 Bạn bè" or "🗺️ Cả hai" in MapLayerToggle

### Issue 2: "MapLayerToggle not visible"
**Solution**: Check `client/app/(app)/(tabs)/index.tsx` - the toggle should be at top left

### Issue 3: "API not being called"
**Possible causes**:
- App is offline (check network connection)
- User not authenticated (check if logged in)
- `useFriendLocations` hook not working

### Issue 4: "API returns empty array"
**Possible causes**:
- No friendships in database
- Friends don't have current locations (is_current = false)
- Privacy mode is GHOST_MODE

## 🔧 Quick Fixes

### Fix 1: Reset Database
```bash
cd server
psql -U postgres -d mapic_db -f FULL_DATABASE_SETUP.sql
```

### Fix 2: Restart Server
```bash
cd server
mvn spring-boot:run
```

### Fix 3: Clear App Cache
In React Native app:
- Close app completely
- Reopen app
- Login again

## 📱 Expected Behavior

1. **On "📍 Bài viết" mode**: Only post markers visible
2. **On "👥 Bạn bè" mode**: Only friend markers visible (6 friends)
3. **On "🗺️ Cả hai" mode**: Both posts and friends visible

## 🎨 Friend Marker Appearance

Each friend marker should show:
- Avatar image (or default avatar)
- Friend's name
- Status emoji (if set)
- Status message (if set)

When you tap a friend marker:
- Bottom sheet opens with friend details
- Shows distance from you
- Shows last update time

## ✅ Success Criteria

You know it's working when:
1. ✅ MapLayerToggle is visible at top left
2. ✅ Clicking "👥 Bạn bè" shows 6 friend markers
3. ✅ All markers are around District 1, TP.HCM
4. ✅ Tapping a marker opens friend details
5. ✅ Server logs show "Get friend locations request"

## 🚀 Next Steps

If everything works:
- Try updating your location
- Try changing privacy mode
- Try sending interactions to friends
- Try viewing friend location history

If it doesn't work:
- Check server logs for errors
- Check client console for errors
- Verify database has test data
- Make sure you're logged in as testuser@mapic.com
