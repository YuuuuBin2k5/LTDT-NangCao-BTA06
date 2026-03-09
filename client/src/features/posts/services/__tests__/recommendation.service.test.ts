/**
 * Tests for recommendation service
 */
import { recommendationService } from '../recommendation.service';
import * as apiClientModule from '../../../../services/api/client';

// Mock the entire module
jest.mock('../../../../services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClientModule.apiClient as jest.Mocked<typeof apiClientModule.apiClient>;

describe('RecommendationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getForYouFeed', () => {
    it('should fetch for you feed successfully', async () => {
      const mockResponse = {
        data: {
          content: [
            { id: 1, content: 'Post 1' },
            { id: 2, content: 'Post 2' },
          ],
          totalElements: 2,
          totalPages: 1,
          number: 0,
          size: 20,
          last: true,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await recommendationService.getForYouFeed(0, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/for-you', {
        params: { page: 0, size: 20 },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should use default parameters', async () => {
      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 20,
          last: true,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await recommendationService.getForYouFeed();

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/for-you', {
        params: { page: 0, size: 20 },
      });
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(recommendationService.getForYouFeed()).rejects.toThrow('Network error');
    });
  });

  describe('getDiscoveryFeed', () => {
    it('should fetch discovery feed with location', async () => {
      const mockResponse = {
        data: {
          content: [{ id: 1, content: 'Discovery post' }],
          totalElements: 1,
          totalPages: 1,
          number: 0,
          size: 20,
          last: true,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await recommendationService.getDiscoveryFeed(10.762622, 106.660172, 0, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/discovery', {
        params: {
          latitude: 10.762622,
          longitude: 106.660172,
          page: 0,
          size: 20,
        },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch discovery feed without location', async () => {
      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 20,
          last: true,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await recommendationService.getDiscoveryFeed(undefined, undefined, 0, 20);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/discovery', {
        params: {
          latitude: undefined,
          longitude: undefined,
          page: 0,
          size: 20,
        },
      });
    });

    it('should use default parameters', async () => {
      const mockResponse = {
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          number: 0,
          size: 20,
          last: true,
        },
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      await recommendationService.getDiscoveryFeed();

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/discovery', {
        params: {
          latitude: undefined,
          longitude: undefined,
          page: 0,
          size: 20,
        },
      });
    });
  });

  describe('trackInteraction', () => {
    it('should track VIEW interaction with duration', async () => {
      mockApiClient.post.mockResolvedValue({ data: null });

      await recommendationService.trackInteraction({
        postId: 123,
        interactionType: 'VIEW',
        durationSeconds: 5,
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/recommendations/track', {
        postId: 123,
        interactionType: 'VIEW',
        durationSeconds: 5,
      });
    });

    it('should track LIKE interaction without duration', async () => {
      mockApiClient.post.mockResolvedValue({ data: null });

      await recommendationService.trackInteraction({
        postId: 456,
        interactionType: 'LIKE',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/recommendations/track', {
        postId: 456,
        interactionType: 'LIKE',
      });
    });

    it('should track COMMENT interaction', async () => {
      mockApiClient.post.mockResolvedValue({ data: null });

      await recommendationService.trackInteraction({
        postId: 789,
        interactionType: 'COMMENT',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/recommendations/track', {
        postId: 789,
        interactionType: 'COMMENT',
      });
    });

    it('should track SHARE interaction', async () => {
      mockApiClient.post.mockResolvedValue({ data: null });

      await recommendationService.trackInteraction({
        postId: 111,
        interactionType: 'SHARE',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/recommendations/track', {
        postId: 111,
        interactionType: 'SHARE',
      });
    });

    it('should track SAVE interaction', async () => {
      mockApiClient.post.mockResolvedValue({ data: null });

      await recommendationService.trackInteraction({
        postId: 222,
        interactionType: 'SAVE',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/recommendations/track', {
        postId: 222,
        interactionType: 'SAVE',
      });
    });

    it('should handle tracking errors silently', async () => {
      const error = new Error('Tracking failed');
      mockApiClient.post.mockRejectedValue(error);

      // Should not throw
      await expect(
        recommendationService.trackInteraction({
          postId: 123,
          interactionType: 'VIEW',
          durationSeconds: 5,
        })
      ).rejects.toThrow('Tracking failed');
    });
  });

  describe('getRecommendationReason', () => {
    it('should fetch recommendation reason', async () => {
      const mockResponse = {
        data: 'Từ người dùng có sở thích tương tự',
      };

      mockApiClient.get.mockResolvedValue(mockResponse);

      const result = await recommendationService.getRecommendationReason(123);

      expect(mockApiClient.get).toHaveBeenCalledWith('/recommendations/reason/123');
      expect(result).toBe('Từ người dùng có sở thích tương tự');
    });

    it('should handle different reason types', async () => {
      const reasons = [
        'Chủ đề bạn quan tâm',
        'Đang được nhiều người quan tâm',
        'Gợi ý cho bạn',
      ];

      for (const reason of reasons) {
        mockApiClient.get.mockResolvedValue({ data: reason });

        const result = await recommendationService.getRecommendationReason(123);
        expect(result).toBe(reason);
      }
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch reason');
      mockApiClient.get.mockRejectedValue(error);

      await expect(recommendationService.getRecommendationReason(123)).rejects.toThrow(
        'Failed to fetch reason'
      );
    });
  });
});
