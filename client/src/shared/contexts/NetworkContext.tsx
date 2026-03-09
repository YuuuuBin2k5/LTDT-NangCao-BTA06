import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { logger } from '../utils/logger.utils';

/**
 * Network context value interface
 */
interface NetworkContextValue {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

/**
 * Network context
 */
const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

/**
 * Network provider props
 */
interface NetworkProviderProps {
  children: ReactNode;
}

/**
 * Network provider component
 * Monitors network connectivity status
 */
export const NetworkProvider: React.FC<NetworkProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null);
  const [connectionType, setConnectionType] = useState<string | null>(null);

  useEffect(() => {
    // Subscribe to network state updates
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const connected = state.isConnected ?? false;
      const reachable = state.isInternetReachable;
      const type = state.type;

      setIsConnected(connected);
      setIsInternetReachable(reachable);
      setConnectionType(type);

      logger.info('Network status changed', {
        isConnected: connected,
        isInternetReachable: reachable,
        type,
      });
    });

    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, []);

  const value: NetworkContextValue = {
    isConnected,
    isInternetReachable,
    connectionType,
  };

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
};

/**
 * Hook to use network context
 * @throws Error if used outside NetworkProvider
 */
export const useNetwork = (): NetworkContextValue => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
