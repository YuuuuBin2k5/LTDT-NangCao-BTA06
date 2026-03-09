/**
 * Tests for useNearbyPosts hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useNearbyPosts } from '../useNearbyPosts';
import { postService } from '../../services/post.service';
import type { Post } from '../../types/post.types';

// Mock the post service
jest.mock('../../services/post.service', () => ({
  postService: {
    getNearbyPosts: jest.fn(),
  },
}));

describe('useNearbyPosts', () => {
  const mockPosts: Post[] = [
    {
      id: 1,
      user: {
        id: 'user-1',
        username: 'testuser',
        nickName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      },
      content: 'Test post',
      latitude: 10.762622,
      longitude: 106.660172,
      locationName: 'Test Location',
      privacy: 'PUBLIC' as any,
      images: [],
      likeCount: 5,
      commentCount: 2,
      isLiked: false,
      viewCount: 10,
      hashtags: ['test'],
      createdAt: '2026-03-07T10:00:00Z',
      updatedAt: '2026-03-07T10:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (postService.getNearbyPosts as jest.Mock).mockResolvedValue(mockPosts);
  });

  test('should load nearby posts on mount', async () => {
    const { result } = renderHook(() =>
      useNearbyPosts({
        latitude: 10.762622,
        longitude: 106.660172,
        radius: 5.0,
      })
    );

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();

    // Wait for posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify posts loaded
    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.error).toBeNull();
    expect(postService.getNearbyPosts).toHaveBeenCalledWith(10.762622, 106.660172, 5.0);
  });

  test('should not load posts when enabled is false', async () => {
    const { result } = renderHook(() =>
      useNearbyPosts({
        latitude: 10.762622,
        longitude: 106.660172,
        radius: 5.0,
        enabled: false,
      })
    );

    // Wait a bit to ensure no loading happens
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Verify no API call was made
    expect(postService.getNearbyPosts).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.posts).toEqual([]);
  });

  test('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    (postService.getNearbyPosts as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() =>
      useNearbyPosts({
        latitude: 10.762622,
        longitude: 106.660172,
        radius: 5.0,
      })
    );

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toEqual(mockError);
    expect(result.current.posts).toEqual([]);
  });

  test('should reload posts when location changes', async () => {
    const { result, rerender } = renderHook(
      ({ latitude, longitude }) =>
        useNearbyPosts({
          latitude,
          longitude,
          radius: 5.0,
        }),
      {
        initialProps: { latitude: 10.762622, longitude: 106.660172 },
      }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(postService.getNearbyPosts).toHaveBeenCalledTimes(1);

    // Change location
    rerender({ latitude: 10.8, longitude: 106.7 });

    // Wait for reload
    await waitFor(() => {
      expect(postService.getNearbyPosts).toHaveBeenCalledTimes(2);
    });

    expect(postService.getNearbyPosts).toHaveBeenLastCalledWith(10.8, 106.7, 5.0);
  });

  test('should reload posts when radius changes', async () => {
    const { result, rerender } = renderHook(
      ({ radius }) =>
        useNearbyPosts({
          latitude: 10.762622,
          longitude: 106.660172,
          radius,
        }),
      {
        initialProps: { radius: 5.0 },
      }
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(postService.getNearbyPosts).toHaveBeenCalledTimes(1);

    // Change radius
    rerender({ radius: 10.0 });

    // Wait for reload
    await waitFor(() => {
      expect(postService.getNearbyPosts).toHaveBeenCalledTimes(2);
    });

    expect(postService.getNearbyPosts).toHaveBeenLastCalledWith(10.762622, 106.660172, 10.0);
  });

  test('should refresh posts when refresh is called', async () => {
    const { result } = renderHook(() =>
      useNearbyPosts({
        latitude: 10.762622,
        longitude: 106.660172,
        radius: 5.0,
      })
    );

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(postService.getNearbyPosts).toHaveBeenCalledTimes(1);

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Verify refresh called API again
    expect(postService.getNearbyPosts).toHaveBeenCalledTimes(2);
  });

  test('should use default radius of 5.0 when not provided', async () => {
    const { result } = renderHook(() =>
      useNearbyPosts({
        latitude: 10.762622,
        longitude: 106.660172,
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(postService.getNearbyPosts).toHaveBeenCalledWith(10.762622, 106.660172, 5.0);
  });
});
