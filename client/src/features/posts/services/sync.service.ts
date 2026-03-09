/**
 * Sync service for uploading queued posts when back online
 */
import { logger } from '../../../shared/utils/logger.utils';
import { offlineQueueService, QueuedPost } from './offline-queue.service';
import { postService } from './post.service';
import { imageService } from './image.service';

const MAX_RETRY_COUNT = 3;

export interface SyncResult {
  success: number;
  failed: number;
  total: number;
  errors: Array<{ postId: string; error: string }>;
}

class SyncService {
  private isSyncing = false;

  /**
   * Sync all queued posts
   */
  async syncQueue(): Promise<SyncResult> {
    if (this.isSyncing) {
      logger.warn('Sync already in progress');
      return { success: 0, failed: 0, total: 0, errors: [] };
    }

    this.isSyncing = true;
    logger.info('Starting sync of offline queue');

    const result: SyncResult = {
      success: 0,
      failed: 0,
      total: 0,
      errors: [],
    };

    try {
      const queue = await offlineQueueService.getQueue();
      result.total = queue.length;

      if (queue.length === 0) {
        logger.info('No posts to sync');
        return result;
      }

      // Process each queued post
      for (const queuedPost of queue) {
        try {
          await this.syncPost(queuedPost);
          result.success += 1;
        } catch (error) {
          result.failed += 1;
          result.errors.push({
            postId: queuedPost.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          // Increment retry count
          await offlineQueueService.incrementRetryCount(queuedPost.id);

          // Remove from queue if max retries reached
          if (queuedPost.retryCount >= MAX_RETRY_COUNT) {
            logger.warn('Max retries reached, removing from queue', {
              postId: queuedPost.id,
            });
            await offlineQueueService.dequeue(queuedPost.id);
          }
        }
      }

      logger.info('Sync completed', result);
    } catch (error) {
      logger.error('Sync failed', error);
    } finally {
      this.isSyncing = false;
    }

    return result;
  }

  /**
   * Sync a single post
   */
  private async syncPost(queuedPost: QueuedPost): Promise<void> {
    logger.info('Syncing post', { postId: queuedPost.id });

    try {
      // Upload images first
      let imageUrls: string[] = [];
      if (queuedPost.imageUris.length > 0) {
        const uploadResults = await imageService.uploadMultipleImages(
          queuedPost.imageUris
        );
        imageUrls = uploadResults.map((result) => result.imageUrl);
      }

      // Create post with image URLs
      await postService.createPost({
        ...queuedPost.request,
        imageUrls,
      });

      // Remove from queue on success
      await offlineQueueService.dequeue(queuedPost.id);
      logger.info('Post synced successfully', { postId: queuedPost.id });
    } catch (error) {
      logger.error('Failed to sync post', error, { postId: queuedPost.id });
      throw error;
    }
  }

  /**
   * Check if sync is in progress
   */
  isSyncInProgress(): boolean {
    return this.isSyncing;
  }
}

export const syncService = new SyncService();
