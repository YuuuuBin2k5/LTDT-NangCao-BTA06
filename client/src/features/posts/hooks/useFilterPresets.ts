/**
 * Hook for managing filter presets
 */
import { useState, useCallback, useEffect } from 'react';
import { presetService } from '../services/preset.service';
import type { FilterPreset, FilterConfig, CreatePresetRequest } from '../types/filter.types';

export interface UseFilterPresetsReturn {
  presets: FilterPreset[];
  isLoading: boolean;
  error: Error | null;
  loadPresets: () => Promise<void>;
  savePreset: (name: string, description: string | undefined, filters: FilterConfig[]) => Promise<FilterPreset>;
  deletePreset: (presetId: number) => Promise<void>;
  applyPreset: (presetId: number) => FilterConfig[];
  sharePreset: (presetId: number) => Promise<string>;
  applySharedPreset: (shareToken: string) => Promise<FilterPreset>;
  setDefaultPreset: (presetId: number) => Promise<void>;
}

export const useFilterPresets = (): UseFilterPresetsReturn => {
  const [presets, setPresets] = useState<FilterPreset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadPresets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Debug auth in development
      if (__DEV__) {
        try {
          const SecureStore = await import('expo-secure-store');
          const token = await SecureStore.getItemAsync('userToken');
          console.log('[DEBUG] Token exists:', !!token);
          console.log('[DEBUG] Token length:', token?.length || 0);
        } catch (e) {
          console.log('[DEBUG] Failed to check token:', e);
        }
      }
      
      const data = await presetService.getPresets();
      setPresets(data);
    } catch (err) {
      const error = err as Error;
      setError(error);
      console.error('Failed to load presets:', error);
      
      // If it's a 403 auth error, just set empty presets and don't throw
      // User can still use filters, just won't have saved presets
      if (error.message?.includes('403')) {
        console.log('[DEBUG] Auth error loading presets - continuing with empty presets');
        setPresets([]);
        setError(null); // Clear error so UI doesn't show error state
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load presets on mount
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const savePreset = useCallback(async (
    name: string,
    description: string | undefined,
    filters: FilterConfig[]
  ): Promise<FilterPreset> => {
    setError(null);
    try {
      const request: CreatePresetRequest = {
        name,
        description,
        filters,
        isPublic: false,
      };
      const newPreset = await presetService.createPreset(request);
      setPresets(prev => [...prev, newPreset]);
      return newPreset;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const deletePreset = useCallback(async (presetId: number) => {
    setError(null);
    try {
      await presetService.deletePreset(presetId);
      setPresets(prev => prev.filter(p => p.id !== presetId));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const applyPreset = useCallback((presetId: number): FilterConfig[] => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) {
      throw new Error('Preset not found');
    }

    // Increment usage count in background
    presetService.incrementUsageCount(presetId).catch(console.error);

    return preset.filters;
  }, [presets]);

  const sharePreset = useCallback(async (presetId: number): Promise<string> => {
    setError(null);
    try {
      const shareToken = await presetService.sharePreset(presetId);
      
      // Update local preset with share token
      setPresets(prev => prev.map(p => 
        p.id === presetId 
          ? { ...p, shareToken, isPublic: true }
          : p
      ));
      
      return shareToken;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const applySharedPreset = useCallback(async (shareToken: string): Promise<FilterPreset> => {
    setError(null);
    try {
      const newPreset = await presetService.applySharedPreset(shareToken);
      setPresets(prev => [...prev, newPreset]);
      return newPreset;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const setDefaultPreset = useCallback(async (presetId: number) => {
    setError(null);
    try {
      await presetService.setDefaultPreset(presetId);
      
      // Update local presets
      setPresets(prev => prev.map(p => ({
        ...p,
        isDefault: p.id === presetId,
      })));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    presets,
    isLoading,
    error,
    loadPresets,
    savePreset,
    deletePreset,
    applyPreset,
    sharePreset,
    applySharedPreset,
    setDefaultPreset,
  };
};
