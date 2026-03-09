# Image URL Loading Fix

## Problem
Images were failing to load with error:
```
ERROR Failed to load image: http://10.20.1.143:8081/uploads/43466479-2a45-4cc2-b21e-3f5464aec1ee.jpg
```

## Root Cause
1. Backend was configured with hardcoded IP address `10.20.1.143:8081` in `application.properties`
2. Client's `API_BASE_URL` was set to different IP `192.168.1.5:8081`
3. `OptimizedImage` component only transformed `localhost:8080` URLs, not other IPs
4. When server IP changes (network change, different device), image URLs become invalid

## Solution

### 1. Backend Changes
**File: `server/src/main/resources/application.properties`**
- Changed from: `app.upload.base-url=http://10.20.1.143:8081/uploads`
- Changed to: `app.upload.base-url=/uploads`
- Now generates relative URLs instead of absolute URLs with hardcoded IP

### 2. Client Changes

#### OptimizedImage Component
**File: `client/src/shared/components/OptimizedImage.tsx`**
Enhanced `transformImageUrl()` function to handle:
1. **Relative URLs** (e.g., `/uploads/image.jpg`) - prepends with current server base
2. **Localhost URLs** - replaces with actual server IP from `API_BASE_URL`
3. **Stale server IPs** - replaces any `http://x.x.x.x:port` with current server from `API_BASE_URL`

#### Component Updates
Updated components to use `OptimizedImage` instead of raw `Image` for avatars:
- `client/src/features/posts/components/PostCard.tsx`
- `client/src/features/posts/screens/PostDetailScreen.tsx`
- `client/src/features/posts/components/LikeListModal.tsx`

## How It Works Now

1. **Backend uploads image** → Returns relative URL: `/uploads/uuid.jpg`
2. **Client receives URL** → `OptimizedImage` transforms it
3. **Transformation logic**:
   - If URL starts with `/` → Prepend `API_BASE_URL` base (e.g., `http://192.168.1.5:8081`)
   - If URL has different IP → Replace with current `API_BASE_URL` base
   - Result: `http://192.168.1.5:8081/uploads/uuid.jpg`

## Benefits

1. **Network flexibility**: Works when server IP changes
2. **Device compatibility**: Works on emulator, physical device, different networks
3. **Backward compatibility**: Handles old absolute URLs from database
4. **Centralized config**: Only need to update `API_BASE_URL` in one place

## Testing

After restart:
1. Upload new image → Should use relative URL
2. View old posts → Should transform old absolute URLs
3. Change `API_BASE_URL` → All images should still load
4. Works on both Android emulator and physical devices

## Migration Notes

- Existing images in database with absolute URLs will still work (transformed by client)
- New uploads will use relative URLs
- No database migration needed
- Server restart required to apply `application.properties` change
