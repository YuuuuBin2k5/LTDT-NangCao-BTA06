import { API_BASE_URL } from '../../../shared/constants/api.constants';

/**
 * Marker Image Generator
 * 
 * Generates circular avatar marker images with colored borders for friend locations.
 * Uses backend service to composite user avatars with borders.
 */

/**
 * Generate marker image using user's actual avatar with circular border
 * 
 * @param avatarUrl - User's avatar URL
 * @param userId - User ID for fallback
 * @param isOnline - Whether the user is online (determines border color)
 * @param userName - User name for initials fallback
 * @param size - Size of the marker in pixels (default: 60)
 * @returns Image source object for react-native-maps Marker
 */
export const generateAvatarMarker = (
  avatarUrl: string | undefined,
  userId: string,
  isOnline: boolean,
  userName: string,
  size: number = 60
): { uri: string } => {
  // Border color based on online status
  const borderColor = isOnline ? '4CAF50' : 'FF5722';
  
  // Extract initials from username for fallback
  const initials = userName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || 'U';
  
  if (avatarUrl && avatarUrl.startsWith('http')) {
    // API_BASE_URL already includes '/api'
    // Use backend marker generation service
    return {
      uri: `${API_BASE_URL}/markers/avatar?avatarUrl=${encodeURIComponent(avatarUrl)}&borderColor=${borderColor}&size=${size}`,
    };
  }
  
  // Fallback: Use ui-avatars with initials and colored border
  return {
    uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=${size}&background=${borderColor}&color=fff&rounded=true&bold=true&font-size=0.4`,
  };
};
