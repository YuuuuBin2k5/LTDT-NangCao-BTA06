# Token Authentication Debug

## Current Situation

Login is successful, but API calls immediately after login are getting 401 errors.

### What's Working
- ✅ Login endpoint returns token and userId
- ✅ Token is being saved to SecureStore
- ✅ AsyncStorage package installed (v2.2.0)

### What's Failing
- ❌ API calls after login get 401 "Full authentication is required"
- ❌ Location update fails
- ❌ Load nearby posts fails

## Debug Logs Added

Added logging to track token flow:

### In `client/src/services/api/client.ts`:
```typescript
if (token) {
  config.headers.Authorization = `Bearer ${token}`;
  console.log('🔑 Token added to request:', config.url, '| Token:', token.substring(0, 20) + '...');
} else {
  console.warn('⚠️ No token found for request:', config.url);
}
```

### In `client/src/services/auth/auth.service.ts`:
```typescript
await SecureStore.setItemAsync(this.TOKEN_KEY, response.token);
console.log('💾 Token saved to SecureStore');
```

## Next Steps

1. **Reload the app** to see the new debug logs
2. **Login again** with testuser@mapic.com / password123
3. **Check the console** for these logs:
   - `💾 Token saved to SecureStore` - confirms token was saved
   - `🔑 Token added to request` - confirms token is being retrieved and sent
   - `⚠️ No token found` - indicates token retrieval failed

## Possible Issues

### Issue 1: Timing Race Condition
API calls might be triggered before token save completes, even though we await it.

**Solution:** Ensure all API calls wait for authentication state to update.

### Issue 2: SecureStore vs AsyncStorage
The auth service uses SecureStore, but we just installed AsyncStorage. They're different!
- **SecureStore**: Encrypted storage (what we're using)
- **AsyncStorage**: Plain storage (what we installed)

**This might not be the issue** since SecureStore is part of expo-secure-store package.

### Issue 3: Token Format
The server might be rejecting the token format.

**Check:** Look at the token in the logs - should be a JWT starting with "eyJ..."

### Issue 4: Server-Side Issue
The server might not be validating tokens correctly.

**Check:** Test the token with curl:
```bash
# Get token from login
curl -X POST http://192.168.1.5:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@mapic.com","password":"password123"}'

# Use token in another request
curl -X GET http://192.168.1.5:8081/api/posts/nearby?latitude=10.7743&longitude=106.7011&radius=5000 \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## What to Look For

When you reload and login, watch for this sequence:
1. `🔐 Attempting login`
2. `✅ Login successful`
3. `💾 Token saved to SecureStore`
4. `🔑 Token added to request: /locations/update` (or similar)
5. Either success or 401 error

If you see `⚠️ No token found` after login, that's the problem - token isn't being retrieved.

If you see `🔑 Token added` but still get 401, the problem is server-side token validation.

## Quick Test

Try this in the app after login:
1. Wait 5 seconds
2. Try to refresh the map or navigate to another screen
3. See if API calls work after the delay

If they work after a delay, it's a timing issue. If they still fail, it's a token validation issue.
