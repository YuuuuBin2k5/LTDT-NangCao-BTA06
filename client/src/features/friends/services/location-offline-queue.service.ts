import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../../shared/utils/logger.utils';
import { LocationUpdateRequest } from '../../../shared/types/location.types';
import { SendInteractionRequest } from '../../../shared/types/interaction.types';

const LOCATION_QUEUE_KEY = '@offline_location_queue';
const INTERACTION_QUEUE_KEY = '@offline_interaction_queue';

export interface QueuedLocationUpdate {
  id: string;
  request: LocationUpdateRequest;
  timestamp: number;
  retryCount: number;
}

export interface QueuedInteraction {
  id: string;
  request: SendInteractionRequest;
  timestamp: number;
  retryCount: number;
}

class LocationOfflineQueueService {
  /**
   * Enqueue location update
   */
  async enqueueLocationUpdate(request: LocationUpdateRequest): Promise<string> {
    try {
      const queue = await this.getLocationQueue();
      
      const queuedUpdate: QueuedLocationUpdate = {
        id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request,
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(queuedUpdate);
      await this.saveLocationQueue(queue);

      logger.info('Location update queued', { id: queuedUpdate.id });
      return queuedUpdate.id;
    } catch (error) {
      logger.error('Failed to enqueue location update', error);
      throw error;
    }
  }

  /**
   * Enqueue interaction
   */
  async enqueueInteraction(request: SendInteractionRequest): Promise<string> {
    try {
      const queue = await this.getInteractionQueue();
      
      const queuedInteraction: QueuedInteraction = {
        id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        request,
        timestamp: Date.now(),
        retryCount: 0,
      };

      queue.push(queuedInteraction);
      await this.saveInteractionQueue(queue);

      logger.info('Interaction queued', { id: queuedInteraction.id });
      return queuedInteraction.id;
    } catch (error) {
      logger.error('Failed to enqueue interaction', error);
      throw error;
    }
  }

  /**
   * Get location queue
   */
  async getLocationQueue(): Promise<QueuedLocationUpdate[]> {
    try {
      const data = await AsyncStorage.getItem(LOCATION_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get interaction queue
   */
  async getInteractionQueue(): Promise<QueuedInteraction[]> {
    try {
      const data = await AsyncStorage.getItem(INTERACTION_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Save location queue
   */
  private async saveLocationQueue(queue: QueuedLocationUpdate[]): Promise<void> {
    await AsyncStorage.setItem(LOCATION_QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Save interaction queue
   */
  private async saveInteractionQueue(queue: QueuedInteraction[]): Promise<void> {
    await AsyncStorage.setItem(INTERACTION_QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Dequeue location update
   */
  async dequeueLocationUpdate(id: string): Promise<void> {
    try {
      const queue = await this.getLocationQueue();
      const filtered = queue.filter((item) => item.id !== id);
      await this.saveLocationQueue(filtered);
      logger.info('Location update dequeued', { id });
    } catch (error) {
      logger.error('Failed to dequeue location update', error);
      throw error;
    }
  }

  /**
   * Dequeue interaction
   */
  async dequeueInteraction(id: string): Promise<void> {
    try {
      const queue = await this.getInteractionQueue();
      const filtered = queue.filter((item) => item.id !== id);
      await this.saveInteractionQueue(filtered);
      logger.info('Interaction dequeued', { id });
    } catch (error) {
      logger.error('Failed to dequeue interaction', error);
      throw error;
    }
  }

  /**
   * Get total pending count
   */
  async getPendingCount(): Promise<number> {
    const locationQueue = await this.getLocationQueue();
    const interactionQueue = await this.getInteractionQueue();
    return locationQueue.length + interactionQueue.length;
  }

  /**
   * Clear all queues
   */
  async clearAll(): Promise<void> {
    await AsyncStorage.multiRemove([LOCATION_QUEUE_KEY, INTERACTION_QUEUE_KEY]);
    logger.info('All offline queues cleared');
  }

  /**
   * Increment retry count
   */
  async incrementLocationRetry(id: string): Promise<void> {
    const queue = await this.getLocationQueue();
    const item = queue.find((i) => i.id === id);
    if (item) {
      item.retryCount += 1;
      await this.saveLocationQueue(queue);
    }
  }

  async incrementInteractionRetry(id: string): Promise<void> {
    const queue = await this.getInteractionQueue();
    const item = queue.find((i) => i.id === id);
    if (item) {
      item.retryCount += 1;
      await this.saveInteractionQueue(queue);
    }
  }
}

export const locationOfflineQueueService = new LocationOfflineQueueService();
