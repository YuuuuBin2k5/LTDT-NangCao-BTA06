/**
 * Tests for preset service
 */
import { presetService } from '../preset.service';
import type { FilterPreset, CreatePresetRequest } from '../../types/filter.types';

// Mock API client
jest.mock('../../../../services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

import { apiClient } from '../../../../services/api/client';

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('presetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPresets', () => {
    it('should fetch all presets', async () => {
      const mockPresets: FilterPreset[] = [
        {
          id: 1,
          name: 'Test Preset',
          filters: [],
          isDefault: false,
          isPublic: false,
          usageCount: 0,
          createdAt: '2026-03-01T00:00:00Z',
          updatedAt: '2026-03-01T00:00:00Z',
        },
      ];

      mockApiClient.get.mockResolvedValue(mockPresets);

      const result = await presetService.getPresets();

      expect(result).toEqual(mockPresets);
      expect(mockApiClient.get).toHaveBeenCalledWith('/feed/presets');
    });

    it('should handle fetch error', async () => {
      const error = new Error('Network error');
      mockApiClient.get.mockRejectedValue(error);

      await expect(presetService.getPresets()).rejects.toThrow('Network error');
    });
  });

  describe('getPreset', () => {
    it('should fetch a specific preset', async () => {
      const mockPreset: FilterPreset = {
        id: 1,
        name: 'Test Preset',
        filters: [],
        isDefault: false,
        isPublic: false,
        usageCount: 0,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      };

      mockApiClient.get.mockResolvedValue(mockPreset);

      const result = await presetService.getPreset(1);

      expect(result).toEqual(mockPreset);
      expect(mockApiClient.get).toHaveBeenCalledWith('/feed/presets/1');
    });
  });

  describe('createPreset', () => {
    it('should create a new preset', async () => {
      const request: CreatePresetRequest = {
        name: 'New Preset',
        description: 'Test description',
        filters: [
          { id: 'f1', type: 'SOCIAL', value: 'friends', label: 'Bạn bè' },
        ],
        isPublic: false,
      };

      const mockResponse: FilterPreset = {
        id: 1,
        name: request.name,
        description: request.description,
        filters: request.filters,
        isDefault: false,
        isPublic: false,
        usageCount: 0,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await presetService.createPreset(request);

      expect(result).toEqual(mockResponse);
      expect(mockApiClient.post).toHaveBeenCalledWith('/feed/presets', request);
    });

    it('should handle validation error', async () => {
      const request: CreatePresetRequest = {
        name: '',
        filters: [],
      };

      const error = new Error('Validation failed');
      mockApiClient.post.mockRejectedValue(error);

      await expect(presetService.createPreset(request)).rejects.toThrow('Validation failed');
    });
  });

  describe('deletePreset', () => {
    it('should delete a preset', async () => {
      mockApiClient.delete.mockResolvedValue(undefined);

      await presetService.deletePreset(1);

      expect(mockApiClient.delete).toHaveBeenCalledWith('/feed/presets/1');
    });

    it('should handle delete error', async () => {
      const error = new Error('Not found');
      mockApiClient.delete.mockRejectedValue(error);

      await expect(presetService.deletePreset(999)).rejects.toThrow('Not found');
    });
  });

  describe('sharePreset', () => {
    it('should generate share token', async () => {
      const mockResponse = { shareToken: 'abc123def456' };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await presetService.sharePreset(1);

      expect(result).toBe('abc123def456');
      expect(mockApiClient.post).toHaveBeenCalledWith('/feed/presets/1/share');
    });

    it('should handle share error', async () => {
      const error = new Error('Unauthorized');
      mockApiClient.post.mockRejectedValue(error);

      await expect(presetService.sharePreset(1)).rejects.toThrow('Unauthorized');
    });
  });

  describe('applySharedPreset', () => {
    it('should apply shared preset', async () => {
      const mockPreset: FilterPreset = {
        id: 2,
        name: 'Shared Preset (Shared)',
        filters: [],
        isDefault: false,
        isPublic: false,
        usageCount: 0,
        createdAt: '2026-03-01T00:00:00Z',
        updatedAt: '2026-03-01T00:00:00Z',
      };

      mockApiClient.post.mockResolvedValue(mockPreset);

      const result = await presetService.applySharedPreset('abc123');

      expect(result).toEqual(mockPreset);
      expect(mockApiClient.post).toHaveBeenCalledWith('/feed/presets/shared/abc123');
    });

    it('should handle invalid token', async () => {
      const error = new Error('Invalid token');
      mockApiClient.post.mockRejectedValue(error);

      await expect(presetService.applySharedPreset('invalid')).rejects.toThrow('Invalid token');
    });
  });

  describe('setDefaultPreset', () => {
    it('should set preset as default', async () => {
      mockApiClient.put.mockResolvedValue(undefined);

      await presetService.setDefaultPreset(1);

      expect(mockApiClient.put).toHaveBeenCalledWith('/feed/presets/1/default');
    });

    it('should handle error', async () => {
      const error = new Error('Failed');
      mockApiClient.put.mockRejectedValue(error);

      await expect(presetService.setDefaultPreset(1)).rejects.toThrow('Failed');
    });
  });

  describe('incrementUsageCount', () => {
    it('should increment usage count', async () => {
      mockApiClient.post.mockResolvedValue(undefined);

      await presetService.incrementUsageCount(1);

      expect(mockApiClient.post).toHaveBeenCalledWith('/feed/presets/1/use');
    });

    it('should handle error silently', async () => {
      const error = new Error('Failed');
      mockApiClient.post.mockRejectedValue(error);

      // Should not throw
      await expect(presetService.incrementUsageCount(1)).rejects.toThrow('Failed');
    });
  });
});
