# Design Document - Friend Location Map

## Overview

Friend Location Map là một hệ thống phức tạp cho phép người dùng chia sẻ và xem vị trí real-time của bạn bè trên bản đồ tương tác. Hệ thống bao gồm location tracking, custom avatar frames, interactive animations, và privacy controls. Thiết kế tập trung vào performance, battery efficiency, và user experience mượt mà.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile Client (React Native)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Map View     │  │ Frame        │  │ Interaction  │      │
│  │ Component    │  │ Selector     │  │ Effects      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Location     │  │ Animation    │  │ Privacy      │      │
│  │ Service      │  │ Engine       │  │ Manager      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ REST API / WebSocket
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     Backend Server (Spring Boot)             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Location     │  │ Interaction  │  │ Frame        │      │
│  │ Controller   │  │ Controller   │  │ Controller   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Location     │  │ Notification │  │ Achievement  │      │
│  │ Service      │  │ Service      │  │ Service      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     PostgreSQL + PostGIS                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ user_        │  │ interactions │  │ avatar_      │      │
│  │ locations    │  │              │  │ frames       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React Native with Expo
- react-native-maps (Google Maps / Apple Maps)
- react-native-reanimated (Animations)
- expo-location (Location tracking)
- Lottie (Complex animations)
- React Native Gesture Handler

**Backend:**
- Spring Boot 3.x
- PostgreSQL with PostGIS extension
- WebSocket for real-time updates
- Redis for caching location data
- Firebase Cloud Messaging (Push notifications)

## Components and Interfaces

### Frontend Components

#### 1. FriendLocationMapView
Main map component hiển thị vị trí bạn bè.

```typescript
interface FriendLocationMapViewProps {
  initialRegion?: Region;
  friends: FriendLocation[];
  currentUser: UserLocation;
  onMarkerPress: (friendId: string) => void;
  onSendInteraction: (friendId: string, type: InteractionType) => void;
}
```

#### 2. FriendMarker
Custom marker component cho mỗi bạn bè.

```typescript
interface FriendMarkerProps {
  friend: FriendLocation;
  frame: AvatarFrame;
  isOnline: boolean;
  status?: string;
  onPress: () => void;
  animationEnabled: boolean;
}
```

#### 3. AvatarFrameSelector
Gallery để chọn khung ảnh.

```typescript
interface AvatarFrameSelectorProps {
  frames: AvatarFrame[];
  selectedFrameId: string;
  onSelectFrame: (frameId: string) => void;
  unlockedFrameIds: string[];
}
```

#### 4. InteractionEffectOverlay
Layer hiển thị animation effects.

```typescript
interface InteractionEffectOverlayProps {
  effects: ActiveEffect[];
  mapRef: MapView;
  onEffectComplete: (effectId: string) => void;
}
```

#### 5. LocationPrivacySettings
Component quản lý privacy settings.

```typescript
interface LocationPrivacySettingsProps {
  currentMode: PrivacyMode;
  closeFriendIds: string[];
  onModeChange: (mode: PrivacyMode) => void;
  onCloseFriendsUpdate: (friendIds: string[]) => void;
}
```

### Backend Controllers

#### 1. LocationController
```java
@RestController
@RequestMapping("/api/locations")
public class LocationController {
    @PostMapping("/update")
    ResponseEntity<Void> updateLocation(@RequestBody LocationUpdateRequest request);
    
    @GetMapping("/friends")
    ResponseEntity<List<FriendLocationDTO>> getFriendLocations();
    
    @GetMapping("/history")
    ResponseEntity<List<LocationHistoryDTO>> getLocationHistory(@RequestParam int days);
    
    @DeleteMapping("/history")
    ResponseEntity<Void> clearLocationHistory();
}
```

