import { Platform, Linking, Alert } from 'react-native';

export interface NavigationOptions {
  latitude: number;
  longitude: number;
  label?: string;
}

/**
 * Open external maps app with directions to a location
 */
export const openMapsForDirections = async (options: NavigationOptions): Promise<void> => {
  const { latitude, longitude, label } = options;

  const destination = `${latitude},${longitude}`;
  const encodedLabel = label ? encodeURIComponent(label) : '';

  let url: string;

  if (Platform.OS === 'ios') {
    // Apple Maps
    url = `maps://app?daddr=${destination}&dirflg=d`;
    if (label) {
      url += `&q=${encodedLabel}`;
    }
  } else {
    // Google Maps
    url = `google.navigation:q=${destination}`;
    if (label) {
      url += `&label=${encodedLabel}`;
    }
  }

  try {
    const supported = await Linking.canOpenURL(url);
    
    if (supported) {
      await Linking.openURL(url);
    } else {
      // Fallback to web version
      const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
      await Linking.openURL(webUrl);
    }
  } catch (error) {
    Alert.alert('Lỗi', 'Không thể mở ứng dụng bản đồ');
    console.error('Failed to open maps:', error);
  }
};

/**
 * Calculate distance between two coordinates in kilometers
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate estimated travel time (assuming average speed of 50 km/h)
 */
export const calculateEstimatedTime = (distanceKm: number): string => {
  const averageSpeedKmh = 50;
  const hours = distanceKm / averageSpeedKmh;
  const minutes = Math.round(hours * 60);

  if (minutes < 60) {
    return `${minutes} phút`;
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h} giờ ${m} phút` : `${h} giờ`;
};
