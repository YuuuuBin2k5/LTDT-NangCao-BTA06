/**
 * Service for managing filter presets
 */
import { apiClient } from '../../../services/api/client';
import type { FilterPreset, CreatePresetRequest } from '../types/filter.types';

class PresetService {
  /**
   * Get all presets for current user
   */
  async getPresets(): Promise<FilterPreset[]> {
    const response = await apiClient.get<FilterPreset[]>('/feed/presets');
    return response;
  }

  /**
   * Get a specific preset
   */
  async getPreset(presetId: number): Promise<FilterPreset> {
    const response = await apiClient.get<FilterPreset>(`/feed/presets/${presetId}`);
    return response;
  }

  /**
   * Create a new preset
   */
  async createPreset(data: CreatePresetRequest): Promise<FilterPreset> {
    const response = await apiClient.post<FilterPreset>('/feed/presets', data);
    return response;
  }

  /**
   * Delete a preset
   */
  async deletePreset(presetId: number): Promise<void> {
    await apiClient.delete(`/feed/presets/${presetId}`);
  }

  /**
   * Share a preset (get share token)
   */
  async sharePreset(presetId: number): Promise<string> {
    const response = await apiClient.post<{ shareToken: string }>(
      `/feed/presets/${presetId}/share`
    );
    return response.shareToken;
  }

  /**
   * Apply a shared preset
   */
  async applySharedPreset(shareToken: string): Promise<FilterPreset> {
    const response = await apiClient.post<FilterPreset>(
      `/feed/presets/shared/${shareToken}`
    );
    return response;
  }

  /**
   * Set a preset as default
   */
  async setDefaultPreset(presetId: number): Promise<void> {
    await apiClient.put(`/feed/presets/${presetId}/default`);
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(presetId: number): Promise<void> {
    await apiClient.post(`/feed/presets/${presetId}/use`);
  }
}

export const presetService = new PresetService();
