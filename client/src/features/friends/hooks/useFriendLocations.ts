import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { friendLocationService } from '../../../services/location/friend-location.service';
import { FriendLocation } from '../../../shared/types/location.types';
import { useNetwork } from '../../../shared/contexts/NetworkContext';

/**
 * Hook for managing friend locations with polling
 */
export const useFriendLocations = () => {
  const [friendLocations, setFriendLocations] = useState<FriendLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useNetwork();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  /**
   * Fetch friend locations from server
   */
  const fetchFriendLocations = useCallback(async () => {
    console.log('🔍 [useFriendLocations] fetchFriendLocations called', { isOnline });
    
    // Treat undefined as online (network status not yet determined)
    if (isOnline === false) {
      console.log('⚠️ Offline, skipping friend location fetch');
      return;
    }

    try {
      console.log('👥 [useFriendLocations] Calling friendLocationService.getFriendLocations()');
      const locations = await friendLocationService.getFriendLocations();
      console.log('✅ [useFriendLocations] Received locations:', locations.length);
      setFriendLocations(locations);
      setError(null);
    } catch (err) {
      console.error('❌ [useFriendLocations] Failed to fetch friend locations:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [isOnline]);

  /**
   * Start polling for friend locations
   */
  const startPolling = useCallback(() => {
    console.log('🔄 [useFriendLocations] startPolling called');
    
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Fetch immediately
    fetchFriendLocations();

    // Poll every 30 seconds when app is active
    intervalRef.current = setInterval(() => {
      console.log('⏰ [useFriendLocations] Polling interval triggered, appState:', appStateRef.current);
      if (appStateRef.current === 'active') {
        fetchFriendLocations();
      }
    }, 30000);
  }, [fetchFriendLocations]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Handle app state changes
   */
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      appStateRef.current = nextAppState;

      if (nextAppState === 'active') {
        // App came to foreground, resume polling
        startPolling();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App went to background, stop polling to save battery
        stopPolling();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [startPolling, stopPolling]);

  /**
   * Start polling when online
   */
  useEffect(() => {
    console.log('🌐 [useFriendLocations] Network/AppState effect triggered', { 
      isOnline, 
      appState: appStateRef.current 
    });
    
    // Treat undefined as online (network status not yet determined)
    const isActuallyOnline = isOnline !== false;
    
    if (isActuallyOnline && appStateRef.current === 'active') {
      console.log('✅ [useFriendLocations] Starting polling');
      startPolling();
    } else {
      console.log('⏸️ [useFriendLocations] Stopping polling', { isActuallyOnline, appState: appStateRef.current });
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isOnline, startPolling, stopPolling]);

  /**
   * Refresh friend locations manually
   */
  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchFriendLocations();
  }, [fetchFriendLocations]);

  return {
    friendLocations,
    isLoading,
    error,
    refresh,
  };
};
