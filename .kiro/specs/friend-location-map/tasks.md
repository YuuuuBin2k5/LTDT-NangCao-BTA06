# Implementation Plan - Friend Location Map Integration

## Current State Analysis

**Existing Infrastructure:**
- ✅ Basic location tracking (LocationContext, LocationService)
- ✅ Location update endpoint (POST /api/locations/update)
- ✅ current_locations table for storing user locations
- ✅ MapView component with marker support (Tab Home)
- ✅ Marker clustering for places and posts
- ✅ react-native-maps, react-native-reanimated installed
- ✅ NetworkContext for offline detection
- ✅ Offline queue patterns from posts feature
- ✅ expo-image for image caching
- ✅ expo-haptics for haptic feedback

**Backend Complete:**
- ✅ Database schema (user_locations, friend_interactions, avatar_frames, etc.)
- ✅ All REST endpoints (LocationController, FriendInteractionController, AvatarFrameController)
- ✅ Friend location service with privacy filtering
- ✅ Interaction service with cooldown
- ✅ Avatar frame unlock system
- ✅ Proximity notifications

**What Needs to Be Integrated:**
- Add friend markers layer to existing MapView (Tab Home)
- Add layer toggle (Posts / Friends / Both)
- Integrate friend interaction UI
- Add privacy controls to settings
- Integrate avatar frame selector

## Phase 1: Backend Foundation (✅ COMPLETE)

All backend tasks are complete. No changes needed.

## Phase 2: Map Integration - Add Friends Layer to Home Tab

- [x] 1. Add map layer toggle to Home screen
- [x] 1.1 Create MapLayerToggle component
  - Add segmented control: "Bài viết" / "Bạn bè" / "Cả hai"
  - Position at top of map (below search button)
  - Store selected layer in state
  - _Requirements: 2.1_

- [x] 1.2 Update MapView to support friend markers
  - Add friendLocations prop to MapView component
  - Add showFriends boolean prop
  - Conditionally render friend markers based on layer selection
  - Maintain existing post marker functionality
  - _Requirements: 2.1, 2.2_

- [x] 1.3 Integrate useFriendLocations hook in Home screen
  - Import and use useFriendLocations hook
  - Pass friend locations to MapView
  - Handle loading and error states
  - _Requirements: 2.1, 6.2_

- [x] 2. Integrate FriendMarker component into MapView
- [x] 2.1 Add FriendMarker rendering to MapView
  - Render FriendMarker components when showFriends is true
  - Apply existing marker clustering to friend markers
  - Handle marker press to show friend details
  - _Requirements: 2.2, 2.3, 2.5_

- [ ] 2.2 Add friend marker clustering (OPTIONAL)
  - Extend clustering utility to support friend markers
  - Show cluster count for friends
  - Differentiate friend clusters from post clusters
  - _Requirements: 6.5_
  - _Note: Can be implemented later if needed for performance_

- [x] 3. Add friend interaction UI to Home screen
- [x] 3.1 Integrate FriendDetailsBottomSheet
  - Show bottom sheet when friend marker is pressed
  - Display friend info, distance, and interaction buttons
  - Handle "Get Directions" action
  - _Requirements: 2.5, 9.1, 9.5_

- [x] 3.2 Add InteractionEffectOverlay to Home screen
  - Overlay interaction animations on map
  - Handle sending interactions (heart, wave, poke, etc.)
  - Show animation from user to friend
  - _Requirements: 4.1, 4.2, 4.6_

- [x] 4. Add privacy and settings controls
- [x] 4.1 Add privacy mode indicator to Home screen
  - Show current privacy mode (All Friends / Close Friends / Ghost Mode)
  - Position near layer toggle
  - Tap to open privacy settings
  - _Requirements: 5.1, 5.3, 5.4_

- [x] 4.2 Integrate LocationPrivacySettings modal
  - Open from privacy indicator
  - Allow changing privacy mode
  - Manage close friends list
  - _Requirements: 5.1, 5.2_

- [x] 4.3 Add avatar frame selector to Settings tab
  - Add "Khung avatar" option in Settings
  - Open AvatarFrameSelector modal
  - Show unlocked frames and unlock conditions
  - _Requirements: 3.1, 3.2, 10.1_

- [x] 4.4 Add status message input
  - Tap own marker to set status
  - Show StatusInputDialog
  - Update status on server
  - Display status bubble on own marker
  - _Requirements: 14.1, 14.2, 14.3_

- [ ] 5. Checkpoint - Test integrated map
  - Verify layer toggle works correctly
  - Test friend markers appear and cluster properly
  - Verify interactions work from Home screen
  - Ensure privacy controls function correctly