#### 2. InteractionController
```java
@RestController
@RequestMapping("/api/interactions")
public class InteractionController {
    @PostMapping("/send")
    ResponseEntity<InteractionDTO> sendInteraction(@RequestBody SendInteractionRequest request);
    
    @GetMapping("/received")
    ResponseEntity<List<InteractionDTO>> getReceivedInteractions();
    
    @GetMapping("/statistics")
    ResponseEntity<InteractionStatsDTO> getStatistics();
}
```

#### 3. AvatarFrameController
```java
@RestController
@RequestMapping("/api/avatar-frames")
public class AvatarFrameController {
    @GetMapping
    ResponseEntity<List<AvatarFrameDTO>> getAllFrames();
    
    @GetMapping("/unlocked")
    ResponseEntity<List<String>> getUnlockedFrames();
    
    @PostMapping("/{frameId}/select")
    ResponseEntity<Void> selectFrame(@PathVariable String frameId);
    
    @PostMapping("/{frameId}/unlock")
    ResponseEntity<Void> unlockFrame(@PathVariable String frameId);
}
```

## Data Models

### Database Schema

#### user_locations
```sql
CREATE TABLE user_locations (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    location GEOGRAPHY(POINT, 4326) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    accuracy FLOAT,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_current BOOLEAN DEFAULT true,
    privacy_mode VARCHAR(20) DEFAULT 'ALL_FRIENDS',
    status_message VARCHAR(50),
    status_emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_current (user_id, is_current),
    INDEX idx_timestamp (timestamp),
    INDEX idx_location USING GIST (location)
);
```

#### interactions
```sql
CREATE TABLE interactions (
    id BIGSERIAL PRIMARY KEY,
    from_user_id UUID NOT NULL REFERENCES users(id),
    to_user_id UUID NOT NULL REFERENCES users(id),
    interaction_type VARCHAR(20) NOT NULL,
    from_location GEOGRAPHY(POINT, 4326),
    to_location GEOGRAPHY(POINT, 4326),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_to_user (to_user_id, is_read),
    INDEX idx_from_user (from_user_id),
    INDEX idx_created_at (created_at)
);
```

#### avatar_frames
```sql
CREATE TABLE avatar_frames (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    frame_type VARCHAR(20) NOT NULL,
    svg_path TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT false,
    unlock_condition VARCHAR(100),
    unlock_requirement_value INT,
    display_order INT,
    is_seasonal BOOLEAN DEFAULT false,
    available_from DATE,
    available_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### user_avatar_frames
```sql
CREATE TABLE user_avatar_frames (
    user_id UUID NOT NULL REFERENCES users(id),
    frame_id VARCHAR(50) NOT NULL REFERENCES avatar_frames(id),
    is_selected BOOLEAN DEFAULT false,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (user_id, frame_id),
    INDEX idx_user_selected (user_id, is_selected)
);
```

#### user_achievements
```sql
CREATE TABLE user_achievements (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    achievement_type VARCHAR(50) NOT NULL,
    achievement_value INT NOT NULL,
    unlocked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE (user_id, achievement_type)
);
```

#### proximity_notifications
```sql
CREATE TABLE proximity_notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    friend_id UUID NOT NULL REFERENCES users(id),
    distance_meters FLOAT NOT NULL,
    notified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_user_time (user_id, notified_at)
);
```

### TypeScript Interfaces

```typescript
// Location Types
interface UserLocation {
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: Date;
  isCurrent: boolean;
  privacyMode: PrivacyMode;
  statusMessage?: string;
  statusEmoji?: string;
}

interface FriendLocation extends UserLocation {
  friendId: string;
  name: string;
  username: string;
  avatarUrl: string;
  frameId: string;
  isOnline: boolean;
  lastSeenMinutes?: number;
}

enum PrivacyMode {
  ALL_FRIENDS = 'ALL_FRIENDS',
  CLOSE_FRIENDS = 'CLOSE_FRIENDS',
  GHOST_MODE = 'GHOST_MODE'
}

// Frame Types
interface AvatarFrame {
  id: string;
  name: string;
  description: string;
  frameType: FrameType;
  svgPath: string;
  isPremium: boolean;
  unlockCondition?: string;
  unlockRequirementValue?: number;
  isUnlocked: boolean;
  isSelected: boolean;
}

