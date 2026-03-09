import { useState, useEffect, useCallback } from 'react';
import { useNetwork } from '../../../shared/contexts/NetworkContext';
import { locationOfflineQueueService } from '../services/location-offline-queue.service';
import { apiClient } from '../../../services/api/client';
import { logger } from '../../../shared/utils/logger.utils';

export const useLocationOfflineSync = () => {
  const { isConnected } = useNetwork();
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Update pending count
  const updatePendingCount = useCallback(async () => {
    const count = await locationOfflineQueueService.getPendingCount();
    setPendingCount(count);
  }, []);

  // Sync queued items
  const syncQueue = useCallback(async () => {
    if (!isConnected || isSyncing) return;

    try {
      setIsSyncing(true);
      logger.info('Starting offline sync');

      // Sync location updates
      const locationQueue = await locationOfflineQueueService.getLocationQueue();
      for (const item of locationQueue) {
        try {
          await apiClient.post('/locations/update', item.request);
          await locationOfflineQueueService.dequeueLocationUpdate(item.id);
          logger.info('Location update synced', { id: item.id });
        } catch (error) {
          logger.error('Failed to sync location update', { id: item.id, error });
          await locationOfflineQueueService.incrementLocationRetry(item.id);
          
          // Remove if too many retries
          if (item.retryCount >= 3) {
            await locationOfflineQueueService.dequeueLocationUpdate(item.id);
            logger.warn('Location update removed after max retries', { id: item.id });
          }
        }
      }

      // Sync interactions
      const interactionQueue = await locationOfflineQueueService.getInteractionQueue();
      for (const item of interactionQueue) {
        try {
          await apiClient.post('/interactions/send', item.request);
          await locationOfflineQueueService.dequeueInteraction(item.id);
          logger.info('Interaction synced', { id: item.id });
        } catch (error) {
          logger.error('Failed to sync interaction', { id: item.id, error });
          await locationOfflineQueueService.incrementInteractionRetry(item.id);
          
          // Remove if too many retries
          if (item.retryCount >= 3) {
            await locationOfflineQueueService.dequeueInteraction(item.id);
            logger.warn('Interaction removed after max retries', { id: item.id });
          }
        }
      }

      setLastSyncTime(new Date());
      await updatePendingCount();
      logger.info('Offline sync completed');
    } catch (error) {
      logger.error('Offline sync failed', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isConnected, isSyncing, updatePendingCount]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isConnected && pendingCount > 0) {
      syncQueue();
    }
  }, [isConnected, pendingCount, syncQueue]);

  // Update pending count on mount and periodically
  useEffect(() => {
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 10000); // Every 10 seconds
    return () => clearInterval(interval);
  }, [updatePendingCount]);

  return {
    isSyncing,
    pendingCount,
    lastSyncTime,
    syncQueue,
    updatePendingCount,
  };
};
