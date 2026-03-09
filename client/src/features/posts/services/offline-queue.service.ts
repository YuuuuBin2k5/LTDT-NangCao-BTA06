/**
 * Offline queue service for managing posts when offline
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../shared/utils/logger.utils';
import type { CreatePostRequest } from '../types/post.types';

const QUEUE_STORAGE_KEY = '@offline_post_queue';

export interface QueuedPost {
  id: string; // Temporary local ID
  request: Omit<CreatePostRequest, 'imageUrls'>;
  imageUris: string[]; // Local URIs
  timestamp: number;
  retryCount: number;
}

class OfflineQueueService {
  /**
   * Add post to offline queue
   */
  async enqueue(
    request: Omit<CreatePostRequest, 'imageUrls'>,
    imageUris: string[]
  ): Promise<string> {
    try {
      const queue = await this.getQueue();
      
      const queuedPost: QueuedPost = {
        id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request,
        imageUris,
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(queuedPost);
      await this.saveQueue(queue);

      logger.info('Post added to offline queue', { postId: queuedPost.id });
      return queuedPost.id;
    } catch (error) {
      logger.error('Failed to enqueue post', error);
      throw error;
    }
  }

  /**
   * Get all queued posts
   */
  async getQueue(): Promise<QueuedPost[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (!data || data === null) {
        return [];
      }
      return JSON.parse(data);
    } catch (error) {
      // Silently return empty array on first access or storage errors
      // This is expected behavior when the key doesn't exist yet
      return [];
    }
  }

  /**
   * Save queue to storage
   */
  private async saveQueue(queue: QueuedPost[]): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      logger.error('Failed to save queue', error);
      throw error;
    }
  }

  /**
   * Remove post from queue
   */
  async dequeue(postId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const filteredQueue = queue.filter((post) => post.id !== postId);
      await this.saveQueue(filteredQueue);
      logger.info('Post removed from offline queue', { postId });
    } catch (error) {
      logger.error('Failed to dequeue post', error);
      throw error;
    }
  }

  /**
   * Increment retry count for a post
   */
  async incrementRetryCount(postId: string): Promise<void> {
    try {
      const queue = await this.getQueue();
      const post = queue.find((p) => p.id === postId);
      
      if (post) {
        post.retryCount += 1;
        await this.saveQueue(queue);
        logger.info('Incremented retry count', { postId, retryCount: post.retryCount });
      }
    } catch (error) {
      logger.error('Failed to increment retry count', error);
      throw error;
    }
  }

  /**
   * Clear entire queue
   */
  async clearQueue(): Promise<void> {
    try {
      await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
      logger.info('Offline queue cleared');
    } catch (error) {
      logger.error('Failed to clear queue', error);
      throw error;
    }
  }

  /**
   * Get queue size
   */
  async getQueueSize(): Promise<number> {
    const queue = await this.getQueue();
    return queue.length;
  }

  /**
   * Check if queue is empty
   */
  async isEmpty(): Promise<boolean> {
    const size = await this.getQueueSize();
    return size === 0;
  }
}

export const offlineQueueService = new OfflineQueueService();