enum FrameType {
  CIRCULAR = 'CIRCULAR',
  SQUARE = 'SQUARE',
  HEART = 'HEART',
  STAR = 'STAR',
  HEXAGON = 'HEXAGON',
  DIAMOND = 'DIAMOND',
  FLOWER = 'FLOWER',
  CLOUD = 'CLOUD',
  BADGE = 'BADGE',
  NEON = 'NEON'
}

// Interaction Types
interface Interaction {
  id: number;
  fromUserId: string;
  toUserId: string;
  interactionType: InteractionType;
  fromLocation?: { latitude: number; longitude: number };
  toLocation?: { latitude: number; longitude: number };
  isRead: boolean;
  createdAt: Date;
}

enum InteractionType {
  HEART = 'HEART',
  WAVE = 'WAVE',
  POKE = 'POKE',
  FIRE = 'FIRE',
  STAR = 'STAR',
  HUG = 'HUG'
}

interface ActiveEffect {
  id: string;
  type: InteractionType;
  fromCoordinate: { latitude: number; longitude: number };
  toCoordinate: { latitude: number; longitude: number };
  progress: number;
  startTime: number;
}

// Statistics
interface InteractionStats {
  totalSent: number;
  totalReceived: number;
  heartsSent: number;
  heartsReceived: number;
  wavesSent: number;
  wavesReceived: number;
  pokesSent: number;
  pokesReceived: number;
  bestFriends: BestFriend[];
}

