/**
 * Tests for useFilterPresets hook
 */
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFilterPresets } from '../useFilterPresets';
import type { FilterPreset, FilterConfig } from '../../types/filter.types';

// Mock preset service
jest.mock('../../services/preset.service', () => ({
  presetService: {
    getPresets: jest.fn(),
    getPreset: jest.fn(),
    createPreset: jest.fn(),
    deletePreset: jest.fn(),
    sharePreset: jest.fn(),
    applySharedPreset: jest.fn(),
    setDefaultPreset: jest.fn(),
    incrementUsageCount: jest.fn(),
  },
}));

import { presetService } from '../../services/preset.service';

const mockPresetService = presetService as jest.Mocked<typeof presetService>;

describe('useFilterPresets', () => {
  const mockPresets: FilterPreset[] = [
    {
      id: 1,
      name: 'Bạn bè gần đây',
      description: 'Bài viết từ bạn bè trong khu vực',
      filters: [
        { id: 'f1', type: 'SOCIAL', value: 'friends', label: 'Bạn bè' },
        { id: 'f2', type: 'LOCATION', value: 'nearby', label: 'Gần đây', params: { radius: 5 } },
      ],
      isDefault: true,
      isPublic: false,
      usageCount: 10,
      createdAt: '2026-03-01T00:00:00Z',
      updatedAt: '2026-03-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Ảnh xu hướng',
      description: 'Ảnh đang hot',
      filters: [
        { id: 'f3', type: 'CONTENT', value: 'photos_only', label: 'Chỉ ảnh' },
        { id: 'f4', type: 'ENGAGEMENT', value: 'trending', label: 'Xu hướng' },
      ],
      isDefault: false,
      isPublic: false,
      usageCount: 5,
      createdAt: '2026-03-02T00:00:00Z',
      updatedAt: '2026-03-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockPresetService.getPresets.mockResolvedValue(mockPresets);
  });

  describe('loadPresets', () => {
    it('should load presets on mount', async () => {
      const { result } = renderHook(() => useFilterPresets());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.presets).toEqual(mockPresets);
      expect(mockPresetService.getPresets).toHaveBeenCalledTimes(1);
    });

    it('should handle load error', async () => {
      const error = new Error('Failed to load');
      mockPresetService.getPresets.mockRejectedValue(error);

      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
      expect(result.current.presets).toEqual([]);
    });

    it('should reload presets when loadPresets is called', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPresets = [...mockPresets, {
        id: 3,
        name: 'New Preset',
        filters: [],
        isDefault: false,
        isPublic: false,
        usageCount: 0,
        createdAt: '2026-03-03T00:00:00Z',
        updatedAt: '2026-03-03T00:00:00Z',
      }];
      mockPresetService.getPresets.mockResolvedValue(newPresets);

      await act(async () => {
        await result.current.loadPresets();
      });

      expect(result.current.presets).toEqual(newPresets);
      expect(mockPresetService.getPresets).toHaveBeenCalledTimes(2);
    });
  });

  describe('savePreset', () => {
    it('should save a new preset', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newPreset: FilterPreset = {
        id: 3,
        name: 'Test Preset',
        description: 'Test description',
        filters: [{ id: 'f5', type: 'SOCIAL', value: 'friends', label: 'Bạn bè' }],
        isDefault: false,
        isPublic: false,
        usageCount: 0,
        createdAt: '2026-03-03T00:00:00Z',
        updatedAt: '2026-03-03T00:00:00Z',
      };

      mockPresetService.createPreset.mockResolvedValue(newPreset);

      let savedPreset: FilterPreset | undefined;
      await act(async () => {
        savedPreset = await result.current.savePreset(
          'Test Preset',
          'Test description',
          newPreset.filters
        );
      });

      expect(savedPreset).toEqual(newPreset);
      expect(result.current.presets).toContainEqual(newPreset);
      expect(mockPresetService.createPreset).toHaveBeenCalledWith({
        name: 'Test Preset',
        description: 'Test description',
        filters: newPreset.filters,
        isPublic: false,
      });
    });

    it('should handle save error', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const error = new Error('Failed to save');
      mockPresetService.createPreset.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.savePreset('Test', undefined, []);
        })
      ).rejects.toThrow('Failed to save');
    });
  });

  describe('deletePreset', () => {
    it('should delete a preset', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockPresetService.deletePreset.mockResolvedValue();

      await act(async () => {
        await result.current.deletePreset(1);
      });

      expect(result.current.presets).not.toContainEqual(mockPresets[0]);
      expect(result.current.presets).toHaveLength(1);
      expect(mockPresetService.deletePreset).toHaveBeenCalledWith(1);
    });

    it('should handle delete error', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const error = new Error('Failed to delete');
      mockPresetService.deletePreset.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.deletePreset(1);
        })
      ).rejects.toThrow('Failed to delete');
    });
  });

  describe('applyPreset', () => {
    it('should return filters from preset', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockPresetService.incrementUsageCount.mockResolvedValue();

      let filters: FilterConfig[] = [];
      act(() => {
        filters = result.current.applyPreset(1);
      });

      expect(filters).toEqual(mockPresets[0].filters);
      
      // Wait for background increment
      await waitFor(() => {
        expect(mockPresetService.incrementUsageCount).toHaveBeenCalledWith(1);
      });
    });

    it('should throw error if preset not found', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(() => {
        result.current.applyPreset(999);
      }).toThrow('Preset not found');
    });
  });

  describe('sharePreset', () => {
    it('should generate share token', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const shareToken = 'abc123def456';
      mockPresetService.sharePreset.mockResolvedValue(shareToken);

      let token: string = '';
      await act(async () => {
        token = await result.current.sharePreset(1);
      });

      expect(token).toBe(shareToken);
      expect(mockPresetService.sharePreset).toHaveBeenCalledWith(1);

      // Check that preset was updated locally
      const updatedPreset = result.current.presets.find(p => p.id === 1);
      expect(updatedPreset?.shareToken).toBe(shareToken);
      expect(updatedPreset?.isPublic).toBe(true);
    });

    it('should handle share error', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const error = new Error('Failed to share');
      mockPresetService.sharePreset.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.sharePreset(1);
        })
      ).rejects.toThrow('Failed to share');
    });
  });

  describe('applySharedPreset', () => {
    it('should apply shared preset', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const sharedPreset: FilterPreset = {
        id: 4,
        name: 'Shared Preset (Shared)',
        filters: [{ id: 'f6', type: 'SOCIAL', value: 'friends', label: 'Bạn bè' }],
        isDefault: false,
        isPublic: false,
        usageCount: 0,
        createdAt: '2026-03-04T00:00:00Z',
        updatedAt: '2026-03-04T00:00:00Z',
      };

      mockPresetService.applySharedPreset.mockResolvedValue(sharedPreset);

      let preset: FilterPreset | undefined;
      await act(async () => {
        preset = await result.current.applySharedPreset('abc123');
      });

      expect(preset).toEqual(sharedPreset);
      expect(result.current.presets).toContainEqual(sharedPreset);
      expect(mockPresetService.applySharedPreset).toHaveBeenCalledWith('abc123');
    });

    it('should handle apply shared preset error', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const error = new Error('Invalid token');
      mockPresetService.applySharedPreset.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.applySharedPreset('invalid');
        })
      ).rejects.toThrow('Invalid token');
    });
  });

  describe('setDefaultPreset', () => {
    it('should set preset as default', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      mockPresetService.setDefaultPreset.mockResolvedValue();

      await act(async () => {
        await result.current.setDefaultPreset(2);
      });

      expect(mockPresetService.setDefaultPreset).toHaveBeenCalledWith(2);

      // Check that presets were updated locally
      const preset1 = result.current.presets.find(p => p.id === 1);
      const preset2 = result.current.presets.find(p => p.id === 2);
      
      expect(preset1?.isDefault).toBe(false);
      expect(preset2?.isDefault).toBe(true);
    });

    it('should handle set default error', async () => {
      const { result } = renderHook(() => useFilterPresets());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const error = new Error('Failed to set default');
      mockPresetService.setDefaultPreset.mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.setDefaultPreset(2);
        })
      ).rejects.toThrow('Failed to set default');
    });
  });
});
