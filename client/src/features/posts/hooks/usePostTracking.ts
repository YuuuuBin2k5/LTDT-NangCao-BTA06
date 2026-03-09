/**
 * Hook for tracking post views and interactions
 */
import { useEffect, useRef, useCallback } from 'react';
import { recommendationService } from '../services/recommendation.service';

interface UsePostTrackingOptions {
  postId: number;
  enabled?: boolean;
  minViewDuration?: number; // Minimum seconds to count as view
}

export const usePostTracking = ({
  postId,
  enabled = true,
  minViewDuration = 2,
}: UsePostTrackingOptions) => {
  const viewStartTime = useRef<number | null>(null);
  const hasTrackedView = useRef(false);

  // Start tracking when post becomes visible
  const startTracking = useCallback(() => {
    if (!enabled || hasTrackedView.current) return;
    viewStartTime.current = Date.now();
  }, [enabled]);

  // Stop tracking and send data
  const stopTracking = useCallback(async () => {
    if (!enabled || !viewStartTime.current || hasTrackedView.current) return;

    const durationSeconds = Math.floor((Date.now() - viewStartTime.current) / 1000);

    // Only track if viewed for minimum duration
    if (durationSeconds >= minViewDuration) {
      try {
        await recommendationService.trackInteraction({
          postId,
          interactionType: 'VIEW',
          durationSeconds,
        });
        hasTrackedView.current = true;
      } catch (error) {
        console.error('Failed to track post view:', error);
      }
    }

    viewStartTime.current = null;
  }, [enabled, postId, minViewDuration]);

  // Track other interaction types
  const trackInteraction = useCallback(
    async (type: 'LIKE' | 'COMMENT' | 'SHARE' | 'SAVE') => {
      if (!enabled) return;

      try {
        await recommendationService.trackInteraction({
          postId,
          interactionType: type,
        });
      } catch (error) {
        console.error(`Failed to track ${type} interaction:`, error);
      }
    },
    [enabled, postId]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    startTracking,
    stopTracking,
    trackInteraction,
  };
};
