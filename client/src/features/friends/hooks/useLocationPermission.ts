import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { AppState, AppStateStatus } from 'react-native';
import { useLocationPrivacy } from './useLocationPrivacy';

/**
 * Hook for monitoring location permission changes
 * Requirements: 5.5
 */
export const useLocationPermission = () => {
  const [permissionStatus, setPermissionStatus] = useState<Location.PermissionStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const { enableGhostMode } = useLocationPrivacy();

  /**
   * Check current location permission status
   */
  const checkPermission = useCallback(async () => {
    try {
      setIsChecking(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      // Auto-enable Ghost Mode if permission is denied
      if (status === Location.PermissionStatus.DENIED) {
        console.log('📍 Location permission denied, enabling Ghost Mode');
        await enableGhostMode();
      }
      
      return status;
    } catch (error) {
      console.error('Failed to check location permission:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [enableGhostMode]);

  /**
   * Request location permission
   */
  const requestPermission = useCallback(async () => {
    try {
      setIsChecking(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);
      
      if (status === Location.PermissionStatus.DENIED) {
        await enableGhostMode();
      }
      
      return status;
    } catch (error) {
      console.error('Failed to request location permission:', error);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, [enableGhostMode]);

  /**
   * Check if permission is granted
   */
  const isPermissionGranted = useCallback(() => {
    return permissionStatus === Location.PermissionStatus.GRANTED;
  }, [permissionStatus]);

  /**
   * Monitor app state changes to check permission
   */
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Check permission when app becomes active
        checkPermission();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial check
    checkPermission();

    return () => {
      subscription.remove();
    };
  }, [checkPermission]);

  return {
    permissionStatus,
    isChecking,
    isPermissionGranted: isPermissionGranted(),
    checkPermission,
    requestPermission,
  };
};
