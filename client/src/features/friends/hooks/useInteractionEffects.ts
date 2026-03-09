import { useState, useCallback } from 'react';
import { ActiveEffect, InteractionType } from '../../../shared/types/interaction.types';

/**
 * Hook for managing interaction effect animations
 */
export const useInteractionEffects = () => {
  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);

  /**
   * Add a new interaction effect
   */
  const addEffect = useCallback(
    (
      type: InteractionType,
      fromCoordinate: { latitude: number; longitude: number },
      toCoordinate: { latitude: number; longitude: number }
    ) => {
      const effect: ActiveEffect = {
        id: `effect-${Date.now()}-${Math.random()}`,
        type,
        fromCoordinate,
        toCoordinate,
        progress: 0,
        startTime: Date.now(),
      };

      setActiveEffects((prev) => [...prev, effect]);

      // Limit concurrent effects to 5 for performance
      setActiveEffects((prev) => {
        if (prev.length > 5) {
          return prev.slice(-5);
        }
        return prev;
      });
    },
    []
  );

  /**
   * Remove completed effect
   */
  const removeEffect = useCallback((effectId: string) => {
    setActiveEffects((prev) => prev.filter((e) => e.id !== effectId));
  }, []);

  /**
   * Clear all effects
   */
  const clearEffects = useCallback(() => {
    setActiveEffects([]);
  }, []);

  return {
    activeEffects,
    addEffect,
    removeEffect,
    clearEffects,
  };
};
