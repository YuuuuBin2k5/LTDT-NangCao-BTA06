import { useState, useCallback } from 'react';
import { friendInteractionService } from '../../../services/interaction/friend-interaction.service';
import {
  Interaction,
  InteractionStats,
  SendInteractionRequest,
} from '../../../shared/types/interaction.types';

/**
 * Hook for managing friend interactions
 */
export const useFriendInteractions = () => {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [stats, setStats] = useState<InteractionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Send an interaction to a friend
   */
  const sendInteraction = useCallback(async (request: SendInteractionRequest) => {
    try {
      const interaction = await friendInteractionService.sendInteraction(request);
      return interaction;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  /**
   * Fetch received interactions
   */
  const fetchReceivedInteractions = useCallback(
    async (page: number = 0, size: number = 20) => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await friendInteractionService.getReceivedInteractions(page, size);
        setInteractions(data);
      } catch (err) {
        console.error('Failed to fetch interactions:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Fetch interaction statistics
   */
  const fetchStatistics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await friendInteractionService.getStatistics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    interactions,
    stats,
    isLoading,
    error,
    sendInteraction,
    fetchReceivedInteractions,
    fetchStatistics,
  };
};
