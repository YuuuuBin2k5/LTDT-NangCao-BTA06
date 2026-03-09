# Offline Support Documentation

## Overview

The app now includes comprehensive offline support for post creation. When users are offline, posts are automatically queued and synced when the device reconnects to the internet.

## Features

### 1. Network Status Detection
- Real-time monitoring of network connectivity
- Detects both connection status and internet reachability
- Provides network context throughout the app

### 2. Offline Queue
- Posts created while offline are automatically queued
- Queue persists across app restarts using AsyncStorage
- Each queued post includes:
  - Post content and metadata
  - Local image URIs
  - Timestamp
  - Retry count

### 3. Automatic Sync
- Automatically syncs queued posts when device comes back online
- Uploads images first, then creates posts
- Handles sync failures with retry logic (max 3 retries)
- Removes posts from queue after successful sync

### 4. User Interface
- Offline banner in CreatePostScreen showing offline status
- Queue size indicator showing number of pending posts
- Sync status banner on map screen
- Manual sync button when online
- Different button text when offline ("Lưu để đăng sau")

## Architecture

### Components

#### NetworkContext
- **Location**: `client/src/shared/contexts/NetworkContext.tsx`
- **Purpose**: Provides network status to the entire app
- **Usage**:
```typescript
import { useNetwork } from '../../../shared/contexts/NetworkContext';

const { isConnected, isInternetReachable } = useNetwork();
const isOnline = isConnected && (isInternetReachable === null || isInternetReachable);
```

#### OfflineQueueService
- **Location**: `client/src/features/posts/services/offline-queue.service.ts`
- **Purpose**: Manages the offline post queue
- **Key Methods**:
  - `enqueue(request, imageUris)`: Add post to queue
  - `getQueue()`: Get all queued posts
  - `dequeue(postId)`: Remove post from queue
  - `getQueueSize()`: Get number of queued posts
  - `incrementRetryCount(postId)`: Track retry attempts

#### SyncService
- **Location**: `client/src/features/posts/services/sync.service.ts`
- **Purpose**: Handles syncing queued posts
- **Key Methods**:
  - `syncQueue()`: Sync all queued posts
  - `isSyncInProgress()`: Check if sync is running

#### useOfflineSync Hook
- **Location**: `client/src/features/posts/hooks/useOfflineSync.ts`
- **Purpose**: React hook for managing offline sync
- **Returns**:
  - `queueSize`: Number of posts in queue
  - `isSyncing`: Whether sync is in progress
  - `lastSyncResult`: Result of last sync operation
  - `sync()`: Manually trigger sync
  - `updateQueueSize()`: Refresh queue size

#### OfflineSyncBanner Component
- **Location**: `client/src/features/posts/components/OfflineSyncBanner.tsx`
- **Purpose**: Shows sync status and queue size
- **Features**:
  - Only visible when queue has posts
  - Shows sync progress
  - Manual sync button when online
  - Different messages for online/offline states

## User Flow

### Creating a Post While Offline

1. User opens CreatePostScreen
2. Offline banner appears: "📵 Bạn đang offline..."
3. User fills in post content, adds images, selects location
4. Submit button shows "Lưu để đăng sau"
5. User taps submit
6. Post is added to offline queue
7. Success message: "Bạn đang offline. Bài đăng sẽ được tự động đăng khi có kết nối."
8. User returns to map

### Automatic Sync When Back Online

1. Device reconnects to internet
2. useOfflineSync hook detects connection
3. Automatically triggers sync
4. For each queued post:
   - Uploads images to server
   - Creates post with uploaded image URLs
   - Removes from queue on success
   - Increments retry count on failure
5. Sync banner updates to show progress
6. Posts appear on map after successful sync

### Manual Sync

1. User sees sync banner: "📤 X bài đăng chờ đồng bộ"
2. User taps "Đồng bộ ngay" button
3. Sync process starts
4. Banner shows "⏳ Đang đồng bộ..."
5. Sync completes
6. Banner disappears when queue is empty

## Error Handling

### Sync Failures
- Each post can retry up to 3 times
- After 3 failed attempts, post is removed from queue
- Errors are logged for debugging
- User sees sync status in banner

### Network Errors
- Network status is continuously monitored
- Sync only attempts when online
- Failed syncs are automatically retried when connection improves

## Storage

### AsyncStorage Keys
- `@offline_post_queue`: Stores array of queued posts

