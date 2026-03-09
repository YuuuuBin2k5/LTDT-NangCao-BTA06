import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Location } from '../../shared/types/location.types';
import { locationService } from '../../services/location';

/**
 * LocationContext value interface
 */
export interface LocationContextValue {
  currentLocation: Location | null;
  isTracking: boolean;
  error: string | null;
  startTracking: () => void;
  stopTracking: () => void;
  refreshLocation: () => Promise<void>;
}

/**
 * LocationContext
 */
const LocationContext = createContext<LocationContextValue | undefined>(undefined);

/**
 * LocationProvider props
 */
interface LocationProviderProps {
  children: ReactNode;
}

/**
 * LocationProvider component
 * Manages location state and provides location tracking functionality
 */
export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Start tracking location
   */
  const startTracking = useCallback(() => {
    if (isTracking) return;

    try {
      setIsTracking(true);
      setError(null);

      // Watch location changes
      const unsubscribe = locationService.watchLocation(async (location) => {
        setCurrentLocation(location);
        
        // Update location on server
        try {
          await locationService.updateLocation(location);
        } catch (err) {
          console.error('Failed to update location on server:', err);
          // Don't set error state here as tracking should continue
        }
      });

      // Store unsubscribe function for cleanup
      return unsubscribe;
    } catch (err) {
      setIsTracking(false);
      setError(err instanceof Error ? err.message : 'Không thể bắt đầu theo dõi vị trí');
      console.error('Failed to start tracking:', err);
    }
  }, [isTracking]);

  /**
   * Stop tracking location
   */
  const stopTracking = useCallback(() => {
    setIsTracking(false);
  }, []);

  /**
   * Refresh current location
   */
  const refreshLocation = useCallback(async () => {
    try {
      setError(null);
      const location = await locationService.getCurrentLocation();
      setCurrentLocation(location);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể lấy vị trí hiện tại');
      console.error('Failed to refresh location:', err);
      throw err;
    }
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (isTracking) {
      unsubscribe = startTracking();
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isTracking, startTracking]);

  const value: LocationContextValue = {
    currentLocation,
    isTracking,
    error,
    startTracking,
    stopTracking,
    refreshLocation,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};

/**
 * useLocation hook
 * Access location context
 * @throws Error if used outside LocationProvider
 */
export const useLocation = (): LocationContextValue => {
  const context = useContext(LocationContext);
  
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  
  return context;
};
