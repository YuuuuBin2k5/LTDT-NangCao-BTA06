import { useEffect, useState } from 'react';
import { useLocation } from './useLocation';
import { MapRegion } from '../types';

/**
 * Default map region (Hanoi, Vietnam)
 */
const DEFAULT_REGION: MapRegion = {
  latitude: 21.0285,
  longitude: 105.8542,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * Hook for managing location tracking and map region
 * Handles permission requests, location updates, and map region state
 */
export const useLocationTracking = () => {
  const { currentLocation, isTracking, error, startTracking, stopTracking, refreshLocation } = useLocation();
  const [mapRegion, setMapRegion] = useState<MapRegion | undefined>(undefined);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);

  /**
   * Initialize location on mount
   */
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        setIsInitializing(true);
        await refreshLocation();
        setPermissionGranted(true);
      } catch (err) {
        console.error('Failed to initialize location:', err);
        setPermissionGranted(false);
        // Set default region if location fails
        setMapRegion(DEFAULT_REGION);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeLocation();
  }, [refreshLocation]);

  /**
   * Update map region when location changes
   */
  useEffect(() => {
    if (currentLocation) {
      setMapRegion({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  }, [currentLocation]);

  return {
    currentLocation,
    mapRegion,
    isTracking,
    isInitializing,
    permissionGranted,
    error,
    startTracking,
    stopTracking,
    refreshLocation,
  };
};