interface BestFriend {
  friendId: string;
  name: string;
  avatarUrl: string;
  interactionCount: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Location Update Consistency
*For any* location update, the timestamp should always be greater than or equal to the previous location timestamp for that user, ensuring chronological ordering.
**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Privacy Mode Enforcement
*For any* user in GHOST_MODE, their location should not appear in any friend's location query results.
**Validates: Requirements 5.3, 5.4**

### Property 3: Interaction Cooldown
*For any* user sending interactions, there should be at least 10 seconds between consecutive interaction sends to the same or different friends.
**Validates: Requirements 4.5**

### Property 4: Frame Unlock Validation
*For any* frame selection attempt, the frame must be in the user's unlocked frames list before it can be selected.
**Validates: Requirements 3.4, 10.2**

### Property 5: Location Distance Calculation
*For any* two valid coordinates, calculating the distance twice should return the same result (idempotent).
**Validates: Requirements 7.1, 9.5**

### Property 6: Proximity Notification Deduplication
*For any* friend within proximity range, only one notification should be sent within a 1-hour window to avoid spam.
**Validates: Requirements 7.1, 7.3**

### Property 7: Animation Trajectory Smoothness
*For any* interaction effect animation, the path from source to destination should be a smooth Bezier curve with consistent frame rate.
**Validates: Requirements 4.2, 4.6**

### Property 8: Marker Clustering Consistency
*For any* zoom level, markers that are clustered together should all be within the same geographic bounds.
**Validates: Requirements 6.5, 13.4**

### Property 9: Status Message Length
*For any* status message input, the system should reject messages longer than 50 characters.
**Validates: Requirements 14.2**

### Property 10: Location History Retention
*For any* location record older than 30 days, it should be automatically removed from the database.
**Validates: Requirements 8.5**

## Error Handling

### Location Errors
- **Permission Denied**: Hiển thị dialog yêu cầu permission, fallback to Ghost Mode
- **GPS Unavailable**: Sử dụng network location, hiển thị warning về accuracy
- **Location Timeout**: Retry với exponential backoff, max 3 attempts
- **Invalid Coordinates**: Validate latitude (-90 to 90) và longitude (-180 to 180)

### Network Errors
- **API Timeout**: Retry với timeout tăng dần (5s, 10s, 20s)
- **Connection Lost**: Queue updates locally, sync khi reconnect
- **Server Error (5xx)**: Hiển thị error message, retry sau 30s
- **Rate Limit**: Hiển thị cooldown timer, disable actions

### Animation Errors
- **Frame Drop**: Reduce animation complexity, skip frames if needed
- **Memory Pressure**: Clear completed animations, limit concurrent effects
- **Render Error**: Fallback to simple marker without animation

## Testing Strategy

### Unit Tests
- Location service: coordinate validation, distance calculation
- Privacy manager: mode enforcement, friend filtering
- Frame selector: unlock validation, selection logic
- Interaction service: cooldown enforcement, type validation

### Integration Tests
- Location update flow: client → server → database → broadcast
- Interaction flow: send → animate → notify → mark read
- Frame unlock flow: achievement → unlock → notification

### Property-Based Tests
- Location coordinate generation and validation
- Interaction cooldown enforcement across random sequences
- Privacy mode filtering with various friend lists
- Distance calculation with random coordinate pairs

### Performance Tests
- Map rendering with 100+ markers
- Animation performance with 10 concurrent effects
- Location update throughput (100 updates/second)
- Database query performance with spatial indexes

### Battery Tests
- Background location tracking battery drain
- Foreground vs background update frequency
- Power saving mode effectiveness

## Performance Considerations

### Frontend Optimization
- **Marker Virtualization**: Only render markers in viewport
- **Animation Throttling**: Limit to 60fps, skip frames if needed
- **Image Caching**: Cache avatar images and frame SVGs
- **Debounced Updates**: Batch location updates every 30s
- **Lazy Loading**: Load frame gallery on demand

### Backend Optimization
- **Spatial Indexing**: PostGIS GIST index on location column
- **Redis Caching**: Cache friend locations for 30s
- **Query Optimization**: Use ST_DWithin for proximity queries
- **Batch Processing**: Process location updates in batches
- **Connection Pooling**: Reuse database connections

### Database Optimization
```sql
-- Spatial index for fast proximity queries
CREATE INDEX idx_user_locations_geography 
ON user_locations USING GIST (location);

-- Composite index for current location queries
CREATE INDEX idx_user_locations_current 
ON user_locations (user_id, is_current) 
WHERE is_current = true;

-- Partial index for online users
CREATE INDEX idx_user_locations_recent 
ON user_locations (timestamp) 
WHERE timestamp > NOW() - INTERVAL '5 minutes';
```

## Security Considerations

### Location Privacy
- Encrypt location data in transit (HTTPS/WSS)
- Hash user IDs in client-side logs
- Implement rate limiting on location updates
- Validate all coordinates server-side

### Interaction Security
- Verify friendship before allowing interactions
- Implement cooldown to prevent spam
- Validate interaction types against enum
- Log suspicious activity patterns

### Frame Unlock Security
- Server-side validation of unlock conditions
- Prevent client-side frame unlock manipulation
- Audit log for premium frame unlocks
- Verify achievement data integrity

## Deployment Strategy

### Phase 1: Core Location (Week 1-2)
- Database schema and migrations
- Location tracking service
- Basic map view with friend markers
- Privacy controls

### Phase 2: Avatar Frames (Week 3)
- Frame gallery and selection
- 20+ frame designs (SVG)
- Unlock system and achievements
- Frame preview

### Phase 3: Interactions (Week 4)
- Interaction effects system
- Animation engine
- Push notifications
- Statistics tracking

### Phase 4: Polish & Optimization (Week 5)
- Performance optimization
- Battery optimization
- Error handling improvements
- User testing and feedback

## Future Enhancements

- **AR Mode**: View friends in augmented reality
- **Location Sharing**: Share location link with non-users
- **Group Locations**: Create location-based groups
- **Location Challenges**: Gamification with location-based challenges
- **Custom Frames**: User-created frame designs
- **Voice Messages**: Send voice notes with interactions
- **Location Stories**: Share stories tied to locations
- **Heat Maps**: Visualize frequently visited areas

