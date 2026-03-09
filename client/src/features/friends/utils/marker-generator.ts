/**
 * Generate marker icon URI for friend avatars
 * Uses a simple approach: return the avatar URL directly as marker icon
 */

export interface MarkerIconConfig {
  avatarUrl: string;
  isOnline: boolean;
  size?: number;
}

/**
 * For now, we'll use emoji markers as a reliable fallback
 * This works on all platforms without image generation complexity
 */
export const generateMarkerIcon = (config: MarkerIconConfig) => {
  // Use different emoji based on online status
  return config.isOnline ? '🟢' : '🔴';
};

/**
 * Get marker color based on online status
 */
export const getMarkerColor = (isOnline: boolean): string => {
  return isOnline ? '#4CAF50' : '#FF5722';
};
