# Troubleshooting Guide - Advanced Feed Filters

## Common Issues

### 1. Error 403 Forbidden when loading presets

**Symptoms:**
```
ERROR Failed to load presets: [ApiError: Request failed with status code 403]
```

**Causes:**
1. No authentication token
2. Token expired
3. Token invalid
4. Not logged in

**Solutions:**

#### Solution 1: Check if logged in
```typescript
// In your app, check if user is logged in
import * as SecureStore from 'expo-secure-store';

const token = await SecureStore.getItemAsync('userToken');
console.log('Token exists:', !!token);
```

If no token exists, user needs to login first.

#### Solution 2: Login again
```typescript
// Navigate to login screen
navigation.navigate('Login');
```

#### Solution 3: Check token expiration
```typescript
// Decode JWT to check expiration
const token = await SecureStore.getItemAsync('userToken');
if (token) {
  const parts = token.split('.');
  const payload = JSON.parse(atob(parts[1]));
  const expired = payload.exp * 1000 < Date.now();
  console.log('Token expired:', expired);
  
  if (expired) {
    // Token expired, need to login again
    await SecureStore.deleteItemAsync('userToken');
    navigation.navigate('Login');
  }
}
```

#### Solution 4: Verify API endpoint
```typescript
// Check if endpoint is correct
console.log('API Base URL:', API_BASE_URL);
// Should be: http://10.10.1.109:8081/api

// Check if server is running
curl http://10.10.1.109:8081/api/auth/health
```

#### Solution 5: Check server logs
```bash
# In server directory
mvn spring-boot:run

# Look for authentication errors in logs
# Should see JWT validation errors if token is invalid
```

### 2. Presets not loading

**Symptoms:**
- Empty preset list
- Loading forever
- No error message

**Solutions:**

#### Check network connection
```typescript
import NetInfo from '@react-native-community/netinfo';

const state = await NetInfo.fetch();
console.log('Connected:', state.isConnected);
```

#### Check API response
```typescript
// Add logging to preset service
async getPresets(): Promise<FilterPreset[]> {
  console.log('Fetching presets...');
  const response = await apiClient.get<FilterPreset[]>('/feed/presets');
  console.log('Presets response:', response);
  return response;
}
```

#### Verify database
```sql
-- Check if presets table exists
SELECT * FROM filter_presets LIMIT 5;

-- Check if user has presets
SELECT * FROM filter_presets WHERE user_id = 'YOUR_USER_ID';
```

### 3. Cannot create preset

**Symptoms:**
- Error when saving preset
- Preset not appearing in list

**Solutions:**

#### Check validation
```typescript
// Ensure all required fields are provided
const request: CreatePresetRequest = {
  name: 'My Preset', // Required, max 100 chars
  description: 'Optional description',
  filters: [...], // Required, must be array
  isPublic: false, // Optional, defaults to false
};
```

#### Check database constraints
```sql
-- Check for duplicate names
SELECT * FROM filter_presets 
WHERE user_id = 'YOUR_USER_ID' 
AND name = 'My Preset';

-- Unique constraint on (user_id, name)
```

### 4. Filters not working

**Symptoms:**
- Applying filters shows no results
- Filters don't change feed

**Solutions:**

#### Check filter format
```typescript
// Ensure filters match expected format
const filter: FilterConfig = {
  id: 'unique_id',
  type: 'SOCIAL', // Must be valid FilterType
  value: 'friends', // Must be valid value for type
  label: 'Bạn bè',
  params: {}, // Optional parameters
};
```

#### Check backend logs
```bash
# Look for filter validation errors
# Should see SQL queries being executed
```

### 5. Recommendations not showing

**Symptoms:**
- "For You" feed empty
- Discovery mode empty

**Solutions:**

#### Check user interactions
```sql
-- Verify interactions are being tracked
SELECT * FROM user_interactions 
WHERE user_id = 'YOUR_USER_ID' 
ORDER BY timestamp DESC 
LIMIT 10;
```

#### Check if user has friends
```sql
-- Verify friendships exist
SELECT * FROM friendships 
WHERE (user_id1 = 'YOUR_USER_ID' OR user_id2 = 'YOUR_USER_ID')
AND status = 'ACCEPTED';
```

#### Check if posts exist
```sql
-- Verify there are posts to recommend
SELECT COUNT(*) FROM posts WHERE privacy = 'PUBLIC';
```

## Debug Mode

### Enable debug logging

Add to `useFilterPresets.ts`:
```typescript
const loadPresets = useCallback(async () => {
  if (__DEV__) {
    c