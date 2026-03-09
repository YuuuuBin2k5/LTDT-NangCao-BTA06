/**
 * Tests for useFeedPosts hook
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useFeedPosts } from '../useFeedPosts';
import { postService, PaginatedResponse } from '../../services/post.service';
import type { Post } from '../../types/post.types';

// Mock the post service
jest.mock('../../services/post.service', () => ({
  postService: {
    getFeedPosts: jest.fn(),
  },
}));

describe('useFeedPosts', () => {
  const mockPosts: Post[] = [
    {
      id: 1,
      user: {
        id: 'user-1',
        username: 'testuser1',
        nickName: 'Test User 1',
        avatarUrl: 'https://example.com/avatar1.jpg',
      },
      content: 'Test post 1',
      latitude: 10.762622,
      longitude: 106.660172,
      locationName: 'Test Location 1',
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
    {
      id: 2,
      user: {
        id: 'user-2',
        username: 'testuser2',
        nickName: 'Test User 2',
        avatarUrl: 'https://example.com/avatar2.jpg',
      },
      content: 'Test post 2',
      latitude: 10.8,
      longitude: 106.7,
      locationName: 'Test Location 2',
      privacy: 'PUBLIC' as any,
      images: [],
      likeCount: 3,
      commentCount: 1,
      isLiked: true,
      viewCount: 8,
      hashtags: ['test2'],
      createdAt: '2026-03-07T11:00:00Z',
      updatedAt: '2026-03-07T11:00:00Z',
    },
  ];

  const mockResponse: PaginatedResponse<Post> = {
    content: mockPosts,
    totalElements: 20,
    totalPages: 2,
    currentPage: 0,
    pageSize: 20,
    last: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (postService.getFeedPosts as jest.Mock).mockResolvedValue(mockResponse);
  });

  test('should load feed posts on mount', async () => {
    const { result } = renderHook(() => useFeedPosts());

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.posts).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);

    // Wait for posts to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify posts loaded
    expect(result.current.posts).toEqual(mockPosts);
    expect(result.current.error).toBeNull();
    expect(result.current.hasMore).toBe(true);
    expect(postService.getFeedPosts).toHaveBeenCalledWith(0, 20);
  });

  test('should handle errors gracefully', async () => {
    const mockError = new Error('Network error');
    (postService.getFeedPosts as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useFeedPosts());

    // Wait for error to be set
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify error state
    expect(result.current.error).toEqual(mockError);
    expect(result.current.posts).toEqual([]);
  });

  test('should refresh posts when refresh is called', async () => {
    const { result } = renderHook(() => useFeedPosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(postService.getFeedPosts).toHaveBeenCalledTimes(1);

    // Call refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Verify refresh called API again with page 0
    expect(postService.getFeedPosts).toHaveBeenCalledTimes(2);
    expect(postService.getFeedPosts).toHaveBeenLastCalledWith(0, 20);
  });

  test('should load more posts when loadMore is called', async () => {
    const page1Response: PaginatedResponse<Post> = {
      content: mockPosts.slice(0, 1),
      totalElements: 20,
      totalPages: 2,
      currentPage: 0,
      pageSize: 20,
      last: false,
    };

    const page2Response: PaginatedResponse<Post> = {
      content: mockPosts.slice(1, 2),
      totalElements: 20,
      totalPages: 2,
      currentPage: 1,
      pageSize: 20,
      last: true,
    };

    (postService.getFeedPosts as jest.Mock)
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response);

    const { result } = renderHook(() => useFeedPosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toHaveLength(1);
    expect(result.current.hasMore).toBe(true);

    // Load more
    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.isLoadingMore).toBe(false);
    });

    // Verify posts were appended
    expect(result.current.posts).toHaveLength(2);
    expect(result.current.hasMore).toBe(false);
    expect(postService.getFeedPosts).toHaveBeenCalledTimes(2);
    expect(postService.getFeedPosts).toHaveBeenLastCalledWith(1, 20);
  });

  test('should not load more when already loading', async () => {
    const { result } = renderHook(() => useFeedPosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    jest.clearAllMocks();

    // Start loading more
    act(() => {
      result.current.loadMore();
    });

    // Try to load more again while still loading
    act(() => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.isLoadingMore).toBe(false);
    });

    // Should only call API once
    expect(postService.getFeedPosts).toHaveBeenCalledTimes(1);
  });

  test('should not load more when hasMore is false', async () => {
    const lastPageResponse: PaginatedResponse<Post> = {
      content: mockPosts,
      totalElements: 2,
      totalPages: 1,
      currentPage: 0,
      pageSize: 20,
      last: true,
    };

    (postService.getFeedPosts as jest.Mock).mockResolvedValue(lastPageResponse);

    const { result } = renderHook(() => useFeedPosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);

    jest.clearAllMocks();

    // Try to load more
    act(() => {
      result.current.loadMore();
    });

    // Wait a bit
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should not call API
    expect(postService.getFeedPosts).not.toHaveBeenCalled();
  });

  test('should set loading states correctly', async () => {
    const { result } = renderHook(() => useFeedPosts());

    // Initial loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isLoadingMore).toBe(false);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Load more
    act(() => {
      result.current.loadMore();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isLoadingMore).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingMore).toBe(false);
    });
  });

  test('should reset to page 0 when refresh is called', async () => {
    const page1Response: PaginatedResponse<Post> = {
      content: mockPosts.slice(0, 1),
      totalElements: 20,
      totalPages: 2,
      currentPage: 0,
      pageSize: 20,
      last: false,
    };

    const page2Response: PaginatedResponse<Post> = {
      content: mockPosts.slice(1, 2),
      totalElements: 20,
      totalPages: 2,
      currentPage: 1,
      pageSize: 20,
      last: false,
    };

    (postService.getFeedPosts as jest.Mock)
      .mockResolvedValueOnce(page1Response)
      .mockResolvedValueOnce(page2Response)
      .mockResolvedValueOnce(page1Response);

    const { result } = renderHook(() => useFeedPosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Load page 2
    await act(async () => {
      result.current.loadMore();
    });

    await waitFor(() => {
      expect(result.current.isLoadingMore).toBe(false);
    });

    expect(result.current.posts).toHaveLength(2);

    // Refresh should reset to page 0
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.posts).toHaveLength(1);
    expect(postService.getFeedPosts).toHaveBeenLastCalledWith(0, 20);
  });

  test('should replace posts on refresh, not append', async () => {
    const initialResponse: PaginatedResponse<Post> = {
      content: [mockPosts[0]],
      totalElements: 20,
      totalPages: 2,
      currentPage: 0,
      pageSize: 20,
      last: false,
    };

    const refreshResponse: PaginatedResponse<Post> = {
      content: [mockPosts[1]],
      totalElements: 20,
      totalPages: 2,
      currentPage: 0,
      pageSize: 20,
      last: false,
    };

    (postService.getFeedPosts as jest.Mock)
      .mockResolvedValueOnce(initialResponse)
      .mockResolvedValueOnce(refreshResponse);

    const { result } = renderHook(() => useFeedPosts());

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toEqual([mockPosts[0]]);

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    // Posts should be replaced, not appended
    expect(result.current.posts).toEqual([mockPosts[1]]);
    expect(result.current.posts).toHaveLength(1);
  });

  test('should handle empty feed', async () => {
    const emptyResponse: PaginatedResponse<Post> = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20,
      last: true,
    };

    (postService.getFeedPosts as jest.Mock).mockResolvedValue(emptyResponse);

    const { result } = renderHook(() => useFeedPosts());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.posts).toEqual([]);
    expect(result.current.hasMore).toBe(false);
  });
});
