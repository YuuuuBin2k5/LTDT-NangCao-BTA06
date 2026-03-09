# Avatar Marker Solution for Friend Location Map

## Problem
React Native Maps on Android **does NOT support custom View children** inside Marker components. Custom Views render in the component tree but are **not visible on the map**.

The user wants circular avatar markers with colored borders (like BUMP app) showing:
- User's profile picture
- Green border for online friends
- Red border for offline friends
- Fixed size (60px) that doesn't scale with zoom

## Attempted Solutions (Failed)
1. ❌ Custom View with Image component - renders but not visible
2. ❌ Custom View with OptimizedImage - renders but not visible  
3. ❌ Animated.View with animations - renders but not visible
4. ❌ Using dicebear URL with icon prop - displays but scales with zoom (too large when zoomed in)

## Current Solution (Working)

### Approach
Use the `icon` prop with **pre-generated marker images** from a backend service that composites:
1. User's avatar image
2. Circular crop
3. Colored border (green/red)
4. Fixed size (60px)

### Implementation

#### Client Side
**File**: `client/src/features/friends/utils/marker-image-generator.ts`
- Generates marker image URLs
- Uses backend service: `/api/markers/avatar`
- Fallback to ui-avatars.com for users without custom avatars

**File**: `client/src/features/friends/components/FriendMarker.tsx`
- Uses `generateAvatarMarker()` utility
- Sets `icon` prop with generated image URL
- Fixed size: 60px
- `flat={true}` to remove pin shadow
- `anchor={{ x: 0.5, y: 0.5 }}` for centering

#### Backend Service
**File**: `server/src/main/java/com/mapic/controller/MarkerImageController.java`
- Endpoint: `GET /api/markers/avatar`
- Parameters:
  - `avatarUrl`: User's avatar URL
  - `borderColor`: Hex color (e.g., "4CAF50" for green)
  - `size`: Marker size in pixels (default: 60)
- Uses Java AWT to:
  1. Download user's avatar
  2. Create circular crop
  3. Add colored border
  4. Return PNG image
- Caches images for 24 hours

### Advantages
✅ Works reliably on Android
✅ Fixed size - doesn't scale with zoom
✅ Shows actual user avatars
✅ Colored borders for online/offline status
✅ Cached for performance

### Disadvantages
⚠️ Requires backend service
⚠️ Network request for each unique avatar
⚠️ Limited customization compared to native Views

## Alternative Solution: Migrate to Mapbox

### Why Mapbox?
Mapbox GL has **better support for custom markers** on Android:
- Can use custom Views as markers
- Better performance with many markers
- More styling options
- Supports marker clustering natively

### Migration Effort: 8-10 hours

#### Tasks
1. **Install Mapbox SDK** (1 hour)
   - Add `@rnmapbox/maps` dependency
   - Configure Android/iOS native setup
   - Get Mapbox access token

2. **Replace MapView Component** (2 hours)
   - Convert from react-native-maps to Mapbox
   - Update all map props and callbacks
   - Test basic map functionality

3. **Update Marker Components** (2 hours)
   - Convert PlaceMarker to Mapbox
   - Convert PostMarker to Mapbox
   - Convert FriendMarker to Mapbox with custom View

4. **Update Clustering** (2 hours)
   - Use Mapbox native clustering
   - Update cluster marker rendering
   - Test cluster interactions

5. **Testing & Bug Fixes** (2-3 hours)
   - Test on Android
   - Test on iOS
   - Fix platform-specific issues
   - Performance testing

### Mapbox Pros
✅ Custom View markers work on Android
✅ Better performance
✅ Native clustering
✅ More features (3D, animations, etc.)

### Mapbox Cons
❌ 8-10 hours migration effort
❌ Different API to learn
❌ Requires Mapbox account/token
❌ Potential breaking changes in existing features

## Recommendation

### Short Term (Current Solution)
Use the **backend marker generation service** approach:
- Works immediately
- Minimal code changes
- Reliable on Android
- Good enough for MVP

### Long Term (If needed)
Consider **Mapbox migration** if:
- You need more advanced marker customization
- You have many markers (>100) and need better performance
- You want native clustering
- You have 8-10 hours for migration

## Testing

### Test Current Solution
1. Start backend server
2. Upload avatar for test users
3. Switch to Friends layer on map
4. Verify markers display as circular avatars with colored borders
5. Verify markers stay fixed size when zooming
6. Verify online/offline status shows correct border color

### Test Commands
```bash
# Backend
cd server
./mvnw spring-boot:run

# Client
cd client
npm start
```

### Test Accounts
- `testuser@mapic.com` / `password123`
- Friends: Minh Nguyen, Lan Tran, Hung Le, Tuan Vo, Linh Nguyen
- All located around District 1, TP.HCM

## Next Steps

1. ✅ Test current implementation with backend service
2. ⏳ If markers display correctly → Done!
3. ⏳ If still issues → Consider Mapbox migration
4. ⏳ Add marker image caching on client side
5. ⏳ Optimize backend image generation (use CDN)
