/**
 * Hook for managing offline post sync
 */
import { useState, useEffect, useCallback } from 'react';
import { syncService, SyncResult } from '../services/sync.service';
import { offlineQueueService } from '../services/offline-queue.service';
import { useNetwork } from '../../../shared/contexts/NetworkContext';
import { logger } from '../../../shared/utils/logger.utils';

export const useOfflineSync = () => {
  const [queueSize, setQueueSize] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const { isConnected, isInternetReachable } = useNetwork();

  /**
   * Update queue size
   */
  const updateQueueSize = useCallback(async () => {
    try {
      const size = await offlineQueueService.getQueueSize();
      setQueueSize(size);
    } catch (error) {
      logger.error('Failed to get queue size', error);
    }
  }, []);

  /**
   * Sync queued posts
   */
  const sync = useCallback(async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const result = await syncService.syncQueue();
      setLastSyncResult(result);
      await updateQueueSize();
      return result;
    } catch (error) {
      logger.error('Sync failed', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, [updateQueueSize]);

  /**
   * Auto-sync when coming back online
   */
  useEffect(() => {
    const isOnline = isConnected && (isInternetReachable === null || isInternetReachable);

    if (isOnline && queueSize > 0 && !isSyncing) {
      logger.info('Device back online, starting auto-sync');
      sync();
    }
  }, [isConnected, isInternetReachable, queueSize, isSyncing, sync]);

  /**
   * Update queue size on mount and when network changes
   */
  useEffect(() => {
    updateQueueSize();
  }, [updateQueueSize]);

  return {
    queueSize,
    isSyncing,
    lastSyncResult,
    sync,
    updateQueueSize,
  };
};
