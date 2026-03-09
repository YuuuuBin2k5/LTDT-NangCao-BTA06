/**
 * Debug utility for filter presets
 */
import * as SecureStore from 'expo-secure-store';

export async function debugPresetAuth() {
  try {
    const token = await SecureStore.getItemAsync('userToken');
    console.log('=== DEBUG PRESET AUTH ===');
    console.log('Token exists:', !!token);
    console.log('Token length:', token?.length || 0);
    console.log('Token preview:', token?.substring(0, 20) + '...');
    
    // Try to decode JWT (basic check)
    if (token) {
      try {
        const parts = token.split('.');
        console.log('JWT parts:', parts.length);
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('JWT payload:', payload);
          console.log('JWT exp:', new Date(payload.exp * 1000));
          console.log('JWT expired:', payload.exp * 1000 < Date.now());
        }
      } catch (e) {
        console.log('Failed to decode JWT:', e);
      }
    }
    console.log('========================');
  } catch (error) {
    console.error('Debug auth error:', error);
  }
}