### Data Structure
```typescript
interface QueuedPost {
  id: string;              // Temporary local ID (e.g., "offline_1234567890_abc123")
  request: {
    content: string;
    latitude: number;
    longitude: number;
    locationName?: string;
    privacy: PostPrivacy;
  };
  imageUris: string[];     // Local file URIs
  timestamp: number;       // When post was queued
  retryCount: number;      // Number of sync attempts
}
```

## Testing

### Unit Tests
- **Location**: `client/src/features/posts/services/__tests__/offline-queue.service.test.ts`
- **Coverage**:
  - Enqueue posts
  - Get queue
  - Dequeue posts
  - Queue size
  - Empty check

### Running Tests
```bash
cd client
npm test -- offline-queue.service.test.ts
```

## Configuration

### Dependencies
- `@react-native-community/netinfo`: Network status detection
- `@react-native-async-storage/async-storage`: Persistent storage

### Installation
```bash
npm install @react-native-community/netinfo @react-native-async-storage/async-storage
```

## Integration

### Adding NetworkProvider
The NetworkProvider must wrap the app in `app/_layout.tsx`:

```typescript
import { NetworkProvider } from "../src/shared/contexts/NetworkContext";

export default function RootLayout() {
  return (
    <NetworkProvider>
      <AuthProvider>
        <Slot />
      </AuthProvider>
    </NetworkProvider>
  );
}
```

### Using in Components
```typescript
import { useNetwork } from '../../../shared/contexts/NetworkContext';
import { useOfflineSync } from '../hooks/useOfflineSync';

const MyComponent = () => {
  const { isConnected, isInternetReachable } = useNetwork();
  const { queueSize, sync } = useOfflineSync();
  
  const isOnline = isConnected && (isInternetReachable === null || isInternetReachable);
  
  // Your component logic
};
```

## Performance Considerations

### Queue Size
- Queue is stored in AsyncStorage (limited by device storage)
- Recommended max queue size: 50 posts
- Each post with images can be several MB

### Sync Performance
- Images are uploaded sequentially (not in parallel)
- Large images may take time to upload
- Sync runs in background, doesn't block UI

### Battery Impact
- Network monitoring has minimal battery impact
- Sync only runs when online
- No polling or background tasks

## Future Enhancements

### Potential Improvements
1. **Parallel Image Upload**: Upload multiple images simultaneously
2. **Compression**: Compress images before queueing to save storage
3. **Sync Progress**: Show detailed progress for each post
4. **Conflict Resolution**: Handle conflicts if post data changes
5. **Selective Sync**: Allow users to choose which posts to sync
6. **Background Sync**: Use background tasks for syncing
7. **Offline Editing**: Allow editing queued posts before sync

## Troubleshooting

### Queue Not Syncing
1. Check network connection
2. Verify NetworkProvider is properly configured
3. Check console logs for errors
4. Try manual sync button

### Posts Stuck in Queue
1. Check retry count (max 3)
2. Verify image URIs are valid
3. Check server connectivity
4. Clear queue if necessary: `offlineQueueService.clearQueue()`

### Storage Issues
1. Check available device storage
2. Clear old queued posts
3. Reduce image sizes before queueing

## API Reference

### useNetwork()
```typescript
const { 
  isConnected: boolean,
  isInternetReachable: boolean | null,
  connectionType: string | null 
} = useNetwork();
```

### useOfflineSync()
```typescript
const {
  queueSize: number,
  isSyncing: boolean,
  lastSyncResult: SyncResult | null,
  sync: () => Promise<SyncResult>,
  updateQueueSize: () => Promise<void>
} = useOfflineSync();
```

### offlineQueueService
```typescript
// Add post to queue
const postId = await offlineQueueService.enqueue(request, imageUris);

// Get all queued posts
const queue = await offlineQueueService.getQueue();

// Remove post from queue
await offlineQueueService.dequeue(postId);

// Get queue size
const size = await offlineQueueService.getQueueSize();

// Check if empty
const isEmpty = await offlineQueueService.isEmpty();

// Clear entire queue
await offlineQueueService.clearQueue();
```

### syncService
```typescript
// Sync all queued posts
const result = await syncService.syncQueue();

// Check if sync in progress
const isSyncing = syncService.isSyncInProgress();
```

## Conclusion

The offline support feature provides a seamless experience for users creating posts without internet connectivity. Posts are automatically queued and synced when the device reconnects, ensuring no data loss and a smooth user experience.
