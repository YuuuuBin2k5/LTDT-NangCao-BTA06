import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Location from 'expo-location';

interface BatteryOptimizationConfig {
  updateInterval: number; // milliseconds
  isLowPowerMode: boolean;
  isStationary: boolean;
}

/**
 * Hook for battery optimization in location tracking
 * Adjusts update frequency based on app state and movement
 */
export const useBatteryOptimization = () => {
  const [config, setConfig] = useState<BatteryOptimizationConfig>({
    updateInterval: 30000, // Default: 30 seconds
    isLowPowerMode: false,
    isStationary: false,
  });
  const [lastLocation, setLastLocation] = useState<Location.LocationObject | null>(null);

  /**
   * Detect stationary state
   */
  const checkIfStationary = useCallback(
    async (currentLocation: Location.LocationObject) => {
      if (!lastLocation) {
        setLastLocation(currentLocation);
        return false;
      }

      // Calculate distance moved
      const distance = calculateDistance(
        lastLocation.coords.latitude,
        lastLocation.coords.longitude,
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

      // If moved less than 50 meters in last check, consider stationary
      const isStationary = distance < 0.05; // 50 meters

      setLastLocation(currentLocation);
      return isStationary;
    },
    [lastLocation]
  );

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const isBackground = nextAppState === 'background' || nextAppState === 'inactive';
      
      setConfig((prev) => ({
        ...prev,
        updateInterval: isBackground ? 300000 : 30000, // 5 min background, 30 sec foreground
        isLowPowerMode: isBackground,
      }));
    });

    return () => {
      subscription.remove();
    };
  }, []);

  /**
   * Update stationary state
   */
  const updateStationaryState = useCallback(
    async (currentLocation: Location.LocationObject) => {
      const isStationary = await checkIfStationary(currentLocation);
      
      setConfig((prev) => ({
        ...prev,
        isStationary,
        updateInterval: isStationary ? 600000 : prev.updateInterval, // 10 min if stationary
      }));
    },
    [checkIfStationary]
  );

  return {
    config,
    updateStationaryState,
  };
};

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};
