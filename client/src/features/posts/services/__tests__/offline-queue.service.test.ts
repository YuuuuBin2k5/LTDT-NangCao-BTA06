/**
 * Tests for offline queue service
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { offlineQueueService } from '../offline-queue.service';
import { PostPrivacy } from '../../types/post.types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('OfflineQueueService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('enqueue', () => {
    it('should add post to queue', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const request = {
        content: 'Test post',
        latitude: 10.762622,
        longitude: 106.660172,
        privacy: PostPrivacy.PUBLIC,
      };
      const imageUris = ['file://test.jpg'];

      const postId = await offlineQueueService.enqueue(request, imageUris);

      expect(postId).toMatch(/^offline_/);
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('getQueue', () => {
    it('should return empty array when no queue exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const queue = await offlineQueueService.getQueue();

      expect(queue).toEqual([]);
    });

    it('should return parsed queue', async () => {
      const mockQueue = [
        {
          id: 'offline_123',
          request: {
            content: 'Test',
            latitude: 10,
            longitude: 106,
            privacy: PostPrivacy.PUBLIC,
          },
          imageUris: [],
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

      const queue = await offlineQueueService.getQueue();

      expect(queue).toEqual(mockQueue);
    });
  });

  describe('dequeue', () => {
    it('should remove post from queue', async () => {
      const mockQueue = [
        {
          id: 'offline_123',
          request: {
            content: 'Test',
            latitude: 10,
            longitude: 106,
            privacy: PostPrivacy.PUBLIC,
          },
          imageUris: [],
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await offlineQueueService.dequeue('offline_123');

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@offline_post_queue',
        JSON.stringify([])
      );
    });
  });

  describe('getQueueSize', () => {
    it('should return correct queue size', async () => {
      const mockQueue = [
        {
          id: 'offline_123',
          request: {
            content: 'Test',
            latitude: 10,
            longitude: 106,
            privacy: PostPrivacy.PUBLIC,
          },
          imageUris: [],
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

      const size = await offlineQueueService.getQueueSize();

      expect(size).toBe(1);
    });
  });

  describe('isEmpty', () => {
    it('should return true when queue is empty', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const isEmpty = await offlineQueueService.isEmpty();

      expect(isEmpty).toBe(true);
    });

    it('should return false when queue has items', async () => {
      const mockQueue = [
        {
          id: 'offline_123',
          request: {
            content: 'Test',
            latitude: 10,
            longitude: 106,
            privacy: PostPrivacy.PUBLIC,
          },
          imageUris: [],
          timestamp: Date.now(),
          retryCount: 0,
        },
      ];

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockQueue));

      const isEmpty = await offlineQueueService.isEmpty();

      expect(isEmpty).toBe(false);
    });
  });
});
