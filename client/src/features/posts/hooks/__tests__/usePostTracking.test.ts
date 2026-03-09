/**
 * Tests for usePostTracking hook
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePostTracking } from '../usePostTracking';

// Mock recommendation service
jest.mock('../../services/recommendation.service', () => ({
  recommendationService: {
    getForYouFeed: jest.fn(),
    getDiscoveryFeed: jest.fn(),
    trackInteraction: jest.fn(),
    getRecommendationReason: jest.fn(),
  },
}));

import { recommendationService } from '../../services/recommendation.service';

const mockRecommendationService = recommendationService as jest.Mocked<
  typeof recommendationService
>;

describe('usePostTracking', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('View tracking', () => {
    it('should track view when duration exceeds minimum', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
          minViewDuration: 2,
        })
      );

      // Start tracking
      act(() => {
        result.current.startTracking();
      });

      // Wait 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Stop tracking
      await act(async () => {
        await result.current.stopTracking();
      });

      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledWith({
        postId: 123,
        interactionType: 'VIEW',
        durationSeconds: 3,
      });
    });

    it('should not track view when duration is below minimum', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
          minViewDuration: 2,
        })
      );

      // Start tracking
      act(() => {
        result.current.startTracking();
      });

      // Wait only 1 second
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Stop tracking
      await act(async () => {
        await result.current.stopTracking();
      });

      expect(mockRecommendationService.trackInteraction).not.toHaveBeenCalled();
    });

    it('should not track view when disabled', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: false,
          minViewDuration: 2,
        })
      );

      // Start tracking
      act(() => {
        result.current.startTracking();
      });

      // Wait 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Stop tracking
      await act(async () => {
        await result.current.stopTracking();
      });

      expect(mockRecommendationService.trackInteraction).not.toHaveBeenCalled();
    });

    it('should only track view once', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
          minViewDuration: 2,
        })
      );

      // First view
      act(() => {
        result.current.startTracking();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await act(async () => {
        await result.current.stopTracking();
      });

      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledTimes(1);

      // Try to track again
      act(() => {
        result.current.startTracking();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await act(async () => {
        await result.current.stopTracking();
      });

      // Should still be called only once
      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledTimes(1);
    });

    it('should handle tracking errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockRecommendationService.trackInteraction.mockRejectedValue(
        new Error('Tracking failed')
      );

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
          minViewDuration: 2,
        })
      );

      act(() => {
        result.current.startTracking();
      });

      act(() => {
        jest.advanceTimersByTime(3000);
      });

      await act(async () => {
        await result.current.stopTracking();
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to track post view:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('Interaction tracking', () => {
    it('should track LIKE interaction', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
        })
      );

      await act(async () => {
        await result.current.trackInteraction('LIKE');
      });

      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledWith({
        postId: 123,
        interactionType: 'LIKE',
      });
    });

    it('should track COMMENT interaction', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 456,
          enabled: true,
        })
      );

      await act(async () => {
        await result.current.trackInteraction('COMMENT');
      });

      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledWith({
        postId: 456,
        interactionType: 'COMMENT',
      });
    });

    it('should track SHARE interaction', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 789,
          enabled: true,
        })
      );

      await act(async () => {
        await result.current.trackInteraction('SHARE');
      });

      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledWith({
        postId: 789,
        interactionType: 'SHARE',
      });
    });

    it('should track SAVE interaction', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 111,
          enabled: true,
        })
      );

      await act(async () => {
        await result.current.trackInteraction('SAVE');
      });

      expect(mockRecommendationService.trackInteraction).toHaveBeenCalledWith({
        postId: 111,
        interactionType: 'SAVE',
      });
    });

    it('should not track interactions when disabled', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: false,
        })
      );

      await act(async () => {
        await result.current.trackInteraction('LIKE');
      });

      expect(mockRecommendationService.trackInteraction).not.toHaveBeenCalled();
    });

    it('should handle interaction tracking errors gracefully', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation();
      mockRecommendationService.trackInteraction.mockRejectedValue(
        new Error('Tracking failed')
      );

      const { result } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
        })
      );

      await act(async () => {
        await result.current.trackInteraction('LIKE');
      });

      expect(consoleError).toHaveBeenCalledWith(
        'Failed to track LIKE interaction:',
        expect.any(Error)
      );

      consoleError.mockRestore();
    });
  });

  describe('Cleanup', () => {
    it('should stop tracking on unmount', async () => {
      mockRecommendationService.trackInteraction.mockResolvedValue();

      const { result, unmount } = renderHook(() =>
        usePostTracking({
          postId: 123,
          enabled: true,
          minViewDuration: 2,
        })
      );

      // Start tracking
      act(() => {
        result.current.startTracking();
      });

      // Wait 3 seconds
      act(() => {
        jest.advanceTimersByTime(3000);
      });

      // Unmount (should trigger stopTracking)
      unmount();

      // Wait for async operations
      await waitFor(() => {
        expect(mockRecommendationService.trackInteraction).toHaveBeenCalledWith({
          postId: 123,
          interactionType: 'VIEW',
          durationSeconds: 3,
        });
      });
    });
  });
});
